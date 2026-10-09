import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== "production";

// Política de contenido de todo el sitio, armada con lo que las páginas cargan hoy:
// - scripts propios y los que Next escribe en línea (sin nonce, por eso 'unsafe-inline');
// - Cloudflare Turnstile (script e iframe) en el formulario de contacto, si está activo;
// - Meta Pixel (script, beacon y pixel) solo si existe NEXT_PUBLIC_META_PIXEL_ID;
// - Vercel Analytics se sirve desde el mismo dominio (/_vercel/insights);
// - Supabase para datos y archivos; las fotos de los platillos pueden venir de cualquier https
//   (el local pega la dirección) y la vista previa de una subida usa data: y blob:;
// - next/font sirve las fuentes desde el mismo dominio.
// Va como Report-Only: el navegador avisa en la consola lo que bloquearía, sin bloquear nada,
// hasta revisarla en producción. Lo que sí se aplica ya va en `enforcedCsp` y X-Frame-Options.
const cspDirectives = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    ...(isDev ? ["'unsafe-eval'"] : []),
    "https://challenges.cloudflare.com",
    "https://connect.facebook.net",
  ],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "blob:", "https:"],
  "font-src": ["'self'", "data:"],
  "connect-src": [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://challenges.cloudflare.com",
    "https://connect.facebook.net",
    "https://www.facebook.com",
    ...(isDev ? ["ws:"] : []),
  ],
  "frame-src": ["https://challenges.cloudflare.com"],
  "worker-src": ["'self'", "blob:"],
  "manifest-src": ["'self'"],
  "media-src": ["'self'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  // frame-ancestors no vale en Report-Only: se aplica en `enforcedCsp`.
};
const toCsp = (d) => Object.entries(d).map(([k, v]) => `${k} ${v.join(" ")}`).join("; ");
// Lo que se aplica desde ya: nadie mete el sitio en un iframe, sin plugins y sin <base> ajeno.
const enforcedCsp = toCsp({
  "frame-ancestors": ["'none'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
});

const securityHeaders = [
  { key: "Content-Security-Policy", value: enforcedCsp },
  { key: "Content-Security-Policy-Report-Only", value: toCsp(cspDirectives) },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  // HSTS lo pone Vercel (max-age de dos años): no se repite aquí.
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fija la raíz del proyecto (hay otro lockfile en la carpeta de usuario).
  outputFileTracingRoot: __dirname,
  // Solo Supabase Storage (D-054): las fotos y logos que suba un local cuando se encienda el
  // backend. Con "**", cualquiera podía usar /_next/image como proxy de imágenes ajenas y gastar
  // la cuota de optimización. La demo y las cartas sirven sus fotos desde public/.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  // Encabezados de seguridad (AS-3) y rutas que nunca se indexan.
  async headers() {
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/login", headers: noindex },
      { source: "/register", headers: noindex },
      { source: "/acceso-galodev-9f3a", headers: noindex },
      // La carta de cada mesa y el aviso de código dado de baja: enlaces de QR, no páginas para buscar.
      { source: "/m/:path*", headers: noindex },
      { source: "/q/no-disponible", headers: noindex },
    ];
  },
};

export default nextConfig;
