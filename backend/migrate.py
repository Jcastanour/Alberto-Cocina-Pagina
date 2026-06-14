"""Migración inicial: pasa los proyectos reales que estaban hardcodeados en
el viejo data.js al nuevo datastore (R2 o local).

Sube las 2 fotos reales (que vivían en frontend/public/images/proyectos/)
al almacenamiento y escribe el projects.json inicial. El proyecto "ejemplo"
de Unsplash se descarta.

Uso:
    cd backend && python migrate.py
"""
import os
import time

import storage

FRONTEND_IMAGES = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "frontend", "public", "images", "proyectos",
)

# (archivo de origen, datos del proyecto)
PROYECTOS_REALES = [
    (
        "20260311142624_imagen_2026-03-11_142603357.png",
        {
            "nombre": "Cocina café",
            "categoria": "cocinas",
            "ciudad": "Medellín",
            "año": "2025",
            "tipoCliente": "Residencial",
            "descripcionCorta": "Cocina integral en tonos cálidos de madera.",
            "trabajosRealizados": ["Diseño", "Fabricación", "Instalación"],
            "materialesUsados": ["Madera"],
            "estado": "terminado",
            "observaciones": "",
        },
    ),
    (
        "20260311142433_imagen_2026-03-11_142420406.png",
        {
            "nombre": "Cocina negra",
            "categoria": "cocinas",
            "ciudad": "Medellín",
            "año": "2026",
            "tipoCliente": "Residencial",
            "descripcionCorta": "Cocina integral negra con mesón en mármol.",
            "trabajosRealizados": ["Diseño", "Fabricación", "Instalación"],
            "materialesUsados": ["Mármol"],
            "estado": "terminado",
            "observaciones": "",
        },
    ),
]


def main():
    existentes = storage.load_projects()
    if existentes:
        print(f"Ya hay {len(existentes)} proyectos en el datastore. Aborto para no duplicar.")
        return

    proyectos = []
    for filename, datos in PROYECTOS_REALES:
        ruta = os.path.join(FRONTEND_IMAGES, filename)
        if not os.path.exists(ruta):
            print(f"  ! No encontré {ruta}, salto este proyecto.")
            continue
        with open(ruta, "rb") as f:
            url = storage.save_image(f.read(), filename, "image/png")
        proyectos.append(
            {
                "id": f"proyecto-{time.strftime('%Y%m%d%H%M%S')}-{len(proyectos)}",
                **datos,
                "imagenPrincipal": url,
                "fotosGaleria": [],
                "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S"),
            }
        )
        print(f"  + {datos['nombre']} -> {url}")

    storage.save_projects(proyectos)
    print(f"Listo: {len(proyectos)} proyectos migrados ({'R2' if storage.USE_R2 else 'local'}).")


if __name__ == "__main__":
    main()
