import Link from "next/link";
import { MagneticCta } from "@/components/marketing/v2/magnetic-cta";
import { Icon } from "@/components/ui/icon";
import { PRICING } from "@/lib/constants";
import { formatCrc } from "@/lib/currency/format";
import { waProps } from "@/lib/site";

// Banda de llamada entre «Sistema» y «Planes»: una franja verde oscuro, con sombra hacia el crema
// de arriba y de abajo, que cierra la parte de producto antes de los precios. Solo repite lo que
// la portada ya dice (plazo, precio desde y WhatsApp como único canal, D-039).

export function BandaCta() {
  return (
    <section aria-label="Empezá con tu carta" className="banda-cta relative isolate overflow-hidden bg-brand-950 text-cream-50">
      <div className="qr-grid pointer-events-none absolute inset-0 -z-10 opacity-[0.06]" />
      <div className="pointer-events-none absolute -left-24 top-1/2 -z-10 h-72 w-[30rem] -translate-y-1/2 rounded-full bg-brand-600/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-1/2 -z-10 h-64 w-[26rem] -translate-y-1/2 rounded-full bg-accent-500/20 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-500/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-500/60 to-transparent" />

      <div className="mx-auto flex max-w-6xl flex-col gap-7 px-5 py-12 sm:px-6 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-300">Empezá esta semana</p>
          <p className="mt-3 font-display text-[clamp(1.75rem,4vw,2.6rem)] leading-[1.08] tracking-tight">
            Tu carta con QR, <span className="italic text-accent-200">lista en {PRICING.delivery.menuHours} horas hábiles</span>
          </p>
          <p className="mt-3 text-sm font-medium text-cream-100/80 sm:text-base">
            Desde {formatCrc(PRICING.plans.basico.priceCrc)}/mes. Nos pasás el menú por WhatsApp y nosotros hacemos el resto.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <MagneticCta
            {...waProps("banda")}
            className="inline-flex h-12 items-center justify-center gap-2.5 whitespace-nowrap rounded-lg border border-accent-300 bg-accent-500 px-8 text-xs font-bold uppercase tracking-[0.18em] text-brand-950 shadow-sm transition-colors duration-300 ease-out-expo hover:bg-accent-400"
          >
            <Icon name="whatsapp" size={18} />
            Quiero mi carta
          </MagneticCta>
          <Link
            href="/preview/carta"
            data-demo-open="banda"
            className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-lg border border-cream-50/35 bg-cream-50/5 px-8 text-xs font-bold uppercase tracking-[0.18em] text-cream-50 transition-colors duration-300 ease-out-expo hover:border-cream-50/60 hover:bg-cream-50/10"
          >
            Ver la demo
          </Link>
        </div>
      </div>
    </section>
  );
}
