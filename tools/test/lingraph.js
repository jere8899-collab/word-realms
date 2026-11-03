// 📏 Straight-Line Street: MOE Sec 2 linear graphs — gradient, y-/x-intercepts, match equation ↔
// pastel SVG, find the equation from two points, evaluate a point, parallel / perpendicular
// gradients, and kid word problems (hill road / rainbow path / kite string / fairy tram /
// pumpkin-coach ramp / sports-day / beanstalk / lantern bridge). Node checks recompute every
// answer from q.data (and from the SVG: class=lineeq data-m/c, marks class=ldot). Cleanup: shared
// svgStraight kit in math-gen.js; Gradient Hills / Parabola / Wave / Travel stay byte-identical.
// Run: node tools/test/lingraph.js (game served on :18642). Screenshots: screenshots/lingraph_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const ID = 'g8.lingraph', fs = require('fs'), crypto = require('crypto');
const { plotFrame, svgPlane, svgParabola, svgWave, svgStraight, PLOT_BOX, axes, fmt, f1 } = M._internal;

/* ---------- 1. generators (Node) ---------- */
const t = M.topic(ID);
ok(t && t.grade === 8 && t.name === 'Straight-Line Street' && t.icon === '📏', `📏 Straight-Line Street is a Grade 8 (Sec 2) topic (${t && t.desc})`);
ok(M.TOPICS.length >= 126, `it is one of ${M.TOPICS.length} maths topics (126 when it was added)`);
{ const g = M.gradeTopics(8).map(x => x.id), i = g.indexOf(ID);
  ok(g[i - 1] === 'g8.gradient' && g[i + 1] === 'g8.proportion', 'it sits after Gradient Hills, before Proportion Potions: ' + g.join(' ')); }
// the clean-up: shared svgStraight kit; parabola / wave / axes stay byte-identical
{ const I = M._internal, gen = fs.readFileSync(ROOT + '/js/math-gen.js', 'utf8'), m = fs.readFileSync(ROOT + '/js/math-topics-m.js', 'utf8');
  ok(typeof I.svgStraight === 'function' && typeof I.svgParabola === 'function' && typeof I.svgWave === 'function'
    && I.PLOT_BOX && I.PLOT_BOX.x0 === 48 && I.PLOT_BOX.bot === 178,
    'the shared straight-line kit (svgStraight) and plane kit are on MathGen._internal');
  ok(/const svgStraight =/.test(gen) && /svgStraight/.test(gen) && /svgStraight/.test(m),
    'Straight-Line Street uses the shared svgStraight kit');
  const a0 = axes(40, 280, 30, 170, 10, 5)[0];
  ok(crypto.createHash('sha1').update(a0).digest('hex') === '8c4cbefb43acebb0193b39de61b0b3ce8e016cd2',
    'axes() output is byte-identical to the pre-cleanup chart kit');
  const { X, Y } = plotFrame(0, 60, 0, 20, PLOT_BOX);
  const Xold = v => f1(48 + v / 60 * (282 - 48)), Yold = v => f1(178 - (178 - 42) * v / 20);
  ok([0, 10, 20, 30, 45, 60].every(v => X(v) === Xold(v)) && [0, 5, 10, 20].every(v => Y(v) === Yold(v)),
    'plotFrame X/Y maps are byte-identical to the travel closed form');
  const para = svgParabola('Test', 1, -4, 3, { marks: [{ n: 'T', x: 2, y: -1, lab: '(2, -1)' }] });
  ok(crypto.createHash('sha1').update(para).digest('hex') === '893d50d2ba2fe17d05f9c3faa4930ed495ccecfa',
    'svgParabola output is byte-identical after adding svgStraight');
  const wave = svgWave('Test', 2, 1, 'sin', 0, { marks: [{ n: 'M', x: 90, y: 2, lab: 'max' }] });
  ok(crypto.createHash('sha1').update(wave).digest('hex') === '879918edbff1490914c837e92f11de0a8b8a3a35',
    'svgWave output is byte-identical after adding svgStraight');
  // Gradient Hills seed dump stays identical (topic untouched)
  const gradHash = s => {
    const q = M.make('g8.gradient', s);
    return crypto.createHash('sha1').update(JSON.stringify({ q: q.q, a: q.a, val: q.val, kind: q.kind, data: q.data, steps: q.steps, hint: q.hint })).digest('hex');
  };
  const GRAD = { 1: '95322f332d606b0edb3d1547fe12a070fd1ec674', 2: '3f0981a4248769976bf68d254f8fcfc0f4331b21', 42: '5fbdfc70831458a684b36701b331b66b4dedcdce', 100: '7ebe77963d1bf42435d0da90b8aa3f368cf7f414' };
  ok(Object.keys(GRAD).every(s => gradHash(+s) === GRAD[s]), 'Gradient Hills questions stay byte-identical');
  const svg = svgStraight('Test', 2, -1, { marks: [{ n: 'Y', x: 0, y: -1, lab: '(0, -1)' }] });
  ok(/class="lineeq"/.test(svg) && /data-m="2"/.test(svg) && /data-c="-1"/.test(svg)
    && /class="ldot"[^>]*data-n="Y"[^>]*data-x="0"[^>]*data-y="-1"/.test(svg),
    'svgStraight draws lineeq path + ldot marks with readable data attrs');
  ok(/width="150"/.test(svgStraight(' ', 1, 0, { small: true })), 'svgStraight supports small match thumbnails'); }
