// 🏆 Number Kingdom goals: maths Sticker Book pages (paid once, worked out from the save), 🛡️ Grade Guardians
// (unlock, 10-question band fight with grade-accurate generators, no timer, Model Magic, first win +15⭐ + sticker),
// the next-goal card in the hub, old-save migration, saving in wordRealms.save.v1, phone + desktop screenshots.
// Run: node tools/test/mathgoals.js  (game served on port 18642)
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
let fails = 0, passes = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const KEY = 'wordRealms.save.v1';
const facts = n => { const f = {}; let k = 0; for (let a = 2; a <= 12 && k < n; a++) for (let b = 1; b <= 12 && k < n; b++, k++) f[`${a}x${b}`] = { b: 3, r: 3, w: 0, d: Date.now() + 864e5, t: 1500, l: Date.now() }; return f; };
const OLD = () => ({ v: 1, name: 'Old Olive', avatar: 'avatar_girl', startLevel: 'a1', stars: 10, totalCorrect: 5, lessonsDone: 1,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 30, happiness: 80, hunger: 30, lastTick: Date.now() },
  progress: {}, owned: [], equipped: {}, settings: { rate: 1, sound: false }, mistakes: [],
  math: { grade: 2, xp: 20, correct: 3, answered: 4, lessons: 0, topics: {}, facts: {}, dojo: { tables: [2], op: 'x', best: 0 } } });   // no bosses/models, no stickers block
const SAVE = () => ({ v: 1, name: 'Number Nia', avatar: 'avatar_girl', startLevel: 'a1', stars: 10, totalCorrect: 40, lessonsDone: 5,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 120, happiness: 80, hunger: 30, lastTick: Date.now() },
  progress: {}, owned: [], equipped: {}, settings: { rate: 1, sound: false }, mistakes: [],
  math: { grade: 1, placed: 1, xp: 300, correct: 40, answered: 45, lessons: 5, models: 6, modelSolved: 5,
    topics: { 'g1.count': { best: 1, plays: 2, last: 1 }, 'g1.add20': { best: 0.75, plays: 1, last: 1 }, 'g2.add': { best: 0.625, plays: 1, last: 1 }, 'g1.sub20': { best: 0.5, plays: 1, last: 1 } },
    facts: facts(12), dojo: { tables: [2, 3], op: 'x', best: 9, sprints: 1, practice: 2, history: [] } } });
