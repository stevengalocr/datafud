"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { placeOrder, type CartLine } from "./actions";
import { getDict, t } from "@/lib/i18n/dictionaries";
import { formatMoney } from "@/lib/currency/format";
import { Icon } from "@/components/ui/icon";
import type { I18nText, Lang } from "@/lib/supabase/types";

export interface MenuPayload {
  tenant: { id: string; name: string; slug: string };
  table: { id: string; label: string };
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

export function MenuClient({
  data,
  slug,
  token,
  demo = false,
}: {
  data: MenuPayload;
  slug: string;
  token: string;
  demo?: boolean;
}) {
  const langs = data.settings.enabled_languages?.length
    ? data.settings.enabled_languages
    : (["es"] as Lang[]);
  const [lang, setLang] = useState<Lang>((data.settings.default_language as Lang) ?? "es");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCat, setActiveCat] = useState<string>(data.categories[0]?.id ?? "");

  const d = getDict(lang);
  const currency = data.settings.currency_code;
  const primary = data.settings.theme?.primary || "#22503a";
  const accent = data.settings.theme?.accent || "#b8923f";

  const productById = useMemo(() => new Map(data.products.map((p) => [p.id, p])), [data.products]);
  const cover = useMemo(() => data.products.find((p) => p.image_url)?.image_url ?? null, [data.products]);
  const orderedCats = useMemo(
    () => [...data.categories].sort((a, b) => a.sort_order - b.sort_order).filter((c) => data.products.some((p) => p.category_id === c.id)),
    [data.categories, data.products]
  );

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
  }, [orderedCats.length]);

  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen]);

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
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

  const scrollToCat = (id: string) => {
    setActiveCat(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  async function submit() {
    if (lines.length === 0) return;
    setSending(true);
    if (demo) {
      await new Promise((r) => setTimeout(r, 700));
      setSending(false);
      setDone(true);
      setCartOpen(false);
      setCart({});
      setNote("");
      return;
    }
    const res = await placeOrder(slug, token, lines, note);
    setSending(false);
    if ("orderId" in res) {
      setDone(true);
      setCartOpen(false);
      setCart({});
      setNote("");
    } else {
      alert(res.error);
    }
  }

  // ── Pantalla de confirmación ──────────────────────────────
  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream-50 px-6 text-center">
        <div
          className="flex h-20 w-20 animate-[scale-in_0.5s_cubic-bezier(0.23,1,0.32,1)_both] items-center justify-center rounded-full text-white shadow-lg"
          style={{ backgroundColor: primary }}
        >
          <Icon name="check" size={38} />
        </div>
        <h1 className="mt-7 font-display text-3xl text-brand-900">{d.orderSent}</h1>
        <p className="mt-3 text-sm text-brand-700/70">
          {data.settings.restaurant_name} · {d.table} {data.table.label}
        </p>
        <button
          onClick={() => setDone(false)}
          className="mt-8 inline-flex h-12 items-center justify-center rounded-xl px-7 text-sm font-bold uppercase tracking-widest text-white shadow-sm transition-transform duration-200 active:scale-[0.98]"
          style={{ backgroundColor: primary }}
        >
          {d.menu}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 pb-28">
      {/* ── Header inmersivo ──────────────────────────────── */}
      <header className="relative isolate overflow-hidden">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover blur-[2px]" />
        )}
        <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${primary}f2, ${primary}cc 55%, ${primary}f7)` }} />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        />
        <div className="relative mx-auto flex max-w-2xl flex-col px-5 pb-7 pt-8">
          <div className="flex items-start justify-between gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
              <Icon name="qr" size={12} /> {d.menu} · {d.table} {data.table.label}
            </span>
            {langs.length > 1 && (
              <div className="flex gap-1 rounded-full bg-white/15 p-1 backdrop-blur-sm">
                {langs.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase transition-colors duration-200 ${lang === l ? "bg-white text-brand-900" : "text-white/80"}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
          <h1 className="mt-8 font-display text-4xl leading-tight text-white sm:text-5xl">
            {data.settings.restaurant_name}
          </h1>
          <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-white/75">
            Pedí directo desde tu mesa. Tu orden llega al instante a la cocina.
          </p>
        </div>
      </header>

      {/* ── Chips de categoría (sticky scroll-spy) ────────── */}
      <nav
        className="sticky z-30 border-b border-stone-200/70 bg-cream-50/90 backdrop-blur-md"
        style={{ top: demo ? 41 : 0 }}
      >
        <div className="mx-auto flex max-w-2xl gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {orderedCats.map((cat) => {
            const on = activeCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => scrollToCat(cat.id)}
                className="shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-200"
                style={on
                  ? { backgroundColor: primary, borderColor: primary, color: "#fff" }
                  : { backgroundColor: "transparent", borderColor: "#dedbd9", color: "#1b4030" }}
              >
                {t(cat.name_i18n, lang)}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Secciones del menú ────────────────────────────── */}
      <main className="mx-auto max-w-2xl px-5 py-7">
        {orderedCats.length === 0 && (
          <p className="py-16 text-center text-sm text-brand-700/50">{d.emptyOrder}</p>
        )}
        {orderedCats.map((cat) => {
          const prods = data.products
            .filter((p) => p.category_id === cat.id)
            .sort((a, b) => a.sort_order - b.sort_order);
          if (prods.length === 0) return null;
          return (
            <section
              key={cat.id}
              data-cat={cat.id}
              ref={(el) => { sectionRefs.current[cat.id] = el; }}
              className="mb-10 scroll-mt-20"
            >
              <div className="mb-4 flex items-baseline gap-3">
                <h2 className="font-display text-2xl text-brand-900">{t(cat.name_i18n, lang)}</h2>
                <span className="h-px flex-1 bg-stone-200" />
                <span className="text-xs font-bold uppercase tracking-widest text-brand-700/40">{prods.length}</span>
              </div>
              <div className="grid gap-3">
                {prods.map((p) => {
                  const qty = cart[p.id] ?? 0;
                  const desc = t(p.description_i18n, lang);
                  return (
                    <article
                      key={p.id}
                      className="group flex gap-4 overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-3 transition-shadow duration-300 hover:shadow-[0_12px_32px_-16px_rgba(34,80,58,0.35)]"
                    >
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-cream-100">
                        {p.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image_url} alt={t(p.name_i18n, lang)} className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center" style={{ color: primary }}>
                            <Icon name="utensils" size={26} />
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="font-bold leading-tight text-brand-900">{t(p.name_i18n, lang)}</p>
                        {desc && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-brand-700/65">{desc}</p>}
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <span className="font-display text-lg" style={{ color: primary }}>{formatMoney(Number(p.price), currency)}</span>
                          {qty === 0 ? (
                            <button
                              onClick={() => add(p.id)}
                              aria-label={`${d.addToOrder} ${t(p.name_i18n, lang)}`}
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-transform duration-200 active:scale-95"
                              style={{ backgroundColor: primary }}
                            >
                              <Icon name="plus" size={14} /> {d.addToOrder}
                            </button>
                          ) : (
                            <div className="flex items-center gap-2.5 rounded-lg border border-stone-200 bg-cream-50 p-1">
                              <button onClick={() => remove(p.id)} aria-label="−" className="flex h-7 w-7 items-center justify-center rounded-md text-brand-800 transition-colors hover:bg-stone-100">−</button>
                              <span className="w-4 text-center text-sm font-bold tabular-nums text-brand-900">{qty}</span>
                              <button onClick={() => add(p.id)} aria-label="+" className="flex h-7 w-7 items-center justify-center rounded-md text-white" style={{ backgroundColor: accent }}>+</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}

        <footer className="pt-6 text-center text-[11px] font-semibold uppercase tracking-widest text-brand-700/40">
          {d.poweredBy} DataFud
        </footer>
      </main>

      {/* ── Barra flotante "ver pedido" ───────────────────── */}
      {count > 0 && !cartOpen && (
        <div className="fixed inset-x-0 bottom-0 z-30 p-4">
          <button
            onClick={() => setCartOpen(true)}
            className="mx-auto flex w-full max-w-2xl items-center justify-between rounded-2xl px-5 py-4 font-bold text-white shadow-[0_16px_40px_-12px_rgba(17,42,32,0.6)] transition-transform duration-200 active:scale-[0.99]"
            style={{ backgroundColor: primary }}
          >
            <span className="flex items-center gap-3">
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm tabular-nums" style={{ backgroundColor: accent }}>{count}</span>
              <span className="text-sm uppercase tracking-widest">{d.yourOrder}</span>
            </span>
            <span className="font-display text-lg">{formatMoney(total, currency)}</span>
          </button>
        </div>
      )}

      {/* ── Hoja del carrito (bottom sheet) ───────────────── */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-brand-950/50 animate-[fade-in_0.25s_ease] backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-2xl rounded-t-3xl bg-cream-50 shadow-2xl animate-[fade-up_0.3s_cubic-bezier(0.23,1,0.32,1)_both]">
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
              <h3 className="font-display text-xl text-brand-900">{d.yourOrder}</h3>
              <button onClick={() => setCartOpen(false)} aria-label="Cerrar" className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-700 transition-colors hover:bg-stone-100">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>

            <div className="max-h-[42vh] overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                <p className="py-8 text-center text-sm text-brand-700/50">{d.emptyOrder}</p>
              ) : (
                <ul className="space-y-3">
                  {lines.map((l) => {
                    const p = productById.get(l.product_id);
                    if (!p) return null;
                    return (
                      <li key={l.product_id} className="flex items-center gap-3">
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-cream-100">
                          {p.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-brand-900">{t(p.name_i18n, lang)}</p>
                          <p className="text-xs text-brand-700/60">{formatMoney(Number(p.price), currency)}</p>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-lg border border-stone-200 bg-white p-1">
                          <button onClick={() => remove(l.product_id)} aria-label="−" className="flex h-7 w-7 items-center justify-center rounded-md text-brand-800 hover:bg-stone-100">−</button>
                          <span className="w-4 text-center text-sm font-bold tabular-nums">{l.quantity}</span>
                          <button onClick={() => add(l.product_id)} aria-label="+" className="flex h-7 w-7 items-center justify-center rounded-md text-white" style={{ backgroundColor: accent }}>+</button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-t border-stone-200 px-5 pb-6 pt-4">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={d.note}
                className="mb-3 h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-brand-900 placeholder:text-brand-700/40 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
              <button
                onClick={submit}
                disabled={sending || lines.length === 0}
                className="flex w-full items-center justify-between rounded-2xl px-5 py-4 font-bold text-white shadow-sm transition-transform duration-200 active:scale-[0.99] disabled:opacity-60"
                style={{ backgroundColor: primary }}
              >
                <span className="text-sm uppercase tracking-widest">{sending ? d.sending : d.sendOrder}</span>
                <span className="font-display text-lg">{formatMoney(total, currency)}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
