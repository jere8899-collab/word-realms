// 🪟 R5 (REVIEW-2026-11-01): two open tabs never overwrite each other's progress. Tab B (opened first) changes a setting
// after tab A earned 40 stars; A reloads and still has them (the review's twoTabs probe). Also: B shows a soft banner, a
// lesson running in B keeps its progress and adds to A's, and a reset in one tab sends the other to onboarding.
//   node tools/test/twotabs.js
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = { v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'a1', stars: 10, totalCorrect: 1, totalAnswered: 1,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 20, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 1, last: today() }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: false }, mistakes: [], lessonsDone: 1 };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
  const errs = [];
  const B = await ctx.newPage(); B.on('pageerror', e => errs.push(e.message));
  await B.goto(BASE + 'index.html'); await B.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), SAVE);
  await B.reload(); await B.waitForSelector('.realm-node');
  const A = await ctx.newPage(); A.on('pageerror', e => errs.push(e.message));
  await A.goto(BASE + 'index.html'); await A.waitForSelector('.realm-node');
  const s0 = await A.evaluate(() => WR.state.stars);
  // A earns 40 stars (as a quest/gift would), B then changes a setting through the UI
  await A.evaluate(() => { WR.state.stars += 40; WR.save(); WR.renderTop(); });
  await B.waitForTimeout(300);
  ok(await B.evaluate(() => !!document.querySelector('.toast') && /another window/.test(document.querySelector('.toast').textContent)), 'tab B shows "updated in another window"');
  ok(await B.evaluate(() => +document.getElementById('starChip').textContent.replace(/\D/g, '')) === s0 + 40, 'tab B\'s star chip shows the new stars');
  await B.click('#setBtn'); await B.waitForSelector('#snd'); await B.click('#snd'); await B.waitForTimeout(200);
  await A.reload(); await A.waitForSelector('.realm-node');
  const a = await A.evaluate(() => ({ s: WR.state.stars, snd: WR.state.settings.sound }));
  ok(a.s === s0 + 40, `twoTabs: 0 stars lost (${s0} → ${a.s}, expected ${s0 + 40})`);
  ok(a.snd === true, 'and tab B\'s setting change is kept too');
  // a lesson running in B: its stars add to what A earned meanwhile
  await B.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove()));
  await B.evaluate(async () => { const b = await WR.bank('a1', 'grammar'); const items = b.filter(q => !q.type || q.type === 'mcq').slice(0, 3).map(q => WR.normalize(q)); WR.startLesson({ realm: 'a1', skill: 'grammar', key: 'grammar', title: 'G', items }); });
  await B.waitForSelector('.opt');
  await B.evaluate(() => { const c = WR._dbg(); [...document.querySelectorAll('.opt')].find(b => b.textContent.replace((b.querySelector('.k') || {}).textContent || '', '').trim() === c).click(); });
  const mid = await B.evaluate(() => WR.state.stars);
  await A.evaluate(() => { WR.state.stars += 25; WR.save(); }); await B.waitForTimeout(200);
  ok(await B.$('#nextBtn') !== null, 'the lesson in tab B is not interrupted');
  await B.click('#nextBtn'); await B.waitForSelector('.opt');
  await B.evaluate(() => { const c = WR._dbg(); [...document.querySelectorAll('.opt')].find(b => b.textContent.replace((b.querySelector('.k') || {}).textContent || '', '').trim() === c).click(); });
  const end = await B.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).stars);
  ok(end > mid + 25 - 1 && end >= mid + 26, `B's next right answer adds to A's 25 stars (${mid} → ${end})`);
  // a reset in A sends B to onboarding instead of B writing the old adventure back
  await A.evaluate(() => { WR.reset(); }); await B.waitForTimeout(300);
  ok(await B.evaluate(() => !WR.state.pet && !!document.querySelector('#nm')), 'a reset in one tab sends the other to onboarding');
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2));
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
