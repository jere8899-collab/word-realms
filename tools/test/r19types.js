// 🧩 R19 (REVIEW-2026-11-01): every level's grammar, vocab and listening bank is at least ~a quarter non-multiple-choice
// (spell / order / mistake / gaps / dictate / listen-and-order), the new items are well formed, and multi-word word-bank
// tiles plus a C2 find-the-mistake play right and wrong on a 375 px phone.   node tools/test/r19types.js
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
let fails = 0, passes = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const D = path.join(__dirname, '..', '..', 'data'), SHOTS = path.join(__dirname, '..', '..', 'screenshots');
const bank = (l, s) => { const d = JSON.parse(fs.readFileSync(`${D}/${l}/${s}.json`, 'utf8')); const a = Array.isArray(d) ? d : d.passages || []; return a.flatMap(x => x.questions || [x]); };
const NEW = new Set(['order', 'spell', 'mistake', 'gaps', 'dictate', 'picq', 'events', 'tfng', 'heading', 'findword']);
const LV = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
for (const l of LV) for (const s of ['grammar', 'vocab', 'listening']) {
  const all = bank(l, s), n = all.filter(q => NEW.has(q.type || 'mcq')).length, pct = n / all.length;
  ok(pct >= 0.245, `${l} ${s}: ${Math.round(pct * 100)}% non-multiple-choice (${n}/${all.length})`);
}
for (const l of LV) for (const s of ['grammar', 'vocab']) for (const q of bank(l, s)) {
  if (q.type === 'mistake') { const w = q.words.slice(); w[q.wrong] = q.fix; const f = w.join(' ');
    if (/\b(\w+) \1\b/i.test(f)) ok(false, `${l} mistake fix reads oddly: ${f}`); }
  if (q.type === 'gaps' && new Set(q.bank).size !== q.bank.length) ok(false, `${l} gaps bank repeats a tile: ${q.text}`);
  if (q.type === 'spell' && !/^[a-z]+$/.test(q.answer)) ok(false, `${l} spell answer not plain letters: ${q.answer}`);
}
ok(true, 'mistake fixes read as one clean sentence, gaps banks are unique, spell answers are plain letters');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await ctx.route(/supabase|jsdelivr|unpkg/, r => r.abort());
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.addInitScript(() => { window.__WR_TEST = { holdMs: 0, pinOffer: false };
    if (!localStorage.getItem('wordRealms.save.v1')) localStorage.setItem('wordRealms.save.v1', JSON.stringify({ v: 1, name: 'Tester', avatar: 'avatar_girl', startLevel: 'b1', stars: 10, pet: { species: 'pet_bunny', name: 'Bun', xp: 0, happiness: 80, hunger: 30, lastTick: Date.now() }, progress: {}, owned: [], equipped: {}, settings: { rate: 1.3, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 3 })); });
  await page.goto(BASE); await page.waitForTimeout(800);
  const start = raw => page.evaluate(raw => WR.startLesson({ realm: 'b1', skill: 'grammar', key: 'grammar', title: 'R19', items: [WR.normalize(raw)] }), raw).then(() => page.waitForTimeout(250));
  const explain = () => page.$eval('#explain', e => e.innerText);
  const gi = bank('b1', 'grammar').find(q => q.type === 'gaps' && q.answers.includes('have visited'));
  ok(!!gi, 'B1 has a word-bank item with multi-word tiles');
  for (const right of [true, false]) {
    await start(gi);
    if (right) await page.screenshot({ path: `${SHOTS}/r19_gaps_multiword.png` });
    for (const w of (right ? gi.answers : gi.answers.slice().reverse())) for (const b of await page.$$('#pool .tile')) if ((await b.innerText()).trim() === w) { await b.click(); break; }
    ok(await page.$eval('#checkBtn', b => !b.disabled), `multi-word tiles fill the gaps (${right ? 'right' : 'wrong'} order)`);
    await page.click('#checkBtn'); await page.waitForTimeout(200);
    const ex = await explain(); ok(right ? /Correct/.test(ex) : /Not quite/.test(ex) && ex.includes('have visited'), `gaps ${right ? 'right' : 'wrong'} → ${ex.slice(0, 50).replace(/\n/g, ' ')}`);
  }
  const mi = bank('c2', 'grammar').find(q => q.type === 'mistake' && q.words[0] === 'Were');
  for (const right of [true, false]) {
    await start(mi);
    const ws = await page.$$('.mword'); await ws[right ? mi.wrong : 0].click(); await page.waitForTimeout(200);
    const ex = await explain(); ok(right ? /Correct/.test(ex) : /Not quite/.test(ex) && ex.includes(mi.fix), `C2 mistake ${right ? 'right' : 'wrong'} → ${ex.slice(0, 50).replace(/\n/g, ' ')}`);
    if (!right) await page.screenshot({ path: `${SHOTS}/r19_mistake_c2_wrong.png` });
  }
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(ov <= 0, 'no sideways overflow');
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
