"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { type ActionResult, dbFail, fail, ok, zodFail } from "@/lib/action-result";
import { changeOwnPassword, type PasswordResult } from "@/lib/auth/change-password";
import { TEMP_PASSWORD_FLAG } from "@/lib/auth/temporary-password";
import { CARTAS, cartaBySlug } from "@/content/cartas";
import { QR_CODES } from "@/content/qr";
import { destinoMesa, planDeCarta } from "@/lib/carta-a-sistema";
import { SITE } from "@/lib/site";

// Toda acción del super admin verifica el rol en el servidor antes de tocar nada.
async function superAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (data?.role !== "super_admin") return null;
  return { supabase, userId: user.id };
}
const NO_AUTORIZADO = "Tu sesión venció o no tenés permiso. Volvé a entrar.";

const uuid = z.string().uuid("Elegí un restaurante de la lista.");
const fecha = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida.");

// ---------- Estado de un local ----------
const statusSchema = z.enum(["trial", "active", "suspended", "cancelled"]);

export async function setTenantStatus(tenantId: string, status: string): Promise<ActionResult> {
  const ctx = await superAdmin();
  if (!ctx) return fail(NO_AUTORIZADO);
  const id = uuid.safeParse(tenantId);
  const st = statusSchema.safeParse(status);
  if (!id.success || !st.success) return fail("Estado inválido.");
  const { data, error } = await ctx.supabase
    .from("tenants")
    .update({ status: st.data })
    .eq("id", id.data)
    .select("id");
  if (error) return dbFail("setTenantStatus", error, "No se pudo cambiar el estado. Probá de nuevo.");
  if (!data?.length) return fail("Ese restaurante ya no existe. Recargá la página.");
  revalidatePath("/admin/tenants");
  revalidatePath("/admin");
  return ok();
}

// ---------- Alta de un local (S10) ----------
// El dueño recibe una contraseña temporal que se muestra una sola vez: el correo de Supabase
// solo entrega al equipo del proyecto, así que no se puede invitar por correo todavía.
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);

const tempPassword = () => {
  // 15 caracteres sin ambiguos (0/O, 1/l/I), fáciles de dictar por WhatsApp.
  const abc = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(15);
  let s = "";
  for (const b of bytes) s += abc[b % abc.length];
  return `${s.slice(0, 5)}-${s.slice(5, 10)}-${s.slice(10)}`;
};

const createTenantSchema = z.object({
  name: z.string().trim().min(2, "Escribí el nombre del local.").max(80, "El nombre es muy largo."),
  slug: z
    .string()
    .trim()
    .max(40, "La dirección es muy larga.")
    .regex(/^[a-z0-9-]*$/, "La dirección solo lleva minúsculas, números y guiones.")
    .optional(),
  plan: z.enum(["basico", "estandar", "empresarial"], { message: "Elegí un plan." }),
  currency: z.enum(["CRC", "USD"]).default("CRC"),
  ownerName: z.string().trim().min(2, "Escribí el nombre del dueño.").max(80, "El nombre es muy largo."),
  ownerEmail: z.string().trim().toLowerCase().email("El correo del dueño no es válido."),
  phone: z.string().trim().max(30).optional(),
});

export type CreatedTenant = { name: string; slug: string; email: string; password: string };

