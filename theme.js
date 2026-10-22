/* dark only: the toggle was removed */

/* count-up numbers + copy email */
document.addEventListener("DOMContentLoaded", function () {
  var nums = document.querySelectorAll("[data-count]");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function run(el) {
    var end = parseInt(el.getAttribute("data-count"), 10), t0 = null;
    if (reduce) { el.textContent = end; return; }
    function step(ts) { if (!t0) t0 = ts; var p = Math.min((ts - t0) / 900, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }); }, { threshold: .4 });
    nums.forEach(function (n) { io.observe(n); });
  } else nums.forEach(run);

  var copy = document.querySelector("[data-copy]");
  if (copy) copy.addEventListener("click", function () {
    var v = copy.getAttribute("data-copy"), out = document.querySelector(".copied");
    try { navigator.clipboard.writeText(v).then(function () { if (out) out.textContent = "Email copied: " + v; }); } catch (e) { if (out) out.textContent = v; }
  });
});

/* hero: signals → problems → prioritise → memo */
document.addEventListener("DOMContentLoaded", function () {
  var box = document.querySelector(".pmviz");
  if (!box) return;
  var canvas = box.querySelector(".pv-canvas"), tabs = box.querySelectorAll("[data-go]");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var S = [
    ["A", "I started a Shopify store but never finished it.", "Shopify store, never finished"],
    ["B", "I lose track of orders between Instagram and WhatsApp.", "Loses orders across chats"],
    ["C", "I keep opening my bank app to check if the money came.", "Keeps checking the bank app"],
    ["A", "I want to validate my idea before building everything.", "Wants to validate first"],
    ["B", "Customers ask the price of the same product again and again.", "Same price question, again"],
    ["C", "Some customers send fake payment screenshots.", "Fake payment screenshots"],
    ["A", "I always move from Instagram to WhatsApp to build trust.", "Moves to WhatsApp for trust"],
    ["B", "I copy every order into a notebook at night.", "Copies orders into a notebook"],
    ["C", "I ask for a 50% advance before confirming an order.", "Asks 50% advance first"]
  ];
  var float = [[23,11],[73,16],[36,31],[78,38],[22,53],[64,59],[30,75],[77,79],[50,90]];
  var rot = [-2, 1.5, -1, 2, -1.5, 1, 2, -2, 1];
  var colX = { A: 17.5, B: 50, C: 82.5 }, rowY = [38, 56, 74];
  var els = S.map(function (s, i) {
    var d = document.createElement("div");
    d.className = "pv-el st"; d.setAttribute("data-g", s[0]);
    d.innerHTML = '<span class="long">"' + s[1] + '"</span><span class="short">"' + s[2] + '"</span>';
    d.style.setProperty("--d", (-i * 0.4) + "s");
    canvas.appendChild(d); return d;
  });
  function put(el, x, y, o, sc, r) { el.style.left = x + "%"; el.style.top = y + "%"; el.style.opacity = o; el.style.transform = "translate(-50%,-50%) rotate(" + (r || 0) + "deg) scale(" + (sc == null ? 1 : sc) + ")"; }
  function rank(i) { var g = S[i][0], n = 0; for (var j = 0; j < i; j++) if (S[j][0] === g) n++; return n; }
  var sub = null;
  var stages = {
    1: function () {
      box.setAttribute("data-sub", "float");
      els.forEach(function (e, i) { put(e, float[i][0], float[i][1], 1, 1, rot[i]); });
      clearTimeout(sub);
      sub = setTimeout(function () {
        if (+box.getAttribute("data-stage") !== 1) return;
        box.setAttribute("data-sub", "cluster");
        els.forEach(function (e, i) { put(e, colX[S[i][0]], rowY[rank(i)], 1, 1, 0); });
      }, reduce ? 0 : 1200);
    },
    2: function () { box.removeAttribute("data-sub"); els.forEach(function (e, i) { put(e, colX[S[i][0]], 50, 0, .55, 0); }); },
    3: function () { box.removeAttribute("data-sub"); els.forEach(function (e, i) { put(e, colX[S[i][0]], 50, 0, .5, 0); }); },
    4: function () { box.removeAttribute("data-sub"); els.forEach(function (e, i) { put(e, 50, 50, 0, .4, 0); }); }
  };
  var durs = { 1: 3800, 2: 2400, 3: 3400, 4: 4400 };
  var stage = 1, timer = null;
  function show(n) {
    stage = n; box.setAttribute("data-stage", n); stages[n]();
    tabs.forEach(function (t) {
      var g = +t.getAttribute("data-go");
      t.classList.toggle("done", g < n); t.classList.remove("on");
      if (g === n) { t.style.setProperty("--dur", durs[n] + "ms"); void t.offsetWidth; t.classList.add("on"); }
      t.setAttribute("aria-selected", g === n);
    });
  }
  function schedule() {
    clearTimeout(timer); if (reduce) return;
    timer = setTimeout(function tick() {
      if (box.classList.contains("paused")) { timer = setTimeout(tick, 400); return; }
      show(stage % 4 + 1); schedule();
    }, durs[stage]);
  }
  tabs.forEach(function (t) { t.addEventListener("click", function () { show(+t.getAttribute("data-go")); schedule(); }); });
  box.addEventListener("mouseenter", function () { box.classList.add("paused"); });
  box.addEventListener("mouseleave", function () { box.classList.remove("paused"); });
  if (reduce) show(4); else { show(1); schedule(); }
});

