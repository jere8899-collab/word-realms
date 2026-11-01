// 🎨 Painted icons (js/icons.js): on the main phone screens no emoji may be left in the rendered text, and every
// .wr-icon / SVG icon must load real art. Also checks the helper API and the emoji fallback when art fails.
// SHOT=before|after  → screenshots/icons_<shot>_<screen>.png (390x844 phone).  BASE=… runs against another copy
// (e.g. BASE=https://jere8899-collab.github.io/word-realms/ SHOT=before CHECK=0 for "before" shots of the live site).
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const SHOT = process.env.SHOT || '', CHECK = process.env.CHECK !== '0';
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else console.log('ok', m); };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const save = () => ({ v: 1, name: 'Jeremy', avatar: 'avatar_girl', startLevel: 'a1', stars: 60, totalCorrect: 60, totalAnswered: 65,
  pet: { species: 'pet_fox', name: 'Mochi', xp: 120, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 2, last: today() }, progress: { a1: { grammar: { best: 0.9, plays: 1 } } }, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 6 });

// in the page: visible text that still holds an emoji, and icons that did not load
const audit = () => {
  const EP = /\p{Extended_Pictographic}/u, bad = new Map();
  const skip = n => { for (let e = n.parentElement; e; e = e.parentElement) { if (/^(SCRIPT|STYLE|TEXTAREA|INPUT|SELECT|OPTION|TITLE)$/.test(e.nodeName) || e.isContentEditable || e.classList.contains('katex') || e.hasAttribute('data-noicon')) return true; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return true; } return false; };
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    if (!EP.test(n.nodeValue) || skip(n)) continue;
    [...n.nodeValue].filter(c => EP.test(c) && !/[\u00a9\u00ae\u2122]/.test(c)).forEach(c => bad.set(c, (n.parentElement.className || n.parentElement.nodeName) + ': ' + n.nodeValue.trim().slice(0, 40)));
  }
  const imgs = [...document.querySelectorAll('img.wr-icon')];
  const broken = imgs.filter(i => i.complete && !i.naturalWidth).map(i => i.getAttribute('src'));
  const pending = imgs.filter(i => !i.complete).length;
  const svgs = document.querySelectorAll('g.wr-icon-svg image, svg image[href^="assets/icons/"]').length;
  return { emoji: [...bad.entries()], icons: imgs.length, broken, pending, svgs };
};

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
  const page = await ctx.newPage(); const errs = [], miss = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('response', r => { if (/assets\/icons\//.test(r.url()) && !/does-not-exist/.test(r.url()) && r.status() >= 400) miss.push(r.url()); });
  const screen = async (label, go, wait) => {
    await page.evaluate(go); if (wait) await page.waitForSelector(wait, { timeout: 8000 });
    await page.waitForTimeout(700);
    await page.evaluate(() => Promise.all([...document.images].filter(i => !i.complete).map(i => new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 3000); }))));
    if (SHOT) await page.screenshot({ path: `${OUT}icons_${SHOT}_${label}.png` });
    if (!CHECK) { console.log('shot', label); return; }
    const r = await page.evaluate(audit);
    ok(r.emoji.length === 0, `${label}: no emoji left in the rendered text` + (r.emoji.length ? '\n    - ' + r.emoji.map(([c, w]) => c + '  ' + w).join('\n    - ') : ''));
    ok(r.broken.length === 0, `${label}: all ${r.icons} icons load` + (r.broken.length ? ' — broken: ' + r.broken.join(', ') : ''));
    ok(r.icons + r.svgs > 0, `${label}: shows painted icons (${r.icons} img, ${r.svgs} svg)`);
  };

  await page.goto(BASE + 'index.html'); await page.evaluate(() => localStorage.clear());
  await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), save());
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForSelector('.realm-node');
  await screen('map', () => WR.go('home'), '.realm-node');
  await screen('realm', () => WR.go('realm', 'a1'), '[data-k="vocab"]');
  await screen('shop', () => WR.go('shop'));
  await screen('pet', () => WR.go('pet'));
  await screen('maths', () => WR.go('math'));
  await screen('garden', () => WR.go('review'));
  await page.evaluate(() => WR.go('realm', 'a1')); await page.waitForSelector('[data-k="vocab"]');
  await page.click('[data-k="vocab"]'); await page.waitForSelector('.qcard .qtext', { timeout: 8000 });   // R19: the first question may be any type
  await screen('lesson', () => 0);
  // a maths lesson with a picture graph (pictures ARE the content) when the topic exists
  const hasPicto = await page.evaluate(() => !!(window.M && M._internal && M._internal.picto));
  if (hasPicto && CHECK) {
    const r = await page.evaluate(() => { const d = document.createElement('div'); d.id = 'iconProbe'; d.innerHTML = M._internal.picto('Our pets', [{ name: 'Cats', e: '🐱', n: 3 }], 'Each 🐱 = 2 pets'); document.body.appendChild(d); return new Promise(r => setTimeout(() => { const n = d.querySelectorAll('img.wr-icon').length; const t = d.textContent; d.remove(); r({ n, t }); }, 50)); });
    ok(r.n === 4 && !/\p{Extended_Pictographic}/u.test(r.t), `picture graph symbols become icons (${r.n})`);
  }
  if (CHECK) {
    // helper API + SVG <text> + the emoji coming back when art fails
    const api = await page.evaluate(() => new Promise(res => {
      const a = WR.icon('⭐'), b = WR.icon('star'), c = WR.iconSrc('🧑‍🍳'), dd = WR.iconSrc('nope');
      const host = document.createElement('div');
      host.innerHTML = '<svg viewBox="0 0 100 40"><text x="50" y="20" font-size="13" text-anchor="middle">🍎</text><text x="5" y="35" font-size="11">🐶 Dogs</text></svg><span id="fb">🦄</span><input id="typed" value="hi 🌸">';
      document.body.appendChild(host);
      setTimeout(() => {
        const svgImgs = host.querySelectorAll('svg image').length, words = host.querySelectorAll('svg text')[0];
        const im = host.querySelector('#fb img.wr-icon'); if (im) im.src = 'assets/icons/does-not-exist.webp';
        setTimeout(() => { const out = { a, b, c, dd, svgImgs, words: words && words.textContent, fb: host.querySelector('#fb').textContent, typed: host.querySelector('#typed').value }; host.remove(); res(out); }, 400);
      }, 50);
    }));
    ok(/^<img class="wr-icon" src="assets\/icons\/star\.webp" alt="star"/.test(api.a) && api.a === api.b, 'WR.icon("⭐") === WR.icon("star")');
    ok(api.c === 'assets/icons/chef.webp' && api.dd === '', 'WR.iconSrc handles ZWJ sequences and unknown names');
    ok(api.svgImgs === 2 && api.words === 'Dogs', `SVG <text> emoji become <image> (${api.svgImgs}, "${api.words}")`);
    ok(api.fb === '🦄', `a failed icon falls back to its emoji ("${api.fb}")`);
    ok(api.typed === 'hi 🌸', 'typed text in inputs is left alone');
    // every registered icon file exists
    const all = await page.evaluate(async () => { const bad = []; for (const s of new Set(WR.ICONS.values())) { const r = await fetch(`assets/icons/${s}.webp`, { method: 'HEAD' }); if (!r.ok) bad.push(s); } return { n: WR.ICONS.size, bad }; });
    ok(all.bad.length === 0, `all ${all.n} registered icons exist` + (all.bad.length ? ': ' + all.bad.join(', ') : ''));
    ok(miss.length === 0, 'no icon request 404s' + (miss.length ? ': ' + miss.slice(0, 5).join(', ') : ''));
    ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  }
  await browser.close();
  console.log(fails ? `${fails} FAILED` : 'icons: all ok');
})();
