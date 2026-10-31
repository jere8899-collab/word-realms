// 🪞 Mirror Pond: line symmetry on the MOE P4 path (is the dashed line a line of symmetry, pick the symmetric figure,
// complete half a figure, how many squares to shade, letters and shapes). Node checks re-read every figure from the
// SVG itself, then a phone flow at 375 and 320 px with picture answer choices.
// Run: node tools/test/symmetry.js (game served on :18642). Screenshots: screenshots/symmetry_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const ID = 'g4.symmetry';

/* ---------- 1. generators (Node) ---------- */
const t = M.topic(ID);
ok(t && t.grade === 4 && t.name === 'Mirror Pond', `🪞 Mirror Pond is a Grade 4 topic (${t && t.icon} ${t && t.desc})`);
ok(M.TOPICS.length >= 108 && M.topic("g4.symmetry"), `Mirror Pond is one of ${M.TOPICS.length} maths topics (108 when it was added)`);
{ const g = M.gradeTopics(4).map(x => x.id); ok(g.indexOf(ID) === g.indexOf('g4.angles') + 1 && g[g.length - 2] === 'g4.linegraph', 'it sits after Turns & Angles, and the graph topic still sits just before the word problems'); }
// cells read back from the SVG: [column, row] of each shaded square and where the dashed line is
const read = svg => { const S = 14, pad = 4, cells = [...svg.matchAll(/class="syc" x="([\d.]+)" y="([\d.]+)"/g)].map(m => [(+m[1] - pad - 1) / S, (+m[2] - pad - 1) / S]);
  const ln = svg.match(/class="mline" x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)"/), across = ln && ln[2] === ln[4]; return { cells, across, at: 4 }; };
const symOf = ({ cells, across }) => { const has = (x, y) => cells.some(c => c[0] === x && c[1] === y);
  return cells.filter(([x, y]) => !(across ? has(x, 7 - y) : has(7 - x, y))).length; };  // squares with no partner
const kinds = {}, bad = [], wrong = [];
for (let s = 1; s <= 6000; s++) {
  const q = M.make(ID, s * 2654435761 >>> 0), d = q.data, js = JSON.stringify(q);
  kinds[d.sym] = (kinds[d.sym] || 0) + 1;
  if (/NaN|Infinity|undefined|\[object/.test(js) || !M.check(q, q.a).ok || !q.hint || !q.steps.length) bad.push(q.q);
  if (['check', 'count', 'complete'].includes(d.sym) && !/class="mline"/.test(q.pic)) bad.push('no line ' + d.sym);
  if (d.sym === 'check') { const f = read(q.pic); if ((symOf(f) === 0) !== (q.a === 'Yes') || f.cells.length < 8) wrong.push('check ' + q.a); }
  if (d.sym === 'count') { const f = read(q.pic); if (symOf(f) !== q.val || q.val < 1 || q.val > 3) wrong.push('count ' + q.val + ' vs ' + symOf(f)); }
  if (d.sym === 'pick' || d.sym === 'complete') {
    if (!q.optPics || q.options.some(o => !q.optPics[o]) || q.options.length < 3) { bad.push('optPics'); continue; }
    const figs = q.options.map(o => read(q.optPics[o])), keys = figs.map(f => f.cells.map(String).sort().join(' '));
    if (new Set(keys).size !== keys.length) wrong.push('same picture twice');
    q.options.forEach((o, i) => { if ((symOf(figs[i]) === 0) !== (o === q.a)) wrong.push(d.sym + ' option ' + o + ' symmetric=' + (symOf(figs[i]) === 0)); });
    if (d.sym === 'complete') { const h = read(q.pic), right = figs[q.options.indexOf(q.a)]; if (h.cells.length * 2 !== right.cells.length || h.cells.some(c => !right.cells.some(e => e[0] === c[0] && e[1] === c[1]))) wrong.push('complete keeps the half'); if (symOf(h) !== h.cells.length) wrong.push('half already has partners'); }
    if (/[A-D]\b|f\d/.test(q.q)) wrong.push('option id shown in text');
  }
  if (d.sym === 'letter') { const yes = 'AHMOTUVWXY'; if (q.options.filter(o => yes.includes(o) === d.yes).length !== 1 || yes.includes(q.a) !== d.yes) wrong.push('letter ' + q.a); }
  if (d.sym === 'shape') { const n = { square: 4, rectangle: 2, triangle: 1, pentagon: 5 }[q.q.match(/square|rectangle|triangle|pentagon/)[0]]; if (n !== q.val || !q.pic) wrong.push('shape ' + q.q); }
}
ok(!bad.length, `6,000 Mirror Pond questions pass the checker, with a hint, a worked solution and a dashed line where needed ${bad.slice(0, 3)}`);
ok(!wrong.length, `every answer is re-checked from the drawn squares (fold test, partners missing, only one symmetric choice, completed half kept) ${[...new Set(wrong)].slice(0, 4)}`);
ok(['check', 'pick', 'complete', 'count', 'letter', 'shape'].every(k => kinds[k] > 600), 'all six question types appear: ' + JSON.stringify(kinds));
{ const qs = Array.from({ length: 400 }, (_, s) => M.make(ID, s + 1)).filter(q => q.data.across !== undefined); ok(qs.some(q => q.data.across) && qs.some(q => !q.data.across), 'mirror lines go both up-and-down and across'); }
ok([1, 2, 3, 99].every(s => { const r = M.batch(ID, 8, s); return r.length === 8 && new Set(r.map(q => q.uid || q.q + q.a)).size === 8; }), 'a lesson of 8 has no repeated figure');
ok(M.batch('g4.linegraph', 8, 99).length === 8, 'other topics still batch as before');

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
    const list = [seed(q => q.data.sym === 'complete' && !q.data.across), seed(q => q.data.sym === 'check' && q.a === 'No'), seed(q => q.data.sym === 'pick' && q.options.length === 4), seed(q => q.data.sym === 'count' && q.data.across), seed(q => q.data.sym === 'letter'), seed(q => q.data.sym === 'shape')];
    await p.evaluate(l => WR.Math.startLesson({ topic: 'g4.symmetry', items: l.map(s => MathGen.make('g4.symmetry', s)) }), list);
    await p.waitForTimeout(400);
    for (let i = 0; i < list.length; i++) {
      const q = await p.evaluate(() => WR.Math._dbg()), tag = `${w}px ${q.data.sym}`;
      ok(await fits(p), `${tag}: the grid and the choices fit the screen with no sideways scroll`);
      if (q.optPics) {
        const n = await p.locator('.mopts .opt.mpicopt svg.symgrid').count(); ok(n === q.options.length, `${tag}: ${n} picture choices are drawn`);
        const big = await p.evaluate(() => Math.min(...[...document.querySelectorAll('.mopts .opt')].map(e => e.getBoundingClientRect().height))); ok(big >= 48, `${tag}: picture choices are easy to tap (${Math.round(big)} px tall)`);
      }
      if (w === 375 && i < 4) await p.locator('.qcard').screenshot({ path: OUT + `symmetry_0${i + 1}_${q.data.sym}.png` });
      if (w === 375 && i === 0) { // a wrong pick twice: the right picture lights up and the answer shows as a picture
        const wr = q.options.map((o, k) => o === q.a ? -1 : k).filter(k => k >= 0);
        await p.locator(`.mopts .opt[data-k="${wr[0]}"]`).click(); await p.waitForTimeout(250); await p.locator(`.mopts .opt[data-k="${wr[1]}"]`).click(); await p.waitForTimeout(300);
        ok(await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"].right`).count() === 1, `${tag}: after two misses the right picture is marked`);
        ok(await p.locator('#mexplain .mansPic svg.symgrid').count() === 1 && !(await p.locator('#mexplain').innerText()).includes(q.a), `${tag}: the answer is shown as a picture, never as its id`);
        await p.locator('.qcard').screenshot({ path: OUT + 'symmetry_05_answer_shown.png' });
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
      await p.evaluate(() => WR.go('math')); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '4'); b && b.click(); }); await p.waitForTimeout(400);
      ok(await p.locator('[data-t="g4.symmetry"]').count() === 1, 'the Grade 4 hub lists 🪞 Mirror Pond');
      await p.locator('[data-t="g4.symmetry"]').scrollIntoViewIfNeeded(); await p.screenshot({ path: OUT + 'symmetry_06_hub_grade4.png' });
      // the grade finder and guardian fights share the same card, so picture choices work there too
      const html = await p.evaluate(s => WR.Math.optsHTML(MathGen.make('g4.symmetry', s)), seed(q => q.data.sym === 'pick'));
      ok(/mpicopts/.test(html) && /<svg/.test(html) && !/>f\d</.test(html), 'the shared option card draws pictures and hides option ids');
    }
    ok(!errors.length, `${w}px: no page errors ${errors.slice(0, 2)}`);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall symmetry checks passed');
})();