/* section 2: connected story, stacked layers */
document.addEventListener("DOMContentLoaded", function () {
  var sec = document.querySelector(".s2");
  if (!sec) return;
  var hi = sec.querySelector(".l-hi"), stack = sec.querySelector(".s2-stack");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function desktop() { return window.matchMedia("(min-width: 960px)").matches; }
  function type(el, speed, done) {
    var full = el.getAttribute("data-text"), i = 0; el.classList.remove("done"); el.textContent = "";
    (function step() { el.textContent = full.slice(0, ++i); if (i < full.length) setTimeout(step, speed); else { el.classList.add("done"); if (done) done(); } })();
  }
  var counted = false, closed = false;
  function countUp() {
    if (counted) return; counted = true;
    sec.querySelectorAll(".s2-stats b").forEach(function (b) {
      var end = +b.getAttribute("data-to"), suf = b.getAttribute("data-suffix") || "", t0 = null;
      function f(ts) { if (!t0) t0 = ts; var p = Math.min((ts - t0) / 700, 1); b.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suf : ""); if (p < 1) requestAnimationFrame(f); }
      requestAnimationFrame(f);
    });
  }
  var closeTimers = [], closeDone = false;
  function closing() {
    if (closed) return; closed = true; closeDone = false;
    var g = sec.querySelector(".g2"); if (!g) return;
    var l1 = g.querySelector(".g2-typed"), l2 = g.querySelector(".g2-acc");
    var A = "Now I'm looking for a team where I can do it again:", W = ["listen,", "decide,", "build,", "learn."];
    g.classList.remove("complete");
    l2.innerHTML = W.map(function (w) { return '<span class="g2-word">' + w + '</span>'; }).join(" ");
    var words = l2.querySelectorAll(".g2-word");
    if (reduce) { l1.textContent = A; words.forEach(function (w) { w.classList.add("in"); }); g.classList.add("complete"); closeDone = true; return; }
    l1.textContent = "";
    var i = 0;
    (function s() {
      l1.textContent = A.slice(0, ++i);
      if (i < A.length) { closeTimers.push(setTimeout(s, 16)); return; }
      words.forEach(function (w, k) { closeTimers.push(setTimeout(function () { w.classList.add("in"); }, 160 + k * 170)); });
      closeTimers.push(setTimeout(function () { g.classList.add("complete"); closeDone = true; onScroll(); }, 160 + words.length * 170 + 250));
    })();
  }
  function clearClosing() {
    closeTimers.forEach(clearTimeout); closeTimers = []; closed = false; closeDone = false;
    var g = sec.querySelector(".g2"); if (!g) return;
    g.classList.remove("complete"); g.querySelector(".g2-typed").textContent = ""; g.querySelector(".g2-acc").innerHTML = "";
  }
  function centre() {
    if (!desktop()) return;
    var S = 1.45, h = hi.offsetHeight, top = hi.offsetTop, vh = window.innerHeight;
    var cs = getComputedStyle(stack), innerW = stack.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    hi.style.setProperty("--hs", S); hi.style.setProperty("--hx", ((innerW - hi.offsetWidth * S) / 2) + "px");
    hi.style.setProperty("--hy", ((vh - h * S) / 2 - top) + "px");
  }
  var stage = -1, max = 0, done = false;
  function set(n) { if (n === stage) return; stage = n; sec.setAttribute("data-stage", n); if (n >= 1) countUp(); if (n >= 3 && desktop()) closing(); }
  function collapse() {
    var before = sec.offsetHeight, y0 = window.scrollY;
    sec.classList.add("done"); done = true;
    var diff = before - sec.offsetHeight, y1 = window.scrollY;
    if (Math.abs((y0 - y1) - diff) > 2) window.scrollTo({ top: y0 - diff, behavior: "instant" });
  }
  function reset() {
    sec.classList.add("instant"); sec.classList.remove("done"); done = false; max = 0; hi.style.setProperty("--t", 0);
    counted = false; sec.classList.remove("brush"); clearClosing();
    set(0);
    requestAnimationFrame(function () { requestAnimationFrame(function () { sec.classList.remove("instant"); }); });
  }
  function onScroll() {
    if (!desktop()) { set(3); return; }
    var r = sec.getBoundingClientRect(), vh = window.innerHeight;
    if (done) {
      // back near the hero: quietly restore the story for the next pass
      if (r.top > vh * .6 && !window.__navScrolling) reset();
      return;
    }
    var total = sec.offsetHeight - vh, p = Math.min(Math.max(-r.top / total, 0), 1);
    // 1st scroll: greeting glides to the top-left; 2nd: graph; 3rd: cards; 4th: closing line; 5th: leave
    var tt = Math.min(p / .16, 1); hi.style.setProperty("--t", (max >= 1 ? 1 : tt).toFixed(3));
    var n = p < .16 ? 0 : p < .34 ? 1 : p < .52 ? 2 : 3;
    max = Math.max(max, n);
    set(Math.max(n, max));            // never un-stack while scrolling back up
    if (max === 3 && closeDone && r.bottom <= 0 && !window.__navScrolling) collapse();
    if (r.top > vh * .6 && max > 0 && !window.__navScrolling) reset();
  }
  centre();
  window.addEventListener("resize", function () { centre(); onScroll(); });
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  var typed = false;
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { if (!typed && es[0].isIntersecting) { typed = true; io.disconnect(); type(sec.querySelector(".s2-type"), 55); } }, { threshold: .3 });
    io.observe(hi);
  }
  // phones: play the closing line when it comes into view
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (es) { if (es[0].isIntersecting && !desktop()) { closing(); } }, { threshold: .6 });
    cio.observe(sec.querySelector(".l-close"));
  }
  // lesson cards jump to that company in the journey
  sec.querySelectorAll("[data-jump]").forEach(function (a) {
    a.addEventListener("click", function (e) { if (window.__jumpCompany) { e.preventDefault(); window.__jumpCompany(+a.getAttribute("data-jump")); } });
  });
});

