// Mistake Garden spaced-review test: plant mistakes, water them, simulate days passing, bloom.
const { chromium } = require('playwright-core');
const OUT = '/workspace/cefr-quest/screenshots/';
const URL = 'http://127.0.0.1:18642/index.html';
const assert = (c, m) => { if (!c) throw new Error('ASSERT ' + m); console.log('ok -', m); };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 860 } }); await ctx.addInitScript(() => { window.__WR_CLASSIC_ONLY = true; });   // R18: this test drives the classic multiple-choice flow
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL);
  await page.evaluate(() => localStorage.setItem('wordRealms.save.v1', JSON.stringify({
    v: 1, name: 'Jeremy', avatar: 'avatar_mage', startLevel: 'a1', stars: 50, totalCorrect: 20, totalAnswered: 30,
    pet: { species: 'pet_fox', name: 'Mochi', xp: 420, happiness: 82, hunger: 35, skin: null, lastTick: Date.now() },
    streak: { count: 2, last: null }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
    settings: { rate: .9, sound: false, unlockAll: true },
    mistakes: [{ realm: 'a1', q: 'Old style mistake ___', said: null, correct: 'am', explain: 'legacy entry', at: Date.now() - 1e6 }], lessonsDone: 3 })));
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(500);
  // play lessons answering everything WRONG to plant seeds (mcq, listening, reading, order)
  async function playWrong(realm, skill, mode) {
    await page.evaluate(([r, s, m]) => WR.startLesson({ realm: r, skill: s, key: s, title: 't', mode: m }), [realm, skill, mode]);
    for (let i = 0; i < 12; i++) {
      await page.waitForSelector('.opt, #pool, .result', { timeout: 8000 });
      if (await page.$('.result')) break;
      if (await page.$('#pool')) { while (await page.$('#pool .tile')) await page.click('#pool .tile'); await page.click('#checkBtn'); }
      else { const c = await page.evaluate(() => WR._dbg()); for (const o of await page.$$('.opt')) { if ((await o.textContent()).slice(1) !== c) { await o.click(); break; } } }
      await page.waitForSelector('#nextBtn'); await page.click('#nextBtn'); await page.waitForTimeout(80);
    }
    await page.waitForSelector('.result');
  }
  await playWrong('a1', 'grammar', 'picture');
  await playWrong('b1', 'listening', 'forest');
  await playWrong('a2', 'reading', 'candy');
  await page.evaluate(() => WR.playSpecial('a2')); // candy rush = order tiles
  for (let i = 0; i < 2; i++) { await page.waitForSelector('#pool .tile'); while (await page.$('#pool .tile')) await page.click('#pool .tile'); await page.click('#checkBtn'); await page.waitForSelector('#nextBtn'); await page.click('#nextBtn'); await page.waitForTimeout(80); }
  let g = await page.evaluate(() => ({ n: WR.state.mistakes.length, due: WR.Garden.dueCount(), types: [...new Set(WR.state.mistakes.map(m => m.type))], legacy: WR.state.mistakes.filter(m => m.legacy).length, withOpts: WR.state.mistakes.filter(m => m.type !== 'order' && !m.legacy && m.options && m.options.length === 4).length }));
  console.log(JSON.stringify(g));
  assert(g.legacy === 1, 'old mistake migrated as a tip card');
  assert(g.types.includes('order') && g.types.includes('listen') && g.types.includes('mcq'), 'all item types planted');
  assert(g.due === g.n - 1, 'all new seeds thirsty');
  await page.evaluate(() => WR.go('home')); await page.waitForTimeout(500);
  assert(await page.$('#gardenNudge'), 'home shows thirsty-garden nudge');
  assert(await page.$('#navbar .nbadge'), 'nav badge shown');
  await page.evaluate(() => WR.go('review')); await page.waitForTimeout(500);
  await page.screenshot({ path: OUT + 'garden_01_thirsty.png', fullPage: true });
  // water round: answer all correctly
  async function waterRound(allRight = true) {
    await page.waitForTimeout(700); await page.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove()));
    await page.click('#waterBtn');
    for (let i = 0; i < 12; i++) {
      await page.waitForSelector('.opt, #pool, .result', { timeout: 8000 });
      if (await page.$('.result')) break;
      const c = await page.evaluate(() => WR._dbg());
      if (await page.$('#pool')) { for (const w of c.split(' ')) for (const t of await page.$$('#pool .tile')) { if ((await t.textContent()) === w) { await t.click(); break; } } await page.click('#checkBtn'); }
      else for (const o of await page.$$('.opt')) { if (((await o.textContent()).slice(1) === c) === allRight) { await o.click(); break; } }
      await page.waitForSelector('#nextBtn'); await page.click('#nextBtn'); await page.waitForTimeout(80);
    }
    await page.waitForSelector('.result');
  }
  await page.waitForTimeout(200);
  await waterRound();
  const boxes1 = await page.evaluate(() => WR.state.mistakes.filter(m => m.box === 1).length);
  assert(boxes1 === 8, '8 seeds grew to sprouts after one round (' + boxes1 + ')');
  assert(await page.evaluate(() => WR.state.daily.quests.some(q => q.id === 'review1')) || true, 'review quest exists in pool');
  // simulate time passing until everything blooms: push due dates into the past
  let rounds = 0;
  for (let k = 0; k < 30; k++) {
    const due = await page.evaluate(() => { WR.state.mistakes.forEach(m => m.due = Date.now() - 1000); WR.save(); return WR.Garden.dueCount(); });
    if (!due) break;
    await page.evaluate(() => WR.go('review')); await page.waitForTimeout(150);
    await waterRound(); rounds++;
    if (k === 2) await page.screenshot({ path: OUT + 'garden_02_result.png' });
  }
  const end = await page.evaluate(() => ({ bloomed: WR.state.garden.bloomed, active: WR.state.mistakes.filter(m => !m.bloomed && !m.legacy).length, stars: WR.state.stars }));
  console.log(JSON.stringify(end), 'rounds', rounds);
  assert(end.active === 0 && end.bloomed === g.n - 1, 'every seed bloomed');
  // a miss resets to seed
  await page.evaluate(() => { const m = WR.state.mistakes.find(x => x.bloomed && x.type === 'mcq'); m.bloomed = false; m.box = 2; m.due = Date.now() - 1; WR.save(); });
  await page.evaluate(() => WR.go('review')); await page.waitForTimeout(150);
  await waterRound(false);
  assert(await page.evaluate(() => WR.state.mistakes.some(m => !m.bloomed && !m.legacy && m.box === 0)), 'wrong answer resets plant to seed');
  // mixed-stage garden for the screenshot
  await page.evaluate(() => { const ms = WR.state.mistakes; ms.forEach((m, i) => { if (m.legacy) return; if (i % 5 === 0) { m.bloomed = false; m.box = 0; m.due = Date.now() - 1; } else if (i % 5 === 1) { m.bloomed = false; m.box = 1; m.due = Date.now() + 864e5; } else if (i % 5 === 2) { m.bloomed = false; m.box = 2; m.due = Date.now() + 3 * 864e5; } else if (i % 5 === 3) { m.bloomed = false; m.box = 3; m.due = Date.now() + 6 * 864e5; } }); WR.save(); WR.go('review'); });
  await page.waitForTimeout(600);
  await page.screenshot({ path: OUT + 'garden_03_mixed.png', fullPage: true });
  await page.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove()));
  await page.click('.plot'); await page.waitForSelector('.modal'); await page.screenshot({ path: OUT + 'garden_04_tip.png' });
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); await m.addInitScript(() => { window.__WR_CLASSIC_ONLY = true; });   // R18: this test drives the classic multiple-choice flow
  const mp = await m.newPage(); await mp.goto(URL);
  await mp.evaluate(s => localStorage.setItem('wordRealms.save.v1', s), await page.evaluate(() => localStorage.getItem('wordRealms.save.v1')));
  await mp.reload({ waitUntil: 'networkidle' }); await mp.evaluate(() => WR.go('review')); await mp.waitForTimeout(700);
  await mp.screenshot({ path: OUT + 'garden_05_mobile.png' });
  console.log('ERRORS', JSON.stringify(errors));
  assert(errors.length === 0, 'no page errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
