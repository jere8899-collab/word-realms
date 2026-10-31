/* 🧩 Gap rounds (clean-up, 1 Nov): ONE engine for the bonus games that are a shelf of books, each book a round of
   "fill the gap" cards answered with tiles (low levels) or typing (higher levels). Used by 🔀 Spell Swap (js/swap.js) and
   ⚒️ Word Forge (js/forge.js); each module keeps only its data, marking rules, card body, hints and stickers.
   WR.GapRound(cfg) registers the hub + round screens and returns { open, start, stop, s, tile, unitsDone, crownsAt }.
   cfg = {
     id        save block name, report skill and finishUnit source ("swap" → WR.block("swap"), "<level>/swap")
     p         prefix of the element ids (#swBack, #swCheck, #swIn, #swGap…); the look is the shared sw-* classes in css/style.css
     hub, round           screen names ("swap", "swapRound")
     title, icon          hub heading ("🔀 Spell Swap") and the icon used on tiles/buttons
     tile: { cls, title, desc, unit }  the realm bonus tile ("books" → "🔀 2/3 books")
     opening, openingRound, offline, intro, shelfBtn          texts
     how(rid), note(rid, d)                                    hub instructions + the grown-ups' note
     gap(it)               the sentence that holds the ___ gap
     body(it, gapHTML, S)  the card between the header and the answer area (must hold the gap and a #<p>Say button)
     sayFirst(it)          read aloud when the card opens and by the 🔊 button; sayDone(it) after checking
     tiles(it)             the answer as tiles (tile mode); join = how tiles join (" " for words, "" for word parts)
     placeholder, count(typed, it)?   typed mode: input hint and an optional live counter
     check(it, user) → { ok, why }    why other than null/"wrong" = a friendly nudge (not a try): nudge(why, it)
     hint(it, tiles)       the 💡 line after a first miss;  shown(it, typed, ok) → what the gap shows after a typed answer
     quest                 the daily quest bumped on a finish }
   Rules shared by both games: a nudge is not a try; the first try is counted for the Learning Report (WR.countAnswer);
   a first miss gives a hint and a second try, a second miss shows the answer; stars through WR.finishUnit (once ever:
   1⭐ per right answer, ½ for a second try, + 3⭐, new crowns 2⭐ each; replays pay only new crowns). */
