import { page, esc, SITE, productUrl } from '../tienda-templates/lib.mjs';
import { VIDEO_MARK } from './md.mjs';
import { postCard, postImage, fechaLarga, prod } from './index.mjs';

export const BOOKSY = 'https://booksy.com/es-es/dl/show-business/187597';
const eur = (c) => (c / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
const abs = (u) => (u.startsWith('http') ? u : SITE + u);
const bookBtn = (cls = '') => `<a class="btn${cls}" href="${BOOKSY}" target="_blank" rel="noopener">Reserva tu cita en Booksy</a>`;

export const minutos = (body) => Math.max(1, Math.ceil(body.replace(/\[\[video\]\]/g, ' ').split(/\s+/).filter(Boolean).length / 200));

function videoFigure(p) {
  return `<figure class="post-video"><video controls playsinline preload="none" poster="${esc(p.video_poster)}" width="720" height="1280" aria-label="${esc(p.video_titulo)}"><source src="${esc(p.video_src)}" type="video/mp4"></video></figure>`;
}

function midBox(p, pr) {
  if (p.tipo === 'producto') {
    return `<aside class="post-cta-box" aria-label="Producto de este artículo"><p class="post-cta-name">${esc(pr.nombre)}</p><p class="post-price">${eur(pr.precio)}</p><a class="btn" href="${productUrl(pr)}">Ver en la tienda</a></aside>`;
  }
  return `<aside class="post-cta-box is-plain" aria-label="Reservar cita">${bookBtn()}</aside>`;
}

function endBlock(p, pr) {
  if (p.tipo === 'producto') {
    const im = pr.imagenes && pr.imagenes[0];
    return `<aside class="post-end post-end-product" aria-label="Producto de este artículo">
  ${im ? `<a class="post-end-img" href="${productUrl(pr)}" tabindex="-1" aria-hidden="true"><img src="${esc(im)}" alt="" width="400" height="400" loading="lazy"></a>` : ''}
  <div class="post-end-copy"><h2>${esc(pr.nombre)}</h2><p class="post-price">${eur(pr.precio)}</p><a class="btn btn-gold" href="${productUrl(pr)}">Ver en la tienda</a></div>
</aside>`;
  }
  return `<aside class="post-end" aria-label="Visítanos">
  <div class="post-end-copy"><h2>Te esperamos en la Rúa de Venezuela 71, Vigo.</h2><p>De lunes a sábado, de 9:00 a 20:00.</p>${bookBtn(' btn-gold')}</div>
</aside>`;
}

// Inserta la caja detrás de la sección del 2.º H2 (antes del 3.º; si no hay 3.º, al final).
function withBox(html, box) {
  const idx = [...html.matchAll(/<h2>/g)].map((m) => m.index);
  if (idx.length < 2) return html;
  if (idx.length === 2) return `${html}\n${box}`;
  return `${html.slice(0, idx[2])}${box}\n${html.slice(idx[2])}`;
}

export function postPage(post, productos, posts = []) {
  const pr = post.tipo === 'producto' ? prod(productos, post.producto) : null;
  const hasVideo = !!(post.usaVideo && post.video_src);
  let html = post.html;
  html = html.includes(VIDEO_MARK) ? html.replace(VIDEO_MARK, hasVideo ? videoFigure(post) : '') : html;
  html = withBox(html, midBox(post, pr));
  const related = posts.filter((x) => x.slug !== post.slug).slice(0, 3);
  const im = postImage(post, productos);
  const url = SITE + post.url;
  const author = post.autor === 'Felipe Denti'
    ? { '@type': 'Person', name: 'Felipe Denti', jobTitle: 'Barbero' }
    : { '@type': 'Organization', name: 'Mónaco Barbershop' };
  const graph = [{
    '@type': 'BlogPosting', headline: post.titulo, description: post.meta_description, inLanguage: 'es-ES',
    datePublished: post.fecha_publicacion, dateModified: post.fecha_publicacion,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url }, author,
    publisher: { '@type': 'Organization', name: 'Mónaco Barbershop', url: SITE, logo: { "@type": "ImageObject", url: `${SITE}/assets/favicon-512.png` } },
    ...(im ? { image: abs(im.src) } : {}),
  }, {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: SITE + '/blog' },
      { '@type': 'ListItem', position: 3, name: post.titulo, item: url },
    ],
  }];
  if (hasVideo) {
    graph.push({
      '@type': 'VideoObject', name: post.video_titulo, description: post.resumen, thumbnailUrl: abs(post.video_poster),
      uploadDate: post.video_fecha, contentUrl: abs(post.video_src), duration: post.video_duracion,
    });
  }
  if (post.tipo === 'producto' && post.faq.length) {
    graph.push({ '@type': 'FAQPage', mainEntity: post.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  }

  const main = `
<div class="wrap"><nav class="crumbs" aria-label="Migas de pan"><a href="/">Inicio</a> › <a href="/blog">Blog</a> › <span>${esc(post.titulo)}</span></nav></div>
<div class="wrap">
<article class="post">
  <header class="post-head">
    <p class="post-cat">${esc(post.categoria)}</p>
    <h1>${esc(post.titulo)}</h1>
    <p class="post-meta">Por ${esc(post.autor)} · <time datetime="${post.fecha_publicacion}">${fechaLarga(post.fecha_publicacion)}</time> · ${minutos(post.body)} min de lectura</p>
    <p class="post-lead">${esc(post.resumen)}</p>
  </header>
  <div class="post-body">
${html}
  </div>
  ${endBlock(post, pr)}
</article>
${related.length ? `<section class="post-related" aria-labelledby="sigue"><h2 id="sigue">Sigue leyendo</h2><div class="post-grid">${related.map((x) => postCard(x, productos, 3)).join('\n')}</div></section>` : ''}
</div>`;

  return page({
    title: post.meta_title, description: post.meta_description, path: post.url,
    bodyClass: 'blog-page', ogType: 'article', hayBlog: true, productos, main,
    image: im ? { url: abs(im.src), width: im.width, height: im.height, alt: im.alt } : null,
    jsonld: [{ '@context': 'https://schema.org', '@graph': graph }],
  });
}
