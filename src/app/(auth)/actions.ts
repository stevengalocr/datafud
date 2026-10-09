"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { SIN_LOCAL } from "@/lib/auth/tenant-access";
import { safeRedirect } from "@/lib/auth/redirect";

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export type ActionState = { error?: string } | undefined;

// Un corte de la base al revisar la cuenta no es «no tenés local»: se pide reintentar, y la
// sesión recién abierta se cierra para no dejar a nadie a medio entrar.
async function retryLater(where: string, error: { code?: string; message?: string }): Promise<ActionState> {
  console.error(`[datafud] ${where}:`, error.code ?? "-", error.message ?? "");
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  return { error: "No pudimos revisar tu cuenta en este momento. Probá de nuevo en un minuto." };
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    return { error: "Correo o contraseña incorrectos." };
  }

  // Redirige según el rol. Un usuario sin local (o con el local borrado) no entra: si entrara,
  // el panel lo mandaría de vuelta acá sin explicación, una y otra vez.
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role, tenant_id")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profileErr) return retryLater("login.profile", profileErr);

  if (profile?.role === "super_admin") {
    redirect(safeRedirect(formData.get("redirect"), "/admin") ?? "/admin");
  }

  const tenantId = (profile?.tenant_id as string | null | undefined) ?? null;
  const { data: tenant, error: tenantErr } = tenantId
    ? await supabase.from("tenants").select("id").eq("id", tenantId).maybeSingle()
    : { data: null, error: null };
  if (tenantErr) return retryLater("login.tenant", tenantErr);
  if (!tenant) {
    await supabase.auth.signOut({ scope: "local" });
    return { error: SIN_LOCAL };
  }

  redirect(safeRedirect(formData.get("redirect"), "/dashboard") ?? "/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
