import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { dict } from "@/lib/i18n/dictionaries";
import { RESTAURANT, mockProducts, mockCategories } from "@/lib/demo/mock";
import { formatCrc } from "@/lib/currency/format";

// La carta de la demo (Soda Verde Limón) dentro de un marco de teléfono: la misma composición
// estática que usa la sección #demo y que cierra la portada al «escanear». Plan Carta: sin
// carrito, sin barra de orden y sin mesa. Decorativo (aria-hidden): la demo real vive en /preview.
const SAMPLE_IDS = ["p-casado", "p-gallo", "p-limonada"] as const;

// `inmediata`: en la portada el teléfono entra desde fuera de la escena (transform), donde la
// carga diferida no lo ve; ahí las fotos se piden de una, con prioridad baja.
export function TelefonoCarta({ className, inmediata = false }: { className?: string; inmediata?: boolean }) {
  const products = SAMPLE_IDS.map((id) => mockProducts.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const categories = mockCategories.slice(0, 4);
  return (
    <div aria-hidden="true" className={cn("relative w-[280px] rounded-[2.6rem] border-[10px] border-brand-950 bg-brand-950 shadow-[0_40px_80px_-30px_rgba(10,26,19,0.5)] sm:w-[300px]", className)}>
      <div className="absolute left-1/2 top-0 z-20 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-brand-950" aria-hidden="true" />
      <div className="relative aspect-[9/19] overflow-hidden rounded-[2rem] bg-cream-50">
        {/* Cabecera con cover */}
        <div className="relative h-36">
          <Image src={RESTAURANT.cover} alt="" fill sizes="300px" className="object-cover" loading={inmediata ? "eager" : "lazy"} fetchPriority={inmediata ? "low" : undefined} />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-950/30 to-transparent" />
          <div className="absolute inset-x-4 bottom-3 text-cream-50">
            <p className="font-display text-xl leading-tight">{RESTAURANT.name}</p>
            {/* El mismo subtítulo que muestra /c/ejemplo (la carta que abre el QR). */}
            <p className="text-[11px] font-medium text-cream-100/85">{dict.es.cartaTagline}</p>
          </div>
        </div>
        {/* Chips de categorías */}
        <div className="flex gap-2 overflow-hidden px-4 py-3">
          {categories.map((c, i) => (
            <span
              key={c.id}
              className={
                i === 1
                  ? "whitespace-nowrap rounded-full bg-brand-600 px-3 py-1 text-[10px] font-bold text-white"
                  : "whitespace-nowrap rounded-full border border-stone-250 bg-white px-3 py-1 text-[10px] font-semibold text-brand-800"
              }
            >
              {c.name_i18n.es}
            </span>
          ))}
        </div>
        {/* Platillos */}
        <ul className="space-y-2.5 px-4">
          {products.map((p, i) => (
            <li key={p.id} className="flex gap-3 rounded-xl border border-stone-200/80 bg-white p-2">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-cream-100">
                {p.image_url && <Image src={p.image_url} alt="" fill sizes="64px" className="object-cover" loading={inmediata ? "eager" : "lazy"} fetchPriority={inmediata ? "low" : undefined} />}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                <div>
                  <p className="truncate text-[12px] font-bold leading-tight text-brand-900">{p.name_i18n.es}</p>
                  <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-brand-700/70">{p.description_i18n?.es}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-brand-900">{formatCrc(p.price)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {/* Pie de la carta: en el plan Carta no hay barra de orden. */}
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-center rounded-xl bg-brand-950 px-4 py-3 text-cream-50 shadow-lg">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em]">Carta digital · ES · EN</span>
        </div>
      </div>
    </div>
  );
}
