import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const plans = [
  {
    code: "basico",
    name: "Básico",
    price: 29,
    highlight: false,
    tagline: "Para empezar tu menú digital",
    features: [
      "1 idioma",
      "Hasta 30 platillos",
      "5 categorías",
      "8 mesas con QR",
      "Órdenes en tiempo real",
      "Reportes básicos",
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
      "Hasta 100 platillos",
      "20 categorías",
      "30 mesas con QR",
      "Reportes avanzados",
      "Branding completo (colores y logo)",
    ],
  },
  {
    code: "empresarial",
    name: "Empresarial",
    price: 99,
    highlight: false,
    tagline: "Sin límites para crecer",
    features: [
      "3 idiomas (ES / EN / PT)",
      "Platillos ilimitados",
      "Categorías ilimitadas",
      "Mesas/QR ilimitadas",
      "Reportes avanzados",
      "Branding completo + soporte prioritario",
    ],
  },
];

export function Pricing() {
  return (
    <section id="planes" className="mx-auto max-w-6xl px-5 py-20">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Un plan para cada negocio
        </h2>
        <p className="mt-3 text-slate-600">
          Precios en dólares, mensuales. Empieza con una prueba gratis, sin tarjeta.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.code}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-white p-7 shadow-sm",
              plan.highlight
                ? "border-brand-500 ring-2 ring-brand-500"
                : "border-slate-200"
            )}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
                Más popular
              </span>
            )}
            <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-slate-900">
                ${plan.price}
              </span>
              <span className="text-slate-500">/mes</span>
            </div>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-600">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
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
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={`/register?plan=${plan.code}`}
              className={cn(
                "mt-7 inline-flex h-11 items-center justify-center rounded-lg font-medium transition-colors",
                plan.highlight
                  ? "bg-brand-500 text-white hover:bg-brand-600"
                  : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
              )}
            >
              Empezar con {plan.name}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