/* section 3: one scroll gesture = one company (SocialAddress → Nurdd → QikD). The section snaps to fill the screen. */
document.addEventListener("DOMContentLoaded", function () {
  var sec = document.querySelector(".s3");
  if (!sec) return;
  var cos = sec.querySelectorAll(".co"), tabs = sec.querySelectorAll(".s3-tabs [data-go]"), N = cos.length, cur = 0;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var snapping = false, locked = false, lockStart = 0, lastWheel = 0, acc = 0;
  function desktop() { return window.matchMedia("(min-width: 960px)").matches && !reduce; }
  function set(n) {
    cur = Math.max(0, Math.min(N - 1, n));
    cos.forEach(function (c, i) { c.classList.toggle("on", i === cur); });
    tabs.forEach(function (t, i) { t.classList.toggle("on", i === cur); });
    sec.setAttribute("data-co", cur);
  }
  function lock() { locked = true; lockStart = Date.now(); }
  function align() {
    snapping = true; lock();
    var target = sec.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: target, behavior: "smooth" });
    var t0 = Date.now();
    (function wait() {
      if (Math.abs(sec.getBoundingClientRect().top) < 2 || Date.now() - t0 > 1400) { window.scrollTo({ top: target, behavior: "instant" }); snapping = false; locked = true; lockStart = Date.now() - 450; return; }
      setTimeout(wait, 30);
    })();
  }
  function handle(dir, e) {
    var t = sec.getBoundingClientRect().top, vh = window.innerHeight, now = Date.now();
    if (snapping) { lastWheel = now; e.preventDefault(); return; }
    if (locked) {                                             // swallow the rest of the gesture that caused the last step
      if (now - lastWheel > 220 && now - lockStart > 650) locked = false;
      else { lastWheel = now; e.preventDefault(); return; }
    }
    lastWheel = now;
    if (Math.abs(t) >= 4) {
      if (dir > 0 && t > 4 && t < vh * .9) { e.preventDefault(); set(0); align(); return; }       // arriving from above
      if (dir < 0 && t < -4 && t > -vh * .9) { e.preventDefault(); set(N - 1); align(); return; } // arriving from below
      return;
    }
    if ((dir > 0 && cur === N - 1) || (dir < 0 && cur === 0)) return;   // leave the section normally
    e.preventDefault();
    set(cur + dir); lock();
  }
  window.addEventListener("wheel", function (e) {
    if (!desktop() || window.__navScrolling) return;
    if (Math.abs(e.deltaY) < 1) return;
    handle(e.deltaY > 0 ? 1 : -1, e);
  }, { passive: false });
  window.addEventListener("keydown", function (e) {
    if (!desktop()) return;
    var k = e.key, dir = (k === "ArrowDown" || k === "PageDown" || k === " ") ? 1 : (k === "ArrowUp" || k === "PageUp") ? -1 : 0;
    if (!dir || Math.abs(sec.getBoundingClientRect().top) >= 4) return;
    if ((dir > 0 && cur === N - 1) || (dir < 0 && cur === 0)) return;
    e.preventDefault(); set(cur + dir);
  });
  function jump(ci) { set(ci); if (desktop()) align(); else cos[ci].scrollIntoView({ behavior: "smooth" }); }
  window.__jumpCompany = jump;
  window.__setCompany = set;
  tabs.forEach(function (t) { t.addEventListener("click", function () { jump(+t.getAttribute("data-go")); }); });
  function layout() { if (!desktop()) cos.forEach(function (c) { c.classList.add("on"); }); else set(cur); }
  window.addEventListener("resize", layout);
  layout();
});

