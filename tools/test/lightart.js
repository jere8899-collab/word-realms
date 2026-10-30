// 📱 Light art: phones get small WebP art, desktops the 1280 px WebP, and the PNG/SVG fallbacks still work.
const { chromium } = require('playwright-core');
const OUT = '/workspace/cefr-quest/screenshots/';
const URL = 'http://127.0.0.1:18642/index.html';
const ok = (c, m) => { if (!c) { console.error('FAIL', m); process.exitCode = 1; } else console.log('ok', m); };
const save = () => {
  const d = new Date(), t = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  return { v: 1, name: 'Jeremy', avatar: 'avatar_girl', startLevel: 'a1', stars: 60, totalCorrect: 20, totalAnswered: 25,
    pet: { species: 'pet_bunny', name: 'Puff', xp: 120, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
    streak: { count: 2, last: t }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
    settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 3 };
};
async function run(browser, vp, label, opts = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: vp.width < 500 ? 2 : 1 });
  const page = await ctx.newPage();
  const errors = [], imgs = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  if (opts.blockWeb) await page.route('**/assets/web/**', r => r.abort());
  page.on('response', async r => { const u = r.url(); if (/\.(png|jpe?g|webp|svg)$/.test(u)) { let n = 0; try { n = (await r.body()).length; } catch (e) {} imgs.push({ u: u.replace(/.*18642\//, ''), n }); } });
  await page.goto(URL); await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), save());
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await page.waitForTimeout(700);
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200);
  if (opts.shot) await page.screenshot({ path: OUT + `lightart_${label}_map.png` });
  await page.evaluate(() => WR.startLesson({ realm: 'b1', skill: 'grammar', key: 'grammar', title: 'Grammar' }));
  await page.waitForTimeout(1200);
  if (opts.shot) await page.screenshot({ path: OUT + `lightart_${label}_lesson.png` });
  const broken = await page.evaluate(() => [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).map(i => i.getAttribute('src')));
  const bg = await page.evaluate(() => getComputedStyle(document.querySelector('.lesson-bg')).backgroundImage);
  const bytes = imgs.reduce((a, b) => a + b.n, 0);
  await ctx.close();
  return { errors, imgs, bytes, broken, bg };
}
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const phone = await run(browser, { width: 390, height: 844 }, 'phone', { shot: true });
  console.log('phone image KB', Math.round(phone.bytes / 1024), phone.imgs.map(i => i.u).join(' '));
  ok(phone.errors.length === 0, 'phone: no console errors ' + phone.errors.join(' | '));
  ok(phone.broken.length === 0, 'phone: no broken images');
  ok(!phone.imgs.some(i => /\.png$/.test(i.u) && /assets\/(backgrounds|pets|avatars|ui)\//.test(i.u)), 'phone: no big PNGs downloaded');
  ok(phone.imgs.some(i => /_720\.webp$/.test(i.u)) && !phone.imgs.some(i => /_1280\.webp$/.test(i.u)), 'phone: uses the 720 px backgrounds');
  ok(phone.imgs.some(i => /_thumb\.webp$/.test(i.u)), 'phone: map uses WebP thumbnails');
  ok(/bg_b1_720\.webp/.test(phone.bg), 'phone: lesson background is the small WebP');
  ok(phone.bytes < 600 * 1024, 'phone: under 600 KB of images for map + lesson');
  const desk = await run(browser, { width: 1280, height: 860 }, 'desktop', { shot: true });
  console.log('desktop image KB', Math.round(desk.bytes / 1024));
  ok(desk.errors.length === 0 && desk.broken.length === 0, 'desktop: no errors or broken images');
  ok(/bg_b1_1280\.webp/.test(desk.bg), 'desktop: lesson background is the 1280 px WebP');
  ok(desk.bytes < 1200 * 1024, 'desktop: under 1.2 MB of images');
  const fb = await run(browser, { width: 390, height: 844 }, 'fallback', { blockWeb: true });
  ok(fb.errors.length === 0, 'fallback: no script errors when WebP is unavailable ' + fb.errors.join(' | '));
  ok(fb.imgs.some(i => /assets\/pets\/pet_bunny\.png$/.test(i.u)) && fb.imgs.some(i => /assets\/avatars\/avatar_girl\.png$/.test(i.u)), 'fallback: pet and avatar fall back to the PNG');
  ok(fb.broken.length === 0, 'fallback: no broken <img> after falling back ' + fb.broken.join(','));
  await browser.close();
})();
