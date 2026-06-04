import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { Icon, type IconName } from "@/components/ui/icon";

const plans = [
  {
    code: "basico",
    name: "Básico",
    price: 29,
    highlight: false,
    tagline: "Para empezar tu menú digital",
    features: [
      "1 idioma",
      "Hasta 20 platillos",
      "Órdenes en tiempo real",
      "Reportes básicos",
      "Soporte por correo",
    ],
  },
  {
    code: "estandar",
    name: "Estándar",
    price: 49,
    highlight: true,
    tagline: "El favorito de las sodas y restaurantes",
    features: [
      "2 idiomas",
      "Hasta 70 platillos",
      "Órdenes en tiempo real",
      "Reportes avanzados",
      "Soporte prioritario",
    ],
  },
  {
    code: "empresarial",
    name: "Empresarial",
    price: 99,
    highlight: false,
    tagline: "Sin límites para crecer",
    features: [
      "3 idiomas (ES · EN · PT)",
      "Platillos ilimitados",
      "Órdenes en tiempo real",
      "Reportes avanzados",
      "Soporte dedicado",
    ],
  },
];

const setupIncludes: { icon: IconName; label: string }[] = [
  { icon: "zap", label: "Listo y operando en 48 horas" },
  { icon: "globe", label: "Landing 100% personalizada con dominio propio" },
  { icon: "shield", label: "1 año de soporte de tu landing" },
];

const nfcSteps = [
  { n: "1", title: "Toca", desc: "El cliente acerca su celular a la tarjeta NFC." },
  { n: "2", title: "Ordena", desc: "Navega el menú y pide sin esperar." },
  { n: "3", title: "Disfruta", desc: "La orden llega directo a tu cocina." },
];

export function Pricing() {
  return (
    <section id="planes" className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
      <div className="mb-12 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">
          Planes y precios
        </p>
        <h2 className="mt-2 font-display text-3xl text-slate-900 sm:text-4xl">
          Una inversión que se paga sola
        </h2>
        <p className="mt-3 text-slate-600">
          Implementación única y una mensualidad simple. Sin contratos atados.
        </p>
      </div>

      {/* Implementación única */}
      <div className="mb-14 overflow-hidden rounded-3xl bg-brand-700 text-white">
        <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[auto_1fr] lg:items-center">
          <div>
            <p className="text-sm font-medium text-brand-100">Implementación única</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-6xl">$249</span>
              <span className="text-brand-100">una vez</span>
            </div>
            <p className="mt-2 text-sm text-brand-100">
              Luego, desde <span className="font-semibold text-white">$29/mes</span>
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3 lg:border-l lg:border-white/15 lg:pl-10">
            {setupIncludes.map((s) => (
              <li key={s.label} className="flex flex-col gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Icon name={s.icon} size={20} />
                </span>
                <span className="text-sm text-brand-50">{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Planes mensuales */}
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.code}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-white p-7 transition-shadow duration-200 hover:shadow-[0_12px_40px_rgba(34,80,58,0.08)]",
              plan.highlight ? "border-brand-500 ring-2 ring-brand-500" : "border-stone-200"
            )}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-500 px-3 py-1 text-xs font-semibold text-white">
                Más popular
              </span>
            )}
            <h3 className="font-display text-2xl text-slate-900">{plan.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="font-display text-5xl text-slate-900">${plan.price}</span>
              <span className="text-slate-500">/mes</span>
            </div>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-600">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Icon name="check" size={18} className="mt-0.5 flex-shrink-0 text-brand-500" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={`/register?plan=${plan.code}`}
              className={cn(
                "mt-7 inline-flex h-11 items-center justify-center rounded-xl font-semibold transition-[transform,background-color] duration-200 ease-out active:scale-[0.98]",
                plan.highlight
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : "border border-stone-300 bg-white text-slate-800 hover:bg-cream-100"
              )}
            >
              Empezar con {plan.name}
            </Link>
          </div>
        ))}
      </div>

      {/* Add-on: Tarjetas NFC */}
      <div className="mt-14 overflow-hidden rounded-3xl border border-stone-200 bg-white">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[240px]">
            <Image
              src="/nfc.png"
              alt="Cliente acercando su celular a una tarjeta NFC de DataFud"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="p-8 sm:p-10">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-700">
                Complemento
              </span>
              <span className="flex items-baseline gap-1">
                <span className="font-display text-3xl text-slate-900">$15</span>
                <span className="text-sm text-slate-500">por tarjeta</span>
              </span>
            </div>
            <h3 className="mt-4 font-display text-2xl text-slate-900">
              Tarjetas NFC para tus mesas
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Tus clientes solo acercan el celular y el menú aparece al instante.
              Suma las tarjetas que necesites, una por mesa.
            </p>
            <ul className="mt-6 space-y-4">
              {nfcSteps.map((s) => (
                <li key={s.n} className="flex gap-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {s.n}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{s.title}</p>
                    <p className="text-sm text-slate-500">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