/* certifications: 3D gradient carousel */
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".gc").forEach(function (root) {
  var cards = [].slice.call(root.querySelectorAll(".gc-card")), N = cards.length, bg = root.querySelector(".gc-bg"), dotsBox = root.querySelector(".gc-dots");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MAXROT = 14, DEPTH = 140, MINSCALE = .74, GAP = 15, FRICTION = .92;
  var pos = Math.floor((N - 1) / 2), vel = 0, target = null, dragging = false, lastX = 0, lastT = 0, raf = null, active = -1, moved = 0;
  for (var d = 0; d < N; d++) dotsBox.appendChild(document.createElement("i"));
  var dots = dotsBox.querySelectorAll("i");
  function cardW() { return cards[0].offsetWidth; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function render() {
    var w = cardW() + GAP;
    cards.forEach(function (c, i) {
      var o = i - pos, a = Math.abs(o);
      var rot = clamp(-o * MAXROT, -MAXROT, MAXROT), z = -Math.min(a, 2.5) * DEPTH, s = Math.max(MINSCALE, 1 - a * .07);
      var spread = Math.min(w * .78, (root.clientWidth - cardW()) / 4.2);
      c.style.transform = "translateX(" + (o * spread) + "px) translateZ(" + z + "px) rotateY(" + rot + "deg) scale(" + Math.max(MINSCALE, 1 - a * .12) + ")";
      c.style.opacity = a > 2.6 ? 0 : 1 - Math.max(0, a - 1) * .18;
      c.style.filter = "brightness(" + (1 - Math.min(a, 2) * .12) + ")";
      c.style.zIndex = 100 - Math.round(a * 10);
    });
    var n = clamp(Math.round(pos), 0, N - 1);
    if (n !== active) {
      active = n; dots.forEach(function (x, i) { x.classList.toggle("on", i === n); });
      bg.style.setProperty("--g1", cards[n].getAttribute("data-c1")); bg.style.setProperty("--g2", cards[n].getAttribute("data-c2"));
    }
  }
  function tick() {
    if (!dragging) {
      if (target !== null) { pos += (target - pos) * (reduce ? 1 : .14); if (Math.abs(target - pos) < .002) { pos = target; target = null; } }
      else if (Math.abs(vel) > .0005) { pos += vel; vel *= FRICTION; if (pos < -.3 || pos > N - .7) vel *= .5; }
      else { var snap = clamp(Math.round(pos), 0, N - 1); if (Math.abs(snap - pos) > .002) target = snap; }
    }
    pos = clamp(pos, -.4, N - .6);
    render();
    if (dragging || target !== null || Math.abs(vel) > .0005) raf = requestAnimationFrame(tick); else raf = null;
  }
  function go() { if (!raf) raf = requestAnimationFrame(tick); }
  function to(n) { vel = 0; target = clamp(n, 0, N - 1); go(); }
  root.addEventListener("pointerdown", function (e) {
    if (e.target.closest(".gc-dots, .gc-arrow")) return;
    dragging = true; moved = 0; root.classList.add("dragging"); lastX = e.clientX; lastT = performance.now(); vel = 0; target = null;
    root.setPointerCapture(e.pointerId); go();
  });
  root.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var dx = e.clientX - lastX, now = performance.now(), step = -dx / (cardW() + GAP); moved += Math.abs(dx);
    pos += step; vel = step * (16 / Math.max(now - lastT, 1)); lastX = e.clientX; lastT = now;
  });
  function end() { if (!dragging) return; dragging = false; root.classList.remove("dragging"); vel = clamp(vel, -.25, .25); go(); }
  root.addEventListener("pointerup", end); root.addEventListener("pointercancel", end);
  root.addEventListener("wheel", function (e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;          // only horizontal swipes; vertical scroll stays with the page
    e.preventDefault(); target = null; vel += e.deltaX * .0008 * .8; go();
  }, { passive: false });
  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); to(Math.round(pos) + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); to(Math.round(pos) - 1); }
  });
  var prev = root.querySelector(".gc-prev"), next = root.querySelector(".gc-next");
  if (prev) { prev.addEventListener("pointerdown", function (e) { e.stopPropagation(); }); prev.addEventListener("click", function (e) { e.stopPropagation(); to(Math.round(pos) - 1); }); }
  if (next) { next.addEventListener("pointerdown", function (e) { e.stopPropagation(); }); next.addEventListener("click", function (e) { e.stopPropagation(); to(Math.round(pos) + 1); }); }
  dots.forEach(function (d, i) { d.setAttribute("role", "tab"); d.setAttribute("aria-label", "Certificate " + (i + 1)); d.addEventListener("click", function (e) { e.stopPropagation(); to(i); }); });
  cards.forEach(function (c) {
    c.setAttribute("tabindex", "0");
    function open() {
      var i = cards.indexOf(c);
      if (Math.round(pos) !== i) { to(i); return; }                       // bring it to the front first
      var u = c.getAttribute("data-href"), img = c.querySelector("img"), v = document.querySelector(".cert-view");
      if (!v || !img) { if (u) window.open(u, "_blank", "noopener"); return; }
      v.querySelector("img").src = img.src; v.querySelector("img").alt = img.alt;
      var cap = c.querySelector(".gc-cap b"); v.querySelector("figcaption b").textContent = cap ? cap.textContent : "";
      v.querySelector("figcaption a").href = u || "#";
      v.hidden = false; requestAnimationFrame(function () { v.classList.add("open"); });
      document.body.classList.add("mc-lock"); v.querySelector(".mc-close").focus({ preventScroll: true });
    }
    c.addEventListener("click", function () { if (moved < 6) open(); });
    c.addEventListener("keydown", function (e) { if (e.key === "Enter") open(); });
  });
  window.addEventListener("resize", render);
  render();
  // the middle (third) certificate returns to the centre whenever the carousel scrolls into or out of view
  var home = Math.floor((N - 1) / 2);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { es.forEach(function () { if (!dragging && !document.querySelector(".cert-view.open")) to(home); }); }, { threshold: [0, .5] }).observe(root);
  }
  });
});

