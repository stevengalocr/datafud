import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseEnv } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";

// Refresca la sesión de Supabase y protege los paneles. Sin variables de Supabase
// (landing primero) no hace nada. La landing, las cartas y los QR no pasan por aquí.
export async function middleware(request: NextRequest) {
  if (!hasSupabaseEnv()) return NextResponse.next();
  return await updateSession(request);
}

export const config = {
  // Solo las rutas con sesión: paneles, login y la ruta privada del super admin.
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/acceso-galodev-9f3a"],
};
