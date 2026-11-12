/* 📜 Lessons: hook→discover→rule→3 checks→scroll (or re-teach). data/lessons + index.json.
   learn.done[id] + BRIEF-T9 s/d day-1/day-7 recall; +5⭐ first pass; practice unlocked. */
(function () {
const WR = window.WR, esc = s => WR.esc(s);
const LN = WR.Learn = {};
const PASS = 2, STARS = 5;           // 2 of 3 checks right passes; the first pass ever pays 5⭐
LN.RECALL = { gaps: [1, 7], rest: 30, day: 864e5 };
let IDX = [], loading = null; const PACKS = {};
/* ---------- the index (loaded with the game data, so chips can show at once) ---------- */
LN.loadIndex = () => loading || (loading = fetch("data/lessons/index.json").then(r => r.ok ? r.json() : { lessons: [] })
  .then(d => { IDX = (d && d.lessons) || []; return IDX; }).catch(() => (IDX = [])));
const init0 = WR.init;
WR.init = async (...a) => { const p = LN.loadIndex(); const r = await init0(...a); await p; return r; };
LN.all = () => IDX.slice();
LN.get = id => IDX.find(x => x.id === id) || null;
LN.pack = async p => {
  if (PACKS[p]) return PACKS[p];
  try {
    const r = await fetch(`data/lessons/${p}.json`);
    if (!r.ok) throw WR.miss(new Error("lesson pack " + p));
    return PACKS[p] = await r.json();
  } catch (e) { throw e && e.wrMiss ? e : WR.miss(e); }
};
LN.full = async id => { const i = LN.get(id); if (!i) return null; const pk = await LN.pack(i.pack); return (pk.lessons || []).find(x => x.id === id) || null; };
const st = () => WR.block("learn");
LN.rec = id => st().done[id] || null;
LN.isDue = (id, now = Date.now()) => { const r = LN.rec(id); return !!(r && r.pass && r.d && r.d <= now); };
LN.dueList = (now = Date.now()) => IDX.filter(l => LN.isDue(l.id, now));
LN.schedulePass = (r, now = Date.now()) => { r.n = (r.n || 0) + 1; r.t = now; if (r.s == null) { r.s = 0; r.d = now + LN.RECALL.gaps[0] * LN.RECALL.day; } return r; };
LN.scheduleRecall = (r, ok, now = Date.now()) => { r.n = (r.n || 0) + 1; r.t = now;
  if (ok) { r.s = (r.s || 0) + 1; r.d = now + (r.s < LN.RECALL.gaps.length ? LN.RECALL.gaps[r.s] : LN.RECALL.rest) * LN.RECALL.day; }
  else { r.s = 0; r.d = now + LN.RECALL.gaps[0] * LN.RECALL.day; } return r; };
LN.isMath = l => !!(l && l.at && l.at.topic);
// a maths lesson's grade comes from its topic (ids such as g6.nets keep their old grade number after a topic moves)
const gradeOf = l => { const t = window.MathGen && MathGen.topic(l.at.topic); return t ? t.grade : +String(l.at.topic).replace(/^g(\d+).*/, "$1"); };
// English lessons belong to a CEFR realm; a Singapore level borrows the lessons of its matching realm (js/sg-english.js)
const mainRealm = rid => { const sg = WR.SG && WR.SG.level && WR.SG.level(String(rid).replace(/^sg-/, "")); return sg && sg.main ? sg.main : rid; };
LN.forSkill = (rid, skill) => IDX.filter(x => x.at.realm === mainRealm(rid) && x.at.skill === skill);
LN.forTopic = t => IDX.filter(x => x.at.topic === t);
/* 🔗 which lesson teaches the idea behind a practice item (English): the lesson's match rules (built by tools/lesson_build.py)
   { opts: [words], need } — the item's options include `need` of these words (default all) — or { re, field: "q"|"explain" } */
const optWords = it => (it.options || []).map(o => String(o).toLowerCase().trim());
const hit = (m, it) => {
  if (m.opts) { const ws = optWords(it), need = m.need || m.opts.length; return m.opts.filter(w => ws.includes(w)).length >= need; }
  if (m.re) { const src = m.field === "q" ? it.q : m.field === "explain" ? it.explain : `${it.q || ""} ${it.explain || ""}`; try { return new RegExp(m.re, "i").test(src || ""); } catch (e) { return false; } }
  return false;
};
LN.forItem = (rid, it) => { if (!it) return null; const r = mainRealm(rid); return IDX.find(x => x.at.realm === r && (x.match || []).some(m => hit(m, it))) || null; };

/* ---------- small helpers ---------- */
// English lines may write a price as \$2.50 in the pack source (\\$2.50) so the narrator says "2 dollars and 50 cents" (tools/lesson_build.py speak); show it as $2.50
const tx = (s, maths) => maths && WR.Math ? WR.Math.html(s) : esc(s).replace(/\\\$/g, "$").replace(/\n/g, "<br>");
const artImg = (L, cls = "ln-art") => L.art ? `<img class="${cls}" src="assets/web/${L.art}.webp" alt="${esc(L.art_alt || L.title)}" decoding="async" onerror="this.onerror=null;this.src='assets/lessons/${L.art}.jpg'">` : "";
const auto = () => WR.state.settings.sound !== false && WR.state.settings.narrate !== false;
const speak = line => { if (line) WR.say(line); };
const hear = (id, label = "Listen") => `<button class="btn ghost ln-hear" id="${id}" aria-label="${label}">🔊</button>`;
const crownsFor = right => right >= 3 ? 3 : right;           // 3/3 → 3 crowns, 2/3 → 2, 1/3 → 1
LN.crowns = id => { const r = LN.rec(id); return r ? r.crowns || 0 : 0; };
LN.earned = () => IDX.filter(x => LN.rec(x.id)).length;
LN.openCount = id => { const o = st().opened; o[id] = (o[id] || 0) + 1; WR.save(); };

/* ---------- 🖐️ drag + tap: every drag has a tap alternative ----------
   sources are [data-src] buttons, targets [data-tgt] elements inside root.
   tap a source → it is picked (glows), then tap a target. o.instant(src) returns a target to drop a tapped source on at once
   (one gap, one mat). o.onTapTarget(tgt) runs when a target is tapped with nothing picked (e.g. tap a ring to add one). */
function dragTap(root, o) {
  let sel = null, swallow = false;
  const clear = () => { root.querySelectorAll("[data-src].sel").forEach(e => e.classList.remove("sel")); root.classList.remove("picking"); sel = null; };
  root.addEventListener("click", e => {
    if (swallow) { swallow = false; return; }
    const s = e.target.closest("[data-src]"), t = e.target.closest("[data-tgt]");
    if (s && root.contains(s)) { if (s.disabled) return;
      const now = o.instant && o.instant(s); if (now) { clear(); return o.onDrop(s, now); }
      if (sel === s) return clear(); clear(); sel = s; s.classList.add("sel"); root.classList.add("picking"); WR.sfx("tap"); return; }
    if (t && root.contains(t)) { if (sel) { const x = sel; clear(); o.onDrop(x, t); } else if (o.onTapTarget) o.onTapTarget(t); else o.nothing && o.nothing(); }
  });
  root.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-tgt]:not(button)")) { e.preventDefault(); e.target.click(); } });
  root.addEventListener("pointerdown", e => {
    if (e.button > 0) return;
    const s = e.target.closest("[data-src]"); if (!s || s.disabled || !root.contains(s)) return;
    const x0 = e.clientX, y0 = e.clientY, r = s.getBoundingClientRect(); let ghost = null, over = null;
    const move = ev => {
      if (!ghost) { if (Math.hypot(ev.clientX - x0, ev.clientY - y0) < 8) return;
        ghost = s.cloneNode(true); ghost.classList.add("ln-ghost"); ghost.classList.remove("sel"); ghost.removeAttribute("id");
        Object.assign(ghost.style, { width: r.width + "px", height: r.height + "px" }); document.body.appendChild(ghost); s.classList.add("dragging"); clear(); }
      ev.preventDefault();
      ghost.style.transform = `translate(${ev.clientX - r.width / 2}px, ${ev.clientY - r.height / 2}px)`;
      const el = document.elementFromPoint(ev.clientX, ev.clientY), t = el && el.closest("[data-tgt]");
      const nt = t && root.contains(t) ? t : null; if (nt !== over) { over && over.classList.remove("over"); over = nt; over && over.classList.add("over"); }
    };
    const up = () => {
      removeEventListener("pointermove", move); removeEventListener("pointerup", up); removeEventListener("pointercancel", up);
      if (!ghost) return; ghost.remove(); s.classList.remove("dragging"); swallow = true; setTimeout(() => swallow = false, 60);
      if (over) { over.classList.remove("over"); o.onDrop(s, over); }
    };
    addEventListener("pointermove", move, { passive: false }); addEventListener("pointerup", up); addEventListener("pointercancel", up);
  });
}
// a finished piece: locked, no longer draggable / droppable, shown green (sort, suffix, bar)
const settle = (el, attr) => { el.disabled = true; el.removeAttribute(attr); el.classList.add("placed"); };
// a card that found its home: lock it inside, cheer with its why, and finish when none are left (sort, line)
const land = (api, src, into, why, left) => { settle(src, "data-src"); into.appendChild(src); api.good(`✅ ${why}`); if (!left) api.done(); };
const shake = el => { if (!el) return; el.classList.remove("ln-shake"); void el.offsetWidth; el.classList.add("ln-shake"); };

/* ---------- the widget kit (LESSONS-PLAN.md §2) ----------
   each kind: html(w) and bind(root, w, api); api.good(msg) / api.miss(msg, el) (2 misses show the widget's hint) / api.done(msg) */
const KIT = {};
// shared: schedule the next stage only if the widget is still on screen
const later = (root, ms, fn) => setTimeout(() => { if (root.isConnected) fn(); }, ms);
const saySoon = (api, line) => { if (api.sayLine && line) setTimeout(() => api.sayLine(line), 0); };
// a finished widget: switch off all its buttons that match sel
const lockAll = (root, sel) => root.querySelectorAll(sel).forEach(b => b.disabled = true);
// place value, money and clock walk a list of targets: cheer, then the next one or done
const nextTarget = (root, api, i, n, sel, show) => {
  const j = i + 1;
  if (j >= n) { lockAll(root, sel); api.done(); }
  else setTimeout(show, 900);
  return j;
};
// shuffle a list but keep each entry's original index k (sort cards, hearpic pictures, spellhear letters)
const shuffled = list => WR.shuffle(list.map((x, k) => ({ x, k })));
// 🔤 shuffle letters for spellhear (and any future letter-tile widgets)
const shuffleLetters = (answer, extra = "") => shuffled((answer + extra).split("")).map(({ x, k }) => ({ ch: x, k }));
// MA-4c: a sort card may carry a drawn pair of lines (pic: two segments [x1, y1, x2, y2] on a 40 × 40 square), e.g. parallel / perpendicular
const linePic = segs => `<svg class="lw-lpic" viewBox="0 0 40 40" aria-hidden="true">${segs.map(([a, b, c, d]) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`).join("")}</svg>`;
// the shuffled pile of cards a child drags or taps into place (sort baskets, line steps); data-k keeps each card's index
const cardPool = (label, items, face = it => esc(it.t)) => `<div class="lw-pool" aria-label="${label}">${shuffled(items).map(({ x: it, k }) => `<button class="lw-chip" data-src data-k="${k}">${face(it)}</button>`).join("")}</div>`;
KIT.sort = {
  html: w => `${cardPool("Cards to sort", w.items, it => `${it.pic ? linePic(it.pic) : ""}${it.icon ? `<span aria-hidden="true">${it.icon}</span> ` : ""}${esc(it.t)}`)}
    <div class="lw-bins b${w.bins.length}">${w.bins.map(b => `<div class="lw-bin" data-tgt data-b="${esc(b.id)}" role="button" tabindex="0" aria-label="${esc(b.label)} basket"><b>${b.icon || ""} ${esc(b.label)}</b><div class="lw-in"></div></div>`).join("")}</div>`,
  bind(root, w, api) {
    let left = w.items.length;
    dragTap(root, { nothing: () => api.say("Tap a card first, then a basket 👆"),
      onDrop(src, bin) { const it = w.items[+src.dataset.k];
        if (it.bin !== bin.dataset.b) return api.miss(`Hmm! ${it.why}`, src);
        land(api, src, bin.querySelector(".lw-in"), it.why, --left); } });
  } };
// 📏 order on a line (EN-4c freq; later sequence / timelines): put each word on its step, top end → bottom end.
// items are listed in the right order; with w.of each step shows it.n of w.of stars (7 days a week), else it.mark or its number
const rungMark = (w, it, k) => w.of ? `${"<i class=on>★</i>".repeat(it.n)}${"<i>★</i>".repeat(w.of - it.n)}` : esc(it.mark || String(k + 1));
const rungLabel = (w, it, k) => w.of ? `${it.n} of ${w.of}${w.unit ? " " + w.unit : ""}` : it.mark || `step ${k + 1}`;
KIT.line = {
  html: w => `${cardPool("Words to put on the line", w.items)}
    <div class="lw-ladder"><div class="lw-end">▲ ${esc(w.ends[0])}</div><ol class="lw-rungs">${w.items.map((it, k) => `<li class="lw-rung" data-tgt data-k="${k}" role="button" tabindex="0" aria-label="the step for ${esc(rungLabel(w, it, k))}"><span class="lw-mark" aria-hidden="true">${rungMark(w, it, k)}</span><span class="lw-in"></span></li>`).join("")}</ol><div class="lw-end">▼ ${esc(w.ends[1])}</div></div>`,
  bind(root, w, api) {
    let left = w.items.length;
    dragTap(root, { nothing: () => api.say("Tap a word first, then a step on the line 👆"),
      onDrop(src, rung) { const k = +src.dataset.k, it = w.items[k];
        if (+rung.dataset.k !== k) return api.miss(`Not that step! ${it.why}`, src);
        rung.removeAttribute("data-tgt"); rung.setAttribute("aria-disabled", "true"); rung.classList.add("done");
        land(api, src, rung.querySelector(".lw-in"), it.why, --left); } });
  } };
KIT.fill = {
  html: w => `<ol class="lw-lines" aria-label="Sentences you finished"></ol><div class="lw-sent" aria-live="polite"></div>
    <div class="lw-tiles">${w.tiles.map(t => `<button class="lw-chip" data-src data-t="${esc(t)}">${esc(t)}</button>`).join("")}</div>`,
  bind(root, w, api) {
    let i = 0; const sent = root.querySelector(".lw-sent"), lines = root.querySelector(".lw-lines");
    const show = () => { const p = w.items[i].s.split("___"); sent.innerHTML = `${esc(p[0])}<span class="lw-gap" data-tgt role="button" tabindex="0" aria-label="the gap">?</span>${esc(p[1] || "")}`; };
    show();
    dragTap(root, { instant: () => sent.querySelector(".lw-gap"),
      onDrop(src) { const it = w.items[i], t = src.dataset.t;
        if (t !== it.a) return api.miss(`Not “${t}”. ${it.why}`, sent.querySelector(".lw-gap"));
        lines.insertAdjacentHTML("beforeend", `<li>${esc(it.s).replace("___", `<b>${esc(it.a)}</b>`)}</li>`);
        api.good(`✅ ${it.why}`); i++; if (i >= w.items.length) { sent.innerHTML = ""; api.done(); } else show(); } });
  } };
// one word button of the suffix widget: the small grey word in front (pre), the word, an empty slot for the stamp,
// and (EN-4d) an optional thing after it (post: Mia + 's + bag)
const stampWord = (w, it, k) => `<button class="lw-word" data-tgt data-k="${k}" data-no="${esc(w.stamp)}">${it.pre ? `<span class="n">${esc(it.pre)}</span> ` : ""}<span class="bw">${esc(it.base)}</span><b class="sfx"></b>${it.post ? ` <span class="pt">${esc(it.post)}</span>` : ""}</button>`;
// the stamp's face: -s, -ed, -er … but 's (EN-4d possessive) has no dash
const stampFace = st => (/^'/.test(st) ? "" : "-") + st;
KIT.suffix = {
  // optional per word: cut = letters dropped from the end before the stamp, add = what is shown instead of the stamp
  // (stop → stop+ped, happy → happ+ier, nice → nice+r); EN-4a. Words without them show base + stamp as before.
  html: w => `<div class="lw-stamps"><button class="lw-stamp" data-src aria-label="the ${esc(w.stamp)} stamp">🔖 ${esc(stampFace(w.stamp))}</button></div>
    <div class="lw-words${w.items.some(it => it.post) ? " wide" : ""}">${w.items.map((it, k) => stampWord(w, it, k)).join("")}</div>`,
  bind(root, w, api) {
    let left = w.items.filter(x => x.need).length;
    const stampOn = word => { const it = w.items[+word.dataset.k];
      if (!it.need) return api.miss(`Oops! ${it.why}`, word);
      if (it.cut) word.querySelector(".bw").textContent = it.base.slice(0, -it.cut);
      word.querySelector(".sfx").textContent = it.add || w.stamp; settle(word, "data-tgt");
      left--; api.good(`✅ ${it.why}`);
      if (!left) { root.querySelectorAll(".lw-word:not(.placed)").forEach(x => { x.classList.add("no-s"); x.disabled = true; }); api.done(); } };
    dragTap(root, { onDrop: (src, word) => stampOn(word), onTapTarget: stampOn });
  } };
// 🧸 place a token on a little scene (CSS: table+basket, bed+toy box, near/far meadow, or park bench)
const SCENE = {
  table: { draw: `<div class="sc-table-top"></div><div class="sc-leg l"></div><div class="sc-leg r"></div><div class="sc-basket"></div>`,
    spots: { on: "the table top", under: "under the table", in: "inside the basket" } },
  bed: { draw: `<div class="sc-bed-head"></div><div class="sc-bed"></div><div class="sc-bed-leg l"></div><div class="sc-bed-leg r"></div><div class="sc-box"></div>`,
    spots: { on: "the top of the bed", under: "under the bed", in: "inside the toy box" } },
  // near / far for this/that/these/those (EN-2); table/bed stay byte-identical above
  nearfar: { draw: `<div class="sc-far-hill"></div><div class="sc-far-tree l"></div><div class="sc-far-tree r"></div><div class="sc-near-rug"></div><div class="sc-near-toys"></div>`,
    spots: { near: "near you", far: "far away" } },
  // park bench + tree for next to / behind / in front of (EN-3 place2)
  park: { draw: `<div class="sc-park-sky"></div><div class="sc-park-tree"></div><div class="sc-park-trunk"></div><div class="sc-park-bench"></div><div class="sc-park-leg l"></div><div class="sc-park-leg r"></div>`,
    spots: { nextto: "next to the bench", behind: "behind the tree", front: "in front of the bench" } } };
const TOKEN_NAME = { pet_bunny: "Puffbun", pet_owl: "Hoot", pet_dragon: "Crumb", pet_fox: "Sumi", pet_kitty: "Kitty", pet_panda: "Panda", pet_penguin: "Penguin", pet_unicorn: "Unicorn" };
KIT.spots = {
  html: w => { const s = SCENE[w.scene];
    return `<div class="lw-task" aria-live="polite"></div><div class="lw-scene sc-${w.scene}">${s.draw}${Object.entries(s.spots).map(([k, lab]) => `<button class="lw-spot sp-${k}" data-tgt data-w="${k}" aria-label="${lab}"><span aria-hidden="true">✨</span></button>`).join("")}
      <button class="lw-token" data-src aria-label="${esc(TOKEN_NAME[w.token] || "your friend")}">${WR.img(w.token, "") || "🐰"}</button></div>`; },
  bind(root, w, api) {
    let i = 0; const task = root.querySelector(".lw-task"), tok = root.querySelector(".lw-token"), scene = root.querySelector(".lw-scene");
    const show = () => { task.innerHTML = `👉 ${esc(w.tasks[i].text)}`; };
    show(); api.sayLine && setTimeout(() => api.sayLine(w.tasks[0].say), 0);
    const put = spot => { const t = w.tasks[i], k = spot.dataset.w;
      if (k !== t.word) return api.miss(`That is ${k.toUpperCase()}! ${t.text}`, spot);
      spot.appendChild(tok); tok.classList.add("in-spot"); api.good(`✅ ${k.toUpperCase()}!`); i++;
      if (i >= w.tasks.length) { tok.disabled = true; scene.classList.add("all-done"); task.textContent = "🎉 You did them all!"; api.done(); }
      else { show(); const next = w.tasks[i].say; setTimeout(() => api.sayLine && api.sayLine(next), 500); } };
    dragTap(root, { onDrop: (src, spot) => put(spot), onTapTarget: put });
  } };
// 🏰 place value: build a number from hundreds / tens / ones blocks
const PV = [[100, "hundreds", "h"], [10, "tens", "t"], [1, "ones", "o"]];
KIT.pv = {
  html: () => `<div class="lw-target" aria-live="polite"></div>
    <div class="lw-mat" data-tgt aria-label="the building mat">${PV.map(([v, name, c]) => `<div class="pv-col pv-${c}"><small class="pv-name">${name}</small><div class="pv-blocks" data-col="${v}"></div><b class="pv-n" data-n="${v}">0</b><button class="btn ghost small pv-minus" data-minus="${v}" aria-label="take one ${name} block back">➖</button></div>`).join("")}</div>
    <div class="lw-src">${PV.map(([v, name, c]) => `<button class="lw-block pv-${c}" data-src data-v="${v}" aria-label="add a ${name} block"><i></i>${v}</button>`).join("")}</div>
    <div class="lw-count" aria-live="polite"></div>`,
  bind(root, w, api) {
    let i = 0; const n = { 100: 0, 10: 0, 1: 0 }, mat = root.querySelector(".lw-mat");
    const total = () => n[100] * 100 + n[10] * 10 + n[1];
    const paint = () => { for (const [v] of PV) { root.querySelector(`[data-col="${v}"]`).innerHTML = "<i></i>".repeat(n[v]); root.querySelector(`[data-n="${v}"]`).textContent = n[v]; }
      root.querySelector(".lw-count").textContent = `${n[100]} hundreds + ${n[10]} tens + ${n[1]} ones = ${total()}`; };
    const show = () => { root.querySelector(".lw-target").innerHTML = `Build <b>${w.targets[i]}</b>`; Object.assign(n, { 100: 0, 10: 0, 1: 0 }); paint(); };
    show();
    const check = () => { const want = w.targets[i];
      if (total() !== want) { if (total() > want) api.say(`That's ${total()}, more than ${want}. Tap ➖ to take one back.`); return; }
      api.good(`✅ ${want} = ${n[100]} hundreds, ${n[10]} tens and ${n[1]} ones!`);
      i = nextTarget(root, api, i, w.targets.length, "[data-src], .pv-minus", show); };
    const add = v => { if (n[v] >= 9) return api.miss(v === 100 ? "That's plenty of hundreds!" : `10 ${v === 1 ? "ones make 1 ten" : "tens make 1 hundred"}! Use a bigger block instead.`, mat);
      n[v]++; WR.sfx("tap"); paint(); check(); };
    dragTap(root, { instant: () => mat, onDrop: src => add(+src.dataset.v) });
    root.querySelectorAll(".pv-minus").forEach(b => b.onclick = e => { e.stopPropagation(); const v = +b.dataset.minus; if (n[v]) { n[v]--; paint(); check(); } });
  } };
