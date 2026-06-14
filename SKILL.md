---
name: deploy-oracle
description: Despliega este proyecto en elixir-server (Oracle Cloud, IP 149.130.175.218). Usar siempre que el usuario mencione subir al servidor, hacer deploy, publicar en producción, actualizar Oracle, o configurar un dominio en elixircuentas.com. También activar cuando el usuario pregunte si algo está corriendo en el server o quiera revisar el estado de los contenedores. Incluye soporte para primer deploy y actualizaciones.
---

# Deploy a elixir-server (Oracle Cloud)

Este skill guía el proceso de desplegar cualquier proyecto en el servidor Oracle Cloud compartido de elixircuentas.com.

## El servidor

| Dato | Valor |
|---|---|
| Host | `elixir-server` |
| IP pública | `149.130.175.218` |
| SSH | `ssh ubuntu@149.130.175.218` |
| OS | Ubuntu 24.04 aarch64 (ARM) |
| Specs | 2 OCPU / 12 GB RAM (Oracle Free Tier) |
| docker-compose | `/usr/local/bin/docker-compose` (standalone v2) — usar `docker-compose`, **NO** `docker compose` |

**Archivos clave en el servidor:**
- Caddyfile central: `~/elixir-infra/caddy/Caddyfile`
- Caddy compose: `~/elixir-infra/caddy/docker-compose.yml`
- Directorio de proyectos: `~/` (cada proyecto en su propia carpeta)

## Arquitectura

Todo el tráfico HTTPS entra por **Caddy** (único servicio con puertos 80/443 en el host). Caddy hace reverse proxy al contenedor correcto según el subdominio. Los contenedores se comunican entre sí por la red Docker `elixir-net`.

```
Internet → :443 → [caddy] → elixir-net → [tu-proyecto:PUERTO]
```

**Proyectos existentes en elixir-net** (para referencia, no tocar):

| container_name | Subdominio | Puerto interno |
|---|---|---|
| caddy | — | 80/443 (host) |
| n8n | n8n.elixircuentas.com | 5678 |
| n8n-runner | — | interno |
| qr_reader | — | 8000 (solo interno, no expuesto) |
| capturas-api | api-capturas.elixircuentas.com | 8000 |
| capturas-web | capturas.elixircuentas.com | 80 |
| capturas-postgres | — | interno |
| capturas-redis | — | interno |

## Patrón estándar de docker-compose.yml

El `docker-compose.yml` de producción del proyecto **debe** seguir este patrón:

```yaml
services:
  mi-servicio:
    build: .          # o image: si usas imagen pública
    container_name: mi-servicio   # único, sin guiones problemáticos
    restart: unless-stopped
    env_file: .env    # secrets fuera del compose
    # SIN ports: → no exponer al host, Caddy hace el proxy
    networks:
      elixir-net:
        aliases:
          - mi-servicio    # nombre DNS dentro de la red

  # Si necesita base de datos:
  mi-postgres:
    image: postgres:16-alpine
    container_name: mi-postgres
    restart: unless-stopped
    networks:
      - internal    # base de datos solo en red interna
    volumes:
      - ./data/postgres:/var/lib/postgresql/data

networks:
  elixir-net:
    external: true    # SIEMPRE external: true
  internal:           # opcional, para servicios internos
    driver: bridge
```

**Regla crítica:** `elixir-net` con `external: true`. La red ya existe en el servidor.

## Flujo: Primer deploy

Seguir en orden. Confirmar cada paso antes de continuar.

### 0. Antes de empezar

Leer el `docker-compose.yml` del proyecto actual para entender:
- ¿Qué servicios tiene?
- ¿Qué puerto escucha el servicio principal?
- ¿Tiene base de datos propia? ¿Redis?
- ¿Qué variables de entorno necesita?

Preguntar al usuario:
- ¿Qué subdominio usar? (ej: `mi-api.elixircuentas.com`)
- ¿El código está en un repo git o hay que subir archivos?
- ¿Ya existe el DNS record apuntando a `149.130.175.218`?

### 1. DNS (si es subdominio nuevo)

El usuario debe agregar un A record en su proveedor DNS:
```
<subdominio>.elixircuentas.com → A → 149.130.175.218
```
Caddy obtendrá el TLS automáticamente cuando reciba la primera petición.

### 2. Preparar docker-compose.yml de producción

