import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { PRICING } from "@/lib/constants";

// Imagen Open Graph de marca (1200×630) generada en el build. Sin fuentes remotas: el
// build no depende de la red. Colores de docs/BRAND.md.
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// "₡" (D-052). La fuente por defecto de next/og no lo trae y, si falta un glifo, next/og intenta
// bajarlo de Google Fonts en el build. Se le pasa la misma subfuente de Inter que usa la web, en
// TTF (next/og no lee woff2). Pasar `fonts` reemplaza la fuente por defecto, así que también se
// pasa esa, desde el paquete de next: si una versión de next la mueve, el build falla acá.
const OG_FONTS = [
  {
    name: "Noto Sans",
    data: readFileSync(path.join(process.cwd(), "node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf")),
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    name: "DataFudColon",
    data: readFileSync(path.join(process.cwd(), "src/lib/og-fonts/datafud-colon-400.ttf")),
    weight: 400 as const,
    style: "normal" as const,
  },
];

export function ogImage({ title, subtitle, kicker = "datafud.com" }: { title: string; subtitle: string; kicker?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #0a1a13 0%, #112a20 55%, #1b4030 100%)",
          color: "#fbfaf6",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#22503a",
              border: "2px solid #dcb65a",
              fontSize: 36,
              color: "#f4e8c8",
            }}
          >
            D
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 30, letterSpacing: -0.5 }}>DataFud</span>
            <span style={{ fontSize: 16, letterSpacing: 4, color: "#dcb65a", fontFamily: "Arial, Helvetica, sans-serif" }}>
              {kicker.toUpperCase()}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 980 }}>
          <div style={{ fontSize: 72, lineHeight: 1.05, letterSpacing: -1.5, color: "#f4e8c8" }}>{title}</div>
          <div style={{ fontSize: 28, lineHeight: 1.35, color: "rgba(251,250,246,0.82)", fontFamily: "Arial, Helvetica, sans-serif" }}>
            {subtitle}
          </div>
        </div>
        <div style={{ display: "flex", gap: 36, fontSize: 18, letterSpacing: 3, color: "#dcb65a", fontFamily: "Arial, Helvetica, sans-serif" }}>
          <span>{`CARTA LISTA EN ${PRICING.delivery.menuHours} HORAS`}</span>
          <span>·</span>
          <span>{`SISTEMA COMPLETO EN ${PRICING.delivery.fullSystemDays} DÍAS`}</span>
          <span>·</span>
          <span>HECHO EN COSTA RICA</span>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: OG_FONTS }
  );
}
