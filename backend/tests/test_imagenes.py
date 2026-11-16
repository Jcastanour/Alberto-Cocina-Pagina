import json
import os

import pytest

import main
import storage
from imagenes import CAMPOS, GIF, JPEG, PNG, WEBP, archivos, cabeceras, crear


def _guardadas():
    return sorted(os.listdir(storage.UPLOADS_DIR))


@pytest.mark.parametrize(
    "nombre,datos,ext",
    [("foto.jpg", JPEG, ".jpg"), ("foto.JPEG", JPEG, ".jpg"), ("foto.png", PNG, ".png"),
     ("foto.webp", WEBP, ".webp"), ("foto.gif", GIF, ".gif")],
)
def test_imagenes_validas_se_aceptan(client, nombre, datos, ext):
    r = crear(client, files=archivos((nombre, datos, "application/octet-stream")))
    assert r.status_code == 200, r.text
    url = r.json()["imagenPrincipal"]
    assert url.startswith("/api/uploads/") and url.endswith(ext)
    assert client.get(url).content == datos


@pytest.mark.parametrize(
    "nombre",
    ["pagina.html", "dibujo.svg", "script.js", "foto.php", "foto.avif", "foto.heic", "sinextension",
     "foto.png.html", "foto.jpg.exe", ".png"],
)
def test_extension_fuera_de_la_lista_blanca_es_400(client, nombre):
    r = crear(client, files=archivos((nombre, PNG, "image/png")))
    assert r.status_code == 400, r.text
    assert _guardadas() == [] and storage.load_projects() == []


@pytest.mark.parametrize(
    "datos",
    [b"<html><script>alert(1)</script></html>", b"<svg xmlns='http://www.w3.org/2000/svg'/>",
     b"MZ\x90\x00binario", b"RIFF\x00\x00\x00\x00WAVEfmt ", b"\xff\xd8", b"GIF90a" + b"\x00" * 20],
)
def test_contenido_que_no_es_imagen_es_400_aunque_diga_png(client, datos):
    r = crear(client, files=archivos(("foto.png", datos, "image/png")))
    assert r.status_code == 400, r.text
    assert _guardadas() == []


def test_la_extension_guardada_sale_del_contenido_real(client):
    # Un PNG llamado .jpg se guarda como .png (lo que realmente es).
    r = crear(client, files=archivos(("foto.jpg", PNG, "image/jpeg")))
    assert r.status_code == 200 and r.json()["imagenPrincipal"].endswith(".png")


def test_archivo_vacio_es_400(client):
    assert crear(client, files=archivos(("foto.png", b"", "image/png"))).status_code == 400
    assert _guardadas() == []


def test_imagen_mas_grande_que_el_limite_es_400(client):
    grande = PNG + b"\x00" * main.MAX_IMAGE_BYTES  # MAX_IMAGE_MB=1 en pruebas
    r = crear(client, files=archivos(("foto.png", grande, "image/png")))
    assert r.status_code == 400 and "límite" in r.json()["detail"]
    assert _guardadas() == []

    justo = PNG + b"\x00" * (main.MAX_IMAGE_BYTES - len(PNG))
    assert crear(client, files=archivos(("foto.png", justo, "image/png"))).status_code == 200


def test_el_tope_se_aplica_al_leer_aunque_no_se_conozca_el_tamano(monkeypatch):
    import asyncio
    import io

    from fastapi import HTTPException, UploadFile

    leido = []

    class _Contador(io.BytesIO):
        def read(self, n=-1):
            trozo = super().read(n)
            leido.append(len(trozo))
            return trozo

    cuerpo = _Contador(PNG + b"\x00" * (main.MAX_IMAGE_BYTES * 5))
    archivo = UploadFile(cuerpo, filename="foto.png", size=None)
    with pytest.raises(HTTPException) as exc:
        asyncio.run(main._check_image(archivo))
    assert exc.value.status_code == 400
    # Cortó al pasar el límite: no leyó los 5 MB que venían después.
    assert sum(leido) <= main.MAX_IMAGE_BYTES + main.READ_CHUNK


