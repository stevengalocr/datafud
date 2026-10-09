import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { MenuClient, type MenuPayload } from "./menu-client";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Una sola llamada a `get_menu` por visita: la comparten los metadatos y la página.
// `null` = no hay carta para ese slug y esa mesa (local suspendido, mesa borrada o inactiva,
// enlace mal copiado): eso es el 404 de la carta. Un fallo de la base no es un 404: se registra
// solo el código y se lanza un error genérico que pinta `error.tsx`, sin texto de Postgres (S12).
const loadMenu = cache(async (slug: string, token: string): Promise<MenuPayload | null> => {
  if (!slug || slug.length > 60 || !UUID.test(token) || !hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_menu", { p_slug: slug, p_token: token });
  if (error) {
    console.error("[datafud] get_menu:", error.code ?? "sin-id");
    throw new Error("menu-unavailable");
  }
  return (data as MenuPayload | null) ?? null;
});

// La carta de una mesa nunca se indexa: la URL lleva el token de la mesa (AS-10). El título es
// el del local, para que la pestaña y el enlace compartido digan dónde está el comensal (AA-12).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string; table: string }>;
}): Promise<Metadata> {
  const robots = { index: false, follow: false } as const;
  const { tenant: slug, table: token } = await params;
  let name: string | null = null;
  try {
    name = (await loadMenu(slug, token))?.settings.restaurant_name ?? null;
  } catch {
    // La página va a mostrar el error; los metadatos no deben romper antes.
  }
  if (!name) return { title: "Carta", robots };
  return {
    title: { absolute: name },
    description: `Carta digital de ${name}.`,
    robots,
    openGraph: { title: name, description: `Carta digital de ${name}.`, siteName: name },
    twitter: { title: name, description: `Carta digital de ${name}.` },
  };
}

export default async function CustomerMenuPage({
  params,
}: {
  params: Promise<{ tenant: string; table: string }>;
}) {
  const { tenant: slug, table: token } = await params;
  const data = await loadMenu(slug, token);
  if (!data) notFound();

  // Plan sin pedidos desde la mesa (AA-9): la carta se muestra sin carrito; place_order también
  // los rechaza.
  return <MenuClient data={data} slug={slug} token={token} ordering={data.ordering !== false} />;
}
