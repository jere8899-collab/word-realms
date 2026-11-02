// 🪁 Kite-Festival Spread: MOE Sec 4 statistics (quartiles and the IQR of a list, reading box-and-whisker plots, the quarters
// of the data a box plot shows, the median / quartiles / IQR / "how many more than" off a cumulative frequency curve, standard
// deviation of a list and of a frequency table, and comparing two box plots for average and consistency). Node checks read
// every box plot and curve back from the drawn SVG against its number line, so each value sits on the scale where the answer
// says, and every answer is worked out again here from the drawing or the printed data with its own quartile / σ code.
// Every option has a why / why-not note and typed slips get one too. Then a phone flow at 375 and 320 px that shows the notes.
// Run: node tools/test/spread.js (game served on :18642). Screenshots: screenshots/spread_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const ID = 'g10.spread';

/* ---------- 1. generators (Node) ---------- */
const t = M.topic(ID);
ok(t && t.grade === 10 && t.name === 'Kite-Festival Spread' && t.icon === '🪁', `🪁 Kite-Festival Spread is a Grade 10 (Sec 4) topic (${t && t.desc})`);
ok(M.TOPICS.length >= 117, `it is one of ${M.TOPICS.length} maths topics (117 when it was added)`);
{ const g = M.gradeTopics(10).map(x => x.id), i = g.indexOf(ID); ok(g[i - 1] === 'g10.freq' && g[g.length - 1] === 'g10.story', 'it sits right after Frequency Fair (statistics): ' + g.join(' ')); }
// the shared stats kit (clean-up): one sum / sorted copy / median / frequency totals for every stats topic
{ const U = M.util; ok(U.sum([1, 2, 3]) === 6 && U.median([5, 1, 3]) === 3 && U.median([4, 1, 3, 2]) === 2.5 && U.asc([3, 1, 2]).join() === '1,2,3' && JSON.stringify(U.freqTotals([1, 2], [3, 4])) === '{"N":7,"S":11,"S2":19}', 'the shared stats kit (sum, asc, median, freqTotals) works');
  const src = require('fs').readFileSync(ROOT + '/js/math-topics-m.js', 'utf8') + require('fs').readFileSync(ROOT + '/js/math-topics-h.js', 'utf8');
  ok(!/reduce\(\(a, b\) => a \+ b, 0\)/.test(src) && !/n % 2 \? sorted\[/.test(src), 'no stats topic keeps its own copy of the sum / median code'); }
const attr = (tag, a) => { const m = tag.match(new RegExp(`\\b${a}="([^"]*)"`)); return m ? m[1] : null; };
const ticks = svg => [...svg.matchAll(/<text class="xt"[^>]*>/g)].map(m => [+attr(m[0], 'data-v'), +attr(m[0], 'x')]);
// a px → value map from the labelled ticks (and a check that the ticks are evenly spaced, i.e. the scale is linear)
const scaleOf = svg => { const T = ticks(svg), [a, b] = [T[0], T[T.length - 1]], k = (b[0] - a[0]) / (b[1] - a[1]);
  const lin = T.every(([v, x]) => Math.abs(a[0] + (x - a[1]) * k - v) < Math.abs(k) * .2); return { v: x => a[0] + (x - a[1]) * k, lin, n: T.length, k }; };
const readBoxes = svg => { const S = scaleOf(svg); return { S, plots: [...svg.matchAll(/<g class="bplot" data-n="([^"]*)">([\s\S]*?)<\/g>/g)].map(m => { const g = m[2], tag = c => (g.match(new RegExp(`<[a-z]+ class="${c}"[^>]*>`)) || [''])[0];
  const wl = tag('bwl'), wr = tag('bwr'), bx = tag('bbox'), md = tag('bmed'), x0 = +attr(bx, 'x');
  return { name: m[1], five: [+attr(wl, 'x1'), +attr(wl, 'x2'), +attr(md, 'x1'), x0 + +attr(bx, 'width'), +attr(wr, 'x2')].map(S.v) }; }) }; };
