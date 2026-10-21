"use client";

import { useEffect, useRef } from "react";
import { useScrollProgress } from "@/components/marketing/v2/use-scroll-progress";

// Portada que escanea. Al bajar, la cámara se acerca al stand de la mesa (video que sigue al
// scroll), el visor encuadra el QR y sube el teléfono con la carta de la demo: el recorrido del
// comensal en una sola escena. El texto (h1, bajada, CTA) llega como children y viene visible en
// el HTML del servidor; todo lo demás es decorativo.
//
// Sin JS o con movimiento reducido: la escena es la tarjeta quieta con el primer cuadro (que es
// el render de siempre), sin sección larga ni teléfono (globals.css, .he-*). El video pesa: se
// pide con la primera interacción, nunca en la carga, y en teléfono va la versión vertical.

// Panel del QR en el último cuadro del video, en fracciones del cuadro (medido sobre el
// original de 1764×1176; la versión vertical es un recorte de 784 px desde x = 560).
const PANEL = { x0: 0.397, x1: 0.637, y0: 0.335, y1: 0.663 };
const RECORTE_MOVIL = { x: 560 / 1764, w: 784 / 1764 };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const tramo = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const suave = (t: number) => t * t * (3 - 2 * t);
// La escena larga existe solo si el navegador la arma (globals.css usa la misma consulta); en un
// navegador sin `scripting` la portada queda quieta y este componente no toca nada.
const ESCENA_VIVA = "(scripting: enabled) and (prefers-reduced-motion: no-preference)";
const viva = () => typeof window !== "undefined" && window.matchMedia(ESCENA_VIVA).matches;

