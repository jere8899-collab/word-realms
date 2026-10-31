// 🕰️ Clock Workshop + 🌙 Midnight Clock (MOE P1–P3 time): Node checks on 7,000 generated time questions (every answer
// re-worked from the words / numbers in the question), the clock tools' maths, the 24-hour checker, then phone flows at
// 375×667 and 320×658: count the minutes, wind the hands on / back, set the clock by tapping and by dragging, the free-play
// Workshop, save + migration, quest, sticker, report and cloud payload, taps ≥ 40 px, no overflow.
// Run: node tools/test/clock.js (game served on :18642). Screenshots: screenshots/clock_*.png
const path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '../..'), OUT = ROOT + '/screenshots/';
const URL = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/') + 'index.html';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const M = require(ROOT + '/js/math-gen.js'); ['p', 'm', 'h'].forEach(x => require(ROOT + `/js/math-topics-${x}.js`));
const V = require(ROOT + '/js/math-viz.js'), C = M.clock;

/* ---------- 1. topics, words, checker ---------- */
ok(M.TOPICS.length >= 109 && M.topic('g3.clock') && M.topic('g3.clock').grade === 3, `${M.TOPICS.length} topics (109 when it was added); 🌙 Midnight Clock is a Grade 3 topic (${M.TOPICS.length})`);
{ const g3 = M.gradeTopics(3).map(t => t.id); ok(g3.indexOf('g3.clock') === g3.indexOf('g3.duration') + 1, 'it sits right after Ball Time (durations) in Grade 3'); }
ok([[7, 0, "7 o'clock"], [7, 15, 'quarter past 7'], [7, 30, 'half past 7'], [7, 45, 'quarter to 8'], [7, 40, '20 minutes to 8'], [12, 50, '10 minutes to 1'], [3, 1, '1 minute past 3'], [3, 59, '1 minute to 4']].every(([h, m, w]) => C.words(h, m) === w), 'time in words: o\'clock, quarter past/to, half past, N minutes past/to (1 minute)');
ok(C.h24(0) === '00:00' && C.h24(19 * 60 + 5) === '19:05' && C.ampm(20) === '12:20 a.m.' && C.ampm(12 * 60) === '12:00 p.m.' && C.ampm(23 * 60 + 33) === '11:33 p.m.' && C.dur(85) === '1 h 25 min' && C.dur(60) === '1 h', '24-hour, a.m./p.m. and duration helpers');
{ const q = { kind: 'time24', val: 19 * 60 + 5 }, c = s => M.check(q, s);
  ok(c('19:05').ok && c('1905').ok && c('19.05').ok && c('19 05').ok && !c('7:05').ok && c('25:00').bad && c('7pm').bad, '24-hour checker: 19:05 / 1905 / 19.05 / 19 05 are right, 7:05 is wrong, 25:00 and "7pm" cannot be read');
  ok(M.check({ kind: 'time24', val: 9 * 60 + 40 }, '9:40').ok && M.check({ kind: 'time24', val: 9 * 60 + 40 }, '09:40').ok && M.check({ kind: 'time24', val: 20 }, '00:20').ok, '24-hour checker: 9:40 = 09:40, 00:20 is just after midnight'); }

