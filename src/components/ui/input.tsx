import { cn } from "@/lib/utils/cn";

// Campos de los paneles. Texto de 16 px en el teléfono (con menos, iOS hace zoom al enfocar) y
// 14 px desde `sm`. Borde stone-300 sobre blanco y foco con borde y halo verde de marca.
// Inválido en rosa: con `aria-invalid` (error del servidor) o con `:user-invalid` (el navegador
// lo marca solo después de que la persona tocó el campo o intentó enviar, no al cargar).
const field =
  "w-full rounded-lg border border-stone-300 bg-white text-base text-brand-950 transition-[border-color,box-shadow] duration-150 shadow-panel-xs placeholder:text-stone-500 hov:border-stone-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:bg-cream-100 disabled:text-stone-600 aria-[invalid=true]:border-rose-600 aria-[invalid=true]:focus:ring-rose-500/25 user-invalid:border-rose-600 user-invalid:focus:ring-rose-500/25 sm:text-sm";

export function Input({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return <input className={cn(field, "h-11 px-3 sm:h-10", className)} {...props} />;
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-stone-800", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return <select className={cn(field, "h-11 cursor-pointer px-3 sm:h-10", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return <textarea className={cn(field, "px-3 py-2", className)} {...props} />;
}

/** Ayuda, error o confirmación bajo un campo. Con `tone="error"` se anuncia a lectores de pantalla. */
export function FieldHint({
  tone = "muted",
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & { tone?: "muted" | "error" | "success" }) {
  return (
    <p
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "text-sm",
        // Error y confirmación aparecen por algo que hizo la persona: bajan 4 px al llegar.
        tone !== "muted" && "panel-notice",
        { error: "text-rose-800", success: "text-brand-700", muted: "text-stone-600" }[tone],
        className
      )}
      {...props}
    />
  );
}
