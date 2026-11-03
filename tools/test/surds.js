// 🌿 Root Garden: MOE Sec 3 surds — simplify √(a²·n) and k√(a²·n), multiply √a·√b, add/subtract like surds,
// expand conjugates and (√a+√b)², rationalise denominators (1/√a, k/(c√b), conjugate), and "which is equivalent"
// MCQs. Node checks recompute every answer from q.data (and from the packing SVG when present: class rpack + data-a /
// data-n / data-N, tiles class rtile). Every option has a why / why-not note; typed conj questions get ≥2 slips.
// Cleanup: shared radical kit sqrtTex / surdTex / simpRad in math-gen.js (also used by distance / magnitude steps).
// Run: node tools/test/surds.js (game served on :18642). Screenshots: screenshots/surds_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const ID = 'g9.surds', fs = require('fs');
const { sqrtTex, surdTex, simpRad, gcd, simp } = M._internal;

/* ---------- 1. generators (Node) ---------- */
const t = M.topic(ID);
ok(t && t.grade === 9 && t.name === 'Root Garden' && t.icon === '🌿', `🌿 Root Garden is a Grade 9 (Sec 3) topic (${t && t.desc})`);
ok(M.TOPICS.length >= 122, `it is one of ${M.TOPICS.length} maths topics (122 when it was added)`);
{ const g = M.gradeTopics(9).map(x => x.id), i = g.indexOf(ID); ok(g[i - 1] === 'g9.stdform' && g[i + 1] === 'g9.trig', 'it sits after Standard Form Stars (number-form strand), before SOH-CAH-TOA Tower: ' + g.join(' ')); }
// the clean-up: shared radical kit (sqrtTex, surdTex, simpRad) lives in math-gen.js and is used by Root Garden and by
// distance / magnitude worked steps (no leftover hand-rolled \\sqrt{…} builders for those)
{ const I = M._internal, gen = fs.readFileSync(ROOT + '/js/math-gen.js', 'utf8'), h = fs.readFileSync(ROOT + '/js/math-topics-h.js', 'utf8');
  ok(typeof I.sqrtTex === 'function' && typeof I.surdTex === 'function' && typeof I.simpRad === 'function'
    && I.sqrtTex(72) === '\\sqrt{72}' && I.surdTex(6, 2) === '6\\sqrt{2}' && I.surdTex(1, 2) === '\\sqrt{2}'
    && JSON.stringify(I.simpRad(72)) === '[6,2]' && JSON.stringify(I.simpRad(50)) === '[5,2]',
    'the shared radical kit (sqrtTex, surdTex, simpRad) is on MathGen._internal');
  ok(/sqrtTex, surdTex, simpRad/.test(gen) && /surdTex\(/.test(h) && /simpRad\(/.test(h) && /svgRootPack/.test(h),
    'Root Garden uses the shared radical helpers and its own packing SVG');
  ok((h.match(/\$d = \$\{sqrtTex\(/g) || []).length >= 1 && (h.match(/\$\$\{sqrtTex\(`\$\{paren\(v/g) || []).length >= 1,
    'distance / 2-D magnitude steps call sqrtTex instead of inlining \\sqrt'); }
const attr = (tag, a) => { const m = tag.match(new RegExp(`\\b${a}="([^"]*)"`)); return m ? m[1] : null; };
const readPack = svg => {
  const pack = (svg.match(/<rect class="rpack"[^>]*>/) || [])[0];
  if (!pack) return null;
  const tiles = [...svg.matchAll(/<rect class="rtile"[^>]*>/g)].map(m => ({ r: +attr(m[0], 'data-r'), c: +attr(m[0], 'data-c') }));
  return { a: +attr(pack, 'data-a'), n: +attr(pack, 'data-n'), N: +attr(pack, 'data-N'), tiles };
};
const wantTex = (k, n) => '$' + surdTex(k, n) + '$';
const kinds = {}, bad = [], wrong = [], scale = [], notes = [], N = +process.env.N || 9000;
for (let s = 1; s <= N; s++) {
  const q = M.make(ID, s * 2654435761 >>> 0), d = q.data, js = JSON.stringify(q), key = d.surd + (d.form ? '/' + d.form : '');
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
  if (d.surd === 'simp') {
    w = wantTex(d.a, d.n); if (d.a * d.a * d.n !== d.N) wrong.push('simp N'); if (q.pic) {
      const P = readPack(q.pic); if (!P || P.a !== d.a || P.n !== d.n || P.N !== d.N) scale.push('pack attrs ' + key);
      else if (P.tiles.length !== d.a * d.a || new Set(P.tiles.map(t => t.r + ',' + t.c)).size !== d.a * d.a) scale.push('tile grid ' + key);
    } else if (d.a <= 6) scale.push('missing pack picture for a=' + d.a);
  } else if (d.surd === 'simpK') w = wantTex(d.out, d.n);
  else if (d.surd === 'mul') { const [A, m] = simpRad(d.a * d.b); w = wantTex(A, m); if (A !== d.A || m !== d.m) wrong.push('mul simpRad'); }
  else if (d.surd === 'add') w = wantTex(d.out, d.n);
  else if (d.surd === 'conj') { w = String(d.a - d.b); if (q.val !== d.a - d.b) wrong.push('conj val'); }
  else if (d.surd === 'sq') { const [A, m] = simpRad(d.a * d.b), mid = 2 * A; w = '$' + (d.a + d.b) + ' + ' + surdTex(mid, m) + '$'; }
  else if (d.surd === 'rat1') { const [num, den] = simp(d.k, d.a); w = den === 1 ? wantTex(num, d.a) : `$\\frac{${surdTex(num, d.a)}}{${den}}$`; }
  else if (d.surd === 'ratC') { const [num, den] = simp(d.k, d.c * d.b); w = den === 1 ? wantTex(num, d.b) : `$\\frac{${surdTex(num, d.b)}}{${den}}$`; }
  else if (d.surd === 'ratConj') {
    const topSign = d.plus ? '-' : '+', co = d.co;
    w = co === 1 && topSign === '-' ? `$\\sqrt{${d.a}} - \\sqrt{${d.b}}$` : co === 1 && topSign === '+' ? `$\\sqrt{${d.a}} + \\sqrt{${d.b}}$`
      : `$${co === -1 ? '-' : co === 1 ? '' : String(co)}(\\sqrt{${d.a}} ${topSign} \\sqrt{${d.b}})$`;
    if (d.a - d.b !== d.d || d.k / d.d !== d.co) wrong.push('ratConj numbers');
  } else if (d.surd === 'which') {
    if (d.form === 'simp') w = wantTex(d.a, d.n);
    else if (d.form === 'mul') w = wantTex(d.A, d.m);
    else if (d.form === 'add') w = wantTex(d.out, d.n);
  }
  if (w !== undefined && w !== q.a) wrong.push(`${key}: recomputed ${w}, answer ${q.a}`);
}
ok(!bad.length, `${N.toLocaleString()} Root Garden questions pass the checker, start with a capital, have a hint and worked steps, no emoji, and multiple choice has 4 different options ${bad.slice(0, 3)}`);
ok(!notes.length, `every option has its own why / why-not note (the right one in other words, starting with Right) and typed questions name at least two usual slips ${[...new Set(notes)].slice(0, 3)}`);
ok(!wrong.length, `every answer is worked out again from q.data (simpRad, gcd/simp, a−b, packing) ${[...new Set(wrong)].slice(0, 4)}`);
ok(!scale.length, `every simplify packing picture matches data-a / data-n / data-N and draws a×a tiles ${[...new Set(scale)].slice(0, 4)}`);
const NEED = ['simp', 'simpK', 'mul', 'add', 'conj', 'sq', 'rat1', 'ratC', 'ratConj', 'which/simp', 'which/mul', 'which/add'];
ok(NEED.every(k => kinds[k] > 40), 'all question kinds appear: ' + JSON.stringify(kinds));
{ const qs = Array.from({ length: 3000 }, (_, s) => M.make(ID, s + 1));
  ok(qs.every(q => !/minister|politic|election|war\b|kill|blood|weapon|gun|knife|money|salary|income|bet\b|gambl|beer|wine|crash|accident/i.test(q.q + JSON.stringify(q.why || ''))), 'kid / teen themes only');
  ok(qs.every(q => q.uid && /^surd\|/.test(q.uid)), 'every question has a uid (anti-farm)');
  ok(qs.filter(q => q.data.surd === 'simp' && q.data.a <= 6).every(q => q.pic && /class="rpack"/.test(q.pic)), 'simplify questions with a≤6 draw a packing picture');
  ok(qs.filter(q => q.data.surd === 'conj').every(q => q.kind === 'num' && q.slips.length >= 2), 'conjugate expands are typed with slips'); }
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
      seed(q => D(q).surd === 'simp' && D(q).a <= 6 && q.pic),
      seed(q => D(q).surd === 'conj'),
      seed(q => D(q).surd === 'rat1'),
      seed(q => D(q).surd === 'add'),
      seed(q => D(q).surd === 'sq'),
      seed(q => D(q).surd === 'which' && D(q).form === 'mul'),
      seed(q => D(q).surd === 'ratConj'),
      seed(q => D(q).surd === 'mul')
    ];
    ok(list.every(Number.isInteger), `${w}px: a seed was found for every kind of question`);
    await p.evaluate(l => WR.Math.startLesson({ topic: 'g9.surds', items: l.map(s => MathGen.make('g9.surds', s)) }), list);
    await p.waitForTimeout(500);
    for (let i = 0; i < list.length; i++) {
      const q = await p.evaluate(() => WR.Math._dbg()), tag = `${w}px ${q.data.surd}${q.data.form ? '/' + q.data.form : ''}`;
      ok(await fits(p), `${tag}: the question and the choices fit the screen with no sideways scroll`);
      const taps = await p.evaluate(() => Math.min(...[...document.querySelectorAll('.mopts .opt, #mcheck, .numpad button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().height)));
      ok(taps >= 40, `${tag}: answer buttons are easy to tap (${Math.round(taps)} px)`);
      if (q.data.surd === 'simp' && q.pic) ok(await p.locator('.qcard svg.surd .rpack').count() === 1 && await p.locator('.qcard svg .rtile').count() === q.data.a * q.data.a, `${tag}: the packing picture shows a×a tiles`);
      if (w === 375 && i === 0) await p.locator('.qcard').screenshot({ path: OUT + 'surds_01_simplify_tiles.png' });
      if (i < 4) {
        if (q.kind === 'mcq') { const wk = q.options.findIndex(o => o !== q.a); await p.locator(`.mopts .opt[data-k="${wk}"]`).click(); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.why[q.options[wk]].slice(0, 30))), `${tag}: a wrong pick shows its own why-not note`);
          await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); await p.waitForTimeout(300);
          ok((await whyText(p)).some(x => x.includes(q.why[q.a].slice(0, 30))), `${tag}: the right answer shows why it works, in other words`);
          if (w === 375 && i === 2) await p.locator('.qcard').screenshot({ path: OUT + 'surds_03_rationalise_why.png' });
        } else { await p.fill('#mans', String(q.slips[0][0])); await p.click('#mcheck'); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.slips[0][1].slice(0, 30))), `${tag}: typing the usual slip (${q.slips[0][0]}) shows its why-not note`);
          if (w === 375 && i === 1) await p.locator('.qcard').screenshot({ path: OUT + 'surds_02_conjugate_slip_note.png' });
          await p.fill('#mans', q.a); await p.click('#mcheck'); await p.waitForTimeout(300); }
      } else {
        if (q.kind === 'mcq') await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); else { await p.fill('#mans', q.a); await p.click('#mcheck'); }
        await p.waitForTimeout(300);
      }
      ok(await p.evaluate(() => /correct|got it/i.test(document.querySelector('.qcard').innerText)), `${tag}: the right answer is marked right`);
      if (w === 375 && i === 4) await p.locator('.qcard').screenshot({ path: OUT + 'surds_04_expand_square.png' });
      if (i < list.length - 1) { await p.click('#mnext'); await p.waitForTimeout(300); }
    }
    const m = await p.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).math);
    ok(m && m.correct >= list.length && m.answered >= list.length, `${w}px: answers are saved in wordRealms.save.v1 (math.correct ${m && m.correct}, answered ${m && m.answered})`);
    if (w === 375) {
      const st = await p.evaluate(s => { const q = MathGen.make('g9.surds', s), k = q.uid || 'g9.surds|' + q.q; const a = WR.awardStars('m', k + '|t', 1), b = WR.awardStars('m', k + '|t', 1); return [a, b]; }, list[1]).catch(() => null);
      ok(st && st[0] >= 1 && st[1] < st[0], `a replayed question pays less than the first time (${st})`);
      await p.evaluate(() => WR.go('math')); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '9'); b && b.click(); }); await p.waitForTimeout(400);
      ok(await p.locator('[data-t="g9.surds"]').count() === 1, 'the Grade 9 hub lists Root Garden');
      ok(await p.evaluate(() => { const e = document.querySelector('[data-t="g9.surds"]'); return !/\p{Extended_Pictographic}/u.test(e.innerText) && !!e.querySelector('img.wr-icon'); }), 'its hub card shows the painted herb icon, not an emoji');
      await p.locator('[data-t="g9.surds"]').scrollIntoViewIfNeeded(); await p.screenshot({ path: OUT + 'surds_05_hub_grade9.png' });
    }
    ok(!errors.length, `${w}px: no page errors ${errors.slice(0, 2)}`);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall Root Garden checks passed');
})();
