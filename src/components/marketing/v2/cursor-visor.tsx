"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/components/marketing/v2/use-scroll-progress";

// Visor de escaneo: cuatro esquinas que siguen al puntero con inercia y que, sobre un botón o
// un enlace, lo enmarcan como si lo escanearan. Es la firma de la landing: DataFud es un QR que
// se escanea. Decorativo (aria-hidden, pointer-events: none): el cursor del sistema sigue
// visible. Solo con mouse y sin movimiento reducido; en táctil no existe. Solo transform.

const OBJETIVOS = "a, button, summary, [data-visor]";
const TAM = 30; // lado del visor libre
const MARGEN = 7; // aire alrededor de lo que enmarca

export function CursorVisor() {
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = raiz.current;
    if (!host) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches || prefersReducedMotion()) return;
    const esquinas = Array.from(host.children) as HTMLElement[];

    // Caja actual y caja objetivo: x, y (arriba a la izquierda), ancho y alto.
    const cur = { x: -100, y: -100, w: TAM, h: TAM };
    const obj = { ...cur };
    let px = -100;
    let py = -100;
    let sobre: Element | null = null;
    let raf = 0;
    let visible = false;

    const apuntar = () => {
      if (sobre && sobre.isConnected) {
        const r = sobre.getBoundingClientRect();
        obj.x = r.left - MARGEN;
        obj.y = r.top - MARGEN;
        obj.w = r.width + MARGEN * 2;
        obj.h = r.height + MARGEN * 2;
      } else {
        obj.x = px - TAM / 2;
        obj.y = py - TAM / 2;
        obj.w = TAM;
        obj.h = TAM;
      }
    };

    const pintar = () => {
      raf = 0;
      apuntar();
      let quieto = true;
      for (const k of ["x", "y", "w", "h"] as const) {
        const d = obj[k] - cur[k];
        if (Math.abs(d) > 0.3) quieto = false;
        cur[k] += d * 0.22;
      }
      const { x, y, w, h } = cur;
      const s = 10; // lado de cada esquina
      esquinas[0].style.transform = `translate3d(${x}px, ${y}px, 0)`;
      esquinas[1].style.transform = `translate3d(${x + w - s}px, ${y}px, 0)`;
      esquinas[2].style.transform = `translate3d(${x}px, ${y + h - s}px, 0)`;
      esquinas[3].style.transform = `translate3d(${x + w - s}px, ${y + h - s}px, 0)`;
      if (!quieto) raf = requestAnimationFrame(pintar);
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(pintar);
    };

    const mover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      const t = e.target instanceof Element ? e.target : null;
      // Sobre un campo de texto el visor se aparta: ahí se escribe, no se escanea.
      const campo = t?.closest("input, textarea, select");
      sobre = campo ? null : t?.closest(OBJETIVOS) ?? null;
      host.dataset.sobre = sobre ? "si" : "no";
      if (!visible) {
        visible = true;
        // La primera vez aparece donde está el puntero, sin viajar desde la esquina.
        apuntar();
        Object.assign(cur, obj);
        host.dataset.visible = "si";
      }
      host.dataset.oculto = campo ? "si" : "no";
      pedir();
    };
    const salir = () => {
      visible = false;
      host.dataset.visible = "no";
    };

    window.addEventListener("pointermove", mover, { passive: true });
    window.addEventListener("scroll", pedir, { passive: true });
    document.documentElement.addEventListener("pointerleave", salir);
    return () => {
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("scroll", pedir);
      document.documentElement.removeEventListener("pointerleave", salir);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={raiz} className="cursor-visor" aria-hidden="true" data-visible="no">
      <span className="cv-tl" />
      <span className="cv-tr" />
      <span className="cv-bl" />
      <span className="cv-br" />
    </div>
  );
}
