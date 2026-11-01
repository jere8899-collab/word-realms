// ⏸️ R8 (REVIEW-2026-11-01): hiding the app during the timed B2 boss (or the Times-Table sprint) leaves the timer where it
// was, for any length of time; coming back shows "Ready? 3-2-1" and then the timer carries on.   node tools/test/pausetimer.js
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = { v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'c2', stars: 60, totalCorrect: 1, totalAnswered: 1,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 20, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 1, last: today() }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 1 };
const HIDE = hidden => { Object.defineProperty(document, 'hidden', { get: () => hidden, configurable: true }); Object.defineProperty(document, 'visibilityState', { get: () => hidden ? 'hidden' : 'visible', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(BASE + 'index.html'); await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), SAVE);
  await page.reload(); await page.waitForSelector('.realm-node');
  await page.evaluate(async () => { const b = await WR.bank('b2', 'grammar'); const items = b.filter(q => !q.type || q.type === 'mcq').slice(0, 3).map(q => WR.normalize(q)); WR.startLesson({ realm: 'b2', skill: 'grammar', key: 'grammar', title: 'Boss', items, mode: 'boss' }); });
  await page.waitForSelector('#timerBar'); await page.waitForTimeout(1500);
  const w = () => page.evaluate(() => parseFloat(document.getElementById('timerBar').style.width) || 100);
  const w0 = await w(); ok(w0 < 100, `the boss timer is running (${w0.toFixed(1)}%)`);
  await page.evaluate(HIDE, true); const w1 = await w();
  await page.waitForTimeout(6000);
  const w2 = await w(); ok(Math.abs(w2 - w1) < 0.01, `6 s hidden: the timer stayed at ${w1.toFixed(1)}% (now ${w2.toFixed(1)}%)`);
  await page.evaluate(HIDE, false); await page.waitForTimeout(200);
  ok(/Ready|3/.test(await page.evaluate(() => (document.querySelector('.ready-go') || {}).textContent || '')), 'coming back shows "Ready? 3-2-1"');
  if (process.env.SHOT) await page.screenshot({ path: OUT + 'pausetimer_ready.png' });
  await page.waitForTimeout(1200); ok(Math.abs(await w() - w1) < 0.01, 'the timer waits during the countdown');
  await page.waitForTimeout(2500);
  ok(!(await page.$('.ready-go')) && await w() < w1 - 1, `after "1" the timer carries on (${(await w()).toFixed(1)}%)`);
  // pagehide also pauses
  await page.evaluate(() => dispatchEvent(new Event('pagehide'))); const w3 = await w(); await page.waitForTimeout(2000);
  ok(Math.abs(await w() - w3) < 0.01, 'pagehide pauses the timer too');
  await page.evaluate(() => dispatchEvent(new Event('pageshow'))); await page.waitForTimeout(4000);
  // Times-Table sprint
  await page.evaluate(() => { WR.go('dojo'); }); await page.waitForTimeout(300);
  await page.evaluate(() => WR.Math.startDojo('sprint')); await page.waitForSelector('#sprintLeft'); await page.waitForTimeout(1200);
  const s1 = await page.evaluate(() => parseInt(document.getElementById('sprintLeft').textContent));
  await page.evaluate(HIDE, true); await page.waitForTimeout(5000); await page.evaluate(HIDE, false); await page.waitForTimeout(3600);
  const s2 = await page.evaluate(() => parseInt(document.getElementById('sprintLeft').textContent));
  ok(s1 - s2 <= 1, `the 60-second sprint lost no time while hidden (${s1}s → ${s2}s)`);
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2));
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
