/* 🔢 Number Kingdom: the maths realm (Grades 1–12) and the 🗼 Times-Table Tower (multiplication & division dojo).
   Questions come from js/math-gen.js + js/math-topics-*.js. Progress lives in WR.state.math, inside the
   wordRealms.save.v1 save, so it syncs with Cloud Castle like everything else. */
(function () {
const WR = window.WR, MG = window.MathGen;
const MW = WR.Math = {};
const CHEER = ["Number magic! ✨", "You're a maths star! 🌟", "Brilliant! 💖", "Sumi is proud of you! ⭐", "Spot on! 🎯", "Woohoo! 🎉"];
const COMFORT = ["Hmm, try once more! 💭", "Almost! Peek at the hint 💡", "Mistakes help us grow 🌱", "We'll get it together 🫶"];

/* ---------- maths rendering: KaTeX from the CDN, with a plain-HTML fallback ---------- */
const KX = "https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/";
let kx = "idle", kxWait = null;
MW.loadKatex = () => {
  if (kx === "ready" || kx === "failed") return Promise.resolve(kx);
  if (kxWait) return kxWait;
  kx = "loading";
  kxWait = new Promise(res => {
    const done = st => { if (kx === "loading") { kx = st; res(st); if (st === "ready") MW.upgrade(document); } };
    const l = document.createElement("link"); l.rel = "stylesheet"; l.href = KX + "katex.min.css"; document.head.appendChild(l);
    const s = document.createElement("script"); s.src = KX + "katex.min.js"; s.async = true;
    s.onload = () => done(window.katex ? "ready" : "failed"); s.onerror = () => done("failed");
    document.head.appendChild(s); setTimeout(() => done("failed"), 9000);
  });
  return kxWait;
};
MW.katexState = () => kx;
const esc = WR.esc;
const SYM = { times: "×", div: "÷", cdot: "·", pm: "±", le: "≤", ge: "≥", ne: "≠", pi: "π", theta: "θ", infty: "∞", circ: "°", to: "→", Rightarrow: "⇒", square: "▢", sum: "Σ", int: "∫",
  ln: "ln ", log: "log", sin: "sin ", cos: "cos ", tan: "tan ", lim: "lim", quad: "  ", ",": " ", ";": " ", ":": " ", "!": "", " ": " ", "%": "%", "$": "$", "{": "{", "}": "}", "\\": " ; ",
  left: "", right: "", displaystyle: "", alpha: "α", beta: "β", Sigma: "Σ", approx: "≈", in: "∈", infin: "∞" };
// small TeX → HTML converter used until (or if) KaTeX can't load: fractions stack, powers lift, vectors stand up
MW.fallback = function conv(s) {
  let out = "", i = 0;
  const group = () => {
    while (s[i] === " ") i++;
    if (s[i] === "{") { let d = 1, j = i + 1; while (j < s.length && d) { if (s[j] === "{") d++; else if (s[j] === "}") d--; j++; } const g = s.slice(i + 1, j - 1); i = j; return g; }
    if (s[i] === "\\") { const m = s.slice(i).match(/^\\([a-zA-Z]+|.)/); i += m[0].length; return m[0]; }
    return s[i++] || "";
  };
  while (i < s.length) {
    const c = s[i];
    if (c === "\\") {
      const m = s.slice(i).match(/^\\([a-zA-Z]+|.)/); const cmd = m[1]; i += m[0].length;
      if (/^[dt]?frac$/.test(cmd)) { const a = group(), b = group(); out += `<span class="mfrac"><span>${conv(a)}</span><span>${conv(b)}</span></span>`; }
      else if (cmd === "sqrt") { let idx = ""; if (s[i] === "[") { const j = s.indexOf("]", i); idx = s.slice(i + 1, j); i = j + 1; } const a = group(); out += `${idx ? `<sup>${conv(idx)}</sup>` : ""}√<span class="msq">${conv(a)}</span>`; }
      else if (cmd === "text" || cmd === "mathrm") out += esc(group());
      else if (cmd === "mathbf") out += `<b>${conv(group())}</b>`;
      else if (cmd === "binom") { const a = group(), b = group(); out += `<span class="mbinom"><span>${conv(a)}</span><span>${conv(b)}</span></span>`; }
      else if (cmd === "begin") { group(); const end = s.indexOf("\\end{pmatrix}", i), body = s.slice(i, end < 0 ? s.length : end); i = end < 0 ? s.length : end + 13; out += `<span class="mvec">${body.split("\\\\").map(x => `<span>${conv(x.trim())}</span>`).join("")}</span>`; }
      else out += SYM[cmd] != null ? SYM[cmd] : esc(cmd);
    } else if (c === "^" || c === "_") { i++; const g = group(); out += g === "\\circ" ? "°" : `<${c === "^" ? "sup" : "sub"}>${conv(g)}</${c === "^" ? "sup" : "sub"}>`; }
    else if (c === "{" || c === "}") i++;
    else if (c === "-") { out += "−"; i++; }
    else if (/[a-zA-Z]/.test(c)) { out += `<i>${c}</i>`; i++; }
    else { out += esc(c); i++; }
  }
  return out;
};
const texHTML = t => {
  if (kx === "ready") { try { return `<span class="mx kx">${window.katex.renderToString(t, { throwOnError: false })}</span>`; } catch (e) { } }
  return `<span class="mx fb" data-tex="${esc(t)}">${MW.fallback(t)}</span>`;
};
// text with $…$ maths; plain parts are escaped (only <u>, <b> and <br> survive)
MW.html = str => String(str == null ? "" : str).split(/\$([^$]+)\$/).map((p, k) => k % 2 ? texHTML(p) : esc(p).replace(/&lt;(\/?)(u|b|br)&gt;/g, "<$1$2>")).join("");
MW.upgrade = root => { if (kx !== "ready") return; (root || document).querySelectorAll(".mx.fb[data-tex]").forEach(el => { try { el.innerHTML = window.katex.renderToString(el.dataset.tex, { throwOnError: false }); el.classList.remove("fb"); el.classList.add("kx"); } catch (e) { } }); };

/* ---------- state (inside wordRealms.save.v1) ---------- */
MW.st = () => { const s = WR.state; if (!s.math) s.math = WR.freshMath(); const m = s.math, f = WR.freshMath();
  for (const k in f) if (m[k] === undefined) m[k] = f[k];
  m.topics = m.topics || {}; m.facts = m.facts || {}; for (const k in f.dojo) if (m.dojo[k] === undefined) m.dojo[k] = f.dojo[k]; return m; };
MW.crownsFor = key => { const t = MW.st().topics[key]; return t ? WR.crowns(t.best) : 0; };
MW.gradeCrowns = g => { const ts = MG.gradeTopics(g); return { have: ts.reduce((a, t) => a + MW.crownsFor(t.id), 0), max: ts.length * 3, played: ts.filter(t => MW.st().topics[t.id]).length, n: ts.length }; };
MW.totalCrowns = () => MG.TOPICS.reduce((a, t) => a + MW.crownsFor(t.id), 0);
MW.mastered = () => Object.values(MW.st().facts).filter(f => f.b >= MG.MASTERED).length;
MW.dueFacts = tables => { const f = MW.st().facts, now = Date.now(); return Object.keys(f).filter(k => f[k].d <= now && (!tables || tables.includes(+k.split("x")[0]))).length; };
MW.level = () => 1 + Math.floor((MW.st().xp || 0) / 100);
const crownRow = n => "👑".repeat(n) + `<span style="opacity:.2">${"👑".repeat(3 - n)}</span>`;
const gradeInfo = g => MG.GRADES.find(x => x.g === g);
const mascot = (cls = "") => `<img class="sumi ${cls}" src="assets/web/math_mascot.webp" onerror="this.onerror=null;this.src='assets/ui/math_mascot.png'" alt="Sumi the star fairy">`;
const tower = (cls = "") => `<img class="tower-art ${cls}" src="assets/web/times_tower.webp" onerror="this.onerror=null;this.src='assets/ui/times_tower.png'" alt="The Times-Table Tower">`;

/* ---------- 🔢 the Number Kingdom hub ---------- */
WR.screens.math = arg => {
  MW.loadKatex();
  const m = MW.st(); if (typeof arg === "number") { m.grade = arg; WR.save(); }
  const g = m.grade, gi = g && gradeInfo(g);
  const chips = MG.GRADES.map(x => { const c = MW.gradeCrowns(x.g); return `<button class="gchip ${x.g === g ? "sel" : ""}" data-g="${x.g}"><b>${x.emoji} G${x.g}</b><small>${x.sg.replace("Primary ", "P").replace("Secondary ", "Sec ")}</small><i style="width:${c.have / c.max * 100}%"></i></button>`; }).join("");
  const topics = g ? MG.gradeTopics(g).map(t => { const c = MW.crownsFor(t.id), p = m.topics[t.id]; return `<div class="card skill-card mtopic ${t.story ? "story" : ""}" data-t="${t.id}"><span class="ico">${t.icon}</span><h3>${esc(t.name)}</h3><div class="muted" style="font-size:.82rem;font-weight:700">${esc(t.desc)}</div><div class="crowns">${p ? crownRow(c) : '<span class="muted" style="font-size:.8rem">not played</span>'}</div>${p ? `<div class="muted" style="font-size:.72rem">best ${Math.round(p.best * 100)}% · played ${p.plays}×</div>` : '<div class="muted" style="font-size:.72rem">endless questions</div>'}</div>`; }).join("") : "";
  WR.view(`<div class="fade-in math-hub"><div class="realm-hero math-hero">${WR.img("bg_math", "bg")}${mascot("hero-sumi")}<div class="ov"><span class="lvl-badge">Grades 1–12</span><b class="title" style="font-size:1.5rem">🔢 Number Kingdom</b>
    <p style="margin:.3em 0;font-weight:700">Sumi the star fairy guards a kingdom of numbers. Every grade is a new land, from counting stars in Button Meadow to calculus at the Calculus Crown.</p>
    <div class="row" style="gap:6px"><span class="pill">👑 ${MW.totalCrowns()} crowns</span><span class="pill" style="background:var(--mint)">🗼 ${MW.mastered()}/132 facts mastered</span><span class="pill" style="background:var(--butter)">✨ Maths level ${MW.level()}</span></div></div></div>
    <div class="row" style="margin:12px 0;justify-content:space-between"><b class="title" style="font-size:1.1rem">Choose your grade</b><button class="btn ghost small" id="mPlace">🔮 Find my grade</button></div>
    <div class="gchips">${chips}</div>
    ${!g ? `<div class="card center start-grade"><h2>Where should your maths journey begin? ✨</h2><p class="muted" style="font-weight:700">Tap your grade above (Singapore: P1–P6 = Grades 1–6, Sec 1–4 = Grades 7–10, JC 1–2 = Grades 11–12), or let Sumi find it with a quick 3-minute quiz.</p><button class="btn mint" id="mPlace2">🔮 Ask Sumi to find my grade</button></div>` : ""}
    <div class="card row tower-card" id="toDojo">${tower()}<div style="flex:1"><b class="title" style="font-size:1.25rem">🗼 Times-Table Tower</b><div class="muted" style="font-weight:700;font-size:.9rem">Multiplication & division dojo: tables 2–12, 60-second sprints, a mastery grid and long multiplication & division floors.</div>
      <div class="row" style="margin-top:6px;gap:6px"><span class="pill">⚡ best sprint ${m.dojo.best || 0}</span>${MW.dueFacts() ? `<span class="pill" style="background:#FFE3EF">🔁 ${MW.dueFacts()} facts to review</span>` : ""}</div></div><span class="btn small">Climb →</span></div>
    ${g ? `<div class="row grade-head"><div><span class="lvl-badge">${gi.label}</span> <b class="title" style="font-size:1.3rem">${gi.emoji} ${gi.name}</b><div class="muted" style="font-weight:800;font-size:.85rem">${gi.sg} · ${MG.gradeTopics(g).length} topics · ${MW.gradeCrowns(g).have}/${MW.gradeCrowns(g).max} crowns</div></div><button class="btn small mint" id="mMixed">🎲 Mixed practice</button></div>
    <div class="grid g4">${topics}</div>` : ""}</div>`);
  document.querySelectorAll(".gchip").forEach(b => b.onclick = () => { m.grade = +b.dataset.g; WR.save(); WR.sfx("tap"); WR.screens.math(); });
  document.querySelectorAll("[data-t]").forEach(c => c.onclick = () => MW.startLesson({ topic: c.dataset.t }));
  WR.$("#toDojo").onclick = () => WR.go("dojo");
  const mx = WR.$("#mMixed"); if (mx) mx.onclick = () => MW.startLesson({ grade: g });
  WR.$("#mPlace").onclick = () => MW.placement();
  const p2 = WR.$("#mPlace2"); if (p2) p2.onclick = () => MW.placement();
  WR.navActive("math");
};

/* ---------- answer input: numpad (works with the on-screen pad and a real keyboard) ---------- */
const coarse = () => window.matchMedia && matchMedia("(pointer: coarse)").matches;
// phone-calculator layout: digits on the left, the extra keys this question needs (− . / : r ,) down the right and bottom
MW.padGrid = extra => {
  const ex = extra.slice(); if (ex.includes("/")) ex.push(" ");
  const lab = k => k === "-" ? "−" : k === " " ? "␣" : k === "," ? "," : k;
  const E = i => ex[i] != null ? `<button class="ex" data-key="${ex[i]}" aria-label="${k2name(ex[i])}">${lab(ex[i])}</button>` : `<span class="padgap"></span>`;
  return `<div class="numpad">${[7, 8, 9].map(d => `<button data-key="${d}">${d}</button>`).join("")}${E(0)}${[4, 5, 6].map(d => `<button data-key="${d}">${d}</button>`).join("")}${E(1)}${[1, 2, 3].map(d => `<button data-key="${d}">${d}</button>`).join("")}${E(2)}${E(3)}<button data-key="0">0</button><button class="bk" data-key="back" aria-label="Delete">⌫</button>${E(4)}</div>`;
};
const k2name = k => ({ "-": "minus", ".": "decimal point", "/": "fraction bar", ":": "colon", r: "remainder", ",": "comma", " ": "space" }[k] || k);
MW.extraKeys = (q, grade) => { const keys = new Set(q.keys || []); if (grade >= 7 || (q.grade || 0) >= 7) { keys.add("-"); keys.add("."); } return ["-", ".", "/", ":", "r", ","].filter(k => keys.has(k)); };
function padHTML(q, grade) {
  return `<div class="ansrow"><input id="mans" class="input mans" autocomplete="off" autocapitalize="off" spellcheck="false" ${coarse() ? 'inputmode="none"' : 'inputmode="decimal"'} placeholder="Your answer" aria-label="Your answer"><button class="btn mint" id="mcheck">✓ Check</button></div>${MW.padGrid(MW.extraKeys(q, grade))}`;
}
function bindPad(onSubmit, onType) {
  const inp = WR.$("#mans"); if (!inp) return;
  const put = k => { if (inp.disabled) return; if (k === "back") inp.value = inp.value.slice(0, -1); else inp.value += k === "r" ? " r " : k === "," ? ", " : k; onType && onType(inp.value); };
  document.querySelectorAll(".numpad [data-key]").forEach(b => b.onclick = e => { e.preventDefault(); put(b.dataset.key); WR.sfx("tap"); if (!coarse()) inp.focus(); });
  inp.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); onSubmit(); } };
  inp.oninput = () => onType && onType(inp.value);
  WR.$("#mcheck").onclick = () => onSubmit();
  if (!coarse()) setTimeout(() => inp.focus({ preventScroll: true }), 30);
}

