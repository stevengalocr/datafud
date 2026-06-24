"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

// Desplaza su contenido en Y según la posición de scroll (parallax sutil).
// strength: px máximos de desplazamiento. Respeta reduced-motion.
export function Parallax({
  children,
  strength = 40,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // -1 (debajo) → 1 (arriba), 0 al centro del viewport
      const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
      el.style.setProperty("--parallax", `${(-progress * strength).toFixed(1)}px`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <div ref={ref} className={cn("parallax", className)}>
      {children}
    </div>
  );
}
