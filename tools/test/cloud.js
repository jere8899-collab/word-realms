// ☁️ Cloud Castle: guest mode with the CDN blocked, the account UI, username validation, and a live
// sign-up → save → wipe → log-in round trip against the real Supabase project (skipped if unreachable).
// BASE=https://jere8899-collab.github.io/word-realms/ node tools/test/cloud.js  runs it against the live site.
const { chromium } = require('playwright-core');
const OUT = '/workspace/cefr-quest/screenshots/';
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const URL = BASE + 'index.html';
const SHOTS = !process.env.BASE;
const ok = (c, m) => { if (!c) { console.error('FAIL', m); process.exitCode = 1; } else console.log('ok', m); };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const save = (stars = 60, name = 'Jeremy', extra = {}) => Object.assign({ v: 1, name, avatar: 'avatar_girl', startLevel: 'a1', stars, totalCorrect: stars, totalAnswered: stars + 5,
  pet: { species: 'pet_fox', name: 'Mochi', xp: stars * 2, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 2, last: today() }, progress: { a1: { grammar: { best: 0.9, plays: 1 } } },
  stickers: { got: { a1: ['first', 'grammar', 'crown3'] }, full: [] }, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: false }, mistakes: [], lessonsDone: Math.round(stars / 10) }, extra);
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
async function device(browser, opts = {}) {
  const ctx = await browser.newContext(opts.phone ? PHONE : { viewport: { width: 1100, height: 820 } });
  const page = await ctx.newPage(); page.errors = [];
  page.on('pageerror', e => page.errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) page.errors.push(m.text()); });
  if (opts.blockCdn) await ctx.route(/cdn\.jsdelivr\.net/, r => r.abort());
  if (opts.blockSupabase) await ctx.route(/supabase\.co/, r => r.abort());
  await page.goto(URL);
  if (opts.seed) { await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), opts.seed); }
  await page.reload({ waitUntil: 'networkidle' });
  return { ctx, page };
}
const stars = p => p.evaluate(() => WR.state.stars);
const status = p => p.evaluate(() => WR.Cloud.status);
async function openPanel(page, tab) {
  await page.click('#cloudChip'); await page.waitForSelector('#cloudPanel');
  if (tab) { await page.click(`.cc-tabs [data-m="${tab}"]`); }
}
async function submit(page, name, pass) {
  await page.fill('#ccName', name); await page.fill('#ccPass', pass); await page.click('#ccGo');
}
const waitStatus = (page, st, t = 15000) => page.waitForFunction(s => WR.Cloud && WR.Cloud.status === s, st, { timeout: t });

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });

  /* 1. guest mode with the CDN blocked: the game still works */
  {
    const { ctx, page } = await device(browser, { blockCdn: true, seed: save(40), phone: true });
    await page.waitForSelector('.realm-node');
    ok(await page.$('#cloudChip') !== null, 'cloud chip in the top bar');
    ok(await status(page) === 'guest', 'guest status without a session');
    ok(await page.evaluate(() => !window.supabase), 'supabase library not downloaded for guests');
    await page.click('.realm-node[data-r="a1"]'); await page.click('[data-k="vocab"]');
    await page.waitForSelector('.opt', { timeout: 8000 }); ok(true, 'a lesson starts with the CDN blocked');
    await page.click('.opt'); await page.waitForSelector('#nextBtn');
    const n = await page.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).totalAnswered);
    ok(n > 45, 'answering still saves locally (' + n + ')');
    await page.evaluate(() => WR.go('home')); await page.waitForSelector('.realm-node');
    await openPanel(page, 'signup');
    await page.waitForFunction(() => /can't be reached/.test(document.querySelector('#ccErr').textContent), null, { timeout: 12000 });
    ok(true, 'panel says the castle is unreachable');
    await submit(page, 'offline_kid', 'secret1');
    await page.waitForFunction(() => /can't be reached/.test(document.querySelector('#ccErr').textContent) && !document.querySelector('#ccGo').disabled, null, { timeout: 15000 });
    ok(true, 'sign-up offline shows a friendly error and re-enables the button');
    ok(page.errors.length === 0, 'no page errors in guest/offline mode ' + JSON.stringify(page.errors));
    await ctx.close();
  }

  /* 2. username / password validation (pure + UI) */
  {
    const { ctx, page } = await device(browser, { seed: save(40), phone: true });
    const v = await page.evaluate(() => ['ab', 'abc', 'Lily_Star', 'lily star', 'a'.repeat(20), 'a'.repeat(21), 'ünï', 'x-y', '_1_'].map(n => [n, WR.Cloud.validName(n), WR.Cloud.nameError(n)]));
    const exp = [false, true, true, false, true, false, false, false, true];
    ok(v.every((r, i) => r[1] === exp[i] && (!!r[2]) === !exp[i]), 'name rules: 3–20 of a–z 0–9 _ ' + JSON.stringify(v.map(r => r[1])));
    ok(await page.evaluate(() => !!WR.Cloud.passError('12345') && !WR.Cloud.passError('123456')), 'password needs 6+ characters');
    ok(await page.evaluate(() => WR.Cloud.email('Lily_Star') === 'lily_star@players.wordrealms.app'), 'name maps to a synthetic email');
    ok(await page.evaluate(() => WR.Cloud.friendly({ message: 'User already registered' }, 'signup') === 'That name is taken. Try another one! 🌸'), 'taken-name message');
    ok(await page.evaluate(() => /Wrong name or password/.test(WR.Cloud.friendly({ message: 'Invalid login credentials' }))), 'wrong-password message');
    await openPanel(page, 'signup');
    await submit(page, 'ab', 'secret1'); ok(/at least 3/.test(await page.textContent('#ccErr')), 'UI: short name error');
    await submit(page, 'lily star', 'secret1'); ok(/only letters/.test(await page.textContent('#ccErr')), 'UI: spaces error');
    await submit(page, 'lily_star', '123'); ok(/6 characters/.test(await page.textContent('#ccErr')), 'UI: short password error');
    if (SHOTS) { await page.fill('#ccName', ''); await page.fill('#ccPass', ''); await page.evaluate(() => document.querySelector('#ccErr').textContent = ''); await page.waitForTimeout(400);
      await page.screenshot({ path: OUT + 'cloud_signup_phone.png' });
      await page.click('.cc-tabs [data-m="login"]'); await page.waitForTimeout(300); await page.screenshot({ path: OUT + 'cloud_signed_out_phone.png' }); }
    await ctx.close();
  }

  /* 3. live round trip with the real Supabase project */
  const probe = await (async () => { try { const r = await fetch('https://aoqfqopzycowbnjshzvg.supabase.co/rest/v1/saves?select=user_id&limit=1', { headers: { apikey: 'sb_publishable_uohGzZ5-4NxurifutYE4Xg_8FMVfiVp' } }); return r.status; } catch (e) { return 'unreachable'; } })();
  if (probe !== 200) { console.log('SKIP live round trip: Supabase saves table answered', probe); await browser.close(); return; }
  const user = 'wrtest_' + Math.random().toString(36).slice(2, 8), pass = 'pw_' + Math.random().toString(36).slice(2, 10);
  console.log('TEST USER', user);
  // device A: guest with progress signs up -> local save is pushed
  const A = await device(browser, { seed: save(77, 'Tester'), phone: true });
  await openPanel(A.page, 'signup'); await submit(A.page, user, pass);
  await A.page.waitForSelector('.cc-name', { timeout: 20000 }); await waitStatus(A.page, 'saved');
  ok(await A.page.textContent('.cc-name') === user, 'signed-in name shown');
  ok(/Saved to cloud ✓/.test(await A.page.textContent('#ccStatus')), 'panel shows "Saved to cloud ✓"');
  if (SHOTS) { await A.page.waitForTimeout(400); await A.page.screenshot({ path: OUT + 'cloud_signed_in_phone.png' }); }
  await A.page.click('#ccDone');
  ok(/st-saved/.test(await A.page.getAttribute('#cloudChip', 'class')), 'top-bar chip shows saved');
  // a change is pushed ~3 s later
  await A.page.evaluate(() => WR.addStars(5)); ok(await status(A.page) === 'saving', 'status goes to Saving… after a change');
  if (SHOTS) await A.page.screenshot({ path: OUT + 'cloud_saving_chip_phone.png', clip: { x: 0, y: 0, width: 390, height: 70 } });
  await waitStatus(A.page, 'saved', 12000); ok(true, 'debounced push finished');
  if (SHOTS) await A.page.screenshot({ path: OUT + 'cloud_map_signed_in_phone.png' });
  const cloudStars = await A.page.evaluate(async () => { const c = await WR.Cloud.client(); const { data } = await c.from('saves').select('data,username').single(); return [data.data.stars, data.username]; });
  ok(cloudStars[0] === 82 && cloudStars[1] === user, 'cloud row has the new stars and username ' + JSON.stringify(cloudStars));
  // taken name + wrong password from another device
  const X = await device(browser, { seed: save(3, 'Other') });
  await openPanel(X.page, 'signup'); await submit(X.page, user, 'whatever1');
  await X.page.waitForFunction(() => document.querySelector('#ccErr').textContent.length > 0, null, { timeout: 15000 });
  ok(/name is taken/.test(await X.page.textContent('#ccErr')), 'duplicate sign-up says the name is taken');
  await X.page.click('.cc-tabs [data-m="login"]'); await submit(X.page, user, 'nottheone');
  await X.page.waitForFunction(() => document.querySelector('#ccErr').textContent.length > 0, null, { timeout: 15000 });
  ok(/Wrong name or password/.test(await X.page.textContent('#ccErr')), 'bad password says wrong name or password');
  // ...then the right password on a device with a weaker guest save: chooser appears, pick cloud
  await submit(X.page, user, pass);
  await X.page.waitForSelector('[data-pick="cloud"]', { timeout: 20000 });
  ok(await X.page.$('.cc-pick.best[data-pick="cloud"]') !== null, 'chooser marks the cloud save as having more progress');
  if (SHOTS) await X.page.screenshot({ path: OUT + 'cloud_choose_save_desktop.png' });
  await X.page.click('[data-pick="cloud"]'); await X.page.waitForSelector('.cc-name', { timeout: 15000 });
  ok(await stars(X.page) === 82, 'picking the cloud save restores 82 stars');
  await X.ctx.close();
  // device B: brand-new device, log in from onboarding -> progress restored
  await A.page.evaluate(() => localStorage.clear());
  const B = await device(browser, { phone: true });
  await B.page.waitForSelector('#ccOnb'); ok(true, 'onboarding offers Cloud Castle log in');
  if (SHOTS) await B.page.screenshot({ path: OUT + 'cloud_onboarding_phone.png' });
  await B.page.click('#ccOnb'); await submit(B.page, user, pass);
  await B.page.waitForSelector('.cc-name', { timeout: 20000 });
  ok(await stars(B.page) === 82 && await B.page.evaluate(() => WR.state.name) === 'Tester', 'fresh device restored stars and name');
  await B.page.click('#ccDone'); ok(await B.page.$('.realm-node') !== null, 'map shown after restore');
  // reload keeps the session and pulls
  await B.page.reload({ waitUntil: 'networkidle' }); await waitStatus(B.page, 'saved', 20000);
  ok(await B.page.evaluate(() => WR.Cloud.username) === user, 'session resumes after reload');
  // B earns stars; A (whose storage was wiped) logs back in and gets them; then A's reload pulls B's newer save
  await B.page.evaluate(() => WR.addStars(10)); await waitStatus(B.page, 'saving', 3000); await waitStatus(B.page, 'saved', 15000);
  await A.page.reload({ waitUntil: 'networkidle' }); await A.page.waitForSelector('#ccOnb');
  await A.page.click('#ccOnb'); await submit(A.page, user, pass); await A.page.waitForSelector('.cc-name', { timeout: 20000 });
  ok(await stars(A.page) === 92, 'device A sees device B\'s 92 stars after clearing storage and logging in');
  await A.page.click('#ccDone');
  await B.page.evaluate(() => WR.addStars(3)); await waitStatus(B.page, 'saved', 15000);
  await A.page.reload({ waitUntil: 'networkidle' }); await waitStatus(A.page, 'saved', 20000);
  ok(await stars(A.page) === 95, 'reload on A pulls the newer save from B (no clobbering)');
  // A is now synced, makes a change while B also changed -> push must not blindly overwrite B's newer row
  await B.page.evaluate(() => WR.addStars(1)); await waitStatus(B.page, 'saved', 15000); // cloud 96, A still thinks 95 is latest
  await A.page.evaluate(() => { WR.state.stars += 0; WR.save(); }); await waitStatus(A.page, 'saved', 15000);
  ok(await stars(A.page) === 96, 'background push noticed newer cloud data and took it (96)');
  // log out & clear device
  await A.page.click('#cloudChip'); await A.page.waitForSelector('#ccOutClear');
  A.page.once('dialog', d => d.accept()); await A.page.click('#ccOutClear'); await A.page.waitForSelector('.pgate'); await A.page.evaluate(() => { if (!document.querySelector('.pgate')) return; [...WR.parentGate._answer()].forEach(d => document.querySelector(`.pgate [data-d="${d}"]`).click()); document.getElementById('pgOk').click(); });  // 👪 grown-up gate (T19)
  await A.page.waitForSelector('#nm', { timeout: 10000 });
  ok(await status(A.page) === 'guest' && await A.page.evaluate(() => !localStorage.getItem('wordRealms.save.v1') || !JSON.parse(localStorage.getItem('wordRealms.save.v1')).pet), 'log out & clear returns to onboarding as a guest');
  ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no page errors during the round trip ' + JSON.stringify(A.page.errors.concat(B.page.errors)));
  await A.ctx.close(); await B.ctx.close();
  await browser.close();
})().catch(e => { console.error('FAIL crashed', e); process.exit(1); });
