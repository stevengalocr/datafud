import QRCode from "qrcode";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState } from "@/components/shell/empty-state";
import { Card } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { NoTableOrderingNotice } from "@/components/shell/plan-notice";
import { must } from "../_lib/queries";
import { AddTableForm, DeleteTableButton, RotateTokenButton } from "./table-actions";
import { QR_PRINT, tableMenuUrl } from "./qr";
import type { RestaurantTable } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function TablesPage({
  searchParams,
}: {
  searchParams: Promise<{ qr?: string }>;
}) {
  const { tenant, plan, readOnly } = await getTenantContext();
  // La descarga del QR vuelve acá con ?qr=error si la mesa ya no existe o la base no respondió.
  const qrError = (await searchParams).qr === "error";
  const supabase = await createClient();

  // Un error de la base no se pinta como «Todavía no hay mesas»: entra error.tsx (AA-5). El filtro
  // por negocio es defensa en profundidad (S1): la garantía es RLS.
  const tables = must<RestaurantTable>(
    await supabase
      .from("tables")
      .select("*")
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: true })
      .order("id"),
    "mesas"
  );

  // Solo la vista previa va en la página (~3 KB por mesa). El PNG grande y el SVG para imprimir
  // se generan al descargarlos ([id]/qr/route.ts).
  const withQr = await Promise.all(
    tables.map(async (table) => {
      const url = tableMenuUrl(tenant.slug, table.qr_token);
      const qr = await QRCode.toDataURL(url, { width: 240, ...QR_PRINT });
      const download = `/dashboard/tables/${table.id}/qr`;
      return { table, url, qr, png: `${download}?format=png`, svg: `${download}?format=svg` };
    })
  );

  return (
    <div>
      <PageHeader
        title="Mesas y QR"
        description="Cada mesa tiene su propio QR. Descargalo, imprimilo y ponelo en la mesa: así sabemos de qué mesa viene cada orden."
        action={<AddTableForm readOnly={readOnly} />}
      />
      {!plan.tableOrdering && <NoTableOrderingNotice where="tables" />}
      {qrError && (
        <p role="alert" className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          No se pudo descargar ese QR: la mesa ya no existe o la conexión falló. Probá de nuevo desde la lista.
        </p>
      )}

      {withQr.length === 0 ? (
        <EmptyState icon="qr" title="Todavía no hay mesas">
          Agregá la primera con el nombre que usan en el local (Mesa 1, Barra, Terraza 2). Al
          guardarla aparece su QR listo para descargar.
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {withQr.map(({ table, url, qr, png, svg }) => (
            <li key={table.id}>
              <Card className="flex h-full flex-col items-center p-5 text-center">
                <h2 className="font-semibold text-brand-950">{table.label}</h2>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qr}
                  alt={`Código QR de ${table.label}`}
                  width={160}
                  height={160}
                  className="my-3 h-40 w-40 rounded-lg border border-stone-200"
                />
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 max-w-full items-center gap-1.5 text-xs font-medium text-brand-700 hover:text-brand-900"
                  title={url}
                >
                  <span className="truncate">Abrir la carta de esta mesa</span>
                  <Icon name="arrow-right" size={14} className="shrink-0" />
                </a>
                <div className="mt-auto flex flex-wrap justify-center gap-2 pt-3">
                  <a
                    href={png}
                    className={buttonClasses("soft", "sm")}
                    aria-label={`Descargar el QR de ${table.label} en PNG para imprimir`}
                  >
                    <Icon name="printer" size={16} />
                    Descargar
                  </a>
                  <a
                    href={svg}
                    className={buttonClasses("ghost", "sm")}
                    aria-label={`Descargar el QR de ${table.label} en SVG, para imprimir en grande`}
                  >
                    SVG
                  </a>
                  <RotateTokenButton id={table.id} label={table.label} readOnly={readOnly} />
                  <DeleteTableButton id={table.id} label={table.label} readOnly={readOnly} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
