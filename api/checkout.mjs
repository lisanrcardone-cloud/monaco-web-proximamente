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

  let lines;
  try { lines = JSON.parse(raw); } catch { return json(400, { error: 'JSON no válido' }); }
  if (!Array.isArray(lines) || lines.length < 1 || lines.length > 10) return json(400, { error: 'Carrito no válido' });

  let productos;
  try {
    const file = path.join(process.cwd(), 'tienda/productos.json');
    productos = JSON.parse(await readFile(file, 'utf8')).productos;
  } catch {
    return json(500, { error: 'Catálogo no disponible' });
  }

  const seen = new Set();
  const items = [];
  for (const l of lines) {
    if (!l || typeof l.id !== 'string' || !Number.isInteger(l.qty) || l.qty < 1 || l.qty > 10) return json(400, { error: 'Línea no válida' });
    if (seen.has(l.id)) return json(400, { error: 'Producto repetido' });
    seen.add(l.id);
    const p = productos.find((x) => x.id === l.id);
    if (!p) return json(400, { error: 'Producto desconocido' });
    if (!Number.isInteger(p.precio) || p.precio <= 0) return json(400, { error: 'Producto sin precio' });
    if (/^\[Pendiente/.test(p.nombre)) return json(400, { error: 'Producto sin nombre definitivo' });
    items.push({ name: p.nombre, amount: p.precio, qty: l.qty });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return json(503, { error: 'Pago no configurado' });

  const origin = new URL(request.url).origin;
  const form = new URLSearchParams();
  form.set('mode', 'payment');
  form.set('locale', 'es');
  form.set('shipping_address_collection[allowed_countries][0]', 'ES');
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
