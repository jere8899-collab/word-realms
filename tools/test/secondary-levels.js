// Task 12: secondary topics sit at the MOE G3 level (Grade 7 = Sec 1 … Grade 10 = Sec 4).
// Moved topics keep their ids, so an old save's crowns, stars and unlocks stay, and the topics show on the new grade.
// Parallel / perpendicular gradients (m1 × m2 = −1) leave Straight-Line Street and live on as an ✨ Extra (A-Math).
// Run: node tools/test/secondary-levels.js (game served on :18642). Screenshots: screenshots/t12_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));

const AT = {
  'g8.gradient': 7, 'g8.lingraph': 7, 'g8.fraceq': 7,
  'g9.quad': 8, 'g9.simul': 8, 'g9.trig': 8,
  'g9.surds': 9, 'g10.triggraph': 10, 'g9.perpline': 9
};
const WAS = { 'g8.gradient': 8, 'g8.lingraph': 8, 'g8.fraceq': 8, 'g9.quad': 9, 'g9.simul': 9, 'g9.trig': 9 };
ok(Object.entries(AT).every(([id, g]) => M.topic(id) && M.topic(id).grade === g), 'every Task 12 topic sits at its new grade: ' + Object.keys(AT).map(id => id + '→' + (M.topic(id) || {}).grade).join(' '));
ok(Object.entries(WAS).every(([id, was]) => M.topic(id).id === id && M.topic(id).was === was), 'moved topics keep their old id and remember the grade they came from');
const AMATH = ['g9.surds', 'g10.triggraph', 'g9.perpline', 'g11.explog', 'g11.diff', 'g11.tangent', 'g11.ap', 'g11.gp', 'g12.chain'];
ok(AMATH.every(id => M.topic(id).extra === 'amath' && M.topic(id).id === id) && M.topic('g4.compass').extra === true, 'A-Math topics wear extra:"amath" and keep their ids; Compass Quest stays a plain Extra');
ok(['g11.explog', 'g11.diff', 'g11.tangent', 'g11.ap', 'g11.gp'].every(id => M.topic(id).grade === 11 && !M.topic(id).was) && M.topic('g12.chain').grade === 12 && !M.topic('g12.chain').was, 'the six JC A-Math topics stay in their grades');
ok(['g11.func', 'g11.stationary', 'g11.vec3', 'g12.integ', 'g12.area', 'g12.binom', 'g12.complex', 'g12.sigma', 'g12.expcalc'].every(id => !M.topic(id).extra), 'the other JC topics stay core H2 maths');
ok(M.TOPICS.length === 135 && new Set(M.TOPICS.map(t => t.id)).size === 135, `135 topics, all ids unique (${M.TOPICS.length})`);
ok(M.GRADES.every(x => { const g = M.gradeTopics(x.g); return g.length && g[g.length - 1].story && g.filter(t => t.story).length === 1; }), 'every grade still ends with its one word-problem topic');
{ const g7 = M.gradeTopics(7).map(t => t.id), g8 = M.gradeTopics(8).map(t => t.id);
  ok(g7.includes('g8.gradient') && g7.includes('g8.lingraph') && g7.includes('g8.fraceq') && !g8.includes('g8.gradient'), 'Grade 7 teaches the three Sec 1 topics; Grade 8 does not');
  ok(g8.includes('g9.quad') && g8.includes('g9.simul') && g8.includes('g9.trig') && !M.gradeTopics(9).some(t => t.id === 'g9.quad'), 'Grade 8 teaches quadratics, simultaneous equations and SOH-CAH-TOA');
  ok(g7[g7.length - 1] === 'g7.story' && g8[g8.length - 1] === 'g8.story', 'word problems stay last on Grade 7 and Grade 8'); }
const many = (id, n) => Array.from({ length: n }, (_, s) => M.make(id, (s + 1) * 2654435761 >>> 0));
{ const line = many('g8.lingraph', 600), perp = many('g9.perpline', 400);
  ok(line.every(q => q.data.lingraph !== 'parallel' && q.data.lingraph !== 'perp'), 'Straight-Line Street no longer asks parallel or perpendicular gradients');
  ok(perp.every(q => q.data.lingraph === 'parallel' || q.data.lingraph === 'perp') && perp.some(q => q.data.lingraph === 'parallel') && perp.some(q => q.data.lingraph === 'perp'), 'Right-Angle Paths keeps both kinds');
  ok(perp.filter(q => q.data.lingraph === 'perp').every(q => Math.abs(q.data.m * q.data.perp + 1) < 1e-6), 'every perpendicular question still uses m1 × m2 = −1');
  const bad = perp.filter(q => !M.check(q, q.a).ok || !q.steps.length);
  ok(!bad.length, 'Right-Angle Paths questions still mark their own answer right'); }

