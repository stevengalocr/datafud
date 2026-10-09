import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Tenant, TenantSettings } from "@/lib/supabase/types";
import { isReadOnlyStatus, planLimits, type PlanLimits } from "./plan";

export interface TenantContext {
  profile: Profile;
  tenant: Tenant;
  settings: TenantSettings | null;
  /** Lo que incluye el plan del local (idiomas, pedidos desde la mesa). */
  plan: PlanLimits;
  /** Local suspendido o cancelado: el panel se ve, pero no guarda cambios. */
  readOnly: boolean;
}

/** Login con el aviso de que el usuario no tiene un local (sin bucle: el login lo explica). */
const SIN_LOCAL_URL = "/login?motivo=sin-local";

function boom(where: string, error: { code?: string; message?: string }): never {
  console.error(`[datafud] ${where}:`, error.code ?? "-", error.message ?? "");
  throw new Error(`No se pudieron cargar los datos (${where}).`);
}

// Carga el contexto del restaurante para el usuario autenticado.
// Redirige a /login si no hay sesión, a /admin si es super_admin y al login con aviso si el
// usuario no tiene local (o su fila de `tenants` no existe). Un error de Supabase lanza: lo
// atrapa `dashboard/error.tsx` (o `global-error.tsx` si pasa en el layout), nunca un vacío falso.
// `cache` evita repetir las consultas entre el layout y la página del mismo pedido.
export const getTenantContext = cache(async (): Promise<TenantContext> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileRow, error: profileErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (profileErr) boom("profile", profileErr);
  const profile = profileRow as Profile | null;

  if (!profile) redirect(SIN_LOCAL_URL);
  if (profile.role === "super_admin") redirect("/admin");
  if (!profile.tenant_id) redirect(SIN_LOCAL_URL);

  const [tenantRes, settingsRes] = await Promise.all([
    supabase.from("tenants").select("*, plan:plans(code, features)").eq("id", profile.tenant_id).maybeSingle(),
    supabase.from("tenant_settings").select("*").eq("tenant_id", profile.tenant_id).maybeSingle(),
  ]);
  if (tenantRes.error) boom("tenant", tenantRes.error);
  if (settingsRes.error) boom("settings", settingsRes.error);
  if (!tenantRes.data) redirect(SIN_LOCAL_URL);

  const { plan: planRel, ...tenant } = tenantRes.data as Tenant & { plan: unknown };
  const planRow = (Array.isArray(planRel) ? planRel[0] : planRel) as Parameters<typeof planLimits>[0];

  return {
    profile,
    tenant: tenant as Tenant,
    settings: (settingsRes.data as TenantSettings | null) ?? null,
    plan: planLimits(planRow),
    readOnly: isReadOnlyStatus(tenant.status),
  };
});
