import { page, card, carousel, hueco, huecoIn, sectionTitle, productUrl, txt, esc } from './lib.mjs';

const CINTA_ICO = '<svg class="cinta-ico" width="33" height="31" viewBox="0 0 33 31" fill="none" aria-hidden="true" focusable="false"><g filter="url(#cinta-seal-shadow)"><path d="M30.2846 10.2862C30.5462 11.4179 29.4156 12.6551 29.3734 13.7615C29.327 14.9058 30.3395 16.2275 29.9935 17.2959C29.6476 18.3769 28.0361 18.9047 27.4202 19.859C26.8043 20.8091 27.0025 22.456 26.1504 23.2245C25.3067 23.9803 23.6488 23.6594 22.611 24.1915C21.6069 24.7024 20.9446 26.231 19.7887 26.4844C18.6328 26.7377 17.363 25.6356 16.2282 25.5934C15.0554 25.547 13.7013 26.5351 12.6086 26.2015C11.4992 25.8637 10.9634 24.2928 9.98467 23.689C9.01017 23.0851 7.32273 23.2836 6.53807 22.4475C5.76185 21.6241 6.09512 20.0068 5.55092 18.9934C5.02359 18.0137 3.4627 17.3676 3.20115 16.236C2.9396 15.1043 4.07018 13.867 4.11237 12.7607C4.15877 11.6164 3.14631 10.2947 3.49223 9.22632C3.83816 8.14532 5.44967 7.61749 6.06559 6.66316C6.6815 5.71306 6.48323 4.06622 7.33539 3.29769C8.17911 2.54183 9.83702 2.86276 10.8748 2.3307C11.8788 1.81976 12.5412 0.291147 13.7013 0.0377869C14.8614 -0.215573 16.127 0.886544 17.2618 0.928771C18.4345 0.97522 19.7887 -0.0128851 20.8813 0.320706C21.9908 0.65852 22.5266 2.22935 23.5053 2.8332C24.4798 3.43704 26.1673 3.23857 26.9519 4.07044C27.7281 4.89386 27.3949 6.51114 27.9391 7.52459C28.4664 8.50425 30.0273 9.15032 30.2888 10.2862L30.2846 10.2862Z" fill="#E3C68C"/></g><path fill-rule="evenodd" clip-rule="evenodd" d="M11.3547 9C11.2704 9 11.1981 9.03586 11.1378 9.09562C11.0776 9.15538 11.0414 9.22709 11.0414 9.31076V10.1355C11.0414 10.2191 11.0776 10.2908 11.1378 10.3506C11.1981 10.4104 11.2704 10.4462 11.3547 10.4462C11.439 10.4462 11.5234 10.4104 11.5716 10.3506C11.6318 10.2908 11.668 10.2072 11.668 10.1355V9.62151H20.2342V16.0876H15.7041C15.5595 15.3466 14.921 14.7849 14.1499 14.7849C13.3788 14.7849 12.7402 15.3466 12.5957 16.0876H11.3547C11.2704 16.0876 11.1981 16.1235 11.1378 16.1833C11.0776 16.243 11.0414 16.3147 11.0414 16.3984C11.0414 16.4821 11.0776 16.5538 11.1378 16.6135C11.1981 16.6733 11.2704 16.7092 11.3547 16.7092H12.5957C12.7402 17.4382 13.3788 18 14.1499 18C14.921 18 15.5595 17.4382 15.7041 16.7092H21.6439C21.7884 17.4382 22.427 18 23.1981 18C23.9692 18 24.6077 17.4382 24.7523 16.7092H25.8487C25.933 16.7092 26.0053 16.6733 26.0655 16.6135C26.1258 16.5538 26.1619 16.4821 26.1619 16.3984V13.3506C26.1619 13.3506 26.1499 13.243 26.1137 13.1833L24.427 10.494C24.3667 10.3984 24.2704 10.3506 24.1619 10.3506H20.8487V9.31076C20.8487 9.22709 20.8125 9.15538 20.7523 9.09562C20.692 9.03586 20.6198 9 20.5354 9H11.3426H11.3547ZM20.8607 10.9721H23.9932L25.5475 13.4462V16.0876H24.7643C24.6198 15.3466 23.9812 14.7849 23.2101 14.7849C22.439 14.7849 21.7884 15.3466 21.6559 16.0876H20.8728V10.9721H20.8607ZM10.4511 11.259C10.3667 11.259 10.2945 11.2948 10.2342 11.3546C10.174 11.4143 10.1378 11.4861 10.1378 11.5697C10.1378 11.6534 10.174 11.7251 10.2342 11.7849C10.2945 11.8446 10.3667 11.8805 10.4511 11.8805H13.5716C13.6559 11.8805 13.7282 11.8446 13.7884 11.7849C13.8487 11.7251 13.8848 11.6534 13.8848 11.5697C13.8848 11.4861 13.8487 11.4143 13.7884 11.3546C13.7282 11.2948 13.6559 11.259 13.5716 11.259H10.4511ZM8.46313 12.9681C8.37879 12.9681 8.3065 13.004 8.24626 13.0637C8.18602 13.1235 8.14988 13.1952 8.14988 13.2789C8.14988 13.3625 8.18602 13.4462 8.24626 13.494C8.3065 13.5538 8.37879 13.5896 8.46313 13.5896H12.5716C12.6559 13.5896 12.7402 13.5538 12.7884 13.494C12.8487 13.4343 12.8848 13.3506 12.8848 13.2789C12.8848 13.1952 12.8487 13.1235 12.7884 13.0637C12.7282 13.004 12.6439 12.9681 12.5716 12.9681H8.46313ZM6.47518 14.6892C6.39084 14.6892 6.31855 14.7251 6.25831 14.7849C6.19807 14.8446 6.16193 14.9163 6.16193 15C6.16193 15.0837 6.19807 15.1554 6.25831 15.2151C6.31855 15.2749 6.39084 15.3108 6.47518 15.3108H11.5836C11.668 15.3108 11.7402 15.2749 11.8005 15.2151C11.8607 15.1554 11.8969 15.0837 11.8969 15C11.8969 14.9163 11.8607 14.8327 11.8005 14.7849C11.7402 14.7251 11.6559 14.6892 11.5836 14.6892H6.47518ZM14.1258 15.4064C14.1258 15.4064 14.1378 15.4064 14.1499 15.4064C14.68 15.4064 15.1137 15.8367 15.1137 16.3984C15.1137 16.9602 14.68 17.3785 14.1499 17.3785C13.6198 17.3785 13.186 16.9482 13.186 16.3984C13.186 15.8486 13.6077 15.4303 14.1258 15.4064ZM23.186 15.4064C23.186 15.4064 23.1981 15.4064 23.2101 15.4064C23.7402 15.4064 24.174 15.8367 24.174 16.3984C24.174 16.9602 23.7402 17.3785 23.2101 17.3785C22.68 17.3785 22.2463 16.9482 22.2463 16.3984C22.2463 15.8486 22.6679 15.4303 23.186 15.4064Z" fill="#0D3934"/></svg>';
const CINTA_DEFS = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><filter id="cinta-seal-shadow" x="0.922885" y="0" width="31.64" height="31.0002" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"></feColorMatrix><feOffset dy="2.23904"></feOffset><feGaussianBlur stdDeviation="1.11952"></feGaussianBlur><feComposite in2="hardAlpha" operator="out"></feComposite><feColorMatrix type="matrix" values="0 0 0 0 0.160784 0 0 0 0 0.105882 0 0 0 0 0.482353 0 0 0 0.25 0"></feColorMatrix><feBlend mode="normal" in2="BackgroundImageFix" result="cinta-seal-fx"></feBlend><feBlend mode="normal" in="SourceGraphic" in2="cinta-seal-fx" result="shape"></feBlend></filter></defs></svg>';

