// ✨ Sparkle Sequences: MOE Sec 1 number patterns (continue a sequence, nth term, a far-off term, which term, is it a term,
// matchstick / dot picture patterns). Node checks re-read every sequence from the question text and recount every stick and
// dot from the SVG, then work the answer out again; then a phone flow at 375 and 320 px.
// Run: node tools/test/pattern.js (game served on :18642). Screenshots: screenshots/pattern_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const ID = 'g7.pattern';

/* ---------- 1. generators (Node) ---------- */
const t = M.topic(ID);
ok(t && t.grade === 7 && t.name === 'Sparkle Sequences' && t.icon === '✨', `✨ Sparkle Sequences is a Grade 7 topic (${t && t.desc})`);
ok(M.TOPICS.length >= 113, `it is one of ${M.TOPICS.length} maths topics (113 when it was added)`);
{ const g = M.gradeTopics(7).map(x => x.id); ok(g[g.length - 1] === 'g7.story' && g[g.length - 2] === ID && g.indexOf('g7.pct') === g.length - 3, 'it sits after Percentage Puzzles, right before the word problems: ' + g.join(' ')); }
// read back the sequence from the question: the first $a, b, c, …, \ldots$
const seqOf = q => { const m = q.q.match(/\$(-?\d+(?:, -?\d+)+), \\ldots\$/); return m ? m[1].split(', ').map(Number) : null; };
// a rule "an + b" / "-n - 4" / "n + 3" / "5" back to [a, b]
const ruleOf = s => { s = s.replace(/\$/g, '').replace(/\s/g, ''); const m = s.match(/^(-?\d*)n(?:([+-]\d+))?$/); if (m) return [m[1] === '' ? 1 : m[1] === '-' ? -1 : +m[1], m[2] ? +m[2] : 0]; return /^-?\d+$/.test(s) ? [0, +s] : null; };
// count the sticks / dots in each figure group of the picture
const figsOf = svg => [...svg.matchAll(/<g class="sfig" data-n="(\d)">(.*?)<\/g>/g)].map(m => ({ n: +m[1], sticks: [...m[2].matchAll(/class="stk" x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)"/g)].map(x => x.slice(1, 5).map(Number)), dots: [...m[2].matchAll(/class="sdot" cx="([\d.-]+)" cy="([\d.-]+)"/g)].map(x => [+x[1], +x[2]]) }));
// what a textbook would say each picture family needs for Figure n (an independent count)
const BOOK = { 'Crystal path': n => 3 * n + 1, 'Dragon scales': n => 2 * n + 1, 'Honeycomb tiles': n => 5 * n + 1, 'Twinkly star lights': n => 4 * n + 1, 'Lantern bridge': n => 2 * n + 2, 'Gem towers': n => 2 * n + 1 };
const titleOf = svg => (svg.match(/font-weight="900" fill="[^"]+">([^<]+)<\/text>/) || [])[1];
const kinds = {}, bad = [], wrong = [], fams = {}, ans = { yes: 0, no: 0, dec: 0, neg: 0, two: 0, nonlin: 0 };
const N = 8000;
for (let s = 1; s <= N; s++) {
  const q = M.make(ID, s * 2654435761 >>> 0), d = q.data, js = JSON.stringify(q), key = d.seq + (d.ask ? '/' + d.ask : '');
  kinds[key] = (kinds[key] || 0) + 1;
  if (/NaN|Infinity|undefined|\[object/.test(js) || !M.check(q, q.a).ok || !q.hint || !q.steps.length || !/^[A-Z]/.test(q.q)) bad.push(q.q);
  if (q.kind === 'mcq' && (q.options.length !== 4 || new Set(q.options).size !== 4 || q.options.filter(o => o === q.a).length !== 1)) bad.push('options ' + q.options.join(' ; '));
  if (q.steps.some(x => /[\t\f\v]/.test(x))) bad.push('control character in steps (a lost backslash)');
  if (d.seq !== 'pic') {
    const xs = seqOf(q); if (!xs) { bad.push('no sequence in ' + q.q); continue; }
    if (d.seq === 'next' && d.k !== 'lin') { ans.nonlin++;
      const f = { square: n => n * n, triangle: n => n * (n + 1) / 2, double: n => xs[0] * Math.pow(2, n - 1) }[d.k];
      if (!xs.every((x, i) => x === f(i + 1)) || q.val !== f(xs.length + 1)) wrong.push('nonlinear ' + d.k); continue; }
    const df = xs[1] - xs[0]; if (!xs.every((x, i) => !i || x - xs[i - 1] === df) || !df) { wrong.push('not linear ' + xs); continue; }
    if (df < 0) ans.dec++; if (xs.some(x => x < 0)) ans.neg++;
    const at = n => xs[0] + (n - 1) * df; // the nth term by counting on from the first
    if (d.seq === 'next') { const L = xs.length; if (q.kind === 'pair') { ans.two++; if (q.val[0] !== at(L + 1) || q.val[1] !== at(L + 2)) wrong.push('next two'); } else if (q.val !== at(L + 1)) wrong.push('next'); }
    if (d.seq === 'rule') q.options.forEach(o => { const R = ruleOf(o); if (!R) bad.push('rule? ' + o); else if (xs.every((x, i) => R[0] * (i + 1) + R[1] === x) !== (o === q.a)) wrong.push('rule ' + o + ' for ' + xs); });
    if (d.seq === 'term') { const k = +q.q.match(/the (\d+)(st|nd|rd|th) term/)[1]; if (q.val !== at(k)) wrong.push('term'); }
    if (d.seq === 'which') { const v = +q.q.match(/equal to \$(-?\d+)\$/)[1], n = (v - xs[0]) / df + 1; if (!Number.isInteger(n) || n < 5 || q.val !== n) wrong.push('which'); }
    if (d.seq === 'isin') { const w = +q.q.match(/Is \$(-?\d+)\$ in/)[1], n = (w - xs[0]) / df + 1, yes = Number.isInteger(n) && n >= 1; ans[yes ? 'yes' : 'no']++;
      if (yes ? q.a !== `Yes, it is the ${n}${(n % 100 >= 11 && n % 100 <= 13) ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th'} term` : !/^No/.test(q.a)) wrong.push('isin ' + w + ' ' + q.a);
      if (!yes && (n < 2 || n > 70)) wrong.push('a "no" number far outside the sequence'); }
  } else {
    const F = figsOf(q.pic), title = titleOf(q.pic), book = BOOK[title]; fams[title] = (fams[title] || 0) + 1;
    if (F.length !== 3 || !book) { bad.push('figs ' + F.length + ' ' + title); continue; }
    const cnt = F.map(f => f.sticks.length + f.dots.length);
    if (!cnt.every((c, i) => c === book(i + 1))) wrong.push(`${title}: counted ${cnt}`);
    for (const f of F) { // sticks: all the same length, never drawn twice; dots: never on top of each other; all on the card
      if (f.sticks.length) { const L = f.sticks.map(([a, b, c, e]) => Math.hypot(c - a, e - b)), keys = f.sticks.map(([a, b, c, e]) => [[a, b], [c, e]].map(p => p.map(Math.round).join()).sort().join('|'));
        if (Math.max(...L) - Math.min(...L) > 0.6 || new Set(keys).size !== keys.length) wrong.push(title + ' sticks uneven or doubled'); }
      if (f.dots.some((p, i) => f.dots.some((o, j) => j > i && Math.hypot(p[0] - o[0], p[1] - o[1]) < 6))) wrong.push(title + ' dots overlap');
      if (f.sticks.flat().concat(f.dots.flat()).some(v => v < 4 || v > 296)) wrong.push('off the card'); }
    const df = cnt[1] - cnt[0], at = n => cnt[0] + (n - 1) * df;
    if (d.ask === 'four' || d.ask === 'far') { const k = +q.q.match(/Figure (\d+)\?/)[1]; if (q.val !== at(k)) wrong.push('pic count'); }
    if (d.ask === 'rule') q.options.forEach(o => { const R = ruleOf(o); if (!R) bad.push('rule? ' + o); else if ([1, 2, 3].every(n => R[0] * n + R[1] === cnt[n - 1]) !== (o === q.a)) wrong.push('pic rule ' + o); });
    if (d.ask === 'which') { const v = +q.q.match(/exactly (\d+) /)[1], n = (v - cnt[0]) / df + 1; if (!Number.isInteger(n) || q.val !== n) wrong.push('pic which'); }
  }
}
ok(!bad.length, `${N.toLocaleString()} Sparkle Sequences questions pass the checker, start with a capital letter, have a hint and worked steps, and every multiple choice has 4 different options ${bad.slice(0, 3)}`);
ok(!wrong.length, `every answer is worked out again from the sequence in the question or the sticks and dots in the picture ${[...new Set(wrong)].slice(0, 4)}`);
ok(['next', 'rule', 'term', 'which', 'isin', 'pic/four', 'pic/far', 'pic/rule', 'pic/which'].every(k => kinds[k] > 150), 'all kinds of question appear: ' + JSON.stringify(kinds));
ok(Object.keys(BOOK).every(k => fams[k] > 150), 'all six picture patterns appear: ' + JSON.stringify(fams));
ok(ans.yes > 200 && ans.no > 200, `"is it in the sequence?" is yes (${ans.yes}) and no (${ans.no}) about equally often`);
ok(ans.dec > 300 && ans.neg > 100 && ans.two > 100, `decreasing (${ans.dec}) and negative (${ans.neg}) sequences appear, and "next two numbers" (${ans.two})`);
ok(ans.nonlin > 30 && ans.nonlin < N * 0.06, `square / triangle / doubling sequences are only occasional (${ans.nonlin} of ${N})`);
{ const qs = Array.from({ length: 3000 }, (_, s) => M.make(ID, s + 1));
  const rules = qs.filter(q => q.data.seq === 'rule' || q.data.ask === 'rule');
  ok(rules.filter(q => { const [a, b] = ruleOf(q.a); return q.options.some(o => { const R = ruleOf(o); return R && R[0] === 1 && R[1] === a; }); }).length > rules.length * 0.8, 'nth-term choices include the classic slip "n + difference"');
  ok(qs.every(q => !/minister|politic|election|war\b|kill/i.test(q.q)), 'kid themes only');
  ok(qs.filter(q => q.data.seq === 'pic').every(q => q.uid && q.pic.includes('Figure 3')), 'picture questions carry a uid (anti-farm) and label their figures'); }
ok([1, 2, 3, 99].every(s => { const r = M.batch(ID, 8, s); return r.length === 8 && new Set(r.map(q => q.uid || q.q + q.a)).size === 8; }), 'a lesson of 8 has no repeated question');

/* ---------- 2. phone ---------- */
const SAVE = { v: 1, name: 'Jeremy', avatar: 'avatar_mage', startLevel: 'a1', stars: 100, totalCorrect: 40, totalAnswered: 50,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 420, happiness: 82, hunger: 35, skin: null, lastTick: Date.now() }, streak: { count: 4, last: null }, progress: {},
  owned: [], equipped: { outfit: null, petskin: null, theme: null }, settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 5 };
const seed = pred => { for (let s = 1; s < 20000; s++) if (pred(M.make(ID, s))) return s; };
const fits = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && [...document.querySelectorAll('.qcard .mpic, .mopts .opt')].every(e => { const r = e.getBoundingClientRect(); return r.right <= innerWidth + 1 && r.left >= -1; }));
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const [w, h] of [[375, 667], [320, 658]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); const errors = [];
    p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/font|ERR_|net::|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    await p.goto(URL); await p.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE);
    await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(400);
    const D = q => q.data;
    const list = [seed(q => D(q).ask === 'rule' && D(q).fam === 'sq'), seed(q => D(q).ask === 'far' && D(q).fam === 'hex'), seed(q => D(q).ask === 'which' && D(q).fam === 'plus'), seed(q => D(q).seq === 'isin' && !D(q).yes),
      seed(q => D(q).seq === 'next' && q.kind === 'pair' && D(q).d < 0), seed(q => D(q).ask === 'four' && D(q).fam === 'tri'), seed(q => D(q).seq === 'which'), seed(q => D(q).ask === 'far' && D(q).fam === 'ladder')];
    ok(list.every(Number.isInteger), `${w}px: a seed was found for every kind of question`);
    await p.evaluate(l => WR.Math.startLesson({ topic: 'g7.pattern', items: l.map(s => MathGen.make('g7.pattern', s)) }), list);
    await p.waitForTimeout(500);
    for (let i = 0; i < list.length; i++) {
      const q = await p.evaluate(() => WR.Math._dbg()), tag = `${w}px ${q.data.seq}${q.data.ask ? '/' + q.data.ask : ''}`;
      ok(await fits(p), `${tag}: the picture and the choices fit the screen with no sideways scroll`);
      const taps = await p.evaluate(() => Math.min(...[...document.querySelectorAll('.mopts .opt, #mcheck, .numpad button, .mpad button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().height)));
      ok(taps >= 40, `${tag}: answer buttons are easy to tap (${Math.round(taps)} px)`);
      if (q.pic) { const n = await p.locator('.qcard svg g.sfig').count(); ok(n === 3, `${tag}: figures 1–3 are drawn`); }
      if (w === 375 && i < 6) await p.locator('.qcard').screenshot({ path: OUT + `pattern_0${i + 1}_${q.data.seq}${q.data.ask ? '_' + q.data.ask : ''}.png` });
      if (w === 375 && i === 0) { // two wrong picks: the right rule lights up and the worked steps appear
        const wr = q.options.map((o, k) => o === q.a ? -1 : k).filter(k => k >= 0);
        await p.locator(`.mopts .opt[data-k="${wr[0]}"]`).click(); await p.waitForTimeout(250); await p.locator(`.mopts .opt[data-k="${wr[1]}"]`).click(); await p.waitForTimeout(300);
        ok(await p.locator(`.mopts .opt[data-k="${q.options.indexOf(q.a)}"].right`).count() === 1, `${tag}: after two misses the right rule is marked`);
        ok(/Figure 1 has/.test(await p.locator('#mexplain').innerText()), `${tag}: the worked steps count the sticks in each figure`);
        await p.locator('.qcard').screenshot({ path: OUT + 'pattern_07_answer_shown.png' });
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
      const st = await p.evaluate(s => { const q = MathGen.make('g7.pattern', s), k = q.uid || 'g7.pattern|' + q.q; const a = WR.awardStars('m', k + '|t', 1), b = WR.awardStars('m', k + '|t', 1); return [a, b]; }, list[1]).catch(() => null);
      ok(st && st[0] >= 1 && st[1] < st[0], `a replayed question pays less than the first time (${st})`);
      await p.evaluate(() => WR.go('math')); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('[data-g]')].find(x => x.dataset.g === '7'); b && b.click(); }); await p.waitForTimeout(400);
      ok(await p.locator('[data-t="g7.pattern"]').count() === 1, 'the Grade 7 hub lists Sparkle Sequences');
      ok(await p.evaluate(() => { const e = document.querySelector('[data-t="g7.pattern"]'); return !/\p{Extended_Pictographic}/u.test(e.innerText) && !!e.querySelector('img.wr-icon, svg, .wr-icon'); }), 'its hub card shows a painted icon, not an emoji');
      await p.locator('[data-t="g7.pattern"]').scrollIntoViewIfNeeded(); await p.screenshot({ path: OUT + 'pattern_08_hub_grade7.png' });
    }
    ok(!errors.length, `${w}px: no page errors ${errors.slice(0, 2)}`);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall Sparkle Sequences checks passed');
})();
