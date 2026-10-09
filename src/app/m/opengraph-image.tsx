import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

// Imagen de la tarjeta compartida de una mesa (AA-12). Sin ella, `/m/` heredaba la de la landing,
// con la oferta y el precio de DataFud debajo del nombre del local. Solo la marca: sin texto de
// venta ni precio (D-049). La tarjeta lleva el título del local desde `generateMetadata`.
//
// Sin E/S al importar ni al dibujar (Trampas en CLAUDE.md): sin `fonts`, con la fuente que trae
// next/og, y solo letras ASCII, así next/og no sale a buscar glifos.
export const alt = "DataFud";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          background: "linear-gradient(135deg, #0a1a13 0%, #112a20 55%, #1b4030 100%)",
          color: "#f4e8c8",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: 34,
            background: "#22503a",
            border: "4px solid #dcb65a",
            fontSize: 80,
          }}
        >
          D
        </div>
        <span style={{ fontSize: 96, letterSpacing: -2 }}>DataFud</span>
      </div>
    ),
    OG_SIZE
  );
}
