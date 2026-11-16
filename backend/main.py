"""API del portafolio AYC Obras y Diseños (FastAPI).

Los proyectos se guardan en un datastore persistente (Cloudflare R2 en
producción, disco local en desarrollo) — ver storage.py. El frontend los
pide en runtime, así que subir/editar/borrar un proyecto se refleja al
instante sin recompilar ni re-desplegar.
"""
import json
import os
import time
import uuid

from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

import storage
from auth import check_password, make_token, require_admin, require_production_secrets
from ratelimit import SlidingWindowLimiter, client_ip

# Con R2 (producción) no se arranca con SECRET_KEY / ADMIN_PASSWORD por defecto.
require_production_secrets(storage.USE_R2)

app = FastAPI(title="AYC Obras y Diseños — API")

# Límites de subida
MAX_IMAGE_BYTES = int(os.environ.get("MAX_IMAGE_MB", "10")) * 1024 * 1024
MAX_GALLERY = int(os.environ.get("MAX_GALLERY", "12"))
MAX_ORDEN_ITEMS = 200  # tope de entradas en `orden` (muy por encima de lo real)
READ_CHUNK = 1024 * 1024

# Tope del cuerpo completo de una petición (todas las imágenes + campos).
MAX_BODY_BYTES = (MAX_GALLERY + 1) * MAX_IMAGE_BYTES + 1024 * 1024


@app.middleware("http")
async def limitar_cuerpo(request: Request, call_next):
    """Rechaza por Content-Length las peticiones gigantes antes de leerlas.
    (Un cuerpo sin Content-Length debe cortarlo el proxy: `request_body max_size` en Caddy.)"""
    declarado = request.headers.get("content-length", "")
    if declarado.isdigit() and int(declarado) > MAX_BODY_BYTES:
        return JSONResponse({"detail": "La petición es demasiado grande"}, status_code=413)
    return await call_next(request)


# CORS: orígenes permitidos del frontend (coma-separados en la env var).
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# En modo local, servir las imágenes guardadas en disco.
if not storage.USE_R2:
    app.mount("/api/uploads", StaticFiles(directory=storage.UPLOADS_DIR), name="uploads")


# --- Helpers -------------------------------------------------------------------
def _split_csv(value: str) -> list:
    return [x.strip() for x in (value or "").split(",") if x.strip()]


def sniff_image(head: bytes):
    """Tipo real de la imagen según sus primeros bytes (magic bytes), o None.
    Devuelve (extensión, content_type)."""
    if head.startswith(b"\xff\xd8\xff"):
        return "jpg", "image/jpeg"
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png", "image/png"
    if head.startswith((b"GIF87a", b"GIF89a")):
        return "gif", "image/gif"
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return "webp", "image/webp"
    return None


async def _check_image(file: UploadFile):
    """Valida una imagen subida SIN guardarla y devuelve (extensión, content_type).

    Lista blanca de extensiones, tope de tamaño leyendo por trozos (se corta al
    pasar el límite, no se carga el archivo entero) y contenido real de imagen.
    La extensión y el content-type que se guardan salen del contenido, no de lo
    que diga el cliente."""
    ext = os.path.splitext(file.filename or "")[1].lower().lstrip(".")
    if ext not in storage.ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(400, "Formato de imagen no permitido. Usa JPG, PNG, WEBP o GIF.")

    limite_mb = MAX_IMAGE_BYTES // (1024 * 1024)
    if file.size is not None and file.size > MAX_IMAGE_BYTES:
        raise HTTPException(400, f"La imagen supera el límite de {limite_mb} MB")
    await file.seek(0)
    cabecera, total = b"", 0
    while True:
        trozo = await file.read(READ_CHUNK)
        if not trozo:
            break
        if total == 0:
            cabecera = trozo[:16]
        total += len(trozo)
        if total > MAX_IMAGE_BYTES:
            raise HTTPException(400, f"La imagen supera el límite de {limite_mb} MB")
    if total == 0:
        raise HTTPException(400, "Archivo de imagen vacío")

    tipo = sniff_image(cabecera)
    if tipo is None:
        raise HTTPException(400, "El archivo no es una imagen válida (JPG, PNG, WEBP o GIF).")
    return tipo


