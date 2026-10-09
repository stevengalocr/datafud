"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { type ActionResult, dbFail, fail, ok, zodFail } from "@/lib/action-result";
import { writableTenant } from "@/lib/auth/tenant-access";
import { planLimits } from "@/lib/auth/plan";
import type { Lang, OrderStatus } from "@/lib/supabase/types";
import { ORDER_STATUS_LABEL } from "@/lib/constants";
import { roundToCurrency } from "@/lib/currency/format";
import { isForward, isUndo, UNDO_SERVER_MS } from "./_lib/order-status";

// Resuelve el negocio del usuario con sesión (server-side, con RLS activa). El tenant_id nunca
// viene del navegador (regla 4): se lee del perfil. Un local suspendido o cancelado no escribe
// (`writableTenant`). Toda acción devuelve un ActionResult (S10).
async function ctx() {
  const supabase = await createClient();
  const access = await writableTenant(supabase);
  if (!access.ok) return access;
  return { ok: true as const, supabase, tenantId: access.tenantId };
}

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
  if (!c.ok) return fail(c.error);
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
  if (!c.ok) return fail(c.error);
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
  if (!c.ok) return fail(c.error);
  const parsed = uuid.safeParse(id);
  if (!parsed.success) return zodFail(parsed.error);
  const { data, error } = await c.supabase.from("categories").delete().eq("id", parsed.data).select("id");
  if (error) return dbFail("deleteCategory", error, "No se pudo eliminar la categoría. Probá de nuevo.");
  if (!data?.length) return fail("Esa categoría ya no existe. Recargá la página.");
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
    .max(2048, "La dirección de la foto es muy larga.")
    .refine((u) => u.startsWith("https://"), "La foto tiene que estar en una dirección https.")
    .nullable(),
  sortOrder: orden,
});

// Los campos del platillo salen del FormData en un solo lugar: crear y editar validan igual.
function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    nameEs: formData.get("name_es"),
    categoryId: (formData.get("category_id") as string) || null,
    price: formData.get("price") ?? 0,
    imageUrl: (formData.get("image_url") as string) || null,
    sortOrder: formData.get("sort_order") ?? 0,
  });
}

// El precio se guarda con los decimales de la moneda del local (los colones, sin céntimos: la
// carta muestra "₡3 501" y el total no cuadraría con lo mostrado). La moneda sale de la
// configuración del local, no del formulario.
async function priceFor(c: Ctx, price: number) {
  const { data, error } = await c.supabase
    .from("tenant_settings")
    .select("currency_code")
    .eq("tenant_id", c.tenantId)
    .maybeSingle();
  if (error) return { error, price: 0 };
  return { error: null, price: roundToCurrency(price, data?.currency_code) };
}

type Ctx = Extract<Awaited<ReturnType<typeof ctx>>, { ok: true }>;

// Fotos reemplazadas o de platillos borrados: se quitan del bucket para no llenar el tope de
// archivos del local (schema.sql, sección 12). Solo si la URL es de la carpeta del propio local en
// `media` y nada más del local la usa. Es limpieza: si falla, se registra y la acción sigue.
const MEDIA_PREFIX = "/storage/v1/object/public/media/";

function ownMediaPath(url: string | null | undefined, tenantId: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !base) return null;
  try {
    const u = new URL(url);
    if (u.origin !== new URL(base).origin || !u.pathname.startsWith(MEDIA_PREFIX)) return null;
    const path = decodeURIComponent(u.pathname.slice(MEDIA_PREFIX.length));
    if (!path.startsWith(`${tenantId}/`) || path.split("/").some((part) => part === ".." || part === "")) return null;
    return path;
  } catch {
    return null;
  }
}

