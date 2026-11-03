// 🐰 Maths round header (2026-11-03): Hint + Model used to sit inside the pet card beside the speech bubble, so on phones
// the bubble was crushed to one letter a line and Model ran off the screen. They now live in the question card's corner.
//   node tools/test/mathbubble.js   (SHOT=1 saves screenshots/mathbubble_after_<w>.png)
// At 320/360/375/390/412 px, with a long pet line: the bubble shows and is ≥ 120 px wide, Hint + Model are on screen,
// ≥ 44 px and really tappable, nothing scrolls sideways, the header stays slim; English lesson / speaking / writing pet cards too.
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = { v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'a1', stars: 60, totalCorrect: 1, totalAnswered: 1,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 20, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 1, last: today() }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false }, mistakes: [], lessonsDone: 1 };
const LONG = "I'm so happy you're here — let's keep going, you're doing brilliantly today! ✨";
const PROFILES = [[320, 658], [360, 780], [375, 667], [390, 844], [412, 915]];
// the pet card: bubble box, how many text lines and the narrowest line, anything poking out of the card, sideways scroll
const petCard = () => {
  const side = document.querySelector('.lesson .side'), b = side && side.querySelector('.bubble');
  if (!b) return { none: true };
  const r = b.getBoundingClientRect(), s = side.getBoundingClientRect(), lines = [];
  for (let w = document.createTreeWalker(b, NodeFilter.SHOW_TEXT), n = w.nextNode(); n; n = w.nextNode()) { const rg = document.createRange(); rg.selectNodeContents(n);   // text lines you can see (3 at most)
    lines.push(...[...rg.getClientRects()].filter(q => q.width > 1 && q.bottom <= r.bottom + 1)); }
  return { text: b.textContent, shown: getComputedStyle(b).display !== 'none' && r.width > 0, w: Math.round(r.width), widest: (() => { const by = {}; for (const q of lines) { const k = Math.round(q.top / 4); by[k] = by[k] || [1e9, -1e9]; by[k][0] = Math.min(by[k][0], q.left); by[k][1] = Math.max(by[k][1], q.right); }
      return Math.round(Math.max(0, ...Object.values(by).map(([a, z]) => z - a))); })(),   // a line's span (words may sit in their own spans),
    out: [...side.querySelectorAll('*')].filter(e => { const q = e.getBoundingClientRect(); return q.width && (q.right > s.right + 1 || q.left < s.left - 1); }).map(e => e.id || e.className),
    sw: document.documentElement.scrollWidth - innerWidth, inView: s.left >= -0.5 && s.right <= innerWidth + 0.5 };
};
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const [W, H] of PROFILES) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto(BASE + 'index.html'); await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), SAVE);
    await page.reload(); await page.waitForSelector('.realm-node');
    // a Grade 2 mixed round whose first question has a 🧮 Model button (both pills showing is the worst case)
    let viz = false;
    for (let k = 0; k < 40 && !viz; k++) { await page.evaluate(() => WR.Math.startLesson({ grade: 2 })); await page.waitForSelector('#hintBtn'); viz = !!(await page.$('#vizBtn')); }
    ok(viz, `${W}px: a Grade 2 round with both 💡 Hint and 🧮 Model`);
    await page.evaluate(t => { document.getElementById('lbubble').textContent = t; }, LONG); await page.waitForTimeout(250);
    const m = await page.evaluate(petCard);
    ok(m.shown && m.w >= 120, `${W}px maths: the pet's speech bubble shows and is ≥ 120 px wide (${m.w} px)`);
    ok(m.widest >= 90, `${W}px maths: the bubble text wraps in real lines, not one-letter columns (widest line ${m.widest} px: "${m.text}")`);
    ok(!m.out.length && m.inView, `${W}px maths: nothing pokes out of the pet card (${m.out})`);
    ok(m.sw <= 0, `${W}px maths: no sideways scroll (${m.sw})`);
    const pills = await page.evaluate(() => ['#hintBtn', '#vizBtn'].map(s => { const e = document.querySelector(s), r = e.getBoundingClientRect(), c = e.closest('.qcard'), q = (c || e).getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return { s, w: Math.round(r.width), h: Math.round(r.height), inCard: !!c && r.left >= q.left - .5 && r.right <= q.right + .5, inView: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight,
        tap: !!hit && (hit === e || e.contains(hit)), side: !!e.closest('.side') }; }));
    for (const p of pills) ok(p.w >= 44 && p.h >= 44 && p.inCard && p.inView && p.tap && !p.side, `${W}px ${p.s}: in the question card, fully on screen, ${p.w}×${p.h} px, tappable`);
    // the header (progress + pet card) stays slim so the question and its answer pad start high on the screen
    const head = await page.evaluate(() => Math.round(document.querySelector('.lesson .qcard').getBoundingClientRect().top - document.querySelector('.lesson').getBoundingClientRect().top));
    ok(head <= (W < 360 ? 140 : 90), `${W}px: the progress + pet rows take ${head} px above the question (≤ ${W < 360 ? 140 : 90})`);
    if (process.env.SHOT) await page.screenshot({ path: `${OUT}mathbubble_after_${W}.png` });
    await page.click('#hintBtn'); await page.waitForTimeout(150);
    ok(await page.evaluate(() => !!document.querySelector('#mexplain .explain')), `${W}px: 💡 Hint still shows the hint`);
    await page.click('#vizBtn'); await page.waitForTimeout(300);
    ok(await page.evaluate(() => document.getElementById('mviz').innerHTML.length > 20), `${W}px: 🧮 Model still draws the model`);
    ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, `${W}px: still no sideways scroll with the model open`);
    // English rounds share the pet card: wider bubble from 360 px (hidden under 340 px by design, R10), nothing squeezed
    await page.evaluate(() => WR.go('home'));
    await page.evaluate(async () => { const b = await WR.bank('a1', 'vocab'); const items = b.filter(q => !q.type || q.type === 'mcq').slice(0, 3).map(q => WR.normalize(q)); WR.startLesson({ realm: 'a1', skill: 'vocab', key: 'vocab', title: 'Words', items }); });
    await page.waitForSelector('#lstats'); await page.evaluate(t => { document.getElementById('lbubble').textContent = t; }, LONG); await page.waitForTimeout(200);
    const checkEng = async label => { const e = await page.evaluate(petCard);
      ok((W < 340 ? !e.shown : e.shown && e.w >= 120) && !e.out.length && e.sw <= 0, `${W}px ${label}: pet bubble ${W < 340 ? 'hidden (R10)' : `≥ 120 px (${e.w})`}, nothing pokes out, no sideways scroll`); };
    await checkEng('English lesson');
    await page.evaluate(() => { WR.Voice && WR.Voice.stop && WR.Voice.stop(); WR.go('home'); });
    await page.evaluate(() => WR.startSpeaking('a1')); await page.waitForSelector('#lstats'); await page.waitForTimeout(200); await checkEng('Speaking');
    await page.evaluate(() => { WR.stopSpeaking(); WR.go('home'); }); await page.waitForTimeout(150);
    await page.evaluate(() => WR.startWriting('a1')); await page.waitForSelector('.quill-task'); await page.click('.quill-task'); await page.waitForSelector('.lesson .side', { state: 'attached' }); await page.waitForTimeout(200);
    await checkEng('Writing (with the "First try" note)');
    ok(!errs.length, `${W}px: no page errors (${errs.join(' | ')})`);
    await ctx.close();
  }
  await browser.close();
  console.log(`\n${passes} passed, ${fails} failed`);
})().catch(e => { console.error(e); process.exit(1); });
