import { page, hueco, productUrl } from './lib.mjs';

export function gracias(productos) {
  const main = `<section class="simple"><div class="wrap">
  <h1 class="it">Gracias</h1>
  <p style="margin-bottom:1.5rem">Hemos recibido tu pago.</p>
  ${hueco('mensaje de confirmación y plazos de envío', '16/4')}
  <a class="btn" href="/tienda">Volver a la tienda</a>
</div></section>`;
  return page({ title: 'Gracias | Tienda Mónaco Barbershop', description: 'Pago recibido.', path: '/tienda/gracias', bodyAttrs: 'data-clear-cart="1"', productos, main });
}

export function legal(slug, titulo, label, productos) {
  const main = `<section class="simple simple-left"><div class="wrap">
  <h1 class="it" style="text-align:center">${titulo}</h1>
  ${hueco(label, '16/9')}
</div></section>`;
  return page({ title: `${titulo} | Tienda Mónaco Barbershop`, description: titulo, path: `/tienda/${slug}`, productos, main });
}
