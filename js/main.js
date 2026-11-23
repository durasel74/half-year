/* ============================================================================
   ЛОГИКА ОТКРЫТКИ · js/main.js
   ----------------------------------------------------------------------------
   Порт компонентов React-версии на чистый JavaScript:
     · initLetterTexts()    — тексты письма из js/content.js
     · initBackdrop()       — светящиеся частицы и сердечки фона
     · initRibbons()        — ленточки с комплиментами (+ зоны обхода)
     · initLetterTimer()    — появление письма (один таймер)
   Подключается последним (см. конец index.html).
   ============================================================================ */

(function () {
  "use strict";

  var C = window.CARD_CONTENT;

  function rnd(a, b) {
    return a + Math.random() * (b - a);
  }

  /* ═══════════════════════ Письмо: тексты ═══════════════════════ */

  function initLetterTexts() {
    var letter = document.getElementById("letter");

    // Сдвиг входного блика синхронно с задержкой появления (как в React-версии)
    letter.style.setProperty("--enter-delay", (C.letterDelayMs / 1000).toFixed(1) + "s");

    var eyebrow = document.getElementById("letter-eyebrow");
    if (C.eyebrow) {
      eyebrow.textContent = C.eyebrow;
    } else {
      eyebrow.remove(); // пустая строка — подписи над заголовком не будет
    }

    document.getElementById("letter-title").textContent = C.title;

    var body = document.getElementById("letter-body");
    C.paragraphs.forEach(function (text) {
      var p = document.createElement("p");
      p.textContent = text;
      body.appendChild(p);
    });

    document.getElementById("letter-sign").textContent = C.signature;
  }

  /* ═══════════════ Письмо: сердечки по бумаге ═══════════════ */

  // Позиции фиксированные — для аккуратной вёрстки (как в React-версии).
  var CARD_HEARTS = [
    { left: "5.5%", top: "13%", size: 14, kind: "red", dur: 4.8, delay: 0.2, tilt: -16 },
    { left: "92%", top: "17%", size: 11, kind: "ice", dur: 5.6, delay: 0.9, tilt: 12 },
    { left: "9%", top: "83%", size: 12, kind: "teal", dur: 5.1, delay: 0.5, tilt: 10 },
    { left: "89%", top: "78%", size: 15, kind: "red", dur: 6.2, delay: 1.2, tilt: -10 },
    { left: "46%", top: "5%", size: 10, kind: "red", dur: 5.4, delay: 1.5, tilt: 8 },
    { left: "28%", top: "92%", size: 9, kind: "ice", dur: 6.0, delay: 0.7, tilt: -6 },
  ];

  var HEART_PATH = "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

  function makeHeartSvg(className) {
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "currentColor");
    svg.setAttribute("class", className);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var path = document.createElementNS(NS, "path");
    path.setAttribute("d", HEART_PATH);
    svg.appendChild(path);
    return svg;
  }

  function initLetterHearts() {
    var letter = document.getElementById("letter");
    CARD_HEARTS.forEach(function (h) {
      var svg = makeHeartSvg("letter-heart letter-heart--" + h.kind);
      svg.style.left = h.left;
      svg.style.top = h.top;
      svg.style.width = h.size + "px";
      svg.style.height = h.size + "px";
      svg.style.setProperty("--d", h.dur + "s");
      svg.style.setProperty("--delay", h.delay + "s");
      svg.style.setProperty("--tilt", h.tilt + "deg");
      letter.appendChild(svg);
    });
  }

  /* ═══════════════ Фон: частицы и сердечки ═══════════════ */

  var KINDS = ["ice", "red", "mist"];

  function buildParticles() {
    var list = [];

    // светящиеся точки-боке
    for (var i = 0; i < C.backdropBokehCount; i++) {
      list.push({
        heart: false,
        kind: KINDS[Math.floor(Math.random() * KINDS.length)],
        left: rnd(2, 98),
        size: rnd(4, 13),
        dur: rnd(26, 58),
        delay: -rnd(0, 58),
        sway: rnd(8, 26),
        swayDur: rnd(3.5, 7),
        peak: rnd(0.25, 0.55),
        blur: rnd(1, 2.6),
      });
    }

    // миниатюрные сердечки, плывущие вверх
    for (var j = 0; j < C.backdropHeartCount; j++) {
      list.push({
        heart: true,
        kind: KINDS[Math.floor(Math.random() * KINDS.length)],
        left: rnd(3, 97),
        size: rnd(11, 21),
        dur: rnd(30, 64),
        delay: -rnd(0, 64),
        sway: rnd(10, 30),
        swayDur: rnd(4, 8),
        peak: rnd(0.16, 0.38),
        blur: 0,
      });
    }

    return list;
  }

  function initBackdrop() {
    var box = document.getElementById("bokeh");
    var frag = document.createDocumentFragment();

    buildParticles().forEach(function (p) {
      var rise = document.createElement("span");
      rise.className = "rise rise--" + p.kind;
      rise.style.left = p.left.toFixed(1) + "%";
      rise.style.setProperty("--peak", p.peak.toFixed(2));
      rise.style.animationDuration = p.dur.toFixed(1) + "s";
      rise.style.animationDelay = p.delay.toFixed(1) + "s";

      var sway = document.createElement("span");
      sway.className = "rise__sway";
      sway.style.setProperty("--sway", p.sway.toFixed(0) + "px");
      sway.style.animationDuration = p.swayDur.toFixed(1) + "s";

      if (p.heart) {
        var heart = makeHeartSvg("rise__heart");
        heart.style.width = p.size.toFixed(0) + "px";
        heart.style.height = p.size.toFixed(0) + "px";
        sway.appendChild(heart);
      } else {
        var dot = document.createElement("span");
        dot.className = "rise__dot";
        dot.style.width = p.size.toFixed(0) + "px";
        dot.style.height = p.size.toFixed(0) + "px";
        dot.style.filter = "blur(" + p.blur.toFixed(1) + "px)";
        sway.appendChild(dot);
      }

      rise.appendChild(sway);
      frag.appendChild(rise);
    });

    box.appendChild(frag);
  }

  /* ═══════════════ Ленточки с комплиментами ═══════════════ */

  /* Хронометраж жизни ленты, сек: разворот -> удержание -> растворение */
  var IN = 0.9;
  var HOLD = 2.35;
  var OUT = 0.8;
  var LIFE_MS = (IN + HOLD + OUT) * 1000;

  /* Зазор между лентами (в % экрана), чтобы надписи не слипались */
  var CLEARANCE_X = 4;
  var CLEARANCE_Y = 3.5;
  /* Лента может подойти к письму почти вплотную — без налезания */
  var LETTER_CLEARANCE_X = 1.5;
  var LETTER_CLEARANCE_Y = 1.5;

  function intersects(a, b, cx, cy) {
    if (cx === undefined) cx = CLEARANCE_X;
    if (cy === undefined) cy = CLEARANCE_Y;
    return (
      Math.abs(a.x - b.x) * 2 < a.w + b.w + cx * 2 &&
      Math.abs(a.y - b.y) * 2 < a.h + b.h + cy * 2
    );
  }

  /** Зона письма в процентах вьюпорта (ленты живут в fixed-слое).
   *
   *  Считаем по ФИНАЛЬНОЙ позиции блока: письмо всегда есть в вёрстке,
   *  но до появления у него transform (сдвиг и масштаб), из-за которого
   *  getBoundingClientRect даёт смещённый прямоугольник. Поэтому берём
   *  размеры без трансформаций (offsetWidth/offsetHeight) и центр
   *  сцены — письмо центрировано в ней. Так зона одинакова и для
   *  начального состояния (блока ещё не видно), и после его появления. */
  function letterZone() {
    var stage = document.querySelector(".greeting-stage");
    var el = document.getElementById("letter");
    if (!stage || !el) return null;
    var w = el.offsetWidth;
    var h = el.offsetHeight;
    if (w === 0 || h === 0) return null;
    var s = stage.getBoundingClientRect();
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var left = s.left + s.width / 2 - w / 2;
    var top = s.top + s.height / 2 - h / 2;
    return {
      x: ((left + w / 2) / vw) * 100,
      y: ((top + h / 2) / vh) * 100,
      w: (w / vw) * 100 + 1,
      h: Math.min((h / vh) * 100 + 1, 150),
    };
  }

  /** Зона временной панели тем, чтобы ленты не забегали под неё. */
  function panelZone() {
    var el = document.querySelector(".theme-panel");
    if (!el) return null;
    var r = el.getBoundingClientRect();
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    if (r.width === 0 || r.height === 0) return null;
    return {
      x: ((r.left + r.width / 2) / vw) * 100,
      y: ((r.top + r.height / 2) / vh) * 100,
      w: (r.width / vw) * 100 + 2,
      h: (r.height / vh) * 100 + 2,
    };
  }

  /** Ищет место, где лента не пересечётся ни с одной активной лентой
   *  и НЕ попадёт в зону письма — всегда, включая начальное состояние,
   *  когда письма ещё не видно. Места нет — лента просто пропускается. */
  function findSpot(text, active) {
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    // примерная ширина: шрифт Caveat ~ 13px/символ + поля + хвостики
    var wPct = Math.min((Math.max(text.length * 13 + 114, 150) / vw) * 100, 62);
    var hPct = Math.min((66 / vh) * 100, 11);

    var padX = wPct / 2 + 2.5;
    var padY = hPct / 2 + 4;

    var topMin = Math.max(padY, 7);
    var topMax = Math.min(100 - padY, 93);
    if (topMax <= topMin) return null;

    var letter = letterZone();
    if (!letter) return null; // письмо ещё не в DOM — не рискуем

    var zones = active.map(function (r) {
      return { x: r.left, y: r.top, w: r.wPct, h: r.hPct };
    });
    var panel = panelZone();
    if (panel) zones.push(panel);

    for (var attempt = 0; attempt < 50; attempt++) {
      var left = rnd(padX, 100 - padX);
      var top = rnd(topMin, topMax);
      var candidate = { x: left, y: top, w: wPct, h: hPct };
      var hitsLetter = intersects(candidate, letter, LETTER_CLEARANCE_X, LETTER_CLEARANCE_Y);
      var hitsOther = zones.some(function (z) {
        return intersects(candidate, z);
      });
      if (!hitsLetter && !hitsOther) {
        return { left: left, top: top, wPct: wPct, hPct: hPct };
      }
    }
    return null; // тесно — пропускаем такт, появится позже
  }

  /* «Мешок» с комплиментами: слова не повторяются, пока не закончатся */
  var bag = [];

  function nextText() {
    if (bag.length === 0) {
      bag = window.COMPLIMENTS.slice();
      // перемешиваем «мешок», чтобы комплименты не повторялись подряд
      for (var i = bag.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = bag[i];
        bag[i] = bag[j];
        bag[j] = t;
      }
    }
    return bag.pop();
  }

  var ribbonsBox;
  var activeRibbons = [];
  var ribbonId = 0;

  function spawnRibbon() {
    var text = nextText();
    var style = Math.random() < 0.55 ? "crimson" : "ice";
    var spot = findSpot(text, activeRibbons);
    if (!spot) return;

    ribbonId++;
    var item = {
      id: ribbonId,
      text: text,
      style: style,
      tilt: rnd(-5, 5),
      left: spot.left,
      top: spot.top,
      wPct: spot.wPct,
      hPct: spot.hPct,
    };
    activeRibbons.push(item);

    var el = document.createElement("span");
    el.className = "ribbon";
    el.dataset.id = String(item.id);
    el.style.left = item.left.toFixed(2) + "%";
    el.style.top = item.top.toFixed(2) + "%";
    el.style.transform =
      "translate(-50%, -50%) rotate(" + item.tilt.toFixed(1) + "deg)";

    var clip = document.createElement("span");
    clip.className = "ribbon__clip";
    clip.style.animationDuration = IN + "s, " + OUT + "s";
    clip.style.animationDelay = "0s, " + (IN + HOLD).toFixed(2) + "s";

    var strip = document.createElement("span");
    strip.className = "ribbon__strip ribbon__strip--" + item.style;
    strip.style.animationDuration = (IN + HOLD + OUT).toFixed(2) + "s";

    var shine = document.createElement("i");
    shine.className = "ribbon__shine";

    var label = document.createElement("span");
    label.className = "ribbon__text";
    label.style.animationDelay = (IN * 0.5).toFixed(2) + "s";
    label.textContent = item.text;

    strip.appendChild(shine);
    strip.appendChild(label);
    clip.appendChild(strip);
    el.appendChild(clip);
    ribbonsBox.appendChild(el);

    window.setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      activeRibbons = activeRibbons.filter(function (r) {
        return r.id !== item.id;
      });
    }, LIFE_MS + 150);
  }

  function initRibbons() {
    ribbonsBox = document.getElementById("ribbons");
    var timer = 0;

    var tick = function () {
      spawnRibbon();
      timer = window.setTimeout(tick, rnd(C.ribbonMinMs, C.ribbonMaxMs));
    };
    window.setTimeout(tick, C.ribbonFirstMs);

    // Экономим память: не оставляем висячие таймеры при выгрузке страницы
    window.addEventListener("beforeunload", function () {
      window.clearTimeout(timer);
    });
  }

  /* ═══════════════ Появление письма ═══════════════ */

  function initLetterTimer() {
    var letter = document.getElementById("letter");

    var timer = window.setTimeout(function () {
      letter.classList.add("letter--visible");
    }, C.letterDelayMs);

    // Экономим память: не оставляем висячие таймеры при выгрузке страницы
    window.addEventListener("beforeunload", function () {
      window.clearTimeout(timer);
    });
  }

  /* ═══════════════ Запуск ═══════════════ */

  initLetterTexts();
  initLetterHearts();
  initBackdrop();
  initRibbons();
  initLetterTimer();
})();
