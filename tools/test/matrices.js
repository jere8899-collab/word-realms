// 🧩 Matrix Meadow: MOE Sec 3/4 E-Math matrices — order, add/subtract, scalar multiply, matrix multiply
// (2×2 and light 2×3×3×2), determinant, inverse, and solve AX=B with X = A⁻¹B. Node checks recompute every
// answer from q.data (and from the matSvg grid: class mgrid + data-rows/cols, cells class mcell + data-r/c/v).
// Cleanup: shared matTex / matSvg kit in math-gen.js; V2/V3 column vectors now go through matTex.
// Run: node tools/test/matrices.js (game served on :18642). Screenshots: screenshots/matrices_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const ID = 'g10.matrices', fs = require('fs');
const { matTex, matSvg, simp, fracTex } = M._internal;

/* ---------- 1. generators (Node) ---------- */
const t = M.topic(ID);
ok(t && t.grade === 10 && t.name === 'Matrix Meadow' && t.icon === '🧩', `🧩 Matrix Meadow is a Grade 10 (Sec 3/4) topic (${t && t.desc})`);
ok(M.TOPICS.length >= 123, `it is one of ${M.TOPICS.length} maths topics (123 when it was added)`);
{ const g = M.gradeTopics(10).map(x => x.id), i = g.indexOf(ID);
  ok(g[i - 1] === 'g10.vectors' && g[i + 1] === 'g10.interest', 'it sits after Arrow Vectors, before Dragon Gold Interest: ' + g.join(' ')); }
