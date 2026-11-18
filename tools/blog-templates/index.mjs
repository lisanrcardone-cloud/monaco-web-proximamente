import { page, esc, SITE, productUrl } from '../tienda-templates/lib.mjs';

export const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const fechaLarga = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} de ${MESES[m - 1]} de ${y}`; };
export const prod = (productos, slug) => (productos || []).find((x) => x.slug === slug);

// Imagen de portada de un post: el póster del vídeo o la primera foto del producto.
export function postImage(post, productos) {
  if (post.video_poster) return { src: post.video_poster, width: 720, height: 1280, alt: post.video_titulo || post.titulo };
  const p = post.producto && prod(productos, post.producto);
  if (p && p.imagenes && p.imagenes[0]) return { src: p.imagenes[0], width: 1000, height: 1000, alt: p.nombre };
  return null;
}

export function postCard(post, productos, level = 2) {
  const im = postImage(post, productos);
  return `<a class="post-card" href="${post.url}">
    ${im ? `<div class="post-card-media"><img src="${esc(im.src)}" alt="" width="${im.width}" height="${im.height}" loading="lazy"></div>` : ''}
    <div class="post-card-body">
      <p class="post-cat">${esc(post.categoria)}</p>
      <h${level}>${esc(post.titulo)}</h${level}>
      <p>${esc(post.resumen)}</p>
      <time datetime="${post.fecha_publicacion}">${fechaLarga(post.fecha_publicacion)}</time>
    </div>
  </a>`;
}

export function blogIndex(posts, productos) {
  const SUB = 'Historias de la barbería y cómo sacar partido a cada producto.';
  const main = `
<div class="wrap"><nav class="crumbs" aria-label="Migas de pan"><a href="/">Inicio</a> › <span>Blog</span></nav></div>
<section class="wrap blog-index" aria-label="Blog">
  <header class="blog-head">
    <h1>Blog de Mónaco Barbershop</h1>
    <p>${SUB}</p>
  </header>
  <div class="post-grid">
${posts.map((p) => postCard(p, productos)).join('\n')}
  </div>
</section>`;
  const ld = [{
    '@context': 'https://schema.org', '@type': 'Blog',
    name: 'Blog de Mónaco Barbershop', url: SITE + '/blog', inLanguage: 'es-ES', description: SUB,
    publisher: { '@type': 'Organization', name: 'Mónaco Barbershop', url: SITE },
    blogPost: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.titulo, url: SITE + p.url, datePublished: p.fecha_publicacion })),
  }];
  return page({
    title: 'Blog | Mónaco Barbershop',
    description: `${SUB} Mónaco Barbershop, Rúa de Venezuela 71, Vigo.`,
    path: '/blog', bodyClass: 'blog-page', hayBlog: true, productos, main, jsonld: ld,
  });
}
