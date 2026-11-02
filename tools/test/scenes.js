// 🎭 R19 wave 5 (REVIEW-2026-11-01): scene-style picture choice above A1 with the new feeling pictures (assets/scenes, type "scene",
// GenerateImage, not Higgsfield). Checks: the 18 cut pictures exist (PNG + WebP), load in the browser and are in the manifest with
// prompt/generated, and in the offline art list (sw.js ARTFILES); A2–C2 vocab banks each hold ≥ 5 scene questions; every one has 4
// different pictures, a why-not note per wrong picture, labels that never contain the target feeling word; the two ambiguous
// pictures (kitten hug, boy holding a gift) are never the right answer; each renders 4 painted pictures in a lesson at 375×667
// and shows the why-not note for a wrong tap.   node tools/test/scenes.js (game served on :18642). Screenshots: screenshots/scenes_*.png
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
let fails = 0, passes = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; if (process.env.VERBOSE) console.log('ok', m); } };
const ROOT = path.join(__dirname, '..', '..'), D = path.join(ROOT, 'data'), SHOTS = path.join(ROOT, 'screenshots');
const bank = (l, s) => JSON.parse(fs.readFileSync(`${D}/${l}/${s}.json`, 'utf8'));
const MAN = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/manifest.json'), 'utf8')).assets;
const SW = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const IDS = ['exhausted', 'puzzled', 'embarrassed', 'proud', 'furious', 'scared', 'disappointed', 'kitten_hug', 'bored',
  'excited', 'nervous', 'delighted', 'shy', 'frustrated', 'amazed', 'gift_hold', 'determined', 'lonely'].map(n => 'scene_' + n);
const FEEL = /\b(tired|bored|scared|proud|angry|shy|embarrass\w*|disappoint\w*|nervous|lonely|excit\w*|exhaust\w*|frustrat\w*|determin\w*|delight\w*|amaz\w*|bewilder\w*|crestfallen|elat\w*|exasperat\w*|weary|forlorn|awe\w*|resolute|mortif\w*|irate)\b/i;
// ---- art + manifest + offline list ----
const SC = MAN.filter(a => a.type === 'scene');
ok(SC.length === 18 && IDS.every(id => SC.some(a => a.id === id)), `18 scene pictures in the manifest (${SC.length})`);
for (const a of SC) {
  ok(fs.existsSync(path.join(ROOT, a.path)) && a.web && fs.existsSync(path.join(ROOT, a.web.small)), `${a.id}: PNG + WebP on disk`);
  ok(/GenerateImage/.test(a.generated) && /not Higgsfield/.test(a.generated) && a.prompt.length > 40 && a.transparent, `${a.id}: prompt + generated note`);
  ok(SW.includes(`'${a.web.small}'`), `${a.id}: in the offline art list`);
}
// ---- questions ----
const LV = ['a2', 'b1', 'b2', 'c1', 'c2'], P = {};
for (const l of LV) P[l] = bank(l, 'vocab').filter(q => q.type === 'picq' && Object.values(q.art || {}).some(r => r.startsWith('scene_')));
let total = 0;
for (const l of LV) {
  ok(P[l].length >= 5, `${l}: ${P[l].length} scene picture questions (≥ 5)`); total += P[l].length;
  for (const q of P[l]) {
    const tag = `${l} “${q.q.slice(0, 40)}”`, right = q.options[q.answer], wrong = q.options.filter((o, i) => i !== q.answer);
    ok(q.options.length === 4 && new Set(Object.values(q.art)).size === 4, `${tag}: 4 different pictures`);
    ok(q.art[right].startsWith('scene_') && !/kitten_hug|gift_hold/.test(q.art[right]), `${tag}: the right picture is a clear feeling scene`);
    ok(wrong.every(o => (q.notes[o] || '').length > 20) && q.explain.length > 20, `${tag}: why-not notes + explanation`);
    ok(q.options.every(o => !FEEL.test(o)), `${tag}: no feeling word in the option labels`);
  }
}
const allQ = LV.flatMap(l => bank(l, 'vocab').filter(q => q.type === 'picq').map(q => q.q));
ok(new Set(allQ).size === allQ.length, 'no duplicate picture questions across A2–C2');
ok(total >= 25, `${total} scene questions in all (≥ 25)`);
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await ctx.route(/supabase|jsdelivr|unpkg/, r => r.abort());
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.addInitScript(() => { window.__WR_TEST = { holdMs: 0, pinOffer: false };
    if (!localStorage.getItem('wordRealms.save.v1')) localStorage.setItem('wordRealms.save.v1', JSON.stringify({ v: 1, name: 'Tester', avatar: 'avatar_girl', startLevel: 'b1', stars: 10, pet: { species: 'pet_bunny', name: 'Bun', xp: 0, happiness: 80, hunger: 30, lastTick: Date.now() }, progress: {}, owned: [], equipped: {}, settings: { rate: 1.3, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 3 })); });
  await page.goto(BASE); await page.waitForTimeout(800);
  ok(await page.evaluate(ids => Promise.all(ids.map(id => new Promise(r => { const i = new Image(); i.onload = () => r(i.naturalWidth > 0); i.onerror = () => r(false); i.src = WR.src(id, 'auto'); }))).then(a => a.every(Boolean)), IDS), 'all 18 scene pictures load in the browser');
  let n = 0;
  for (const l of LV) for (const [k, raw] of P[l].entries()) {
    const tag = `${l} #${k + 1}`, right = k % 2 === 0;
    await page.evaluate(([l, raw]) => WR.startLesson({ realm: l, skill: 'vocab', key: 'vocab', title: 'Feelings', items: [WR.normalize(raw)] }), [l, raw]); await page.waitForTimeout(250);
    const opts = await page.$$('.opt.picopt'); ok(opts.length === 4, `${tag}: 4 picture buttons`);
    await page.waitForFunction(() => [...document.querySelectorAll('.opt.picopt img')].every(i => i.complete), null, { timeout: 4000 }).catch(() => {});
    ok(await page.$$eval('.opt.picopt img', ims => ims.length === 4 && ims.every(i => i.complete && i.naturalWidth > 0)), `${tag}: 4 pictures load`);
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(ov <= 0, `${tag}: no sideways overflow`);
    if (l === 'b1' && k === 0) await page.screenshot({ path: `${SHOTS}/scenes_b1_question.png` });
    const want = raw.options[raw.answer], miss = raw.options.find((o, i) => i !== raw.answer);
    for (const b of opts) if ((await b.getAttribute('aria-label')) === (right ? want : miss)) { await b.click(); break; }
    await page.waitForTimeout(200);
    const ex = await page.$eval('#explain', e => e.innerText);
    ok(right ? /Correct/.test(ex) : /Not quite/.test(ex) && ex.includes(raw.notes[miss]), `${tag}: ${right ? 'right' : 'wrong + why-not'} → ${ex.slice(0, 40).replace(/\n/g, ' ')}`);
    if (l === 'c1' && k === 1) { await page.$eval('#explain', e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300); await page.screenshot({ path: `${SHOTS}/scenes_c1_wrong_whynot.png` }); }
    n++;
  }
  ok(n === total, `played all ${n} scene questions`);
  ok(!errs.length, `no page errors ${errs.join(' | ')}`);
  await browser.close();
  console.log(`scenes.js: ${passes} passed, ${fails} failed`);
})();
