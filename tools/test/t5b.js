// 🏁 BRIEF-T5B (Jeremy 2026-11-05): the ✨ crown check is back to 3 of 4 (WR.PASS.checkNeed); the last 60% uses read the shared
// pass mark WR.PASS.mark: Learning Report colours (two kind tones: passed / still growing, no red), weak spots, the maths
// "weak topic" lesson nudge and the writing tally. Older saves keep everything (display-only changes). Screenshot screenshots/t5b_report.png.
const { chromium } = require('playwright-core');
const BASE = process.env.BASE || 'http://127.0.0.1:18642', OUT = '/workspace/cefr-quest/screenshots/';
let passed = 0, failed = 0; const ok = (c, m) => { if (c) passed++; else failed++; console.log((c ? 'ok - ' : 'FAIL ') + m); };
const SAVE = { v: 1, name: 'Kai', avatar: 'avatar_girl', startLevel: 'a1', stars: 10, totalCorrect: 20, totalAnswered: 24, lessonsDone: 3, bonusSeen: ['sp'],
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 0, happiness: 80, hunger: 30, lastTick: Date.now() }, streak: { count: 1, last: null },
  progress: { a1: { grammar: { best: 0.75, plays: 2, last: Date.now() - 864e5 }, vocab: { best: 1, plays: 1, last: Date.now() - 864e5 } } }, owned: [], equipped: {}, settings: { rate: 1, sound: false }, mistakes: [],
  report: { days: {}, tally: {}, at: 0, kept: [0, 0] } };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await ctx.addInitScript(s => { window.__WR_TEST = { holdMs: 0, pinOffer: false }; if (!localStorage.getItem('__seeded')) { localStorage.setItem('wordRealms.save.v1', s); localStorage.setItem('__seeded', '1'); } }, JSON.stringify(SAVE));
  await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
  const errs = [], page = await ctx.newPage(); page.on('pageerror', e => errs.push(e.message));
  await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' }); await page.waitForFunction(() => window.WR && WR.Report && WR.PASS);
  const c = await page.evaluate(() => ({ P: WR.PASS, k4: WR.checkCount(4), c34: WR.checkPasses(3 / 4, 4), c24: WR.checkPasses(2 / 4, 4) }));
  ok(c.P.checkNeed === 3 && c.k4 === 3 && c.c34 && !c.c24 && c.P.mark === 0.85 && c.P.boss === 3, 'crown check back to 3 of 4 (its own setting); mark 0.85, boss at 3 unchanged');
  // report: tallies 9/10 (90%), 8/10 (80%), 5/10 (50%) → passed, growing, growing (no red)
  await page.evaluate(() => { const t = WR.state.report.tally; t['a1/grammar'] = [9, 1]; t['a1/vocab'] = [8, 2]; t['a1/reading'] = [5, 5]; WR.save(); });
  await page.evaluate(() => WR.go('report', 'all')); await page.waitForSelector('.pgate');
  const a = await page.evaluate(() => WR.parentGate._answer()); for (const d of a) await page.click(`.pgate [data-d="${d}"]`); await page.click('#pgOk'); await page.waitForSelector('#report');
  const r = await page.evaluate(() => { const cell = t => [...document.querySelectorAll('.rp-table td')].find(td => td.innerText.startsWith(t)); return {
    g: (cell('90%') || {}).className, v: (cell('80%') || {}).className, rd: (cell('50%') || {}).className, lo: document.querySelectorAll('#report .lo').length,
    key: (document.querySelector('.rp-key') || {}).innerText || '', weak: [...document.querySelectorAll('.rp-weak')].map(w => w.innerText.replace(/\n/g, ' ')) }; });
  ok(/hi/.test(r.g) && /mid/.test(r.v) && /mid/.test(r.rd) && r.lo === 0, `report colours on the 85% mark: 90% passed (mint), 80% and 50% still growing (butter), no red (${r.g} | ${r.v} | ${r.rd})`);
  ok(/85%\+ passed/.test(r.key) && /under 85%: still growing/.test(r.key) && !/60/.test(r.key), `the key says "85%+ passed · under 85%: still growing 🌱" (${r.key.slice(0, 70)})`);
  ok(r.weak.some(w => /Vocab|Vocabulary/.test(w) && /8 of 10/.test(w)), `weak spots: an 80% skill is now a spot to practise (was only under 60%): ${r.weak.join(' / ').slice(0, 120)}`);
  await page.$eval('.rp-table', e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300); await page.screenshot({ path: OUT + 't5b_report.png' });
  // older saves keep everything: best 75% grammar keeps its record (display only)
  ok(await page.evaluate(() => WR.state.progress.a1.grammar.best === 0.75 && WR.state.progress.a1.vocab.best === 1), 'older save: saved best scores untouched');
  // the maths nudge + writing tally read the shared mark (source check: both paths need long rounds; the behaviour is the one constant)
  const src = await page.evaluate(async () => ({ m: await (await fetch('js/math.js')).text(), w: await (await fetch('js/writing.js')).text(), l: await (await fetch('js/learn.js')).text() }));
  ok(/score < WR\.PASS\.mark \? WR\.Learn\.nudgeHTML/.test(src.m) && !/score < 0\.6/.test(src.m), 'maths: a topic round under 85% offers its 📜 lesson (was under 60%)');
  ok(/r\.total \/ 20 >= WR\.PASS\.mark/.test(src.w) && !/>= 0\.6\)/.test(src.w), 'writing: a checked draft counts as right in the Report at the pass mark (17/20, was 12/20)');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  console.log(`t5b: ${passed} passed, ${failed} failed`); await browser.close(); process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
