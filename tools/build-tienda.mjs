#!/usr/bin/env node
// Genera la portada, las fichas y las páginas de la tienda desde tienda/productos.json.
// Idempotente y sin dependencias: solo reescribe un archivo si su contenido cambia.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { home } from './tienda-templates/home.mjs';
import { catalog } from './tienda-templates/catalog.mjs';
import { product } from './tienda-templates/product.mjs';
import { SITE, setHayBlog, isReal, ENVIO, eurEs } from './tienda-templates/lib.mjs';
import { buildBlog, blogSitemapUrls } from './build-blog.mjs';
import { gracias, legal, desistir } from './tienda-templates/simple.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { productos, categorias } = JSON.parse(readFileSync(join(root, 'tienda/productos.json'), 'utf8'));
let changed = 0;

function out(rel, html) {
  const f = join(root, rel);
  mkdirSync(dirname(f), { recursive: true });
  if (existsSync(f) && readFileSync(f, 'utf8') === html) return;
  writeFileSync(f, html);
  changed++;
  console.log('escrito', rel);
}

// El blog va primero: el pie de todas las páginas solo enlaza a /blog si hay posts aprobados.
const posts = buildBlog({ root, productos, out });
setHayBlog(posts.length > 0);

out('tienda/index.html', home(productos));
out('tienda/productos/index.html', catalog(productos, categorias));
for (const p of productos) out(`tienda/producto/${p.slug}/index.html`, product(p, productos, posts));
out('tienda/gracias/index.html', gracias(productos));
out('tienda/envios-devoluciones/index.html', legal('envios-devoluciones', 'Envíos y devoluciones', 'texto de envíos y devoluciones', productos));
out('tienda/condiciones/index.html', legal('condiciones', 'Condiciones de compra', 'condiciones de compra', productos));
out('tienda/desistir/index.html', desistir(productos));
out('aviso-legal/index.html', legal('aviso-legal', 'Aviso legal', 'aviso legal', productos, '/aviso-legal'));

// llms.txt: plantilla tools/llms-base.md + bloque de tienda generado desde productos.json
const precioEs = (c) => (c / 100).toFixed(2).replace('.', ',');
const tienda = [
  '## Tienda online', '',
  `Tienda de Mónaco Barbershop: productos de peinado, champús, barba, tratamientos y packs, los mismos que se usan en la barbería. Envío a la península por ${eurEs(ENVIO.peninsula)} € (gratis desde ${eurEs(ENVIO.umbral_gratis)} €) en 3-6 días laborables, a Baleares por ${eurEs(ENVIO.baleares)} € en 4-7 días laborables. No se envía a Canarias, Ceuta ni Melilla. Recogida gratis en la barbería (Rúa de Venezuela 71, Vigo), de lunes a sábado de 9:00 a 20:00. La espuma de rizos y el Pack Rizos son aerosoles: solo recogida en la barbería. Devolución en 14 días naturales.`,
  ...categorias.flatMap((c) => {
    const ps = productos.filter((p) => p.categoria === c.id && isReal(p));
    if (!ps.length) return [];
    return ['', `### ${c.nombre}`, ...ps.map((p) => {
      const r = String(p.resumen || '').trim();
      return `- [${p.nombre}](${SITE}/tienda/producto/${p.slug}): ${r}${r && !/[.!?]$/.test(r) ? '.' : ''} ${precioEs(p.precio)} € (${p.marca}).${p.solo_recogida ? ' Solo recogida en la barbería.' : ''}`;
    })];
  }),
].join('\n');
out('llms.txt', readFileSync(join(root, 'tools/llms-base.md'), 'utf8').replace('{{TIENDA}}', tienda));

const U = [['/', 'monthly', '1.0'], ['/about', 'monthly', '0.5'], ['/contact', 'monthly', '0.5'], ['/privacy', 'monthly', '0.5'],
  ['/aviso-legal', 'yearly', '0.2'], ['/tienda', 'weekly', '0.8'], ['/tienda/productos', 'weekly', '0.7'],
  ...productos.map((p) => [`/tienda/producto/${p.slug}`, 'weekly', '0.6']),
  ['/tienda/envios-devoluciones', 'yearly', '0.2'], ['/tienda/condiciones', 'yearly', '0.2'], ['/tienda/desistir', 'yearly', '0.2'], ...blogSitemapUrls(posts)];
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${U.map(([u, c, pr]) => `  <url>
    <loc>${SITE}${u}</loc>
    <changefreq>${c}</changefreq>
    <priority>${pr}</priority>
  </url>`).join('\n')}
</urlset>
`);
console.log(changed ? `${changed} archivo(s) actualizados` : 'sin cambios');
