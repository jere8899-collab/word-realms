// 🔢 BRIEF-T3 before/after numbers for maths review: which topics come back on a schedule, where maths mistakes go,
// what a mixed round holds (earlier grades, same-topic neighbours), on the realms and the Singapore track.
// Usage: BASE=http://127.0.0.1:18642 OUT=/tmp/x.json node tools/sim/maths-numbers.js
const { chromium } = require('playwright-core');
const BASE = process.env.BASE || 'http://127.0.0.1:18642', DAY = 864e5;
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 850 } });
  await ctx.addInitScript(() => { const R = Date, real = R.now.bind(R); let off = +(localStorage.getItem('__off') || 0);
    class F extends R { constructor(...a) { super(...(a.length ? a : [real() + off])); } static now() { return real() + off; } }
    window.Date = F; window.__shift = ms => { off += ms; localStorage.setItem('__off', off); }; });
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  const fresh = async extra => { await page.goto(BASE + '/manifest.webmanifest'); await page.evaluate(x => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(Object.assign({
      v: 1, name: 'Sim', avatar: 'avatar_mage', startLevel: 'a1', stars: 0, totalCorrect: 0, totalAnswered: 0,
      pet: { species: 'pet_fox', name: 'Mochi', xp: 0, happiness: 80, hunger: 20, skin: null, lastTick: Date.now() },
      streak: { count: 0, last: null }, progress: {}, owned: [], equipped: {}, settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 0 }, x))); }, extra || {});
    await page.goto(BASE + '/index.html'); await page.waitForFunction(() => window.WR && WR.Math && window.MathGen); await page.waitForTimeout(500); };
  const res = { base: BASE };
  // a Grade 4 child who has finished 6 Grade 4 topics and 4 Grade 3 topics
  const G4 = await (async () => { await fresh(); return page.evaluate(() => MathGen.gradeTopics(4).filter(t => !t.extra).map(t => t.id)); })();
  const G3 = await page.evaluate(() => MathGen.gradeTopics(3).filter(t => !t.extra).map(t => t.id));
  const done = G4.slice(0, 6).concat(G3.slice(0, 4)), now = Date.now();
  const topics = Object.fromEntries(done.map((id, i) => [id, { best: 0.8, plays: 1, last: now - (10 - i) * DAY }]));
  const save = { math: { grade: 4, topics } };
  await fresh(save);
  res.topicsTotal = await page.evaluate(() => MathGen.TOPICS.length);
  res.topicsWithReview = await page.evaluate(() => WR.MathReview ? MathGen.TOPICS.filter(t => WR.MathReview.schedules(t.id)).length : 0);
  // a mixed round: what the game offers by default
  const mix = await page.evaluate(() => { const its = WR.MathReview ? WR.MathReview.mixItems() : WR.Math.buildItems({ grade: 4 });
    const ts = its.map(q => q.topic), nb = ts.slice(1).filter((t, i) => t === ts[i]).length;
    return { name: WR.MathReview ? 'Daily Mix' : 'Grade 4 mixed practice', n: ts.length, topics: ts, sameNeighbours: nb, earlier: ts.filter(t => MathGen.topic(t).grade < 4).length }; });
  res.mixedRound = mix;
  res.over200Rounds = await page.evaluate(() => { let nb = 0, early = 0, n = 0, withEarly = 0; for (let i = 0; i < 200; i++) {
    const its = WR.MathReview ? WR.MathReview.mixItems() : WR.Math.buildItems({ grade: 4 }), ts = its.map(q => q.topic);
    n += ts.length; nb += ts.slice(1).filter((t, k) => t === ts[k]).length; const e = ts.filter(t => MathGen.topic(t).grade < 4).length; early += e; if (e) withEarly++; }
    return { questions: n, sameTopicNeighbours: nb, earlierGradeQuestions: early, roundsWithAnEarlierGrade: withEarly + ' of 200' }; });
  // every finished topic: does it come back in the mix within 30 days (one mix a day, all right)?
  const back = await page.evaluate(async done => { const seen = {}, steps = {}; const DAY = 864e5;
    for (let d = 0; d < 140; d++) { const its = WR.MathReview ? WR.MathReview.mixItems() : WR.Math.buildItems({ grade: 4 });
      for (const q of its) { if (d < 30) (seen[q.topic] = seen[q.topic] || []).push(d); if (WR.MathReview && WR.MathReview.answer(q, true)) (steps[q.topic] = steps[q.topic] || []).push(d); }
      __shift(DAY); }
    __shift(-140 * DAY);
    return done.map(t => [t, seen[t] ? seen[t].length : 0, seen[t] ? seen[t][0] : null, steps[t] || []]); }, done);
  res.finishedTopicsBackIn30Days = back.filter(x => x[1] > 0).length + ' of ' + done.length;
  res.finishedTopicVisits = back.map(x => x.slice(0, 3));
  res.scheduleMovesByDay = Object.fromEntries(back.map(x => [x[0], x[3]]));   // the days a Daily Mix answer moved the topic's review step
  // maths mistakes: answer 3 questions of a topic lesson wrong (both tries) through the real screen
  await fresh(save);
  const g = await page.evaluate(async t => { WR.Math.startLesson({ topic: t }); await new Promise(r => setTimeout(r, 300));
    const before = WR.state.mistakes.length;
    for (let i = 0; i < 3; i++) { const L = WR.Math.lesson(), q = L.items[L.i];
      for (let k = 0; k < 2; k++) { if (q.kind === 'mcq' || q.options) { const b = [...document.querySelectorAll('#main .mopts .opt[data-k]')].find(b => !b.disabled && q.options[+b.dataset.k] !== q.a); b && b.click(); }
        else { const inp = document.querySelector('#mans'); if (inp) { inp.value = '98765'; document.querySelector('#mcheck').click(); } else if (q.set) break; }
        await new Promise(r => setTimeout(r, 60)); }
      const nb = document.querySelector('#mnext'); if (nb) nb.click(); await new Promise(r => setTimeout(r, 80)); }
    WR.Math.stop(); const ms = WR.state.mistakes.slice(0, WR.state.mistakes.length - before);
    return { planted: ms.length, maths: ms.filter(m => m.type === 'math').length, topics: ms.map(m => m.topic || null) }; }, G4[0]);
  res.mathsMistakesInGarden = g;
  // Singapore track, P4, no maths grade chosen yet
  await fresh({ sg: { track: 'sg', level: 'p4' }, math: { topics } });
  res.singapore = await page.evaluate(() => { if (!WR.MathReview) return { mix: 'none (no Daily Mix)', homeCard: !!document.querySelector('#mixHome') };
    const its = WR.MathReview.mixItems(); return { grade: WR.MathReview.grade(), n: its.length, topics: its.map(q => q.topic), homeCard: (WR.go('home'), !!document.querySelector('#mixHome')) }; });
  res.errors = errors;
  console.log(JSON.stringify(res, null, 1));
  if (process.env.OUT) require('fs').writeFileSync(process.env.OUT, JSON.stringify(res, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
