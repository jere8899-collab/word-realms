// 🔮 Word Charms: old saves migrate (state.charms inside wordRealms.save.v1); the realm bonus tile + hub (40 charms per level,
// level tabs for open realms); a first round (meet 4 new words → catch them; a slip is asked once more, unmarked); spaced
// review through every card type (pick → gap → spell → mean → mixed) until a charm is mastered 💎; stars paid once per
// glow (anti-farm), the round bonus, practice rounds pay nothing and change nothing; the map nudge; daily quest; sticker
// page; Learning Report row + Practise; reload; cloud payload, score and an old cloud save; narrator recordings exist for
// every word, meaning and example; 2,400 generated rounds are valid; 375×667 screenshots and a 320×658 fit audit.
// node tools/test/charms.js   (screenshots: screenshots/charms_*.png)
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const good = { best: 0.8, plays: 1, last: Date.now() };
// an old save from before Word Charms (no `charms` field); A1 passed, so A2 is open too
const OLD = { v: 1, name: 'Mei', avatar: 'avatar_girl', startLevel: 'a1', stars: 40, totalCorrect: 20, totalAnswered: 30,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 60, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 2, last: today() }, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  progress: { a1: { grammar: good, vocab: good, reading: good } },
  daily: { day: today(), quests: [{ id: 'charm1', progress: 0, claimed: false }, { id: 'correct10', progress: 0, claimed: false }, { id: 'feed1', progress: 0, claimed: false }] },
  settings: { rate: .9, sound: false, unlockAll: false }, mistakes: [], lessonsDone: 12 };   // R14: 12 lessons, so every bonus game is open
