// 👗 Skins, accessories, pets and rewards: equipping an item adds its layer everywhere (map, pet screen, shop,
// wardrobe, lesson companion) and unequipping removes it; one item per slot; hats sit above the face on every hero and
// pet picture; rewards / daily chest / earned-only rules; old-save migration; buying and choosing pets.
// Screenshots → screenshots/skins_*.png (phone).
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else console.log('ok', m); };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const save = x => Object.assign({ v: 1, name: 'Jeremy', avatar: 'hero_knight', startLevel: 'a1', stars: 400, totalCorrect: 120, totalAnswered: 130, lessonsDone: 12,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 300, happiness: 80, hunger: 30, skin: null, lastTick: Date.now(), looks: {} },
  streak: { count: 2, last: today() }, progress: { a1: { grammar: { best: 0.9, plays: 1 } } }, owned: ['hero_knight', 'a_witch', 'a_glasses', 'a_scarf', 'a_fairy', 'o_flower', 'pet_kitty'],
  equipped: { outfit: null, petskin: null, theme: null }, looks: {}, rewards: { got: [], chest: { last: null, n: 0 }, caughtUp: true },
  settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [] }, x || {});
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  let ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
  let page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  const load = async s => { await page.goto(BASE + 'index.html'); await page.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, s); await page.reload({ waitUntil: 'networkidle' }); await page.waitForSelector('.realm-node'); };
  const layers = (sel, id) => page.evaluate(([sel, id]) => [...document.querySelectorAll(sel)].map(w => w.querySelectorAll(`image.layer[data-id="${id}"]`).length), [sel, id]);
  await load(save());
  // ---- hero: wear → layer appears on map, wardrobe, shop; take off → gone
  await page.evaluate(() => WR.go('wardrobe', 'outfits')); await page.waitForSelector('.wr-card');
  await page.screenshot({ path: OUT + 'skins_equip_before.png' });
  ok((await layers('#wrStage .av-wrap', 'a_witch'))[0] === 0, 'before: no witch hat on the hero');
  await page.click('[data-wear="hero"][data-id="a_witch"]'); await page.waitForTimeout(300);
  await page.click('[data-wear="hero"][data-id="a_glasses"]'); await page.click('[data-wear="hero"][data-id="a_fairy"]'); await page.click('[data-wear="hero"][data-id="a_scarf"]'); await page.waitForTimeout(400);
  await page.screenshot({ path: OUT + 'skins_equip_after.png' });
  ok((await layers('#wrStage .av-wrap', 'a_witch'))[0] === 1, 'wear: the witch hat layer is drawn on the hero (wardrobe preview)');
  const backBehind = await page.evaluate(() => !!document.querySelector('#wrStage .av-wrap svg.layers.behind image[data-id="a_fairy"]'));
  ok(backBehind, 'wings are drawn behind the hero');
  ok(await page.evaluate(() => JSON.stringify(WR.state.looks)) === JSON.stringify({ head: 'a_witch', face: 'a_glasses', back: 'a_fairy', neck: 'a_scarf' }), 'the save holds one item per slot');
  await page.evaluate(() => WR.go('home')); await page.waitForTimeout(400);
  const homeHas = await page.evaluate(() => [...document.querySelectorAll('.av-wrap')].some(w => w.querySelector('image.layer[data-id="a_witch"]')));
  ok(homeHas, 'map/home: the hero wears the hat');
  await page.evaluate(() => WR.go('shop')); await page.waitForTimeout(300);
  ok((await layers('.av-wrap', 'a_witch')).some(n => n === 1), 'shop preview: the hero wears the hat');
  // one per slot: the flower crown replaces the witch hat
  await page.evaluate(() => WR.go('wardrobe', 'outfits')); await page.waitForSelector('.wr-card');
  await page.click('[data-wear="hero"][data-id="o_flower"]'); await page.waitForTimeout(300);
  ok((await layers('#wrStage .av-wrap', 'a_witch'))[0] === 0 && (await layers('#wrStage .av-wrap', 'o_flower'))[0] === 1, 'one item per slot: a new hat replaces the old one');
  await page.click('[data-wear="hero"][data-id="o_flower"]'); await page.waitForTimeout(300);
  ok(await page.evaluate(() => !document.querySelector('#wrStage .av-wrap image.layer.head')), 'take off: the hat layer is removed');
  // ---- pet: wear glasses + hat, everywhere incl. the lesson companion; then take off
  await page.evaluate(() => WR.go('wardrobe', 'petlooks')); await page.waitForSelector('[data-wear="pet"]');
  await page.click('[data-wear="pet"][data-id="a_glasses"]'); await page.waitForTimeout(200); await page.click('[data-wear="pet"][data-id="a_witch"]'); await page.waitForTimeout(400);
  await page.screenshot({ path: OUT + 'skins_petlooks.png' });
  ok((await layers('#wrStage .petwrap', 'a_glasses'))[0] === 1, 'pet wears glasses in the wardrobe');
  await page.evaluate(() => WR.go('pet')); await page.waitForTimeout(400);
  ok((await layers('#petStage .petwrap', 'a_witch'))[0] === 1, 'pet screen: the pet wears its hat');
  await page.screenshot({ path: OUT + 'skins_pet_screen.png' });
  await page.evaluate(() => WR.go('realm', 'a1')); await page.waitForSelector('[data-k="vocab"]'); await page.click('[data-k="vocab"]'); await page.waitForSelector('.opt');
  ok((await layers('#lpet .petwrap', 'a_glasses'))[0] === 1, 'lesson companion: the pet wears its glasses');
  const lp = await page.evaluate(() => { const w = document.querySelector('#lpet .petwrap'), img = w.querySelector(':scope > img').getBoundingClientRect(), s = Math.min(img.width, img.height), oy = img.top + (img.height - s) / 2, a = WR.anchorFor(w.dataset.art), h = w.querySelector('image.layer.head').getBoundingClientRect(); return { bottom: h.bottom, face: oy + s * a.faceTop / 100, size: s }; });
  ok(lp.bottom <= lp.face + 0.5, `lesson companion (${Math.round(lp.size)}px): the pet's hat stays above its face`);
  await page.evaluate(() => WR.go('wardrobe', 'petlooks')); await page.waitForSelector('[data-wear="pet"]');
  await page.click('[data-wear="pet"][data-id="a_witch"]'); await page.waitForTimeout(200);
  ok((await layers('#wrStage .petwrap', 'a_witch'))[0] === 0, 'pet: take the hat off → its layer is gone');
  // ---- instant try-on without owning
  await page.evaluate(() => WR.go('wardrobe', 'heroes')); await page.waitForSelector('.wr-card');
  await page.click('[data-try="hero_redhood"] .wr-art'); await page.waitForTimeout(300);
  ok(await page.evaluate(() => document.querySelector('#wrStage .av-wrap').dataset.art === 'hero_redhood' && WR.state.avatar === 'hero_knight'), 'try-on: tapping a locked hero previews it instantly without changing the save');
  await page.screenshot({ path: OUT + 'skins_wardrobe_heroes.png' });
  // ---- every hero and pet picture: a hat's bottom edge stays above the face line
  const an = await page.evaluate(() => Object.keys(WR.anchorData).map(id => { const a = WR.anchorFor(id); return { id, ok: a.head[1] <= a.faceTop && a.face[1] > a.faceTop && a.neck[1] > a.face[1] }; }));
  ok(an.length >= 35 && an.every(x => x.ok), `anchors for all ${an.length} pictures: hat above the brow line, glasses on the face, collar below (${an.filter(x => !x.ok).map(x => x.id)})`);
  // ---- pets: choose another pet, switch back keeps progress
  await page.evaluate(() => WR.go('wardrobe', 'pets')); await page.waitForSelector('[data-pet]');
  await page.screenshot({ path: OUT + 'skins_wardrobe_pets.png' });
  await page.click('[data-pet="pet_kitty"]'); await page.waitForTimeout(300);
  const sw = await page.evaluate(() => { const a = WR.state.pet.species, st = WR.state.stable.map(p => p.species + ':' + p.xp); WR.Rewards.choosePet('pet_bunny'); return { a, st, back: WR.state.pet.species + ':' + WR.state.pet.xp, glasses: WR.state.pet.looks.face }; });
  ok(sw.a === 'pet_kitty' && sw.st.includes('pet_bunny:300') && sw.back === 'pet_bunny:300' && sw.glasses === 'a_glasses', `choose a pet: the old one waits in the stable with its XP and looks (${JSON.stringify(sw)})`);
  // ---- buying, earned-only, rewards, chest
  const eco = await page.evaluate(() => {
    const R = WR.Rewards, s = WR.state, st0 = s.stars;
    const earnedBuy = R.buy('a_wizard'), cheap = R.buy('s_strawberry'), paid = st0 - s.stars;
    s.totalCorrect = 249; R.check(true); const before = s.stars; s.totalCorrect = 250; const got = R.check(true).map(r => r.id);
    const gain = s.stars - before, owns = R.owns('a_bowtie');
    const c0 = s.stars, g1 = R.openChest(), c1 = s.stars, again = R.openChest();
    s.rewards.chest.last = '2000-01-01'; const xp0 = s.pet.xp, g2 = R.openChest();
    return { earnedBuy, cheap, paid, got, gain, owns, chest1: c1 - c0, again, g2xp: s.pet.xp - xp0, day: R.chest().day };
  });
  ok(eco.earnedBuy === false, 'earned-only items can’t be bought');
  ok(eco.cheap === true && eco.paid === 30, 'a starter pet skin costs 30⭐');
  ok(eco.got.includes('r_c250') && eco.gain === 40 && eco.owns, `milestone: 250 correct → +40⭐ and the Dapper Bow Tie (${eco.got})`);
  ok(eco.chest1 === 10 && eco.again === null && eco.g2xp === 30, 'daily gift chest: day 1 = 10⭐, once a day; day 2 = +30 pet XP (fixed calendar, no randomness)');
  await page.evaluate(() => WR.go('wardrobe', 'rewards')); await page.waitForSelector('.chest-card'); await page.waitForTimeout(300);
  await page.screenshot({ path: OUT + 'skins_rewards.png' });
  // ---- old save: the emoji outfit becomes a layer, earned looks arrive quietly, balance untouched
  await ctx.close(); ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
  page = await ctx.newPage(); page.on('pageerror', e => errs.push(e.message));   // fresh device: the old page can't re-save on unload
  await load(save({ stars: 77, totalCorrect: 1200, avatar: 'avatar_girl', owned: ['o_crown'], equipped: { outfit: 'o_crown', petskin: null, theme: null }, looks: undefined, rewards: undefined, pet: { species: 'pet_fox', name: 'Mochi', xp: 900, happiness: 80, hunger: 20, skin: null, lastTick: Date.now() } }));
  const mg = await page.evaluate(() => ({ looks: WR.state.looks, stars: WR.state.stars, owned: WR.state.owned, got: WR.state.rewards.got.length, crown: !!document.querySelector('.av-wrap image.layer[data-id="o_crown"]'), royal: (document.querySelector('.petwrap') || {}).dataset && document.querySelector('.petwrap').dataset.art }));
  ok(mg.looks.head === 'o_crown' && mg.crown, 'old save: the equipped emoji outfit is now a real crown layer on the hero');
  ok(mg.stars - 77 < 10 && mg.owned.includes('a_wizard') && mg.owned.includes('a_bowtie') && mg.got > 0, `old save: already-earned looks unlocked quietly, no reward stars paid — only the old +2⭐ sticker gifts (${mg.stars - 77}⭐)`);
  ok(mg.royal === 'pet_fox_royal', 'an evolved pet shows its new evolution art');
  await page.evaluate(() => WR.go('home')); await page.waitForTimeout(400); await page.screenshot({ path: OUT + 'skins_map.png' });
  ok(errs.length === 0, 'no page errors ' + errs.join(' | '));
  await browser.close(); console.log(fails ? `${fails} FAILED` : 'skins: all ok');
})();
