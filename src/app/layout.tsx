import type { Metadata } from "next";
import { Young_Serif, Hanken_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SITE } from "@/lib/site";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

const display = Young_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE_TITLE,
    template: "%s · DataFud",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE.name,
  keywords: [
    "menú digital",
    "carta digital QR",
    "menú QR restaurante",
    "tarjeta NFC restaurante",
    "stand QR impreso en 3D",
    "pedidos desde la mesa",
    "Costa Rica",
    "menú digital para sodas",
  ],
  authors: [{ name: SITE.maker, url: SITE.url }],
  creator: SITE.maker,
  openGraph: {
    type: "website",
    locale: "es_CR",
    url: SITE.url,
    siteName: SITE.name,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icono-main.png", apple: "/icono-main.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <head>
        {/* Sin JS: el contenido que se revela al hacer scroll y las respuestas de la FAQ quedan visibles. */}
        <noscript>
          <style>{`.reveal-up{opacity:1!important;transform:none!important}[data-faq-panel]{display:block!important}`}</style>
        </noscript>
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
