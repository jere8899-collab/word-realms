/* 🔁 Maths on the one review schedule (js/review.js, BRIEF-T3).
   - A topic the child has finished (a topic round at the shared pass mark WR.PASS.mark, 85%: CONFIG.math.pass) gets one record,
     state.review.items["math:<topic id>"], on the same 3 / 10 / 30 / 90-day rule as English (then about every 180 days).
   - 🎲 Daily Mix: about 5 questions in mixed order from due topics, recent topics and at least one earlier-grade topic,
     with no two neighbours from the same topic when there is a choice. On by default, a card inside the Number Kingdom hub
     (no new realm tile), on the fairy realms and the Singapore track alike (a Singapore level gives the
     grade until a maths grade is chosen).
   - 🌷 Maths mistakes are planted in the Mistake Garden, one plant per topic; watering it asks a fresh question on that
     topic (new numbers), never the one that was missed.
   Single-topic rounds stay as they are for first learning. Nothing here takes away crowns, stars or stickers. */
(function () {
const WR = window.WR, MG = window.MathGen, MW = WR.Math, RV = WR.Review;
if (!WR || !MG || !MW || !RV) return;
const CONFIG = RV.CONFIG.math = {
  pass: WR.PASS.mark, // a topic is "finished" at the shared pass mark (BRIEF-T4B; was 0.6)
  oldPass: 0.6,       // what counted as finished before: the one-time move onto the schedule (MR.migrate) keeps using it
  mix: 5,             // questions in a Daily Mix
  due: 4,             // at most this many slots for due topics (one is kept for an earlier grade)
  recentDays: 14      // "recent" topics: played in the last two weeks
};
const DAY = RV.DAY, KEY = id => "math:" + id;
const MR = WR.MathReview = { CONFIG };
const items = () => RV.items();
const isTopic = id => !!MG.topic(id);
MR.schedules = id => isTopic(id);                  // every maths topic can enter the schedule once finished
MR.rec = id => items()[KEY(id)] || null;
// ---------- the grade the mix is built around: the chosen maths grade, else the Singapore level, else Grade 1 ----------
const SG_GRADE = { p1: 1, p2: 2, p3: 3, p4: 4, p5: 5, p6: 6, s1: 7, s2: 8, s3: 9, s4: 10, jc1: 11, jc2: 12 };
MR.sgGrade = () => { const sg = WR.state.sg; return sg && sg.track === "sg" ? SG_GRADE[sg.level] || null : null; };
MR.grade = () => MW.st().grade || MR.sgGrade() || 1;

// ---------- records ----------
// a topic round ended: finishing (≥ pass) starts or moves its record (same 20 h + due rule); a weak round on a topic that is
// already on the schedule brings it back tomorrow. A topic never finished gets no record.
MR.finished = (id, score, now = Date.now()) => {
  if (!isTopic(id)) return null;
  const all = items(), k = KEY(id), rec = all[k];
  if (score >= CONFIG.pass) { const r = all[k] = rec || {}; const res = RV.step(r, true, now); WR.save(); return res; }
  if (rec && rec.n) { const res = RV.step(rec, false, now); WR.save(); return res; }
  return null;
};
// one Daily Mix answer: right first time = a review (moves only after a real gap and when due); missed = due tomorrow.
// Returns the review-star key when the record moved up.
MR.answer = (q, ok, now = Date.now()) => {
  const rec = q && MR.rec(q.topic); if (!rec || !rec.n) return null;
  const res = RV.step(rec, ok, now); WR.save();
  return ok && res.moved ? KEY(q.topic) + "#" + rec.n : null;
};
MR.due = (now = Date.now()) => Object.entries(items()).filter(([k, r]) => k.startsWith("math:") && r.n && r.d <= now && isTopic(k.slice(5)))
  .sort((a, b) => a[1].d - b[1].d).map(([k]) => k.slice(5));
MR.dueCount = now => MR.due(now).length;

// ---------- 🎲 Daily Mix ----------
const topicsOf = () => MW.st().topics;
const finished = id => ((topicsOf()[id] || {}).best || 0) >= CONFIG.pass;
const usable = t => !t.extra || finished(t.id) || !!MR.rec(t.id);     // ✨ extra topics only once the child chose to learn them (one already on the schedule stays)
// the topics of one mix (n slots, a topic may repeat when there are fewer than n to choose from)
MR.mixTopics = (now = Date.now(), n = CONFIG.mix) => {
  const g = MR.grade(), tp = topicsOf(), out = [], add = id => { if (id && !out.includes(id) && out.length < n) out.push(id); };
  const gradeOf = id => (MG.topic(id) || {}).grade || 0;
  const seen = id => Math.max((tp[id] || {}).last || 0, (MR.rec(id) || {}).t || 0), bySeen = (a, b) => seen(a) - seen(b);   // last met, in a round or a mix
  const due = MR.due(now), earlierDue = due.filter(id => gradeOf(id) < g);
  // 1. due topics (most overdue first), keeping one slot for an earlier grade
  due.slice(0, CONFIG.due).forEach(add);
  // 2. an earlier grade: a due one, else the finished one played longest ago, else a topic from the grade below
  if (g > 1 && !out.some(id => gradeOf(id) < g)) {
    const doneEarlier = MG.TOPICS.filter(t => t.grade < g && finished(t.id)).sort((a, b) => bySeen(a.id, b.id));
    const below = MG.gradeTopics(g - 1).filter(usable);
    add(earlierDue[0] || (doneEarlier[0] && doneEarlier[0].id) || (below.length && WR.shuffle(below)[0].id));
  }
  // 3. recent topics (a round played in the last two weeks), the one met longest ago first, so they take turns
  Object.entries(tp).filter(([id, p]) => isTopic(id) && p.last && now - p.last <= CONFIG.recentDays * DAY && usable(MG.topic(id)))
    .map(([id]) => id).sort(bySeen).forEach(add);
  // 4. fill: the rest of the due topics, then this grade's topics (played ones first, longest ago first), then the grade below
  due.forEach(add);
  const here = MG.gradeTopics(g).filter(usable), played = here.filter(t => tp[t.id]).sort((a, b) => bySeen(a.id, b.id));
  played.forEach(t => add(t.id)); WR.shuffle(here.filter(t => !tp[t.id])).forEach(t => add(t.id));
  if (g > 1) WR.shuffle(MG.gradeTopics(g - 1).filter(usable)).forEach(t => add(t.id));
  // fewer topics than slots: repeat them
  for (let i = 0; out.length && out.length < n; i++) out.push(out[i % out.length]);
  return MR.spread(out);
};
// mixed order with no two neighbours on the same topic when the counts allow it (greedy: the most-left topic that differs)
MR.spread = list => {
  const left = new Map(); WR.shuffle(list.slice()).forEach(id => left.set(id, (left.get(id) || 0) + 1));
  const out = [];
  while (out.length < list.length) {
    const opts = [...left.entries()].filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]);
    const pick = opts.find(([id]) => id !== out[out.length - 1]) || opts[0];
    out.push(pick[0]); left.set(pick[0], pick[1] - 1);
  }
  return out;
};
// the questions: one fresh question per slot (a repeated topic gets a different question)
MR.mixItems = (now = Date.now()) => {
  const ts = MR.mixTopics(now), per = {}; ts.forEach(id => per[id] = (per[id] || 0) + 1);
  const bank = {}; for (const id in per) bank[id] = MG.batch(id, per[id]);
  return ts.map(id => Object.assign(bank[id].shift(), { _mix: true }));
};
const st = () => { const m = MW.st(); m.mix = m.mix && typeof m.mix === "object" ? m.mix : { day: null, today: 0, total: 0 }; return m.mix; };
MR.doneToday = () => st().day === WR.today() && st().today > 0;
MR.on = () => !(WR.state.settings && WR.state.settings.dailyMix === false);   // on by default
MR.start = () => {
  const items = MR.mixItems(); if (!items.length) return;
  MW.startLesson({ items, kind: "mix", key: "mix.daily", grade: MR.grade(), title: "🎲 Daily Mix", replay: () => MR.start(), back: "math",
    onFinish: () => { const s = st(); if (s.day !== WR.today()) { s.day = WR.today(); s.today = 0; } s.today++; s.total = (s.total || 0) + 1; WR.save(); } });
};
// the hub card (on every track; the home map's 🔢 door leads here)
MR.cardHTML = () => { if (!MR.on()) return ""; const d = MR.dueCount(), done = MR.doneToday();
  return `<div class="card row mix-card" id="mixCard"><span class="mix-ico" aria-hidden="true">🎲</span><div style="flex:1;min-width:0"><b class="title" style="font-size:1.15rem">Daily Mix</b>
    <div class="muted" style="font-weight:700;font-size:.88rem">${CONFIG.mix} quick questions from different topics, old and new, all mixed up.</div>
    <div class="row" style="gap:6px;margin-top:4px">${d ? `<span class="pill" style="background:#FFE3EF">🔁 ${d} topic${d > 1 ? "s" : ""} to review</span>` : ""}${done ? `<span class="pill" style="background:var(--mint)">✅ Done today</span>` : ""}</div></div>
    <button class="btn ${done ? "" : "mint"}" id="mixBtn">${done ? "🎲 Another mix" : "▶ Play"}</button></div>`; };

