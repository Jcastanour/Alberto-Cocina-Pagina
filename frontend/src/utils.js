import { informacionPersonal } from "./data";

// Construye el enlace de WhatsApp con mensaje opcional.
export function whatsappUrl(mensaje) {
  const numero = informacionPersonal.celular.replace(/[^0-9]/g, "");
  const texto = encodeURIComponent(mensaje || informacionPersonal.mensajeWhatsApp);
  return `https://wa.me/${numero}?text=${texto}`;
}
