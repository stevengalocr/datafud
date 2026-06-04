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
    tag: "Para el cliente",
    title: "Menú virtual por QR",
    points: [
      "Escanea el QR de su mesa, sin instalar nada.",
      "Menú 100% personalizable: colores, logo, fotos.",
      "Disponible en español, inglés y portugués.",
      "Arma su pedido y lo envía a la cocina.",
    ],
  },
  {
    icon: "store",
    tag: "Para el restaurante",
    title: "Panel de control total",
    points: [
      "Gestiona platillos, categorías y mesas.",
      "Tablero de órdenes en vivo con estados.",
      "Reportes de platos del día y montos vendidos.",
      "Configura tu moneda (toda Latam) e idiomas.",
    ],
  },
  {
    icon: "grid",
    tag: "Para el dueño del SaaS",
    title: "Administración global",
    points: [
      "Aprueba o suspende a cada restaurante.",
      "Controla pagos y fechas de vencimiento.",
      "Gestiona los planes Básico, Estándar y Empresarial.",
      "Métricas de todos tus clientes en un lugar.",
    ],
  },
];

const highlights: { icon: IconName; label: string }[] = [
  { icon: "globe", label: "3 idiomas (ES · EN · PT)" },
  { icon: "wallet", label: "Todas las monedas de Latam" },
  { icon: "zap", label: "Órdenes en tiempo real" },
  { icon: "shield", label: "Datos seguros por negocio" },
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
            <h1 className="mt-6 font-display text-5xl leading-[1.05] text-slate-900 sm:text-6xl">
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
                Probar gratis
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
              30 días de prueba · sin tarjeta de crédito
            </p>
          </div>

          {/* Mockup de teléfono con el menú */}
          <div className="reveal flex justify-center lg:justify-end">
            <PhoneMockup />
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
            <h2 className="mt-2 font-display text-4xl text-slate-900">
              Un sistema, tres experiencias
            </h2>
            <p className="mt-3 text-slate-600">Cada quien ve exactamente lo que necesita.</p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
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
      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row">
          <Image
            src="/logo-main.png"
            alt="DataFud"
            width={130}
            height={54}
            className="h-8 w-auto"
          />
          <p>© {new Date().getFullYear()} DataFud. Menú digital para restaurantes y sodas.</p>
        </div>
      </footer>
    </div>
  );
}

// Mockup de teléfono mostrando el menú del cliente.
function PhoneMockup() {
  return (
    <div className="relative w-[300px] animate-[scale-in_0.7s_cubic-bezier(0.23,1,0.32,1)_both]">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-2xl border-2 border-accent-300/60" />
      <div className="relative rounded-[2.6rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl">
        <div className="overflow-hidden rounded-[1.9rem] bg-cream-50">
          {/* Header del menú */}
          <div className="bg-brand-700 px-5 pb-6 pt-7 text-white">
            <p className="font-display text-xl">Soda Demo</p>
            <p className="text-xs text-brand-100">Mesa 1 · Menú digital</p>
          </div>
          {/* Platillo destacado */}
          <div className="space-y-3 p-4">
            <div className="overflow-hidden rounded-xl">
              <Image
                src="https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&q=70"
                alt="Casado"
                width={280}
                height={150}
                className="h-32 w-full object-cover"
              />
            </div>
            <MenuRow name="Casado" desc="Arroz, frijoles, carne" price="₡3 500" />
            <MenuRow name="Gallo Pinto" desc="Típico costarricense" price="₡2 500" />
            <MenuRow name="Fresco Natural" desc="Del día" price="₡1 200" />
          </div>
          {/* Barra de orden */}
          <div className="border-t border-stone-200 p-4">
            <div className="flex items-center justify-between rounded-xl bg-brand-600 px-4 py-3 text-white">
              <span className="text-sm font-semibold">Enviar orden · 2</span>
              <span className="text-sm font-semibold">₡4 700</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuRow({ name, desc, price }: { name: string; desc: string; price: string }) {
  return (
    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">{name}</p>
        <p className="text-xs text-slate-500">{desc}</p>
        <p className="mt-0.5 text-sm font-semibold text-brand-600">{price}</p>
      </div>
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-500 text-white">
        <Icon name="plus" size={15} />
      </span>
    </div>
  );
}
