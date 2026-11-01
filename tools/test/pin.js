// 🔢 R4 (REVIEW-2026-11-01): harder grown-up gate + PIN for money. No test hooks without window.__WR_TEST (as on the live
// site); the question is a 3-digit number in words or "the 3rd, 1st and 4th digits of …"; ✓ must be HELD 2 s; the first pass
// offers to set a PIN (Skip allowed); cash then takes only the PIN; an old unsalted PIN still works and is upgraded.
//   node tools/test/pin.js   (SHOT=1 → screenshots/pin_*.png)
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
  const open = async (init, save = SAVE) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
    if (init) await ctx.addInitScript(init);
    const page = await ctx.newPage(); page.errs = []; page.on('pageerror', e => page.errs.push(e.message));
    await page.goto(BASE + 'index.html'); await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), save);
    await page.reload(); await page.waitForSelector('.realm-node'); return page;
  };
  // 1. live-like: no hooks
  const live = await open(null);
  ok(await live.evaluate(() => WR.parentGate._answer === undefined && WR.parentGate._skew === undefined), 'WR.parentGate._answer and _skew are undefined without a test flag (live site)');
  await live.context().close();
  // 2. question format + hold (real 2 s hold, PIN offer on)
  const page = await open(() => { window.__WR_TEST = {}; });
  const qs = await page.evaluate(() => { const out = []; for (let i = 0; i < 40; i++) { const bg = WR.parentGate(() => {}, {}); out.push([bg.querySelector('#pgQ').textContent, WR.parentGate._answer()]); bg.remove(); } return out; });
  ok(qs.every(([q, a]) => (/hundred/.test(q) && /^\d{3}$/.test(a)) || (/digits of \d \d \d \d/.test(q) && /^\d{3}$/.test(a))), 'every question is a 3-digit number in words or a digit-position puzzle');
  ok(qs.every(([q]) => !/times|sum|plus/.test(q)), 'no times-table questions any more');
  const dq = qs.find(([q]) => /digits of/.test(q));
  if (dq) { const [, o, d] = [null, ...dq[0].match(/the (\d)\w\w, (\d)\w\w and (\d)\w\w digits of (\d) (\d) (\d) (\d)/).slice(1, 8).reduce((a, x, i) => { (i < 3 ? a[0] : a[1]).push(+x); return a; }, [[], []])]; ok(o.map(i => d[i - 1]).join('') === dq[1], `digit puzzle answer is right (${dq[0]} → ${dq[1]})`); }
  await page.evaluate(() => WR.openGrownups()); await page.waitForSelector('.pgate');
  const a = await page.evaluate(() => WR.parentGate._answer());
  for (const d of a) await page.click(`.pgate [data-d="${d}"]`);
  ok(/hold/i.test(await page.textContent('#pgHold')), 'the gate says to press and hold ✓');
  if (process.env.SHOT) { await page.waitForTimeout(300); await page.screenshot({ path: OUT + 'pin_01_hold_question.png' }); }
  await page.click('#pgOk'); await page.waitForTimeout(300);
  ok(!!(await page.$('.pgate')) && /holding/i.test(await page.textContent('#pgErr')), 'a quick tap on ✓ does not pass (keep holding)');
  const box = await (await page.$('#pgOk')).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.waitForTimeout(800); await page.mouse.up(); await page.waitForTimeout(200);
  ok(!!(await page.$('.pgate')), 'letting go after 0.8 s does not pass');
  await page.mouse.down(); await page.waitForTimeout(2300); await page.mouse.up(); await page.waitForTimeout(300);
  ok(!(await page.$('.pgate')) && !!(await page.$('#pinSetup')), 'holding ✓ for 2 s passes, and the first pass offers to set a PIN');
  if (process.env.SHOT) { await page.waitForTimeout(300); await page.screenshot({ path: OUT + 'pin_02_setup_offer.png' }); }
  await page.click('#psSkip'); await page.waitForSelector('#guUl');
  ok(true, 'Skip goes on to the Grown-ups settings');
  ok(await page.evaluate(() => WR.state.parent.pinAsked === true && !WR.parentGate.hasPin()), 'the offer is remembered (asked once) and no PIN is set');
  await page.evaluate(() => { document.querySelectorAll('.modal-bg').forEach(m => m.remove()); WR.parentGate.forget(); WR.openGrownups(); }); await page.waitForSelector('.pgate');
  const a2 = await page.evaluate(() => WR.parentGate._answer()); for (const d of a2) await page.click(`.pgate [data-d="${d}"]`);
  await page.focus('#pgOk'); await page.keyboard.down('Enter'); await page.waitForTimeout(2300); await page.keyboard.up('Enter'); await page.waitForTimeout(300);
  ok(!!(await page.$('#guUl')) && !(await page.$('#pinSetup')), 'holding Enter also works, and the PIN offer is not repeated');
  // skipped PIN → cash stays locked
  await page.evaluate(() => { document.querySelectorAll('.modal-bg').forEach(m => m.remove()); window.__buys = []; const p = PaymentHook.purchase.bind(PaymentHook); PaymentHook.purchase = async it => { window.__buys.push(it.id); return p(it); }; WR.go('shop'); });
  await page.click('#grownups'); await page.waitForSelector('.gu-item .cash'); await page.click('.gu-item .cash'); await page.waitForSelector('#pinSetup');
  await page.click('#psSkip'); await page.waitForTimeout(300);
  ok((await page.evaluate(() => window.__buys)).length === 0, 'with no PIN, cash stays locked (Not now buys nothing)');
  ok(page.errs.length === 0, 'no page errors ' + page.errs.slice(0, 2));
  await page.context().close();
  // 3. an old unsalted PIN still works and is upgraded to a salted hash
  const legacy = await open(() => { window.__WR_TEST = { holdMs: 0 }; }, Object.assign({}, SAVE, { parent: { pinHash: '' } }));
  await legacy.evaluate(async () => { const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('wordRealms.parentPin:4321')); WR.state.parent.pinHash = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join(''); WR.save(); WR.openGrownups(); });
  await legacy.waitForSelector('.pgate'); for (const d of '4321') await legacy.click(`.pgate [data-d="${d}"]`); await legacy.waitForSelector('#guUl');
  const up = await legacy.evaluate(() => WR.state.parent);
  ok(!!up.salt && /^[0-9a-f]{64}$/.test(up.pinHash), 'an old unsalted PIN opens the gate and is re-saved with a salt');
  if (process.env.SHOT) { await legacy.evaluate(() => { document.querySelectorAll('.modal-bg').forEach(m => m.remove()); WR.parentGate.forget(); WR.openGrownups(); }); await legacy.waitForTimeout(600); await legacy.screenshot({ path: OUT + 'pin_03_pin_gate.png' }); }
  await legacy.context().close();
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
