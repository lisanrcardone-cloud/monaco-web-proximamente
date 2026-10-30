import { page, hueco, huecoIn, productUrl } from './lib.mjs';

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
  ${slug === 'envios-devoluciones' ? `<ul class="envios">
    <li>Preparamos tu pedido en 24-48 h laborables.</li>
    <li>Península: 4,95 €, gratis en pedidos de 35 € o más. Entrega con Correos en 2-4 días laborables.</li>
    <li>Baleares: 6,95 €. Entrega en 3-5 días laborables.</li>
    <li>Recogida gratis en la barbería (Rúa de Venezuela 71, Vigo), de lunes a sábado de 9:00 a 20:00. Te avisamos cuando esté listo y lo guardamos 15 días.</li>
    <li>No enviamos a Canarias, Ceuta ni Melilla.</li>
    <li>La espuma de rizos y el Pack Rizos son aerosoles: solo se pueden recoger en la barbería.</li>
  </ul>
  ` : ''}${hueco(label, '16/9')}
</div></section>`;
  return page({ title: `${titulo} | Tienda Mónaco Barbershop`, description: titulo, path: `/tienda/${slug}`, productos, main });
}