// ---------- 🌷 maths plants in the Mistake Garden ----------
const plain = t => String(t == null ? "" : t).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const G = WR.Garden;
// plant (or re-plant) the topic of a missed question; the plant keeps the missed question only to show it and to avoid it
G.plantMath = q => {
  const t = MG.topic(q.topic); if (!t) return null;
  const s = WR.state, id = "math_" + t.id, old = s.mistakes.findIndex(m => m.id === id), prev = old >= 0 ? s.mistakes.splice(old, 1)[0] : null, now = Date.now();
  s.mistakes.unshift({ id, realm: "math", skill: "math", type: "math", topic: t.id, grade: t.grade, q: `${t.icon} ${t.name}`,
    missed: plain(q.q).slice(0, 160), sig: q.q + "|" + q.a, correct: q.optPics ? null : plain(q.a), explain: plain(q.hint), options: null,
    at: now, due: now, box: 0, misses: (prev ? prev.misses || 1 : 0) + 1, bloomed: false, t: now, n: (prev ? prev.n || 1 : 0) + 1 });
  while (s.mistakes.length > 400) { const bi = s.mistakes.map(m => m.bloomed).lastIndexOf(true); s.mistakes.splice(bi >= 0 ? bi : s.mistakes.length - 1, 1); }
  WR.save(); G.badge(); return id;
};
G.isMath = m => m && m.type === "math";
// a fresh question on the plant's topic: new numbers, never the question that was missed
G.mathItem = m => { const qs = MG.batch(m.topic, 4), q = qs.find(x => x.q + "|" + x.a !== m.sig) || qs[0]; return Object.assign(q, { _mid: m.id }); };
G.waterMath = (n = 8) => {
  const now = Date.now(), due = WR.state.mistakes.filter(m => G.isMath(m) && G.isDue(m, now) && MG.topic(m.topic))
    .sort((a, b) => ((b.misses || 1) * 2 + (now - b.due) / DAY) - ((a.misses || 1) * 2 + (now - a.due) / DAY)).slice(0, n);
  if (!due.length) return WR.toast("🌤️ No number plants are thirsty right now!");
  const items = MR.spread(due.map(m => m.id)).map(id => G.mathItem(due.find(m => m.id === id)));
  WR.state.garden.rounds++; WR.save();
  MW.startLesson({ items, kind: "garden", key: "garden.math", grade: Math.max(...due.map(m => m.grade || 1)), title: "Garden Revival 🔢", replay: () => G.waterMath(n), back: "review" });
};
G.mathDue = () => WR.state.mistakes.filter(m => G.isMath(m) && G.isDue(m)).length;

