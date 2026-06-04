import Link from "next/link";
import Image from "next/image";
import { LandingNavV2 } from "@/components/marketing/v2/landing-nav-v2";
import { PricingV2 } from "@/components/marketing/v2/pricing-v2";
import { RevealOnView } from "@/components/marketing/v2/reveal";
import { Icon, type IconName } from "@/components/ui/icon";

const steps: { number: string; title: string; desc: string }[] = [
  {
    number: "01",
    title: "Crea tu menú digital",
    desc: "Carga categorías y platillos con fotografía, precios y descripciones en hasta 3 idiomas. Personaliza colores y logo en segundos.",
  },
  {
    number: "02",
    title: "Activa tus QR y NFC",
    desc: "Genera códigos QR de alta resolución y tarjetas NFC para cada mesa. El cliente los escanea o toca para abrir la carta de inmediato.",
  },
  {
    number: "03",
    title: "Recibe las órdenes",
    desc: "Las comandas se visualizan en tiempo real en tu pantalla de cocina. Gestiona cada estado de preparación a entrega.",
  },
  {
    number: "04",
    title: "Mide tu negocio",
    desc: "Analiza el ticket promedio, los platillos más vendidos y tus ingresos totales en reportes intuitivos y claros.",
  },
];

const views: { icon: IconName; tag: string; title: string; points: string[] }[] = [
  {
    icon: "smartphone",
    tag: "Servicio al Comensal",
    title: "Menú interactivo y veloz",
    points: [
      "Escaneo rápido o toque NFC en la mesa física.",
      "Interfaz adaptable a cualquier pantalla móvil.",
      "Disponible en español, inglés y portugués.",
      "Creación de la comanda y envío directo a cocina.",
    ],
  },
  {
    icon: "store",
    tag: "Operación del Negocio",
    title: "Panel de control del restaurante",
    points: [
      "Actualización instantánea de platos y categorías.",
      "Visualización en vivo de comandas por mesa.",
      "Reportes de rendimiento del día y ticket promedio.",
      "Configuración de monedas e idiomas locales.",
    ],
  },
];

const highlights: { icon: IconName; label: string }[] = [
  { icon: "clock", label: "OPERANDO EN 48 HORAS" },
  { icon: "globe", label: "3 IDIOMAS (ES · EN · PT)" },
  { icon: "wallet", label: "MONEDAS DE TODA LATAM" },
  { icon: "zap", label: "ÓRDENES EN TIEMPO REAL" },
];

