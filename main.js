(function () {
  "use strict";

  const $ = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); }
  }

  function initNav() {
    const nav = $("#nav");
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initReveals() {
    const items = $$("[data-reveal]");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(el => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("is-visible"); });
    }, { threshold: 0.05 });
    items.forEach(el => io.observe(el));
    setTimeout(() => items.forEach(el => el.classList.add("is-visible")), 6000);
  }

  function initMobileMenu() {
    const nav = $("#nav");
    const toggle = $("#nav-toggle");
    const menu = $("#nav-mobile-menu");
    if (!nav || !toggle || !menu) return;
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("menu-open");
      menu.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        nav.classList.remove("menu-open");
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  function initBooksyCta() {
    const cta = $("[data-booksy-cta]");
    if (!cta) return;
    cta.addEventListener("click", (e) => {
      const href = cta.getAttribute("href") || "";
      if (href === "#" || href.trim() === "") {
        e.preventDefault();
        $("[data-reserve-form]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  function initContactForm() {
    const form = $("[data-contact-form]");
    const status = $("[data-contact-status]");
    if (!form || !status) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      status.textContent = "Enviando...";
      fetch(form.action, { method: "POST", mode: "no-cors", body: data })
        .then(() => {
          status.textContent = "¡Gracias! Recibimos tu mensaje, te respondemos a la brevedad.";
          form.reset();
        })
        .catch(() => {
          status.textContent = "Hubo un problema al enviar. Prueba de nuevo o escríbenos por Instagram.";
        });
    });
  }

  function initGoogleReviewsLink() {
    const link = $("[data-google-reviews-link]");
    if (!link) return;
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href") || "";
      if (href === "#" || href.trim() === "") {
        e.preventDefault();
      }
    });
  }

  function initBooksyWidgetA11y() {
    const label = (el) => {
      if (!el.textContent.trim() && !el.getAttribute("aria-label")) {
        el.setAttribute("aria-label", "Reservar en Booksy");
      }
    };
    const existing = $(".booksy-widget-container a.booksy-business-link");
    if (existing) { label(existing); return; }
    const observer = new MutationObserver(() => {
      const link = $(".booksy-widget-container a.booksy-business-link");
      if (link) { label(link); observer.disconnect(); }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 15000);
  }

  function boot() {
    safe(initNav, "initNav");
    safe(initReveals, "initReveals");
    safe(initMobileMenu, "initMobileMenu");
    safe(initBooksyCta, "initBooksyCta");
    safe(initContactForm, "initContactForm");
    safe(initGoogleReviewsLink, "initGoogleReviewsLink");
    safe(initBooksyWidgetA11y, "initBooksyWidgetA11y");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
