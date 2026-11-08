// First visit stays light, another level is saved once opened, a reload keeps it, a failed
// fetch is kind, and an old precache is copied into wrdata. Phones: 320, 360, 375 and landscape.
//   node tools/test/firstload.js   (SHOT=1 writes screenshots/firstload_*.png)
const { chromium } = require('playwright-core');
const fs = require('fs'), path = require('path');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = path.join(__dirname, '..', '..', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = { v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'a1', stars: 40, totalCorrect: 2, totalAnswered: 3, bonusSeen: ['sp'],
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 30, happiness: 70, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 1, last: today() }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 2 };
const sw = fs.readFileSync(path.join(__dirname, '..', '..', 'sw.js'), 'utf8');
const install = sw.split('addEventListener("install"')[1].split('addEventListener("activate"')[0];
ok(/skipWaiting\(\)/.test(install) && !/put\(VERSION/.test(install) && !/SHELL\.concat\(DATA\)/.test(install), 'install does not download the shell or the lesson banks');
ok(/const BANK = "wrdata"/.test(sw) && /keepData/.test(sw), 'banks live in wrdata and are copied out of the old shell cache');
ok(/WR\.noAssist/.test(fs.readFileSync(path.join(__dirname, '..', '..', 'js/core.js'), 'utf8')), 'typing still goes through WR.noAssist');

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const views = [
    { w: 320, h: 700, name: '320' },
    { w: 360, h: 740, name: '360' },
    { w: 375, h: 667, name: '375' },
    { w: 700, h: 360, name: 'land' }
  ];
  for (const v of views) {
    const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: 2, isMobile: v.w < 500, hasTouch: true });
    await ctx.addInitScript(s => { localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); window.__WR_CLASSIC_ONLY = true; }, SAVE);
    await ctx.route(/supabase\.co|cdn\.jsdelivr\.net|fonts\.googleapis|fonts\.gstatic/, r => r.abort());
    const page = await ctx.newPage(); const errs = []; const logs = [];
    page.on('pageerror', e => errs.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') logs.push(m.text()); });
    await page.goto(BASE); await page.waitForSelector('.realm-node'); await page.waitForTimeout(400);
    const home = await page.evaluate(() => ({
      wide: document.documentElement.scrollWidth > window.innerWidth + 1,
      nodes: document.querySelectorAll('.realm-node').length
    }));
    ok(!home.wide && home.nodes >= 1, `${v.name}: home fits the width (${v.w}×${v.h})`);
    if (process.env.SHOT) await page.screenshot({ path: path.join(OUT, `firstload_${v.name}_home.png`) });
    await page.evaluate(() => WR.startLesson({ realm: 'a1', skill: 'vocab', key: 'vocab', title: 'Words' }));
    await page.waitForSelector('.opt, .qtext', { timeout: 15000 });
    const lesson = await page.evaluate(() => {
      const opts = [...document.querySelectorAll('.opt')];
      const box = r => { const b = r.getBoundingClientRect(); return { w: b.width, h: b.height, l: b.left, r: b.right }; };
      const wide = document.documentElement.scrollWidth > window.innerWidth + 1;
      const small = opts.filter(el => { const b = box(el); return b.w > 0 && (b.w < 44 || b.h < 44); }).length;
      const cut = opts.filter(el => { const b = box(el); return b.w > 0 && (b.l < -1 || b.r > window.innerWidth + 1); }).length;
      const typed = [...document.querySelectorAll('input, textarea')].filter(el => el.getAttribute('autocorrect') !== 'off');
      return { n: opts.length, small, cut, wide, typed: typed.length };
    });
    ok(lesson.n >= 2 && lesson.small === 0 && lesson.cut === 0 && !lesson.wide, `${v.name}: answers on screen, tap targets ≥ 44 (${lesson.n} options)`);
    ok(lesson.typed === 0, `${v.name}: typing fields keep autocorrect off`);
    if (process.env.SHOT) await page.screenshot({ path: path.join(OUT, `firstload_${v.name}_lesson.png`) });
    ok(errs.length === 0, `${v.name}: no page errors ${errs.slice(0, 2).join(' | ')}`);
    const noisy = logs.filter(t => !/fonts\.|gstatic|favicon|net::ERR_FAILED/.test(t));
    ok(noisy.length === 0, `${v.name}: no console errors ${noisy.slice(0, 2).join(' | ')}`);
    await ctx.close();
  }

  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript(s => { localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); window.__WR_CLASSIC_ONLY = true; }, SAVE);
  await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto(BASE); await page.waitForSelector('.realm-node');
  await page.evaluate(() => navigator.serviceWorker.ready);
  // another level, then a reload with no network
  await page.evaluate(() => WR.startLesson({ realm: 'a2', skill: 'grammar', key: 'grammar', title: 'A2' }));
  await page.waitForSelector('.qtext', { timeout: 15000 });
  await ctx.setOffline(true);
  await page.reload(); await page.waitForSelector('.realm-node', { timeout: 15000 });
  await page.evaluate(() => WR.startLesson({ realm: 'a2', skill: 'grammar', key: 'grammar', title: 'A2 again' }));
  await page.waitForSelector('.qtext', { timeout: 15000 });
  ok(true, 'reload offline: the level that was opened still plays');
  await page.evaluate(() => WR.go('home')); await page.waitForSelector('.realm-node');
  const missed = await page.evaluate(async () => {
    const stars = WR.state.stars;
    await WR.startLesson({ realm: 'b2', skill: 'vocab', key: 'vocab', title: 'B2' });
    return { toast: (document.querySelector('.toast') || {}).textContent || '', q: !!document.querySelector('.qtext'), stars, now: WR.state.stars };
  });
  ok(/isn't on this device yet/.test(missed.toast) && !missed.q && missed.stars === missed.now, 'poor connection: a missing bank is a kind note and the stars stay');
  await ctx.setOffline(false);
  await ctx.route('**/data/c1/listening.json', r => r.abort());
  await page.evaluate(() => WR.go('home'));
  const poor = await page.evaluate(async () => {
    await WR.startLesson({ realm: 'c1', skill: 'listening', key: 'listening', title: 'C1' });
    return { toast: (document.querySelector('.toast') || {}).textContent || '', q: !!document.querySelector('.qtext') };
  });
  ok(/isn't on this device yet/.test(poor.toast) && !poor.q, 'a blocked bank does not open a broken lesson');
  await ctx.unroute('**/data/c1/listening.json');
  // an update must keep banks that the previous precache already stored
  const adopted = await page.evaluate(async () => {
    const old = await caches.open('wr-legacy000000');
    await old.put('data/zz/seed.json', new Response('{"seeded":1}', { headers: { 'Content-Type': 'application/json' } }));
    const reg = await navigator.serviceWorker.ready;
    const n = await new Promise(res => {
      const on = e => { if (e.data && e.data.type === 'adopted') { navigator.serviceWorker.removeEventListener('message', on); res(e.data.n); } };
      navigator.serviceWorker.addEventListener('message', on);
      reg.active.postMessage({ type: 'adopt' });
      setTimeout(() => res(-1), 8000);
    });
    const hit = await (await caches.open('wrdata')).match('data/zz/seed.json');
    const body = hit ? await hit.json() : null;
    await caches.delete('wr-legacy000000');
    return { n, body };
  });
  ok(adopted.n >= 1 && adopted.body && adopted.body.seeded === 1, `old precache copied into wrdata (${adopted.n})`);
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2).join(' | '));
  if (process.env.SHOT) await page.screenshot({ path: path.join(OUT, 'firstload_after_reload.png') });
  await browser.close();
  console.log(`\n${passes} passed, ${fails} failed`);
})().catch(e => { console.error(e); process.exit(1); });