export function home(productos) {
  const feat = productos.find((p) => p.destacado) || productos[0];
  const cat = (...ids) => ids.flatMap((id) => productos.filter((p) => p.categoria === id));
  const cinta = Array.from({ length: 6 }, () => `<span class="cinta-item">${'Envío gratis en pedidos de 49 € o más'}${CINTA_ICO}</span>`).join('');
  const featMedia = feat.imagenes && feat.imagenes[0]
    ? `<img src="${esc(feat.imagenes[0])}" alt="${esc(feat.nombre)}" width="1000" height="1000">`
    : hueco('foto del producto protagonista', '1/1');

  const main = `
<section class="hero" aria-label="Producto protagonista">
  <div class="wrap">
    <div>
      <h1><span class="it">Pack Textura</span><span class="caps">Volumen y textura en casa</span></h1>
      <p>${esc(feat.resumen)}</p>
      <a class="btn" href="${productUrl(feat)}" data-list="portada" data-item="${feat.id}" data-index="0">Ver el pack</a>
    </div>
    <div class="hero-media">${featMedia}</div>
  </div>
</section>

${CINTA_DEFS}
<div class="cinta" aria-label="Información de envío"><div class="cinta-track">${cinta}${cinta.replace(/class="cinta-item"/g, 'class="cinta-item" aria-hidden="true"')}</div></div>

<section class="sec bg-white" id="mas-vendidos">
  <div class="wrap">
    ${sectionTitle('¿Primera vez?', 'Los más vendidos')}
    ${carousel(cat('peinado').map((p, i) => card(p, 'mas_vendidos', i)), 'c3', 'Los más vendidos')}
  </div>
</section>

<section class="manifiesto" aria-label="Manifiesto">
  <div class="wrap">
    <p class="quote">${huecoIn('frase de la casa')}</p>
    <p class="sign">${huecoIn('firma')}</p>
    <a class="link-ul" href="/">Conocer la barbería</a>
  </div>
</section>

<section class="sec bg-white" id="packs">
  <div class="wrap">
    ${sectionTitle('', 'Packs')}
    ${carousel(cat('packs').map((p, i) => card(p, 'packs', i)), 'c3', 'Packs')}
  </div>
</section>

<section class="sec bg-white" id="cuidado-cabello">
  <div class="wrap">
    ${sectionTitle('Para cada tipo de pelo', 'Cuidado del cabello')}
    ${carousel(cat('champus', 'tratamientos').map((p, i) => card(p, 'cuidado_cabello', i)), 'c3', 'Cuidado del cabello')}
  </div>
</section>

<section class="sec bg-white" id="barba">
  <div class="wrap">
    ${sectionTitle('', 'Barba')}
    ${carousel(cat('barba').map((p, i) => card(p, 'barba', i)), 'c3', 'Barba')}
  </div>
</section>

<section class="sec bg-blush" id="clientes">
  <div class="wrap">
    ${sectionTitle('', 'Clientes')}
    <div class="review-card">
      <div class="ba">${hueco('antes', '3/4')}${hueco('después', '3/4')}</div>
      <div class="review-text">${hueco('reseña de cliente', '16/9')}${huecoIn('nombre del cliente')}</div>
    </div>
  </div>
</section>

<section class="sec bg-barberos" id="barberos">
  <div class="wrap">
    <h2 class="sec-title"><span class="caps">Recomendado <span class="it" style="display:inline;font-size:inherit;text-transform:none;color:inherit">por tu barbero</span></span></h2>
    <div class="grid3">
      ${[1, 2, 3].map((n) => `<div class="expert">${hueco('vídeo del barbero ' + n, '9/16')}<div>${huecoIn('nombre del barbero')}</div><div>${huecoIn('producto recomendado')}</div></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="sec bg-gente" id="gente-real">
  <div class="wrap">
    ${sectionTitle('', 'Gente real')}
    ${carousel([1, 2, 3, 4].map((n) => `<div class="card">${hueco('vídeo de cliente ' + n, '9/16')}</div>`), 'c5', 'Vídeos de clientes')}
  </div>
</section>

<section class="follow-sec" id="siguenos">
  <div class="follow-band"><div class="wrap"><div class="follow"><span class="it">Síguenos</span><a href="https://www.instagram.com/monacobarbershop.oficial/" rel="noopener" target="_blank">@monacobarbershop.oficial</a></div></div></div>
  <div class="grid6">${[1, 2, 3, 4, 5, 6].map((n) => hueco('foto ' + n, '1/1', ' data-small="1"')).join('')}</div>
</section>`;

  return page({
    title: 'Tienda | Mónaco Barbershop',
    description: 'Productos de peinado, champús y cuidado de barba que usamos en Mónaco Barbershop, en Vigo.',
    path: '/tienda',
    productos,
    main,
    jsonld: [],
  });
}
