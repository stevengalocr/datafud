import { cn } from "@/lib/utils/cn";

// Botones de los paneles. `cn` solo concatena (no resuelve conflictos de Tailwind): por eso cada
// variante es completa y `className` sirve para layout (ancho, márgenes), no para recolorear.
// Hover con `hov:` (solo con mouse: en el teléfono el :hover se queda pegado después del toque).
type Variant = "primary" | "secondary" | "ghost" | "danger" | "soft" | "danger-soft";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  // Primario: la única superficie con sombra propia (brillo arriba, apoyo abajo). Es lo que
  // se presiona en servicio y tiene que leerse como un objeto, no como un rectángulo pintado.
  primary: "bg-brand-600 text-cream-50 shadow-btn-primary hov:bg-brand-700",
  secondary:
    "border border-stone-300 bg-white text-brand-900 shadow-panel-xs hov:border-stone-400 hov:bg-cream-100",
  ghost: "bg-transparent text-stone-700 hov:bg-cream-100 hov:text-brand-900",
  danger: "bg-rose-700 text-white shadow-panel-xs hov:bg-rose-800",
  // Acciones de fila: presentes pero sin competir con el contenido de la tabla.
  soft: "bg-cream-100 text-brand-900 hov:bg-cream-200",
  "danger-soft": "bg-rose-50 text-rose-800 hov:bg-rose-100",
};

const sizes: Record<Size, string> = {
  // 44 px en el teléfono (objetivo táctil mínimo, se usan con el dedo en servicio) y 36-40 px
  // con mouse desde `sm`.
  sm: "h-11 px-3 text-sm sm:h-9",
  md: "h-11 px-4 text-sm sm:h-10",
  lg: "h-12 px-6 text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return cn(
    // El foco lo pinta la regla global :focus-visible (contorno dorado), igual que en la landing.
    // Al presionar baja a 0.97 en 160 ms: la confirmación de que la interfaz escuchó el toque.
    "inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium [-webkit-tap-highlight-color:transparent] transition-[transform,background-color,border-color,color,box-shadow] duration-[160ms] ease-out-expo active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60 data-[pending=true]:cursor-progress data-[pending=true]:opacity-90",
    variants[variant],
    sizes[size]
  );
}

/** Tres puntos que laten mientras algo se envía. El texto del botón ya dice qué pasa. */
export function PendingDots() {
  return (
    <span aria-hidden="true" className="submit-dots inline-flex items-center gap-[3px]">
      <span className="h-1 w-1 rounded-full bg-current" />
      <span className="h-1 w-1 rounded-full bg-current" />
      <span className="h-1 w-1 rounded-full bg-current" />
    </span>
  );
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  /** Enviando: queda deshabilitado (no hay doble envío), muestra `pendingText` y los puntos. */
  pending?: boolean;
  /** Texto mientras `pending` ("Guardando…"). Sin él, se conserva el texto normal. */
  pendingText?: React.ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  pending = false,
  pendingText,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonClasses(variant, size), className)}
      disabled={disabled || pending}
      data-pending={pending || undefined}
      aria-busy={pending || undefined}
      {...props}
    >
      {pending ? (
        <>
          <PendingDots />
          {pendingText ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
