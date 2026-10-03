import { cn } from "@/lib/utils/cn";

// Superficie de los paneles: blanco sobre el crema de la página, borde cálido y sin sombra
// genérica (la sombra no aporta jerarquía cuando todo es una tarjeta).
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-stone-200 bg-white", className)}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex min-h-14 items-center gap-3 border-b border-stone-100 px-5 py-3", className)}
      {...props}
    />
  );
}

/** Título de una tarjeta: es un h2 para que la página tenga un esquema navegable. */
export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-base font-semibold text-brand-900", className)}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
