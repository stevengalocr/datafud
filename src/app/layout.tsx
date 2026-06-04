import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
