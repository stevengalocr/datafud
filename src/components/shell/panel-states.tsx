"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

// Error de una página de los paneles (lo usan admin/error.tsx y dashboard/error.tsx). Se queda
// dentro del shell, así que el menú sigue a mano. Muestra el `digest` del error: es lo que
// permite encontrarlo en los registros de Vercel sin enseñarle detalles internos a nadie.
export function PanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  // `reset()` solo vuelve a pintar del lado del navegador: si el error vino del servidor (lo
  // normal acá), sin `router.refresh()` el reintento repite el mismo resultado sin preguntar.
  const retry = () =>
    start(() => {
      router.refresh();
      reset();
    });

  return (
    <div role="alert" className="rounded-xl border border-stone-200 bg-white p-6 shadow-panel-sm sm:p-8">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-700">
        <Icon name="x" size={20} />
      </span>
      <h1 className="mt-4 font-display text-[1.75rem] leading-tight text-brand-900">
        Esta página no cargó
      </h1>
      <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-stone-600">
        Algo falló del lado del servidor al traer los datos. Probá de nuevo; si sigue igual,
        el código de abajo sirve para encontrar el error en los registros.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button onClick={retry} pending={pending} pendingText="Cargando…">
          Intentar de nuevo
        </Button>
        {error.digest && (
          <p className="text-xs text-stone-600">
            Código:{" "}
            <code className="select-all break-all rounded bg-cream-100 px-1.5 py-0.5 font-mono text-brand-900">
              {error.digest}
            </code>
          </p>
        )}
      </div>
    </div>
  );
}
