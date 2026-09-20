import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// La ruta privada del super admin NO se lista acá (anunciarla en robots.txt la expone); se
// protege con noindex en su layout y con la cabecera X-Robots-Tag de next.config.mjs.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/login", "/register", "/api"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
