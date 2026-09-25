import Link from "next/link";

// La demo abre por el plan Carta: es lo que se vende primero. "Con pedidos" queda de segundo
// porque vive en Estándar y Empresarial.
//
// Las etiquetas vienen en dos largos porque la barra mide 41 px fijos y `MenuClient` cuenta con
// esa altura para pegar los chips de categoría (`top: demo ? 41 : 0`). Con los textos largos, a
// 375 px la fila se partía en tres y se montaba sobre la cabecera de la carta.
const links = [
  { href: "/preview/carta", corto: "Carta", largo: "Plan Carta" },
  { href: "/preview/cliente", corto: "Pedidos", largo: "Con pedidos" },
  { href: "/preview/dashboard", corto: "Panel", largo: "Panel restaurante" },
];

function Etiqueta({ corto, largo }: { corto: string; largo: string }) {
  return (
    <>
      <span className="sm:hidden">{corto}</span>
      <span className="hidden sm:inline">{largo}</span>
    </>
  );
}

export function PreviewBanner({ active }: { active?: string }) {
  return (
    <div className="sticky top-0 z-50 border-b border-brand-800/40 bg-brand-950 text-cream-100">
      <div className="mx-auto flex h-[41px] max-w-6xl items-center gap-x-3 px-4 text-sm sm:gap-x-4">
        <span className="flex flex-shrink-0 items-center gap-2 rounded-full bg-accent-500 px-2.5 py-0.5 text-xs font-bold uppercase tracking-widest text-brand-950">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-950" />
          Demo
        </span>
        <span className="hidden text-xs text-cream-100/60 md:inline">Verde Limón · datos de ejemplo</span>
        <nav className="ml-auto flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest sm:gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                active === l.href
                  ? "whitespace-nowrap text-accent-300"
                  : "whitespace-nowrap text-cream-100/70 transition-colors hover:text-white"
              }
            >
              <Etiqueta corto={l.corto} largo={l.largo} />
            </Link>
          ))}
          <Link href="/" className="whitespace-nowrap text-cream-100/50 transition-colors hover:text-white">
            <Etiqueta corto="Salir" largo="Volver a DataFud" />
          </Link>
        </nav>
      </div>
    </div>
  );
}
