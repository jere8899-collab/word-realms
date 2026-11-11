// 🎢 Parabola Park: MOE Sec 3 E-Math quadratic graphs — y-intercept, axis of symmetry, turning point
// (max/min), roots from a factorised form or a drawn graph, match equation ↔ pastel SVG, complete the
// square, and kid word problems (fountain / kite / bridge). Node checks recompute every answer from
// q.data (and from the SVG: class=parabola data-a/b/c, marks class=pdot data-x/data-y). Cleanup: shared
// plotFrame / svgPlane / svgParabola kit in math-gen.js; travel graphs reuse plotFrame (byte-identical
// X/Y maps). Run: node tools/test/quadgraph.js (game served on :18642). Screenshots: screenshots/quadgraph_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const ID = 'g9.quadgraph', fs = require('fs'), crypto = require('crypto');
const { plotFrame, svgPlane, svgParabola, PLOT_BOX, axes, fmt } = M._internal;

/* ---------- 1. generators (Node) ---------- */
const t = M.topic(ID);
ok(t && t.grade === 9 && t.name === 'Parabola Park' && t.icon === '🎢', `🎢 Parabola Park is a Grade 9 (Sec 3) topic (${t && t.desc})`);
ok(M.TOPICS.length >= 124, `it is one of ${M.TOPICS.length} maths topics (124 when it was added)`);
{ const g = M.gradeTopics(9).map(x => x.id), i = g.indexOf(ID);
  ok(!g[i - 1] && g[i + 1] === 'g9.indices', 'Quadratic Quarry and Twin Potions moved to Grade 8, so Parabola Park leads Grade 9: ' + g.join(' ')); }