/* (page tint removed: hero is now a solid olive block with a wavy edge) */

/* carousel: mark the front card (shows caption); project card "Open live" without nesting links */
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".gc").forEach(function (root) {
    var mark = function () { var cs = root.querySelectorAll(".gc-card"); var best = null, bz = -1; cs.forEach(function (c) { var z = +c.style.zIndex || 0; if (z > bz) { bz = z; best = c; } c.classList.remove("front"); }); if (best) best.classList.add("front"); };
    new MutationObserver(mark).observe(root, { subtree: true, attributes: true, attributeFilter: ["style"] });
    mark();
  });
  document.querySelectorAll(".ip-live").forEach(function (s) {
    s.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); window.open(s.getAttribute("data-live"), "_blank", "noopener"); });
  });
});

/* LinkedIn section: reveal when it scrolls into view */
document.addEventListener("DOMContentLoaded", function () {
  var s = document.querySelector(".li"); if (!s) return;
  if (!("IntersectionObserver" in window)) { s.classList.add("in"); return; }
  var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { s.classList.add("in"); io.disconnect(); } }, { threshold: .18 });
  io.observe(s);
});

/* independent projects: parallax cards (layered in depth, shift with the cursor, click to bring forward) */
document.addEventListener("DOMContentLoaded", function () {
  var stage = document.querySelector(".pxc"); if (!stage) return;
  var cards = [].slice.call(stage.querySelectorAll(".pxc-card")), N = cards.length;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SLOTS = [ { x: -6, y: 8, z: 0, r: -2 }, { x: 14, y: -10, z: -220, r: 3 }, { x: -18, y: -18, z: -420, r: -4 }, { x: 20, y: 14, z: -600, r: 2 } ];
  var order = cards.map(function (_, i) { return i; }), mx = 0, my = 0, SENS = 3;
  function place() {
    order.forEach(function (ci, slot) {
      var s = SLOTS[slot % SLOTS.length], c = cards[ci], depth = 1 + slot * .6;
      var px = reduce ? 0 : mx * SENS * depth * 2.2, py = reduce ? 0 : my * SENS * depth * 1.6;
      c.style.transform = "translate(-50%,-50%) translate3d(calc(" + s.x + "% + " + px + "px), calc(" + s.y + "% + " + py + "px), " + s.z + "px) rotate(" + s.r + "deg) rotateY(" + (mx * 4) + "deg) rotateX(" + (-my * 4) + "deg)";
      c.style.zIndex = 50 - slot;
      c.style.filter = slot ? "blur(" + (slot * 1.2) + "px) saturate(" + (1 - slot * .15) + ")" : "none";
      c.style.opacity = 1 - slot * .12;
      c.setAttribute("aria-pressed", slot === 0);
    });
  }
  stage.addEventListener("pointermove", function (e) {
    var r = stage.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5;
    cards.forEach(function (c) { c.style.transitionDuration = ".5s, 1.2s, 1.2s"; });
    place();
  });
  stage.addEventListener("pointerleave", function () { mx = my = 0; place(); });
  cards.forEach(function (c, i) {
    c.addEventListener("click", function () {
      var at = order.indexOf(i); if (at <= 0) return;
      cards.forEach(function (x) { x.style.transitionDuration = ""; });
      order = order.slice(at).concat(order.slice(0, at)); place();
    });
  });
  place();
});

/* certificate viewer: close, and keep pop-ups at the top layer of the page */
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".mc-modal, .cert-view").forEach(function (m) { document.body.appendChild(m); });
  var v = document.querySelector(".cert-view"); if (!v) return;
  var shut = function () { if (v.hidden) return; v.classList.remove("open"); document.body.classList.remove("mc-lock"); setTimeout(function () { v.hidden = true; }, 300); };
  v.querySelector(".cert-back").addEventListener("click", shut); v.querySelector(".mc-close").addEventListener("click", shut);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") shut(); });
});

