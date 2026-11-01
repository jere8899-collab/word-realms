/* 🌉 Word Bridges (English follow-up, 1 Nov): Cambridge-style OPEN CLOZE for every realm. A short kid- or teen-topic text is
   read from start to end, one sentence at a time; each sentence has ONE gap for ONE little word (a / the, is / was, in / since,
   who / which, because / although, up / off, Not only / No sooner…), the task of B1 Preliminary Part 6 and Use of English
   Part 2 of B2 First, C1 Advanced and C2 Proficiency, scaled down to Starters–Movers / A2 Key grammar at A1/A2.
   Data: tools/c_cloze.py → data/<level>/cloze.json (3 texts × 8 gaps per level, 144 in all), validated by build_data.py.
     A1  a/an · is/are/has · can · in/on/at · he/his/her · and/but (tiles)     A2  past simple · some/any · than · going to · must (tiles)
     B1  present perfect · since/for · who/which/where · although · used to   B2  whose · despite · unless · so/such · had (3rd cond.)
     C1  Not only · Hardly · Were it not · whereby · let alone · Little did    C2  No sooner · albeit · whatsoever · Much as · lest · be it
   Tile levels pick one of 4 word tiles; every wrong tile carries its own "why not" note (shown after a miss and under the
   answer). Typed levels type the word. Marking (canon(), the same as build_data.py): capitals, spaces at the ends and full
   stops don't matter; several words is a friendly nudge, not a try. Every gap lists all its right answers (on/in, who/that…).
   A first miss gives a 💡 hint (what kind of word + first letter and length when typed) and a second try; a second miss
   shows the answer. The sentences before the gap stay on the card ("so far…"), so the text reads like a story.
   The shelf, round flow, stars and finish are the shared gap-round engine (js/gap-round.js), as in Spell Swap and Word Forge:
   WR.finishUnit once ever (1⭐ per right answer, ½ for a second try, + 3⭐, new crowns 2⭐ each; replays pay only new crowns).
   Answers → WR.countAnswer ("<level>/cloze" in the Learning Report), the end → WR.activityDone + the cloze1 quest.
   Save: WR.state.cloze = { done: { "b2.1": { best, crowns, plays, at } }, rounds, lvl } inside wordRealms.save.v1 (cloud-synced;
   older saves gain the block through WR.BLOCKS in js/core.js). */
