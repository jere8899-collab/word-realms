/* 👗 Wardrobe (collection view: owned vs locked, how to unlock, instant try-on, equip/unequip for hero and pet) and the
   🎁 rewards engine: streak gifts, milestones, badges, English realm + maths mastery, pet level and affection rewards,
   and a free daily gift chest on a fixed 7-day calendar (visible prizes, no randomness, nothing paid).
   Data: data/shop.json → heroes, outfits (accessories, one per slot), petskins, pets, rewards, chest, prices.
   Save: state.owned, state.avatar, state.looks (hero), state.pet.looks / .love, state.stable (other pets),
   state.rewards = { got: [reward ids], chest: { last: day, n: gifts opened }, best: best streak } — all cloud-synced. */
(function () {
const WR = window.WR, esc = s => WR.esc(s);
const R = WR.Rewards = {};
const st = () => WR.state;
/* ---------- catalogue & ownership ---------- */
const FREE_HEROES = () => WR.AVATARS.map(a => ({ id: a.id, name: a.name, tier: "free", desc: "One of the first heroes." }));
const STARTER_PETS = () => WR.PETS.filter(p => !p.extra).map(p => ({ id: p.id, name: p.name, tier: "free", desc: "A starter friend.", starter: true }));
R.cats = () => ({ heroes: FREE_HEROES().concat(WR.shop.heroes || []), outfits: WR.shop.outfits, petskins: WR.shop.petskins, pets: STARTER_PETS().concat(WR.shop.pets || []) });
R.find = id => { const c = R.cats(); for (const k in c) { const it = c[k].find(x => x.id === id); if (it) return Object.assign({ _cat: k }, it); } return null; };
const petOwned = id => { const s = st(); return (s.pet && s.pet.species === id) || (s.stable || []).some(p => p.species === id); };
R.owns = id => { const s = st(); if (s.owned.includes(id) || petOwned(id)) return true; const it = R.find(id); return !!it && it.tier === "free" && it._cat === "heroes"; };
// looks that count for the collection badges (everything you can own except the free starters)
R.collection = () => { const c = R.cats(); const all = [].concat(c.heroes, c.outfits, c.petskins, c.pets).filter(x => x.tier !== "free"); return { have: all.filter(x => R.owns(x.id)).length, all: all.length }; };
/* ---------- unlock conditions ---------- */
const realmMastered = rid => { const p = (st().progress || {})[rid] || {}; return WR.SKILLS.every(k => p[k.id] && p[k.id].best >= 0.8); };
const mathCrowns = () => Object.values(((st().math || {}).topics) || {}).filter(t => WR.crowns(t.best) === 3).length;
const petLevelMax = () => Math.max(0, ...[st().pet].concat(st().stable || []).filter(Boolean).map(p => WR.petLevel(p.xp)));
R.metric = u => {
  const s = st();
  switch (u.type) {
    case "streak": return Math.max(WR.streakAlive(), s.rewards.best || 0);
    case "correct": return s.totalCorrect || 0;
    case "lessons": return s.lessonsDone || 0;
    case "petLevel": return petLevelMax();
    case "love": return Math.max(0, ...[s.pet].concat(s.stable || []).filter(Boolean).map(p => p.love || 0));
    case "realm": return realmMastered(u.rid) ? 1 : 0;
    case "mathCrowns": return mathCrowns();
    case "collection": return R.collection().have;
    case "chestWeeks": return Math.floor((s.rewards.chest.n || 0) / 7);
  }
  return 0;
};
R.need = u => u.type === "realm" ? 1 : u.n;
const realmName = rid => { const r = (WR.realms || []).find(x => x.id === rid); return r ? r.name : String(rid || "").toUpperCase(); };
R.how = u => {
  if (!u) return "";
  const n = (u.n || 0).toLocaleString("en");
  return { streak: `🔥 Keep a ${n}-day streak`, correct: `✅ Answer ${n} questions correctly`, lessons: `📚 Finish ${n} lessons`, petLevel: `🐾 Grow a pet to level ${n}`,
    love: `💖 Give your pet ${n} hearts of love (cuddle, feed, play)`, realm: u.type === "realm" ? `🏰 Master ${realmName(u.rid)}: all 4 skills at 80%+` : "", mathCrowns: `🧮 Win 3 crowns on ${n} maths topics`,
    collection: `👗 Collect ${n} looks`, chestWeeks: `🎁 Open the daily gift chest ${7 * u.n} times` }[u.type] || "";
};
R.progress = u => { const have = R.metric(u), need = R.need(u); return { have: Math.min(have, need), need, pct: Math.round(Math.min(1, have / need) * 100), done: have >= need }; };
// what unlocks an item: its own rule, or the reward that gives it
R.unlockOf = it => it.unlock || ((WR.shop.rewards || []).find(r => r.item === it.id) || null);
/* ---------- the engine (runs after every screen change and every claim) ---------- */
R.check = (quiet = false) => {
  const s = st(); if (!s.pet || !WR.shop || !WR.shop.rewards) return [];
  s.rewards.best = Math.max(s.rewards.best || 0, WR.streakAlive());
  // an older save catches up once, quietly: it gets the looks it has already earned but no stars, so balances
  // that existed before the rewards update stay exactly as they were
  const catchUp = !s.rewards.caughtUp; if (catchUp) { s.rewards.caughtUp = true; quiet = true; }
  const fresh = [];
  for (let pass = 0; pass < 2; pass++)   // a reward can complete a collection badge in the same check
    for (const r of WR.shop.rewards) {
      if (s.rewards.got.includes(r.id) || !R.progress(r).done) continue;
      s.rewards.got.push(r.id); fresh.push(r);
      if (r.stars && !catchUp) WR.awardStars("reward", r.id, r.stars, { kind: "bonus", quiet: true });
      if (r.item && !R.owns(r.item)) WR.grantItem(r.item);
    }
  WR.save();
  if (fresh.length && !quiet) {
    WR.sfx("level"); WR.confetti && WR.confetti(14);
    fresh.slice(0, 2).forEach((r, i) => setTimeout(() => { const it = r.item && R.find(r.item); WR.toast(`${r.icon} ${esc(r.name)}!${r.stars ? ` +${r.stars}⭐` : ""}${it ? ` · ${esc(it.name)} unlocked 👗` : ""}`, 2500); }, 250 + i * 900));
  }
  return fresh;
};
/* ---------- 🎁 daily gift chest ---------- */
R.chest = () => { const c = st().rewards.chest; return { ready: c.last !== WR.today(), day: (c.n % 7) + 1, n: c.n, list: WR.shop.chest || [] }; };
const giftText = g => [g.stars ? `${g.stars}⭐` : "", g.petXP ? `+${g.petXP} pet XP` : "", g.happy ? `+${g.happy} 💖` : ""].filter(Boolean).join(" · ");
R.openChest = () => {
  const s = st(), ch = R.chest(); if (!ch.ready || !s.pet) return null;
  const g = ch.list[(ch.day - 1) % ch.list.length];
  s.rewards.chest.n++; s.rewards.chest.last = WR.today();
  if (g.stars) WR.awardStars("chest", WR.today(), g.stars, { kind: "bonus", quiet: true });
  if (g.petXP) WR.petGainXP(g.petXP);
  if (g.happy) s.pet.happiness = Math.min(100, s.pet.happiness + g.happy);
  WR.save(); WR.renderTop && WR.renderTop(); WR.sfx("coin");
  R.check(); return g;
};
R.love = n => { const p = st().pet; if (!p) return; p.love = (p.love || 0) + n; WR.save(); };
/* ---------- equip / choose ---------- */
// one item per slot; wearing the item already in that slot takes it off
R.wear = (target, id, looks) => {
  const it = WR.accessory(id); if (!it) return;
  const L = looks || (target === "pet" ? (st().pet.looks = st().pet.looks || {}) : (st().looks = st().looks || {}));
  if (L[it.slot] === id) delete L[it.slot]; else L[it.slot] = id;
  if (!looks) WR.save();
  return L;
};
R.useHero = id => { st().avatar = id; WR.save(); WR.renderTop(); };
R.choosePet = id => {
  const s = st(); if (!s.pet || s.pet.species === id || !R.owns(id)) return;
  const info = WR.PETS.find(p => p.id === id); s.stable = s.stable || [];
  const old = s.pet, i = s.stable.findIndex(p => p.species === id);
  const next = i >= 0 ? s.stable.splice(i, 1)[0] : { species: id, name: info.name, xp: 0, happiness: 85, hunger: 20, skin: null, looks: {}, love: 0, lastTick: Date.now(), adopted: Date.now() };
  s.stable.push(old); s.pet = next; WR.save();
};
R.buy = id => { const it = R.find(id); if (!it || R.owns(id) || it.premium || it.tier === "earned" || !it.price) return false; if (!WR.spend(it.price)) return false; WR.grantItem(id); R.check(true); return true; };

/* ---------- 👗 the Wardrobe screen ---------- */
const TABS = [["heroes", "🧚 Heroes"], ["outfits", "🎩 Hero items"], ["pets", "🐾 Pets"], ["petlooks", "🎨 Pet looks"], ["rewards", "🎁 Rewards"]];
let tab = "heroes", P = null;   // P: the try-on preview { avatar, looks, pet }
const clone = o => JSON.parse(JSON.stringify(o));
const resetPreview = () => { const s = st(); P = { avatar: s.avatar, looks: clone(s.looks || {}), pet: clone(s.pet) }; };
const tierTag = it => it.tier && it.tier !== "free" ? `<span class="tier t-${it.premium ? "earned" : it.tier}">${it.premium ? "Grown-up" : WR.TIER_NAMES[it.tier] || it.tier}</span>` : "";
function lockHTML(it) {
  if (it.premium) return `<div class="earn-how muted">💖 Ask a grown-up in the Shop</div>`;
  const u = R.unlockOf(it);
  if (it.tier === "earned" || (u && !it.price)) { const pr = u ? R.progress(u) : { pct: 0, have: 0, need: 1 };
    return `<div class="earn-how muted">🔒 ${esc(R.how(u))}</div><div class="save-up" title="${pr.have} / ${pr.need}"><i style="width:${pr.pct}%"></i></div><div class="muted tiny">${pr.have.toLocaleString("en")} / ${pr.need.toLocaleString("en")}</div>`; }
  const s = st();
  return `<button class="btn small buy" data-buy="${it.id}" ${s.stars < it.price ? "disabled" : ""}>⭐ ${it.price}</button>${s.stars < it.price ? `<div class="save-up"><i style="width:${Math.round(s.stars / it.price * 100)}%"></i></div><div class="muted tiny">${(it.price - s.stars).toLocaleString("en")}⭐ to go</div>` : ""}`;
}
function card(it, art, action) {
  const own = R.owns(it.id);
  return `<div class="card item wr-card ${own ? "owned" : "locked"}" data-try="${it.id}" role="button" tabindex="0">${tierTag(it)}<div class="wr-art">${art}</div>
    <div><b>${esc(it.name)}</b></div><p class="muted tiny" style="min-height:2.2em">${esc(it.desc || "")}</p>${own ? action : lockHTML(it)}</div>`;
}
const accArt = it => `<img class="acc-prev" src="${WR.layerSrc(it.art)}" alt="" loading="lazy">`;
function itemsHTML() {
  const s = st(), c = R.cats();
  if (tab === "heroes") return c.heroes.map(it => card(it, WR.img(it.id, "prev"), s.avatar === it.id ? `<button class="btn small ghost" disabled>Wearing ✓</button>` : `<button class="btn small mint" data-hero="${it.id}">Wear</button>`)).join("");
  if (tab === "outfits") return c.outfits.map(it => card(it, accArt(it), (s.looks || {})[it.slot] === it.id ? `<button class="btn small ghost" data-wear="hero" data-id="${it.id}">Take off</button>` : `<button class="btn small mint" data-wear="hero" data-id="${it.id}">Wear</button>`)).join("");
  if (tab === "pets") return c.pets.map(it => card(it, WR.img(it.id, "prev"), s.pet.species === it.id ? `<button class="btn small ghost" disabled>With you ✓</button>` : `<button class="btn small mint" data-pet="${it.id}">Choose</button>`)).join("");
  if (tab === "petlooks") return `<h3 class="wr-sub">🎨 Fur colours</h3><div class="grid g4">${c.petskins.map(it => card(it, `<div class="${it.sparkle ? "sparkle-skin" : ""} ${it.rainbow ? "rainbow-skin" : ""}">${WR.img(WR.petArt(s.pet), "prev", it.filter ? "filter:" + it.filter : "")}</div>`,
      s.pet.skin === it.id ? `<button class="btn small ghost" data-skin="${it.id}">Take off</button>` : `<button class="btn small mint" data-skin="${it.id}">Wear</button>`)).join("")}</div>
    <h3 class="wr-sub">🎩 Pet accessories</h3><div class="grid g4">${c.outfits.map(it => card(it, accArt(it), (s.pet.looks || {})[it.slot] === it.id ? `<button class="btn small ghost" data-wear="pet" data-id="${it.id}">Take off</button>` : `<button class="btn small mint" data-wear="pet" data-id="${it.id}">Wear</button>`)).join("")}</div>`;
  // 🎁 rewards
  const ch = R.chest(), groups = [["streak", "🔥 Streak gifts"], ["milestone", "🏅 Milestones"], ["badge", "🎖️ Badges & mastery"], ["pet", "🐾 Pet rewards"]];
  const chestHTML = `<div class="card chest-card"><div class="row" style="justify-content:space-between;align-items:center"><h3 style="margin:0">${WR.icon("🎁")} Daily gift chest</h3><span class="muted tiny">Free every day · the prizes are always the same</span></div>
    <div class="chest-days">${ch.list.map((g, i) => { const d = i + 1, cur = d === ch.day, past = d < ch.day || (cur && !ch.ready); return `<div class="chest-day ${cur ? "today" : ""} ${past ? "got" : ""}"><b>Day ${d}</b><span>${giftText(g)}</span>${past ? "✓" : ""}</div>`; }).join("")}</div>
    <div class="row" style="justify-content:center">${ch.ready ? `<button class="btn mint" id="openChest">🎁 Open today's gift (day ${ch.day})</button>` : `<span class="pill">✓ Opened today — come back tomorrow!</span>`}</div></div>`;
  return chestHTML + groups.map(([g, title]) => `<h3 class="wr-sub">${title}</h3><div class="rw-list">${WR.shop.rewards.filter(r => r.group === g).map(r => {
    const got = s.rewards.got.includes(r.id), pr = R.progress(r), it = r.item && R.find(r.item);
    return `<div class="card rw ${got ? "got" : ""}"><span class="rw-ic">${r.icon}</span><div class="rw-tx"><b>${esc(r.name)}</b><div class="muted tiny">${esc(R.how(r))}</div>
      <div class="save-up"><i style="width:${got ? 100 : pr.pct}%"></i></div></div><div class="rw-prize">${r.stars ? `+${r.stars}⭐` : ""}${it ? `<div class="tiny">👗 ${esc(it.name)}</div>` : ""}${got ? '<div class="pill" style="background:var(--mint)">✓</div>' : `<div class="tiny muted">${pr.have.toLocaleString("en")}/${pr.need.toLocaleString("en")}</div>`}</div></div>`;
  }).join("")}</div>`).join("");
}
WR.screens.wardrobe = t => {
  if (t) tab = t; const s = st(); if (!s.pet) return WR.go("home");
  if (!P) resetPreview();
  const col = R.collection();
  WR.view(`<div class="fade-in wardrobe"><div class="row" style="justify-content:space-between;align-items:center"><h1>👗 Wardrobe</h1><span class="chip star">⭐ ${s.stars}</span></div>
    <p class="muted" style="font-weight:800;margin:.2em 0 .6em">Tap anything to try it on ✨ · ${col.have} / ${col.all} looks collected</p>
    <div class="wr-stage" id="wrStage"><div class="wr-hero">${WR.avatarHTML(150, P)}</div><div class="wr-pet">${WR.petHTML("", P)}</div><div class="wr-try" id="wrTry"></div></div>
    <div class="tabs">${TABS.map(([k, l]) => `<button data-wt="${k}" class="${tab === k ? "on" : ""}">${l}</button>`).join("")}</div>
    ${tab === "petlooks" || tab === "rewards" ? itemsHTML() : `<div class="grid g4">${itemsHTML()}</div>`}
    <div class="row" style="justify-content:center;margin-top:14px"><button class="btn ghost small" id="wrShop">🛍️ Shop</button><button class="btn ghost small" id="wrBack">← Map</button></div></div>`);
  const redraw = () => { const k = WR.$("#wrStage"); if (k) { k.querySelector(".wr-hero").innerHTML = WR.avatarHTML(150, P); k.querySelector(".wr-pet").innerHTML = WR.petHTML("", P); } };
  const again = () => { resetPreview(); WR.screens.wardrobe(); };
  document.querySelectorAll("[data-wt]").forEach(b => b.onclick = () => { tab = b.dataset.wt; resetPreview(); WR.screens.wardrobe(); });
  // instant try-on: tapping a card dresses the preview (owned or not); the save only changes with Wear / Take off
  document.querySelectorAll("[data-try]").forEach(el => el.addEventListener("click", ev => {
    if (ev.target.closest("button")) return;
    const it = R.find(el.dataset.try); if (!it) return;
    if (it._cat === "heroes") P.avatar = it.id;
    else if (it._cat === "pets") P.pet = Object.assign(clone(P.pet), { species: it.id, xp: 0, skin: null, looks: {} });
    else if (it._cat === "petskins") P.pet.skin = P.pet.skin === it.id ? null : it.id;
    else if (it._cat === "outfits") R.wear(tab === "petlooks" ? "pet" : "hero", it.id, tab === "petlooks" ? (P.pet.looks = P.pet.looks || {}) : P.looks);
    redraw(); const tr = WR.$("#wrTry"); if (tr) tr.textContent = R.owns(it.id) ? `Trying on ${it.name} ✨` : `Trying on ${it.name} — not yours yet 🔒`;
    WR.sfx("tap");
  }));
  document.querySelectorAll("[data-hero]").forEach(b => b.onclick = () => { R.useHero(b.dataset.hero); again(); });
  document.querySelectorAll("[data-wear]").forEach(b => b.onclick = () => { R.wear(b.dataset.wear, b.dataset.id); WR.sfx("tap"); again(); });
  document.querySelectorAll("[data-skin]").forEach(b => b.onclick = () => { s.pet.skin = s.pet.skin === b.dataset.skin ? null : b.dataset.skin; WR.save(); again(); });
  document.querySelectorAll("[data-pet]").forEach(b => b.onclick = () => { R.choosePet(b.dataset.pet); WR.toast(`${WR.icon("🐾")} ${esc(st().pet.name)} is with you now!`); again(); });
  document.querySelectorAll("[data-buy]").forEach(b => b.onclick = () => { const it = R.find(b.dataset.buy); if (!R.buy(it.id)) return WR.toast("Not enough stars ⭐ — keep learning!"); WR.sfx("level"); WR.confetti(12); WR.toast(`${esc(it.name)} unlocked! 👗`); again(); });
  const oc = WR.$("#openChest"); if (oc) oc.onclick = () => { const g = R.openChest(); if (g) WR.toast(`🎁 ${giftText(g)}!`, 2400); again(); };
  WR.$("#wrShop").onclick = () => WR.go("shop"); WR.$("#wrBack").onclick = () => WR.go("home");
};
})();
