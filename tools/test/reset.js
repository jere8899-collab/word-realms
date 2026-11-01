// 🧹 R2 (REVIEW-2026-11-01): Reset is only behind the grown-up gate, needs RESET typed, keeps a 7-day backup with a working
// Undo, resets this device only (a logged-in device is logged out first, so the cloud copy is never overwritten), and a reset
// never marks the cloud save dirty.   node tools/test/reset.js   (SHOT=1 → screenshots/reset_*.png)
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = { v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'a1', stars: 345, totalCorrect: 50, totalAnswered: 60,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 300, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 4, last: today() }, progress: { a1: { grammar: { best: 0.9, plays: 2 } } }, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: false }, mistakes: [], lessonsDone: 7 };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
  await ctx.addInitScript(() => { window.__WR_TEST = { holdMs: 0, pinOffer: false }; });   // R4: gate test hooks (never on the live site)
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('dialog', d => { errs.push('native dialog: ' + d.message()); d.dismiss(); });
  await page.goto(BASE + 'index.html'); await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), SAVE);
  await page.reload(); await page.waitForSelector('.realm-node');
  const passGate = async () => { await page.waitForSelector('.pgate'); const a = await page.evaluate(() => WR.parentGate._answer()); for (const d of a) await page.click(`.pgate [data-d="${d}"]`); await page.click('#pgOk'); await page.waitForTimeout(200); };
  // 1. no Reset in the child's Settings
  await page.click('#setBtn'); await page.waitForSelector('.modal');
  const st = await page.evaluate(() => document.querySelector('.modal').innerText);
  ok(!/reset/i.test(st) && !(await page.$('#rst')), 'Settings has no Reset button for children');
  // 2. Grown-ups (gated) has it
  await page.click('#guBtn'); await passGate();
  ok(!!(await page.$('#guReset')), 'Reset lives in 👪 Grown-ups behind the gate');
  ok(!(await page.$('#guUndo')), 'no Undo before any reset');
  await page.click('#guReset'); await page.waitForSelector('#resetDlg');
  ok(await page.$eval('#rsGo', b => b.disabled), 'the Reset button stays off until RESET is typed');
  await page.fill('#rsIn', 'reser'); ok(await page.$eval('#rsGo', b => b.disabled), 'a typo keeps it off');
  await page.fill('#rsIn', 'reset');
  ok(!(await page.$eval('#rsGo', b => b.disabled)), 'typing reset (any case) turns it on');
  ok(!/Cloud Castle copy/.test(await page.innerText('#resetDlg')), 'a guest sees no cloud warning');
  if (process.env.SHOT) await page.waitForTimeout(700), await page.screenshot({ path: OUT + 'reset_dialog.png' });
  const before = await page.evaluate(() => ({ s: WR.state.stars, xp: WR.state.pet.xp }));
  await page.click('#rsGo'); await page.waitForTimeout(800);
  const after = await page.evaluate(() => ({ s: WR.state.stars, pet: !!WR.state.pet, b: WR.backups(), onb: !!document.querySelector('#nm') }));
  ok(after.s !== before.s && !after.pet && after.onb, 'reset clears this device and shows onboarding');
  ok(after.b.length === 1 && after.b[0].includes(today()), 'a dated backup is kept: ' + after.b[0]);
  const bk = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), after.b[0]);
  ok(bk.stars === before.s && bk.pet.xp === before.xp && bk.name === 'Mia', 'the backup holds the old adventure');
  // backups older than 7 days are dropped
  await page.evaluate(() => { localStorage.setItem('wordRealms.save.backup.2020-01-01.1', '{"v":1}'); WR.backupSave(); });
  ok(!(await page.evaluate(() => localStorage.getItem('wordRealms.save.backup.2020-01-01.1'))), 'backups older than 7 days are removed');
  // 3. Undo
  await page.evaluate(() => WR.openGrownups()); await page.waitForTimeout(300);
  if (await page.$('.pgate')) await passGate();
  ok(!!(await page.$('#guUndo')), 'Grown-ups now offers ↩️ Undo reset');
  await page.click('#guUndo'); await page.waitForTimeout(800);
  await page.waitForSelector('.realm-node');
  const und = await page.evaluate(() => ({ s: WR.state.stars, xp: WR.state.pet && WR.state.pet.xp, name: WR.state.name, saved: JSON.parse(localStorage.getItem('wordRealms.save.v1')).stars }));
  ok(und.s === before.s && und.xp === before.xp && und.name === 'Mia' && und.saved === before.s, 'Undo brings the whole adventure back and saves it');
  await page.reload(); await page.waitForSelector('.realm-node');
  ok(await page.evaluate(() => WR.state.stars) === before.s, 'the undone adventure survives a reload');
  // 4. a logged-in device: warning, logs out first (no cloud overwrite), and WR.reset never marks the cloud save dirty
  const cloud = await page.evaluate(async () => {
    const C = WR.Cloud; localStorage.setItem('wordRealms.cloud.v1', JSON.stringify({ dirty: false, username: 'mia' }));
    C.user = { id: 'u1' }; C.username = 'mia'; const pushes = []; C.push = async () => pushes.push(1); C.schedule = () => pushes.push('s');
    WR.reset(); const dirty = JSON.parse(localStorage.getItem('wordRealms.cloud.v1')).dirty;
    return { dirty, pushes: pushes.length };
  });
  ok(cloud.dirty === false && cloud.pushes === 0, 'WR.reset() never marks the cloud copy dirty or pushes it');
  await page.evaluate(s => { localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); WR.state = WR.load(); }, SAVE);
  await page.evaluate(() => { window.__out = []; WR.Cloud.signOut = async clear => { window.__out.push(clear); WR.Cloud.user = null; localStorage.removeItem('wordRealms.save.v1'); WR.state = WR.load(); }; WR.resetDialog(); });
  await page.waitForSelector('#resetDlg');
  const txt = await page.innerText('#resetDlg');
  await page.waitForTimeout(500);
  const hit = await page.evaluate(() => [...document.querySelectorAll('#rsIn,#rsNo')].map(e => { e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(), h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h === e || e.contains(h); }));
  ok(hit.every(Boolean), 'the cloud reset dialog is on top and tappable ' + hit);
  ok(/logs this device out first/.test(txt) && /not\s+changed/.test(txt) && /mia/.test(txt), 'a logged-in device is told the Cloud Castle copy is not changed');
  if (process.env.SHOT) await page.waitForTimeout(700), await page.screenshot({ path: OUT + 'reset_dialog_cloud.png' });
  await page.fill('#rsIn', 'RESET'); await page.click('#rsGo'); await page.waitForTimeout(600);
  ok((await page.evaluate(() => window.__out)).join() === 'true', 'the logged-in reset logs out (clearing only this device) instead of pushing an empty save');
  ok(errs.length === 0, 'no page errors or native confirm() pop-ups ' + errs.slice(0, 2));
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
