// 📲 R17 (REVIEW-2026-11-01): the first visit downloads under 2 MB (as GitHub Pages serves it, gzip for text), the art is
// cached as it is shown, offline still works for screens already visited, and ⚙️ "📲 Download for offline play" fetches
// all the pictures on request.   node tools/test/lightload.js   (SHOT=1)
const { chromium } = require('playwright-core');
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const ROOT = path.join(__dirname, '..', '..'), OUT = ROOT + '/screenshots/';
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = { v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'a1', stars: 40, totalCorrect: 2, totalAnswered: 3, bonusSeen: ['sp'],
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 30, happiness: 70, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 1, last: today() }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false }, mistakes: [], lessonsDone: 0 };
// bytes as served by GitHub Pages: text gzipped, images as they are
const served = rel => { const f = path.join(ROOT, rel === '' ? 'index.html' : rel); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) return 0;
  const b = fs.readFileSync(f); return /\.(webp|png|jpe?g|gif|mp3)$/i.test(f) ? b.length : zlib.gzipSync(b, { level: 6 }).length; };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.addInitScript(s => { if (!localStorage.getItem('wordRealms.save.v1')) localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE);
  await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
  const urls = new Set(); ctx.on('request', r => { const u = r.url(); if (u.startsWith(BASE)) urls.add(u.slice(BASE.length).split('?')[0]); });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(BASE); await page.waitForSelector('.realm-node');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(async () => (await caches.keys()).some(k => k.startsWith('wrart-')), null, { timeout: 30000 });   // warm ran
  await page.waitForTimeout(3000);
  const list = [...urls], bytes = list.reduce((a, u) => a + served(u), 0);
  const sw = fs.readFileSync(ROOT + '/sw.js', 'utf8'), ART = JSON.parse(sw.match(/const ARTFILES = (\[.*?\]);/)[1].replace(/'/g, '"'));
  const allArt = ART.reduce((a, u) => a + served(u), 0);
  console.log(`first visit: ${list.length} files, ${bytes} bytes as served (all art would add ${(allArt / 1e6).toFixed(2)} MB)`);
  ok(bytes < 1.45e6, `the first visit downloads ${(bytes / 1e6).toFixed(2)} MB (< 1.45 MB, was 1.87 MB on main)`);
  ok(!list.includes('data/c2/reading.json') && !list.includes('data/b2/vocab.json') && !list.includes('assets/voice/manifest.json'), 'far banks and the voice lookup are not on the first visit');
  ok(list.includes('data/realms.json') && list.includes('js/math-topics-p.js'), 'the map still loads home data and the maths crown code');
  ok(list.filter(u => u.startsWith('assets/icons/')).length < 120, `only the icons on screen are fetched (${list.filter(u => u.startsWith('assets/icons/')).length} of ${ART.filter(u => u.startsWith('assets/icons/')).length})`);
  const caches0 = await page.evaluate(async () => {
    const out = {}; for (const k of await caches.keys()) out[k.replace(/-.*/, '')] = (await (await caches.open(k)).keys()).length;
    const bank = (await caches.keys()).find(k => k === 'wrdata');
    const far = bank ? !!(await (await caches.open(bank)).match('data/c2/reading.json')) : false;
    return { out, far };
  });
  ok(caches0.out.wr >= 40 && caches0.out.wrart > 5 && !caches0.far, `shell precached (${caches0.out.wr}), shown art kept (${caches0.out.wrart}), far banks not precached`);
  // visit a realm and a lesson online, then go offline — only what was opened comes with us
  await page.reload(); await page.waitForSelector('.realm-node');
  await page.evaluate(() => WR.go('realm', 'a1')); await page.waitForSelector('.path-grid'); await page.waitForTimeout(1500);
  await page.evaluate(() => WR.startLesson({ realm: 'a1', skill: 'vocab', key: 'vocab', title: 'Words' })); await page.waitForSelector('.qtext'); await page.waitForTimeout(1500);
  await ctx.setOffline(true);
  await page.reload(); await page.waitForSelector('.realm-node', { timeout: 15000 }); await page.waitForTimeout(1200);
  const broken = () => page.evaluate(() => [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.src.includes('/assets/') && i.getBoundingClientRect().width > 0).map(i => i.src.split('/').pop()));
  let b = await broken(); ok(b.length === 0, `offline: the home page opens with all its pictures (${b})`);
  await page.evaluate(() => WR.go('realm', 'a1')); await page.waitForSelector('.path-grid'); await page.waitForTimeout(1200);
  b = await broken(); ok(b.length === 0, `offline: the visited A1 realm shows all its pictures (${b})`);
  await page.evaluate(() => WR.startLesson({ realm: 'a1', skill: 'vocab', key: 'vocab', title: 'Words again' })); await page.waitForSelector('.qtext', { timeout: 15000 });
  ok(true, 'offline: the lesson that was opened still opens');
  await page.evaluate(() => WR.go('realm', 'a1')); await page.waitForSelector('.path-grid');
  const missed = await page.evaluate(async () => {
    await WR.startLesson({ realm: 'a2', skill: 'grammar', key: 'grammar', title: 'Not yet' });
    return { toast: (document.querySelector('.toast') || {}).textContent || '', q: !!document.querySelector('.qtext'), stars: WR.state.stars };
  });
  ok(/isn't on this device yet/.test(missed.toast) && !missed.q && missed.stars === 40, `offline: an unvisited realm explains kindly and keeps the stars (${missed.toast})`);
  await ctx.setOffline(false);
  await page.evaluate(() => WR.startLesson({ realm: 'a2', skill: 'grammar', key: 'grammar', title: 'Now' })); await page.waitForSelector('.qtext', { timeout: 15000 });
  await ctx.setOffline(true);
  await page.reload(); await page.waitForSelector('.realm-node', { timeout: 15000 });
  await page.evaluate(() => WR.startLesson({ realm: 'a2', skill: 'grammar', key: 'grammar', title: 'Saved' })); await page.waitForSelector('.qtext', { timeout: 15000 });
  ok(true, 'offline after a reload: the other level stays, because it was opened once');
  await ctx.setOffline(false);
  // 📲 Download for offline play
  await page.evaluate(() => WR.go('home')); await page.click('#setBtn'); await page.waitForSelector('#offBtn');
  ok(/as you play/.test(await page.innerText('#offState')), 'Settings offers 📲 Download for offline play');
  await page.click('#offBtn'); await page.waitForFunction(() => /Ready for offline/.test((document.getElementById('offState') || {}).textContent || ''), null, { timeout: 60000 });
  const n = await page.evaluate(async () => { const k = (await caches.keys()).find(k => k.startsWith('wrart-')); return (await (await caches.open(k)).keys()).length; });
  ok(n >= ART.length, `after the download every picture is cached (${n}/${ART.length})`);
  const banked = await page.evaluate(async () => !!(await (await caches.open('wrdata')).match('data/c2/vocab.json')));
  ok(banked, 'download also saves the lesson banks');
  await page.evaluate(() => { const m = document.querySelector('.modal-bg'); if (m) m.remove(); });
  await ctx.setOffline(true);
  await page.evaluate(() => WR.startLesson({ realm: 'c2', skill: 'vocab', key: 'vocab', title: 'Far' }));
  await page.waitForSelector('.qtext', { timeout: 15000 });
  ok(true, 'offline: a realm never opened by hand works after Download');
  await ctx.setOffline(false);
  if (process.env.SHOT) await page.screenshot({ path: OUT + 'lightload_settings_offline.png' });
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2));
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
