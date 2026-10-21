"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { useScrollProgress } from "@/components/marketing/v2/use-scroll-progress";

// Gira su contenido en 3D mientras cruza la ventana: entra de perfil y termina casi de frente,
// como un teléfono que se acerca a la mano. Escribe --gy y --gx; .giro-3d arma el transform.
// Sin JS o con movimiento reducido queda de frente (los valores por defecto son 0).
export function Giro3D({
  children,
  className,
  desdeY = -22,
  hastaY = 8,
  desdeX = 8,
  hastaX = -3,
}: {
  children: React.ReactNode;
  className?: string;
  desdeY?: number;
  hastaY?: number;
  desdeX?: number;
  hastaX?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(
    ref,
    (p) => {
      const el = ref.current;
      if (!el) return;
      const t = Math.min(1, p / 0.6);
      el.style.setProperty("--gy", `${(desdeY + (hastaY - desdeY) * t).toFixed(2)}deg`);
      el.style.setProperty("--gx", `${(desdeX + (hastaX - desdeX) * t).toFixed(2)}deg`);
    },
    "paso",
  );
  return (
    <div ref={ref} className={cn("giro-3d", className)}>
      {children}
    </div>
  );
}
