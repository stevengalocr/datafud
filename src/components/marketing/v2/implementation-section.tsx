import { Icon, type IconName } from "@/components/ui/icon";
import { RevealOnView } from "@/components/marketing/v2/reveal";
import { PRICING } from "@/lib/constants";

// Sección #implementacion: línea de tiempo día 0 → 48 h → días 2-5 → día 15 y las dos
// columnas "Lo que hacemos nosotros" / "Lo que ponés vos". Los plazos salen de PRICING.delivery.

type Milestone = { when: string; title: string; desc: string; icon: IconName; accent?: boolean };

const milestones: Milestone[] = [
  {
    when: "Día 0",
    title: "Hablamos y arrancamos",
    desc: "Una llamada corta: elegís el plan, pagás la implementación y nos pasás el menú, las fotos y el logo.",
    icon: "phone",
  },
  {
    when: `${PRICING.delivery.menuHours} horas`,
    title: "Tu carta ya está en línea",
    desc: "Carta digital publicada con tu marca y un QR provisional impreso en papel para empezar a usarla ese mismo día.",
    icon: "qr",
    accent: true,
  },
  {
    when: "Días 2 a 5",
    title: "Tu hardware, impreso",
    desc: "Diseñamos e imprimimos los stands QR en 3D y grabamos las tarjetas NFC con tu logo.",
    icon: "printer",
  },
  {
    when: `Día ${PRICING.delivery.fullSystemDays}`,
    title: "Sistema completo y capacitación",
    desc: "Pedidos desde la mesa, panel de comandas y reportes funcionando en tu local. Entregamos el hardware y capacitamos a tu equipo.",
    icon: "check-circle",
    accent: true,
  },
];

const ours = [
  "Diseñamos y cargamos tu carta con tus fotos y precios.",
  "La traducimos a los idiomas de tu plan.",
  "Imprimimos y programamos el hardware de mesa.",
  "Montamos pedidos, panel y reportes (planes Estándar y Empresarial).",
  "Capacitamos a tu equipo en el local o por videollamada.",
  "Te acompañamos por WhatsApp después de la entrega.",
];

const yours = [
  "Tu menú con precios: foto, PDF o escrito a mano, como lo tengas.",
  "Fotos de tus platillos y tu logo (si no tenés logo, usamos tu nombre con la tipografía de tu marca).",
  "Los colores de tu local, para que la carta se sienta tuya.",
  "Cuántas mesas tenés, para saber cuántos stands o tarjetas hacer.",
  "Internet en el local si vas a recibir pedidos en cocina.",
  "Quince minutos para la llamada inicial y una hora para la capacitación.",
];

export function ImplementationSection() {
  return (
    <section id="implementacion" className="scroll-mt-24 border-b border-stone-200/60 bg-cream-50">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-32">
        <RevealOnView className="max-w-2xl">
          <div className="reveal-up">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">Implementación</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight text-brand-900">
              De la llamada a tu carta publicada, con fechas
            </h2>
            <p className="mt-5 text-base font-medium leading-relaxed text-brand-800/80">
              Sin sorpresas: esto es lo que pasa después de que decís que sí. Con el plan Carta
              terminás en las primeras {PRICING.delivery.menuHours} horas; con pedidos en mesa, el
              sistema completo queda en {PRICING.delivery.fullSystemDays} días.
            </p>
          </div>
        </RevealOnView>

        {/* Línea de tiempo */}
        <RevealOnView className="relative mt-14 sm:mt-16">
          <ol className="relative grid gap-10 lg:grid-cols-4 lg:gap-6">
            {/* riel */}
            <div className="pointer-events-none absolute left-[19px] top-2 h-[calc(100%-1rem)] w-px bg-stone-250 lg:left-0 lg:top-[19px] lg:h-px lg:w-full" aria-hidden="true" />
            {milestones.map((m, i) => (
              <li key={m.when} className="reveal-up relative flex gap-5 lg:flex-col lg:gap-0">
                <span
                  className={
                    m.accent
                      ? "relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-accent-300 bg-brand-600 text-white shadow-md"
                      : "relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-stone-250 bg-white text-brand-700 shadow-sm"
                  }
                >
                  <Icon name={m.icon} size={17} />
                </span>
                <div className="lg:mt-6 lg:pr-6">
                  <p className="flex items-baseline gap-2">
                    <span className="font-display text-2xl leading-none text-accent-700">{m.when}</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700/75">Paso {i + 1}</span>
                  </p>
                  <h3 className="mt-2 font-display text-xl text-brand-900">{m.title}</h3>
                  <p className="mt-2 max-w-sm text-sm font-medium leading-relaxed text-brand-700/80">{m.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </RevealOnView>

        {/* Dos columnas */}
        <RevealOnView className="mt-16 grid gap-6 sm:mt-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="reveal-up relative isolate overflow-hidden rounded-3xl bg-brand-950 p-7 text-cream-100 sm:p-10">
            <div className="qr-grid absolute inset-0 -z-10 opacity-[0.07]" />
            <div className="pointer-events-none absolute -left-20 -top-20 -z-10 h-64 w-64 rounded-full bg-accent-500/10 blur-3xl" />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent-300">Lo que hacemos nosotros</p>
            <h3 className="mt-2 font-display text-2xl text-accent-100 sm:text-3xl">Llave en mano, de verdad</h3>
            <ul className="mt-7 space-y-4">
              {ours.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm font-medium leading-relaxed text-cream-100/85 sm:text-[15px]">
                  <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent-500/20 text-accent-300">
                    <Icon name="check" size={12} />
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal-up rounded-3xl border border-stone-200/80 bg-white p-7 sm:p-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent-700">Lo que ponés vos</p>
            <h3 className="mt-2 font-display text-2xl text-brand-900 sm:text-3xl">Poco, y lo tenés a mano</h3>
            <ul className="mt-7 space-y-4">
              {yours.map((t, i) => (
                <li key={t} className="flex items-start gap-4 text-sm font-medium leading-relaxed text-brand-800/85 sm:text-[15px]">
                  <span className="font-display text-lg leading-none text-accent-700">{String(i + 1).padStart(2, "0")}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </RevealOnView>
      </div>
    </section>
  );
}
