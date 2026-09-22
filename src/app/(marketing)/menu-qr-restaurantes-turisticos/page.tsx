import type { Metadata } from "next";
import { GuidePage, type GuideFaq, type GuideSection } from "@/components/marketing/v2/guide-page";
import { PRICING, hardwareBy } from "@/lib/constants";
import { formatCrc, formatUsd } from "@/lib/currency/format";

const PATH = "/menu-qr-restaurantes-turisticos";
const TITLE = "Menú QR para restaurantes turísticos: carta en español e inglés";

export const metadata: Metadata = {
  title: "Menú QR bilingüe para restaurantes turísticos en Costa Rica",
  description:
    "Carta digital en español e inglés para restaurantes con clientes turistas en Costa Rica: el comensal cambia de idioma con un toque, ve ingredientes y alérgenos, y abre la carta con QR o NFC.",
  alternates: { canonical: PATH },
  openGraph: { title: "Menú QR bilingüe para restaurantes turísticos · DataFud", url: PATH },
};

const { plans, delivery } = PRICING;

const sections: GuideSection[] = [
  {
    title: "El turista no debería necesitar traductor para pedir",
    paragraphs: [
      "En un restaurante de playa, de montaña o de hotel, buena parte de las mesas pide en inglés. Con una carta solo en español, el salonero termina explicando plato por plato qué es un casado, un chifrijo o un patacón, y el servicio se atrasa justo en las horas pico.",
      "Con un menú QR bilingüe, el comensal abre la carta en su teléfono y la cambia a inglés con un toque. Ve el nombre del platillo, una descripción clara y la foto, y llega a la hora de ordenar sabiendo qué quiere.",
    ],
  },
  {
    title: "Español e inglés en todos los planes",
    paragraphs: [
      `Todos los planes de DataFud incluyen la carta en español e inglés; nosotros hacemos la traducción cuando montamos la carta, cuidando que los nombres típicos se entiendan sin perder su identidad. Si recibís muchos visitantes de Brasil, el plan Empresarial suma portugués (${formatCrc(plans.empresarial.priceCrc)} al mes).`,
    ],
  },
  {
    title: "Colones o dólares, sin confusión",
    paragraphs: [
      "La carta muestra los precios en una moneda: la que usás para cobrar, colones o dólares. Si aceptás las dos, conviene decirlo a la vista: podemos incluir en el diseño del stand una línea con cómo manejás el tipo de cambio, para que nadie se sorprenda a la hora de pagar.",
    ],
  },
  {
    title: "Ingredientes y alérgenos a la vista",
    paragraphs: [
      "Muchos viajeros preguntan antes de pedir si un plato lleva maní, mariscos, gluten o lácteos. En la descripción de cada platillo anotamos, en los dos idiomas, los ingredientes y alérgenos que nos indiqués. Así la información está en la mesa y el equipo responde con más seguridad.",
    ],
  },
  {
    title: "NFC para quien no quiere escanear",
    paragraphs: [
      `No todos los clientes se llevan bien con la cámara y los códigos. Con una tarjeta NFC (${formatCrc(hardwareBy("tarjeta-nfc").priceCrc)} por unidad) o un stand QR 3D con NFC incorporado (desde ${formatCrc(hardwareBy("stand-qr-3d-nfc").priceCrc)}), basta con acercar el teléfono para que la carta se abra. Los stands se hacen con tu logo y tus colores, así que combinan con la decoración del lugar.`,
    ],
  },
  {
    title: "Pedidos desde la mesa, si los necesitás",
    paragraphs: [
      `Si tu operación lo pide, el sistema completo (planes Estándar y Empresarial) deja que el comensal arme su pedido en su idioma y lo mande directo a la cocina. Queda funcionando en ${delivery.fullSystemDays} días y capacitamos a tu equipo. Si solo necesitás la carta, en ${delivery.menuHours} horas está publicada.`,
    ],
  },
];

// Resumen en inglés para dueños o gerentes que no leen español (la conversación sigue por WhatsApp).
sections.push({
  lang: "en",
  title: "In English: what DataFud does for your restaurant",
  paragraphs: [
    `DataFud builds your digital menu for you: we design it with your brand, upload your dishes with photos, and translate it into English. Guests open it by scanning a QR code or tapping an NFC card at the table, with no app. Every plan includes Spanish and English; the Empresarial plan adds Portuguese.`,
    `Prices are in Costa Rican colones: the Carta plan is ${formatCrc(plans.basico.priceCrc)} per month (about ${formatUsd(plans.basico.priceUsd)}) plus a one-time setup fee of ${formatCrc(PRICING.setupFee.carta.crc)}. Menu and price changes by WhatsApp are included. If you want guests to order from the table, the Estándar plan (${formatCrc(plans.estandar.priceCrc)} per month) adds table ordering and a kitchen panel. No long-term contract: cancel with ${PRICING.terms.noticeDays} days' notice. Write to us on WhatsApp to get started.`,
  ],
});

const faqs: GuideFaq[] = [
  {
    q: "¿La traducción la hago yo?",
    a: "No. La hacemos nosotros al montar la carta y te la mostramos antes de publicarla para que la revisés.",
  },
  {
    q: "¿Qué pasa si cambio un platillo?",
    a: "Nos escribís por WhatsApp y actualizamos los dos idiomas. Los cambios están incluidos en todos los planes.",
  },
  {
    q: "¿Funciona si el turista no tiene datos móviles?",
    a: "La carta se abre con cualquier conexión: si el local ofrece WiFi a los clientes, les basta con eso.",
  },
  {
    q: "¿Pueden entregar fuera de la GAM?",
    a: "Sí. Los stands y tarjetas se envían por Correos de Costa Rica con el costo de la tarifa, que te cotizamos por WhatsApp.",
  },
];

export default function Page() {
  return (
    <GuidePage
      path={PATH}
      eyebrow="Restaurantes turísticos"
      title={TITLE}
      intro={`Para restaurantes de Costa Rica con clientes que piden en inglés: carta bilingüe con fotos, ingredientes y alérgenos, desde ${formatCrc(plans.basico.priceCrc)} al mes.`}
      sections={sections}
      faqs={faqs}
      origin="guia-turisticos"
      ctaTitle="¿Tu carta en español e inglés?"
      related={[
        { href: "/menu-digital-costa-rica", label: "Menú digital en Costa Rica: qué es y cuánto cuesta" },
        { href: "/menu-digital-para-sodas", label: "Menú digital para sodas" },
        { href: "/#demo", label: "Probar la carta demo" },
      ]}
    />
  );
}
