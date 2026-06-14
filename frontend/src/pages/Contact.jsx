import React from 'react';
import { Phone, MapPin, MessageCircle, Clock } from 'lucide-react';
import { informacionPersonal } from '../data';
import { whatsappUrl } from '../utils';

const Contact = () => {
  return (
    <div className="page-wrapper animate-fade-in" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
      <div className="container">
        <div className="contact-card">
          <h1 className="contact-title">Inicia tu proyecto hoy</h1>
          <p className="contact-text">
            Escríbenos por WhatsApp y cuéntanos qué espacio quieres transformar. Coordinamos una visita,
            tomamos medidas y te presentamos una cotización honesta y clara.
          </p>

          <div className="contact-info">
            <div className="contact-item">
              <div className="contact-item-icon"><Phone size={26} /></div>
              <span className="contact-item-value">314 644 1864</span>
              <span className="contact-item-sub">Llamadas y WhatsApp</span>
            </div>
            <div className="contact-item">
              <div className="contact-item-icon"><MapPin size={26} /></div>
              <span className="contact-item-value">{informacionPersonal.ubicacion}</span>
              <span className="contact-item-sub">Cobertura presencial</span>
            </div>
            <div className="contact-item">
              <div className="contact-item-icon"><Clock size={26} /></div>
              <span className="contact-item-value">Lun – Sáb</span>
              <span className="contact-item-sub">Respuesta rápida</span>
            </div>
          </div>

          <a className="btn btn-whatsapp contact-main-btn" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={20} /> Abrir chat directo
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
