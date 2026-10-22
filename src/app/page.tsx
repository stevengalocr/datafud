import Link from "next/link";
import { LandingNavV2 } from "@/components/marketing/v2/landing-nav-v2";
import { PricingV2 } from "@/components/marketing/v2/pricing-v2";
import { HeroEscaneo } from "@/components/marketing/v2/hero-escaneo";
import { TelefonoCarta } from "@/components/marketing/v2/telefono-carta";
import { MagneticCta } from "@/components/marketing/v2/magnetic-cta";
import { Icon } from "@/components/ui/icon";
import { PRICING } from "@/lib/constants";
import { ContactSection } from "@/components/marketing/v2/contact-section";
import { HardwareSection } from "@/components/marketing/v2/hardware-section";
import { ActoNoche } from "@/components/marketing/v2/acto-noche";
import { DemoSection } from "@/components/marketing/v2/demo-section";
import { SistemaSection } from "@/components/marketing/v2/sistema-section";
import { ImplementationSection } from "@/components/marketing/v2/implementation-section";
import { TrustSection } from "@/components/marketing/v2/trust-section";
import { FaqSection } from "@/components/marketing/v2/faq-section";
import { WhatsAppFloat } from "@/components/marketing/v2/whatsapp-float";
import { CursorVisor } from "@/components/marketing/v2/cursor-visor";
import { AnalyticsEvents } from "@/components/marketing/v2/analytics-events";
import { MetaPixel } from "@/components/marketing/v2/meta-pixel";
import { SiteFooter } from "@/components/marketing/v2/site-footer";
import { BandaValor } from "@/components/marketing/v2/banda-valor";
import { BandaCta } from "@/components/marketing/v2/banda-cta";
import { waProps } from "@/lib/site";
import { formatCrc } from "@/lib/currency/format";
import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_TITLE, faqJsonLd, localBusinessJsonLd, organizationJsonLd, pageSocial, productsJsonLd } from "@/lib/seo";



export const metadata: Metadata = {
  alternates: { canonical: "/" },
  ...pageSocial("/", SITE_TITLE, SITE_DESCRIPTION),
};


export default function HomePage() {
  const jsonLd = [organizationJsonLd(), localBusinessJsonLd(), ...productsJsonLd(), faqJsonLd()];
  return (
    <div className="min-h-screen bg-cream-50 font-sans text-brand-900 antialiased selection:bg-accent-200 selection:text-brand-950">
      {/* Datos estructurados: Organization, Product (3 planes) y FAQPage */}
      <script
        type="application/ld+json"
        // JSON generado por nosotros desde constantes: no hay entrada del usuario.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <LandingNavV2 />

      <main id="contenido" tabIndex={-1} className="outline-none">
      {/* ── Hero: la portada que escanea (hero-escaneo.tsx) ───── */}
      <HeroEscaneo telefono={<TelefonoCarta inmediata />}>
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
            href="/preview/carta"
            data-demo-open="hero"
            className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-lg border border-stone-300 bg-white/60 px-8 text-xs font-bold uppercase tracking-[0.18em] text-brand-800 transition-all duration-300 ease-out-expo hover:border-stone-400 hover:bg-cream-100/70 active:scale-[0.98]"
          >
            Ver la demo
          </Link>
        </div>

        <p className="mt-4 text-sm font-semibold text-brand-800">
          Desde {formatCrc(PRICING.plans.basico.priceCrc)}/mes · Garantía: carta en {PRICING.delivery.menuHours} horas hábiles · Cambios por WhatsApp
        </p>
      </div>
      </HeroEscaneo>

      {/* ── Banda de valor: recibe el final de la portada ───────── */}
      <BandaValor />

      {/* ── Cómo funciona: una sola línea de tiempo con plazos ───── */}
      <ImplementationSection />

      {/* ── Demo en vivo ───────────────────────────────────────── */}
      <DemoSection />

      {/* ── El sistema completo, en acción (vitrina del panel) ── */}
      <SistemaSection />

      {/* ── Banda de llamada antes de los precios ──────────────── */}
      <BandaCta />

      {/* ── Planes y precios ───────────────────────────────────── */}
      <div className="fondo-vivo" data-fondo="a">
        <PricingV2 />
      </div>

      {/* ── Hardware de mesa ───────────────────────────────────── */}
      <HardwareSection />

      {/* ── Corte de escena: la soda de noche ─────────────────── */}
      <ActoNoche />

      {/* ── Por qué DataFud ────────────────────────────────────── */}
      <TrustSection />

      {/* ── Preguntas frecuentes ───────────────────────────────── */}
      <FaqSection />

      {/* ── Contacto ───────────────────────────────────────────── */}
      <ContactSection />

      </main>

      <SiteFooter />

      <WhatsAppFloat />
      <CursorVisor />
      <AnalyticsEvents />
      <MetaPixel />
    </div>
  );
}
