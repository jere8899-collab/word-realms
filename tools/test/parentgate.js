// 👪 Parent gate (REVIEW T19): a cash button opens the gate; 3 wrong answers lock it for 60 s; the right answer reaches the
// PaymentHook stub; the pass lasts 5 minutes (clock moved with WR.parentGate._skew); the optional PIN works and is saved hashed;
// Teacher mode and Cloud Castle "Log out & clear device" are gated; children see no prices; the gate fits 375×667 and 320×658
// with the number pad visible; no console errors.   node tools/test/parentgate.js   (SHOT=1 saves screenshots/parentgate_*.png)
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const save = () => ({ v: 1, name: 'Jeremy', avatar: 'avatar_girl', startLevel: 'a1', stars: 60, totalCorrect: 10, totalAnswered: 12,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 20, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 1, last: today() }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: false }, mistakes: [], lessonsDone: 1 });
const MOB = { deviceScaleFactor: 2, isMobile: true, hasTouch: true };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const vp of [{ width: 375, height: 667 }, { width: 320, height: 658 }]) {
    const tag = vp.width + 'x' + vp.height;
    const ctx = await browser.newContext({ ...MOB, viewport: vp });
    await ctx.addInitScript(() => { window.__WR_TEST = { holdMs: 0, pinOffer: false }; });   // R4: gate test hooks (never on the live site)
    await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
    const page = await ctx.newPage(); const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_FAILED|cloud library|supabase/i.test(m.text())) errs.push(m.text()); });
    await page.goto(BASE + 'index.html'); await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), save());
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForSelector('.realm-node');
    // spy on the payment stub
    await page.evaluate(() => { window.__buys = []; const p = PaymentHook.purchase.bind(PaymentHook); PaymentHook.purchase = async it => { window.__buys.push(it.id); return p(it); }; });
    const type = async s => { for (const d of s) await page.click(`.pgate [data-d="${d}"]`); };
    const gateFits = async label => {
      const r = await page.evaluate(() => [...document.querySelectorAll('.pgate .pad button, #pgOk, #pgClose')].every(b => { const q = b.getBoundingClientRect(); return q.top >= 0 && q.bottom <= innerHeight && q.left >= 0 && q.right <= innerWidth; }));
      ok(r, `${tag} ${label}: gate and its number pad fit on screen without scrolling`);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth); ok(sw <= vp.width, `${tag} ${label}: no sideways overflow (${sw})`);
    };
    /* shop: no prices for children; Ask a grown-up opens the gate */
    await page.evaluate(() => WR.go('shop')); await page.waitForSelector('.item');
    const txt = await page.evaluate(() => document.getElementById('main').innerText);
    ok(!/\$|💳|cash|payment|card/i.test(txt), `${tag} shop: no price / payment words in front of the gate`);
    ok(await page.$$eval('.askgu', b => b.length) > 0 && !(await page.$('#main .cash')), `${tag} shop: premium items say "Ask a grown-up 💖", no cash buttons`);
    await page.click('.askgu'); await page.waitForSelector('.pgate');
    ok(!(await page.$('.gu-item')), `${tag}: nothing premium is shown before the gate is passed`);
    await gateFits('question gate'); if (process.env.SHOT && vp.width === 375) await page.screenshot({ path: OUT + 'parentgate_01_question.png' });
    /* 3 wrong answers → 60 s lock */
    for (let i = 0; i < 3; i++) { const a = await page.evaluate(() => WR.parentGate._answer()); await type(String((+a + 1) % 1000)); await page.click('#pgOk'); await page.waitForTimeout(120); }
    const locked = await page.evaluate(() => document.querySelector('.pgate').classList.contains('locked') && /wait/i.test(document.getElementById('pgErr').textContent));
    ok(locked, `${tag}: three wrong answers lock the gate`);
    await page.evaluate(() => { [...WR.parentGate._answer()].forEach(d => document.querySelector(`.pgate [data-d="${d}"]`).click()); document.getElementById('pgOk').click(); }); await page.waitForTimeout(150);
    ok(!!await page.$('.pgate') && !(await page.$('.gu-item')), `${tag}: the right answer does nothing while locked`);
    if (process.env.SHOT && vp.width === 375) await page.screenshot({ path: OUT + 'parentgate_02_locked.png' });
    await page.evaluate(() => { WR.parentGate._skew += 61000; }); await page.waitForTimeout(700);
    ok(await page.evaluate(() => !document.querySelector('.pgate').classList.contains('locked')), `${tag}: the lock lifts after 60 s`);
    /* right answer → grown-ups list with prices → stub */
    const a2 = await page.evaluate(() => WR.parentGate._answer()); await type(a2); await page.click('#pgOk');
    await page.waitForSelector('.gu-item .cash');
    ok(await page.evaluate(() => /\$|S\$|\d/.test(document.querySelector('.gu-item .cash').textContent)), `${tag}: prices appear only behind the gate`);
    if (process.env.SHOT && vp.width === 375) await page.screenshot({ path: OUT + 'parentgate_03_grownups.png' });
    /* R4: no PIN yet → a cash button asks the grown-up to set one first; then cash takes ONLY the PIN, every time */
    await page.click('.gu-item .cash'); await page.waitForSelector('#pinSetup');
    ok((await page.evaluate(() => window.__buys)).length === 0, `${tag}: with no PIN, a cash button asks for a PIN to be set first (nothing reaches the stub)`);
    if (process.env.SHOT && vp.width === 375) { await page.waitForTimeout(400); await page.screenshot({ path: OUT + 'parentgate_05_pin_setup.png' }); }
    await page.fill('#psPin', '1357'); await page.fill('#psPin2', '1375'); await page.click('#psSet');
    ok(/match/.test(await page.textContent('#psErr')), `${tag}: two different PINs are refused`);
    await page.fill('#psPin2', '1357'); await page.click('#psSet'); await page.waitForSelector('#demo');
    ok((await page.evaluate(() => window.__buys)).length === 1, `${tag}: after the PIN is set the cash button reaches the PaymentHook stub`);
    await page.click('#demo'); await page.waitForTimeout(250);
    ok(await page.evaluate(() => WR.state.owned.length === 1), `${tag}: demo unlock works from the PIN-checked checkout`);
    await page.click('#grownups'); await page.waitForSelector('.gu-item .cash');
    await page.click('.gu-item .cash'); await page.waitForSelector('.pgate');
    ok(await page.evaluate(() => /PIN/.test(document.getElementById('pgQ').textContent)), `${tag}: a cash button asks for the PIN even inside the 5-minute pass`);
    await type('9999'); await page.waitForTimeout(300);
    ok((await page.evaluate(() => window.__buys)).length === 1 && !!(await page.$('.pgate')), `${tag}: a wrong PIN buys nothing`);
    await type('1357'); await page.waitForSelector('#demo');
    ok((await page.evaluate(() => window.__buys)).length === 2, `${tag}: the right PIN reaches the stub`);
    await page.click('#cl'); await page.waitForTimeout(150);
    /* 5 minutes later the gate asks again */
    await page.evaluate(() => { WR.parentGate._skew += 5 * 60 * 1000 + 1000; });
    await page.click('#grownups'); await page.waitForTimeout(200);
    ok(!!await page.$('.pgate'), `${tag}: after 5 minutes the gate asks again`);
    await page.click('#pgClose'); await page.waitForTimeout(150);
    ok(!await page.$('.pgate') && !await page.$('.gu-item'), `${tag}: "Not now" closes the gate without opening anything`);
    /* teacher mode is behind the gate (Settings → 👪 Grown-ups) */
    ok(!(await page.evaluate(() => { WR.go('home'); document.getElementById('setBtn').click(); return !!document.getElementById('ul'); })), `${tag}: Teacher mode is no longer a plain switch in Settings`);
    await page.click('#guBtn'); await page.waitForSelector('.pgate');
    { const a = await page.evaluate(() => WR.parentGate._answer()); await type(a || '1357'); if (a) await page.click('#pgOk'); } await page.waitForSelector('#guUl');   // the PIN set above now answers every gate
    await page.click('#guUl'); ok(await page.evaluate(() => WR.state.settings.unlockAll === true), `${tag}: Teacher mode switches on after the gate`);
    /* PIN: set, then the gate asks for the PIN; wrong PIN refused; right PIN passes; saved hashed */
    await page.fill('#guPin', '2468'); await page.click('#guPinSet'); await page.waitForSelector('#guPinOff');
    const ph = await page.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).parent);
    ok(ph && /^[0-9a-f]{64}$/.test(ph.pinHash) && /^[0-9a-f]{24}$/.test(ph.salt) && !JSON.stringify(ph).includes('2468'), `${tag}: PIN saved as a salted SHA-256 hash in the save (synced with cloud saves)`);
    await page.click('#guDone'); await page.evaluate(() => { WR.parentGate.forget(); WR.go('shop'); });
    await page.click('#grownups'); await page.waitForSelector('.pgate');
    ok(await page.evaluate(() => /PIN/.test(document.getElementById('pgQ').textContent) && WR.parentGate._answer() === null), `${tag}: with a PIN set, the gate asks for the PIN`);
    await gateFits('PIN gate'); if (process.env.SHOT && vp.width === 375) await page.screenshot({ path: OUT + 'parentgate_04_pin.png' });
    await type('1111'); await page.waitForTimeout(300);
    ok(!!await page.$('.pgate') && /Not quite/.test(await page.textContent('#pgErr')), `${tag}: a wrong PIN is refused`);
    await type('2468'); await page.waitForSelector('.gu-item'); ok(true, `${tag}: the right PIN opens the Grown-ups area`);
    await page.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove()));
    /* clear device is gated */
    await page.evaluate(() => { WR.parentGate.forget(); WR.Cloud && WR.Cloud.open(); }); await page.waitForTimeout(400);
    const gatedClear = await page.evaluate(() => { const b = document.getElementById('ccOutClear'); if (!b) return 'n/a (guest)'; b.click(); return !!document.querySelector('.pgate'); });
    if (gatedClear === 'n/a (guest)') {
      // guest mode has no clear button; check the wiring in the source instead
      const src = await page.evaluate(() => fetch('js/cloud.js').then(r => r.text()));
      ok(/ccOutClear"\)\.onclick = \(\) => WR\.parentGate/.test(src), `${tag}: "Log out & clear device" goes through WR.parentGate`);
    } else ok(gatedClear, `${tag}: "Log out & clear device" opens the gate`);
    ok(errs.length === 0, `${tag}: no console errors ${errs.join(' | ')}`);
    await ctx.close();
  }
  await browser.close();
  console.log(`\nparent gate: ${passes} passed, ${fails} failed`);
})();
