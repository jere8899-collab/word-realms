// 📸 R20 wave 3 screenshots: a new C1 Echo Well free-answer prompt and a new B2 Story Quill task with its model answer (3 crowns).
// Run: node tools/test/r20c_shots.js (game served on :18642)
const { chromium } = require('playwright-core');
const { seedSave } = require('./_harness');   // seeds the starting save without the first-visit race
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/'), OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else console.log('ok', m); };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = { v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'b2', stars: 40, totalCorrect: 12, totalAnswered: 14,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 30, happiness: 70, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 2, last: today() }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 12 };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => { window.__WR_TEST = { holdMs: 0, pinOffer: false }; });
  await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await seedSave(page, BASE + 'index.html', SAVE); await page.waitForSelector('.realm-node');
  const clean = async () => { await page.evaluate(() => document.querySelectorAll('.confetti,.toast').forEach(e => e.remove())); await page.waitForTimeout(300); };
  // 🎤 C1 free-answer prompt (wave 3)
  await page.evaluate(async () => { const b = await WR.bank('c1', 'speaking'); WR.startSpeaking('c1', { items: [b.find(x => x.id === 'c1-sp33')] }); });
  await page.waitForSelector('#micBtn'); await page.waitForTimeout(600); await clean();
  const sp = await page.evaluate(() => document.getElementById('main').innerText);
  ok(/longer breaks/.test(sp) && /argue that/.test(sp), 'C1 prompt c1-sp33 on screen with its "Use:" phrases');
  await page.screenshot({ path: OUT + 'r20c_c1_speaking.png' });
  // ✒️ B2 review task: write the model, check it, see 3 crowns and the model answer
  await page.evaluate(() => WR.openQuill('b2', 'b2-w08'));
  await page.waitForSelector('#qPlan, #qText'); if (await page.$('#qSkip')) { await page.click('#qSkip'); await page.waitForSelector('#qText'); }
  const model = await page.evaluate(async () => (await WR.bank('b2', 'writing')).find(p => p.id === 'b2-w08').model);
  await page.fill('#qText', model); await page.waitForTimeout(300);
  await page.click('#qCheck'); await page.waitForSelector('.scales'); await page.waitForTimeout(1200); await clean();
  const r = await page.evaluate(() => WR._quillDbg().result.r);
  ok(r.crowns === 3 && r.flags.length === 0, `B2 review model scores 3 crowns (${r.total}/20)`);
  ok(!!(await page.$('.q-model .model-text')), 'model answer shown after checking');
  await page.screenshot({ path: OUT + 'r20c_b2_writing_model.png', fullPage: true });
  ok(!errs.length, 'no page errors ' + JSON.stringify(errs));
  await browser.close(); console.log(fails ? `${fails} failed` : 'all passed');
})().catch(e => { console.error('FAIL crashed', e); process.exit(1); });
