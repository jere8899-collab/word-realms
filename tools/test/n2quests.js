// 🎯 N2 (REVIEW-2026-11-02): daily quests only for things the child can do now. node tools/test/n2quests.js
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
let fails = 0, passes = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const SAVE = { v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'a1', stars: 10, pet: { species: 'pet_bunny', name: 'Puffbun', xp: 0, happiness: 70, hunger: 30, lastTick: Date.now() },
  progress: {}, owned: [], equipped: {}, settings: { rate: 1, sound: false, unlockAll: false }, mistakes: [], lessonsDone: 0, bonusSeen: ['sp'] };
const ALWAYS = ['correct10', 'lesson2', 'listen1', 'read1', 'perfect1', 'combo5', 'feed1', 'play3'];
const MATH = ['math1', 'dojo1', 'clock1', 'model1', 'balance1'];
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true });
  await ctx.route(/supabase|jsdelivr|unpkg/, r => r.abort());
  await ctx.addInitScript(() => { window.__WR_TEST = { holdMs: 0, pinOffer: false }; window.__WR_NO_SW = true; });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  const load = async (patch) => { await page.goto(BASE); await page.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, { ...SAVE, ...patch }); await page.reload(); await page.waitForSelector('#navbar'); await page.waitForFunction(() => WR.realms && WR.state.daily); };
  // roll `n` game days in a row (the game day is moved by the test; quests roll exactly as on a real new day)
  const roll = (n, setup) => page.evaluate(([n, setup]) => { if (setup) (new Function(setup))(); const real = WR.today, out = []; let d = new Date(real() + 'T12:00:00');
    for (let i = 0; i < n; i++) { d.setDate(d.getDate() + 1); const k = d.toISOString().slice(0, 10); WR.today = () => k; WR.ensureDaily(); out.push(WR.state.daily.quests.map(q => q.id)); }
    WR.today = real; return out; }, [n, setup || '']);
  const flat = days => [...new Set(days.flat())];

  // 1️⃣ a brand-new A1 player who never opened Maths: 7 days in a row, only A1-doable quests
  await load({});
  let days = await roll(7);
  ok(days.every(d => d.length === 3), '7 days, 3 quests each');
  ok(days.every(d => d.every(id => ALWAYS.includes(id) || id === 'special1')), 'new A1 player, 7 days: only doable quests ' + JSON.stringify(days));
  ok(!flat(days).some(id => MATH.includes(id)), 'no maths quests before a grade is chosen');
  days = await roll(60); ok(flat(days).every(id => ALWAYS.includes(id) || id === 'special1'), '60 more days: still nothing locked (no Writing, Story, Phonics, gap games, garden)');
  await page.evaluate(() => WR.go('quests')); await page.waitForTimeout(300);
  const qtext = await page.evaluate(() => document.querySelector('#main').innerText);
  ok(!/maths|Grades|Model Magic|equation/i.test(qtext), 'the Daily Quests screen shows no maths quest');
  await page.screenshot({ path: '/workspace/cefr-quest/screenshots/n2_quests_a1.png' });

  // 2️⃣ an old roll from before N2 (grade 6–8 maths for an A1 player): unstarted undoable quests are swapped, a started one stays
  const fixed = await page.evaluate(() => { WR.state.daily = { day: WR.today(), quests: [{ id: 'balance1', progress: 0, claimed: false }, { id: 'write1', progress: 0, claimed: false }, { id: 'correct10', progress: 4, claimed: false }] }; WR.ensureDaily(true); return WR.state.daily.quests.map(q => q.id + ':' + q.progress); });
  ok(fixed.length === 3 && fixed.includes('correct10:4') && !fixed.some(x => /balance1|write1/.test(x)), 'old undoable quests swapped, started one kept ' + fixed);

  // 3️⃣ bonus games open one by one: their quests come only once open
  await load({ lessonsDone: 2, bonusSeen: ['sp'] });
  days = await roll(80); let f = flat(days);
  ok(f.includes('story1') && f.includes('speak1') && !f.includes('write1') && !f.includes('charm1') && !f.includes('cloze1') && !f.includes('phonics1'), 'after 2 lessons: Story + Speaking quests, not Writing/Charms/gap games ' + f);
  await load({ lessonsDone: 12, bonusSeen: ['sp'] });
  f = flat(await roll(120)); ok(['write1', 'charm1', 'phonics1', 'swap1'].every(x => f.includes(x)), 'after 12 lessons the open games appear ' + f);
  await load({ lessonsDone: 12, bonusSeen: ['sp'], startLevel: 'b1', progress: {} });
  f = flat(await roll(120)); ok(!f.includes('phonics1') || await page.evaluate(() => WR.isUnlocked(0)), 'Phonics quest only when the A1 realm is open');

  // 4️⃣ maths: only after a grade is chosen, from that grade; English-only players get at most 1 a day
  await load({ math: { grade: 3, lessons: 0 } });
  days = await roll(60); f = flat(days);
  ok(days.every(d => d.filter(id => MATH.includes(id)).length <= 1), 'grade 3, English-only: at most 1 maths quest a day');
  ok(f.some(id => MATH.includes(id)) && !f.includes('balance1'), 'grade 3: maths quests appear, but no equation-balance quest ' + f.filter(x => MATH.includes(x)));
  await load({ math: { grade: 7, lessons: 5 } });
  days = await roll(80); f = flat(days);
  ok(f.includes('balance1') && !f.includes('clock1') && !f.includes('dojo1'), 'grade 7: balance quest yes, Clock Workshop / Times-Table Tower no ' + f.filter(x => MATH.includes(x)));
  ok(days.some(d => d.filter(id => MATH.includes(id)).length > 1), 'a player who plays maths can get more than 1 maths quest');
  await load({ math: { grade: 11, lessons: 5 } });
  f = flat(await roll(80)); ok(f.includes('math1') && !['model1', 'balance1', 'clock1', 'dojo1'].some(x => f.includes(x)), 'grade 11: only "finish a maths lesson" ' + f.filter(x => MATH.includes(x)));
  await load({ math: { grade: null, placed: { grade: 2 }, lessons: 0 } });
  f = flat(await roll(60)); ok(f.some(id => MATH.includes(id)), 'a placed grade (Sumi\'s grade finder) counts as chosen');

  // 5️⃣ the Singapore English track: its own games, no fairy-realm bonus games
  await load({ lessonsDone: 12, sg: { track: 'sg', level: 'p5', done: {}, rounds: 0 } });
  days = await roll(80); f = flat(days);
  ok(!['special1', 'story1', 'phonics1', 'charm1', 'swap1', 'forge1', 'cloze1', 'marks1'].some(x => f.includes(x)), 'Singapore track: no fairy-realm bonus quests ' + f);
  ok(f.includes('sgame1') && f.includes('write1') && f.includes('speak1'), 'Singapore track: Spot & Fix / Join It Up / Story Gaps, Speaking and Writing quests');
  const sgq = await page.evaluate(() => { WR.state.daily = { day: WR.today(), quests: [{ id: 'sgame1', progress: 0, claimed: false }] }; WR.SG.record('p5', 'edit', 0.8); return WR.state.daily.quests[0].progress; });
  ok(sgq === 1, 'finishing a Spot & Fix round counts for the Singapore quest');
  // 6️⃣ garden quest only with plants to water
  await load({ mistakes: [{ id: 'm1', q: 'x', correct: 'y', options: ['y', 'z'], box: 0, due: 0 }] });
  f = flat(await roll(80)); ok(f.includes('review1'), 'review quest appears once the garden has a plant');
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
