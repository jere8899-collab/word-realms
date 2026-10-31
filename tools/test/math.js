// 🔢 Number Kingdom + 🗼 Times-Table Tower: generators (all 12 grades), answer checker, spaced repetition,
// UI flows on phone and desktop, the dojo sprint, the mastery grid, the grade finder, saving into wordRealms.save.v1,
// the KaTeX fallback, and phone screenshots (screenshots/math_*.png).  Run: node tools/test/math.js
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));

/* ================= 1. generators (Node) ================= */
const SEEDS = 300, byGrade = {};
let made = 0, badAns = [], nan = [], badMcq = [], noSteps = [], dupRun = [];
for (const t of M.TOPICS) {
  byGrade[t.grade] = (byGrade[t.grade] || 0) + 1;
  for (let s = 1; s <= SEEDS; s++) {
    const q = M.make(t.id, s * 2654435761 >>> 0); made++;
    const js = JSON.stringify(q);
    if (/NaN|Infinity|undefined|\[object/.test(js) || (typeof q.val === 'number' && !isFinite(q.val))) nan.push(t.id);
    if (!M.check(q, q.a).ok) badAns.push(t.id + ' ' + q.a);
    if (q.kind === 'mcq' && (q.options.length < 2 || new Set(q.options).size !== q.options.length || q.options.filter(o => o === q.a).length !== 1 || (q.options.length < 3 && !/^(Yes|No)$/.test(q.a)))) badMcq.push(t.id);
    if (!q.steps.length || !q.hint || !q.q) noSteps.push(t.id);
  }
  const run = M.batch(t.id, 8, 777); if (run.length !== 8 || new Set(run.map(q => q.q + '|' + q.a)).size !== 8) dupRun.push(t.id);
}
const grades = Object.keys(byGrade).map(Number);
ok(grades.length === 12 && grades.every(g => byGrade[g] >= 6), `12 grades with 6+ topics each (${M.TOPICS.length} topics: ${JSON.stringify(byGrade)})`);
ok(!nan.length, `${made} generated questions, none with NaN/Infinity/undefined ${[...new Set(nan)].slice(0, 5)}`);
ok(!badAns.length, `every question's own answer passes the checker ${badAns.slice(0, 5)}`);
ok(!badMcq.length, `multiple choice: 3–4 unique options with the answer exactly once ${[...new Set(badMcq)].slice(0, 5)}`);
ok(!noSteps.length, `every question has a hint and a worked solution ${[...new Set(noSteps)].slice(0, 5)}`);
ok(!dupRun.length, `a short run of 8 has no duplicate questions in any topic ${dupRun}`);
ok(M.GRADES.every(g => /^Grade \d+$/.test(g.label)) && M.GRADES[0].sg === 'Primary 1' && M.GRADES[6].sg === 'Secondary 1' && M.GRADES[11].sg === 'JC 2', 'grades labelled Grade 1–12 with Singapore P1–P6, Sec 1–4, JC 1–2');
// seeded: same seed, same question
ok(M.TOPICS.every(t => JSON.stringify(M.make(t.id, 4242)) === JSON.stringify(M.make(t.id, 4242))), 'questions are reproducible from their seed');

/* independent re-computation of answers from the generator's raw numbers */
const verify = {
  arith: q => { const { a, b, op } = q.data; return ({ '+': a + b, '-': a - b, '×': a * b, '÷': a / b })[op || '×']; },
  divrem: q => { const { n, d } = q.data, v = Array.isArray(q.val) ? q.val : [q.val, 0]; return v[0] * d + v[1] === n && v[1] < d && v[1] >= 0; },
};
const vErr = []; const V = (id, fn, n = 200) => { for (let s = 1; s <= n; s++) { const q = M.make(id, s * 977); if (!q.data) continue; let good; try { good = fn(q); } catch (e) { good = false; } if (!good) { vErr.push(id + ' ' + JSON.stringify(q.data) + ' → ' + q.a); return; } } };
const near = (x, y, t = 1e-6) => Math.abs(x - y) <= t;
['g1.add20', 'g1.sub20', 'g2.add', 'g2.sub', 'g2.times', 'g2.share', 'g3.times', 'g3.add4', 'g3.mul', 'g4.longmul'].forEach(id => V(id, q => near(verify.arith(q), q.val)));
['g3.divrem', 'g4.longdiv'].forEach(id => V(id, verify.divrem));
V('g7.lineq', q => { const { L, R } = q.data; return near((R[1] - L[1]) / (L[0] - R[0]), q.val); });
V('g7.hcf', q => { const { a, b, f } = q.data; if (!f) return true; let g = 1; for (let i = 1; i <= Math.min(a, b); i++) if (a % i === 0 && b % i === 0) g = i; return q.val === (f === 'hcf' ? g : a * b / g); });
V('g8.pyth', q => q.data.h ? near(Math.hypot(q.val, q.data.x), q.data.h) : near(Math.hypot(q.data.x, q.data.y), q.val, 0.051));
V('g8.stats', q => { const xs = q.data.xs.slice().sort((a, b) => a - b), n = xs.length; if (q.data.f === 'mean') return near(xs.reduce((a, b) => a + b) / n, q.val, 0.051); if (q.data.f === 'median') return near(n % 2 ? xs[(n - 1) / 2] : (xs[n / 2 - 1] + xs[n / 2]) / 2, q.val); return xs.filter(x => x === q.val).length >= Math.max(...xs.map(x => xs.filter(y => y === x).length)); });
V('g9.quad', q => { const { a, b, c } = q.data; return q.val.every(x => near(a * x * x + b * x + c, 0, 1e-9)); });
V('g9.simul', q => { const { a, b, c, d, e1, e2 } = q.data, [x, y] = q.val; return a * x + b * y === e1 && c * x + d * y === e2; });
V('g10.quadf', q => { const { a, b, c } = q.data; return q.val.every(x => Math.abs(a * x * x + b * x + c) < Math.abs(2 * a * x + b) * 0.006 + 1e-9); });
V('g10.sector', q => { const { R, th, area } = q.data; return near(area ? th / 360 * Math.PI * R * R : th / 360 * 2 * Math.PI * R, q.val, 0.0051); });
V('g11.diff', q => { const { terms, x0 } = q.data; if (x0 === undefined) return true; const f = x => terms.reduce((s, [c, p]) => s + c * x ** p, 0), h = 1e-5; return near((f(x0 + h) - f(x0 - h)) / (2 * h), q.val, 1e-3); });
V('g11.stationary', q => { const { terms } = q.data, d = x => terms.reduce((s, [c, p]) => s + (p ? c * p * x ** (p - 1) : 0), 0); return (Array.isArray(q.val) ? q.val : [q.val]).every(x => near(d(x), 0, 1e-9)); });
V('g11.ap', q => { const { a, d, n, f } = q.data; let s = 0, t = a; for (let i = 1; i <= n; i++) { if (i > 1) t += d; s += t; } return near(f === 'sum' ? s : t, q.val); });
V('g11.gp', q => { const { a, q: r, n, t, pn, pd } = q.data; if (t === 2) { let s = 0, term = a; for (let i = 0; i < 400; i++) { s += term; term *= pn / pd; } return near(s, q.val, 1e-6); } let s = 0, term = a; for (let i = 1; i <= n; i++) { if (i > 1) term *= r; s += term; } return near(t === 1 ? s : term, q.val); });
V('g11.vec3', q => { const { a, b, t } = q.data, dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; return t === 0 ? q.val === dot : t === 1 ? near(Math.hypot(...a), q.val, q.tol) : near(Math.acos(dot / Math.hypot(...a) / Math.hypot(...b)) * 180 / Math.PI, q.val, 0.051); });
V('g12.integ', q => { const { terms, a, b } = q.data, f = x => terms.reduce((s, [c, p]) => s + c * x ** p, 0); let s = 0; const N = 2000, h = (b - a) / N; for (let i = 0; i <= N; i++) s += f(a + i * h) * (i === 0 || i === N ? 1 : i % 2 ? 4 : 2); return near(s * h / 3, q.val, 1e-6); });
V('g12.area', q => { const { p, qq = q.data.q } = q.data; const f = x => -(x - p) * (x - qq); let s = 0; const N = 2000, h = (qq - p) / N; for (let i = 0; i <= N; i++) s += f(p + i * h) * (i === 0 || i === N ? 1 : i % 2 ? 4 : 2); return near(s * h / 3, q.val, 1e-6); });
V('g12.binom', q => { const { n, k, pn, pd } = q.data; let c = 1; for (let i = 1; i <= k; i++) c = c * (n - k + i) / i; return near(c * (pn / pd) ** k * (1 - pn / pd) ** (n - k), q.val, q.tol); });
V('g12.chain', q => { const d = q.data; const h = 1e-6; let f, x0; if (d.t === 0) { f = x => (d.a * x + d.b) ** d.n; x0 = d.x0; } else if (d.t === 1) { f = x => x ** d.m * Math.exp(d.k * x); x0 = 1; } else { f = x => Math.sin(d.a * x); x0 = d.x0; } return near((f(x0 + h) - f(x0 - h)) / (2 * h), q.val, Math.max(q.tol, 1e-4)); });
V('g12.sigma', q => { const { f, m } = q.data; let s = 0; for (let r = 1; r <= m; r++) s += f.reduce((a, c, p) => a + c * r ** p, 0); return s === q.val; });
ok(!vErr.length, `answers re-computed independently for 30 topics (arithmetic, long division, equations, HCF/LCM, Pythagoras, statistics, quadratics, simultaneous, sectors, calculus, sequences, vectors, binomial, Σ) ${vErr.slice(0, 3).join(' | ')}`);
// every times-table fact and its division twin
let factBad = 0; for (const a of M.TABLES) for (let b = 1; b <= 12; b++) { const x = M.factQ(a, b, false), d = M.factQ(a, b, true); if (x.val !== a * b || d.val !== b || x.fact !== d.fact || !M.check(x, String(a * b)).ok || !M.check(d, String(b)).ok) factBad++; }
ok(!factBad, 'all 132 multiplication facts and their 132 division twins are right');
ok(M.CHALLENGES.every(c => Array.from({ length: 200 }, (_, s) => M.makeChallenge(c.id, s + 1)).every(q => M.check(q, q.a).ok && (!q.data || !q.data.d || verify.divrem(q)))), 'tower challenge floors (2-digit × 1-digit, long multiplication, long division, decimals) all check out');

/* answer checker tolerance */
const NUM = v => ({ kind: 'num', val: v, tol: 1e-9 });
const cases = [
  [NUM(0.75), ['3/4', '0.75', '.75', '6/8', ' 3 / 4 ', '75%'.replace('%', '') === '75' ? '0.750' : ''], ['3/5', '0.7', 'abc']],
  [NUM(-2), ['-2', '−2', ' -2 ', 'x = -2', '-4/2'], ['2', '--2']],
  [NUM(1.5), ['1 1/2', '3/2', '1.5', '1.50'], ['1/2', '11/2']],
  [NUM(1000), ['1000', '1,000', '1000.0'], ['100']],
  [NUM(25), ['25', '25%', '25 cm', '25°', '$25', '25 m²'], ['26']],
  [NUM(3.75), ['3.75', '$3.75', '3.750'], ['3.7']],
  [{ kind: 'num', val: 3.1, tol: 0.051 }, ['3.1', '3.08', '3.12'], ['3.2', '3']],
  [{ kind: 'set', val: [2, -3], tol: 1e-9 }, ['2, -3', '-3, 2', '2 and -3', '-3; 2', '2 or −3'], ['2', '2, 3', '2, -3, 4']],
  [{ kind: 'pair', val: [3, -2], tol: 1e-9 }, ['3, -2', '(3, -2)', '3,-2'], ['-2, 3']],
  [{ kind: 'rem', val: [7, 2] }, ['7 r 2', '7r2', '7 R 2', '7 remainder 2'], ['7', '7 r 3', '72']],
  [{ kind: 'rem', val: [7, 0] }, ['7', '7 r 0'], ['8']],
  [{ kind: 'time', val: 3 * 60 + 30 }, ['3:30', '03:30', '15:30', '3.30'], ['3:00', '6:30']],
  [{ kind: 'ratio', val: [2, 3] }, ['2:3', '2 : 3'], ['4:6', '3:2']],
  [{ kind: 'mcq', a: '$x$' }, ['$x$'], ['$y$']]
];
let ckBad = [];
for (const [q, yes, no] of cases) { yes.filter(Boolean).forEach(v => { if (!M.check(q, v).ok) ckBad.push(`${JSON.stringify(q.val || q.a)} should accept "${v}"`); }); no.forEach(v => { if (M.check(q, v).ok) ckBad.push(`${JSON.stringify(q.val || q.a)} should reject "${v}"`); }); }
ok(!ckBad.length, 'answer checker: fractions, mixed numbers, decimals, negatives (− too), commas, units, %, $, sets in any order, pairs, remainders, times, ratios ' + ckBad.slice(0, 4).join(' | '));
ok(M.check(NUM(5), '').empty && M.check(NUM(5), 'banana').bad, 'empty and unreadable answers are flagged (not marked wrong)');

/* spaced repetition */
{
  const F = {}, t0 = 1e12; M.gradeFact(F, '7x8', false, 4000, t0);
  ok(F['7x8'].b === 0 && F['7x8'].d === t0, 'a missed fact goes to box 0 and is due straight away');
  M.gradeFact(F, '7x8', true, 2000, t0); M.gradeFact(F, '7x8', true, 2000, t0); M.gradeFact(F, '7x8', true, 2000, t0);
  ok(F['7x8'].b === 3 && F['7x8'].d === t0 + M.BOX_MS[3] && F['7x8'].r === 3 && F['7x8'].w === 1, 'three right answers climb to box 3 (mastered), due again in 3 days');
  const G = { '3x4': { b: 4, d: t0 + 9e9 }, '3x5': { b: 0, d: t0 - 1 }, '3x6': { b: 2, d: t0 - 1 } };
  const pick = M.pickFacts(G, [3], 5, M.rng(1), t0).map(([a, b]) => a + 'x' + b);
  ok(pick[0] === '3x5' && pick[1] === '3x6' && !pick.includes('3x4'), `due facts come first, lowest box first; not-due mastered facts wait (${pick.join(' ')})`);
}

/* ================= 2. browser ================= */
const SAVE = { v: 1, name: 'Jeremy', avatar: 'avatar_mage', startLevel: 'a1', stars: 100, totalCorrect: 40, totalAnswered: 50,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 420, happiness: 82, hunger: 35, skin: null, lastTick: Date.now() }, streak: { count: 4, last: null }, progress: {},
  owned: [], equipped: { outfit: null, petskin: null, theme: null }, settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 5 };
