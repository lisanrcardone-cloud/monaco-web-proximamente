// Utilidades y piezas comunes (cabecera, pie, huecos) de la tienda.
export const SITE = 'https://www.monacobarberia.com';
export const IG_URL = 'https://www.instagram.com/monacobarbershop.oficial/';
export const IG_HANDLE = '@monacobarbershop.oficial';

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const isPending = (t) => /^\[Pendiente/.test(t || '');

// Hueco de bloque con proporción real
export const hueco = (label, ar = '1/1', extra = '') =>
  `<div class="hueco" style="--ar:${ar}"${extra}>[Pendiente: ${esc(label)}]</div>`;
// Hueco en línea
export const huecoIn = (label) => `<span class="hueco-in">[Pendiente: ${esc(label)}]</span>`;
// Texto que puede ser hueco (nombre sin definir)
export const txt = (t) => (isPending(t) ? `<span class="hueco-in">${esc(t)}</span>` : esc(t));
export const CATS = [['peinado', 'Peinado'], ['champus', 'Champús'], ['barba', 'Barba'], ['tratamientos', 'Tratamientos'], ['packs', 'Packs']];
const catLinks = () => CATS.map(([id, n]) => `<li><a href="/tienda/productos/#${id}">${n}</a></li>`).join('') + '<li><a href="/tienda/productos/">Ver todo</a></li>';
export const cardSub = (p) => `${esc(p.marca)}${p.formato ? ' · ' + esc(p.formato) : ''}`;
export const productUrl = (p) => `/tienda/producto/${p.slug}`;

const GA = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-EHWP4106KW"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-EHWP4106KW');
</script>
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "y8hbbvzzyc");
</script>`;

export function page({ title, description, path, bodyAttrs = '', bodyClass = '', main, productos, jsonld = [] }) {
  const ld = jsonld.map((o) => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`).join('\n');
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="${SITE}${path}">
${GA}
<link rel="icon" type="image/x-icon" href="/assets/favicon.ico?v=20260826">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png?v=20260826">
<link rel="icon" type="image/png" sizes="512x512" href="/assets/favicon-512.png?v=20260826">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png?v=20260826">
<link rel="preload" as="font" type="font/woff2" href="/fonts/fraunces-normal-500-600.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/fonts/inter-400-500-600.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/fonts/jost-400-500.woff2" crossorigin>
<link rel="stylesheet" href="/tienda/tienda.css">
${ld}
</head>
<body class="${bodyClass}" ${bodyAttrs}>
<a class="skip-link" href="#main">Saltar al contenido</a>
<div class="promo">Preparamos tu pedido en 24-48 h · Recogida gratis en la barbería</div>
${header(productos)}
<main id="main">
${main}
</main>
${footer(productos)}
<script src="/tienda/tienda.js" defer></script>
</body>
</html>
`;
}

export function header(productos) {
  const subs = catLinks();
  return `<header class="header">
  <div class="wrap">
    <a class="logo" href="/tienda" aria-label="Mónaco Barbershop, tienda"><img src="/assets/logo-wordmark-nav.png" alt="Mónaco Barbershop" width="128" height="34"></a>
    <nav class="nav" id="nav" aria-label="Principal">
      <ul class="nav-list">
        <li class="has-sub"><button type="button" class="nav-btn" aria-expanded="false" aria-controls="sub-productos">Productos <span class="chev" aria-hidden="true"></span></button>
          <ul class="sub" id="sub-productos">${subs}</ul></li>
        <li><a href="/tienda/#mas-vendidos">Más vendidos</a></li>
        <li><a href="/tienda/#packs">Packs</a></li>
        <li><a href="/">La barbería</a></li>
      </ul>
    </nav>
    <div class="head-actions">
      <button type="button" class="menu-btn" aria-expanded="false" aria-controls="nav">Menú</button>
      <button type="button" class="cart-btn" data-open-cart aria-label="Abrir carrito" aria-controls="cart-panel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg><span class="cart-count" data-n="0" aria-live="polite">0</span></button>
    </div>
  </div>
</header>`;
}

export function footer(productos) {
  const tienda = catLinks();
  return `<footer class="footer">
  <div class="wrap">
    <div class="foot-top">
      <div><span class="it">Sigue en contacto</span><a class="link-ul" href="/contact">Escríbenos</a></div>
      <div class="foot-cols">
        <div><h2>Tienda</h2><ul>${tienda}</ul></div>
        <div><h2>Mónaco</h2><ul>
          <li><a href="/">La barbería</a></li>
          <li><a href="/contact">Contacto</a></li>
          <li><a class="foot-ig" href="${IG_URL}" rel="noopener" target="_blank"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.9"/><circle cx="17.1" cy="6.9" r=".6" fill="currentColor" stroke="none"/></svg>Instagram</a></li></ul></div>
        <div><h2>Ayuda</h2><ul>
          <li><a href="/tienda/envios-devoluciones">Envíos y devoluciones</a></li>
          <li><a href="/tienda/condiciones">Condiciones</a></li>
          <li><a href="/privacy">Privacidad</a></li></ul></div>
      </div>
    </div>
    <div class="foot-word"><img src="/assets/tienda/wordmark-verde.svg" alt="Mónaco Barbershop" width="1014" height="390"></div>
    <div class="foot-legal"><span>&copy; 2026 Mónaco Barbershop</span><a href="/privacy">Privacidad</a></div>
  </div>
</footer>`;
}

// Tarjeta de producto
export function card(p, list, index) {
  const media = p.imagenes && p.imagenes[0]
    ? `<img src="${esc(p.imagenes[0])}" alt="${esc(p.nombre)}" width="1000" height="1000" loading="lazy">`
    : hueco('foto del producto', '1/1');
  return `<a class="card" href="${productUrl(p)}" data-cat="${p.categoria}" data-list="${list}" data-item="${p.id}" data-index="${index}">
    <div class="card-media"${p.textura ? ` data-tex="${p.textura}"` : ''}>${media}</div>
    ${p.etiqueta ? `<span class="tag">${esc(p.etiqueta)}</span>` : ''}
    <h3>${txt(p.nombre)}</h3>
    <p class="card-sub">${cardSub(p)}</p>
    <div class="price" data-price-for="${p.id}"><span class="price-soon">Precio próximamente</span></div>
  </a>`;
}

export function carousel(cards, cls = '', label = 'Carrusel') {
  return `<div class="carousel" role="region" aria-label="${esc(label)}">
  <div class="car-track ${cls}">
${cards.join('\n')}
  </div>
  <div class="car-ui"><div class="car-bar" aria-hidden="true"><span></span></div>
    <div class="car-arrows"><button type="button" class="car-arrow prev" aria-label="Anterior"></button><button type="button" class="car-arrow next" aria-label="Siguiente"></button></div></div>
</div>`;
}

export const sectionTitle = (it, caps) => `<h2 class="sec-title">${it ? `<span class="it">${esc(it)}</span>` : ''}<span class="caps">${esc(caps)}</span></h2>`;
