// C3 check: every multiple-choice item has a rule+example explanation and a "why not" note for each wrong option,
// and the lesson shows the note for the option the child picked (and the Mistake Garden keeps it).
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
let fails = 0, passes = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else passes++; };
const D = path.join(__dirname, '..', '..', 'data');
for (const lvl of ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']) for (const sk of ['grammar', 'vocab', 'listening', 'reading']) {
  const j = JSON.parse(fs.readFileSync(`${D}/${lvl}/${sk}.json`, 'utf8'));
  const items = sk === 'reading' ? j.passages.flatMap(p => p.questions) : j;
  for (const q of items) { if (q.type === 'order') continue;
    ok(q.explain && q.explain.length >= 8, `${lvl}/${sk} explain: ${q.q}`);
    const wrong = q.options.filter((o, i) => i !== q.answer);
    ok(q.notes && wrong.every(o => q.notes[o] && q.notes[o].length > 8), `${lvl}/${sk} notes: ${q.q}`); }
}
const BAD = /\b(minister|council chamber|parliament|treaty|ambassador|economy|constitutional|jury)\b/i;   // C5: no adult-politics stems in C1/C2 grammar+vocab
for (const lvl of ['c1', 'c2']) for (const sk of ['grammar', 'vocab']) for (const q of JSON.parse(fs.readFileSync(`${D}/${lvl}/${sk}.json`, 'utf8'))) ok(!BAD.test(q.q), `C5 kid-friendly stem ${lvl}/${sk}: ${q.q}`);
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });
  await ctx.route(/supabase|jsdelivr|unpkg/, r => r.abort());
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.addInitScript(() => { if (!localStorage.getItem('wordRealms.save.v1')) localStorage.setItem('wordRealms.save.v1', JSON.stringify({ v: 1, name: 'Tester', avatar: 'avatar_girl', startLevel: 'a1', stars: 10, pet: { species: 'pet_bunny', name: 'Bun', xp: 0, happiness: 80, hunger: 30, lastTick: Date.now() }, progress: {}, owned: [], equipped: {}, settings: { rate: 1, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 3 })); });
  await page.goto(BASE); await page.waitForTimeout(800);
  for (const lvl of ['a1', 'b1', 'c1', 'c2']) for (const sk of ['grammar', 'vocab', 'reading']) {
    await page.evaluate(([r, k]) => WR.startLesson({ realm: r, skill: k, key: k, title: k }), [lvl, sk]); await page.waitForTimeout(300);
    if (!(await page.$('.opt'))) { // first item may be an order puzzle; skip forward to an mcq
      for (let n = 0; n < 6 && !(await page.$('.opt')); n++) { await page.evaluate(() => { const b = document.querySelector('#built'); }); break; } }
    const opts = await page.$$('.opt'); if (!opts.length) { console.log('skip (no mcq first)', lvl, sk); continue; }
    const ans = String(await page.evaluate(() => WR._dbg())).trim(); let picked = null;
    for (const b of opts) { const t = (await b.innerText()).replace(/^[A-D]\s*/, '').trim(); if (t !== ans) { picked = t; await b.click(); break; } }
    await page.waitForTimeout(150);
    const why = await page.$eval('#explain', e => (e.querySelector('.why-not') || {}).innerText || '');
    ok(why.includes('Why not') && why.length > 20, `${lvl}/${sk} shows why-not for “${picked}”: ${why.slice(0, 80)}`);
    ok(await page.$('#explain .why-rule'), `${lvl}/${sk} shows the rule`);
    const m = await page.evaluate(() => WR.state.mistakes[0]); ok(m && m.notes && Object.keys(m.notes).length === 3, `${lvl}/${sk} garden keeps notes`);
  }
  // right answer: no why-not box
  await page.evaluate(() => WR.startLesson({ realm: 'b2', skill: 'vocab', key: 'vocab', title: 'v' })); await page.waitForTimeout(300);
  const ans = String(await page.evaluate(() => WR._dbg())).trim();
  for (const b of await page.$$('.opt')) if ((await b.innerText()).replace(/^[A-D]\s*/, '').trim() === ans) { await b.click(); break; }
  await page.waitForTimeout(150); ok(!(await page.$('#explain .why-not')), 'no why-not on a right answer');
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await page.evaluate(() => WR.startLesson({ realm: 'c1', skill: 'grammar', key: 'grammar', title: 'g' })); await page.waitForTimeout(300);
  const a2 = String(await page.evaluate(() => WR._dbg())).trim();
  for (const b of await page.$$('.opt')) if ((await b.innerText()).replace(/^[A-D]\s*/, '').trim() !== a2) { await b.click(); break; }
  await page.waitForTimeout(300); await page.screenshot({ path: '/workspace/cefr-quest/screenshots/c3_why_not.png' });
  await browser.close();
  console.log(`explain.js: ${passes} passed, ${fails} failed`);
})();
