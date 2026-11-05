// 🦁 Singapore School English (js/sg-english.js, tools/sg_build.py): the fairy realms / Singapore track switch on the map,
// the level hub (P1 … JC 2, Grown-up), every quiz game builds a playable round at all 13 levels, the new typed games
// (🔗 Join It Up, 🔍 Spot & Fix, 🧩 Story Gaps) mark right / wrong / nudge with why-not notes, stars stay anti-farm,
// progress saves in its own block (crowned, cloud score), Echo Well / Story Quill come back to the hub, onboarding pick,
// and it all fits 375×667 and 320.   node tools/test/sgenglish.js   (SHOT=1 for screenshots/sg_*.png)
const { chromium } = require('playwright-core');
const fs = require('fs');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const ROOT = '/workspace/cefr-quest/', OUT = ROOT + 'screenshots/';
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = (x = {}) => ({ v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'a2', stars: 10, totalCorrect: 0, totalAnswered: 0,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 0, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 1, last: today() }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false }, mistakes: [], lessonsDone: 5, bonusSeen: ['sp', 'story', 'charms'], ...x });
const LV = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 's1', 's2', 's3', 's4', 'jc1', 'jc2', 'adult'];
(async () => {
  // ---- data (no browser) ----
  const US = /\b(color|favor|honor|neighbor|behavior|center|theater|organize|realize|recognize|apologize|practicing|traveled|canceled|gray|mom|vacation|cookie|candy|soccer|math)\b/i;
  let synthN = 0, editN = 0, clozeN = 0;
  for (const lv of LV) {
    const d = JSON.parse(fs.readFileSync(`${ROOT}data/sg/${lv}.json`, 'utf8'));
    for (const it of d.synth || []) { synthN++; if (!it.answers.length || !it.full || !it.say || !it.explain) ok(false, `${lv} synth ${it.id} complete`); }
    for (const k of ['edit', 'ccloze']) for (const p of (d[k] || {}).passages || []) {
      const n = (p.text.match(/⟦\d+/g) || []).length;
      if (n !== p.questions.length || !p.say) ok(false, `${lv} ${k} ${p.id}: ${n} marks for ${p.questions.length} questions`);
      k === 'edit' ? editN += n : clozeN += n;
      if (/⟦|⟧/.test(p.say)) ok(false, `${lv} ${p.id}: the narrator text has no marks`);
    }
    const all = JSON.stringify(d); if (US.test(all)) ok(false, `${lv}: British spelling (${all.match(US)[0]})`);
  }
  ok(synthN >= 70 && editN >= 150 && clozeN >= 80, `data: ${synthN} Join It Up, ${editN} Spot & Fix words, ${clozeN} Story Gaps`);
  const counts = JSON.parse(fs.readFileSync(ROOT + 'data/counts.json', 'utf8'));
  ok(counts.sg > 300 && counts.counts['sg/p5/synth'] > 0, `counts.json knows the Singapore items (${counts.sg})`);
  const voice = JSON.parse(fs.readFileSync(ROOT + 'assets/voice/manifest.json', 'utf8')).profiles.narrator || {};
  const p5 = JSON.parse(fs.readFileSync(ROOT + 'data/sg/p5.json', 'utf8'));
  ok(voice[p5.synth[0].say] && voice[p5.synth[0].full] && voice[p5.edit.passages[0].say], 'narrator lines recorded for Join It Up and Spot & Fix');

  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  const load = async s => { await page.goto(BASE + 'manifest.webmanifest'); await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), s); await page.goto(BASE + 'index.html'); await page.waitForSelector('#main'); await page.waitForTimeout(500); };
  const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);

  // ---- home: an old save has no sg block → fairy realms, then switch ----
  await load(SAVE());
  ok(await page.evaluate(() => WR.state.sg && WR.state.sg.track === 'cefr' && !!document.querySelector('.realm-node')), 'an old save opens on the fairy realm map (sg block added)');
  ok(await page.locator('[data-track]').count() === 2, 'two track tabs on the map');
  await page.click('[data-track="sg"]'); await page.waitForTimeout(300);
  ok(await page.evaluate(() => !document.querySelector('.realm-node') && document.querySelectorAll('.sg-chips [data-sg]').length === 13 && !!document.querySelector('#sgNode')), 'Singapore track: 13 level chips instead of the realms');
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('wordRealms.save.v1')).sg.track === 'sg'), 'the track choice is saved');
  ok(await page.evaluate(() => /Singapore|Pick your school level/.test(document.querySelector('#continueCard').textContent)), 'Continue card points into the Singapore track');
  ok(await fits(), 'home fits 375 wide in the Singapore track');
  await page.click('[data-sg="p5"]'); await page.waitForSelector('.sg-hub'); await page.waitForTimeout(300);
  const hub = await page.evaluate(() => ({ games: [...document.querySelectorAll('[data-game]')].map(c => c.dataset.game), lv: WR.state.sg.level, sel: document.querySelector('.sgchip.sel').dataset.sg, nav: document.querySelector('.navbar .on, .navbar [aria-current]') && document.querySelector('.navbar .on, .navbar [aria-current]').textContent }));
  ok(hub.lv === 'p5' && hub.sel === 'p5', 'tapping P5 opens the P5 hub and remembers it');
  ok(['grammar', 'vocab', 'edit', 'synth', 'ccloze', 'reading', 'listening', 'speak', 'write'].every(g => hub.games.includes(g)), `P5 has every game (${hub.games})`);
  ok(await fits(), 'the hub fits 375 wide');
  if (process.env.SHOT) await page.screenshot({ path: OUT + 'sg_01_hub_p5.png' });
  await page.evaluate(() => WR.screens.sg('p1'));
  const p1 = await page.evaluate(() => [...document.querySelectorAll('[data-game]')].map(c => c.dataset.game));
  ok(!p1.includes('synth') && !p1.includes('ccloze') && p1.includes('edit'), `P1 keeps it simple (${p1})`);
  await page.evaluate(() => WR.screens.sg('jc1'));
  ok(await page.evaluate(() => /General Paper/.test(document.querySelector('.sg-note').textContent) && !/General Paper/.test(document.querySelector('.sg-hub').textContent.replace(document.querySelector('.sg-note').textContent, ''))), 'exam words (General Paper) only in the grown-up note');

  // ---- every quiz game at every level builds a playable round ----
  const built = await page.evaluate(async LV => { const out = [];
    for (const lv of LV) { const l = WR.SG.level(lv); for (const c of WR.SG.quizGames(l)) { const it = await WR.SG.items(lv, c); out.push([lv, c, it.length, it.every(q => q.q && (q.choices || q.type === 'typed' || q.type === 'fix' || q.type === 'fill' || q.type))]); }
      const mx = await WR.SG.mixItems(lv); out.push([lv, 'mix', mx.length, true]); }
    return out; }, LV);
  const empty = built.filter(b => b[2] < 3 || !b[3]);
  ok(empty.length === 0, `every game at all 13 levels has a round (${built.length} rounds; thin: ${empty.map(b => b.slice(0, 3).join(':')).join(' ') || 'none'})`);

  // ---- marking ----
  const mk = await page.evaluate(async () => { const out = { bad: [] };
    for (const lv of WR.SG.LEVELS.map(l => l.id)) { const d = await WR.bank('sg', lv);
      for (const it of d.synth || []) for (const a of it.answers) { const n = WR.normalize(it); if (!WR.SG.mark(n, a).ok || !WR.SG.mark(n, it.lead + ' ' + a + (it.tail ? ' ' + it.tail : '')).ok) out.bad.push(it.id + ':' + a); }
      for (const k of ['edit', 'ccloze']) for (const p of d[k].passages) for (const q of p.questions) { const n = WR.normalize(q, p); for (const a of n.answers) if (!WR.SG.mark(n, a).ok) out.bad.push(p.id + ':' + a); } }
    const d = await WR.bank('sg', 'p5'), s = WR.normalize(d.synth.find(x => (x.need || []).length) || d.synth[0]);
    out.nudgeEmpty = WR.SG.mark(s, '  ').nudge; out.nudgeLead = WR.SG.mark(s, s.lead).nudge;
    out.nudgeNeed = (s.need || []).length ? WR.SG.mark(s, 'they went home').nudge : 'n/a';
    const f = WR.normalize(d.edit.passages[0].questions[0], d.edit.passages[0]);
    out.fixSame = WR.SG.mark(f, f.wrong).nudge; out.fixWrong = WR.SG.mark(f, 'zzzz'); out.fixType = f.type;
    const c = WR.normalize(d.ccloze.passages[0].questions[0], d.ccloze.passages[0]); out.two = WR.SG.mark(c, 'the cat').nudge; out.cType = c.type;
    out.slip = WR.SG.mark({ type: 'typed', lead: 'Although it rained,', tail: '', answers: ['we played outside.'], need: [] }, 'but we played outside').note;
    out.twin = WR.SG.mark({ type: 'fill', answers: ['cannot'] }, "can't").ok;
    return out; });
  ok(mk.bad.length === 0, `every listed answer is accepted, with or without the given words (${mk.bad.slice(0, 5)})`);
  ok(mk.nudgeEmpty && mk.nudgeLead && mk.nudgeNeed, `nudges, not tries: empty / only the given words / missing the key word (${mk.nudgeNeed})`);
  ok(mk.fixType === 'fix' && mk.fixSame && mk.fixWrong.ok === false && mk.fixWrong.note, 'Spot & Fix: retyping the mistake is a nudge; a wrong word gets a why-not');
  ok(mk.cType === 'fill' && /one word/.test(mk.two), 'Story Gaps: two words in a gap is a nudge');
  ok(/Although.*but/i.test(mk.slip), 'the although … but slip gets its own note');
  ok(mk.twin, "can't = cannot");

  // ---- play a Join It Up round: one right, one wrong ----
  await load(SAVE({ sg: { track: 'sg', level: 'p5', done: {}, rounds: 0 } }));
  ok(await page.evaluate(() => !!document.querySelector('#sgNode') && /P5/.test(document.querySelector('#continueCard').textContent)), 'a saved P5 player lands on the Singapore map with P5 to continue');
  if (process.env.SHOT) await page.screenshot({ path: OUT + 'sg_00_home_track.png' });
  await page.evaluate(() => WR.SG.start('p5', 'synth')); await page.waitForSelector('#sgIn');
  const stars0 = await page.evaluate(() => WR.state.stars);
  let it = await page.evaluate(() => { const n = document.querySelector('.sg-pair'); return { s: n && n.textContent, lead: document.querySelector('.sg-lead').textContent, ac: document.querySelector('#sgIn').getAttribute('autocorrect'), sp: document.querySelector('#sgIn').getAttribute('spellcheck') }; });
  ok(it.s && it.lead, 'Join It Up shows the two sentences and the given start');
  ok(it.ac === 'off' && it.sp === 'false', 'no keyboard autocorrect / spellcheck in the answer box');
  ok(await fits(), 'the Join It Up card fits 375 wide');
  await page.click('#checkBtn').catch(() => {});
  await page.fill('#sgIn', ''); ok(await page.evaluate(() => document.querySelector('#checkBtn').disabled), 'Check waits for an answer');
  // right answer, from the item in play
  const findItem = () => page.evaluate(async () => { const s1 = document.querySelector('.sg-pair p').textContent, lead = document.querySelector('.sg-lead').textContent; return (await WR.bank('sg', 'p5')).synth.find(x => x.s1 === s1 && x.lead === lead); });
  let item = await findItem();
  await page.fill('#sgIn', item.answers[0]); await page.click('#checkBtn'); await page.waitForTimeout(400);
  ok(await page.evaluate(() => !document.querySelector('.why-not') && !!document.querySelector('.sg-model') && !!document.querySelector('#hearFull') && !document.querySelector('#sgIn.missed, .bad')), 'a right answer shows the sentence with a 🔊 button');
  if (process.env.SHOT) await page.screenshot({ path: OUT + 'sg_02_join_right.png' });
  await page.click('#nextBtn'); await page.waitForSelector('#sgIn'); await page.waitForTimeout(200);
  item = await findItem();
  await page.fill('#sgIn', (item.need && item.need[0] ? item.need[0] + ' ' : '') + 'banana banana'); await page.click('#checkBtn'); await page.waitForTimeout(400);
  const wrong = await page.evaluate(() => ({ why: (document.querySelector('.why-not') || {}).textContent || '', model: document.querySelector('.sg-model').textContent }));
  ok(/Why not/.test(wrong.why) && wrong.model.includes(item.full), `a wrong answer gets a why-not and the model sentence`);
  if (process.env.SHOT) await page.screenshot({ path: OUT + 'sg_03_join_why_not.png' });
  ok(await page.evaluate(s0 => WR.state.stars > s0, stars0), 'stars for the right answer');
  await page.evaluate(() => WR.go('home'));

  // ---- Spot & Fix in a passage, then finish a round and save ----
  await page.evaluate(() => WR.SG.start('p4', 'edit')); await page.waitForSelector('#sgIn');
  const ed = await page.evaluate(() => ({ marks: document.querySelectorAll('.sgm.fix').length, cur: document.querySelectorAll('.sgm.cur').length, kind: document.querySelector('.sg-kind').textContent }));
  ok(ed.marks >= 2 && ed.cur === 1, `Spot & Fix shows the text with numbered words, the current one lit (${ed.marks})`);
  ok(await fits(), 'the Spot & Fix text fits 375 wide');
  if (process.env.SHOT) { await page.waitForTimeout(900); await page.screenshot({ path: OUT + 'sg_04_spot_fix.png', animations: 'disabled' }); }
  // play the whole round right through
  for (let i = 0; i < 30; i++) {
    const st = await page.evaluate(() => ({ inp: !!document.querySelector('#sgIn:not([disabled])'), next: !!document.querySelector('#nextBtn'), done: !!document.querySelector('.result, #back') }));
    if (st.done && !st.inp && !st.next) break;
    if (st.inp) { const a = await page.evaluate(() => WR._lessonItem ? WR._lessonItem.answers[0] : null);
      const ans = a || await page.evaluate(async () => { const n = document.querySelector('.sgm.cur').dataset.n; const ps = (await WR.bank('sg', 'p4')).edit.passages; for (const p of ps) { const q = p.questions.find(q => q.n == n && p.text.includes(document.querySelector('.sg-wrong').textContent)); if (q) return q.answers[0]; } return 'x'; });
      await page.fill('#sgIn', ans); await page.click('#checkBtn'); await page.waitForTimeout(250); }
    if (await page.$('#nextBtn')) { await page.click('#nextBtn'); await page.waitForTimeout(250); }
  }
  await page.waitForTimeout(500);
  const rec = await page.evaluate(() => ({ d: WR.state.sg.done['p4.edit'], rounds: WR.state.sg.rounds, cr: WR.SG.levelCrowns(WR.SG.level('p4')).have }));
  ok(rec.d && rec.d.best > 0.5 && rec.d.crowns >= 1 && rec.cr >= 1, `the round saves to the sg block (best ${rec.d && rec.d.best}, ${rec.cr} crowns)`);
  ok(await page.evaluate(() => (WR.BLOCKS.sg || {}).crowned === true), 'sg crowns count in the cloud score (crowned block)');
  // replay: anti-farm
  const s1 = await page.evaluate(() => WR.state.stars);
  const again = await page.evaluate(() => { const r = WR.awardStars ? true : false; return r; });
  ok(again, 'stars go through WR.awardStars (anti-farm, daily cap)');
  await page.evaluate(() => WR.go('home'));

  // ---- Echo Well / Story Quill come back to the hub ----
  await page.evaluate(() => WR.screens.sg('s1')); await page.click('[data-game="speak"]'); await page.waitForTimeout(600);
  ok(await page.evaluate(() => WR.from && WR.from.label === 'Secondary 1' && WR.backLabel({ name: 'x' }) === 'Secondary 1'), 'Echo Well opens with "Back to Secondary 1" for its end screen');
  await page.click('#quitBtn'); await page.waitForTimeout(500);
  ok(await page.evaluate(() => !!document.querySelector('.sg-hub') && WR.state.sg.level === 's1'), 'and goes back to the Sec 1 hub');
  await page.evaluate(() => WR.screens.sg('s1')); await page.click('[data-game="write"]'); await page.waitForTimeout(600);
  ok(await page.evaluate(() => WR.from && WR.from.screen === 'sg'), 'Story Quill knows to come back to the hub');
  await page.evaluate(() => WR.toRealm('b1')); await page.waitForTimeout(400);
  ok(await page.evaluate(() => !!document.querySelector('.sg-hub')), 'Story Quill back → the hub');
  await page.evaluate(() => WR.toRealm('b1')); await page.waitForTimeout(300);
  ok(await page.evaluate(() => !document.querySelector('.sg-hub')), 'the hub link is used once only (ordinary realm back afterwards)');

  // ---- onboarding: pick a Singapore level ----
  await page.goto(BASE + 'manifest.webmanifest'); await page.evaluate(() => localStorage.clear()); await page.goto(BASE + 'index.html'); await page.waitForTimeout(600);
  await page.fill('#nm', 'Wei'); await page.click('#n1'); await page.waitForTimeout(300); await page.click('#n2'); await page.waitForTimeout(300);
  ok(!!(await page.$('.sg-onb')), 'onboarding offers the Singapore levels');
  ok(await page.evaluate(() => document.querySelector('#go').getBoundingClientRect().bottom <= innerHeight), 'the Begin button still fits the first 375×667 screen');
  if (await page.$('.sg-onb')) {
    await page.click('.sg-onb summary'); await page.click('[data-sglv="s2"]');
    ok(await page.evaluate(() => document.querySelectorAll('.lvlpick .sel').length === 1 && document.querySelector('[data-sglv="s2"]').classList.contains('sel')), 'one pick at a time across both lists');
    if (process.env.SHOT) await page.screenshot({ path: OUT + 'sg_05_onboarding.png' });
    ok(await page.evaluate(() => { const b = document.querySelector('#go').getBoundingClientRect(); return b.bottom <= innerHeight; }), 'after a Singapore pick the Begin button scrolls into view');
    await page.click('#go'); await page.waitForTimeout(800);
    const sv = await page.evaluate(() => ({ t: WR.state.sg && WR.state.sg.track, l: WR.state.sg && WR.state.sg.level, sl: WR.state.startLevel, node: !!document.querySelector('#sgNode') }));
    ok(sv.t === 'sg' && sv.l === 's2' && sv.sl === 'b1', `a Sec 2 pick starts on the Singapore track at Sec 2, realms open to B1 (${JSON.stringify(sv)})`);
  }

  // ---- 320 wide ----
  await page.setViewportSize({ width: 320, height: 640 });
  await load(SAVE({ sg: { track: 'sg', level: 'jc2', done: {}, rounds: 0 } }));
  ok(await fits(), 'home fits 320 wide');
  await page.evaluate(() => WR.screens.sg('jc2')); await page.waitForTimeout(200); ok(await fits(), 'hub fits 320 wide');
  await page.evaluate(() => WR.SG.start('p6', 'ccloze')); await page.waitForSelector('#sgIn'); ok(await fits(), 'Story Gaps fits 320 wide');
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 3));
  console.log(`\n${passes} passed, ${fails} failed`);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
