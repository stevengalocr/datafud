// DIAGNÓSTICO TEMPORAL (no se sube): parte /admin en pedazos.
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { StatCard } from "@/components/shell/stat-card";
import { EmptyState } from "@/components/shell/empty-state";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { formatUsdAmount } from "@/lib/currency/format";
import { Boundary } from "./boundary";

export const dynamic = "force-dynamic";

async function Tenants() {
  const supabase = await createClient();
  const r = await supabase.from("tenants").select("*").order("created_at", { ascending: false });
  console.error("[diag] tenants:", r.status, r.error ? `${r.error.code} ${r.error.message}` : `filas ${r.data?.length}`);
  return <span>status {r.status} · {r.error ? `error ${r.error.code} ${r.error.message}` : `filas ${r.data?.length}`}</span>;
}
async function Payments() {
  const supabase = await createClient();
  const r = await supabase.from("subscription_payments").select("amount_usd, paid_at");
  console.error("[diag] payments:", r.status, r.error ? `${r.error.code} ${r.error.message}` : `filas ${r.data?.length}`);
  return <span>status {r.status} · {r.error ? `error ${r.error.code} ${r.error.message}` : `filas ${r.data?.length}`}</span>;
}
async function User() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  console.error("[diag] user:", data.user?.id ?? "-", error?.message ?? "");
  return <span>{data.user ? "con usuario" : `sin usuario ${error?.message ?? ""}`}</span>;
}

export default function Diag() {
  return (
    <div>
      <Boundary name="1 texto">hola</Boundary>
      <Boundary name="2 usuario"><User /></Boundary>
      <Boundary name="3 tenants"><Tenants /></Boundary>
      <Boundary name="4 payments"><Payments /></Boundary>
      <Boundary name="5 PageHeader"><PageHeader eyebrow="Administración" title="Resumen" description="x" /></Boundary>
      <Boundary name="6 StatCard"><StatCard label="Restaurantes" value={0} icon="store" accent="brand" /></Boundary>
      <Boundary name="7 StatCard USD"><StatCard label="Cobrado" value={formatUsdAmount(0)} icon="wallet" accent="accent" hint="h" /></Boundary>
      <Boundary name="8 Card"><Card><CardHeader><CardTitle>Últimos</CardTitle></CardHeader></Card></Boundary>
      <Boundary name="9 EmptyState+Link"><EmptyState icon="store" title="t">a <Link href="/admin/tenants">R</Link></EmptyState></Boundary>
      <Boundary name="10 Icon"><Icon name="arrow-right" size={16} /></Boundary>
    </div>
  );
}
