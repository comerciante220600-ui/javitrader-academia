// Progreso del curso — Academia JaviTrader
// Marca lecciones completadas y pinta el check en el sidebar, en las portadas
// de módulo y en la portada del curso. El estado vive en localStorage
// (jt_progreso = ["m0-leccion-1.html", ...]) como caché rápida.
//
// En la PLATAFORMA (las lecciones se sirven bajo /curso/…) además se sincroniza
// con la cuenta vía /api/curso/progreso, para que el progreso se vea igual en
// móvil y PC. En la academia estática (páginas en la raíz) es solo localStorage.
// La sincronización es a prueba de fallos: si el endpoint no responde, se sigue
// usando localStorage sin romper nada.
//
// Una lección se marca como completada cuando:
//   - se termina su autoevaluación (evento 'jt:leccion-completa' que emite quiz.js), o
//   - se pulsa "Siguiente" en el pager (leerla entera y avanzar), o
//   - se pulsa el botón explícito "Marcar como completada" (se inyecta al final
//     de cada lección; se puede volver a pulsar para desmarcar).
(function () {
  "use strict";

  var KEY = "jt_progreso";
  // Nº de lecciones por módulo (para saber cuándo un módulo está completo).
  var LECCIONES = { m0: 5, m1: 6, m2: 5, m3: 7, m4: 5, m5: 5, m6: 5, m7: 5, m8: 3 };

  // Sincronización con la cuenta: solo en la plataforma (lecciones bajo /curso/).
  var API = "/api/curso/progreso";
  var EN_PLATAFORMA = location.pathname.indexOf("/curso/") === 0;

  function basename(href) {
    if (!href) return "";
    var s = String(href).split("#")[0].split("?")[0];
    var i = s.lastIndexOf("/");
    return i >= 0 ? s.slice(i + 1) : s;
  }

  // Módulo (m0..m8) al que pertenece un archivo de lección, o null.
  function moduloDe(file) {
    var m = /^m([0-8])-leccion-\d+\.html$/.exec(file);
    if (m) return "m" + m[1];
    if (/^leccion-\d+\.html$/.test(file)) return "m1"; // el M1 vive en la raíz
    return null;
  }

  function leer() {
    try {
      var a = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(a) ? a : [];
    } catch (e) {
      return [];
    }
  }

  function guardar(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
  }

  function marcar(file) {
    if (!file || !moduloDe(file)) return;
    var s = leer();
    if (s.indexOf(file) === -1) {
      s.push(file);
      guardar(s);
      pintar();
    }
    sincronizarCuenta(file, "POST"); // además, a la cuenta (no-op fuera de la plataforma)
  }

  // Desmarca una lección (por si se pulsó sin querer el botón de completar).
  function desmarcar(file) {
    if (!file) return;
    var s = leer();
    var i = s.indexOf(file);
    if (i !== -1) {
      s.splice(i, 1);
      guardar(s);
      pintar();
    }
    sincronizarCuenta(file, "DELETE"); // borra también en la cuenta (no-op fuera de la plataforma)
  }

  // Sube/borra una lección en la cuenta (fire-and-forget; si falla, da igual:
  // localStorage ya manda). Fuera de la plataforma no hace nada.
  function sincronizarCuenta(file, metodo) {
    if (!EN_PLATAFORMA || !window.fetch) return;
    try {
      var url = API;
      var opts = { method: metodo, credentials: "same-origin", keepalive: true };
      if (metodo === "POST") {
        opts.headers = { "Content-Type": "application/json" };
        opts.body = JSON.stringify({ leccion: file });
      } else {
        // DELETE: la lección va en query para no depender de body en DELETE.
        url = API + "?leccion=" + encodeURIComponent(file);
      }
      fetch(url, opts).catch(function () {});
    } catch (e) {}
  }

  // Al cargar en la plataforma: trae el progreso de la cuenta, lo fusiona con
  // el local (unión) y sube al servidor lo que se hubiera completado sin conexión.
  function sincronizar() {
    if (!EN_PLATAFORMA || !window.fetch) return;
    fetch(API, { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !Array.isArray(d.lecciones)) return;
        var local = leer();
        var union = local.slice();
        d.lecciones.forEach(function (f) { if (union.indexOf(f) === -1) union.push(f); });
        guardar(union);
        pintar();
        // lo que estaba en local pero no en la cuenta, subirlo
        local.forEach(function (f) { if (d.lecciones.indexOf(f) === -1) sincronizarCuenta(f, "POST"); });
      })
      .catch(function () {});
  }

  function completadasDe(mid, hechas) {
    return hechas.filter(function (f) { return moduloDe(f) === mid; }).length;
  }

  function moduloCompleto(mid, hechas) {
    return LECCIONES[mid] && completadasDe(mid, hechas) >= LECCIONES[mid];
  }

  function pintar() {
    var hechas = leer();

    // 1) Sidebar "Estás viendo": tick dorado en las lecciones completadas.
    document.querySelectorAll(".lesson[href]").forEach(function (a) {
      var num = a.querySelector(".num");
      if (!num) return;
      var done = hechas.indexOf(basename(a.getAttribute("href"))) !== -1;
      num.classList.toggle("done", done);
      num.title = done ? "Marcar como no vista" : "Marcar como vista";
    });

    // 2) Tarjetas .lcard: lecciones (portada de módulo) y módulos (portada del curso).
    document.querySelectorAll("a.lcard[href]").forEach(function (a) {
      var file = basename(a.getAttribute("href"));
      var mod = /^modulo-([0-8])\.html$/.exec(file);
      var done = mod ? moduloCompleto("m" + mod[1], hechas) : hechas.indexOf(file) !== -1;
      a.classList.toggle("done", !!done);
    });

    // 2b) "Otros módulos" del sidebar: check dorado en los módulos completados
    // (feedback David). En la plataforma, los módulos bloqueados llevan otro href
    // (a comprar), así que no hacen match y NO reciben check.
    document.querySelectorAll(".sidebar a.tool-link[href]").forEach(function (a) {
      var mod = /^modulo-([0-8])\.html$/.exec(basename(a.getAttribute("href")));
      if (!mod) return;
      a.classList.toggle("mod-done", moduloCompleto("m" + mod[1], hechas));
    });

    // 3) Barra del topbar: refleja lecciones REALES completadas del módulo actual.
    pintarBarra(hechas);

    // 4) Botón explícito de completar al final de la lección.
    pintarBoton(hechas);
  }

  // Actualiza la barra "Progreso del módulo N/T" del topbar con las completadas.
  function pintarBarra(hechas) {
    var prog = document.querySelector(".topbar .prog");
    if (!prog) return;
    var mid = moduloDe(fileActual());
    if (!mid) return;
    var total = LECCIONES[mid] || 0;
    var n = completadasDe(mid, hechas);
    var pct = total ? Math.round((n / total) * 100) : 0;

    var span = prog.querySelector(".bar span");
    if (span) span.style.width = pct + "%";

    // Reescribe el texto "N/T" (último nodo de texto del .prog) sin tocar el resto.
    for (var i = prog.childNodes.length - 1; i >= 0; i--) {
      var nd = prog.childNodes[i];
      if (nd.nodeType === 3 && /\d+\s*\/\s*\d+/.test(nd.nodeValue)) {
        nd.nodeValue = " " + n + "/" + total;
        break;
      }
    }
  }

  var boton = null; // referencia al botón inyectado

  // Crea el botón "Marcar como completada" justo encima del pager de la lección.
  function crearBoton() {
    var file = fileActual();
    if (!moduloDe(file)) return;          // solo en páginas de lección
    var pager = document.querySelector(".pager");
    if (!pager || boton) return;

    var wrap = document.createElement("div");
    wrap.className = "lesson-done";
    boton = document.createElement("button");
    boton.type = "button";
    boton.addEventListener("click", function () {
      var hechas = leer();
      if (hechas.indexOf(file) === -1) marcar(file);
      else desmarcar(file);
    });
    wrap.appendChild(boton);
    pager.parentNode.insertBefore(wrap, pager);
    pintarBoton(leer());
  }

  function pintarBoton(hechas) {
    if (!boton) return;
    var file = fileActual();
    var hecha = hechas.indexOf(file) !== -1;
    boton.parentNode.classList.toggle("is-done", hecha);
    boton.innerHTML = hecha
      ? '<span class="ic">✓</span> Lección completada'
      : '<span class="ic">✓</span> Marcar como completada';
    boton.title = hecha ? "Pulsa para desmarcar" : "Marca esta lección como leída";
  }

  function fileActual() {
    return basename(location.pathname);
  }

  function init() {
    crearBoton();
    pintar();
    sincronizar(); // en la plataforma, fusiona con el progreso de la cuenta

    // Trigger A: avanzar con el pager ("Siguiente"/"Empezar"/"Completar").
    document.querySelectorAll(".pager a").forEach(function (a) {
      var avanza = a.classList.contains("next") || /siguiente|completar|terminar|finalizar/i.test(a.textContent || "");
      if (avanza) a.addEventListener("click", function () { marcar(fileActual()); });
    });

    // Trigger B: terminar la autoevaluación.
    document.addEventListener("jt:leccion-completa", function () { marcar(fileActual()); });

    // Trigger C: clic en el CÍRCULO numerado del sidebar → marca/desmarca esa
    // lección al instante, sin abrirla (feedback David). El resto del enlace
    // sigue navegando a la lección; solo el círculo hace toggle.
    document.querySelectorAll(".sidebar .lesson[href] .num").forEach(function (num) {
      num.addEventListener("click", function (e) {
        var a = num.closest ? num.closest(".lesson[href]") : num.parentNode;
        if (!a) return;
        var file = basename(a.getAttribute("href"));
        if (!moduloDe(file)) return;
        e.preventDefault();   // no navegar
        e.stopPropagation();
        if (leer().indexOf(file) === -1) marcar(file);
        else desmarcar(file);
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
