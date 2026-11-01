// 🖼️ R19 wave 4 (REVIEW-2026-11-01): picture choice (picq) above A1. A2–C2 vocab banks each hold ≥ 12 picture questions built
// from the game's own painted art (icons, accessories, heroes, pets, word pictures). Options are labels of what each picture shows,
// mapped to art by `art`; every wrong picture has a why-not note; the right label never repeats the question word for word.
// Plays right and wrong at 375×667 and 320×658 for every level (4 pictures load, no overflow, taps ≥ 40 px, why-not shown),
// checks the art is in the offline art list (sw.js ARTFILES), a missed picture question comes back from the Mistake Garden with
// its pictures, normal B1 vocab lessons can serve it, and A1 picture questions still render the painted words.   node tools/test/picq2.js
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
let fails = 0, passes = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; if (process.env.VERBOSE) console.log('ok', m); } };
const ROOT = path.join(__dirname, '..', '..'), D = path.join(ROOT, 'data'), SHOTS = path.join(ROOT, 'screenshots');
const bank = (l, s) => JSON.parse(fs.readFileSync(`${D}/${l}/${s}.json`, 'utf8'));
const MAN = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/manifest.json'), 'utf8')).assets;
const SW = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const artFile = ref => { const m = ref.match(/^(icon|acc):(.+)$/); if (m) return `assets/${m[1] === 'icon' ? 'icons' : 'acc'}/${m[2]}.webp`;
  const a = MAN.find(x => x.id === ref) || MAN.find(x => x.id === 'word_' + ref); return a && a.web ? a.web.small : null; };
