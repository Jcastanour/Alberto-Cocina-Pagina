import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Services from './pages/Services';
import Robotica from './pages/Robotica';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app">
        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/proyectos" element={<Projects />} />
            <Route path="/proyectos/:id" element={<ProjectDetail />} />
            <Route path="/servicios" element={<Services />} />
            <Route path="/robotica" element={<Robotica />} />
            <Route path="/nosotros" element={<About />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
