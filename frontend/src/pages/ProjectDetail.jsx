import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, User, ArrowLeft, X, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProyecto, resolveImg } from '../api';
import { informacionPersonal } from '../data';
import { whatsappUrl } from '../utils';

const ProjectDetail = () => {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState(null); // índice de la imagen abierta

  useEffect(() => {
    setLoading(true);
    getProyecto(id)
      .then(setProyecto)
      .catch((e) => setError(e.message || 'Proyecto no encontrado'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-wrapper container">
        <div className="detail-hero-img skeleton" style={{ height: '50vh' }} />
      </div>
    );
  }

  if (error || !proyecto) {
    return (
      <div className="page-wrapper container" style={{ textAlign: 'center' }}>
        <p className="empty-state">{error || 'Proyecto no encontrado'}</p>
        <Link to="/proyectos" className="btn btn-primary">Volver a proyectos</Link>
      </div>
    );
  }

  const galeria = [proyecto.imagenPrincipal, ...(proyecto.fotosGaleria || [])].filter(Boolean);
  const mensaje = `Hola AYC, vi el proyecto "${proyecto.nombre}" y me gustaría algo así.`;

  const moverLightbox = (dir) => {
    setLightbox((i) => (i + dir + galeria.length) % galeria.length);
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <div className="container detail-container">
        <Link to="/proyectos" className="link-back"><ArrowLeft size={18} /> Volver a proyectos</Link>

        <div className="detail-head">
          <div>
            <h1 className="detail-title">{proyecto.nombre}</h1>
            <div className="detail-meta">
              <span><MapPin size={16} /> {proyecto.ciudad}</span>
              <span><Calendar size={16} /> {proyecto.año}</span>
              <span><User size={16} /> {proyecto.tipoCliente}</span>
              {proyecto.estado === 'en proceso' && <span className="badge-process">En proceso</span>}
            </div>
          </div>
        </div>

        {/* Galería */}
        <div className="detail-gallery">
          <button className="detail-hero-img" onClick={() => setLightbox(0)}>
            <img src={resolveImg(galeria[0])} alt={proyecto.nombre} />
          </button>
          {galeria.length > 1 && (
            <div className="detail-thumbs">
              {galeria.slice(1).map((url, i) => (
                <button key={url} className="detail-thumb" onClick={() => setLightbox(i + 1)}>
                  <img src={resolveImg(url)} alt={`${proyecto.nombre} ${i + 2}`} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="detail-body">
          <div className="detail-main">
            <h3>Sobre el proyecto</h3>
            <p>{proyecto.descripcionCorta}</p>
            {proyecto.observaciones && <p className="detail-obs">{proyecto.observaciones}</p>}
          </div>
          <aside className="detail-aside">
            {proyecto.trabajosRealizados?.length > 0 && (
              <div className="detail-tags-group">
                <h4>Trabajos</h4>
                <div className="tags">
                  {proyecto.trabajosRealizados.map((t) => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
            )}
            {proyecto.materialesUsados?.length > 0 && (
              <div className="detail-tags-group">
                <h4>Materiales</h4>
                <div className="tags">
                  {proyecto.materialesUsados.map((m) => <span key={m} className="tag">{m}</span>)}
                </div>
              </div>
            )}
            <a className="btn btn-whatsapp detail-cta" href={whatsappUrl(mensaje)} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={18} /> Quiero algo así
            </a>
          </aside>
        </div>
      </div>

      {/* CTA sticky en móvil */}
      <a className="sticky-cta" href={whatsappUrl(mensaje)} target="_blank" rel="noopener noreferrer">
        <MessageCircle size={20} /> Cotizar un proyecto así
      </a>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" aria-label="Cerrar"><X size={32} /></button>
          {galeria.length > 1 && (
            <button className="lightbox-nav left" aria-label="Anterior"
              onClick={(e) => { e.stopPropagation(); moverLightbox(-1); }}>
              <ChevronLeft size={40} />
            </button>
          )}
          <img src={resolveImg(galeria[lightbox])} alt={proyecto.nombre} onClick={(e) => e.stopPropagation()} />
          {galeria.length > 1 && (
            <button className="lightbox-nav right" aria-label="Siguiente"
              onClick={(e) => { e.stopPropagation(); moverLightbox(1); }}>
              <ChevronRight size={40} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