def _parse_orden(orden: str):
    """`orden` es un JSON con una lista de objetos {"type": "existing"|"new", ...}.
    Vacío → None (sin orden explícito). Cualquier otra forma → 400."""
    if not orden or not orden.strip():
        return None
    try:
        items = json.loads(orden)
    except (ValueError, RecursionError):
        raise HTTPException(400, "El orden de las imágenes no es válido")
    if not isinstance(items, list) or len(items) > MAX_ORDEN_ITEMS:
        raise HTTPException(400, "El orden de las imágenes no es válido")
    for it in items:
        if not isinstance(it, dict):
            raise HTTPException(400, "El orden de las imágenes no es válido")
        url = it.get("url")
        if it.get("type") == "existing" and not isinstance(url, str):
            raise HTTPException(400, "El orden de las imágenes no es válido")
    return items


async def _build_image_list(orden: str, imagenes: list, existentes: set) -> list:
    """Construye la lista ordenada final de URLs a partir de `orden` (JSON) y los
    archivos nuevos `imagenes`. `existentes` son las URLs válidas del proyecto
    (para no aceptar URLs ajenas en edición). Si `orden` no llega, se asume que
    todos los archivos son nuevos en su orden de subida.

    Se valida TODO (cantidad y cada archivo) antes de guardar la primera imagen,
    para no dejar objetos huérfanos en el almacenamiento si algo se rechaza."""
    nuevos = [f for f in imagenes if f and f.filename]
    items = _parse_orden(orden)

    # 1) Plan sin tocar el almacenamiento: ("existing", url) | ("new", archivo).
    plan = []
    if not items:
        plan = [("new", f) for f in nuevos]
    else:
        idx_nuevo = 0
        for it in items:
            if it.get("type") == "existing":
                if it.get("url") in existentes:
                    plan.append(("existing", it["url"]))
            elif idx_nuevo < len(nuevos):  # "new"
                plan.append(("new", nuevos[idx_nuevo]))
                idx_nuevo += 1
        # Archivos nuevos que no quedaron mapeados en `orden` → al final.
        plan.extend(("new", f) for f in nuevos[idx_nuevo:])

    # 2) Cantidad.
    if not plan:
        raise HTTPException(400, "Sube al menos una imagen")
    if len(plan) > MAX_GALLERY + 1:
        raise HTTPException(400, f"Máximo {MAX_GALLERY + 1} imágenes por proyecto")

    # 3) Cada archivo nuevo (extensión, tamaño y contenido), todavía sin guardar.
    tipos = [(await _check_image(valor)) if tipo == "new" else None for tipo, valor in plan]

    # 4) Recién ahora se guarda, de a una imagen en memoria. Si el almacenamiento
    #    falla a mitad, se borra lo que ya se había guardado.
    final, guardadas = [], []
    try:
        for (tipo, valor), detectado in zip(plan, tipos):
            if tipo == "existing":
                final.append(valor)
                continue
            ext, content_type = detectado
            await valor.seek(0)
            data = await valor.read(MAX_IMAGE_BYTES)
            url = storage.save_image(data, f"imagen.{ext}", content_type)
            guardadas.append(url)
            final.append(url)
    except Exception:
        for url in guardadas:
            storage.delete_image(url)
        raise
    return final


# --- Salud y autenticación -----------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok", "storage": "r2" if storage.USE_R2 else "local"}


class LoginBody(BaseModel):
    password: str = Field(max_length=256)


# Freno a fuerza bruta: intentos de login por IP y minuto (en memoria).
login_limiter = SlidingWindowLimiter(limit=5, window=60)


@app.post("/api/login")
async def login(body: LoginBody, request: Request):
    if not login_limiter.hit(client_ip(request)):
        raise HTTPException(
            429,
            "Demasiados intentos. Espera un minuto e intenta de nuevo.",
            headers={"Retry-After": "60"},
        )
    if not check_password(body.password):
        raise HTTPException(401, "Contraseña incorrecta")
    return {"token": make_token()}


# --- Lectura pública -----------------------------------------------------------
@app.get("/api/proyectos")
def listar_proyectos(categoria: str = None):
    proyectos = storage.load_projects()
    if categoria and categoria != "todas":
        proyectos = [p for p in proyectos if p.get("categoria") == categoria]
    return proyectos


