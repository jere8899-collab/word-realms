/* 🧠 Thinking skills (AGENT-BRIEF Task 10). Rare prompts inside a lesson the child is already playing.
   About 1 of every 8–10 questions, never an extra question and never a new home tile.
   "How sure are you?" prefers a review item. Word-problem topics (story: true) offer a named strategy.
   Other questions offer "Why does this work?". None of these taps pay or take stars. */
(function () {
const WR = window.WR;
const empty = () => ({ sure: 0, sureRight: 0, asks: 0 });
const num = n => Math.max(0, n | 0);
const norm = t => t && typeof t === "object" ? { sure: num(t.sure), sureRight: num(t.sureRight), asks: num(t.asks) } : empty();
const T = WR.Think = {
  // how many prompts a round of n questions gets. 0 when the round is shorter than 8.
  // 8 → 1 (1/8), 10 → 1 (1/10), 16 → 2 (1/8), 18 → 2 (1/9). Always inside 1/10 … 1/8.
  count(n) { return n >= 8 ? Math.min(Math.floor(n / 8), Math.max(1, Math.round(n / 9))) : 0; },
  block() { const s = WR.state; if (!s) return empty(); s.think = norm(s.think); return s.think; },
  merge(a, b) { const A = norm(a), B = norm(b); return (A.sure + A.asks) >= (B.sure + B.asks) ? A : B; },
  word(it) { const t = it && window.MathGen && MathGen.topic && MathGen.topic(it.topic); return !!(t && t.story) || !!(it && it._word); },
  skip(L) { return !!(L && (L.check || L.boss || L.placement || L.guardian || L.mode === "boss" || L.mode === "dragon")); },
  mark(L) {
    const items = (L && L.items) || [];
    if (!items.length || items.some(it => it._think) || T.skip(L)) return items;
    const n = items.length, c = T.count(n); if (!c) return items;
    const review = it => !!(it && (it._rv || (L && (L.review || L.kind === "garden" || L.kind === "mix"))));
    const rev = [], wrd = [];
    items.forEach((it, i) => { if (review(it)) rev.push(i); if (T.word(it)) wrd.push(i); });
    const used = new Set();
    for (let k = 1; k <= c; k++) {
      let at = Math.min(n - 1, Math.floor((k * n) / (c + 1))), kind = "why";
      if (k === 1 && rev.length) { at = rev[0]; kind = "sure"; }
      else if (wrd.length) { at = wrd.includes(at) ? at : wrd.find(i => !used.has(i)); kind = "heur"; }
      if (used.has(at)) at = items.findIndex((_, i) => !used.has(i));
      if (rev.includes(at)) kind = "sure"; else if (wrd.includes(at)) kind = "heur";
      used.add(at); items[at]._think = kind;
    }
    return items;
  }
};
const WHY = {
  grammar: "The sentence needs this form of the word.",
  vocab: "This word fits the meaning.",
  reading: "The story says this, if you look back.",
  listening: "This matches what you heard."
};
const FOILS = ["It is the longest answer.", "It is the first button."];
T.whyFor = it => {
  const skill = String((it && it._sk) || "").split("/").pop();
  const right = it && it._word ? "The steps follow the story of the numbers." : (WHY[skill] || "It fits the meaning of the question.");
  const options = WR.shuffle([right].concat(FOILS));
  return { right, options };
};
const HEUR = {
  model: ["Draw a model", "Sketch the parts. A bar or a picture makes the story easier to see."],
  back: ["Work backwards", "Start from the end and undo each step."],
  pattern: ["Look for a pattern", "Find what repeats, or what changes by the same amount."]
};
T.bar = it => {
  if (!it || !it._think) return "";
  if (it._think === "sure") return `<div class="think-gate" data-think="sure"><p>How sure are you?</p><div class="think-row">
      <button type="button" class="btn small think-btn${it._sure === "sure" ? " on" : ""}" data-th="sure">Pretty sure</button>
      <button type="button" class="btn small think-btn${it._sure === "unsure" ? " on" : ""}" data-th="unsure">Not sure yet</button></div>
      ${it._sure ? `<p class="think-note">${it._sure === "sure" ? "Okay. Answer when you are ready." : "That's fine. Have a go anyway."}</p>` : ""}</div>`;
  if (it._think === "heur") {
    const picked = HEUR[it._heur];
    return `<div class="think-gate" data-think="heur"><p>Which way will you try?</p><div class="think-row">${Object.entries(HEUR).map(([id, pair]) =>
      `<button type="button" class="btn small think-btn${it._heur === id ? " on" : ""}" data-th="${id}">${pair[0]}</button>`).join("")}</div>
      ${picked ? `<p class="think-note">🗺️ ${WR.esc(picked[1])}</p>` : ""}</div>`;
  }
  return "";
};
T.bind = it => {
  if (!it || (it._think !== "sure" && it._think !== "heur")) return;
  document.querySelectorAll(".think-gate .think-btn").forEach(b => b.onclick = () => {
    if (it._think === "sure") it._sure = b.dataset.th; else it._heur = b.dataset.th;
    const box = b.closest(".think-gate"); if (box) box.outerHTML = T.bar(it);
    T.bind(it); T.block().asks++; WR.save();
  });
};
T.whyHTML = it => {
  if (!it || it._think !== "why") return "";
  const set = it._whySet || (it._whySet = T.whyFor(it));
  if (it._why) {
    const hit = it._why === set.right;
    return `<p class="think-note">${hit ? "Yes. That is a real reason." : "A better reason: " + WR.esc(set.right)}</p>`;
  }
  return `<div class="think-gate" data-think="why"><p>Why does this work?</p><div class="think-row">${set.options.map((o, i) =>
    `<button type="button" class="btn small think-btn" data-i="${i}">${WR.esc(o)}</button>`).join("")}</div></div>`;
};
T.bindWhy = (it, box) => {
  if (!it || it._think !== "why" || !box) return;
  const set = it._whySet;
  box.querySelectorAll('[data-think="why"] .think-btn').forEach(b => b.onclick = () => {
    if (it._why || !set) return;
    it._why = set.options[+b.dataset.i]; T.block().asks++; WR.save();
    const gate = box.querySelector('[data-think="why"]'); if (gate) gate.outerHTML = T.whyHTML(it);
  });
};
// called once when the question is finished. Returns a kind line, or "".
T.recordSure = (it, right) => {
  if (!it || it._think !== "sure" || !it._sure || it._sureNoted) return "";
  it._sureNoted = true;
  const t = T.block();
  let line = it._sure === "sure"
    ? (right ? "You felt sure, and you were right." : "You felt sure, and this one slipped. That's okay.")
    : (right ? "You weren't sure, and you still got it." : "You weren't sure, and it was a tricky one.");
  if (it._sure === "sure") { t.sure++; if (right) t.sureRight++; }
  WR.save();
  if (t.sure >= 4) line += ` When you feel sure, you are right ${t.sureRight} of ${t.sure} times.`;
  return `<p class="think-note">${WR.esc(line)}</p>`;
};
})();
