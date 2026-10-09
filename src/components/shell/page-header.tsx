// Cabecera de cada página de los paneles: título en la serif de marca, una línea de contexto y,
// a la derecha (abajo en el teléfono), la acción principal de la página.
export function PageHeader({
  title,
  description,
  eyebrow,
  action,
  as: Heading = "h1",
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  /** Nivel del título; la demo (varias secciones en una página) usa h2. */
  as?: "h1" | "h2";
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-accent-700">
            {eyebrow}
          </p>
        )}
        <Heading className="break-words font-display text-[1.75rem] leading-tight text-brand-900 sm:text-[2rem]">
          {title}
        </Heading>
        {description && (
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-stone-600">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </header>
  );
}
