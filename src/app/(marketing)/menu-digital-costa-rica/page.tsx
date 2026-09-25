import type { Metadata } from "next";
import { pageSocial } from "@/lib/seo";
import { GuidePage, type GuideFaq, type GuideSection } from "@/components/marketing/v2/guide-page";
import { PRICING } from "@/lib/constants";
import { formatCrc } from "@/lib/currency/format";

const PATH = "/menu-digital-costa-rica";
const TITLE = "Menú digital en Costa Rica: qué es, cuánto cuesta y cómo tenerlo";

const DESCRIPTION =
  `Guía para restaurantes, sodas y cafeterías de Costa Rica: qué es un menú digital con QR, cuánto cuesta según el tipo de servicio y qué incluye DataFud, desde ${formatCrc(PRICING.plans.basico.priceCrc)} al mes.`;

export const metadata: Metadata = {
  title: "Menú digital con QR en Costa Rica: precios y cómo tenerlo",
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  ...pageSocial(PATH, "Menú digital con QR en Costa Rica · DataFud", DESCRIPTION),
};

const { plans, delivery, terms } = PRICING;
const carta = plans.basico;

const sections: GuideSection[] = [
  {
    title: "Qué es un menú digital con QR",
    paragraphs: [
      "Es tu carta de siempre, pero abierta en el teléfono del cliente. En cada mesa hay un código QR (o una tarjeta NFC); el comensal lo escanea con la cámara y la carta se abre en el navegador, sin descargar ninguna aplicación ni crear una cuenta.",
      "A diferencia de un PDF escaneado, un menú digital bien hecho se lee cómodo en una pantalla chica: platillos con foto, categorías que se tocan para saltar de los desayunos a las bebidas, precios claros y la opción de cambiar de idioma. Y cuando subís un precio, lo cambiás en un lugar y se actualiza en todas las mesas, sin reimprimir.",
    ],
  },
  {
    title: "Cuánto cuesta un menú QR en Costa Rica",
    paragraphs: [
      "Antes de comparar precios conviene separar tres tipos de servicio, porque resuelven cosas distintas. Los montos son los precios publicados por proveedores locales en setiembre de 2026, y cambian de uno a otro. Si te dan una cotización distinta, hacele caso a la cotización:",
    ],
    bullets: [
      "Autoservicio o PDF con QR: una plataforma donde vos mismo armás la carta, o un PDF de tu menú detrás de un código. En el mercado local suelen andar entre ₡30 000 y ₡60 000 al año. Es lo más económico, pero el trabajo de cargar, traducir y mantener la carta queda de tu lado.",
      "Sistemas de pedidos en línea: pensados para que el cliente pida desde la mesa o para llevar. Hay opciones desde unos US$10 al mes, normalmente también en modalidad de autoservicio.",
      "Puntos de venta con factura electrónica: cajas registradoras en la nube, desde unos US$20 a US$29 al mes. Resuelven la facturación y el inventario; la carta para el comensal es secundaria.",
    ],
  },
  {
    title: "Autoservicio o que te lo monten",
    paragraphs: [
      "La pregunta real no es solo cuánto cuesta, sino quién hace el trabajo. Montar una carta con fotos, ordenar categorías, escribir descripciones que abran apetito, traducirla y dejar los QR bien impresos en cada mesa lleva horas. Si tenés ese tiempo, el autoservicio te sirve. Si preferís seguir atendiendo tu local, lo lógico es un servicio donde alguien lo hace por vos.",
      `Ese es el caso de DataFud: nos pasás el menú como lo tengás (foto, PDF o escrito a mano), las fotos y el logo, y en ${delivery.menuHours} horas hábiles tu carta está publicada con tu marca, en español e inglés. Si después querés recibir pedidos desde la mesa, el sistema completo queda listo en ${delivery.fullSystemDays} días hábiles.`,
    ],
  },
  {
    title: "Qué incluye DataFud",
    paragraphs: [
      `El plan Carta cuesta ${formatCrc(carta.priceCrc)} al mes, con una implementación única de ${formatCrc(PRICING.setupFee.carta.crc)}. Incluye:`,
    ],
    bullets: [
      "Diseño de la carta con tus colores, tu logo y las fotos de tus platillos.",
      `Español e inglés, y hasta ${carta.maxProducts} platillos.`,
      `${terms.menuChanges}.`,
      `${terms.support}.`,
      `Garantía: ${terms.guarantee48h.charAt(0).toLowerCase()}${terms.guarantee48h.slice(1)}`,
    ],
  },
  {
    title: "Lo que va en la mesa",
    paragraphs: [
      "El QR pegado con cinta se despega, se moja y termina ilegible. Por eso hacemos stands impresos en 3D con tu logo en relieve y tarjetas NFC para quienes prefieren acercar el teléfono en vez de usar la cámara. Los diseñamos e imprimimos en Costa Rica, sin pedido mínimo, y los entregamos en la GAM sin costo.",
    ],
  },
  {
    title: "Cómo se pone en marcha",
    paragraphs: [
      "Hablamos por WhatsApp, elegís el plan y nos mandás el material. Cuando la publicamos, revisás precios y descripciones; si algo no está bien, lo corregimos sin costo. Mientras llegan los stands, te dejamos un QR provisional para empezar a usarla el mismo día.",
    ],
  },
];

const faqs: GuideFaq[] = [
  {
    q: "¿Necesito cambiar mi sistema de facturación?",
    a: "No. La carta digital convive con la caja o el sistema de facturación que ya usás; DataFud no emite facturas del restaurante.",
  },
  {
    q: "¿El cliente tiene que descargar algo?",
    a: "No. Escanea el QR con la cámara o acerca el teléfono a la tarjeta NFC, y la carta se abre en el navegador.",
  },
  {
    q: "¿Cómo se paga el servicio?",
    a: "Por SINPE Móvil o transferencia. La implementación al aprobar la propuesta y la mensualidad por adelantado cada mes, sin contrato de permanencia.",
  },
  {
    q: "¿Puedo verlo funcionando antes?",
    a: "Sí. En la carta demo de un restaurante de ejemplo podés recorrer la carta como la vería tu cliente, desde tu propio teléfono.",
  },
];

export default function Page() {
  return (
    <GuidePage
      path={PATH}
      eyebrow="Guía"
      title={TITLE}
      intro={`Qué es una carta con QR, cuánto se paga en el mercado según quién hace el trabajo y qué incluye DataFud, desde ${formatCrc(carta.priceCrc)} al mes.`}
      sections={sections}
      faqs={faqs}
      origin="guia-costa-rica"
      ctaTitle="¿Querés tu carta digital?"
      related={[
        { href: "/menu-digital-para-sodas", label: "Menú digital para sodas" },
        { href: "/menu-qr-restaurantes-turisticos", label: "Menú QR para restaurantes turísticos" },
        { href: "/#preguntas", label: "Preguntas frecuentes" },
      ]}
    />
  );
}
