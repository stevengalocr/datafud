import type { OrderStatus } from "@/lib/supabase/types";

// Recorrido de una orden en el tablero (lo leen el tablero y `updateOrderStatus`, así la regla
// es una sola). Hacia adelante va de a un paso; se cancela desde cualquier estado activo; y el
// último cambio se puede deshacer un rato (un toque de más en «Marcar pagada»). La base repite
// la misma regla en el trigger trg_order_status de supabase/schema.sql (con previous_status y la
// misma ventana que UNDO_SERVER_MS): si cambia acá, cambia allá.

export const ACTIVE_STATUSES = ["pending", "preparing", "ready", "delivered"] as const satisfies readonly OrderStatus[];
export const CLOSED_STATUSES = ["paid", "cancelled"] as const satisfies readonly OrderStatus[];

export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "preparing",
  preparing: "ready",
  ready: "delivered",
  delivered: "paid",
};

// El botón dice lo que hace la persona, no el nombre del estado ("Pasar a En preparación").
export const NEXT_ACTION: Partial<Record<OrderStatus, string>> = {
  pending: "Empezar a preparar",
  preparing: "Marcar lista",
  ready: "Marcar entregada",
  delivered: "Marcar pagada",
};

/** Cuánto dura «Deshacer» en el tablero. El servidor da un margen mayor (red lenta, reloj). */
export const UNDO_UI_MS = 60_000;
export const UNDO_SERVER_MS = 5 * 60_000;

export const isActive = (s: OrderStatus) => (ACTIVE_STATUSES as readonly OrderStatus[]).includes(s);

/** Paso normal del servicio: el siguiente estado, o cancelar una orden activa. */
export function isForward(from: OrderStatus, to: OrderStatus): boolean {
  return NEXT_STATUS[from] === to || (to === "cancelled" && isActive(from));
}

/** Deshacer: volver un paso atrás, o reabrir una orden cancelada en el estado que tenía. */
export function isUndo(from: OrderStatus, to: OrderStatus): boolean {
  return NEXT_STATUS[to] === from || (from === "cancelled" && isActive(to));
}
