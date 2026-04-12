import React from 'react';
import { informacionPersonal } from '../data';

const About = () => {
  return (
    <div className="page-wrapper animate-fade-in" style={{ paddingTop: '100px', backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div className="container">
        <div className="about-grid" style={{ marginBottom: '6rem' }}>
          <div className="about-text">
            <h1 className="section-title" style={{textAlign: 'left'}}>Trayectoria y Profesionalismo</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '1.5rem', fontWeight: 500 }}>
              "Mi objetivo no es solo construir un espacio, es asegurar su inversión y tranquilidad a largo plazo."
            </p>
            <p>
              Soy <strong>Alberto Castaño</strong>, contratista certificado e independiente registrado en el RUT desde el 2001, enfocado en atender las necesidades de remodelación civil y diseño interior en el sector residencial de Medellín y sus alrededores.
            </p>
            <p>
              Con más de tres décadas trabajando de la mano de propietarios, administraciones y diseñadores, he consolidado un equipo humano y una metodología de trabajo basada en el respeto por los cronogramas, la pulcritud en obra blanca y la garantía absoluta sobre instalaciones hidráulicas, eléctricas y acabados arquitectónicos.
            </p>
            
            <div className="about-stats" style={{ marginTop: '3rem' }}>
              <div className="stat-item">
                <div className="stat-number">{informacionPersonal.experienciaAnios}</div>
                <div className="stat-label">Años de experiencia demostrable</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">Cumplimiento en obra</div>
              </div>
            </div>
          </div>
          <div className="about-image" style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
            <img 
              src="https://images.unsplash.com/photo-1541888081622-1d5774a382c4?auto=format&fit=crop&q=80&w=800" 
              alt="Planos y herramientas de arquitectura" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