async function removeUnusedMedia(c: Ctx, url: string | null | undefined): Promise<void> {
  const path = ownMediaPath(url, c.tenantId);
  if (!path || !url) return;
  try {
    const head = { count: "exact" as const, head: true };
    const [products, categories, settings] = await Promise.all([
      c.supabase.from("products").select("id", head).eq("tenant_id", c.tenantId).eq("image_url", url),
      c.supabase.from("categories").select("id", head).eq("tenant_id", c.tenantId).eq("image_url", url),
      c.supabase.from("tenant_settings").select("tenant_id", head).eq("tenant_id", c.tenantId).eq("logo_url", url),
    ]);
    const error = products.error ?? categories.error ?? settings.error;
    if (error) {
      console.error("[datafud] removeUnusedMedia:", error.code ?? "-", error.message ?? "");
      return;
    }
    if ((products.count ?? 0) + (categories.count ?? 0) + (settings.count ?? 0) > 0) return;
    const { error: rmErr } = await c.supabase.storage.from("media").remove([path]);
    if (rmErr) console.error("[datafud] removeUnusedMedia:", rmErr.message ?? "-");
  } catch (e) {
    console.error("[datafud] removeUnusedMedia:", e instanceof Error ? e.message : "-");
  }
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  const c = await ctx();
  if (!c.ok) return fail(c.error);
  const parsed = parseProductForm(formData);
  if (!parsed.success) return zodFail(parsed.error);
  const p = parsed.data;
  const pr = await priceFor(c, p.price);
  if (pr.error) return dbFail("createProduct", pr.error, "No se pudo guardar el platillo. Probá de nuevo.");
  const { error } = await c.supabase.from("products").insert({
    tenant_id: c.tenantId,
    category_id: p.categoryId,
    name_i18n: i18nFrom(formData, "name", 80),
    description_i18n: i18nFrom(formData, "description", 300),
    price: pr.price,
    image_url: p.imageUrl,
    sort_order: p.sortOrder,
  });
  if (error) return dbFail("createProduct", error, "No se pudo guardar el platillo. Probá de nuevo.");
  revalidatePath("/dashboard/menu");
  return ok();
}

export async function updateProduct(formData: FormData): Promise<ActionResult> {
  const c = await ctx();
  if (!c.ok) return fail(c.error);
  const id = uuid.safeParse(formData.get("id"));
  const parsed = parseProductForm(formData);
  if (!id.success) return zodFail(id.error);
  if (!parsed.success) return zodFail(parsed.error);
  const p = parsed.data;
  const pr = await priceFor(c, p.price);
  if (pr.error) return dbFail("updateProduct", pr.error, "No se pudo guardar el platillo. Probá de nuevo.");
  // La foto que tenía, para quitarla del bucket si se reemplazó.
  const { data: before, error: beforeErr } = await c.supabase
    .from("products")
    .select("image_url")
    .eq("id", id.data)
    .eq("tenant_id", c.tenantId)
    .maybeSingle();
  if (beforeErr) return dbFail("updateProduct", beforeErr, "No se pudo guardar el platillo. Probá de nuevo.");
  const { data, error } = await c.supabase
    .from("products")
    .update({
      category_id: p.categoryId,
      name_i18n: i18nFrom(formData, "name", 80),
      description_i18n: i18nFrom(formData, "description", 300),
      price: pr.price,
      image_url: p.imageUrl,
      sort_order: p.sortOrder,
    })
    .eq("id", id.data)
    .select("id");
  if (error) return dbFail("updateProduct", error, "No se pudo guardar el platillo. Probá de nuevo.");
  if (!data?.length) return fail("Ese platillo ya no existe. Recargá la página.");
  if (before?.image_url && before.image_url !== p.imageUrl) await removeUnusedMedia(c, before.image_url);
  revalidatePath("/dashboard/menu");
  return ok();
}