// ---------- called by js/math.js after every answer and at the end of a round ----------
// how: "first" (right first time), "second" (right on the second try), "miss" (both tries wrong)
MR.onAnswer = (q, how, L) => {
  let pay = null, bloomed = false;
  if (L.kind === "garden" && q._mid) {   // watering: first time right grows it; a miss sends it back to a seed; a second try just waters
    if (how !== "second") { const g = G.grade(q._mid, how === "first"); if (g) { pay = g.pay; bloomed = g.bloomed; } }
  } else {
    if (L.kind === "mix" && how !== "second") pay = MR.answer(q, how === "first");
    if (how === "miss" && !L.challenge && !L.placement && isTopic(q.topic)) G.plantMath(q);
  }
  if (bloomed) L.bloomed = (L.bloomed || 0) + 1;
  return pay ? RV.reward(pay) : 0;
};
MR.onFinish = (o, score) => {
  if (o.topic && !o.guardian && !o.kind) MR.finished(o.topic, score);
  if (o.kind === "garden") { WR.questEvent("review1"); if (o.bloomed) return WR.awardStars("bloom", WR.today() + "/m" + (WR.state.lessonsDone || 0), o.bloomed * 2, { kind: "fresh" }); }
  return 0;
};

/* 🧳 older saves: topics already finished join the schedule in place (once, flag review.mmig). Their first review is 3 days
   after they were last played, or spread over the next week when that is already past. Nothing else changes. */
MR.migrate = s => {
  if (!s || typeof s !== "object" || !s.math || !s.math.topics) return s;
  const rv = s.review = s.review && typeof s.review === "object" ? s.review : { items: {} }; rv.items = rv.items || {};
  if (rv.mmig >= 1) return s;
  const now = Date.now(); let i = 0;
  Object.entries(s.math.topics).filter(([id, p]) => isTopic(id) && p && (p.best || 0) >= CONFIG.oldPass).sort((a, b) => (a[1].last || 0) - (b[1].last || 0))
    .forEach(([id, p]) => { const k = KEY(id); if (rv.items[k]) return; const t = p.last || now, back = t + RV.gapDays(1) * DAY;
      rv.items[k] = { s: 1, d: back > now ? back : now + (1 + (i++ % 7)) * DAY, t, n: 1, l: 1, r: 1 }; });
  rv.mmig = 1; return s;
};
const load0 = WR.load;
WR.load = () => MR.migrate(load0());
MR.migrate(WR.state);
})();
