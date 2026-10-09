import type { Lang } from "@/lib/supabase/types";

// Diccionarios de UI para el menú del cliente (es/en/pt).
export const dict = {
  es: {
    menu: "Menú",
    addToOrder: "Agregar",
    yourOrder: "Tu orden",
    emptyOrder: "Todavía no agregaste platillos.",
    emptyMenu: "Esta carta todavía no tiene platillos.",
    // Platillos sin categoría (la borraron en el panel): se ven igual, al final (AA-18).
    otherCategory: "Otros",
    addOne: "Sumar uno",
    removeOne: "Quitar uno",
    inOrder: "en tu orden",
    close: "Cerrar",
    orderSummary: "Lo que enviaste",
    orderChangeHint: "Si necesitás cambiar algo, avisale al personal.",
    itemsRemoved: "Quitamos de tu orden lo que ya no está disponible. Revisala y enviala de nuevo.",
    noteLimit: "Hasta 300 caracteres.",
    sendOrder: "Enviar orden",
    total: "Total",
    table: "Mesa",
    note: "Nota para la cocina (opcional)",
    orderSent: "¡Orden enviada! La cocina ya la recibió.",
    // En la demo no hay cocina ni base de datos: no se afirma que alguien la recibió.
    orderSentDemo: "Así se ve cuando mandás la orden. Esto es una demo: no se envió nada.",
    unavailable: "No disponible",
    quantity: "Cantidad",
    sending: "Enviando...",
    poweredBy: "Menú digital por",
    orderingTagline: "Armá tu pedido desde la mesa y envialo a la cocina.",
    // Sin suponer cómo se ordena: hay sodas que cobran en caja y no tienen saloneros. El
    // local que quiera decirlo pone su propio `tagline` en su CartaEstatica (D-045).
    cartaTagline: "Nuestra carta.",
  },
  en: {
    menu: "Menu",
    addToOrder: "Add",
    yourOrder: "Your order",
    emptyOrder: "You haven't added any dishes yet.",
    emptyMenu: "This menu has no dishes yet.",
    otherCategory: "Other",
    addOne: "Add one",
    removeOne: "Remove one",
    inOrder: "in your order",
    close: "Close",
    orderSummary: "What you sent",
    orderChangeHint: "If you need to change something, please tell the staff.",
    itemsRemoved: "We removed what is no longer available from your order. Please review it and send it again.",
    noteLimit: "Up to 300 characters.",
    sendOrder: "Send order",
    total: "Total",
    table: "Table",
    note: "Note for the kitchen (optional)",
    orderSent: "Order sent! The kitchen received it.",
    orderSentDemo: "This is how sending an order looks. It is a demo: nothing was sent.",
    unavailable: "Unavailable",
    quantity: "Quantity",
    sending: "Sending...",
    poweredBy: "Digital menu by",
    orderingTagline: "Build your order at the table and send it to the kitchen.",
    cartaTagline: "Our menu.",
  },
  pt: {
    menu: "Cardápio",
    addToOrder: "Adicionar",
    yourOrder: "Seu pedido",
    emptyOrder: "Você ainda não adicionou pratos.",
    emptyMenu: "Este cardápio ainda não tem pratos.",
    otherCategory: "Outros",
    addOne: "Adicionar um",
    removeOne: "Remover um",
    inOrder: "no seu pedido",
    close: "Fechar",
    orderSummary: "O que você enviou",
    orderChangeHint: "Se precisar mudar algo, avise a equipe.",
    itemsRemoved: "Tiramos do seu pedido o que não está mais disponível. Revise e envie de novo.",
    noteLimit: "Até 300 caracteres.",
    sendOrder: "Enviar pedido",
    total: "Total",
    table: "Mesa",
    note: "Observação para a cozinha (opcional)",
    orderSent: "Pedido enviado! A cozinha recebeu.",
    orderSentDemo: "É assim que fica ao enviar o pedido. Isto é uma demo: nada foi enviado.",
    unavailable: "Indisponível",
    quantity: "Quantidade",
    sending: "Enviando...",
    poweredBy: "Cardápio digital por",
    orderingTagline: "Monte seu pedido na mesa e envie para a cozinha.",
    cartaTagline: "Nosso cardápio.",
  },
} satisfies Record<Lang, Record<string, string>>;

export type Dict = (typeof dict)["es"];

// Errores del pedido (AA-14, S12): `placeOrder` devuelve el código y la carta lo muestra en el
// idioma del comensal. `send_failed` es del navegador (sin red, sin respuesta a tiempo o la carta
// abierta desde antes de un deploy): la orden pudo haber entrado, pero el reintento lleva la misma
// referencia y place_order no la duplica (AA-2, 1.7.0).
export type OrderErrorCode =
  | "restaurant_unavailable"
  | "table_invalid"
  | "empty"
  | "too_many_lines"
  | "rate_table"
  | "rate_tenant"
  | "max_quantity"
  | "items_unavailable"
  | "ordering_off"
  | "note_too_long"
  | "generic";

