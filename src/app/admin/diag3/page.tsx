// DIAGNÓSTICO TEMPORAL (no se sube): la página real de /admin dentro de una red de seguridad.
import AdminHome from "../page";
import { Boundary } from "../diag/boundary";
export const dynamic = "force-dynamic";
export default function Diag3() {
  return <Boundary name="pagina /admin completa"><AdminHome /></Boundary>;
}
