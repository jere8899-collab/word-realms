/* 🔀 Spell Swap (English follow-up, 1 Nov): "same meaning, new words" sentence transformations for every realm, the
   productive grammar task of the Cambridge exams. Read sentence 1, then finish sentence 2 so it means the same.
   Data: tools/c_swap.py → data/<level>/swap.json (3 books × 8 items per level, 144 in all), validated by build_data.py.
     A1/A2  change-it tasks (not true, question, plural, past, comparative, rules…) built with word tiles
     B1     "no more than three words" (the classic Preliminary transformation), typed
     B2     a 🔑 KEY WORD that must not change, 2–5 words (B2 First Use of English Part 4)
     C1     key word, 3–6 words (C1 Advanced Part 4)        C2  key word, 3–8 words (C2 Proficiency Part 4)
   Marking (canon(), the same rules as build_data.py): case, punctuation and curly quotes don't matter, contractions equal
   their long forms (don't = do not) and count as two words, as in the exams; if the child types the whole sentence, the
   words around the gap are taken off. A missing key word, too many or too few words is a friendly nudge, not a try.
   A first miss gives a 💡 hint (first word + number of words) and a second try; a second miss shows the answer.
   Every item has a rule + example (tip) and a narrator recording of both sentences (tools/build_voice.py).
   Stars (WR.finishUnit, once ever): first finish of a book 1⭐ per right answer (½ for a second try) + 3⭐, new crowns 2⭐ each;
   replays pay only new crowns. Answers → WR.countAnswer ("<level>/swap" in the Learning Report), the end → WR.activityDone.
   Save: WR.state.swap = { done: { "b2.1": { best, crowns, plays, at } }, rounds, lvl } inside wordRealms.save.v1 (cloud-synced;
   older saves gain the block through WR.BLOCKS in js/core.js). */
