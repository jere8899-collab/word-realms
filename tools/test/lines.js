// 🚇 Train-Track Lines: MOE P3 right angles, perpendicular and parallel lines on squared paper. Node checks re-read every
// line and shape from the SVG and work the answer out again (dot / cross products), then a phone flow at 375 and 320 px.
// Run: node tools/test/lines.js (game served on :18642). Screenshots: screenshots/lines_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const ID = 'g3.lines';

/* ---------- 1. generators (Node) ---------- */
const t = M.topic(ID);
ok(t && t.grade === 3 && t.name === 'Train-Track Lines', `🚇 Train-Track Lines is a Grade 3 topic (${t && t.desc})`);
ok(M.TOPICS.length >= 112, `it is one of ${M.TOPICS.length} maths topics (112 when it was added)`);
{ const g = M.gradeTopics(3).map(x => x.id); ok(g.indexOf(ID) === g.indexOf('g3.perim') + 1 && g[g.length - 2] === 'g3.bargraph' && g[g.length - 1] === 'g3.story', 'it sits after Fence the Garden, before the bar graphs and word problems'); }
// read back from the SVG: grid units are (px − pad) / S
const S = 16, PAD = 12, U = v => (v - PAD) / S;
const segsOf = svg => [...svg.matchAll(/class="rl" x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/g)].map(m => [[U(+m[1]), U(+m[2])], [U(+m[3]), U(+m[4])]]);
const polyOf = svg => { const m = svg.match(/class="rpoly" points="([^"]+)"/); return m ? m[1].split(' ').map(p => p.split(',').map(v => U(+v))) : null; };
const sideOf = svg => { const m = svg.match(/class="rside" x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/); return m && [[U(+m[1]), U(+m[2])], [U(+m[3]), U(+m[4])]]; };
const labels = svg => [...svg.matchAll(/class="rlab"[^>]*>([A-F])</g)].map(m => m[1]);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
// an independent angle method: the angle between two directions in degrees (no dot/cross shortcuts)
const ang = (d, e) => { let a = Math.abs(Math.atan2(d[1], d[0]) - Math.atan2(e[1], e[0])) * 180 / Math.PI; a = a % 180; return Math.min(a, 180 - a); };
const kindOf = (d, e) => { const a = ang(d, e); return a < 1e-6 ? 'Parallel' : Math.abs(a - 90) < 1e-6 ? 'Perpendicular' : 'Neither'; };
const inPaper = segs => segs.every(s => s.every(([x, y]) => x >= 0 && x <= 8 && y >= 0 && y <= 6 && Number.isInteger(x) && Number.isInteger(y)));
const kinds = {}, bad = [], wrong = [], seenRight = {};
for (let s = 1; s <= 6000; s++) {
  const q = M.make(ID, s * 2654435761 >>> 0), d = q.data, js = JSON.stringify(q);
  kinds[d.lines] = (kinds[d.lines] || 0) + 1;
  if (/NaN|Infinity|undefined|\[object/.test(js) || !M.check(q, q.a).ok || !q.hint || !q.steps.length || /^[a-z]/.test(q.q)) bad.push(q.q);
  if (d.lines === 'which' || d.lines === 'pick') for (const svg of d.lines === 'which' ? [q.pic] : Object.values(q.optPics || {})) { const sg = segsOf(svg), a = ang(sub(sg[0][1], sg[0][0]), sub(sg[1][1], sg[1][0]));
    if (a > 1e-6 && Math.abs(a - 90) > 1e-6 && (a < 25 || a > 65)) wrong.push('slanted lines too close to parallel or square: ' + a.toFixed(1));
  }
  if (d.lines === 'which') { const sg = segsOf(q.pic); if (sg.length !== 2 || !inPaper(sg)) bad.push('which segs'); else if (kindOf(sub(sg[0][1], sg[0][0]), sub(sg[1][1], sg[1][0])) !== q.a) wrong.push('which ' + q.a); }
  if (d.lines === 'pick') {
    if (!q.optPics || q.options.some(o => !q.optPics[o]) || q.options.length !== 3) { bad.push('optPics'); continue; }
    const want = d.want === 'parallel' ? 'Parallel' : 'Perpendicular';
    q.options.forEach(o => { const sg = segsOf(q.optPics[o]); if (sg.length !== 2 || !inPaper(sg)) bad.push('pick segs'); else if ((kindOf(sub(sg[0][1], sg[0][0]), sub(sg[1][1], sg[1][0])) === want) !== (o === q.a)) wrong.push('pick ' + o); });
    if (/f\d/.test(q.q)) wrong.push('option id in text');
  }
  if (d.lines === 'side') {
    const P = polyOf(q.pic), side = sideOf(q.pic), L = labels(q.pic), n = P.length, nm = i => L[i] + L[(i + 1) % n];
    if (L.join('') !== 'ABCDEF'.slice(0, n)) bad.push('labels');
    const si = P.findIndex((p, i) => { const r = P[(i + 1) % n]; return p[0] === side[0][0] && p[1] === side[0][1] && r[0] === side[1][0] && r[1] === side[1][1]; });
    if (!q.q.includes('side ' + nm(si))) wrong.push('pink side is not the named side');
    const dirOf = name => { const i = L.indexOf(name[0]); return sub(P[(i + 1) % n], P[i]); };
    const want = d.want === 'parallel' ? 'Parallel' : 'Perpendicular';
    q.options.forEach(o => { if ((kindOf(dirOf(o), sub(side[1], side[0])) === want) !== (o === q.a)) wrong.push('side ' + o + ' ' + want); });
    if (q.options.length < 3) bad.push('side options');
  }
  if (d.lines === 'right') { const P = polyOf(q.pic), n = P.length;
    // the angle at each corner from atan2; if the angles don't add up to (n − 2) × 180° we measured outside, so flip them
    let A = P.map((v, i) => { const u = P[(i + n - 1) % n], w = P[(i + 1) % n], a = (Math.atan2(u[1] - v[1], u[0] - v[0]) - Math.atan2(w[1] - v[1], w[0] - v[0])) * 180 / Math.PI; return ((a % 360) + 360) % 360; });
    if (Math.abs(A.reduce((x, y) => x + y, 0) - (n - 2) * 180) > 1e-6) A = A.map(a => 360 - a);
    const c = A.filter(a => Math.abs(a - 90) < 1e-6).length; if (c !== q.val || Math.abs(A.reduce((x, y) => x + y, 0) - (n - 2) * 180) > 1e-6) wrong.push('right ' + q.val + ' vs ' + c); seenRight[q.val] = 1; }
  if (d.lines === 'angle') { const sg = segsOf(q.pic), a = ang(sub(sg[0][1], sg[0][0]), sub(sg[1][1], sg[1][0])), dt = (sg[0][1][0] - sg[0][0][0]) * (sg[1][1][0] - sg[1][0][0]) + (sg[0][1][1] - sg[0][0][1]) * (sg[1][1][1] - sg[1][0][1]);
    const full = Math.acos(dt / Math.hypot(...sub(sg[0][1], sg[0][0])) / Math.hypot(...sub(sg[1][1], sg[1][0]))) * 180 / Math.PI;
    const exp = Math.abs(full - 90) < 1e-6 ? 'A right angle' : full < 90 ? 'Smaller than a right angle' : 'Bigger than a right angle';
    if (exp !== q.a || (exp !== 'A right angle' && !(full >= 25 && full <= 65 || full >= 115 && full <= 155))) wrong.push('angle too near a right angle or a straight line ' + full.toFixed(1));
    if (exp !== q.a || full < 1 || full > 179 || sg[0][0].join() !== sg[1][0].join()) wrong.push('angle ' + q.a + ' ' + full.toFixed(1)); }
}
ok(!bad.length, `6,000 Train-Track Lines questions pass the checker, start with a capital letter, have a hint and a worked solution, and every dot sits on the squared paper ${bad.slice(0, 3)}`);
ok(!wrong.length, `every answer is worked out again from the drawn lines (angles from atan2, not the generator's dot/cross test) ${[...new Set(wrong)].slice(0, 4)}`);
ok(['which', 'pick', 'side', 'right', 'angle'].every(k => kinds[k] > 500), 'all five kinds of question appear: ' + JSON.stringify(kinds));
{ const qs = Array.from({ length: 3000 }, (_, s) => M.make(ID, s + 1)), by = k => qs.filter(q => q.data.lines === k);
  ok(['Parallel', 'Perpendicular', 'Neither'].every(a => by('which').filter(q => q.a === a).length > 100), 'parallel, perpendicular and neither are all common answers');
  ok(['A right angle', 'Smaller than a right angle', 'Bigger than a right angle'].every(a => by('angle').filter(q => q.a === a).length > 80), 'right, smaller and bigger angles are all common answers');
  ok(['parallel', 'perpendicular'].every(w => by('pick').some(q => q.data.want === w) && by('side').some(q => q.data.want === w)), 'picture and side questions ask about both parallel and perpendicular');
  ok(Object.keys(seenRight).length >= 5, 'right-angle counts vary (' + Object.keys(seenRight).sort().join(', ') + ')');
  ok(by('which').filter(q => q.a === 'Parallel').every(q => { const [a, b] = segsOf(q.pic), d = sub(a[1], a[0]), x = sub(b[0], a[0]); return Math.abs(d[0] * x[1] - d[1] * x[0]) / Math.hypot(...d) >= 1 - 1e-9; }), 'parallel lines are never on one line and always at least a square apart');
  ok(by('side').concat(by('right')).every(q => { const P = polyOf(q.pic); return P.every(([x, y]) => x >= 0 && x <= 8 && y >= 0 && y <= 6); }) && /pad: 12/.test(require('fs').readFileSync(ROOT + '/js/math-topics-p.js', 'utf8')), 'shapes stay on the paper with room round the edge for the corner letters');
  ok(qs.every(q => !/minister|politic|election/i.test(q.q)), 'kid themes only'); }
ok([1, 2, 3, 99].every(s => { const r = M.batch(ID, 8, s); return r.length === 8 && new Set(r.map(q => q.uid || q.q + q.a)).size === 8; }), 'a lesson of 8 has no repeated picture');

/* ---------- 2. phone ---------- */
const SAVE = { v: 1, name: 'Jeremy', avatar: 'avatar_mage', startLevel: 'a1', stars: 100, totalCorrect: 40, totalAnswered: 50,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 420, happiness: 82, hunger: 35, skin: null, lastTick: Date.now() }, streak: { count: 4, last: null }, progress: {},
  owned: [], equipped: { outfit: null, petskin: null, theme: null }, settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 5 };
