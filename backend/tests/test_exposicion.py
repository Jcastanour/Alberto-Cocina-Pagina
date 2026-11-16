import pytest

ORIGEN = "http://localhost:5173"  # ALLOWED_ORIGINS en pruebas


@pytest.mark.parametrize("ruta", ["/docs", "/redoc", "/openapi.json", "/docs/oauth2-redirect"])
def test_documentacion_no_publicada(client, ruta):
    assert client.get(ruta).status_code == 404


def test_la_api_sigue_respondiendo(client):
    assert client.get("/api/health").json() == {"status": "ok", "storage": "local"}
    assert client.get("/api/proyectos").json() == []


def test_cors_sin_credenciales_y_con_cabecera_authorization(client):
    r = client.options(
        "/api/proyectos",
        headers={
            "Origin": ORIGEN,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization",
        },
    )
    assert r.status_code == 200
    assert r.headers["access-control-allow-origin"] == ORIGEN
    assert "authorization" in r.headers["access-control-allow-headers"].lower()
    assert "access-control-allow-credentials" not in r.headers

    r = client.get("/api/proyectos", headers={"Origin": ORIGEN})
    assert r.headers["access-control-allow-origin"] == ORIGEN
    assert "access-control-allow-credentials" not in r.headers


def test_cors_no_refleja_origenes_ajenos(client):
    r = client.get("/api/proyectos", headers={"Origin": "https://malo.example"})
    assert "access-control-allow-origin" not in r.headers


def test_el_413_tambien_lleva_cabeceras_cors(client):
    import main

    r = client.post("/api/proyectos", content=b"x",
                    headers={"Origin": ORIGEN, "Content-Length": str(main.MAX_BODY_BYTES + 1)})
    assert r.status_code == 413 and r.headers["access-control-allow-origin"] == ORIGEN
