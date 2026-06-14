import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { whatsappUrl } from '../utils';
import Logo from './Logo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Proyectos', path: '/proyectos' },
    { name: 'Servicios', path: '/servicios' },
    { name: 'Robótica', path: '/robotica' },
    { name: 'Nosotros', path: '/nosotros' },
    { name: 'Contacto', path: '/contacto' },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);
  const isActive = (path) => (location.pathname === path ? 'active-link' : '');

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-logo" onClick={() => setIsOpen(false)}>
          <Logo size={34} />
          <span className="nav-logo-text">
            A&amp;C <span className="nav-logo-sub">Obras y Diseños</span>
          </span>
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
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp nav-btn"
          >
            Cotizar
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Menú">
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
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-nav-link mobile-nav-cta"
            onClick={toggleMenu}
          >
            Cotizar por WhatsApp
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
