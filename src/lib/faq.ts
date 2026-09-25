import { PLAN_CODES, PRICING, firstPaymentFor, firstYearMonthly, founderOfferActive, hardwareBy, setupFeeFor } from "@/lib/constants";
import { formatCrc } from "@/lib/currency/format";

// Preguntas frecuentes de la landing. Un solo arreglo: lo usa el acordeón (#preguntas) y el
// JSON-LD FAQPage, así que lo visible y lo estructurado coinciden 1:1. Respuestas tomadas de
// PRICING y de las decisiones D-023 a D-027, D-034 a D-038, D-047, D-048 y D-057 a D-060. Orden: precio → qué
// incluye → cómo pago → plazos → hardware → lo demás. Máximo 18. La factura electrónica no se
// promete hasta que Steven la confirme (D-047).

export type FaqItem = { id: string; q: string; a: string };

const { plans, terms, founderOffer, delivery, hardwareDelivery } = PRICING;

const firstMonth = PLAN_CODES.map((code) => {
  const setup = setupFeeFor(code);
  return `${plans[code].marketingName}: ${formatCrc(setup.crc)} de implementación + ${formatCrc(plans[code].priceCrc)} del primer mes = ${formatCrc(firstPaymentFor(code).crc)}.`;
}).join(" ");
// D-035: la implementación y la primera mensualidad no se pagan el mismo día.
const whenPaid = "La implementación se paga al aprobar la propuesta y la primera mensualidad, el día que tu carta queda publicada.";

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "primer-mes",
    q: "¿Cuánto pago en total el primer mes?",
    a: `${firstMonth} ${whenPaid} Después pagás solo la mensualidad.${founderOfferActive() ? ` Si entrás entre los primeros ${founderOffer.spots} locales, vale en cualquier plan: en la Carta la implementación no se cobra y en Estándar o Empresarial se descuentan ${formatCrc(PRICING.setupFee.carta.crc)} de la del sistema; en los dos casos te damos 1 stand QR 3D, a cambio de dejarnos mostrar tu local como caso (nombre, logo y capturas de tu carta). ${terms.founderConsent}` : ""}`,
  },
  {
    id: "por-que-cuesta-mas",
    q: "¿Por qué cuesta más que una carta QR que armo yo?",
    a: `Porque no la armás vos: nosotros diseñamos la carta con tu marca, cargamos los platillos con fotos, la traducimos al inglés y te hacemos los cambios por WhatsApp. Si tenés tiempo para hacerlo, una herramienta de autoservicio te puede servir. Con DataFud, el primer año de la Carta sale ${formatCrc(firstYearMonthly("basico").crc)} pagando mes a mes, o ${formatCrc(PRICING.annualCarta.crc)} si pagás el año (con la implementación incluida).`,
  },
  {
    id: "que-incluye",
    q: "¿Qué incluye la implementación?",
    a: `El diseño de tu carta con tu marca, la carga de platillos con fotos y precios, y la traducción al inglés (y al portugués en Empresarial). La del sistema completo suma pedidos desde la mesa, panel, reportes y la capacitación de tu equipo. Después, en todos los planes van incluidos los cambios de precios y platillos por WhatsApp y el ${terms.support.charAt(0).toLowerCase()}${terms.support.slice(1)}. El hardware de mesa se cobra aparte.`,
  },
  {
    id: "iva",
    q: "¿Los precios incluyen IVA?",
    a: `Sí. ${terms.ivaIncluded} Lo que ves en esta página es lo que pagás, sin sumarle el 13 % después.`,
  },
  {
    id: "como-pago",
    q: "¿Cómo pago?",
    a: "Por SINPE Móvil o transferencia bancaria. La implementación se paga al aprobar la propuesta. La mensualidad se paga por adelantado cada mes, desde el día que tu carta queda publicada. No hay cobros automáticos ni tarjeta guardada.",
  },
  {
    id: "cuando-empiezo",
    q: "¿Cuándo empiezo a pagar la mensualidad?",
    a: `${terms.billingStart} Mientras la estamos montando no corre. La implementación sí se paga antes, al aprobar la propuesta.`,
  },
  {
    id: "factura",
    q: "¿Me dan factura?",
    a: "Recibís un comprobante de cada pago. Si necesitás algo más para tu contabilidad, preguntanos por WhatsApp antes de contratar. Ojo: DataFud no emite las facturas de tu restaurante; convive con el sistema de facturación que ya usás.",
  },
  {
    id: "contrato",
    q: "¿Hay contrato?",
    a: `No hay contrato de permanencia: cancelás con ${terms.noticeDays} días de aviso por WhatsApp, y el servicio sigue hasta el final del período ya pagado. ${terms.lateNotice} Antes de decidir podés probar la demo, sin hablar con nadie.`,
  },
  {
    id: "no-soy-tecnico",
    q: "No soy técnico. ¿Es complicado?",
    a: `No, porque no lo montás vos. Nos pasás el menú, las fotos y el logo, y publicamos tu carta en ${delivery.menuHours} horas hábiles. Si vas por pedidos en mesa, en ${delivery.fullSystemDays} días hábiles te dejamos el sistema funcionando y capacitamos a tu equipo.`,
  },
  {
    id: "garantia-48",
    q: "¿Qué pasa si no cumplen el plazo?",
    a: `${terms.guarantee48h} ${terms.guaranteeRefund} ${terms.guaranteeScope} El plazo corre desde que tenemos todo el material y el pago de la implementación, lo que llegue último; si falta algo, te avisamos qué.`,
  },
  {
    id: "habiles",
    q: "¿Qué quiere decir “hábiles”?",
    a: `${terms.businessDays} Por ejemplo, si nos mandás todo un viernes, el sábado y el domingo no cuentan.`,
  },
  {
    id: "cambios-de-precio",
    q: "¿Y si cambio precios o platillos?",
    a: `${terms.menuChanges}: nos escribís y lo actualizamos, sin reimprimir nada. Con Estándar o Empresarial también podés cambiarlo vos desde el panel. Los QR y las tarjetas siguen siendo los mismos.`,
  },
  {
    id: "empezar-con-carta",
    q: "¿Puedo empezar solo con la carta y sumar pedidos después?",
    a: `Sí. Arrancás con la Carta y, cuando quieras recibir pedidos desde la mesa, pasás a Estándar o Empresarial: el cambio lleva la implementación del sistema completo (${formatCrc(PRICING.setupFee.sistema.crc)}) y desde ahí la mensualidad del plan nuevo. ${terms.upgradeCredit}${founderOfferActive() ? ` ${terms.upgradeCreditFounder}` : ""} Los stands y las tarjetas que ya tenés siguen funcionando.`,
  },
  {
    id: "pago-hardware",
    q: "¿Cómo se paga el hardware?",
    a: `${terms.hardwarePayment} Se hace a medida, así que hay costo de material antes de entregarlo.${founderOfferActive() ? ` La excepción es el stand incluido en la oferta de los primeros ${founderOffer.spots} locales, que no se cobra.` : ""}`,
  },
  {
    id: "pedido-minimo",
    q: "¿Hay pedido mínimo de stands? ¿Hacen envíos fuera de la GAM?",
    a: `No hay mínimo: se hacen desde 1 unidad. Stand QR 3D desde ${formatCrc(hardwareBy("stand-qr-3d").priceCrc)} y tarjeta NFC a ${formatCrc(hardwareBy("tarjeta-nfc").priceCrc)}. ${hardwareDelivery.custom} Están listos ${hardwareDelivery.leadTime} desde que aprobás el diseño. ${hardwareDelivery.gam} ${hardwareDelivery.outside}`,
  },
  {
    id: "mis-clientes",
    q: "¿Mis clientes van a saber usarlo? ¿Y los turistas?",
    a: "Solo apuntan la cámara al QR o acercan el teléfono a la tarjeta NFC, sin descargar apps ni crear cuentas. La carta está en español e inglés en todos los planes y el comensal cambia de idioma con un toque.",
  },
  {
    id: "uber-pedidosya",
    q: "¿Se conecta con Uber Eats o PedidosYa?",
    a: "No hay integración. DataFud es tu carta y tu canal propio dentro del local, sin comisiones por pedido.",
  },
  {
    id: "si-algo-falla",
    q: "¿Qué pasa si algo falla?",
    a: "Tu carta vive en la nube; si algo no carga, escribinos por WhatsApp y lo revisamos. Si hace falta, te mandamos un PDF de tu carta para imprimir mientras tanto. Para la carta no necesitás internet en el local: el comensal usa los datos de su teléfono (sin datos ni WiFi no se abre, así que si tus clientes suelen llegar sin datos conviene ofrecerles WiFi). Para recibir pedidos en cocina sí hace falta conexión en el local.",
  },
];
