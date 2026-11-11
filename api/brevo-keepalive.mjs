// Función de Vercel (ESM, firma Web). Llamada mensual de solo lectura a Brevo para que la clave
// de API no caduque por inactividad. No envía emails ni devuelve datos de Brevo.
const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  const autorizado = secret
    ? request.headers.get('authorization') === `Bearer ${secret}`
    : (request.headers.get('user-agent') || '').startsWith('vercel-cron/');
  if (!autorizado) return json(401, { ok: false });

  const key = process.env.BREVO_API_KEY;
  if (!key) return json(503, { ok: false });

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 10000);
  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/statistics/aggregatedReport?days=1', {
      method: 'GET',
      headers: { 'api-key': key, Accept: 'application/json' },
      signal: ctl.signal,
    });
    if (!r.ok) console.error('brevo_keepalive_error status=' + r.status);
    return json(r.ok ? 200 : 502, { ok: r.ok });
  } catch (e) {
    console.error('brevo_keepalive_failed ' + (e && e.name));
    return json(502, { ok: false });
  } finally {
    clearTimeout(timer);
  }
}
