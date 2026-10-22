import { PRICING } from "@/lib/constants";
import { formatCrc } from "@/lib/currency/format";

// Banda de valor entre la portada y «Cómo funciona»: una franja verde oscuro que recibe el final
// de la portada y corre en un carril con lo que ya promete la landing (nada nuevo: plazos,
// idiomas, hardware y precio salen de PRICING y de las secciones de abajo). El carril se pausa
// al pasar el puntero y queda quieto con movimiento reducido (globals.css, .marquee).

const VALORES = [
  `Carta lista en ${PRICING.delivery.menuHours} horas hábiles`,
  "Español e inglés",
  "QR y NFC en la mesa",
  "Sin app ni cuenta para el comensal",
  "Cambios por WhatsApp incluidos",
  "Stands impresos en 3D en Costa Rica",
  `Desde ${formatCrc(PRICING.plans.basico.priceCrc)}/mes`,
];

function Carril({ oculto }: { oculto?: boolean }) {
  return (
    <span aria-hidden={oculto || undefined}>
      {VALORES.map((v) => (
        <span key={v} className="inline-flex items-center gap-6">
          <i className="modulo" aria-hidden="true" />
          <span>{v}</span>
        </span>
      ))}
    </span>
  );
}

export function BandaValor() {
  return (
    <section aria-label="Lo que incluye DataFud" className="banda-valor marquee-host relative overflow-hidden bg-brand-950 py-5 text-cream-100 sm:py-6">
      <div className="qr-grid pointer-events-none absolute inset-0 opacity-[0.07]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-brand-950 to-transparent sm:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-brand-950 to-transparent sm:w-32" />
      <div className="marquee whitespace-nowrap text-xs font-bold uppercase tracking-[0.2em] sm:text-sm" style={{ "--marquee-duration": "52s" } as React.CSSProperties}>
        <Carril />
        <Carril oculto />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-500/60 to-transparent" />
    </section>
  );
}
