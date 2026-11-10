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
    const now = Date.now();
    Garden.settle(now);                                            // charge thirsty days up to the drink, then the schedule moves
    const m = st().mistakes.find(x => x.id === id); if (!m) return null;
    const rec = { s: m.box || 0, d: m.due, t: m.t || m.at, n: m.n || 1, l: m.l != null ? m.l : 0, r: m.r, w: m.w };
    WR.Review.kept(rec, ok, now);                                  // 🧠 first watering after 25+ days counts in the Report
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
    const due = st().mistakes.filter(m => isDue(m, now) && m.type !== "math").map(m => ({ m, w: (m.misses || 1) * 2 + (now - m.due) / DAY + Math.random() * 2 }))
      .sort((a, b) => b.w - a.w).slice(0, n).map(x => x.m);
    return WR.shuffle(due).map(itemOf);
  },
  water() {
    const items = Garden.roundItems(); if (!items.length) return Garden.mathDue && Garden.mathDue() ? Garden.waterMath() : WR.toast("🌤️ Nothing is thirsty right now!");   // 🔢 only number plants: their round
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

/* 🌷 Thirst (Task 11). The clock starts when a plant is ready to water (its due time), not when the
   mistake was made, and not before garden.thirstAt (the update), so an old save is not back-charged.
   One star after 24 hours of unpaused thirsty time, then one more star per further full day. No daily
   cap. The star balance stops at 0. Pets, skins and items are never touched.
   Paused time is the union of: the calendar day in streak.rest; each night from settings.health.bed
   until 05:00 when a bedtime is set (a grown-up's extra minutes are cut back out); and recorded
   daily-limit stops in garden.stops, from the moment the app notices play is stopped until play is
   allowed or the next local midnight. Limit pauses exist only while a daily limit is on. */
const HOUR = 36e5;
const gstore = () => { const g = st().garden; g.thirst = g.thirst || { taken: 0, weekKey: "", weekN: 0, notice: null }; g.stops = g.stops || []; return g; };
const dayStart = ts => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
const mondayKey = ts => { const d = new Date(ts); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return WR.dayKey(d.getTime()); };
const mergeIv = list => { const out = []; list.filter(x => x[1] > x[0]).sort((a, b) => a[0] - b[0]).forEach(iv => { const last = out[out.length - 1]; if (!last || iv[0] > last[1]) out.push([iv[0], iv[1]]); else last[1] = Math.max(last[1], iv[1]); }); return out; };
const cutHole = (list, hole) => { if (!hole) return list; const [hs, he] = hole, out = []; list.forEach(([a, b]) => { if (he <= a || hs >= b) out.push([a, b]); else { if (hs > a) out.push([a, hs]); if (he < b) out.push([he, b]); } }); return out; };
Garden.pausedMs = (from, to, state = WR.state) => {
  if (!(to > from) || !state) return 0;
  const iv = [], add = (a, b) => { const s = Math.max(from, a), e = Math.min(to, b); if (e > s) iv.push([s, e]); };
  const rest = state.streak && state.streak.rest;
  if (typeof rest === "string" && /^\d{4}-\d\d-\d\d$/.test(rest)) { const p = rest.split("-").map(Number), start = new Date(p[0], p[1] - 1, p[2]).getTime(); add(start, start + DAY); }
  const h = (state.settings && state.settings.health) || {};
  if (h.bed && /^\d{1,2}:\d{2}$/.test(h.bed)) {
    const [hh, mm] = h.bed.split(":").map(Number), bedMin = hh * 60 + mm, morning = ((WR.HEALTH && WR.HEALTH.morningH) || 5) * 60;
    for (let t = dayStart(from) - DAY; t < to; t += DAY) add(t + bedMin * 60000, t + DAY + morning * 60000);
  }
  ((state.garden && state.garden.stops) || []).forEach(x => { if (x && x.s && (!x.why || x.why === "limit") && (((state.settings || {}).health || {}).limit > 0)) add(x.s, x.e || to); });
  let merged = mergeIv(iv);
  if (h.until) merged = cutHole(merged, [h.until - ((WR.HEALTH && WR.HEALTH.extraMin) || 15) * 60000, h.until]);
  return merged.reduce((n, [a, b]) => n + (b - a), 0);
};
Garden.plan = (m, now, state = WR.state) => {
  const epoch = (state.garden && state.garden.thirstAt) || now;
  if (!m || m.legacy || !(typeof m.due === "number") || m.due > now) return { ready: false, owed: 0, paid: 0 };
  const prev = m.thirst && m.thirst.due === m.due ? m.thirst : null;
  const from = prev ? prev.from : Math.max(m.due, epoch);
  const elapsed = Math.max(0, now - from - Garden.pausedMs(from, now, state));
  return { ready: true, owed: Math.floor(elapsed / DAY), paid: prev ? (prev.paid || 0) : 0, from, due: m.due };
};
const trackLimit = now => {
  const g = gstore(), h = (WR.state.settings && WR.state.settings.health) || {};
  const stopped = h.limit > 0 && WR.HEALTH && WR.HEALTH.restReason(now) === "limit";
  g.stops.forEach(x => { if (x && x.why === "limit" && !x.e && now >= dayStart(x.s) + DAY) x.e = dayStart(x.s) + DAY; });
  if (!stopped) g.stops.forEach(x => { if (x && x.why === "limit" && !x.e) x.e = now; });
  else if (!g.stops.some(x => x && x.why === "limit" && !x.e)) g.stops.push({ why: "limit", s: now, e: 0 });
};
const adoptAhead = () => {
  try {
    const disk = JSON.parse(localStorage.getItem("wordRealms.save.v1") || "null");
    const dt = disk && disk.garden && disk.garden.thirst && disk.garden.thirst.taken || 0;
    const mt = WR.state.garden && WR.state.garden.thirst && WR.state.garden.thirst.taken || 0;
    if (disk && disk.v === 1 && dt > mt) { WR.state = WR.load(); return true; }
  } catch (e) { /* keep the copy already in memory */ }
  return false;
};
Garden.soon = (now = Date.now()) => {
  const s = st(); let n = 0, leftMin = Infinity;
  s.mistakes.forEach(m => {
    const p = Garden.plan(m, now, s); if (!p.ready) return;
    const into = Math.max(0, now - p.from - Garden.pausedMs(p.from, now, s)) % DAY, left = into === 0 ? DAY : DAY - into;
    if (left <= 12 * HOUR) { n++; leftMin = Math.min(leftMin, left); }
  });
  return n ? { n, hours: Math.max(1, Math.round(leftMin / HOUR)) } : null;
};
Garden.settle = (now = Date.now()) => {
  if (!WR.state) return { take: 0, plants: 0 };
  if (adoptAhead()) return Garden.settle(now);
  const s = st(), g = gstore(), first = !g.thirstAt;
  if (!g.thirstAt) g.thirstAt = now;
  const before = JSON.stringify(g.stops);
  trackLimit(now);
  let take = 0; const who = [];
  s.mistakes.slice().sort((a, b) => String(a.id).localeCompare(String(b.id))).forEach(m => {
    const p = Garden.plan(m, now, s);
    if (!p.ready) { if (m.thirst) delete m.thirst; return; }
    const got = Math.min(Math.max(0, p.owed - p.paid), Math.max(0, (s.stars || 0) - take));
    m.thirst = { due: p.due, from: p.from, paid: p.paid + got };
    if (got) { take += got; who.push(m.id); }
  });
  if (take) {
    s.stars -= take; g.thirst.taken = (g.thirst.taken || 0) + take;
    const wk = mondayKey(now);
    if (g.thirst.weekKey !== wk) { g.thirst.weekKey = wk; g.thirst.weekN = 0; }
    g.thirst.weekN = (g.thirst.weekN || 0) + take;
    g.thirst.notice = { n: take, plants: who.length, at: now };
    WR.toast && WR.toast(`🌷 ${who.length} plant${who.length > 1 ? "s" : ""} got thirsty: -${take}⭐ — water them to stop it`, 3200);
  }
  if (take || before !== JSON.stringify(g.stops)) WR.save();
  return { take, plants: who.length };
};
Garden.merge = (state, other) => {
  if (!state || !other) return state;
  state.garden = Object.assign({ bloomed: 0, rounds: 0 }, state.garden);
  const gs = state.garden, go = other.garden || {}, had = (gs.thirst && gs.thirst.taken) || 0, ot = (go.thirst && go.thirst.taken) || 0, taken = Math.max(had, ot);
  const weekKey = [gs.thirst && gs.thirst.weekKey, go.thirst && go.thirst.weekKey].filter(Boolean).sort().pop() || "";
  const weekN = Math.max(gs.thirst && gs.thirst.weekKey === weekKey ? gs.thirst.weekN || 0 : 0, go.thirst && go.thirst.weekKey === weekKey ? go.thirst.weekN || 0 : 0);
  if (gs.thirstAt || go.thirstAt) gs.thirstAt = Math.min(gs.thirstAt || Infinity, go.thirstAt || Infinity);
  gs.thirst = Object.assign({ taken: 0, weekKey: "", weekN: 0, notice: null }, gs.thirst, go.thirst, { taken, weekKey, weekN });
  if (taken > had) state.stars = Math.max(0, (state.stars || 0) - (taken - had));
  const byId = {}; (other.mistakes || []).forEach(m => { if (m && m.id) byId[m.id] = m; });
  (state.mistakes || []).forEach(m => {
    const o = byId[m.id]; if (!o || !o.thirst) return;
    if (!m.thirst || m.thirst.due !== o.thirst.due) { if ((o.thirst.paid || 0) >= ((m.thirst && m.thirst.paid) || 0)) m.thirst = Object.assign({}, o.thirst); }
    else m.thirst.paid = Math.max(m.thirst.paid || 0, o.thirst.paid || 0);
  });
  const seen = new Set();
  gs.stops = (gs.stops || []).concat(go.stops || []).filter(x => { if (!x || !x.s) return false; const k = (x.why || "") + ":" + x.s; if (seen.has(k)) return false; seen.add(k); return true; });
  return state;
};
Garden.reportLine = d => {
  const t = (WR.state.garden && WR.state.garden.thirst) || {}, all = d && d.range === "all", wk = mondayKey(Date.now());
  const n = all ? (t.taken || 0) : (t.weekKey === wk ? t.weekN || 0 : 0);
  return `<div class="card rp-card" id="thirstLine"><h2>🌷 Thirsty plants</h2><p>Stars lost ${all ? "in all" : "this week"}: <b id="thirstN">${n}</b>. A plant costs 1 star after it has been ready to water for 24 hours, then 1 more each full day. Watering stops it. Stars never go below 0.</p></div>`;
};
(WR.reportCards = WR.reportCards || []).push(d => Garden.reportLine(d));

/* ---------------- screen ---------------- */
WR.screens.review = () => {
  const s = st(); const all = s.mistakes, act = all.filter(m => !m.bloomed), bl = all.filter(m => m.bloomed);
  const due = Garden.dueCount(), nd = Garden.nextDue();
  const meta = m => m.type === "math" ? { lvl: "G" + (m.grade || ""), ico: "🔢", skill: "maths" } : { lvl: WR.levelOf(m.realm), ico: WR.skillInfo(m.skill).icon, skill: m.skill };   // the level pill + skill icon of a plant
  const mdue = Garden.mathDue ? Garden.mathDue() : 0, wdue = due - mdue;   // 🔢 number plants are watered in a maths round (js/math-review.js)
  const sorted = act.concat(bl.filter(m => isDue(m))).sort((a, b) => (isDue(b) - isDue(a)) || (a.legacy - b.legacy) || a.due - b.due);
  const counts = STAGES.map((_, i) => act.filter(m => (m.box || 0) === i).length);
  const plot = m => { const g = Garden.stageOf(m); return `<button class="plot ${isDue(m) ? "thirsty" : ""} ${m.legacy ? "legacy" : ""}" data-id="${m.id}">
      <span class="plant">${g.e}</span><span class="pl-meta"><span class="pill">${meta(m).lvl}</span> ${meta(m).ico}</span>
      <span class="pl-q">${WR.esc(m.q.length > 60 ? m.q.slice(0, 58) + "…" : m.q)}</span>
      <span class="pl-due">${m.legacy ? "tip card 📜" : g.n + " · " + when(m.due)}</span></button>`; };
  const soon = Garden.soon(), note = s.garden.thirst && s.garden.thirst.notice;
  WR.view(`<div class="fade-in"><h1>🌷 Mistake Garden</h1>
    ${note ? `<div class="card" id="thirstNote">🌷 ${note.plants} plant${note.plants > 1 ? "s" : ""} got thirsty: -${note.n}⭐ — water them to stop it</div>` : ""}
    ${soon ? `<p class="muted" id="thirstSoon" style="font-weight:800">🌷 ${soon.n} plant${soon.n > 1 ? "s" : ""} will start costing a star within about ${soon.hours} hour${soon.hours > 1 ? "s" : ""}. A drink stops it.</p>` : ""}
    <div class="card garden-head"><div class="petbox ${due ? "bounce" : ""}" style="width:120px;height:120px">${WR.petHTML()}</div>
      <div style="flex:1"><h2 style="margin:0">${due ? `${due} plant${due > 1 ? "s are" : " is"} thirsty! 💧` : act.length ? "Your garden is happy 🌤️" : "An empty garden, ready for seeds 🌱"}</h2>
      <p class="muted" style="font-weight:700;margin:.3em 0">Every mistake is planted as a seed. Answer it right on later days and it grows 🌰→🌱→🌿→🌷→🌸, and each time it rests longer. Bloomed flowers still pop back now and then for a drink. Slip up and it goes back to a seed, so the tricky ones come back more often.</p>
      <div class="row"><button class="btn mint" id="waterBtn" ${due ? "" : "disabled"}>💧 Water the garden${wdue ? ` (${Math.min(wdue, PER_ROUND)})` : mdue ? ` (${Math.min(mdue, PER_ROUND)})` : ""}</button>${wdue && mdue ? `<button class="btn" id="waterMath">🔢 Number plants (${Math.min(mdue, PER_ROUND)})</button>` : ""}
      ${!due && nd ? `<span class="pill">Next plant gets thirsty ${when(nd)}</span>` : ""}<span class="pill" style="background:var(--butter)">🌸 ${s.garden.bloomed} bloomed · +2⭐ each</span></div></div></div>
    ${sorted.length ? `<div class="stage-row">${STAGES.map((g, i) => `<div class="stage-chip"><span>${g.e}</span><b>${counts[i]}</b><small>${g.n}</small></div>`).join("")}<div class="stage-chip bloom"><span>🌸</span><b>${bl.length}</b><small>Bloomed</small></div></div>
      <div class="garden-bed">${sorted.map(plot).join("")}</div>` : `<div class="card center"><div style="font-size:3rem">🌷</div><h2>No mistakes yet!</h2><p class="muted">Play some lessons. Anything you miss gets planted here so you can grow it into knowledge.</p></div>`}
    ${bl.length ? `<h2>💐 Your bouquet</h2><div class="bouquet card">${bl.slice(0, 40).map(m => `<button class="bq" data-id="${m.id}" title="${WR.esc(m.q)}">🌸</button>`).join("")}${bl.length > 40 ? `<span class="muted">+${bl.length - 40} more</span>` : ""}</div>` : ""}</div>`);
  const wb = WR.$("#waterBtn"); if (wb) wb.onclick = () => Garden.water();
  const wm = WR.$("#waterMath"); if (wm) wm.onclick = () => Garden.waterMath();
  document.querySelectorAll("[data-id]").forEach(b => b.onclick = () => {
    const m = s.mistakes.find(x => x.id === b.dataset.id); if (!m) return; const g = Garden.stageOf(m);
    WR.modal(`<h2>${g.e} ${g.n}</h2><span class="pill">${meta(m).lvl} · ${meta(m).ico} ${WR.esc(meta(m).skill)}</span>
      ${m.passage ? WR.passageHTML(m.passage, { style: "text-align:left;max-height:180px;overflow:auto" }) : ""}
      <p style="font-weight:800">${WR.esc(m.q)}</p>${m.type === "math" ? `<p class="muted" style="font-weight:700;text-align:left">Missed: ${WR.Math ? WR.Math.html(m.missed || "") : WR.esc(m.missed || "")}</p><p class="muted" style="font-weight:700;text-align:left">🔢 Next time Sumi asks a new question on this topic, with new numbers.</p>` : ""}${m.said ? `<div class="transcript">🎧 “${WR.esc(m.said)}” <button class="btn ghost small" id="sayBtn">🔊</button></div>` : ""}
      ${m.correct != null ? `<div style="margin-top:6px">✅ <b>${m.type === "math" && WR.Math ? WR.Math.html(m.correct) : WR.esc(m.correct)}</b></div>` : ""}<div class="muted" style="font-weight:700;text-align:left">💡 ${WR.esc(m.explain)}</div>
      <p class="muted" style="font-size:.8rem">Missed ${m.misses || 1}× · ${m.bloomed ? "fully grown! It comes back for a drink " + when(m.due) : m.legacy ? "an old tip card (from before the garden could quiz you)" : "next watering " + when(m.due)}</p>
      <button class="btn small" id="okBtn">Got it</button>`, (bg, close) => {
      const sb = bg.querySelector("#sayBtn"); if (sb) sb.onclick = () => WR.say(m.said);
      bg.querySelector("#okBtn").onclick = close;
    });
  });
  Garden.badge();
};
if (WR.init && !WR.init._thirst) {
  const init0 = WR.init;
  WR.init = async function () { const r = await init0.apply(this, arguments); try { Garden.settle(); } catch (e) { /* a clock problem must not block the map */ } return r; };
  WR.init._thirst = 1;
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && WR.state && WR.state.pet) Garden.settle(); });
})();