@app.get("/api/proyectos/{proyecto_id}")
def obtener_proyecto(proyecto_id: str):
    for p in storage.load_projects():
        if p.get("id") == proyecto_id:
            return p
    raise HTTPException(404, "Proyecto no encontrado")


# --- Escritura (protegida) -----------------------------------------------------
@app.post("/api/proyectos", dependencies=[Depends(require_admin)])
async def crear_proyecto(
    nombre: str = Form(...),
    categoria: str = Form(...),
    ciudad: str = Form("Medellín"),
    ano: str = Form(...),
    tipoCliente: str = Form("Residencial"),
    descripcionCorta: str = Form(...),
    trabajosRealizados: str = Form(""),
    materialesUsados: str = Form(""),
    estado: str = Form("terminado"),
    observaciones: str = Form(""),
    orden: str = Form(""),
    imagenes: list[UploadFile] = File(default=[]),
):
    final = await _build_image_list(orden, imagenes, existentes=set())

    proyecto = {
        "id": f"proyecto-{time.strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}",
        "nombre": nombre,
        "categoria": categoria,
        "ciudad": ciudad,
        "año": ano,
        "tipoCliente": tipoCliente,
        "descripcionCorta": descripcionCorta,
        "trabajosRealizados": _split_csv(trabajosRealizados),
        "materialesUsados": _split_csv(materialesUsados),
        "estado": estado,
        "imagenPrincipal": final[0],
        "fotosGaleria": final[1:],
        "observaciones": observaciones,
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S"),
    }

    proyectos = storage.load_projects()
    proyectos.insert(0, proyecto)  # más reciente primero
    storage.save_projects(proyectos)
    return proyecto


@app.put("/api/proyectos/{proyecto_id}", dependencies=[Depends(require_admin)])
async def editar_proyecto(
    proyecto_id: str,
    nombre: str = Form(...),
    categoria: str = Form(...),
    ciudad: str = Form("Medellín"),
    ano: str = Form(...),
    tipoCliente: str = Form("Residencial"),
    descripcionCorta: str = Form(...),
    trabajosRealizados: str = Form(""),
    materialesUsados: str = Form(""),
    estado: str = Form("terminado"),
    observaciones: str = Form(""),
    orden: str = Form(""),
    imagenes: list[UploadFile] = File(default=[]),
):
    proyectos = storage.load_projects()
    proyecto = next((p for p in proyectos if p.get("id") == proyecto_id), None)
    if proyecto is None:
        raise HTTPException(404, "Proyecto no encontrado")

    previas = [proyecto.get("imagenPrincipal")] + list(proyecto.get("fotosGaleria", []))
    previas = [u for u in previas if u]
    final = await _build_image_list(orden, imagenes, existentes=set(previas))

    # Borrar de R2 las imágenes previas que ya no están en el orden final.
    for url in previas:
        if url not in final:
            storage.delete_image(url)

    proyecto.update(
        {
            "nombre": nombre,
            "categoria": categoria,
            "ciudad": ciudad,
            "año": ano,
            "tipoCliente": tipoCliente,
            "descripcionCorta": descripcionCorta,
            "trabajosRealizados": _split_csv(trabajosRealizados),
            "materialesUsados": _split_csv(materialesUsados),
            "estado": estado,
            "observaciones": observaciones,
            "imagenPrincipal": final[0],
            "fotosGaleria": final[1:],
        }
    )
    storage.save_projects(proyectos)
    return proyecto


@app.delete("/api/proyectos/{proyecto_id}", dependencies=[Depends(require_admin)])
def borrar_proyecto(proyecto_id: str):
    proyectos = storage.load_projects()
    proyecto = next((p for p in proyectos if p.get("id") == proyecto_id), None)
    if proyecto is None:
        raise HTTPException(404, "Proyecto no encontrado")
    storage.delete_image(proyecto.get("imagenPrincipal"))
    for url in proyecto.get("fotosGaleria", []):
        storage.delete_image(url)
    storage.save_projects([p for p in proyectos if p.get("id") != proyecto_id])
    return {"ok": True}
