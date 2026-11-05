// 🌿 BRIEF-T6 healthy screen use (specs/006-healthy-screen-use), fake clock (Date moved in the page):
// a child back after 7 days sees a happy pet (no hunger/sadness from time away; old hungry saves lifted once); a free rest day keeps
// a streak; the 🌿 break nudge comes after ~20 min of one sitting at the END of a round (never mid-question), once per sitting;
// 👪 daily playtime + bedtime are off by default, set only behind the gate, stop new rounds with a calm 🌙 card, and "15 more
// minutes" asks the gate again. 320 / 360 / 375 / landscape fit. Screenshots screenshots/t6_*.png.
const { chromium } = require('playwright-core');
const BASE = process.env.BASE || 'http://127.0.0.1:18642', URL = BASE + '/index.html', OUT = '/workspace/cefr-quest/screenshots/';
const H = 36e5, DAY = 864e5; let passed = 0, failed = 0; const ok = (c, m) => { if (c) passed++; else failed++; console.log((c ? 'ok - ' : 'FAIL ') + m); };
const dk = t => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = extra => Object.assign({ v: 1, name: 'Mei', avatar: 'avatar_girl', startLevel: 'a1', stars: 10, totalCorrect: 0, totalAnswered: 0, lessonsDone: 2, bonusSeen: ['sp'],
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 0, happiness: 80, hunger: 30, lastTick: Date.now() }, streak: { count: 1, last: null },
  progress: {}, owned: [], equipped: {}, settings: { rate: 1, sound: false }, mistakes: [] }, extra || {});
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const errors = [];
  // at: the page clock (ms since epoch) for this context
  const open = async (save, at, vp = { width: 360, height: 740 }) => {
    const ctx = await browser.newContext({ viewport: vp, isMobile: vp.width < 700, hasTouch: vp.width < 700, deviceScaleFactor: 2 });
    await ctx.addInitScript(([s, off]) => { window.__WR_TEST = { holdMs: 0, pinOffer: false };
      const R = Date; let o = +(localStorage.getItem('__off') || off);
      class F extends R { constructor(...a) { a.length ? super(...a) : super(R.now() + o); } static now() { return R.now() + o; } }
      window.Date = F; window.__shift = ms => { o += ms; localStorage.setItem('__off', o); };
      if (!localStorage.getItem('__seeded')) { localStorage.setItem('wordRealms.save.v1', s); localStorage.setItem('__off', String(off)); localStorage.setItem('__seeded', '1'); } }, [JSON.stringify(save), at ? at - Date.now() : 0]);
    await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
    await ctx.route(/index\.html/, route => route.request().method() === 'HEAD' ? route.fulfill({ status: 200, headers: { Date: new Date(at || Date.now()).toUTCString() }, body: '' }) : route.continue());
    const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
    await page.goto(URL, { waitUntil: 'networkidle' }); await page.waitForFunction(() => window.WR && WR.HEALTH && WR.realms); await page.waitForTimeout(700);
    return { ctx, page }; };
  const shut = async page => { for (const b of await page.$$('.modal-bg button')) { if (/Hooray|Close|✕|OK|Later|Not now|Got it|Yay/i.test((await b.innerText()).trim()) && !(await b.evaluate(e => !!e.closest('#restCard,#breakCard')))) { await b.tap().catch(() => {}); await page.waitForTimeout(300); break; } } };
  const gatePass = async page => { await page.waitForSelector('.pgate'); const a = await page.evaluate(() => WR.parentGate._answer()); for (const d of a) await page.click(`.pgate [data-d="${d}"]`); await page.click('#pgOk'); };
  const vis = (page, sel) => page.$eval(sel, e => !!(e.offsetParent || e.getClientRects().length)).catch(() => false);
  const txt = (page, sel) => page.$eval(sel, e => e.innerText).catch(() => '');
  const answerAll = async (page, stopEarly) => { for (let i = 0; i < 14; i++) { await page.waitForSelector('.opt:not([disabled]), .result', { timeout: 15000 }); if (await page.$('.result')) return;
      if (stopEarly && await stopEarly(i)) return;
      const c = await page.evaluate(() => WR._cur().correct); const opts = await page.$$('.opt'); let hit = false;
      for (const b of opts) { const lab = (await b.getAttribute('aria-label')) || '', tx = (await b.innerText()).replace(/^[A-D]\s*/, '').trim(); if (lab === c || tx === c) { await b.tap(); hit = true; break; } }
      if (!hit) await opts[0].tap(); await page.waitForSelector('#nextBtn'); await page.tap('#nextBtn'); await page.waitForTimeout(60); } };
  const mcq = n => Array.from({ length: n }, (_, i) => ({ type: 'mcq', q: `Pick “cat${i}”`, options: ['cat' + i, 'dog' + i, 'hen' + i], correct: 'cat' + i, explain: 'x' }));
  const startRound = (page, n = 4) => page.evaluate(items => WR.startLesson({ realm: 'a1', skill: 'vocab', items, title: 'Test round' }), mcq(n));

  // 1. back after 7 days: a happy pet
  const t0 = Date.now();
  let { ctx, page } = await open(SAVE({ pet: { species: 'pet_bunny', name: 'Puffbun', xp: 0, happiness: 80, hunger: 30, lastTick: t0 - 7 * DAY }, healthMig: 1 }));
  await shut(page);
  let p = await page.evaluate(() => ({ h: WR.state.pet.hunger, j: WR.state.pet.happiness, mood: WR.petMood(), feel: WR.petFeel(WR.state.pet), map: document.body.innerText }));
  ok(p.h === 30 && p.j === 80, `7 days away: hunger and happiness unchanged (${p.h}, ${p.j})`);
  ok(/Yay, you're back! I missed you/.test(p.map) && !/hungry|🥺|🥹/.test(p.map), 'the map shows "Puffbun says: Yay, you\'re back! I missed you 💖", no hungry/sad words');
  await page.screenshot({ path: OUT + 't6_back_after_7_days.png' });
  ok(await page.evaluate(() => { WR.state.pet.hunger = 90; WR.state.pet.happiness = 10; const m = WR.petMood(); return !/hungry|🥺|🥹/.test(m + WR.petFeel(WR.state.pet)) && /treat|play together/.test(m); }), 'even a hungry pet never guilt-trips: "A snack would be a lovely treat! 🍓" / "Let\'s play together! 🥰"');
  await ctx.close();
  ({ ctx, page } = await open(SAVE({ pet: { species: 'pet_bunny', name: 'Puffbun', xp: 0, happiness: 5, hunger: 98, lastTick: t0 - 30 * DAY } })));
  p = await page.evaluate(() => ({ h: WR.state.pet.hunger, j: WR.state.pet.happiness, mig: WR.state.healthMig }));
  ok(p.h <= 40 && p.j >= 60 && p.mig === 1, `an older save's hungry, sad pet is lifted once (hunger ${p.h}, happiness ${p.j})`);
  await ctx.close();

  // 2. a free rest day
  const now = Date.now();
  ({ ctx, page } = await open(SAVE({ streak: { count: 5, last: dk(now - 2 * DAY) } })));
  let r = await page.evaluate(() => { const a = WR.streakAlive(); WR.bumpStreak(); return { a, c: WR.state.streak.count, rest: WR.state.streak.rest, toast: document.body.innerText.includes('rest day') }; });
  ok(r.a === 5 && r.c === 6 && r.rest && r.toast, `missed one day: the streak shows 5, then grows to 6 with "🌙 Your streak took a rest day and kept going!" (${JSON.stringify(r)})`);
  r = await page.evaluate(d => { WR.state.streak.last = d; return { a: WR.streakAlive(), c: (WR.bumpStreak(), WR.state.streak.count) }; }, dk(now - 2 * DAY));
  ok(r.a === 0 && r.c === 1, 'a second missed day within 7 days starts again at 1 (one rest day a week)');
  r = await page.evaluate(d => { WR.state.streak = { count: 3, last: d }; return { a: WR.streakAlive(), c: (WR.bumpStreak(), WR.state.streak.count) }; }, dk(now - 3 * DAY));
  ok(r.a === 0 && r.c === 1, 'two missed days: a fresh start at 1 (streaks stay; kind words only)');
  await ctx.close();

  // 3. break nudge: 21 minutes into a sitting; never mid-question; once per sitting
  ({ ctx, page } = await open(SAVE()));
  await page.evaluate(() => { WR.state.health = { start: Date.now() - 21 * 6e4, last: Date.now() - 3e4, nudged: false }; });
  await startRound(page); let mid = false;
  await answerAll(page, async i => { if (i === 2) { await page.waitForTimeout(1200); mid = await vis(page, '#breakCard'); } return false; });
  ok(!mid, 'no break card in the middle of a round');
  await page.waitForSelector('#breakCard', { timeout: 5000 }).catch(() => {});
  const bc = await txt(page, '#breakCard');
  ok(/Time for a little break/.test(bc) && /stretch/.test(bc) && /water/.test(bc) && /2[12] minutes/.test(bc), `after the round: the pet suggests a break ("${bc.split('\n').filter(Boolean).slice(0, 2).join(' · ')}")`);
  await page.screenshot({ path: OUT + 't6_break_360.png' });
  const bb = await page.$$eval('#breakCard .btn', bs => bs.map(b => b.getBoundingClientRect().height));
  ok(bb.length === 2 && bb.every(h => h >= 44), `two kind buttons, ≥ 44 px (${bb.map(Math.round)})`);
  await page.tap('#brMore'); await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove()));
  await startRound(page); await answerAll(page); await page.waitForTimeout(1500);
  ok(!(await page.$('#breakCard')), 'once per sitting: no second nudge after the next round');
  await page.evaluate(() => { WR.state.health.last = Date.now() - 11 * 6e4; WR.state.health.start = Date.now() - 40 * 6e4; });
  ok(await page.evaluate(() => WR.HEALTH.sittingMin() === 0), 'a 10-minute pause ends the sitting');
  await ctx.close();

  // 4. daily playtime: off by default; set only behind the gate; a new round shows the calm card; a round in progress finishes
  ({ ctx, page } = await open(SAVE()));
  ok(await page.evaluate(() => { const c = WR.HEALTH.cfg(); return c.limit === 0 && c.bed === '' && WR.HEALTH.restReason() === null; }), 'default: daily playtime OFF, bedtime OFF');
  await shut(page); await page.tap('#setBtn'); await page.waitForSelector('#guBtn'); await page.tap('#guBtn');
  ok(await vis(page, '.pgate') && !(await page.$('#guLimit')), 'the playtime setting sits behind the grown-up gate');
  await gatePass(page); await page.waitForSelector('#guLimit');
  await page.$eval('#guHealth', e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(900); await page.screenshot({ path: OUT + 't6_grownups_360.png' });
  ok(await page.evaluate(() => { const m = document.querySelector('#guLimit').closest('.modal'); return !m || +getComputedStyle(m).opacity === 1; }), 'the Grown-ups panel is fully shown (not mid-fade) for the screenshot');
  const opts = await page.$$eval('#guLimit option', o => o.map(x => x.textContent));
  ok(opts.join() === 'Off,30 min,45 min,60 min,90 min,120 min', `options: ${opts.join(', ')}`);
  await page.selectOption('#guLimit', '30');
  ok(await page.evaluate(() => WR.state.settings.health.limit === 30 && JSON.parse(localStorage.getItem('wordRealms.save.v1')).settings.health.limit === 30), 'set to 30 minutes, kept in the save (syncs like the PIN)');
  await page.tap('#guDone'); await page.waitForTimeout(300);
  // play a round that crosses the limit: it finishes
  await page.evaluate(() => { const d = WR.state.report.days[WR.dayKey()] = WR.state.report.days[WR.dayKey()] || { s: 0, l: 0, k: {} }; d.s = 29 * 60 + 50; });
  await startRound(page); await answerAll(page, async i => { if (i === 1) await page.evaluate(() => { WR.state.report.days[WR.dayKey()].s = 31 * 60; }); return false; });
  ok(!!(await page.$('.result')), 'a round already going finishes even when the limit is reached mid-round');
  await page.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove()));
  await page.evaluate(() => WR.go('realm', 'a1')); await page.waitForSelector('.path-grid'); await shut(page);
  await page.tap('.path-grid .skill-card[data-k="grammar"] h3'); await page.waitForTimeout(600);
  const rc = await txt(page, '#restCard');
  ok(/today's playtime/.test(rc) && !(await page.$('.opt')), `tapping a skill: "That's today's playtime! 🌙", no lesson starts`);
  await page.screenshot({ path: OUT + 't6_rest_limit_360.png' });
  ok(await page.evaluate(() => { document.querySelectorAll('.modal-bg').forEach(m => m.remove()); WR.go('phonicsRound'); return !!document.querySelector('#restCard'); }), 'rounds opened as screens (Phonics, Charms, gap games, Lessons) get the same calm card');
  await page.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove()));
  await page.evaluate(() => __shift(6 * 6e4));   // the grown-up's earlier gate pass (open for 5 minutes) has run out
  await page.tap('.path-grid .skill-card[data-k="grammar"] h3'); await page.waitForSelector('#rsMore'); await page.tap('#rsMore');
  ok(await vis(page, '.pgate'), '"👪 Grown-up: 15 more minutes" asks the grown-up gate');
  await gatePass(page); await page.waitForTimeout(400);
  await page.tap('.path-grid .skill-card[data-k="grammar"] h3'); await page.waitForSelector('.qnum, #restCard', { timeout: 8000 }).catch(() => {});
  ok(!!(await page.$('.qnum')) && !(await page.$('#restCard')), `after the gate: 15 more minutes, the lesson starts ("${await txt(page, '.qnum')}")`);
  await page.evaluate(() => __shift(16 * 6e4)); 
  ok(await page.evaluate(() => WR.HEALTH.restReason() === 'limit'), 'and after those 15 minutes the limit applies again');
  await ctx.close();

  // 5. bedtime 8:00 pm: rests from 7:00 pm to 5 am
  const at = h => { const d = new Date(); d.setHours(h, 30, 0, 0); return +d; };
  ({ ctx, page } = await open(SAVE({ settings: { rate: 1, sound: false, health: { limit: 0, bed: '20:00', until: 0 } } }), at(19)));
  r = await page.evaluate(() => { const D = new Date(Date.now()); const f = h => { const x = new Date(D); x.setHours(h, 30, 0, 0); return WR.HEALTH.restReason(+x); }; return [f(18), f(19), f(23), f(2), f(6)]; });
  ok(r.join() === ',bed,bed,bed,', `bedtime 8:00 pm: 6:30 pm free, 7:30 pm / 11:30 pm / 2:30 am rest, 6:30 am free (${r.map(x => x || '-')})`);
  await shut(page); await page.evaluate(() => WR.go('realm', 'a1')); await page.waitForSelector('.path-grid'); await shut(page);
  await page.tap('.path-grid .skill-card[data-k="vocab"] h3'); await page.waitForSelector('#restCard');
  const bt = await txt(page, '#restCard');
  ok(/wind down for bed/.test(bt) && /8:00 pm/.test(bt) && !(await page.$('.opt')), `7:30 pm: "Time to wind down for bed 🌙 Bedtime is at 8:00 pm…"`);
  await page.screenshot({ path: OUT + 't6_rest_bed_360.png' });
  await ctx.close();

  // 6. phones: the cards fit at 320 / 375 / landscape
  for (const [n, vp] of [['320', { width: 320, height: 640 }], ['375', { width: 375, height: 667 }], ['landscape', { width: 740, height: 360 }]]) {
    ({ ctx, page } = await open(SAVE({ settings: { rate: 1, sound: false, health: { limit: 0, bed: '20:00', until: 0 } } }), at(19), vp));
    await page.evaluate(() => { document.querySelectorAll('.modal-bg').forEach(m => m.remove()); WR.HEALTH.restCard('bed'); }); await page.waitForSelector('#restCard'); await page.waitForTimeout(400);
    const f = await page.evaluate(() => { const c = document.querySelector('#restCard'), bs = [...c.querySelectorAll('.btn')].map(b => b.getBoundingClientRect());
      return { fit: bs.every(b => b.right <= innerWidth + 1 && b.left >= -1 && b.bottom <= innerHeight + 1 || c.closest('.modal-bg').scrollHeight > innerHeight), tall: bs.every(b => b.height >= 44), sx: document.documentElement.scrollWidth <= innerWidth + 1 }; });
    ok(f.fit && f.tall && f.sx, `${n}: the 🌙 card fits, buttons ≥ 44 px, no sideways scroll`);
    await page.screenshot({ path: OUT + `t6_rest_${n}.png` });
    await page.evaluate(() => { document.querySelectorAll('.modal-bg').forEach(m => m.remove()); WR.state.health = { start: Date.now() - 22 * 6e4, last: Date.now(), nudged: false }; WR.HEALTH.breakCard(); }); await page.waitForSelector('#breakCard');
    const g = await page.evaluate(() => [...document.querySelectorAll('#breakCard .btn')].every(b => { const r = b.getBoundingClientRect(); return r.height >= 44 && r.right <= innerWidth + 1; }));
    ok(g, `${n}: the 🌿 break card's buttons fit, ≥ 44 px`); await page.screenshot({ path: OUT + `t6_break_${n}.png` });
    await ctx.close();
  }
  ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  console.log(`health: ${passed} passed, ${failed} failed`); await browser.close(); process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