// 🍬 shared tens/ones paint for regroup (add) and rename (subtract)
const RG_BAG = "🎀", RG_ONE = "🍬";
const rgBagsHTML = n => `<span class="rg-bag" aria-hidden="true">${RG_BAG}</span>`.repeat(n);
const rgSlotsHTML = ones => { const n = Math.max(10, ones); return Array.from({ length: n }, (_, k) => `<i class="${k < ones ? "on" : ""}">${k < ones ? RG_ONE : ""}</i>`).join(""); };
const rgShelfHTML = () => `<div class="lw-rg"><div class="rg-tens" data-tgt data-z="tens" role="button" tabindex="0" aria-label="the tens shelf"><small>tens (bags of 10)</small><div class="rg-bags"></div></div>
    <div class="rg-jar" data-tgt data-z="ones" role="button" tabindex="0" aria-label="the ones jar"><small>ones jar</small><div class="rg-slots"></div></div></div>`;
// 🍬 adding with regrouping: loose ones go in a 10-slot jar; 10 in the jar bundle into a ten-bag
KIT.regroup = {
  html: () => `${rgShelfHTML()}
    <div class="rg-new"><small>new gumdrops to put away:</small><div class="rg-pile"></div></div>
    <button class="btn peach rg-bundle" hidden>🎀 Bundle 10 into a ten-bag</button>
    <div class="lw-count" aria-live="polite"></div>`,
  bind(root, w, api) {
    const S = { tens: Math.floor(w.a / 10), ones: w.a % 10, inT: Math.floor(w.b / 10), inO: w.b % 10 };
    const pile = root.querySelector(".rg-pile"), bundle = root.querySelector(".rg-bundle"), jar = root.querySelector(".rg-jar"), shelf = root.querySelector(".rg-tens");
    const paint = () => {
      root.querySelector(".rg-bags").innerHTML = rgBagsHTML(S.tens);
      root.querySelector(".rg-slots").innerHTML = rgSlotsHTML(S.ones);
      pile.innerHTML = `<button class="lw-chip rg-ten" data-src data-t="ten" aria-label="a bag of ten">${RG_BAG} 10</button>`.repeat(S.inT) + `<button class="lw-chip rg-one" data-src data-t="one" aria-label="one gumdrop">${RG_ONE}</button>`.repeat(S.inO);
      bundle.hidden = S.ones < 10; jar.classList.toggle("full", S.ones >= 10);
      root.querySelector(".lw-count").textContent = `${S.tens} tens + ${S.ones} ones = ${S.tens * 10 + S.ones}`;
      if (!S.inT && !S.inO && S.ones < 10) { pile.innerHTML = `<b class="rg-sum">${w.a} + ${w.b} = ${w.a + w.b}</b>`; api.done(`✅ ${S.tens} tens and ${S.ones} ones make ${w.a + w.b}!`); }
    };
    const drop = (kind, zone) => {
      if (kind === "one") { if (zone === "tens") return api.miss("Loose gumdrops go in the ones jar 🍬", shelf);
        if (S.ones >= 10) return api.miss("The jar is full! Bundle the 10 first 🎀", jar); S.ones++; S.inO--; WR.sfx("tap"); }
      else { if (zone === "ones") return api.miss("A bag of ten goes on the tens shelf 🎀", jar); S.tens++; S.inT--; WR.sfx("tap"); }
      if (S.ones === 10) api.say("The jar has 10! Tap 🎀 Bundle to make a ten-bag.");
      paint(); };
    dragTap(root, { instant: s => s.dataset.t === "one" ? jar : shelf, onDrop: (src, z) => drop(src.dataset.t, z.dataset.z) });
    bundle.onclick = () => { if (S.ones < 10) return; S.ones -= 10; S.tens++; WR.sfx("good"); api.good("✨ 10 ones → 1 ten!"); paint(); };
    paint();
  } };
