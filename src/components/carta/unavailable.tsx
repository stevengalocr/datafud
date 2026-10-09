import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { unavailableCopy } from "@/lib/i18n/dictionaries";

type Kind = "menu" | "qr";

// Aviso de carta no disponible (AA-10, AA-11). Llega gente con el teléfono en la mano frente a
// una mesa, muchas veces turistas: se muestra en español y en inglés a la vez, con la marca y
// sin correos (regla 10). Sin E/S: lo importan páginas de 404 (ver Trampas en CLAUDE.md).
export function CartaUnavailable({ kind, children }: { kind: Kind; children?: React.ReactNode }) {
  const es = unavailableCopy.es;
  const en = unavailableCopy.en;
  const title: [string, string] = kind === "qr" ? [es.qrTitle, en.qrTitle] : [es.menuTitle, en.menuTitle];
  const body: [string, string] = kind === "qr" ? [es.qrBody, en.qrBody] : [es.menuBody, en.menuBody];

  return (
    <CartaNotice icon="qr" title={title} body={body}>
      {children}
    </CartaNotice>
  );
}

export function CartaNotice({
  icon,
  title,
  body,
  children,
}: {
  icon: "qr" | "x";
  title: [es: string, en: string];
  body: [es: string, en: string];
  children?: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream-50 px-4 py-10 font-sans text-brand-900 antialiased">
      <div
        aria-hidden="true"
        className="qr-grid pointer-events-none absolute inset-x-0 top-0 h-[55vh] [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="DataFud" className="rounded-md">
            <Image src="/logo-main.png" alt="DataFud" width={170} height={70} priority className="h-11 w-auto" />
          </Link>
        </div>
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-panel-lg sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream-100 text-brand-700">
            <Icon name={icon} size={20} />
          </span>
          <h1 className="mt-4 font-display text-[1.75rem] leading-tight text-brand-900">{title[0]}</h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">{body[0]}</p>
          <div lang="en" className="mt-5 border-t border-stone-200 pt-5">
            <p className="font-display text-lg leading-tight text-brand-900">{title[1]}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{body[1]}</p>
          </div>
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </main>
  );
}
