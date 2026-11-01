// 📊 Learning Report (grown-ups): the parent gate is required; the report renders from a seeded save (stats, 7-day chart,
// English skill × level grid, maths per grade/topic, 3 weak spots with working "Practise this", 2–3 tips, all-time view);
// a finished lesson is logged (today's lessons, minutes, per-skill tallies); an old save without a report migrates and its
// play days are rebuilt; the cloud payload carries the new fields; it fits 375×667 and 320×658 phones (no overflow, taps ≥ 40 px).
// node tools/test/report.js   (screenshots: screenshots/report_*.png)
process.env.TZ = 'Asia/Singapore';                 // same calendar days in Node and the browser (timezoneId below)
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const DAY = 864e5;
const key = t => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const today = () => key(Date.now());
const ago = n => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - n); return d.getTime(); };
const base = extra => Object.assign({ v: 1, name: 'Mei', avatar: 'avatar_girl', startLevel: 'a1', stars: 80, totalCorrect: 70, totalAnswered: 100,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 120, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 3, last: today() }, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: true }, lessonsDone: 14 }, extra);
// old save: made before the report existed (no `report` field), with dated progress, a maths topic and a story chapter
const OLD = base({ progress: { a1: { grammar: { best: 0.9, plays: 3, last: ago(1) }, vocab: { best: 0.5, plays: 2, last: ago(3) } }, a2: { listening: { best: 0.4, plays: 1, last: ago(20) } } },
  math: { grade: 3, topics: { 'g3.times': { best: 0.45, plays: 2, last: ago(3) } } }, stories: { done: { a1: { best: 0.8, crowns: 2, plays: 1, at: ago(5) } }, words: {}, reads: 0 }, mistakes: [] });
// seeded save with a report: 4 of the last 7 days played, tallies for English + maths, Mistake Garden plants
const T = { 'a1/grammar': [18, 2], 'a1/vocab': [9, 7], 'a1/reading': [7, 1], 'a2/listening': [3, 6], 'a1/speaking': [4, 1], 'a1/story': [4, 1], 'm:g3.times': [10, 2], 'm:g3.eqfrac': [2, 5], 'm:dojo.tower': [20, 4] };
const days = {};
[[0, 600, 3, { 'a1/grammar': [8, 1], 'a2/listening': [1, 3], 'm:g3.eqfrac': [1, 3] }], [1, 420, 2, { 'a1/vocab': [5, 4] }], [3, 900, 4, { 'a1/grammar': [10, 1], 'm:g3.times': [10, 2] }],
 [5, 300, 1, { 'a1/reading': [7, 1] }], [12, 500, 2, { 'a1/vocab': [4, 3] }]].forEach(([n, s, l, k]) => days[key(ago(n))] = { s, l, k });
const SEEDED = base({ progress: { a1: { grammar: { best: 0.95, plays: 4 }, vocab: { best: 0.6, plays: 3 }, reading: { best: 0.85, plays: 1 }, speaking: { best: 0.8, plays: 1 } }, a2: { listening: { best: 0.35, plays: 2 } } },
  math: { grade: 3, topics: { 'g3.times': { best: 0.85, plays: 2 }, 'g3.eqfrac': { best: 0.3, plays: 1 } } },
  mistakes: [0, 1, 2].map(i => ({ id: 'mv' + i, realm: 'a1', skill: 'vocab', type: 'mcq', q: 'Pick the word ' + i, options: ['a', 'b', 'c', 'd'], correct: 'a', explain: 'x', at: Date.now(), due: Date.now(), box: 0, misses: 1, bloomed: false })),
  report: { days, tally: T, at: 0 } });
