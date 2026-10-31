// 📊 Graph Garden: data-analysis topics on the MOE path (P1 picture graphs, P2 picture graphs with a key, P3 bar graphs,
// P4 tables + line graphs, P6 pie charts). Node checks on thousands of questions (answers recomputed from the chart data,
// bars drawn to scale, nothing printed that gives the answer away), then a phone flow at 375 and 320 px.
// Run: node tools/test/graphs.js (game served on :18642). Screenshots: screenshots/graphs_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const IDS = ['g1.picgraph', 'g2.picgraph', 'g3.bargraph', 'g4.linegraph', 'g6.piechart'];

/* ---------- 1. generators (Node) ---------- */
ok(IDS.every(id => M.topic(id)), 'five graph topics are on the map: ' + IDS.map(id => `${M.topic(id).icon} ${M.topic(id).name}`).join(', '));
ok(IDS.every(id => { const g = M.gradeTopics(M.topic(id).grade); return g[g.length - 1].story && g.indexOf(M.topic(id)) === g.length - 2; }), 'each sits just before its grade\'s word-problem topic');
const kinds = {}, bad = [], wrong = [], leak = [], scale = [], words = [];
const sum = a => a.reduce((x, y) => x + y, 0);
for (const id of IDS) for (let s = 1; s <= 2000; s++) {
  const q = M.make(id, s * 2654435761 >>> 0), d = q.data || {}, js = JSON.stringify(q);
  kinds[id] = kinds[id] || new Set(); kinds[id].add(q.kind + ':' + (d.graph || '?'));
  if (/NaN|Infinity|undefined|\[object/.test(js) || !M.check(q, q.a).ok || !q.hint || !q.steps.length || !q.pic) bad.push(id + ' ' + q.q);
  if (/\b(beer|wine|money|bank|tax|election)\b/i.test(q.q)) words.push(id);
  // the answer must be one a child can get from the chart's own numbers
  if (d.graph === 'picto' || d.graph === 'bars') {
    const v = d.vals, opts = new Set(v.concat(sum(v)));
    v.forEach((a, i) => v.forEach((b, j) => { if (i !== j) { opts.add(Math.abs(a - b)); opts.add(a + b); } }));
    for (let k = 2; k <= 9; k++) opts.add(k);  // inverse: pictures to draw
    if (q.kind === 'num' && !opts.has(q.val)) wrong.push(id + ' ' + q.q + ' ' + q.a);
    if (q.kind === 'mcq') { const i = d.names.findIndex(n => q.a.endsWith(n)), big = /most/.test(q.q); if (v[i] !== (big ? Math.max(...v) : Math.min(...v))) wrong.push(id + ' ' + q.q); }
    if (d.graph === 'bars') { // bars drawn to scale; values are never printed on the bars
      const hs = [...q.pic.matchAll(/<rect x="[\d.]+" y="[\d.]+" width="[\d.]+" height="([\d.]+)" rx="5"/g)].map(m => +m[1]);
      if (hs.length !== v.length || hs.some((h, i) => Math.abs(h - v[i] * 132 / +[...q.pic.matchAll(/text-anchor="end"[^>]*>(\d+)</g)].pop()[1]) > 0.6)) scale.push(id);
      const ticks = [...q.pic.matchAll(/text-anchor="end"[^>]*>(\d+)</g)].map(m => +m[1]); if (ticks[1] !== d.scale) scale.push(id + ' ticks');
    }
    if (d.graph === 'picto') { const rows = [...q.pic.matchAll(/<span class="pics">([^<]*)</g)].map(m => [...m[1].replace('&nbsp;', '')].filter(c => /\p{Extended_Pictographic}/u.test(c)).length);
      if (rows.some((n, i) => n * d.scale !== v[i])) scale.push(id + ' picto ' + rows); }
  }
  if (d.graph === 'line') { const opts = new Set(d.vals); d.vals.forEach(a => d.vals.forEach(b => opts.add(Math.abs(a - b))));
    if (q.kind === 'num' && !opts.has(q.val)) wrong.push(id + ' ' + q.q);
    if (q.kind === 'mcq' && /up the most/.test(q.q)) { const r = d.vals.slice(1).map((x, i) => x - d.vals[i]), k = r.indexOf(Math.max(...r)); if (q.a !== `${d.xs[k]} to ${d.xs[k + 1]}` || r.filter(x => x === r[k]).length !== 1) wrong.push(id + ' rise'); }
    if (q.kind === 'mcq' && /highest\?/.test(q.q) && d.vals[d.xs.indexOf(q.a)] !== Math.max(...d.vals)) wrong.push(id + ' high');
    if ((q.pic.match(/<circle/g) || []).length !== d.xs.length) scale.push(id + ' points'); }
  if (d.graph === 'table' && !/>\?</.test(q.pic)) leak.push(id + ' table');
  if (d.graph === 'pie') { const { parts, whole, N, pct } = d; if (sum(parts) !== whole || new Set(parts).size !== parts.length || parts.some(p => N * p % whole)) wrong.push(id + ' parts');
    const counts = parts.map(p => N * p / whole), shares = parts.map(p => pct ? p * 100 / whole : p / whole), opts = new Set(counts.concat(shares, N)); counts.forEach(a => counts.forEach(b => opts.add(a - b)));
    if (q.kind === 'num' && ![...opts].some(o => Math.abs(o - q.val) < 1e-9)) wrong.push(id + ' ' + q.q);
    if (/What (fraction|percentage)/.test(q.q) && !/>\?</.test(q.pic)) leak.push(id + ' pie ?');
    const ang = [...q.pic.matchAll(/<path d="M80,112 L([\d.-]+),([\d.-]+) A70,70 0 (\d),1 ([\d.-]+),([\d.-]+) Z"/g)];
    if (ang.length !== parts.length || ang.some((m, i) => +m[3] !== (parts[i] / whole > .5 ? 1 : 0))) scale.push(id + ' wedges'); }
}
ok(!bad.length, `10,000 graph questions: answers pass the checker, every one has a chart, a hint and a worked solution ${bad.slice(0, 3)}`);
ok(!wrong.length, `every answer is recomputed from the chart's own numbers (sums, differences, totals, most/fewest, biggest rise, pie shares) ${wrong.slice(0, 3)}`);
ok(!scale.length, `charts are drawn to scale: bar heights, picture counts × key, one point per label, pie wedges ${[...new Set(scale)].slice(0, 4)}`);
ok(!leak.length, `a hidden table cell or pie share is shown as "?" ${[...new Set(leak)]}`);
ok(!words.length, 'kid-friendly topics only');
ok([...kinds['g4.linegraph']].some(k => k.includes('table')) && [...kinds['g4.linegraph']].some(k => k.includes('line')), `Grade 4 mixes tables and line graphs (${[...kinds['g4.linegraph']]})`);
ok(IDS.every(id => [...kinds[id]].some(k => k.startsWith('mcq')) && [...kinds[id]].some(k => k.startsWith('num'))), 'every graph topic mixes typed answers and multiple choice');
ok(IDS.every(id => { const r = M.batch(id, 8, 99); return r.length === 8 && new Set(r.map(q => q.q + q.a)).size === 8; }), 'a lesson of 8 has no repeats');
{ const pies = Array.from({ length: 400 }, (_, s) => M.make('g6.piechart', s + 1)); ok(pies.some(q => q.data.pct) && pies.some(q => !q.data.pct) && pies.some(q => /fraction like/.test(q.q)) && pies.some(q => q.a.endsWith('%')), 'pie charts use both fractions (1/6, 3/8, 5/12…) and percentages'); }

/* ---------- 2. phone ---------- */
const SAVE = { v: 1, name: 'Jeremy', avatar: 'avatar_mage', startLevel: 'a1', stars: 100, totalCorrect: 40, totalAnswered: 50,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 420, happiness: 82, hunger: 35, skin: null, lastTick: Date.now() }, streak: { count: 4, last: null }, progress: {},
  owned: [], equipped: { outfit: null, petskin: null, theme: null }, settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 5 };
