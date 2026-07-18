// Progreso del curso — Academia JaviTrader
// Marca lecciones completadas y pinta el check en el sidebar, en las portadas
// de módulo y en la portada del curso. El estado vive en localStorage
// (jt_progreso = ["m0-leccion-1.html", ...]); es por navegador, sin backend.
//
// Una lección se marca como completada cuando:
//   - se termina su autoevaluación (evento 'jt:leccion-completa' que emite quiz.js), o
//   - se pulsa "Siguiente" en el pager (leerla entera y avanzar).
(function () {
  "use strict";

  var KEY = "jt_progreso";
  // Nº de lecciones por módulo (para saber cuándo un módulo está completo).
  var LECCIONES = { m0: 5, m1: 6, m2: 5, m3: 5, m4: 5, m5: 5, m6: 5, m7: 5, m8: 3 };

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

  function marcar(file) {
    if (!file || !moduloDe(file)) return;
    var s = leer();
    if (s.indexOf(file) === -1) {
      s.push(file);
      try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
      pintar();
    }
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
