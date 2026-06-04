"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TenantStatus } from "@/lib/supabase/types";

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
