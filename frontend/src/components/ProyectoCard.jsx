import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { resolveImg } from '../api';

// Tarjeta de proyecto que enlaza a su página de detalle.
export default function ProyectoCard({ proyecto }) {
  return (
    <Link to={`/proyectos/${proyecto.id}`} className="gallery-item project-card">
      <img
        src={resolveImg(proyecto.imagenPrincipal)}
        alt={proyecto.nombre}
        className="gallery-img"
        loading="lazy"
      />
      {proyecto.estado === 'en proceso' && <span className="card-badge">En proceso</span>}
      <div className="gallery-overlay">
        <h4 className="gallery-title">{proyecto.nombre}</h4>
        <div className="gallery-location">
          <MapPin size={15} />
          {proyecto.ciudad} · {proyecto.año}
        </div>
      </div>
    </Link>
  );
}
