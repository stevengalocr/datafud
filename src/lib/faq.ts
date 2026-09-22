import { PRICING } from "@/lib/constants";
import { formatCrc } from "@/lib/currency/format";

// Preguntas frecuentes de la landing. Un solo arreglo: lo usa el acordeón (#preguntas) y el
// JSON-LD FAQPage. Las cinco primeras son las objeciones de docs/MARKETING.md §8.

export type FaqItem = { id: string; q: string; a: string };

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "no-soy-tecnico",
    q: "No soy técnico. ¿Es complicado?",
    a: `No, porque no lo montás vos. Nos pasás el menú, las fotos y el logo, y nosotros armamos la carta con tu marca y la publicamos en ${PRICING.delivery.menuHours} horas. Si vas por pedidos en mesa, en ${PRICING.delivery.fullSystemDays} días te dejamos el sistema funcionando y capacitamos a tu equipo. Vos seguís atendiendo tu local.`,
  },
  {
    id: "y-si-no-me-sirve",
    q: "¿Y si no me sirve?",
    a: "Primero probá la demo en vivo, gratis y sin hablar con nadie. Si arrancás y un mes no te sirve, lo dejás: no hay contratos de permanencia ni penalidades. La implementación es un pago único por el trabajo de montar tu carta y tu hardware.",
  },
  {
    id: "mis-clientes",
    q: "¿Mis clientes van a saber usarlo?",
    a: "Solo tienen que apuntar la cámara al QR o acercar el teléfono a la tarjeta NFC. No descargan ninguna app ni crean cuenta: la carta se abre en el navegador del teléfono, como una página más.",
  },
  {
    id: "ya-tengo-carta",
    q: "Ya tengo carta impresa. ¿Para qué cambiar?",
    a: "Porque la impresa se ensucia, se desactualiza y hay que reimprimirla cada vez que cambiás un precio. La digital se actualiza sin costo, se ve con fotos, habla varios idiomas y, con el sistema completo, te dice qué se vende y cuánto.",
  },
  {
    id: "clientes-extranjeros",
    q: "Tengo clientes extranjeros. ¿La carta se traduce?",
    a: "Sí. La carta puede estar en español, inglés y portugués; Carta y Estándar incluyen español e inglés; Empresarial suma portugués. El comensal cambia de idioma con un toque.",
  },
  {
    id: "internet-en-el-local",
    q: "¿Necesito internet en el local?",
    a: "Para la carta, no: el comensal la abre con los datos de su propio teléfono. Para recibir pedidos en cocina sí hace falta una conexión estable en el local (WiFi o datos) para la pantalla o tablet donde llegan las comandas.",
  },
  {
    id: "cambios-de-precio",
    q: "¿Qué pasa si cambio precios o platillos?",
    a: "Con el plan Carta nos escribís por WhatsApp y lo actualizamos sin reimprimir nada. Con Estándar o Empresarial lo cambiás vos desde el panel y se ve en todas las mesas al instante. Los QR y las tarjetas siguen siendo los mismos.",
  },
  {
    id: "como-pago",
    q: "¿Cómo se paga?",
    a: `La implementación (${formatCrc(PRICING.setupFee.carta.crc)} la Carta, ${formatCrc(PRICING.setupFee.sistema.crc)} el sistema completo) se paga al arrancar y la mensualidad del plan, cada mes, por adelantado. No hay cobros automáticos ni tarjeta guardada.`,
  },
  {
    id: "tipos-de-negocio",
    q: "¿Sirve para un bar, una cafetería, un food truck o un hotel?",
    a: "Sí. Funciona en cualquier lugar donde alguien mire una carta y pida: sodas, restaurantes, cafeterías, bares, food trucks, hoteles, panaderías o dark kitchens. El hardware de mesa se adapta: stands para mesas, tarjetas para barras y mostradores.",
  },
  {
    id: "empezar-con-carta",
    q: "¿Puedo empezar solo con la carta y sumar pedidos después?",
    a: "Sí, es lo más común. Arrancás con el plan Carta y, cuando quieras recibir pedidos desde la mesa, cambiás a Estándar o Empresarial. Los stands y las tarjetas que ya tenés siguen funcionando.",
  },
  {
    id: "que-incluye",
    q: "¿Qué incluye la implementación?",
    a: `El diseño y la carga de tu carta con tus fotos y colores y la traducción a los idiomas de tu plan. La del sistema completo suma pedidos, panel y la capacitación de tu equipo. ${PRICING.terms.support}. El hardware de mesa (stands QR 3D y tarjetas NFC) se cobra aparte por unidad.`,
  },
];
