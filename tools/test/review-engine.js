// 🔁 BRIEF-T2 review engine (js/review.js) with a fake clock: the 3/10/30/90-day schedule, 5 new + 3 review lessons (none in
// boss rounds), a different item on the same skill, the 20-hour rule (lessons, garden, charms), bloomed plants and 💎 charms
// coming back, the capped review star, save migration, the cloud merge and two tabs, the Singapore track, phone widths.
const { chromium } = require('playwright-core');
const BASE = process.env.BASE || 'http://127.0.0.1:18642', URL = BASE + '/index.html', OUT = '/workspace/cefr-quest/screenshots/';
const DAY = 864e5, H = 36e5;
let passed = 0; const assert = (c, m) => { if (!c) throw new Error('ASSERT ' + m); passed++; console.log('ok -', m); };
const near = (got, want, tol) => got != null && Math.abs(got - want) <= tol;
const SAVE = extra => Object.assign({ v: 1, name: 'Rae', avatar: 'avatar_mage', startLevel: 'a1', stars: 40, totalCorrect: 0, totalAnswered: 0,
  pet: { species: 'pet_fox', name: 'Mochi', xp: 0, happiness: 80, hunger: 20, skin: null, lastTick: Date.now() }, streak: { count: 1, last: null },
  progress: {}, owned: [], equipped: {}, settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 0 }, extra || {});
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const mkctx = async (vp = { width: 1100, height: 850 }, classic = true) => {
    const ctx = await browser.newContext({ viewport: vp, hasTouch: vp.width < 600, isMobile: vp.width < 600 });
    await ctx.addInitScript(c => { window.__WR_CLASSIC_ONLY = c; const R = Date, real = R.now.bind(R); let off = +(localStorage.getItem('__off') || 0);
      class F extends R { constructor(...a) { super(...(a.length ? a : [real() + off])); } static now() { return real() + off; } }
      window.Date = F; window.__shift = ms => { off += ms; localStorage.setItem('__off', off); }; }, classic);
    return ctx;
  };
  const errors = [];
  const open = async (ctx, save) => {
    const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::/.test(m.text())) errors.push(m.text()); });
    if (save !== undefined) {   // write the save from a page that isn't the game, so no running game can save over it
      await page.goto(BASE + '/manifest.webmanifest'); await page.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, save); }
    await page.goto(URL);
    await page.waitForFunction(() => window.WR && WR.realms && WR.Review); return page;
  };
  const shift = (page, ms) => page.evaluate(ms => __shift(ms), ms);
  // answer the lesson on screen: right (or wrong) through the real buttons
  const playUI = async (page, right = () => true) => {
    const log = [];
    for (let i = 0; i < 14; i++) {
      await page.waitForSelector('.opt:not([disabled]), #pool, .result', { timeout: 10000 }); if (await page.$('.result')) break;
      const cur = await page.evaluate(() => { const it = WR._cur(); return { rk: it._rk, rv: it._rv || null, sk: it._sk, c: WR._dbg() }; });
      const ok = right(cur, i); log.push(Object.assign(cur, { ok }));
      if (await page.$('#pool')) { const words = ok ? String(cur.c).split(' ') : null;
        if (words) for (const w of words) { const ts = await page.$$('#pool .tile'); for (const t of ts) if ((await t.textContent()).trim() === w) { await t.click(); break; } }
        else { const ts = await page.$$('#pool .tile'); for (const t of ts.reverse()) await t.click(); }
        while (await page.$('#pool .tile')) await page.click('#pool .tile'); await page.click('#checkBtn'); }
      else { for (const o of await page.$$('.opt')) { const t = (await o.textContent()).slice(1); if ((t === cur.c) === ok) { await o.click(); break; } } }
      await page.waitForSelector('#nextBtn'); await page.click('#nextBtn'); await page.waitForTimeout(40);
    }
    await page.waitForSelector('.result'); return log;
  };
  const ctx = await mkctx(); let page = await open(ctx, SAVE());

  // ---------- 1. one config ----------
  const cfg = await page.evaluate(() => WR.Review.CONFIG);
  assert(JSON.stringify(cfg.gaps) === '[3,10,30,90]' && cfg.minGapH === 20 && cfg.perLesson === 3 && cfg.lesson === 8, 'one config: gaps 3/10/30/90 days, 20 h minimum, 3 of 8 for review');
  assert(await page.evaluate(() => WR.Garden.STAGES.map(s => s.wait).join() === '0,3,10,30' && WR.Charms.STAGES.map(s => s.wait).slice(1, 5).join() === '3,10,30,90'), 'Mistake Garden and Word Charms read their waits from the same config');

  // ---------- 2. a real lesson records every answer; due reviews come into the next lesson (5 new + 3 review) ----------
  await page.evaluate(() => WR.startLesson({ realm: 'a1', skill: 'grammar', key: 'grammar', title: 't' }));
  const l0 = await playUI(page);
  assert(l0.length === 8 && l0.every(x => x.rk && x.rk.startsWith('a1/grammar:') && /^grammar\./.test(x.sk)) && l0.every(x => !x.rv), 'day 0: 8 new items, each with a review key and a grammar skill tag');
  const recs0 = await page.evaluate(ks => ks.map(k => WR.Review.items()[k]), l0.map(x => x.rk));
  assert(recs0.every(r => r && r.s === 1 && r.l === 1 && r.n === 1 && near((r.d - r.t) / DAY, 3, 0.01)), 'every right answer made a record: step 1, last result right, due in 3 days');
  await shift(page, 2 * DAY);
  await page.evaluate(() => WR.startLesson({ realm: 'a1', skill: 'grammar', key: 'grammar', title: 't' }));
  const l2 = await playUI(page); assert(l2.length === 8 && l2.every(x => !x.rv), 'day 2: nothing due yet, so 8 new');
  await shift(page, 1 * DAY + H);
  await page.evaluate(() => WR.startLesson({ realm: 'a1', skill: 'grammar', key: 'grammar', title: 't' }));
  await page.waitForSelector('.opt, #pool'); await page.waitForTimeout(700);
  await page.screenshot({ path: OUT + 't2_lesson_review_desktop.png' });
  const stars0 = await page.evaluate(() => ({ s: WR.state.stars, r: WR.earn().review }));
  const l3 = await playUI(page); const rv3 = l3.filter(x => x.rv);
  assert(l3.length === 8 && rv3.length === 3, `day 3: the lesson holds 3 review items + 5 new (got ${rv3.length} of ${l3.length})`);
  const day0Keys = new Set(l0.map(x => x.rk));
  assert(rv3.every(x => day0Keys.has(x.rv.for)), 'each review slot stands in for an item first answered on day 0');
  const tags = await page.evaluate(ks => ks.map(([a, b]) => [WR.Review.items()[a].sk, WR.Review.items()[b].sk]), rv3.map(x => [x.rk, x.rv.for]));
  assert(tags.every(([a, b]) => a === b), 'a review item has the same skill tag as the item it reviews');
  const diff = rv3.filter(x => x.rk !== x.rv.for).length;
  assert(diff >= 1, `review prefers a different item on the same skill (${diff} of 3 were different items)`);
  const st3 = await page.evaluate(() => ({ s: WR.state.stars, r: WR.earn().review }));
  assert(st3.r >= 3 && st3.r <= 10, `review answers paid the small review star (${st3.r - stars0.r} today, cap ${await page.evaluate(() => WR.EARN.review)})`);
  const after3 = await page.evaluate(ks => ks.map(k => WR.Review.items()[k].s), rv3.map(x => x.rv.for));
  assert(after3.every(s => s === 2), 'the reviewed items moved to step 2 (next gap 10 days)');

  // ---------- 3. the simulated child: one lesson a day; when does a correct item come back? ----------
  await page.close(); page = await open(ctx, SAVE());   // one tab at a time (an open tab would adopt and re-save its own copy)
  const sim = await page.evaluate(async () => {
    const out = {};
    for (const [rid, skill] of [['a1', 'vocab'], ['a1', 'grammar'], ['b1', 'listening']]) {
      const seen = {}, steps = {}; let first = null;
      for (let d = 0; d < 150; d++) {
        const items = await WR.buildItems(rid, skill, 8, { review: true });
        if (d === 0) first = items.map(x => x._rk);
        items.forEach(it => { (seen[it._rk] = seen[it._rk] || []).push(d); if (it._rv && it._rv.for !== it._rk) (seen[it._rv.for] = seen[it._rv.for] || []).push(d + 0.5); WR.Review.answer(it, true); });
        first.forEach(k => { const s = WR.Review.items()[k].s; const h = steps[k] = steps[k] || [1]; if (s > h.length) h.push(d); });
        __shift(864e5);
      }
      out[rid + '/' + skill] = first.map(k => ({ seen: seen[k], stepDays: steps[k].slice(1) }));
    }
    return out;
  });
  const vocab = sim['a1/vocab'];
  // the gap before each review: about 3, 10, 30 and 90 days (a few days late is "around": 3 review slots a lesson are shared)
  const WIN = [[2, 6], [9, 16], [27, 36], [81, 99]];
  const onTime = v => { const d = [0].concat(v.stepDays).slice(0, 5); return d.length === 5 && WIN.every(([lo, hi], i) => d[i + 1] - d[i] >= lo && d[i + 1] - d[i] <= hi); };
  console.log('review days of the day-0 items: vocab', JSON.stringify(vocab.map(v => v.stepDays)), 'grammar', JSON.stringify(sim['a1/grammar'].map(v => v.stepDays)), 'listening', JSON.stringify(sim['b1/listening'].map(v => v.stepDays)));
  const vOk = vocab.filter(v => onTime(v) && v.stepDays.slice(0, 4).every(d => v.seen.includes(d)));
  assert(vOk.length === vocab.length, `a simulated child sees each correct vocab item itself again after gaps of about 3, 10, 30 and 90 days (${vOk.length}/${vocab.length})`);
  for (const k of ['a1/grammar', 'b1/listening']) {
    const g = sim[k], ok = g.filter(onTime);
    assert(ok.length === g.length, `${k}: each correct item is reviewed (itself or a same-skill item) after gaps of about 3, 10, 30 and 90 days (${ok.length}/${g.length})`);
  }

  // ---------- 4. a right answer minutes after a mistake moves nothing ----------
  const minutes = await page.evaluate(async () => {
    const bank = await WR.bank('a2', 'grammar'), q = bank.find(x => x.type === 'mcq'), it = WR.Review.tag(WR.normalize(q), 'a2/grammar', q);
    WR.Review.answer(it, false); WR.Garden.plant(it, 'a2', 'grammar'); const r = WR.Review.items()[it._rk], afterWrong = { s: r.s, g: r.g, dueIn: (r.d - Date.now()) / 864e5 };
    __shift(5 * 60e3); const a = WR.Review.answer(it, true);
    const m = WR.state.mistakes[0]; __shift(60e3); const g5 = WR.Garden.grade(m.id, true);
    const thirstyAfter = WR.Garden.isDue(m);
    __shift(21 * 36e5); const g21 = WR.Garden.grade(m.id, true);
    // a word charm: catch, then polish a few minutes later
    const ch = WR.Charms.grade('a2', 'zzz-test', true); __shift(10 * 60e3); const ch2 = WR.Charms.grade('a2', 'zzz-test', true);
    return { afterWrong, lesson: { moved: a.moved, s: r.s }, g5, thirstyAfter, g21, ch, ch2 };
  });
  assert(minutes.afterWrong.s === 0 && minutes.afterWrong.g === 1 && near(minutes.afterWrong.dueIn, 1, 0.01), 'a wrong answer: step 0 (gap shortened to 1 day) and the Mistake Garden owns it');
  assert(!minutes.lesson.moved && minutes.lesson.s === 0, 'lesson record: a right answer 5 minutes after the mistake does not move it');
  assert(minutes.g5.box === 0 && !minutes.g5.moved && !minutes.g5.pay, 'garden: watering a seed right minutes after the mistake does not grow it (and pays no review star)');
  assert(!minutes.thirstyAfter, 'garden: …and that seed is not "thirsty" again straight away');
  assert(minutes.g21.box === 1 && minutes.g21.moved, 'garden: after a real gap (21 h) the right answer grows it to a sprout');
  assert(minutes.ch.b === 1 && minutes.ch2.b === 1 && !minutes.ch2.moved, 'word charms: catching is first learning; a polish minutes later does not move it');

  // ---------- 5. bloomed plants and 💎 charms come back rarely, never retire ----------
  const rare = await page.evaluate(async () => {
    const m = WR.state.mistakes[0], gaps = []; let last = Date.now(), bloomedAt = null;
    for (let i = 0; i < 500 && gaps.length < 7; i++) { __shift(864e5); if (WR.Garden.isDue(m)) { gaps.push(Math.round((Date.now() - last) / 864e5)); last = Date.now(); const g = WR.Garden.grade(m.id, true); if (g.bloomed) bloomedAt = gaps.length; } }
    const bloomedCount = WR.state.garden.bloomed;
    const due = WR.Garden.dueCount() >= 1;   // still in the garden, due again
    // a wrong answer on a bloomed plant: a seed again, the bloom count stays
    while (!WR.Garden.isDue(m)) __shift(864e5); WR.Garden.grade(m.id, false);
    return { gaps, bloomedAt, still: !!WR.state.mistakes.find(x => x.id === m.id), seed: m.box === 0 && !m.bloomed, bloomedCount, after: WR.state.garden.bloomed, due };
  });
  console.log('garden gaps (days):', rare.gaps.join(', '));
  assert(near(rare.gaps[0], 3, 1) && near(rare.gaps[1], 10, 1) && near(rare.gaps[2], 30, 3) && rare.gaps.slice(3).some(g => near(g, 90, 9)), 'garden: gaps grow 3 → 10 → 30 → 90 days');
  assert(rare.gaps.some(g => near(g, 180, 18)) && rare.still, 'garden: a bloomed plant comes back after ~180 days and never retires');
  assert(rare.seed && rare.after === rare.bloomedCount && rare.bloomedCount >= 1, 'garden: a slip on a bloomed plant makes it a seed again; the bloom count (and its stars) stay');
  const gem = await page.evaluate(() => { const g = []; let last = Date.now(); const k = 'a2:zzz-test', cs = WR.Charms.st().cards;
    for (let i = 0; i < 700 && g.length < 6; i++) { __shift(864e5); if (WR.Charms.isDue(cs[k])) { g.push(Math.round((Date.now() - last) / 864e5)); last = Date.now(); WR.Charms.grade('a2', 'zzz-test', true); } }
    return { g, b: cs[k].b }; });
  console.log('charm gaps (days):', gem.g.join(', '));
  assert(gem.b === 5 && gem.g.length >= 5 && near(gem.g[gem.g.length - 1], 180, 18), 'word charms: 3/10/30/90-day polishes, and a 💎 charm still comes back after ~180 days');

  // ---------- 6. the review star: small, once per answer, capped a day, inside the 150 cap ----------
  // (the game day follows the server date, so the fake clock doesn't start a new day: count from what is left today)
  const pay = await page.evaluate(() => { const room = WR.EARN.review - WR.earn().review, s0 = WR.state.stars, got = []; for (let i = 0; i < 14; i++) got.push(WR.Review.reward('test#' + i));
    const again = WR.Review.reward('test#0'); return { room, got, again, total: WR.state.stars - s0, review: WR.earn().review, cap: WR.EARN.review, practice: WR.earn().practice }; });
  assert(pay.room > 0 && pay.total === pay.room && pay.got.every(x => x === 0 || x === 1) && pay.review === pay.cap && pay.again === 0, `review stars: 1 each, at most ${pay.cap} a day (${pay.room} were left today), never twice for the same answer`);
  assert(pay.practice >= pay.cap, 'review stars count towards the 150-a-day practice cap');

  // ---------- 7. no reviews in boss rounds ----------
  const boss = await page.evaluate(async () => { await WR.Collect.startBoss('a1'); await new Promise(r => setTimeout(r, 400)); return { due: WR.Review.dueCount() }; });
  const bossCheck = await page.evaluate(async () => { const xs = await Promise.all([['grammar', 3], ['vocab', 3], ['listening', 2], ['reading', 2]].map(([k, n]) => WR.buildItems('a1', k, n)));
    return { any: xs.flat().some(x => x._rv), cur: !!(WR._cur() && WR._cur()._rv) }; });
  assert(boss.due > 0 && !bossCheck.any && !bossCheck.cur, `no review items in a realm boss round even with ${boss.due} reviews due`);
  await page.evaluate(() => WR.stopLesson());

  // ---------- 8. Singapore track feeds the same schedule ----------
  const sg = await page.evaluate(async () => {
    const lv = WR.SG.LEVELS ? WR.SG.LEVELS.find(l => l.id === 'p4') : WR.SG.level('p4');
    const a = await WR.SG.items('p4', 'grammar', 8, { review: true }); a.forEach(it => WR.Review.answer(it, true));
    const scopes = [...new Set(a.map(it => it._rk && it._rk.split(':')[0]))];
    __shift(3 * 864e5 + 36e5);
    const b = await WR.SG.items('p4', 'grammar', 8, { review: true });
    const mix = await WR.SG.mixItems('p4');
    return { n: a.length, keyed: a.every(it => it._rk), scopes, rv: b.filter(x => x._rv).length, nb: b.length, mixRv: mix.filter(x => x._rv).length };
  });
  assert(sg.keyed && sg.scopes.every(s => /^[a-c][12]\/grammar$/.test(s)), `Singapore P4 grammar answers go into the same records as the realms (${sg.scopes.join(', ')})`);
  assert(sg.rv === 3 && sg.nb === 8, `a Singapore round holds 3 due reviews + 5 new (${sg.rv}/${sg.nb})`);
  assert(sg.mixRv === 0, 'mixed practice stays as it is (no extra reviews)');

  // ---------- 9. migration of an older save (garden, charms) ----------
  const now = Date.now();   // open() clears the fake-clock offset with the save, so the page runs on real time again
  const old = SAVE({ stars: 321, garden: { bloomed: 2, rounds: 4 },
    mistakes: [{ id: 'm1', realm: 'a1', skill: 'grammar', type: 'mcq', q: 'I ___ a cat.', options: ['have', 'has', 'am', 'is'], correct: 'have', explain: 'I have', at: now - 400 * DAY, due: now - 300 * DAY, box: 4, misses: 1, bloomed: true, bloomedAt: now - 300 * DAY },
      { id: 'm2', realm: 'a1', skill: 'grammar', type: 'mcq', q: 'She ___ a dog.', options: ['has', 'have', 'am', 'is'], correct: 'has', explain: 'she has', at: now - 20 * DAY, due: now - 10 * DAY, box: 4, misses: 1, bloomed: true, bloomedAt: now - 10 * DAY },
      { id: 'm3', realm: 'a1', skill: 'grammar', type: 'mcq', q: 'We ___ happy.', options: ['are', 'is', 'am', 'be'], correct: 'are', explain: 'we are', at: now - DAY, due: now + DAY, box: 1, misses: 1, bloomed: false }],
    charms: { cards: { 'a1:apple': { b: 5, d: now - 200 * DAY, r: 5, w: 0, at: now - 260 * DAY }, 'a1:cat': { b: 2, d: now + 2 * DAY, r: 2, w: 0, at: now - 5 * DAY } }, rounds: 3, lvl: 'a1' },
    collect: { got: { 'charms:m1': 1 } } });
  await page.close(); page = await open(ctx, old);
  const mig = await page.evaluate(() => { const s = WR.state, m = id => s.mistakes.find(x => x.id === id), c = s.charms.cards;
    return { stars: s.stars, bloomed: s.garden.bloomed, n: s.mistakes.length, m1: (m('m1').due - Date.now()) / 864e5, m2: (m('m2').due - Date.now()) / 864e5, m3: m('m3').due, m3box: m('m3').box,
      apple: (c['a1:apple'].d - Date.now()) / 864e5, appleB: c['a1:apple'].b, cat: c['a1:cat'].d, mig: s.review.mig, items: Object.keys(s.review.items).length }; });
  assert(mig.stars === 321 && mig.bloomed === 2 && mig.n === 3 && mig.appleB === 5, 'migration keeps every star, plant, bloom count and charm');
  assert(mig.m1 > 0 && mig.m1 <= 31 && near(mig.m2, 80, 1), `bloomed plants get a return date (long past: within a month, ${mig.m1.toFixed(1)} d; recent: bloomed + 90 d, ${mig.m2.toFixed(1)} d)`);
  assert(mig.m3 === now + DAY && mig.m3box === 1, 'growing plants keep their stage and date');
  assert(mig.apple > 0 && mig.apple <= 31 && mig.cat === now + 2 * DAY, 'a 💎 charm gets a return date; resting charms keep theirs');
  assert(mig.mig === 1, 'the save is marked migrated (inside wordRealms.save.v1)');
  await page.evaluate(() => WR.save()); await page.reload(); await page.waitForFunction(() => window.WR && WR.Review);
  const mig2 = await page.evaluate(() => WR.state.mistakes.find(x => x.id === 'm1').due);
  const savedDue = await page.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).mistakes.find(x => x.id === 'm1').due);
  assert(mig2 === savedDue, 'migration runs once: reloading keeps the same dates');

  // ---------- 10. cloud merge + two tabs ----------
  const merged = await page.evaluate(() => { const a = { items: { x: { s: 2, t: 10 }, y: { s: 1, t: 50 } }, mig: 1 }, b = { items: { x: { s: 3, t: 20 }, z: { s: 4, t: 5 } }, mig: 1 };
    const m = WR.Review.merge(a, b), e = WR.mergeEarn({ day: '2026-11-04', practice: 5, review: 7, got: {} }, { day: '2026-11-04', practice: 9, review: 3, got: {} });
    return { x: m.items.x.s, y: m.items.y.s, z: m.items.z.s, review: e.review, practice: e.practice }; });
  assert(merged.x === 3 && merged.y === 1 && merged.z === 4, 'cloud: two saves merge per item, the later answer wins, nothing is lost');
  assert(merged.review === 7 && merged.practice === 9, 'cloud: the review-star count keeps the stricter of the two (no reset by switching saves)');
  assert(await page.evaluate(() => fetch('js/cloud.js').then(r => r.text()).then(t => /WR\.Review\.merge\(WR\.state\.review, other\.review\)/.test(t))), 'cloud.js merges the review records whenever a cloud save is applied');
  const tabA = page, tabB = await open(ctx); await tabB.waitForTimeout(1000);   // let the new tab finish starting up
  await tabA.evaluate(async () => { const b = await WR.bank('a1', 'vocab'); const it = WR.Review.tag(WR.normalize(b[0]), 'a1/vocab', b[0]); WR.Review.answer(it, true); window.__k = it._rk; });
  const k = await tabA.evaluate(() => window.__k); await tabB.waitForTimeout(300);
  assert(await tabB.evaluate(k => !!WR.state.review.items[k], k), 'two tabs: the other tab adopts the new review record');
  await tabB.evaluate(() => { WR.state.stars += 1; WR.save(); }); await tabA.waitForTimeout(300);
  assert(await tabA.evaluate(k => !!WR.state.review.items[k] && !!JSON.parse(localStorage.getItem('wordRealms.save.v1')).review.items[k], k), 'two tabs: a save from the other tab keeps the record');
  await tabB.close();

  // ---------- 11. skill tags in the banks ----------
  const tagsOk = await page.evaluate(async () => { let n = 0, bad = 0; for (const r of ['a1', 'b2', 'c2']) for (const k of ['grammar', 'vocab', 'listening', 'reading']) { const b = await WR.bank(r, k);
    for (const q of k === 'reading' ? b.passages.flatMap(p => p.questions) : b) { n++; if (!new RegExp('^' + k + '\\.[a-z0-9-]+$').test(q.sk || '')) bad++; } } return { n, bad }; });
  assert(tagsOk.bad === 0 && tagsOk.n > 1500, `every core-bank item has a skill tag (${tagsOk.n} checked)`);

  // ---------- 12. phones: a lesson with reviews, the garden, a charm ----------
  for (const vp of [{ width: 320, height: 640, n: '320' }, { width: 360, height: 740, n: '360' }, { width: 375, height: 667, n: '375' }, { width: 740, height: 360, n: 'landscape' }]) {
    const c = await mkctx({ width: vp.width, height: vp.height }); const p = await open(c, SAVE());
    await p.evaluate(async () => { for (let d = 0; d < 2; d++) { const xs = await WR.buildItems('a1', 'grammar', 8, { review: true }); xs.forEach(it => WR.Review.answer(it, true)); }
      __shift(3 * 864e5 + 36e5); });
    await p.evaluate(() => WR.startLesson({ realm: 'a1', skill: 'grammar', key: 'grammar', title: 'Grammar' }));
    let seenRv = false;
    for (let i = 0; i < 8; i++) {
      await p.waitForSelector('.opt:not([disabled]), #pool'); await p.waitForTimeout(250); const isRv = await p.evaluate(() => !!WR._cur()._rv), tiles = !!(await p.$('#pool'));
      const lay = await p.evaluate(sel => { const os = [...document.querySelectorAll(sel)]; return { h: Math.min(...os.map(o => o.getBoundingClientRect().height)), who: os.map(o => o.id || o.className + ':' + Math.round(o.getBoundingClientRect().height)).join(' '),
        off: os.some(o => { const r = o.getBoundingClientRect(); return r.right > innerWidth + 1 || r.left < -1; }), scroll: document.documentElement.scrollWidth > innerWidth + 1 }; }, tiles ? '#pool .tile, #checkBtn' : '.opt');
      assert(Math.round(lay.h) >= 44 && !lay.off && !lay.scroll, `${vp.n}: question ${i + 1}${isRv ? ' (review)' : ''} answers fit the screen, tap targets ${Math.round(lay.h)} px` + (Math.round(lay.h) < 44 ? ' ' + lay.who : ''));
      if (isRv && !seenRv) { seenRv = true; await p.waitForTimeout(700); await p.screenshot({ path: OUT + `t2_${vp.n}_lesson_review.png` }); }
      const cc = await p.evaluate(() => WR._dbg());
      if (tiles) { for (const w of String(cc).split(' ')) for (const t of await p.$$('#pool .tile')) if ((await t.textContent()).trim() === w) { await t.click(); break; } await p.click('#checkBtn'); }
      else for (const o of await p.$$('.opt')) if ((await o.textContent()).slice(1) === cc) { await o.click(); break; }
      await p.waitForSelector('#nextBtn'); await p.click('#nextBtn'); await p.waitForTimeout(30);
    }
    assert(seenRv, `${vp.n}: the lesson held review items`);
    await p.waitForSelector('.result'); await p.screenshot({ path: OUT + `t2_${vp.n}_result.png` });
    // the garden with a plant answered minutes after the mistake (not thirsty) and a bloomed plant due again
    await p.evaluate(async () => { const b = await WR.bank('a1', 'grammar'); [b[1], b[2]].forEach(q => WR.Garden.plant(WR.normalize(q), 'a1', 'grammar'));
      const m = WR.state.mistakes[1]; m.box = 4; m.bloomed = true; m.bloomedAt = Date.now() - 91 * 864e5; m.due = Date.now() - 1000; WR.go('review'); });
    await p.waitForSelector('#waterBtn'); await p.waitForTimeout(200);
    const gl = await p.evaluate(() => ({ plots: document.querySelectorAll('.garden-bed .plot').length, scroll: document.documentElement.scrollWidth > innerWidth + 1, h: document.querySelector('#waterBtn').getBoundingClientRect().height }));
    assert(gl.plots === 2 && !gl.scroll && Math.round(gl.h) >= 44, `${vp.n}: the garden shows the seed and the bloomed plant back for a drink, no sideways scroll`);
    await p.screenshot({ path: OUT + `t2_${vp.n}_garden.png`, fullPage: vp.n !== 'landscape' });
    await c.close();
  }
  assert(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  console.log(`\nreview-engine: ${passed} passed`);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
