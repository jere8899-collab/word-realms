/* 🦁 Singapore School English (Jeremy, 2 Nov 2026): a second way to choose English levels, next to the fairy realms (A1–C2).
   Players pick their Singapore school level — Primary 1–6, Secondary 1–4/5, JC 1–2 or Grown-up — and play games shaped like
   the local papers (EL Syllabus 2020; PSLE English 0001 from 2025; O-Level English 1184; H1 General Paper 8881).
   Mirrors the maths realm (js/math.js): a level picker (chips with crown bars), one card per game with its crowns, a
   🎲 mixed practice round, the exam names folded away in a "For grown-ups" note, and progress saved in the save block.
   Content: each level borrows the matching Cambridge banks (weights in LEVELS[].cefr, e.g. P5 = A2 + B1) and adds its own
   Singapore games from data/sg/<level>.json (tools/sg_build.py): 🔗 Join It Up (synthesis & transformation), 🔍 Spot & Fix
   (editing for spelling and grammar), 🧩 Story Gaps (comprehension cloze). Speaking and Writing open Echo Well and Story
   Quill of the matching realm and come back here (WR.from, js/main.js).
   Lessons run in the shared lesson engine (js/lesson.js) as the pseudo-realms "sg-p1" … "sg-adult" (WR.extraRealms), so
   stars (anti-farm: an item already answered in a fairy realm pays nothing again), the Mistake Garden, the pet and quests
   work exactly as in the realms. Save: WR.state.sg = { track: "cefr" | "sg", level, done: { "p5.synth": { best, crowns,
   plays, at } }, rounds } inside wordRealms.save.v1 (WR.BLOCKS; cloud-synced; crowns count in the cloud progress score).
   Marking (canon(), the same rules as tools/sg_build.py): capitals, punctuation and curly quotes don't matter; contractions
   equal their long forms; a typed whole sentence loses its printed start/end; a missing given word, an unchanged mistake
   or two words in a one-word gap is a friendly nudge, not a try. */
