// 🌷 Mistake Garden thirst: the clock starts when a plant is ready, 24h then each further day,
// floor at 0, pauses, no double charge, and old saves are not back-charged.
//   node tools/test/garden-thirst.js
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/opt/cursor/artifacts/';
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const DAY = 864e5, HOUR = 36e5;
const SAVE = { v: 1, name: 'Mei', avatar: 'avatar_girl', startLevel: 'a1', stars: 10, lessonsDone: 4,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 20, happiness: 80, hunger: 20, lastTick: Date.now() },
  owned: ['hat_star'], progress: {}, settings: { rate: 0.9, sound: false, unlockAll: true, health: { limit: 0, bed: '', until: 0 } },
  rewards: { got: ['r_streak3'], chest: { last: '2026-11-10', n: 1 }, caughtUp: true },
  streak: { count: 1, last: '2026-11-10' }, mistakes: [], garden: { bloomed: 0, rounds: 0 } };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, timezoneId: 'Asia/Singapore' });
  await ctx.addInitScript(() => { window.__WR_NO_SW = true; window.__WR_TEST = { holdMs: 0, pinOffer: false }; });
  await ctx.addInitScript(s => { if (!localStorage.getItem('wordRealms.save.v1')) localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE);
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('.realm-node', { timeout: 30000 });

  const logic = await page.evaluate(async ({ DAY, HOUR }) => {
    const G = WR.Garden, out = {};
    const noon = new Date(2026, 10, 10, 12, 0, 0, 0).getTime();
    const midnight = new Date(2026, 10, 10, 0, 0, 0, 0).getTime();
    const plant = (id, due, extra) => Object.assign({ id, due, at: due - 5 * DAY, q: id, type: 'mcq', options: ['a'], correct: 'a', explain: 'x', realm: 'a1', skill: 'vocab', box: 0, bloomed: false, t: due - DAY, n: 1 }, extra);
    const set = (o) => { WR.state.stars = 10; WR.state.owned = ['hat_star']; WR.state.settings.health = { limit: 0, bed: '', until: 0 }; WR.state.streak.rest = null; WR.state.garden = { bloomed: 0, rounds: 0, thirstAt: noon - 10 * DAY, thirst: { taken: 0, weekKey: '', weekN: 0 }, stops: [] }; WR.state.mistakes = o.mistakes; if (o.health) Object.assign(WR.state.settings.health, o.health); if (o.rest) WR.state.streak.rest = o.rest; if (o.stops) WR.state.garden.stops = o.stops; if (o.stars != null) WR.state.stars = o.stars; if (o.epoch != null) WR.state.garden.thirstAt = o.epoch; WR.save(); };
    const charge = (now) => { const r = G.settle(now); return { take: r.take, stars: WR.state.stars, owned: WR.state.owned.slice(), paid: (WR.state.mistakes[0] && WR.state.mistakes[0].thirst && WR.state.mistakes[0].thirst.paid) || 0 }; };

    set({ mistakes: [plant('due', noon - 2 * DAY), plant('wait', noon + DAY)] });
    out.due = charge(noon);
    out.notDuePaid = !WR.state.mistakes.find(m => m.id === 'wait').thirst;

    set({ mistakes: [plant('edge', noon - DAY + 1)] });
    out.under = charge(noon).take;
    set({ mistakes: [plant('edge', noon - DAY)] });
    out.exact = charge(noon);

    set({ mistakes: [plant('long', noon - 3 * DAY)] });
    out.three = charge(noon);

    set({ stars: 1, mistakes: [plant('floor', noon - 3 * DAY)] });
    const floor1 = charge(noon);
    WR.state.stars = 4;
    const floor2 = G.settle(noon);
    out.floor = { stars1: floor1.stars, paid1: floor1.paid, owned: floor1.owned.join(','), stars2: WR.state.stars, paid2: WR.state.mistakes[0].thirst.paid, take2: floor2.take };

    set({ mistakes: [plant('old', noon - 10 * DAY)], epoch: null });
    delete WR.state.garden.thirstAt;
    out.migrate = charge(noon);

    set({ mistakes: [plant('tip', noon - 5 * DAY, { legacy: true })] });
    out.legacy = charge(noon).take;

    set({ mistakes: [plant('rest', midnight)], rest: '2026-11-10' });
    out.rest = charge(midnight + 2 * DAY);
    set({ mistakes: [plant('norest', midnight)] });
    out.norest = charge(midnight + 2 * DAY).take;

    set({ mistakes: [plant('bed', noon)], health: { bed: '20:00', limit: 0, until: 0 } });
    out.bed1 = charge(noon + DAY);
    set({ mistakes: [plant('bed2', noon)], health: { bed: '20:00', limit: 0, until: 0 } });
    out.bed2 = charge(noon + 2 * DAY);
    const bedAt = new Date(2026, 10, 10, 20, 0, 0, 0).getTime();
    set({ mistakes: [plant('extra', noon)], health: { bed: '20:00', limit: 0, until: bedAt + 15 * 60000 } });
    const withExtra = G.pausedMs(noon, noon + DAY, WR.state);
    WR.state.settings.health.until = 0;
    const noExtra = G.pausedMs(noon, noon + DAY, WR.state);
    out.extra = noExtra - withExtra;

    set({ mistakes: [plant('lim', noon)], health: { limit: 30, bed: '', until: 0 }, stops: [{ why: 'limit', s: noon, e: noon + 10 * HOUR }] });
    out.limShort = charge(noon + DAY);
    set({ mistakes: [plant('lim2', noon)], health: { limit: 30, bed: '', until: 0 }, stops: [{ why: 'limit', s: noon, e: noon + 10 * HOUR }] });
    out.limLong = charge(noon + 34 * HOUR);
    set({ mistakes: [plant('off', noon)], health: { limit: 0, bed: '', until: 0 }, stops: [{ why: 'limit', s: noon, e: noon + 10 * HOUR }] });
    out.limitOff = charge(noon + DAY).take;

    const today = WR.dayKey();
    WR.state.report = WR.state.report || { days: {}, tally: {} };
    WR.state.report.days[today] = { s: 40 * 60, l: 1, k: {} };
    set({ mistakes: [], health: { limit: 30, bed: '', until: 0 } });
    G.settle(Date.now());
    out.noticed = (WR.state.garden.stops || []).some(s => s.why === 'limit' && s.s);

    set({ mistakes: [plant('soon', Date.now() - 14 * HOUR)] });
    out.soon = G.soon(Date.now());
    set({ mistakes: [plant('notsoon', Date.now() - HOUR)] });
    out.notSoon = G.soon(Date.now());

    set({ mistakes: [plant('w', noon - 2 * DAY)] });
    const beforeWater = charge(noon);
    G.grade('w', true);
    const afterWater = G.settle(Date.now());
    out.water = { before: beforeWater.take, after: afterWater.take, due: WR.state.mistakes.find(m => m.id === 'w').due > Date.now() };

    set({ mistakes: [plant('a', noon - DAY), plant('b', noon - DAY), plant('c', noon - DAY)] });
    const once = charge(noon);
    const twice = G.settle(noon);
    const disk = JSON.parse(JSON.stringify(WR.state));
    set({ mistakes: [plant('a', noon - DAY), plant('b', noon - DAY), plant('c', noon - DAY)], stars: 10 });
    G.merge(WR.state, disk);
    const merged = G.settle(noon);
    out.sync = { once: once.take, twice: twice.take, mergedStars: WR.state.stars, mergedTake: merged.take, diskStars: disk.stars };
    WR.save();

    return out;
  }, { DAY, HOUR });

  ok(logic.due.take === 2 && logic.due.stars === 8 && logic.notDuePaid && logic.due.owned[0] === 'hat_star', `a ready plant costs a star per full day; a plant that is not due does not (${logic.due.take}, not-due cleared ${logic.notDuePaid})`);
  ok(logic.under === 0 && logic.exact.take === 1 && logic.exact.stars === 9, `24h boundary: 1ms under pays 0, exactly 24h pays 1 (${logic.under}, ${logic.exact.take})`);
  ok(logic.three.take === 3 && logic.three.stars === 7, `three full days cost 3 stars (${logic.three.take})`);
  ok(logic.floor.stars1 === 0 && logic.floor.paid1 === 1 && logic.floor.owned === 'hat_star' && logic.floor.stars2 === 2 && logic.floor.take2 === 2, `the balance stops at 0 and the hat stays; the unpaid days are taken later (${JSON.stringify(logic.floor)})`);
  ok(logic.migrate.take === 0 && logic.migrate.stars === 10, 'an old save is not back-charged');
  ok(logic.legacy === 0, 'a tip card is not charged');
  ok(logic.rest.take === 1 && logic.norest === 2, `a streak rest day pauses that day (${logic.rest.take} with rest, ${logic.norest} without)`);
  ok(logic.bed1.take === 0 && logic.bed2.take === 1, `bedtime pauses each night (${logic.bed1.take} after one day, ${logic.bed2.take} after two)`);
  ok(logic.extra === 15 * 60000, `a grown-up's 15 extra minutes are not paused (${logic.extra})`);
  ok(logic.limShort.take === 0 && logic.limLong.take === 1 && logic.limitOff === 1, `a recorded limit stop pauses only while the limit is on (${logic.limShort.take}, ${logic.limLong.take}, off ${logic.limitOff})`);
  ok(logic.noticed, 'crossing the daily limit records a pause');
  ok(logic.soon && logic.soon.n === 1 && logic.soon.hours === 10 && !logic.notSoon, `a plant within 12 hours gives a heads-up (${JSON.stringify(logic.soon)})`);
  ok(logic.water.before === 2 && logic.water.after === 0 && logic.water.due, 'watering stops further charges');
  ok(logic.sync.once === 3 && logic.sync.twice === 0 && logic.sync.mergedStars === logic.sync.diskStars && logic.sync.mergedTake === 0, `reload and a cloud merge do not charge twice (${JSON.stringify(logic.sync)})`);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.realm-node', { timeout: 30000 });
  const kept = await page.evaluate(() => ({ stars: WR.state.stars, taken: WR.state.garden.thirst.taken }));
  ok(kept.stars === logic.sync.diskStars && kept.taken === 3, `a real reload keeps the charge (${kept.stars}, taken ${kept.taken})`);

  await page.evaluate(() => {
    const now = Date.now(), DAY = 864e5;
    WR.state.stars = 10; WR.state.owned = ['hat_star'];
    WR.state.garden = { bloomed: 0, rounds: 0, thirstAt: now - 5 * DAY, thirst: { taken: 0, weekKey: '', weekN: 0 }, stops: [] };
    WR.state.settings.health = { limit: 0, bed: '', until: 0 };
    WR.state.mistakes = [0, 1, 2].map(i => ({ id: 'p' + i, due: now - DAY, at: now - 3 * DAY, q: 'Plant ' + i, type: 'mcq', options: ['a'], correct: 'a', explain: 'x', realm: 'a1', skill: 'vocab', box: 0, bloomed: false, t: now - 2 * DAY, n: 1 }))
      .concat([{ id: 'soon', due: now - 14 * 36e5, at: now - 3 * DAY, q: 'Soon', type: 'mcq', options: ['a'], correct: 'a', explain: 'x', realm: 'a1', skill: 'vocab', box: 0, bloomed: false, t: now - DAY, n: 1 }]);
    WR.save(); WR.Garden.settle(now); WR.save();
  });
  await page.evaluate(() => WR.go('review'));
  await page.waitForSelector('#thirstNote');
  ok(/3 plants got thirsty: -3/.test(await page.innerText('#thirstNote')), 'the garden notice names the plants and the stars');
  ok(/within about 10 hour/.test(await page.innerText('#thirstSoon')), 'the heads-up is on the garden');
  await page.evaluate(sel => new Promise(resolve => {
    const el = document.querySelector(sel);
    let done = false; const finish = () => { if (!done) { done = true; resolve(); } };
    el.addEventListener('animationend', e => { if (e.target === el) finish(); });
    setTimeout(finish, 1000);
  }), '.fade-in');
  const noticeStyle = await page.evaluate(() => { const cs = getComputedStyle(document.querySelector('.fade-in')); return { opacity: cs.opacity, filter: cs.filter }; });
  ok(noticeStyle.opacity === '1' && (noticeStyle.filter === 'none' || noticeStyle.filter === ''), `the garden notice is fully opaque after the fade (${noticeStyle.opacity})`);
  await page.evaluate(() => document.querySelectorAll('.toast').forEach(e => e.remove()));
  await page.screenshot({ path: OUT + 'garden_360_notice.png' });
  await page.setViewportSize({ width: 320, height: 740 });
  const at320 = await page.evaluate(() => {
    const n = document.querySelector('#thirstNote'), r = n.getBoundingClientRect(), cs = getComputedStyle(n);
    return { text: n.innerText.replace(/\s+/g, ' '), opacity: getComputedStyle(document.querySelector('.fade-in')).opacity, size: parseFloat(cs.fontSize), left: r.left, right: r.right, w: innerWidth };
  });
  ok(at320.opacity === '1' && at320.size >= 14 && at320.left >= -1 && at320.right <= at320.w + 1 && /3 plants got thirsty: -3/.test(at320.text) && /water them to stop it/.test(at320.text), `the notice is readable at 320 px (${at320.size}px, ${Math.round(at320.right)}/${at320.w})`);
  await page.setViewportSize({ width: 360, height: 740 });
  await page.evaluate(() => WR.go('report', 'week'));
  if (await page.$('.pgate')) { const a = await page.evaluate(() => WR.parentGate._answer()); for (const d of a) await page.click(`.pgate [data-d="${d}"]`); await page.click('#pgOk'); }
  await page.waitForSelector('#thirstLine', { timeout: 15000 });
  ok((await page.innerText('#thirstN')).trim() === '3', 'the report lists the stars lost this week');
  await page.evaluate(sel => new Promise(resolve => {
    const el = document.querySelector(sel);
    let done = false; const finish = () => { if (!done) { done = true; resolve(); } };
    el.addEventListener('animationend', e => { if (e.target === el) finish(); });
    setTimeout(finish, 1000);
  }), '#report');
  const reportStyle = await page.evaluate(() => { const cs = getComputedStyle(document.querySelector('#report')); return { opacity: cs.opacity, filter: cs.filter }; });
  ok(reportStyle.opacity === '1' && (reportStyle.filter === 'none' || reportStyle.filter === ''), `the report line is fully opaque after the fade (${reportStyle.opacity})`);
  await page.locator('#thirstLine').scrollIntoViewIfNeeded();
  await page.screenshot({ path: OUT + 'garden_360_report.png' });

  const B = await ctx.newPage();
  await B.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await B.waitForSelector('.realm-node', { timeout: 30000 });
  const both = await Promise.all([page.evaluate(() => WR.state.stars), B.evaluate(() => WR.state.stars)]);
  ok(both[0] === 7 && both[1] === 7, `a second tab does not charge the same days again (${both})`);
  ok(!errs.length, 'no page errors ' + errs.slice(0, 2).join(' | '));
  console.log(`\ngarden thirst: ${passes} passed, ${fails} failed`);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
