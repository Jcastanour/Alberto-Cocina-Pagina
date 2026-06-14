import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ChevronRight, Award, Map, ShieldCheck, Clock, Cpu } from 'lucide-react';
import { informacionPersonal, roboticaInfo } from '../data';
import { getProyectos } from '../api';
import { whatsappUrl } from '../utils';
import ProyectoCard from '../components/ProyectoCard';

const Home = () => {
  const [recientes, setRecientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProyectos()
      .then((data) => setRecientes(data.slice(0, 3)))
      .catch(() => setRecientes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      {/* HERO */}
      <section className="hero">
        <img
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1600"
          alt="Cocina integral terminada"
          className="hero-image"
        />
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <p className="hero-eyebrow">A&amp;C Obras y Diseños</p>
            <h1 className="hero-title">{informacionPersonal.tagline}</h1>
            <p className="hero-subtitle">{informacionPersonal.subtitulo}</p>
            <div className="hero-location">
              <MapPin size={22} />
              <span>{informacionPersonal.ubicacion}</span>
            </div>
            <div className="hero-actions">
              <a className="btn btn-whatsapp" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
                Cotizar mi proyecto <ChevronRight size={20} />
              </a>
              <Link to="/proyectos" className="btn btn-outline-light">
                Ver proyectos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ABOUT */}
      <section className="about" style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div className="about-grid home-about">
            <div className="about-text">
              <h2 className="section-title section-title-left">Diseñamos, fabricamos e instalamos</h2>
              <p>
                Con más de {informacionPersonal.experienciaAnios} años transformando espacios en {informacionPersonal.ubicacion},
                convertimos cada cocina, closet o escritorio en una solución a la medida — con buenos materiales,
                acabados pulcros y cumplimiento.
              </p>
              <Link to="/nosotros" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Conocer más
              </Link>
            </div>
            <div className="about-stats home-stats">
              <div className="stat-item">
                <div className="stat-number">{informacionPersonal.experienciaAnios}</div>
                <div className="stat-label">Años de experiencia</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">A la medida</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT PROJECTS */}
      <section className="portfolio" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <div className="container">
          <div className="section-head">
            <h2 className="section-title section-title-left" style={{ marginBottom: 0 }}>Proyectos recientes</h2>
            <Link to="/proyectos" className="link-more">
              Ver todos <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="gallery-grid">
              {[1, 2, 3].map((i) => <div key={i} className="gallery-item skeleton" />)}
            </div>
          ) : recientes.length > 0 ? (
            <div className="gallery-grid">
              {recientes.map((p) => <ProyectoCard key={p.id} proyecto={p} />)}
            </div>
          ) : (
            <p className="empty-state">Pronto publicaremos nuestros proyectos aquí.</p>
          )}
        </div>
      </section>

      {/* ROBÓTICA TEASER */}
      <section className="robotica-teaser">
        <div className="container robotica-teaser-inner">
          <div className="robotica-teaser-icon"><Cpu size={36} /></div>
          <div className="robotica-teaser-text">
            <span className="eyebrow">Nueva línea</span>
            <h3>{roboticaInfo.titulo}</h3>
            <p>{roboticaInfo.descripcion}</p>
          </div>
          <Link to="/robotica" className="btn btn-primary">Conocer la línea</Link>
        </div>
      </section>

      {/* TRUST */}
      <section className="trust">
        <div className="container">
          <div className="trust-grid">
            <div>
              <div className="trust-icon"><Award size={38} /></div>
              <h4 className="trust-title">+{informacionPersonal.experienciaAnios.replace('+', '')} Años</h4>
              <p className="trust-desc">Experiencia y trayectoria.</p>
            </div>
            <div>
              <div className="trust-icon"><Map size={38} /></div>
              <h4 className="trust-title">Cobertura</h4>
              <p className="trust-desc">Medellín y Área Metropolitana.</p>
            </div>
            <div>
              <div className="trust-icon"><ShieldCheck size={38} /></div>
              <h4 className="trust-title">Calidad</h4>
              <p className="trust-desc">Materiales y acabados garantizados.</p>
            </div>
            <div>
              <div className="trust-icon"><Clock size={38} /></div>
              <h4 className="trust-title">Cumplimiento</h4>
              <p className="trust-desc">Entregas según lo acordado.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
