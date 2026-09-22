import type { Metadata } from "next";
import { GuidePage, type GuideFaq, type GuideSection } from "@/components/marketing/v2/guide-page";
import { PRICING } from "@/lib/constants";
import { formatCrc } from "@/lib/currency/format";

const PATH = "/menu-digital-para-sodas";
const TITLE = "Menú digital para sodas: tu carta con QR, en colones y fácil de cambiar";

export const metadata: Metadata = {
  title: "Menú digital para sodas en Costa Rica",
  description:
    "Carta digital con QR para sodas: precios en colones, cambios por WhatsApp cuando sube el precio del casado y stands impresos en 3D que aguantan el día a día. Desde ₡14 900 al mes.",
  alternates: { canonical: PATH },
  openGraph: { title: "Menú digital para sodas · DataFud", url: PATH },
};

const { plans, terms, annualCarta, hardware, hardwareDelivery } = PRICING;
const carta = plans.basico;

const sections: GuideSection[] = [
  {
    title: "Una soda no necesita un sistema complicado",
    paragraphs: [
      "La carta de una soda suele ser corta y directa: desayunos, el casado con sus opciones de proteína, un par de platos del día, bocas y frescos. Lo que sí cambia seguido son los precios, porque el costo de los ingredientes sube y baja. Con una carta impresa o una pizarra, cada ajuste es borrar, reescribir o mandar a imprimir otra vez.",
      "Un menú digital con QR resuelve eso sin pedirte que aprendás un programa nuevo. Tu cliente escanea el código de la mesa, ve la carta con foto y precio en colones, y vos seguís cocinando.",
    ],
  },
  {
    title: "Precios en colones y cambios por WhatsApp",
    paragraphs: [
      "La carta muestra los precios en colones, redondos y sin decimales, como los cobrás. Cuando algo cambia, no tenés que entrar a ningún panel: nos mandás un WhatsApp con el cambio y lo publicamos. Si el casado de pollo sube ₡300, en cuanto lo actualizamos todas tus mesas muestran el precio nuevo, sin tocar los QR.",
      `${terms.menuChanges}, también en el plan más básico. Lo mismo para agregar el plato del día de temporada o marcar algo como agotado.`,
    ],
  },
  {
    title: "Stands que aguantan el día a día",
    paragraphs: [
      "En una soda las mesas se limpian muchas veces al día. Un QR de papel plastificado se despega, se moja o se raya. Los stands de DataFud se imprimen en 3D, con el código en relieve y tu logo, y se limpian con un trapo como cualquier otra cosa de la mesa.",
    ],
    bullets: [
      `Stand QR 3D desde ${formatCrc(hardware[0].priceCrc)} por unidad; ${hardwareDelivery.minimum.charAt(0).toLowerCase()}${hardwareDelivery.minimum.slice(1)}`,
      `Tarjeta NFC a ${formatCrc(hardware[1].priceCrc)}, para quien prefiere acercar el teléfono.`,
      `${hardwareDelivery.gam} Fuera de la GAM, por Correos de Costa Rica.`,
    ],
  },
  {
    title: "El plan que le calza a una soda",
    paragraphs: [
      `Para la mayoría de sodas alcanza con el plan Carta: ${formatCrc(carta.priceCrc)} al mes, con una implementación de ${formatCrc(PRICING.setupFee.carta.crc)}. Incluye hasta ${carta.maxProducts} platillos con foto, español e inglés, tus colores y tu logo. Si preferís pagar el año, son ${formatCrc(annualCarta.crc)}, con dos meses gratis y la implementación incluida.`,
      "Si más adelante querés que los clientes pidan desde la mesa y que las comandas lleguen a la cocina, pasás a Estándar sin cambiar los stands que ya tenés.",
    ],
  },
  {
    title: "Mirá un ejemplo real de carta",
    paragraphs: [
      "Montamos una soda de ejemplo, Verde Limón, con gallo pinto, casados, bocas y frescos, para que veás cómo se ve una carta de soda en el teléfono antes de decidir. Los datos son de ejemplo y nada se guarda.",
    ],
  },
];

const faqs: GuideFaq[] = [
  {
    q: "¿Y si no tengo fotos de los platillos?",
    a: "Podés mandarnos fotos tomadas con el celular en buena luz y las acomodamos. Los platillos sin foto se ven igual de claros, con nombre, descripción y precio.",
  },
  {
    q: "¿Puedo tener el plato del día?",
    a: "Sí. Nos avisás por WhatsApp qué hay hoy y lo publicamos; los cambios de platillos están incluidos en todos los planes.",
  },
  {
    q: "¿Cuánto pago el primer mes?",
    a: `Con el plan Carta, ${formatCrc(PRICING.setupFee.carta.crc)} de implementación más ${formatCrc(carta.priceCrc)} del primer mes. Después, solo la mensualidad.`,
  },
  {
    q: "¿Mis clientes van a saber usarlo?",
    a: "Solo apuntan la cámara al código. No descargan nada ni crean cuentas; la carta se abre como una página más.",
  },
];

export default function Page() {
  return (
    <GuidePage
      path={PATH}
      eyebrow="Sodas"
      title={TITLE}
      intro={`Para sodas de Costa Rica que quieren dejar de reimprimir la carta cada vez que cambia un precio. Te la montamos nosotros, desde ${formatCrc(carta.priceCrc)} al mes.`}
      sections={sections}
      faqs={faqs}
      origin="guia-sodas"
      ctaTitle="¿Montamos la carta de tu soda?"
      related={[
        { href: "/menu-digital-costa-rica", label: "Menú digital en Costa Rica: qué es y cuánto cuesta" },
        { href: "/menu-qr-restaurantes-turisticos", label: "Menú QR para restaurantes turísticos" },
        { href: "/#hardware", label: "Stands QR 3D y tarjetas NFC" },
      ]}
    />
  );
}
