// C2 question types: spell, picture choice, find-the-mistake, multi-gap word bank, dictation, listen-and-order, 2-speaker dialogues.
// Drives each type right and wrong at 375×667 and 320×658: no sideways overflow, tap targets ≥ 40 px, the Check button / options on screen,
// feedback shows the answer, mistakes go to the garden and come back as the same type.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
let fails = 0, passes = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; if (process.env.VERBOSE) console.log('ok', m); } };
const D = path.join(__dirname, '..', '..', 'data');
const bank = (l, s) => JSON.parse(fs.readFileSync(`${D}/${l}/${s}.json`, 'utf8'));
const find = (l, s, f) => bank(l, s).find(f);
const CASES = [
  ['spell', 'a1', 'vocab', q => q.type === 'spell' && q.art], ['spell-clue', 'a2', 'vocab', q => q.type === 'spell' && !q.art],
  ['picq', 'a1', 'vocab', q => q.type === 'picq'], ['mistake', 'b1', 'grammar', q => q.type === 'mistake'],
  ['gaps', 'a2', 'grammar', q => q.type === 'gaps'], ['dictate', 'a1', 'listening', q => q.type === 'dictate'],
  ['listen-order', 'b1', 'listening', q => q.type === 'order' && q.say], ['order-c2', 'c2', 'grammar', q => q.type === 'order'],
  ['dialogue', 'b2', 'listening', q => q.dialogue]];
