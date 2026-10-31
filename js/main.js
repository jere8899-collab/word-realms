/* App shell: navigation, top bar, onboarding, realm map, realm screen, review, settings. */
(function () {
const WR = window.WR;
const app = document.getElementById("app");
let current = "home";
WR.view = html => { WR.$("#main").innerHTML = html; window.scrollTo({ top: 0 }); };
WR.current = () => current;
WR.renderTop = () => {
  const t = WR.$("#top"); if (!t || !WR.state.pet) return;
  const s = WR.state;
  t.innerHTML = `<div class="topbar">${WR.asset(s.avatar) ? WR.img(s.avatar, "mini-av") : '<img class="mini-av" alt="">'}
    <div class="brand">Word Realms <small>${WR.esc(s.name)}</small></div>
    <div class="chips"><span class="chip star" id="starChip">⭐ ${s.stars}</span><span class="chip fire" title="Daily streak">🔥 ${WR.streakAlive()}</span>
    ${WR.Cloud ? WR.Cloud.chipHTML() : ""}<button class="chip" id="setBtn" aria-label="Settings">⚙️</button></div></div>`;
  WR.$("#setBtn").onclick = settings;
  if (WR.Cloud) { WR.$("#cloudChip").onclick = () => WR.Cloud.open(); WR.Cloud.paint(); }
  WR.Garden && WR.Garden.badge();
};
const NAV = [["home", "🗺️", "Map"], ["math", "🔢", "Maths"], ["pet", "🐾", "Pet"], ["shop", "🛍️", "Shop"], ["review", "🌷", "Garden"]];
WR.navActive = k => document.querySelectorAll("#navbar button").forEach(b => b.classList.toggle("on", b.dataset.k === k));
function renderNav() {
  const n = WR.$("#navbar"); n.style.display = "flex";
  n.innerHTML = NAV.map(([k, i, l]) => `<button data-k="${k}"><span>${i}</span>${l}</button>`).join("");
  // one delegated listener on the bar itself, so no screen can overwrite a tab button's handler
  if (!n.dataset.wired) { n.dataset.wired = "1"; n.addEventListener("click", e => { const b = e.target.closest("button[data-k]"); if (b && n.contains(b)) WR.go(b.dataset.k); }); }
}
// every running activity is stopped when the screen changes (each module defines its own WR.stopX)
const STOPS = ["stopLesson", "stopSpeaking", "stopWriting", "stopStory", "stopPlacement", "stopMath", "stopPhonics"];
WR.go = (screen, arg) => {
  STOPS.forEach(n => WR[n] && WR[n]()); window.Speech && Speech.stop();
  current = screen; WR.navActive(screen === "realm" ? "home" : /^(math|dojo|dojoGrid|clock)$/.test(screen) ? "math" : screen);
  WR.screens[screen](arg); WR.renderTop();
};

/* ---------------- onboarding ---------------- */
function onboarding() {
  WR.$("#navbar").style.display = "none";
  const draft = { name: "", avatar: "avatar_girl", pet: "pet_bunny", level: "a1" };
  // 📱 T6: three short steps (name + hero → pet → starting realm), each fitting one phone screen with its button visible
  const dots = n => `<div class="onb-dots" aria-label="Step ${n} of 3">${[1, 2, 3].map(k => `<i class="${k === n ? "on" : ""}"></i>`).join("")}</div>`;
  const step1 = () => {
    WR.view(`<div class="onb"><div class="hero fade-in"><h1>Word Realms</h1><p style="font-size:1.15rem;font-weight:800">A fairytale English adventure from A1 to C2 ✨</p></div>${dots(1)}
    <div class="card fade-in"><h2>What's your name, adventurer?</h2><input class="input" id="nm" maxlength="20" placeholder="Type your name…" autocomplete="nickname">
    <h2 style="margin-top:14px">Choose your hero</h2><div class="onb-heroes">${WR.AVATARS.map(a => `<div class="card pick ${draft.avatar === a.id ? "sel" : ""}" data-av="${a.id}" role="button" tabindex="0">${WR.img(a.id)}<div class="nm">${a.name}</div></div>`).join("")}</div>
    <div class="onb-next" style="justify-content:flex-end"><button class="btn" id="n1">Next →</button></div></div>
    ${WR.Cloud ? `<div class="card fade-in cc-onb" id="ccOnb"><img src="assets/web/cloud_castle.webp" onerror="this.onerror=null;this.src='assets/ui/cloud_castle.png'" alt=""><div style="flex:1"><b>Already have a Cloud Castle account? ☁️</b><div class="muted" style="font-size:.85rem;font-weight:700">Log in to bring back your stars, pet and skins.</div></div><span class="btn small mint">Log in →</span></div>` : ""}</div>`);
    const onb = WR.$("#ccOnb"); if (onb) onb.onclick = () => WR.Cloud.open("login");
    const nm = WR.$("#nm"); nm.value = draft.name; nm.oninput = () => draft.name = nm.value;
    nm.onkeydown = e => { if (e.key === "Enter") { nm.blur(); } };
    document.querySelectorAll("[data-av]").forEach(c => c.onclick = () => { draft.avatar = c.dataset.av; document.querySelectorAll("[data-av]").forEach(x => x.classList.toggle("sel", x === c)); WR.sfx("tap"); });
    WR.$("#n1").onclick = () => { if (!draft.name.trim()) { nm.focus(); return WR.toast("Please type your name 💖"); } step2(); };
  };
  const step2 = () => {
    WR.view(`<div class="onb">${dots(2)}<div class="card fade-in"><h2>Adopt your magical pet 🐾</h2><p class="muted" style="font-weight:700;margin:.2em 0 .6em">Your pet learns with you, cheers you on, and grows as you do!</p>
    <div class="onb-pets">${WR.PETS.map(p => `<div class="card pick ${draft.pet === p.id ? "sel" : ""}" data-pet="${p.id}" role="button" tabindex="0">${WR.img(p.id)}<div class="nm">${p.name}</div><div class="muted" style="font-size:.8rem">Loves ${p.likes}</div></div>`).join("")}</div>
    <div class="onb-next"><button class="btn ghost" id="b1">← Back</button><button class="btn" id="n2">Next →</button></div></div></div>`);
    document.querySelectorAll("[data-pet]").forEach(c => c.onclick = () => { draft.pet = c.dataset.pet; document.querySelectorAll("[data-pet]").forEach(x => x.classList.toggle("sel", x === c)); WR.sfx("tap"); });
    WR.$("#b1").onclick = step1; WR.$("#n2").onclick = step3;
  };
  const step3 = () => {
    WR.view(`<div class="onb">${dots(3)}<div class="card fade-in"><h2>Where should your journey begin?</h2><p class="muted" style="font-weight:700;margin:.2em 0 .6em">New to English? Start at A1. Already confident? Jump ahead. Earlier realms stay open for practice.</p>
    <div class="lvlpick">${WR.realms.map(r => `<button data-lv="${r.id}" class="${draft.level === r.id ? "sel" : ""}">${r.emoji} ${r.level}<br><small>${r.name}</small></button>`).join("")}</div>
    <div class="mirror-pick" id="mirrorBtn" role="button" tabindex="0"><img src="assets/web/mirror.webp" onerror="this.onerror=null;this.src='assets/ui/mirror.png'" alt=""><div style="flex:1"><b>Not sure? Ask the Magic Mirror 🪞</b><div class="muted" style="font-size:.85rem;font-weight:700">A 3-minute quiz finds your level for you.</div></div><span class="btn small">Try it →</span></div>
    <div class="onb-next"><button class="btn ghost" id="b2">← Back</button><button class="btn mint" id="go">Begin the adventure ✨</button></div></div></div>`);
    document.querySelectorAll("[data-lv]").forEach(c => c.onclick = () => { draft.level = c.dataset.lv; document.querySelectorAll("[data-lv]").forEach(x => x.classList.toggle("sel", x === c)); });
    WR.$("#b2").onclick = step2;
    WR.$("#mirrorBtn").onclick = () => WR.startPlacement({
      onAccept: lv => { draft.level = lv; finish(); },
      onBack: lv => { if (lv) draft.level = lv; step3(); }
    });
    WR.$("#go").onclick = () => finish();
  };
  const finish = () => {
    {
      const s = WR.state, info = WR.PETS.find(p => p.id === draft.pet);
      s.name = draft.name.trim(); s.avatar = draft.avatar; s.startLevel = draft.level;
      s.pet = { species: draft.pet, name: info.name, xp: 0, happiness: 80, hunger: 30, skin: null, lastTick: Date.now(), adopted: Date.now() };
      WR.save(); start(); WR.sfx("level"); WR.toast(`${info.emoji} ${info.name} is so happy to meet you!`, 2500);
    }
  };
  step1();
}

/* ---------------- home / realm map ---------------- */
// ▶ T7: what to play next — the first open realm (from the starting level) that hasn't opened the next one yet, and its
// next unplayed (else weakest) skill; plus a child-facing goal ("2 more skills to open Candy Village 🍬")
WR.continueTarget = () => {
  if (!WR.realms) return null;
  const s = WR.state, start = Math.max(0, WR.realms.findIndex(r => r.id === s.startLevel));
  let idx = -1;
  for (let i = start; i < WR.realms.length; i++) { if (!WR.isUnlocked(i)) break; if (WR.realmProgress(WR.realms[i].id).passed < 3) { idx = i; break; } }
  if (idx < 0) for (let i = WR.realms.length - 1; i >= start; i--) if (WR.isUnlocked(i) && WR.realmProgress(WR.realms[i].id).passed < 4) { idx = i; break; }
  if (idx < 0) idx = WR.realms.length - 1;
  const realm = WR.realms[idx], pr = WR.realmProgress(realm.id), skill = WR.nextSkill ? WR.nextSkill(realm.id) : WR.SKILLS[0];
  const plays = (pr.p[skill.id] && pr.p[skill.id].plays) || 0, nx = WR.realms[idx + 1], need = 3 - pr.passed;
  const goal = nx && need > 0 ? `${need} more skill${need > 1 ? "s" : ""} to open ${nx.name} ${nx.emoji}` : nx ? `${nx.name} ${nx.emoji} is open! Collect all 4 skill crowns here too 👑` : pr.passed < 4 ? `${4 - pr.passed} more skill${4 - pr.passed > 1 ? "s" : ""} to master the last realm 👑` : "Every realm is yours! Keep polishing your crowns 👑";
  return { realm, skill, lesson: plays + 1, goal };
};
// friendly "what's waiting" line for a skill tile (T15: instead of "30 in bank")
WR.waitingText = (rid, k) => {
  const size = (WR.counts && WR.counts.counts && WR.counts.counts[rid + "/" + k]) || 0, seen = ((WR.state.seen || {})[rid + "/" + k] || []).length;
  const p = (WR.state.progress[rid] || {})[k];
  const lessons = k === "reading" ? Math.floor((Math.round(size / 3.5) - seen) / 2) : Math.floor((size - seen) / 8);
  if (!p) return "✨ New adventure!";
  return lessons >= 1 ? `🎁 ${lessons} new lesson${lessons > 1 ? "s" : ""} waiting!` : "🔁 Practise to polish your crowns";
};
WR.screens.home = () => {
  WR.ensureDaily();
  const s = WR.state, cont = WR.continueTarget(), due = WR.Garden ? WR.Garden.dueCount() : 0;
  const qs = s.daily.quests.map(q => { const d = WR.questDef(q.id); return `<div class="q"><span class="qi">${d.icon}</span><div class="qb"><b>${d.label}</b><div class="prog"><i style="width:${q.progress / d.goal * 100}%"></i></div></div>
    ${q.claimed ? '<span class="pill" style="background:var(--mint)">Done ✓</span>' : q.progress >= d.goal ? `<button class="btn small mint claim" data-id="${q.id}">Claim ${d.reward}⭐</button>` : `<span class="pill">${q.progress}/${d.goal} · ${d.reward}⭐</span>`}</div>`; }).join("");
  WR.view(`<div class="fade-in"><div class="card homehead"><div class="av-big">${WR.avatarHTML(110)}</div>
    <div><h1 style="margin:0">Hello, <span class="hero-nm">${WR.esc(s.name)}</span>! 🌸 <button class="chip hero-edit" id="heroEditHome" aria-label="Change my hero name" title="Change my hero name">✏️</button></h1><div class="muted" style="font-weight:800">${WR.esc(s.pet.name)} says: “${WR.esc(WR.petMood())}”</div>
    <div class="row" style="margin-top:6px"><span class="pill">✅ ${s.totalCorrect} correct answers</span>${WR.STORY ? `<span class="pill" id="bookPill" style="background:#FFF1D6;cursor:pointer">📜 Storybook ${WR.storyPagesFound()}/6 pages</span>` : ""}${s.placement ? `<span class="pill mirror-pill" id="mirrorPill" style="background:#F3ECFF;cursor:pointer">🪞 Mirror says ${s.placement.level.toUpperCase()}</span>` : `<span class="pill mirror-pill" id="mirrorPill" style="background:#F3ECFF;cursor:pointer">🪞 Find my level</span>`}</div></div></div>
    ${cont ? `<div class="card continue" id="continueCard"><div class="ct"><b>${cont.realm.emoji} ${cont.realm.level} ${WR.esc(cont.skill.name)} <span style="font-weight:700">(lesson ${cont.lesson})</span></b><small>${WR.esc(cont.goal)}</small></div><button class="btn mint" id="continueBtn">▶ Continue</button></div>` : ""}
    <div class="grid g2" style="margin-top:14px;align-items:start">
      <div><h2 class="map-h">🗺️ The Realm Map</h2><div class="map"><div class="map-path"></div>${WR.realms.map((r, i) => {
        const un = WR.isUnlocked(i), pr = WR.realmProgress(r.id);
        return `<div class="card realm-node ${un ? "" : "locked"}" data-r="${r.id}" data-i="${i}">${WR.img(r.bg, "thumb", "", true)}
          <div><div><span class="lvl-badge">${r.level}</span><b>${r.emoji} ${r.name}</b>${un ? "" : " 🔒"}</div><div class="muted" style="font-size:.85rem;font-weight:700">${r.modeName}</div>
          <div class="prog"><i style="width:${pr.passed / 4 * 100}%"></i></div><div class="muted" style="font-size:.75rem;font-weight:800">${pr.passed}/4 skills passed</div></div>
          </div>`; }).join("")}</div>
      ${WR.phonicsNode ? WR.phonicsNode() : ""}
      ${WR.Math ? `<div class="card math-node" id="mathNode" style="margin-top:14px">${WR.img("bg_math", "thumb", "", true)}<div style="flex:1"><div><span class="lvl-badge">G1–12</span><b>🔢 Number Kingdom</b></div><div class="muted" style="font-size:.85rem;font-weight:700">Maths quests + 🗼 Times-Table Tower</div><div class="muted" style="font-size:.75rem;font-weight:800">👑 ${WR.Math.totalCrowns()} crowns · 🌟 ${WR.Math.mastered()}/132 facts${s.math && s.math.grade ? ` · Grade ${s.math.grade}` : ""}</div></div></div>` : ""}</div>
      <div><div id="homeGoals"></div><h2>🎯 Daily Quests</h2><div class="card quests">${qs}<p class="muted" style="font-size:.8rem;font-weight:700;margin-bottom:0">New quests every day. Keep your 🔥 streak by finishing one lesson a day!</p></div>
      ${due ? `<div class="card row garden-nudge" id="gardenNudge"><span style="font-size:2rem">💧</span><div style="flex:1"><b>${due} plant${due > 1 ? "s" : ""} in your Mistake Garden ${due > 1 ? "are" : "is"} thirsty</b><div class="muted" style="font-size:.85rem;font-weight:700">A quick review helps tricky words stick.</div></div><button class="btn small mint">Water →</button></div>` : ""}
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
  const he = WR.$("#heroEditHome"); if (he) he.onclick = e => { e.stopPropagation(); WR.openRename(); };
  const mn = WR.$("#mathNode"); if (mn) mn.onclick = () => WR.go("math");
  const gn = WR.$("#gardenNudge"); if (gn) gn.onclick = () => WR.go("review");
  const cc = WR.$("#continueCard"); if (cc) cc.onclick = () => WR.startLesson({ realm: cont.realm.id, skill: cont.skill.id, key: cont.skill.id, title: `${cont.skill.name} · ${cont.realm.modeName}` });
  WR.$("#mirrorPill").onclick = () => WR.retakePlacement();
  const bp = WR.$("#bookPill"); if (bp) bp.onclick = () => WR.openStorybook();
  const pn = WR.$("#phonicsNode"); if (pn) pn.onclick = () => WR.go("phonics");
};

/* ---------------- realm screen ---------------- */
WR.screens.realm = rid => {
  const r = WR.realms.find(x => x.id === rid), pr = WR.realmProgress(rid).p;
  const crowns = k => { const b = pr[k] && pr[k].best; return WR.crownCell(b == null ? null : WR.crowns(b)); };
  const sizes = WR.counts ? WR.counts.counts : {};
  WR.view(`<div class="fade-in"><div class="realm-hero">${WR.img(r.bg, "bg")}<div class="ov"><span class="lvl-badge">${r.level}</span><b class="title" style="font-size:1.5rem">${r.emoji} ${r.name}</b>
    <p style="margin:.3em 0;font-weight:700">${WR.esc(r.blurb)}</p><span class="pill">Game mode: ${r.modeName}</span></div></div>
    <div class="row" style="margin:12px 0"><button class="btn ghost small" id="backMap">← Map</button></div>
    <div class="grid g4">${WR.SKILLS.map(k => `<div class="card skill-card" data-k="${k.id}"><span class="ico">${k.icon}</span><h3>${k.name}</h3><div class="muted" style="font-size:.85rem;font-weight:700">${k.desc}</div><div class="crowns">${crowns(k.id)}</div><div class="waiting-tag">${WR.waitingText(rid, k.id)}</div></div>`).join("")}
    ${WR.SPEAKING ? `<div class="card skill-card speak" data-speak="1"><span class="bonus-tag">Bonus</span><span class="ico">🎤</span><h3>Speaking</h3><div class="muted" style="font-size:.85rem;font-weight:700">Echo Well: say it aloud</div><div class="crowns">${crowns("speaking")}</div><div class="waiting-tag">🎶 Bonus fun!</div></div>` : ""}
    ${WR.WRITING ? (() => { const w = WR.writingRealmCrowns(rid), n = sizes[rid + "/writing"] || ""; return `<div class="card skill-card quill-tile" data-write="1"><span class="bonus-tag">Bonus</span><img class="ico quill-ico" src="assets/web/quill.webp" onerror="this.onerror=null;this.src='assets/ui/quill.png'" alt=""><h3>Writing</h3><div class="muted" style="font-size:.85rem;font-weight:700">Story Quill: plan, write, get feedback</div><div class="crowns">${WR.crownCell(w.done ? w.crowns : null)}</div><div class="waiting-tag">${w.done ? `✒️ ${w.done}/${n} stories written` : "🎶 Bonus fun!"}</div></div>`; })() : ""}
    ${WR.STORY ? WR.storyTile(rid) : ""}
    ${WR.phonicsTile ? WR.phonicsTile(rid) : ""}
    <div class="card skill-card special" data-sp="1"><span class="ico">${r.special.emoji}</span><h3>${r.special.name}</h3><div class="muted" style="font-size:.85rem;font-weight:700">${r.special.desc}</div><div class="crowns">${crowns("special")}</div><div class="muted" style="font-size:.72rem">Special game</div></div></div></div>`);
  WR.$("#backMap").onclick = () => WR.go("home");
  // only the skill cards: the bottom tab bar buttons also carry data-k and must keep their own handler
  WR.$("#main").querySelectorAll(".skill-card[data-k]").forEach(c => c.onclick = () => { const k = WR.SKILLS.find(x => x.id === c.dataset.k); if (!k) return; WR.startLesson({ realm: rid, skill: k.id, key: k.id, title: `${k.name} · ${r.modeName}` }); });
  WR.$("[data-sp]").onclick = () => WR.playSpecial(rid);
  const spk = WR.$("[data-speak]"); if (spk) spk.onclick = () => WR.startSpeaking(rid);
  const wrt = WR.$("[data-write]"); if (wrt) wrt.onclick = () => WR.startWriting(rid);
  const sty = WR.$("[data-story]"); if (sty) sty.onclick = () => WR.startStory(rid);
  const phx = WR.$("[data-phonics]"); if (phx) phx.onclick = () => WR.go("phonics");
};

/* review screen (Mistake Garden) lives in js/garden.js */

/* ---------------- hero (display) name ---------------- */
WR.HERO_MAX = 20;
WR.cleanHeroName = n => String(n == null ? "" : n).replace(/[\u0000-\u001f\u007f<>]/g, "").replace(/\s+/g, " ").trim();
WR.heroNameError = n => {
  const c = WR.cleanHeroName(n);
  if (!c) return "Please type a name for your hero 💖";
  if ([...c].length > WR.HERO_MAX) return `Please keep your hero name to ${WR.HERO_MAX} characters or fewer.`;
  return null;
};
// rename the hero everywhere: the save (so it cloud-syncs), the top bar and the map greeting
WR.renameHero = n => {
  const e = WR.heroNameError(n); if (e) throw new Error(e);
  const c = WR.cleanHeroName(n), s = WR.state;
  if (c === s.name) return c;
  s.name = c; WR.save(); WR.renderTop();
  document.querySelectorAll(".hero-nm").forEach(x => x.textContent = c);
  if (current === "home" && WR.screens.home) WR.screens.home();
  return c;
};
WR.openRename = () => {
  const s = WR.state;
  WR.modal(`<div class="rename-panel"><div style="width:96px;height:96px;margin:0 auto">${WR.avatarHTML(96)}</div><h2 style="margin:.3em 0">🦸 Change your hero name</h2>
    <p class="muted" style="font-weight:700;margin-top:0">This is the name the realms call you. Your stars, pet and progress stay the same.</p>
    <form id="heroForm" novalidate><label class="cc-lbl">Hero name <small>(1–${WR.HERO_MAX} characters)</small><input class="input" id="heroName" maxlength="${WR.HERO_MAX + 10}" autocomplete="nickname" value="${WR.esc(s.name || "")}"></label>
    <div class="row" style="justify-content:space-between"><div class="cc-err" id="heroErr" role="alert"></div><small class="muted" id="heroCount" style="font-weight:800"></small></div>
    <div class="row" style="justify-content:center;margin-top:10px"><button class="btn ghost small" type="button" id="heroCancel">Cancel</button><button class="btn mint" type="submit" id="heroSave">✨ Save name</button></div></form></div>`, (bg, close) => {
    const i = bg.querySelector("#heroName"), err = bg.querySelector("#heroErr"), cnt = bg.querySelector("#heroCount"), go = bg.querySelector("#heroSave");
    const upd = () => { const c = WR.cleanHeroName(i.value), e = i.value ? WR.heroNameError(i.value) : null; cnt.textContent = `${[...c].length}/${WR.HERO_MAX}`; err.textContent = e || ""; go.disabled = !!WR.heroNameError(i.value); };
    i.oninput = upd; upd(); setTimeout(() => { i.focus(); i.select(); }, 30);
    bg.querySelector("#heroCancel").onclick = close;
    bg.querySelector("#heroForm").onsubmit = ev => {
      ev.preventDefault();
      try { const was = s.name, c = WR.renameHero(i.value); close(); WR.sfx("level"); WR.toast(c === was ? "That's already your name 😊" : `✨ Hello, ${WR.esc(c)}!`, 2200); }
      catch (x) { err.textContent = x.message; }
    };
  });
};

/* ---------------- settings ---------------- */
function settings() {
  const s = WR.state;
  WR.modal(`<h2>⚙️ Settings</h2>
    <div class="row hero-row" style="justify-content:space-between;margin-bottom:8px"><b>🦸 Hero name</b><span class="hero-cur"><span id="heroCur">${WR.esc(s.name)}</span> <button class="btn ghost small" id="heroEdit">✏️ Change</button></span></div>
    <label class="set-row"><span>🔊 Sound effects</span><input type="checkbox" id="snd" ${s.settings.sound ? "checked" : ""}></label>
    <div class="set-row" style="cursor:default"><span>🗣️ Listening speed</span><input type="range" class="slider" id="rt" min="0.5" max="1.3" step="0.1" value="${s.settings.rate}" aria-label="Listening speed"></div>
    <div class="row" style="justify-content:center;margin-top:16px"><button class="btn ghost small grownups-btn" id="guBtn">👪 Grown-ups</button><button class="btn ghost small" id="test">🔈 Test voice</button><button class="btn ghost small" id="plRe">🪞 Placement quiz</button>${WR.Cloud ? '<button class="btn ghost small" id="ccSet">🏰 Cloud save</button>' : ""}<button class="btn peach small" id="rst">Reset progress</button><button class="btn small" id="cls">Done</button></div>`, (bg, close) => {
    bg.querySelector("#snd").onchange = e => { s.settings.sound = e.target.checked; WR.save(); };
    bg.querySelector("#rt").oninput = e => { s.settings.rate = +e.target.value; WR.save(); };
    bg.querySelector("#guBtn").onclick = () => { close(); WR.openGrownups(); };
    bg.querySelector("#test").onclick = () => Speech.speak("Welcome to Word Realms! Let's learn English together.", s.settings.rate);
    bg.querySelector("#rst").onclick = () => { if (confirm("Reset all progress, stars and your pet?")) { WR.reset(); close(); boot(); } };
    bg.querySelector("#cls").onclick = close;
    bg.querySelector("#heroEdit").onclick = () => { close(); WR.openRename(); };
    bg.querySelector("#plRe").onclick = () => { close(); WR.retakePlacement(); };
    const cs = bg.querySelector("#ccSet"); if (cs) cs.onclick = () => { close(); WR.Cloud.open(); };
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
// redraw after the save was replaced (cloud login / log out & clear); before the data has loaded, boot() draws it
WR.restart = () => {
  if (!WR.realms || !WR.shop) return;
  document.querySelectorAll(".modal-bg").forEach(m => { if (!m.querySelector("#cloudPanel")) m.remove(); });
  WR.tickPet(); WR.ensureDaily(); WR.applyTheme();
  if (!WR.state.pet || !WR.state.name) { app.innerHTML = `<div id="top"></div><div id="main"></div>`; onboarding(); }
  else start();
};
async function boot() {
  try { await WR.init(); }
  catch (e) { app.innerHTML = `<div class="card center" style="margin-top:40px"><h2>😿 Couldn't load the game data</h2><p>Run it from a web server: <code>python3 -m http.server</code> in the game folder, then open <code>http://localhost:8000</code>.</p><pre>${WR.esc(e.message)}</pre></div>`; return; }
  if (!WR.state.pet || !WR.state.name) { app.innerHTML = `<div id="top"></div><div id="main"></div>`; onboarding(); }
  else start();
}
boot();
})();
