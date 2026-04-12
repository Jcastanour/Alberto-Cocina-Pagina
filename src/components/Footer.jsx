import React from 'react';
import { informacionPersonal } from '../data';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-area">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3 className="footer-title">{informacionPersonal.nombre}</h3>
            <p className="footer-subtitle">Contratista Independiente</p>
            <p className="footer-about">
              Más de 30 años de experiencia transformando espacios con calidad, garantía y cumplimiento en Medellín y el Área Metropolitana.
            </p>
          </div>
          
          <div className="footer-links">
            <h4 className="footer-heading">Enlaces Rápidos</h4>
            <ul>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/proyectos">Proyectos</Link></li>
              <li><Link to="/servicios">Servicios</Link></li>
              <li><Link to="/nosotros">Nosotros</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4 className="footer-heading">Contacto Directo</h4>
            <div className="footer-contact-item">
              <Phone size={18} />
              <span>{informacionPersonal.celular}</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={18} />
              <span>{informacionPersonal.correo}</span>
            </div>
            <div className="footer-contact-item">
              <MapPin size={18} />
              <span>{informacionPersonal.ubicacion}</span>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} {informacionPersonal.nombre}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
