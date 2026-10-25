"use client";

import { useEffect, useRef } from "react";
import { useScrollProgress } from "@/components/marketing/v2/use-scroll-progress";

// Portada que escanea. Desde el primer cuadro, un visor dorado late sobre el QR del stand; al
// bajar, la cámara se acerca (video que sigue al scroll), el visor sigue al QR cuadro por cuadro y
// al final sube el teléfono con la carta de la demo: el recorrido del comensal en una escena.
//
//  - Escritorio (≥ 1024 px): la escena llena la pantalla desde el primer cuadro (100 vh, sin
//    marco) y el texto va a la izquierda, claro sobre un velo verde oscuro que se va con él.
//  - Teléfono y tableta vertical: la escena llena la pantalla desde el inicio, con el stand
//    arriba y el texto abajo sobre un degradado; la cámara se desliza para tener el QR centrado.
//
// El texto (h1, bajada, CTA) llega como children y viene visible en el HTML del servidor; lo demás
// es decorativo. Sin JS, sin `scripting` o con movimiento reducido: la portada quieta de siempre
// (globals.css, .he-*). El video se pide con la primera interacción.

// Caja del QR (x0, y0, x1, y1, en fracciones del cuadro original de 3524×2352, el video en 4K) en
// 21 cuadros, leída con un lector de QR: el código decodifica a /q/demo26 en todos (D-051).
const CAJAS: [number, number, number, number, number][] = [
  [0, 0.5751, 0.4018, 0.6875, 0.5613], [0.25, 0.5732, 0.401, 0.6865, 0.5613], [0.5, 0.5713, 0.4007, 0.6861, 0.5633],
  [0.75, 0.5673, 0.3994, 0.6843, 0.5654], [1, 0.5611, 0.3975, 0.6812, 0.5671], [1.25, 0.5546, 0.3941, 0.6781, 0.5684],
  [1.5, 0.55, 0.3918, 0.6766, 0.5709], [1.75, 0.5417, 0.3893, 0.6724, 0.5738], [2, 0.534, 0.3863, 0.6692, 0.5763],
  [2.25, 0.5272, 0.3827, 0.665, 0.5783], [2.5, 0.5188, 0.3794, 0.6618, 0.5815], [2.75, 0.5103, 0.3765, 0.6573, 0.5839],
  [3, 0.5041, 0.3741, 0.6556, 0.5878], [3.25, 0.4934, 0.3693, 0.6498, 0.5885], [3.5, 0.4852, 0.366, 0.6461, 0.5911],
  [3.75, 0.478, 0.3631, 0.6417, 0.5941], [4, 0.4708, 0.3603, 0.6396, 0.5966], [4.25, 0.4659, 0.358, 0.637, 0.5988],
  [4.5, 0.4607, 0.3549, 0.6335, 0.5999], [4.75, 0.4539, 0.353, 0.6317, 0.6006], [4.99, 0.4544, 0.3525, 0.6322, 0.6018],
];
// La versión vertical es un recorte de 1764 px de ancho desde x = 1057 (exportado a 1080×1440).
const VERTICAL = { x: 1057 / 3524, w: 1764 / 3524, aspecto: 1080 / 1440 };
const ASPECTO_ESCRITORIO = 3524 / 2352;

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

// Los videos van codificados con todos los cuadros completos (sin cuadros intermedios ni B-frames):
// cada búsqueda decodifica un solo cuadro. Con un cuadro completo cada 10, una búsqueda en el de
// escritorio tardaba 28 ms de mediana en Chrome, más que un cuadro de pantalla (16,7 ms).

// La escena larga existe solo si el navegador la arma (globals.css usa la misma consulta); en un
// navegador sin `scripting` la portada queda quieta y este componente no toca nada.
const ESCENA_VIVA = "(scripting: enabled) and (prefers-reduced-motion: no-preference) and (min-height: 520px)";
const viva = () => typeof window !== "undefined" && window.matchMedia(ESCENA_VIVA).matches;
const esAncho = () => window.matchMedia("(min-width: 1024px)").matches;

// Medidas de la escena: se leen al montar y al cambiar el tamaño, nunca en cada cuadro de scroll.
type Geo = { ancho: boolean; vertical: boolean; W: number; H: number; Wd: number; Hd: number; offX: number; offY: number };

