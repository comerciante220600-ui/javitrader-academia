// Autoevaluación tipo test — Academia JaviTrader
// Cada <div class="quiz" data-quiz> contiene un <script type="application/json"> con:
//   [ { "q": "...", "opts": ["...","..."], "correct": 0, "why": "..." }, ... ]
(function () {
  "use strict";

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function setup(box) {
    var src = box.querySelector('script[type="application/json"]');
    if (!src) return;
    var data;
    try { data = JSON.parse(src.textContent); } catch (e) { return; }
    if (!Array.isArray(data) || !data.length) return;

    var total = data.length, answered = 0, correct = 0;
    box.innerHTML = "";

    var head = document.createElement("div");
    head.className = "quiz-head";
    head.innerHTML = '<div class="qh-title">Autoevaluación · ' + total + ' preguntas tipo test</div>' +
      '<div class="qscore">Sin responder</div>';
    box.appendChild(head);
    var scoreEl = head.querySelector(".qscore");

    data.forEach(function (item, qi) {
      var card = document.createElement("div");
      card.className = "qcard";
      card.innerHTML = '<div class="qnum">Pregunta ' + (qi + 1) + '</div>' +
        '<div class="qtext">' + escapeHtml(item.q) + "</div>";
      var opts = document.createElement("div");
      opts.className = "qopts";
      var locked = false;

      (item.opts || []).forEach(function (opt, oi) {
        var b = document.createElement("button");
        b.className = "qopt";
        b.type = "button";
        b.innerHTML = '<span class="qletter">' + String.fromCharCode(65 + oi) + "</span><span>" + escapeHtml(opt) + "</span>";
        b.addEventListener("click", function () {
          if (locked) return;
          locked = true;
          answered++;
          var isCorrect = oi === item.correct;
          if (isCorrect) correct++;
          else b.classList.add("wrong");
          Array.prototype.forEach.call(opts.children, function (btn, bi) {
            if (bi === item.correct) btn.classList.add("correct");
            else if (!btn.classList.contains("wrong")) btn.classList.add("dim");
            btn.disabled = true;
          });
          var why = document.createElement("div");
          why.className = "qwhy " + (isCorrect ? "ok" : "no");
          why.innerHTML = "<b>" + (isCorrect ? "Correcto ✓" : "Incorrecto ✗") + "</b> &mdash; " + escapeHtml(item.why || "");
          card.appendChild(why);
          if (answered === total) {
            scoreEl.textContent = "Resultado: " + correct + " / " + total;
            scoreEl.className = "qscore " + (correct >= Math.ceil(total * 0.7) ? "good" : "bad");
          } else {
            scoreEl.textContent = "Aciertos: " + correct + " / " + total;
          }
        });
        opts.appendChild(b);
      });
      card.appendChild(opts);
      box.appendChild(card);
    });
  }

  function init() {
    document.querySelectorAll(".quiz[data-quiz]").forEach(setup);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
