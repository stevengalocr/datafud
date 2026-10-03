import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState } from "@/components/shell/empty-state";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PAYMENT_STATUS_COLOR, PAYMENT_STATUS_LABEL } from "@/lib/constants";
import { formatUsdAmount } from "@/lib/currency/format";
import { formatDate } from "@/lib/dates";
import { PaymentForm } from "./payment-form";
import type { SubscriptionPayment, Tenant } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

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
        eyebrow="Administración"
        title="Pagos"
        description="Registrá las mensualidades y controlá los vencimientos de cada local."
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Registrar pago manual</CardTitle>
        </CardHeader>
        <CardBody>
          {tenantList.length > 0 ? (
            <PaymentForm tenants={tenantList} />
          ) : (
            <p className="text-sm text-stone-600">
              Para registrar un pago primero tiene que haber un restaurante dado de alta.
            </p>
          )}
        </CardBody>
      </Card>

      <h2 className="mb-3 text-base font-semibold text-brand-900">Historial</h2>
      {list.length === 0 ? (
        <EmptyState icon="card" title="Todavía no hay pagos registrados">
          Cada mensualidad que registrés arriba queda acá con su periodo y su estado.
        </EmptyState>
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {list.map((p) => (
              <li key={p.id}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 break-words font-semibold text-brand-950">
                      {nameById.get(p.tenant_id) ?? "Restaurante sin nombre"}
                    </p>
                    <Badge className={PAYMENT_STATUS_COLOR[p.status]}>
                      {PAYMENT_STATUS_LABEL[p.status]}
                    </Badge>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-brand-950 tabular-nums">
                    {formatUsdAmount(Number(p.amount_usd))}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    {formatDate(p.period_start)} – {formatDate(p.period_end)}
                    {p.paid_at ? ` · pagado el ${formatDate(p.paid_at)}` : ""}
                  </p>
                </Card>
              </li>
            ))}
          </ul>

          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Mensualidades registradas</caption>
                <thead className="bg-cream-100 text-left text-xs uppercase tracking-wide text-stone-600">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">Restaurante</th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">Monto</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Periodo</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Estado</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Pagado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {list.map((p) => (
                    <tr key={p.id} className="hover:bg-cream-50">
                      <td className="px-5 py-3.5 font-medium text-brand-950">
                        {nameById.get(p.tenant_id) ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-brand-950 tabular-nums">
                        {formatUsdAmount(Number(p.amount_usd))}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-stone-700">
                        {formatDate(p.period_start)} – {formatDate(p.period_end)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge className={PAYMENT_STATUS_COLOR[p.status]}>
                          {PAYMENT_STATUS_LABEL[p.status]}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-stone-600">
                        {p.paid_at ? formatDate(p.paid_at) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