const MOB = { deviceScaleFactor: 2, isMobile: true, hasTouch: true };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  async function open(vp, seed, mob = true) {
    const ctx = await browser.newContext(Object.assign(mob ? { ...MOB, viewport: vp } : { viewport: vp }, { timezoneId: 'Asia/Singapore' }));
    await ctx.addInitScript(() => { window.__WR_TEST = { holdMs: 0, pinOffer: false }; });   // R4: gate test hooks (never on the live site)
    await ctx.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('wordRealms.save.v1', s); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify(seed));
    await ctx.route(/supabase\.co|cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)/, r => r.abort());
    const page = await ctx.newPage(); page.errs = [];
    page.on('pageerror', e => page.errs.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_FAILED|cloud library|supabase/i.test(m.text())) page.errs.push(m.text()); });
    await page.goto(BASE + 'index.html', { waitUntil: 'networkidle' });
    await page.waitForSelector('.realm-node', { timeout: 15000 }).catch(async e => { console.log('DEBUG', page.errs, (await page.innerText('body')).slice(0, 400), await page.evaluate(() => localStorage.getItem('wordRealms.save.v1').slice(0, 200))); throw e; });
    return page;
  }
  const pass = async page => { const a = await page.evaluate(() => WR.parentGate._answer()); for (const d of a) await page.click(`.pgate [data-d="${d}"]`); await page.click('#pgOk'); };
  const clean = async p => { await p.evaluate(() => document.querySelectorAll('.confetti-layer,.toast').forEach(e => e.remove())); await p.waitForTimeout(700); };
  // tap-target + fit audit for the report (and any modal on top)
  const fit = page => page.evaluate(() => {
    const bad = [], vis = el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    const scope = [...document.querySelectorAll('.modal-bg')].pop() || document.getElementById('main');
    for (const el of [...scope.querySelectorAll('button,.btn,input')].filter(vis)) {
      el.scrollIntoView({ block: 'center', behavior: 'instant' }); const lab = el.tagName === 'INPUT' && el.closest('label'), r = (lab || el).getBoundingClientRect();
      if (r.height < 40 && !el.closest('.pad')) bad.push('small ' + (el.id || el.textContent.trim().slice(0, 20)) + ' ' + Math.round(r.height));
      if (r.left < -1 || r.right > innerWidth + 1) bad.push('off-screen ' + (el.id || el.textContent.trim().slice(0, 20)));
      const hit = document.elementFromPoint(Math.min(innerWidth - 1, r.left + r.width / 2), r.top + Math.min(r.height / 2, 20));
      if (!hit || !(el === hit || el.contains(hit) || (lab && lab.contains(hit)))) bad.push('covered ' + (el.id || el.textContent.trim().slice(0, 20)));
    }
    const over = [...document.querySelectorAll('#main *')].filter(e => { if (e.closest('.rp-scroll') && e !== e.closest('.rp-scroll')) return false; const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).map(e => e.className || e.tagName).slice(0, 5);
    window.scrollTo(0, 0);
    return { bad, over, sw: document.documentElement.scrollWidth };
  });

  /* 1. migration of an old save */
  {
    const page = await open({ width: 375, height: 667 }, OLD);
    const r = await page.evaluate(() => WR.state.report);
    ok(r && typeof r.days === 'object' && typeof r.tally === 'object', 'old save gains a report block (days, tally)');
    const want = [1, 3, 5, 20].map(n => key(ago(n)));
    ok(want.every(d => r.days[d] && r.days[d].l >= 1 && r.days[d].est) && r.days[today()] && Object.keys(r.days).length === 5, 'play days are rebuilt from saved progress, maths topics, story dates and the streak day');
    ok(r.days[key(ago(3))].l === 2 && !!r.seeded, 'two things played on one day count as 2 lessons; marked as rebuilt');
    ok(await page.evaluate(() => { const p = JSON.parse(localStorage.getItem('wordRealms.save.v1')).progress; return p.a1.grammar.best === 0.9 && p.a1.grammar.plays === 3 && WR.state.totalCorrect === 70 && WR.state.lessonsDone === 14; }), 'old progress and totals are untouched');
    await page.evaluate(() => WR.save()); await page.reload({ waitUntil: 'networkidle' });
    ok(await page.evaluate(() => Object.keys(WR.state.report.days).length) === 5, 'after saving, reload keeps the same rebuilt days (no re-seeding)');
    // all-time report shows best scores from the old save
    await page.evaluate(() => WR.go('report', 'all')); await pass(page); await page.waitForSelector('#report');
    const txt = await page.innerText('#report');
    ok(/best/.test(txt) && /90%/.test(txt) && /Grade 3/.test(txt), 'all-time report shows the old best scores (English 90%, Grade 3 maths)');
    ok(await page.$$eval('.rp-weak', w => w.length) >= 2, 'old save: weak spots from low best scores (vocab 50%, listening 40%, times 45%)');
    ok(page.errs.length === 0, 'migration: no page errors ' + page.errs.join(' | '));
    await page.context().close();
  }

  /* 2–5. gate, seeded report, practise, phone fit */
  for (const vp of [{ width: 375, height: 667 }, { width: 320, height: 658 }]) {
    const tag = vp.width + 'px', page = await open(vp, SEEDED), big = vp.width === 375;
    // gate required
    await page.evaluate(() => WR.go('report'));
    await page.waitForSelector('.pgate');
    ok(!(await page.$('#report')) && !!(await page.$('#reportLocked')), `${tag}: report is locked behind the parent gate`);
    ok(!/%/.test(await page.innerText('#main')), `${tag}: no results are shown before the gate`);
    if (big) { await clean(page); await page.screenshot({ path: OUT + 'report_01_gate.png' }); }
    await page.click('#pgClose'); await page.waitForTimeout(150);
    ok(!(await page.$('#report')), `${tag}: "Not now" keeps it locked`);
    // through Settings → 👪 Grown-ups → 📊 Learning Report
    await page.evaluate(() => WR.go('home')); await page.click('#setBtn'); await page.waitForSelector('#guBtn'); await page.click('#guBtn');
    await page.waitForSelector('.pgate'); await pass(page); await page.waitForSelector('#guReport');
    let f = await fit(page); ok(!f.bad.length, `${tag}: Grown-ups panel with the report button fits (${f.bad.join(', ')})`);
    if (big) await page.screenshot({ path: OUT + 'report_02_grownups.png' });
    await page.click('#guReport'); await page.waitForSelector('#report');
    // seeded numbers
    const st = await page.$$eval('.rp-stat b', b => b.map(x => x.textContent));
    ok(st[0] === '4/7', `${tag}: 4 of the last 7 days played (${st[0]})`);
    ok(st[1] === '3' && st[2] === '10', `${tag}: streak 3, 10 lessons this week (${st[1]}, ${st[2]})`);
    ok(st[3] === '74%', `${tag}: this week's accuracy 74% (42 of 57) (${st[3]})`);
    ok(await page.$$eval('.rp-bar', b => b.length) === 7, `${tag}: 7 bars in the chart`);
    ok(await page.$eval('.rp-chart', c => c.getAttribute('aria-label')).then(a => /15 minutes/.test(a)), `${tag}: bars show minutes (15 min three days ago)`);
    const grid = await page.$$eval('.rp-table thead th', t => t.map(x => x.textContent).filter(Boolean));
    ok(grid.join(',') === 'A1,A2', `${tag}: English grid has the played levels A1, A2 (${grid})`);
    const rows = await page.$$eval('.rp-table tbody tr', r => r.map(x => x.innerText.replace(/\s+/g, ' ')));
    ok(rows.length === 7 && /Grammar 90%/.test(rows[0]) && /Listening · 25%/.test(rows[3]), `${tag}: 7 skill rows; grammar A1 90%, listening A2 25% (${rows[0]} | ${rows[3]})`);
    ok(await page.$$eval('.rp-grade', g => g.length) === 1 && /Grade 3/.test(await page.innerText('.rp-grade')), `${tag}: maths shows Grade 3 this week`);
    const weak = await page.$$eval('.rp-weak', w => w.map(x => x.innerText.replace(/\s+/g, ' ')));
    ok(weak.length === 3, `${tag}: top 3 weak spots (${weak.join(' / ')})`);
    ok(weak.some(w => /A2 Listening/.test(w)) && weak.some(w => /A1 Vocabulary/.test(w) && /Mistake Garden/.test(w)), `${tag}: weak spots include A2 Listening and A1 Vocabulary (with garden plants)`);
    const tips = await page.$$eval('.rp-tips li', l => l.length);
    ok(tips >= 2 && tips <= 3, `${tag}: ${tips} tips for grown-ups`);
    f = await fit(page);
    ok(f.sw <= vp.width && !f.over.length, `${tag}: no sideways overflow (scrollWidth ${f.sw}${f.over.length ? ', ' + f.over.join(' ') : ''})`);
    ok(!f.bad.length, `${tag}: every button ≥ 40 px, on screen and tappable (${f.bad.join(', ')})`);
    if (big) { await clean(page); await page.screenshot({ path: OUT + 'report_03_week_top.png' }); await page.screenshot({ path: OUT + 'report_04_week_full.png', fullPage: true }); }
    else { await clean(page); await page.screenshot({ path: OUT + 'report_07_320_full.png', fullPage: true }); }
    // all time
    await page.click('.rp-tabs [data-range="all"]'); await page.waitForSelector('.rp-tabs [data-range="all"].on');
    const st2 = await page.$$eval('.rp-stat b', b => b.map(x => x.textContent));
    ok(st2[0] === '5' && st2[2] === '14' && st2[3] === '70%', `${tag}: all time: 5 days, 14 lessons, 70% (${st2})`);
    ok(await page.$$eval('.rp-bar', b => b.length) === 8, `${tag}: all time: 8 weekly bars`);
    ok(/Times-Table Tower/.test(await page.innerText('#report')), `${tag}: all time maths includes the Times-Table Tower`);
    f = await fit(page); ok(f.sw <= vp.width && !f.bad.length, `${tag}: all-time view fits (${f.sw}; ${f.bad.join(', ')})`);
    if (big) { await clean(page); await page.screenshot({ path: OUT + 'report_05_all_full.png', fullPage: true }); }
    // Practise this → the right lesson
    await page.click('.rp-tabs [data-range="week"]'); await page.waitForSelector('.rp-tabs [data-range="week"].on');
    const li = await page.$$eval('.rp-weak', w => w.findIndex(x => /A2 Listening/.test(x.innerText)));
    await page.locator('.rp-go').nth(li).click();
    await page.waitForSelector('.opt', { timeout: 8000 });
    const hud = await page.$eval('.hud .pill', e => e.textContent);
    ok(/A2/.test(hud) && /Listening/i.test(hud), `${tag}: "Practise this" opens an A2 Listening lesson (${hud.replace(/\s+/g, ' ').slice(0, 50)})`);
    if (big) { await clean(page); await page.screenshot({ path: OUT + 'report_06_practise.png' }); }
    ok(page.errs.length === 0, `${tag}: no page errors ${page.errs.join(' | ')}`);
    await page.context().close();
  }

  /* 6. a finished lesson is logged; 7. cloud payload carries it */
  {
    const page = await open({ width: 1100, height: 820 }, SEEDED, false);
    const before = await page.evaluate(() => JSON.parse(JSON.stringify(WR.state.report.days[WR.today()])));
    // multiple-choice items only, so the loop below can always tap an option
    await page.evaluate(async () => { const items = (await WR.bank('a1', 'grammar')).filter(q => q.type === 'mcq' || !q.type && q.options).slice(0, 8).map(q => WR.normalize(q));
      WR.startLesson({ realm: 'a1', skill: 'grammar', key: 'grammar', title: 'Grammar', items }); });
    await page.waitForSelector('.opt');
    const n = await page.evaluate(() => document.querySelector('.qnum').textContent.split('/')[1] | 0);
    let right = 0;
    for (let i = 0; i < n; i++) {
      await page.waitForSelector('.opt:not([disabled])');
      const want = i % 4 !== 3;                 // 1 in 4 wrong on purpose
      await page.evaluate(w => { const c = WR._dbg(); const b = [...document.querySelectorAll('.opt')].find(x => (x.textContent.trim().slice(1).trim() === c || x.innerText.includes(c)) === w) || document.querySelector('.opt'); b.click(); }, want);
      if (want) right++;
      await page.waitForSelector('#nextBtn'); await page.waitForTimeout(80); await page.click('#nextBtn');
    }
    await page.waitForSelector('.result');
    const after = await page.evaluate(() => WR.state.report.days[WR.today()]);
    const tAll = await page.evaluate(() => WR.state.report.tally['a1/grammar']);
    ok(after.l === before.l + 1, `lesson logged: today's lessons ${before.l} → ${after.l}`);
    const kb = before.k['a1/grammar'] || [0, 0], ka = after.k['a1/grammar'];
    ok(ka[0] + ka[1] === kb[0] + kb[1] + n, `today's a1/grammar tally grew by ${n} answers (${kb} → ${ka})`);
    ok(tAll[0] + tAll[1] === 20 + n, `all-time a1/grammar tally grew by ${n} (${tAll})`);
    ok(ka[0] - kb[0] === right || Math.abs(ka[0] - kb[0] - right) <= 1, `right answers counted (${ka[0] - kb[0]} of ${right} intended)`);
    ok(after.s > before.s, `active seconds grew (${before.s} → ${after.s})`);
    ok(await page.evaluate(() => WR.state.daily.quests.every(q => q.id !== 'lesson2' || q.progress >= 1)), 'the "Complete 2 lessons" quest still counts (via WR.activityDone)');
    // a maths answer is tallied by topic
    await page.evaluate(() => { WR.go('math'); WR.Math.startLesson({ topic: 'g2.addsub' in {} ? 'g2.addsub' : MathGen.gradeTopics(2)[0].id }); });
    await page.waitForSelector('#mans,.mopts .opt');
    const mt = await page.evaluate(() => { const q = WR.Math._dbg(); return q.topic; });
    await page.evaluate(() => { const q = WR.Math._dbg(); const inp = document.getElementById('mans'); if (inp) { inp.value = String(q.a).replace(/\$/g, ''); } });
    await page.evaluate(() => { const q = WR.Math._dbg(); const opt = [...document.querySelectorAll('.mopts .opt[data-k]')].find(b => q.options && q.options[+b.dataset.k] === q.a); if (opt) opt.click(); else document.getElementById('mcheck') && document.getElementById('mcheck').click(); });
    await page.waitForTimeout(300);
    const mk = await page.evaluate(t => WR.state.report.days[WR.today()].k['m:' + t], mt);
    ok(mk && mk[0] + mk[1] >= 1, `maths answers are tallied by topic (m:${mt} ${mk})`);
    // cloud payload: fake Supabase client, capture the upserted row
    const row = await page.evaluate(async () => {
      const C = WR.Cloud; let sent = null;
      const q = { select() { return q; }, eq() { return q; }, maybeSingle: async () => ({ data: null, error: null }),
        upsert(r) { sent = r; return { select: () => ({ single: async () => ({ data: { updated_at: new Date().toISOString() }, error: null }) }) }; } };
      C.client = async () => ({ from: () => q }); C.user = { id: 'test-user' }; C.username = 'mei';
      await C.push(); C.user = null; return sent;
    });
    ok(row && row.data && row.data.report && row.data.report.days[await page.evaluate(() => WR.today())].l >= 1 && row.data.report.tally['a1/grammar'], 'cloud payload (saves.data) includes report.days and report.tally');
    // an old cloud save (no report) applied on this device migrates
    const mig = await page.evaluate(old => { WR.Cloud.apply(old, new Date().toISOString()); return WR.state.report; }, OLD);
    ok(mig && Object.keys(mig.days).length === 5 && mig.seeded, 'an old cloud save without a report is migrated when applied');
    ok(page.errs.length === 0, 'logging: no page errors ' + page.errs.join(' | '));
    await page.context().close();
  }
  await browser.close();
  console.log(fails ? `\n${fails} report checks FAILED (${passes} passed)` : `\nALL ${passes} REPORT CHECKS PASSED`);
})().catch(e => { console.error(e); process.exit(1); });
