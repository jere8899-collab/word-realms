// ⚖️ Balance Scale: Model Magic for Grade 6–8 linear equations (Singapore Sec 1–2 "simple linear equations").
// Node checks on every generated scale (always balanced, ends with x alone, right answer, fair move buttons), then a
// phone flow at 375×667 (tap moves, a one-sided move tips the scale, auto-open after a wrong answer, save + quest + sticker).
// Run: node tools/test/balance.js (game served on :18642). Screenshots: screenshots/balance_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const V = require(ROOT + '/js/math-viz.js'), B = V.bal;
const BAL = ['g6.algebra', 'g7.lineq', 'g7.story', 'g8.fraceq', 'g8.story'];
const labels = svg => [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(m => m[1].replace(/&amp;/g, '&'));
const plain = s => s.replace(/\u2212/g, '-');

/* ---------- 1. every scale (Node) ---------- */
const cov = {}, bad = [], unbal = [], notAlone = [], wrongAns = [], badCh = [], badSvg = [], badEq = [], order = [];
for (const t of M.TOPICS) for (let s = 1; s <= 1500; s++) {
  const q = M.make(t.id, s * 2654435761 >>> 0), sp = V.spec(q);
  if (!sp || sp.type !== 'balance') continue;
  cov[t.id] = (cov[t.id] || 0) + 1;
  if (!BAL.includes(t.id) || t.grade < 6 || t.grade > 8) bad.push(t.id);
  const x = q.val, f = sp.states[sp.states.length - 1], X = f[sp.xSide], N = f[sp.xSide === 'L' ? 'R' : 'L'];
  if (sp.states.some(st => Math.abs(B.weight(st.L, x) - B.weight(st.R, x)) > 1e-9 || !Number.isInteger(st.L.c) || !Number.isInteger(st.R.c))) unbal.push(t.id + ' ' + q.q);
  if (!(X.n === 1 && X.d === 1 && X.c === 0 && N.n === 0) || sp.moves.length < 1 || sp.moves.length > 4) notAlone.push(t.id + ' ' + q.q);
  if (sp.ans !== x || !M.check(q, String(N.c)).ok) wrongAns.push(t.id + ' ' + q.q);
  // MOE order: a bracket is shared out first; x on both sides is gathered before the blocks move
  if (q.data.g && sp.moves[0].op !== 'div') order.push(t.id + ' bracket');
  if (q.data.L && q.data.R[0] && sp.moves[0].op !== 'subx') order.push(t.id + ' x both sides');
  sp.moves.forEach((m, i) => {
    const ch = B.choices(sp, i), good = ch.filter(c => c.kind === 'good'), st = sp.states[i];
    if (ch.length !== 3 || good.length !== 1 || new Set(ch.map(c => c.label)).size !== 3 || ch.some(c => !c.m)) badCh.push(t.id + ' ' + ch.map(c => c.label));
    for (const c of ch) {
      const nx = B.move(st, c.m, c.kind === 'oneside'), w = Math.abs(B.weight(nx.L, x) - B.weight(nx.R, x)) > 1e-9;
      if (c.kind === 'oneside' && !w) badCh.push(t.id + ' one-sided move stays balanced ' + q.q);
      if (c.kind !== 'oneside' && w) badCh.push(t.id + ' both-sides move tips ' + q.q);
      if (c.kind !== 'good' && JSON.stringify(nx) === JSON.stringify(sp.states[i + 1])) badCh.push(t.id + ' a "wrong" move is really right ' + q.q);
      if (!B.why(c, sp)) badCh.push(t.id + ' no feedback');
    }
  });
  if (s <= 200) {
    const a = V.svg(sp), r = V.svg(sp, { reveal: true }), e = V.svg(sp, { step: sp.moves.length }), w = V.svg(sp, { state: B.move(sp.states[0], sp.moves[0], true), tilt: 1 });
    if ([a, r, e, w].some(z => !z.startsWith('<svg') || /NaN|undefined|Infinity|\[object/.test(z))) badSvg.push(t.id);
    const le = labels(e), lr = labels(r);
    if (!le.includes('?') || !le.includes(sp.v) || !lr.includes(String(N.c).replace('-', '\u2212')) || !/not balanced/.test(w) || /not balanced/.test(a)) badSvg.push(t.id + ' labels ' + le + ' | ' + lr);
    // the first scale shows the question's own equation (bracket and word-problem ones are shown collected)
    if (!q.data.g && /^Solve|magic box/.test(q.q) && t.id !== 'g8.fraceq') { const L0 = plain(B.text(sp.states[0].L, sp.v)), R0 = plain(B.text(sp.states[0].R, sp.v)); if (!q.q.replace(/\$/g, '').includes(`${L0} = ${R0}`) && !(t.id === 'g6.algebra' && q.q.includes(`${q.data.R[1]}`))) badEq.push(q.q + ' vs ' + L0 + ' = ' + R0); }
  }
}
const n = Object.values(cov).reduce((a, b) => a + b, 0);
ok(BAL.every(t => cov[t] > 100) && !bad.length, `${n} balance scales from ${Object.keys(cov).join(', ')}; only Grades 6–8 equation topics ${bad.slice(0, 3)}`);
ok(!unbal.length, `every step of every scale is balanced (both sides weigh the same with the real x) and uses whole blocks ${unbal.slice(0, 2)}`);
ok(!notAlone.length, `every scale ends with one x-bag alone after 1–4 moves ${notAlone.slice(0, 2)}`);
ok(!wrongAns.length, `the blocks left opposite the bag are the question's answer ${wrongAns.slice(0, 2)}`);
ok(!order.length, `moves follow the Sec 1 order: share out a bracket first, gather x-terms before moving numbers ${[...new Set(order)]}`);
ok(!badCh.length, `every move has 3 different buttons: 1 right, 1 one-sided (tips the scale; a balanced no-help move when x = 0 would keep it level), 1 still-balanced-but-no-help, each with feedback ${badCh.slice(0, 3)}`);
ok(!badSvg.length, `scales draw cleanly; the last unrevealed step says "x = ?", the revealed one shows the answer, a one-sided move says "not balanced" ${badSvg.slice(0, 2)}`);
ok(!badEq.length, `the first scale matches the equation in the question ${badEq.slice(0, 3)}`);
{ const sp = V.spec({ topic: 'g7.lineq', data: { L: [3, 5], R: [0, 20] } });
  ok(sp.moves.map(m => B.label(m, 'x')).join(' | ') === '➖ Take 5 from both sides | ➗ Divide both sides by 3' && sp.ans === 5, '3x + 5 = 20: take 5 from both sides, then divide both sides by 3 → x = 5'); }
{ const sp = V.spec({ topic: 'g7.lineq', data: { L: [2, 7], R: [5, -2] } });
  ok(sp.moves[0].op === 'subx' && sp.moves[0].k === 2 && sp.xSide === 'R' && sp.ans === 3, '2x + 7 = 5x − 2: take 2x from both sides (keep the bags on the side with more) → x = 3'); }
{ const sp = V.spec({ topic: 'g8.fraceq', data: { a: 3, b: -2, c: 1 } });
  ok(sp.moves.map(m => B.label(m, 'x')).join(' | ') === '➕ Add 2 to both sides | ✖️ Multiply both sides by 3' && sp.ans === 9, 'x/3 − 2 = 1: add 2 to both sides, multiply both sides by 3 → x = 9'); }
{ const sp = V.spec({ topic: 'g7.lineq', data: { L: [6, 12], R: [0, 0], g: 6 } }), ch = B.choices(sp, 0);
  ok(sp.ans === -2 && ch.some(c => c.kind === 'nohelp') && !ch.some(c => c.kind === 'oneside'), '6(x + 2) = 0: sharing one side only would still balance, so a "no help" move replaces it'); }
{ const sp = V.spec({ topic: 'g7.lineq', data: { L: [-1, 4], R: [0, 9] } }), ch = B.choices(sp, 1);
  ok(sp.ans === -5 && ch.some(c => c.kind === 'nothing' && /by 1$/.test(c.label)), '−x + 4 = 9: dividing by −1 is its own opposite, so the extra button is "divide by 1" → x = −5'); }

/* ---------- 2. phone ---------- */
const SAVE = { v: 1, name: 'Jeremy', avatar: 'avatar_mage', startLevel: 'a1', stars: 100, totalCorrect: 40, totalAnswered: 50,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 420, happiness: 82, hunger: 35, skin: null, lastTick: Date.now() }, streak: { count: 4, last: null }, progress: {},
  owned: [], equipped: { outfit: null, petskin: null, theme: null }, settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 5 };
const saved = page => page.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')));
const seedFor = (topic, pred) => { for (let s = 1; s < 20000; s++) { const q = M.make(topic, s), sp = V.spec(q); if (sp && (!pred || pred(q, sp))) return s; } };
const noOverflow = page => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const errors = [];
  p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/font|ERR_|net::|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await p.goto(URL); await p.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE);
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(400);
  await p.evaluate(() => { WR.ensureDaily(); WR.state.daily.quests[0] = { id: 'balance1', progress: 0, claimed: false }; WR.save(); });
  const s1 = seedFor('g7.lineq', (q, sp) => !q.data.R[0] && !q.data.g && q.data.L[0] >= 2 && q.data.L[0] <= 4 && q.data.L[1] > 0 && q.data.L[1] <= 8 && q.val > 0 && q.val <= 6);
  const s2 = seedFor('g8.fraceq', (q, sp) => q.data.b < 0 && q.data.c > 0 && q.data.c < 8 && q.data.a <= 4);
  const s3 = seedFor('g7.lineq', (q, sp) => q.data.R[0] > 0 && q.data.L[0] > q.data.R[0] && q.data.L[0] <= 6 && Math.abs(q.data.L[1]) <= 10 && Math.abs(q.data.R[1]) <= 12 && q.val > 0);
  await p.evaluate(list => { const items = list.map(([t, s]) => MathGen.make(t, s)); WR.Math.startLesson({ topic: list[0][0], items }); }, [['g7.lineq', s1], ['g8.fraceq', s2], ['g7.lineq', s3], ['g9.quad', 3]]);
  await p.waitForTimeout(300);
  const q1 = await p.evaluate(() => WR.Math._dbg()), sp1 = V.spec(q1);
  ok((await p.textContent('#vizBtn')).includes('⚖️ Balance') && await p.locator('#mviz svg').count() === 0, `phone: Grade 7 "${q1.q}" has a ⚖️ Balance button; the scale waits until asked`);
  await p.click('#vizBtn'); await p.waitForTimeout(500);
  ok(await p.locator('#mviz .mv-balance').count() === 1 && await p.locator('#mviz .bmove').count() === 3, 'phone: the balance scale opens with 3 move buttons');
  ok(await noOverflow(p), 'phone 375×667: no horizontal overflow with the scale open');
  const hs = await p.$$eval('#mviz .bmove', bs => bs.map(x => x.getBoundingClientRect().height)); ok(hs.every(h => h >= 40), `phone: move buttons are big enough to tap (${hs.map(Math.round)})`);
  await p.locator('.qcard').screenshot({ path: OUT + 'balance_01_scale.png' });
  // a one-sided move tips the scale for a moment, then it settles back
  const idx = kind => B.choices(sp1, 0).findIndex(c => c.kind === kind);
  await p.locator('#mviz .bmove').nth(idx('oneside')).click(); await p.waitForTimeout(250);
  ok(/not balanced/.test(await p.innerHTML('#mviz')) && /scale tipped/.test(await p.textContent('#mviz .bal-msg')), 'phone: a one-sided move tips the scale ("not balanced") and explains "do the same to both sides"');
  await p.locator('.qcard').screenshot({ path: OUT + 'balance_02_tipped.png' });
  await p.waitForTimeout(1700);
  ok(!/not balanced/.test(await p.innerHTML('#mviz')) && await p.locator('#mviz .bmove.glow').count() === 1, 'phone: the scale settles back, and the right move glows as a hint');
  await p.locator('#mviz .bmove').nth(idx('opposite')).click(); await p.waitForTimeout(200);
  ok(/Still balanced/.test(await p.textContent('#mviz .bal-msg')) && !/not balanced/.test(await p.innerHTML('#mviz')), 'phone: the opposite move keeps it balanced but says it does not help');
  for (let i = 0; i < sp1.moves.length; i++) { const k = B.choices(sp1, i).findIndex(c => c.kind === 'good'); await p.locator('#mviz .bmove').nth(k).click(); await p.waitForTimeout(250); }
  ok(await p.locator('#mviz .bal-done').count() === 1 && labels(await p.innerHTML('#mviz')).includes('?'), 'phone: after the last move the scale shows "x = ?" and asks the child to type it');
  await p.locator('.qcard').screenshot({ path: OUT + 'balance_03_balanced.png' });
  let st = await saved(p);
  ok(st.math.balance.opened === 1 && st.math.balance.moves === sp1.moves.length && st.math.balance.done === 1 && st.daily.quests[0].progress === 1, `save: math.balance ${JSON.stringify(st.math.balance)}, ⚖️ daily quest ${st.daily.quests[0].progress}/1`);
  await p.fill('#mans', q1.a); await p.click('#mcheck'); await p.waitForTimeout(300);
  ok(await p.locator('#mviz .mviz.reveal').count() === 1 && labels(await p.innerHTML('#mviz')).includes(q1.a.replace('-', '\u2212')) && await p.locator('#mviz .bmove').count() === 0, `phone: a right answer shows the finished scale with x = ${q1.a}`);
  st = await saved(p); ok(st.math.modelSolved === 1 && st.math.models === 1, 'save: it counts as a Model Magic solve too');
  await p.click('#mnext'); await p.waitForTimeout(300);
  // fraction equation: a first wrong answer opens the scale by itself
  await p.fill('#mans', '999'); await p.click('#mcheck'); await p.waitForTimeout(400);
  ok(await p.locator('#mviz .mv-balance').count() === 1 && /balance scale to help/.test(await p.textContent('#mexplain')), 'phone: a first wrong answer on x/a + b = c opens the balance scale with the hint');
  await p.locator('.qcard').screenshot({ path: OUT + 'balance_04_fraction_hint.png' });
  await p.click('#vizBtn'); await p.waitForTimeout(100); await p.click('#vizBtn'); await p.waitForTimeout(200);
  ok(await p.locator('#mviz .mv-balance').count() === 1, 'phone: Hide / Balance toggles the scale');
  const q2 = await p.evaluate(() => WR.Math._dbg()); await p.fill('#mans', q2.a); await p.click('#mcheck'); await p.waitForTimeout(300); await p.click('#mnext'); await p.waitForTimeout(300);
  // x on both sides
  await p.click('#vizBtn'); await p.waitForTimeout(500);
  const q3 = await p.evaluate(() => WR.Math._dbg());
  ok((await p.textContent('#mviz .bmoves')).includes('x from both sides') && await noOverflow(p), `phone: "${q3.q}" starts by taking x-bags from both sides; fits the screen`);
  await p.screenshot({ path: OUT + 'balance_05_both_sides_phone.png' });
  await p.fill('#mans', q3.a); await p.click('#mcheck'); await p.waitForTimeout(300); await p.click('#mnext'); await p.waitForTimeout(300);
  ok(await p.locator('#vizBtn').count() === 0, 'phone: Grade 9 quadratics have no balance button');
  // old save + sticker
  const mig = await p.evaluate(() => { const keep = WR.state.math; WR.state.math = { grade: 7, topics: {}, facts: {}, dojo: {}, balance: { done: 2 } }; const m = WR.Math.st(), r = [m.balance.opened, m.balance.moves, m.balance.done]; WR.state.math = keep; return r; });
  ok(mig.join() === '0,0,2', `save migration: a partial balance block is completed (${mig})`);
  const stk = await p.evaluate(() => { const d = WR.MathGoals.STICKERS.find(s => s.id === 'balance3'); return d && [d.test(), d.prog().join('/')]; });
  ok(stk && stk[0] === false && stk[1] === '1/3', `sticker: ⚖️ Balance Keeper is on the Number Kingdom page (${stk})`);
  ok(!errors.length, 'phone: no console errors ' + errors.slice(0, 3));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall balance checks passed');
})();