(function () {
const WR = window.WR, esc = WR.esc, EMPTY = "\u00a0".repeat(14);
WR.GapRound = cfg => {
  const p = cfg.p, $ = id => WR.$("#" + p + id), st = () => WR.block(cfg.id), join = cfg.join == null ? " " : cfg.join;
  const unitsDone = lvl => [1, 2, 3].filter(k => st().done[lvl + "." + k]).length;
  const crownsAt = lvl => [1, 2, 3].reduce((a, k) => a + ((st().done[lvl + "." + k] || {}).crowns || 0), 0);
  const tile = rid => { const n = unitsDone(rid), t = cfg.tile;
    return WR.bonusTile({ cls: t.cls, data: cfg.id, ico: `<span class="ico">${cfg.icon}</span>`, title: t.title, desc: t.desc,
      crowns: n ? WR.crownRow(Math.round(crownsAt(rid) / 3)) : WR.crownCell(null, "not played"), tag: n ? `${cfg.icon} ${n}/3 ${t.unit}` : "✨ New adventure!" }); };
  const open = rid => WR.go(cfg.hub, rid || st().lvl || (WR.continueTarget() || { realm: { id: "a1" } }).realm.id);
  const start = (lvl, book) => WR.go(cfg.round, { lvl, book });
  const top = realm => `<div class="row lesson-top" style="margin:6px 0 8px"><button class="btn ghost small" id="${p}Back">← ${esc(realm.name)}</button><b class="title">${cfg.title}</b></div>`;

  /* ---------- the book shelf (hub) ---------- */
  WR.screens[cfg.hub] = rid => {
    const rec = st(); rec.lvl = rid; WR.save();
    const realm = WR.realms.find(r => r.id === rid) || WR.realms[0];
    WR.view(`<div class="fade-in sw-hub">${top(realm)}<div class="card center muted">${cfg.opening}</div></div>`);
    $("Back").onclick = () => WR.go("realm", rid);
    cfg.load(rid).then(() => { if (WR.current() === cfg.hub && st().lvl === rid) hub(rid); }).catch(() => WR.toast(cfg.offline));
  };
  function hub(rid) {
    const d = cfg.set(rid), realm = WR.realms.find(r => r.id === rid), done = st().done;
    WR.view(`<div class="fade-in sw-hub">${top(realm)}
    ${WR.levelTabs(rid)}
    <div class="card sw-intro"><div class="ch-pet">${WR.petHTML()}</div><div style="flex:1;min-width:0"><h2 style="margin:0">${cfg.intro}</h2>
      <p class="muted sw-how">${cfg.how(rid)}</p></div></div>
    <div class="sw-books">${d.books.map(b => { const x = done[b.id];
      return `<button class="card sw-book ${x ? "done" : ""}" data-b="${b.id}"><span class="sw-bico">${b.icon}</span><span class="sw-btxt"><b>${esc(b.name)}</b><small>${esc(b.focus)}</small></span>
        <span class="sw-bcr">${x ? WR.crownRow(x.crowns) : '<span class="pill">▶ Play</span>'}</span></button>`; }).join("")}</div>
    <p class="muted ph-note">${cfg.note(rid, d)}</p></div>`);
    $("Back").onclick = () => WR.go("realm", rid);
    WR.bindLevelTabs(cfg.hub);
    document.querySelectorAll(".sw-book").forEach(b => b.onclick = () => start(rid, b.dataset.b));
  }

  /* ---------- a round: the items of one book ---------- */
  let S = null;
  WR.screens[cfg.round] = ({ lvl, book }) => {
    WR.view(`<div class="card center muted" style="margin-top:20px">${cfg.openingRound}</div>`);
    cfg.load(lvl).then(d => {
      if (WR.current() !== cfg.round) return;
      const bk = d.books.find(b => b.id === book) || d.books[0];
      S = { lvl, d, bk, items: WR.shuffle(bk.items), n: 0, right: 0, second: 0, tries: 0, built: [], typed: "", done: null, log: [] };
      WR.setFocus && WR.setFocus(true);
      render(true);
    }).catch(() => WR.go(cfg.hub, lvl));
  };
  const item = () => S.items[S.n];
  const tiled = () => S.d.mode === "tiles";
  function pool(it) { if (!it._pool) it._pool = WR.shuffle(cfg.tiles(it).concat(it.x || [])); return it._pool; }
  const builtText = it => S.built.map(k => pool(it)[k]).join(join);
  function gapHTML(it) {
    const fill = tiled() ? S.built.map((k, i) => `<button class="sw-chip" data-i="${i}" aria-label="Take back ${esc(pool(it)[k])}">${esc(pool(it)[k])}</button>`).join("") : esc(S.typed);
    const [pre, post] = cfg.gap(it).split("___");
    return `${esc(pre)}<span class="sw-gap${tiled() ? "" : " txt"}${fill ? " filled" : ""}" id="${p}Gap">${fill || EMPTY}</span>${esc(post)}`;
  }
  function render(auto) {
    const it = item(), typed = !tiled();
    WR.view(`<div class="fade-in sw-round"><div class="row lesson-top" style="justify-content:space-between;margin:6px 0 8px"><button class="btn ghost small" id="${p}Quit">← Leave</button><div class="ph-progress"><div class="prog"><i style="width:${S.n / S.items.length * 100}%"></i></div><b>${S.n + 1}/${S.items.length}</b></div></div>
    <div class="card sw-card"><div class="ph-head"><span class="lvl-badge">${S.lvl.toUpperCase()}</span><b>${S.bk.icon} ${esc(S.bk.name)}</b></div>
      ${cfg.body(it, gapHTML(it), S)}
      ${typed ? `<div class="sw-type"><input class="input" id="${p}In" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="${cfg.placeholder}" value="${esc(S.typed)}" ${S.done ? "disabled" : ""}>${cfg.count ? `<small class="muted" id="${p}Count">${cfg.count(S.typed, it)}</small>` : ""}</div>`
        : `<div class="tiles sw-pool${auto ? "" : " still"}" id="${p}Pool">${pool(it).map((w, k) => `<button class="tile sw-tile" data-p="${k}" ${S.built.includes(k) || S.done ? "disabled" : ""}>${esc(w)}</button>`).join("")}</div>`}
      <div id="${p}Fb">${fbHTML()}</div>
      <div class="row sw-acts">${S.done ? `<button class="btn" id="${p}Next">${S.n + 1 < S.items.length ? "Next →" : "🌟 Finish"}</button>`
        : `${typed ? "" : `<button class="btn ghost small" id="${p}Clear">↩ Clear</button>`}<button class="btn mint" id="${p}Check">✓ Check</button>`}</div></div></div>`);
    bind(it);
    if (auto) setTimeout(() => S && item() === it && WR.say(cfg.sayFirst(it)), 250);
  }
  function fbHTML() {
    const f = S.fb; if (!f) return "";
    if (f.kind === "nudge") return `<div class="story-fb sw-fb nudge">${f.html}</div>`;
    const it = item();
    if (f.kind === "hint") return `<div class="story-fb sw-fb bad"><b>💭 Not quite. Try again!</b> 💡 ${cfg.hint(it, tiled())}</div>`;
    return `<div class="story-fb sw-fb ${f.ok ? "good" : "bad"}"><b>${f.ok ? "✅ Yes!" : "💭 Here's the answer:"}</b> ${esc(it.say)}<div class="sw-tip">💡 ${esc(it.tip)}</div>
    ${it.ans.length > 1 ? `<div class="sw-also muted">Also right: ${it.ans.slice(1).map(a => "“" + esc(a) + "”").join(", ")}</div>` : ""}</div>`;
  }
  function bind(it) {
    $("Quit").onclick = () => WR.go(cfg.hub, S.lvl);
    $("Say").onclick = () => WR.say(cfg.sayFirst(it));
    const nx = $("Next"); if (nx) { nx.onclick = next; return; }
    $("Check").onclick = submit;
    const inp = $("In");
    if (inp) {
      inp.oninput = () => { S.typed = inp.value; const g = $("Gap"); g.textContent = inp.value || EMPTY; g.classList.toggle("filled", !!inp.value); const c = $("Count"); if (c) c.textContent = cfg.count(inp.value, it); };
      inp.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); submit(); } };
    }
    document.querySelectorAll(`#${p}Pool .sw-tile`).forEach(b => b.onclick = () => { const k = +b.dataset.p; if (S.built.includes(k)) return; S.built.push(k); S.fb = null; WR.sfx("tap"); render(); });
    document.querySelectorAll(`#${p}Gap .sw-chip`).forEach(b => b.onclick = () => { S.built.splice(+b.dataset.i, 1); S.fb = null; render(); });
    const cl = $("Clear"); if (cl) cl.onclick = () => { S.built = []; S.fb = null; render(); };
  }
  function submit() {
    if (!S || S.done) return;
    const it = item(), user = tiled() ? builtText(it) : S.typed, res = cfg.check(it, user, S.d);
    if (res.why && res.why !== "wrong") { S.fb = { kind: "nudge", html: cfg.nudge(res.why, it, S.d) }; WR.sfx("tap"); return render(); }   // not a try
    S.tries++;
    if (S.tries === 1) WR.countAnswer(res.ok, S.lvl + "/" + cfg.id);  // the report counts the first try
    if (res.ok) { if (S.tries === 1) S.right++; else S.second++; S.done = { ok: true }; WR.sfx("good"); WR.questEvent("correct10"); }
    else if (S.tries === 1) { S.fb = { kind: "hint" }; WR.sfx("bad"); WR.petReact && WR.petReact(false); S.built = []; return render(); }
    else { S.done = { ok: false }; WR.sfx("bad"); }
    S.log.push({ id: it.id, ok: res.ok, tries: S.tries });
    S.fb = { kind: "result", ok: res.ok };
    WR.petReact && WR.petReact(res.ok); WR.save();
    if (tiled()) { if (!res.ok) S.built = cfg.tiles(it).map(w => pool(it).indexOf(w)); }   // show the answer in the gap
    else S.typed = cfg.shown(it, S.typed, res.ok);
    render();
    WR.say(cfg.sayDone(it));
  }
  function next() {
    if (S.n + 1 < S.items.length) { S.n++; S.built = []; S.typed = ""; S.tries = 0; S.done = null; S.fb = null; return render(true); }
    finish();
  }
  function finish() {
    const r = S, rec = st(); rec.rounds++;
    const got = r.right + r.second * 0.5, { crowns, stars } = WR.finishUnit(rec.done, r.bk.id, got, r.items.length, cfg.id);
    const lv = WR.petGainXP ? WR.petGainXP(r.right * 2 + r.second + 2) : null;
    WR.questEvent(cfg.quest); WR.activityDone();
    if (crowns === 3) WR.questEvent("perfect1");
    WR.Collect && WR.Collect.check();
    WR.sfx("level"); if (crowns >= 2) WR.confetti();
    S = null;
    const books = r.d.books, i = books.indexOf(r.bk), nb = books[i + 1];
    WR.view(`<div class="fade-in center sw-done"><div class="card" style="max-width:560px;margin:0 auto"><div class="ph-pet big">${WR.petHTML()}</div>
    <h2 style="margin:.3em 0 .1em">${r.bk.icon} ${esc(r.bk.name)} done!</h2><div class="fb-crowns">${WR.crownRow(crowns)}</div>
    <p><b>${r.right}/${r.items.length}</b> right first time${r.second ? ` · ${r.second} on the second try` : ""}${stars ? ` · <b>+${stars} ⭐</b>` : " · stars already collected (new crowns still pay)"}${lv ? ` · ${esc(WR.state.pet.name)} reached Lv ${lv.level}!` : ""}</p>
    <div class="row" style="justify-content:center;gap:8px;flex-wrap:wrap"><button class="btn ghost" id="${p}Again">↻ Play again</button>${nb ? `<button class="btn mint" id="${p}NextB">Next: ${nb.icon} ${esc(nb.name)} →</button>` : ""}<button class="btn ghost" id="${p}Shelf">${cfg.shelfBtn}</button></div></div></div>`);
    $("Again").onclick = () => start(r.lvl, r.bk.id);
    const n = $("NextB"); if (n) n.onclick = () => start(r.lvl, nb.id);
    $("Shelf").onclick = () => WR.go(cfg.hub, r.lvl);
  }
  return { open, start, stop: () => { S = null; }, s: () => S, tile, unitsDone, crownsAt };
};
})();
