"use client";

import { useEffect, useRef } from "react";
import { useScrollProgress } from "@/components/marketing/v2/use-scroll-progress";

// Portada que escanea. Desde el primer cuadro, un visor dorado late sobre el QR del stand; al
// bajar, la cámara se acerca (video que sigue al scroll), el visor sigue al QR cuadro por cuadro y
// al final sube el teléfono con la carta de la demo: el recorrido del comensal en una escena.
//
//  - Escritorio (≥ 1024 px): texto a la izquierda y la escena como tarjeta a la derecha, que
//    crece hasta llenar la pantalla.
//  - Teléfono y tableta vertical: la escena llena la pantalla desde el inicio, con el stand
//    arriba y el texto abajo sobre un degradado; la cámara se desliza para tener el QR centrado.
//
// El texto (h1, bajada, CTA) llega como children y viene visible en el HTML del servidor; lo demás
// es decorativo. Sin JS, sin `scripting` o con movimiento reducido: la portada quieta de siempre
// (globals.css, .he-*). El video se pide con la primera interacción.

// Caja del QR (x0, y0, x1, y1, en fracciones del cuadro original de 1764×1176) en 21 cuadros del
// video, leída con un lector de QR: el código decodifica a /q/demo26 en todos (D-051).
const CAJAS: [number, number, number, number, number][] = [
  [0, 0.5757, 0.4023, 0.6885, 0.5621], [0.25, 0.5738, 0.4022, 0.6877, 0.562], [0.5, 0.5711, 0.4009, 0.6861, 0.5629],
  [0.75, 0.5669, 0.4013, 0.6841, 0.5661], [1, 0.5614, 0.4008, 0.6808, 0.5684], [1.25, 0.5539, 0.398, 0.6767, 0.5706],
  [1.5, 0.5454, 0.3968, 0.6726, 0.5751], [1.75, 0.5354, 0.3956, 0.667, 0.5812], [2, 0.5243, 0.3934, 0.6612, 0.5858],
  [2.25, 0.5132, 0.3899, 0.6557, 0.5896], [2.5, 0.5017, 0.3874, 0.6505, 0.5944], [2.75, 0.4907, 0.3845, 0.6442, 0.5993],
  [3, 0.4789, 0.3823, 0.6379, 0.6049], [3.25, 0.465, 0.3782, 0.6316, 0.6087], [3.5, 0.4536, 0.3761, 0.6282, 0.6154],
  [3.75, 0.4428, 0.373, 0.62, 0.6194], [4, 0.4327, 0.3703, 0.6158, 0.6217], [4.25, 0.4253, 0.367, 0.6114, 0.6228],
  [4.5, 0.4236, 0.3677, 0.6124, 0.6247], [4.75, 0.4232, 0.3669, 0.6113, 0.6245], [4.99, 0.4232, 0.3673, 0.6128, 0.6249],
];
// La versión vertical es un recorte de 882 px de ancho desde x = 529 (600×800).
const VERTICAL = { x: 529 / 1764, w: 882 / 1764, aspecto: 600 / 800 };
const ASPECTO_ESCRITORIO = 1.5;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const tramo = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const suave = (t: number) => t * t * (3 - 2 * t);

function cajaEn(t: number) {
  let i = 0;
  while (i < CAJAS.length - 2 && CAJAS[i + 1][0] <= t) i++;
  const [ta, ...a] = CAJAS[i];
  const [tb, ...b] = CAJAS[i + 1];
  const k = clamp((t - ta) / (tb - ta));
  return a.map((v, j) => v + (b[j] - v) * k) as [number, number, number, number];
}

// La escena larga existe solo si el navegador la arma (globals.css usa la misma consulta); en un
// navegador sin `scripting` la portada queda quieta y este componente no toca nada.
const ESCENA_VIVA = "(scripting: enabled) and (prefers-reduced-motion: no-preference)";
const viva = () => typeof window !== "undefined" && window.matchMedia(ESCENA_VIVA).matches;
const esAncho = () => window.matchMedia("(min-width: 1024px)").matches;

