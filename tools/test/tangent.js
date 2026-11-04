// 🏮 Lantern Tangent Trail: MOE JC1 / H1–H2 calculus applications — gradient on a curve,
// equation of the tangent / normal, match curve+tangent pictures, increasing/decreasing,
// contact-point checks, and kid word problems (lantern trail / hill road / kite string /
// rainbow arc / pumpkin-coach ramp / beanstalk / fairy tram / sports-day hill). Node checks
// recompute every answer from q.data (and from the SVG: class=polycurve data-terms, tangent
// class=tline data-m/c/x0, marks class=cdot). Cleanup: shared diffPoly + svgCurve/svgTangent
// kit in math-gen.js; Derivative Dragons / Hilltop Stationary / Parabola / Wave / Straight
// stay byte-identical. Run: node tools/test/tangent.js (game served on :18642).
// Screenshots: screenshots/tangent_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const ID = 'g11.tangent', fs = require('fs'), crypto = require('crypto');
const { plotFrame, svgPlane, svgParabola, svgWave, svgStraight, diffPoly, evalPoly, svgCurve, svgTangent, PLOT_BOX, axes, fmt, f1 } = M._internal;

/* ---------- 1. generators (Node) ---------- */
const t = M.topic(ID);
ok(t && t.grade === 11 && t.name === 'Lantern Tangent Trail' && t.icon === '🏮', `🏮 Lantern Tangent Trail is a Grade 11 (JC1) topic (${t && t.desc})`);
ok(M.TOPICS.length >= 127, `it is one of ${M.TOPICS.length} maths topics (127 when it was added)`);
{ const g = M.gradeTopics(11).map(x => x.id), i = g.indexOf(ID);
  ok(g[i - 1] === 'g11.stationary' && g[i + 1] === 'g11.ap', 'it sits after Hilltop Stationary Points, before Arithmetic Avenue: ' + g.join(' ')); }
