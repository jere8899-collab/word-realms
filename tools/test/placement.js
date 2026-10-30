// 🪞 Magic Mirror placement quiz: staircase logic, simulated learners, onboarding + retake, mobile layout.
const { chromium } = require('playwright-core');
const OUT = '/workspace/cefr-quest/screenshots/';
const URL = 'http://127.0.0.1:18642/index.html';
const assert = (c, m) => { if (!c) throw new Error('ASSERT ' + m); console.log('ok -', m); };
const LV = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 860 } });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => errors.push('reqfail ' + r.url()));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'networkidle' });

  // pure logic
  const logic = await page.evaluate(() => [
    WR.placementResult({ 2: 4 }), WR.placementResult({ 2: 3, 3: 1 }), WR.placementResult({ 2: 1, 1: 3 }),
    WR.placementResult({ 2: 0, 1: 1, 0: 1 }), WR.placementResult({ 2: 4, 3: 4, 4: 3, 5: 3 }), WR.placementResult({ 2: 1, 1: 1, 0: 4 })]);
  assert(JSON.stringify(logic) === JSON.stringify([null, 3, 2, 0, 5, 1]), 'staircase result logic ' + JSON.stringify(logic));

  // a simulated learner who knows levels up to `knows` (index), answers wrong / unsure above it
  async function runQuiz(knows, shots) {
    await page.waitForSelector('#plGo'); if (shots) await page.screenshot({ path: OUT + 'placement_01_intro.png' });
    await page.click('#plGo');
    let n = 0, sawListen = false;
    for (; n < 30; n++) {
      await page.waitForSelector('.opt, #plAccept', { timeout: 8000 });
      if (await page.$('#plAccept')) break;
      const d = await page.evaluate(() => WR._plDbg());
      if (await page.$('#playBtn')) sawListen = true;
      const ok = LV.indexOf(d.lv) <= knows;
      if (!ok && n % 2) await page.click('#unsure');
      else for (const o of await page.$$('.opt')) { if (((await o.textContent()).slice(1) === d.c) === ok) { await o.click(); break; } }
      if (shots && n === 1) { await page.waitForTimeout(250); await page.screenshot({ path: OUT + 'placement_02_question.png' }); }
      await page.click('#plNext'); await page.waitForTimeout(60);
    }
    return { n, sawListen };
  }

  // onboarding → mirror; learner solid up to B1 should be placed in B2
  await page.fill('#nm', 'Jeremy'); await page.click('[data-av="avatar_girl"]'); await page.click('#n1');
  await page.click('[data-pet="pet_bunny"]');
  await page.screenshot({ path: OUT + 'placement_00_onboarding_entry.png' });
  await page.click('#mirrorBtn');
  let r = await runQuiz(2, true);
  assert(r.sawListen, 'listening riddles included (' + r.n + ' questions)');
  assert(r.n >= 8 && r.n <= 16, 'quiz length reasonable: ' + r.n);
  await page.waitForTimeout(400);
  await page.screenshot({ path: OUT + 'placement_03_result.png' });
  let st = await page.evaluate(() => WR.state.placement);
  assert(st.level === 'b2', 'B1-level learner placed in B2 (ready to learn): ' + st.level);
  await page.click('#plAccept'); await page.waitForSelector('.realm-node');
  st = await page.evaluate(() => ({ start: WR.state.startLevel, stars: WR.state.stars, open: [...document.querySelectorAll('.realm-node:not(.locked)')].length }));
  assert(st.start === 'b2' && st.open === 4, 'onboarding starts in B2 with A1–B2 open');
  assert(st.stars === 15, '+5⭐ for first reading');
  assert(await page.$('#mirrorPill'), 'home shows the mirror pill');

  // retake from home: a total beginner (knows nothing) → A1, never locks realms, no extra stars
  await page.click('#mirrorPill'); r = await runQuiz(-1);
  st = await page.evaluate(() => WR.state.placement.level); assert(st === 'a1', 'beginner placed in A1');
  await page.click('#plAccept'); await page.waitForTimeout(300);
  st = await page.evaluate(() => ({ start: WR.state.startLevel, stars: WR.state.stars }));
  assert(st.start === 'b2' && st.stars === 15, 'lower retake keeps realms open and pays no extra stars');

  // retake via settings: expert → C2 opens everything
  await page.evaluate(() => WR.go('home')); await page.click('#setBtn'); await page.click('#plRe');
  r = await runQuiz(5);
  st = await page.evaluate(() => WR.state.placement.level); assert(st === 'c2', 'expert placed in C2');
  await page.click('#plAccept'); await page.waitForTimeout(300);
  st = await page.evaluate(() => WR.state.startLevel); assert(st === 'c2', 'higher retake opens up to C2');
  await page.evaluate(() => WR.go('home')); await page.waitForTimeout(400);
  assert((await page.$$('.realm-node.locked')).length === 0, 'all realms open after C2 placement');

  // leaving mid-quiz returns to the map with the nav restored
  await page.click('#mirrorPill'); await page.click('#plGo'); await page.waitForSelector('#plQuit'); await page.click('#plQuit');
  await page.waitForSelector('.realm-node'); assert(await page.isVisible('#navbar'), 'leave mid-quiz restores the map + nav');

  // mobile layout
  await page.setViewportSize({ width: 390, height: 844 });
  await page.click('#mirrorPill'); await page.click('#plGo'); await page.waitForSelector('.opt'); await page.waitForTimeout(300);
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await page.screenshot({ path: OUT + 'placement_04_mobile.png' });
  assert(ov <= 0, 'no horizontal overflow on 390px (' + ov + ')');
  assert(errors.length === 0, 'no console errors ' + JSON.stringify(errors));
  await browser.close(); console.log('PLACEMENT TESTS PASSED');
})().catch(e => { console.error(e); process.exit(1); });
