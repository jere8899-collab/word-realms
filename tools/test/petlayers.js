// 🎩 Layered looks on pets (WR.layerSVG): for every pet and every evolution stage, at every size the game shows a pet
// (map card, pet screen, phone lesson companion, shop preview, garden), a hat/crown layer must sit on the head:
// its bottom edge stays above the face (anchor faceTop) and it stays centred over the art. Also: an evolved pet
// shows its crown layer, a baby one doesn't.  SHOT=before|after → screenshots/petlayers_<shot>_<screen>.png of
// Royal Puffbun; BASE=… CHECK=0 for "before" shots of the live site.
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const SHOT = process.env.SHOT || '', CHECK = process.env.CHECK !== '0';
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else if (process.env.VERBOSE) console.log('ok', m); };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const save = (species, xp) => ({ v: 1, name: 'Jeremy', avatar: 'avatar_girl', startLevel: 'a1', stars: 60, totalCorrect: 60, totalAnswered: 65,
  pet: { species, name: 'Puffbun', xp, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 2, last: today() }, progress: { a1: { grammar: { best: 0.9, plays: 1 } } }, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 6 });
// in the page: every visible pet with a head layer — is the layer's bottom above the face line of its own art?
const audit = () => [...document.querySelectorAll('.petwrap')].filter(w => w.getBoundingClientRect().width > 4).map(w => {
  const img = w.querySelector(':scope > img'), r = img.getBoundingClientRect(), s = Math.min(r.width, r.height);
  const ox = r.left + (r.width - s) / 2, oy = r.top + (r.height - s) / 2, a = WR.anchorFor(w.dataset.art);
  const hats = [...w.querySelectorAll('image.layer.head')].map(h => h.getBoundingClientRect());
  // nothing (speech bubble, chips, toasts) may sit on top of the crown — sample its centre and its top quarter
  const hidden = hats.filter(h => [[.5, .5], [.5, .3]].some(([fx, fy]) => { const e = document.elementFromPoint(h.left + h.width * fx, h.top + h.height * fy); return e && e.closest('.bubble,.pill,.toast'); })).length;
  return { art: w.dataset.art, size: Math.round(s), hats: hats.length, bad: hats.filter(h => h.bottom > oy + s * a.faceTop / 100 + 0.5 || Math.abs((h.left + h.right) / 2 - (ox + s * a.head[0] / 100)) > s * 0.05 || h.top < oy - s * 0.4).length,
    hidden, where: w.parentElement.id || w.parentElement.className };
});
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const sizes = [{ name: 'phone', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, { name: 'desktop', viewport: { width: 1180, height: 820 } }];
  const pets = process.env.PETS ? process.env.PETS.split(',') : null;
  for (const S of sizes) {
    const ctx = await browser.newContext(S); await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto(BASE + 'index.html');
    const species = pets || await page.evaluate(() => WR.PETS.map(p => p.id));
    for (const sp of species) for (const [stage, xp] of [[0, 10], [1, 400], [2, 800]]) {
      await page.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, save('pet_' + sp.replace(/^pet_/, ''), xp));
      await page.reload({ waitUntil: 'networkidle' }); await page.waitForSelector('.realm-node');
      const shots = SHOT && S.name === 'phone' && sp.replace(/^pet_/, '') === 'bunny' && stage === 2;
      const look = async label => {
        await page.waitForTimeout(500);
        if (shots) await page.screenshot({ path: `${OUT}petlayers_${SHOT}_${label}.png` });
        if (!CHECK) return;
        const res = await page.evaluate(audit);
        ok(res.length > 0, `${S.name} ${sp} stage ${stage} ${label}: a pet is shown`);
        for (const r of res) {
          ok(stage === 2 ? r.hats === 1 : r.hats === 0, `${S.name} ${sp} stage ${stage} ${label} (${r.where}, ${r.size}px): ${stage === 2 ? 'evolved pet wears its crown' : 'no crown before the last stage'} (${r.hats})`);
          ok(r.hidden === 0, `${S.name} ${sp} stage ${stage} ${label} (${r.where}): nothing covers the crown`);
          ok(r.bad === 0, `${S.name} ${sp} stage ${stage} ${label} (${r.where}, ${r.size}px): the crown sits on the head, above the face`);
        }
      };
      await look('map');
      await page.evaluate(() => WR.go('pet')); await look('pet');
      await page.evaluate(() => WR.go('shop')); await look('shop');
      await page.evaluate(() => WR.go('realm', 'a1')); await page.waitForSelector('[data-k="vocab"]');
      await page.click('[data-k="vocab"]'); await page.waitForSelector('.opt', { timeout: 8000 }); await look('lesson');
      if (shots) { const el = await page.$('#lpet'); if (el) await el.screenshot({ path: `${OUT}petlayers_${SHOT}_lesson_pet.png` }); }
    }
    if (CHECK) ok(errs.length === 0, `${S.name}: no page errors ${errs.join(' | ')}`);
    await ctx.close();
  }
  await browser.close();
  console.log(fails ? `${fails} FAILED` : 'petlayers: all ok');
})();
