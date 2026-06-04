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
    unavailable: "No disponible",
    quantity: "Cantidad",
    sending: "Enviando...",
    poweredBy: "Menú digital por",
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
    unavailable: "Unavailable",
    quantity: "Quantity",
    sending: "Sending...",
    poweredBy: "Digital menu by",
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
    unavailable: "Indisponível",
    quantity: "Quantidade",
    sending: "Enviando...",
    poweredBy: "Cardápio digital por",
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
