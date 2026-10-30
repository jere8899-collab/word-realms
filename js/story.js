/* 📜 Storybook Chapters: one illustrated chapter per realm. Together they tell "The Starlight Storybook",
   in which the hero and their pet return six lost pages. Each chapter has 4 pages of levelled text
   (tap a sentence to hear it, tap a dotted word for its meaning, or 🔊 Read to me with the sentence highlighted),
   a comprehension question after every page and a final word check. Bonus skill: never needed to unlock.
   Saved in WR.state.stories = { done: { a1: { best, crowns, plays, at } }, words: { "meadow": "a1" }, reads: n }. */
(function () {
const WR = window.WR;
WR.STORY = { id: "story", name: "Story", icon: "📜", desc: "Storybook Chapters" };
const GL = /\[\[([^|\]]+)\|([^\]]+)\]\]/g;
const KIND = { fact: "🔎 Find it", infer: "🧠 Read between the lines", vocab: "💬 Word power", grammar: "🪄 Grammar in the story" };
let S = null;

const st = () => {
  const s = WR.state;
  s.stories = Object.assign({ done: {}, words: {}, reads: 0 }, s.stories || {});
  s.stories.done = s.stories.done || {}; s.stories.words = s.stories.words || {};
  return s.stories;
};
WR.storyState = st;
const petName = () => (WR.state.pet && WR.state.pet.name) || (WR.petInfo() || {}).name || "your pet";
const fill = t => String(t).replace(/\{hero\}/g, WR.state.name || "our hero").replace(/\{pet\}/g, petName());
const plain = t => fill(t).replace(GL, "$1");
const sentences = t => plain(t).match(/[^.!?]+[.!?]+[”’"]?\s*|[^.!?]+$/g).map(x => x.trim()).filter(Boolean);
WR.Story = { fill, plain, sentences };

WR.loadStory = async lvl => {
  const k = lvl + "/story";
  if (!WR.data[k]) WR.data[k] = await fetch("data/" + k + ".json").then(r => { if (!r.ok) throw new Error(k); return r.json(); });
  return WR.data[k];
};
WR.storyTile = rid => {
  const d = st().done[rid], n = WR.realms.findIndex(r => r.id === rid) + 1;
  const cr = d ? "👑".repeat(d.crowns) + `<span style="opacity:.2">${"👑".repeat(3 - d.crowns)}</span>` : '<span class="muted" style="font-size:.8rem">not read yet</span>';
  return `<div class="card skill-card story-tile" data-story="1"><span class="bonus-tag">Bonus</span><img class="ico story-ico" src="assets/web/story_${rid}.webp" onerror="this.onerror=null;this.src='assets/stories/story_${rid}.jpg'" alt=""><h3>Story</h3>
    <div class="muted" style="font-size:.85rem;font-weight:700">Chapter ${n} of the Starlight Storybook</div><div class="crowns">${cr}</div><div class="waiting-tag">${d ? "📄 Page restored!" : "📜 A new chapter waits"}</div></div>`;
};
WR.storyPagesFound = () => Object.keys(st().done).length;

/* ---------- reading view ---------- */
function pageHTML(pg) {
  // sentences become tappable spans; [[word|meaning]] becomes a glossary button inside them
  let html = "", si = 0;
  const raw = fill(pg.text);
  const parts = raw.match(/(?:[^.!?\[]|\[\[[^\]]*\]\])+[.!?]+[”’"]?\s*|(?:[^.!?\[]|\[\[[^\]]*\]\])+$/g) || [raw];
  parts.forEach(p => {
    const inner = WR.esc(p.trim()).replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, (m, w, g) => `<button class="gloss" data-w="${w}" data-g="${g}">${w}</button>`);
    html += `<span class="sent" data-i="${si++}">${inner}</span> `;
  });
  return html;
}
function render() {
  const ch = S.ch, r = S.realm, last = S.page >= 4, pg = ch.pages[S.page];
  const q = last ? ch.final : pg.q;
  if (!S.opts[S.page]) S.opts[S.page] = WR.shuffle(q.options.map(o => fill(o)));
  const opts = S.opts[S.page], ans = S.answers[S.page];
  const dots = [0, 1, 2, 3, 4].map(i => `<span class="sdot ${i < S.page ? "done" : i === S.page ? "on" : ""}">${i < 4 ? i + 1 : "★"}</span>`).join("");
  WR.view(`<div class="fade-in story-screen"><div class="row" style="justify-content:space-between;margin:6px 0 10px">
      <button class="btn ghost small" id="storyQuit">← ${WR.esc(r.name)}</button><div class="sdots">${dots}</div></div>
    <div class="card story-card">
      <div class="story-head"><span class="lvl-badge">${r.level}</span><b class="title">📜 Chapter ${S.num}: ${WR.esc(ch.title)}</b><div class="muted story-focus">Language focus: ${WR.esc(ch.focus)}</div></div>
      <div class="story-pic ${S.page ? "small" : ""}"><img src="assets/web/${ch.img}.webp" onerror="this.onerror=null;this.src='assets/stories/${ch.img}.jpg'" alt="Chapter ${S.num} illustration"></div>
      ${last ? `<p class="story-text" style="text-align:center"><b>✨ All four pages read! One last word check to restore the page.</b></p>` : `
      <div class="row story-tools"><button class="btn small mint" id="readAll">🔊 Read to me</button><button class="btn ghost small" id="readSlow">🐢 Slow</button><span class="muted" style="font-size:.78rem;font-weight:800">Tap a sentence to hear it · tap a <u class="gl-hint">dotted word</u> for its meaning</span></div>
      <p class="story-text" id="storyText">${pageHTML(pg)}</p>`}
      <div class="story-q"><div class="kind-tag">${KIND[q.kind] || "💬 Question"}</div><h3 class="q">${WR.esc(fill(q.q))}</h3>
        <div class="opts">${opts.map((o, k) => `<button class="opt ${ans ? (o === fill(q.options[q.answer]) ? "right" : o === ans.chosen ? "wrong" : "") : ""}" data-k="${k}" ${ans ? "disabled" : ""}><span class="k">${"ABCD"[k]}</span>${WR.esc(o)}</button>`).join("")}</div>
        <div id="storyFb">${ans ? fbHTML(q, ans.ok) : ""}</div></div>
    </div></div>`);
  WR.$("#storyQuit").onclick = () => WR.go("realm", r.id);
  if (!last) {
    WR.$("#readAll").onclick = () => readAll(WR.state.settings.rate);
    WR.$("#readSlow").onclick = () => readAll(0.65);
    document.querySelectorAll(".sent").forEach(s => s.onclick = e => { if (e.target.closest(".gloss")) return; hl(+s.dataset.i); Speech.speak(s.textContent, WR.state.settings.rate, () => hl(-1)); });
    document.querySelectorAll(".gloss").forEach(b => b.onclick = e => { e.stopPropagation(); gloss(b); });
  }
  document.querySelectorAll(".opt").forEach(b => b.onclick = () => choose(b, q, opts));
  const nx = WR.$("#storyNext"); if (nx) nx.onclick = next;
}
const fbHTML = (q, ok) => `<div class="story-fb ${ok ? "good" : "bad"}"><b>${ok ? "✅ Yes!" : "💭 Not quite."}</b> ${WR.esc(fill(q.explain))}</div>
  <div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn" id="storyNext">${S.page >= 4 ? "📄 Restore the page" : "Turn the page →"}</button></div>`;
function hl(i) { document.querySelectorAll(".sent").forEach(s => s.classList.toggle("reading", +s.dataset.i === i)); }
function readAll(rate) {
  const ss = [...document.querySelectorAll(".sent")]; let i = 0; const tok = S.tok = (S.tok || 0) + 1;
  st().reads++; WR.save();
  const step = () => { if (!S || S.tok !== tok) return; if (i >= ss.length) return hl(-1); hl(i); Speech.speak(ss[i].textContent, rate, () => { i++; step(); }); };
  step();
}
function gloss(b) {
  const w = b.dataset.w, g = b.dataset.g, words = st().words;
  document.querySelectorAll(".gloss-pop").forEach(x => x.remove());
  const isNew = !words[w]; words[w] = S.realm.id; WR.save();
  const pop = document.createElement("div"); pop.className = "gloss-pop";
  pop.innerHTML = `<b>${WR.esc(w)}</b> <button class="btn ghost small" data-say="1">🔊</button><div>${WR.esc(g)}</div>${isNew ? '<div class="muted" style="font-size:.72rem;font-weight:800">✨ Added to your word list</div>' : ""}`;
  (WR.$("#storyText") || b).insertAdjacentElement("afterend", pop);
  pop.querySelector("[data-say]").onclick = e => { e.stopPropagation(); Speech.speak(w + ". " + g, WR.state.settings.rate); };
  pop.onclick = e => { e.stopPropagation(); pop.remove(); };
  b.classList.add("seen"); Speech.speak(w, WR.state.settings.rate);
}
function choose(btn, q, opts) {
  if (S.answers[S.page]) return;
  const right = fill(q.options[q.answer]), chosen = opts[+btn.dataset.k], ok = chosen === right;
  S.answers[S.page] = { chosen, ok };
  if (ok) { S.correct++; WR.sfx("good"); WR.questEvent("correct10"); }
  else {
    WR.sfx("bad");
    const pg = S.ch.pages[Math.min(S.page, 3)];
    WR.Garden && WR.Garden.plant({ type: "mcq", q: "📜 " + fill(q.q), options: q.options.map(fill), correct: right, explain: fill(q.explain),
      passage: S.page < 4 ? { title: `Chapter ${S.num}: ${S.ch.title}`, text: plain(pg.text) } : null }, S.realm.id, "story");
  }
  WR.countAnswer(ok, S.realm.id + "/story"); WR.save();
  WR.petReact && WR.petReact(ok);
  Speech.stop(); render();
}
function next() {
  Speech.stop();
  if (S.page < 4) { S.page++; return render(); }
  finish();
}
function finish() {
  const rec = st(), rid = S.realm.id, prev = rec.done[rid], score = S.correct / 5, crowns = WR.crowns(score);
  let stars = 0;
  if (!prev) stars += S.correct + 3;                                  // first read: 1⭐ per right answer + 3⭐ for restoring the page
  const gain = Math.max(0, crowns - (prev ? prev.crowns : 0)); stars += gain * 2;  // new crowns pay 2⭐ each
  rec.done[rid] = { best: Math.max(score, prev ? prev.best : 0), crowns: Math.max(crowns, prev ? prev.crowns : 0), plays: (prev ? prev.plays : 0) + 1, at: Date.now() };
  WR.state.lessonsDone++; WR.save();
  if (stars) WR.addStars(stars);
  const lv = WR.petGainXP ? WR.petGainXP(S.correct * 2 + 2) : null;
  WR.questEvent("story1"); WR.questEvent("read1"); WR.activityDone();
  if (crowns === 3) WR.questEvent("perfect1");
  const found = WR.storyPagesFound(), r = S.realm, num = S.num, ch = S.ch;
  WR.sfx("level"); if (crowns >= 2) WR.confetti();
  WR.view(`<div class="fade-in center story-done"><div class="card" style="max-width:640px;margin:0 auto">
    <div class="story-pic"><img src="assets/web/${ch.img}.webp" onerror="this.onerror=null;this.src='assets/stories/${ch.img}.jpg'" alt=""></div>
    <h2 style="margin:.4em 0 .1em">📄 Page ${num} restored!</h2><p class="muted" style="font-weight:800;margin:0">Chapter ${num}: ${WR.esc(ch.title)}</p>
    <div class="fb-crowns">${"👑".repeat(crowns)}<span style="opacity:.2">${"👑".repeat(3 - crowns)}</span></div>
    <p><b>${S.correct}/5</b> questions right${stars ? ` · <b>+${stars} ⭐</b>` : " · stars already collected (new crowns still pay)"}${lv ? ` · ${WR.esc(petName())} reached Lv ${lv.level}!` : ""}</p>
    <div class="book-pages">${WR.realms.map((x, i) => `<span class="bp ${st().done[x.id] ? "on" : ""}" title="${x.name}">${st().done[x.id] ? "📄" : "▫️"}<small>${i + 1}</small></span>`).join("")}</div>
    <p class="muted" style="font-weight:800">${found >= 6 ? "🌟 The Starlight Storybook is whole again! You finished the tale." : `The Starlight Storybook has ${found} of 6 pages. ${num < 6 ? "The next chapter waits in the next realm." : "Find the missing chapters in the other realms."}`}</p>
    <div class="row" style="justify-content:center"><button class="btn ghost" id="again">📖 Read again</button><button class="btn" id="toRealm">Back to ${WR.esc(r.name)}</button></div></div></div>`);
  WR.$("#again").onclick = () => WR.startStory(r.id);
  WR.$("#toRealm").onclick = () => WR.go("realm", r.id);
  S = null;
}
WR.screens.story = async rid => {
  const ch = await WR.loadStory(rid);
  S = { realm: WR.realms.find(x => x.id === rid), ch, num: WR.realms.findIndex(x => x.id === rid) + 1, page: 0, correct: 0, answers: {}, opts: {} };
  render();
};
WR.startStory = rid => WR.go("story", rid);
WR.stopStory = () => { if (S) { S.tok = -1; } document.querySelectorAll(".gloss-pop").forEach(x => x.remove()); };
WR.openStorybook = () => {
  const d = st().done;
  WR.modal(`<h2 style="margin-top:0">📜 The Starlight Storybook</h2><p class="muted" style="font-weight:700">The wind scattered its six pages across the realms. Read each chapter to bring a page home.</p>
    <div class="book-list">${WR.realms.map((r, i) => { const u = WR.isUnlocked(i), x = d[r.id];
      return `<button class="book-row ${u ? "" : "locked"}" data-r="${r.id}" ${u ? "" : "disabled"}><img src="assets/web/story_${r.id}.webp" onerror="this.onerror=null;this.src='assets/stories/story_${r.id}.jpg'" alt=""><span><b>Chapter ${i + 1}</b> · ${r.level} ${r.emoji}<br><small>${x ? "📄 restored " + "👑".repeat(x.crowns) : u ? "Ready to read" : "🔒 Unlock " + WR.esc(r.name)}</small></span></button>`; }).join("")}</div>
    <p class="muted" style="font-size:.8rem;font-weight:800">📚 ${Object.keys(st().words).length} story words learned</p>`, (bg, close) => {
    bg.querySelectorAll(".book-row:not(.locked)").forEach(b => b.onclick = () => { close(); WR.startStory(b.dataset.r); });
  });
};
})();
