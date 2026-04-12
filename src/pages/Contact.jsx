import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { informacionPersonal } from '../data';

const Contact = () => {
  const openWhatsApp = () => {
    const url = `https://wa.me/${informacionPersonal.celular.replace('+', '')}?text=${encodeURIComponent(informacionPersonal.mensajeWhatsApp)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ paddingTop: '100px', backgroundColor: 'var(--bg-tertiary)', minHeight: '100vh' }}>
      <div className="container">
        <div className="contact-card" style={{ marginBottom: '6rem' }}>
          <h1 className="contact-title">Inicie su Proyecto Hoy</h1>
          <p className="contact-text">
            Solicite una visita técnica presencial. Evaluaremos los requerimientos de su espacio, medidas exactas y viabilidad estructural para presentarle una cotización honesta y competitiva.
          </p>

          <div className="contact-info" style={{ gap: '4rem' }}>
            <div className="contact-item">
              <div className="contact-item-icon">
                <Phone size={28} />
              </div>
              <span className="contact-item-value" style={{ fontSize: '1.2rem' }}>{informacionPersonal.celular}</span>
              <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Llamadas y WhatsApp</span>
            </div>
            
            <div className="contact-item">
              <div className="contact-item-icon">
                <Mail size={28} />
              </div>
              <span className="contact-item-value" style={{ fontSize: '1.2rem' }}>{informacionPersonal.correo}</span>
              <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Envíenos sus planos</span>
            </div>
            
            <div className="contact-item">
              <div className="contact-item-icon">
                <MapPin size={28} />
              </div>
              <span className="contact-item-value" style={{ fontSize: '1.2rem' }}>{informacionPersonal.ubicacion}</span>
              <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Cobertura Presencial</span>
            </div>
          </div>

          <button className="btn btn-whatsapp" onClick={openWhatsApp} style={{ marginTop: '2rem', padding: '1.2rem 3rem', fontSize: '1.125rem' }}>
            Abrir chat directo con Alberto
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
