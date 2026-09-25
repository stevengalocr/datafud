import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  // Rutas de acceso: nunca indexadas (cubre también la redirección 307 de /register).
  async headers() {
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      { source: "/login", headers: noindex },
      { source: "/register", headers: noindex },
      { source: "/acceso-galodev-9f3a", headers: noindex },
    ];
  },
};

export default nextConfig;
