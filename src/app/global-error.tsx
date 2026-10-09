"use client";

import Link from "next/link";
import { Young_Serif, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

// Las mismas fuentes que el layout raíz (que esta página reemplaza). `next/font` las resuelve al
// compilar: no hay E/S al importar el módulo.
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

// Último recurso: un error en un layout (el del panel incluido) no lo atrapa ningún `error.tsx`
// de adentro. Sin esto salía la página genérica de Next, en inglés. Reemplaza al layout raíz,
// así que trae su propio <html> y no puede depender de nada que cargue el layout.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-cream-50 font-sans text-brand-950">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">DataFud</p>
          <h1 className="mt-3 font-display text-[2rem] leading-tight text-brand-900">
            Esta página no cargó
          </h1>
          <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-stone-700">
            Algo falló de nuestro lado. Probá de nuevo en un momento; si sigue igual, escribinos por
            WhatsApp con el código de abajo.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              // El error casi siempre viene del servidor: recargar vuelve a pedirlo; `reset()` solo
              // repinta del lado del navegador.
              onClick={() => (error.digest ? window.location.reload() : reset())}
              className="inline-flex h-11 cursor-pointer items-center rounded-lg bg-brand-600 px-5 text-sm font-medium text-cream-50 hov:bg-brand-700"
            >
              Intentar de nuevo
            </button>
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-lg border border-stone-300 bg-white px-5 text-sm font-medium text-brand-900 hov:bg-cream-100"
            >
              Ir al inicio
            </Link>
          </div>
          {error.digest && (
            <p className="mt-6 text-xs text-stone-600">
              Código:{" "}
              <code className="select-all break-all rounded bg-cream-100 px-1.5 py-0.5 font-mono text-brand-900">
                {error.digest}
              </code>
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
