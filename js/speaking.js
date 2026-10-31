/* 🎤 Echo Well: speaking & pronunciation practice (bonus skill in every realm).
   Mic mode uses SpeechRecognition (en-GB, interim results, 3 alternatives) and scores word by word.
   Shadowing mode (no recognition / mic blocked): listen, say it aloud, then rate yourself. Never required for unlocking. */
(function () {
const WR = window.WR;
const PER_ROUND = 5;
const SPEAK = WR.SPEAKING = { id: "speaking", name: "Speaking", icon: "🎤", well: "Echo Well", desc: "Say it aloud at the Echo Well" };
const CHEER = ["The well sang it back! 🎶", "Crystal clear! ✨", "Beautiful speaking! 💖", "I heard every sparkle! 🌟"];
const NEARLY = ["So close! Try once more? 🫶", "Nearly there! Listen again 👂", "Good try! A few words got lost in the well 💧"];
const SR = () => window.SpeechRecognition || window.webkitSpeechRecognition || null;
const SELF = { great: { e: "😊", t: "Nailed it", score: 0.9 }, ok: { e: "🙂", t: "Almost", score: 0.7 }, again: { e: "😅", t: "Try again", score: 0.3 } };

/* ---------- text normalising & scoring (exposed as WR.Echo for tests) ---------- */
const ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" ");
const TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split(" ");
function numWords(n) {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
  if (n < 1000) return ONES[Math.floor(n / 100)] + " hundred" + (n % 100 ? " and " + numWords(n % 100) : "");
  if (n < 10000 && n % 1000 === 0) return ONES[n / 1000] + " thousand";
  return String(n);
}
const SPELL = { color: "colour", colors: "colours", favorite: "favourite", center: "centre", theater: "theatre", gray: "grey", mom: "mum",
  okay: "ok", traveled: "travelled", canceled: "cancelled", practice: "practise", practiced: "practised", armor: "armour", rumored: "rumoured",
  forever: "for ever", anymore: "any more", candyfloss: "candy floss", alright: "all right", cannot: "can not" };
const CONTR = [[/\bwon't\b/g, "will not"], [/\bcan't\b/g, "can not"], [/\bshan't\b/g, "shall not"], [/n't\b/g, " not"], [/'m\b/g, " am"],
  [/'re\b/g, " are"], [/'ve\b/g, " have"], [/'ll\b/g, " will"], [/'d\b/g, " would"], [/\blet's\b/g, "let us"],
  [/\b(it|that|what|there|here|he|she|who|where|how)'s\b/g, "$1 is"]];
function normWord(w) {
  w = SPELL[w] || w;
  return w.replace(/([a-z]{3,})(?:iz|yz)(e|es|ed|ing|ation|ations)$/, (m, a, b) => a + (m.includes("yz") ? "ys" : "is") + b);
}
function tokens(text) {
  let t = String(text || "").toLowerCase().replace(/[\u2018\u2019\u02bc`]/g, "'").replace(/[\u2010-\u2015-]/g, " ");
  CONTR.forEach(([a, b]) => t = t.replace(a, b));
  t = t.replace(/\d+/g, d => " " + numWords(+d) + " ").replace(/[^a-z0-9\s]+/g, "");
  return t.split(/\s+/).filter(Boolean).flatMap(w => normWord(w).split(" "));
}
function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
// exact, or a 1-letter spelling slip in a long word (but never a lost -s / -d ending, which is a real pronunciation point)
const same = (a, b) => a === b || (a.length >= 6 && b.length >= 6 && lev(a, b) === 1 && a.replace(/[sd]$/, "") !== b.replace(/[sd]$/, ""));
// split heard compounds ("bookshop" → "book shop") and merge split words ("candy floss" ↔ "candyfloss") to fit the target
function fit(target, heard) {
  const out = [];
  for (let j = 0; j < heard.length; j++) {
    const h = heard[j];
    if (target.includes(h)) { out.push(h); continue; }
    const two = heard[j + 1] && h + heard[j + 1];
    if (two && target.includes(two)) { out.push(two); j++; continue; }
    let split = null;
    for (let i = 0; i < target.length - 1 && !split; i++) if (target[i] + target[i + 1] === h) split = [target[i], target[i + 1]];
    split ? out.push(...split) : out.push(h);
  }
  return out;
}
function align(target, heard) { // LCS → which target tokens were heard
  heard = fit(target, heard);
  const n = target.length, m = heard.length, dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    dp[i][j] = same(target[i], heard[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const hit = new Array(n).fill(false); let i = 0, j = 0;
  while (i < n && j < m) { if (same(target[i], heard[j])) { hit[i] = true; i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++; }
  return hit;
}
const hasPhrase = (toks, phrase) => { const p = tokens(phrase); if (!p.length) return false;
  for (let i = 0; i + p.length <= toks.length; i++) if (p.every((w, k) => toks[i + k] === w)) return true; return false; };
function scoreRead(text, heardText) {
  const words = String(text).split(/\s+/).filter(Boolean).map(w => ({ w, t: tokens(w) }));
  const target = words.flatMap(x => x.t), hit = align(target, tokens(heardText));
  let k = 0; words.forEach(x => { const hs = x.t.map(() => hit[k++]); x.ok = hs.length ? hs.every(Boolean) : true; });
  const score = target.length ? hit.filter(Boolean).length / target.length : 0;
  return { score, words, heard: heardText };
}
function scoreAnswer(item, heardText) {
  const toks = tokens(heardText);
  const kws = item.keywords.map(k => { const alts = k.split("|"); const found = alts.find(a => hasPhrase(toks, a)); return { label: alts.join(" / "), ok: !!found, found }; });
  let score = kws.filter(k => k.ok).length / kws.length;
  const short = toks.length < (item.minWords || 5);
  if (short) score = Math.min(score, 0.65);
  const kwToks = new Set(kws.filter(k => k.ok).flatMap(k => tokens(k.found)));
  const words = String(heardText).split(/\s+/).filter(Boolean).map(w => ({ w, ok: tokens(w).some(t => kwToks.has(t)), kw: true }));
  return { score, kws, words, short, heard: heardText };
}
const scoreOf = (item, heard) => item.type === "answer" ? scoreAnswer(item, heard) : scoreRead(item.text, heard);
function best(item, candidates) {
  let top = null;
  candidates.filter(c => c && c.trim()).forEach(c => { const r = scoreOf(item, c); if (!top || r.score > top.score) top = r; });
  return top || scoreOf(item, "");
}
const starsFor = s => s >= 0.9 ? 3 : s >= 0.7 ? 2 : s >= 0.5 ? 1 : 0;
WR.Echo = { tokens, scoreRead, scoreAnswer, best, starsFor, supported: () => !!SR() };

/* ---------- recognition wrapper ---------- */
let rec = null, recTimer = null;
function stopRec(abort) { clearTimeout(recTimer); if (rec) { const r = rec; rec = null; try { abort ? r.abort() : r.stop(); } catch (e) { } } }
function listen({ onInterim, onDone, onFail }) {
  const C = SR(); if (!C) return onFail("unsupported");
  let r; try { r = new C(); } catch (e) { return onFail("unsupported"); }
  r.lang = "en-GB"; r.interimResults = true; r.maxAlternatives = 3; r.continuous = false;
  const finals = []; let interim = "", err = null, done = false;
  const finish = () => {
    if (done) return; done = true; clearTimeout(recTimer); if (rec === r) rec = null;
    const cands = [];
    if (finals.length) for (let k = 0; k < 3; k++) cands.push(finals.map(a => a[Math.min(k, a.length - 1)]).join(" "));
    if (interim) cands.push(interim);
    if (cands.some(c => c.trim())) onDone(cands); else onFail(err || "no-speech");
  };
  r.onresult = e => {
    let live = "";
    for (let i = 0; i < e.results.length; i++) {
      const res = e.results[i], alts = [];
      for (let k = 0; k < res.length; k++) alts.push(res[k].transcript);
      if (res.isFinal) finals[i] = alts; else live += alts[0] + " ";
    }
    interim = (finals.map(a => a && a[0]).join(" ") + " " + live).trim();
    onInterim && onInterim(interim);
  };
  r.onerror = e => { err = (e && e.error) || "error"; };
  r.onend = finish;
  try { r.start(); rec = r; } catch (e) { done = true; return onFail("start"); }
  recTimer = setTimeout(() => { try { r.stop(); } catch (e) { } setTimeout(finish, 1500); }, 15000);
}
const MIC_BLOCKED = ["not-allowed", "service-not-allowed", "audio-capture", "unsupported", "start", "network", "language-not-supported"];
const WHY = {
  unsupported: "This browser can't listen to speech (Firefox and some Safari versions don't support it yet).",
  "not-allowed": "The microphone is switched off for this game.", "service-not-allowed": "The microphone is switched off for this game.",
  "audio-capture": "I couldn't find a microphone.", network: "The speech helper needs an internet connection.",
  start: "The microphone couldn't start.", "language-not-supported": "British English listening isn't available here."
};

/* ---------- round ---------- */
let S = null;
WR.stopSpeaking = () => { stopRec(true); S = null; };
WR.startSpeaking = async (rid, opts = {}) => {
  WR.stopSpeaking(); WR.Voice.stop();
  const realm = WR.realms.find(r => r.id === rid);
  const bank = await WR.bank(rid, "speaking");
  const items = (opts.items || WR.sample(bank, PER_ROUND)).map(x => ({ ...x, best: 0, attempts: 0, passed: false }));
  const forced = opts.mode || (WR.state.speaking && WR.state.speaking.preferShadow ? "shadow" : null);
  const why = !SR() ? "unsupported" : forced === "shadow" && !opts.mode ? WR.state.speaking.shadowWhy : null;
  S = { realm, items, i: 0, starsEarned: 0, passes: 0, mode: forced || (SR() ? "mic" : "shadow"), why, listening: false };
  WR.navActive && WR.navActive("map");
  render();
};
const cur = () => S.items[S.i];
WR._echoDbg = () => S && { item: cur(), mode: S.mode, i: S.i, n: S.items.length }; // test hook
const sayTarget = it => it.type === "answer" ? it.model : it.text;
function wordsHTML(words) { return words.map(x => `<span class="w ${x.ok == null ? "" : x.ok ? "hit" : "miss"}">${WR.esc(x.w)}</span>`).join(" "); }
function hud() {
  const n = S.items.length;
  return `<span class="pill">${S.realm.level} · 🎤 Echo Well</span><span class="qnum">${Math.min(S.i + 1, n)}/${n}</span>
    <div class="drops">${S.items.map(x => `<span class="${x.passed ? "full" : ""}">${x.passed ? "💧" : "○"}</span>`).join("")}</div>
    <span class="pill mode-pill" style="background:${S.mode === "mic" ? "var(--mint)" : "var(--butter)"}">${S.mode === "mic" ? "🎤 Mic mode" : "🗣️ Shadowing mode"}</span>`;
}
function render() {
  const it = cur(), bgA = WR.asset(S.realm.bg), rate = WR.state.settings.rate;
  const mic = S.mode === "mic";
  const prompt = it.type === "answer"
    ? `<div class="qtext">${WR.esc(it.q)}</div><div class="kw-row"><span class="muted">Use:</span> ${it.keywords.map(k => `<span class="kw">${WR.esc(k.split("|").join(" / "))}</span>`).join("")}</div>`
    : `<div class="echo-text" id="echoText">${wordsHTML(it.text.split(/\s+/).map(w => ({ w })))}</div>`;
  const banner = !mic ? `<div class="echo-banner"><b>🌙 The Echo Well is listening in shadowing mode.</b> ${WR.esc(WHY[S.why] || "You chose to practise without the microphone.")}
      Listen 🔊, say it aloud, then tell me how it went. It's a great way to practise rhythm and sounds! ${SR() ? `<button class="btn ghost small" id="tryMic">🎤 Try the microphone</button>` : ""}</div>` : "";
  WR.view(`<div class="lesson-bg" style="background-image:${bgA ? WR.bgCss(bgA.id) : "none"}"></div>
    <div class="row" style="margin:6px 0 8px"><button class="btn ghost small" id="quitBtn">← Leave</button><b class="title">🎤 Echo Well · ${WR.esc(S.realm.name)}</b></div>
    <div class="card hud">${hud()}</div>
    <div class="lesson fade-in echo"><div class="card qcard">${banner}
      <div class="row" style="gap:6px;margin-bottom:6px"><span class="pill focus-pill">🎯 ${WR.esc(it.focus)}</span><span class="pill" style="background:var(--blue)">${it.type === "answer" ? "💬 Answer the question" : "📣 Read aloud"}</span></div>
      ${prompt}
      <div class="echo-tip">💡 ${WR.esc(it.tip)}</div>
      <div class="echo-controls">
        <div class="hearbox"><button class="btn ghost" id="hearBtn">🔊 ${it.type === "answer" ? "Hear an example" : "Hear it"}</button><button class="btn ghost small" id="slowBtn">🐢 Slow</button>
          <div class="row muted" style="font-size:.85rem;gap:6px">Speed <input type="range" class="slider" id="rate" min="0.5" max="1.3" step="0.1" value="${rate}"><span id="rateVal">${rate}×</span></div>
          ${Speech.supported ? "" : `<div class="muted" style="font-size:.75rem">Your browser can't speak aloud, so read the words carefully.</div>`}</div>
        ${mic ? `<div class="micbox"><button class="micbtn" id="micBtn" aria-label="Say it">🎤</button><b id="micLbl">Say it</b></div>`
              : `<div class="selfbox"><b>How did it sound?</b><div class="row" style="gap:6px;justify-content:center">${Object.entries(SELF).map(([k, v]) => `<button class="btn ${k === "great" ? "mint" : k === "ok" ? "" : "peach"} small selfbtn" data-self="${k}">${v.e} ${v.t}</button>`).join("")}</div></div>`}
      </div>
      <div class="heard" id="heard">${mic ? `<span class="muted">Tap 🎤 and read the ${it.type === "answer" ? "answer" : "sentence"} aloud. I'll listen in British English.</span>` : `<span class="muted">1. Listen 🔊 &nbsp;2. Say it aloud 🗣️ &nbsp;3. Rate yourself</span>`}</div>
      <div id="echoResult"></div></div>
      <div class="card side"><div class="petbox" id="lpet">${WR.petHTML()}</div><div class="bubble" id="lbubble">${S.i === 0 ? "Whisper into the well and it echoes back! 🎶" : WR.esc(WR.petMood())}</div>
      <div class="muted" id="lstats" style="font-size:.85rem;font-weight:800">⭐ ${S.starsEarned} earned · 💧 ${S.passes} passed</div></div></div>`);
  const play = r => { const b = WR.$("#hearBtn"); b && b.classList.add("playing"); WR.say(sayTarget(it), { rate: r, onend: () => { const bb = WR.$("#hearBtn"); bb && bb.classList.remove("playing"); } }); };
  WR.$("#hearBtn").onclick = () => play();
  WR.$("#slowBtn").onclick = () => play(0.6);
  WR.$("#rate").oninput = e => { WR.state.settings.rate = +e.target.value; WR.$("#rateVal").textContent = e.target.value + "×"; WR.save(); };
  WR.$("#quitBtn").onclick = () => { stopRec(true); WR.Voice.stop(); const r = S.realm.id; S = null; WR.go("realm", r); };
  const tm = WR.$("#tryMic"); if (tm) tm.onclick = () => { S.mode = "mic"; S.why = null; WR.state.speaking.preferShadow = false; WR.state.speaking.shadowWhy = null; WR.save(); render(); };
  if (mic) WR.$("#micBtn").onclick = () => toggleMic(it);
  else document.querySelectorAll("[data-self]").forEach(b => b.onclick = () => selfRate(it, b.dataset.self));
  if (!mic && S.i === 0 && !it.attempts) setTimeout(() => S && cur() === it && play(), 400);
}
function toggleMic(it) {
  if (S.listening) { stopRec(false); return; }
  WR.Voice.stop(); S.listening = true;
  const btn = WR.$("#micBtn"), lbl = WR.$("#micLbl"), heard = WR.$("#heard");
  btn.classList.add("on"); lbl.textContent = "Listening… tap to stop"; heard.innerHTML = `<span class="muted">👂 Listening…</span>`;
  const reset = () => { S && (S.listening = false); const b = WR.$("#micBtn"); if (b) { b.classList.remove("on"); WR.$("#micLbl").textContent = "Say it"; } };
  listen({
    onInterim: t => { const h = WR.$("#heard"); if (h) h.innerHTML = `👂 <i>${WR.esc(t)}</i>`; },
    onDone: cands => { if (!S || cur() !== it) return; reset(); grade(it, best(it, cands)); },
    onFail: err => {
      if (!S || cur() !== it) return; reset();
      if (MIC_BLOCKED.includes(err)) {
        S.mode = "shadow"; S.why = err; const sp = WR.state.speaking; sp.micErrors = (sp.micErrors || 0) + 1;
        if (err !== "start") { sp.preferShadow = true; sp.shadowWhy = err; } WR.save();
        WR.toast("🌙 No microphone, no problem! Let's practise by shadowing.", 2600); render();
      } else { const h = WR.$("#heard"); if (h) h.innerHTML = `<span class="muted">🤫 I couldn't hear anything. Tap 🎤 and speak a little louder, close to the microphone.</span>`; }
    }
  });
}
function award(it, score) {
  it.attempts++; const first = !it.passed, ok = score >= 0.5;
  it.best = Math.max(it.best, score);
  const s = WR.state; WR.countAnswer(ok && first, S.realm.id + "/speaking", ok); s.speaking.attempts++;
  let gain = 0;
  if (ok && first) { it.passed = true; S.passes++; gain = WR.awardStars("speak", S.realm.id + "/" + sayTarget(it), 1, { tally: S, quiet: true }); S.starsEarned += gain; s.speaking.passed++; WR.questEvent("correct10"); }
  if (starsFor(score) === 3) s.speaking.perfect++;
  WR.save(); WR.renderTop();
  const h = document.querySelector(".hud"); if (h) h.innerHTML = hud();
  const ls = WR.$("#lstats"); if (ls) ls.textContent = `⭐ ${S.starsEarned} earned · 💧 ${S.passes} passed`;
  return gain;
}
function petReact(ok, great) {
  const box = WR.$("#lpet"), bub = WR.$("#lbubble"); if (!box) return;
  box.classList.remove("bounce", "cheer", "sad"); void box.offsetWidth;
  box.classList.add(ok ? (great ? "cheer" : "bounce") : "sad");
  const pick = a => a[Math.floor(Math.random() * a.length)];
  bub.textContent = ok ? (great ? pick(CHEER) : pick(["Lovely! Keep going ✨", "Nice and clear! 🌸", "Good job! 💖"])) : pick(NEARLY);
}
function grade(it, r) {
  const st = starsFor(r.score), gain = award(it, r.score), ok = st >= 1;
  if (it.type === "read") WR.$("#echoText").innerHTML = wordsHTML(r.words);
  WR.$("#heard").innerHTML = `👂 I heard: “${it.type === "answer" ? wordsHTML(r.words) : WR.esc(r.heard)}”`;
  const kwHTML = it.type === "answer" ? `<div class="kw-row" style="margin-top:6px">${r.kws.map(k => `<span class="kw ${k.ok ? "hit" : "miss"}">${k.ok ? "✓" : "✗"} ${WR.esc(k.label)}</span>`).join("")}</div>
      ${r.short ? `<div class="muted" style="font-weight:700">Try a longer, complete sentence (at least ${it.minWords || 5} words).</div>` : ""}
      <div class="muted" style="font-weight:700;margin-top:4px">✨ Example: “${WR.esc(it.model)}”</div>` : "";
  const hint = it.type === "read" && st < 3 ? `<div class="muted" style="font-weight:700;margin-top:4px">${st ? "Listen again 🔊 and give the pink words a little more care." : "Tap 🔊 Hear it (or 🐢 Slow), then try the whole sentence again."}</div>` : "";
  showResult(it, ok, st, `<b>${Math.round(r.score * 100)}% ${it.type === "answer" ? "of the target words" : "of the words heard"}</b>${gain ? " · +1 ⭐" : ""}${kwHTML}${hint}`);
  WR.sfx(ok ? "good" : "bad"); petReact(ok, st === 3);
  if (st === 3) WR.confetti(10);
}
function selfRate(it, k) {
  const v = SELF[k], ok = k !== "again", gain = award(it, v.score);
  WR.$("#heard").innerHTML = `${v.e} You said: <b>${v.t}</b>`;
  showResult(it, ok, ok ? (k === "great" ? 3 : 2) : 0, ok ? `<b>Self-rated · ${v.t}</b>${gain ? " · +1 ⭐" : ""}` : `<b>No worries!</b> Listen once more with 🐢 Slow, then shadow it again.`);
  WR.sfx(ok ? "good" : "tap"); petReact(ok, k === "great");
}
function showResult(it, ok, st, body) {
  const last = S.i >= S.items.length - 1;
  WR.$("#echoResult").innerHTML = `<div class="explain ${ok ? "good" : "bad"}"><div class="echo-stars">${"⭐".repeat(st)}<span style="opacity:.25">${"⭐".repeat(3 - st)}</span></div>${body}</div>
    <div class="row" style="margin-top:12px;justify-content:flex-end"><button class="btn ghost" id="retryBtn">🔁 ${S.mode === "mic" ? "Try again" : "Shadow again"}</button><button class="btn ${ok ? "mint" : ""}" id="nextBtn">${last ? "See results ✨" : "Next →"}</button></div>`;
  WR.$("#retryBtn").onclick = () => { WR.$("#echoResult").innerHTML = ""; if (S.mode === "mic") toggleMic(it); else WR.$("#heard").innerHTML = `<span class="muted">Listen 🔊, say it again, then rate yourself.</span>`; };
  WR.$("#nextBtn").onclick = () => next();
  WR.$("#nextBtn").scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function plantIfMissed(it) {
  if (!it.attempts || it.passed || it.type !== "read" || !WR.Garden) return;
  // planted as a sentence-builder card so the garden's existing review round can quiz it
  WR.Garden.plant({ type: "order", q: "🎤 Rebuild the sentence you practised at the Echo Well, then say it aloud!", answer: it.text, say: it.text,
    explain: `${it.focus}: ${it.tip}` }, S.realm.id, "speaking");
}
function next() {
  stopRec(true); WR.Voice.stop(); plantIfMissed(cur());
  if (S.i >= S.items.length - 1) return finish();
  S.i++; render();
}
function finish() {
  const n = S.items.length, raw = S.items.reduce((a, x) => a + x.best, 0) / n;
  const score = S.mode === "mic" ? raw : Math.min(raw, 0.7); // self-rating can earn up to 2 crowns; 3 crowns need the microphone
  const crowns = WR.crowns(score), bonus = S.mode === "mic" ? crowns * 2 : 0;
  S.starsEarned += WR.awardStars("speak", S.realm.id + "/" + S.mode, bonus, { kind: "round", tally: S });
  WR.recordLesson(S.realm.id, "speaking", score);
  WR.state.speaking.rounds++;
  WR.questEvent("speak1"); if (crowns === 3) WR.questEvent("perfect1");
  const newStreak = WR.activityDone(), lv = WR.petGainXP(S.passes * 6 + 10);
  WR.save(); WR.renderTop();
  const R = S, title = crowns === 3 ? "The well sings your words! 👑" : crowns >= 1 ? "Lovely speaking! 🌟" : "Keep practising! 🌱";
  WR.view(`<div class="card result fade-in"><h1>${title}</h1>${WR.starNote()}
    <div class="big">${"👑".repeat(crowns)}${"<span style='opacity:.2'>👑</span>".repeat(3 - crowns)}</div>
    <h2>${R.passes} / ${n} sentences passed</h2>
    <p class="muted" style="font-weight:800">⭐ ${R.starsEarned} stars earned${R.mode === "shadow" ? " · 🗣️ shadowing mode" : ""} ${newStreak ? `· 🔥 streak ${WR.state.streak.count} day${WR.state.streak.count > 1 ? "s" : ""}!` : ""}</p>
    <div class="echo-summary">${R.items.map(x => `<div class="row"><span>${"⭐".repeat(starsFor(x.best)) || "🌰"}</span><span style="flex:1;text-align:left">${WR.esc(x.type === "answer" ? x.q : x.text)}</span></div>`).join("")}</div>
    <div class="petbox bounce" style="margin:10px auto">${WR.petHTML()}</div>
    <div class="bubble">${lv ? (lv.evolved ? `I evolved into ${WR.petInfo().stages[WR.petStage(lv.level)]}! 🌟` : `I reached level ${lv.level}! 🎉`) : crowns >= 2 ? "Your voice made the well sparkle! 💖" : "Let's whisper to the well again! 🫶"}</div>
    ${R.items.some(x => x.attempts && !x.passed && x.type === "read") ? `<p class="muted" style="font-weight:700">🌰 Missed sentences were planted in your Mistake Garden.</p>` : ""}
    <p class="muted" style="font-size:.8rem">Speaking is a bonus skill: it earns crowns and stars but isn't needed to unlock the next realm.</p>
    <div class="row" style="justify-content:center;margin-top:16px"><button class="btn" id="again">↻ Play again</button><button class="btn mint" id="back">Back to ${WR.esc(R.realm.name)}</button></div></div>`);
  if (crowns >= 2 || lv) WR.confetti(); WR.sfx(lv ? "level" : "good");
  S = null;
  WR.$("#again").onclick = () => WR.startSpeaking(R.realm.id);
  WR.$("#back").onclick = () => WR.go("realm", R.realm.id);
}
})();
