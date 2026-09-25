import { NextResponse } from "next/server";
import { qrDestination } from "@/content/qr";

// Redirección de los códigos impresos (D-014). 307 y no 308: el destino de un código puede
// cambiar (por ejemplo cuando el local pasa de /c a /m), así que no se cachea como permanente.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const destination = qrDestination(code) ?? "/?qr=desconocido";
  return NextResponse.redirect(new URL(destination, request.url), 307);
}
