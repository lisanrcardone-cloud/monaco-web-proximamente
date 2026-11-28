#!/usr/bin/env node
/**
 * scripts/indexnow.mjs
 *
 * Avisa a IndexNow (Bing, Copilot, etc.) de las páginas que han cambiado.
 * Uso: node scripts/indexnow.mjs [rango-git] [--dry-run]
 *   rango-git por defecto: HEAD~1..HEAD
 *
 * Toma los .html cambiados en el rango, los convierte a URL (index.html -> /,
 * X/index.html -> /X) y se queda solo con los que están en sitemap.xml (así no
 * avisa de páginas noindex, plantillas ni 404). Node puro, sin dependencias.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HOST = 'www.monacobarberia.com';
const KEY = '7a472c775db382e1f0b28d615d214f97'; // pública por diseño: también está en /7a472c775db382e1f0b28d615d214f97.txt
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_ATTEMPTS = 3;
const TIMEOUT_MS = 10000;

export function fileToLoc(file) {
  if (file === 'index.html') return `https://${HOST}/`;
  if (file.endsWith('/index.html')) return `https://${HOST}/${file.slice(0, -'/index.html'.length)}`;
  return `https://${HOST}/${file}`;
}

function readSitemapLocs() {
  const xml = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

function changedUrls(range) {
  const out = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACM', range], { cwd: ROOT, timeout: 30000 }).toString();
  const inSitemap = new Set(readSitemapLocs());
  return out
    .split('\n')
    .filter((f) => f.endsWith('.html'))
    .map(fileToLoc)
    .filter((url) => inSitemap.has(url));
}

async function submit(urlList) {
  const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList });
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      console.log(`IndexNow intento ${attempt}/${MAX_ATTEMPTS}: HTTP ${res.status}`);
      if (res.status === 200 || res.status === 202) return true;
    } catch (e) {
      console.log(`IndexNow intento ${attempt}/${MAX_ATTEMPTS}: error ${e.message}`);
    }
  }
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const range = args.find((a) => !a.startsWith('--')) || 'HEAD~1..HEAD';

  const urlList = changedUrls(range);
  if (urlList.length === 0) {
    console.log(`indexnow: sin URLs del sitemap cambiadas en ${range}; nada que enviar.`);
    return;
  }
  console.log(`indexnow: ${urlList.length} URLs en ${range}:`);
  urlList.forEach((u) => console.log(`  ${u}`));

  if (dryRun) {
    console.log('--dry-run: no se envía nada.');
    return;
  }
  if (!(await submit(urlList))) process.exit(1);
}

main();
