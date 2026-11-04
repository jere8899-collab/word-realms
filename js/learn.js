/* 📜 Lessons (LESSONS-PLAN.md): short story-led lessons that sit in front of a skill node (English realm skill cards) or a
   maths topic card. One idea, 2–3 minutes:
     hook (a painted story) → discover (a hands-on widget: drag OR tap, the rule is NOT shown yet) → the rule ("you found it!")
     → 3 quick checks (a why-not note for every wrong option) → passed (2+/3) ? the Scroll : a re-teach (a different
     explanation + its own widget) → 3 NEW checks → the Scroll either way.
   Content: data/lessons/<pack>.json written by tools/lesson_build.py from tools/lessons/*.py (validated there);
   data/lessons/index.json lists every lesson ({ id, pack, title, icon, at: { realm, skill } | { topic }, art, match }).
   Save: WR.block("learn") = { done: { id: { crowns, best, pass, tries, reteach, stuck, at, first } }, opened: { id: n }, rounds }
   (inside wordRealms.save.v1, so it cloud-syncs with the whole save; crowns count in the cloud score like other blocks).
   Stars: +5⭐ once ever for a lesson's first pass (kind "fresh", key "<id>/pass"); replays and check answers pay 0⭐.
   Practice is never locked: a lesson is a soft nudge (a ✨ New chip, a "Learn it" button on a weak result, 📜 hint links). */
