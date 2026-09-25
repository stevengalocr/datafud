import type { Metadata } from "next";
import { pageSocial } from "@/lib/seo";
import { LegalPage, type LegalSection } from "@/components/marketing/v2/legal-page";
import { PLAN_CODES, PRICING, setupFeeFor, tablesLabel } from "@/lib/constants";
import { formatCrc } from "@/lib/currency/format";
import { SITE, whatsappDisplay } from "@/lib/site";

const DESCRIPTION =
  "Condiciones de DataFud: planes, plazos, garantía de 48 horas, pagos, cancelación, reembolsos, hardware de mesa y entrega, para restaurantes de Costa Rica.";

export const metadata: Metadata = {
  title: "Términos del servicio",
  alternates: { canonical: "/terminos" },
  description: DESCRIPTION,
  ...pageSocial("/terminos", "Términos del servicio · DataFud", DESCRIPTION),
};

const { plans, terms, delivery, hardwareDelivery } = PRICING;

// Todo monto y plazo sale de PRICING: si cambia la oferta, estos términos cambian con ella.
const planBullets = PLAN_CODES.map((code) => {
  const p = plans[code];
  const setup = setupFeeFor(code);
  return `${p.marketingName}: ${formatCrc(p.priceCrc)} al mes y ${formatCrc(setup.crc)} de implementación. ${p.languagesLabel}; ${p.maxProducts ? `hasta ${p.maxProducts} platillos` : "platillos ilimitados"}; ${tablesLabel(code).charAt(0).toLowerCase()}${tablesLabel(code).slice(1)}; ${p.tableOrdering ? "carta digital, pedidos desde la mesa, panel de comandas y reportes de venta" : "carta digital por QR y NFC, sin pedidos desde la mesa"}. Plazo: ${p.deliveryLabel.toLowerCase()}.`;
});

