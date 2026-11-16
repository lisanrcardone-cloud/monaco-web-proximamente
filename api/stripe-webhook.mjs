// Función de Vercel (ESM, firma Web). Webhook de Stripe: verifica la firma a mano (HMAC-SHA256, sin SDK)
// y, para checkout.session.completed pagado, manda `purchase` a GA4 (Measurement Protocol) y avisa por
// Brevo si el código postal no cuadra con el envío pagado y de cada venta pagada al usuario (AVISO_VENTA_EMAIL).
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { TITULAR } from '../tools/tienda-templates/legal-textos.mjs';

const MAX_BODY = 65536;
const MEASUREMENT_ID = 'G-EHWP4106KW';
const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export function GET() {
  return new Response(JSON.stringify({ error: 'Método no permitido' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json; charset=utf-8', Allow: 'POST' },
  });
}

// "t=...,v1=...,v1=...,v0=...": se ignoran las entradas desconocidas y el orden no importa.
export function parseSigHeader(header) {
  const out = { t: null, v1: [] };
  if (typeof header !== 'string') return out;
  for (const part of header.split(',')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim().toLowerCase();
    const v = part.slice(i + 1).trim();
    if (k === 't' && /^\d+$/.test(v)) out.t = Number(v);
    else if (k === 'v1' && v) out.v1.push(v);
  }
  return out;
}

export function verifySignature(raw, header, secret, nowSec, tolerance = 300) {
  if (!secret || !(tolerance > 0)) return false;
  const { t, v1 } = parseSigHeader(header);
  if (t === null || !v1.length) return false;
  const expected = Buffer.from(createHmac('sha256', secret).update(t + '.' + raw).digest('hex'), 'utf8');
  let match = false;
  for (const sig of v1) {
    const b = Buffer.from(sig, 'utf8');
    if (b.length === expected.length && timingSafeEqual(b, expected)) match = true;
  }
  if (!match) return false;
  return Math.abs(nowSec - t) <= tolerance;
}

export function postalCode(session) {
  const a =
    (session && session.collected_information && session.collected_information.shipping_details && session.collected_information.shipping_details.address) ||
    (session && session.shipping_details && session.shipping_details.address) ||
    null;
  const cp = a && typeof a.postal_code === 'string' ? a.postal_code.trim() : '';
  return cp;
}

function parseItems(s) {
  if (typeof s !== 'string') return [];
  const out = [];
  for (const part of s.split(',')) {
    const i = part.lastIndexOf(':');
    if (i < 1) continue;
    const id = part.slice(0, i);
    const qty = Number(part.slice(i + 1));
    if (Number.isInteger(qty) && qty > 0) out.push({ id, qty });
  }
  return out;
}

export function ga4Purchase(session, productos) {
  const m = (session && session.metadata) || {};
  if (!m.ga_cid) return null;
  const items = parseItems(m.items).map(({ id, qty }) => {
    const p = (productos || []).find((x) => x.id === id);
    return p ? { item_id: id, item_name: p.nombre, price: p.precio / 100, quantity: qty } : { item_id: id, quantity: qty };
  });
  const params = {
    transaction_id: session.id,
    currency: String(session.currency || 'eur').toUpperCase(),
    value: (session.amount_subtotal || 0) / 100,
    shipping: ((session.total_details && session.total_details.amount_shipping) || 0) / 100,
    engagement_time_msec: 1,
    items,
  };
  if (m.ga_sid) params.session_id = m.ga_sid;
  return { client_id: m.ga_cid, events: [{ name: 'purchase', params }] };
}

// Zonas por los 2 primeros dígitos del código postal (provincia).
export function zonaCP(cp) {
  const v = typeof cp === 'string' ? cp.trim() : '';
  if (!/^\d{5}$/.test(v)) return 'invalido';
  const prov = Number(v.slice(0, 2));
  if (prov === 7) return 'baleares';
  if (prov === 35 || prov === 38 || prov === 51 || prov === 52) return 'excluida';
  if (prov >= 1 && prov <= 50) return 'peninsula';
  return 'invalido';
}

export function cuadra(entrega, cp) {
  if (entrega === 'recogida') return true;
  if (entrega === 'peninsula') return zonaCP(cp) === 'peninsula';
  if (entrega === 'baleares') return zonaCP(cp) === 'baleares';
  return false;
}

const eurosTxt = (cents) => ((Number(cents) || 0) / 100).toFixed(2).replace('.', ',');
const stripeLink = (session) => `https://dashboard.stripe.com/payments/${typeof session.payment_intent === 'string' ? session.payment_intent : ''}`;

async function brevo(payload) {
  const r = await post('https://api.brevo.com/v3/smtp/email', { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' }, payload);
  if (!r.ok) throw new Error('status ' + r.status);
}

async function sendCpAlert(session) {
  const entrega = (session.metadata && session.metadata.entrega) || '';
  const cp = postalCode(session);
  if (cuadra(entrega, cp)) return;
  if (!process.env.BREVO_API_KEY) { console.error('cp_alert_skip_no_key'); return; }
  const texto = [
    `Pedido pagado con envío "${entrega}" y código postal ${cp || '(sin código postal)'} (${zonaCP(cp)}).`,
    `Importe: ${eurosTxt(session.amount_total)} €`,
    `Sesión: ${session.id}`,
    `Ver en Stripe: ${stripeLink(session)}`,
    'Qué hacer: si es Baleares y pagó península, pide la diferencia (2 €) o reembolsa; si es Canarias, Ceuta o Melilla, reembolsa: no enviamos allí.',
  ].join('\n');
  try {
    await brevo({
      sender: { name: TITULAR.comercial, email: TITULAR.email },
      to: [{ email: TITULAR.email }],
      subject: 'Revisar pedido: el código postal no cuadra con el envío pagado',
      textContent: texto,
    });
  } catch (e) {
    console.error('cp_alert_failed');
  }
}

// Aviso de venta al usuario. La dirección solo sale de AVISO_VENTA_EMAIL y nunca se loguea.
async function sendVentaAviso(session, productos) {
  const to = (process.env.AVISO_VENTA_EMAIL || '').trim();
  if (!to) { console.error('venta_aviso_skip_no_email'); return; }
  if (!process.env.BREVO_API_KEY) { console.error('venta_aviso_skip_no_key'); return; }
  const m = session.metadata || {};
  const entrega = m.entrega || '';
  const cp = postalCode(session);
  const lineas = parseItems(m.items).map(({ id, qty }) => {
    const p = productos.find((x) => x.id === id);
    return `- ${p ? p.nombre : id} × ${qty}`;
  });
  const total = eurosTxt(session.amount_total);
  const texto = [
    `Importe total: ${total} €`,
    `Envío: ${entrega || '(sin dato)'}`,
    'Productos:',
    ...(lineas.length ? lineas : ['- (sin detalle)']),
    `Código postal: ${entrega === 'recogida' ? 'recogida en tienda' : cp || '(sin código postal)'}`,
    `Sesión: ${session.id}`,
    `Ver en Stripe: ${stripeLink(session)}`,
  ].join('\n');
  try {
    await brevo({
      sender: { name: TITULAR.comercial, email: TITULAR.email },
      to: [{ email: to }],
      subject: `Nueva venta en la tienda: ${total} €`,
      textContent: texto,
    });
  } catch (e) {
    console.error('venta_aviso_failed');
  }
}

async function post(url, headers, payload) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 10000);
  try {
    return await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload), signal: ctl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function loadProductos() {
  try {
    const cat = JSON.parse(await readFile(path.join(process.cwd(), 'tienda/productos.json'), 'utf8'));
    return Array.isArray(cat.productos) ? cat.productos : [];
  } catch {
    return [];
  }
}

async function sendGa4(session, productos) {
  const secret = process.env.GA4_API_SECRET;
  if (!secret) return;
  const body = ga4Purchase(session, productos);
  if (!body) { console.error('ga4_skip_no_cid'); return; }
  try {
    const r = await post(`https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${encodeURIComponent(secret)}`, { 'Content-Type': 'application/json' }, body);
    if (!r.ok) console.error('ga4_error status=' + r.status);
  } catch (e) {
    console.error('ga4_failed ' + (e && e.name));
  }
}

export async function POST(request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return json(503, { error: 'Webhook no configurado' });

  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_BODY) return json(400, { error: 'Cuerpo demasiado grande' });
  const raw = await request.text();
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY) return json(400, { error: 'Cuerpo demasiado grande' });

  const header = request.headers.get('stripe-signature');
  if (!header || !verifySignature(raw, header, secret, Math.floor(Date.now() / 1000))) return json(400, { error: 'Firma no válida' });

  let event;
  try { event = JSON.parse(raw); } catch { return json(400, { error: 'JSON no válido' }); }
  if (!event || typeof event !== 'object') return json(400, { error: 'JSON no válido' });

  if (event.type !== 'checkout.session.completed') return json(200, { ok: true });
  const session = event.data && event.data.object;
  if (!session || typeof session !== 'object' || session.payment_status !== 'paid') return json(200, { ok: true });

  const productos = await loadProductos();
  await Promise.allSettled([sendGa4(session, productos), sendCpAlert(session), sendVentaAviso(session, productos)]);
  return json(200, { ok: true });
}
