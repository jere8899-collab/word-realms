// 🤖 R18 (REVIEW-2026-11-01): a plain Playwright run (no flags) sees the same game as Chrome on a phone: every question
// type in the lesson pool and the service worker; classic-only mode is opt-in (window.__WR_CLASSIC_ONLY).   node tools/test/sametypes.js
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = { v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'c2', stars: 40, totalCorrect: 2, totalAnswered: 3,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 30, happiness: 70, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 1, last: today() }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 0 };
const types = async (page, rounds) => page.evaluate(async rounds => { const seen = new Set();
  for (let i = 0; i < rounds; i++) for (const sk of ['grammar', 'vocab']) for (const lv of ['b2', 'c1', 'c2']) (await WR.buildItems(lv, sk, 10)).forEach(q => seen.add(q.type)); return [...seen]; }, rounds);
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });
  await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
  await ctx.addInitScript(s => { if (!localStorage.getItem('wordRealms.save.v1')) localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE);
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(BASE + 'index.html'); await page.waitForSelector('.realm-node');
  ok(await page.evaluate(() => navigator.webdriver === true), 'this is an automated browser (navigator.webdriver)');
  const t = await types(page, 4);
  ok(t.some(x => x !== 'mcq' && x !== 'listen' && x !== 'picq'), `the lesson pool has the new question types too (${t.join(', ')})`);
  ok(await page.evaluate(() => navigator.serviceWorker.ready.then(r => !!r.active)), 'the service worker registers and activates');
  await page.reload(); await page.waitForSelector('.realm-node');
  ok(await page.evaluate(() => !!navigator.serviceWorker.controller), 'and controls the page after a reload');
  // classic-only is opt-in
  const p2 = await ctx.newPage(); await p2.addInitScript(() => { window.__WR_CLASSIC_ONLY = true; }); await p2.goto(BASE + 'index.html'); await p2.waitForSelector('.realm-node');
  const t2 = await types(p2, 2);
  ok(t2.every(x => ['mcq', 'listen', 'order'].includes(x)), `window.__WR_CLASSIC_ONLY = true keeps a test to the classic types (${t2.join(', ')})`);
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2));
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
