import type { ZodError } from "zod";

// Resultado de toda Server Action de los paneles (S10): nunca lanza hacia la interfaz.
// La UI muestra `error` tal cual, así que va en voseo y sin detalles internos.
export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

export const ok = <T = undefined,>(data?: T): ActionResult<T> => ({ ok: true, data });
export const fail = (error: string): { ok: false; error: string } => ({ ok: false, error });

/** El primer mensaje de una validación de Zod. */
export const zodFail = (e: ZodError) => fail(e.errors[0]?.message ?? "Revisá los datos del formulario.");

/** Registra en el servidor un error de base y devuelve un mensaje para la interfaz. */
export function dbFail(where: string, error: { code?: string; message?: string } | null, message: string) {
  console.error(`[datafud] ${where}:`, error?.code ?? "-", error?.message ?? "");
  // Los triggers de límite de plan lanzan con este texto (schema.sql, enforce_plan_limit).
  if (error?.message?.startsWith("Límite del plan alcanzado")) {
    return fail("Llegaste al límite de tu plan. Para agregar más, cambiá de plan.");
  }
  return fail(message);
}
