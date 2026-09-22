import Link from "next/link";
import Image from "next/image";
import { LandingNavV2 } from "@/components/marketing/v2/landing-nav-v2";
import { PricingV2 } from "@/components/marketing/v2/pricing-v2";
import { Parallax } from "@/components/marketing/v2/parallax";
import { MagneticCta } from "@/components/marketing/v2/magnetic-cta";
import { Icon } from "@/components/ui/icon";
import { PRICING } from "@/lib/constants";
import { ContactSection } from "@/components/marketing/v2/contact-section";
import { HardwareSection } from "@/components/marketing/v2/hardware-section";
import { DemoSection } from "@/components/marketing/v2/demo-section";
import { ImplementationSection } from "@/components/marketing/v2/implementation-section";
import { TrustSection } from "@/components/marketing/v2/trust-section";
import { FaqSection } from "@/components/marketing/v2/faq-section";
import { WhatsAppFloat } from "@/components/marketing/v2/whatsapp-float";
import { AnalyticsEvents } from "@/components/marketing/v2/analytics-events";
import { MetaPixel } from "@/components/marketing/v2/meta-pixel";
import { SiteFooter } from "@/components/marketing/v2/site-footer";
import { waProps } from "@/lib/site";
import { formatCrc } from "@/lib/currency/format";
import type { Metadata } from "next";
import { faqJsonLd, organizationJsonLd, productsJsonLd } from "@/lib/seo";


// Glifo QR firma de la marca: celdas que se ensamblan al cargar.
const QR_CELLS = [
  1, 1, 1, 0, 1,
  1, 0, 1, 0, 1,
  1, 1, 1, 1, 1,
  0, 0, 1, 0, 1,
  1, 1, 1, 0, 1,
];

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

const { founderOffer } = PRICING;

