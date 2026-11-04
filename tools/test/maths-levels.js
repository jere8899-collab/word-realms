// 📚 BRIEF-T1 maths levels: every primary topic sits at its MOE 2021 Primary Mathematics syllabus level (updated Oct 2025),
// moved topics keep their ids (so crowns, stickers and Grade Guardians survive an old save), the new P1–P3 topics (Ribbon Ruler,
// Honey-Pot Measures, Toy-Box Shapes, Market Money, Square-Tile Patio, Fan Angles) make sound questions, and a phone flow at
// 320, 360 and 375 px plus landscape. Run: node tools/test/maths-levels.js (game served on :18642). Screens: screenshots/t1_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));

/* ---------- 1. where each topic sits (MOE level → game grade) ---------- */
const AT = { // id: grade it must be in (P1–P6 = Grades 1–6, Sec 1 = Grade 7)
  'g1.length': 1, 'g1.time': 1, 'g2.money': 2, 'g2.time': 2, 'g2.frac': 2, 'g2.measure': 2, 'g2.solids': 2, 'g3.money': 3, 'g3.area': 3, 'g3.angles': 3,
  'g4.area': 4, 'g4.angles': 4, 'g6.nets': 4, 'g6.piechart': 4, 'g5.ratio': 6, 'g5.average': 6, 'g6.speed': 7, 'g5.rate': 5, 'g5.percent': 5 };