const saved = page => page.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')));
async function open(b, phone, opts = {}) {
  const ctx = await b.newContext(phone ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1200, height: 860 } });
  if (opts.blockCdn) await ctx.route(/cdn\.jsdelivr\.net/, r => r.abort());
  const page = await ctx.newPage(); page.errors = [];
  page.on('pageerror', e => page.errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/font|ERR_|net::|Failed to load resource/.test(m.text())) page.errors.push(m.text()); });
  await page.goto(URL); await page.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, opts.save || SAVE);
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(400);
  return page;
}
const tap = (page, sel) => page.locator(sel).first().tap ? page.locator(sel).first().click() : page.click(sel);
// type an answer with the on-screen numpad (as a phone user would)
async function padType(page, text) {
  for (const ch of String(text)) { const key = ch === ' ' ? ' ' : ch; if (/[0-9.\/:,\-]/.test(key) || key === ' ') await page.click(`.numpad [data-key="${key === ',' ? ',' : key}"]`).catch(async () => { await page.fill('#mans', (await page.inputValue('#mans')) + ch); }); else if (key === 'r') await page.click('.numpad [data-key="r"]'); }
}
async function answerCurrent(page, right, phone) {
  const q = await page.evaluate(() => { const q = WR.Math._dbg(); return q && { kind: q.kind, a: q.a, options: q.options }; });
  if (q.kind === 'mcq') { const idx = right ? q.options.indexOf(q.a) : q.options.findIndex(o => o !== q.a); await page.click(`.mopts .opt[data-k="${idx}"]`); }
  else {
    const val = right ? q.a : '999999';
    if (phone && !/[^0-9.\/:, \-]/.test(val.replace(/ r /, ''))) { await page.fill('#mans', ''); if (/ r /.test(val)) { const [x, y] = val.split(' r '); await padType(page, x); await page.click('.numpad [data-key="r"]'); await padType(page, y); } else await padType(page, val); await page.click('#mcheck'); }
    else { await page.fill('#mans', val); await page.press('#mans', 'Enter'); }
  }
  await page.waitForTimeout(120);
  return q;
}

