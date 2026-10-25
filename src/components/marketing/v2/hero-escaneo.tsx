"use client";

import { useEffect, useRef } from "react";
import { useScrollProgress } from "@/components/marketing/v2/use-scroll-progress";

// Portada que escanea. Desde el primer cuadro, un visor dorado late sobre el QR del stand; al
// bajar, la cámara se acerca (los cuadros del video siguen al scroll), el visor sigue al QR cuadro por cuadro y
// al final sube el teléfono con la carta de la demo: el recorrido del comensal en una escena.
//
//  - Escritorio (≥ 1024 px): la escena llena la pantalla desde el primer cuadro (100 vh, sin
//    marco) y el texto va a la izquierda, claro sobre un velo verde oscuro que se va con él.
//  - Teléfono y tableta vertical: la escena llena la pantalla desde el inicio, con el stand
//    arriba y el texto abajo sobre un degradado; la cámara se desliza para tener el QR centrado.
//
// El texto (h1, bajada, CTA) llega como children y viene visible en el HTML del servidor; lo demás
// es decorativo. Sin JS, sin `scripting` o con movimiento reducido: la portada quieta de siempre
// (globals.css, .he-*). Los cuadros se piden con la primera interacción.

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

// La animación son los 121 cuadros del video (5 s a 24 cuadros por segundo) en WebP sueltos que se
// pintan en un canvas: un cuadro ya decodificado se dibuja en menos de 1 ms, así que el cuadro que se
// ve es siempre el que pide el scroll, en el mismo cuadro de pantalla, rápido o lento. Con un video,
// cada búsqueda es asíncrona y no se puede pedir otra hasta que termina: con scroll rápido el
// teléfono se quedaba atrás y saltaba (1.15.1 y antes).
//
// Decodificar un cuadro al pintarlo cuesta más que un cuadro de pantalla en un teléfono, y tenerlos
// todos decodificados ocuparía cientos de MB. Por eso se guardan los 121 comprimidos y solo VENTANA
// decodificados (ImageBitmap, fuera del hilo principal) alrededor del cuadro actual: ATRAS detrás y
// el resto hacia donde va el scroll, salteados si va rápido para cubrir más recorrido; los demás se
// liberan. Decodificar 12 cuadros en paralelo toma unos 30 ms, también en un teléfono lento.
//
// Para el scroll muy rápido, que pasa la ventana antes de que se decodifique, están además los 121
// cuadros en una versión previa liviana (un tercio del ancho, 2–3 MB en total), que llega primero y
// queda decodificada entera: siempre hay un cuadro en el lugar exacto y el nítido lo reemplaza apenas
// llega, sin que el cuadro se quede atrás.
const FPS = 24;
const CUADROS = 121;
const SECUENCIAS = {
  vertical: { dir: "v", previa: "v-previa", w: 1080, h: 1440 },
  escritorio: { dir: "d", previa: "d-previa", w: 1920, h: 1282 },
} as const;
const VENTANA = 28;
const ATRAS = 5;
const rutaCuadro = (dir: string, i: number) => `/portada/cuadros/${dir}/${String(i).padStart(3, "0")}.webp`;

