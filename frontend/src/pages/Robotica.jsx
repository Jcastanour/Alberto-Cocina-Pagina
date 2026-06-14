import React from 'react';
import { Cpu, Check, MessageCircle, Cog, Lightbulb, CircuitBoard } from 'lucide-react';
import { roboticaInfo } from '../data';
import { whatsappUrl } from '../utils';

const iconos = [Cog, CircuitBoard, Lightbulb];

const Robotica = () => {
  const mensaje = 'Hola AYC, me interesa la línea de robótica / automatización.';

  return (
    <div className="page-wrapper animate-fade-in">
      <section className="robotica-hero">
        <div className="container">
          <div className="robotica-hero-icon"><Cpu size={44} /></div>
          <span className="eyebrow">{roboticaInfo.tagline}</span>
          <h1>{roboticaInfo.titulo}</h1>
          <p>{roboticaInfo.descripcion}</p>
          <a className="btn btn-whatsapp" href={whatsappUrl(mensaje)} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} /> {roboticaInfo.cta}
          </a>
        </div>
      </section>

      <section className="container robotica-features">
        {roboticaInfo.bullets.map((b, i) => {
          const Icono = iconos[i % iconos.length];
          return (
            <div className="robotica-feature" key={b}>
              <div className="robotica-feature-icon"><Icono size={26} /></div>
              <p>{b}</p>
            </div>
          );
        })}
      </section>

      <section className="container robotica-note">
        <Check size={18} />
        <span>¿Tienes una idea? Cuéntanos y la exploramos juntos.</span>
      </section>
    </div>
  );
};

export default Robotica;
