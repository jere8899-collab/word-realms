// 🏁 BRIEF-T4B (Jeremy's Task 4 follow-ups, 2026-11-04): the ✨ crown check needs 3 of 4 (its own setting, WR.PASS.checkNeed; BRIEF-T5B, Jeremy 2026-11-05, was 4 of 4 in T4B);
// the realm boss still wakes at 3 passed; Grade Guardians, the maths Daily Mix "finished" mark and the realm skill stickers use
// the shared 85% mark (WR.PASS.mark), label text included; older saves keep every awake guardian, earned sticker and scheduled
// topic; the kept guardians merge in the cloud copy and reach a second tab. Screenshots screenshots/t4b_*.png.
const { chromium } = require('playwright-core');
const BASE = process.env.BASE || 'http://127.0.0.1:18642', URL = BASE + '/index.html', OUT = '/workspace/cefr-quest/screenshots/';
let passed = 0, failed = 0; const ok = (c, m) => { if (c) passed++; else failed++; console.log((c ? 'ok - ' : 'FAIL ') + m); };
const T = (ids, best) => Object.fromEntries(ids.map(id => [id, { best, plays: 1, last: 1 }]));
const SAVE = extra => Object.assign({ v: 1, name: 'Tess', avatar: 'avatar_girl', startLevel: 'a1', stars: 10, totalCorrect: 0, lessonsDone: 0, bonusSeen: ['sp'],
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 0, happiness: 80, hunger: 30, lastTick: Date.now() }, streak: { count: 1, last: null },
  progress: {}, owned: [], equipped: {}, settings: { rate: 1, sound: false }, mistakes: [],
  math: { grade: 1, placed: 1, xp: 0, correct: 0, answered: 0, lessons: 0, topics: {}, facts: {}, dojo: { tables: [2], op: 'x', best: 0 } } }, extra || {});
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });
  const open = async save => { const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
    await page.goto(BASE + '/manifest.webmanifest'); await page.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, save);
    await page.goto(URL); await page.waitForFunction(() => window.WR && WR.realms && WR.MathGoals && WR.MathReview && WR.Collect); await page.waitForTimeout(600);
    await page.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove())); return page; };

  // 1. one config: 85% mark, crown check 3 of 4 as its own value (BRIEF-T5B), boss at 3
  let page = await open(SAVE());
  const cfg = await page.evaluate(() => ({ P: WR.PASS, k4: WR.checkCount(4), k2: WR.checkCount(2), c34: WR.checkPasses(3 / 4, 4), c24: WR.checkPasses(2 / 4, 4), c44: WR.checkPasses(1, 4), l34: WR.passes(3 / 4, 4), pct: WR.pct(), mix: WR.Review.CONFIG.math.pass, need10: WR.passCount(10) }));
  ok(cfg.P.mark === 0.85 && cfg.P.checkN === 4 && cfg.P.checkNeed === 3 && cfg.k4 === 3 && cfg.k2 === 2 && cfg.c34 && !cfg.c24 && cfg.c44, 'crown check: its own setting checkNeed = 3 of checkN 4 (BRIEF-T5B; 2 of 4 is not enough; a 2-question check needs both)');
  ok(cfg.l34 && cfg.P.boss === 3, 'the lesson pass mark is unchanged (3 of 4 = 75% rounds to the 0.85 mark of a 4-item round) and the boss still wakes at 3');
  ok(cfg.pct === 85 && cfg.mix === cfg.P.mark && cfg.need10 === 9, 'Daily Mix "finished" reads the shared mark; a 10-question guardian fight needs 9 sparkle hits (85%)');
  // the crown-check record: 2 of 4 on a later day keeps the pass + crown, confirms nothing; 3 of 4 confirms
  const chk = await page.evaluate(() => { const y = Date.now() - 864e5 * 2; WR.state.progress.a1 = { grammar: { best: 1, plays: 1, last: y, pass: y, passDay: WR.dayKey(y) } };
    const a = WR.recordCheck('a1', 'grammar', 2 / 4, 4), r1 = Object.assign({}, WR.skillRec('a1', 'grammar')); WR.skillRec('a1', 'grammar').chkDay = null;
    const b = WR.recordCheck('a1', 'grammar', 3 / 4, 4); return { a, b, r1, r2: WR.skillRec('a1', 'grammar') }; });
  ok(!chk.a.good && !chk.a.confirmed && chk.r1.pass && chk.r1.best === 1 && !chk.r1.ok && chk.b.confirmed && chk.r2.ok, 'recordCheck: 2 of 4 keeps the pass and crown but confirms nothing; 3 of 4 confirms');
  // boss: 3 of 4 skills passed at 85% wakes it
  const boss = await page.evaluate(() => { WR.state.progress.a2 = { grammar: { best: .9 }, vocab: { best: .9 }, reading: { best: .875 }, listening: { best: .5 } }; return { r: WR.Collect.bossReady('a2'), p: WR.realmProgress('a2').passed }; });
  ok(boss.r && boss.p === 3, 'the A2 boss wakes with 3 of 4 skills passed (85%+)');
  await page.close();

  // 2. Grade Guardians on the shared mark; older saves keep every awake guardian
  const g12 = ['g1.count', 'g1.add20', 'g2.add', 'g1.sub20'];
  page = await open(SAVE({ math: Object.assign(SAVE().math, { topics: T(g12, 0.7) }) }));   // older save: 4 topics at 70% (awake under the old 60% rule)
  let g = await page.evaluate(() => { const gd = WR.MathGoals.GUARDIANS[0]; return { ready: WR.MathGoals.ready(gd), passed: WR.MathGoals.passed(gd), keep: WR.state.keep.guard, mig: WR.state.keep.gmig }; });
  ok(g.ready && g.passed === 0 && g.keep.includes('g12') && g.mig === 1, `an older save: Bramble (awake at 4 topics ≥ 60%) stays awake for good though 0 topics pass at 85% (${JSON.stringify(g)})`);
  await page.reload(); await page.waitForFunction(() => window.WR && WR.MathGoals);
  ok(await page.evaluate(() => WR.MathGoals.ready(WR.MathGoals.GUARDIANS[0]) && WR.state.keep.guard.length === 1), 'still awake after a reload (worked out once, kept in the save)');
  // cloud merge + second tab
  const mg = await page.evaluate(() => { const a = { keep: { open: [], boss: [], guard: ['g12'] } }, b = { keep: { open: [], boss: [], guard: ['g34'] } }; WR.mergePass(a, b); return a.keep.guard.join(); });
  ok(mg === 'g12,g34', 'cloud merge: kept guardians from both copies are unioned');
  const tab2 = await ctx.newPage(); await tab2.goto(URL); await tab2.waitForFunction(() => window.WR && WR.MathGoals); await tab2.waitForTimeout(500);
  ok(await tab2.evaluate(() => WR.MathGoals.ready(WR.MathGoals.GUARDIANS[0])), 'a second tab sees the same awake guardian');
  await tab2.close(); await page.close();
  // a save after the change (gmig set): 70% topics don't wake; labels say 85%
  page = await open(SAVE({ keep: { open: [], boss: [], guard: [], gmig: 1 }, passMig: 1, math: Object.assign(SAVE().math, { topics: Object.assign(T(g12.slice(0, 3), 0.875), T(['g1.sub20'], 0.75)) }) }));
  g = await page.evaluate(() => { const gd = WR.MathGoals.GUARDIANS[0]; return { ready: WR.MathGoals.ready(gd), passed: WR.MathGoals.passed(gd) }; });
  ok(!g.ready && g.passed === 3, 'a new save: 3 topics at 87.5% + one at 75% = 3 passed, Bramble still asleep');
  await page.evaluate(() => WR.go('math')); await page.waitForSelector('#mathGoal');
  const hub = await page.evaluate(() => ({ goal: document.querySelector('#mathGoal').innerText, lock: (document.querySelector('.gcard[data-gb="g12"]') || {}).innerText || '', intro: (document.querySelector('#guardHead + p') || {}).innerText || '' }));
  ok(/\(85%\+\)/.test(hub.goal) && !/60%/.test(hub.goal + hub.lock + hub.intro) && /85%\+/.test(hub.intro), `Guardian texts say 85%+, never 60% (${hub.goal.split('\n').join(' ').slice(0, 90)})`);
  await page.evaluate(() => document.querySelector('#guardHead').scrollIntoView({ block: 'start' })); await page.waitForTimeout(400); await page.screenshot({ path: OUT + 't4b_guardians_85.png' });
  await page.close();

  // 3. Daily Mix: finished = 85%; an extra topic already on the schedule stays usable
  page = await open(SAVE());
  const dm = await page.evaluate(() => { const ids = MathGen.gradeTopics(1).filter(t => !t.extra).map(t => t.id); const a = WR.MathReview.finished(ids[0], 0.75), b = WR.MathReview.finished(ids[1], 0.875);
    return { a, rA: !!WR.MathReview.rec(ids[0]), rB: !!WR.MathReview.rec(ids[1]) }; });
  ok(!dm.a && !dm.rA && dm.rB, 'Daily Mix: a 75% round does not finish a topic, 87.5% does (gets its review record)');
  await page.close();
  // an older save (before the move onto the schedule): topics at 70% still join it (the old mark is used once, for the move)
  page = await open(SAVE({ math: Object.assign(SAVE().math, { topics: T(['g1.count', 'g1.add20'], 0.7) }) }));
  ok(await page.evaluate(() => !!WR.MathReview.rec('g1.count') && !!WR.MathReview.rec('g1.add20')), 'an older save: topics finished at 60%+ keep their place in the review schedule');
  await page.close();

  // 4. stickers: 85% label, earned stickers stay
  page = await open(SAVE({ progress: { a1: { vocab: { best: 0.7, plays: 1 }, listening: { best: 0.8, plays: 1 }, grammar: { best: 0.875, plays: 1 } } }, stickers: { got: { a1: ['first', 'vocab'] }, full: [] } }));
  const st = await page.evaluate(() => { WR.Collect.check(); const d = WR.Collect.STICKERS.filter(s => ['grammar', 'vocab', 'reading', 'listening'].includes(s.id)).map(s => s.how); return { got: WR.state.stickers.got.a1, how: d }; });
  ok(st.got.includes('vocab') && st.got.includes('grammar') && !st.got.includes('listening'), `stickers: the Word Wizard earned at 70% stays; 87.5% Grammar earns Grammar Star; 80% Listening does not yet (${st.got})`);
  ok(st.how.every(h => /^Score 85%\+ in /.test(h)), `sticker labels say "Score 85%+" (${st.how.join(' / ')})`);
  await page.evaluate(() => WR.go('stickers', 'a1')); await page.waitForTimeout(800);
  const book = await page.evaluate(() => document.body.innerText);
  ok(/Score 85%\+ in Vocabulary/.test(book) && !/60%/.test(book), 'the Sticker Book shows the 85% label, no 60% left');
  await page.screenshot({ path: OUT + 't4b_stickers_85.png' });
  await page.close();

  ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  console.log(`t4b: ${passed} passed, ${failed} failed`); await browser.close(); process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
