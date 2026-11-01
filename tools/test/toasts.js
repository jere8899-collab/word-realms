// 🍞 R7 (REVIEW-2026-11-01): pop-ups never cover an answer, the question or a name. While a question is on screen,
// celebrations (stickers, quests, gifts) wait for the result screen; urgent hints ({ now: true }) still show; in landscape
// pop-ups sit at the top; the welcome after onboarding is the pet's speech line, not a pop-up.   node tools/test/toasts.js
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
const overlap = (page, sel) => page.evaluate(sel => { const ts = [...document.querySelectorAll('.toast')].map(t => t.getBoundingClientRect());
  return [...document.querySelectorAll(sel)].filter(e => { const rg = document.createRange(); rg.selectNodeContents(e); const r = /^H\d$/.test(e.tagName) ? rg.getBoundingClientRect() : e.getBoundingClientRect();   // a heading: its text, not its full-width box
    return ts.some(t => t.left < r.right && t.right > r.left && t.top < r.bottom && t.bottom > r.top); }).map(e => e.textContent.trim().slice(0, 20)); }, sel);
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const vp of [{ width: 375, height: 667 }, { width: 844, height: 390 }, { width: 360, height: 780 }]) {
    const tag = vp.width + 'x' + vp.height;
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto(BASE + 'index.html'); await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), SAVE);
    await page.reload(); await page.waitForSelector('.realm-node');
    // timed B2 boss: a sticker pop-up fired mid-question waits
    await page.evaluate(async () => { const b = await WR.bank('b2', 'grammar'); const items = b.filter(q => !q.type || q.type === 'mcq').slice(0, 2).map(q => WR.normalize(q)); WR.startLesson({ realm: 'b2', skill: 'grammar', key: 'grammar', title: 'Boss', items, mode: 'boss' }); });
    await page.waitForSelector('.opt');
    await page.evaluate(() => WR.toast('🏷️ 2 new stickers for your Sticker Book! +4⭐', 2400));
    await page.waitForTimeout(150);
    ok(!(await page.$('.toast')), `${tag} boss: a sticker pop-up waits while the question is on screen`);
    await page.evaluate(() => WR.toast('Type your answer first ✏️', 1800, { now: true })); await page.waitForTimeout(100);
    ok(!!(await page.$('.toast')), `${tag} boss: an urgent hint still shows`);
    ok((await overlap(page, '.opt, .qtext, .q')).length === 0, `${tag} boss: the hint covers no answer or question (${await overlap(page, '.opt, .qtext, .q')})`);
    await page.evaluate(() => document.querySelectorAll('.toast').forEach(t => t.remove()));
    for (let i = 0; i < 2; i++) { await page.click('.opt'); await page.waitForSelector('#nextBtn'); await page.click('#nextBtn'); await page.waitForTimeout(250); }
    await page.waitForSelector('.result'); await page.waitForTimeout(300);
    ok(await page.evaluate(() => [...document.querySelectorAll('.toast')].some(t => /new stickers/.test(t.textContent))), `${tag}: the held sticker pop-up shows on the result screen`);
    if (tag === '375x667' && process.env.SHOT) await page.screenshot({ path: OUT + 'toasts_result.png' });
    // home in landscape: a pop-up does not cover the greeting or the first realm card
    await page.evaluate(() => { WR.go('home'); WR.toast('🐰 Puffbun is so happy to see you! Let\'s learn ✨', 2500); }); await page.waitForTimeout(200);
    const cov = await overlap(page, 'h1, .realm-node:first-of-type, #main .btn.mint');
    ok(vp.width < 800 || cov.length === 0, `${tag} home: the pop-up covers no greeting or realm card (${cov})`);
    if (tag === '844x390' && process.env.SHOT) await page.screenshot({ path: OUT + 'toasts_landscape_home.png' });
    ok(errs.length === 0, `${tag}: no page errors ${errs.slice(0, 2)}`);
    await ctx.close();
  }
  // onboarding: the welcome is the pet's line, not a pop-up over the name
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
  await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
  const p = await ctx.newPage(); await p.goto(BASE + 'index.html'); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.waitForSelector('#nm'); await p.fill('#nm', 'Mia'); await p.click('#n1'); await p.click('#n2'); await p.waitForSelector('#go'); await p.click('#go');
  await p.waitForSelector('.realm-node'); await p.waitForTimeout(150);
  ok(!(await p.$('.toast')), 'after onboarding no welcome pop-up covers "Hello, Mia!"');
  ok(/happy to meet you, Mia/.test(await p.innerText('#main')), 'the pet says the welcome on the map instead');
  await p.evaluate(() => { WR.go('pet'); WR.go('home'); });
  ok(!/happy to meet you/.test(await p.innerText('#main')), 'the welcome line is said once');
  await ctx.close();
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
