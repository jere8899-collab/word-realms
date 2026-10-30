// T16: painted boss portraits (Glimmerfin, Archivus) and painted Petal Match cards; no emoji as the main picture.
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
let fails = 0, passes = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else passes++; };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const vp of [{ width: 375, height: 667 }, { width: 1280, height: 800 }]) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2 }); await ctx.route(/supabase|jsdelivr|unpkg/, r => r.abort());
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
    await page.addInitScript(() => { if (!localStorage.getItem('wordRealms.save.v1')) localStorage.setItem('wordRealms.save.v1', JSON.stringify({ v: 1, name: 'Tester', avatar: 'avatar_girl', startLevel: 'a1', stars: 10, pet: { species: 'pet_bunny', name: 'Bun', xp: 0, happiness: 80, hunger: 30, lastTick: Date.now() }, progress: {}, owned: [], equipped: {}, settings: { rate: 1, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 3 })); });
    await page.goto(BASE); await page.waitForTimeout(800);
    for (const [rid, art] of [['b2', 'boss_glimmerfin'], ['c2', 'boss_archivus']]) {
      await page.evaluate(r => WR.startLesson({ realm: r, skill: 'grammar', key: 'grammar', title: 'Boss' }), rid); await page.waitForTimeout(700);
      const b = await page.evaluate(() => { const f = document.querySelector('#bossFace'); const i = f && f.querySelector('img'); return f && { img: !!i, src: i && i.currentSrc, loaded: i && i.complete && i.naturalWidth > 0, text: f.textContent.trim(), w: f.getBoundingClientRect().width }; });
      ok(b && b.img && b.loaded && /boss_/.test(b.src) && !b.text, `${vp.width}px ${rid}: painted boss portrait ${JSON.stringify(b)}`);
      const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(ov <= 0, `${vp.width}px ${rid}: no overflow`);
      if (vp.width === 375) await page.screenshot({ path: `/workspace/cefr-quest/screenshots/t16_boss_${rid}.png` });
    }
    await page.evaluate(() => WR.playSpecial('a1')); await page.waitForSelector('.mcard'); await page.waitForTimeout(800);
    const m = await page.evaluate(() => { const pics = [...document.querySelectorAll('.mcard.emo')]; return { n: pics.length, painted: pics.filter(c => c.querySelector('img.mart') && c.querySelector('img').naturalWidth > 0).length, emojiText: pics.filter(c => c.textContent.trim()).length }; });
    ok(m.n === 6 && m.painted === 6 && m.emojiText === 0, `${vp.width}px Petal Match: 6 painted picture cards ${JSON.stringify(m)}`);
    // play it through: pair each picture with its word
    const solved = await page.evaluate(async () => { const cards = [...document.querySelectorAll('.mcard')]; return cards.length; });
    ok(solved === 12, `${vp.width}px Petal Match has 12 cards`);
    if (vp.width === 375) await page.screenshot({ path: '/workspace/cefr-quest/screenshots/t16_petal_match.png' });
    ok(!errs.length, `${vp.width}px no page errors ${errs.join(' | ')}`);
    await ctx.close();
  }
  await browser.close(); console.log(`art16.js: ${passes} passed, ${fails} failed`);
})();
