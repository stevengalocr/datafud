import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { loginReturnPath } from "@/lib/auth/redirect";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

// Refresca la sesión de Supabase en cada request y protege rutas privadas.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPrivate = path.startsWith("/admin") || path.startsWith("/dashboard");

  if (isPrivate && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Vuelve a la misma página (con sus filtros) después de entrar; el login la valida. La descarga
    // de un QR vuelve a Mesas y QR, no al archivo.
    url.search = "";
    url.searchParams.set("redirect", loginReturnPath(path, request.nextUrl.search));
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
