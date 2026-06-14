# A&C Obras y Diseños

Portafolio/catálogo de **AYC Obras y Diseños** (Alberto Castaño): cocinas, closets,
escritorios y decoración a la medida, más una línea de robótica.

> *Remodelamos, construimos y decoramos.*

## Estructura

```
.
├── frontend/   React + Vite  → se despliega en Cloudflare Pages
├── backend/    FastAPI        → se despliega en el servidor Oracle (Docker)
├── docker-compose.yml         → orquesta el backend en Oracle (red elixir-net)
└── .github/workflows/         → CI/CD del backend (deploy por SSH)
```

Las **imágenes y los datos de los proyectos** viven en **Cloudflare R2** (en
producción) o en `backend/data/` (en desarrollo local). El frontend pide los
proyectos al backend en runtime, así que subir/editar/borrar desde `/admin` se
refleja al instante, sin recompilar.

## Desarrollo local

**Backend** (modo local, sin R2):
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # ajusta ADMIN_PASSWORD
python migrate.py             # carga los 2 proyectos iniciales (opcional)
uvicorn main:app --reload     # http://localhost:8000
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:8000
npm run dev                    # http://localhost:5173
```

Panel de administración: `http://localhost:5173/admin` (contraseña = `ADMIN_PASSWORD`).

## Despliegue

### Frontend → Cloudflare Pages
1. Conecta el repo de GitHub a Cloudflare Pages.
2. Root directory: `frontend` · Build command: `npm run build` · Output: `dist`.
3. Variable de entorno: `VITE_API_URL` = URL del backend
   (ej. `https://aycobras-api.elixircuentas.com`, luego `https://api.aycobras.com`).
4. Cada `git push` a `main` republica el frontend automáticamente.

### Backend → Oracle (Docker + Caddy)
Ver el detalle del servidor en [`SKILL.md`](./SKILL.md). Resumen:
```bash
ssh ubuntu@149.130.175.218
git clone <repo> ~/aycobras && cd ~/aycobras
cp backend/.env.example backend/.env   # llenar ADMIN_PASSWORD, SECRET_KEY, R2_*
docker-compose up -d --build
```
Agregar a `~/elixir-infra/caddy/Caddyfile`:
```
aycobras-api.elixircuentas.com {
  encode zstd gzip
  reverse_proxy aycobras-api:8000
}
```
y `docker-compose restart caddy`.

### Cloudflare R2 (imágenes + datos)
Crear un bucket, generar un token (Access Key / Secret) y llenar en `backend/.env`:
`R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
`R2_PUBLIC_URL` (URL pública del bucket, ej. `https://pub-xxxx.r2.dev`).
Luego correr `python migrate.py` una vez para subir los proyectos iniciales.

### CI/CD del backend
El workflow `.github/workflows/deploy-backend.yml` despliega por SSH al hacer
push con cambios en `backend/`. Requiere los secrets de GitHub:
`ORACLE_HOST`, `ORACLE_USER`, `ORACLE_SSH_KEY`.
