import React, { useState } from 'react';
import { categoriasProyectos } from '../data';

const Admin = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: categoriasProyectos[1].id, // Default a la primera categoria despues de 'todas'
    ciudad: 'Medellín',
    ano: new Date().getFullYear().toString(),
    tipoCliente: 'Residencial',
    descripcionCorta: '',
    trabajosRealizados: '',
    materialesUsados: '',
    estado: 'terminado',
    observaciones: '',
  });
  
  const [foto, setFoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foto) {
      setMessage({ type: 'error', text: 'Por favor selecciona una foto principal.' });
      return;
    }

    setLoading(true);
    setMessage({ type: 'info', text: 'Subiendo proyecto, por favor espera...' });

    // Preparar FormData para enviar archivos y texto a FastAPI
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    submitData.append('imagenPrincipal', foto);

    try {
      const response = await fetch('http://localhost:8000/api/proyectos', {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `¡Proyecto guardado con éxito! Recarga la página para verlo.` });
        // Limpiar formulario básico
        setFormData({...formData, nombre: '', descripcionCorta: '', trabajosRealizados: '', materialesUsados: ''});
        setFoto(null);
      } else {
        setMessage({ type: 'error', text: `Error: ${result.error || 'Algo salió mal'}` });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Error de conexión. ¿Está corriendo el servidor FastAPI localmente?' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ paddingTop: '100px', backgroundColor: 'var(--bg-tertiary)', minHeight: '100vh', paddingBottom: '6rem' }}>
      <div className="container">
        <div className="contact-card" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left' }}>
          
          <h1 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem' }}>Panel de Administración</h1>
          <p className="section-subtitle" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            Sube nuevos proyectos al portafolio sin tocar código.
          </p>

          {message.text && (
            <div style={{
              padding: '1rem', 
              marginBottom: '2rem', 
              borderRadius: '8px', 
              backgroundColor: message.type === 'error' ? '#FEE2E2' : message.type === 'success' ? '#DCFCE7' : '#DBEAFE',
              color: message.type === 'error' ? '#991B1B' : message.type === 'success' ? '#166534' : '#1E40AF',
              border: `1px solid ${message.type === 'error' ? '#F87171' : message.type === 'success' ? '#4ADE80' : '#60A5FA'}`
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
            
            {/* Foto Principal */}
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '2rem', borderRadius: '8px', border: '1px dashed var(--border-light)' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>1. Foto Principal (Obligatorio)</label>
              <input type="file" accept="image/*" onChange={handleFileChange} required />
              {foto && <p style={{ fontSize: '0.9rem', color: 'var(--accent-wood)', marginTop: '0.5rem' }}>Imagen seleccionada: {foto.name}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {/* Nombre y Categoría */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Nombre del Proyecto</label>
                <input 
                  type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required
                  placeholder="Ej: Cocina Integral El Poblado"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-light)' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Categoría</label>
                <select 
                  name="categoria" value={formData.categoria} onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-light)', backgroundColor: 'white' }}
                >
                  {categoriasProyectos.filter(c => c.id !== 'todas').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Ubicación y Año */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Ciudad / Barrio</label>
                <input 
                  type="text" name="ciudad" value={formData.ciudad} onChange={handleInputChange} required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-light)' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Año de entrega</label>
                <input 
                  type="text" name="ano" value={formData.ano} onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-light)' }} 
                />
              </div>

              {/* Cliente y Estado */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Tipo de Mandante / Cliente</label>
                <input 
                  type="text" name="tipoCliente" value={formData.tipoCliente} onChange={handleInputChange} required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-light)' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Estado de la Obra</label>
                <select 
                  name="estado" value={formData.estado} onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-light)', backgroundColor: 'white' }}
                >
                  <option value="terminado">Terminado</option>
                  <option value="en proceso">En Proceso</option>
                </select>
              </div>
            </div>

            {/* Arrays y Textos largos */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Descripción Corta</label>
              <textarea 
                name="descripcionCorta" value={formData.descripcionCorta} onChange={handleInputChange} required
                placeholder="Breve resumen de la obra y reto principal..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-light)', minHeight: '80px', fontFamily: 'inherit' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Trabajos Realizados (Separados por coma)</label>
              <input 
                type="text" name="trabajosRealizados" value={formData.trabajosRealizados} onChange={handleInputChange}
                placeholder="Ej: Demolición, Pintura, Sistema Eléctrico, Carpintería"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-light)' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Materiales Principales (Separados por coma)</label>
              <input 
                type="text" name="materialesUsados" value={formData.materialesUsados} onChange={handleInputChange}
                placeholder="Ej: Madera Roble, Mármol Carrara, Porcelanato 60x60"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-light)' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Observaciones finales</label>
              <input 
                type="text" name="observaciones" value={formData.observaciones} onChange={handleInputChange}
                placeholder="Ej: Entregado dentro del cronograma sin novedades."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-light)' }} 
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '1.25rem', fontSize: '1.25rem', justifyContent: 'center' }}>
              {loading ? 'Subiendo Proyecto...' : 'Guardar y Publicar Proyecto'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Admin;
