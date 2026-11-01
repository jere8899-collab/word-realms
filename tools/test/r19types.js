// 🧩 R19 (REVIEW-2026-11-01): every level's grammar, vocab and listening bank is at least ~a quarter non-multiple-choice
// (spell / order / mistake / gaps / dictate / listen-and-order), the new items are well formed, and multi-word word-bank
// tiles plus a C2 find-the-mistake play right and wrong on a 375 px phone. Wave 2: reading at A1–B1 gets events in order,
// True/False(/Not given) with notes that quote the exact line, and find-the-word; all three play right and wrong.   node tools/test/r19types.js
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
let fails = 0, passes = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const D = path.join(__dirname, '..', '..', 'data'), SHOTS = path.join(__dirname, '..', '..', 'screenshots');
const bank = (l, s) => { const d = JSON.parse(fs.readFileSync(`${D}/${l}/${s}.json`, 'utf8')); const a = Array.isArray(d) ? d : d.passages || []; return a.flatMap(x => x.questions || [x]); };
const NEW = new Set(['order', 'spell', 'mistake', 'gaps', 'dictate', 'picq', 'events', 'tf', 'heading', 'findword']);
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
for (const l of ['a1', 'a2', 'b1']) { const all = bank(l, 'reading'), n = all.filter(q => NEW.has(q.type)).length; ok(n / all.length >= 0.245, `${l} reading: ${Math.round(n * 100 / all.length)}% new reading types (${n}/${all.length})`); }
const rq = l => JSON.parse(fs.readFileSync(`${D}/${l}/reading.json`, 'utf8')).passages.flatMap(p => p.questions.map(q => ({ q, p })));
for (const l of ['a1', 'a2', 'b1']) {
  const tfs = rq(l).filter(x => x.q.type === 'tf');
  ok(tfs.every(({ q }) => q.options.length === (l === 'b1' ? 3 : 2)), `${l}: True/False${l === 'b1' ? '/Not given' : ''} options`);
  ok(tfs.every(({ q, p }) => q.options.every((o, i) => i === q.answer || (q.notes[o] || '').length > 15) && (q.options[q.answer] === 'Not given' || (p.text.includes(q.line) && Object.values(q.notes).every(n => n.includes(q.line))))), `${l}: every wrong True/False pick has a note quoting the exact line`);
  ok(rq(l).filter(x => x.q.type === 'findword').every(({ q, p }) => p.text.includes(q.line)), `${l}: find-the-word lines come from the text`);
}
ok(rq('b1').some(x => x.q.type === 'tf' && x.q.options[x.q.answer] === 'Not given'), 'B1 has Not given answers');
for (const l of LV) for (const s of ['grammar', 'vocab']) { const ks = bank(l, s).filter(q => q.type === 'mistake').map(q => q.words[q.wrong] + ' → ' + q.fix);
  const d = ks.filter((k, i) => ks.indexOf(k) !== i); ok(!d.length, `${l} ${s}: no two find-the-mistake items share a Mistake Garden id (${d.join(', ') || 'none'})`); }
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
  // 📖 reading types inside a real passage
  const startR = (lvl, f) => page.evaluate(([lvl, src]) => WR.bank(lvl, 'reading').then(b => { const f = new Function('q', 'return ' + src); const p = b.passages.find(p => p.questions.some(f));
    const q = p.questions.find(f); return WR.startLesson({ realm: lvl, skill: 'reading', key: 'reading', title: 'Reading', items: [WR.normalize(q, p)] }).then(() => q); }), [lvl, f]).then(async q => { await page.waitForTimeout(250); return q; });
  for (const right of [true, false]) {
    const q = await startR('a2', "q.type === 'events' && q.events.length === 4");
    ok(await page.$('.passage'), 'events: the story shows above the question');
    const want = right ? q.events : q.events.slice().reverse();
    for (const e of want) for (const b of await page.$$('#pool .tile')) if ((await b.innerText()).trim() === e) { await b.click(); break; }
    if (right) { await page.$eval('#checkBtn', b => b.scrollIntoView({ block: 'end' })); await page.waitForTimeout(600); await page.screenshot({ path: `${SHOTS}/r19_events_order.png` }); }
    ok(await page.$$eval('#built .evn', n => n.map(x => x.textContent).join('')) === '1234', 'events: picked cards are numbered 1-4');
    await page.click('#checkBtn'); await page.waitForTimeout(200);
    const ex = await explain(); ok(right ? /Correct/.test(ex) : /Not quite/.test(ex) && ex.includes(q.events[0]), `events ${right ? 'right' : 'wrong'} → ${ex.slice(0, 60).replace(/\n/g, ' ')}`);
  }
  { const q = await startR('b1', "q.type === 'tf' && q.answer === 1");
    const opts = await page.$$eval('.tfopts .opt', b => b.map(x => x.innerText.replace(/^\W+/, '').trim()));
    ok(opts.join('/') === 'True/False/Not given', `B1 True/False/Not given in a fixed order (${opts.join('/')})`);
    await (await page.$$('.tfopts .opt'))[0].click(); await page.waitForTimeout(200);
    const ex = await explain(); ok(/Not quite/.test(ex) && ex.includes(q.line), 'tf wrong pick → the note quotes the exact line: ' + ex.slice(0, 90).replace(/\n/g, ' '));
    await page.$eval('#explain', e => e.scrollIntoView({ block: 'center' })); await page.screenshot({ path: `${SHOTS}/r19_true_false_wrong.png` }); }
  { const q = await startR('b1', "q.type === 'tf' && q.answer === 2"); await (await page.$$('.tfopts .opt'))[0].click(); await page.waitForTimeout(200);
    ok(/never says/.test(await explain()), 'Not given: picking True explains the text never says it'); }
  for (const right of [true, false]) {
    const q = await startR('a1', "q.type === 'findword'");
    const ws = await page.$$('.fwords .mword'), words = await Promise.all(ws.map(w => w.innerText()));
    const hit = words.findIndex(w => w.toLowerCase().replace(/[^a-z0-9'-]/g, '') === q.answer);
    if (right) await page.screenshot({ path: `${SHOTS}/r19_find_the_word.png` });
    await ws[right ? hit : (hit + 1) % ws.length].click(); await page.waitForTimeout(200);
    const ex = await explain(); ok(right ? /Correct/.test(ex) : /Not quite/.test(ex) && ex.includes(q.answer), `find the word ${right ? 'right' : 'wrong'} → ${ex.slice(0, 60).replace(/\n/g, ' ')}`);
  }
  // the garden re-asks a missed reading item as the same type, with its text
  const g = await page.evaluate(() => { const m = WR.state.mistakes.find(x => x.raw && x.raw.type === 'findword'); const it = m && WR.Garden.roundItems(50).find(i => i._mid === m.id); return it ? it.type + '|' + !!(it.passage && it.passage.text) : null; });
  ok(g === 'findword|true', `garden re-serves find-the-word with its story (${g})`);
  const cl = await ctx.newPage(); await cl.addInitScript(() => { window.__WR_CLASSIC_ONLY = true; }); await cl.goto(BASE); await cl.waitForTimeout(600);
  const ct = await cl.evaluate(async () => { const s = new Set(); for (let i = 0; i < 8; i++) (await WR.buildItems('a1', 'reading')).forEach(q => s.add(q.type)); return [...s]; });
  ok(ct.length && ct.every(t => t === 'mcq'), `classic-only reading lessons stay multiple choice (${ct})`);
  const mix = await page.evaluate(async () => { const s = new Set(); for (let i = 0; i < 8; i++) (await WR.buildItems('b1', 'reading')).forEach(q => s.add(q.type)); return [...s]; });
  ok(['events', 'tf', 'findword'].some(t => mix.includes(t)), `normal reading lessons include the new types (${mix})`);
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(ov <= 0, 'no sideways overflow');
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
