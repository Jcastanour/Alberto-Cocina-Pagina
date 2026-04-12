// Este archivo centraliza toda la información de tu portafolio.
// Cuando tengas un nuevo proyecto, SIMPLEMENTE COPIA el bloque que ves en la sección "proyectos"
// y pégalo abajo llenando tus propios datos.

export const informacionPersonal = {
  nombre: "Alberto Castaño",
  subtitulo: "Contratista independiente – Obras civiles, remodelación y mantenimiento",
  ubicacion: "Medellín y Área Metropolitana",
  experienciaAnios: "30+",
  celular: "+573146441864", 
  correo: "contacto@albertocastano.com", 
  mensajeWhatsApp: "Hola Alberto, me gustaría cotizar un proyecto contigo.",
}

export const categoriasProyectos = [
  { id: "todas", label: "Todos los Proyectos" },
  { id: "cocinas_integrales", label: "Cocinas Integrales" },
  { id: "remodelaciones", label: "Remodelaciones" },
  { id: "banos", label: "Baños" },
  { id: "obra_blanca", label: "Obra Blanca y Acabados" },
];

export const servicios = [
  {
    id: "cocinas",
    titulo: "Cocinas integrales",
    descripcion: "Diseño, fabricación e instalación de cocinas modernas y funcionales, adaptadas a tu espacio.",
    icono: "ChefHat" 
  },
  {
    id: "remodelacion",
    titulo: "Remodelación de apartamentos",
    descripcion: "Transformación completa de espacios residenciales con acabados de primera calidad.",
    icono: "Home"
  },
  {
    id: "obra_blanca",
    titulo: "Obra blanca",
    descripcion: "Estuco, pintura y preparación perfecta de superficies para un acabado impecable.",
    icono: "PaintRoller"
  },
  {
    id: "enchapes",
    titulo: "Enchapes y acabados",
    descripcion: "Instalación profesional de cerámicas, porcelanatos y recubrimientos de alta categoría.",
    icono: "Grid"
  },
  {
    id: "plomeria",
    titulo: "Plomería e instalaciones",
    descripcion: "Redes hidráulicas y sanitarias seguras y garantizadas para baños, cocinas y zonas de ropas.",
    icono: "Droplets"
  },
  {
    id: "drywall",
    titulo: "Drywall y mampostería",
    descripcion: "Divisiones, cielos falsos y estructuras ligeras con excelentes acabados acústicos y visuales.",
    icono: "Layers"
  },
  {
    id: "carpinteria",
    titulo: "Closets y carpintería",
    descripcion: "Muebles de baño, closets, puertas y soluciones de madera a la medida.",
    icono: "Hammer"
  },
  {
    id: "mantenimiento",
    titulo: "Mantenimiento locativo",
    descripcion: "Reparaciones, adecuaciones y mantenimiento general para preservar el valor de tu inmueble.",
    icono: "Wrench"
  }
];

// LISTA DE TUS PROYECTOS REALES
// Las imágenes deben guardarse físicamente en la carpeta: public/images/proyectos/
export const proyectos = [
  {
    id: "proyecto-20260311142624",
    nombre: "cocina cafe",
    categoria: "cocinas_integrales",
    ciudad: "Medellín",
    año: "2025",
    tipoCliente: "Residencial",
    descripcionCorta: "cocina ",
    trabajosRealizados: [],
    materialesUsados: ['madera'],
    estado: "terminado",
    imagenPrincipal: "/images/proyectos/20260311142624_imagen_2026-03-11_142603357.png",
    fotosGaleria: [],
    observaciones: ""
  },
  {
    id: "proyecto-20260311142433",
    nombre: "Cocina Negra ",
    categoria: "cocinas_integrales",
    ciudad: "Medellín",
    año: "2026",
    tipoCliente: "Residencial",
    descripcionCorta: "Cocina negra",
    trabajosRealizados: [],
    materialesUsados: ['Marmol'],
    estado: "terminado",
    imagenPrincipal: "/images/proyectos/20260311142433_imagen_2026-03-11_142420406.png",
    fotosGaleria: [],
    observaciones: ""
  },
  {
    id: "ejemplo-001",
    nombre: "Ejemplo: Cocina en El Poblado",
    categoria: "cocinas_integrales", // Debe coincidir con el id de "categoriasProyectos"
    ciudad: "Medellín",
    año: "2024",
    tipoCliente: "Residencial",
    descripcionCorta: "Diseño e instalación de cocina integral de lujo.",
    trabajosRealizados: ["Demolición", "Pintura", "Instalación de gabinetes"],
    materialesUsados: ["Madera Rh", "Mesón en Cuarzo", "Herrajes cierre lento"],
    estado: "terminado", // terminado / en proceso
    imagenPrincipal: "https://images.unsplash.com/photo-1556910103-1c02745a872e?auto=format&fit=crop&q=80&w=800", // PRONTO LO CAMBIARÁS A: "/images/proyectos/tu-foto.jpg"
    fotosGaleria: [],
    observaciones: "Entregado a satisfacción."
  }
];
