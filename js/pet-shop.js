/* Pet home (feed, pet, ball toss, evolution) and the Star Shop (outfits, pet skins, themes, premium cash stub). */
(function () {
const WR = window.WR;
function bar(icon, label, val, grad) {
  return `<div class="stat"><span>${icon}</span><span>${label}</span><div class="prog" style="margin:0"><i style="width:${Math.round(val)}%;${grad ? "background:" + grad : ""}"></i></div><span>${Math.round(val)}</span></div>`;
}
WR.screens.pet = () => {
  WR.tickPet();
  const p = WR.state.pet, info = WR.petInfo(), lvl = WR.petLevel(p.xp), stage = WR.petStage(lvl);
  const xpIn = p.xp % 80;
  const ownedSkins = WR.shop.petskins.filter(s => WR.state.owned.includes(s.id));
  WR.view(`<div class="grid g2 fade-in">
   <div class="pethome" id="pethome"><div class="floor"></div>
     <div style="position:absolute;top:12px;left:14px;right:14px" class="row"><span class="pill">Lv ${lvl} · ${info.stages[stage]}</span><span class="pill" style="background:var(--mint)">Loves ${info.likes}</span></div>
     <div class="bubble" id="pbubble" style="position:absolute;top:48px;left:50%;transform:translateX(-50%);z-index:4">${WR.esc(WR.petMood())}</div>
     <div class="pet-stage" id="petStage">${WR.petHTML()}</div>
     <div class="ball" id="ball" style="left:24px;bottom:22px" title="Tap to throw!">⚽</div>
   </div>
   <div class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">${info.emoji} ${WR.esc(p.name)}</h2><div class="row" style="gap:6px"><button class="btn ghost small" id="petWard">👗 Dress up</button><button class="btn ghost small" id="rename">✏️ Rename</button></div></div>
     ${bar("💖", "Happy", p.happiness)}${bar("🍽️", "Tummy", 100 - p.hunger, "linear-gradient(90deg,#FFE29A,#FFB48A)")}${bar("✨", "XP", xpIn / 80 * 100, "linear-gradient(90deg,#B9A2FF,#7CC8FF)")}
     <p class="muted" style="font-size:.85rem;font-weight:700">Grows with every correct answer. Evolves at level 5 and level 10! 🌟</p>
     <h3>🍪 Snacks</h3><div class="row">${WR.shop.snacks.map(s => `<button class="btn ghost small snack" data-id="${s.id}">${s.icon} ${s.name} · ${s.price}⭐</button>`).join("")}</div>
     <h3>🎮 Play</h3><p class="muted" style="margin:.2em 0;font-weight:700">Rub ${WR.esc(p.name)} to give cuddles, or tap the ball to play fetch!</p>
     <h3>🎨 Skins</h3><div class="row"><button class="btn ghost small skin" data-id="">Original</button>${ownedSkins.map(s => `<button class="btn ghost small skin" data-id="${s.id}">${s.icon} ${s.name}${p.skin === s.id ? " ✓" : ""}</button>`).join("") || '<span class="muted">Buy skins in the shop 🛍️</span>'}</div>
   </div></div>`);
  const stage$ = WR.$("#petStage"), home = WR.$("#pethome"), bub = WR.$("#pbubble");
  const say = t => { bub.textContent = t; WR.petSay(t); };   // the bubble, read out in the pet's own voice
  const react = cls => { stage$.classList.remove("bounce", "cheer", "sad"); void stage$.offsetWidth; stage$.classList.add(cls); };
  const heart = (x, y, e = "💖") => { const h = document.createElement("div"); h.className = "heart-pop"; h.textContent = e; h.style.left = x + "px"; h.style.top = y + "px"; home.appendChild(h); setTimeout(() => h.remove(), 1100); };
  let lastRub = 0, rubs = 0;
  const rub = ev => {
    const now = Date.now(); if (now - lastRub < 250) return; lastRub = now;
    const r = home.getBoundingClientRect(); heart(ev.clientX - r.left - 12, ev.clientY - r.top - 20, ["💖", "💕", "✨", "🌸"][rubs++ % 4]);
    p.happiness = Math.min(100, p.happiness + 1); WR.save();
    if (rubs % 6 === 0) { WR.Rewards.love(1); react("cheer"); say(["Hehe, that tickles! 😆", "More cuddles please! 🥰", "I love you! 💖"][rubs / 6 % 3 | 0]); WR.sfx("tap"); }
  };
  let down = false;
  stage$.addEventListener("pointerdown", e => { down = true; rub(e); });
  stage$.addEventListener("pointermove", e => { if (down) rub(e); });
  window.addEventListener("pointerup", () => down = false, { once: false });
  stage$.addEventListener("click", e => rub(e));
  WR.$("#ball").onclick = () => {
    const ball = WR.$("#ball"); if (ball.dataset.busy) return; ball.dataset.busy = 1;
    const W = home.clientWidth, tx = 60 + Math.random() * (W - 160);
    ball.animate([{ transform: "translate(0,0) rotate(0)" }, { transform: `translate(${(tx - 24) / 2}px,-180px) rotate(360deg)` }, { transform: `translate(${tx - 24}px,-20px) rotate(720deg)` }], { duration: 900, easing: "ease-out", fill: "forwards" });
    stage$.style.transition = "left .7s ease"; stage$.style.left = Math.max(0, Math.min(W - 220, tx - 90)) + "px";
    setTimeout(() => {
      react("bounce"); heart(tx, home.clientHeight - 230, "⭐"); say("Caught it! 🎾 Again!"); WR.sfx("good");
      p.happiness = Math.min(100, p.happiness + 6); p.hunger = Math.min(100, p.hunger + 2); WR.Rewards.love(1); WR.save(); WR.questEvent("play3");
    }, 850);
    setTimeout(() => { ball.getAnimations().forEach(a => a.cancel()); stage$.style.left = ""; delete ball.dataset.busy; }, 1700);
  };
  document.querySelectorAll(".snack").forEach(b => b.onclick = () => {
    const s = WR.shop.snacks.find(x => x.id === b.dataset.id);
    if (p.hunger < 5) { say("I'm full! Maybe later 😊"); return; }
    if (!WR.spend(s.price)) { WR.toast("Not enough stars ⭐ — try a lesson!"); return; }
    p.hunger = Math.max(0, p.hunger - s.hunger); p.happiness = Math.min(100, p.happiness + s.happy); WR.Rewards.love(2); WR.save();
    WR.questEvent("feed1"); WR.sfx("coin"); react("cheer");
    setTimeout(() => WR.screens.pet(), 900);
    say(`Yum yum! ${s.icon} Thank you!`);
  });
  document.querySelectorAll(".skin").forEach(b => b.onclick = () => { p.skin = b.dataset.id || null; WR.save(); WR.screens.pet(); });
  WR.$("#petWard").onclick = () => WR.go("wardrobe", "petlooks");
  WR.$("#rename").onclick = () => WR.modal(`<h2>Rename your pet</h2><input class="input" id="pn" maxlength="16" value="${WR.esc(p.name)}"><div class="row" style="justify-content:center;margin-top:12px"><button class="btn" id="ok">Save</button></div>`, (bg, close) => {
    bg.querySelector("#ok").onclick = () => { const v = bg.querySelector("#pn").value.trim(); if (v) { p.name = v; WR.save(); } close(); WR.screens.pet(); };
  });
};

/* ---------------- shop ---------------- */
let tab = "outfits";
WR.screens.shop = () => {
  const s = WR.state;
  const tabs = [["outfits", "👗 Outfits"], ["petskins", "🎨 Pet skins"], ["themes", "🌈 Themes"], ["avatars", "🧚 Avatars"]];
  let items = "";
  if (tab === "avatars") {
    items = WR.Rewards.cats().heroes.map(a => { const own = WR.Rewards.owns(a.id), u = WR.Rewards.unlockOf(a);
      const act = own ? `<button class="btn small ${s.avatar === a.id ? "ghost" : "mint"} av" data-id="${a.id}">${s.avatar === a.id ? "Equipped ✓" : "Use"}</button>`
        : a.tier === "earned" ? `<div class="earn-how muted">🏅 ${WR.esc(WR.Rewards.how(u))}</div>`
        : `<button class="btn small buy" data-id="${a.id}" data-tab="heroes" ${s.stars < a.price ? "disabled" : ""}>⭐ ${a.price}</button>`;
      return `<div class="card item ${s.avatar === a.id ? "pick sel" : ""}">${a.tier !== "free" ? `<span class="tier t-${a.tier}">${WR.TIER_NAMES[a.tier]}</span>` : ""}${WR.img(a.id, "prev")}<div class="nm"><b>${WR.esc(a.name)}</b></div><p class="muted">${a.tier === "free" ? "Free" : WR.esc(a.desc || "")}</p>${act}</div>`; }).join("");
  } else {
    const slot = { outfits: "outfit", petskins: "petskin", themes: "theme" }[tab];
    items = WR.shop[tab].map(it => {
      const own = s.owned.includes(it.id), eq = (slot === "petskin" ? s.pet.skin : slot === "outfit" ? (s.looks || {})[it.slot] : s.equipped[slot]) === it.id;
      let prev = slot === "outfit" ? `<img class="acc-prev" src="${WR.layerSrc(it.art)}" alt="" loading="lazy">` : `<span class="ic">${it.icon}</span>`;
      if (slot === "petskin") prev = `<div style="width:90px;height:90px;margin:auto" class="${it.sparkle ? "sparkle-skin" : ""} ${it.rainbow ? "rainbow-skin" : ""}">${WR.img(s.pet.species, "prev", it.filter ? "filter:" + it.filter : "")}</div>`;
      if (slot === "theme") prev = `<div style="height:60px;border-radius:14px;margin:6px 0;background:linear-gradient(135deg,${it.vars["--bg1"]},${it.vars["--bg2"]});border:3px solid ${it.vars["--accent"]}"></div>`;
      const action = own ? `<button class="btn small ${eq ? "ghost" : "mint"} eq" data-id="${it.id}" data-slot="${slot}">${eq ? "Unequip" : "Equip"}</button>`
        : it.premium ? `<button class="btn small ask-grownup askgu" data-id="${it.id}" data-tab="${tab}">Ask a grown-up 💖</button>`
        : it.earnedOnly ? `<div class="earn-how muted">🏅 ${WR.esc(WR.Rewards.how(WR.Rewards.unlockOf(it)) || "Earned by mastery")}</div>`
        : `<button class="btn small buy" data-id="${it.id}" data-tab="${tab}" ${s.stars < it.price ? "disabled" : ""}>⭐ ${it.price}</button>${s.stars < it.price ? `<div class="save-up" title="Saving up"><i style="width:${Math.round(s.stars / it.price * 100)}%"></i></div>` : ""}`;
      const tier = !it.premium && it.tier ? `<span class="tier t-${it.tier}">${WR.TIER_NAMES[it.tier] || it.tier}</span>` : "";
      return `<div class="card item ${it.premium ? "premium" : ""}">${it.premium ? '<span class="badge">PREMIUM</span>' : ""}${tier}${prev}<div><b>${WR.esc(it.name)}</b></div><p class="muted" style="font-size:.85rem;min-height:2.4em">${WR.esc(it.desc)}</p>${action}</div>`;
    }).join("");
  }
  WR.view(`<div class="fade-in"><div class="row" style="justify-content:space-between"><h1>🛍️ Star Shop</h1><span class="chip star">⭐ ${s.stars}</span></div>
    <div class="row" style="justify-content:space-between;align-items:center"><p class="muted" style="font-weight:700;margin:.4em 0;flex:1;min-width:200px">Earn stars from lessons, combos and daily quests ✨ Special ✨ items need a grown-up.</p><button class="btn small mint" id="toWardrobe">👗 Wardrobe</button><button class="btn small grownups-btn" id="grownups">👪 Grown-ups</button></div>
    <div class="row" style="gap:16px"><div>${WR.avatarHTML(120)}</div><div style="width:120px;height:120px">${WR.petHTML()}</div></div>
    <div class="tabs">${tabs.map(([k, l]) => `<button data-t="${k}" class="${tab === k ? "on" : ""}">${l}</button>`).join("")}</div>
    <div class="grid g4">${items}</div></div>`);
  document.querySelectorAll(".tabs button").forEach(b => b.onclick = () => { tab = b.dataset.t; WR.screens.shop(); });
  document.querySelectorAll(".av").forEach(b => b.onclick = () => { s.avatar = b.dataset.id; WR.save(); WR.renderTop(); WR.screens.shop(); });
  document.querySelectorAll(".buy").forEach(b => b.onclick = () => {
    const it = WR.shop[b.dataset.tab].find(x => x.id === b.dataset.id);
    if (!WR.spend(it.price)) return WR.toast("Not enough stars ⭐");
    WR.grantItem(it.id); WR.sfx("level"); WR.confetti(12); WR.toast(`${it.icon} ${it.name} unlocked!`);
    if (b.dataset.tab === "heroes") { s.avatar = it.id; WR.save(); WR.renderTop(); return WR.screens.shop(); }
    equip(it.id, { outfits: "outfit", petskins: "petskin", themes: "theme" }[b.dataset.tab]);
  });
  document.querySelectorAll(".eq").forEach(b => b.onclick = () => equip(b.dataset.id, b.dataset.slot, true));
  // 👪 T19: children see "Ask a grown-up 💖"; prices and cash buttons only appear behind the parent gate
  document.querySelectorAll(".askgu").forEach(b => b.onclick = () => grownupShop(b.dataset.id));
  WR.$("#grownups").onclick = () => grownupShop();
  WR.$("#toWardrobe").onclick = () => WR.go("wardrobe");
  function grownupShop(focusId) {
    WR.parentGate(() => {
      const all = ["outfits", "petskins", "themes"].flatMap(t => WR.shop[t].filter(x => x.premium).map(x => ({ ...x, _tab: t })));
      WR.modal(`<h2>👪 Grown-ups · Special items</h2>
        <div class="gu-note">💡 Real payments aren't switched on yet. "Buy" calls the <code>PaymentHook</code> stub in <code>js/payments.js</code>; no money is ever charged.</div>
        <div class="gu-list">${all.map(x => `<div class="gu-item" ${x.id === focusId ? 'style="outline:3px solid var(--accent)"' : ""}><span class="ic">${x.icon}</span><div class="nm">${WR.esc(x.name)}<small>${WR.esc(x.desc)}</small></div>${s.owned.includes(x.id) ? '<span class="pill" style="background:var(--mint)">Owned ✓</span>' : `<button class="btn small peach cash" data-id="${x.id}" data-tab="${x._tab}">💳 Buy ${WR.esc(x.cash)}</button>`}</div>`).join("")}</div>
        <div class="row" style="justify-content:center"><button class="btn ghost small" id="guShopClose">Close</button></div>`, (bg, close) => {
        bg.querySelector("#guShopClose").onclick = close;
        bg.querySelectorAll(".cash").forEach(b => b.onclick = () => { close(); cashCheckout(WR.shop[b.dataset.tab].find(x => x.id === b.dataset.id)); });
      });
    }, { why: "Special items are bought by a grown-up." });
  }
  function cashCheckout(it) {
    WR.parentGate(async () => {
      const res = await PaymentHook.purchase(it);
      WR.modal(`<h2>💳 Cash checkout</h2><div style="font-size:3rem">${it.icon}</div><p><b>${WR.esc(it.name)}</b> · ${it.cash}</p>
        <p class="muted" style="font-weight:700">Real payments aren't connected yet. This button calls the <code>PaymentHook</code> stub in <code>js/payments.js</code>, ready to wire to Stripe Checkout later. No money is charged.</p>
        <div class="row" style="justify-content:center">${res.status === "demo" ? `<button class="btn peach" id="demo">✨ Demo unlock (no charge)</button>` : ""}<button class="btn ghost" id="cl">Close</button></div>`, (bg, close) => {
        bg.querySelector("#cl").onclick = close;
        const d = bg.querySelector("#demo"); if (d) d.onclick = () => { WR.grantItem(it.id); close(); WR.toast(`${it.icon} Demo unlocked`); WR.screens.shop(); };   // this checkout only opens after the PIN (R4)
      });
    }, { why: "Special items are bought by a grown-up.", money: true });
  }
  function equip(id, slot, toggle) {
    if (slot === "petskin") s.pet.skin = toggle && s.pet.skin === id ? null : id;
    else if (slot === "outfit") { const it = WR.accessory(id), L = s.looks = s.looks || {}; if (toggle && L[it.slot] === id) delete L[it.slot]; else L[it.slot] = id; }   // one item per slot (js/wardrobe.js)
    else s.equipped[slot] = toggle && s.equipped[slot] === id ? null : id;
    WR.save(); WR.applyTheme(); WR.renderTop(); WR.screens.shop();
  }
};
})();
