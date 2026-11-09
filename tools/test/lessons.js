// 📜 Lessons (LESSONS-PLAN.md, js/learn.js): A1 English + Grade 2 maths (+ MA-3 G1 when art lands). Widget kit includes shapecount and line (EN-4c).
//   node tools/test/lessons.js        (SHOT=1 saves screenshots/lessons_*.png at 390 px)
// Covers: every pilot lesson played start → scroll by TAP; drag (pointer) on sort / place value / spots / line; the re-teach path
// (a different explanation, NEW questions, why-not notes); stars once ever (anti-farm); a lesson failed twice still
// leaves its scroll; the save shape inside wordRealms.save.v1 (cloud whole-save sync + score) and old saves migrating;
// 📜 hint links in English and maths practice (not in boss rounds); the weak-result nudge; Learn chips inside the skill /
// topic cards (no new tiles); the 🎒 Backpack; the Grown-ups report card + summary line; 320–412 px: no sideways scroll,
// tap targets ≥ 44 px, nothing squeezed; and no page errors.
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
const MIN_LESSONS = 56;
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = { v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'a1', stars: 60, totalCorrect: 1, totalAnswered: 1,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 20, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 1, last: today() }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false }, mistakes: [], lessonsDone: 1, parent: { pinAsked: true }, math: { grade: 2 } };
const PROFILES = [[320, 658], [360, 780], [375, 667], [390, 844], [412, 915]];

