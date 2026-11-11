// 🌊 Wave Pier: Additional Mathematics extra (not core G3 maths) — amplitude |a|, period 360°/|b|
// (degrees), max/min with vertical shift d, match equation ↔ pastel SVG wave, read a marked point /
// y-intercept / crest from the graph, and kid word problems (Ferris wheel / Tide Pier / lantern).
// Node checks recompute every answer from q.data (and from the SVG: class=wave data-a/b/kind/d,
// marks class=wdot). Cleanup: shared ampPeriod / svgWave kit in math-gen.js; Parabola Park + Travel
// Graphs stay byte-identical on plotFrame / svgParabola. Run: node tools/test/triggraph.js
// (game served on :18642). Screenshots: screenshots/triggraph_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const ID = 'g10.triggraph', fs = require('fs'), crypto = require('crypto');
const { plotFrame, svgPlane, svgParabola, svgWave, ampPeriod, PLOT_BOX, axes, fmt, f1 } = M._internal;

/* ---------- 1. generators (Node) ---------- */
const t = M.topic(ID);
ok(t && t.grade === 10 && t.extra === 'amath' && t.name === 'Wave Pier' && t.icon === '🌊', `🌊 Wave Pier is a Grade 10 Additional Mathematics extra (${t && t.desc})`);
ok(M.TOPICS.length >= 125, `it is one of ${M.TOPICS.length} maths topics (125 when it was added)`);
{ const g = M.gradeTopics(10).map(x => x.id), i = g.indexOf(ID);
  ok(g[i - 1] === 'g10.sinecos' && g[i + 1] === 'g10.prob2', 'it sits after Sine & Cosine Castle, before Two-Draw Treasure: ' + g.join(' ')); }
// the clean-up: shared wave kit; parabola + travel stay byte-identical
{ const I = M._internal, gen = fs.readFileSync(ROOT + '/js/math-gen.js', 'utf8'), h = fs.readFileSync(ROOT + '/js/math-topics-h.js', 'utf8');
  ok(typeof I.ampPeriod === 'function' && typeof I.svgWave === 'function' && typeof I.svgParabola === 'function'
    && I.PLOT_BOX && I.PLOT_BOX.x0 === 48 && I.PLOT_BOX.bot === 178,
    'the shared wave kit (ampPeriod, svgWave) and plane kit are on MathGen._internal');
  ok(/const ampPeriod =/.test(gen) && /const svgWave =/.test(gen) && /ampPeriod, svgWave/.test(gen)
    && /svgWave/.test(h) && /ampPeriod/.test(h),
    'Wave Pier uses the shared ampPeriod / svgWave kit');
  const a0 = axes(40, 280, 30, 170, 10, 5)[0];
  ok(crypto.createHash('sha1').update(a0).digest('hex') === '8c4cbefb43acebb0193b39de61b0b3ce8e016cd2',
    'axes() output is byte-identical to the pre-cleanup chart kit');
  const { X, Y } = plotFrame(0, 60, 0, 20, PLOT_BOX);
  const Xold = v => f1(48 + v / 60 * (282 - 48)), Yold = v => f1(178 - (178 - 42) * v / 20);
  ok([0, 10, 20, 30, 45, 60].every(v => X(v) === Xold(v)) && [0, 5, 10, 20].every(v => Y(v) === Yold(v)),
    'plotFrame X/Y maps are byte-identical to the travel closed form');
  const para = svgParabola('Test', 1, -4, 3, { marks: [{ n: 'T', x: 2, y: -1, lab: '(2, -1)' }] });
  ok(crypto.createHash('sha1').update(para).digest('hex') === '893d50d2ba2fe17d05f9c3faa4930ed495ccecfa',
    'svgParabola output is byte-identical after adding svgWave');
  ok(I.ampPeriod(2, 3).amp === 2 && I.ampPeriod(2, 3).period === 120 && I.ampPeriod(-4, 0.5).period === 720,
    'ampPeriod returns |a| and 360/|b| in degrees');
  const svg = svgWave('Test', 2, 1, 'sin', 0, { marks: [{ n: 'M', x: 90, y: 2, lab: 'max' }] });
  ok(/class="wave"/.test(svg) && /data-a="2"/.test(svg) && /data-b="1"/.test(svg) && /data-kind="sin"/.test(svg)
    && /data-d="0"/.test(svg) && /class="wdot"[^>]*data-n="M"[^>]*data-x="90"[^>]*data-y="2"/.test(svg),
    'svgWave draws wave path + wdot marks with readable data attrs'); }
