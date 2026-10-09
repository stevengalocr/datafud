import type { ZodError } from "zod";

// Resultado de toda Server Action de los paneles (S10): nunca lanza hacia la interfaz.
// La UI muestra `error` tal cual, así que va en voseo y sin detalles internos.
export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

export const ok = <T = undefined,>(data?: T): ActionResult<T> => ({ ok: true, data });
export const fail = (error: string): { ok: false; error: string } => ({ ok: false, error });

/** El primer mensaje de una validación de Zod. */
export const zodFail = (e: ZodError) => fail(e.errors[0]?.message ?? "Revisá los datos del formulario.");

/** Registra en el servidor un error de base y devuelve un mensaje para la interfaz. */
export function dbFail(
  where: string,
  error: { code?: string; message?: string; hint?: string | null } | null,
  message: string
) {
  console.error(`[datafud] ${where}:`, error?.code ?? "-", error?.message ?? "");
  // Los triggers de límite de plan lanzan con este texto (schema.sql, enforce_plan_limit).
  if (error?.message?.startsWith("Límite del plan alcanzado")) {
    return fail("Llegaste al límite de tu plan. Para agregar más, cambiá de plan.");
  }
  // Regla de datos de la base (CHECK de schema.sql, sección 14b). Los formularios validan lo
  // mismo, así que esto suele ser un dato viejo de la fila que ya no cumple.
  if (error?.code === "23514") {
    return fail("Hay un dato de este elemento que la base no acepta (una foto sin https, un nombre o un precio fuera de rango). Corregilo y guardá de nuevo.");
  }
  // Local suspendido o cancelado: la base rechaza la escritura (schema.sql, guard_tenant_writable).
  if (error?.hint === "datafud:read_only") {
    return fail("Tu local está en solo lectura, así que no se guardó. Escribinos por WhatsApp para reactivarlo.");
  }
  return fail(message);
}
