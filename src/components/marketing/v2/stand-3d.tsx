"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion, useScrollProgress } from "@/components/marketing/v2/use-scroll-progress";

// Stand de mesa en 3D, hecho con CSS: un prisma con la cara del QR (el QR real de la demo,
// generado en el build, que decodifica a /q/demo26 como todo QR dibujado, D-051), la marca NFC
// dorada y la base dorada. Gira con el scroll y se puede arrastrar para verlo de todos lados
// (mouse, dedo o flechas del teclado). Es un modelo ilustrativo y lo dice. Con movimiento
// reducido queda quieto, de tres cuartos.

export function Stand3D({ qrSvg }: { qrSvg: string }) {
  const host = useRef<HTMLDivElement>(null);
  const cuerpo = useRef<HTMLDivElement>(null);
  const giro = useRef({ scroll: -34, arrastre: 0, actual: -34 });

  const pintar = () => {
    const c = cuerpo.current;
    if (!c) return;
    c.style.setProperty("--ry", `${giro.current.actual.toFixed(2)}deg`);
  };

  // Inercia: el ángulo actual persigue al objetivo (scroll + arrastre). El ciclo se detiene al
  // llegar y lo retoman el scroll, el arrastre o el teclado.
  const pedir = useRef<() => void>(() => {});
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const g = giro.current;
      const d = g.scroll + g.arrastre - g.actual;
      if (Math.abs(d) <= 0.05) return;
      g.actual += d * 0.12;
      pintar();
      raf = requestAnimationFrame(tick);
    };
    pedir.current = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    return () => {
      if (raf) cancelAnimationFrame(raf);
      pedir.current = () => {};
    };
  }, []);

  useScrollProgress(host, (p) => {
    giro.current.scroll = -58 + p * 96;
    pedir.current();
  });

  // Arrastrar para girar.
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    // Con movimiento reducido el stand no gira: deja de ser enfocable y no promete nada.
    if (prefersReducedMotion()) {
      el.removeAttribute("tabindex");
      return;
    }
    let x0 = 0;
    let base = 0;
    let activo = false;
    const bajar = (e: PointerEvent) => {
      activo = true;
      x0 = e.clientX;
      base = giro.current.arrastre;
      el.setPointerCapture(e.pointerId);
      el.dataset.arrastrando = "si";
    };
    const mover = (e: PointerEvent) => {
      if (!activo) return;
      giro.current.arrastre = base + (e.clientX - x0) * 0.6;
      pedir.current();
    };
    const soltar = () => {
      activo = false;
      el.dataset.arrastrando = "no";
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") giro.current.arrastre -= 20;
      else if (e.key === "ArrowRight") giro.current.arrastre += 20;
      else return;
      e.preventDefault();
      pedir.current();
    };
    el.addEventListener("pointerdown", bajar);
    el.addEventListener("pointermove", mover);
    el.addEventListener("pointerup", soltar);
    el.addEventListener("pointercancel", soltar);
    el.addEventListener("keydown", tecla);
    return () => {
      el.removeEventListener("pointerdown", bajar);
      el.removeEventListener("pointermove", mover);
      el.removeEventListener("pointerup", soltar);
      el.removeEventListener("pointercancel", soltar);
      el.removeEventListener("keydown", tecla);
    };
  }, []);

  return (
    <div
      ref={host}
      className="stand3d"
      role="group"
      aria-roledescription="modelo 3D"
      tabIndex={0}
      aria-label="Modelo ilustrativo de un stand de mesa DataFud: cuerpo verde con base dorada, código QR y marca NFC."
      data-visor
    >
      <div className="st-sombra" />
      <div ref={cuerpo} className="st-cuerpo">
        <div className="st-base" />
        <div className="st-cara st-frente">
          <div className="st-panel" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <svg className="st-nfc" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8.5 7.5a6 6 0 0 1 0 9M12 5a9.5 9.5 0 0 1 0 14M15.5 2.5a13 13 0 0 1 0 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        {/* Atrás va liso: el stand real lleva el logo del local, no el nuestro. */}
        <div className="st-cara st-atras" />
        <div className="st-lado st-izq" />
        <div className="st-lado st-der" />
      </div>
    </div>
  );
}
