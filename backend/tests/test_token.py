import hashlib
import hmac

import auth
from conftest import PASSWORD

AHORA = 1_800_000_000


def test_token_recien_emitido_es_valido():
    token = auth.make_token(now=AHORA)
    exp, firma = token.split(".")
    assert int(exp) == AHORA + 12 * 60 * 60
    assert len(firma) == 64
    assert auth.verify_token(token, now=AHORA)
    assert auth.verify_token(token, now=AHORA + auth.TOKEN_TTL_SECONDS - 1)


def test_token_vence_a_las_12_horas():
    token = auth.make_token(now=AHORA)
    assert not auth.verify_token(token, now=AHORA + auth.TOKEN_TTL_SECONDS)
    assert not auth.verify_token(token, now=AHORA + auth.TOKEN_TTL_SECONDS + 1)


def test_dos_logins_en_momentos_distintos_dan_tokens_distintos():
    assert auth.make_token(now=AHORA) != auth.make_token(now=AHORA + 1)


def test_no_se_puede_alargar_el_vencimiento():
    exp, firma = auth.make_token(now=AHORA).split(".")
    assert not auth.verify_token(f"{int(exp) + 999999}.{firma}", now=AHORA)


def test_cambiar_la_contrasena_revoca_los_tokens(monkeypatch):
    token = auth.make_token(now=AHORA)
    monkeypatch.setattr(auth, "ADMIN_PASSWORD", "otra-clave-nueva")
    assert not auth.verify_token(token, now=AHORA)
    assert auth.verify_token(auth.make_token(now=AHORA), now=AHORA)


def test_cambiar_el_secret_key_revoca_los_tokens(monkeypatch):
    token = auth.make_token(now=AHORA)
    monkeypatch.setattr(auth, "SECRET_KEY", "otro-secreto")
    assert not auth.verify_token(token, now=AHORA)


def test_el_token_antiguo_sin_vencimiento_ya_no_vale():
    viejo = hmac.new(auth.SECRET_KEY.encode(), b"aycobras-admin", hashlib.sha256).hexdigest()
    assert not auth.verify_token(viejo)


def test_tokens_mal_formados_dan_false_sin_excepcion():
    bueno = auth.make_token()
    exp, firma = bueno.split(".")
    for malo in (None, "", ".", "abc", "abc.def", f"{exp}.", f".{firma}", f"{exp}.{firma}x",
                 f"-1.{firma}", f"１２３.{firma}", f"{exp}.ñandú", "9" * 500, 123, b"x", f"{exp}.{firma}.extra"):
        assert auth.verify_token(malo) is False, malo


def _crear(client, token):
    cabeceras = {"Authorization": f"Bearer {token}"} if token is not None else {}
    return client.post("/api/proyectos", headers=cabeceras, data={"nombre": "x"})


def test_rutas_de_escritura_exigen_token_vigente(client, monkeypatch):
    assert _crear(client, None).status_code == 401
    assert _crear(client, "basura").status_code == 401
    r = client.post("/api/proyectos", headers={"Authorization": "Bearer ñ-no-ascii".encode("latin-1")})
    assert r.status_code == 401
    assert client.delete("/api/proyectos/x").status_code == 401
    assert client.put("/api/proyectos/x", data={"nombre": "x"}).status_code == 401

    token = client.post("/api/login", json={"password": PASSWORD}).json()["token"]
    # Con token válido pasa la autenticación (422: faltan campos del formulario).
    assert _crear(client, token).status_code == 422
    assert client.delete("/api/proyectos/no-existe", headers={"Authorization": f"Bearer {token}"}).status_code == 404

    vencido = auth.make_token(now=AHORA - 13 * 60 * 60 - 10**9)
    assert _crear(client, vencido).status_code == 401

    monkeypatch.setattr(auth, "ADMIN_PASSWORD", "clave-cambiada")
    assert _crear(client, token).status_code == 401