export async function toggleProductAvailability(id: string, available: boolean): Promise<ActionResult> {
  const c = await ctx();
  if (!c.ok) return fail(c.error);
  const parsed = uuid.safeParse(id);
  if (!parsed.success || typeof available !== "boolean") return fail("Platillo inválido.");
  const { data, error } = await c.supabase
    .from("products")
    .update({ is_available: available })
    .eq("id", parsed.data)
    .select("id");
  if (error) return dbFail("toggleProductAvailability", error, "No se pudo cambiar la disponibilidad. Probá de nuevo.");
  if (!data?.length) return fail("Ese platillo ya no existe. Recargá la página.");
  revalidatePath("/dashboard/menu");
  return ok();
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const c = await ctx();
  if (!c.ok) return fail(c.error);
  const parsed = uuid.safeParse(id);
  if (!parsed.success) return zodFail(parsed.error);
  const { data, error } = await c.supabase.from("products").delete().eq("id", parsed.data).select("id, image_url");
  if (error) return dbFail("deleteProduct", error, "No se pudo eliminar el platillo. Probá de nuevo.");
  if (!data?.length) return fail("Ese platillo ya no existe. Recargá la página.");
  await removeUnusedMedia(c, data[0]?.image_url);
  revalidatePath("/dashboard/menu");
  return ok();
}

/** Asigna una categoría a un platillo que quedó sin ella (se borró la suya). */
export async function assignProductCategory(productId: string, categoryId: string): Promise<ActionResult> {
  const c = await ctx();
  if (!c.ok) return fail(c.error);
  const pid = uuid.safeParse(productId);
  const cid = uuid.safeParse(categoryId);
  if (!pid.success) return zodFail(pid.error);
  if (!cid.success) return fail("Elegí una categoría.");
  // RLS limita el platillo al negocio propio y la FK compuesta (S15), la categoría.
  const { data, error } = await c.supabase
    .from("products")
    .update({ category_id: cid.data })
    .eq("id", pid.data)
    .eq("tenant_id", c.tenantId)
    .select("id");
  if (error) return dbFail("assignProductCategory", error, "No se pudo asignar la categoría. Recargá la página y probá de nuevo.");
  if (!data?.length) return fail("Ese platillo ya no existe. Recargá la página.");
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
    if (!c.ok) return fail(c.error);
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
      // Solo el bucket inexistente cuenta como «no activa»: un «Object not found» u otro 404 no.
      const msg = error.message ?? "";
      const code = String((error as { statusCode?: string | number }).statusCode ?? "");
      const apagado = /bucket not found/i.test(msg) || (code === "404" && /bucket/i.test(msg));
      // La carpeta sale de la sesión, así que un rechazo de la política es el tope de archivos del
      // local (schema.sql, media_quota_ok); un local en solo lectura ya lo frena ctx().
      const rechazo = /row-level security/i.test(msg) || code === "403";
      return dbFail(
        "uploadImage",
        { message: error.message },
        apagado
          ? STORAGE_APAGADO
          : rechazo
            ? "No se pudo subir la foto. Lo más probable es que tu local haya llegado al tope de fotos guardadas de su plan: quitá fotos de platillos que ya no usés (al cambiar o borrar una, la vieja se libera) o escribinos por WhatsApp."
            : "No se pudo subir la imagen. Probá de nuevo o pegá la dirección de la foto."
      );
    }
    const { data } = c.supabase.storage.from("media").getPublicUrl(path);
    return ok({ url: data.publicUrl });
  } catch (e) {
    return dbFail("uploadImage", { message: e instanceof Error ? e.message : "-" }, "No se pudo subir la foto. Probá de nuevo o pegá la dirección.");
  }
}

// ---------- Mesas ----------
const tableSchema = z.object({ label: z.string().trim().min(1, "Escribí el nombre de la mesa.").max(40, "El nombre es muy largo.") });

export async function createTable(formData: FormData): Promise<ActionResult> {
  const c = await ctx();
  if (!c.ok) return fail(c.error);
  const parsed = tableSchema.safeParse({ label: formData.get("label") });
  if (!parsed.success) return zodFail(parsed.error);
  const { error } = await c.supabase.from("tables").insert({ tenant_id: c.tenantId, label: parsed.data.label });
  if (error) return dbFail("createTable", error, "No se pudo crear la mesa. Probá de nuevo.");
  revalidatePath("/dashboard/tables");
  return ok();
}

