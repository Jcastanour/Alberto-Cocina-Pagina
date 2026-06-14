import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Hammer, Laptop, Lightbulb, PaintRoller, Wrench, MessageCircle } from 'lucide-react';
import { servicios } from '../data';
import { whatsappUrl } from '../utils';

const ICONS = { ChefHat, Hammer, Laptop, Lightbulb, PaintRoller, Wrench };

const getIcon = (name) => {
  const Icon = ICONS[name] || Wrench;
  return <Icon size={30} />;
};

const Services = () => {
  return (
    <div className="page-wrapper animate-fade-in" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
      <div className="container">
        <h1 className="section-title">Nuestros servicios</h1>
        <p className="section-subtitle">
          Diseñamos, fabricamos e instalamos. Acompañamos tu proyecto de principio a fin.
        </p>

        <div className="services-grid">
          {servicios.map((servicio) => (
            <div className="service-card" key={servicio.id}>
              <div className="service-icon">{getIcon(servicio.icono)}</div>
              <h3 className="service-title">{servicio.titulo}</h3>
              <p className="service-desc">{servicio.descripcion}</p>
            </div>
          ))}
        </div>

        <div className="services-cta">
          <h3>¿Tienes un espacio en mente?</h3>
          <a className="btn btn-whatsapp" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} /> Cuéntanos tu proyecto
          </a>
          <Link to="/proyectos" className="btn btn-primary">Ver proyectos</Link>
        </div>
      </div>
    </div>
  );
};

export default Services;
