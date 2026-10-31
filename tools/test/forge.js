// ⚒️ Word Forge (word formation, A1–C2): the marking rules (case, spaces, curly quotes, root unchanged / several words =
// nudge), every one of the 144 items accepts all its answers, its tile answer can be built and junk is refused; old saves
// migrate (state.forge inside wordRealms.save.v1); the bonus tile in every realm; the anvil shelf with level tabs; an A1 tile
// round through the UI (miss → hint → second try), rewards once (WR.finishUnit), replay pays nothing; a B2 typed round
// (nudges are not tries, a second miss shows the answer); narrator MP3s for every sentence; quest, stickers, Learning Report
// row + Practise, reload, cloud payload + score + an old cloud save; 375×667 screenshots and 320×658 fit audits; no errors.
// node tools/test/forge.js   (screenshots: screenshots/forge_*.png)
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
// an old save from before Word Forge (no `forge` field); B2 start, so A1–B2 are open
const OLD = { v: 1, name: 'Mei', avatar: 'avatar_girl', startLevel: 'b2', stars: 40, totalCorrect: 20, totalAnswered: 30,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 60, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 2, last: today() }, owned: [], equipped: { outfit: null, petskin: null, theme: null }, progress: { a1: { grammar: { best: 0.7, plays: 1, last: Date.now() } } },
  swap: { done: { 'a1.1': { best: 1, crowns: 3, plays: 1, at: Date.now() } }, rounds: 1, lvl: 'a1' },
  daily: { day: today(), quests: [{ id: 'forge1', progress: 0, claimed: false }, { id: 'correct10', progress: 0, claimed: false }, { id: 'feed1', progress: 0, claimed: false }] },
  settings: { rate: .9, sound: false, unlockAll: false }, mistakes: [], lessonsDone: 3 };
