/* 🧚 Punctuation Pixies (English follow-up, 1 Nov 16:00): PUNCTUATION for every realm. One sentence per card with ONE gap where
   a mark goes (. ? ! , ' : ; — ), "no mark", or a word that needs the right capitals, apostrophe or hyphens; the child taps
   one of 4 tiles at every level. Punctuation is marked in every Cambridge writing paper and in the editing tasks of the
   Singapore MOE primary English syllabus, and the game had none.
   Data: tools/c_marks.py → data/<level>/marks.json (3 books × 8 gaps per level, 144 in all), validated by build_data.py.
     A1  . ? ! · capitals (I, names, days, places)            A2  list commas, Yes, / please · don't it's I'll · months, languages
     B1  Ali's / cats' / children's / James's · speech marks · commas after openers · its / it's
     B2  who/which: extra (commas) or needed (no mark) · colon vs semicolon · question tags, reported and polite questions
     C1  dashes and brackets in pairs · a ten-year-old / ten years old · semicolons for comma splices and lists of lists
     C2  Let's eat, Grandma! · eats shoots and leaves · However hard · man-eating, re-signed, coop / co-op · Tom and Mia's
   Every wrong tile has its own "why not" note (after a miss, and all of them under the answer: WR.GapRound notes). Marking is
   exact (a comma is not a full stop, Its is not It's); more than one tile is a friendly nudge, not a try. A first miss gives a
   💡 hint for the kind of mark and a second try; a second miss shows the answer. The narrator reads the sentence without its
   missing mark first (so the tune doesn't give a ? away) and the full sentence after checking.
   The shelf, round flow, stars and finish are the shared gap-round engine (js/gap-round.js), as in Word Bridges:
   WR.finishUnit once ever (1⭐ per right answer, ½ for a second try, + 3⭐, new crowns 2⭐ each; replays pay only new crowns).
   Answers → WR.countAnswer ("<level>/marks" in the Learning Report), the end → WR.activityDone + the marks1 quest.
   Save: WR.state.marks = { done: { "b2.1": { best, crowns, plays, at } }, rounds, lvl } inside wordRealms.save.v1 (cloud-synced;
   older saves gain the block through WR.BLOCKS in js/core.js). */
(function () {
const WR = window.WR, esc = WR.esc;
WR.MARKS = { id: "marks", name: "Punctuation Pixies", icon: "🧚", desc: "Tap the right mark for each gap" };
const LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"];
const HOW = {
  a1: "The pixies lost their marks! Tap the one that finishes each sentence, or the word with the right capital letter.",
  a2: "Tap the mark or word that fits: commas in lists, short forms like don't, capital letters for places.",
  b1: "Tap the right tile: whose is it (Ali's or cats'), what goes inside the speech marks, and pauses after openers.",
  b2: "Extra information gets commas, needed information gets none. Colon or semicolon? Tap the tile that fits.",
  c1: "Dashes and brackets come in pairs, describing words get hyphens, and two sentences need more than a comma.",
  c2: "One little mark can change the meaning. Read carefully, then tap the tile that says what the sentence means."
};
const KINDS = {
  end: "the mark that ends the sentence. Is it telling, asking, or showing a big feeling?",
  cap: "the word with the right capital letters. Names, I, days, months, places and the first word of a sentence start with a capital.",
  comma: "a little pause mark between two parts of the sentence.",
  apos: "the right apostrophe. Is it a short form (don't), or does someone own something (Sam's)? One owner or more than one?",
  speech: "the mark just before the closing speech marks, or the one just before the speech starts.",
  join: "a mark that joins two parts. A colon (:) introduces something; a semicolon (;) links two full sentences.",
  dash: "a mark for an extra bit or a surprise. Look at how the extra bit opens or closes.",
  bracket: "the partner of the mark that opened the extra bit.",
  hyphen: "the right hyphens. Words that describe a noun together are joined; after the verb they usually aren't.",
  none: "to decide: does this information tell us WHICH one (no mark), or is it extra (commas)?",
  meaning: "to think about the meaning. Does a mark here change what the sentence says?"
};
// exact: the tile tapped is a right answer; a known wrong tile is a try; anything else is several tiles (a nudge, not a try)
function check(item, user) {
  const u = String(user == null ? "" : user).trim();
  if (!u) return { ok: false, why: "empty" };
  if (item.ans.includes(u)) return { ok: true, why: null };
  if ((item.x || []).includes(u)) return { ok: false, why: "wrong" };
  return { ok: false, why: "tiles" };
}
const nudge = why => why === "empty" ? "Tap a tile first 😊" : "Just ONE tile goes in the gap. Tap it again to take it back ✏️";
const hint = it => `We need ${esc(KINDS[it.kind] || "one little mark")}`;
WR.Marks = { check, LEVELS, KINDS };

// the sentence card: bigger type, so a comma and a full stop are easy to tell apart
const body = (it, gap) => `<div class="sw-s2 pm-s"><p id="pmS">${gap}</p><button class="btn ph-say" id="pmSay" aria-label="Hear the sentence">🔊</button></div>`;

const G = WR.GapRound({
  id: "marks", p: "pm", hub: "marks", round: "marksRound", title: "🧚 Punctuation Pixies", icon: "🧚", quest: "marks1",
  tile: { cls: "marks-tile", title: "Punctuation Pixies", desc: "Tap the right mark for each gap", unit: "books" },
  opening: "Waking up the pixies… 🧚", openingRound: "🧚 Sprinkling the marks…", offline: "📴 Couldn't open Punctuation Pixies. Check the internet and try again.",
  intro: "Help the pixies put the marks back! 🧚", shelfBtn: "🧚 Books", how: rid => HOW[rid], info: WR.MARKS,
  note: (rid, d) => `👪 Grown-ups: punctuation for writing (${d.books.length * 8} gaps at ${rid.toUpperCase()}), the marks checked in Cambridge writing papers and in MOE primary English editing. Every tile is a real choice: the wrong ones each say why not, and every answer comes with a short rule.`,
  gap: it => it.s, body,
  sayFirst: it => it.ask, sayDone: it => it.say,
  tiles: it => [it.ans[0]],
  check, nudge, hint, notes: true,
  shown: it => it.ans[0]
});
const done = G.unitsDone;
WR.marksTile = G.tile;
WR.openMarks = G.open;
WR.startMarks = G.start;
WR.stopMarks = G.stop;
WR.Marks._s = G.s;                                       // the running round (tests)

/* ---------- 🏷️ sticker page ---------- */
const all = G.all;
const STK = [
  { id: "first", icon: "🧚", name: "Pixie Helper", how: "Finish a Punctuation Pixies book", test: () => all().length >= 1 },
  { id: "star", icon: "👑", name: "Perfect Marks", how: "Get 3 crowns on a Punctuation Pixies book", test: () => all().some(([, x]) => x.crowns === 3) },
  { id: "master", icon: "💎", name: "Mark Master", how: "Finish a C1 or C2 book", test: () => all().some(([k]) => /^(c1|c2)\./.test(k)) },
  { id: "full", icon: "🌈", name: "Pixie Ring", how: "Finish all 3 Punctuation Pixies books in one realm", test: () => LEVELS.some(l => done(l) === 3) },
  { id: "grand", icon: "🌟", name: "Pixie Queen", how: "Finish 9 Punctuation Pixies books", test: () => all().length >= 9 }
];
if (WR.Collect) WR.Collect.addPages(() => [{ id: "marks", icon: "🧚", title: "Punctuation Pixies", name: "Punctuation Pixies", bg: "bg_a1", defs: STK }]);
})();
