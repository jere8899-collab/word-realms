// 🎠 Circle Secrets: MOE Sec 3 angle properties of circles (angle in a semicircle, tangent ⊥ radius with angles and with
// Pythagoras, equal tangents from an outside point, angle at the centre = 2 × angle at the circumference, angles in the same
// segment, opposite angles of a cyclic quadrilateral, the perpendicular from the centre bisecting a chord, and "which
// property?" choices). Node checks read every point, angle and length back from the drawn SVG: points sit on the circle,
// tangents meet radii at 90°, every marked angle is drawn at its printed size and x is drawn at the answer's size, lengths
// are to scale, and each answer is worked out again from the property. Every option has a why / why-not note and typed
// slips get one too. Then a phone flow at 375 and 320 px that shows the notes.
// Run: node tools/test/circles.js (game served on :18642). Screenshots: screenshots/circles_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const ID = 'g9.circles';

/* ---------- 1. generators (Node) ---------- */
const t = M.topic(ID);
ok(t && t.grade === 9 && t.name === 'Circle Secrets' && t.icon === '🎠', `🎠 Circle Secrets is a Grade 9 (Sec 3) topic (${t && t.desc})`);
ok(M.TOPICS.length >= 116, `it is one of ${M.TOPICS.length} maths topics (116 when it was added)`);
{ const g = M.gradeTopics(9).map(x => x.id), i = g.indexOf(ID); ok(g[i - 1] === 'g9.coord' && g[i + 1] === 'g9.ineq' && g[g.length - 1] === 'g9.story', 'it sits after Treasure-Map Coordinates (geometry), before Inequality Gates: ' + g.join(' ')); }
const attr = (tag, a) => { const m = tag.match(new RegExp(`\\b${a}="([^"]*)"`)); return m ? m[1] : null; };
const readFig = svg => {
  const c = (svg.match(/<circle class="mcirc"[^>]*>/) || [''])[0], C = { x: +attr(c, 'cx'), y: +attr(c, 'cy'), r: +attr(c, 'r') };
  const P = {}; for (const m of svg.matchAll(/<circle class="cpt"[^>]*>/g)) P[attr(m[0], 'data-n')] = [+attr(m[0], 'cx'), +attr(m[0], 'cy')];
  const angs = [...svg.matchAll(/<path class="cang"[^>]*>/g)].map(m => ({ t: attr(m[0], 'data-t'), v: attr(m[0], 'data-v'), a: attr(m[0], 'data-a'), b: attr(m[0], 'data-b') }));
  const labs = [...svg.matchAll(/class="mlab" data-t="([^"]+)"/g)].map(m => m[1]);
  return { C, P, angs, labs, rights: [...svg.matchAll(/class="cright" data-v="(\w)"/g)].map(m => m[1]) };
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const angAt = (V, A, B) => { let d = Math.abs(Math.atan2(A[1] - V[1], A[0] - V[0]) - Math.atan2(B[1] - V[1], B[0] - V[0])) * 180 / Math.PI; return d > 180 ? 360 - d : d; };
const dotN = (V, A, B) => { const u = [A[0] - V[0], A[1] - V[1]], w = [B[0] - V[0], B[1] - V[1]]; return (u[0] * w[0] + u[1] * w[1]) / (Math.hypot(...u) * Math.hypot(...w)); };
const deg = s => +String(s).replace('°', '');
// each answer worked out again from the property and the given angle (or the lengths)
const RULE = { semi: (g) => 90 - g, tangent: (g) => 90 - g, 'twotan/AOB': g => 180 - g, 'twotan/PAB': g => (180 - g) / 2, 'centre/atO': g => 2 * g, 'centre/atC': g => g / 2, segment: g => g, cyclic: g => 180 - g };
const kinds = {}, bad = [], wrong = [], scale = [], notes = [];
const N = 9000;
for (let s = 1; s <= N; s++) {
  const q = M.make(ID, s * 2654435761 >>> 0), d = q.data, js = JSON.stringify(q), key = d.circ + (d.k ? '/' + d.k : '') + (d.mc ? '/mcq' : '');
  kinds[key] = (kinds[key] || 0) + 1;
  if (/NaN|Infinity|undefined|\[object/.test(js) || !M.check(q, q.a).ok || !q.hint || !q.steps.length || !/^[A-Z]/.test(q.q)) bad.push(q.q);
  if (/\p{Extended_Pictographic}/u.test(q.q + q.steps.join('') + q.hint + JSON.stringify(q.why || q.slips || ''))) bad.push('emoji in text');
  if (q.steps.some(x => /[\t\f\v]/.test(x))) bad.push('control character in steps (a lost backslash)');
  if (q.kind === 'mcq') {
    if (q.options.length !== 4 || new Set(q.options).size !== 4 || q.options.filter(o => o === q.a).length !== 1) bad.push('options ' + key + ' ' + q.options.join(' ; '));
    if (!q.why || q.options.some(o => !q.why[o] || q.why[o].length < 20 || M.whyNote(q, o) !== q.why[o])) notes.push('mcq note missing');
    const num = (q.a.match(/\d+(\.\d+)?/g) || []); if (!num.every(n => q.why[q.a].includes(n))) notes.push('right note does not give the answer ' + q.a);
    if (new Set(q.options.map(o => q.why[o])).size !== 4) notes.push('two options share a note');
  } else {
    if (!q.slips || q.slips.length < 2) notes.push('typed question with fewer than 2 slips: ' + key);
    else { if (q.slips.some(([v, txt]) => M.check(q, String(v)).ok || !txt || txt.length < 20 || M.whyNote(q, String(v)) !== txt)) notes.push('slip is right or has no note');
      if (M.whyNote(q, q.a)) notes.push('the right answer got a why-not note'); }
  }
  const worked = q.steps.join(' ');
  if (!/semicircle|tangent ⊥ radius|Tangents from an outside point|Angle at centre|same segment|cyclic quadrilateral|bisects a chord/i.test(worked)) notes.push('worked solution does not name the property ' + key);
  // the figure, read back
  const F = readFig(q.pic), { C, P } = F, ctr = [C.x, C.y], X = d.x;
  if (!(C.r > 30) || !Object.keys(P).length) { scale.push('no circle or points'); continue; }
  for (const [n, p] of Object.entries(P)) {
    const rr = dist(p, ctr);
    if (n === 'O') { if (rr > .25) scale.push('O is not the centre'); }
    else if (n === 'P') { if (!(rr > C.r + 4)) scale.push('P is not outside the circle'); }
    else if (n === 'M') { if (!(rr < C.r - 4)) scale.push('M is not inside the circle'); }
    else if (Math.abs(rr - C.r) > .3) scale.push(`${n} is not on the circle (${key})`);
  }
  const xs = F.angs.filter(g => g.t === 'x'), gs = F.angs.filter(g => g.t !== 'x');
  for (const g of F.angs) { const m = angAt(P[g.v], P[g.a], P[g.b]), want = g.t === 'x' ? X : deg(g.t); if (Math.abs(m - want) > .8) scale.push(`${key}: angle ${g.v} (${g.t}) is drawn ${m.toFixed(1)}°, should be ${want}`); }
  if (!d.len) {
    if (xs.length !== 1 || gs.length !== 1 || deg(gs[0].t) !== d.giv[0]) wrong.push('angle labels ' + key + ' ' + JSON.stringify(F.angs));
    const rk = d.src + (d.src === 'twotan' || d.src === 'centre' ? '/' + d.k : ''), want = RULE[rk] && RULE[rk](d.giv[0]);
    if (want !== X) wrong.push(`${rk}: the property gives ${want}, the answer is ${X}`);
    if (d.circ !== 'which' && (q.kind === 'mcq' ? q.a !== `${X}°` : q.val !== X)) wrong.push('answer is not x ' + key);
  }
  // the property is really there in the drawing
  if (P.T) { if (Math.abs(dotN(P.T, ctr, P.P)) > .01) scale.push('the tangent at T does not meet the radius at 90°'); }
  if (d.src === 'twotan') { if (['A', 'B'].some(n => Math.abs(dotN(P[n], ctr, P.P)) > .01)) scale.push('PA or PB is not a tangent'); if (Math.abs(dist(P.P, P.A) - dist(P.P, P.B)) > .3) scale.push('the two tangents are not equal');
    if (d.k === 'PAB' && !/class="ctick"[\s\S]*class="ctick"/.test(q.pic)) scale.push('equal tangents carry no ticks'); }
  if (d.src === 'semi' && dist([(P.A[0] + P.B[0]) / 2, (P.A[1] + P.B[1]) / 2], ctr) > .3) scale.push('AB is not a diameter');
  if (d.src === 'centre' || d.src === 'segment') { const others = d.src === 'centre' ? ['C'] : ['C', 'D'], side = n => Math.sign((P.B[0] - P.A[0]) * (P[n][1] - P.A[1]) - (P.B[1] - P.A[1]) * (P[n][0] - P.A[0]));
    if (new Set(others.map(side)).size !== 1 || (d.src === 'centre' && side('C') === Math.sign((P.B[0] - P.A[0]) * (ctr[1] - P.A[1]) - (P.B[1] - P.A[1]) * (ctr[0] - P.A[0])) === false)) scale.push('C, D not on the same arc');
    if (d.src === 'centre' && side('C') !== Math.sign((P.B[0] - P.A[0]) * (ctr[1] - P.A[1]) - (P.B[1] - P.A[1]) * (ctr[0] - P.A[0]))) scale.push('C is not on the major arc (same side as O)'); }
  if (d.src === 'cyclic') { const xv = xs[0].v, gv = gs[0].v; if (!({ A: 'C', C: 'A', B: 'D', D: 'B' })[gv] === xv || ({ A: 'C', C: 'A', B: 'D', D: 'B' })[gv] !== xv) wrong.push('x is not opposite the given angle'); }
  if (d.src === 'chord') { const Mm = [(P.A[0] + P.B[0]) / 2, (P.A[1] + P.B[1]) / 2]; if (dist(Mm, P.M) > .3 || Math.abs(dotN(P.M, P.O, P.B)) > .01 || !F.rights.includes('M')) scale.push('M is not the foot of the perpendicular / midpoint'); }
  if (d.len) { const k = C.r / d.R, L = (a, b) => dist(P[a], P[b]) / k, near = (a, b) => Math.abs(a - b) < .08;
    let seg; if (d.src === 'tanlen') { seg = { OT: L('O', 'T'), TP: L('T', 'P'), OP: L('O', 'P') }; if (!near(seg.OT, d.rad) || !near(seg.TP, d.t) || !near(seg.OP, d.h) || d.rad ** 2 + d.t ** 2 !== d.h ** 2) scale.push('tangent lengths not to scale'); }
    else { seg = { OA: L('O', 'A'), OM: L('O', 'M'), AB: L('A', 'B') }; if (!near(seg.OA, d.rad) || !near(seg.OM, d.d) || !near(seg.AB, 2 * d.h) || d.d ** 2 + d.h ** 2 !== d.rad ** 2) scale.push('chord lengths not to scale'); }
    const real = { OT: d.rad, TP: d.t, OP: d.h, OA: d.rad, OM: d.d, AB: 2 * d.h };
    const exp = Object.keys(seg).map(n => n === d.k ? 'x' : `${real[n]} cm`).sort().join();
    if (F.labs.slice().sort().join() !== exp) wrong.push('length labels ' + F.labs + ' vs ' + exp);
    if (d.circ !== 'which' && Math.abs(seg[d.k] - q.val) > .08) wrong.push(`x is drawn ${seg[d.k]}, the answer is ${q.val}`);
    // Pythagoras again from the two printed lengths
    const known = F.labs.filter(x => x !== 'x').map(x => +x.replace(' cm', '')), hyp = d.k === 'OP' || d.k === 'OA', half = d.k === 'AB' ? 2 : 1, kn = d.src === 'chord' && d.k !== 'AB' ? known.map(v => v === 2 * d.h ? d.h : v) : known;
    const calc = hyp ? Math.hypot(...kn) : half * Math.sqrt(Math.max(...kn) ** 2 - Math.min(...kn) ** 2);
    if (d.circ !== 'which' && Math.abs(calc - q.val) > 1e-9) wrong.push(`Pythagoras from the labels gives ${calc}, answer ${q.val} (${key})`); }
  if (d.circ === 'which') { const NAME = { semi: 'semicircle', tangent: 'Tangent ⊥', twotan: 'Tangents from', centre: 'Angle at centre', segment: 'same segment', cyclic: 'cyclic quadrilateral', chord: 'bisects a chord' };
    if (!q.a.includes(NAME[d.prop])) wrong.push('which: answer ' + q.a + ' for ' + d.prop); if ((d.src === 'tangent' || (d.src === 'twotan' && d.k === 'AOB')) !== (d.prop === 'tangent')) wrong.push('which: tangent property mismatch'); }
}
ok(!bad.length, `${N.toLocaleString()} Circle Secrets questions pass the checker, start with a capital, have a hint and worked steps, no emoji, and multiple choice has 4 different options ${bad.slice(0, 3)}`);
ok(!notes.length, `every option has its own why / why-not note, the right one restates the answer, typed questions name their usual slips, and every worked solution names the circle property ${[...new Set(notes)].slice(0, 3)}`);
ok(!wrong.length, `every answer is worked out again from the property and the angles or lengths printed on the drawing ${[...new Set(wrong)].slice(0, 4)}`);
ok(!scale.length, `every figure is true: points on the circle, O at the centre, tangents at 90° to radii, equal tangents, given angles and x drawn at their sizes, lengths to scale ${[...new Set(scale)].slice(0, 4)}`);
ok(['semi', 'tangent', 'tanlen/TP', 'tanlen/OP', 'tanlen/OT', 'twotan/AOB', 'twotan/PAB', 'centre/atO', 'centre/atC', 'segment', 'cyclic', 'cyclic/mcq', 'chord/AB', 'chord/OM', 'chord/OA'].every(k => kinds[k] > 100) && Object.keys(kinds).filter(k => k.startsWith('which')).length >= 7, 'all question types appear: ' + JSON.stringify(kinds));
{ const qs = Array.from({ length: 3000 }, (_, s) => M.make(ID, s + 1)), W = qs.filter(q => q.data.circ === 'which');
  ok(new Set(W.map(q => q.data.prop)).size === 7 && W.every(q => q.options.every(o => /[a-z]/.test(o))), '"which property?" asks about all seven properties, with property names as the choices');
  ok(W.every(q => q.options.filter(o => o !== q.a).every(o => /^That rule needs/.test(q.why[o]))), 'each wrong property says what that rule needs to see in a figure');
  ok(qs.filter(q => q.data.src === 'centre' && q.data.k === 'atO' && q.kind !== 'mcq').every(q => q.slips.some(s => s[0] === q.data.giv[0])), 'angle-at-the-centre questions name the "forgot to double" slip');
  ok(qs.filter(q => q.data.circ === 'cyclic').every(q => (q.slips || []).some(s => s[0] === q.data.giv[0]) || (q.options || []).includes(q.data.giv[0] + '°')), 'cyclic quadrilateral questions name the "opposite angles are equal" slip');
  ok(qs.filter(q => q.data.circ === 'chord' && q.data.k === 'AB').every(q => q.slips.some(s => s[0] === q.data.h)), 'chord questions name the "forgot to double the half-chord" slip');
  ok(qs.every(q => !/minister|politic|election|war\b|kill|blood|weapon|gun|knife|money/i.test(q.q)), 'kid themes only');
  ok(qs.every(q => q.pic && q.uid && /^circ\|/.test(q.uid)), 'every question has a drawn figure and a uid (anti-farm)'); }
ok([1, 2, 3, 99].every(s => { const r = M.batch(ID, 8, s); return r.length === 8 && new Set(r.map(q => q.uid || q.q + q.a)).size === 8; }), 'a lesson of 8 has no repeated question');

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
    const list = [seed(q => D(q).circ === 'centre' && D(q).k === 'atO' && q.slips.length >= 3), seed(q => D(q).circ === 'which' && D(q).prop === 'cyclic'), seed(q => D(q).circ === 'chord' && D(q).k === 'AB'), seed(q => D(q).circ === 'cyclic' && D(q).mc),
      seed(q => D(q).circ === 'tanlen' && D(q).k === 'TP'), seed(q => D(q).circ === 'semi'), seed(q => D(q).circ === 'twotan' && D(q).k === 'PAB'), seed(q => D(q).circ === 'segment')];
    ok(list.every(Number.isInteger), `${w}px: a seed was found for every kind of question`);
    await p.evaluate(l => WR.Math.startLesson({ topic: 'g9.circles', items: l.map(s => MathGen.make('g9.circles', s)) }), list);
    await p.waitForTimeout(500);
    for (let i = 0; i < list.length; i++) {
      const q = await p.evaluate(() => WR.Math._dbg()), tag = `${w}px ${q.data.circ}${q.data.k ? '/' + q.data.k : ''}`;
      ok(await fits(p), `${tag}: the picture and the choices fit the screen with no sideways scroll`);
      const taps = await p.evaluate(() => Math.min(...[...document.querySelectorAll('.mopts .opt, #mcheck, .numpad button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().height)));
      ok(taps >= 40, `${tag}: answer buttons are easy to tap (${Math.round(taps)} px)`);
      ok(await p.locator('.qcard svg .mcirc').count() === 1 && await p.locator('.qcard svg .mvtx').count() >= 3, `${tag}: the circle is drawn with its lettered points`);
      if (w === 375 && i === 0) await p.locator('.qcard').screenshot({ path: OUT + 'circles_01_centre_question.png' });
      if (i < 4) { // a wrong answer first: its own why-not note; then the right one
        if (q.kind === 'mcq') { const wk = q.options.findIndex(o => o !== q.a); await p.locator(`.mopts .opt[data-k="${wk}"]`).click(); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.why[q.options[wk]].slice(0, 30))), `${tag}: a wrong pick shows its own why-not note`);
          if (w === 375 && i === 1) await p.locator('.qcard').screenshot({ path: OUT + 'circles_03_which_property_why_not.png' });
          await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); await p.waitForTimeout(300);
          ok((await whyText(p)).some(x => x.includes(q.why[q.a].slice(0, 30))), `${tag}: the right answer shows why it works, in other words`);
        } else { await p.fill('#mans', String(q.slips[0][0])); await p.click('#mcheck'); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.slips[0][1].slice(0, 30))), `${tag}: typing the usual slip (${q.slips[0][0]}) shows its why-not note`);
          if (w === 375 && i === 0) await p.locator('.qcard').screenshot({ path: OUT + 'circles_02_centre_slip_note.png' });
          await p.fill('#mans', q.a); await p.click('#mcheck'); await p.waitForTimeout(300); }
      } else {
        if (q.kind === 'mcq') await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); else { await p.fill('#mans', q.a); await p.click('#mcheck'); }
        await p.waitForTimeout(300);
      }
      ok(await p.evaluate(() => /correct|got it/i.test(document.querySelector('.qcard').innerText)), `${tag}: the right answer is marked right`);
      if (w === 375 && i === 2) { ok(await p.evaluate(() => /bisects a chord/.test(document.querySelector('.qcard').innerText)), `${tag}: the worked solution names the property`);
        await p.locator('.qcard').screenshot({ path: OUT + 'circles_04_chord_worked.png' }); }
      if (i < list.length - 1) { await p.click('#mnext'); await p.waitForTimeout(300); }
    }
    const m = await p.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).math);
    ok(m && m.correct >= list.length && m.answered >= list.length, `${w}px: answers are saved in wordRealms.save.v1 (math.correct ${m && m.correct}, answered ${m && m.answered})`);
    if (w === 375) {
      const st = await p.evaluate(s => { const q = MathGen.make('g9.circles', s), k = q.uid || 'g9.circles|' + q.q; const a = WR.awardStars('m', k + '|t', 1), b = WR.awardStars('m', k + '|t', 1); return [a, b]; }, list[1]).catch(() => null);
      ok(st && st[0] >= 1 && st[1] < st[0], `a replayed question pays less than the first time (${st})`);
      await p.evaluate(() => WR.go('math')); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '9'); b && b.click(); }); await p.waitForTimeout(400);
      ok(await p.locator('[data-t="g9.circles"]').count() === 1, 'the Grade 9 hub lists Circle Secrets');
      ok(await p.evaluate(() => { const e = document.querySelector('[data-t="g9.circles"]'); return !/\p{Extended_Pictographic}/u.test(e.innerText) && !!e.querySelector('img.wr-icon'); }), 'its hub card shows the painted carousel icon, not an emoji');
      await p.locator('[data-t="g9.circles"]').scrollIntoViewIfNeeded(); await p.screenshot({ path: OUT + 'circles_05_hub_grade9.png' });
    }
    ok(!errors.length, `${w}px: no page errors ${errors.slice(0, 2)}`);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall Circle Secrets checks passed');
})();