export async function createTenant(
  _prev: ActionResult<CreatedTenant> | null,
  formData: FormData
): Promise<ActionResult<CreatedTenant>> {
  const ctx = await superAdmin();
  if (!ctx) return fail(NO_AUTORIZADO);
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return fail("Falta SUPABASE_SERVICE_ROLE_KEY en el servidor: sin ella no se pueden crear usuarios.");
  }

  const parsed = createTenantSchema.safeParse({
    name: formData.get("name"),
    slug: (formData.get("slug") as string) || undefined,
    plan: formData.get("plan"),
    currency: formData.get("currency") || "CRC",
    ownerName: formData.get("owner_name"),
    ownerEmail: formData.get("owner_email"),
    phone: (formData.get("phone") as string) || undefined,
  });
  if (!parsed.success) return zodFail(parsed.error);
  const { name, plan, currency, ownerName, ownerEmail, phone } = parsed.data;
  const slug = parsed.data.slug || slugify(name);
  if (slug.length < 2) return fail("La dirección del local queda vacía: escribila a mano.");

  const admin = createAdminClient();

  const { data: taken } = await admin.from("tenants").select("id").eq("slug", slug).maybeSingle();
  if (taken) return fail(`La dirección /${slug} ya la usa otro local. Elegí otra.`);

  const { data: planRow, error: planErr } = await admin.from("plans").select("id").eq("code", plan).single();
  if (planErr || !planRow) return dbFail("createTenant.plan", planErr, "No se encontró el plan elegido.");

  // 1) Usuario del dueño, confirmado, con contraseña temporal.
  const password = tempPassword();
  const { data: created, error: userErr } = await admin.auth.admin.createUser({
    email: ownerEmail,
    password,
    email_confirm: true,
    // La contraseña viaja por WhatsApp: el panel le pide al dueño cambiarla en su primer ingreso.
    user_metadata: { full_name: ownerName, [TEMP_PASSWORD_FLAG]: true },
  });
  if (userErr || !created?.user) {
    console.error("[datafud] createTenant.user:", userErr?.status ?? "-", userErr?.message ?? "");
    return fail(
      userErr?.message?.toLowerCase().includes("already")
        ? "Ese correo ya tiene una cuenta. Usá otro."
        : "No se pudo crear el usuario del dueño. Probá de nuevo."
    );
  }
  const userId = created.user.id;

  // 2) El local, su perfil y su configuración. Si algo falla, se deshace todo.
  const { data: tenant, error: tenantErr } = await admin
    .from("tenants")
    .insert({
      name,
      slug,
      status: "active",
      plan_id: planRow.id,
      owner_email: ownerEmail,
      owner_name: ownerName,
      phone: phone ?? null,
    })
    .select("id")
    .single();
  if (tenantErr || !tenant) {
    await admin.auth.admin.deleteUser(userId);
    return dbFail("createTenant.tenant", tenantErr, "No se pudo crear el local. Probá de nuevo.");
  }

  const rollback = async () => {
    await admin.from("tenants").delete().eq("id", tenant.id);
    await admin.auth.admin.deleteUser(userId);
  };

  const { error: profileErr } = await admin
    .from("profiles")
    .insert({ id: userId, tenant_id: tenant.id, role: "restaurant_admin", full_name: ownerName });
  if (profileErr) {
    await rollback();
    return dbFail("createTenant.profile", profileErr, "No se pudo crear el perfil del dueño. No quedó nada a medias.");
  }

  const { error: settingsErr } = await admin.from("tenant_settings").insert({
    tenant_id: tenant.id,
    currency_code: currency,
    default_language: "es",
    enabled_languages: ["es"],
    restaurant_name: name,
    phone: phone ?? null,
  });
  if (settingsErr) {
    await rollback();
    return dbFail("createTenant.settings", settingsErr, "No se pudo guardar la configuración del local. No quedó nada a medias.");
  }

  revalidatePath("/admin/tenants");
  revalidatePath("/admin");
  return ok({ name, slug, email: ownerEmail, password });
}

// ---------- Pasar una Carta al sistema (OFERTA.md §4, día 11) ----------
// El local de una Carta estática (/c/<slug>) pasa a un plan con pedidos: su menú se copia a la
// base de un local ya creado, con una mesa, y el código impreso se mueve después con
// `scripts/qr-mover.mjs`. Corre con la sesión del super admin: la RLS lo deja escribir en
// cualquier local (is_super_admin), así que no usa service_role (regla 5).
const importCartaSchema = z.object({
  tenantId: uuid,
  carta: z.string().refine((s) => CARTAS.some((c) => c.slug === s), "Elegí una carta de la lista."),
  mesa: z.string().trim().min(1, "Escribí el nombre de la mesa.").max(40, "El nombre de la mesa es muy largo."),
  fotos: z.boolean(),
});

