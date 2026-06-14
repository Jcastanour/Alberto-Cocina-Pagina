// Plantillas de descripción por categoría, en tono cálido y cercano (trato de "tú").
// En el admin, el botón "Usar plantilla" rellena la descripción y sugiere
// trabajos/materiales según la categoría. Después solo ajustas lo del proyecto.

export const plantillas = {
  cocinas: {
    descripcion:
      "Transformamos esta cocina en un espacio cálido, funcional y hecho a la medida del día a día de la familia. Cuidamos cada detalle: el diseño, la distribución y unos acabados impecables para que disfrutes cocinar y compartir.",
    trabajos: ["Diseño", "Fabricación", "Instalación"],
    materiales: ["Madera", "Mesón en cuarzo", "Herrajes de cierre suave"],
  },
  closets: {
    descripcion:
      "Diseñamos este closet a la medida para aprovechar cada centímetro: más orden, buena iluminación y acabados que duran. Pensado para que todo tenga su lugar y tu día a día sea más fácil.",
    trabajos: ["Diseño", "Fabricación", "Instalación"],
    materiales: ["Madera", "Herrajes", "Barras y entrepaños"],
  },
  escritorios: {
    descripcion:
      "Creamos un espacio de trabajo cómodo y ordenado, hecho a tu medida, para que te concentres y rindas mejor. Buen aprovechamiento del espacio y acabados que combinan con tu hogar.",
    trabajos: ["Diseño", "Fabricación", "Instalación"],
    materiales: ["Madera", "Superficie resistente", "Pasacables"],
  },
  decoracion: {
    descripcion:
      "Le dimos carácter y calidez a este espacio con iluminación y detalles pensados a la medida del ambiente. Pequeños cambios que transforman por completo la sensación del lugar.",
    trabajos: ["Diseño", "Iluminación", "Ambientación"],
    materiales: ["Iluminación LED", "Acabados", "Detalles decorativos"],
  },
};

// Plantilla genérica de respaldo si la categoría no tiene una específica.
export const plantillaGenerica = {
  descripcion:
    "Hicimos este proyecto a la medida, cuidando cada detalle y con acabados de primera. Diseño, fabricación e instalación pensados para que el resultado te encante.",
  trabajos: ["Diseño", "Fabricación", "Instalación"],
  materiales: [],
};

export function plantillaPara(categoria) {
  return plantillas[categoria] || plantillaGenerica;
}