// 🍄 equal groups (times) and 🍪 fair sharing (division): rings/plates are targets; items come from a pile
const itemChip = w => `<button class="lw-chip lw-item" data-src aria-label="${esc(w.item)}">${w.item}</button>`;
const groupHTML = (w, n, label) => `<div class="lw-pile" aria-label="${label}">${itemChip(w).repeat(n)}</div>`;
KIT.groups = {
  html: w => `<div class="lw-rings r${w.rings}">${Array.from({ length: w.rings }, (_, k) => `<div class="lw-ring" data-tgt data-k="${k}" role="button" tabindex="0" aria-label="ring ${k + 1}"><div class="lw-got"></div><b class="lw-tot"></b></div>`).join("")}</div>
    ${groupHTML(w, w.rings * w.each, "mushrooms to place")}`,
  bind(root, w, api) {
    // MA-5a cleanup: the skip-count totals (4, 8, 12) are worked out once and shared by the ring labels and the done line
    const got = Array(w.rings).fill(0), pile = root.querySelector(".lw-pile"), runs = Array.from({ length: w.rings }, (_, j) => (j + 1) * w.each);
    const add = ring => { const k = +ring.dataset.k, src = pile.querySelector("[data-src]"); if (!src) return;
      if (got[k] >= w.each) return api.miss(`This ring has ${w.each} — it's full! Every ring gets the same.`, ring);
      src.remove(); got[k]++; ring.querySelector(".lw-got").insertAdjacentHTML("beforeend", `<span>${w.item}</span>`); WR.sfx("tap");
      if (got[k] === w.each) ring.classList.add("full");
      if (!pile.querySelector("[data-src]")) { root.querySelectorAll(".lw-ring").forEach((r, j) => r.querySelector(".lw-tot").textContent = runs[j]);
        api.done(`✅ ${runs.join(", ")}! ${w.rings} groups of ${w.each} = ${w.rings * w.each}`); } };
    dragTap(root, { onDrop: (src, ring) => add(ring), onTapTarget: add });
  } };
KIT.share = {
  html: w => `<div class="lw-plates p${w.plates}">${Array.from({ length: w.plates }, (_, k) => `<div class="lw-plate" data-tgt data-k="${k}" role="button" tabindex="0" aria-label="plate ${k + 1}"><div class="lw-got"></div><button class="btn ghost small lw-back" data-back="${k}" aria-label="take one back from plate ${k + 1}" disabled>↩️</button></div>`).join("")}</div>
    <div class="row lw-deal-row"><button class="btn ghost small lw-deal">🃏 Deal one each</button></div>${groupHTML(w, w.total, "cookies to share")}`,
  bind(root, w, api) {
    // MA-4a: a total that doesn't divide evenly leaves rem items in the pile ("left over"); rem 0 plays exactly as before
    const got = Array(w.plates).fill(0), pile = root.querySelector(".lw-pile"), each = Math.floor(w.total / w.plates), rem = w.total % w.plates;
    const paint = () => root.querySelectorAll(".lw-plate").forEach((p, k) => { p.querySelector(".lw-got").innerHTML = `<span>${w.item}</span>`.repeat(got[k]); p.querySelector(".lw-back").disabled = !got[k]; });
    const left = () => pile.querySelectorAll("[data-src]").length;
    const after = () => { paint();
      if (left() > rem) { const lo = Math.min(...got), hi = Math.max(...got); if (hi - lo >= 2) api.say("Hmm, one plate has lots more. Is that fair? 🤔"); return; }
      if (left() === rem && got.every(g => g === each)) { root.querySelectorAll(".lw-plate").forEach(p => p.classList.add("fair")); lockAll(root, ".lw-back, .lw-deal");
        if (!rem) return api.done(`✅ ${w.total} shared by ${w.plates} = ${each} each. Fair!`);
        lockAll(pile, "[data-src]"); pile.classList.add("leftover");
        return api.done(`✅ ${w.total} shared by ${w.plates} = ${each} each, and ${rem} left over!`); }
      api.miss("Not fair yet! Some plates have more. Tap ↩️ to take one back.", root.querySelector(".lw-plates")); };
    const give = k => { const src = pile.querySelector("[data-src]"); if (!src) return; src.remove(); got[k]++; WR.sfx("tap"); };
    dragTap(root, { onDrop: (src, plate) => { give(+plate.dataset.k); after(); }, onTapTarget: plate => { give(+plate.dataset.k); after(); } });
    root.querySelector(".lw-deal").onclick = () => {
      if (rem && left() < w.plates) return api.say(`Only ${left()} left. That's not enough for one more each!`);
      for (let k = 0; k < w.plates && left(); k++) give(k); after(); };
    root.querySelectorAll(".lw-back").forEach(b => b.onclick = e => { e.stopPropagation(); const k = +b.dataset.back; if (!got[k]) return; got[k]--;
      pile.insertAdjacentHTML("beforeend", itemChip(w)); paint(); });
  } };
// 🍕 fractions: choose how many equal parts (slider or ➖/➕), ✂️ cut, then tap parts to colour them
const fracSVG = (shape, parts) => {
  if (shape === "pizza") { const r = 90, c = 100, a = k => -Math.PI / 2 + k * 2 * Math.PI / parts, pt = k => `${(c + r * Math.cos(a(k))).toFixed(1)} ${(c + r * Math.sin(a(k))).toFixed(1)}`;
    const slice = k => parts === 1 ? `<circle cx="${c}" cy="${c}" r="${r}"` : `<path d="M${c} ${c} L${pt(k)} A${r} ${r} 0 ${parts === 1 ? 1 : 0} 1 ${pt(k + 1)} Z"`;
    return `<svg class="fr-svg pizza" viewBox="0 0 200 200" role="group" aria-label="pizza">${Array.from({ length: parts }, (_, k) => `${slice(k)} class="fp" data-p="${k}" tabindex="0" role="button" aria-label="slice ${k + 1}"/>`).join("")}</svg>`; }
  const wd = 280 / parts;
  return `<svg class="fr-svg bar" viewBox="0 0 290 90" role="group" aria-label="bar">${Array.from({ length: parts }, (_, k) => `<rect x="${5 + k * wd}" y="5" width="${wd}" height="80" rx="6" class="fp" data-p="${k}" tabindex="0" role="button" aria-label="part ${k + 1}"/>`).join("")}</svg>`;
};
const FR_NAME = { 2: "halves", 3: "thirds", 4: "quarters", 5: "fifths", 6: "sixths", 8: "eighths" };
KIT.frac = {
  html: () => `<div class="lw-task" aria-live="polite"></div><div class="fr-stage"></div>
    <div class="fr-ctl"><button class="btn ghost fr-d" data-d="-1" aria-label="fewer parts">➖</button><input type="range" class="slider fr-range" min="1" max="8" value="1" aria-label="how many equal parts"><button class="btn ghost fr-d" data-d="1" aria-label="more parts">➕</button><b class="fr-n">1 part</b></div>
    <div class="row fr-row"><button class="btn mint fr-cut">✂️ Cut!</button></div>`,
  bind(root, w, api) {
    let i = 0, parts = 1, phase = "cut", shaded = new Set();
    const stage = root.querySelector(".fr-stage"), range = root.querySelector(".fr-range"), cut = root.querySelector(".fr-cut"), ctl = root.querySelector(".fr-ctl");
    const draw = () => { stage.innerHTML = fracSVG(w.stages[i].shape, parts); stage.querySelectorAll(".fp").forEach(p => p.classList.toggle("on", shaded.has(+p.dataset.p)));
      root.querySelector(".fr-n").textContent = `${parts} part${parts > 1 ? "s" : ""}`; };
    const start = () => { const s = w.stages[i]; parts = 1; phase = "cut"; shaded = new Set(); range.value = 1; ctl.hidden = false; cut.hidden = false;
      root.querySelector(".lw-task").innerHTML = `👉 ${esc(s.text)}`; draw(); };
    const setParts = p => { if (phase !== "cut") return; parts = Math.max(1, Math.min(8, p)); range.value = parts; draw(); };
    range.oninput = () => setParts(+range.value);
    root.querySelectorAll(".fr-d").forEach(b => b.onclick = () => setParts(parts + +b.dataset.d));
    cut.onclick = () => { const s = w.stages[i];
      if (parts !== s.parts) return api.miss(`That's ${parts} equal part${parts > 1 ? "s" : ""}. ${FR_NAME[s.parts][0].toUpperCase() + FR_NAME[s.parts].slice(1)} means ${s.parts} equal parts.`, stage);
      phase = "shade"; ctl.hidden = true; cut.hidden = true; WR.sfx("good"); api.say(`✂️ ${s.parts} equal parts! Now tap ${s.shade} to colour ${s.shade === 1 ? "it" : "them"}.`); };
    const tapPart = p => { if (phase !== "shade") return api.say("Cut it first! Choose the parts, then tap ✂️ Cut."); const k = +p.dataset.p, s = w.stages[i];
      shaded.has(k) ? shaded.delete(k) : shaded.add(k); WR.sfx("tap"); draw();
      if (shaded.size > s.shade) return api.say(`That's ${shaded.size} coloured — too many! Tap one again to un-colour it.`);
      if (shaded.size === s.shade) { phase = "done"; api.good(`✅ ${WR.Math ? WR.Math.html(`$\\frac{${s.shade}}{${s.parts}}$`) : s.shade + "/" + s.parts} — ${s.shade} of ${s.parts} equal parts!`, true); i++;
        if (i >= w.stages.length) api.done(); else later(root, 1200, () => { start(); api.sayLine && api.sayLine(w.stages[i].say); }); } };
    stage.addEventListener("click", e => { const p = e.target.closest(".fp"); if (p) tapPart(p); });
    stage.addEventListener("keydown", e => { const p = e.target.closest(".fp"); if (p && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); tapPart(p); } });
    start(); saySoon(api, w.stages[0].say);
  } };

