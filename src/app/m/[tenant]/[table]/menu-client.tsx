"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { placeOrder, type CartLine } from "./actions";
import { getDict, orderErrors, t, type Dict, type OrderErrorKey } from "@/lib/i18n/dictionaries";
import { formatMoney } from "@/lib/currency/format";
import { Icon } from "@/components/ui/icon";
import type { I18nText, Lang } from "@/lib/supabase/types";

export interface MenuPayload {
  tenant: { id: string; name: string; slug: string };
  table: { id: string; label: string };
  /** El plan del local incluye pedidos desde la mesa (get_menu, AA-9). Sin la clave: sí. */
  ordering?: boolean;
  settings: {
    currency_code: string;
    default_language: Lang;
    enabled_languages: Lang[];
    theme: Record<string, string>;
    logo_url: string | null;
    restaurant_name: string;
  };
  categories: { id: string; name_i18n: I18nText; sort_order: number }[];
  products: {
    id: string;
    category_id: string | null;
    name_i18n: I18nText;
    description_i18n: I18nText;
    price: number;
    image_url: string | null;
    sort_order: number;
  }[];
}

// Nombre del idioma para los lectores de pantalla, en su propio idioma.
const LANG_NAMES: Partial<Record<Lang, string>> = { es: "Español", en: "English", pt: "Português" };

// Grupo de los platillos sin categoría (AA-18): la categoría se borró en el panel y el platillo
// sigue disponible. Va al final para no mover el orden que armó el local.
const OTROS = "__otros";

// Topes del carrito: los mismos que valida place_order (S4).
const MAX_QTY = 20;
const MAX_LINES = 30;
const NOTE_MAX = 300;

type Cart = Record<string, number>;

// Si el envío no responde en este tiempo, el botón se libera y el comensal puede reintentar: el
// reintento lleva la misma referencia y place_order no duplica la orden.
const SEND_TIMEOUT_MS = 20_000;
// Cuánto vale la referencia de un envío sin confirmar. Pasado ese tiempo, el mismo carrito es un
// pedido nuevo (otra ronda de lo mismo), no un reintento del anterior.
const CLIENT_REF_TTL_MS = 10 * 60_000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Colores del local: solo #rrggbb (la base lo exige desde 1.7.0; acá por si llega otra cosa).
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

type Envio = { sig: string; ref: string; createdAt: number };

/** Referencia guardada que todavía sirve para reintentar ese mismo carrito. */
function envioVigente(e: unknown, sig: string, now: number): e is Envio {
  if (!e || typeof e !== "object") return false;
  const { sig: s, ref, createdAt } = e as Partial<Envio>;
  return (
    s === sig &&
    typeof ref === "string" &&
    UUID_RE.test(ref) &&
    typeof createdAt === "number" &&
    now - createdAt >= 0 &&
    now - createdAt < CLIENT_REF_TTL_MS
  );
}

/** Referencia nueva para un envío (uuid v4). */
function newClientRef(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

// La etiqueta de la mesa la escribe el local tal como la usa («Mesa 3», «Barra»). Solo a un
// número pelado se le antepone la palabra, para no decir «Mesa Mesa 3» (AA-13).
function tableName(label: string, d: Dict): string {
  const clean = label.trim();
  return /^\d+$/.test(clean) ? `${d.table} ${clean}` : clean;
}

// Deja en el carrito solo cantidades válidas de platillos que la carta todavía ofrece.
function cleanCart(raw: unknown, valid: (id: string) => boolean): Cart {
  const out: Cart = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [id, q] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof q === "number" && Number.isInteger(q) && q > 0 && valid(id)) out[id] = Math.min(MAX_QTY, q);
  }
  return out;
}

