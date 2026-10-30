/* Lesson engine: shared question flow + realm-specific game modes (picture, candy, forest, boss, council, dragon). */
(function () {
const WR = window.WR;
const CHEER = ["Yay! ✨", "You're amazing! 💖", "Sparkly smart! 🌟", "Woohoo! 🎉", "Brilliant! 🌸", "Magic! 🪄"];
const COMFORT = ["It's okay, we learn together 🫶", "Oopsie! Next one! 🍀", "Don't worry, read the tip 💭", "Almost! You've got this 💪"];
const MODE_TIME = { mcq: 25, order: 40, listen: 35, reading: 50, picq: 25, spell: 45, mistake: 35, gaps: 55, dictate: 60 };
const BOSS = { b2: { name: "Glimmerfin", face: "🐍", art: "boss_glimmerfin", hp: 100 }, c2: { name: "Archivus the Library Dragon", face: "🐲", art: "boss_archivus", hp: 100 } };
const curBoss = () => L.boss || BOSS[L.realm.id] || BOSS.b2;                 // 🏆 C6: realm bosses pass their own { name, face, art }
const bossBeaten = () => L.mode === "boss" && L.bossHP <= 0;

/* 🧩 C2 question types: spell (letter tiles), picq (picture choice), mistake (tap the wrong word), gaps (word bank),
   dictate (listen + type), order with "say" (listen and build), listen with dialogue:true (two voices). */
const NEWTYPES = new Set(["spell", "mistake", "gaps", "dictate"]);
const fillGaps = (text, words) => { let i = 0; return text.replace(/___/g, () => words[i++] || "___"); };
function normalize(item, passage) {
  if (item.type === "order") return { type: "order", q: item.q, answer: item.answer, explain: item.explain, say: item.say, _raw: item.say ? item : undefined };
  if (NEWTYPES.has(item.type)) return { ...item, passage, _raw: item,
    correct: item.type === "mistake" ? `${item.words[item.wrong]} → ${item.fix}` : item.type === "gaps" ? fillGaps(item.text, item.answers) : item.answer };
  const correct = item.options[item.answer];
  return { type: item.type === "listen" ? "listen" : item.type === "picq" ? "picq" : "mcq", q: item.q, say: item.say, pic: item.pic, passage, dialogue: item.dialogue,
    options: WR.shuffle(item.options), correct, explain: item.explain, notes: item.notes };
}
// the headless tests drive the classic multiple-choice flow; the new types have their own test (tools/test/c2types.js)
const classicOnly = () => navigator.webdriver && !window.__WR_ALL_TYPES;
const playable = q => (q.type !== "dictate" || (window.Speech && Speech.supported)) &&
  (!classicOnly() || q.type === "mcq" || (q.type === "listen" && !q.dialogue) || (q.type === "order" && !q.say));
WR.sayHTML = say => String(say || "").split("|").map(l => { const m = l.match(/^([^:]{1,20}):\s*(.*)$/); return m ? `<span class="say-line"><b>${WR.esc(m[1])}:</b> ${WR.esc(m[2])}</span>` : WR.esc(l); }).join(" ");
/* Fresh-first picking: remember which items a learner has recently seen (per realm + skill) and serve unseen
   ones first, so the whole bank rotates before anything repeats. state.seen = { "<rid>/<skill>": [itemKey, ...] }. */
WR.itemKey = it => { const t = (it.title || "") + "|" + (it.say || "") + "|" + (it.q || "") + "|" + (it.pic || "") + "|" + (it.options ? it.options[it.answer] : it.answer || "") +
    (it.words ? "|" + it.words.join(" ") : "") + (it.text ? "|" + it.text : "") + (it.art ? "|" + it.art : "");
  let h = 5381; for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
WR.freshPick = (bucket, pool, n) => {
  const s = WR.state; s.seen = s.seen || {};
  const keys = new Set(pool.map(WR.itemKey));
  let seen = (s.seen[bucket] || []).filter(k => keys.has(k));          // drop keys of items that no longer exist
  const seenSet = new Set(seen);
  const fresh = WR.shuffle(pool.filter(it => !seenSet.has(WR.itemKey(it))));
  const order = new Map(seen.map((k, i) => [k, i]));
  const old = pool.filter(it => seenSet.has(WR.itemKey(it))).sort((a, b) => order.get(WR.itemKey(a)) - order.get(WR.itemKey(b))); // oldest first
  const pick = fresh.concat(old).slice(0, Math.min(n, pool.length));
  const picked = pick.map(WR.itemKey);
  seen = seen.filter(k => !picked.includes(k)).concat(picked);
  if (pool.length - seen.length < n) seen = seen.slice(Math.max(0, seen.length - Math.max(0, pool.length - n))); // keep a full lesson of unseen items available
  s.seen[bucket] = seen; WR.save();
  return WR.shuffle(pick);
};
WR.buildItems = async (rid, skill, n = 8) => {
  const bank = await WR.bank(rid, skill);
  if (skill === "reading") {
    const ps = WR.freshPick(`${rid}/reading`, bank.passages, 2);
    if (n < 6) return ps.slice(0, 1).flatMap(p => p.questions.map(q => normalize(q, p))).slice(0, n);
    return ps.flatMap(p => p.questions.map(q => normalize(q, p)));
  }
  return WR.freshPick(`${rid}/${skill}`, bank.filter(playable), n).map(q => normalize(q));
};
WR.normalize = normalize;

let L = null; // current lesson state
let heardOnce = false; // has speech played to the end once this session? (then later listening questions auto-play)
const phone = () => (window.innerWidth || 1024) <= 520;
let timerId = null;
function clearTimer() { if (timerId) { clearInterval(timerId); timerId = null; } if (L && L._io) { L._io.disconnect(); L._io = null; } }

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
      const b = curBoss();
      const lives = L.mode === "dragon" ? "🕯️".repeat(L.hearts) + "<span style='opacity:.3'>" + "🕯️".repeat(3 - L.hearts) + "</span>" : "💖".repeat(L.hearts) + "🤍".repeat(3 - L.hearts);
      return `${base}<div class="meter boss"><span class="face${WR.asset(b.art) ? " painted" : ""}" id="bossFace">${WR.asset(b.art) ? WR.img(b.art, "bossimg") : b.face}</span><div style="flex:1"><b>${b.name}</b><div class="hp"><i style="width:${L.bossHP}%"></i></div>${L.mode === "boss" && !L.noTimer ? '<div class="timer"><i id="timerBar"></i></div>' : ""}</div></div><span class="hearts">${lives}</span>`;
    }
    case "council": return `${base}<div class="meter"><b>Council vote</b><div class="meterbar"><span class="knob" style="left:${L.meter}%">⚖️</span></div><div class="row muted" style="justify-content:space-between;font-size:.75rem"><span>Against</span><span>For you</span></div></div>`;
  }
  return base;
}
function flavour(it) {
  if (L.mode === "dragon") return `<div class="dragon-scroll">🐲 “Answer my riddle, little scholar…”</div>`;
  if (L.mode === "council") return `<div class="muted" style="font-weight:800">🏰 The Council awaits your reasoning…</div>`;
  if (L.mode === "boss") return `<div class="muted" style="font-weight:800">⚔️ ${L.noTimer ? "Answer right to strike" : "Answer fast to strike"} ${WR.esc(curBoss().name)}!</div>`;
  return "";
}
function qBody(it) {
  let h = flavour(it);
  // 📜 T9: on phones the story shows in full on its first question; on the next questions of the same story a sticky
  // "📜 Story" chip opens it in a bottom sheet, so the question and answers stay together on screen
  if (it.passage) {
    const prev = L.items[L.i - 1], again = prev && prev.passage === it.passage;
    h += again && phone() ? `<button class="story-chip" id="storyChip">📜 Story: ${WR.esc(it.passage.title)}</button>`
      : `<div class="passage"><h3>📜 ${WR.esc(it.passage.title)}</h3>${WR.esc(it.passage.text)}</div>`;
  }
  if (it.say && (it.type === "listen" || it.type === "order" || it.type === "dictate")) {
    // 🔊 T11: the first listening question waits for a tap (iPhones block speech that doesn't start from a tap)
    const tap = !heardOnce && Speech.supported;
    h += `<div class="listenbox">${tap ? `<button class="tap-listen" id="playBtn" aria-label="Tap to listen"><span class="playbtn">🔊</span>Tap to listen</button>` : `<button class="playbtn" id="playBtn" aria-label="Play audio">🔊</button>`}
      <div><button class="btn ghost small" id="slowBtn">🐢 Slow</button>
      <div class="row muted" style="margin-top:2px;font-size:.85rem">Speed <input type="range" class="slider" id="rate" min="0.5" max="1.3" step="0.1" value="${WR.state.settings.rate}" aria-label="Listening speed"><span id="rateVal">${WR.state.settings.rate}×</span></div>
      ${Speech.supported ? "" : `<div class="muted" style="font-size:.75rem">Read the words below 👇</div>`}</div></div>`;
    if (!Speech.supported) h += `<div class="transcript">“${WR.sayHTML(it.say)}”</div>`;
  }
  if (it.pic) h += `<div class="qpic">${it.pic}</div>`;
  if (it.art) h += `<div class="qpic qart">${WR.img(it.art).replace(/alt="[^"]*"/, 'alt="Picture: spell this word"')}</div>`;
  h += `<div class="qtext">${WR.esc(it.q)}</div>`;
  if (it.type === "order") {
    const words = it.answer.split(" ");
    let sh = WR.shuffle(words); let guard = 0; while (sh.join(" ") === it.answer && guard++ < 10) sh = WR.shuffle(words);
    it._pool = sh.map((w, k) => ({ w, k })); it._built = [];
    h += `<div class="tiles answer" id="built"></div><div class="tiles" id="pool"></div>
      <div class="row" style="margin-top:8px"><button class="btn mint" id="checkBtn" disabled>🍭 Check sentence</button><button class="btn ghost small" id="clearBtn">↺ Clear</button></div>`;
  } else if (it.type === "spell") {
    const extra = WR.shuffle("abcdefghiklmnoprstuwy".split("").filter(c => !it.answer.includes(c))).slice(0, it.answer.length > 6 ? 3 : 2);
    it._pool = WR.shuffle(it.answer.split("").concat(extra)).map((w, k) => ({ w, k })); it._built = [];
    h += `<div class="spell-slots" id="built" aria-label="Your word"></div><div class="tiles letters" id="pool"></div>
      <div class="row" style="margin-top:8px"><button class="btn mint" id="checkBtn" disabled>✨ Check word</button><button class="btn ghost small" id="clearBtn">↺ Clear</button></div>`;
  } else if (it.type === "mistake") {
    h += `<div class="mwords">${it.words.map((w, k) => `<button class="mword" data-k="${k}">${WR.esc(w)}</button>`).join("")}</div>`;
  } else if (it.type === "gaps") {
    it._fill = it.answers.map(() => null); it._sel = 0; it._bank = WR.shuffle(it.bank.map((w, k) => ({ w, k })));
    const parts = it.text.split("___");
    h += `<div class="gaptext">${parts.map((p, i) => WR.esc(p) + (i < parts.length - 1 ? `<button class="gap" data-g="${i}" aria-label="Gap ${i + 1}">…</button>` : "")).join("")}</div>
      <div class="tiles" id="pool"></div>
      <div class="row" style="margin-top:8px"><button class="btn mint" id="checkBtn" disabled>✅ Check</button><button class="btn ghost small" id="clearBtn">↺ Clear</button></div>`;
  } else if (it.type === "dictate") {
    h += `<input class="dict-in" id="dictIn" type="text" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false" placeholder="Type what you hear…" aria-label="Type what you hear">
      <div class="row" style="margin-top:8px"><button class="btn mint" id="checkBtn" disabled>✅ Check</button></div>`;
  } else if (it.type === "picq") {
    h += `<div class="opts picgrid">${it.options.map((o, k) => `<button class="opt picopt" data-k="${k}" aria-label="${WR.esc(o)}">${WR.img("word_" + o)}</button>`).join("")}</div>`;
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
  else if (it.type === "spell") bindSpell(it);
  else if (it.type === "mistake") bindMistake(it);
  else if (it.type === "gaps") bindGaps(it);
  else if (it.type === "dictate") bindDictate(it);
  else document.querySelectorAll(".opt").forEach(b => b.onclick = () => pick(b, it));
  if (WR.$("#playBtn")) bindListen(it);
  const sc = WR.$("#storyChip"); if (sc) sc.onclick = () => storySheet(it.passage);
  if (L.mode === "boss" && !L.noTimer) armTimer(it);
}
// 📜 the story in a bottom sheet (phones, questions 2+ of a reading story)
function storySheet(p) {
  const bg = WR.modal(`<div class="grab"></div><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><b class="title">📜 ${WR.esc(p.title)}</b><button class="btn ghost small" id="sheetClose">Close ✕</button></div><div class="passage">${WR.esc(p.text)}</div>`, (bg, close) => { bg.querySelector("#sheetClose").onclick = close; });
  bg.classList.add("sheet-bg"); const m = bg.querySelector(".modal"); m.classList.add("story-sheet");
}
// ⏱️ T2/T11: the boss timer only starts once the question's options are on screen and, for listening, after the audio has
// played to the end once. Until then the bar is shown dimmed ("waiting").
function armTimer(it) {
  clearTimer(); const me = L, bar = document.querySelector(".timer"); if (bar) bar.classList.add("waiting");
  let seen = false, heard = it.type !== "listen" || !Speech.supported;
  const go = () => { if (L !== me || L.answered || timerId || !seen || !heard) return; if (bar) bar.classList.remove("waiting"); startTimer(it); };
  it._heard = () => { heard = true; go(); };
  const last = [...document.querySelectorAll(".opt,.mword,.gap")].pop() || WR.$("#checkBtn");
  if (!last || !("IntersectionObserver" in window)) { seen = true; return go(); }
  const io = new IntersectionObserver(es => { if (es.some(e => e.intersectionRatio >= 0.85 || e.isIntersecting && e.intersectionRect.height >= e.boundingClientRect.height - 2)) { seen = true; io.disconnect(); go(); } }, { threshold: [0, .5, .85, 1] });
  io.observe(last); me._io = io;
}
function bindListen(it) {
  const me = L;
  const ended = ok => { const bb = WR.$("#playBtn"); bb && bb.classList.remove("playing"); if (ok) heardOnce = true; it._heard && it._heard(); };
  const play = (rate) => {
    const b = WR.$("#playBtn"); if (b) { b.classList.add("playing"); if (b.classList.contains("tap-listen")) { b.outerHTML = `<button class="playbtn playing" id="playBtn" aria-label="Play audio">🔊</button>`; WR.$("#playBtn").onclick = () => play(); } }
    let done = false; const fin = ok => { if (done) return; done = true; if (L === me) ended(ok); };
    // some browsers never fire "end" (no voices): treat the clip as played after its rough length + 4 s
    setTimeout(() => fin(false), Math.min(20000, 4000 + String(it.say || "").length * 90 / (rate || WR.state.settings.rate || 1)));
    Speech.speak(it.say, rate || WR.state.settings.rate, () => fin(true));
  };
  WR.$("#playBtn").onclick = () => play();
  WR.$("#slowBtn").onclick = () => play(0.6);
  WR.$("#rate").oninput = e => { WR.state.settings.rate = +e.target.value; WR.$("#rateVal").textContent = e.target.value + "×"; WR.save(); };
  if (heardOnce) setTimeout(() => L === me && !L.answered && play(), 350);
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
function bindSpell(it) {
  const n = it.answer.length;
  const draw = () => {
    WR.$("#built").innerHTML = Array.from({ length: n }, (_, i) => it._built[i] ? `<button class="tile slot filled" data-k="${it._built[i].k}">${WR.esc(it._built[i].w)}</button>` : `<span class="slot"></span>`).join("");
    WR.$("#pool").innerHTML = it._pool.map(t => `<button class="tile" data-k="${t.k}">${WR.esc(t.w)}</button>`).join("");
    WR.$("#checkBtn").disabled = it._built.length !== n || L.answered;
    WR.$("#pool").querySelectorAll(".tile").forEach(b => b.onclick = () => { if (L.answered || it._built.length >= n) return; const i = it._pool.findIndex(t => t.k === +b.dataset.k); it._built.push(it._pool.splice(i, 1)[0]); WR.sfx("tap"); draw(); });
    WR.$("#built").querySelectorAll(".tile").forEach(b => b.onclick = () => { if (L.answered) return; const i = it._built.findIndex(t => t.k === +b.dataset.k); it._pool.push(it._built.splice(i, 1)[0]); draw(); });
  };
  draw();
  WR.$("#clearBtn").onclick = () => { if (L.answered) return; it._pool = it._pool.concat(it._built); it._built = []; draw(); };
  WR.$("#checkBtn").onclick = () => { const w = it._built.map(t => t.w).join(""), ok = w === it.answer;
    WR.$("#checkBtn").disabled = true; WR.$("#built").classList.add(ok ? "right" : "wrong");
    answer(ok, it, ok ? "" : `You spelled <s>${WR.esc(w)}</s>. The word is <b>${WR.esc(it.answer)}</b>.`); };
}
function bindMistake(it) {
  document.querySelectorAll(".mword").forEach(b => b.onclick = () => {
    if (L.answered) return; const k = +b.dataset.k, ok = k === it.wrong;
    document.querySelectorAll(".mword").forEach(x => { x.disabled = true; if (+x.dataset.k === it.wrong) x.classList.add("right"); });
    if (!ok) b.classList.add("wrong");
    answer(ok, it, `${ok ? "" : `<div class="why-not">🤔 <b>“${WR.esc(it.words[k])}”</b> is fine here. The mistake is “${WR.esc(it.words[it.wrong])}”.</div>`}Fix: <s>${WR.esc(it.words[it.wrong])}</s> → <b>${WR.esc(it.fix)}</b>`);
  });
}
function bindGaps(it) {
  const draw = () => {
    document.querySelectorAll(".gap").forEach(g => { const i = +g.dataset.g, f = it._fill[i]; g.textContent = f ? f.w : "…"; g.classList.toggle("filled", !!f); g.classList.toggle("sel", !f && i === it._sel); });
    const used = new Set(it._fill.filter(Boolean).map(f => f.k));
    WR.$("#pool").innerHTML = it._bank.filter(t => !used.has(t.k)).map(t => `<button class="tile" data-k="${t.k}">${WR.esc(t.w)}</button>`).join("");
    WR.$("#checkBtn").disabled = it._fill.some(f => !f) || L.answered;
    WR.$("#pool").querySelectorAll(".tile").forEach(b => b.onclick = () => { if (L.answered) return;
      let i = it._fill[it._sel] ? it._fill.findIndex(f => !f) : it._sel; if (i < 0) return;
      it._fill[i] = it._bank.find(t => t.k === +b.dataset.k); const nx = it._fill.findIndex(f => !f); it._sel = nx < 0 ? 0 : nx; WR.sfx("tap"); draw(); });
  };
  document.querySelectorAll(".gap").forEach(g => g.onclick = () => { if (L.answered) return; const i = +g.dataset.g; if (it._fill[i]) it._fill[i] = null; it._sel = i; draw(); });
  WR.$("#clearBtn").onclick = () => { if (L.answered) return; it._fill = it._fill.map(() => null); it._sel = 0; draw(); };
  WR.$("#checkBtn").onclick = () => {
    const got = it._fill.map(f => f.w), ok = got.every((w, i) => w === it.answers[i]);
    document.querySelectorAll(".gap").forEach(g => { const i = +g.dataset.g; g.classList.add(got[i] === it.answers[i] ? "right" : "wrong"); g.disabled = true; });
    WR.$("#checkBtn").disabled = true; WR.$("#pool").querySelectorAll(".tile").forEach(b => b.disabled = true);
    answer(ok, it, ok ? "" : `Answer: <b>${WR.esc(fillGaps(it.text, it.answers))}</b>`);
  };
  draw();
}
const normText = t => String(t).toLowerCase().replace(/[’‘`]/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
function bindDictate(it) {
  const inp = WR.$("#dictIn"), btn = WR.$("#checkBtn");
  inp.oninput = () => { btn.disabled = !inp.value.trim() || L.answered; };
  inp.onkeydown = e => { if (e.key === "Enter" && !btn.disabled) { e.preventDefault(); btn.click(); } };
  btn.onclick = () => {
    const got = normText(inp.value).split(" "), want = it.answer.split(/\s+/), ok = normText(inp.value) === normText(it.answer);
    inp.disabled = true; btn.disabled = true; inp.classList.add(ok ? "right" : "wrong");
    const marked = want.map((w, i) => `<span class="dw ${normText(w) === got[i] ? "ok" : "no"}">${WR.esc(w)}</span>`).join(" ");
    answer(ok, it, ok ? "" : `<div class="dict-check">${marked}</div><div class="muted" style="font-size:.85rem">Green words you got right; pink ones to practise.</div>`);
  };
}
function startTimer(it) {
  clearTimer();
  const total = MODE_TIME[it.passage ? "reading" : it.type] || 25; let left = total;
  timerId = setInterval(() => {
    left -= 0.25; const bar = WR.$("#timerBar");
    if (bar) bar.style.width = Math.max(0, left / total * 100) + "%";
    if (left <= 0) { clearTimer(); if (!L.answered) { document.querySelectorAll(".opt").forEach(b => { if (it.options[+b.dataset.k] === it.correct) b.classList.add("right"); b.disabled = true; });
      document.querySelectorAll(".mword,.gap,.tile,#checkBtn,#dictIn").forEach(b => b.disabled = true);
      answer(false, it, "⏰ Time's up!" + (it.options ? "" : ` Answer: <b>${WR.esc(it.type === "order" ? it.answer : it.correct)}</b>`)); } }
  }, 250);
}
function pick(btn, it) {
  if (L.answered) return;
  const chosen = it.options[+btn.dataset.k], ok = chosen === it.correct;
  document.querySelectorAll(".opt").forEach(b => { b.disabled = true; if (it.options[+b.dataset.k] === it.correct) b.classList.add("right"); });
  if (!ok) btn.classList.add("wrong");
  it._picked = chosen; answer(ok, it);
}
function petReact(ok) {
  const box = WR.$("#lpet"), bub = WR.$("#lbubble"); if (!box) return;
  box.classList.remove("bounce", "cheer", "sad"); void box.offsetWidth;
  box.classList.add(ok ? (L.combo >= 3 ? "cheer" : "bounce") : "sad");
  bub.textContent = ok ? (L.combo >= 3 ? `${L.combo} in a row! You're on fire! 🔥` : CHEER[Math.floor(Math.random() * CHEER.length)]) : COMFORT[Math.floor(Math.random() * COMFORT.length)];
}
/* C3: when a child picks a wrong option, say why THAT option is wrong before the rule + example. */
function whyNot(ok, it) {
  const n = !ok && it._picked && it.notes && it.notes[it._picked];
  return n ? `<div class="why-not">🤔 <b>Why not “${WR.esc(it._picked)}”?</b> ${WR.esc(n)}</div>` : "";
}
WR._whyNot = whyNot;
function answer(ok, it, extra = "") {
  L.answered = true; clearTimer();
  const s = WR.state; WR.countAnswer(ok, L.review ? "garden" : L.realm.id + "/" + (L.skill || "mixed"));
  if (ok) {
    L.correct++; L.combo++; L.maxCombo = Math.max(L.maxCombo, L.combo);
    let gain = 1; if (L.combo % 3 === 0) gain++; L.starsEarned += gain; s.stars += gain;
    WR.questEvent("correct10"); if (L.combo === 5) WR.questEvent("combo5");
    L.lit++; L.jar.push(["🍬", "🍭", "🧁", "🍩", "🍫", "🍡"][L.jar.length % 6]);
    L.bossHP = Math.max(0, L.bossHP - Math.ceil(100 / L.items.length) - (L.combo >= 3 ? 4 : 0));
    L.meter = Math.min(100, L.meter + 8); WR.sfx("good");
  } else {
    L.combo = 0; L.hearts = Math.max(0, L.hearts - ((L.mode === "boss" || L.mode === "dragon") ? 1 : 0));
    L.meter = Math.max(0, L.meter - 8); WR.sfx("bad");
    if (!L.review) WR.Garden.plant(it, L.realm.id, L.skill);
  }
  if (L.review && it._mid && WR.Garden) { const g = WR.Garden.grade(it._mid, ok); if (g) L.bloomed = (L.bloomed || 0) + (g.bloomed ? 1 : 0); }
  WR.save(); WR.renderTop();
  const hudEl = document.querySelector(".hud"); if (hudEl) hudEl.innerHTML = hud();
  if (ok && WR.$("#bossFace")) WR.$("#bossFace").classList.add("hit");
  petReact(ok);
  const ls = WR.$("#lstats"); if (ls) ls.textContent = `⭐ ${L.starsEarned} earned · 🔥 combo ${L.combo}`;
  const transcript = it.say ? `<div class="transcript">🎧 “${WR.sayHTML(it.say)}” <button class="btn ghost small" id="replay">🔁 Replay</button></div>` : "";
  const lost = (L.mode === "boss" || L.mode === "dragon") && L.hearts === 0;
  const last = L.i >= L.items.length - 1 || lost || ((L.mode === "boss" || L.mode === "dragon") && L.bossHP <= 0);
  WR.$("#explain").innerHTML = `<div class="explain ${ok ? "good" : "bad"}">${ok ? "✅ Correct!" : "💭 Not quite."} ${extra}${whyNot(ok, it)} <div class="why-rule" style="font-weight:700;margin-top:4px">💡 ${WR.esc(it.explain)}</div>${transcript}</div>
    <div class="row" style="margin-top:12px;justify-content:flex-end"><button class="btn ${ok ? "mint" : ""}" id="nextBtn">${last ? "See results ✨" : "Next →"}</button></div>`;
  const rp = WR.$("#replay"); if (rp) rp.onclick = () => Speech.speak(it.say, WR.state.settings.rate);
  WR.$("#nextBtn").onclick = () => { Speech.stop(); if (last) finish(lost); else { L.i++; render(); } };
  WR.$("#nextBtn").scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function finish(lost) {
  clearTimer();
  const beat = bossBeaten();
  const n = beat ? L.i + 1 : L.items.length, score = L.correct / n, crowns = WR.crowns(score);   // a boss beaten early is scored on the questions asked
  const bonus = crowns * 2 + (beat ? 5 : 0);
  if (bonus) { WR.state.stars += bonus; L.starsEarned += bonus; }
  if (L.key) WR.recordLesson(L.realm.id, L.key, score);
  if (L.skill === "listening") WR.questEvent("listen1");
  if (L.skill === "reading") WR.questEvent("read1");
  if (L.special) WR.questEvent("special1");
  if (L.review) { WR.questEvent("review1"); if (L.bloomed) { WR.state.stars += L.bloomed * 2; L.starsEarned += L.bloomed * 2; } }
  if (crowns === 3) WR.questEvent("perfect1");
  const newStreak = WR.activityDone();
  const lv = WR.petGainXP(L.correct * 6 + 10);
  WR.save(); WR.renderTop();
  const won = beat && !lost;
  const title = lost ? (L.mode === "dragon" ? "The candles went out… 🕯️" : `${WR.esc(curBoss().name)} escaped! ${L.boss ? "💨" : "🌊"}`) :
    beat ? "Boss defeated! ⚔️✨" : crowns === 3 ? "Perfect! 👑" : crowns >= 1 ? "Well done! 🌟" : "Keep practising! 🌱";
  // ➡️ T8: one clear next step (the next unplayed, else weakest, skill in this realm), with Play again / Back as secondaries
  const nx = L.review ? null : WR.nextSkill(L.realm.id, L.skill);
  const mainBtn = L.review ? `<button class="btn mint" id="nextStep">Back to the garden 🌷</button>`
    : nx ? `<button class="btn mint" id="nextStep">Next: ${nx.icon} ${WR.esc(nx.name)} →</button>` : `<button class="btn mint" id="nextStep">Back to ${WR.esc(L.realm.name)} →</button>`;
  WR.view(`<div class="card result fade-in"><h1>${title}</h1>
    <div class="big">${"👑".repeat(crowns)}${"<span style='opacity:.2'>👑</span>".repeat(3 - crowns)}</div>
    <h2>${L.correct} / ${n} correct</h2>
    <p class="muted" style="font-weight:800">⭐ ${L.starsEarned} stars earned · best combo ${L.maxCombo} ${newStreak ? `· 🔥 streak ${WR.state.streak.count} day${WR.state.streak.count > 1 ? "s" : ""}!` : ""}</p>
    <div class="next-row">${mainBtn}<div class="sec"><button class="btn ghost small" id="again">↻ Play again</button>${L.review || !nx ? "" : `<button class="btn ghost small" id="back">← ${WR.esc(L.realm.name)}</button>`}</div></div>
    <div class="petbox bounce" style="margin:10px auto">${WR.petHTML()}</div>
    <div class="bubble">${lv ? (lv.evolved ? `I evolved into ${WR.petInfo().stages[WR.petStage(lv.level)]}! 🌟` : `I reached level ${lv.level}! 🎉`) : crowns >= 2 ? "That was so fun! 💖" : "Let's try again together! 🫶"}</div>
    ${L.review ? `<p class="muted" style="font-weight:800">🌸 ${L.bloomed || 0} flower${L.bloomed === 1 ? "" : "s"} fully bloomed${L.bloomed ? ` (+${L.bloomed * 2}⭐)` : ""} · ${WR.Garden.dueCount()} still thirsty</p>` : ""}
    ${score < 0.6 && L.key ? `<p class="muted">Score 60% or more to count this skill towards unlocking the next realm.</p>` : ""}</div>`);
  if (crowns >= 2 || lv) WR.confetti(); WR.sfx(lv ? "level" : "good");
  const opts = L;
  if (opts.onFinish) opts.onFinish({ won, lost: !!lost, score, crowns });   // 🏆 C6 hook (realm bosses, stickers)
  if (opts.nextLabel) WR.$("#nextStep").textContent = opts.nextLabel;
  WR.$("#again").onclick = () => opts.replay ? opts.replay() : WR.startLesson({ realm: opts.realm.id, skill: opts.skill, key: opts.key, title: opts.title });
  const bk = WR.$("#back"); if (bk) bk.onclick = () => WR.go("realm", opts.realm.id);
  WR.$("#nextStep").onclick = () => opts.onNext ? opts.onNext() : opts.review ? WR.go("review") : nx ? WR.startLesson({ realm: opts.realm.id, skill: nx.id, key: nx.id, title: `${nx.name} · ${opts.realm.modeName}` }) : WR.go("realm", opts.realm.id);
  if (lv && lv.evolved) setTimeout(() => WR.modal(`<h2>✨ Evolution! ✨</h2><div class="petbox cheer" style="width:180px;height:180px;margin:auto">${WR.petHTML()}</div><p><b>${WR.esc(WR.state.pet.name)}</b> became <b>${WR.petInfo().stages[WR.petStage(lv.level)]}</b>!</p><button class="btn" onclick="this.closest('.modal-bg').remove()">Hooray!</button>`), 600);
}
// the next core skill to play in a realm: first one never played, else the weakest (lowest best score); never the one just played
WR.nextSkill = (rid, justPlayed) => {
  const p = (WR.state.progress[rid] || {});
  const cands = WR.SKILLS.filter(k => k.id !== justPlayed);
  const fresh = cands.find(k => !p[k.id]); if (fresh) return fresh;
  return cands.slice().sort((a, b) => (p[a.id].best - p[b.id].best) || (p[a.id].plays - p[b.id].plays))[0] || null;
};
WR.stopLesson = () => { clearTimer(); L = null; };
WR._dbg = () => L && (L.items[L.i].correct || L.items[L.i].answer); // test hook (used by the headless test)
WR._cur = () => L && L.items[L.i];                                    // test hook: the whole current item (c2types.js)
})();
