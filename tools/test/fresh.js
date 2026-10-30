// Content Wave 1 + fresh-first rotation: bank sizes, no repeats until the bank is used up, reading rotation, screenshots.
const { chromium } = require('playwright-core');
const OUT = '/workspace/cefr-quest/screenshots/';
const ok = (c, m) => { if (!c) { console.log('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const SAVE = { v: 1, name: 'Jeremy', avatar: 'avatar_mage', startLevel: 'a1', stars: 142, totalCorrect: 57, totalAnswered: 70,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 420, happiness: 82, hunger: 35, skin: null, lastTick: Date.now() }, streak: { count: 4, last: null }, progress: {},
  owned: [], equipped: { outfit: null, petskin: null, theme: null }, settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 5 };
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const page = await (await b.newContext({ viewport: { width: 1200, height: 860 } })).newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/font|ERR_/.test(m.text())) errors.push(m.text()); });
  await page.addInitScript(() => { window.__WR_ALL_TYPES = true; });   // rotation covers the whole bank, new C2 types included
  await page.goto('http://127.0.0.1:18642/index.html');
  await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), SAVE);
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(600);

  const counts = await page.evaluate(() => fetch('data/counts.json').then(r => r.json()));
  ok(counts.questions >= 650, `question bank grew to ${counts.questions}`);
  const low = Object.entries(counts.counts).filter(([k, n]) => /grammar|vocab|listening/.test(k) && n < 28);
  ok(!low.length, 'every grammar/vocab/listening bank has 28+ items ' + JSON.stringify(low));
  ok(Object.entries(counts.counts).filter(([k]) => /reading/.test(k)).every(([, n]) => n >= 21), 'every reading bank has 21+ questions (7 passages)');

  const r = await page.evaluate(async () => {
    const out = {}; const keyOf = it => it.q + '|' + (it.say || '') + '|' + (it.pic || '') + '|' + (it.correct || it.answer);
    const bank = await WR.bank('a1', 'grammar'); out.bank = bank.length;
    const lessons = []; for (let i = 0; i < 6; i++) lessons.push((await WR.buildItems('a1', 'grammar')).map(keyOf));
    const first = lessons.slice(0, Math.floor(bank.length / 8)).flat();
    out.firstDistinct = new Set(first).size; out.firstTotal = first.length;
    out.noDupWithin = lessons.every(l => new Set(l).size === l.length);
    out.seenLen = WR.state.seen['a1/grammar'].length;
    // after the bank is used up the next lesson must still be 8 items
    out.allLen8 = lessons.every(l => l.length === 8);
    // reading: 7 passages, 2 per lesson -> first 3 lessons show 6 different passages
    const titles = []; for (let i = 0; i < 3; i++) titles.push(...new Set((await WR.buildItems('b2', 'reading')).map(x => x.passage.title)));
    out.readDistinct = new Set(titles).size; out.readTotal = titles.length;
    // stale keys (items that no longer exist) are dropped
    WR.state.seen['c1/vocab'] = ['zzzz_gone', 'yyyy_gone']; await WR.buildItems('c1', 'vocab');
    out.staleDropped = !WR.state.seen['c1/vocab'].some(k => /_gone/.test(k)) && WR.state.seen['c1/vocab'].length === 8;
    // specials still mix items from all four skills
    out.special = (await Promise.all(WR.SKILLS.map(k => WR.buildItems('b1', k.id, 4)))).map(a => a.length);
    // saved to localStorage
    out.persisted = !!JSON.parse(localStorage.getItem('wordRealms.save.v1')).seen['a1/grammar'];
    return out;
  });
  ok(r.firstDistinct === r.firstTotal, `no repeats until the bank is used up (${r.firstDistinct}/${r.firstTotal} distinct from ${r.bank})`);
  ok(r.noDupWithin && r.allLen8, 'every lesson has 8 different items, even after the bank cycles');
  ok(r.seenLen <= r.bank - 8, `seen list stays bounded (${r.seenLen} ≤ ${r.bank - 8})`);
  ok(r.readDistinct === r.readTotal, `reading passages rotate (${r.readDistinct}/${r.readTotal} different)`);
  ok(r.staleDropped, 'stale seen keys are dropped');
  ok(r.special.every(n => n > 0), 'special games still get items from every skill ' + r.special);
  ok(r.persisted, 'seen lists are saved');

  // screenshots of new content
  const show = async (realm, skill, pred, title, file, w) => {
    await page.evaluate(async ({ realm, skill, pred, title }) => {
      const bank = await WR.bank(realm, skill); const f = new Function('x', 'return ' + pred);
      let items;
      if (skill === 'reading') { const p = bank.passages.find(f); items = p.questions.map(q => WR.normalize(q, p)); }
      else items = bank.filter(f).slice(0, 8).map(q => WR.normalize(q));
      WR.startLesson({ realm, skill, key: skill, title, items });
    }, { realm, skill, pred, title });
    await page.waitForSelector('.opt'); await page.waitForTimeout(900);
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(ov <= 1, `${file}: no horizontal overflow (${ov})`);
    await page.screenshot({ path: OUT + file });
  };
  await show('b2', 'reading', "x.title === 'The Glass Swimmers'", 'Reading · Lake Boss Battle', 'fresh_b2_reading.png');
  await show('c1', 'grammar', "x.q.startsWith('Not until much later')", 'Grammar · Council Debate', 'fresh_c1_grammar.png');
  await page.setViewportSize({ width: 390, height: 844 });
  await show('a1', 'vocab', "x.pic === '🍓'", 'Vocabulary · Picture Pop', 'fresh_a1_vocab_mobile.png');
  await show('a2', 'reading', "x.title === 'Ride the Candy Train'", 'Reading · Candy Shop', 'fresh_a2_reading_mobile.png');
  ok(!errors.length, 'no console errors ' + JSON.stringify(errors));
  console.log(process.exitCode ? 'FRESH TESTS FAILED' : 'FRESH TESTS PASSED');
  await b.close();
})();
