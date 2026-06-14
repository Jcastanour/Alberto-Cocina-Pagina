import React, { useEffect, useState } from 'react';
import { Trash2, Pencil, LogOut, X, Plus } from 'lucide-react';
import { categoriasProyectos } from '../data';
import {
  login as apiLogin,
  getProyectos,
  crearProyecto,
  editarProyecto,
  borrarProyecto,
  resolveImg,
} from '../api';

const TOKEN_KEY = 'ayc_admin_token';
const CATS = categoriasProyectos.filter((c) => c.id !== 'todas');

const emptyForm = {
  nombre: '',
  categoria: CATS[0].id,
  ciudad: 'Medellín',
  ano: new Date().getFullYear().toString(),
  tipoCliente: 'Residencial',
  descripcionCorta: '',
  trabajosRealizados: '',
  materialesUsados: '',
  estado: 'terminado',
  observaciones: '',
};

const Admin = () => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [proyectos, setProyectos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [principal, setPrincipal] = useState(null); // File nuevo
  const [galeriaNueva, setGaleriaNueva] = useState([]); // File[]
  const [galeriaKeep, setGaleriaKeep] = useState([]); // urls existentes a conservar (edición)
  const [principalActual, setPrincipalActual] = useState(''); // url existente (edición)

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const cargar = () => getProyectos().then(setProyectos).catch(() => {});
  useEffect(() => { if (token) cargar(); }, [token]);

  // --- Login ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const { token: t } = await apiLogin(password);
      localStorage.setItem(TOKEN_KEY, t);
      setToken(t);
      setPassword('');
    } catch (err) {
      setLoginError(err.message || 'Contraseña incorrecta');
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    resetForm();
  };

  // --- Form ---
  const onInput = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setPrincipal(null);
    setGaleriaNueva([]);
    setGaleriaKeep([]);
    setPrincipalActual('');
  };

  const startEdit = (p) => {
    setEditId(p.id);
    setForm({
      nombre: p.nombre || '',
      categoria: p.categoria || CATS[0].id,
      ciudad: p.ciudad || 'Medellín',
      ano: p.año || '',
      tipoCliente: p.tipoCliente || 'Residencial',
      descripcionCorta: p.descripcionCorta || '',
      trabajosRealizados: (p.trabajosRealizados || []).join(', '),
      materialesUsados: (p.materialesUsados || []).join(', '),
      estado: p.estado || 'terminado',
      observaciones: p.observaciones || '',
    });
    setPrincipal(null);
    setPrincipalActual(p.imagenPrincipal || '');
    setGaleriaKeep(p.fotosGaleria || []);
    setGaleriaNueva([]);
    setMsg({ type: '', text: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editId && !principal) {
      setMsg({ type: 'error', text: 'Selecciona la foto principal.' });
      return;
    }
    setLoading(true);
    setMsg({ type: 'info', text: 'Guardando…' });

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (principal) fd.append('imagenPrincipal', principal);
    galeriaNueva.forEach((f) => fd.append('galeria', f));

    try {
      if (editId) {
        fd.append('fotosGaleriaKeep', JSON.stringify(galeriaKeep));
        await editarProyecto(editId, fd, token);
        setMsg({ type: 'success', text: 'Proyecto actualizado.' });
      } else {
        await crearProyecto(fd, token);
        setMsg({ type: 'success', text: '¡Proyecto publicado!' });
      }
      resetForm();
      cargar();
    } catch (err) {
      if (String(err.message).includes('401')) logout();
      setMsg({ type: 'error', text: `Error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`¿Borrar "${p.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await borrarProyecto(p.id, token);
      cargar();
      if (editId === p.id) resetForm();
    } catch (err) {
      setMsg({ type: 'error', text: `Error al borrar: ${err.message}` });
    }
  };

  // --- Render login ---
  if (!token) {
    return (
      <div className="page-wrapper admin-login-wrap">
        <form className="admin-login" onSubmit={handleLogin}>
          <h1>Panel de administración</h1>
          <p>Ingresa la contraseña para gestionar el portafolio.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            autoFocus
          />
          {loginError && <div className="form-msg error">{loginError}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Entrar</button>
        </form>
      </div>
    );
  }

  // --- Render panel ---
  return (
    <div className="page-wrapper admin-panel">
      <div className="container">
        <div className="admin-head">
          <h1 className="section-title section-title-left" style={{ margin: 0 }}>
            {editId ? 'Editar proyecto' : 'Nuevo proyecto'}
          </h1>
          <button className="btn btn-ghost" onClick={logout}><LogOut size={18} /> Salir</button>
        </div>

        {msg.text && <div className={`form-msg ${msg.type}`}>{msg.text}</div>}

        <form className="admin-form" onSubmit={handleSubmit}>
          {/* Foto principal */}
          <div className="upload-box">
            <label>Foto principal {editId ? '(opcional al editar)' : '(obligatoria)'}</label>
            <input type="file" accept="image/*" onChange={(e) => setPrincipal(e.target.files[0] || null)} />
            {(principal || principalActual) && (
              <img
                className="preview-main"
                src={principal ? URL.createObjectURL(principal) : resolveImg(principalActual)}
                alt="Vista previa"
              />
            )}
          </div>

          <div className="form-grid">
            <Field label="Nombre del proyecto">
              <input name="nombre" value={form.nombre} onChange={onInput} required placeholder="Ej: Cocina integral El Poblado" />
            </Field>
            <Field label="Categoría">
              <select name="categoria" value={form.categoria} onChange={onInput}>
                {CATS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Ciudad / Barrio">
              <input name="ciudad" value={form.ciudad} onChange={onInput} required />
            </Field>
            <Field label="Año">
              <input name="ano" value={form.ano} onChange={onInput} />
            </Field>
            <Field label="Tipo de cliente">
              <input name="tipoCliente" value={form.tipoCliente} onChange={onInput} />
            </Field>
            <Field label="Estado">
              <select name="estado" value={form.estado} onChange={onInput}>
                <option value="terminado">Terminado</option>
                <option value="en proceso">En proceso</option>
              </select>
            </Field>
          </div>

          <Field label="Descripción">
            <textarea name="descripcionCorta" value={form.descripcionCorta} onChange={onInput} required
              placeholder="Breve resumen del proyecto…" />
          </Field>
          <Field label="Trabajos realizados (separados por coma)">
            <input name="trabajosRealizados" value={form.trabajosRealizados} onChange={onInput}
              placeholder="Diseño, Fabricación, Instalación" />
          </Field>
          <Field label="Materiales (separados por coma)">
            <input name="materialesUsados" value={form.materialesUsados} onChange={onInput}
              placeholder="Madera, Mármol, Herrajes" />
          </Field>
          <Field label="Observaciones">
            <input name="observaciones" value={form.observaciones} onChange={onInput} />
          </Field>

          {/* Galería */}
          <div className="upload-box">
            <label>Galería de fotos (varias)</label>
            <input type="file" accept="image/*" multiple
              onChange={(e) => setGaleriaNueva([...galeriaNueva, ...Array.from(e.target.files)])} />
            <div className="preview-grid">
              {galeriaKeep.map((url) => (
                <div className="preview-thumb" key={url}>
                  <img src={resolveImg(url)} alt="" />
                  <button type="button" onClick={() => setGaleriaKeep(galeriaKeep.filter((u) => u !== url))}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              {galeriaNueva.map((file, i) => (
                <div className="preview-thumb nueva" key={i}>
                  <img src={URL.createObjectURL(file)} alt="" />
                  <button type="button" onClick={() => setGaleriaNueva(galeriaNueva.filter((_, j) => j !== i))}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando…' : editId ? 'Guardar cambios' : 'Publicar proyecto'}
            </button>
            {editId && <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancelar edición</button>}
          </div>
        </form>

        {/* Lista de proyectos */}
        <div className="admin-list">
          <h2 className="section-title section-title-left">Proyectos publicados ({proyectos.length})</h2>
          {proyectos.length === 0 && <p className="empty-state">Aún no hay proyectos. ¡Crea el primero!</p>}
          {proyectos.map((p) => (
            <div className="admin-row" key={p.id}>
              <img src={resolveImg(p.imagenPrincipal)} alt={p.nombre} />
              <div className="admin-row-info">
                <strong>{p.nombre}</strong>
                <span>{p.ciudad} · {p.año} · {p.categoria}</span>
              </div>
              <div className="admin-row-actions">
                <button className="icon-btn" onClick={() => startEdit(p)} title="Editar"><Pencil size={18} /></button>
                <button className="icon-btn danger" onClick={() => handleDelete(p)} title="Borrar"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div className="field">
    <label>{label}</label>
    {children}
  </div>
);

export default Admin;
