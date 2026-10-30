// ✏️ Renaming the hero (display) name, plus the Cloud Castle password change. Login names are fixed by design.
// Part 1 (local): hero rename from the map card and from Settings, validation, escaping, saved in wordRealms.save.v1, survives a reload.
// Part 2 (live Supabase): sign up a wrtest_ user, the hero name cloud-syncs, there is no login-name rename (by design),
//   change password (wrong current, too short, success), log out & clear, the old password fails, the new one logs in with progress intact.
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
  const id = Date.now().toString(36).slice(-6), A = 'wrtest_rn' + id, PASS = 'secret' + id, PASS2 = 'magic' + id;
  {
    const { ctx, page: p } = await device(browser, seed(77, 'Rosie'));
    await p.waitForSelector('#cloudChip'); await p.click('#cloudChip'); await p.waitForSelector('#cloudPanel');
    await p.click('.cc-tabs [data-m="signup"]'); await p.fill('#ccName', A); await p.fill('#ccPass', PASS); await p.click('#ccGo');
    await p.waitForSelector('#ccPw', { timeout: 20000 }); made.push(A);
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
    // login names can't be renamed (by design): no option in the panel, and no code path for it
    ok(await p.$('#ccRename') === null && !!(await p.$('#ccPw')) && !/change login name/i.test(await p.textContent('#cloudPanel')), 'the Cloud Castle panel has no "Change login name" option');
    ok(await p.evaluate(() => !('renameLogin' in WR.Cloud) && !('renameReady' in WR.Cloud)), 'cloud.js has no login-rename code path');
    const LOGIN = (await p.evaluate(() => WR.Cloud.username));
    // change password
    await p.click('#ccPw'); await p.waitForSelector('#ccPwForm');
    await p.fill('#ccPwOld', 'wrong-one'); await p.fill('#ccPwNew', PASS2); await p.click('#ccPwGo');
    await p.waitForFunction(() => /current password isn't right/.test(document.querySelector('#ccPwErr').textContent), null, { timeout: 15000 });
    ok(true, 'a wrong current password is refused');
    await p.fill('#ccPwOld', PASS); await p.fill('#ccPwNew', '123'); await p.click('#ccPwGo');
    ok(/6 characters/.test(await p.textContent('#ccPwErr')), 'a short new password is refused');
    await shot(p, '06_password');
    await p.fill('#ccPwNew', PASS2); await p.click('#ccPwGo');
    await p.waitForSelector('#ccPw', { timeout: 15000 });
    ok((await tokenFor(LOGIN, PASS2)).s === 200 && (await tokenFor(LOGIN, PASS)).s === 400, 'new password works, old password no longer does');
    // log out & clear, then log back in on the same device
    p.on('dialog', d => d.accept());
    await p.click('#ccOutClear'); await p.waitForSelector('.pgate'); await p.evaluate(() => { if (!document.querySelector('.pgate')) return; [...WR.parentGate._answer()].forEach(d => document.querySelector(`.pgate [data-d="${d}"]`).click()); document.getElementById('pgOk').click(); });  // 👪 grown-up gate (T19) await p.waitForTimeout(1500);
    await p.reload({ waitUntil: 'networkidle' });
    ok(await p.evaluate(() => !WR.state.pet), 'device cleared after logging out');
    await p.click('#ccOnb'); await p.waitForSelector('#ccForm');
    await p.fill('#ccName', LOGIN); await p.fill('#ccPass', PASS); await p.click('#ccGo');
    await p.waitForFunction(() => /Wrong name or password/.test(document.querySelector('#ccErr').textContent), null, { timeout: 15000 });
    ok(true, 'logging in with the old password says "Wrong name or password"');
    await p.fill('#ccPass', PASS2); await p.click('#ccGo');
    await p.waitForSelector('#ccPw', { timeout: 20000 }); await p.waitForTimeout(800);
    const back = await p.evaluate(() => ({ id: WR.Cloud.user.id, name: WR.state.name, stars: WR.state.stars, xp: WR.state.pet && WR.state.pet.xp, u: WR.Cloud.username }));
    ok(back.id === uid && back.u === LOGIN, 'logged back in as ' + LOGIN + ' (same user_id)');
    ok(back.name === 'Rosie Cloud' && back.stars === 77 && back.xp === 154, 'progress intact after logging back in (hero name, stars, pet XP)');
    await p.click('#ccDone'); await p.waitForTimeout(300);
    await shot(p, '07_back_in');
    ok(p.errors.length === 0, 'no page errors (live) ' + p.errors.join(' | '));
    await ctx.close();
  }
  console.log('test accounts: ' + made.join(', '));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'ALL RENAME TESTS PASSED');
})().catch(e => { console.error('FAIL crashed', e); process.exit(1); });