/* header: smooth scroll to sections, sliding hover pill, glass on scroll */
document.addEventListener("DOMContentLoaded", function () {
  var nav = document.querySelector(".nav"), links = document.querySelector(".nav-links");
  if (nav) { var f = function () { nav.classList.toggle("scrolled", window.scrollY > 10); }; window.addEventListener("scroll", f, { passive: true }); f(); }
  if (links) {
    var pill = document.createElement("span"); pill.className = "nav-pill"; pill.setAttribute("aria-hidden", "true"); links.prepend(pill);
    links.querySelectorAll("a:not(.talk)").forEach(function (a) {
      a.addEventListener("mouseenter", function () { pill.style.width = a.offsetWidth + "px"; pill.style.transform = "translateX(" + a.offsetLeft + "px)"; pill.classList.add("on"); });
    });
    links.addEventListener("mouseleave", function () { pill.classList.remove("on"); });
  }
  // the pinned sections change height as you pass them, so hold them still until the scroll lands
  function go(el) {
    window.__navScrolling = true;
    var y = el.getBoundingClientRect().top + window.scrollY - (el.id === "intro" || el.id === "journey" ? 0 : 70);
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    var last = -1, still = 0;
    (function watch() {
      if (Math.abs(window.scrollY - last) < 1) still++; else still = 0;
      last = window.scrollY;
      if (still < 10) requestAnimationFrame(watch);
      else { window.__navScrolling = false; window.dispatchEvent(new Event("scroll")); }
    })();
  }
  document.querySelectorAll('.nav a[href^="#"], .nav a[href^="/#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").split("#")[1], el = id && document.getElementById(id);
      if (!el) return;                      // case pages: let the browser go to the home page
      e.preventDefault(); go(el); history.replaceState(null, "", "#" + id);
    });
  });
});

/* Shop case study: section cards slide in and out from alternating sides as you scroll */
document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".fc-deck")) return;          // the Shop page uses the flashcard deck instead
  var cards = [].slice.call(document.querySelectorAll(".cs-story .st-sec.big")); if (!cards.length) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var ticking = false;
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function update() {
    ticking = false;
    var vh = window.innerHeight, dist = Math.min(window.innerWidth * .18, 220);
    cards.forEach(function (c, i) {
      var dir = i % 2 === 0 ? 1 : -1, r = c.getBoundingClientRect();
      var enter = ease(clamp((vh - r.top) / (vh * .45)));
      var exit = ease(clamp((vh * .28 - r.bottom) / (vh * .5)));
      var x = (1 - enter) * -dir * dist + exit * dir * dist * 1.3;
      c.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0) rotate(" + (exit * dir * 2.5 - (1 - enter) * dir * 1.5).toFixed(2) + "deg) scale(" + (1 - exit * .05).toFixed(3) + ")";
      c.style.opacity = (Math.min(enter * 1.15, 1) * (1 - exit * .9)).toFixed(3);
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", onScroll); update();
});

/* Shop case study: Riya walks through the merchant journey, step by step, while it's on screen */
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".mj").forEach(function (mj) {
    var nodes = [].slice.call(mj.querySelectorAll(".mj-node")), riya = mj.querySelector(".mj-riya"), fill = mj.querySelector(".mj-fill"), cap = mj.querySelector(".mj-cap");
    var caps = (mj.getAttribute("data-caps") || "").split("|"), i = -1, timer = null, track = mj.querySelector(".mj-track");
    function go(n) {
      i = n;
      nodes.forEach(function (el, k) { el.classList.toggle("on", k === n); el.classList.toggle("done", k < n); });
      var ic = nodes[n].querySelector(".mj-ic"), tr = track.getBoundingClientRect(), r = ic.getBoundingClientRect();
      var cx = r.left - tr.left + track.scrollLeft + r.width / 2;
      riya.style.transform = "translateX(" + (cx - 28) + "px)";
      var first = nodes[0].querySelector(".mj-ic").getBoundingClientRect();
      fill.style.width = Math.max(0, cx - (first.left - tr.left + track.scrollLeft + first.width / 2)) + "px";
      fill.style.left = (first.left - tr.left + track.scrollLeft + first.width / 2) + "px";
      var last = nodes[nodes.length - 1].querySelector(".mj-ic").getBoundingClientRect(), line = mj.querySelector(".mj-line"), x0 = first.left - tr.left + track.scrollLeft + first.width / 2;
      line.style.left = x0 + "px"; line.style.width = (last.left - first.left) + "px";
      cap.textContent = caps[n] || "";
    }
    function play() { if (timer) return; timer = setInterval(function () { go((i + 1) % nodes.length); }, 1100); go(i < 0 ? 0 : i); }
    function stop() { clearInterval(timer); timer = null; }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es[0].isIntersecting ? play() : stop(); }, { threshold: .35 }).observe(mj);
    else play();
    window.addEventListener("resize", function () { if (i >= 0) go(i); });
  });
});

