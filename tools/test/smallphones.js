// 📱 R9–R11 (REVIEW-2026-11-01): small-phone layout checks.   node tools/test/smallphones.js   (SHOT=1 for screenshots)
//  R9  every Petal Match card is fully on screen at 320/344/360/375 px
//  R10 lesson HUD chips sit on one line each, no stray "·", bubble ≥13 px or hidden (<340 px), at 320–430 px
//  R11 no painted icon starts a line on its own, no button text wraps (7 profiles)
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
const ONLY = (process.env.ONLY || 'R9,R10,R11').split(',');
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = { v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'a1', stars: 60, totalCorrect: 1, totalAnswered: 1,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 20, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 1, last: today() }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false }, mistakes: [], lessonsDone: 1 };
const PROFILES = [['se1', 320, 568], ['zfold', 344, 882], ['galaxyA', 360, 780], ['se', 375, 667], ['pixel', 393, 851], ['iphone', 390, 844], ['promax', 430, 932]];
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const [name, W, H] of PROFILES) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto(BASE + 'index.html'); await page.evaluate(s => localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)), SAVE);
    await page.reload(); await page.waitForSelector('.realm-node');
    if (ONLY.includes('R9') && W <= 375) {
      for (let rep = 0; rep < 6; rep++) {
        await page.evaluate(() => WR.playSpecial('a1')); await page.waitForSelector('.mcard'); await page.waitForTimeout(500);
        const bad = await page.evaluate(() => [...document.querySelectorAll('.mcard')].map(c => c.getBoundingClientRect()).filter(r => r.left < -0.5 || r.right > innerWidth + 0.5).length);
        const sw = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        ok(bad === 0 && sw <= 0, `R9 ${name} ${W}px round ${rep + 1}: all 12 Petal Match cards inside the screen (${bad} out, h-scroll ${sw})`);
        const split = await page.evaluate(() => [...document.querySelectorAll('.mcard:not(.painted):not(.emo)')].filter(c => { const r = document.createRange(); r.selectNodeContents(c); return r.getClientRects().length > 1 && !/\s/.test(c.textContent.trim()); }).map(c => c.textContent));
        ok(split.length === 0, `R9 ${name} round ${rep + 1}: no single word is split over two lines (${split})`);
        if (rep === 0 && process.env.SHOT) await page.screenshot({ path: `${OUT}smallphones_${name}_petalmatch.png` });
        await page.evaluate(() => WR.go('home')); await page.waitForTimeout(200);
      }
    }
    if (ONLY.includes('R10')) {
      const chk = async (label, shot) => {
        const r = await page.evaluate(() => {
          const ls = document.getElementById('lstats'), chips = ls ? [...ls.querySelectorAll('.lchip')] : [];
          const lines = chips.map(c => { const rr = document.createRange(); rr.selectNodeContents(c); return new Set([...rr.getClientRects()].filter(x => x.width > 0).map(x => Math.round(x.top))).size; });
          const tops = new Set(chips.map(c => Math.round(c.getBoundingClientRect().top)));
          const stray = /(^|\s)·(\s|$)/.test(ls ? ls.textContent : '·');
          const b = document.getElementById('lbubble'), cs = b && getComputedStyle(b);
          const out = chips.some(c => { const q = c.getBoundingClientRect(); return q.right > innerWidth + .5 || q.left < -.5; });
          return { n: chips.length, lines, rows: tops.size, stray, words: chips.map(c => c.innerText.trim()), bub: cs ? (cs.display === 'none' ? 'hidden' : parseFloat(cs.fontSize)) : 'none', out };
        });
        ok(r.n === 2 && r.lines.every(x => x === 1) && r.rows === 1 && !r.stray && !r.out, `R10 ${name} ${W}px ${label}: two chips, one line each, side by side, no stray "·" (${r.words.join(' | ')})`);
        ok(W >= 400 || r.words.every(w => !/[a-z]/i.test(w)), `R10 ${name} ${label}: the words "earned/combo/passed" are dropped under 400 px`);
        ok(W < 340 ? r.bub === 'hidden' : r.bub >= 13, `R10 ${name} ${label}: pet bubble ${W < 340 ? 'hidden under 340 px' : 'text ≥ 13 px'} (${r.bub})`);
        if (shot && process.env.SHOT) await page.screenshot({ path: `${OUT}smallphones_${name}_${label}_hud.png` });
      };
      await page.evaluate(async () => { const b = await WR.bank('a1', 'vocab'); const items = b.filter(q => !q.type || q.type === 'mcq').slice(0, 3).map(q => WR.normalize(q)); WR.startLesson({ realm: 'a1', skill: 'vocab', key: 'vocab', title: 'Words', items }); });
      await page.waitForSelector('#lstats .lchip'); await page.waitForTimeout(300);
      await chk('lesson', true);
      await page.evaluate(() => { WR.Voice && WR.Voice.stop && WR.Voice.stop(); WR.go('home'); });
      await page.evaluate(() => WR.startSpeaking('a1')); await page.waitForSelector('#lstats .lchip'); await page.waitForTimeout(300);
      await chk('speaking', W === 320 || W === 375);
      await page.evaluate(() => { WR.stopSpeaking(); WR.go('home'); }); await page.waitForTimeout(200);
    }
    if (ONLY.includes('R11')) {
      const scan = async (label, shot) => {
        await page.waitForTimeout(350);
        const r = await page.evaluate(() => {
          const vis = el => { const q = el.getBoundingClientRect(); return q.width > 0 && q.height > 0 && q.bottom > 0 && q.top < innerHeight * 4; };
          const lonely = [], wraps = [], over = [];
          document.querySelectorAll('img.wr-icon:not(.big)').forEach(im => {
            if (!vis(im) || im.closest('.toast,.navbar,.topbar,svg')) return;
            let b = im.parentElement; while (b && getComputedStyle(b).display === 'inline') b = b.parentElement;
            if (!b || /flex|grid/.test(getComputedStyle(b).display) && im.parentElement === b) return;   // a layout item, not part of a text line
            const ir = im.getBoundingClientRect(), mid = (ir.top + ir.bottom) / 2, w = document.createTreeWalker(b, NodeFilter.SHOW_TEXT);
            let text = 0, company = false;
            for (let n = w.nextNode(); n; n = w.nextNode()) { if (!n.nodeValue.trim()) continue; const rg = document.createRange(); rg.selectNodeContents(n);
              for (const q of rg.getClientRects()) { if (q.width < 1) continue; text++; if (q.top <= mid && q.bottom >= mid) company = true; } }
            if (text && !company) lonely.push((b.innerText || '').slice(0, 50).replace(/\s+/g, ' ') + ' [' + im.alt + ']');
          });
          document.querySelectorAll('.btn').forEach(bt => {
            if (!vis(bt) || bt.closest('.toast')) return;
            const rg = document.createRange(); rg.selectNodeContents(bt);
            const tops = new Set([...rg.getClientRects()].filter(q => q.width > 1 && q.height > 4).map(q => Math.round((q.top + q.bottom) / 2 / 6)));
            const txt = (bt.innerText || '').trim().replace(/\s+/g, ' ');
            if (tops.size > 1 && txt) wraps.push(txt);
            const kids = [...bt.childNodes].filter(n => n.nodeType === 1 || n.nodeValue.trim()).map(n => { const rg2 = document.createRange(); rg2.selectNode(n); return rg2.getBoundingClientRect(); });
            for (let k = 1; k < kids.length; k++) if (kids[k].left < kids[k - 1].right - 2 && Math.abs(kids[k].top - kids[k - 1].top) < 4) { over.push(txt + ' (overlapping pieces)'); break; }
            const q = bt.getBoundingClientRect(), box = bt.parentElement.closest('.card,.modal'), bq = box && box.getBoundingClientRect(); if ((bq && (q.right > bq.right + 1 || q.left < bq.left - 1)) || q.right > innerWidth + 1 || q.left < -1 || bt.scrollWidth > bt.clientWidth + 2) over.push(txt);
          });
          return { lonely, wraps, over };
        });
        ok(r.lonely.length === 0, `R11 ${name} ${W}px ${label}: no icon alone on a line ${r.lonely.length ? JSON.stringify(r.lonely) : ''}`);
        ok(r.wraps.length === 0, `R11 ${name} ${label}: no button text wraps ${r.wraps.length ? JSON.stringify(r.wraps) : ''}`);
        ok(r.over.length === 0, `R11 ${name} ${label}: no button sticks out or is clipped ${r.over.length ? JSON.stringify(r.over) : ''}`);
        if (shot && process.env.SHOT) await page.screenshot({ path: `${OUT}smallphones_${name}_${label}.png`, fullPage: false });
      };
      const big = W === 375 || W === 320;
      // locked realm cards on home
      await page.evaluate(s => { localStorage.setItem('wordRealms.save.v1', JSON.stringify({ ...s, settings: { ...s.settings, unlockAll: false } })); }, SAVE);
      await page.reload(); await page.waitForSelector('.realm-node');
      await page.evaluate(() => { const n = [...document.querySelectorAll('.realm-node.locked')].pop(); n && n.scrollIntoView({ block: 'center' }); });
      await scan('home', big);
      await page.evaluate(() => WR.go('charms', 'a1')); await page.waitForSelector('.ch-how'); await scan('charms', big);
      // listening feedback: transcript + Replay
      await page.evaluate(async () => { const b = await WR.bank('a1', 'listening'); const items = b.filter(q => q.type === 'listen' && !q.dialogue).slice(0, 2).map(q => WR.normalize(q)); WR.startLesson({ realm: 'a1', skill: 'listening', key: 'listening', title: 'Listen', items }); });
      await page.waitForSelector('.opt'); await page.click('.opt'); await page.waitForSelector('#replay');
      await page.evaluate(() => document.getElementById('replay').scrollIntoView({ block: 'center' }));
      const ov = await page.evaluate(() => { const b = document.getElementById('replay').getBoundingClientRect(), t = document.querySelector('.transcript > div'); const rg = document.createRange(); rg.selectNodeContents(t); return [...rg.getClientRects()].some(q => q.width > 1 && q.bottom > b.top + 1 && q.top < b.bottom - 1 && q.right > b.left + 1 && q.left < b.right - 1); });
      ok(!ov, `R11 ${name} listening: the Replay button sits under the transcript, not over it`);
      await scan('listening', big);
      await page.evaluate(() => { WR.Voice && WR.Voice.stop && WR.Voice.stop(); });
      // onboarding (no save)
      await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForSelector('#n1');
      await scan('onboarding1', big);
      await page.fill('#nm', 'Mia'); await page.click('#n1'); await page.waitForSelector('#n2'); await scan('onboarding2', false);
      await page.click('#n2'); await page.waitForSelector('#go'); await scan('onboarding3', big);
    }
    ok(errs.length === 0, `${name}: no page errors ${errs.slice(0, 2)}`);
    await ctx.close();
  }
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