(function () {
const WR = window.WR, esc = s => WR.esc(s);
const LN = WR.Learn = {};
const PASS = 2, STARS = 5;           // 2 of 3 checks right passes; the first pass ever pays 5⭐
let IDX = [], loading = null; const PACKS = {};
/* ---------- the index (loaded with the game data, so chips can show at once) ---------- */
LN.loadIndex = () => loading || (loading = fetch("data/lessons/index.json").then(r => r.ok ? r.json() : { lessons: [] })
  .then(d => { IDX = (d && d.lessons) || []; return IDX; }).catch(() => (IDX = [])));
const init0 = WR.init;
WR.init = async (...a) => { const p = LN.loadIndex(); const r = await init0(...a); await p; return r; };
LN.all = () => IDX.slice();
LN.get = id => IDX.find(x => x.id === id) || null;
LN.pack = async p => PACKS[p] || (PACKS[p] = await fetch(`data/lessons/${p}.json`).then(r => { if (!r.ok) throw new Error("lesson pack " + p); return r.json(); }));
LN.full = async id => { const i = LN.get(id); if (!i) return null; const pk = await LN.pack(i.pack); return (pk.lessons || []).find(x => x.id === id) || null; };
const st = () => WR.block("learn");
LN.rec = id => st().done[id] || null;
LN.isMath = l => !!(l && l.at && l.at.topic);
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
const tx = (s, maths) => maths && WR.Math ? WR.Math.html(s) : esc(s).replace(/\n/g, "<br>");
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
const shake = el => { if (!el) return; el.classList.remove("ln-shake"); void el.offsetWidth; el.classList.add("ln-shake"); };

/* ---------- the widget kit (LESSONS-PLAN.md §2) ----------
   each kind: html(w) and bind(root, w, api); api.good(msg) / api.miss(msg, el) (2 misses show the widget's hint) / api.done(msg) */
const KIT = {};
KIT.sort = {
  html: w => `<div class="lw-pool" aria-label="Cards to sort">${WR.shuffle(w.items.map((it, k) => ({ it, k }))).map(({ it, k }) => `<button class="lw-chip" data-src data-k="${k}">${it.icon ? `<span aria-hidden="true">${it.icon}</span> ` : ""}${esc(it.t)}</button>`).join("")}</div>
    <div class="lw-bins b${w.bins.length}">${w.bins.map(b => `<div class="lw-bin" data-tgt data-b="${esc(b.id)}" role="button" tabindex="0" aria-label="${esc(b.label)} basket"><b>${b.icon || ""} ${esc(b.label)}</b><div class="lw-in"></div></div>`).join("")}</div>`,
  bind(root, w, api) {
    let left = w.items.length;
    dragTap(root, { nothing: () => api.say("Tap a card first, then a basket 👆"),
      onDrop(src, bin) { const it = w.items[+src.dataset.k];
        if (it.bin !== bin.dataset.b) return api.miss(`Hmm! ${it.why}`, src);
        src.disabled = true; src.removeAttribute("data-src"); src.classList.add("placed"); bin.querySelector(".lw-in").appendChild(src);
        left--; api.good(`✅ ${it.why}`); if (!left) api.done(); } });
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
KIT.suffix = {
  html: w => `<div class="lw-stamps"><button class="lw-stamp" data-src aria-label="the ${esc(w.stamp)} stamp">🔖 -${esc(w.stamp)}</button></div>
    <div class="lw-words">${w.items.map((it, k) => `<button class="lw-word" data-tgt data-k="${k}"><span class="n">${esc(it.pre)}</span> ${esc(it.base)}<b class="sfx"></b></button>`).join("")}</div>`,
  bind(root, w, api) {
    let left = w.items.filter(x => x.need).length;
    const stampOn = word => { const it = w.items[+word.dataset.k];
      if (!it.need) return api.miss(`Oops! ${it.why}`, word);
      word.querySelector(".sfx").textContent = w.stamp; word.disabled = true; word.removeAttribute("data-tgt"); word.classList.add("placed");
      left--; api.good(`✅ ${it.why}`);
      if (!left) { root.querySelectorAll(".lw-word:not(.placed)").forEach(x => { x.classList.add("no-s"); x.disabled = true; }); api.done(); } };
    dragTap(root, { onDrop: (src, word) => stampOn(word), onTapTarget: stampOn });
  } };
// 🧸 place a token on/under/in a little scene (drawn in CSS: a table + basket, or a bed + toy box)
const SCENE = {
  table: { draw: `<div class="sc-table-top"></div><div class="sc-leg l"></div><div class="sc-leg r"></div><div class="sc-basket"></div>`,
    spots: { on: "the table top", under: "under the table", in: "inside the basket" } },
  bed: { draw: `<div class="sc-bed-head"></div><div class="sc-bed"></div><div class="sc-bed-leg l"></div><div class="sc-bed-leg r"></div><div class="sc-box"></div>`,
    spots: { on: "the top of the bed", under: "under the bed", in: "inside the toy box" } } };
KIT.spots = {
  html: w => { const s = SCENE[w.scene];
    return `<div class="lw-task" aria-live="polite"></div><div class="lw-scene sc-${w.scene}">${s.draw}${Object.entries(s.spots).map(([k, lab]) => `<button class="lw-spot sp-${k}" data-tgt data-w="${k}" aria-label="${lab}"><span aria-hidden="true">✨</span></button>`).join("")}
      <button class="lw-token" data-src aria-label="${esc(w.token === "pet_bunny" ? "Puffbun" : "your friend")}">${WR.img(w.token, "") || "🐰"}</button></div>`; },
  bind(root, w, api) {
    let i = 0; const task = root.querySelector(".lw-task"), tok = root.querySelector(".lw-token"), scene = root.querySelector(".lw-scene");
    const show = () => { task.innerHTML = `👉 ${esc(w.tasks[i].text)}`; };
    show(); api.sayLine && setTimeout(() => api.sayLine(w.tasks[0].say), 0);
    const put = spot => { const t = w.tasks[i], k = spot.dataset.w;
      if (k !== t.word) return api.miss(`That is ${k.toUpperCase()}! ${t.text}`, spot);
      spot.appendChild(tok); tok.classList.add("in-spot"); api.good(`✅ ${k.toUpperCase()}!`); i++;
      if (i >= w.tasks.length) { tok.disabled = true; scene.classList.add("all-done"); task.textContent = "🎉 You did all three!"; api.done(); }
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
      api.good(`✅ ${want} = ${n[100]} hundreds, ${n[10]} tens and ${n[1]} ones!`); i++;
      if (i >= w.targets.length) { root.querySelectorAll("[data-src], .pv-minus").forEach(b => b.disabled = true); api.done(); } else setTimeout(show, 900); };
    const add = v => { if (n[v] >= 9) return api.miss(v === 100 ? "That's plenty of hundreds!" : `10 ${v === 1 ? "ones make 1 ten" : "tens make 1 hundred"}! Use a bigger block instead.`, mat);
      n[v]++; WR.sfx("tap"); paint(); check(); };
    dragTap(root, { instant: () => mat, onDrop: src => add(+src.dataset.v) });
    root.querySelectorAll(".pv-minus").forEach(b => b.onclick = e => { e.stopPropagation(); const v = +b.dataset.minus; if (n[v]) { n[v]--; paint(); check(); } });
  } };
// 🍬 adding with regrouping: loose ones go in a 10-slot jar; 10 in the jar bundle into a ten-bag
KIT.regroup = {
  html: () => `<div class="lw-rg"><div class="rg-tens" data-tgt data-z="tens" role="button" tabindex="0" aria-label="the tens shelf"><small>tens (bags of 10)</small><div class="rg-bags"></div></div>
    <div class="rg-jar" data-tgt data-z="ones" role="button" tabindex="0" aria-label="the ones jar"><small>ones jar</small><div class="rg-slots"></div></div></div>
    <div class="rg-new"><small>new gumdrops to put away:</small><div class="rg-pile"></div></div>
    <button class="btn peach rg-bundle" hidden>🎀 Bundle 10 into a ten-bag</button>
    <div class="lw-count" aria-live="polite"></div>`,
  bind(root, w, api) {
    const S = { tens: Math.floor(w.a / 10), ones: w.a % 10, inT: Math.floor(w.b / 10), inO: w.b % 10 };
    const pile = root.querySelector(".rg-pile"), bundle = root.querySelector(".rg-bundle"), jar = root.querySelector(".rg-jar"), shelf = root.querySelector(".rg-tens");
    const paint = () => {
      root.querySelector(".rg-bags").innerHTML = '<span class="rg-bag" aria-hidden="true">🎀</span>'.repeat(S.tens);
      root.querySelector(".rg-slots").innerHTML = Array.from({ length: 10 }, (_, k) => `<i class="${k < S.ones ? "on" : ""}">${k < S.ones ? "🍬" : ""}</i>`).join("");
      pile.innerHTML = '<button class="lw-chip rg-ten" data-src data-t="ten" aria-label="a bag of ten">🎀 10</button>'.repeat(S.inT) + '<button class="lw-chip rg-one" data-src data-t="one" aria-label="one gumdrop">🍬</button>'.repeat(S.inO);
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
const groupHTML = (w, n, cls, label) => `<div class="lw-pile" aria-label="${label}">${Array.from({ length: n }, () => `<button class="lw-chip lw-item" data-src aria-label="${esc(w.item)}">${w.item}</button>`).join("")}</div>`;
KIT.groups = {
  html: w => `<div class="lw-rings r${w.rings}">${Array.from({ length: w.rings }, (_, k) => `<div class="lw-ring" data-tgt data-k="${k}" role="button" tabindex="0" aria-label="ring ${k + 1}"><div class="lw-got"></div><b class="lw-tot"></b></div>`).join("")}</div>
    ${groupHTML(w, w.rings * w.each, "", "mushrooms to place")}`,
  bind(root, w, api) {
    const got = Array(w.rings).fill(0), pile = root.querySelector(".lw-pile");
    const add = ring => { const k = +ring.dataset.k, src = pile.querySelector("[data-src]"); if (!src) return;
      if (got[k] >= w.each) return api.miss(`This ring has ${w.each} — it's full! Every ring gets the same.`, ring);
      src.remove(); got[k]++; ring.querySelector(".lw-got").insertAdjacentHTML("beforeend", `<span>${w.item}</span>`); WR.sfx("tap");
      if (got[k] === w.each) ring.classList.add("full");
      if (!pile.querySelector("[data-src]")) { root.querySelectorAll(".lw-ring").forEach((r, j) => r.querySelector(".lw-tot").textContent = (j + 1) * w.each);
        api.done(`✅ ${Array.from({ length: w.rings }, (_, j) => (j + 1) * w.each).join(", ")}! ${w.rings} groups of ${w.each} = ${w.rings * w.each}`); } };
    dragTap(root, { onDrop: (src, ring) => add(ring), onTapTarget: add });
  } };
KIT.share = {
  html: w => `<div class="lw-plates p${w.plates}">${Array.from({ length: w.plates }, (_, k) => `<div class="lw-plate" data-tgt data-k="${k}" role="button" tabindex="0" aria-label="plate ${k + 1}"><div class="lw-got"></div><button class="btn ghost small lw-back" data-back="${k}" aria-label="take one back from plate ${k + 1}" disabled>↩️</button></div>`).join("")}</div>
    <div class="row lw-deal-row"><button class="btn ghost small lw-deal">🃏 Deal one each</button></div>${groupHTML(w, w.total, "", "cookies to share")}`,
  bind(root, w, api) {
    const got = Array(w.plates).fill(0), pile = root.querySelector(".lw-pile"), each = w.total / w.plates;
    const paint = () => root.querySelectorAll(".lw-plate").forEach((p, k) => { p.querySelector(".lw-got").innerHTML = `<span>${w.item}</span>`.repeat(got[k]); p.querySelector(".lw-back").disabled = !got[k]; });
    const left = () => pile.querySelectorAll("[data-src]").length;
    const after = () => { paint();
      if (left()) { const lo = Math.min(...got), hi = Math.max(...got); if (hi - lo >= 2) api.say("Hmm, one plate has lots more. Is that fair? 🤔"); return; }
      if (got.every(g => g === each)) { root.querySelectorAll(".lw-plate").forEach(p => p.classList.add("fair")); root.querySelectorAll(".lw-back, .lw-deal").forEach(b => b.disabled = true);
        api.done(`✅ ${w.total} shared by ${w.plates} = ${each} each. Fair!`); }
      else api.miss("Not fair yet! Some plates have more. Tap ↩️ to take one back.", root.querySelector(".lw-plates")); };
    const give = k => { const src = pile.querySelector("[data-src]"); if (!src) return; src.remove(); got[k]++; WR.sfx("tap"); };
    dragTap(root, { onDrop: (src, plate) => { give(+plate.dataset.k); after(); }, onTapTarget: plate => { give(+plate.dataset.k); after(); } });
    root.querySelector(".lw-deal").onclick = () => { for (let k = 0; k < w.plates && left(); k++) give(k); after(); };
    root.querySelectorAll(".lw-back").forEach(b => b.onclick = e => { e.stopPropagation(); const k = +b.dataset.back; if (!got[k]) return; got[k]--;
      pile.insertAdjacentHTML("beforeend", `<button class="lw-chip lw-item" data-src aria-label="${esc(w.item)}">${w.item}</button>`); paint(); });
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
        if (i >= w.stages.length) api.done(); else { const at = i; setTimeout(() => { if (i !== at || !root.isConnected) return; start(); api.sayLine && api.sayLine(w.stages[at].say); }, 1200); } } };
    stage.addEventListener("click", e => { const p = e.target.closest(".fp"); if (p) tapPart(p); });
    stage.addEventListener("keydown", e => { const p = e.target.closest(".fp"); if (p && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); tapPart(p); } });
    start(); api.sayLine && setTimeout(() => api.sayLine(w.stages[0].say), 0);
  } };
LN.KIT = KIT;

/* ---------- the lesson screen ---------- */
let S = null;
const STEPS = [["hook", "Story"], ["discover", "Try it"], ["rule", "The rule"], ["check", "Your turn"], ["done", "Scroll"]];
const dotOf = step => ({ hook: 0, discover: 1, rule: 2, check: 3, reteach: 2, rdiscover: 1, done: 4 }[step]);
const dots = step => `<div class="ln-dots" aria-label="Step ${dotOf(step) + 1} of 5: ${STEPS[dotOf(step)][1]}">${STEPS.map(([k, l], j) => `<span class="${j < dotOf(step) ? "was" : j === dotOf(step) ? "on" : ""}"><i></i><small>${l}</small></span>`).join("")}</div>`;
LN.open = async (id, o = {}) => {
  const L = await LN.full(id); if (!L) return WR.toast("📜 This lesson is coming soon!");
  WR.go("learn", { id, L, back: o.back || null });
};
WR.screens.learn = arg => {
  const L = arg.L, maths = LN.isMath(L);
  S = { id: arg.id, L, maths, back: arg.back, step: "hook", round: 1, i: 0, right: 0, retaught: false, misses: 0, picked: [] };
  if (maths && WR.Math) WR.Math.loadKatex();
  LN.openCount(L.id); show();
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
    body = `<div class="ln-qnum">${S.round === 2 ? "🌈 New try · " : ""}Question ${S.i + 1} of 3</div>
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
// the spots and fraction widgets read each task out themselves
const widgetSpeaks = s => { const w = s.step === "discover" ? s.L.discover : s.step === "rdiscover" ? s.L.reteach.discover : null; return !!w && (w.kind === "spots" || w.kind === "frac"); };
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
      if (S.round === 1 && S.right < PASS) { S.retaught = true; S.round1 = S.right; S.step = "reteach"; return show(); }
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
  d.done[L.id] = r; d.rounds = (d.rounds || 0) + 1;
  let stars = 0; if (passed) stars = WR.awardStars("learn", L.id + "/pass", STARS, { kind: "fresh", quiet: true });
  if (!prev) WR.state.lessonsDone = (WR.state.lessonsDone || 0) + 1;
  const streak = WR.activityDone(!prev), lv = WR.petGainXP(prev ? 2 : 10);
  WR.save(); WR.renderTop();
  S.step = "done";
  const crowns = crownsFor(S.right);
  const head = passed ? (firstTry ? "You learned it! 🌟" : "You got it the second way! 🌈") : "Good try! Your scroll is saved 🫶";
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

/* ---------- 📜 Learn chips on skill / topic cards, and the soft nudge ---------- */
// chip(list, back): one lesson → it opens; several → a little list sheet. "✨ New" until the first lesson there is done.
// o.corner: a round 📜 badge in the card's top corner (realm skill cards: it adds no height, so the 4 skills still fit
// the first phone screen); otherwise a full-width "📜 Learn" chip at the bottom of the card (maths topic cards)
LN.chipHTML = (list, o = {}) => { if (!list || !list.length) return "";
  const done = list.filter(l => LN.rec(l.id)).length, all = done === list.length;
  // short enough for a 2-column card on a 320 px phone: "📜 Learn ✨" (new) · "📜 Learn 1/3" · "📜 Learn ✓"
  return `<button class="learn-chip${o.corner ? " corner" : ""}${done ? "" : " new"}${all ? " all" : ""}" data-learn="${list.map(l => l.id).join(",")}" aria-label="Learn: ${list.length} lesson${list.length > 1 ? "s" : ""}, ${done ? done + " done" : "new"}">📜${o.corner ? "" : " Learn"}<span class="ln-new">${list.length > 1 && done ? `${done}/${list.length}` : all ? "✓" : "✨"}</span></button>`; };
LN.bindChips = (root, back) => (root || document).querySelectorAll(".learn-chip[data-learn]").forEach(c => c.onclick = e => {
  e.stopPropagation(); WR.sfx("tap"); const ids = c.dataset.learn.split(",");
  if (ids.length === 1) return LN.open(ids[0], { back });
  LN.pickSheet(ids, back); });
LN.pickSheet = (ids, back) => WR.modal(`<h2>📜 Lessons here</h2><div class="ln-pick">${ids.map(id => { const l = LN.get(id), r = LN.rec(id);
    return `<button class="card ln-pick-row" data-id="${id}"><span class="ico">${l.icon}</span><b>${esc(l.title)}</b><span class="ln-st">${r ? (r.pass ? "👑".repeat(r.crowns || 1) : "🧩 try again") : "✨ New"}</span></button>`; }).join("")}</div>
    <button class="btn ghost small" id="pkClose" style="margin-top:10px">Close</button>`, (bg, close) => {
    bg.querySelectorAll(".ln-pick-row").forEach(b => b.onclick = () => { close(); LN.open(b.dataset.id, { back }); });
    bg.querySelector("#pkClose").onclick = close; });
// a weak practice result (< 60%) offers the first lesson there not yet passed
LN.nudgeFor = list => (list || []).find(l => !(LN.rec(l.id) || {}).pass) || null;
LN.nudgeHTML = l => l ? `<div class="card ln-nudge"><span class="ico">📜</span><div><b>Want a quick lesson?</b><small>${l.icon} ${esc(l.title)} · 2 minutes</small></div><button class="btn small mint" id="lnNudge" data-id="${l.id}">Learn it →</button></div>` : "";
LN.bindNudge = back => { const b = WR.$("#lnNudge"); if (b) b.onclick = () => LN.open(b.dataset.id, { back }); };

/* ---------- 🎒 the Backpack: every Lesson Scroll, earned or waiting ---------- */
const groupsOf = () => { const g = []; const add = (key, label, l) => { let x = g.find(y => y.key === key); if (!x) g.push(x = { key, label, list: [] }); x.list.push(l); };
  IDX.forEach(l => { if (LN.isMath(l)) { const gr = +String(l.at.topic).replace(/^g(\d+).*/, "$1"); add("m" + gr, `🔢 Maths · Grade ${gr}`, l); }
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
      return `<tr><td aria-label="${why}">${ic}</td><td><b>${esc(l.title)}</b><small>${LN.isMath(l) ? "Maths " + esc(l.at.topic.replace(/^g(\d+)\..*/, "G$1")) : "English " + esc(String(l.at.realm).toUpperCase())}</small></td><td>${r ? `${r.best}/3 · ${r.tries}×` : ""}</td></tr>`; }).join("")}</tbody></table></div>`; };
// 👪 the report screen draws every registered extra card (js/report.js WR.reportCards)
(WR.reportCards = WR.reportCards || []).push(LN.reportCard);
})();
