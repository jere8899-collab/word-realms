// ✏️ Renaming: the hero (display) name and the Cloud Castle login name.
// Part 1 (local): hero rename from the map card and from Settings, validation, escaping, saved in wordRealms.save.v1, survives a reload.
// Part 2 (live Supabase): sign up a wrtest_ user, the hero name cloud-syncs, change login name (taken name, bad name, success),
//   log out, old name fails, new name logs in with progress intact and the same user_id; change password (wrong current, success, old fails).
// If public.rename_login isn't installed yet, part 2 checks that the panel says so clearly and reports the round trip as NOT RUN.
// BASE=https://jere8899-collab.github.io/word-realms/ node tools/test/rename.js  runs it against the live site.
const { chromium } = require('playwright-core');
const OUT = '/workspace/cefr-quest/screenshots/';
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const URL = BASE + 'index.html';
const SB = 'https://aoqfqopzycowbnjshzvg.supabase.co', KEY = 'sb_publishable_uohGzZ5-4NxurifutYE4Xg_8FMVfiVp', DOM = '@players.wordrealms.app';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const seed = (stars = 60, name = 'Jeremy') => ({ v: 1, name, avatar: 'avatar_girl', startLevel: 'a1', stars, totalCorrect: stars, totalAnswered: stars + 5,
  pet: { species: 'pet_fox', name: 'Mochi', xp: stars * 2, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 2, last: today() }, progress: { a1: { grammar: { best: 0.9, plays: 1 } } }, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: false }, mistakes: [], lessonsDone: Math.round(stars / 10) });
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const H = t => Object.assign({ apikey: KEY, 'Content-Type': 'application/json' }, t ? { Authorization: 'Bearer ' + t } : {});
const api = async (path, opt = {}) => { const r = await fetch(SB + path, opt); let b = null; try { b = await r.json(); } catch (e) { } return { s: r.status, b }; };
const tokenFor = async (name, pass) => (await api('/auth/v1/token?grant_type=password', { method: 'POST', headers: H(), body: JSON.stringify({ email: name + DOM, password: pass }) }));
const saved = p => p.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')));
async function device(browser, s) {
  const ctx = await browser.newContext(PHONE), page = await ctx.newPage(); page.errors = [];
  page.on('pageerror', e => page.errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR|status of 4\d\d/.test(m.text())) page.errors.push(m.text()); });
  await page.goto(URL);
  if (s) await page.evaluate(v => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(v)); }, s);
  await page.reload({ waitUntil: 'networkidle' });
  return { ctx, page };
}
const shot = (p, n) => p.screenshot({ path: OUT + 'rename_' + n + '.png' });

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const made = [];

  /* ---------- 1. hero (display) name ---------- */
  {
    const { ctx, page: p } = await device(browser, seed(60, 'Jeremy'));
    await p.waitForSelector('#heroEditHome');
    ok(/Hello, Jeremy!/.test(await p.textContent('.homehead h1')), 'map greets the hero by name');
    await shot(p, '01_home');
    await p.click('#heroEditHome'); await p.waitForSelector('#heroName');
    ok(await p.inputValue('#heroName') === 'Jeremy', 'rename box starts with the current name');
    await p.fill('#heroName', '   '); ok(await p.isDisabled('#heroSave') && /type a name/.test(await p.textContent('#heroErr')), 'a blank name is refused');
    await p.fill('#heroName', 'A'.repeat(21)); ok(await p.isDisabled('#heroSave') && /20 characters/.test(await p.textContent('#heroErr')), 'a 21-character name is refused');
    await p.fill('#heroName', '  Lily   Star  '); ok(!(await p.isDisabled('#heroSave')) && (await p.textContent('#heroCount')) === '9/20', 'a good name is allowed, with a live 9/20 count');
    await p.waitForTimeout(500); await shot(p, '02_hero_modal');
    await p.click('#heroSave'); await p.waitForTimeout(300);
    ok(await p.$('#heroName') === null, 'saving closes the box');
    ok(/Hello, Lily Star!/.test(await p.textContent('.homehead h1')), 'map greeting shows the new name (spaces tidied)');
    ok((await p.textContent('.topbar .brand small')).trim() === 'Lily Star', 'top bar shows the new name');
    ok((await saved(p)).name === 'Lily Star', 'new name saved in wordRealms.save.v1');
    const st = await saved(p); ok(st.stars === 60 && st.pet.xp === 120 && st.totalCorrect === 60, 'stars, pet and progress unchanged');
    await shot(p, '03_home_renamed');
    // from Settings, with characters that need escaping
    await p.click('#setBtn'); await p.waitForSelector('#heroEdit');
    ok((await p.textContent('#heroCur')) === 'Lily Star', 'Settings shows the hero name');
    await p.waitForTimeout(2200); await shot(p, '04_settings');
    await p.click('#heroEdit'); await p.waitForSelector('#heroName');
    await p.fill('#heroName', 'Tom & <b>Jerry</b>'); await p.click('#heroSave'); await p.waitForTimeout(300);
    const nm = (await saved(p)).name;
    ok(nm === 'Tom & bJerry/b', 'angle brackets are dropped from names (got "' + nm + '")');
    ok(await p.$('.homehead h1 b') === null && /Hello, Tom & bJerry\/b!/.test(await p.textContent('.homehead h1')), 'the name is shown as text, never as HTML');
    await p.evaluate(() => WR.renameHero('李小龍 ✨ Hero'));
    ok((await saved(p)).name === '李小龍 ✨ Hero', 'non-English names and emoji are fine');
    let threw = await p.evaluate(() => { try { WR.renameHero(''); return false; } catch (e) { return e.message; } });
    ok(/type a name/.test(threw) && (await saved(p)).name === '李小龍 ✨ Hero', 'WR.renameHero refuses an empty name and keeps the old one');
    await p.reload({ waitUntil: 'networkidle' }); await p.waitForSelector('.homehead');
    ok(/Hello, 李小龍 ✨ Hero!/.test(await p.textContent('.homehead h1')), 'the new name survives a reload');
    // a lesson still works and the tab bar still works after renaming
    await p.click('#navbar button[data-k="pet"]'); await p.waitForTimeout(250);
    ok(await p.evaluate(() => document.querySelector('#navbar button.on').dataset.k) === 'pet', 'tab bar still works after renaming');
    ok(p.errors.length === 0, 'no page errors ' + p.errors.join(' | '));
    await ctx.close();
  }

  /* ---------- 2. live Cloud Castle: login name + password ---------- */
  const reach = await fetch(SB + '/auth/v1/health', { headers: H() }).then(r => r.ok).catch(() => false);
  if (!reach) { console.log('SKIP - Supabase unreachable: live rename round trip NOT RUN'); await browser.close(); return; }
  const id = Date.now().toString(36).slice(-6), A = 'wrtest_rn' + id, TAKEN = 'wrtest_rt' + id, NEW = 'wrtest_rz' + id, PASS = 'secret' + id, PASS2 = 'magic' + id;
  // a second account whose name is already taken
  const tk = await api('/auth/v1/signup', { method: 'POST', headers: H(), body: JSON.stringify({ email: TAKEN + DOM, password: PASS, data: { username: TAKEN } }) });
  ok(tk.s === 200, 'made a second test account ' + TAKEN); made.push(TAKEN);
  {
    const { ctx, page: p } = await device(browser, seed(77, 'Rosie'));
    await p.waitForSelector('#cloudChip'); await p.click('#cloudChip'); await p.waitForSelector('#cloudPanel');
    await p.click('.cc-tabs [data-m="signup"]'); await p.fill('#ccName', A); await p.fill('#ccPass', PASS); await p.click('#ccGo');
    await p.waitForSelector('#ccRename', { timeout: 20000 }); made.push(A);
    await p.waitForFunction(() => WR.Cloud.status === 'saved', null, { timeout: 15000 });
    const uid = await p.evaluate(() => WR.Cloud.user.id);
    ok(!!uid, 'signed up ' + A);
    await shot(p, '05_castle_panel');
    // hero rename while signed in reaches the cloud row
    await p.evaluate(() => WR.renameHero('Rosie Cloud'));
    await p.waitForFunction(() => WR.Cloud.status === 'saved' && !WR.Cloud.meta().dirty, null, { timeout: 20000 });
    let t = (await tokenFor(A, PASS)).b.access_token;
    let row = (await api('/rest/v1/saves?select=username,data&user_id=eq.' + uid, { headers: H(t) })).b[0];
    ok(row && row.data.name === 'Rosie Cloud' && row.username === A, 'the new hero name is cloud-synced (row data.name)');
    // change login name
    await p.click('#ccRename');
    await p.waitForSelector('#ccRenForm, #ccRenOff', { timeout: 15000 });
    if (await p.$('#ccRenOff')) {
      const msg = await p.textContent('#ccRenOff');
      ok(/isn't switched on/.test(msg), 'login rename is not installed on the server: the panel says so clearly ("' + msg.slice(0, 60) + '…")');
      await shot(p, '06_login_rename_off');
      console.log('NOT RUN - live login rename round trip: public.rename_login is not installed (run supabase/rename_login.sql in the SQL Editor)');
      await p.click('#ccBack');
      // the same UI against a stand-in for the installed function (PostgREST replies as it would), so the client path is covered
      let calls = [];
      await p.route('**/rest/v1/rpc/rename_login', async r => {
        const n = JSON.parse(r.request().postData() || '{}').new_name; calls.push(n);
        if (!n) return r.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ code: '22023', message: 'invalid name' }) });
        if (n === TAKEN) return r.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ code: '23505', message: 'name taken' }) });
        if (calls.filter(Boolean).length > 2) return r.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ code: '53400', message: 'rate limit: too many renames' }) });
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(n) });
      });
      await p.evaluate(() => { WR.Cloud._renameReady = undefined; });
      await p.click('#ccRename'); await p.waitForSelector('#ccRenForm', { timeout: 10000 });
      ok(true, '(stand-in server) with the function installed, the rename form appears');
      await p.fill('#ccNewName', 'no spaces!'); await p.click('#ccRenGo');
      ok(/only letters, numbers/.test(await p.textContent('#ccRenErr')) && calls.length === 1, '(stand-in) a bad name is refused before asking the server');
      await p.fill('#ccNewName', TAKEN); await p.click('#ccRenGo');
      await p.waitForFunction(() => /taken/.test(document.querySelector('#ccRenErr').textContent), null, { timeout: 10000 });
      ok(true, '(stand-in) a taken name gets "That name is taken"');
      await shot(p, '07_login_rename_taken_preview');
      await p.fill('#ccNewName', NEW.toUpperCase()); await p.click('#ccRenGo');
      await p.waitForSelector('#ccRename', { timeout: 10000 });
      ok(calls.includes(NEW) && (await p.textContent('#cloudPanel .cc-name')).trim() === NEW && await p.evaluate(() => WR.Cloud.meta().username) === NEW, '(stand-in) success lower-cases the name and updates the panel, chip and local meta');
      ok(await p.evaluate(() => WR.Cloud.user.id) === uid, '(stand-in) user_id unchanged');
      await shot(p, '08_login_renamed_preview');
      await p.click('#ccRename'); await p.waitForSelector('#ccRenForm'); await p.fill('#ccNewName', NEW + 'x'); await p.click('#ccRenGo');
      await p.waitForFunction(() => /wait a minute/.test(document.querySelector('#ccRenErr').textContent), null, { timeout: 10000 });
      ok(true, '(stand-in) a too-quick second rename gets "please wait a minute"');
      await p.click('#ccBack'); await p.unroute('**/rest/v1/rpc/rename_login');
      await p.evaluate(n => { WR.Cloud.username = n; localStorage.setItem('wordRealms.cloud.v1', JSON.stringify(Object.assign(WR.Cloud.meta(), { username: n }))); WR.Cloud._renameReady = undefined; WR.Cloud.paint(); }, A);
      await p.click('#ccDone'); await p.click('#cloudChip'); await p.waitForSelector('#ccRename');
    } else {
      await p.fill('#ccNewName', 'no spaces!'); await p.click('#ccRenGo');
      ok(/only letters, numbers/.test(await p.textContent('#ccRenErr')), 'a bad new name is refused before asking the server');
      await p.fill('#ccNewName', TAKEN); await p.click('#ccRenGo');
      await p.waitForFunction(() => /taken/.test(document.querySelector('#ccRenErr').textContent), null, { timeout: 15000 });
      ok(true, 'a taken name gets a friendly "That name is taken" error');
      await shot(p, '06_login_rename_taken');
      await p.fill('#ccNewName', NEW.toUpperCase()); await p.click('#ccRenGo');
      await p.waitForSelector('#ccRename', { timeout: 15000 }); made.push(NEW + ' (renamed from ' + A + ')');
      ok((await p.textContent('#cloudPanel .cc-name')).trim() === NEW, 'panel shows the new login name (lower-cased)');
      ok(await p.evaluate(() => WR.Cloud.username) === NEW && await p.evaluate(() => WR.Cloud.meta().username) === NEW, 'Cloud username and local meta updated');
      ok(await p.evaluate(() => WR.Cloud.user.id) === uid, 'user_id unchanged');
      await shot(p, '07_login_renamed');
      const tNew = await tokenFor(NEW, PASS); ok(tNew.s === 200 && tNew.b.user.id === uid, 'the new name logs in at once (same user_id)');
      row = (await api('/rest/v1/saves?select=username,data&user_id=eq.' + uid, { headers: H(tNew.b.access_token) })).b[0];
      ok(row && row.username === NEW && row.data.stars === 77, 'public.saves username column renamed, progress kept');
      ok((await tokenFor(A, PASS)).s === 400, 'the old name no longer logs in');
      // renaming again straight away is rate limited
      await p.click('#ccRename'); await p.waitForSelector('#ccRenForm'); await p.fill('#ccNewName', NEW + 'x'); await p.click('#ccRenGo');
      await p.waitForFunction(() => /wait a minute/.test(document.querySelector('#ccRenErr').textContent), null, { timeout: 15000 });
      ok(true, 'a second rename within 30 s gets a friendly "please wait" message');
      await p.click('#ccBack');
    }
    const LOGIN = (await p.evaluate(() => WR.Cloud.username));
    // change password
    await p.click('#ccPw'); await p.waitForSelector('#ccPwForm');
    await p.fill('#ccPwOld', 'wrong-one'); await p.fill('#ccPwNew', PASS2); await p.click('#ccPwGo');
    await p.waitForFunction(() => /current password isn't right/.test(document.querySelector('#ccPwErr').textContent), null, { timeout: 15000 });
    ok(true, 'a wrong current password is refused');
    await p.fill('#ccPwOld', PASS); await p.fill('#ccPwNew', '123'); await p.click('#ccPwGo');
    ok(/6 characters/.test(await p.textContent('#ccPwErr')), 'a short new password is refused');
    await shot(p, '09_password');
    await p.fill('#ccPwNew', PASS2); await p.click('#ccPwGo');
    await p.waitForSelector('#ccRename', { timeout: 15000 });
    ok((await tokenFor(LOGIN, PASS2)).s === 200 && (await tokenFor(LOGIN, PASS)).s === 400, 'new password works, old password no longer does');
    // log out & clear, then log back in on the same device
    p.on('dialog', d => d.accept());
    await p.click('#ccOutClear'); await p.waitForTimeout(1500);
    await p.reload({ waitUntil: 'networkidle' });
    ok(await p.evaluate(() => !WR.state.pet), 'device cleared after logging out');
    if (LOGIN !== A) {
      await p.click('#ccOnb'); await p.waitForSelector('#ccForm');
      await p.fill('#ccName', A); await p.fill('#ccPass', PASS2); await p.click('#ccGo');
      await p.waitForFunction(() => /Wrong name or password/.test(document.querySelector('#ccErr').textContent), null, { timeout: 15000 });
      ok(true, 'logging in with the old name says "Wrong name or password"');
      await shot(p, '10_old_name_fails');
      await p.fill('#ccName', LOGIN); await p.click('#ccGo');
    } else {
      await p.click('#ccOnb'); await p.waitForSelector('#ccForm'); await p.fill('#ccName', LOGIN); await p.fill('#ccPass', PASS2); await p.click('#ccGo');
    }
    await p.waitForSelector('#ccRename', { timeout: 20000 }); await p.waitForTimeout(800);
    const back = await p.evaluate(() => ({ id: WR.Cloud.user.id, name: WR.state.name, stars: WR.state.stars, xp: WR.state.pet && WR.state.pet.xp, u: WR.Cloud.username }));
    ok(back.id === uid && back.u === LOGIN, 'logged back in as ' + LOGIN + ' (same user_id)');
    ok(back.name === 'Rosie Cloud' && back.stars === 77 && back.xp === 154, 'progress intact after logging back in (hero name, stars, pet XP)');
    await p.click('#ccDone'); await p.waitForTimeout(300);
    await shot(p, '11_back_in');
    ok(p.errors.length === 0, 'no page errors (live) ' + p.errors.join(' | '));
    await ctx.close();
  }
  console.log('test accounts: ' + made.join(', '));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'ALL RENAME TESTS PASSED');
})().catch(e => { console.error('FAIL crashed', e); process.exit(1); });
