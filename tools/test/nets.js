// ✂️ Snip & Fold Nets: MOE P6 nets of solids (pick the cube net, can it fold into a cube, opposite faces, which extra square
// finishes the net, name the solid from its net, count its faces). Node checks re-fold every drawn net with an independent
// 3D rotation method, read straight from the SVG; then a phone flow at 375 and 320 px with picture answer choices.
// Run: node tools/test/nets.js (game served on :18642). Screenshots: screenshots/nets_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const ID = 'g6.nets';

/* ---------- independent folding: roll a cube (3 × 3 rotation matrix) across the paper ---------- */
const mul = (A, B) => A.map(r => [0, 1, 2].map(j => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
const RY = s => [[0, 0, s], [0, 1, 0], [-s, 0, 0]], RX = s => [[1, 0, 0], [0, 0, -s], [0, s, 0]];
// the face (as a direction fixed in the cube) that touches the paper on each square
const fold = cells => { const k = c => c.join(','), R = { [k(cells[0])]: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] }, todo = [cells[0]], has = c => cells.some(d => d[0] === c[0] && d[1] === c[1]);
  while (todo.length) { const c = todo.shift();
    for (const [dx, dy, T] of [[1, 0, RY(1)], [-1, 0, RY(-1)], [0, 1, RX(-1)], [0, -1, RX(1)]]) { const d = [c[0] + dx, c[1] + dy]; if (has(d) && !R[k(d)]) { R[k(d)] = mul(T, R[k(c)]); todo.push(d); } } }
  const face = {}; for (const key in R) { const m = R[key]; face[key] = [0, 1, 2].map(i => -m[2][i]).join(','); } // body direction now pointing down
  return face; };
const isNet = cells => cells.length === 6 && new Set(Object.values(fold(cells))).size === 6 && Object.keys(fold(cells)).length === 6;
const S = 16, PAD = 4;
const readNet = svg => { const cells = [...svg.matchAll(/class="ntc( ntx)?" x="([\d.-]+)" y="([\d.-]+)"/g)].map(m => [(+m[2] - PAD) / S, (+m[3] - PAD) / S]);
  const extra = [...svg.matchAll(/class="ntc ntx" x="([\d.-]+)" y="([\d.-]+)"/g)].map(m => [(+m[1] - PAD) / S, (+m[2] - PAD) / S])[0];
  const labels = {}; for (const m of svg.matchAll(/class="ntl" x="([\d.]+)" y="([\d.]+)"[^>]*>([A-F])</g)) labels[[Math.floor((+m[1] - PAD) / S), Math.floor((+m[2] - PAD) / S)].join(',')] = m[3];
  return { cells, extra, labels }; };
const readSolid = svg => [...svg.matchAll(/class="nface" points="([^"]+)"/g)].map(m => m[1].split(' ').map(p => p.split(',').map(Number)));
const len = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const solidOf = faces => { const tri = faces.filter(f => f.length === 3).length, n = faces.length;
  if (n === 6 && !tri) { const sq = faces.every(f => Math.abs(len(f[0], f[1]) - len(f[1], f[2])) < .5); return sq ? 'cube' : 'cuboid'; }
  return n === 5 && tri === 2 ? 'triangular prism' : n === 5 && tri === 4 ? 'square pyramid' : n === 4 && tri === 4 ? 'triangular pyramid' : '?'; };

/* ---------- 1. generators (Node) ---------- */
const t = M.topic(ID);
ok(t && t.grade === 6 && t.name === 'Snip & Fold Nets', `✂️ Snip & Fold Nets is a Grade 6 topic (${t && t.desc})`);
ok(M.TOPICS.length >= 111, `${M.TOPICS.length} maths topics (111 when Snip & Fold Nets was added)`);
{ const g = M.gradeTopics(6).map(x => x.id); ok(g.indexOf(ID) === g.indexOf('g6.speed') + 1 && g[g.length - 2] === 'g6.piechart' && g[g.length - 1] === 'g6.story', 'it sits after Speedy Broomsticks; Pie Chart Picnic and the word problems stay last'); }
ok(M.nets.HEXOS.length === 35 && M.nets.CUBE_NETS.length === 11, `there are 35 hexominoes and exactly 11 cube nets (${M.nets.HEXOS.length} / ${M.nets.CUBE_NETS.length})`);
ok(M.nets.HEXOS.every(h => !!M.nets.foldCube(h) === isNet(h)), 'the game\'s dice-rolling fold agrees with an independent 3D-rotation fold on all 35 hexominoes');
const kinds = {}, bad = [], wrong = [];
for (let s = 1; s <= 6000; s++) {
  const q = M.make(ID, s * 2654435761 >>> 0), d = q.data, js = JSON.stringify(q);
  kinds[d.net] = (kinds[d.net] || 0) + 1;
  if (/NaN|Infinity|undefined|\[object/.test(js) || !M.check(q, q.a).ok || !q.hint || !q.steps.length || /^[a-z]/.test(q.q)) bad.push(q.q);
  if (/\p{Extended_Pictographic}/u.test(q.q + q.steps.join('') + q.hint)) bad.push('emoji in text');
  if (d.net === 'check') { const f = readNet(q.pic); if (isNet(f.cells) !== (q.a === 'Yes') || f.cells.length !== 6) wrong.push('check ' + q.a); }
  if (d.net === 'pick' || d.net === 'extra') {
    if (!q.optPics || q.options.some(o => !q.optPics[o]) || q.options.length < 3) { bad.push('optPics'); continue; }
    const figs = q.options.map(o => readNet(q.optPics[o])), keys = figs.map(f => f.cells.map(String).sort().join(' '));
    if (new Set(keys).size !== keys.length) wrong.push('same picture twice');
    q.options.forEach((o, i) => { if (isNet(figs[i].cells) !== (o === q.a)) wrong.push(d.net + ' option ' + o); });
    if (d.net === 'extra') { const base = readNet(q.pic).cells; if (base.length !== 5) wrong.push('base has ' + base.length);
      figs.forEach(f => { if (!f.extra || f.cells.length !== 6 || base.some(c => !f.cells.some(e => e[0] === c[0] && e[1] === c[1]))) wrong.push('extra keeps the base + one yellow square'); }); }
    if (/\bn\d\b/.test(q.q)) wrong.push('option id shown in text');
  }
  if (d.net === 'opposite') { const f = readNet(q.pic), face = fold(f.cells), byL = {}; for (const k in f.labels) byL[f.labels[k]] = face[k];
    const opp = Object.keys(byL).filter(L => byL[L].split(',').map(Number).every((v, i) => v === -byL[d.face].split(',').map(Number)[i]));
    if (Object.keys(byL).length !== 6 || opp.length !== 1 || opp[0] !== q.a || q.options.includes(d.face)) wrong.push('opposite ' + d.face + ' → ' + q.a + ' vs ' + opp); }
  if (d.net === 'solid') { const name = solidOf(readSolid(q.pic)); if (name !== q.a || q.options.length !== 4) wrong.push('solid ' + q.a + ' vs ' + name); }
  if (d.net === 'count') { const F = readSolid(q.pic), name = solidOf(F), tri = F.filter(f => f.length === 3).length;
    const want = d.ask === 'faces' ? F.length : d.ask === 'triangles' ? tri : F.length - tri; if (want !== q.val || !q.q.includes(name)) wrong.push('count ' + d.ask + ' ' + q.val + ' vs ' + want); }
}
ok(!bad.length, `6,000 net questions pass the checker, start with a capital, have a hint and a worked solution and no emoji ${bad.slice(0, 3)}`);
ok(!wrong.length, `every answer is re-worked from the drawn picture (independent fold, opposite faces, only one right picture, solid from its faces) ${[...new Set(wrong)].slice(0, 4)}`);
ok(['pick', 'check', 'opposite', 'extra', 'solid', 'count'].every(k => kinds[k] > 700), 'all six question types appear: ' + JSON.stringify(kinds));
{ const qs = Array.from({ length: 3000 }, (_, s) => M.make(ID, s + 1)), solids = new Set(qs.filter(q => q.data.solid).map(q => q.data.solid)), yes = qs.filter(q => q.data.net === 'check' && q.a === 'Yes').length / qs.filter(q => q.data.net === 'check').length;
  ok(solids.size === 5, 'nets of all five solids appear (cube, cuboid, triangular prism, square pyramid, triangular pyramid): ' + [...solids]);
  ok(yes > .4 && yes < .6, `"Can it fold into a cube?" is Yes about half the time (${Math.round(yes * 100)}%)`);
  const nets = new Set(qs.filter(q => q.data.net === 'pick').map(q => M.nets.CUBE_NETS.findIndex(n => isSameShape(n, q.data.cells)))); ok(nets.size === 11 && !nets.has(-1), `all 11 cube nets turn up as right answers (${nets.size})`); }
function isSameShape(a, b) { const norm = c => { const x = Math.min(...c.map(p => p[0])), y = Math.min(...c.map(p => p[1])); return c.map(p => [p[0] - x, p[1] - y].join(',')).sort().join(' '); };
  const turns = c => { const out = []; let p = c; for (let f = 0; f < 2; f++) { for (let k = 0; k < 4; k++) { out.push(norm(p)); p = p.map(([x, y]) => [-y, x]); } p = p.map(([x, y]) => [-x, y]); } return out; };
  return turns(a).includes(norm(b)); }
ok([1, 2, 3, 99].every(s => { const r = M.batch(ID, 8, s); return r.length === 8 && new Set(r.map(q => q.uid || q.q + q.a)).size === 8; }), 'a lesson of 8 has no repeated question');
ok(M.batch('g4.symmetry', 8, 99).length === 8 && M.batch('g6.piechart', 8, 99).length === 8, 'Mirror Pond (shared squared-paper helpers) and other topics still batch as before');

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
    await ctx.route(/supabase\.co/, r => r.abort());
    const p = await ctx.newPage(); const errors = [];
    p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/font|ERR_|net::|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    await p.goto(URL); await p.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE);
    await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(400);
    const list = [seed(q => q.data.net === 'pick'), seed(q => q.data.net === 'opposite'), seed(q => q.data.net === 'extra' && q.options.length === 4), seed(q => q.data.net === 'solid' && q.data.solid === 'prism'), seed(q => q.data.net === 'check' && q.a === 'No'), seed(q => q.data.net === 'count')];
    await p.evaluate(l => WR.Math.startLesson({ topic: 'g6.nets', items: l.map(s => MathGen.make('g6.nets', s)) }), list);
    await p.waitForTimeout(400);
    for (let i = 0; i < list.length; i++) {
      const q = await p.evaluate(() => WR.Math._dbg()), tag = `${w}px ${q.data.net}`;
      ok(await fits(p), `${tag}: the net and the choices fit the screen with no sideways scroll`);
      if (q.optPics) {
        const n = await p.locator('.mopts .opt.mpicopt svg.netpic').count(); ok(n === q.options.length, `${tag}: ${n} picture choices are drawn`);
        const big = await p.evaluate(() => Math.min(...[...document.querySelectorAll('.mopts .opt')].map(e => e.getBoundingClientRect().height))); ok(big >= 48, `${tag}: picture choices are easy to tap (${Math.round(big)} px tall)`);
      } else ok(await p.locator('.qcard svg.netpic').count() === 1, `${tag}: the net is drawn on the card`);
      const minTap = await p.evaluate(() => Math.min(...[...document.querySelectorAll('.qcard button, .mopts .opt')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().height)));
      ok(minTap >= 40, `${tag}: buttons are at least 40 px tall (${Math.round(minTap)})`);
      if (w === 375 && i < 4) await p.locator('.qcard').screenshot({ path: OUT + `nets_0${i + 1}_${q.data.net}.png` });
      if (w === 375 && i === 0) { // a wrong pick twice: the right picture lights up and the answer shows as a picture
        const wr = q.options.map((o, k) => o === q.a ? -1 : k).filter(k => k >= 0);
        await p.locator(`.mopts .opt[data-k="${wr[0]}"]`).click(); await p.waitForTimeout(250); await p.locator(`.mopts .opt[data-k="${wr[1]}"]`).click(); await p.waitForTimeout(300);
        ok(await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"].right`).count() === 1, `${tag}: after two misses the right net is marked`);
        ok(await p.locator('#mexplain .mansPic svg.netpic').count() === 1 && !(await p.locator('#mexplain').innerText()).includes(q.a), `${tag}: the answer is shown as a picture, never as its id`);
        await p.locator('.qcard').screenshot({ path: OUT + 'nets_05_answer_shown.png' });
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
      // replaying the same question pays less (anti-farm: first-correct only)
      const st = await p.evaluate(s => { const q = MathGen.make('g6.nets', s), k = q.uid || 'g6.nets|' + q.q; const a = WR.awardStars('m', k + '|t', 1), b = WR.awardStars('m', k + '|t', 1); return [a, b]; }, list[0]).catch(() => null);
      if (st) ok(st[0] >= st[1], `a replayed net pays no more than the first time (${st})`);
      await p.evaluate(() => WR.go('math')); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '6'); b && b.click(); }); await p.waitForTimeout(400);
      ok(await p.locator('[data-t="g6.nets"]').count() === 1, 'the Grade 6 hub lists Snip & Fold Nets');
      ok(await p.evaluate(() => { const e = document.querySelector('[data-t="g6.nets"]'); return !/\p{Extended_Pictographic}/u.test(e.innerText) && !!e.querySelector('img.wr-icon, svg, .wr-icon'); }), 'its hub card shows a painted icon, not an emoji');
      await p.locator('[data-t="g6.nets"]').scrollIntoViewIfNeeded(); await p.screenshot({ path: OUT + 'nets_06_hub_grade6.png' });
    }
    ok(!errors.length, `${w}px: no page errors ${errors.slice(0, 2)}`);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall nets checks passed');
})();