/* ---------- topic lessons ---------- */
let L = null;
MW.buildItems = o => {
  if (o.items) return o.items;
  if (o.challenge) { const out = [], seen = new Set(); let s = MG.seed(); while (out.length < 8) { s = (Math.imul(s, 1103515245) + 12345) >>> 0; const q = MG.makeChallenge(o.challenge, s); if (!seen.has(q.q)) { seen.add(q.q); out.push(q); } } return out; }
  if (o.topic) return MG.batch(o.topic, 8);
  const ts = MG.gradeTopics(o.grade), pick = WR.shuffle(ts.concat(WR.shuffle(ts))).slice(0, 8);
  return pick.map(t => MG.batch(t.id, 1)[0]);
};
MW.startLesson = o => {
  MW.loadKatex();
  const t = o.topic && MG.topic(o.topic), ch = o.challenge && MG.challenge(o.challenge);
  const grade = t ? t.grade : ch ? ch.grade : o.grade;
  L = Object.assign({ i: 0, pts: 0, correct: 0, combo: 0, maxCombo: 0, starsEarned: 0, tries: 0 }, o, { grade, items: MW.buildItems(o),
    key: o.topic || (o.challenge ? "dojo." + o.challenge : `g${grade}.mixed`), title: t ? `${t.icon} ${t.name}` : ch ? `${ch.icon} ${ch.name}` : `🎲 Grade ${grade} mixed practice` });
  WR.navActive("math"); render();
};
function hud() {
  const n = L.items.length;
  return `<span class="pill">${L.challenge ? "🗼 Tower" : "Grade " + L.grade} · ${esc(L.title)}</span><span class="qnum">${Math.min(L.i + 1, n)}/${n}</span><div class="gems">${L.items.map((_, k) => `<span class="${k < L.i ? (L.res[k] === 1 ? "g1" : L.res[k] ? "g5" : "g0") : k === L.i ? "cur" : ""}">${k < L.i ? (L.res[k] === 1 ? "💎" : L.res[k] ? "🔹" : "🫧") : "·"}</span>`).join("")}</div>`;
}
function render() {
  const q = L.items[L.i]; L.tries = 0; L.done = false; L.res = L.res || [];
  WR.view(`<div class="lesson-bg" style="background-image:${WR.bgCss("bg_math")}"></div>
    <div class="row" style="margin:6px 0 8px"><button class="btn ghost small" id="quitBtn">← Leave</button><b class="title">🔢 ${esc(L.title)}</b></div>
    <div class="card hud">${hud()}</div>
    <div class="lesson fade-in"><div class="card qcard mq">${q.pic ? `<div class="qpic mpicbox">${q.pic}</div>` : ""}<div class="qtext mqtext">${MW.html(q.q)}</div>
      ${q.kind === "mcq" ? `<div class="opts mopts">${q.options.map((o, k) => `<button class="opt" data-k="${k}"><span class="k">${"ABCD"[k]}</span>${MW.html(o)}</button>`).join("")}</div>` : padHTML(q, L.grade)}
      <div id="mexplain"></div></div>
      <div class="card side"><div class="petbox" id="lpet">${WR.petHTML()}</div><div class="bubble" id="lbubble">${esc(L.i === 0 ? "Let's solve it together! ✨" : WR.petMood())}</div>
      <div class="muted" id="lstats" style="font-size:.85rem;font-weight:800">⭐ ${L.starsEarned} earned · 🔥 combo ${L.combo}</div><button class="btn ghost small" id="hintBtn" style="margin-top:6px">💡 Hint</button></div></div>`);
  WR.$("#quitBtn").onclick = () => { const o = L; L = null; o.challenge ? WR.go("dojo") : WR.go("math"); };
  WR.$("#hintBtn").onclick = () => { if (L.done) return; showMsg("hint", `💡 ${MW.html(q.hint)}`); };
  if (q.kind === "mcq") document.querySelectorAll("#main .mopts .opt[data-k]").forEach(b => b.onclick = () => submit(q.options[+b.dataset.k], b));
  else bindPad(() => submit(WR.$("#mans").value));
}
function showMsg(cls, html) { const e = WR.$("#mexplain"); if (e) e.innerHTML = `<div class="explain ${cls === "hint" ? "" : cls}" style="${cls === "hint" ? "background:#FFF7D6" : ""}">${html}</div>`; }
function petReact(ok) {
  const box = WR.$("#lpet"), bub = WR.$("#lbubble"); if (!box) return;
  box.classList.remove("bounce", "cheer", "sad"); void box.offsetWidth;
  box.classList.add(ok ? (L.combo >= 3 ? "cheer" : "bounce") : "sad");
  bub.textContent = ok ? (L.combo >= 3 ? `${L.combo} in a row! Number wizard! 🔥` : CHEER[Math.floor(Math.random() * CHEER.length)]) : COMFORT[Math.floor(Math.random() * COMFORT.length)];
}
const steps = q => `<ol class="msteps">${q.steps.map(s => `<li>${MW.html(s)}</li>`).join("")}</ol>`;
function submit(val, btn) {
  if (!L || L.done) return;
  const q = L.items[L.i], res = MG.check(q, val);
  if (res.empty) return WR.toast("Type your answer first ✏️");
  if (res.bad) return WR.toast(q.kind === "time" ? "Type the time like 3:30 🕰️" : q.kind === "rem" ? "Type it like 7 r 2 ➗" : q.kind === "ratio" ? "Type it like 2:3 ⚖️" : "Hmm, I couldn't read that. Try a number like 12, 3/4 or 2.5 🧮", 2400);
  const s = WR.state, m = MW.st(); L.tries++;
  if (res.ok) {
    L.done = true; const pts = L.tries === 1 ? 1 : 0.5; L.pts += pts; L.res[L.i] = pts; L.correct++; s.totalCorrect++; s.totalAnswered++; m.correct = (m.correct || 0) + 1; m.answered = (m.answered || 0) + 1;
    if (L.tries === 1) { L.combo++; L.maxCombo = Math.max(L.maxCombo, L.combo); let gain = 1; if (L.combo % 3 === 0) gain++; L.starsEarned += gain; s.stars += gain; if (L.combo === 5) WR.questEvent("combo5"); } else L.combo = 0;
    WR.questEvent("correct10"); WR.sfx("good"); if (btn) btn.classList.add("right");
    const inp = WR.$("#mans"); if (inp) { inp.disabled = true; inp.classList.add("ok"); }
    document.querySelectorAll("#main .mopts .opt[data-k]").forEach(b => b.disabled = true);
    showMsg("good", `✅ ${L.tries === 1 ? "Correct!" : "Got it on the second try!"} <b>${MW.html(q.kind === "mcq" ? q.a : q.a)}</b><details class="mwork" ${L.tries > 1 ? "open" : ""}><summary>📜 Worked solution</summary>${steps(q)}</details>${nextBtn(true)}`);
  } else if (L.tries === 1) {
    WR.sfx("bad"); L.combo = 0; if (btn) { btn.classList.add("wrong"); btn.disabled = true; }
    const inp = WR.$("#mans"); if (inp) { inp.classList.add("shake"); setTimeout(() => inp.classList.remove("shake"), 450); inp.select && inp.select(); }
    showMsg("bad", `💭 Not quite — have another go!<div style="margin-top:4px">💡 ${MW.html(q.hint)}</div>`);
  } else {
    L.done = true; L.res[L.i] = 0; s.totalAnswered++; m.answered = (m.answered || 0) + 1; WR.sfx("bad");
    if (btn) btn.classList.add("wrong");
    document.querySelectorAll("#main .mopts .opt[data-k]").forEach(b => { b.disabled = true; if (q.options[+b.dataset.k] === q.a) b.classList.add("right"); });
    const inp = WR.$("#mans"); if (inp) inp.disabled = true;
    showMsg("bad", `💭 The answer is <b>${MW.html(q.a)}</b>.<div class="mwork open"><b>📜 Worked solution</b>${steps(q)}</div>${nextBtn(false)}`);
  }
  WR.save(); WR.renderTop(); petReact(res.ok);
  const h = document.querySelector(".hud"); if (h && L.done) { const i = L.i; L.i++; h.innerHTML = hud(); L.i = i; }
  const ls = WR.$("#lstats"); if (ls) ls.textContent = `⭐ ${L.starsEarned} earned · 🔥 combo ${L.combo}`;
  const nb = WR.$("#mnext"); if (nb) { nb.onclick = () => { if (L.i >= L.items.length - 1) finish(); else { L.i++; render(); } }; nb.scrollIntoView({ behavior: "smooth", block: "nearest" }); if (!coarse()) nb.focus({ preventScroll: true }); }
}
const nextBtn = ok => `<div class="row" style="margin-top:10px;justify-content:flex-end"><button class="btn ${ok ? "mint" : ""}" id="mnext">${L.i >= L.items.length - 1 ? "See results ✨" : "Next →"}</button></div>`;
MW.record = (key, score) => { const m = MW.st(), p = m.topics[key] || { best: 0, plays: 0 }; p.best = Math.max(p.best, score); p.plays++; p.last = Date.now(); m.topics[key] = p; m.lessons = (m.lessons || 0) + 1; WR.state.lessonsDone++; WR.save(); };
function finish() {
  const o = L, n = o.items.length, score = o.pts / n, crowns = WR.crowns(score), m = MW.st();
  const before = MW.crownsFor(o.key), bonus = crowns * 2; if (bonus) { WR.state.stars += bonus; o.starsEarned += bonus; }
  MW.record(o.key, score); m.xp = (m.xp || 0) + o.correct * 5 + 10;
  WR.questEvent("lesson2"); WR.questEvent("math1"); if (crowns === 3) WR.questEvent("perfect1");
  const streak = WR.bumpStreak(), lv = WR.petGainXP(o.correct * 6 + 10); WR.save(); WR.renderTop();
  L = null;
  WR.view(`<div class="card result fade-in">${mascot("res-sumi")}<h1>${crowns === 3 ? "Perfect! 👑" : crowns >= 1 ? "Well done! 🌟" : "Keep practising! 🌱"}</h1><div class="big">${crownRow(crowns)}</div>
    <h2>${o.correct} / ${n} solved${o.pts < o.correct ? ` <small class="muted">(${o.items.filter((_, k) => o.res[k] === 0.5).length} on the second try)</small>` : ""}</h2>
    <p class="muted" style="font-weight:800">⭐ ${o.starsEarned} stars earned · best combo ${o.maxCombo} · ✨ +${o.correct * 5 + 10} maths XP${streak ? ` · 🔥 streak ${WR.state.streak.count}` : ""}${crowns > before ? " · 🎉 new best!" : ""}</p>
    <div class="petbox bounce" style="margin:10px auto">${WR.petHTML()}</div><div class="bubble">${lv ? `I reached level ${lv.level}! 🎉` : crowns >= 2 ? "Maths is magic with you! 💖" : "Let's try again together! 🫶"}</div>
    <div class="row" style="justify-content:center;margin-top:16px"><button class="btn" id="again">↻ Play again</button><button class="btn mint" id="back">${o.challenge ? "Back to the Tower 🗼" : "Back to the Number Kingdom"}</button></div></div>`);
  if (crowns >= 2 || lv) WR.confetti(); WR.sfx(lv ? "level" : "good");
  WR.$("#again").onclick = () => MW.startLesson({ topic: o.topic, grade: o.grade, challenge: o.challenge });
  WR.$("#back").onclick = () => o.challenge ? WR.go("dojo") : WR.go("math");
}
MW._dbg = () => L && L.items[L.i];
MW.stop = () => { L = null; MW.stopDojo && MW.stopDojo(); MW.stopPlacement && MW.stopPlacement(); };
WR.stopMath = MW.stop;
})();
