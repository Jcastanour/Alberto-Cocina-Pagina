import pytest

import auth

BUENOS = {"secret_key": "un-secreto-propio-largo", "admin_password": "una-clave-propia"}


def test_modo_local_no_exige_nada():
    auth.require_production_secrets(False, secret_key=auth.DEV_SECRET_KEY, admin_password=auth.DEV_ADMIN_PASSWORD)
    auth.require_production_secrets(False, secret_key="", admin_password="")


def test_produccion_con_valores_propios_arranca():
    auth.require_production_secrets(True, **BUENOS)
    assert auth.insecure_secrets(**BUENOS) == []


@pytest.mark.parametrize(
    "campo,valor,nombre",
    [
        ("secret_key", "dev-secret-cambiar-en-produccion", "SECRET_KEY"),
        ("secret_key", "genera-un-valor-aleatorio-largo", "SECRET_KEY"),
        ("secret_key", "", "SECRET_KEY"),
        ("secret_key", "   ", "SECRET_KEY"),
        ("admin_password", "admin", "ADMIN_PASSWORD"),
        ("admin_password", "cambia-esta-clave", "ADMIN_PASSWORD"),
        ("admin_password", "", "ADMIN_PASSWORD"),
    ],
)
def test_produccion_con_valor_por_defecto_no_arranca(campo, valor, nombre):
    args = {**BUENOS, campo: valor}
    with pytest.raises(RuntimeError) as exc:
        auth.require_production_secrets(True, **args)
    texto = str(exc.value)
    assert nombre in texto
    # Nombra la variable, nunca los valores.
    assert BUENOS["secret_key"] not in texto and BUENOS["admin_password"] not in texto
    if valor.strip():
        assert valor not in texto


def test_la_app_de_pruebas_corre_en_modo_local():
    import main
    import storage

    assert storage.USE_R2 is False and main.app is not None
