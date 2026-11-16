// Email de confirmación de pedido para el cliente (art. 98.7 TRLGDCU). Solo texto plano.
// El "_" inicial evita que Vercel lo publique como ruta.
import { TITULAR, FORMULARIO_DESISTIMIENTO_TXT } from '../tools/tienda-templates/legal-textos.mjs';

const BASE = 'https://www.monacobarberia.com';
const eur = (cents) => ((Number(cents) || 0) / 100).toFixed(2).replace('.', ',') + ' €';
const limpio = (s) => String(s == null ? '' : s).replace(/[\r\n]+/g, ' ').trim();

export const pedidoRef = (session) => String(session.id).slice(-8).toUpperCase();

function parseItems(s) {
  if (typeof s !== 'string') return [];
  const out = [];
  for (const part of s.split(',')) {
    const i = part.lastIndexOf(':');
    if (i < 1) continue;
    const qty = Number(part.slice(i + 1));
    if (Number.isInteger(qty) && qty > 0) out.push({ id: part.slice(0, i), qty });
  }
  return out;
}

export function emailConfirmacion(session, productos) {
  const cd = (session && session.customer_details) || {};
  const to = limpio(cd.email);
  if (!to) return null;
  const nombre = limpio(cd.name);
  const m = session.metadata || {};
  const entrega = m.entrega || '';
  const ref = pedidoRef(session);
  const lista = Array.isArray(productos) ? productos : [];
  const lineas = parseItems(m.items).map(({ id, qty }) => {
    const p = lista.find((x) => x.id === id);
    return p ? `${qty} × ${p.nombre} · ${eur(p.precio * qty)}` : `${qty} × ${id}`;
  });
  const envioTxt = entrega === 'recogida' ? 'Recogida en la barbería: gratis' : `Envío a ${entrega === 'baleares' ? 'Baleares' : 'península'}: ${((session.total_details && session.total_details.amount_shipping) || 0) > 0 ? eur(session.total_details.amount_shipping) : 'gratis'}`;
  const plazo = entrega === 'recogida'
    ? [`Recogida en la barbería: ${TITULAR.local}, de lunes a sábado, 9:00-20:00.`, 'Te avisamos cuando esté listo y te lo guardamos 15 días.']
    : ['Preparamos el pedido en 24-48 h laborables.', entrega === 'baleares' ? 'Entrega con Correos en 3-5 días laborables.' : 'Entrega con Correos en 2-4 días laborables.'];
  const url = `${BASE}/tienda/desistir?pedido=${encodeURIComponent(ref)}`;
  const textContent = [
    nombre ? `Hola, ${nombre}:` : 'Hola:',
    '',
    'Hemos recibido tu pago. Este email es la confirmación de tu pedido.',
    `Número de pedido: ${ref}`,
    '',
    ...(lineas.length ? lineas : ['(sin detalle de productos)']),
    envioTxt,
    `Total: ${eur(session.amount_total)}`,
    '',
    ...plazo,
    '',
    `Condiciones de compra: ${BASE}/tienda/condiciones`,
    '',
    'Si cambias de opinión',
    'Tienes 14 días naturales desde que recibes o recoges el pedido para desistir, sin dar ningún motivo.',
    `Desistir del contrato aquí: ${url}`,
    'También puedes enviarnos por email el formulario de abajo.',
    'Por higiene, no se devuelven los productos con precinto si lo has abierto.',
    '',
    'Formulario de desistimiento',
    FORMULARIO_DESISTIMIENTO_TXT,
    '',
    'Vendedor',
    `${TITULAR.nombre} (${TITULAR.comercial})`,
    `NIE: ${TITULAR.nie}`,
    `Local: ${TITULAR.local}`,
    `Email: ${TITULAR.email}`,
    `Teléfono: ${TITULAR.tel}`,
  ].join('\n');
  return { to: [{ email: to, name: nombre || undefined }], subject: `Tu pedido en Mónaco Barbershop (${ref})`, textContent };
}
