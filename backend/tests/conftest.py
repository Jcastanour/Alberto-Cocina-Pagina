"""Entorno de pruebas: SIEMPRE modo local (sin R2) y datos en una carpeta temporal.

Se fija antes de importar la app, porque storage.py y auth.py leen el entorno
al importarse. Ninguna prueba toca R2 ni la carpeta backend/data real.
"""
import os
import sys
import tempfile

for _var in ("R2_ACCOUNT_ID", "R2_BUCKET", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_PUBLIC_URL"):
    os.environ.pop(_var, None)

_TMP = tempfile.mkdtemp(prefix="aycobras-tests-")
os.environ["DATA_DIR"] = _TMP
os.environ["ADMIN_PASSWORD"] = "clave-de-pruebas-ñ"
os.environ["SECRET_KEY"] = "secreto-de-pruebas"
os.environ["ALLOWED_ORIGINS"] = "http://localhost:5173"
os.environ["MAX_IMAGE_MB"] = "1"
os.environ["MAX_GALLERY"] = "3"

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest  # noqa: E402


@pytest.fixture(autouse=True)
def _estado_limpio():
    import main
    import storage

    assert storage.USE_R2 is False
    main.login_limiter.reset()
    for nombre in os.listdir(storage.UPLOADS_DIR):
        os.remove(os.path.join(storage.UPLOADS_DIR, nombre))
    if os.path.exists(storage.PROJECTS_FILE):
        os.remove(storage.PROJECTS_FILE)
    yield


@pytest.fixture
def client():
    from fastapi.testclient import TestClient

    import main

    return TestClient(main.app, raise_server_exceptions=False)


PASSWORD = "clave-de-pruebas-ñ"
