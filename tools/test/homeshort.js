// 🏠 R15 (REVIEW-2026-11-01): the home page is at most ~2.5 screens tall on 375×667, Phonics is only the A1 bonus tile,
// and Daily Quests + the pet fold into one compact row that opens their own screens.   node tools/test/homeshort.js
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = (x = {}) => ({ v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'a1', stars: 40, totalCorrect: 12, totalAnswered: 14,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 30, happiness: 70, hunger: 75, skin: null, lastTick: Date.now() },
  streak: { count: 2, last: today() }, progress: { a1: { grammar: { best: .8, plays: 1 } } }, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false }, mistakes: [], lessonsDone: 2, ...x });
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(BASE + 'index.html'); await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), SAVE());
  await page.reload(); await page.waitForSelector('.realm-node'); await page.waitForTimeout(800);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log('home height', h, (h / 667).toFixed(2), 'screens');
  ok(h <= 667 * 2.5, `home page is ${(h / 667).toFixed(2)} screens tall on 375×667 (≤ 2.5)`);
  ok(!(await page.$('#phonicsNode')), 'no Phonics card on the map (Phonics lives in the A1 realm)');
  const row = await page.evaluate(() => ({ q: (document.getElementById('questsMini') || {}).innerText || '', p: (document.getElementById('petMini') || {}).innerText || '', full: !!document.querySelector('#main .quests'), petCard: !!document.getElementById('petCard') }));
  ok(/\d\/3/.test(row.q) && /Puffbun/.test(row.p), `compact row: "${row.q.replace(/\s+/g, ' ')}" · "${row.p.replace(/\s+/g, ' ')}"`);
  ok(/hungry/i.test(row.p), 'the pet chip says how the pet feels (hunger 75 → hungry)');
  ok(!row.full && !row.petCard, 'the full quest list and the pet card are no longer on the home page');
  if (process.env.SHOT) { await page.evaluate(() => document.querySelectorAll('.toast').forEach(t => t.remove())); await page.screenshot({ path: OUT + 'homeshort_01_top.png' }); await page.screenshot({ path: OUT + 'homeshort_02_full.png', fullPage: true }); }
  await page.click('#questsMini'); await page.waitForSelector('#main .quests');
  ok(await page.locator('#main .quests .q').count() === 3, 'the quest chip opens the Daily Quests screen with all 3 quests');
  // claim from the quests screen
  await page.evaluate(() => { const q = WR.state.daily.quests[0]; q.progress = WR.questDef(q.id).goal; WR.save(); WR.go('quests'); });
  const s0 = await page.evaluate(() => WR.state.stars); await page.click('.claim'); await page.waitForTimeout(300);
  ok(await page.evaluate(s0 => WR.state.stars > s0 && WR.state.daily.quests[0].claimed, s0), 'a quest can be claimed on the Daily Quests screen');
  if (process.env.SHOT) await page.screenshot({ path: OUT + 'homeshort_03_quests.png' });
  await page.evaluate(() => WR.go('home')); await page.waitForSelector('#petMini'); await page.click('#petMini'); await page.waitForTimeout(400);
  ok(!!(await page.$('#pethome')), 'the pet chip opens the pet screen');
  // a ready-to-claim quest is flagged on the chip
  await page.evaluate(() => { const q = WR.state.daily.quests[1]; q.progress = WR.questDef(q.id).goal; WR.save(); WR.go('home'); }); await page.waitForSelector('#questsMini');
  ok(/claim/i.test(await page.innerText('#questsMini')), 'the quest chip says when a prize is ready to claim');
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2));
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
