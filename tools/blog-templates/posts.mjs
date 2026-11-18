// Lee blog/posts/*.md (cabecera + Markdown). Solo devuelve los de "estado: aprobado" y valida cada uno.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { mdToHtml, extractFaq } from './md.mjs';

const REQUIRED = ['titulo', 'slug', 'meta_title', 'meta_description', 'tipo', 'categoria', 'resumen', 'autor', 'aprobado_por', 'fecha_aprobacion', 'fecha_publicacion'];
const VIDEO_FIELDS = ['video_src', 'video_poster', 'video_titulo', 'video_fecha', 'video_duracion'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parsePost(text) {
  const t = String(text).replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const m = t.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: t };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i < 1) continue;
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m[2].replace(/^\n+/, '') };
}

const hrefs = (body) => [...body.matchAll(/\]\((\/[^)\s]*)\)/g)].map((x) => x[1].split(/[#?]/)[0].replace(/(.)\/$/, '$1'));

export function loadPosts(dir, productos) {
  if (!existsSync(dir)) return [];
  const parsed = [];
  for (const f of readdirSync(dir).sort()) {
    if (!f.endsWith('.md') || f.startsWith('_')) continue;
    const { meta, body } = parsePost(readFileSync(join(dir, f), 'utf8'));
    if (meta.estado === 'aprobado') parsed.push({ f, meta, body });
  }
  const approved = new Set(parsed.map((x) => x.meta.slug));
  const slugs = new Set((productos || []).map((p) => p.slug));
  const seen = new Set();
  const posts = [];
  for (const { f, meta, body } of parsed) {
    const err = (msg) => { throw new Error(`${f}: ${msg}`); };
    if (/\[Pendiente/.test(body) || Object.values(meta).some((v) => /\[Pendiente/.test(v))) err('tiene un hueco [Pendiente…]; rellénalo o quita la sección antes de aprobar');
    for (const k of REQUIRED) if (!meta[k]) err(`falta el campo "${k}"`);
    if (!/^[a-z0-9-]+$/.test(meta.slug)) err(`slug no válido "${meta.slug}"`);
    if (seen.has(meta.slug)) err(`slug repetido "${meta.slug}"`);
    seen.add(meta.slug);
    if (!['historia', 'producto'].includes(meta.tipo)) err(`tipo debe ser historia o producto (es "${meta.tipo}")`);
    for (const k of ['fecha_aprobacion', 'fecha_publicacion']) if (!DATE.test(meta[k])) err(`${k} debe ser AAAA-MM-DD`);
    if (meta.tipo === 'producto') {
      if (!meta.producto) err('falta el campo "producto"');
      if (!slugs.has(meta.producto)) err(`el producto "${meta.producto}" no existe en la tienda`);
    }
    const secundarios = (meta.secundarios || '').split(',').map((s) => s.trim()).filter(Boolean);
    for (const s of secundarios) if (!slugs.has(s)) err(`el producto secundario "${s}" no existe en la tienda`);
    const usaVideo = /^\s*\[\[video\]\]\s*$/m.test(body);
    if (usaVideo && !meta.video_src) err('usa [[video]] pero la cabecera no tiene video_src');
    if (meta.video_src) for (const k of VIDEO_FIELDS) if (!meta[k]) err(`con vídeo falta el campo "${k}"`);
    if (meta.video_fecha && !DATE.test(meta.video_fecha)) err('video_fecha debe ser AAAA-MM-DD');
    for (const h of hrefs(body)) {
      const mp = h.match(/^\/tienda\/producto\/([^/]+)$/);
      if (mp && !slugs.has(mp[1])) err(`enlace roto: la ficha "${mp[1]}" no existe`);
      const mb = h.match(/^\/blog\/([^/]+)$/);
      if (mb && !approved.has(mb[1])) err(`enlace a un post no aprobado: "${mb[1]}". Quita ese enlace o aprueba el post`);
    }
    posts.push({ ...meta, secundarios, usaVideo, body, html: mdToHtml(body), faq: extractFaq(body), url: `/blog/${meta.slug}` });
  }
  return posts.sort((a, b) => b.fecha_publicacion.localeCompare(a.fecha_publicacion) || a.slug.localeCompare(b.slug));
}
