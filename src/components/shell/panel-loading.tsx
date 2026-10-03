// Esqueleto de carga de los paneles (admin/loading.tsx y dashboard/loading.tsx). Reserva el
// lugar de la cabecera, las cifras y una tabla para que la página no salte al llegar los datos.
// El pulso parte de opacidad completa y la regla global de reduced-motion lo apaga.
function Bar({ className }: { className: string }) {
  return <div className={`rounded-md bg-cream-200 ${className}`} />;
}

export function PanelLoading() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse">
      <span className="sr-only">Cargando…</span>
      <Bar className="mb-3 h-3 w-24" />
      <Bar className="mb-3 h-8 w-56" />
      <Bar className="mb-8 h-4 w-80 max-w-full" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-stone-200 bg-white px-5 py-4">
            <Bar className="h-4 w-20" />
            <Bar className="mt-3 h-7 w-12" />
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-5">
        <Bar className="h-4 w-40" />
        {[0, 1, 2].map((i) => (
          <Bar key={i} className="mt-4 h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
