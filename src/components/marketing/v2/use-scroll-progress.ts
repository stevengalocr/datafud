"use client";

import { useEffect, useRef, type RefObject } from "react";

// Avance de scroll de un elemento, de 0 a 1, en un solo requestAnimationFrame por cuadro.
//  - "fijo": para una sección alta con contenido `sticky`: 0 cuando su borde de arriba toca el
//    de la ventana y 1 cuando su borde de abajo toca el de abajo.
//  - "paso": mientras el elemento cruza la ventana: 0 cuando asoma por abajo y 1 cuando se va
//    por arriba.
// No hace nada con movimiento reducido: el que llama decide qué mostrar en ese caso.
export type ScrollMode = "fijo" | "paso";

export function progressOf(rect: DOMRect, vh: number, mode: ScrollMode): number {
  const p =
    mode === "fijo"
      ? -rect.top / Math.max(1, rect.height - vh)
      : (vh - rect.top) / Math.max(1, vh + rect.height);
  return Math.min(1, Math.max(0, p));
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress: (p: number) => void,
  mode: ScrollMode = "paso",
) {
  // El callback cambia en cada render; el efecto lee siempre el último sin volver a suscribirse.
  const cb = useRef(onProgress);
  cb.current = onProgress;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    let visible = true;
    const update = () => {
      raf = 0;
      cb.current(progressOf(el.getBoundingClientRect(), window.innerHeight || 1, mode));
    };
    const onScroll = () => {
      if (visible && !raf) raf = requestAnimationFrame(update);
    };
    // Fuera de pantalla no se calcula nada.
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) onScroll();
    });
    io.observe(el);
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, mode]);
}
