import type { Metadata } from "next";
import { Young_Serif, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

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
  title: "DataFud — Menú digital para restaurantes y sodas",
  description:
    "QR Menus. Orders. Analytics. Crea tu menú digital, recibe órdenes por QR y controla tu negocio en tiempo real. Multi-idioma, multi-moneda y 100% personalizable.",
  icons: { icon: "/icono-main.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
