import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { categoriasProyectos } from '../data';
import { getProyectos } from '../api';
import ProyectoCard from '../components/ProyectoCard';

const Projects = () => {
  const [activeCategory, setActiveCategory] = useState('todas');
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = () => {
    setLoading(true);
    setError(null);
    getProyectos()
      .then(setProyectos)
      .catch((e) => setError(e.message || 'No pudimos cargar los proyectos'))
      .finally(() => setLoading(false));
  };

  useEffect(cargar, []);

  const filtrados =
    activeCategory === 'todas'
      ? proyectos
      : proyectos.filter((p) => p.categoria === activeCategory);

  return (
    <div className="page-wrapper animate-fade-in">
      <div className="container">
        <h1 className="section-title">Portafolio de proyectos</h1>
        <p className="section-subtitle">
          Cocinas, closets, escritorios y decoración. Cada proyecto, hecho a la medida.
        </p>

        <div className="filters">
          {categoriasProyectos.map((cat) => (
            <button
              key={cat.id}
              className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="gallery-grid" style={{ marginBottom: '6rem' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="gallery-item skeleton" />)}
          </div>
        )}

        {error && !loading && (
          <div className="error-state">
            <AlertCircle size={28} />
            <p>{error}</p>
            <button className="btn btn-primary" onClick={cargar}>Reintentar</button>
          </div>
        )}

        {!loading && !error && (
          <div className="gallery-grid" style={{ marginBottom: '6rem' }}>
            {filtrados.map((p) => <ProyectoCard key={p.id} proyecto={p} />)}
            {filtrados.length === 0 && (
              <p className="empty-state">Aún no hay proyectos en esta categoría.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
