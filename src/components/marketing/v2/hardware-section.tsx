import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";
import { RevealOnView } from "@/components/marketing/v2/reveal";
import { HardwareArt } from "@/components/marketing/v2/hardware-art";
import { Stand3D } from "@/components/marketing/v2/stand-3d";
import { Tilt } from "@/components/marketing/v2/tilt";
import { Parallax } from "@/components/marketing/v2/parallax";
import QRCode from "qrcode";
import { PRICING, formatPublishedPrice, type HardwareItem } from "@/lib/constants";
import { formatCrc } from "@/lib/currency/format";
import { hasWhatsApp, waProps } from "@/lib/site";

// Sección #hardware: los cuatro productos de PRICING.hardware en una composición editorial
// asimétrica (una pieza grande, dos apiladas, una ancha) + bloque "100 % personalizable".
// Sin fotos reales en public/hardware/, se muestran los renders con la etiqueta "Render ilustrativo".

const ALT: Record<HardwareItem["code"], string> = {
  "stand-qr-3d": "Render ilustrativo de un stand de mesa impreso en 3D con el código QR en relieve y espacio para el logo del local",
  "tarjeta-nfc": "Render ilustrativo de una tarjeta NFC de DataFud junto a un stand de mesa con código QR",
  "stand-qr-3d-nfc": "Render ilustrativo de un stand de mesa impreso en 3D con código QR en relieve y chip NFC integrado",
  "stand-resenas": "Render ilustrativo de un stand de mesa con QR y NFC que llevan a dejar una reseña en Google",
};

function PriceTag({ item, wa, dark = false }: { item: HardwareItem; wa: boolean; dark?: boolean }) {
  const pending = item.priceUsd === "PENDIENTE";
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2", dark ? "text-cream-100" : "text-brand-900")}>
      {item.pricing === "desde" && (
        <span className={cn("text-xs font-bold uppercase tracking-[0.16em]", dark ? "text-accent-300" : "text-accent-700")}>desde</span>
      )}
      <span className="font-display text-3xl leading-none">{formatCrc(item.priceCrc)}</span>
      <span className={cn("text-xs font-bold uppercase tracking-[0.14em]", dark ? "text-cream-100/70" : "text-brand-700/75")}>/ {item.unit}</span>
      {!pending && (
        // En su propia línea en todas las piezas, como en los planes.
        <span className={cn("mt-1 basis-full text-xs font-semibold", dark ? "text-cream-100/70" : "text-brand-700/75")}>≈&nbsp;{formatPublishedPrice(item.priceUsd, wa)}</span>
      )}
    </p>
  );
}

// Fotos reales: public/hardware/<código>.webp. Si existe se usa; si no, el render con su etiqueta.
// Se evalúa en el build (la landing es estática).
function realPhoto(code: HardwareItem["code"]): string | null {
  const rel = `/hardware/${code}.webp`;
  return existsSync(path.join(process.cwd(), "public", rel)) ? rel : null;
}

// `position` encuadra el render en su recuadro; `chip` mueve la etiqueta si taparía el producto.
function Visual({
  item,
  className,
  sizes,
  position,
  chip = "bottom-3 left-3",
}: {
  item: HardwareItem;
  className?: string;
  sizes: string;
  position?: string;
  chip?: string;
}) {
  const real = realPhoto(item.code);
  const src = real ?? item.photo;
  const isRender = !real && item.photoIsRender;
  return (
    <div
      className={cn("img-grade relative overflow-hidden rounded-2xl border border-stone-200/70 bg-cream-100", className)}
      role="img"
      aria-label={real ? `Foto de ${item.name}` : ALT[item.code]}
    >
      <div className="qr-grid absolute inset-0 opacity-60" />
      {src ? (
        <Image src={src} alt="" fill sizes={sizes} className={cn("object-cover", position)} />
      ) : (
        <div className="absolute inset-0 p-4 sm:p-6">
          <HardwareArt code={item.code} />
        </div>
      )}
      {isRender && (
        <span className={cn("absolute z-10 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-800 shadow-sm", chip)}>
          Render ilustrativo
        </span>
      )}
    </div>
  );
}

