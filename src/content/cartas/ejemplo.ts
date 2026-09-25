import { mockMenuPayload } from "@/lib/demo/mock";
import type { CartaEstatica } from "./types";

// Carta de muestra que se enseña a los prospectos (`/c/ejemplo`, también detrás de /q/demo26).
// Reutiliza el restaurante ficticio "Verde Limón" del modo demo. No se indexa: es un ejemplo,
// no el local de nadie.
export const ejemplo: CartaEstatica = {
  slug: "ejemplo",
  indexable: false,
  menu: {
    ...mockMenuPayload,
    table: { id: "carta", label: "" },
  },
};