export default function HomePage() {
  const jsonLd = [organizationJsonLd(), ...productsJsonLd(), faqJsonLd()];
  return (
    <div className="min-h-screen bg-cream-50 font-sans text-brand-900 antialiased selection:bg-accent-200 selection:text-brand-950">
      {/* Datos estructurados: Organization, Product (3 planes) y FAQPage */}
      <script
        type="application/ld+json"
        // JSON generado por nosotros desde constantes: no hay entrada del usuario.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <LandingNavV2 />

      <main>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-stone-200/60">
        <div className="qr-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="animate-glow-1 pointer-events-none absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-brand-100/50 blur-3xl" />
        <div className="animate-glow-2 pointer-events-none absolute right-0 top-20 h-[360px] w-[360px] rounded-full bg-accent-100/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-[8%] top-0 hidden border-l border-stone-200/30 xl:block" />
        <div className="pointer-events-none absolute bottom-0 right-[8%] top-0 hidden border-r border-stone-200/30 xl:block" />

        <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
            <div className="reveal flex flex-col items-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent-300/60 bg-accent-50/60 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-accent-800 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                Menú digital QR · Costa Rica
              </span>

              <h1 className="mt-5 font-display text-[clamp(2.1rem,6.4vw,3.6rem)] leading-[1.04] tracking-tight text-brand-900 sm:mt-8">
                Tu carta digital con QR,{" "}
                <span className="italic font-normal text-brand-700">lista en {PRICING.delivery.menuHours} horas</span>
              </h1>

              <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-brand-800/85 sm:mt-6 sm:text-lg">
                Para sodas, cafeterías y restaurantes de Costa Rica. Te montamos la carta con tu
                marca, en español e inglés, y tus comensales la abren con un QR o una tarjeta NFC
                en la mesa. Pedidos y panel, con el sistema completo.
              </p>

              <div className="mt-6 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:gap-4">
                <MagneticCta
                  {...waProps("hero")}
                  className="inline-flex h-12 items-center justify-center gap-2.5 whitespace-nowrap rounded-lg border border-accent-400 bg-brand-600 px-8 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-sm transition-colors duration-300 ease-out-expo hover:bg-brand-700"
                >
                  <Icon name="whatsapp" size={18} />
                  Quiero mi carta
                </MagneticCta>
                <Link
                  href="/preview/cliente"
                  data-demo-open="hero"
                  className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-lg border border-stone-300 bg-white/60 px-8 text-xs font-bold uppercase tracking-[0.18em] text-brand-800 transition-all duration-300 ease-out-expo hover:border-stone-400 hover:bg-cream-100/70 active:scale-[0.98]"
                >
                  Ver la demo
                </Link>
              </div>

              <p className="mt-4 text-sm font-semibold text-brand-800">
                Desde {formatCrc(PRICING.plans.basico.priceCrc)}/mes · Te la montamos nosotros · Cambios por WhatsApp
              </p>
              {founderOffer.enabled && (
                <a
                  href="#planes"
                  className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-accent-300/70 bg-white/70 px-3.5 text-xs font-bold text-accent-800 transition-colors hover:border-accent-400 hover:bg-accent-50"
                >
                  <Icon name="star" size={13} />
                  {founderOffer.short}
                  <Icon name="arrow-right" size={13} />
                </a>
              )}
            </div>

            {/* Imagen del producto + acentos flotantes */}
            <Parallax strength={26} className="relative flex justify-center lg:justify-end">
              {/* Glifo QR que se ensambla */}
              <div className="absolute -left-3 -top-5 z-20 hidden rounded-xl border border-stone-200/80 bg-white/90 p-2.5 shadow-lg sm:block">
                <svg width="58" height="58" viewBox="0 0 58 58" aria-hidden="true">
                  {QR_CELLS.map((on, i) => {
                    if (!on) return null;
                    const col = i % 5;
                    const row = Math.floor(i / 5);
                    const accent = i === 12 || i === 7 || i === 17;
                    return (
                      <rect
                        key={i}
                        className="qr-pixel"
                        x={col * 11 + 2}
                        y={row * 11 + 2}
                        width="9"
                        height="9"
                        rx="1.5"
                        fill={accent ? "#b8923f" : "#22503a"}
                        style={{ animationDelay: `${0.4 + i * 0.02}s`, transformOrigin: "center" }}
                      />
                    );
                  })}
                </svg>
              </div>

              <div className="group relative w-full max-w-[460px] overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-2 shadow-[0_28px_60px_-20px_rgba(34,80,58,0.28)] transition-transform duration-500 ease-out-expo hover:-translate-y-1">
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-tr from-brand-50/20 to-transparent" />
                <Image
                  src="/banner.png"
                  alt="Menú digital DataFud abierto en un teléfono sobre la mesa"
                  width={920}
                  height={570}
                  priority
                  sizes="(min-width: 1024px) 460px, (min-width: 640px) 60vw, 92vw"
                  className="h-auto w-full rounded-xl object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.02]"
                />
              </div>

              {/* Chip flotante: orden recibida */}
              <div className="absolute -bottom-4 -right-1 z-20 hidden items-center gap-3 rounded-xl border border-stone-200/80 bg-white/95 px-4 py-3 shadow-xl sm:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                  <Icon name="globe" size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold leading-tight text-brand-900">Carta publicada</p>
                  <p className="text-xs font-semibold text-accent-800">Español · English</p>
                </div>
              </div>
            </Parallax>
          </div>
        </div>

      </section>

      {/* ── Cómo funciona: una sola línea de tiempo con plazos ───── */}
      <ImplementationSection />

      {/* ── Demo en vivo ───────────────────────────────────────── */}
      <DemoSection />

      {/* ── Planes y precios ───────────────────────────────────── */}
      <PricingV2 />

      {/* ── Hardware de mesa ───────────────────────────────────── */}
      <HardwareSection />

      {/* ── Por qué DataFud ────────────────────────────────────── */}
      <TrustSection />

      {/* ── Preguntas frecuentes ───────────────────────────────── */}
      <FaqSection />

      {/* ── Contacto ───────────────────────────────────────────── */}
      <ContactSection />

      </main>

      <SiteFooter />

      <WhatsAppFloat />
      <AnalyticsEvents />
      <MetaPixel />
    </div>
  );
}
