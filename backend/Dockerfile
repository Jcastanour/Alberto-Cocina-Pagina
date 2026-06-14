FROM python:3.12-slim

WORKDIR /app

# Dependencias primero (mejor cache de capas)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Estado persistente en R2; DATA_DIR solo se usa en modo local de respaldo.
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
