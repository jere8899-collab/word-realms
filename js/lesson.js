/* Lesson engine: shared question flow + realm-specific game modes (picture, candy, forest, boss, council, dragon). */
(function () {
const WR = window.WR;
const CHEER = ["Yay! ✨", "You're amazing! 💖", "Sparkly smart! 🌟", "Woohoo! 🎉", "Brilliant! 🌸", "Magic! 🪄"];
const COMFORT = ["It's okay, we learn together 🫶", "Oopsie! Next one! 🍀", "Don't worry, read the tip 💭", "Almost! You've got this 💪"];
const MODE_TIME = { mcq: 25, order: 40, listen: 35, reading: 50 };
const BOSS = { b2: { name: "Glimmerfin", face: "🐍", hp: 100 }, c2: { name: "Archivus the Library Dragon", face: "🐲", hp: 100 } };

function normalize(item, passage) {
  if (item.type === "order") return { type: "order", q: item.q, answer: item.answer, explain: item.explain };
  const correct = item.options[item.answer];
  return { type: item.type === "listen" ? "listen" : "mcq", q: item.q, say: item.say, pic: item.pic, passage,
    options: WR.shuffle(item.options), correct, explain: item.explain };
}
WR.buildItems = async (rid, skill, n = 8) => {
  const bank = await WR.bank(rid, skill);
  if (skill === "reading") {
    const ps = WR.sample(bank.passages, 2);
    return ps.flatMap(p => p.questions.map(q => normalize(q, p)));
  }
  return WR.sample(bank, n).map(q => normalize(q));
};
WR.normalize = normalize;

let L = null; // current lesson state
let timerId = null;
function clearTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

WR.startLesson = async (opts) => {
  clearTimer(); WR.Speech && Speech.stop();
  const realm = WR.realms.find(r => r.id === opts.realm);
  const items = opts.items || await WR.buildItems(opts.realm, opts.skill);
  L = { ...opts, realm, items, mode: opts.mode || realm.mode, i: 0, correct: 0, combo: 0, maxCombo: 0, starsEarned: 0,
        hearts: 3, bossHP: 100, meter: 50, lit: 0, jar: [], answered: false };
  WR.navActive && WR.navActive("map");
  render();
};

function hud() {
  const n = L.items.length, i = L.i;
  const base = `<span class="pill">${L.realm.level} · ${WR.esc(L.title || L.realm.modeName)}</span><span class="qnum">${Math.min(i + 1, n)}/${n}</span>`;
  switch (L.mode) {
    case "picture": return `${base}<div class="blooms">${Array.from({ length: n }, (_, k) => k < L.lit ? "🌸" : "🌱").join("")}</div>`;
    case "candy": return `${base}<div class="jar" title="Candy jar">🫙 ${L.jar.join("") || '<span class="muted">Fill the jar with correct answers!</span>'}</div>`;
    case "forest": return `${base}<div class="path">${Array.from({ length: n }, (_, k) => `<span class="st ${k < L.lit ? "lit" : ""}">${k < L.lit ? "🏮" : "·"}</span>`).join("")}<span>🧚</span></div>`;
    case "boss": case "dragon": {
      const b = BOSS[L.realm.id] || BOSS.b2;
      const lives = L.mode === "dragon" ? "🕯️".repeat(L.hearts) + "<span style='opacity:.3'>" + "🕯️".repeat(3 - L.hearts) + "</span>" : "💖".repeat(L.hearts) + "🤍".repeat(3 - L.hearts);
      return `${base}<div class="meter boss"><span class="face" id="bossFace">${b.face}</span><div style="flex:1"><b>${b.name}</b><div class="hp"><i style="width:${L.bossHP}%"></i></div>${L.mode === "boss" ? '<div class="timer"><i id="timerBar"></i></div>' : ""}</div></div><span class="hearts">${lives}</span>`;
    }
    case "council": return `${base}<div class="meter"><b>Council vote</b><div class="meterbar"><span class="knob" style="left:${L.meter}%">⚖️</span></div><div class="row muted" style="justify-content:space-between;font-size:.75rem"><span>Against</span><span>For you</span></div></div>`;
  }
  return base;
}
function flavour(it) {
  if (L.mode === "dragon") return `<div class="dragon-scroll">🐲 “Answer my riddle, little scholar…”</div>`;
  if (L.mode === "council") return `<div class="muted" style="font-weight:800">🏰 The Council awaits your reasoning…</div>`;
  if (L.mode === "boss") return `<div class="muted" style="font-weight:800">⚔️ Answer fast to strike Glimmerfin!</div>`;
  return "";
}
function qBody(it) {
  let h = flavour(it);
  if (it.passage) h += `<div class="passage"><h3>📜 ${WR.esc(it.passage.title)}</h3>${WR.esc(it.passage.text)}</div>`;
  if (it.type === "listen") {
    h += `<div class="listenbox"><button class="playbtn" id="playBtn" aria-label="Play audio">🔊</button>
      <div><button class="btn ghost small" id="slowBtn">🐢 Slow</button>
      <div class="row muted" style="margin-top:6px;font-size:.85rem">Speed <input type="range" class="slider" id="rate" min="0.5" max="1.3" step="0.1" value="${WR.state.settings.rate}"><span id="rateVal">${WR.state.settings.rate}×</span></div>
      <div class="muted" style="font-size:.75rem">Voice: ${WR.esc(Speech.voiceName())}${Speech.supported ? "" : " — your browser can't speak; the transcript will show instead."}</div></div></div>`;
    if (!Speech.supported) h += `<div class="transcript">“${WR.esc(it.say)}”</div>`;
  }
  if (it.pic) h += `<div class="qpic">${it.pic}</div>`;
  h += `<div class="qtext">${WR.esc(it.q)}</div>`;
  if (it.type === "order") {
    const words = it.answer.split(" ");
    let sh = WR.shuffle(words); let guard = 0; while (sh.join(" ") === it.answer && guard++ < 10) sh = WR.shuffle(words);
    it._pool = sh.map((w, k) => ({ w, k })); it._built = [];
    h += `<div class="tiles answer" id="built"></div><div class="tiles" id="pool"></div>
      <div class="row" style="margin-top:8px"><button class="btn mint" id="checkBtn" disabled>🍭 Check sentence</button><button class="btn ghost small" id="clearBtn">↺ Clear</button></div>`;
  } else {
    h += `<div class="opts">${it.options.map((o, k) => `<button class="opt" data-k="${k}"><span class="k">${"ABCD"[k]}</span>${WR.esc(o)}</button>`).join("")}</div>`;
  }
  h += `<div id="explain"></div>`;
  return h;
}
function render() {
  const it = L.items[L.i]; L.answered = false;
  const bgA = WR.asset(L.realm.bg);
  WR.view(`<div class="lesson-bg" style="background-image:${bgA ? WR.bgCss(bgA.id) : "none"}"></div>
    <div class="row" style="margin:6px 0 8px"><button class="btn ghost small" id="quitBtn">← Leave</button><b class="title">${L.realm.emoji} ${WR.esc(L.title || "")}</b></div>
    <div class="card hud">${hud()}</div>
    <div class="lesson fade-in"><div class="card qcard">${qBody(it)}</div>
      <div class="card side"><div class="petbox" id="lpet">${WR.petHTML()}</div><div class="bubble" id="lbubble">${WR.esc(L.i === 0 ? "Let's do this together! ✨" : WR.petMood())}</div>
      <div class="muted" id="lstats" style="font-size:.85rem;font-weight:800">⭐ ${L.starsEarned} earned · 🔥 combo ${L.combo}</div></div></div>`);
  WR.$("#quitBtn").onclick = () => { clearTimer(); Speech.stop(); L.onQuit ? L.onQuit() : L.review ? WR.go("review") : WR.go("realm", L.realm.id); };
  if (it.type === "order") bindOrder(it);
  else document.querySelectorAll(".opt").forEach(b => b.onclick = () => pick(b, it));
  if (it.type === "listen") bindListen(it);
  if (L.mode === "boss") startTimer(it);
}
function bindListen(it) {
  const play = (rate) => { const b = WR.$("#playBtn"); b && b.classList.add("playing"); Speech.speak(it.say, rate || WR.state.settings.rate, () => { const bb = WR.$("#playBtn"); bb && bb.classList.remove("playing"); }); };
  WR.$("#playBtn").onclick = () => play();
  WR.$("#slowBtn").onclick = () => play(0.6);
  WR.$("#rate").oninput = e => { WR.state.settings.rate = +e.target.value; WR.$("#rateVal").textContent = e.target.value + "×"; WR.save(); };
  setTimeout(() => play(), 350);
}
function bindOrder(it) {
  const draw = () => {
    WR.$("#pool").innerHTML = it._pool.map(t => `<button class="tile" data-k="${t.k}">${WR.esc(t.w)}</button>`).join("");
    WR.$("#built").innerHTML = it._built.map(t => `<button class="tile" data-k="${t.k}">${WR.esc(t.w)}</button>`).join("") || '<span class="muted">Tap the candy words in order…</span>';
    WR.$("#checkBtn").disabled = it._pool.length > 0 || L.answered;
    WR.$("#pool").querySelectorAll(".tile").forEach(b => b.onclick = () => { if (L.answered) return; const k = +b.dataset.k; const i = it._pool.findIndex(t => t.k === k); it._built.push(it._pool.splice(i, 1)[0]); WR.sfx("tap"); draw(); });
    WR.$("#built").querySelectorAll(".tile").forEach(b => b.onclick = () => { if (L.answered) return; const k = +b.dataset.k; const i = it._built.findIndex(t => t.k === k); it._pool.push(it._built.splice(i, 1)[0]); draw(); });
  };
  draw();
  WR.$("#clearBtn").onclick = () => { if (L.answered) return; it._pool = it._pool.concat(it._built); it._built = []; draw(); };
  WR.$("#checkBtn").onclick = () => {
    const ok = it._built.map(t => t.w).join(" ") === it.answer;
    WR.$("#checkBtn").disabled = true; answer(ok, it, ok ? "" : `Correct order: <b>${WR.esc(it.answer)}</b>`);
  };
}
function startTimer(it) {
  clearTimer();
  const total = MODE_TIME[it.passage ? "reading" : it.type] || 25; let left = total;
  timerId = setInterval(() => {
    left -= 0.25; const bar = WR.$("#timerBar");
    if (bar) bar.style.width = Math.max(0, left / total * 100) + "%";
    if (left <= 0) { clearTimer(); if (!L.answered) { document.querySelectorAll(".opt").forEach(b => { if (it.options[+b.dataset.k] === it.correct) b.classList.add("right"); b.disabled = true; }); answer(false, it, "⏰ Time's up!"); } }
  }, 250);
}
function pick(btn, it) {
  if (L.answered) return;
  const chosen = it.options[+btn.dataset.k], ok = chosen === it.correct;
  document.querySelectorAll(".opt").forEach(b => { b.disabled = true; if (it.options[+b.dataset.k] === it.correct) b.classList.add("right"); });
  if (!ok) btn.classList.add("wrong");
  answer(ok, it);
}
function petReact(ok) {
  const box = WR.$("#lpet"), bub = WR.$("#lbubble"); if (!box) return;
  box.classList.remove("bounce", "cheer", "sad"); void box.offsetWidth;
  box.classList.add(ok ? (L.combo >= 3 ? "cheer" : "bounce") : "sad");
  bub.textContent = ok ? (L.combo >= 3 ? `${L.combo} in a row! You're on fire! 🔥` : CHEER[Math.floor(Math.random() * CHEER.length)]) : COMFORT[Math.floor(Math.random() * COMFORT.length)];
}
function answer(ok, it, extra = "") {
  L.answered = true; clearTimer();
  const s = WR.state; s.totalAnswered++;
  if (ok) {
    L.correct++; L.combo++; L.maxCombo = Math.max(L.maxCombo, L.combo); s.totalCorrect++;
    let gain = 1; if (L.combo % 3 === 0) gain++; L.starsEarned += gain; s.stars += gain;
    WR.questEvent("correct10"); if (L.combo === 5) WR.questEvent("combo5");
    L.lit++; L.jar.push(["🍬", "🍭", "🧁", "🍩", "🍫", "🍡"][L.jar.length % 6]);
    L.bossHP = Math.max(0, L.bossHP - Math.ceil(100 / L.items.length) - (L.combo >= 3 ? 4 : 0));
    L.meter = Math.min(100, L.meter + 8); WR.sfx("good");
  } else {
    L.combo = 0; L.hearts = Math.max(0, L.hearts - ((L.mode === "boss" || L.mode === "dragon") ? 1 : 0));
    L.meter = Math.max(0, L.meter - 8); WR.sfx("bad");
    if (!L.review) WR.Garden ? WR.Garden.plant(it, L.realm.id, L.skill) : s.mistakes.unshift({ realm: L.realm.id, q: it.q, said: it.say || null, correct: it.correct || it.answer, explain: it.explain, at: Date.now() });
  }
  if (L.review && it._mid && WR.Garden) { const g = WR.Garden.grade(it._mid, ok); if (g) L.bloomed = (L.bloomed || 0) + (g.bloomed ? 1 : 0); }
  WR.save(); WR.renderTop();
  const hudEl = document.querySelector(".hud"); if (hudEl) hudEl.innerHTML = hud();
  if (ok && WR.$("#bossFace")) WR.$("#bossFace").classList.add("hit");
  petReact(ok);
  const ls = WR.$("#lstats"); if (ls) ls.textContent = `⭐ ${L.starsEarned} earned · 🔥 combo ${L.combo}`;
  const transcript = it.type === "listen" ? `<div class="transcript">🎧 “${WR.esc(it.say)}” <button class="btn ghost small" id="replay">🔁 Replay</button></div>` : "";
  const lost = (L.mode === "boss" || L.mode === "dragon") && L.hearts === 0;
  const last = L.i >= L.items.length - 1 || lost || ((L.mode === "boss" || L.mode === "dragon") && L.bossHP <= 0);
  WR.$("#explain").innerHTML = `<div class="explain ${ok ? "good" : "bad"}">${ok ? "✅ Correct!" : "💭 Not quite."} ${extra} <div style="font-weight:700;margin-top:4px">💡 ${WR.esc(it.explain)}</div>${transcript}</div>
    <div class="row" style="margin-top:12px;justify-content:flex-end"><button class="btn ${ok ? "mint" : ""}" id="nextBtn">${last ? "See results ✨" : "Next →"}</button></div>`;
  const rp = WR.$("#replay"); if (rp) rp.onclick = () => Speech.speak(it.say, WR.state.settings.rate);
  WR.$("#nextBtn").onclick = () => { Speech.stop(); if (last) finish(lost); else { L.i++; render(); } };
  WR.$("#nextBtn").scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function finish(lost) {
  clearTimer();
  const n = L.items.length, score = L.correct / n, crowns = WR.crowns(score);
  const bonus = crowns * 2 + (L.mode === "boss" && L.bossHP <= 0 ? 5 : 0);
  if (bonus) { WR.state.stars += bonus; L.starsEarned += bonus; }
  if (L.key) WR.recordLesson(L.realm.id, L.key, score);
  WR.questEvent("lesson2");
  if (L.skill === "listening") WR.questEvent("listen1");
  if (L.skill === "reading") WR.questEvent("read1");
  if (L.special) WR.questEvent("special1");
  if (L.review) { WR.questEvent("review1"); if (L.bloomed) { WR.state.stars += L.bloomed * 2; L.starsEarned += L.bloomed * 2; } }
  if (crowns === 3) WR.questEvent("perfect1");
  const newStreak = WR.bumpStreak();
  const lv = WR.petGainXP(L.correct * 6 + 10);
  WR.save(); WR.renderTop();
  const title = lost ? (L.mode === "dragon" ? "The candles went out… 🕯️" : "Glimmerfin escaped! 🌊") :
    (L.mode === "boss" && L.bossHP <= 0) ? "Boss defeated! ⚔️✨" : crowns === 3 ? "Perfect! 👑" : crowns >= 1 ? "Well done! 🌟" : "Keep practising! 🌱";
  WR.view(`<div class="card result fade-in"><h1>${title}</h1>
    <div class="big">${"👑".repeat(crowns)}${"<span style='opacity:.2'>👑</span>".repeat(3 - crowns)}</div>
    <h2>${L.correct} / ${n} correct</h2>
    <p class="muted" style="font-weight:800">⭐ ${L.starsEarned} stars earned · best combo ${L.maxCombo} ${newStreak ? `· 🔥 streak ${WR.state.streak.count} day${WR.state.streak.count > 1 ? "s" : ""}!` : ""}</p>
    <div class="petbox bounce" style="margin:10px auto">${WR.petHTML()}</div>
    <div class="bubble">${lv ? (lv.evolved ? `I evolved into ${WR.petInfo().stages[WR.petStage(lv.level)]}! 🌟` : `I reached level ${lv.level}! 🎉`) : crowns >= 2 ? "That was so fun! 💖" : "Let's try again together! 🫶"}</div>
    ${L.review ? `<p class="muted" style="font-weight:800">🌸 ${L.bloomed || 0} flower${L.bloomed === 1 ? "" : "s"} fully bloomed${L.bloomed ? ` (+${L.bloomed * 2}⭐)` : ""} · ${WR.Garden.dueCount()} still thirsty</p>` : ""}
    ${score < 0.6 && L.key ? `<p class="muted">Score 60% or more to count this skill towards unlocking the next realm.</p>` : ""}
    <div class="row" style="justify-content:center;margin-top:16px"><button class="btn" id="again">↻ Play again</button><button class="btn mint" id="back">${L.review ? "Back to the garden 🌷" : "Back to " + WR.esc(L.realm.name)}</button></div></div>`);
  if (crowns >= 2 || lv) WR.confetti(); WR.sfx(lv ? "level" : "good");
  const opts = L;
  WR.$("#again").onclick = () => opts.replay ? opts.replay() : WR.startLesson({ realm: opts.realm.id, skill: opts.skill, key: opts.key, title: opts.title });
  WR.$("#back").onclick = () => opts.review ? WR.go("review") : WR.go("realm", opts.realm.id);
  if (lv && lv.evolved) setTimeout(() => WR.modal(`<h2>✨ Evolution! ✨</h2><div class="petbox cheer" style="width:180px;height:180px;margin:auto">${WR.petHTML()}</div><p><b>${WR.esc(WR.state.pet.name)}</b> became <b>${WR.petInfo().stages[WR.petStage(lv.level)]}</b>!</p><button class="btn" onclick="this.closest('.modal-bg').remove()">Hooray!</button>`), 600);
}
WR.stopLesson = () => { clearTimer(); L = null; };
WR._dbg = () => L && (L.items[L.i].correct || L.items[L.i].answer); // test hook (used by the headless test)
})();
