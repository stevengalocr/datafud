"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export type ActionState = { error?: string } | undefined;

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
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: "Correo o contraseña incorrectos." };
  }

  // Redirige según el rol
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    redirect(profile?.role === "super_admin" ? "/admin" : "/dashboard");
  }
  redirect("/dashboard");
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);

const registerSchema = z.object({
  restaurant: z.string().min(2, "Nombre del negocio requerido"),
  ownerName: z.string().min(2, "Tu nombre es requerido"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  plan: z.enum(["basico", "estandar", "empresarial"]).default("estandar"),
});

export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    restaurant: formData.get("restaurant"),
    ownerName: formData.get("ownerName"),
    email: formData.get("email"),
    password: formData.get("password"),
    plan: formData.get("plan") ?? "estandar",
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Datos inválidos" };
  }
  const { restaurant, ownerName, email, password, plan } = parsed.data;

  const admin = createAdminClient();

  // 1) Crear usuario auth (confirmado)
  const { data: created, error: userErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (userErr || !created.user) {
    return { error: "No se pudo crear el usuario. ¿El correo ya existe?" };
  }
  const userId = created.user.id;

  // 2) Plan elegido + trial de 30 días
  const { data: planRow } = await admin
    .from("plans")
    .select("id")
    .eq("code", plan)
    .single();

  let slug = slugify(restaurant) || "negocio";
  const { data: existing } = await admin
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const trialEnds = new Date();
  trialEnds.setDate(trialEnds.getDate() + 30);

  const { data: tenant, error: tenantErr } = await admin
    .from("tenants")
    .insert({
      name: restaurant,
      slug,
      status: "trial",
      plan_id: planRow?.id ?? null,
      trial_ends_at: trialEnds.toISOString(),
      owner_email: email,
      owner_name: ownerName,
    })
    .select("id")
    .single();
  if (tenantErr || !tenant) {
    // Rollback: no dejar un usuario auth huérfano sin negocio.
    await admin.auth.admin.deleteUser(userId);
    return { error: "No se pudo crear el negocio. Intenta de nuevo." };
  }

  // 3) Perfil + settings por defecto
  const { error: profileErr } = await admin.from("profiles").insert({
    id: userId,
    tenant_id: tenant.id,
    role: "restaurant_admin",
    full_name: ownerName,
  });
  if (profileErr) {
    // Rollback completo: borrar tenant (cascada) y usuario.
    await admin.from("tenants").delete().eq("id", tenant.id);
    await admin.auth.admin.deleteUser(userId);
    return { error: "No se pudo completar el registro. Intenta de nuevo." };
  }
  await admin.from("tenant_settings").insert({
    tenant_id: tenant.id,
    currency_code: "USD",
    default_language: "es",
    enabled_languages: ["es"],
    restaurant_name: restaurant,
  });

  // 4) Iniciar sesión
  const supabase = await createClient();
  await supabase.auth.signInWithPassword({ email, password });
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