export const orderErrors = {
  es: {
    restaurant_unavailable: "Este local no está recibiendo pedidos por la carta en este momento.",
    table_invalid: "La carta de esta mesa ya no está activa. Pedile ayuda al personal.",
    empty: "Tu orden está vacía.",
    too_many_lines: "Un pedido lleva como máximo 30 platillos distintos.",
    rate_table: "Hay muchos pedidos seguidos desde esta mesa. Esperá unos minutos o avisale al personal.",
    rate_tenant: "El local está recibiendo muchos pedidos. Probá de nuevo en un minuto.",
    max_quantity: "La cantidad máxima por platillo es 20.",
    items_unavailable: "Algunos platillos se agotaron mientras armabas la orden.",
    ordering_off: "Este local no recibe pedidos por la carta. Pedile la orden al personal.",
    note_too_long: "La nota lleva como máximo 300 caracteres.",
    generic: "No se pudo enviar la orden. Probá de nuevo.",
    send_failed:
      "No se pudo confirmar el envío. Revisá la conexión y probá de nuevo: tu orden y tu nota se guardan, también si recargás la página, y si ya había llegado no se repite mientras no cambiés los platillos.",
  },
  en: {
    restaurant_unavailable: "This place isn't taking orders through the menu right now.",
    table_invalid: "The menu for this table is no longer active. Please ask the staff for help.",
    empty: "Your order is empty.",
    too_many_lines: "An order can have at most 30 different dishes.",
    rate_table: "Many orders were sent from this table in a short time. Wait a few minutes or tell the staff.",
    rate_tenant: "This place is receiving many orders. Please try again in a minute.",
    max_quantity: "The maximum per dish is 20.",
    items_unavailable: "Some dishes sold out while you were ordering.",
    ordering_off: "This place doesn't take orders through the menu. Please order with the staff.",
    note_too_long: "The note can have at most 300 characters.",
    generic: "The order could not be sent. Please try again.",
    send_failed:
      "The order could not be confirmed. Check your connection and try again: your order and note are kept, even if you reload the page, and if it already went through it won't be sent twice as long as you don't change the dishes.",
  },
  pt: {
    restaurant_unavailable: "Este local não está recebendo pedidos pelo cardápio no momento.",
    table_invalid: "O cardápio desta mesa não está mais ativo. Peça ajuda à equipe.",
    empty: "Seu pedido está vazio.",
    too_many_lines: "Um pedido pode ter no máximo 30 pratos diferentes.",
    rate_table: "Muitos pedidos seguidos desta mesa. Espere alguns minutos ou avise a equipe.",
    rate_tenant: "O local está recebendo muitos pedidos. Tente de novo em um minuto.",
    max_quantity: "A quantidade máxima por prato é 20.",
    items_unavailable: "Alguns pratos esgotaram enquanto você montava o pedido.",
    ordering_off: "Este local não recebe pedidos pelo cardápio. Peça à equipe.",
    note_too_long: "A observação pode ter no máximo 300 caracteres.",
    generic: "Não foi possível enviar o pedido. Tente de novo.",
    send_failed:
      "Não foi possível confirmar o envio. Verifique a conexão e tente de novo: seu pedido e sua observação ficam salvos, mesmo se recarregar a página, e se já tinha chegado não se repete enquanto você não mudar os pratos.",
  },
} satisfies Record<Lang, Record<OrderErrorCode | "send_failed", string>>;

export type OrderErrorKey = OrderErrorCode | "send_failed";

// Páginas sin carta (mesa o local que ya no está, código impreso dado de baja, error al cargar).
// Llegan turistas: se muestran en español y en inglés a la vez, sin saber todavía el idioma.
export const unavailableCopy = {
  es: {
    menuTitle: "Esta carta no está disponible",
    menuBody: "El código de esta mesa ya no está activo. Pedile la carta al personal.",
    qrTitle: "Este código ya no está activo",
    qrBody: "Este código ya no está activo o no existe. Pedile la carta al personal.",
    loadTitle: "No pudimos cargar la carta",
    loadBody: "Puede ser la conexión. Probá de nuevo en un momento.",
    retry: "Reintentar",
  },
  en: {
    menuTitle: "This menu isn't available",
    menuBody: "This table's code is no longer active. Please ask the staff for the menu.",
    qrTitle: "This code is no longer active",
    qrBody: "This code is no longer active or does not exist. Please ask the staff for the menu.",
    loadTitle: "We couldn't load the menu",
    loadBody: "It may be the connection. Please try again in a moment.",
    retry: "Try again",
  },
} as const;

export function getDict(lang: Lang): Dict {
  return dict[lang] ?? dict.es;
}

// Resuelve un campo i18n al idioma deseado, con fallback a es/en o primer valor.
export function t(
  field: Partial<Record<Lang, string>> | null | undefined,
  lang: Lang
): string {
  if (!field) return "";
  return field[lang] ?? field.es ?? field.en ?? Object.values(field)[0] ?? "";
}
