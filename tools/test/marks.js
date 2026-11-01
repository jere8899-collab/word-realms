// 🧚 Punctuation Pixies (punctuation, A1–C2, tiles at every level): exact marking (Its ≠ It's, a full stop ≠ a comma), more than
// one tile = a nudge; all 144 gaps accept their answers, no wrong tile is right, all 432 wrong tiles have a "why not" note,
// "no mark" answers, the first read-aloud never gives the mark away, narrator MP3s for every line; old saves migrate
// (state.marks inside wordRealms.save.v1); the bonus tile with the painted icon; shelf + level tabs; an A1 round through the UI
// (miss → hint + why not → second try), rewards once, replay pays nothing; a C2 round (nudge, no-mark answer, second miss);
// quest, stickers, Learning Report row + Practise, reload, cloud payload + score + an old cloud save; 375×667 shots, 320×658 fit.
// node tools/test/marks.js   (screenshots: screenshots/marks_*.png)
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
// an old save from before Punctuation Pixies (no `marks` field); C2 start, so every realm is open
const OLD = { v: 1, name: 'Mei', avatar: 'avatar_girl', startLevel: 'c2', stars: 40, totalCorrect: 20, totalAnswered: 30,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 60, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 2, last: today() }, owned: [], equipped: { outfit: null, petskin: null, theme: null }, progress: { a1: { grammar: { best: 0.7, plays: 1, last: Date.now() } } },
  swap: { done: { 'a1.1': { best: 1, crowns: 3, plays: 1, at: Date.now() } }, rounds: 1, lvl: 'a1' },
  daily: { day: today(), quests: [{ id: 'marks1', progress: 0, claimed: false }, { id: 'correct10', progress: 0, claimed: false }, { id: 'feed1', progress: 0, claimed: false }] },
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
  const cur = p => p.evaluate(() => { const S = WR.Marks._s(); const it = S.items[S.n]; return { it, mode: S.d.mode, n: S.n, tries: S.tries }; });
  // build the word through the UI: tiles (part by part, in order) or typing
  async function fill(page, parts) {
    const { mode } = await cur(page);
    if (mode === 'tiles') {
      if (await page.locator('#pmClear').count()) await page.click('#pmClear');
      for (const w of parts) await page.evaluate(w => { const b = [...document.querySelectorAll('#pmPool .sw-tile:not([disabled])')].find(x => x.textContent === w); b.click(); }, w);
    } else await page.fill('#pmIn', parts.join(''));
  }
  const answerParts = it => [it.ans[0]];
  async function play(page, missAt = -1, shot) {
    for (let i = 0; i < 8; i++) {
      await page.waitForSelector('.sw-card #pmCheck');
      const { it } = await cur(page);
      if (i === missAt) {
        await fill(page, it.x ? [it.x[0]] : ['banana']);
        await page.click('#pmCheck'); await page.waitForTimeout(60);
        const fb = await page.innerText('#pmFb');
        ok(await page.locator('.sw-fb.bad').count() === 1 && /We need/.test(fb) && (it.x ? fb.includes('Why not') && fb.includes(it.no[it.x[0]]) : /starts with/.test(fb)), `a first miss gives a 💡 hint${it.x ? ' and the tile’s own “why not”' : ''} (${it.id}: ${fb})`);
        if (shot) { await clean(page); await page.screenshot({ path: OUT + shot + '_hint.png' }); }
      }
      await fill(page, answerParts(it));
      if (shot && i === 0) { await clean(page); await page.screenshot({ path: OUT + shot + '_q.png' }); }
      await page.click('#pmCheck');
      await page.waitForSelector('#pmNext');
      if (shot && i === missAt + 1) { await clean(page); await page.screenshot({ path: OUT + shot + '_right.png' }); }
      await page.click('#pmNext');
    }
    await page.waitForSelector('.sw-done');
  }

  const page = await open({ width: 375, height: 667 }, OLD);
  /* 1. marking rules + every gap */
  const rules = await page.evaluate(() => { const C = WR.Marks, it = { ans: ['It\'s'], x: ['Its', 'Its\'', 'It\'is'] };
    return { ok: C.check(it, "It's").ok, near: C.check(it, 'Its').why, many: C.check(it, "It's Its").why, empty: C.check(it, ' ').why,
      comma: C.check({ ans: [','], x: ['.', '?', '!'] }, '.').ok }; });
  ok(rules.ok && rules.near === 'wrong' && !rules.comma, `exact marking: It's is right, Its is a try, a full stop is not a comma (${JSON.stringify(rules)})`);
  ok(rules.many === 'tiles' && rules.empty === 'empty', 'nudges: more than one tile, nothing tapped');
  const bank = await page.evaluate(async () => { const out = { n: 0, books: 0, bad: [], lv: {}, man: 0, miss: [], nos: 0, none: 0, ask: 0 };
    const man = await fetch('assets/voice/manifest.json').then(r => r.json()), nar = man.profiles.narrator;
    const norm = t => String(t).replace(/\s+/g, ' ').trim();
    for (const l of WR.Marks.LEVELS) { const d = await WR.bank(l, 'marks'); out.lv[l] = d.mode;
      for (const b of d.books) { out.books++; for (const it of b.items) { out.n++;
        for (const a of it.ans) if (!WR.Marks.check(it, a).ok) out.bad.push(it.id + ' ' + a);
        if (!WR.Marks.KINDS[it.kind]) out.bad.push(it.id + ' kind');
        if (it.x.length !== 3 || new Set(it.x).size !== 3 || it.x.some(x => WR.Marks.check(it, x).ok)) out.bad.push(it.id + ' a wrong tile is right');
        if (Object.keys(it.no).sort().join() !== it.x.slice().sort().join() || Object.values(it.no).some(n => n.length < 15)) out.bad.push(it.id + ' why-not notes'); else out.nos += 3;
        if ((it.s.match(/___/g) || []).length !== 1 || !it.tip || !/^[A-Z“]/.test(it.say) || it.say.includes('___') || it.say.includes(d.none)) out.bad.push(it.id + ' say/tip');
        if (it.ans[0] === d.none) { out.none++; if (it.say !== it.s.replace('___', '').replace(/^./, c => c.toUpperCase())) out.bad.push(it.id + ' no-mark say'); }
        if (!/[A-Za-z]/.test(it.ans[0])) { if (it.ask === it.say) out.bad.push(it.id + ' ask gives the mark away'); else out.ask++; }
        for (const t of [it.say, it.ask]) if (nar[norm(t)]) out.man++; else out.miss.push(t);
      } } }
    return out; });
  ok(bank.n === 144 && bank.books === 18 && bank.bad.length === 0, `144 gaps in 18 books: every answer accepted, no wrong tile also right, known hint kinds, clean sentences (${bank.bad.slice(0, 5)})`);
  ok(bank.nos === 432, `every one of the 432 wrong tiles has its own “why not” note (${bank.nos})`);
  ok(Object.values(bank.lv).every(m => m === 'tiles'), `tiles at every level (${JSON.stringify(bank.lv)})`);
  ok(bank.none >= 8 && bank.ask >= 60, `“no mark” answers (${bank.none}) read without a gap; ${bank.ask} mark answers are read aloud WITHOUT their mark first`);
  ok(bank.man === 288 && !bank.miss.length, `every first and full read-aloud has a narrator MP3 in the manifest (${bank.man}/288; missing ${bank.miss.slice(0, 3)})`);

  /* 2. migration + entry points */
  const pm0 = await page.evaluate(() => WR.state.marks);
  ok(pm0 && typeof pm0.done === 'object' && !Object.keys(pm0.done).length && pm0.rounds === 0, 'old save gains an empty marks block');
  ok(await page.evaluate(() => WR.state.progress.a1.grammar.best === 0.7 && WR.state.swap.done['a1.1'].crowns === 3 && WR.state.cloze && WR.state.forge), 'the rest of the old save is untouched');
  for (const r of ['a1', 'c2']) { await page.evaluate(r => WR.go('realm', r), r); ok(await page.locator('.marks-tile').count() === 1 && await page.locator('.cloze-tile').count() === 1, `${r.toUpperCase()} realm has a Punctuation Pixies bonus tile (next to Word Bridges)`); }
  ok(await page.evaluate(() => { const t = document.querySelector('.marks-tile'); return !!t.querySelector('img') && !/🧚/.test(t.textContent); }), 'the bonus tile shows the painted pixie icon, not an emoji');
  await page.evaluate(() => WR.go('realm', 'a1')); await page.click('.marks-tile'); await page.waitForSelector('.sw-book');
  ok(await page.locator('.sw-book').count() === 3 && await page.locator('.ch-lv').count() === 6 && /Punctuation Pixies/.test(await page.innerText('.title')), 'the A1 shelf has 3 books and level tabs for the 6 open realms');
  await clean(page); await page.screenshot({ path: OUT + 'marks_01_shelf.png' });
  let f = await fit(page); ok(f.sw <= 375 && !f.bad.length, `375: shelf fits (${f.bad})`);

  /* 3. an A1 round through the UI: miss → hint + why not → second try; rewards once */
  const s0 = await page.evaluate(() => WR.state.stars);
  await page.click('.sw-book[data-b="a1.1"]'); await page.waitForSelector('#pmCheck');
  await page.waitForTimeout(400);
  { const first = await cur(page), v1 = await page.evaluate(() => ({ last: WR.Voice.last, said: window.__said.slice() }));
    ok(v1.last && v1.last.text === first.it.ask && (first.it.ask !== first.it.say || /[A-Za-z]/.test(first.it.ans[0])) &&   /* a capital-letter gap is read as it is (nothing to give away) */ v1.said.some(x => x.startsWith('mp3:narrator_')), `the sentence is first read WITHOUT its mark by the recorded narrator (“${first.it.ask}”)`);
    await page.click('#pmCheck'); ok((await cur(page)).tries === 0 && await page.locator('.sw-fb.nudge').count() === 1, 'checking an empty gap is a friendly nudge, not a try'); }
  await play(page, 1, 'marks_02_a1');
  ok(await page.evaluate(() => (WR.state.stickers.got.marks || []).includes('first')), 'sticker Pixie Helper');
  const s1 = await page.evaluate(() => ({ stars: WR.state.stars, d: WR.state.marks.done['a1.1'], q: WR.state.daily.quests.find(q => q.id === 'marks1') }));
  ok(s1.d && s1.d.crowns >= 2 && s1.stars > s0, `A1 book done: crowns ${s1.d && s1.d.crowns}, +${s1.stars - s0}⭐`);
  ok(s1.q && s1.q.progress >= 1, 'the marks1 quest counts the book');
  await clean(page); await page.screenshot({ path: OUT + 'marks_03_done.png' });
  f = await fit(page); ok(f.sw <= 375 && !f.bad.length, `375: result fits (${f.bad})`);
  await page.click('#pmAgain'); await play(page);
  const s2 = await page.evaluate(() => ({ stars: WR.state.stars, d: WR.state.marks.done['a1.1'] }));
  ok(s2.d.plays === 2 && s2.stars === s1.stars, `replay: no new crowns, no stars (anti-farm, +${s2.stars - s1.stars}⭐)`);

  /* 4. a C2 round: two tiles is a nudge, a "no mark" answer, a second miss shows the answer */
  await page.evaluate(() => WR.go('marks', 'c2')); await page.waitForSelector('.sw-book');
  await page.click('.sw-book[data-b="c2.1"]'); await page.waitForSelector('#pmCheck');
  let c = await cur(page);
  await page.evaluate(() => { const t = [...document.querySelectorAll('#pmPool .sw-tile')]; t[0].click(); });
  await page.evaluate(() => { const t = [...document.querySelectorAll('#pmPool .sw-tile:not([disabled])')]; t[0].click(); });
  await page.click('#pmCheck');
  ok((await cur(page)).tries === 0 && /ONE tile/.test(await page.innerText('#pmFb')), 'two tiles: a nudge, not a try');
  await fill(page, answerParts(c.it)); await page.click('#pmCheck'); await page.waitForSelector('#pmNext');
  ok(await page.locator('.sw-fb.good').count() === 1 && (await page.innerText('#pmFb')).includes(c.it.say) && await page.locator('.gr-nos .gr-no').count() === 3, 'a right answer: the full sentence, the rule and every wrong tile’s “why not”');
  await page.click('#pmNext'); await page.waitForSelector('#pmCheck');
  c = await cur(page);
  await fill(page, [c.it.x[0]]); await page.click('#pmCheck'); await page.waitForTimeout(50);
  ok(/We need/.test(await page.innerText('#pmFb')) && (await page.innerText('#pmFb')).includes(c.it.no[c.it.x[0]]), 'a first miss: hint + that tile’s own why not');
  await clean(page); await page.screenshot({ path: OUT + 'marks_04_c2_hint.png' });
  await fill(page, [c.it.x[1]]); await page.click('#pmCheck'); await page.waitForTimeout(50);
  ok(await page.locator('#pmNext').count() === 1 && (await page.innerText('#pmGap')).trim() === c.it.ans[0] && (await page.innerText('#pmFb')).includes(c.it.say), 'a second miss shows the answer and the full sentence');
  f = await fit(page); ok(f.sw <= 375 && !f.bad.length, `375: a C2 card with notes fits (${f.bad})`);
  await clean(page); await page.screenshot({ path: OUT + 'marks_05_c2_answer.png' });
  let noMark = 0;
  for (let i = 2; i < 8; i++) { await page.click('#pmNext'); await page.waitForSelector('#pmCheck'); const { it } = await cur(page); await fill(page, answerParts(it)); await page.click('#pmCheck'); await page.waitForSelector('#pmNext');
    if (it.ans[0] === 'no mark') { noMark++; if ((await page.innerText('#pmGap')).trim() === 'no mark' && (await page.innerText('#pmFb')).includes(it.say) && !it.say.includes('no mark')) noMark += 10; } }
  ok(noMark >= 11, `a “no mark” tile is accepted and the full sentence is read back without a gap (${noMark})`);
  await page.click('#pmNext'); await page.waitForSelector('.sw-done');
  const s3 = await page.evaluate(() => ({ d: WR.state.marks.done['c2.1'], t: WR.state.report.tally['c2/marks'] }));
  ok(s3.d && s3.d.crowns === 2 && s3.t[0] === 7 && s3.t[1] === 1, `C2: 7/8 → 2 crowns (${JSON.stringify(s3)})`);

  /* 5. report, reload, cloud */
  const rep = await page.evaluate(() => { const d = WR.Report.data('week'); const row = d.english.rows.find(r => r.sk.id === 'marks'); const a1 = d.english.levels.findIndex(l => l.id === 'a1'); return { name: row && row.sk.name, cell: row && row.cells[a1] }; });
  ok(rep.name === 'Punctuation Pixies' && rep.cell && rep.cell.n >= 16, `Learning Report has a Punctuation Pixies row (${JSON.stringify(rep)})`);
  await page.evaluate(() => WR.Report.practise('c2/marks')); await page.waitForSelector('.sw-book');
  ok(await page.evaluate(() => WR.current() === 'marks' && WR.state.marks.lvl === 'c2'), '“Practise this” on c2/marks opens the C2 shelf');
  ok(await page.evaluate(() => WR.Collect && WR.Collect.pages().some(p => p.id === 'marks')), 'the Sticker Book has a Punctuation Pixies page');
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForSelector('.realm-node');
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).marks.done['c2.1'].crowns === 2), 'progress survives a reload (inside wordRealms.save.v1)');
  const row = await page.evaluate(async () => {
    const C = WR.Cloud; let sent = null;
    const q = { select() { return q; }, eq() { return q; }, maybeSingle: async () => ({ data: null, error: null }),
      upsert(r) { sent = r; return { select: () => ({ single: async () => ({ data: { updated_at: new Date().toISOString() }, error: null }) }) }; } };
    C.client = async () => ({ from: () => q }); C.user = { id: 'test-user' }; C.username = 'mei';
    await C.push(); C.user = null; return sent;
  });
  ok(row && row.data && row.data.marks && row.data.marks.done['a1.1'], 'cloud payload (saves.data) carries marks.done');
  ok(await page.evaluate(() => { const a = JSON.parse(JSON.stringify(WR.state)), b = JSON.parse(JSON.stringify(WR.state)); b.marks.done = {}; return WR.Cloud.score(a) > WR.Cloud.score(b); }), 'Punctuation Pixies crowns count in the cloud progress score');
  const mig = await page.evaluate(old => { WR.Cloud.apply(old, new Date().toISOString()); return WR.state.marks; }, OLD);
  ok(mig && !Object.keys(mig.done).length && mig.rounds === 0, 'an old cloud save without marks migrates when applied');
  ok(page.errs.length === 0, 'no page errors ' + page.errs.join(' | '));
  await page.context().close();

  /* 6. 320×658: shelf + a late card (story so far) at every level fit */
  {
    const p = await open({ width: 320, height: 658 }, Object.assign({}, OLD, { settings: { rate: .9, sound: false, unlockAll: true } }));
    for (const l of ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']) {
      await p.evaluate(l => WR.go('marks', l), l); await p.waitForSelector('.sw-book');
      let r = await fit(p); ok(r.sw <= 320 && !r.bad.length, `320: the ${l.toUpperCase()} shelf fits (${r.bad})`);
      await p.click(`.sw-book[data-b="${l}.3"]`); await p.waitForSelector('#pmCheck');
      for (let k = 0; k < 3; k++) { const { it } = await cur(p); await fill(p, answerParts(it)); await p.click('#pmCheck'); await p.waitForSelector('#pmNext'); await p.click('#pmNext'); await p.waitForSelector('#pmCheck'); }
      const { it, mode } = await cur(p);
      if (mode === 'tiles') { await fill(p, [it.x[1]]); await p.click('#pmCheck'); await p.waitForTimeout(100); }
      await fill(p, answerParts(it)); await p.waitForTimeout(400);
      r = await fit(p); ok(r.sw <= 320 && !r.bad.length, `320: a ${l.toUpperCase()} ${mode} card with the gap filled fits, taps ≥ 40 px (${r.bad})`);
      if (l === 'b1') { await clean(p); await p.screenshot({ path: OUT + 'marks_06_b1_320.png' }); }
      await p.click('#pmCheck'); await p.waitForSelector('#pmNext');
      if (l === 'a2') ok(await p.locator('.gr-nos .gr-no').count() === 3, 'A2: after the answer, every wrong tile shows its “why not”');
      r = await fit(p); ok(r.sw <= 320 && !r.bad.length, `320: the ${l.toUpperCase()} feedback fits (${r.bad})`);
    }
    ok(p.errs.length === 0, '320: no page errors ' + p.errs.join(' | '));
    await p.context().close();
  }
  await browser.close();
  console.log(`\n${passes} passed, ${fails} failed`);
})().catch(e => { console.error(e); process.exit(1); });
