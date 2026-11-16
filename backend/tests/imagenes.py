"""Imágenes mínimas (cabeceras reales) y ayudas para las pruebas de subida."""
import auth

PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64
JPEG = b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 64
GIF = b"GIF89a" + b"\x00" * 64
WEBP = b"RIFF\x24\x00\x00\x00WEBPVP8 " + b"\x00" * 64

CAMPOS = {"nombre": "Cocina", "categoria": "cocinas", "ano": "2026", "descripcionCorta": "Prueba"}


def cabeceras():
    return {"Authorization": f"Bearer {auth.make_token()}"}


def archivos(*items):
    """items: (nombre, bytes, content_type)"""
    return [("imagenes", item) for item in items]


def crear(client, files=None, orden=None, **extra):
    data = {**CAMPOS, **extra}
    if orden is not None:
        data["orden"] = orden
    return client.post("/api/proyectos", headers=cabeceras(), data=data, files=files or None)
