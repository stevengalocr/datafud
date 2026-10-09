import { Icon, type IconName } from "@/components/ui/icon";
import { PageHeader } from "@/components/shell/page-header";

// Marco de las demos de los paneles (/preview/dashboard y /preview/admin). Los paneles reales son
// una página por sección dentro de un menú lateral; la demo es estática y cabe en una sola
// página, así que cada sección va con su cabecera real y el menú pasa a ser un índice de anclas
// con los mismos nombres. Nada acá guarda datos: los botones se dibujan, no se pueden usar.

export type PanelSection = { id: string; label: string; icon: IconName };

export function PanelFrame({
  label,
  sections,
  children,
}: {
  label: string;
  sections: PanelSection[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream-50 text-stone-900">
      <main id="contenido" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10 [overflow-wrap:anywhere]">
        <h1 className="mb-1 font-display text-xl text-brand-900">{label}</h1>
        <p className="mb-4 text-sm text-stone-600">
          Los datos son de ejemplo y los botones están dibujados: acá no se guarda nada.
        </p>
        <nav aria-label="Secciones del panel" className="mb-10 border-b border-stone-200 pb-4">
          <ul className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-700 hov:bg-cream-100 hov:text-brand-900"
                >
                  <Icon name={s.icon} size={16} className="shrink-0 text-stone-500" />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-16">{children}</div>
      </main>
    </div>
  );
}

/** Una sección de la demo: la página real de ese nombre, con su cabecera. */
export function PanelSectionBlock({
  id,
  title,
  eyebrow,
  description,
  action,
  children,
}: {
  id: string;
  title: string;
  eyebrow?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-label={title} className="scroll-mt-16">
      <PageHeader as="h2" title={title} eyebrow={eyebrow} description={description} action={action} />
      {children}
    </section>
  );
}

/** Botón dibujado: se ve como el real, se anuncia como botón no disponible y no hace nada. */
export function FakeAction({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <button type="button" aria-disabled="true" tabIndex={-1} className={`${className} pointer-events-none`}>
      {children}
    </button>
  );
}
