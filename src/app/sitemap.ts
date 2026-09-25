import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { LEGAL_UPDATED_ISO } from "@/lib/seo";
import { CARTAS } from "@/content/cartas";

// Solo rutas públicas y estáticas. Las privadas se excluyen en robots.ts.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // Cartas publicadas (D-040): solo las que el local aceptó que salgan en Google. Las demás
  // llevan noindex en su metadata y tampoco entran acá.
  const cartas: MetadataRoute.Sitemap = CARTAS.filter((c) => c.indexable).map((c) => ({
    url: `${SITE.url}/c/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  return [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/preview`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/preview/carta`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/preview/cliente`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/menu-digital-costa-rica`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/menu-digital-para-sodas`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/menu-qr-restaurantes-turisticos`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/terminos`, lastModified: new Date(LEGAL_UPDATED_ISO), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/privacidad`, lastModified: new Date(LEGAL_UPDATED_ISO), changeFrequency: "yearly", priority: 0.3 },
    ...cartas,
  ];
}