const near = (a, b, e = .3) => Math.abs(a - b) <= e;
// independent re-computation: quartiles (halves leave out the middle value when n is odd), σ with n
const med = s => { const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const quarts = xs => { const s = xs.slice().sort((a, b) => a - b), h = Math.floor(s.length / 2); return [med(s.slice(0, h)), med(s), med(s.slice(s.length - h))]; };
const sigma = (xs, fs = xs.map(() => 1)) => { const N = fs.reduce((a, b) => a + b), m = xs.reduce((a, x, i) => a + x * fs[i], 0) / N; return Math.sqrt(xs.reduce((a, x, i) => a + fs[i] * (x - m) ** 2, 0) / N); };
const kinds = {}, bad = [], wrong = [], scale = [], notes = [], N = 9000;
for (let s = 1; s <= N; s++) {
  const q = M.make(ID, s * 2654435761 >>> 0), d = q.data, js = JSON.stringify(q), key = d.spread + '/' + d.k;
  kinds[key] = (kinds[key] || 0) + 1;
  if (/NaN|Infinity|undefined|\[object/.test(js) || !M.check(q, q.a).ok || !q.hint || !q.steps.length || !/^[A-Z]/.test(q.q)) bad.push(q.q);
  if (/\p{Extended_Pictographic}/u.test(q.q + q.steps.join('') + q.hint + JSON.stringify(q.why || q.slips || ''))) bad.push('emoji in text');
  if (q.steps.some(x => /[\t\f\v]/.test(x))) bad.push('control character in steps (a lost backslash)');
  if (q.kind === 'mcq') {
    if (q.options.length !== 4 || new Set(q.options).size !== 4 || q.options.filter(o => o === q.a).length !== 1) bad.push('options ' + key);
    if (!q.why || q.options.some(o => !q.why[o] || q.why[o].length < 20 || M.whyNote(q, o) !== q.why[o])) notes.push('mcq note missing');
    if (new Set(q.options.map(o => q.why[o])).size !== 4) notes.push('two options share a note');
  } else {
    if (!q.slips || q.slips.length < 2) notes.push('typed question with fewer than 2 slips: ' + key);
    else { if (q.slips.some(([v, txt]) => M.check(q, String(v)).ok || !txt || txt.length < 20 || M.whyNote(q, String(v)) !== txt)) notes.push('slip is right or has no note ' + key);
      if (M.whyNote(q, q.a)) notes.push('the right answer got a why-not note'); }
  }
  if (d.spread === 'list') { const xs = q.q.match(/: ([\d, ]+)\. Find/)[1].split(', ').map(Number), [a, , c] = quarts(xs), want = { q1: a, q3: c, iqr: c - a }[d.k];
    if (xs.length !== d.xs.length || want !== q.val) wrong.push(`list ${d.k}: own quartiles give ${want}, answer ${q.val}`); }
  if (d.spread === 'sd' || d.spread === 'sdfreq') { let want;
    if (d.spread === 'sd') want = sigma(q.q.match(/: ([\d, ]+)\. Find/)[1].split(', ').map(Number));
    else { const rows = [...q.pic.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(m => [...m[1].matchAll(/<t[hd]>([^<]*)<\/t[hd]>/g)].map(x => x[1]).slice(1).map(Number)); want = sigma(rows[0], rows[1]); }
    if (Math.abs(want - q.val) > .005001 || q.a !== want.toFixed(2)) wrong.push(`σ is ${want}, answer ${q.a}`);
    if (!/σ|sigma/.test(q.steps.join(' '))) notes.push('σ steps'); }
  if (/^box|compare/.test(d.spread)) { const B = readBoxes(q.pic), fives = d.spread === 'compare' ? [d.A, d.B] : [d.five];
    if (!B.S.lin || B.S.n < 6) scale.push('box plot number line is not even');
    if (B.plots.length !== fives.length) { scale.push('wrong number of box plots'); continue; }
    B.plots.forEach((p, i) => { if (!p.five.every((v, j) => near(v, fives[i][j]))) scale.push(`${key}: plot drawn at ${p.five.map(v => v.toFixed(1))}, data ${fives[i]}`);
      if (!p.five.every((v, j) => j === 0 || v > p.five[j - 1])) scale.push('five numbers out of order'); });
    const F = B.plots.map(p => p.five.map(v => Math.round(v * 10) / 10));
    if (d.spread === 'boxread') { const f = F[0], want = { med: f[2], iqr: f[3] - f[1], range: f[4] - f[0] }[d.k]; if (!near(want, q.val, 1e-6)) wrong.push(`boxread ${d.k}: drawing gives ${want}, answer ${q.val}`); }
    if (d.spread === 'boxpct') { const f = F[0], m = q.q.match(/of (more than|less than|between) ([\d.]+) \w+(?: and ([\d.]+) \w+)?\?/), lo = m[1] === 'less than' ? f[0] : +m[2], hi = m[1] === 'more than' ? f[4] : m[1] === 'between' ? +m[3] : +m[2];
      const parts = [0, 1, 2, 3].filter(i => f[i] >= lo - 1e-9 && f[i + 1] <= hi + 1e-9).length, n = +q.q.match(/There were (\d+)/)[1];
      if (!parts || n * parts / 4 !== q.val) wrong.push(`boxpct: ${parts} quarters of ${n} is not ${q.val}`); }
    if (d.spread === 'compare') { const [A, Bf] = F, [nA, nB] = [B.plots[0].name, B.plots[1].name], hi = A[2] > Bf[2] ? nA : nB, con = A[3] - A[1] < Bf[3] - Bf[1] ? nA : nB;
      if (!q.a.startsWith(hi + ' had the higher median') || !q.a.includes(`and ${con} had more consistent`)) wrong.push('compare: the drawing says ' + hi + ' / ' + con + ' but the answer is ' + q.a);
      if (Math.abs(A[2] - Bf[2]) < 1 || Math.abs((A[3] - A[1]) - (Bf[3] - Bf[1])) < 1) scale.push('compare plots too close to tell apart');
      if (!/higher median/.test(q.why[q.a]) && !/median/.test(q.why[q.a])) notes.push('compare right note'); } }
  if (d.spread.startsWith('cf')) { const S = scaleOf(q.pic), pts = [...q.pic.matchAll(/<circle class="cfpt"[^>]*>/g)].map(m => ({ x: +attr(m[0], 'data-x'), y: +attr(m[0], 'data-y'), cx: +attr(m[0], 'cx'), cy: +attr(m[0], 'cy') })), n = d.n;
    if (!S.lin || pts.length !== 7) { scale.push('cf axis / points'); continue; }
    if (pts[0].y !== 0 || pts[6].y !== n || !pts.every((p, i) => !i || (p.y > pts[i - 1].y && p.cx > pts[i - 1].cx && p.cy < pts[i - 1].cy))) scale.push('cumulative frequencies do not rise from 0 to n');
    if (!pts.every(p => near(S.v(p.cx), p.x, .05))) scale.push('a point is not above its value on the axis');
    const ky = (pts[6].cy - pts[0].cy) / n; if (!pts.every(p => near(pts[0].cy + p.y * ky, p.cy, .11))) scale.push('the cf axis is not to scale');
    const path = (q.pic.match(/class="cfcurve" d="([^"]+)"/) || [])[1] || '', nums = path.match(/-?[\d.]+/g).map(Number), segs = [];
    for (let i = 2; i + 5 < nums.length; i += 6) segs.push([[nums[i - 2], nums[i - 1]], [nums[i], nums[i + 1]], [nums[i + 2], nums[i + 3]], [nums[i + 4], nums[i + 5]]]);
    if (segs.length !== 6 || !segs.every((g, i) => near(g[0][0], pts[i].cx, .01) && near(g[3][1], pts[i + 1].cy, .01))) scale.push('the curve does not pass through the points');
    let prev = Infinity; for (const g of segs) for (let u = 0; u <= 1.0001; u += .05) { const y = (1 - u) ** 3 * g[0][1] + 3 * (1 - u) ** 2 * u * g[1][1] + 3 * (1 - u) * u * u * g[2][1] + u ** 3 * g[3][1]; if (y > prev + .15) { scale.push('the curve goes down somewhere'); break; } prev = y; }
    const at = c => (pts.find(p => p.y === c) || {}).x;
    let want; if (d.spread === 'cfmed') want = at({ med: n / 2, q1: n / 4, q3: 3 * n / 4 }[d.k]); else if (d.spread === 'cfiqr') want = at(3 * n / 4) - at(n / 4);
    else { const v = +q.q.match(/(?:more than|at most) (\d+)/)[1], p = pts.find(p => p.x === v); want = d.k === 'more' ? n - p.y : p.y; }
    if (want !== q.val) wrong.push(`${key}: the curve gives ${want}, answer ${q.val}`);
    if (!q.q.includes(`(${n} `)) bad.push('n not stated'); }
}
ok(!bad.length, `${N.toLocaleString()} Kite-Festival Spread questions pass the checker, start with a capital, have a hint and worked steps, no emoji, and multiple choice has 4 different options ${bad.slice(0, 3)}`);
ok(!notes.length, `every option has its own why / why-not note and typed questions name at least two usual slips ${[...new Set(notes)].slice(0, 3)}`);
ok(!wrong.length, `every answer is worked out again from the drawing or the printed data (own quartile and σ code) ${[...new Set(wrong)].slice(0, 4)}`);
ok(!scale.length, `every box plot and curve is true to its number line: even ticks, five numbers where the data says, curve rising through its points ${[...new Set(scale)].slice(0, 4)}`);
const NEED = ['list/q1', 'list/q3', 'list/iqr', 'boxread/med', 'boxread/iqr', 'boxread/range', 'cfmed/med', 'cfmed/q1', 'cfmed/q3', 'cfiqr/iqr', 'cfmore/more', 'cfmore/atmost', 'sd/list', 'sdfreq/freq', 'compare/plain', 'compare/trap'];
ok(NEED.every(k => kinds[k] > 100) && Object.keys(kinds).filter(k => k.startsWith('boxpct')).length === 7, 'all 9 question types and their variants appear: ' + JSON.stringify(kinds));
{ const qs = Array.from({ length: 3000 }, (_, s) => M.make(ID, s + 1)), by = k => qs.filter(q => q.data.spread === k);
  ok(by('list').filter(q => q.data.k === 'iqr').every(q => q.slips.some(s => /range \(largest/.test(s[1]))), 'IQR-of-a-list questions name the "that is the range" slip');
  ok(by('list').every(q => q.slips.some(s => /Sort the values first/.test(s[1])) || quarts(q.data.xs).join() === quarts(q.data.xs.slice()).join()), 'list questions name the "forgot to sort" slip');
  ok(by('list').filter(q => q.data.n % 2).some(q => q.slips.some(s => /leave the median out/.test(s[1]))), 'odd-length lists name the "kept the middle value in the halves" slip');
  { const S = by('sd').concat(by('sdfreq')), has = (q, re) => q.slips.some(s => re.test(s[1])), both = S.filter(q => has(q, /variance/) && has(q, /n − 1|Σf − 1/)).length;
  ok(S.every(q => has(q, /variance/) || has(q, /n − 1|Σf − 1/)) && both / S.length > .95, `σ questions name the "variance, not rooted" and "divided by n − 1" slips (both in ${both} of ${S.length}; the rest only when the two land on the same 2 d.p. value)`); }
  ok(by('cfmore').filter(q => q.data.k === 'more' && 2 * q.val !== q.data.n).every(q => q.slips.some(s => s[0] === q.data.n - q.val)), '"more than" curve questions name the "read the curve but forgot to subtract from n" slip');
  ok(by('cfmed').every(q => q.slips.some(s => /cumulative frequency \(how many/.test(s[1])) || q.steps[0].endsWith(' = ' + q.val)), 'curve questions name the "gave the cumulative frequency, not the value" slip');
  ok(by('compare').filter(q => q.data.k === 'trap').every(q => Object.values(q.why).some(w => /range can be stretched/.test(w))), 'when the more consistent group has the wider range, the note explains why the IQR, not the range, shows consistency');
  ok(qs.every(q => !/minister|politic|election|war\b|kill|blood|weapon|gun|knife|money|salary|income|bet\b|gambl/i.test(q.q)), 'kid / teen themes only');
  ok(qs.every(q => q.uid && /^spread\|/.test(q.uid)) && qs.filter(q => !/^(list|sd)$/.test(q.data.spread)).every(q => q.pic), 'every question has a uid (anti-farm), and every plot / curve / table question has its picture'); }
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
    const list = [seed(q => D(q).spread === 'cfmed' && D(q).k === 'med' && D(q).ctx === 'kite'), seed(q => D(q).spread === 'compare' && D(q).k === 'trap'), seed(q => D(q).spread === 'boxread' && D(q).k === 'iqr'), seed(q => D(q).spread === 'sdfreq'),
      seed(q => D(q).spread === 'boxpct'), seed(q => D(q).spread === 'list' && D(q).k === 'iqr'), seed(q => D(q).spread === 'cfmore' && D(q).k === 'more'), seed(q => D(q).spread === 'sd'), seed(q => D(q).spread === 'cfiqr')];
    ok(list.every(Number.isInteger), `${w}px: a seed was found for every kind of question`);
    await p.evaluate(l => WR.Math.startLesson({ topic: 'g10.spread', items: l.map(s => MathGen.make('g10.spread', s)) }), list);
    await p.waitForTimeout(500);
    for (let i = 0; i < list.length; i++) {
      const q = await p.evaluate(() => WR.Math._dbg()), tag = `${w}px ${q.data.spread}/${q.data.k}`;
      ok(await fits(p), `${tag}: the picture and the choices fit the screen with no sideways scroll`);
      const taps = await p.evaluate(() => Math.min(...[...document.querySelectorAll('.mopts .opt, #mcheck, .numpad button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().height)));
      ok(taps >= 40, `${tag}: answer buttons are easy to tap (${Math.round(taps)} px)`);
      if (/^(cf|box|compare)/.test(q.data.spread)) ok(await p.locator('.qcard svg.spread').count() === 1 && await p.locator('.qcard svg .xt').count() >= 6, `${tag}: the plot is drawn on a labelled number line`);
      if (q.data.spread === 'sdfreq') ok(await p.locator('.qcard .mtable').count() === 1, `${tag}: the frequency table is shown`);
      if (w === 375 && i === 0) await p.locator('.qcard').screenshot({ path: OUT + 'spread_01_cf_median_question.png' });
      if (i < 4) {
        if (q.kind === 'mcq') { const wk = q.options.findIndex(o => o !== q.a); await p.locator(`.mopts .opt[data-k="${wk}"]`).click(); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.why[q.options[wk]].slice(0, 30))), `${tag}: a wrong pick shows its own why-not note`);
          await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); await p.waitForTimeout(300);
          ok((await whyText(p)).some(x => x.includes(q.why[q.a].slice(0, 30))), `${tag}: the right answer shows why it works, in other words`);
          if (w === 375 && i === 1) await p.locator('.qcard').screenshot({ path: OUT + 'spread_03_compare_boxplots_why.png' });
        } else { await p.fill('#mans', String(q.slips[0][0])); await p.click('#mcheck'); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.slips[0][1].slice(0, 30))), `${tag}: typing the usual slip (${q.slips[0][0]}) shows its why-not note`);
          if (w === 375 && i === 0) await p.locator('.qcard').screenshot({ path: OUT + 'spread_02_cf_slip_note.png' });
          await p.fill('#mans', q.a); await p.click('#mcheck'); await p.waitForTimeout(300); }
      } else {
        if (q.kind === 'mcq') await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); else { await p.fill('#mans', q.a); await p.click('#mcheck'); }
        await p.waitForTimeout(300);
      }
      ok(await p.evaluate(() => /correct|got it/i.test(document.querySelector('.qcard').innerText)), `${tag}: the right answer is marked right`);
      if (w === 375 && i === 2) await p.locator('.qcard').screenshot({ path: OUT + 'spread_04_boxplot_worked.png' });
      if (i < list.length - 1) { await p.click('#mnext'); await p.waitForTimeout(300); }
    }
    const m = await p.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).math);
    ok(m && m.correct >= list.length && m.answered >= list.length, `${w}px: answers are saved in wordRealms.save.v1 (math.correct ${m && m.correct}, answered ${m && m.answered})`);
    if (w === 375) {
      const st = await p.evaluate(s => { const q = MathGen.make('g10.spread', s), k = q.uid || 'g10.spread|' + q.q; const a = WR.awardStars('m', k + '|t', 1), b = WR.awardStars('m', k + '|t', 1); return [a, b]; }, list[1]).catch(() => null);
      ok(st && st[0] >= 1 && st[1] < st[0], `a replayed question pays less than the first time (${st})`);
      await p.evaluate(() => WR.go('math')); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '10'); b && b.click(); }); await p.waitForTimeout(400);
      ok(await p.locator('[data-t="g10.spread"]').count() === 1, 'the Grade 10 hub lists Kite-Festival Spread');
      ok(await p.evaluate(() => { const e = document.querySelector('[data-t="g10.spread"]'); return !/\p{Extended_Pictographic}/u.test(e.innerText) && !!e.querySelector('img.wr-icon'); }), 'its hub card shows the painted kite icon, not an emoji');
      await p.locator('[data-t="g10.spread"]').scrollIntoViewIfNeeded(); await p.screenshot({ path: OUT + 'spread_05_hub_grade10.png' });
    }
    ok(!errors.length, `${w}px: no page errors ${errors.slice(0, 2)}`);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall Kite-Festival Spread checks passed');
})();
