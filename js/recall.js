/* ✍️ BRIEF-T7 "Type it first" (AGENT-BRIEF-2026-11-04 Task 7, specs/007-recall-practice). Loaded before js/lesson.js.
   Some questions hide their choices at first: the child types the answer (a short word or phrase, with a first-letter hint),
   and only then, if they're not sure or it was a miss, the usual choices appear. Remembering beats recognising.
   • which bank items: marked `recall: 1` by tools/build_data.py (mark_recall: a share per level, fewer for the youngest)
   • every eligible review item too (a lesson's review slots and the Mistake Garden): answer first, then choices
   • never in boss / dragon rounds (timers), classic-only test runs or tests that opt out (window.__WR_NO_RECALL); the same answer path, stars and pass mark as before
   eligible() is mirrored by recall_ok() in tools/build_data.py: keep the two the same. */
(function () {
const WR = window.WR;
const NUM = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty".split(" ");
const toks = t => String(t == null ? "" : t).toLowerCase().replace(/[‘’`´]/g, "'").replace(/[^a-z0-9' ]+/g, " ").split(/\s+/).filter(Boolean)
  .map(w => NUM.includes(w) ? String(NUM.indexOf(w)) : w);
// capitals, punctuation, curly quotes and a leading a / an / the don't matter; number words = digits
const canon = t => { let w = toks(t); if (w.length > 1 && /^(a|an|the)$/.test(w[0])) w = w.slice(1); return w.join(" "); };
const has = (text, c) => (" " + toks(text).join(" ") + " ").includes(" " + c + " ");
const VOCABQ = /mean|opposite|word for|called|what is this|which word/i;
const R = WR.Recall = {
  CONFIG: { maxWords: 3, maxChars: 24, closeFrom: 5 },
  canon,
  // a short, unique answer a child can produce and the game can mark fairly (a gap in a sentence, a picture, a word
  // meaning, or words that are in the story / in what they heard)
  eligible(it) {
    if (!it || it.recall) return !!(it && it.recall && it.correct);
    if (!it || (it.type !== "mcq" && it.type !== "listen") || it.dialogue || !Array.isArray(it.options) || it.options.length < 3 || it.correct == null) return false;
    const c = canon(it.correct);
    if (!c || c.split(" ").length > R.CONFIG.maxWords || c.length > R.CONFIG.maxChars || !/^[a-z0-9][a-z0-9' ]*$/.test(c)) return false;
    if (new Set(it.options.map(canon)).size < it.options.length || /^(true|false|not given|yes|no)$/.test(c)) return false;
    if (it.passage) return has(it.passage.text, c);
    if (it.type === "listen") return has(it.say, c);
    return /___/.test(it.q || "") || !!it.pic || VOCABQ.test(it.q || "");
  },
  // type it first here? marked bank items and review items, not in timed rounds or classic-only test runs
  on(it, L) { return !window.__WR_CLASSIC_ONLY && !window.__WR_NO_RECALL && !!L && L.mode !== "boss" && L.mode !== "dragon" && !L.noRecall &&
    !!(it.recall || it._rv || L.review) && R.eligible(it); },
  // "under the table" → "u _ _ _ _   t _ _   t _ _ _ _"
  mask: t => String(t).trim().split(/\s+/).map(w => [...w].map((ch, i) => i === 0 || !/[a-z0-9]/i.test(ch) ? ch : "_").join(" ")).join("   "),
  // "right" | "close" (one letter off, 5+ letters: a friendly nudge, not a try) | "miss"
  mark(val, it) {
    const a = canon(val), c = canon(it.correct);
    if (!a) return "empty";
    if (a === c || a.replace(/'/g, "") === c.replace(/'/g, "")) return "right";   // "cant" = "can't"
    return c.length >= R.CONFIG.closeFrom && lev1(a, c) ? "close" : "miss";
  },
  // 🌱 BRIEF-T7B: younger children also get a word bank (tapping a word types it) and, where the item already has a
  // picture, the picture stays on screen. The first-letter hint stays too.
  bank: (it, L) => L && L.realm && /^(a1|a2)$/.test(L.realm.id),
  html: (it, optsHTML, bank) => `<div class="recall" id="recCard"><div class="rec-hint">✍️ Type it first! <span class="rec-mask" aria-label="Hint: starts with ${WR.esc(String(it.correct).trim()[0] || "")}">${WR.esc(R.mask(it.correct))}</span></div>
    <input class="dict-in rec-in" id="recIn" type="text" placeholder="Type your answer…" aria-label="Type your answer" maxlength="40">
    ${bank ? `<div class="tiles rec-bank" id="recBank" aria-label="Word bank: tap a word to use it">${bank.map((w, k) => `<button class="tile" data-k="${k}">${WR.esc(w)}</button>`).join("")}</div>` : ""}
    <div class="row rec-row"><button class="btn mint" id="checkBtn" disabled>✅ Check</button><button class="btn ghost small" id="recShow">🤔 Show choices</button></div></div>
    <div id="recMsg" class="rec-msg" hidden></div>${optsHTML(it, ' id="recOpts" hidden')}`,
};
// exactly one letter added, dropped or changed
function lev1(a, b) {
  if (Math.abs(a.length - b.length) > 1 || a === b) return false;
  let i = 0; while (i < a.length && a[i] === b[i]) i++;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1);
  return a.length > b.length ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
}
})();
