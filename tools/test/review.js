// 📱 Phone review check (REVIEW-2026-10-30.md, T1–T15 + T19 layout): at 375×667, 360×780, 320×658, 844×390 and desktop
//   • no sideways overflow (innerWidth === viewport width, scrollWidth ≤ innerWidth) on every screen, also during confetti
//   • every visible tappable thing is at least 40×40 px (checkboxes count their <label>)
//   • lesson: the question and all options are on screen without scrolling (375×667, 360×780, 844×390; boss + listening too)
//   • home: "▶ Continue" and the first realm card are on screen; result: the "Next" button is on screen
//   • onboarding: every step fits with its Next button visible; reading has no nested scroll box at ≤ 520 px;
//     speaking mic visible; all 12 maths grades reachable; parent gate fits with its number pad; no console errors
// node tools/test/review.js            (SHOT=before|after saves screenshots/review_<SHOT>_<profile>_<screen>.png)
// BASE=https://jere8899-collab.github.io/word-realms/ node tools/test/review.js   runs it against the live site
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const SHOT = process.env.SHOT || '';
const OUT = '/workspace/cefr-quest/screenshots/';
const SOFT = !!process.env.SOFT;            // SOFT=1: report problems but exit 0 (used for the "before" run)
let fails = 0, passes = 0; const failList = [];
const ok = (c, m) => { if (!c) { fails++; failList.push(m); console.error('FAIL', m); if (!SOFT) process.exitCode = 1; } else { passes++; if (process.env.VERBOSE) console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const save = () => ({ v: 1, name: 'Jeremy', avatar: 'avatar_girl', startLevel: 'a1', stars: 60, totalCorrect: 60, totalAnswered: 65,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 120, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 2, last: today() }, progress: { a1: { grammar: { best: 0.9, plays: 1 } } }, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: false }, mistakes: [], lessonsDone: 6, math: { grade: 3 } });
const M = { viewport: null, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const PROFILES = [
  { name: 'se', ...M, viewport: { width: 375, height: 667 }, fit: true, portrait: true },
  { name: 'galaxy', ...M, viewport: { width: 360, height: 780 }, fit: true, portrait: true },
  { name: 'narrow', ...M, viewport: { width: 320, height: 658 }, fit: false, portrait: true },
  { name: 'land', ...M, viewport: { width: 844, height: 390 }, fit: true, portrait: false },
  { name: 'desktop', viewport: { width: 1280, height: 800 }, fit: false, portrait: false }];
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;

// ---------- in-page probes ----------
const overflow = () => ({ iw: innerWidth, sw: document.documentElement.scrollWidth, bw: document.body.scrollWidth });
const audit = () => {
  const SEL = 'button,a[href],input,select,textarea,[role=button],[onclick],.opt,.mcard,.tile,.pick,.realm-node,.skill-card,.quill-task,.mirror-pick,.cc-pick,#petCard,#ccOnb,#gardenNudge,.pill[id],.book-row,.gchip';
  const modal = [...document.querySelectorAll('.modal-bg')].pop();
  const scope = modal || document;
  const vis = el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && +cs.opacity > 0.05 && !el.closest('[hidden]') && !el.closest('details:not([open]) > :not(summary)'); };
  const desc = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '') + ' "' + (e.innerText || e.value || e.getAttribute('aria-label') || '').trim().slice(0, 22).replace(/\s+/g, ' ') + '"';
  const small = [];
  for (const el of scope.querySelectorAll(SEL)) {
    if (!vis(el)) continue;
    if (el.type === 'hidden') continue;
    if (getComputedStyle(el).display === 'inline' && el.closest('p,.story-text,.passage,.explain,.q-brief')) continue;   // inline words in running text
    let r = el.getBoundingClientRect();
    if ((el.type === 'checkbox' || el.type === 'radio') && el.closest('label')) r = el.closest('label').getBoundingClientRect();
    if (el.parentElement && el.parentElement.closest(SEL) && !el.matches('button,input,select,textarea,a[href]')) continue;
    if (Math.min(r.width, r.height) < 39.5) small.push(desc(el) + ` ${Math.round(r.width)}×${Math.round(r.height)}`);
  }
  return small;
};
// fully on screen, and not hidden under the bottom bar / anything else
const onScreen = sel => { const els = typeof sel === 'string' ? [...document.querySelectorAll(sel)] : sel; if (!els.length) return { ok: false, why: 'missing ' + sel };
  for (const el of els) { const r = el.getBoundingClientRect(); if (r.top < -1 || r.bottom > innerHeight + 1 || r.left < -1 || r.right > innerWidth + 1) return { ok: false, why: `${el.id || el.className} at ${Math.round(r.top)}–${Math.round(r.bottom)} (screen ${innerHeight})` };
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 20)); if (!hit || !(el === hit || el.contains(hit) || hit.contains(el))) return { ok: false, why: `${el.id || el.className} covered by ${hit && (hit.id || hit.className)}` }; }
  return { ok: true }; };
