/* 🔮 Word Charms (English follow-up, 31 Oct): a spaced-repetition word deck for every realm. Each CEFR level has 40
   kid-friendly words from its Cambridge vocabulary band (tools/c_words.py → data/<level>/words.json: word, part of
   speech, child-friendly meaning, example sentence). A word is a charm: 👀 meet it, ✨ catch it (answer a question about
   it), then polish it on later days so it glows brighter: 🔮 new → 🌙 1 day → ⭐ 3 days → 🌟 7 days → 🌠 14 days → 💎 mastered.
   A wrong answer sends the charm back to 🌙 (due again at once) and it is asked once more, unmarked, at the end of the round.
   The card type follows how well the word is known: 🔎 pick the word for a meaning → 🧩 fill the gap in the example (first
   letter shown) → 🐝 hear it and spell it with letter tiles → 💭 pick the meaning of the word → gap / spell mixed.
   Rounds: up to 8 questions — due charms first (most overdue first), then up to 4 new words. Practice rounds (when
   everything is resting) are unmarked. Every word, meaning and example has a narrator recording (tools/build_voice.py).
   Stars (anti-farm, WR.awardStars): 1⭐ the first time a charm reaches each glow (so at most 5 per word, ever), +3⭐ when it
   is mastered, a small round bonus (replays pay less); practice pays none. Answers go through WR.countAnswer
   ("<level>/words" in the Learning Report), the round end through WR.activityDone.
   Save: WR.state.charms = { cards: { "a1:apple": { b: box 0–5, d: due time, r: right, w: wrong, at: first caught } },
   rounds, lvl: last level opened } inside wordRealms.save.v1 (cloud-synced; older saves gain an empty deck). */