// Orden de carga: el primero y el último, después uno de cada 16, 8, 4, 2 y todos. Con scroll rápido
// apenas entrando ya hay cuadros repartidos por todo el recorrido y se pinta el cargado más cercano.
function ordenDeCarga() {
  const orden = [0, CUADROS - 1];
  const visto = new Set(orden);
  for (const paso of [16, 8, 4, 2, 1]) {
    for (let i = 0; i < CUADROS; i += paso) {
      if (!visto.has(i)) {
        visto.add(i);
        orden.push(i);
      }
    }
  }
  return orden;
}

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
  const lienzo = useRef<HTMLCanvasElement>(null);
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
  // Qué secuencia se cargó: la escena se compone según esa, aunque después cambie el ancho.
  const variante = useRef<"vertical" | "escritorio" | null>(null);
  const geo = useRef<Geo | null>(null);
  // Tiempo del cuadro que muestra el canvas (el visor y la cámara siguen a ese cuadro).
  const cuadro = useRef(0);
  // Cuadros comprimidos ya descargados, los decodificados alrededor del actual y el que está pintado.
  const blobs = useRef<(Blob | undefined)[]>([]);
  const listos = useRef(new Map<number, ImageBitmap>());
  const decodificando = useRef(new Set<number>());
  const previas = useRef<(ImageBitmap | undefined)[]>([]);
  // Cuadro nítido pintado (no se libera mientras se ve) y qué hay en el canvas (índice; negativo si es previa).
  const pintado = useRef(-1);
  const enLienzo = useRef(Number.NaN);
  const sentido = useRef(1);
  const ultimaMeta = useRef(0);
  // Cuadros que avanza el scroll por cada pintada, suavizado: decide qué tan lejos se decodifica.
  const velocidad = useRef(0);

  // Lee las medidas y acomoda el canvas y el póster a su tamaño entero. Solo al montar, al cargar
  // el primer cuadro y al cambiar el tamaño de la ventana.
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
    // En pantalla completa el canvas y el póster miden su tamaño entero (la cámara se desliza sobre
    // ellos y recorta la pantalla); en escritorio, object-fit: cover dentro de la escena.
    for (const capa of [poster.current, lienzo.current]) {
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

  // Pinta en el canvas el cuadro que pide el scroll: el nítido, si no su previa y, si tampoco llegó,
  // el cargado más cercano.
  // Sin inercia: el cuadro sigue al dedo tal cual, y la suavidad la da el scroll del sistema.
  const pintar = () => {
    const c = lienzo.current;
    const lista = listos.current;
    const meta = Math.round(objetivo.current * (CUADROS - 1));
    if (meta !== ultimaMeta.current) sentido.current = meta > ultimaMeta.current ? 1 : -1;
    velocidad.current = velocidad.current * 0.6 + Math.abs(meta - ultimaMeta.current) * 0.4;
    ultimaMeta.current = meta;
    decodificar();
    const prev = previas.current;
    if (!c) return;
    let j = -1;
    let bmp: ImageBitmap | undefined;
    let fino = false;
    for (let d = 0; d < CUADROS && !bmp; d++) {
      for (const i of d ? [meta - d, meta + d] : [meta]) {
        if (bmp || i < 0 || i >= CUADROS) continue;
        if (lista.has(i)) [j, bmp, fino] = [i, lista.get(i), true];
        else if (prev[i]) [j, bmp, fino] = [i, prev[i], false];
      }
    }
    const clave = fino ? j : -1 - j;
    if (!bmp || clave === enLienzo.current) return;
    const ctx = c.getContext("2d", { alpha: false });
    if (!ctx) return;
    ctx.drawImage(bmp, 0, 0, c.width, c.height);
    enLienzo.current = clave;
    if (fino) pintado.current = j;
    cuadro.current = j / FPS;
  };

  // Mantiene decodificados los cuadros de la ventana, primero los más cercanos al actual, y libera
  // los que quedan fuera. Hasta 8 a la vez.
  const decodificar = () => {
    const meta = ultimaMeta.current;
    const s = sentido.current;
    const v = velocidad.current;
    const paso = v > 6 ? 3 : v > 2.5 ? 2 : 1;
    const quiero: number[] = [];
    for (let i = meta; i >= 0 && i < CUADROS && quiero.length < VENTANA - ATRAS; i += s * paso) quiero.push(i);
    for (let d = 1; d <= ATRAS; d++) if (meta - s * d >= 0 && meta - s * d < CUADROS) quiero.push(meta - s * d);
    const dentro = new Set(quiero);
    for (const [i, bmp] of listos.current) {
      // Nunca se libera el que está pintado: es el que se ve mientras llegan los demás.
      if (!dentro.has(i) && i !== pintado.current) {
        bmp.close();
        listos.current.delete(i);
      }
    }
    for (const i of quiero) {
      if (decodificando.current.size >= 8) break;
      const b = blobs.current[i];
      if (!b || listos.current.has(i) || decodificando.current.has(i)) continue;
      decodificando.current.add(i);
      createImageBitmap(b)
        .then((bmp) => {
          decodificando.current.delete(i);
          if (!blobs.current.length) return bmp.close();
          listos.current.set(i, bmp);
          alLlegarRef.current();
        })
        .catch(() => decodificando.current.delete(i));
    }
  };
  const alLlegarRef = useRef<() => void>(() => {});

  // Compone la escena para el progreso actual y el cuadro que muestra el canvas. No lee medidas
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

  // Los cuadros se piden con la primera interacción o, si nadie toca nada, cuando la página ya
  // cargó y el navegador está libre. Ocho descargas a la vez; los nítidos se guardan comprimidos y la ventana
  // de decodificados avanza con cada cuadro que llega y con cada pintada.
  useEffect(() => {
    if (!viva()) return;
    const c = lienzo.current;
    const decodificados = listos.current;
    const previasLocal = previas.current;
    if (!c) return;
    let cargado = false;
    let vivo = true;
    let espera = 0;
    const eventos = ["scroll", "pointermove", "touchstart", "keydown"] as const;
    const quitar = () => {
      eventos.forEach((e) => window.removeEventListener(e, cargar));
      window.removeEventListener("load", alCargarPagina);
      if (espera) clearTimeout(espera);
    };
    // Cada cuadro decodificado: el primero muestra el canvas; los demás se pintan si están más cerca.
    alLlegarRef.current = () => {
      if (!vivo || !c) return;
      pintar();
      if (!Number.isNaN(enLienzo.current) && !c.hasAttribute("data-listo")) {
        c.setAttribute("data-listo", "");
        medir();
      }
      componer();
    };
    function cargar() {
      if (cargado || !c) return;
      cargado = true;
      quitar();
      const vertical = !esAncho();
      variante.current = vertical ? "vertical" : "escritorio";
      const sec = SECUENCIAS[variante.current];
      c.width = sec.w;
      c.height = sec.h;
      // Primero las previas (se decodifican y quedan), después los nítidos (quedan comprimidos).
      const orden = ordenDeCarga();
      const tareas = [...orden.map((i) => [i, true] as const), ...orden.map((i) => [i, false] as const)];
      let k = 0;
      const trabajador = async () => {
        while (vivo && k < tareas.length) {
          const [i, previa] = tareas[k++];
          if (previa) {
            try {
              const r = await fetch(rutaCuadro(sec.previa, i));
              if (!r.ok) continue;
              const bmp = await createImageBitmap(await r.blob());
              if (!vivo) return bmp.close();
              previas.current[i] = bmp;
              alLlegarRef.current();
            } catch {
              // Sin la previa queda el nítido más cercano.
            }
            continue;
          }
          try {
            const r = await fetch(rutaCuadro(sec.dir, i));
            if (!r.ok) continue;
            const b = await r.blob();
            if (!vivo) return;
            blobs.current[i] = b;
          } catch {
            continue;
          }
          decodificar();
        }
      };
      for (let n = 0; n < 8; n++) void trabajador();
    }
    function alCargarPagina() {
      const ocioso = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      espera = window.setTimeout(() => (ocioso ? ocioso(cargar, { timeout: 2000 }) : cargar()), 1200);
    }
    eventos.forEach((e) => window.addEventListener(e, cargar, { passive: true }));
    if (document.readyState === "complete") alCargarPagina();
    else window.addEventListener("load", alCargarPagina, { once: true });
    const alRedimensionar = () => {
      medir();
      componer();
    };
    alRedimensionar();
    window.addEventListener("resize", alRedimensionar, { passive: true });
    return () => {
      vivo = false;
      quitar();
      blobs.current = [];
      for (const bmp of decodificados.values()) bmp.close();
      decodificados.clear();
      for (const bmp of previasLocal) bmp?.close();
      previasLocal.length = 0;
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
      pintar();
      componer();
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
            {/* Primer cuadro de la secuencia = el render de la mesa (D-050), etiquetado. */}
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
            <canvas ref={lienzo} className="he-lienzo" aria-hidden="true" />
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
