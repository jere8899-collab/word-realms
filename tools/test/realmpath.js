// 🧭 R14 (REVIEW-2026-11-01) + 🚪 N7 (REVIEW-2026-11-02): the realm screen shows "Today's path" (4 skills + boss) first, then
// 3 bonus DOORS (🎤 Say it, ✍️ Write it, 🎲 Play): at most 4 skills + 3 doors + the boss, however many games exist. Games still
// open one at a time inside the doors; the 4 skills fit the first 375×667 screen; one status line per tile; a "New!" badge on
// the door and the game until first tapped; a game opened from a door comes back to it.   node tools/test/realmpath.js (SHOT=1)
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
    const choices = [...document.querySelectorAll('#main .skill-card, #main #rbossCard')].filter(vis);
    const path = [...document.querySelectorAll('.path-grid .skill-card')];
    const doors = [...document.querySelectorAll('#doorRow [data-door]')].map(d => ({ id: d.dataset.door, locked: d.classList.contains('locked'), isNew: !!d.querySelector('.new-tag') }));
    const status = [...document.querySelectorAll('#main .skill-card')].map(c => c.querySelectorAll(':scope > .crowns, :scope > .waiting-tag').length);
    const pathH = document.querySelector('.path-grid').getBoundingClientRect(), sec = [...document.querySelectorAll('.realm-sec')].map(h => h.textContent.trim());
    const nav = document.querySelector('.navbar'), navTop = nav && getComputedStyle(nav).display !== 'none' ? nav.getBoundingClientRect().top : innerHeight;
    const W = document.documentElement.clientWidth, cut = [...document.querySelectorAll('#doorRow [data-door]')].some(d => d.getBoundingClientRect().right > W + .5);
    // every open game, door by door (the realm screen is drawn again afterwards)
    const games = {}, news = {}; for (const d of doors) { WR.go('door', { rid: 'a1', door: d.id }); games[d.id] = [...document.querySelectorAll('#bonusRow .skill-card')].map(c => c.querySelector('h3').textContent.trim()); news[d.id] = document.querySelectorAll('#bonusRow .new-tag').length; }
    WR.go('realm', 'a1');
    return { choices: choices.length, path: path.map(c => c.dataset.k), doors, games, bonus: Object.values(games).flat(), news, status, pathBottom: pathH.bottom, navTop, sec, cut,
      bossAfterPath: !!(document.querySelector('#rbossCard') && document.querySelector('.path-grid').compareDocumentPosition(document.querySelector('#rbossCard')) & 4) };
  });
  // brand-new A1 player
  await load(SAVE());
  let r = await info();
  ok(r.sec[0].includes("Today's path") && r.sec[1].includes('Bonus games'), `sections: ${r.sec.join(' / ')}`);
  ok(r.path.join() === 'grammar,vocab,reading,listening', `Today's path holds the 4 skills (${r.path})`);
  ok(!!r.bossAfterPath, 'the boss card follows the path');
  ok(r.doors.map(d => d.id).join() === 'say,write,play', `3 bonus doors: ${r.doors.map(d => d.id)}`);
  ok(r.choices <= 8, `a new A1 player sees ${r.choices} choices (≤ 4 skills + 3 doors + boss)`);
  ok(r.doors.find(d => d.id === 'play').locked === false && r.doors.filter(d => d.locked).length === 2 && r.bonus.length === 1, `only the Play door is open, with 1 game (${r.bonus})`);
  ok(r.pathBottom <= r.navTop, `the 4 skills fit the first 375×667 screen (bottom ${Math.round(r.pathBottom)} ≤ ${Math.round(r.navTop)})`);
  ok(r.status.every(n => n === 1), `one status line per tile (${r.status})`);
  await page.click('[data-door="write"]'); await page.waitForTimeout(200);
  ok(await page.evaluate(() => WR.current() === 'realm'), 'a locked door stays shut (a friendly toast instead)');
  if (process.env.SHOT) { await page.screenshot({ path: OUT + 'realmpath_01_new_player.png' }); await page.evaluate(() => document.getElementById('bonusHead').scrollIntoView()); await page.waitForTimeout(300); await page.screenshot({ path: OUT + 'realmpath_02_doors.png' }); }
  // after one lesson: Story opens inside Play, with a New! badge on the door and on the game
  await load(SAVE({ bonusSeen: ['sp'], lessonsDone: 1, progress: { a1: { grammar: { best: .8, plays: 1 } } } }));
  r = await info();
  ok(r.games.play.includes('Story') && r.news.play === 1 && r.doors.find(d => d.id === 'play').isNew, `after 1 lesson Story opens in the Play door, New! on the door and the game (${r.games.play})`);
  ok(r.status.every(n => n === 1), 'still one status line per tile once played');
  await page.click('[data-door="play"]'); await page.waitForSelector('#bonusRow [data-story]');
  if (process.env.SHOT) await page.screenshot({ path: OUT + 'realmpath_03_play_door.png' });
  await page.click('#bonusRow [data-story]'); await page.waitForTimeout(500);
  ok(await page.evaluate(() => WR.state.bonusSeen.includes('story')), 'tapping the game clears its badge (saved in the save)');
  await page.evaluate(() => { WR.stopStory && WR.stopStory(); WR.toRealm('a1'); }); await page.waitForTimeout(300);
  ok(await page.evaluate(() => WR.current() === 'door'), 'the back of a game opened from a door goes back to the door');
  await page.click('#doorBack'); await page.waitForSelector('#doorRow');
  r = await info(); ok(!r.doors.some(d => d.isNew), 'no badge after the first tap');
  // later doors open one by one: Say it after 2 lessons, Write it after 5; long-time players see everything with no flood
  await load(SAVE({ lessonsDone: 2 }));
  r = await info(); ok(!r.doors.find(d => d.id === 'say').locked && r.doors.find(d => d.id === 'write').locked && r.games.say.join() === 'Speaking', `2 lessons: Say it opens (Speaking), Write it still shut (${JSON.stringify(r.games)})`);
  await load(SAVE({ lessonsDone: 3 }));
  r = await info(); ok(r.bonus.includes('Word Charms') && !r.bonus.includes('Writing'), `3 lessons: Word Charms open, Writing not yet (${r.bonus})`);
  await load(SAVE({ lessonsDone: 6 }));
  r = await info(); ok(r.games.write.length === 2 && r.games.write[0] === 'Writing', `6 lessons: Write it has Writing + 1 more, the rest wait (${r.games.write})`);
  await load(SAVE({ lessonsDone: 40 }));
  r = await info(); ok(r.bonus.length >= 10 && !r.doors.some(d => d.isNew) && Object.values(r.news).every(n => n === 0), `a long-time player sees all ${r.bonus.length} bonus games, no New! flood`);
  ok(r.choices <= 8, `still at most 4 skills + 3 doors + boss on the realm screen (${r.choices})`);
  ok(JSON.stringify(r.games) === JSON.stringify({ say: ['Speaking', 'Phonics'], write: ['Writing', 'Spell Swap', 'Word Forge', 'Word Bridges', 'Punctuation Pixies'], play: [r.games.play[0], 'Story', 'Word Charms'] }), 'the doors hold the right games ' + JSON.stringify(r.games));
  await load(SAVE({ settings: { rate: .9, sound: false, unlockAll: true } }));
  r = await info(); ok(r.bonus.length >= 10, 'Grown-ups "open every realm" opens every bonus game');
  for (const w of [320, 375]) { await page.setViewportSize({ width: w, height: 667 }); await page.evaluate(() => WR.go('realm', 'a1')); await page.waitForTimeout(300);
    r = await info(); ok(!r.cut, `${w}px: the 3 doors fit side by side`);
    await page.evaluate(() => document.getElementById('bonusHead').scrollIntoView()); await page.waitForTimeout(200); await page.screenshot({ path: `${OUT}n7_doors_${w}.png` }); }
  await page.setViewportSize({ width: 375, height: 667 });
  // the B2 realm (no Phonics): Say it holds Speaking only; other realms work too
  await page.evaluate(() => WR.go('door', { rid: 'b2', door: 'say' })); ok(await page.evaluate(() => document.querySelectorAll('#bonusRow .skill-card').length === 1 && !!document.querySelector('[data-speak]')), 'B2 Say it: Speaking only');
  ok(await page.evaluate(() => WR.openBonus('c1', 'swap') && WR.current() === 'swap'), 'WR.openBonus opens a game through its door');
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2));
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
