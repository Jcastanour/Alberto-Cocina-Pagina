import os
import shutil
import re
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from pydantic import BaseModel

app = FastAPI()

# Permitir a React (Vite) comunicarse con FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas absolutas a los directorios del portafolio
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES_DIR = os.path.join(BASE_DIR, "public", "images", "proyectos")
DATA_FILE = os.path.join(BASE_DIR, "src", "data.js")

@app.post("/api/proyectos")
async def crear_proyecto(
    nombre: str = Form(...),
    categoria: str = Form(...),
    ciudad: str = Form(...),
    ano: str = Form(...),
    tipoCliente: str = Form(...),
    descripcionCorta: str = Form(...),
    trabajosRealizados: str = Form(...),
    materialesUsados: str = Form(...),
    estado: str = Form(...),
    observaciones: str = Form(...),
    imagenPrincipal: UploadFile = File(...)
):
    try:
        # 1. Guardar la Imagen Físicamente
        # Generamos un ID seguro para la imagen basado en el tiempo
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        safe_filename = f"{timestamp}_{imagenPrincipal.filename.replace(' ', '_')}"
        image_path = os.path.join(IMAGES_DIR, safe_filename)

        # Asegurarse que el directorio existe
        os.makedirs(IMAGES_DIR, exist_ok=True)

        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(imagenPrincipal.file, buffer)

        # La ruta que React entenderá 
        react_image_path = f"/images/proyectos/{safe_filename}"

        # 2. Convertir comas a arreglos limpios
        trabajos_array = [t.strip() for t in trabajosRealizados.split(",") if t.strip()]
        materiales_array = [m.strip() for m in materialesUsados.split(",") if m.strip()]

        # 3. Construir el nuevo bloque de código como Cadena de Texto
        nuevo_proyecto_str = f"""  {{
    id: "proyecto-{timestamp}",
    nombre: "{nombre}",
    categoria: "{categoria}",
    ciudad: "{ciudad}",
    año: "{ano}",
    tipoCliente: "{tipoCliente}",
    descripcionCorta: "{descripcionCorta}",
    trabajosRealizados: {trabajos_array},
    materialesUsados: {materiales_array},
    estado: "{estado}",
    imagenPrincipal: "{react_image_path}",
    fotosGaleria: [],
    observaciones: "{observaciones}"
  }},
"""
        
        # 4. Inyectar este nuevo proyecto en data.js usando Regex (Manipulación Segura)
        with open(DATA_FILE, "r", encoding="utf-8") as file:
            content = file.read()

        # Buscamos la declaración 'export const proyectos = [' y pegamos el bloque justo debajo
        pattern = r"(export const proyectos = \[\n)"
        if re.search(pattern, content):
            new_content = re.sub(pattern, r"\1" + nuevo_proyecto_str, content)
            
            with open(DATA_FILE, "w", encoding="utf-8") as file:
                file.write(new_content)
        else:
            return {"error": "No se encontró el arreglo export const proyectos en data.js"}

        return {
            "mensaje": "Proyecto guardado con éxito",
            "proyecto": nombre,
            "imagen_ruta": react_image_path
        }
        
    except Exception as e:
        return {"error": str(e)}

@app.get("/")
def read_root():
    return {"message": "API del Portafolio de Alberto Corriendo (FastAPI)"}
