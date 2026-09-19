import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";
import { RevealOnView } from "@/components/marketing/v2/reveal";
import { HardwareArt } from "@/components/marketing/v2/hardware-art";
import { PRICING, formatPublishedPrice, type HardwareItem } from "@/lib/constants";
import { hasWhatsApp, waProps } from "@/lib/site";

// Sección #hardware: los cuatro productos de PRICING.hardware en una composición editorial
// asimétrica (una pieza grande, dos apiladas, una ancha) + bloque "100 % personalizable".
// Fotos reales pendientes (TODO-FOTO): mientras tanto, ilustraciones SVG de marca y nfc.png.

const ALT: Record<HardwareItem["code"], string> = {
  "stand-qr-3d": "Ilustración de un stand de mesa impreso en 3D con el código QR en relieve y espacio para el logo del local",
  "tarjeta-nfc": "Cliente acercando su celular a una tarjeta NFC de DataFud sobre la mesa",
  "stand-qr-3d-nfc": "Ilustración de un stand de mesa impreso en 3D con código QR en relieve y chip NFC integrado",
  "stand-resenas": "Ilustración de un stand de mesa con QR y NFC que llevan a dejar una reseña en Google, con cinco estrellas",
};

function PriceTag({ item, wa, dark = false }: { item: HardwareItem; wa: boolean; dark?: boolean }) {
  const price = formatPublishedPrice(item.priceUsd, wa);
  const pending = item.priceUsd === "PENDIENTE";
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2", dark ? "text-cream-100" : "text-brand-900")}>
      {!pending && item.pricing === "desde" && (
        <span className={cn("text-[10px] font-bold uppercase tracking-[0.18em]", dark ? "text-accent-300" : "text-accent-700")}>desde</span>
      )}
      <span className={cn("font-display leading-none", pending ? "text-xl" : "text-3xl")}>{price}</span>
      {!pending && (
        <span className={cn("text-[10px] font-bold uppercase tracking-[0.16em]", dark ? "text-cream-100/60" : "text-brand-700/75")}>/ {item.unit}</span>
      )}
    </p>
  );
}

function Visual({ item, className, sizes }: { item: HardwareItem; className?: string; sizes: string }) {
  return (
    <div
      className={cn("img-grade relative overflow-hidden rounded-2xl border border-stone-200/70 bg-cream-100", className)}
      role="img"
      aria-label={ALT[item.code]}
    >
      <div className="qr-grid absolute inset-0 opacity-60" />
      {item.photo ? (
        <Image src={item.photo} alt="" fill sizes={sizes} className="object-cover" />
      ) : (
        <div className="absolute inset-0 p-4 sm:p-6">
          <HardwareArt code={item.code} />
        </div>
      )}
    </div>
  );
}

