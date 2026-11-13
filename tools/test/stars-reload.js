// ⭐ Quality fix 2 (2026-11-13): a sticker a round earns (the A1 "First Steps" sticker on a first round) is paid at the
// round's end, exactly once, so stars never change across a reload. Run: node tools/test/stars-reload.js (game on :18642, or BASE=…).
const { chromium } = require('playwright-core');
const { seedSave } = require('./_harness');
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const snap = p => p.evaluate(() => ({ stars: WR.state.stars, a1: (WR.state.stickers && WR.state.stickers.got.a1) || [], name: WR.state.name }));
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/supabase\.co/, r => r.abort());
  await ctx.addInitScript(() => { window.__WR_CLASSIC_ONLY = true; window.__WR_TEST = { holdMs: 0, pinOffer: false }; });
  const p = await ctx.newPage(); const errors = []; p.on('pageerror', e => errors.push(e.message));
  // a brand-new player: real onboarding, then a first A1 Vocabulary round
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.fill('#nm', 'Ivy'); await p.click('[data-av="avatar_mage"]'); await p.click('#n1');
  await p.click('[data-pet="pet_fox"]'); await p.click('#n2'); await p.click('[data-lv="a1"]'); await p.click('#go');
  await p.waitForSelector('.realm-node'); await p.waitForTimeout(800);
  const start = await snap(p);
  ok(!start.a1.includes('first'), 'a new player has no First Steps sticker yet');
  await p.evaluate(() => WR.startLesson({ realm: 'a1', skill: 'vocab', key: 'vocab', title: 'Vocabulary' }));
  for (let i = 0; i < 15; i++) {
    await p.waitForSelector('.opt, #pool, .result', { timeout: 10000 });
    if (await p.$('.result')) break;
    if (await p.$('#pool')) {
      const target = await p.evaluate(() => WR._dbg());
      for (const w of target.split(' ')) { for (const t of await p.$$('#pool .tile')) { if ((await t.textContent()) === w) { await t.click(); break; } } }
      await p.click('#checkBtn');
    } else {
      const correct = await p.evaluate(() => WR._dbg()); let clicked = false;
      for (const o of await p.$$('.opt')) { if ((await o.textContent()).slice(1) === correct) { await o.click(); clicked = true; break; } }
      if (!clicked) await (await p.$$('.opt'))[0].click();
    }
    await p.waitForSelector('#nextBtn'); await p.click('#nextBtn');
  }
  await p.waitForSelector('.result', { timeout: 10000 }); await p.waitForTimeout(600);
  const end = await snap(p);
  ok(end.a1.includes('first'), 'the First Steps sticker is given at the end of the first round (result screen)');
  ok(end.a1.filter(x => x === 'first').length === 1, 'the sticker is in the save once');
  await p.evaluate(() => WR.go('home')); await p.waitForSelector('.realm-node'); await p.waitForTimeout(500);
  const home = await snap(p);
  ok(home.stars === end.stars, `going back to the map changes no stars (${end.stars} → ${home.stars})`);
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForSelector('.realm-node'); await p.waitForTimeout(800);
  const r1 = await snap(p);
  ok(r1.stars === end.stars, `stars do not change across a reload (${end.stars} → ${r1.stars})`);
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForSelector('.realm-node'); await p.waitForTimeout(800);
  ok((await snap(p)).stars === end.stars, 'still the same after a second reload');
  // an old save that already holds the sticker is never paid again
  const old = await p.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')));
  old.name = 'OldIvy'; old.stars = 50;
  await seedSave(p, URL, old); await p.waitForSelector('.realm-node'); await p.waitForTimeout(800);
  ok((await snap(p)).stars === 50, 'an old save with the sticker keeps its 50 stars on load (no double pay)');
  // an old save from before the fix (round played, sticker not yet paid) is paid once on its first load, then stays
  const pre = JSON.parse(JSON.stringify(old)); pre.name = 'PreIvy'; pre.stars = 50; pre.stickers.got.a1 = pre.stickers.got.a1.filter(x => x !== 'first');
  await seedSave(p, URL, pre); await p.waitForSelector('.realm-node'); await p.waitForTimeout(800);
  const paid = await snap(p);
  ok(paid.stars === 52 && paid.a1.includes('first'), `an old unpaid save gets its sticker once (+2, ${paid.stars})`);
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForSelector('.realm-node'); await p.waitForTimeout(800);
  ok((await snap(p)).stars === 52, 'and it is not paid again on the next reload');
  ok(errors.length === 0, 'no page errors ' + errors.join(' | '));
  await b.close();
  console.log(fails ? `stars-reload: ${fails} failed` : 'stars-reload: all ok');
})().catch(e => { console.error('FAILED', e); process.exit(1); });
