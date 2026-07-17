// Calculadoras del curso — Academia JaviTrader
// Renderiza una calculadora dentro de cualquier <div class="calc" data-tool="...">
(function () {
  "use strict";

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }
  function fmtNum(n, dec) {
    if (!isFinite(n)) return "—";
    const f = n.toFixed(dec);
    return f.replace(/\.?0+$/, "").replace(".", ",");
  }
  function fmtMoney(n, sym) {
    if (!isFinite(n)) return "—";
    return (sym || "$") + " " + n.toLocaleString("es-ES", { maximumFractionDigits: 2 });
  }
  function field(id, label, value, attrs) {
    return (
      '<div class="calc-field"><label for="' + id + '">' + label + "</label>" +
      '<input id="' + id + '" inputmode="decimal" value="' + value + '" ' + (attrs || "") + "></div>"
    );
  }
  function num(root, id) {
    const v = parseFloat((root.querySelector("#" + id).value || "").replace(",", "."));
    return isNaN(v) ? 0 : v;
  }

  // ---- Tamaño de posición (R) ----
  function positionSize(root) {
    const uid = "ps" + Math.floor(performance.now() % 1e6);
    root.innerHTML =
      '<div class="ctitle"><span class="ic">🧮</span> Calculadora de tamaño de posición</div>' +
      '<p class="csub">Mete tus números y obtén cuánto comprar para arriesgar solo lo que decides. Tu 1R = lo que pierdes si toca el stop loss.</p>' +
      '<div class="calc-grid">' +
        field(uid + "cap", "Capital de la cuenta", "10000", 'data-k="1"') +
        field(uid + "risk", "Riesgo por operación (%)", "1", 'data-k="1"') +
        field(uid + "entry", "Precio de entrada", "100", 'data-k="1"') +
        field(uid + "stop", "Precio del stop loss", "95", 'data-k="1"') +
      "</div>" +
      '<div class="calc-out">' +
        '<div class="calc-res"><div class="l">Tu riesgo (1R)</div><div class="v" id="' + uid + 'oR">—</div></div>' +
        '<div class="calc-res"><div class="l">Distancia al stop loss</div><div class="v" id="' + uid + 'oD">—</div></div>' +
        '<div class="calc-res main"><div class="l">Tamaño de la posición</div><div class="v" id="' + uid + 'oS">—</div></div>' +
        '<div class="calc-res"><div class="l">Valor de la posición</div><div class="v" id="' + uid + 'oV">—</div></div>' +
      "</div>" +
      '<div class="calc-msg" id="' + uid + 'msg"></div>' +
      '<div class="disclaimer">Herramienta educativa. No es una recomendación de inversión.</div>';

    function recalc() {
      const cap = num(root, uid + "cap"),
        risk = num(root, uid + "risk"),
        entry = num(root, uid + "entry"),
        stop = num(root, uid + "stop");
      const riskMoney = cap * (risk / 100);
      const dist = Math.abs(entry - stop);
      const size = dist > 0 ? riskMoney / dist : NaN;
      const value = isFinite(size) ? size * entry : NaN;
      root.querySelector("#" + uid + "oR").textContent = fmtMoney(riskMoney, "$");
      root.querySelector("#" + uid + "oD").textContent = dist > 0 ? fmtNum(dist, 4) : "—";
      root.querySelector("#" + uid + "oS").textContent = isFinite(size) ? fmtNum(size, 6) + " uds." : "—";
      root.querySelector("#" + uid + "oV").textContent = fmtMoney(value, "$");
      const msg = root.querySelector("#" + uid + "msg");
      if (!(dist > 0)) {
        msg.className = "calc-msg neg";
        msg.innerHTML = "El stop loss no puede ser igual al precio de entrada: necesitas una distancia para definir el riesgo.";
      } else {
        msg.className = "calc-msg";
        msg.innerHTML =
          "Compras <b>" + fmtNum(size, 6) + " unidades</b>. Si el precio toca tu stop loss, pierdes exactamente <b>" +
          fmtMoney(riskMoney, "$") + "</b> (tu " + fmtNum(risk, 2) + "% = 1R). Ni un dólar más.";
      }
    }
    root.querySelectorAll("input").forEach((i) => i.addEventListener("input", recalc));
    recalc();
  }

  // ---- Asimetría pérdida / recuperación ----
  function asymmetry(root) {
    const uid = "as" + Math.floor(performance.now() % 1e6);
    root.innerHTML =
      '<div class="ctitle"><span class="ic">⚖️</span> Calculadora de asimetría pérdida / recuperación</div>' +
      '<p class="csub">Una pérdida no se recupera con la misma ganancia: hace falta mucho más. Compruébalo con tu número.</p>' +
      '<div class="calc-grid">' +
        field(uid + "loss", "Pérdida sufrida (%)", "50", 'data-k="1"') +
      "</div>" +
      '<div class="calc-out">' +
        '<div class="calc-res main"><div class="l">Necesitas recuperar</div><div class="v" id="' + uid + 'oRec">—</div></div>' +
        '<div class="calc-res"><div class="l">De 10.000 $ te quedan</div><div class="v" id="' + uid + 'oLeft">—</div></div>' +
      "</div>" +
      '<div class="calc-msg" id="' + uid + 'msg"></div>' +
      '<div class="disclaimer">Herramienta educativa. No es una recomendación de inversión.</div>';

    function recalc() {
      const loss = num(root, uid + "loss");
      const rec = loss < 100 && loss >= 0 ? (loss / (100 - loss)) * 100 : Infinity;
      const left = 10000 * (1 - loss / 100);
      root.querySelector("#" + uid + "oRec").textContent = isFinite(rec) ? "+" + fmtNum(rec, 1) + " %" : "∞ (imposible)";
      root.querySelector("#" + uid + "oLeft").textContent = fmtMoney(Math.max(0, left), "$");
      const msg = root.querySelector("#" + uid + "msg");
      msg.className = "calc-msg";
      if (loss >= 100) {
        msg.className = "calc-msg neg";
        msg.innerHTML = "Con una pérdida del 100% no queda nada que recuperar: estás fuera del juego.";
      } else {
        msg.innerHTML =
          "Si pierdes el <b>" + fmtNum(loss, 1) + "%</b>, necesitas ganar un <b>+" + fmtNum(rec, 1) +
          "%</b> sobre lo que te queda solo para volver a empezar. Por eso la prioridad nº1 es no sufrir pérdidas grandes.";
      }
    }
    root.querySelectorAll("input").forEach((i) => i.addEventListener("input", recalc));
    recalc();
  }

  // ---- Esperanza matemática ----
  function expectancy(root) {
    const uid = "ex" + Math.floor(performance.now() % 1e6);
    root.innerHTML =
      '<div class="ctitle"><span class="ic">📊</span> Calculadora de esperanza matemática</div>' +
      '<p class="csub">El win rate solo no dice nada. Esto te dice si tu sistema gana de verdad a largo plazo (en R).</p>' +
      '<div class="calc-grid">' +
        field(uid + "wr", "Win rate / aciertos (%)", "40", 'data-k="1"') +
        field(uid + "rw", "R media ganada (p.ej. 3 = 3R)", "3", 'data-k="1"') +
        field(uid + "rl", "R media perdida (p.ej. 1 = 1R)", "1", 'data-k="1"') +
      "</div>" +
      '<div class="calc-out">' +
        '<div class="calc-res main"><div class="l">Esperanza por operación</div><div class="v" id="' + uid + 'oE">—</div></div>' +
        '<div class="calc-res"><div class="l">Win rate de equilibrio</div><div class="v" id="' + uid + 'oBE">—</div></div>' +
      "</div>" +
      '<div class="calc-msg" id="' + uid + 'msg"></div>' +
      '<div class="disclaimer">Herramienta educativa. No es una recomendación de inversión.</div>';

    function recalc() {
      const wr = num(root, uid + "wr") / 100,
        rw = num(root, uid + "rw"),
        rl = num(root, uid + "rl");
      const e = wr * rw - (1 - wr) * rl;
      const be = rw + rl > 0 ? (rl / (rw + rl)) * 100 : NaN;
      const eEl = root.querySelector("#" + uid + "oE");
      eEl.textContent = (e >= 0 ? "+" : "") + fmtNum(e, 2) + " R";
      eEl.className = "v " + (e > 0 ? "pos" : e < 0 ? "neg" : "");
      root.querySelector("#" + uid + "oBE").textContent = isFinite(be) ? fmtNum(be, 1) + " %" : "—";
      const msg = root.querySelector("#" + uid + "msg");
      if (e > 0) {
        msg.className = "calc-msg pos";
        msg.innerHTML =
          "Esperanza <b>positiva</b>: de media ganas <b>" + fmtNum(e, 2) +
          " R</b> por operación. Con riesgo bajo y tiempo, el sistema es rentable. (Calcula siempre neto de comisiones.)";
      } else if (e < 0) {
        msg.className = "calc-msg neg";
        msg.innerHTML =
          "Esperanza <b>negativa</b> (" + fmtNum(e, 2) +
          " R): a largo plazo este sistema pierde. Necesitas más aciertos o un ratio R mayor.";
      } else {
        msg.className = "calc-msg";
        msg.innerHTML = "Esperanza nula: ni ganas ni pierdes (y con comisiones, pierdes).";
      }
    }
    root.querySelectorAll("input").forEach((i) => i.addEventListener("input", recalc));
    recalc();
  }

  // ---- Apalancamiento y liquidación ----
  function leverage(root) {
    const uid = "lv" + Math.floor(performance.now() % 1e6);
    root.innerHTML =
      '<div class="ctitle"><span class="ic">⚡</span> Calculadora de apalancamiento y liquidación</div>' +
      '<p class="csub">Dimensionas igual que siempre (por el stop loss). Comprueba que tu apalancamiento solo cambia el margen, no tu riesgo — y a qué distancia queda la liquidación.</p>' +
      '<div class="calc-grid">' +
        field(uid + "cap", "Capital de la cuenta", "1000", 'data-k="1"') +
        field(uid + "risk", "Riesgo por operación (%)", "1", 'data-k="1"') +
        field(uid + "entry", "Precio de entrada", "100", 'data-k="1"') +
        field(uid + "stop", "Precio del stop loss", "95", 'data-k="1"') +
        field(uid + "lev", "Apalancamiento (x)", "10", 'data-k="1"') +
      "</div>" +
      '<div class="calc-out">' +
        '<div class="calc-res main"><div class="l">Tu riesgo real (1R)</div><div class="v" id="' + uid + 'oR">—</div></div>' +
        '<div class="calc-res"><div class="l">Tamaño de la posición</div><div class="v" id="' + uid + 'oS">—</div></div>' +
        '<div class="calc-res"><div class="l">Margen necesario</div><div class="v" id="' + uid + 'oM">—</div></div>' +
        '<div class="calc-res"><div class="l">Liquidación aprox.</div><div class="v" id="' + uid + 'oL">—</div></div>' +
      "</div>" +
      '<div class="calc-msg" id="' + uid + 'msg"></div>' +
      '<div class="disclaimer">Cálculo orientativo (no incluye comisiones ni funding). La liquidación exacta depende del exchange y del margen de mantenimiento.</div>';

    function recalc() {
      const cap = num(root, uid + "cap"), risk = num(root, uid + "risk"),
        entry = num(root, uid + "entry"), stop = num(root, uid + "stop"),
        lev = Math.max(1, num(root, uid + "lev"));
      const riskMoney = cap * (risk / 100);
      const dist = Math.abs(entry - stop);
      const size = dist > 0 ? riskMoney / dist : NaN;
      const posValue = isFinite(size) ? size * entry : NaN;
      const margin = posValue / lev;
      const marginPct = cap > 0 ? (margin / cap) * 100 : NaN;
      const isLong = stop < entry;
      const liqPrice = isLong ? entry * (1 - 1 / lev) : entry * (1 + 1 / lev);
      const liqDist = entry / lev;
      root.querySelector("#" + uid + "oR").textContent = fmtMoney(riskMoney, "$");
      root.querySelector("#" + uid + "oS").textContent = isFinite(size) ? fmtNum(size, 6) + " uds." : "—";
      root.querySelector("#" + uid + "oM").textContent = isFinite(margin) ? fmtMoney(margin, "$") + " (" + fmtNum(marginPct, 1) + "%)" : "—";
      root.querySelector("#" + uid + "oL").textContent = lev > 1 ? fmtNum(liqPrice, 4) : "sin apalanc.";
      const msg = root.querySelector("#" + uid + "msg");
      if (!(dist > 0)) {
        msg.className = "calc-msg neg";
        msg.innerHTML = "El stop loss no puede ser igual a la entrada: necesitas una distancia para definir el riesgo.";
        return;
      }
      const stopPct = (dist / entry) * 100, liqPct = (liqDist / entry) * 100;
      if (lev <= 1) {
        msg.className = "calc-msg";
        msg.innerHTML = "Sin apalancamiento, pierdes <b>" + fmtMoney(riskMoney, "$") + "</b> si toca el stop loss. El apalancamiento no cambiaría ese riesgo: solo el margen que inmovilizas.";
      } else if (dist < liqDist) {
        msg.className = "calc-msg pos";
        msg.innerHTML =
          "Bien dimensionado: tu stop loss está a <b>" + fmtNum(stopPct, 1) + "%</b> y la liquidación a ~" + fmtNum(liqPct, 1) +
          "%. <b>Tu stop loss salta mucho antes que la liquidación.</b> Arriesgas " + fmtMoney(riskMoney, "$") + " pase lo que pase, y solo inmovilizas " + fmtNum(marginPct, 1) + "% de tu capital como margen.";
      } else {
        msg.className = "calc-msg neg";
        msg.innerHTML =
          "⚠️ Peligro: la liquidación (~" + fmtNum(liqPct, 1) + "%) llegaría <b>antes</b> que tu stop loss (" + fmtNum(stopPct, 1) +
          "%). Estás sobredimensionado para ese apalancamiento: baja el apalancamiento o aleja menos el stop loss.";
      }
    }
    root.querySelectorAll("input").forEach((i) => i.addEventListener("input", recalc));
    recalc();
  }

  const TOOLS = { "position-size": positionSize, "asymmetry": asymmetry, "expectancy": expectancy, "leverage": leverage };

  function init() {
    document.querySelectorAll(".calc[data-tool]").forEach((node) => {
      const fn = TOOLS[node.getAttribute("data-tool")];
      if (fn) fn(node);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