export type CartaImportada = {
  local: string;
  destino: string;
  codigos: string[];
  categorias: number;
  platillos: number;
  fotosCopiadas: number;
  fotosSinCopiar: number;
};

const FOTO_TIPOS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;
const FOTO_MAX = 2 * 1024 * 1024;

function esImagen(tipo: keyof typeof FOTO_TIPOS, b: Uint8Array) {
  const at = (i: number, s: string) => [...s].every((ch, k) => b[i + k] === ch.charCodeAt(0));
  if (tipo === "image/jpeg") return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (tipo === "image/png") return b[0] === 0x89 && at(1, "PNG");
  return at(0, "RIFF") && at(8, "WEBP");
}

/** Baja una foto publicada en el propio sitio. Solo el origen de SITE.url y solo rutas que ya validó planDeCarta. */
async function bajarFoto(ruta: string): Promise<{ tipo: keyof typeof FOTO_TIPOS; bytes: Uint8Array } | null> {
  try {
    const base = new URL(SITE.url);
    const url = new URL(ruta, base);
    if (url.origin !== base.origin) return null;
    const res = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (!res.ok) return null;
    const tipo = (res.headers.get("content-type") ?? "").split(";")[0].trim() as keyof typeof FOTO_TIPOS;
    if (!(tipo in FOTO_TIPOS)) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.byteLength === 0 || bytes.byteLength > FOTO_MAX || !esImagen(tipo, bytes)) return null;
    return { tipo, bytes };
  } catch {
    return null;
  }
}

// El tope del plan lo dice el trigger (enforce_plan_limit). Para el super admin, el mensaje
// dice que el plan del local no alcanza, no «tu plan».
function limite(error: { message?: string } | null) {
  if (!error?.message?.startsWith("Límite del plan alcanzado")) return null;
  console.error("[datafud] importCarta: límite del plan");
  return fail(
    "La carta no entra en el plan del local (platillos, categorías o mesas). Subile el plan y probá de nuevo. No se pasó nada."
  );
}

