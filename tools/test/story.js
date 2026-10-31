// 📜 Storybook Chapters test: migration, realm tile, reading view (names filled, glossary, read-aloud highlight),
// questions + feedback, garden planting, rewards paid once, crowns, quest, storybook modal, C2 chapter, mobile, no console errors.
const { chromium } = require('playwright-core');
const OUT = '/workspace/cefr-quest/screenshots/';
const URL = 'http://127.0.0.1:18642/index.html';
const assert = (c, m) => { if (!c) throw new Error('ASSERT ' + m); console.log('ok -', m); };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = JSON.stringify({ v: 1, name: 'Jeremy', avatar: 'avatar_mage', startLevel: 'a1', stars: 40, totalCorrect: 30, totalAnswered: 40,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 100, happiness: 82, hunger: 35, skin: null, lastTick: Date.now() },
  streak: { count: 3, last: today() }, progress: {}, daily: { day: today(), quests: [{ id: 'story1', progress: 0, claimed: false }, { id: 'correct10', progress: 0, claimed: false }, { id: 'feed1', progress: 0, claimed: false }] },
  owned: [], equipped: { outfit: null, petskin: null, theme: null }, settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 2 });
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const errors = [];
  async function open(viewport) {
    const ctx = await browser.newContext({ viewport });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr|supabase/, r => r.abort());
    await ctx.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('wordRealms.save.v1', s); sessionStorage.setItem('seeded', '1'); } }, SAVE);
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_FAILED/.test(m.text())) errors.push('console: ' + m.text()); });
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.WR && WR.realms && document.querySelector('.topbar'), null, { timeout: 20000 }); await page.waitForTimeout(300);
    return page;
  }
  const clean = async p => { await p.evaluate(() => document.querySelectorAll('.confetti,.toast').forEach(e => e.remove())); await p.waitForTimeout(250); };
  const answer = async (p, right) => {
    const target = await p.evaluate(async right => {
      const lv = document.querySelector('.story-head .lvl-badge').textContent.toLowerCase(), ch = await WR.loadStory(lv);
      const pg = [...document.querySelectorAll('.sdot')].findIndex(d => d.classList.contains('on'));
      const q = pg < 4 ? ch.pages[pg].q : ch.final, ok = WR.Story.fill(q.options[q.answer]);
      const btns = [...document.querySelectorAll('.opt')]; return btns.findIndex(b => (b.textContent.slice(1) === ok) === right);
    }, right);
    await p.locator('.opt').nth(target).click(); await p.waitForTimeout(150);
  };
  const page = await open({ width: 1200, height: 860 });
  const st0 = await page.evaluate(() => WR.state.stories);
  assert(st0 && typeof st0.done === 'object' && typeof st0.words === 'object', 'old save gains an empty stories block');
  assert((await page.$eval('#bookPill', e => WR.iconText(e))).trim() === '📜 Storybook 0/6 pages', 'map shows the Storybook pill (0/6)');
  await page.evaluate(() => WR.go('realm', 'a1')); await page.waitForTimeout(400);
  assert(await page.locator('.story-tile').count() === 1, 'realm screen has a Story tile');
  await clean(page); await page.screenshot({ path: OUT + 'story_01_tile.png' });
  await page.locator('.story-tile').click(); await page.waitForSelector('.story-text');
  const txt = await page.locator('#storyText').innerText();
  assert(txt.includes('Jeremy') && txt.includes('Puffbun') && !/\[\[|\{hero\}|\{pet\}/.test(txt), 'page text uses the hero and pet names, no raw markup');
  assert(await page.locator('.gloss').count() >= 1 && await page.locator('.sent').count() >= 3, 'sentences and glossary words are tappable');
  await page.locator('.gloss').first().click(); await page.waitForSelector('.gloss-pop');
  assert(await page.evaluate(() => WR.state.stories.words.meadow === 'a1'), 'tapping “meadow” shows its meaning and saves it to the word list');
  await page.locator('#readAll').click(); await page.waitForTimeout(200);
  assert(await page.evaluate(() => WR.state.stories.reads) === 1, 'Read to me counts a read-aloud');
  await page.evaluate(() => { const s = document.querySelector('.sent'); s.classList.add('reading'); });
  await clean(page); await page.screenshot({ path: OUT + 'story_02_page.png', fullPage: true });
  const stars0 = await page.evaluate(() => WR.state.stars);
  for (let i = 0; i < 4; i++) { await answer(page, true); if (i === 0) { assert(await page.locator('.story-fb.good').count() === 1, 'right answer gives green feedback'); await clean(page); await page.screenshot({ path: OUT + 'story_03_feedback.png', fullPage: true }); } await page.locator('#storyNext').click(); await page.waitForTimeout(150); }
  assert(await page.locator('#storyText').count() === 0, 'final word-check page');
  await answer(page, false);
  assert(await page.locator('.story-fb.bad').count() === 1 && await page.locator('.opt.right').count() === 1, 'wrong answer shows the right one and an explanation');
  const g = await page.evaluate(() => WR.state.mistakes.filter(m => m.skill === 'story'));
  assert(g.length === 1 && g[0].options.length === 4 && g[0].correct && !/\{/.test(g[0].q), 'the miss is planted in the Mistake Garden');
  await page.locator('#storyNext').click(); await page.waitForSelector('.story-done');
  const s1 = await page.evaluate(() => ({ stars: WR.state.stars, done: WR.state.stories.done.a1, q: WR.state.daily.quests.find(q => q.id === 'story1') }));
  assert(s1.done && s1.done.crowns === 2 && s1.stars - stars0 === 4 + 3 + 4, 'first read: 4/5 → 2 crowns, +11⭐ (4 answers + 3 restore + 2×2 crowns)');
  assert(s1.q.progress === 1, 'daily quest “Read a Storybook chapter” progresses');
  await clean(page); await page.screenshot({ path: OUT + 'story_04_done.png', fullPage: true });
  // replay with 5/5: only the extra crown pays
  await page.locator('#again').click(); await page.waitForSelector('.story-text');
  for (let i = 0; i < 5; i++) { await answer(page, true); await page.locator('#storyNext').click(); await page.waitForTimeout(120); }
  await page.waitForSelector('.story-done');
  const s2 = await page.evaluate(() => ({ stars: WR.state.stars, done: WR.state.stories.done.a1 }));
  assert(s2.done.crowns === 3 && s2.done.plays === 2 && s2.stars - s1.stars === 2, 'replay: 3 crowns, only the new crown pays (+2⭐)');
  // C2 chapter
  await page.evaluate(() => WR.go('story', 'c2')); await page.waitForSelector('.story-text');
  const c2 = await page.locator('#storyText').innerText();
  assert(c2.includes('Starlight Library') && /resurface/.test(c2), 'C2 chapter loads');
  await page.evaluate(() => WR.go('home')); await page.waitForTimeout(300);
  assert((await page.$eval('#bookPill', e => WR.iconText(e))).trim() === '📜 Storybook 1/6 pages', 'pill updates to 1/6');
  await page.locator('#bookPill').click(); await page.waitForSelector('.book-list');
  assert(await page.locator('.book-row').count() === 6, 'Storybook modal lists 6 chapters');
  await clean(page); await page.screenshot({ path: OUT + 'story_05_book.png' });
  await page.locator('.book-row').nth(3).click(); await page.waitForSelector('.story-text');
  assert((await page.locator('.story-head').innerText()).includes('Chapter 4'), 'modal opens the chosen chapter');
  // reload keeps progress
  await page.reload(); await page.waitForFunction(() => window.WR && WR.realms && document.querySelector('.topbar'));
  assert(await page.evaluate(() => WR.state.stories.done.a1.crowns) === 3, 'progress survives reload (inside wordRealms.save.v1)');
  // mobile
  const m = await open({ width: 390, height: 844 });
  await m.evaluate(() => WR.go('story', 'b2')); await m.waitForSelector('.story-text');
  assert(await m.evaluate(() => document.documentElement.scrollWidth <= 392), 'mobile 390px: no horizontal overflow');
  await clean(m); await m.screenshot({ path: OUT + 'story_06_mobile.png', fullPage: true });
  assert(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close(); console.log('ALL STORY TESTS PASSED');
})().catch(e => { console.error(e); process.exit(1); });