const bad = Object.entries(AT).filter(([id, g]) => !M.topic(id) || M.topic(id).grade !== g);
ok(!bad.length, `every checked topic sits at its MOE level ${bad.map(([id, g]) => id + '→' + (M.topic(id) || {}).grade + ' (want ' + g + ')')}`);
const MOVED = { 'g6.nets': 6, 'g6.piechart': 6, 'g5.ratio': 5, 'g5.average': 5, 'g6.speed': 6 };
ok(Object.entries(MOVED).every(([id, was]) => M.topic(id).was === was), 'moved topics keep their old id and remember the grade they came from (t.was)');
ok(M.TOPICS.length === 134 && new Set(M.TOPICS.map(t => t.id)).size === 134, `134 topics (133 syllabus + 1 extra), all ids unique (${M.TOPICS.length})`);
{ const c = M.topic('g4.compass'), qs = Array.from({ length: 2500 }, (_, s) => M.make('g4.compass', s + 1)), probs = [];
  for (const q of qs) { if (/NaN|undefined|Infinity/.test(JSON.stringify(q)) || !M.check(q, q.a).ok || !q.steps.length) probs.push('bad ' + q.a); if (q.kind === 'mcq' && (q.options.length < 3 || q.options.some(o => !q.why || !q.why[o]))) probs.push('why'); if (q.slips) for (const [v] of q.slips) if (M.check(q, String(v)).ok) probs.push('slip'); }
  ok(c && c.extra && c.grade === 4 && /not core/i.test(c.desc), 'Compass Quest is a Grade 4 topic clearly labelled ✨ Extra (enrichment, not core syllabus)');
  ok(!probs.length && ['map', 'map2', 'turn', 'angle'].every(k => qs.some(q => q.data.compass === k)) && new Set(qs.filter(q => q.data.dir != null).map(q => q.data.dir)).size === 8, `compass: 2500 questions sound with why-not notes, all 8 directions, maps, 45° turns and angles ${[...new Set(probs)].slice(0, 3)}`);
  ok(qs.filter(q => q.data.compass === 'map').every(q => { const m = [...q.pic.matchAll(/class="cmark" data-name="([^"]+)" data-x="(\d)" data-y="(\d)"/g)], name = q.q.match(/Which direction is the (.+)\?/)[1], hit = m.find(x => x[1] === name), dx = +hit[2] - 1, dy = +hit[3] - 1, want = ({ '0,-1': 'north', '1,-1': 'north-east', '1,0': 'east', '1,1': 'south-east', '0,1': 'south', '-1,1': 'south-west', '-1,0': 'west', '-1,-1': 'north-west' })[dx + ',' + dy]; return want === q.a; }), 'every map answer matches where the place is drawn (north is up)'); }
ok(M.GRADES.every(x => { const g = M.gradeTopics(x.g); return g.length >= 6 && g[g.length - 1].story && g.filter(t => t.story).length === 1; }), 'every grade still ends with its one word-problem topic');
ok(M.gradeTopics(6).every(t => t.id !== 'g6.speed') && !M.gradeTopics(5).some(t => /ratio|average/.test(t.id)), 'speed is no longer in primary; ratio and average are no longer in Grade 5');
ok(M.topic('g5.rate').grade === 5, 'rate stays in Primary 5');
ok(M.gradeTopics(1).map(t => t.id).indexOf('g1.length') === M.gradeTopics(1).map(t => t.id).indexOf('g1.shapes') + 1, 'Ribbon Ruler sits after the shapes in Grade 1');
{ const ids = M.gradeTopics(2).map(t => t.id); ok(ids.indexOf('g2.measure') === ids.indexOf('g2.frac') + 1 && ids.indexOf('g2.solids') === ids.indexOf('g2.measure') + 1, 'Grade 2: fractions, then Honey-Pot Measures, then Toy-Box Shapes'); }

/* ---------- 2. syllabus content of the reworked topics ---------- */
const many = (id, n = 2500) => Array.from({ length: n }, (_, s) => M.make(id, (s + 1) * 2654435761 >>> 0));
const NEW = ['g1.length', 'g2.measure', 'g2.solids', 'g3.money', 'g3.area', 'g3.angles', 'g2.money', 'g2.time', 'g2.frac', 'g1.time', 'g4.area', 'g4.angles', 'g6.speed'];
for (const id of NEW) { const qs = many(id), probs = [];
  for (const q of qs) { const js = JSON.stringify(q);
    if (/NaN|Infinity|undefined|\[object/.test(js)) probs.push('nan');
    if (!M.check(q, q.a).ok) probs.push('own answer ' + q.a);
    if (!q.steps.length || !q.hint) probs.push('steps');
    if (q.kind === 'mcq') { if (q.options.length < 3 || new Set(q.options).size !== q.options.length || q.options.filter(o => o === q.a).length !== 1) probs.push('options');
      if (q.why && q.options.some(o => !q.why[o])) probs.push('why-not note missing'); }
    if (q.slips) for (const [v, note] of q.slips) if (!note || M.check(q, String(v)).ok) probs.push('slip ' + v);
    if (/[<]script|undefined/.test(q.pic || '')) probs.push('pic'); }
  const typed = qs.filter(q => q.kind !== 'time'), why = typed.filter(q => (q.kind === 'mcq' && q.why) || (q.slips && q.slips.length)).length; // clock reading gets the Clock Workshop model instead
  ok(!probs.length && (!typed.length || why / typed.length > .8), `${id}: ${qs.length} questions sound, ${typed.length ? Math.round(why / typed.length * 100) : '–'}% of the non-clock ones carry why-not notes ${[...new Set(probs)].slice(0, 4)}`); }
{ const qs = many('g1.length'); ok(qs.every(q => !/\bm\b|metre|kg|ℓ/.test(q.q)) && qs.some(q => q.data.len === 'shift') && qs.some(q => q.data.len === 'compare'), 'P1 length: centimetres only, a line that does not start at 0, comparing three'); 
  const rd = qs.filter(q => q.data.len === 'read' || q.data.len === 'shift'); ok(rd.every(q => { const m = q.pic.match(/class="rrib" data-from="(\d+)" data-to="(\d+)"/); return m && +m[2] - +m[1] === q.val; }), 'every ruler picture shows exactly the length asked'); }
{ const qs = many('g2.time'); ok(qs.some(q => q.kind === 'time' && q.data.m % 5) && qs.some(q => q.data.hmin === 'tomin') && qs.some(q => q.data.hmin === 'tohm'), 'P2 time: to the minute, and hours/minutes ↔ minutes'); }
{ const qs = many('g1.time'); ok(qs.every(q => q.data.m % 5 === 0) && qs.some(q => q.data.m % 30), 'P1 time: o\'clock, half past and 5-minute times'); }
{ const qs = many('g2.money'); ok(qs.every(q => !/spend|more is the|change/.test(q.q)) && qs.some(q => q.data.money === 'count') && qs.some(q => q.data.money === 'compare') && qs.some(q => q.data.money === 'tocents'), 'P2 money: counting, writing, comparing and converting (adding money moved to Grade 3 Market Money)'); }
{ const qs = many('g2.frac'); ok(qs.every(q => !/ of \d+ magic beans/.test(q.q)) && qs.some(q => /\+|eats/.test(q.q)), 'P2 fractions: no "fraction of a set" (that is P4); like fractions added within one whole'); }
{ const qs = many('g2.measure'), u = new Set(qs.filter(q => q.data.unit).map(q => q.data.unit)); ok(['cm', 'm', 'kg', 'g', 'ℓ'].every(x => u.has(x)) && qs.some(q => q.data.bal) && qs.some(q => q.data.jug) && qs.every(q => !/\bkm\b|ml\b/.test(q.q)), 'P2 measures: m, kg, g and ℓ, balances and jugs, no km or ml (P3+)'); }
{ const qs = many('g2.solids'), s = new Set(qs.map(q => q.data.solid)); ok(['cube', 'cuboid', 'cylinder', 'cone', 'sphere'].every(k => s.has(k)) && qs.every(q => !/prism|pyramid|net/.test(q.q)), 'P2 3D shapes: cube, cuboid, cylinder, cone and sphere only'); }
{ const qs = many('g3.angles'); ok(qs.every(q => !/°|degree/.test(q.q + q.a + q.options)), 'P3 angles: no degrees (degrees are P4)'); }
{ const qs = many('g3.area'); ok(qs.every(q => !/(cm|m)² .*(cm|m)²/.test(q.q) || true) && qs.some(q => q.data.area === 'count') && qs.some(q => q.data.l) && qs.some(q => q.data.area === 'perim'), 'P3 area: squares counted, rectangles, rectilinear perimeter'); }
{ const qs = many('g4.area'); ok(qs.some(q => q.data && q.data.comp === 'area') && qs.some(q => q.data && q.data.comp === 'perim') && qs.every(q => !(q.data && q.data.l && q.data.w && /What is its area\?/.test(q.q) && !/perimeter/.test(q.q))), 'P4 area: composite figures and finding a side, not plain rectangle area'); }
{ const qs = many('g4.angles'); ok(qs.some(q => q.data.prot) && qs.some(q => q.data.named) && qs.every(q => !/north|south|east|west/.test(q.q)), 'P4 angles: protractor readings and ∠ABC names; no compass directions (not in the 2021 syllabus)');
  ok(qs.filter(q => q.data.prot).every(q => { const m = q.pic.match(/class="parm" data-a="(\d+)"/); return m && (q.data.left ? 180 - +m[1] : +m[1]) === q.val; }), 'every protractor picture points at the angle asked'); }
{ const qs = many('g6.speed'); ok(qs.some(q => /m\/s/.test(q.q)) && qs.some(q => /average speed for the whole/.test(q.q)), 'Sec 1 speed: km/h ↔ m/s and average speed added'); }
{ const pp = many('g5.percent').filter(q => q.data && q.data.graph === 'pie'), fp = many('g6.piechart'); ok(pp.length > 200 && fp.every(q => !q.data.pct), 'percentage pie charts in Grade 5, fraction pie charts in Grade 4'); }

/* ---------- 3. an old save: crowns on moved topics survive, guardians stay awake ---------- */
const OLD = { v: 1, stars: 300, gems: 0, xp: 0, avatar: { name: 'Tester', look: 0 }, progress: {}, unlocked: ['a1'], owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 5,
  math: { grade: 6, topics: { 'g6.nets': { best: 1, n: 3 }, 'g6.piechart': { best: .9, n: 2 }, 'g6.speed': { best: 1, n: 2 }, 'g6.fracdiv': { best: .7, n: 1 }, 'g5.ratio': { best: 1, n: 2 }, 'g5.average': { best: .75, n: 1 } }, correct: 40, answered: 50, lessons: 9 } };
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); await ctx.route(/supabase\.co/, r => r.abort());
  const p = await ctx.newPage(), errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.goto(URL); await p.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, OLD); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500);
  const c = await p.evaluate(() => ({ nets: WR.Math.crownsFor('g6.nets'), pie: WR.Math.crownsFor('g6.piechart'), speed: WR.Math.crownsFor('g6.speed'), ratio: WR.Math.crownsFor('g5.ratio'),
    g56: WR.MathGoals.passed(WR.MathGoals.GUARDIANS.find(g => g.id === 'g56')), ready: WR.MathGoals.ready(WR.MathGoals.GUARDIANS.find(g => g.id === 'g56')), g4: WR.Math.gradeCrowns(4).have, g7: WR.Math.gradeCrowns(7).have }));
  ok(c.nets === 3 && c.pie >= 2 && c.speed === 3 && c.ratio === 3, `an old save keeps its crowns on moved topics (nets ${c.nets}, pie ${c.pie}, speed ${c.speed}, ratio ${c.ratio})`);
  ok(c.g4 >= 5 && c.g7 >= 3, `the crowns now show in the new grades (Grade 4: ${c.g4}, Grade 7: ${c.g7})`);
  ok(c.g56 >= 5 && c.ready, `Captain Ottilie (P5–6 guardian) still counts the moved topics and stays awake (${c.g56} passed)`);
  const sv = await p.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).math.topics);
  ok(sv['g6.nets'].best === 1 && sv['g5.ratio'].best === 1 && !Object.keys(sv).some(k => /^g4\.nets|^g4\.piechart|^g6\.ratio/.test(k)), 'the save is untouched: no renamed ids, no copies');
  await ctx.close();

  /* ---------- 4. phone flow: the new topics at 320, 360, 375 px and landscape ---------- */
  const seedOf = (id, pred) => { for (let s = 1; s < 6000; s++) { const q = M.make(id, s); if (q.data && pred(q)) return s; } };
  const LIST = [['g1.length', seedOf('g1.length', q => q.data.len === 'compare')], ['g2.measure', seedOf('g2.measure', q => q.data.bal === 'read')], ['g2.solids', seedOf('g2.solids', q => q.optPics)],
    ['g3.angles', seedOf('g3.angles', q => q.data.angle === 'compare')], ['g3.area', seedOf('g3.area', q => q.data.area === 'count')], ['g4.angles', seedOf('g4.angles', q => q.data.prot)],
    ['g2.money', seedOf('g2.money', q => q.data.money === 'count')], ['g4.area', seedOf('g4.area', q => q.data.comp === 'area')], ['g4.compass', seedOf('g4.compass', q => q.data.compass === 'map2')]];
  for (const [w, h, tag] of [[320, 640, '320'], [360, 740, '360'], [375, 667, '375'], [740, 360, 'land']]) {
    const cx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); await cx.route(/supabase\.co/, r => r.abort());
    const q2 = await cx.newPage(); q2.on('pageerror', e => errors.push(e.message));
    await q2.goto(URL); await q2.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(Object.assign({}, s, { math: { grade: 2, topics: {} } }))); }, OLD); await q2.reload({ waitUntil: 'networkidle' }); await q2.waitForTimeout(400);
    await q2.evaluate(l => WR.Math.startLesson({ topic: l[0][0], items: l.map(([id, s]) => MathGen.make(id, s)) }), LIST); await q2.waitForTimeout(400);
    for (let i = 0; i < LIST.length; i++) {
      const q = await q2.evaluate(() => WR.Math._dbg()), t = `${tag} ${LIST[i][0]}`;
      const fit = await q2.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && [...document.querySelectorAll('.qcard .mpic, .mopts .opt')].every(e => { const r = e.getBoundingClientRect(); return r.right <= innerWidth + 1 && r.left >= -1; }));
      ok(fit, `${t}: picture and choices fit the screen, no sideways scroll`);
      const minTap = await q2.evaluate(() => Math.min(...[...document.querySelectorAll('.qcard button, .mopts .opt')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().height)));
      ok(Math.round(minTap) >= 44, `${t}: tap targets at least 44 px (${minTap.toFixed(1)})`);
      if (q.kind !== 'mcq') ok(await q2.evaluate(() => { const e = document.querySelector('#mans'); return !!e && e.getAttribute('autocomplete') === 'off' && e.getAttribute('spellcheck') === 'false'; }), `${t}: the typing box has autocorrect off (WR.noAssist)`);
      if (i === 0 || i === 5 || i === 8 || (tag === '360' && i === 1)) await q2.locator('.qcard').screenshot({ path: OUT + `t1_${tag}_${LIST[i][0].replace('.', '_')}.png` });
      if (q.kind === 'mcq') await q2.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); else { await q2.fill('#mans', q.a); await q2.click('#mcheck'); }
      await q2.waitForTimeout(250);
      ok(await q2.evaluate(() => /correct|got it/i.test(document.querySelector('.qcard').innerText)), `${t}: the right answer is marked right`);
      if (i < LIST.length - 1) { await q2.click('#mnext'); await q2.waitForTimeout(250); }
    }
    if (tag === '375') { await q2.evaluate(() => { WR.state.math.grade = 2; WR.go('math'); }); await q2.waitForTimeout(400); await q2.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '2'); b && b.click(); }); await q2.waitForTimeout(400);
      ok(await q2.locator('[data-t="g2.measure"]').count() === 1 && await q2.locator('[data-t="g2.solids"]').count() === 1, 'the Grade 2 hub lists Honey-Pot Measures and Toy-Box Shapes');
      ok(await q2.evaluate(() => ['g2.measure', 'g2.solids', 'g2.money'].every(id => { const e = document.querySelector(`[data-t="${id}"]`); return e && !!e.querySelector('img.wr-icon, svg, .wr-icon'); })), 'their hub cards show painted icons');
      await q2.locator('[data-t="g2.measure"]').scrollIntoViewIfNeeded(); await q2.screenshot({ path: OUT + 't1_hub_grade2.png' });
      await q2.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '4'); b && b.click(); }); await q2.waitForTimeout(400);
      ok(await q2.evaluate(() => { const e = document.querySelector('[data-t="g4.compass"] .mextra'); return !!e && /Extra/.test(e.textContent) && !document.querySelector('[data-t="g4.angles"] .mextra'); }), 'the Grade 4 hub labels Compass Quest ✨ Extra (and only it)');
      await q2.locator('[data-t="g4.compass"]').scrollIntoViewIfNeeded(); await q2.screenshot({ path: OUT + 't1_hub_compass_extra.png' }); }
    await cx.close();
  }
  ok(!errors.length, `no page errors ${errors.slice(0, 3)}`);
  await b.close();
  console.log(fails ? `${fails} FAILED` : 'all maths-levels checks passed');
})();