export async function HardwareSection() {
  // QR real del stand 3D: decodifica a la dirección de demostración, como todo QR dibujado (D-051).
  const qrSvg = await QRCode.toString("https://datafud.com/q/demo26", { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#112a20", light: "#fbfaf6" } });
  const wa = hasWhatsApp();
  const byCode = Object.fromEntries(PRICING.hardware.map((h) => [h.code, h])) as Record<HardwareItem["code"], HardwareItem>;
  const standQr = byCode["stand-qr-3d"];
  const nfc = byCode["tarjeta-nfc"];
  const standNfc = byCode["stand-qr-3d-nfc"];
  const reviews = byCode["stand-resenas"];
  const quote = waProps("hardware");

  return (
    <section id="hardware" data-fondo="b" className="fondo-vivo scroll-mt-24">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-28">
        <RevealOnView className="grid items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
          <div className="reveal-up max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">Hardware de mesa</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight text-brand-900">
              Lo que va en la mesa también lleva tu marca
            </h2>
            <p className="mt-5 max-w-md text-base font-medium leading-relaxed text-brand-800/80">
              Nada de QR pegados con cinta. Stands impresos en 3D y tarjetas NFC hechos para
              tu local: firmes, limpios y con tu logo. {PRICING.hardwareDelivery.minimum} Listos{" "}
              {PRICING.hardwareDelivery.leadTime} desde que aprobás el diseño.
            </p>
          </div>
          {/* Stand en 3D: gira con el scroll y se arrastra (stand-3d.tsx). */}
          <div className="reveal-up relative">
            <div className="pointer-events-none absolute inset-6 -z-10 rounded-full bg-brand-100/60 blur-3xl" />
            <Stand3D qrSvg={qrSvg} />
            <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-semibold text-brand-700/75">
              <span className="rounded-full bg-white/90 px-2.5 py-1 text-brand-800 shadow-sm">Modelo ilustrativo</span>
              <span className="st-pista">Arrastralo (o usá las flechas) para verlo por todos lados</span>
            </div>
          </div>
        </RevealOnView>

        {/* La familia completa, en estudio (render 4K, 2026-10-21). Los sizes salen de medir: el
            recorte (cover) y scale-[1.22] piden unas 1,8 veces el ancho de la ventana en teléfono. */}
        <RevealOnView className="mt-12 sm:mt-16">
          <div className="reveal-up relative overflow-hidden rounded-3xl border border-stone-200/70 bg-brand-950">
            <Parallax strength={34} className="relative aspect-[4/3] sm:aspect-[21/9]">
              <Image
                src="/renders/familia-stands.webp"
                alt="Render ilustrativo de los tres stands de mesa DataFud (QR, QR con NFC y reseñas) y una tarjeta NFC sobre una base de piedra verde, con luz dorada"
                fill
                sizes="(min-width: 1152px) 1650px, (min-width: 640px) 142vw, 180vw"
                className="scale-[1.22] object-cover object-[50%_55%]"
              />
            </Parallax>
            <span className="absolute bottom-4 left-4 z-10 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-800 shadow-sm">
              Render ilustrativo
            </span>
          </div>
        </RevealOnView>

        {/* Composición asimétrica */}
        <RevealOnView className="mt-10 grid gap-5 sm:mt-16 lg:grid-cols-12 lg:grid-rows-[auto_auto]">
          {/* Pieza grande: stand QR 3D */}
          <div className="reveal-up lg:col-span-7 lg:row-span-2">
          <Tilt as="article" max={4} className="group flex flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white hover:border-accent-300/60 hover:shadow-[0_24px_60px_-24px_rgba(34,80,58,0.3)] h-full">
            <Visual item={standQr} className="aspect-[5/2] rounded-b-none border-0 border-b sm:aspect-[16/10] lg:aspect-auto lg:min-h-[320px] lg:flex-1" sizes="(min-width: 1024px) 960px, 100vw" />
            <div className="flex flex-col p-6 sm:p-9">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent-700">El básico de cada mesa</span>
              <h3 className="mt-2 font-display text-2xl text-brand-900 sm:text-3xl">{standQr.name}</h3>
              <p className="mt-3 max-w-lg text-sm font-medium leading-relaxed text-brand-700/80 sm:text-[15px]">{standQr.benefit}</p>
              <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-stone-200/70 pt-5">
                <PriceTag item={standQr} wa={wa} />
                <span className="text-xs font-semibold text-brand-700/75">Un color + base, con tu logo</span>
              </div>
            </div>
          </Tilt>
          </div>

          {/* Apiladas: tarjeta NFC y stand + NFC */}
          <div className="reveal-up lg:col-span-5">
          <Tilt as="article" max={4} className="group grid gap-0 overflow-hidden rounded-3xl border border-stone-200/80 bg-white hover:border-accent-300/60 hover:shadow-[0_24px_60px_-24px_rgba(34,80,58,0.3)] sm:grid-cols-[0.9fr_1.1fr] lg:grid-cols-1 h-full">
            <Visual item={nfc} position="object-[50%_25%]" chip="right-3 top-3" className="aspect-[5/2] rounded-none border-0 sm:aspect-auto sm:min-h-[180px] lg:aspect-[16/9]" sizes="(min-width: 1024px) 40vw, 100vw" />
            <div className="flex flex-col p-6 sm:p-7">
              <h3 className="font-display text-2xl text-brand-900">{nfc.name}</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-brand-700/80">{nfc.benefit}</p>
              <div className="mt-5 border-t border-stone-200/70 pt-5">
                <PriceTag item={nfc} wa={wa} />
              </div>
            </div>
          </Tilt>
          </div>

          <div className="reveal-up lg:col-span-5">
          <Tilt as="article" max={4} className="group grid overflow-hidden rounded-3xl border border-stone-200/80 bg-white hover:border-accent-300/60 hover:shadow-[0_24px_60px_-24px_rgba(34,80,58,0.3)] sm:grid-cols-[1.1fr_0.9fr] lg:grid-cols-[1fr_0.9fr] h-full">
            <div className="order-2 flex flex-col p-6 sm:order-1 sm:p-7">
              <h3 className="font-display text-2xl text-brand-900">{standNfc.name}</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-brand-700/80">{standNfc.benefit}</p>
              <div className="mt-5 border-t border-stone-200/70 pt-5">
                <PriceTag item={standNfc} wa={wa} />
              </div>
            </div>
            <Visual item={standNfc} className="order-1 aspect-[5/2] rounded-none border-0 sm:order-2 sm:aspect-auto sm:min-h-[180px]" sizes="(min-width: 1024px) 600px, 100vw" />
          </Tilt>
          </div>

          {/* Ancha: stand de reseñas */}
          <div className="reveal-up lg:col-span-7">
          <Tilt as="article" max={4} className="group grid overflow-hidden rounded-3xl border border-stone-200/80 bg-white hover:border-accent-300/60 hover:shadow-[0_24px_60px_-24px_rgba(34,80,58,0.3)] lg:grid-cols-[0.8fr_1.2fr] h-full">
            <Visual item={reviews} className="aspect-[5/2] rounded-none border-0 lg:aspect-auto lg:min-h-[220px]" sizes="(min-width: 1024px) 1040px, 100vw" />
            <div className="flex flex-col p-6 sm:p-8">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent-700">Para pedir reseñas</span>
              <h3 className="mt-2 font-display text-2xl text-brand-900">{reviews.name}</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-brand-700/80">{reviews.benefit}</p>
              <div className="mt-5 border-t border-stone-200/70 pt-5">
                <PriceTag item={reviews} wa={wa} />
              </div>
            </div>
          </Tilt>
          </div>

          {/* Bloque destacado: 100 % personalizable */}
          <aside className="reveal-up relative isolate overflow-hidden rounded-3xl bg-brand-950 p-7 text-cream-100 sm:p-9 lg:col-span-5">
            <div className="qr-grid absolute inset-0 -z-10 opacity-[0.07]" />
            <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-56 w-56 rounded-full bg-accent-500/15 blur-3xl" />
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-300/40 bg-accent-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-accent-200">
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
            <ul className="mt-5 space-y-2 text-sm font-medium leading-relaxed text-cream-100/80">
              <li className="flex items-start gap-2.5"><Icon name="pin" size={15} className="mt-0.5 flex-shrink-0 text-accent-300" />{PRICING.hardwareDelivery.gam}</li>
              <li className="flex items-start gap-2.5"><Icon name="printer" size={15} className="mt-0.5 flex-shrink-0 text-accent-300" />{PRICING.hardwareDelivery.outside}</li>
            </ul>
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
