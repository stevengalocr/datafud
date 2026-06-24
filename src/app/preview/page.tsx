import Link from "next/link";
import Image from "next/image";
import { Icon, type IconName } from "@/components/ui/icon";
import { RESTAURANT } from "@/lib/demo/mock";

const cards: { href: string; title: string; desc: string; icon: IconName; tag: string }[] = [
  {
    href: "/preview/cliente",
    title: "Menú del comensal",
    desc: "Lo que ve el cliente al escanear el QR. Carta interactiva, arma su pedido y lo envía a cocina. Pruébalo: es funcional.",
    icon: "smartphone",
    tag: "Interactivo",
  },
  {
    href: "/preview/dashboard",
    title: "Panel del restaurante",
    desc: "El centro de mando: comandas en vivo, menú, ventas del día y platillos más vendidos.",
    icon: "store",
    tag: "Operación",
  },
  {
    href: "/preview/admin",
    title: "Administración del SaaS",
    desc: "La vista del dueño de DataFud: restaurantes, planes, pagos y cargos de todos los clientes.",
    icon: "shield",
    tag: "Super admin",
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
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-200 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400" />
            Recorrido demo
          </span>
          <h1 className="mt-6 font-display text-4xl leading-tight text-cream-100 sm:text-5xl">
            Conoce DataFud con <span className="text-accent-300">{RESTAURANT.name}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-relaxed text-cream-100/80 sm:text-base">
            Un restaurante ficticio montado de punta a punta. Recorre las tres caras del
            sistema tal como las vive un cliente real — los datos son de ejemplo, pero el
            flujo es 100% funcional.
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
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent-600">{c.tag}</span>
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

        <p className="mt-10 text-center text-xs font-semibold uppercase tracking-widest text-brand-700/40">
          Un producto de GaloDev · DataFud
        </p>
      </main>
    </div>
  );
}
