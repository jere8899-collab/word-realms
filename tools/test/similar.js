// 🗺️ Scale-Model Studio: MOE Sec 2 congruence and similarity (congruent triangles matched by the order of the letters, a
// side or an angle; similar triangles: scale factor either way, a missing side on either triangle, a missing angle; similar
// rectangles; scale drawings: map scales 1 : n both ways and scale models). Node checks read every length and angle back from
// the drawn SVG, check the shapes are true (similar / congruent as drawn, map line to scale) and work every answer out again;
// every option has a why / why-not note and typed slips get one too. Then a phone flow at 375 and 320 px that shows the notes.
// Run: node tools/test/similar.js (game served on :18642). Screenshots: screenshots/similar_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const ID = 'g8.similar';

/* ---------- 1. generators (Node) ---------- */
const t = M.topic(ID);
ok(t && t.grade === 8 && t.name === 'Scale-Model Studio' && t.icon.startsWith('🗺'), `🗺️ Scale-Model Studio is a Grade 8 (Sec 2) topic (${t && t.desc})`);
ok(M.TOPICS.length >= 115, `it is one of ${M.TOPICS.length} maths topics (115 when it was added)`);
{ const g = M.gradeTopics(8).map(x => x.id), i = g.indexOf(ID); ok(g[i - 1] === 'g8.pyth' && g[i + 1] === 'g8.gradient' && g[g.length - 1] === 'g8.story', "it sits after Pythagoras' Bridge (geometry), before Gradient Hills: " + g.join(' ')); }
const labs = svg => [...(svg || '').matchAll(/class="mlab" data-t="([^"]+)"/g)].map(m => m[1]);
const angLabs = svg => [...(svg || '').matchAll(/class="mang" data-t="([^"]+)"/g)].map(m => m[1]);
const polys = svg => [...(svg || '').matchAll(/<polygon points="([^"]+)"/g)].map(m => m[1].split(' ').map(p => p.split(',').map(Number)));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const sides = P => [dist(P[0], P[1]), dist(P[1], P[2]), dist(P[2], P[0])];
const angs = P => P.map((V, i) => { const A = P[(i + 1) % 3], B = P[(i + 2) % 3], a = Math.atan2(A[1] - V[1], A[0] - V[0]), b = Math.atan2(B[1] - V[1], B[0] - V[0]); let d = Math.abs(a - b) * 180 / Math.PI; return d > 180 ? 360 - d : d; });
const near = (a, b, rel = .03) => Math.abs(a - b) <= rel * Math.abs(b) + .15; // drawn points are rounded to 0.1 px
const sameShape = (P, Q) => { const s = sides(P), u = sides(Q), k = u[0] / s[0]; return s.every((v, i) => near(u[i] / v, k)); };
const frac = s => { const m = s.match(/\\frac\{(\d+)\}\{(\d+)\}/); return m ? m[1] / m[2] : +s.replace(/\$/g, ''); };
const kinds = {}, bad = [], wrong = [], scale = [], notes = [];
const N = 8000;
for (let s = 1; s <= N; s++) {
  const q = M.make(ID, s * 2654435761 >>> 0), d = q.data, js = JSON.stringify(q), key = d.sim + (d.k && typeof d.k === 'string' ? '/' + d.k : '');
  kinds[key] = (kinds[key] || 0) + 1;
  if (/NaN|Infinity|undefined|\[object/.test(js) || !M.check(q, q.a).ok || !q.hint || !q.steps.length || !/^[A-Z]/.test(q.q)) bad.push(q.q);
  if (/\p{Extended_Pictographic}/u.test(q.q + q.steps.join('') + q.hint + JSON.stringify(q.why || q.slips || ''))) bad.push('emoji in text');
  if (q.steps.some(x => /[\t\f\v]/.test(x))) bad.push('control character in steps (a lost backslash)');
  if (q.kind === 'mcq') {
    if (q.options.length !== 4 || new Set(q.options).size !== 4 || q.options.filter(o => o === q.a).length !== 1) bad.push('options ' + key + ' ' + q.options.join(' ; '));
    if (!q.why || q.options.some(o => !q.why[o] || q.why[o].length < 20 || M.whyNote(q, o) !== q.why[o])) notes.push('mcq note missing');
    const num = (q.a.match(/\d+(\.\d+)?/g) || []); if (!num.every(n => q.why[q.a].includes(n))) notes.push('right note does not give the answer ' + q.a);
    if (q.options.filter(o => o !== q.a).some(o => q.why[o] === q.why[q.a])) notes.push('a why-not note equals the right note');
  } else {
    if (!q.slips || q.slips.length < 2) notes.push('typed question with fewer than 2 slips: ' + key);
    else { if (q.slips.some(([v, txt]) => M.check(q, String(v)).ok || !txt || txt.length < 20 || M.whyNote(q, String(v)) !== txt)) notes.push('slip is right or has no note');
      if (M.whyNote(q, q.a)) notes.push('the right answer got a why-not note'); }
  }
  const L = labs(q.pic), P = polys(q.pic), cmv = x => +x.replace(' cm', '');
  if (d.sim === 'side' || d.sim === 'k') { const k = d.K[0] / d.K[1];
    if (!d.bg.every((v, i) => v === d.sm[i] * k) || d.sm.concat(d.bg).some(v => !Number.isInteger(v))) wrong.push('side lengths are not whole numbers scaled by k');
    if (P.length !== 2 || !sameShape(P[0], P[1]) || !(sides(P[1])[0] > sides(P[0])[0] * 1.2)) scale.push('PQR is not drawn as a bigger copy of ABC');
    if (!sides(P[0]).every((v, i) => near(v / d.sm[i], sides(P[0])[0] / d.sm[0]))) scale.push('ABC is not true to its side lengths');
    if ((k > 1.75) !== /Not drawn to scale/.test(q.pic)) scale.push('"not drawn to scale" note is wrong');
    if (d.sim === 'side') { const want = d.onBig ? d.sm[d.j] * k : d.sm[d.j], ls = L.filter(x => x !== 'x').map(cmv).sort((a, b) => a - b), exp = [d.sm[d.i], d.bg[d.i], d.onBig ? d.sm[d.j] : d.bg[d.j]].sort((a, b) => a - b);
      if (q.val !== want || L.filter(x => x === 'x').length !== 1 || ls.join() !== exp.join()) wrong.push('side ' + JSON.stringify(d) + ' ' + L);
      // the answer, worked from the labels: x = other side × (pair ratio) or ÷
      const r = d.bg[d.i] / d.sm[d.i]; if (Math.abs((d.onBig ? d.sm[d.j] * r : d.bg[d.j] / r) - q.val) > 1e-9) wrong.push('side answer from labels'); }
    else { const want = d.down ? d.sm[d.i] / d.bg[d.i] : d.bg[d.i] / d.sm[d.i]; if (Math.abs(frac(q.a) - want) > 1e-9 || L.length !== 4) wrong.push('scale factor ' + q.a + ' ' + L); }
  }
  if (d.sim === 'angle') { const [a, b, c] = d.A; if (a + b + c !== 180 || q.val !== d.A[d.pick] || q.val !== 180 - d.A[d.giv[0]] - d.A[d.giv[1]]) wrong.push('angle sum');
    const al = angLabs(q.pic); if (al.filter(x => x === 'x').length !== 1 || al.filter(x => x !== 'x').map(x => +x.replace('°', '')).sort().join() !== d.giv.map(g => d.A[g]).sort().join()) wrong.push('angle labels ' + al);
    if (!angs(P[0]).every((v, i) => Math.abs(v - d.A[i]) < 1.2) || !angs(P[1]).every((v, i) => Math.abs(v - d.A[i]) < 1.2)) scale.push('angles are not drawn true');
    if (!(sides(P[1])[0] > sides(P[0])[0] * 1.2)) scale.push('PQR not bigger'); }
  if (d.sim === 'cong') { if (P.length !== 2 || !sameShape(P[0], P[1]) || !near(sides(P[1])[0], sides(P[0])[0])) scale.push('congruent triangles are not the same size and shape');
    if (d.k === 'side') { if (cmv(q.a) !== d.s[d.j] || !sides(P[0]).every((v, i) => near(v / d.s[i], sides(P[0])[0] / d.s[0])) || L.filter(x => x !== 'x').map(cmv).join() !== d.s.join()) wrong.push('cong side');
      if (!sides(P[1]).every((v, i) => near(v, sides(P[0])[i]))) scale.push('PQR sides do not match ABC letter by letter'); }
    else { if (+q.a.replace('°', '') !== d.A[d.pick] || d.A.reduce((x, y) => x + y) !== 180) wrong.push('cong angle');
      if (!angs(P[1]).every((v, i) => Math.abs(v - d.A[i]) < 1.2)) scale.push('PQR angles do not match ABC letter by letter'); } }
  if (d.sim === 'rect') { const r0 = d.a / d.b, dims = o => o.match(/[\d.]+/g).map(Number);
    if (q.options.some(o => (Math.abs(dims(o)[0] / dims(o)[1] - r0) < 1e-9) !== (o === q.a))) wrong.push('rect: exactly the right option is similar ' + q.options);
    if (L.map(cmv).sort((a, b) => a - b).join() !== [d.a, d.b].join() || !near((P[0][0][1] - P[0][3][1]) / (P[0][1][0] - P[0][0][0]), r0)) scale.push('rect drawn to scale'); }
  if (d.sim === 'map') {
    if (d.k === 'toKm') { if (Math.abs(q.val - d.d * d.n / 1e5) > 1e-9) wrong.push('map toKm');
      const m = q.pic.match(/class="mroute" x1="([\d.]+)" y1="[\d.]+" x2="([\d.]+)"/); if (!m || !near(+m[2] - +m[1], 18 * d.d) || L.join() !== `${d.d} cm`) scale.push('map line not to scale'); }
    if (d.k === 'toCm' && (Math.abs(q.val - d.km * 1e5 / d.n) > 1e-9 || !Number.isInteger(q.val))) wrong.push('map toCm ' + q.val);
    if (d.k === 'model' && Math.abs(q.val - d.h * d.n / 100) > 1e-9) wrong.push('model');
  }
}
ok(!bad.length, `${N.toLocaleString()} Scale-Model Studio questions pass the checker, start with a capital, have a hint and worked steps, no emoji, and multiple choice has 4 different options ${bad.slice(0, 3)}`);
ok(!notes.length, `every option has a why / why-not note, the right one restates the answer, and typed questions name their usual slips ${[...new Set(notes)].slice(0, 3)}`);
ok(!wrong.length, `every answer is worked out again from the lengths and angles printed on the drawing ${[...new Set(wrong)].slice(0, 4)}`);
ok(!scale.length, `every figure is true: similar triangles drawn as the same shape (bigger), congruent ones the same size, true angles, map lines to scale ${[...new Set(scale)].slice(0, 4)}`);
ok(['side', 'k', 'angle', 'cong/side', 'cong/angle', 'rect', 'map/toKm', 'map/toCm', 'map/model'].every(k => kinds[k] > 200), 'all question types appear: ' + JSON.stringify(kinds));
{ const qs = Array.from({ length: 3000 }, (_, s) => M.make(ID, s + 1));
  ok(qs.filter(q => q.data.sim === 'side').every(q => q.slips.some(s => /same amount/.test(s[1]))), 'missing-side questions name the classic slip "added the same amount" with its why-not note');
  ok(qs.filter(q => q.data.sim === 'angle').every(q => q.slips.some(s => /Angles don't grow/.test(s[1]))), 'missing-angle questions name the "multiplied the angle by the scale factor" slip');
  ok(qs.filter(q => q.data.sim === 'cong' && q.data.k === 'side').every(q => q.options.filter(o => /Match the letters/.test(q.why[o])).length >= 2), 'congruent-side choices include the other sides, each saying which side it really matches');
  ok(qs.every(q => !/minister|politic|election|war\b|kill|blood|weapon/i.test(q.q)), 'kid themes only');
  ok(qs.filter(q => q.pic).every(q => q.uid && /^sim\|/.test(q.uid)), 'picture questions carry a uid (anti-farm)');
  ok(qs.filter(q => q.pic).length > 2200, 'most questions have a drawn pastel figure'); }
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
    const list = [seed(q => D(q).sim === 'side' && D(q).onBig && D(q).K[0] === 2), seed(q => D(q).sim === 'cong' && D(q).k === 'side' && D(q).flip), seed(q => D(q).sim === 'map' && D(q).k === 'toKm'), seed(q => D(q).sim === 'k' && !D(q).down),
      seed(q => D(q).sim === 'angle'), seed(q => D(q).sim === 'rect'), seed(q => D(q).sim === 'cong' && D(q).k === 'angle'), seed(q => D(q).sim === 'map' && D(q).k === 'model')];
    ok(list.every(Number.isInteger), `${w}px: a seed was found for every kind of question`);
    await p.evaluate(l => WR.Math.startLesson({ topic: 'g8.similar', items: l.map(s => MathGen.make('g8.similar', s)) }), list);
    await p.waitForTimeout(500);
    for (let i = 0; i < list.length; i++) {
      const q = await p.evaluate(() => WR.Math._dbg()), tag = `${w}px ${q.data.sim}${typeof q.data.k === 'string' ? '/' + q.data.k : ''}`;
      ok(await fits(p), `${tag}: the picture and the choices fit the screen with no sideways scroll`);
      const taps = await p.evaluate(() => Math.min(...[...document.querySelectorAll('.mopts .opt, #mcheck, .numpad button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().height)));
      ok(taps >= 40, `${tag}: answer buttons are easy to tap (${Math.round(taps)} px)`);
      if (q.pic) ok(await p.locator('.qcard svg .mvtx, .qcard svg .mlab').count() >= 1, `${tag}: the figure is drawn with its letters or lengths`);
      if (i < 4) { // a wrong answer first: its own why-not note; then the right one
        if (q.kind === 'mcq') { const wk = q.options.findIndex(o => o !== q.a); await p.locator(`.mopts .opt[data-k="${wk}"]`).click(); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.why[q.options[wk]].slice(0, 30))), `${tag}: a wrong pick shows its own why-not note`);
          if (w === 375 && i === 1) await p.locator('.qcard').screenshot({ path: OUT + 'similar_02_congruent_why_not.png' });
          await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); await p.waitForTimeout(300);
          ok((await whyText(p)).some(x => x.includes(q.why[q.a].slice(0, 30))), `${tag}: the right answer shows why it works, in other words`);
        } else { await p.fill('#mans', String(q.slips[0][0])); await p.click('#mcheck'); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.slips[0][1].slice(0, 30))), `${tag}: typing the usual slip (${q.slips[0][0]}) shows its why-not note`);
          if (w === 375 && i === 0) await p.locator('.qcard').screenshot({ path: OUT + 'similar_01_side_slip_note.png' });
          await p.fill('#mans', q.a); await p.click('#mcheck'); await p.waitForTimeout(300); }
      } else {
        if (w === 375 && i === 4) await p.locator('.qcard').screenshot({ path: OUT + 'similar_03_angle.png' });
        if (q.kind === 'mcq') await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); else { await p.fill('#mans', q.a); await p.click('#mcheck'); }
        await p.waitForTimeout(300);
      }
      ok(await p.evaluate(() => /correct|got it/i.test(document.querySelector('.qcard').innerText)), `${tag}: the right answer is marked right`);
      if (w === 375 && i === 2) await p.locator('.qcard').screenshot({ path: OUT + 'similar_04_map_answer.png' });
      if (i < list.length - 1) { await p.click('#mnext'); await p.waitForTimeout(300); }
    }
    const m = await p.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).math);
    ok(m && m.correct >= list.length && m.answered >= list.length, `${w}px: answers are saved in wordRealms.save.v1 (math.correct ${m && m.correct}, answered ${m && m.answered})`);
    if (w === 375) {
      const st = await p.evaluate(s => { const q = MathGen.make('g8.similar', s), k = q.uid || 'g8.similar|' + q.q; const a = WR.awardStars('m', k + '|t', 1), b = WR.awardStars('m', k + '|t', 1); return [a, b]; }, list[1]).catch(() => null);
      ok(st && st[0] >= 1 && st[1] < st[0], `a replayed question pays less than the first time (${st})`);
      await p.evaluate(() => WR.go('math')); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '8'); b && b.click(); }); await p.waitForTimeout(400);
      ok(await p.locator('[data-t="g8.similar"]').count() === 1, 'the Grade 8 hub lists Scale-Model Studio');
      ok(await p.evaluate(() => { const e = document.querySelector('[data-t="g8.similar"]'); return !/\p{Extended_Pictographic}/u.test(e.innerText) && !!e.querySelector('img.wr-icon'); }), 'its hub card shows the painted map icon, not an emoji');
      await p.locator('[data-t="g8.similar"]').scrollIntoViewIfNeeded(); await p.screenshot({ path: OUT + 'similar_05_hub_grade8.png' });
    }
    ok(!errors.length, `${w}px: no page errors ${errors.slice(0, 2)}`);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall Scale-Model Studio checks passed');
})();
