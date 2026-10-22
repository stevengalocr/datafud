import Image from "next/image";
import { Icon, type IconName } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { StatCard } from "@/components/shell/stat-card";
import { RevealOnView } from "@/components/marketing/v2/reveal";
import { PasosEscena } from "@/components/marketing/v2/pasos-escena";
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from "@/lib/constants";
import { NEXT_ACTION, isActive } from "@/app/dashboard/_lib/order-status";
import { localDayKey } from "@/lib/dates";
import { formatCrc } from "@/lib/currency/format";
import { dict } from "@/lib/i18n/dictionaries";
import { mockDailySales, mockOrderItems, mockOrders, mockProducts, mockTableLabels, mockTopProducts } from "@/lib/demo/mock";

// Sección #sistema: el sistema completo (Estándar y Empresarial) en acción, con los componentes
// reales del panel (Card, Badge, StatCard, estados y acciones de las órdenes) y los datos de la
// soda de ejemplo. Cuatro pasos: el comensal pide desde la mesa, la orden entra en «Por atender»,
// avanza de estado hasta cobrarse y el día se ve en los reportes. Ilustrativo: va rotulado y el
// marco es aria-hidden (la demo navegable es /preview/dashboard). Sin «tiempo real» ni promesas.

const PASOS: { titulo: string; texto: string; icon: IconName }[] = [
  { titulo: "Piden desde la mesa", texto: "El comensal elige en tu carta y envía la orden desde su teléfono, sin app y sin cuenta.", icon: "smartphone" },
  { titulo: "Entra al panel", texto: "La orden llega a «Por atender» con la mesa, lo que pidieron y la nota para la cocina.", icon: "receipt" },
  { titulo: "La seguís hasta cobrar", texto: "En preparación, lista, entregada y pagada: un toque en cada paso.", icon: "check" },
  { titulo: "Ves cómo va el día", texto: "Órdenes, lo vendido y los platillos que más salen, en tus reportes.", icon: "chart" },
];

// La orden que se sigue en la escena: la de la Mesa 3 de la demo.
const ORDEN = mockOrders.find((o) => o.id === "o-1")!;
const ITEMS = mockOrderItems["o-1"];
const MESA = mockTableLabels[ORDEN.table_id ?? ""] ?? "Mesa 3";
const FOTO = mockProducts.find((p) => p.id === "p-casado")?.image_url ?? null;
// Otras órdenes del tablero, para que no se vea vacío.
const OTRAS = ["o-3", "o-2"].map((id) => {
  const o = mockOrders.find((x) => x.id === id)!;
  return { o, mesa: mockTableLabels[o.table_id ?? ""] ?? "", items: mockOrderItems[id] };
});
const ESTADOS = ["pending", "preparing", "ready", "delivered", "paid"] as const;
const SEMANA = [...mockDailySales].sort((a, b) => a.day.localeCompare(b.day)).slice(-7);
const MAX = Math.max(...SEMANA.map((d) => d.revenue));
const DIAS = ["D", "L", "K", "M", "J", "V", "S"];
// Las cifras de hoy, calculadas como en /preview/dashboard con los mismos datos de ejemplo.
const HOY = localDayKey();
const DE_HOY = mockOrders.filter((o) => localDayKey(o.created_at) === HOY);
const VENDIDO_HOY = DE_HOY.filter((o) => o.status === "paid" || o.status === "delivered").reduce((s, o) => s + Number(o.total), 0);
const POR_ATENDER = mockOrders.filter((o) => isActive(o.status)).length;

