// Función de Vercel (ESM, firma Web). Crea una Checkout Session de Stripe.
// Precios solo del servidor (tienda/productos.json). Sin SDK ni dependencias.
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const MAX_BODY = 2048;
const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export function GET() {
  return new Response(JSON.stringify({ error: 'Método no permitido' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json; charset=utf-8', Allow: 'POST' },
  });
}

export async function POST(request) {
  const ct = request.headers.get('content-type') || '';
  if (!/^application\/json\b/i.test(ct)) return json(400, { error: 'Content-Type debe ser application/json' });

  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_BODY) return json(400, { error: 'Cuerpo demasiado grande' });
  const raw = await request.text();
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY) return json(400, { error: 'Cuerpo demasiado grande' });

  let parsed;
  try { parsed = JSON.parse(raw); } catch { return json(400, { error: 'JSON no válido' }); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return json(400, { error: 'Carrito no válido' });
  const lines = parsed.lineas;
  const entrega = parsed.entrega;
  if (!Array.isArray(lines) || lines.length < 1 || lines.length > 10) return json(400, { error: 'Carrito no válido' });

  if (entrega !== 'peninsula' && entrega !== 'baleares' && entrega !== 'recogida') return json(400, { error: 'Entrega no válida' });

  let productos;
  let envio;
  try {
    const file = path.join(process.cwd(), 'tienda/productos.json');
    const cat = JSON.parse(await readFile(file, 'utf8'));
    productos = cat.productos;
    envio = cat.envio;
    if (!envio || !Number.isInteger(envio.umbral_gratis) || !Number.isInteger(envio.peninsula) || !Number.isInteger(envio.baleares)) throw new Error('envio');
  } catch {
    return json(500, { error: 'Catálogo no disponible' });
  }

  const seen = new Set();
  const items = [];
  let subtotal = 0;
  let soloRecogida = false;
  for (const l of lines) {
    if (!l || typeof l.id !== 'string' || !Number.isInteger(l.qty) || l.qty < 1 || l.qty > 10) return json(400, { error: 'Línea no válida' });
    if (seen.has(l.id)) return json(400, { error: 'Producto repetido' });
    seen.add(l.id);
    const p = productos.find((x) => x.id === l.id);
    if (!p) return json(400, { error: 'Producto desconocido' });
    if (!Number.isInteger(p.precio) || p.precio <= 0) return json(400, { error: 'Producto sin precio' });
    if (/^\[Pendiente/.test(p.nombre)) return json(400, { error: 'Producto sin nombre definitivo' });
    if (p.solo_recogida) soloRecogida = true;
    subtotal += p.precio * l.qty;
    items.push({ name: p.nombre, amount: p.precio, qty: l.qty });
  }
  if (soloRecogida && entrega !== 'recogida') return json(400, { error: 'Este pedido solo puede recogerse en la barbería' });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return json(503, { error: 'Pago no configurado' });

  const origin = new URL(request.url).origin;
  const form = new URLSearchParams();
  form.set('mode', 'payment');
  form.set('locale', 'es');
  form.set('phone_number_collection[enabled]', 'true');
  form.set('metadata[entrega]', entrega);
  if (entrega === 'recogida') {
    form.set('custom_text[submit][message]', 'Recogida gratis en Mónaco Barbershop, Rúa de Venezuela 71, Vigo. Lunes a sábado, 9:00-20:00. Te avisamos cuando esté listo y lo guardamos 15 días.');
  } else {
    const pen = entrega === 'peninsula';
    const free = pen && subtotal >= envio.umbral_gratis;
    const amount = pen ? (free ? 0 : envio.peninsula) : envio.baleares;
    const name = pen ? (free ? 'Envío gratis a península (Correos)' : 'Envío a península (Correos)') : 'Envío a Baleares (Correos)';
    form.set('shipping_address_collection[allowed_countries][0]', 'ES');
    form.set('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
    form.set('shipping_options[0][shipping_rate_data][fixed_amount][amount]', String(amount));
    form.set('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'eur');
    form.set('shipping_options[0][shipping_rate_data][display_name]', name);
    form.set('shipping_options[0][shipping_rate_data][delivery_estimate][minimum][unit]', 'business_day');
    form.set('shipping_options[0][shipping_rate_data][delivery_estimate][minimum][value]', pen ? '3' : '4');
    form.set('shipping_options[0][shipping_rate_data][delivery_estimate][maximum][unit]', 'business_day');
    form.set('shipping_options[0][shipping_rate_data][delivery_estimate][maximum][value]', pen ? '6' : '7');
    form.set('custom_text[shipping_address][message]', 'Enviamos a la península y Baleares. No enviamos a Canarias, Ceuta ni Melilla.');
  }
  form.set('success_url', `${origin}/tienda/gracias?session_id={CHECKOUT_SESSION_ID}`);
  form.set('cancel_url', `${origin}/tienda`);
  items.forEach((it, i) => {
    form.set(`line_items[${i}][quantity]`, String(it.qty));
    form.set(`line_items[${i}][price_data][currency]`, 'eur');
    form.set(`line_items[${i}][price_data][unit_amount]`, String(it.amount));
    form.set(`line_items[${i}][price_data][product_data][name]`, it.name);
  });

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 10000);
  try {
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      signal: ctl.signal,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.url) {
      console.error('stripe_error status=' + r.status);
      return json(502, { error: 'No se pudo crear la sesión de pago' });
    }
    return json(200, { url: data.url });
  } catch (e) {
    console.error('stripe_fetch_failed ' + (e && e.name));
    return json(e && e.name === 'AbortError' ? 504 : 502, { error: 'No se pudo conectar con el sistema de pago' });
  } finally {
    clearTimeout(timer);
  }
}
