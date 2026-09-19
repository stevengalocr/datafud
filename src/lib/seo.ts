import { PRICING, PLAN_CODES } from "@/lib/constants";
import { FAQ_ITEMS } from "@/lib/faq";
import { SITE } from "@/lib/site";

// Metadatos y datos estructurados de la landing. Fuente única para layout, páginas y JSON-LD.

export const SITE_TITLE = "DataFud · Menú digital por QR y NFC para restaurantes";
export const SITE_DESCRIPTION =
  "Carta digital por QR y NFC para restaurantes, sodas y cafeterías de Costa Rica y Latinoamérica. Carta lista en 48 horas; sistema completo con pedidos y reportes en 15 días. Stands QR impresos en 3D y tarjetas NFC con tu logo.";

export const LEGAL_UPDATED_ISO = "2026-09-19";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/icono-main.png`,
    email: SITE.email,
    telephone: `+${SITE.whatsapp}`,
    parentOrganization: { "@type": "Organization", name: SITE.maker },
    address: { "@type": "PostalAddress", addressCountry: "CR" },
    areaServed: ["CR", "Latin America"],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: `+${SITE.whatsapp}`,
        email: SITE.email,
        availableLanguage: ["es", "en", "pt"],
      },
    ],
  };
}

export function productsJsonLd() {
  return PLAN_CODES.map((code) => {
    const plan = PRICING.plans[code];
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `DataFud ${plan.marketingName}`,
      description: `${plan.deliveryLabel}. ${plan.tableOrdering ? "Carta digital, pedidos desde la mesa, panel de comandas y reportes" : "Carta digital por QR y NFC con tu marca, sin pedidos en mesa"}. ${plan.maxLanguages} ${plan.maxLanguages === 1 ? "idioma" : "idiomas"}, ${plan.maxProducts ? `hasta ${plan.maxProducts} platillos` : "platillos ilimitados"}.`,
      brand: { "@type": "Brand", name: SITE.name },
      category: "Software de menú digital para restaurantes",
      offers: {
        "@type": "Offer",
        price: plan.priceUsd,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${SITE.url}/#planes`,
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: plan.priceUsd,
          priceCurrency: "USD",
          unitText: "mes",
        },
      },
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
