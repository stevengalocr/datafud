"use client";

import { useMemo, useState } from "react";
import { placeOrder, type CartLine } from "./actions";
import { getDict, t } from "@/lib/i18n/dictionaries";
import { formatMoney } from "@/lib/currency/format";
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
}: {
  data: MenuPayload;
  slug: string;
  token: string;
}) {
  const langs = data.settings.enabled_languages?.length
    ? data.settings.enabled_languages
    : ["es" as Lang];
  const [lang, setLang] = useState<Lang>(
    (data.settings.default_language as Lang) ?? "es"
  );
  const [cart, setCart] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const d = getDict(lang);
  const currency = data.settings.currency_code;
  const primary = data.settings.theme?.primary || "#22503a";
  const accent = data.settings.theme?.accent || "#b8923f";

  const productById = useMemo(
    () => new Map(data.products.map((p) => [p.id, p])),
    [data.products]
  );

  const add = (id: string) =>
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const remove = (id: string) =>
    setCart((c) => {
      const n = (c[id] ?? 0) - 1;
      const next = { ...c };
      if (n <= 0) delete next[id];
      else next[id] = n;
      return next;
    });

  const lines: CartLine[] = Object.entries(cart).map(([product_id, quantity]) => ({
    product_id,
    quantity,
  }));
  const total = lines.reduce((s, l) => {
    const p = productById.get(l.product_id);
    return s + (p ? Number(p.price) * l.quantity : 0);
  }, 0);
  const count = lines.reduce((s, l) => s + l.quantity, 0);

  async function submit() {
    if (lines.length === 0) return;
    setSending(true);
    const res = await placeOrder(slug, token, lines, note);
    setSending(false);
    if ("orderId" in res) {
      setDone(true);
      setCart({});
      setNote("");
    } else {
      alert(res.error);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-3xl text-white"
          style={{ backgroundColor: primary }}
        >
          ✓
        </div>
        <h1 className="mt-5 text-xl font-bold text-slate-900">{d.orderSent}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {data.settings.restaurant_name} · {d.table} {data.table.label}
        </p>
        <button
          onClick={() => setDone(false)}
          className="mt-6 rounded-lg px-5 py-2.5 text-sm font-medium text-white"
          style={{ backgroundColor: primary }}
        >
          {d.menu}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <header
        className="px-5 py-6 text-white"
        style={{ background: `linear-gradient(135deg, ${primary}, ${primary}dd)` }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div>
            <p className="text-lg font-bold">{data.settings.restaurant_name}</p>
            <p className="text-sm opacity-90">
              {d.table} {data.table.label}
            </p>
          </div>
          {langs.length > 1 && (
            <div className="flex gap-1 rounded-full bg-white/15 p-1">
              {langs.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium uppercase ${
                    lang === l ? "bg-white text-slate-900" : "text-white"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Menú por categoría */}
      <main className="mx-auto max-w-2xl px-5 py-6">
        {data.categories.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">
            {d.emptyOrder}
          </p>
        )}
        {data.categories.map((cat) => {
          const prods = data.products.filter((p) => p.category_id === cat.id);
          if (prods.length === 0) return null;
          return (
            <section key={cat.id} className="mb-8">
              <h2 className="mb-3 text-lg font-bold text-slate-900">
                {t(cat.name_i18n, lang)}
              </h2>
              <div className="space-y-3">
                {prods.map((p) => {
                  const qty = cart[p.id] ?? 0;
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                    >
                      {p.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image_url}
                          alt={t(p.name_i18n, lang)}
                          className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900">
                          {t(p.name_i18n, lang)}
                        </p>
                        {t(p.description_i18n, lang) && (
                          <p className="line-clamp-2 text-xs text-slate-500">
                            {t(p.description_i18n, lang)}
                          </p>
                        )}
                        <p className="mt-1 text-sm font-semibold" style={{ color: primary }}>
                          {formatMoney(Number(p.price), currency)}
                        </p>
                      </div>
                      {qty === 0 ? (
                        <button
                          onClick={() => add(p.id)}
                          className="flex-shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-white"
                          style={{ backgroundColor: primary }}
                        >
                          {d.addToOrder}
                        </button>
                      ) : (
                        <div className="flex flex-shrink-0 items-center gap-2">
                          <button
                            onClick={() => remove(p.id)}
                            className="h-7 w-7 rounded-full border border-slate-200 text-slate-700"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-sm font-semibold">
                            {qty}
                          </span>
                          <button
                            onClick={() => add(p.id)}
                            className="h-7 w-7 rounded-full text-white"
                            style={{ backgroundColor: accent }}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      {/* Barra de orden */}
      {count > 0 && (
        <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white p-4 shadow-lg">
          <div className="mx-auto max-w-2xl">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={d.note}
              className="mb-3 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <button
              onClick={submit}
              disabled={sending}
              className="flex w-full items-center justify-between rounded-xl px-5 py-3 font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: primary }}
            >
              <span>
                {sending ? d.sending : d.sendOrder} · {count}
              </span>
              <span>{formatMoney(total, currency)}</span>
            </button>
          </div>
        </div>
      )}

      <footer className="px-5 py-6 text-center text-xs text-slate-400">
        {getDict(lang).poweredBy} DataFud
      </footer>
    </div>
  );
}
