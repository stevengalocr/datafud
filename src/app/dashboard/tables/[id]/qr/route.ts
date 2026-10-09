import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { QR_PRINT, qrFileBase, tableMenuUrl } from "../../qr";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Si algo falla no se manda un archivo de texto con el error: se vuelve a la página (o al login),
// que lo dice. Los enlaces no llevan `download` por eso: el nombre del archivo lo da
// `content-disposition` solo cuando hay QR.
const volver = (request: Request, path: string) =>
  new Response(null, { status: 303, headers: { location: new URL(path, request.url).toString(), "cache-control": "no-store" } });
const aLaPagina = (request: Request) => volver(request, "/dashboard/tables?qr=error");

/**
 * Descarga del QR de una mesa para imprimir (`?format=png` o `?format=svg`). Con la sesión de
 * quien la pide: el RLS de `tables` solo deja ver las mesas del propio local. Sin sesión (venció),
 * va al login y de ahí vuelve a Mesas y QR.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id) || !hasSupabaseEnv()) return aLaPagina(request);
  const format = new URL(request.url).searchParams.get("format") === "svg" ? "svg" : "png";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return volver(request, `/login?redirect=${encodeURIComponent("/dashboard/tables")}`);

  const { data, error } = await supabase
    .from("tables")
    .select("label, qr_token, tenant:tenants(slug)")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[datafud] qr de mesa:", error.code ?? "-", error.message ?? "");
    return aLaPagina(request);
  }
  const rel = data?.tenant as { slug?: string } | { slug?: string }[] | null | undefined;
  const slug = Array.isArray(rel) ? rel[0]?.slug : rel?.slug;
  if (!data || !slug) return aLaPagina(request);

  const url = tableMenuUrl(slug, data.qr_token as string);
  const file = `${qrFileBase(data.label as string)}.${format}`;
  const headers = {
    "content-disposition": `attachment; filename="${file}"`,
    "cache-control": "private, no-store",
  };
  if (format === "svg") {
    const svg = await QRCode.toString(url, { type: "svg", ...QR_PRINT });
    return new Response(svg, { headers: { ...headers, "content-type": "image/svg+xml; charset=utf-8" } });
  }
  const png = await QRCode.toBuffer(url, { width: 1024, ...QR_PRINT });
  return new Response(new Uint8Array(png), { headers: { ...headers, "content-type": "image/png" } });
}
