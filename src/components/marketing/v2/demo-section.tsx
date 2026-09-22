import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { RevealOnView } from "@/components/marketing/v2/reveal";
import QRCode from "qrcode";
import { RESTAURANT, mockProducts, mockCategories } from "@/lib/demo/mock";
import { formatCrc } from "@/lib/currency/format";
import { SITE } from "@/lib/site";

// Sección #demo: teaser de la demo "Verde Limón" (restaurante ficticio) dentro de un marco
// de teléfono, con CTA a /preview/cliente. El marco es una composición estática con los
// mismos datos de la demo; la demo real (interactiva) vive en /preview.

const SAMPLE_IDS = ["p-casado", "p-gallo", "p-limonada"] as const;

// URL que codifica el QR de escritorio: la carta demo, en producción.
export const DEMO_QR_URL = `${SITE.url}/preview/cliente`;

const highlights = [
  { icon: "smartphone", text: "La carta tal como la ve el comensal, con fotos y precios en colones." },
  { icon: "receipt", text: "Armá un pedido de prueba y mandalo a cocina, sin registrarte (pedidos en mesa: Estándar y Empresarial)." },
  { icon: "store", text: "Mirá también el panel que tendrías con el sistema completo." },
] as const;

export async function DemoSection() {
  // QR real generado en el servidor (build estático): sin llamadas externas.
  const qrSvg = await QRCode.toString(DEMO_QR_URL, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#112a20", light: "#ffffff" },
  });
  const products = SAMPLE_IDS.map((id) => mockProducts.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const categories = mockCategories.slice(0, 4);
  const cartTotal = products.slice(0, 2).reduce((acc, p) => acc + p.price, 0);

  return (
    <section id="demo" className="scroll-mt-24 border-b border-stone-200/60 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
          {/* Marco de teléfono */}
          <RevealOnView className="relative order-2 hidden min-w-0 justify-center sm:flex lg:order-1 lg:justify-start">
            <div className="reveal-up relative">
              <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-brand-100/50 blur-3xl" />
              <div aria-hidden="true" className="relative w-[280px] rounded-[2.6rem] border-[10px] border-brand-950 bg-brand-950 shadow-[0_40px_80px_-30px_rgba(10,26,19,0.5)] sm:w-[300px]">
                <div className="absolute left-1/2 top-0 z-20 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-brand-950" aria-hidden="true" />
                <div className="relative aspect-[9/19] overflow-hidden rounded-[2rem] bg-cream-50">
                  {/* Cabecera con cover */}
                  <div className="relative h-36">
                    <Image src={RESTAURANT.cover} alt="" fill sizes="300px" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-950/30 to-transparent" />
                    <div className="absolute inset-x-4 bottom-3 text-cream-50">
                      <p className="font-display text-xl leading-tight">{RESTAURANT.name}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cream-100/80">Mesa 1 · {RESTAURANT.tagline.split(" · ")[0]}</p>
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
                          {p.image_url && <Image src={p.image_url} alt="" fill sizes="64px" className="object-cover" />}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                          <div>
                            <p className="truncate text-[12px] font-bold leading-tight text-brand-900">{p.name_i18n.es}</p>
                            <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-brand-700/70">{p.description_i18n?.es}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-brand-900">{formatCrc(p.price)}</span>
                            <span className={i < 2 ? "flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white" : "flex h-6 w-6 items-center justify-center rounded-full border border-stone-250 text-brand-700"}>
                              <Icon name={i < 2 ? "check" : "plus"} size={12} />
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {/* Barra de orden */}
                  <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-xl bg-brand-950 px-4 py-3 text-cream-50 shadow-lg">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em]">Ver orden · 2</span>
                    <span className="font-display text-base text-accent-300">{formatCrc(cartTotal)}</span>
                  </div>
                </div>
              </div>
              {/* Chips flotantes */}
              <div aria-hidden="true" className="absolute -right-4 top-24 hidden items-center gap-2 rounded-xl border border-stone-200/80 bg-white px-3 py-2 shadow-lg sm:flex">
                <Icon name="globe" size={14} className="text-accent-700" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-900">ES · EN</span>
              </div>
              <div aria-hidden="true" className="absolute -left-6 bottom-28 hidden items-center gap-2 rounded-xl border border-stone-200/80 bg-white px-3 py-2 shadow-lg sm:flex">
                <Icon name="qr" size={14} className="text-brand-600" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-900">Sin app · sin cuenta</span>
              </div>
            </div>
          </RevealOnView>

          {/* Texto + CTA */}
          <RevealOnView className="order-1 min-w-0 lg:order-2">
            <div className="reveal-up">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">Demo en vivo</p>
              <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight text-brand-900">
                Probalo vos mismo, sin hablar con nadie
              </h2>
              <p className="mt-5 max-w-lg text-base font-medium leading-relaxed text-brand-800/80">
                Montamos una soda de ejemplo, <span className="font-semibold text-brand-900">{RESTAURANT.name}</span>,
                con su carta completa. Abrilo en tu teléfono como si estuvieras sentado en la mesa.
              </p>
            </div>
            <ul className="reveal-up mt-8 space-y-4">
              {highlights.map((h) => (
                <li key={h.text} className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-stone-200/60 bg-cream-100 text-brand-650">
                    <Icon name={h.icon} size={16} />
                  </span>
                  <span className="text-sm font-medium leading-relaxed text-brand-800/85 sm:text-[15px]">{h.text}</span>
                </li>
              ))}
            </ul>
            <div className="reveal-up mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/preview/cliente"
                data-demo-open="cliente"
                className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-lg border border-accent-400 bg-brand-600 px-6 py-3 text-center text-xs leading-snug sm:px-8 font-bold uppercase tracking-[0.18em] text-white shadow-sm transition-colors duration-300 ease-out-expo hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2"
              >
                <Icon name="smartphone" size={18} />
                Abrir la carta demo
              </Link>
              <Link
                href="/preview/dashboard"
                data-demo-open="dashboard"
                className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-lg border border-stone-300 bg-white px-6 text-xs font-bold uppercase tracking-[0.18em] text-brand-800 transition-all duration-300 ease-out-expo hover:border-stone-400 hover:bg-cream-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2"
              >
                Ver el panel
              </Link>
            </div>
            <p className="reveal-up mt-4 text-xs font-semibold uppercase tracking-wider text-brand-700/80">
              Soda ficticia · datos de ejemplo · nada se guarda
            </p>

            {/* Desde la compu: QR real a la carta demo. En móvil sobra (el botón abre directo). */}
            <div className="reveal-up mt-8 hidden items-center gap-5 rounded-2xl border border-stone-200/80 bg-cream-50 p-5 md:flex" data-demo-qr={DEMO_QR_URL}>
              <div
                className="h-28 w-28 flex-shrink-0 rounded-lg bg-white p-2 [&>svg]:h-full [&>svg]:w-full"
                role="img"
                aria-label={`Código QR que abre la carta demo en ${DEMO_QR_URL.replace("https://", "")}`}
                // SVG generado por nosotros con la librería qrcode a partir de una URL fija.
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
              <div>
                <p className="font-display text-xl text-brand-900">Escaneá con tu teléfono</p>
                <p className="mt-1 text-sm font-medium leading-relaxed text-brand-700/85">
                  Abrí la carta de {RESTAURANT.name} en tu celular, como si estuvieras sentado en la mesa.
                </p>
              </div>
            </div>
          </RevealOnView>
        </div>
      </div>
    </section>
  );
}
