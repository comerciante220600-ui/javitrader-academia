/* ==========================================================================
   TEMA CLARO/OSCURO — Academia JaviTrader
   Interruptor claro/oscuro. Por defecto OSCURO (la marca).
   Corre en <head> para fijar el tema antes de pintar (sin parpadeo).
   Guarda la preferencia en localStorage (jt_theme) y persiste entre páginas.
   ========================================================================== */
(function () {
  "use strict";
  var KEY = "jt_theme";

  // 1) Fase temprana (en <head>): aplica la clase antes de pintar.
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === "light") document.documentElement.classList.add("light");

  // 2) Botón flotante para cambiar de tema.
  function isLight() { return document.documentElement.classList.contains("light"); }
  function makeToggle() {
    if (document.querySelector(".theme-toggle")) return;
    var b = document.createElement("button");
    b.className = "theme-toggle";
    b.type = "button";
    b.title = "Cambiar entre claro y oscuro";
    b.setAttribute("aria-label", "Cambiar entre tema claro y oscuro");
    function paint() { b.textContent = isLight() ? "☾" : "☀"; } // 🌙 si está claro (para ir a oscuro) / ☀ si está oscuro
    paint();
    b.addEventListener("click", function () {
      var light = document.documentElement.classList.toggle("light");
      try { localStorage.setItem(KEY, light ? "light" : "dark"); } catch (e) {}
      paint();
    });
    document.body.appendChild(b);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", makeToggle);
  } else {
    makeToggle();
  }
})();
