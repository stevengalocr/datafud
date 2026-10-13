// Prueba de la parte pura de «Pasar una Carta al sistema» (src/lib/carta-a-sistema.ts).
// npm run test:carta · sin red ni base. Node 22.6+ (tipos quitados con --experimental-strip-types).
import { planDeCarta, destinoMesa } from "../src/lib/carta-a-sistema.ts";
import assert from "node:assert/strict";
const base = { tenant:{id:"t",name:"x",slug:"x"}, table:{id:"carta",label:""},
  settings:{currency_code:"CRC",default_language:"es",enabled_languages:["es","en"],theme:{primary:"#22503a",accent:"bad"},logo_url:"/cartas/soda/logo.webp",restaurant_name:" Soda X "},
  categories:[{id:"c2",name_i18n:{es:"Bocas"},sort_order:5},{id:"c1",name_i18n:{es:"Desayunos",en:"Breakfast"},sort_order:1}],
  products:[{id:"p1",category_id:"c1",name_i18n:{es:"Gallo pinto"},description_i18n:{es:" rico "},price:2500,image_url:"/cartas/soda/pinto.webp",sort_order:2},
            {id:"p2",category_id:"zz",name_i18n:{es:"Café"},description_i18n:{},price:900,image_url:"https://abc.supabase.co/x.webp",sort_order:1},
            {id:"p3",category_id:"c2",name_i18n:{es:"Patacones"},description_i18n:{},price:1800,image_url:"/cartas/soda/pinto.webp",sort_order:3}]};
const r = planDeCarta(base as any);
assert.ok(r.ok);
if (r.ok) {
  const p = r.plan;
  assert.deepEqual(p.categorias.map(c=>[c.clave,c.sort_order]), [["c1",1],["c2",2]]);
  assert.deepEqual(p.platillos.map(x=>x.name_i18n.es), ["Café","Gallo pinto","Patacones"]);
  assert.equal(p.platillos[0].categoria, null);             // categoría inexistente -> sin categoría
  assert.equal(p.platillos[0].image_url, "https://abc.supabase.co/x.webp");
  assert.equal(p.platillos[1].foto, "/cartas/soda/pinto.webp");
  assert.equal(p.platillos[1].description_i18n.es, "rico");
  assert.deepEqual(p.fotos.sort(), ["/cartas/soda/logo.webp","/cartas/soda/pinto.webp"]); // sin repetidas
  assert.deepEqual(p.ajustes.theme, {primary:"#22503a"});
  assert.equal(p.ajustes.restaurant_name, "Soda X");
}
const malo = structuredClone(base); malo.products[0].image_url = "/../etc/passwd.webp"; malo.products[1].price = -1;
malo.products[2].name_i18n.es = "x".repeat(81); malo.settings.default_language = "pt";
const r2 = planDeCarta(malo as any); assert.ok(!r2.ok); if(!r2.ok){ assert.equal(r2.errores.length, 4); }
const r3 = planDeCarta({...base, products:[{...base.products[0], image_url:"http://x.com/a.webp"}]} as any); assert.ok(!r3.ok);
const r4 = planDeCarta({...base, products:[{...base.products[0], image_url:"/demo/platos/a.webp"}]} as any); assert.ok(r4.ok);
assert.equal(destinoMesa("soda","tok"), "/m/soda/tok");
console.log("planDeCarta: ok");
