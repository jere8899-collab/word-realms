// 🚢 Lighthouse Lookout: MOE Sec 3 trigonometry applications (three-figure bearings of the compass points, reading a bearing off
// a map with the angle given from the N / E / S / W line, the bearing back, the angle between two bearings, how far east /
// north / south after sailing on a bearing, the bearing after two legs, angles of elevation (angle and height, with or without
// eye level), angles of depression, and why elevation = depression). Node checks read every map and lookout picture back from
// the drawn SVG, so each bearing, angle and length sits where the answer says, and work every answer out again from the
// question's own numbers. Every option has a why / why-not note and typed slips get one too. Then a phone flow at 375 and
// 320 px that shows the notes, saves to wordRealms.save.v1 and lists the topic (painted icon) in the Grade 9 hub.
// The clean-up is checked too: one degree-trig kit (toRad / toDeg / sinD / cosD / tanD / rotPt) and one figLens side label.
// Run: node tools/test/bearings.js (game served on :18642). Screenshots: screenshots/bearings_*.png
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const ID = 'g9.bearings';

/* ---------- 1. generators (Node) ---------- */
const t = M.topic(ID);
ok(t && t.grade === 9 && t.name === 'Lighthouse Lookout' && t.icon === '🚢', `🚢 Lighthouse Lookout is a Grade 9 (Sec 3) topic (${t && t.desc})`);
ok(M.TOPICS.length >= 118, `it is one of ${M.TOPICS.length} maths topics (118 when it was added)`);
{ const g = M.gradeTopics(9).map(x => x.id), i = g.indexOf(ID); ok(g[i - 1] === 'g9.perpline' && g[g.length - 1] === 'g9.story', 'SOH-CAH-TOA moved to Grade 8, so it sits after Right-Angle Paths: ' + g.join(' ')); }
// the clean-up: one degree-trig kit and one side-label helper, and no topic keeps its own degree → radian code
{ const I = M._internal; ok(I.toRad(180) === Math.PI && I.toDeg(Math.PI) === 180 && Math.abs(I.sinD(30) - .5) < 1e-12 && Math.abs(I.cosD(60) - .5) < 1e-12 && Math.abs(I.tanD(45) - 1) < 1e-12 && I.rotPt([1, 0], 90).every((v, i) => Math.abs(v - [0, 1][i]) < 1e-12), 'the shared degree-trig kit (toRad, toDeg, sinD, cosD, tanD, rotPt) works');
  const src = ['h', 'm'].map(x => fs.readFileSync(ROOT + `/js/math-topics-${x}.js`, 'utf8')).join('\n'), n = (src.match(/Math\.PI \/ 180|180 \/ Math\.PI/g) || []).length;
  ok(n <= 3 && !/const turnPt =/.test(src) && !/const R = d => d \* Math\.PI/.test(src), `topics use the shared trig kit instead of their own degree ↔ radian code (${n} left: Scale-Model's triPts keeps its exact rounding, Sparkle Sequences' honeycomb)`);
  ok(typeof I.figLens === 'function' && !/let n = \[-u\[1\], u\[0\]\]/.test(src), 'Circle Secrets and Lighthouse Lookout share one figLens side-label helper'); }
