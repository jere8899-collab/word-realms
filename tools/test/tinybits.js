// R12 + R13 (REVIEW-2026-11-01): the ☁️ Cloud chip is visible (≥ 3:1 outline on the chip and the cloud), and story glossary
// words have a ≥ 40 px tall tap area with the line height unchanged.   node tools/test/tinybits.js   (SHOT=1)
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = { v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'a1', stars: 40, totalCorrect: 12, totalAnswered: 14,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 30, happiness: 70, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 2, last: today() }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 12 };
const PROFILES = [['se1', 320, 568], ['se', 375, 667], ['pixel', 393, 851], ['promax', 430, 932]];
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const [name, W, H] of PROFILES) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto(BASE + 'index.html'); await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), SAVE);
    await page.reload(); await page.waitForSelector('#cloudChip .wr-icon, #cloudChip'); await page.waitForTimeout(600);
    // R12: contrast of the chip outline and the cloud's outline against the chip background
    const c = await page.evaluate(() => {
      const lum = s => { const m = s.match(/[\d.]+/g).map(Number).slice(0, 3).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * m[0] + .7152 * m[1] + .0722 * m[2]; };
      const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
      const chip = document.getElementById('cloudChip'), cs = getComputedStyle(chip), bgStops = (cs.backgroundImage.match(/rgba?\([^)]+\)/g) || [cs.backgroundColor]);
      const ic = chip.querySelector('.wr-icon'), f = ic ? getComputedStyle(ic).filter : '', fc = (f.match(/rgba?\([^)]+\)/) || [])[0];
      return { border: parseFloat(cs.borderTopWidth), bRatio: Math.min(...bgStops.map(b => ratio(cs.borderTopColor, b))), iRatio: fc ? Math.min(...bgStops.map(b => ratio(fc, b))) : 0, hasIcon: !!ic };
    });
    ok(c.border >= 1.5 && c.bRatio >= 3, `R12 ${name}: Cloud chip outline ${c.border}px at ${c.bRatio.toFixed(2)}:1 against the chip (≥ 3:1)`);
    ok(!c.hasIcon || c.iRatio >= 3, `R12 ${name}: the white cloud has a ${c.iRatio.toFixed(2)}:1 outline (≥ 3:1)`);
    if (process.env.SHOT && W === 375) { const b = await page.$('.topbar'); await b.screenshot({ path: OUT + 'tinybits_cloud_chip.png' }); }
    // R13: glossary words in the A1 story
    await page.evaluate(() => WR.startStory('a1')); await page.waitForSelector('.gloss'); await page.waitForTimeout(500);
    const g = await page.evaluate(() => {
      const out = []; for (const b of [...document.querySelectorAll('.gloss')].slice(0, 6)) {
        b.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
        const hitUp = document.elementFromPoint(x, y - 19), hitDn = document.elementFromPoint(x, y + 19);
        out.push({ w: b.textContent, h: Math.round(r.height), up: !!(hitUp && hitUp.closest('.gloss') === b), dn: !!(hitDn && hitDn.closest('.gloss') === b), lh: getComputedStyle(b.closest('p') || b.parentElement).lineHeight });
      } return out; });
    ok(g.length > 0 && g.every(x => x.up && x.dn), `R13 ${name}: every glossary word answers taps 19 px above and below its middle (≥ 38–44 px tall) ${JSON.stringify(g.filter(x => !(x.up && x.dn)).map(x => x.w))}`);
    ok(g.every(x => x.h <= 34), `R13 ${name}: the word box itself is unchanged, so the line height stays (${g.map(x => x.h)})`);
    if (process.env.SHOT && W === 375) await page.screenshot({ path: OUT + 'tinybits_story_gloss.png' });
    ok(errs.length === 0, `${name}: no page errors ${errs.slice(0, 2)}`);
    await ctx.close();
  }
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
