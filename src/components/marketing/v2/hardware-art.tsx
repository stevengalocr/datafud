import type { HardwareItem } from "@/lib/constants";

// Ilustraciones SVG de marca para el hardware de mesa mientras no hay fotos reales
// (TODO-FOTO). Todas comparten paleta (verde bosque + oro) y el motivo QR de la marca.
// Van dentro de una caja de tamaño fijo, con aria-hidden: el texto alternativo lo pone
// el contenedor.

const QR = [
  [1, 1, 1, 0, 1, 0, 1, 1, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 0, 0, 1, 1, 1, 1],
  [0, 0, 0, 1, 1, 0, 0, 0, 0],
  [1, 0, 1, 0, 1, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 0, 0],
  [1, 0, 1, 0, 0, 1, 0, 1, 1],
  [1, 1, 1, 0, 1, 1, 0, 1, 0],
];

function QrGlyph({ x, y, size, cell, dark = "#22503a", light = "#fbfaf6" }: { x: number; y: number; size: number; cell?: number; dark?: string; light?: string }) {
  const n = QR.length;
  const c = cell ?? size / n;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={size} height={size} rx={size * 0.06} fill={light} />
      {QR.map((row, r) =>
        row.map((on, col) =>
          on ? <rect key={`${r}-${col}`} x={col * c + c * 0.08} y={r * c + c * 0.08} width={c * 0.84} height={c * 0.84} rx={c * 0.15} fill={dark} /> : null
        )
      )}
    </g>
  );
}

function StandBody({ accent = false }: { accent?: boolean }) {
  return (
    <>
      {/* sombra en la mesa */}
      <ellipse cx="200" cy="262" rx="118" ry="14" fill="#22503a" opacity="0.12" />
      {/* base */}
      <path d="M96 236c0-10 8-18 18-18h172c10 0 18 8 18 18v10c0 6-5 11-11 11H107c-6 0-11-5-11-11v-10z" fill="#1b4030" />
      <path d="M114 218h172c10 0 18 8 18 18v4H96v-4c0-10 8-18 18-18z" fill="#2e6f4e" />
      {/* cuerpo inclinado */}
      <path d="M124 222 148 78c1-7 7-12 14-12h76c7 0 13 5 14 12l24 144H124z" fill="#22503a" />
      <path d="M148 78c1-7 7-12 14-12h76c7 0 13 5 14 12l3 18H145l3-18z" fill="#1b4030" />
      {/* relieve del QR */}
      <QrGlyph x={154} y={100} size={92} light="#f5f3ea" dark="#112a20" />
      {/* franja del logo en relieve */}
      <rect x="166" y="202" width="68" height="8" rx="4" fill={accent ? "#dcb65a" : "#8fc3a8"} opacity="0.9" />
    </>
  );
}

function NfcWaves({ x, y, color = "#b8923f" }: { x: number; y: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round">
      <path d="M0 0a24 24 0 0 1 0 34" />
      <path d="M10-10a40 40 0 0 1 0 54" />
      <path d="M20-20a56 56 0 0 1 0 74" />
    </g>
  );
}

export function StandQrArt() {
  return (
    <svg viewBox="0 0 400 280" className="h-full w-full" aria-hidden="true" focusable="false">
      <StandBody />
    </svg>
  );
}

export function StandQrNfcArt() {
  return (
    <svg viewBox="0 0 400 280" className="h-full w-full" aria-hidden="true" focusable="false">
      <StandBody accent />
      <circle cx="296" cy="118" r="30" fill="#fbf6ea" stroke="#dcb65a" strokeWidth="2" />
      <NfcWaves x={286} y={101} />
    </svg>
  );
}

export function StandReviewsArt() {
  const stars = [0, 1, 2, 3, 4];
  return (
    <svg viewBox="0 0 400 280" className="h-full w-full" aria-hidden="true" focusable="false">
      <ellipse cx="200" cy="262" rx="130" ry="14" fill="#22503a" opacity="0.12" />
      {/* placa horizontal con dos caras: QR + NFC */}
      <path d="M78 224 96 96c1-8 8-14 16-14h176c8 0 15 6 16 14l18 128H78z" fill="#22503a" />
      <path d="M96 96c1-8 8-14 16-14h176c8 0 15 6 16 14l2 16H94l2-16z" fill="#1b4030" />
      <rect x="70" y="222" width="260" height="22" rx="8" fill="#1b4030" />
      <QrGlyph x={118} y={126} size={76} light="#f5f3ea" dark="#112a20" />
      <circle cx="262" cy="164" r="26" fill="#fbf6ea" stroke="#dcb65a" strokeWidth="2" />
      <NfcWaves x={254} y={149} />
      {/* estrellas doradas */}
      <g transform="translate(120 44)">
        {stars.map((i) => (
          <path
            key={i}
            transform={`translate(${i * 34} 0) scale(1.15)`}
            d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"
            fill="#dcb65a"
          />
        ))}
      </g>
      <text x="200" y="215" textAnchor="middle" fontFamily="var(--font-sans), system-ui, sans-serif" fontSize="9" fontWeight="700" letterSpacing="2" fill="#dcb65a">
        DEJANOS TU RESEÑA
      </text>
    </svg>
  );
}

/** Ilustración por producto (solo para los que no tienen foto real todavía). */
export function HardwareArt({ code }: { code: HardwareItem["code"] }) {
  switch (code) {
    case "stand-qr-3d":
      return <StandQrArt />;
    case "stand-qr-3d-nfc":
      return <StandQrNfcArt />;
    case "stand-resenas":
      return <StandReviewsArt />;
    default:
      return null;
  }
}