export async function deleteTable(id: string): Promise<ActionResult> {
  const c = await ctx();
  if (!c.ok) return fail(c.error);
  const parsed = uuid.safeParse(id);
  if (!parsed.success) return zodFail(parsed.error);
  const { data, error } = await c.supabase
    .from("tables")
    .delete()
    .eq("id", parsed.data)
    .eq("tenant_id", c.tenantId)
    .select("id");
  if (error) return dbFail("deleteTable", error, "No se pudo eliminar la mesa. Probá de nuevo.");
  if (!data?.length) return fail("Esa mesa ya no existe. Recargá la página.");
  revalidatePath("/dashboard/tables");
  return ok();
}

/**
 * Cambia el código de la mesa (S13): el QR impreso deja de abrir la carta y hay que imprimir el
 * nuevo. Sirve si un QR se copió o salió del local. El código nuevo sale del servidor.
 */
export async function rotateTableToken(id: string): Promise<ActionResult> {
  const c = await ctx();
  if (!c.ok) return fail(c.error);
  const parsed = uuid.safeParse(id);
  if (!parsed.success) return zodFail(parsed.error);
  const { data, error } = await c.supabase
    .from("tables")
    .update({ qr_token: crypto.randomUUID() })
    .eq("id", parsed.data)
    .eq("tenant_id", c.tenantId)
    .select("id");
  if (error) return dbFail("rotateTableToken", error, "No se pudo cambiar el QR de la mesa. Probá de nuevo.");
  if (!data?.length) return fail("Esa mesa ya no existe. Recargá la página.");
  revalidatePath("/dashboard/tables");
  return ok();
}

// ---------- Órdenes ----------
const statusSchema = z.enum(["pending", "preparing", "ready", "delivered", "paid", "cancelled"]);

/**
 * Cambia el estado de una orden de `from` a `to` (S11). Solo acepta el paso siguiente, cancelar
 * una orden activa o deshacer el último cambio (un paso atrás, o reabrir una cancelada) dentro de
 * `UNDO_SERVER_MS`. El `update` exige que la orden siga en `from`: si alguien la movió mientras
 * tanto, no se pisa y se avisa. La base hace cumplir lo mismo (trigger trg_order_status de
 * schema.sql): deshacer solo vuelve a `previous_status`, y una sola vez, así que solo se revierte
 * el último cambio.
 */
