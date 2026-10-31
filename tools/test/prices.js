// 🏷️ Price table (data/shop.json → prices): every star item gets its price from its tier; starters stay cheap; tiers
// match the capped income; owned items stay owned and the balance is untouched when an old save loads.
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else console.log('ok', m); };
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(BASE + 'index.html');
  // an old save that bought things at the old prices
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify({ v: 1, name: 'Old', avatar: 'avatar_girl', startLevel: 'a1', stars: 77, pet: { species: 'pet_fox', name: 'Mochi', xp: 100, happiness: 80, hunger: 20, skin: 's_golden', lastTick: Date.now() }, owned: ['o_crown', 's_golden', 't_ocean'], equipped: { outfit: 'o_crown', petskin: 's_golden', theme: 't_ocean' }, settings: { sound: false } })); });
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForSelector('.realm-node');
  const r = await page.evaluate(() => {
    const P = WR.shop.prices, items = ['outfits', 'petskins', 'themes'].flatMap(c => WR.shop[c]), star = items.filter(i => !i.premium && !i.earnedOnly);
    return { tiers: P.tiers, noPriceInItems: JSON.stringify(items).length && items.every(i => i.price === (i.premium ? 0 : P.tiers[i.tier]) || i.earnedOnly),
      starters: star.filter(i => i.tier === 'starter').map(i => i.id), allTiered: star.every(i => P.tiers[i.tier] != null),
      snacks: WR.shop.snacks.map(s => s.price), stars: WR.state.stars, owned: WR.state.owned, eq: WR.state.equipped, skin: WR.state.pet.skin, cap: WR.EARN.cap };
  });
  ok(r.allTiered && r.noPriceInItems, 'every star item takes its price from the central tier table');
  ok(r.starters.length >= 1 && r.starters.length <= 2 && r.tiers.starter <= 40, `1–2 cheap starter items (${r.starters} at ${r.tiers.starter}⭐)`);
  const day = 120;  // assumed engaged income per day (see data/shop.json prices._doc)
  ok(r.tiers.common / day >= 2 && r.tiers.common / day <= 3, `common ≈ 2–3 days (${r.tiers.common}⭐)`);
  ok(r.tiers.rare / day >= 7 && r.tiers.rare / day <= 14, `rare ≈ 1–2 weeks (${r.tiers.rare}⭐)`);
  ok(r.tiers.epic / day >= 21 && r.tiers.legendary / day >= 35, `epic / legendary take several weeks (${r.tiers.epic}⭐ / ${r.tiers.legendary}⭐)`);
  ok(r.stars === 77 && ['o_crown', 's_golden', 't_ocean'].every(i => r.owned.includes(i)) && r.eq.outfit === 'o_crown' && r.skin === 's_golden', 'old save: balance untouched, items bought at old prices stay owned and equipped');
  await page.evaluate(() => WR.go('shop')); await page.waitForSelector('.item');
  const shop = await page.evaluate(() => ({ tiers: document.querySelectorAll('.card.item .tier').length, buys: [...document.querySelectorAll('.buy')].map(b => b.textContent.trim()), owned: document.querySelectorAll('.eq').length }));
  ok(shop.tiers > 0 && shop.owned >= 1, `shop shows tier badges (${shop.tiers}) and owned items as Equip/Unequip`);
  ok(shop.buys.some(t => /300/.test(t)), `buy buttons show the new prices (${shop.buys.join(', ')})`);
  ok(errs.length === 0, 'no page errors ' + errs.join(' | '));
  await browser.close(); console.log(fails ? `${fails} FAILED` : 'prices: all ok');
})();
