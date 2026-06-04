"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Lang, OrderStatus } from "@/lib/supabase/types";

// Resuelve el tenant del usuario autenticado (server-side, con RLS activa).
async function ctx() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, role")
    .eq("id", user.id)
    .single();
  if (!profile?.tenant_id) throw new Error("Sin restaurante asignado");
  return { supabase, tenantId: profile.tenant_id as string };
}

function i18nFrom(form: FormData, base: string) {
  const obj: Partial<Record<Lang, string>> = {};
  for (const lang of ["es", "en", "pt"] as Lang[]) {
    const v = form.get(`${base}_${lang}`);
    if (typeof v === "string" && v.trim()) obj[lang] = v.trim();
  }
  return obj;
}

// ---------- Categorías ----------
export async function createCategory(formData: FormData) {
  const { supabase, tenantId } = await ctx();
  await supabase.from("categories").insert({
    tenant_id: tenantId,
    name_i18n: i18nFrom(formData, "name"),
    sort_order: Number(formData.get("sort_order") ?? 0),
  });
  revalidatePath("/dashboard/menu");
}

export async function deleteCategory(id: string) {
  const { supabase } = await ctx();
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/dashboard/menu");
}

// ---------- Productos ----------
export async function createProduct(formData: FormData) {
  const { supabase, tenantId } = await ctx();
  const categoryId = formData.get("category_id");
  await supabase.from("products").insert({
    tenant_id: tenantId,
    category_id: categoryId ? String(categoryId) : null,
    name_i18n: i18nFrom(formData, "name"),
    description_i18n: i18nFrom(formData, "description"),
    price: Number(formData.get("price") ?? 0),
    image_url: (formData.get("image_url") as string) || null,
    sort_order: Number(formData.get("sort_order") ?? 0),
  });
  revalidatePath("/dashboard/menu");
}

export async function toggleProductAvailability(id: string, available: boolean) {
  const { supabase } = await ctx();
  await supabase.from("products").update({ is_available: available }).eq("id", id);
  revalidatePath("/dashboard/menu");
}

export async function deleteProduct(id: string) {
  const { supabase } = await ctx();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/dashboard/menu");
}

// ---------- Mesas ----------
export async function createTable(formData: FormData) {
  const { supabase, tenantId } = await ctx();
  await supabase.from("tables").insert({
    tenant_id: tenantId,
    label: String(formData.get("label") ?? "Mesa"),
  });
  revalidatePath("/dashboard/tables");
}

export async function deleteTable(id: string) {
  const { supabase } = await ctx();
  await supabase.from("tables").delete().eq("id", id);
  revalidatePath("/dashboard/tables");
}

// ---------- Órdenes ----------
export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { supabase } = await ctx();
  await supabase.from("orders").update({ status }).eq("id", id);
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");
}

// ---------- Configuración ----------
export async function updateSettings(formData: FormData) {
  const { supabase, tenantId } = await ctx();
  const enabled = (formData.getAll("enabled_languages") as string[]).filter(Boolean);
  await supabase
    .from("tenant_settings")
    .update({
      currency_code: String(formData.get("currency_code") ?? "USD"),
      default_language: String(formData.get("default_language") ?? "es"),
      enabled_languages: enabled.length ? enabled : ["es"],
      restaurant_name: (formData.get("restaurant_name") as string) || null,
      address: (formData.get("address") as string) || null,
      phone: (formData.get("phone") as string) || null,
      logo_url: (formData.get("logo_url") as string) || null,
      theme: {
        primary: String(formData.get("theme_primary") ?? "#22503a"),
        accent: String(formData.get("theme_accent") ?? "#b8923f"),
      },
    })
    .eq("tenant_id", tenantId);
  revalidatePath("/dashboard/settings");
}
