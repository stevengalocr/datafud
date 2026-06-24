import Link from "next/link";
import Image from "next/image";
import { LandingNavV2 } from "@/components/marketing/v2/landing-nav-v2";
import { PricingV2 } from "@/components/marketing/v2/pricing-v2";
import { RevealOnView } from "@/components/marketing/v2/reveal";
import { PinnedSteps, type Step } from "@/components/marketing/v2/pinned-steps";
import { Parallax } from "@/components/marketing/v2/parallax";
import { MagneticCta } from "@/components/marketing/v2/magnetic-cta";
import { CountUp } from "@/components/marketing/v2/count-up";
import { Icon, type IconName } from "@/components/ui/icon";
import { PRICING } from "@/lib/constants";

// Fotografía de stock (Unsplash, licencia libre), tratada con overlay de marca.
const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1500&q=80`;
const IMG = {
  food: u("photo-1504674900247-0877df9cc836"),
  tables: u("photo-1559339352-11d035aa65de"),
  communal: u("photo-1528605248644-14dd04022da1"),
  interior: u("photo-1552566626-52f8b828add9"),
  tablePhone: u("photo-1466978913421-dad2ebd01d17"),
  counter: u("photo-1556742049-0cfed4f6a45d"),
  dark: u("photo-1517248135467-4c7edcad34c4"),
};

const steps: Step[] = [
  {
    number: "01",
    title: "Crea tu menú digital",
    desc: "Carga categorías y platillos con fotografía, precios y descripciones en hasta 3 idiomas. Personaliza colores y logo en segundos.",
    image: IMG.food,
    alt: "Platillos servidos sobre una mesa de madera, listos para fotografiar el menú",
    icon: "utensils",
  },
  {
    number: "02",
    title: "Activa tus QR y NFC",
    desc: "Genera códigos QR de alta resolución y tarjetas NFC para cada mesa. El cliente escanea o toca para abrir la carta al instante.",
    image: IMG.tables,
    alt: "Mesas de un restaurante con vista al agua, preparadas para el servicio",
    icon: "qr",
  },
  {
    number: "03",
    title: "Recibe las órdenes",
    desc: "Las comandas llegan en tiempo real a tu pantalla de cocina. Gestiona cada estado, de preparación a entrega, sin papel.",
    image: IMG.communal,
    alt: "Mesa comunal llena de comensales disfrutando y ordenando",
    icon: "receipt",
  },
  {
    number: "04",
    title: "Mide tu negocio",
    desc: "Analiza el ticket promedio, los platillos más vendidos y tus ingresos totales en reportes claros y accionables.",
    image: IMG.interior,
    alt: "Interior cálido de un restaurante en plena operación",
    icon: "chart",
  },
];

const highlights: { icon: IconName; label: string }[] = [
  { icon: "clock", label: "Operando en 48 horas" },
  { icon: "globe", label: "Español · Inglés · Português" },
  { icon: "wallet", label: "Monedas de toda Latam" },
  { icon: "zap", label: "Órdenes en tiempo real" },
];

const currencies = ["₡ CRC", "$ MXN", "S/ PEN", "$ COP", "R$ BRL", "$ ARS", "Q GTQ", "Bs BOB", "$ CLP", "₲ PYG", "$U UYU", "B/. PAB", "USD"];

const stats: { value: number; suffix?: string; label: string }[] = [
  { value: 48, suffix: "h", label: "para estar operando" },
  { value: 3, label: "idiomas listos" },
  { value: 18, label: "monedas de Latam" },
  { value: 100, suffix: "%", label: "a tu propia marca" },
];

const views: { icon: IconName; tag: string; title: string; image: string; alt: string; points: string[] }[] = [
  {
    icon: "smartphone",
    tag: "Servicio al comensal",
    title: "Menú interactivo y veloz",
    image: IMG.tablePhone,
    alt: "Comensales compartiendo una comida con el teléfono sobre la mesa",
    points: [
      "Escaneo rápido o toque NFC en la mesa.",
      "Interfaz adaptable a cualquier teléfono.",
      "Disponible en español, inglés y portugués.",
      "Arma la comanda y la envía directo a cocina.",
    ],
  },
  {
    icon: "store",
    tag: "Operación del negocio",
    title: "Tu restaurante, bajo control",
    image: IMG.counter,
    alt: "Personal de un local atendiendo a una clienta en el mostrador",
    points: [
      "Actualiza platos y categorías al instante.",
      "Comandas en vivo, mesa por mesa.",
      "Reportes del día y ticket promedio.",
      "Configura monedas e idiomas locales.",
    ],
  },
];

// Glifo QR firma de la marca: celdas que se ensamblan al cargar.
const QR_CELLS = [
  1, 1, 1, 0, 1,
  1, 0, 1, 0, 1,
  1, 1, 1, 1, 1,
  0, 0, 1, 0, 1,
  1, 1, 1, 0, 1,
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream-50 font-sans text-brand-900 antialiased selection:bg-accent-200 selection:text-brand-950">
      <LandingNavV2 />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-stone-200/60">
        <div className="qr-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="animate-glow-1 pointer-events-none absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-brand-100/50 blur-3xl" />
        <div className="animate-glow-2 pointer-events-none absolute right-0 top-20 h-[360px] w-[360px] rounded-full bg-accent-100/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-[8%] top-0 hidden border-l border-stone-200/30 xl:block" />
        <div className="pointer-events-none absolute bottom-0 right-[8%] top-0 hidden border-r border-stone-200/30 xl:block" />

        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
            <div className="reveal flex flex-col items-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent-300/60 bg-accent-50/60 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-700 shadow-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-500" />
                QR Menus · Orders · Analytics
              </span>

              <h1 className="mt-7 font-display text-[clamp(2.2rem,6.4vw,3.6rem)] leading-[1.04] tracking-tight text-brand-900 sm:mt-8">
                El menú digital que{" "}
                <span className="italic font-normal text-brand-700">abre apetito</span>{" "}
                <span className="text-accent-500">y cierra ventas</span>
              </h1>

              <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-brand-800/80 sm:text-lg">
                Tus comensales piden desde su mesa escaneando un QR o tocando una
                tarjeta NFC. Tú gestionas todo en tiempo real: platos, comandas y
                analíticas. Multi-idioma, multi-moneda y a tu marca.
              </p>

              <div className="mt-9 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:gap-4">
                <MagneticCta
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-accent-400 bg-brand-600 px-8 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-sm transition-colors duration-300 ease-out-expo hover:bg-brand-700"
                >
                  Quiero mi DataFud
                </MagneticCta>
                <Link
                  href="/preview"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-stone-300 bg-white/60 px-8 text-xs font-bold uppercase tracking-[0.18em] text-brand-800 backdrop-blur-sm transition-all duration-300 ease-out-expo hover:border-stone-400 hover:bg-cream-100/70 active:scale-[0.98]"
                >
                  Ver demo en vivo
                </Link>
              </div>

              <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-brand-700/60">
                Listo en 48 horas · tarifas desde ${PRICING.plans.basico.priceUsd}/mes
              </p>
            </div>

            {/* Imagen del producto + acentos flotantes */}
            <Parallax strength={26} className="relative flex justify-center lg:justify-end">
              {/* Glifo QR que se ensambla */}
              <div className="absolute -left-3 -top-5 z-20 hidden rounded-xl border border-stone-200/80 bg-white/90 p-2.5 shadow-lg backdrop-blur-sm sm:block">
                <svg width="58" height="58" viewBox="0 0 58 58" aria-hidden="true">
                  {QR_CELLS.map((on, i) => {
                    if (!on) return null;
                    const col = i % 5;
                    const row = Math.floor(i / 5);
                    const accent = i === 12 || i === 7 || i === 17;
                    return (
                      <rect
                        key={i}
                        className="qr-pixel"
                        x={col * 11 + 2}
                        y={row * 11 + 2}
                        width="9"
                        height="9"
                        rx="1.5"
                        fill={accent ? "#b8923f" : "#22503a"}
                        style={{ animationDelay: `${0.4 + i * 0.02}s`, transformOrigin: "center" }}
                      />
                    );
                  })}
                </svg>
              </div>

              <div className="group relative w-full max-w-[460px] overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-2 shadow-[0_28px_60px_-20px_rgba(34,80,58,0.28)] transition-transform duration-500 ease-out-expo hover:-translate-y-1">
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-tr from-brand-50/20 to-transparent" />
                <Image
                  src="/banner.png"
                  alt="Menú digital DataFud abierto en un teléfono sobre la mesa"
                  width={920}
                  height={570}
                  priority
                  className="h-auto w-full rounded-xl object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.02]"
                />
              </div>

              {/* Chip flotante: orden recibida */}
              <div className="absolute -bottom-4 -right-1 z-20 hidden items-center gap-3 rounded-xl border border-stone-200/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm sm:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                  <Icon name="check-circle" size={18} />
                </span>
                <div>
                  <p className="text-[11px] font-bold leading-tight text-brand-900">Orden #18 · Mesa 4</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-accent-600">Recibida en cocina</p>
                </div>
              </div>
            </Parallax>
          </div>
        </div>

        {/* Barra de highlights */}
        <RevealOnView className="relative border-t border-stone-200/60 bg-white/60 backdrop-blur-sm">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-5 py-7 sm:px-6 md:grid-cols-4 md:gap-y-0">
            {highlights.map((h) => (
              <div
                key={h.label}
                className="reveal-up flex items-center gap-3 px-1 sm:px-2 md:border-r md:border-stone-250/60 md:last:border-r-0"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-stone-200/40 bg-cream-100 text-brand-650">
                  <Icon name={h.icon} size={15} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-800">
                  {h.label}
                </span>
              </div>
            ))}
          </div>
        </RevealOnView>
      </section>

      {/* ── Tira de monedas + stats ────────────────────────────── */}
      <section className="border-b border-stone-200/60 bg-brand-950 py-10 text-cream-100">
        <div className="marquee-host relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-brand-950 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-brand-950 to-transparent" />
          <div className="marquee gap-10 pr-10">
            {[...currencies, ...currencies].map((c, i) => (
              <span
                key={i}
                className="flex shrink-0 items-center gap-3 font-display text-2xl text-cream-100/85"
              >
                {c}
                <span className="h-1 w-1 rounded-full bg-accent-400/70" />
              </span>
            ))}
          </div>
        </div>

        <RevealOnView className="mx-auto mt-10 grid max-w-6xl grid-cols-2 gap-y-8 px-5 sm:px-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="reveal-up flex flex-col items-start">
              <span className="font-display text-[clamp(2.4rem,5vw,3.4rem)] leading-none text-accent-300">
                <CountUp to={s.value} suffix={s.suffix} />
              </span>
              <span className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-cream-100/65">
                {s.label}
              </span>
            </div>
          ))}
        </RevealOnView>
      </section>

      {/* ── Cómo funciona (pinneado) ───────────────────────────── */}
      <PinnedSteps steps={steps} />

      {/* ── El sistema (dos caras) ─────────────────────────────── */}
      <section id="sistema" className="scroll-mt-24 border-y border-stone-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-32">
          <RevealOnView className="max-w-2xl">
            <div className="reveal-up">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-600">
                El sistema completo
              </p>
              <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight text-brand-900">
                Una experiencia para cada lado de la mesa
              </h2>
            </div>
          </RevealOnView>

          <RevealOnView className="mt-14 grid gap-8 sm:mt-16 lg:grid-cols-2">
            {views.map((v) => (
              <div
                key={v.title}
                className="reveal-up group flex flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-cream-50/40 transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-accent-300/60 hover:shadow-[0_24px_60px_-24px_rgba(34,80,58,0.3)]"
              >
                <div className="img-grade relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={v.image}
                    alt={v.alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-accent-300 bg-brand-600 text-white shadow-lg">
                    <Icon name={v.icon} size={20} />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-7 sm:p-8">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent-600">
                    {v.tag}
                  </span>
                  <h3 className="mt-1 font-display text-2xl text-brand-900">{v.title}</h3>
                  <ul className="mt-6 space-y-3.5 text-[13px] font-medium leading-relaxed text-brand-700/80">
                    {v.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex-shrink-0 text-accent-500">
                          <svg width="10" height="10" viewBox="0 0 10 10" className="h-2.5 w-2.5 fill-current">
                            <rect width="5" height="5" transform="rotate(45 5 0.5)" />
                          </svg>
                        </span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </RevealOnView>
        </div>
      </section>

      {/* ── Act-break atmosférico ──────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <div className="img-grade absolute inset-0 -z-10">
          <Parallax strength={50} className="absolute inset-0 scale-110">
            <Image src={IMG.dark} alt="" fill className="object-cover" />
          </Parallax>
          <div className="absolute inset-0 bg-brand-950/70" />
        </div>
        <div className="mx-auto max-w-4xl px-5 py-28 text-center sm:px-6 sm:py-36">
          <RevealOnView>
            <p className="reveal-up font-display text-[clamp(1.8rem,4.5vw,3rem)] leading-[1.15] text-cream-100">
              Hecho para llenar mesas en{" "}
              <span className="text-accent-300">Latinoamérica</span>.
            </p>
            <p className="reveal-up mx-auto mt-5 max-w-xl text-sm font-medium leading-relaxed text-cream-100/75 sm:text-base">
              Sodas, cafeterías y restaurantes que cambiaron la carta impresa por una
              experiencia digital que vende más y opera mejor.
            </p>
          </RevealOnView>
        </div>
      </section>

      {/* ── Precios + NFC ──────────────────────────────────────── */}
      <PricingV2 />

      {/* ── Cierre oscuro: CTA + Footer ────────────────────────── */}
      <footer className="relative isolate overflow-hidden bg-brand-950 text-cream-100">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px]">
          <Image src="/cta-bg.png" alt="" fill className="object-cover object-center" />
          <div className="absolute inset-0 bg-brand-950/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-900/55 via-brand-950/90 to-brand-950" />
          <div className="qr-grid absolute inset-0 opacity-[0.05]" />
        </div>
        <div className="pointer-events-none absolute left-1/2 top-24 -z-10 h-72 w-[36rem] max-w-[88%] -translate-x-1/2 rounded-full bg-accent-500/10 blur-3xl" />

        <RevealOnView className="relative">
          <div className="reveal-up mx-auto max-w-2xl px-5 pb-16 pt-24 text-center sm:px-6 sm:pb-20 sm:pt-32">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-200 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
              Empieza hoy
            </span>
            <h2 className="mt-7 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.08] text-accent-100">
              Lleva la carta de tu restaurante al siguiente nivel
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm font-medium leading-relaxed text-cream-100/80">
              Únete a las sodas, cafeterías y restaurantes que ya digitalizaron su
              carta y su flujo de trabajo con DataFud.
            </p>
            <MagneticCta
              href="/register"
              className="mt-10 inline-flex h-12 items-center justify-center rounded-lg border border-accent-300 bg-accent-500 px-8 text-xs font-bold uppercase tracking-[0.18em] text-brand-950 shadow-md transition-colors duration-300 ease-out-expo hover:bg-accent-400"
            >
              Crear mi cuenta gratis
            </MagneticCta>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-cream-100/50">
              Operando en 48 horas · desde ${PRICING.plans.basico.priceUsd}/mes
            </p>
          </div>

          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </div>

          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-16">
            <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
              <div className="flex max-w-sm flex-col items-start">
                <span className="inline-flex items-center rounded-xl bg-white px-3 py-2 shadow-sm">
                  <Image src="/logo-main.png" alt="DataFud" width={140} height={58} className="h-7 w-auto" />
                </span>
                <p className="mt-6 text-[13px] font-medium leading-relaxed text-cream-100/70">
                  Plataforma de menú digital, comandas inalámbricas y análisis de
                  ventas en tiempo real para sodas y restaurantes de Latinoamérica.
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent-300/80">Explorar</h4>
                <nav className="mt-6 flex flex-col gap-3.5 text-xs font-bold uppercase tracking-[0.16em] text-cream-100/75">
                  <a href="#como-funciona" className="transition-colors duration-200 hover:text-white">Cómo funciona</a>
                  <a href="#sistema" className="transition-colors duration-200 hover:text-white">El sistema</a>
                  <a href="#planes" className="transition-colors duration-200 hover:text-white">Planes y precios</a>
                  <Link href="/preview" className="transition-colors duration-200 hover:text-white">Probar demo</Link>
                </nav>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent-300/80">Contacto</h4>
                <div className="mt-6 flex flex-col gap-3.5 text-xs font-semibold text-cream-100/80">
                  <p className="flex items-center gap-2"><span className="text-accent-400">●</span> info@datafud.com</p>
                  <p className="flex items-center gap-2"><span className="text-accent-400">●</span> Costa Rica &amp; Latinoamérica</p>
                  <Link
                    href="/login"
                    className="mt-2 inline-flex h-9 w-28 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-[10px] font-bold uppercase tracking-[0.16em] text-cream-100 transition-all duration-200 hover:border-white/35 hover:bg-white/10"
                  >
                    Ingresar
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-[10px] font-bold uppercase tracking-[0.16em] text-cream-100/50 sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} DATAFUD · UN PRODUCTO DE <span className="text-accent-400">GALODEV</span></p>
              <p>DATAFUD.COM · HECHO EN LATINOAMÉRICA</p>
            </div>
          </div>
        </RevealOnView>
      </footer>
    </div>
  );
}