export function HardwareSection() {
  const wa = hasWhatsApp();
  const byCode = Object.fromEntries(PRICING.hardware.map((h) => [h.code, h])) as Record<HardwareItem["code"], HardwareItem>;
  const standQr = byCode["stand-qr-3d"];
  const nfc = byCode["tarjeta-nfc"];
  const standNfc = byCode["stand-qr-3d-nfc"];
  const reviews = byCode["stand-resenas"];
  const quote = waProps("hardware");

  return (
    <section id="hardware" className="scroll-mt-24 border-b border-stone-200/60 bg-cream-50">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-32">
        <RevealOnView className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="reveal-up max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">Hardware de mesa</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight text-brand-900">
              Lo que va en la mesa también lleva tu marca
            </h2>
          </div>
          <p className="reveal-up max-w-md text-base font-medium leading-relaxed text-brand-800/80 lg:justify-self-end">
            Nada de QR pegados con cinta. Stands impresos en 3D y tarjetas NFC hechos para
            tu local: firmes, limpios y con tu logo. Los básicos tienen precio publicado; todo
            lo demás se cotiza.
          </p>
        </RevealOnView>

        {/* Composición asimétrica */}
        <RevealOnView className="mt-14 grid gap-5 sm:mt-16 lg:grid-cols-12 lg:grid-rows-[auto_auto]">
          {/* Pieza grande: stand QR 3D */}
          <article className="reveal-up group flex flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-accent-300/60 hover:shadow-[0_24px_60px_-24px_rgba(34,80,58,0.3)] lg:col-span-7 lg:row-span-2">
            <Visual item={standQr} className="aspect-[4/3] rounded-b-none border-0 border-b sm:aspect-[16/10] lg:aspect-auto lg:min-h-[320px] lg:flex-1" sizes="(min-width: 1024px) 58vw, 100vw" />
            <div className="flex flex-col p-7 sm:p-9">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent-700">El básico de cada mesa</span>
              <h3 className="mt-2 font-display text-2xl text-brand-900 sm:text-3xl">{standQr.name}</h3>
              <p className="mt-3 max-w-lg text-sm font-medium leading-relaxed text-brand-700/80 sm:text-[15px]">{standQr.benefit}</p>
              <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-stone-200/70 pt-6">
                <PriceTag item={standQr} wa={wa} />
                <span className="text-xs font-semibold text-brand-700/75">Un color + base, con tu logo</span>
              </div>
            </div>
          </article>

          {/* Apiladas: tarjeta NFC y stand + NFC */}
          <article className="reveal-up group grid gap-0 overflow-hidden rounded-3xl border border-stone-200/80 bg-white transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-accent-300/60 hover:shadow-[0_24px_60px_-24px_rgba(34,80,58,0.3)] sm:grid-cols-[0.9fr_1.1fr] lg:col-span-5 lg:grid-cols-1">
            <Visual item={nfc} className="aspect-[16/10] rounded-none border-0 sm:aspect-auto sm:min-h-[180px] lg:aspect-[16/9]" sizes="(min-width: 1024px) 40vw, 100vw" />
            <div className="flex flex-col p-6 sm:p-7">
              <h3 className="font-display text-2xl text-brand-900">{nfc.name}</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-brand-700/80">{nfc.benefit}</p>
              <div className="mt-5 border-t border-stone-200/70 pt-5">
                <PriceTag item={nfc} wa={wa} />
              </div>
            </div>
          </article>

          <article className="reveal-up group grid overflow-hidden rounded-3xl border border-stone-200/80 bg-white transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-accent-300/60 hover:shadow-[0_24px_60px_-24px_rgba(34,80,58,0.3)] sm:grid-cols-[1.1fr_0.9fr] lg:col-span-5 lg:grid-cols-[1fr_0.9fr]">
            <div className="order-2 flex flex-col p-6 sm:order-1 sm:p-7">
              <h3 className="font-display text-2xl text-brand-900">{standNfc.name}</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-brand-700/80">{standNfc.benefit}</p>
              <div className="mt-5 border-t border-stone-200/70 pt-5">
                <PriceTag item={standNfc} wa={wa} />
              </div>
            </div>
            <Visual item={standNfc} className="order-1 aspect-[16/10] rounded-none border-0 sm:order-2 sm:aspect-auto sm:min-h-[180px]" sizes="(min-width: 1024px) 20vw, 100vw" />
          </article>

          {/* Ancha: stand de reseñas */}
          <article className="reveal-up group grid overflow-hidden rounded-3xl border border-stone-200/80 bg-white transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-accent-300/60 hover:shadow-[0_24px_60px_-24px_rgba(34,80,58,0.3)] lg:col-span-7 lg:grid-cols-[0.8fr_1.2fr]">
            <Visual item={reviews} className="aspect-[16/10] rounded-none border-0 lg:aspect-auto lg:min-h-[220px]" sizes="(min-width: 1024px) 25vw, 100vw" />
            <div className="flex flex-col p-6 sm:p-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent-700">Para subir tus estrellas</span>
              <h3 className="mt-2 font-display text-2xl text-brand-900">{reviews.name}</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-brand-700/80">{reviews.benefit}</p>
              <div className="mt-5 border-t border-stone-200/70 pt-5">
                <PriceTag item={reviews} wa={wa} />
              </div>
            </div>
          </article>

          {/* Bloque destacado: 100 % personalizable */}
          <aside className="reveal-up relative isolate overflow-hidden rounded-3xl bg-brand-950 p-7 text-cream-100 sm:p-9 lg:col-span-5">
            <div className="qr-grid absolute inset-0 -z-10 opacity-[0.07]" />
            <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-56 w-56 rounded-full bg-accent-500/15 blur-3xl" />
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-300/40 bg-accent-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-200">
              <Icon name="palette" size={12} />
              A tu medida
            </span>
            <h3 className="mt-5 font-display text-[clamp(1.5rem,3vw,2.1rem)] leading-[1.12] text-accent-100">
              Todo es 100&nbsp;% personalizable: forma, colores, tamaño y tu logo en relieve.
            </h3>
            <p className="mt-4 text-sm font-medium leading-relaxed text-cream-100/75">
              Lo diseñamos e imprimimos en Costa Rica. Contanos qué querés y te pasamos precio
              y tiempo de entrega.
            </p>
            <a
              {...quote}
              className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-lg border border-accent-300 bg-accent-500 px-6 py-3 text-center text-xs leading-snug sm:w-auto sm:px-7 font-bold uppercase tracking-[0.18em] text-brand-950 shadow-md transition-colors duration-300 ease-out-expo hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950"
            >
              <Icon name="whatsapp" size={18} />
              {wa ? "Cotizá tu diseño por WhatsApp" : "Cotizá tu diseño"}
            </a>
          </aside>
        </RevealOnView>
      </div>
    </section>
  );
}