// 🌉 subtracting with renaming: when ones aren't enough, unbundle a ten → 10 ones, then take away
KIT.rename = {
  html: () => `${rgShelfHTML()}
    <div class="rg-new"><small>take away these gumdrops:</small><div class="rg-need" aria-live="polite"></div></div>
    <button class="btn peach rg-unbundle" hidden>🎀 Unbundle 1 ten → 10 ones</button>
    <div class="rg-take-row"><button class="btn ghost small rg-take-one" data-take="one" aria-label="take away one gumdrop">➖ one 🍬</button>
      <button class="btn ghost small rg-take-ten" data-take="ten" aria-label="take away one ten-bag">➖ ten 🎀</button></div>
    <div class="lw-count" aria-live="polite"></div>`,
  bind(root, w, api) {
    const needT = Math.floor(w.b / 10), needO = w.b % 10;
    const S = { tens: Math.floor(w.a / 10), ones: w.a % 10, leftT: needT, leftO: needO };
    const unb = root.querySelector(".rg-unbundle"), jar = root.querySelector(".rg-jar"), shelf = root.querySelector(".rg-tens");
    const paint = () => {
      root.querySelector(".rg-bags").innerHTML = rgBagsHTML(S.tens);
      root.querySelector(".rg-slots").innerHTML = rgSlotsHTML(S.ones);
      root.querySelector(".rg-need").innerHTML = (S.leftT ? `<span class="lw-chip rg-ten">${RG_BAG} ×${S.leftT}</span>` : "") + (S.leftO ? `<span class="lw-chip rg-one">${RG_ONE} ×${S.leftO}</span>` : "") + (!S.leftT && !S.leftO ? `<b class="rg-sum">${w.a} − ${w.b} = ${w.a - w.b}</b>` : "");
      const must = S.leftO > S.ones && S.tens > 0;
      unb.hidden = !must; jar.classList.toggle("full", must); jar.classList.toggle("wide", S.ones > 10);
      root.querySelector(".lw-count").textContent = `${S.tens} tens + ${S.ones} ones = ${S.tens * 10 + S.ones}` + (S.leftT || S.leftO ? ` · still take ${S.leftT ? S.leftT + " ten" + (S.leftT > 1 ? "s" : "") : ""}${S.leftT && S.leftO ? " and " : ""}${S.leftO ? S.leftO + " one" + (S.leftO > 1 ? "s" : "") : ""}` : "");
      root.querySelector(".rg-take-one").disabled = !S.leftO;
      root.querySelector(".rg-take-ten").disabled = !S.leftT;
      if (!S.leftT && !S.leftO) { lockAll(root, ".rg-take-one, .rg-take-ten, .rg-unbundle"); api.done(`✅ ${w.a} − ${w.b} = ${w.a - w.b}!`); }
    };
    const take = kind => {
      if (kind === "one") {
        if (!S.leftO) return api.miss("You already took all the ones you need!", jar);
        if (S.ones < 1) return api.miss("No ones left in the jar! Unbundle a ten-bag first 🎀", jar);
        S.ones--; S.leftO--; WR.sfx("tap"); api.good("➖ one gumdrop");
      } else {
        if (!S.leftT) return api.miss("You already took all the tens you need!", shelf);
        if (S.tens < 1) return api.miss("No ten-bags left!", shelf);
        S.tens--; S.leftT--; WR.sfx("tap"); api.good("➖ one ten-bag");
      }
      paint();
    };
    // drag a bag/one chip from the shelf/jar onto a "take" button isn't needed — big tap buttons (and tap shelf/jar)
    root.querySelector(".rg-take-one").onclick = () => take("one");
    root.querySelector(".rg-take-ten").onclick = () => take("ten");
    // also allow tapping the jar (ones) / shelf (tens) as the take target
    dragTap(root, { onTapTarget: z => take(z.dataset.z === "ones" ? "one" : "ten"),
      nothing: () => api.say("Tap ➖ one or ➖ ten to take gumdrops away 👆") });
    unb.onclick = () => { if (S.tens < 1) return api.miss("No ten-bags left to unbundle!", shelf);
      if (S.ones >= 10 && S.leftO <= S.ones) return api.miss("You already have enough ones!", jar);
      S.tens--; S.ones += 10; WR.sfx("good"); api.good("✨ 1 ten → 10 ones!"); paint(); };
    paint();
    if (S.leftO > S.ones) api.say("Hmm, not enough ones. Unbundle a ten-bag first!");
  } };
// 💰 dollars & cents: build an amount with $1 / 10¢ / 1¢ coins (pv-style)
const COINS = [[100, "$1", "dollar", "d"], [10, "10¢", "ten-cent", "t"], [1, "1¢", "one-cent", "c"]];
const moneyFmt = (c, asCents) => asCents ? `${c}¢` : `$${(c / 100).toFixed(2)}`;
KIT.money = {
  html: () => `<div class="lw-target" aria-live="polite"></div>
    <div class="lw-mat money-mat" data-tgt aria-label="the till mat">${COINS.map(([v, lab, name, c]) => `<div class="pv-col pv-${c}"><small class="pv-name">${lab}</small><div class="pv-blocks" data-col="${v}"></div><b class="pv-n" data-n="${v}">0</b><button class="btn ghost small pv-minus" data-minus="${v}" aria-label="take one ${name} coin back">➖</button></div>`).join("")}</div>
    <div class="lw-src">${COINS.map(([v, lab, name, c]) => `<button class="lw-block pv-${c}" data-src data-v="${v}" aria-label="add a ${name} coin"><i></i>${lab}</button>`).join("")}</div>
    <div class="lw-count" aria-live="polite"></div>`,
  bind(root, w, api) {
    let i = 0; const n = { 100: 0, 10: 0, 1: 0 }, mat = root.querySelector(".lw-mat");
    const total = () => n[100] * 100 + n[10] * 10 + n[1];
    const fmt = c => moneyFmt(c, w.cents);
    const paint = () => { for (const [v, lab, name, cls] of COINS) { const col = root.querySelector(`[data-col="${v}"]`);
      col.innerHTML = `<i class='coin-${cls}'></i>`.repeat(n[v]);
      root.querySelector(`[data-n="${v}"]`).textContent = n[v]; }
      root.querySelector(".lw-count").textContent = `${n[100]} × $1 + ${n[10]} × 10¢ + ${n[1]} × 1¢ = ${fmt(total())}`; };
    const show = () => { root.querySelector(".lw-target").innerHTML = `Make <b>${fmt(w.targets[i])}</b>`; Object.assign(n, { 100: 0, 10: 0, 1: 0 }); paint(); };
    show();
    const check = () => { const want = w.targets[i];
      if (total() !== want) { if (total() > want) api.say(`That's ${fmt(total())}, more than ${fmt(want)}. Tap ➖ to take a coin back.`); return; }
      api.good(`✅ ${fmt(want)}!`);
      i = nextTarget(root, api, i, w.targets.length, "[data-src], .pv-minus", show); };
    const add = v => { if (n[v] >= 9) return api.miss(v === 100 ? "That's plenty of dollars!" : v === 10 ? "10 of the 10¢ coins make $1. Use a $1 coin instead!" : "10 of the 1¢ coins make 10¢. Use a 10¢ coin instead!", mat);
      n[v]++; WR.sfx("tap"); paint(); check(); };
    dragTap(root, { instant: () => mat, onDrop: src => add(+src.dataset.v) });
    root.querySelectorAll(".pv-minus").forEach(b => b.onclick = e => { e.stopPropagation(); const v = +b.dataset.minus; if (n[v]) { n[v]--; paint(); check(); } });
  } };