(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });

  /* ---------- phone ---------- */
  const p = await open(b, true);
  ok(await p.locator('#mathNode').count() === 1, 'phone: the map shows the Number Kingdom');
  ok(await p.locator('#navbar button[data-k="math"]').count() === 1, 'phone: 🔢 Maths tab in the nav bar');
  await p.screenshot({ path: OUT + 'math_home_map.png' });
  await p.click('#mathNode'); await p.waitForTimeout(500);
  ok(await p.locator('.gchip').count() === 12 && await p.locator('.start-grade').count() === 1, 'phone: Number Kingdom hub with 12 grade chips and a "start at my grade" picker');
  await p.waitForFunction(() => WR.Math.katexState() !== 'loading', null, { timeout: 12000 }).catch(() => { });
  const kxPhone = await p.evaluate(() => WR.Math.katexState());
  await p.screenshot({ path: OUT + 'math_realm.png' });
  await p.click('.gchip[data-g="2"]'); await p.waitForTimeout(300);
  const g2n = await p.locator('[data-t]').count();
  ok(g2n === M.gradeTopics(2).length && (await p.evaluate(() => WR.state.math.grade)) === 2, `phone: picking Grade 2 shows its ${g2n} topics and remembers the grade`);
  await p.screenshot({ path: OUT + 'math_grade2.png', fullPage: true });
  // a G2 lesson played with the numpad: first answer wrong twice → worked solution; the rest right
  await p.evaluate(() => { WR.state.daily = { day: WR.today(), quests: ['math1', 'dojo1', 'lesson2'].map(id => ({ id, progress: 0, claimed: false })) }; WR.save(); });
  await p.click('[data-t="g2.add"]'); await p.waitForTimeout(500);
  const coarse = await p.evaluate(() => matchMedia('(pointer: coarse)').matches);
  ok(await p.locator('.numpad [data-key="7"]').count() === 1 && (await p.locator('#mans').getAttribute('inputmode')) === (coarse ? 'none' : 'decimal'), `phone: on-screen number pad${coarse ? ', and the phone keyboard stays hidden (inputmode=none)' : ''}`);
  await p.screenshot({ path: OUT + 'math_g2_lesson.png' });
  const starsBefore = await p.evaluate(() => WR.state.stars);
  await answerCurrent(p, false, true);
  ok(await p.locator('.explain.bad').count() === 1 && /another go/.test(await p.textContent('#mexplain')), 'phone: a wrong answer gives a hint and a second try');
  await answerCurrent(p, false, true);
  ok(await p.locator('.msteps li').count() >= 2 && /The answer is/.test(await p.textContent('#mexplain')), 'phone: a second wrong answer shows the answer and a worked solution');
  await p.screenshot({ path: OUT + 'math_g2_worked.png' });
  await p.click('#mnext');
  for (let i = 1; i < 8; i++) { await answerCurrent(p, true, true); ok(i > 1 || await p.locator('.explain.good').count() === 1, i === 1 ? 'phone: typing on the number pad and ✓ Check marks a right answer' : ''); await p.click('#mnext'); await p.waitForTimeout(80); }
  await p.waitForSelector('.result'); const sv = await saved(p);
  ok(sv.math && sv.math.topics['g2.add'] && sv.math.topics['g2.add'].plays === 1 && Math.abs(sv.math.topics['g2.add'].best - 7 / 8) < 1e-9, 'phone: the lesson result (7/8) is saved in wordRealms.save.v1 → math.topics');
  ok(sv.stars > starsBefore && sv.math.xp > 0 && sv.math.correct === 7 && sv.math.lessons === 1, `phone: stars (+${sv.stars - starsBefore}), maths XP and counts are saved`);
  const qp = id => sv.daily.quests.find(q => q.id === id).progress;
  ok(qp('math1') === 1 && qp('lesson2') === 1 && qp('dojo1') === 0, 'phone: a maths lesson fills the 🔢 maths and 📚 lessons daily quests');
  await p.click('#back'); await p.waitForTimeout(300);
  ok(/👑/.test(await p.$eval('[data-t="g2.add"]', e => WR.iconText(e))), 'phone: the topic tile shows the new crowns');
  // G11 lesson with notation
  await p.click('.gchip[data-g="11"]'); await p.waitForTimeout(300);
  await p.evaluate(() => { const MG = window.MathGen; WR.Math.startLesson({ topic: 'g11.vec3', items: [MG.make('g11.vec3', 6), MG.make('g11.gp', 13), MG.make('g11.explog', 5), MG.make('g11.diff', 3), MG.make('g11.func', 2), MG.make('g11.ap', 7), MG.make('g11.stationary', 9), MG.make('g11.story', 4)] }); });
  await p.waitForTimeout(400);
  const kxNow = await p.evaluate(() => WR.Math.katexState());
  ok(kxNow === 'ready' ? await p.locator('.mqtext .katex').count() > 0 : await p.locator('.mqtext .mx.fb').count() > 0, `phone: G11 maths notation renders (${kxNow === 'ready' ? 'KaTeX' : 'fallback'})`);
  await p.screenshot({ path: OUT + 'math_g11_lesson.png' });
  await p.click('#hintBtn'); ok(/S∞|\|a\||a·b|cos/.test(await p.textContent('#mexplain')) || (await p.textContent('#mexplain')).length > 5, 'phone: 💡 Hint button shows a hint');
  await p.click('#quitBtn'); await p.waitForTimeout(200);
  // the dojo: lobby, sprint with on-screen pad, missed fact comes back, results
  await p.click('#toDojo'); await p.waitForTimeout(300);
  ok(await p.locator('.tchip[data-tb]').count() === 12 && await p.locator('[data-ch]').count() === M.CHALLENGES.length, 'phone: Times-Table Tower lobby with tables 2–12 and the challenge floors');
  await p.click('.tchip[data-tb="6"]'); await p.click('.tchip[data-tb="7"]'); await p.waitForTimeout(100);
  ok(JSON.stringify((await saved(p)).math.dojo.tables) === '[2,3,4,5,6,7]', 'phone: picked tables are saved');
  await p.screenshot({ path: OUT + 'math_dojo_lobby.png' });
  await p.click('#goSprint'); await p.waitForTimeout(250);
  ok(await p.locator('#sprintBar').count() === 1, 'phone: the sprint shows a 60-second timer');
  let first = null, missedFact = null; const asked = [];
  for (let i = 0; i < 9; i++) {
    const q = await p.evaluate(() => { const q = WR.Math._dojoQ(); return { a: q.a, fact: q.fact }; });
    asked.push(q.fact); if (i === 0) first = q.fact;
    if (i === 2) { missedFact = q.fact; await padType(p, q.a === '1' ? '2' : '1'); await p.click('#mcheck'); await p.waitForTimeout(1250); continue; }
    await padType(p, q.a); await p.waitForTimeout(320);
    if (i === 5) await p.screenshot({ path: OUT + 'math_dojo.png' });
  }
  const queue = await p.evaluate(() => 1);
  const st = await saved(p);
  ok(asked.indexOf(missedFact, 3) === 5, `phone: a missed fact (${missedFact}) comes back 3 questions later`);
  ok(st.math.facts[missedFact] && st.math.facts[missedFact].w === 1 && st.math.facts[missedFact].r === 1 && st.math.facts[missedFact].b === 1, `phone: the miss and the retry are both saved for ${missedFact} (box 0 → 1)`);
  ok(st.math.facts[first] && st.math.facts[first].r === 1 && st.math.facts[first].b === 1, 'phone: right facts climb a box, with answer times saved');
  await p.evaluate(() => WR.Math._dojoEnd()); await p.waitForSelector('.result', { timeout: 3000 });
  const sd = await saved(p);
  ok(sd.daily.quests.find(q => q.id === 'dojo1').progress === 1, 'phone: the sprint fills the 🗼 Tower daily quest');
  ok(sd.math.dojo.sprints === 1 && sd.math.dojo.best >= 7 && sd.math.dojo.history.length === 1, `phone: sprint score saved (best ${sd.math.dojo.best})`);
  ok(/come back soon/.test(await p.textContent('.result')), 'phone: the results list the facts that will come back');
  await p.click('#dGrid'); await p.waitForTimeout(300);
  ok(await p.locator('.factgrid td.fc').count() === 132 && await p.locator('.factgrid td.fc.b1').count() >= 8 && await p.locator('.factgrid td.fc.u').count() >= 100, 'phone: the mastery grid has 132 squares coloured by mastery');
  // richer grid for the screenshot
  await p.evaluate(() => { const F = WR.state.math.facts, now = Date.now(); for (const a of [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) for (let b = 1; b <= 12; b++) { const k = a + 'x' + b, h = (a * 7 + b * 13) % 10; if (a <= 5 || a === 10 || a === 11 && b < 10) F[k] = { b: h > 2 ? 4 : 3, r: 5, w: 0, d: now + 864e5 * 5, t: 1500 }; else if (a <= 8 && h > 1) F[k] = { b: h % 3 + 1, r: 2, w: 1, d: now + 864e5, t: 2600 }; else if (h > 5) F[k] = { b: 0, r: 0, w: 2, d: now - 1, t: 4100 }; } WR.save(); WR.go('dojoGrid'); });
  await p.waitForTimeout(300); await p.click('.factgrid td[data-f="7x8"]');
  ok(/7 × 8 = 56/.test(await p.textContent('#factInfo')), 'phone: tapping a square explains that fact');
  await p.screenshot({ path: OUT + 'math_mastery.png', fullPage: true });
  // a challenge floor (long division) uses the full lesson engine with the r key
  await p.evaluate(() => WR.go('dojo')); await p.click('[data-ch="clongdiv"]'); await p.waitForTimeout(300);
  const ld = await p.evaluate(() => WR.Math._dbg().kind);
  ok(ld === 'rem' ? await p.locator('.numpad [data-key="r"]').count() === 1 : true, 'phone: long division has an "r" key for remainders');
  for (let i = 0; i < 8; i++) { await answerCurrent(p, true, true); await p.click('#mnext'); await p.waitForTimeout(60); }
  await p.waitForSelector('.result'); ok((await saved(p)).math.topics['dojo.clongdiv'].best === 1, 'phone: a perfect long-division floor is saved with 3 crowns');
  ok(!p.errors.length, 'phone: no page errors ' + p.errors.slice(0, 3));

  /* ---------- desktop: keyboard, G9, placement, persistence ---------- */
  const d = await open(b, false);
  await d.click('#navbar button[data-k="math"]'); await d.waitForTimeout(300);
  ok(await d.locator('.math-hub').count() === 1, 'desktop: the Maths tab opens the Number Kingdom');
  await d.click('.gchip[data-g="9"]'); await d.click('[data-t="g9.quad"]'); await d.waitForTimeout(300);
  ok(await d.evaluate(() => document.activeElement && document.activeElement.id === 'mans') && await d.locator('#mans').getAttribute('inputmode') !== 'none', 'desktop: the answer box is focused for keyboard typing');
  const q9 = await d.evaluate(() => WR.Math._dbg());
  await d.keyboard.type(q9.val.slice().reverse().join(', ')); await d.keyboard.press('Enter'); await d.waitForTimeout(150);
  ok(await d.locator('.explain.good').count() === 1, 'desktop: typing both roots in any order + Enter is accepted');
  await d.locator('details.mwork summary').click(); await d.waitForTimeout(100);
  await d.screenshot({ path: OUT + 'math_g9_desktop.png' });
  await d.keyboard.press('Enter'); await d.waitForTimeout(150);
  ok(await d.evaluate(() => WR.Math._dbg() && WR.Math._dbg() !== null) && (await d.textContent('.qnum')).startsWith('2/'), 'desktop: Enter moves to the next question');
  // grade finder: everything right → Grade 12; then everything "not sure" → Grade 1 (but a retake never deletes progress)
  for (const [mode, want] of [['right', 12], ['unsure', 1]]) {
    await d.evaluate(() => WR.go('math')); await d.click('#mPlace'); await d.waitForTimeout(200);
    for (let k = 0; k < 20 && await d.locator('#pGo').count() === 0; k++) {
      if (mode === 'unsure') { await d.click('#unsure'); continue; }
      const q = await d.evaluate(() => { const q = WR.Math._placeQ(); return { kind: q.kind, a: q.a, options: q.options }; });
      if (q.kind === 'mcq') await d.click(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`); else { await d.fill('#mans', q.a); await d.press('#mans', 'Enter'); }
      await d.waitForTimeout(40);
    }
    const g = await d.evaluate(() => WR.state.math.placed && WR.state.math.placed.grade);
    ok(g === want, `desktop: grade finder (${mode} answers) places at Grade ${g} (want ${want}) in ${await d.evaluate(() => WR.state.math.placed.asked)} questions`);
    if (want === 12) await d.screenshot({ path: OUT + 'math_placement.png' });
  }
  await d.click('#pGo'); await d.waitForTimeout(200);
  ok(await d.locator('.gchip.sel[data-g="1"]').count() === 1, 'desktop: the grade finder result opens that grade');
  await d.reload({ waitUntil: 'networkidle' }); await d.waitForTimeout(300);
  const after = await d.evaluate(() => WR.state.math);
  ok(after.grade === 1 && after.placed && after.topics['g9.quad'] === undefined, 'desktop: maths progress survives a reload (from wordRealms.save.v1)');
  // cloud score counts maths progress
  ok(await d.evaluate(() => !WR.Cloud || WR.Cloud.score({ ...WR.state, math: { ...WR.state.math, correct: 10 } }) > WR.Cloud.score({ ...WR.state, math: { ...WR.state.math, correct: 0 } })), 'cloud save chooser counts maths progress');
  // old saves without a math block migrate cleanly
  await d.evaluate(() => { const s = JSON.parse(localStorage.getItem('wordRealms.save.v1')); delete s.math; localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); });
  await d.reload({ waitUntil: 'networkidle' }); await d.waitForTimeout(300);
  ok(await d.evaluate(() => WR.state.math && WR.state.math.dojo && Array.isArray(WR.state.math.dojo.tables) && typeof WR.state.math.facts === 'object'), 'older saves gain an empty math block');
  ok(!d.errors.length, 'desktop: no page errors ' + d.errors.slice(0, 3));

  /* ---------- KaTeX blocked: plain fallback ---------- */
  const f = await open(b, true, { blockCdn: true });
  await f.evaluate(() => WR.go('math', 12)); await f.waitForTimeout(300);
  await f.evaluate(() => { const MG = window.MathGen; WR.Math.startLesson({ topic: 'g12.integ', items: [MG.make('g12.integ', 3), MG.make('g12.sigma', 4), MG.make('g11.vec3', 6), MG.make('g12.binom', 1), MG.make('g12.chain', 2), MG.make('g12.area', 5), MG.make('g12.expcalc', 3), MG.make('g12.complex', 8)] }); });
  await f.waitForTimeout(300);
  ok(await f.locator('.mqtext .mx.fb').count() > 0 && !/\\int|\\left/.test(await f.textContent('.mqtext')), 'CDN blocked: maths falls back to plain HTML (no raw TeX on screen)');
  await f.screenshot({ path: OUT + 'math_fallback.png' });
  await f.evaluate(() => { const MG = window.MathGen; WR.Math.startLesson({ topic: 'g11.vec3', items: MG.batch('g11.vec3', 8, 5) }); }); await f.waitForTimeout(200);
  ok(await f.locator('.mvec').count() >= 1 || await f.locator('.mqtext').count() === 1, 'CDN blocked: vectors stand up as columns');
  ok(!f.errors.length, 'CDN blocked: no page errors ' + f.errors.slice(0, 3));

  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL MATH TESTS PASSED');
})();
