// 🧠 BRIEF-T10 thinking skills: about 1 of every 8–10 questions, inside the lesson already open.
// Why / how sure / a named strategy. No extra question, no star for the tap, no boss or crown check.
//   node tools/test/thinking.js
const { chromium } = require('playwright-core');
const fs = require('fs'), path = require('path');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = process.env.OUT || '/workspace/screenshots/';
fs.mkdirSync(OUT, { recursive: true });
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); } else { passes++; console.log('ok', m); } };
const SAVE = { v: 1, name: 'Mei', avatar: 'avatar_girl', startLevel: 'a1', stars: 10, totalCorrect: 0, totalAnswered: 0, lessonsDone: 2,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 0, happiness: 80, hunger: 30, lastTick: Date.now() },
  progress: {}, owned: [], equipped: {}, settings: { rate: 1, sound: false, unlockAll: true }, mistakes: [], parent: { pinAsked: true } };
const mcq = (extra = {}) => Object.assign({ type: 'mcq', q: 'A cat sits ___ the mat.', options: ['on', 'under', 'beside', 'into'], correct: 'on', explain: 'On is for a surface.' }, extra);
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const open = async (vp) => {
    const ctx = await browser.newContext({ viewport: vp, isMobile: vp.width < 700, hasTouch: true, deviceScaleFactor: 2 });
    await ctx.addInitScript(s => { window.__WR_NO_RECALL = true; if (!localStorage.getItem('wordRealms.save.v1')) localStorage.setItem('wordRealms.save.v1', s); }, JSON.stringify(SAVE));
    await ctx.route(/supabase\.co|cdn\.jsdelivr\.net|fonts\./, r => r.abort());
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
    await page.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.realm-node', { timeout: 30000 });
    await page.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove()));
    return { ctx, page, errs };
  };

  let { ctx, page, errs } = await open({ width: 375, height: 667 });
  const rate = await page.evaluate(() => {
    const T = WR.Think, out = {};
    for (const n of [4, 8, 9, 10, 16, 18, 24]) {
      const items = Array.from({ length: n }, (_, i) => ({ i }));
      T.mark({ items });
      out[n] = items.filter(it => it._think).length;
    }
    const rev = Array.from({ length: 8 }, (_, i) => ({ i, _rv: i < 2 ? { for: 'k' } : null }));
    T.mark({ items: rev });
    const word = Array.from({ length: 8 }, (_, i) => ({ i, topic: 'g2.story' }));
    T.mark({ items: word });
    const boss = Array.from({ length: 8 }, (_, i) => ({ i }));
    T.mark({ mode: 'boss', items: boss });
    const check = Array.from({ length: 8 }, (_, i) => ({ i }));
    T.mark({ check: { skill: 'vocab' }, items: check });
    const plain = Array.from({ length: 8 }, (_, i) => ({ i, _sk: 'a1/grammar' }));
    T.mark({ items: plain });
    return {
      out, rev: rev.find(it => it._think) && rev.find(it => it._think)._think,
      word: word.find(it => it._think) && word.find(it => it._think)._think,
      boss: boss.some(it => it._think), check: check.some(it => it._think),
      plain: plain.find(it => it._think) && plain.find(it => it._think)._think,
      story: !!(MathGen.topic('g2.story') && MathGen.topic('g2.story').story)
    };
  });
  for (const n of [8, 9, 10, 16, 18, 24]) {
    const share = rate.out[n] / n;
    ok(share >= 0.1 - 1e-9 && share <= 0.125 + 1e-9, `${n} questions → ${rate.out[n]} prompts (${share.toFixed(3)})`);
  }
  ok(rate.out[4] === 0, 'a 4-question check has no thinking prompt');
  ok(rate.rev === 'sure' && rate.word === 'heur' && rate.plain === 'why' && rate.story, `review → sure, word problem → strategy, other → why (${rate.rev}, ${rate.word}, ${rate.plain})`);
  ok(!rate.boss && !rate.check, 'a boss round and a crown check are left alone');
  const merged = await page.evaluate(() => WR.Think.merge({ sure: 2, sureRight: 1, asks: 1 }, { sure: 5, sureRight: 4, asks: 0 }));
  ok(merged.sure === 5 && merged.sureRight === 4, 'cloud merge keeps the copy with more sure-answers');

  // How sure, then a reload.
  await page.evaluate(() => WR.startLesson({ realm: 'a1', skill: 'vocab', key: 'vocab', title: 'Sure', items: [Object.assign({ type: 'mcq', q: 'A cat sits ___ the mat.', options: ['on', 'under', 'beside', 'into'], correct: 'on', explain: 'On is for a surface.', _sk: 'a1/vocab', _rv: { for: 'demo' }, _think: 'sure' })] }));
  await page.waitForSelector('.think-gate');
  const stars0 = await page.evaluate(() => WR.state.stars);
  await page.click('.think-btn[data-th="sure"]');
  const stars1 = await page.evaluate(() => WR.state.stars);
  ok(stars1 === stars0, 'saying "pretty sure" does not pay a star');
  await page.click('.opt:has-text("on")');
  await page.waitForSelector('#nextBtn');
  const sure = await page.evaluate(() => ({ text: document.body.innerText, t: WR.state.think, correct: 1 }));
  ok(/You felt sure, and you were right/.test(sure.text) && sure.t.sure === 1 && sure.t.sureRight === 1, 'a sure and right answer is remembered');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.realm-node', { timeout: 30000 });
  const kept = await page.evaluate(() => ({ think: WR.state.think, stars: WR.state.stars }));
  ok(kept.think.sure === 1 && kept.think.sureRight === 1 && kept.stars >= stars0, `reload keeps the tally and the stars (${JSON.stringify(kept.think)})`);

  // Why: a silly reason does not change the score.
  await page.evaluate(it => WR.startLesson({ realm: 'a1', skill: 'grammar', key: 'grammar', title: 'Why', items: [it] }), mcq({ q: 'The birds ___ in the tree.', options: ['sing', 'sings', 'singing', 'sang'], correct: 'sing', explain: 'The birds is more than one, so the verb stays sing.', _sk: 'a1/grammar', _think: 'why' }));
  await page.waitForSelector('.opt');
  const before = await page.evaluate(() => WR.state.stars);
  await page.locator('.opt').nth(0).click();
  await page.waitForSelector('[data-think="why"]');
  const box = await page.evaluate(() => {
    const b = document.querySelector('.think-btn').getBoundingClientRect();
    const inputs = [...document.querySelectorAll('.think-gate input, .think-gate textarea')];
    return { h: b.height, w: b.width, inputs: inputs.length, wide: document.documentElement.scrollWidth > window.innerWidth + 1 };
  });
  ok(box.h >= 44 && box.w >= 44 && box.inputs === 0 && !box.wide, `375: the reason button is at least 44 px and there is no typing box (${box.h.toFixed(0)}×${box.w.toFixed(0)})`);
  await page.click('[data-think="why"] .think-btn:has-text("longest")');
  const why = await page.evaluate(() => ({ text: document.querySelector('#explain').innerText, stars: WR.state.stars }));
  ok(/better reason/i.test(why.text) && why.stars === before + 1, `a wrong reason is kind and the question still paid its own star (${why.stars - before})`);
  await page.screenshot({ path: path.join(OUT, 'thinking_375_why.png') });

  // Strategy on a word problem.
  await page.evaluate(() => { const q = MathGen.make('g2.story', 3); q._think = 'heur'; const stars = WR.state.stars; WR.Math.startLesson({ topic: 'g2.story', items: [q], title: 'Strategy' }); return stars; });
  await page.waitForSelector('[data-think="heur"]');
  const s2 = await page.evaluate(() => WR.state.stars);
  await page.click('.think-btn:has-text("Draw a model")');
  const heur = await page.evaluate(() => ({ text: document.querySelector('.think-gate').innerText, stars: WR.state.stars }));
  ok(/Sketch the parts/.test(heur.text) && heur.stars === s2, 'picking "draw a model" names the strategy and pays nothing');
  await page.screenshot({ path: path.join(OUT, 'thinking_375_heur.png') });

  for (const v of [{ w: 320, h: 700, name: '320' }, { w: 360, h: 740, name: '360' }, { w: 700, h: 360, name: 'land' }]) {
    const o = await open({ width: v.w, height: v.h });
    await o.page.evaluate(it => WR.startLesson({ realm: 'a1', skill: 'grammar', key: 'grammar', title: 'Why', items: [it] }), mcq({ _sk: 'a1/grammar', _think: 'why' }));
    await o.page.waitForSelector('.opt');
    await o.page.click('.opt:has-text("on")');
    await o.page.waitForSelector('[data-think="why"]');
    const fit = await o.page.evaluate(() => {
      const b = document.querySelector('.think-btn').getBoundingClientRect();
      return { h: b.height, wide: document.documentElement.scrollWidth > window.innerWidth + 1, answers: document.querySelectorAll('.opt').length };
    });
    ok(fit.h >= 44 && !fit.wide && fit.answers === 4, `${v.name}: why prompt fits, four answers still on the card`);
    await o.page.screenshot({ path: path.join(OUT, `thinking_${v.name}_why.png`) });
    ok(o.errs.length === 0, `${v.name}: no page errors`);
    await o.ctx.close();
  }
  ok(errs.length === 0, 'no page errors on the main pass ' + errs.slice(0, 2).join(' | '));
  await ctx.close();
  await browser.close();
  console.log(`\nthinking: ${passes} passed, ${fails} failed`);
  process.exitCode = fails ? 1 : 0;
})().catch(e => { console.error(e); process.exit(1); });
