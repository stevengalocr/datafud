import { cn } from "@/lib/utils/cn";

// Etiqueta de estado. El color sale de las constantes (*_STATUS_COLOR) y el texto siempre dice
// el estado: el color nunca es la única señal.
export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
        className
      )}
      {...props}
    />
  );
}
