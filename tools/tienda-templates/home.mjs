import { page, card, carousel, hueco, huecoIn, sectionTitle, productUrl, txt, esc } from './lib.mjs';

export function home(productos) {
  const feat = productos.find((p) => p.destacado) || productos[0];
  const rest = productos.filter((p) => p !== feat);
  const cinta = Array.from({ length: 6 }, () => `<span class="cinta-item">${huecoIn('condición de envío')}</span>`).join('');
  const featMedia = feat.imagenes && feat.imagenes[0]
    ? `<img src="${esc(feat.imagenes[0])}" alt="${esc(feat.nombre)}" width="600" height="600">`
    : hueco('foto del producto protagonista', '1/1');

  const main = `
<section class="hero" aria-label="Producto protagonista">
  <div class="wrap">
    <div>
      <h1><span class="it">${huecoIn('titular en cursiva')}</span><span class="caps">${huecoIn('titular en mayúsculas')}</span></h1>
      <p>${huecoIn('línea de apoyo')}</p>
      <a class="btn" href="${productUrl(feat)}" data-list="portada" data-item="${feat.id}" data-index="0">Comprar</a>
    </div>
    <div class="hero-media">${featMedia}</div>
  </div>
</section>

<div class="cinta" aria-label="Información de envío"><div class="cinta-track">${cinta}${cinta.replace(/class="cinta-item"/g, 'class="cinta-item" aria-hidden="true"')}</div></div>

<section class="sec" id="mas-vendidos">
  <div class="wrap">
    ${sectionTitle('¿Primera vez?', 'Los más vendidos')}
    ${carousel(rest.map((p, i) => card(p, 'mas_vendidos', i)), 'c3', 'Los más vendidos')}
  </div>
</section>

<section class="manifiesto on-green" aria-label="Manifiesto">
  <div class="wrap">
    <p class="quote">${huecoIn('frase de la casa')}</p>
    <p class="sign">${huecoIn('firma')}</p>
    <a class="link-ul" href="/">Conocer la barbería</a>
  </div>
</section>

<section class="sec" id="packs">
  <div class="wrap">
    ${sectionTitle('', 'Packs')}
    ${carousel([1, 2, 3].map((n) => `<div class="card">${hueco('pack ' + n, '1/1')}</div>`), 'c3', 'Packs')}
  </div>
</section>

<section class="sec sec-alt" id="clientes">
  <div class="wrap">
    ${sectionTitle('', 'Clientes')}
    <div class="review-card">
      <div class="ba">${hueco('antes', '3/4')}${hueco('después', '3/4')}</div>
      <div class="review-text">${hueco('reseña de cliente', '16/9')}${huecoIn('nombre del cliente')}</div>
    </div>
  </div>
</section>

<section class="sec" id="barberos">
  <div class="wrap">
    <h2 class="sec-title"><span class="caps">Recomendado <span class="it" style="display:inline;font-size:inherit;text-transform:none;color:inherit">por tu barbero</span></span></h2>
    <div class="grid3">
      ${[1, 2, 3].map((n) => `<div class="expert">${hueco('vídeo del barbero ' + n, '9/16')}<div>${huecoIn('nombre del barbero')}</div><div>${huecoIn('producto recomendado')}</div></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="sec sec-alt" id="gente-real">
  <div class="wrap">
    ${sectionTitle('', 'Gente real')}
    ${carousel([1, 2, 3, 4].map((n) => `<div class="card">${hueco('vídeo de cliente ' + n, '9/16')}</div>`), 'c5', 'Vídeos de clientes')}
  </div>
</section>

<section class="sec" id="siguenos">
  <div class="wrap">
    <div class="follow"><span class="it">Síguenos</span><a href="https://www.instagram.com/monacobarbershop.oficial/" rel="noopener" target="_blank">@monacobarbershop.oficial</a></div>
    <div class="grid6">${[1, 2, 3, 4, 5, 6].map((n) => hueco('foto ' + n, '1/1', ' data-small="1"')).join('')}</div>
  </div>
</section>`;

  return page({
    title: 'Tienda | Mónaco Barbershop',
    description: 'Tienda de Mónaco Barbershop. Productos de cuidado.',
    path: '/tienda',
    productos,
    main,
    jsonld: [],
  });
}
