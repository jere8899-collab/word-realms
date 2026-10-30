// 👆 Tappable: on every main screen, at phone (390x844, 360x740, touch) and desktop sizes, every visible
// button / tappable card must be the topmost element at its centre once scrolled into view, nothing may sit
// hidden behind the fixed bottom tab bar, and the bottom tab bar (Map / Pet / Shop / Garden) must take real taps.
// BASE=https://jere8899-collab.github.io/word-realms/ node tools/test/tappable.js  runs it against the live site.
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const SHOT = process.env.SHOT || '';            // e.g. SHOT=before → screenshots/tapfix_before_*.png
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else if (process.env.VERBOSE) console.log('ok', m); };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const save = () => ({ v: 1, name: 'Jeremy', avatar: 'avatar_girl', startLevel: 'a1', stars: 60, totalCorrect: 60, totalAnswered: 65,
  pet: { species: 'pet_fox', name: 'Mochi', xp: 120, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 2, last: today() }, progress: { a1: { grammar: { best: 0.9, plays: 1 } } }, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 6 });
const SIZES = [
  { name: 'phone390', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { name: 'phone360', viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { name: 'desktop', viewport: { width: 1180, height: 820 } }];

// in the page: every visible tappable thing must be topmost at its centre after scrolling it into view,
// and must not be under the fixed tab bar.
const audit = () => {
  const SEL = 'button,.btn,a[href],input,select,textarea,[data-k],[data-r],[data-av],[data-pet],[data-lv],[data-sp],[data-speak],[data-write],#petCard,#mirrorBtn,#ccOnb,#gardenNudge,.opt,.mcard,.tile,.cc-pick,.quill-task,.mirror-pick';
  const nav = document.getElementById('navbar');
  const navOn = nav && getComputedStyle(nav).display !== 'none';
  const modal = [...document.querySelectorAll('.modal-bg')].pop();
  const scope = modal || document;
  const vis = el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05 && !el.closest('[hidden]') && !el.closest('details:not([open]) > :not(summary)'); };
  const els = [...scope.querySelectorAll(SEL)].filter(el => vis(el) && !(el.parentElement && el.parentElement.closest(SEL) && !el.matches('button,input,select,textarea')));
  const bad = [];
  const desc = e => !e ? 'nothing' : e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).join('.') : '');
  for (const el of els) {
    const inNav = nav && nav.contains(el);
    if (!inNav) el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    const x = Math.min(Math.max(r.left + r.width / 2, 1), innerWidth - 1), y = Math.min(Math.max(r.top + Math.min(r.height / 2, 22), 1), innerHeight - 1);
    const hit = document.elementFromPoint(x, y);
    const name = desc(el) + ' "' + (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 24).replace(/\s+/g, ' ') + '"';
    if (r.bottom < 0 || r.top > innerHeight) { bad.push(name + ' cannot be scrolled into view'); continue; }
    if (!hit || !(el === hit || el.contains(hit) || (el.tagName === 'INPUT' && el.labels && [...el.labels].some(l => l.contains(hit))))) bad.push(name + ' covered by ' + desc(hit));
  }
  // reachability: the bottom of the page must end above the tab bar
  if (!modal && navOn) {
    window.scrollTo(0, 1e7);
    const top = nav.getBoundingClientRect().top;
    const main = document.getElementById('main') || document.getElementById('app');
    const fixedish = e => { for (let x = e; x && x !== main; x = x.parentElement) if (/fixed|sticky/.test(getComputedStyle(x).position)) return true; return false; };
    const last = [...main.querySelectorAll('*')].filter(e => vis(e) && !fixedish(e)).reduce((m, e) => Math.max(m, e.getBoundingClientRect().bottom), 0);
    if (last > top + 1) bad.push(`page content ends ${Math.round(last - top)}px under the tab bar`);
  }
  if (modal) { const card = modal.querySelector('.modal'); const r = card.getBoundingClientRect(); modal.scrollTop = 1e7; const r2 = card.getBoundingClientRect(); if (r2.bottom > innerHeight + 1) bad.push('modal bottom unreachable (' + Math.round(r2.bottom - innerHeight) + 'px below the screen)'); if (r.top < -1 && modal.scrollHeight <= modal.clientHeight) bad.push('modal top cut off'); }
  window.scrollTo(0, 0);
  return { n: els.length, bad };
};

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const S of SIZES) {
    const ctx = await browser.newContext(S);
    await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());   // offline-safe: cloud stays in guest mode
    const page = await ctx.newPage(); const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    const check = async (label, shot) => {
      await page.waitForTimeout(450);                                     // let fade-in animations settle
      if (SHOT && shot && S.name === 'phone390') await page.screenshot({ path: `${OUT}tapfix_${SHOT}_${label}.png` });
      const r = await page.evaluate(audit);
      ok(r.bad.length === 0, `${S.name} ${label}: ${r.n} tappables` + (r.bad.length ? '\n    - ' + r.bad.join('\n    - ') : ''));
      if (!r.bad.length) console.log(`ok ${S.name} ${label} (${r.n} tappables)`);
    };
    const tapNav = async (k, label) => {                                   // a real tap / click on the tab bar
      const sel = `#navbar button[data-k="${k}"]`;
      for (const pos of ['top', 'bottom']) {
        await page.evaluate(p => window.scrollTo(0, p === 'top' ? 0 : 1e7), pos); await page.waitForTimeout(150);
        if (S.viewport.width > 500) await page.click(sel, { timeout: 3000 }).catch(e => ok(false, `${S.name} ${label}: tab ${k} click failed: ${e.message.split('\n')[0]}`));
        else await page.tap(sel, { timeout: 3000 }).catch(e => ok(false, `${S.name} ${label}: tab ${k} tap failed: ${e.message.split('\n')[0]}`));
        await page.waitForTimeout(200);
        const on = await page.evaluate(() => { const b = document.querySelector('#navbar button.on'); return b && b.dataset.k; });
        ok(on === k, `${S.name} ${label}: tapping ${k} tab (scrolled ${pos}) opens it (now on ${on})`);
      }
    };

    /* onboarding */
    await page.goto(BASE + 'index.html'); await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('#nm'); await check('onboarding1', true);
    await page.fill('#nm', 'Jeremy'); await page.click('#n1'); await page.waitForSelector('#n2'); await check('onboarding2'); await page.click('#n2'); await page.waitForSelector('#go'); await check('onboarding3');

    /* seeded player */
    await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), save());
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForSelector('.realm-node');
    await check('map', true);
    for (const k of ['pet', 'shop', 'review', 'home']) await tapNav(k, 'tabs');
    await page.evaluate(() => WR.go('pet')); await check('pet', true);
    await page.evaluate(() => WR.go('shop')); await check('shop', true);
    await page.evaluate(() => WR.go('review')); await check('garden');
    // Cloud Castle panel open, then closed
    await page.evaluate(() => WR.go('home')); await page.click('#cloudChip'); await page.waitForSelector('#cloudPanel'); await check('cloud_open', true);
    await page.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove())); await check('cloud_closed');
    for (const k of ['pet', 'home']) await tapNav(k, 'after cloud panel');
    // settings
    await page.click('#setBtn'); await page.waitForSelector('#cls'); await check('settings', true);
    await page.click('#cls'); for (const k of ['shop', 'home']) await tapNav(k, 'after settings');
    // realm + lesson incl. the Next button after answering
    await page.evaluate(() => WR.go('realm', 'a1')); await page.waitForSelector('[data-k="vocab"]'); await check('realm', true);
    await page.click('[data-k="vocab"]'); await page.waitForSelector('.opt', { timeout: 8000 }); await check('lesson', true);
    await page.locator('.opt').first().click(); await page.waitForSelector('#nextBtn'); await page.waitForTimeout(700);
    await page.waitForTimeout(600);
    // Next must be tappable where the game scrolled it (no manual scrolling), not under the tab bar
    const nb = await page.evaluate(() => { const b = document.getElementById('nextBtn').getBoundingClientRect(); const e = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return e && e.closest('#nextBtn') ? 'ok' : (e ? e.tagName + '.' + e.className : 'offscreen'); });
    ok(nb === 'ok', `${S.name} lesson: Next button is tappable where it lands after answering (${nb})`);
    if (SHOT && S.name === 'phone390') await page.screenshot({ path: `${OUT}tapfix_${SHOT}_lesson_next.png` });
    await check('lesson_answered');
    // focus mode (review T2): no tab bar during a lesson; "← Leave" brings it back and the tabs take real taps again
    const hiddenIn = async lab => { const h = await page.evaluate(() => getComputedStyle(document.getElementById('navbar')).display === 'none'); ok(h, `${S.name} ${lab}: tab bar hidden while playing`); };
    const leave = async () => { const q = await page.$('#quitBtn') || await page.$('#qBackRealm'); if (q) { await q.scrollIntoViewIfNeeded(); await q.click(); } else await page.evaluate(() => WR.go('home')); await page.waitForTimeout(250); };
    await hiddenIn('lesson'); await leave(); await tapNav('pet', 'after leaving a lesson'); await tapNav('home', 'after leaving a lesson');
    // speaking, writing, special, placement
    for (const [lab, sel, wait] of [['speaking', '[data-speak]', '#quitBtn'], ['writing', '[data-write]', '#quitBtn,.quill-task'], ['special', '[data-sp]', '#quitBtn']]) {
      await page.evaluate(() => WR.go('realm', 'a1')); await page.waitForSelector('[data-k="vocab"]');
      if (!await page.$(sel)) continue;
      await page.click(sel); await page.waitForSelector(wait, { timeout: 8000 }); await check(lab, lab !== 'special');
      await hiddenIn(lab); await leave(); await tapNav('home', 'after ' + lab);
    }
    await page.evaluate(() => WR.go('home')); await page.click('#mirrorPill'); await page.waitForSelector('.mirror-card', { timeout: 8000 }); await check('placement');
    ok(errs.length === 0, `${S.name}: no page errors ${errs.join(' | ')}`);
    await ctx.close();
  }
  await browser.close();
  console.log(fails ? `\n${fails} tappable checks FAILED` : '\nall tappable checks passed');
})();
