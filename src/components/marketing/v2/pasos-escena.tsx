"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { prefersReducedMotion, progressOf } from "@/components/marketing/v2/use-scroll-progress";

// Escena por pasos: escribe data-paso (0…pasos-1) en el contenedor y data-activo en cada
// elemento [data-paso-n] que coincide. En escritorio el paso lo decide el scroll (la escena es
// sticky dentro de una pista alta); en teléfono y tableta se reproduce sola una vez cuando se ve y
// queda en el último paso. Sin JS o con movimiento reducido no hay data-paso: el CSS muestra el estado final.
export function PasosEscena({
  pasos,
  children,
  className,
  intervalo = 2600,
}: {
  pasos: number;
  children: React.ReactNode;
  className?: string;
  intervalo?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const marcar = (n: number) => {
      if (el.dataset.paso === String(n)) return;
      el.dataset.paso = String(n);
      el.querySelectorAll<HTMLElement>("[data-paso-n]").forEach((x) =>
        x.toggleAttribute("data-activo", x.dataset.pasoN === String(n)),
      );
    };

    const ancho = window.matchMedia("(min-width: 1024px)");
    let quitar = () => {};

    const armar = () => {
      quitar();
      if (ancho.matches) {
        // Escritorio: el scroll manda.
        let raf = 0;
        const update = () => {
          raf = 0;
          const p = progressOf(el.getBoundingClientRect(), window.innerHeight || 1, "fijo");
          marcar(Math.min(pasos - 1, Math.floor(p * pasos * 0.999)));
        };
        const onScroll = () => {
          if (!raf) raf = requestAnimationFrame(update);
        };
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        quitar = () => {
          window.removeEventListener("scroll", onScroll);
          if (raf) cancelAnimationFrame(raf);
        };
      } else {
        // Teléfono: se reproduce solo, y solo mientras se ve.
        let n = 0;
        let timer = 0;
        marcar(0);
        const io = new IntersectionObserver(
          ([e]) => {
            window.clearInterval(timer);
            if (e.isIntersecting) {
              timer = window.setInterval(() => {
                n += 1;
                marcar(n);
                // Una sola vuelta: queda en el último paso (el estado completo) y no se mueve más.
                if (n >= pasos - 1) {
                  window.clearInterval(timer);
                  io.disconnect();
                }
              }, intervalo);
            }
          },
          { threshold: 0.35 },
        );
        io.observe(el);
        quitar = () => {
          io.disconnect();
          window.clearInterval(timer);
        };
      }
    };
    armar();
    ancho.addEventListener("change", armar);
    return () => {
      ancho.removeEventListener("change", armar);
      quitar();
    };
  }, [pasos, intervalo]);

  return (
    <div ref={ref} className={cn("pasos-escena", className)}>
      {children}
    </div>
  );
}
