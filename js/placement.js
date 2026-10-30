/* 🪞 The Magic Mirror: an adaptive CEFR placement quiz.
   Staircase over the six realms: 4 questions per level (2 grammar, 1 vocabulary, 1 listening), pass = 3/4.
   Start at B1; climb after a pass, step down after a fail, and stop when the result is pinned between
   a passed level and a failed one. The recommended realm is the first level you did NOT pass
   (the level you're ready to learn), or C2 if you pass everything. Typically 8–16 questions. */
(function () {
const WR = window.WR;
const LV = ["a1", "a2", "b1", "b2", "c1", "c2"];
const PER = 4, PASS = 3, START = 2;
const CAN_DO = {
  a1: "You can understand and use everyday words and very simple phrases: introduce yourself, ask and answer simple questions about people and things you know.",
  a2: "You can talk about familiar things like family, shopping, school and your town, and understand short, clear messages and sentences.",
  b1: "You can deal with most everyday situations, describe experiences and plans, and give short reasons and opinions on familiar topics.",
  b2: "You can understand the main ideas of complex texts, talk fluently with native speakers, and explain a viewpoint with pros and cons.",
  c1: "You can understand long, demanding texts and implicit meaning, and express ideas fluently and precisely for social, academic and work purposes.",
  c2: "You can understand virtually everything you hear or read and express yourself spontaneously, very fluently and with fine shades of meaning."
};
let P = null;

// Prefer items whose correct answer is NOT the uniquely longest option, so guessing "the longest one" doesn't work.
function fair(items) {
  const ok = items.filter(q => {
    const c = q.options[q.answer], L = c.length;
    return q.options.some((o, k) => k !== q.answer && o.length >= L);
  });
  return ok.length >= 3 ? ok : items;
}
async function stageItems(lv) {
  const [g, v, l] = await Promise.all(["grammar", "vocab", "listening"].map(k => WR.bank(lv, k)));
  const mc = b => b.filter(q => q.options && typeof q.answer === "number");
  const picks = [...WR.sample(fair(mc(g)), 2), ...WR.sample(fair(mc(v)), 1), ...WR.sample(fair(mc(l)), 1)];
  return WR.shuffle(picks.map(q => Object.assign(WR.normalize(q), { lv })));
}
WR.placementResult = r => {
  // r: {idx: correctCount}. Returns the realm index to start in, or null if more testing is needed.
  for (let i = 0; i < 6; i++) {
    if (r[i] == null) continue;
    const pass = r[i] >= PASS;
    if (pass && i === 5) return 5;
    if (pass && r[i + 1] != null && r[i + 1] < PASS) return i + 1;
    if (!pass && i === 0) return 0;
    if (!pass && r[i - 1] != null && r[i - 1] >= PASS) return i;
  }
  return null;
};
function nextLevel(r, last) { return r[last] >= PASS ? last + 1 : last - 1; }

WR.startPlacement = async (opts = {}) => {
  WR.stopLesson && WR.stopLesson(); window.Speech && Speech.stop();
  P = { opts, scores: {}, lvIdx: START, items: [], i: 0, stageRight: 0, asked: 0, log: [] };
  intro();
};
WR.stopPlacement = () => { P = null; };
const mirrorImg = (cls = "mirror") => `<img class="${cls}" src="assets/web/mirror.webp" alt="The Magic Mirror" onerror="if(this.src.indexOf('.webp')>0){this.src='assets/ui/mirror.png';return}this.outerHTML='<div class=&quot;${cls}&quot; style=&quot;font-size:4rem;text-align:center&quot;>🪞</div>'">`;

function intro() {
  WR.view(`<div class="card mirror-card fade-in center">${mirrorImg()}
    <h1 style="margin:.2em 0">🪞 The Magic Mirror</h1>
    <p style="font-weight:800;font-size:1.05rem">“Mirror, mirror, on the wall — which realm suits me best of all?”</p>
    <p class="muted" style="font-weight:700">Answer a few short grammar, vocabulary and listening riddles. The questions get harder when you're right and easier when you're not. It takes about 3 minutes. Don't guess wildly — if you don't know, pick <b>“I'm not sure”</b>.</p>
    <div class="pl-steps">${WR.realms.map(r => `<span class="pl-step"><span class="lvl-badge">${r.level}</span></span>`).join("")}</div>
    <div class="row" style="justify-content:center;margin-top:14px"><button class="btn ghost" id="plBack">← Back</button><button class="btn mint" id="plGo">Look into the mirror ✨</button></div></div>`);
  WR.$("#plBack").onclick = () => { const f = P.opts.onBack; P = null; f && f(); };
  WR.$("#plGo").onclick = () => loadStage();
}
async function loadStage() {
  P.items = await stageItems(LV[P.lvIdx]); P.i = 0; P.stageRight = 0;
  question();
}
function steps() {
  return `<div class="pl-steps">${WR.realms.map((r, i) => {
    const s = P.scores[i], cls = i === P.lvIdx ? "now" : s == null ? "" : s >= PASS ? "pass" : "fail";
    return `<span class="pl-step ${cls}" title="${r.name}"><span class="lvl-badge">${r.level}</span>${s == null ? (i === P.lvIdx ? "🔮" : "·") : s >= PASS ? "🌟" : "🌙"}</span>`; }).join("")}</div>`;
}
function question() {
  const it = P.items[P.i];
  let body = "";
  if (it.type === "listen") body += `<div class="listenbox"><button class="playbtn" id="playBtn" aria-label="Play audio">🔊</button><button class="btn ghost small" id="slowBtn">🐢 Slow</button>
    ${Speech.supported ? "" : `<div class="transcript">“${WR.esc(it.say)}”</div>`}</div>`;
  if (it.pic) body += `<div class="qpic">${it.pic}</div>`;
  WR.view(`<div class="fade-in"><div class="row" style="margin:6px 0 8px"><button class="btn ghost small" id="plQuit">← Leave</button><b class="title">🪞 The Magic Mirror</b><span class="qnum" style="margin-left:auto">Question ${P.asked + 1}</span></div>
    <div class="card hud mirror-hud">${mirrorImg("mirror-mini")}${steps()}</div>
    <div class="card qcard">${body}<div class="qtext">${WR.esc(it.q)}</div>
      <div class="opts">${it.options.map((o, k) => `<button class="opt" data-k="${k}"><span class="k">${"ABCD"[k]}</span>${WR.esc(o)}</button>`).join("")}</div>
      <div class="row" style="justify-content:center;margin-top:10px"><button class="btn ghost small" id="unsure">🤔 I'm not sure</button></div><div id="plFb"></div></div></div>`);
  WR.$("#plQuit").onclick = () => { Speech.stop(); const f = P.opts.onBack; P = null; f && f(); };
  if (it.type === "listen") {
    const play = r => Speech.speak(it.say, r || WR.state.settings.rate);
    WR.$("#playBtn").onclick = () => play(); WR.$("#slowBtn").onclick = () => play(0.6); setTimeout(() => P && play(), 300);
  }
  document.querySelectorAll(".opt").forEach(b => b.onclick = () => answer(it.options[+b.dataset.k] === it.correct, b, it));
  WR.$("#unsure").onclick = () => answer(false, null, it);
}
function answer(ok, btn, it) {
  if (it._done) return; it._done = true; Speech.stop();
  document.querySelectorAll(".opt").forEach(b => { b.disabled = true; if (it.options[+b.dataset.k] === it.correct) b.classList.add("right"); });
  if (btn && !ok) btn.classList.add("wrong");
  WR.$("#unsure").disabled = true; WR.sfx(ok ? "good" : "tap");
  if (ok) P.stageRight++;
  P.asked++; P.log.push({ lv: it.lv, ok });
  const fb = WR.$("#plFb");
  fb.innerHTML = `<div class="explain ${ok ? "good" : "bad"}"><b>${ok ? "✨ The mirror glows!" : "🌙 The mirror shimmers…"}</b> ${it.explain ? `<span class="muted">${WR.esc(it.explain)}</span>` : ""}
    <div class="row" style="justify-content:flex-end;margin-top:8px"><button class="btn small" id="plNext">Next →</button></div></div>`;
  WR.$("#plNext").onclick = advance;
}
function advance() {
  P.i++;
  // every level gets all four riddles, so grammar, vocabulary and listening all count
  if (P.i < PER) return question();
  P.scores[P.lvIdx] = P.stageRight;
  const res = WR.placementResult(P.scores);
  if (res != null) return result(res);
  const up = P.scores[P.lvIdx] >= PASS;
  P.lvIdx = nextLevel(P.scores, P.lvIdx);
  WR.toast(up ? "🌟 Up to a harder realm!" : "🌙 Let's try a gentler realm", 1400);
  loadStage();
}
function result(idx) {
  const r = WR.realms[idx], lv = LV[idx], s = WR.state, first = !s.placement;
  const right = P.log.filter(x => x.ok).length;
  s.placement = { level: lv, at: Date.now(), scores: P.scores, asked: P.asked, right };
  if (first && s.pet) WR.addStars(5, "Magic Mirror reading!"); else if (first) s.stars += 5;
  WR.save(); WR.sfx("level"); WR.confetti();
  WR.view(`<div class="card mirror-card fade-in center">${mirrorImg()}
    <div class="muted" style="font-weight:800">The Magic Mirror says…</div>
    <div class="pl-level"><span class="lvl-badge big">${r.level}</span><b>${r.emoji} ${r.name}</b></div>
    <p style="font-weight:700;max-width:560px;margin:8px auto">${CAN_DO[lv]}</p>
    ${steps().replace("pl-step now", "pl-step")}
    <p class="muted" style="font-size:.85rem;font-weight:700">${right} of ${P.asked} riddles right. 🌟 = passed that level, 🌙 = still learning. ${idx > 0 ? "Earlier realms stay open for practice." : ""}${first ? " +5⭐ for your first reading!" : ""}</p>
    <div class="row" style="justify-content:center;margin-top:10px"><button class="btn ghost" id="plOther">Choose myself</button><button class="btn mint" id="plAccept">Begin in ${WR.esc(r.name)} ✨</button></div></div>`);
  const o = P.opts; P = null;
  WR.$("#plAccept").onclick = () => o.onAccept && o.onAccept(lv);
  WR.$("#plOther").onclick = () => o.onBack && o.onBack(lv);
}
WR._plDbg = () => P && P.items[P.i] && { c: P.items[P.i].correct, lv: P.items[P.i].lv };
})();
