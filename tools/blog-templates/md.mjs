// Conversor Markdown mínimo y sin dependencias: ##, ###, párrafos, **negrita**, [texto](url), listas "- ", "---" y [[video]].
import { esc } from '../tienda-templates/lib.mjs';

export const VIDEO_MARK = '<!--video-->';

function inline(t) {
  let s = esc(t);
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, txt, url) => {
    if (!/^(\/(?!\/)|https:\/\/)/.test(url)) return m;
    const u = url.length > 1 && url.endsWith('/') ? url.slice(0, -1) : url;
    return `<a href="${u}">${txt}</a>`;
  });
  return s;
}

export function mdToHtml(md) {
  const out = [];
  let para = [];
  let list = [];
  const flush = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    if (list.length) out.push(`<ul>${list.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>`);
    para = []; list = [];
  };
  for (const raw of String(md).replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim();
    let m;
    if (!line) flush();
    else if (/^# /.test(line)) flush(); // el H1 lo pone la plantilla con "titulo"
    else if ((m = line.match(/^(##|###) (.+)$/))) { flush(); const n = m[1].length; out.push(`<h${n}>${inline(m[2])}</h${n}>`); }
    else if (line === '---') { flush(); out.push('<hr>'); }
    else if (line === '[[video]]') { flush(); out.push(VIDEO_MARK); }
    else if (/^- /.test(line)) { if (para.length) flush(); list.push(line.slice(2)); }
    else { if (list.length) flush(); para.push(line); }
  }
  flush();
  return out.join('\n');
}

export function extractFaq(md) {
  const lines = String(md).replace(/\r\n?/g, '\n').split('\n');
  const faq = [];
  let inFaq = false, cur = null;
  const close = () => { if (cur && cur.a.length) faq.push({ q: cur.q, a: cur.a.join(' ') }); cur = null; };
  for (const raw of lines) {
    const line = raw.trim();
    if (/^## /.test(line)) { close(); inFaq = /^## Preguntas frecuentes\s*$/.test(line); continue; }
    if (!inFaq) continue;
    const q = line.match(/^### (.+)$/);
    if (q) { close(); cur = { q: q[1].trim(), a: [] }; }
    else if (cur && line) cur.a.push(line);
  }
  close();
  return faq;
}
