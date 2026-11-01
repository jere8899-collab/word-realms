// 📖 R19 wave 3 (REVIEW-2026-11-01): B2–C2 reading gets the new reading types (events in order, True/False/Not given with
// notes quoting the line, find the word) plus match-the-headings on multi-paragraph texts. Checks the banks, then plays
// headings right and wrong, a C1 events item and a C2 Not given item on a 375 px phone, and the garden re-ask.   node tools/test/r19read2.js
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
let fails = 0, passes = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const D = path.join(__dirname, '..', '..', 'data'), SHOTS = path.join(__dirname, '..', '..', 'screenshots');
const NEW = new Set(['events', 'tf', 'findword', 'headings']);
const rq = l => JSON.parse(fs.readFileSync(`${D}/${l}/reading.json`, 'utf8')).passages.flatMap(p => p.questions.map(q => ({ q, p })));
const bare = w => w.toLowerCase().replace(/[^a-z0-9'-]/g, '');
for (const l of ['b2', 'c1', 'c2']) {
  const all = rq(l), n = all.filter(x => NEW.has(x.q.type)).length;
  ok(n / all.length >= 0.245, `${l} reading: ${Math.round(n * 100 / all.length)}% new reading types (${n}/${all.length})`);
  for (const t of NEW) ok(all.some(x => x.q.type === t), `${l} has ${t} items`);
  const tfs = all.filter(x => x.q.type === 'tf');
  ok(tfs.every(({ q }) => q.options.join('/') === 'True/False/Not given'), `${l}: True/False/Not given options`);
  ok(tfs.some(({ q }) => q.answer === 2), `${l}: some answers are Not given`);
  ok(tfs.every(({ q, p }) => q.options.every((o, i) => i === q.answer || (q.notes[o] || '').length > 15) && (q.answer === 2 || (p.text.includes(q.line) && Object.values(q.notes).every(n => n.includes(q.line))))), `${l}: every wrong True/False pick has a note, True/False notes quote the exact line`);
  ok(all.filter(x => x.q.type === 'findword').every(({ q, p }) => p.text.includes(q.line) && q.line.split(/\s+/).map(bare).filter(w => w === q.answer).length === 1), `${l}: find-the-word lines come from the text and hold the word once`);
  const hs = all.filter(x => x.q.type === 'headings');
  ok(hs.every(({ q, p }) => { const paras = p.text.split('\n\n'); const h = q.headings.concat(q.extra); return paras.length === q.headings.length && q.extra.length === 1 && new Set(h).size === h.length && h.every(x => (q.notes[x] || '').length > 20); }),
    `${l}: headings match the paragraph count, one extra, a note for every heading`);
}
ok(['a1', 'a2', 'b1'].every(l => !rq(l).some(x => x.q.type === 'headings')), 'match-the-headings stays B2 and up');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await ctx.route(/supabase|jsdelivr|unpkg/, r => r.abort());
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.addInitScript(() => { window.__WR_TEST = { holdMs: 0, pinOffer: false };
    if (!localStorage.getItem('wordRealms.save.v1')) localStorage.setItem('wordRealms.save.v1', JSON.stringify({ v: 1, name: 'Tester', avatar: 'avatar_girl', startLevel: 'b2', stars: 10, pet: { species: 'pet_bunny', name: 'Bun', xp: 0, happiness: 80, hunger: 30, lastTick: Date.now() }, progress: {}, owned: [], equipped: {}, settings: { rate: 1.3, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 3 })); });
  await page.goto(BASE); await page.waitForTimeout(800);
  const explain = () => page.$eval('#explain', e => e.innerText);
  const startR = (lvl, f) => page.evaluate(([lvl, src]) => WR.bank(lvl, 'reading').then(b => { const f = new Function('q', 'return ' + src); const p = b.passages.find(p => p.questions.some(f));
    const q = p.questions.find(f); return WR.startLesson({ realm: lvl, skill: 'reading', key: 'reading', title: 'Reading', items: [WR.normalize(q, p)] }).then(() => q); }), [lvl, f]).then(async q => { await page.waitForTimeout(250); return q; });
  const tap = async w => { for (const b of await page.$$('#pool .tile')) if ((await b.innerText()).trim() === w) { await b.click(); return true; } return false; };
  for (const right of [true, false]) {
    const q = await startR('b2', "q.type === 'headings'");
    const pn = await page.$$eval('.passage .para .pn', n => n.map(x => x.textContent).join(''));
    ok(pn === '1234', `headings: the text shows numbered paragraphs (${pn})`);
    if (right) { await page.screenshot({ path: `${SHOTS}/r19_headings_b2.png` }); }
    ok((await page.$$('#pool .tile')).length === q.headings.length + 1, 'headings: the pool has one heading per paragraph plus one extra');
    const want = right ? q.headings : [q.extra[0], ...q.headings.slice(1)];
    for (const h of want) await tap(h);
    ok(await page.$eval('#checkBtn', b => !b.disabled), 'headings: Check is ready once every paragraph has a heading (extra left over)');
    ok(!(await tap(right ? q.extra[0] : q.headings[0])) || (await page.$$('#built .tile')).length === q.headings.length, 'headings: no more than one heading per paragraph');
    if (right) { await page.$eval('#checkBtn', b => b.scrollIntoView({ block: 'end' })); await page.waitForTimeout(500); await page.screenshot({ path: `${SHOTS}/r19_headings_filled.png` }); }
    await page.click('#checkBtn'); await page.waitForTimeout(200);
    const ex = await explain();
    ok(right ? /Correct/.test(ex) : /Not quite/.test(ex) && ex.includes(q.headings[0]) && ex.includes(`Why not “${q.extra[0]}” for paragraph 1?`) && ex.includes('extra one'),
      `headings ${right ? 'right' : 'wrong'} → ${ex.slice(0, 120).replace(/\n/g, ' ')}`);
    if (!right) { await page.$eval('#explain', e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300); await page.screenshot({ path: `${SHOTS}/r19_headings_wrong.png` }); }
  }
  const g = await page.evaluate(() => { const m = WR.state.mistakes.find(x => x.raw && x.raw.type === 'headings'); const it = m && WR.Garden.roundItems(50).find(i => i._mid === m.id); return it ? it.type + '|' + !!(it.passage && it.passage.text.includes('\n\n')) : null; });
  ok(g === 'headings|true', `garden re-serves match-the-headings with its paragraphs (${g})`);
  { const q = await startR('c1', "q.type === 'events'");
    for (const e of q.events) await tap(e);
    await page.click('#checkBtn'); await page.waitForTimeout(200); ok(/Correct/.test(await explain()), 'C1 events in order play right'); }
  { const q = await startR('c2', "q.type === 'tf' && q.answer === 2"); await (await page.$$('.tfopts .opt'))[1].click(); await page.waitForTimeout(200);
    const ex = await explain(); ok(/never says/.test(ex), 'C2 Not given: picking False explains the text never says it'); }
  { const q = await startR('c2', "q.type === 'findword'"); const ws = await page.$$('.fwords .mword'), words = await Promise.all(ws.map(w => w.innerText()));
    await ws[words.findIndex(w => bare(w) === q.answer)].click(); await page.waitForTimeout(200); ok(/Correct/.test(await explain()), `C2 find the word “${q.answer}” plays right`); }
  const mix = await page.evaluate(async () => { const s = new Set(); for (let i = 0; i < 10; i++) (await WR.buildItems('c1', 'reading')).forEach(q => s.add(q.type)); return [...s]; });
  ok(['events', 'tf', 'findword', 'headings'].some(t => mix.includes(t)), `normal C1 reading lessons include the new types (${mix})`);
  const cl = await ctx.newPage(); await cl.addInitScript(() => { window.__WR_CLASSIC_ONLY = true; }); await cl.goto(BASE); await cl.waitForTimeout(600);
  const ct = await cl.evaluate(async () => { const s = new Set(); for (let i = 0; i < 8; i++) (await WR.buildItems('b2', 'reading')).forEach(q => s.add(q.type)); return [...s]; });
  ok(ct.length && ct.every(t => t === 'mcq'), `classic-only B2 reading stays multiple choice (${ct})`);
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(ov <= 0, 'no sideways overflow');
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
