/* 📜 Storybook Chapters: every realm has a shelf of illustrated chapters (data/<level>/story.json → chapters[]).
   Each realm's chapter 1 together tells "The Starlight Storybook", in which the hero and their pet return six lost pages;
   chapters 2+ carry on each realm's tale and open one after another. Each chapter has 4 pages of levelled text
   (tap a sentence to hear it, tap a dotted word for its meaning, or 🔊 Read to me with the sentence highlighted),
   a comprehension question after every page and a final word check. Bonus skill: never needed to unlock.
   Saved in WR.state.stories = { done: { a1: { best, crowns, plays, at }, "a1.2": {…} }, words: { "meadow": "a1" }, reads: n }
   (chapter 1 keeps the plain realm id, so older saves, the report and the sticker book read it unchanged). */
(function () {
const WR = window.WR;
WR.STORY = { id: "story", name: "Story", icon: "📜", desc: "Storybook Chapters" };
const GL = /\[\[([^|\]]+)\|([^\]]+)\]\]/g;
const KIND = { fact: "🔎 Find it", infer: "🧠 Read between the lines", vocab: "💬 Word power", grammar: "🪄 Grammar in the story" };
let S = null;
const LAST = 4;   // pages per chapter; the word check comes after the last page

const st = () => WR.block("stories");
WR.storyState = st;
/* 🎙️ Story names (Jeremy, 2026-11-08): the Storybook hero is always Nova, and the pet is that species'
   storybook name (Puffbun, Mochi Fox, …), never the name the child typed. Both are recorded (af_heart), so a
   renamed hero or pet does not switch the narrator to the device voice. The saved name is not changed.
   Only the {hero} and {pet} tokens are filled. A function replacement keeps a typed "$&" as typed. */