const MOB = { deviceScaleFactor: 2, isMobile: true, hasTouch: true };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  async function open(vp, seed) {
    const ctx = await browser.newContext({ ...MOB, viewport: vp });
    await ctx.addInitScript(s => {
      if (!sessionStorage.getItem('seeded')) { localStorage.setItem('wordRealms.save.v1', s); sessionStorage.setItem('seeded', '1'); }
      window.__said = [];   // what the game says: recorded MP3s are "played" instantly, device speech is recorded too
      HTMLMediaElement.prototype.play = function () { window.__said.push('mp3:' + this.src.split('/').pop()); setTimeout(() => this.onended && this.onended(), 5); return Promise.resolve(); };
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
  const clean = async p => { await p.evaluate(() => document.querySelectorAll('.confetti-layer,.toast').forEach(e => e.remove())); await p.waitForTimeout(350); };
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
  // play the current card through the UI; right = answer correctly. Returns the card's kind/type.
  async function step(page, right = true) {
    await page.waitForSelector('.ch-card');
    const q = await page.evaluate(() => { const p = WR.Charms._q(); return { kind: p.kind, type: p.type, answer: p.answer, options: p.options, retry: !!p.retry, w: p.w.w }; });
    if (q.kind === 'meet') { await page.click('#chCatch'); return q; }
    if (q.type === 'spell') {
      for (const ch of q.w) await page.evaluate(ch => { [...document.querySelectorAll('#chPool .tile:not([disabled])')].find(b => b.textContent === ch).click(); }, ch);
    } else {
      const k = right ? q.options.indexOf(q.answer) : q.options.findIndex(o => o !== q.answer);
      await page.click(`.ch-opt[data-k="${k}"]`);
    }
    await page.waitForSelector('#chNext'); await page.click('#chNext');
    return q;
  }
  async function playRound(page, wrongAt = -1) {
    const seen = []; let quiz = 0;
    while (!(await page.$('.ch-done'))) {
      const q = await page.evaluate(() => { const p = WR.Charms._q(); return p ? { kind: p.kind, type: p.type } : null; });
      if (!q) { await page.waitForTimeout(100); continue; }
      const wrong = q.kind === 'quiz' && q.type !== 'spell' && quiz === wrongAt;
      seen.push(await step(page, !wrong)); if (q.kind === 'quiz') quiz++;
    }
    return seen;
  }
  const makeDue = (page, lvl) => page.evaluate(lvl => { for (const [k, c] of Object.entries(WR.state.charms.cards)) if (k.startsWith(lvl + ':') && c.b >= 1 && c.b < 5) c.d = Date.now() - 1000; WR.save(); }, lvl);

  /* 1. migration, tile, hub */
  const page = await open({ width: 375, height: 667 }, OLD);
  const c0 = await page.evaluate(() => WR.state.charms);
  ok(c0 && typeof c0.cards === 'object' && Object.keys(c0.cards).length === 0 && c0.rounds === 0, 'old save gains an empty charms block');
  ok(await page.evaluate(() => WR.state.progress.a1.grammar.best === 0.8 && WR.state.totalCorrect === 20), 'the rest of the old save is untouched');
  ok(!(await page.$('#charmsNudge')), 'no map nudge while nothing is due');
  await page.evaluate(() => WR.go('realm', 'a1'));
  ok(await page.locator('.charms-tile').count() === 1, 'the A1 realm has a 🔮 Word Charms bonus tile');
  ok(await page.locator('[data-speak]').count() === 1 && await page.locator('[data-write]').count() === 1 && await page.locator('[data-story]').count() === 1 && await page.locator('.phonics-tile').count() === 1, 'the other bonus tiles are still there (shared tile helper)');
  await page.locator('.charms-tile').scrollIntoViewIfNeeded(); await clean(page); await page.screenshot({ path: OUT + 'charms_00_tile.png' });
  await page.click('.charms-tile'); await page.waitForSelector('.ch-grid .ch-charm');
  ok(await page.locator('.ch-charm').count() === 40 && await page.locator('.ch-charm.mystery').count() === 40, 'the hub shows 40 A1 charms, all still mysteries');
  ok(await page.locator('.ch-lv').count() === 2, 'level tabs for the two open realms (A1, A2)');
  ok((await page.innerText('#chGo')).includes('Catch 4 new'), 'the main button offers 4 new charms');
  await clean(page); await page.screenshot({ path: OUT + 'charms_01_hub_new.png' });
  let f = await fit(page); ok(f.sw <= 375 && f.bad.length === 0, `375: the hub fits, taps ≥ 40 px (${f.bad.join(', ')})`);

  /* 2. first round: meet 4, catch them (one slip → asked again, unmarked) */
  const s0 = await page.evaluate(() => ({ stars: WR.state.stars, ans: WR.state.totalAnswered }));
  await page.click('#chGo'); await page.waitForSelector('.ch-card');
  ok(await page.evaluate(() => document.body.classList.contains('wr-focus')), 'the tab bar hides during a round (focus mode)');
  await page.waitForTimeout(400);
  const first = await page.evaluate(() => ({ p: WR.Charms._q(), said: window.__said.slice() }));
  ok(first.p.kind === 'meet' && first.p.w.w === 'apple', 'the round starts by meeting the first word on the list (apple)');
  ok(first.said.some(x => x.startsWith('mp3:narrator_')), `the word is read aloud by the recorded narrator (${first.said[0]})`);
  await clean(page); await page.screenshot({ path: OUT + 'charms_02_meet.png' });
  f = await fit(page); ok(f.sw <= 375 && f.bad.length === 0, `375: the meet card fits (${f.bad.join(', ')})`);
  for (let i = 0; i < 4; i++) await step(page);
  await page.waitForSelector('.ch-card');
  ok(await page.evaluate(() => WR.Charms._q().type === 'pick'), 'new words are caught with a “find the word” card');
  await clean(page); await page.screenshot({ path: OUT + 'charms_03_pick.png' });
  // quiz 0 right, quiz 1 wrong, the rest right; the slip comes back once at the end
  const r1 = [await step(page, true), await step(page, false)];
  const plan = await page.evaluate(() => WR.Charms._s().plan.map(p => ({ kind: p.kind, retry: !!p.retry, w: p.w.w })));
  ok(plan.length === 9 && plan[8].retry && plan[8].w === r1[1].w, `the slip (${r1[1].w}) is asked once more at the end, unmarked`);
  await playRound(page);
  const s1 = await page.evaluate(() => ({ stars: WR.state.stars, ch: WR.state.charms, ans: WR.state.totalAnswered, q: WR.state.daily.quests.find(q => q.id === 'charm1'),
    tally: WR.state.report.tally['a1/words'], got: (WR.state.stickers.got.charms || []), html: document.querySelector('.ch-done').innerText }));
  const cards = Object.entries(s1.ch.cards);
  ok(cards.length === 4 && cards.filter(([, c]) => c.b === 1).length === 3, `3 charms caught (🌙), the slipped one stays new (${cards.map(([k, c]) => k + ':' + c.b)})`);
  ok(cards.filter(([, c]) => c.b === 1).every(([, c]) => c.d - Date.now() > 0.9 * 864e5), 'caught charms come back in 1 day');
  ok(s1.ans - s0.ans === 4 && s1.tally && s1.tally[0] === 3 && s1.tally[1] === 1, `4 marked answers counted (report key a1/words ${s1.tally}); the retry isn't`);
  ok(s1.q.progress === 1, 'daily quest “charm1” progresses');
  ok(s1.got.includes('first'), '“First Charm” sticker earned');
  ok(s1.stars - s0.stars === 3 + 2 + 2, `+3⭐ (one per catch) + 2⭐ round bonus + 2⭐ sticker = +7⭐ (got +${s1.stars - s0.stars})`);
  ok(/3\s*new charms caught/.test(s1.html), 'the result says 3 new charms were caught');
  await clean(page); await page.screenshot({ path: OUT + 'charms_04_done.png' });
  f = await fit(page); ok(f.sw <= 375 && f.bad.length === 0, `375: the result fits (${f.bad.join(', ')})`);

  /* 3. the next round the same day: the slipped word comes back first, then new ones; nothing is due yet */
  await page.click('#chAgain'); await page.waitForSelector('.ch-card');
  const p2 = await page.evaluate(() => WR.Charms._s().plan.map(p => p.kind + ':' + p.w.w));
  ok(p2[0] === 'meet:' + r1[1].w && p2.filter(x => x.startsWith('meet')).length === 4, `met-but-missed word is dealt first (${p2.slice(0, 4)})`);
  await playRound(page);
  ok(await page.evaluate(() => Object.values(WR.state.charms.cards).filter(c => c.b === 1).length) === 7, '7 charms caught after two rounds (3 + the slipped one + 3 new)');

  /* 4. a day later: due charms, the nudge, every card type, mastery */
  await makeDue(page, 'a1');
  await page.evaluate(() => WR.go('home'));
  ok(await page.$('#charmsNudge') && (await page.innerText('#charmsNudge')).includes('7 word charms'), 'the map nudges “7 word charms want polishing”');
  await clean(page); await page.locator('#charmsNudge').scrollIntoViewIfNeeded(); await page.screenshot({ path: OUT + 'charms_05_nudge.png' });
  await page.click('#charmsNudge'); await page.waitForSelector('#chGo');
  ok((await page.innerText('#chGo')).includes('Polish 7'), 'the nudge opens the A1 deck with “Polish 7 charms + catch new ones”');
  const types = new Set(), shot = new Set(['pick']);
  const word = 'apple';
  let starsBefore = await page.evaluate(() => WR.state.stars);
  for (let day = 1; day <= 4; day++) {
    await page.evaluate(() => WR.startCharms('a1'));
    await page.waitForSelector('.ch-card');
    while (!(await page.$('.ch-done'))) {
      const q = await page.evaluate(() => { const p = WR.Charms._q(); return p ? { kind: p.kind, type: p.type } : null; });
      if (!q) { await page.waitForTimeout(80); continue; }
      if (q.kind === 'quiz') { types.add(q.type); if (!shot.has(q.type)) { shot.add(q.type); await page.waitForTimeout(300); await clean(page); await page.screenshot({ path: OUT + `charms_q_${q.type}.png` }); const r = await fit(page); ok(r.sw <= 375 && r.bad.length === 0, `375: a ${q.type} card fits (${r.bad.join(', ')})`); } }
      await step(page, true);
    }
    const b = await page.evaluate(w => WR.state.charms.cards['a1:' + w].b, word);
    ok(b === day + 1, `day ${day + 1}: ${word} glows brighter (box ${b})`);
    await makeDue(page, 'a1');
  }
  ok(['pick', 'gap', 'spell', 'mean'].every(t => types.has(t) || t === 'pick'), `review cards use gap, spell and mean (${[...types]})`);
  const m = await page.evaluate(w => ({ c: WR.state.charms.cards['a1:' + w], stars: WR.state.stars, got: WR.state.stickers.got.charms }), word);
  ok(m.c.b === 5, `${word} is mastered 💎 after 5 right answers on 5 “days”`);
  ok(m.got.includes('m1'), '“Forever Word” sticker for the first mastered charm');
  ok(m.stars > starsBefore, `stars were paid on the way (+${m.stars - starsBefore}⭐)`);
  await page.evaluate(() => WR.go('charms', 'a1')); await page.waitForSelector('.ch-charm.b5');
  await clean(page); await page.screenshot({ path: OUT + 'charms_06_hub_progress.png', fullPage: true });
  await page.click('.ch-charm.b5'); await page.waitForSelector('.ch-modal');
  ok((await page.innerText('.ch-modal')).includes('Mastered'), 'tapping a mastered charm shows its word, meaning and example');
  await page.click('#chSayE'); await page.waitForTimeout(100);
  ok(await page.evaluate(() => window.__said.slice(-1)[0].startsWith('mp3:narrator_')), 'the example is read by the recorded narrator');
  await page.click('#chOk');

  /* 5. anti-farm: a slip and a re-climb pays nothing new; practice pays nothing and changes nothing */
  const af = await page.evaluate(() => {
    const before = WR.state.stars, G = WR.Charms.grade, k = 'a1:bird';
    G('a1', 'bird', false); const b1 = WR.state.charms.cards[k].b;
    // the same glows paid again through the same award keys as a round would use
    const paid = WR.awardStars('charm', 'a1/bird/b1', 1, { kind: 'item' }) + WR.awardStars('charm', 'a1/bird/b2', 1, { kind: 'item' });
    return { b1, paid, delta: WR.state.stars - before };
  });
  ok(af.b1 === 1 && af.paid === 0, `a slip sends the charm back to 🌙 and its glows don't pay twice (${af.paid}⭐)`);
  // finish all A1 words so everything rests, then practise
  await page.evaluate(() => { const now = Date.now(); for (const w of WR.data['a1/words']) { const k = 'a1:' + w.w, c = WR.state.charms.cards[k] = WR.state.charms.cards[k] || { b: 0, r: 0, w: 0 }; if (c.b < 1) { c.b = 1; c.at = now; } c.d = now + 864e5; } WR.save(); WR.Collect.check(true); });
  await page.evaluate(() => WR.go('charms', 'a1')); await page.waitForSelector('#chPractice');
  ok(await page.$('#chGo') === null, 'when every charm is resting, only 🎲 Practice anyway is offered');
  const pr0 = await page.evaluate(() => ({ stars: WR.state.stars, cards: JSON.stringify(WR.state.charms.cards) }));
  await page.click('#chPractice'); await playRound(page, 0);
  const pr1 = await page.evaluate(() => ({ stars: WR.state.stars, cards: JSON.stringify(WR.state.charms.cards) }));
  ok(pr1.cards === pr0.cards, 'a practice round changes no charm');
  ok(pr1.stars - pr0.stars <= 2, `a practice round pays no charm stars (only a sticker or quest could: +${pr1.stars - pr0.stars})`);
  ok(await page.evaluate(() => (WR.state.stickers.got.charms || []).includes('set')), '“Full Charm Box” sticker once every A1 word is caught');

  /* 6. Learning Report, reload, cloud */
  const rep = await page.evaluate(() => { const d = WR.Report.data('week'); const row = d.english.rows.find(r => r.sk.id === 'words'); const a1 = d.english.levels.findIndex(l => l.id === 'a1'); return { name: row && row.sk.name, cell: row && row.cells[a1] }; });
  ok(rep.name === 'Word Charms' && rep.cell && rep.cell.n >= 20, `Learning Report has a Word Charms row for A1 (${JSON.stringify(rep)})`);
  await page.evaluate(() => WR.Report.practise('a1/words')); await page.waitForSelector('.ch-grid');
  ok(await page.evaluate(() => WR.current() === 'charms'), '“Practise this” on a1/words opens the Word Charms deck');
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForSelector('.realm-node');
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).charms.cards['a1:apple'].b === 5), 'progress survives a reload (inside wordRealms.save.v1)');
  const row = await page.evaluate(async () => {
    const C = WR.Cloud; let sent = null;
    const q = { select() { return q; }, eq() { return q; }, maybeSingle: async () => ({ data: null, error: null }),
      upsert(r) { sent = r; return { select: () => ({ single: async () => ({ data: { updated_at: new Date().toISOString() }, error: null }) }) }; } };
    C.client = async () => ({ from: () => q }); C.user = { id: 'test-user' }; C.username = 'mei';
    await C.push(); C.user = null; return sent;
  });
  ok(row && row.data && row.data.charms && Object.keys(row.data.charms.cards).length === 40, 'cloud payload (saves.data) carries charms.cards');
  ok(await page.evaluate(() => { const a = JSON.parse(JSON.stringify(WR.state)), b = JSON.parse(JSON.stringify(WR.state)); b.charms.cards = {}; return WR.Cloud.score(a) > WR.Cloud.score(b); }), 'caught charms count in the cloud progress score');
  const mig = await page.evaluate(old => { WR.Cloud.apply(old, new Date().toISOString()); return WR.state.charms; }, OLD);
  ok(mig && Object.keys(mig.cards).length === 0 && mig.rounds === 0, 'an old cloud save without charms migrates when applied');

  /* 7. data + generated rounds + voices */
  const gen = await page.evaluate(async () => {
    await WR.Charms.loadAll(); let bad = [], n = 0; const C = WR.Charms, save = WR.state.charms;
    const man = await fetch('assets/voice/manifest.json').then(r => r.json()), rec = man.profiles.narrator, norm = WR.Voice.norm;
    for (const l of C.LEVELS) {
      const list = WR.data[l + '/words'];
      if (list.length !== 40) bad.push(l + ' size');
      for (const w of list) for (const t of [w.w, w.def, w.ex]) if (!rec[norm(t)]) bad.push('no recording: ' + t);
      for (let r = 0; r < 400; r++) {
        // random deck states: some new, some met, some due at every box
        WR.state.charms = { cards: {}, rounds: 0 }; const now = Date.now();
        for (const w of list) { const x = Math.random(); if (x < .5) WR.state.charms.cards[l + ':' + w.w] = { b: Math.floor(Math.random() * 6), d: now - (Math.random() < .6 ? 1 : -864e5), r: 1, w: 0 }; }
        const plan = C.makeRound(l, r % 10 === 0); n++;
        const quiz = plan.filter(p => p.kind === 'quiz');
        if (!plan.length || quiz.length > 8) bad.push(l + ' round size ' + quiz.length);
        for (const p of plan) {
          if (p.kind === 'meet') { if (!quiz.some(q => q.w.w === p.w.w)) bad.push('met but not quizzed ' + p.w.w); continue; }
          if (p.options) { if (p.options.length !== 4 || !p.options.includes(p.answer) || new Set(p.options).size !== 4) bad.push(l + ' options ' + p.w.w); }
          if (p.type === 'gap' && new Set(p.options.map(o => o[0])).size !== 4) bad.push('gap first letters ' + p.w.w);
          if (p.type === 'spell' && p.w.w.split('').some(ch => p.pool.filter(x => x === ch).length < p.w.w.split('').filter(x => x === ch).length)) bad.push('spell pool ' + p.w.w);
        }
      }
    }
    WR.state.charms = save; return { bad: bad.slice(0, 8), n };
  });
  ok(gen.bad.length === 0, `${gen.n} generated rounds across 6 levels are valid, every word/meaning/example has a recording (${gen.bad.join(' | ')})`);
  ok(page.errs.length === 0, 'no page errors ' + page.errs.join(' | '));
  await page.context().close();

  /* 8. 320×658: hub, a C2 round with every card type, result */
  {
    const seed = Object.assign({}, OLD, { settings: { rate: .9, sound: false, unlockAll: true } });
    const p = await open({ width: 320, height: 658 }, seed);
    await p.evaluate(() => WR.go('charms', 'c2')); await p.waitForSelector('.ch-grid .ch-charm');
    let r = await fit(p); ok(r.sw <= 320 && r.bad.length === 0, `320: the hub with 6 level tabs fits (${r.bad.join(', ')})`);
    // catch 4 C2 words, then push them to boxes 1–4 so the next round shows every review type
    await p.evaluate(() => WR.startCharms('c2')); await playRound(p);
    await p.evaluate(() => { let i = 1; for (const c of Object.values(WR.state.charms.cards)) { c.b = i++; c.d = Date.now() - 1; } WR.save(); });
    await p.evaluate(() => WR.startCharms('c2'));
    const seen = new Set();
    while (!(await p.$('.ch-done'))) {
      const q = await p.evaluate(() => { const x = WR.Charms._q(); return x ? x.kind + ':' + x.type : null; });
      if (!q) { await p.waitForTimeout(80); continue; }
      if (!seen.has(q)) { seen.add(q); await p.waitForTimeout(350); r = await fit(p); ok(r.sw <= 320 && r.bad.length === 0, `320: a C2 ${q} card fits, taps ≥ 40 px (${r.bad.join(', ')})`); if (q === 'quiz:spell') { await clean(p); await p.screenshot({ path: OUT + 'charms_07_c2_spell_320.png' }); } }
      await step(p, true);
    }
    r = await fit(p); ok(r.sw <= 320 && r.bad.length === 0, `320: the result fits (${r.bad.join(', ')})`);
    ok(p.errs.length === 0, '320: no page errors ' + p.errs.join(' | '));
    await p.context().close();
  }
  await browser.close();
  console.log(`\n${passes} passed, ${fails} failed`);
})().catch(e => { console.error(e); process.exit(1); });
