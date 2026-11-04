/* 🔁 One review system for English (AGENT-BRIEF-2026-11-04 Task 2, specs/002-review-engine/).
   One schedule, one config, used by realm lessons, the Singapore track, the 🌷 Mistake Garden and 🔮 Word Charms:
   - a right answer moves an item up one step, and the next review comes after a growing gap (CONFIG.gaps, in days),
     but only after a real gap since its last answer (CONFIG.minGapH): a right answer minutes after a mistake moves nothing;
   - a wrong answer shortens the gap (back to step 0, due again soon) — kindly: nothing earned is ever taken away;
   - after the last gap an item rests (CONFIG.rest) and still comes back now and then. Nothing retires for good.
   Lesson records: WR.state.review.items["<rid>/<skill>:<itemKey>"] = { s: step, d: next due ms, t: last answer ms,
   l: last result 1|0, n: answers, r: right, w: wrong, sk: skill tag, g: 1 once the Mistake Garden owns it }.
   A lesson of 8 holds up to 3 due reviews + 5 new (WR.buildItems / SG.items); a review slot prefers a *different* item
   with the same skill tag (`sk`, added by tools/build_data.py), so a child learns the rule and not one familiar question. */
(function () {
const WR = window.WR, DAY = 864e5, HOUR = 36e5;
const CONFIG = {
  gaps: [3, 10, 30, 90],   // days to the next review after the 1st, 2nd, 3rd and 4th real-gap right answer
  rest: 180,               // days between reviews after the last gap (bloomed plants, 💎 charms, strong items): rare, never retired
  wrong: 1,                // days: a wrong answer in a lesson brings the item back after this short gap (step 0)
  minGapH: 20,             // hours: a right answer only moves an item up if its last answer was at least this long ago
  early: 0.1,              // …and only when due, or within the last tenth of its gap
  lesson: 8, perLesson: 3, // a lesson: up to 3 due reviews + new items to 8 (otherwise 8 new); no reviews in boss rounds
  keptDays: 25,            // 🧠 Learning Report "Remembered after 30 days": the first answer to an item after a gap of this many days (AGENT-BRIEF Task 5)
  star: 1,                 // ⭐ for a right review answer that moved its item up (daily cap: WR.EARN.review, inside the 150 cap)
  // skills where a tag names a rule or a skill (past simple, listening for numbers, reading for a reason): a review asks a
  // *different* item on that skill, and a right answer also counts for the other items on it that are due. Vocabulary
  // (and the Singapore games) review the item itself: knowing "banana" doesn't review "apple".
  rule: ["grammar", "listening", "reading"],
  // a busy word bank: vocabulary reviews the word itself, so when at least `overdue` words are waiting, a lesson takes one
  // more review (4 new + 4 review, still 8 questions). Word Charms answers also count as the review of the same word.
  busy: { skills: ["vocab"], overdue: 8, perLesson: 4 }
};
const RV = WR.Review = { CONFIG, DAY, HOUR };
// 🧠 one child answer to this record: if its last answer was keptDays+ ago, it is the first answer after a long gap and counts
// for "Remembered after 30 days" (WR.keptAnswer). Call BEFORE RV.step (which moves t). Not for records moved by another answer.
RV.kept = (rec, ok, now = Date.now()) => { if (!rec || !rec.n || !rec.t || now - rec.t < CONFIG.keptDays * DAY) return false; WR.keptAnswer && WR.keptAnswer(ok); return true; };
RV.gapDays = s => s <= 0 ? CONFIG.wrong : s <= CONFIG.gaps.length ? CONFIG.gaps[s - 1] : CONFIG.rest;
// ⏱️ the one rule, for every schedule. rec { s, d, t, l, n, r, w } is changed in place.
// o.floor: lowest step a wrong answer drops to (a caught charm stays caught); o.wrongDays: how soon a wrong item is due again
RV.step = (rec, ok, now = Date.now(), o = {}) => {
  // moves up only after a real gap since the last answer, and only when due (a little early is fine: the last tenth of
  // the gap). Meeting a resting item again early (a bank that has rotated) is practice: it doesn't speed the schedule up.
  const gapMs = RV.gapDays(rec.s || 0) * DAY, dueish = rec.d == null || now >= rec.d - gapMs * CONFIG.early;
  const first = !rec.n, real = first || ((!rec.t || now - rec.t >= CONFIG.minGapH * HOUR) && dueish);
  let moved = false;
  if (ok) {
    rec.r = (rec.r || 0) + 1;
    if (real) { rec.s = (rec.s || 0) + 1; rec.d = now + RV.gapDays(rec.s) * DAY; moved = true; }
    else if (rec.t) rec.d = Math.max(rec.d || 0, rec.t + CONFIG.minGapH * HOUR);   // too soon: not yet, but not "thirsty" again straight away
  } else {
    rec.w = (rec.w || 0) + 1; rec.s = Math.min(rec.s || 0, o.floor || 0);
    rec.d = now + (o.wrongDays != null ? o.wrongDays : CONFIG.wrong) * DAY;
  }
  rec.t = now; rec.l = ok ? 1 : 0; rec.n = (rec.n || 0) + 1;
  return { moved, s: rec.s };
};
const st = () => WR.block("review");
RV.items = () => st().items;
// keys: one per item in its bank ("a1/grammar:<itemKey>"); a reading question carries its passage title (questions can repeat)
RV.key = (scope, q, p) => scope + ":" + WR.itemKey(p ? Object.assign({}, q, { title: p.title }) : q);
RV.tag = (it, scope, q, p) => Object.assign(it, { _rk: RV.key(scope, q, p), _sk: q.sk || scope });
// every answered lesson item (right or wrong) updates its record; a review stand-in also moves the item it stands in for
RV.answer = (it, ok, now = Date.now()) => {
  if (!it || !it._rk) return null;
  const items = RV.items(), rec = items[it._rk] = items[it._rk] || {};
  const stand = it._rv && it._rv.for && it._rv.for !== it._rk;   // a stand-in is the review of the item it stands in for
  RV.kept(stand ? items[it._rv.for] : rec, ok, now);
  const own = RV.step(rec, ok, now); if (it._sk) rec.sk = it._sk;
  if (!ok) rec.g = 1;                                       // the Mistake Garden owns it from now on (js/lesson.js plants it)
  let main = own, covered = 0;
  if (it._rv && it._rv.for && it._rv.for !== it._rk) { const f = items[it._rv.for] = items[it._rv.for] || {}; main = RV.step(f, ok, now); }
  // a rule skill: the other due items on the same skill tag count as reviewed too (each still needs its own real gap)
  if (ok && it._rv && RV.isRule(it._rk) && it._sk) for (const [k, r] of RV.due(it._rk.slice(0, it._rk.indexOf(":")), now))
    if (k !== it._rk && k !== it._rv.for && r.sk === it._sk && RV.step(r, true, now).moved) covered++;
  WR.save();
  // ⭐ a review that moved its item up pays once per answer number, capped a day (WR.awardStars kind "review")
  const forKey = it._rv ? it._rv.for : null;
  return { moved: main.moved, s: main.s, covered, pay: it._rv && ok && main.moved ? forKey + "#" + items[forKey].n : null };
};
RV.reward = (key, o = {}) => key ? WR.awardStars("review", key, CONFIG.star, Object.assign({ kind: "review", quiet: true }, o)) : 0;
// due lesson records in one bank, most overdue first (garden-owned ones are reviewed in the garden)
RV.due = (scope, now = Date.now()) => Object.entries(RV.items()).filter(([k, r]) => r.n && !r.g && r.d <= now && k.startsWith(scope + ":")).sort((a, b) => a[1].d - b[1].d);
// review slots for one bank's next lesson: 3, or 4 when a busy bank has many words waiting
RV.slots = (scope, now = Date.now()) => { const b = CONFIG.busy, sk = String(scope).split("/")[1];
  return b.skills.includes(sk) && RV.due(scope, now).length >= b.overdue ? b.perLesson : CONFIG.perLesson; };
RV.dueCount = (now = Date.now()) => Object.values(RV.items()).filter(r => r.n && !r.g && r.d <= now).length;
RV.isRule = key => CONFIG.rule.includes(String(key).split(":")[0].split("/")[1]);
const resting = (r, now) => r && (r.g || r.d > now);      // has its own later date (or lives in the garden)
// move picked keys to the recent end of a freshPick bucket, so a review stand-in isn't served again as "new" straight away
const markSeen = (bucket, keys) => { if (!bucket || !keys.length) return; const s = WR.state; s.seen = s.seen || {};
  s.seen[bucket] = (s.seen[bucket] || []).filter(k => !keys.includes(k)).concat(keys); };
/* up to n review items for one bank, most overdue first. A rule skill: one slot per skill tag, served by a different item
   with that tag (not in this lesson, not resting on its own later date), else the item itself. Vocabulary: the item itself.
   o.bucket: the freshPick bucket the bank uses. */
RV.pick = (scope, pool, n = CONFIG.perLesson, o = {}) => {
  const now = Date.now(), items = RV.items(), out = [], used = new Set(o.skip || []), seen = [];
  if (n <= 0) return out;
  const byKey = new Map(), bySk = new Map();
  for (const q of pool) { const k = RV.key(scope, q); byKey.set(k, q); if (q.sk) { if (!bySk.has(q.sk)) bySk.set(q.sk, []); bySk.get(q.sk).push([k, q]); } }
  const rule = RV.isRule(scope + ":"), usedSk = new Set();
  for (const [k] of RV.due(scope, now)) {
    if (out.length >= n) break;
    const own = byKey.get(k); if (!own || used.has(k)) continue;   // gone from the bank, or already in this lesson
    if (rule && own.sk) { if (usedSk.has(own.sk)) continue; usedSk.add(own.sk); }   // one review per skill covers its due items
    const sibs = rule ? WR.shuffle((bySk.get(own.sk) || []).filter(([kk]) => kk !== k && !used.has(kk) && !resting(items[kk], now))) : [];
    const [kk, q] = sibs[0] || [k, own]; used.add(k); used.add(kk); seen.push(WR.itemKey(q));
    out.push(Object.assign(WR.normalize(q), { _rk: kk, _sk: own.sk || scope, _rv: { for: k, same: kk === k } }));
  }
  markSeen(o.bucket, seen);
  return out;
};
/* 📖 reading: questions live in their passage, so a review slot is one earlier passage with due questions (most due first),
   its due questions first, up to n questions. Returns { passage, items } or null. */
RV.pickPassage = (scope, passages, n = CONFIG.perLesson, o = {}) => {
  const now = Date.now(), due = new Map(RV.due(scope, now).map(([k, r]) => [k, r.d]));
  if (!due.size || n <= 0) return null;
  let best = null;
  for (const p of passages) {
    const qs = p.questions.map(q => [RV.key(scope, q, p), q]), d = qs.filter(([k]) => due.has(k));
    if (d.length && (!best || d.length > best.d.length || (d.length === best.d.length && Math.min(...d.map(([k]) => due.get(k))) < best.first)))
      best = { p, qs, d, first: Math.min(...d.map(([k]) => due.get(k))) };
  }
  if (!best || (o.skip && o.skip.has(best.p))) return null;
  const dueKeys = new Set(best.d.map(([k]) => k)), order = best.d.concat(best.qs.filter(([k]) => !dueKeys.has(k))).slice(0, n);
  markSeen(o.bucket, [WR.itemKey(best.p)]);
  // keep the text's own question order
  const keep = new Set(order.map(([k]) => k));
  return { passage: best.p, items: best.qs.filter(([k]) => keep.has(k)).map(([k, q]) => Object.assign(WR.normalize(q, best.p), { _rk: k, _sk: q.sk || scope }, dueKeys.has(k) ? { _rv: { for: k, same: true } } : {})) };
};
/* 🔮 a graded Word Charms answer counts as the review of that word in the level's vocabulary bank: every vocab record whose
   item asks for the word (its right answer, or the word quoted in the question) moves on the same rule (same 20 h gap).
   Words the child hasn't met in a lesson yet have no record, so nothing is created. Returns the number of records moved. */
const wordIdx = {};
const wordsOf = async lvl => wordIdx[lvl] || (wordIdx[lvl] = WR.bank(lvl, "vocab").then(bank => { const m = new Map();
  const add = (w, k) => { w = String(w || "").toLowerCase().trim(); if (!w) return; if (!m.has(w)) m.set(w, []); m.get(w).push(k); };
  for (const q of bank) { const k = RV.key(lvl + "/vocab", q); add(q.options && Number.isInteger(q.answer) ? q.options[q.answer] : q.answer, k);
    for (const x of String(q.q || "").matchAll(/[“"‘']([A-Za-z][A-Za-z' -]{0,30})[”"’']/g)) add(x[1], k); }
  return m; }).catch(() => new Map()));
RV.creditWord = async (lvl, word, ok, now = Date.now()) => {
  const keys = (await wordsOf(lvl)).get(String(word).toLowerCase().trim()) || [], items = RV.items(); let moved = 0;
  for (const k of new Set(keys)) { const r = items[k]; if (!r || !r.n || r.g) continue; if (RV.step(r, ok, now).moved) moved++; }
  if (keys.length) WR.save();
  return moved;
};
// ☁️ two saves of the same player (cloud load): per record, the one answered last wins; nothing is lost from either
RV.merge = (a, b) => {
  a = a && typeof a === "object" ? a : {}; b = b && typeof b === "object" ? b : {};
  const out = Object.assign({}, b, a, { items: Object.assign({}, b.items || {}) });
  for (const [k, r] of Object.entries(a.items || {})) { const o = out.items[k]; if (!o || (r.t || 0) >= (o.t || 0)) out.items[k] = r; }
  return out;
};

/* 🧳 older saves migrate in place (inside wordRealms.save.v1; runs on every load, so it also covers a cloud or other-tab save):
   - 🌷 bloomed plants were retired for good: they now come back after the 90-day gap (spread over a month if already past);
   - 🔮 mastered charms (💎) never came back: they now come back after the rest gap, spread the same way.
   Nothing is removed: every plant, charm, star, sticker and bloom count stays. */
const spread = (i, now) => now + (1 + (i % 30)) * DAY;
RV.migrate = s => {
  if (!s || typeof s !== "object") return s;
  const rv = s.review = s.review && typeof s.review === "object" ? s.review : { items: {} }; rv.items = rv.items || {};
  if (rv.mig >= 1) return s;
  const now = Date.now(); let i = 0;
  (s.mistakes || []).forEach(m => { if (!m || typeof m !== "object") return;
    if (m.t == null) m.t = m.at || now;
    if (m.bloomed) { m.box = Math.max(m.box || 0, 4); const back = (m.bloomedAt || m.at || now) + RV.gapDays(4) * DAY; m.due = back > now ? back : spread(i++, now); } });
  const cards = s.charms && s.charms.cards || {};
  Object.values(cards).forEach(c => { if (c && c.b >= 5) { const back = (c.d || now) + CONFIG.rest * DAY; c.d = back > now ? back : spread(i++, now); } });
  rv.mig = 1; return s;
};
const load0 = WR.load;
WR.load = () => RV.migrate(load0());
RV.migrate(WR.state);   // saved with the next change (a visitor with no save yet gets none written)
})();
