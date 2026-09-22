import { PLAN_CODES, PRICING, firstPaymentFor, setupFeeFor } from "@/lib/constants";
import { formatCrc } from "@/lib/currency/format";

// Preguntas frecuentes de la landing. Un solo arreglo: lo usa el acordeón (#preguntas) y el
// JSON-LD FAQPage, así que lo visible y lo estructurado coinciden 1:1. Respuestas tomadas de
// PRICING y de las decisiones D-023 a D-027. Orden: precio → qué incluye → cómo pago → plazos →
// hardware → lo demás. Máximo 15.

export type FaqItem = { id: string; q: string; a: string };

const { plans, terms, founderOffer, delivery, hardwareDelivery } = PRICING;

const firstMonth = PLAN_CODES.map((code) => {
  const setup = setupFeeFor(code);
  return `${plans[code].marketingName}: ${formatCrc(setup.crc)} de implementación + ${formatCrc(plans[code].priceCrc)} del primer mes = ${formatCrc(firstPaymentFor(code).crc)}.`;
}).join(" ");

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "primer-mes",
    q: "¿Cuánto pago en total el primer mes?",
    a: `${firstMonth} Después pagás solo la mensualidad.${founderOffer.enabled ? ` Si entrás entre los primeros ${founderOffer.spots} locales, la implementación de la Carta no se cobra y te damos 1 stand QR 3D, a cambio de dejarnos mostrar tu local como caso.` : ""}`,
  },
  {
    id: "que-incluye",
    q: "¿Qué incluye la implementación?",
    a: `El diseño de tu carta con tu marca, la carga de platillos con fotos y precios, y la traducción al inglés (y al portugués en Empresarial). La del sistema completo suma pedidos desde la mesa, panel, reportes y la capacitación de tu equipo. En todos los planes, ${terms.menuChanges.charAt(0).toLowerCase()}${terms.menuChanges.slice(1)}, y ${terms.support.charAt(0).toLowerCase()}${terms.support.slice(1)}. El hardware de mesa se cobra aparte.`,
  },
  {
    id: "como-pago",
    q: "¿Cómo pago?",
    a: "Por SINPE Móvil o transferencia bancaria. La implementación se paga al aprobar la propuesta y la mensualidad, por adelantado cada mes. No hay cobros automáticos ni tarjeta guardada.",
  },
  {
    id: "factura",
    q: "¿Me dan factura?",
    a: "Recibís comprobante de cada pago. Si tu negocio necesita factura electrónica, avisanos antes de contratar y lo coordinamos.",
  },
  {
    id: "contrato",
    q: "¿Hay contrato?",
    a: `No hay contrato de permanencia: cancelás con ${terms.noticeDays} días de aviso por WhatsApp o correo, y el servicio sigue hasta el final del mes ya pagado. Antes de decidir podés probar la demo, sin hablar con nadie.`,
  },
  {
    id: "no-soy-tecnico",
    q: "No soy técnico. ¿Es complicado?",
    a: `No, porque no lo montás vos. Nos pasás el menú, las fotos y el logo, y publicamos tu carta en ${delivery.menuHours} horas. Si vas por pedidos en mesa, en ${delivery.fullSystemDays} días te dejamos el sistema funcionando y capacitamos a tu equipo.`,
  },
  {
    id: "garantia-48",
    q: "¿Qué pasa si no cumplen el plazo?",
    a: `${terms.guarantee48h} El plazo corre desde que tenemos todo; si falta algo, te avisamos qué.`,
  },
  {
    id: "cambios-de-precio",
    q: "¿Y si cambio precios o platillos?",
    a: `${terms.menuChanges}: nos escribís y lo actualizamos, sin reimprimir nada. Con Estándar o Empresarial también podés cambiarlo vos desde el panel. Los QR y las tarjetas siguen siendo los mismos.`,
  },
  {
    id: "empezar-con-carta",
    q: "¿Puedo empezar solo con la carta y sumar pedidos después?",
    a: "Sí, es lo más común. Arrancás con la Carta y, cuando quieras recibir pedidos desde la mesa, pasás a Estándar o Empresarial. Los stands y las tarjetas que ya tenés siguen funcionando.",
  },
  {
    id: "pedido-minimo",
    q: "¿Hay pedido mínimo de stands?",
    a: `No. ${hardwareDelivery.minimum.replace("Sin pedido mínimo: d", "D")} Stand QR 3D desde ${formatCrc(PRICING.hardware[0].priceCrc)} y tarjeta NFC a ${formatCrc(PRICING.hardware[1].priceCrc)}. ${hardwareDelivery.custom} Están listos ${hardwareDelivery.leadTime} desde que aprobás el diseño.`,
  },
  {
    id: "envios",
    q: "¿Hacen envíos fuera de la GAM?",
    a: `Sí. ${hardwareDelivery.gam} ${hardwareDelivery.outside}`,
  },
  {
    id: "mis-clientes",
    q: "¿Mis clientes van a saber usarlo? ¿Y los turistas?",
    a: "Solo apuntan la cámara al QR o acercan el teléfono a la tarjeta NFC, sin descargar apps ni crear cuentas. La carta está en español e inglés en todos los planes y el comensal cambia de idioma con un toque.",
  },
  {
    id: "facturacion",
    q: "¿Reemplaza mi sistema de facturación?",
    a: "No. DataFud no emite las facturas de tu restaurante: convive con el sistema de facturación que ya usás.",
  },
  {
    id: "uber-pedidosya",
    q: "¿Se conecta con Uber Eats o PedidosYa?",
    a: "No hay integración. DataFud es tu carta y tu canal propio dentro del local, sin comisiones por pedido.",
  },
  {
    id: "si-algo-falla",
    q: "¿Qué pasa si algo falla?",
    a: "Tu carta vive en la nube; si algo no carga, escribinos por WhatsApp y lo revisamos. Si hace falta, te mandamos un PDF de tu carta para imprimir mientras tanto. Para la carta no necesitás internet en el local: el comensal usa los datos de su teléfono; para recibir pedidos en cocina sí hace falta WiFi o datos.",
  },
];