const MOB = { deviceScaleFactor: 2, isMobile: true, hasTouch: true };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  async function open(vp, seed) {
    const ctx = await browser.newContext({ ...MOB, viewport: vp });
    await ctx.addInitScript(s => {
      if (!sessionStorage.getItem('seeded')) { localStorage.setItem('wordRealms.save.v1', s); sessionStorage.setItem('seeded', '1'); }
      window.__said = [];
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
  const cur = p => p.evaluate(() => { const S = WR.Forge._s(); const it = S.items[S.n]; return { it, mode: S.d.mode, n: S.n, tries: S.tries }; });
  // build the word through the UI: tiles (part by part, in order) or typing
  async function fill(page, parts) {
    const { mode } = await cur(page);
    if (mode === 'tiles') {
      if (await page.locator('#fgClear').count()) await page.click('#fgClear');
      for (const w of parts) await page.evaluate(w => { const b = [...document.querySelectorAll('#fgPool .sw-tile:not([disabled])')].find(x => x.textContent === w); b.click(); }, w);
    } else await page.fill('#fgIn', parts.join(''));
  }
  const answerParts = it => it.p || [it.ans[0]];
  async function play(page, missAt = -1, shot) {
    for (let i = 0; i < 8; i++) {
      await page.waitForSelector('.sw-card #fgCheck');
      const { it } = await cur(page);
      if (i === missAt) {
        await fill(page, it.x ? it.x : ['banana']);
        await page.click('#fgCheck'); await page.waitForTimeout(60);
        ok(await page.locator('.sw-fb.bad').count() === 1 && /starts with/.test(await page.innerText('#fgFb')) && (!it.p || /\(\d tiles?\)/.test(await page.innerText('#fgFb'))), `a first miss gives a 💡 hint (${it.id}: ${await page.innerText('#fgFb')})`);
        if (shot) { await clean(page); await page.screenshot({ path: OUT + shot + '_hint.png' }); }
      }
      await fill(page, answerParts(it));
      if (shot && i === 0) { await clean(page); await page.screenshot({ path: OUT + shot + '_q.png' }); }
      await page.click('#fgCheck');
      await page.waitForSelector('#fgNext');
      if (shot && i === missAt + 1) { await clean(page); await page.screenshot({ path: OUT + shot + '_right.png' }); }
      await page.click('#fgNext');
    }
    await page.waitForSelector('.sw-done');
  }

  const page = await open({ width: 375, height: 667 }, OLD);
  /* 1. marking rules + every item */
  const rules = await page.evaluate(() => { const F = WR.Forge, it = { root: 'BEAUTY', ans: ['beautifully'] }, h = { root: 'EXPLAIN', ans: ['self-explanatory', 'self explanatory'] };
    return { caps: F.check(it, '  Beautifully. ').ok, curly: F.canon('Don’t-Stop!') === "don't-stop", root: F.check(it, 'BEAUTY').why, words: F.check(it, 'very beautiful').why,
      wrong: F.check(it, 'beautyful').why, empty: F.check(it, '   ').why, hyphen: F.check(h, 'Self - Explanatory').ok && F.check(h, 'self explanatory').ok }; });
  ok(rules.caps && rules.curly && rules.hyphen, `capitals, spaces at the ends, full stops and curly quotes don't matter; hyphens are kept (${JSON.stringify(rules)})`);
  ok(rules.root === 'root' && rules.words === 'words' && rules.wrong === 'wrong' && rules.empty === 'empty', 'nudges: root unchanged, several words, empty; a misspelling is wrong');
  const bank = await page.evaluate(async () => { const out = { n: 0, books: 0, bad: [], lv: {}, man: 0, miss: [] };
    const man = await fetch('assets/voice/manifest.json').then(r => r.json()), nar = man.profiles.narrator;
    const norm = t => String(t).replace(/\s+/g, ' ').trim();
    for (const l of WR.Forge.LEVELS) { const d = await WR.bank(l, 'forge'); out.lv[l] = d.mode;
      for (const b of d.books) { out.books++; for (const it of b.items) { out.n++;
        for (const a of it.ans) if (!WR.Forge.check(it, a).ok) out.bad.push(it.id + ' ' + a);
        if (WR.Forge.check(it, it.root).ok || WR.Forge.check(it, 'purple').ok) out.bad.push(it.id + ' junk accepted');
        if (d.mode === 'tiles' && (it.p.join('') !== it.ans[0] || it.x.some(x => it.p.includes(x)))) out.bad.push(it.id + ' tiles');
        if (!it.tip || !/___/.test(it.s) || it.say !== it.s.replace('___', it.ans[0]).replace(/^./, c => c.toUpperCase())) out.bad.push(it.id + ' say/tip');
        for (const t of [it.say, it.ask]) if (nar[norm(t)]) out.man++; else out.miss.push(t);
      } } }
    return out; });
  ok(bank.n === 144 && bank.books === 18 && bank.bad.length === 0, `144 items in 18 anvils: every answer is accepted, the root and junk are refused, tiles build answer 1 (${bank.bad.slice(0, 5)})`);
  ok(bank.lv.a1 === 'tiles' && bank.lv.a2 === 'tiles' && ['b1', 'b2', 'c1', 'c2'].every(l => bank.lv[l] === 'type'), `tiles at A1/A2, typing from B1 (${JSON.stringify(bank.lv)})`);
  ok(bank.man === 288 && !bank.miss.length, `every gapped and full sentence has a narrator MP3 in the manifest (${bank.man}/288; missing ${bank.miss.slice(0, 3)})`);

  /* 2. migration + entry points */
  const fg0 = await page.evaluate(() => WR.state.forge);
  ok(fg0 && typeof fg0.done === 'object' && !Object.keys(fg0.done).length && fg0.rounds === 0, 'old save gains an empty forge block');
  ok(await page.evaluate(() => WR.state.progress.a1.grammar.best === 0.7 && WR.state.swap.done['a1.1'].crowns === 3 && WR.state.phonics && WR.state.charms), 'the rest of the old save is untouched (Spell Swap progress too)');
  for (const r of ['a1', 'b2']) { await page.evaluate(r => WR.go('realm', r), r); ok(await page.locator('.forge-tile').count() === 1 && await page.locator('.swap-tile').count() === 1, `${r.toUpperCase()} realm has a Word Forge bonus tile (next to Spell Swap)`); }
  await page.evaluate(() => WR.go('realm', 'a1')); await page.click('.forge-tile'); await page.waitForSelector('.sw-book');
  ok(await page.locator('.sw-book').count() === 3 && await page.locator('.ch-lv').count() === 4 && /Word Forge/.test(await page.innerText('.title')), 'the A1 shelf has 3 anvils and level tabs for the 4 open realms');
  ok(/word-part tiles/.test(await page.innerText('.sw-how')), 'A1 explains the tile task');
  await clean(page); await page.screenshot({ path: OUT + 'forge_01_shelf.png', fullPage: true });
  let f = await fit(page); ok(f.sw <= 375 && !f.bad.length, `375: the shelf fits, taps ≥ 40 px (${f.bad})`);
  await page.click('.ch-lv[data-l="b1"]'); await page.waitForSelector('.sw-book');
  ok(await page.evaluate(() => WR.current() === 'forge' && WR.state.forge.lvl === 'b1') && /Type one word/.test(await page.innerText('.sw-how')), 'a level tab opens the B1 shelf (typed)');

  /* 3. an A1 tile round: miss → hint → second try, rewards */
  await page.evaluate(() => WR.go('forge', 'a1')); await page.waitForSelector('.sw-book');
  const s0 = await page.evaluate(() => ({ stars: WR.state.stars, ans: WR.state.totalAnswered }));
  await page.click('.sw-book[data-b="a1.1"]'); await page.waitForSelector('.sw-card');
  ok(await page.evaluate(() => document.body.classList.contains('wr-focus')), 'the tab bar hides during a round (focus mode)');
  await page.waitForTimeout(400);
  const first = await cur(page);
  ok(await page.innerText('.fg-root') === '⚒️ ' + first.it.root || (await page.innerText('.fg-root')).includes(first.it.root), `the root word chip shows ${first.it.root}`);
  const v1 = await page.evaluate(() => ({ last: WR.Voice.last, said: window.__said.slice() }));
  ok(v1.last && v1.last.text === first.it.ask && v1.said.some(x => x.startsWith('mp3:narrator_')), `the gapped sentence is read by the recorded narrator (“${first.it.ask}”)`);
  await page.click('#fgCheck'); ok((await cur(page)).tries === 0 && await page.locator('.sw-fb.nudge').count() === 1, 'checking an empty gap is a friendly nudge, not a try');
  await play(page, 0, 'forge_02_a1');
  const s1 = await page.evaluate(() => ({ stars: WR.state.stars, fg: WR.state.forge, ans: WR.state.totalAnswered, q: WR.state.daily.quests.find(q => q.id === 'forge1'),
    tally: WR.state.report.tally['a1/forge'], day: WR.state.report.days[WR.today()], got: (WR.state.stickers.got.forge || []), said: window.__said.slice(-3) }));
  ok(s1.fg.done['a1.1'] && s1.fg.done['a1.1'].crowns === 3 && s1.fg.rounds === 1, `7 right + 1 on the second try = 7.5/8 → 3 crowns saved for a1.1 (${JSON.stringify(s1.fg.done['a1.1'])})`);
  ok(s1.ans - s0.ans === 8 && s1.tally[0] === 7 && s1.tally[1] === 1, `8 first tries counted (report key a1/forge ${s1.tally})`);
  ok(s1.day && s1.day.l >= 1 && s1.q.progress === 1, 'the round is logged for the report and the forge1 quest progresses');
  ok(s1.got.includes('first') && s1.got.includes('star'), `stickers First Forge + Forge Star (${s1.got})`);
  ok(s1.stars - s0.stars === 17 + 4, `first finish pays 7½ + 3 + 3×2 crowns (+4 stickers) = +21⭐ (got +${s1.stars - s0.stars})`);
  await clean(page); await page.screenshot({ path: OUT + 'forge_03_done.png' });
  f = await fit(page); ok(f.sw <= 375 && !f.bad.length, `375: the result fits (${f.bad})`);
  await page.click('#fgAgain'); await play(page);
  const s2 = await page.evaluate(() => ({ stars: WR.state.stars, d: WR.state.forge.done['a1.1'] }));
  ok(s2.d.plays === 2 && s2.stars === s1.stars, `replay: no new crowns, no stars (anti-farm, +${s2.stars - s1.stars}⭐)`);

  /* 4. a B2 typed round: root unchanged / several words are nudges, a second miss shows the answer */
  await page.evaluate(() => WR.go('forge', 'b2')); await page.waitForSelector('.sw-book');
  await page.click('.sw-book[data-b="b2.2"]'); await page.waitForSelector('#fgIn');
  let c = await cur(page);
  await page.fill('#fgIn', c.it.root.toLowerCase()); await page.click('#fgCheck');
  ok((await cur(page)).tries === 0 && /Change/.test(await page.innerText('#fgFb')), 'the root unchanged: a nudge, not a try');
  await page.fill('#fgIn', 'two words'); await page.click('#fgCheck');
  ok((await cur(page)).tries === 0 && /one word/.test(await page.innerText('#fgFb')), 'several words: a nudge, not a try');
  await page.fill('#fgIn', c.it.ans[0].toUpperCase() + ' '); ok((await page.innerText('#fgGap')).trim() === c.it.ans[0].toUpperCase(), 'the gap shows what is typed');
  await page.click('#fgCheck'); await page.waitForSelector('#fgNext');
  ok(await page.locator('.sw-fb.good').count() === 1 && await page.locator('.sw-tip').count() === 1 && (await page.innerText('#fgGap')) === c.it.ans[0], 'a right answer in capitals is accepted, the gap shows the word and the reason is shown');
  await clean(page); await page.screenshot({ path: OUT + 'forge_04_b2_right.png' });
  f = await fit(page); ok(f.sw <= 375 && !f.bad.length, `375: a B2 card fits (${f.bad})`);
  await page.click('#fgNext'); await page.waitForSelector('#fgIn');
  c = await cur(page);
  for (let k = 0; k < 2; k++) { await page.fill('#fgIn', 'banana'); await page.click('#fgCheck'); await page.waitForTimeout(50); }
  ok(await page.locator('#fgNext').count() === 1 && (await page.inputValue('#fgIn')) === c.it.ans[0] && (await page.innerText('#fgFb')).includes(c.it.say), 'a second miss shows the answer and the full sentence');
  await clean(page); await page.screenshot({ path: OUT + 'forge_05_b2_answer.png' });
  for (let i = 2; i < 8; i++) { await page.click('#fgNext'); await page.waitForSelector('#fgIn'); const { it } = await cur(page); await page.fill('#fgIn', it.ans[it.ans.length - 1]); await page.press('#fgIn', 'Enter'); await page.waitForSelector('#fgNext'); }
  await page.click('#fgNext'); await page.waitForSelector('.sw-done');
  const s3 = await page.evaluate(() => ({ d: WR.state.forge.done['b2.2'], t: WR.state.report.tally['b2/forge'] }));
  ok(s3.d && s3.d.crowns === 2 && s3.t[0] === 7 && s3.t[1] === 1, `B2: 7/8 → 2 crowns (${JSON.stringify(s3)})`);

  /* 5. report, reload, cloud */
  const rep = await page.evaluate(() => { const d = WR.Report.data('week'); const row = d.english.rows.find(r => r.sk.id === 'forge'); const a1 = d.english.levels.findIndex(l => l.id === 'a1'); return { name: row && row.sk.name, cell: row && row.cells[a1] }; });
  ok(rep.name === 'Word Forge' && rep.cell && rep.cell.n >= 16, `Learning Report has a Word Forge row (${JSON.stringify(rep)})`);
  await page.evaluate(() => WR.Report.practise('b2/forge')); await page.waitForSelector('.sw-book');
  ok(await page.evaluate(() => WR.current() === 'forge' && WR.state.forge.lvl === 'b2'), '“Practise this” on b2/forge opens the B2 shelf');
  ok(await page.evaluate(() => WR.Collect && WR.Collect.pages().some(p => p.id === 'forge')), 'the Sticker Book has a Word Forge page');
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForSelector('.realm-node');
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).forge.done['b2.2'].crowns === 2), 'progress survives a reload (inside wordRealms.save.v1)');
  const row = await page.evaluate(async () => {
    const C = WR.Cloud; let sent = null;
    const q = { select() { return q; }, eq() { return q; }, maybeSingle: async () => ({ data: null, error: null }),
      upsert(r) { sent = r; return { select: () => ({ single: async () => ({ data: { updated_at: new Date().toISOString() }, error: null }) }) }; } };
    C.client = async () => ({ from: () => q }); C.user = { id: 'test-user' }; C.username = 'mei';
    await C.push(); C.user = null; return sent;
  });
  ok(row && row.data && row.data.forge && row.data.forge.done['a1.1'], 'cloud payload (saves.data) carries forge.done');
  ok(await page.evaluate(() => { const a = JSON.parse(JSON.stringify(WR.state)), b = JSON.parse(JSON.stringify(WR.state)); b.forge.done = {}; return WR.Cloud.score(a) > WR.Cloud.score(b); }), 'Word Forge crowns count in the cloud progress score');
  const mig = await page.evaluate(old => { WR.Cloud.apply(old, new Date().toISOString()); return WR.state.forge; }, OLD);
  ok(mig && !Object.keys(mig.done).length && mig.rounds === 0, 'an old cloud save without forge migrates when applied');
  ok(page.errs.length === 0, 'no page errors ' + page.errs.join(' | '));
  await page.context().close();

  /* 6. 320×658: shelf + a card at every level fit */
  {
    const p = await open({ width: 320, height: 658 }, Object.assign({}, OLD, { settings: { rate: .9, sound: false, unlockAll: true } }));
    for (const l of ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']) {
      await p.evaluate(l => WR.go('forge', l), l); await p.waitForSelector('.sw-book');
      let r = await fit(p); ok(r.sw <= 320 && !r.bad.length, `320: the ${l.toUpperCase()} shelf fits (${r.bad})`);
      await p.click(`.sw-book[data-b="${l}.3"]`); await p.waitForSelector('#fgCheck');
      const { it, mode } = await cur(p); await fill(p, answerParts(it)); await p.waitForTimeout(400);
      r = await fit(p); ok(r.sw <= 320 && !r.bad.length, `320: a ${l.toUpperCase()} ${mode} card with the gap filled fits, taps ≥ 40 px (${r.bad})`);
      if (l === 'c2') { await clean(p); await p.screenshot({ path: OUT + 'forge_06_c2_320.png' }); }
      await p.click('#fgCheck'); await p.waitForSelector('#fgNext');
      r = await fit(p); ok(r.sw <= 320 && !r.bad.length, `320: the ${l.toUpperCase()} feedback fits (${r.bad})`);
    }
    ok(p.errs.length === 0, '320: no page errors ' + p.errs.join(' | '));
    await p.context().close();
  }
  await browser.close();
  console.log(`\n${passes} passed, ${fails} failed`);
})().catch(e => { console.error(e); process.exit(1); });
