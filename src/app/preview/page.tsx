import Link from "next/link";
import Image from "next/image";
import { Icon, type IconName } from "@/components/ui/icon";

const cards: { href: string; title: string; desc: string; icon: IconName }[] = [
  {
    href: "/preview/admin",
    title: "Panel del dueño del SaaS",
    desc: "Resumen de clientes, restaurantes, pagos y planes. Lo que tú controlas.",
    icon: "store",
  },
  {
    href: "/preview/dashboard",
    title: "Panel del restaurante",
    desc: "Resumen del negocio, órdenes en vivo, menú y reportes del día.",
    icon: "utensils",
  },
  {
    href: "/preview/cliente",
    title: "Menú del cliente (QR)",
    desc: "Lo que ve el comensal al escanear el QR de su mesa. Puede pedir.",
    icon: "smartphone",
  },
];

export default function PreviewIndex() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-5 py-16">
        <div className="mb-2 flex justify-center">
          <Image src="/logo-main.png" alt="DataFud" width={180} height={74} className="h-12 w-auto" />
        </div>
        <p className="text-center text-sm text-slate-500">
          Modo demostración · datos de ejemplo, sin base de datos conectada
        </p>

        <div className="mt-10 grid gap-4">
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 transition-colors duration-200 hover:border-brand-300 hover:bg-brand-50/40"
            >
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon name={c.icon} size={22} />
              </span>
              <div>
                <p className="font-semibold text-slate-900">{c.title}</p>
                <p className="text-sm text-slate-500">{c.desc}</p>
              </div>
              <Icon
                name="arrow-right"
                size={20}
                className="ml-auto text-stone-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand-500"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
