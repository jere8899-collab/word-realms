// 👆 R1 (REVIEW-2026-11-01): a double tap on "Next" / "Finish" moves exactly one step in every lesson-like mode, and a double
// tap on the last one pays the round once (same stars + pet XP as one tap). Two clicks are fired in the SAME tick on the
// same button (the worst case: a stale button). We count WR.view() calls (one per new screen) and finish() payouts
// (WR.activityDone / WR.petGainXP calls).   node tools/test/doubletap.js   (game served on :18642)
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = () => ({ v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'c2', stars: 10, totalCorrect: 0, totalAnswered: 0,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 20, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 1, last: today() }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 1 });
// spies: WR.view calls and payouts
const SPY = () => {
  const wrap = (o, n, k) => { const f = o[n]; o[n] = function (...a) { window.__c[k]++; return f.apply(this, a); }; };
  window.__c = { view: 0, act: 0, xp: 0 }; wrap(WR, 'view', 'view'); wrap(WR, 'activityDone', 'act'); wrap(WR, 'petGainXP', 'xp');
};
// answer whatever is on screen (any answer) until an advance button shows; returns that button's selector
const ADV = ['#nextBtn', '#chNext', '#phNext', '#storyNext', '#mnext', '#swNext', '#fgNext', '#czNext', '#pmNext', '#plNext', '#done'];
async function answerAny(p) {
  for (let t = 0; t < 40; t++) {
    const adv = await p.evaluate(ADV => ADV.find(s => { const b = document.querySelector(s); return b && !b.disabled; }) || null, ADV);
    if (adv) return adv;
    await p.evaluate(() => {
      const q = s => [...document.querySelectorAll(s)].find(b => !b.disabled && b.offsetParent);
      const cq = WR.Charms && WR.Charms._q && WR.Charms._q(), pq = WR.Phonics && WR.Phonics._q && WR.Phonics._q();
      if (q('#chCatch')) return q('#chCatch').click();
      if (cq && cq.type === 'spell') { for (const ch of cq.w.w) { const b = [...document.querySelectorAll('#chPool .tile:not([disabled])')].find(x => x.textContent === ch); b && b.click(); } return; }
      if (pq && pq.t === 'build' && q('#phPool .ph-tile')) { for (const g of pq.tiles) { const b = [...document.querySelectorAll('#phPool .ph-tile:not([disabled])')].find(x => x.textContent === g); b && b.click(); } return; }
      if (pq && pq.t === 'blend' && q('#phBlend')) { q('#phTiles .ph-tile') && q('#phTiles .ph-tile').click(); q('#phBlend').click(); }
      const self = q('[data-self]'); if (self) return self.click();
      const opt = q('.opt, .ch-opt, .ph-opt, .ph-picopt, .ph-sw, .mopts .opt'); if (opt) return opt.click();
      const inp = q('#mans'); if (inp) { inp.value = '999999'; inp.dispatchEvent(new Event('input')); const c = q('#mcheck'); if (c) c.click(); return; }
      const tile = q('.sw-pool .sw-tile'); if (tile) { tile.click(); setTimeout(() => { const c = q('.sw-acts [id$="Check"]'); c && c.click(); }, 30); return; }
      const gs = (WR.gapGames.find(g => g.round === WR.current()) || { s: () => null }).s(), gans = gs && gs.items[gs.n] && gs.items[gs.n].ans[0];
      const gi = q('.sw-card input'); if (gi) { gi.value = gans || 'zzz'; gi.dispatchEvent(new Event('input')); const c = q('[id$="Check"]'); c && c.click(); return; }
      const un = q('#unsure'); if (un) return un.click();
    });
    await p.waitForTimeout(120);
  }
  return null;
}
const dbl = (p, sel) => p.evaluate(sel => { window.__c.view = 0; const b = document.querySelector(sel); b.click(); b.click(); }, sel);
async function open(browser) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route(/supabase\.co|cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await ctx.addInitScript(() => { window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined; });
  const p = await ctx.newPage(); p.__errs = [];
  p.on('pageerror', e => p.__errs.push(e.message));
  await p.goto(BASE + 'index.html'); await p.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), SAVE());
  await p.reload(); await p.waitForFunction(() => window.WR && WR.realms && document.querySelector('.topbar'), null, { timeout: 20000 });
  await p.evaluate(SPY); return p;
}
// play a whole round with double taps on every advance; returns { steps, views[], acts, xps }
async function playDouble(p, name, start, doneSel, max = 30) {
  await p.evaluate(start); await p.waitForTimeout(500);
  const views = []; let steps = 0;
  for (; steps < max; steps++) {
    if (await p.$(doneSel)) break;
    const adv = await answerAny(p); if (!adv) { console.log('  (stuck on', await p.evaluate(() => WR.current() + ' ' + document.querySelector('#main').innerText.slice(0, 160).replace(/\s+/g, ' ')), ')'); break; }
    await p.evaluate(() => { window.__c.act = 0; window.__c.xp = 0; });
    await dbl(p, adv); await p.waitForTimeout(350);
    views.push(await p.evaluate(() => window.__c.view));
  }
  const c = await p.evaluate(() => window.__c);
  const done = !!(await p.$(doneSel));
  ok(done, `${name}: the round reaches its result screen (${steps} steps)`);
  ok(views.length > 0 && views.every(v => v === 1), `${name}: each double tap drew exactly one new screen (${views.join(',')})`);
  ok(c.act <= 1 && c.xp <= 1, `${name}: the last double tap paid the round once (activityDone ×${c.act}, petGainXP ×${c.xp})`);
  ok(p.__errs.length === 0, `${name}: no page errors (${p.__errs.slice(0, 2)})`);
  p.__errs.length = 0;
  return { steps, views };
}
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const p = await open(browser);
  // English lesson: 6 classic items, one per step
  await playDouble(p, 'English lesson', async () => { const b = await WR.bank('a1', 'grammar'); const items = b.filter(q => !q.type || q.type === 'mcq').slice(0, 6).map(q => WR.normalize(q));
    window.__n = items.length; WR.startLesson({ realm: 'a1', skill: 'grammar', key: 'grammar', title: 'Grammar', items }); }, '.result');
  // B2 boss (timed)
  await playDouble(p, 'B2 boss', async () => { const b = await WR.bank('b2', 'grammar'); const items = b.filter(q => !q.type || q.type === 'mcq').slice(0, 5).map(q => WR.normalize(q));
    WR.startLesson({ realm: 'b2', skill: 'grammar', key: 'grammar', title: 'Boss', items }); }, '.result');
  await playDouble(p, 'C1 Great Debate', () => WR.playSpecial('c1'), '.result');
  await playDouble(p, 'B1 Lantern quest', () => WR.playSpecial('b1'), '.result', 20);
  await playDouble(p, 'Speaking (shadowing)', () => WR.startSpeaking('a1'), '.result');
  await playDouble(p, 'Maths lesson', () => WR.Math.startLesson({ topic: 'g2.add' }), '.result');
  await playDouble(p, 'Word Charms', () => WR.startCharms('a1'), '.ch-done', 40);
  await playDouble(p, 'Phonics', () => WR.startPhonics(0), '.ph-done');
  await playDouble(p, 'Storybook', () => WR.startStory('a1'), '.story-done');
  for (const [g, pre] of [['swapRound', 'sw'], ['forgeRound', 'fg'], ['clozeRound', 'cz'], ['marksRound', 'pm']])
    await playDouble(p, `Gap game ${pre} (B2)`, `(() => { const G = WR.gapGames.find(x => x.round === '${g}'); WR.go(G.hub, 'b2'); setTimeout(() => document.querySelector('.sw-book').click(), 200); })()`, '.sw-done', 20).catch(e => ok(false, pre + ' ' + e.message));
  // placement: a double tap on Next asks the next riddle once
  await p.evaluate(() => WR.startPlacement({ onBack: () => WR.go('home'), onAccept: () => WR.go('home') })); await p.waitForTimeout(300);
  await p.click('#plGo'); await p.waitForTimeout(400);
  let pv = [];
  for (let i = 0; i < 3; i++) { const a = await answerAny(p); if (a !== '#plNext') break; await dbl(p, a); await p.waitForTimeout(300); pv.push(await p.evaluate(() => window.__c.view)); }
  ok(pv.length === 3 && pv.every(v => v === 1), `Placement: each double tap on Next shows one riddle (${pv})`);
  // exact payout: single vs double tap on the last Next of the same lesson (all answers right)
  const pay = async double => {
    const q = await open(browser);
    await q.evaluate(async () => { const b = await WR.bank('a2', 'vocab'); const items = b.filter(x => !x.type || x.type === 'mcq').slice(0, 4).map(x => WR.normalize(x));
      WR.startLesson({ realm: 'a2', skill: 'vocab', key: 'vocab', title: 'Vocab', items }); });
    await q.waitForTimeout(400);
    const s0 = await q.evaluate(() => ({ s: WR.state.stars, xp: WR.state.pet.xp }));
    for (let i = 0; i < 4; i++) {
      await q.evaluate(() => { const c = WR._dbg(); [...document.querySelectorAll('.opt')].find(b => b.textContent.replace((b.querySelector('.k') || {}).textContent || '', '').trim() === c).click(); });
      await q.waitForTimeout(100);
      if (i < 3 || !double) await q.click('#nextBtn'); else await dbl(q, '#nextBtn');
      await q.waitForTimeout(300);
    }
    const s1 = await q.evaluate(() => ({ s: WR.state.stars, xp: WR.state.pet.xp }));
    await q.context().close(); return { stars: s1.s - s0.s, xp: s1.xp - s0.xp };
  };
  const one = await pay(false), two = await pay(true);
  ok(one.stars > 0 && one.stars === two.stars && one.xp === two.xp, `a double tap on the last Next pays the same as one tap (one: +${one.stars}⭐ +${one.xp} XP, double: +${two.stars}⭐ +${two.xp} XP)`);
  console.log(`\n${passes} passed, ${fails} failed`);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
