// 🔢 BRIEF-T3 spaced and mixed maths (js/math-review.js) with a fake clock: finished topics join the one review schedule,
// the 🎲 Daily Mix (≈5 questions, mixed order, earlier grades, no same-topic neighbours), maths mistakes in the Mistake
// Garden coming back as fresh questions, capped review stars, the Singapore track, save migration + merge, phone widths.
const { chromium } = require('playwright-core');
const BASE = process.env.BASE || 'http://127.0.0.1:18642', URL = BASE + '/index.html', OUT = '/workspace/cefr-quest/screenshots/';
const DAY = 864e5, H = 36e5;
let passed = 0; const assert = (c, m) => { if (!c) throw new Error('ASSERT ' + m); passed++; console.log('ok -', m); };
const SAVE = extra => Object.assign({ v: 1, name: 'Rae', avatar: 'avatar_mage', startLevel: 'a1', stars: 40, totalCorrect: 0, totalAnswered: 0,
  pet: { species: 'pet_fox', name: 'Mochi', xp: 0, happiness: 80, hunger: 20, skin: null, lastTick: Date.now() }, streak: { count: 1, last: null },
  progress: {}, owned: [], equipped: {}, settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 0 }, extra || {});
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const mkctx = async (vp = { width: 1100, height: 850 }) => {
    const ctx = await browser.newContext({ viewport: vp, hasTouch: vp.width < 600, isMobile: vp.width < 600 });
    await ctx.addInitScript(() => { const R = Date, real = R.now.bind(R); let off = +(localStorage.getItem('__off') || 0);
      class F extends R { constructor(...a) { super(...(a.length ? a : [real() + off])); } static now() { return real() + off; } }
      window.Date = F; window.__shift = ms => { off += ms; localStorage.setItem('__off', off); }; });
    return ctx;
  };
  const errors = [];
  const open = async (ctx, save) => {
    const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::/.test(m.text())) errors.push(m.text()); });
    if (save !== undefined) { await page.goto(BASE + '/manifest.webmanifest'); await page.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, save); }
    await page.goto(URL); await page.waitForFunction(() => window.WR && WR.Math && WR.MathReview); await page.waitForTimeout(600); return page;
  };
  // answer the maths question on screen through the real controls: right, or wrong (a readable wrong answer)
  const answer = async (page, right) => {
    const q = await page.evaluate(() => { const q = WR.Math._dbg(); return q && { kind: q.kind, a: q.a, options: q.options, set: !!q.set, topic: q.topic, q: q.q }; });
    if (q.kind === 'mcq') { const idx = right ? await page.evaluate(() => { const q = WR.Math._dbg(); const i = q.options.indexOf(q.a); return i >= 0 ? i : q.options.findIndex(o => MathGen.check(q, o).ok); }) : await page.evaluate(() => { const q = WR.Math._dbg(); return [...document.querySelectorAll('#main .mopts .opt[data-k]')].map(b => [b, +b.dataset.k]).filter(([b, k]) => !b.disabled && !MathGen.check(q, q.options[k]).ok).map(([, k]) => k)[0]; }); await page.click(`.mopts .opt[data-k="${idx}"]`); }
    else if (q.set) { await page.focus('#cface'); for (let i = 0; i < 300; i++) { await page.keyboard.press('ArrowRight'); const t = await page.evaluate(() => WR.Math.Clock.time()); if (right ? t === q.a : t !== q.a) break; } await page.click('#mcheck'); }
    else { const val = right ? q.a : await page.evaluate(() => { const q = WR.Math._dbg(); return ['999999', '11:59', '999 r 1', '999:1', '999, 998', '(999, 998)', '-999'].find(v => { const r = MathGen.check(q, v); return !r.ok && !r.bad && !r.empty; }); });
      await page.fill('#mans', val); await page.click('#mcheck'); }
    await page.waitForTimeout(60); return q;
  };
  const next = async page => { await page.waitForSelector('#mnext'); await page.click('#mnext'); await page.waitForTimeout(60); };
  const playAll = async (page, right = () => true) => { const log = [];
    for (let i = 0; i < 12; i++) { if (await page.$('.result')) break; await page.waitForSelector('.mopts .opt, #mans, #cface', { timeout: 8000 });
      const ok = right(i); const q = await answer(page, ok); if (!ok && !(await page.$('#mnext'))) await answer(page, false); log.push(Object.assign(q, { ok })); await next(page); }
    await page.waitForSelector('.result'); return log; };
  const ctx = await mkctx();

  // ---------- 1. one config, inside the review config ----------
  let page = await open(ctx, SAVE({ math: { grade: 4 } }));
  const cfg = await page.evaluate(() => ({ m: WR.Review.CONFIG.math, gaps: WR.Review.CONFIG.gaps }));
  assert(cfg.m.mix === 5 && cfg.m.pass === 0.85 && cfg.m.pass === (await page.evaluate(() => WR.PASS.mark)) && cfg.m.oldPass === 0.6 && cfg.gaps.join() === '3,10,30,90', 'maths review lives in the one review config: 5-question mix, the shared 85% pass mark (WR.PASS.mark; the old 0.6 only for moving older saves), gaps 3/10/30/90');
  const fin = await page.evaluate(() => { const t = MathGen.gradeTopics(4).filter(t => !t.extra).map(t => t.id).slice(-2); const a = WR.MathReview.finished(t[0], 6 / 8), b = WR.MathReview.finished(t[1], 7 / 8);
    const r = [WR.MathReview.rec(t[0]), WR.MathReview.rec(t[1])]; delete WR.Review.items()['math:' + t[0]]; delete WR.Review.items()['math:' + t[1]]; WR.save(); return { a, b: !!b, r0: !!r[0], r1: !!(r[1] && r[1].n) }; });
  assert(!fin.a && !fin.r0 && fin.b && fin.r1, 'Daily Mix "finished" = the 85% mark: 6 of 8 (75%) is not finished, 7 of 8 is (BRIEF-T4B)');

  // ---------- 2. single-topic rounds stay for first learning; finishing one starts its review record ----------
  const g4 = await page.evaluate(() => MathGen.gradeTopics(4).filter(t => !t.extra && t.id !== 'g3.clock').map(t => t.id));
  const single = await page.evaluate(t => WR.Math.buildItems({ topic: t }).map(q => q.topic), g4[0]);
  assert(single.length === 8 && single.every(t => t === g4[0]), 'a topic round is still 8 questions on that one topic');
  await page.evaluate(t => WR.Math.startLesson({ topic: t }), g4[0]);
  await playAll(page);
  const r0 = await page.evaluate(t => WR.MathReview.rec(t), g4[0]);
  assert(r0 && r0.s === 1 && Math.round((r0.d - r0.t) / DAY) === 3, `finishing ${g4[0]} put it on the schedule: back in 3 days`);
  await page.evaluate(t => WR.Math.startLesson({ topic: t }), g4[1]);
  await playAll(page, i => i >= 6);   // 2 of 8: not finished
  assert(!(await page.evaluate(t => WR.MathReview.rec(t), g4[1])), `a weak round on ${g4[1]} (not finished) makes no review record`);

  // ---------- 3. maths mistakes go to the Mistake Garden, one plant per topic ----------
  const pl = await page.evaluate(t => { const m = WR.state.mistakes.find(x => x.id === 'math_' + t); return m && { type: m.type, topic: m.topic, grade: m.grade, sig: m.sig, box: m.box, misses: m.misses }; }, g4[1]);
  assert(pl && pl.type === 'math' && pl.topic === g4[1] && pl.grade === 4, `the 6 missed ${g4[1]} questions are one 🔢 plant in the garden (missed ${pl && pl.misses}×)`);
  // watering minutes later: a fresh question on the same topic, not the missed one; right but too soon = watered, not grown
  await page.evaluate(() => WR.go('review')); await page.waitForSelector('#waterBtn');
  const gv = await page.evaluate(() => ({ plot: !!document.querySelector('.plot[data-id^="math_"]'), pill: (document.querySelector('.plot[data-id^="math_"] .pl-meta') || {}).innerHTML }));
  assert(gv.plot && /G4/.test(gv.pill) && /🔢|<img/.test(gv.pill), 'the garden shows the number plant with its grade and 🔢 ' + JSON.stringify(gv));
  await page.click('#waterBtn'); await page.waitForSelector('.mopts .opt, #mans, #cface');
  const wq = await page.evaluate(() => { const q = WR.Math._dbg(), L = WR.Math.lesson(); return { topic: q.topic, sig: q.q + '|' + q.a, kind: L.kind, n: L.items.length }; });
  assert(wq.kind === 'garden' && wq.topic === g4[1] && wq.sig !== pl.sig, `watering asks a new ${g4[1]} question (new numbers), not the missed one`);
  await answer(page, true); await next(page); await page.waitForSelector('.result');
  assert(await page.evaluate(t => WR.state.mistakes.find(x => x.id === 'math_' + t).box, g4[1]) === 0, 'right minutes after the mistake: watered, not grown (20 h rule)');
  await page.evaluate(() => __shift(21 * 3600e3)); await page.evaluate(() => WR.go('review'));
  await page.waitForSelector('#waterBtn'); await page.click('#waterBtn'); await page.waitForSelector('.mopts .opt, #mans, #cface');
  await answer(page, true); await next(page); await page.waitForSelector('.result');
  assert(await page.evaluate(t => WR.state.mistakes.find(x => x.id === 'math_' + t).box, g4[1]) === 1, 'right a day later: the plant grows to a sprout');
  const back = await page.evaluate(() => document.querySelector('#back').textContent);
  assert(/garden/.test(back), 'a garden round goes back to the garden');
  // a second try right waters without changing; a miss in the garden doesn't plant twice
  assert(await page.evaluate(() => WR.state.mistakes.filter(m => m.type === 'math').length) === 1, 'one plant per topic (no copies)');

  // ---------- 4. 🎲 Daily Mix on the hub: 5 mixed questions, earlier grade, no same-topic neighbours ----------
  await page.close();
  const now = Date.now(), topics = {}; const g3 = ['g3.add4', 'g3.mul', 'g3.divrem', 'g3.times'];
  g4.slice(0, 6).concat(g3).forEach((id, i) => topics[id] = { best: 0.8, plays: 1, last: now - (12 - i) * DAY });
  page = await open(ctx, SAVE({ math: { grade: 4, topics } }));
  const mig = await page.evaluate(ids => ids.map(id => WR.MathReview.rec(id)), Object.keys(topics));
  assert(mig.every(r => r && r.s === 1 && r.d > Date.now() - 1000), 'an older save: every finished topic joined the schedule with a coming return date');
  await page.evaluate(() => WR.go('math')); await page.waitForSelector('#mixCard');
  const card = await page.evaluate(() => { const b = document.querySelector('#mixBtn').getBoundingClientRect(); return { h: b.height, txt: document.querySelector('#mixCard').textContent }; });
  assert(card.h >= 44 && /Daily Mix/.test(card.txt), 'the Daily Mix card is on the maths hub (no new realm tile), button ≥ 44 px');
  await page.click('#mixBtn'); await page.waitForSelector('.mopts .opt, #mans, #cface');
  const mixL = await page.evaluate(() => { const L = WR.Math.lesson(); return { kind: L.kind, title: L.title, ts: L.items.map(q => q.topic), gs: L.items.map(q => MathGen.topic(q.topic).grade) }; });
  const nb = mixL.ts.slice(1).filter((t, i) => t === mixL.ts[i]).length;
  assert(mixL.kind === 'mix' && mixL.ts.length === 5 && nb === 0 && new Set(mixL.ts).size >= 4, `the mix: 5 questions in mixed order, ${new Set(mixL.ts).size} topics, no same-topic neighbours (${mixL.ts.join(', ')})`);
  assert(mixL.gs.some(g => g < 4), 'an earlier-grade topic is in the mix');
  await page.waitForTimeout(800); await page.screenshot({ path: OUT + 't3_desk_mix.png' });
  await playAll(page);
  const done = await page.evaluate(() => ({ today: WR.MathReview.doneToday(), crowns: Object.keys(WR.Math.st().topics).filter(k => k.startsWith('mix')).length }));
  assert(done.today && done.crowns === 0, 'the mix counts as done today and makes no topic crowns of its own');

  // ---------- 5. every finished topic returns in the Daily Mix (fake clock, one mix a day, 120 days) ----------
  const run = await page.evaluate(async ids => { const seen = {}, moved = {}, DAY = 864e5; let early = 0, nbs = 0, n = 0;
    for (let d = 0; d < 120; d++) { const its = WR.MathReview.mixItems(), ts = its.map(q => q.topic); n++;
      if (ts.some(t => MathGen.topic(t).grade < 4)) early++; nbs += ts.slice(1).filter((t, i) => t === ts[i]).length;
      for (const q of its) { (seen[q.topic] = seen[q.topic] || []).push(d); if (WR.MathReview.answer(q, true)) (moved[q.topic] = moved[q.topic] || []).push(d); }
      __shift(DAY); }
    __shift(-120 * DAY);
    return { early, nbs, n, ids: ids.map(id => [id, (seen[id] || []).length, moved[id] || []]) }; }, Object.keys(topics));
  assert(run.ids.every(([, c, m]) => c > 0 && m.length >= 3), 'every finished topic came back in the Daily Mix and moved along its schedule ≥ 3 times in 120 days');
  const gaps = run.ids.map(([, , m]) => m.slice(1).map((d, i) => d - m[i]));
  assert(gaps.every(g => g[0] >= 9 && g[0] <= 12 && g[1] >= 27 && g[1] <= 33), `the gaps follow 10 → 30 days (${JSON.stringify(gaps.slice(0, 3))} …)`);
  assert(run.early === run.n && run.nbs === 0, `an earlier grade in all ${run.n} mixes, never two neighbours on one topic`);

  // ---------- 6. review stars: small, once per move, capped, inside the 150 cap ----------
  const st = await page.evaluate(() => { const id = Object.keys(WR.Math.st().topics).find(k => WR.MathReview.rec(k)), r = WR.MathReview.rec(id);
    r.d = Date.now() - 1000; r.t = Date.now() - 30 * 3600e3; const s0 = WR.state.stars, room = WR.EARN.review - WR.earn().review;
    const pay = WR.MathReview.answer({ topic: id }, true), got = WR.Review.reward(pay), again = WR.Review.reward(pay); return { pay, got, again, room, d: WR.state.stars - s0, cap: WR.EARN.cap }; });
  assert(st.pay && st.got === (st.room > 0 ? 1 : 0) && st.again === 0 && st.cap === 150, `a mix answer that moved a topic pays the review star once (${st.got}), never twice; the daily cap stays 150`);

  // ---------- 7. Singapore track: no maths grade yet, P4 → the mix is built around Grade 4 ----------
  await page.close();
  page = await open(ctx, SAVE({ sg: { track: 'sg', level: 'p4' }, math: { topics } }));
  await page.evaluate(() => WR.go('home')); await page.waitForSelector('#mathNode');
  const sg = await page.evaluate(() => ({ grade: WR.MathReview.grade(), sgMap: !!document.querySelector('.track-tabs [data-track="sg"].on') }));
  await page.click('#mathNode'); await page.waitForSelector('#mixCard');
  assert(sg.grade === 4 && sg.sgMap, 'on the Singapore track (P4, no maths grade chosen) the mix uses Grade 4; the maths door → hub shows the Daily Mix card');
  await page.click('#mixBtn'); await page.waitForSelector('.mopts .opt, #mans, #cface');
  const sgm = await page.evaluate(() => WR.Math.lesson().items.map(q => [q.topic, MathGen.topic(q.topic).grade]));
  assert(sgm.length === 5 && sgm.some(([, g]) => g < 4), `the Singapore mix: 5 questions with an earlier grade (${sgm.map(x => x[0]).join(', ')})`);
  await playAll(page);

  // ---------- 8. off switch, fresh child, merge ----------
  await page.close(); page = await open(ctx, SAVE({ math: { grade: 5 }, settings: { rate: .9, sound: false, unlockAll: true, dailyMix: false } }));
  await page.evaluate(() => WR.go('math')); await page.waitForSelector('.gchips');
  assert(!(await page.$('#mixCard')), 'a grown-up can turn the Daily Mix off in ⚙️ Settings (on by default)');
  const fresh = await page.evaluate(() => { WR.state.settings.dailyMix = true; return WR.MathReview.mixItems().map(q => MathGen.topic(q.topic).grade); });
  assert(fresh.length === 5 && fresh.some(g => g < 5), `a child with nothing finished still gets a 5-question mix with the grade below (${fresh.join(',')})`);
  const merge = await page.evaluate(() => { const a = { items: { 'math:g4.area': { s: 2, d: 5, t: 200, n: 2 } } }, b = { items: { 'math:g4.area': { s: 1, d: 3, t: 100, n: 1 }, 'math:g3.mul': { s: 1, d: 1, t: 50, n: 1 } } };
    const m = WR.Review.merge(a, b); return [m.items['math:g4.area'].s, !!m.items['math:g3.mul']]; });
  assert(merge[0] === 2 && merge[1], 'cloud merge keeps both devices\' maths records (later answer wins)');
  const old = await page.evaluate(() => { const s = { stars: 99, math: { topics: { 'g2.add': { best: 0.9, last: 1 }, 'g2.sub': { best: 0.3, last: 1 } } }, review: { items: {}, mig: 1 } };
    WR.MathReview.migrate(s); const k = Object.keys(s.review.items); WR.MathReview.migrate(s); return { k, again: Object.keys(s.review.items).length, stars: s.stars, best: s.math.topics['g2.add'].best }; });
  assert(old.k.join() === 'math:g2.add' && old.again === 1 && old.stars === 99 && old.best === 0.9, 'migration: only finished topics join, once; stars and crowns untouched');

  // ---------- 9. phones ----------
  for (const vp of [{ n: '320', width: 320, height: 640 }, { n: '360', width: 360, height: 740 }, { n: '375', width: 375, height: 667 }, { n: 'landscape', width: 740, height: 360 }]) {
    const c = await mkctx(vp), p = await open(c, SAVE({ math: { grade: 4, topics }, mistakes: [] }));
    await p.evaluate(() => WR.go('math')); await p.waitForSelector('#mixCard');
    const hub = await p.evaluate(() => { const b = document.querySelector('#mixBtn').getBoundingClientRect(), c = document.querySelector('#mixCard').getBoundingClientRect(); return { h: b.height, right: b.right <= innerWidth + 1 && c.right <= innerWidth + 1, scroll: document.documentElement.scrollWidth > innerWidth + 1 }; });
    assert(hub.h >= 44 && hub.right && !hub.scroll, `${vp.n}: the Daily Mix card fits, button ≥ 44 px, no sideways scroll`);
    await p.evaluate(() => document.querySelector('#mixCard').scrollIntoView({ block: 'center' })); await p.waitForTimeout(800); await p.screenshot({ path: OUT + `t3_${vp.n}_hub.png` });
    await p.click('#mixBtn'); await p.waitForSelector('.mopts .opt, #mans, #cface');
    assert(!(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)), `${vp.n}: a mix question has no sideways scroll`);
    await p.waitForTimeout(800); await p.screenshot({ path: OUT + `t3_${vp.n}_mix.png` });
    await answer(p, false); if (!(await p.$('#mnext'))) await answer(p, false); await p.waitForSelector('#mnext');
    await p.evaluate(() => WR.Math.stop()); await p.evaluate(() => WR.go('review')); await p.waitForSelector('.plot[data-id^="math_"]');
    const gd = await p.evaluate(() => ({ scroll: document.documentElement.scrollWidth > innerWidth + 1, h: document.querySelector('#waterBtn').getBoundingClientRect().height }));
    assert(!gd.scroll && gd.h >= 44, `${vp.n}: the garden with a number plant fits, water button ≥ 44 px`);
    await p.evaluate(() => document.querySelector('.plot[data-id^="math_"]').scrollIntoView({ block: 'center' })); await p.waitForTimeout(800); await p.screenshot({ path: OUT + `t3_${vp.n}_garden.png` });
    await c.close();
  }
  assert(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  console.log(`\nmaths-review: ${passed} passed`);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
