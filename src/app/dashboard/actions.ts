"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { type ActionResult, dbFail, fail, ok, zodFail } from "@/lib/action-result";
import type { Lang } from "@/lib/supabase/types";

// Resuelve el negocio del usuario con sesión (server-side, con RLS activa). El tenant_id nunca
// viene del navegador (regla 4): se lee del perfil. Toda acción devuelve un ActionResult (S10).
async function ctx() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, role")
    .eq("id", user.id)
    .single();
  if (!profile?.tenant_id) return null;
  return { supabase, tenantId: profile.tenant_id as string };
}
const SIN_SESION = "Tu sesión venció. Volvé a entrar.";

const uuid = z.string().uuid("Elemento inválido.");
const texto = (max: number) => z.string().trim().max(max, `Máximo ${max} caracteres.`);

function i18nFrom(form: FormData, base: string, max: number) {
  const obj: Partial<Record<Lang, string>> = {};
  for (const lang of ["es", "en", "pt"] as Lang[]) {
    const v = form.get(`${base}_${lang}`);
    if (typeof v === "string" && v.trim()) obj[lang] = v.trim().slice(0, max);
  }
  return obj;
}

const orden = z.coerce.number().int("El orden es un número entero.").min(0, "El orden no puede ser negativo.").max(999, "Orden demasiado alto.");

// ---------- Categorías ----------
const categorySchema = z.object({
  nameEs: z.string().trim().min(1, "Escribí el nombre en español.").max(60, "El nombre es muy largo."),
  sortOrder: orden,
});

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const c = await ctx();
  if (!c) return fail(SIN_SESION);
  const parsed = categorySchema.safeParse({ nameEs: formData.get("name_es"), sortOrder: formData.get("sort_order") ?? 0 });
  if (!parsed.success) return zodFail(parsed.error);
  const { error } = await c.supabase.from("categories").insert({
    tenant_id: c.tenantId,
    name_i18n: i18nFrom(formData, "name", 60),
    sort_order: parsed.data.sortOrder,
  });
  if (error) return dbFail("createCategory", error, "No se pudo guardar la categoría. Probá de nuevo.");
  revalidatePath("/dashboard/menu");
  return ok();
}

export async function updateCategory(formData: FormData): Promise<ActionResult> {
  const c = await ctx();
  if (!c) return fail(SIN_SESION);
  const id = uuid.safeParse(formData.get("id"));
  const parsed = categorySchema.safeParse({ nameEs: formData.get("name_es"), sortOrder: formData.get("sort_order") ?? 0 });
  if (!id.success) return zodFail(id.error);
  if (!parsed.success) return zodFail(parsed.error);
  const { data, error } = await c.supabase
    .from("categories")
    .update({ name_i18n: i18nFrom(formData, "name", 60), sort_order: parsed.data.sortOrder })
    .eq("id", id.data)
    .select("id");
  if (error) return dbFail("updateCategory", error, "No se pudo guardar la categoría. Probá de nuevo.");
  if (!data?.length) return fail("Esa categoría ya no existe. Recargá la página.");
  revalidatePath("/dashboard/menu");
  return ok();
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const c = await ctx();
  if (!c) return fail(SIN_SESION);
  const parsed = uuid.safeParse(id);
  if (!parsed.success) return zodFail(parsed.error);
  const { error } = await c.supabase.from("categories").delete().eq("id", parsed.data);
  if (error) return dbFail("deleteCategory", error, "No se pudo eliminar la categoría. Probá de nuevo.");
  revalidatePath("/dashboard/menu");
  return ok();
}

// ---------- Productos ----------
const productSchema = z.object({
  nameEs: z.string().trim().min(1, "Escribí el nombre del platillo en español.").max(80, "El nombre es muy largo."),
  categoryId: uuid.nullable(),
  price: z.coerce.number({ message: "Precio inválido." }).min(0, "El precio no puede ser negativo.").max(10_000_000, "Precio demasiado alto."),
  imageUrl: z
    .string()
    .trim()
    .url("La URL de la foto no es válida.")
    .refine((u) => u.startsWith("https://"), "La foto tiene que estar en una dirección https.")
    .nullable(),
  sortOrder: orden,
});

export async function createProduct(formData: FormData): Promise<ActionResult> {
  const c = await ctx();
  if (!c) return fail(SIN_SESION);
  const parsed = productSchema.safeParse({
    nameEs: formData.get("name_es"),
    categoryId: (formData.get("category_id") as string) || null,
    price: formData.get("price") ?? 0,
    imageUrl: (formData.get("image_url") as string) || null,
    sortOrder: formData.get("sort_order") ?? 0,
  });
  if (!parsed.success) return zodFail(parsed.error);
  const p = parsed.data;
  const { error } = await c.supabase.from("products").insert({
    tenant_id: c.tenantId,
    category_id: p.categoryId,
    name_i18n: i18nFrom(formData, "name", 80),
    description_i18n: i18nFrom(formData, "description", 300),
    price: p.price,
    image_url: p.imageUrl,
    sort_order: p.sortOrder,
  });
  if (error) return dbFail("createProduct", error, "No se pudo guardar el platillo. Probá de nuevo.");
  revalidatePath("/dashboard/menu");
  return ok();
}

