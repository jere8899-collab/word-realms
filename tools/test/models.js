// 🧮 Model Magic: Singapore-style picture models for Grades 1–6 (number lines, ten frames, bar models, arrays,
// sharing groups with "deal one each", base-ten blocks, fraction bars, area/perimeter grids).
// Node checks on every spec, then a phone + desktop flow. Run: node tools/test/models.js (game served on :18642)
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const V = require(ROOT + '/js/math-viz.js');

/* ---------- 1. specs (Node) ---------- */
const cov = {}, types = new Set(), bad = [], leak = [], noReveal = [], noTip = [];
const labels = svg => [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(m => m[1].replace(/&amp;/g, '&'));
for (const t of M.TOPICS.filter(t => t.grade <= 6)) for (let s = 1; s <= 300; s++) {
  const q = M.make(t.id, s * 7919 >>> 0), sp = V.spec(q); if (!sp || sp.type === 'balance' || sp.type === 'clock') continue;   // ⚖️ and 🕰️ tools have their own suites (balance.js, clock.js)
  cov[t.id] = (cov[t.id] || 0) + 1; types.add(sp.type);
  const a = V.svg(sp), r = V.svg(sp, { reveal: true });
  if (!a.startsWith('<svg') || !r.startsWith('<svg') || /NaN|undefined|Infinity|\[object/.test(a + r)) bad.push(t.id + ' ' + JSON.stringify(sp).slice(0, 90));
  if (!sp.tip) noTip.push(t.id);
  // the unrevealed model must show a "?" and never print the answer as its own label
  const ans = String(q.a).replace(/^\$/, ''), la = labels(a);
  if (!la.some(x => /\?/.test(x)) && !(sp.type === 'blocks' || sp.type === 'grid' && !sp.lq && !sp.wq && /\?/.test(sp.note || '')) && sp.type !== 'groups') leak.push(t.id + ' no ?');
  if (sp.type !== 'blocks' && sp.type !== 'numberline' && la.some(x => x === ans || x === `= ${ans}` || x === `${ans} cups`)) {
    // allowed only when that number is also given in the question text (e.g. 10 + 10)
    if (!new RegExp(`(^|[^0-9.])${ans.replace(/[.$]/g, '\\$&')}([^0-9.]|$)`).test(q.q.replace(/\$/g, ''))) leak.push(t.id + ' shows ' + ans);
  }
  if (ans !== '0' && sp.type !== 'blocks' && sp.type !== 'grid' && !labels(r).some(x => x.includes(sp.type === 'groups' ? `${sp.s} in each` : ans.replace(/^\$/, '')))) noReveal.push(t.id + ' ' + ans);
}
ok(!bad.length, `${Object.values(cov).reduce((a, b) => a + b, 0)} models from ${Object.keys(cov).length} Grade 1–6 topics draw cleanly ${bad.slice(0, 3)}`);
ok(Object.keys(cov).length >= 24 && [1, 2, 3, 4, 5, 6].every(g => Object.keys(cov).some(k => k.startsWith(`g${g}.`))), `every primary grade has models (${Object.keys(cov).join(' ')})`);
ok(V.TYPES.filter(t => t !== 'balance' && t !== 'clock').every(t => types.has(t)), `all 8 picture-model types are used (${[...types].join(', ')})`);
ok(!noTip.length, `every model has a "how to read it" tip ${[...new Set(noTip)]}`);
ok(!leak.length, `unrevealed models show "?" and never give the answer away ${[...new Set(leak)].slice(0, 6)}`);
ok(!noReveal.length, `the revealed model shows the answer ${[...new Set(noReveal)].slice(0, 6)}`);
const BAL = ['g6.algebra', 'g7.lineq', 'g7.story', 'g8.fraceq', 'g8.story'];   // ⚖️ balance scales (tools/test/balance.js)
ok(M.TOPICS.filter(t => t.grade >= 7 && !BAL.includes(t.id)).every(t => !V.spec(M.make(t.id, 5))), 'secondary/JC questions have no primary picture model (only the ⚖️ equation balances)');
// specific shapes
{ const q = M.make('g1.add20', 1); const sp = V.spec(Object.assign({}, q, { data: { a: 8, b: 5 } })); const svg = V.svg(sp);
  ok(sp.type === 'tenframe' && (svg.match(/<circle/g) || []).length === 13 && /8 pink \+ 5 green = \?/.test(svg), '8 + 5 shows 13 counters in ten frames and "= ?"'); }
{ const sp = V.spec({ topic: 'g1.sub20', data: { a: 13, b: 5 } }); ok(sp.hops.join() === '-3,-2' && sp.start === 13, '13 − 5 hops back to 10 first (−3, −2)'); }
{ const sp = V.spec({ topic: 'g2.add', data: { a: 47, b: 26, op: '+' } }); ok(sp.hops.join() === '20,6' && sp.lo === 40 && sp.hi === 80, '47 + 26 jumps +20 then +6 on a 40–80 line'); }
{ const sp = V.spec({ topic: 'g3.divrem', data: { n: 23, d: 4 } }), g0 = V.svg(sp, { dealt: 0 }), g5 = V.svg(sp, { dealt: 5 });
  ok(/23 still to share/.test(g0) && /3 left over/.test(g5) && /4 groups · 5 in each/.test(g5), '23 ÷ 4: all 23 start in the pile; dealing 5 rounds leaves 3 left over'); }
{ const sp = V.spec({ topic: 'g6.share', data: { a: 2, b: 3, tot: 40, who: true } }), s = V.svg(sp), r = V.svg(sp, { reveal: 1 });
  ok(/>40</.test(s) && /Hansel/.test(s) && /Gretel/.test(s) && labels(r).includes('16') && !labels(s).includes('16'), 'ratio 2 : 3 of 40: unit bars, total 40, Hansel "?" reveals 16'); }

/* ---------- 2. browser ---------- */
const SAVE = { v: 1, name: 'Jeremy', avatar: 'avatar_mage', startLevel: 'a1', stars: 100, totalCorrect: 40, totalAnswered: 50,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 420, happiness: 82, hunger: 35, skin: null, lastTick: Date.now() }, streak: { count: 4, last: null }, progress: {},
  owned: [], equipped: { outfit: null, petskin: null, theme: null }, settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 5 };
const saved = page => page.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')));
async function open(b, phone) {
  const ctx = await b.newContext(phone ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1200, height: 860 } });
  const page = await ctx.newPage(); page.errors = [];
  page.on('pageerror', e => page.errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/font|ERR_|net::|Failed to load resource/.test(m.text())) page.errors.push(m.text()); });
  await page.goto(URL); await page.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE);
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(400);
  return page;
}
// start a lesson made of specific generated questions
const lesson = (page, list) => page.evaluate(list => { const items = list.map(([t, s]) => MathGen.make(t, s)); WR.Math.startLesson({ topic: list[0][0], items }); }, list);
const seedFor = (topic, pred) => { for (let s = 1; s < 5000; s++) { const q = M.make(topic, s); if (V.spec(q) && (!pred || pred(q))) return s; } };
const noOverflow = page => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const p = await open(b, true);
  await p.evaluate(() => { WR.ensureDaily(); WR.state.daily.quests[0] = { id: 'model1', progress: 0, claimed: false }; WR.save(); });
  const sDiv = seedFor('g3.divrem', q => q.data.d <= 5 && q.data.n <= 40 && q.data.n / q.data.d >= 4), sBond = seedFor('g1.bonds', q => q.data.p > 2 && q.data.w - q.data.p > 2), sStory = seedFor('g2.story', q => V.spec(q).type === 'bar' && V.spec(q).rows.length === 2);
  const sShare = seedFor('g6.share'), sFr = seedFor('g4.fracadd', q => q.data.d2 <= 10), sNl = seedFor('g2.add', q => q.data.a < 100), sTf = seedFor('g1.add20', q => q.data.a + q.data.b > 10 && Math.max(q.data.a, q.data.b) < 10);
  await lesson(p, [['g3.divrem', sDiv], ['g1.bonds', sBond], ['g2.story', sStory], ['g6.share', sShare], ['g4.fracadd', sFr], ['g2.add', sNl], ['g1.add20', sTf], ['g3.times', 3]]);
  await p.waitForTimeout(300);
  ok(await p.locator('#vizBtn').count() === 1 && await p.locator('#mviz svg').count() === 0, 'phone: a "🧮 Show a model" button, model hidden until asked');
  await p.click('#vizBtn'); await p.waitForTimeout(300);
  ok(await p.locator('#mviz .mv-groups').count() === 1 && /still to share/.test(await p.textContent('#mviz')), 'phone: the sharing model opens with every counter still in the pile');
  await p.click('#vizDeal'); await p.click('#vizDeal'); await p.waitForTimeout(200);
  ok(/2…? in each|2… in each/.test(await p.textContent('#mviz')), 'phone: "Deal one each" deals a round into every group');
  await p.screenshot({ path: OUT + 'models_01_deal.png' });
  await p.click('#vizDealAll'); await p.waitForTimeout(200);
  ok(/left over/.test(await p.textContent('#mviz')) && await p.locator('#vizDeal').count() === 0, 'phone: dealing them all leaves the remainder on the side');
  ok(await noOverflow(p), 'phone: no horizontal overflow with the model open');
  let q = await p.evaluate(() => WR.Math._dbg());
  await p.fill('#mans', q.a); await p.click('#mcheck'); await p.waitForTimeout(250);
  let st = await saved(p);
  ok(st.math.models === 1 && st.math.modelSolved === 1 && st.daily.quests[0].progress === 1, `save: models used 1, solved with a model 1, Model Magic quest 1/3 (${st.math.models}/${st.math.modelSolved}/${st.daily.quests[0].progress})`);
  ok(await p.locator('#mviz .mviz.reveal').count() === 1, 'phone: after a right answer the model is shown complete');
  await p.click('#mnext'); await p.waitForTimeout(300);
  // bonds: a wrong answer opens the model automatically
  q = await p.evaluate(() => WR.Math._dbg());
  await p.fill('#mans', '99'); await p.click('#mcheck'); await p.waitForTimeout(300);
  ok(await p.locator('#mviz .mv-bar').count() === 1 && /Sumi drew a model/.test(await p.textContent('#mexplain')), 'phone: a first wrong answer opens the part-whole bar model with the hint');
  const tx = await p.textContent('#mviz'); ok(/\?/.test(tx) && !tx.includes('99'), 'phone: the bar model still shows "?" for the missing part');
  await p.screenshot({ path: OUT + 'models_02_bar_hint.png' });
  await p.fill('#mans', '98'); await p.click('#mcheck'); await p.waitForTimeout(300);
  ok(await p.locator('#mviz .mviz.reveal').count() === 1 && (await p.textContent('#mviz')).includes(q.a), 'phone: a second wrong answer shows the finished model with the answer');
  await p.click('#mnext'); await p.waitForTimeout(300);
  const shots = ['03_story', '04_ratio', '05_fractions', '06_numberline', '07_tenframe'];
  for (let i = 0; i < 5; i++) {
    await p.click('#vizBtn'); await p.waitForTimeout(900);
    ok(await p.locator('#mviz svg').count() === 1 && await noOverflow(p), `phone: ${shots[i].slice(3)} model fits the phone screen`);
    await p.locator('.qcard').screenshot({ path: OUT + `models_${shots[i]}.png` });
    q = await p.evaluate(() => WR.Math._dbg()); await p.fill('#mans', q.a); await p.click('#mcheck'); await p.waitForTimeout(250); await p.click('#mnext'); await p.waitForTimeout(300);
  }
  // hide toggle
  await p.click('#vizBtn'); await p.waitForTimeout(100); await p.click('#vizBtn'); await p.waitForTimeout(100);
  ok(await p.locator('#mviz svg').count() === 0, 'phone: the button hides the model again');
  st = await saved(p);
  ok(st.math.models === 8 && st.daily.quests[0].progress === 3, `save: 8 models used and the Model Magic quest is complete (${st.math.models}, ${st.daily.quests[0].progress}/3)`);
  ok(!p.errors.length, 'phone: no console errors ' + p.errors.slice(0, 3));

  /* desktop: secondary maths has no model button; old saves migrate */
  const d = await open(b, false);
  await lesson(d, [['g9.quad', 7]]); await d.waitForTimeout(300);
  ok(await d.locator('#vizBtn').count() === 0, 'desktop: Grade 9 questions have no picture-model button');
  await lesson(d, [['g5.percent', seedFor('g5.percent')]]); await d.waitForTimeout(200); await d.click('#vizBtn'); await d.waitForTimeout(700);
  await d.screenshot({ path: OUT + 'models_08_desktop_percent.png' });
  ok(await d.locator('#mviz .mv-bar').count() === 1, 'desktop: the percentage bar model opens');
  const mig = await d.evaluate(() => { WR.state.math = { grade: 3, topics: {}, facts: {}, dojo: {} }; return WR.Math.st().models === 0 && WR.Math.st().modelSolved === 0; });
  ok(mig, 'save migration: an old maths block gains models = 0 and modelSolved = 0');
  ok(!d.errors.length, 'desktop: no console errors ' + d.errors.slice(0, 3));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall model checks passed');
})();
