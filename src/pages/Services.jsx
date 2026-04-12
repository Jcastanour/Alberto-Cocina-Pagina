import React from 'react';
import { ChefHat, Home, PaintRoller, Grid, Droplets, Layers, Hammer, Wrench } from 'lucide-react';
import { servicios } from '../data';

const getIconComponent = (iconName) => {
  const icons = {
    ChefHat: <ChefHat size={32} />,
    Home: <Home size={32} />,
    PaintRoller: <PaintRoller size={32} />,
    Grid: <Grid size={32} />,
    Droplets: <Droplets size={32} />,
    Layers: <Layers size={32} />,
    Hammer: <Hammer size={32} />,
    Wrench: <Wrench size={32} />
  };
  return icons[iconName] || <Wrench size={32} />;
};

const Services = () => {
  return (
    <div className="page-wrapper animate-fade-in" style={{ paddingTop: '100px', backgroundColor: 'var(--bg-tertiary)', minHeight: '100vh' }}>
      <div className="container">
        <h1 className="section-title">Especialidades e Intervenciones</h1>
        <p className="section-subtitle" style={{ marginBottom: '4rem' }}>
          Atención integral a cada detalle constructivo y estético de su proyecto, desde la etapa de demolición hasta los acabados finales y entregas llaves en mano.
        </p>
        
        <div className="services-grid" style={{ marginBottom: '6rem' }}>
          {servicios.map((servicio) => (
            <div className="service-card" key={servicio.id}>
              <div className="service-icon">
                {getIconComponent(servicio.icono)}
              </div>
              <h3 className="service-title">{servicio.titulo}</h3>
              <p className="service-desc">{servicio.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
