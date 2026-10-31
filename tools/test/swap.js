// 🔀 Spell Swap (sentence transformations, A1–C2): the marking rules (contractions = two words, whole sentence typed,
// key word, word range, curly quotes), every one of the 144 items accepts all its answers and its tile answer can be built;
// old saves migrate (state.swap inside wordRealms.save.v1); the bonus tile in every realm; the book shelf with level tabs;
// an A1 tile round through the UI (miss → hint → second try), rewards once (WR.finishUnit), replay pays only new crowns;
// a B2 typed round (nudges are not tries, a second miss shows the answer); quest, stickers, Learning Report row + Practise,
// reload, cloud payload + score + an old cloud save; 375×667 screenshots and 320×658 fit audits (taps ≥ 40 px); no errors.
// node tools/test/swap.js   (screenshots: screenshots/swap_*.png)
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
// an old save from before Spell Swap (no `swap` field); B2 start, so A1–B2 are open
const OLD = { v: 1, name: 'Mei', avatar: 'avatar_girl', startLevel: 'b2', stars: 40, totalCorrect: 20, totalAnswered: 30,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 60, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 2, last: today() }, owned: [], equipped: { outfit: null, petskin: null, theme: null }, progress: { a1: { grammar: { best: 0.7, plays: 1, last: Date.now() } } },
  daily: { day: today(), quests: [{ id: 'swap1', progress: 0, claimed: false }, { id: 'correct10', progress: 0, claimed: false }, { id: 'feed1', progress: 0, claimed: false }] },
  settings: { rate: .9, sound: false, unlockAll: false }, mistakes: [], lessonsDone: 3 };
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
  const clean = async p => { await p.evaluate(() => document.querySelectorAll('.confetti-layer,.toast').forEach(e => e.remove())); await p.waitForTimeout(400); };
  const fit = page => page.evaluate(() => {
    const bad = [], vis = el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    for (const el of [...document.getElementById('main').querySelectorAll('button,.btn,input')].filter(vis)) {
      el.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = el.getBoundingClientRect();
      if (r.height < 40 || r.width < 40) bad.push('small ' + (el.id || el.textContent.trim().slice(0, 16)) + ' ' + Math.round(r.width) + '×' + Math.round(r.height));
      if (r.left < -1 || r.right > innerWidth + 1) bad.push('off-screen ' + (el.id || el.textContent.trim().slice(0, 16)));
      const hit = document.elementFromPoint(Math.min(innerWidth - 1, r.left + r.width / 2), r.top + Math.min(r.height / 2, 20));
      if (!hit || !(el === hit || el.contains(hit))) bad.push('covered ' + (el.id || el.textContent.trim().slice(0, 16)));
    }
    window.scrollTo(0, 0);
    return { bad, sw: document.documentElement.scrollWidth };
  });
  const cur = p => p.evaluate(() => { const S = WR.Swap._s(); const it = S.items[S.n]; return { it, mode: S.d.mode, n: S.n, tries: S.tries }; });
  // fill the gap through the UI: tiles (by word) or typing
  async function fill(page, text) {
    const { mode } = await cur(page);
    if (mode === 'tiles') {
      if (await page.locator('#swClear').count()) await page.click('#swClear');
      for (const w of text.split(' ')) await page.evaluate(w => { const b = [...document.querySelectorAll('#swPool .sw-tile:not([disabled])')].find(x => x.textContent === w); b.click(); }, w);
    } else await page.fill('#swIn', text);
  }
  async function play(page, missAt = -1, shot) {
    for (let i = 0; i < 8; i++) {
      await page.waitForSelector('.sw-card #swCheck');
      const { it } = await cur(page);
      if (i === missAt) {
        const wrongTiles = it.x ? it.x.slice(0, 1).join(' ') : 'banana';
        await fill(page, it.x ? wrongTiles : (it.cue.match(/^[A-Z']+$/) ? it.cue.toLowerCase() + ' purple banana' : 'banana'));
        await page.click('#swCheck'); await page.waitForTimeout(60);
        ok(await page.locator('.sw-fb.bad').count() === 1 && /starts with/.test(await page.innerText('#swFb')) && (it.x ? new RegExp(`\\(${['', 'one', 'two', 'three', 'four'][it.ans[0].split(' ').length]} tiles?\\)`).test(await page.innerText('#swFb')) : true), `a first miss gives a 💡 hint (${it.id}: ${await page.innerText('#swFb')})`);
        if (shot) { await clean(page); await page.screenshot({ path: OUT + shot + '_hint.png' }); }
      }
      await fill(page, it.ans[0]);
      if (shot && i === 0) { await clean(page); await page.screenshot({ path: OUT + shot + '_q.png' }); }
      await page.click('#swCheck');
      await page.waitForSelector('#swNext');
      if (shot && i === missAt + 1) { await clean(page); await page.screenshot({ path: OUT + shot + '_right.png' }); }
      await page.click('#swNext');
    }
    await page.waitForSelector('.sw-done');
  }

  const page = await open({ width: 375, height: 667 }, OLD);
  /* 1. marking rules + every item */
  const rules = await page.evaluate(() => { const S = WR.Swap, b2 = { mode: 'type', min: 2, max: 5, key: true };
    const it = { b: 'I ___ for the test.', cue: 'WISH', ans: ['wish I had studied', "wish I'd studied"] };
    return {
      contr: S.canon("I don't CAN'T won't she's he'd") === 'i do not can not will not she \'s he \'d', count: S.count("wish I'd studied"),
      curly: S.check(it, 'Wish I’d studied!', b2).ok, whole: S.check(it, 'I wish I had studied for the test.', b2).ok,
      key: S.check(it, 'regret not having studied', b2).why, long: S.check(it, 'wish that I really had studied', b2).why,
      wrong: S.check(it, 'wish I studied', b2).why, empty: S.check(it, '  ', b2).why,
      b1short: S.check({ b: 'The box is ___ for me to lift.', cue: 'x', ans: ['too heavy'] }, 'too heavy', { mode: 'type', min: 1, max: 3, key: false }).ok
    }; });
  ok(rules.contr && rules.count === 4, `contractions are spread out and count as two words (wish I'd studied = ${rules.count})`);
  ok(rules.curly && rules.whole && rules.b1short, 'curly apostrophes, capitals and full stops don\'t matter; typing the whole sentence 2 is accepted');
  ok(rules.key === 'key' && rules.long === 'long' && rules.wrong === 'wrong' && rules.empty === 'empty', `nudges: missing key word, too many words, empty; otherwise wrong (${JSON.stringify(rules)})`);
  const bank = await page.evaluate(async () => { const out = { n: 0, books: 0, bad: [] };
    for (const l of WR.Swap.LEVELS) { const d = await WR.bank(l, 'swap'); const r = { mode: d.mode, min: d.min, max: d.max, key: d.key };
      for (const b of d.books) { out.books++; for (const it of b.items) { out.n++;
        for (const a of it.ans) if (!WR.Swap.check(it, a, r).ok) out.bad.push(it.id + ' ' + a);
        if (!WR.Swap.check(it, it.say, r).ok) out.bad.push(it.id + ' say');
        if (r.key && !it.ans.every(a => (' ' + WR.Swap.canon(a) + ' ').includes(' ' + WR.Swap.canon(it.cue) + ' '))) out.bad.push(it.id + ' key');
        if (r.mode === 'type' && it.ans.some(a => WR.Swap.count(a) > r.max || WR.Swap.count(a) < r.min)) out.bad.push(it.id + ' range');
        if (WR.Swap.check(it, 'purple banana', r).ok) out.bad.push(it.id + ' junk accepted');
      } } }
    return out; });
  ok(bank.n === 144 && bank.books === 18 && bank.bad.length === 0, `144 items in 18 books: every answer (and the whole model sentence) is accepted, key word + word range kept (${bank.bad.slice(0, 5)})`);

  /* 2. migration + entry points */
  const sw0 = await page.evaluate(() => WR.state.swap);
  ok(sw0 && typeof sw0.done === 'object' && !Object.keys(sw0.done).length && sw0.rounds === 0, 'old save gains an empty swap block');
  ok(await page.evaluate(() => WR.state.progress.a1.grammar.best === 0.7 && WR.state.phonics && WR.state.charms && WR.state.stories), 'the rest of the old save is untouched (other bonus blocks too)');
  for (const r of ['a1', 'b2']) { await page.evaluate(r => WR.go('realm', r), r); ok(await page.locator('.swap-tile').count() === 1, `${r.toUpperCase()} realm has a Spell Swap bonus tile`); }
  await page.locator('.swap-tile').scrollIntoViewIfNeeded(); await clean(page); await page.screenshot({ path: OUT + 'swap_01_tile.png' });
  await page.evaluate(() => WR.go('realm', 'a1')); await page.click('.swap-tile'); await page.waitForSelector('.sw-book');
  ok(await page.locator('.sw-book').count() === 3 && await page.locator('.ch-lv').count() === 4, 'the A1 shelf has 3 books and level tabs for the 4 open realms');
  ok(/Tap the word tiles/.test(await page.innerText('.sw-how')), 'A1 explains the tile task');
  await clean(page); await page.screenshot({ path: OUT + 'swap_02_shelf.png', fullPage: true });
  let f = await fit(page); ok(f.sw <= 375 && !f.bad.length, `375: the shelf fits, taps ≥ 40 px (${f.bad})`);

  /* 3. an A1 tile round: miss → hint → second try, rewards */
  const s0 = await page.evaluate(() => ({ stars: WR.state.stars, ans: WR.state.totalAnswered }));
  await page.click('.sw-book[data-b="a1.1"]'); await page.waitForSelector('.sw-card');
  ok(await page.evaluate(() => document.body.classList.contains('wr-focus')), 'the tab bar hides during a round (focus mode)');
  await page.waitForTimeout(400);
  const first = await cur(page);
  const v1 = await page.evaluate(() => ({ last: WR.Voice.last, said: window.__said.slice() }));
  ok(v1.last && v1.last.text === first.it.a && v1.said.some(x => x.startsWith('mp3:narrator_')), `sentence 1 is read aloud by the recorded narrator (“${first.it.a}”, ${v1.said})`);
  // a nudge (no tiles) is not a try
  await page.click('#swCheck'); ok((await cur(page)).tries === 0 && await page.locator('.sw-fb.nudge').count() === 1, 'checking an empty gap is a friendly nudge, not a try');
  await play(page, 0, 'swap_03_a1');
  const s1 = await page.evaluate(() => ({ stars: WR.state.stars, sw: WR.state.swap, ans: WR.state.totalAnswered, q: WR.state.daily.quests.find(q => q.id === 'swap1'),
    tally: WR.state.report.tally['a1/swap'], day: WR.state.report.days[WR.today()], got: (WR.state.stickers.got.swap || []) }));
  ok(s1.sw.done['a1.1'] && s1.sw.done['a1.1'].crowns === 3 && s1.sw.rounds === 1, `7 right + 1 on the second try = 7.5/8 → 3 crowns saved for a1.1 (${JSON.stringify(s1.sw.done['a1.1'])})`);
  ok(s1.ans - s0.ans === 8 && s1.tally[0] === 7 && s1.tally[1] === 1, `8 first tries counted (report key a1/swap ${s1.tally})`);
  ok(s1.day && s1.day.l >= 1 && s1.q.progress === 1, 'the round is logged for the report and the swap1 quest progresses');
  ok(s1.got.includes('first') && s1.got.includes('star'), `stickers First Swap + Swap Star (${s1.got})`);
  // 7.5 + 3 + 3 crowns × 2 = 16.5 → 17 (rounded) + 2 stickers × 2
  ok(s1.stars - s0.stars === 17 + 4, `first finish pays 7½ + 3 + 3×2 crowns (+4 stickers) = +21⭐ (got +${s1.stars - s0.stars})`);
  await clean(page); await page.screenshot({ path: OUT + 'swap_04_done.png' });
  f = await fit(page); ok(f.sw <= 375 && !f.bad.length, `375: the result fits (${f.bad})`);
  await page.click('#swAgain'); await play(page);
  const s2 = await page.evaluate(() => ({ stars: WR.state.stars, d: WR.state.swap.done['a1.1'] }));
  ok(s2.d.plays === 2 && s2.stars === s1.stars, `replay: no new crowns, no stars (anti-farm, +${s2.stars - s1.stars}⭐)`);

  /* 4. a B2 typed round: key word nudges, too long, whole sentence, second miss shows the answer */
  await page.evaluate(() => WR.go('swap', 'b2')); await page.waitForSelector('.sw-book');
  ok(/key word/.test(await page.innerText('.sw-how')), 'B2 explains the key word rule');
  await page.click('.sw-book[data-b="b2.1"]'); await page.waitForSelector('#swIn');
  let c = await cur(page);
  ok(await page.locator('.sw-key').count() === 1 && (await page.innerText('.sw-key')).includes(c.it.cue), `the key word chip shows ${c.it.cue}`);
  await page.fill('#swIn', 'something else entirely'); await page.click('#swCheck');
  ok((await cur(page)).tries === 0 && /key word/.test(await page.innerText('#swFb')), 'without the key word: a nudge, not a try');
  await page.fill('#swIn', c.it.cue.toLowerCase() + ' one two three four five six'); await page.click('#swCheck');
  ok((await cur(page)).tries === 0 && /too many words/.test(await page.innerText('#swFb')), 'too many words: a nudge, not a try');
  await clean(page); await page.screenshot({ path: OUT + 'swap_05_b2_nudge.png' });
  const whole = c.it.say;
  await page.fill('#swIn', whole); ok((await page.innerText('#swGap')) === whole, 'the gap shows what is typed');
  await page.click('#swCheck'); await page.waitForSelector('#swNext');
  ok(await page.locator('.sw-fb.good').count() === 1 && await page.locator('.sw-tip').count() === 1, 'typing the whole sentence 2 is right, and the rule is shown');
  ok(await page.evaluate(() => { const S = WR.Swap._s(), it = S.items[S.n]; return it.ans.includes(document.getElementById('swGap').textContent); }), 'after a right answer the gap shows just the missing words');
  await clean(page); await page.screenshot({ path: OUT + 'swap_06_b2_right.png' });
  f = await fit(page); ok(f.sw <= 375 && !f.bad.length, `375: a B2 card fits (${f.bad})`);
  await page.click('#swNext'); await page.waitForSelector('#swIn');
  c = await cur(page);
  for (let k = 0; k < 2; k++) { await page.fill('#swIn', c.it.cue.toLowerCase() + ' banana'); await page.click('#swCheck'); await page.waitForTimeout(50); }
  ok(await page.locator('#swNext').count() === 1 && (await page.inputValue('#swIn')) === c.it.ans[0] && (await page.innerText('#swGap')) === c.it.ans[0] && (await page.innerText('#swFb')).includes(c.it.say), 'a second miss shows the answer and the full sentence');
  for (let i = 2; i < 8; i++) { await page.click('#swNext'); await page.waitForSelector('#swIn'); const { it } = await cur(page); await page.fill('#swIn', it.ans[it.ans.length - 1]); await page.press('#swIn', 'Enter'); await page.waitForSelector('#swNext'); }
  await page.click('#swNext'); await page.waitForSelector('.sw-done');
  const s3 = await page.evaluate(() => ({ d: WR.state.swap.done['b2.1'], got: WR.state.stickers.got.swap, t: WR.state.report.tally['b2/swap'] }));
  ok(s3.d && s3.d.crowns === 2 && s3.got.includes('key') && s3.t[0] === 7 && s3.t[1] === 1, `B2: 7/8 → 2 crowns, Key Word Keeper sticker (${JSON.stringify(s3)})`);

  /* 5. report, reload, cloud */
  const rep = await page.evaluate(() => { const d = WR.Report.data('week'); const row = d.english.rows.find(r => r.sk.id === 'swap'); const a1 = d.english.levels.findIndex(l => l.id === 'a1'); return { name: row && row.sk.name, cell: row && row.cells[a1] }; });
  ok(rep.name === 'Spell Swap' && rep.cell && rep.cell.n >= 16, `Learning Report has a Spell Swap row (${JSON.stringify(rep)})`);
  await page.evaluate(() => WR.Report.practise('b2/swap')); await page.waitForSelector('.sw-book');
  ok(await page.evaluate(() => WR.current() === 'swap' && WR.state.swap.lvl === 'b2'), '“Practise this” on b2/swap opens the B2 shelf');
  ok(await page.evaluate(() => WR.Collect && WR.Collect.pages().some(p => p.id === 'swap')), 'the Sticker Book has a Spell Swap page');
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForSelector('.realm-node');
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).swap.done['b2.1'].crowns === 2), 'progress survives a reload (inside wordRealms.save.v1)');
  const row = await page.evaluate(async () => {
    const C = WR.Cloud; let sent = null;
    const q = { select() { return q; }, eq() { return q; }, maybeSingle: async () => ({ data: null, error: null }),
      upsert(r) { sent = r; return { select: () => ({ single: async () => ({ data: { updated_at: new Date().toISOString() }, error: null }) }) }; } };
    C.client = async () => ({ from: () => q }); C.user = { id: 'test-user' }; C.username = 'mei';
    await C.push(); C.user = null; return sent;
  });
  ok(row && row.data && row.data.swap && row.data.swap.done['a1.1'], 'cloud payload (saves.data) carries swap.done');
  ok(await page.evaluate(() => { const a = JSON.parse(JSON.stringify(WR.state)), b = JSON.parse(JSON.stringify(WR.state)); b.swap.done = {}; return WR.Cloud.score(a) > WR.Cloud.score(b); }), 'Spell Swap crowns count in the cloud progress score');
  const mig = await page.evaluate(old => { WR.Cloud.apply(old, new Date().toISOString()); return WR.state.swap; }, OLD);
  ok(mig && !Object.keys(mig.done).length && mig.rounds === 0, 'an old cloud save without swap migrates when applied');
  ok(page.errs.length === 0, 'no page errors ' + page.errs.join(' | '));
  await page.context().close();

  /* 6. 320×658: shelf + a card at every level fit */
  {
    const p = await open({ width: 320, height: 658 }, Object.assign({}, OLD, { settings: { rate: .9, sound: false, unlockAll: true } }));
    for (const l of ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']) {
      await p.evaluate(l => WR.go('swap', l), l); await p.waitForSelector('.sw-book');
      let r = await fit(p); ok(r.sw <= 320 && !r.bad.length, `320: the ${l.toUpperCase()} shelf fits (${r.bad})`);
      await p.click(`.sw-book[data-b="${l}.3"]`); await p.waitForSelector('#swCheck');
      const { it, mode } = await cur(p); await fill(p, it.ans[0]); await p.waitForTimeout(400);
      r = await fit(p); ok(r.sw <= 320 && !r.bad.length, `320: a ${l.toUpperCase()} ${mode} card with the gap filled fits, taps ≥ 40 px (${r.bad})`);
      if (l === 'c2') { await clean(p); await p.screenshot({ path: OUT + 'swap_07_c2_320.png' }); }
      await p.click('#swCheck'); await p.waitForSelector('#swNext');
      r = await fit(p); ok(r.sw <= 320 && !r.bad.length, `320: the ${l.toUpperCase()} feedback fits (${r.bad})`);
    }
    ok(p.errs.length === 0, '320: no page errors ' + p.errs.join(' | '));
    await p.context().close();
  }
  await browser.close();
  console.log(`\n${passes} passed, ${fails} failed`);
})().catch(e => { console.error(e); process.exit(1); });
