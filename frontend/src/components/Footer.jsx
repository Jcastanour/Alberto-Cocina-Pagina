import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, MessageCircle } from 'lucide-react';
import { informacionPersonal } from '../data';
import { whatsappUrl } from '../utils';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="footer-area">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <Logo size={40} variant="light" />
              <div>
                <h3 className="footer-title">A&amp;C Obras y Diseños</h3>
                <p className="footer-subtitle">{informacionPersonal.tagline}</p>
              </div>
            </div>
            <p className="footer-about">
              Más de {informacionPersonal.experienciaAnios} años transformando espacios en {informacionPersonal.ubicacion}:
              cocinas, closets, escritorios y decoración a la medida.
            </p>
          </div>

          <div className="footer-links">
            <h4 className="footer-heading">Enlaces</h4>
            <ul>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/proyectos">Proyectos</Link></li>
              <li><Link to="/servicios">Servicios</Link></li>
              <li><Link to="/robotica">Robótica</Link></li>
              <li><Link to="/nosotros">Nosotros</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4 className="footer-heading">Contacto</h4>
            <a className="footer-contact-item" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={18} />
              <span>WhatsApp directo</span>
            </a>
            <div className="footer-contact-item">
              <Phone size={18} />
              <span>314 644 1864</span>
            </div>
            <div className="footer-contact-item">
              <MapPin size={18} />
              <span>{informacionPersonal.ubicacion}</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} A&amp;C Obras y Diseños · {informacionPersonal.autor}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