const nested = () => { const out = []; document.querySelectorAll('#main *').forEach(e => { const cs = getComputedStyle(e); if (/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 4 && e.clientHeight > 0) out.push(e.className || e.tagName); }); return out; };

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const P of PROFILES) {
    if (ONLY && !ONLY.includes(P.name)) continue;
    const { name, fit, portrait, ...opts } = P;
    const ctx = await browser.newContext({ ...opts, reducedMotion: 'no-preference' });
    await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
    const page = await ctx.newPage(); const errs = [];
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_FAILED|cloud library|supabase/i.test(m.text())) errs.push('console: ' + m.text()); });
    const W = opts.viewport.width;
    try {
    const shot = async (label) => { if (SHOT) await page.screenshot({ path: `${OUT}review_${SHOT}_${name}_${label}.png` }); };
    const screen = async (label, { noTargets = false } = {}) => {
      await page.waitForTimeout(400);
      const o = await page.evaluate(overflow);
      ok(o.iw === W && o.sw <= W, `${name} ${label}: no sideways overflow (innerWidth ${o.iw}, scrollWidth ${o.sw}, want ${W})`);
      if (!noTargets) { const s = await page.evaluate(audit); ok(s.length === 0, `${name} ${label}: tap targets ≥ 40 px` + (s.length ? '\n     - ' + s.slice(0, 12).join('\n     - ') + (s.length > 12 ? `\n     … +${s.length - 12}` : '') : '')); }
    };
    const vis = async (label, sel, hard = true) => { await page.evaluate(() => window.scrollTo(0, 0)); const r = await page.evaluate(onScreen, sel); if (hard) ok(r.ok, `${name} ${label}: ${sel} visible without scrolling ${r.ok ? '' : '(' + r.why + ')'}`); else if (!r.ok) console.log(`  note ${name} ${label}: ${sel} not fully visible (${r.why})`); return r.ok; };
    const answerRight = async () => { const ans = await page.evaluate(() => WR._dbg()); const opts2 = await page.$$('.opt'); for (const b of opts2) { const t = (await b.innerText()).replace(/^[A-D]\s*/, '').trim(); if (t === String(ans).trim()) { await b.click(); return true; } } await opts2[0].click(); return false; };

    /* ---- onboarding: every step fits ---- */
    await page.goto(BASE + 'index.html'); await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('#nm');
    await screen('onboarding1'); await shot('onboard1');
    if (portrait) await vis('onboarding step 1', '#n1');
    await page.fill('#nm', 'Jeremy'); await page.click('#n1');
    let step = 2;
    for (; step < 6; step++) {
      await page.waitForTimeout(350);
      if (await page.$('#go')) break;
      const nx = await page.$(`#n${step}`); if (!nx) break;
      await screen('onboarding' + step); await shot('onboard' + step);
      if (portrait) await vis(`onboarding step ${step}`, `#n${step}`);
      await nx.click();
    }
    await page.waitForSelector('#go'); await screen('onboarding_last'); await shot('onboard_last');
    if (portrait) await vis('onboarding last step', '#go');
    await page.click('#go'); await page.waitForSelector('.realm-node');
    // the welcome celebration: no overflow while confetti falls, gone after moving on
    await page.waitForTimeout(250);
    const oc = await page.evaluate(overflow); ok(oc.sw <= W, `${name} welcome confetti: no sideways overflow (${oc.sw})`);
    await page.waitForTimeout(400); await page.evaluate(() => WR.go('shop')); await page.waitForTimeout(150);
    const leftovers = await page.evaluate(() => document.querySelectorAll('.confetti,.toast').length);
    ok(leftovers === 0, `${name}: confetti and toasts are cleared when moving to another screen (${leftovers} left)`);

    /* ---- seeded player: home ---- */
    await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), save());
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForSelector('.realm-node');
    await screen('home'); await shot('home');
    if (portrait) { await vis('home', '#continueBtn'); await vis('home', '.map > .realm-node:nth-child(2)'); }
    else if (fit) { await vis('home', '#continueBtn'); }
    const navTabs = await page.evaluate(() => [...document.querySelectorAll('#navbar button')].map(b => { const r = b.getBoundingClientRect(); return r.left >= -1 && r.right <= innerWidth + 1 && r.width > 30; }));
    ok(navTabs.length === 5 && navTabs.every(Boolean), `${name}: all 5 tabs fully visible (${navTabs})`);
    const devText = await page.evaluate(() => /in bank|questions in the realms|speaking prompts|writing tasks|Voice:|payments not live|not needed to unlock/.test(document.getElementById('main').innerText));
    ok(!devText, `${name} home: no developer text`);

    /* ---- realm screen ---- */
    await page.evaluate(() => WR.go('realm', 'a1')); await page.waitForSelector('.skill-card');
    await screen('realm'); await shot('realm');
    const devRealm = await page.evaluate(() => (document.getElementById('main').innerText.match(/in bank|not needed to unlock|prompts ·/) || [''])[0]);
    ok(!devRealm, `${name} realm: no developer text (${devRealm})`);

    /* ---- grammar + vocab lesson ---- */
    for (const [rid, skill] of [['a1', 'grammar'], ['a2', 'vocab'], ['b1', 'grammar']]) {
      await page.evaluate(([r, k]) => WR.startLesson({ realm: r, skill: k, key: k, title: k }), [rid, skill]);
      // a sentence-builder (order) item has tiles instead of options: retry until the lesson opens on a multiple-choice one
      for (let t = 0; t < 6 && (await page.waitForSelector('.opt, #pool .tile'), await page.$('#pool .tile')); t++) await page.evaluate(([r, k]) => WR.startLesson({ realm: r, skill: k, key: k, title: k }), [rid, skill]);
      await page.waitForSelector('.opt'); await screen(`lesson ${rid} ${skill}`);
      if (rid === 'a1') await shot('lesson_q');
      const navHidden = await page.evaluate(() => { const n = document.getElementById('navbar'); return getComputedStyle(n).display === 'none' || n.getBoundingClientRect().top >= innerHeight; });
      ok(navHidden, `${name} lesson: bottom tab bar hidden during the lesson`);
      if (fit) { await vis(`lesson ${rid} ${skill} question`, '.qtext'); await vis(`lesson ${rid} ${skill} options`, '.opt'); }
      else await vis(`lesson ${rid} ${skill} options`, '.opt', false);
    }
    // boss (timed): question + options visible, and the timer does not run while they are off screen
    await page.evaluate(() => WR.startLesson({ realm: 'b2', skill: 'grammar', key: 'grammar', title: 'Boss' }));
    for (let t = 0; t < 6 && (await page.waitForSelector('.opt, #pool .tile'), await page.$('#pool .tile')); t++) await page.evaluate(() => WR.startLesson({ realm: 'b2', skill: 'grammar', key: 'grammar', title: 'Boss' }));
    await page.waitForSelector('.opt'); await screen('boss'); await shot('boss');
    if (fit) { await vis('boss question', '.qtext'); await vis('boss options', '.opt'); }
    // a wrong answer, then the result screen
    await page.evaluate(() => WR.startLesson({ realm: 'a1', skill: 'grammar', key: 'grammar', title: 'Grammar · Picture Pop' }));
    for (let i = 0; i < 8; i++) {
      await page.waitForSelector('.opt:not([disabled]), #pool .tile');
      if (await page.$('#pool .tile')) {   // a sentence-builder item (a1 grammar has a few): build it (wrongly on i === 1), then check
        const ans = String(await page.evaluate(() => WR._dbg())).split(' ');
        const words = i === 1 ? [...ans].reverse() : ans;
        for (const w of words) await page.evaluate(w => { const t = [...document.querySelectorAll('#pool .tile')].find(b => b.textContent.trim() === w); if (t) t.click(); }, w);
        await page.click('#checkBtn'); await page.waitForSelector('#nextBtn');
        if (i === 1) { await page.waitForTimeout(500); const nb = await page.evaluate(onScreen, '#nextBtn'); ok(nb.ok, `${name} lesson: Next button lands on screen after answering (${nb.why || ''})`); }
        await page.click('#nextBtn'); continue;
      }
      if (i === 1) { const ans = await page.evaluate(() => WR._dbg()); const bs = await page.$$('.opt'); for (const b of bs) { const t = (await b.innerText()).replace(/^[A-D]\s*/, '').trim(); if (t !== String(ans).trim()) { await b.click(); break; } } }
      else await answerRight();
      await page.waitForSelector('#nextBtn');
      if (i === 1) { await page.waitForTimeout(500); await screen('lesson_wrong'); if (P.name === 'se') await shot('lesson_wrong'); const nb = await page.evaluate(onScreen, '#nextBtn'); ok(nb.ok, `${name} lesson: Next button lands on screen after answering (${nb.why || ''})`); }
      await page.click('#nextBtn');
    }
    await page.waitForSelector('.result'); await page.waitForTimeout(300);
    const oconf = await page.evaluate(overflow); ok(oconf.sw <= W, `${name} result confetti: no sideways overflow (${oconf.sw})`);
    await screen('result'); await shot('result');
    if (fit || portrait) await vis('result', '#nextStep');

    /* ---- listening: play button + first option ---- */
    await page.evaluate(() => WR.startLesson({ realm: 'a1', skill: 'listening', key: 'listening', title: 'Listening' }));
    await page.waitForSelector('#playBtn'); await screen('listening'); await shot('listening');
    const devL = await page.evaluate(() => /Voice:/.test(document.getElementById('main').innerText)); ok(!devL, `${name} listening: no voice name shown`);
    if (fit) { await vis('listening', '#playBtn'); await vis('listening first option', '.opt:first-child'); }
    /* ---- reading: no nested scroll at ≤ 520 px ---- */
    await page.evaluate(() => WR.startLesson({ realm: 'c2', skill: 'reading', key: 'reading', title: 'Reading' }));
    await page.waitForSelector('.opt'); await screen('reading'); await shot('reading');
    if (W <= 520) { const n = await page.evaluate(nested); ok(n.length === 0, `${name} reading: no nested scroll areas (${n})`); }
    // question 2 of the same story: a 📜 Story chip on phones
    await answerRight(); await page.waitForSelector('#nextBtn'); await page.click('#nextBtn'); await page.waitForSelector('.opt');
    if (W <= 520) { const chip = !!await page.$('#storyChip'); ok(chip, `${name} reading q2: 📜 Story chip shown`); if (chip) { await page.click('#storyChip'); await page.waitForSelector('.story-sheet'); await screen('reading_sheet', { noTargets: true }); await shot('reading_sheet'); await page.click('#sheetClose'); } }
    if (fit) await vis('reading q2 first option', '.opt:first-child');
    /* ---- speaking: mic visible ---- */
    await page.evaluate(() => WR.startSpeaking('a1', { mode: 'mic' }));
    await page.waitForSelector('#quitBtn'); await page.waitForTimeout(300); await screen('speaking'); await shot('speaking');
    if (fit && await page.$('#micBtn')) await vis('speaking', '#micBtn');
    if (fit && !await page.$('#micBtn')) await vis('speaking', '.selfbtn');
    /* ---- writing: keyboard hides the bar ---- */
    await page.evaluate(() => WR.startWriting('a1')); await page.waitForSelector('.quill-task'); await screen('writing');
    await page.click('.quill-task'); await page.waitForTimeout(400); await screen('writing_task');
    /* ---- other screens ---- */
    for (const sc of ['pet', 'shop', 'review', 'math', 'dojo']) {
      await page.evaluate(s => WR.go(s), sc); await page.waitForTimeout(300); await screen(sc); await shot(sc);
    }
    await page.evaluate(() => WR.go('math')); await page.waitForSelector('.gchip');
    const gr = await page.evaluate(() => [...document.querySelectorAll('.gchip')].map(b => { const r = b.getBoundingClientRect(); const box = b.parentElement.getBoundingClientRect(); return r.left >= box.left - 1 && r.right <= box.right + 1; }));
    ok(gr.length === 12 && gr.every(Boolean), `${name} maths: all 12 grade chips reachable without hidden sideways scrolling (${gr.filter(Boolean).length}/12)`);
    const devM = await page.evaluate(() => { const m = document.getElementById('main').cloneNode(true); m.querySelectorAll('details:not([open])').forEach(d => d.querySelectorAll(':scope > :not(summary)').forEach(x => x.remove())); return /P1–P6 = Grades/.test(m.innerText); });
    ok(!devM, `${name} maths: syllabus mapping tucked away from children`);
    await page.evaluate(() => WR.Math.startLesson({ grade: 3 })); await page.waitForTimeout(400); await screen('math_lesson'); await shot('math_lesson');
    /* ---- settings + parent gate ---- */
    await page.evaluate(() => WR.go('home')); await page.click('#setBtn'); await page.waitForTimeout(300); await screen('settings'); await shot('settings');
    await page.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove()));
    await page.evaluate(() => WR.go('shop')); await page.waitForTimeout(200);
    const devS = await page.evaluate(() => /payments not live|💳|Buy with cash|\$|S\$|SGD/.test(document.getElementById('main').innerText));
    ok(!devS, `${name} shop: no cash/price wording before the grown-up gate`);
    if (await page.$('#grownups')) {
      await page.click('#grownups'); await page.waitForSelector('.pgate'); await screen('parent_gate'); await shot('parent_gate');
      if (portrait || fit) { await vis('parent gate', '.pgate .pad button'); await vis('parent gate OK', '#pgOk'); }
      await page.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove()));
    } else ok(false, `${name} shop: 👪 Grown-ups button present`);
    } catch (e) { ok(false, `${name}: run stopped: ${e.message.split('\n')[0]}`); }
    ok(errs.length === 0, `${name}: no console errors ${errs.join(' | ')}`);
    await ctx.close();
  }
  /* reduced motion: no confetti at all */
  if (!ONLY) {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, reducedMotion: 'reduce', isMobile: true, hasTouch: true });
    await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
    const page = await ctx.newPage(); await page.goto(BASE + 'index.html');
    await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), save()); await page.reload({ waitUntil: 'networkidle' }); await page.waitForSelector('.realm-node');
    const n = await page.evaluate(() => { WR.confetti(30); return document.querySelectorAll('.confetti').length; });
    ok(n === 0, `reduced motion: no confetti (${n} pieces)`);
    const anim = await page.evaluate(() => getComputedStyle(document.querySelector('.sparkles')).display);
    ok(anim === 'none', `reduced motion: background sparkles off (${anim})`);
    await ctx.close();
  }
  await browser.close();
  console.log(`\nreview: ${passes} passed, ${fails} failed`);
  if (fails) console.log('failed:\n- ' + failList.map(f => f.split('\n')[0]).join('\n- '));
})();