async function answer(page, right) {
  const q = await page.evaluate(() => { const q = WR.Math._dbg(); return q && { kind: q.kind, a: q.a, options: q.options, grade: q.grade, topic: q.topic }; });
  if (q.kind === 'mcq') { const idx = right ? q.options.indexOf(q.a) : await page.evaluate(a => [...document.querySelectorAll('.mopts .opt')].findIndex((b, k) => !b.disabled && WR.Math._dbg().options[k] !== a), q.a); if (idx >= 0) await page.click(`.mopts .opt[data-k="${idx}"]`); }
  else {   // a wrong answer the checker can read (so it counts as a try, not a "type it like…" nudge)
    const val = right ? q.a : await page.evaluate(() => { const q = WR.Math._dbg(); return ['999999', '11:59', '999 r 1', '999:1', '999, 998', '(999, 998)', '-999'].find(v => { const r = MathGen.check(q, v); return !r.ok && !r.bad && !r.empty; }); });
    await page.fill('#mans', val); await page.click('#mcheck'); }
  await page.waitForTimeout(80); return q;
}
(async () => {
  /* ---------- 1. grade accuracy of every guardian fight (in the page, using the real generators) ---------- */
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const vp of [{ width: 375, height: 667, phone: true }, { width: 1280, height: 860 }]) {
    const tag = vp.width + 'px';
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2, isMobile: !!vp.phone, hasTouch: !!vp.phone });
    await ctx.route(/supabase|jsdelivr|unpkg/, r => r.abort());
    const errs = [];
    // old save first: loads fine and gains the new blocks
    let page = await ctx.newPage(); page.on('pageerror', e => errs.push(String(e)));
    await page.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); sessionStorage.setItem('seeded', 1); } }, OLD());
    await page.goto(BASE); await page.waitForSelector('#goalsCard');
    await page.evaluate(() => WR.go('math')); await page.waitForSelector('#mathGoal');
    const old = await page.evaluate(() => ({ b: WR.state.math.bosses, ms: WR.state.math.modelSolved, dojo: WR.state.math.dojo.sprints, g: WR.state.math.grade, st: WR.state.stars, got: WR.state.stickers.got.math, goal: document.querySelector('#mathGoal').innerText }));
    ok(old.b && typeof old.b === 'object' && old.ms === 0 && old.dojo === 0 && old.g === 2 && old.st === 10 && old.got.length === 0, `${tag} an old save loads, gains math.bosses and keeps its grade; nothing is paid for nothing ${JSON.stringify(old).slice(0, 160)}`);
    ok(/Pass 4 more Grade 1–2 topics/.test(old.goal), `${tag} old save: the next goal is to wake the Grade 1–2 guardian (${old.goal.replace(/\n/g, ' ')})`);
    if (vp.phone) {
      // the offline maths renderer (KaTeX is blocked here) copes with every topic, incl. money like $\$6.54$ (crashed before)
      const tex = await page.evaluate(() => { const bad = []; for (const t of MathGen.TOPICS) for (let s = 1; s <= 25; s++) { const q = MathGen.make(t.id, s * 7919); for (const x of [q.q, q.hint, ...(q.steps || []), ...(q.options || [])]) { try { const h = WR.Math.html(x); if (/\\[a-zA-Z$]/.test(h.replace(/data-tex="[^"]*"/g, ''))) bad.push(t.id + ' raw'); } catch (e) { bad.push(t.id + ' ' + e.message); } } } return [...new Set(bad)]; });
      ok(!tex.length, `offline maths rendering: every topic renders without errors or raw TeX ${tex.slice(0, 5)}`);
      const money = await page.evaluate(() => WR.Math.html('It costs $\\$6.54$ (in $).').replace(/<[^>]+>/g, ''));
      ok(/costs \$6\.54 \(in \$\)/.test(money), `offline maths rendering: money reads "${money}"`);
      const bands = await page.evaluate(() => WR.MathGoals.GUARDIANS.map(gd => { const runs = []; for (let k = 0; k < 40; k++) runs.push(WR.MathGoals.items(gd)); return { id: gd.id, grades: gd.grades, runs: runs.map(r => r.map(q => [q.grade, q.topic, !!(window.MathViz && MathViz.spec(q))])) }; }));
      for (const b of bands) {
        const all = b.runs.flat();
        ok(b.runs.every(r => r.length === 10 && new Set(r.map(x => x[1])).size === 10), `guardian ${b.id}: every fight has 10 questions from 10 different topics`);
        ok(all.every(x => b.grades.includes(x[0])) && b.runs.every(r => b.grades.every(g => r.filter(x => x[0] === g).length === 5)), `guardian ${b.id}: questions only from Grades ${b.grades.join('–')} (5 from each)`);
        ok(new Set(all.map(x => x[1])).size === M.gradeTopics(b.grades[0]).length + M.gradeTopics(b.grades[1]).length, `guardian ${b.id}: over 40 fights every topic of both grades turns up`);
        if (b.grades[1] <= 6) ok(all.some(x => x[2]), `guardian ${b.id}: 🧮 Model Magic applies to some of its questions`);
      }
    }
    await page.close();
    // main save: some maths progress already earned
    await ctx.clearCookies();
    page = await ctx.newPage(); page.on('pageerror', e => errs.push(String(e)));
    await page.evaluate(() => sessionStorage.clear()).catch(() => {});
    await page.goto(BASE + '?fresh=' + Date.now()); await page.evaluate(s => { localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE());
    await page.reload(); await page.waitForSelector('#goalsCard');
    const st0 = await page.evaluate(() => ({ stars: WR.state.stars, got: WR.state.stickers.got.math, guard: WR.state.stickers.got.guard }));
    ok(['first', 'crown3', 'tower12', 'model5'].every(k => st0.got.includes(k)) && st0.got.length === 4 && st0.guard.length === 0, `${tag} maths stickers worked out from the save (${st0.got})`);
    ok(st0.stars === 10 + 8, `${tag} +2⭐ per maths sticker already earned (stars ${st0.stars})`);
    await page.reload(); await page.waitForSelector('#goalsCard');
    ok(await page.evaluate(() => WR.state.stars) === 18, `${tag} maths stickers pay only once`);
    // hub: goal card + 6 guardian cards
    await page.evaluate(() => WR.go('math')); await page.waitForSelector('#mathGoal');
    const hub = await page.evaluate(() => ({ goal: document.querySelector('#mathGoal').innerText, cards: document.querySelectorAll('.guards .gcard').length, locked: document.querySelectorAll('.guards .gcard.locked').length, here: (document.querySelector('.gcard.here') || {}).dataset, ov: document.documentElement.scrollWidth - innerWidth, btn: document.querySelector('#mathGoalGo').innerText }));
    ok(/Pass 1 more Grade 1–2 topic \(60%\+\) to wake Bramble/.test(hub.goal), `${tag} hub: next maths goal (${hub.goal.replace(/\n/g, ' ')})`);
    ok(hub.cards === 6 && hub.locked === 6 && hub.here && hub.here.gb === 'g12', `${tag} hub: 6 Grade Guardian cards, all asleep, the Grade 1–2 one marked as yours`);
    ok(hub.ov <= 0, `${tag} hub: no sideways overflow`);
    const shot = vp.phone ? 'phone' : 'desktop';
    await page.evaluate(() => document.querySelector('#mathGoal').scrollIntoView({ block: 'start' })); await page.waitForTimeout(700);
    await page.screenshot({ path: OUT + `mathgoals_${shot}_hub_goal.png` });
    await page.evaluate(() => document.querySelector('#guardHead').scrollIntoView({ block: 'start' })); await page.waitForTimeout(700);
    await page.screenshot({ path: OUT + `mathgoals_${shot}_guardians.png` });
    // locked guardian: a tap only explains
    await page.click('.gcard[data-gb="g12"]'); await page.waitForTimeout(250);
    ok(await page.$('#mathGoal') && !(await page.$('#bossFace')), `${tag} a sleeping guardian can't be fought yet`);
    // the goal button plays the next unpassed topic; pass it → the guardian wakes
    await page.click('#mathGoalGo'); await page.waitForSelector('#mans, .mopts');
    const lt = await page.evaluate(() => WR.Math._dbg().topic); ok(/^g1\./.test(lt), `${tag} goal button starts an unpassed Grade 1 topic (${lt})`);
    for (let i = 0; i < 8; i++) { await answer(page, true); await page.click('#mnext'); await page.waitForTimeout(60); }
    await page.waitForSelector('.result'); await page.click('#back'); await page.waitForSelector('#mathGoal');
    const awake = await page.evaluate(() => ({ goal: document.querySelector('#mathGoal').innerText, ready: !document.querySelector('.gcard[data-gb="g12"]').classList.contains('locked') }));
    ok(/Bramble the Button Bear is awake/.test(awake.goal) && awake.ready, `${tag} 4 passed Grade 1–2 topics wake the guardian (${awake.goal.split('\n').slice(-2).join(' ')})`);
    // the fight
    const s1 = await page.evaluate(() => WR.state.stars);
    await page.click('#mathGoalGo'); await page.waitForSelector('#bossFace');
    const f = await page.evaluate(() => ({ n: document.querySelector('.qnum').textContent, hud: document.querySelector('#gstrip').innerText + document.querySelector('.hud').innerText, timer: !!document.querySelector('.timer, #timerBar'), img: !!document.querySelector('#bossFace img'), nav: getComputedStyle(document.querySelector('#navbar')).display }));
    ok(/\/10$/.test(f.n) && /Bramble/.test(f.hud) && /0\/7/.test(f.hud) && !f.timer && f.img, `${tag} fight: 10 questions, guardian portrait + sparkle bar, no timer ${JSON.stringify(f)}`);
    await page.waitForTimeout(500); await page.screenshot({ path: OUT + `mathgoals_${shot}_fight.png` });
    let sawModel = false, grades = [];
    for (let i = 0; i < 10; i++) {
      if (await page.$('#vizBtn')) sawModel = true;
      const q = await answer(page, true); grades.push(q.grade);
      if (i === 6 && vp.phone) { await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300); await page.screenshot({ path: OUT + 'mathgoals_phone_fight_hit.png' }); }
      await page.click('#mnext'); await page.waitForTimeout(60);
    }
    ok(grades.every(g => g === 1 || g === 2), `${tag} fight questions are Grade 1–2 (${grades.join(',')})`);
    ok(sawModel, `${tag} 🧮 Model Magic is offered during the fight`);
    await page.waitForSelector('.result'); await page.waitForTimeout(500);
    const r = await page.evaluate(() => ({ h: document.querySelector('.result h1').innerText, back: document.querySelector('#back').innerText, stars: WR.state.stars, rec: WR.state.math.bosses.g12, guard: WR.state.stickers.got.guard, math: WR.state.stickers.got.math, topics: Object.keys(WR.state.math.topics) }));
    ok(/Bramble the Button Bear is beaten/.test(r.h) && r.rec.won && r.rec.tries === 1 && r.rec.best === 1, `${tag} winning saves the guardian win (${r.h})`);
    ok(r.guard.includes('g12') && r.math.includes('guardian'), `${tag} first win gives the Guardian sticker and the Guardian Badge`);
    // 10 first-try answers: 10 + 3 combo bonuses + 6 crown stars + 15 guardian + 2 stickers × 2
    ok(r.stars - s1 === 10 + 3 + 6 + 15 + 4, `${tag} first win pays +15⭐ (+ normal stars and +2⭐ per new sticker): +${r.stars - s1}`);
    ok(!r.topics.some(k => /guard/.test(k)), `${tag} a fight never changes topic crowns`);
    ok(/Sticker Book/.test(r.back), `${tag} result's main button opens the Sticker Book`);
    if (vp.phone) await page.screenshot({ path: OUT + 'mathgoals_phone_win.png' });
    const saved = await page.evaluate(k => { const d = JSON.parse(localStorage.getItem(k)); return { w: d.math.bosses.g12.won, g: d.stickers.got.guard }; }, KEY);
    ok(saved.w === true && saved.g.includes('g12'), `${tag} the win and stickers are in wordRealms.save.v1 (so they cloud-sync)`);
    // Sticker Book pages
    await page.click('#back'); await page.waitForSelector('.sbook');
    const sb = await page.evaluate(() => ({ pages: document.querySelectorAll('.spage').length, math: document.querySelectorAll('#sp_math .stk.has').length, guard: document.querySelectorAll('#sp_guard .stk.has').length, gn: document.querySelectorAll('#sp_guard .stk').length, t: document.querySelector('.sbook .title').innerText, ov: document.documentElement.scrollWidth - innerWidth, cnt: WR.Collect.count(), tot: WR.Collect.total() }));
    ok(sb.pages === 9 && sb.math === 5 && sb.guard === 1 && sb.gn === 6, `${tag} Sticker Book: Number Kingdom 5/8 and Grade Guardians 1/6 pages ${JSON.stringify(sb)}`);
    ok(sb.tot === 6 * 8 + 8 + 6 + 6 && new RegExp(`${sb.cnt}/${sb.tot}`).test(sb.t), `${tag} Sticker Book total counts the maths pages (${sb.t})`);
    ok(sb.ov <= 0, `${tag} sticker book: no sideways overflow`);
    await page.evaluate(() => document.querySelector('#sp_math').scrollIntoView({ block: 'start' })); await page.waitForTimeout(700);
    await page.screenshot({ path: OUT + `mathgoals_${shot}_stickers.png` });
    // rematch, lost: no second +15
    await page.evaluate(() => WR.go('math')); await page.waitForSelector('.gcard[data-gb="g12"] .btn');
    ok(/Rematch/.test(await page.textContent('.gcard[data-gb="g12"] .btn')), `${tag} beaten guardian offers a rematch`);
    const goal2 = await page.textContent('#mathGoal'); ok(!/Bramble/.test(goal2), `${tag} next goal moves on after the win (${goal2.trim().replace(/\s+/g, ' ').slice(0, 90)})`);
    await page.click('.gcard[data-gb="g12"] .btn'); await page.waitForSelector('#bossFace');
    const s2 = await page.evaluate(() => WR.state.stars);
    for (let i = 0; i < 10; i++) { await answer(page, false); await answer(page, false); await page.click('#mnext'); await page.waitForTimeout(40); }
    await page.waitForSelector('.result');
    const lost = await page.evaluate(() => ({ h: document.querySelector('.result h1').innerText, stars: WR.state.stars, rec: WR.state.math.bosses.g12 }));
    ok(/flew off to practise/.test(lost.h) && lost.stars === s2 && lost.rec.tries === 2 && lost.rec.won && lost.rec.best === 1, `${tag} a lost rematch pays nothing and keeps the old win (${lost.h})`);
    // the whole C6 map card still counts everything
    await page.evaluate(() => WR.go('home')); await page.waitForSelector('#bookGoal');
    ok(new RegExp(`/${sb.tot} stickers`).test(await page.textContent('#bookGoal')), `${tag} map: Sticker Book progress includes the maths pages`);
    ok(!errs.length, `${tag} no page errors ${errs.join(' | ')}`);
    await ctx.close();
  }
  await browser.close(); console.log(`mathgoals.js: ${passes} passed, ${fails} failed`);
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