export function HeroEscaneo({ children, telefono }: { children: React.ReactNode; telefono: React.ReactNode }) {
  const pista = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const visor = useRef<HTMLDivElement>(null);
  const velo = useRef<HTMLDivElement>(null);
  const tel = useRef<HTMLDivElement>(null);
  const pista0 = useRef<HTMLDivElement>(null);
  const texto = useRef<HTMLDivElement>(null);
  const etiqueta = useRef<HTMLSpanElement>(null);
  const objetivo = useRef(0);
  // Qué versión del video se cargó: el visor se ubica según esa, aunque después cambie el ancho.
  const variante = useRef<"movil" | "escritorio" | null>(null);
  // Arranca el ciclo que acerca el video a su objetivo; se detiene solo al llegar.
  const correr = useRef<() => void>(() => {});

  // El video se pide con la primera interacción.
  useEffect(() => {
    if (!viva()) return;
    const v = video.current;
    if (!v) return;
    let cargado = false;
    const eventos = ["scroll", "pointermove", "touchstart", "keydown"] as const;
    const quitar = () => eventos.forEach((e) => window.removeEventListener(e, cargar));
    function cargar() {
      if (cargado || !v) return;
      cargado = true;
      quitar();
      const movil = window.matchMedia("(max-width: 1023px)").matches;
      variante.current = movil ? "movil" : "escritorio";
      v.src = movil ? "/portada/escaneo-movil.mp4" : "/portada/escaneo.mp4";
      v.load();
      v.addEventListener(
        "loadeddata",
        () => {
          v.setAttribute("data-listo", "");
          ubicarVisor();
          correr.current();
        },
        { once: true },
      );
    }
    eventos.forEach((e) => window.addEventListener(e, cargar, { passive: true }));
    return quitar;
  }, []);

  // El video sigue al scroll con inercia: currentTime se acerca al objetivo en cada cuadro y el
  // ciclo se detiene al llegar (lo retoma el próximo scroll). No se toca mientras busca un cuadro.
  useEffect(() => {
    if (!viva()) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const v = video.current;
      if (!v || v.readyState < 2 || !v.duration) return;
      if (!v.seeking) {
        const meta = objetivo.current * (v.duration - 0.05);
        const delta = meta - v.currentTime;
        if (Math.abs(delta) <= 0.012) return;
        v.currentTime = v.currentTime + delta * 0.22;
      }
      raf = requestAnimationFrame(tick);
    };
    correr.current = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    return () => {
      if (raf) cancelAnimationFrame(raf);
      correr.current = () => {};
    };
  }, []);

  // Ubica el visor sobre el panel del QR según cómo recorta object-cover a la escena.
  const ubicarVisor = () => {
    const m = media.current;
    const vz = visor.current;
    if (!m || !vz) return;
    const W = m.offsetWidth;
    const H = m.offsetHeight;
    const movil = variante.current ? variante.current === "movil" : window.matchMedia("(max-width: 1023px)").matches;
    const aspecto = movil ? 600 / 900 : 1.5;
    const escala = Math.max(W / aspecto, H) / H; // alto del cuadro dibujado / alto visible
    const altoDib = H * escala;
    const anchoDib = altoDib * aspecto;
    const offX = (W - anchoDib) / 2;
    const offY = (H - altoDib) / 2;
    const fx = (x: number) => (movil ? (x - RECORTE_MOVIL.x) / RECORTE_MOVIL.w : x);
    const x0 = offX + fx(PANEL.x0) * anchoDib;
    const x1 = offX + fx(PANEL.x1) * anchoDib;
    const y0 = offY + PANEL.y0 * altoDib;
    const y1 = offY + PANEL.y1 * altoDib;
    vz.style.left = `${x0}px`;
    vz.style.top = `${y0}px`;
    vz.style.width = `${x1 - x0}px`;
    vz.style.height = `${y1 - y0}px`;
    vz.style.setProperty("--alto-visor", `${y1 - y0}px`);
  };
  useEffect(() => {
    if (!viva()) return;
    ubicarVisor();
    window.addEventListener("resize", ubicarVisor, { passive: true });
    return () => window.removeEventListener("resize", ubicarVisor);
  }, []);

  useScrollProgress(
    pista,
    (p) => {
      if (!viva()) return;
      const ancho = window.matchMedia("(min-width: 1024px)").matches;
      // 1. La tarjeta crece hasta llenar la escena.
      // En escritorio el texto se aparta antes de que la tarjeta crezca, para que no se crucen.
      const tx = texto.current;
      if (tx) {
        const sal = ancho ? suave(tramo(p, 0, 0.12)) : 0;
        tx.style.opacity = (1 - sal).toFixed(3);
        tx.style.transform = sal ? `translate3d(0, ${(-48 * sal).toFixed(1)}px, 0)` : "";
        tx.style.visibility = sal >= 1 ? "hidden" : "";
      }
      const g = suave(tramo(p, ancho ? 0.07 : 0, ancho ? 0.36 : 0.26));
      const s0 = ancho ? 0.46 : 0.9;
      const tx0 = ancho ? 24 : 0; // vw
      const ty0 = ancho ? 4 : 0; // vh
      const s = s0 + (1 - s0) * g;
      const m = media.current;
      if (m) {
        m.style.transform = `translate3d(${(tx0 * (1 - g)).toFixed(3)}vw, ${(ty0 * (1 - g)).toFixed(3)}vh, 0) scale(${s.toFixed(4)})`;
        m.style.borderRadius = `${((ancho ? 34 : 26) * (1 - g) / s).toFixed(1)}px`;
      }
      // La etiqueta «Render ilustrativo» se lee siempre a su tamaño, aunque la tarjeta esté chica.
      if (etiqueta.current) etiqueta.current.style.transform = `scale(${(1 / s).toFixed(4)})`;
      // 2. La cámara avanza hasta el stand.
      objetivo.current = suave(tramo(p, 0.04, 0.72));
      correr.current();
      // 3. El visor encuadra el QR y pasa la línea de escaneo.
      const v = tramo(p, 0.62, 0.74);
      const sale = tramo(p, 0.86, 0.94);
      const vz = visor.current;
      if (vz) {
        vz.style.opacity = (v * (1 - sale)).toFixed(3);
        vz.style.transform = `scale(${(1.35 - 0.35 * suave(v)).toFixed(4)})`;
        vz.style.setProperty("--barrido", tramo(p, 0.68, 0.84).toFixed(3));
      }
      // 4. Sube el teléfono con la carta y la escena se oscurece un poco detrás.
      const t = suave(tramo(p, 0.76, 0.96));
      if (velo.current) velo.current.style.opacity = (0.7 * t).toFixed(3);
      if (tel.current) tel.current.style.transform = `translate3d(0, ${((1 - t) * 115).toFixed(2)}%, 0) rotate(${((1 - t) * -6).toFixed(2)}deg)`;
      if (pista0.current) pista0.current.style.opacity = (1 - tramo(p, 0.02, 0.1)).toFixed(3);
    },
    "fijo",
  );

  return (
    <section data-wa-float-despues className="he relative overflow-x-clip border-b border-stone-200/60 bg-cream-50">
      <div className="qr-grid pointer-events-none absolute inset-0 opacity-70" />
      <div ref={texto} className="he-texto relative z-20">
        <div className="he-col">{children}</div>
      </div>
      <div ref={pista} className="he-pista relative">
        <div className="he-escena">
          <div ref={media} className="he-media">
            {/* Primer cuadro del video = el render de la mesa (D-050), etiquetado. */}
            <picture>
              <source media="(max-width: 1023px)" srcSet="/portada/escaneo-inicio-movil.webp" />
              <img
                src="/portada/escaneo-inicio.webp"
                alt="Render ilustrativo de un stand de mesa DataFud con código QR y una tarjeta NFC sobre una mesa de un café"
                width={1440}
                height={960}
                fetchPriority="high"
                decoding="async"
                className="he-poster"
              />
            </picture>
            <video ref={video} className="he-video" muted playsInline preload="none" aria-hidden="true" tabIndex={-1} />
            <div ref={velo} className="he-velo" aria-hidden="true" />
            <div ref={visor} className="he-visor" aria-hidden="true">
              <span /><span /><span /><span />
              <i className="he-barrido" />
            </div>
            <span ref={etiqueta} className="he-etiqueta">Render ilustrativo</span>
          </div>
          <div ref={tel} className="he-telefono" aria-hidden="true">
            {telefono}
            <p className="he-pie">
              <span>Así se abre tu carta</span>
              <span>Soda ficticia · datos de ejemplo</span>
            </p>
          </div>
          <div ref={pista0} className="he-indicio" aria-hidden="true">
            <span>Bajá para escanear</span>
            <i />
          </div>
        </div>
      </div>
    </section>
  );
}
