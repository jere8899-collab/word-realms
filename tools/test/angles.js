// 🔎 Angle Detectives: MOE P5 geometry (angles on a straight line, at a point, vertically opposite; angle sum of a triangle,
// isosceles / equilateral / right-angled triangles, an extended side; parallelogram, rhombus and trapezium).
// Node checks re-measure every drawn angle from the SVG (figures are to scale, the x arc really is the answer), then a phone
// flow at 375 and 320 px. Run: node tools/test/angles.js (game served on :18642). Screenshots: screenshots/angles_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const ID = 'g5.angles', KINDS = ['line', 'point', 'vopp', 'tri', 'right', 'iso', 'ext', 'para', 'trap'];

/* ---------- 1. generators (Node) ---------- */
const t = M.topic(ID);
ok(t && t.grade === 5 && t.name === 'Angle Detectives' && t.icon === '🔎', `🔎 Angle Detectives is a Grade 5 topic (${t && t.desc})`);
ok(M.TOPICS.length >= 110, `${M.TOPICS.length} maths topics (110 when Angle Detectives was added)`);
{ const g = M.gradeTopics(5).map(x => x.id); ok(g.indexOf(ID) === g.indexOf('g5.triangle') + 1 && g[g.length - 1] === 'g5.story', 'it sits after Triangle Tents, and word problems stay last'); }
// every marked angle, re-measured from the drawn wedge (arc) or right-angle square
const marks = svg => [...svg.matchAll(/<path class="gang" data-t="([^"]*)" d="M([\d.-]+),([\d.-]+) L([\d.-]+),([\d.-]+) (?:A[\d.]+,[\d.]+ 0 0,\d |L[\d.-]+,[\d.-]+ L)([\d.-]+),([\d.-]+)/g)]
  .map(m => { const [vx, vy, ax, ay, bx, by] = m.slice(2).map(Number), a1 = Math.atan2(ay - vy, ax - vx), a2 = Math.atan2(by - vy, bx - vx);
    let d = Math.abs(a2 - a1) * 180 / Math.PI; if (d > 180) d = 360 - d; return { t: m[1], deg: d }; });
const kinds = {}, bad = [], wrong = [], off = []; let equi = 0;
for (let s = 1; s <= 6000; s++) {
  const q = M.make(ID, s * 2654435761 >>> 0), d = q.data, js = JSON.stringify(q);
  kinds[d.geo] = (kinds[d.geo] || 0) + 1; if (d.equi) equi++;
  if (/NaN|Infinity|undefined|\[object/.test(js) || !M.check(q, q.a).ok || !M.check(q, q.a + '°').ok || M.check(q, String(q.val + 1)).ok || !q.hint || !q.steps.length || !q.pic || !q.uid) bad.push(q.q);
  if (!Number.isInteger(q.val) || q.val < 20 || q.val > 160) wrong.push('answer ' + q.val);
  const ms = marks(q.pic), xs = ms.filter(m => m.t === 'x'), shown = ms.filter(m => /°$/.test(m.t)).map(m => +m.t.slice(0, -1));
  if (xs.length !== 1 || Math.abs(xs[0].deg - q.val) > 0.6) wrong.push(`${d.geo}: x drawn ${xs[0] && xs[0].deg.toFixed(1)} vs ${q.val}`);
  ms.forEach(m => { const want = m.t === 'x' ? q.val : m.t === '' ? null : parseFloat(m.t); if (want != null && Math.abs(m.deg - want) > (m.t === '90' ? 1 : 0.6)) wrong.push(`${d.geo}: ${m.t} drawn ${m.deg.toFixed(1)}`); });
  if (shown.slice().sort().join() !== d.giv.filter(g => !(g === 90 && /data-t="90"/.test(q.pic) && !shown.includes(90))).sort().join()) wrong.push(`${d.geo}: labels ${shown} vs given ${d.giv}`);
  const nums = [...q.pic.matchAll(/ (?:x|y|cx|cy|x1|y1|x2|y2)="([\d.-]+)"/g)].map(m => +m[1]), pts = [...q.pic.matchAll(/(?:points|d)="([^"]+)"/g)].flatMap(m => (m[1].match(/-?[\d.]+,-?[\d.]+/g) || []).flatMap(p => p.split(',').map(Number)));
  if (nums.concat(pts).some(v => v < 0 || v > 300)) off.push(d.geo);
  if (/\b(beer|wine|bank|tax|gun|knife|blood)\b/i.test(q.q + q.pic)) wrong.push('theme');
}
ok(!bad.length, `6,000 Angle Detectives questions pass the checker (with or without °), wrong answers fail, and each has a hint, worked steps and a figure ${bad.slice(0, 3)}`);
ok(!wrong.length, `every arc is re-measured from the drawing: x really is the answer, each number matches its arc, only the given angles are labelled ${[...new Set(wrong)].slice(0, 4)}`);
ok(!off.length, `every figure, mark and label stays inside the card ${[...new Set(off)]}`);
ok(KINDS.every(k => kinds[k] > 450), 'all nine figure types appear: ' + JSON.stringify(kinds));
ok(equi > 30, `equilateral triangles appear too (${equi})`);
{ const m = Object.fromEntries(KINDS.map(k => [k, M.make(ID, [...Array(3000).keys()].find(s => M.make(ID, s + 1).data.geo === k) + 1)]));
  ok(/class="gtick"/.test(m.iso.pic) && /class="garrow"/.test(m.trap.pic) && (/class="garrow"/.test(m.para.pic) || /class="gtick"/.test(m.para.pic)), 'equal sides carry ticks and parallel sides carry arrows');
  ok(/data-t="90"/.test(m.right.pic), 'right angles are marked with the little square'); }
ok([1, 2, 3, 99].every(s => { const r = M.batch(ID, 8, s); return r.length === 8 && new Set(r.map(q => q.uid)).size === 8; }), 'a lesson of 8 has no repeated figure');
ok(M.batch('g5.triangle', 8, 99).length === 8 && M.batch('g7.angles', 8, 99).length === 8, 'neighbouring topics still batch as before');

/* ---------- 2. phone ---------- */
const SAVE = { v: 1, name: 'Jeremy', avatar: 'avatar_mage', startLevel: 'a1', stars: 100, totalCorrect: 40, totalAnswered: 50,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 420, happiness: 82, hunger: 35, skin: null, lastTick: Date.now() }, streak: { count: 4, last: null }, progress: {},
  owned: [], equipped: { outfit: null, petskin: null, theme: null }, settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 5 };
