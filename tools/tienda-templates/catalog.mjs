import { page, card, sectionTitle, esc } from './lib.mjs';

export function catalog(productos, categorias) {
  const chips = [['todo', 'Todo'], ...categorias.map((c) => [c.id, c.nombre])]
    .map(([id, n]) => `<button type="button" class="chip" data-filter="${id}" aria-pressed="${id === 'todo'}">${esc(n)}</button>`).join('');
  const secs = categorias.map((c) => {
    const ps = productos.filter((p) => p.categoria === c.id);
    return `<section class="cat-sec" id="${c.id}" data-cat-sec="${c.id}">
    <h2 class="cat-title">${esc(c.nombre)}</h2>
    <div class="cat-grid">
${ps.map((p, i) => card(p, 'catalogo', i)).join('\n')}
    </div>
  </section>`;
  }).join('\n  ');
  const main = `
<div class="wrap"><nav class="crumbs" aria-label="Migas de pan"><a href="/">Mónaco</a> / <a href="/tienda">Tienda</a> / <span>Todos los productos</span></nav></div>
<section class="sec bg-white catalog">
  <div class="wrap">
    ${sectionTitle('', 'Todos los productos').replace('<h2', '<h1').replace('</h2>', '</h1>')}
    <div class="chips" role="group" aria-label="Filtrar por categoría">${chips}</div>
    ${secs}
  </div>
</section>`;
  return page({
    title: 'Todos los productos | Tienda Mónaco Barbershop',
    description: 'Productos de peinado, champús, barba y tratamientos que usamos en Mónaco Barbershop, en Vigo.',
    path: '/tienda/productos', productos, main, jsonld: [],
  });
}
