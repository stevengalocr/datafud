import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentForm } from "./payment-form";
import type { SubscriptionPayment, Tenant } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const STATUS_COLOR: Record<string, string> = {
  paid: "bg-brand-100 text-brand-800",
  pending: "bg-amber-100 text-amber-800",
  overdue: "bg-rose-100 text-rose-700",
};

export default async function PaymentsPage() {
  const supabase = await createClient();
  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, name")
    .order("name");
  const { data: payments } = await supabase
    .from("subscription_payments")
    .select("*")
    .order("created_at", { ascending: false });

  const tenantList = (tenants as Pick<Tenant, "id" | "name">[]) ?? [];
  const nameById = new Map(tenantList.map((t) => [t.id, t.name]));
  const list = (payments as SubscriptionPayment[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Pagos"
        description="Registra las mensualidades y controla los vencimientos de cada cliente."
      />

      <Card className="mb-6">
        <CardHeader>
          <p className="font-medium text-slate-800">Registrar pago manual</p>
        </CardHeader>
        <CardBody>
          {tenantList.length > 0 ? (
            <PaymentForm tenants={tenantList} />
          ) : (
            <p className="text-sm text-slate-400">
              No hay restaurantes registrados todavía.
            </p>
          )}
        </CardBody>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Restaurante</th>
              <th className="px-5 py-3 font-medium">Monto</th>
              <th className="px-5 py-3 font-medium">Periodo</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium">Pagado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/60">
                <td className="px-5 py-3 font-medium text-slate-900">
                  {nameById.get(p.tenant_id) ?? "—"}
                </td>
                <td className="px-5 py-3 text-slate-700">
                  ${Number(p.amount_usd).toFixed(2)}
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {new Date(p.period_start).toLocaleDateString("es")} –{" "}
                  {new Date(p.period_end).toLocaleDateString("es")}
                </td>
                <td className="px-5 py-3">
                  <Badge className={STATUS_COLOR[p.status]}>{p.status}</Badge>
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {p.paid_at ? new Date(p.paid_at).toLocaleDateString("es") : "—"}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                  Aún no hay pagos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
