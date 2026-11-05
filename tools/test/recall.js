// ✍️ BRIEF-T7 "Type it first" (specs/007-recall-practice): the JS rule (WR.Recall.eligible) matches tools/build_data.py
// (data/recall.json); the share of picking items drops ≥ 10 points; a marked question hides its choices, a right typed
// answer is "You remembered it!", one letter off gets one kind nudge (not a try), a miss or "🤔 Show choices" brings back
// the usual choices (a right pick still counts as right); reviews and the Mistake Garden are type-first too; never in boss
// rounds or classic-only runs; typing boxes have no autocorrect; 320 / 360 / 375 / landscape fit. Screenshots t7_*.png.
const { chromium } = require('playwright-core');
const BASE = process.env.BASE || 'http://127.0.0.1:18642', URL = BASE + '/index.html', OUT = (process.env.OUT || '/workspace/cefr-quest/screenshots/');
let passed = 0, failed = 0; const ok = (c, m) => { if (c) passed++; else failed++; console.log((c ? 'ok - ' : 'FAIL ') + m); };
const SAVE = { v: 1, name: 'Mei', avatar: 'avatar_girl', startLevel: 'a1', stars: 10, totalCorrect: 0, totalAnswered: 0, lessonsDone: 2, bonusSeen: ['sp'], healthMig: 1,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 0, happiness: 80, hunger: 30, lastTick: Date.now() }, streak: { count: 1, last: null },
  progress: {}, owned: [], equipped: {}, settings: { rate: 1, sound: false }, mistakes: [], parent: { pinAsked: true } };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const errors = [];
  const open = async (vp = { width: 360, height: 740 }) => {
    const ctx = await browser.newContext({ viewport: vp, isMobile: vp.width < 700, hasTouch: true, deviceScaleFactor: 2 });
    await ctx.addInitScript(s => { window.__WR_TEST = { holdMs: 0, pinOffer: false }; if (!localStorage.getItem('__seeded')) { localStorage.setItem('wordRealms.save.v1', s); localStorage.setItem('__seeded', '1'); } }, JSON.stringify(SAVE));
    await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
    const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_FAILED|net::/.test(m.text())) errors.push(m.text()); });
    await page.goto(URL, { waitUntil: 'networkidle' }); await page.waitForFunction(() => window.WR && WR.Recall && WR.realms); await page.waitForTimeout(600);
    await page.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove()));
    return { ctx, page }; };
  const vis = (page, sel) => page.$eval(sel, e => !!(e.offsetParent || e.getClientRects().length)).catch(() => false);
  const txt = (page, sel) => page.$eval(sel, e => e.innerText).catch(() => '');
  // the items a1 vocab marks "type it first" (normalised like a lesson does)
  const marked = (page, lvl = 'a1', sk = 'vocab') => page.evaluate(async ([lvl, sk]) => (await WR.bank(lvl, sk)).filter(q => q.recall).map(q => WR.normalize(q)), [lvl, sk]);
  const start = (page, items, extra = {}) => page.evaluate(([items, extra]) => WR.startLesson(Object.assign({ realm: 'a1', skill: 'vocab', items, title: 'Type it first test' }, extra)), [items, extra]);

  let { ctx, page } = await open();
  // 1. the rule and the share
  const share = await (await page.request.get(BASE + '/data/recall.json')).json();
  const js = await page.evaluate(async () => { const out = {};
    for (const lvl of ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']) { let el = 0, mk = 0, bad = 0;
      for (const sk of ['grammar', 'vocab', 'reading', 'listening']) { const b = await WR.bank(lvl, sk);
        const pairs = sk === 'reading' ? b.passages.flatMap(p => p.questions.map(q => [q, p])) : b.map(q => [q, null]);
        for (const [q, p] of pairs) { const e = WR.Recall.eligible(WR.normalize(q, p)); el += e; if (q.recall) { mk++; if (!e) bad++; } } }
      out[lvl] = { el, mk, bad }; } return out; });
  ok(Object.keys(js).every(l => js[l].el === share[l].eligible && js[l].mk === share[l].typeFirst && js[l].bad === 0),
    `js/recall.js and tools/build_data.py agree on every level (eligible ${Object.keys(js).map(l => l + ' ' + js[l].el).join(', ')}; every marked item is fair to type)`);
  ok(share.all.before - share.all.after >= 10, `picking share ${share.all.before}% → ${share.all.after}% (−${(share.all.before - share.all.after).toFixed(1)} points, at least 10)`);
  ok(share.a1.before - share.a1.after < share.b1.before - share.b1.after, `fewer typed answers for the youngest: A1 −${(share.a1.before - share.a1.after).toFixed(1)}, B1 −${(share.b1.before - share.b1.after).toFixed(1)} points`);
  // 2. marking
  const m = await page.evaluate(() => { const it = c => ({ correct: c }); const k = (v, c) => WR.Recall.mark(v, it(c));
    return [k('The Cat', 'cat'), k(' FISH! ', 'fish'), k('fsh', 'fish'), k('teachr', 'teacher'), k('techer', 'teacher'), k('2', 'two'), k('under the table', 'under the table'), k('', 'cat'), k('dog', 'cat'), k('cant agree', "can't agree"), WR.Recall.mask('under the table')]; });
  ok(m.join('|') === 'right|right|miss|close|close|right|right|empty|miss|right|u _ _ _ _   t _ _   t _ _ _ _', `marking: capitals, punctuation, apostrophes, a/the and number words don't matter; one letter off (5+ letters) is "close"; hint "u _ _ _ _   t _ _   t _ _ _ _" (${m.join(' | ')})`);
  ok(await page.evaluate(() => { const it = WR.normalize({ type: 'mcq', q: 'I ___ a student.', options: ['am', 'is', 'are', 'be'], answer: 0, explain: 'x' });
      return WR.Recall.on({ ...it, recall: 1 }, { mode: 'picture' }) && !WR.Recall.on({ ...it, recall: 1 }, { mode: 'boss' }) && !WR.Recall.on({ ...it, recall: 1 }, { mode: 'dragon' })
        && !WR.Recall.on(it, { mode: 'picture' }) && WR.Recall.on({ ...it, _rv: { for: 'x' } }, { mode: 'picture' }) && WR.Recall.on(it, { mode: 'picture', review: true })
        && (window.__WR_CLASSIC_ONLY = true, !WR.Recall.on({ ...it, recall: 1 }, { mode: 'picture' })) && !(window.__WR_CLASSIC_ONLY = false); }),
    'type it first: marked items, review slots and the Mistake Garden; never in boss / dragon rounds or classic-only runs; unmarked new items keep plain choices');

  // 3. a round of four marked questions at 360 px
  const items = await marked(page); const long = items.find(i => WR_len(i) >= 5) || items[2];
  function WR_len(i) { return String(i.correct).replace(/[^a-z]/gi, '').length; }
  const four = [items.find(i => i !== long), items.filter(i => i !== long)[1], long, items.filter(i => i !== long)[2]];
  await start(page, four); await page.waitForSelector('#recCard'); await page.waitForTimeout(700);
  let st = await page.evaluate(() => ({ opts: [...document.querySelectorAll('.opt')].filter(b => b.offsetParent).length, hint: document.querySelector('.rec-mask').innerText,
    ac: ['autocomplete', 'autocorrect', 'autocapitalize', 'spellcheck'].map(a => document.querySelector('#recIn').getAttribute(a)).join(','), c: WR._cur().correct }));
  ok(st.opts === 0 && /Type it first!/.test(await txt(page, '#recCard')) && st.hint.startsWith(st.c[0]), `question 1: choices hidden, "✍️ Type it first!" with the hint "${st.hint}"`);
  ok(/off/.test(st.ac) && /false/.test(st.ac), `the typing box has no autocorrect or suggestions (${st.ac})`);
  await page.screenshot({ path: OUT + 't7_type_first_360.png' });
  const stars0 = await page.evaluate(() => WR.state.stars);
  await page.tap('#recIn'); await page.keyboard.type(st.c.toUpperCase() + '!'); await page.tap('#checkBtn'); await page.waitForSelector('#nextBtn');
  ok(/Correct!/.test(await txt(page, '#explain')) && /You remembered it!/.test(await txt(page, '#explain')) && await page.evaluate(s => WR.state.stars > s, stars0), `typed "${st.c.toUpperCase()}!" → "✅ Correct! ✍️ You remembered it!" and a star`);
  await page.waitForTimeout(400); await page.screenshot({ path: OUT + 't7_remembered_360.png' });
  await page.tap('#nextBtn'); await page.waitForSelector('#recCard'); await page.waitForTimeout(500);
  // a miss → the choices; the right pick still counts
  let c = await page.evaluate(() => WR._cur().correct);
  await page.tap('#recIn'); await page.keyboard.type('zzz'); await page.tap('#checkBtn'); await page.waitForTimeout(300);
  st = await page.evaluate(() => ({ msg: document.querySelector('#recMsg').innerText, n: [...document.querySelectorAll('.opt')].filter(b => b.offsetParent).length, ans: !!document.querySelector('#nextBtn'),
    fit: [...document.querySelectorAll('.opt')].every(b => { const r = b.getBoundingClientRect(); return r.height >= 44 && r.left >= 0 && r.right <= innerWidth; }), sx: document.documentElement.scrollWidth <= innerWidth }));
  ok(/Nice try! Now pick it from the choices/.test(st.msg) && st.n === 4 && !st.ans && st.fit && st.sx, `typed "zzz": "Nice try! Now pick it from the choices 👇", 4 choices on screen (≥ 44 px), not answered yet`);
  await page.screenshot({ path: OUT + 't7_choices_360.png' });
  for (const b of await page.$$('.opt')) if ((await b.innerText()).replace(/^[A-D]\s*/, '').trim() === c) { await b.tap(); break; }
  await page.waitForSelector('#nextBtn'); ok(/Correct!/.test(await txt(page, '#explain')), 'then the right choice: ✅ Correct! (counts as right, like before)');
  await page.tap('#nextBtn'); await page.waitForSelector('#recCard');
  // one letter off: a kind nudge, not a try
  c = await page.evaluate(() => WR._cur().correct); const typo = c.length >= 5 ? c.slice(0, -2) + c.slice(-1) : null;
  if (typo) { await page.tap('#recIn'); await page.keyboard.type(typo); await page.tap('#checkBtn'); await page.waitForTimeout(400);
    const t = await txt(page, '#recMsg'); ok(/So close! Check one letter/.test(t) && !(await page.$('#nextBtn')) && !(await vis(page, '#recOpts')), `typed "${typo}" for "${c}": "So close! Check one letter ✏️", not a try`);
    await page.screenshot({ path: OUT + 't7_close_360.png' });
    await page.fill('#recIn', c); await page.tap('#checkBtn'); await page.waitForSelector('#nextBtn'); ok(/You remembered it!/.test(await txt(page, '#explain')), 'fixed the letter: "You remembered it!"');
  } else ok(false, 'no 5+ letter marked item found for the one-letter test');
  await page.tap('#nextBtn'); await page.waitForSelector('#recCard');
  // "Show choices" without typing, then a wrong pick: a normal miss (planted in the Mistake Garden)
  const g0 = await page.evaluate(() => (WR.state.garden && WR.state.garden.mistakes || WR.state.mistakes || []).length);
  await page.tap('#recShow'); await page.waitForTimeout(300);
  ok(/That's okay! Pick it from the choices/.test(await txt(page, '#recMsg')) && (await page.$$eval('.opt', b => b.filter(x => x.offsetParent).length)) === 4, '"🤔 Show choices": "That\'s okay! Pick it from the choices 👇" and the 4 choices');
  c = await page.evaluate(() => WR._cur().correct);
  for (const b of await page.$$('.opt')) if ((await b.innerText()).replace(/^[A-D]\s*/, '').trim() !== c) { await b.tap(); break; }
  await page.waitForSelector('#nextBtn');
  ok(/Not quite/.test(await txt(page, '#explain')) && await page.evaluate(g => (WR.state.garden && WR.state.garden.mistakes || WR.state.mistakes || []).length > g, g0), 'a wrong pick: "💭 Not quite." and the question is planted in the Mistake Garden (as before)');
  await page.tap('#nextBtn'); await page.waitForSelector('.result'); ok(/3 \/ 4 correct/.test(await txt(page, '.result')), 'result: 3 / 4 correct');
  // 4. the Mistake Garden and review slots: answer first (an unmarked, fair item)
  const plain = await page.evaluate(async () => (await WR.bank('a1', 'grammar')).filter(q => !q.recall).map(q => WR.normalize(q)).filter(i => WR.Recall.eligible(i)).slice(0, 2));
  await start(page, plain, { mode: 'picture', review: true, title: 'Garden Revival 💧' }); await page.waitForSelector('.qcard');
  ok(!!(await page.$('#recCard')) && !(await vis(page, '.opt')), `Mistake Garden: "${plain[0].q}" is type it first`);
  await page.screenshot({ path: OUT + 't7_garden_360.png' });
  await start(page, plain.map(i => ({ ...i, _rv: { for: 'x' } }))); await page.waitForSelector('.qcard');
  ok(!!(await page.$('#recCard')), 'a lesson review slot: type it first');
  await start(page, plain); await page.waitForSelector('.qcard');
  ok(!(await page.$('#recCard')) && await vis(page, '.opt'), 'the same item as a new (unmarked) question: plain choices');
  await page.evaluate(() => WR.stopLesson()); await ctx.close();
  // 5. phones
  for (const [n, vp] of [['320', { width: 320, height: 640 }], ['375', { width: 375, height: 667 }], ['landscape', { width: 740, height: 360 }]]) {
    ({ ctx, page } = await open(vp)); const its = await marked(page, 'a1', 'grammar');
    await start(page, its.slice(0, 2)); await page.waitForSelector('#recCard'); await page.$eval('#recCard', e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300);
    let f = await page.evaluate(() => { const el = [...document.querySelectorAll('#recIn,#checkBtn,#recShow')].map(e => e.getBoundingClientRect());
      return { tall: el.every(r => r.height >= 44), inX: el.every(r => r.left >= 0 && r.right <= innerWidth + 1), sx: document.documentElement.scrollWidth <= innerWidth + 1 }; });
    ok(f.tall && f.inX && f.sx, `${n}: the type-it-first box, ✅ Check and 🤔 Show choices are ≥ 44 px and on screen, no sideways scroll`);
    await page.screenshot({ path: OUT + `t7_type_first_${n}.png` });
    await page.tap('#recShow'); await page.waitForTimeout(500);
    f = await page.evaluate(() => { const el = [...document.querySelectorAll('.opt')].filter(b => b.offsetParent).map(e => e.getBoundingClientRect());
      return { n: el.length, tall: el.every(r => r.height >= 44), inX: el.every(r => r.left >= 0 && r.right <= innerWidth + 1), sx: document.documentElement.scrollWidth <= innerWidth + 1 }; });
    ok(f.n === 4 && f.tall && f.inX && f.sx, `${n}: after "Show choices", 4 choices ≥ 44 px and on screen, no sideways scroll`);
    await page.screenshot({ path: OUT + `t7_choices_${n}.png` }); await ctx.close();
  }
  ok(errors.length === 0, 'no console errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  console.log(`recall: ${passed} passed, ${failed} failed`); await browser.close(); process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
