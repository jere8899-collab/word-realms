// 🧭 R14 (REVIEW-2026-11-01): the realm screen shows "Today's path" (4 skills + boss) first and a "🎁 Bonus games" row that
// opens one game at a time; a new A1 player sees at most 6 choices; the 4 skills fit the first 375×667 screen; one status
// line per tile; a "New!" badge until the tile is first tapped.   node tools/test/realmpath.js   (SHOT=1 for screenshots)
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = (x = {}) => ({ v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'a1', stars: 10, totalCorrect: 0, totalAnswered: 0,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 0, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 1, last: today() }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false }, mistakes: [], lessonsDone: 0, ...x });
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  const load = async s => { await page.goto(BASE + 'manifest.webmanifest'); await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), s); /* a page without the app first, so nothing saves over the new save */ await page.goto(BASE + 'index.html'); await page.waitForSelector('.realm-node'); await page.evaluate(() => WR.go('realm', 'a1')); await page.waitForSelector('.path-grid'); await page.waitForTimeout(400); };
  const info = () => page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const choices = [...document.querySelectorAll('#main .skill-card, #main #rbossCard, #main #realmStickers')].filter(vis);
    const path = [...document.querySelectorAll('.path-grid .skill-card')];
    const bonus = [...document.querySelectorAll('#bonusRow .skill-card')].map(c => c.querySelector('h3').textContent.trim());
    const status = [...document.querySelectorAll('#main .skill-card')].map(c => c.querySelectorAll(':scope > .crowns, :scope > .waiting-tag').length);
    const pathH = document.querySelector('.path-grid').getBoundingClientRect(), sec = [...document.querySelectorAll('.realm-sec')].map(h => h.textContent.trim());
    const nav = document.querySelector('.navbar'), navTop = nav && getComputedStyle(nav).display !== 'none' ? nav.getBoundingClientRect().top : innerHeight;
    return { choices: choices.length, path: path.map(c => c.dataset.k), bonus, status, pathBottom: pathH.bottom, navTop, sec, news: document.querySelectorAll('#bonusRow .new-tag').length, more: (document.querySelector('.bonus-more') || {}).textContent || '',
      bossAfterPath: !!document.querySelector('.path-grid + #rbossCard, .path-grid + * #rbossCard') || (document.querySelector('#rbossCard') && document.querySelector('.path-grid').compareDocumentPosition(document.querySelector('#rbossCard')) & 4) };
  });
  // brand-new A1 player
  await load(SAVE());
  let r = await info();
  ok(r.sec[0].includes("Today's path") && r.sec[1].includes('Bonus games'), `sections: ${r.sec.join(' / ')}`);
  ok(r.path.join() === 'grammar,vocab,reading,listening', `Today's path holds the 4 skills (${r.path})`);
  ok(!!r.bossAfterPath, 'the boss card follows the path');
  ok(r.choices <= 6, `a new A1 player sees ${r.choices} choices (≤ 6)`);
  ok(r.bonus.length === 1, `one bonus game open at the start (${r.bonus})`);
  ok(/more/.test(r.more), `a "${r.more.trim()}" teaser shows what is still to come`);
  ok(r.pathBottom <= r.navTop, `the 4 skills fit the first 375×667 screen (bottom ${Math.round(r.pathBottom)} ≤ ${Math.round(r.navTop)})`);
  ok(r.status.every(n => n === 1), `one status line per tile (${r.status})`);
  if (process.env.SHOT) { await page.screenshot({ path: OUT + 'realmpath_01_new_player.png' }); await page.evaluate(() => document.getElementById('bonusHead').scrollIntoView()); await page.waitForTimeout(300); await page.screenshot({ path: OUT + 'realmpath_02_bonus_row.png' }); }
  // after one lesson: Story opens with a New! badge
  await load(SAVE({ bonusSeen: ['sp'], lessonsDone: 1, progress: { a1: { grammar: { best: .8, plays: 1 } } } }));
  r = await info();
  ok(r.bonus.length === 2 && r.bonus.includes('Story') && r.news === 1, `after 1 lesson Story opens with a New! badge (${r.bonus}, ${r.news} badge)`);
  ok(r.status.every(n => n === 1), 'still one status line per tile once played');
  if (process.env.SHOT) { await page.evaluate(() => document.getElementById('bonusHead').scrollIntoView()); await page.waitForTimeout(300); await page.screenshot({ path: OUT + 'realmpath_03_story_new.png' }); }
  await page.click('#bonusRow [data-story]'); await page.waitForTimeout(500);
  ok(await page.evaluate(() => WR.state.bonusSeen.includes('story')), 'tapping the tile clears its badge (saved in the save)');
  await page.evaluate(() => { WR.stopStory && WR.stopStory(); WR.go('realm', 'a1'); }); await page.waitForTimeout(300);
  ok((await info()).news === 0, 'no badge after the first tap');
  // later: Word Charms after 3 lessons; long-time players see everything with no New! flood
  await load(SAVE({ lessonsDone: 3 }));
  r = await info(); ok(r.bonus.includes('Word Charms') && !r.bonus.includes('Writing'), `3 lessons: Word Charms open, Writing not yet (${r.bonus})`);
  await load(SAVE({ lessonsDone: 40 }));
  r = await info(); ok(r.bonus.length >= 8 && r.news === 0 && !r.more, `a long-time player sees all ${r.bonus.length} bonus games, no New! flood, no teaser`);
  await load(SAVE({ settings: { rate: .9, sound: false, unlockAll: true } }));
  r = await info(); ok(r.bonus.length >= 8, 'Grown-ups "open every realm" opens every bonus game');
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2));
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
