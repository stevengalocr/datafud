import Link from "next/link";
import Image from "next/image";
import { LandingNav } from "@/components/marketing/landing-nav";
import { Pricing } from "@/components/marketing/pricing";
import { Icon, type IconName } from "@/components/ui/icon";

const steps: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: "utensils",
    title: "Crea tu menú",
    desc: "Carga categorías y platillos con foto, precio y descripción en hasta 3 idiomas. Personaliza colores y logo.",
  },
  {
    icon: "qr",
    title: "Imprime tus QR",
    desc: "Cada mesa recibe un código QR único. El cliente escanea y ve tu menú al instante, desde cualquier teléfono.",
  },
  {
    icon: "receipt",
    title: "Recibe órdenes",
    desc: "Las órdenes llegan a tu panel en tiempo real. Tú controlas el estado: en preparación, lista, entregada.",
  },
  {
    icon: "chart",
    title: "Mide y crece",
    desc: "Reportes de platos del día, montos vendidos y ticket promedio. Toma decisiones con datos reales.",
  },
];

const views: { icon: IconName; tag: string; title: string; points: string[] }[] = [
  {
    icon: "smartphone",
    tag: "Para tus clientes",
    title: "Menú virtual al instante",
    points: [
      "Acercan el celular a la tarjeta NFC y listo.",
      "Menú 100% personalizable: colores, logo, fotos.",
      "Disponible en español, inglés y portugués.",
      "Arman su pedido y lo envían a la cocina.",
    ],
  },
  {
    icon: "store",
    tag: "Para tu restaurante",
    title: "Panel de control total",
    points: [
      "Gestiona platillos y mesas en segundos.",
      "Tablero de órdenes en vivo con estados.",
      "Reportes de platos del día y montos vendidos.",
      "Configura tu moneda (toda Latam) e idiomas.",
    ],
  },
];

const highlights: { icon: IconName; label: string }[] = [
  { icon: "clock", label: "Listo en 48 horas" },
  { icon: "globe", label: "3 idiomas (ES · EN · PT)" },
  { icon: "wallet", label: "Monedas de Latam" },
  { icon: "zap", label: "Órdenes en tiempo real" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream-50">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="qr-grid absolute inset-0 opacity-70" />
        <div className="absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-brand-100/50 blur-3xl" />
        <div className="absolute right-0 top-20 h-[360px] w-[360px] rounded-full bg-accent-100/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:py-28">
          <div className="reveal">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-sm font-medium text-brand-700">
              <Icon name="qr" size={15} />
              QR Menus · Orders · Analytics
            </span>
            <h1 className="mt-6 font-display text-4xl leading-[1.07] text-slate-900 sm:text-5xl lg:text-6xl">
              El menú digital que abre apetito{" "}
              <span className="text-brand-600">y cierra ventas</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Tus clientes piden desde su mesa escaneando un QR. Tú controlas todo
              el negocio en tiempo real: platillos, órdenes, reportes y más.
              Multi-idioma, multi-moneda y 100% a tu marca.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-7 text-base font-semibold text-white transition-[transform,background-color] duration-200 ease-out hover:bg-brand-700 active:scale-[0.98]"
              >
                Quiero mi DataFud
                <Icon name="arrow-right" size={18} />
              </Link>
              <Link
                href="/preview"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-7 text-base font-semibold text-slate-800 transition-colors duration-200 hover:bg-cream-100"
              >
                Ver demo en vivo
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Listo y operando en 48 horas · desde $29/mes
            </p>
          </div>

          {/* Visual del producto */}
          <div className="reveal">
            <div className="relative animate-[scale-in_0.7s_cubic-bezier(0.23,1,0.32,1)_both]">
              <Image
                src="/banner.png"
                alt="Menú digital DataFud: tarjeta para escanear, app en el teléfono y platillos"
                width={1000}
                height={620}
                priority
                className="h-auto w-full drop-shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* Franja de highlights */}
        <div className="relative border-t border-stone-200/70 bg-white/60">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-5 py-6 sm:grid-cols-4">
            {highlights.map((h) => (
              <div key={h.label} className="flex items-center gap-2.5 px-2 text-sm text-slate-700">
                <Icon name={h.icon} size={18} className="text-brand-500" />
                {h.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-5 py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">
            Cómo funciona
          </p>
          <h2 className="mt-2 font-display text-4xl text-slate-900">
            De cero a recibir órdenes por QR en minutos
          </h2>
        </div>
        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title}>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <Icon name={s.icon} size={20} />
                </span>
                <span className="font-display text-2xl text-stone-300">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Las 3 vistas */}
      <section id="vistas" className="border-y border-stone-200/70 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">
              El sistema completo
            </p>
            <h2 className="mt-2 font-display text-3xl text-slate-900 sm:text-4xl">
              Una experiencia para cada lado de la mesa
            </h2>
            <p className="mt-3 text-slate-600">Cada quien ve exactamente lo que necesita.</p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {views.map((v) => (
              <div
                key={v.title}
                className="flex flex-col rounded-2xl border border-stone-200 bg-cream-50 p-7 transition-shadow duration-200 hover:shadow-[0_12px_40px_rgba(34,80,58,0.08)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white">
                  <Icon name={v.icon} size={22} />
                </span>
                <span className="mt-5 text-sm font-semibold text-accent-600">{v.tag}</span>
                <h3 className="mt-1 font-display text-2xl text-slate-900">{v.title}</h3>
                <ul className="mt-5 space-y-3 text-sm text-slate-600">
                  {v.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5">
                      <Icon name="check" size={18} className="mt-0.5 flex-shrink-0 text-brand-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Pricing />

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-brand-700 px-8 py-16 text-center">
          <div className="qr-grid absolute inset-0 opacity-[0.12]" />
          <div className="relative">
            <h2 className="font-display text-4xl text-white sm:text-5xl">
              Lleva tu menú al siguiente nivel
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-100">
              Únete a los restaurantes y sodas que ya digitalizaron su servicio con
              DataFud.
            </p>
            <Link
              href="/register"
              className="mt-9 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 text-base font-semibold text-brand-700 transition-transform duration-200 ease-out hover:bg-cream-100 active:scale-[0.98]"
            >
              Crear mi cuenta gratis
              <Icon name="arrow-right" size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="flex flex-col gap-8 border-b border-white/10 pb-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-sm">
              <Image
                src="/logo-main.png"
                alt="DataFud"
                width={150}
                height={62}
                className="h-9 w-auto brightness-0 invert"
              />
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Menú digital, órdenes por NFC y reportes para restaurantes y sodas
                de toda Latinoamérica.
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <a href="#como-funciona" className="hover:text-white">Cómo funciona</a>
              <a href="#vistas" className="hover:text-white">El sistema</a>
              <a href="#planes" className="hover:text-white">Planes</a>
              <Link href="/login" className="hover:text-white">Ingresar</Link>
            </nav>
          </div>
          <div className="flex flex-col gap-3 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} DataFud · Un producto de{" "}
              <span className="font-semibold text-accent-400">GaloDev</span> · Todos los
              derechos reservados
            </p>
            <p className="tracking-wide text-slate-500">DATAFUD.COM · MADE IN LATAM</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