// ⏰ five-minute clock: set the hands (long hand in 5-min steps)
const clockSVG = (h, m) => {
  const cx = 100, cy = 100, r = 88;
  const ticks = Array.from({ length: 12 }, (_, k) => { const a = -Math.PI / 2 + k * Math.PI / 6, x1 = cx + (r - 4) * Math.cos(a), y1 = cy + (r - 4) * Math.sin(a), x2 = cx + (r - 14) * Math.cos(a), y2 = cy + (r - 14) * Math.sin(a);
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#C99A6B" stroke-width="3" stroke-linecap="round"/>`; }).join("");
  const nums = Array.from({ length: 12 }, (_, k) => { const n = k === 0 ? 12 : k, a = -Math.PI / 2 + k * Math.PI / 6, x = cx + (r - 28) * Math.cos(a), y = cy + (r - 28) * Math.sin(a);
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="800" fill="#6d4f86">${n}</text>`; }).join("");
  // minute hand angle: 0 at 12, full circle = 60 min; hour hand: also moves with minutes
  const ma = -Math.PI / 2 + (m / 60) * 2 * Math.PI, ha = -Math.PI / 2 + ((h % 12) / 12 + m / 60 / 12) * 2 * Math.PI;
  const hand = (a, len, w, cls) => `<line class="${cls}" x1="${cx}" y1="${cy}" x2="${(cx + len * Math.cos(a)).toFixed(1)}" y2="${(cy + len * Math.sin(a)).toFixed(1)}" stroke-width="${w}" stroke-linecap="round"/>`;
  return `<svg class="ck-svg" viewBox="0 0 200 200" role="img" aria-label="clock showing ${h}:${String(m).padStart(2, "0")}">${`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFF8E7" stroke="#F3D9A8" stroke-width="6"/>`}${ticks}${nums}${hand(ha, 48, 5, "ck-h")}${hand(ma, 68, 3.5, "ck-m")}<circle cx="${cx}" cy="${cy}" r="5" fill="#FF6F91"/></svg>`;
};
const hmStr = (h, m) => `${h}:${String(m).padStart(2, "0")}`;
KIT.clock = {
  html: () => `<div class="lw-target" aria-live="polite"></div><div class="ck-stage"></div>
    <div class="ck-ctl"><button class="btn ghost ck-btn" data-k="h-" aria-label="hour back">⏪ hour</button><button class="btn ghost ck-btn" data-k="h+" aria-label="hour forward">hour ⏩</button>
      <button class="btn peach ck-btn" data-k="m-" aria-label="five minutes back">⏪ 5 min</button><button class="btn peach ck-btn" data-k="m+" aria-label="five minutes forward">5 min ⏩</button></div>
    <div class="lw-count" aria-live="polite"></div>`,
  bind(root, w, api) {
    let i = 0, h = 12, m = 0;
    const stage = root.querySelector(".ck-stage");
    const paint = () => { stage.innerHTML = clockSVG(h, m); root.querySelector(".lw-count").textContent = `Hands say ${hmStr(h, m)}`; };
    const show = () => { const t = w.targets[i]; root.querySelector(".lw-target").innerHTML = `Set the clock to <b>${hmStr(t.h, t.m)}</b>`; h = 12; m = 0; paint(); };
    const check = () => { const t = w.targets[i]; if (h !== t.h || m !== t.m) return;
      api.good(`✅ ${hmStr(t.h, t.m)}!`);
      i = nextTarget(root, api, i, w.targets.length, ".ck-btn", show); };
    root.querySelectorAll(".ck-btn").forEach(b => b.onclick = () => {
      const k = b.dataset.k;
      if (k === "h+") h = h % 12 + 1; else if (k === "h-") h = h === 1 ? 12 : h - 1;
      else if (k === "m+") { m = (m + 5) % 60; if (m === 0) h = h % 12 + 1; }
      else if (k === "m-") { if (m === 0) { m = 55; h = h === 1 ? 12 : h - 1; } else m -= 5; }
      WR.sfx("tap"); paint(); check();
    });
    // tap a hour number on the face to jump the long hand (5-min marks = hour numerals)
    stage.addEventListener("click", e => {
      const svg = stage.querySelector("svg"); if (!svg) return;
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const ctm = svg.getScreenCTM(); if (!ctm) return; const loc = pt.matrixTransform(ctm.inverse());
      const dx = loc.x - 100, dy = loc.y - 100, dist = Math.hypot(dx, dy);
      if (dist < 35 || dist > 95) return;
      let ang = Math.atan2(dy, dx) + Math.PI / 2; if (ang < 0) ang += 2 * Math.PI;
      const slot = Math.round(ang / (2 * Math.PI) * 12) % 12; // 0=12, 1=1, …
      m = slot * 5; WR.sfx("tap"); paint(); check();
    });
    show();
  } };
// 🎏 picture graph with a key: tap a row to add/remove pictures until each matches
KIT.picgraph = {
  html: w => `<div class="lw-target" aria-live="polite">Key: each ${w.item || "⭐"} = <b>${w.key}</b></div>
    <div class="pg-rows">${w.cats.map((c, k) => `<div class="pg-row" data-k="${k}"><span class="pg-name">${esc(c.label)}</span>
      <div class="pg-pics" data-pics="${k}" role="list"></div>
      <div class="pg-btns"><button class="btn ghost small pg-add" data-add="${k}" aria-label="add a picture to ${esc(c.label)}">➕</button>
        <button class="btn ghost small pg-sub" data-sub="${k}" aria-label="take one picture from ${esc(c.label)}">➖</button></div>
      <b class="pg-n" data-n="${k}">0</b></div>`).join("")}</div>
    <div class="lw-count" aria-live="polite"></div>`,
  bind(root, w, api) {
    const got = w.cats.map(() => 0), item = w.item || "⭐";
    const paint = () => { w.cats.forEach((c, k) => {
      root.querySelector(`[data-pics="${k}"]`).innerHTML = `<span aria-hidden="true">${item}</span>`.repeat(got[k]);
      root.querySelector(`[data-n="${k}"]`).textContent = got[k] * w.key;
      root.querySelector(`.pg-row[data-k="${k}"]`).classList.toggle("ok", got[k] === c.n);
    });
      root.querySelector(".lw-count").textContent = got.every((g, k) => g === w.cats[k].n) ? "🎉 Graph matches the key!" : "Tap ➕ / ➖ so each row matches."; };
    const doneCheck = () => { paint(); if (got.every((g, k) => g === w.cats[k].n)) { lockAll(root, ".pg-add, .pg-sub"); api.done(`✅ Each ${item} = ${w.key}. Graph complete!`); } };
    root.querySelectorAll(".pg-add").forEach(b => b.onclick = () => { const k = +b.dataset.add; if (got[k] >= 8) return api.miss("That's plenty for this row!", root.querySelector(`.pg-row[data-k="${k}"]`));
      got[k]++; WR.sfx("tap"); if (got[k] === w.cats[k].n) api.good(`✅ ${w.cats[k].label}: ${got[k]} × ${w.key} = ${got[k] * w.key}`); doneCheck(); });
    root.querySelectorAll(".pg-sub").forEach(b => b.onclick = () => { const k = +b.dataset.sub; if (!got[k]) return; got[k]--; WR.sfx("tap"); doneCheck(); });
    // tap the row itself to add (big target)
    root.querySelectorAll(".pg-row").forEach(row => row.addEventListener("click", e => { if (e.target.closest("button")) return; root.querySelector(`.pg-add[data-add="${row.dataset.k}"]`).click(); }));
    paint();
  } };
// 📜 Singapore bar model: shade the take-away, then join the add (two-step story)
KIT.bar = {
  html: w => `<div class="lw-task" aria-live="polite"></div>
    <div class="bm-wrap"><div class="bm-bar" role="img" aria-label="bar model"><div class="bm-part sold" data-tgt data-p="sold" role="button" tabindex="0" aria-label="sold part"><span>sold?</span></div><div class="bm-part left" data-p="left"><span>left</span></div><div class="bm-part add" data-tgt data-p="add" role="button" tabindex="0" aria-label="new batch"><span>+ ?</span></div></div>
      <div class="bm-braces"><span class="bm-br start">start ${w.start}</span><span class="bm-br now">now ?</span></div></div>
    <div class="bm-pool"><button class="lw-chip" data-src data-v="sold" aria-label="sold ${w.sold}">sold ${w.sold}</button>
      <button class="lw-chip" data-src data-v="add" aria-label="baked ${w.add} more">+ ${w.add}</button></div>
    <div class="lw-count" aria-live="polite"></div>`,
  bind(root, w, api) {
    const placed = { sold: false, add: false };
    const ans = w.start - w.sold + w.add;
    root.querySelector(".lw-task").innerHTML = `👉 ${esc(w.text || `First mark the ${w.sold} sold, then join the ${w.add} new ones.`)}`;
    const paint = () => {
      const sold = root.querySelector(".bm-part.sold"), add = root.querySelector(".bm-part.add"), left = root.querySelector(".bm-part.left");
      // widths proportional
      sold.style.flex = String(w.sold); left.style.flex = String(w.start - w.sold); add.style.flex = String(w.add);
      sold.classList.toggle("on", placed.sold); add.classList.toggle("on", placed.add);
      sold.querySelector("span").textContent = placed.sold ? `sold ${w.sold}` : "sold?";
      left.querySelector("span").textContent = placed.sold ? `${w.start - w.sold}` : "left";
      add.querySelector("span").textContent = placed.add ? `+ ${w.add}` : "+ ?";
      add.style.opacity = placed.sold || placed.add ? "1" : ".45";
      root.querySelector(".bm-br.now").textContent = placed.sold && placed.add ? `now ${ans}` : "now ?";
      root.querySelector(".lw-count").textContent = placed.sold && placed.add ? `${w.start} − ${w.sold} + ${w.add} = ${ans}` : "Drag or tap a chip onto its bar part.";
    };
    const put = (kind, part) => {
      if (kind !== part.dataset.p) return api.miss(kind === "sold" ? "Sold cookies go on the sold part of the bar." : "New cookies join on the + part.", part);
      if (kind === "add" && !placed.sold) return api.miss("Do the take-away first! Mark the sold part, then add.", part);
      if (placed[kind]) return;
      placed[kind] = true; WR.sfx("good");
      const src = root.querySelector(`[data-src][data-v="${kind}"]`); if (src) settle(src, "data-src");
      api.good(kind === "sold" ? `✅ Sold ${w.sold}. Left: ${w.start - w.sold}.` : `✅ Plus ${w.add}. Now ${ans}!`);
      paint();
      if (placed.sold && placed.add) api.done(`✅ ${w.start} − ${w.sold} + ${w.add} = ${ans}`);
    };
    dragTap(root, { onDrop: (src, part) => put(src.dataset.v, part),
      onTapTarget: part => { const kind = part.dataset.p; const src = root.querySelector(`[data-src][data-v="${kind}"]`); if (src) put(kind, part); else api.say("Tap a chip first 👆"); },
      nothing: () => api.say("Tap a chip, then its place on the bar 👆") });
    paint();
  } };

// 📊 bar graph with a scale (MA-4c): raise each bar to its number, where every line up the side counts w.scale (not 1).
// tap ➕ / ➖ under a bar, or tap the bar's column at a height (the tap version of dragging the top of the bar)
KIT.bargraph = {
  html: w => { const steps = w.max / w.scale, cols = `style="grid-template-columns:repeat(${w.bars.length},minmax(0,1fr))"`;
    return `<div class="lw-target" aria-live="polite">Each line = <b>${w.scale}</b> ${esc(w.unit)}</div>
    <div class="bg-data">${w.bars.map(b => `<span class="bg-want bg-${esc(b.color)}">${esc(b.label)}: <b>${b.n}</b></span>`).join("")}</div>
    <div class="bg-chart" style="--steps:${steps}"><div class="bg-axis" aria-hidden="true">${Array.from({ length: steps + 1 }, (_, k) => `<span style="bottom:calc(${k} * var(--bg-step))">${k * w.scale}</span>`).join("")}</div>
      <div class="bg-plot" ${cols}>${w.bars.map((b, k) => `<div class="bg-col" data-col="${k}" role="button" tabindex="0" aria-label="the ${esc(b.label)} bar: tap a height"><div class="bg-bar bg-${esc(b.color)}" style="height:0"><b></b></div></div>`).join("")}</div>
      <i></i><div class="bg-names" ${cols}>${w.bars.map(b => `<span>${esc(b.label)}</span>`).join("")}</div>
      <i></i><div class="bg-ctl" ${cols}>${w.bars.map((b, k) => `<div><button class="btn ghost small bg-add" data-add="${k}" aria-label="the ${esc(b.label)} bar one line taller">➕</button><button class="btn ghost small bg-sub" data-sub="${k}" aria-label="the ${esc(b.label)} bar one line shorter">➖</button></div>`).join("")}</div></div>
    <div class="lw-count" aria-live="polite"></div>`; },
  bind(root, w, api) {
    const steps = w.max / w.scale, got = w.bars.map(() => 0); let finished = false;
    const lines = n => `${n} line${n === 1 ? "" : "s"}`;
    const paint = () => w.bars.forEach((b, k) => { const bar = root.querySelector(`[data-col="${k}"] .bg-bar`), ok = got[k] * w.scale === b.n;
      bar.style.height = `calc(${got[k]} * var(--bg-step))`; bar.classList.toggle("ok", ok); bar.querySelector("b").textContent = ok ? b.n : ""; });
    const set = (k, n) => { if (finished) return; n = Math.max(0, Math.min(steps, n)); if (n === got[k]) return;
      got[k] = n; WR.sfx("tap"); paint(); const b = w.bars[k], v = n * w.scale;
      root.querySelector(".lw-count").textContent = `${b.label}: ${lines(n)} × ${w.scale} = ${v}`;
      if (v > b.n) return api.miss(`That's ${v}, past ${b.n}! Each line counts ${w.scale}, so ${b.label} needs ${lines(b.n / w.scale)}. Tap ➖.`, root.querySelector(`[data-col="${k}"]`));
      if (v === b.n) api.good(`✅ ${b.label}: ${lines(n)} × ${w.scale} = ${b.n} ${w.unit}`);
      if (got.every((g, j) => g * w.scale === w.bars[j].n)) { finished = true; lockAll(root, ".bg-add, .bg-sub");
        root.querySelectorAll(".bg-col").forEach(c => c.setAttribute("aria-disabled", "true")); api.done(`✅ Every bar matches! Each line counts ${w.scale} ${w.unit}.`); } };
    root.querySelectorAll(".bg-add").forEach(b => b.onclick = () => set(+b.dataset.add, got[+b.dataset.add] + 1));
    root.querySelectorAll(".bg-sub").forEach(b => b.onclick = () => set(+b.dataset.sub, got[+b.dataset.sub] - 1));
    root.querySelectorAll(".bg-col").forEach(c => { const k = +c.dataset.col;
      c.addEventListener("click", e => { const r = c.getBoundingClientRect();
        if (!e.detail || !r.height) return set(k, got[k] + 1);      // a keyboard press: one line taller
        set(k, Math.ceil((r.bottom - e.clientY) / (r.height / steps) - 0.25)); });
      c.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); set(k, got[k] + 1); } }); });
    paint();
  } };
// 🧺 bar model for × and ÷ stories (MA-4c): build the bar from equal boxes, ✅ check it, then pick the number sentence that matches.
// a stage's ask: "total" (n boxes of each → how many in all?), "groups" (boxes of each until the bar makes n × each → how many boxes?)
// or "each" (cut the total n × each into n equal boxes → how many in each?)
KIT.units = {
  html: () => `<div class="lw-task" aria-live="polite"></div><div class="um-wrap"></div>
    <div class="um-ctl"><button class="btn ghost um-d" data-d="-1" aria-label="one box fewer">➖</button><b class="um-n" aria-live="polite"></b><button class="btn ghost um-d" data-d="1" aria-label="one box more">➕</button></div>
    <div class="row um-row"><button class="btn mint um-check">✅ Check my bar</button></div>
    <div class="um-ops" aria-label="Number sentences"></div>`,
  bind(root, w, api) {
    let k = 1, phase = "build";
    const wrap = root.querySelector(".um-wrap"), ctl = root.querySelector(".um-ctl"), chk = root.querySelector(".um-check"), ops = root.querySelector(".um-ops"), task = root.querySelector(".lw-task");
    const draw = s => { const tot = s.n * s.each, done = phase === "done", whole = s.ask !== "groups";
      const boxes = Array.from({ length: k }, () => `<span class="um-box"${whole ? "" : ` style="flex:0 0 ${(100 * s.each / tot).toFixed(3)}%"`}>${s.ask === "each" && !done ? "?" : s.each}</span>`).join("");
      const top = s.ask === "total" && !done ? `? ${s.unit} in all` : `${tot} ${s.unit}${s.ask === "total" ? " in all" : ""}`;
      wrap.innerHTML = `<div class="um-top"><span>${esc(top)}</span></div><div class="um-bar${whole ? "" : " grow"}" role="img" aria-label="bar model: ${k} box${k > 1 ? "es" : ""}">${boxes}</div>`;
      root.querySelector(".um-n").textContent = s.ask === "groups" ? `${k} × ${s.each} = ${k * s.each}` : `${k} box${k > 1 ? "es" : ""}`; };
    const run = tapStages(root, w, api, {
      paint: s => { k = 1; phase = "build"; task.innerHTML = `👉 ${esc(s.item || "")} ${esc(s.text)}`; ctl.hidden = false; chk.hidden = false; ops.innerHTML = ""; draw(s); },
      lock: () => lockAll(root, "button") });
    root.querySelectorAll(".um-d").forEach(b => b.onclick = () => { if (phase !== "build") return; const s = run.stage(), d = +b.dataset.d;
      if (k + d < 1) return; if (k + d > 10) return api.miss("That's lots of boxes! " + s.why, wrap);
      k += d; WR.sfx("tap"); draw(s); });
    chk.onclick = () => { if (phase !== "build") return; const s = run.stage();
      if (k !== s.n) return api.miss(s.ask === "groups" && k * s.each > s.n * s.each ? `That's ${k * s.each}, more than ${s.n * s.each}! ${s.why}` : `Not yet! ${s.why}`, wrap);
      phase = "pick"; ctl.hidden = true; chk.hidden = true; WR.sfx("good");
      ops.innerHTML = `<p class="um-ask">Which number sentence matches your bar?</p>` + shuffled(s.ops).map(({ x: o, k: j }) => `<button class="lw-chip um-op" data-op="${j}">${esc(o.t)}</button>`).join("");
      api.say("✅ Your bar is ready! Now tap the number sentence that matches it."); };
    ops.addEventListener("click", e => { const b = e.target.closest(".um-op"); if (!b || phase !== "pick") return; const s = run.stage(), o = s.ops[+b.dataset.op];
      if (!o.ok) return api.miss(`Not “${o.t}”. ${o.why}`, b);
      phase = "done"; b.classList.add("right"); lockAll(ops, ".um-op"); draw(s);
      run.finish(`✅ ${o.t}`, `🎉 ${o.t}! The bar model shows it.`); });
  } };

