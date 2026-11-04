// 🏁 BRIEF-T4 "make a pass mean something" through real taps, with a fake clock and a server-date override ("tomorrow"):
// pass at about 7 of 8 (WR.PASS.mark 0.85), all 4 skills confirmed by a later-day ✨ crown check (4 questions) open the next
// realm, Polish me ✨ on old crowns (the crown stays), help after 2 tries (Learn lesson + easier path), kind words, older saves
// keep every open realm / awake boss / crown, cloud merge + two tabs, phone widths. Screenshots screenshots/t4_*.png.
const { chromium } = require('playwright-core');
const BASE = process.env.BASE || 'http://127.0.0.1:18642', URL = BASE + '/index.html', OUT = '/workspace/cefr-quest/screenshots/';
const DAY = 864e5;
let passed = 0; const assert = (c, m) => { if (!c) throw new Error('ASSERT ' + m); passed++; console.log('ok -', m); };
const SAVE = extra => Object.assign({ v: 1, name: 'Rae', avatar: 'avatar_mage', startLevel: 'a1', stars: 40, totalCorrect: 0, totalAnswered: 0,
  pet: { species: 'pet_fox', name: 'Mochi', xp: 0, happiness: 80, hunger: 20, skin: null, lastTick: Date.now() }, streak: { count: 1, last: null },
  progress: {}, owned: [], equipped: {}, settings: { rate: .9, sound: false, unlockAll: false }, mistakes: [], lessonsDone: 0, bonusSeen: ['sp'] }, extra || {});
