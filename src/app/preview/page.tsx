import Link from "next/link";
import Image from "next/image";
import { Icon, type IconName } from "@/components/ui/icon";
import type { Metadata } from "next";
import { RESTAURANT } from "@/lib/demo/mock";

export const metadata: Metadata = {
  title: "Demo: Verde Limón",
  description: "Probá DataFud con un restaurante de ejemplo: la carta del comensal y el panel del local, sin registrarte.",
  alternates: { canonical: "/preview" },
};

// Orden de venta: primero el plan Carta (lo que se entrega en 48 h), después los pedidos en
// mesa y el panel, que viven en Estándar y Empresarial.
const cards: { href: string; title: string; desc: string; icon: IconName; tag: string }[] = [
  {
    href: "/preview/carta",
    title: "Carta digital (plan Carta)",
    desc: "Lo que ve el comensal al escanear el QR: la carta con fotos, precios en colones y cambio entre español e inglés. Se ordena con el salonero, como siempre.",
    icon: "smartphone",
    tag: "Plan Carta",
  },
  {
    href: "/preview/cliente",
    title: "Carta con pedidos",
    desc: "La misma carta, pero el comensal arma su pedido y lo manda a cocina desde la mesa. Probalo, funciona.",
    icon: "receipt",
    tag: "Estándar y Empresarial",
  },
  {
    href: "/preview/dashboard",
    title: "Panel del restaurante",
    desc: "Lo que ves vos con el sistema completo: comandas, menú, ventas del día y platillos más vendidos.",
    icon: "store",
    tag: "Estándar y Empresarial",
  },
];

export default function PreviewIndex() {
  return (
    <div className="min-h-screen bg-cream-50 font-sans text-brand-900">
      {/* Cabecera con cover */}
      <header className="relative isolate overflow-hidden">
        <Image src={RESTAURANT.cover} alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-brand-950/75" />
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)", backgroundSize: "22px 22px" }}
        />
        <div className="relative mx-auto max-w-3xl px-5 py-16 text-center sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-accent-200">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400" />
            Recorrido demo
          </span>
          <h1 className="mt-6 font-display text-4xl leading-tight text-cream-100 sm:text-5xl">
            Conocé DataFud con <span className="text-accent-300">{RESTAURANT.name}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-relaxed text-cream-100/80 sm:text-base">
            Un restaurante ficticio montado de punta a punta. Recorré la carta del comensal y
            el panel del local tal como los vería tu negocio: los datos son de ejemplo, pero el
            flujo funciona.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <div className="grid gap-4">
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group flex items-center gap-5 rounded-2xl border border-stone-200/80 bg-white p-5 transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-accent-300/70 hover:shadow-[0_18px_44px_-22px_rgba(34,80,58,0.4)] sm:p-6"
            >
              <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-accent-300/50 bg-brand-600 text-white shadow-sm">
                <Icon name={c.icon} size={24} />
              </span>
              <div className="min-w-0">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-accent-700">{c.tag}</span>
                <p className="font-display text-xl text-brand-900">{c.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-brand-700/75">{c.desc}</p>
              </div>
              <Icon
                name="arrow-right"
                size={22}
                className="ml-auto hidden flex-shrink-0 text-stone-300 transition-transform duration-300 ease-out-expo group-hover:translate-x-1 group-hover:text-accent-500 sm:block"
              />
            </Link>
          ))}
        </div>

        <p className="mt-10 text-center text-xs font-semibold uppercase tracking-widest text-brand-700/75">
          DataFud · Costa Rica
        </p>
      </main>
    </div>
  );
}
