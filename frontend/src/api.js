// Cliente del backend. La URL base sale de VITE_API_URL:
//   dev:  http://localhost:8000   (default)
//   prod: https://aycobras-api.elixircuentas.com  (o https://api.aycobras.com)

const BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    let detail;
    try {
      detail = (await res.json()).detail;
    } catch {
      /* sin cuerpo JSON */
    }
    throw new Error(detail || `Error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// Resuelve la URL de una imagen: si ya es absoluta (R2) la deja; si es
// relativa (modo local /api/uploads/...) le antepone la base del API.
export function resolveImg(url) {
  if (!url) return "";
  return /^https?:\/\//.test(url) ? url : `${BASE}${url}`;
}

// --- Lectura pública ---
export function getProyectos(categoria) {
  const q = categoria && categoria !== "todas" ? `?categoria=${encodeURIComponent(categoria)}` : "";
  return request(`/api/proyectos${q}`);
}

export function getProyecto(id) {
  return request(`/api/proyectos/${id}`);
}

// --- Admin ---
export function login(password) {
  return request("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
}

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

export function crearProyecto(formData, token) {
  return request("/api/proyectos", { method: "POST", headers: authHeaders(token), body: formData });
}

export function editarProyecto(id, formData, token) {
  return request(`/api/proyectos/${id}`, { method: "PUT", headers: authHeaders(token), body: formData });
}

export function borrarProyecto(id, token) {
  return request(`/api/proyectos/${id}`, { method: "DELETE", headers: authHeaders(token) });
}
