import { Icon, type IconName } from "@/components/ui/icon";
import { RevealOnView } from "@/components/marketing/v2/reveal";
import { PRICING } from "@/lib/constants";

// Sección #como-funciona: una sola línea de tiempo (de la llamada al sistema completo) y las dos
// columnas "Lo que hacemos nosotros" / "Lo que ponés vos". Fusiona el antiguo "Paso a paso" con
// "Implementación". Los plazos salen de PRICING; se dicen en días para no repetir el titular.

type Milestone = { when: string; title: string; desc: string; icon: IconName; accent?: boolean };

const menuDay = Math.ceil(PRICING.delivery.menuHours / 24);

const milestones: Milestone[] = [
  {
    when: "Día 0",
    title: "Hablamos y arrancamos",
    desc: "Por WhatsApp elegís el plan, pagás la implementación y nos pasás el menú, las fotos y el logo.",
    icon: "phone",
  },
  {
    when: `Día ${menuDay}`,
    title: "Tu carta, en línea",
    desc: "Publicada con tu marca, en español e inglés, y con un QR provisional para usarla ese mismo día.",
    icon: "qr",
    accent: true,
  },
  {
    when: "Días 3 a 5",
    title: "Tus stands, impresos",
    desc: "Diseñamos e imprimimos los stands QR en 3D y grabamos las tarjetas NFC con tu logo.",
    icon: "printer",
  },
  {
    when: `Día ${PRICING.delivery.fullSystemDays}`,
    title: "Sistema completo",
    desc: "Solo en Estándar y Empresarial: pedidos desde la mesa, panel de comandas y reportes, con tu equipo capacitado.",
    icon: "receipt",
    accent: true,
  },
];

const ours = [
  "Diseñamos, cargamos y traducimos tu carta con tus fotos y precios.",
  "Imprimimos y programamos el hardware de mesa.",
  "Montamos pedidos, panel y reportes y capacitamos a tu equipo (Estándar y Empresarial).",
  "Seguimos con vos por WhatsApp mientras tengás el plan.",
];

const yours = [
  "Tu menú con precios: foto, PDF o escrito a mano.",
  "Fotos de tus platillos y tu logo (sin logo, usamos tu nombre).",
  "Cuántas mesas tenés, para saber cuántos stands hacer.",
  "Internet en el local solo si vas a recibir pedidos en cocina.",
];

export function ImplementationSection() {
  return (
    <section id="como-funciona" className="scroll-mt-24 border-b border-stone-200/60 bg-cream-50">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-28">
        <RevealOnView className="max-w-2xl">
          <div className="reveal-up">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">Cómo funciona</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight text-brand-900">
              De la llamada a tu carta publicada, con fechas
            </h2>
            <p className="mt-5 text-base font-medium leading-relaxed text-brand-800/80">
              Vos seguís atendiendo tu local; nosotros hacemos el resto. El reloj corre desde que
              tenemos el pago de la implementación, el menú, las fotos y el logo.
            </p>
          </div>
        </RevealOnView>

        {/* Línea de tiempo */}
        <RevealOnView className="relative mt-12 sm:mt-14">
          <ol className="relative grid gap-6 lg:grid-cols-4 lg:gap-6">
            <div className="pointer-events-none absolute left-[19px] top-2 h-[calc(100%-1rem)] w-px bg-stone-250 lg:left-0 lg:top-[19px] lg:h-px lg:w-full" aria-hidden="true" />
            {milestones.map((m) => (
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
                  <p className="font-display text-2xl leading-none text-accent-700">{m.when}</p>
                  <h3 className="mt-2 font-display text-xl text-brand-900">{m.title}</h3>
                  <p className="mt-2 max-w-sm text-sm font-medium leading-relaxed text-brand-700/85">{m.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </RevealOnView>

        {/* Dos columnas */}
        <RevealOnView className="mt-10 grid gap-5 sm:mt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="reveal-up relative isolate overflow-hidden rounded-3xl bg-brand-950 p-7 text-cream-100 sm:p-10">
            <div className="qr-grid absolute inset-0 -z-10 opacity-[0.07]" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-300">Lo que hacemos nosotros</p>
            <h3 className="mt-2 font-display text-2xl text-accent-100 sm:text-3xl">Te la montamos, de verdad</h3>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
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
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-700">Lo que ponés vos</p>
            <h3 className="mt-2 font-display text-2xl text-brand-900 sm:text-3xl">Poco, y lo tenés a mano</h3>
            <ul className="mt-6 space-y-3">
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
