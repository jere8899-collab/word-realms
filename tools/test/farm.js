// ⭐ Anti-farm economy (WR.awardStars): replaying the same lesson over and over must not mint unlimited stars,
// while XP / pet / progress keep flowing. Plays the SAME English lesson (same 8 questions) 6× through the real UI, then
// checks the daily practice cap, fresh one-offs, bonus stars outside the cap, the day reset, old-save migration and
// that a cloud save can't roll the counters back.  SHOT=1 → screenshots/farm_note.png (the gentle message).
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else console.log('ok', m); };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const save = extra => Object.assign({ v: 1, name: 'Jeremy', avatar: 'avatar_girl', startLevel: 'a1', stars: 100, totalCorrect: 0, totalAnswered: 0,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 0, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 1, last: today() }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 0 }, extra || {});
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(BASE + 'index.html');
  await page.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, save());
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForSelector('.realm-node');
  // log every award by kind
  await page.evaluate(async () => {
    window.__log = []; const f = WR.awardStars;
    WR.awardStars = (src, key, n, o = {}) => { const g = f(src, key, n, o); window.__log.push({ kind: o.kind || 'item', src, want: n, g }); return g; };
    const all = await WR.buildItems('a1', 'vocab', 24); window.__items = all.filter(it => it.options && it.options.length).slice(0, 8);
  });
  const play = async () => {
    await page.evaluate(() => { window.__log = []; WR.startLesson({ realm: 'a1', skill: 'vocab', key: 'vocab', items: window.__items }); });
    for (let i = 0; i < 12; i++) {
      await page.waitForSelector('.opt:not([disabled]), .result', { timeout: 8000 });
      if (await page.$('.result')) break;
      await page.evaluate(() => { const n = +document.querySelector('.qnum').textContent.split('/')[0] - 1, it = window.__items[n];
        const b = [...document.querySelectorAll('.opt')].find(b => it.options[+b.dataset.k] === it.correct); b.click(); });
      await page.waitForSelector('#nextBtn'); await page.click('#nextBtn');
      const ev = await page.$('.modal .btn, .evo-modal .btn'); if (ev && await page.$('.result') && false) await ev.click();
    }
    await page.waitForSelector('.result', { timeout: 8000 }); await page.waitForTimeout(200);
    return page.evaluate(() => ({ stars: WR.state.stars, xp: WR.state.pet.xp, correct: WR.state.totalCorrect,
      practice: window.__log.filter(x => x.kind === 'item' || x.kind === 'round').reduce((a, x) => a + x.g, 0),
      note: (document.querySelector('.star-note') || {}).textContent || '' }));
  };
  const rounds = [];
  for (let r = 0; r < 6; r++) { rounds.push(await play()); if (r === 1 && process.env.SHOT) await page.screenshot({ path: OUT + 'farm_note.png' }); if (r < 5) await page.evaluate(() => WR.go('home')); }
  const P = rounds.map(r => r.practice);
  console.log('practice stars per replay of the same lesson:', P.join(', '));
  ok(P[0] >= 8 + 6, `first play pays full: 1⭐ per new question + combo + crown bonus (${P[0]})`);
  ok(P[1] > 0 && P[1] < P[0] / 2, `1st replay: questions already mastered pay 0, crown bonus halved (${P[1]})`);
  ok(P[2] >= 1 && P[2] <= P[1], `2nd replay: a small token (${P[2]})`);
  ok(P.slice(3).every(x => x === 0), `3rd+ replay the same day: 0 practice stars (${P.slice(3)})`);
  ok(rounds[5].xp > rounds[2].xp && rounds[5].correct > rounds[2].correct, `XP (${rounds[2].xp}→${rounds[5].xp}) and correct answers (${rounds[5].correct}) still grow`);
  ok(/mastered these|played this one a lot/i.test(rounds[1].note) && /mastered these|played this one a lot/i.test(rounds[4].note), `a gentle note explains it: “${rounds[4].note.trim().slice(0, 70)}…”`);
  ok(!rounds[0].note, 'no note when the full stars were paid');
  ok(await page.$('[data-starnote-go]') !== null, 'the note has a “Find something new” button');
  await page.click('[data-starnote-go]'); await page.waitForSelector('.realm-node'); ok(true, 'it takes the child back to the map for new content');
  // daily cap: endless fresh (generated) maths questions can't pass EARN.cap a day; bonus stars still pay; tomorrow resets
  const cap = await page.evaluate(() => {
    const e = WR.earn(), s0 = WR.state.stars, cap = WR.EARN.cap, used0 = e.practice; let got = 0;
    for (let i = 0; i < 400; i++) got += WR.awardStars('m', 'gen-' + i + '-' + Math.random(), 2, { quiet: true });
    const afterCap = WR.state.stars, more = WR.awardStars('m', 'brand-new', 2, { quiet: true });
    const quest = WR.awardStars('bonus', 'q', 10, { kind: 'bonus', quiet: true }), fresh = WR.awardStars('story', 'a1/3', 4, { kind: 'fresh', quiet: true }), freshAgain = WR.awardStars('story', 'a1/3', 4, { kind: 'fresh', quiet: true });
    const note = WR.starNote();
    WR.state.earn.day = '2000-01-01'; const tomorrow = WR.awardStars('m', 'next-day', 2, { quiet: true });
    return { cap, used0, got, gain: afterCap - s0, more, quest, fresh, freshAgain, note, tomorrow, practice: WR.state.earn.practice };
  });
  ok(cap.used0 + cap.got === cap.cap && cap.gain === cap.got, `daily practice cap: ${cap.cap}⭐ a day (${cap.used0} from lessons + ${cap.got} more, then 0)`);
  ok(cap.more === 0 && /today's practice stars/.test(cap.note), 'over the cap even new questions pay 0 practice stars, with a gentle note');
  ok(cap.quest === 10, 'quests / prizes / milestones stay outside the cap (+10)');
  ok(cap.fresh === 4 && cap.freshAgain === 0, 'fresh one-offs (a new crown, a first story page) pay full, but only once');
  ok(cap.tomorrow === 2 && cap.practice === 2, 'a new local day resets the practice counters');
  // cloud: applying an older cloud save of the same player must not roll the counters back; another player keeps its own
  const cl = await page.evaluate(() => {
    const C = WR.Cloud; WR.state.earn.practice = 150; WR.state.earn.rounds = { 'lesson:a1/vocab': 5 }; WR.save();
    const old = JSON.parse(JSON.stringify(WR.state)); old.earn = { day: WR.today(), practice: 0, rounds: {}, got: {} };
    localStorage.setItem('wordRealms.cloud.v1', JSON.stringify({ user: 'u1' })); C.user = { id: 'u1' };
    WR.restart = WR.restart || (() => {}); C.apply(old, new Date().toISOString());
    const same = { practice: WR.state.earn.practice, round: WR.state.earn.rounds['lesson:a1/vocab'], got: Object.keys(WR.state.earn.got).length };
    localStorage.setItem('wordRealms.cloud.v1', JSON.stringify({ user: 'someone-else' })); C.apply(old, new Date().toISOString());
    const other = WR.state.earn.practice; C.user = null; localStorage.removeItem('wordRealms.cloud.v1');
    const m = WR.mergeEarn({ day: '2026-01-02', practice: 3, rounds: { a: 1 }, got: { x: 1 } }, { day: '2026-01-01', practice: 99, rounds: { a: 9 }, got: { y: 1 } });
    return { same, other, m };
  });
  ok(cl.same.practice === 150 && cl.same.round === 5 && cl.same.got > 0, `same player: an older cloud save keeps today's counters and rewarded items (${JSON.stringify(cl.same)})`);
  ok(cl.other === 0, 'a different account on the same device keeps its own counters');
  ok(cl.m.practice === 3 && cl.m.rounds.a === 1 && cl.m.got.x && cl.m.got.y, 'merge keeps the newest day and the union of rewarded items');
  // migration: an old save (no earn) gets one, and the English items it was already served count as known
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('wordRealms.save.v1')); delete s.earn; s.seen = { 'a1/vocab': ['abc123', 'def456'] }; localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); });
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForSelector('.realm-node');
  const mg = await page.evaluate(() => ({ earn: !!WR.state.earn, got: WR.state.earn.got[WR.earnHash('en:abc123')], pay: WR.awardStars('en', 'abc123', 1), payNew: WR.awardStars('en', 'zzz999', 1) }));
  ok(mg.earn && mg.got === 1 && mg.pay === 0 && mg.payNew === 1, `old saves migrate: earn record added, already-served items count as known (${JSON.stringify(mg)})`);
  ok(errs.length === 0, 'no page errors ' + errs.join(' | '));
  await browser.close();
  console.log(fails ? `${fails} FAILED` : 'farm: all ok');
})();
