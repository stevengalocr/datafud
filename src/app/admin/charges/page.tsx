import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChargeForm } from "./charge-form";
import { CHARGE_KIND_LABEL } from "@/lib/constants";
import type { TenantCharge, Tenant } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const STATUS_COLOR: Record<string, string> = {
  paid: "bg-brand-100 text-brand-800",
  pending: "bg-amber-100 text-amber-800",
  overdue: "bg-rose-100 text-rose-700",
};

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

  return (
    <div>
      <PageHeader
        title="Cargos"
        description="Implementación única ($249) y tarjetas NFC ($15/u). Registra y controla los cobros puntuales de cada cliente."
      />

      <Card className="mb-6">
        <CardHeader>
          <p className="font-medium text-slate-800">Registrar cargo puntual</p>
        </CardHeader>
        <CardBody>
          {tenantList.length > 0 ? (
            <ChargeForm tenants={tenantList} />
          ) : (
            <p className="text-sm text-slate-400">
              No hay restaurantes registrados todavía.
            </p>
          )}
        </CardBody>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Restaurante</th>
                <th className="px-5 py-3 font-medium">Concepto</th>
                <th className="px-5 py-3 font-medium">Cant.</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {nameById.get(c.tenant_id) ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-700">
                    {CHARGE_KIND_LABEL[c.kind]}
                    {c.description ? (
                      <span className="block text-xs text-slate-400">{c.description}</span>
                    ) : null}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{c.quantity}</td>
                  <td className="px-5 py-3 text-slate-700">
                    ${Number(c.amount_usd).toFixed(2)}
                  </td>
                  <td className="px-5 py-3">
                    <Badge className={STATUS_COLOR[c.status]}>{c.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(c.created_at).toLocaleDateString("es")}
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    Aún no hay cargos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
