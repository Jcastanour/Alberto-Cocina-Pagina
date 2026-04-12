import React from 'react';
import { MapPin, ChevronRight, Award, Map, ShieldCheck, Clock } from 'lucide-react';
import { informacionPersonal, proyectos } from '../data';
import { Link } from 'react-router-dom';

const Home = () => {
  const openWhatsApp = () => {
    const url = `https://wa.me/${informacionPersonal.celular.replace('+', '')}?text=${encodeURIComponent(informacionPersonal.mensajeWhatsApp)}`;
    window.open(url, '_blank');
  };

  // Mostrar solo los últimos 3 proyectos
  const recientes = proyectos.slice(0, 3);

  return (
    <div className="page-wrapper animate-fade-in">
      {/* HERO SECTION */}
      <section className="hero">
        <img 
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1600" 
          alt="Cocina terminada" 
          className="hero-image"
        />
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">{informacionPersonal.nombre}</h1>
            <p className="hero-subtitle">{informacionPersonal.subtitulo}</p>
            <div className="hero-location">
              <MapPin size={24} />
              <span>{informacionPersonal.ubicacion}</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-whatsapp" onClick={openWhatsApp}>
                Cotizar mi proyecto <ChevronRight size={20} />
              </button>
              <Link to="/proyectos" className="btn" style={{ backgroundColor: 'transparent', border: '1px solid white', color: 'white' }}>
                Ver Proyectos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ABOUT */}
      <section className="about" style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="about-grid" style={{ gridTemplateColumns: 'minmax(300px, 1.5fr) 1fr' }}>
            <div className="about-text">
              <h2 className="section-title" style={{textAlign: 'left', marginBottom: '1.5rem'}}>Experiencia que Respalda su Inversión</h2>
              <p>
                Con más de 30 años de trayectoria transformando espacios en Medellín y su Área Metropolitana, mi prioridad absoluta es entregar calidad, cumplimiento y tranquilidad en cada obra.
              </p>
              <Link to="/nosotros" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Conocer más sobre Alberto
              </Link>
            </div>
            <div className="about-stats" style={{ marginTop: 0 }}>
              <div className="stat-item">
                <div className="stat-number">30+</div>
                <div className="stat-label">Años construyendo confianza</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT PROJECTS PEEK */}
      <section className="portfolio" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Proyectos Recientes</h2>
            <Link to="/proyectos" style={{ color: 'var(--accent-wood)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              Ver todos <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="gallery-grid">
            {recientes.map((proyecto) => (
              <div className="gallery-item" key={proyecto.id}>
                <img 
                  src={proyecto.imagenPrincipal} 
                  alt={proyecto.nombre} 
                  className="gallery-img" 
                />
                <div className="gallery-overlay">
                  <h4 className="gallery-title">{proyecto.nombre}</h4>
                  <div className="gallery-location">
                    <MapPin size={16} />
                    {proyecto.ciudad}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="trust">
        <div className="container">
          <div className="trust-grid">
            <div>
              <div className="trust-icon"><Award size={40} /></div>
              <h4 className="trust-title">+30 Años</h4>
              <p className="trust-desc">Experiencia y trayectoria.</p>
            </div>
            <div>
              <div className="trust-icon"><Map size={40} /></div>
              <h4 className="trust-title">Cobertura</h4>
              <p className="trust-desc">Medellín y el Área Metropolitana.</p>
            </div>
            <div>
              <div className="trust-icon"><ShieldCheck size={40} /></div>
              <h4 className="trust-title">Calidad</h4>
              <p className="trust-desc">Cumplimiento ante administraciones.</p>
            </div>
            <div>
              <div className="trust-icon"><Clock size={40} /></div>
              <h4 className="trust-title">Puntualidad</h4>
              <p className="trust-desc">Entregas según cronograma.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