const attr = (tag, a) => { const m = tag.match(new RegExp(`\\b${a}="([^"]*)"`)); return m ? m[1] : null; };
const kinds = {}, bad = [], wrong = [], scale = [], notes = [], N = +process.env.N || 9000;
for (let s = 1; s <= N; s++) {
  const q = M.make(ID, s * 2654435761 >>> 0), d = q.data, js = JSON.stringify(q), key = d.lingraph;
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
  if (key === 'grad') w = d.m;
  else if (key === 'yint') w = d.c;
  else if (key === 'xint') w = d.xint;
  else if (key === 'point') w = d.ask === 'y' ? d.py : d.px;
  else if (key === 'parallel') w = String(fmt(d.m));
  else if (key === 'perp') w = String(fmt(d.perp));
  else if (key === 'word') {
    if (d.word === 'ramp-grad') w = d.m;
    else if (d.word === 'ramp-h') w = d.height;
    else if (d.word === 'speed') w = d.dist;
    else if (d.word === 'path') w = d.px;
  } else if (key === 'match') {
    if (!q.optPics || Object.keys(q.optPics).length !== 4) scale.push('match missing 4 optPics');
    else {
      const rightSvg = q.optPics[q.a];
      if (!rightSvg || !/class="lineeq"/.test(rightSvg)) scale.push('match right pic');
      else {
        const tag = rightSvg.match(/<path class="lineeq"[^>]*>/)[0];
        if (+attr(tag, 'data-m') !== d.m || +attr(tag, 'data-c') !== d.c)
          wrong.push(`match svg ${attr(tag, 'data-m')},${attr(tag, 'data-c')} vs ${d.m},${d.c}`);
      }
    }
  } else if (key === 'eq') {
    // equation MCQ: recompute m from the two points and c from data
    if (d.x2 !== d.x1) {
      const m = (d.y2 - d.y1) / (d.x2 - d.x1);
      if (Math.abs(m - d.m) > 1e-9) wrong.push('eq m from points');
    }
    if (Math.abs(d.y1 - (d.m * d.x1 + d.c)) > 1e-9) wrong.push('eq point A off line');
  }
  if (key === 'grad' && d.x2 !== d.x1) {
    const m = (d.y2 - d.y1) / (d.x2 - d.x1);
    if (Math.abs(m - d.m) > 1e-9) wrong.push('grad from points');
  }
  if (key === 'xint' && Math.abs(d.m) > 1e-12) {
    if (Math.abs(-d.c / d.m - d.xint) > 1e-9) wrong.push('xint data');
  }
  if (key === 'perp' && Math.abs(d.m * d.perp + 1) > 1e-6) wrong.push('perp product');
  if (['grad', 'yint', 'xint', 'point', 'word'].includes(key)) {
    if (Math.abs(w - q.val) > 1e-9) wrong.push(`${key}: ${w} vs ${q.val}`);
  } else if (key === 'parallel' || key === 'perp') {
    if (w !== q.a) wrong.push(`${key}: ${w} vs ${q.a}`);
  }
  /* SVG path attrs match data when a picture is present */
  if (q.pic && /class="lineeq"/.test(q.pic)) {
    const pathTag = (q.pic.match(/<path class="lineeq"[^>]*>/) || [])[0];
    if (!pathTag) scale.push('no lineeq path ' + key);
    else if (+attr(pathTag, 'data-m') !== d.m || +attr(pathTag, 'data-c') !== d.c)
      scale.push(`lineeq attrs ${key}`);
  } else if (['grad', 'yint', 'xint', 'eq', 'point', 'parallel', 'perp', 'word'].includes(key)) {
    if (!q.pic) scale.push('missing pic ' + key);
  }
}
ok(!bad.length, `${N.toLocaleString()} Straight-Line Street questions pass the checker, start with a capital, have a hint and worked steps, no emoji, and multiple choice has 4 different options ${bad.slice(0, 3)}`);
ok(!notes.length, `every option has its own why / why-not note (the right one in other words, starting with Right) and typed questions name at least two usual slips ${[...new Set(notes)].slice(0, 3)}`);
ok(!wrong.length, `every answer is worked out again from q.data ${[...new Set(wrong)].slice(0, 4)}`);
ok(!scale.length, `every line picture matches data-m/c and match ships 4 optPics ${[...new Set(scale)].slice(0, 4)}`);
const NEED = ['grad', 'yint', 'xint', 'match', 'eq', 'point', 'parallel', 'perp', 'word'];
ok(NEED.every(k => kinds[k] > 40), 'all question kinds appear: ' + JSON.stringify(kinds));
{ const qs = Array.from({ length: 3000 }, (_, s) => M.make(ID, s + 1));
  ok(qs.every(q => !/minister|politic|election|war\b|kill|blood|weapon|gun|knife|salary|income|bet\b|gambl|beer|wine|crash|accident/i.test(q.q + JSON.stringify(q.why || ''))), 'kid / teen themes only');
  ok(qs.every(q => q.uid && /^lingraph\|/.test(q.uid)), 'every question has a uid (anti-farm)');
  ok(qs.filter(q => q.data.lingraph === 'match').every(q => q.optPics && Object.keys(q.optPics).length === 4), 'match questions ship 4 graph option pictures');
  ok(qs.filter(q => ['grad', 'yint', 'xint', 'point'].includes(q.data.lingraph)).every(q => q.pic && /class="lineeq"/.test(q.pic)), 'core graph questions draw a line picture'); }
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
      seed(q => D(q).lingraph === 'grad' && q.pic && q.kind === 'mcq'),
      seed(q => D(q).lingraph === 'match' && q.optPics),
      seed(q => D(q).lingraph === 'yint' && q.kind !== 'mcq'),
      seed(q => D(q).lingraph === 'xint' && q.kind === 'mcq'),
      seed(q => D(q).lingraph === 'eq'),
      seed(q => D(q).lingraph === 'point'),
      seed(q => D(q).lingraph === 'parallel'),
      seed(q => D(q).lingraph === 'word')
    ];
    ok(list.every(Number.isInteger), `${w}px: a seed was found for every kind of question`);
    await p.evaluate(l => WR.Math.startLesson({ topic: 'g8.lingraph', items: l.map(s => MathGen.make('g8.lingraph', s)) }), list);
    await p.waitForTimeout(500);
    for (let i = 0; i < list.length; i++) {
      const q = await p.evaluate(() => WR.Math._dbg()), tag = `${w}px ${q.data.lingraph}`;
      ok(await fits(p), `${tag}: the question and the choices fit the screen with no sideways scroll`);
      const taps = await p.evaluate(() => Math.min(...[...document.querySelectorAll('.mopts .opt, #mcheck, .numpad button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().height)));
      ok(taps >= 40, `${tag}: answer buttons are easy to tap (${Math.round(taps)} px)`);
      if (q.pic) ok(await p.locator('.qcard svg.lineeq .lineeq').count() >= 1, `${tag}: the line picture is drawn`);
      if (q.optPics) ok(await p.locator('.mopts .mpicopt svg.lineeq').count() >= 4, `${tag}: four graph choices are shown`);
      if (w === 375 && i === 0) await p.locator('.qcard').screenshot({ path: OUT + 'lingraph_01_grad_question.png' });
      if (w === 375 && i === 1) await p.locator('.qcard').screenshot({ path: OUT + 'lingraph_02_match_graphs.png' });
      if (i < 4) {
        if (q.kind === 'mcq') { const wk = q.options.findIndex(o => o !== q.a); await p.locator(`.mopts .opt[data-k="${wk}"]`).click(); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.why[q.options[wk]].slice(0, 30))), `${tag}: a wrong pick shows its own why-not note`);
          await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); await p.waitForTimeout(300);
          ok((await whyText(p)).some(x => x.includes(q.why[q.a].slice(0, 30))), `${tag}: the right answer shows why it works, in other words`);
          if (w === 375 && i === 3) await p.locator('.qcard').screenshot({ path: OUT + 'lingraph_03_xint_why.png' });
        } else { await p.fill('#mans', String(q.slips[0][0])); await p.click('#mcheck'); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.slips[0][1].slice(0, 30))), `${tag}: typing the usual slip (${q.slips[0][0]}) shows its why-not note`);
          if (w === 375 && i === 2) await p.locator('.qcard').screenshot({ path: OUT + 'lingraph_04_yint_slip_note.png' });
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
      const st = await p.evaluate(s => { const q = MathGen.make('g8.lingraph', s), k = q.uid || 'g8.lingraph|' + q.q; const a = WR.awardStars('m', k + '|t', 1), b = WR.awardStars('m', k + '|t', 1); return [a, b]; }, list[1]).catch(() => null);
      ok(st && st[0] >= 1 && st[1] < st[0], `a replayed question pays less than the first time (${st})`);
      await p.evaluate(() => WR.go('math')); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '8'); b && b.click(); }); await p.waitForTimeout(400);
      ok(await p.locator('[data-t="g8.lingraph"]').count() === 1, 'the Grade 8 hub lists Straight-Line Street');
      ok(await p.evaluate(() => { const e = document.querySelector('[data-t="g8.lingraph"]'); return !/\p{Extended_Pictographic}/u.test(e.innerText) && !!e.querySelector('img.wr-icon'); }), 'its hub card shows the painted ruler icon, not an emoji');
      await p.locator('[data-t="g8.lingraph"]').scrollIntoViewIfNeeded(); await p.screenshot({ path: OUT + 'lingraph_05_hub_grade8.png' });
    }
    ok(!errors.length, `${w}px: no page errors ${errors.slice(0, 2)}`);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall Straight-Line Street checks passed');
})();
