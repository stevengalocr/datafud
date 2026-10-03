import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState } from "@/components/shell/empty-state";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChargeForm } from "./charge-form";
import {
  CHARGE_KIND_LABEL,
  PAYMENT_STATUS_COLOR,
  PAYMENT_STATUS_LABEL,
  PRICING,
} from "@/lib/constants";
import { formatUsd, formatUsdAmount } from "@/lib/currency/format";
import { formatDate } from "@/lib/dates";
import type { TenantCharge, Tenant } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function ChargesPage() {
  const supabase = await createClient();
  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, name")
    .order("name");
  const { data: charges } = await supabase
    .from("tenant_charges")
    .select("*")
    .order("created_at", { ascending: false });

  const tenantList = (tenants as Pick<Tenant, "id" | "name">[]) ?? [];
  const nameById = new Map(tenantList.map((t) => [t.id, t.name]));
  const list = (charges as TenantCharge[]) ?? [];

  // Las cifras salen de PRICING (regla 6): antes estaban escritas a mano en el texto.
  const description = `Cobros únicos de cada local: implementación (${formatUsd(
    PRICING.setupFee.sistema.usd
  )} el sistema completo, ${formatUsd(PRICING.setupFee.carta.usd)} la Carta) y tarjetas NFC (${formatUsd(
    PRICING.nfcUnitUsd
  )} c/u).`;

  return (
    <div>
      <PageHeader eyebrow="Administración" title="Cargos" description={description} />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Registrar cargo puntual</CardTitle>
        </CardHeader>
        <CardBody>
          {tenantList.length > 0 ? (
            <ChargeForm tenants={tenantList} />
          ) : (
            <p className="text-sm text-stone-600">
              Para registrar un cargo primero tiene que haber un restaurante dado de alta.
            </p>
          )}
        </CardBody>
      </Card>

      <h2 className="mb-3 text-base font-semibold text-brand-900">Historial</h2>
      {list.length === 0 ? (
        <EmptyState icon="receipt" title="Todavía no hay cargos registrados">
          Las implementaciones, las tarjetas NFC y otros cobros únicos que registrés quedan acá.
        </EmptyState>
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {list.map((c) => (
              <li key={c.id}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 break-words font-semibold text-brand-950">
                      {nameById.get(c.tenant_id) ?? "Restaurante sin nombre"}
                    </p>
                    <Badge className={PAYMENT_STATUS_COLOR[c.status]}>
                      {PAYMENT_STATUS_LABEL[c.status]}
                    </Badge>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-brand-950 tabular-nums">
                    {formatUsdAmount(Number(c.amount_usd))}
                  </p>
                  <p className="mt-1 text-sm text-stone-700">
                    {CHARGE_KIND_LABEL[c.kind]} · {c.quantity} u. · {formatDate(c.created_at)}
                  </p>
                  {c.description && <p className="mt-1 text-sm text-stone-600">{c.description}</p>}
                </Card>
              </li>
            ))}
          </ul>

          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Cargos puntuales registrados</caption>
                <thead className="bg-cream-100 text-left text-xs uppercase tracking-wide text-stone-600">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">Restaurante</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Concepto</th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">Cant.</th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">Total</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Estado</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {list.map((c) => (
                    <tr key={c.id} className="align-top hover:bg-cream-50">
                      <td className="px-5 py-3.5 font-medium text-brand-950">
                        {nameById.get(c.tenant_id) ?? "—"}
                      </td>
                      <td className="max-w-[20rem] px-5 py-3.5 text-stone-800">
                        {CHARGE_KIND_LABEL[c.kind]}
                        {c.description ? (
                          <span className="block text-xs text-stone-600">{c.description}</span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3.5 text-right text-stone-700 tabular-nums">{c.quantity}</td>
                      <td className="px-5 py-3.5 text-right font-medium text-brand-950 tabular-nums">
                        {formatUsdAmount(Number(c.amount_usd))}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge className={PAYMENT_STATUS_COLOR[c.status]}>
                          {PAYMENT_STATUS_LABEL[c.status]}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-stone-600">
                        {formatDate(c.created_at)}
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
