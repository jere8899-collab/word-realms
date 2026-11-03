// 🕰️ N1 (REVIEW-2026-11-02): with a server date (the Date header of a HEAD request), the phone clock can't farm rewards
// and a save stuck in the future comes back down. Offline, the game day moves at most one day per session.
// The server date is faked by answering the HEAD request ourselves (srvShift). node tools/test/n1clock.js
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
let fails = 0, passes = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const DAY = 864e5, TZ = 'Asia/Singapore';
const key = t => new Date(t).toLocaleDateString('en-CA', { timeZone: TZ });
const SAVE = { v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'a1', stars: 40, pet: { species: 'pet_bunny', name: 'Puffbun', xp: 30, happiness: 70, hunger: 30, lastTick: Date.now() },
  streak: { count: 3, last: key(Date.now() - DAY) }, progress: {}, owned: [], equipped: {}, settings: { rate: 1, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 12, bonusSeen: ['sp'] };
let srvShift = 0, online = true, heads = 0;
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const mk = async save => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, timezoneId: TZ });
    await ctx.route(/supabase|jsdelivr|unpkg/, r => r.abort());
    await ctx.route('**/index.html', r => { if (r.request().method() !== 'HEAD') return r.continue(); heads++;
      return online ? r.fulfill({ status: 200, headers: { Date: new Date(Date.now() + srvShift).toUTCString(), 'Content-Type': 'text/html' }, body: '' }) : r.abort(); });
    await ctx.addInitScript(s => { window.__WR_TEST = { holdMs: 0, pinOffer: false }; window.__WR_NO_SW = true;
      const real = Date.now.bind(Date); window.__shift = +(sessionStorage.getItem('shift') || 0); Date.now = () => real() + window.__shift;
      window.setShift = ms => { window.__shift = ms; sessionStorage.setItem('shift', ms); };
      if (!localStorage.getItem('wordRealms.save.v1')) localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, save);
    const page = await ctx.newPage(); page.errs = []; page.on('pageerror', e => page.errs.push(String(e)));
    await page.goto(BASE); await page.waitForSelector('.realm-node'); return page;
  };
  const snap = p => p.evaluate(() => ({ day: WR.today(), srv: WR.serverDay(), gift: WR.Rewards.chest().ready, q: (WR.ensureDaily(), JSON.stringify(WR.state.daily)), earn: WR.earn().practice, eday: WR.state.earn.day, stars: WR.state.stars, streak: WR.state.streak.count }));
  const shiftReload = async (p, ms) => { await p.evaluate(d => { setShift(d); WR.save(); }, ms); await p.reload(); await p.waitForSelector('.realm-node'); return snap(p); };
  const today = key(Date.now()), tomorrow = key(Date.now() + DAY);

  // 1️⃣ online: +1/+2/+3 day jumps give no new gift, allowance or quests
  let p = await mk(SAVE);
  let s = await snap(p); ok(s.day === today && s.srv === today && s.gift, `online: game day is the server date ${s.day}, gift ready`);
  await p.evaluate(() => { WR.Rewards.openChest(); WR.awardStars('en', 'n1-a', 3); WR.awardStars('en', 'n1-b', 3); WR.questEvent('correct10', 2); });
  const base = await snap(p); ok(!base.gift && base.earn === 6, 'gift opened and 6 practice stars used');
  for (const n of [1, 2, 3]) {
    s = await shiftReload(p, n * DAY);
    ok(s.day === today, `online, phone +${n} day → game day still ${s.day}`);
    ok(!s.gift && s.earn === base.earn && s.q === base.q && s.stars === base.stars, `online, phone +${n} day → no new gift, no fresh allowance (${s.earn} used), same quests`);
  }
  // a clock change mid-session (no reload) doesn't move the day either
  await p.evaluate(() => setShift(5 * 864e5)); s = await snap(p); ok(s.day === today && !s.gift, 'online, phone +5 days without a reload → still the same day');
  // phone +30 and back: nothing sticks
  s = await shiftReload(p, 30 * DAY); ok(s.day === today, 'online, phone +30 → same day');
  s = await shiftReload(p, 0); ok(s.day === today && !s.gift && s.q === base.q, 'online, put back → same day, nothing new');
  // the real next day (server date moves) is a normal new day
  srvShift = DAY; s = await shiftReload(p, DAY);
  ok(s.day === tomorrow && s.gift && s.q !== base.q && s.earn === 0, `server's next day → new day ${s.day}: gift, new quests, fresh allowance`);
  ok(!p.errs.length, 'no page errors ' + p.errs.join(' | '));
  await p.context().close(); srvShift = 0;

  // 2️⃣ a save already stuck 30 days in the future (from the old R22 rule) is repaired online, keeping stars and progress
  const fut = key(Date.now() + 30 * DAY);
  const stuck = { ...SAVE, stars: 321, lessonsDone: 40, clock: { day: fut, seen: Date.now() + 30 * DAY }, daily: { day: fut, quests: [{ id: 'correct10', progress: 10, claimed: true }, { id: 'lesson2', progress: 0, claimed: false }, { id: 'perfect1', progress: 0, claimed: false }] },
    earn: { day: fut, practice: 150, rounds: {}, got: {} }, streak: { count: 9, last: fut }, rewards: { got: [], chest: { last: fut, n: 4 }, caughtUp: true } };
  p = await mk(stuck);
  s = await snap(p);
  ok(s.day === today, `stuck save (game day ${fut}) → back to the server date ${s.day}`);
  const ld = await p.evaluate(() => WR.state.lessonsDone); ok(s.stars >= 321 && ld === 40, `stars (${s.stars}, saved 321) and progress (${ld} lessons) kept`);
  ok(!s.gift && s.earn === 150 && JSON.parse(s.q).day === today && JSON.parse(s.q).quests[0].claimed, "the future day's gift, quests and allowance count as today's (no double)");
  ok(s.streak === 9 && await p.evaluate(() => WR.streakAlive()) === 9, 'streak kept');
  const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).clock.day); ok(saved === today, 'the repaired day is saved');
  srvShift = DAY; s = await shiftReload(p, 0);
  ok(s.day === tomorrow && s.gift && JSON.parse(s.q).day === tomorrow && !JSON.parse(s.q).quests.some(q => q.claimed) && s.earn === 0, 'after the repair, the next real day gives new quests, gift and allowance as normal');
  ok(await p.evaluate(() => WR.streakAlive()) === 9, 'streak still alive on the next day');
  // cloud merge never takes a day later than the server date
  const m = await p.evaluate(([a, b]) => WR.mergeClock({ day: a, seen: 1 }, { day: b, seen: 2 }), [tomorrow, fut]);
  ok(m.day === tomorrow && m.seen === 2, `cloud merge: later day ${fut} capped at the server date (${m.day})`);
  const m2 = await p.evaluate(([a, b]) => WR.mergeClock({ day: a }, { day: b }).day, [today, tomorrow]); ok(m2 === tomorrow, 'cloud merge: a later day up to the server date still wins');
  ok(!p.errs.length, 'no page errors ' + p.errs.join(' | '));
  await p.context().close(); srvShift = 0;

  // 3️⃣ offline: two jumps in one session give at most one new day; online again lines up with the server
  online = false; heads = 0;
  p = await mk(SAVE);
  s = await snap(p); ok(s.day === today && s.srv === null, 'offline: the device date (no server date)');
  await p.evaluate(() => WR.Rewards.openChest());
  await p.evaluate(() => setShift(864e5)); s = await snap(p); ok(s.day === tomorrow && s.gift, 'offline, jump 1 (+1 day) → one new day');
  await p.evaluate(() => WR.Rewards.openChest());
  await p.evaluate(() => setShift(3 * 864e5)); s = await snap(p); ok(s.day === tomorrow && !s.gift, 'offline, jump 2 (+3 days) in the same session → no second new day');
  await p.evaluate(() => setShift(30 * 864e5)); s = await snap(p); ok(s.day === tomorrow, 'offline, jump 3 (+30 days) → still at most one new day');
  online = true; s = await shiftReload(p, 30 * DAY);
  ok(s.day === today && s.srv === today, `back online (phone still +30) → lined up with the server date ${s.day}`);
  ok(!s.gift, "the gift opened on the offline day counts as today's");
  // and the 'online' event re-reads the server date mid-session
  ok(heads > 0, 'the HEAD request for the server date was made');
  ok(!p.errs.length, 'no page errors ' + p.errs.join(' | '));
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
