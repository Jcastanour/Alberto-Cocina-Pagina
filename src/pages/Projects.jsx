import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { categoriasProyectos, proyectos } from '../data';

const Projects = () => {
  const [activeCategory, setActiveCategory] = useState('todas');

  const filteredProjects = activeCategory === 'todas' 
    ? proyectos 
    : proyectos.filter(p => p.categoria === activeCategory);

  return (
    <div className="page-wrapper animate-fade-in" style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        <h1 className="section-title">Portafolio de Proyectos</h1>
        <p className="section-subtitle" style={{ marginBottom: '4rem' }}>
          Explore nuestra galería de obras completadas. Cada proyecto es un reflejo de nuestro compromiso con la calidad y la excelencia arquitectónica.
        </p>
        
        <div className="filters">
          {categoriasProyectos.map(cat => (
            <button 
              key={cat.id} 
              className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="gallery-grid" style={{ marginBottom: '6rem' }}>
          {filteredProjects.map((proyecto) => (
            <div className="gallery-item project-card-detailed" key={proyecto.id}>
              <img 
                src={proyecto.imagenPrincipal} 
                alt={proyecto.nombre} 
                className="gallery-img" 
              />
              <div className="project-info-overlay">
                <div className="project-header">
                  <h3 className="project-title">{proyecto.nombre}</h3>
                  {proyecto.estado === 'en proceso' && <span className="badge-process">En Proceso</span>}
                </div>
                
                <div className="project-meta">
                  <span className="meta-item"><MapPin size={14} /> {proyecto.ciudad}</span>
                  <span className="meta-separator">•</span>
                  <span className="meta-item">{proyecto.año}</span>
                </div>
                
                <p className="project-desc">{proyecto.descripcionCorta}</p>
                
                <div className="project-details">
                  <div className="detail-group">
                    <strong>Trabajos:</strong> {proyecto.trabajosRealizados.join(', ')}
                  </div>
                  <div className="detail-group">
                    <strong>Materiales:</strong> {proyecto.materialesUsados.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredProjects.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              Aún no hay proyectos en esta categoría.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
