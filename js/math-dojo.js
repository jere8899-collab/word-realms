/* 🗼 Times-Table Tower (multiplication & division dojo) and 🔮 Sumi's grade finder for the Number Kingdom. */
(function () {
const WR = window.WR, MG = window.MathGen, MW = WR.Math, esc = WR.esc;
const { tower, mascot, coarse } = MW;   // shared helpers from math.js
let D = null, timer = null;
const stopTimer = () => { if (timer) { clearInterval(timer); timer = null; } };
MW.stopDojo = () => { stopTimer(); D = null; };

/* ---------- the Tower lobby ---------- */
WR.screens.dojo = () => {
  MW.loadKatex();
  const m = MW.st(), d = m.dojo, tables = d.tables && d.tables.length ? d.tables : MG.TABLES.slice(0, 4), due = MW.dueFacts(tables);
  const floors = MG.CHALLENGES.map(c => { const p = m.topics["dojo." + c.id]; return `<div class="card skill-card floor" data-ch="${c.id}"><span class="lvl-badge">Grade ${c.grade}+</span><span class="ico">${c.icon}</span><h3>${esc(c.name)}</h3><div class="crowns">${p ? "👑".repeat(WR.crowns(p.best)) + `<span style="opacity:.2">${"👑".repeat(3 - WR.crowns(p.best))}</span>` : '<span class="muted" style="font-size:.8rem">not played</span>'}</div></div>`; }).join("");
  WR.view(`<div class="fade-in dojo"><div class="row" style="margin:6px 0 8px"><button class="btn ghost small" id="backK">← Number Kingdom</button></div>
    <div class="card dojo-head">${tower()}<div style="flex:1"><h1 style="margin:0">🗼 Times-Table Tower</h1><p class="muted" style="font-weight:800;margin:.3em 0">Climb the tower one fact at a time! Pick your tables, then practise calmly or race the 60-second sprint. Facts you miss come back sooner, so they stick.</p>
      <div class="row" style="gap:6px"><span class="pill" style="background:var(--mint)">🌟 ${MW.mastered()}/132 facts mastered</span><span class="pill">⚡ best sprint ${d.best || 0}</span><span class="pill" style="background:var(--butter)">🏃 ${d.sprints || 0} sprints</span>${due ? `<span class="pill" style="background:#FFE3EF">🔁 ${due} to review</span>` : ""}</div></div></div>
    <div class="card"><b>1. Pick your tables</b><div class="tchips">${MG.TABLES.map(t => `<button class="tchip ${tables.includes(t) ? "sel" : ""}" data-tb="${t}">×${t}</button>`).join("")}<button class="tchip all" data-tb="all">All</button></div>
      <b style="display:block;margin-top:10px">2. Multiply, divide or both?</b><div class="tchips">${[["x", "✖️ Multiply"], ["d", "➗ Divide"], ["m", "🔀 Mixed"]].map(([k, l]) => `<button class="tchip op ${d.op === k ? "sel" : ""}" data-op="${k}">${l}</button>`).join("")}</div>
      <div class="grid g3" style="margin-top:14px"><button class="btn mint" id="goPractice">🧘 Practice (12 facts)</button><button class="btn peach" id="goSprint">⚡ 60-second sprint</button><button class="btn ghost" id="goGrid">🗺️ Mastery grid</button></div></div>
    <h2>🏰 Challenge floors</h2><p class="muted" style="font-weight:700;margin-top:0">Bigger sums with hints and worked solutions: 2-digit × 1-digit, long multiplication, long division with remainders, and decimals.</p><div class="grid g3">${floors}</div></div>`);
  WR.$("#backK").onclick = () => WR.go("math");
  document.querySelectorAll("[data-tb]").forEach(b => b.onclick = () => { let t = d.tables && d.tables.length ? d.tables.slice() : tables.slice(); if (b.dataset.tb === "all") t = t.length === 11 ? [2, 3, 4, 5] : MG.TABLES.slice(); else { const v = +b.dataset.tb; t = t.includes(v) ? t.filter(x => x !== v) : t.concat(v).sort((a, b2) => a - b2); if (!t.length) t = [v]; } d.tables = t; WR.save(); WR.sfx("tap"); WR.screens.dojo(); });
  document.querySelectorAll("[data-op]").forEach(b => b.onclick = () => { d.op = b.dataset.op; WR.save(); WR.screens.dojo(); });
  WR.$("#goPractice").onclick = () => MW.startDojo("practice");
  WR.$("#goSprint").onclick = () => MW.startDojo("sprint");
  WR.$("#goGrid").onclick = () => WR.go("dojoGrid");
  document.querySelectorAll("[data-ch]").forEach(c => c.onclick = () => MW.startLesson({ challenge: c.dataset.ch }));
  WR.navActive("math");
};

/* ---------- practice & sprint ---------- */
const factFor = ([a, b], op) => MG.factQ(a, b, op === "d" || (op === "m" && Math.random() < .5));
MW.startDojo = mode => {
  stopTimer(); MW.loadKatex();
  const m = MW.st(), d = m.dojo, tables = d.tables && d.tables.length ? d.tables : [2, 3, 4, 5];
  const pool = MG.pickFacts(m.facts, tables, mode === "sprint" ? 400 : 12);
  D = { mode, tables, op: d.op || "x", pool, queue: pool.slice(0, mode === "sprint" ? 400 : 12).map(f => factFor(f, d.op || "x")), i: 0, right: 0, wrong: 0, combo: 0, best: 0, newMastered: 0, retry: new Set(), left: 60, t0: 0, misses: [] };
  if (mode === "sprint") { D.endAt = Date.now() + 60000; timer = setInterval(tick, 200); }
  draw();
};
function tick() {
  if (!D) return stopTimer();
  const left = Math.max(0, (D.endAt - Date.now()) / 1000), bar = WR.$("#sprintBar"), tx = WR.$("#sprintLeft");
  if (bar) bar.style.width = left / 60 * 100 + "%"; if (tx) tx.textContent = Math.ceil(left) + "s";
  if (left <= 0) { stopTimer(); endDojo(); }
}
function draw() {
  if (!D.queue[D.i] && D.mode === "sprint") D.queue.push(...WR.shuffle(D.pool).map(f => factFor(f, D.op)));
  const q = D.queue[D.i]; if (!q) return endDojo();
  D.t0 = performance.now(); D.locked = false;
  WR.view(`<div class="lesson-bg" style="background-image:${WR.bgCss("bg_math")}"></div>
    <div class="row" style="margin:6px 0 8px"><button class="btn ghost small" id="quitD">← Tower</button><b class="title">${D.mode === "sprint" ? "⚡ 60-second sprint" : "🧘 Practice"} · ×${D.tables.join(", ×")}</b></div>
    <div class="card hud dojo-hud"><span class="pill">✅ ${D.right}</span><span class="pill" style="background:#FFE3EF">💭 ${D.wrong}</span><span class="pill" style="background:var(--butter)">🔥 ${D.combo}</span>${D.mode === "sprint" ? `<div class="timer sprint"><i id="sprintBar" style="width:${Math.max(0, (D.endAt - Date.now()) / 600)}%"></i></div><b id="sprintLeft">${Math.ceil(Math.max(0, (D.endAt - Date.now()) / 1000))}s</b>` : `<span class="qnum">${D.i + 1}/${D.queue.length}</span>`}</div>
    <div class="lesson fade-in"><div class="card qcard mq dojo-q"><div class="fact" id="factQ">${MW.html(q.q)}</div>
      <div class="ansrow"><input id="mans" class="input mans big" autocomplete="off" ${coarse() ? 'inputmode="none"' : 'inputmode="numeric"'} placeholder="?" aria-label="Your answer"><button class="btn mint" id="mcheck">✓</button></div>
      <div class="numpad dojo-pad">${[7, 8, 9, 4, 5, 6, 1, 2, 3].map(k => `<button data-key="${k}">${k}</button>`).join("")}<button class="bk" data-key="clear" aria-label="Clear">C</button><button data-key="0">0</button><button class="bk" data-key="back" aria-label="Delete">⌫</button></div>
      <div id="dfb" class="dfb"></div></div>
      <div class="card side"><div class="petbox" id="lpet">${WR.petHTML()}</div><div class="bubble" id="lbubble">${D.i === 0 ? (D.mode === "sprint" ? "Ready, set, GO! ⚡" : "Nice and steady! 🧘") : esc(D.say || "You've got this! ✨")}</div></div></div>`);
  const inp = WR.$("#mans");
  const put = k => { if (D.locked) return; if (k === "back") inp.value = inp.value.slice(0, -1); else if (k === "clear") inp.value = ""; else if (inp.value.length < 4) inp.value += k; auto(); };
  const auto = () => { if (MG.check(q, inp.value).ok) answer(true); };
  document.querySelectorAll(".dojo-pad [data-key]").forEach(b => b.onclick = e => { e.preventDefault(); put(b.dataset.key); if (!coarse()) inp.focus(); });
  inp.oninput = () => { inp.value = inp.value.replace(/[^0-9]/g, "").slice(0, 4); auto(); };
  inp.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); if (inp.value) answer(MG.check(q, inp.value).ok); } };
  WR.$("#mcheck").onclick = () => { if (inp.value) answer(MG.check(q, inp.value).ok); };
  WR.$("#quitD").onclick = () => { stopTimer(); D = null; WR.go("dojo"); };
  if (!coarse()) setTimeout(() => inp.focus({ preventScroll: true }), 20);
}
function answer(ok) {
  if (!D || D.locked) return; D.locked = true;
  const q = D.queue[D.i], m = MW.st(), ms = performance.now() - D.t0, before = (m.facts[q.fact] || {}).b || 0;
  const f = MG.gradeFact(m.facts, q.fact, ok, ms); const s = WR.state; WR.countAnswer(ok, "m:dojo.tower");
  if (ok) { D.right++; D.combo++; D.best = Math.max(D.best, D.combo); m.correct = (m.correct || 0) + 1; if (before < MG.MASTERED && f.b >= MG.MASTERED) D.newMastered++; WR.questEvent("correct10"); if (D.combo === 5) WR.questEvent("combo5"); WR.sfx("good"); }
  else {
    D.wrong++; D.combo = 0; WR.sfx("bad"); D.misses.push(q.fact);
    // spaced repetition inside the round: a missed fact comes back 3 questions later (once)
    if (!D.retry.has(q.fact)) { D.retry.add(q.fact); const [a, b] = q.fact.split("x").map(Number); D.queue.splice(Math.min(D.queue.length, D.i + 3), 0, MG.factQ(a, b, q.data.div)); }
  }
  m.answered = (m.answered || 0) + 1; WR.save();
  const box = WR.$("#lpet"), bub = WR.$("#lbubble"), fb = WR.$("#dfb"), inp = WR.$("#mans");
  if (box) { box.classList.remove("bounce", "cheer", "sad"); void box.offsetWidth; box.classList.add(ok ? (D.combo >= 5 ? "cheer" : "bounce") : "sad"); }
  D.say = ok ? (D.combo >= 5 ? `${D.combo} in a row! 🔥` : ["Zoom! ⚡", "Yes! ✨", "Tower power! 🗼", "Correct! 💖"][D.right % 4]) : "Let's remember this one 🧠";
  if (bub) bub.textContent = D.say;
  if (inp) inp.classList.add(ok ? "ok" : "shake");
  if (fb) fb.innerHTML = ok ? `<span class="good">✅ ${ms < 3000 ? "Lightning fast!" : "Correct!"}</span>` : `<span class="bad">💭 ${MW.html(q.steps[0])}</span>`;
  setTimeout(() => { if (!D) return; D.i++; if (D.mode === "sprint" && Date.now() >= D.endAt) return endDojo(); draw(); }, ok ? (D.mode === "sprint" ? 220 : 450) : (D.mode === "sprint" ? 1100 : 1800));
}
function endDojo() {
  if (!D) return; stopTimer();
  const o = D; D = null; const m = MW.st(), d = m.dojo, newBest = o.mode === "sprint" && o.right > (d.best || 0);
  let stars = Math.floor(o.right / 3) + o.newMastered + (o.mode === "practice" ? 2 : 0) + (newBest ? 5 : 0);
  if (o.mode === "sprint") { d.sprints = (d.sprints || 0) + 1; if (newBest) d.best = o.right; d.history = (d.history || []).concat([{ at: Date.now(), score: o.right, wrong: o.wrong, tables: o.tables }]).slice(-12); }
  else d.practice = (d.practice || 0) + 1;
  m.xp = (m.xp || 0) + o.right * 2 + 5; WR.state.stars += stars; WR.questEvent("dojo1");
  const streak = WR.activityDone(), lv = WR.petGainXP(o.right * 3 + 5); WR.save(); WR.renderTop();
  const missed = [...new Set(o.misses)].map(k => { const [a, b] = k.split("x"); return `${a} × ${b} = ${a * b}`; });
  WR.view(`<div class="card result fade-in">${tower("res-tower")}<h1>${o.mode === "sprint" ? (newBest ? "New tower record! 🏆" : "Sprint finished! ⚡") : "Practice complete! 🧘"}</h1>
    <h2>${o.right} correct${o.wrong ? ` · ${o.wrong} to practise` : ""}</h2>
    <p class="muted" style="font-weight:800">⭐ ${stars} stars · best combo ${o.best}${o.newMastered ? ` · 🌟 ${o.newMastered} new fact${o.newMastered > 1 ? "s" : ""} mastered` : ""}${o.mode === "sprint" ? ` · best sprint ${d.best}` : ""}${streak ? ` · 🔥 streak ${WR.state.streak.count}` : ""}</p>
    ${missed.length ? `<div class="card misses"><b>🔁 These facts will come back soon:</b><div class="row" style="justify-content:center;margin-top:6px">${missed.map(x => `<span class="pill">${x}</span>`).join("")}</div></div>` : ""}
    <div class="petbox bounce" style="margin:10px auto">${WR.petHTML()}</div><div class="bubble">${lv ? `I reached level ${lv.level}! 🎉` : o.wrong ? "Practice makes perfect! 💪" : "Flawless! You're a tower champion! 👑"}</div>
    <div class="row" style="justify-content:center;margin-top:16px"><button class="btn" id="dAgain">↻ Again</button><button class="btn ghost" id="dGrid">🗺️ Mastery grid</button><button class="btn mint" id="dBack">Back to the Tower 🗼</button></div></div>`);
  if (newBest || o.newMastered || lv) WR.confetti(); WR.sfx(lv ? "level" : "good");
  WR.$("#dAgain").onclick = () => MW.startDojo(o.mode);
  WR.$("#dGrid").onclick = () => WR.go("dojoGrid");
  WR.$("#dBack").onclick = () => WR.go("dojo");
}

