/* ==========================================================================
   ACCESO BETA — Academia JaviTrader
   Candado privado + marca de agua por persona para la prueba con testers.

   ── CÓMO GESTIONAR LOS TESTERS ──
   Edita la lista TESTERS de abajo. Cada línea = una persona:
       { code: "el-codigo-que-le-das", name: "Nombre para la marca de agua" }
   • Da a cada tester SU propio código (no lo compartan entre ellos).
   • Puedes pasarle un enlace directo:  https://academia.javitrader.com/?k=SU-CODIGO
     (entra sin teclear nada; queda desbloqueado en su navegador).
   • Para revocar a alguien: borra su línea y vuelve a subir el cambio.

   ── NOTA HONESTA ──
   Esto hace el curso PRIVADO y RASTREABLE (si se filtra, el nombre sale en las
   páginas). No es cifrado: alguien MUY técnico podría saltarlo. Para una beta de
   5 personas de confianza, es de sobra.
   ========================================================================== */
(function () {
  "use strict";

  /* ▼▼▼  EDITA AQUÍ TUS 5 TESTERS  ▼▼▼ */
  var TESTERS = [
    { code: "javi-2026",       name: "Javi (dueño)" },
    { code: "beta-ana-7412",   name: "Ana" },
    { code: "beta-luis-3908",  name: "Luis" },
    { code: "beta-marta-5521", name: "Marta" },
    { code: "beta-jorge-8134", name: "Jorge" },
    { code: "beta-sara-2670",  name: "Sara" }
  ];
  /* ▲▲▲  EDITA AQUÍ TUS 5 TESTERS  ▲▲▲ */

  var KEY = "jt_beta_access";

  function findByCode(v) {
    v = (v || "").trim().toLowerCase();
    if (!v) return null;
    for (var i = 0; i < TESTERS.length; i++) {
      if (TESTERS[i].code.toLowerCase() === v) return TESTERS[i];
    }
    return null;
  }
  function save(name) {
    try { localStorage.setItem(KEY, JSON.stringify({ name: name, t: Date.now() })); } catch (e) {}
  }
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; }
  }

  /* 1) FASE TEMPRANA (corre en <head>, antes de pintar el <body>).
        Resuelve acceso por enlace (?k=) o por sesión previa; si no, oculta el
        contenido para que no haya un parpadeo del curso antes del candado. */
  var access = load();
  if (!access || !access.name) {
    try {
      var k = new URLSearchParams(location.search).get("k");
      var t = findByCode(k);
      if (t) { save(t.name); access = { name: t.name }; }
    } catch (e) {}
  }
  if (!access || !access.name) {
    document.documentElement.classList.add("gate-locked");
  }

  function watermark(name) {
    if (!name || document.querySelector(".wm-overlay")) return;
    var txt = (name + " · beta privada · no compartir").replace(/[<>&]/g, "");
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='330' height='200'>"
            + "<text x='8' y='120' transform='rotate(-28 165 100)' "
            + "fill='rgba(212,175,55,0.07)' font-family='Inter,Arial,sans-serif' "
            + "font-size='15' font-weight='600'>" + txt + "</text></svg>";
    var d = document.createElement("div");
    d.className = "wm-overlay";
    d.style.backgroundImage = "url(\"data:image/svg+xml;utf8," + encodeURIComponent(svg) + "\")";
    document.body.appendChild(d);
  }

  function unlock(name) {
    save(name);
    document.documentElement.classList.remove("gate-locked");
    var ov = document.querySelector(".gate-overlay");
    if (ov) ov.parentNode.removeChild(ov);
    watermark(name);
  }

  function buildGate() {
    var ov = document.createElement("div");
    ov.className = "gate-overlay";
    ov.innerHTML =
        "<div class='gate-card'>"
      + "  <div class='gate-brand'>JaviTrader · Academia</div>"
      + "  <h1>Acceso a la beta</h1>"
      + "  <p>Este curso está en prueba privada. Introduce el código de acceso que te hemos dado.</p>"
      + "  <input id='gate-code' type='text' autocomplete='off' spellcheck='false' placeholder='Tu código de acceso'>"
      + "  <button id='gate-go' type='button'>Entrar</button>"
      + "  <div id='gate-err' class='gate-err'></div>"
      + "  <div class='gate-foot'>Contenido educativo · no es asesoramiento financiero</div>"
      + "</div>";
    document.body.appendChild(ov);
    var input = ov.querySelector("#gate-code");
    var err = ov.querySelector("#gate-err");
    function attempt() {
      var t = findByCode(input.value);
      if (t) { unlock(t.name); }
      else { err.textContent = "Código no válido. Revísalo o escríbenos."; input.select(); }
    }
    ov.querySelector("#gate-go").addEventListener("click", attempt);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") attempt(); });
    setTimeout(function () { try { input.focus(); } catch (e) {} }, 60);
  }

  /* 2) AL CARGAR EL DOM: o marca de agua (ya con acceso) o levantar el candado. */
  function onReady() {
    var a = load();
    if (a && a.name) { watermark(a.name); }
    else { buildGate(); }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