/* ---------- 2. every Midnight Clock question, re-worked independently ---------- */
const W2T = w => { let m; // words → minutes after 12:00 (0–719), parsed independently of the generator
  if ((m = w.match(/^(\d+) o'clock$/))) return (+m[1] % 12) * 60;
  if ((m = w.match(/^quarter past (\d+)$/))) return (+m[1] % 12) * 60 + 15;
  if ((m = w.match(/^half past (\d+)$/))) return (+m[1] % 12) * 60 + 30;
  if ((m = w.match(/^quarter to (\d+)$/))) return ((+m[1] % 12) * 60 - 15 + 720) % 720;
  if ((m = w.match(/^(\d+) minutes? past (\d+)$/))) return (+m[2] % 12) * 60 + +m[1];
  if ((m = w.match(/^(\d+) minutes? to (\d+)$/))) return ((+m[2] % 12) * 60 - +m[1] + 720) % 720;
  return NaN; };
const AP = s => { const m = s.match(/(\d{1,2}):(\d{2}) (a\.m\.|p\.m\.)/); return m ? (+m[1] % 12 + (m[3] === 'p.m.' ? 12 : 0)) * 60 + +m[2] : NaN; };
const HM = s => { const m = s.match(/(\d{1,2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : NaN; };
const DUR = s => { const m = s.match(/(?:(\d+) h)?\s*(?:(\d+) min)?\./); return (+(m[1] || 0)) * 60 + +(m[2] || 0); };
const handsOf = svg => [...svg.matchAll(/<line x1="60" y1="60" x2="([\d.-]+)" y2="([\d.-]+)" stroke="(#6d4f86|#ff8fa3)" stroke-width="(5|3)"/g)].map(m => [+m[1], +m[2]]);
const angleAt = ([x, y]) => ((Math.atan2(y - 60, x - 60) * 180 / Math.PI + 90) % 360 + 360) % 360;
// the hour hand creeps on ½° a minute, so take that off before reading the hour
const hourOf = (ha, mm) => Math.round((ha - mm * 0.5) / 30) % 12 || 12;
const ADULT = /\b(wine|beer|bar|casino|tax|minister|election|office|meeting|commute|shift|bank)\b/i;
const kinds = {}, bad = [];
for (let s = 1; s <= 7000; s++) {
  const q = M.make('g3.clock', s * 2654435761 >>> 0), sp = V.spec(q), txt = q.q.replace(/<\/?b>/g, '');
  let k;
  if (q.set) { k = 'set'; const w = txt.match(/Set it to (.+)\.$/)[1]; if (W2T(w) !== q.val % 720 || !q.ansPic || sp) bad.push('set ' + txt); if (!M.check(q, C.hm(Math.floor(q.val / 60) || 12, q.val % 60)).ok) bad.push('set check ' + txt); }
  else if (q.kind === 'time24') { k = '24h'; if (AP(txt) !== q.val || !/^\d\d:\d\d$/.test(q.a) || HM(q.a) !== q.val || sp) bad.push('24h ' + txt + ' ' + q.a); }
  else if (q.kind === 'mcq' && /dragon train/.test(txt)) { k = '12h'; const T = HM(txt.match(/at (\d\d:\d\d)/)[1]), right = q.options.filter(o => AP(o) === T);
    if (right.length !== 1 || right[0] !== q.a || q.options.length !== 4) bad.push('12h ' + txt + ' ' + q.options); }
  else if (q.kind === 'mcq') { k = 'words'; const [ha, ma] = handsOf(q.pic).map(angleAt), shown = Math.round(ma / 6) % 60, hr = hourOf(ha, shown), T = (hr % 12) * 60 + shown, right = q.options.filter(o => W2T(o) === T);
    if (right.length !== 1 || right[0] !== q.a || q.options.length !== 4 || !sp || sp.mode !== 'read') bad.push('words ' + q.a + ' ' + q.options + ' ' + hr + ':' + shown); }
  else if (q.data && q.data.read) { k = 'read'; const [ha, ma] = handsOf(q.pic).map(angleAt), mm = Math.round(ma / 6) % 60, hr = hourOf(ha, mm);
    if (C.hm(hr, mm) !== q.a || !M.check(q, q.a).ok || !sp || sp.mode !== 'read' || sp.step !== 1) bad.push('read ' + q.a + ' vs ' + hr + ':' + mm); }
  else if (/What time does it end/.test(txt)) { k = 'end'; const st = HM(txt), e = st + DUR(txt.split('lasts ')[1]);
    if (e % 720 !== q.val % 720 || e >= 12 * 60 || st < 60 || !sp || sp.mode !== 'wind' || sp.goal !== DUR(txt.split('lasts ')[1]) || V.clockTime(sp, { reveal: true }).m !== q.val % 60) bad.push('end ' + txt); if (/a\.m\./.test(txt) && st < 7 * 60) bad.push('too early ' + txt); }
  else if (/What time did it start/.test(txt)) { k = 'start'; const e = HM(txt), st = e - DUR(txt.split('lasted ')[1]), ct = V.clockTime(sp, { reveal: true });
    if (st !== q.val || st < 60 || !sp || sp.goal >= 0 || C.hm(ct.h, ct.m) !== q.a) bad.push('start ' + txt); }
  else k = 'other ' + txt;
  kinds[k] = (kinds[k] || 0) + 1;
  if (ADULT.test(q.q + q.steps.join(' '))) bad.push('adult ' + q.q);
  if (!q.steps.length || !q.hint || /undefined|NaN|\.\./.test(q.q + q.steps.join('') + q.hint)) bad.push('text ' + q.q + q.steps);
}
ok(['read', 'set', 'words', '24h', '12h', 'end', 'start'].every(k => kinds[k] > 600) && Object.keys(kinds).length === 7, `7 question types, all generated often: ${JSON.stringify(kinds)}`);
ok(!bad.length, `every answer re-worked from the question (hands read off the picture, words parsed, 24-hour converted, start/end + duration), one right option per mcq, kid themes only ${bad.slice(0, 3).join(' | ')}`);
{ const seen = new Set(M.batch('g3.clock', 8, 99).map(q => q.q + q.a)); ok(seen.size === 8, 'a lesson batch has 8 different questions'); }

/* ---------- 3. the clock tools on the other time topics ---------- */
const tbad = [], tcov = {};
for (const id of ['g1.time', 'g2.time', 'g3.duration', 'g3.clock']) for (let s = 1; s <= 600; s++) {
  const q = M.make(id, s * 40503 >>> 0), sp = V.spec(q); if (!sp) continue; if (sp.type !== 'clock') { tbad.push(id + ' not a clock'); continue; }
  tcov[id + ' ' + sp.mode] = (tcov[id + ' ' + sp.mode] || 0) + 1;
  const a = V.svg(sp), r = V.svg(sp, { reveal: true }), mid = V.svg(sp, sp.mode === 'read' ? { k: Math.floor(sp.m / 2) } : { t: Math.round(sp.goal / 10) * 5 });
  if ([a, r, mid].some(z => !z.startsWith('<svg') || /NaN|undefined|Infinity/.test(z))) tbad.push(id + ' svg');
  if (sp.mode === 'read') { const [ha, ma] = handsOf(r.replace(/<g transform="translate\(16,16\)">/, '')).map(angleAt); if (C.hm(hourOf(ha, Math.round(ma / 6) % 60), Math.round(ma / 6) % 60) !== C.hm(q.data.h, q.data.m)) tbad.push(id + ' read hands ' + q.a);
    const counted = [...r.matchAll(/fill="#e0607a"[^>]*>(\d+)<\/text>/g)].map(m => +m[1]); if (counted.length !== Math.floor(sp.m / 5) || (counted.length && counted[counted.length - 1] !== Math.floor(sp.m / 5) * 5)) tbad.push(id + ' count labels ' + counted + ' for ' + sp.m);
    if ((id === 'g3.clock') !== (sp.step === 1)) tbad.push(id + ' step'); }
  if (sp.mode === 'wind' && id === 'g3.duration') { const end = q.q.match(/ends at (\d+:\d\d)/)[1], ct = V.clockTime(sp, { reveal: true }); if (C.hm(ct.h, ct.m) !== end || sp.goal !== q.val || !sp.end || !/stroke-dasharray="3 3"/.test(a) || /stroke-dasharray="3 3"/.test(r)) tbad.push('duration wind ' + q.q); }
}
ok(!tbad.length && tcov['g1.time read'] && tcov['g2.time read'] && tcov['g3.duration wind'] && tcov['g3.clock read'] && tcov['g3.clock wind'], `Clock Workshop models: count-the-minutes on every G1/G2 clock and G3 clock pictures, wind-the-hands on G3 durations / end / start times ${JSON.stringify(tcov)} ${tbad.slice(0, 3)}`);
ok(V.clockTime({ type: 'clock', mode: 'wind', h: 11, m: 50, goal: 25 }, { reveal: true }).h === 12 && V.clockTime({ type: 'clock', mode: 'wind', h: 12, m: 10, goal: -25 }, { reveal: true }).m === 45 && V.clockTime({ type: 'clock', mode: 'set', h: 12, m: 0 }, { t: 0 }).h === 12, 'winding past 12 o\'clock carries the hour (11:50 + 25 min = 12:15; 12:10 − 25 min = 11:45)');
ok(!V.spec(M.make('g4.angles', 3)) || V.spec(M.make('g4.angles', 3)).type !== 'clock', 'non-time topics get no clock');

/* ---------- 4. phone ---------- */
const SAVE = { v: 1, name: 'Jeremy', avatar: 'avatar_mage', startLevel: 'a1', stars: 100, totalCorrect: 40, totalAnswered: 50,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 420, happiness: 82, hunger: 35, skin: null, lastTick: Date.now() }, streak: { count: 4, last: null }, progress: {},
  owned: [], equipped: { outfit: null, petskin: null, theme: null }, settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 5 };
const saved = page => page.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')));
const seedFor = (topic, pred) => { for (let s = 1; s < 60000; s++) { const q = M.make(topic, s); if (pred(q)) return s; } };
const noOverflow = page => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const smallTaps = page => page.evaluate(() => [...document.querySelectorAll('#main button, #main [data-ck], #main [data-w]')].filter(b => { const r = b.getBoundingClientRect(); return r.width && r.height && (r.height < 40 || r.width < 40); }).map(b => b.textContent.trim().slice(0, 14) + ' ' + Math.round(b.getBoundingClientRect().height)));
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const errors = [];
  p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/font|ERR_|net::|Failed to load resource|supabase|cloud library/i.test(m.text())) errors.push(m.text()); });
  await p.goto(URL); await p.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE);
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(400);
  ok(await p.evaluate(() => JSON.stringify(WR.Math.st().clock)) === JSON.stringify({ opened: 0, hops: 0, done: 0, set: 0, plays: 0 }), 'save migration: an old save without a clock block gains math.clock');
  await p.evaluate(() => { WR.ensureDaily(); WR.state.daily.quests[0] = { id: 'clock1', progress: 0, claimed: false }; WR.save(); });
  // hub card: Grades 1–3 only
  await p.evaluate(() => WR.go('math', 4)); await p.waitForTimeout(250); const g4card = await p.locator('#toClock').count();
  await p.evaluate(() => WR.go('math', 3)); await p.waitForTimeout(250);
  ok(g4card === 0 && await p.locator('#toClock').count() === 1 && await p.locator('.mtopic[data-t="g3.clock"]').count() === 1, 'hub: Grade 3 shows the 🕰️ Clock Workshop card and the 🌙 Midnight Clock topic; Grade 4 has no clock card');
  await p.locator('#toClock').scrollIntoViewIfNeeded(); await p.locator('#toClock').screenshot({ path: OUT + 'clock_06_hub_card.png' });

  // lesson: read to the minute → set → wind on (finish time) → wind back (start time) → duration (wrong first) → 24-hour → past/to
  const sRead = seedFor('g3.clock', q => q.data && q.data.read && q.kind === 'time' && q.data.m % 5 && q.data.m > 20);
  const sSet = seedFor('g3.clock', q => q.set && q.val % 60 > 30 && q.val % 5);
  const sEnd = seedFor('g3.clock', q => q.data && q.data.wind && q.data.wind.goal > 60 && q.data.wind.goal % 60 >= 15);
  const sStart = seedFor('g3.clock', q => q.data && q.data.wind && q.data.wind.goal < 0 && q.data.wind.goal > -60);
  const sDur = seedFor('g3.duration', q => q.data && q.data.wind && q.data.wind.goal >= 40 && q.data.wind.goal < 60);
  const s24 = seedFor('g3.clock', q => q.kind === 'time24' && q.val >= 13 * 60);
  const sSet2 = seedFor('g3.clock', q => q.set && q.val % 60 && q.val % 60 < 30);
  const sWords = seedFor('g3.clock', q => q.kind === 'mcq' && /Clock Tower/.test(q.q));
  const list = [['g3.clock', sRead], ['g3.clock', sSet], ['g3.clock', sEnd], ['g3.clock', sStart], ['g3.duration', sDur], ['g3.clock', s24], ['g3.clock', sSet2], ['g3.clock', sWords]];
  await p.evaluate(l => WR.Math.startLesson({ topic: 'g3.clock', items: l.map(([t, s]) => MathGen.make(t, s)) }), list); await p.waitForTimeout(300);
  // 1 read: count the minutes
  const q1 = await p.evaluate(() => WR.Math._dbg());
  ok((await p.$eval('#vizBtn', e => WR.iconText(e))).replace(/\uFE0F/g, '').includes('🕰 Clock') && await p.locator('#mviz svg').count() === 0, `read "${q1.a}": a 🕰️ Clock button; the workshop waits until asked`);
  await p.click('#vizBtn'); await p.waitForTimeout(300);
  ok(await p.locator('#mviz .mv-clock-read').count() === 1 && !(await p.locator('.qcard > .qpic').isVisible()), 'the counting clock opens in place of the question picture');
  await p.click('#mviz [data-ck="5"]'); await p.click('#mviz [data-ck="5"]'); await p.waitForTimeout(150);
  ok(/Counted: 10 minutes/.test(await p.textContent('#mviz')), 'tapping "Count 5 more" twice counts 10 minutes on the rim');
  ok(await noOverflow(p) && !(await smallTaps(p)).length, `375×667: no overflow, every tap ≥ 40 px ${await smallTaps(p)}`);
  await p.locator('.qcard').screenshot({ path: OUT + 'clock_01_count.png' });
  while (await p.locator('#mviz [data-ck="5"]').count()) await p.click('#mviz [data-ck="5"]');
  while (await p.locator('#mviz [data-ck="1"]').count()) await p.click('#mviz [data-ck="1"]');
  ok(await p.locator('#mviz .bal-done').count() === 1 && new RegExp(`${q1.data.m} minutes`).test(await p.textContent('#mviz .bal-done')), `counting in fives, then ones, reaches the long hand (${q1.data.m} minutes) and the hour lights up`);
  let st = await saved(p); ok(st.math.clock.opened === 1 && st.math.clock.done === 1 && st.daily.quests[0].progress === 1, `save: math.clock ${JSON.stringify(st.math.clock)}; 🕰️ daily quest ${st.daily.quests[0].progress}/1`);
  await p.fill('#mans', q1.a); await p.click('#mcheck'); await p.waitForTimeout(250);
  ok(await p.locator('#mviz .mviz.reveal').count() === 1 && await p.locator('#mviz [data-ck]').count() === 0, 'a right answer shows the finished count with no buttons');
  await p.click('#mnext'); await p.waitForTimeout(300);
  // 2 set the clock with buttons
  const q2 = await p.evaluate(() => WR.Math._dbg());
  ok(await p.locator('#cface').count() === 1 && await p.locator('#mans').count() === 0 && await p.locator('.numpad').count() === 0 && await p.locator('#vizBtn').count() === 0, `set "${q2.q.replace(/<\/?b>/g, '')}": a hand-setting clock instead of the numpad`);
  const chk = await p.locator('#mcheck').boundingBox(); ok(chk && chk.y + chk.height <= 667, `375×667: the whole setter and ✓ Check fit on screen (Check bottom ${Math.round(chk.y + chk.height)} px)`);
  ok(!/\d:\d\d/.test(await p.textContent('.qcard')), 'no digital time is shown while setting (the child must read the hands)');
  const goal = q2.val % 720, h = Math.floor(goal / 60), mm = goal % 60;
  for (let i = 0; i < h; i++) await p.click('.cbtn[data-d="60"]');
  for (let i = 0; i < Math.floor(mm / 5); i++) await p.click('.cbtn[data-d="5"]');
  for (let i = 0; i < mm % 5; i++) await p.click('.cbtn[data-d="1"]');
  ok(await p.evaluate(() => WR.Math.Clock.time()) === q2.a, `the buttons move the hands to ${q2.a}`);
  ok(!(await smallTaps(p)).length && await noOverflow(p), 'setter buttons ≥ 40 px, no overflow');
  await p.locator('.qcard').screenshot({ path: OUT + 'clock_02_set.png' });
  await p.click('#mcheck'); await p.waitForTimeout(250);
  ok(/Correct/.test(await p.textContent('#mexplain')) && await p.locator('.cbtn:disabled').count() >= 6, 'a correctly set clock is right first try, and the setter locks');
  st = await saved(p); ok(st.math.clock.set === 1, 'save: math.clock.set counts the clock');
  await p.click('#mnext'); await p.waitForTimeout(300);
  // 3 wind on to find the end time
  const q3 = await p.evaluate(() => WR.Math._dbg()), g3 = q3.data.wind.goal;
  await p.click('#vizBtn'); await p.waitForTimeout(250);
  ok(await p.locator('#mviz .mv-clock-wind').count() === 1 && /Wound on/.test(await p.textContent('#mviz')), `end time "${q3.q.slice(0, 60)}…": the winding clock opens`);
  for (let i = 0; i < Math.floor(g3 / 60); i++) await p.click('#mviz [data-w="60"]');
  await p.click('#mviz [data-w="60"]'); await p.waitForTimeout(150);
  ok(/too far/.test(await p.textContent('#mviz')), 'winding past the duration says "Oops, too far!"');
  await p.click('#mviz [data-w="undo"]'); for (let i = 0; i < Math.floor(g3 % 60 / 10); i++) await p.click('#mviz [data-w="10"]'); if (g3 % 10) await p.click('#mviz [data-w="5"]');
  await p.waitForTimeout(150);
  ok(await p.locator('#mviz .bal-done').count() === 1 && (await p.locator('#mviz .ck-hops .pill').count()) >= 2, 'undo, then hours + minutes hops reach the duration: "Read the clock"');
  await p.locator('.qcard').screenshot({ path: OUT + 'clock_03_wind.png' });
  await p.fill('#mans', q3.a); await p.click('#mcheck'); await p.waitForTimeout(250); await p.click('#mnext'); await p.waitForTimeout(300);
  // 4 wind back to find the start time
  const q4 = await p.evaluate(() => WR.Math._dbg());
  await p.click('#vizBtn'); await p.waitForTimeout(250);
  ok(/Wound back/.test(await p.textContent('#mviz')) && await p.locator('#mviz [data-w="-10"]').count() === 1, 'start time: the clock winds back (⏪ −10 min buttons)');
  for (let i = 0; i < Math.floor(-q4.data.wind.goal / 10); i++) await p.click('#mviz [data-w="-10"]'); if (-q4.data.wind.goal % 10) await p.click('#mviz [data-w="-5"]');
  ok(await p.locator('#mviz .bal-done').count() === 1, `winding back ${-q4.data.wind.goal} min reaches the start`);
  await p.fill('#mans', q4.a); await p.click('#mcheck'); await p.waitForTimeout(250); await p.click('#mnext'); await p.waitForTimeout(300);
  // 5 duration: a first wrong answer opens the winding clock with the end time as dashed hands
  const q5 = await p.evaluate(() => WR.Math._dbg());
  await p.fill('#mans', '999'); await p.click('#mcheck'); await p.waitForTimeout(300);
  ok(await p.locator('#mviz .mv-clock-wind').count() === 1 && /Clock Workshop to help/.test(await p.textContent('#mexplain')) && /stroke-dasharray="3 3"/.test(await p.innerHTML('#mviz')), 'duration: a first wrong answer opens the winding clock; the end time shows as dashed hands');
  for (let i = 0; i < q5.val / 5; i++) await p.click('#mviz [data-w="5"]');
  ok(/reached the end time/.test(await p.textContent('#mviz')) && !/Wound on/.test(await p.textContent('#mviz')), 'hopping to the dashed hands says "Add up your hops" (and never prints the total)');
  await p.waitForTimeout(400); await p.screenshot({ path: OUT + 'clock_04_duration_phone.png' });
  await p.fill('#mans', String(q5.val)); await p.click('#mcheck'); await p.waitForTimeout(250); await p.click('#mnext'); await p.waitForTimeout(300);
  // 6 24-hour clock
  const q6 = await p.evaluate(() => WR.Math._dbg());
  await p.fill('#mans', '7pm'); await p.click('#mcheck'); await p.waitForTimeout(150);
  ok(/24-hour time like 19:30/.test(await p.textContent('body')), '24-hour: unreadable input gets a "like 19:30" toast');
  await p.fill('#mans', q6.a.replace(':', '')); await p.click('#mcheck'); await p.waitForTimeout(250);
  ok(/Correct/.test(await p.textContent('#mexplain')), `24-hour: "${q6.a.replace(':', '')}" is accepted for ${q6.a}`);
  await p.click('#mnext'); await p.waitForTimeout(300);
  // 7 set the clock by dragging the long hand, wrong twice → the answer is shown as a clock
  const q7 = await p.evaluate(() => WR.Math._dbg()), box = await p.locator('#cface').boundingBox(), cx = box.x + box.width / 2, cy = box.y + box.height / 2, R = box.width * 0.3;
  const at = mnt => [cx + R * Math.sin(mnt * Math.PI / 30), cy - R * Math.cos(mnt * Math.PI / 30)];
  await p.mouse.move(...at(0)); await p.mouse.down(); for (let k = 1; k <= 20; k++) await p.mouse.move(...at(k)); await p.mouse.up();
  ok(await p.evaluate(() => WR.Math.Clock.time()) === '12:20', `dragging the long hand round to the 4 sets 12:20 (${await p.evaluate(() => WR.Math.Clock.time())})`);
  await p.mouse.move(...at(20)); await p.mouse.down(); for (let k = 21; k <= 70; k++) await p.mouse.move(...at(k)); await p.mouse.up();
  ok(await p.evaluate(() => WR.Math.Clock.time()) === '1:10', 'dragging on past the 12 carries the short hand to the next hour (1:10)');
  if (q7.a === '1:10') await p.click('.cbtn[data-d="60"]');
  await p.click('#mcheck'); await p.waitForTimeout(200); await p.click('#mcheck'); await p.waitForTimeout(250);
  ok(/The answer is/.test(await p.textContent('#mexplain')) && await p.locator('#mexplain .mansPic svg').count() === 1, 'two wrong clocks: the answer is shown as a clock picture with its time');
  await p.click('#mnext'); await p.waitForTimeout(300);
  // 8 past / to words, with the counting clock
  const q8 = await p.evaluate(() => WR.Math._dbg());
  ok(await p.locator('.mopts .opt').count() === 4 && await p.locator('#vizBtn').count() === 1, `past/to: 4 word choices and the counting clock (${q8.a})`);
  await p.locator(`.mopts .opt[data-k="${q8.options.indexOf(q8.a)}"]`).click(); await p.waitForTimeout(250); await p.click('#mnext'); await p.waitForTimeout(400);
  st = await saved(p);
  ok(st.report && st.report.tally['m:g3.clock'] && st.report.tally['m:g3.clock'][0] >= 6 && st.math.topics['g3.clock'], `Learning Report: answers logged under m:g3.clock (${st.report.tally['m:g3.clock']}); the lesson result is saved`);
  ok(st.math.clock.done >= 4 && st.math.clock.hops >= 6, `save: ${JSON.stringify(st.math.clock)}`);
  // free-play Workshop
  await p.evaluate(() => WR.go('clock')); await p.waitForTimeout(300);
  await p.click('.cbtn[data-d="60"]'); for (let i = 0; i < 4; i++) await p.click('.cbtn[data-d="5"]'); for (let i = 0; i < 6; i++) await p.click('.cbtn[data-d="60"]'); await p.click('[data-ap="1"]'); await p.waitForTimeout(150);
  ok(await p.textContent('#wsTime') === '7:20 p.m.' && await p.textContent('#wsWords') === '20 minutes past 7' && await p.textContent('#ws24') === '19:20', 'Workshop: 7:20 p.m. reads "20 minutes past 7" and 19:20 on the 24-hour clock');
  await p.click('[data-ap="0"]'); ok(await p.textContent('#ws24') === '07:20', 'Workshop: ☀️ a.m. → 07:20');
  ok(await noOverflow(p) && !(await smallTaps(p)).length, `Workshop 375×667: no overflow, taps ≥ 40 px ${await smallTaps(p)}`);
  await p.screenshot({ path: OUT + 'clock_05_workshop.png' });
  st = await saved(p); ok(st.math.clock.plays === 1, 'save: a Workshop visit counts in math.clock.plays');
  // sticker, cloud, reload
  const stk = await p.evaluate(() => { const d = WR.MathGoals.STICKERS.find(s => s.id === 'clock5'); return d && [d.test(), d.prog().join('/')]; });
  ok(stk && stk[0] === (st.math.clock.done + st.math.clock.set >= 5), `sticker: 🕰️ Clock Keeper on the Number Kingdom page (${stk})`);
  const row = await p.evaluate(async () => { const C = WR.Cloud; let sent = null;
    const q = { select() { return q; }, eq() { return q; }, maybeSingle: async () => ({ data: null, error: null }), upsert(r) { sent = r; return { select: () => ({ single: async () => ({ data: { updated_at: new Date().toISOString() }, error: null }) }) }; } };
    C.client = async () => ({ from: () => q }); C.user = { id: 'test-user' }; C.username = 'mei'; await C.push(); C.user = null; return sent; });
  ok(row && row.data && row.data.math && row.data.math.clock && row.data.math.clock.set >= 1, 'cloud payload (saves.data) carries math.clock');
  await p.reload({ waitUntil: 'networkidle' }); ok(await p.evaluate(() => WR.Math.st().clock.set) >= 1, 'clock progress survives a reload');
  ok(!errors.length, 'phone: no console errors ' + errors.slice(0, 3));
  await ctx.close();

  // 320×658: every clock screen fits
  const c2 = await b.newContext({ viewport: { width: 320, height: 658 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }), p2 = await c2.newPage();
  await p2.goto(URL); await p2.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE); await p2.reload({ waitUntil: 'networkidle' });
  await p2.evaluate(l => WR.Math.startLesson({ topic: 'g3.clock', items: l.map(([t, s]) => MathGen.make(t, s)) }), [['g3.clock', sSet], ['g3.clock', sEnd], ['g1.time', 5]]); await p2.waitForTimeout(300);
  const c320 = await p2.locator('#mcheck').boundingBox();
  ok(await noOverflow(p2) && !(await smallTaps(p2)).length && c320.y + c320.height <= 658, `320×658 set: fits, taps ≥ 40 px, Check on screen (${Math.round(c320.y + c320.height)}) ${await smallTaps(p2)}`);
  await p2.screenshot({ path: OUT + 'clock_07_set_320.png' });
  await p2.evaluate(l => WR.Math.startLesson({ topic: 'g3.clock', items: l.map(([t, s]) => MathGen.make(t, s)) }), [['g3.clock', sEnd], ['g3.clock', sRead]]); await p2.waitForTimeout(250);
  await p2.click('#vizBtn'); await p2.waitForTimeout(250); await p2.click('#mviz [data-w="60"]'); await p2.waitForTimeout(150);
  await p2.screenshot({ path: OUT + 'clock_08_wind_320.png' });
  ok(await noOverflow(p2) && !(await smallTaps(p2)).length, `320×658 clock tool: fits, taps ≥ 40 px ${await smallTaps(p2)}`);
  await p2.evaluate(() => WR.go('clock')); await p2.waitForTimeout(250);
  ok(await noOverflow(p2) && !(await smallTaps(p2)).length, `320×658 Workshop: fits, taps ≥ 40 px ${await smallTaps(p2)}`);
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall clock checks passed');
})();
