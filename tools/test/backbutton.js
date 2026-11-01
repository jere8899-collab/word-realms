// ◀ R6 (REVIEW-2026-11-01): the phone's Back button. In a lesson it asks "Leave this lesson? Your stars so far are kept",
// then goes to the realm; from a realm it goes to the map; on the map it leaves the game; it closes pop-ups first; the
// stars earned in the lesson are kept.   node tools/test/backbutton.js   (SHOT=1 → screenshots/back_*.png)
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = { v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'a1', stars: 10, totalCorrect: 1, totalAnswered: 1,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 20, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 1, last: today() }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: false }, mistakes: [], lessonsDone: 1 };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(BASE + 'index.html'); await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), SAVE);
  await page.goto('about:blank'); await page.goto(BASE + 'index.html'); await page.waitForSelector('.realm-node');
  const cur = () => page.evaluate(() => WR.current());
  const back = async () => { await page.goBack({ waitUntil: 'commit', timeout: 3000 }).catch(() => {}); await page.waitForTimeout(400); };
  // map → realm → lesson
  await page.evaluate(() => WR.go('realm', 'a1')); await page.waitForTimeout(300);
  await page.evaluate(async () => { const b = await WR.bank('a1', 'grammar'); const items = b.filter(q => !q.type || q.type === 'mcq').slice(0, 4).map(q => WR.normalize(q)); WR.startLesson({ realm: 'a1', skill: 'grammar', key: 'grammar', title: 'G', items }); });
  await page.waitForSelector('.opt');
  await page.evaluate(() => { const c = WR._dbg(); [...document.querySelectorAll('.opt')].find(b => b.textContent.replace((b.querySelector('.k') || {}).textContent || '', '').trim() === c).click(); });
  const starsMid = await page.evaluate(() => WR.state.stars);
  await back();
  ok(page.url().startsWith(BASE), 'Back in a lesson stays in the game');
  ok(!!(await page.$('#leaveAsk')) && /stars so far are kept/i.test(await page.innerText('#leaveAsk')), 'Back in a lesson asks "Leave this lesson? Your stars so far are kept"');
  if (process.env.SHOT) { await page.waitForTimeout(400); await page.screenshot({ path: OUT + 'back_leave_lesson.png' }); }
  await page.click('#laStay'); await page.waitForTimeout(200);
  ok(!!(await page.$('#nextBtn')) && !(await page.$('#leaveAsk')), '"Keep playing" returns to the same question');
  await back(); await page.waitForSelector('#leaveAsk');
  await back();
  ok(!(await page.$('#leaveAsk')) && !!(await page.$('#nextBtn')), 'a second Back closes the pop-up (stays in the lesson)');
  await back(); await page.click('#laGo'); await page.waitForTimeout(400);
  ok(await cur() === 'realm' && !!(await page.$('.realm-hero, .skill, .tile')), 'Leave goes to the realm');
  ok(await page.evaluate(() => WR.state.stars) === starsMid, 'the stars earned in the lesson are kept');
  // a pop-up is closed first
  await page.click('#setBtn'); await page.waitForSelector('.modal'); await back();
  ok(!(await page.$('.modal')) && await cur() === 'realm', 'Back closes Settings first');
  // realm → map
  await back();
  ok(await cur() === 'home' && page.url().startsWith(BASE), 'Back from a realm goes to the map');
  // tabs: map → shop → Tower path
  await page.evaluate(() => WR.go('math')); await page.waitForTimeout(300); await page.evaluate(() => WR.go('dojo')); await page.waitForTimeout(300);
  await back(); ok(await cur() === 'math', 'Back from the Times-Table Tower goes to Maths');
  await back(); ok(await cur() === 'home', 'Back from Maths goes to the map');
  // map → leave
  await back();
  ok(!page.url().startsWith(BASE), 'Back on the map leaves the game (' + page.url() + ')');
  // a finished lesson: Back goes straight to the realm, no question
  await page.goto(BASE + 'index.html'); await page.waitForSelector('.realm-node');
  await page.evaluate(() => WR.go('realm', 'a1')); await page.waitForTimeout(300);
  await page.evaluate(async () => { const b = await WR.bank('a1', 'vocab'); const items = b.filter(q => !q.type || q.type === 'mcq').slice(0, 1).map(q => WR.normalize(q)); WR.startLesson({ realm: 'a1', skill: 'vocab', key: 'vocab', title: 'V', items }); });
  await page.waitForSelector('.opt'); await page.click('.opt'); await page.click('#nextBtn'); await page.waitForSelector('.result');
  await back();
  ok(await cur() === 'realm' && !(await page.$('#leaveAsk')), 'Back on a result screen goes to the realm without asking');
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2));
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