// 📖 find a number/colour word in a short story (tap the word)
const bareWord = t => String(t || "").replace(/[^\p{L}\p{N}']+/gu, "").toLowerCase();
KIT.findword = {
  html: w => {
    const toks = String(w.story || "").split(/(\s+)/);
    const story = toks.map((t, k) => /^\s+$/.test(t) ? esc(t) : `<button class="lw-fword" data-tgt data-k="${k}" data-w="${esc(bareWord(t))}" aria-label="${esc(bareWord(t) || t)}">${esc(t)}</button>`).join("");
    return `<div class="lw-task" aria-live="polite"></div><div class="lw-storybox" aria-label="the story">${story}</div>`;
  },
  bind(root, w, api) {
    let i = 0; const task = root.querySelector(".lw-task");
    const show = () => { task.innerHTML = `👉 ${esc(w.tasks[i].q)}`; root.querySelectorAll(".lw-fword").forEach(b => { b.disabled = false; b.classList.remove("right", "wrong"); }); };
    show(); saySoon(api, w.tasks[0].say || w.tasks[0].q);
    const pick = btn => {
      const t = w.tasks[i], got = bareWord(btn.dataset.w), want = bareWord(t.word);
      if (got !== want) {
        btn.classList.add("wrong"); setTimeout(() => btn.classList.remove("wrong"), 450);
        return api.miss(t.why || `Hmm, “${btn.textContent.trim()}” is not what we need. ${t.q}`, btn);
      }
      btn.classList.add("right"); api.good(`✅ ${t.why || ("Yes! “" + t.word + "”.")}`); i++;
      if (i >= w.tasks.length) { lockAll(root, ".lw-fword"); task.textContent = "🎉 You found them all!"; api.done(); }
      else later(root, 700, () => { show(); api.sayLine && api.sayLine(w.tasks[i].say || w.tasks[i].q); });
    };
    dragTap(root, { onTapTarget: pick, nothing: () => api.say("Tap the word in the story 👆") });
  } };
// 🎧 hear a number/name, spell it with letter tiles
KIT.spellhear = {
  html: w => `<div class="lw-task" aria-live="polite"></div>
    <div class="row lw-hear-row"><button class="btn mint lw-replay" aria-label="Hear it again">🔊 Hear it</button></div>
    <div class="lw-slots" aria-label="Your spelling"></div>
    <div class="lw-letters" aria-label="Letter tiles"></div>
    <button class="btn ghost small lw-clear" hidden>↩️ Clear</button>`,
  bind(root, w, api) {
    let i = 0, built = [], pool = [];
    const task = root.querySelector(".lw-task"), slots = root.querySelector(".lw-slots"), letters = root.querySelector(".lw-letters"), clear = root.querySelector(".lw-clear"), replay = root.querySelector(".lw-replay");
    const item = () => w.items[i];
    const paint = () => {
      const it = item(), n = it.answer.length;
      slots.innerHTML = Array.from({ length: n }, (_, k) => built[k] ? `<button class="lw-chip lw-slot filled" data-tgt data-built="${k}" aria-label="letter ${built[k].ch}">${esc(built[k].ch)}</button>` : `<span class="lw-slot empty" aria-hidden="true"></span>`).join("");
      letters.innerHTML = pool.map(t => `<button class="lw-chip lw-letter" data-src data-k="${t.k}" aria-label="letter ${esc(t.ch)}">${esc(t.ch)}</button>`).join("");
      clear.hidden = !built.length;
    };
    const start = () => {
      const it = item(); built = [];
      const extra = it.tiles || ""; pool = shuffleLetters(it.answer, extra);
      task.innerHTML = `👉 ${esc(w.text || "Listen, then spell the word.")}`;
      paint(); saySoon(api, it.say || it.answer);
    };
    const check = () => {
      const it = item(), got = built.map(t => t.ch).join("");
      if (got.length < it.answer.length) return;
      if (got !== it.answer) { api.miss(`Not “${got}”. Try again!`, slots); built = []; paint(); return; }
      api.good(`✅ ${it.why || ("“" + it.answer + "”!")}`); i++;
      if (i >= w.items.length) { lockAll(root, "[data-src], .lw-clear, .lw-replay"); api.done("🎉 Great listening!"); }
      else later(root, 900, start);
    };
    const add = src => { const it = item(); if (built.length >= it.answer.length) return;
      const k = +src.dataset.k, ix = pool.findIndex(t => t.k === k); if (ix < 0) return;
      built.push(pool.splice(ix, 1)[0]); WR.sfx("tap"); paint(); check(); };
    const take = k => { if (!built[k]) return; pool.push(built.splice(k, 1)[0]); paint(); };
    dragTap(root, { instant: () => slots, onDrop: src => add(src),
      onTapTarget: t => { if (t.dataset.built != null) take(+t.dataset.built); },
      nothing: () => api.say("Tap a letter tile 👆") });
    clear.onclick = () => { pool = pool.concat(built); built = []; paint(); };
    replay.onclick = () => api.sayLine && api.sayLine(item().say || item().answer);
    start();
  } };
// 🖼️ hear a key word, tap the matching picture
KIT.hearpic = {
  html: w => `<div class="lw-task" aria-live="polite"></div>
    <div class="row lw-hear-row"><button class="btn mint lw-replay" aria-label="Hear the word">🔊 Hear it</button></div>
    <div class="lw-pics" aria-label="Pictures"></div>`,
  bind(root, w, api) {
    let i = 0; const task = root.querySelector(".lw-task"), pics = root.querySelector(".lw-pics"), replay = root.querySelector(".lw-replay");
    const show = () => {
      const it = w.items[i];
      task.innerHTML = `👉 ${esc(it.prompt || "Tap the picture you hear.")}`;
      pics.innerHTML = shuffled(it.pics).map(({ x: p, k }) =>
        `<button class="lw-pic" data-tgt data-k="${k}" aria-label="${esc(p.label || p.id)}"><span class="lw-pico" aria-hidden="true">${p.icon || "📷"}</span><small>${esc(p.label || "")}</small></button>`).join("");
      saySoon(api, it.say || it.word);
    };
    show();
    const pick = btn => {
      const it = w.items[i], p = it.pics[+btn.dataset.k];
      if (!p.ok) return api.miss(p.why || `That's the ${p.label || p.id}, not “${it.word}”.`, btn);
      btn.classList.add("right"); api.good(`✅ ${p.why || ("Yes! “" + it.word + "”.")}`); i++;
      if (i >= w.items.length) { lockAll(pics, ".lw-pic"); api.done("🎉 Ears sharp!"); }
      else later(root, 900, show);
    };
    dragTap(root, { onTapTarget: pick, nothing: () => api.say("Tap a picture 👆") });
    replay.onclick = () => api.sayLine && api.sayLine(w.items[i].say || w.items[i].word);
  } };


// 🪜 tap-through stages (shapecount, fence): paint stage i and say it; finish() cheers, then paints the next stage after a beat,
// or locks the widget and ends it after the last one
const tapStages = (root, w, api, o) => {
  let i = 0;
  const finish = (good, doneMsg) => { api.good(good); i++;
    if (i >= w.stages.length) { o.lock(); api.done(doneMsg); }
    else later(root, 900, () => { o.paint(w.stages[i]); api.sayLine && api.sayLine(w.stages[i].say); }); };
  o.paint(w.stages[0]); saySoon(api, w.stages[0].say);
  return { stage: () => w.stages[i], finish };
};
// 🔷 sides & corners: tap each side or corner on a pastel shape to count
const SHAPE_PTS = {
  triangle: [[60, 14], [108, 100], [12, 100]],
  square: [[18, 18], [102, 18], [102, 102], [18, 102]],
  rectangle: [[8, 32], [112, 32], [112, 90], [8, 90]],
  pentagon: [[60, 10], [110, 44], [92, 104], [28, 104], [10, 44]],
  hexagon: [[36, 12], [84, 12], [110, 60], [84, 108], [36, 108], [10, 60]]
};
const SHAPE_FILL = { triangle: "#FFD6E0", square: "#C8F2DC", rectangle: "#D6EEFF", pentagon: "#E2D6FF", hexagon: "#FFF4C2" };
const shapeSVG = (shape, mode) => {
  const pts = SHAPE_PTS[shape], fill = SHAPE_FILL[shape] || "#C8F2DC", n = pts.length;
  const poly = pts.map(p => p.join(",")).join(" ");
  let hits = "";
  if (mode === "corners") {
    hits = pts.map((p, k) => `<circle class="sc-hit sc-corner" data-tgt data-i="${k}" cx="${p[0]}" cy="${p[1]}" r="14" role="button" tabindex="0" aria-label="corner ${k + 1}"/>`).join("");
  } else {
    hits = pts.map((p, k) => {
      const q = pts[(k + 1) % n], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      return `<line class="sc-edge" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" aria-hidden="true"/>
        <circle class="sc-hit sc-side" data-tgt data-i="${k}" cx="${mx}" cy="${my}" r="16" role="button" tabindex="0" aria-label="side ${k + 1}"/>`;
    }).join("");
  }
  return `<svg class="sc-svg" viewBox="0 0 120 120" role="img" aria-label="${shape}"><polygon class="sc-poly" points="${poly}" fill="${fill}" stroke="#5A3E72" stroke-width="3" stroke-linejoin="round"/>${hits}</svg>`;
};
KIT.shapecount = {
  html: () => `<div class="lw-task" aria-live="polite"></div><div class="sc-stage"></div><div class="lw-count sc-count" aria-live="polite"></div>`,
  bind(root, w, api) {
    let lit = new Set();
    const stage = root.querySelector(".sc-stage"), task = root.querySelector(".lw-task"), count = root.querySelector(".sc-count");
    const run = tapStages(root, w, api, {
      paint: s => { lit = new Set(); task.innerHTML = `👉 ${esc(s.text)}`; stage.innerHTML = shapeSVG(s.shape, s.count); count.textContent = `Counted: 0 / ${s.n}`; },
      lock: () => stage.querySelectorAll(".sc-hit").forEach(b => { b.classList.add("done"); b.removeAttribute("data-tgt"); }) });
    const tap = btn => {
      const s = run.stage(), k = +btn.dataset.i;
      if (lit.has(k)) return api.say("You already counted that one! Tap a new " + (s.count === "sides" ? "side" : "corner") + " 👆");
      lit.add(k); btn.classList.add("on"); WR.sfx("tap");
      count.textContent = `Counted: ${lit.size} / ${s.n}`;
      if (lit.size < s.n) return;
      run.finish(`✅ A ${s.shape} has ${s.n} ${s.count}!`, "🎉 Sides and corners counted!");
    };
    dragTap(root, { onTapTarget: tap, nothing: () => api.say("Tap each " + (run.stage().count === "sides" ? "side" : "corner") + " to count 👆") });
  } };

// 🌷 walk the fence (MA-4b perimeter): tap every side of a garden once; the running sum builds the perimeter.
// a stage lists the corners in order from (0, 0) (tools/lesson_build.py checks every side is straight and big enough to tap);
// the garden shrinks on short landscape screens (45vh tall) but never below 220 px wide
const fenceSides = pts => pts.map((p, k) => { const q = pts[(k + 1) % pts.length];
  return { x: (p[0] + q[0]) / 2, y: (p[1] + q[1]) / 2, len: Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1]), across: p[1] === q[1] }; });
const fenceHTML = s => {
  const W = Math.max(...s.pts.map(p => p[0])), H = Math.max(...s.pts.map(p => p[1])), pc = (v, d) => +(100 * v / d).toFixed(3) + "%";
  const sides = fenceSides(s.pts).map((e, k) => `<button class="fn-side ${e.across ? "across" : "down"}" data-tgt data-i="${k}" aria-label="fence side ${e.len} ${s.unit}"
    style="left:${pc(e.x, W)};top:${pc(e.y, H)};${e.across ? "width" : "height"}:max(44px, calc(${pc(e.len, e.across ? W : H)} - 14px))"><span>${e.len} ${s.unit}</span></button>`).join("");
  return `<div class="fn-fig" style="aspect-ratio:${W} / ${H};width:min(100%, max(220px, calc(45vh * ${W} / ${H})))"><svg class="fn-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
    <polygon class="fn-in" data-tgt data-in="1" points="${s.pts.map(p => p.join(",")).join(" ")}"/></svg><span class="fn-veg" aria-hidden="true">🥕🥬</span>${sides}</div>`;
};
KIT.fence = {
  html: () => `<div class="lw-task" aria-live="polite"></div><div class="fn-wrap"></div><div class="lw-count fn-sum" aria-live="polite"></div>`,
  bind(root, w, api) {
    let walked = [];
    const wrap = root.querySelector(".fn-wrap"), task = root.querySelector(".lw-task"), sum = root.querySelector(".fn-sum");
    const run = tapStages(root, w, api, {
      paint: s => { walked = []; task.innerHTML = `👉 ${esc(s.text)}`; wrap.innerHTML = fenceHTML(s); sum.textContent = `Fence walked: 0 ${s.unit}`; },
      lock: () => wrap.querySelectorAll("[data-tgt]").forEach(b => { b.removeAttribute("data-tgt"); if (b.tagName === "BUTTON") b.disabled = true; }) });
    const tap = t => {
      const s = run.stage();
      if (t.dataset.in) return api.miss("That's the inside of the garden! The perimeter is the fence all the way around the edge. Tap a side of the fence.", wrap);
      const k = +t.dataset.i, E = fenceSides(s.pts);
      if (walked.includes(k)) return api.miss("Mog already walked that side! Count each side only once. Tap a side that isn't green yet.", t);
      walked.push(k); t.classList.add("on"); WR.sfx("tap");
      const parts = walked.map(j => E[j].len), got = parts.reduce((a, b) => a + b, 0);
      sum.textContent = `Fence walked: ${parts.join(" + ")} = ${got} ${s.unit}`;
      if (walked.length < E.length) return;
      run.finish(`✅ All the way around: the perimeter is ${got} ${s.unit}!`, "🎉 You walked the whole fence!");
    };
    dragTap(root, { onTapTarget: tap, nothing: () => api.say("Tap each side of the fence 👆") });
  } };