const seed = pred => { for (let s = 1; s < 5000; s++) if (pred(M.make(ID, s))) return s; };
const fits = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && [...document.querySelectorAll('.qcard .mpic')].every(e => { const r = e.getBoundingClientRect(); return r.right <= innerWidth + 1 && r.left >= -1 && r.width > 200; }));
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const [w, h] of [[375, 667], [320, 658]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); const errors = [];
    p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/font|ERR_|net::|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    await p.goto(URL); await p.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE);
    await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(400);
    const list = ['iso', 'para', 'ext', 'point', 'trap', 'vopp'].map(k => seed(q => q.data.geo === k && !q.data.equi));
    await p.evaluate(l => WR.Math.startLesson({ topic: 'g5.angles', items: l.map(s => MathGen.make('g5.angles', s)) }), list);
    await p.waitForTimeout(400);
    for (let i = 0; i < list.length; i++) {
      const q = await p.evaluate(() => WR.Math._dbg()), tag = `${w}px ${q.data.geo}`;
      ok(await fits(p), `${tag}: the figure fits the screen with no sideways scroll`);
      ok(await p.locator('.qcard svg.geo').count() === 1, `${tag}: the figure is drawn`);
      if (w === 375 && i < 2) await p.locator('.qcard').screenshot({ path: OUT + `angles_0${i + 1}_${q.data.geo}.png` });
      if (w === 375 && i === 2) { // a wrong answer first: the hint stays kind, then the right one
        await p.fill('#mans', String(q.val + 10)); await p.click('#mcheck'); await p.waitForTimeout(300);
        ok(!(await p.evaluate(() => /correct|got it/i.test(document.querySelector('.qcard').innerText))), `${tag}: a wrong angle is not accepted`);
      }
      await p.fill('#mans', q.a + '°'); await p.click('#mcheck'); await p.waitForTimeout(300);
      ok(await p.evaluate(() => /correct|got it/i.test(document.querySelector('.qcard').innerText)), `${tag}: the right answer (typed with °) is marked right`);
      if (w === 375 && i === 2) await p.locator('.qcard').screenshot({ path: OUT + 'angles_03_worked.png' });
      if (i < list.length - 1) { await p.click('#mnext'); await p.waitForTimeout(300); }
    }
    const m = await p.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).math);
    ok(m && m.correct >= list.length - 1 && m.answered >= list.length, `${w}px: answers are saved in wordRealms.save.v1 (math.correct ${m && m.correct}, answered ${m && m.answered})`);
    if (w === 375) {
      await p.evaluate(() => WR.go('math')); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '5'); b && b.click(); }); await p.waitForTimeout(400);
      ok(await p.locator('[data-t="g5.angles"]').count() === 1, 'the Grade 5 hub lists 🔎 Angle Detectives');
      ok(await p.locator('[data-t="g5.angles"] img, [data-t="g5.angles"] .wri').count() >= 1 || !(await p.locator('[data-t="g5.angles"]').innerText()).includes('🔎'), 'its icon is the painted one, not an emoji');
      await p.locator('[data-t="g5.angles"]').scrollIntoViewIfNeeded(); await p.screenshot({ path: OUT + 'angles_04_hub_grade5.png' });
    }
    ok(!errors.length, `${w}px: no page errors ${errors.slice(0, 2)}`);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall angle checks passed');
})();
