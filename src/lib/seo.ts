import { PRICING, PLAN_CODES, setupFeeFor } from "@/lib/constants";
import { FAQ_ITEMS } from "@/lib/faq";
import { SITE } from "@/lib/site";
import { formatCrc } from "@/lib/currency/format";

// Metadatos y datos estructurados de la landing. Fuente única para layout, páginas y JSON-LD.

export const SITE_TITLE = "Menú digital con QR para restaurantes en Costa Rica · DataFud";
export const SITE_DESCRIPTION = `Menú digital con QR y NFC para sodas, cafeterías y restaurantes de Costa Rica. Te lo montamos nosotros en ${PRICING.delivery.menuHours} horas, en español e inglés, desde ${formatCrc(PRICING.plans.basico.priceCrc)} al mes. Stands QR impresos en 3D y cambios por WhatsApp.`;

/** Base de Open Graph y Twitter por página: Next reemplaza (no fusiona) `openGraph` del layout. */
export function pageSocial(path: string, title: string, description: string) {
  return {
    openGraph: { type: "website" as const, locale: "es_CR", siteName: SITE.name, url: path, title, description },
    twitter: { card: "summary_large_image" as const, title, description },
  };
}

export const LEGAL_UPDATED_ISO = "2026-09-22";

// Solo datos reales: sin dirección postal (no se publica), sin reseñas ni cifras de clientes.
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/icono-main.png`,
    email: SITE.email,
    telephone: `+${SITE.whatsapp}`,
    founder: { "@type": "Person", name: SITE.founder.name },
    parentOrganization: { "@type": "Organization", name: SITE.maker },
    areaServed: { "@type": "Country", name: SITE.country },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: `+${SITE.whatsapp}`,
        email: SITE.email,
        areaServed: "CR",
        availableLanguage: ["es", "en"],
      },
    ],
  };
}

export function localBusinessJsonLd() {
  const monthly = PLAN_CODES.map((c) => PRICING.plans[c].priceCrc);
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE.url}/#localbusiness`,
    name: SITE.name,
    description: SITE_DESCRIPTION,
    url: SITE.url,
    image: `${SITE.url}/icono-main.png`,
    telephone: `+${SITE.whatsapp}`,
    email: SITE.email,
    areaServed: { "@type": "Country", name: SITE.country },
    currenciesAccepted: "CRC",
    paymentAccepted: "SINPE Móvil, transferencia bancaria",
    priceRange: `${formatCrc(Math.min(...monthly))} – ${formatCrc(Math.max(...monthly))} al mes`,
    parentOrganization: { "@id": `${SITE.url}/#organization` },
  };
}

export function productsJsonLd() {
  return PLAN_CODES.map((code) => {
    const plan = PRICING.plans[code];
    const setup = setupFeeFor(code);
    const offer = (price: number, priceCurrency: "CRC" | "USD") => ({
      "@type": "Offer",
      price,
      priceCurrency,
      availability: "https://schema.org/InStock",
      url: `${SITE.url}/#planes`,
      priceSpecification: [
        { "@type": "UnitPriceSpecification", price, priceCurrency, unitText: "mes" },
        {
          "@type": "UnitPriceSpecification",
          price: priceCurrency === "CRC" ? setup.crc : setup.usd,
          priceCurrency,
          name: "Implementación (pago único)",
        },
      ],
    });
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `DataFud ${plan.marketingName}`,
      description: `${plan.deliveryLabel}. ${plan.tableOrdering ? "Carta digital, pedidos desde la mesa, panel de comandas y reportes" : "Carta digital por QR y NFC con tu marca, sin pedidos en mesa"}. ${plan.languagesLabel}, ${plan.maxProducts ? `hasta ${plan.maxProducts} platillos` : "platillos ilimitados"}.`,
      brand: { "@type": "Brand", name: SITE.name },
      category: "Software de menú digital para restaurantes",
      offers: [offer(plan.priceCrc, "CRC"), offer(plan.priceUsd, "USD")],
    };
  });
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