(function () {
const WR = window.WR, esc = WR.esc;
WR.CHARMS = { id: "words", name: "Word Charms", icon: "🔮", desc: "Catch and polish new words" };
const DAY = 864e5, ROUND = 8, NEW_MAX = 4, MASTER = 5;
const STAGES = [
  { e: "🔮", n: "New", wait: 0 },
  { e: "🌙", n: "Moon charm", wait: 1 },
  { e: "⭐", n: "Star charm", wait: 3 },
  { e: "🌟", n: "Bright charm", wait: 7 },
  { e: "🌠", n: "Shooting-star charm", wait: 14 },
  { e: "💎", n: "Mastered", wait: 0 }
];
const TYPES = { pick: "🔎 Find the word", gap: "🧩 Fill the gap", spell: "🐝 Spell it", mean: "💭 What does it mean?" };
const LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"];
const st = () => WR.block("charms");
const keyOf = (lvl, w) => lvl + ":" + w;
const card = (lvl, w) => st().cards[keyOf(lvl, w)];
const learned = c => !!c && c.b >= 1;
const isDue = (c, now = Date.now()) => learned(c) && c.b < MASTER && c.d <= now;
const lvlName = lvl => lvl.toUpperCase();
const words = lvl => WR.data[lvl + "/words"] || [];
const load = lvl => WR.bank(lvl, "words");
const loadAll = () => Promise.all(LEVELS.map(l => load(l).catch(() => [])));
const unlockedLevels = () => WR.unlockedLevels();
// counts straight from the save (no word lists needed): every level, or one
function counts(lvl) {
  const now = Date.now(), out = { due: 0, learned: 0, mastered: 0, stage: [0, 0, 0, 0, 0, 0] };
  for (const [k, c] of Object.entries(st().cards)) {
    if (lvl && !k.startsWith(lvl + ":")) continue;
    if (learned(c)) { out.learned++; out.stage[Math.min(MASTER, c.b)]++; }
    if (c.b >= MASTER) out.mastered++;
    if (isDue(c, now)) out.due++;
  }
  return out;
}
const nextDue = lvl => { const ds = Object.entries(st().cards).filter(([k, c]) => (!lvl || k.startsWith(lvl + ":")) && learned(c) && c.b < MASTER).map(([, c]) => c.d).sort((a, b) => a - b); return ds[0] || null; };
function when(ts) {
  const d = ts - Date.now(); if (d <= 0) return "now";
  const h = Math.round(d / 36e5); if (h < 23) return `in ${Math.max(1, h)}h`;
  const n = Math.max(1, Math.round(d / DAY)); return n === 1 ? "tomorrow" : `in ${n} days`;
}

/* ---------- building a round ---------- */
const hashN = s => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
function typeFor(c, w, practice) {
  if (practice) return ["pick", "gap", "spell", "mean"][Math.floor(Math.random() * 4)];
  const b = c ? c.b : 0;
  return b <= 0 ? "pick" : b === 1 ? "gap" : b === 2 ? "spell" : b === 3 ? "mean" : (hashN(w.w + (c.r || 0)) % 2 ? "gap" : "spell");
}
// 4 options: the answer + 3 others from the same level, same part of speech first; for the gap card every option starts
// with a different letter, so the first-letter hint points to exactly one
function options(w, list, field, gap) {
  const same = WR.shuffle(list.filter(x => x.w !== w.w && x.pos === w.pos)), other = WR.shuffle(list.filter(x => x.w !== w.w && x.pos !== w.pos));
  const out = [w];
  for (const x of same.concat(other)) {
    if (out.length >= 4) break;
    if (gap && out.some(o => o.w[0] === x.w[0])) continue;
    if (out.some(o => o[field] === x[field])) continue;
    out.push(x);
  }
  return WR.shuffle(out).map(x => x[field]);
}
const DECOYS = "aeioulnrstmdpbcgh";
function spellPool(word) {
  const n = word.length <= 6 ? 2 : word.length <= 10 ? 1 : 0, extra = [];
  for (let i = 0; extra.length < n && i < 50; i++) { const c = DECOYS[Math.floor(Math.random() * DECOYS.length)]; if (!word.includes(c) && !extra.includes(c)) extra.push(c); }
  return WR.shuffle(word.split("").concat(extra));
}
function makeQ(lvl, w, type, list) {
  const q = { lvl, w, type, answer: type === "mean" ? w.def : w.w };
  if (type === "pick" || type === "gap") q.options = options(w, list, "w", type === "gap");
  if (type === "mean") q.options = options(w, list, "def");
  if (type === "spell") q.pool = spellPool(w.w);
  return q;
}
// the round plan: [{ kind: "meet", ... } | { kind: "quiz", graded, ... }]
function makeRound(lvl, practice) {
  const list = words(lvl), now = Date.now(), plan = [];
  if (practice) {
    const pool = list.filter(w => learned(card(lvl, w.w)));
    WR.sample(pool.length ? pool : list.slice(0, ROUND), ROUND).forEach(w => plan.push(Object.assign(makeQ(lvl, w, typeFor(null, w, true), list), { kind: "quiz", graded: false })));
    return plan;
  }
  const due = list.filter(w => isDue(card(lvl, w.w), now)).sort((a, b) => card(lvl, a.w).d - card(lvl, b.w).d).slice(0, ROUND);
  // met-but-not-caught words come back before brand-new ones; the list order is easiest first
  const fresh = list.filter(w => { const c = card(lvl, w.w); return c && c.b === 0; }).concat(list.filter(w => !card(lvl, w.w)));
  const nNew = Math.min(NEW_MAX, ROUND - due.length, fresh.length), news = fresh.slice(0, Math.max(0, nNew));
  news.forEach(w => plan.push({ kind: "meet", lvl, w }));
  WR.shuffle(due.map(w => makeQ(lvl, w, typeFor(card(lvl, w.w), w), list)).concat(news.map(w => makeQ(lvl, w, "pick", list))))
    .forEach(q => plan.push(Object.assign(q, { kind: "quiz", graded: true })));
  return plan;
}
// one graded answer → the charm's new box; returns { b, up, mastered }
function grade(lvl, word, ok) {
  const k = keyOf(lvl, word), now = Date.now(), cs = st().cards, c = cs[k] = cs[k] || { b: 0, d: now, r: 0, w: 0 };
  const before = c.b;
  if (ok) { c.r++; c.b = Math.min(MASTER, c.b + 1); if (before === 0) c.at = now; c.d = now + STAGES[c.b].wait * DAY; }
  else { c.w++; c.b = c.b >= 1 ? 1 : 0; c.d = now; }
  WR.save();
  return { b: c.b, up: c.b > before, mastered: c.b >= MASTER && before < MASTER };
}

/* ---------- entry points: realm tile, map nudge ---------- */
WR.charmsTile = rid => {
  const c = counts(rid), total = (WR.counts && WR.counts.counts && WR.counts.counts[rid + "/words"]) || 40;
  return WR.bonusTile({ cls: "charms-tile", data: "charms", ico: '<span class="ico">🔮</span>', title: "Word Charms", desc: "Catch new words, polish them on later days",
    crowns: c.learned ? `🔮 ${c.learned}/${total} caught` : WR.crownCell(null, "not played"),
    tag: c.due ? `✨ ${c.due} charm${c.due > 1 ? "s" : ""} to polish!` : c.learned < total ? "🎁 New words waiting!" : c.mastered === total ? "💎 All mastered!" : "🌙 Charms resting" });
};
WR.charmsNudge = () => { const n = counts().due; return n ? WR.nudgeCard("charmsNudge", "🔮", `${n} word charm${n > 1 ? "s" : ""} ${n > 1 ? "want" : "wants"} polishing`, "Polish them today so the words stay bright.", "Polish →") : ""; };
WR.openCharms = rid => {
  const lv = unlockedLevels();
  if (!rid) {   // the level with the most due charms, else the last one opened, else where the child is learning now
    const d = lv.map(l => [l, counts(l).due]).sort((a, b) => b[1] - a[1])[0];
    rid = d && d[1] ? d[0] : st().lvl && lv.includes(st().lvl) ? st().lvl : (WR.continueTarget() || { realm: { id: "a1" } }).realm.id;
  }
  WR.go("charms", rid);
};
WR.startCharms = (rid, practice) => WR.go("charmsRound", { lvl: rid, practice: !!practice });

/* ---------- the deck (hub) ---------- */
const hl = (ex, w) => esc(ex).replace(new RegExp("\\b(" + w + ")\\b", "i"), "<b class=\"ch-hl\">$1</b>");
WR.screens.charms = rid => {
  const rec = st(); rec.lvl = rid; WR.save();
  const realm = WR.realms.find(r => r.id === rid) || WR.realms[0];
  WR.view(`<div class="fade-in ch-hub"><div class="row lesson-top" style="margin:6px 0 8px"><button class="btn ghost small" id="chBack">← ${esc(realm.name)}</button><b class="title">🔮 Word Charms</b></div><div class="card center muted">Opening the charm box… ✨</div></div>`);
  load(rid).then(() => { if (WR.current() === "charms" && st().lvl === rid) hub(rid); }).catch(() => WR.toast("📴 Couldn't open the charm box. Check the internet and try again."));
  WR.$("#chBack").onclick = () => WR.go("realm", rid);
};
function hub(rid) {
  const list = words(rid), c = counts(rid), realm = WR.realms.find(r => r.id === rid), nd = nextDue(rid);
  const newLeft = list.filter(w => !learned(card(rid, w.w))).length, canPlay = c.due > 0 || newLeft > 0;
  const btn = c.due ? `✨ Polish ${Math.min(c.due, ROUND)} charm${c.due > 1 ? "s" : ""}${c.due < ROUND && newLeft ? " + catch new ones" : ""}` : newLeft ? `✨ Catch ${Math.min(NEW_MAX, newLeft)} new charm${Math.min(NEW_MAX, newLeft) > 1 ? "s" : ""}` : "";
  const charm = w => { const k = card(rid, w.w), b = k ? k.b : -1;
    return learned(k) ? `<button class="ch-charm b${b}${isDue(k) ? " due" : ""}" data-w="${esc(w.w)}" aria-label="${esc(w.w)}, ${STAGES[b].n}"><span class="ch-gem">${STAGES[b].e}</span><span class="ch-word">${esc(w.w)}</span></button>`
      : `<button class="ch-charm mystery" data-w="${esc(w.w)}" aria-label="A charm you haven't caught yet"><span class="ch-gem">🔮</span><span class="ch-word">?</span></button>`; };
  WR.view(`<div class="fade-in ch-hub"><div class="row lesson-top" style="margin:6px 0 8px"><button class="btn ghost small" id="chBack">← ${esc(realm.name)}</button><b class="title">🔮 Word Charms</b></div>
    ${WR.levelTabs(rid, l => counts(l).due)}
    <div class="card ch-intro"><div class="ch-pet">${WR.petHTML()}</div><div style="flex:1;min-width:0"><h2 style="margin:0">${c.due ? `${c.due} charm${c.due > 1 ? "s" : ""} ${c.due > 1 ? "want" : "wants"} polishing! ✨` : newLeft ? `${lvlName(rid)} words are waiting to be caught 🎁` : "Your charms are resting 🌙"}</h2>
      <p class="muted ch-how">Catch a word, then polish it on later days. Each time it glows brighter: 🔮→🌙→⭐→🌟→🌠→💎</p>
      <div class="row">${canPlay ? `<button class="btn mint" id="chGo">${btn}</button>` : `<button class="btn mint" id="chPractice">🎲 Practice anyway</button>`}
      ${!c.due && nd ? `<span class="pill">Next polish ${when(nd)}</span>` : ""}</div></div></div>
    <div class="stage-row ch-stages">${STAGES.slice(1).map((g, i) => `<div class="stage-chip"><span>${g.e}</span><b>${c.stage[i + 1]}</b><small>${g.n.replace(" charm", "")}</small></div>`).join("")}</div>
    <div class="card ch-box"><div class="ch-box-h"><b>${realm.emoji} ${lvlName(rid)} charm box</b><span class="pill">${c.learned}/${list.length} caught · 💎 ${c.mastered}</span></div>
      <div class="ch-grid">${list.map(charm).join("")}</div></div>
    <p class="muted ph-note">👪 Grown-ups: ${list.length} words from the Cambridge ${lvlName(rid)} vocabulary band. New words come 4 at a time; each one returns after 1, 3, 7 and 14 days. A slip brings it back sooner.</p></div>`);
  WR.$("#chBack").onclick = () => WR.go("realm", rid);
  const go = WR.$("#chGo"); if (go) go.onclick = () => WR.startCharms(rid);
  const pr = WR.$("#chPractice"); if (pr) pr.onclick = () => WR.startCharms(rid, true);
  WR.bindLevelTabs("charms");
  document.querySelectorAll(".ch-charm").forEach(b => b.onclick = () => {
    const w = list.find(x => x.w === b.dataset.w), k = card(rid, w.w);
    if (!learned(k)) return WR.toast("🔮 Catch this charm in a round to see its word!", 2200);
    const g = STAGES[k.b];
    WR.modal(`<div class="ch-modal"><div class="ch-big">${g.e}</div><h2 style="margin:.1em 0">${esc(w.w)} <button class="btn ghost small" id="chSayW" aria-label="Hear the word">🔊</button></h2><span class="pill">${esc(w.pos)} · ${g.n}</span>
      <p class="ch-def">${esc(w.def)}</p><p class="ch-ex">“${hl(w.ex, w.w)}” <button class="btn ghost small" id="chSayE" aria-label="Hear the example">🔊</button></p>
      <p class="muted" style="font-size:.8rem;font-weight:800">${k.b >= MASTER ? "💎 Mastered! It will shine forever." : `Next polish ${when(k.d)}`} · ✅ ${k.r} · 💭 ${k.w}</p><button class="btn small" id="chOk">Got it</button></div>`, (bg, close) => {
      bg.querySelector("#chSayW").onclick = () => WR.say(w.w);
      bg.querySelector("#chSayE").onclick = () => WR.say(w.ex);
      bg.querySelector("#chOk").onclick = close;
    });
  });
}

/* ---------- a round ---------- */
let S = null;
WR.stopCharms = () => { S = null; };
WR.Charms = { STAGES, LEVELS, counts, makeRound, grade, typeFor, options, spellPool, isDue, st, nextDue, _s: () => S, _q: () => S && S.plan[S.n] };
WR.screens.charmsRound = ({ lvl, practice }) => {
  WR.setFocus && WR.setFocus(true);
  WR.view(`<div class="card center muted" style="margin-top:20px">✨ Shuffling the charms…</div>`);
  load(lvl).then(() => {
    if (WR.current() !== "charmsRound") return;
    const plan = makeRound(lvl, practice);
    if (!plan.length) return WR.go("charms", lvl);
    S = { lvl, practice, plan, n: 0, right: 0, graded: 0, caught: 0, polished: 0, mastered: 0, stars: 0, built: [], answered: null, retried: {} };
    render(true);
  });
};
function progress() { const quiz = S.plan.filter(p => p.kind === "quiz").length, done = S.plan.slice(0, S.n).filter(p => p.kind === "quiz").length; return { quiz, done }; }
function render(auto) {
  const p = S.plan[S.n], pr = progress(), c = card(S.lvl, p.w.w), stage = STAGES[c ? Math.min(MASTER, c.b) : 0];
  WR.view(`<div class="fade-in ch-round"><div class="row lesson-top" style="justify-content:space-between;margin:6px 0 8px"><button class="btn ghost small" id="chQuit">← Leave</button><div class="ph-progress"><div class="prog"><i style="width:${S.n / S.plan.length * 100}%"></i></div><b>${S.n + 1}/${S.plan.length}</b></div></div>
    <div class="card ch-card"><div class="ph-head"><span class="lvl-badge">${lvlName(S.lvl)}</span><b>${p.kind === "meet" ? "👀 Meet a new charm" : TYPES[p.type]}</b>${S.practice ? '<span class="pill">🎲 practice</span>' : p.retry ? '<span class="pill">🔁 once more</span>' : `<span class="pill ch-stage">${stage.e} ${stage.n}</span>`}</div>
      ${p.kind === "meet" ? meetHTML(p) : quizHTML(p)}<div id="chFb"></div></div></div>`);
  WR.$("#chQuit").onclick = () => WR.go("charms", S.lvl);
  bind(p);
  if (auto) setTimeout(() => S && S.plan[S.n] === p && sayP(p), 250);
}
const sayBtns = (id = "chSay") => `<button class="btn ph-say" id="${id}" aria-label="Hear it">🔊</button><button class="btn ghost small ch-slow" id="chSlow" aria-label="Hear it slowly">🐢</button>`;
function meetHTML(p) {
  const w = p.w;
  return `<div class="ch-meet"><div class="ch-big glow">🔮</div><div class="ch-meet-w"><span class="ch-word-big">${esc(w.w)}</span>${sayBtns()}</div><span class="pill">${esc(w.pos)}</span>
    <p class="ch-def">${esc(w.def)}</p><p class="ch-ex">“${hl(w.ex, w.w)}” <button class="btn ghost small" id="chSayEx" aria-label="Hear the example">🔊</button></p>
    <div class="row" style="justify-content:center"><button class="btn mint" id="chCatch">✨ ${S.plan[S.n + 1] && S.plan[S.n + 1].kind === "meet" ? "Next charm" : "Let's catch them!"}</button></div></div>`;
}
const blank = w => `<span class="ch-blank">${esc(w[0])}${"_".repeat(Math.max(2, w.length - 1))}</span>`;
function quizHTML(p) {
  const w = p.w, opt = (o, k) => `<button class="opt ch-opt${p.type === "mean" ? " ch-defopt" : ""}" data-k="${k}">${esc(o)}</button>`;
  if (p.type === "pick") return `<div class="ch-ask"><p class="ch-q">Which word means…</p><div class="ch-clue">${sayBtns()}<span>“${esc(w.def)}”</span></div></div><div class="opts ch-opts">${p.options.map(opt).join("")}</div>`;
  if (p.type === "gap") return `<div class="ch-ask"><p class="ch-q">Which word fits the gap?</p><p class="ch-sent">${esc(w.ex).replace(new RegExp("\\b" + w.w + "\\b", "i"), m => blank(m))}</p>
    <button class="btn ghost small" id="chHint">💡 Hint</button><div class="ch-hint muted" id="chHintTxt" hidden>${esc(w.def)}</div></div><div class="opts ch-opts">${p.options.map(opt).join("")}</div>`;
  if (p.type === "mean") return `<div class="ch-ask"><p class="ch-q">What does this word mean?</p><div class="ch-meet-w"><span class="ch-word-big">${esc(w.w)}</span>${sayBtns()}</div></div><div class="opts ch-opts one">${p.options.map(opt).join("")}</div>`;
  // spell
  return `<div class="ch-ask"><p class="ch-q">Listen, then spell the word!</p><div class="ch-clue">${sayBtns()}<span>${esc(w.def)}</span></div></div>
    <div class="spell-slots ch-slots" id="chSlots">${w.w.split("").map((_, k) => `<button class="slot${S.built[k] != null ? " filled" : ""}" data-s="${k}" aria-label="Letter ${k + 1}">${S.built[k] != null ? esc(p.pool[S.built[k]]) : ""}</button>`).join("")}</div>
    <div class="tiles letters ph-pool ch-pool" id="chPool">${p.pool.map((g, k) => `<button class="tile ph-tile" data-p="${k}" ${S.built.includes(k) ? "disabled" : ""}>${esc(g)}</button>`).join("")}</div>`;
}
function sayP(p, slow) {
  const o = slow ? { slow: true } : {};
  if (p.kind === "meet" || p.type === "spell" || p.type === "mean") return WR.say(p.w.w, o);
  if (p.type === "pick") return WR.say(p.w.def, o);
}
function bind(p) {
  const sb = WR.$("#chSay"); if (sb) sb.onclick = () => sayP(p);
  const sl = WR.$("#chSlow"); if (sl) sl.onclick = () => sayP(p, true);
  if (p.kind === "meet") {
    WR.$("#chSayEx").onclick = () => WR.say(p.w.ex);
    WR.$("#chCatch").onclick = () => { WR.sfx("tap"); next(); };
    return;
  }
  document.querySelectorAll(".ch-opt").forEach(b => b.onclick = () => choose(p.options[+b.dataset.k], b));
  const h = WR.$("#chHint"); if (h) h.onclick = () => { WR.$("#chHintTxt").hidden = false; h.remove(); };
  if (p.type === "spell") {
    document.querySelectorAll("#chPool .tile").forEach(b => b.onclick = () => {
      if (S.answered) return; const k = +b.dataset.p, at = S.built.findIndex(x => x == null), slot = at < 0 ? S.built.length : at;
      if (slot >= p.w.w.length || S.built.includes(k)) return;
      S.built[slot] = k; WR.sfx("tap");
      if (S.built.filter(x => x != null).length === p.w.w.length) { render(); return choose(S.built.map(i => p.pool[i]).join("")); }
      render();
    });
    document.querySelectorAll("#chSlots .slot").forEach(b => b.onclick = () => { if (S.answered) return; S.built[+b.dataset.s] = null; render(); });
  }
}
function choose(val, btn) {
  if (!S || S.answered) return;
  const p = S.plan[S.n], ok = val === p.answer; S.answered = { val, ok };
  if (ok) { WR.sfx("good"); WR.questEvent("correct10"); } else WR.sfx("bad");
  if (!p.retry) { WR.countAnswer(ok, S.lvl + "/words"); if (ok) S.right++; }
  let note = "";
  if (p.graded && !p.retry) {
    S.graded++;
    const g = grade(S.lvl, p.w.w, ok);
    if (ok) {
      if (g.b === 1) S.caught++; else S.polished++;
      const got = WR.awardStars("charm", `${S.lvl}/${p.w.w}/b${g.b}`, 1, { kind: "item", tally: S, quiet: true }); S.stars += got;
      if (g.mastered) { S.mastered++; S.stars += WR.awardStars("charmMaster", keyOf(S.lvl, p.w.w), 3, { kind: "fresh", quiet: true }); }
      note = g.mastered ? "💎 Mastered! This charm will shine forever." : `${STAGES[g.b].e} It's a ${STAGES[g.b].n} now. See you ${when(card(S.lvl, p.w.w).d)}!`;
    } else note = "🌙 We'll polish this one again soon.";
  }
  if (!ok && !S.practice && !p.retry) S.plan.push(Object.assign({}, p, { retry: true, graded: false, options: p.options && WR.shuffle(p.options), pool: p.pool && WR.shuffle(p.pool) }));
  WR.petReact && WR.petReact(ok);
  WR.save();
  document.querySelectorAll(".ch-opt,.ch-pool .tile,#chSlots .slot,#chHint").forEach(b => { b.disabled = true; });
  document.querySelectorAll(".ch-opt").forEach(b => { const o = p.options[+b.dataset.k]; if (o === p.answer) b.classList.add("right"); else if (b === btn) b.classList.add("wrong"); });
  const slots = WR.$("#chSlots"); if (slots) slots.classList.add(ok ? "right" : "wrong");
  const w = p.w;
  WR.$("#chFb").innerHTML = `<div class="story-fb ch-fb ${ok ? "good" : "bad"}"><b>${ok ? "✅ Yes!" : "💭 Not quite."}</b> <b class="ch-hl">${esc(w.w)}</b> = ${esc(w.def)}
      <div class="ch-ex small">“${hl(w.ex, w.w)}”</div>${note ? `<div class="ch-note">${note}</div>` : ""}</div>
    <div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn" id="chNext">${S.n + 1 < S.plan.length ? "Next →" : "🌟 Finish"}</button></div>`;
  WR.tapOnce(WR.$("#chNext"), next);
  WR.say(w.ex);
}
function next() {
  if (!S) return;
  if (S.n + 1 < S.plan.length) { S.n++; S.built = []; S.answered = null; return render(true); }
  finish();
}
function finish() {
  const rec = st(), lvl = S.lvl, r = S;
  rec.rounds = (rec.rounds || 0) + 1;
  if (!r.practice) r.stars += WR.awardStars("charmRound", lvl, 2, { kind: "round", tally: r, quiet: true });
  const lv = WR.petGainXP ? WR.petGainXP(r.right * 2 + 2) : null;
  WR.questEvent("charm1"); WR.activityDone();
  if (r.graded >= 4 && r.right === r.graded) WR.questEvent("perfect1");
  WR.Collect && WR.Collect.check();
  WR.sfx("level"); if (r.right >= 4) WR.confetti();
  S = null;
  const c = counts(lvl), more = c.due > 0 || words(lvl).some(w => !learned(card(lvl, w.w)));
  const line = (e, n, t) => n ? `<div class="ch-sum-row"><span>${e}</span><b>${n}</b> ${t}</div>` : "";
  WR.view(`<div class="fade-in center ch-done"><div class="card" style="max-width:560px;margin:0 auto"><div class="ph-pet big">${WR.petHTML()}</div>
    <h2 style="margin:.3em 0 .1em">${r.practice ? "🎲 Practice done!" : "🔮 Charms polished!"}</h2>
    <div class="ch-sum">${line("✨", r.caught, `new charm${r.caught > 1 ? "s" : ""} caught`)}${line("🌟", r.polished, `charm${r.polished > 1 ? "s" : ""} glowing brighter`)}${line("💎", r.mastered, "mastered!")}${r.practice ? line("✅", r.right, "right") : ""}</div>
    <p><b>${r.right}/${r.graded || r.plan.filter(p => p.kind === "quiz" && !p.retry).length}</b> right${r.stars ? ` · <b>+${r.stars} ⭐</b>` : ""}${lv ? ` · ${esc(WR.state.pet.name)} reached Lv ${lv.level}!` : ""}</p>
    <p class="muted" style="font-weight:700">🔮 ${c.learned} caught · 💎 ${c.mastered} mastered in ${lvlName(lvl)}${!c.due && nextDue(lvl) ? ` · next polish ${when(nextDue(lvl))}` : ""}</p>
    ${WR.starNote ? WR.starNote() : ""}
    <div class="row" style="justify-content:center;gap:8px;flex-wrap:wrap">${more ? '<button class="btn mint" id="chAgain">✨ Another round</button>' : ""}<button class="btn ghost" id="chDeck">🔮 My charms</button></div></div></div>`);
  const a = WR.$("#chAgain"); if (a) a.onclick = () => WR.startCharms(lvl);
  WR.$("#chDeck").onclick = () => WR.go("charms", lvl);
}

/* ---------- 🏷️ sticker page ---------- */
const all = () => counts();
const fullSet = () => LEVELS.some(l => { const n = (WR.counts && WR.counts.counts && WR.counts.counts[l + "/words"]) || 40; return counts(l).learned >= n; });
const STK = [
  { id: "first", icon: "🌙", name: "First Charm", how: "Catch your first Word Charm", test: () => all().learned >= 1 },
  { id: "c10", icon: "⭐", name: "Charm Collector", how: "Catch 10 Word Charms", test: () => all().learned >= 10 },
  { id: "c50", icon: "🌟", name: "Charm Bracelet", how: "Catch 50 Word Charms", test: () => all().learned >= 50 },
  { id: "m1", icon: "💎", name: "Forever Word", how: "Master a Word Charm (polish it on 5 different days)", test: () => all().mastered >= 1 },
  { id: "m10", icon: "👑", name: "Charm Keeper", how: "Master 10 Word Charms", test: () => all().mastered >= 10 },
  { id: "set", icon: "🔮", name: "Full Charm Box", how: "Catch every word in one realm's charm box", test: fullSet }
];
if (WR.Collect) WR.Collect.addPages(() => [{ id: "charms", icon: "🔮", title: "Word Charms", name: "Word Charms", bg: "bg_b1", defs: STK }]);
WR.Charms.loadAll = loadAll;
})();
