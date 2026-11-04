// 📏 Re-measures the AGENT-BRIEF-2026-11-04 top-table numbers that Task 2 touches, with a fake clock, through the game's own code.
// (The brief's tests-2026-11-04/sim.js was not in the repo, so this is our own.) Works on the code before and after Task 2:
// if WR.Review exists, lessons are built with reviews on and every answer is recorded the way js/lesson.js does it.
// Run: NODE_PATH=$(npm root -g) BASE=http://127.0.0.1:18642 node tools/sim/brief-table.js  [OUT=file.json]
const { chromium } = require('playwright-core');
const BASE = process.env.BASE || 'http://127.0.0.1:18642', DAY = 864e5;
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1000, height: 800 } });
  await ctx.addInitScript(() => {   // fake clock: Date.now() and new Date() follow window.__shift(ms)
    window.__WR_CLASSIC_ONLY = false; const R = Date, real = R.now.bind(R); let off = +(sessionStorage.getItem('__off') || 0);
    class F extends R { constructor(...a) { super(...(a.length ? a : [real() + off])); } static now() { return real() + off; } }
    window.Date = F; window.__shift = ms => { off += ms; sessionStorage.setItem('__off', off); };
  });
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  const fresh = async () => {
    await page.goto(BASE + '/index.html'); await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify({
      v: 1, name: 'Sim', avatar: 'avatar_mage', startLevel: 'a1', stars: 0, totalCorrect: 0, totalAnswered: 0,
      pet: { species: 'pet_fox', name: 'Mochi', xp: 0, happiness: 80, hunger: 20, skin: null, lastTick: Date.now() },
      streak: { count: 0, last: null }, progress: {}, owned: [], equipped: {}, settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 0 })); });
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForFunction(() => window.WR && WR.realms);
  };
  // one "lesson": build items like WR.startLesson does, answer every one (right unless wrong(it)), record like answer() does
  const lessonFn = () => { window.__lesson = async (rid, skill, wrongKeys = []) => {
    const RV = WR.Review, items = RV ? await WR.buildItems(rid, skill, 8, { review: true }) : await WR.buildItems(rid, skill);
    const out = items.map(it => ({ k: it._rk || (it._raw ? WR.itemKey(it._raw) : WR.itemKey(it)) , rv: !!it._rv, for: it._rv ? it._rv.for : null, sk: it._sk || null }));
    for (const it of items) { const ok = !wrongKeys.includes(it._rk); if (RV) RV.answer(it, ok); if (!ok) WR.Garden.plant(it, rid, skill); }
    return out; }; };
  const res = { base: BASE, engine: null };
  // ---------- A: when does an item answered right come back? ----------
  for (const [rid, skill] of [['a1', 'grammar'], ['a1', 'vocab'], ['a1', 'reading']]) {
    // A1: lessons in a row on one day
    await fresh(); await page.evaluate(lessonFn); res.engine = await page.evaluate(() => WR.Review ? 'review.js' : 'freshPick only');
    const L = []; for (let i = 0; i < 40; i++) L.push(await page.evaluate(([r, s]) => __lesson(r, s), [rid, skill]));
    const first = new Map(), back = [];
    L.forEach((ls, i) => ls.forEach(x => { if (first.has(x.k)) { if (first.get(x.k) !== null) { back.push(i - first.get(x.k)); first.set(x.k, null); } } else first.set(x.k, i); }));
    back.sort((a, b) => a - b);
    // A2: one lesson a day for 200 days; which days does the first lesson's item (or its same-skill stand-in) come back?
    await fresh(); await page.evaluate(lessonFn);
    const seen = {}, days = []; res._h = {};
    for (let d = 0; d < 200; d++) {
      const ls = await page.evaluate(([r, s]) => __lesson(r, s), [rid, skill]);
      ls.forEach(x => { const k = x.for || x.k; (seen[k] = seen[k] || []).push(d); });
      days.push(ls); if (d === 0) res._k0 = ls.map(x => x.k);
      const st = await page.evaluate(ks => WR.Review ? ks.map(k => (WR.Review.items()[k] || {}).s || 0) : [], res._k0); st.forEach((v, i) => { const h = (res._h = res._h || {})[i] = res._h[i] || [0]; if (v > h[0]) { h[0] = v; h.push(d); } });
      await page.evaluate(ms => __shift(ms), DAY);
    }
    const day0 = days[0].map(x => x.k), track = day0.map(k => seen[k]);
    // first 6 lessons (one a day): items an earlier lesson already asked
    const asked = new Set(); let earlier = 0, total = 0;
    days.slice(0, 6).forEach(ls => { ls.forEach(x => { total++; if (asked.has(x.for || x.k)) earlier++; }); ls.forEach(x => asked.add(x.for || x.k)); });
    // with review on: every 8th day lessons hold how many reviews?
    const revShare = days.map(ls => ls.filter(x => x.rv).length);
    res[rid + '/' + skill] = { lessonsUntilBack_sameDay: { min: back[0], median: back[back.length >> 1], max: back[back.length - 1], n: back.length },
      daysSeen_firstLessonItems: track.slice(0, 3).map(t => t.slice(0, 7)), firstReturnDay: (t => t.sort((a, b) => a - b)[t.length >> 1])(track.map(t => t[1] ?? null).filter(x => x != null)),
      earlierItemsIn6Lessons: `${earlier} of ${total}`, recordStepDays_firstLessonItems: Object.values(res._h || {}).map(h => h.slice(1)), reviewsPerLesson_days0to15: revShare.slice(0, 16), lessonSizes_days0to15: days.slice(0, 16).map(l => l.length) };
  }
  // ---------- C: Mistake Garden gaps (water it right whenever it is due) ----------
  await fresh(); await page.evaluate(lessonFn);
  res.garden = await page.evaluate(async () => {
    const bank = await WR.bank('a1', 'grammar'), it = WR.normalize(bank[3]); WR.Garden.plant(it, 'a1', 'grammar');
    const id = WR.state.mistakes[0].id, out = { gaps: [], retired: false };
    // a right answer five minutes after the mistake
    __shift(5 * 60e3); const r = WR.Garden.grade(id, true); out.boxAfter5min = r && r.box;
    let last = Date.now(), asked = 0;
    for (let d = 0; d < 800; d++) { __shift(864e5 / 2);
      const due = WR.Garden.roundItems(50).find(x => x._mid === id);
      if (due) { asked++; out.gaps.push(Math.round((Date.now() - last) / 864e5 * 10) / 10); last = Date.now(); WR.Garden.grade(id, true); } }
    const m = WR.state.mistakes.find(x => x.id === id); __shift(3000 * 864e5); out.retired = !m || !WR.Garden.roundItems(400).some(x => x._mid === id);   // still comes back ~8 years on?
    out.asked = asked; out.longestGapDays = Math.max(...out.gaps); out.final = m ? { box: m.box, bloomed: m.bloomed } : null; return out;
  });
  // ---------- D: recognition share (mcq, listen, picq) across the core banks ----------
  res.recognition = await page.evaluate(async () => {
    let rec = 0, all = 0; for (const r of WR.realms.realms || WR.realms) for (const k of ['grammar', 'vocab', 'listening', 'reading']) {
      const b = await WR.bank(r.id, k).catch(() => null); if (!b) continue; const items = k === 'reading' ? b.passages.flatMap(p => p.questions) : b;
      for (const q of items) { all++; if (['mcq', 'listen', 'picq'].includes(q.type || 'mcq')) rec++; } }
    return `${Math.round(rec / all * 100)}% (${rec}/${all})`; });
  res.errors = errors;
  console.log(JSON.stringify(res, null, 1));
  if (process.env.OUT) require('fs').writeFileSync(process.env.OUT, JSON.stringify(res, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
