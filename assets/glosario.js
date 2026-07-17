/* Auto-enlazador del glosario — enlaza la PRIMERA mención de cada término
   del glosario dentro del contenido de la lección (article) hacia
   glosario.html#termino. Salta scripts, svg, enlaces, títulos, código,
   fórmulas, quizzes y calculadoras. El término "R" NO se auto-enlaza
   (demasiado ambiguo); vive solo en la página del glosario. */
(function () {
  'use strict';

  // [ancla, [variantes... (más larga primero)], soloMayusculas]
  var TERMS = [
    ['libro-de-ordenes', ['libro de órdenes'], false],
    ['funding-rate', ['funding rate', 'funding'], false],
    ['posicion-larga', ['posición larga', 'posiciones largas'], false],
    ['posicion-corta', ['posición corta', 'posiciones cortas', 'en corto'], false],
    ['stop-loss', ['stop loss'], false],
    ['take-profit', ['take profit'], false],
    ['tamano-de-posicion', ['tamaño de posición', 'position sizing'], false],
    ['esperanza-matematica', ['esperanza matemática'], false],
    ['win-rate', ['win rate'], false],
    ['marco-temporal', ['marcos temporales', 'marco temporal'], false],
    ['media-movil', ['medias móviles', 'media móvil'], false],
    ['vela-japonesa', ['velas japonesas', 'vela japonesa'], false],
    ['soporte-y-resistencia', ['resistencias', 'resistencia', 'soportes', 'soporte'], false],
    ['cuenta-demo', ['cuenta demo', 'cuenta de demostración'], false],
    ['apalancamiento', ['apalancamiento'], false],
    ['liquidacion', ['liquidación'], false],
    ['liquidez', ['liquidez'], false],
    ['spread', ['spreads', 'spread'], false],
    ['spot', ['spot'], false],
    ['futuros', ['futuros'], false],
    ['perpetuos', ['perpetuos', 'perpetuo'], false],
    ['broker', ['brókers', 'bróker', 'brokers', 'broker'], false],
    ['exchange', ['exchanges', 'exchange'], false],
    ['activo', ['activos', 'activo'], false],
    ['tendencia', ['tendencias', 'tendencia'], false],
    ['rango', ['rangos', 'rango'], false],
    ['volumen', ['volumen'], false],
    ['drawdown', ['drawdown'], false],
    ['backtesting', ['backtesting', 'backtest'], false],
    ['journal', ['journal'], false],
    ['on-chain', ['on-chain'], false],
    ['rsi', ['RSI'], true],
    ['fomo', ['FOMO'], true]
  ];

  var SKIP_TAGS = { A: 1, H1: 1, H2: 1, H3: 1, H4: 1, H5: 1, SCRIPT: 1, STYLE: 1, CODE: 1, PRE: 1, BUTTON: 1 };
  var SKIP_CLASSES = ['quiz', 'calc', 'formula', 'gl-entry'];
  var LETTER = 'A-Za-zÀ-ÖØ-öø-ÿ';

  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function skip(el) {
    for (var n = el; n && n.nodeType === 1; n = n.parentNode) {
      if (SKIP_TAGS[n.tagName] || n.tagName === 'svg' || n.tagName === 'SVG') return true;
      if (n.classList) {
        for (var i = 0; i < SKIP_CLASSES.length; i++) {
          if (n.classList.contains(SKIP_CLASSES[i])) return true;
        }
      }
    }
    return false;
  }

  function run() {
    var art = document.querySelector('article');
    if (!art) return;
    if (document.querySelector('.gl-entry')) return; // el propio glosario

    TERMS.forEach(function (t) {
      var anchor = t[0], variants = t[1], upperOnly = t[2];
      var body = '(' + variants.map(esc).join('|') + ')';
      var re = new RegExp('(^|[^' + LETTER + '-])' + body + '(?![' + LETTER + '-])', upperOnly ? '' : 'i');

      var walker = document.createTreeWalker(art, NodeFilter.SHOW_TEXT, null);
      var node;
      while ((node = walker.nextNode())) {
        var txt = node.nodeValue;
        if (!txt || !txt.trim()) continue;
        if (skip(node.parentNode)) continue;
        var m = re.exec(txt);
        if (!m) continue;
        var start = m.index + m[1].length;
        var term = node.splitText(start);
        term.splitText(m[2].length);
        var a = document.createElement('a');
        a.className = 'gl';
        a.href = 'glosario.html#' + anchor;
        a.title = 'Ver en el glosario';
        a.textContent = term.nodeValue;
        term.parentNode.replaceChild(a, term);
        break; // solo la primera mención por lección
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
