import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

// Marco de las pantallas de acceso (/login, su aviso sin backend y la entrada privada): el crema,
// la serif y el verde de la landing, con la retícula QR de la marca desvaneciéndose desde arriba.
// Antes /login usaba la paleta slate genérica y la entrada privada era una tarjeta azul noche
// que no se parecía a DataFud.
export function AuthFrame({
  eyebrow,
  title,
  description,
  children,
  footer,
  logoHref = "/",
}: {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** `null` deja el logo sin enlace. */
  logoHref?: string | null;
}) {
  const logo = (
    <Image src="/logo-main.png" alt="DataFud" width={170} height={70} priority className="h-11 w-auto" />
  );

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream-50 px-4 py-10 font-sans text-brand-900 antialiased sm:px-5">
      <div
        aria-hidden="true"
        className="qr-grid pointer-events-none absolute inset-x-0 top-0 h-[55vh] [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
      {/* Entrada de una vez por visita: logo, tarjeta y pie suben 6 px en cascada (40 ms). Solo
          transform: si la animación no corre, todo está en su lugar y visible. */}
      <div className="panel-stagger relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          {logoHref ? (
            <Link href={logoHref} aria-label="DataFud — inicio" className="rounded-md">
              {logo}
            </Link>
          ) : (
            logo
          )}
        </div>

        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-panel-lg sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-700">{eyebrow}</p>
          <h1 className="mt-2 font-display text-[1.875rem] leading-tight text-brand-900">{title}</h1>
          {description && (
            <div className="mt-3 text-sm leading-relaxed text-stone-600">{description}</div>
          )}
          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-stone-600">{footer}</div>}
      </div>
    </main>
  );
}

/** Mensaje de error de un formulario de acceso, anunciado a lectores de pantalla. */
export function AuthError({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <p
      id={id}
      role="alert"
      className="panel-notice flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-800"
    >
      <Icon name="x" size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
