const { chromium } = require('playwright-core');
const OUT = '/workspace/cefr-quest/screenshots/';
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox','--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 860 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('requestfailed', r => errors.push('reqfail: ' + r.url()));
  await page.goto('http://127.0.0.1:18642/index.html', { waitUntil: 'networkidle' });
  // onboarding
  await page.fill('#nm', 'Jeremy');
  await page.click('[data-av="avatar_mage"]');
  await page.screenshot({ path: OUT + '00_onboarding.png' });
  await page.click('#n1');
  await page.click('[data-pet="pet_fox"]');
  await page.click('[data-lv="a1"]');
  await page.screenshot({ path: OUT + '01_adopt_pet.png' });
  await page.click('#go');
  await page.waitForSelector('.realm-node');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: OUT + '02_home_map.png', fullPage: true });
  // answer helper: click the correct option most of the time
  async function playLesson(name, shotAt, wrongOnce) {
    for (let i = 0; i < 12; i++) {
      await page.waitForSelector('.opt, #pool, .result', { timeout: 8000 });
      if (await page.$('.result')) break;
      if (await page.$('#pool')) {
        // order question: read answer from state via window
        const ans = await page.evaluate(() => {
          const pool = [...document.querySelectorAll('#pool .tile')].map(b => b.textContent);
          return pool;
        });
        const correct = await page.evaluate(() => window.__currentAnswer || null);
        // click tiles in correct order using the hidden answer
        const target = await page.evaluate(() => { const L = window.WR._dbg && window.WR._dbg(); return L; });
        for (const w of target.split(' ')) {
          const tiles = await page.$$('#pool .tile');
          for (const t of tiles) { if ((await t.textContent()) === w) { await t.click(); break; } }
        }
        if (i === shotAt) await page.screenshot({ path: OUT + name + '.png', fullPage: true });
        await page.click('#checkBtn');
      } else {
        const correct = await page.evaluate(() => window.WR._dbg());
        if (i === shotAt) { await page.waitForTimeout(500); await page.screenshot({ path: OUT + name + '.png', fullPage: true }); }
        const opts = await page.$$('.opt');
        let clicked = false;
        for (const o of opts) {
          const t = (await o.textContent()).slice(1);
          if ((t === correct) !== (wrongOnce && i === 1)) { await o.click(); clicked = true; break; }
        }
        if (!clicked) await opts[0].click();
      }
      await page.waitForSelector('#nextBtn');
      if (i === shotAt) { await page.waitForTimeout(700); await page.screenshot({ path: OUT + name + '_feedback.png', fullPage: true }); }
      await page.click('#nextBtn');
      await page.waitForTimeout(150);
    }
    await page.waitForSelector('.result', { timeout: 8000 });
  }
  // enter A1 realm
  await page.click('[data-r="a1"]');
  await page.waitForSelector('.skill-card');
  await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + '03_realm_a1.png', fullPage: true });
  for (const sk of ['grammar', 'vocab', 'reading', 'listening']) {
    await page.click(`[data-k="${sk}"]`);
    await playLesson('lesson_a1_' + sk, 0, true);
    await page.screenshot({ path: OUT + 'result_a1_' + sk + '.png' });
    // close any modal
    await page.waitForTimeout(900); if (await page.$('.modal-bg')) await page.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove()));
    await page.click('#back');
    await page.waitForSelector('.skill-card');
  }
  // A1 special (match)
  await page.click('[data-sp]');
  await page.waitForSelector('.mcard');
  await page.screenshot({ path: OUT + 'special_a1_match.png', fullPage: true });
  // teacher mode for remaining realms
  await page.evaluate(() => { WR.state.settings.unlockAll = true; WR.save(); });
  for (const r of ['a2', 'b1', 'b2', 'c1', 'c2']) {
    await page.evaluate(r => WR.go('realm', r), r);
    await page.waitForSelector('.skill-card');
    const sk = { a2: 'grammar', b1: 'reading', b2: 'listening', c1: 'reading', c2: 'vocab' }[r];
    await page.click(`[data-k="${sk}"]`);
    await playLesson(`lesson_${r}_${sk}`, 0, false);
    await page.waitForTimeout(900); if (await page.$('.modal-bg')) await page.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove()));
    await page.click('#back');
    await page.waitForSelector('.skill-card');
  }
  // specials B1 quest, C1 debate
  await page.evaluate(() => WR.go('realm', 'b1')); await page.waitForSelector('[data-sp]'); await page.click('[data-sp]');
  await page.waitForSelector('.story'); await page.screenshot({ path: OUT + 'special_b1_quest.png', fullPage: true });
  await page.click('.opt'); await page.waitForTimeout(200); await page.screenshot({ path: OUT + 'special_b1_quest_step2.png', fullPage: true });
  await page.evaluate(() => WR.go('realm', 'c1')); await page.waitForSelector('[data-sp]'); await page.click('[data-sp]');
  await page.waitForSelector('.knob'); await page.click('.opt'); await page.waitForSelector('#nextBtn'); await page.screenshot({ path: OUT + 'special_c1_debate.png', fullPage: true });
  // pet screen
  await page.evaluate(() => WR.go('pet'));
  await page.waitForSelector('#petStage');
  await page.waitForTimeout(600);
  const st = await page.$('#petStage'); const bb = await st.boundingBox();
  await page.mouse.move(bb.x + 100, bb.y + 100); await page.mouse.down();
  for (let k = 0; k < 10; k++) { await page.mouse.move(bb.x + 80 + k * 6, bb.y + 110); await page.waitForTimeout(80); }
  await page.mouse.up();
  await page.click('.snack[data-id="f_cookie"]');
  await page.waitForTimeout(1200);
  await page.click('#ball'); await page.waitForTimeout(500);
  await page.screenshot({ path: OUT + '04_pet.png', fullPage: true });
  await page.waitForTimeout(1500);
  // shop
  await page.evaluate(() => { WR.state.stars += 200; WR.save(); WR.go('shop'); });
  await page.waitForSelector('.item');
  await page.click('.buy'); await page.waitForTimeout(300);
  await page.click('.tabs button[data-t="petskins"]'); await page.waitForSelector('.item');
  await page.click('.buy'); await page.waitForTimeout(300);
  await page.screenshot({ path: OUT + '05_shop.png', fullPage: true });
  await page.click('.cash'); await page.waitForSelector('.modal');
  await page.screenshot({ path: OUT + '06_shop_cash_stub.png' });
  await page.click('#demo'); await page.waitForTimeout(300);
  await page.click('.tabs button[data-t="themes"]'); await page.click('.buy'); await page.waitForTimeout(300);
  await page.evaluate(() => WR.go('home')); await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + '07_home_after.png', fullPage: true });
  await page.evaluate(() => WR.go('review')); await page.waitForTimeout(300);
  await page.screenshot({ path: OUT + '08_review.png', fullPage: true });
  // mobile
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mp = await m.newPage();
  await mp.goto('http://127.0.0.1:18642/index.html');
  await mp.evaluate(s => localStorage.setItem('wordRealms.save.v1', s), await page.evaluate(() => localStorage.getItem('wordRealms.save.v1')));
  await mp.reload({ waitUntil: 'networkidle' }); await mp.waitForTimeout(800);
  await mp.screenshot({ path: OUT + '09_mobile_home.png' });
  await mp.evaluate(() => WR.startLesson({ realm: 'b2', skill: 'grammar', key: 'grammar', title: 'Grammar · Lake Boss Battle' }));
  await mp.waitForSelector('.opt'); await mp.waitForTimeout(1500);
  await mp.screenshot({ path: OUT + '10_mobile_boss.png' });
  const state = await page.evaluate(() => ({ stars: WR.state.stars, correct: WR.state.totalCorrect, pet: WR.state.pet, prog: Object.keys(WR.state.progress), owned: WR.state.owned, daily: WR.state.daily, streak: WR.state.streak }));
  console.log(JSON.stringify(state));
  console.log('ERRORS', JSON.stringify(errors, null, 1));
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
