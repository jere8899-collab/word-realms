// 🔐 N8 (REVIEW-2026-11-02): the first visit to 👪 Grown-ups (no PIN yet) starts with a friendly "Set a PIN" card;
// Set a PIN → grown-up check → choose the PIN → Grown-ups; after that every gate asks for the PIN. "Not now" → the usual
// check, and the card is not shown again.   node tools/test/n8pin.js
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0, passes = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const SAVE = { v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'a1', stars: 60, pet: { species: 'pet_bunny', name: 'Puffbun', xp: 20, happiness: 80, hunger: 30, lastTick: Date.now() },
  progress: {}, owned: [], equipped: {}, settings: { rate: .9, sound: false, unlockAll: false }, mistakes: [], lessonsDone: 1 };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const open = async () => { const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
    await ctx.addInitScript(s => { window.__WR_TEST = { holdMs: 0 }; window.__WR_NO_SW = true; if (!localStorage.getItem('wordRealms.save.v1')) localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE);
    const page = await ctx.newPage(); page.errs = []; page.on('pageerror', e => page.errs.push(e.message)); await page.goto(BASE); await page.waitForSelector('.realm-node'); return page; };
  const answer = async page => { const a = await page.evaluate(() => WR.parentGate._answer()); for (const d of a) await page.click(`.pgate [data-d="${d}"]`); await page.click('#pgOk'); await page.waitForTimeout(250); };
  // the real way in: ⚙️ Settings → 👪 Grown-ups
  let page = await open();
  await page.click('#setBtn'); await page.click('#guBtn'); await page.waitForSelector('#pinIntro');
  ok(/Set a PIN so only grown-ups can open this/.test(await page.textContent('#pinIntro')) && !(await page.$('.pgate')), 'first visit: the friendly "Set a PIN" card comes first (before any question)');
  await page.waitForTimeout(700); await page.screenshot({ path: OUT + 'n8_pin_card.png' });
  await page.click('#piSet'); await page.waitForSelector('.pgate');
  ok(!/PIN/.test(await page.textContent('#pgQ')), '"Set a PIN" → first the grown-up check (a question)');
  await answer(page); await page.waitForSelector('#pinSetup');
  await page.fill('#psPin', '4826'); await page.fill('#psPin2', '4826'); await page.click('#psSet'); await page.waitForSelector('#guUl');
  ok(await page.evaluate(() => WR.parentGate.hasPin()), 'the PIN is saved and Grown-ups opens');
  await page.evaluate(() => { document.querySelectorAll('.modal-bg').forEach(m => m.remove()); WR.parentGate.forget(); WR.openGrownups(); }); await page.waitForSelector('.pgate');
  ok(/PIN/.test(await page.textContent('#pgQ')) && !(await page.$('#pinIntro')), 'next visit: the gate asks for the PIN, no card');
  for (const d of '4826') await page.click(`.pgate [data-d="${d}"]`); await page.waitForSelector('#guUl');
  ok(true, 'the PIN opens Grown-ups');
  // Report and Reset (the other gated places) use the PIN too
  await page.evaluate(() => { document.querySelectorAll('.modal-bg').forEach(m => m.remove()); WR.parentGate.forget(); WR.parentGate(() => {}, { why: 'Report' }); });
  ok(/PIN/.test(await page.textContent('#pgQ')), 'every other gate (Report, Teacher mode, Reset) asks for the PIN');
  ok(!page.errs.length, 'no page errors ' + page.errs.join(' | '));
  await page.context().close();
  // "Not now": the usual check, and the card only once
  page = await open();
  await page.evaluate(() => WR.openGrownups()); await page.waitForSelector('#pinIntro');
  await page.click('#piLater'); await page.waitForSelector('.pgate'); await answer(page); await page.waitForSelector('#guUl');
  ok(!(await page.$('#pinSetup')), '"Not now" → the usual check → Grown-ups (no second PIN offer)');
  await page.evaluate(() => { document.querySelectorAll('.modal-bg').forEach(m => m.remove()); WR.parentGate.forget(); WR.openGrownups(); }); await page.waitForSelector('.pgate');
  ok(!(await page.$('#pinIntro')), 'the card is shown only on the first visit');
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).parent.pinAsked === true), 'remembered in the save (syncs with the Cloud Castle)');
  ok(!page.errs.length, 'no page errors ' + page.errs.join(' | '));
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