export async function updateProduct(formData: FormData): Promise<ActionResult> {
  const c = await ctx();
  if (!c) return fail(SIN_SESION);
  const id = uuid.safeParse(formData.get("id"));
  const parsed = productSchema.safeParse({
    nameEs: formData.get("name_es"),
    categoryId: (formData.get("category_id") as string) || null,
    price: formData.get("price") ?? 0,
    imageUrl: (formData.get("image_url") as string) || null,
    sortOrder: formData.get("sort_order") ?? 0,
  });
  if (!id.success) return zodFail(id.error);
  if (!parsed.success) return zodFail(parsed.error);
  const p = parsed.data;
  const { data, error } = await c.supabase
    .from("products")
    .update({
      category_id: p.categoryId,
      name_i18n: i18nFrom(formData, "name", 80),
      description_i18n: i18nFrom(formData, "description", 300),
      price: p.price,
      image_url: p.imageUrl,
      sort_order: p.sortOrder,
    })
    .eq("id", id.data)
    .select("id");
  if (error) return dbFail("updateProduct", error, "No se pudo guardar el platillo. Probá de nuevo.");
  if (!data?.length) return fail("Ese platillo ya no existe. Recargá la página.");
  revalidatePath("/dashboard/menu");
  return ok();
}

export async function toggleProductAvailability(id: string, available: boolean): Promise<ActionResult> {
  const c = await ctx();
  if (!c) return fail(SIN_SESION);
  const parsed = uuid.safeParse(id);
  if (!parsed.success || typeof available !== "boolean") return fail("Platillo inválido.");
  const { error } = await c.supabase.from("products").update({ is_available: available }).eq("id", parsed.data);
  if (error) return dbFail("toggleProductAvailability", error, "No se pudo cambiar la disponibilidad. Probá de nuevo.");
  revalidatePath("/dashboard/menu");
  return ok();
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const c = await ctx();
  if (!c) return fail(SIN_SESION);
  const parsed = uuid.safeParse(id);
  if (!parsed.success) return zodFail(parsed.error);
  const { error } = await c.supabase.from("products").delete().eq("id", parsed.data);
  if (error) return dbFail("deleteProduct", error, "No se pudo eliminar el platillo. Probá de nuevo.");
  revalidatePath("/dashboard/menu");
  return ok();
}

// ---------- Fotos y logo (Supabase Storage) ----------
const IMAGE_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;
const IMAGE_MAX_BYTES = 2 * 1024 * 1024;
const STORAGE_APAGADO = "La subida de fotos todavía no está activa. Pegá la dirección de la foto.";

const uploadSchema = z.object({
  kind: z.enum(["products", "logo"], { message: "Tipo de imagen inválido." }),
  file: z
    .custom<File>((f) => typeof File !== "undefined" && f instanceof File, "Elegí una imagen.")
    .refine((f) => f.size > 0, "Elegí una imagen.")
    .refine((f) => f.type in IMAGE_TYPES, "La imagen tiene que ser JPG, PNG o WebP.")
    .refine((f) => f.size <= IMAGE_MAX_BYTES, "La imagen pesa más de 2 MB."),
});

// El contenido tiene que ser de verdad una imagen del tipo declarado (no solo el nombre o el type del navegador).
function matchesMagic(type: keyof typeof IMAGE_TYPES, b: Uint8Array) {
  const at = (i: number, s: string) => [...s].every((ch, k) => b[i + k] === ch.charCodeAt(0));
  if (type === "image/jpeg") return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (type === "image/png") return b[0] === 0x89 && at(1, "PNG");
  return at(0, "RIFF") && at(8, "WEBP");
}

/** Sube una imagen a `media/<tenant>/<products|logo>/<uuid>.<ext>` con la sesión de quien la sube (RLS de Storage). */
export async function uploadImage(formData: FormData): Promise<ActionResult<{ url: string }>> {
  try {
    const c = await ctx();
    if (!c) return fail(SIN_SESION);
    const parsed = uploadSchema.safeParse({ kind: formData.get("kind"), file: formData.get("file") });
    if (!parsed.success) return zodFail(parsed.error);
    const { kind, file } = parsed.data;
    const type = file.type as keyof typeof IMAGE_TYPES;
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!matchesMagic(type, bytes)) return fail("La imagen tiene que ser JPG, PNG o WebP.");

    // La carpeta del negocio sale de la sesión, nunca del navegador (regla 4).
    const path = `${c.tenantId}/${kind}/${crypto.randomUUID()}.${IMAGE_TYPES[type]}`;
    const { error } = await c.supabase.storage.from("media").upload(path, bytes, { contentType: type, upsert: false });
    if (error) {
      // Bucket sin crear (aún no se aplicó schema.sql) o Storage caído: la página sigue y la URL pegada también.
      const apagado = /bucket not found|not found/i.test(error.message ?? "");
      return dbFail("uploadImage", { message: error.message }, apagado ? STORAGE_APAGADO : "No se pudo subir la imagen. Probá de nuevo o pegá la dirección de la foto.");
    }
    const { data } = c.supabase.storage.from("media").getPublicUrl(path);
    return ok({ url: data.publicUrl });
  } catch (e) {
    console.error("[datafud] uploadImage:", e instanceof Error ? e.message : "-");
    return fail(STORAGE_APAGADO);
  }
}