(function () {
const WR = window.WR, esc = WR.esc;
WR.CLOZE = { id: "cloze", name: "Word Bridges", icon: "🌉", desc: "One little word fills each gap" };
const LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"];
const HOW = {
  a1: "Read the little story. Tap the ONE word that fills each gap!",
  a2: "Read the story. Tap the ONE word that fills each gap!",
  b1: "Read the text. Type ONE word in each gap: often a little word like who, since or up.",
  b2: "Type ONE word in each gap. Think about grammar words: whose, despite, unless, such…",
  c1: "Type ONE word in each gap. Watch out for fixed phrases and sentences that start with Not only or Hardly.",
  c2: "Type ONE word in each gap. Expect formal patterns: No sooner, lest, albeit, be it…"
};
const EXAM = { a1: "Cambridge Starters–Movers grammar", a2: "A2 Key grammar", b1: "B1 Preliminary, Reading Part 6", b2: "B2 First, Use of English Part 2", c1: "C1 Advanced, Use of English Part 2", c2: "C2 Proficiency, Use of English Part 2" };
// the 💡 hint after a first miss: what kind of word goes in the gap (kind is checked by build_data.py)
const KINDS = {
  art: "a little word that comes before a thing (an article)", aux: "a helping verb, like a form of be, have or do",
  verb: "a doing word in the right form", prep: "a place, time or 'with' word (a preposition)", link: "a joining word that links two ideas",
  mod: "a modal verb: a word for being able, needing to or maybe", pron: "a word that stands for a person or thing (a pronoun)",
  det: "a word that says whose it is", quant: "a 'how many / how much' word", comp: "a comparing word",
  rel: "a word that joins extra information about a person or thing", part: "the little word that finishes a phrasal verb",
  intens: "a 'how much' word that makes the meaning stronger", wh: "a question word used inside the sentence",
  neg: "a word that starts a 'not / hardly' pattern", fixed: "a word from a fixed phrase that always goes together", adv: "a word that makes the meaning much stronger"
};

/* ---------- marking ---------- */
// lower case, curly quotes straightened, anything but letters, apostrophes and hyphens taken out; mirrors cloze_canon() in build_data.py
function canon(t) {
  t = String(t == null ? "" : t).trim().toLowerCase().replace(/[‘’`´]/g, "'").replace(/[^a-z' -]+/g, " ");
  return t.replace(/-/g, " - ").split(/\s+/).filter(Boolean).join(" ").replace(/ - /g, "-");
}
// → { ok, why: null | "empty" | "words" | "wrong" }
function check(item, user) {
  const u = canon(user);
  if (!u) return { ok: false, why: "empty" };
  if (item.ans.some(a => canon(a) === u)) return { ok: true, why: null };
  if (u.includes(" ")) return { ok: false, why: "words" };
  return { ok: false, why: "wrong" };
}
const nudge = (why, item, d) => why === "empty" ? (d.mode === "tiles" ? "Tap a word tile first 😊" : "Type your word first 😊")
  : d.mode === "tiles" ? "Just ONE tile goes in the gap. Tap it again to take it back ✏️" : "Just ONE word goes in each gap ✏️";
const hint = (it, tiles) => { const a = it.ans[0], k = KINDS[it.kind] || "one little word";
  return tiles ? `We need ${esc(k)}.` : `We need ${esc(k)}. It starts with “<b>${esc(a[0].toUpperCase())}…</b>” (${a.length} letters).`; };
// a wrong tile's own note (A1/A2): after a miss, and the full list under the answer
const whyNot = (it, user) => { const n = it.no && it.no[user]; return n ? `<div class="cz-no">🤔 <b>Why not “${esc(user)}”?</b> ${esc(n)}</div>` : ""; };
const more = it => it.no ? `<div class="cz-nos">${Object.entries(it.no).map(([w, n]) => `<div class="cz-no">💭 <b>Not “${esc(w)}”:</b> ${esc(n)}</div>`).join("")}</div>` : "";
WR.Cloze = { canon, check, LEVELS, KINDS };

/* ---------- the card: the text so far (two sentences before), then the gapped sentence ---------- */
function body(it, gap, S) {
  const before = S.items.slice(Math.max(0, S.n - 2), S.n).map(x => esc(x.say)).join(" ");
  return `<div class="cz-text">${before ? `<p class="cz-before">${S.n > 2 ? "… " : ""}${before}</p>` : ""}
    <div class="sw-s2 cz-s"><p id="czS">${gap}</p><button class="btn ph-say" id="czSay" aria-label="Hear the sentence">🔊</button></div></div>`;
}

/* ---------- the shelf, the round and the finish: the shared gap-round engine (js/gap-round.js) ---------- */
const G = WR.GapRound({
  id: "cloze", p: "cz", hub: "cloze", round: "clozeRound", title: "🌉 Word Bridges", icon: "🌉", quest: "cloze1", inOrder: true,
  tile: { cls: "cloze-tile", title: "Word Bridges", desc: "One little word fills each gap", unit: "texts" },
  opening: "Building the bridges… 🌉", openingRound: "🌉 Opening the story…", offline: "📴 Couldn't open Word Bridges. Check the internet and try again.",
  intro: "One word builds the bridge! 🌉", shelfBtn: "🌉 Texts", how: rid => HOW[rid], info: WR.CLOZE,
  note: (rid, d) => `👪 Grown-ups: open cloze, ${EXAM[rid]} (${d.books.length * 8} gaps at ${rid.toUpperCase()}). One word per gap; every right answer is accepted, capitals don't matter. Every answer comes with a short reason${d.mode === "tiles" ? ", and every wrong tile says why not" : ""}.`,
  gap: it => it.s, body,
  sayFirst: it => it.ask, sayDone: it => it.say,
  tiles: it => [it.ans[0]],
  placeholder: "Type one word…",
  check, nudge, hint, whyNot, more,
  shown: (it, typed, ok) => ok ? it.ans.find(a => canon(a) === canon(typed)) : it.ans[0]
});
const textsDone = G.unitsDone;
WR.clozeTile = G.tile;
WR.openCloze = G.open;
WR.startCloze = G.start;
WR.stopCloze = G.stop;
WR.Cloze._s = G.s;                                       // the running round (tests)

/* ---------- 🏷️ sticker page ---------- */
const all = G.all;
const STK = [
  { id: "first", icon: "🌉", name: "First Bridge", how: "Finish a Word Bridges text", test: () => all().length >= 1 },
  { id: "star", icon: "👑", name: "Bridge Star", how: "Get 3 crowns on a Word Bridges text", test: () => all().some(([, x]) => x.crowns === 3) },
  { id: "master", icon: "💎", name: "Master Builder", how: "Finish a C1 or C2 text", test: () => all().some(([k]) => /^(c1|c2)\./.test(k)) },
  { id: "full", icon: "🌈", name: "Rainbow Bridge", how: "Finish all 3 Word Bridges texts in one realm", test: () => LEVELS.some(l => textsDone(l) === 3) },
  { id: "grand", icon: "🌟", name: "Grand Builder", how: "Finish 9 Word Bridges texts", test: () => all().length >= 9 }
];
if (WR.Collect) WR.Collect.addPages(() => [{ id: "cloze", icon: "🌉", title: "Word Bridges", name: "Word Bridges", bg: "bg_a2", defs: STK }]);
})();
