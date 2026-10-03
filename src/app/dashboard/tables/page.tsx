import QRCode from "qrcode";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState } from "@/components/shell/empty-state";
import { Card } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { AddTableForm, DeleteTableButton } from "./table-actions";
import type { RestaurantTable } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function TablesPage() {
  const { tenant } = await getTenantContext();
  const supabase = await createClient();

  const { data } = await supabase
    .from("tables")
    .select("*")
    .order("created_at", { ascending: true });
  const tables = (data as RestaurantTable[]) ?? [];

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const withQr = await Promise.all(
    tables.map(async (table) => {
      const url = `${siteUrl}/m/${tenant.slug}/${table.qr_token}`;
      const qr = await QRCode.toDataURL(url, { width: 240, margin: 1 });
      return { table, url, qr };
    })
  );

  return (
    <div>
      <PageHeader
        title="Mesas y QR"
        description="Cada mesa tiene su propio QR. Descargalo, imprimilo y ponelo en la mesa: así sabemos de qué mesa viene cada orden."
        action={<AddTableForm />}
      />

      {withQr.length === 0 ? (
        <EmptyState icon="qr" title="Todavía no hay mesas">
          Agregá la primera con el nombre que usan en el local (Mesa 1, Barra, Terraza 2). Al
          guardarla aparece su QR listo para descargar.
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {withQr.map(({ table, url, qr }) => (
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
                    href={qr}
                    download={`qr-${table.label}.png`}
                    className={buttonClasses("soft", "sm")}
                  >
                    <Icon name="printer" size={16} />
                    Descargar
                  </a>
                  <DeleteTableButton id={table.id} label={table.label} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
