/* App shell: navigation, top bar, onboarding, realm map, realm screen, review, settings. */
(function () {
const WR = window.WR;
const app = document.getElementById("app");
let current = "home";
WR.view = html => { WR.$("#main").innerHTML = html; window.scrollTo({ top: 0 }); };
WR.renderTop = () => {
  const t = WR.$("#top"); if (!t || !WR.state.pet) return;
  const s = WR.state;
  t.innerHTML = `<div class="topbar">${WR.asset(s.avatar) ? WR.img(s.avatar, "mini-av") : '<img class="mini-av" alt="">'}
    <div class="brand">Word Realms <small>${WR.esc(s.name)}</small></div>
    <div class="chips"><span class="chip star" id="starChip">⭐ ${s.stars}</span><span class="chip fire" title="Daily streak">🔥 ${WR.streakAlive()}</span>
    <button class="chip" id="setBtn" aria-label="Settings">⚙️</button></div></div>`;
  WR.$("#setBtn").onclick = settings;
  WR.Garden && WR.Garden.badge();
};
const NAV = [["home", "🗺️", "Map"], ["pet", "🐾", "Pet"], ["shop", "🛍️", "Shop"], ["review", "🌷", "Garden"]];
WR.navActive = k => document.querySelectorAll("#navbar button").forEach(b => b.classList.toggle("on", b.dataset.k === k));
function renderNav() {
  const n = WR.$("#navbar"); n.style.display = "flex";
  n.innerHTML = NAV.map(([k, i, l]) => `<button data-k="${k}"><span>${i}</span>${l}</button>`).join("");
  n.querySelectorAll("button").forEach(b => b.onclick = () => WR.go(b.dataset.k));
}
WR.go = (screen, arg) => {
  WR.stopLesson && WR.stopLesson(); WR.stopSpeaking && WR.stopSpeaking(); WR.stopWriting && WR.stopWriting(); WR.stopPlacement && WR.stopPlacement(); window.Speech && Speech.stop();
  current = screen; WR.navActive(screen === "realm" ? "home" : screen);
  WR.screens[screen](arg); WR.renderTop();
};

/* ---------------- onboarding ---------------- */
function onboarding() {
  WR.$("#navbar").style.display = "none";
  const draft = { name: "", avatar: "avatar_girl", pet: "pet_bunny", level: "a1" };
  const step1 = () => {
    WR.view(`<div class="hero fade-in"><h1>Word Realms</h1><p style="font-size:1.15rem;font-weight:800">A fairytale English adventure from A1 to C2 ✨</p></div>
    <div class="card fade-in"><h2>1. What's your name, adventurer?</h2><input class="input" id="nm" maxlength="18" placeholder="Type your name…">
    <h2 style="margin-top:18px">2. Choose your hero</h2><div class="grid g3">${WR.AVATARS.map(a => `<div class="card pick ${draft.avatar === a.id ? "sel" : ""}" data-av="${a.id}">${WR.img(a.id)}<div class="nm">${a.name}</div></div>`).join("")}</div>
    <div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn" id="n1">Next →</button></div></div>`);
    const nm = WR.$("#nm"); nm.value = draft.name; nm.oninput = () => draft.name = nm.value;
    document.querySelectorAll("[data-av]").forEach(c => c.onclick = () => { draft.avatar = c.dataset.av; document.querySelectorAll("[data-av]").forEach(x => x.classList.toggle("sel", x === c)); WR.sfx("tap"); });
    WR.$("#n1").onclick = () => { if (!draft.name.trim()) { nm.focus(); return WR.toast("Please type your name 💖"); } step2(); };
  };
  const step2 = () => {
    WR.view(`<div class="card fade-in"><h2>3. Adopt your magical pet 🐾</h2><p class="muted" style="font-weight:700">Your pet learns with you, cheers you on, and evolves as you grow!</p>
    <div class="grid g4">${WR.PETS.map(p => `<div class="card pick ${draft.pet === p.id ? "sel" : ""}" data-pet="${p.id}">${WR.img(p.id)}<div class="nm">${p.name}</div><div class="muted" style="font-size:.8rem">Loves ${p.likes}</div></div>`).join("")}</div>
    <h2 style="margin-top:18px">4. Where should your journey begin?</h2><p class="muted" style="font-weight:700">New to English? Start at A1. Already confident? Jump ahead — earlier realms stay open for practice.</p>
    <div class="lvlpick">${WR.realms.map(r => `<button data-lv="${r.id}" class="${draft.level === r.id ? "sel" : ""}">${r.emoji} ${r.level}<br><small>${r.name}</small></button>`).join("")}</div>
    <div class="mirror-pick" id="mirrorBtn"><img src="assets/web/mirror.webp" onerror="this.onerror=null;this.src='assets/ui/mirror.png'" alt=""><div style="flex:1"><b>Not sure? Ask the Magic Mirror 🪞</b><div class="muted" style="font-size:.85rem;font-weight:700">A 3-minute quiz that finds your level (A1–C2) for you.</div></div><span class="btn small">Try it →</span></div>
    <div class="row" style="justify-content:space-between;margin-top:16px"><button class="btn ghost" id="b2">← Back</button><button class="btn mint" id="go">Begin the adventure ✨</button></div></div>`);
    document.querySelectorAll("[data-pet]").forEach(c => c.onclick = () => { draft.pet = c.dataset.pet; document.querySelectorAll("[data-pet]").forEach(x => x.classList.toggle("sel", x === c)); WR.sfx("tap"); });
    document.querySelectorAll("[data-lv]").forEach(c => c.onclick = () => { draft.level = c.dataset.lv; document.querySelectorAll("[data-lv]").forEach(x => x.classList.toggle("sel", x === c)); });
    WR.$("#b2").onclick = step1;
    WR.$("#mirrorBtn").onclick = () => WR.startPlacement({
      onAccept: lv => { draft.level = lv; finish(); },
      onBack: lv => { if (lv) draft.level = lv; step2(); }
    });
    WR.$("#go").onclick = () => finish();
  };
  const finish = () => {
    {
      const s = WR.state, info = WR.PETS.find(p => p.id === draft.pet);
      s.name = draft.name.trim(); s.avatar = draft.avatar; s.startLevel = draft.level;
      s.pet = { species: draft.pet, name: info.name, xp: 0, happiness: 80, hunger: 30, skin: null, lastTick: Date.now(), adopted: Date.now() };
      WR.save(); start(); WR.confetti(); WR.toast(`${info.emoji} ${info.name} is so happy to meet you!`, 2500);
    }
  };
  step1();
}

/* ---------------- home / realm map ---------------- */
WR.screens.home = () => {
  WR.ensureDaily();
  const s = WR.state, total = WR.counts ? (WR.counts.questions || WR.counts.total) : 0, spk = WR.counts ? WR.counts.speaking || 0 : 0;
  const qs = s.daily.quests.map(q => { const d = WR.questDef(q.id); return `<div class="q"><span class="qi">${d.icon}</span><div class="qb"><b>${d.label}</b><div class="prog"><i style="width:${q.progress / d.goal * 100}%"></i></div></div>
    ${q.claimed ? '<span class="pill" style="background:var(--mint)">Done ✓</span>' : q.progress >= d.goal ? `<button class="btn small mint claim" data-id="${q.id}">Claim ${d.reward}⭐</button>` : `<span class="pill">${q.progress}/${d.goal} · ${d.reward}⭐</span>`}</div>`; }).join("");
  WR.view(`<div class="fade-in"><div class="card homehead"><div class="av-big">${WR.avatarHTML(110)}</div>
    <div><h1 style="margin:0">Hello, ${WR.esc(s.name)}! 🌸</h1><div class="muted" style="font-weight:800">${WR.esc(s.pet.name)} says: “${WR.esc(WR.petMood())}”</div>
    <div class="row" style="margin-top:6px"><span class="pill">✅ ${s.totalCorrect} correct answers</span><span class="pill" style="background:var(--butter)">📚 ${total} questions in the realms</span>${spk ? `<span class="pill" style="background:var(--mint)">🎤 ${spk} speaking prompts</span>` : ""}${WR.counts && WR.counts.writing ? `<span class="pill" style="background:#FFE3EF">✒️ ${WR.counts.writing} writing tasks</span>` : ""}${s.placement ? `<span class="pill mirror-pill" id="mirrorPill" style="background:#F3ECFF;cursor:pointer">🪞 Mirror says ${s.placement.level.toUpperCase()}</span>` : `<span class="pill mirror-pill" id="mirrorPill" style="background:#F3ECFF;cursor:pointer">🪞 Find my level</span>`}</div></div></div>
    <div class="grid g2" style="margin-top:14px;align-items:start">
      <div><h2>🗺️ The Realm Map</h2><div class="map"><div class="map-path"></div>${WR.realms.map((r, i) => {
        const un = WR.isUnlocked(i), pr = WR.realmProgress(r.id);
        return `<div class="card realm-node ${un ? "" : "locked"}" data-r="${r.id}" data-i="${i}">${WR.img(r.bg, "thumb", "", true)}
          <div><div><span class="lvl-badge">${r.level}</span><b>${r.emoji} ${r.name}</b>${un ? "" : " 🔒"}</div><div class="muted" style="font-size:.85rem;font-weight:700">${r.modeName}</div>
          <div class="prog"><i style="width:${pr.passed / 4 * 100}%"></i></div><div class="muted" style="font-size:.75rem;font-weight:800">${pr.passed}/4 skills passed</div></div>
          </div>`; }).join("")}</div></div>
      <div><h2>🎯 Daily Quests</h2><div class="card quests">${qs}<p class="muted" style="font-size:.8rem;font-weight:700;margin-bottom:0">New quests every day. Keep your 🔥 streak by finishing one lesson a day!</p></div>
      ${WR.Garden && WR.Garden.dueCount() ? `<div class="card row garden-nudge" id="gardenNudge"><span style="font-size:2rem">💧</span><div style="flex:1"><b>${WR.Garden.dueCount()} plant${WR.Garden.dueCount() > 1 ? "s" : ""} in your Mistake Garden ${WR.Garden.dueCount() > 1 ? "are" : "is"} thirsty</b><div class="muted" style="font-size:.85rem;font-weight:700">A quick review helps tricky words stick.</div></div><button class="btn small mint">Water →</button></div>` : ""}
      <h2>🐾 ${WR.esc(s.pet.name)}</h2><div class="card row" style="cursor:pointer" id="petCard"><div style="width:110px;height:110px">${WR.petHTML()}</div><div style="flex:1">
        <div class="stat" style="grid-template-columns:24px 1fr 34px"><span>💖</span><div class="prog" style="margin:0"><i style="width:${s.pet.happiness}%"></i></div><span>${Math.round(s.pet.happiness)}</span></div>
        <div class="stat" style="grid-template-columns:24px 1fr 34px"><span>🍽️</span><div class="prog" style="margin:0"><i style="width:${100 - s.pet.hunger}%;background:linear-gradient(90deg,#FFE29A,#FFB48A)"></i></div><span>${Math.round(100 - s.pet.hunger)}</span></div>
        <button class="btn small">Visit ${WR.esc(s.pet.name)} →</button></div></div></div></div></div>`);
  document.querySelectorAll(".realm-node").forEach(n => n.onclick = () => {
    if (n.classList.contains("locked")) { const prev = WR.realms[+n.dataset.i - 1]; return WR.toast(`🔒 Pass 3 of 4 skills in ${prev.name} to unlock!`, 2400); }
    WR.go("realm", n.dataset.r);
  });
  document.querySelectorAll(".claim").forEach(b => b.onclick = () => { WR.claimQuest(b.dataset.id); WR.screens.home(); });
  WR.$("#petCard").onclick = () => WR.go("pet");
  const gn = WR.$("#gardenNudge"); if (gn) gn.onclick = () => WR.go("review");
  WR.$("#mirrorPill").onclick = () => WR.retakePlacement();
};

/* ---------------- realm screen ---------------- */
WR.screens.realm = rid => {
  const r = WR.realms.find(x => x.id === rid), pr = WR.realmProgress(rid).p;
  const crowns = k => { const b = pr[k] && pr[k].best; return b == null ? '<span class="muted" style="font-size:.8rem">not played</span>' : "👑".repeat(WR.crowns(b)) + `<span style="opacity:.2">${"👑".repeat(3 - WR.crowns(b))}</span>`; };
  const sizes = WR.counts ? WR.counts.counts : {};
  WR.view(`<div class="fade-in"><div class="realm-hero">${WR.img(r.bg, "bg")}<div class="ov"><span class="lvl-badge">${r.level}</span><b class="title" style="font-size:1.5rem">${r.emoji} ${r.name}</b>
    <p style="margin:.3em 0;font-weight:700">${WR.esc(r.blurb)}</p><span class="pill">Game mode: ${r.modeName}</span></div></div>
    <div class="row" style="margin:12px 0"><button class="btn ghost small" id="backMap">← Map</button></div>
    <div class="grid g4">${WR.SKILLS.map(k => `<div class="card skill-card" data-k="${k.id}"><span class="ico">${k.icon}</span><h3>${k.name}</h3><div class="muted" style="font-size:.85rem;font-weight:700">${k.desc}</div><div class="crowns">${crowns(k.id)}</div><div class="muted" style="font-size:.72rem">${sizes[rid + "/" + k.id] || ""} in bank</div></div>`).join("")}
    ${WR.SPEAKING ? `<div class="card skill-card speak" data-speak="1"><span class="bonus-tag">Bonus</span><span class="ico">🎤</span><h3>Speaking</h3><div class="muted" style="font-size:.85rem;font-weight:700">Echo Well: say it aloud</div><div class="crowns">${crowns("speaking")}</div><div class="muted" style="font-size:.72rem">${sizes[rid + "/speaking"] || ""} prompts · not needed to unlock</div></div>` : ""}
    ${WR.WRITING ? (() => { const w = WR.writingRealmCrowns(rid), n = sizes[rid + "/writing"] || ""; return `<div class="card skill-card quill-tile" data-write="1"><span class="bonus-tag">Bonus</span><img class="ico quill-ico" src="assets/web/quill.webp" onerror="this.onerror=null;this.src='assets/ui/quill.png'" alt=""><h3>Writing</h3><div class="muted" style="font-size:.85rem;font-weight:700">Story Quill: plan, write, get feedback</div><div class="crowns">${w.done ? "👑".repeat(w.crowns) + `<span style="opacity:.2">${"👑".repeat(3 - w.crowns)}</span>` : '<span class="muted" style="font-size:.8rem">not played</span>'}</div><div class="muted" style="font-size:.72rem">${w.done}/${n} tasks written · not needed to unlock</div></div>`; })() : ""}
    <div class="card skill-card special" data-sp="1"><span class="ico">${r.special.emoji}</span><h3>${r.special.name}</h3><div class="muted" style="font-size:.85rem;font-weight:700">${r.special.desc}</div><div class="crowns">${crowns("special")}</div><div class="muted" style="font-size:.72rem">Special game</div></div></div></div>`);
  WR.$("#backMap").onclick = () => WR.go("home");
  document.querySelectorAll("[data-k]").forEach(c => c.onclick = () => { const k = WR.SKILLS.find(x => x.id === c.dataset.k); WR.startLesson({ realm: rid, skill: k.id, key: k.id, title: `${k.name} · ${r.modeName}` }); });
  WR.$("[data-sp]").onclick = () => WR.playSpecial(rid);
  const spk = WR.$("[data-speak]"); if (spk) spk.onclick = () => WR.startSpeaking(rid);
  const wrt = WR.$("[data-write]"); if (wrt) wrt.onclick = () => WR.startWriting(rid);
};

/* review screen (Mistake Garden) lives in js/garden.js */

/* ---------------- settings ---------------- */
function settings() {
  const s = WR.state;
  WR.modal(`<h2>⚙️ Settings</h2>
    <div class="row" style="justify-content:space-between"><b>🔊 Sound effects</b><input type="checkbox" id="snd" ${s.settings.sound ? "checked" : ""}></div>
    <div class="row" style="justify-content:space-between;margin-top:8px"><b>🗣️ Listening speed</b><input type="range" class="slider" id="rt" min="0.5" max="1.3" step="0.1" value="${s.settings.rate}"></div>
    <div class="muted" style="font-size:.8rem;text-align:left">Voice: ${WR.esc(Speech.voiceName())}</div>
    <div class="row" style="justify-content:space-between;margin-top:8px"><b>🗝️ Teacher mode (unlock all realms)</b><input type="checkbox" id="ul" ${s.settings.unlockAll ? "checked" : ""}></div>
    <div class="row" style="justify-content:center;margin-top:16px"><button class="btn ghost small" id="test">🔈 Test voice</button><button class="btn ghost small" id="plRe">🪞 Placement quiz</button><button class="btn peach small" id="rst">Reset progress</button><button class="btn small" id="cls">Done</button></div>`, (bg, close) => {
    bg.querySelector("#snd").onchange = e => { s.settings.sound = e.target.checked; WR.save(); };
    bg.querySelector("#rt").oninput = e => { s.settings.rate = +e.target.value; WR.save(); };
    bg.querySelector("#ul").onchange = e => { s.settings.unlockAll = e.target.checked; WR.save(); if (current === "home") WR.screens.home(); };
    bg.querySelector("#test").onclick = () => Speech.speak("Welcome to Word Realms! Let's learn English together.", s.settings.rate);
    bg.querySelector("#rst").onclick = () => { if (confirm("Reset all progress, stars and your pet?")) { WR.reset(); close(); boot(); } };
    bg.querySelector("#cls").onclick = close;
    bg.querySelector("#plRe").onclick = () => { close(); WR.retakePlacement(); };
  });
}

// retake from the map/settings: a higher result opens more realms; a lower one never locks anything
WR.retakePlacement = () => {
  WR.$("#navbar").style.display = "none";
  const back = () => { WR.$("#navbar").style.display = "flex"; WR.go("home"); };
  WR.startPlacement({ onBack: back, onAccept: lv => {
    const s = WR.state, ids = WR.realms.map(r => r.id);
    if (ids.indexOf(lv) > ids.indexOf(s.startLevel)) { s.startLevel = lv; WR.save(); WR.toast(`🗝️ Realms up to ${lv.toUpperCase()} are now open!`, 2400); }
    WR.$("#navbar").style.display = "flex"; WR.go("realm", lv);
  } });
};
function start() {
  app.innerHTML = `<div id="top"></div><div id="main"></div>`;
  renderNav(); WR.renderTop(); WR.go("home");
}
async function boot() {
  try { await WR.init(); }
  catch (e) { app.innerHTML = `<div class="card center" style="margin-top:40px"><h2>😿 Couldn't load the game data</h2><p>Run it from a web server: <code>python3 -m http.server</code> in the game folder, then open <code>http://localhost:8000</code>.</p><pre>${WR.esc(e.message)}</pre></div>`; return; }
  if (!WR.state.pet || !WR.state.name) { app.innerHTML = `<div id="top"></div><div id="main"></div>`; onboarding(); }
  else start();
}
boot();
})();
