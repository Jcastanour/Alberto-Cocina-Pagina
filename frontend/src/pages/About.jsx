import React from 'react';
import { Link } from 'react-router-dom';
import { informacionPersonal } from '../data';

const About = () => {
  return (
    <div className="page-wrapper animate-fade-in">
      <div className="container">
        <div className="about-grid about-page-grid">
          <div className="about-text">
            <h1 className="section-title section-title-left">Trayectoria y profesionalismo</h1>
            <p className="about-quote">
              "Nuestro objetivo no es solo construir un espacio, es asegurar tu inversión y tranquilidad a largo plazo."
            </p>
            <p>
              Somos <strong>A&amp;C Obras y Diseños</strong>, liderados por <strong>{informacionPersonal.autor}</strong>,
              con más de {informacionPersonal.experienciaAnios} años transformando espacios residenciales en {informacionPersonal.ubicacion}.
            </p>
            <p>
              Diseñamos, fabricamos e instalamos cocinas, closets, escritorios y soluciones de decoración a la medida.
              Trabajamos de la mano de propietarios, administraciones y diseñadores, con respeto por los cronogramas,
              pulcritud en obra y garantía sobre cada acabado.
            </p>

            <div className="about-stats">
              <div className="stat-item">
                <div className="stat-number">{informacionPersonal.experienciaAnios}</div>
                <div className="stat-label">Años de experiencia</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">Hecho a la medida</div>
              </div>
            </div>

            <Link to="/contacto" className="btn btn-primary" style={{ marginTop: '2.5rem' }}>
              Hablemos de tu proyecto
            </Link>
          </div>
          <div className="about-image">
            <img
              src="https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&q=80&w=900"
              alt="Espacio diseñado a la medida"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
