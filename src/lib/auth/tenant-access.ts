import type { createClient } from "@/lib/supabase/server";
import type { TenantStatus } from "@/lib/supabase/types";
import { isReadOnlyStatus } from "./plan";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export const SIN_SESION = "Tu sesión venció. Volvé a entrar.";
export const SIN_LOCAL = "Tu usuario no tiene un local asignado. Escribinos por WhatsApp.";

/** Mensaje de una escritura rechazada porque el local no está activo. */
export function readOnlyMessage(status: TenantStatus): string {
  return status === "cancelled"
    ? "Tu cuenta está cancelada: el panel quedó en solo lectura. Escribinos por WhatsApp si querés reactivarla."
    : "Tu local está suspendido: el panel quedó en solo lectura. Escribinos por WhatsApp para reactivarlo.";
}

export type TenantAccess =
  | { ok: true; tenantId: string; userId: string; status: TenantStatus }
  | { ok: false; error: string };

/**
 * Guarda de toda Server Action que escribe en el panel del restaurante. Resuelve el local desde
 * la sesión (nunca desde el navegador, regla 4) y rechaza si el local está suspendido o
 * cancelado: el panel de un local así es de solo lectura. Nunca lanza.
 */
export async function writableTenant(supabase: Supabase): Promise<TenantAccess> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: SIN_SESION };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("tenant_id, tenant:tenants(status)")
    .eq("id", user.id)
    .maybeSingle();
  if (error) {
    console.error("[datafud] writableTenant:", error.code ?? "-", error.message ?? "");
    return { ok: false, error: "No pudimos verificar tu cuenta. Probá de nuevo." };
  }
  if (!profile) return { ok: false, error: SIN_SESION };
  if (!profile.tenant_id) return { ok: false, error: SIN_LOCAL };

  // La relación a uno llega como objeto; se acepta también la forma de arreglo por si cambia.
  const rel = profile.tenant as { status?: TenantStatus } | { status?: TenantStatus }[] | null;
  const status = (Array.isArray(rel) ? rel[0]?.status : rel?.status) ?? null;
  if (!status) return { ok: false, error: SIN_LOCAL };
  if (isReadOnlyStatus(status)) return { ok: false, error: readOnlyMessage(status) };

  return { ok: true, tenantId: profile.tenant_id as string, userId: user.id, status };
}
