/* App shell: navigation, top bar, onboarding, realm map, realm screen, review, settings. */
(function () {
const WR = window.WR;
const app = document.getElementById("app");
let current = "home", currentArg;
WR.view = html => { WR.$("#main").innerHTML = html; window.scrollTo({ top: 0 }); };
WR.current = () => current;
WR.renderTop = () => {
  const t = WR.$("#top"); if (!t || !WR.state.pet) return;
  const s = WR.state;
  t.innerHTML = `<div class="topbar">${WR.asset(s.avatar) ? WR.img(s.avatar, "mini-av") : '<img class="mini-av" alt="">'}
    <div class="brand">Word Realms <small>${WR.userText(s.name)}</small></div>
    <div class="chips"><span class="chip star" id="starChip">${WR.icon("⭐", "", "stars")} ${s.stars}</span><span class="chip fire" title="Daily streak">${WR.icon("🔥", "", "streak")} ${WR.streakAlive()}</span>
    ${WR.Cloud ? WR.Cloud.chipHTML() : ""}<button class="chip" id="setBtn" aria-label="Settings">${WR.icon("⚙️", "", "")}</button></div></div>`;
  WR.$("#setBtn").onclick = settings;
  if (WR.Cloud) { WR.$("#cloudChip").onclick = () => WR.Cloud.open(); WR.Cloud.paint(); }
  WR.Garden && WR.Garden.badge();
};
const NAV = [["home", "🗺️", "Map"], ["math", "🔢", "Maths"], ["pet", "🐾", "Pet"], ["shop", "🛍️", "Shop"], ["review", "🌷", "Garden"]];
WR.navActive = k => document.querySelectorAll("#navbar button").forEach(b => b.classList.toggle("on", b.dataset.k === k));
function renderNav() {
  const n = WR.$("#navbar"); n.style.display = "flex";
  n.innerHTML = NAV.map(([k, i, l]) => `<button data-k="${k}"><span>${WR.icon(i, "", "")}</span>${l}</button>`).join("");
  // one delegated listener on the bar itself, so no screen can overwrite a tab button's handler
  if (!n.dataset.wired) { n.dataset.wired = "1"; n.addEventListener("click", e => { const b = e.target.closest("button[data-k]"); if (b && n.contains(b)) WR.go(b.dataset.k); }); }
}
// every running activity is stopped when the screen changes (each module defines its own WR.stopX)
// (the gap games of js/gap-round.js are stopped through WR.gapGames)
const STOPS = ["stopLesson", "stopSpeaking", "stopWriting", "stopStory", "stopPlacement", "stopMath", "stopPhonics", "stopCharms"];
WR.go = (screen, arg) => {
  STOPS.forEach(n => WR[n] && WR[n]()); WR.gapGames.forEach(g => g.stop()); WR.Voice.stop();
  current = screen; currentArg = arg; WR.navActive(screen === "realm" ? "home" : /^(math|dojo|dojoGrid|clock)$/.test(screen) ? "math" : screen);
  WR.screens[screen](arg); WR.renderTop();
};

// R5: another tab saved (js/core.js adopted its save): say so softly, and redraw unless a round is being played
// (a running lesson keeps going and saves on top of the adopted save)
WR.onOtherTab = () => {
  if (!WR.realms || !WR.shop || !WR.$("#main")) return;
  if (!WR.state.pet || !WR.state.name) return WR.restart();
  WR.toast("🪟 Your adventure was updated in another window — refreshed!", 2400);
  WR.renderTop();
  if (!document.body.classList.contains("wr-focus") && !document.querySelector(".modal-bg") && WR.screens[current]) WR.screens[current](currentArg);
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
    <div class="onb-pets">${WR.PETS.filter(p => !p.extra).map(p => `<div class="card pick ${draft.pet === p.id ? "sel" : ""}" data-pet="${p.id}" role="button" tabindex="0">${WR.img(p.id)}<div class="nm">${p.name}</div><div class="muted" style="font-size:.8rem">Loves ${p.likes}</div></div>`).join("")}</div>
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
      WR.save(); WR._welcome = `I'm so happy to meet you, ${draft.name.trim()}! 💖`; start(); WR.sfx("level");   // R7: said by the pet on the map, not a pop-up over the name
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
// 🔔 a gentle "something is ready" card on the map (Mistake Garden plants, Word Charms): ONE markup for every nudge
WR.nudgeCard = (id, icon, title, sub, btn) => `<div class="card row garden-nudge" id="${id}"><span style="font-size:2rem">${icon}</span><div style="flex:1"><b>${title}</b><div class="muted" style="font-size:.85rem;font-weight:700">${sub}</div></div><button class="btn small mint">${btn}</button></div>`;
// 🎯 the Daily Quests list: ONE markup for its own screen (R15 moved it off the home page)
const questRows = s => s.daily.quests.map(q => { const d = WR.questDef(q.id); return `<div class="q"><span class="qi">${d.icon}</span><div class="qb"><b>${d.label}</b><div class="prog"><i style="width:${q.progress / d.goal * 100}%"></i></div></div>
    ${q.claimed ? '<span class="pill" style="background:var(--mint)">Done ✓</span>' : q.progress >= d.goal ? `<button class="btn small mint claim" data-id="${q.id}">Claim ${d.reward}⭐</button>` : `<span class="pill">${q.progress}/${d.goal} · ${d.reward}⭐</span>`}</div>`; }).join("");
const questsCard = s => `<div class="card quests">${questRows(s)}<p class="muted" style="font-size:.8rem;font-weight:700;margin-bottom:0">New quests every day. Keep your 🔥 streak by finishing one lesson a day!</p></div>`;
// 🐾 how the pet feels, in a few words, for the home chip
WR.petFeel = p => p.hunger >= 60 ? "is hungry" : p.happiness < 40 ? "wants a cuddle" : p.happiness >= 80 ? "is very happy" : "is happy";
WR.screens.quests = () => {
  WR.ensureDaily(); const s = WR.state;
  WR.view(`<div class="fade-in"><div class="row lesson-top" style="margin:6px 0 8px"><button class="btn ghost small" id="qBack">← Map</button><b class="title">🎯 Daily Quests</b></div>${questsCard(s)}</div>`);
  WR.$("#qBack").onclick = () => WR.go("home");
  document.querySelectorAll(".claim").forEach(b => b.onclick = () => { WR.claimQuest(b.dataset.id); WR.screens.quests(); });
};
WR.screens.home = () => {
  WR.ensureDaily();
  const s = WR.state, cont = WR.continueTarget(), due = WR.Garden ? WR.Garden.dueCount() : 0;
  const qDone = s.daily.quests.filter(q => q.claimed).length, qReady = s.daily.quests.some(q => !q.claimed && q.progress >= WR.questDef(q.id).goal);
  WR.view(`<div class="fade-in"><div class="card homehead"><div class="av-big">${WR.avatarHTML(110)}${WR.Rewards && WR.Rewards.chest().ready ? `<button class="chip av-badge gift-ready" id="giftPill" aria-label="Open today's free gift" title="Today's free gift">🎁</button>` : `<button class="chip av-badge" id="wardPill" aria-label="Wardrobe" title="Wardrobe">👗</button>`}</div>
    <div><h1 style="margin:0">Hello, <span class="hero-nm">${WR.userText(s.name)}</span>! 🌸 <button class="chip hero-edit" id="heroEditHome" aria-label="Change my hero name" title="Change my hero name">✏️</button></h1><div class="muted" style="font-weight:800">${WR.userText(s.pet.name)} says: “${WR.esc(WR._welcome || WR.petMood())}”</div>
    <div class="row" style="margin-top:6px"><span class="pill">✅ ${s.totalCorrect} correct answers</span>${WR.STORY ? `<span class="pill" id="bookPill" style="background:#FFF1D6;cursor:pointer">📜 Storybook ${WR.storyPagesFound()}/6 pages</span>` : ""}${s.placement ? `<span class="pill mirror-pill" id="mirrorPill" style="background:#F3ECFF;cursor:pointer">🪞 Mirror says ${s.placement.level.toUpperCase()}</span>` : `<span class="pill mirror-pill" id="mirrorPill" style="background:#F3ECFF;cursor:pointer">🪞 Find my level</span>`}</div></div></div>
    ${cont ? `<div class="card continue" id="continueCard"><div class="ct"><b>${cont.realm.emoji} ${cont.realm.level} ${WR.esc(cont.skill.name)} <span style="font-weight:700">(lesson ${cont.lesson})</span></b><small>${WR.esc(cont.goal)}</small></div><button class="btn mint" id="continueBtn">▶ Continue</button></div>` : ""}
    <div class="grid g2" style="margin-top:14px;align-items:start">
      <div><h2 class="map-h">🗺️ The Realm Map</h2><div class="map"><div class="map-path"></div>${WR.realms.map((r, i) => {
        const un = WR.isUnlocked(i), pr = WR.realmProgress(r.id);
        return `<div class="card realm-node ${un ? "" : "locked"}" data-r="${r.id}" data-i="${i}">${WR.img(r.bg, "thumb", "", true)}
          <div><div><span class="lvl-badge">${r.level}</span><b>${r.emoji} ${r.name}${un ? "" : " 🔒"}</b></div><div class="muted" style="font-size:.85rem;font-weight:700">${r.modeName}</div>
          <div class="prog"><i style="width:${pr.passed / 4 * 100}%"></i></div><div class="muted" style="font-size:.75rem;font-weight:800">${pr.passed}/4 skills passed</div></div>
          </div>`; }).join("")}</div>
      ${WR.Math ? `<div class="card math-node" id="mathNode" style="margin-top:14px">${WR.img("bg_math", "thumb", "", true)}<div style="flex:1"><div><span class="lvl-badge">G1–12</span><b>🔢 Number Kingdom</b></div><div class="muted" style="font-size:.85rem;font-weight:700">Maths quests + 🗼 Times-Table Tower</div><div class="muted" style="font-size:.75rem;font-weight:800">👑 ${WR.Math.totalCrowns()} crowns · 🌟 ${WR.Math.mastered()}/132 facts${s.math && s.math.grade ? ` · Grade ${s.math.grade}` : ""}</div></div></div>` : ""}</div>
      <div><div class="home-mini"><button class="card mini-chip${qReady ? " ready" : ""}" id="questsMini"><span class="mi">🎯</span><span><b>${qDone}/${s.daily.quests.length} quests</b><small>${qReady ? "🎁 Prize to claim!" : "Today's quests"}</small></span></button>
        <button class="card mini-chip" id="petMini"><span class="mi mini-pet">${WR.petHTML()}</span><span><b>${WR.userText(s.pet.name)}</b><small>${WR.petFeel(s.pet)}</small></span></button></div><div id="homeGoals"></div>
      ${due ? WR.nudgeCard("gardenNudge", "💧", `${due} plant${due > 1 ? "s" : ""} in your Mistake Garden ${due > 1 ? "are" : "is"} thirsty`, "A quick review helps tricky words stick.", "Water →") : ""}
      ${WR.charmsNudge ? WR.charmsNudge() : ""}
      </div></div></div>`);
  document.querySelectorAll(".realm-node").forEach(n => n.onclick = () => {
    if (n.classList.contains("locked")) { const prev = WR.realms[+n.dataset.i - 1]; return WR.toast(`🔒 Pass 3 of 4 skills in ${prev.name} to unlock!`, 2400); }
    WR.go("realm", n.dataset.r);
  });
  WR.$("#questsMini").onclick = () => WR.go("quests");
  WR.$("#petMini").onclick = () => WR.go("pet");
  const he = WR.$("#heroEditHome"); if (he) he.onclick = e => { e.stopPropagation(); WR.openRename(); };
  const mn = WR.$("#mathNode"); if (mn) mn.onclick = () => WR.go("math");
  const gn = WR.$("#gardenNudge"); if (gn) gn.onclick = () => WR.go("review");
  const cn = WR.$("#charmsNudge"); if (cn) cn.onclick = () => WR.openCharms();
  const cc = WR.$("#continueCard"); if (cc) cc.onclick = () => WR.startLesson({ realm: cont.realm.id, skill: cont.skill.id, key: cont.skill.id, title: `${cont.skill.name} · ${cont.realm.modeName}` });
  WR.$("#mirrorPill").onclick = () => WR.retakePlacement();
  const bp = WR.$("#bookPill"); if (bp) bp.onclick = () => WR.openStorybook();
  const wp = WR.$("#wardPill"); if (wp) wp.onclick = e => { e.stopPropagation(); WR.go("wardrobe"); }; const gp = WR.$("#giftPill"); if (gp) gp.onclick = e => { e.stopPropagation(); WR.go("wardrobe", "rewards"); };
};

/* ---------------- realm screen ---------------- */
// 🎶 Bonus tiles (not part of the 3-of-4 unlock rule): ONE markup helper for every module's tile, and ONE table that
// says which tiles a realm shows (in this order) and what a tap opens. ico = the tile's picture markup.
// R14: ONE status line per tile: the crowns (or count) once played, else the "new" tag
WR.bonusTile = ({ cls, data, ico, title, desc, crowns, tag }) => `<div class="card skill-card ${cls}" data-${data}="1">${ico}<h3>${title}</h3>
    <div class="muted" style="font-size:.85rem;font-weight:700">${desc}</div>${/notplayed/.test(crowns) ? `<div class="waiting-tag">${tag}</div>` : `<div class="crowns">${crowns}</div>`}</div>`;
// 🗂️ level tabs (A1 … C2, only the open realms) for bonus hubs that cover every level (Word Charms, Spell Swap, Word Forge); badge(l) = a count or 0
WR.unlockedLevels = () => (WR.realms || []).filter((r, i) => WR.isUnlocked(i)).map(r => r.id);
WR.levelTabs = (cur, badge = () => 0) => { const lv = WR.unlockedLevels(); return lv.length > 1 ? `<div class="ch-levels" role="tablist">${lv.map(l => { const n = badge(l);
  return `<button class="ch-lv${l === cur ? " on" : ""}" data-l="${l}" role="tab" aria-selected="${l === cur}">${l.toUpperCase()}${n ? `<i class="ch-badge">${n > 9 ? "9+" : n}</i>` : ""}</button>`; }).join("")}</div>` : ""; };
WR.bindLevelTabs = screen => document.querySelectorAll(".ch-lv").forEach(b => b.onclick = () => WR.go(screen, b.dataset.l));
const tileCrowns = (rid, k) => { const p = (WR.state.progress[rid] || {})[k]; return WR.crownCell(p && p.best != null ? WR.crowns(p.best) : null); };
const BONUS = [
  { data: "speak", open: rid => WR.startSpeaking(rid), tile: rid => WR.SPEAKING && WR.bonusTile({ cls: "speak", data: "speak", ico: '<span class="ico">🎤</span>', title: "Speaking", desc: "Echo Well: say it aloud", crowns: tileCrowns(rid, "speaking"), tag: "🎶 Bonus fun!" }) },
  { data: "write", open: rid => WR.startWriting(rid), tile: rid => { if (!WR.WRITING) return ""; const w = WR.writingRealmCrowns(rid), n = (WR.counts ? WR.counts.counts : {})[rid + "/writing"] || "";
      return WR.bonusTile({ cls: "quill-tile", data: "write", ico: `<img class="ico quill-ico" src="assets/web/quill.webp" onerror="this.onerror=null;this.src='assets/ui/quill.png'" alt="">`, title: "Writing", desc: "Story Quill: plan, write, get feedback", crowns: WR.crownCell(w.done ? w.crowns : null), tag: w.done ? `✒️ ${w.done}/${n} stories written` : "🎶 Bonus fun!" }); } },
  { data: "story", open: rid => WR.startStory(rid), tile: rid => WR.STORY && WR.storyTile(rid) },
  { data: "phonics", open: () => WR.go("phonics"), tile: rid => WR.phonicsTile && WR.phonicsTile(rid) },
  { data: "charms", open: rid => WR.openCharms(rid), tile: rid => WR.charmsTile && WR.charmsTile(rid) }
];
/* 🧭 R14: Today's path (the 4 skills + the boss) comes first; bonus games sit in their own row and open one at a time as
   the child finishes lessons (any realm), each with a "New!" badge until it is first tapped. The realm game is open from
   the start, so a brand-new player sees at most 6 choices. Grown-ups' "open every realm" opens them all. */
const BONUS_AT = { sp: 0, story: 1, speak: 2, charms: 3, phonics: 4, write: 5 };   // lessons finished; gap games follow: 6, 7, …
WR.bonusAt = data => data in BONUS_AT ? BONUS_AT[data] : 6 + Math.max(0, BONUS.findIndex(b => b.data === data) - 5);
WR.bonusOpen = data => { const s = WR.state; return !!(s.settings.unlockAll || (s.lessonsDone || 0) >= WR.bonusAt(data) || (s.bonusSeen || []).includes(data)); };
WR.bonusSeenInit = () => { const s = WR.state; if (!Array.isArray(s.bonusSeen)) s.bonusSeen = ["sp", ...BONUS.map(b => b.data)].filter(d => (s.lessonsDone || 0) >= WR.bonusAt(d)); return s.bonusSeen; };
// the gap games (js/gap-round.js) add their own row when they load: Spell Swap, Word Forge, …
WR.addBonus = row => BONUS.push(row);
WR.screens.realm = rid => {
  const r = WR.realms.find(x => x.id === rid), seen = WR.bonusSeenInit();
  const crowns = k => tileCrowns(rid, k);
  const status = k => { const p = (WR.state.progress[rid] || {})[k], w = WR.waitingText(rid, k);
    return p ? `<div class="crowns">${crowns(k)}${/^🎁/.test(w) ? ` <span class="waiting-tag">${w.replace(/ lessons? waiting!/, " new")}</span>` : ""}</div>` : `<div class="waiting-tag">${w}</div>`; };
  const special = WR.bonusTile({ cls: "special", data: "sp", ico: `<span class="ico">${r.special.emoji}</span>`, title: r.special.name, desc: r.special.desc, crowns: crowns("special"), tag: "🎲 Realm game" });
  const all = [{ data: "sp", html: special }, ...BONUS.map(b => ({ data: b.data, html: b.tile(rid) || "" }))].filter(b => b.html);
  const open = all.filter(b => WR.bonusOpen(b.data)), locked = all.length - open.length;
  const badge = (b) => seen.includes(b.data) ? b.html : b.html.replace(/^(<div class="card skill-card [^"]*"[^>]*>)/, '$1<span class="bonus-tag new-tag">New!</span>');
  WR.view(`<div class="fade-in realm-screen"><div class="realm-hero">${WR.img(r.bg, "bg")}<div class="ov"><span class="lvl-badge">${r.level}</span><b class="title" style="font-size:1.5rem">${r.emoji} ${r.name}</b>
    <p style="margin:.3em 0;font-weight:700">${WR.esc(r.blurb)}</p><span class="pill">Game mode: ${r.modeName}</span></div></div>
    <div class="row realm-top" style="margin:12px 0"><button class="btn ghost small" id="backMap">← Map</button></div>
    <h2 class="realm-sec">🧭 Today's path</h2>
    <div class="grid g4 path-grid">${WR.SKILLS.map(k => `<div class="card skill-card" data-k="${k.id}"><span class="ico">${k.icon}</span><h3>${k.name}</h3><div class="muted" style="font-size:.85rem;font-weight:700">${k.desc}</div>${status(k.id)}</div>`).join("")}</div>
    <h2 class="realm-sec" id="bonusHead">🎁 Bonus games</h2>
    <div class="bonus-row" id="bonusRow">${open.map(badge).join("")}${locked ? `<div class="card bonus-more" aria-label="More games open as you play"><span class="ico">🔒</span><b>${locked} more</b><small>open as you play</small></div>` : ""}</div></div>`);
  WR.$("#backMap").onclick = () => WR.go("home");
  // only the skill cards: the bottom tab bar buttons also carry data-k and must keep their own handler
  WR.$("#main").querySelectorAll(".skill-card[data-k]").forEach(c => c.onclick = () => { const k = WR.SKILLS.find(x => x.id === c.dataset.k); if (!k) return; WR.startLesson({ realm: rid, skill: k.id, key: k.id, title: `${k.name} · ${r.modeName}` }); });
  const tapped = d => { if (!seen.includes(d)) { seen.push(d); WR.save(); } };
  const sp = WR.$("[data-sp]"); if (sp) sp.onclick = () => { tapped("sp"); WR.playSpecial(rid); };
  BONUS.forEach(b => { const el = WR.$(`#bonusRow [data-${b.data}]`); if (el) el.onclick = () => { tapped(b.data); b.open(rid); }; });
  const more = WR.$(".bonus-more"); if (more) more.onclick = () => WR.toast("🎁 Finish lessons on Today's path to open more bonus games!", 2400);
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
    <div class="row hero-row" style="justify-content:space-between;margin-bottom:8px"><b>🦸 Hero name</b><span class="hero-cur"><span id="heroCur">${WR.userText(s.name)}</span> <button class="btn ghost small" id="heroEdit">✏️ Change</button></span></div>
    <label class="set-row"><span>🔊 Sound effects</span><input type="checkbox" id="snd" ${s.settings.sound ? "checked" : ""}></label>
    <label class="set-row"><span>🎙️ Recorded storyteller voice <small class="muted" style="display:block;font-size:.72rem">off = this device's own voice</small></span><input type="checkbox" id="recV" ${s.settings.voice !== "device" ? "checked" : ""}></label>
    <label class="set-row"><span>🐾 Cute pet voice</span><input type="checkbox" id="petV" ${s.settings.petVoice !== false ? "checked" : ""}></label>
    <div class="set-row" style="cursor:default"><span>🗣️ Listening speed</span><input type="range" class="slider" id="rt" min="0.5" max="1.3" step="0.1" value="${s.settings.rate}" aria-label="Listening speed"></div>
    ${WR.offline && navigator.serviceWorker ? `<div class="set-row" style="cursor:default"><span>📲 Offline play <small class="muted" id="offState" style="display:block;font-size:.72rem">pictures load as you play</small></span><button class="btn small ghost" id="offBtn">Download</button></div>` : ""}
    <div class="row" style="justify-content:center;margin-top:16px"><button class="btn ghost small grownups-btn" id="guBtn">👪 Grown-ups</button><button class="btn ghost small" id="test">🔈 Test voice</button><button class="btn ghost small" id="testPet">🐾 Hear my pet</button><button class="btn ghost small" id="plRe">🪞 Placement quiz</button>${WR.Cloud ? '<button class="btn ghost small" id="ccSet">🏰 Cloud save</button>' : ""}<button class="btn small" id="cls">Done</button></div>`, (bg, close) => {
    bg.querySelector("#snd").onchange = e => { s.settings.sound = e.target.checked; WR.save(); };
    bg.querySelector("#rt").oninput = e => { s.settings.rate = +e.target.value; WR.save(); };
    bg.querySelector("#guBtn").onclick = () => { close(); WR.openGrownups(); };
    bg.querySelector("#test").onclick = () => WR.say("Welcome to Word Realms! Let's learn English together.");
    bg.querySelector("#testPet").onclick = () => WR.say("Hi! I'm so happy to see you!", { character: "pet_" + ((s.pet && s.pet.species) || "") });   // preview, even when chatter is off
    bg.querySelector("#recV").onchange = e => { s.settings.voice = e.target.checked ? "recorded" : "device"; WR.save(); };
    bg.querySelector("#petV").onchange = e => { s.settings.petVoice = e.target.checked; WR.save(); };
    bg.querySelector("#cls").onclick = close;
    // 📲 R17: everything for offline play, only when a grown-up/child asks (the first visit stays light)
    const ob = bg.querySelector("#offBtn"), os = bg.querySelector("#offState");
    if (ob) {
      const ready = () => { os.textContent = "✅ Ready for offline play"; ob.textContent = "Done"; ob.disabled = true; };
      WR.offline.status().then(d => { if (d && d.ready) ready(); else if (d && WR.offline.lite()) os.textContent = "on mobile data: pictures load as you play"; });
      ob.onclick = () => { ob.disabled = true; ob.textContent = "…"; WR.offline.download(d => { if (!d.ready && d.total) os.textContent = `Downloading pictures… ${d.done}/${d.total}`; }).then(d => d ? ready() : (ob.disabled = false, ob.textContent = "Download")); };
    }
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
