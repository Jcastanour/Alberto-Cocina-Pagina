import json
import os

import pytest

import storage
from imagenes import CAMPOS, PNG, archivos, cabeceras, crear

UNA = archivos(("a.png", PNG, "image/png"))


@pytest.mark.parametrize(
    "orden",
    [
        "no es json",
        "{",
        '{"type": "new"}',
        '"texto"',
        "5",
        "true",
        "[1, 2]",
        '["new"]',
        "[null]",
        "[[]]",
        '[{"type": "existing"}]',
        '[{"type": "existing", "url": 5}]',
        '[{"type": "existing", "url": {"a": 1}}]',
        json.dumps([{"type": "new"}] * 201),
        "[" * 5000 + "]" * 5000,
    ],
)
def test_orden_mal_formado_es_400_y_no_guarda_nada(client, orden):
    r = crear(client, files=UNA, orden=orden)
    assert r.status_code == 400, r.text
    assert os.listdir(storage.UPLOADS_DIR) == []
    assert storage.load_projects() == []


def test_sin_orden_usa_el_orden_de_subida(client):
    r = crear(client, files=UNA)
    assert r.status_code == 200
    r = crear(client, files=UNA, orden="")
    assert r.status_code == 200
    r = crear(client, files=UNA, orden="[]")
    assert r.status_code == 200


def test_orden_valido_al_editar_respeta_posiciones(client):
    p = crear(client, files=archivos(("a.png", PNG, "image/png"), ("b.png", PNG, "image/png")),
              orden=json.dumps([{"type": "new"}, {"type": "new"}])).json()
    primera, segunda = p["imagenPrincipal"], p["fotosGaleria"][0]

    orden = json.dumps([
        {"type": "existing", "url": segunda},
        {"type": "new"},
        {"type": "existing", "url": "https://ajena.example/x.png"},  # URL ajena: se ignora
    ])
    r = client.put(f"/api/proyectos/{p['id']}", headers=cabeceras(), data={**CAMPOS, "orden": orden},
                   files=archivos(("c.png", PNG, "image/png")))
    assert r.status_code == 200, r.text
    editado = r.json()
    assert editado["imagenPrincipal"] == segunda
    assert len(editado["fotosGaleria"]) == 1 and editado["fotosGaleria"][0] not in (primera, segunda)
    # La imagen que salió del proyecto se borró del almacenamiento.
    assert os.path.basename(primera) not in os.listdir(storage.UPLOADS_DIR)