(function () {
const WR = window.WR, esc = WR.esc;
const SG = WR.SG = {};
// id, chip label, name, place name (the level's "game mode" line), stage, Cambridge banks used (weights), main realm (art, Echo Well, Story Quill), lesson look
const LV = (id, label, name, place, stage, cefr, main, mode) => ({ id, label, name, place, stage, cefr, main, mode });
const LEVELS = SG.LEVELS = [
  LV("p1", "P1", "Primary 1", "Merlion Bay", "primary", { a1: 1 }, "a1", "picture"),
  LV("p2", "P2", "Primary 2", "Orchid Garden", "primary", { a1: 3, a2: 1 }, "a1", "picture"),
  LV("p3", "P3", "Primary 3", "Hawker Lane", "primary", { a2: 3, a1: 1 }, "a2", "candy"),
  LV("p4", "P4", "Primary 4", "Supertree Grove", "primary", { a2: 1 }, "a2", "candy"),
  LV("p5", "P5", "Primary 5", "Kampong Glade", "primary", { a2: 1, b1: 1 }, "b1", "forest"),
  LV("p6", "P6", "Primary 6", "Lantern Bridge", "primary", { b1: 3, a2: 1 }, "b1", "forest"),
  LV("s1", "Sec 1", "Secondary 1", "Botanic Path", "secondary", { b1: 1 }, "b1", "forest"),
  LV("s2", "Sec 2", "Secondary 2", "Marina Lights", "secondary", { b1: 3, b2: 1 }, "b1", "forest"),
  LV("s3", "Sec 3", "Secondary 3", "Sentosa Shore", "secondary", { b2: 3, b1: 1 }, "b2", "council"),
  LV("s4", "Sec 4/5", "Secondary 4 / 5", "Skyline Summit", "secondary", { b2: 1 }, "b2", "council"),
  LV("jc1", "JC 1", "Junior College 1", "Riverside Forum", "jc", { b2: 1, c1: 1 }, "c1", "council"),
  LV("jc2", "JC 2", "Junior College 2", "Esplanade Hall", "jc", { c1: 1 }, "c1", "council"),
  LV("adult", "Adult", "Grown-up learners", "Starlight Archive", "adult", { c1: 1, c2: 1 }, "c2", "council")
];
SG.level = id => LEVELS.find(l => l.id === id) || null;
// every level is a pseudo-realm for the lesson engine, the Mistake Garden and the report (WR.realmById)
LEVELS.forEach(l => WR.extraRealms.push({ id: "sg-" + l.id, level: l.label, name: l.name, emoji: "🦁", bg: "bg_" + l.main, mode: l.mode, modeName: l.place, sg: l.id }));

/* ---------- the games (child words) and what each one practises (grown-up words, by stage) ---------- */
const COMP = SG.COMP = {
  grammar: { icon: "🪄", name: "Grammar", desc: "Spells of sentence magic", bank: "grammar" },
  vocab: { icon: "🌟", name: "Vocabulary", desc: "Word gems in sentences", bank: "vocab" },
  edit: { icon: "🔍", name: "Spot & Fix", desc: "Find the mistake, write it right", sg: "edit" },
  synth: { icon: "🔗", name: "Join It Up", desc: "Two sentences become one", sg: "synth" },
  ccloze: { icon: "🧩", name: "Story Gaps", desc: "One word fits each gap", sg: "ccloze" },
  reading: { icon: "📖", name: "Reading", desc: "Read and answer", bank: "reading" },
  listening: { icon: "🎧", name: "Listening", desc: "Listen and answer", bank: "listening" },
  speak: { icon: "🎤", name: "Speaking", desc: "Read aloud and chat", open: "speak" },
  write: { icon: "✒️", name: "Writing", desc: "Plan, write, get feedback", open: "write" }
};
const GAMES = {
  p1: ["grammar", "vocab", "edit", "reading", "listening", "speak", "write"],
  p2: ["grammar", "vocab", "edit", "synth", "reading", "listening", "speak", "write"],
  full: ["grammar", "vocab", "edit", "synth", "ccloze", "reading", "listening", "speak", "write"],
  upper: ["grammar", "vocab", "edit", "reading", "listening", "speak", "write"]
};
SG.games = l => GAMES[l.id === "p1" ? "p1" : l.id === "p2" ? "p2" : /^(p[3-6]|s[12])$/.test(l.id) ? "full" : "upper"];
SG.quizGames = l => SG.games(l).filter(c => !COMP[c].open);
const EXAM = {
  primary: { grammar: "Paper 2 Booklet A grammar MCQ and Booklet B grammar cloze", vocab: "Paper 2 Booklet A vocabulary MCQ and vocabulary cloze", edit: "Paper 2 Booklet B editing for spelling and grammar",
    synth: "Paper 2 Booklet B synthesis and transformation", ccloze: "Paper 2 Booklet B comprehension cloze", reading: "Paper 2 visual text and open-ended comprehension (practised here as multiple choice, true/false, events in order and find-the-word)",
    listening: "Paper 3 listening comprehension", speak: "Paper 4 reading aloud and stimulus-based conversation (Echo Well)", write: "Paper 1 situational and continuous writing (Story Quill)" },
  secondary: { grammar: "grammar for Paper 1 editing and writing", vocab: "vocabulary in context (Paper 2)", edit: "Paper 1 Section A editing (a short text with grammar errors) plus find-the-mistake sentences",
    synth: "lower-secondary synthesis and transformation (school papers)", ccloze: "lower-secondary cloze passage (school papers)", reading: "Paper 2 comprehension (narrative and non-narrative texts)",
    listening: "Paper 3 listening", speak: "Paper 4 planned response and spoken interaction (Echo Well)", write: "Paper 1 Sections B and C situational and continuous writing (Story Quill)" },
  jc: { grammar: "accuracy for the Paper 1 essay", vocab: "vocabulary for argument and Paper 2 'own words' answers", edit: "proofreading (find-the-mistake sentences)",
    reading: "Paper 2 comprehension: inference, evaluation, language use", listening: "listening to arguments", speak: "discussion and presentation", write: "Paper 1 argumentative essay (Story Quill C1 tasks)" },
  adult: { grammar: "advanced grammar and style", vocab: "precise and idiomatic vocabulary", edit: "proofreading (find-the-mistake sentences)", reading: "reading for nuance and argument",
    listening: "listening to talks and discussions", speak: "discussion and presentation", write: "essays, reports and reviews (Story Quill)" }
};
const SYLL = {
  primary: "PSLE English (EL Syllabus 2020, format from 2025): Paper 1 Writing 50 marks (situational 14, continuous 36), Paper 2 Language Use and Comprehension 90, Paper 3 Listening 20, Paper 4 Oral 40 (reading aloud 15, stimulus-based conversation 25).",
  secondary: "GCE O-Level English Language 1184: Paper 1 Writing 70 (editing 10, situational 30, continuous 30), Paper 2 Comprehension 50 (incl. visual text and an 80-word summary), Paper 3 Listening 30, Paper 4 Oral 30. Students under Full Subject-Based Banding sit the SEC from 2027. Sec 5 N(A) students use Sec 4/5.",
  jc: "GCE A-Level H1 General Paper 8881: Paper 1 Essay (1 of 8 questions, 500–800 words), Paper 2 Comprehension (3 passages, about 1,200 words: comprehension, summary, connections across passages and a 12-mark application question).",
  adult: "Beyond school: CEFR C1–C2, the same level as the Starlight Library realm."
};
const CEFR_OF = l => Object.keys(l.cefr).map(x => x.toUpperCase()).join(" + ");

/* ---------- state ---------- */
SG.st = () => WR.block("sg");
SG.track = () => (WR.state && WR.state.sg && WR.state.sg.track) || "cefr";
SG.setTrack = t => { SG.st().track = t; WR.save(); };
SG.best = (lv, c) => SG.st().done[lv + "." + c] || null;
const crowns = (lv, c) => { const d = SG.best(lv, c); return d ? d.crowns : null; };
SG.levelCrowns = l => { const g = SG.quizGames(l); return { have: g.reduce((a, c) => a + (crowns(l.id, c) || 0), 0), max: g.length * 3, played: g.filter(c => SG.best(l.id, c)).length, n: g.length }; };
SG.record = (lv, c, score) => {
  const st = SG.st(), k = lv + "." + c, p = st.done[k];
  st.done[k] = { best: Math.max(score, p ? p.best : 0), crowns: Math.max(WR.crowns(score), p ? p.crowns : 0), plays: (p ? p.plays : 0) + 1, at: Date.now() };
  st.rounds++; WR.state.lessonsDone++; WR.save();
  if (COMP[c] && COMP[c].sg) WR.questEvent("sgame1");   // N2: the Singapore track's own daily quest
};

/* ---------- marking ---------- */
const canon = SG.canon = t => String(t == null ? "" : t).toLowerCase().replace(/[‘’`´]/g, "'").replace(/[^a-z0-9' ]+/g, " ")
  .replace(/\bcan't\b|\bcannot\b/g, "can not").replace(/\bwon't\b/g, "will not").replace(/n't\b/g, " not").replace(/'m\b/g, " am")
  .replace(/'re\b/g, " are").replace(/'ve\b/g, " have").replace(/'ll\b/g, " will").split(/\s+/).filter(Boolean).join(" ");
const reWord = w => new RegExp("(^| )" + canon(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "( |$)");
const dist = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
// 🤔 why-not notes for the usual slips in a joined sentence (checked on the whole answer line)
const SLIPS = [
  [/\b(although|though)\b.*\bbut\b/, "‘Although’ and ‘but’ do the same job. Use only one of them in a sentence."],
  [/\bdespite of\b/, "Say ‘despite’ or ‘in spite of’, never ‘despite of’."],
  [/\bunless\b.*\b(not|never)\b/, "‘Unless’ already means ‘if … not’, so the verb after it stays positive."],
  [/\bneither\b.*\bnor\b.*\b(not|never)\b/, "‘Neither … nor’ is already a ‘no’ sentence, so don't add ‘not’."],
  [/\btoo\b.*\bto \w+ (it|them)$/, "With ‘too … to’, leave out ‘it’ at the end: too heavy to lift."],
  [/\bno sooner\b.*\bwhen\b/, "‘No sooner’ goes with ‘than’, not ‘when’."],
  [/\b(hardly|scarcely)\b.*\bthan\b/, "‘Hardly’ and ‘scarcely’ go with ‘when’ (or ‘before’), not ‘than’."],
  [/\bprefers?\b.*\bthan\b/, "We say ‘prefer … to …’, not ‘prefer … than’."],
  [/\b(did|does|do) (\w+ )?(\w+ed|went|saw|ate|took|made|found)\b/, "After did / does / do, use the base verb (go, see, eat), not the past form."]
];
SG.mark = (it, val) => {
  const c = canon(val);
  if (!c) return { nudge: "Type your answer first ✏️" };
  if (it.type === "typed") {
    const lead = canon(it.lead), tail = canon(it.tail); let v = c;
    if (lead && (v === lead || v.startsWith(lead + " "))) v = v.slice(lead.length).trim();
    if (tail && v.endsWith(" " + tail)) v = v.slice(0, -tail.length - 1).trim();
    if (!v) return { nudge: "Finish the sentence after the words that are already there ✏️" };
    const line = [lead, v, tail].filter(Boolean).join(" "), miss = (it.need || []).find(w => !reWord(w).test(line));
    if (miss) return { nudge: `Use “${miss}” in your answer 💡` };
    const ok = it.answers.some(a => canon(a) === v), slip = !ok && SLIPS.find(([re]) => re.test(line));
    return { ok, got: v, note: ok ? "" : slip ? slip[1] : "It doesn't mean quite the same as the two sentences, or a word is different from what the rule needs. Compare it with the answer, word by word." };
  }
  if (it.type === "fix" && c === canon(it.wrong)) return { nudge: "That's the word with the mistake. Type the correct word instead ✏️" };
  if (it.type === "fill" && String(val).trim().split(/\s+/).length > 1) return { nudge: "Just one word for each gap 💡" };
  const ok = it.answers.some(a => canon(a) === c);
  if (ok) return { ok, got: c, note: "" };
  const near = it.answers.some(a => dist(canon(a), c) <= 2);
  const note = it.type === "fix" && it.kind === "spelling" ? (near ? "So close! Check each letter again." : "That is not how the word is spelt.")
    : it.type === "fix" ? (near ? "Nearly! Check the ending of the word." : "That word doesn't fix the mistake. Read the whole sentence around it again.")
    : "That word doesn't fit this gap. Read the sentence before and after the gap again.";
  return { ok, got: c, note };
};
// the answer box under the question (lesson.js qBody)
SG.cardHTML = it => {
  const input = ph => `<input class="dict-in sg-in" id="sgIn" type="text" placeholder="${ph}" aria-label="Your answer">`;
  const check = `<div class="row" style="margin-top:8px"><button class="btn mint" id="checkBtn" disabled>✅ Check</button></div>`;
  if (it.type === "typed") return `<div class="sg-pair">${[it.s1, it.s2].filter(Boolean).map(s => `<p>${esc(s)}</p>`).join("")}<button class="btn ghost small" id="hearQ">🔊 Hear it</button></div>
    <div class="sg-line"><span class="sg-lead">${esc(it.lead)}</span>${input("finish the sentence…")}${it.tail ? `<span class="sg-lead">${esc(it.tail)}</span>` : ""}</div>${check}`;
  if (it.type === "fix") return `<div class="sg-line"><span class="pill sg-kind">${it.kind === "spelling" ? "🔤 Spelling" : "🪄 Grammar"}</span><s class="sg-wrong">${esc(it.wrong)}</s> <span aria-hidden="true">→</span> ${input("the right word")}</div>${check}`;
  return `<div class="sg-line"><b class="sg-n">${it.n}</b>${input("one word")}</div>${check}`;
};
SG.resultHTML = (it, val, r) => {
  const model = it.type === "typed" ? it.full : it.answer, also = it.type === "typed" ? [] : [...new Map(it.answers.slice(1).filter(a => canon(a) !== r.got && canon(a) !== canon(model)).map(a => [canon(a), a])).values()];
  const hear = `<button class="btn ghost small" id="hearFull">🔊 ${it.type === "typed" ? "Hear the sentence" : "Hear the whole text"}</button>`;
  return `${r.ok ? "" : `<div class="why-not">🤔 <b>Why not “${esc(String(val).trim())}”?</b> ${esc(r.note)}</div>`}<div class="sg-model">${r.ok ? "⭐" : "✅"} <b>${esc(model)}</b></div>${also.length ? `<div class="muted" style="font-weight:700;font-size:.85rem">Also right: ${also.map(esc).join(" · ")}</div>` : ""}${hear}`;
};

/* ---------- building a round ---------- */
const playable = q => WR.playable ? WR.playable(q) : true;
const split = (l, n) => { const w = Object.entries(l.cefr), tot = w.reduce((a, [, x]) => a + x, 0); let left = n;
  return w.map(([rid, x], i) => { const k = i === w.length - 1 ? left : Math.round(n * x / tot); left -= k; return [rid, Math.max(0, k)]; }); };
/* 🔁 rev: mix in up to 3 due reviews (js/review.js) from the same realm banks, keyed like realm lessons ("<rid>/<skill>"),
   so a sentence learned here or in a realm is one record; the rest of the round is new. */
const RVOK = rev => rev && WR.Review;
const perLesson = () => WR.Review.CONFIG.perLesson;
async function fromBanks(l, skill, n, bucket, filter = () => true, rev = false) {
  const out = [], banks = [];
  for (const [rid] of split(l, n)) banks.push([rid, (await WR.bank(rid, skill)).filter(q => playable(q) && filter(q))]);
  const revs = [];
  const slots = RVOK(rev) ? Math.min(n, Math.max(...banks.map(([rid]) => WR.Review.slots(`${rid}/${skill}`)))) : 0;
  if (RVOK(rev)) for (const [rid, bank] of banks) revs.push(...WR.Review.pick(`${rid}/${skill}`, bank, slots - revs.length, { bucket: `${bucket}/${rid}` }));
  const skipOf = rid => { const pre = `${rid}/${skill}:`, ks = revs.flatMap(it => [it._rk, it._rv.for]).filter(k => k.startsWith(pre)).map(k => k.slice(pre.length)); return ks.length ? new Set(ks) : null; };
  for (const [rid, k] of split(l, n - revs.length)) { if (!k) continue; const bank = banks.find(b => b[0] === rid)[1];
    out.push(...WR.freshPick(`${bucket}/${rid}`, bank, k, skipOf(rid)).map(q => tag(WR.normalize(q), `${rid}/${skill}`, q))); }
  return WR.shuffle(out.concat(revs));
}
const tag = (it, scope, q, p) => WR.Review ? WR.Review.tag(it, scope, q, p) : it;
// passages: scopeOf(p) names each passage's bank (a realm's reading bank, or this level's own game)
const passageItems = (bucket, ps, n, scopeOf, rev = false) => {
  const r = RVOK(rev) && n >= 2 ? [...new Set(ps.map(scopeOf))].map(sc => WR.Review.pickPassage(sc, ps.filter(p => scopeOf(p) === sc), perLesson(), { bucket })).find(Boolean) : null;
  const fresh = WR.freshPick(bucket, ps, r ? n - 1 : n, r ? new Set([WR.itemKey(r.passage)]) : null);
  return fresh.flatMap(p => p.questions.filter(playable).map(q => tag(WR.normalize(q, p), scopeOf(p), q, p))).concat(r ? r.items.filter(it => playable(it._raw || it)) : []);
};
SG.items = async (lv, c, n = 8, o = {}) => {
  const l = SG.level(lv), C = COMP[c], b = `sg-${lv}/${c}`, rev = !!o.review;
  if (C.bank === "reading") {
    const sc = new Map(), ps = (await Promise.all(Object.keys(l.cefr).map(r => WR.bank(r, "reading").then(x => { x.passages.forEach(p => sc.set(p, r + "/reading")); return x.passages; })))).flat().filter(p => p.questions.some(playable));
    return passageItems(b, ps, 2, p => sc.get(p), rev);
  }
  if (C.bank) return fromBanks(l, C.bank, n, b, undefined, rev);
  const d = await WR.bank("sg", lv);
  if (c === "synth") {
    const pool = d.synth.filter(playable), rs = RVOK(rev) ? WR.Review.pick(b, pool, Math.min(perLesson(), n), { bucket: b }) : [];
    const skip = rs.length ? new Set(rs.flatMap(it => [it._rk, it._rv.for]).map(k => k.slice(b.length + 1))) : null;
    return WR.shuffle(WR.freshPick(b, pool, n - rs.length, skip).map(q => tag(WR.normalize(q), b, q)).concat(rs));
  }
  const ps = d[c].passages, upper = l.stage !== "primary";
  const mine = ps.length ? passageItems(b, ps, c === "edit" && upper ? 1 : 2, () => b, rev && !(c === "edit" && upper)) : [];
  // 🔍 secondary and up: a short text to edit, then find-the-mistake sentences from the matching realms (JC / Grown-up: sentences only)
  return c === "edit" && upper ? mine.concat(await fromBanks(l, "grammar", Math.max(4, n - mine.length), b + "/mistake", q => q.type === "mistake", rev)) : mine;
};
// 🎲 mixed practice: a little of every game the level has (questions from one text stay together)
const MIX = [["grammar", 2], ["vocab", 2], ["edit", 2], ["synth", 2], ["ccloze", 2], ["listening", 1]];
SG.mixItems = async lv => {
  const l = SG.level(lv), out = [];
  for (const [c, k] of MIX) if (SG.games(l).includes(c)) out.push(...(await SG.items(lv, c, k)).slice(0, k));
  return out;
};

/* ---------- playing ---------- */
const nextGame = (l, after) => { const g = SG.quizGames(l), i = g.indexOf(after), rest = g.slice(i + 1).concat(g.slice(0, Math.max(0, i)));
  return rest.find(c => !SG.best(l.id, c)) || null; };
SG.start = async (lv, c) => {
  const l = SG.level(lv), mix = c === "mix", C = mix ? { icon: "🎲", name: "Mixed practice" } : COMP[c];
  const items = mix ? await SG.mixItems(lv) : await SG.items(lv, c, 8, { review: true });   // 🎲 mixed practice is already a mix: no extra reviews
  if (!items.length) return WR.toast("🌱 More games are coming to this level soon!", 2400);
  const nx = nextGame(l, c);
  WR.startLesson({ realm: "sg-" + lv, skill: c, items, title: `${C.icon} ${C.name}`, onQuit: () => WR.go("sg", lv), replay: () => SG.start(lv, c),
    onFinish: r => SG.record(lv, c, r.score), nextLabel: nx ? `Next: ${COMP[nx].icon} ${COMP[nx].name} →` : `Back to ${l.name} →`, onNext: () => nx ? SG.start(lv, nx) : WR.go("sg", lv) });
};
SG.open = (lv, c) => {
  const l = SG.level(lv), C = COMP[c];
  if (!C.open) return SG.start(lv, c);
  (C.open === "speak" ? WR.startSpeaking : WR.startWriting)(l.main);
  WR.from = { screen: "sg", arg: lv, label: l.name };   // Echo Well / Story Quill come back here (WR.toRealm)
};

/* ---------- the hub ---------- */
const chip = (l, sel) => { const c = SG.levelCrowns(l); return `<button class="gchip sgchip ${sel ? "sel" : ""}" data-sg="${l.id}"><b>${esc(l.label)}</b><small>${l.stage === "primary" ? "Primary" : l.stage === "secondary" ? "Secondary" : l.stage === "jc" ? "JC" : "Grown-up"}</small><i style="width:${c.max ? c.have / c.max * 100 : 0}%"></i></button>`; };
SG.chipsHTML = cur => `<div class="gchips sg-chips">${LEVELS.map(l => chip(l, l.id === cur)).join("")}</div>`;
SG.bindChips = fn => document.querySelectorAll("[data-sg]").forEach(b => b.onclick = () => { WR.sfx("tap"); fn(b.dataset.sg); });
const gameCard = (l, c) => {
  const C = COMP[c], d = SG.best(l.id, c);
  const cr = C.open === "speak" ? (((WR.state.progress[l.main] || {}).speaking) || null) : null;
  const w = C.open === "write" && WR.writingRealmCrowns ? WR.writingRealmCrowns(l.main) : null;
  const status = C.open ? (C.open === "speak" ? (cr ? WR.crownRow(WR.crowns(cr.best)) : '<span class="waiting-tag">🎶 Echo Well</span>') : (w && w.done ? WR.crownRow(Math.min(3, w.crowns)) : '<span class="waiting-tag">✒️ Story Quill</span>'))
    : d ? WR.crownRow(d.crowns) : `<span class="waiting-tag">✨ New!</span>`;
  return `<div class="card skill-card sg-game" data-game="${c}" role="button" tabindex="0"><span class="ico">${C.icon}</span><h3>${C.name}</h3><div class="muted" style="font-size:.82rem;font-weight:700">${C.desc}</div><div class="crowns">${status}</div></div>`;
};
WR.screens.sg = lv => {
  const st = SG.st(); if (lv && SG.level(lv)) { st.level = lv; WR.save(); }
  const l = SG.level(st.level), lc = l && SG.levelCrowns(l), E = l && EXAM[l.stage];
  WR.view(`<div class="fade-in sg-hub"><div class="realm-hero sg-hero">${WR.img("bg_" + (l ? l.main : "a2"), "bg")}<div class="ov"><span class="lvl-badge">P1 – JC</span><b class="title" style="font-size:1.4rem">🦁 Singapore School English</b>
    <p style="margin:.3em 0;font-weight:700">Pick your school level. Every level has games like the ones in your school English papers, from Primary 1 all the way to JC.</p></div></div>
    <div class="row" style="margin:12px 0 4px;justify-content:space-between"><button class="btn ghost small" id="sgBack">← Map</button><b class="title" style="font-size:1.05rem">Choose your level</b></div>
    ${SG.chipsHTML(l && l.id)}
    ${!l ? `<div class="card center start-grade"><h2>Which school level are you in? ✨</h2><p class="muted" style="font-weight:700">Tap your level above. You can change it any time.</p></div>` : `
    <div class="row grade-head"><div><span class="lvl-badge">${esc(l.label)}</span> <b class="title" style="font-size:1.25rem">🦁 ${esc(l.name)}</b><div class="muted" style="font-weight:800;font-size:.85rem">${esc(l.place)} · ${lc.n} games · ${lc.have}/${lc.max} crowns</div></div><button class="btn small mint" id="sgMix">🎲 Mixed practice</button></div>
    <div class="grid g4 sg-games">${SG.games(l).map(c => gameCard(l, c)).join("")}</div>
    <details class="grownup-note sg-note"><summary>👪 For grown-ups</summary><p>${esc(SYLL[l.stage])}</p><ul>${SG.games(l).map(c => `<li><b>${COMP[c].name}</b>: ${esc(E[c])}</li>`).join("")}</ul>
      <p>Questions come from the Cambridge ${CEFR_OF(l)} banks of the fairy realms plus Singapore-style items written for ${esc(l.name)}. British spelling throughout.</p></details>`}</div>`);
  WR.$("#sgBack").onclick = () => WR.go("home");
  SG.bindChips(id => WR.screens.sg(id));
  document.querySelectorAll("[data-game]").forEach(c => c.onclick = () => SG.open(l.id, c.dataset.game));
  const mx = WR.$("#sgMix"); if (mx) mx.onclick = () => SG.start(l.id, "mix");
  WR.navActive("home");
};
// ▶ the home "Continue" card in the Singapore track: the next game not played yet at the chosen level, else the weakest
SG.continueTarget = () => {
  const l = SG.level(SG.st().level);
  if (!l) return { head: "🦁 Singapore School English", sub: "Pick your school level to begin", go: () => WR.go("sg") };
  const g = SG.quizGames(l), c = g.find(x => !SG.best(l.id, x)) || g.slice().sort((a, b) => SG.best(l.id, a).best - SG.best(l.id, b).best)[0], lc = SG.levelCrowns(l);
  return { head: `🦁 ${l.label} ${COMP[c].icon} ${COMP[c].name}`, sub: `${lc.have}/${lc.max} crowns in ${l.name}`, go: () => SG.start(l.id, c) };
};
// the map column in the Singapore track (js/main.js): the level chips + the chosen level
SG.mapHTML = () => { const l = SG.level(SG.st().level), lc = l && SG.levelCrowns(l);
  return `<h2 class="map-h">🦁 Singapore School English</h2>${SG.chipsHTML(l && l.id)}
    <div class="card sg-node" id="sgNode">${WR.img("bg_" + (l ? l.main : "a2"), "thumb", "", true)}<div style="flex:1"><div><span class="lvl-badge">${l ? esc(l.label) : "P1–JC"}</span><b>${l ? esc(l.name) : "Choose your level"}</b></div>
    <div class="muted" style="font-size:.85rem;font-weight:700">${l ? `${esc(l.place)} · 👑 ${lc.have}/${lc.max}` : "Primary, Secondary, JC or Grown-up"}</div></div><span class="btn small">Open →</span></div>`; };
SG.bindMap = () => { SG.bindChips(id => WR.go("sg", id)); const n = WR.$("#sgNode"); if (n) n.onclick = () => WR.go("sg"); };
// onboarding (js/main.js step 3): the Singapore levels as a second way to start
SG.onbHTML = cur => `<details class="sg-onb"${cur ? " open" : ""}><summary>🦁 In a Singapore school? Pick your level</summary><div class="lvlpick sg-pick">${LEVELS.map(l => `<button data-sglv="${l.id}" class="${cur === l.id ? "sel" : ""}">${esc(l.label)}</button>`).join("")}</div></details>`;
})();
