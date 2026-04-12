import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, HardHat } from 'lucide-react';
import { informacionPersonal } from '../data';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Proyectos', path: '/proyectos' },
    { name: 'Servicios', path: '/servicios' },
    { name: 'Nosotros', path: '/nosotros' },
    { name: 'Contacto', path: '/contacto' },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path) => {
    return location.pathname === path ? 'active-link' : '';
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <HardHat size={28} className="nav-logo-icon" />
          <span className="nav-logo-text">{informacionPersonal.nombre}</span>
        </Link>

        {/* Desktop Menu */}
        <div className="nav-links desktop-menu">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`nav-link ${isActive(link.path)}`}
            >
              {link.name}
            </Link>
          ))}
          <a 
            href={`https://wa.me/${informacionPersonal.celular.replace('+', '')}?text=${encodeURIComponent(informacionPersonal.mensajeWhatsApp)}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary nav-btn"
          >
            Cotizar
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`mobile-nav-link ${isActive(link.path)}`}
              onClick={toggleMenu}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