const attr = (tag, a) => { const m = tag.match(new RegExp(`\\b${a}="([^"]*)"`)); return m ? m[1] : null; };
const pts = (svg, cls) => Object.fromEntries([...svg.matchAll(new RegExp(`<circle class="${cls}"[^>]*>`, 'g'))].map(m => [attr(m[0], 'data-n'), [+attr(m[0], 'cx'), +attr(m[0], 'cy')]]));
const bearingPx = (A, B) => ((Math.atan2(B[0] - A[0], A[1] - B[1]) * 180 / Math.PI) + 360) % 360; // pixels: y grows downwards
const angAt = (V, A, B) => { const a = Math.atan2(A[1] - V[1], A[0] - V[0]), b = Math.atan2(B[1] - V[1], B[0] - V[0]); let d = Math.abs(a - b) * 180 / Math.PI; return d > 180 ? 360 - d : d; };
const dist = (A, B) => Math.hypot(A[0] - B[0], A[1] - B[1]);
const nums = s => (s.match(/\d+(\.\d+)?/g) || []).map(Number);
const R = d => d * Math.PI / 180, D = x => x * 180 / Math.PI;
const kinds = {}, bad = [], wrong = [], scale = [], notes = [], N = 9000;
for (let s = 1; s <= N; s++) {
  const q = M.make(ID, s * 2654435761 >>> 0), d = q.data, js = JSON.stringify(q), key = d.look + '/' + d.k;
  kinds[key] = (kinds[key] || 0) + 1;
  if (/NaN|Infinity|undefined|\[object/.test(js) || !M.check(q, q.a).ok || !q.hint || !q.steps.length || !/^[A-Z]/.test(q.q)) bad.push(key + ': ' + q.q);
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
  // answers worked out again from the question's own numbers
  const n = nums(q.q.replace(/\(1 d\.p\.\)/, ''));
  if (d.look === 'compass') { const dir = q.q.match(/due ([a-z-]+) of/)[1], want = { 'north-east': 45, east: 90, 'south-east': 135, south: 180, 'south-west': 225, west: 270, 'north-west': 315 }[dir]; if (q.a !== String(want).padStart(3, '0') + '°') wrong.push(`compass ${dir}: ${q.a}`); }
  if (d.look === 'back') { const th = n[0], want = (th + 180) % 360; if (q.val !== want || q.a !== String(want).padStart(3, '0')) wrong.push(`back of ${th} is ${want}, answer ${q.a}`); }
  if (d.look === 'between') { if (q.val !== n[1] - n[0]) wrong.push(`between ${n}: ${q.val}`); }
  if (d.look === 'travel') { const [dd, th] = [n[0], n[1]], want = /east of/.test(q.q) ? dd * Math.sin(R(th)) : Math.abs(dd * Math.cos(R(th))); if (Math.abs(want - q.val) > .05001) wrong.push(`travel ${dd} on ${th}: ${want} vs ${q.val}`); }
  if (d.look === 'legs') { const [a, b] = n, al = D(Math.atan(b / a)), want = /due south/.test(q.q) ? 180 - al : al; if (Math.abs(want - q.val) > .05001 || !/^\d{3}\.\d$/.test(q.a)) wrong.push(`legs ${a}, ${b}: ${want} vs ${q.a}`); }
  if (d.look === 'elevang') { const [dd, h, e = 0] = n, want = D(Math.atan((h - e) / dd)); if (Math.abs(want - q.val) > .05001) wrong.push(`elevang ${n}: ${want} vs ${q.val}`); }
  if (d.look === 'elevh') { const e = /eyes, ([\d.]+) m/.test(q.q) ? +q.q.match(/eyes, ([\d.]+) m/)[1] : 0, dd = n[0], a = +q.q.match(/is (\d+)°/)[1], want = dd * Math.tan(R(a)) + e; if (Math.abs(want - q.val) > .05001) wrong.push(`elevh ${n}: ${want} vs ${q.val}`); }
  if (d.look === 'depr') { const [h, a] = n, want = h / Math.tan(R(a)); if (Math.abs(want - q.val) > .05001) wrong.push(`depr ${n}: ${want} vs ${q.val}`); }
  if (d.look === 'equal') { if (q.a !== n[0] + '°') wrong.push('equal ' + q.a); }
  // the drawings, read back
  if (/^(read|back|between|travel|legs)$/.test(d.look)) { const P = pts(q.pic, 'bpt'), names = Object.keys(P), north = [...q.pic.matchAll(/<line class="bnorth" data-n="(\w)"[^>]*>/g)].map(m => [m[1], +attr(m[0], 'x1') - +attr(m[0], 'x2')]);
    if (!north.length || north.some(([, dx]) => Math.abs(dx) > .01)) scale.push('North arrows are not straight up');
    if (d.look === 'between') { const A = names.find(k => k !== 'P' && k !== 'Q'); if (Math.abs(angAt(P[A], P.P, P.Q) - q.val) > .6) scale.push(`between: drawn ${angAt(P[A], P.P, P.Q).toFixed(1)}, answer ${q.val}`);
      if (Math.abs(bearingPx(P[A], P.P) - n[0]) > .6 || Math.abs(bearingPx(P[A], P.Q) - n[1]) > .6) scale.push('between: a bearing is not drawn to scale'); }
    else { const [A, B] = names; const bAB = bearingPx(P[A], P[B]);
      const want = d.look === 'back' ? d.th : d.look === 'travel' ? d.th : q.val;
      if (Math.abs(bAB - want) > .6) scale.push(`${key}: drawn bearing ${bAB.toFixed(1)}, should be ${want}`);
      if (d.look === 'back' && Math.abs(bearingPx(P[B], P[A]) - q.val) > .6) scale.push('back: the way back is not drawn');
      if (d.look === 'read') { const g = q.pic.match(/<path class="bang"[^>]*>/)[0], sw = ((+attr(g, 'data-to') - +attr(g, 'data-from')) % 360 + 360) % 360, ref = d.ref, onRef = [+attr(g, 'data-to'), +attr(g, 'data-from')].map(v => v % 360).includes(ref % 360);
        if (sw !== d.a || !onRef || attr(g, 'data-t') !== d.a + '°') scale.push(`read: the marked angle is ${sw}° from ${attr(g, 'data-from')}, not ${d.a}° on the ${ref} line`);
        const off = Math.min(Math.abs(bAB - ref % 360), 360 - Math.abs(bAB - ref % 360)); if (Math.abs(off - d.a) > .6) scale.push('read: B is not the marked angle from the line'); }
      if (d.look === 'travel') { const K = (q.pic.match(/<path d="M([\d.]+),([\d.]+) L/) || []).slice(1).map(Number), k = dist(P[A], P[B]) / d.d, east = Math.abs(P[B][0] - P[A][0]) / k, ns = Math.abs(P[B][1] - P[A][1]) / k;
        if (Math.abs((d.ask === 'east' ? east : ns) - q.val) > .12) scale.push(`travel: the drawing gives ${(d.ask === 'east' ? east : ns).toFixed(2)}, answer ${q.val}`);
        if (!K.length || Math.abs(K[0] - P[B][0]) > .2 || Math.abs(K[1] - P[A][1]) > .2) scale.push('travel: the right angle is not at the corner under / over B'); }
      if (d.look === 'legs') { const k = Math.abs(P[B][1] - P[A][1]) / d.n; if (Math.abs(Math.abs(P[B][0] - P[A][0]) / k - d.e) > .08) scale.push('legs: the east leg is not to scale'); } } }
  if (/^(elevang|elevh|depr|equal)$/.test(d.look)) { const P = pts(q.pic, 'lpt'), eye = P.E || P.O, T = P.T, F = P.F;
    if (!T || !F || !eye || Math.abs(T[0] - F[0]) > .01) { scale.push('lookout points / tower not upright'); continue; }
    const elev = D(Math.atan((eye[1] - T[1]) / Math.abs(T[0] - eye[0]))), k = Math.abs(eye[0] - F[0]) / (d.d || 1);
    if (d.look === 'elevang') { if (Math.abs(elev - q.val) > .35) scale.push(`elevang: drawn ${elev.toFixed(2)}°, answer ${q.val}`); if (Math.abs((F[1] - T[1]) / k - d.h) > .15) scale.push('elevang: the height is not to scale');
      if (d.e && Math.abs((F[1] - eye[1]) / k - d.e) > .15) scale.push('elevang: the eye height is not to scale'); }
    if (d.look === 'elevh') { if (Math.abs(elev - d.a) > .35) scale.push(`elevh: drawn ${elev.toFixed(2)}°, should be ${d.a}`); if (Math.abs((F[1] - T[1]) / k - q.val) > .15) scale.push(`elevh: drawn height ${((F[1] - T[1]) / k).toFixed(2)}, answer ${q.val}`); }
    if (d.look === 'depr' || d.look === 'equal') { const kk = (F[1] - T[1]) / d.h, dep = D(Math.atan((eye[1] - T[1]) / Math.abs(eye[0] - T[0])));
      if (Math.abs(dep - (d.a)) > .35) scale.push(`${d.look}: drawn depression ${dep.toFixed(2)}°, should be ${d.a}`);
      if (d.look === 'depr' && Math.abs(Math.abs(eye[0] - F[0]) / kk - q.val) > .2 + q.val * .003) scale.push(`depr: drawn distance ${(Math.abs(eye[0] - F[0]) / kk).toFixed(2)}, answer ${q.val}`);
      if (!/class="mhid"/.test(q.pic)) scale.push('depression without its dashed flat line'); } }
}
ok(!bad.length, `${N} questions: no NaN / undefined, the given answer checks, every one has a hint and steps, no emoji in text ${bad.slice(0, 3)}`);
ok(Object.keys(kinds).filter(k => /^(compass|read|back|between|travel|legs|elevang|elevh|depr|equal)\//.test(k)).map(k => k.split('/')[0]).filter((v, i, a) => a.indexOf(v) === i).length === 10, '10 question types: ' + Object.entries(kinds).map(([k, v]) => `${k} ${v}`).join(', '));
ok(['read/North', 'read/East', 'read/South', 'read/West', 'back/plus', 'back/minus', 'travel/ne-east', 'travel/ne-ns', 'travel/se-east', 'travel/se-ns', 'legs/ne', 'legs/se', 'elevang/eye', 'elevang/ground', 'elevh/eye', 'elevh/ground', 'depr/boat', 'depr/beach'].every(k => kinds[k] > 50), 'every variant comes up (angle from each of N / E / S / W, back ± 180, NE / SE trips, eye level or not)');
ok(!wrong.length, `every answer matches its own re-computation from the question ${wrong.slice(0, 3)}`);
ok(!scale.length, `every map and lookout picture is drawn to scale: bearings, angles and lengths read back off the SVG ${scale.slice(0, 3)}`);
ok(!notes.length, `every option has its own why / why-not note, every typed question has at least 2 slips with notes ${notes.slice(0, 3)}`);
{ const qs = Array.from({ length: 3000 }, (_, s) => M.make(ID, s + 1)), by = k => qs.filter(q => q.data.look === k), has = (q, re) => q.slips.some(s => re.test(s[1]));
  ok(by('read').every(q => has(q, /only the marked angle/)), 'read-a-bearing questions name the "gave the marked angle, not the bearing" slip');
  ok(by('back').every(q => q.slips.some(s => s[0] === q.data.th)), 'bearing-back questions name the "gave the same bearing" slip');
  ok(by('back').filter(q => q.data.th > 180).every(q => has(q, /more than a full turn/)), 'bearings past 180° name the "added 180 and went past 360°" slip');
  ok(['travel', 'elevang', 'elevh', 'depr'].every(k => by(k).filter(q => has(q, /radian mode/)).length / by(k).length > .35), 'the calculator-in-radian-mode slip is named in many trig questions (when its value is a possible length or angle)');
  ok(by('elevh').filter(q => q.data.e).every(q => has(q, /eyes/)) && by('elevang').filter(q => q.data.e).every(q => has(q, /eyes/)), 'eye-level questions name the "forgot the eye height" slip');
  ok(by('depr').every(q => has(q, /line of sight/)), 'depression questions name the "found the slanted line of sight" slip');
  ok(by('equal').every(q => Object.values(q.why).some(w => /alternate angles/.test(w))), 'elevation = depression is explained with alternate angles');
  ok(qs.every(q => !/minister|politic|election|war\b|kill|blood|weapon|gun|knife|money|salary|income|bet\b|gambl|army|missile|enemy/i.test(q.q)), 'kid / teen themes only');
  ok(qs.every(q => q.uid && /^look\|/.test(q.uid)) && qs.filter(q => !/^compass$/.test(q.data.look)).every(q => q.pic), 'every question has a uid (anti-farm), and every map / lookout question has its picture'); }
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
    const D_ = q => q.data;
    const list = [seed(q => D_(q).look === 'depr' && D_(q).k === 'boat' && q.q.includes('lighthouse')), seed(q => D_(q).look === 'equal'), seed(q => D_(q).look === 'read' && D_(q).k === 'South'), seed(q => D_(q).look === 'elevh' && D_(q).k === 'eye'),
      seed(q => D_(q).look === 'compass'), seed(q => D_(q).look === 'back' && D_(q).k === 'minus'), seed(q => D_(q).look === 'travel'), seed(q => D_(q).look === 'legs' && D_(q).k === 'se'), seed(q => D_(q).look === 'between'), seed(q => D_(q).look === 'elevang' && D_(q).k === 'ground')];
    ok(list.every(Number.isInteger), `${w}px: a seed was found for every kind of question`);
    await p.evaluate(l => WR.Math.startLesson({ topic: 'g9.bearings', items: l.map(s => MathGen.make('g9.bearings', s)) }), list);
    await p.waitForTimeout(500);
    for (let i = 0; i < list.length; i++) {
      const q = await p.evaluate(() => WR.Math._dbg()), tag = `${w}px ${q.data.look}/${q.data.k}`;
      ok(await fits(p), `${tag}: the picture and the choices fit the screen with no sideways scroll`);
      const taps = await p.evaluate(() => Math.min(...[...document.querySelectorAll('.mopts .opt, #mcheck, .numpad button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().height)));
      ok(taps >= 40, `${tag}: answer buttons are easy to tap (${Math.round(taps)} px)`);
      if (q.data.look !== 'compass') ok(await p.locator('.qcard svg.bear, .qcard svg.look').count() === 1, `${tag}: the map / lookout picture is shown`);
      if (i < 4) {
        if (q.kind === 'mcq') { const wk = q.options.findIndex(o => o !== q.a); await p.locator(`.mopts .opt[data-k="${wk}"]`).click(); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.why[q.options[wk]].slice(0, 30))), `${tag}: a wrong pick shows its own why-not note`);
          await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); await p.waitForTimeout(300);
          ok((await whyText(p)).some(x => x.includes(q.why[q.a].slice(0, 30))), `${tag}: the right answer shows why it works, in other words`);
          if (w === 375 && i === 1) await p.locator('.qcard').screenshot({ path: OUT + 'bearings_02_equal_why.png' });
        } else { await p.fill('#mans', String(q.slips[0][0])); await p.click('#mcheck'); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.slips[0][1].slice(0, 30))), `${tag}: typing the usual slip (${q.slips[0][0]}) shows its why-not note`);
          if (w === 375 && i === 0) await p.locator('.qcard').screenshot({ path: OUT + 'bearings_01_depression_slip.png' });
          await p.fill('#mans', q.a); await p.click('#mcheck'); await p.waitForTimeout(300); }
      } else {
        if (q.kind === 'mcq') await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); else { await p.fill('#mans', q.a); await p.click('#mcheck'); }
        await p.waitForTimeout(300);
      }
      ok(await p.evaluate(() => /correct|got it/i.test(document.querySelector('.qcard').innerText)), `${tag}: the right answer is marked right`);
      if (w === 375 && i === 2) await p.locator('.qcard').screenshot({ path: OUT + 'bearings_03_read_bearing_worked.png' });
      if (i < list.length - 1) { await p.click('#mnext'); await p.waitForTimeout(300); }
    }
    const m = await p.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).math);
    ok(m && m.correct >= list.length && m.answered >= list.length, `${w}px: answers are saved in wordRealms.save.v1 (math.correct ${m && m.correct}, answered ${m && m.answered})`);
    if (w === 375) {
      const st = await p.evaluate(s => { const q = MathGen.make('g9.bearings', s), k = q.uid || 'g9.bearings|' + q.q; const a = WR.awardStars('m', k + '|t', 1), b = WR.awardStars('m', k + '|t', 1); return [a, b]; }, list[1]).catch(() => null);
      ok(st && st[0] >= 1 && st[1] < st[0], `a replayed question pays less than the first time (${st})`);
      await p.evaluate(() => WR.go('math')); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '9'); b && b.click(); }); await p.waitForTimeout(400);
      ok(await p.locator('[data-t="g9.bearings"]').count() === 1, 'the Grade 9 hub lists Lighthouse Lookout');
      ok(await p.evaluate(() => { const e = document.querySelector('[data-t="g9.bearings"]'); return !/\p{Extended_Pictographic}/u.test(e.innerText) && !!e.querySelector('img.wr-icon'); }), 'its hub card shows the painted ship icon, not an emoji');
      await p.locator('[data-t="g9.bearings"]').scrollIntoViewIfNeeded(); await p.screenshot({ path: OUT + 'bearings_04_hub_grade9.png' });
    }
    ok(!errors.length, `${w}px: no page errors ${errors.slice(0, 2)}`);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall Lighthouse Lookout checks passed');
})();
