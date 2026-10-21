"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils/cn";

// Inclinación 3D con una luz que sigue al mouse. Solo con mouse: en táctil la pieza queda plana
// (el toque no deja un estado a medio camino). Escribe variables CSS (--rx, --ry, --lx, --ly) y la
// clase .tilt las convierte en transform; nada de re-render por cuadro. Con movimiento reducido,
// .tilt no aplica transform (globals.css).
export function Tilt({
  children,
  className,
  max = 6,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  as?: "div" | "article" | "li";
}) {
  const ref = useRef<HTMLElement>(null);

  const mover = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${((x - 0.5) * max * 2).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${((0.5 - y) * max * 2).toFixed(2)}deg`);
    el.style.setProperty("--lx", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--ly", `${(y * 100).toFixed(1)}%`);
    el.dataset.tilt = "on";
  };
  const soltar = () => {
    const el = ref.current;
    if (!el) return;
    el.style.removeProperty("--rx");
    el.style.removeProperty("--ry");
    el.dataset.tilt = "off";
  };

  return (
    <Tag
      ref={ref as never}
      onPointerMove={mover}
      onPointerLeave={soltar}
      className={cn("tilt", className)}
    >
      {children}
      <span className="tilt-luz" aria-hidden="true" />
    </Tag>
  );
}