LN.KIT = KIT;

/* ---------- the lesson screen ---------- */
let S = null;
const STEPS = [["hook", "Story"], ["discover", "Try it"], ["rule", "The rule"], ["check", "Your turn"], ["done", "Scroll"]];
const dotOf = step => ({ hook: 0, discover: 1, rule: 2, check: 3, reteach: 2, rdiscover: 1, done: 4 }[step]);
const dots = step => `<div class="ln-dots" aria-label="Step ${dotOf(step) + 1} of 5: ${STEPS[dotOf(step)][1]}">${STEPS.map(([k, l], j) => `<span class="${j < dotOf(step) ? "was" : j === dotOf(step) ? "on" : ""}"><i></i><small>${l}</small></span>`).join("")}</div>`;
LN.open = async (id, o = {}) => {
  let L; try { L = await LN.full(id); } catch (e) { if (e && e.wrMiss) return WR.noteMiss(); throw e; }
  if (!L) return WR.toast("📜 Coming soon!");
  WR.go("learn", { id, L, back: o.back || null, recall: o.recall === true || (o.recall !== false && LN.isDue(id)) });
};
WR.screens.learn = arg => {
  const L = arg.L, maths = LN.isMath(L), recall = !!arg.recall;
  S = { id: arg.id, L, maths, back: arg.back, recall, step: recall ? "check" : "hook", round: 1, i: 0, right: 0, retaught: false, misses: 0, picked: [] };
  if (maths && WR.Math) WR.Math.loadKatex(); LN.openCount(L.id); show();
};
const leave = () => { const b = S && S.back; WR.Voice.stop(); S = null; if (b) WR.go(b.screen, b.arg); else WR.go("scrolls"); };
const frame = (body, cls = "") => `<div class="lesson-bg ln-bg"></div><div class="ln fade-in ${cls}">
  <div class="row lesson-top ln-top"><button class="btn ghost small" id="lnQuit">← Leave</button><b class="title">${S.L.icon} ${esc(S.L.title)}</b></div>
  ${dots(S.step)}<div class="card ln-card">${body}</div></div>`;
