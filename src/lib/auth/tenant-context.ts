import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Tenant, TenantSettings } from "@/lib/supabase/types";

export interface TenantContext {
  profile: Profile;
  tenant: Tenant;
  settings: TenantSettings | null;
}

// Carga el contexto del restaurante para el usuario autenticado.
// Redirige a /login si no hay sesión, o a /admin si es super_admin.
export async function getTenantContext(): Promise<TenantContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  if ((profile as Profile).role === "super_admin") redirect("/admin");
  if (!(profile as Profile).tenant_id) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", (profile as Profile).tenant_id!)
    .single();

  const { data: settings } = await supabase
    .from("tenant_settings")
    .select("*")
    .eq("tenant_id", (profile as Profile).tenant_id!)
    .maybeSingle();

  return {
    profile: profile as Profile,
    tenant: tenant as Tenant,
    settings: (settings as TenantSettings) ?? null,
  };
}
