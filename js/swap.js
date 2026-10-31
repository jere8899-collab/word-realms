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
   The shelf, round flow and finish are the shared gap-round engine (js/gap-round.js); this file keeps data rules + the card.
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

/* ---------- the shelf, the round and the finish: the shared gap-round engine (js/gap-round.js) ---------- */
const G = WR.GapRound({
  id: "swap", p: "sw", hub: "swap", round: "swapRound", title: "🔀 Spell Swap", icon: "🔀", quest: "swap1",
  tile: { cls: "swap-tile", title: "Spell Swap", desc: "Same meaning, new words", unit: "books" },
  opening: "Opening the spell books… ✨", openingRound: "✨ Opening the spell book…", offline: "📴 Couldn't open the spell books. Check the internet and try again.",
  intro: "Same meaning, new words! ✨", shelfBtn: "🔀 Books", how: rid => HOW[rid], load, set,
  note: (rid, d) => `👪 Grown-ups: ${EXAM[rid]} sentence transformations (${d.books.length * 8} at ${rid.toUpperCase()}). Contractions count as two words, as in the exams. Every answer comes with the rule and an example.`,
  gap: it => it.b,
  body: (it, gap, S) => `<div class="sw-s1"><span class="sw-num">1</span><p>${esc(it.a)}</p><button class="btn ph-say" id="swSay" aria-label="Hear sentence 1">🔊</button></div>
      <div class="sw-cue">${S.d.key ? `<span class="sw-key" aria-label="Key word">🔑 ${esc(it.cue)}</span><small>${N_WORDS[S.d.min]}–${N_WORDS[S.d.max]} words</small>` : `<span class="sw-ins">🪄 ${esc(it.cue)}</span>`}</div>
      <div class="sw-s2"><span class="sw-num">2</span><p id="swS2">${gap}</p></div>`,
  sayFirst: it => it.a, sayDone: it => it.say,
  tiles: it => it.ans[0].split(" "), join: " ",
  placeholder: "Type the missing words…", count: (typed, it) => count(gapPart(typed, it.b)) + " words",
  check, nudge,
  hint: (it, tiles) => { const n = tiles ? it.ans[0].split(" ").length : count(it.ans[0]);   // tiles: how many tiles; typed: exam word count
    return `It starts with “<b>${esc(it.ans[0].split(" ")[0])}…</b>” (${N_WORDS[n] || n} ${tiles ? (n > 1 ? "tiles" : "tile") : n > 1 ? "words" : "word"}).`; },
  shown: (it, typed, ok) => ok ? it.ans.find(a => canon(a) === gapPart(typed, it.b)) : it.ans[0]
});
const booksDone = G.unitsDone;
WR.swapTile = G.tile;
WR.openSwap = G.open;
WR.startSwap = G.start;
WR.stopSwap = G.stop;
WR.Swap._s = G.s;                                        // the running round (tests)

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