const sections: LegalSection[] = [
  {
    title: "Quién ofrece el servicio",
    paragraphs: [
      `DataFud lo ofrece ${SITE.legalResponsible}, con domicilio en ${SITE.country}. En este documento nos referimos a esa persona como "GaloDev" o "nosotros", y a quien contrata como "el cliente" o "vos".`,
      `Nos contactás por WhatsApp al ${whatsappDisplay()}. Al contratar DataFud aceptás estos términos.`,
    ],
  },
  {
    title: "Qué es DataFud",
    paragraphs: [
      "DataFud es un servicio de carta digital para negocios gastronómicos: el comensal abre la carta en su teléfono escaneando un código QR o acercándolo a una tarjeta NFC. Según el plan, el servicio incluye además pedidos desde la mesa, un panel de comandas y reportes de venta.",
      "También vendemos hardware de mesa (stands impresos en 3D, tarjetas NFC y stands de reseñas) y hacemos la implementación: diseñamos y cargamos tu carta, configuramos el sistema y, en los planes con pedidos, capacitamos a tu equipo.",
    ],
  },
  {
    title: "Qué incluye cada plan",
    paragraphs: ["Los precios están en colones costarricenses; el equivalente en dólares de la página es solo una referencia."],
    bullets: [
      ...planBullets,
      `Todos los planes: ${terms.menuChanges.charAt(0).toLowerCase()}${terms.menuChanges.slice(1)}, y ${terms.support.charAt(0).toLowerCase()}${terms.support.slice(1)}.`,
      `Pago anual de la Carta: ${formatCrc(PRICING.annualCarta.crc)} por año, con la implementación de la Carta incluida.`,
    ],
  },
  {
    title: "Plazos y garantía de 48 horas",
    paragraphs: [
      `Publicamos tu carta digital en ${delivery.menuHours} horas hábiles y dejamos el sistema completo (pedidos, panel y reportes) en ${delivery.fullSystemDays} días. El reloj empieza a correr cuando recibimos el menú con precios, las fotos y el logo; la implementación se paga antes, al aprobar la propuesta (si llegara después, el plazo corre desde el pago).`,
      `Garantía: ${terms.guarantee48h} ${terms.guaranteeRefund} ${terms.guaranteeScope} Si recibimos materiales incompletos, te avisamos qué falta y el plazo empieza cuando lleguen.`,
    ],
  },
  {
    title: "Pagos",
    paragraphs: [
      "Pagás por SINPE Móvil o transferencia bancaria. La implementación se paga al aprobar la propuesta y la mensualidad, por adelantado cada mes. No hacemos cobros automáticos ni guardamos datos de tarjetas.",
      "Recibís comprobante de cada pago. Si tu negocio necesita factura electrónica, avisanos antes de contratar y lo coordinamos.",
      "Si una mensualidad queda sin pagar, podemos pausar la carta hasta que se regularice, siempre avisándote antes por WhatsApp. Cuando se recibe el pago, la carta vuelve a estar disponible.",
    ],
  },
  {
    title: "Cancelación, sin permanencia",
    paragraphs: [
      `No hay contrato de permanencia. Cancelás cuando quieras avisándonos por WhatsApp con ${terms.noticeDays} días de anticipación; el servicio sigue activo hasta el final del período ya pagado. Si avisás al menos ${terms.noticeDays} días antes de tu próxima fecha de pago, ese período ya no se cobra. ${terms.lateNotice}`,
      "Si pagaste el año de la Carta, el período pagado son esos 12 meses: al cancelar, el servicio sigue activo hasta que terminen.",
    ],
  },
  {
    title: "Reembolsos",
    paragraphs: [
      `Si cancelás antes de que empecemos la implementación, te devolvemos el 100 % de lo que pagaste por ella dentro de ${terms.refundDays} días hábiles.`,
      "Una vez publicada la carta, la implementación no es reembolsable, salvo que aplique la garantía de 48 horas. Las mensualidades y el pago anual ya pagados no se prorratean.",
    ],
  },
  {
    title: "Hardware de mesa y entrega",
    paragraphs: [
      `Los stands y tarjetas se hacen a medida con tu logo y colores, así que se producen después de que aprobás el diseño y el precio. ${hardwareDelivery.minimum} Están listos ${hardwareDelivery.leadTime} desde la aprobación del diseño.`,
      `${hardwareDelivery.gam} ${hardwareDelivery.outside}`,
      `Garantía del hardware: ${terms.hardwareWarrantyMonths} meses por defectos de fabricación, con reposición de la pieza. No cubre golpes, exposición a calor directo ni mal uso. Al ser productos personalizados, no admiten devolución por cambio de opinión.`,
    ],
  },
  {
    title: "Tu contenido es tuyo",
    paragraphs: [
      "El menú, las fotos, el logo y la marca de tu local son tuyos. Nos autorizás a usarlos solo para prestarte el servicio y sos responsable de tener derecho a usarlos. Si dejás DataFud, te entregamos tu carta en un archivo.",
      "Los precios y descripciones que publicamos son los que nos pasás; revisalos cuando te mostremos la carta. En los planes con panel, los cambios que hagas vos se publican de inmediato bajo tu responsabilidad.",
    ],
  },
  {
    title: "Disponibilidad y soporte",
    paragraphs: [
      "Tu carta vive en la nube y trabajamos para que esté disponible de forma continua, pero no prometemos un porcentaje de disponibilidad: puede haber interrupciones por mantenimiento o por fallas de proveedores de infraestructura.",
      "Si algo no carga, escribinos por WhatsApp y lo revisamos. Si hace falta, te mandamos un PDF de tu carta para imprimir mientras tanto.",
    ],
  },
  {
    title: "Propiedad intelectual de DataFud",
    paragraphs: [
      "El software, el diseño y la marca DataFud son de GaloDev. Mientras el servicio esté activo te damos una licencia de uso no exclusiva e intransferible.",
    ],
  },
  {
    title: "Datos personales",
    paragraphs: [
      "El tratamiento de los datos que nos das y de la información que se genera al usar el servicio se explica en la Política de privacidad, que forma parte de estos términos.",
    ],
  },
  {
    title: "Límite de responsabilidad",
    paragraphs: [
      "DataFud es una herramienta para mostrar tu carta y, según el plan, gestionar pedidos. No respondemos por errores en precios o descripciones que nos entregaste, por decisiones comerciales tomadas con base en los reportes, ni por daños indirectos o lucro cesante.",
      "En cualquier caso, nuestra responsabilidad total frente a vos se limita a lo que nos hayas pagado por el servicio en los tres meses anteriores al hecho que la origine.",
    ],
  },
  {
    title: "Cambios a estos términos",
    paragraphs: [
      `Si cambiamos estos términos de forma relevante, te avisamos por WhatsApp con al menos ${terms.noticeDays} días de anticipación. Si no estás de acuerdo, podés cancelar sin costo antes de que entren en vigor.`,
    ],
  },
  {
    title: "Ley aplicable",
    paragraphs: [
      `Estos términos se rigen por las leyes de la República de ${SITE.country}. Cualquier diferencia se intenta resolver primero de forma directa; si no se logra, la resuelven los tribunales de la República de ${SITE.country}.`,
    ],
  },
];

export default function TerminosPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Términos del servicio"
      intro="Acá está, en lenguaje claro, lo que podés esperar de DataFud y lo que nosotros esperamos de vos. Si algo no queda claro, preguntanos antes de contratar."
      sections={sections}
      sibling={{ href: "/privacidad", label: "Política de privacidad" }}
    />
  );
}