const seed = pred => { for (let s = 1; s < 5000; s++) if (pred(M.make(ID, s))) return s; };
const fits = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && [...document.querySelectorAll('.qcard .mpic, .mopts .opt')].every(e => { const r = e.getBoundingClientRect(); return r.right <= innerWidth + 1 && r.left >= -1; }));
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const [w, h] of [[375, 667], [320, 658]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); const errors = [];
    p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/font|ERR_|net::|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    await p.goto(URL); await p.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE);
    await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(400);
    const list0 = [seed(q => q.data.lines === 'pick' && q.data.want === 'perpendicular'), seed(q => q.data.lines === 'which' && q.a === 'Parallel'), seed(q => q.data.lines === 'side' && q.data.want === 'parallel'), seed(q => q.data.lines === 'right' && q.data.pts.length === 6), seed(q => q.data.lines === 'angle' && q.a !== 'A right angle'), seed(q => q.data.lines === 'side' && q.data.want === 'perpendicular')], list = list0;
    ok(list.every(Number.isInteger), `${w}px: a seed was found for every kind of question`);
    await p.evaluate(l => WR.Math.startLesson({ topic: 'g3.lines', items: l.map(s => MathGen.make('g3.lines', s)) }), list);
    await p.waitForTimeout(400);
    for (let i = 0; i < list.length; i++) {
      const q = await p.evaluate(() => WR.Math._dbg()), tag = `${w}px ${q.data.lines}`;
      ok(await fits(p), `${tag}: the squared paper and the choices fit the screen with no sideways scroll`);
      const taps = await p.evaluate(() => Math.min(...[...document.querySelectorAll('.mopts .opt, #mcheck')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().height)));
      ok(taps >= 40, `${tag}: answer buttons are easy to tap (${Math.round(taps)} px)`);
      if (q.optPics) { const n = await p.locator('.mopts .opt.mpicopt svg.rlpic').count(); ok(n === q.options.length, `${tag}: ${n} picture choices are drawn`); }
      if (w === 375 && i < 5) await p.locator('.qcard').screenshot({ path: OUT + `lines_0${i + 1}_${q.data.lines}.png` });
      if (w === 375 && i === 0) { // two wrong picks: the right picture lights up and the answer is shown as a picture
        const wr = q.options.map((o, k) => o === q.a ? -1 : k).filter(k => k >= 0);
        await p.locator(`.mopts .opt[data-k="${wr[0]}"]`).click(); await p.waitForTimeout(250); await p.locator(`.mopts .opt[data-k="${wr[1]}"]`).click(); await p.waitForTimeout(300);
        ok(await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"].right`).count() === 1, `${tag}: after two misses the right picture is marked`);
        ok(await p.locator('#mexplain .mansPic svg.rlpic').count() === 1 && !(await p.locator('#mexplain').innerText()).includes(q.a), `${tag}: the answer is shown as a picture, never as its id`);
        await p.locator('.qcard').screenshot({ path: OUT + 'lines_06_answer_shown.png' });
      } else {
        if (q.kind === 'mcq') await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); else { await p.fill('#mans', q.a); await p.click('#mcheck'); }
        await p.waitForTimeout(300);
        ok(await p.evaluate(() => /correct|got it/i.test(document.querySelector('.qcard').innerText)), `${tag}: the right answer is marked right`);
      }
      if (i < list.length - 1) { await p.click('#mnext'); await p.waitForTimeout(300); }
    }
    const m = await p.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).math);
    ok(m && m.correct >= list.length - 1 && m.answered >= list.length, `${w}px: answers are saved in wordRealms.save.v1 (math.correct ${m && m.correct}, answered ${m && m.answered})`);
    if (w === 375) {
      await p.evaluate(() => WR.go('math')); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '3'); b && b.click(); }); await p.waitForTimeout(400);
      ok(await p.locator('[data-t="g3.lines"]').count() === 1, 'the Grade 3 hub lists Train-Track Lines');
      ok(await p.evaluate(() => { const e = document.querySelector('[data-t="g3.lines"]'); return !/\p{Extended_Pictographic}/u.test(e.innerText) && !!e.querySelector('img.wr-icon, svg, .wr-icon'); }), 'its hub card shows a painted icon, not an emoji');
      await p.locator('[data-t="g3.lines"]').scrollIntoViewIfNeeded(); await p.screenshot({ path: OUT + 'lines_07_hub_grade3.png' });
    }
    ok(!errors.length, `${w}px: no page errors ${errors.slice(0, 2)}`);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall Train-Track Lines checks passed');
})();
