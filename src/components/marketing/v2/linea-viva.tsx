"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { useScrollProgress } from "@/components/marketing/v2/use-scroll-progress";

// Línea de tiempo que se llena con el scroll: escribe --fill (0 a 1) en el contenedor y marca
// data-activo en cada <li> que la línea ya alcanzó. El HTML del servidor trae todo encendido
// (sin JS o con movimiento reducido se ve completa); al hidratar se ajusta al scroll real.
export function LineaViva({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useScrollProgress(
    ref,
    (p) => {
      const el = ref.current;
      if (!el) return;
      // La línea arranca cuando la sección ya se ve y termina antes de irse.
      const fill = Math.min(1, Math.max(0, (p - 0.18) / 0.42));
      el.style.setProperty("--fill", fill.toFixed(3));
      const pasos = el.querySelectorAll("li");
      pasos.forEach((li, i) => li.toggleAttribute("data-activo", fill >= i / Math.max(1, pasos.length - 1) - 0.02));
    },
    "paso",
  );

  return (
    <div ref={ref} className={cn("linea-viva", className)} style={{ "--fill": 1 } as React.CSSProperties}>
      {children}
    </div>
  );
}