const LV = ['a2', 'b1', 'b2', 'c1', 'c2'];
const P = {}; for (const l of LV) P[l] = bank(l, 'vocab').filter(q => q.type === 'picq');
// ---- data ----
for (const l of LV) {
  const items = P[l]; ok(items.length >= 12, `${l}: ${items.length} picture questions (≥ 12)`);
  for (const q of items) {
    const tag = `${l} “${q.q.slice(0, 40)}”`, right = q.options[q.answer], wrong = q.options.filter((o, i) => i !== q.answer);
    ok(q.options.length === 4 && new Set(q.options).size === 4 && q.art && Object.keys(q.art).sort().join('|') === q.options.slice().sort().join('|'), `${tag}: 4 labels, each mapped to a picture`);
    ok(new Set(Object.values(q.art)).size === 4, `${tag}: 4 different pictures`);
    ok(Object.values(q.art).every(r => { const f = artFile(r); return f && fs.existsSync(path.join(ROOT, f)) && SW.includes(`'${f}'`); }), `${tag}: every picture exists and is in the offline art list`);
    ok(wrong.every(o => (q.notes[o] || '').length > 20) && !q.notes[right] && q.explain.length > 20, `${tag}: a why-not note for every wrong picture + an explanation`);
    ok(!q.q.toLowerCase().includes(right.toLowerCase()), `${tag}: the right label isn't copied from the question`);
  }
  const qs = items.map(q => q.q); ok(new Set(qs).size === qs.length, `${l}: no repeated questions`);
}
ok(LV.every(l => !P[l].some(q => /\b(kill|blood|drunk|beer|wine|dating|gun)\b/i.test(q.q + q.explain + JSON.stringify(q.notes)))), 'kid-friendly wording at every level');
ok(bank('a1', 'vocab').filter(q => q.type === 'picq').every(q => !q.art), 'A1 picture questions keep their painted-word options');
const vis = () => { const out = []; document.querySelectorAll('.qcard button').forEach(e => { const r = e.getBoundingClientRect(); if (r.width > 1 && Math.min(r.width, r.height) < 39.5) out.push((e.className || e.id) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }); return out; };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const vp of [{ width: 375, height: 667 }, { width: 320, height: 658 }]) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await ctx.route(/supabase|jsdelivr|unpkg/, r => r.abort());
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
    await page.addInitScript(() => { window.__WR_TEST = { holdMs: 0, pinOffer: false };
      if (!localStorage.getItem('wordRealms.save.v1')) localStorage.setItem('wordRealms.save.v1', JSON.stringify({ v: 1, name: 'Tester', avatar: 'avatar_girl', startLevel: 'b1', stars: 10, pet: { species: 'pet_bunny', name: 'Bun', xp: 0, happiness: 80, hunger: 30, lastTick: Date.now() }, progress: {}, owned: [], equipped: {}, settings: { rate: 1.3, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 3 })); });
    await page.goto(BASE); await page.waitForTimeout(800);
    const tag = `${vp.width}px`;
    const start = (lvl, raw) => page.evaluate(([l, raw]) => WR.startLesson({ realm: l, skill: 'vocab', key: 'vocab', title: 'Pictures', items: [WR.normalize(raw)] }), [lvl, raw]).then(() => page.waitForTimeout(300));
    for (const l of ['a1', ...LV]) {
      const pool = l === 'a1' ? bank('a1', 'vocab').filter(q => q.type === 'picq') : P[l];
      for (const right of [true, false]) {
        const raw = pool[(right ? 1 : 2) + (vp.width === 320 ? 3 : 0)];
        await start(l, raw);
        const opts = await page.$$('.opt.picopt'); ok(opts.length === 4, `${tag} ${l}: 4 picture buttons`);
        await page.waitForFunction(() => [...document.querySelectorAll('.opt.picopt img')].every(i => i.complete), null, { timeout: 4000 }).catch(() => {});
        ok(await page.$$eval('.opt.picopt img', ims => ims.length === 4 && ims.every(i => i.complete && i.naturalWidth > 0)), `${tag} ${l}: 4 painted pictures load`);
        ok(await page.$$eval('.opt.picopt', bs => bs.every(b => !b.innerText.trim())), `${tag} ${l}: the pictures carry no printed answer text`);
        const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(ov <= 0, `${tag} ${l}: no sideways overflow (${ov})`);
        const small = await page.evaluate(vis); ok(!small.length, `${tag} ${l}: tap targets ≥ 40 px ${small.join(', ')}`);
        const want = raw.options[raw.answer], miss = raw.options.find((o, i) => i !== raw.answer);
        if (vp.width === 375 && right && l === 'b1') await page.screenshot({ path: `${SHOTS}/picq2_b1_question.png` });
        for (const b of opts) if ((await b.getAttribute('aria-label')) === (right ? want : miss)) { await b.click(); break; }
        await page.waitForTimeout(200);
        const ex = await page.$eval('#explain', e => e.innerText);
        ok(right ? /Correct/.test(ex) : /Not quite/.test(ex), `${tag} ${l} ${right ? 'right' : 'wrong'} → ${ex.slice(0, 50).replace(/\n/g, ' ')}`);
        if (!right && l !== 'a1') ok(ex.includes(miss) && ex.includes(raw.notes[miss]), `${tag} ${l}: the why-not note for the picked picture shows`);
        ok(await page.$eval('.opt.picopt.right', b => b.getAttribute('aria-label')) === want, `${tag} ${l}: the right picture is highlighted`);
        if (vp.width === 375 && !right && l === 'c1') { await page.$eval('#explain', e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(400); await page.screenshot({ path: `${SHOTS}/picq2_c1_wrong_whynot.png` }); }
      }
    }
    // the Mistake Garden re-asks a missed picture question with its pictures
    const g = await page.evaluate(() => { const m = WR.state.mistakes.find(x => x.raw && x.raw.type === 'picq' && x.raw.art); if (!m) return null; const it = WR.Garden.roundItems(50).find(i => i._mid === m.id); return it && { type: it.type, art: !!it.art, n: it.options.length }; });
    ok(g && g.type === 'picq' && g.art && g.n === 4, `${tag} garden re-serves a picture question with its art (${JSON.stringify(g)})`);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).mistakes.some(m => m.raw && m.raw.art));
    ok(saved, `${tag} the missed picture question is kept in wordRealms.save.v1 (cloud-synced)`);
    if (g) { await page.evaluate(() => { const m = WR.state.mistakes.find(x => x.raw && x.raw.type === 'picq' && x.raw.art); return WR.startLesson({ realm: 'b1', skill: 'vocab', key: 'vocab', title: 'Garden', items: [WR.normalize(m.raw)] }); }); await page.waitForTimeout(400);
      ok(await page.$$eval('.opt.picopt img', ims => ims.length === 4 && ims.every(i => i.complete && i.naturalWidth > 0)), `${tag} garden picture question shows 4 pictures`); }
    const mix = await page.evaluate(async () => { for (let i = 0; i < 25; i++) if ((await WR.buildItems('b1', 'vocab', 8)).some(x => x.type === 'picq')) return true; return false; });
    ok(mix, `${tag} normal B1 vocab lessons can serve picture questions`);
    ok(!errs.length, `${tag} no page errors ${errs.join(' | ')}`);
    await ctx.close();
  }
  await browser.close();
  console.log(`picq2.js: ${passes} passed, ${fails} failed`);
})();
