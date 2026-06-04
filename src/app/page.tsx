import Link from "next/link";
import Image from "next/image";
import { LandingNav } from "@/components/marketing/landing-nav";
import { Pricing } from "@/components/marketing/pricing";

const steps = [
  {
    n: "1",
    title: "Crea tu menú",
    desc: "Carga categorías y platillos con foto, precio y descripción en hasta 3 idiomas. Personaliza colores y logo.",
  },
  {
    n: "2",
    title: "Imprime tus QR",
    desc: "Cada mesa recibe un código QR único. El cliente escanea y ve tu menú al instante, desde cualquier teléfono.",
  },
  {
    n: "3",
    title: "Recibe órdenes",
    desc: "Las órdenes llegan a tu panel en tiempo real. Tú controlas el estado: en preparación, lista, entregada.",
  },
  {
    n: "4",
    title: "Mide y crece",
    desc: "Reportes de platos del día, montos vendidos y ticket promedio. Toma decisiones con datos reales.",
  },
];

const views = [
  {
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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50 to-white" />
        <div className="relative mx-auto max-w-6xl px-5 py-24 text-center">
          <span className="inline-flex items-center rounded-full border border-brand-200 bg-white px-3 py-1 text-sm font-medium text-brand-700">
            Menú digital + órdenes por QR
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            El menú digital que hace crecer tu restaurante o soda
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Tus clientes piden desde su mesa escaneando un QR. Tú controlas todo
            el negocio en tiempo real: platillos, órdenes, reportes y más.
            Multi-idioma, multi-moneda y 100% personalizable.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-brand-500 px-7 text-base font-semibold text-white hover:bg-brand-600"
            >
              Probar gratis
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-7 text-base font-semibold text-slate-800 hover:bg-slate-50"
            >
              Ver demo
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Prueba con la cuenta demo · sin tarjeta de crédito
          </p>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Cómo funciona
          </h2>
          <p className="mt-3 text-slate-600">
            De cero a recibir órdenes por QR en minutos.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 font-bold text-white">
                {s.n}
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Las 3 vistas */}
      <section id="vistas" className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Un sistema, tres experiencias
            </h2>
            <p className="mt-3 text-slate-600">
              Cada quien ve exactamente lo que necesita.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {views.map((v) => (
              <div
                key={v.title}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7"
              >
                <span className="text-sm font-semibold text-brand-600">
                  {v.tag}
                </span>
                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  {v.title}
                </h3>
                <ul className="mt-5 space-y-3 text-sm text-slate-600">
                  {v.points.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <svg
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.1 3.1 6.8-6.8a1 1 0 011.4 0z"
                          clipRule="evenodd"
                        />
                      </svg>
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
        <div className="rounded-3xl bg-brand-500 px-8 py-14 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Lleva tu menú al siguiente nivel
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50">
            Únete a los restaurantes y sodas que ya digitalizaron su servicio con
            DataFud.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-white px-7 text-base font-semibold text-brand-700 hover:bg-brand-50"
          >
            Crear mi cuenta gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
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
