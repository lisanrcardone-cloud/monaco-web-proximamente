(function () {
  "use strict";

  var WORD = "PROXIMAMENTE";
  var REPEATS_PER_ROW = 40; // suficiente para cubrir pantallas anchas (hasta ~5K) sin huecos
  var wrap = document.getElementById("watermark");
  if (!wrap) return;

  function buildRowHTML() {
    var out = "";
    for (var i = 0; i < REPEATS_PER_ROW; i++) {
      out += "<span>" + WORD + "</span>";
    }
    return out;
  }

  function render() {
    wrap.innerHTML = "";

    var probe = document.createElement("div");
    probe.className = "watermark-row";
    probe.style.visibility = "hidden";
    probe.style.position = "absolute";
    probe.innerHTML = "<span>" + WORD + "</span>";
    wrap.appendChild(probe);
    var rowHeight = probe.getBoundingClientRect().height || 60;
    wrap.removeChild(probe);

    var vh = window.innerHeight || document.documentElement.clientHeight;
    var rowCount = Math.ceil(vh / rowHeight) + 3; // margen extra por el desplazamiento de filas pares

    var frag = document.createDocumentFragment();
    for (var r = 0; r < rowCount; r++) {
      var row = document.createElement("div");
      row.className = "watermark-row";
      row.innerHTML = buildRowHTML();
      frag.appendChild(row);
    }
    wrap.appendChild(frag);
  }

  render();

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 150);
  });
})();