const MOVED = ['g8.gradient', 'g8.lingraph', 'g8.fraceq', 'g9.quad', 'g9.simul', 'g9.trig'];
const OLD = { v: 1, name: 'Mei', stars: 40, gems: 2, xp: 20, avatar: { name: 'Mei', look: 0 }, progress: { a1: { vocab: { cat: 1 } } }, unlocked: ['a1', 'a2'], owned: ['hat_star'], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 8,
  stickers: { got: { math: ['first'], guard: [] } },
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 40, happiness: 80, hunger: 20, skin: null, lastTick: Date.now() },
  math: { grade: 8, topics: Object.assign({ 'g9.surds': { best: .9, plays: 2 }, 'g10.triggraph': { best: 1, plays: 2 } }, Object.fromEntries(MOVED.concat(['g11.explog', 'g11.diff', 'g11.tangent', 'g11.ap', 'g11.gp', 'g12.chain']).map(id => [id, { best: 1, plays: 4 }]))), correct: 40, answered: 50, lessons: 9 } };

(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/supabase\.co/, r => r.abort());
  await ctx.addInitScript(s => { localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, OLD);
  const p = await ctx.newPage(), errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  const c = await p.evaluate(ids => {
    const crowns = Object.fromEntries(ids.map(id => [id, WR.Math.crownsFor(id)]));
    const save = JSON.parse(localStorage.getItem('wordRealms.save.v1'));
    const g7 = MathGen.gradeTopics(7).map(t => t.id), g8 = MathGen.gradeTopics(8).map(t => t.id);
    const shell = WR.MathGoals.GUARDIANS.find(g => g.id === 'g78');
    const quartz = WR.MathGoals.GUARDIANS.find(g => g.id === 'g910');
    const lumina = WR.MathGoals.GUARDIANS.find(g => g.id === 'g1112');
    return { crowns, stars: save.stars, owned: save.owned, unlocked: save.unlocked, name: save.name, pet: save.pet && save.pet.name,
      topics: save.math.topics, g7, g8, shell: WR.MathGoals.passed(shell), quartz: WR.MathGoals.passed(quartz), lumina: WR.MathGoals.passed(lumina),
      stickers: save.stickers && save.stickers.got && save.stickers.got.math };
  }, MOVED.concat(['g9.surds', 'g10.triggraph', 'g11.explog', 'g11.diff', 'g11.tangent', 'g11.ap', 'g11.gp', 'g12.chain']));
  const JC = ['g11.explog', 'g11.diff', 'g11.tangent', 'g11.ap', 'g11.gp', 'g12.chain'];
  ok(MOVED.every(id => c.crowns[id] === 3) && c.crowns['g9.surds'] >= 2 && c.crowns['g10.triggraph'] === 3 && JC.every(id => c.crowns[id] === 3), `old crowns stay on the same ids (${JSON.stringify(c.crowns)})`);
  ok(c.stars >= 40 && c.owned.includes('hat_star') && c.unlocked.includes('a2') && c.name === 'Mei' && c.pet === 'Puffbun', `nothing earned was taken away (stars ${c.stars}, hat, unlocks, name, pet)`);
  ok(MOVED.every(id => c.topics[id] && c.topics[id].best === 1) && !Object.keys(c.topics).some(k => /^g7\.(gradient|lingraph|fraceq)|^g8\.(quad|simul|trig)/.test(k)), 'the save is untouched: no renamed ids and no copies');
  ok(c.stickers && c.stickers.includes('first'), 'the Number Kingdom sticker stays');
  ok(c.g7.includes('g8.gradient') && c.g8.includes('g9.quad') && c.shell >= 6 && c.quartz >= 3 && c.lumina >= 6, `guardians still count the moved topics and the JC extras (Shellby ${c.shell}, Quartzy ${c.quartz}, Lumina ${c.lumina})`);

  const show = async (grade, ids) => {
    await p.evaluate(g => WR.go('math', g), grade);
    await p.waitForTimeout(500);
    await p.evaluate(() => new Promise(res => {
      const el = document.querySelector('.math-hub');
      if (!el) return res();
      const done = e => { if (e.target === el) { el.removeEventListener('animationend', done); res(); } };
      el.addEventListener('animationend', done);
      setTimeout(res, 1000);
    }));
    const seen = await p.evaluate(want => want.every(id => !!document.querySelector(`[data-t="${id}"]`)), ids);
    return seen;
  };
  ok(await show(7, ['g8.gradient', 'g8.lingraph', 'g8.fraceq']), 'the Grade 7 map shows Gradient Hills, Straight-Line Street and Fraction Equations');
  ok(await p.evaluate(() => ['g8.gradient', 'g8.lingraph', 'g8.fraceq'].every(id => !document.querySelector(`[data-t="${id}"] .mextra`))), 'those three Sec 1 topics are core, not Extra');
  await p.locator('[data-t="g8.gradient"]').scrollIntoViewIfNeeded();
  await p.screenshot({ path: OUT + 't12_g7_360.png', fullPage: true });
  ok(await show(8, ['g9.quad', 'g9.simul', 'g9.trig']), 'the Grade 8 map shows Quadratic Quarry, Twin Potions and SOH-CAH-TOA Tower');
  ok(await p.evaluate(() => !document.querySelector('[data-t="g8.gradient"]') && !document.querySelector('[data-t="g8.fraceq"]')), 'Grade 8 no longer lists the topics that moved to Grade 7');
  await p.locator('[data-t="g9.quad"]').scrollIntoViewIfNeeded();
  await p.screenshot({ path: OUT + 't12_g8_360.png', fullPage: true });
  ok(await show(9, ['g9.surds', 'g9.perpline']), 'Grade 9 keeps Root Garden and Right-Angle Paths');
  ok(await p.evaluate(() => ['g9.surds', 'g9.perpline'].every(id => /Extra/.test((document.querySelector(`[data-t="${id}"] .mextra`) || {}).textContent || ''))), 'both Grade 9 A-Math topics wear the ✨ Extra badge');
  ok(await show(10, ['g10.triggraph']), 'Grade 10 still lists Wave Pier');
  ok(await p.evaluate(() => /Extra/.test((document.querySelector('[data-t="g10.triggraph"] .mextra') || {}).textContent || '') && !document.querySelector('[data-t="g10.sinecos"] .mextra')), 'Wave Pier is Extra; Sine & Cosine Castle stays core');
  ok(await show(11, ['g11.explog', 'g11.diff', 'g11.tangent', 'g11.ap', 'g11.gp', 'g11.func']), 'Grade 11 still lists the JC topics');
  ok(await p.evaluate(() => ['g11.explog', 'g11.diff', 'g11.tangent', 'g11.ap', 'g11.gp'].every(id => /Extra/.test((document.querySelector(`[data-t="${id}"] .mextra`) || {}).textContent || '')) && !document.querySelector('[data-t="g11.func"] .mextra') && !document.querySelector('[data-t="g11.stationary"] .mextra')), 'five Grade 11 A-Math topics wear ✨ Extra; functions and stationary points stay core');
  ok(await show(12, ['g12.chain', 'g12.integ']), 'Grade 12 still lists Chain-Rule Charms');
  ok(await p.evaluate(() => /Extra/.test((document.querySelector('[data-t="g12.chain"] .mextra') || {}).textContent || '') && !document.querySelector('[data-t="g12.integ"] .mextra')), 'Chain-Rule Charms is Extra; Integral Island stays core');
  await ctx.close();

  for (const [w, h, tag] of [[320, 640, '320'], [360, 740, '360'], [375, 667, '375']]) {
    const cx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await cx.route(/supabase\.co/, r => r.abort());
    const q = await cx.newPage();
    q.on('pageerror', e => errors.push(tag + ' ' + e.message));
    await q.goto(URL);
    await q.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, OLD);
    await q.reload({ waitUntil: 'networkidle' });
    await q.waitForTimeout(600);
    for (const g of [7, 8]) {
      await q.evaluate(n => WR.go('math', n), g);
      await q.waitForTimeout(400);
      const fit = await q.evaluate(() => {
        const wide = document.documentElement.scrollWidth <= innerWidth + 1;
        const cards = [...document.querySelectorAll('.mtopic')];
        const taps = cards.length ? Math.min(...cards.map(e => e.getBoundingClientRect().height)) : 0;
        return { wide, n: cards.length, taps };
      });
      ok(fit.wide && fit.n >= 8 && fit.taps >= 44, `${tag}px Grade ${g}: ${fit.n} topic cards fit, no sideways scroll, cards at least 44 px tall (${fit.taps.toFixed(0)})`);
    }
    if (tag === '320') {
      await q.evaluate(() => WR.go('math', 9));
      await q.waitForTimeout(300);
      const badge = await q.evaluate(() => { const e = document.querySelector('[data-t="g9.surds"] .mextra'); if (!e) return null; const r = e.getBoundingClientRect(); return { t: e.textContent, w: r.width, right: r.right, iw: innerWidth }; });
      ok(badge && /Extra/.test(badge.t) && badge.right <= badge.iw + 1 && badge.w >= 44, `320 px: the Extra badge on Root Garden is readable and on screen (${JSON.stringify(badge)})`);
    }
    await cx.close();
  }
  ok(!errors.length, `no page errors ${errors.slice(0, 3)}`);
  await b.close();
  console.log(fails ? `${fails} FAILED` : 'all secondary-level checks passed');
})();
