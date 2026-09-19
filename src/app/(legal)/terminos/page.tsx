import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketing/v2/legal-page";
import { PRICING } from "@/lib/constants";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Términos del servicio",
  alternates: { canonical: "/terminos" },
  openGraph: { title: "Términos del servicio · DataFud", url: "/terminos" },
  description:
    "Condiciones bajo las que GaloDev ofrece DataFud: carta digital por QR y NFC, hardware de mesa e implementación llave en mano para restaurantes de Costa Rica y Latinoamérica.",
};

const sections: LegalSection[] = [
  {
    title: "Quién ofrece el servicio",
    paragraphs: [
      `DataFud es un producto de ${SITE.legalName} [REVISAR: razón social completa], [REVISAR: cédula jurídica o física], con domicilio en [REVISAR: domicilio], ${SITE.country}. En este documento nos referimos a esa persona como "GaloDev", "nosotros" o "el proveedor", y a quien contrata como "el cliente" o "vos".`,
      `Podés contactarnos por WhatsApp o al correo ${SITE.email}. Al contratar DataFud aceptás estos términos.`,
    ],
  },
  {
    title: "Qué es DataFud",
    paragraphs: [
      "DataFud es un servicio de carta digital para negocios gastronómicos: el comensal abre la carta en su teléfono escaneando un código QR o acercándolo a una tarjeta NFC. Según el plan contratado, el servicio incluye además pedidos desde la mesa, un panel de comandas y reportes de venta.",
      "También ofrecemos hardware de mesa (stands impresos en 3D, tarjetas NFC y stands de reseñas) y un servicio de implementación llave en mano: diseñamos y cargamos la carta, configuramos el sistema y capacitamos a tu equipo.",
    ],
  },
  {
    title: "Contratación, precios y pagos",
    paragraphs: [
      `El servicio se contrata con un pago único de implementación (USD ${PRICING.setupFeeUsd}) y una mensualidad según el plan elegido (Carta USD ${PRICING.plans.basico.priceUsd}, Estándar USD ${PRICING.plans.estandar.priceUsd}, Empresarial USD ${PRICING.plans.empresarial.priceUsd}). El hardware de mesa se cotiza y cobra por unidad, aparte.`,
      "Los precios se expresan en dólares estadounidenses. El medio de pago y, si aplica, el tipo de cambio a moneda local se acuerdan por WhatsApp antes de cada cobro. No realizamos cobros automáticos ni almacenamos datos de tarjetas.",
      "La mensualidad se paga por adelantado. Si un pago se atrasa más de [REVISAR: 10] días, podemos suspender el servicio hasta que se regularice; la carta vuelve a estar disponible cuando se recibe el pago.",
    ],
  },
  {
    title: "Sin permanencia: cómo cancelar",
    paragraphs: [
      "No hay contratos de permanencia. Podés cancelar en cualquier momento avisándonos por WhatsApp o correo; el servicio se mantiene hasta el final del período mensual ya pagado y no se cobra nada más.",
      "El pago de implementación y el hardware ya producido no son reembolsables, porque corresponden a trabajo y materiales ya entregados [REVISAR: confirmar política de reembolsos].",
    ],
  },
  {
    title: "Plazos de entrega",
    paragraphs: [
      `Publicamos tu carta digital en un plazo de ${PRICING.delivery.menuHours} horas y el sistema completo (pedidos, panel y reportes) en ${PRICING.delivery.fullSystemDays} días. Ambos plazos se cuentan a partir de que recibimos el pago de implementación y los materiales necesarios (menú con precios, fotos y logo).`,
      "Los plazos del hardware de mesa se indican en cada cotización. Si un plazo no se puede cumplir por causas ajenas a nosotros (por ejemplo, materiales incompletos), te avisamos y acordamos una nueva fecha.",
    ],
  },
  {
    title: "Contenido y materiales del cliente",
    paragraphs: [
      "Vos sos responsable del contenido que nos entregás para tu carta: nombres, descripciones, precios, fotos y logo. Declarás que tenés derecho a usarlos y nos autorizás a reproducirlos únicamente para prestar el servicio.",
      "Los cambios de menú en el plan Carta se solicitan por WhatsApp y los aplicamos nosotros. En los planes con panel, los cambios que hagas vos se publican de inmediato bajo tu responsabilidad.",
    ],
  },
  {
    title: "Hardware de mesa",
    paragraphs: [
      "Los stands y tarjetas se fabrican a medida con tu logo y colores, por lo que se producen solo después de aprobar el diseño y la cotización. Al ser productos personalizados, no admiten devolución salvo defecto de fabricación, en cuyo caso los reponemos sin costo [REVISAR: plazo de garantía del hardware].",
    ],
  },
  {
    title: "Disponibilidad y soporte",
    paragraphs: [
      "Hacemos un esfuerzo razonable para que tu carta esté disponible de forma continua. Puede haber interrupciones breves por mantenimiento o por causas de los proveedores de infraestructura; en ese caso trabajamos para restablecer el servicio lo antes posible.",
      `El soporte se brinda por WhatsApp en horario de oficina de ${SITE.country}. La implementación incluye un año de soporte técnico; después, el soporte continúa incluido mientras la mensualidad esté al día.`,
    ],
  },
  {
    title: "Propiedad intelectual",
    paragraphs: [
      "El software, el diseño y la marca DataFud son propiedad de GaloDev. Te concedemos una licencia de uso no exclusiva mientras el servicio esté activo. Tu marca, tu menú y tus fotos siguen siendo tuyos.",
    ],
  },
  {
    title: "Datos personales",
    paragraphs: [
      "El tratamiento de los datos de contacto que nos das y de la información que se genera al usar el servicio se describe en nuestra Política de privacidad, que forma parte de estos términos.",
    ],
  },
  {
    title: "Responsabilidad",
    paragraphs: [
      "DataFud es una herramienta para mostrar tu carta y, según el plan, gestionar pedidos. No somos responsables por errores en los precios o descripciones que nos entregaste, por decisiones comerciales tomadas con base en los reportes, ni por daños indirectos o lucro cesante.",
      "En cualquier caso, nuestra responsabilidad total frente a vos se limita al monto que nos hayas pagado en los [REVISAR: tres] meses anteriores al hecho que la origine.",
    ],
  },
  {
    title: "Cambios a estos términos",
    paragraphs: [
      "Podemos actualizar estos términos. Si el cambio es relevante, te avisamos por WhatsApp o correo con al menos [REVISAR: 15] días de anticipación. Si no estás de acuerdo, podés cancelar sin costo antes de que entre en vigor.",
    ],
  },
  {
    title: "Ley aplicable",
    paragraphs: [
      `Estos términos se rigen por las leyes de la República de ${SITE.country}. Cualquier diferencia se intentará resolver primero de forma directa; de no lograrlo, se someterá a los tribunales de [REVISAR: jurisdicción, por ejemplo San José, Costa Rica].`,
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