// ---------- Mesas ----------
const tableSchema = z.object({ label: z.string().trim().min(1, "Escribí el nombre de la mesa.").max(40, "El nombre es muy largo.") });

export async function createTable(formData: FormData): Promise<ActionResult> {
  const c = await ctx();
  if (!c) return fail(SIN_SESION);
  const parsed = tableSchema.safeParse({ label: formData.get("label") });
  if (!parsed.success) return zodFail(parsed.error);
  const { error } = await c.supabase.from("tables").insert({ tenant_id: c.tenantId, label: parsed.data.label });
  if (error) return dbFail("createTable", error, "No se pudo crear la mesa. Probá de nuevo.");
  revalidatePath("/dashboard/tables");
  return ok();
}

export async function deleteTable(id: string): Promise<ActionResult> {
  const c = await ctx();
  if (!c) return fail(SIN_SESION);
  const parsed = uuid.safeParse(id);
  if (!parsed.success) return zodFail(parsed.error);
  const { error } = await c.supabase.from("tables").delete().eq("id", parsed.data);
  if (error) return dbFail("deleteTable", error, "No se pudo eliminar la mesa. Probá de nuevo.");
  revalidatePath("/dashboard/tables");
  return ok();
}

// ---------- Órdenes ----------
const statusSchema = z.enum(["pending", "preparing", "ready", "delivered", "paid", "cancelled"]);

export async function updateOrderStatus(id: string, status: string): Promise<ActionResult> {
  const c = await ctx();
  if (!c) return fail(SIN_SESION);
  const pid = uuid.safeParse(id);
  const st = statusSchema.safeParse(status);
  if (!pid.success || !st.success) return fail("Estado de la orden inválido.");
  const { data, error } = await c.supabase.from("orders").update({ status: st.data }).eq("id", pid.data).select("id");
  if (error) return dbFail("updateOrderStatus", error, "No se pudo actualizar la orden. Probá de nuevo.");
  if (!data?.length) return fail("Esa orden ya no existe. El tablero se actualiza solo.");
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");
  return ok();
}

// ---------- Configuración ----------
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color inválido.");
const settingsSchema = z.object({
  currency: z.string().regex(/^[A-Z]{3}$/, "Moneda inválida."),
  defaultLanguage: z.enum(["es", "en", "pt"], { message: "Idioma inválido." }),
  enabled: z.array(z.enum(["es", "en", "pt"])).max(3),
  restaurantName: texto(80).optional(),
  address: texto(160).optional(),
  phone: texto(30).optional(),
  logoUrl: z
    .string()
    .trim()
    .url("La URL del logo no es válida.")
    .refine((u) => u.startsWith("https://"), "El logo tiene que estar en una dirección https.")
    .optional(),
  primary: hex,
  accent: hex,
});

export async function updateSettings(formData: FormData): Promise<ActionResult> {
  const c = await ctx();
  if (!c) return fail(SIN_SESION);
  const opt = (k: string) => ((formData.get(k) as string) || "").trim() || undefined;
  const parsed = settingsSchema.safeParse({
    currency: formData.get("currency_code") ?? "USD",
    defaultLanguage: formData.get("default_language") ?? "es",
    enabled: (formData.getAll("enabled_languages") as string[]).filter(Boolean),
    restaurantName: opt("restaurant_name"),
    address: opt("address"),
    phone: opt("phone"),
    logoUrl: opt("logo_url"),
    primary: formData.get("theme_primary") ?? "#22503a",
    accent: formData.get("theme_accent") ?? "#b8923f",
  });
  if (!parsed.success) return zodFail(parsed.error);
  const s = parsed.data;
  const enabled = s.enabled.length ? s.enabled : ["es"];
  if (!enabled.includes(s.defaultLanguage)) return fail("El idioma principal tiene que estar entre los idiomas activos.");

  const { error } = await c.supabase
    .from("tenant_settings")
    .update({
      currency_code: s.currency,
      default_language: s.defaultLanguage,
      enabled_languages: enabled,
      restaurant_name: s.restaurantName ?? null,
      address: s.address ?? null,
      phone: s.phone ?? null,
      logo_url: s.logoUrl ?? null,
      theme: { primary: s.primary, accent: s.accent },
    })
    .eq("tenant_id", c.tenantId);
  if (error) return dbFail("updateSettings", error, "No se pudo guardar la configuración. Probá de nuevo.");
  revalidatePath("/dashboard/settings");
  return ok();
}
