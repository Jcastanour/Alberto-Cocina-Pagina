import React from 'react';

// Marca A&C: casa de líneas + tablón de madera (ocre), inspirada en el logo.
// `variant` cambia los colores para fondos claros u oscuros.
export default function Logo({ size = 36, variant = 'dark' }) {
  const stroke = variant === 'light' ? '#F4EEE2' : 'var(--charcoal)';
  const wood = 'var(--accent-wood)';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Contorno de la casa */}
      <path
        d="M14 30 L32 14 L50 30 L50 50 L14 50 Z"
        stroke={stroke}
        strokeWidth="4.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Tablón de madera */}
      <rect x="26" y="34" width="22" height="16" rx="1.5" fill={wood} />
    </svg>
  );
}
