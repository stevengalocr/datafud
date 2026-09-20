import type { Metadata } from "next";

// La página es "use client"; la metadata de noindex vive acá. La ruta no se anuncia en
// robots.txt ni en el sitemap, y next.config.mjs añade X-Robots-Tag: noindex, nofollow.
export const metadata: Metadata = {
  title: "Acceso",
  robots: { index: false, follow: false, nocache: true },
};

export default function OwnerAccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
