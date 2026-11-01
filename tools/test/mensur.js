// 🎂 Bakery Blueprints: MOE Sec 1 mensuration (area of parallelograms and trapeziums, a height back from the area, composite
// figures, volume and total surface area of triangular prisms, volume and surface area of cylinders, cm² ↔ m², m³ → cm³).
// Node checks read every length back from the drawn SVG labels, check the drawing is to scale, and work every answer out
// again with textbook formulas; every option has a why / why-not note and typed slips get one too. Then a phone flow at
// 375 and 320 px that shows the notes. Run: node tools/test/mensur.js (game served on :18642). Screenshots: screenshots/mensur_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const ID = 'g7.mensur';

/* ---------- 1. generators (Node) ---------- */
const t = M.topic(ID);
ok(t && t.grade === 7 && t.name === 'Bakery Blueprints' && t.icon === '🎂', `🎂 Bakery Blueprints is a Grade 7 topic (${t && t.desc})`);
ok(M.TOPICS.length >= 114, `it is one of ${M.TOPICS.length} maths topics (114 when it was added)`);
{ const g = M.gradeTopics(7).map(x => x.id), i = g.indexOf(ID); ok(g[i - 1] === 'g7.angles' && g[i + 1] === 'g7.pct' && g[g.length - 1] === 'g7.story', 'it sits after Angle Archery (geometry), before Percentage Puzzles: ' + g.join(' ')); }
const labs = svg => [...(svg || '').matchAll(/class="mlab" data-t="([^"]+)"/g)].map(m => m[1]);
const polys = svg => [...(svg || '').matchAll(/<polygon points="([^"]+)"/g)].map(m => m[1].split(' ').map(p => p.split(',').map(Number)));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const n = s => +String(s).replace(/[^\d.]/g, '');
const sameSet = (a, b) => a.length === b.length && a.slice().sort().join('|') === b.slice().sort().join('|');
const close = (a, b, e = 1e-6) => Math.abs(a - b) <= e;
const near = (a, b, rel = .03) => Math.abs(a - b) <= rel * Math.abs(b) + .05; // drawn lengths are rounded to 0.1 px
const area = (v, u) => `${String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${u}²`;
const kinds = {}, bad = [], wrong = [], scale = [], notes = [];
const N = 8000;
for (let s = 1; s <= N; s++) {
  const q = M.make(ID, s * 2654435761 >>> 0), d = q.data, js = JSON.stringify(q), key = d.mens + (d.mens === 'compo' ? '/' + d.k : '');
  kinds[key] = (kinds[key] || 0) + 1;
  if (/NaN|Infinity|undefined|\[object/.test(js) || !M.check(q, q.a).ok || !q.hint || !q.steps.length || !/^[A-Z]/.test(q.q)) bad.push(q.q);
  if (/\p{Extended_Pictographic}/u.test(q.q + q.steps.join('') + q.hint + JSON.stringify(q.why || q.slips || ''))) bad.push('emoji in text');
  if (q.steps.some(x => /[\t\f\v]/.test(x))) bad.push('control character in steps (a lost backslash)');
  // notes: every option has one; the right one restates the answer in other words; typed slips each have a note and are never right
  if (q.kind === 'mcq') {
    if (q.options.length !== 4 || new Set(q.options).size !== 4 || q.options.filter(o => o === q.a).length !== 1) bad.push('options ' + q.options.join(' ; '));
    if (!q.why || q.options.some(o => !q.why[o] || q.why[o].length < 20 || M.whyNote(q, o) !== q.why[o])) notes.push('mcq note missing');
    const num = (q.a.match(/[\d ]+(\.\d+)?/) || [''])[0].replace(/ /g, '').trim(); if (!q.why[q.a].replace(/ /g, '').includes(num)) notes.push('right note does not give the answer ' + q.a);
    if (q.options.filter(o => o !== q.a).some(o => q.why[o] === q.why[q.a])) notes.push('a why-not note equals the right note');
  } else {
    if (!q.slips || q.slips.length < 2) notes.push('typed question with fewer than 2 slips: ' + key);
    else { if (q.slips.some(([v, txt]) => M.check(q, String(v)).ok || !txt || M.whyNote(q, String(v)) !== txt)) notes.push('slip is right or has no note');
      if (M.whyNote(q, q.a)) notes.push('the right answer got a why-not note'); }
  }
  const L = labs(q.pic), P = polys(q.pic);
  if (d.mens === 'para' || d.mens === 'trap' || d.mens === 'rev') {
    const a = d.mens === 'para' || (d.mens === 'rev' && d.para) ? d.b : d.a, b = d.b, u = (L.find(x => x !== 'h') || '').split(' ')[1];
    if (d.mens === 'rev') { const A = +q.q.match(/area of (\d+)/)[1];
      if (!sameSet(L, (d.para ? [`${b} ${u}`] : [`${b} ${u}`, `${a} ${u}`]).concat('h'))) wrong.push('rev labels (the height must be the unknown h) ' + L);
      if (q.val !== 2 * A / (a + b) || q.val !== d.h) wrong.push('rev answer'); }
    else {
      const want = { para: [`${b} ${u}`, `${d.h} ${u}`, `${d.l} ${u}`], trap: [`${b} ${u}`, `${a} ${u}`, `${d.h} ${u}`, `${d.l} ${u}`] }[d.mens];
      if (!sameSet(L, want)) wrong.push(d.mens + ' labels ' + L);
      if (d.s * d.s + d.h * d.h !== d.l * d.l) wrong.push('slant side is not a whole-number right triangle');
      if (q.a !== area((a + b) * d.h / 2, u)) wrong.push(d.mens + ' answer ' + q.a); }
    // to scale: bottom : top : height : slant drawn in the same ratio as the numbers
    const [A, B, C, D] = P[0], k = dist(A, B) / b; if (!near(dist(D, C) / a, k) || !near((A[1] - D[1]) / d.h, k) || !near(dist(A, D) / Math.hypot(d.s, d.h), k)) scale.push(d.mens + ' ' + JSON.stringify(d));
  }
  if (d.mens === 'compo') {
    if (d.k === 'house') { if (!sameSet(L, [`${d.w} cm`, `${d.hr} cm`, `${d.ht} cm`]) || q.val !== d.w * d.hr + d.w * d.ht / 2) wrong.push('house');
      const [R, Tr] = P, k = dist(R[0], R[1]) / d.w; if (!near(dist(R[1], R[2]) / d.hr, k) || !near((Tr[0][1] - Tr[2][1]) / d.ht, k)) scale.push('house'); }
    else { if (!sameSet(L, [`${d.w} dm`, `${d.hr} dm`]) || Math.abs(q.val - (d.w * d.hr + 3.142 * (d.w / 2) ** 2 / 2)) > 0.0501) wrong.push('arch');
      const R = P[0], k = dist(R[0], R[1]) / d.w, arc = +q.pic.match(/ A([\d.]+),/)[1]; if (!near(dist(R[1], R[2]) / d.hr, k) || !near(arc / (d.w / 2), k)) scale.push('arch'); }
  }
  if (d.mens === 'prismV' || d.mens === 'prismSA') { const u = d.tent ? 'm' : 'cm', want = [`${d.b} ${u}`, `${d.h} ${u}`, `${d.L} ${u}`].concat(d.tent || d.mens === 'prismSA' ? [`${d.l} ${u}`] : []);
    if (!sameSet(L, want)) wrong.push('prism labels ' + L + ' vs ' + want);
    const half = d.tent ? d.b / 2 : d.b; if (half * half + d.h * d.h !== d.l * d.l) wrong.push('prism sides');
    const tri = d.b * d.h / 2, per = d.tent ? d.b + 2 * d.l : d.b + d.h + d.l;
    if (d.mens === 'prismV' ? q.val !== tri * d.L : q.a !== area(2 * tri + per * d.L, u)) wrong.push(d.mens + ' answer');
    const front = P[1], k = dist(front[0], front[1]) / d.b; if (!near((front[0][1] - front[2][1]) / d.h, k)) scale.push('prism'); }
  if (d.mens === 'cylV') { if (!sameSet(L, d.useD ? [`${2 * d.r} cm`, `${d.h} cm`] : [`${d.r} cm`, `${d.h} cm`])) wrong.push('cyl labels');
    if (Math.abs(q.val - 3.142 * d.r * d.r * d.h) > 0.0501 || String(q.val).split('.')[1]?.length > 1) wrong.push('cylV answer'); }
  if (d.mens === 'cylSA') { if (!sameSet(L, [`${d.r} cm`, `${d.h} cm`])) wrong.push('cyl labels');
    const k = +q.a.match(/\$(\d+)\\pi\$/)[1]; if (k !== (d.label ? 2 * d.r * d.h : 2 * d.r * d.r + 2 * d.r * d.h)) wrong.push('cylSA answer'); }
  if (d.mens === 'cylV' || d.mens === 'cylSA') { const e = q.pic.match(/<ellipse [^>]*rx="([\d.]+)"/), side = q.pic.match(/<path d="M[\d.]+,([\d.]+) L[\d.]+,([\d.]+)/);
    if (!e || !side || !near((+side[2] - +side[1]) / d.h, +e[1] / d.r)) scale.push('cylinder'); }
  if (d.mens === 'units') { const f = { m2: 1e4, cm2: 1e-4, m3: 1e6 }[d.k], from = n(q.q.match(/([\d ]+(\.\d+)?) (m|cm)[²³]/)[1].replace(/ /g, '')), to = n(q.a.replace(/ /g, ''));
    if (!close(to, from * f, 1e-6 * Math.max(1, to))) wrong.push('units ' + q.q + ' → ' + q.a); }
}
ok(!bad.length, `${N.toLocaleString()} Bakery Blueprints questions pass the checker, start with a capital, have a hint and worked steps, no emoji, and multiple choice has 4 different options ${bad.slice(0, 3)}`);
ok(!notes.length, `every option has a why / why-not note, the right one restates the answer, and typed questions name their usual slips ${[...new Set(notes)].slice(0, 3)}`);
ok(!wrong.length, `every answer is worked out again from the lengths printed on the drawing (whole-number slanted sides) ${[...new Set(wrong)].slice(0, 4)}`);
ok(!scale.length, `every figure is drawn to scale: sides, heights, arcs and cylinder lids in the same ratio as their numbers ${[...new Set(scale)].slice(0, 4)}`);
ok(['para', 'trap', 'rev', 'compo/house', 'compo/arch', 'prismV', 'prismSA', 'cylV', 'cylSA', 'units'].every(k => kinds[k] > 250), 'all question types appear: ' + JSON.stringify(kinds));
{ const qs = Array.from({ length: 3000 }, (_, s) => M.make(ID, s + 1));
  ok(qs.filter(q => q.data.mens === 'para').every(q => q.options.some(o => q.why[o].includes('slanted side'))), 'parallelogram choices include the classic slip "base × slanted side", with its why-not note');
  ok(qs.filter(q => q.data.mens === 'cylV' && q.data.useD).every(q => q.slips.some(s => /diameter/.test(s[1]))), 'cylinder volume given a diameter names the "forgot to halve" slip');
  ok(qs.every(q => !/minister|politic|election|war\b|kill|blood|weapon/i.test(q.q)), 'kid themes only');
  ok(qs.filter(q => q.pic).every(q => q.uid && /^mens\|/.test(q.uid)), 'picture questions carry a uid (anti-farm)');
  ok(qs.filter(q => q.pic).length > 2500, 'nearly every question has a drawn pastel figure'); }
ok([1, 2, 3, 99].every(s => { const r = M.batch(ID, 8, s); return r.length === 8 && new Set(r.map(q => q.uid || q.q + q.a)).size === 8; }), 'a lesson of 8 has no repeated question');
{ const q = { kind: 'num', tol: 1e-9, slips: [[12, 'forgot ½']] }; ok(M.whyNote(q, '12') === 'forgot ½' && M.whyNote(q, '12 cm²') === 'forgot ½' && M.whyNote(q, '13') === '' && M.whyNote({ kind: 'num', tol: 1e-9 }, '5') === '', 'MathGen.whyNote finds a typed slip (units allowed) and stays quiet otherwise'); }

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
    const list = [seed(q => D(q).mens === 'trap'), seed(q => D(q).mens === 'prismV' && D(q).tent), seed(q => D(q).mens === 'cylSA' && !D(q).label), seed(q => D(q).mens === 'compo' && D(q).k === 'arch'),
      seed(q => D(q).mens === 'para'), seed(q => D(q).mens === 'cylV' && D(q).useD), seed(q => D(q).mens === 'prismSA' && !D(q).tent), seed(q => D(q).mens === 'units')];
    ok(list.every(Number.isInteger), `${w}px: a seed was found for every kind of question`);
    await p.evaluate(l => WR.Math.startLesson({ topic: 'g7.mensur', items: l.map(s => MathGen.make('g7.mensur', s)) }), list);
    await p.waitForTimeout(500);
    for (let i = 0; i < list.length; i++) {
      const q = await p.evaluate(() => WR.Math._dbg()), tag = `${w}px ${q.data.mens}${q.data.k ? '/' + q.data.k : ''}`;
      ok(await fits(p), `${tag}: the picture and the choices fit the screen with no sideways scroll`);
      const taps = await p.evaluate(() => Math.min(...[...document.querySelectorAll('.mopts .opt, #mcheck, .numpad button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().height)));
      ok(taps >= 40, `${tag}: answer buttons are easy to tap (${Math.round(taps)} px)`);
      if (q.pic) ok(await p.locator('.qcard svg .mlab').count() >= 2, `${tag}: the figure is drawn with its lengths labelled`);
      if (i < 4) { // a wrong answer first: its own why-not note; then the right one: the note that says why it works
        if (q.kind === 'mcq') { const wk = q.options.findIndex(o => o !== q.a); await p.locator(`.mopts .opt[data-k="${wk}"]`).click(); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.why[q.options[wk]].slice(0, 30))), `${tag}: a wrong pick shows its own why-not note`);
          if (w === 375 && i === 2) await p.locator('.qcard').screenshot({ path: OUT + 'mensur_02_why_not.png' });
          await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); await p.waitForTimeout(300);
          ok((await whyText(p)).some(x => x.includes(q.why[q.a].slice(0, 30))), `${tag}: the right answer shows why it works, in other words`);
        } else { await p.fill('#mans', String(q.slips[0][0])); await p.click('#mcheck'); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.slips[0][1].slice(0, 30))), `${tag}: typing the usual slip (${q.slips[0][0]}) shows its why-not note`);
          if (w === 375 && i === 1) await p.locator('.qcard').screenshot({ path: OUT + 'mensur_01_slip_note.png' });
          await p.fill('#mans', q.a); await p.click('#mcheck'); await p.waitForTimeout(300); }
      } else {
        if (w === 375 && i === 4) await p.locator('.qcard').screenshot({ path: OUT + 'mensur_03_parallelogram.png' });
        if (q.kind === 'mcq') await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); else { await p.fill('#mans', q.a); await p.click('#mcheck'); }
        await p.waitForTimeout(300);
      }
      ok(await p.evaluate(() => /correct|got it/i.test(document.querySelector('.qcard').innerText)), `${tag}: the right answer is marked right`);
      if (w === 375 && i === 3) await p.locator('.qcard').screenshot({ path: OUT + 'mensur_04_castle_door_answer.png' });
      if (i < list.length - 1) { await p.click('#mnext'); await p.waitForTimeout(300); }
    }
    const m = await p.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).math);
    ok(m && m.correct >= list.length && m.answered >= list.length, `${w}px: answers are saved in wordRealms.save.v1 (math.correct ${m && m.correct}, answered ${m && m.answered})`);
    if (w === 375) {
      const st = await p.evaluate(s => { const q = MathGen.make('g7.mensur', s), k = q.uid || 'g7.mensur|' + q.q; const a = WR.awardStars('m', k + '|t', 1), b = WR.awardStars('m', k + '|t', 1); return [a, b]; }, list[1]).catch(() => null);
      ok(st && st[0] >= 1 && st[1] < st[0], `a replayed question pays less than the first time (${st})`);
      await p.evaluate(() => WR.go('math')); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '7'); b && b.click(); }); await p.waitForTimeout(400);
      ok(await p.locator('[data-t="g7.mensur"]').count() === 1, 'the Grade 7 hub lists Bakery Blueprints');
      ok(await p.evaluate(() => { const e = document.querySelector('[data-t="g7.mensur"]'); return !/\p{Extended_Pictographic}/u.test(e.innerText) && !!e.querySelector('img.wr-icon'); }), 'its hub card shows the painted cake icon, not an emoji');
      await p.locator('[data-t="g7.mensur"]').scrollIntoViewIfNeeded(); await p.screenshot({ path: OUT + 'mensur_05_hub_grade7.png' });
    }
    ok(!errors.length, `${w}px: no page errors ${errors.slice(0, 2)}`);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall Bakery Blueprints checks passed');
})();
