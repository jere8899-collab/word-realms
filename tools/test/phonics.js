// 🔤 Phonics Path (A1): old saves migrate (state.phonics inside wordRealms.save.v1); map pill + A1 realm tile (not on A2);
// the path hub (6 steps, step 2 locked until step 1 is done); every activity type answered through the real UI (sound pick,
// first sound, odd-sound-out, tap-and-blend, build with letter tiles, hear-and-pick, find the word); letter tiles speak their
// sound with a keyword; rewards paid once; daily quest; sticker page; Learning Report row + Practise button; cloud payload and
// an old cloud save; 3,000 generated rounds are valid; 375×667 screenshots and a 320×658 fit audit (taps ≥ 40 px); no errors.
// node tools/test/phonics.js   (screenshots: screenshots/phonics_*.png)
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
// an old save from before the Phonics Path (no `phonics` field)
const OLD = { v: 1, name: 'Mei', avatar: 'avatar_girl', startLevel: 'a1', stars: 40, totalCorrect: 20, totalAnswered: 30,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 60, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 2, last: today() }, owned: [], equipped: { outfit: null, petskin: null, theme: null }, progress: { a1: { grammar: { best: 0.7, plays: 1, last: Date.now() } } },
  daily: { day: today(), quests: [{ id: 'phonics1', progress: 0, claimed: false }, { id: 'correct10', progress: 0, claimed: false }, { id: 'feed1', progress: 0, claimed: false }] },
  settings: { rate: .9, sound: false, unlockAll: false }, mistakes: [], lessonsDone: 3 };
