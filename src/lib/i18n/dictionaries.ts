import type { Lang } from "@/lib/supabase/types";

// Diccionarios de UI para el menú del cliente (es/en/pt).
export const dict = {
  es: {
    menu: "Menú",
    addToOrder: "Agregar",
    yourOrder: "Tu orden",
    emptyOrder: "Aún no has agregado platillos.",
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
