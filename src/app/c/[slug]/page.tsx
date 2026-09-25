import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MenuClient } from "@/app/m/[tenant]/[table]/menu-client";
import { CARTAS, cartaBySlug } from "@/content/cartas";

// Motor de la Carta sin backend (D-040). La carta vive en `src/content/cartas/` y se publica
// estática: nada de Supabase. Solo existen los slugs de CARTAS; cualquier otro es 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return CARTAS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const carta = cartaBySlug(slug);
  if (!carta) return {};
  const nombre = carta.menu.settings.restaurant_name;
  return {
    title: `Carta de ${nombre}`,
    description: `Carta digital de ${nombre}. Mirá los platillos, las fotos y los precios desde el teléfono.`,
    alternates: { canonical: `/c/${carta.slug}` },
    robots: carta.indexable ? undefined : { index: false, follow: false },
  };
}

export default async function CartaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const carta = cartaBySlug(slug);
  if (!carta) notFound();

  return <MenuClient data={carta.menu} slug={carta.slug} token="" ordering={false} tagline={carta.tagline} />;
}
