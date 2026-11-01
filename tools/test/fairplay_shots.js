// Screenshots for the "Fair Play" distractor pass: C2 listening and C1 reading with balanced options.
const { chromium } = require('playwright-core');
const OUT = '/workspace/cefr-quest/screenshots/';
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const page = await (await b.newContext({ viewport: { width: 1200, height: 860 } })).newPage(); await page.addInitScript(() => { window.__WR_CLASSIC_ONLY = true; });   // R18: classic flow
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:18642/index.html');
  await page.evaluate(() => localStorage.setItem('wordRealms.save.v1', JSON.stringify({ v: 1, name: 'Jeremy', avatar: 'avatar_mage', startLevel: 'c1', stars: 142, totalCorrect: 57, totalAnswered: 70,
    pet: { species: 'pet_fox', name: 'Mochi', xp: 420, happiness: 82, hunger: 35, skin: null, lastTick: Date.now() }, streak: { count: 4, last: null }, progress: {},
    owned: [], equipped: { outfit: null, petskin: null, theme: null }, settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 5 })));
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(700);
  await page.evaluate(() => WR.startLesson({ realm: 'c2', skill: 'listening', key: 'listening', title: 'Listening · Dragon Riddles' }));
  await page.waitForSelector('.opt'); await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + 'fairplay_c2_listening.png' });
  await page.evaluate(() => WR.startLesson({ realm: 'c1', skill: 'reading', key: 'reading', title: 'Reading · Council Debate' }));
  await page.waitForSelector('.passage'); await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + 'fairplay_c1_reading.png' });
  console.log('ERRORS', errors); await b.close();
})();