/* Shop case study: flashcard deck. One section fills the screen; scrolling turns it away to the left like a page */
document.addEventListener("DOMContentLoaded", function () {
  var deck = document.querySelector(".fc-deck"); if (!deck) return;
  var cards = [].slice.call(deck.querySelectorAll(".st-sec.big")), N = cards.length;
  var count = deck.querySelector(".fc-count b"), hint = deck.querySelector(".fc-hint"), on = false, ticking = false;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function setup() {
    var want = window.innerWidth >= 760 && !reduce;
    if (want === on) return; on = want;
    document.documentElement.classList.toggle("fc-on", on);
    if (!on) cards.forEach(function (c) { c.style.transform = ""; c.style.opacity = ""; c.style.zIndex = ""; c.style.visibility = ""; c.style.removeProperty("--shade"); });
  }
  function update() {
    ticking = false; if (!on) return;
    var vh = window.innerHeight, top = deck.getBoundingClientRect().top + window.scrollY;
    var p = Math.max(0, (window.scrollY - top) / vh);
    cards.forEach(function (c, i) {
      var t = i === N - 1 ? 0 : ease(clamp((p - i - .45) / .55));      // turning progress of this card
      var prev = i === 0 ? 1 : ease(clamp((p - (i - 1) - .45) / .55));   // how far the card above has turned
      c.style.zIndex = 100 - i;
      if (i <= Math.floor(p) - 1 && t >= 1) { c.style.visibility = "hidden"; return; }
      c.style.visibility = (i > Math.floor(p) + 1) ? "hidden" : "visible";
      var under = 0.94 + 0.06 * prev;
      c.style.transform = "translateX(" + (-t * 60).toFixed(1) + "px) rotateY(" + (-t * 105).toFixed(2) + "deg) scale(" + (i === 0 ? 1 : under).toFixed(3) + ")";
      c.style.opacity = (t > .8 ? 1 - (t - .8) / .2 : 1) * (i === 0 ? 1 : .55 + .45 * prev);
      c.style.setProperty("--shade", (t * .9).toFixed(2));
    });
    var cur = Math.min(N - 1, Math.floor(p + .3));
    if (count) count.textContent = ("0" + (cur + 1)).slice(-2);
    if (hint) hint.style.opacity = p > N - 1.2 ? 0 : 1;
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  setup(); update();
  window.addEventListener("scroll", req, { passive: true });
  window.addEventListener("resize", function () { setup(); req(); });
});

/* Shop case study: centred flip cards. Scroll flips the card to its back; keep scrolling and it moves on */
document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".fxd")) return;              // the step deck below drives these cards
  var cards = [].slice.call(document.querySelectorAll(".fx")); if (!cards.length) return;
  var mq = window.matchMedia("(max-width: 759px), (prefers-reduced-motion: reduce)"), ticking = false;
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function update() {
    ticking = false;
    if (mq.matches) { cards.forEach(function (c) { c.classList.remove("flipped"); }); return; }
    var vh = window.innerHeight;
    cards.forEach(function (c) {
      var r = c.getBoundingClientRect(), span = c.offsetHeight - vh;
      var p = clamp(-r.top / span);
      var t = ease(clamp((p - .08) / .42));                       // flip happens in the first half
      var inner = c.querySelector(".fx-inner");
      c.classList.toggle("flipped", t >= .999);
      if (t < .999) {
        var lift = Math.sin(t * Math.PI);
        inner.style.transform = "rotateY(" + (t * 180).toFixed(2) + "deg) scale(" + (1 - lift * .06).toFixed(3) + ") translateZ(" + (lift * 40).toFixed(1) + "px)";
      } else inner.style.transform = "";
    });
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", req, { passive: true });
  window.addEventListener("resize", req);
  update();
});

/* Shop case study: step deck. Each scroll gesture is one step:
   card front → flip to back → hold → next card snaps into the centre → flip → … */