/* ---------- 🗺️ mastery grid (heatmap of every fact 2–12 × 1–12) ---------- */
const BOXNAME = ["missed", "learning", "growing", "mastered", "mastered", "mastered"];
MW.factClass = f => !f ? "u" : f.b === 0 ? "b0" : "b" + Math.min(f.b, 4);
WR.screens.dojoGrid = () => {
  const m = MW.st(), F = m.facts, now = Date.now();
  let rows = `<tr><th>×</th>${Array.from({ length: 12 }, (_, i) => `<th>${i + 1}</th>`).join("")}</tr>`;
  for (const a of MG.TABLES) { rows += `<tr><th>${a}</th>`; for (let b = 1; b <= 12; b++) { const k = MG.factKey(a, b), f = F[k]; rows += `<td class="fc ${MW.factClass(f)}${f && f.d <= now ? " due" : ""}" data-f="${k}" title="${a} × ${b}">${f && f.b >= 4 ? "⭐" : a * b}</td>`; } rows += "</tr>"; }
  const counts = { u: 0, b0: 0, b1: 0, b2: 0, b3: 0, b4: 0 }; for (const a of MG.TABLES) for (let b = 1; b <= 12; b++) counts[MW.factClass(F[MG.factKey(a, b)])]++;
  WR.view(`<div class="fade-in"><div class="row" style="margin:6px 0 8px"><button class="btn ghost small" id="backT">← Tower</button><b class="title">🗺️ Mastery grid</b></div>
    <div class="card"><div class="row" style="justify-content:space-between"><div><h2 style="margin:0">🌟 ${counts.b3 + counts.b4} of 132 facts mastered</h2><div class="muted" style="font-weight:700">Each square is one fact (division counts too: 56 ÷ 7 trains 7 × 8). Answer a fact right on 3 separate visits to master it.</div></div>${mascot("grid-sumi")}</div>
      <div class="gridwrap"><table class="factgrid">${rows}</table></div>
      <div class="legend"><span><i class="fc u"></i>not tried (${counts.u})</span><span><i class="fc b0"></i>missed (${counts.b0})</span><span><i class="fc b1"></i>learning (${counts.b1})</span><span><i class="fc b2"></i>growing (${counts.b2})</span><span><i class="fc b3"></i>mastered (${counts.b3})</span><span><i class="fc b4">⭐</i>super (${counts.b4})</span></div>
      <div id="factInfo" class="muted" style="font-weight:800;margin-top:8px">Tap a square to see how that fact is going.</div>
      <div class="row" style="justify-content:center;margin-top:12px"><button class="btn mint" id="weak">🔁 Practise my weakest facts</button></div></div></div>`);
  WR.$("#backT").onclick = () => WR.go("dojo");
  document.querySelectorAll("[data-f]").forEach(c => c.onclick = () => { const k = c.dataset.f, [a, b] = k.split("x").map(Number), f = F[k];
    WR.$("#factInfo").innerHTML = f ? `<b>${a} × ${b} = ${a * b}</b> · ${BOXNAME[f.b]} · ✅ ${f.r} · 💭 ${f.w}${f.t ? ` · last answer ${(f.t / 1000).toFixed(1)} s` : ""} · ${f.d <= Date.now() ? "ready to review now" : "next review " + when(f.d)}` : `<b>${a} × ${b} = ${a * b}</b> · not tried yet`; });
  WR.$("#weak").onclick = () => { const d = m.dojo, weak = MG.TABLES.filter(a => Array.from({ length: 12 }, (_, i) => F[MG.factKey(a, i + 1)]).some(f => !f || f.b < MG.MASTERED)); d.tables = weak.length ? weak : MG.TABLES.slice(); WR.save(); MW.startDojo("practice"); };
  WR.navActive("math");
};
const when = t => { const h = (t - Date.now()) / 36e5; return h < 1 ? "in " + Math.max(1, Math.round(h * 60)) + " min" : h < 36 ? "in " + Math.round(h) + " h" : "in " + Math.round(h / 24) + " days"; };

