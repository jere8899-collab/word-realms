/* ⚒️ Word Forge (English follow-up, 1 Nov): Cambridge-style WORD FORMATION for every realm. A sentence has one gap and a ROOT
   word in capitals; the child forges the right form of the root to fit (She sang ___ (BEAUTY) → beautifully), the task of
   B1 Preliminary and Part 3 of B2 First, C1 Advanced and C2 Proficiency Use of English, scaled down at A1/A2.
   Data: tools/c_forge.py → data/<level>/forge.json (3 anvils × 8 items per level, 144 in all), validated by build_data.py.
     A1  plurals, -er/-est, -er "who does it" nouns (tiles)       A2  -ful/-y, -ly adverbs, spelling changes (tiles)
     B1  un-/dis-/im-, -ness/-ment/-tion, -able/-less/-ous (typed) B2  re-/mis-/over-/ir-/il-/in-, -ance/-ity/-ship, -ive/-ic (typed)
     C1  negative + suffix combos, -en/-ify/-ise verbs, spelling shifts      C2  rare and stacked affixes (typed)
   Tile levels build the word from its parts (happi + ly); typed levels type it. Marking (canon(), the same as build_data.py):
   case, spaces at the ends and full stops don't matter. Leaving the root unchanged, or typing several words, is a friendly
   nudge, not a try. A first miss gives a 💡 hint (first letters + length) and a second try; a second miss shows the answer.
   Every item has a short "why" (tip) and narrator recordings of the gapped sentence ("blank") and the full sentence.
   The shelf, round flow, stars and finish are the shared gap-round engine (js/gap-round.js), exactly as in Spell Swap:
   WR.finishUnit once ever (1⭐ per right answer, ½ for a second try, + 3⭐, new crowns 2⭐ each; replays pay only new crowns).
   Answers → WR.countAnswer ("<level>/forge" in the Learning Report), the end → WR.activityDone + the forge1 quest.
   Save: WR.state.forge = { done: { "b2.1": { best, crowns, plays, at } }, rounds, lvl } inside wordRealms.save.v1 (cloud-synced;
   older saves gain the block through WR.BLOCKS in js/core.js). */
