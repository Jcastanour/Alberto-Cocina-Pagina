from conftest import PASSWORD


def _login(client, password, ip="203.0.113.7"):
    return client.post("/api/login", json={"password": password}, headers={"X-Forwarded-For": ip})


def test_login_ok_devuelve_token(client):
    r = _login(client, PASSWORD)
    assert r.status_code == 200 and r.json()["token"]


def test_clave_incorrecta_es_401(client):
    assert _login(client, "otra").status_code == 401
    assert _login(client, "").status_code == 401


def test_clave_no_ascii_incorrecta_es_401_no_500(client):
    assert _login(client, "contraseña-ñ-€").status_code == 401


def test_cuerpo_invalido_es_422_no_500(client):
    cuerpos = ({}, {"password": 123}, {"password": None}, {"password": ["a"]}, [], "x")
    for i, cuerpo in enumerate(cuerpos):
        r = client.post("/api/login", json=cuerpo, headers={"X-Forwarded-For": f"198.51.100.{i}"})
        assert r.status_code == 422, cuerpo


def test_clave_demasiado_larga_es_422(client):
    assert _login(client, "a" * 257).status_code == 422
    assert _login(client, "a" * 256).status_code == 401


def test_limite_de_intentos_por_ip(client):
    for _ in range(5):
        assert _login(client, "mala").status_code == 401
    r = _login(client, PASSWORD)  # ni la correcta pasa durante el bloqueo
    assert r.status_code == 429 and r.headers["Retry-After"] == "60"
    # Otra IP no se ve afectada.
    assert _login(client, PASSWORD, ip="203.0.113.8").status_code == 200


def test_limite_usa_la_ultima_ip_de_x_forwarded_for(client):
    for i in range(5):
        assert _login(client, "mala", ip=f"10.0.0.{i}, 203.0.113.9").status_code == 401
    assert _login(client, "mala", ip="1.2.3.4, 203.0.113.9").status_code == 429


def test_limitador_ventana_deslizante():
    from ratelimit import SlidingWindowLimiter

    t = [0.0]
    lim = SlidingWindowLimiter(limit=2, window=60, clock=lambda: t[0])
    assert lim.hit("a") and lim.hit("a") and not lim.hit("a")
    assert lim.hit("b")
    t[0] = 61
    assert lim.hit("a")