export function HeroEscaneo({ children, telefono }: { children: React.ReactNode; telefono: React.ReactNode }) {
  const pista = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const visor = useRef<HTMLDivElement>(null);
  const velo = useRef<HTMLDivElement>(null);
  const degradado = useRef<HTMLDivElement>(null);
  const tel = useRef<HTMLDivElement>(null);
  const indicio = useRef<HTMLDivElement>(null);
  const texto = useRef<HTMLDivElement>(null);
  const etiqueta = useRef<HTMLSpanElement>(null);
  const poster = useRef<HTMLImageElement>(null);
  const progreso = useRef(0);
  const objetivo = useRef(0);
  // Qué versión del video se cargó: la escena se compone según esa, aunque después cambie el ancho.
  const variante = useRef<"vertical" | "escritorio" | null>(null);
  const correr = useRef<() => void>(() => {});

  // Compone la escena para el progreso actual y el cuadro que muestra el video.
  const componer = () => {
    const m = media.current;
    if (!m || !viva()) return;
    const p = progreso.current;
    const ancho = esAncho();
    const vertical = variante.current ? variante.current === "vertical" : !ancho;
    const W = m.offsetWidth;
    const H = m.offsetHeight;
    const a = vertical ? VERTICAL.aspecto : ASPECTO_ESCRITORIO;
    const Hd = Math.max(H, W / a);
    const Wd = Hd * a;
    const offX = (W - Wd) / 2;
    const offY = (H - Hd) / 2;
    const v = video.current;
    const t = v && v.readyState >= 2 ? v.currentTime : 0;
    const [bx0, by0, bx1, by1] = cajaEn(t);
    const fx = (x: number) => (vertical ? (x - VERTICAL.x) / VERTICAL.w : x);
    const qx0 = offX + fx(bx0) * Wd;
    const qx1 = offX + fx(bx1) * Wd;
    const qy0 = offY + by0 * Hd;
    const qy1 = offY + by1 * Hd;

    // El visor, sobre el QR del cuadro que se ve.
    const vz = visor.current;
    if (vz) {
      vz.style.left = `${qx0}px`;
      vz.style.top = `${qy0}px`;
      vz.style.width = `${qx1 - qx0}px`;
      vz.style.height = `${qy1 - qy0}px`;
      vz.style.setProperty("--alto-visor", `${qy1 - qy0}px`);
      vz.style.opacity = (1 - tramo(p, 0.84, 0.92)).toFixed(3);
      vz.classList.toggle("escaneado", p > 0.7);
    }

    // En pantalla completa el video y el póster miden su tamaño entero (la cámara se desliza sobre
    // ellos y recorta la pantalla); en la tarjeta de escritorio, object-fit: cover dentro de ella.
    for (const capa of [poster.current, v]) {
      if (!capa) continue;
      if (ancho) {
        capa.style.left = capa.style.top = capa.style.width = capa.style.height = "";
      } else {
        capa.style.left = `${offX}px`;
        capa.style.top = `${offY}px`;
        capa.style.width = `${Wd}px`;
        capa.style.height = `${Hd}px`;
      }
    }

    let s = 1;
    if (ancho) {
      // Tarjeta que crece hasta llenar la escena. Arranca en el espacio libre a la derecha del
      // texto (sin taparlo nunca), hasta 24 px del borde de la ventana.
      const g = suave(tramo(p, 0.07, 0.36));
      const col = texto.current?.firstElementChild as HTMLElement | null;
      const finTexto = col ? col.offsetLeft + col.offsetWidth : W * 0.46;
      const izq = finTexto + Math.max(32, W * 0.03);
      const der = W - Math.max(24, W * 0.02);
      const s0 = clamp((der - izq) / W, 0.3, 0.56);
      const cx0 = izq + (s0 * W) / 2;
      s = s0 + (1 - s0) * g;
      const dx = (cx0 - W / 2) * (1 - g);
      m.style.transform = `translate3d(${dx.toFixed(1)}px, ${(3 * (1 - g)).toFixed(3)}vh, 0) scale(${s.toFixed(4)})`;
      m.style.borderRadius = `${((34 * (1 - g)) / s).toFixed(1)}px`;
    } else {
      // Pantalla completa: la cámara se desliza para tener el QR centrado. Al inicio la escena va
      // corrida hacia arriba (el stand en el tercio de arriba; abajo, el texto sobre verde oscuro)
      // y baja a su lugar cuando el texto se va.
      const g = suave(tramo(p, 0.02, 0.3));
      s = 1.12 - 0.06 * g;
      const cx = (qx0 + qx1) / 2;
      const cy = (qy0 + qy1) / 2;
      let tx = W / 2 - ((cx - W / 2) * s + W / 2);
      // Sin mostrar los bordes del video a los lados ni, al final, arriba y abajo.
      const txA = -(offX - W / 2) * s - W / 2;
      const txB = W - (offX + Wd - W / 2) * s - W / 2;
      const tyA = -(offY - H / 2) * s - H / 2;
      const tyB = H - (offY + Hd - H / 2) * s - H / 2;
      tx = clamp(tx, Math.min(txA, txB), Math.max(txA, txB));
      const tyFin = clamp(H * 0.46 - ((cy - H / 2) * s + H / 2), Math.min(tyA, tyB), Math.max(tyA, tyB));
      // Al inicio, el QR a la altura del 22 % (el borde de abajo queda bajo el verde del texto).
      const tyIni = Math.min(H * 0.22 - ((cy - H / 2) * s + H / 2), Math.max(tyA, tyB));
      const ty = tyIni + (tyFin - tyIni) * g;
      m.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
      m.style.borderRadius = "0px";
      if (degradado.current) degradado.current.style.opacity = (1 - suave(tramo(p, 0.08, 0.26))).toFixed(3);
    }

    // En escritorio el texto se aparta antes de que la tarjeta crezca, para que no se crucen.
    const tx = texto.current;
    if (tx) {
      // En teléfono se desvanece en cuanto empieza el scroll, para no cruzarse con la imagen.
      const sal = ancho ? suave(tramo(p, 0, 0.12)) : suave(tramo(p, 0, 0.045));
      tx.style.opacity = (1 - sal).toFixed(3);
      tx.style.transform = sal ? `translate3d(0, ${((ancho ? -48 : -24) * sal).toFixed(1)}px, 0)` : "";
      tx.style.visibility = sal >= 1 ? "hidden" : "";
    }
    // El visor conserva su grosor aunque la tarjeta esté chica.
    if (vz) vz.style.setProperty("--grosor", `${(3 / s).toFixed(2)}px`);
    // La etiqueta «Render ilustrativo» se lee siempre a su tamaño.
    if (etiqueta.current) etiqueta.current.style.transform = `scale(${(1 / s).toFixed(4)})`;
    // Sube el teléfono con la carta y la escena se oscurece un poco detrás.
    const tt = suave(tramo(p, 0.76, 0.96));
    if (velo.current) velo.current.style.opacity = (0.7 * tt).toFixed(3);
    if (tel.current) tel.current.style.transform = `translate3d(0, ${((1 - tt) * 115).toFixed(2)}%, 0) rotate(${((1 - tt) * -6).toFixed(2)}deg)`;
    if (indicio.current) indicio.current.style.opacity = (1 - tramo(p, 0.02, 0.1)).toFixed(3);
  };

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
      const vertical = !esAncho();
      variante.current = vertical ? "vertical" : "escritorio";
      v.src = vertical ? "/portada/escaneo-vertical.mp4" : "/portada/escaneo.mp4";
      v.load();
      v.addEventListener(
        "loadeddata",
        () => {
          v.setAttribute("data-listo", "");
          componer();
          correr.current();
        },
        { once: true },
      );
    }
    eventos.forEach((e) => window.addEventListener(e, cargar, { passive: true }));
    return quitar;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const v = video.current;
    // Cuando el navegador muestra el cuadro pedido, la escena se acomoda a ese cuadro.
    const alBuscar = () => componer();
    v?.addEventListener("seeked", alBuscar);
    componer();
    window.addEventListener("resize", componer, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      correr.current = () => {};
      v?.removeEventListener("seeked", alBuscar);
      window.removeEventListener("resize", componer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useScrollProgress(
    pista,
    (p) => {
      if (!viva()) return;
      progreso.current = p;
      objetivo.current = suave(tramo(p, 0.04, 0.72));
      componer();
      correr.current();
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
              <source media="(max-width: 1023px)" srcSet="/portada/escaneo-inicio-vertical.webp" />
              <img
                src="/portada/escaneo-inicio.webp"
                alt="Render ilustrativo de un stand de mesa DataFud con código QR y una tarjeta NFC sobre una mesa de un café"
                width={1440}
                height={960}
                fetchPriority="high"
                decoding="async"
                ref={poster}
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
          <div ref={degradado} className="he-degradado" aria-hidden="true" />
          {/* En pantalla completa la etiqueta va fija en la esquina de la pantalla, no en la escena que se mueve. */}
          <span className="he-etiqueta-fija">Render ilustrativo</span>
          <div ref={tel} className="he-telefono" aria-hidden="true">
            {telefono}
            <p className="he-pie">
              <span>Así se abre tu carta</span>
              <span>Soda ficticia · datos de ejemplo</span>
            </p>
          </div>
          <div ref={indicio} className="he-indicio" aria-hidden="true">
            <span>Bajá para escanear</span>
            <i />
          </div>
        </div>
      </div>
    </section>
  );
}
