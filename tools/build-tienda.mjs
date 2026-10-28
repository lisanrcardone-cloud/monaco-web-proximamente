#!/usr/bin/env node
// Genera la portada, las fichas y las páginas de la tienda desde tienda/productos.json.
// Idempotente y sin dependencias: solo reescribe un archivo si su contenido cambia.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { home } from './tienda-templates/home.mjs';
import { catalog } from './tienda-templates/catalog.mjs';
import { product } from './tienda-templates/product.mjs';
import { gracias, legal } from './tienda-templates/simple.mjs';

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

out('tienda/index.html', home(productos));
out('tienda/productos/index.html', catalog(productos, categorias));
for (const p of productos) out(`tienda/producto/${p.slug}/index.html`, product(p, productos));
out('tienda/gracias/index.html', gracias(productos));
out('tienda/envios-devoluciones/index.html', legal('envios-devoluciones', 'Envíos y devoluciones', 'texto de envíos y devoluciones', productos));
out('tienda/condiciones/index.html', legal('condiciones', 'Condiciones', 'condiciones de compra', productos));
console.log(changed ? `${changed} archivo(s) actualizados` : 'sin cambios');
