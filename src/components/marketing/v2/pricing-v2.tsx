import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { Icon, type IconName } from "@/components/ui/icon";
import { RevealOnView } from "@/components/marketing/v2/reveal";
import { PRICING } from "@/lib/constants";

const plans = [
  {
    code: "basico",
    name: "Básico",
    price: PRICING.plans.basico.priceUsd,
    highlight: false,
    tagline: "Para empezar tu menú digital",
    features: [
      "1 idioma principal",
      "Hasta 20 platillos en total",
      "Órdenes en tiempo real",
      "Reportes básicos de venta",
      "Soporte digital por correo",
    ],
  },
  {
    code: "estandar",
    name: "Estándar",
    price: PRICING.plans.estandar.priceUsd,
    highlight: true,
    tagline: "El favorito de sodas y restaurantes",
    features: [
      "2 idiomas simultáneos",
      "Hasta 70 platillos en total",
      "Órdenes en tiempo real",
      "Reportes y analíticas avanzadas",
      "Soporte prioritario 24/7",
    ],
  },
  {
    code: "empresarial",
    name: "Empresarial",
    price: PRICING.plans.empresarial.priceUsd,
    highlight: false,
    tagline: "Sin límites para tu crecimiento",
    features: [
      "3 idiomas (ES · EN · PT)",
      "Platillos y categorías ilimitados",
      "Órdenes en tiempo real ilimitadas",
      "Reportes y exportación avanzada",
      "Soporte dedicado por WhatsApp",
    ],
  },
];

const setupIncludes: { icon: IconName; label: string }[] = [
  { icon: "zap", label: "Listo y operando en 48 horas" },
  { icon: "globe", label: "Landing 100% personalizada con dominio propio" },
  { icon: "shield", label: "1 año de soporte técnico garantizado" },
];

const nfcSteps = [
  { n: "1.", title: "Toca", desc: "El comensal acerca su teléfono a la tarjeta NFC de la mesa." },
  { n: "2.", title: "Ordena", desc: "Navega por la carta interactiva y envía el pedido al instante." },
  { n: "3.", title: "Disfruta", desc: "La orden llega directo a tu panel en cocina en tiempo real." },
];