def test_demasiadas_imagenes_no_guarda_ninguna(client, monkeypatch):
    llamadas = []
    real = storage.save_image
    monkeypatch.setattr(storage, "save_image", lambda *a, **k: llamadas.append(a) or real(*a, **k))

    cinco = archivos(*[(f"f{i}.png", PNG, "image/png") for i in range(5)])  # MAX_GALLERY=3 → máx 4
    r = crear(client, files=cinco)
    assert r.status_code == 400 and "Máximo 4" in r.json()["detail"]
    assert llamadas == [] and _guardadas() == []

    cuatro = archivos(*[(f"f{i}.png", PNG, "image/png") for i in range(4)])
    assert crear(client, files=cuatro).status_code == 200
    assert len(llamadas) == 4


def test_una_imagen_invalida_al_final_no_deja_huerfanas(client, monkeypatch):
    llamadas = []
    real = storage.save_image
    monkeypatch.setattr(storage, "save_image", lambda *a, **k: llamadas.append(a) or real(*a, **k))

    lote = archivos(("a.png", PNG, "image/png"), ("b.jpg", JPEG, "image/jpeg"),
                    ("c.png", b"esto no es una imagen", "image/png"))
    assert crear(client, files=lote).status_code == 400
    assert llamadas == [] and _guardadas() == []


def test_si_el_almacenamiento_falla_a_mitad_se_borra_lo_guardado(client, monkeypatch):
    real = storage.save_image
    cuenta = {"n": 0}

    def falla_en_la_segunda(*a, **k):
        cuenta["n"] += 1
        if cuenta["n"] == 2:
            raise RuntimeError("almacenamiento caído")
        return real(*a, **k)

    monkeypatch.setattr(storage, "save_image", falla_en_la_segunda)
    lote = archivos(("a.png", PNG, "image/png"), ("b.png", PNG, "image/png"))
    assert crear(client, files=lote).status_code == 500
    assert _guardadas() == [] and storage.load_projects() == []


def test_sin_imagenes_es_400(client):
    assert crear(client).status_code == 400


def test_editar_valida_el_total_antes_de_subir(client, monkeypatch):
    p = crear(client, files=archivos(*[(f"f{i}.png", PNG, "image/png") for i in range(3)])).json()
    antes = _guardadas()
    urls = [p["imagenPrincipal"], *p["fotosGaleria"]]
    orden = json.dumps([{"type": "existing", "url": u} for u in urls] + [{"type": "new"}] * 2)
    r = client.put(f"/api/proyectos/{p['id']}", headers=cabeceras(), data={**CAMPOS, "orden": orden},
                   files=archivos(("x.png", PNG, "image/png"), ("y.png", PNG, "image/png")))
    assert r.status_code == 400
    assert _guardadas() == antes  # ni subió las nuevas ni borró las previas


def test_storage_rechaza_extensiones_peligrosas_por_si_mismo():
    for nombre in ("x.html", "x.svg", "x", "x.php", ""):
        with pytest.raises(ValueError):
            storage.save_image(PNG, nombre, "image/png")
    assert _guardadas() == []


def test_cuerpo_gigante_declarado_es_413(client):
    r = client.post("/api/proyectos", headers={**cabeceras(), "Content-Length": str(main.MAX_BODY_BYTES + 1)},
                    content=b"x")
    assert r.status_code == 413


def test_sniff_image():
    assert main.sniff_image(JPEG) == ("jpg", "image/jpeg")
    assert main.sniff_image(PNG) == ("png", "image/png")
    assert main.sniff_image(GIF) == ("gif", "image/gif")
    assert main.sniff_image(WEBP[:16]) == ("webp", "image/webp")
    assert main.sniff_image(b"") is None and main.sniff_image(b"RIFF") is None