// the clean-up: shared plane / parabola kit; travel reuses plotFrame with byte-identical X/Y maps
{ const I = M._internal, gen = fs.readFileSync(ROOT + '/js/math-gen.js', 'utf8'), h = fs.readFileSync(ROOT + '/js/math-topics-h.js', 'utf8');
  ok(typeof I.plotFrame === 'function' && typeof I.svgPlane === 'function' && typeof I.svgParabola === 'function'
    && I.PLOT_BOX && I.PLOT_BOX.x0 === 48 && I.PLOT_BOX.bot === 178,
    'the shared plane / parabola kit (plotFrame, svgPlane, svgParabola, PLOT_BOX) is on MathGen._internal');
  ok(/const plotFrame =/.test(gen) && /const svgParabola =/.test(gen) && /plotFrame, svgPlane, svgParabola/.test(gen)
    && /plotFrame\(0, g\.xmax/.test(h) && /svgParabola/.test(h),
    'Parabola Park and Field-Trip Travel Graphs both use the shared kit');
  // axes() fingerprint unchanged (chart kit left behaviour-identical)
  const a0 = axes(40, 280, 30, 170, 10, 5)[0];
  ok(crypto.createHash('sha1').update(a0).digest('hex') === '8c4cbefb43acebb0193b39de61b0b3ce8e016cd2'
    && axes(40, 280, 30, 170, 10, 5)[0] === axes(40, 280, 30, 170, 10, 5, '')[0],
    'axes() output is byte-identical to the pre-cleanup chart kit');
  // plotFrame X/Y match the closed-form travel maps (byte-identical refactor)
  const { X, Y } = plotFrame(0, 60, 0, 20, PLOT_BOX);
  const Xold = v => M._internal.f1(48 + v / 60 * (282 - 48)), Yold = v => M._internal.f1(178 - (178 - 42) * v / 20);
  ok([0, 10, 20, 30, 45, 60].every(v => X(v) === Xold(v)) && [0, 5, 10, 20].every(v => Y(v) === Yold(v)),
    'plotFrame X/Y maps are byte-identical to the old travel closed form');
  const svg = svgParabola('Test', 1, -4, 3, { marks: [{ n: 'T', x: 2, y: -1, lab: '(2, -1)' }] });
  ok(/class="parabola"/.test(svg) && /data-a="1"/.test(svg) && /data-b="-4"/.test(svg) && /data-c="3"/.test(svg)
    && /class="pdot"[^>]*data-n="T"[^>]*data-x="2"[^>]*data-y="-1"/.test(svg),
    'svgParabola draws parabola path + pdot marks with readable data attrs'); }
const attr = (tag, a) => { const m = tag.match(new RegExp(`\\b${a}="([^"]*)"`)); return m ? m[1] : null; };
const kinds = {}, bad = [], wrong = [], scale = [], notes = [], N = +process.env.N || 9000;
for (let s = 1; s <= N; s++) {
  const q = M.make(ID, s * 2654435761 >>> 0), d = q.data, js = JSON.stringify(q), key = d.quadgraph;
  kinds[key] = (kinds[key] || 0) + 1;
  if (/NaN|Infinity|undefined|\[object/.test(js) || !M.check(q, q.a).ok || !q.hint || !q.steps.length || !/^[A-Z]/.test(q.q)) bad.push(key + ' ' + q.q);
  if (/\p{Extended_Pictographic}/u.test(q.q + q.steps.join('') + q.hint + JSON.stringify(q.why || q.slips || ''))) bad.push('emoji in text');
  if (q.steps.some(x => /[\t\f\v]/.test(x))) bad.push('control character in steps (a lost backslash)');
  if (q.kind === 'mcq') {
    if (q.options.length !== 4 || new Set(q.options).size !== 4 || q.options.filter(o => o === q.a).length !== 1) bad.push('options ' + key);
    if (!q.why || q.options.some(o => !q.why[o] || q.why[o].length < 20 || M.whyNote(q, o) !== q.why[o])) notes.push('mcq note missing ' + key);
    if (new Set(q.options.map(o => q.why[o])).size !== 4) notes.push('two options share a note ' + key);
    if (!/^Right/.test(q.why[q.a]) || q.why[q.a].includes(q.a)) notes.push('right note does not explain in other words: ' + key);
  } else {
    if (!q.slips || q.slips.length < 2) notes.push('typed question with fewer than 2 slips: ' + key);
    else {
      if (q.slips.some(([v, txt]) => M.check(q, String(v)).ok || !txt || txt.length < 20 || M.whyNote(q, String(v)) !== txt)) notes.push('slip is right or has no note ' + key);
      if (M.whyNote(q, q.a)) notes.push('the right answer got a why-not note');
    }
  }
  /* recompute the answer from q.data */
  let w;
  if (key === 'yint') w = String(d.c);
  else if (key === 'axis') w = `$x = ${fmt(d.h)}$`;
  else if (key === 'maxmin') w = d.a > 0 ? 'minimum' : 'maximum';
  else if (key === 'turn') w = `${fmt(d.h)}, ${fmt(d.k)}`;
  else if (key === 'roots-fact' || key === 'roots-graph') w = d.roots.slice().sort((a, b) => a - b).join(', ');
  else if (key === 'height') w = d.k;
  else if (key === 'width') w = d.width;
  else if (key === 'square') {
    // a(x-h)^2+k form: check h,k match data; the TeX uses (x − h) or (x + |h|)
    if (Math.abs(-d.b / (2 * d.a) - d.h) > 1e-9 || Math.abs(d.a * d.h * d.h + d.b * d.h + d.c - d.k) > 1e-6) wrong.push('square h/k');
    const habs = fmt(Math.abs(d.h));
    if (d.h !== 0 && !q.a.includes(habs)) wrong.push('square answer missing h');
    if (!M.check(q, q.a).ok) wrong.push('square self-check');
  } else if (key === 'match') {
    if (!q.optPics || Object.keys(q.optPics).length !== 4) scale.push('match missing 4 optPics');
    else {
      const rightSvg = q.optPics[q.a];
      if (!rightSvg || !/class="parabola"/.test(rightSvg)) scale.push('match right pic');
      else {
        const a = +attr(rightSvg.match(/<path class="parabola"[^>]*>/)[0], 'data-a');
        const b = +attr(rightSvg.match(/<path class="parabola"[^>]*>/)[0], 'data-b');
        const c = +attr(rightSvg.match(/<path class="parabola"[^>]*>/)[0], 'data-c');
        if (a !== d.a || b !== d.b || c !== d.c) wrong.push(`match svg ${a},${b},${c} vs ${d.a},${d.b},${d.c}`);
      }
    }
  }
  if (key === 'yint' || key === 'axis' || key === 'maxmin') { if (w !== q.a) wrong.push(`${key}: ${w} vs ${q.a}`); }
  else if (key === 'turn' || key === 'roots-fact' || key === 'roots-graph') { if (!M.check(q, w).ok) wrong.push(`${key}: recomputed ${w}, answer ${q.a}`); }
  else if (key === 'height' || key === 'width') { if (w !== q.val) wrong.push(`${key}: ${w} vs ${q.val}`); }
  /* SVG path attrs match data when a picture is present */
  if (q.pic && /class="parabola"/.test(q.pic)) {
    const pathTag = (q.pic.match(/<path class="parabola"[^>]*>/) || [])[0];
    if (!pathTag) scale.push('no parabola path ' + key);
    else if (+attr(pathTag, 'data-a') !== d.a || +attr(pathTag, 'data-b') !== d.b || +attr(pathTag, 'data-c') !== d.c) scale.push(`parabola attrs ${key}`);
    if (['turn', 'maxmin', 'axis', 'height'].includes(key) || key === 'yint') {
      const dots = [...q.pic.matchAll(/<circle class="pdot"[^>]*>/g)].map(m => ({ n: attr(m[0], 'data-n'), x: +attr(m[0], 'data-x'), y: +attr(m[0], 'data-y') }));
      if (key === 'yint' && !dots.some(p => p.n === 'Y' && p.x === 0 && p.y === d.c)) scale.push('yint mark ' + key);
      if ((key === 'turn' || key === 'maxmin' || key === 'axis' || key === 'height') && !(d.k != null && dots.some(p => p.n === 'T' && Math.abs(p.x - d.h) < 1e-6 && Math.abs(p.y - d.k) < 1e-6))) scale.push('tp mark ' + key + JSON.stringify(dots) + ' want ' + d.h + ',' + d.k);
    }
    if (key === 'roots-graph' || key === 'roots-fact' || key === 'width') {
      const dots = [...q.pic.matchAll(/<circle class="pdot"[^>]*>/g)].map(m => ({ n: attr(m[0], 'data-n'), x: +attr(m[0], 'data-x'), y: +attr(m[0], 'data-y') }));
      if (key.startsWith('roots') && !d.roots.every(x => dots.some(p => /^R/.test(p.n) && p.x === x && p.y === 0))) scale.push('root marks ' + key);
    }
  } else if (['yint', 'axis', 'turn', 'maxmin', 'roots-fact', 'roots-graph', 'square', 'height', 'width'].includes(key)) {
    if (!q.pic) scale.push('missing pic ' + key);
  }
}
ok(!bad.length, `${N.toLocaleString()} Parabola Park questions pass the checker, start with a capital, have a hint and worked steps, no emoji, and multiple choice has 4 different options ${bad.slice(0, 3)}`);
ok(!notes.length, `every option has its own why / why-not note (the right one in other words, starting with Right) and typed questions name at least two usual slips ${[...new Set(notes)].slice(0, 3)}`);
ok(!wrong.length, `every answer is worked out again from q.data ${[...new Set(wrong)].slice(0, 4)}`);
ok(!scale.length, `every parabola picture matches data-a/b/c and marked points ${[...new Set(scale)].slice(0, 4)}`);
const NEED = ['yint', 'axis', 'turn', 'maxmin', 'roots-fact', 'roots-graph', 'match', 'square', 'height', 'width'];
ok(NEED.every(k => kinds[k] > 40), 'all question kinds appear: ' + JSON.stringify(kinds));
{ const qs = Array.from({ length: 3000 }, (_, s) => M.make(ID, s + 1));
  ok(qs.every(q => !/minister|politic|election|war\b|kill|blood|weapon|gun|knife|salary|income|bet\b|gambl|beer|wine|crash|accident/i.test(q.q + JSON.stringify(q.why || ''))), 'kid / teen themes only');
  ok(qs.every(q => q.uid && /^quadgraph\|/.test(q.uid)), 'every question has a uid (anti-farm)');
  ok(qs.filter(q => q.data.quadgraph === 'match').every(q => q.optPics && Object.keys(q.optPics).length === 4), 'match questions ship 4 graph option pictures');
  ok(qs.filter(q => ['yint', 'axis', 'turn', 'square'].includes(q.data.quadgraph)).every(q => q.pic && /class="parabola"/.test(q.pic)), 'core graph questions draw a parabola picture'); }
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
      seed(q => D(q).quadgraph === 'yint' && q.pic),
      seed(q => D(q).quadgraph === 'match' && q.optPics),
      seed(q => D(q).quadgraph === 'turn'),
      seed(q => D(q).quadgraph === 'axis'),
      seed(q => D(q).quadgraph === 'roots-graph'),
      seed(q => D(q).quadgraph === 'square'),
      seed(q => D(q).quadgraph === 'height'),
      seed(q => D(q).quadgraph === 'maxmin')
    ];
    ok(list.every(Number.isInteger), `${w}px: a seed was found for every kind of question`);
    await p.evaluate(l => WR.Math.startLesson({ topic: 'g9.quadgraph', items: l.map(s => MathGen.make('g9.quadgraph', s)) }), list);
    await p.waitForTimeout(500);
    for (let i = 0; i < list.length; i++) {
      const q = await p.evaluate(() => WR.Math._dbg()), tag = `${w}px ${q.data.quadgraph}`;
      ok(await fits(p), `${tag}: the question and the choices fit the screen with no sideways scroll`);
      const taps = await p.evaluate(() => Math.min(...[...document.querySelectorAll('.mopts .opt, #mcheck, .numpad button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().height)));
      ok(taps >= 40, `${tag}: answer buttons are easy to tap (${Math.round(taps)} px)`);
      if (q.pic) ok(await p.locator('.qcard svg.parabola .parabola').count() >= 1, `${tag}: the parabola picture is drawn`);
      if (q.optPics) ok(await p.locator('.mopts .mpicopt svg.parabola').count() >= 4, `${tag}: four graph choices are shown`);
      if (w === 375 && i === 0) await p.locator('.qcard').screenshot({ path: OUT + 'quadgraph_01_yint_question.png' });
      if (w === 375 && i === 1) await p.locator('.qcard').screenshot({ path: OUT + 'quadgraph_02_match_graphs.png' });
      if (i < 4) {
        if (q.kind === 'mcq') { const wk = q.options.findIndex(o => o !== q.a); await p.locator(`.mopts .opt[data-k="${wk}"]`).click(); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.why[q.options[wk]].slice(0, 30))), `${tag}: a wrong pick shows its own why-not note`);
          await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); await p.waitForTimeout(300);
          ok((await whyText(p)).some(x => x.includes(q.why[q.a].slice(0, 30))), `${tag}: the right answer shows why it works, in other words`);
          if (w === 375 && i === 3) await p.locator('.qcard').screenshot({ path: OUT + 'quadgraph_03_axis_why.png' });
        } else { await p.fill('#mans', String(q.slips[0][0])); await p.click('#mcheck'); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.slips[0][1].slice(0, 30))), `${tag}: typing the usual slip (${q.slips[0][0]}) shows its why-not note`);
          if (w === 375 && i === 2) await p.locator('.qcard').screenshot({ path: OUT + 'quadgraph_04_turn_slip_note.png' });
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
      const st = await p.evaluate(s => { const q = MathGen.make('g9.quadgraph', s), k = q.uid || 'g9.quadgraph|' + q.q; const a = WR.awardStars('m', k + '|t', 1), b = WR.awardStars('m', k + '|t', 1); return [a, b]; }, list[1]).catch(() => null);
      ok(st && st[0] >= 1 && st[1] < st[0], `a replayed question pays less than the first time (${st})`);
      await p.evaluate(() => WR.go('math')); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '9'); b && b.click(); }); await p.waitForTimeout(400);
      ok(await p.locator('[data-t="g9.quadgraph"]').count() === 1, 'the Grade 9 hub lists Parabola Park');
      ok(await p.evaluate(() => { const e = document.querySelector('[data-t="g9.quadgraph"]'); return !/\p{Extended_Pictographic}/u.test(e.innerText) && !!e.querySelector('img.wr-icon'); }), 'its hub card shows the painted roller-coaster icon, not an emoji');
      await p.locator('[data-t="g9.quadgraph"]').scrollIntoViewIfNeeded(); await p.screenshot({ path: OUT + 'quadgraph_05_hub_grade9.png' });
    }
    ok(!errors.length, `${w}px: no page errors ${errors.slice(0, 2)}`);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall Parabola Park checks passed');
})();
