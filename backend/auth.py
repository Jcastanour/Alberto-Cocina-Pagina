"""Autenticación simple para el panel de administración.

Un solo administrador. La contraseña vive en la variable de entorno
ADMIN_PASSWORD. Al hacer login se entrega un token con vencimiento
("<exp>.<firma>") firmado con HMAC-SHA256; las rutas de escritura lo validan.
La clave de firma se deriva de SECRET_KEY y de ADMIN_PASSWORD, así que cambiar
cualquiera de las dos invalida todos los tokens emitidos. Es stateless (no hay
base de datos de sesiones) y suficiente para un único admin.
"""
import hashlib
import hmac
import os
import time

from fastapi import Header, HTTPException

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-cambiar-en-produccion")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin")


TOKEN_TTL_SECONDS = 12 * 60 * 60  # el admin vuelve a entrar cada 12 horas


def _signing_key() -> bytes:
    """Clave de firma derivada de SECRET_KEY + ADMIN_PASSWORD (se calcula en cada
    uso: si cambia la contraseña, los tokens viejos dejan de valer)."""
    return hmac.new(
        SECRET_KEY.encode("utf-8"),
        b"aycobras-admin-token-v2\x00" + ADMIN_PASSWORD.encode("utf-8"),
        hashlib.sha256,
    ).digest()


def _sign(exp: str) -> str:
    return hmac.new(_signing_key(), exp.encode("ascii"), hashlib.sha256).hexdigest()


def make_token(now: float = None) -> str:
    """Token "<exp>.<firma>": exp = vencimiento en segundos Unix."""
    exp = str(int(time.time() if now is None else now) + TOKEN_TTL_SECONDS)
    return f"{exp}.{_sign(exp)}"


def _same(a: str, b: str) -> bool:
    """Comparación en tiempo constante sobre bytes UTF-8 (con str, compare_digest
    lanza TypeError si hay caracteres no ASCII)."""
    return hmac.compare_digest((a or "").encode("utf-8"), (b or "").encode("utf-8"))


def check_password(password: str) -> bool:
    return _same(password, ADMIN_PASSWORD)


def verify_token(token: str, now: float = None) -> bool:
    """True solo si la firma es válida y el token no ha vencido. Cualquier token
    mal formado (incluido el formato anterior, sin vencimiento) da False."""
    if not isinstance(token, str) or len(token) > 128:
        return False
    exp, sep, firma = token.partition(".")
    if not sep or not exp.isascii() or not exp.isdigit() or len(exp) > 12:
        return False
    if not _same(firma, _sign(exp)):
        return False
    return int(exp) > (time.time() if now is None else now)


def require_admin(authorization: str = Header(default=None)) -> None:
    """Dependencia FastAPI: exige header 'Authorization: Bearer <token>'."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autorizado")
    token = authorization.split(" ", 1)[1]
    if not verify_token(token):
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
