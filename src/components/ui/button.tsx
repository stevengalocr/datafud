import { cn } from "@/lib/utils/cn";

// Botones de los paneles. `cn` solo concatena (no resuelve conflictos de Tailwind): por eso cada
// variante es completa y `className` sirve para layout (ancho, márgenes), no para recolorear.
type Variant = "primary" | "secondary" | "ghost" | "danger" | "soft" | "danger-soft";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-cream-50 hover:bg-brand-700",
  secondary: "border border-stone-300 bg-white text-brand-900 hover:border-stone-400 hover:bg-cream-100",
  ghost: "bg-transparent text-stone-700 hover:bg-cream-100 hover:text-brand-900",
  danger: "bg-rose-700 text-white hover:bg-rose-800",
  // Acciones de fila: presentes pero sin competir con el contenido de la tabla.
  soft: "bg-cream-100 text-brand-900 hover:bg-cream-200",
  "danger-soft": "bg-rose-50 text-rose-800 hover:bg-rose-100",
};

const sizes: Record<Size, string> = {
  // 36 px en escritorio y 40 px en el teléfono: se usan en servicio, con el dedo.
  sm: "h-10 px-3 text-sm sm:h-9",
  md: "h-11 px-4 text-sm sm:h-10",
  lg: "h-12 px-6 text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return cn(
    // El foco lo pinta la regla global :focus-visible (contorno dorado), igual que en la landing.
    "inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-[transform,background-color,border-color,color] duration-150 ease-out-expo active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
    variants[variant],
    sizes[size]
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return <button type={type} className={cn(buttonClasses(variant, size), className)} {...props} />;
}