document.addEventListener("DOMContentLoaded", function () {
  var deck = document.querySelector(".fxd"); if (!deck) return;
  var cards = [].slice.call(deck.querySelectorAll(".fx")), N = cards.length, LAST = N * 3 - 1;
  var mq = window.matchMedia("(max-width: 759px), (prefers-reduced-motion: reduce)");
  var step = 0, busy = false, acc = 0, lastWheel = 0, dotsBox = deck.querySelector(".fxd-dots");
  for (var d = 0; d < N; d++) dotsBox.appendChild(document.createElement("i"));
  var dots = dotsBox.querySelectorAll("i");
  function countUp(card) {
    card.querySelectorAll(".gl-stats b").forEach(function (b) {
      var end = +b.getAttribute("data-n"), suf = b.getAttribute("data-s") || "", t0 = null;
      (function f(ts) { if (!t0) t0 = ts; var p = Math.min((ts - t0) / 900, 1); b.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suf : ""); if (p < 1) requestAnimationFrame(f); })(performance.now());
    });
  }
  function render(instant) {
    var ci = Math.floor(step / 3), ph = step % 3;
    cards.forEach(function (c, i) {
      if (instant) c.style.transition = "none";
      c.classList.toggle("is-cur", i === ci); c.classList.toggle("is-past", i < ci); c.classList.toggle("is-next", i > ci);
      var flip = i < ci || (i === ci && ph > 0);
      if (flip && !c.classList.contains("is-flipped")) {
        c.classList.add("is-flipped"); c.classList.remove("settled");
        setTimeout(function () { if (c.classList.contains("is-flipped")) c.classList.add("settled"); }, instant ? 0 : 820);
        if (!c.classList.contains("played")) { c.classList.add("played"); countUp(c); }
      } else if (!flip && c.classList.contains("is-flipped")) {
        var inn = c.querySelector(".fx-inner"); inn.style.transition = "none";
        c.classList.remove("settled"); void inn.offsetWidth; inn.style.transition = "";
        c.classList.remove("is-flipped");
      }
      if (instant) { void c.offsetWidth; c.style.transition = ""; }
    });
    dots.forEach(function (x, i) { x.classList.toggle("on", i === ci); });
  }
  function go(dir) {
    var next = step + dir;
    if (next < 0 || next > LAST) return false;
    step = next; busy = true; render(false);
    setTimeout(function () { busy = false; }, 900);
    return true;
  }
  function backScrollable(target, dir) {
    var back = target.closest && target.closest(".fx-back"); if (!back) return false;
    var card = back.closest(".fx"); if (!card.classList.contains("settled")) return false;
    return dir > 0 ? back.scrollTop + back.clientHeight < back.scrollHeight - 2 : back.scrollTop > 2;
  }
  function active() { return !mq.matches && window.scrollY <= 2; }
  window.addEventListener("wheel", function (e) {
    if (!active()) return;
    var dir = e.deltaY > 0 ? 1 : -1;
    if (dir > 0 && step === LAST) return;                    // last card: the page can carry on to the footer
    if (backScrollable(e.target, dir)) return;               // read the back of the card first
    e.preventDefault();
    var now = Date.now(), gap = now - lastWheel; lastWheel = now;
    if (busy) { acc = 0; return; }
    if (gap > 260) acc = 0;                                  // a new gesture
    acc += Math.abs(e.deltaY);
    if (acc > 30) { acc = 0; go(dir); }
  }, { passive: false });
  var ty = null;
  window.addEventListener("touchstart", function (e) { ty = e.touches[0].clientY; }, { passive: true });
  window.addEventListener("touchmove", function (e) {
    if (!active() || ty === null) return;
    var dy = ty - e.touches[0].clientY, dir = dy > 0 ? 1 : -1;
    if (dir > 0 && step === LAST) return;
    if (backScrollable(e.target, dir)) return;
    e.preventDefault();
    if (Math.abs(dy) > 50 && !busy) { go(dir); ty = null; }
  }, { passive: false });
  window.addEventListener("keydown", function (e) {
    if (!active()) return;
    var k = e.key, dir = (k === "ArrowDown" || k === "PageDown" || k === " ") ? 1 : (k === "ArrowUp" || k === "PageUp") ? -1 : 0;
    if (!dir || (dir > 0 && step === LAST)) return;
    e.preventDefault(); if (!busy) go(dir);
  });
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  render(true);
});

/* Back to journey: return to the exact screen the visitor came from, instead of reloading the home page at the top */
document.addEventListener("click", function (e) {
  var a = e.target.closest && e.target.closest("a.back"); if (!a) return;
  var ref = document.referrer, same = false;
  try { same = ref && new URL(ref).origin === location.origin; } catch (err) {}
  if (same && history.length > 1) { e.preventDefault(); history.back(); }
});
/* Home page: remember where the visitor was (relative to the journey section) and restore it on Back */
(function () {
  if (!document.querySelector || location.pathname.replace(/index\.html$/, "") !== "/") return;
  var KEY = "kg_home_pos";
  function save() {
    var s3 = document.querySelector(".s3"); if (!s3) return;
    var top = s3.getBoundingClientRect().top + window.scrollY;
    try { sessionStorage.setItem(KEY, JSON.stringify({ off: window.scrollY - top, co: +(s3.getAttribute("data-co") || 0) })); } catch (err) {}
  }
  window.addEventListener("pagehide", save);
  document.addEventListener("click", function (e) { var a = e.target.closest && e.target.closest("a[href]"); if (a && !a.target && a.origin === location.origin && a.pathname !== location.pathname) save(); }, true);
  var navE = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  var st = null; try { st = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (err) {}
  if (!navE || navE.type !== "back_forward" || !st) return;
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";   // we restore it ourselves, precisely
  var userMoved = false;
  ["wheel", "touchstart", "keydown", "mousedown"].forEach(function (ev) { window.addEventListener(ev, function () { userMoved = true; }, { once: true, passive: true }); });
  function restore() {
    var s3 = document.querySelector(".s3"); if (!s3 || userMoved) return;
    var root = document.documentElement, prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    if (window.__setCompany) window.__setCompany(st.co);
    var y = s3.getBoundingClientRect().top + window.scrollY + st.off;
    if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
    root.style.scrollBehavior = prev;
  }
  document.addEventListener("DOMContentLoaded", function () { restore(); requestAnimationFrame(restore); });
  window.addEventListener("load", function () { restore(); setTimeout(restore, 150); setTimeout(restore, 400); });
})();