const STORY_HERO = "Nova";
const storyPet = () => (WR.petInfo() || {}).name || "Puffbun";
const petCalled = () => String((WR.state.pet && WR.state.pet.name) || "").trim() || storyPet();
const fill = t => String(t).replace(/\{hero\}/g, () => STORY_HERO).replace(/\{pet\}/g, () => storyPet());
const plain = t => fill(t).replace(GL, "$1");
const sentences = t => plain(t).match(/[^.!?]+[.!?]+[”’"]?\s*|[^.!?]+$/g).map(x => x.trim()).filter(Boolean);
WR.Story = { fill, plain, sentences, hero: STORY_HERO, petName: storyPet };

// R16: the chapter's grammar focus in child words (the teacher terms are in 👪 Grown-ups → 📚 What the games teach)
const KID_FOCUS = { a1: "<i>there is</i>, <i>there are</i> and <i>can</i>", a2: "telling what happened, and <i>bigger</i>, <i>better</i>", b1: "what was happening, and <i>if … will</i>",
  b2: "what had happened, and <i>should have</i>", c1: "surprising word orders and gentle opinions", c2: "reading between the lines" };
WR.addGrownNote && WR.addGrownNote("story", "📜 Story", rid => WR.loadStory(rid).then(d => `Storybook for ${rid.toUpperCase()}: ${d.chapters.length} chapters, opened in order. Language focus: ${d.chapters[0].focus || "-"}. Five reading questions per chapter with a reason for every answer.`));
// the same loader as every other bank (WR.data cache + one fetch), so a chapter and a lesson can't each keep a copy
WR.loadStory = lvl => WR.bank(lvl, "story");
// one chapter's picture: the light WebP with the original JPG as a fallback
const pic = (img, alt = "") => `<img src="assets/web/${img}.webp" onerror="this.onerror=null;this.src='assets/stories/${img}.jpg'" alt="${alt}">`;
const chKey = (rid, n) => n > 1 ? rid + "." + n : rid;          // save key of chapter n
const chDone = (rid, n) => st().done[chKey(rid, n)];
const chOpen = (rid, n) => n === 1 || !!chDone(rid, n - 1);     // chapters open one after another
const chCount = rid => Math.max(1, Math.round(((WR.counts && WR.counts.counts && WR.counts.counts[rid + "/story"]) || 5) / 5));
const chRead = rid => { let n = 0; for (let i = 1; i <= chCount(rid); i++) if (chDone(rid, i)) n++; return n; };
WR.storyChapters = { key: chKey, done: chDone, open: chOpen, count: chCount, read: chRead };
WR.storyTile = rid => {
  const d = st().done[rid], total = chCount(rid), read = chRead(rid);
  const cr = WR.crownCell(d ? d.crowns : null, "not read yet");
  return WR.bonusTile({ cls: "story-tile", data: "story", ico: pic("story_" + rid).replace("<img ", '<img class="ico story-ico" '),
    title: "Story", desc: total > 1 ? `Storybook shelf · ${read}/${total} chapters read` : `Chapter ${WR.realms.findIndex(r => r.id === rid) + 1} of the Starlight Storybook`,
    crowns: cr, tag: d ? "📄 Page restored!" : "📜 A new chapter waits" });
};
WR.storyPagesFound = () => WR.realms.filter(r => st().done[r.id]).length;   // the Starlight Storybook pages = each realm's chapter 1

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
  const ch = S.ch, r = S.realm, last = S.page >= LAST, pg = ch.pages[S.page];
  const q = last ? ch.final : pg.q;
  if (!S.opts[S.page]) S.opts[S.page] = WR.shuffle(q.options.map(o => fill(o)));
  const opts = S.opts[S.page], ans = S.answers[S.page];
  const dots = [...Array(LAST + 1).keys()].map(i => `<span class="sdot ${i < S.page ? "done" : i === S.page ? "on" : ""}">${i < LAST ? i + 1 : "★"}</span>`).join("");
  WR.view(`<div class="fade-in story-screen"><div class="row" style="justify-content:space-between;margin:6px 0 10px">
      <button class="btn ghost small" id="storyQuit">← ${S.shelf ? "Chapters" : WR.esc(r.name)}</button><div class="sdots">${dots}</div></div>
    <div class="card story-card">
      <div class="story-head"><span class="lvl-badge">${r.level}</span><b class="title">📜 Chapter ${S.n}: ${WR.esc(ch.title)}</b><div class="muted story-focus">✨ Today's magic: ${KID_FOCUS[r.id] || "new words and sentences"}</div></div>
      <div class="story-pic ${S.page ? "small" : ""}">${pic(ch.img, `Chapter ${S.n} illustration`)}</div>
      ${last ? `<p class="story-text" style="text-align:center"><b>✨ All four pages read! One last word check to ${S.n === 1 ? "restore the page" : "finish the chapter"}.</b></p>` : `
      <div class="row story-tools"><button class="btn small mint" id="readAll">🔊 Read to me</button><button class="btn ghost small" id="readSlow">🐢 Slow</button><span class="muted" style="font-size:.78rem;font-weight:800">Tap a sentence to hear it · tap a <u class="gl-hint">dotted word</u> for its meaning</span></div>
      <p class="story-text" id="storyText">${pageHTML(pg)}</p>`}
      <div class="story-q"><div class="kind-tag">${KIND[q.kind] || "💬 Question"}</div><h3 class="q">${WR.esc(fill(q.q))}</h3>
        <div class="opts">${opts.map((o, k) => `<button class="opt ${ans ? (o === fill(q.options[q.answer]) ? "right" : o === ans.chosen ? "wrong" : "") : ""}" data-k="${k}" ${ans ? "disabled" : ""}><span class="k">${"ABCD"[k]}</span>${WR.esc(o)}</button>`).join("")}</div>
        <div id="storyFb">${ans ? fbHTML(q, ans) : ""}</div></div>
    </div></div>`);
  WR.$("#storyQuit").onclick = () => S.shelf ? WR.openStoryShelf(r.id) : WR.toRealm(r.id);
  if (!last) {
    WR.$("#readAll").onclick = () => readAll(WR.state.settings.rate);
    WR.$("#readSlow").onclick = () => readAll(0.65);
    document.querySelectorAll(".sent").forEach(s => s.onclick = e => { if (e.target.closest(".gloss")) return; S.tok = (S.tok || 0) + 1; hl(+s.dataset.i); WR.say(s.textContent, { narrate: true, onend: () => hl(-1), onmiss: () => hl(-1) }); });
    document.querySelectorAll(".gloss").forEach(b => b.onclick = e => { e.stopPropagation(); gloss(b); });
  }
  document.querySelectorAll(".opt").forEach(b => b.onclick = () => choose(b, q, opts));
  WR.tapOnce(WR.$("#storyNext"), next);
}
// feedback: the reason, plus the hand-written "why not" note for a wrong pick (chapters 2+ carry notes keyed by the raw option)
const fbHTML = (q, ans) => `<div class="story-fb ${ans.ok ? "good" : "bad"}"><b>${ans.ok ? "✅ Yes!" : "💭 Not quite."}</b> ${WR.esc(fill(q.explain))}${ans.note ? `<div class="why-not">🤔 <b>Why not “${WR.esc(ans.chosen)}”?</b> ${WR.esc(fill(ans.note))}</div>` : ""}</div>
  <div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn" id="storyNext">${S.page >= LAST ? (S.n === 1 ? "📄 Restore the page" : "📖 Finish the chapter") : "Turn the page →"}</button></div>`;
function hl(i) { document.querySelectorAll(".sent").forEach(s => s.classList.toggle("reading", +s.dataset.i === i)); }
function readAll(rate) {
  const ss = [...document.querySelectorAll(".sent")]; let i = 0; const tok = S.tok = (S.tok || 0) + 1;
  st().reads++; WR.save();
  const step = () => { if (!S || S.tok !== tok) return; if (i >= ss.length) return hl(-1); hl(i); WR.say(ss[i].textContent, { rate, narrate: true, onend: () => { i++; step(); }, onmiss: () => { if (S && S.tok === tok) hl(-1); } }); };
  step();
}
function gloss(b) {
  const w = b.dataset.w, g = b.dataset.g, words = st().words;
  document.querySelectorAll(".gloss-pop").forEach(x => x.remove());
  const isNew = !words[w]; words[w] = S.realm.id; WR.save();
  const pop = document.createElement("div"); pop.className = "gloss-pop";
  pop.innerHTML = `<b>${WR.esc(w)}</b> <button class="btn ghost small" data-say="1">🔊</button><div>${WR.esc(g)}</div>${isNew ? '<div class="muted" style="font-size:.72rem;font-weight:800">✨ Added to your word list</div>' : ""}`;
  (WR.$("#storyText") || b).insertAdjacentElement("afterend", pop);
  pop.querySelector("[data-say]").onclick = e => { e.stopPropagation(); WR.say(w + ". " + g, { word: true }); };
  pop.onclick = e => { e.stopPropagation(); pop.remove(); };
  b.classList.add("seen"); if (S) S.tok = (S.tok || 0) + 1; hl(-1); WR.say(w, { word: true });
}
function choose(btn, q, opts) {
  if (S.answers[S.page]) return;
  const right = fill(q.options[q.answer]), chosen = opts[+btn.dataset.k], ok = chosen === right;
  const raw = q.options.find(o => fill(o) === chosen);
  S.answers[S.page] = { chosen, ok, note: !ok && q.notes ? q.notes[raw] || "" : "" };
  if (ok) { S.correct++; WR.sfx("good"); WR.questEvent("correct10"); }
  else {
    WR.sfx("bad");
    const pg = S.ch.pages[Math.min(S.page, LAST - 1)];
    WR.Garden && WR.Garden.plant({ type: "mcq", q: "📜 " + fill(q.q), options: q.options.map(fill), correct: right, explain: fill(q.explain),
      passage: S.page < LAST ? { title: `Chapter ${S.n}: ${S.ch.title}`, text: plain(pg.text) } : null }, S.realm.id, "story");
  }
  WR.countAnswer(ok, S.realm.id + "/story"); WR.save();
  WR.petReact && WR.petReact(ok);
  WR.Voice.stop(); render();
}
function next() {
  if (!S || S.fin) return;
  WR.Voice.stop();
  if (S.page < LAST) { S.page++; return render(); }
  finish();
}
function finish() {
  if (!S || S.fin) return; S.fin = true;
  const rid = S.realm.id, n = S.n, key = chKey(rid, n);   // first read: 1⭐ per right answer + 3⭐; new crowns 2⭐ each (WR.finishUnit)
  const { crowns, stars } = WR.finishUnit(st().done, key, S.correct, LAST + 1, "story");
  const lv = WR.petGainXP ? WR.petGainXP(S.correct * 2 + 2) : null;
  WR.questEvent("story1"); WR.questEvent("read1"); WR.activityDone();
  if (crowns === 3) WR.questEvent("perfect1");
  const found = WR.storyPagesFound(), r = S.realm, num = S.num, ch = S.ch, total = S.book.chapters.length, nextCh = n < total ? n + 1 : 0;
  WR.sfx("level"); if (crowns >= 2) WR.confetti();
  const tale = n === 1 ? `<h2 style="margin:.4em 0 .1em">📄 Page ${num} restored!</h2>` : `<h2 style="margin:.4em 0 .1em">📖 Chapter ${n} finished!</h2>`;
  const shelf = n === 1
    ? `<div class="book-pages">${WR.realms.map((x, i) => `<span class="bp ${st().done[x.id] ? "on" : ""}" title="${x.name}">${st().done[x.id] ? WR.icon("📄", "", "page found") : WR.icon("📄", "dim", "page not found yet")}<small>${i + 1}</small></span>`).join("")}</div>
    <p class="muted" style="font-weight:800">${found >= 6 ? "🌟 The Starlight Storybook is whole again! You finished the tale." : `The Starlight Storybook has ${found} of 6 pages. ${num < 6 ? "The next page waits in the next realm." : "Find the missing pages in the other realms."}`}</p>`
    : `<div class="book-pages">${S.book.chapters.map((c, i) => `<span class="bp ${chDone(rid, i + 1) ? "on" : ""}" title="${WR.esc(c.title)}">${WR.icon("📖", chDone(rid, i + 1) ? "" : "dim", chDone(rid, i + 1) ? "chapter read" : "not read yet")}<small>${i + 1}</small></span>`).join("")}</div>
    <p class="muted" style="font-weight:800">${chRead(rid)} of ${total} ${WR.esc(r.name)} chapters read.</p>`;
  WR.view(`<div class="fade-in center story-done"><div class="card" style="max-width:640px;margin:0 auto">
    <div class="story-pic">${pic(ch.img)}</div>
    ${tale}<p class="muted" style="font-weight:800;margin:0">Chapter ${n}: ${WR.esc(ch.title)}</p>
    <div class="fb-crowns">${WR.crownRow(crowns)}</div>
    <p><b>${S.correct}/${LAST + 1}</b> questions right${stars ? ` · <b>+${stars} ⭐</b>` : " · stars already collected (new crowns still pay)"}${lv ? ` · ${WR.esc(petCalled())} reached Lv ${lv.level}!` : ""}</p>
    ${shelf}
    <div class="row" style="justify-content:center"><button class="btn ghost" id="again">📖 Read again</button>${total > 1 ? `<button class="btn ghost" id="toShelf">📚 All chapters</button>` : ""}${nextCh ? `<button class="btn" id="nextCh">Chapter ${nextCh} →</button>` : `<button class="btn" id="toRealm">Back to ${WR.esc(r.name)}</button>`}</div></div></div>`);
  WR.$("#again").onclick = () => WR.startStory(rid, n);
  if (WR.$("#toShelf")) WR.$("#toShelf").onclick = () => WR.openStoryShelf(rid);
  if (WR.$("#nextCh")) WR.$("#nextCh").onclick = () => WR.startStory(rid, nextCh);
  if (WR.$("#toRealm")) WR.$("#toRealm").onclick = () => WR.toRealm(rid);
  S = null;
}
// WR.go("story", "a1") reads chapter 1; WR.go("story", { rid, n }) reads chapter n (shelf = came from the chapter shelf)
WR.screens.story = async arg => {
  const { rid, n = 1, shelf = false } = typeof arg === "string" ? { rid: arg } : arg;
  let book;
  try { book = await WR.loadStory(rid); }
  catch (e) { if (e && e.wrMiss) { WR.noteMiss(); return WR.toRealm(rid); } throw e; }
  // Start the story lookup, but do not hold the page for it. A sentence tap waits for the same recording.
  if (WR.Voice) WR.Voice.more("story").catch(() => {});
  const ch = book.chapters[n - 1] || book.chapters[0];
  S = { realm: WR.realmById(rid), book, ch, n: book.chapters.indexOf(ch) + 1, shelf, num: WR.realms.findIndex(x => x.id === rid) + 1, page: 0, correct: 0, answers: {}, opts: {} };
  render();
};
WR.startStory = (rid, n = 1) => WR.go("story", n > 1 ? { rid, n, shelf: true } : rid);
// 📚 the realm's chapter shelf: every chapter with its picture, crowns, and a lock until the one before is read
WR.screens.storyShelf = async rid => {
  const r = WR.realmById(rid); let book;
  try { book = await WR.loadStory(rid); }
  catch (e) { if (e && e.wrMiss) { WR.noteMiss(); return WR.toRealm(rid); } throw e; }
  if (WR.current() !== "storyShelf") return;
  const total = book.chapters.length, read = chRead(rid);
  WR.view(`<div class="fade-in story-shelf"><div class="row" style="justify-content:space-between;margin:6px 0 10px">
      <button class="btn ghost small" id="shelfBack">← ${WR.esc(r.name)}</button><span class="pill" style="background:#FFF1D6">📖 ${read}/${total} chapters read</span></div>
    <div class="card center"><span class="lvl-badge">${r.level}</span><h2 style="margin:.3em 0 .1em">📚 ${WR.esc(r.name)} Storybook</h2>
      <p class="muted" style="font-weight:800;margin:0">Chapter 1 brings home a lost page of the Starlight Storybook. Each chapter you read opens the next one.</p></div>
    <div class="shelf-grid">${book.chapters.map((c, i) => { const n = i + 1, d = chDone(rid, n), open = chOpen(rid, n);
      return `<button class="card shelf-ch ${open ? "" : "locked"}" data-n="${n}" ${open ? "" : "disabled"}><div class="shelf-pic">${pic(c.img)}</div>
        <b>Chapter ${n}</b><span class="shelf-title">${WR.esc(c.title)}</span>
        <small>${d ? WR.crownRow(d.crowns) : open ? "✨ Ready to read" : `🔒 Read chapter ${n - 1} first`}</small></button>`; }).join("")}</div></div>`);
  WR.$("#shelfBack").onclick = () => WR.toRealm(rid);
  document.querySelectorAll(".shelf-ch:not(.locked)").forEach(b => b.onclick = () => WR.startStory(rid, +b.dataset.n));
};
WR.openStoryShelf = rid => WR.go("storyShelf", rid);
WR.stopStory = () => { if (S) { S.tok = -1; } WR.Voice && WR.Voice.stop(); document.querySelectorAll(".gloss-pop").forEach(x => x.remove()); };
WR.openStorybook = () => {
  const d = st().done;
  WR.modal(`<h2 style="margin-top:0">📜 The Starlight Storybook</h2><p class="muted" style="font-weight:700">The wind scattered its six pages across the realms. Read each chapter to bring a page home.</p>
    <div class="book-list">${WR.realms.map((r, i) => { const u = WR.isUnlocked(i), x = d[r.id];
      return `<button class="book-row ${u ? "" : "locked"}" data-r="${r.id}" ${u ? "" : "disabled"}>${pic("story_" + r.id)}<span><b>Page ${i + 1}</b> · ${r.level} ${r.emoji}<br><small>${x ? "📄 restored " + "👑".repeat(x.crowns) : u ? "Ready to read" : "🔒 Unlock " + WR.esc(r.name)}</small></span></button>`; }).join("")}</div>
    <p class="muted" style="font-size:.8rem;font-weight:800">📚 ${Object.keys(st().words).length} story words learned</p>`, (bg, close) => {
    bg.querySelectorAll(".book-row:not(.locked)").forEach(b => b.onclick = () => { close(); WR.startStory(b.dataset.r); });
  });
};
})();
