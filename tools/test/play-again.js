// Task 13 play-again: egg, pet trick, next adventure, little quest, weekly sticker, combo sparkle,
// see-you-tomorrow, the 150 cap, and an old save. Run: node tools/test/play-again.js (game on :18642).
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const SAVE = { v: 1, name: 'Mei', stars: 40, gems: 0, xp: 0, avatar: { name: 'Mei', look: 0 }, progress: { a1: { vocab: { best: 1 } } }, unlocked: ['a1'], owned: ['hat_star'], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: true, health: { limit: 0, bed: '', until: 0 } }, mistakes: [], lessonsDone: 4,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 40, happiness: 80, hunger: 20, skin: null, lastTick: Date.now() },
  rewards: { got: ['r_streak3'], chest: { last: '2026-11-10', n: 1 }, caughtUp: true },
  streak: { count: 2, last: '2026-11-10' }, report: { days: {}, tally: {}, kept: [0, 0] },
  math: { grade: 1, topics: {}, correct: 4, answered: 4, lessons: 1 } };
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const open = async (w, h) => {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await ctx.route(/supabase\.co/, r => r.abort());
    await ctx.addInitScript(s => { if (!localStorage.getItem('wordRealms.save.v1')) localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE);
    const p = await ctx.newPage(); const errors = []; p.on('pageerror', e => errors.push(e.message));
    await p.goto(URL, { waitUntil: 'networkidle' }); await p.waitForTimeout(700);
    return { ctx, p, errors };
  };
  const logic = await open(360, 740);
  ok(await logic.p.evaluate(() => !document.querySelector('img[src*="again_"]')), 'the first screen does not fetch the egg or the stickers');
  const egg = await logic.p.evaluate(() => {
    const before = { stars: WR.state.stars, hat: WR.state.owned.includes('hat_star'), name: WR.state.name };
    const bare = JSON.parse(localStorage.getItem('wordRealms.save.v1')); delete bare.again; localStorage.setItem('wordRealms.save.v1', JSON.stringify(bare));
    WR.state = WR.load();
    const migrated = { stars: WR.state.stars, hat: WR.state.owned.includes('hat_star'), egg: WR.Again.state().egg.hatched, fill: WR.Again.state().egg.fill };
    const star0 = WR.state.stars;
    WR.state.again = { rounds: 0, egg: { fill: 0, hatched: 0 }, tricks: [], stickers: [], quest: { day: WR.today(), id: 'rounds', n: 0, goal: 3, done: false }, week: { key: '', days: {}, got: false, sticker: null } };
    const steps = [WR.Again.onRound(), WR.Again.onRound(), WR.Again.onRound()];
    const a = WR.Again.state();
    const stars3 = WR.state.stars;
    WR.state.earn = Object.assign(WR.earn(), { practice: 150 });
    WR.state.again.quest = { day: WR.today(), id: 'rounds', n: 2, goal: 3, done: false };
    const blocked = WR.Again.onRound();
    const capped = WR.state.stars === stars3;
    const mon = (() => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; })();
    for (let i = 0; i < 5; i++) { const t = new Date(mon); t.setDate(mon.getDate() + i); WR.Again.markDay(WR.dayKey(t.getTime()), i === 4 ? 'rest' : 'play'); }
    const week = WR.Again.state();
    return { before, migrated, star0, steps: steps.map(s => s && s.fill), hatched: a.egg.hatched, stickers: a.stickers.slice(), tricks: a.tricks.slice(), stars3, capped, blockedFill: blocked.fill, weekGot: week.week.got, weekSticker: week.week.sticker, restDay: Object.values(week.week.days).includes('rest') };
  });
  ok(egg.before.hat && egg.before.name === 'Mei' && egg.before.stars >= 40 && egg.migrated.hat && egg.migrated.stars === egg.before.stars && egg.migrated.egg === 0 && egg.migrated.fill === 0, `an old save keeps its stars and hat, and the egg starts empty (${egg.before.stars} → ${egg.migrated.stars})`);
  ok(egg.hatched === 1 && egg.stickers.includes('egg_ribbon') && egg.tricks.includes('hop'), `three rounds hatch Ribbon Chick and teach Happy Hop (${egg.stickers}, ${egg.tricks})`);
  ok(egg.stars3 === egg.star0 + 2, `the little quest pays 2 stars once through the star jar (${egg.star0} → ${egg.stars3})`);
  ok(egg.capped, 'at the 150 cap the quest pays nothing more');
  ok(egg.weekGot && egg.weekSticker && egg.restDay, `five days, including a rest day, earn the weekly sticker (${egg.weekSticker})`);
  const saved = await logic.p.evaluate(() => { WR.save(); return JSON.parse(localStorage.getItem('wordRealms.save.v1')); });
  await logic.p.reload({ waitUntil: 'networkidle' }); await logic.p.waitForTimeout(500);
  const back = await logic.p.evaluate(() => { const s = JSON.parse(localStorage.getItem('wordRealms.save.v1')); return { stars: WR.state.stars, hat: WR.state.owned.includes('hat_star'), name: WR.state.name, pet: WR.state.pet.name, hatch: WR.state.again && WR.state.again.egg.hatched, sticker: WR.state.again && WR.state.again.stickers[0] }; });
  ok(back.stars >= 40 && back.hat && back.name === 'Mei' && back.pet === 'Puffbun' && back.hatch === 1 && back.sticker === 'egg_ribbon', `reload keeps the egg prize and everything earned (${JSON.stringify(back)})`);
  ok(saved.again && saved.again.egg.hatched === 1, 'the egg lives in wordRealms.save.v1');
  await logic.ctx.close();

  for (const [w, h] of [[320, 640], [360, 740], [375, 667], [412, 780]]) {
    const ui = await open(w, h);
    await ui.p.evaluate(() => {
      const items = [11, 22, 33].map(s => MathGen.make('g1.add20', s));
      WR.Math.startLesson({ topic: 'g1.add20', items });
    });
    await ui.p.waitForTimeout(400);
    for (let i = 0; i < 3; i++) {
      const q = await ui.p.evaluate(() => WR.Math._dbg());
      if (q.kind === 'mcq') await ui.p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click();
      else { await ui.p.fill('#mans', q.a); await ui.p.click('#mcheck'); }
      await ui.p.waitForTimeout(200);
      if (i < 2) { await ui.p.click('#mnext'); await ui.p.waitForTimeout(200); }
    }
    if (w === 360) {
      const spark = await ui.p.locator('.combo-spark').count();
      ok(spark === 1, 'the third correct answer in a row shows a sparkle');
    }
    await ui.p.click('#mnext'); await ui.p.waitForSelector('#againNext');
    await ui.p.waitForFunction(() => { const im = document.querySelector('.egg-pic'); return im && im.naturalWidth >= 960; });
    const fit = await ui.p.evaluate(() => {
      const go = document.querySelector('#againNext').getBoundingClientRect();
      const im = document.querySelector('.egg-pic');
      return { wide: document.documentElement.scrollWidth <= innerWidth + 1, h: go.height, egg: im && im.naturalWidth, src: im && im.getAttribute('src'), text: document.querySelector('#againNext').textContent, harsh: /hurry|last chance|you failed|lost your|or else/i.test(document.body.innerText) };
    });
    ok(fit.wide && fit.h >= 44 && fit.egg >= 960 && /again_egg\.webp/.test(fit.src) && /Next adventure/.test(fit.text) && !fit.harsh, `${w}px result: Next adventure is ${fit.h.toFixed(0)}px, the painted egg is ${fit.egg}px wide, no sideways scroll`);
    await ui.p.evaluate(() => document.querySelectorAll('.combo-spark, .toast').forEach(e => e.remove()));
    if (w === 360) await ui.p.screenshot({ path: OUT + 't13_result_360.png', fullPage: true });
    if (w === 320) await ui.p.screenshot({ path: OUT + 't13_result_320.png' });
    await ui.ctx.close();
  }

  const hatch = await open(360, 740);
  await hatch.p.evaluate(() => {
    WR.state.again = { rounds: 2, egg: { fill: 2, hatched: 0 }, tricks: ['hop'], stickers: [], lastPrize: null, lastTrick: null, quest: { day: WR.today(), id: 'rounds', n: 3, goal: 3, done: true }, week: { key: '', days: {}, got: false, sticker: null } };
    WR.Again.onRound();
    WR._roundCtx = { kind: 'math', crowns: 3, score: 1, grade: 1 };
    WR.view('<div class="card result fade-in"><h1>Well done! 🌟</h1><p class="muted">3 / 3 correct</p><div class="next-row"><button class="btn mint" id="nextStep">Next</button></div></div>');
  });
  await hatch.p.waitForFunction(() => { const s = document.querySelector('.sticker-pic'), e = document.querySelector('.egg-pic'); return s && e && s.naturalWidth >= 512 && e.naturalWidth >= 960 && /again_egg_open/.test(e.getAttribute('src')); });
  ok(await hatch.p.evaluate(() => /Hatched: Ribbon Chick/.test(document.body.innerText) && /again_sticker_ribbon\.webp/.test(document.querySelector('.sticker-pic').getAttribute('src'))), 'a hatch shows the painted Ribbon Chick sticker and the open egg');
  await hatch.p.evaluate(() => document.querySelectorAll('.toast').forEach(e => e.remove()));
  await hatch.p.screenshot({ path: OUT + 't13_hatch_360.png', fullPage: true });
  await hatch.ctx.close();

  const bye = await open(360, 740);
  await bye.p.evaluate(() => {
    const d = WR.state.report.days[WR.dayKey()] = WR.state.report.days[WR.dayKey()] || { s: 0, l: 0, k: {} };
    d.s = 30 * 60; WR.state.settings.health.limit = 30; WR.save();
    WR.HEALTH.restCard('limit');
  });
  await bye.p.waitForSelector('#restCard');
  await bye.p.evaluate(() => document.querySelectorAll('.toast').forEach(e => e.remove()));
  const card = await bye.p.locator('#restCard').innerText();
  ok(/today's playtime/.test(card) && /egg is/.test(card) && /Tomorrow's little quest/.test(card) && !/hurry|last chance|you failed|lost your/i.test(card), 'the time-limit goodbye keeps the calm line and adds the egg and tomorrow');
  await bye.p.screenshot({ path: OUT + 't13_goodbye_360.png' });
  ok(!bye.errors.length, `no page errors ${bye.errors.slice(0, 2)}`);
  await bye.ctx.close();
  await b.close();
  console.log(fails ? `${fails} FAILED` : 'all play-again checks passed');
})().catch(e => { console.error(e); process.exit(1); });
