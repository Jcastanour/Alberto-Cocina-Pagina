"""Autenticación simple para el panel de administración.

Un solo administrador. La contraseña vive en la variable de entorno
ADMIN_PASSWORD. Al hacer login se entrega un token derivado por HMAC del
SECRET_KEY; las rutas de escritura validan ese token. Es stateless (no hay
base de datos de sesiones) y suficiente para un único admin.
"""
import hashlib
import hmac
import os

from fastapi import Header, HTTPException

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-cambiar-en-produccion")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin")


def make_token() -> str:
    """Token determinístico ligado al SECRET_KEY del servidor."""
    return hmac.new(SECRET_KEY.encode(), b"aycobras-admin", hashlib.sha256).hexdigest()


def check_password(password: str) -> bool:
    return hmac.compare_digest(password or "", ADMIN_PASSWORD)


def verify_token(token: str) -> bool:
    return bool(token) and hmac.compare_digest(token, make_token())


def require_admin(authorization: str = Header(default=None)) -> None:
    """Dependencia FastAPI: exige header 'Authorization: Bearer <token>'."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autorizado")
    token = authorization.split(" ", 1)[1]
    if not verify_token(token):
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