function show() {
  const L = S.L, m = S.maths; let body = "", line = "";
  if (S.step === "hook") {
    body = `${artImg(L)}<div class="ln-line">${hear("lnHear")}<p class="ln-say">${tx(L.hook.text, m)}</p></div>
      <div class="ln-next"><button class="btn mint" id="lnGo">🖐️ Let's find out! →</button></div>`; line = L.hook.say;
  } else if (S.step === "discover" || S.step === "rdiscover") {
    const w = S.step === "discover" ? L.discover : L.reteach.discover;
    body = `<div class="ln-line">${hear("lnHear")}<p class="ln-say"><b>${S.step === "discover" ? "🖐️ Try it!" : "🖐️ Try it this way!"}</b> ${tx(w.text, m)}</p></div>
      <div class="lw lw-${w.kind}" id="lnW">${KIT[w.kind].html(w)}</div><div class="ln-msg" id="lnMsg" aria-live="polite"></div>
      <div class="ln-next"><button class="btn mint" id="lnGo" hidden>${S.step === "discover" ? "💡 What did we find? →" : "✏️ Try 3 new ones →"}</button></div>`; line = w.say;
  } else if (S.step === "rule") {
    body = `<div class="ln-found">🌟 You found it!</div><div class="ln-line">${hear("lnHear")}<p class="ln-say ln-rule">${tx(L.rule.text, m)}</p></div>
      <ul class="ln-ex">${L.rule.examples.map((e, k) => `<li><button class="btn ghost small ln-exsay" data-k="${k}" aria-label="Listen to the example">🔊</button><span>${tx(e, m)}</span></li>`).join("")}</ul>
      <div class="ln-next"><button class="btn mint" id="lnGo">✏️ Your turn! →</button></div>`; line = L.rule.say;
  } else if (S.step === "reteach") {
    body = `<div class="ln-found">🌈 Let's try it another way</div><div class="ln-line">${hear("lnHear")}<p class="ln-say ln-rule">${tx(L.reteach.text, m)}</p></div>
      <ul class="ln-ex">${(L.reteach.examples || []).map(e => `<li><span>${tx(e, m)}</span></li>`).join("")}</ul>
      <div class="ln-next"><button class="btn mint" id="lnGo">${L.reteach.discover ? "🖐️ Show me →" : "✏️ Try 3 new ones →"}</button></div>`; line = L.reteach.say;
  } else if (S.step === "check") {
    const q = (S.round === 1 ? L.check : L.check2)[S.i]; S.q = q; S.opts = WR.shuffle(q.options);
    body = `${S.recall && !S.i && S.round === 1 ? `<div class="ln-qnum">🔁 Recall · day ${((LN.rec(S.id) || {}).s || 0) ? "7" : "1"}</div>` : ""}<div class="ln-qnum">${S.round === 2 ? "🌈 New try · " : ""}Question ${S.i + 1} of 3</div>
      ${q.text ? `<div class="ln-story">${tx(q.text, m)}</div>` : ""}<div class="ln-line">${hear("lnHear")}<p class="ln-q">${tx(q.q, m)}</p></div>
      <div class="opts ln-opts">${S.opts.map((o, k) => `<button class="opt" data-k="${k}"><span class="k">${"ABC"[k]}</span>${tx(o, m)}</button>`).join("")}</div><div id="lnFb" aria-live="polite"></div>`;
    line = q.say;
  }
  WR.view(frame(body));
  const art = WR.$(".ln-bg"); if (art && L.art) art.style.backgroundImage = `url('assets/web/${L.art}.webp')`;
  WR.$("#lnQuit").onclick = leave;   // a lesson is 2 minutes: leaving loses nothing saved, so no "are you sure?"
  const hb = WR.$("#lnHear"); if (hb) hb.onclick = () => speak(line);
  document.querySelectorAll(".ln-exsay").forEach(b => b.onclick = () => speak((L.rule.sayEx || [])[+b.dataset.k]));
  const go = WR.$("#lnGo");
  if (S.step === "hook") go.onclick = () => { S.step = "discover"; show(); };
  else if (S.step === "rule") go.onclick = () => { S.step = "check"; S.i = 0; S.right = 0; show(); };
  else if (S.step === "reteach") go.onclick = () => { if (L.reteach.discover) S.step = "rdiscover"; else { S.step = "check"; S.round = 2; S.i = 0; S.right = 0; } show(); };
  else if (S.step === "discover" || S.step === "rdiscover") bindWidget(S.step === "discover" ? L.discover : L.reteach.discover, go);
  else if (S.step === "check") bindCheck();
  if (auto() && line && !widgetSpeaks(S)) speak(line);
  if (S.maths && WR.Math && WR.Math.upgrade) setTimeout(() => WR.Math.upgrade(WR.$("#main")), 400);
}
const SPEAKS = new Set(["spots", "frac", "findword", "spellhear", "hearpic", "shapecount", "units"]);  // widgets that read each task/item themselves
const widgetSpeaks = s => { const w = s.step === "discover" ? s.L.discover : s.step === "rdiscover" ? s.L.reteach.discover : null; return !!w && SPEAKS.has(w.kind); };
function bindWidget(w, go) {
  const root = WR.$("#lnW"), msg = WR.$("#lnMsg"); let misses = 0, finished = false;
  const put = (html, cls) => { msg.innerHTML = `<div class="explain ${cls || ""}">${html}</div>`; };
  const api = {
    say: t => put(esc(t), "soft"),
    sayLine: t => auto() && speak(t),
    good: (t, raw) => { WR.sfx("good"); put(raw ? t : esc(t), "good"); },
    miss: (t, el) => { WR.sfx("bad"); shake(el); misses++; S.misses++;
      put(`${esc(t)}${misses >= 2 ? `<div class="ln-hint">💡 ${tx(w.hint, S.maths)}</div>` : ""}`, "bad"); },
    done: t => { if (finished) return; finished = true; if (t) put(tx(t, S.maths), "good"); WR.sfx("level"); go.hidden = false; go.classList.add("glow");
      setTimeout(() => go.scrollIntoView({ behavior: "smooth", block: "nearest" }), 150);
      go.onclick = () => { if (S.step === "discover") S.step = "rule"; else { S.step = "check"; S.round = 2; S.i = 0; S.right = 0; } show(); }; } };
  KIT[w.kind].bind(root, w, api);
}
function bindCheck() {
  const q = S.q, right = q.options[q.answer];
  document.querySelectorAll(".ln-opts .opt").forEach(b => b.onclick = () => {
    if (S.answered) return; S.answered = true;
    const pick = S.opts[+b.dataset.k], ok = pick === right; if (ok) S.right++;
    S.picked.push({ round: S.round, i: S.i, ok });
    document.querySelectorAll(".ln-opts .opt").forEach(x => { x.disabled = true; if (S.opts[+x.dataset.k] === right) x.classList.add("right"); });
    if (!ok) b.classList.add("wrong");
    WR.sfx(ok ? "good" : "bad");
    WR.tally("learn:" + S.id, ok);   // the report's tally (no stars for checks)
    const note = !ok && q.notes && q.notes[pick];
    const last = S.i >= 2;
    WR.$("#lnFb").innerHTML = `<div class="explain ${ok ? "good" : "bad"}">${ok ? "✅ Yes!" : "💭 Not quite."}${note ? `<div class="why-not">🤔 <b>Why not “${tx(pick, S.maths)}”?</b> ${tx(note, S.maths)}</div>` : ""}<div class="why-rule">💡 ${tx(q.explain, S.maths)}</div></div>
      <div class="ln-next"><button class="btn ${ok ? "mint" : ""}" id="lnNext">${last ? "See my scroll ✨" : "Next →"}</button></div>`;
    if (S.maths && WR.Math && WR.Math.upgrade) WR.Math.upgrade(WR.$("#lnFb"));
    WR.tapOnce(WR.$("#lnNext"), () => { WR.Voice.stop(); S.answered = false;
      if (!last) { S.i++; return show(); }
      if (S.round === 1 && S.right < PASS && !S.recall) { S.retaught = true; S.round1 = S.right; S.step = "reteach"; return show(); }
      finish(); });
    WR.$("#lnNext").scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}
function finish() {
  const L = S.L, d = st(), prev = d.done[L.id], passed = S.right >= PASS, firstTry = passed && !S.retaught;
  const r = Object.assign({ crowns: 0, best: 0, pass: false, tries: 0, reteach: 0, first: 0 }, prev || {});
  r.crowns = Math.max(r.crowns, crownsFor(S.right)); r.best = Math.max(r.best, S.right); r.tries++;
  if (S.retaught) r.reteach++;
  if (passed && !r.pass) r.first1 = firstTry;          // passed without the re-teach the first time it was passed
  r.pass = r.pass || passed; r.stuck = !r.pass; r.at = Date.now(); r.first = r.first || r.at;
  if (S.recall) LN.scheduleRecall(r, passed, r.at); else if (passed) LN.schedulePass(r, r.at);
  d.done[L.id] = r; d.rounds = (d.rounds || 0) + 1;
  let stars = 0; if (passed) stars = WR.awardStars("learn", L.id + "/pass", STARS, { kind: "fresh", quiet: true });
  if (!prev) WR.state.lessonsDone = (WR.state.lessonsDone || 0) + 1;
  const streak = WR.activityDone(!prev), lv = WR.petGainXP(prev ? 2 : 10);
  WR.save(); WR.renderTop();
  S.step = "done";
  const crowns = crownsFor(S.right);
  const head = S.recall ? (passed ? "Still with you! 🔁🌟" : "We'll try again soon 🫶")
    : (passed ? (firstTry ? "You learned it! 🌟" : "You got it the second way! 🌈") : "Good try! Your scroll is saved 🫶");
  WR.view(frame(`<div class="ln-done">
    <h1>${head}</h1>
    <div class="ln-scroll" role="img" aria-label="Lesson scroll: ${esc(L.title)}">${artImg(L, "ln-scroll-art")}<b>${L.icon} ${esc(L.title)}</b><p>${tx(L.rule.text, S.maths)}</p></div>
    <div class="big">${"👑".repeat(crowns)}${"<span style='opacity:.2'>👑</span>".repeat(3 - crowns)}</div>
    <h2>${S.right} / 3 right${S.retaught ? ` <small class="muted">(after the new way)</small>` : ""}</h2>
    <p class="muted" style="font-weight:800">${stars ? `⭐ +${stars} stars for your first scroll!` : passed ? "⭐ Stars come once per scroll — you already have this one!" : "Practise a little, then come back for your ⭐ stars!"}${streak ? ` · 🔥 streak ${WR.state.streak.count}` : ""}</p>
    <p class="ln-bag">🎒 The scroll is in your Backpack. Tap 📜 in a practice round to read it again.</p>
    <div class="next-row"><button class="btn mint" id="lnPractice">${S.maths ? "🔢 Practise it now →" : "✏️ Practise it now →"}</button><div class="sec"><button class="btn ghost small" id="lnAgain">↻ Learn it again</button><button class="btn ghost small" id="lnBag">🎒 Backpack</button></div></div>
  </div>`));
  if (passed) WR.confetti(); WR.sfx(lv ? "level" : "good");
  WR.$("#lnQuit").onclick = leave;
  WR.$("#lnAgain").onclick = () => LN.open(L.id, { back: S.back });
  WR.$("#lnBag").onclick = () => WR.go("scrolls", S.back);
  WR.$("#lnPractice").onclick = () => LN.practice(L);
  if (S.maths && WR.Math && WR.Math.upgrade) setTimeout(() => WR.Math.upgrade(WR.$("#main")), 300);
}
LN.practice = L => { WR.Voice.stop(); S = null;
  if (LN.isMath(L)) return WR.Math.startLesson({ topic: L.at.topic });
  const k = WR.SKILLS.find(x => x.id === L.at.skill), r = WR.realmById(L.at.realm);
  WR.startLesson({ realm: r.id, skill: k.id, key: k.id, title: `${k.name} · ${r.modeName}` }); };
WR.stopLearn = () => { S = null; };
LN._S = () => S;   // test hook

/* ---------- 📜 a scroll (modal): from the Backpack or a practice round's hint ---------- */
LN.openScroll = async (id, o = {}) => {
  const L = await LN.full(id); if (!L) return; const m = LN.isMath(L), r = LN.rec(id);
  if (m && WR.Math) WR.Math.loadKatex();
  const bg = WR.modal(`<div class="ln-scroll-modal"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><b class="title">📜 ${L.icon} ${esc(L.title)}</b><button class="btn ghost small" id="scClose" aria-label="Close">✕</button></div>
    ${artImg(L, "ln-scroll-art")}<div class="ln-line">${hear("scHear")}<p class="ln-say">${tx(L.rule.text, m)}</p></div>
    <ul class="ln-ex">${L.rule.examples.map(e => `<li><span>${tx(e, m)}</span></li>`).join("")}</ul>
    ${r ? "" : `<p class="muted" style="font-weight:800">✨ You haven't done this lesson yet — it takes 2 minutes!</p>`}
    <div class="row" style="justify-content:center;gap:8px;margin-top:8px">${o.inRound ? `<button class="btn mint" id="scBack">Back to my question →</button>` : `<button class="btn mint" id="scPlay">${r ? "↻ Learn it again" : "📜 Learn it now"}</button>`}</div></div>`,
    (bg, close) => {
      bg.querySelector("#scClose").onclick = () => { WR.Voice.stop(); close(); };
      bg.querySelector("#scHear").onclick = () => speak(L.rule.say);
      const b = bg.querySelector("#scBack"); if (b) b.onclick = () => { WR.Voice.stop(); close(); };
      const p = bg.querySelector("#scPlay"); if (p) p.onclick = () => { close(); LN.open(id, { back: o.back }); };
    });
  bg.classList.add("ln-scroll-bg");
  if (m && WR.Math && WR.Math.upgrade) setTimeout(() => WR.Math.upgrade(bg), 300);
  return bg;
};
// 🔗 any [data-scroll] button (hint links in practice rounds) opens its scroll over the round
document.addEventListener("click", e => { const b = e.target.closest("[data-scroll]"); if (!b) return; e.preventDefault(); e.stopPropagation(); WR.sfx("tap"); LN.openScroll(b.dataset.scroll, { inRound: true }); }, true);
LN.scrollBtn = (l, cls = "") => l ? `<button class="btn ghost small ln-link ${cls}" data-scroll="${l.id}" aria-label="Lesson scroll: ${esc(l.title)}">📜 ${cls.includes("corner") ? "" : `Scroll: ${esc(l.title)}`}</button>` : "";


LN.recLabel = r => !r ? "✨ New" : r.pass ? "👑".repeat(r.crowns || 1) : "🧩 try again";
/* ---------- 📜 Learn chips on skill / topic cards, and the soft nudge ---------- */
// chip(list, back): one lesson → it opens; several → a little list sheet. "✨ New" until the first lesson there is done.
// o.corner: a round 📜 badge in the card's top corner (realm skill cards: it adds no height, so the 4 skills still fit
// the first phone screen); otherwise a full-width "📜 Learn" chip at the bottom of the card (maths topic cards)
LN.chipHTML = (list, o = {}) => { if (!list || !list.length) return "";
  const done = list.filter(l => LN.rec(l.id)).length, all = done === list.length, due = list.some(l => LN.isDue(l.id));
  const badge = due ? "🔁" : (list.length > 1 && done ? `${done}/${list.length}` : all ? "✓" : "✨");
  return `<button class="learn-chip${o.corner ? " corner" : ""}${done ? "" : " new"}${all ? " all" : ""}${due ? " due" : ""}" data-learn="${list.map(l => l.id).join(",")}" aria-label="Learn: ${list.length} lesson${list.length > 1 ? "s" : ""}, ${due ? "recall due" : done ? done + " done" : "new"}">📜${o.corner ? "" : " Learn"}<span class="ln-new">${badge}</span></button>`; };
LN.bindChips = (root, back) => (root || document).querySelectorAll(".learn-chip[data-learn]").forEach(c => c.onclick = e => {
  e.stopPropagation(); WR.sfx("tap"); const ids = c.dataset.learn.split(",");
  if (ids.length === 1) return LN.open(ids[0], { back });
  LN.pickSheet(ids, back); });
LN.pickSheet = (ids, back) => WR.modal(`<h2>📜 Lessons here</h2><div class="ln-pick">${ids.map(id => { const l = LN.get(id), r = LN.rec(id);
    return `<button class="card ln-pick-row" data-id="${id}"><span class="ico">${l.icon}</span><b>${esc(l.title)}</b><span class="ln-st">${LN.isDue(id) ? "🔁" : LN.recLabel(r)}</span></button>`; }).join("")}</div>
    <button class="btn ghost small" id="pkClose" style="margin-top:10px">Close</button>`, (bg, close) => {
    bg.querySelectorAll(".ln-pick-row").forEach(b => b.onclick = () => { close(); LN.open(b.dataset.id, { back }); });
    bg.querySelector("#pkClose").onclick = close; });
// a practice result under the pass mark (WR.PASS.mark, BRIEF-T5B) offers the first lesson there not yet passed
LN.nudgeFor = list => (list || []).find(l => LN.isDue(l.id)) || (list || []).find(l => !(LN.rec(l.id) || {}).pass) || null;
LN.nudgeHTML = l => l ? `<div class="card ln-nudge"><span class="ico">📜</span><div><b>Want a quick lesson?</b><small>${l.icon} ${esc(l.title)} · 2 minutes</small></div><button class="btn small mint" id="lnNudge" data-id="${l.id}">Learn it →</button></div>` : "";
LN.bindNudge = back => { const b = WR.$("#lnNudge"); if (b) b.onclick = () => LN.open(b.dataset.id, { back }); };

/* ---------- 🎒 the Backpack: every Lesson Scroll, earned or waiting ---------- */
const groupsOf = () => { const g = []; const add = (key, label, l) => { let x = g.find(y => y.key === key); if (!x) g.push(x = { key, label, list: [] }); x.list.push(l); };
  IDX.forEach(l => { if (LN.isMath(l)) { const gr = gradeOf(l); add("m" + gr, `🔢 Maths · Grade ${gr}`, l); }
    else { const r = WR.realmById(l.at.realm); add("e" + l.at.realm, `${r ? r.emoji : "🏰"} English · ${r ? r.level + " " + r.name : l.at.realm}`, l); } });
  return g; };
WR.screens.scrolls = back => {
  const n = LN.earned();
  WR.view(`<div class="fade-in scrolls"><div class="row lesson-top" style="margin:6px 0 8px"><button class="btn ghost small" id="bpBack">← Back</button><b class="title">🎒 My Backpack</b></div>
    <div class="card bp-head"><div style="font-size:2.4rem" aria-hidden="true">🎒</div><div><b class="title" style="font-size:1.2rem">Lesson Scrolls ${n}/${IDX.length}</b><div class="muted" style="font-weight:700">Every lesson you finish leaves a scroll here. Tap one to read it again!</div></div></div>
    ${groupsOf().map(g => `<h2 class="realm-sec">${esc(g.label)}</h2><div class="bp-shelf">${g.list.map(l => { const r = LN.rec(l.id);
      return `<button class="card bp-scroll ${r ? (r.pass ? "got" : "stuck") : "todo"}" data-id="${l.id}" aria-label="${esc(l.title)}${r ? "" : ", not learned yet"}">${artImg(l, "bp-art")}<span class="bp-ico">${l.icon}</span><b>${esc(l.title)}</b><small>${r ? (r.pass ? "👑".repeat(r.crowns || 1) : "🧩 try again") : "✨ Learn it"}</small></button>`; }).join("")}</div>`).join("")}</div>`);
  WR.$("#bpBack").onclick = () => back ? WR.go(back.screen, back.arg) : WR.go("home");
  document.querySelectorAll(".bp-scroll").forEach(b => b.onclick = () => { WR.sfx("tap"); LN.rec(b.dataset.id) ? LN.openScroll(b.dataset.id, { back: { screen: "scrolls", arg: back } }) : LN.open(b.dataset.id, { back: { screen: "scrolls", arg: back } }); });
};
LN.bagPill = (id = "bagPill") => IDX.length ? `<button class="chip bag-pill" id="${id}" aria-label="My Backpack: ${LN.earned()} of ${IDX.length} lesson scrolls">🎒 ${LN.earned()}/${IDX.length}</button>` : "";

/* ---------- 👪 Grown-ups: per-lesson progress ---------- */
LN.statusOf = id => { const r = LN.rec(id); if (!r) return ["○", "not started"]; if (!r.pass) return ["🧩", "still tricky"]; return r.reteach && !r.first1 ? ["🔁", "learned after the second explanation"] : ["✅", "learned first time"]; };
LN.summary = () => { const c = { done: 0, stuck: 0, re: 0 }; IDX.forEach(l => { const r = LN.rec(l.id); if (!r) return; if (r.pass) { c.done++; if (r.reteach && !r.first1) c.re++; } else c.stuck++; }); return c; };
LN.grownLine = () => { if (!IDX.length) return ""; const c = LN.summary();
  return `<p class="muted ln-grown-line" style="font-weight:800">📜 Lessons: ${c.done}/${IDX.length} learned${c.re ? ` · ${c.re} after a second explanation` : ""}${c.stuck ? ` · ${c.stuck} still tricky` : ""}</p>`; };
LN.reportCard = () => { if (!IDX.length) return "";
  return `<div class="card rp-card ln-report"><h3>📜 Lessons</h3><p class="muted" style="font-weight:700;margin:.2em 0 .5em">Short story lessons in front of the practice. ✅ learned first time · 🔁 after a second explanation · 🧩 still tricky · ○ not started</p>
    <table class="ln-rtab"><tbody>${IDX.map(l => { const [ic, why] = LN.statusOf(l.id), r = LN.rec(l.id);
      return `<tr><td aria-label="${why}">${ic}</td><td><b>${esc(l.title)}</b><small>${LN.isMath(l) ? "Maths " + "G" + gradeOf(l) : "English " + esc(String(l.at.realm).toUpperCase())}</small></td><td>${r ? `${r.best}/3 · ${r.tries}×` : ""}</td></tr>`; }).join("")}</tbody></table></div>`; };
// 👪 the report screen draws every registered extra card (js/report.js WR.reportCards)
(WR.reportCards = WR.reportCards || []).push(LN.reportCard);
})();
