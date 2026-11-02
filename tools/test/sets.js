// 🫧 Venn Bubble Club: MOE Sec 3/4 N8 set language and notation (ξ, n(A), ∈ / ∉, A′, ∅, ⊂, union and intersection, Venn
// diagrams). Node checks read every diagram back from the SVG: the circles, the four regions (a = A only, b = A ∩ B,
// c = B only, d = outside), the counts written in them and every drawn element, which must sit inside its own region
// (nested circles for B ⊂ A, apart for A ∩ B = ∅). Each answer is worked out again from what is printed (counts,
// n(A) = n(A only) + n(A ∩ B), n(A ∪ B) = n(A) + n(B) − n(A ∩ B), the x equation, the shaded regions, the listed sets, the
// statements about the members). Every option has a why / why-not note and typed slips get one too. Then a phone flow at
// 375 and 320 px that shows the notes. Run: node tools/test/sets.js (game served on :18642). Screenshots: screenshots/sets_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const ID = 'g9.sets';

/* ---------- 1. generators (Node) ---------- */
const t = M.topic(ID);
ok(t && t.grade === 9 && t.name === 'Venn Bubble Club' && t.icon === '🫧', `🫧 Venn Bubble Club is a Grade 9 (Sec 3) topic (${t && t.desc})`);
ok(M.TOPICS.length >= 120, `it is one of ${M.TOPICS.length} maths topics (120 when it was added)`);
{ const g = M.gradeTopics(9).map(x => x.id), i = g.indexOf(ID); ok(g[i - 1] === 'g9.ineq' && g[i + 1] === 'g9.story', 'it sits after Inequality Gates (number and algebra), before Royal Challenges: ' + g.join(' ')); }
const attr = (tag, a) => { const m = tag.match(new RegExp(`\\b${a}="([^"]*)"`)); return m ? m[1] : null; };
const readVenn = svg => {
  const C = {}; for (const m of svg.matchAll(/<circle class="vcirc"[^>]*>/g)) C[attr(m[0], 'data-n')] = [+attr(m[0], 'cx'), +attr(m[0], 'cy'), +attr(m[0], 'r')];
  const regs = [...svg.matchAll(/<path class="vreg"[^>]*>/g)].map(m => ({ r: attr(m[0], 'data-r'), shade: attr(m[0], 'data-shade') === '1' }));
  const nums = Object.fromEntries([...svg.matchAll(/class="vnum" data-r="(\w)" data-t="([^"]+)"/g)].map(m => [m[1], m[2]]));
  const els = [...svg.matchAll(/<text class="vel"[^>]*>/g)].map(m => ({ r: attr(m[0], 'data-r'), t: +attr(m[0], 'data-t'), p: [+attr(m[0], 'x'), +attr(m[0], 'y') - 4.5] }));
  const tot = Object.fromEntries([...svg.matchAll(/class="vtot" data-n="(\w)"[^>]*>([^<]+)</g)].map(m => [m[1], +m[2].split('=')[1]]));
  const rect = (svg.match(/<rect x="14" y="34" width="272" height="174"/) || [])[0];
  return { C, regs, nums, els, tot, rect };
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const region = (C, p) => { const a = dist(p, C.A) < C.A[2], b = dist(p, C.B) < C.B[2]; return a && b ? 'b' : a ? 'a' : b ? 'c' : 'd'; };
const REG = { 'A ∩ B': 'b', 'A ∪ B': 'abc', 'A′': 'cd', 'B′': 'ad', 'A ∩ B′': 'a', 'A′ ∩ B': 'c', '(A ∪ B)′': 'd', '(A ∩ B)′': 'acd', 'A′ ∪ B': 'bcd', 'A ∪ B′': 'abd', A: 'ab', B: 'bc', 'ξ': 'abcd' };
const TEX = { 'A \\cap B': 'A ∩ B', 'A \\cup B': 'A ∪ B', "A'": 'A′', "B'": 'B′', "A \\cap B'": 'A ∩ B′', "A' \\cap B": 'A′ ∩ B', "(A \\cup B)'": '(A ∪ B)′', "(A \\cap B)'": '(A ∩ B)′', "A' \\cup B": 'A′ ∪ B', "A \\cup B'": 'A ∪ B′', A: 'A', B: 'B' };
const setOf = o => { const m = o.match(/\\\{([^\\]*)\\\}/); return o.includes('varnothing') ? [] : m ? m[1].split(',').map(Number) : null; };
const RULES = { 'a multiple of 2': x => x % 2 === 0, 'a multiple of 3': x => x % 3 === 0, 'a multiple of 4': x => x % 4 === 0, 'a multiple of 5': x => x % 5 === 0, 'an odd number': x => x % 2 === 1,
  'a prime number': x => x > 1 && [...Array(x).keys()].slice(2).every(d => x % d), 'a square number': x => Number.isInteger(Math.sqrt(x)), 'a factor of 12': x => 12 % x === 0, 'a factor of 18': x => 18 % x === 0,
  'a factor of 20': x => 20 % x === 0, 'greater than 10': x => x > 10, 'less than 7': x => x < 7 };
const kinds = {}, bad = [], wrong = [], scale = [], notes = [];
const N = 9000;
for (let s = 1; s <= N; s++) {
  const q = M.make(ID, s * 2654435761 >>> 0), d = q.data, js = JSON.stringify(q), key = d.venn + (d.venn === 'sym' ? '/' + d.layout : d.venn === 'read' || d.venn === 'story' || d.venn === 'alg' ? '/' + d.k : '');
  kinds[key] = (kinds[key] || 0) + 1;
  if (/NaN|Infinity|undefined|\[object/.test(js) || !M.check(q, q.a).ok || !q.hint || !q.steps.length || !/^[A-Z]/.test(q.q)) bad.push(q.q);
  if (/\p{Extended_Pictographic}/u.test(q.q + q.steps.join('') + q.hint + JSON.stringify(q.why || q.slips || ''))) bad.push('emoji in text');
  if (q.steps.some(x => /[\t\f\v]/.test(x))) bad.push('control character in steps (a lost backslash)');
  if (q.kind === 'mcq') {
    if (q.options.length !== 4 || new Set(q.options).size !== 4 || q.options.filter(o => o === q.a).length !== 1) bad.push('options ' + key + ' ' + q.options.join(' ; '));
    if (!q.why || q.options.some(o => !q.why[o] || q.why[o].length < 20 || M.whyNote(q, o) !== q.why[o])) notes.push('mcq note missing');
    const num = (q.a.match(/\d+/g) || []); if (!num.every(n => q.why[q.a].includes(n))) notes.push('right note does not give the answer ' + q.a);
    if (new Set(q.options.map(o => q.why[o])).size !== 4) notes.push('two options share a note');
  } else {
    if (!q.slips || q.slips.length < 2) notes.push('typed question with fewer than 2 slips: ' + key);
    else { if (q.slips.some(([v, txt]) => M.check(q, String(v)).ok || !txt || txt.length < 20 || M.whyNote(q, String(v)) !== txt)) notes.push('slip is right or has no note');
      if (M.whyNote(q, q.a)) notes.push('the right answer got a why-not note'); }
    if (!Number.isInteger(q.val) || q.val <= 0) wrong.push('typed answer is not a positive whole number ' + q.val);
  }
  if (d.venn === 'list') { // the listed set, worked out again from the rules
    const m = q.q.match(/A = \{x : x is ([^}]+)\} and B = \{x : x is ([^}]+)\}/), U = Array.from({ length: d.N }, (_, i) => i + 1), A = U.filter(RULES[m[1]]), B = U.filter(RULES[m[2]]);
    const op = { 'A ∩ B': x => A.includes(x) && B.includes(x), 'A ∪ B': x => A.includes(x) || B.includes(x), 'A ∩ B′': x => A.includes(x) && !B.includes(x), 'A′ ∩ B': x => !A.includes(x) && B.includes(x), '(A ∪ B)′': x => !A.includes(x) && !B.includes(x) }[d.k];
    if (JSON.stringify(U.filter(op)) !== JSON.stringify(setOf(q.a))) wrong.push(`list ${d.k}: ${q.a} vs ${U.filter(op)}`);
    if (q.options.filter(o => JSON.stringify(setOf(o)) === JSON.stringify(U.filter(op))).length !== 1) wrong.push('two options list the same set');
    if (!q.q.includes(`\\xi = \\{1, 2, 3, \\ldots, ${d.N}\\}`)) wrong.push('ξ not given');
    continue;
  }
  const F = readVenn(q.pic), { C } = F;
  if (!F.rect || !C.A || !C.B) { scale.push('no ξ rectangle or circles'); continue; }
  const inside = (P, R) => P[0] - P[2] > 14 && P[0] + P[2] < 286 && P[1] - P[2] > 34 && P[1] + P[2] < 208;
  if (!inside(C.A) || !inside(C.B)) scale.push('a circle pokes out of the ξ rectangle');
  const gap = dist(C.A, C.B), lay = d.layout || 'two';
  if (lay === 'two' && !(gap < C.A[2] + C.B[2] - 20 && gap > Math.abs(C.A[2] - C.B[2]) + 20)) scale.push('the circles do not overlap properly');
  if (lay === 'sub' && !(gap + C.B[2] < C.A[2] - 6)) scale.push('B is not drawn inside A');
  if (lay === 'apart' && !(gap > C.A[2] + C.B[2] + 6)) scale.push('A and B touch');
  const want = { two: 'abcd', sub: 'abd', apart: 'acd' }[lay]; if (F.regs.map(g => g.r).sort().join('') !== want) scale.push('regions ' + F.regs.map(g => g.r).join(''));
  for (const [k, txt] of Object.entries(F.nums)) { const at = { two: { a: [80, 125], b: [150, 125], c: [220, 125], d: [262, 196] } }.two[k]; if (region(C, at) !== k) scale.push(`count ${txt} is not in region ${k}`); }
  if (d.venn === 'read' || d.venn === 'story' || d.venn === 'alg') {
    const R = d.R;
    if (d.venn === 'read') { const n = F.nums; if (['a', 'b', 'c', 'd'].some(k => +n[k] !== R[k])) wrong.push('counts not printed'); if (nOfK(d.k, n) !== q.val) wrong.push(`read ${d.k}: ${nOfK(d.k, n)} vs ${q.val}`); }
    if (d.venn === 'story') { const nums = (q.q.replace(/\([^)]*\)/g, '').match(/\d+/g) || []).map(Number), [Nn, nA, nB] = nums;
      if (Nn !== R.a + R.b + R.c + R.d) wrong.push('ξ count');
      if (d.k === 'both' && nA + nB - (Nn - nums[3]) !== q.val) wrong.push('both');
      if (d.k === 'neither' && Nn - (nA + nB - nums[3]) !== q.val) wrong.push('neither');
      if (d.k === 'aonly' && Nn - nums[1] - nums[3] !== q.val) wrong.push('aonly ' + nums);
      if (d.k === 'one' && (nA - nums[3]) + (nB - nums[3]) !== q.val) wrong.push('one');
      if (d.k !== 'aonly' && (F.tot.A !== nA || F.tot.B !== nB)) wrong.push('n(A), n(B) not on the diagram');
      const xk = Object.keys(F.nums).find(k => F.nums[k] === 'x'); if (d.k !== 'one' && { both: 'b', neither: 'd', aonly: 'a' }[d.k] !== xk) wrong.push('x is in the wrong region'); }
    if (d.venn === 'alg') { const ev = (e, x) => e.split(' + ').reduce((s, t) => s + (t.endsWith('x') ? (+(t.slice(0, -1)) || 1) * x : +t), 0), Nn = +q.q.match(/n\(ξ\) = (\d+)/)[1];
      const xs = [...Array(30).keys()].filter(x => ['a', 'b', 'c', 'd'].reduce((s, k) => s + ev(F.nums[k], x), 0) === Nn);
      if (xs.length !== 1 || xs[0] !== d.x) wrong.push('the x equation from the diagram gives ' + xs);
      else if ((d.k === 'x' ? d.x : ev(F.nums.a, d.x) + d.x) !== q.val) wrong.push('alg answer'); }
  }
  if (d.venn === 'shade') { const sh = F.regs.filter(g => g.shade).map(g => g.r).sort().join(''), name = TEX[q.a.slice(1, -1)];
    if (REG[name] !== sh) wrong.push(`shade: ${name} is ${REG[name]}, shaded ${sh}`);
    q.options.filter(o => o !== q.a).forEach(o => { if (REG[TEX[o.slice(1, -1)]] === sh) wrong.push('a wrong option names the shaded part too'); }); }
  if (d.venn === 'sym') { const E = d.E, want = Object.values(E).flat().length;
    if (F.els.length !== want) scale.push(`only ${F.els.length} of ${want} elements drawn`);
    F.els.forEach(e => { if (region(C, e.p) !== e.r || !E[e.r].includes(e.t)) scale.push(`element ${e.t} is drawn in region ${region(C, e.p)}, tagged ${e.r}`);
      if ([C.A, C.B].some(P => Math.abs(dist(e.p, P) - P[2]) < 8)) scale.push(`element ${e.t} touches a circle edge`); });
    if (F.els.some((e, i) => F.els.some((f, j) => j > i && dist(e.p, f.p) < 15))) scale.push('two elements overlap');
    const inA = x => F.els.some(e => e.t === x && (e.r === 'a' || e.r === 'b')), inB = x => F.els.some(e => e.t === x && (e.r === 'b' || e.r === 'c')), U = F.els.map(e => e.t);
    const truth = o => { const s = o.slice(1, -1); let m;
      if ((m = s.match(/^(\d+) \\in A$/))) return inA(+m[1]); if ((m = s.match(/^(\d+) \\notin B$/))) return !inB(+m[1]);
      if (s === 'B \\subset A') return U.filter(inB).every(inA) && U.filter(inA).length > U.filter(inB).length; if (s === 'A \\subset B') return U.filter(inA).every(inB) && U.filter(inB).length > U.filter(inA).length;
      if (s === 'A \\cap B = \\varnothing') return !U.some(x => inA(x) && inB(x));
      if ((m = s.match(/^n\(A'\) = (\d+)$/))) return U.filter(x => !inA(x)).length === +m[1]; if ((m = s.match(/^n\(A \\cup B\) = (\d+)$/))) return U.filter(x => inA(x) || inB(x)).length === +m[1];
      return null; };
    const tv = q.options.map(truth); if (tv.some(v => v === null)) wrong.push('unknown statement ' + q.options); else if (tv.filter(Boolean).length !== 1 || !truth(q.a)) wrong.push('sym: not exactly one true statement ' + q.options + ' / ' + q.a); }
}
function nOfK(k, n) { return [...REG[k]].reduce((s, r) => s + +n[r], 0); }
ok(!bad.length, `${N.toLocaleString()} Venn Bubble Club questions pass the checker, start with a capital, have a hint and worked steps, no emoji, and multiple choice has 4 different options ${bad.slice(0, 3)}`);
ok(!notes.length, `every option has its own why / why-not note, the right one restates the answer, and typed questions name their usual slips ${[...new Set(notes)].slice(0, 3)}`);
ok(!wrong.length, `every answer is worked out again from what the diagram and the question print ${[...new Set(wrong)].slice(0, 4)}`);
ok(!scale.length, `every diagram is true: circles inside ξ, overlapping / nested / apart as the sets need, counts and every element in their own region ${[...new Set(scale)].slice(0, 4)}`);
ok(['read/A', 'read/B', 'read/A ∩ B', 'read/A ∪ B', 'read/A′', 'read/B′', 'read/A ∩ B′', 'read/(A ∪ B)′', 'read/ξ', 'story/both', 'story/neither', 'story/aonly', 'story/one', 'alg/x', 'alg/nA', 'shade', 'list', 'sym/two', 'sym/sub', 'sym/apart'].every(k => kinds[k] > 50), 'all question types appear: ' + JSON.stringify(kinds));
{ const qs = Array.from({ length: 3000 }, (_, s) => M.make(ID, s + 1));
  ok(new Set(qs.filter(q => q.data.venn === 'shade').map(q => q.data.k)).size >= 10, 'the shading questions cover 10 different sets (∩, ∪, complements, A ∩ B′, (A ∪ B)′ …)');
  ok(qs.filter(q => q.data.venn === 'list').some(q => q.a.includes('varnothing')), 'some listing questions have the empty set ∅ as the answer');
  ok(qs.filter(q => q.data.venn === 'read' && q.data.k === 'A ∪ B').every(q => q.slips.some(s => s[0] === q.data.R.a + 2 * q.data.R.b + q.data.R.c)), 'n(A ∪ B) questions name the "counted the overlap twice" slip');
  ok(qs.filter(q => q.data.venn === 'story' && q.data.k === 'both' && q.data.R.b > q.data.R.d).every(q => q.slips.some(s => /neither were left out/.test(s[1]))), 'survey questions name the "forgot the ones in neither" slip (when it gives a count)');
  ok(qs.filter(q => q.data.venn === 'shade').every(q => q.options.filter(o => o !== q.a).every(o => /it would shade/.test(q.why[o]))), 'each wrong set name says which regions it would shade');
  ok(qs.every(q => !/minister|politic|election|war\b|kill|blood|weapon|gun|knife|money|beer|wine/i.test(q.q)), 'kid themes only');
  ok(qs.every(q => q.uid && /^venn\|/.test(q.uid) && (q.data.venn === 'list' || q.pic)), 'every question has a uid (anti-farm) and every Venn question a drawn diagram'); }
ok([1, 2, 3, 99].every(s => { const r = M.batch(ID, 8, s); return r.length === 8 && new Set(r.map(q => q.uid || q.q + q.a)).size === 8; }), 'a lesson of 8 has no repeated question');
{ global.window = global.window || {}; } // the TeX fallback knows the set symbols (shown before KaTeX loads, or offline)
{ const src = require('fs').readFileSync(ROOT + '/js/math.js', 'utf8'); ok(['cap: "∩"', 'cup: "∪"', 'xi: "ξ"', 'varnothing: "∅"', 'notin: "∉"', 'subset: "⊂"', 'ldots: "…"'].every(x => src.includes(x)), 'the plain TeX fallback draws ∩ ∪ ξ ∅ ∉ ⊂ …'); }

/* ---------- 2. phone ---------- */
const SAVE = { v: 1, name: 'Jeremy', avatar: 'avatar_mage', startLevel: 'a1', stars: 100, totalCorrect: 40, totalAnswered: 50,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 420, happiness: 82, hunger: 35, skin: null, lastTick: Date.now() }, streak: { count: 4, last: null }, progress: {},
  owned: [], equipped: { outfit: null, petskin: null, theme: null }, settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 5 };
const seed = pred => { for (let s = 1; s < 20000; s++) if (pred(M.make(ID, s))) return s; };
const fits = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && [...document.querySelectorAll('.qcard .mpic, .mopts .opt')].every(e => { const r = e.getBoundingClientRect(); return r.right <= innerWidth + 1 && r.left >= -1; }));
const whyText = p => p.evaluate(() => [...document.querySelectorAll('#mexplain .why-not')].map(e => WR.iconText(e).trim()));
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const [w, h] of [[375, 667], [320, 658]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); const errors = [];
    p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/font|ERR_|net::|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    await p.goto(URL); await p.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE);
    await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(400);
    const D = q => q.data;
    const list = [seed(q => D(q).venn === 'story' && D(q).k === 'both'), seed(q => D(q).venn === 'shade' && D(q).k === 'A ∩ B′'), seed(q => D(q).venn === 'sym' && D(q).layout === 'sub'), seed(q => D(q).venn === 'list' && D(q).k === 'A ∩ B'),
      seed(q => D(q).venn === 'read' && D(q).k === 'A ∪ B'), seed(q => D(q).venn === 'alg' && D(q).k === 'x'), seed(q => D(q).venn === 'sym' && D(q).layout === 'apart'), seed(q => D(q).venn === 'read' && D(q).k === 'A′')];
    ok(list.every(Number.isInteger), `${w}px: a seed was found for every kind of question`);
    await p.evaluate(l => WR.Math.startLesson({ topic: 'g9.sets', items: l.map(s => MathGen.make('g9.sets', s)) }), list);
    await p.waitForTimeout(500);
    for (let i = 0; i < list.length; i++) {
      const q = await p.evaluate(() => WR.Math._dbg()), tag = `${w}px ${q.data.venn}${q.data.k ? '/' + q.data.k : ''}`;
      ok(await fits(p), `${tag}: the picture and the choices fit the screen with no sideways scroll`);
      const taps = await p.evaluate(() => Math.min(...[...document.querySelectorAll('.mopts .opt, #mcheck, .numpad button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().height)));
      ok(taps >= 40, `${tag}: answer buttons are easy to tap (${Math.round(taps)} px)`);
      if (q.data.venn !== 'list') ok(await p.locator('.qcard svg .vcirc').count() === 2 && await p.locator('.qcard svg .mvtx').count() === 2, `${tag}: the Venn diagram is drawn with circles A and B`);
      if (i < 4) { // a wrong answer first: its own why-not note; then the right one
        if (q.kind === 'mcq') { const wk = q.options.findIndex(o => o !== q.a); await p.locator(`.mopts .opt[data-k="${wk}"]`).click(); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.why[q.options[wk]].slice(0, 30))), `${tag}: a wrong pick shows its own why-not note`);
          if (w === 375 && i === 1) await p.locator('.qcard').screenshot({ path: OUT + 'sets_02_shade_why_not.png' });
          await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); await p.waitForTimeout(300);
          ok((await whyText(p)).some(x => x.includes(q.why[q.a].slice(0, 30))), `${tag}: the right answer shows why it works, in other words`);
          if (w === 375 && i === 2) await p.locator('.qcard').screenshot({ path: OUT + 'sets_03_subset_right.png' });
        } else { if (w === 375 && i === 0) await p.locator('.qcard').screenshot({ path: OUT + 'sets_01_survey_question.png' });
          await p.fill('#mans', String(q.slips[0][0])); await p.click('#mcheck'); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.slips[0][1].slice(0, 30))), `${tag}: typing the usual slip (${q.slips[0][0]}) shows its why-not note`);
          await p.fill('#mans', q.a); await p.click('#mcheck'); await p.waitForTimeout(300); }
      } else {
        if (q.kind === 'mcq') await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); else { await p.fill('#mans', q.a); await p.click('#mcheck'); }
        await p.waitForTimeout(300);
      }
      ok(await p.evaluate(() => /correct|got it/i.test(document.querySelector('.qcard').innerText)), `${tag}: the right answer is marked right`);
      if (q.data.venn === 'list' || q.data.venn === 'shade') ok(await p.evaluate(() => !/\\(cap|cup|xi|varnothing|ldots)/.test(document.querySelector('.qcard').innerText)), `${tag}: no raw TeX shows`);
      if (i < list.length - 1) { await p.click('#mnext'); await p.waitForTimeout(300); }
    }
    const m = await p.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).math);
    ok(m && m.correct >= list.length && m.answered >= list.length, `${w}px: answers are saved in wordRealms.save.v1 (math.correct ${m && m.correct}, answered ${m && m.answered})`);
    if (w === 375) {
      const st = await p.evaluate(s => { const q = MathGen.make('g9.sets', s), k = q.uid || 'g9.sets|' + q.q; const a = WR.awardStars('m', k + '|t', 1), b = WR.awardStars('m', k + '|t', 1); return [a, b]; }, list[1]).catch(() => null);
      ok(st && st[0] >= 1 && st[1] < st[0], `a replayed question pays less than the first time (${st})`);
      await p.evaluate(() => WR.go('math')); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '9'); b && b.click(); }); await p.waitForTimeout(400);
      ok(await p.locator('[data-t="g9.sets"]').count() === 1, 'the Grade 9 hub lists Venn Bubble Club');
      ok(await p.evaluate(() => { const e = document.querySelector('[data-t="g9.sets"]'); return !/\p{Extended_Pictographic}/u.test(e.innerText) && !!e.querySelector('img.wr-icon'); }), 'its hub card shows the painted bubbles icon, not an emoji');
    }
    ok(!errors.length, `${w}px: no page errors ${errors.slice(0, 2)}`);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall Venn Bubble Club checks passed');
})();
