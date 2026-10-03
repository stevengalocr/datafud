"use client";

import { PanelError } from "@/components/shell/panel-states";

// Error de una página del panel: se muestra dentro del shell, con reintento y el código (digest).
export default function PanelErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PanelError error={error} reset={reset} />;
}