// ---- in-page helpers (strings so they can be added with addInitScript) ----
const HELPERS = () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const tap = el => { if (!el) throw new Error('nothing to tap'); if (typeof el.click === 'function') el.click(); else el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window })); };
  // solve the step's widget by TAPS only, exactly like a child who knows the answers
  window.__solve = async () => {
    const S = WR.Learn._S(), w = S.step === 'discover' ? S.L.discover : S.L.reteach.discover, root = $('#lnW');
    if (w.kind === 'sort') for (const c of $$('#lnW .lw-pool [data-src]')) { tap(c); tap(root.querySelector(`[data-b="${w.items[+c.dataset.k].bin}"]`)); }
    if (w.kind === 'line') for (const c of $$('#lnW .lw-pool [data-src]')) { tap(c); tap(root.querySelector(`.lw-rung[data-k="${c.dataset.k}"]`)); }
    if (w.kind === 'fill') for (const it of w.items) tap(root.querySelector(`[data-t="${it.a}"]`));
    if (w.kind === 'suffix') w.items.forEach((it, k) => { if (it.need) tap(root.querySelector(`.lw-word[data-k="${k}"]`)); });
    if (w.kind === 'spots') for (const t of w.tasks) tap(root.querySelector(`.sp-${t.word}`));
    if (w.kind === 'pv') for (const n of w.targets) { for (const v of [100, 10, 1]) for (let k = 0; k < Math.floor(n % (v * 10) / v); k++) tap(root.querySelector(`.lw-block[data-v="${v}"]`)); await sleep(1000); }
    if (w.kind === 'regroup') for (let g = 0; g < 40; g++) { const b = root.querySelector('.rg-bundle'); if (!b.hidden) { tap(b); continue; } const c = root.querySelector('.rg-pile [data-src]'); if (!c) break; tap(c); }
    if (w.kind === 'groups') for (let g = 0; g < 60 && root.querySelector('.lw-pile [data-src]'); g++) { const r = $$('#lnW .lw-ring').find(x => !x.classList.contains('full')); tap(r); }
    if (w.kind === 'share') for (let g = 0; g < 20 && root.querySelector('.lw-pile [data-src]'); g++) tap(root.querySelector('.lw-deal'));
    if (w.kind === 'frac') for (const s of w.stages) { for (let k = 1; k < s.parts; k++) tap(root.querySelector('.fr-d[data-d="1"]')); tap(root.querySelector('.fr-cut'));
      for (let k = 0; k < s.shade; k++) root.querySelectorAll('.fp')[k].dispatchEvent(new MouseEvent('click', { bubbles: true })); await sleep(1300); }
    if (w.kind === 'rename') {
      for (let g = 0; g < 50; g++) {
        const u = root.querySelector('.rg-unbundle'); if (u && !u.hidden && !u.disabled) { tap(u); await sleep(20); continue; }
        const oneBtn = root.querySelector('.rg-take-one'), tenBtn = root.querySelector('.rg-take-ten');
        if (!oneBtn || !tenBtn) break;
        const left = (root.querySelector('.lw-count') || {}).textContent || '';
        if (!/still take/.test(left)) break;
        const need = left.split('still take')[1] || '';
        if (/\d+ one/.test(need) && !oneBtn.disabled) { tap(oneBtn); continue; }
        if (/\d+ ten/.test(need) && !tenBtn.disabled) { tap(tenBtn); continue; }
        break;
      }
    }
    if (w.kind === 'money') for (const n of w.targets) { for (const v of [100, 10, 1]) for (let k = 0; k < Math.floor(n % (v * 10) / v); k++) tap(root.querySelector(`.lw-block[data-v="${v}"]`)); await sleep(1000); }
    if (w.kind === 'clock') for (const want of w.targets) {
      for (let g = 0; g < 80; g++) {
        const lab = (root.querySelector('.lw-count') || {}).textContent || '';
        const mm = lab.match(/(\d+):(\d+)/); if (!mm) break;
        const h = +mm[1], min = +mm[2];
        if (h === want.h && min === want.m) break;
        if (h !== want.h) { tap(root.querySelector('[data-k="h+"]')); continue; }
        tap(root.querySelector('[data-k="m+"]'));
      }
      await sleep(1000);
    }
    if (w.kind === 'picgraph') for (let k = 0; k < w.cats.length; k++) for (let n = 0; n < w.cats[k].n; n++) tap(root.querySelector(`.pg-add[data-add="${k}"]`));
    if (w.kind === 'bar') { tap(root.querySelector('[data-src][data-v="sold"]')); tap(root.querySelector('[data-p="sold"]')); tap(root.querySelector('[data-src][data-v="add"]')); tap(root.querySelector('[data-p="add"]')); }
    if (w.kind === 'findword') for (const t of w.tasks) {
      const want = String(t.word).toLowerCase().replace(/[^\p{L}\p{N}']+/gu, '');
      const btn = $$('#lnW .lw-fword').find(b => (b.dataset.w || '') === want && !b.classList.contains('right'));
      if (!btn) throw new Error('findword: no button for ' + t.word); tap(btn); await sleep(750);
    }
    if (w.kind === 'spellhear') for (const it of w.items) {
      for (const ch of it.answer.split('')) {
        const b = $$('#lnW .lw-letter[data-src]').find(x => x.textContent === ch);
        if (!b) throw new Error('spellhear: missing letter ' + ch + ' for ' + it.answer);
        tap(b); await sleep(20);
      }
      await sleep(950);
    }
    if (w.kind === 'hearpic') for (const it of w.items) {
      const ok = it.pics.findIndex(p => p.ok);
      // pics are shuffled in the DOM; match by aria-label / label text
      const lab = it.pics[ok].label;
      const btn = $$('#lnW .lw-pic').find(b => (b.getAttribute('aria-label') || '') === lab || (b.querySelector('small') || {}).textContent === lab);
      if (!btn) throw new Error('hearpic: no pic for ' + lab); tap(btn); await sleep(950);
    }
    if (w.kind === 'shapecount') for (const s of w.stages) {
      for (let k = 0; k < s.n; k++) {
        const b = $$('#lnW .sc-hit').find(x => +x.dataset.i === k && !x.classList.contains('on'));
        if (!b) throw new Error('shapecount: missing hit ' + k + ' for ' + s.shape);
        tap(b); await sleep(20);
      }
      await sleep(950);
    }
    await sleep(50); return !$('#lnGo').hidden;
  };
  // answer the 3 checks: pattern like [true, false, true] (true = the right option)
  window.__answer = async pattern => { const notes = [];
    for (const right of pattern) { const S = WR.Learn._S(), q = S.q, want = q.options[q.answer];
      const btns = $$('.ln-opts .opt'), b = btns.find(x => (S.opts[+x.dataset.k] === want) === right); tap(b); await sleep(30);
      notes.push({ wrong: !right, note: !!$('#lnFb .why-not'), why: ($('#lnFb .why-not') || {}).textContent || '', q: q.q });
      tap($('#lnNext')); await sleep(30); }
    return notes; };
  window.__play = async (id, p1 = [true, true, true], p2 = [true, true, true]) => {
    await WR.Learn.open(id); await sleep(30); const log = { steps: [] };
    log.steps.push(WR.Learn._S().step); tap($('#lnGo'));                      // hook → discover
    log.steps.push(WR.Learn._S().step); log.ruleHiddenAtDiscover = !$('.ln-rule'); log.solved1 = await __solve();
    tap($('#lnGo')); log.steps.push(WR.Learn._S().step); log.rule = !!$('.ln-found'); tap($('#lnGo'));   // rule → check
    log.q1 = WR.Learn._S().L.check.map(q => q.q); log.n1 = await __answer(p1);
    const S = WR.Learn._S();
    if (S && S.step === 'reteach') { log.reteach = true; log.reteachText = $('.ln-rule').textContent; tap($('#lnGo'));
      if (WR.Learn._S().step === 'rdiscover') { log.solved2 = await __solve(); tap($('#lnGo')); }
      log.round2 = WR.Learn._S().round; log.q2 = WR.Learn._S().L.check2.map(q => q.q + '|' + q.options[q.answer] + '|' + (q.text || '')); log.n2 = await __answer(p2); }
    log.done = !!$('.ln-done'); log.rec = WR.Learn.rec(id); return log; };
};

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const fresh = async (W = 390, H = 844, save = SAVE) => {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
    await ctx.addInitScript(HELPERS); await ctx.addInitScript(() => { window.__WR_CLASSIC_ONLY = true; window.__WR_TEST = { holdMs: 0, pinOffer: false }; window.speechSynthesis && (window.speechSynthesis.speak = () => {}); });
    const page = await ctx.newPage(); page.errs = []; page.on('pageerror', e => page.errs.push(e.message)); page.on('dialog', d => d.dismiss());
    await page.goto(BASE + 'index.html'); await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), save);
    await page.reload(); await page.waitForSelector('.realm-node');
    await page.evaluate(() => { const f = WR.awardStars; window.__learnStars = 0; WR.awardStars = (src, key, n, o) => { const got = f(src, key, n, o); if (src === 'learn') window.__learnStars += got; return got; }; });
    return { ctx, page };
  };
  let { ctx, page } = await fresh();
  const idx = await page.evaluate(() => WR.Learn.all());
  ok(idx.length >= MIN_LESSONS, `the lesson index lists ${idx.length} lessons (≥ ${MIN_LESSONS})`);
  ok(idx.filter(l => l.at.realm === 'a1').length >= 5 && idx.filter(l => /^g2\./.test(l.at.topic || '')).length >= 5, 'pilot: 5+ A1 English and 5+ Grade 2 maths lessons');
  // the save: an old save (no learn block) migrates to the fresh shape
  ok(await page.evaluate(() => { const b = WR.block('learn'); return JSON.stringify(Object.keys(b).sort()) === '["done","opened","rounds"]' && !Object.keys(b.done).length; }), 'an old save gains an empty learn block { done, opened, rounds }');
  ok(await page.evaluate(() => WR.BLOCKS.learn && WR.BLOCKS.learn.crowned && WR.BLOCKS.learn.maps.includes('done')), 'learn is a crowned save block (cloud score counts its crowns)');

  // ---- every pilot lesson by tap, start → scroll ----
  for (const l of idx) {
    const before = await page.evaluate(() => window.__learnStars);
    const log = await page.evaluate(id => __play(id), l.id);
    const after = await page.evaluate(() => window.__learnStars);
    ok(log.steps.join(',') === 'hook,discover,rule' && log.ruleHiddenAtDiscover && log.solved1 && log.rule, `${l.id}: hook → hands-on discovery (rule hidden) solved by taps → the rule`);
    ok(log.done && !log.reteach && log.rec && log.rec.pass && log.rec.crowns === 3 && log.rec.first1 === true, `${l.id}: 3/3 checks → the scroll, passed first time, 3 crowns`);
    ok(after - before === 5, `${l.id}: first pass pays +5⭐ (${after - before})`);
  }
  ok(await page.evaluate(() => WR.state.lessonsDone) === 1 + idx.length, 'each first finish counts once in lessonsDone');
  // replays never pay (anti-farm) and don't count again
  const farm = await page.evaluate(async id => { const s0 = window.__learnStars, l0 = WR.state.lessonsDone; await __play(id); await __play(id); return { d: window.__learnStars - s0, l: WR.state.lessonsDone - l0, tries: WR.Learn.rec(id).tries }; }, 'en.a1.an');
  ok(farm.d === 0 && farm.l === 0 && farm.tries === 3, `replaying a passed lesson twice pays 0⭐ and counts no new lesson (Δ⭐ ${farm.d}, tries ${farm.tries})`);
  // the save shape in localStorage (cloud-synced as part of the whole save) + the cloud score
  const sv = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('wordRealms.save.v1')); const r = s.learn.done['m.g2.add']; return { keys: Object.keys(r).sort(), opened: s.learn.opened['en.a1.an'], score: WR.Cloud.score(s), score0: WR.Cloud.score(Object.assign({}, s, { learn: { done: {}, opened: {}, rounds: 0 } })) }; });
  ok(['at', 'best', 'crowns', 'first', 'pass', 'reteach', 'stuck', 'tries'].every(k => sv.keys.includes(k)) && ['s','d','t','n'].every(k => sv.keys.includes(k)) && sv.opened === 3, `saved per lesson: ${sv.keys.join(',')}; opened counts (${sv.opened})`);
  ok(sv.score > sv.score0, `lesson crowns add to the cloud score (${sv.score0} → ${sv.score})`);
  // 🔊 every narrated line has a recorded storyteller MP3 (tools/build_voice.py); the device voice is only the fallback
  const miss = await page.evaluate(async () => { await WR.Voice.load(); const out = [], seen = new Set();
    const walk = o => { if (Array.isArray(o)) return o.forEach(walk); if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if (k === 'say' && typeof v === 'string') seen.add(v); else if (k === 'sayEx') v.forEach(x => seen.add(x)); else walk(v); } };
    for (const l of WR.Learn.all()) walk(await WR.Learn.full(l.id));
    seen.forEach(t => { if (!WR.Voice.fileFor(t)) out.push(t); }); return { n: seen.size, out }; });
  ok(miss.n > 100 && !miss.out.length, `all ${miss.n} lesson lines have a recorded MP3 (${miss.out.slice(0, 3).join(' | ')})`);
  ok(!page.errs.length, 'no page errors playing every lesson: ' + page.errs.join(' | '));
  await ctx.close();

  // ---- the re-teach path, why-not notes, new questions; a lesson failed twice ----
  ({ ctx, page } = await fresh());
  const rt = await page.evaluate(() => __play('en.a1.be', [false, false, true], [true, true, false]));
  ok(rt.reteach && rt.round2 === 2, 're-teach: 1/3 on the first checks opens "another way" and a second round');
  ok(rt.n1.filter(n => n.wrong).every(n => n.note && n.why.length > 20), 'every wrong answer shows a why-not note for that option');
  const rule = await page.evaluate(() => WR.Learn.full('en.a1.be').then(L => L.rule.text));
  ok(rt.reteachText && !rt.reteachText.includes(rule.slice(0, 30)), 're-teach uses a different explanation from the rule');
  ok(rt.solved2 === true, 're-teach has its own hands-on widget (solved by taps)');
  ok(rt.q2.every(q => !rt.q1.includes(q.split('|')[0])), 'the second round asks NEW questions');
  ok(rt.done && rt.rec.pass && rt.rec.reteach === 1 && rt.rec.first1 === false, 'passing after the re-teach is saved as 🔁 (pass, reteach 1)');
  ok(await page.evaluate(() => WR.Learn.statusOf('en.a1.be')[0]) === '🔁', 'Grown-ups status: 🔁 after a second explanation');
  const s0 = await page.evaluate(() => window.__learnStars);
  const stuck = await page.evaluate(() => __play('m.g2.share', [false, false, false], [false, true, false]));
  ok(stuck.done && stuck.rec && !stuck.rec.pass && stuck.rec.stuck && (await page.evaluate(() => window.__learnStars)) === s0, 'failing both rounds: no ⭐, saved as 🧩 still tricky, the scroll screen still shows');
  const later = await page.evaluate(async () => { const s = window.__learnStars; const l = await __play('m.g2.share'); return { d: window.__learnStars - s, pass: l.rec.pass, stuck: l.rec.stuck }; });
  ok(later.d === 5 && later.pass && !later.stuck, 'coming back later and passing pays the first-pass ⭐ once');
  // re-teach screenshot material: the check with a why-not note
  if (process.env.SHOT) {
    await page.evaluate(async () => { await WR.Learn.open('en.a1.an'); document.querySelector('#lnGo').click(); await __solve(); document.querySelector('#lnGo').click(); document.querySelector('#lnGo').click(); });
    await page.evaluate(() => { document.querySelectorAll('.confetti-layer,.toast').forEach(e => e.remove()); const S = WR.Learn._S(), want = S.q.options[S.q.answer]; [...document.querySelectorAll('.ln-opts .opt')].find(x => S.opts[+x.dataset.k] !== want).click(); });
    await page.waitForTimeout(300); await page.screenshot({ path: OUT + 'lessons_check_whynot.png' });
  }
  ok(!page.errs.length, 'no page errors on the re-teach path: ' + page.errs.join(' | '));
  await ctx.close();

  // ---- real drags (pointer events) on sort, place value, spots, groups, line ----
  ({ ctx, page } = await fresh());
  const drag = async (from, to) => { const a = await page.$(from), b = await page.$(to); const ra = await a.boundingBox(), rb = await b.boundingBox();
    await page.mouse.move(ra.x + ra.width / 2, ra.y + ra.height / 2); await page.mouse.down();
    for (let k = 1; k <= 8; k++) await page.mouse.move(ra.x + ra.width / 2 + (rb.x + rb.width / 2 - ra.x - ra.width / 2) * k / 8, ra.y + ra.height / 2 + (rb.y + rb.height / 2 - ra.y - ra.height / 2) * k / 8);
    await page.mouse.up(); await page.waitForTimeout(60); };
  const toDiscover = async id => { await page.evaluate(async id => { await WR.Learn.open(id); document.querySelector('#lnGo').click(); }, id); await page.waitForSelector('#lnW'); };
  await toDiscover('en.a1.an');
  const items = await page.evaluate(() => WR.Learn._S().L.discover.items);
  for (let k = 0; k < items.length; k++) { await page.evaluate(() => document.querySelector('#lnW .lw-pool [data-src]').scrollIntoView({ block: 'center' }));
    const kk = await page.evaluate(() => +document.querySelector('#lnW .lw-pool [data-src]').dataset.k);
    if (k === 0) { const wrong = items[kk].bin === 'a' ? 'an' : 'a'; await drag(`#lnW .lw-pool [data-k="${kk}"]`, `#lnW [data-b="${wrong}"]`);
      ok(await page.evaluate(k => !!document.querySelector(`#lnW .lw-pool [data-k="${k}"]`) && /Hmm/.test(document.querySelector('#lnMsg').textContent), kk), 'drag to the wrong basket: the card stays and the why shows'); }
    await drag(`#lnW .lw-pool [data-k="${kk}"]`, `#lnW [data-b="${items[kk].bin}"]`); }
  ok(await page.evaluate(() => !document.querySelector('#lnW .lw-pool [data-src]') && !document.querySelector('#lnGo').hidden), 'sort: every card dragged into its basket finishes the discovery');
  await toDiscover('m.g2.place');
  for (let k = 0; k < 2; k++) await drag('#lnW .lw-block[data-v="100"]', '#lnW .lw-mat');
  ok(await page.evaluate(() => document.querySelector('[data-n="100"]').textContent) === '2', 'place value: dragging hundreds blocks onto the mat counts them');
  await page.click('#lnW .pv-minus[data-minus="100"]');
  ok(await page.evaluate(() => document.querySelector('[data-n="100"]').textContent) === '1', 'place value: ➖ takes a block back');
  await toDiscover('en.a1.place');
  await drag('#lnW .lw-token', '#lnW .sp-on');
  ok(await page.evaluate(() => !!document.querySelector('#lnW .sp-on .lw-token')), 'spots: dragging Puffbun onto the table puts it ON the table');
  await toDiscover('en.a1.this');
  await drag('#lnW .lw-token', '#lnW .sp-near');
  ok(await page.evaluate(() => !!document.querySelector('#lnW .sp-near .lw-token') && !!document.querySelector('.sc-nearfar')), 'spots nearfar: dragging Hoot onto NEAR works');
  await toDiscover('en.a1.place2');
  await drag('#lnW .lw-token', '#lnW .sp-nextto');
  ok(await page.evaluate(() => !!document.querySelector('#lnW .sp-nextto .lw-token') && !!document.querySelector('.sc-park')), 'spots park: dragging Puffbun NEXT TO the bench works');
  await toDiscover('m.g2.times');
  await drag('#lnW .lw-pile [data-src]', '#lnW .lw-ring[data-k="1"]');
  ok(await page.evaluate(() => document.querySelectorAll('#lnW .lw-ring[data-k="1"] .lw-got span').length) === 1, 'groups: dragging a mushroom into a ring adds it');
  await toDiscover('m.g2.sub');
  ok(await page.evaluate(() => !!document.querySelector('.rg-unbundle') && !document.querySelector('.rg-unbundle').hidden), 'rename: Unbundle shows when ones are not enough');
  await page.click('#lnW .rg-unbundle');
  ok(await page.evaluate(() => +document.querySelector('.lw-count').textContent.match(/(\d+) ones/)[1] >= 10), 'rename: unbundling a ten adds 10 ones');
  await toDiscover('m.g2.time');
  await page.click('#lnW [data-k="m+"]'); await page.click('#lnW [data-k="m+"]'); await page.click('#lnW [data-k="m+"]'); await page.click('#lnW [data-k="m+"]'); await page.click('#lnW [data-k="m+"]');
  ok(await page.evaluate(() => /3:25|Hands say 12:25/.test(document.querySelector('.lw-count').textContent) || document.querySelector('.lw-count').textContent.includes(':25')), 'clock: five 5-min taps move the long hand to :25');
  // 📏 line (EN-4c freq): a wrong step bounces the word back with its why; dragging each word onto its step finishes
  await toDiscover('en.a2.freq');
  const lw = await page.evaluate(() => WR.Learn._S().L.discover.items.length);
  for (let k = 0; k < lw; k++) {
    if (k === 0) { await drag('#lnW .lw-pool [data-k="0"]', '#lnW .lw-rung[data-k="4"]');
      ok(await page.evaluate(() => !!document.querySelector('#lnW .lw-pool [data-k="0"]') && /Not that step/.test(document.querySelector('#lnMsg').textContent)), 'line: a word dragged to the wrong step stays in the pool and the why shows'); }
    await page.evaluate(k => document.querySelector(`#lnW .lw-pool [data-k="${k}"]`).scrollIntoView({ block: 'center' }), k);
    await drag(`#lnW .lw-pool [data-k="${k}"]`, `#lnW .lw-rung[data-k="${k}"]`); }
  ok(await page.evaluate(() => document.querySelectorAll('#lnW .lw-rung.done .lw-chip').length === 5 && !document.querySelector('#lnW .lw-pool [data-src]') && !document.querySelector('#lnGo').hidden), 'line: every word dragged onto its step finishes the discovery');
  if (process.env.SHOT) { await toDiscover('en.a1.an'); await page.evaluate(() => { const c = document.querySelectorAll('#lnW .lw-pool [data-src]'); const it = WR.Learn._S().L.discover.items; [0, 1].forEach(j => { c[j].click(); document.querySelector(`#lnW [data-b="${it[+c[j].dataset.k].bin}"]`).click(); }); c[2].click(); });
    await page.waitForTimeout(250); await page.screenshot({ path: OUT + 'lessons_discover.png' });
    await toDiscover('m.g2.add'); await page.evaluate(() => { for (let k = 0; k < 2; k++) document.querySelector('#lnW .rg-one').click(); }); await page.waitForTimeout(250); await page.screenshot({ path: OUT + 'lessons_discover_maths.png' });
    await toDiscover('en.a1.this'); await page.waitForTimeout(250); await page.screenshot({ path: OUT + 'lessons_discover_nearfar.png' });
    await toDiscover('en.a1.place2'); await page.waitForTimeout(250); await page.screenshot({ path: OUT + 'lessons_discover_park.png' });
    await toDiscover('m.g2.sub'); await page.waitForTimeout(250); await page.screenshot({ path: OUT + 'lessons_discover_rename.png' });
    await toDiscover('m.g2.time'); await page.waitForTimeout(250); await page.screenshot({ path: OUT + 'lessons_discover_clock.png' });
    await toDiscover('en.a2.freq'); await page.evaluate(() => { const c = document.querySelector('#lnW .lw-pool [data-k="0"]'); c.click(); document.querySelector('#lnW .lw-rung[data-k="0"]').click(); }); await page.waitForTimeout(250); await page.screenshot({ path: OUT + 'lessons_discover_line.png' }); }
  ok(!page.errs.length, 'no page errors while dragging: ' + page.errs.join(' | '));
  await ctx.close();

  // ---- chips, hint links, nudges, Backpack, Grown-ups ----
  ({ ctx, page } = await fresh());
  await page.evaluate(() => WR.go('realm', 'a1'));
  if (process.env.SHOT) { await page.evaluate(() => document.querySelector('.path-grid').scrollIntoView({ block: 'start' })); await page.waitForTimeout(400); await page.screenshot({ path: OUT + 'lessons_realm_chips.png' });
    await page.evaluate(() => WR.Learn.open('m.g2.times')); await page.waitForTimeout(600); await page.screenshot({ path: OUT + 'lessons_hook.png' }); await page.evaluate(() => WR.go('realm', 'a1')); }
  const chips = await page.evaluate(() => [...document.querySelectorAll('.skill-card[data-k]')].map(c => ({ k: c.dataset.k, chip: c.querySelector('.learn-chip') ? c.querySelector('.learn-chip').getAttribute('aria-label') : '' })));
  ok(chips.find(c => c.k === 'grammar').chip.includes('12 lessons') && chips.find(c => c.k === 'vocab').chip.includes('4 lessons') && chips.find(c => c.k === 'listening').chip.includes('2 lessons'), `the Learn chip sits inside the skill cards (${chips.map(c => c.k + ':' + c.chip.trim()).join(' · ')})`);
  ok(await page.evaluate(() => document.querySelectorAll('.path-grid > .skill-card').length === WR.SKILLS.length), 'no new tiles on Today\'s path');
  await page.click('.skill-card[data-k="grammar"] .learn-chip'); await page.waitForSelector('.ln-pick-row');
  ok(await page.evaluate(() => document.querySelectorAll('.ln-pick-row').length === 12 && WR.current() === 'realm'), 'a skill with 12 lessons opens a list (and does not start the practice round)');
  await page.click('.ln-pick-row[data-id="en.a1.plural"]'); await page.waitForSelector('.ln-card');
  ok(await page.evaluate(() => WR.current() === 'learn' && WR.Learn._S().id === 'en.a1.plural' && document.body.classList.contains('wr-focus')), 'the list opens that lesson in focus mode');
  await page.click('#lnQuit'); await page.waitForTimeout(100);
  ok(await page.evaluate(() => WR.current() === 'realm'), '← Leave goes back to the realm');
  await page.click('.skill-card[data-k="vocab"] .learn-chip'); await page.waitForSelector('.ln-pick-row');
  ok(await page.evaluate(() => document.querySelectorAll('.ln-pick-row').length === 4 && WR.current() === 'realm'), 'vocab with 4 lessons opens a list');
  await page.click('.ln-pick-row[data-id="en.a1.place"]'); await page.waitForSelector('.ln-card');
  ok(await page.evaluate(() => WR.Learn._S().id === 'en.a1.place'), 'the vocab list opens en.a1.place');
  // English practice: 📜 corner button + link under a wrong answer (matching item), none in a boss round
  const mcq = { type: 'mcq', q: 'This is ___ apple.', options: ['an', 'a', 'the'], correct: 'an', explain: 'Use an before a vowel sound.', notes: { a: 'Apple starts with a vowel sound.' } };
  await page.evaluate(it => WR.startLesson({ realm: 'a1', skill: 'grammar', key: 'grammar', title: 'Grammar', items: [it, { ...it }] }), mcq);
  await page.waitForSelector('.qcard');
  const corner = await page.evaluate(() => { const b = document.querySelector('.qcard .ltools [data-scroll]'); if (!b) return null; const r = b.getBoundingClientRect(); return { id: b.dataset.scroll, w: r.width, h: r.height }; });
  ok(corner && corner.id === 'en.a1.an' && Math.round(corner.w) >= 44 && Math.round(corner.h) >= 44, `English round: a 📜 corner button for the matching lesson (${JSON.stringify(corner)})`);
  await page.click('.qcard .ltools [data-scroll]'); await page.waitForSelector('.ln-scroll-modal');
  ok(await page.evaluate(() => /vowel|bridge|a, e, i, o/i.test(document.querySelector('.ln-scroll-modal').textContent) && !!document.querySelector('#scBack')), 'it opens the scroll over the question, with "Back to my question"');
  await page.click('#scBack'); await page.waitForTimeout(80);
  await page.evaluate(() => [...document.querySelectorAll('.opt')].find(b => b.textContent.endsWith('the')).click()); await page.waitForTimeout(80);
  ok(await page.evaluate(() => !!document.querySelector('#explain .ln-hintlink [data-scroll="en.a1.an"]')), 'a wrong answer adds a 📜 Scroll link under the why-not note');
  await page.evaluate(it => WR.startLesson({ realm: 'a1', skill: 'grammar', key: 'grammar', title: 'Boss', mode: 'boss', noTimer: true, items: [it] }), mcq); await page.waitForSelector('.qcard');
  ok(await page.evaluate(() => !document.querySelector('.qcard [data-scroll]')), 'no 📜 button in a boss round');
  // weak English result → nudge to the first lesson not yet passed on that skill
  await page.evaluate(it => WR.startLesson({ realm: 'a1', skill: 'grammar', key: 'grammar', title: 'Grammar', items: [it] }), mcq); await page.waitForSelector('.qcard');
  await page.evaluate(() => [...document.querySelectorAll('.opt')].find(b => b.textContent.endsWith('the')).click()); await page.click('#nextBtn'); await page.waitForSelector('.result');
  ok(await page.evaluate(() => document.querySelector('#lnNudge') && document.querySelector('#lnNudge').dataset.id === 'en.a1.an'), 'a weak result offers "Learn it →" for the skill\'s first lesson (soft nudge, practice stays open)');
  await page.click('#lnNudge'); await page.waitForSelector('.ln-card');
  ok(await page.evaluate(() => WR.Learn._S().id === 'en.a1.an'), 'the nudge opens the lesson');
  // maths: chip on the topic card, 📜 link in the Hint panel and under a wrong answer
  await page.evaluate(() => WR.go('math', 2)); await page.waitForSelector('[data-t="g2.add"]');
  ok(await page.evaluate(() => !!document.querySelector('[data-t="g2.add"] .learn-chip') && !!document.querySelector('[data-t="g2.share"] .learn-chip')), 'maths topic cards carry the Learn chip');
  await page.click('[data-t="g2.frac"] .learn-chip'); await page.waitForSelector('.ln-card');
  ok(await page.evaluate(() => WR.Learn._S().id === 'm.g2.frac'), 'the topic chip opens its lesson, not the practice');
  await page.evaluate(() => WR.Math.startLesson({ topic: 'g2.add' })); await page.waitForSelector('#hintBtn'); await page.click('#hintBtn');
  ok(await page.evaluate(() => !!document.querySelector('#mexplain [data-scroll="m.g2.add"]')), 'maths 💡 Hint panel links the 📜 scroll');
  await page.click('#mexplain [data-scroll]'); await page.waitForSelector('.ln-scroll-modal');
  ok(await page.evaluate(() => /carry|ten/i.test(document.querySelector('.ln-scroll-modal').textContent)), 'the maths scroll opens over the question');
  await page.click('#scBack');
  // the 🎒 Backpack (from the home pill) and the scroll shelf
  await page.evaluate(async () => { await __play('en.a1.an'); await __play('m.g2.times', [false, false, false], [false, false, true]); WR.go('home'); });
  ok(await page.evaluate(() => !document.querySelector('#bagPill')), 'phones keep the 2 short home pills (no Backpack pill there, N4)');
  await page.evaluate(() => WR.go('realm', 'a1'));
  ok(await page.evaluate(() => /Backpack: 2 of/.test((document.querySelector('#realmBag') || { getAttribute: () => '' }).getAttribute('aria-label'))), 'the realm shows the 🎒 Backpack pill with the scroll count');
  await page.click('#realmBag'); await page.waitForSelector('.bp-shelf');
  const shelf = await page.evaluate(() => ({ got: document.querySelectorAll('.bp-scroll.got').length, stuck: document.querySelectorAll('.bp-scroll.stuck').length, todo: document.querySelectorAll('.bp-scroll.todo').length }));
  ok(shelf.got === 1 && shelf.stuck === 1 && shelf.todo === idx.length - 2, `the Backpack shelf: 1 scroll earned, 1 still tricky, the rest waiting (${JSON.stringify(shelf)})`);
  if (process.env.SHOT) { await page.waitForTimeout(400); await page.screenshot({ path: OUT + 'lessons_scrolls.png' }); }
  await page.click('.bp-scroll.got'); await page.waitForSelector('.ln-scroll-modal');
  ok(await page.evaluate(() => !!document.querySelector('#scPlay')), 'an earned scroll opens to read again, with "Learn it again"');
  await page.click('#scClose');
  // 👪 Grown-ups: the summary line in the modal and the 📜 Lessons card in the Learning Report
  await page.evaluate(() => WR.openGrownups()); await page.waitForSelector('.pgate');
  const pass = async () => { const a = await page.evaluate(() => WR.parentGate._answer()); for (const d of a) await page.click(`.pgate [data-d="${d}"]`); await page.click('#pgOk'); };
  await pass(); await page.waitForSelector('#guReport');
  ok(await page.evaluate(() => /Lessons: 1\/\d+ learned · 1 still tricky/.test(document.querySelector('.ln-grown-line').textContent)), 'the Grown-ups modal sums up lessons: ' + await page.evaluate(() => (document.querySelector('.ln-grown-line') || {}).textContent));
  await page.click('#guReport'); await page.waitForSelector('.ln-report');
  const rep = await page.evaluate(() => [...document.querySelectorAll('.ln-rtab tr')].map(r => r.cells[0].getAttribute('aria-label') + '|' + r.textContent));
  ok(rep.length === idx.length && rep.some(r => r.startsWith('learned first') && /a or an/.test(r)) && rep.some(r => r.startsWith('still tricky') && /groups/.test(r)) && rep.some(r => r.startsWith('not started')), `the Learning Report has a 📜 Lessons card with ✅ / 🧩 / ○ per lesson (${rep.length} rows)`);
  if (process.env.SHOT) { await page.evaluate(() => document.querySelector('.ln-report').scrollIntoView({ block: 'start' })); await page.waitForTimeout(300); await page.screenshot({ path: OUT + 'lessons_grownups.png' }); }
  ok(!page.errs.length, 'no page errors on chips / links / backpack / report: ' + page.errs.join(' | '));
  await ctx.close();

  // ---- phones 320–412: every step of every lesson fits, targets ≥ 44 px ----
  const audit = () => {
    const sw = document.documentElement.scrollWidth - innerWidth, small = [], out = [];
    document.querySelectorAll('#main button:not([disabled]), #main [data-tgt], #main input, .modal button').forEach(e => {
      const r = e.getBoundingClientRect(); if (!r.width || getComputedStyle(e).visibility === 'hidden') return;
      if (e.closest('#navbar')) return;
      if (r.width < 43.5 || r.height < 43.5) small.push((e.id || e.className || e.tagName) + ` ${Math.round(r.width)}×${Math.round(r.height)}`);
      if (r.left < -0.5 || r.right > innerWidth + 0.5) out.push(e.id || e.className);
      if (e.matches('.learn-chip:not(.corner), .lw-chip, .lw-word, .opt, .bag-pill') && e.scrollWidth > e.clientWidth + 1) small.push('squeezed ' + e.className + ` (${e.scrollWidth}>${e.clientWidth})`); });
    return { sw, small, out };
  };
  for (const [W, H] of PROFILES) {
    ({ ctx, page } = await fresh(W, H)); await page.evaluate(`window.__audit = ${audit.toString()}`);
    const bad = [];
    for (const l of idx) {
      const steps = await page.evaluate(async id => { const res = []; const A = window.__audit;
        await WR.Learn.open(id); res.push(['hook', A()]); document.querySelector('#lnGo').click(); res.push(['discover', A()]);
        await __solve(); res.push(['discover-done', A()]); document.querySelector('#lnGo').click(); res.push(['rule', A()]); document.querySelector('#lnGo').click(); res.push(['check', A()]);
        const S = WR.Learn._S(); [...document.querySelectorAll('.ln-opts .opt')].find(x => S.opts[+x.dataset.k] !== S.q.options[S.q.answer]).click(); res.push(['why-not', A()]);
        return res; }, l.id).catch(e => [['error', { sw: 0, small: [], out: [e.message] }]]);
      if (!steps.length) await page.evaluate(() => 0);
      for (const [st, a] of steps) if (a.sw > 0 || a.small.length || a.out.length) bad.push(`${l.id}/${st}: sw ${a.sw} small[${a.small.join(', ')}] out[${a.out.join(', ')}]`);
    }
    ok(!bad.length, `${W}px: every lesson step fits (no sideways scroll, targets ≥ 44 px, on screen)${bad.length ? '\n   ' + bad.join('\n   ') : ''}`);
    for (const [name, go] of [['realm', () => WR.go('realm', 'a1')], ['maths hub', () => WR.go('math', 2)], ['backpack', () => WR.go('scrolls')]]) {
      await page.evaluate(go); await page.waitForTimeout(150);
      const a = await page.evaluate(() => { const r = window.__audit(); r.small = r.small.filter(s => /learn-chip|bag-pill|bp-scroll|squeezed/.test(s)); return r; });
      ok(a.sw <= 0 && !a.small.length, `${W}px ${name}: Learn chips / Backpack fit and are ≥ 44 px (${a.small.join(', ')})`);
    }
    // the maths bubble fix holds with the 📜 link in the Hint panel
    await page.evaluate(() => WR.Math.startLesson({ topic: 'g2.add' })); await page.waitForSelector('#hintBtn'); await page.click('#hintBtn'); await page.waitForTimeout(100);
    const mb = await page.evaluate(() => { const b = document.getElementById('lbubble').getBoundingClientRect(), l = document.querySelector('#mexplain [data-scroll]').getBoundingClientRect(); return { bw: b.width, lw: l.width, lh: l.height, sw: document.documentElement.scrollWidth - innerWidth }; });
    ok(mb.bw >= 120 && mb.lh >= 44 && mb.sw <= 0, `${W}px maths round: pet bubble still ${Math.round(mb.bw)} px wide, 📜 link ${Math.round(mb.lw)}×${Math.round(mb.lh)}, no sideways scroll`);
    ok(!page.errs.length, `${W}px: no page errors: ` + page.errs.join(' | '));
    await ctx.close();
  }
  await browser.close();
  console.log(`\n${passes} passed, ${fails} failed`);
})().catch(e => { console.error(e); process.exit(1); });