export function SistemaSection() {
  return (
    <section id="sistema" data-fondo="qr" className="fondo-vivo scroll-mt-24 border-b border-stone-200/60 bg-cream-50">
      <PasosEscena pasos={4} className="sis-pista">
        <div className="sis-escena mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-6 sm:py-24 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-14 lg:py-0">
          {/* Texto y pasos */}
          <div>
            <RevealOnView>
              <div className="reveal-up">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">Sistema completo · Estándar y Empresarial</p>
                <h2 className="mt-3 font-display text-[clamp(2rem,4.6vw,3.25rem)] leading-[1.05] tracking-tight text-brand-900">
                  De la mesa al cierre del día, en un solo panel
                </h2>
                <p className="sis-bajada mt-4 max-w-md text-base font-medium leading-relaxed text-brand-800/80">
                  Así se ve el panel que reciben los planes con pedidos. Datos de una soda de ejemplo.
                </p>
              </div>
            </RevealOnView>
            <ol className="mt-8 space-y-2.5">
              {PASOS.map((p, i) => (
                <li key={p.titulo} data-paso-n={i} className="sis-paso flex gap-4 rounded-2xl border border-transparent p-3.5">
                  <span className="sis-paso-icono flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-stone-250 bg-white text-brand-700">
                    <Icon name={p.icon} size={17} />
                  </span>
                  <span>
                    <span className="block font-display text-lg leading-tight text-brand-900">
                      <span className="mr-2 text-accent-700">{String(i + 1).padStart(2, "0")}</span>
                      {p.titulo}
                    </span>
                    <span className="sis-paso-texto mt-1 block text-sm font-medium leading-relaxed text-brand-700/80">{p.texto}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* El panel, en escena */}
          <div className="sis-marco-host relative">
            <p className="sr-only">
              Ilustración del panel del restaurante con datos de ejemplo: una orden de la {MESA} entra en «Por atender», avanza de estado y
              las ventas de la semana aparecen en los reportes.
            </p>
            <div aria-hidden="true" className="sis-marco relative overflow-hidden rounded-2xl border border-stone-200 bg-cream-50 shadow-panel-lg">
              {/* Barra de la ventana */}
              <div className="flex items-center gap-2 border-b border-stone-200 bg-white px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-stone-250" />
                <span className="h-2.5 w-2.5 rounded-full bg-stone-250" />
                <span className="h-2.5 w-2.5 rounded-full bg-stone-250" />
                <span className="ml-3 truncate text-xs font-semibold text-stone-600">Panel del restaurante · Verde Limón</span>
                <span className="ml-auto rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-accent-800">Demo</span>
              </div>

              {/* Alto fijo solo con movimiento (globals.css): quieto, el panel se ve completo. */}
              <div className="sis-vista relative">
                <div className="sis-rollo space-y-4 p-4 sm:p-5">
                  {/* Cifras de hoy */}
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3 [&_p]:text-[11px] sm:[&_p]:text-sm [&_p+p]:!text-[15px] [&_p+p]:[overflow-wrap:normal] [&_p+p]:whitespace-nowrap sm:[&_p+p]:!text-2xl [&>div]:px-2.5 sm:[&>div]:px-5">
                    <StatCard label="Órdenes hoy" value={DE_HOY.length.toLocaleString("es-CR")} icon="receipt" />
                    <StatCard label="Vendido hoy" value={formatCrc(VENDIDO_HOY)} icon="wallet" accent="accent" />
                    <StatCard label="Por atender" value={POR_ATENDER.toLocaleString("es-CR")} icon="clock" accent="slate" />
                  </div>

                  {/* Por atender */}
                  <div>
                    <p className="text-sm font-semibold text-brand-900">
                      Por atender <span className="font-normal tabular-nums text-stone-600">({POR_ATENDER})</span>
                    </p>
                    <ul className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                      {/* La orden nueva: aparece en el paso 2 y cambia de estado en el 3. */}
                      <li className="sis-nueva">
                        <Card className="relative h-full p-4 ring-2 ring-accent-300/70">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-display text-lg leading-tight text-brand-950">{MESA}</p>
                              <p className="mt-0.5 text-xs text-stone-700">
                                <span className="font-semibold tabular-nums text-brand-950">{formatCrc(Number(ORDEN.total))}</span>
                                <span className="text-stone-600"> · Ahora</span>
                              </p>
                            </div>
                            <span className="sis-estados relative">
                              {ESTADOS.map((e) => (
                                <Badge key={e} data-estado={e} className={`${ORDER_STATUS_COLOR[e]} sis-estado`}>{ORDER_STATUS_LABEL[e]}</Badge>
                              ))}
                            </span>
                          </div>
                          <ul className="mt-3 space-y-1 text-xs">
                            {ITEMS.map((it) => (
                              <li key={it.id} className="flex justify-between gap-2">
                                <span className="text-brand-950"><span className="font-semibold tabular-nums">{it.quantity}×</span> {it.product_name_snapshot}</span>
                                <span className="tabular-nums text-stone-600">{formatCrc(Number(it.line_total))}</span>
                              </li>
                            ))}
                          </ul>
                          {ORDEN.customer_note && (
                            <p className="mt-2.5 rounded-lg bg-accent-50 px-2.5 py-1.5 text-xs text-accent-900">
                              <span className="font-semibold">Nota:</span> {ORDEN.customer_note}
                            </p>
                          )}
                          <span className="sis-accion relative mt-3 block h-9">
                            {(["pending", "preparing", "ready", "delivered"] as const).map((e) => (
                              <span key={e} data-estado={e} className={`${buttonClasses("primary", "sm")} sis-boton absolute inset-0 w-full`}>{NEXT_ACTION[e]}</span>
                            ))}
                          </span>
                        </Card>
                      </li>
                      {OTRAS.map(({ o, mesa, items }) => (
                        <li key={o.id} className="sis-otra">
                          <Card className="h-full p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-display text-lg leading-tight text-brand-950">{mesa}</p>
                                <p className="mt-0.5 text-xs font-semibold tabular-nums text-brand-950">{formatCrc(Number(o.total))}</p>
                              </div>
                              <Badge className={ORDER_STATUS_COLOR[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
                            </div>
                            <ul className="mt-3 space-y-1 text-xs text-brand-950">
                              {items.map((it) => (
                                <li key={it.id}><span className="font-semibold tabular-nums">{it.quantity}×</span> {it.product_name_snapshot}</li>
                              ))}
                            </ul>
                          </Card>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Reportes: el panel baja hasta acá en el paso 4. */}
                  <div className="grid gap-2.5 sm:grid-cols-[1.25fr_1fr]">
                    <Card className="p-4">
                      <p className="text-sm font-semibold text-brand-900">Ventas de la semana</p>
                      <div className="mt-4 flex h-32 items-end gap-2">
                        {SEMANA.map((d, i) => (
                          <div key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                            <span className="sis-barra w-full rounded-t-md bg-brand-600" style={{ height: `${Math.round((d.revenue / MAX) * 100)}%`, transitionDelay: `${i * 60}ms` }} />
                            <span className="text-[10px] font-semibold text-stone-600">{DIAS[new Date(`${d.day}T12:00:00`).getDay()]}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                    <Card className="p-4">
                      <p className="text-sm font-semibold text-brand-900">Lo que más sale</p>
                      <ul className="mt-3 space-y-2.5">
                        {mockTopProducts.slice(0, 3).map((t, i) => (
                          <li key={t.name}>
                            <p className="flex justify-between gap-2 text-xs">
                              <span className="truncate text-brand-950">{t.name}</span>
                              <span className="tabular-nums text-stone-600">{t.units}</span>
                            </p>
                            <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-cream-200">
                              <span className="sis-top block h-full rounded-full bg-accent-500" style={{ width: `${Math.round((t.units / mockTopProducts[0].units) * 100)}%`, transitionDelay: `${i * 90}ms` }} />
                            </span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                </div>
              </div>

              {/* El teléfono del comensal (paso 1): la orden antes de enviarse. */}
              <div className="sis-telefono absolute bottom-5 left-5 w-[190px] rounded-[1.6rem] border-[7px] border-brand-950 bg-cream-50 shadow-panel-lg sm:w-[210px]">
                <div className="flex items-center gap-2.5 border-b border-stone-200 p-3">
                  {FOTO && (
                    <span className="relative h-10 w-10 overflow-hidden rounded-lg bg-cream-100">
                      <Image src={FOTO} alt="" fill sizes="40px" className="object-cover" />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold text-brand-900">{dict.es.yourOrder}</span>
                    <span className="block truncate text-[10px] text-stone-600">{MESA} · {ITEMS[0].quantity}× {ITEMS[0].product_name_snapshot}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2.5 text-[11px]">
                  <span className="font-semibold text-stone-600">{dict.es.total}</span>
                  <span className="font-bold tabular-nums text-brand-950">{formatCrc(Number(ORDEN.total))}</span>
                </div>
                <div className="px-3 pb-3">
                  <span className="sis-enviar flex h-9 items-center justify-center rounded-lg bg-brand-600 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                    {dict.es.sendOrder}
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-brand-700/75">Panel de demostración · datos de ejemplo</p>
          </div>
        </div>
      </PasosEscena>
    </section>
  );
}
