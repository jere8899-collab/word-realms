// 🔒 R3 (REVIEW-2026-11-01): the parent-gate lock-out survives a reload (it lives in the save, state.parent.lock), each
// lock-out is longer (1 min → 5 min → 15 min), the time left is shown, and a grown-up's pass clears the count.
//   node tools/test/gatelock.js   (SHOT=1 → screenshots/gatelock_*.png)
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = { v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'a1', stars: 60, totalCorrect: 1, totalAnswered: 1,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 20, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 1, last: today() }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: false }, mistakes: [], lessonsDone: 1 };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
  await ctx.addInitScript(() => { window.__WR_TEST = { holdMs: 0, pinOffer: false }; });   // R4: gate test hooks (never on the live site)
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(BASE + 'index.html'); await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), SAVE);
  await page.reload(); await page.waitForSelector('.realm-node');
  const openGate = async () => { await page.evaluate(() => { document.querySelectorAll('.modal-bg').forEach(m => m.remove()); WR.parentGate(() => { window.__passed = (window.__passed || 0) + 1; }, { why: 'test' }); }); await page.waitForSelector('.pgate'); };
  const typeWrong = async n => { for (let i = 0; i < n; i++) { const a = await page.evaluate(() => WR.parentGate._answer()); for (const d of String((+a + 1) % 1000)) await page.click(`.pgate [data-d="${d}"]`); await page.click('#pgOk'); await page.waitForTimeout(120); } };
  const lockText = () => page.evaluate(() => { const g = document.querySelector('.pgate'); return g && g.classList.contains('locked') ? document.getElementById('pgErr').textContent : ''; });
  await openGate(); await typeWrong(2);
  // a reload in the middle keeps the wrong count
  await page.reload(); await page.waitForSelector('.realm-node');
  ok(await page.evaluate(() => WR.state.parent.lock.wrong) === 2, 'the wrong-try count survives a reload');
  await openGate(); await typeWrong(1);
  let t = await lockText(); ok(/wait/i.test(t), 'the third wrong try (after a reload) locks the gate: ' + t);
  ok(/5\d s|60 s|1 min/.test(t), 'the first lock-out is about 1 minute');
  // reload → still locked with the time left
  await page.reload(); await page.waitForSelector('.realm-node'); await openGate(); await page.waitForTimeout(300);
  t = await lockText(); ok(/wait/i.test(t), 'after a reload the gate still shows the lock: ' + t);
  if (process.env.SHOT) await page.screenshot({ path: OUT + 'gatelock_after_reload.png' });
  // the right answer does nothing while locked
  await page.evaluate(() => { [...WR.parentGate._answer() || ''].forEach(d => document.querySelector(`.pgate [data-d="${d}"]`).click()); document.getElementById('pgOk').click(); });
  ok(!(await page.evaluate(() => window.__passed)), 'the gate does not open while locked');
  // second lock-out is 5 minutes, third 15
  await page.evaluate(() => { WR.parentGate._skew += 61e3; }); await page.waitForTimeout(700);
  ok(!(await lockText()), 'the first lock lifts after a minute');
  await typeWrong(3); t = await lockText();
  ok(/[45] min/.test(t), 'the second lock-out is 5 minutes: ' + t);
  await page.reload(); await page.waitForSelector('.realm-node'); await openGate(); await page.waitForTimeout(300);
  ok(/[4-6] min/.test(await lockText()), 'the 5-minute lock survives a reload too');
  await page.evaluate(() => { WR.parentGate._skew += 7 * 61e3;   /* the skew reset on reload */ }); await page.waitForTimeout(700);
  await typeWrong(3); t = await lockText(); ok(/1[45] min/.test(t), 'the third lock-out is 15 minutes: ' + t);
  // a pass clears the count
  await page.evaluate(() => { WR.parentGate._skew += 15 * 61e3; }); await page.waitForTimeout(700);
  const a = await page.evaluate(() => WR.parentGate._answer()); for (const d of a) await page.click(`.pgate [data-d="${d}"]`); await page.click('#pgOk'); await page.waitForTimeout(200);
  const lk = await page.evaluate(() => ({ p: window.__passed, l: WR.state.parent.lock, saved: JSON.parse(localStorage.getItem('wordRealms.save.v1')).parent.lock }));
  ok(lk.p === 1 && lk.l.n === 0 && lk.l.wrong === 0 && lk.saved.n === 0, 'a grown-up pass clears the lock-out count (saved)');
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2));
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
