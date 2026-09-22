import { PRICING, PLAN_CODES, setupFeeFor } from "@/lib/constants";
import { FAQ_ITEMS } from "@/lib/faq";
import { SITE } from "@/lib/site";

// Metadatos y datos estructurados de la landing. Fuente única para layout, páginas y JSON-LD.

export const SITE_TITLE = "Menú digital con QR para restaurantes en Costa Rica · DataFud";
export const SITE_DESCRIPTION =
  "Menú digital con QR y NFC para sodas, cafeterías y restaurantes de Costa Rica. Te lo montamos nosotros en 48 horas, en español e inglés, desde ₡14 900 al mes. Stands QR impresos en 3D y cambios por WhatsApp."

export const LEGAL_UPDATED_ISO = "2026-09-22";

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