export function MenuClient({
  data,
  slug,
  token,
  demo = false,
  ordering = true,
  tagline,
}: {
  data: MenuPayload;
  slug: string;
  token: string;
  demo?: boolean;
  // Modo Carta (D-040): `false` deja la carta de solo lectura — sin botones de agregar,
  // sin barra de orden y sin hoja del carrito. Lo usan /c/<slug> y /preview/carta.
  ordering?: boolean;
  // Subtítulo propio del local (D-045). Sin él se usa el del diccionario, que no supone cómo
  // se ordena. Solo lo pasan las cartas estáticas: no viaja en el payload de `get_menu`.
  tagline?: Partial<Record<Lang, string>>;
}) {
  const router = useRouter();
  const langs = data.settings.enabled_languages?.length
    ? data.settings.enabled_languages
    : (["es"] as Lang[]);
  const [lang, setLang] = useState<Lang>((data.settings.default_language as Lang) ?? "es");
  const [cart, setCart] = useState<Cart>({});
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  // Lo que se envió, para mostrarlo en la confirmación (AA-15). `null`: todavía no se envió.
  const [sent, setSent] = useState<{ lines: CartLine[]; total: number } | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [error, setError] = useState<OrderErrorKey | null>(null);
  const [itemsRemoved, setItemsRemoved] = useState(false);
  // Candado contra el doble toque: el estado de React llega un render tarde.
  const sendingRef = useRef(false);
  // Referencia del envío en curso y el carrito al que corresponde (ver `clientRefFor`).
  const envioRef = useRef<Envio | null>(null);

  const d = getDict(lang);
  const errors = orderErrors[lang] ?? orderErrors.es;
  const currency = data.settings.currency_code;
  const themePrimary = data.settings.theme?.primary;
  const themeAccent = data.settings.theme?.accent;
  const primary = themePrimary && HEX_RE.test(themePrimary) ? themePrimary : "#22503a";
  const accent = themeAccent && HEX_RE.test(themeAccent) ? themeAccent : "#b8923f";

  const productById = useMemo(() => new Map(data.products.map((p) => [p.id, p])), [data.products]);
  const cover = useMemo(() => data.products.find((p) => p.image_url)?.image_url ?? null, [data.products]);

  // Secciones con sus platillos ya ordenados. Los que no tienen categoría van en «Otros».
  const sections = useMemo(() => {
    const sorted = [...data.products].sort((a, b) => a.sort_order - b.sort_order);
    const list: { id: string; name: I18nText | null; prods: MenuPayload["products"] }[] = [...data.categories]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((c) => ({ id: c.id, name: c.name_i18n, prods: sorted.filter((p) => p.category_id === c.id) }));
    const otros = sorted.filter((p) => !p.category_id);
    if (otros.length) list.push({ id: OTROS, name: null, prods: otros });
    return list.filter((s) => s.prods.length > 0);
  }, [data.categories, data.products]);
  const sectionName = (s: { name: I18nText | null }) => (s.name ? t(s.name, lang) : d.otherCategory);

  const [activeCat, setActiveCat] = useState<string>(sections[0]?.id ?? "");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Scroll-spy: resalta la categoría activa según lo que se ve.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveCat((visible[0].target as HTMLElement).dataset.cat || "");
      },
      { rootMargin: "-140px 0px -55% 0px", threshold: [0, 0.25, 0.6] }
    );
    Object.values(sectionRefs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [sections.length]);

  // Carrito guardado por mesa en la pestaña: si la red falla y la persona recarga, no lo
  // pierde (AA-2). Solo en /m/ con pedidos; la demo y las Cartas no guardan nada.
  const storageKey = ordering && !demo && token ? `datafud:carrito:${slug}:${token}` : null;
  // Estado y no ref: el guardado espera al render que ya trae el carrito restaurado, así no
  // borra lo guardado en el primer commit.
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    if (!storageKey || restored) return;
    try {
      const raw = window.sessionStorage.getItem(storageKey);
      if (raw) {
        const saved = cleanCart(JSON.parse(raw), (id) => productById.has(id));
        if (Object.keys(saved).length) setCart(saved);
      }
      // La nota para la cocina se guarda junto al carrito, con la misma vida.
      const savedNote = window.sessionStorage.getItem(`${storageKey}:nota`);
      if (savedNote) setNote(savedNote.slice(0, NOTE_MAX));
    } catch {
      // Sin almacenamiento (modo privado o bloqueado): la carta funciona igual.
    }
    setRestored(true);
  }, [storageKey, restored, productById]);
  useEffect(() => {
    if (!storageKey || !restored) return;
    try {
      if (Object.keys(cart).length) window.sessionStorage.setItem(storageKey, JSON.stringify(cart));
      else window.sessionStorage.removeItem(storageKey);
      if (note) window.sessionStorage.setItem(`${storageKey}:nota`, note);
      else window.sessionStorage.removeItem(`${storageKey}:nota`);
    } catch {
      // Igual que arriba.
    }
  }, [storageKey, restored, cart, note]);

  // Cuando la carta se vuelve a cargar (algo se agotó), sale del carrito lo que ya no está y se
  // le avisa al comensal (AA-15).
  // El carrito solo recibe ids de la carta (agregar o restaurar filtrado), así que esto solo
  // se dispara después de un `router.refresh()` que trajo menos platillos.
  useEffect(() => {
    if (Object.keys(cart).every((id) => productById.has(id))) return;
    setCart(cleanCart(cart, (id) => productById.has(id)));
    setItemsRemoved(true);
  }, [cart, productById]);

  // El idioma de la página sigue al de la carta: el lector de pantalla lee el inglés con voz
  // inglesa (AA-24). El layout raíz sale con "es"; al desmontar se devuelve lo que había.
  useEffect(() => {
    const html = document.documentElement;
    const previous = html.lang;
    html.lang = lang;
    return () => {
      html.lang = previous;
    };
  }, [lang]);

  const closeCart = () => {
    setCartOpen(false);
    setError(null);
    setItemsRemoved(false);
  };

  // Hoja del carrito como diálogo modal: bloquea el scroll de atrás, se cierra con Escape, el
  // Tab no sale de la hoja y al cerrar el foco vuelve a donde estaba («Tu orden»).
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeCartRef = useRef(closeCart);
  closeCartRef.current = closeCart;
  // El origen se toma al abrir, antes de que el autoFocus de Cerrar mueva el foco. La barra
  // «Tu orden» se desmonta mientras la hoja está abierta y vuelve como otro nodo: por eso, si el
  // origen ya no está en el documento, el foco va a la barra nueva por su ref.
  const openerRef = useRef<HTMLElement | null>(null);
  const cartBarRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const openCart = () => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setCartOpen(true);
  };
  useEffect(() => {
    if (cartOpen) {
      wasOpen.current = true;
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    // Tras enviar no hay a dónde volver: la confirmación toma el foco sola.
    const opener = openerRef.current;
    openerRef.current = null;
    if (opener?.isConnected) opener.focus();
    else cartBarRef.current?.focus();
  }, [cartOpen]);
  useEffect(() => {
    if (!cartOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeCartRef.current();
        return;
      }
      if (e.key !== "Tab" || !sheetRef.current) return;
      const focusables = Array.from(
        sheetRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex='-1'])")
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const inside = sheetRef.current.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [cartOpen]);

  // La confirmación reemplaza toda la carta: el foco va a su título para que se anuncie.
  const sentTitleRef = useRef<HTMLHeadingElement>(null);
  const hasSent = sent !== null;
  useEffect(() => {
    if (hasSent) sentTitleRef.current?.focus();
  }, [hasSent]);

  const add = (id: string) =>
    setCart((c) => {
      if (!(id in c) && Object.keys(c).length >= MAX_LINES) return c;
      return { ...c, [id]: Math.min(MAX_QTY, (c[id] ?? 0) + 1) };
    });
  const remove = (id: string) =>
    setCart((c) => {
      const n = (c[id] ?? 0) - 1;
      const next = { ...c };
      if (n <= 0) delete next[id];
      else next[id] = n;
      return next;
    });

  const lines: CartLine[] = Object.entries(cart).map(([product_id, quantity]) => ({ product_id, quantity }));
  const total = lines.reduce((s, l) => { const p = productById.get(l.product_id); return s + (p ? Number(p.price) * l.quantity : 0); }, 0);
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  const label = data.table.label ? tableName(data.table.label, d) : "";

  const scrollToCat = (id: string) => {
    setActiveCat(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Un envío = una referencia: la misma mientras los platillos y las cantidades no cambien,
  // también si la red falla o la persona recarga la página (se guarda junto al carrito y la nota).
  // Así un reintento de una orden que sí llegó devuelve esa orden. La nota no cuenta: retocarla
  // antes de reintentar no debe crear otra orden. Es otro envío si cambian los platillos, si
  // pasaron CLIENT_REF_TTL_MS desde el primer intento, si el carrito se vació o si la orden entró.
  const envioKey = storageKey ? `${storageKey}:envio` : null;
  const clientRefFor = (sig: string): string => {
    const now = Date.now();
    let saved: unknown = envioRef.current;
    if (!saved && envioKey) {
      try {
        const raw = window.sessionStorage.getItem(envioKey);
        if (raw) saved = JSON.parse(raw);
      } catch {
        // Sin almacenamiento: la referencia vive solo en memoria.
      }
    }
    if (envioVigente(saved, sig, now)) {
      envioRef.current = saved;
      return saved.ref;
    }
    const next: Envio = { sig, ref: newClientRef(), createdAt: now };
    envioRef.current = next;
    try {
      if (envioKey) window.sessionStorage.setItem(envioKey, JSON.stringify(next));
    } catch {
      // Igual que arriba.
    }
    return next.ref;
  };
  const clearClientRef = () => {
    envioRef.current = null;
    try {
      if (envioKey) window.sessionStorage.removeItem(envioKey);
    } catch {
      // Igual que arriba.
    }
  };

  // Carrito vacío (lo vaciaron o la orden entró): la referencia guardada ya no corresponde a nada.
  const cartEmpty = Object.keys(cart).length === 0;
  useEffect(() => {
    if (!restored || !cartEmpty) return;
    envioRef.current = null;
    try {
      if (envioKey) window.sessionStorage.removeItem(envioKey);
    } catch {
      // Igual que arriba.
    }
  }, [restored, cartEmpty, envioKey]);

  const finish = () => {
    setSent({ lines, total });
    setCartOpen(false);
    setCart({});
    setNote("");
    setError(null);
    setItemsRemoved(false);
  };

  async function submit() {
    if (lines.length === 0 || sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    setError(null);
    setItemsRemoved(false);
    try {
      if (demo) {
        await new Promise((r) => setTimeout(r, 700));
        finish();
        return;
      }
      const sorted = [...lines].sort((a, b) => a.product_id.localeCompare(b.product_id));
      const clientRef = clientRefFor(JSON.stringify(sorted));
      let timer: ReturnType<typeof setTimeout> | undefined;
      const res = await Promise.race([
        placeOrder(slug, token, lines, note, clientRef),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error("timeout")), SEND_TIMEOUT_MS);
        }),
      ]).finally(() => clearTimeout(timer));
      if ("orderId" in res) {
        clearClientRef();
        finish();
      } else {
        setError(res.error);
        // Algo se agotó: se vuelve a pedir la carta y el efecto de arriba limpia el carrito.
        if (res.error === "items_unavailable") router.refresh();
      }
    } catch {
      // Sin red, sin respuesta a tiempo, o la carta quedó abierta desde antes de un deploy. El
      // carrito y la referencia se quedan: reintentar no duplica la orden.
      setError("send_failed");
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  // ── Pantalla de confirmación ──────────────────────────────
  if (sent) {
    return (
      <div lang={lang} className="flex min-h-screen flex-col items-center justify-center bg-cream-50 px-6 py-10 text-center">
        <div
          className="flex h-20 w-20 animate-[scale-in_0.5s_cubic-bezier(0.23,1,0.32,1)_both] items-center justify-center rounded-full text-white shadow-lg"
          style={{ backgroundColor: primary }}
        >
          <Icon name="check" size={38} />
        </div>
        <h1 ref={sentTitleRef} tabIndex={-1} className="mt-7 font-display text-3xl text-brand-900 focus:outline-none">
          {demo ? d.orderSentDemo : d.orderSent}
        </h1>
        <p className="mt-3 text-sm text-stone-600 [overflow-wrap:anywhere]">
          {data.settings.restaurant_name}
          {label ? ` · ${label}` : ""}
        </p>
        <section aria-labelledby="carta-resumen" className="mt-7 w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-4 text-left">
          <h2 id="carta-resumen" className="text-xs font-bold uppercase tracking-widest text-stone-600">{d.orderSummary}</h2>
          <ul className="mt-3 space-y-2">
            {sent.lines.map((l) => {
              const p = productById.get(l.product_id);
              if (!p) return null;
              return (
                <li key={l.product_id} className="flex items-baseline justify-between gap-3 text-sm text-brand-900">
                  <span className="min-w-0 [overflow-wrap:anywhere]">
                    <span className="font-bold tabular-nums">{l.quantity} ×</span> {t(p.name_i18n, lang)}
                  </span>
                  <span className="shrink-0 tabular-nums">{formatMoney(Number(p.price) * l.quantity, currency, undefined, lang)}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex items-baseline justify-between border-t border-stone-200 pt-3 font-bold text-brand-900">
            <span>{d.total}</span>
            <span className="font-display text-lg" style={{ color: primary }}>{formatMoney(sent.total, currency, undefined, lang)}</span>
          </div>
        </section>
        {!demo && <p className="mt-4 max-w-sm text-sm text-stone-600">{d.orderChangeHint}</p>}
        <button
          onClick={() => setSent(null)}
          className="mt-8 inline-flex h-12 items-center justify-center rounded-xl px-7 text-sm font-bold uppercase tracking-widest text-white shadow-sm transition-transform duration-200 active:scale-[0.98]"
          style={{ backgroundColor: primary }}
        >
          {d.menu}
        </button>
      </div>
    );
  }

  return (
    <div lang={lang} className="min-h-screen bg-cream-50 pb-28">
      {/* ── Header inmersivo ────────────────────────────────
          El color del local viaja también como variable CSS: la hoja de impresión la necesita
          para pintar la cabecera opaca, y desde CSS no se puede leer el color de un degradado. */}
      <header
        data-carta-cabecera
        style={{ "--carta-primary": primary } as CSSProperties}
        className="relative isolate overflow-hidden"
      >
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover blur-[2px]" />
        )}
        <div data-carta-fondo className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${primary}f2, ${primary}cc 55%, ${primary}f7)` }} />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        />
        <div className="relative mx-auto flex max-w-2xl flex-col px-5 pb-7 pt-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {/* Logo del local (D-042). La tarjeta del plan Carta promete "carta a tu marca:
                  colores, logo y fotos": sin esto, el logo viajaba en el payload y no se pintaba.
                  Va sobre fondo blanco porque la mayoría son PNG con transparencia hechos para
                  fondo claro, y sobre la cabecera oscura desaparecerían. */}
              {data.settings.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.settings.logo_url}
                  alt={data.settings.restaurant_name}
                  width={52}
                  height={52}
                  className="h-[52px] w-[52px] flex-shrink-0 rounded-xl bg-white object-contain p-1.5 shadow-sm"
                />
              )}
              <span className="inline-flex min-w-0 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/90">
                <Icon name="qr" size={12} />
                <span className="min-w-0 truncate">{label ? `${d.menu} · ${label}` : d.menu}</span>
              </span>
            </div>
            {langs.length > 1 && (
              <div data-carta-idiomas className="flex gap-1 rounded-full bg-white/15 p-1">
                {langs.map((l) => (
                  <button
                    key={l}
                    lang={l}
                    onClick={() => setLang(l)}
                    // El texto visible es "es"/"en": sin esto un lector de pantalla no dice qué
                    // idioma es ni cuál está activo.
                    aria-label={LANG_NAMES[l] ?? l}
                    aria-pressed={lang === l}
                    className={`flex min-h-11 min-w-11 items-center justify-center rounded-full px-2.5 text-[11px] font-bold uppercase transition-colors duration-200 ${lang === l ? "bg-white text-brand-900" : "text-white/80"}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
          <h1 className="mt-8 font-display text-4xl leading-tight text-white [overflow-wrap:anywhere] sm:text-5xl">
            {data.settings.restaurant_name}
          </h1>
          <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-white/75">
            {ordering ? d.orderingTagline : t(tagline, lang) || d.cartaTagline}
          </p>
        </div>
      </header>

      {/* ── Chips de categoría (sticky scroll-spy) ────────── */}
      <nav
        data-carta-nav
        className="sticky z-30 border-b border-stone-200/70 bg-cream-50"
        style={{ top: demo ? 41 : 0 }}
      >
        <div className="mx-auto flex max-w-2xl gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((cat) => {
            const on = activeCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => scrollToCat(cat.id)}
                className="flex min-h-11 shrink-0 items-center rounded-full border px-4 text-xs font-bold uppercase tracking-wider transition-colors duration-200"
                style={on
                  ? { backgroundColor: primary, borderColor: primary, color: "#fff" }
                  : { backgroundColor: "transparent", borderColor: "#dedbd9", color: "#1b4030" }}
              >
                {sectionName(cat)}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Secciones del menú ────────────────────────────── */}
      <main className="mx-auto max-w-2xl px-5 py-7">
        {sections.length === 0 && (
          <p className="py-16 text-center text-sm text-stone-600">{d.emptyMenu}</p>
        )}
        {sections.map((cat, catIndex) => (
          <section
            key={cat.id}
            data-cat={cat.id}
            data-carta-seccion={catIndex}
            ref={(el) => { sectionRefs.current[cat.id] = el; }}
            className="mb-10 scroll-mt-20"
          >
            <div className="mb-4 flex items-baseline gap-3">
              <h2 className="min-w-0 font-display text-2xl text-brand-900 [overflow-wrap:anywhere]">{sectionName(cat)}</h2>
              <span className="h-px flex-1 bg-stone-200" />
              <span className="text-xs font-bold uppercase tracking-widest text-stone-600">{cat.prods.length}</span>
            </div>
            <div className="grid gap-3">
              {cat.prods.map((p) => {
                const qty = cart[p.id] ?? 0;
                const name = t(p.name_i18n, lang);
                const desc = t(p.description_i18n, lang);
                return (
                  <article
                    key={p.id}
                    className="group flex gap-4 overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-3 transition-shadow duration-300 hover:shadow-[0_12px_32px_-16px_rgba(34,80,58,0.35)]"
                  >
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-cream-100">
                      {p.image_url ? (
                        // Solo la primera categoría carga de una: es lo que se ve al abrir.
                        // El resto espera a que el comensal baje, que es como se lee una carta.
                        // width/height son los del contenedor (h-24 w-24): reservan el hueco y
                        // la tarjeta no salta cuando entra la foto.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image_url}
                          alt={name}
                          width={96}
                          height={96}
                          loading={catIndex === 0 ? "eager" : "lazy"}
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center" style={{ color: primary }}>
                          <Icon name="utensils" size={26} />
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="font-bold leading-tight text-brand-900 [overflow-wrap:anywhere]">{name}</p>
                      {desc && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-600 [overflow-wrap:anywhere]">{desc}</p>}
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                        <span className="font-display text-lg" style={{ color: primary }}>{formatMoney(Number(p.price), currency, undefined, lang)}</span>
                        {!ordering ? null : qty === 0 ? (
                          <button
                            onClick={() => add(p.id)}
                            aria-label={`${d.addToOrder}: ${name}`}
                            className="inline-flex h-11 items-center gap-1.5 rounded-lg px-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-transform duration-200 active:scale-95"
                            style={{ backgroundColor: primary }}
                          >
                            <Icon name="plus" size={14} /> {d.addToOrder}
                          </button>
                        ) : (
                          <QtyStepper
                            qty={qty}
                            name={name}
                            d={d}
                            accent={accent}
                            onAdd={() => add(p.id)}
                            onRemove={() => remove(p.id)}
                            className="bg-cream-50"
                          />
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        <footer className="pt-6 text-center text-[11px] font-semibold uppercase tracking-widest text-stone-600">
          {d.poweredBy} DataFud
        </footer>
      </main>

      {/* ── Barra flotante "ver pedido" ───────────────────── */}
      {ordering && count > 0 && !cartOpen && (
        <div className="fixed inset-x-0 bottom-0 z-30 p-4">
          <button
            ref={cartBarRef}
            onClick={openCart}
            className="mx-auto flex w-full max-w-2xl items-center justify-between rounded-2xl px-5 py-4 font-bold text-white shadow-[0_16px_40px_-12px_rgba(17,42,32,0.6)] transition-transform duration-200 active:scale-[0.99]"
            style={{ backgroundColor: primary }}
          >
            <span className="flex items-center gap-3">
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm tabular-nums" style={{ backgroundColor: accent }}>{count}</span>
              <span className="text-sm uppercase tracking-widest">{d.yourOrder}</span>
            </span>
            <span className="font-display text-lg">{formatMoney(total, currency, undefined, lang)}</span>
          </button>
        </div>
      )}

      {/* ── Hoja del carrito (bottom sheet) ───────────────── */}
      {ordering && cartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 animate-[fade-in_0.25s_ease] bg-brand-950/60" onClick={closeCart} />
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="carta-hoja-titulo"
            className="absolute inset-x-0 bottom-0 mx-auto max-w-2xl rounded-t-3xl bg-cream-50 shadow-2xl animate-[fade-up_0.3s_cubic-bezier(0.23,1,0.32,1)_both]"
          >
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
              <h2 id="carta-hoja-titulo" className="font-display text-xl text-brand-900">{d.yourOrder}</h2>
              <button
                onClick={closeCart}
                aria-label={d.close}
                autoFocus
                className="flex h-11 w-11 items-center justify-center rounded-lg text-brand-700 transition-colors hover:bg-stone-100"
              >
                <Icon name="x" size={20} />
              </button>
            </div>

            <div className="max-h-[42vh] overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                <p className="py-8 text-center text-sm text-stone-600">{d.emptyOrder}</p>
              ) : (
                <ul className="space-y-3">
                  {lines.map((l) => {
                    const p = productById.get(l.product_id);
                    if (!p) return null;
                    const name = t(p.name_i18n, lang);
                    return (
                      <li key={l.product_id} className="flex items-center gap-3">
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-cream-100">
                          {p.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image_url} alt="" width={56} height={56} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-brand-900">{name}</p>
                          <p className="text-xs text-stone-600">{formatMoney(Number(p.price), currency, undefined, lang)}</p>
                        </div>
                        <QtyStepper
                          qty={l.quantity}
                          name={name}
                          d={d}
                          accent={accent}
                          onAdd={() => add(l.product_id)}
                          onRemove={() => remove(l.product_id)}
                          className="bg-white"
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-t border-stone-200 px-5 pb-6 pt-4">
              {/* Errores en la hoja y en el idioma del comensal, sin alert() (AA-14). */}
              {(error || itemsRemoved) && (
                <div role="alert" className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm leading-relaxed text-rose-800">
                  {error && <p>{errors[error]}</p>}
                  {itemsRemoved && <p className={error ? "mt-1" : undefined}>{d.itemsRemoved}</p>}
                </div>
              )}
              <label htmlFor="carta-nota" className="sr-only">{d.note}</label>
              <input
                id="carta-nota"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={d.note}
                maxLength={NOTE_MAX}
                aria-describedby={note.length > NOTE_MAX - 40 ? "carta-nota-limite" : undefined}
                className="mb-3 h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-brand-900 placeholder:text-stone-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
              {note.length > NOTE_MAX - 40 && (
                <p id="carta-nota-limite" className="-mt-2 mb-3 text-xs text-stone-600">
                  {d.noteLimit} <span className="tabular-nums">{note.length}/{NOTE_MAX}</span>
                </p>
              )}
              <button
                onClick={submit}
                disabled={sending || lines.length === 0}
                aria-busy={sending}
                className="flex w-full items-center justify-between rounded-2xl px-5 py-4 font-bold text-white shadow-sm transition-transform duration-200 active:scale-[0.99] disabled:opacity-60"
                style={{ backgroundColor: primary }}
              >
                <span className="text-sm uppercase tracking-widest">{sending ? d.sending : d.sendOrder}</span>
                <span className="font-display text-lg">{formatMoney(total, currency, undefined, lang)}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Botones de cantidad: 44 px para el pulgar en la mesa y con el nombre del platillo para el
// lector de pantalla («Quitar uno: Casado», no «menos») (AA-16).
function QtyStepper({
  qty,
  name,
  d,
  accent,
  onAdd,
  onRemove,
  className,
}: {
  qty: number;
  name: string;
  d: Dict;
  accent: string;
  onAdd: () => void;
  onRemove: () => void;
  className: string;
}) {
  return (
    <div className={`flex shrink-0 items-center gap-1 rounded-xl border border-stone-200 p-0.5 ${className}`}>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${d.removeOne}: ${name}`}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-brand-800 transition-colors hover:bg-stone-100"
      >
        <Icon name="minus" size={18} strokeWidth={2} />
      </button>
      <span className="min-w-6 text-center text-sm font-bold tabular-nums text-brand-900">
        {qty}
        <span className="sr-only"> {d.inOrder}</span>
      </span>
      <button
        type="button"
        onClick={onAdd}
        disabled={qty >= MAX_QTY}
        aria-label={`${d.addOne}: ${name}`}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-white disabled:opacity-50"
        style={{ backgroundColor: accent }}
      >
        <Icon name="plus" size={18} />
      </button>
    </div>
  );
}
