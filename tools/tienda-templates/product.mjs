import { page, hueco, huecoIn, txt, esc, isPending, productUrl, cardSub, CATS, SITE } from './lib.mjs';

const sec = (id, title, inner, cls = '', hiddenMsg = '') => `${hiddenMsg ? `<!-- Oculta hasta ${hiddenMsg}: quitar "hidden" para mostrarla -->\n` : ''}<section class="pdp-sec ${cls}"${id ? ` id="${id}"` : ''}${hiddenMsg ? ' hidden' : ''}><div class="wrap">${title ? `<h2 class="sec-title"><span class="caps">${esc(title)}</span></h2>` : ''}${inner}</div></section>`;

export function product(p, productos) {
  const n = p.slug.replace(/^producto-/, '');
  const real = !isPending(p.nombre) && p.imagenes.length > 0 && p.precio != null;
  const hasImg = p.imagenes.length > 0;
  const mainMedia = hasImg ? `<img id="g-main-img" src="${esc(p.imagenes[0])}" alt="${esc(p.nombre)}" width="800" height="800">` : hueco('foto principal del producto', '1/1');
  const thumbs = hasImg
    ? p.imagenes.map((src, i) => `<button type="button" class="g-thumb" data-src="${esc(src)}" aria-label="Ver foto ${i + 1}"><img src="${esc(src)}" alt="" width="120" height="120" loading="lazy"></button>`).join('')
    : [1, 2, 3, 4].map((i) => `<div>${hueco('miniatura ' + i, '1/1')}</div>`).join('');

  const catName = (CATS.find(([id]) => id === p.categoria) || [, p.categoria])[1];
  const incluye = (p.incluye || []).map((id) => productos.find((x) => x.id === id)).filter(Boolean);
  const crumbName = isPending(p.nombre) ? `Producto ${n}` : p.nombre;
  const ld = [{
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Mónaco', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Tienda', item: SITE + '/tienda' },
      { '@type': 'ListItem', position: 3, name: catName, item: SITE + '/tienda/productos/#' + p.categoria },
      { '@type': 'ListItem', position: 4, name: crumbName, item: SITE + productUrl(p) },
    ],
  }];
  if (real) {
    ld.push({
      '@context': 'https://schema.org', '@type': 'Product', name: p.nombre,
      image: p.imagenes.map((i) => (i.startsWith('http') ? i : SITE + i)),
      brand: { '@type': 'Brand', name: p.marca },
      offers: { '@type': 'Offer', url: SITE + productUrl(p), priceCurrency: 'EUR', price: (p.precio / 100).toFixed(2), availability: 'https://schema.org/InStock' },
    });
  }

  const faq = [1, 2, 3, 4, 5, 6].map((i) => `<details class="acc"><summary>${huecoIn('pregunta ' + i)}</summary><div class="acc-body">${hueco('respuesta ' + i, '16/4')}</div></details>`).join('');

  const main = `
<div class="wrap"><nav class="crumbs" aria-label="Migas de pan"><a href="/">Mónaco</a> / <a href="/tienda">Tienda</a> / <a href="/tienda/productos/#${p.categoria}">${esc(catName)}</a> / <span>${txt(crumbName)}</span></nav></div>
<section class="wrap pdp" aria-label="Producto">
  <div class="gallery">
    <div class="g-main" data-cat="${p.categoria}">${mainMedia}</div>
    <div class="g-thumbs">${thumbs}</div>
  </div>
  <div class="pdp-info">
    <h1>${txt(p.nombre)}</h1>
    <p class="card-sub">${cardSub(p)}</p>
    <p>${esc(p.descripcion)}</p>
    <ul class="benefits">${p.beneficios.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
    ${incluye.length ? `<div class="incluye"><h2>Incluye</h2><ul>${incluye.map((x) => `<li><a href="${productUrl(x)}">${esc(x.nombre)}</a></li>`).join('')}</ul></div>` : ''}
    <div class="pdp-price" data-price-for="${p.id}"><span class="price-soon">Precio próximamente</span></div>
    <div class="buy">
      <div class="qty" role="group" aria-label="Cantidad"><button type="button" data-pdp-q="-1" aria-label="Menos">&minus;</button><output id="pdp-qty" aria-live="polite">1</output><button type="button" data-pdp-q="1" aria-label="Más">+</button></div>
      <button type="button" class="btn" id="add-main" data-add="${p.id}" data-add-label="1" disabled>Precio próximamente</button>
    </div>
    <p>Preparamos tu pedido en 24-48 h. Envío gratis en pedidos de 49 € o más. Recogida gratis en la barbería.</p>
    <div>
      ${p.ingredientes ? `<details class="acc"><summary>Ingredientes</summary><div class="acc-body"><p>${esc(p.ingredientes)}</p></div></details>` : ''}
      ${p.modo_uso ? `<details class="acc"><summary>Modo de uso</summary><div class="acc-body"><p>${esc(p.modo_uso)}</p></div></details>` : ''}
    </div>
    <!-- Oculto hasta tener reseñas de clientes: quitar "hidden" para mostrarlo -->
    <div hidden>
      <div>${hueco('reseña destacada', '16/6')}</div>
      <a class="more-reviews" href="#resenas">Ver reseñas</a>
    </div>
  </div>
</section>

${sec('resultados', 'Resultados reales', `<div class="split">${hueco('antes', '3/4')}${hueco('después', '3/4')}</div>`, 'sec-alt')}
${sec('cifras', 'Cifras', `<div class="stats">${[1, 2, 3].map((i) => hueco('cifra ' + i, '4/3')).join('')}</div>`)}
${p.pasos
  ? sec('como-usarlo', 'Cómo usarlo', `<div class="steps steps-full">${p.pasos.map((x) => `<div><h3>${esc(x.titulo)}</h3><p>${esc(x.texto)}</p></div>`).join('')}</div>`, 'sec-alt')
  : sec('como-usarlo', 'Cómo usarlo', `<div class="split"><div class="steps">${[1, 2, 3, 4].map((i) => `<div><h3>${huecoIn('paso ' + i)}</h3>${hueco('texto del paso ' + i, '16/7')}</div>`).join('')}</div>${hueco('vídeo de uso', '9/16')}</div>`, 'sec-alt', 'tener el modo de uso')}
${sec('evolucion', 'Evolución', `<div class="timeline">${[['1', 'día 1'], ['7', 'día 7'], ['30', 'día 30']].map(([k, l]) => `<div><h3>${huecoIn(l)}</h3>${hueco('foto del ' + l, '3/4')}</div>`).join('')}</div>`)}
${sec('opinion', 'Opinión del barbero', `<div class="split">${hueco('foto del barbero', '3/4')}${hueco('opinión del barbero', '16/9')}</div>`, 'sec-alt')}
${sec('comparativa', 'Comparativa', `<div class="compare">${hueco('comparativa: criterios', '4/3')}${hueco('comparativa: Mónaco', '4/3')}${hueco('comparativa: otros', '4/3')}</div>`)}
${p.ingredientes_destacados
  ? sec('ingredientes-destacados', 'Ingredientes destacados', `<div class="grid3">${p.ingredientes_destacados.map((x) => `<div class="ing-card"><h3>${esc(x.nombre)}</h3><p>${esc(x.beneficio)}</p></div>`).join('')}</div>`, 'sec-alt')
  : sec('ingredientes-destacados', 'Ingredientes destacados', `<div class="grid3">${[1, 2, 3].map((i) => hueco('ingrediente destacado ' + i, '1/1')).join('')}</div>`, 'sec-alt', 'tener los ingredientes destacados')}
${sec('pruebas', 'Pruebas', `<div class="split">${hueco('pruebas y datos', '16/9')}${hueco('pruebas: imagen', '16/9')}</div>`)}
${sec('faq', 'Preguntas frecuentes', `<div class="faq" style="max-width:780px;margin-inline:auto">${faq}</div>`, 'sec-alt')}
${sec('gente-real', 'Vídeos de clientes', `<div class="grid4">${[1, 2, 3, 4].map((i) => hueco('vídeo de cliente ' + i, '9/16')).join('')}</div>`, '', 'tener los vídeos de clientes')}
<section class="on-green" aria-label="Prensa"><div class="wrap"><div class="logos">${[1, 2, 3, 4, 5].map((i) => hueco('logo de prensa ' + i, '3/1')).join('')}</div></div></section>
${sec('resenas', 'Reseñas', `<div class="reviews-box">${hueco('valoración media y resumen', '16/4')}${hueco('reseñas de clientes', '16/6')}</div>`, '', 'tener reseñas de clientes')}

<div class="sticky-add" aria-label="Añadir al carrito">
  <span class="s-name">${txt(p.nombre)}</span>
  <button type="button" class="btn" data-add="${p.id}" data-add-label="1" disabled>Precio próximamente</button>
</div>`;

  return page({
    title: `${p.nombre} ${p.marca} | Tienda Mónaco Barbershop`,
    description: p.resumen,
    path: productUrl(p),
    bodyClass: 'pdp-page',
    bodyAttrs: `data-product-id="${p.id}"`,
    productos, main, jsonld: ld,
  });
}
