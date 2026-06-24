"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ChargeKind, TenantStatus } from "@/lib/supabase/types";

async function assertSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (data?.role !== "super_admin") throw new Error("No autorizado");
  return supabase;
}

export async function setTenantStatus(tenantId: string, status: TenantStatus) {
  const supabase = await assertSuperAdmin();
  await supabase.from("tenants").update({ status }).eq("id", tenantId);
  revalidatePath("/admin/tenants");
  revalidatePath("/admin");
}

export async function registerPayment(formData: FormData) {
  const supabase = await assertSuperAdmin();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tenantId = String(formData.get("tenant_id"));
  const amount = Number(formData.get("amount_usd"));
  const periodStart = String(formData.get("period_start"));
  const periodEnd = String(formData.get("period_end"));

  if (!tenantId || !Number.isFinite(amount) || amount <= 0) {
    throw new Error("Datos de pago inválidos");
  }

  // plan actual del tenant
  const { data: tenant } = await supabase
    .from("tenants")
    .select("plan_id")
    .eq("id", tenantId)
    .single();

  await supabase.from("subscription_payments").insert({
    tenant_id: tenantId,
    plan_id: tenant?.plan_id ?? null,
    amount_usd: amount,
    period_start: periodStart,
    period_end: periodEnd,
    paid_at: new Date().toISOString(),
    status: "paid",
    approved_by: user?.id ?? null,
  });

  // mantener activo el tenant tras registrar pago
  await supabase.from("tenants").update({ status: "active" }).eq("id", tenantId);

  revalidatePath("/admin/payments");
  revalidatePath("/admin/tenants");
}

export async function registerCharge(formData: FormData) {
  const supabase = await assertSuperAdmin();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tenantId = String(formData.get("tenant_id"));
  const kind = String(formData.get("kind")) as ChargeKind;
  const quantity = Math.max(1, Math.trunc(Number(formData.get("quantity")) || 1));
  const unitAmount = Number(formData.get("unit_amount_usd"));
  const description = String(formData.get("description") ?? "").trim() || null;
  const markPaid = formData.get("status") === "paid";

  if (
    !tenantId ||
    !["implementation", "nfc_cards", "other"].includes(kind) ||
    !Number.isFinite(unitAmount) ||
    unitAmount <= 0
  ) {
    throw new Error("Datos del cargo inválidos");
  }

  await supabase.from("tenant_charges").insert({
    tenant_id: tenantId,
    kind,
    description,
    quantity,
    unit_amount_usd: unitAmount,
    amount_usd: Number((unitAmount * quantity).toFixed(2)),
    status: markPaid ? "paid" : "pending",
    paid_at: markPaid ? new Date().toISOString() : null,
    approved_by: user?.id ?? null,
  });

  revalidatePath("/admin/charges");
  revalidatePath("/admin");
}
