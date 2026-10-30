// Clean, viewport-sized screenshots of the main screens + order-tile & special modes, using a saved profile.
const { chromium } = require('playwright-core');
const OUT = '/workspace/cefr-quest/screenshots/';
const URL = 'http://127.0.0.1:18642/index.html';
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 860 } });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL);
  await page.evaluate(() => localStorage.setItem('wordRealms.save.v1', JSON.stringify({
    v: 1, name: 'Jeremy', avatar: 'avatar_mage', startLevel: 'a1', stars: 142, totalCorrect: 57, totalAnswered: 70,
    pet: { species: 'pet_fox', name: 'Mochi', xp: 420, happiness: 82, hunger: 35, skin: null, lastTick: Date.now() },
    streak: { count: 4, last: null }, progress: { a1: { grammar: { best: 1, plays: 1 }, vocab: { best: .88, plays: 1 }, reading: { best: .83, plays: 1 }, listening: { best: .75, plays: 1 } }, a2: { grammar: { best: .75, plays: 1 } } },
    owned: ['o_flower'], equipped: { outfit: 'o_flower', petskin: null, theme: null }, settings: { rate: .9, sound: false, unlockAll: false }, mistakes: [], lessonsDone: 5 })));
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('wordRealms.save.v1')); const d = new Date(); s.streak.last = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); });
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(900);
  await page.screenshot({ path: OUT + 'home_map.png' }); await page.evaluate(() => window.scrollTo(0, 420)); await page.waitForTimeout(300); await page.screenshot({ path: OUT + 'home_map_realms.png' }); await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() => WR.go('realm', 'a2')); await page.waitForTimeout(900);
  await page.screenshot({ path: OUT + 'realm_a2.png' });
  // candy rush (sentence builder tiles)
  await page.click('[data-sp]'); await page.waitForSelector('#pool .tile');
  const target = await page.evaluate(() => WR._dbg());
  const words = target.split(' ');
  for (const w of words.slice(0, 3)) { for (const t of await page.$$('#pool .tile')) { if ((await t.textContent()) === w) { await t.click(); break; } } }
  await page.waitForTimeout(400);
  await page.screenshot({ path: OUT + 'lesson.png' });
  // listening (B1, forest mode)
  await page.evaluate(() => WR.startLesson({ realm: 'b1', skill: 'listening', key: 'listening', title: 'Listening · Forest Quest' }));
  await page.waitForSelector('#playBtn'); await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + 'listening.png' });
  const c = await page.evaluate(() => WR._dbg());
  for (const o of await page.$$('.opt')) { if ((await o.textContent()).slice(1) === c) { await o.click(); break; } }
  await page.waitForTimeout(1000);
  await page.screenshot({ path: OUT + 'listening_feedback.png' });
  // reading C1 (council mode)
  await page.evaluate(() => WR.startLesson({ realm: 'c1', skill: 'reading', key: 'reading', title: 'Reading · Council Debate' }));
  await page.waitForSelector('.passage'); await page.waitForTimeout(700);
  await page.screenshot({ path: OUT + 'reading_c1_council.png' });
  // C2 riddle duel
  await page.evaluate(() => WR.playSpecial('c2')); await page.waitForSelector('.dragon-scroll'); await page.waitForTimeout(700);
  await page.screenshot({ path: OUT + 'special_c2_riddle_duel.png' });
  // pet
  await page.evaluate(() => WR.go('pet')); await page.waitForTimeout(900);
  const st = await page.$('#petStage'); const bb = await st.boundingBox();
  await page.mouse.move(bb.x + 100, bb.y + 90); await page.mouse.down();
  for (let k = 0; k < 8; k++) { await page.mouse.move(bb.x + 70 + k * 9, bb.y + 100); await page.waitForTimeout(90); }
  await page.mouse.up(); await page.waitForTimeout(300);
  await page.screenshot({ path: OUT + 'pet.png' });
  await page.click('#ball'); await page.waitForTimeout(1000);
  await page.screenshot({ path: OUT + 'pet_ball.png' });
  await page.waitForTimeout(1200);
  // shop
  await page.evaluate(() => WR.go('shop')); await page.waitForTimeout(700);
  await page.screenshot({ path: OUT + 'shop.png' });
  // mobile
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mp = await m.newPage(); await mp.goto(URL);
  await mp.evaluate(s => localStorage.setItem('wordRealms.save.v1', s), await page.evaluate(() => localStorage.getItem('wordRealms.save.v1')));
  await mp.reload({ waitUntil: 'networkidle' }); await mp.waitForTimeout(900);
  await mp.screenshot({ path: OUT + 'mobile_home.png' });
  await mp.evaluate(() => WR.startLesson({ realm: 'a1', skill: 'vocab', key: 'vocab', title: 'Vocabulary · Picture Pop' }));
  await mp.waitForSelector('.opt'); await mp.waitForTimeout(700);
  await mp.screenshot({ path: OUT + 'mobile_lesson.png' });
  console.log('shot errors', JSON.stringify(errors));
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
