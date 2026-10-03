"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const CADA_MS = 15_000;

// Vuelve a pedir el tablero cada 15 s mientras la pestaña está a la vista (no es tiempo real:
// es un refresco periódico, como dice el plan). Se pausa con la pestaña oculta y refresca al volver.
export function AutoRefresh() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [last, setLast] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      start(() => router.refresh());
      setLast(Date.now());
    };
    const id = window.setInterval(refresh, CADA_MS);
    const tick = window.setInterval(() => setNow(Date.now()), 1_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  const secs = Math.max(0, Math.round((now - last) / 1000));
  return (
    <p className="flex items-center gap-2 text-xs text-stone-600" aria-live="off">
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${pending ? "bg-accent-500" : "bg-brand-500"}`}
      />
      {pending ? "Actualizando…" : secs < 3 ? "Actualizado recién" : `Actualizado hace ${secs} s`}
      <span className="text-stone-500">· se actualiza solo cada 15 s</span>
    </p>
  );
}