const attr = (tag, a) => { const m = tag.match(new RegExp(`\\b${a}="([^"]*)"`)); return m ? m[1] : null; };
const kinds = {}, bad = [], wrong = [], scale = [], notes = [], N = +process.env.N || 9000;
for (let s = 1; s <= N; s++) {
  const q = M.make(ID, s * 2654435761 >>> 0), d = q.data, js = JSON.stringify(q), key = d.triggraph;
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
  if (key === 'amp') w = String(d.amp);
  else if (key === 'period') w = String(d.period);
  else if (key === 'max') w = d.max;
  else if (key === 'min') w = d.min;
  else if (key === 'range') w = fmt(d.max) + ', ' + fmt(d.min);
  else if (key === 'yint') w = d.y0;
  else if (key === 'crest') w = d.max;
  else if (key === 'point') w = d.py;
  else if (key === 'word-amp') w = d.amp;
  else if (key === 'word-period') w = d.period;
  else if (key === 'word-max') w = d.max;
  else if (key === 'match') {
    if (!q.optPics || Object.keys(q.optPics).length !== 4) scale.push('match missing 4 optPics');
    else {
      const rightSvg = q.optPics[q.a];
      if (!rightSvg || !/class="wave"/.test(rightSvg)) scale.push('match right pic');
      else {
        const tag = rightSvg.match(/<path class="wave"[^>]*>/)[0];
        if (+attr(tag, 'data-a') !== d.a || +attr(tag, 'data-b') !== d.b || attr(tag, 'data-kind') !== d.kind || +attr(tag, 'data-d') !== d.d)
          wrong.push(`match svg ${attr(tag, 'data-a')},${attr(tag, 'data-b')},${attr(tag, 'data-kind')},${attr(tag, 'data-d')} vs ${d.a},${d.b},${d.kind},${d.d}`);
      }
    }
  }
  // amp/period consistency from a,b
  if (d.a != null && d.b != null) {
    const ap = ampPeriod(d.a, d.b);
    if (d.amp != null && ap.amp !== d.amp) wrong.push('amp data');
    if (d.period != null && ap.period !== d.period) wrong.push('period data');
    if (d.max != null && d.min != null && (d.max !== d.d + d.amp || d.min !== d.d - d.amp)) wrong.push('max/min data');
  }
  if (key === 'amp' || key === 'period') { if (w !== q.a) wrong.push(`${key}: ${w} vs ${q.a}`); }
  else if (key === 'range') { if (!M.check(q, w).ok) wrong.push(`${key}: recomputed ${w}, answer ${q.a}`); }
  else if (['max', 'min', 'yint', 'crest', 'point', 'word-amp', 'word-period', 'word-max'].includes(key)) {
    if (Math.abs(w - q.val) > 1e-9) wrong.push(`${key}: ${w} vs ${q.val}`);
  }
  /* SVG path attrs match data when a picture is present */
  if (q.pic && /class="wave"/.test(q.pic)) {
    const pathTag = (q.pic.match(/<path class="wave"[^>]*>/) || [])[0];
    if (!pathTag) scale.push('no wave path ' + key);
    else if (+attr(pathTag, 'data-a') !== d.a || +attr(pathTag, 'data-b') !== d.b || attr(pathTag, 'data-kind') !== d.kind || +attr(pathTag, 'data-d') !== d.d)
      scale.push(`wave attrs ${key}`);
    if (['crest', 'max', 'word-max', 'word-amp'].includes(key)) {
      const dots = [...q.pic.matchAll(/<circle class="wdot"[^>]*>/g)].map(m => ({ n: attr(m[0], 'data-n'), x: +attr(m[0], 'data-x'), y: +attr(m[0], 'data-y') }));
      if (d.max != null && !dots.some(p => Math.abs(p.y - d.max) < 1e-6)) scale.push('crest mark ' + key);
    }
    if (key === 'yint') {
      const dots = [...q.pic.matchAll(/<circle class="wdot"[^>]*>/g)].map(m => ({ n: attr(m[0], 'data-n'), x: +attr(m[0], 'data-x'), y: +attr(m[0], 'data-y') }));
      if (!dots.some(p => p.n === 'Y' && p.x === 0 && Math.abs(p.y - d.y0) < 1e-6)) scale.push('yint mark ' + key);
    }
  } else if (['amp', 'period', 'max', 'min', 'range', 'yint', 'crest', 'point', 'word-amp', 'word-period', 'word-max'].includes(key)) {
    if (!q.pic) scale.push('missing pic ' + key);
  }
}
ok(!bad.length, `${N.toLocaleString()} Wave Pier questions pass the checker, start with a capital, have a hint and worked steps, no emoji, and multiple choice has 4 different options ${bad.slice(0, 3)}`);
ok(!notes.length, `every option has its own why / why-not note (the right one in other words, starting with Right) and typed questions name at least two usual slips ${[...new Set(notes)].slice(0, 3)}`);
ok(!wrong.length, `every answer is worked out again from q.data ${[...new Set(wrong)].slice(0, 4)}`);
ok(!scale.length, `every wave picture matches data-a/b/kind/d and marked points ${[...new Set(scale)].slice(0, 4)}`);
const NEED = ['amp', 'period', 'max', 'min', 'range', 'match', 'yint', 'crest', 'point', 'word-amp', 'word-period', 'word-max'];
ok(NEED.every(k => kinds[k] > 40), 'all question kinds appear: ' + JSON.stringify(kinds));
{ const qs = Array.from({ length: 3000 }, (_, s) => M.make(ID, s + 1));
  ok(qs.every(q => !/minister|politic|election|war\b|kill|blood|weapon|gun|knife|salary|income|bet\b|gambl|beer|wine|crash|accident/i.test(q.q + JSON.stringify(q.why || ''))), 'kid / teen themes only');
  ok(qs.every(q => q.uid && /^triggraph\|/.test(q.uid)), 'every question has a uid (anti-farm)');
  ok(qs.filter(q => q.data.triggraph === 'match').every(q => q.optPics && Object.keys(q.optPics).length === 4), 'match questions ship 4 graph option pictures');
  ok(qs.filter(q => ['amp', 'period', 'max', 'yint'].includes(q.data.triggraph)).every(q => q.pic && /class="wave"/.test(q.pic)), 'core graph questions draw a wave picture');
  ok(qs.every(q => q.data.period === 360 / Math.abs(q.data.b)), 'period always uses degrees (360/|b|)'); }
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
      seed(q => D(q).triggraph === 'amp' && q.pic && q.kind === 'mcq'),
      seed(q => D(q).triggraph === 'match' && q.optPics),
      seed(q => D(q).triggraph === 'max'),
      seed(q => D(q).triggraph === 'period'),
      seed(q => D(q).triggraph === 'yint'),
      seed(q => D(q).triggraph === 'word-max'),
      seed(q => D(q).triggraph === 'crest'),
      seed(q => D(q).triggraph === 'point')
    ];
    ok(list.every(Number.isInteger), `${w}px: a seed was found for every kind of question`);
    await p.evaluate(l => WR.Math.startLesson({ topic: 'g10.triggraph', items: l.map(s => MathGen.make('g10.triggraph', s)) }), list);
    await p.waitForTimeout(500);
    for (let i = 0; i < list.length; i++) {
      const q = await p.evaluate(() => WR.Math._dbg()), tag = `${w}px ${q.data.triggraph}`;
      ok(await fits(p), `${tag}: the question and the choices fit the screen with no sideways scroll`);
      const taps = await p.evaluate(() => Math.min(...[...document.querySelectorAll('.mopts .opt, #mcheck, .numpad button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().height)));
      ok(taps >= 40, `${tag}: answer buttons are easy to tap (${Math.round(taps)} px)`);
      if (q.pic) ok(await p.locator('.qcard svg.wave .wave').count() >= 1, `${tag}: the wave picture is drawn`);
      if (q.optPics) ok(await p.locator('.mopts .mpicopt svg.wave').count() >= 4, `${tag}: four graph choices are shown`);
      if (w === 375 && i === 0) await p.locator('.qcard').screenshot({ path: OUT + 'triggraph_01_amp_question.png' });
      if (w === 375 && i === 1) await p.locator('.qcard').screenshot({ path: OUT + 'triggraph_02_match_graphs.png' });
      if (i < 4) {
        if (q.kind === 'mcq') { const wk = q.options.findIndex(o => o !== q.a); await p.locator(`.mopts .opt[data-k="${wk}"]`).click(); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.why[q.options[wk]].slice(0, 30))), `${tag}: a wrong pick shows its own why-not note`);
          await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); await p.waitForTimeout(300);
          ok((await whyText(p)).some(x => x.includes(q.why[q.a].slice(0, 30))), `${tag}: the right answer shows why it works, in other words`);
          if (w === 375 && i === 3) await p.locator('.qcard').screenshot({ path: OUT + 'triggraph_03_period_why.png' });
        } else { await p.fill('#mans', String(q.slips[0][0])); await p.click('#mcheck'); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.slips[0][1].slice(0, 30))), `${tag}: typing the usual slip (${q.slips[0][0]}) shows its why-not note`);
          if (w === 375 && i === 2) await p.locator('.qcard').screenshot({ path: OUT + 'triggraph_04_max_slip_note.png' });
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
      const st = await p.evaluate(s => { const q = MathGen.make('g10.triggraph', s), k = q.uid || 'g10.triggraph|' + q.q; const a = WR.awardStars('m', k + '|t', 1), b = WR.awardStars('m', k + '|t', 1); return [a, b]; }, list[1]).catch(() => null);
      ok(st && st[0] >= 1 && st[1] < st[0], `a replayed question pays less than the first time (${st})`);
      await p.evaluate(() => WR.go('math')); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '10'); b && b.click(); }); await p.waitForTimeout(400);
      ok(await p.locator('[data-t="g10.triggraph"]').count() === 1, 'the Grade 10 hub lists Wave Pier');
      ok(await p.evaluate(() => { const e = document.querySelector('[data-t="g10.triggraph"]'); return !/\p{Extended_Pictographic}/u.test(e.innerText) && !!e.querySelector('img.wr-icon'); }), 'its hub card shows the painted wave icon, not an emoji');
      await p.locator('[data-t="g10.triggraph"]').scrollIntoViewIfNeeded(); await p.screenshot({ path: OUT + 'triggraph_05_hub_grade10.png' });
    }
    ok(!errors.length, `${w}px: no page errors ${errors.slice(0, 2)}`);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall Wave Pier checks passed');
})();
