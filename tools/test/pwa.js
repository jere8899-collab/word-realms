// T17: installable PWA + offline after one visit; a new deploy (new sw.js version) replaces the old cache.
const { chromium } = require('playwright-core');
const fs = require('fs');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
let fails = 0, passes = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
(async () => {
  const man = JSON.parse(fs.readFileSync(__dirname + '/../../manifest.webmanifest', 'utf8'));
  ok(man.name && man.start_url && man.display === 'standalone' && man.icons.some(i => i.sizes === '512x512') && man.icons.some(i => i.purpose === 'maskable'), 'manifest: name, start_url, standalone, 512 + maskable icons');
  const sw = fs.readFileSync(__dirname + '/../../sw.js', 'utf8');
  ok(/const VERSION = "wr-[0-9a-f]{12}"/.test(sw), 'sw.js has a content-hash cache version');
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  await ctx.route(/supabase|jsdelivr|unpkg/, r => r.abort());
  await ctx.addInitScript(() => { window.__WR_SW = true; if (!localStorage.getItem('wordRealms.save.v1')) localStorage.setItem('wordRealms.save.v1', JSON.stringify({ v: 1, name: 'Offline Olly', avatar: 'avatar_girl', startLevel: 'a1', stars: 10, pet: { species: 'pet_bunny', name: 'Bun', xp: 0, happiness: 80, hunger: 30, lastTick: Date.now() }, progress: {}, owned: [], equipped: {}, settings: { rate: 1, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 3 })); });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto(BASE); await page.waitForSelector('.realm-node');
  ok(await page.evaluate(() => !!document.querySelector('link[rel=manifest]')), 'index.html links the manifest');
  const ready = await page.evaluate(async () => { const r = await navigator.serviceWorker.ready; return !!r.active; });
  ok(ready, 'service worker installed and active');
  await page.waitForFunction(async () => { const ks = await caches.keys(); if (!ks.length) return false; const c = await caches.open(ks[0]); return (await c.keys()).length > 100; }, null, { timeout: 30000 });
  const cached = await page.evaluate(async () => { const ks = await caches.keys(); const c = await caches.open(ks[0]); return { keys: ks, n: (await c.keys()).length }; });
  ok(cached.keys.length === 1 && cached.keys[0].startsWith('wr-') && cached.n > 100, `precache filled (${cached.keys} · ${cached.n} files)`);
  await page.reload(); await page.waitForSelector('.realm-node');
  ok(await page.evaluate(() => !!navigator.serviceWorker.controller), 'page is controlled by the service worker after reload');
  // offline: the app opens, a lesson and its data load
  await ctx.setOffline(true);
  await page.reload(); await page.waitForSelector('.realm-node', { timeout: 15000 });
  ok(true, 'offline: home map opens');
  await page.evaluate(() => WR.startLesson({ realm: 'a2', skill: 'vocab', key: 'vocab', title: 'Offline' }));
  await page.waitForSelector('.opt, #pool .tile, .qtext', { timeout: 15000 });
  ok(await page.evaluate(() => !!document.querySelector('.qtext')), 'offline: an A2 vocab lesson opens with its data');
  const imgs = await page.evaluate(() => [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.src.includes('/assets/')).map(i => i.src));
  ok(imgs.length === 0, `offline: no broken art (${imgs.join(', ')})`);
  await page.screenshot({ path: __dirname + '/../../screenshots/t17_offline_lesson.png' });
  await ctx.setOffline(false);
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await browser.close(); console.log(`pwa.js: ${passes} passed, ${fails} failed`);
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