const MOB = { deviceScaleFactor: 2, isMobile: true, hasTouch: true };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  async function open(vp, seed, mob = true) {
    const ctx = await browser.newContext(mob ? { ...MOB, viewport: vp } : { viewport: vp });
    await ctx.addInitScript(s => {
      if (!sessionStorage.getItem('seeded')) { localStorage.setItem('wordRealms.save.v1', s); sessionStorage.setItem('seeded', '1'); }
      // record what the game says (and finish each utterance at once) so the test can check the voice prompts
      window.__said = [];
      if (window.speechSynthesis) { speechSynthesis.speak = u => { window.__said.push(u.text); setTimeout(() => u.onend && u.onend(), 5); }; speechSynthesis.cancel = () => {}; }
    }, JSON.stringify(seed));
    await ctx.route(/supabase\.co|cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)/, r => r.abort());
    const page = await ctx.newPage(); page.errs = [];
    page.on('pageerror', e => page.errs.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_FAILED|cloud library|supabase/i.test(m.text())) page.errs.push(m.text()); });
    await page.goto(BASE + 'index.html', { waitUntil: 'networkidle' });
    await page.waitForSelector('.realm-node', { timeout: 15000 });
    return page;
  }
  const clean = async p => { await p.evaluate(() => document.querySelectorAll('.confetti-layer,.toast').forEach(e => e.remove())); await p.waitForTimeout(400); };
  const fit = page => page.evaluate(() => {
    const bad = [], vis = el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    for (const el of [...document.getElementById('main').querySelectorAll('button,.btn')].filter(vis)) {
      el.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = el.getBoundingClientRect();
      if (r.height < 40 || r.width < 40) bad.push('small ' + (el.id || el.textContent.trim().slice(0, 16)) + ' ' + Math.round(r.width) + '×' + Math.round(r.height));
      if (r.left < -1 || r.right > innerWidth + 1) bad.push('off-screen ' + (el.id || el.textContent.trim().slice(0, 16)));
      const hit = document.elementFromPoint(Math.min(innerWidth - 1, r.left + r.width / 2), r.top + Math.min(r.height / 2, 20));
      if (!hit || !(el === hit || el.contains(hit))) bad.push('covered ' + (el.id || el.textContent.trim().slice(0, 16)));
    }
    window.scrollTo(0, 0);
    return { bad, sw: document.documentElement.scrollWidth };
  });
  // answer the current question through the UI (right or wrong); returns its type
  async function answer(page, right) {
    const q = await page.evaluate(() => WR.Phonics._q());
    const wrong = q.options ? q.options.find(o => o !== q.answer) : null;
    if (q.t === 'build') {
      for (const g of right ? q.tiles : [q.pool.find(x => !q.tiles.includes(x))].concat(q.tiles.slice(1))) {
        await page.evaluate(g => { const b = [...document.querySelectorAll('#phPool .ph-tile:not([disabled])')].find(x => x.textContent === g); b.click(); }, g);
        await page.waitForTimeout(20);
      }
    } else if (q.t === 'find') {
      await page.evaluate(([a, right]) => { const b = [...document.querySelectorAll('.ph-sw')].find(x => (x.textContent.replace(/[.?!,]/g, '').toLowerCase() === a) === right); b.click(); }, [q.answer, right]);
    } else {
      if (q.t === 'blend') { await page.click('#phTiles .ph-tile'); await page.click('#phBlend'); }
      const k = q.options.indexOf(right ? q.answer : wrong);
      await page.click(`[data-k="${k}"].opt`);
    }
    await page.waitForSelector('#phNext');
    return q.t;
  }
  async function playRound(page, wrongAt = -1, shots) {
    const types = new Set();
    for (let i = 0; i < 8; i++) {
      await page.waitForSelector('.ph-card');
      const q = await page.evaluate(() => WR.Phonics._q());
      if (shots && !shots.has(q.t)) { shots.add(q.t); await clean(page); await page.screenshot({ path: OUT + `phonics_q_${q.t}.png` }); }
      types.add(await answer(page, i !== wrongAt));
      if (shots && i === 0) { await clean(page); await page.screenshot({ path: OUT + 'phonics_feedback.png' }); }
      await page.click('#phNext');
    }
    await page.waitForSelector('.ph-done');
    return types;
  }

  /* 1. migration, entry points, hub, a full round with rewards (375×667) */
  const page = await open({ width: 375, height: 667 }, OLD);
  const ph0 = await page.evaluate(() => WR.state.phonics);
  ok(ph0 && typeof ph0.done === 'object' && Object.keys(ph0.done).length === 0 && ph0.rounds === 0, 'old save gains an empty phonics block');
  ok(await page.evaluate(() => WR.state.report && WR.state.mistakes && WR.state.progress.a1.grammar.best === 0.7), 'the rest of the old save is untouched');
  ok((await page.innerText('#phonicsSteps')).includes('0/6'), 'the map shows the 🔤 Phonics Path card (0/6 steps) under the realm map');
  const lay = await page.evaluate(() => ({ c: document.getElementById('continueCard') ? document.getElementById('continueCard').getBoundingClientRect().bottom : 0, r: document.querySelector('.realm-node').getBoundingClientRect().bottom, n: document.getElementById('phonicsNode').getBoundingClientRect().top, last: [...document.querySelectorAll('.realm-node')].pop().getBoundingClientRect().bottom }));
  ok(lay.r <= 667 && lay.c <= 667 && lay.n >= lay.last, `the card sits under the map, so Continue + the first realm still fit 375×667 (${Math.round(lay.r)})`);
  await page.locator('#phonicsNode').scrollIntoViewIfNeeded(); await clean(page); await page.screenshot({ path: OUT + 'phonics_00_map.png' });
  await page.click('#phonicsNode'); await page.waitForSelector('.ph-step');
  ok(await page.locator('.ph-step').count() === 6, 'the map card opens the Phonics Path');
  await page.evaluate(() => WR.go('realm', 'a2'));
  ok(await page.locator('.phonics-tile').count() === 0, 'no Phonics tile in the A2 realm');
  await page.evaluate(() => WR.go('realm', 'a1'));
  ok(await page.locator('.phonics-tile').count() === 1, 'A1 realm has a Phonics bonus tile');
  await page.locator('.phonics-tile').scrollIntoViewIfNeeded(); await clean(page);
  await page.screenshot({ path: OUT + 'phonics_01_tile.png' });
  await page.click('.phonics-tile'); await page.waitForSelector('.ph-step');
  ok(await page.locator('.ph-step').count() === 6, 'the path has 6 steps');
  ok(await page.evaluate(() => document.querySelectorAll('.ph-step.locked').length) === 5, 'only step 1 is open on a new path');
  await clean(page); await page.screenshot({ path: OUT + 'phonics_02_path.png', fullPage: true });
  let f = await fit(page);
  ok(f.sw <= 375 && f.bad.length === 0, `375: the path fits, taps ≥ 40 px (${f.bad.join(', ')})`);
  await page.click('.ph-step[data-u="1"]', { force: true }); await page.waitForTimeout(150);
  ok(await page.locator('.ph-step').count() === 6 && await page.locator('.ph-card').count() === 0, 'a locked step does not open');
  await page.click('.ph-step[data-u="0"]'); await page.waitForSelector('.ph-card');
  ok(await page.evaluate(() => document.body.classList.contains('wr-focus')), 'the tab bar hides during a round (focus mode)');
  await page.waitForTimeout(400);
  ok(await page.evaluate(() => window.__said.length >= 1), `the first question is read aloud (“${await page.evaluate(() => window.__said[0])}”)`);
  const stars0 = await page.evaluate(() => WR.state.stars), ans0 = await page.evaluate(() => WR.state.totalAnswered);
  const shots = new Set();
  const t1 = await playRound(page, 2, shots);
  ok(['sound', 'first', 'odd'].every(t => t1.has(t)), `Sound Seeds mixes sound, first-sound and odd-sound-out (${[...t1]})`);
  const s1 = await page.evaluate(() => ({ stars: WR.state.stars, ph: WR.state.phonics, ans: WR.state.totalAnswered, q: WR.state.daily.quests.find(q => q.id === 'phonics1'),
    tally: WR.state.report.tally['a1/phonics'], day: WR.state.report.days[WR.today()], got: (WR.state.stickers.got.phonics || []) }));
  ok(s1.ph.done.u1 && s1.ph.done.u1.crowns === 2 && s1.ph.rounds === 1, '7/8 → 2 crowns saved for step 1');
  ok(s1.ans - ans0 === 8 && s1.tally && s1.tally[0] === 7 && s1.tally[1] === 1, `8 answers counted (WR.countAnswer → report key a1/phonics ${s1.tally})`);
  ok(s1.day && s1.day.l >= 1, 'the round is logged in today\'s report (WR.activityDone)');
  ok(s1.q.progress === 1, 'daily quest “phonics1” progresses');
  ok(s1.got.includes('u1'), 'Sound Seeds sticker earned');
  ok(s1.stars - stars0 === 7 + 3 + 4 + 2, `first walk pays 7 + 3 + 2×2 crowns (+ 2 sticker) = +16⭐ (got +${s1.stars - stars0})`);
  await clean(page); await page.screenshot({ path: OUT + 'phonics_03_done.png' });
  f = await fit(page); ok(f.sw <= 375 && f.bad.length === 0, `375: the result fits (${f.bad.join(', ')})`);
  // replay with 8/8: only the new crown pays
  await page.click('#phAgain'); await playRound(page, -1);
  const s2 = await page.evaluate(() => ({ stars: WR.state.stars, d: WR.state.phonics.done.u1 }));
  ok(s2.d.crowns === 3 && s2.d.plays === 2 && s2.stars - s1.stars === 2, `replay: 3 crowns, only the new crown pays (+${s2.stars - s1.stars}⭐)`);
  // the next steps: every activity type through the UI
  const all = new Set(t1);
  for (let u = 1; u < 6; u++) {
    await page.evaluate(u => WR.go('phonics') || 0, u);
    ok(await page.evaluate(u => !document.querySelector(`.ph-step[data-u="${u}"]`).classList.contains('locked'), u), `step ${u + 1} is open after step ${u}`);
    await page.click(`.ph-step[data-u="${u}"]`);
    (await playRound(page, -1, shots)).forEach(t => all.add(t));
  }
  ok(['sound', 'first', 'odd', 'blend', 'build', 'hear', 'find'].every(t => all.has(t)), `all 7 activity types played (${[...all]})`);
  // voices: a letter tile says its sound + keyword; Blend says the sounds then the word
  await page.evaluate(() => WR.startPhonics(2)); await page.waitForSelector('.ph-card');
  for (let i = 0; i < 12; i++) { const t = await page.evaluate(() => WR.Phonics._q().t); if (t === 'blend') break; await answer(page, true); await page.click('#phNext').catch(() => {}); if (await page.locator('.ph-done').count()) { await page.click('#phAgain'); } await page.waitForSelector('.ph-card'); }
  const bq = await page.evaluate(() => WR.Phonics._q());
  if (bq.t === 'blend') {
    await page.waitForTimeout(450); await page.evaluate(() => { window.__said = []; });
    await page.click('#phTiles .ph-tile'); await page.waitForTimeout(60); await page.click('#phBlend'); await page.waitForTimeout(100);
    const said = await page.evaluate(() => window.__said), key = await page.evaluate(g => WR.Phonics.keyOf(g), bq.tiles[0]);
    ok(said[0] === key && /…/.test(key) && said[1].endsWith('… ' + bq.word), `tile “${bq.tiles[0]}” says “${said[0]}”, Blend says “${said[1]}”`);
    await page.evaluate(() => document.querySelector('#phTiles .ph-tile').classList.add('lit')); await clean(page);
    await page.screenshot({ path: OUT + 'phonics_q_blend.png' });
  } else ok(false, 'found a blend question to check the voice');
  const st = await page.evaluate(() => ({ done: Object.keys(WR.state.phonics.done).length, got: WR.state.stickers.got.phonics, pill: (WR.go('home'), document.getElementById('phonicsSteps').textContent) }));
  ok(st.done === 6 && st.got.length >= 6 && st.pill.includes('6/6'), `all 6 steps saved, ${st.got.length} stickers, map card ${st.pill}`);
  // Learning Report: a Phonics row (A1) and a working Practise action
  const rep = await page.evaluate(() => { const d = WR.Report.data('week'); const row = d.english.rows.find(r => r.sk.id === 'phonics'); const a1 = d.english.levels.findIndex(l => l.id === 'a1'); return { name: row && row.sk.name, cell: row && row.cells[a1] }; });
  ok(rep.name === 'Phonics' && rep.cell && rep.cell.n >= 48, `Learning Report has a Phonics row for A1 (${JSON.stringify(rep)})`);
  await page.evaluate(() => WR.Report.practise('a1/phonics')); await page.waitForTimeout(200);
  ok(await page.locator('.ph-step').count() === 6, '“Practise this” on a1/phonics opens the Phonics Path');
  // save + reload + cloud
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForSelector('.realm-node');
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).phonics.done.u6.plays >= 1), 'progress survives a reload (inside wordRealms.save.v1)');
  const row = await page.evaluate(async () => {
    const C = WR.Cloud; let sent = null;
    const q = { select() { return q; }, eq() { return q; }, maybeSingle: async () => ({ data: null, error: null }),
      upsert(r) { sent = r; return { select: () => ({ single: async () => ({ data: { updated_at: new Date().toISOString() }, error: null }) }) }; } };
    C.client = async () => ({ from: () => q }); C.user = { id: 'test-user' }; C.username = 'mei';
    await C.push(); C.user = null; return sent;
  });
  ok(row && row.data && row.data.phonics && Object.keys(row.data.phonics.done).length === 6, 'cloud payload (saves.data) carries phonics.done');
  ok(await page.evaluate(() => { const a = JSON.parse(JSON.stringify(WR.state)), b = JSON.parse(JSON.stringify(WR.state)); b.phonics.done = {}; return WR.Cloud.score(a) > WR.Cloud.score(b); }), 'phonics crowns count in the cloud progress score');
  const mig = await page.evaluate(old => { WR.Cloud.apply(old, new Date().toISOString()); return WR.state.phonics; }, OLD);
  ok(mig && Object.keys(mig.done).length === 0 && mig.rounds === 0, 'an old cloud save without phonics migrates when applied');
  // 3,000 generated rounds: 8 questions, the answer is among the options / tiles, no repeated options
  const gen = await page.evaluate(() => { let bad = 0; const P = WR.Phonics;
    for (let r = 0; r < 500; r++) for (const u of P.UNITS) for (const q of (() => { const qs = P.makeRound(u); if (qs.length !== 8) bad++; return qs; })()) {
      if (q.options && (!q.options.includes(q.answer) || new Set(q.options).size !== q.options.length)) bad++;
      if (q.t === 'build' && (q.tiles.join('') !== q.answer || q.tiles.some(g => !q.pool.includes(g)))) bad++;
      if (q.t === 'find' && !q.sentence.toLowerCase().replace(/[.?!]/g, '').split(' ').includes(q.answer)) bad++;
    } return bad; });
  ok(gen === 0, `3,000 generated rounds are all valid (${gen} bad)`);
  ok(page.errs.length === 0, 'no page errors ' + page.errs.join(' | '));
  await page.context().close();

  /* 2. 320×658: the path and every activity type fit, taps ≥ 40 px */
  {
    const p = await open({ width: 320, height: 658 }, Object.assign({}, OLD, { settings: { rate: .9, sound: false, unlockAll: true } }));
    await p.evaluate(() => WR.go('phonics')); await p.waitForSelector('.ph-step');
    let r = await fit(p); ok(r.sw <= 320 && r.bad.length === 0, `320: the path fits (${r.bad.join(', ')})`);
    const seen = new Set();
    for (let u = 0; u < 6; u++) {
      await p.evaluate(u => WR.startPhonics(u), u);
      for (let i = 0; i < 8; i++) {
        await p.waitForSelector('.ph-card');
        const t = await p.evaluate(() => WR.Phonics._q().t);
        if (!seen.has(t)) { seen.add(t); await p.waitForTimeout(450); r = await fit(p); ok(r.sw <= 320 && r.bad.length === 0, `320: a ${t} question fits, taps ≥ 40 px (${r.bad.join(', ')})`); }
        await answer(p, true); await p.click('#phNext');
      }
      await p.waitForSelector('.ph-done');
    }
    r = await fit(p); ok(r.sw <= 320 && r.bad.length === 0, `320: the result fits (${r.bad.join(', ')})`);
    ok(p.errs.length === 0, '320: no page errors ' + p.errs.join(' | '));
    await p.context().close();
  }
  await browser.close();
  console.log(`\n${passes} passed, ${fails} failed`);
})().catch(e => { console.error(e); process.exit(1); });
