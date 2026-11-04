// 🧠 AGENT-BRIEF Task 5 "Measure what lasts" (specs/005-retention): the Learning Report's "Remembered after 30 days" = % right on
// the FIRST answer to an item after a gap of 25+ days, with a fake clock through the real review callers (lessons, stand-ins,
// rule cover, maths Daily Mix + topic rounds, 🌷 Mistake Garden, 🔮 Word Charms). "Not enough data yet" below 10 answers. The
// card sits behind the parent gate beside "% right", fits 320/360/375 + landscape. Screenshots screenshots/t5_*.png.
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642') + '/', OUT = '/workspace/cefr-quest/screenshots/', DAY = 864e5;
let passed = 0, failed = 0; const ok = (c, m) => { if (c) passed++; else failed++; console.log((c ? 'ok - ' : 'FAIL ') + m); };
const SAVE = { v: 1, name: 'Ivy', avatar: 'avatar_girl', startLevel: 'a1', stars: 10, totalCorrect: 30, totalAnswered: 50, lessonsDone: 3, bonusSeen: ['sp'],
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 0, happiness: 80, hunger: 30, lastTick: Date.now() }, streak: { count: 1, last: null },
  progress: {}, owned: [], equipped: {}, settings: { rate: 1, sound: false }, mistakes: [] };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const errs = [];
  const open = async (vp, seed) => { const ctx = await browser.newContext({ viewport: vp, isMobile: vp.width < 700, hasTouch: vp.width < 700, deviceScaleFactor: 2, timezoneId: 'Asia/Singapore' });
    await ctx.addInitScript(() => { window.__WR_TEST = { holdMs: 0, pinOffer: false }; });
    await ctx.addInitScript(s => { if (!localStorage.getItem('__seeded')) { localStorage.setItem('wordRealms.save.v1', s); localStorage.setItem('__seeded', '1'); } }, JSON.stringify(seed));
    await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
    const page = await ctx.newPage(); page.on('pageerror', e => errs.push(e.message));
    await page.goto(BASE + 'index.html', { waitUntil: 'networkidle' }); await page.waitForFunction(() => window.WR && WR.Review && WR.Report && WR.MathReview && WR.Garden);
    await page.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove())); return { ctx, page }; };
  const gate = async page => { await page.evaluate(() => WR.go('report', 'week')); await page.waitForSelector('.pgate');
    const a = await page.evaluate(() => WR.parentGate._answer()); for (const d of a) await page.click(`.pgate [data-d="${d}"]`); await page.click('#pgOk'); await page.waitForSelector('#rpKept'); };
  const kept = page => page.evaluate(() => WR.Report.data('week').kept);

  let { ctx, page } = await open({ width: 360, height: 740 }, SAVE);
  ok(await page.evaluate(() => WR.Review.CONFIG.keptDays === 25 && WR.Report.KEPT.min === 10), 'one config: a 25-day gap, at least 10 answers');
  // day 0: 12 vocab words answered (first meetings never count)
  const t0 = Date.now() - 60 * DAY;
  let k = await page.evaluate(t0 => { const A = (key, ok, t, extra) => WR.Review.answer(Object.assign({ _rk: 'a1/vocab:' + key, _sk: 'a1/vocab' }, extra || {}), ok, t);
    for (let i = 1; i <= 12; i++) A('w' + i, true, t0); A('w11', true, t0 + 10 * 864e5); return WR.Report.data('week').kept; }, t0);
  ok(k.n === 0 && k.a === null, `first meetings and a 10-day gap don't count (${JSON.stringify(k)})`);
  // day 30: 9 first answers after the gap: 7 right, 2 wrong; a second answer the same day and a 20-day gap don't count
  k = await page.evaluate(t0 => { const A = (key, ok, t) => WR.Review.answer({ _rk: 'a1/vocab:' + key, _sk: 'a1/vocab' }, ok, t), d30 = t0 + 30 * 864e5;
    for (let i = 1; i <= 9; i++) A('w' + i, i <= 7, d30); A('w1', true, d30 + 36e5); A('w11', true, d30); return WR.Report.data('week').kept; }, t0);
  ok(k.n === 9 && k.right === 7 && k.a === null, `9 first answers after 25+ days (7 right): still "not enough data" (${JSON.stringify(k)})`);
  await gate(page);
  let card = await page.evaluate(() => document.querySelector('#rpKept').innerText);
  ok(/not enough data yet \(9 of 10\)/i.test(card) && /% right/.test(card) && /25 or more days/.test(card), `the Report card says "Not enough data yet (9 of 10)" beside % right, with the plain line (${card.replace(/\n/g, ' ').slice(0, 120)})`);
  await page.evaluate(() => document.querySelector('#rpKept').scrollIntoView({ block: 'center' })); await page.waitForTimeout(400); await page.screenshot({ path: OUT + 't5_360_notyet.png' });
  // the 10th: right → 8 of 10 = 80%
  k = await page.evaluate(t0 => { WR.Review.answer({ _rk: 'a1/vocab:w10', _sk: 'a1/vocab' }, true, t0 + 30 * 864e5); return WR.Report.data('week').kept; }, t0);
  ok(k.n === 10 && k.right === 8 && Math.round(k.a * 100) === 80, `10th answer: 8 of 10 = 80% (${JSON.stringify(k)})`);
  // a review stand-in counts once, for the item it stands in for; the rule cover of other due items doesn't count
  k = await page.evaluate(t0 => { const A = (key, ok, t, rv) => WR.Review.answer({ _rk: 'a1/grammar:' + key, _sk: 'past', _rv: rv }, ok, t);
    A('g1', true, t0); A('g2', true, t0); A('g3', true, t0 + 40 * 864e5, { for: 'a1/grammar:g1' }); return WR.Report.data('week').kept; }, t0);
  ok(k.n === 11 && k.right === 9, `a stand-in answer counts once (for the item it reviews); the rule cover of g2 doesn't (${JSON.stringify(k)})`);
  // maths: a Daily Mix answer and a topic round on a topic last met 25+ days ago
  k = await page.evaluate(t0 => { const ids = MathGen.gradeTopics(1).filter(t => !t.extra).map(t => t.id); WR.MathReview.finished(ids[0], 1, t0); WR.MathReview.finished(ids[1], 1, t0);
    WR.MathReview.answer({ topic: ids[0] }, false, t0 + 31 * 864e5); WR.MathReview.finished(ids[1], 0.5, t0 + 31 * 864e5); WR.MathReview.answer({ topic: ids[0] }, true, t0 + 31 * 864e5 + 36e5); return WR.Report.data('week').kept; }, t0);
  ok(k.n === 13 && k.right === 9, `maths: a Daily Mix answer and a topic round after 25+ days count (both missed); the next answer an hour later doesn't (${JSON.stringify(k)})`);
  // 🌷 Mistake Garden + 🔮 Word Charms answers go through the same rule (the real Date.now, moved 30 days on)
  k = await page.evaluate(() => { const now = Date.now(), old = now - 30 * 864e5;
    WR.state.mistakes.push({ id: 'mz1', realm: 'a1', skill: 'vocab', type: 'mcq', q: 'Pick', options: ['a', 'b'], correct: 'a', explain: 'x', at: old, t: old, n: 2, due: old, box: 1, misses: 1 });
    WR.Garden.grade('mz1', true); WR.Garden.grade('mz1', true); return WR.Report.data('week').kept; });
  ok(k.n === 14 && k.right === 10, `a Mistake Garden watering after 30 days counts once (${JSON.stringify(k)})`);
  // saved: survives a reload (inside wordRealms.save.v1, so it syncs with the cloud copy and reaches another tab)
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForFunction(() => window.WR && WR.Report);
  ok(JSON.stringify(await page.evaluate(() => WR.state.report.kept)) === '[10,4]', 'kept in the save after a reload ([right, wrong] = [10, 4])');
  const tab2 = await ctx.newPage(); await tab2.goto(BASE + 'index.html', { waitUntil: 'networkidle' }); await tab2.waitForFunction(() => window.WR && WR.Report);
  ok(JSON.stringify(await tab2.evaluate(() => WR.state.report.kept)) === '[10,4]', 'a second tab sees the same figure'); await tab2.close();
  await gate(page);
  card = await page.evaluate(() => document.querySelector('#rpKept').innerText);
  ok(/71%/.test(card) && /remembered after 30 days \(14 answers\)/i.test(card), `the Report shows 71% remembered after 30 days (14 answers) (${card.replace(/\n/g, ' ').slice(0, 110)})`);
  await ctx.close();
  // child view: no figure without the gate; phone widths fit
  for (const [n, vp] of [['320', { width: 320, height: 640 }], ['360', { width: 360, height: 740 }], ['375', { width: 375, height: 667 }], ['landscape', { width: 740, height: 360 }]]) {
    const o = await open(vp, Object.assign({}, SAVE, { report: { days: {}, tally: {}, at: 0, kept: [9, 3] } }));
    await o.page.evaluate(() => WR.go('report', 'week')); await o.page.waitForSelector('.pgate');
    ok(!(await o.page.$('#rpKept')), `${n}: behind the parent gate (no figure before the gate)`);
    const a = await o.page.evaluate(() => WR.parentGate._answer()); for (const d of a) await o.page.click(`.pgate [data-d="${d}"]`); await o.page.click('#pgOk'); await o.page.waitForSelector('#rpKept');
    const f = await o.page.evaluate(() => { const c = document.querySelector('#rpKept').getBoundingClientRect(), cells = [...document.querySelectorAll('#rpKept .rp-kc')].map(e => e.getBoundingClientRect());
      return { right: c.right <= innerWidth + 1, scroll: document.documentElement.scrollWidth > innerWidth + 1, cells: cells.every(r => r.width > 100 || innerWidth < 340 && r.width > 90), txt: document.querySelector('#rpKept').innerText }; });
    ok(f.right && !f.scroll && f.cells && /75%\s*remembered after 30 days \(12 answers\)/i.test(f.txt) && /60%\s*right, every answer/i.test(f.txt), `${n}: the card fits (no sideways scroll): 60% right beside 75% remembered for [9, 3]`);
    await o.page.evaluate(() => document.querySelector('#rpKept').scrollIntoView({ block: 'center' })); await o.page.waitForTimeout(400); await o.page.screenshot({ path: OUT + `t5_${n}_kept.png` });
    await o.ctx.close();
  }
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  console.log(`retention: ${passed} passed, ${failed} failed`); await browser.close(); process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
