import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fija la raíz del proyecto (hay otro lockfile en la carpeta de usuario).
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
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
