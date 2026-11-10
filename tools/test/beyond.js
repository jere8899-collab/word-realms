// 🌳 Beyond the screen: every CEFR and Singapore level has a paper suggestion in the Report,
// a printable sheet, a viewing task (Singapore money in S$), a pass-the-phone round, and a
// grown-up star confirm of 2, once, inside the practice cap. The module is not on the first visit.
//   node tools/test/beyond.js
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/opt/cursor/artifacts/';
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const CEFR = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
const SG = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 's1', 's2', 's3', 's4', 'jc1', 'jc2', 'adult'];
const SAVE = { v: 1, name: 'Mei', avatar: 'avatar_girl', startLevel: 'a1', stars: 40, lessonsDone: 12,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 20, happiness: 80, hunger: 20, lastTick: Date.now() },
  owned: ['hat_star'], progress: {}, settings: { rate: 0.9, sound: false, unlockAll: true }, mistakes: [] };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  async function open(vp) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, isMobile: vp.width < 700, hasTouch: true, timezoneId: 'Asia/Singapore' });
    const reqs = [];
    ctx.on('request', r => reqs.push(r.url()));
    await ctx.addInitScript(() => { window.__WR_NO_SW = true; window.__WR_TEST = { holdMs: 0, pinOffer: false }; });
    await ctx.addInitScript(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), SAVE);
    await ctx.route(/supabase\.co|cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)/, r => r.abort());
    const page = await ctx.newPage(); page.errs = []; page.reqs = reqs;
    page.on('pageerror', e => page.errs.push(String(e)));
    await page.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('.realm-node', { timeout: 30000 });
    return page;
  }
  const pass = async page => { if (!(await page.$('.pgate'))) return; const a = await page.evaluate(() => WR.parentGate._answer()); for (const d of a) await page.click(`.pgate [data-d="${d}"]`); await page.click('#pgOk'); };
  // .fade-in runs for 0.35s from opacity 0. A shot in that window looks washed out; the settled screen is opacity 1.
  const solid = async (page, sel) => {
    await page.waitForSelector(sel);
    await page.evaluate(sel => new Promise(resolve => {
      const el = document.querySelector(sel);
      let done = false; const finish = () => { if (!done) { done = true; resolve(); } };
      el.addEventListener('animationend', e => { if (e.target === el) finish(); });
      setTimeout(finish, 1000);
    }), sel);
    const style = await page.evaluate(sel => { const cs = getComputedStyle(document.querySelector(sel)); return { opacity: cs.opacity, filter: cs.filter }; }, sel);
    ok(style.opacity === '1' && (style.filter === 'none' || style.filter === ''), `${sel} is fully opaque after the fade (${style.opacity}, ${style.filter})`);
  };
  const fit = (page, min = 44) => page.evaluate(min => {
    const bad = [];
    for (const el of document.querySelectorAll('#main button, #beyond button, #printSheet button')) {
      const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
      if (r.height < min) bad.push('small ' + el.textContent.trim().slice(0, 24) + ' ' + Math.round(r.height));
      if (r.left < -1 || r.right > innerWidth + 1) bad.push('cut ' + el.textContent.trim().slice(0, 24));
    }
    return { bad, wide: document.documentElement.scrollWidth > innerWidth + 1 };
  }, min);

  {
    const page = await open({ width: 360, height: 740 });
    ok(!page.reqs.some(u => /\/js\/beyond\.js/.test(u)), 'the home screen does not download beyond.js');
    await page.evaluate(() => WR.go('report', 'week'));
    await page.waitForSelector('.pgate'); await pass(page);
    await page.waitForSelector('#beyondCard', { timeout: 15000 });
    const titles = await page.$$eval('#beyondCard .by-lv', b => b.map(x => x.dataset.lv + ' ' + x.textContent));
    ok(CEFR.concat(SG).every(id => titles.some(t => t.startsWith(id + ' '))), 'the report shows one off-screen idea for every CEFR and Singapore level');
    ok(await page.evaluate(() => WR.Beyond.PACKS.every(p => p.off.talk.length >= 2 && p.off.talk.length <= 3 && p.off.lines.length >= 1 && p.off.mark.length >= 1)), 'each paper task has questions, a marking guide and 2 or 3 talk prompts');
    ok(await page.evaluate(() => {
      const packs = WR.Beyond.PACKS, blob = JSON.stringify(packs);
      const priced = packs.filter(p => p.view.price);
      return priced.every(p => /^(S\$|Free)/.test(p.view.price)) && packs.filter(p => p.track === 'sg' && p.view.kind === 'advert').every(p => /^S\$/.test(p.view.price)) && !/£|pounds/.test(blob);
    }), 'money on a viewing task is Singapore dollars, never pounds');
    await solid(page, '#report');
    await page.screenshot({ path: OUT + 'beyond_360_report.png', fullPage: true });
    await page.click('#beyondCard .by-lv[data-lv="a1"]');
    await page.waitForSelector('#printSheet');
    const sheet = await page.innerText('#printSheet');
    ok(/Nova and Puffbun/.test(sheet) && /Marking guide/.test(sheet) && /Talk it through/.test(sheet), 'the printable page has the story, the talk prompts and the marking guide');
    let printed = 0; await page.exposeBinding('__printed', () => { printed++; });
    await page.evaluate(() => { window.print = () => window.__printed(); });
    await page.click('#byPrint');
    ok(printed === 1, 'Print calls window.print once');
    await solid(page, '#beyond');
    await page.locator('#printSheet').screenshot({ path: OUT + 'beyond_360_print.png' });
    const stars0 = await page.evaluate(() => WR.state.stars);
    await page.click('#byConfirm'); await pass(page); await page.waitForSelector('#beyond');
    ok(await page.evaluate(() => WR.state.stars) === stars0 + 2, 'a grown-up confirm pays 2 stars');
    await page.click('#byConfirm'); await page.waitForTimeout(200);
    ok(await page.evaluate(() => WR.state.stars) === stars0 + 2, 'the same paper task does not pay again');
    ok(await page.evaluate(() => WR.state.owned.join(',') === 'hat_star' && WR.state.pet.name === 'Puffbun'), 'the confirm keeps the hat and the pet');
    await page.evaluate(() => WR.Beyond.open('p3', 'view'));
    await page.waitForSelector('#viewCard');
    ok(/S\$3/.test(await page.innerText('#viewCard')), 'the Primary 3 advert shows S$3');
    await solid(page, '#beyond');
    await page.evaluate(() => document.querySelectorAll('.toast').forEach(e => e.remove()));
    await page.screenshot({ path: OUT + 'beyond_360_view.png' });
    await page.evaluate(() => { WR.earn().practice = 150; WR.Beyond.open('p1', 'paper'); });
    await page.waitForSelector('#byConfirm');
    const held = await page.evaluate(() => WR.state.stars);
    await page.click('#byConfirm'); await page.waitForTimeout(300);
    ok(await page.evaluate(held => WR.state.stars === held && !(WR.state.beyond && WR.state.beyond.done['p1:paper']), held), 'a full practice cap does not mark the task done');
    await page.evaluate(() => { WR.earn().practice = 0; WR.Beyond.open('a1', 'play'); });
    await page.waitForSelector('#byReady');
    await page.click('#byReady');
    await page.waitForSelector('.by-choice');
    await solid(page, '#beyond');
    await page.evaluate(() => document.querySelectorAll('.toast').forEach(e => e.remove()));
    await page.screenshot({ path: OUT + 'beyond_360_play.png' });
    await page.locator('.by-choice').nth(0).click();
    for (let i = 1; i < 3; i++) { await page.click('#byReady'); await page.waitForSelector('.by-choice'); await page.locator('.by-choice').nth(0).click(); }
    await page.waitForSelector('#byAgain');
    ok(await page.evaluate(() => { const s = WR.state; return s.name === 'Mei' && !s.sibling && !s.partner && !(s.beyond && s.beyond.answers); }), 'play together stores no second name and no answers');
    ok(page.errs.length === 0, 'no page errors ' + page.errs.slice(0, 2).join(' | '));
    await page.context().close();
  }

  for (const vp of [{ w: 320, h: 700, n: '320' }, { w: 360, h: 740, n: '360' }, { w: 375, h: 700, n: '375' }, { w: 700, h: 360, n: 'land' }]) {
    const page = await open({ width: vp.w, height: vp.h });
    await page.evaluate(() => WR.lazy('js/beyond.js').then(() => WR.Beyond.open('a2', 'paper')));
    await page.waitForSelector('#printSheet');
    const f = await fit(page);
    ok(!f.bad.length && !f.wide, `${vp.n}: the paper task fits (${f.bad.join(', ')})`);
    await page.evaluate(() => WR.go('door', { rid: 'a1', door: 'play' }));
    await page.waitForSelector('[data-beyond]');
    ok(/Beyond the screen/.test(await page.innerText('#bonusRow')), `${vp.n}: the tile is inside the Play door`);
    ok(!(await page.evaluate(() => !!document.querySelector('.home-grid [data-beyond], .map [data-beyond]'))), `${vp.n}: no new home tile`);
    await page.context().close();
  }
  console.log(`\nbeyond: ${passes} passed, ${fails} failed`);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