const seed = (id, pred) => { for (let s = 1; s < 5000; s++) if (pred(M.make(id, s))) return s; };
const fits = page => page.evaluate(() => { const c = document.querySelector('.qpic > *'), r = c && c.getBoundingClientRect(); return !!r && document.documentElement.scrollWidth <= innerWidth + 1 && r.right <= innerWidth + 1 && r.left >= -1 && r.width > 150; });
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const [w, h] of [[375, 667], [320, 658]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); const errors = [];
    p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/font|ERR_|net::|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    await p.goto(URL); await p.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE);
    await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(400);
    const list = [['g3.bargraph', seed('g3.bargraph', q => q.kind === 'num' && q.data.vals.length === 5)], ['g1.picgraph', seed('g1.picgraph', q => q.kind === 'mcq')], ['g2.picgraph', seed('g2.picgraph', q => q.kind === 'num' && q.data.scale === 5)],
      ['g4.linegraph', seed('g4.linegraph', q => q.data.graph === 'line' && q.kind === 'num')], ['g6.piechart', seed('g6.piechart', q => /fraction like/.test(q.q))], ['g4.linegraph', seed('g4.linegraph', q => q.data.graph === 'table')]];
    await p.evaluate(l => WR.Math.startLesson({ topic: l[0][0], items: l.map(([t, s]) => MathGen.make(t, s)) }), list);
    await p.waitForTimeout(400);
    for (let i = 0; i < list.length; i++) {
      const q = await p.evaluate(() => WR.Math._dbg()), tag = `${w}px ${q.topic}`;
      ok(await fits(p), `${tag}: the chart fits the screen with no sideways scroll`);
      if (w === 375 && i < 5) await p.locator('.qcard').screenshot({ path: OUT + `graphs_0${i + 1}_${q.topic.replace('.', '_')}.png` });
      if (q.kind === 'mcq') await p.locator('.mopts .opt', { hasText: q.a }).first().click(); else { await p.fill('#mans', q.a); await p.click('#mcheck'); }
      await p.waitForTimeout(300);
      ok(await p.evaluate(() => /right|correct|✅|🎉|great|yes/i.test(document.querySelector('.qcard').innerText)), `${tag}: the right answer "${q.a}" is marked right`);
      if (i < list.length - 1) { await p.click('#mnext'); await p.waitForTimeout(300); }
    }
    const m = await p.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).math);
    ok(m && m.correct >= list.length, `${w}px: answers are saved in wordRealms.save.v1 (math.correct ${m && m.correct})`);
    if (w === 375) { await p.evaluate(() => { WR.go('math'); }); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '3'); b && b.click(); }); await p.waitForTimeout(400);
      ok(await p.locator('[data-t="g3.bargraph"]').count() === 1, 'the Grade 3 hub lists 📊 Bar Graph Bakery');
      await p.locator('[data-t="g3.bargraph"]').scrollIntoViewIfNeeded(); await p.screenshot({ path: OUT + 'graphs_06_hub_grade3.png' }); }
    ok(!errors.length, `${w}px: no page errors ${errors.slice(0, 2)}`);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall graph checks passed');
})();