// the clean-up: shared matrix kit (matTex, matSvg) lives in math-gen.js; V2/V3 call matTex
{ const I = M._internal, gen = fs.readFileSync(ROOT + '/js/math-gen.js', 'utf8'), h = fs.readFileSync(ROOT + '/js/math-topics-h.js', 'utf8');
  ok(typeof I.matTex === 'function' && typeof I.matSvg === 'function'
    && I.matTex([[3], [-4]]) === '\\begin{pmatrix} 3 \\\\ -4 \\end{pmatrix}'
    && I.matTex([[1, 2], [3, 4]]) === '\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}',
    'the shared matrix kit (matTex, matSvg) is on MathGen._internal');
  ok(/const matTex =/.test(gen) && /const matSvg =/.test(gen) && /matTex, matSvg/.test(gen)
    && /const V2 = v => matTex\(/.test(h) && /matTex, matSvg/.test(h),
    'V2/V3 now go through matTex and Matrix Meadow uses the shared kit');
  const svg = I.matSvg('Test', [[1, 2], [3, 4]]);
  ok(/class="mgrid"/.test(svg) && /data-rows="2"/.test(svg) && /data-cols="2"/.test(svg)
    && /class="mcell"[^>]*data-r="0"[^>]*data-c="1"[^>]*data-v="2"/.test(svg),
    'matSvg draws mgrid / mcell with readable data attrs'); }
const attr = (tag, a) => { const m = tag.match(new RegExp(`\\b${a}="([^"]*)"`)); return m ? m[1] : null; };
const readGrid = (svg, which = 'A') => {
  const g = (svg.match(new RegExp(`<g class="mgrid"[^>]*data-which="${which}"[^>]*>`)) || [])[0]
    || (svg.match(/<g class="mgrid"[^>]*>/) || [])[0];
  if (!g) return null;
  const nr = +attr(g, 'data-rows'), nc = +attr(g, 'data-cols');
  const cells = [...svg.matchAll(/<rect class="mcell"[^>]*>/g)].map(m => ({
    r: +attr(m[0], 'data-r'), c: +attr(m[0], 'data-c'), v: attr(m[0], 'data-v'), which: null
  }));
  // assign cells to grids by document order: first nr*nc → A, next → B
  const A = [], Bcells = [];
  const all = cells.slice();
  for (let r = 0; r < nr; r++) { A[r] = []; for (let c = 0; c < nc; c++) {
    const cell = all.find(x => x.r === r && x.c === c && x.which === null);
    if (!cell) return null; cell.which = 'A'; A[r][c] = cell.v.includes('/') || cell.v.includes('frac') ? cell.v : +cell.v;
  } }
  return { rows: nr, cols: nc, A, cells: all.filter(x => x.which === 'A') };
};
const mFmt = v => { if (Number.isInteger(v)) return String(v); const [n, d] = simp(Math.round(v * 2), 2); return d === 1 ? String(n) : fracTex(n, d); };
const mTex = A => matTex(A.map(row => row.map(mFmt)));
const mShow = A => '$' + mTex(A) + '$';
const mDet = A => A[0][0] * A[1][1] - A[0][1] * A[1][0];
const mMul = (A, B) => { const C = []; for (let i = 0; i < A.length; i++) { C[i] = []; for (let j = 0; j < B[0].length; j++) { let s = 0; for (let k = 0; k < B.length; k++) s += A[i][k] * B[k][j]; C[i][j] = s; } } return C; };
const kinds = {}, bad = [], wrong = [], scale = [], notes = [], N = +process.env.N || 9000;
for (let s = 1; s <= N; s++) {
  const q = M.make(ID, s * 2654435761 >>> 0), d = q.data, js = JSON.stringify(q), key = d.mat + (d.wide ? '/wide' : '');
  kinds[key] = (kinds[key] || 0) + 1;
  if (/NaN|Infinity|undefined|\[object/.test(js) || !M.check(q, q.a).ok || !q.hint || !q.steps.length || !/^[A-Z]/.test(q.q)) bad.push(key + ' ' + q.q);
  if (/\p{Extended_Pictographic}/u.test(q.q + q.steps.join('') + q.hint + JSON.stringify(q.why || q.slips || ''))) bad.push('emoji in text');
  if (q.steps.some(x => /[\t\f\v]/.test(x))) bad.push('control character in steps (a lost backslash)');
  if (q.kind === 'mcq') {
    if (q.options.length !== 4 || new Set(q.options).size !== 4 || q.options.filter(o => o === q.a).length !== 1) bad.push('options ' + key + ' ' + (q.options || []).join(' ; '));
    if (!q.why || q.options.some(o => !q.why[o] || q.why[o].length < 20 || M.whyNote(q, o) !== q.why[o])) notes.push('mcq note missing ' + key);
    if (new Set(q.options.map(o => q.why[o])).size !== 4) notes.push('two options share a note ' + key);
    if (!/^Right/.test(q.why[q.a]) || q.why[q.a].includes(q.a)) notes.push('right note does not explain in other words: ' + key);
  } else {
    if (!q.slips || q.slips.length < 2) notes.push('typed question with fewer than 2 slips: ' + key);
    else { if (q.slips.some(([v, txt]) => M.check(q, String(v)).ok || !txt || txt.length < 20 || M.whyNote(q, String(v)) !== txt)) notes.push('slip is right or has no note ' + key);
      if (M.whyNote(q, q.a)) notes.push('the right answer got a why-not note'); }
  }
  /* recompute the answer from q.data */
  let w;
  if (d.mat === 'order') w = d.ans;
  else if (d.mat === 'add') {
    const C = d.A.map((row, i) => row.map((v, j) => d.sub ? v - d.B[i][j] : v + d.B[i][j]));
    w = mShow(C); if (JSON.stringify(C) !== JSON.stringify(d.C)) wrong.push('add C mismatch');
  } else if (d.mat === 'scalar') {
    const C = d.A.map(row => row.map(v => d.k * v)); w = mShow(C);
    if (JSON.stringify(C) !== JSON.stringify(d.C)) wrong.push('scalar C mismatch');
  } else if (d.mat === 'mul') {
    const C = mMul(d.A, d.B); w = mShow(C);
    if (JSON.stringify(C) !== JSON.stringify(d.C)) wrong.push('mul C mismatch');
  } else if (d.mat === 'det') {
    w = String(mDet(d.A)); if (mDet(d.A) !== d.d) wrong.push('det d mismatch');
  } else if (d.mat === 'inv') {
    const det = mDet(d.A); const inv = [[d.A[1][1] / det, -d.A[0][1] / det], [-d.A[1][0] / det, d.A[0][0] / det]];
    w = mShow(inv); if (det !== d.d) wrong.push('inv det');
  } else if (d.mat === 'solve') {
    w = d.x + ', ' + d.y;
    const B = mMul(d.A, [[d.x], [d.y]]);
    if (B[0][0] !== d.B[0] || B[1][0] !== d.B[1]) wrong.push('solve B mismatch');
  }
  if (w !== undefined && w !== q.a) wrong.push(`${key}: recomputed ${w}, answer ${q.a}`);
  /* SVG cells match data.A when pic present */
  if (q.pic && d.A) {
    const G = readGrid(q.pic, 'A');
    if (!G || G.rows !== d.A.length || G.cols !== d.A[0].length) scale.push('grid attrs ' + key);
    else {
      for (let r = 0; r < d.A.length; r++) for (let c = 0; c < d.A[0].length; c++) {
        const want = mFmt(d.A[r][c]), got = String(G.A[r][c]);
        // G.A stores numbers when possible; compare via mFmt of both
        const gotFmt = typeof G.A[r][c] === 'number' ? mFmt(G.A[r][c]) : G.A[r][c];
        if (gotFmt !== want && String(d.A[r][c]) !== got) scale.push(`cell ${r},${c} want ${want} got ${got} ${key}`);
      }
      if (G.cells.length !== d.A.length * d.A[0].length) scale.push('cell count ' + key);
    }
  } else if (['order', 'add', 'scalar', 'mul', 'det', 'inv', 'solve'].includes(d.mat)) scale.push('missing pic ' + key);
}
ok(!bad.length, `${N.toLocaleString()} Matrix Meadow questions pass the checker, start with a capital, have a hint and worked steps, no emoji, and multiple choice has 4 different options ${bad.slice(0, 3)}`);
ok(!notes.length, `every option has its own why / why-not note (the right one in other words, starting with Right) and typed questions name at least two usual slips ${[...new Set(notes)].slice(0, 3)}`);
ok(!wrong.length, `every answer is worked out again from q.data ${[...new Set(wrong)].slice(0, 4)}`);
ok(!scale.length, `every matrix picture matches data-rows / data-cols and mcell values ${[...new Set(scale)].slice(0, 4)}`);
const NEED = ['order', 'add', 'scalar', 'mul', 'mul/wide', 'det', 'inv', 'solve'];
ok(NEED.every(k => kinds[k] > 40), 'all question kinds appear: ' + JSON.stringify(kinds));
{ const qs = Array.from({ length: 3000 }, (_, s) => M.make(ID, s + 1));
  ok(qs.every(q => !/minister|politic|election|war\b|kill|blood|weapon|gun|knife|salary|income|bet\b|gambl|beer|wine|crash|accident/i.test(q.q + JSON.stringify(q.why || ''))), 'kid / teen themes only');
  ok(qs.every(q => q.uid && /^mat\|/.test(q.uid)), 'every question has a uid (anti-farm)');
  ok(qs.filter(q => ['order', 'add', 'scalar', 'mul'].includes(q.data.mat)).every(q => q.pic && /class="mgrid"/.test(q.pic)), 'order/add/scalar/mul draw a matrix picture'); }
ok([1, 2, 3, 99].every(s => { const r = M.batch(ID, 8, s); return r.length === 8 && new Set(r.map(q => q.uid || q.q + q.a)).size === 8; }), 'a lesson of 8 has no repeated question');

/* ---------- 2. phone ---------- */
const SAVE = { v: 1, name: 'Jeremy', avatar: 'avatar_mage', startLevel: 'a1', stars: 100, totalCorrect: 40, totalAnswered: 50,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 420, happiness: 82, hunger: 35, skin: null, lastTick: Date.now() }, streak: { count: 4, last: null }, progress: {},
  owned: [], equipped: { outfit: null, petskin: null, theme: null }, settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 5 };
const seed = pred => { for (let s = 1; s < 30000; s++) if (pred(M.make(ID, s))) return s; };
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
    const list = [
      seed(q => D(q).mat === 'order' && q.pic),
      seed(q => D(q).mat === 'add' && q.pic),
      seed(q => D(q).mat === 'det'),
      seed(q => D(q).mat === 'scalar' && q.pic),
      seed(q => D(q).mat === 'mul' && !D(q).wide),
      seed(q => D(q).mat === 'inv'),
      seed(q => D(q).mat === 'solve'),
      seed(q => D(q).mat === 'mul' && D(q).wide)
    ];
    ok(list.every(Number.isInteger), `${w}px: a seed was found for every kind of question`);
    await p.evaluate(l => WR.Math.startLesson({ topic: 'g10.matrices', items: l.map(s => MathGen.make('g10.matrices', s)) }), list);
    await p.waitForTimeout(500);
    for (let i = 0; i < list.length; i++) {
      const q = await p.evaluate(() => WR.Math._dbg()), tag = `${w}px ${q.data.mat}${q.data.wide ? '/wide' : ''}`;
      ok(await fits(p), `${tag}: the question and the choices fit the screen with no sideways scroll`);
      const taps = await p.evaluate(() => Math.min(...[...document.querySelectorAll('.mopts .opt, #mcheck, .numpad button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().height)));
      ok(taps >= 40, `${tag}: answer buttons are easy to tap (${Math.round(taps)} px)`);
      if (q.pic) ok(await p.locator('.qcard svg.matrix .mgrid').count() >= 1 && await p.locator('.qcard svg .mcell').count() >= 4, `${tag}: the matrix picture shows mgrid cells`);
      if (w === 375 && i === 0) await p.locator('.qcard').screenshot({ path: OUT + 'matrices_01_order.svg.png' });
      if (w === 375 && i === 1) await p.locator('.qcard').screenshot({ path: OUT + 'matrices_02_add_grids.png' });
      if (i < 4) {
        if (q.kind === 'mcq') { const wk = q.options.findIndex(o => o !== q.a); await p.locator(`.mopts .opt[data-k="${wk}"]`).click(); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.why[q.options[wk]].slice(0, 30))), `${tag}: a wrong pick shows its own why-not note`);
          await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); await p.waitForTimeout(300);
          ok((await whyText(p)).some(x => x.includes(q.why[q.a].slice(0, 30))), `${tag}: the right answer shows why it works, in other words`);
          if (w === 375 && i === 3) await p.locator('.qcard').screenshot({ path: OUT + 'matrices_03_scalar_why.png' });
        } else { await p.fill('#mans', String(q.slips[0][0])); await p.click('#mcheck'); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.slips[0][1].slice(0, 30))), `${tag}: typing the usual slip (${q.slips[0][0]}) shows its why-not note`);
          if (w === 375 && i === 2) await p.locator('.qcard').screenshot({ path: OUT + 'matrices_04_det_slip_note.png' });
          await p.fill('#mans', q.a); await p.click('#mcheck'); await p.waitForTimeout(300); }
      } else {
        if (q.kind === 'mcq') await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click();
        else { await p.fill('#mans', q.a); await p.click('#mcheck'); }
        await p.waitForTimeout(300);
      }
      ok(await p.evaluate(() => /correct|got it/i.test(document.querySelector('.qcard').innerText)), `${tag}: the right answer is marked right`);
      if (i < list.length - 1) { await p.click('#mnext'); await p.waitForTimeout(300); }
    }
    const m = await p.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).math);
    ok(m && m.correct >= list.length && m.answered >= list.length, `${w}px: answers are saved in wordRealms.save.v1 (math.correct ${m && m.correct}, answered ${m && m.answered})`);
    if (w === 375) {
      const st = await p.evaluate(s => { const q = MathGen.make('g10.matrices', s), k = q.uid || 'g10.matrices|' + q.q; const a = WR.awardStars('m', k + '|t', 1), b = WR.awardStars('m', k + '|t', 1); return [a, b]; }, list[1]).catch(() => null);
      ok(st && st[0] >= 1 && st[1] < st[0], `a replayed question pays less than the first time (${st})`);
      await p.evaluate(() => WR.go('math')); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '10'); b && b.click(); }); await p.waitForTimeout(400);
      ok(await p.locator('[data-t="g10.matrices"]').count() === 1, 'the Grade 10 hub lists Matrix Meadow');
      ok(await p.evaluate(() => { const e = document.querySelector('[data-t="g10.matrices"]'); return !/\p{Extended_Pictographic}/u.test(e.innerText) && !!e.querySelector('img.wr-icon'); }), 'its hub card shows the painted puzzle icon, not an emoji');
      await p.locator('[data-t="g10.matrices"]').scrollIntoViewIfNeeded(); await p.screenshot({ path: OUT + 'matrices_05_hub_grade10.png' });
    }
    ok(!errors.length, `${w}px: no page errors ${errors.slice(0, 2)}`);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall Matrix Meadow checks passed');
})();
