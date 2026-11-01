// 🧒 R16 (REVIEW-2026-11-01): no teacher jargon on children's screens (Story, Story Quill, Spell Swap & the other gap games,
// Word Charms); the exam wording is in ⚙️ → 👪 Grown-ups → 📚 What the games teach.   node tools/test/jargon.js
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = { v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'a1', stars: 40, totalCorrect: 12, totalAnswered: 14,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 30, happiness: 70, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 2, last: today() }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 12 };
const JARGON = /Cambridge|Language focus|Communicative Achievement|Organisation|present simple|past simple|Starters|Movers|Flyers|Use of English|Preliminary|Proficiency|vocabulary band|open cloze|word formation|transformations?/i;
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => { window.__WR_TEST = { holdMs: 0, pinOffer: false }; });
  await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(BASE + 'index.html'); await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), SAVE);
  await page.reload(); await page.waitForSelector('.realm-node');
  const check = async (label, sel, shot) => { await page.waitForSelector(sel); await page.waitForTimeout(500);
    const txt = await page.evaluate(() => document.getElementById('main').innerText); const m = txt.match(JARGON);
    ok(!m, `${label}: no teacher jargon on screen${m ? ` (found "${m[0]}")` : ''}`); if (shot && process.env.SHOT) await page.screenshot({ path: OUT + shot }); return txt; };
  for (const lv of ['a1', 'b2']) {
    await page.evaluate(lv => WR.startStory(lv), lv); const t = await check(`Story ${lv}`, '.story-focus', lv === 'a1' && 'jargon_story_a1.png');
    if (lv === 'a1') ok(/Today's magic: there is, there are and can/.test(t.replace(/\s+/g, ' ')), "A1 story says \"Today's magic: there is, there are and can\"");
  }
  await page.evaluate(() => WR.startWriting('a1')); await check('Story Quill intro', '.quill-task, .quill-hub, #main .card', 'jargon_writing.png');
  for (const g of ['swap', 'forge', 'cloze', 'marks']) for (const lv of ['a1', 'c1']) { await page.evaluate(([g, lv]) => WR.go(g, lv), [g, lv]); await check(`${g} hub ${lv}`, '.sw-books', g === 'swap' && lv === 'a1' && 'jargon_swap_hub.png'); }
  await page.evaluate(() => WR.go('charms', 'a1')); await check('Word Charms hub', '.ch-how');
  // grown-ups: the wording is still there for parents
  await page.evaluate(() => WR.go('home')); await page.click('#setBtn'); await page.waitForSelector('#guBtn'); await page.click('#guBtn');
  await page.waitForSelector('.pgate'); const a = await page.evaluate(() => WR.parentGate._answer()); for (const d of a) await page.click(`.pgate [data-d="${d}"]`); await page.click('#pgOk');
  await page.waitForSelector('#guAbout'); await page.click('#guAbout'); await page.waitForSelector('#guNotes .gu-note');
  const notes = await page.innerText('#guNotes');
  ok(/Cambridge Starters/.test(notes) && /vocabulary band/.test(notes) && /Language focus: present simple/.test(notes) && /Communicative Achievement/.test(notes), '👪 Grown-ups → 📚 What the games teach keeps the exam wording (A1)');
  if (process.env.SHOT) await page.screenshot({ path: OUT + 'jargon_grownups_notes.png' });
  await page.click('.gu-lv [data-l="b2"]'); await page.waitForFunction(() => /Use of English/.test((document.getElementById('guNotes') || {}).innerText || ''));
  ok(true, 'the level tabs switch the notes (B2 shows Use of English)');
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2));
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