export function PricingV2() {
  return (
    <section id="planes" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:px-6 sm:py-32">
      <RevealOnView className="mb-14 max-w-2xl border-l-2 border-accent-400 pl-6 sm:mb-16">
        <div className="reveal-up">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-600">
            Planes y tarifas
          </p>
          <h2 className="mt-2 font-display text-3xl leading-tight text-brand-900 sm:text-5xl">
            Una inversión gastronómica que se paga sola
          </h2>
          <p className="mt-4 text-base font-medium text-brand-800/80">
            Implementación inicial llave en mano y una mensualidad transparente. Sin contratos atados.
          </p>
        </div>
      </RevealOnView>

      {/* Implementación única - Diseño de Certificado / Menú Físico */}
      <RevealOnView className="reveal-up relative mb-16 overflow-hidden rounded-2xl border border-accent-300/40 bg-cream-100/60 p-7 sm:mb-20 sm:p-12">
        {/* Fondo sutil */}
        <div className="qr-grid absolute inset-0 opacity-[0.03] pointer-events-none" />
        
        <div className="relative grid gap-8 lg:grid-cols-[280px_1fr] lg:items-center">
          <div className="border-b border-accent-200/40 pb-6 lg:border-b-0 lg:border-r lg:border-accent-200/40 lg:pb-0 lg:pr-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent-600">
              Servicio Inicial
            </span>
            <h3 className="font-display text-xl text-brand-900 mt-1">Implementación Única</h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-6xl text-brand-900 leading-none">${PRICING.setupFeeUsd}</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-700/65">
                pago único
              </span>
            </div>
            <p className="mt-3 text-xs text-brand-700/80">
              Después, tu plan mensual preferido desde <span className="font-semibold text-brand-900">${PRICING.plans.basico.priceUsd}/mes</span>
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-3 lg:pl-6">
            {setupIncludes.map((s, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/70 border border-stone-200/60 text-brand-600 shadow-sm">
                  <Icon name={s.icon} size={20} />
                </span>
                <p className="text-[13px] font-medium leading-relaxed text-brand-850">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </RevealOnView>

      {/* Planes mensuales - Estilo Carta Editorial */}
      <RevealOnView className="grid gap-6 sm:gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.code}
            className={cn(
              "reveal-up relative flex flex-col rounded-2xl border bg-white p-7 transition-all duration-300 ease-out-expo hover:-translate-y-1.5 hover:shadow-[0_16px_48px_rgba(34,80,58,0.08)] sm:p-8",
              plan.highlight
                ? "border-accent-400 ring-1 ring-accent-450/40 bg-cream-50/20"
                : "border-stone-200/80"
            )}
          >
            {plan.highlight && (
              <>
                <div
                  className="pointer-events-none absolute -inset-3 -z-10 rounded-[1.75rem] bg-accent-400/20 blur-2xl"
                  aria-hidden="true"
                />
                <span className="absolute -top-3.5 left-8 rounded-full border border-accent-300 bg-accent-500 px-3.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
                  Recomendado
                </span>
              </>
            )}
            
            <div className="border-b border-stone-200/50 pb-6 mb-6">
              <h3 className="font-display text-3xl text-brand-900">{plan.name}</h3>
              <p className="mt-2 text-xs text-brand-700/70 tracking-wide font-medium">{plan.tagline}</p>
              
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl text-brand-900">${plan.price}</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-brand-700/60">
                  / mes
                </span>
              </div>
            </div>
            
            <ul className="flex-1 space-y-4 text-[13px] text-brand-800/90 leading-relaxed font-medium">
              {plan.features.map((f, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="mt-1 flex-shrink-0 text-accent-500">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 fill-current">
                      <rect width="6" height="6" transform="rotate(45 6 1)" />
                    </svg>
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            
            <Link
              href={`/register?plan=${plan.code}`}
              className={cn(
                "mt-9 inline-flex h-11 items-center justify-center rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 ease-out-expo active:scale-[0.98]",
                plan.highlight
                  ? "bg-brand-600 text-white border border-accent-400 hover:bg-brand-700 shadow-sm"
                  : "border border-stone-300 bg-white text-brand-700 hover:bg-cream-100 hover:border-stone-400"
              )}
            >
              Empezar con {plan.name}
            </Link>
          </div>
        ))}
      </RevealOnView>

      {/* Add-on: Tarjetas NFC */}
      <RevealOnView className="reveal-up relative mt-16 flex min-h-[520px] items-center overflow-hidden rounded-3xl border border-stone-200/80 bg-white sm:mt-20 lg:min-h-[480px]">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/nfc.png"
            alt="Cliente acercando su celular a una tarjeta NFC de DataFud"
            fill
            className="object-cover object-[25%_center] lg:object-left"
            priority
          />
          {/* Gradient overlay to fade to white on the right for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/70 to-white/95 lg:bg-gradient-to-r lg:from-transparent lg:via-white/75 lg:to-white/95" />
        </div>

        {/* Content overlaid on the right side */}
        <div className="relative z-10 w-full lg:w-1/2 ml-auto p-8 sm:p-12 lg:pr-16 flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-accent-300/40 bg-accent-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-700">
              Tecnología Física
            </span>
            <span className="flex items-baseline gap-1">
              <span className="font-display text-3xl text-brand-900">${PRICING.nfcUnitUsd}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-700/60">
                / unidad
              </span>
            </span>
          </div>
          <h3 className="mt-4 font-display text-3xl text-brand-900">
            Tarjetas NFC para tus mesas
          </h3>
          <p className="mt-3 text-sm text-brand-850 leading-relaxed font-medium">
            Simplifica el servicio físico. Tus clientes solo tienen que acercar su smartphone y la carta interactiva aparecerá en su pantalla al instante. Suma las tarjetas que necesites, sin suscripciones extra.
          </p>
          
          <ul className="mt-8 space-y-5">
            {nfcSteps.map((s, idx) => (
              <li key={idx} className="flex gap-4">
                <span className="font-display text-xl text-accent-500 leading-none">
                  {s.n}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-brand-900 leading-tight">{s.title}</h4>
                  <p className="text-xs text-brand-700/70 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </RevealOnView>
    </section>
  );
}
