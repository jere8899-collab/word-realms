// 🕰️ R22 (REVIEW-2026-11-01): the game day never goes backwards. Setting the device date forward gives one new day (gift,
// quests, practice stars); putting it back keeps that day, so the gift, quests and star cap do NOT reset again, the streak isn't
// broken, a reload keeps it, an older save starts at the latest day it already used, and the grown-ups' log uses the real date.
// node tools/test/r22clock.js
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
let fails = 0, passes = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const DAY = 864e5;
const key = t => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = { v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'a1', stars: 40, pet: { species: 'pet_bunny', name: 'Puffbun', xp: 30, happiness: 70, hunger: 30, lastTick: Date.now() },
  streak: { count: 3, last: key(Date.now() - DAY) }, progress: {}, owned: [], equipped: {}, settings: { rate: 1, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 12, bonusSeen: ['sp'] };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true });
  await ctx.route(/supabase|jsdelivr|unpkg/, r => r.abort());
  await ctx.addInitScript(s => { window.__WR_TEST = { holdMs: 0, pinOffer: false }; window.__WR_NO_SW = true;
    const real = Date.now.bind(Date); window.__shift = +(sessionStorage.getItem('shift') || 0); Date.now = () => real() + window.__shift;
    window.setShift = ms => { window.__shift = ms; sessionStorage.setItem('shift', ms); };
    if (!localStorage.getItem('wordRealms.save.v1')) localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE);
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto(BASE); await page.waitForSelector('.realm-node');
  const today = key(Date.now()), tomorrow = key(Date.now() + DAY);
  const snap = () => page.evaluate(() => ({ day: WR.today(), gift: WR.Rewards.chest().ready, quests: WR.ensureDaily() || WR.state.daily.day, earn: WR.state.earn.day, back: WR.clockBack(), streak: WR.state.streak.count, clock: WR.state.clock }));
  let s = await snap(); ok(s.day === today && s.gift && !s.back, `today is the real day with a gift ready (${s.day})`);
  await page.evaluate(() => { WR.Rewards.openChest(); WR.bumpStreak(); WR.awardStars('en', 'r22-a', 1); });
  s = await snap(); ok(!s.gift && s.streak === 4, 'gift opened, streak grew to 4');
  // ⏩ time travel forwards one day: a new day (that's allowed, it can't be told apart from a real day)
  await page.evaluate(d => setShift(d), DAY);
  s = await snap(); ok(s.day === tomorrow && s.gift && s.quests === tomorrow, `date set forward → one new day (${s.day}), gift ready, new quests`);
  await page.evaluate(() => { WR.Rewards.openChest(); WR.bumpStreak(); WR.questEvent('correct10', 3); WR.awardStars('en', 'r22-b', 1); });
  const fwd = await page.evaluate(() => ({ chestN: WR.state.rewards.chest.n, q: JSON.stringify(WR.state.daily), earn: JSON.stringify(WR.state.earn) }));
  // ⏪ and back again: nothing resets
  await page.evaluate(() => setShift(0));
  s = await snap(); ok(s.day === tomorrow && s.back, `date put back → the game day stays ${s.day} (clockBack ${s.back})`);
  ok(!s.gift, 'no second gift after putting the clock back');
  const back = await page.evaluate(() => ({ chestN: WR.state.rewards.chest.n, q: JSON.stringify(WR.state.daily), earn: JSON.stringify(WR.state.earn) }));
  ok(back.q === fwd.q && back.earn === fwd.earn && back.chestN === fwd.chestN, 'quests, practice-star cap and gift count are unchanged');
  ok(s.streak === 5 && await page.evaluate(() => WR.streakAlive()) === 5, 'the streak is not broken by the clock going back');
  ok(s.clock.seen >= Date.now() + DAY - 60000, 'the last-seen time stays at the latest time seen');
  const log = await page.evaluate(([a, b]) => { WR.countAnswer(true, 'a1/grammar'); return { real: !!WR.state.report.days[a], game: !!WR.state.report.days[b] }; }, [today, tomorrow]);
  ok(log.real && !log.game, "the grown-ups' log uses the real date, not the game day " + JSON.stringify(log));
  // 🔄 reload with the real date: still the borrowed day
  await page.evaluate(() => WR.save()); await page.reload(); await page.waitForSelector('.realm-node');
  s = await snap(); ok(s.day === tomorrow && !s.gift, `after a reload the game day is still ${s.day} with no new gift`);
  // 📅 the real next day arrives: that is the same day, so still nothing new; the day after is new again
  await page.evaluate(d => setShift(d), DAY + 3600e3); s = await snap(); ok(s.day === tomorrow && !s.gift, 'when the real date reaches the borrowed day, it is not new again');
  await page.evaluate(d => setShift(d), 2 * DAY); s = await snap(); ok(s.day === key(Date.now() + 2 * DAY) && s.gift, 'the day after is a normal new day');
  await page.evaluate(() => setShift(0));
  // 🗄️ an older save (no clock) that already used a later day starts there
  const p2 = await ctx.newPage(); await p2.goto(BASE); await p2.waitForSelector('.realm-node');
  const old = await p2.evaluate(([t]) => { const s = JSON.parse(localStorage.getItem('wordRealms.save.v1')); delete s.clock; s.daily = { day: t, quests: [] }; s.rewards.chest.last = t; localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); return true; }, [tomorrow]);
  await p2.reload(); await p2.waitForSelector('.realm-node');
  const m = await p2.evaluate(() => ({ day: WR.today(), gift: WR.Rewards.chest().ready }));
  ok(old && m.day === tomorrow && !m.gift, `older save without a clock starts at the latest day it used (${m.day})`);
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