(function () {
const WR = window.WR, esc = WR.esc;
WR.FORGE = { id: "forge", name: "Word Forge", icon: "⚒️", desc: "Make the right form of the word" };
const LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"];
const HOW = {
  a1: "Make the word fit the gap! Tap the word-part tiles to build it.",
  a2: "Make the word fit the gap! Tap the word-part tiles to build it.",
  b1: "Change the word in CAPITALS so it fits the gap. Type one word.",
  b2: "Change the word in CAPITALS so it fits the gap. You may need a beginning (un-, mis-) and an ending (-ness, -ive).",
  c1: "Change the word in CAPITALS so it fits the gap. Watch out for two endings at once and spelling changes!",
  c2: "Change the word in CAPITALS so it fits the gap. Some words need three or four parts!"
};
const EXAM = { a1: "Cambridge Starters–Flyers grammar", a2: "A2 Key grammar", b1: "B1 Preliminary style", b2: "B2 First, Use of English Part 3", c1: "C1 Advanced, Use of English Part 3", c2: "C2 Proficiency, Use of English Part 3" };

/* ---------- marking ---------- */
// lower case, curly quotes straightened, anything but letters, apostrophes and hyphens taken out; mirrors forge_canon() in build_data.py
function canon(t) {
  t = String(t == null ? "" : t).trim().toLowerCase().replace(/[‘’`´]/g, "'").replace(/[^a-z' -]+/g, " ");
  return t.replace(/-/g, " - ").split(/\s+/).filter(Boolean).join(" ").replace(/ - /g, "-");
}
// → { ok, why: null | "empty" | "root" | "words" | "wrong" }
function check(item, user) {
  const u = canon(user);
  if (!u) return { ok: false, why: "empty" };
  if (item.ans.some(a => canon(a) === u)) return { ok: true, why: null };
  if (u === canon(item.root)) return { ok: false, why: "root" };
  if (u.includes(" ") && !item.ans.some(a => canon(a).includes(" "))) return { ok: false, why: "words" };
  return { ok: false, why: "wrong" };
}
const nudge = (why, item, d) => why === "empty" ? (d.mode === "tiles" ? "Tap some word-part tiles first 😊" : "Type your word first 😊")
  : why === "root" ? `Change <b>${esc(item.root)}</b> so it fits the gap ⚒️`
  : "Just one word goes in the gap ✏️";
const letters = w => w.replace(/[^a-z]/gi, "").length;
WR.Forge = { canon, check, LEVELS };

/* ---------- the shelf, the round and the finish: the shared gap-round engine (js/gap-round.js) ---------- */
const G = WR.GapRound({
  id: "forge", p: "fg", hub: "forge", round: "forgeRound", title: "⚒️ Word Forge", icon: "⚒️", quest: "forge1",
  tile: { cls: "forge-tile", title: "Word Forge", desc: "Make the right form of the word", unit: "anvils" },
  opening: "Heating up the forge… 🔥", openingRound: "🔥 Lighting the anvil…", offline: "📴 Couldn't open the Word Forge. Check the internet and try again.",
  intro: "Forge the right word! 🔥", shelfBtn: "⚒️ Anvils", how: rid => HOW[rid], info: WR.FORGE,
  note: (rid, d) => `👪 Grown-ups: word formation, ${EXAM[rid]} (${d.books.length * 8} at ${rid.toUpperCase()}). Capitals and spaces don't matter; spelling does. Every answer comes with a short reason.`,
  gap: it => it.s,
  body: (it, gap) => `<div class="sw-cue fg-cue"><span class="sw-key fg-root" aria-label="Root word">⚒️ ${esc(it.root)}</span><button class="btn ph-say" id="fgSay" aria-label="Hear the sentence">🔊</button></div>
      <div class="sw-s2 fg-s"><p id="fgS">${gap}</p></div>`,
  sayFirst: it => it.ask, sayDone: it => it.say,
  tiles: it => it.p, join: "",
  placeholder: "Type the word…",
  check, nudge,
  hint: (it, tiles) => { const a = it.ans[0], n = tiles ? it.p.length : letters(a);
    return `It starts with “<b>${esc(a.slice(0, a.length > 7 ? 3 : 2))}…</b>” (${n} ${tiles ? (n > 1 ? "tiles" : "tile") : "letters"}).`; },
  shown: (it, typed, ok) => ok ? it.ans.find(a => canon(a) === canon(typed)) : it.ans[0]
});
const anvilsDone = G.unitsDone;
WR.forgeTile = G.tile;
WR.openForge = G.open;
WR.startForge = G.start;
WR.stopForge = G.stop;
WR.Forge._s = G.s;                                       // the running round (tests)

/* ---------- 🏷️ sticker page ---------- */
const all = G.all;
const STK = [
  { id: "first", icon: "⚒️", name: "First Forge", how: "Finish a Word Forge anvil", test: () => all().length >= 1 },
  { id: "star", icon: "👑", name: "Forge Star", how: "Get 3 crowns on a Word Forge anvil", test: () => all().some(([, x]) => x.crowns === 3) },
  { id: "master", icon: "💎", name: "Master Smith", how: "Finish a C1 or C2 anvil", test: () => all().some(([k]) => /^(c1|c2)\./.test(k)) },
  { id: "full", icon: "🔥", name: "Hot Forge", how: "Finish all 3 Word Forge anvils in one realm", test: () => LEVELS.some(l => anvilsDone(l) === 3) },
  { id: "grand", icon: "🌟", name: "Grand Smith", how: "Finish 9 Word Forge anvils", test: () => all().length >= 9 }
];
if (WR.Collect) WR.Collect.addPages(() => [{ id: "forge", icon: "⚒️", title: "Word Forge", name: "Word Forge", bg: "bg_b2", defs: STK }]);
})();
