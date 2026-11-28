// Crea en Brevo una campaña de email para cada post nuevo aprobado. Node 22, sin dependencias.
// Uso: node tools/blog-email.mjs <slug> [--html <archivo>] | --desde <sha_antes> [--hasta <sha>]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { parsePost } from './blog-templates/posts.mjs';
import { TITULAR } from './tienda-templates/legal-textos.mjs';

export const BASE = 'https://www.monacobarberia.com';
export const BOOKSY = 'https://booksy.com/es-es/dl/show-business/187597';
export const REMITENTE = { name: 'Mónaco Barbershop', email: 'contacto@monacobarberia.com' };
export const API = 'https://api.brevo.com/v3';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

export function utm(url, slug) {
  const u = new URL(url);
  u.searchParams.set('utm_source', 'brevo');
  u.searchParams.set('utm_medium', 'email');
  u.searchParams.set('utm_campaign', `blog-${slug}`);
  return u.toString();
}

export function detectarNuevos(pares) {
  const slugs = [];
  for (const { file, antes, despues } of pares) {
    const nombre = String(file).split('/').pop();
    if (nombre.startsWith('_') || !nombre.endsWith('.md')) continue;
    if (despues == null) continue;
    const d = parsePost(despues).meta;
    if (d.estado !== 'aprobado' || !d.slug) continue;
    if (antes != null && parsePost(antes).meta.estado === 'aprobado') continue;
    slugs.push(d.slug);
  }
  return slugs;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
const SANS = "'Inter', Arial, Helvetica, sans-serif";

export function armarEmail(meta, slug, body = '') {
  const CAMPOS = ['titulo', 'categoria', 'resumen', 'email_asunto', 'email_preheader', 'email_imagen', 'email_intro', 'video_poster'];
  for (const k of CAMPOS) if (/[—–]/.test(meta[k] || '')) throw new Error(`El campo "${k}" lleva raya (— o –); quítala antes de crear el email`);
  const asunto = meta.email_asunto || meta.titulo;
  const preheader = meta.email_preheader || meta.resumen;
  const nombre = 'Blog: ' + slug;
  let img = meta.email_imagen || meta.video_poster || ((body.match(/!\[[^\]]*\]\(([^)\s]+)\)/) || [])[1]) || '';
  if (img.startsWith('/')) img = BASE + img;
  const post = utm(`${BASE}/blog/${slug}`, slug);
  const booksy = utm(BOOKSY, slug);
  const tienda = utm(`${BASE}/tienda`, slug);
  const web = utm(BASE, slug);
  const relleno = '&#847;&zwnj;&nbsp;'.repeat(40);
  const intro = meta.email_intro
    ? `<tr><td class="pad" style="padding:0 32px 24px 32px;font-family:${SANS};font-size:16px;line-height:1.6;color:#0D3934;">${esc(meta.email_intro)}<br><br><span style="font-family:${SERIF};font-style:italic;font-size:18px;color:#0D3934;">Felipe</span></td></tr>`
    : '';
  const imagen = img
    ? `<tr><td class="pad" style="padding:0 32px 24px 32px;"><a href="${post}"><img src="${esc(img)}" alt="${esc(meta.titulo)}" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0;"></a></td></tr>`
    : '';
  const boton2 = (href, txt) => `<a href="${href}" style="display:block;border:1px solid #0D3934;border-radius:4px;padding:12px 8px;font-family:${SANS};font-size:15px;color:#0D3934;text-decoration:none;text-align:center;">${txt}</a>`;
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(asunto)}</title>
<style>
@media (max-width:620px){
  .pad{padding-left:20px !important;padding-right:20px !important;}
  .col{display:block !important;width:100% !important;padding:0 0 10px 0 !important;}
}
</style>
</head>
<body style="margin:0;padding:0;background:#EDE2CE;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#EDE2CE;">${esc(preheader)}${relleno}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EDE2CE;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
<tr><td align="center" style="padding:8px 0 24px 0;"><a href="${web}"><img src="${BASE}/assets/tienda/wordmark-green.png" alt="Mónaco Barbershop" width="160" style="display:block;border:0;width:160px;height:auto;"></a></td></tr>
<tr><td>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7F0E4;border:1px solid #E6CBA8;">
<tr><td class="pad" style="padding:32px 32px 16px 32px;font-family:${SANS};font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#7A5C26;">${esc(meta.categoria || '')}<div style="width:40px;height:2px;line-height:2px;font-size:0;background:#D9AC59;margin-top:10px;">&nbsp;</div></td></tr>
${intro}
${imagen}
<tr><td class="pad" style="padding:0 32px 12px 32px;font-family:${SERIF};font-size:28px;line-height:1.25;font-weight:normal;color:#0D3934;"><h1 style="margin:0;font-family:${SERIF};font-size:28px;line-height:1.25;font-weight:normal;color:#0D3934;">${esc(meta.titulo)}</h1></td></tr>
<tr><td class="pad" style="padding:0 32px 24px 32px;font-family:${SANS};font-size:16px;line-height:1.6;color:#0D3934;">${esc(meta.resumen)}</td></tr>
<tr><td class="pad" align="center" style="padding:0 32px 24px 32px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#0D3934" style="background:#0D3934;border-radius:4px;"><a href="${post}" style="display:inline-block;padding:14px 28px;font-family:${SANS};font-size:16px;color:#EDE2CE;text-decoration:none;border-radius:4px;">Leer el post</a></td></tr></table></td></tr>
<tr><td class="pad" style="padding:0 32px 32px 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td class="col" width="50%" style="padding-right:6px;">${boton2(booksy, 'Reserva tu cita')}</td>
<td class="col" width="50%" style="padding-left:6px;">${boton2(tienda, 'Ver la tienda')}</td>
</tr></table></td></tr>
</table>
</td></tr>
<tr><td align="center" class="pad" style="padding:24px 20px;font-family:${SANS};font-size:12px;line-height:1.6;color:#4A5A57;">
Mónaco Barbershop · ${esc(TITULAR.local)} · Lunes a sábado, 9:00 a 20:00<br>
<a href="${web}" style="color:#4A5A57;">www.monacobarberia.com</a><br><br>
Si no quieres recibir más emails del blog, <a href="{{ unsubscribe }}" style="color:#4A5A57;">date de baja aquí</a>.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
`;
  return { asunto, preheader, html, nombre };
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function llamar(path, body, key, fetchImpl, espera = 2000) {
  let ultimo;
  for (let i = 1; i <= 3; i++) {
    try {
      const r = await fetchImpl(`${API}${path}`, {
        method: 'POST',
        headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(20000),
      });
      const txt = await r.text();
      let data = {};
      try { data = txt ? JSON.parse(txt) : {}; } catch { data = { message: txt.slice(0, 200) }; }
      if (r.status >= 200 && r.status < 300) return data;
      const err = new Error(`Brevo ${r.status}: ${data.message || 'error'}`);
      if (r.status < 500) throw Object.assign(err, { sinReintento: true });
      ultimo = err;
    } catch (e) {
      if (e.sinReintento) throw e;
      ultimo = e.message?.startsWith('Brevo ') ? e : new Error(`Error de red hablando con Brevo: ${e.message}`);
    }
    if (i < 3) await dormir(espera);
  }
  throw ultimo;
}

export async function esperarPostReal(slug, fetchImpl = fetch, intentos = 10, espera = 30000) {
  for (let i = 1; i <= intentos; i++) {
    try {
      const r = await fetchImpl(`${BASE}/blog/${slug}`, { signal: AbortSignal.timeout(10000) });
      if (r.status === 200) return true;
    } catch { /* se reintenta */ }
    if (i < intentos) await dormir(espera);
  }
  return false;
}

export async function crearCampana({ slug, meta, body = '', key, listId, modo = 'borrador', fetchImpl = fetch, esperarPost, espera }) {
  const { asunto, preheader, html, nombre } = armarEmail(meta, slug, body);
  const c = await llamar('/emailCampaigns', {
    name: nombre, subject: asunto, previewText: preheader, sender: REMITENTE,
    replyTo: 'contacto@monacobarberia.com', htmlContent: html, recipients: { listIds: [Number(listId)] },
  }, key, fetchImpl, espera);
  const id = c.id;
  if (modo !== 'enviar') return { id, enviado: false };
  const listo = await (esperarPost || (() => esperarPostReal(slug)))();
  if (!listo) {
    console.log(`::warning::El post /blog/${slug} no responde 200; la campaña ${id} queda en borrador.`);
    return { id, enviado: false };
  }
  await llamar(`/emailCampaigns/${id}/sendNow`, null, key, fetchImpl, espera);
  return { id, enviado: true };
}

function leerPost(slug) {
  const dir = join(RAIZ, 'blog/posts');
  for (const f of readdirSync(dir).sort()) {
    if (!f.endsWith('.md') || f.startsWith('_')) continue;
    const p = parsePost(readFileSync(join(dir, f), 'utf8'));
    if (p.meta.slug === slug) return p;
  }
  return null;
}

const git = (...args) => { try { return execFileSync('git', args, { cwd: RAIZ, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return null; } };

async function procesar(slug, { key, listId, modo }) {
  const p = leerPost(slug);
  if (!p || p.meta.estado !== 'aprobado') throw new Error(`No hay un post aprobado con slug "${slug}"`);
  const r = await crearCampana({ slug, meta: p.meta, body: p.body, key, listId, modo });
  console.log(`Campaña ${r.id} ${r.enviado ? 'creada y enviada' : 'creada en borrador (sin enviar)'} para ${slug}`);
}

async function main() {
  const args = process.argv.slice(2);
  const val = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };
  const slugArg = args.find((a, i) => !a.startsWith('--') && !['--html', '--desde', '--hasta'].includes(args[i - 1]));
  const htmlOut = val('--html');
  if (htmlOut && slugArg) {
    const p = leerPost(slugArg);
    if (!p || p.meta.estado !== 'aprobado') throw new Error(`No hay un post aprobado con slug "${slugArg}"`);
    writeFileSync(htmlOut, armarEmail(p.meta, slugArg, p.body).html);
    console.log(`HTML escrito en ${htmlOut}`);
    return;
  }
  if (slugArg && val('--desde') === undefined) {
    const p = leerPost(slugArg);
    if (!p || p.meta.estado !== 'aprobado') throw new Error(`No hay un post aprobado con slug "${slugArg}"`);
  }
  const key = process.env.BREVO_MARKETING_KEY;
  const listId = process.env.BREVO_LIST_ID;
  const modo = process.env.BLOG_EMAIL_MODO || 'borrador';
  const desde = val('--desde');
  if (desde !== undefined && (!desde || /^0+$/.test(desde))) { console.log('No hay commit anterior, no se hace nada.'); return; }
  if (!key || !listId || !/^\d+$/.test(listId)) { console.log('::notice::Sin BREVO_MARKETING_KEY o BREVO_LIST_ID: no se crea ninguna campaña.'); return; }
  let slugs;
  if (desde !== undefined) {
    const hasta = val('--hasta') || 'HEAD';
    const files = (git('diff', '--name-only', desde, hasta, '--', 'blog/posts/') || '').split('\n').filter(Boolean);
    const pares = files.map((file) => ({ file, antes: git('show', `${desde}:${file}`), despues: git('show', `${hasta}:${file}`) }));
    slugs = detectarNuevos(pares);
    if (!slugs.length) { console.log('Ningún post nuevo aprobado en este push.'); return; }
  } else {
    if (!slugArg) throw new Error('Uso: node tools/blog-email.mjs <slug> [--html <archivo>] | --desde <sha> [--hasta <sha>]');
    slugs = [slugArg];
  }
  for (const s of slugs) await procesar(s, { key, listId, modo });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(String(e.message).replaceAll(process.env.BREVO_MARKETING_KEY || '\0', '***')); process.exit(1); });
}