export function HeroEscaneo({ children, telefono }: { children: React.ReactNode; telefono: React.ReactNode }) {
  const pista = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const visor = useRef<HTMLDivElement>(null);
  const velo = useRef<HTMLDivElement>(null);
  const fundido = useRef<HTMLDivElement>(null);
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
  const geo = useRef<Geo | null>(null);
  // Tiempo del cuadro que el video está mostrando (el visor y la cámara siguen a ese cuadro).
  const cuadro = useRef(0);

  // Lee las medidas y acomoda el video y el póster a su tamaño entero. Solo al montar, al cargar
  // el video y al cambiar el tamaño de la ventana.
  const medir = () => {
    const m = media.current;
    if (!m || !viva()) {
      geo.current = null;
      return;
    }
    const ancho = esAncho();
    const vertical = variante.current ? variante.current === "vertical" : !ancho;
    const W = m.offsetWidth;
    const H = m.offsetHeight;
    const a = vertical ? VERTICAL.aspecto : ASPECTO_ESCRITORIO;
    const Hd = Math.max(H, W / a);
    const Wd = Hd * a;
    const offX = (W - Wd) / 2;
    const offY = (H - Hd) / 2;
    geo.current = { ancho, vertical, W, H, Wd, Hd, offX, offY };
    // En pantalla completa el video y el póster miden su tamaño entero (la cámara se desliza sobre
    // ellos y recorta la pantalla); en escritorio, object-fit: cover dentro de la escena.
    for (const capa of [poster.current, video.current, fundido.current]) {
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
  };

  // Compone la escena para el progreso actual y el cuadro que muestra el video. No lee medidas
  // del documento: solo escribe estilos, así que nunca obliga al navegador a recalcular el layout.
  const componer = () => {
    const g0 = geo.current;
    const m = media.current;
    if (!m || !g0) return;
    const p = progreso.current;
    const { ancho, vertical, W, H, Wd, Hd, offX, offY } = g0;
    const [bx0, by0, bx1, by1] = cajaEn(cuadro.current);
    const fx = (x: number) => (vertical ? (x - VERTICAL.x) / VERTICAL.w : x);
    const qx0 = offX + fx(bx0) * Wd;
    const qx1 = offX + fx(bx1) * Wd;
    const qy0 = offY + by0 * Hd;
    const qy1 = offY + by1 * Hd;

    // El visor, sobre el QR del cuadro que se ve. La posición va en `translate` (se compone en la
    // GPU y convive con el latido, que anima `transform`); el tamaño, en width y height.
    const vz = visor.current;
    if (vz) {
      vz.style.translate = `${qx0.toFixed(1)}px ${qy0.toFixed(1)}px`;
      vz.style.width = `${(qx1 - qx0).toFixed(1)}px`;
      vz.style.height = `${(qy1 - qy0).toFixed(1)}px`;
      vz.style.setProperty("--alto-visor", `${(qy1 - qy0).toFixed(1)}px`);
      vz.style.opacity = (1 - tramo(p, 0.84, 0.92)).toFixed(3);
      vz.classList.toggle("escaneado", p > 0.7);
    }

    let s = 1;
    if (ancho) {
      // Pantalla completa desde el primer cuadro, sin marco: la escena llena la ventana y el
      // acercamiento lo hace la cámara del video. El velo de la izquierda (detrás del texto) se va
      // con el texto.
      m.style.transform = "none";
      m.style.borderRadius = "0px";
      if (degradado.current) degradado.current.style.opacity = (1 - suave(tramo(p, 0.02, 0.2))).toFixed(3);
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

  // El video se pide con la primera interacción o, si nadie toca nada, cuando la página ya cargó
  // y el navegador está libre: así un scroll rápido apenas entrando no alcanza al video a medio bajar.
  useEffect(() => {
    if (!viva()) return;
    const v = video.current;
    if (!v) return;
    let cargado = false;
    let espera = 0;
    const eventos = ["scroll", "pointermove", "touchstart", "keydown"] as const;
    const quitar = () => {
      eventos.forEach((e) => window.removeEventListener(e, cargar));
      window.removeEventListener("load", alCargarPagina);
      if (espera) clearTimeout(espera);
    };
    function cargar() {
      if (cargado || !v) return;
      cargado = true;
      quitar();
      const vertical = !esAncho();
      variante.current = vertical ? "vertical" : "escritorio";
      // Escritorio: 1920 px salvo en pantallas de más de 2200 px reales, que piden el de 2560.
      const fino = window.innerWidth * (window.devicePixelRatio || 1) > 2200;
      v.src = vertical ? "/portada/escaneo-vertical-1080.mp4" : fino ? "/portada/escaneo-2560.mp4" : "/portada/escaneo-1920.mp4";
      v.preload = "auto";
      v.load();
      v.addEventListener(
        "loadeddata",
        () => {
          v.setAttribute("data-listo", "");
          medir();
          componer();
          correr.current();
        },
        { once: true },
      );
    }
    function alCargarPagina() {
      const ocioso = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      espera = window.setTimeout(() => (ocioso ? ocioso(cargar, { timeout: 2000 }) : cargar()), 1200);
    }
    eventos.forEach((e) => window.addEventListener(e, cargar, { passive: true }));
    if (document.readyState === "complete") alCargarPagina();
    else window.addEventListener("load", alCargarPagina, { once: true });
    return quitar;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // El video sigue al scroll con inercia: currentTime se acerca al objetivo en cada cuadro de
  // pantalla, con un tiempo continuo (no salta de cuadro en cuadro), y el ciclo se detiene al llegar
  // (lo retoma el próximo scroll). No se toca mientras busca. Es el movimiento de 1.15.0: 1.15.1 lo
  // cambió por saltos a cuadros enteros y 1.15.2 por cuadros sueltos sin inercia, y en el teléfono
  // los dos se veían a saltos.
  useEffect(() => {
    if (!viva()) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const v = video.current;
      if (!v || !v.duration) return;
      // Mientras busca, el video puede bajar su readyState: el ciclo espera en vez de apagarse
      // (si se apagaba, el video quedaba en un cuadro viejo hasta el siguiente scroll).
      if (v.readyState < 2) {
        raf = requestAnimationFrame(tick);
        return;
      }
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
    // La escena se acomoda al cuadro que el navegador presenta, en el mismo cuadro de pantalla.
    // Sin requestVideoFrameCallback, al terminar cada búsqueda.
    let rvfc = 0;
    const conCuadro = typeof HTMLVideoElement !== "undefined" && "requestVideoFrameCallback" in HTMLVideoElement.prototype;
    const alCuadro = (_: number, info: { mediaTime: number }) => {
      cuadro.current = info.mediaTime;
      componer();
      rvfc = v!.requestVideoFrameCallback(alCuadro);
    };
    const alBuscar = () => {
      cuadro.current = v!.currentTime;
      componer();
    };
    if (v) {
      if (conCuadro) rvfc = v.requestVideoFrameCallback(alCuadro);
      else v.addEventListener("seeked", alBuscar);
    }
    const alRedimensionar = () => {
      medir();
      componer();
    };
    alRedimensionar();
    window.addEventListener("resize", alRedimensionar, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      correr.current = () => {};
      if (v && conCuadro && rvfc) v.cancelVideoFrameCallback(rvfc);
      v?.removeEventListener("seeked", alBuscar);
      window.removeEventListener("resize", alRedimensionar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useScrollProgress(
    pista,
    (p) => {
      if (!geo.current) return;
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
            {/* Pósters en dos tamaños por forma: cada pantalla baja la nitidez que necesita. */}
            <picture>
              <source
                media="(max-width: 1023px)"
                srcSet="/portada/escaneo-inicio-vertical-1080.webp 1080w, /portada/escaneo-inicio-vertical-1620.webp 1620w"
                sizes="112vw"
              />
              <img
                src="/portada/escaneo-inicio-2560.webp"
                srcSet="/portada/escaneo-inicio-1920.webp 1920w, /portada/escaneo-inicio-2560.webp 2560w"
                sizes="100vw"
                alt="Render ilustrativo de un stand de mesa DataFud con código QR y una tarjeta NFC sobre una mesa de un café"
                width={2560}
                height={1440}
                fetchPriority="high"
                decoding="async"
                ref={poster}
                className="he-poster"
              />
            </picture>
            <video ref={video} className="he-video" muted playsInline preload="none" aria-hidden="true" tabIndex={-1} />
            <div ref={fundido} className="he-fundido" aria-hidden="true" />
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
