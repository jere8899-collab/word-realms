// 🐾 Pet idle bounce (js/core.js WR.petHTML + css/style.css .pet-idle): Hoot and Puffbun play their 8-frame idle sheet on
// the map's pet chip and the pet screen; other pets, the royal look, a pet wearing an accessory and reduced motion all
// show the still art. The sheet sits exactly over the still, the pet chip stays tappable, no errors at 360 px.
// Screenshots → screenshots/pet_idle_*.png.   BASE=<live url> node tools/test/pet-idle.js runs it on the live site.
const { chromium } = require('playwright-core');
const { seedSave } = require('./_harness');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else console.log('ok', m); };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const save = (species, pet = {}) => ({ v: 1, name: 'Jeremy', avatar: 'avatar_girl', startLevel: 'a1', stars: 40, totalCorrect: 20, totalAnswered: 24, lessonsDone: 2,
  pet: Object.assign({ species, name: 'Pip', xp: 40, happiness: 80, hunger: 30, skin: null, lastTick: Date.now(), looks: {} }, pet),
  streak: { count: 1, last: today() }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null }, looks: {},
  rewards: { got: [], chest: { last: null, n: 0 }, caughtUp: true }, settings: { rate: .9, sound: false, unlockAll: false }, mistakes: [] });
// what the pet picture in `sel` is doing
const probe = (page, sel) => page.evaluate(sel => {
  const w = document.querySelector(sel + ' .petwrap'); if (!w) return null;
  const img = w.querySelector(':scope > img'), box = w.querySelector('.pet-idle-box'), sp = w.querySelector('.pet-idle');
  const r = img.getBoundingClientRect(), s = Math.min(r.width, r.height);
  const o = { art: w.dataset.art, has: w.classList.contains('has-idle'), go: w.classList.contains('idle-go'), imgVis: getComputedStyle(img).visibility,
    boxShown: !!box && getComputedStyle(box).display !== 'none', layers: w.querySelectorAll('image.layer').length };
  if (sp) { const q = sp.getBoundingClientRect(); o.anim = getComputedStyle(sp).animationName; o.bg = getComputedStyle(sp).backgroundImage;
    o.offset = Math.max(Math.abs(q.width - s), Math.abs(q.height - s), Math.abs(q.left + q.width / 2 - (r.left + r.width / 2)), Math.abs(q.top + q.height / 2 - (r.top + r.height / 2))); }
  return o;
}, sel);
const frames = (page, sel) => page.evaluate(async sel => { const sp = document.querySelector(sel + ' .pet-idle'); if (!sp) return 0; const seen = new Set();
  for (let i = 0; i < 12; i++) { seen.add(getComputedStyle(sp).backgroundPosition); await new Promise(r => setTimeout(r, 90)); } return seen.size; }, sel);
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const run = async (label, s, opts = {}) => {
    const ctx = await browser.newContext({ viewport: opts.viewport || { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
    await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
    const page = await ctx.newPage(), errs = [], sheets = [];
    page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('request', r => { if (/_idle\.webp/.test(r.url())) sheets.push(r.url()); });
    await seedSave(page, BASE + 'index.html', s); await page.waitForSelector('#petMini');
    await page.waitForTimeout(900);                       // the sheet loads, then the chip switches to the bounce
    const chip = await probe(page, '#petMini');
    const over = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    return { ctx, page, errs, sheets, chip, over };
  };
  // ---- Hoot and Puffbun bounce on the map chip and the pet screen
  for (const [sp, nm] of [['pet_owl', 'hoot'], ['pet_bunny', 'puffbun']]) {
    const r = await run(sp, save(sp));
    ok(r.chip && r.chip.has && r.chip.go && r.chip.boxShown && r.chip.imgVis === 'hidden', `${sp} map chip: the idle bounce plays over a hidden still`);
    ok(r.chip && r.chip.anim === 'petIdle' && /_idle\.webp/.test(r.chip.bg), `${sp} map chip: petIdle animation on its own sheet`);
    ok((await frames(r.page, '#petMini')) >= 4, `${sp} map chip: the frames change over time`);
    await r.page.click('#petMini'); await r.page.waitForSelector('#petStage .petwrap'); await r.page.waitForTimeout(400);
    const st = await probe(r.page, '#petStage');
    ok(st.has && st.go && st.boxShown && st.imgVis === 'hidden' && st.anim === 'petIdle', `${sp} pet screen: the idle bounce plays (the chip is still tappable)`);
    ok(st.offset < 1.5, `${sp} pet screen: the sheet sits exactly over the still (off by ${st.offset.toFixed(2)} px)`);
    ok((await frames(r.page, '#petStage')) >= 4, `${sp} pet screen: the frames change over time`);
    await r.page.screenshot({ path: OUT + `pet_idle_${nm}.png` });
    ok(!r.over && (await r.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)), `${sp}: no sideways scroll at 360 px`);
    ok(r.errs.length === 0, `${sp}: no page or console errors at 360 px` + (r.errs.length ? ' — ' + r.errs.join(' | ') : ''));
    await r.ctx.close();
  }
  // ---- other pets stay still
  { const r = await run('fox', save('pet_fox'));
    ok(r.chip && !r.chip.has && !r.chip.boxShown && r.chip.imgVis === 'visible', 'pet_fox: still picture, no idle sheet');
    ok(r.sheets.length === 0, 'pet_fox: no idle sheet is downloaded');
    await r.page.click('#petMini'); await r.page.waitForSelector('#petStage .petwrap');
    const st = await probe(r.page, '#petStage'); ok(!st.has && st.imgVis === 'visible', 'pet_fox pet screen: still');
    await r.page.screenshot({ path: OUT + 'pet_idle_other_still.png' });
    ok(r.errs.length === 0, 'pet_fox: no errors'); await r.ctx.close(); }
  // ---- reduced motion: the still, and the sheet is never fetched
  { const r = await run('reduce', save('pet_owl'), { reduce: true });
    ok(r.chip && !r.chip.go && !r.chip.boxShown && r.chip.imgVis === 'visible', 'reduced motion: Hoot shows the still');
    ok(r.sheets.length === 0, 'reduced motion: the idle sheet is not downloaded');
    ok(r.errs.length === 0, 'reduced motion: no errors'); await r.ctx.close(); }
  // ---- wearing an accessory: still, so the hat stays on the head
  { const r = await run('hat', save('pet_bunny', { looks: { head: 'a_witch' } }));
    ok(r.chip && r.chip.layers > 0 && !r.chip.has && r.chip.imgVis === 'visible', 'Puffbun wearing a hat: still picture, hat layer drawn');
    ok(r.errs.length === 0, 'hat: no errors'); await r.ctx.close(); }
  // ---- the royal (evolved) look has no sheet: still
  { const r = await run('royal', save('pet_owl', { xp: 900 }));
    ok(r.chip && /_royal$/.test(r.chip.art) && !r.chip.has && r.chip.imgVis === 'visible', 'royal Hoot: still picture');
    await r.ctx.close(); }
  // ---- landscape + small phones: the bounce stays inside its box
  for (const vp of [{ width: 320, height: 640 }, { width: 375, height: 667 }, { width: 740, height: 360 }]) {
    const r = await run('vp', save('pet_owl'), { viewport: vp });
    await r.page.click('#petMini'); await r.page.waitForSelector('#petStage .petwrap'); await r.page.waitForTimeout(400);
    const st = await probe(r.page, '#petStage');
    ok(st.go && st.offset < 1.5 && !(await r.page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) && r.errs.length === 0, `${vp.width}×${vp.height}: Hoot bounces on the pet screen, lined up, no sideways scroll, no errors`);
    await r.ctx.close();
  }
  await browser.close();
  console.log(fails ? `pet-idle: ${fails} failed` : 'pet-idle: all ok');
})().catch(e => { console.error(e); process.exit(1); });
