// 📱 N3–N5 (REVIEW-2026-11-02): small-phone layout fixes. node tools/test/n3n5layout.js
//   N3 the B2 boss screen: nothing cut at the right edge at 320/344 px (the pet card steps aside), the pet card whole at 375
//   N4 the "Hello" info pills wrap: every pill fully inside the card at 320–430 px (phones show the 2 short tappable pills)
//   N5 the 🔊 button sits in the card header in Spell Swap, Word Forge, Word Bridges and Punctuation Pixies, so each
//      sentence line runs the full card width at 320 and 375 px
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0, passes = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const SAVE = { v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'a1', stars: 40, pet: { species: 'pet_bunny', name: 'Puffbun', xp: 30, happiness: 70, hunger: 30, lastTick: Date.now() },
  progress: {}, owned: [], equipped: {}, settings: { rate: 1, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 12, bonusSeen: ['sp'], totalCorrect: 1234 };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const errs = [];
  const mk = async (w, h = 658, save = SAVE) => { const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await ctx.route(/supabase|jsdelivr|unpkg/, r => r.abort());
    await ctx.addInitScript(s => { window.__WR_NO_SW = true; window.__WR_CLASSIC_ONLY = true; window.__WR_TEST = { holdMs: 0, pinOffer: false }; if (!localStorage.getItem('wordRealms.save.v1')) localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, save);
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(w + ' ' + e)); await p.goto(BASE); await p.waitForSelector('.realm-node'); return p; };
  // every visible element inside #main stays inside the viewport on the right
  const cutRight = p => p.evaluate(() => { const W = document.documentElement.clientWidth, bad = [];
    document.querySelectorAll('#main *').forEach(e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); if (!r.width || !r.height || cs.visibility === 'hidden') return;
      let a = e.parentElement, clipped = false; while (a && a.id !== 'main') { const o = getComputedStyle(a); if (/(hidden|auto|scroll|clip)/.test(o.overflowX)) { const ar = a.getBoundingClientRect(); if (r.right > ar.right + 1 || r.left < ar.left - 1) clipped = true; } a = a.parentElement; }
      if (r.right > W + 0.5 || clipped) bad.push((e.id || e.className || e.tagName).toString().slice(0, 40) + '@' + Math.round(r.right)); }); return bad; });

  // N3 boss
  for (const w of [320, 344, 375]) {
    const p = await mk(w);
    await p.evaluate(() => WR.startLesson({ realm: 'b2', skill: 'grammar', key: 'grammar', title: 'Grammar' })); await p.waitForSelector('.lbar .boss'); await p.waitForTimeout(700);
    const bad = await cutRight(p); ok(!bad.length, `N3 ${w}px boss screen: nothing cut at the right edge ${bad.slice(0, 5)}`);
    const g = await p.evaluate(() => { const side = document.querySelector('.lesson.lhud>.side'), bar = document.querySelector('.lbar'), boss = document.querySelector('.lbar .boss'), hearts = document.querySelector('.lbar .hearts'), chips = document.querySelector('.lbar .lstats');
      const r = e => e && e.getBoundingClientRect(), vis = e => !!e && r(e).width > 0 && getComputedStyle(e).display !== 'none';
      const pet = side && side.querySelector('.petbox'), pr = r(pet), sr = r(side);
      return { side: vis(side), boss: vis(boss), hearts: vis(hearts), chips: vis(chips), barW: r(bar).width, W: innerWidth, petWhole: vis(side) ? pr.left >= sr.left - 1 && pr.right <= sr.right + 1 && pr.width >= 36 : null }; });
    if (w < 360) ok(!g.side && g.boss && g.hearts && g.chips && g.barW >= g.W - 40, `N3 ${w}px: pet card steps aside, boss + hearts + ⭐/🔥 chips keep the whole row (${Math.round(g.barW)}px)`);
    else ok(g.side && g.petWhole, `N3 ${w}px: pet card shown and the pet is whole`);
    await p.screenshot({ path: `${OUT}n3_boss_${w}.png` });
    await p.context().close();
  }
  // N4 home pills (also a long count and the mirror result)
  for (const w of [320, 344, 360, 375, 393, 414, 430]) {
    const p = await mk(w, 740, { ...SAVE, placement: { level: 'b2', at: Date.now() } });
    await p.waitForTimeout(500);
    const r = await p.evaluate(() => { const card = document.querySelector('.homehead').getBoundingClientRect();
      return [...document.querySelectorAll('.hello-pills .pill')].map(e => { const b = e.getBoundingClientRect(); return { t: e.textContent.trim(), in: b.left >= card.left - 0.5 && b.right <= card.right + 0.5 && b.right <= innerWidth, whole: e.scrollWidth <= e.clientWidth + 1 }; }); });
    ok(r.length === 2 && r.every(x => x.in && x.whole), `N4 ${w}px: both short pills (Storybook, Mirror) fully visible ${JSON.stringify(r.filter(x => !x.in || !x.whole))}`);
    if (w === 320 || w === 375) await p.screenshot({ path: `${OUT}n4_home_${w}.png`, clip: { x: 0, y: 0, width: w, height: 360 } });
    await p.context().close();
  }
  // N5 the four gap games
  for (const w of [320, 375]) {
    const p = await mk(w);
    for (const [round, sel] of [['swapRound', '#swS2'], ['forgeRound', '#fgS'], ['clozeRound', '#czS'], ['marksRound', '#pmS']]) {
      await p.evaluate(r => WR.go(r, { lvl: 'a1', book: 1 }), round); await p.waitForSelector(sel); await p.waitForTimeout(300);
      const m = await p.evaluate(sel => { const s = document.querySelector(sel), box = s.parentElement, card = document.querySelector('.sw-card'), cs = getComputedStyle(card), say = document.querySelector('.ph-head .ph-say');
        const cr = card.getBoundingClientRect(), inner = cr.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), bs = getComputedStyle(box);
        const boxInner = box.getBoundingClientRect().width - parseFloat(bs.paddingLeft) - parseFloat(bs.paddingRight) - [...box.children].filter(c => c !== s).reduce((a, c) => a + c.getBoundingClientRect().width + 8, 0);
        const s1 = document.querySelector('.sw-s1 p');
        return { p: s.getBoundingClientRect().width, box: box.getBoundingClientRect().width, inner, boxInner, sayInHead: !!say && say.getBoundingClientRect().width >= 40, sayInBox: !!box.querySelector('.ph-say'), s1: s1 ? s1.getBoundingClientRect().width / s1.parentElement.getBoundingClientRect().width : 1 }; }, sel);
      ok(m.sayInHead && !m.sayInBox, `N5 ${w}px ${round}: 🔊 is in the card header (≥40 px), not in the sentence box`);
      ok(m.box >= m.inner - 6 && m.p >= m.boxInner - 6 && m.s1 > 0.7, `N5 ${w}px ${round}: the sentence runs the full card width (line ${Math.round(m.p)} px in a ${Math.round(m.box)} px box, card ${Math.round(m.inner)} px, room ${Math.round(m.boxInner)})`);
      const bad = await cutRight(p); ok(!bad.length, `N5 ${w}px ${round}: nothing cut at the right ${bad.slice(0, 4)}`);
      await p.screenshot({ path: `${OUT}n5_${round}_${w}.png`, clip: { x: 0, y: 0, width: w, height: 420 } });
    }
    await p.context().close();
  }
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
