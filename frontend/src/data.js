// Configuración estática de la marca AYC Obras y Diseños.
// Los PROYECTOS ya NO viven aquí: se piden al backend en runtime (ver src/api.js).
// Esto es solo info que no cambia desde la web: marca, contacto, servicios,
// categorías del catálogo y la sección de robótica.

export const informacionPersonal = {
  marca: "AYC Obras y Diseños",
  autor: "Alberto Castaño",
  tagline: "Remodelamos, construimos y decoramos",
  subtitulo: "Cocinas, closets, espacios de trabajo y decoración a la medida",
  ubicacion: "Medellín y Área Metropolitana",
  experienciaAnios: "30+",
  celular: "+573146441864",
  mensajeWhatsApp: "Hola AYC, me gustaría cotizar un proyecto con ustedes.",
};

export const categoriasProyectos = [
  { id: "todas", label: "Todo el catálogo" },
  { id: "cocinas", label: "Cocinas integrales" },
  { id: "closets", label: "Closets y carpintería" },
  { id: "escritorios", label: "Escritorios y espacios de trabajo" },
  { id: "decoracion", label: "Decoración e iluminación" },
];

export const servicios = [
  {
    id: "cocinas",
    titulo: "Cocinas integrales",
    descripcion: "Diseño, fabricación e instalación de cocinas modernas y funcionales, hechas a la medida de tu espacio.",
    icono: "ChefHat",
  },
  {
    id: "closets",
    titulo: "Closets y carpintería",
    descripcion: "Closets, vestieres y muebles a la medida con excelentes acabados y herrajes de cierre suave.",
    icono: "Hammer",
  },
  {
    id: "escritorios",
    titulo: "Escritorios y espacios de trabajo",
    descripcion: "Estudios, home office y zonas de trabajo cómodas, ordenadas y a tu medida.",
    icono: "Laptop",
  },
  {
    id: "decoracion",
    titulo: "Decoración e iluminación",
    descripcion: "Ambientación interior, iluminación y detalles que le dan carácter y calidez a cada espacio.",
    icono: "Lightbulb",
  },
  {
    id: "remodelacion",
    titulo: "Remodelación y obra blanca",
    descripcion: "Transformación de espacios residenciales con acabados de primera: estuco, pintura y enchapes.",
    icono: "PaintRoller",
  },
  {
    id: "mantenimiento",
    titulo: "Mantenimiento y acabados",
    descripcion: "Reparaciones, adecuaciones y mantenimiento general para conservar el valor de tu inmueble.",
    icono: "Wrench",
  },
];

// Robótica: línea APARTE (no es categoría del catálogo de espacios).
export const roboticaInfo = {
  titulo: "AYC Robótica",
  tagline: "Automatización y proyectos de robótica",
  descripcion:
    "Una nueva línea donde combinamos diseño y tecnología: automatización de espacios, electrónica y proyectos de robótica a la medida. Estamos incursionando con prototipos y soluciones para hogar e industria.",
  bullets: [
    "Automatización y domótica para el hogar",
    "Prototipado y proyectos de robótica a medida",
    "Integración de electrónica e iluminación inteligente",
  ],
  cta: "Cuéntame tu idea de robótica",
};
