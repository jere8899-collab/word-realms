// ✒️ Story Quill test: save migration, scoring heuristics, A1 + C1 UI flows, stars paid once, daily quest, garden planting, mobile, no console errors.
const { chromium } = require('playwright-core');
const OUT = '/workspace/cefr-quest/screenshots/';
const URL = 'http://127.0.0.1:18642/index.html';
const assert = (c, m) => { if (!c) throw new Error('ASSERT ' + m); console.log('ok -', m); };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
// an OLD save (no `writing` field, no `speaking` field) with the writing quest in today's daily list
const SAVE = JSON.stringify({
  v: 1, name: 'Jeremy', avatar: 'avatar_mage', startLevel: 'a1', stars: 40, totalCorrect: 30, totalAnswered: 40,
  pet: { species: 'pet_fox', name: 'Mochi', xp: 420, happiness: 82, hunger: 35, skin: null, lastTick: Date.now() },
  streak: { count: 3, last: today() }, progress: { a1: { grammar: { best: 1, plays: 1 }, vocab: { best: .9, plays: 1 } } },
  stickers: { got: { a1: ['first', 'grammar', 'vocab', 'crown3'] }, full: [] },   // C6: stickers this progress earns are already collected
  daily: { day: today(), quests: [{ id: 'write1', progress: 0, claimed: false }, { id: 'correct10', progress: 0, claimed: false }, { id: 'feed1', progress: 0, claimed: false }] },
  owned: [], equipped: { outfit: null, petskin: null, theme: null }, settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 2 });
