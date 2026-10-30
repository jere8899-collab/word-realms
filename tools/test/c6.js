// C6: Sticker Book, realm bosses, pet evolution goal on the map, weekly events.
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
let fails = 0, passes = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const SAVE = () => ({ v: 1, name: 'Sticker Sam', avatar: 'avatar_girl', startLevel: 'a1', stars: 10, totalCorrect: 40, lessonsDone: 6,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 200, happiness: 80, hunger: 30, lastTick: Date.now() },
  progress: { a1: { grammar: { best: 0.95, plays: 2 }, vocab: { best: 0.7, plays: 1 }, reading: { best: 0.65, plays: 1 } } },
  stories: { done: { a1: { best: 1, crowns: 3, plays: 1 } }, words: [], reads: 1 },
  owned: [], equipped: {}, settings: { rate: 1, sound: false }, mistakes: [] });
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const vp of [{ width: 375, height: 667 }, { width: 320, height: 658 }, { width: 1280, height: 800 }]) {
    const tag = vp.width + 'px';
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2 }); await ctx.route(/supabase|jsdelivr|unpkg/, r => r.abort());
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
    await page.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); sessionStorage.setItem('seeded', 1); } }, SAVE());
    await page.goto(BASE); await page.waitForSelector('#goalsCard');
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    const home = await page.evaluate(() => ({ pet: !!document.querySelector('#petGoal'), week: document.querySelector('#weekGoal').innerText, book: document.querySelector('#bookGoal').innerText, stars: WR.state.stars, got: WR.state.stickers.got.a1, goal: document.querySelector('#petGoal b').innerText }));
    ok(home.pet && /Lv 3 → Lv 5/.test(home.goal), `${tag} map: pet evolution goal (${home.goal})`);
    ok(/Week/.test(home.week), `${tag} map: weekly event shown (${home.week.split('\n')[0]})`);
    ok(home.got.length === 6 && ['first', 'grammar', 'vocab', 'reading', 'crown3', 'story'].every(k => home.got.includes(k)), `${tag} stickers worked out from the save (${home.got})`);
    ok(home.stars === 10 + 12, `${tag} +2⭐ per new sticker (stars ${home.stars})`);
    ok(await overflow() <= 0, `${tag} map: no sideways overflow`);
    if (vp.width < 1000) {   // phones: Continue + the first realm card stay on the first screen; the goals sit below the realm map
      const lay = await page.evaluate(() => { const b = s => { const e = document.querySelector(s); return e ? e.getBoundingClientRect() : null; }; return { cont: b('#continueBtn'), realm: b('.map > .realm-node:nth-child(2)'), goals: b('#goalsCard'), map: b('.map'), h: innerHeight }; });
      ok(lay.cont && lay.cont.bottom <= lay.h && lay.realm.bottom <= lay.h, `${tag} map: Continue and the first realm card fit without scrolling (${Math.round(lay.realm.bottom)}/${lay.h})`);
      ok(lay.goals.top >= lay.map.bottom, `${tag} map: goals card sits below the realm map`);
    }
    const sv = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('wordRealms.save.v1')); return !!(d.stickers && d.stickers.got && d.weekly && d.weekly.wk); });
    ok(sv, `${tag} stickers and the weekly event are saved in wordRealms.save.v1 (so they cloud-sync)`);
    if (vp.width === 375) await page.evaluate(() => document.querySelector('#goalsCard').scrollIntoView({ block: 'center' })), await page.waitForTimeout(900), await page.screenshot({ path: 'screenshots/c6_map_goals.png' });
    // a second visit must not pay again
    await page.reload(); await page.waitForSelector('#goalsCard');
    ok(await page.evaluate(() => WR.state.stars) === 22, `${tag} stickers pay only once`);
    // realm screen: boss card (ready in A1, locked in A2) + sticker row
    await page.evaluate(() => WR.go('realm', 'a2')); await page.waitForSelector('#rbossCard');
    ok(await page.evaluate(() => document.querySelector('#rbossCard').classList.contains('locked') && !document.querySelector('#rbossGo')), `${tag} A2 boss is locked until 3 of 4 skills are passed`);
    await page.evaluate(() => WR.go('realm', 'a1')); await page.waitForSelector('#rbossGo');
    await page.evaluate(() => document.querySelector('#rbossCard').scrollIntoView({ block: 'center' })); await page.waitForFunction(() => { const i = document.querySelector('#rbossCard img'); return i && i.complete && i.naturalWidth > 0; }, null, { timeout: 8000 }).catch(() => {});
    const rb = await page.evaluate(() => { const i = document.querySelector('#rbossCard img'); return { src: i && i.currentSrc, ok: i && i.complete && i.naturalWidth > 0 }; });
    ok(rb.ok && /boss_buzzbloom/.test(rb.src), `${tag} A1 realm boss card shows painted Queen Buzzbloom (${rb.src})`);
    ok(await overflow() <= 0, `${tag} realm: no sideways overflow`);
    if (vp.width === 375) { await page.evaluate(() => document.querySelector('#rbossCard').scrollIntoView({ block: 'center' })); await page.waitForTimeout(900); await page.screenshot({ path: 'screenshots/c6_realm_boss.png' }); }
    await page.click('#rbossGo'); await page.waitForSelector('#bossFace');
    const bf = await page.evaluate(() => ({ img: (document.querySelector('#bossFace img') || {}).currentSrc, timer: !!document.querySelector('#timerBar'), n: document.querySelector('.qnum').textContent, flav: document.querySelector('#main').innerText.includes('Queen Buzzbloom') }));
    ok(/boss_buzzbloom/.test(bf.img) && !bf.timer && /\/10/.test(bf.n) && bf.flav, `${tag} boss fight: painted portrait, no timer, 10 mixed questions ${JSON.stringify(bf)}`);
    if (vp.width === 375) await page.waitForTimeout(900), await page.screenshot({ path: 'screenshots/c6_boss_fight.png' });
    for (let i = 0; i < 10; i++) {
      if (await page.$('.result')) break;
      try { await page.waitForSelector('.opt:not([disabled]), #pool .tile', { timeout: 8000 }); } catch (e) { console.log('STUCK', await page.evaluate(() => document.querySelector('#main').innerHTML.slice(0, 1500))); throw e; }
      const ans = String(await page.evaluate(() => WR._dbg()));
      if (await page.$('#pool .tile')) { for (const w of ans.split(' ')) await page.evaluate(w => { const t = [...document.querySelectorAll('#pool .tile')].find(b => b.textContent.trim() === w); if (t) t.click(); }, w); await page.click('#checkBtn'); }
      else { await page.waitForSelector('.opt:not([disabled])'); await page.evaluate(a => { const b = [...document.querySelectorAll('.opt')].find(b => b.innerText.replace(/^[A-D]\s*/, '').trim() === a.trim()); b.click(); }, ans); }
      await page.waitForSelector('#nextBtn'); await page.click('#nextBtn'); await page.waitForTimeout(150);
    }
    await page.waitForSelector('.result'); await page.waitForTimeout(400);
    const res = await page.evaluate(() => ({ h: document.querySelector('.result h1').innerText, next: document.querySelector('#nextStep').innerText, won: WR.state.bosses.a1.won, got: WR.state.stickers.got.a1 }));
    ok(/Boss defeated/.test(res.h) && res.won && res.got.includes('boss'), `${tag} beating the boss saves the win and the Boss Badge (${res.h})`);
    ok(/Sticker Book/.test(res.next), `${tag} result's next step opens the Sticker Book`);
    ok(await page.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).bosses.a1.won === true), `${tag} boss win saved in wordRealms.save.v1`);
    await page.click('#nextStep'); await page.waitForSelector('.sbook');
    const sb = await page.evaluate(() => ({ t: document.querySelector('.sbook .title').innerText, a1: document.querySelectorAll('#sp_a1 .stk.has').length, pages: document.querySelectorAll('.spage').length }));
    ok(sb.a1 === 7 && sb.pages === 7, `${tag} Sticker Book: A1 page 7/8, 6 realm pages + events (${JSON.stringify(sb)})`);
    ok(await overflow() <= 0, `${tag} sticker book: no sideways overflow`);
    if (vp.width === 375) await page.waitForTimeout(900), await page.screenshot({ path: 'screenshots/c6_sticker_book.png' });
    // weekly event: finish it through the normal quest events, claim once
    const w = await page.evaluate(() => { const w = WR.Collect.weekly(); for (let i = 0; i < w.def.goal; i++) WR.questEvent(w.def.on[0]); return WR.Collect.weekly(); });
    ok(w.progress === w.def.goal, `${tag} weekly event counts the quest events (${w.def.name} ${w.progress}/${w.def.goal})`);
    await page.evaluate(() => WR.go('home')); await page.waitForSelector('#weekClaim');
    const s0 = await page.evaluate(() => WR.state.stars); await page.click('#weekClaim'); await page.waitForSelector('#goalsCard');
    const after = await page.evaluate(() => ({ stars: WR.state.stars, ev: WR.state.stickers.got.events, claimed: WR.state.weekly.claimed, again: WR.Collect.claimWeekly() }));
    ok(after.stars === s0 + 20 && after.claimed && after.ev.length === 1 && after.again === false, `${tag} weekly prize: +20⭐ and an event sticker, once (${JSON.stringify(after)})`);
    ok(!errs.length, `${tag} no page errors ${errs.join(' | ')}`);
    await ctx.close();
  }
  await browser.close(); console.log(`c6.js: ${passes} passed, ${fails} failed`);
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
