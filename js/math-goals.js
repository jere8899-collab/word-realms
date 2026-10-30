/* 🏆 Goals between lessons for the 🔢 Number Kingdom (C6 for maths).
   • Sticker Book pages: "Number Kingdom" (8 maths stickers) and "Grade Guardians" (one per guardian), worked out from the save
     and paid exactly like the English pages (+2⭐ each, +10⭐ for a full page; js/collect.js C.addPages / C.check).
   • 🛡️ Grade Guardians: one friendly boss per two grades (G1–2 … G11–12, following the Singapore MOE stages P1–2, P3–4, P5–6,
     Sec 1–2, Sec 3–4, JC 1–2). A guardian wakes once 4 topics in its two grades are passed (60%+). The fight is 10 questions
     made by the normal generators for those two grades (5 topics from each), no timer, hints and 🧮 Model Magic as usual;
     7 sparkle hits win (1 per first-try answer, ½ for a second try). First win: +15⭐ and that guardian's sticker.
   • The hub shows the next maths goal and the guardian cards.
   Save (inside wordRealms.save.v1, so it cloud-syncs): math.bosses = { g12: { won, best, tries, at } }, stickers.got.math / .guard. */
(function () {
const WR = window.WR, MG = window.MathGen, MW = WR.Math, C = WR.Collect, esc = WR.esc;
if (!MW || !C) return;
const G = WR.MathGoals = {};
const NEED_TOPICS = 4, NEED_HITS = 7, PASS = 0.6;
G.GUARDIANS = [
  { id: "g12", grades: [1, 2], stage: "Primary 1–2", name: "Bramble the Button Bear", face: "🧸", art: "mboss_bramble", line: "Hello, little counter! Can you add up all my buttons?" },
  { id: "g34", grades: [3, 4], stage: "Primary 3–4", name: "Professor Hootsworth", face: "🦉", art: "mboss_hootsworth", line: "Hoo-hoo! Times tables and fractions, let's see what you know!" },
  { id: "g56", grades: [5, 6], stage: "Primary 5–6", name: "Captain Ottilie the Otter", face: "🦦", art: "mboss_ottilie", line: "Ahoy! Decimals, percentages and ratios ahead!" },
  { id: "g78", grades: [7, 8], stage: "Secondary 1–2", name: "Sage Shellby the Turtle", face: "🐢", art: "mboss_shellby", line: "Slow and steady solves every equation." },
  { id: "g910", grades: [9, 10], stage: "Secondary 3–4", name: "Quartzy the Crystal Golem", face: "💎", art: "mboss_quartzy", line: "Crunch-crunch! Can you crack my quadratic riddles?" },
  { id: "g1112", grades: [11, 12], stage: "JC 1–2", name: "Lumina the Calculus Unicorn", face: "🦄", art: "mboss_lumina", line: "Sparkle! Let's ride the curves of calculus together!" }
].map(g => Object.assign(g, { band: `${g.grades[0]}–${g.grades[1]}` }));
const byId = id => G.GUARDIANS.find(g => g.id === id);
G.forGrade = grade => G.GUARDIANS.find(g => g.grades.includes(grade || 1));
const rec = id => { const b = MW.st().bosses; return b[id] = b[id] || { won: false, best: 0, tries: 0 }; };
const won = id => !!(MW.st().bosses[id] || {}).won;
const bandTopics = gd => gd.grades.flatMap(g => MG.gradeTopics(g));
G.passed = gd => bandTopics(gd).filter(t => (MW.st().topics[t.id] || {}).best >= PASS).length;
G.ready = gd => G.passed(gd) >= NEED_TOPICS;
// art: the painted portrait when it exists (assets/ui/mboss_<name>.png via tools/boss_art.py), else painted Sumi wearing the guardian's badge
G.art = (gd, cls = "rb-art") => WR.asset(gd.art) ? WR.img(gd.art, cls) : `<span class="${cls} gfb">${MW.mascot()}<i>${gd.face}</i></span>`;

/* ---------- the fight ---------- */
G.items = gd => WR.shuffle(gd.grades.flatMap(g => WR.shuffle(MG.gradeTopics(g)).slice(0, 5))).map(t => MG.batch(t.id, 1)[0]).filter(Boolean);
G.start = id => {
  const gd = byId(id); if (!gd) return;
  if (!G.ready(gd) && !WR.state.settings.unlockAll) return WR.toast(`🔒 Pass ${NEED_TOPICS} Grade ${gd.band} topics to wake ${gd.name}!`, 2400);
  const r = rec(id); r.tries++; WR.save();
  MW.startLesson({ grade: gd.grades[0], items: G.items(gd), key: "guard." + id, title: `🛡️ ${gd.name}`, guardian: Object.assign({ need: NEED_HITS }, gd),
    replay: () => G.start(id),
    onFinish: res => { const r = rec(id); r.best = Math.max(r.best || 0, res.score); if (res.won) C.winBoss(r, gd.name, "a Guardian sticker"); WR.save(); C.check(); } });
};

/* ---------- sticker pages ---------- */
const crownsIn = g => MW.gradeCrowns(g);
const maxGradeCrowns = () => Math.max(0, ...MG.GRADES.map(x => crownsIn(x.g).have));
const fullGrade = () => MG.GRADES.some(x => { const c = crownsIn(x.g); return c.have === c.max; });
G.STICKERS = [
  { id: "first", icon: "🔢", name: "First Sum", how: "Finish any maths lesson", test: () => (MW.st().lessons || 0) > 0 || Object.keys(MW.st().topics).length > 0, prog: () => [Math.min(1, MW.st().lessons || 0), 1] },
  { id: "crown3", icon: "👑", name: "Maths Crown", how: "Get 3 crowns in any maths topic", test: () => MG.TOPICS.some(t => MW.crownsFor(t.id) === 3) },
  { id: "grade10", icon: "🏰", name: "Land Explorer", how: "Earn 10 crowns in one grade", test: () => maxGradeCrowns() >= 10, prog: () => [Math.min(10, maxGradeCrowns()), 10] },
  { id: "tower12", icon: "🗼", name: "Tower Climber", how: "Master 12 times-table facts", test: () => MW.mastered() >= 12, prog: () => [Math.min(12, MW.mastered()), 12] },
  { id: "tower66", icon: "🌈", name: "Halfway Up", how: "Master 66 facts (half the Tower)", test: () => MW.mastered() >= 66, prog: () => [Math.min(66, MW.mastered()), 66] },
  { id: "model5", icon: "🧮", name: "Model Maker", how: "Solve 5 questions with Model Magic", test: () => (MW.st().modelSolved || 0) >= 5, prog: () => [Math.min(5, MW.st().modelSolved || 0), 5] },
  { id: "gradefull", icon: "💯", name: "Grade Champion", how: "Get 3 crowns in every topic of one grade", test: fullGrade },
  { id: "guardian", icon: "🛡️", name: "Guardian Badge", how: "Beat any Grade Guardian", test: () => G.GUARDIANS.some(g => won(g.id)) }
];
const guardDefs = () => G.GUARDIANS.map(gd => ({ id: gd.id, icon: gd.face, art: gd.art, name: gd.name, how: `Beat the Grade ${gd.band} Guardian`, test: () => won(gd.id) }));
C.addPages(() => [
  { id: "math", icon: "🔢", title: "Number Kingdom", name: "Number Kingdom", bg: "bg_math", defs: G.STICKERS },
  { id: "guard", icon: "🛡️", title: "Grade Guardians", name: "Grade Guardians", bg: "bg_math", defs: guardDefs() }
]);

/* ---------- next maths goal ---------- */
const firstUnpassed = gd => { const m = MW.st(), g = m.grade && gd.grades.includes(m.grade) ? m.grade : gd.grades[0];
  const ts = MG.gradeTopics(g).concat(bandTopics(gd)); return ts.find(t => !((m.topics[t.id] || {}).best >= PASS)) || ts[0]; };
G.nextGoal = () => {
  const m = MW.st(), here = G.forGrade(m.grade);
  const awake = [here].concat(G.GUARDIANS).find(gd => G.ready(gd) && !won(gd.id));
  if (awake) return { icon: awake.face, text: `${awake.name} is awake! Win the fight for +15⭐ and a Guardian sticker`, pct: 100, btn: "⚔️ Challenge", go: () => G.start(awake.id), kind: "fight", id: awake.id };
  if (!won(here.id)) { const p = G.passed(here), t = firstUnpassed(here), left = NEED_TOPICS - p;
    return { icon: "🛡️", text: `Pass ${left} more Grade ${here.band} topic${left > 1 ? "s" : ""} (60%+) to wake ${here.name}`, pct: p / NEED_TOPICS * 100, btn: `▶ ${t.icon} ${t.name}`, go: () => MW.startLesson({ topic: t.id }), kind: "wake", id: here.id }; }
  const got = C.got("math"), st = G.STICKERS.find(s => !got.includes(s.id));
  if (st) { const pr = st.prog ? st.prog() : null;
    return { icon: st.icon, text: `Next sticker: ${st.name}. ${st.how}${pr ? ` (${pr[0]}/${pr[1]})` : ""}`, pct: pr ? pr[0] / pr[1] * 100 : 0, btn: "🏷️ Sticker Book", go: () => WR.go("stickers", "math"), kind: "sticker", id: st.id }; }
  const nextG = G.GUARDIANS.find(gd => !won(gd.id));
  if (nextG) return { icon: nextG.face, text: `Visit Grade ${nextG.band} and wake ${nextG.name}!`, pct: G.passed(nextG) / NEED_TOPICS * 100, btn: `Go to Grade ${nextG.grades[0]} →`, go: () => WR.go("math", nextG.grades[0]), kind: "wake", id: nextG.id };
  return { icon: "🌟", text: "You've beaten every Grade Guardian and filled the Number Kingdom page. Amazing!", pct: 100, btn: "🏷️ Sticker Book", go: () => WR.go("stickers", "math"), kind: "done" };
};
const goalHTML = ng => `<div class="card mgoal goals" id="mathGoal"><div class="goal"><span class="gi">${ng.icon}</span><div class="gb"><b>🎯 Next maths goal</b><small style="display:block;font-size:.86rem;color:inherit">${esc(ng.text)}</small><div class="prog"><i style="width:${Math.round(ng.pct)}%;background:linear-gradient(90deg,#FFE79A,#FFB8D9)"></i></div></div><button class="btn small mint" id="mathGoalGo">${esc(ng.btn)}</button></div></div>`;
const guardCard = gd => { const p = Math.min(NEED_TOPICS, G.passed(gd));
  return C.bossCard({ artHTML: G.art(gd), name: gd.name, line: gd.line, ready: G.ready(gd), won: won(gd.id), lock: `Pass ${NEED_TOPICS} Grade ${gd.band} topics to wake me (${p}/${NEED_TOPICS})`, pct: p / NEED_TOPICS * 100,
    badge: `G${gd.band}`, cls: "gcard" + (G.forGrade(MW.st().grade) === gd ? " here" : ""), data: gd.id }); };

/* ---------- wire into the Number Kingdom hub ---------- */
const _math = WR.screens.math;
WR.screens.math = (...a) => {
  C.check(); _math(...a);
  const hub = WR.$("#main .math-hub"); if (!hub) return;
  const ng = G.nextGoal(), hero = hub.querySelector(".math-hero");
  hero.insertAdjacentHTML("afterend", goalHTML(ng));
  WR.$("#mathGoalGo").onclick = e => { e.stopPropagation(); ng.go(); };
  const n = G.GUARDIANS.filter(g => won(g.id)).length;
  hub.insertAdjacentHTML("beforeend", `<h2 id="guardHead">🛡️ Grade Guardians <span class="pill">${n}/${G.GUARDIANS.length} beaten</span></h2><p class="muted" style="font-weight:700;margin-top:0">A friendly guardian watches every two grades. Pass ${NEED_TOPICS} topics in their grades to wake them, then win a 10-question fight (no timer) for +15⭐ and a sticker!</p><div class="guards">${G.GUARDIANS.map(guardCard).join("")}</div>`);
  hub.querySelectorAll("[data-gb]").forEach(c => c.onclick = () => G.ready(byId(c.dataset.gb)) ? G.start(c.dataset.gb) : WR.toast(`🔒 Pass ${NEED_TOPICS} Grade ${byId(c.dataset.gb).band} topics to wake ${byId(c.dataset.gb).name}!`, 2400));
};
})();
