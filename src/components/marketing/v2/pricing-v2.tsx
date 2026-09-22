import { cn } from "@/lib/utils/cn";
import { Icon, type IconName } from "@/components/ui/icon";
import { RevealOnView } from "@/components/marketing/v2/reveal";
import { PRICING, firstPaymentFor, setupFeeFor, type PlanCode } from "@/lib/constants";
import { formatCrc, formatUsd } from "@/lib/currency/format";
import { waProps } from "@/lib/site";

// Sección #planes. Todo monto sale de PRICING (src/lib/constants.ts): colones primero, dólares
// como referencia. Cada plan muestra su implementación y el primer pago total, sin sorpresas.

type PlanCard = {
  code: PlanCode;
  highlight: boolean;
  tagline: string;
  features: string[];
};

const { plans: P, terms, founderOffer, annualCarta } = PRICING;
const productsLabel = (n: number | null) => (n ? `Hasta ${n} platillos con foto` : "Platillos y categorías ilimitados");

const plans: PlanCard[] = [
  {
    code: "basico",
    highlight: false,
    tagline: "Tu carta digital por QR y NFC, sin pedidos en mesa",
    features: [P.basico.languagesLabel, productsLabel(P.basico.maxProducts), "Carta a tu marca: colores, logo y fotos"],
  },
  {
    code: "estandar",
    highlight: true,
    tagline: "Carta + pedidos desde la mesa + panel",
    features: [
      P.estandar.languagesLabel,
      productsLabel(P.estandar.maxProducts),
      "Pedidos desde la mesa directo a cocina",
      "Panel de comandas y reportes de venta",
    ],
  },
  {
    code: "empresarial",
    highlight: false,
    tagline: "Sin límites de platillos, categorías ni mesas",
    features: [
      P.empresarial.languagesLabel,
      productsLabel(P.empresarial.maxProducts),
      "Pedidos desde la mesa directo a cocina",
      "Ventas por día, ticket promedio y platillos más vendidos",
    ],
  },
];

const allPlansInclude: { icon: IconName; label: string }[] = [
  { icon: "palette", label: "Te la montamos nosotros: diseño, carga de platillos y traducción" },
  { icon: "whatsapp", label: terms.menuChanges },
  { icon: "shield", label: terms.support },
];

