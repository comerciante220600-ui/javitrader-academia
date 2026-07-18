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
//   - se pulsa "Siguiente" en el pager (leerla entera y avanzar).
(function () {
  "use strict";

  var KEY = "jt_progreso";
  // Nº de lecciones por módulo (para saber cuándo un módulo está completo).
  var LECCIONES = { m0: 5, m1: 6, m2: 5, m3: 5, m4: 5, m5: 5, m6: 5, m7: 5, m8: 3 };

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
    subir(file); // además, a la cuenta (no-op fuera de la plataforma)
  }

  // Sube una lección completada a la cuenta (fire-and-forget; si falla, da igual:
  // localStorage ya la tiene).
  function subir(file) {
    if (!EN_PLATAFORMA || !window.fetch) return;
    try {
      fetch(API, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leccion: file }),
        keepalive: true,
      }).catch(function () {});
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
        local.forEach(function (f) { if (d.lecciones.indexOf(f) === -1) subir(f); });
      })
      .catch(function () {});
  }

  function moduloCompleto(mid, hechas) {
    var n = hechas.filter(function (f) { return moduloDe(f) === mid; }).length;
    return LECCIONES[mid] && n >= LECCIONES[mid];
  }

  function pintar() {
    var hechas = leer();

    // 1) Sidebar "Estás viendo": número dorado en las lecciones completadas.
    document.querySelectorAll(".lesson[href]").forEach(function (a) {
      var num = a.querySelector(".num");
      if (!num) return;
      num.classList.toggle("done", hechas.indexOf(basename(a.getAttribute("href"))) !== -1);
    });

    // 2) Tarjetas .lcard: lecciones (portada de módulo) y módulos (portada del curso).
    document.querySelectorAll("a.lcard[href]").forEach(function (a) {
      var file = basename(a.getAttribute("href"));
      var mod = /^modulo-([0-8])\.html$/.exec(file);
      var done = mod ? moduloCompleto("m" + mod[1], hechas) : hechas.indexOf(file) !== -1;
      a.classList.toggle("done", !!done);
    });
  }

  function fileActual() {
    return basename(location.pathname);
  }

  function init() {
    pintar();
    sincronizar(); // en la plataforma, fusiona con el progreso de la cuenta

    // Trigger A: avanzar con el pager ("Siguiente"/"Empezar"/"Completar").
    document.querySelectorAll(".pager a").forEach(function (a) {
      var avanza = a.classList.contains("next") || /siguiente|completar|terminar|finalizar/i.test(a.textContent || "");
      if (avanza) a.addEventListener("click", function () { marcar(fileActual()); });
    });

    // Trigger B: terminar la autoevaluación.
    document.addEventListener("jt:leccion-completa", function () { marcar(fileActual()); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