Verificar que el proyecto tiene un `docker-compose.yml` (o `docker-compose.prod.yml`) con el patrón estándar de arriba. Si no, crearlo o ajustarlo.

Asegurarse de que:
- El servicio se conecta a `elixir-net` con `external: true`
- No expone puertos al host (`ports:` solo si es absolutamente necesario)
- Usa `env_file: .env` para los secretos

### 3. Subir código al servidor

**Opción A — Repo git (recomendado):**
```bash
ssh ubuntu@149.130.175.218
cd ~
git clone <repo-url> <nombre-proyecto>
cd <nombre-proyecto>
```

**Opción B — Sin git (rsync desde Mac):**
```bash
# Desde la Mac, en el directorio del proyecto:
rsync -avz --exclude='.env' --exclude='node_modules' --exclude='__pycache__' \
  --exclude='.git' --exclude='data/' \
  . ubuntu@149.130.175.218:~/<nombre-proyecto>/
```

### 4. Crear .env de producción en el servidor

```bash
ssh ubuntu@149.130.175.218
cd ~/<nombre-proyecto>
nano .env   # pegar las variables de producción
```

El `.env` nunca va en git. Tiene que crearse manualmente la primera vez.

### 5. Construir y levantar

```bash
ssh ubuntu@149.130.175.218
cd ~/<nombre-proyecto>
docker-compose up -d --build
docker ps   # verificar que el contenedor quedó running
docker logs <container_name> --tail 20   # verificar que arrancó bien
```

### 6. Agregar bloque en Caddyfile

```bash
ssh ubuntu@149.130.175.218
nano ~/elixir-infra/caddy/Caddyfile
```

Agregar al final:
```
<subdominio>.elixircuentas.com {
  encode zstd gzip
  reverse_proxy <container_name>:<PUERTO>
}
```

Donde `<container_name>` es el nombre del contenedor y `<PUERTO>` es el puerto que escucha internamente.

### 7. Recargar Caddy

```bash
ssh ubuntu@149.130.175.218
cd ~/elixir-infra/caddy
docker-compose restart caddy
docker logs caddy --tail 20   # verificar que parseó el Caddyfile sin errores
```

### 8. Verificar

```bash
# Esperar ~30 segundos para que Let's Encrypt emita el certificado
curl https://<subdominio>.elixircuentas.com/health   # o la ruta de healthcheck del proyecto
```

Si hay error de TLS, esperar un poco más. Si hay error 502 Bad Gateway, el contenedor no está respondiendo — revisar logs.

---

## Flujo: Actualización de proyecto existente

```bash
ssh ubuntu@149.130.175.218
cd ~/<nombre-proyecto>

# Si tiene git:
git pull origin main

# Reconstruir y reiniciar:
docker-compose up -d --build

# Verificar:
docker ps
docker logs <container_name> --tail 30
```

Si cambió el Caddyfile (nuevo subdominio, nuevo puerto): también reiniciar Caddy.

---

## Verificación rápida del estado del servidor

```bash
ssh ubuntu@149.130.175.218

# Estado de todos los contenedores:
docker ps

# Ver logs de un servicio específico:
docker logs <container_name> --tail 50 -f

# Uso de disco:
df -h

# Uso de memoria:
free -h

# Caddyfile actual:
cat ~/elixir-infra/caddy/Caddyfile
```

---

## Reglas críticas

Ver detalles completos en `references/server-rules.md`. Resumen:

1. **`container_name: qr_reader`** — no cambiar, está hardcodeado en workflows de n8n
2. **`N8N_ENCRYPTION_KEY`** en `~/n8n/.env` — no cambiar jamás
3. **`elixir-net`** — no borrar ni recrear la red
4. **Puerto 22** en Oracle NSG — no cerrar (perderías acceso SSH)
5. Elegir `container_name` únicos — no reutilizar nombres existentes

---

## Troubleshooting rápido

| Síntoma | Causa probable | Solución |
|---|---|---|
| 502 Bad Gateway | Contenedor caído o puerto incorrecto | `docker ps`, `docker logs`, verificar puerto en Caddyfile |
| Error TLS / certificado | DNS no propagado aún | Esperar 5-10 min, verificar A record |
| Contenedor no arranca | Error en .env o código | `docker logs <container>`, revisar variables |
| "network elixir-net not found" | Red no existe | `docker network create elixir-net` |
| Caddy no parsea Caddyfile | Sintaxis incorrecta | `docker logs caddy`, corregir Caddyfile, reiniciar |
