import { cn } from "@/lib/utils/cn";
import { Icon, type IconName } from "@/components/ui/icon";
import { RevealOnView } from "@/components/marketing/v2/reveal";
import { PRICING, type PlanCode } from "@/lib/constants";
import { waProps } from "@/lib/site";

type PlanCard = {
  code: PlanCode;
  name: string;
  price: number;
  deliveryLabel: string;
  highlight: boolean;
  tagline: string;
  features: string[];
};

const plans: PlanCard[] = [
  {
    code: "basico",
    name: PRICING.plans.basico.marketingName,
    price: PRICING.plans.basico.priceUsd,
    deliveryLabel: PRICING.plans.basico.deliveryLabel,
    highlight: false,
    tagline: "Tu carta digital por QR y NFC, sin pedidos en mesa",
    features: [
      "1 idioma",
      "Hasta 20 platillos con foto",
      "Carta a tu marca: colores y logo",
      "Cambios de menú a pedido, sin reimprimir",
      "Soporte por WhatsApp",
    ],
  },
  {
    code: "estandar",
    name: PRICING.plans.estandar.marketingName,
    price: PRICING.plans.estandar.priceUsd,
    deliveryLabel: PRICING.plans.estandar.deliveryLabel,
    highlight: true,
    tagline: "Carta + pedidos desde la mesa + panel",
    features: [
      "2 idiomas simultáneos",
      "Hasta 70 platillos con foto",
      "Pedidos desde la mesa directo a cocina",
      "Panel de comandas y reportes de venta",
      "Soporte por WhatsApp en horario de oficina",
    ],
  },
  {
    code: "empresarial",
    name: PRICING.plans.empresarial.marketingName,
    price: PRICING.plans.empresarial.priceUsd,
    deliveryLabel: PRICING.plans.empresarial.deliveryLabel,
    highlight: false,
    tagline: "Sin límites de platillos, categorías ni mesas",
    features: [
      "3 idiomas (ES · EN · PT)",
      "Platillos y categorías ilimitados",
      "Pedidos desde la mesa directo a cocina",
      "Ventas por día, ticket promedio y platillos más vendidos",
      "Soporte por WhatsApp con contacto directo",
    ],
  },
];

const setupIncludes: { icon: IconName; label: string }[] = [
  { icon: "zap", label: `Carta publicada en ${PRICING.delivery.menuHours} horas y sistema completo en ${PRICING.delivery.fullSystemDays} días` },
  { icon: "palette", label: "Carta a tu marca: colores, logo y fotos de tus platillos" },
  { icon: "shield", label: "1 año de soporte técnico incluido" },
];

export function PricingV2() {
  return (
    <section id="planes" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:px-6 sm:py-32">
      <RevealOnView className="mb-14 max-w-2xl border-l-2 border-accent-400 pl-6 sm:mb-16">
        <div className="reveal-up">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-700">
            Planes y tarifas
          </p>
          <h2 className="mt-2 font-display text-3xl leading-tight text-brand-900 sm:text-5xl">
            Una inversión clara, sin letra chica
          </h2>
          <p className="mt-4 text-base font-medium text-brand-800/80">
            Implementación llave en mano y una mensualidad transparente. Sin contratos atados: si un mes no te sirve, lo dejás.
          </p>
        </div>
      </RevealOnView>

      {/* Implementación única - Diseño de Certificado / Menú Físico */}
      <RevealOnView className="reveal-up relative mb-16 overflow-hidden rounded-2xl border border-accent-300/40 bg-cream-100/60 p-7 sm:mb-20 sm:p-12">
        {/* Fondo sutil */}
        <div className="qr-grid absolute inset-0 opacity-[0.03] pointer-events-none" />
        
        <div className="relative grid gap-8 lg:grid-cols-[280px_1fr] lg:items-center">
          <div className="border-b border-accent-200/40 pb-6 lg:border-b-0 lg:border-r lg:border-accent-200/40 lg:pb-0 lg:pr-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent-700">
              Servicio Inicial
            </span>
            <h3 className="font-display text-xl text-brand-900 mt-1">Implementación Única</h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-6xl text-brand-900 leading-none">${PRICING.setupFeeUsd}</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-700/75">
                pago único
              </span>
            </div>
            <p className="mt-3 text-xs text-brand-700/80">
              Después, el plan mensual que elijas desde <span className="font-semibold text-brand-900">${PRICING.plans.basico.priceUsd}/mes</span>
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
                <span className="absolute -top-3.5 left-8 rounded-full border border-accent-300 bg-brand-600 px-3.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white">
                  Recomendado
                </span>
              </>
            )}
            
            <div className="border-b border-stone-200/50 pb-6 mb-6">
              <h3 className="font-display text-3xl text-brand-900">{plan.name}</h3>
              <p className="mt-2 text-xs text-brand-700/70 tracking-wide font-medium">{plan.tagline}</p>
              
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl text-brand-900">${plan.price}</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-brand-700/75">
                  / mes
                </span>
              </div>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent-300/50 bg-accent-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-accent-700">
                <Icon name="clock" size={12} />
                {plan.deliveryLabel}
              </p>
            </div>
            
            <ul className="flex-1 space-y-4 text-[13px] text-brand-800/90 leading-relaxed font-medium">
              {plan.features.map((f, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="mt-1 flex-shrink-0 text-accent-700">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 fill-current">
                      <rect width="6" height="6" transform="rotate(45 6 1)" />
                    </svg>
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            
            <a
              {...waProps(`plan-${plan.code}`)}
              className={cn(
                "mt-9 inline-flex h-11 items-center justify-center gap-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 ease-out-expo active:scale-[0.98]",
                plan.highlight
                  ? "bg-brand-600 text-white border border-accent-400 hover:bg-brand-700 shadow-sm"
                  : "border border-stone-300 bg-white text-brand-700 hover:bg-cream-100 hover:border-stone-400"
              )}
            >
              <Icon name="whatsapp" size={16} />
              Quiero {plan.name}
            </a>
          </div>
        ))}
      </RevealOnView>

      {/* Puente al hardware de mesa (la oferta completa vive en #hardware) */}
      <RevealOnView className="reveal-up mt-14 flex flex-col gap-5 rounded-2xl border border-stone-200/80 bg-cream-100/60 px-7 py-6 sm:mt-16 sm:flex-row sm:items-center sm:justify-between sm:px-9">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-accent-300 bg-brand-600 text-white">
            <Icon name="qr" size={20} />
          </span>
          <div>
            <h3 className="font-display text-xl text-brand-900">¿Y lo que va en la mesa?</h3>
            <p className="mt-1 text-sm font-medium leading-relaxed text-brand-700/80">
              Stands QR impresos en 3D desde ${PRICING.hardware[0].priceUsd} y tarjetas NFC a ${PRICING.nfcUnitUsd} por unidad, con tu logo. Se compran aparte, sin suscripción extra.
            </p>
          </div>
        </div>
        <a
          href="#hardware"
          className="inline-flex h-11 flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-stone-300 bg-white px-6 text-xs font-bold uppercase tracking-[0.16em] text-brand-800 transition-all duration-300 ease-out-expo hover:border-stone-400 hover:bg-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2"
        >
          Ver hardware de mesa
          <Icon name="arrow-right" size={16} />
        </a>
      </RevealOnView>
    </section>
  );
}