export async function importCarta(
  _prev: ActionResult<CartaImportada> | null,
  formData: FormData
): Promise<ActionResult<CartaImportada>> {
  const ctx = await superAdmin();
  if (!ctx) return fail(NO_AUTORIZADO);
  const parsed = importCartaSchema.safeParse({
    tenantId: formData.get("tenant_id"),
    carta: formData.get("carta"),
    mesa: formData.get("mesa") || "Stand",
    fotos: formData.get("fotos") === "on",
  });
  if (!parsed.success) return zodFail(parsed.error);
  const { tenantId, mesa, fotos } = parsed.data;
  const carta = cartaBySlug(parsed.data.carta);
  if (!carta) return fail("Elegí una carta de la lista.");

  const plan = planDeCarta(carta.menu);
  if (!plan.ok) return fail(`La carta tiene datos que la base no acepta: ${plan.errores.slice(0, 2).join(" ")}`);
  const { categorias, platillos, ajustes } = plan.plan;

  const sb = ctx.supabase;
  const { data: tenant, error: tErr } = await sb
    .from("tenants")
    .select("id, name, slug, status, plan_id")
    .eq("id", tenantId)
    .maybeSingle();
  if (tErr) return dbFail("importCarta.tenant", tErr, "No se pudo leer el local. Probá de nuevo.");
  if (!tenant) return fail("Ese restaurante ya no existe. Recargá la página.");
  if (tenant.status !== "active" && tenant.status !== "trial") {
    return fail(`${tenant.name} está suspendido o cancelado: reactivalo antes de pasarle la carta.`);
  }

  // Un local con menú no se pisa: la carta se pasa una sola vez, sobre un menú vacío.
  const head = { count: "exact" as const, head: true };
  const [cats, prods, planRes] = await Promise.all([
    sb.from("categories").select("id", head).eq("tenant_id", tenantId),
    sb.from("products").select("id", head).eq("tenant_id", tenantId),
    tenant.plan_id
      ? sb.from("plans").select("features").eq("id", tenant.plan_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  const cErr = cats.error ?? prods.error ?? planRes.error;
  if (cErr) return dbFail("importCarta.count", cErr, "No se pudo revisar el menú del local. Probá de nuevo.");
  if ((cats.count ?? 0) + (prods.count ?? 0) > 0) {
    return fail(`${tenant.name} ya tiene categorías o platillos. La carta solo se pasa a un local con el menú vacío.`);
  }

  // Idiomas: no más de los que permite el plan del local, empezando por el principal.
  const features = (planRes.data?.features ?? {}) as { max_languages?: number | null };
  const maxLangs = typeof features.max_languages === "number" ? features.max_languages : 3;
  const idiomas = [
    ajustes.default_language,
    ...ajustes.enabled_languages.filter((l) => l !== ajustes.default_language),
  ].slice(0, Math.max(1, maxLangs));

  // 1) Fotos a Storage, de a cuatro, en la carpeta del local (sale del servidor, no del formulario).
  const subidas: string[] = [];
  const urlDe = new Map<string, string>();
  if (fotos && plan.plan.fotos.length) {
    const cola = [...plan.plan.fotos];
    const trabajar = async () => {
      for (let ruta = cola.shift(); ruta; ruta = cola.shift()) {
        const f = await bajarFoto(ruta);
        if (!f) continue;
        const carpeta = ruta === ajustes.logo ? "logo" : "products";
        const path = `${tenantId}/${carpeta}/${crypto.randomUUID()}.${FOTO_TIPOS[f.tipo]}`;
        const { error } = await sb.storage.from("media").upload(path, f.bytes, { contentType: f.tipo, upsert: false });
        if (error) {
          console.error("[datafud] importCarta.foto:", error.message ?? "-");
          continue;
        }
        subidas.push(path);
        urlDe.set(ruta, sb.storage.from("media").getPublicUrl(path).data.publicUrl);
      }
    };
    await Promise.all([trabajar(), trabajar(), trabajar(), trabajar()]);
  }

  let catIds: string[] = [];
  let prodIds: string[] = [];
  let mesaId: string | null = null;
  // Si algo falla a mitad de camino, se deshace lo que se escribió: el local queda como estaba.
  const deshacer = async () => {
    if (prodIds.length) await sb.from("products").delete().in("id", prodIds);
    if (catIds.length) await sb.from("categories").delete().in("id", catIds);
    if (mesaId) await sb.from("tables").delete().eq("id", mesaId);
    if (subidas.length) await sb.storage.from("media").remove(subidas);
  };
  const NADA = "No se pasó nada: el local quedó como estaba.";

  // 2) Categorías. El orden es único dentro de la carta, así que sirve para casar cada fila.
  const idDe = new Map<string, string | null>();
  if (categorias.length) {
    const { data, error } = await sb
      .from("categories")
      .insert(categorias.map((c) => ({ tenant_id: tenantId, name_i18n: c.name_i18n, sort_order: c.sort_order })))
      .select("id, sort_order");
    catIds = (data ?? []).map((r) => r.id);
    if (error || !data || data.length !== categorias.length) {
      await deshacer();
      return limite(error) ?? dbFail("importCarta.categorias", error, `No se pudieron crear las categorías. ${NADA}`);
    }
    const porOrden = new Map(data.map((r) => [r.sort_order, r.id]));
    for (const c of categorias) idDe.set(c.clave, porOrden.get(c.sort_order) ?? null);
  }

  // 3) Platillos.
  if (platillos.length) {
    const filas = platillos.map((p) => ({
      tenant_id: tenantId,
      category_id: p.categoria ? idDe.get(p.categoria) ?? null : null,
      name_i18n: p.name_i18n,
      description_i18n: p.description_i18n,
      price: p.price,
      image_url: p.image_url ?? (p.foto ? urlDe.get(p.foto) ?? null : null),
      sort_order: p.sort_order,
      is_available: true,
    }));
    const { data, error } = await sb.from("products").insert(filas).select("id");
    prodIds = (data ?? []).map((r) => r.id);
    if (error || !data || data.length !== filas.length) {
      await deshacer();
      return limite(error) ?? dbFail("importCarta.platillos", error, `No se pudieron crear los platillos. ${NADA}`);
    }
  }

  // 4) La mesa del stand: su token arma el destino nuevo del código impreso.
  const { data: tabla, error: mErr } = await sb
    .from("tables")
    .insert({ tenant_id: tenantId, label: mesa })
    .select("id, qr_token")
    .single();
  if (mErr || !tabla) {
    await deshacer();
    return limite(mErr) ?? dbFail("importCarta.mesa", mErr, `No se pudo crear la mesa. ${NADA}`);
  }
  mesaId = tabla.id;

  // 5) Nombre, logo, colores, moneda e idiomas de la carta.
  const logo = ajustes.logo_url ?? (ajustes.logo ? urlDe.get(ajustes.logo) ?? null : null);
  const { data: aj, error: aErr } = await sb
    .from("tenant_settings")
    .update({
      restaurant_name: ajustes.restaurant_name,
      currency_code: ajustes.currency_code,
      default_language: idiomas[0],
      enabled_languages: idiomas,
      theme: ajustes.theme,
      ...(logo ? { logo_url: logo } : {}),
    })
    .eq("tenant_id", tenantId)
    .select("tenant_id");
  if (aErr || !aj?.length) {
    await deshacer();
    return dbFail("importCarta.ajustes", aErr, `No se pudo guardar la configuración del local. ${NADA}`);
  }

  const desde = `/c/${carta.slug}`;
  revalidatePath("/admin/tenants");
  return ok({
    local: tenant.name,
    destino: destinoMesa(tenant.slug, tabla.qr_token),
    codigos: Object.entries(QR_CODES)
      .filter(([, d]) => d === desde)
      .map(([c]) => c),
    categorias: catIds.length,
    platillos: prodIds.length,
    fotosCopiadas: subidas.length,
    fotosSinCopiar: fotos ? plan.plan.fotos.length - subidas.length : 0,
  });
}

// ---------- Pagos ----------
const paymentSchema = z
  .object({
    tenantId: uuid,
    amount: z.coerce.number({ message: "Monto inválido." }).positive("El monto tiene que ser mayor que cero.").max(100000, "Monto demasiado alto."),
    periodStart: fecha,
    periodEnd: fecha,
  })
  .refine((v) => v.periodEnd >= v.periodStart, { message: "«Hasta» no puede ser antes de «Desde»." });

export async function registerPayment(formData: FormData): Promise<ActionResult<{ message: string }>> {
  const ctx = await superAdmin();
  if (!ctx) return fail(NO_AUTORIZADO);
  const parsed = paymentSchema.safeParse({
    tenantId: formData.get("tenant_id"),
    amount: formData.get("amount_usd"),
    periodStart: formData.get("period_start"),
    periodEnd: formData.get("period_end"),
  });
  if (!parsed.success) return zodFail(parsed.error);
  const { tenantId, amount, periodStart, periodEnd } = parsed.data;

  const { data: tenant, error: tenantErr } = await ctx.supabase
    .from("tenants")
    .select("plan_id, status")
    .eq("id", tenantId)
    .maybeSingle();
  if (tenantErr) return dbFail("registerPayment.tenant", tenantErr, "No se pudo registrar el pago. Probá de nuevo.");
  if (!tenant) return fail("Ese restaurante ya no existe. Recargá la página.");

  // Un segundo clic (o un reintento después de un aviso) no registra el mismo pago dos veces:
  // el mismo local con el mismo periodo ya pagado se rechaza.
  const { data: dup, error: dupErr } = await ctx.supabase
    .from("subscription_payments")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("period_start", periodStart)
    .eq("period_end", periodEnd)
    .limit(1);
  if (dupErr) return dbFail("registerPayment.dup", dupErr, "No se pudo registrar el pago. Probá de nuevo.");
  if (dup?.length) {
    return fail("Ese local ya tiene un pago registrado con el mismo periodo. No se registró otro: si es un pago distinto, revisá las fechas.");
  }

  const { error } = await ctx.supabase.from("subscription_payments").insert({
    tenant_id: tenantId,
    plan_id: tenant.plan_id ?? null,
    amount_usd: amount,
    period_start: periodStart,
    period_end: periodEnd,
    paid_at: new Date().toISOString(),
    status: "paid",
    approved_by: ctx.userId,
  });
  // Dos clics a la vez: el índice único por local y periodo (schema.sql, 14a) frena el segundo.
  if (error?.code === "23505") return fail("Ya hay un pago registrado para ese período en este local. No se registró otro.");
  if (error) return dbFail("registerPayment", error, "No se pudo registrar el pago. Probá de nuevo.");

  revalidatePath("/admin/payments");
  revalidatePath("/admin");

  // Un pago reactiva solo a un local suspendido o en prueba. Uno cancelado se reactiva a mano,
  // desde Restaurantes: un pago atrasado no debe revivirlo sin que nadie lo decida.
  if (tenant.status !== "suspended" && tenant.status !== "trial") {
    return ok({
      message:
        tenant.status === "cancelled"
          ? "Pago registrado. El local sigue cancelado: si corresponde, reactivalo desde Restaurantes."
          : "Pago registrado.",
    });
  }
  // La condición de estado va en el `update`: si alguien lo canceló mientras tanto, no se revive.
  const { data: updated, error: statusErr } = await ctx.supabase
    .from("tenants")
    .update({ status: "active" })
    .eq("id", tenantId)
    .in("status", ["suspended", "trial"])
    .select("id");
  revalidatePath("/admin/tenants");
  if (statusErr) {
    console.error("[datafud] registerPayment.status:", statusErr.code ?? "-", statusErr.message ?? "");
    return fail("El pago quedó registrado (no lo registrés de nuevo), pero no se pudo activar el local. Activalo desde Restaurantes.");
  }
  if (!updated?.length) {
    return ok({ message: "Pago registrado. El estado del local cambió mientras tanto, así que no se tocó: revisalo en Restaurantes." });
  }
  return ok({ message: "Pago registrado. El local quedó activo y su carta vuelve a abrirse." });
}

// ---------- Cargos ----------
const chargeSchema = z.object({
  tenantId: uuid,
  kind: z.enum(["implementation", "nfc_cards", "other"], { message: "Elegí el tipo de cargo." }),
  quantity: z.coerce.number().int("La cantidad es un número entero.").min(1, "La cantidad mínima es 1.").max(1000, "Cantidad demasiado alta."),
  unitAmount: z.coerce.number({ message: "Monto inválido." }).positive("El monto tiene que ser mayor que cero.").max(100000, "Monto demasiado alto."),
  description: z.string().trim().max(200, "La descripción es muy larga.").optional(),
  paid: z.boolean(),
});

export async function registerCharge(formData: FormData): Promise<ActionResult> {
  const ctx = await superAdmin();
  if (!ctx) return fail(NO_AUTORIZADO);
  const parsed = chargeSchema.safeParse({
    tenantId: formData.get("tenant_id"),
    kind: formData.get("kind"),
    quantity: formData.get("quantity") || 1,
    unitAmount: formData.get("unit_amount_usd"),
    description: (formData.get("description") as string) || undefined,
    paid: formData.get("status") === "paid",
  });
  if (!parsed.success) return zodFail(parsed.error);
  const { tenantId, kind, quantity, unitAmount, description, paid } = parsed.data;

  const { error } = await ctx.supabase.from("tenant_charges").insert({
    tenant_id: tenantId,
    kind,
    description: description ?? null,
    quantity,
    unit_amount_usd: unitAmount,
    amount_usd: Number((unitAmount * quantity).toFixed(2)),
    status: paid ? "paid" : "pending",
    paid_at: paid ? new Date().toISOString() : null,
    approved_by: ctx.userId,
  });
  if (error) return dbFail("registerCharge", error, "No se pudo registrar el cargo. Probá de nuevo.");
  revalidatePath("/admin/charges");
  revalidatePath("/admin");
  return ok();
}

// ---------- Cuenta del super admin ----------
export async function changeAdminPassword(formData: FormData): Promise<PasswordResult> {
  const ctx = await superAdmin();
  if (!ctx) return fail(NO_AUTORIZADO);
  return changeOwnPassword(formData);
}
