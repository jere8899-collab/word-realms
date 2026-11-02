// 🚌 Field-Trip Travel Graphs: MOE Sec 4 (O-Level 4052 real-world contexts, N4 rate and speed) distance–time and speed–time
// graphs: speed of a stage (km/h, minutes on the axis), how long a stop lasts, average speed for the whole trip, which
// statement is true; acceleration / deceleration (gradient), distance (area under the graph, linear sections only), the top
// speed V from the distance. Node checks read every graph back from the SVG (the labelled ticks give the scales, the
// corners are read off the line in pixels) and work each answer out again from the drawing, check every corner sits on the
// grid, the stage bubbles sit clear of the line, and every option / usual slip has its own note. Then a phone flow at 375
// and 320 px that shows the notes. Run: node tools/test/travel.js (game served on :18642). Screenshots: screenshots/travel_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const ID = 'g10.travel', fs = require('fs');

/* ---------- 1. generators (Node) ---------- */
const t = M.topic(ID);
ok(t && t.grade === 10 && t.name === 'Field-Trip Travel Graphs' && t.icon === '🚌', `🚌 Field-Trip Travel Graphs is a Grade 10 (Sec 4) topic (${t && t.desc})`);
ok(M.TOPICS.length >= 121, `it is one of ${M.TOPICS.length} maths topics (121 when it was added)`);
{ const g = M.gradeTopics(10).map(x => x.id), i = g.indexOf(ID); ok(g[i - 1] === 'g10.spread' && g[i + 1] === 'g10.sector' && g[g.length - 1] === 'g10.story', 'it sits after Kite-Festival Spread (graphs and data), before Slice of the Moon: ' + g.join(' ')); }
// the clean-up: one chart axis kit (y labels, x ticks, axis names) shared by the line graph, the cumulative frequency curve,
// the box-plot number line and the travel graphs
{ const I = M._internal, gen = fs.readFileSync(ROOT + '/js/math-gen.js', 'utf8'), h = fs.readFileSync(ROOT + '/js/math-topics-h.js', 'utf8');
  ok(['xTicks', 'yUnit', 'xUnit', 'tickAttr'].every(k => typeof I[k] === 'function') && I.xTicks([[10, 'a', 1]], 0, 5, '#000', 3, 'xt').includes('class="xt" data-v="1"') && !I.xTicks([[10, 'a', 1]], 0, 5, '#000', 3).includes('class='), 'the shared chart axis kit (xTicks, yUnit, xUnit, axes with tick classes) is there');
  ok(I.axes(40, 280, 30, 170, 10, 5)[0] === I.axes(40, 280, 30, 170, 10, 5, '')[0] && I.axes(40, 280, 30, 170, 10, 5, 'yt')[0].includes('class="yt" data-v="5"'), 'axes() draws the same as before unless a tick class is asked for');
  const dup = (gen + h).match(/y2="\$\{bot\}" stroke="#F[35]E[CF]F[AB]" stroke-width="1"\/><text/g) || [];
  ok(!dup.length && (h.match(/xTicks\(/g) || []).length >= 2 && /xTicks\(xs\.map/.test(gen), 'no chart keeps its own copy of the x-tick / gridline markup'); }
const attr = (tag, a) => { const m = tag.match(new RegExp(`\\b${a}="([^"]*)"`)); return m ? m[1] : null; };
const ticks = (svg, c) => [...svg.matchAll(new RegExp(`<text class="${c}"[^>]*>`, 'g'))].map(m => [+attr(m[0], 'data-v'), +attr(m[0], c === 'xt' ? 'x' : 'y')]);
const scaleOf = (svg, c, off = 0) => { const T = ticks(svg, c).map(([v, p]) => [v, p - off]); if (T.length < 2) return null; const [a, b] = [T[0], T[T.length - 1]], k = (b[0] - a[0]) / (b[1] - a[1]);
  const lin = T.every(([v, x]) => Math.abs(a[0] + (x - a[1]) * k - v) < Math.abs(k) * .2); return { v: x => a[0] + (x - a[1]) * k, lin, n: T.length, step: T[1][0] - T[0][0] }; };
const readGraph = svg => { const X = scaleOf(svg, 'xt'), Y = scaleOf(svg, 'yt', 3.5), P = [...svg.matchAll(/<circle class="tgpt"[^>]*>/g)].map(m => [+attr(m[0], 'cx'), +attr(m[0], 'cy')]);
  const line = (svg.match(/class="tgline" points="([^"]+)"/) || [])[1] || '', L = line.split(' ').map(p => p.split(',').map(Number));
  const bub = [...svg.matchAll(/<g class="tgstage" data-s="(\w)"><circle cx="([\d.]+)" cy="([\d.]+)"/g)].map(m => ({ s: m[1], c: [+m[2], +m[3]] }));
  const vline = (svg.match(/<line class="tgv"[^>]*>/) || [])[0];
  return { X, Y, P, L, bub, vline, pts: Y ? P.map(([x, y]) => [X.v(x), Y.v(y)]) : null }; };
const near = (a, b, e = .05) => Math.abs(a - b) <= e;
const segDist = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], u = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy); };
const LET = 'ABCD', area = pts => pts.slice(1).reduce((s, p, i) => s + (p[1] + pts[i][1]) / 2 * (p[0] - pts[i][0]), 0);
const kinds = {}, bad = [], wrong = [], scale = [], notes = [], N = +process.env.N || 9000;
for (let s = 1; s <= N; s++) {
  const q = M.make(ID, s * 2654435761 >>> 0), d = q.data, js = JSON.stringify(q), key = d.travel + '/' + d.k;
  kinds[key] = (kinds[key] || 0) + 1;
  if (/NaN|Infinity|undefined|\[object/.test(js) || !M.check(q, q.a).ok || !q.hint || !q.steps.length || !/^[A-Z]/.test(q.q) || !q.pic) bad.push(key + ' ' + q.q);
  if (/\p{Extended_Pictographic}/u.test(q.q + q.steps.join('') + q.hint + JSON.stringify(q.why || q.slips || ''))) bad.push('emoji in text');
  if (q.steps.some(x => /[\t\f\v]/.test(x))) bad.push('control character in steps (a lost backslash)');
  if (q.kind === 'mcq') {
    if (q.options.length !== 4 || new Set(q.options).size !== 4 || q.options.filter(o => o === q.a).length !== 1) bad.push('options ' + key);
    if (!q.why || q.options.some(o => !q.why[o] || q.why[o].length < 20 || M.whyNote(q, o) !== q.why[o])) notes.push('mcq note missing');
    if (new Set(q.options.map(o => q.why[o])).size !== 4) notes.push('two options share a note');
    if (!/^Right/.test(q.why[q.a]) || q.why[q.a].includes(q.a)) notes.push('right note does not explain in other words: ' + key);
  } else {
    if (!q.slips || q.slips.length < 2) notes.push('typed question with fewer than 2 slips: ' + key);
    else { if (q.slips.some(([v, txt]) => M.check(q, String(v)).ok || !txt || txt.length < 20 || M.whyNote(q, String(v)) !== txt)) notes.push('slip is right or has no note ' + key);
      if (M.whyNote(q, q.a)) notes.push('the right answer got a why-not note'); }
    if (!(q.val > 0)) wrong.push('answer not positive ' + key);
  }
  /* read the graph back */
  const G = readGraph(q.pic), st = d.travel.startsWith('st');
  if (!G.X || !G.X.lin || G.X.n < 4 || G.X.n > 11) { scale.push('time axis ticks ' + key); continue; }
  if (d.travel === 'stfind') { if (ticks(q.pic, 'yt').length !== 1 || !G.vline || !/>V</.test(q.pic)) { scale.push('the find-V graph must not number the speed axis'); continue; } }
  else if (!G.Y || !G.Y.lin || G.Y.n < 3 || G.Y.n > 11) { scale.push('distance / speed axis ticks ' + key); continue; }
  if (G.L.length !== G.P.length || !G.L.every((p, i) => near(p[0], G.P[i][0], .06) && near(p[1], G.P[i][1], .06))) scale.push('the line does not join the corner dots');
  const want = [[0, st ? d.pts[0][1] : 0]].concat(st ? d.pts.slice(1) : d.pts);
  if (!G.P.every((p, i) => i === 0 || p[0] > G.P[i - 1][0])) scale.push('time goes backwards');
  if (G.bub.length !== G.P.length - 1 || !G.bub.every((b, i) => b.s === LET[i])) scale.push('a stage bubble is missing');
  for (let i = 0; i < G.bub.length; i++) { const c = G.bub[i].c; if (G.P.slice(1).some((p, j) => segDist(c, G.P[j], p) < 8.5)) { scale.push('a stage bubble covers the line ' + key + JSON.stringify([c, G.P])); break; }
    if (c[0] < 52 || c[0] > 280 || c[1] < 34 || c[1] > 178) scale.push('a stage bubble is off the plot ' + key + JSON.stringify(c));
    if (G.bub.some((b, j) => j !== i && Math.hypot(b.c[0] - c[0], b.c[1] - c[1]) < 16)) scale.push('two stage bubbles overlap'); }
  let pts;
  if (d.travel === 'stfind') { const v0 = +attr(G.vline, 'y1'), b0 = 178; pts = G.P.map(([x, y]) => [G.X.v(x), (b0 - y) / (b0 - v0)]);  // speeds as fractions of V
    if (!pts.every(p => near(p[1], 0, .01) || near(p[1], 1, .01))) scale.push('find-V corners are not at 0 or V');
    const S = +q.q.match(/distance travelled is ([\d.]+) m/)[1], V = S / area(pts); if (!near(V, q.val, .02)) wrong.push(`find V: graph gives ${V}, answer ${q.val}`); continue; }
  pts = G.pts.map(([x, y]) => [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000]);
  if (!pts.every((p, i) => near(p[0], want[i][0], .06) && near(p[1], want[i][1], .06))) { scale.push(`${key}: corners drawn at ${JSON.stringify(pts)}, data ${JSON.stringify(want)}`); continue; }
  if (!pts.every(p => near(p[0] / G.X.step, Math.round(p[0] / G.X.step), .03) && near(p[1] / G.Y.step, Math.round(p[1] / G.Y.step), .03))) scale.push('a corner is not on a grid line ' + key + JSON.stringify(pts) + G.X.step + '/' + G.Y.step);
  pts = pts.map(p => [Math.round(p[0] / G.X.step) * G.X.step, Math.round(p[1] / G.Y.step) * G.Y.step]);   // read to the grid, as a child does
  const seg = i => ({ dt: pts[i + 1][0] - pts[i][0], dy: pts[i + 1][1] - pts[i][1], y0: pts[i][1], y1: pts[i + 1][1] }), segs = pts.slice(1).map((_, i) => seg(i));
  const stage = () => LET.indexOf(q.q.match(/stage ([A-D])/)[1]);
  if (!st) { if (pts[pts.length - 1][1] !== 0) scale.push('the trip does not end back home');
    const sp = segs.map(g => Math.abs(g.dy) * 60 / g.dt), mv = segs.map((g, i) => i).filter(i => segs[i].dy), D = Math.max(...pts.map(p => p[1]));
    if (new Set(mv.map(i => sp[i])).size !== mv.length) scale.push('two moving stages have the same speed');
    let w;
    if (d.travel === 'dtspeed') w = sp[stage()];
    if (d.travel === 'dtrest') { const r = segs.filter(g => !g.dy); w = r.length === 1 ? r[0].dt : NaN; }
    if (d.travel === 'dtavg') w = Math.round(segs.reduce((a, g) => a + Math.abs(g.dy), 0) * 60 / pts[pts.length - 1][0] * 10) / 10;
    if (w !== undefined && !near(w, q.val, 1e-6)) wrong.push(`${key}: graph gives ${w}, answer ${q.val}`);
    if (d.travel === 'dtmc') { const a = q.a, L = i => LET[i], fi = mv.reduce((x, y) => sp[y] > sp[x] ? y : x);
      const truth = o => { let m;
        if ((m = o.match(/During stage ([A-D]), .* was not moving\./))) return !segs[LET.indexOf(m[1])].dy;
        if ((m = o.match(/fastest during stage ([A-D])\./))) return LET.indexOf(m[1]) === fi;
        if ((m = o.match(/During stage ([A-D]), .* moved at a steady speed\./))) return false;   // a flat d–t line is a stop
        if ((m = o.match(/During stage ([A-D]), .* was heading back to/))) return segs[LET.indexOf(m[1])].dy < 0;
        if ((m = o.match(/During stage ([A-D]), .* moving further away/))) return segs[LET.indexOf(m[1])].dy > 0;
        if ((m = o.match(/furthest .* was ([\d.]+) km\./))) return +m[1] === D;
        return null; };
      const tv = q.options.map(truth); if (tv.some(v => v === null)) bad.push('unknown statement ' + q.options.join(' | '));
      else if (!truth(a) || tv.filter(Boolean).length !== 1) wrong.push('dtmc: the graph does not make exactly the answer true ' + q.options.join(' | ')); }
  } else { const V = Math.max(...pts.map(p => p[1])), last = segs[segs.length - 1];
    if (pts[pts.length - 1][1] !== 0 || last.dy >= 0) scale.push('the journey does not end at rest');
    let w;
    if (d.travel === 'staccel') w = /deceleration/.test(q.q) ? -last.dy / last.dt : segs[0].dy / segs[0].dt;
    if (d.travel === 'stdist') w = /total distance/.test(q.q) ? area(pts) : area(pts.slice(0, 2));
    if (w !== undefined && !near(w, q.val, 1e-6)) wrong.push(`${key}: graph gives ${w}, answer ${q.val}`);
    if (d.travel === 'stmc') { const a1 = segs[0].dy / segs[0].dt, a3 = -last.dy / last.dt;
      const truth = o => { let m;
        if (/During stage A, .* was speeding up\./.test(o)) return segs[0].dy > 0;
        if ((m = o.match(/During stage B, .* kept moving at ([\d.]+) m\/s\./))) return !segs[1].dy && segs[1].y0 === +m[1] && +m[1] > 0;
        if (/During stage B, .* was not moving\./.test(o)) return segs[1].y0 === 0;
        if (/During stage C, .* was speeding up\./.test(o)) return segs[2].dy > 0;
        if (/sped up more sharply than it slowed down/.test(o)) return a1 > a3;
        if (/slowed down more sharply than it sped up/.test(o)) return a3 > a1;
        if ((m = o.match(/travelled ([\d.]+) m during stage B\./))) return near(+m[1], area(pts.slice(1, 3)), 1e-6);
        return null; };
      const tv = q.options.map(truth); if (tv.some(v => v === null)) bad.push('unknown statement ' + q.options.join(' | '));
      else if (!truth(q.a) || tv.filter(Boolean).length !== 1) wrong.push('stmc: the graph does not make exactly the answer true ' + q.options.join(' | ')); } }
}
ok(!bad.length, `${N.toLocaleString()} Field-Trip Travel Graphs questions pass the checker, start with a capital, have a hint, worked steps and a graph, no emoji, and multiple choice has 4 different options ${bad.slice(0, 3)}`);
ok(!notes.length, `every option has its own why / why-not note (the right one in other words) and typed questions name at least two usual slips ${[...new Set(notes)].slice(0, 3)}`);
ok(!wrong.length, `every answer is worked out again from the drawn graph (gradients, areas, flat parts, the statements) ${[...new Set(wrong)].slice(0, 4)}`);
ok(!scale.length, `every graph is true to its labelled axes: even ticks, corners on grid lines where the data says, the line through the corners, stage bubbles clear of the line ${[...new Set(scale)].slice(0, 4)}`);
const NEED = ['dtspeed/out', 'dtspeed/back', 'dtrest/rest', 'dtavg/exact', 'dtavg/dp', 'dtmc/stop', 'dtmc/fast', 'dtmc/back', 'dtmc/far', 'staccel/accel', 'staccel/accel-u', 'staccel/decel',
  'stdist/whole-rest', 'stdist/whole-u', 'stdist/whole-tri', 'stdist/first', 'stdist/first-u', 'stfind/findV', 'stmc/up', 'stmc/steady', 'stmc/steeper', 'stmc/area'];
ok(NEED.every(k => kinds[k] > 60), 'all 8 question types and their variants appear: ' + JSON.stringify(kinds));
{ const qs = Array.from({ length: 3000 }, (_, s) => M.make(ID, s + 1)), by = k => qs.filter(q => q.data.travel === k), has = (q, re) => q.slips.some(s => re.test(s[1]));
  ok(by('dtspeed').every(q => has(q, /km per minute/)), 'stage-speed questions name the "forgot to turn minutes into hours" slip');
  ok(by('dtavg').every(q => has(q, /leaves out the stop/) || has(q, /only the way there/)) && by('dtavg').filter(q => has(q, /leaves out the stop/)).length / by('dtavg').length > .9, 'average-speed questions name the "left out the stop" and "only the way there" slips');
  ok(by('dtmc').filter(q => q.options.some(o => /steady speed/.test(o))).every(q => /stopped, not moving steadily/.test(q.why[q.options.find(o => /steady speed/.test(o))])), 'the "flat distance–time line = steady speed" mix-up is explained');
  ok(by('stmc').filter(q => q.options.some(o => /was not moving/.test(o))).every(q => /not 0/.test(q.why[q.options.find(o => /was not moving/.test(o))])) && by('stmc').every(q => q.options.some(o => /was not moving/.test(o))), 'speed–time statements always include the "flat speed–time line = stopped" mix-up, with its note');
  ok(by('staccel').filter(q => q.data.k === 'decel').every(q => q.slips.some(s => s[0] < 0 && /positive number/.test(s[1]))), 'deceleration questions explain why the answer is positive');
  ok(by('stdist').filter(q => /total/.test(q.q)).every(q => has(q, /forgets the ½/) || has(q, /rectangle/)), 'distance questions name the "whole rectangle" / "forgot the ½" slips');
  ok(qs.every(q => !/minister|politic|election|war\b|kill|blood|weapon|gun|knife|money|salary|income|bet\b|gambl|beer|wine|crash|accident/i.test(q.q + JSON.stringify(q.why || ''))), 'kid / teen themes only');
  ok(qs.every(q => q.uid && /^travel\|/.test(q.uid)), 'every question has a uid (anti-farm)'); }
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
    const list = [seed(q => D(q).travel === 'dtspeed' && D(q).ctx === 'bus'), seed(q => D(q).travel === 'stmc' && D(q).k === 'steady' && D(q).ctx === 'mrt'), seed(q => D(q).travel === 'stdist' && D(q).k === 'whole-rest'), seed(q => D(q).travel === 'dtmc'),
      seed(q => D(q).travel === 'dtavg' && D(q).k === 'dp'), seed(q => D(q).travel === 'staccel' && D(q).k === 'decel'), seed(q => D(q).travel === 'stfind'), seed(q => D(q).travel === 'dtrest')];
    ok(list.every(Number.isInteger), `${w}px: a seed was found for every kind of question`);
    await p.evaluate(l => WR.Math.startLesson({ topic: 'g10.travel', items: l.map(s => MathGen.make('g10.travel', s)) }), list);
    await p.waitForTimeout(500);
    for (let i = 0; i < list.length; i++) {
      const q = await p.evaluate(() => WR.Math._dbg()), tag = `${w}px ${q.data.travel}/${q.data.k}`;
      ok(await fits(p), `${tag}: the graph and the choices fit the screen with no sideways scroll`);
      const taps = await p.evaluate(() => Math.min(...[...document.querySelectorAll('.mopts .opt, #mcheck, .numpad button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().height)));
      ok(taps >= 40, `${tag}: answer buttons are easy to tap (${Math.round(taps)} px)`);
      ok(await p.locator('.qcard svg.travel').count() === 1 && await p.locator('.qcard svg .xt').count() >= 4 && await p.locator('.qcard svg .tgstage').count() >= 3, `${tag}: the graph is drawn with a labelled time axis and lettered stages`);
      if (w === 375 && i === 0) await p.locator('.qcard').screenshot({ path: OUT + 'travel_01_distance_time_question.png' });
      if (i < 4) {
        if (q.kind === 'mcq') { const wk = q.options.findIndex(o => o !== q.a); await p.locator(`.mopts .opt[data-k="${wk}"]`).click(); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.why[q.options[wk]].slice(0, 30))), `${tag}: a wrong pick shows its own why-not note`);
          await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); await p.waitForTimeout(300);
          ok((await whyText(p)).some(x => x.includes(q.why[q.a].slice(0, 30))), `${tag}: the right answer shows why it works, in other words`);
          if (w === 375 && i === 1) await p.locator('.qcard').screenshot({ path: OUT + 'travel_03_speed_time_why.png' });
        } else { await p.fill('#mans', String(q.slips[0][0])); await p.click('#mcheck'); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.slips[0][1].slice(0, 30))), `${tag}: typing the usual slip (${q.slips[0][0]}) shows its why-not note`);
          if (w === 375 && i === 0) await p.locator('.qcard').screenshot({ path: OUT + 'travel_02_kmh_slip_note.png' });
          await p.fill('#mans', q.a); await p.click('#mcheck'); await p.waitForTimeout(300); }
      } else {
        if (q.kind === 'mcq') await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); else { await p.fill('#mans', q.a); await p.click('#mcheck'); }
        await p.waitForTimeout(300);
      }
      ok(await p.evaluate(() => /correct|got it/i.test(document.querySelector('.qcard').innerText)), `${tag}: the right answer is marked right`);
      if (w === 375 && i === 2) await p.locator('.qcard').screenshot({ path: OUT + 'travel_04_area_worked.png' });
      if (i < list.length - 1) { await p.click('#mnext'); await p.waitForTimeout(300); }
    }
    const m = await p.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).math);
    ok(m && m.correct >= list.length && m.answered >= list.length, `${w}px: answers are saved in wordRealms.save.v1 (math.correct ${m && m.correct}, answered ${m && m.answered})`);
    if (w === 375) {
      const st = await p.evaluate(s => { const q = MathGen.make('g10.travel', s), k = q.uid || 'g10.travel|' + q.q; const a = WR.awardStars('m', k + '|t', 1), b = WR.awardStars('m', k + '|t', 1); return [a, b]; }, list[1]).catch(() => null);
      ok(st && st[0] >= 1 && st[1] < st[0], `a replayed question pays less than the first time (${st})`);
      await p.evaluate(() => WR.go('math')); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '10'); b && b.click(); }); await p.waitForTimeout(400);
      ok(await p.locator('[data-t="g10.travel"]').count() === 1, 'the Grade 10 hub lists Field-Trip Travel Graphs');
      ok(await p.evaluate(() => { const e = document.querySelector('[data-t="g10.travel"]'); return !/\p{Extended_Pictographic}/u.test(e.innerText) && !!e.querySelector('img.wr-icon'); }), 'its hub card shows the painted bus icon, not an emoji');
      await p.locator('[data-t="g10.travel"]').scrollIntoViewIfNeeded(); await p.screenshot({ path: OUT + 'travel_05_hub_grade10.png' });
    }
    ok(!errors.length, `${w}px: no page errors ${errors.slice(0, 2)}`);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall Field-Trip Travel Graphs checks passed');
})();
