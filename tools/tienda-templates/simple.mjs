import { page, hueco, huecoIn, productUrl } from './lib.mjs';
import { DEVOLUCIONES_HTML, CONDICIONES_HTML, AVISO_LEGAL_HTML, TITULAR } from './legal-textos.mjs';

export function gracias(productos) {
  const main = `<section class="simple"><div class="wrap">
  <h1 class="it">Gracias</h1>
  <p style="margin-bottom:1.5rem">Hemos recibido tu pago.</p>
  <p>Te llega un email con el resumen del pedido. Lo preparamos en 24-48 h laborables.</p>
  <ul style="margin:1rem 0 1.5rem;padding-left:1.2rem;line-height:1.6">
    <li><strong>Envío a península:</strong> Correos lo entrega en 2-4 días laborables.</li>
    <li><strong>Envío a Baleares:</strong> 3-5 días laborables.</li>
    <li><strong>Recogida en la barbería:</strong> te avisamos cuando esté listo y te lo guardamos 15 días en ${TITULAR.local}, de lunes a sábado de 9:00 a 20:00.</li>
  </ul>
  <p style="margin-bottom:1.5rem">Si cambias de opinión, tienes 14 días: <a href="/tienda/desistir">Desistir del contrato aquí</a>.</p>
  <p style="margin-bottom:1.5rem">¿Alguna duda con el pedido? Escríbenos a <a href="mailto:${TITULAR.email}">${TITULAR.email}</a> o llama al <a href="tel:${TITULAR.tel.replace(/\s/g, '')}">${TITULAR.tel}</a>.</p>
  <a class="btn" href="/tienda">Volver a la tienda</a>
</div></section>`;
  return page({ title: 'Gracias | Tienda Mónaco Barbershop', description: 'Pago recibido.', path: '/tienda/gracias', bodyAttrs: 'data-clear-cart="1"', productos, main, noindex: true });
}

export function legal(slug, titulo, label, productos, path = `/tienda/${slug}`) {
  const main = `<section class="simple simple-left"><div class="wrap">
  <h1 class="it" style="text-align:center">${titulo}</h1>
  ${slug === 'envios-devoluciones' ? `<ul class="envios">
    <li>Preparamos tu pedido en 24-48 h laborables.</li>
    <li>Península: 4,95 €, gratis en pedidos de 45 € o más. Entrega con Correos en 2-4 días laborables.</li>
    <li>Baleares: 6,95 €. Entrega en 3-5 días laborables.</li>
    <li>Recogida gratis en la barbería (Rúa de Venezuela 71, Vigo), de lunes a sábado de 9:00 a 20:00. Te avisamos cuando esté listo y lo guardamos 15 días.</li>
    <li>No enviamos a Canarias, Ceuta ni Melilla.</li>
    <li>La espuma de rizos y el Pack Rizos son aerosoles: solo se pueden recoger en la barbería.</li>
  </ul>
  ` : ''}${slug === 'envios-devoluciones' ? `<div class="legal">${DEVOLUCIONES_HTML}</div>` : slug === 'condiciones' ? `<div class="legal">${CONDICIONES_HTML}</div>` : slug === 'aviso-legal' ? `<div class="legal">${AVISO_LEGAL_HTML}</div>` : hueco(label, '16/9')}
</div></section>`;
  return page({ title: `${titulo} | Tienda Mónaco Barbershop`, description: titulo, path, productos, main });
}

export function desistir(productos) {
  const main = `<section class="simple simple-left"><div class="wrap">
  <h1 class="it" style="text-align:center">Desistir del contrato</h1>
  <p>Tienes <strong>14 días naturales</strong> desde que recibes o recoges el pedido para desistir de la compra, sin dar ningún motivo. Al confirmar, te llega un acuse por email con la fecha y la hora. Si algo falla, escríbenos a <a href="mailto:${TITULAR.email}">${TITULAR.email}</a>.</p>
  <form class="desist-form" data-desist novalidate>
    <label>Nombre y apellidos<input type="text" name="nombre" autocomplete="name" required maxlength="120"></label>
    <label>Email<input type="email" name="email" autocomplete="email" required maxlength="200"></label>
    <label>Número de pedido o de recibo<input type="text" name="pedido" required maxlength="80"><small>Lo encuentras en el email de confirmación de la compra.</small></label>
    <label>Fecha del pedido o de la entrega<input type="date" name="fecha" required></label>
    <label>Productos que devuelves (opcional)<textarea name="productos" rows="3" maxlength="1000"></textarea></label>
    <input class="hp" type="text" name="web" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button class="btn" type="submit">Confirmar desistimiento</button>
    <p class="desist-msg" role="status" hidden></p>
  </form>
</div></section>`;
  return page({ title: 'Desistir del contrato | Tienda Mónaco Barbershop', description: 'Desistir del contrato', path: '/tienda/desistir', productos, main });
}