export async function updateOrderStatus(id: string, from: string, to: string): Promise<ActionResult> {
  const c = await ctx();
  if (!c.ok) return fail(c.error);
  const pid = uuid.safeParse(id);
  const f = statusSchema.safeParse(from);
  const t = statusSchema.safeParse(to);
  if (!pid.success || !f.success || !t.success) return fail("Estado de la orden inválido.");
  const forward = isForward(f.data, t.data);
  if (!forward && !isUndo(f.data, t.data)) return fail("Ese cambio de estado no se puede hacer desde el tablero.");

  // tenant_id: defensa en profundidad; la garantía es RLS.
  const cutoff = new Date(Date.now() - UNDO_SERVER_MS).toISOString();
  const run = (legacy: boolean) => {
    let q = c.supabase
      .from("orders")
      .update({ status: t.data })
      .eq("id", pid.data)
      .eq("tenant_id", c.tenantId)
      .eq("status", f.data);
    if (!forward) {
      // 1.7.0: deshacer vuelve solo a previous_status. Con una base anterior (sin la columna) se
      // usa la regla de 1.6.x: un paso atrás si la orden cambió hace poco.
      q = legacy
        ? q.gte("updated_at", cutoff)
        : q.eq("previous_status", t.data).gte("status_changed_at", cutoff);
    }
    return q.select("id");
  };
  let legacy = false;
  let { data, error } = await run(false);
  if (error?.code === "42703" && !forward) {
    console.error("[datafud] updateOrderStatus: base sin previous_status, se usa la regla anterior");
    legacy = true;
    ({ data, error } = await run(true));
  }
  // El trigger rechazó el cambio (por ejemplo, el reloj de la base ya cerró la ventana de deshacer).
  if (error?.hint === "datafud:order_transition") {
    revalidatePath("/dashboard/orders");
    return fail(forward ? "Ese cambio de estado no se puede hacer desde el tablero." : "Ya pasó el tiempo para deshacer ese cambio.");
  }
  if (error) return dbFail("updateOrderStatus", error, "No se pudo actualizar la orden. Probá de nuevo.");

  if (!data?.length) {
    // No cambió nada: se averigua por qué, para decirlo bien.
    const { data: now, error: e2 } = await c.supabase
      .from("orders")
      .select(legacy ? "status" : "status, previous_status")
      .eq("id", pid.data)
      .eq("tenant_id", c.tenantId)
      .maybeSingle<{ status: OrderStatus; previous_status?: OrderStatus | null }>();
    if (e2) return dbFail("updateOrderStatus", e2, "No se pudo actualizar la orden. Probá de nuevo.");
    revalidatePath("/dashboard/orders");
    if (!now) return fail("Esa orden ya no existe. El tablero se actualiza solo.");
    const actual = now.status;
    if (actual !== f.data) {
      return fail(`Esa orden ya estaba «${ORDER_STATUS_LABEL[actual]}»: alguien la cambió antes. El tablero ya se actualizó.`);
    }
    if (!legacy && now.previous_status !== t.data) return fail("Solo se puede deshacer el último cambio de una orden, una vez.");
    return fail("Ya pasó el tiempo para deshacer ese cambio.");
  }
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
    .max(2048, "La dirección del logo es muy larga.")
    .refine((u) => u.startsWith("https://"), "El logo tiene que estar en una dirección https.")
    .optional(),
  primary: hex,
  accent: hex,
});

export async function updateSettings(formData: FormData): Promise<ActionResult> {
  const c = await ctx();
  if (!c.ok) return fail(c.error);
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

  // Idiomas: los que incluye el plan del local (la fila de `plans`, con PRICING de respaldo).
  const { data: tenant, error: planErr } = await c.supabase
    .from("tenants")
    .select("plan:plans(code, features)")
    .eq("id", c.tenantId)
    .maybeSingle();
  if (planErr) return dbFail("updateSettings.plan", planErr, "No se pudo guardar la configuración. Probá de nuevo.");
  const planRel = tenant?.plan as Parameters<typeof planLimits>[0] | Parameters<typeof planLimits>[0][];
  const { maxLanguages } = planLimits(Array.isArray(planRel) ? planRel[0] : planRel);
  if (enabled.length > maxLanguages) {
    return fail(`Tu plan incluye ${maxLanguages} ${maxLanguages === 1 ? "idioma" : "idiomas"}. Desactivá ${enabled.length - maxLanguages === 1 ? "uno" : "los que sobran"} o escribinos para cambiar de plan.`);
  }

  // El logo que tenía, para quitarlo del bucket si se reemplazó.
  const { data: before, error: beforeErr } = await c.supabase
    .from("tenant_settings")
    .select("logo_url")
    .eq("tenant_id", c.tenantId)
    .maybeSingle();
  if (beforeErr) return dbFail("updateSettings.logo", beforeErr, "No se pudo guardar la configuración. Probá de nuevo.");

  const { data: saved, error } = await c.supabase
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
    .eq("tenant_id", c.tenantId)
    .select("tenant_id");
  if (error) return dbFail("updateSettings", error, "No se pudo guardar la configuración. Probá de nuevo.");
  // Sin fila en `tenant_settings` (un local creado a mano) no se guardó nada: no se dice «listo».
  if (!saved?.length) return fail("No encontramos la configuración de tu local, así que no se guardó. Escribinos por WhatsApp.");
  if (before?.logo_url && before.logo_url !== (s.logoUrl ?? null)) await removeUnusedMedia(c, before.logo_url);
  revalidatePath("/dashboard/settings");
  return ok();
}