// the clean-up: shared diffPoly + svgCurve/svgTangent; parabola / wave / straight + g11.diff / g11.stationary stay byte-identical
{ const I = M._internal, gen = fs.readFileSync(ROOT + '/js/math-gen.js', 'utf8'), h = fs.readFileSync(ROOT + '/js/math-topics-h.js', 'utf8');
  ok(typeof I.diffPoly === 'function' && typeof I.evalPoly === 'function' && typeof I.svgCurve === 'function' && typeof I.svgTangent === 'function'
    && typeof I.svgParabola === 'function' && typeof I.svgWave === 'function' && typeof I.svgStraight === 'function'
    && I.PLOT_BOX && I.PLOT_BOX.x0 === 48 && I.PLOT_BOX.bot === 178,
    'the shared polycurve/tangent kit (diffPoly, svgCurve, svgTangent) and plane kit are on MathGen._internal');
  ok(/const diffPoly =/.test(gen) && /const svgCurve =/.test(gen) && /const svgTangent =/.test(gen)
    && /diffPoly\(terms\)/.test(h) && /svgTangent|svgCurve/.test(h),
    'Lantern Tangent Trail uses the shared diffPoly + svgCurve/svgTangent kit');
  ok(JSON.stringify(I.diffPoly([[2, 3], [-3, 2], [1, 0]])) === '[[6,2],[-6,1]]'
    && I.evalPoly([[1, 2], [-4, 1], [3, 0]], 2) === -1,
    'diffPoly brings the power down and drops constants; evalPoly evaluates at x');
  const a0 = axes(40, 280, 30, 170, 10, 5)[0];
  ok(crypto.createHash('sha1').update(a0).digest('hex') === '8c4cbefb43acebb0193b39de61b0b3ce8e016cd2',
    'axes() output is byte-identical to the pre-cleanup chart kit');
  const para = svgParabola('Test', 1, -4, 3, { marks: [{ n: 'T', x: 2, y: -1, lab: '(2, -1)' }] });
  ok(crypto.createHash('sha1').update(para).digest('hex') === '893d50d2ba2fe17d05f9c3faa4930ed495ccecfa',
    'svgParabola output is byte-identical after adding svgCurve/svgTangent');
  const wave = svgWave('Test', 2, 1, 'sin', 0, { marks: [{ n: 'M', x: 90, y: 2, lab: 'max' }] });
  ok(crypto.createHash('sha1').update(wave).digest('hex') === '879918edbff1490914c837e92f11de0a8b8a3a35',
    'svgWave output is byte-identical after adding svgCurve/svgTangent');
  const straight = svgStraight('Test', 2, -1, { marks: [{ n: 'Y', x: 0, y: -1, lab: '(0, -1)' }] });
  ok(crypto.createHash('sha1').update(straight).digest('hex') === 'd958d6b6b568713b234ed0881d1898aa13ed1c11',
    'svgStraight output is byte-identical after adding svgCurve/svgTangent');
  const dumpHash = (id, s) => {
    const q = M.make(id, s);
    return crypto.createHash('sha1').update(JSON.stringify({ q: q.q, a: q.a, val: q.val, kind: q.kind, data: q.data, steps: q.steps, hint: q.hint })).digest('hex');
  };
  const DIFF = { 1: '89222042a098ef621d9037e2c6f9da1636ba0e66', 2: '5ea51f9d4a98fd6d2bc2d6be18a6d57202e337d6', 42: '1140ec74e02fa64a3eddbfdb3864b04200ce4f4f', 100: '347302a492479e0d71958e5d46bbbbdfd0b46b3b' };
  const STAT = { 1: 'c90861602cc314f457ca1b6171024db314ef43e0', 2: '8740acbcbfe13767e68e7f79380b5d8c423a5115', 42: '186899d942c583200974b49919471048b201cef3', 100: '4f8f9c4466fcdcf680f35dec5b6044adc50be125' };
  ok(Object.keys(DIFF).every(s => dumpHash('g11.diff', +s) === DIFF[s]), 'Derivative Dragons questions stay byte-identical');
  ok(Object.keys(STAT).every(s => dumpHash('g11.stationary', +s) === STAT[s]), 'Hilltop Stationary Points questions stay byte-identical');
  const curve = svgCurve('Test', [[1, 2], [-4, 1], [3, 0]], { marks: [{ n: 'P', x: 2, y: -1, lab: 'P' }] });
  ok(/class="polycurve"/.test(curve) && /data-terms=/.test(curve) && /class="cdot"/.test(curve),
    'svgCurve draws polycurve path + cdot marks with readable data attrs');
  const tang = svgTangent('Test', [[1, 2], [-4, 1], [3, 0]], 2);
  ok(/class="polycurve"/.test(tang) && /class="tline"/.test(tang) && /data-m="0"/.test(tang) && /data-x0="2"/.test(tang)
    && /class="cdot"/.test(tang),
    'svgTangent draws curve + dashed tline + contact mark');
  ok(/width="150"/.test(svgTangent(' ', [[1, 2], [0, 1], [0, 0]], 1, { small: true })), 'svgTangent supports small match thumbnails'); }