/* ---------- 🔮 Sumi's grade finder (adaptive placement) ---------- */
let P = null;
MW.stopPlacement = () => { P = null; };
MW.placement = () => {
  MW.loadKatex();
  P = { lo: 1, hi: 12, passed: 0, round: 0, asked: 0, log: [] }; nextRound();
};
function nextRound() {
  if (P.lo > P.hi) return placeDone();
  P.g = Math.floor((P.lo + P.hi) / 2); P.round++; P.k = 0; P.ok = 0;
  const ts = WR.shuffle(MG.gradeTopics(P.g).filter(t => !t.story)).slice(0, 3); P.qs = ts.map(t => MG.batch(t.id, 1)[0]);
  ask();
}
function ask() {
  const q = P.qs[P.k], total = Math.ceil(Math.log2(13));
  WR.view(`<div class="lesson-bg" style="background-image:${WR.bgCss("bg_math")}"></div>
    <div class="row" style="margin:6px 0 8px"><button class="btn ghost small" id="quitP">← Back</button><b class="title">🔮 Sumi's grade finder</b></div>
    <div class="card hud"><span class="pill">Round ${P.round} of about ${total}</span><span class="qnum">${P.k + 1}/3</span><span class="muted" style="font-weight:800">Testing Grade ${P.g} maths</span></div>
    <div class="lesson fade-in"><div class="card qcard mq">${q.pic ? `<div class="qpic mpicbox">${q.pic}</div>` : ""}<div class="qtext mqtext">${MW.html(q.q)}</div>
      ${q.kind === "mcq" ? `<div class="opts mopts">${q.options.map((o, k) => `<button class="opt" data-k="${k}"><span class="k">${"ABCD"[k]}</span>${MW.html(o)}</button>`).join("")}</div>` : ansPad(q)}
      <div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn ghost small" id="unsure">🤔 I'm not sure</button></div></div>
      <div class="card side">${mascot("side-sumi")}<div class="bubble">${P.round === 1 && P.k === 0 ? "Just do your best — skip anything you haven't learned yet! 💫" : "Take your time ✨"}</div></div></div>`);
  WR.$("#quitP").onclick = () => { P = null; WR.go("math"); };
  const go = ok => { if (!P) return; P.asked++; if (ok) P.ok++; P.log.push({ g: P.g, ok }); P.k++; if (P.k < 3) return ask(); if (P.ok >= 2) { P.passed = Math.max(P.passed, P.g); P.lo = P.g + 1; } else P.hi = P.g - 1; nextRound(); };
  WR.$("#unsure").onclick = () => go(false);
  if (q.kind === "mcq") document.querySelectorAll("#main .mopts .opt[data-k]").forEach(b => b.onclick = () => go(q.options[+b.dataset.k] === q.a));
  else { const sub = () => { const r = MG.check(q, WR.$("#mans").value); if (r.empty) return WR.toast("Type an answer, or tap “I'm not sure” 💭"); if (r.bad) return WR.toast("Hmm, I couldn't read that. Try a number like 12 or 3/4", 2200); go(r.ok); }; bindPad2(sub); }
}
function ansPad(q) { // same pad as the lessons
  return `<div class="ansrow"><input id="mans" class="input mans" autocomplete="off" ${coarse() ? 'inputmode="none"' : 'inputmode="decimal"'} placeholder="Your answer"><button class="btn mint" id="mcheck">✓ Check</button></div>${MW.padGrid(MW.extraKeys(q, q.grade))}`;
}
function bindPad2(sub) {
  const inp = WR.$("#mans");
  document.querySelectorAll(".numpad [data-key]").forEach(b => b.onclick = e => { e.preventDefault(); const k = b.dataset.key; if (k === "back") inp.value = inp.value.slice(0, -1); else inp.value += k === "r" ? " r " : k === "," ? ", " : k; if (!coarse()) inp.focus(); });
  inp.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); sub(); } };
  WR.$("#mcheck").onclick = sub; if (!coarse()) setTimeout(() => inp.focus({ preventScroll: true }), 30);
}
function placeDone() {
  const m = MW.st(), g = Math.min(12, Math.max(1, P.passed + (P.passed === 12 ? 0 : 1))), first = !m.placed, gi = MG.GRADES.find(x => x.g === g);
  m.placed = { grade: g, passed: P.passed, at: Date.now(), asked: P.asked }; m.grade = g;
  if (first) WR.state.stars += 5; WR.save(); WR.renderTop(); P = null;
  WR.view(`<div class="card result fade-in">${mascot("res-sumi")}<h1>Sumi says: start at Grade ${g}! 🔮</h1><h2>${gi.emoji} ${gi.name} <small class="muted">(${gi.sg})</small></h2>
    <p class="muted" style="font-weight:800">${m.placed.passed ? `You already know your Grade ${m.placed.passed} maths — brilliant!` : "We'll start from the very first steps together."} Every grade stays open, so you can practise anything.${first ? " · +5 ⭐ for finding your grade" : ""}</p>
    <div class="row" style="justify-content:center;margin-top:16px"><button class="btn mint" id="pGo">Go to ${gi.label} →</button></div></div>`);
  WR.confetti(18);
  WR.$("#pGo").onclick = () => WR.go("math", g);
}
// test hooks (used by tools/test/math.js)
MW._dojoQ = () => D && D.queue[D.i];
MW._dojoEnd = () => { if (D && D.mode === "sprint") D.endAt = Date.now(); };
MW._placeQ = () => P && P.qs && P.qs[P.k];
})();
