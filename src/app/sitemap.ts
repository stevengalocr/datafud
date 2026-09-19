import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { LEGAL_UPDATED_ISO } from "@/lib/seo";

// Solo rutas públicas y estáticas. Las privadas se excluyen en robots.ts.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/preview`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/preview/cliente`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/terminos`, lastModified: new Date(LEGAL_UPDATED_ISO), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/privacidad`, lastModified: new Date(LEGAL_UPDATED_ISO), changeFrequency: "yearly", priority: 0.3 },
  ];
}