// data checks
let counts = {};
for (const l of ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']) for (const s of ['grammar', 'vocab', 'listening']) for (const q of bank(l, s)) { const k = q.dialogue ? 'dialogue' : q.type === 'order' && q.say ? 'listen-order' : q.type; counts[k] = (counts[k] || 0) + 1; }
ok(counts.spell >= 18 && counts.picq >= 10 && counts.mistake >= 30 && counts.gaps >= 20 && counts.dictate >= 15 && counts['listen-order'] >= 10 && counts.dialogue >= 25, 'type counts ' + JSON.stringify(counts));
for (const l of ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']) ok(bank(l, 'grammar').some(q => q.type === 'order'), `sentence builder at ${l}`);
// C4: from A2 up, few listening answers may repeat the recording word for word (the rest are paraphrased). Items where a
// distractor is also heard (changes of mind, dialogues: "at three… sorry, at four") don't count: hearing the word gives nothing away.
const verbatim = ['a2', 'b1', 'b2', 'c1', 'c2'].flatMap(l => bank(l, 'listening').filter(q => q.type === 'listen' && (h => h(q.options[q.answer]) && !q.options.some((o, i) => i !== q.answer && h(o)))(o => q.say.toLowerCase().includes(o.toLowerCase().replace(/\.$/, '')))).map(q => l + ': ' + q.options[q.answer]));
ok(verbatim.length <= 6, `C4 word-for-word answers A2+ ≤ 6 (${verbatim.length}: ${verbatim.join(', ')})`);
const dl = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'].map(l => bank(l, 'listening').filter(q => q.dialogue).length); ok(dl.every(n => n >= 4), 'C4 dialogues at every level ' + dl);
const vis = () => { const out = []; document.querySelectorAll('.qcard button, .qcard input').forEach(e => { const r = e.getBoundingClientRect(); if (r.width > 1 && Math.min(r.width, r.height) < 39.5) out.push((e.className || e.id) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }); return out; };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  for (const vp of [{ width: 375, height: 667 }, { width: 320, height: 658 }]) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await ctx.route(/supabase|jsdelivr|unpkg/, r => r.abort());
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
    await page.addInitScript(() => { 
      if (!localStorage.getItem('wordRealms.save.v1')) localStorage.setItem('wordRealms.save.v1', JSON.stringify({ v: 1, name: 'Tester', avatar: 'avatar_girl', startLevel: 'a1', stars: 10, pet: { species: 'pet_bunny', name: 'Bun', xp: 0, happiness: 80, hunger: 30, lastTick: Date.now() }, progress: {}, owned: [], equipped: {}, settings: { rate: 1.3, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 3 })); });
    await page.goto(BASE); await page.waitForTimeout(800);
    const tag = `${vp.width}px`;
    for (const [name, lvl, sk, f] of CASES) for (const right of [true, false]) {
      const raw = find(lvl, sk, f); if (!raw) { ok(false, 'no item for ' + name); continue; }
      await page.evaluate(([r, s, raw]) => WR.startLesson({ realm: r, skill: s, key: s, title: 'C2', items: [WR.normalize(raw)] }), [lvl, sk, raw]);
      await page.waitForTimeout(250);
      const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(ov <= 0, `${tag} ${name}: no sideways overflow (${ov})`);
      const small = await page.evaluate(vis); ok(!small.length, `${tag} ${name}: tap targets ≥ 40 px ${small.join(', ')}`);
      const t = raw.type, it = await page.evaluate(() => WR._cur());
      if (t === 'spell') {
        const want = right ? raw.answer : raw.answer.split('').reverse().join('') === raw.answer ? raw.answer.slice(1) + 'z' : raw.answer.split('').reverse().join('');
        for (const ch of want) { const tiles = await page.$$('#pool .tile'); let hit = false; for (const b of tiles) if ((await b.innerText()).trim() === ch) { await b.click(); hit = true; break; } if (!hit) await tiles[0].click(); }
        ok(await page.$eval('#checkBtn', b => !b.disabled), `${tag} ${name}: Check enabled when all slots are full`);
        ok(await page.evaluate(() => { const r = document.querySelector('#checkBtn').getBoundingClientRect(); return r.bottom <= innerHeight && r.top >= 0; }), `${tag} ${name}: Check button on screen`);
        await page.click('#checkBtn');
      } else if (t === 'picq' || t === 'listen') {
        const opts = await page.$$('.opt'); ok(opts.length === 4, `${tag} ${name}: 4 options`);
        if (t === 'picq') ok(await page.$$eval('.opt img', ims => ims.length === 4 && ims.every(i => i.complete && i.naturalWidth > 0)), `${tag} ${name}: 4 painted pictures load`);
        for (const b of opts) { const lab = t === 'picq' ? await b.getAttribute('aria-label') : (await b.innerText()).replace(/^[A-D]\s*/, '').trim(); if ((lab === it.correct) === right) { await b.click(); break; } }
      } else if (t === 'mistake') {
        const ws = await page.$$('.mword'); await ws[right ? raw.wrong : (raw.wrong + 1) % ws.length].click();
      } else if (t === 'gaps') {
        const want = right ? raw.answers : raw.answers.slice().reverse();
        for (const w of want) { for (const b of await page.$$('#pool .tile')) if ((await b.innerText()).trim() === w) { await b.click(); break; } }
        ok(await page.$eval('#checkBtn', b => !b.disabled), `${tag} ${name}: Check enabled when all gaps are full`);
        await page.click('#checkBtn');
      } else if (t === 'dictate') {
        ok(await page.$('#playBtn'), `${tag} ${name}: has a play button`);
        await page.fill('#dictIn', right ? raw.answer.toUpperCase().replace(/\.$/, '') + ' ' : raw.answer.replace(/\w+/, 'Xyz')); await page.click('#checkBtn');
      } else if (t === 'order') {
        const words = right ? raw.answer.split(' ') : raw.answer.split(' ').reverse();
        for (const w of words) { for (const b of await page.$$('#pool .tile')) if ((await b.innerText()).trim() === w) { await b.click(); break; } }
        await page.click('#checkBtn');
      }
      await page.waitForTimeout(200);
      const ex = await page.$eval('#explain', e => (window.WR && WR.iconText ? (() => { const c = e.cloneNode(true); c.querySelectorAll('img.wr-icon[data-e]').forEach(i => i.replaceWith(i.dataset.e)); return c.innerText || c.textContent; })() : e.innerText));
      ok(right ? /Correct/.test(ex) : /Not quite/.test(ex), `${tag} ${name} ${right ? 'right' : 'wrong'} → ${ex.slice(0, 60).replace(/\n/g, ' ')}`);
      if (!right && t !== 'listen' && t !== 'picq') { const shown = t === 'mistake' ? raw.fix : t === 'gaps' ? raw.answers[0] : raw.answer; ok(ex.includes(shown) || ex.includes(shown.split(' ')[0]), `${tag} ${name}: wrong answer shows the right one (${shown})`); }
      if (raw.say) ok(/🎧/.test(ex), `${tag} ${name}: transcript after answering`);
      if (raw.dialogue) ok(await page.$$eval('#explain .say-line', l => l.length >= 2), `${tag} ${name}: dialogue transcript shows both speakers`);
      ok(await page.evaluate(() => { const r = document.querySelector('#nextBtn').getBoundingClientRect(); return r.width > 0; }), `${tag} ${name}: Next button`);
      if (vp.width === 375 && !right) await page.screenshot({ path: `/workspace/cefr-quest/screenshots/c2_${name}_wrong.png` });
      if (vp.width === 375 && right && name !== 'order-c2') {
        await page.evaluate(([r, s, raw]) => WR.startLesson({ realm: r, skill: s, key: s, title: 'C2', items: [WR.normalize(raw)] }), [lvl, sk, raw]); await page.waitForTimeout(200);
        await page.screenshot({ path: `/workspace/cefr-quest/screenshots/c2_${name}.png` });
      }
    }
    // garden: a missed new-type item comes back as the same type
    const g = await page.evaluate(() => { const m = WR.state.mistakes.find(x => x.raw && x.raw.type === 'gaps'); if (!m) return null; const it = WR.Garden.roundItems(50).find(i => i._mid === m.id); return it && it.type; });
    ok(g === 'gaps', `${tag} garden re-serves a gaps item as gaps (${g})`);
    // lesson mixing: with all types on, an A1 vocab lesson can include new types; the classic flag hides them
    const mix = await page.evaluate(async () => { const seen = new Set(); for (let i = 0; i < 6; i++) (await WR.buildItems('a1', 'vocab', 8)).forEach(x => seen.add(x.type)); return [...seen]; });
    ok(mix.includes('spell') || mix.includes('picq'), `${tag} new types appear in normal lessons (${mix})`);
    ok(!errs.length, `${tag} no page errors ${errs.join(' | ')}`);
    await ctx.close();
  }
  await browser.close();
  console.log(`c2types.js: ${passes} passed, ${fails} failed`);
})();
