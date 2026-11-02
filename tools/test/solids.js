// 🍦 Ice-Cream Cone Café: MOE Sec 2 mensuration of pyramids, cones and spheres (volume of a pyramid; total surface area of a
// square-based pyramid from the slant height; cone volume in terms of π or with π = 3.142; a cone's curved / total surface,
// finding l with Pythagoras; sphere and hemisphere volume; sphere, open-bowl and solid-dome surface areas; composite solids:
// an ice-cream cone with a hemisphere scoop, a castle turret; working back to a height or a radius). Node checks read every
// length back from the drawn SVG labels, check each solid is drawn to scale, and work every answer out again with textbook
// formulas; every option has a why / why-not note and typed slips get one too. Then a phone flow at 375 and 320 px that
// shows the notes. Run: node tools/test/solids.js (game served on :18642). Screenshots: screenshots/solids_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const ID = 'g8.solids';

/* ---------- 1. generators (Node) ---------- */
const t = M.topic(ID);
ok(t && t.grade === 8 && t.name === 'Ice-Cream Cone Café' && t.icon === '🍦', `🍦 Ice-Cream Cone Café is a Grade 8 (Sec 2) topic (${t && t.desc})`);
ok(M.TOPICS.length >= 119, `it is one of ${M.TOPICS.length} maths topics (119 when it was added)`);
{ const g = M.gradeTopics(8).map(x => x.id), i = g.indexOf(ID); ok(g[i - 1] === 'g8.similar' && g[i + 1] === 'g8.gradient' && g[g.length - 1] === 'g8.story', 'it sits after Scale-Model Studio (geometry), before Gradient Hills: ' + g.join(' ')); }
const labs = svg => [...(svg || '').matchAll(/class="mlab" data-t="([^"]+)"/g)].map(m => m[1]);
const polys = svg => [...(svg || '').matchAll(/<polygon points="([^"]+)"/g)].map(m => m[1].split(' ').map(p => p.split(',').map(Number)));
const lines = (svg, cls) => [...(svg || '').matchAll(new RegExp(`<line class="${cls}" x1="([\\d.-]+)" y1="([\\d.-]+)" x2="([\\d.-]+)" y2="([\\d.-]+)"`, 'g'))].map(m => [[+m[1], +m[2]], [+m[3], +m[4]]]);
const body = (svg, cls = 'sbody') => { const m = (svg || '').match(new RegExp(`class="${cls}" d="([^"]+)"`)); return m ? [...m[1].matchAll(/-?[\d.]+/g)].map(x => +x[0]) : null; };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const sameSet = (a, b) => a.length === b.length && a.slice().sort().join('|') === b.slice().sort().join('|');
const near = (a, b, rel = .03) => Math.abs(a - b) <= rel * Math.abs(b) + .2; // drawn points are rounded to 0.1 px
const piK = a => { const m = a.match(/^\$(?:\\frac\{(\d+)\}\{(\d+)\}|(\d+))\\pi\$ (cm|m)([²³])$/); return m ? { k: m[3] ? +m[3] : m[1] / m[2], u: m[4], p: m[5] } : null; };
const n = s => +String(s).split(' ')[0];
const kinds = {}, bad = [], wrong = [], scale = [], notes = [];
const N = 8000;
for (let s = 1; s <= N; s++) {
  const q = M.make(ID, s * 2654435761 >>> 0), d = q.data, js = JSON.stringify(q), key = d.sol + (d.k ? '/' + d.k : d.half ? '/half' : d.hat ? '/hat' : d.tent ? '/tent' : d.sq === false ? '/rect' : d.pi ? '/3.142' : '');
  kinds[key] = (kinds[key] || 0) + 1;
  if (/NaN|Infinity|undefined|\[object/.test(js) || !M.check(q, q.a).ok || !q.hint || !q.steps.length || !/^[A-Z]/.test(q.q)) bad.push(q.q);
  if (/\p{Extended_Pictographic}/u.test(q.q + q.steps.join('') + q.hint + JSON.stringify(q.why || q.slips || ''))) bad.push('emoji in text');
  if (q.steps.some(x => /[\t\f\v]/.test(x))) bad.push('control character in steps (a lost backslash)');
  if (/\d\.\d{4,}/.test(q.q + q.options + JSON.stringify(q.why || ''))) bad.push('a long unrounded decimal in ' + key);
  if (q.kind === 'mcq') {
    if (q.options.length !== 4 || new Set(q.options).size !== 4 || q.options.filter(o => o === q.a).length !== 1) bad.push('options ' + key + ' ' + q.options.join(' ; '));
    if (!q.why || q.options.some(o => !q.why[o] || q.why[o].length < 20 || M.whyNote(q, o) !== q.why[o])) notes.push('mcq note missing');
    const num = (q.a.match(/\d+/g) || []); if (!num.every(x => q.why[q.a].replace(/ /g, '').includes(x))) notes.push('right note does not give the answer ' + q.a);
    if (q.options.filter(o => o !== q.a).some(o => q.why[o] === q.why[q.a])) notes.push('a why-not note equals the right note');
  } else {
    if (!q.slips || q.slips.length < 2) notes.push('typed question with fewer than 2 slips: ' + key);
    else { if (q.slips.some(([v, txt]) => M.check(q, String(v)).ok || !txt || M.whyNote(q, String(v)) !== txt)) notes.push('slip is right or has no note');
      if (M.whyNote(q, q.a)) notes.push('the right answer got a why-not note'); }
  }
  const L = labs(q.pic), P = piK(q.a || ''), A = q.kind === 'mcq' ? (P ? P.k : n(q.a)) : q.val;
  const W = (want, got = A, e = 1e-9) => { if (Math.abs(got - want) > e) wrong.push(`${key}: ${got} vs ${want}`); };
  const hidden = lines(q.pic, 'mhid'), vert = hidden.filter(([a, b]) => Math.abs(a[0] - b[0]) < .25).map(([a, b]) => dist(a, b)).sort((x, y) => y - x)[0];
  const radLine = () => { const h = hidden.filter(([a, b]) => Math.abs(a[1] - b[1]) < .25).map(([a, b]) => dist(a, b)); return h.length ? h[0] : null; };
  if (d.sol === 'pyrV' || d.sol === 'pyrSA' || (d.sol === 'rev' && d.k === 'pyr')) {
    const u = d.u || 'cm', want = [`${d.a} ${u}`, d.sol === 'rev' ? 'h' : `${d.h} ${u}`].concat(d.sq === false ? [`${d.d} ${u}`] : d.sol === 'rev' ? [] : [`${d.l} ${u}`]);
    if (!sameSet(L, want)) wrong.push(key + ' labels ' + L + ' vs ' + want);
    if (d.sq !== false && (d.a / 2) ** 2 + d.h ** 2 !== d.l ** 2) wrong.push('slant height is not a whole-number right triangle');
    if (d.sol === 'pyrV') W(d.a * d.d * d.h / 3);
    if (d.sol === 'pyrSA') W((d.tent ? 0 : d.a * d.a) + 4 * d.a * d.l / 2);
    if (d.sol === 'rev') W(3 * d.V / (d.a * d.a));
    const front = polys(q.pic)[1], k = dist(front[0], front[1]) / d.a; if (!vert || !near(vert / d.h, k)) scale.push('pyramid ' + JSON.stringify(d));
  }
  if (d.sol === 'coneV' || d.sol === 'coneSA' || (d.sol === 'rev' && d.k === 'cone')) {
    const b = body(q.pic), rx = b[4], k = rx / d.r; if (!near((b[3] - b[1]) / d.h, k)) scale.push('cone ' + JSON.stringify(d));
    if (d.sol !== 'rev' && d.r * d.r + d.h * d.h !== d.l ** 2) wrong.push('cone slant');
    if (d.sol === 'coneV') { if (!sameSet(L, [d.useD ? `${2 * d.r} cm` : `${d.r} cm`, `${d.h} cm`, `${d.l} cm`])) wrong.push('coneV labels ' + L);
      if (d.pi) { W(+(3.142 * d.r * d.r * d.h / 3).toFixed(1), q.val, .051); } else { W(d.r * d.r * d.h / 3); if (P.u !== 'cm' || P.p !== '³') wrong.push('coneV unit'); } }
    if (d.sol === 'coneSA') { const l = Math.hypot(d.r, d.h); if (!sameSet(L, d.hat ? [`${d.r} cm`, `${d.h} cm`] : [`${d.r} cm`, `${d.h} cm`, `${l} cm`])) wrong.push('coneSA labels ' + L);
      if (d.hat && q.q.includes('slant')) wrong.push('hat question gives the slant height away');
      W(d.hat ? d.r * l : d.r * d.r + d.r * l); if (P.p !== '²') wrong.push('coneSA unit'); }
    if (d.sol === 'rev') { if (!sameSet(L, [`${d.r} cm`, 'h'])) wrong.push('rev cone labels'); W(3 * d.V / (d.r * d.r)); }
  }
  if (d.sol === 'sphV' || d.sol === 'sphSA' || (d.sol === 'rev' && d.k === 'ball')) {
    const c = (q.pic.match(/<circle class="sbody" [^>]*r="([\d.]+)"/) || [])[1], b = body(q.pic), R = c ? +c : b ? b[2] : NaN, rl = radLine();
    if (!rl || !near(d.useD ? rl / 2 : rl, R)) scale.push('ball ' + JSON.stringify(d) + ' ' + rl + ' ' + R);
    const r3 = d.r ** 3, r2 = d.r ** 2;
    if (d.sol === 'sphV') { if (!sameSet(L, [d.useD ? `${2 * d.r} cm` : `${d.r} cm`])) wrong.push('sphV labels'); W(d.half ? 2 * r3 / 3 : 4 * r3 / 3); if (P.p !== '³') wrong.push('sphV unit'); }
    if (d.sol === 'sphSA') { W({ ball: 4, bowl: 2, dome: 3 }[d.k] * r2); if (P.p !== '²') wrong.push('sphSA unit'); }
    if (d.sol === 'rev') W(Math.sqrt(d.A / 4));
  }
  if (d.sol === 'compo' && d.k === 'cream') { if (!sameSet(L, [`${d.r} cm`, `${d.h} cm`])) wrong.push('cream labels'); W(d.r * d.r * d.h / 3 + 2 * d.r ** 3 / 3);
    const b = body(q.pic), sc = body(q.pic, 'sscoop'), k = (b[4] - b[0]) / (2 * d.r); if (!near((b[3] - b[1]) / d.h, k) || !near(sc[2], d.r * k)) scale.push('cream'); }
  if (d.sol === 'compo' && d.k === 'turret') { if (!sameSet(L, [`${d.r} m`, `${d.H} m`, `${d.h} m`])) wrong.push('turret labels'); W(d.r * d.r * d.H + d.r * d.r * d.h / 3);
    const b = body(q.pic), rf = body(q.pic, 'sroof'), k = b[4] / d.r; if (!near((b[3] - b[1]) / d.H, k) || !near((rf[3] - rf[1]) / d.h, k)) scale.push('turret'); }
}
ok(!bad.length, `${N.toLocaleString()} Ice-Cream Cone Café questions pass the checker, start with a capital, have a hint and worked steps, no emoji or long decimals, and multiple choice has 4 different options ${bad.slice(0, 3)}`);
ok(!notes.length, `every option has a why / why-not note, the right one restates the answer, and typed questions name their usual slips ${[...new Set(notes)].slice(0, 3)}`);
ok(!wrong.length, `every answer is worked out again from the lengths printed on the drawing (whole-number slant heights) ${[...new Set(wrong)].slice(0, 4)}`);
ok(!scale.length, `every solid is drawn to scale: heights, radii, slant sides and scoops in the same ratio as their numbers ${[...new Set(scale)].slice(0, 4)}`);
ok(['pyrV', 'pyrV/rect', 'pyrSA', 'pyrSA/tent', 'coneV', 'coneV/3.142', 'coneSA', 'coneSA/hat', 'sphV', 'sphV/half', 'sphSA/ball', 'sphSA/bowl', 'sphSA/dome', 'compo/cream', 'compo/turret', 'rev/cone', 'rev/ball', 'rev/pyr'].every(k => kinds[k] > 100), 'all question types appear: ' + JSON.stringify(kinds));
{ const qs = Array.from({ length: 3000 }, (_, s) => M.make(ID, s + 1));
  ok(qs.filter(q => q.data.sol === 'pyrV' && q.data.sq).every(q => q.slips.some(s => /slant/.test(s[1]))), 'square-pyramid volume names the classic slip "used the slant height", with its why-not note');
  ok(qs.filter(q => q.data.sol === 'coneSA' && q.data.hat).every(q => q.options.some(o => /slant height/.test(q.why[o]) && o !== q.a)), 'a party hat (given only r and h) offers πrh, and says l must come from Pythagoras');
  ok(qs.filter(q => q.data.sol === 'sphSA' && q.data.k === 'bowl').every(q => q.options.some(o => /open/.test(q.why[o]))), 'the open bowl offers 3πr² and explains the bowl has no lid');
  ok(qs.every(q => !/minister|politic|election|war\b|kill|blood|weapon|beer|wine/i.test(q.q)), 'kid themes only');
  ok(qs.every(q => q.pic && q.uid && /^sol\|/.test(q.uid)), 'every question has a drawn pastel solid and a uid (anti-farm)'); }
ok([1, 2, 3, 99].every(s => { const r = M.batch(ID, 8, s); return r.length === 8 && new Set(r.map(q => q.uid || q.q + q.a)).size === 8; }), 'a lesson of 8 has no repeated question');
ok((q => q.pic.includes('<ellipse') && q.pic.includes('class="mhid" d="M'))(Array.from({ length: 200 }, (_, s) => M.make('g7.mensur', s + 1)).find(q => /^cyl/.test(q.data.mens))), 'Bakery Blueprints cylinders still draw with the shared oval kit');

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
    const list = [seed(q => D(q).sol === 'compo' && D(q).k === 'cream'), seed(q => D(q).sol === 'pyrV' && D(q).sq), seed(q => D(q).sol === 'coneSA' && D(q).hat), seed(q => D(q).sol === 'sphSA' && D(q).k === 'bowl'),
      seed(q => D(q).sol === 'sphV' && !D(q).half), seed(q => D(q).sol === 'compo' && D(q).k === 'turret'), seed(q => D(q).sol === 'pyrSA' && !D(q).tent), seed(q => D(q).sol === 'rev' && D(q).k === 'ball')];
    ok(list.every(Number.isInteger), `${w}px: a seed was found for every kind of question`);
    await p.evaluate(l => WR.Math.startLesson({ topic: 'g8.solids', items: l.map(s => MathGen.make('g8.solids', s)) }), list);
    await p.waitForTimeout(500);
    for (let i = 0; i < list.length; i++) {
      const q = await p.evaluate(() => WR.Math._dbg()), tag = `${w}px ${q.data.sol}${q.data.k ? '/' + q.data.k : ''}`;
      ok(await fits(p), `${tag}: the picture and the choices fit the screen with no sideways scroll`);
      const taps = await p.evaluate(() => Math.min(...[...document.querySelectorAll('.mopts .opt, #mcheck, .numpad button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().height)));
      ok(taps >= 40, `${tag}: answer buttons are easy to tap (${Math.round(taps)} px)`);
      ok(await p.locator('.qcard svg .mlab').count() >= 1, `${tag}: the solid is drawn with its lengths labelled`);
      if (i < 4) { // a wrong answer first: its own why-not note; then the right one: the note that says why it works
        if (q.kind === 'mcq') { const wk = q.options.findIndex(o => o !== q.a); await p.locator(`.mopts .opt[data-k="${wk}"]`).click(); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.why[q.options[wk]].slice(0, 30))), `${tag}: a wrong pick shows its own why-not note`);
          if (w === 375 && i === 0) await p.locator('.qcard').screenshot({ path: OUT + 'solids_01_icecream_why_not.png' });
          await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); await p.waitForTimeout(300);
          ok((await whyText(p)).some(x => x.includes(q.why[q.a].slice(0, 30))), `${tag}: the right answer shows why it works, in other words`);
          if (w === 375 && i === 2) await p.locator('.qcard').screenshot({ path: OUT + 'solids_03_party_hat_why.png' });
        } else { await p.fill('#mans', String(q.slips[0][0])); await p.click('#mcheck'); await p.waitForTimeout(250);
          ok((await whyText(p)).some(x => x.includes(q.slips[0][1].slice(0, 30))), `${tag}: typing the usual slip (${q.slips[0][0]}) shows its why-not note`);
          if (w === 375 && i === 1) await p.locator('.qcard').screenshot({ path: OUT + 'solids_02_pyramid_slip_note.png' });
          await p.fill('#mans', q.a); await p.click('#mcheck'); await p.waitForTimeout(300); }
      } else {
        if (w === 375 && i === 5) await p.locator('.qcard').screenshot({ path: OUT + 'solids_04_turret.png' });
        if (q.kind === 'mcq') await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"]`).click(); else { await p.fill('#mans', q.a); await p.click('#mcheck'); }
        await p.waitForTimeout(300);
      }
      ok(await p.evaluate(() => /correct|got it/i.test(document.querySelector('.qcard').innerText)), `${tag}: the right answer is marked right`);
      if (i < list.length - 1) { await p.click('#mnext'); await p.waitForTimeout(300); }
    }
    const m = await p.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).math);
    ok(m && m.correct >= list.length && m.answered >= list.length, `${w}px: answers are saved in wordRealms.save.v1 (math.correct ${m && m.correct}, answered ${m && m.answered})`);
    if (w === 375) {
      const st = await p.evaluate(s => { const q = MathGen.make('g8.solids', s), k = q.uid || 'g8.solids|' + q.q; const a = WR.awardStars('m', k + '|t', 1), b = WR.awardStars('m', k + '|t', 1); return [a, b]; }, list[1]).catch(() => null);
      ok(st && st[0] >= 1 && st[1] < st[0], `a replayed question pays less than the first time (${st})`);
      await p.evaluate(() => WR.go('math')); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '8'); b && b.click(); }); await p.waitForTimeout(400);
      ok(await p.locator('[data-t="g8.solids"]').count() === 1, 'the Grade 8 hub lists Ice-Cream Cone Café');
      ok(await p.evaluate(() => { const e = document.querySelector('[data-t="g8.solids"]'); return !/\p{Extended_Pictographic}/u.test(e.innerText) && !!e.querySelector('img.wr-icon'); }), 'its hub card shows the painted ice-cream icon, not an emoji');
      await p.locator('[data-t="g8.solids"]').scrollIntoViewIfNeeded(); await p.screenshot({ path: OUT + 'solids_05_hub_grade8.png' });
    }
    ok(!errors.length, `${w}px: no page errors ${errors.slice(0, 2)}`);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall Ice-Cream Cone Café checks passed');
})();
