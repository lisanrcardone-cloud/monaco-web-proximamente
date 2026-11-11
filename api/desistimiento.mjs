// Función de Vercel (ESM, firma Web). Registra un desistimiento (Dir. 2011/83, art. 11 bis) y envía
// el acuse al cliente y el aviso a la tienda con la API HTTP de Brevo. Sin SDK ni dependencias.
import { TITULAR } from '../tools/tienda-templates/legal-textos.mjs';

const MAX_BODY = 4096;
const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export function GET() {
  return new Response(JSON.stringify({ error: 'Método no permitido' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json; charset=utf-8', Allow: 'POST' },
  });
}

const str = (v) => (typeof v === 'string' ? v.trim() : '');

async function brevo(key, payload) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 10000);
  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': key, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: ctl.signal,
    });
    if (!r.ok) console.error('brevo_error status=' + r.status);
    return r.ok;
  } catch (e) {
    console.error('brevo_fetch_failed ' + (e && e.name));
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request) {
  const ct = request.headers.get('content-type') || '';
  if (!/^application\/json\b/i.test(ct)) return json(400, { error: 'Content-Type debe ser application/json' });

  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_BODY) return json(400, { error: 'Cuerpo demasiado grande' });
  const raw = await request.text();
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY) return json(400, { error: 'Cuerpo demasiado grande' });

  let b;
  try { b = JSON.parse(raw); } catch { return json(400, { error: 'JSON no válido' }); }
  if (!b || typeof b !== 'object' || Array.isArray(b)) return json(400, { error: 'Datos no válidos' });

  // Honeypot: un bot rellena este campo; fingimos éxito sin enviar nada.
  if (str(b.web)) return json(200, { ok: true });

  const nombre = str(b.nombre);
  const email = str(b.email);
  const pedido = str(b.pedido);
  const fecha = str(b.fecha);
  const productos = str(b.productos).slice(0, 1000);
  if (nombre.length < 2 || nombre.length > 120) return json(400, { error: 'Indica tu nombre y apellidos' });
  if (!email || email.length > 200 || !email.includes('@')) return json(400, { error: 'Indica un email válido' });
  if (pedido.length < 1 || pedido.length > 80) return json(400, { error: 'Indica el número de pedido' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return json(400, { error: 'Indica la fecha del pedido' });

  const key = process.env.BREVO_API_KEY;
  if (!key) return json(503, { error: 'Envío no configurado' });

  const fechaHora = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', dateStyle: 'short', timeStyle: 'short' }).format(new Date());
  const sender = { name: TITULAR.comercial, email: TITULAR.email };
  const datos = [
    `Nombre: ${nombre}`,
    `Email: ${email}`,
    `Número de pedido: ${pedido}`,
    `Fecha del pedido o de la entrega: ${fecha}`,
    `Productos: ${productos || '(no indicados: se entiende el pedido completo)'}`,
  ].join('\n');

  const textoCliente = [
    `Hola, ${nombre}:`,
    '',
    'Hemos recibido tu desistimiento del contrato. Este mensaje es el acuse de recibo.',
    '',
    `Fecha y hora de presentación: ${fechaHora}`,
    '',
    'Estos son los datos que nos has enviado:',
    datos,
    '',
    'Cómo devolver el producto:',
    `- Tienes 14 días naturales desde hoy para hacérnoslo llegar, por correo o en la barbería (${TITULAR.local}, de lunes a sábado de 9:00 a 20:00).`,
    '- Si lo envías por correo, el coste de la devolución corre de tu cuenta.',
    '- Te reembolsaremos lo pagado con el mismo medio de pago, en un máximo de 14 días desde hoy.',
    '',
    `Si tienes cualquier duda, escríbenos a ${TITULAR.email} o llama al ${TITULAR.tel}.`,
    '',
    TITULAR.comercial,
  ].join('\n');

  const okCliente = await brevo(key, {
    sender,
    to: [{ email, name: nombre }],
    subject: 'Hemos recibido tu desistimiento – Mónaco Barbershop',
    textContent: textoCliente,
  });
  if (!okCliente) return json(502, { error: `No hemos podido enviar el acuse. Escríbenos a ${TITULAR.email}` });

  const textoTienda = [`Desistimiento presentado el ${fechaHora} (hora de Madrid).`, '', datos].join('\n');
  const okTienda = await brevo(key, {
    sender,
    to: [{ email: TITULAR.email }],
    replyTo: { email, name: nombre },
    subject: `Desistimiento: pedido ${pedido.replace(/[\r\n]+/g, ' ')}`,
    textContent: textoTienda,
  });
  if (!okTienda) console.error('desist_shop_mail_failed');

  return json(200, { ok: true, fechaHora });
}