const dk = t => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  let days = 0;   // the server date override: the game day is "today + days"
  const mkctx = async (vp = { width: 1100, height: 850 }) => {
    const ctx = await browser.newContext({ viewport: vp, hasTouch: vp.width < 600, isMobile: vp.width < 600 });
    await ctx.addInitScript(() => { const R = Date, real = R.now.bind(R); let off = +(localStorage.getItem('__off') || 0);
      class F extends R { constructor(...a) { super(...(a.length ? a : [real() + off])); } static now() { return real() + off; } }
      window.Date = F; window.__shift = ms => { off += ms; localStorage.setItem('__off', off); }; });
    await ctx.route(/index\.html/, route => route.request().method() === 'HEAD'
      ? route.fulfill({ status: 200, headers: { Date: new Date(Date.now() + days * DAY).toUTCString() }, body: '' }) : route.continue());
    return ctx;
  };
  const errors = [];
  const open = async (ctx, save) => {
    const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::/.test(m.text())) errors.push(m.text()); });
    if (save !== undefined) { await page.goto(BASE + '/manifest.webmanifest'); await page.evaluate(([s, d]) => { localStorage.clear(); localStorage.setItem('__off', String(d * 864e5)); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, [save, days]); }
    await page.goto(URL); await page.waitForFunction(() => window.WR && WR.realms && WR.Pass); await page.waitForTimeout(700); return page;
  };
  // "tomorrow": the server date and the page clock move on a day; reload so the game reads the new day
  const nextDay = async (page, n = 1) => { days += n; await page.evaluate(n => __shift(n * 864e5), n); await page.reload(); await page.waitForFunction(() => window.WR && WR.realms && WR.Pass); await page.waitForTimeout(700); };
  // answer the lesson question on screen through the real controls, right or wrong
  const answer = async (page, right) => {
    await page.waitForSelector('.opt:not([disabled]), #pool .tile, .mword, #dictIn', { timeout: 10000 });
    const it = await page.evaluate(() => { const it = WR._cur(); return { type: it.type, correct: it.correct, answer: it.answer, answers: it.answers, wrong: it.wrong, options: it.options, events: it.events, headings: it.headings, hit: it.hit }; });
    const tiles = async list => { for (const w of list) for (const b of await page.$$('#pool .tile')) if ((await b.innerText()).trim() === w) { await b.click(); break; } };
    const fill = async () => { while (await page.$('#pool .tile')) { await page.click('#pool .tile'); if (await page.$eval('#checkBtn', b => !b.disabled).catch(() => false)) break; } };
    if (it.type === 'spell') { const w = String(it.answer).split(''); await tiles(right ? w : w.slice().reverse()); if (!right) await fill(); if (!right && await page.evaluate(() => WR._cur()._built.map(t => t.w).join('') === WR._cur().answer)) { await page.click('#clearBtn'); await tiles(w.slice(1).concat(w[0])); await fill(); } await page.click('#checkBtn'); }
    else if (it.type === 'findword') { const ws = await page.$$('.fwords .mword'); await ws[right ? it.hit : (it.hit + 1) % ws.length].click(); }
    else if (it.type === 'events' || it.type === 'headings') { const w = it.events || it.headings; await tiles(right ? w : w.slice().reverse()); await fill(); await page.click('#checkBtn'); }
    else if (it.type === 'mistake') { const ws = await page.$$('.mword'); await ws[right ? it.wrong : (it.wrong + 1) % ws.length].click(); }
    else if (it.type === 'gaps') { await tiles(right ? it.answers : it.answers.slice().reverse()); await fill(); await page.click('#checkBtn'); }
    else if (it.type === 'dictate') { await page.fill('#dictIn', right ? it.answer : 'xyz qq'); await page.click('#checkBtn'); }
    else if (!it.options && await page.$('#pool')) { const w = String(it.answer || it.correct).split(' '); await tiles(right ? w : w.slice().reverse()); await fill(); await page.click('#checkBtn'); }
    else { const opts = await page.$$('.opt'); let hit = false;
      for (const b of opts) { const lab = (await b.getAttribute('aria-label')) || '', tx = (await b.innerText()).replace(/^[A-D]\s*/, '').trim(), is = lab === it.correct || tx === it.correct || (await b.textContent()).slice(1) === it.correct;
        if (is === right) { await b.click(); hit = true; break; } }
      if (!hit && !it.options) { console.log('UNHANDLED', JSON.stringify(it), await page.evaluate(() => document.querySelector('#app, main, body').innerHTML.slice(0, 1500))); }
      if (!hit) await opts[right ? Math.max(0, it.options.indexOf(it.correct)) : 0].click(); }
    await page.waitForSelector('#nextBtn'); const ok = await page.evaluate(() => /Correct|Brilliant|Great|Yes|right/i.test(document.querySelector('#explain') ? document.querySelector('#explain').innerText : ''));
    await page.click('#nextBtn'); await page.waitForTimeout(50); return ok;
  };
  const play = async (page, right) => { for (let i = 0; i < 14; i++) { await page.waitForSelector('.opt:not([disabled]), #pool .tile, .mword, #dictIn, .result', { timeout: 10000 }); if (await page.$('.result')) break; await answer(page, right(i)); } await page.waitForSelector('.result'); await page.waitForTimeout(300); };
  const shut = async page => { await page.waitForTimeout(650); for (const b of await page.$$('.modal-bg button')) { const t = (await b.innerText()).trim(); if (/Hooray|Close|✕|OK/i.test(t)) { await b.click().catch(() => {}); break; } } await page.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove())); };
  const realm = async (page, rid) => { await shut(page); await page.evaluate(r => WR.go('realm', r), rid); await page.waitForSelector('.path-grid'); await page.waitForTimeout(300); };
  const tapSkill = async (page, k) => { await page.click(`.path-grid .skill-card[data-k="${k}"] h3`); };
  const rec = (page, k, rid = 'a1') => page.evaluate(([r, k]) => WR.skillRec(r, k), [rid, k]);
  const ctx = await mkctx();

  // ---------- 1. one config ----------
  let page = await open(ctx, SAVE());
  const cfg = await page.evaluate(() => ({ P: WR.PASS, c8: WR.passCount(8), c4: WR.passCount(4), c7: WR.passCount(7), p68: WR.passes(6 / 8), p78: WR.passes(7 / 8), p34: WR.passes(3 / 4, 4) }));
  assert(cfg.P.mark === 0.85 && cfg.c8 === 7 && cfg.c4 === 3 && cfg.c7 === 6 && !cfg.p68 && cfg.p78 && cfg.p34 && cfg.P.skills === 4 && cfg.P.checkN === 4, 'one pass mark (0.85): 7 of 8 in a lesson, 3 of 4 in the check; all 4 skills; 4-question check');

  // ---------- 2. a lesson below the mark: kind words; after 2 tries, help (Learn lesson + easier path) ----------
  await realm(page, 'a1'); await tapSkill(page, 'grammar');
  await play(page, i => i < 5);   // ~5 of 8
  let res = await page.evaluate(() => ({ t: document.querySelector('.result').innerText, help: !!document.querySelector('#helpCard') }));
  assert(/about 7 of 8/.test(res.t) && !/fail/i.test(res.t) && !res.help, 'below the mark: "Get about 7 of 8 right to pass", never "failed", no help yet');
  assert(!(await page.evaluate(() => WR.skillPassed('a1', 'grammar'))), 'grammar is not passed at 5 of 8');
  await page.click('#again'); await play(page, i => i < 5);
  res = await page.evaluate(() => ({ help: !!document.querySelector('#helpCard'), learn: !!document.querySelector('#helpLearn'), easy: (document.querySelector('#helpEasy') || {}).innerText, t: document.querySelector('#helpCard') && document.querySelector('#helpCard').innerText }));
  assert(res.help && res.learn && /Little steps/.test(res.easy) && /tricky/.test(res.t), 'after 2 tries in a row: a kind help card with the 📜 Learn lesson and 🌱 Little steps (A1 has no realm below)');
  await page.waitForTimeout(500); await page.screenshot({ path: OUT + 't4_desk_help.png' });
  await page.click('#helpEasy'); await page.waitForSelector('.opt:not([disabled]), #pool .tile, .mword, #dictIn');
  const little = await page.evaluate(() => ({ n: WR._L ? 0 : document.querySelector('.qnum').textContent }));
  assert(/\/4$/.test(little.n), `🌱 Little steps is a 4-question round (${little.n})`);
  await play(page, () => true);

  // ---------- 3. pass at 7+ of 8; the check opens on a LATER day only ----------
  await realm(page, 'a1'); await tapSkill(page, 'grammar'); await play(page, () => true);
  res = await page.evaluate(() => document.querySelector('.result').innerText);
  assert(/Skill passed/.test(res) && /another day/.test(res), 'all right: "Skill passed! Come back on another day for a quick 4-question check"');
  await realm(page, 'a1');
  let row = await page.evaluate(() => ({ btn: !!document.querySelector('#passRow [data-pcheck="grammar"]'), t: (document.querySelector('#passRow') || {}).innerText || '', badge: !!document.querySelector('.skill-card[data-k="grammar"] .pass-badge') }));
  assert(!row.btn && /passed!/.test(row.t) && /another day/.test(row.t) && row.badge, 'same day: no check yet, "🌙 Grammar: passed! Its check opens on another day", ✅ badge');
  assert(!(await page.evaluate(() => WR.isUnlocked(1))), 'A2 is still closed');
  await nextDay(page); await realm(page, 'a1');
  assert(await page.$('#passRow [data-pcheck="grammar"]'), 'next day: a ✨ Check Grammar button');
  await page.waitForTimeout(400); await page.screenshot({ path: OUT + 't4_desk_check_row.png' });
  await page.click('#passRow [data-pcheck="grammar"]');
  await page.waitForSelector('.opt:not([disabled]), #pool .tile, .mword, #dictIn');
  assert(/\/4$/.test(await page.evaluate(() => document.querySelector('.qnum').textContent)), 'the crown check is 4 questions');
  await play(page, i => i !== 1);   // 3 of 4
  res = await page.evaluate(() => document.querySelector('.result').innerText);
  assert(/Crown confirmed/.test(res), '3 of 4 on a later day: "Crown confirmed! 💎"');
  assert(!(await page.$('#again')), 'a check has no "Play again" (one check a day)');
  const g = await rec(page, 'grammar');
  assert(g.ok && g.okDay && g.okDay > g.passDay, 'the confirmation is saved with its day (after the pass day)');
  await page.waitForTimeout(400); await page.screenshot({ path: OUT + 't4_desk_confirmed.png' });
  await realm(page, 'a1');
  assert(!(await page.$('#passRow [data-pcheck="grammar"]')) && await page.$('.skill-card[data-k="grammar"] .pass-badge.ok'), 'checked: the button is gone and the tile shows 💎');

  // ---------- 4. a check that doesn't confirm: kind, the crown stays, one check a day, help after 2 ----------
  await tapSkill(page, 'vocab'); await play(page, () => true);
  await nextDay(page); await realm(page, 'a1'); await page.click('#passRow [data-pcheck="vocab"]');
  const before = await rec(page, 'vocab');
  await play(page, i => i === 0);   // 1 of 4
  res = await page.evaluate(() => ({ t: document.querySelector('.result').innerText, again: !document.querySelector('#again') }));
  const after = await rec(page, 'vocab');
  assert(/Nearly there/.test(res.t) && /crown stays yours/.test(res.t) && /tomorrow/.test(res.t) && res.again, '1 of 4: "Nearly there! 🌱 … Your crown stays yours. Let\'s check again tomorrow 🌙" (no replay today)');
  assert(after.best === before.best && !after.ok && WR_SAME(after.pass, before.pass), 'the crown and the pass are untouched');
  await realm(page, 'a1');
  assert(!(await page.$('#passRow [data-pcheck="vocab"]')), 'one check a day: not offered again today');
  await nextDay(page); await realm(page, 'a1'); await page.click('#passRow [data-pcheck="vocab"]'); await play(page, i => i === 0);
  assert(await page.$('#helpCard #helpEasy'), 'a second check that doesn\'t confirm offers help too');
  await nextDay(page); await realm(page, 'a1'); await page.click('#passRow [data-pcheck="vocab"]'); await play(page, () => true);
  assert((await rec(page, 'vocab')).ok, 'a later try confirms it');

  // ---------- 5. all 4 confirmed → the next realm opens; the realm boss wakes at 3 passed ----------
  for (const k of ['listening', 'reading']) { await realm(page, 'a1'); await tapSkill(page, k); await play(page, () => true); }
  assert(await page.evaluate(() => WR.Collect.bossReady('a1')) && !(await page.evaluate(() => WR.isUnlocked(1))), 'the realm boss wakes at 3+ skills passed; A2 waits for the checks');
  await nextDay(page);
  for (const k of ['listening', 'reading']) { await realm(page, 'a1'); await page.click(`#passRow [data-pcheck="${k}"]`); await play(page, () => true); }
  res = await page.evaluate(() => document.querySelector('.result').innerText);
  assert(/is open/.test(res), 'the 4th confirmation says the next realm is open 🎉');
  await page.evaluate(() => WR.go('home')); await page.waitForSelector('.realm-node');
  const map = await page.evaluate(() => ({ a2: !document.querySelector('.realm-node[data-r="a2"]').classList.contains('locked'), line: document.querySelector('.realm-node[data-r="a1"]').innerText }));
  assert(map.a2 && /4\/4 confirmed/.test(map.line), `A2 is open; the map says "${map.line.split('\n').pop()}"`);

  // ---------- 6. Polish me ✨ on a crown not checked for 30+ days ----------
  await page.close();
  const old = Date.now() + days * DAY - 40 * DAY;
  page = await open(ctx, SAVE({ passMig: 1, keep: { open: [], boss: [] }, progress: { a1: { grammar: { best: 1, plays: 3, last: old, pass: old, passDay: dk(old), ok: old, okDay: dk(old), goodDay: dk(old) } } } }));
  await realm(page, 'a1');
  const pol = await page.evaluate(() => ({ btn: (document.querySelector('#passRow [data-pcheck="grammar"]') || {}).innerText, t: (document.querySelector('#passRow') || {}).innerText }));
  assert(/Polish me/.test(pol.btn || '') && /stay yours/.test(pol.t), 'a crown last checked 40 days ago: a gentle "Polish me ✨" (and "Your crowns stay yours")');
  await page.waitForTimeout(400); await page.screenshot({ path: OUT + 't4_desk_polish.png' });
  await page.click('#passRow [data-pcheck="grammar"]'); await play(page, i => i === 0);   // a poor polish round
  const p1 = await rec(page, 'grammar');
  assert(p1.best === 1 && p1.ok === old, 'a polish round that goes badly: the crown and the confirmation stay');
  await nextDay(page); await realm(page, 'a1'); await page.click('#passRow [data-pcheck="grammar"]'); await play(page, () => true);
  res = await page.evaluate(() => document.querySelector('.result').innerText);
  await realm(page, 'a1');
  assert(/Sparkly again/.test(res) && !(await page.$('#passRow [data-pcheck="grammar"]')), 'a good polish: "Sparkly again! ✨" and the button rests');

  // ---------- 7. older saves keep every open realm, awake boss, crown and star ----------
  await page.close();
  page = await open(ctx, SAVE({ stars: 321, progress: { a1: { grammar: { best: 0.7, plays: 2, last: Date.now() - 5 * DAY }, vocab: { best: 0.625, plays: 1, last: Date.now() - 5 * DAY }, listening: { best: 0.9, plays: 1, last: Date.now() - 5 * DAY } } }, bosses: {} }));
  const mig = await page.evaluate(() => ({ a2: WR.isUnlocked(1), a3: WR.isUnlocked(2), boss: WR.Collect.bossReady('a1'), keep: WR.state.keep, stars: WR.state.stars, best: WR.state.progress.a1.grammar.best, lp: WR.skillPassed('a1', 'listening'), lc: WR.checkReady('a1', 'listening'), gp: WR.skillPassed('a1', 'grammar') }));
  assert(mig.a2 && !mig.a3 && mig.boss && mig.keep.open.join() === 'a2' && mig.keep.boss.join() === 'a1', 'an older save: A2 (opened by the old rule) stays open for good, the A1 boss stays awake');
  assert(mig.stars >= 321 && mig.best === 0.7 && mig.lp && mig.lc && !mig.gp, 'stars and crowns untouched; an old 90% skill counts as passed with its check ready now; 70% is not passed');
  const nt = await page.evaluate(() => { WR.state.progress.b1 = { vocab: { best: 0.95, plays: 2 } }; return WR.skillPassed('b1', 'vocab') && WR.checkReady('b1', 'vocab'); });
  assert(nt, 'an old 95% record with no time saved still gets its check (it counts as an earlier day)');
  await page.reload(); await page.waitForFunction(() => window.WR && WR.realms); await page.waitForTimeout(400);
  assert(await page.evaluate(() => WR.isUnlocked(1) && WR.state.keep.open.length === 1), 'still open after a reload (kept in the save, computed once)');

  // ---------- 8. cloud merge + two tabs ----------
  const merged = await page.evaluate(() => { const a = { keep: { open: ['a2'], boss: [] }, progress: { a1: { grammar: { best: .9, pass: 200, passDay: '2026-11-02' } } } },
    b = { keep: { open: ['a3'], boss: ['a1'] }, progress: { a1: { grammar: { best: .8, pass: 100, passDay: '2026-11-01', ok: 300, okDay: '2026-11-03' } } } };
    WR.mergePass(a, b); return a; });
  assert(merged.keep.open.join() === 'a2,a3' && merged.keep.boss.join() === 'a1' && merged.progress.a1.grammar.ok === 300 && merged.progress.a1.grammar.pass === 100, 'cloud merge: kept realms are unioned and a confirmation from the other device is never lost');
  const tab2 = await ctx.newPage(); await tab2.goto(URL); await tab2.waitForFunction(() => window.WR && WR.realms && WR.Pass); await tab2.waitForTimeout(500);
  await page.evaluate(() => { WR.state.progress.a1.vocab.ok = Date.now(); WR.state.progress.a1.vocab.okDay = WR.today(); WR.save(); });
  await tab2.waitForTimeout(500);
  assert(await tab2.evaluate(() => !!WR.skillRec('a1', 'vocab').ok && WR.isUnlocked(1)), 'two tabs: the other tab adopts the confirmation (and keeps A2 open)');
  await tab2.close();

  // ---------- 9. phones: the check row, the check and the help card fit ----------
  for (const vp of [{ n: '320', width: 320, height: 640 }, { n: '360', width: 360, height: 740 }, { n: '375', width: 375, height: 667 }, { n: 'landscape', width: 740, height: 360 }]) {
    const c = await mkctx(vp), yd = Date.now() + days * DAY - DAY;
    const p = await open(c, SAVE({ passMig: 1, keep: { open: [], boss: [] }, progress: { a1: { grammar: { best: 1, plays: 1, last: yd, pass: yd, passDay: dk(yd) }, vocab: { best: .5, plays: 2, last: yd, fails: 2 },
      reading: { best: 1, plays: 2, last: yd - 40 * DAY, pass: yd - 40 * DAY, passDay: dk(yd - 40 * DAY), ok: yd - 40 * DAY, okDay: dk(yd - 40 * DAY) } } } }));
    await realm(p, 'a1');
    const fit = await p.evaluate(() => { const bs = [...document.querySelectorAll('#passRow .pass-btn')]; return { n: bs.length, h: Math.min(...bs.map(b => b.getBoundingClientRect().height)), right: bs.every(b => b.getBoundingClientRect().right <= innerWidth + 1), scroll: document.documentElement.scrollWidth > innerWidth + 1 }; });
    assert(fit.n === 2 && fit.h >= 44 && fit.right && !fit.scroll, `${vp.n}: the ✨ row (Check + Polish me) fits, buttons ≥ 44 px, no sideways scroll`);
    await p.evaluate(() => document.querySelector('#passRow').scrollIntoView({ block: 'center' })); await p.waitForTimeout(500); await p.screenshot({ path: OUT + `t4_${vp.n}_row.png` });
    await p.click('#passRow [data-pcheck="grammar"]'); await p.waitForSelector('.opt:not([disabled]), #pool .tile, .mword, #dictIn');
    assert(!(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)), `${vp.n}: the crown check has no sideways scroll`);
    await play(p, () => true); await p.waitForTimeout(400); await p.screenshot({ path: OUT + `t4_${vp.n}_confirmed.png` });
    await realm(p, 'a1'); await tapSkill(p, 'vocab'); await play(p, i => i < 3);
    const hc = await p.evaluate(() => { const c = document.querySelector('#helpCard'); if (!c) return null; const bs = [...c.querySelectorAll('.btn')]; return { h: Math.min(...bs.map(b => b.getBoundingClientRect().height)), right: c.getBoundingClientRect().right <= innerWidth + 1, scroll: document.documentElement.scrollWidth > innerWidth + 1 }; });
    assert(hc && hc.h >= 44 && hc.right && !hc.scroll, `${vp.n}: the help card fits, its buttons ≥ 44 px`);
    await p.evaluate(() => document.querySelector('#helpCard').scrollIntoView({ block: 'center' })); await p.waitForTimeout(300); await p.screenshot({ path: OUT + `t4_${vp.n}_help.png` });
    await c.close();
  }
  assert(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  console.log(`\npass-mark: ${passed} passed`);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
function WR_SAME(a, b) { return a === b; }
