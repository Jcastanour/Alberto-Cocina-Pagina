"""Capa de almacenamiento: proyectos (projects.json) e imágenes.

Dos modos, elegidos por variables de entorno:

  * R2 (producción): si están definidas R2_ACCOUNT_ID, R2_BUCKET y
    R2_ACCESS_KEY_ID, se usa Cloudflare R2 (S3-compatible) vía boto3.
    Las imágenes y el projects.json viven como objetos en el bucket.
    Los contenedores quedan sin estado: nada se pierde al re-desplegar.

  * Local (desarrollo): si no hay credenciales de R2, todo se guarda en
    DATA_DIR (por defecto ./data): projects.json en disco (escritura
    atómica) y las imágenes en ./data/uploads servidas por FastAPI.

Así el proyecto corre en local sin configurar nada, y en producción
solo hace falta poner las variables de R2.
"""
import json
import os
import threading
import time
import uuid

# --- Configuración por entorno -------------------------------------------------
R2_ACCOUNT_ID = os.environ.get("R2_ACCOUNT_ID")
R2_BUCKET = os.environ.get("R2_BUCKET")
R2_ACCESS_KEY_ID = os.environ.get("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.environ.get("R2_SECRET_ACCESS_KEY")
R2_PUBLIC_URL = os.environ.get("R2_PUBLIC_URL", "").rstrip("/")

USE_R2 = bool(R2_ACCOUNT_ID and R2_BUCKET and R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY)

DATA_DIR = os.environ.get("DATA_DIR", os.path.join(os.path.dirname(__file__), "data"))
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")
PROJECTS_FILE = os.path.join(DATA_DIR, "projects.json")
PROJECTS_KEY = "projects.json"  # nombre del objeto en R2

_lock = threading.Lock()
_s3 = None

if USE_R2:
    import boto3
    from botocore.config import Config

    _s3 = boto3.client(
        "s3",
        endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )
else:
    os.makedirs(UPLOADS_DIR, exist_ok=True)


# --- Proyectos -----------------------------------------------------------------
def load_projects() -> list:
    with _lock:
        if USE_R2:
            try:
                obj = _s3.get_object(Bucket=R2_BUCKET, Key=PROJECTS_KEY)
                return json.loads(obj["Body"].read().decode("utf-8"))
            except Exception:
                return []
        if not os.path.exists(PROJECTS_FILE):
            return []
        with open(PROJECTS_FILE, encoding="utf-8") as f:
            return json.load(f)


def save_projects(projects: list) -> None:
    data = json.dumps(projects, ensure_ascii=False, indent=2)
    with _lock:
        if USE_R2:
            _s3.put_object(
                Bucket=R2_BUCKET,
                Key=PROJECTS_KEY,
                Body=data.encode("utf-8"),
                ContentType="application/json",
            )
        else:
            os.makedirs(DATA_DIR, exist_ok=True)
            tmp = PROJECTS_FILE + ".tmp"
            with open(tmp, "w", encoding="utf-8") as f:
                f.write(data)
            os.replace(tmp, PROJECTS_FILE)  # atómico


# --- Imágenes ------------------------------------------------------------------
def save_image(file_bytes: bytes, filename: str, content_type: str) -> str:
    """Guarda una imagen y devuelve su URL pública (absoluta en R2,
    relativa /api/uploads/... en local)."""
    ext = os.path.splitext(filename or "")[1].lower() or ".jpg"
    key = f"{time.strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}{ext}"
    if USE_R2:
        _s3.put_object(
            Bucket=R2_BUCKET,
            Key=key,
            Body=file_bytes,
            ContentType=content_type or "image/jpeg",
        )
        return f"{R2_PUBLIC_URL}/{key}"
    with open(os.path.join(UPLOADS_DIR, key), "wb") as f:
        f.write(file_bytes)
    return f"/api/uploads/{key}"


def delete_image(url: str) -> None:
    """Borra el objeto/archivo asociado a una URL guardada. Tolerante a fallos."""
    if not url:
        return
    key = url.rstrip("/").split("/")[-1]
    try:
        if USE_R2:
            _s3.delete_object(Bucket=R2_BUCKET, Key=key)
        else:
            path = os.path.join(UPLOADS_DIR, key)
            if os.path.exists(path):
                os.remove(path)
    except Exception:
        pass
