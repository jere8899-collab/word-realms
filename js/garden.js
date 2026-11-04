/* Mistake Garden: spaced review of everything the learner got wrong, on the one review schedule (js/review.js).
   Each mistake is planted as a seed. Answer it right after a real gap (at least ~20 hours, WR.Review.CONFIG.minGapH) and it grows:
   seed → sprout (back in 3 days) → bud (10) → nearly (30) → bloomed (90), then a bloomed plant comes back now and then
   (WR.Review.CONFIG.rest) — nothing retires for good. A right answer minutes after the mistake waters it but doesn't grow it.
   A wrong answer sends it back to a seed (the bloom count and its stars stay). */
(function () {
const WR = window.WR;
const DAY = 864e5;
const STAGES = [
  { e: "🌰", n: "Seed" },
  { e: "🌱", n: "Sprout" },
  { e: "🌿", n: "Bud" },
  { e: "🌷", n: "Nearly there" }
];
STAGES.forEach((g, i) => Object.defineProperty(g, "wait", { get: () => i ? WR.Review.gapDays(i) : 0, enumerable: true }));   // days, from the one config
const MAX_ACTIVE = 400, PER_ROUND = 8;   // bloomed plants stay (they come back); only past 400 plants does the oldest bloomed one go
const hash = s => { let h = 5381; for (const c of s) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0; return h.toString(36); };

function st() {
  const s = WR.state;
  if (!s.garden) s.garden = { bloomed: 0, rounds: 0 };
  // migrate old-style mistakes (no options saved) into read-only tip seeds
  s.mistakes.forEach(m => { if (!m.id) { m.id = "old_" + hash((m.q || "") + "|" + (m.correct || "")); m.box = m.box || 0; m.due = m.due || m.at || Date.now(); if (!m.options && m.type !== "order") m.legacy = true; } });
  return s;
}
const active = () => st().mistakes.filter(m => !m.bloomed);
const isDue = (m, now = Date.now()) => !m.legacy && m.due <= now;   // bloomed plants too, when their rare visit is due

// a plant back as a lesson item: items with _raw are rebuilt in full (with their passage); older ones from what was saved
const itemOf = m => m.raw ? { ...WR.normalize(m.raw, m.passage || undefined), _mid: m.id } : m.type === "order"
  ? { type: "order", q: m.q, answer: m.correct, explain: m.explain, _mid: m.id }
  : { type: m.type, q: m.q, say: m.say, pic: m.pic, passage: m.passage, options: WR.shuffle(m.options), correct: m.correct, explain: m.explain, notes: m.notes || null, _mid: m.id };
// keep the newest; drop the oldest bloomed first, then the oldest active
const trim = list => { while (list.length > MAX_ACTIVE) { const bi = list.map(m => m.bloomed).lastIndexOf(true); list.splice(bi >= 0 ? bi : list.length - 1, 1); } };

const Garden = WR.Garden = {
  STAGES,
  plant(it, realm, skill) {
    const s = st(), correct = it.type === "order" ? it.answer : it.correct;
    const id = hash(realm + "|" + it.q + "|" + correct + "|" + (it.say || "") + "|" + (it.passage ? it.passage.title : ""));
    const old = s.mistakes.findIndex(m => m.id === id);
    const prev = old >= 0 ? s.mistakes.splice(old, 1)[0] : null;
    s.mistakes.unshift({
      id, realm, skill: skill || "special", type: it.type, q: it.q, say: it.say || null, said: it.say || null, pic: it.pic || null,
      passage: it.passage ? { title: it.passage.title, text: it.passage.text, ...(it.passage.say ? { say: it.passage.say } : {}) } : null,   // say: the narrated text (🦁 Spot & Fix / Story Gaps)
      options: it.options ? it.options.slice() : null, correct, explain: it.explain, notes: it.notes || null, raw: it._raw || null,
      at: Date.now(), due: Date.now(), box: 0, misses: (prev ? prev.misses || 1 : 0) + 1, bloomed: false,
      t: Date.now(), n: (prev ? prev.n || 1 : 0) + 1, rk: it._rk || null   // 🔁 last answer time + answers (the mistake itself), its lesson record
    });
    trim(s.mistakes);
    WR.save(); Garden.badge();
  },
  // one watering answer, on the one review rule (WR.Review.step): returns { bloomed: newly bloomed, box, moved, pay }
  grade(id, ok) {
    const m = st().mistakes.find(x => x.id === id); if (!m) return null;
    const now = Date.now(), rec = { s: m.box || 0, d: m.due, t: m.t || m.at, n: m.n || 1, l: m.l != null ? m.l : 0, r: m.r, w: m.w };
    const res = WR.Review.step(rec, ok, now, { wrongDays: 0 });   // a wrong answer: a seed again, thirsty now
    m.box = rec.s; m.due = rec.d; m.t = rec.t; m.n = rec.n; m.l = rec.l; m.r = rec.r; m.w = rec.w;
    let bloomed = false;
    if (ok && m.box >= STAGES.length && !m.bloomed) { m.bloomed = true; m.bloomedAt = now; WR.state.garden.bloomed++; bloomed = true; }
    if (!ok) { m.misses = (m.misses || 1) + 1; m.bloomed = false; }   // back to a seed; the bloom count and its stars stay
    if (m.rk) { const r = WR.Review.items()[m.rk]; if (r) { r.t = now; r.l = ok ? 1 : 0; } }   // its lesson record: last result
    WR.save(); Garden.badge();
    return { bloomed, box: m.box, moved: res.moved, pay: ok && res.moved ? "g:" + m.id + "#" + m.n : null };
  },
  dueCount: () => st().mistakes.filter(m => isDue(m)).length,
  nextDue: () => { const f = st().mistakes.filter(m => !m.legacy).map(m => m.due).sort((a, b) => a - b); return f[0] || null; },
  isDue,
  stageOf: m => m.bloomed ? { e: "🌸", n: "Bloomed" } : STAGES[Math.min(m.box || 0, STAGES.length - 1)],
  badge() {
    const b = document.querySelector('#navbar button[data-k="review"]'); if (!b) return;
    let d = b.querySelector(".nbadge"); const n = Garden.dueCount();
    if (!n) { d && d.remove(); return; }
    if (!d) { d = document.createElement("i"); d.className = "nbadge"; b.appendChild(d); }
    d.textContent = n > 9 ? "9+" : n;
  },
  // items for a watering round: most-missed and most-overdue first, mixed with a little randomness
  roundItems(n = PER_ROUND) {
    const now = Date.now();
    const due = st().mistakes.filter(m => isDue(m, now)).map(m => ({ m, w: (m.misses || 1) * 2 + (now - m.due) / DAY + Math.random() * 2 }))
      .sort((a, b) => b.w - a.w).slice(0, n).map(x => x.m);
    return WR.shuffle(due).map(itemOf);
  },
  water() {
    const items = Garden.roundItems(); if (!items.length) return WR.toast("🌤️ Nothing is thirsty right now!");
    const ids = new Set(items.map(i => i._mid)), tally = {};
    st().mistakes.forEach(m => { if (ids.has(m.id)) tally[m.realm] = (tally[m.realm] || 0) + 1; });
    const realm = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0] || "a1";
    WR.state.garden.rounds++; WR.save();
    WR.startLesson({ realm, items, mode: "picture", review: true, title: "Garden Revival 💧", replay: () => Garden.water() });
  }
};
function when(ts) {
  const d = ts - Date.now(); if (d <= 0) return "thirsty now 💧";
  const days = Math.ceil(d / DAY); if (d < DAY) return `in ${Math.max(1, Math.round(d / 36e5))}h`;
  return `in ${days} day${days > 1 ? "s" : ""}`;
}

/* ---------------- screen ---------------- */
WR.screens.review = () => {
  const s = st(); const all = s.mistakes, act = all.filter(m => !m.bloomed), bl = all.filter(m => m.bloomed);
  const due = Garden.dueCount(), nd = Garden.nextDue();
  const meta = m => ({ lvl: WR.levelOf(m.realm), ico: WR.skillInfo(m.skill).icon, skill: m.skill });   // the level pill + skill icon of a plant
  const sorted = act.concat(bl.filter(m => isDue(m))).sort((a, b) => (isDue(b) - isDue(a)) || (a.legacy - b.legacy) || a.due - b.due);
  const counts = STAGES.map((_, i) => act.filter(m => (m.box || 0) === i).length);
  const plot = m => { const g = Garden.stageOf(m); return `<button class="plot ${isDue(m) ? "thirsty" : ""} ${m.legacy ? "legacy" : ""}" data-id="${m.id}">
      <span class="plant">${g.e}</span><span class="pl-meta"><span class="pill">${meta(m).lvl}</span> ${meta(m).ico}</span>
      <span class="pl-q">${WR.esc(m.q.length > 60 ? m.q.slice(0, 58) + "…" : m.q)}</span>
      <span class="pl-due">${m.legacy ? "tip card 📜" : g.n + " · " + when(m.due)}</span></button>`; };
  WR.view(`<div class="fade-in"><h1>🌷 Mistake Garden</h1>
    <div class="card garden-head"><div class="petbox ${due ? "bounce" : ""}" style="width:120px;height:120px">${WR.petHTML()}</div>
      <div style="flex:1"><h2 style="margin:0">${due ? `${due} plant${due > 1 ? "s are" : " is"} thirsty! 💧` : act.length ? "Your garden is happy 🌤️" : "An empty garden, ready for seeds 🌱"}</h2>
      <p class="muted" style="font-weight:700;margin:.3em 0">Every mistake is planted as a seed. Answer it right on later days and it grows 🌰→🌱→🌿→🌷→🌸, and each time it rests longer. Bloomed flowers still pop back now and then for a drink. Slip up and it goes back to a seed, so the tricky ones come back more often.</p>
      <div class="row"><button class="btn mint" id="waterBtn" ${due ? "" : "disabled"}>💧 Water the garden${due ? ` (${Math.min(due, PER_ROUND)})` : ""}</button>
      ${!due && nd ? `<span class="pill">Next plant gets thirsty ${when(nd)}</span>` : ""}<span class="pill" style="background:var(--butter)">🌸 ${s.garden.bloomed} bloomed · +2⭐ each</span></div></div></div>
    ${sorted.length ? `<div class="stage-row">${STAGES.map((g, i) => `<div class="stage-chip"><span>${g.e}</span><b>${counts[i]}</b><small>${g.n}</small></div>`).join("")}<div class="stage-chip bloom"><span>🌸</span><b>${bl.length}</b><small>Bloomed</small></div></div>
      <div class="garden-bed">${sorted.map(plot).join("")}</div>` : `<div class="card center"><div style="font-size:3rem">🌷</div><h2>No mistakes yet!</h2><p class="muted">Play some lessons. Anything you miss gets planted here so you can grow it into knowledge.</p></div>`}
    ${bl.length ? `<h2>💐 Your bouquet</h2><div class="bouquet card">${bl.slice(0, 40).map(m => `<button class="bq" data-id="${m.id}" title="${WR.esc(m.q)}">🌸</button>`).join("")}${bl.length > 40 ? `<span class="muted">+${bl.length - 40} more</span>` : ""}</div>` : ""}</div>`);
  const wb = WR.$("#waterBtn"); if (wb) wb.onclick = () => Garden.water();
  document.querySelectorAll("[data-id]").forEach(b => b.onclick = () => {
    const m = s.mistakes.find(x => x.id === b.dataset.id); if (!m) return; const g = Garden.stageOf(m);
    WR.modal(`<h2>${g.e} ${g.n}</h2><span class="pill">${meta(m).lvl} · ${meta(m).ico} ${WR.esc(meta(m).skill)}</span>
      ${m.passage ? WR.passageHTML(m.passage, { style: "text-align:left;max-height:180px;overflow:auto" }) : ""}
      <p style="font-weight:800">${WR.esc(m.q)}</p>${m.said ? `<div class="transcript">🎧 “${WR.esc(m.said)}” <button class="btn ghost small" id="sayBtn">🔊</button></div>` : ""}
      <div style="margin-top:6px">✅ <b>${WR.esc(m.correct)}</b></div><div class="muted" style="font-weight:700;text-align:left">💡 ${WR.esc(m.explain)}</div>
      <p class="muted" style="font-size:.8rem">Missed ${m.misses || 1}× · ${m.bloomed ? "fully grown! It comes back for a drink " + when(m.due) : m.legacy ? "an old tip card (from before the garden could quiz you)" : "next watering " + when(m.due)}</p>
      <button class="btn small" id="okBtn">Got it</button>`, (bg, close) => {
      const sb = bg.querySelector("#sayBtn"); if (sb) sb.onclick = () => WR.say(m.said);
      bg.querySelector("#okBtn").onclick = close;
    });
  });
  Garden.badge();
};
})();
