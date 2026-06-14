import React, { useEffect, useRef, useState } from 'react';
import { Trash2, Pencil, LogOut, X, Star, ImagePlus, Clipboard, Sparkles, GripVertical } from 'lucide-react';
import { categoriasProyectos } from '../data';
import { plantillaPara } from '../templates';
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

let _idSeq = 0;
const uid = () => `img-${Date.now()}-${_idSeq++}`;

const Admin = () => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [proyectos, setProyectos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  // Lista única y ordenada de imágenes. La PRIMERA es la principal.
  // Cada ítem: { id, kind:'new'|'existing', file?, url?, previewUrl? }
  const [imagenes, setImagenes] = useState([]);
  const imagenesRef = useRef(imagenes);
  imagenesRef.current = imagenes;

  const [dragId, setDragId] = useState(null);
  const [dropActive, setDropActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const cargar = () => getProyectos().then(setProyectos).catch(() => {});
  useEffect(() => { if (token) cargar(); }, [token]);

  // Pegar (Ctrl/Cmd+V) imágenes desde el portapapeles, en cualquier parte del panel.
  useEffect(() => {
    if (!token) return;
    const onPaste = (e) => {
      const items = e.clipboardData?.items || [];
      const files = [];
      for (const it of items) {
        if (it.type && it.type.startsWith('image/')) {
          const f = it.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length) { e.preventDefault(); addFiles(files); }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [token]);

  // Liberar object URLs al desmontar.
  useEffect(() => () => {
    imagenesRef.current.forEach((it) => {
      if (it.kind === 'new' && it.previewUrl) URL.revokeObjectURL(it.previewUrl);
    });
  }, []);

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

  // --- Imágenes ---
  const addFiles = (fileList) => {
    const imgs = Array.from(fileList).filter((f) => f.type && f.type.startsWith('image/'));
    if (!imgs.length) return;
    setImagenes((prev) => [
      ...prev,
      ...imgs.map((f) => ({ id: uid(), kind: 'new', file: f, previewUrl: URL.createObjectURL(f) })),
    ]);
  };

  const quitarImg = (id) => {
    setImagenes((prev) => {
      const it = prev.find((x) => x.id === id);
      if (it?.kind === 'new' && it.previewUrl) URL.revokeObjectURL(it.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  };

  const hacerPrincipal = (id) => {
    setImagenes((prev) => {
      const i = prev.findIndex((x) => x.id === id);
      if (i <= 0) return prev;
      const next = [...prev];
      const [m] = next.splice(i, 1);
      next.unshift(m);
      return next;
    });
  };

  const onDragOverItem = (e, overId) => {
    e.preventDefault();
    if (dragId == null || dragId === overId) return;
    setImagenes((prev) => {
      const from = prev.findIndex((x) => x.id === dragId);
      const to = prev.findIndex((x) => x.id === overId);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const onDropZone = (e) => {
    e.preventDefault();
    setDropActive(false);
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  };

  const srcDe = (it) => (it.kind === 'new' ? it.previewUrl : resolveImg(it.url));

  // --- Form ---
  const onInput = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const usarPlantilla = () => {
    const t = plantillaPara(form.categoria);
    if (form.descripcionCorta.trim() && !window.confirm('¿Reemplazar la descripción actual con la plantilla?')) return;
    setForm((f) => ({
      ...f,
      descripcionCorta: t.descripcion,
      trabajosRealizados: t.trabajos.join(', '),
      materialesUsados: t.materiales.join(', '),
    }));
  };

  const resetForm = () => {
    imagenesRef.current.forEach((it) => {
      if (it.kind === 'new' && it.previewUrl) URL.revokeObjectURL(it.previewUrl);
    });
    setForm(emptyForm);
    setEditId(null);
    setImagenes([]);
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
    const urls = [p.imagenPrincipal, ...(p.fotosGaleria || [])].filter(Boolean);
    setImagenes(urls.map((url) => ({ id: uid(), kind: 'existing', url })));
    setMsg({ type: '', text: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imagenes.length === 0) {
      setMsg({ type: 'error', text: 'Agrega al menos una imagen.' });
      return;
    }
    setLoading(true);
    setMsg({ type: 'info', text: `Subiendo ${imagenes.length} ${imagenes.length === 1 ? 'imagen' : 'imágenes'}…` });

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    const orden = imagenes.map((it) =>
      it.kind === 'existing' ? { type: 'existing', url: it.url } : { type: 'new' }
    );
    fd.append('orden', JSON.stringify(orden));
    imagenes.filter((it) => it.kind === 'new').forEach((it) => fd.append('imagenes', it.file));

    try {
      if (editId) {
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

  // --- Login screen ---
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

  // --- Panel ---
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
          {/* GESTOR DE IMÁGENES */}
          <div>
            <label className="block-label">Fotos del proyecto</label>
            <p className="hint">
              La primera foto es la <strong>principal</strong>. Arrastra para reordenar o pulsa la ⭐ para hacerla principal.
            </p>

            <div
              className={`dropzone ${dropActive ? 'active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDropActive(true); }}
              onDragLeave={() => setDropActive(false)}
              onDrop={onDropZone}
            >
              <ImagePlus size={30} />
              <p className="dropzone-title">Arrastra fotos aquí, pégalas o selecciónalas</p>
              <p className="dropzone-hint">
                <Clipboard size={14} /> Pega con <strong>Ctrl/Cmd + V</strong> las fotos que te llegan por WhatsApp
              </p>
              <label className="btn btn-primary dropzone-btn">
                Seleccionar fotos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
                />
              </label>
            </div>

            {imagenes.length > 0 && (
              <div className="img-manager">
                <div className="img-count">{imagenes.length} {imagenes.length === 1 ? 'foto' : 'fotos'}</div>
                <div className="img-grid">
                  {imagenes.map((it, idx) => (
                    <div
                      key={it.id}
                      className={`img-tile ${idx === 0 ? 'is-main' : ''} ${dragId === it.id ? 'dragging' : ''}`}
                      draggable
                      onDragStart={() => setDragId(it.id)}
                      onDragOver={(e) => onDragOverItem(e, it.id)}
                      onDragEnd={() => setDragId(null)}
                    >
                      <img src={srcDe(it)} alt="" />
                      {idx === 0 && <span className="img-main-badge">Principal</span>}
                      <span className="img-drag-handle"><GripVertical size={16} /></span>
                      <div className="img-actions">
                        {idx !== 0 && (
                          <button type="button" title="Hacer principal" onClick={() => hacerPrincipal(it.id)}>
                            <Star size={15} />
                          </button>
                        )}
                        <button type="button" title="Quitar" className="danger" onClick={() => quitarImg(it.id)}>
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CAMPOS */}
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

          <div className="field">
            <div className="label-row">
              <label>Descripción</label>
              <button type="button" className="btn-template" onClick={usarPlantilla}>
                <Sparkles size={15} /> Usar plantilla
              </button>
            </div>
            <textarea name="descripcionCorta" value={form.descripcionCorta} onChange={onInput} required
              placeholder="Breve resumen del proyecto… (o usa una plantilla y ajústala)" />
          </div>

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

          <div className="admin-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando…' : editId ? 'Guardar cambios' : 'Publicar proyecto'}
            </button>
            {editId && <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancelar edición</button>}
          </div>
        </form>

        {/* LISTA */}
        <div className="admin-list">
          <h2 className="section-title section-title-left">Proyectos publicados ({proyectos.length})</h2>
          {proyectos.length === 0 && <p className="empty-state">Aún no hay proyectos. ¡Crea el primero!</p>}
          {proyectos.map((p) => (
            <div className="admin-row" key={p.id}>
              <img src={resolveImg(p.imagenPrincipal)} alt={p.nombre} />
              <div className="admin-row-info">
                <strong>{p.nombre}</strong>
                <span>{p.ciudad} · {p.año} · {p.categoria} · {(p.fotosGaleria?.length || 0) + 1} fotos</span>
              </div>
              <div className="admin-row-actions">
                <button className="icon-btn" onClick={() => startEdit(p)} title="Editar"><Pencil size={18} /></button>
                <button className="icon-btn danger" onClick={() => handleDelete(p)} title="Borrar"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="admin-overlay">
          <div className="spinner" />
          <p>{msg.text || 'Guardando…'}</p>
        </div>
      )}
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
