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

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import storage
from auth import check_password, make_token, require_admin

app = FastAPI(title="AYC Obras y Diseños — API")

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

# Límites de subida
MAX_IMAGE_BYTES = int(os.environ.get("MAX_IMAGE_MB", "10")) * 1024 * 1024
MAX_GALLERY = int(os.environ.get("MAX_GALLERY", "12"))
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"}


# --- Helpers -------------------------------------------------------------------
def _split_csv(value: str) -> list:
    return [x.strip() for x in (value or "").split(",") if x.strip()]


async def _store_upload(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"Tipo de imagen no permitido: {file.content_type}")
    data = await file.read()
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(400, f"La imagen supera el límite de {MAX_IMAGE_BYTES // (1024*1024)} MB")
    if not data:
        raise HTTPException(400, "Archivo de imagen vacío")
    return storage.save_image(data, file.filename, file.content_type)


async def _build_image_list(orden: str, imagenes: list, existentes: set) -> list:
    """Construye la lista ordenada final de URLs a partir de `orden` (JSON) y los
    archivos nuevos `imagenes`. `existentes` son las URLs válidas del proyecto
    (para no aceptar URLs ajenas en edición). Si `orden` no llega, se asume que
    todos los archivos son nuevos en su orden de subida."""
    nuevos = [f for f in imagenes if f and f.filename]

    try:
        items = json.loads(orden) if orden else None
    except json.JSONDecodeError:
        items = None

    if not items:
        # Sin orden explícito: todos los archivos nuevos en orden de subida.
        final = [await _store_upload(f) for f in nuevos]
    else:
        final = []
        idx_nuevo = 0
        for it in items:
            if it.get("type") == "existing":
                url = it.get("url")
                if url in existentes:
                    final.append(url)
            else:  # "new"
                if idx_nuevo < len(nuevos):
                    final.append(await _store_upload(nuevos[idx_nuevo]))
                    idx_nuevo += 1
        # Archivos nuevos que no quedaron mapeados en `orden` → al final.
        while idx_nuevo < len(nuevos):
            final.append(await _store_upload(nuevos[idx_nuevo]))
            idx_nuevo += 1

    if not final:
        raise HTTPException(400, "Sube al menos una imagen")
    if len(final) > MAX_GALLERY + 1:
        raise HTTPException(400, f"Máximo {MAX_GALLERY + 1} imágenes por proyecto")
    return final


# --- Salud y autenticación -----------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok", "storage": "r2" if storage.USE_R2 else "local"}


@app.post("/api/login")
async def login(payload: dict):
    if not check_password(payload.get("password", "")):
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
