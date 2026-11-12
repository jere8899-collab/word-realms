/* Play-again (Task 13). After a round, a visible egg fills, the pet reacts, and one tap starts the next
   adventure. A little daily quest and a weekly sticker use gentle words. Combo sparkles ride the stars
   that already go through WR.awardStars, so the 150/day cap and anti-farm rules stay in charge.
   Save: state.again inside wordRealms.save.v1. An old save simply gains an empty egg. */
(function () {
const WR = window.WR;
const A = WR.Again = {};
const NEED = 3;
const PRIZES = [
  { id: "egg_ribbon", icon: "🎀", name: "Ribbon Chick" },
  { id: "egg_star", icon: "⭐", name: "Star Chick" },
  { id: "egg_blossom", icon: "🌸", name: "Blossom Chick" },
  { id: "egg_heart", icon: "💖", name: "Heart Chick" },
  { id: "egg_crown", icon: "👑", name: "Crown Chick" },
  { id: "egg_rainbow", icon: "🌈", name: "Rainbow Chick" }
];
const WEEKS = [
  { id: "week_sun", icon: "☀️", name: "Sunny Day" },
  { id: "week_moon", icon: "🌙", name: "Quiet Moon" },
  { id: "week_leaf", icon: "🍃", name: "Rest Leaf" },
  { id: "week_gift", icon: "🎁", name: "Kind Gift" }
];
const TRICKS = [
  { at: 3, id: "hop", name: "Happy Hop" },
  { at: 8, id: "spin", name: "Sparkle Spin" },
  { at: 15, id: "bow", name: "Little Bow" }
];
const esc = s => WR.esc(String(s == null ? "" : s));
const fresh = () => ({ rounds: 0, egg: { fill: 0, hatched: 0 }, tricks: [], stickers: [], lastPrize: null, lastTrick: null, quest: null, week: { key: "", days: {}, got: false, sticker: null } });
const bag = () => {
  const s = WR.state; if (!s) return null;
  if (!s.again || typeof s.again !== "object") s.again = fresh();
  const a = s.again;
  a.egg = Object.assign({ fill: 0, hatched: 0 }, a.egg || {});
  a.tricks = Array.isArray(a.tricks) ? a.tricks : [];
  a.stickers = Array.isArray(a.stickers) ? a.stickers : [];
  a.week = Object.assign({ key: "", days: {}, got: false, sticker: null }, a.week || {});
  a.week.days = a.week.days && typeof a.week.days === "object" ? a.week.days : {};
  return a;
};
const weekKey = day => {
  const [y, m, d] = String(day).split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() - ((dt.getDay() + 6) % 7));
  return WR.dayKey(dt.getTime());
};
const petName = () => WR.state && WR.state.pet && WR.state.pet.name ? WR.state.pet.name : "Your pet";
const prizeById = id => PRIZES.concat(WEEKS).find(p => p.id === id);
A.NEED = NEED;
A.PRIZES = PRIZES;
A.state = bag;
A.merge = (x, y) => {
  const a = Object.assign(fresh(), x || {}), b = Object.assign(fresh(), y || {});
  const days = Object.assign({}, (a.week && a.week.days) || {}, (b.week && b.week.days) || {});
  const stickers = Array.from(new Set([].concat(a.stickers || [], b.stickers || [])));
  const tricks = Array.from(new Set([].concat(a.tricks || [], b.tricks || [])));
  const quest = (a.quest && b.quest && a.quest.day === b.quest.day) ? Object.assign({}, a.quest, { n: Math.max(a.quest.n || 0, b.quest.n || 0), done: !!(a.quest.done || b.quest.done) }) : (a.quest && (!b.quest || a.quest.day >= b.quest.day) ? a.quest : b.quest);
  const wk = [a.week && a.week.key, b.week && b.week.key].filter(Boolean).sort().pop() || "";
  return { rounds: Math.max(a.rounds || 0, b.rounds || 0), egg: { fill: Math.max((a.egg && a.egg.fill) || 0, (b.egg && b.egg.fill) || 0), hatched: Math.max((a.egg && a.egg.hatched) || 0, (b.egg && b.egg.hatched) || 0) }, tricks, stickers, lastPrize: a.lastPrize || b.lastPrize || null, lastTrick: a.lastTrick || b.lastTrick || null, quest: quest || null, week: { key: wk, days, got: !!((a.week && a.week.got) || (b.week && b.week.got)), sticker: (a.week && a.week.sticker) || (b.week && b.week.sticker) || null } };
};
const ensureQuest = a => {
  const day = WR.today();
  if (!a.quest || a.quest.day !== day) {
    const water = WR.dayDiff("2026-01-01", day) % 2 === 1;
    a.quest = { day, id: water ? "water" : "rounds", n: 0, goal: water ? 1 : 3, done: false };
  }
  return a.quest;
};
const questLabel = q => q && q.id === "water" ? "Water 1 garden plant" : "Finish 3 rounds";
A.questLabel = q => questLabel(q || (bag() && ensureQuest(bag())));
const markDay = (day, how) => {
  const a = bag(); if (!a) return;
  const key = weekKey(day);
  if (a.week.key !== key) a.week = { key, days: {}, got: false, sticker: null };
  if (!a.week.days[day]) a.week.days[day] = how;
  const n = Object.keys(a.week.days).length;
  if (n >= 5 && !a.week.got) {
    a.week.got = true;
    const st = WEEKS[Math.max(0, a.stickers.filter(id => id.indexOf("week_") === 0).length) % WEEKS.length];
    if (!a.stickers.includes(st.id)) a.stickers.push(st.id);
    a.week.sticker = st.id;
  }
};
A.markDay = markDay;
const bumpQuest = (id) => {
  const a = bag(); if (!a) return null;
  const q = ensureQuest(a);
  if (q.done || q.id !== id) return q;
  q.n = Math.min(q.goal, q.n + 1);
  if (q.n >= q.goal) { q.done = true; WR.awardStars("again", "quest:" + q.day, 2, { kind: "item", quiet: true, why: "Little quest" }); }
  return q;
};
A.onRound = () => {
  const a = bag(); if (!a) return null;
  a.rounds = (a.rounds || 0) + 1;
  a.egg.fill = (a.egg.fill || 0) + 1;
  let hatched = null;
  if (a.egg.fill >= NEED) {
    a.egg.fill = 0; a.egg.hatched = (a.egg.hatched || 0) + 1;
    const prize = PRIZES[(a.egg.hatched - 1) % PRIZES.length];
    if (!a.stickers.includes(prize.id)) a.stickers.push(prize.id);
    a.lastPrize = prize.id; hatched = prize;
  }
  const trick = TRICKS.find(t => t.at === a.rounds);
  if (trick && !a.tricks.includes(trick.id)) { a.tricks.push(trick.id); a.lastTrick = trick.id; }
  ensureQuest(a);
  bumpQuest("rounds");
  markDay(WR.today(), "play");
  WR.save();
  return { hatched, trick: trick || null, fill: a.egg.fill, rounds: a.rounds };
};
A.onWater = () => { const q = bumpQuest("water"); if (q) WR.save(); return q; };
A.spark = n => {
  const old = document.querySelector(".combo-spark"); if (old) old.remove();
  const el = document.createElement("div");
  el.className = "combo-spark"; el.setAttribute("role", "status");
  el.innerHTML = `${WR.icon ? WR.icon("✨") : "✨"} <b>${n} in a row</b>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
};
const cheer = () => {
  const ctx = WR._roundCtx || {}, name = petName();
  if ((ctx.crowns || 0) >= 3) return `${name} spins with joy. What a shiny round!`;
  if ((ctx.crowns || 0) >= 1) return `${name} does a happy hop.`;
  return `${name} leans in for a cuddle. The next round is a fresh try.`;
};
const crownBar = () => {
  const ctx = WR._roundCtx || {};
  const have = ctx.crowns || 0;
  if (ctx.kind) {
    const pct = have >= 3 ? 100 : Math.max(8, Math.round((ctx.score || 0) * 100));
    return { label: have >= 3 ? "All 3 crowns on this one" : `Towards crown ${have + 1} of 3`, pct };
  }
  const a = bag();
  return { label: `Egg ${a ? a.egg.fill : 0} of ${NEED}`, pct: a ? a.egg.fill / NEED * 100 : 0 };
};
const goNext = () => {
  const step = document.querySelector("#nextStep");
  if (step) return step.click();
  const ch = document.querySelector("#nextCh");
  if (ch) return ch.click();
  const ctx = WR._roundCtx || {};
  if (ctx.kind === "math" && WR.Math && window.MathGen) {
    const g = ctx.grade || (WR.state.math && WR.state.math.grade) || 1;
    const t = MathGen.gradeTopics(g).find(x => !x.extra && !x.story && WR.Math.crownsFor(x.id) < 3 && x.id !== ctx.topic);
    if (t) return WR.Math.startLesson({ topic: t.id });
    return WR.go("math", g);
  }
  const ct = WR.continueTarget && WR.continueTarget();
  if (ct && ct.realm) return WR.startLesson({ realm: ct.realm.id, skill: ct.skill.id, key: ct.skill.id, title: `${ct.skill.name} · ${ct.realm.modeName}` });
  WR.go("home");
};
A.goNext = goNext;
const panelHTML = () => {
  const a = bag(); if (!a) return "";
  const q = ensureQuest(a);
  const bar = crownBar();
  const prize = a.lastPrize && prizeById(a.lastPrize);
  const trick = a.lastTrick && TRICKS.find(t => t.id === a.lastTrick);
  const days = Object.keys(a.week.days || {}).length;
  return `<div id="againPanel">
    <p class="again-cheer">${esc(cheer())}${trick && a.rounds === TRICKS.find(t => t.id === trick.id).at ? ` ${esc(petName())} learned the ${esc(trick.name)}.` : ""}</p>
    <div class="egg-row">${eggArt(a)}<div><b>Mystery egg</b><div class="muted">${a.egg.fill} of ${NEED}${prize ? ` · Hatched: ${esc(prize.name)}` : ""}</div></div></div>
    <div class="again-bar" aria-label="${esc(bar.label)}"><i style="width:${Math.max(0, Math.min(100, bar.pct))}%"></i></div>
    <div class="muted again-bar-l">${esc(bar.label)}</div>
    <button class="btn mint again-go" id="againNext" type="button">Next adventure</button>
    <p class="again-q">${q.done ? "Little quest done for today. A new one waits tomorrow." : `${esc(questLabel(q))} · ${q.n}/${q.goal}`}${a.week.got ? " · This week's sticker is yours." : ` · Week sticker ${days}/5`}</p>
  </div>`;
};
const eggArt = a => `<div class="egg-shell" data-fill="${a.egg.fill}" aria-hidden="true"><i style="height:${Math.round((a.egg.fill / NEED) * 70)}%"></i></div>`;
A.panelHTML = panelHTML;
const attach = root => {
  if (!root || root.querySelector("#againPanel")) return;
  const html = panelHTML(); if (!html) return;
  const hold = document.createElement("div"); hold.innerHTML = html;
  const panel = hold.firstElementChild;
  const row = root.querySelector(".next-row") || root.querySelector(".row");
  if (row) row.before(panel); else root.appendChild(panel);
  const go = panel.querySelector("#againNext");
  if (go) go.onclick = e => { e.preventDefault(); e.stopPropagation(); goNext(); };
};
const view0 = WR.view;
WR.view = html => {
  const r = view0(html);
  const card = document.querySelector(".result, .story-done .card, .ph-done .card, .ch-done .card, .sw-done .card");
  if (card) attach(card);
  return r;
};
const done0 = WR.activityDone;
WR.activityDone = function () { const r = done0.apply(this, arguments); try { A.onRound(); } catch (e) { /* a play-again hiccup must not block the round */ } return r; };
if (WR.Garden && WR.Garden.grade && !WR.Garden.grade._again) {
  const g0 = WR.Garden.grade;
  WR.Garden.grade = function (id, ok) { const r = g0.apply(this, arguments); if (ok) A.onWater(); return r; };
  WR.Garden.grade._again = true;
}
const bump0 = WR.bumpStreak;
WR.bumpStreak = function () {
  const before = WR.state && WR.state.streak && WR.state.streak.rest;
  const r = bump0.apply(this, arguments);
  const rest = WR.state && WR.state.streak && WR.state.streak.rest;
  if (rest && rest !== before) markDay(rest, "rest");
  return r;
};
if (WR.HEALTH && WR.HEALTH.restCard) {
  const rest0 = WR.HEALTH.restCard;
  WR.HEALTH.restCard = why => {
    rest0(why);
    const card = document.querySelector("#restCard");
    const a = bag(); if (!card || !a || card.querySelector(".again-bye")) return;
    const q = ensureQuest(a);
    const line = `${esc(petName())} waves. Your egg is ${a.egg.fill} of ${NEED} full. Tomorrow's little quest: ${esc(questLabel(q))}. Rest days count, and missing a day does no harm.`;
    const para = card.querySelector("p");
    if (para) para.insertAdjacentHTML("afterend", `<p class="again-bye">${line}</p>`);
  };
}
if (WR.HEALTH && WR.HEALTH.rowsHTML) {
  const rows0 = WR.HEALTH.rowsHTML;
  WR.HEALTH.rowsHTML = function () { return rows0.apply(this, arguments) + `<p class="muted again-grown">Play-again is an egg, one little daily quest, and a weekly sticker. Missing a day does no harm. A rest day still counts.</p>`; };
}
const home0 = WR.screens.home;
if (home0) WR.screens.home = function () {
  const r = home0.apply(this, arguments);
  const small = document.querySelector("#petMini small");
  const a = bag();
  if (small && a) small.insertAdjacentText("beforeend", ` · egg ${a.egg.fill}/${NEED}`);
  return r;
};
const quests0 = WR.screens.quests;
if (quests0) WR.screens.quests = function () {
  const r = quests0.apply(this, arguments);
  const a = bag(); if (!a) return r;
  const q = ensureQuest(a);
  const host = document.querySelector(".quests");
  if (host) host.insertAdjacentHTML("beforeend", `<p class="again-q" id="littleQuest"><b>Little quest</b> · ${q.done ? "Done for today. See you tomorrow." : `${esc(questLabel(q))} · ${q.n}/${q.goal}`}</p>`);
  return r;
};
const pet0 = WR.screens.pet;
if (pet0) WR.screens.pet = function () {
  const r = pet0.apply(this, arguments);
  const a = bag(); if (!a) return r;
  const card = document.querySelector(".pethome");
  if (card) card.insertAdjacentHTML("beforeend", `<div class="again-pet">${eggArt(a)}<div><b>Mystery egg</b><div class="muted">${a.egg.fill} of ${NEED} · tricks ${a.tricks.length}</div></div></div>`);
  return r;
};
A.teaser = why => {
  const a = bag(), q = a && ensureQuest(a);
  return `${petName()} waves. Your egg is ${a ? a.egg.fill : 0} of ${NEED} full. Tomorrow's little quest: ${questLabel(q)}.`;
};
})();
