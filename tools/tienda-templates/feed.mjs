// Feed de productos para Google Merchant Center (RSS 2.0 con namespace g:). Solo datos de productos.json.
import { SITE, esc, isReal, eur } from './lib.mjs';

const abs = (u) => (/^https?:\/\//.test(u) ? u : SITE + u);

function item(p, categorias) {
  const pack = p.categoria === 'packs';
  const cat = (categorias || []).find((c) => c.id === p.categoria);
  const titulo = p.marca === 'Mónaco' ? p.nombre : `${p.marca} ${p.nombre}${p.formato ? ' ' + p.formato : ''}`;
  const [img, ...extra] = p.imagenes;
  const l = [
    `<g:id>${esc(p.id)}</g:id>`,
    `<g:title>${esc(titulo)}</g:title>`,
    `<g:description>${esc(p.descripcion || p.resumen)}</g:description>`,
    `<g:link>${SITE}/tienda/producto/${esc(p.slug)}</g:link>`,
    `<g:image_link>${esc(abs(img))}</g:image_link>`,
    ...extra.map((u) => `<g:additional_image_link>${esc(abs(u))}</g:additional_image_link>`),
    '<g:availability>in_stock</g:availability>',
    `<g:price>${eur(p.precio)} EUR</g:price>`,
    '<g:condition>new</g:condition>',
    `<g:brand>${esc(p.marca)}</g:brand>`,
    `<g:product_type>${esc(cat ? cat.nombre : p.categoria)}</g:product_type>`,
  ];
  if (pack) l.push('<g:identifier_exists>no</g:identifier_exists>', '<g:is_bundle>yes</g:is_bundle>');
  if (p.solo_recogida) l.push('<g:excluded_destination>Shopping_ads</g:excluded_destination>', '<g:excluded_destination>Free_listings</g:excluded_destination>');
  return `    <item>\n${l.map((x) => '      ' + x).join('\n')}\n    </item>`;
}

export function googleFeed(productos, categorias) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Mónaco Barbershop – Tienda</title>
    <link>${SITE}/tienda</link>
    <description>Productos de Mónaco Barbershop</description>
${productos.filter(isReal).map((p) => item(p, categorias)).join('\n')}
  </channel>
</rss>
`;
}
