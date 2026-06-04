import QRCode from "qrcode";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardBody } from "@/components/ui/card";
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
        title="Mesas / QR"
        description="Cada mesa tiene un QR único. Imprímelo y colócalo en la mesa."
        action={<AddTableForm />}
      />

      {withQr.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center text-sm text-slate-400">
            Aún no tienes mesas. Agrega la primera arriba.
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {withQr.map(({ table, url, qr }) => (
            <Card key={table.id}>
              <CardBody className="flex flex-col items-center text-center">
                <p className="font-semibold text-slate-900">{table.label}</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qr}
                  alt={`QR ${table.label}`}
                  className="my-3 h-40 w-40 rounded-lg border border-slate-100"
                />
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="max-w-full truncate text-xs text-brand-600 hover:underline"
                >
                  {url}
                </a>
                <div className="mt-3 flex gap-2">
                  <a
                    href={qr}
                    download={`qr-${table.label}.png`}
                    className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                  >
                    Descargar
                  </a>
                  <DeleteTableButton id={table.id} />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