const STRONG_B1 = `Hi Fern,

Thank you so much for your email! I'm really looking forward to the clean-up because I have never helped at a festival before.

I would prefer to collect rubbish, as I want the forest to be clean for the animals. If you like, I can bring some strong bags and two pairs of gloves for the other volunteers.

Unfortunately, 9 am is a bit early for me because my bus arrives at 9.15, so I might be ten minutes late. I hope that's OK!

See you on Saturday,
Mia`;
const OFFTOPIC_B1 = `Hi Fern,

My favourite football team is very good this year. They have won many matches and the players are fast. I watch every game on television with my brother and we eat popcorn together.

Last week they scored four goals and everyone in my town was celebrating in the streets until midnight. Football is the most popular sport in my country.

Bye,
Mia`;
const ERRORS_B1 = `hi fern
thanks for you email. i am agree with the plan and he go to the forest every day. i want decorate the the trees but it depend of the weather. My brother have alot of informations about lanterns and i can to bring gloves. Starting at 9 is more better for me than later but i didnt wanted to be late so i come early`;
const A1_TEXT = `Hello! My name is Jeremy. I am ten years old. I live in a big house with my family. I like dragons and I love pizza.`;
const C1_TEXT = `Few people would disagree that ancient castles and forests deserve protection. However, governments must decide how to spend limited resources, and two methods seem especially promising: funding and education.

Funding is clearly necessary. Without regular investment, old towers and libraries slowly fall apart, and specialist repairs are extremely expensive. Government grants allow experts to restore damaged buildings carefully. Furthermore, a well-funded site can employ local craftspeople, which keeps traditional skills alive. Admittedly, money is not always spent wisely, and some restoration projects have actually damaged the sites they were meant to protect.

Education, on the other hand, is a long-term solution. When schools organise visits to historic places, young people learn to respect their heritage and to share informations with their families. What is particularly striking is that pupils who have visited a castle are far more likely to support conservation as adults. It could be argued that awareness depend of good teachers, but most children remember these trips for years.

On balance, I believe that education is the more important method. Not only does it create future voters who care about the past, but it also reduces vandalism. This is not to say that funding is unnecessary; in an emergency, only money can save a collapsing wall. Ultimately, however, governments will only keep paying for heritage if ordinary people value it, so teaching the next generation must be the priority.`;

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const errors = [], ext = [];
  const watch = (p, tag) => { p.on('pageerror', e => errors.push(tag + ' pageerror: ' + e.message));
    p.on('requestfailed', r => { if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) ext.push(r.url()); else errors.push(tag + ' reqfail: ' + r.url()); });
    p.on('console', m => { if (m.type() === 'error' && !(/Failed to load resource/.test(m.text()) && ext.length)) errors.push(tag + ' console: ' + m.text()); }); };
  async function open(viewport) {
    const ctx = await browser.newContext({ viewport });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await ctx.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('wordRealms.save.v1', s); sessionStorage.setItem('seeded', '1'); } }, SAVE);
    const page = await ctx.newPage(); watch(page, String(viewport.width));
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.WR && WR.realms && document.querySelector('.topbar'), null, { timeout: 20000 }); await page.waitForTimeout(300);
    return page;
  }
  const clean = async p => { await p.evaluate(() => document.querySelectorAll('.confetti,.toast').forEach(e => e.remove())); await p.waitForTimeout(300); };
  const page = await open({ width: 1200, height: 860 });

  // ---- 1. save migration ----
  const mig = await page.evaluate(() => ({ w: WR.state.writing, sp: WR.state.speaking, stars: WR.state.stars, prog: WR.state.progress.a1.grammar.best }));
  assert(mig.w && mig.w.checks === 0 && mig.w.crowns === 0 && JSON.stringify(mig.w.best) === '{}' && JSON.stringify(mig.w.drafts) === '{}', 'old save migrated with an empty writing block');
  assert(mig.sp && mig.stars === 40 && mig.prog === 1, 'older fields untouched by the migration');
  const mig2 = await page.evaluate(() => { const raw = JSON.parse(localStorage.getItem('wordRealms.save.v1')); raw.writing = { checks: 3, best: { 'a1-w01': { total: 15, crowns: 2 } } }; localStorage.setItem('wordRealms.save.v1', JSON.stringify(raw)); const s = WR.load(); return s.writing; });
  assert(mig2.checks === 3 && mig2.best['a1-w01'].crowns === 2 && mig2.drafts && mig2.crowns === 0, 'partial writing block is completed without losing data');

  // ---- 2. scoring heuristics ----
  const u = await page.evaluate(async ([strong, off, errs]) => {
    const Q = WR.Quill, all = {};
    for (const lv of ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']) all[lv] = await WR.bank(lv, 'writing');
    const p = all.b1[0], s = Q.score(p, strong), o = Q.score(p, off), e = Q.score(p, errs), sh = Q.score(p, 'Hi Fern, great, I will bring gloves. Bye!');
    const models = Object.values(all).flat().map(x => ({ id: x.id, t: Q.score(x, x.model).total, f: Q.score(x, x.model).flags.length }));
    const kinds = e.flags.map(f => f.kind + ':' + f.text.toLowerCase());
    const mech = Q.mechanics('i like cats. they are nice');
    return { counts: Object.fromEntries(Object.entries(all).map(([k, v]) => [k, v.length])), models, s: { sc: s.scales, t: s.total, c: s.crowns, cov: s.covered },
      o: { sc: o.scales, t: o.total, c: o.crowns }, sh: { sc: sh.scales, t: sh.total, c: sh.crowns, tips: sh.tips.length },
      e: { sc: e.scales, n: e.flags.length, kinds, tips: e.tips.map(x => x.s) }, mech: mech.map(f => f.kind + ':' + f.text),
      crowns: [Q.crownsFor(20), Q.crownsFor(17), Q.crownsFor(13), Q.crownsFor(9), Q.crownsFor(8)].join(',') };
  }, [STRONG_B1, OFFTOPIC_B1, ERRORS_B1]);
  console.log(JSON.stringify({ s: u.s, o: u.o, sh: u.sh, e: { sc: u.e.sc, n: u.e.n }, mech: u.mech }));
  assert(Object.values(u.counts).every(n => n >= 6) && Object.values(u.counts).reduce((a, b) => a + b) >= 36, '6+ prompts per level, 36+ in total');
  assert(u.models.every(m => m.t >= 17 && m.f === 0), 'every model answer scores 3 crowns with no false flags (' + u.models.map(m => m.t).join(' ') + ')');
  assert(u.s.sc.content === 5 && u.s.cov === 4 && u.s.t >= 16 && u.s.c >= 2, 'strong B1 email: full content and a high total');
  assert(u.o.sc.content <= 1 && u.o.c === 0, 'off-topic B1 email: low content, no crowns');
  assert(u.sh.sc.content <= 1 && u.sh.t < 9 && u.sh.c === 0, 'too-short B1 email: low content, no crowns');
  for (const k of ['grammar:i am agree', 'grammar:he go', 'grammar:depend of', 'grammar:informations', 'grammar:more better', 'repeat:the the', 'grammar:can to bring', 'spelling:alot', 'grammar:didnt wanted', 'grammar:my brother have'])
    assert(u.e.kinds.includes(k), 'error checker flags “' + k + '”');
  assert(u.e.kinds.some(k => k.startsWith('caps:')) && u.e.kinds.some(k => k.startsWith('punct:')), 'capital letters and missing final punctuation flagged');
  assert(u.e.sc.lang <= 2 && u.e.n >= 12 && u.e.tips.length <= 5 && u.e.tips.some(t => /highlighted/.test(t)), 'error-ridden text: low Language, max 5 tips incl. the highlights tip');
  assert(u.mech.includes('caps:i') && u.mech.includes('caps:they') && u.mech.includes('punct:e'), 'lowercase i, sentence start and final punctuation');
  assert(u.crowns === '3,3,2,1,0', 'total/20 → crowns mapping (17/13/9)');

  // ---- 3. A1 UI flow ----
  const before = await page.evaluate(() => ({ stars: WR.state.stars, xp: WR.state.pet.xp, passed: WR.realmProgress('a1').passed }));
  await page.evaluate(() => WR.go('realm', 'a1'));
  await page.waitForSelector('[data-write]'); await clean(page);
  assert(/Bonus/.test(await page.textContent('[data-write]')), 'bonus writing tile in the realm');
  await page.screenshot({ path: OUT + 'writing_01_realm_tile.png' });
  await page.click('[data-write]'); await page.waitForSelector('.quill-task');
  assert((await page.$$('.quill-task')).length === 6, 'A1 task picker lists 6 tasks');
  await page.waitForFunction(() => { const i = document.querySelector('.quill-art'); return i && i.complete && i.naturalWidth > 0; });
  await clean(page); await page.screenshot({ path: OUT + 'writing_02_picker.png' });
  await page.click('.quill-task[data-id="a1-w01"]'); await page.waitForSelector('#qPlan');
  await page.click('#qBullets');
  assert((await page.inputValue('#qPlan')).includes('• Your name:'), 'plan step: content points added as bullets');
  await page.fill('#qPlan', '• name: Jeremy\n• age: 10\n• home: big house\n• likes: dragons, pizza');
  await page.click('#qToWrite'); await page.waitForSelector('#qText');
  assert(await page.isVisible('.plan-peek'), 'plan shown while writing');
  await page.fill('#qText', 'Hello! My name is Jeremy.');
  let live = await page.evaluate(() => ({ wc: document.querySelector('#qWc').className, ok: [...document.querySelectorAll('#qPoints li.ok')].length }));
  assert(live.wc.includes('under') && live.ok === 1, 'live word count shows "under" and ticks the name point');
  await page.click('#qText'); await page.keyboard.press('End');
  await page.click('.bank-chip[data-ph="I am … years old."]');
  const ins = await page.evaluate(() => { const t = document.querySelector('#qText'); return { v: t.value, sel: t.value.slice(t.selectionStart, t.selectionEnd) }; });
  assert(ins.v.endsWith('I am … years old. ') && ins.sel === '…', 'language bank inserts a phrase and selects the … gap');
  await page.keyboard.type('ten');
  await page.fill('#qText', A1_TEXT);
  live = await page.evaluate(() => ({ wc: document.querySelector('#qWc').className, ok: [...document.querySelectorAll('#qPoints li.ok')].length }));
  assert(live.wc.includes('in') && live.ok === 4, 'word count turns "in range" and all 4 points tick');
  await page.waitForTimeout(700);
  assert(await page.evaluate(t => WR.state.writing.drafts['a1-w01'].text === t && /dragons/.test(WR.state.writing.drafts['a1-w01'].plan), A1_TEXT), 'draft (text and plan) saved in the save file');
  await clean(page); await page.screenshot({ path: OUT + 'writing_03_a1_write.png' });
  await page.click('#qCheck'); await page.waitForSelector('.scales');
  const a1 = await page.evaluate(() => ({ r: WR._quillDbg().result, stars: WR.state.stars, xp: WR.state.pet.xp, best: WR.state.writing.best['a1-w01'], q: WR.state.daily.quests.find(q => q.id === 'write1'),
    scales: document.querySelectorAll('.scale').length, model: !!document.querySelector('.q-model .model-text'), note: /not an official Cambridge/.test(document.querySelector('.quill-note').textContent),
    pet: document.querySelector('#lpet').className }));
  console.log('A1 result', a1.r.r.total, a1.r.r.crowns, 'gain', a1.r.gain);
  assert(a1.scales === 4 && a1.model && a1.note, 'feedback: 4 scales, model answer and the honest "practice estimate" note');
  assert(a1.r.r.crowns >= 2 && a1.stars === before.stars + a1.r.r.crowns && a1.r.gain === a1.r.r.crowns, '+1⭐ per crown on first completion');
  assert(a1.xp > before.xp && /cheer|bounce/.test(a1.pet), 'pet gains XP and reacts');
  assert(a1.best.crowns === a1.r.r.crowns && a1.q.progress === 1, 'best result saved; daily quest "Write a Story Quill task" progressed');
  await page.click('#qImprove'); await page.waitForSelector('#qText');
  assert((await page.inputValue('#qText')) === A1_TEXT, '"Improve my writing" keeps the text');
  await page.click('#qCheck'); await page.waitForSelector('.scales');
  const again = await page.evaluate(() => ({ stars: WR.state.stars, gain: WR._quillDbg().result.gain, checks: WR.state.writing.checks }));
  assert(again.stars === a1.stars && again.gain === 0 && again.checks === 2, 'a retry with the same crowns pays no stars again');
  await page.evaluate(() => WR.go('home')); await page.waitForSelector('.claim[data-id="write1"]');
  await page.click('.claim[data-id="write1"]');
  assert(await page.evaluate(() => WR.state.daily.quests.find(q => q.id === 'write1').claimed), 'writing daily quest can be claimed');
  const after = await page.evaluate(() => ({ passed: WR.realmProgress('a1').passed, tile: WR.writingRealmCrowns('a1') }));
  assert(after.passed === before.passed && after.tile.done === 1, 'writing is a bonus: unlock count unchanged, tile shows progress');

  // ---- 4. error-ridden text plants corrected sentences in the Mistake Garden ----
  const g0 = await page.evaluate(() => WR.state.mistakes.length);
  await page.evaluate(() => WR.openQuill('a2', 'a2-w02', 'write')); await page.waitForSelector('#qText');
  await page.fill('#qText', 'dear Ana,\nI am sorry i didnt came to you party. My brother have a cold and he go to the doctor. Shall we meet on friday\nLove,\nKai');
  await page.click('#qCheck'); await page.waitForSelector('.scales');
  const g = await page.evaluate(() => ({ m: WR.state.mistakes.filter(m => m.skill === 'writing').map(m => m.correct), marks: document.querySelectorAll('#qHl mark').length }));
  console.log('planted', JSON.stringify(g.m));
  assert(g.marks >= 4, 'flagged spans highlighted in the text');
  assert(g.m.length >= 1 && g.m.some(s => /My brother has a cold and he goes to the doctor\./.test(s)), 'corrected sentence planted in the garden as a sentence-builder card');
  await page.evaluate(() => WR.go('review')); await page.waitForSelector('.plot');
  assert(await page.evaluate(() => [...document.querySelectorAll('.plot')].some(p => WR.iconText(p).includes('✒️'))), 'garden shows the writing card with the ✒️ icon');

  // ---- 5. C1 flow + desktop feedback screenshot ----
  await page.evaluate(() => WR.go('realm', 'c1')); await page.waitForSelector('[data-write]'); await page.click('[data-write]');
  await page.waitForSelector('.quill-task'); await page.click('.quill-task[data-id="c1-w01"]'); await page.waitForSelector('#qPlan');
  await page.click('#qSkip'); await page.waitForSelector('#qText');
  await page.fill('#qText', C1_TEXT);
  await page.waitForTimeout(300); await clean(page);
  await page.screenshot({ path: OUT + 'writing_04_c1_write.png' });
  await page.screenshot({ path: OUT + 'writing_04b_c1_write_full.png', fullPage: true });
  const s0 = await page.evaluate(() => WR.state.stars);
  await page.click('#qCheck'); await page.waitForSelector('.scales'); await page.waitForTimeout(1200); await clean(page);
  const c1 = await page.evaluate(() => { const r = WR._quillDbg().result; return { t: r.r.total, c: r.r.crowns, sc: r.r.scales, gain: r.gain, flags: r.r.flags.map(f => f.text), stars: WR.state.stars }; });
  console.log('C1 result', JSON.stringify(c1));
  assert(c1.sc.content === 5 && c1.c >= 2 && c1.stars === s0 + c1.gain && c1.gain === c1.c, 'C1 essay: full content, crowns paid');
  assert(c1.flags.includes('informations') && c1.flags.includes('depend of'), 'C1 essay errors highlighted');
  await page.evaluate(() => document.querySelector('.fb-top').scrollIntoView({ block: 'start' })); await page.evaluate(() => window.scrollBy(0, -150));
  await page.waitForTimeout(300);
  await page.setViewportSize({ width: 1200, height: 1500 }); await page.evaluate(() => { document.querySelector('.fb-top').scrollIntoView({ block: 'start' }); window.scrollBy(0, -230); }); await page.waitForTimeout(400);
  await page.screenshot({ path: OUT + 'writing_05_c1_feedback.png' });
  await page.setViewportSize({ width: 1200, height: 860 });
  await page.screenshot({ path: OUT + 'writing_05b_c1_feedback_full.png', fullPage: true });

  // ---- 6. mobile 390×844 ----
  const m = await open({ width: 390, height: 844 });
  const ov = async tag => { const o = await m.evaluate(() => ({ sw: document.documentElement.scrollWidth, bw: document.body.scrollWidth })); assert(o.sw <= 390 && o.bw <= 390, `mobile ${tag}: no horizontal overflow (${o.sw}px)`); };
  await m.evaluate(() => WR.go('realm', 'b1')); await m.waitForSelector('[data-write]'); await ov('realm');
  await m.click('[data-write]'); await m.waitForSelector('.quill-task'); await ov('picker');
  await m.click('.quill-task[data-id="b1-w01"]'); await m.waitForSelector('#qPlan'); await ov('plan');
  await m.click('#qSkip'); await m.waitForSelector('#qText'); await m.fill('#qText', STRONG_B1); await ov('write');
  await clean(m); await m.screenshot({ path: OUT + 'writing_06_mobile_write.png' });
  await m.click('#qCheck'); await m.waitForSelector('.scales'); await m.waitForTimeout(1000); await clean(m); await ov('feedback');
  await m.evaluate(() => { document.querySelector('.fb-top').scrollIntoView({ block: 'start' }); window.scrollBy(0, -120); }); await m.waitForTimeout(300);
  await m.screenshot({ path: OUT + 'writing_07_mobile_feedback.png' });
  await m.screenshot({ path: OUT + 'writing_07b_mobile_feedback_full.png', fullPage: true });

  console.log('ERRORS', JSON.stringify(errors));
  assert(errors.length === 0, 'no console errors');
  await browser.close();
  console.log('ALL WRITING TESTS PASSED');
})().catch(e => { console.error(e); process.exit(1); });
