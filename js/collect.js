/* 🏆 C6 (review 2026-10-30): things to aim for between lessons.
   • Sticker Book: 8 stickers per English realm, worked out from the save (so they sync with the Cloud Castle), +2⭐ each, +10⭐ for a full page.
   • Realm Bosses: a cute painted boss at the end of every realm, unlocked once 3 of 4 skills are passed (the same rule that opens the next realm).
   • Pet goal on the map: the next evolution ("Lv 5 → Bloom Puffbun with an aura") with an XP bar.
   • Weekly Events: one themed challenge a week (Mon–Sun, the player's own clock), +20⭐ and an event sticker.
   Save: state.stickers = { got: { a1: [ids] , events: [ids] }, full: [rids] }, state.bosses = { a1: { won, best, tries, at } }, state.weekly = { wk, id, progress, claimed }. */
(function () {
const WR = window.WR;
const C = WR.Collect = {};
const RB = {
  a1: { name: "Queen Buzzbloom", face: "🐝", art: "boss_buzzbloom", line: "Bzzz! Answer my meadow riddles!" },
  a2: { name: "Baron Gumdrop", face: "🐻", art: "boss_gumdrop", line: "Nobody leaves Candy Village without a sweet answer!" },
  b1: { name: "Old Mossbeard", face: "🍄", art: "boss_mossbeard", line: "Hmm-hmm… the forest only lets clever travellers pass." },
  b2: { name: "Glimmerfin", face: "🐍", art: "boss_glimmerfin", line: "Splash! Can you out-think the lake?" },
  c1: { name: "Nimbus the Cloud Griffin", face: "🦅", art: "boss_nimbus", line: "Rumble-rumble! Show me your sharpest English!" },
  c2: { name: "Archivus the Library Dragon", face: "🐲", art: "boss_archivus", line: "Every book has a riddle. Solve mine, little scholar." }
};
C.BOSSES = RB;
const ensure = () => { const s = WR.state; s.stickers = s.stickers || {}; s.stickers.got = s.stickers.got || {}; s.stickers.full = s.stickers.full || []; s.bosses = s.bosses || {}; return s; };
const gotIn = rid => ensure().stickers.got[rid] || [];
const best = (rid, k) => { const p = (WR.state.progress[rid] || {})[k]; return p ? p.best : null; };
const STICKERS = [
  { id: "first", icon: "👣", name: "First Steps", how: "Play any lesson here", test: rid => Object.keys(WR.state.progress[rid] || {}).length > 0 },
  { id: "grammar", icon: "🧩", name: "Grammar Star", how: "Score 60%+ in Grammar", test: rid => best(rid, "grammar") >= 0.6 },
  { id: "vocab", icon: "🔤", name: "Word Wizard", how: "Score 60%+ in Vocabulary", test: rid => best(rid, "vocab") >= 0.6 },
  { id: "reading", icon: "📖", name: "Bookworm", how: "Score 60%+ in Reading", test: rid => best(rid, "reading") >= 0.6 },
  { id: "listening", icon: "🎧", name: "Sharp Ears", how: "Score 60%+ in Listening", test: rid => best(rid, "listening") >= 0.6 },
  { id: "crown3", icon: "👑", name: "Triple Crown", how: "Get 3 crowns in any lesson here", test: rid => WR.SKILLS.some(k => best(rid, k.id) >= 0.9) },
  { id: "story", icon: "📜", name: "Story Keeper", how: "Read this realm's Storybook chapter", test: rid => !!(WR.state.stories && WR.state.stories.done && WR.state.stories.done[rid]) },
  { id: "boss", icon: "🏆", name: "Boss Badge", how: "Beat the realm boss", test: rid => !!(WR.state.bosses && WR.state.bosses[rid] && WR.state.bosses[rid].won) }
];
C.STICKERS = STICKERS;
/* ---------- weekly events ---------- */
const EVENTS = [
  { id: "blossom", icon: "🌸", name: "Blossom Week", desc: "Answer 60 questions correctly", goal: 60, on: ["correct10"] },
  { id: "bookworm", icon: "📚", name: "Bookworm Week", desc: "Finish 6 reading lessons or story chapters", goal: 6, on: ["read1", "story1"] },
  { id: "echo", icon: "🎧", name: "Echo Week", desc: "Finish 5 listening or speaking rounds", goal: 5, on: ["listen1", "speak1"] },
  { id: "number", icon: "🔢", name: "Number Week", desc: "Finish 5 maths lessons or Tower climbs", goal: 5, on: ["math1", "dojo1"] },
  { id: "petpals", icon: "🐾", name: "Pet Pals Week", desc: "Feed or play with your pet 15 times", goal: 15, on: ["feed1", "play3"] },
  { id: "garden", icon: "💧", name: "Garden Week", desc: "Water your Mistake Garden 4 times", goal: 4, on: ["review1"] }
];
C.EVENTS = EVENTS;
C.weekKey = (d = new Date()) => { const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const day = (t.getDay() + 6) % 7; t.setDate(t.getDate() - day); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`; };  // Monday of this week
C.weekly = () => {
  const s = WR.state, wk = C.weekKey();
  if (!s.weekly || s.weekly.wk !== wk) {
    const n = Math.round(new Date(wk + "T00:00:00").getTime() / 6048e5);
    s.weekly = { wk, id: EVENTS[((n % EVENTS.length) + EVENTS.length) % EVENTS.length].id, progress: 0, claimed: false }; WR.save();
  }
  return { ...s.weekly, def: EVENTS.find(e => e.id === s.weekly.id) };
};
C.daysLeft = () => { const d = new Date(), day = (d.getDay() + 6) % 7; return 7 - day; };
const _qe = WR.questEvent;
WR.questEvent = (id, n = 1) => {
  _qe(id, n);
  try { const w = C.weekly(); if (!w.claimed && w.def.on.includes(id) && w.progress < w.def.goal) { WR.state.weekly.progress = Math.min(w.def.goal, w.progress + n); WR.save(); if (WR.state.weekly.progress === w.def.goal) WR.toast(`${w.def.icon} ${w.def.name} complete! Claim your prize on the map 🎁`, 2600); } } catch (e) { /* never block a lesson */ }
};
C.claimWeekly = () => {
  const w = C.weekly(); if (w.claimed || w.progress < w.def.goal) return false;
  ensure(); WR.state.weekly.claimed = true;
  const ev = WR.state.stickers.got.events = WR.state.stickers.got.events || [];
  if (!ev.includes(w.def.id)) ev.push(w.def.id);
  WR.addStars(20, `${w.def.name} prize!`); WR.confetti && WR.confetti(18); WR.save(); return true;
};
/* ---------- stickers ---------- */
C.check = (quiet) => {
  if (!WR.state || !WR.state.pet || !WR.realms) return [];
  const s = ensure(), fresh = [];
  for (const r of WR.realms) {
    const got = s.stickers.got[r.id] = s.stickers.got[r.id] || [];
    for (const st of STICKERS) if (!got.includes(st.id) && st.test(r.id)) { got.push(st.id); fresh.push({ r, st }); }
    if (got.length === STICKERS.length && !s.stickers.full.includes(r.id)) { s.stickers.full.push(r.id); s.stars += 10; fresh.push({ r, st: { icon: "🌟", name: `${r.name} page complete (+10⭐)` }, full: true }); }
  }
  if (fresh.length) {
    const n = fresh.filter(f => !f.full).length; s.stars += n * 2; WR.save(); WR.renderTop && WR.renderTop();
    if (!quiet) WR.toast(fresh.length === 1 ? `🏷️ New sticker: ${fresh[0].st.icon} ${fresh[0].st.name}! +2⭐` : `🏷️ ${n} new sticker${n > 1 ? "s" : ""} for your Sticker Book! +${n * 2}⭐`, 2400);
  }
  return fresh;
};
C.count = () => WR.realms.reduce((a, r) => a + gotIn(r.id).length, 0) + gotIn("events").length;
C.total = () => WR.realms.length * STICKERS.length + EVENTS.length;
const stickerHTML = (r, st, has) => `<div class="stk ${has ? "has" : "no"}" title="${WR.esc(st.how)}"><div class="disc">${WR.img(r.bg, "sbg", "", true)}<span class="si">${has ? st.icon : "?"}</span></div><b>${WR.esc(has ? st.name : "???")}</b><small>${WR.esc(st.how)}</small></div>`;
C.openBook = (focus) => {
  C.check(true); const s = ensure();
  const pages = WR.realms.map(r => { const got = gotIn(r.id); return `<section class="spage" id="sp_${r.id}"><h3>${r.emoji} ${r.level} · ${WR.esc(r.name)} <span class="pill">${got.length}/${STICKERS.length}</span>${s.stickers.full.includes(r.id) ? ' <span class="pill" style="background:var(--mint)">🌟 Complete</span>' : ""}</h3>
    <div class="sgrid">${STICKERS.map(st => stickerHTML(r, st, got.includes(st.id))).join("")}</div></section>`; }).join("");
  const ev = gotIn("events");
  const evPage = `<section class="spage"><h3>🎉 Weekly Events <span class="pill">${ev.length}/${EVENTS.length}</span></h3><div class="sgrid">${EVENTS.map(e => `<div class="stk ${ev.includes(e.id) ? "has" : "no"}"><div class="disc ev"><span class="si">${ev.includes(e.id) ? e.icon : "?"}</span></div><b>${ev.includes(e.id) ? e.name : "???"}</b><small>${e.desc}</small></div>`).join("")}</div></section>`;
  WR.view(`<div class="fade-in sbook"><div class="row lesson-top" style="margin:6px 0 8px"><button class="btn ghost small" id="sbBack">← Map</button><b class="title">🏷️ Sticker Book · ${C.count()}/${C.total()}</b></div>
    <p class="muted" style="font-weight:800;margin:.2em 0 .8em">Collect all 8 stickers in a realm for a 🌟 bonus! Each new sticker gives +2⭐.</p>${pages}${evPage}</div>`);
  WR.$("#sbBack").onclick = () => WR.go("home");
  if (focus) { const el = WR.$("#sp_" + focus); if (el) el.scrollIntoView({ block: "start" }); }
};
WR.screens.stickers = rid => C.openBook(rid);
/* ---------- realm bosses ---------- */
C.bossReady = rid => WR.realmProgress(rid).passed >= 3;
C.startBoss = async rid => {
  const r = WR.realms.find(x => x.id === rid), b = RB[rid]; if (!r || !b) return;
  const parts = await Promise.all([["grammar", 3], ["vocab", 3], ["listening", 2], ["reading", 2]].map(([k, n]) => WR.buildItems(rid, k, n).then(xs => xs.slice(0, n)).catch(() => [])));
  const items = parts.flat(); if (!items.length) return WR.toast("The boss is still asleep… try again soon! 💤");
  const s = ensure(); s.bosses[rid] = s.bosses[rid] || { won: false, best: 0, tries: 0 }; s.bosses[rid].tries++; WR.save();
  WR.startLesson({ realm: rid, skill: "boss", key: null, title: `🏆 ${b.name}`, items, mode: "boss", noTimer: true, boss: b,
    replay: () => C.startBoss(rid), nextLabel: "🏷️ Open my Sticker Book →", onNext: () => WR.go("stickers", rid),
    onFinish: res => {
      const st = WR.state.bosses[rid]; st.best = Math.max(st.best || 0, res.score);
      if (res.won && !st.won) { st.won = true; st.at = Date.now(); WR.state.stars += 15; WR.save(); WR.renderTop(); setTimeout(() => WR.toast(`🏆 You beat ${b.name}! +15⭐ and the Boss Badge`, 2600), 300); }
      WR.save(); C.check();
    } });
};
const bossCard = rid => {
  const b = RB[rid]; if (!b) return "";
  const ready = C.bossReady(rid), st = (WR.state.bosses || {})[rid] || {}, pr = WR.realmProgress(rid).passed;
  return `<div class="card rboss ${ready ? "" : "locked"}" id="rbossCard" role="button" tabindex="0">${WR.img(b.art, "rb-art")}<div style="flex:1"><div><span class="lvl-badge">Boss</span><b>${WR.esc(b.name)}</b>${st.won ? ' <span class="pill" style="background:var(--mint)">Beaten 🏆</span>' : ""}</div>
    <div class="muted" style="font-size:.86rem;font-weight:700">${ready ? `“${WR.esc(b.line)}”` : `🔒 Pass 3 of 4 skills to challenge the boss (${pr}/3)`}</div>
    ${ready ? `<button class="btn small ${st.won ? "ghost" : "mint"}" id="rbossGo">${st.won ? "↻ Rematch" : "⚔️ Challenge"}</button>` : `<div class="prog"><i style="width:${Math.min(3, pr) / 3 * 100}%"></i></div>`}</div></div>`;
};
/* ---------- pet goal ---------- */
C.petGoal = () => {
  const p = WR.state.pet, info = WR.petInfo(); if (!p || !info) return null;
  const lvl = WR.petLevel(p.xp), stage = WR.petStage(lvl);
  const target = stage === 0 ? 5 : stage === 1 ? 10 : lvl + 1;
  const start = stage === 0 ? 0 : stage === 1 ? 320 : (lvl - 1) * 80, end = (target - 1) * 80;
  const pct = Math.max(0, Math.min(100, (p.xp - start) / (end - start) * 100));
  const label = stage === 0 ? `Lv ${lvl} → Lv 5: ${info.stages[1]} ✨ with a magic aura` : stage === 1 ? `Lv ${lvl} → Lv 10: ${info.stages[2]} 👑 with a crown` : `${info.stages[2]} 👑 · Lv ${lvl} → Lv ${target}`;
  return { lvl, stage, target, pct, label, xpLeft: Math.max(0, end - p.xp) };
};
const goalsCard = () => {
  const g = C.petGoal(), w = C.weekly(), n = C.count();
  const wbtn = w.claimed ? '<span class="pill" style="background:var(--mint)">Prize claimed ✓</span>' : w.progress >= w.def.goal ? '<button class="btn small mint" id="weekClaim">🎁 Claim 20⭐</button>' : `<span class="pill">${w.progress}/${w.def.goal} · ${C.daysLeft()} day${C.daysLeft() > 1 ? "s" : ""} left</span>`;
  return `<div class="card goals" id="goalsCard">
    ${g ? `<div class="goal" id="petGoal"><div class="gpet">${WR.petHTML()}</div><div class="gb"><b>🐾 ${WR.esc(g.label)}</b><div class="prog"><i style="width:${g.pct}%"></i></div><small>${g.xpLeft} XP to go · every lesson helps!</small></div></div>` : ""}
    <div class="goal" id="weekGoal"><span class="gi">${w.def.icon}</span><div class="gb"><b>${w.def.name}: ${w.def.desc}</b><div class="prog"><i style="width:${w.progress / w.def.goal * 100}%;background:linear-gradient(90deg,#FFC6E0,#C9B6FF)"></i></div><small>This week's event · prize: 20⭐ + an event sticker</small><div class="wk-act">${wbtn}</div></div></div>
    <div class="goal" id="bookGoal" role="button" tabindex="0"><span class="gi">🏷️</span><div class="gb"><b>Sticker Book</b><div class="prog"><i style="width:${n / C.total() * 100}%;background:linear-gradient(90deg,#BFF0DC,#9ED8FF)"></i></div><small>${n}/${C.total()} stickers collected</small></div><button class="btn small" id="bookBtn">Open →</button></div>
  </div>`;
};
/* ---------- wire into the map and realm screens ---------- */
const _home = WR.screens.home;
WR.screens.home = (...a) => {
  C.check(); _home(...a);
  const slot = WR.$("#homeGoals");   // phones: below the realm map, so Continue + the first realm stay on screen; desktop: top of the right column
  if (slot) slot.innerHTML = `<h2>🏆 My Goals</h2>${goalsCard()}`;
  const wc = WR.$("#weekClaim"); if (wc) wc.onclick = e => { e.stopPropagation(); C.claimWeekly(); WR.screens.home(); };
  const ob = () => WR.go("stickers"); WR.$("#bookGoal").onclick = ob;
  const pg = WR.$("#petGoal"); if (pg) pg.onclick = () => WR.go("pet");
};
const _realm = WR.screens.realm;
WR.screens.realm = rid => {
  C.check(); _realm(rid);
  const grid = WR.$("#main .grid.g4"); if (!grid || !RB[rid]) return;
  const got = gotIn(rid);
  grid.insertAdjacentHTML("afterend", `${bossCard(rid)}<div class="card row sticker-row" id="realmStickers" role="button" tabindex="0"><span style="font-size:1.6rem">🏷️</span><div style="flex:1"><b>Sticker page: ${got.length}/${STICKERS.length}</b><div class="muted" style="font-size:.82rem;font-weight:700">${STICKERS.map(st => got.includes(st.id) ? st.icon : "▫️").join(" ")}</div></div><span class="btn small ghost">Open →</span></div>`);
  const go = WR.$("#rbossGo"), card = WR.$("#rbossCard");
  if (go) go.onclick = e => { e.stopPropagation(); C.startBoss(rid); };
  if (card) card.onclick = () => C.bossReady(rid) ? C.startBoss(rid) : WR.toast(`🔒 Pass 3 of 4 skills in ${WR.realms.find(x => x.id === rid).name} to wake the boss!`, 2400);
  WR.$("#realmStickers").onclick = () => WR.go("stickers", rid);
};
})();
