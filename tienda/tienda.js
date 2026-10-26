/* Tienda Mónaco: carrito (localStorage), panel, carruseles, desplegables, eventos GA4. Vanilla, sin dependencias. */
(function () {
  'use strict';
  var KEY = 'monaco_tienda_cart_v1';
  var catalog = [];
  var cart = load();
  var lastFocus = null;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function byId(id) { for (var i = 0; i < catalog.length; i++) if (catalog[i].id === id) return catalog[i]; return null; }
  function pending(t) { return /^\[Pendiente/.test(t || ''); }
  function eur(c) { return (c / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function load() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (!Array.isArray(v)) return [];
      return v.filter(function (l) { return l && typeof l.id === 'string' && l.qty >= 1; }).map(function (l) { return { id: l.id, qty: Math.min(10, Math.floor(l.qty)) }; });
    } catch (e) { return []; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} }

  /* GA4 */
  function ev(name, params) { try { if (window.gtag) window.gtag('event', name, params || {}); } catch (e) {} }
  function item(p, qty, list, index) {
    var o = { item_id: p.id, item_name: p.nombre };
    if (p.precio != null) o.price = p.precio / 100;
    if (qty) o.quantity = qty;
    if (list) o.item_list_name = list;
    if (index != null) o.index = index;
    return o;
  }
  function value(items) { var v = 0; items.forEach(function (i) { v += (i.price || 0) * (i.quantity || 1); }); return Math.round(v * 100) / 100; }

  /* Precios y botones desde productos.json */
  function hydrate() {
    $$('[data-price-for]').forEach(function (el) {
      var p = byId(el.getAttribute('data-price-for'));
      if (!p) return;
      if (p.precio == null) { el.innerHTML = '<span class="price-soon">Precio próximamente</span>'; }
      else { el.textContent = eur(p.precio); }
    });
    $$('[data-add]').forEach(function (b) {
      var p = byId(b.getAttribute('data-add'));
      if (!p) return;
      var ok = p.precio != null;
      b.disabled = !ok;
      if (b.hasAttribute('data-add-label')) b.textContent = ok ? 'Añadir al carrito' : 'Precio próximamente';
    });
    renderCart();
  }

  /* Contador */
  function count() { return cart.reduce(function (n, l) { return n + l.qty; }, 0); }
  function updateCount() {
    $$('.cart-count').forEach(function (el) { el.textContent = count(); el.setAttribute('data-n', count()); });
  }

  function add(id, qty) {
    var p = byId(id); if (!p || p.precio == null) return;
    var l = cart.filter(function (x) { return x.id === id; })[0];
    if (l) l.qty = Math.min(10, l.qty + qty); else cart.push({ id: id, qty: Math.min(10, qty) });
    save(); renderCart();
    ev('add_to_cart', { currency: 'EUR', value: value([item(p, qty)]), items: [item(p, qty, listOf(id))] });
    openCart(true);
  }
  function listOf(id) { return (window.__LIST && window.__LIST[id]) || undefined; }
  function setQty(id, qty) {
    var l = cart.filter(function (x) { return x.id === id; })[0]; if (!l) return;
    var p = byId(id);
    if (qty < 1) return removeLine(id);
    var delta = qty - l.qty; l.qty = Math.min(10, qty);
    save(); renderCart();
    if (p && delta < 0) ev('remove_from_cart', { currency: 'EUR', value: value([item(p, -delta)]), items: [item(p, -delta)] });
    if (p && delta > 0) ev('add_to_cart', { currency: 'EUR', value: value([item(p, delta)]), items: [item(p, delta)] });
  }
  function removeLine(id) {
    var l = cart.filter(function (x) { return x.id === id; })[0]; if (!l) return;
    var p = byId(id);
    cart = cart.filter(function (x) { return x.id !== id; });
    save(); renderCart();
    if (p) ev('remove_from_cart', { currency: 'EUR', value: value([item(p, l.qty)]), items: [item(p, l.qty)] });
  }

  /* Panel */
  var panel, overlay, body, foot, msg, payBtn;
  function renderCart() {
    updateCount();
    if (!body) return;
    // Descarta líneas de productos que ya no existen o sin precio
    if (catalog.length) {
      var clean = cart.filter(function (l) { var p = byId(l.id); return p && p.precio != null; });
      if (clean.length !== cart.length) { cart = clean; save(); updateCount(); }
    }
    if (!cart.length) {
      body.innerHTML = '<div class="cart-empty"><p>Tu carrito está vacío</p><a href="/tienda/#mas-vendidos">Ver los productos</a></div>';
      foot.hidden = true; return;
    }
    foot.hidden = false;
    var total = 0, html = '';
    cart.forEach(function (l) {
      var p = byId(l.id); if (!p) return;
      var sub = p.precio * l.qty; total += sub;
      var media = p.imagenes && p.imagenes[0] ? '<img src="' + esc(p.imagenes[0]) + '" alt="" width="72" height="72">' : '<div class="hueco" style="--ar:1/1;font-size:.6rem;padding:.2rem">[Pendiente: foto]</div>';
      html += '<div class="cart-line" data-id="' + esc(p.id) + '">' + media + '<div><div class="name">' + esc(p.nombre) + '</div><div class="row"><div class="qty" role="group" aria-label="Cantidad de ' + esc(p.nombre) + '"><button type="button" data-q="-1" aria-label="Menos">&minus;</button><output>' + l.qty + '</output><button type="button" data-q="1" aria-label="Más">+</button></div><span class="line-price">' + eur(sub) + '</span></div><button type="button" class="cart-remove" data-rm="1">Eliminar</button></div></div>';
    });
    body.innerHTML = html;
    $('.cart-subtotal', foot).textContent = eur(total);
  }
  function focusables() { return $$('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])', panel).filter(function (e) { return e.offsetParent !== null || e === document.activeElement; }); }
  function openCart(silent) {
    if (!panel) return;
    lastFocus = document.activeElement;
    panel.classList.add('open'); overlay.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lock');
    msg.hidden = true;
    var f = focusables(); (f[0] || panel).focus();
    var items = cart.map(function (l) { var p = byId(l.id); return p ? item(p, l.qty) : null; }).filter(Boolean);
    ev('view_cart', { currency: 'EUR', value: value(items), items: items });
  }
  function closeCart() {
    if (!panel || !panel.classList.contains('open')) return;
    panel.classList.remove('open'); overlay.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function buildPanel() {
    overlay = document.createElement('div'); overlay.className = 'cart-overlay'; overlay.setAttribute('data-cart-overlay', '');
    panel = document.createElement('aside'); panel.className = 'cart-panel'; panel.id = 'cart-panel';
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', 'Carrito'); panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = '<div class="cart-head"><h2>Tu carrito</h2><button type="button" class="cart-close" aria-label="Cerrar carrito">&times;</button></div><div class="cart-body" aria-live="polite"></div><div class="cart-foot" hidden><div class="cart-sub"><span>Subtotal</span><span class="cart-subtotal"></span></div><p class="cart-msg" role="status" hidden></p><button type="button" class="btn btn-block cart-pay">Pagar</button></div>';
    document.body.appendChild(overlay); document.body.appendChild(panel);
    body = $('.cart-body', panel); foot = $('.cart-foot', panel); msg = $('.cart-msg', panel); payBtn = $('.cart-pay', panel);
    overlay.addEventListener('click', closeCart);
    $('.cart-close', panel).addEventListener('click', closeCart);
    panel.addEventListener('click', function (e) {
      var line = e.target.closest('.cart-line'); if (!line) return;
      var id = line.getAttribute('data-id'), l = cart.filter(function (x) { return x.id === id; })[0];
      if (e.target.closest('[data-rm]')) { removeLine(id); }
      var q = e.target.closest('[data-q]'); if (q && l) setQty(id, l.qty + parseInt(q.getAttribute('data-q'), 10));
    });
    payBtn.addEventListener('click', pay);
    document.addEventListener('keydown', function (e) {
      if (!panel.classList.contains('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); closeCart(); return; }
      if (e.key === 'Tab') {
        var f = focusables(); if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
      }
    });
  }
  function showMsg(t) { msg.textContent = t; msg.hidden = false; }
  function pay() {
    if (!cart.length) return;
    var items = cart.map(function (l) { var p = byId(l.id); return p ? item(p, l.qty) : null; }).filter(Boolean);
    ev('begin_checkout', { currency: 'EUR', value: value(items), items: items });
    payBtn.disabled = true; msg.hidden = true;
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var to = setTimeout(function () { if (ctl) ctl.abort(); }, 15000);
    fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cart.map(function (l) { return { id: l.id, qty: l.qty }; })), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { s: r.status, d: d }; }); })
      .then(function (o) {
        clearTimeout(to);
        if (o.s === 200 && o.d && o.d.url) { window.location.href = o.d.url; return; }
        payBtn.disabled = false;
        if (o.s === 503) showMsg('El pago online estará disponible muy pronto');
        else showMsg('No se ha podido iniciar el pago (' + (o.d && o.d.error ? o.d.error : 'error ' + o.s) + '). Puedes volver a intentarlo.');
      })
      .catch(function () { clearTimeout(to); payBtn.disabled = false; showMsg('No se ha podido conectar para iniciar el pago. Puedes volver a intentarlo.'); });
  }

  /* Menú y desplegable */
  function initNav() {
    var mb = $('.menu-btn'), nav = $('#nav');
    if (mb && nav) mb.addEventListener('click', function () { var o = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
    $$('.has-sub').forEach(function (h) {
      var b = $('.nav-btn', h);
      b.addEventListener('click', function () { var o = h.classList.toggle('open'); b.setAttribute('aria-expanded', o); });
      h.addEventListener('keydown', function (e) { if (e.key === 'Escape' && h.classList.contains('open')) { h.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); b.focus(); } });
      h.addEventListener('focusout', function (e) { if (!h.contains(e.relatedTarget)) { h.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); } });
    });
    document.addEventListener('click', function (e) { $$('.has-sub.open').forEach(function (h) { if (!h.contains(e.target)) { h.classList.remove('open'); $('.nav-btn', h).setAttribute('aria-expanded', 'false'); } }); });
    $$('[data-open-cart]').forEach(function (b) { b.addEventListener('click', function () { openCart(); }); });
  }

  /* Carruseles */
  function initCarousels() {
    $$('.carousel').forEach(function (c) {
      var t = $('.car-track', c), bar = $('.car-bar span', c), prev = $('.car-arrow.prev', c), next = $('.car-arrow.next', c);
      function upd() {
        var max = t.scrollWidth - t.clientWidth;
        var frac = t.scrollWidth ? t.clientWidth / t.scrollWidth : 1;
        if (bar) { bar.style.width = Math.min(100, frac * 100) + '%'; bar.style.marginLeft = (max > 0 ? (t.scrollLeft / max) * (100 - frac * 100) : 0) + '%'; }
        if (prev) prev.disabled = t.scrollLeft <= 2;
        if (next) next.disabled = t.scrollLeft >= max - 2;
      }
      function step(d) { var k = t.firstElementChild; t.scrollBy({ left: d * (k ? k.getBoundingClientRect().width + 16 : 300), behavior: 'smooth' }); }
      if (prev) prev.addEventListener('click', function () { step(-1); });
      if (next) next.addEventListener('click', function () { step(1); });
      t.addEventListener('scroll', upd, { passive: true });
      window.addEventListener('resize', upd);
      upd();
    });
  }

  /* Galería de ficha */
  function initGallery() {
    var main = $('#g-main-img');
    $$('.g-thumb[data-src]').forEach(function (b) {
      b.addEventListener('click', function () { if (main) main.src = b.getAttribute('data-src'); });
    });
  }

  /* Ficha: cantidad, añadir, barra fija */
  function initPdp() {
    var out = $('#pdp-qty'); if (!out) return;
    var q = 1;
    $$('[data-pdp-q]').forEach(function (b) { b.addEventListener('click', function () { q = Math.max(1, Math.min(10, q + parseInt(b.getAttribute('data-pdp-q'), 10))); out.textContent = q; }); });
    var id = document.body.getAttribute('data-product-id');
    $$('[data-add]').forEach(function (b) { b.addEventListener('click', function () { add(b.getAttribute('data-add'), q); }); });
    var main = $('#add-main'), bar = $('.sticky-add');
    if (main && bar) {
      var upd = function () { bar.classList.toggle('show', main.getBoundingClientRect().bottom < 0); };
      window.addEventListener('scroll', upd, { passive: true });
      window.addEventListener('resize', upd);
      upd();
    }
  }

  /* Eventos de listados */
  function initListEvents() {
    var map = {};
    $$('[data-list]').forEach(function (a) { map[a.getAttribute('data-item')] = a.getAttribute('data-list'); });
    window.__LIST = map;
    var lists = {};
    $$('[data-list]').forEach(function (a, i) {
      var l = a.getAttribute('data-list'); (lists[l] = lists[l] || []).push(a);
      a.addEventListener('click', function () {
        var p = byId(a.getAttribute('data-item')); if (!p) return;
        ev('select_item', { item_list_name: l, items: [item(p, null, l, parseInt(a.getAttribute('data-index') || '0', 10))] });
      });
    });
    Object.keys(lists).forEach(function (l) {
      var items = lists[l].map(function (a, i) { var p = byId(a.getAttribute('data-item')); return p ? item(p, null, l, i) : null; }).filter(Boolean);
      ev('view_item_list', { item_list_name: l, items: items });
    });
  }

  function init() {
    buildPanel(); initNav(); initCarousels(); initGallery(); updateCount();
    var pid = document.body.getAttribute('data-product-id');
    var gone = document.body.getAttribute('data-clear-cart') === '1' && /session_id=/.test(location.search);
    if (gone) { cart = []; save(); }
    fetch('/tienda/productos.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) {
      catalog = d.productos || d; hydrate(); initPdp(); initListEvents();
      if (pid) { var p = byId(pid); if (p) ev('view_item', { currency: 'EUR', value: value([item(p)]), items: [item(p)] }); }
    }).catch(function () { renderCart(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