export default function HomePageV2() {
  return (
    <div className="min-h-screen bg-cream-50 font-sans text-brand-900 antialiased selection:bg-accent-200 selection:text-brand-950">
      <LandingNavV2 />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-stone-200/60">
        <div className="qr-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="animate-glow-1 pointer-events-none absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-brand-100/50 blur-3xl" />
        <div className="animate-glow-2 pointer-events-none absolute right-0 top-20 h-[360px] w-[360px] rounded-full bg-accent-100/40 blur-3xl" />

        <div className="pointer-events-none absolute bottom-0 left-[8%] top-0 hidden border-l border-stone-200/30 xl:block" />
        <div className="pointer-events-none absolute bottom-0 right-[8%] top-0 hidden border-r border-stone-200/30 xl:block" />

        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            {/* Mensaje principal */}
            <div className="reveal flex flex-col items-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent-300/60 bg-accent-50/50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-accent-700 shadow-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-500" />
                QR Menus · Orders · Analytics
              </span>

              <h1 className="mt-7 font-display text-[2.1rem] leading-[1.08] tracking-tight text-brand-900 sm:mt-8 sm:text-5xl lg:text-[56px]">
                El menú digital que{" "}
                <span className="italic font-normal text-brand-700">abre apetito</span>{" "}
                <span className="text-accent-500">y cierra ventas</span>
              </h1>

              <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-brand-800/80 sm:text-lg">
                Tus comensales piden directamente desde su mesa escaneando un QR o
                tocando una tarjeta NFC. Tú gestionas todo el negocio en tiempo
                real: platos, comandas y analíticas. Multi-idioma, multi-moneda y a
                tu marca.
              </p>

              <div className="mt-9 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:gap-4">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-accent-400 bg-brand-600 px-8 text-xs font-bold uppercase tracking-widest text-white shadow-sm transition-all duration-300 ease-out-expo hover:bg-brand-700 hover:shadow active:scale-[0.98]"
                >
                  Quiero mi DataFud
                </Link>
                <Link
                  href="/preview"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-stone-300 bg-white/50 px-8 text-xs font-bold uppercase tracking-widest text-brand-800 backdrop-blur-sm transition-all duration-300 ease-out-expo hover:border-stone-400 hover:bg-cream-100/60 active:scale-[0.98]"
                >
                  Ver demo en vivo
                </Link>
              </div>

              <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-brand-700/60">
                Listo en 48 horas · tarifas desde $29/mes
              </p>
            </div>

            {/* Imagen enmarcada */}
            <div className="reveal relative flex justify-center lg:justify-end">
              <div className="group relative w-full max-w-[460px] overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-2 shadow-[0_20px_50px_rgba(34,80,58,0.06)] transition-transform duration-500 ease-out-expo hover:-translate-y-1">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-50/20 to-transparent" />
                <Image
                  src="/banner.png"
                  alt="Menú digital DataFud en mesa e interfaz móvil"
                  width={920}
                  height={570}
                  priority
                  className="h-auto w-full rounded-xl object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Highlights bar */}
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
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-800">
                  {h.label}
                </span>
              </div>
            ))}
          </div>
        </RevealOnView>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:px-6 sm:py-32">
        <RevealOnView className="max-w-2xl border-l-2 border-accent-400 pl-6">
          <div className="reveal-up">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-600">
              Paso a Paso
            </p>
            <h2 className="mt-2 font-display text-3xl leading-tight text-brand-900 sm:text-5xl">
              De cero a operar en tu local en minutos
            </h2>
          </div>
        </RevealOnView>

        <RevealOnView className="mt-16 grid gap-x-8 gap-y-12 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.number} className="reveal-up flex flex-col items-start">
              <span className="select-none font-display text-5xl leading-none text-accent-200 sm:text-6xl">
                {s.number}
              </span>
              <h3 className="mt-4 text-base font-bold leading-tight text-brand-900">
                {s.title}
              </h3>
              <p className="mt-2 text-[13px] font-medium leading-relaxed text-brand-700/80">
                {s.desc}
              </p>
            </div>
          ))}
        </RevealOnView>
      </section>

      {/* Las vistas */}
      <section id="vistas" className="scroll-mt-24 border-y border-stone-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <RevealOnView>
              <div className="reveal-up">
                <p className="text-xs font-bold uppercase tracking-widest text-accent-600">
                  El Sistema Completo
                </p>
                <h2 className="mt-2 font-display text-3xl leading-tight text-brand-900 sm:text-5xl">
                  Una experiencia diseñada para cada lado de la mesa
                </h2>
                <p className="mt-4 text-sm font-medium leading-relaxed text-brand-700/80">
                  DataFud separa la interfaz del cliente final del panel
                  administrativo del restaurante. Todo fluye de forma asincrónica
                  con máxima velocidad y fiabilidad.
                </p>
              </div>
            </RevealOnView>

            <RevealOnView className="grid gap-6 sm:grid-cols-2 sm:gap-8">
              {views.map((v) => (
                <div
                  key={v.title}
                  className="reveal-up flex flex-col rounded-2xl border border-stone-200/80 bg-cream-50/30 p-7 transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-accent-300/60 hover:shadow-[0_12px_40px_rgba(34,80,58,0.08)] sm:p-8"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent-300 bg-brand-600 text-white shadow-sm">
                    <Icon name={v.icon} size={20} />
                  </span>
                  <span className="mt-6 text-[10px] font-bold uppercase tracking-widest text-accent-600">
                    {v.tag}
                  </span>
                  <h3 className="mt-1 font-display text-xl text-brand-900">{v.title}</h3>

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
              ))}
            </RevealOnView>
          </div>
        </div>
      </section>

      {/* Precios y NFC */}
      <PricingV2 />

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-6 sm:pb-32">
        <RevealOnView>
          <div className="reveal-up relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-3xl border border-accent-400/35 px-6 py-20 text-center sm:min-h-[480px] sm:px-8 sm:py-24">
            <div className="absolute inset-0 z-0">
              <Image
                src="/cta-bg.png"
                alt="Atmósfera de restaurante premium DataFud"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-brand-900/90 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-900/80 to-brand-950" />
              <div className="qr-grid pointer-events-none absolute inset-0 opacity-[0.06]" />
            </div>

            <div className="pointer-events-none absolute bottom-0 left-[20%] top-0 z-10 hidden border-l border-white/5 sm:block" />
            <div className="pointer-events-none absolute bottom-0 right-[20%] top-0 z-10 hidden border-r border-white/5 sm:block" />

            <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
              <h2 className="font-display text-3xl leading-tight text-accent-100 sm:text-5xl">
                Lleva la carta de tu restaurante al siguiente nivel
              </h2>
              <p className="mt-4 max-w-lg text-sm font-medium leading-relaxed text-brand-100/90">
                Únete a las sodas, cafeterías y restaurantes que ya digitalizaron su
                carta y su flujo de trabajo con DataFud.
              </p>
              <Link
                href="/register"
                className="mt-10 inline-flex h-12 items-center justify-center rounded-lg border border-accent-300 bg-accent-500 px-8 text-xs font-bold uppercase tracking-widest text-brand-900 shadow-md transition-all duration-300 ease-out-expo hover:bg-accent-400 hover:shadow-lg active:scale-[0.98]"
              >
                Crear mi cuenta gratis
              </Link>
            </div>
          </div>
        </RevealOnView>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-250/60 bg-cream-100 text-brand-900">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-12 border-b border-stone-250/50 pb-14 md:grid-cols-[1.5fr_1fr_1fr]">
            <div className="flex max-w-sm flex-col items-start">
              <Image
                src="/logo-main.png"
                alt="DataFud"
                width={150}
                height={62}
                className="h-9 w-auto"
              />
              <p className="mt-6 text-[13px] font-medium leading-relaxed text-brand-800/80">
                Plataforma de menú digital, comandas inalámbricas y análisis de
                ventas en tiempo real para sodas y restaurantes de Latinoamérica.
              </p>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-700/60">
                Explorar
              </h4>
              <nav className="mt-6 flex flex-col gap-3.5 text-xs font-bold uppercase tracking-widest text-brand-750">
                <a href="#como-funciona" className="transition-colors hover:text-brand-950">
                  Cómo funciona
                </a>
                <a href="#vistas" className="transition-colors hover:text-brand-950">
                  El sistema
                </a>
                <a href="#planes" className="transition-colors hover:text-brand-950">
                  Planes y Precios
                </a>
                <Link href="/preview" className="transition-colors hover:text-brand-950">
                  Probar Demo
                </Link>
              </nav>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-700/60">
                Contacto
              </h4>
              <div className="mt-6 flex flex-col gap-3.5 text-xs font-semibold text-brand-800/85">
                <p className="flex items-center gap-2">
                  <span className="font-bold text-accent-500">●</span> info@datafud.com
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-bold text-accent-500">●</span> Costa Rica &amp; Latinoamérica
                </p>
                <Link
                  href="/login"
                  className="mt-2 inline-flex h-9 w-28 items-center justify-center rounded-lg border border-stone-300 bg-white/70 text-[10px] font-bold uppercase tracking-widest text-brand-850 transition-all hover:border-stone-400 hover:bg-white"
                >
                  Ingresar
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 pt-10 text-[10px] font-bold uppercase tracking-widest text-brand-700/60 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} DATAFUD · UN PRODUCTO DE{" "}
              <span className="text-accent-600">GALODEV</span>
            </p>
            <p>DATAFUD.COM · HECHO EN LATINOAMÉRICA</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