const attr = (tag, a) => { const m = tag.match(new RegExp(`\\b${a}="([^"]*)"`)); return m ? m[1] : null; };
const kinds = {}, bad = [], wrong = [], scale = [], notes = [], N = +process.env.N || 9000;
for (let s = 1; s <= N; s++) {
  const q = M.make(ID, s * 2654435761 >>> 0), d = q.data, js = JSON.stringify(q), key = d.tangent;
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
  if (key === 'grad' || (key === 'story' && (d.word === 'grad' || d.word === 'rate'))) w = d.m;
  else if (key === 'incdec' && d.ask === 'find') w = String(fmt(d.x0));
  else if (key === 'point' && d.ask === 'y') w = d.y0;
  else if (key === 'point' && d.ask === 'x') w = d.x0;
  else if (key === 'point' && d.ask === 'on') w = d.on ? 'yes' : 'no';
  else if (key === 'tangenteq' || (key === 'story' && d.word === 'tang')) {
    const m = evalPoly(diffPoly(d.terms), d.x0), y0 = evalPoly(d.terms, d.x0), c = y0 - m * d.x0;
    if (Math.abs(m - d.m) > 1e-9 || Math.abs(c - d.c) > 1e-6) wrong.push('tangenteq m/c from terms');
  } else if (key === 'normaleq') {
    const m = evalPoly(diffPoly(d.terms), d.x0);
    if (Math.abs(m) < 1e-9) wrong.push('normaleq zero m');
    else if (Math.abs(m * d.nm + 1) > 0.02) wrong.push('normaleq product');
  } else if (key === 'match') {
    if (!q.optPics || Object.keys(q.optPics).length !== 4) scale.push('match missing 4 optPics');
    else {
      const rightSvg = q.optPics[q.a];
      if (!rightSvg || !/class="polycurve"/.test(rightSvg) || !/class="tline"/.test(rightSvg)) scale.push('match right pic');
      else {
        const tag = rightSvg.match(/<path class="tline"[^>]*>/)[0];
        if (Math.abs(+attr(tag, 'data-m') - d.m) > 1e-6 || Math.abs(+attr(tag, 'data-x0') - d.x0) > 1e-6)
          wrong.push(`match svg ${attr(tag, 'data-m')},${attr(tag, 'data-x0')} vs ${d.m},${d.x0}`);
      }
    }
  } else if (key === 'incdec' && d.ask === 'sign') {
    const m = evalPoly(diffPoly(d.terms), d.x0);
    if (Math.abs(m - d.m) > 1e-9) wrong.push('incdec m');
  }
  if (['grad'].includes(key) || (key === 'story' && (d.word === 'grad' || d.word === 'rate'))) {
    const m = evalPoly(diffPoly(d.terms), d.x0);
    if (Math.abs(m - d.m) > 1e-9) wrong.push('grad from terms');
    if (Math.abs(w - q.val) > 1e-9) wrong.push(`${key}: ${w} vs ${q.val}`);
  } else if (key === 'point' && (d.ask === 'x' || d.ask === 'y')) {
    if (Math.abs(w - q.val) > 1e-9) wrong.push(`${key}: ${w} vs ${q.val}`);
  } else if (key === 'point' && d.ask === 'on') {
    if (w !== q.a) wrong.push(`${key}: ${w} vs ${q.a}`);
  } else if (key === 'incdec' && d.ask === 'find') {
    if (w !== q.a) wrong.push(`${key}: ${w} vs ${q.a}`);
    if (!(evalPoly(diffPoly(d.terms), d.x0) > 0)) wrong.push('find x not positive grad');
  }
  /* SVG path attrs match data when a picture is present */
  if (q.pic && /class="polycurve"/.test(q.pic)) {
    const pathTag = (q.pic.match(/<path class="polycurve"[^>]*>/) || [])[0];
    if (!pathTag) scale.push('no polycurve path ' + key);
    else {
      try {
        const terms = JSON.parse(attr(pathTag, 'data-terms').replace(/&quot;/g, '"'));
        if (JSON.stringify(terms) !== JSON.stringify(d.terms)) scale.push('polycurve terms ' + key);
      } catch (e) { scale.push('polycurve terms parse ' + key); }
    }
    if (/class="tline"/.test(q.pic)) {
      const tTag = (q.pic.match(/<path class="tline"[^>]*>/) || [])[0];
      if (tTag && Math.abs(+attr(tTag, 'data-m') - d.m) > 1e-6) scale.push('tline m ' + key);
    }
  } else if (['grad', 'tangenteq', 'normaleq', 'incdec', 'point', 'story'].includes(key)) {
    if (!q.pic) scale.push('missing pic ' + key);
  }
}
ok(!bad.length, `${N.toLocaleString()} Lantern Tangent Trail questions pass the checker, start with a capital, have a hint and worked steps, no emoji, and multiple choice has 4 different options ${bad.slice(0, 3)}`);
ok(!notes.length, `every option has its own why / why-not note (the right one in other words, starting with Right) and typed questions name at least two usual slips ${[...new Set(notes)].slice(0, 3)}`);
ok(!wrong.length, `every answer is worked out again from q.data ${[...new Set(wrong)].slice(0, 4)}`);
ok(!scale.length, `every curve picture matches data-terms and match ships 4 optPics ${[...new Set(scale)].slice(0, 4)}`);
const NEED = ['grad', 'tangenteq', 'normaleq', 'match', 'incdec', 'point', 'story'];
ok(NEED.every(k => kinds[k] > 40), 'all question kinds appear: ' + JSON.stringify(kinds));
{ const qs = Array.from({ length: 3000 }, (_, s) => M.make(ID, s + 1));
  ok(qs.every(q => !/minister|politic|election|war\b|kill|blood|weapon|gun|knife|salary|income|bet\b|gambl|beer|wine|crash|accident/i.test(q.q + JSON.stringify(q.why || ''))), 'kid / teen themes only');
  ok(qs.every(q => q.uid && /^tangent\|/.test(q.uid)), 'every question has a uid (anti-farm)');
  ok(qs.filter(q => q.data.tangent === 'match').every(q => q.optPics && Object.keys(q.optPics).length === 4), 'match questions ship 4 graph option pictures');
  ok(qs.filter(q => ['grad', 'tangenteq', 'normaleq', 'point'].includes(q.data.tangent)).every(q => q.pic && /class="polycurve"/.test(q.pic)), 'core graph questions draw a curve picture'); }

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
      seed(q => D(q).tangent === 'grad' && q.pic && q.kind === 'mcq'),
      seed(q => D(q).tangent === 'match' && q.optPics),
      seed(q => D(q).tangent === 'grad' && q.kind !== 'mcq'),
      seed(q => D(q).tangent === 'tangenteq'),
      seed(q => D(q).tangent === 'normaleq'),
      seed(q => D(q).tangent === 'point'),
      seed(q => D(q).tangent === 'incdec'),
      seed(q => D(q).tangent === 'story')
    ];
    ok(list.every(Number.isInteger), `${w}px: a seed was found for every kind of question`);
    await p.evaluate(l => WR.Math.startLesson({ topic: 'g11.tangent', items: l.map(s => MathGen.make('g11.tangent', s)) }), list);
    await p.waitForTimeout(500);
    for (let i = 0; i < list.length; i++) {
      const q = await p.evaluate(() => WR.Math._dbg()), tag = `${w}px ${q.data.tangent}`;
      ok(await fits(p), `${tag}: the question and the choices fit the screen with no sideways scroll`);
      const taps = await p.evaluate(() => Math.min(...[...document.querySelectorAll('.mopts .opt, #mcheck, .numpad button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().height)));
      ok(taps >= 40, `${tag}: answer buttons are easy to tap (${Math.round(taps)} px)`);
      if (q.pic) ok(await p.locator('.qcard svg.polycurve .polycurve, .qcard svg.tangent .polycurve').count() >= 1, `${tag}: the curve picture is drawn`);
      if (q.optPics) ok(await p.locator('.mopts .mpicopt svg.tangent, .mopts .mpicopt svg.polycurve').count() >= 4, `${tag}: four graph choices are shown`);
      if (w === 375 && i === 0) await p.locator('.qcard').screenshot({ path: OUT + 'tangent_01_grad_question.png' });
      if (w === 375 && i === 1) await p.locator('.qcard').screenshot({ path: OUT + 'tangent_02_match_graphs.png' });
      if (i < 4) {
        if (q.kind === 'mcq') { const wk = q.options.findIndex(o => o !== q.a); await p.locator(`.mopts .opt[data-k="${wk}"]`).click(); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.why[q.options[wk]].slice(0, 30))), `${tag}: a wrong pick shows its own why-not note`);
          await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); await p.waitForTimeout(300);
          ok((await whyText(p)).some(x => x.includes(q.why[q.a].slice(0, 30))), `${tag}: the right answer shows why it works, in other words`);
          if (w === 375 && i === 3) await p.locator('.qcard').screenshot({ path: OUT + 'tangent_03_tangenteq_why.png' });
        } else { await p.fill('#mans', String(q.slips[0][0])); await p.click('#mcheck'); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.slips[0][1].slice(0, 30))), `${tag}: typing the usual slip (${q.slips[0][0]}) shows its why-not note`);
          if (w === 375 && i === 2) await p.locator('.qcard').screenshot({ path: OUT + 'tangent_04_grad_slip_note.png' });
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
      const st = await p.evaluate(s => { const q = MathGen.make('g11.tangent', s), k = q.uid || 'g11.tangent|' + q.q; const a = WR.awardStars('m', k + '|t', 1), b = WR.awardStars('m', k + '|t', 1); return [a, b]; }, list[1]).catch(() => null);
      ok(st && st[0] >= 1 && st[1] < st[0], `a replayed question pays less than the first time (${st})`);
      await p.evaluate(() => WR.go('math')); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '11'); b && b.click(); }); await p.waitForTimeout(400);
      ok(await p.locator('[data-t="g11.tangent"]').count() === 1, 'the Grade 11 hub lists Lantern Tangent Trail');
      ok(await p.evaluate(() => { const e = document.querySelector('[data-t="g11.tangent"]'); return !/\p{Extended_Pictographic}/u.test(e.innerText) && !!e.querySelector('img.wr-icon'); }), 'its hub card shows the painted lantern icon, not an emoji');
      await p.locator('[data-t="g11.tangent"]').scrollIntoViewIfNeeded(); await p.screenshot({ path: OUT + 'tangent_05_hub_grade11.png' });
    }
    ok(!errors.length, `${w}px: no page errors ${errors.slice(0, 2)}`);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall Lantern Tangent Trail checks passed');
})();