(function () {
const WR = window.WR, esc = WR.esc;
WR.SWAP = { id: "swap", name: "Spell Swap", icon: "🔀", desc: "Same meaning, new words" };
const LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"], N_WORDS = ["", "one", "two", "three", "four", "five", "six", "seven", "eight"];
const HOW = {
  a1: "Change the sentence! Tap the word tiles to fill the gap.",
  a2: "Change the sentence! Tap the word tiles to fill the gap.",
  b1: "Finish sentence 2 so it means the same as sentence 1. Use no more than three words.",
  b2: "Use the 🔑 key word and don't change it. Write two to five words.",
  c1: "Use the 🔑 key word and don't change it. Write three to six words.",
  c2: "Use the 🔑 key word and don't change it. Write three to eight words."
};
const EXAM = { a1: "Cambridge Starters–Flyers style", a2: "A2 Key style", b1: "B1 Preliminary style", b2: "B2 First, Use of English Part 4", c1: "C1 Advanced, Use of English Part 4", c2: "C2 Proficiency, Use of English Part 4" };
const st = () => WR.block("swap");
const load = lvl => WR.bank(lvl, "swap");
const set = lvl => WR.data[lvl + "/swap"];

/* ---------- marking ---------- */
// lower case, no punctuation, contractions spread out (they count as two words in Cambridge Part 4); mirrors swap_canon() in build_data.py
function canon(t) {
  t = String(t == null ? "" : t).toLowerCase().replace(/[‘’`´]/g, "'").replace(/[^a-z0-9' ]+/g, " ");
  t = t.replace(/\bcan't\b|\bcannot\b/g, "can not").replace(/\bwon't\b/g, "will not").replace(/\bshan't\b/g, "shall not")
    .replace(/n't\b/g, " not").replace(/'m\b/g, " am").replace(/'re\b/g, " are").replace(/'ve\b/g, " have").replace(/'ll\b/g, " will")
    .replace(/'d\b/g, " 'd").replace(/\b(it|he|she|that|there|what|who|here|where|let)'s\b/g, "$1 's");
  return t.split(/\s+/).filter(Boolean).join(" ");
}
const count = t => canon(t) ? canon(t).split(" ").length : 0;
// a child who types the whole of sentence 2 still gets marked on the gap
function gapPart(user, b) {
  let u = canon(user); const [pre, post] = b.split("___").map(canon);
  if (pre && (u + " ").startsWith(pre + " ")) u = u.slice(pre.length).trim();
  if (post && (" " + u).endsWith(" " + post)) u = u.slice(0, u.length - post.length).trim();
  return u;
}
// → { ok, why: null | "empty" | "key" | "long" | "short" | "wrong", n }
function check(item, user, rules) {
  const u = gapPart(user, item.b), n = u ? u.split(" ").length : 0;
  if (!u) return { ok: false, why: "empty", n };
  if (item.ans.some(a => canon(a) === u)) return { ok: true, why: null, n };
  if (rules.key && !(" " + u + " ").includes(" " + canon(item.cue) + " ")) return { ok: false, why: "key", n };
  if (rules.mode === "type" && n > rules.max) return { ok: false, why: "long", n };
  if (rules.mode === "type" && n < rules.min) return { ok: false, why: "short", n };
  return { ok: false, why: "wrong", n };
}
const nudge = (why, item, r) => why === "empty" ? (r.mode === "tiles" ? "Tap some word tiles first 😊" : "Type the missing words first 😊")
  : why === "key" ? `Remember to use the key word <b>${esc(item.cue)}</b>, and don't change it 🔑`
  : why === "long" ? `That's too many words. Use ${N_WORDS[r.min]} to ${N_WORDS[r.max]} words (don't = two words) ✂️`
  : `That's not enough words. Use ${r.min === r.max ? N_WORDS[r.min] : N_WORDS[r.min] + " to " + N_WORDS[r.max]} words ✏️`;
WR.Swap = { canon, count, check, gapPart, LEVELS };

/* ---------- entry points: bonus tile in every realm ---------- */
const booksDone = lvl => [1, 2, 3].filter(k => st().done[lvl + "." + k]).length;
const crownsAt = lvl => [1, 2, 3].reduce((a, k) => a + ((st().done[lvl + "." + k] || {}).crowns || 0), 0);
WR.swapTile = rid => {
  const n = booksDone(rid);
  return WR.bonusTile({ cls: "swap-tile", data: "swap", ico: '<span class="ico">🔀</span>', title: "Spell Swap", desc: "Same meaning, new words",
    crowns: n ? WR.crownRow(Math.round(crownsAt(rid) / 3)) : WR.crownCell(null, "not played"), tag: n ? `🔀 ${n}/3 books` : "✨ New adventure!" });
};
WR.openSwap = rid => WR.go("swap", rid || st().lvl || (WR.continueTarget() || { realm: { id: "a1" } }).realm.id);
WR.startSwap = (lvl, book) => WR.go("swapRound", { lvl, book });

/* ---------- the book shelf (hub) ---------- */
WR.screens.swap = rid => {
  const rec = st(); rec.lvl = rid; WR.save();
  const realm = WR.realms.find(r => r.id === rid) || WR.realms[0];
  WR.view(`<div class="fade-in sw-hub"><div class="row lesson-top" style="margin:6px 0 8px"><button class="btn ghost small" id="swBack">← ${esc(realm.name)}</button><b class="title">🔀 Spell Swap</b></div><div class="card center muted">Opening the spell books… ✨</div></div>`);
  WR.$("#swBack").onclick = () => WR.go("realm", rid);
  load(rid).then(() => { if (WR.current() === "swap" && st().lvl === rid) hub(rid); }).catch(() => WR.toast("📴 Couldn't open the spell books. Check the internet and try again."));
};
function hub(rid) {
  const d = set(rid), realm = WR.realms.find(r => r.id === rid), done = st().done;
  WR.view(`<div class="fade-in sw-hub"><div class="row lesson-top" style="margin:6px 0 8px"><button class="btn ghost small" id="swBack">← ${esc(realm.name)}</button><b class="title">🔀 Spell Swap</b></div>
    ${WR.levelTabs(rid)}
    <div class="card sw-intro"><div class="ch-pet">${WR.petHTML()}</div><div style="flex:1;min-width:0"><h2 style="margin:0">Same meaning, new words! ✨</h2>
      <p class="muted sw-how">${HOW[rid]}</p></div></div>
    <div class="sw-books">${d.books.map(b => { const x = done[b.id];
      return `<button class="card sw-book ${x ? "done" : ""}" data-b="${b.id}"><span class="sw-bico">${b.icon}</span><span class="sw-btxt"><b>${esc(b.name)}</b><small>${esc(b.focus)}</small></span>
        <span class="sw-bcr">${x ? WR.crownRow(x.crowns) : '<span class="pill">▶ Play</span>'}</span></button>`; }).join("")}</div>
    <p class="muted ph-note">👪 Grown-ups: ${EXAM[rid]} sentence transformations (${d.books.length * 8} at ${rid.toUpperCase()}). Contractions count as two words, as in the exams. Every answer comes with the rule and an example.</p></div>`);
  WR.$("#swBack").onclick = () => WR.go("realm", rid);
  WR.bindLevelTabs("swap");
  document.querySelectorAll(".sw-book").forEach(b => b.onclick = () => WR.startSwap(rid, b.dataset.b));
}

/* ---------- a round: the 8 items of one book ---------- */
let S = null;
WR.stopSwap = () => { S = null; };
WR.Swap._s = () => S;                                    // the running round (tests)
WR.screens.swapRound = ({ lvl, book }) => {
  WR.view(`<div class="card center muted" style="margin-top:20px">✨ Opening the spell book…</div>`);
  load(lvl).then(d => {
    if (WR.current() !== "swapRound") return;
    const bk = d.books.find(b => b.id === book) || d.books[0];
    S = { lvl, d, bk, items: WR.shuffle(bk.items), n: 0, right: 0, second: 0, tries: 0, built: [], typed: "", done: null, log: [] };
    WR.setFocus && WR.setFocus(true);
    render(true);
  }).catch(() => WR.go("swap", lvl));
};
const item = () => S.items[S.n];
const rulesOf = () => ({ mode: S.d.mode, min: S.d.min, max: S.d.max, key: S.d.key });
function pool(it) { if (!it._pool) it._pool = WR.shuffle(it.ans[0].split(" ").concat(it.x || [])); return it._pool; }
const EMPTY = "\u00a0".repeat(14);
const builtText = it => S.built.map(k => pool(it)[k]).join(" ");
function gapHTML(it) {
  const fill = S.d.mode === "tiles" ? S.built.map((k, i) => `<button class="sw-chip" data-i="${i}" aria-label="Take back ${esc(pool(it)[k])}">${esc(pool(it)[k])}</button>`).join("") : esc(S.typed);
  const [pre, post] = it.b.split("___");
  return `${esc(pre)}<span class="sw-gap${S.d.mode === "type" ? " txt" : ""}${fill ? " filled" : ""}" id="swGap">${fill || EMPTY}</span>${esc(post)}`;
}
function render(auto) {
  const it = item(), r = rulesOf(), typed = r.mode === "type";
  WR.view(`<div class="fade-in sw-round"><div class="row lesson-top" style="justify-content:space-between;margin:6px 0 8px"><button class="btn ghost small" id="swQuit">← Leave</button><div class="ph-progress"><div class="prog"><i style="width:${S.n / S.items.length * 100}%"></i></div><b>${S.n + 1}/${S.items.length}</b></div></div>
    <div class="card sw-card"><div class="ph-head"><span class="lvl-badge">${S.lvl.toUpperCase()}</span><b>${S.bk.icon} ${esc(S.bk.name)}</b></div>
      <div class="sw-s1"><span class="sw-num">1</span><p>${esc(it.a)}</p><button class="btn ph-say" id="swSay" aria-label="Hear sentence 1">🔊</button></div>
      <div class="sw-cue">${r.key ? `<span class="sw-key" aria-label="Key word">🔑 ${esc(it.cue)}</span><small>${N_WORDS[r.min]}–${N_WORDS[r.max]} words</small>` : `<span class="sw-ins">🪄 ${esc(it.cue)}</span>`}</div>
      <div class="sw-s2"><span class="sw-num">2</span><p id="swS2">${gapHTML(it)}</p></div>
      ${typed ? `<div class="sw-type"><input class="input" id="swIn" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Type the missing words…" value="${esc(S.typed)}" ${S.done ? "disabled" : ""}><small class="muted" id="swCount">${count(gapPart(S.typed, it.b))} words</small></div>`
        : `<div class="tiles sw-pool${auto ? "" : " still"}" id="swPool">${pool(it).map((w, k) => `<button class="tile sw-tile" data-p="${k}" ${S.built.includes(k) || S.done ? "disabled" : ""}>${esc(w)}</button>`).join("")}</div>`}
      <div id="swFb">${fbHTML()}</div>
      <div class="row sw-acts">${S.done ? `<button class="btn" id="swNext">${S.n + 1 < S.items.length ? "Next →" : "🌟 Finish"}</button>`
        : `${typed ? "" : '<button class="btn ghost small" id="swClear">↩ Clear</button>'}<button class="btn mint" id="swCheck">✓ Check</button>`}</div></div></div>`);
  bind(it);
  if (auto) setTimeout(() => S && item() === it && WR.say(it.a), 250);
}
function fbHTML() {
  const f = S.fb; if (!f) return "";
  if (f.kind === "nudge") return `<div class="story-fb sw-fb nudge">${f.html}</div>`;
  const it = item();
  const tiles = S.d.mode === "tiles", n = tiles ? it.ans[0].split(" ").length : count(it.ans[0]);   // tiles: how many tiles; typed: exam word count
  if (f.kind === "hint") return `<div class="story-fb sw-fb bad"><b>💭 Not quite. Try again!</b> 💡 It starts with “<b>${esc(it.ans[0].split(" ")[0])}…</b>” (${N_WORDS[n] || n} ${tiles ? (n > 1 ? "tiles" : "tile") : n > 1 ? "words" : "word"}).</div>`;
  return `<div class="story-fb sw-fb ${f.ok ? "good" : "bad"}"><b>${f.ok ? "✅ Yes!" : "💭 Here's the answer:"}</b> ${esc(it.say)}<div class="sw-tip">💡 ${esc(it.tip)}</div>
    ${it.ans.length > 1 ? `<div class="sw-also muted">Also right: ${it.ans.slice(1).map(a => "“" + esc(a) + "”").join(", ")}</div>` : ""}</div>`;
}
function bind(it) {
  WR.$("#swQuit").onclick = () => WR.go("swap", S.lvl);
  WR.$("#swSay").onclick = () => WR.say(it.a);
  const nx = WR.$("#swNext"); if (nx) { nx.onclick = next; return; }
  WR.$("#swCheck").onclick = submit;
  const inp = WR.$("#swIn");
  if (inp) {
    inp.oninput = () => { S.typed = inp.value; const g = WR.$("#swGap"); g.textContent = inp.value || EMPTY; g.classList.toggle("filled", !!inp.value); WR.$("#swCount").textContent = count(gapPart(inp.value, it.b)) + " words"; };
    inp.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); submit(); } };
  }
  document.querySelectorAll("#swPool .sw-tile").forEach(b => b.onclick = () => { const k = +b.dataset.p; if (S.built.includes(k)) return; S.built.push(k); S.fb = null; WR.sfx("tap"); render(); });
  document.querySelectorAll("#swGap .sw-chip").forEach(b => b.onclick = () => { S.built.splice(+b.dataset.i, 1); S.fb = null; render(); });
  const cl = WR.$("#swClear"); if (cl) cl.onclick = () => { S.built = []; S.fb = null; render(); };
}
function submit() {
  if (!S || S.done) return;
  const it = item(), r = rulesOf(), user = r.mode === "tiles" ? builtText(it) : S.typed, res = check(it, user, r);
  if (res.why && res.why !== "wrong") { S.fb = { kind: "nudge", html: nudge(res.why, it, r) }; WR.sfx("tap"); return render(); }   // not a try
  S.tries++;
  if (S.tries === 1) WR.countAnswer(res.ok, S.lvl + "/swap");       // the report counts the first try
  if (res.ok) { if (S.tries === 1) S.right++; else S.second++; S.done = { ok: true }; WR.sfx("good"); WR.questEvent("correct10"); }
  else if (S.tries === 1) { S.fb = { kind: "hint" }; WR.sfx("bad"); WR.petReact && WR.petReact(false); S.built = []; return render(); }
  else { S.done = { ok: false }; WR.sfx("bad"); }
  S.log.push({ id: it.id, ok: res.ok, tries: S.tries });
  S.fb = { kind: "result", ok: res.ok };
  WR.petReact && WR.petReact(res.ok); WR.save();
  if (!res.ok) S.built = it.ans[0].split(" ").map(w => pool(it).indexOf(w));   // show the answer in the gap
  if (r.mode === "type") S.typed = res.ok ? it.ans.find(a => canon(a) === gapPart(S.typed, it.b)) : it.ans[0];
  render();
  WR.say(it.say);
}
function next() {
  if (S.n + 1 < S.items.length) { S.n++; S.built = []; S.typed = ""; S.tries = 0; S.done = null; S.fb = null; return render(true); }
  finish();
}
function finish() {
  const r = S, rec = st(); rec.rounds++;
  const got = r.right + r.second * 0.5, { crowns, stars } = WR.finishUnit(rec.done, r.bk.id, got, r.items.length, "swap");
  const lv = WR.petGainXP ? WR.petGainXP(r.right * 2 + r.second + 2) : null;
  WR.questEvent("swap1"); WR.activityDone();
  if (crowns === 3) WR.questEvent("perfect1");
  WR.Collect && WR.Collect.check();
  WR.sfx("level"); if (crowns >= 2) WR.confetti();
  S = null;
  const books = r.d.books, i = books.indexOf(r.bk), nb = books[i + 1];
  WR.view(`<div class="fade-in center sw-done"><div class="card" style="max-width:560px;margin:0 auto"><div class="ph-pet big">${WR.petHTML()}</div>
    <h2 style="margin:.3em 0 .1em">${r.bk.icon} ${esc(r.bk.name)} done!</h2><div class="fb-crowns">${WR.crownRow(crowns)}</div>
    <p><b>${r.right}/${r.items.length}</b> right first time${r.second ? ` · ${r.second} on the second try` : ""}${stars ? ` · <b>+${stars} ⭐</b>` : " · stars already collected (new crowns still pay)"}${lv ? ` · ${esc(WR.state.pet.name)} reached Lv ${lv.level}!` : ""}</p>
    <div class="row" style="justify-content:center;gap:8px;flex-wrap:wrap"><button class="btn ghost" id="swAgain">↻ Play again</button>${nb ? `<button class="btn mint" id="swNextB">Next: ${nb.icon} ${esc(nb.name)} →</button>` : ""}<button class="btn ghost" id="swShelf">🔀 Books</button></div></div></div>`);
  WR.$("#swAgain").onclick = () => WR.startSwap(r.lvl, r.bk.id);
  const n = WR.$("#swNextB"); if (n) n.onclick = () => WR.startSwap(r.lvl, nb.id);
  WR.$("#swShelf").onclick = () => WR.go("swap", r.lvl);
}

/* ---------- 🏷️ sticker page ---------- */
const all = () => Object.entries(st().done);
const STK = [
  { id: "first", icon: "🔀", name: "First Swap", how: "Finish a Spell Swap book", test: () => all().length >= 1 },
  { id: "star", icon: "👑", name: "Swap Star", how: "Get 3 crowns on a Spell Swap book", test: () => all().some(([, x]) => x.crowns === 3) },
  { id: "key", icon: "🔑", name: "Key Word Keeper", how: "Finish a B2, C1 or C2 key word book", test: () => all().some(([k]) => /^(b2|c1|c2)\./.test(k)) },
  { id: "shelf", icon: "📚", name: "Full Shelf", how: "Finish all 3 Spell Swap books in one realm", test: () => LEVELS.some(l => booksDone(l) === 3) },
  { id: "grand", icon: "🌟", name: "Grand Swapper", how: "Finish 9 Spell Swap books", test: () => all().length >= 9 }
];
if (WR.Collect) WR.Collect.addPages(() => [{ id: "swap", icon: "🔀", title: "Spell Swap", name: "Spell Swap", bg: "bg_c1", defs: STK }]);
})();
