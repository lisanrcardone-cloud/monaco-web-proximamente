#!/usr/bin/env node
// Genera /blog y /blog/<slug> desde blog/posts/*.md (solo estado: aprobado). build-tienda.mjs lo llama al principio.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPosts } from './blog-templates/posts.mjs';
import { postPage } from './blog-templates/post.mjs';
import { blogIndex } from './blog-templates/index.mjs';

export function blogSitemapUrls(posts) {
  if (!posts.length) return [];
  return [['/blog', 'weekly', '0.6'], ...posts.map((p) => [`/blog/${p.slug}`, 'monthly', '0.5'])];
}

export function buildBlog({ root, productos, out }) {
  const posts = loadPosts(join(root, 'blog/posts'), productos);
  // Despublicar: borra las carpetas de blog/ que ya no tienen un post aprobado (nunca toca blog/posts).
  const dir = join(root, 'blog');
  if (existsSync(dir)) {
    const keep = new Set(posts.map((p) => p.slug));
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory() && e.name !== 'posts' && !keep.has(e.name)) rmSync(join(dir, e.name), { recursive: true, force: true });
    }
    if (!posts.length && existsSync(join(dir, 'index.html'))) rmSync(join(dir, 'index.html'));
  }
  if (!posts.length) return [];
  out('blog/index.html', blogIndex(posts, productos));
  for (const p of posts) out(`blog/${p.slug}/index.html`, postPage(p, productos, posts));
  return posts;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const { productos } = JSON.parse(readFileSync(join(root, 'tienda/productos.json'), 'utf8'));
  const out = (rel, html) => {
    const f = join(root, rel);
    mkdirSync(dirname(f), { recursive: true });
    if (existsSync(f) && readFileSync(f, 'utf8') === html) return;
    writeFileSync(f, html);
    console.log('escrito', rel);
  };
  buildBlog({ root, productos, out });
}