export function PricingV2() {
  return (
    <section id="planes" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:px-6 sm:py-28">
      <RevealOnView className="mb-12 max-w-2xl border-l-2 border-accent-400 pl-6 sm:mb-14">
        <div className="reveal-up">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-700">Planes y tarifas</p>
          <h2 className="mt-2 font-display text-3xl leading-tight text-brand-900 sm:text-5xl">
            Una inversión clara, sin letra chica
          </h2>
          <p className="mt-4 text-base font-medium text-brand-800/80">
            Precios en colones, con el equivalente en dólares como referencia. Una implementación de pago
            único y una mensualidad. {terms.permanence}
          </p>
        </div>
      </RevealOnView>

      {founderOffer.enabled && (
        <RevealOnView className="reveal-up mb-10 flex flex-col gap-4 rounded-2xl border border-accent-300/70 bg-accent-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Icon name="star" size={18} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-800">Oferta de fundadores</p>
              <p className="mt-1 text-sm font-medium leading-relaxed text-brand-900 sm:text-[15px]">{founderOffer.text}</p>
            </div>
          </div>
          <a
            {...waProps("plan-basico", "Hola, quiero uno de los cupos de fundadores de DataFud para mi local.")}
            className="inline-flex h-11 flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-stone-300 bg-white px-5 text-xs font-bold uppercase tracking-[0.14em] text-brand-800 transition-colors duration-300 ease-out-expo hover:border-stone-400 hover:bg-cream-50"
          >
            <Icon name="whatsapp" size={16} />
            Pedir un cupo
          </a>
        </RevealOnView>
      )}

      <RevealOnView className="grid gap-6 sm:gap-8 lg:grid-cols-3">
        {plans.map((card) => {
          const plan = P[card.code];
          const setup = setupFeeFor(card.code);
          const first = firstPaymentFor(card.code);
          return (
            <div
              key={card.code}
              className={cn(
                "reveal-up relative flex flex-col rounded-2xl border bg-white p-6 transition-all duration-300 ease-out-expo hover:-translate-y-1.5 hover:shadow-[0_16px_48px_rgba(34,80,58,0.08)] sm:p-8",
                card.highlight ? "border-accent-400 bg-cream-50/20 ring-1 ring-accent-450/40" : "border-stone-200/80"
              )}
            >
              {card.highlight && (
                <span className="absolute -top-3.5 left-8 rounded-full border border-accent-300 bg-brand-600 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-white">
                  Recomendado
                </span>
              )}

              <div className="mb-5 border-b border-stone-200/50 pb-5">
                <h3 className="font-display text-3xl text-brand-900">{plan.marketingName}</h3>
                <p className="mt-2 text-sm font-medium text-brand-700/80">{card.tagline}</p>

                <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="font-display text-[2.6rem] leading-none text-brand-900 sm:text-5xl">{formatCrc(plan.priceCrc)}</span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-brand-700/75">/ mes</span>
                  <span className="text-xs font-semibold text-brand-700/75">≈ {formatUsd(plan.priceUsd)}</span>
                </div>

                <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent-300/50 bg-accent-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-accent-800">
                  <Icon name="clock" size={12} />
                  {plan.deliveryLabel}
                </p>

                <dl className="mt-5 space-y-1.5 text-sm font-medium text-brand-800/85">
                  <div className="flex justify-between gap-3">
                    <dt>Implementación{plan.setup === "carta" ? " de la carta" : " del sistema"} <span className="text-brand-700/75">(pago único)</span></dt>
                    <dd className="whitespace-nowrap font-semibold text-brand-900">{formatCrc(setup.crc)}</dd>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-dashed border-stone-250 pt-1.5">
                    <dt className="font-semibold text-brand-900">Primer pago <span className="block text-xs font-medium text-brand-700/75">implementación + primer mes</span></dt>
                    <dd className="whitespace-nowrap font-bold text-brand-900">{formatCrc(first.crc)}</dd>
                  </div>
                </dl>
                {card.code === "basico" && (
                  <p className="mt-3 text-sm font-medium leading-relaxed text-brand-700/85">
                    O pagá el año: <span className="font-semibold text-brand-900">{formatCrc(annualCarta.crc)}/año</span> (≈&nbsp;{formatUsd(annualCarta.usd)}), con 2 meses gratis y la implementación incluida.
                  </p>
                )}
              </div>

              <ul className="flex-1 space-y-2.5 text-sm font-medium leading-relaxed text-brand-800/90">
                {card.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-1.5 flex-shrink-0 text-accent-700">
                      <svg width="12" height="12" viewBox="0 0 12 12" className="h-3 w-3 fill-current" aria-hidden="true">
                        <rect width="6" height="6" transform="rotate(45 6 1)" />
                      </svg>
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {card.code === "basico" && (
                <p className="mt-6 flex items-start gap-2.5 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-[13px] font-medium leading-relaxed text-brand-800">
                  <Icon name="shield" size={16} className="mt-0.5 flex-shrink-0 text-brand-600" />
                  <span><span className="font-bold">Garantía de entrega.</span> {terms.guarantee48h}</span>
                </p>
              )}

              <a
                {...waProps(`plan-${card.code}`)}
                className={cn(
                  "mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 ease-out-expo active:scale-[0.98]",
                  card.highlight
                    ? "border border-accent-400 bg-brand-600 text-white shadow-sm hover:bg-brand-700"
                    : "border border-stone-300 bg-white text-brand-700 hover:border-stone-400 hover:bg-cream-100"
                )}
              >
                <Icon name="whatsapp" size={16} />
                Quiero {plan.marketingName}
              </a>
            </div>
          );
        })}
      </RevealOnView>

      {/* Lo que incluyen todos los planes */}
      <RevealOnView className="reveal-up mt-8 grid gap-4 rounded-2xl border border-accent-300/40 bg-cream-100/60 p-6 sm:grid-cols-3 sm:gap-6 sm:p-9">
        {allPlansInclude.map((s) => (
          <div key={s.label} className="flex items-start gap-3">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-stone-200/60 bg-white/70 text-brand-600 shadow-sm">
              <Icon name={s.icon} size={16} />
            </span>
            <p className="text-sm font-medium leading-relaxed text-brand-850">{s.label}</p>
          </div>
        ))}
      </RevealOnView>

    </section>
  );
}
