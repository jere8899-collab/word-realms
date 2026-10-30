/* ✒️ The Story Quill: guided writing tasks modelled on Cambridge English writing task types (bonus skill in every realm).
   Plan → Write → Check my writing. Feedback uses Cambridge's four assessment scales (Content, Communicative Achievement,
   Organisation, Language), each 0–5, from transparent heuristics in this file. It's a practice estimate, not an official mark.
   Never required for unlocking. Scoring engine is exposed as WR.Quill for tests. */
(function () {
const WR = window.WR;
const QUILL = WR.WRITING = { id: "writing", name: "Writing", icon: "✒️", desc: "The Story Quill: guided writing" };

/* ------------------------------------------------------------------ level settings */
const B2_LINK = ["however", "moreover", "furthermore", "in addition", "although", "even though", "whereas", "while", "on the other hand", "nevertheless",
  "as a result", "therefore", "consequently", "for example", "for instance", "such as", "firstly", "secondly", "finally", "in conclusion", "to sum up",
  "not only", "despite", "in spite of", "what is more", "as long as", "provided that", "unless", "overall", "apart from", "to begin with", "as for", "since", "so that", "rather than"];
const C1_LINK = B2_LINK.concat(["nonetheless", "notwithstanding", "hence", "thus", "accordingly", "by contrast", "conversely", "admittedly", "granted", "likewise",
  "similarly", "in light of", "given that", "with regard to", "in particular", "notably", "ultimately", "on balance", "all things considered", "that said",
  "albeit", "insofar as", "whereby", "by the same token", "be that as it may", "in other words", "yet", "not least"]);
const PAST = "was|were|went|saw|had|ate|took|got|came|made|found|bought|met|gave|flew|said|told|did|felt|left|ran|swam|rode|sang|thought|knew|began|became|fell|heard|put|sat|stood|woke|wrote|won|lost|brought|caught|taught";
const S = {
  presentSimple: { n: "I am / I have / I like", re: /\b(i am|i'm|i have|i've got|i like|i love)\b/, tip: "Use simple sentences like “I am…”, “I have got…”, “I like…”." },
  can: { n: "can + verb", re: /\bcan(not|'t)? (?!you\b|i\b|we\b)[a-z]+/, tip: "Say what you or your pet can do: “She can jump.”" },
  thereIs: { n: "there is / there are", re: /\bthere (is|are)\b/, tip: "Describe things with “There is…” / “There are…”." },
  thirdS: { n: "he/she + verb-s", re: /\b(he|she|it) (is|has|likes|loves|lives|plays|eats|goes|wants|runs)\b/, tip: "Write about someone else: “She likes…”, “He has…”." },
  past: { n: "past simple", re: new RegExp("\\b(" + PAST + "|(?!hundred\\b)[a-z]{2,}[^e\\s]ed)\\b"), tip: "Tell what happened with the past simple: “We visited…”, “I saw…”." },
  future: { n: "future (going to / will)", re: /\b(going to|will|'ll|won't)\b/, tip: "Talk about plans: “We're going to…”, “I'll…”." },
  compar: { n: "comparatives / superlatives", re: /\b([a-z]+er than|more [a-z]+ than|the (most|best|worst) [a-z]+|the [a-z]+est)\b/, tip: "Compare things: “bigger than…”, “the most beautiful…”." },
  request: { n: "would like / requests", re: /\b(would like|'d like|could you|can you|shall we|would you)\b/, tip: "Ask politely: “Would you like to…?”, “Could you…?”." },
  presPerf: { n: "present perfect", re: /\b(have|has|'ve|haven't|hasn't)\s+(never\s+|already\s+|just\s+|ever\s+|always\s+)?(been|done|seen|had|made|gone|met|known|taken|given|written|eaten|heard|found|got|learnt|learned|loved|[a-z]{3,}ed)\b/, tip: "Use the present perfect for experience: “I've never…”, “I have already…”." },
  cond: { n: "conditionals (if…)", re: /\bif\b[^.!?]{1,80}\b(will|'ll|would|'d|won't|can|might|could)\b|\b(will|would|'ll|'d)\b[^.!?]{1,60}\bif\b/, tip: "Add a conditional: “If you come, we'll…”, “If I were you, I'd…”." },
  pastCont: { n: "past continuous", re: /\b(was|were) [a-z]+ing\b/, tip: "Set the scene with the past continuous: “It was raining when…”." },
  modals: { n: "modals (should / might / could)", re: /\b(should|might|could|must|have to|had better|ought to)\b/, tip: "Give advice or possibility with “should”, “might”, “could”." },
  relative: { n: "relative clauses", re: /\b(who|which|where|whose)\b/, tip: "Join ideas with “who”, “which” or “where”." },
  passive: { n: "passive voice", re: /\b(am|is|are|was|were|be|been|being)\s+([a-z]+ly\s+)?([a-z]{3,}ed|known|given|taken|made|seen|done|built|written|chosen|told|found|held|paid|shown|sold|taught|thought|caught|brought|bought|grown|drawn|worn|born|spoken|broken|stolen|forgotten|hidden|driven|eaten|fallen|kept|left|led|spent|sent|meant|sung|run|won|lost|read|put|set)\b/, tip: "Try the passive: “The show is performed by…”, “It was built in…”." },
  nonDef: { n: "non-defining relative clauses", re: /, (which|who|whose|where) /, tip: "Add detail with a non-defining clause: “…, which seemed to…”." },
  condUnreal: { n: "2nd / 3rd conditionals", re: /\bif\b[^.!?]{1,80}\b(would|'d|could|might)\b|\bif\b[^.!?]{1,40}\bhad\b/, tip: "Use an unreal conditional: “If volunteers were paid, more people would…”." },
  modalPerf: { n: "modal perfects", re: /\b(should|could|would|might|must|may)(n't| not)? have (been|done|seen|gone|had|made|known|taken|given|[a-z]{3,}ed)\b/, tip: "Comment on the past: “It would have been better if…”." },
  ingClause: { n: "-ing clauses", re: /(^|[.!?]\s+|\n)(?!during\b|nothing\b|something\b|anything\b|everything\b|morning\b|evening\b)[A-Z][a-z]+ing\b(?! is\b)/, tip: "Start a sentence with an -ing clause: “Joining a club gives you…”." },
  ingClause2: { n: "-ing / participle clauses", re: /(^|[.!?]\s+|\n)(having|being|joining|starting|reading|living|seeing|knowing|given|faced|having)\b|, [a-z]+ing (the|a|an|their|his|her|its|our)\b/i, tip: "Use a participle clause: “Having consulted…”, “…, leaving the city…”." },
  notOnly: { n: "not only … but also", re: /\bnot only\b[^.!?]+\bbut\b/, tip: "Emphasise with “not only… but (also)…”." },
  wish: { n: "wish / if only", re: /\b(i wish|if only)\b/, tip: "Express regret with “I wish…”." },
  inversion: { n: "inversion", re: /(^|[.!?;:]\s+|\n)(not only|never|rarely|seldom|little|hardly|scarcely|no sooner|under no circumstances|at no time|nowhere|only (?:then|when|if|by|after|in|through|once)[^,.!?]{0,60}?)\s+(do|does|did|have|has|had|is|are|was|were|will|would|can|could|should|must|may|might)\b|(^|[.!?;:,]\s+|\n)(were|had|should) (i|you|he|she|it|we|they|that|this|the [a-z]+)\b(?![^.!?]*\?)/i, tip: "Try inversion for emphasis: “Rarely have I…”, “Not only does it…”, “Were it not for…”." },
  cleft: { n: "cleft sentences", re: /\bwhat\b[^.!?,]{2,50}\b(is|was)\b|\bit (is|was) (precisely|only|not|this|that|here|there|then|in|at|when|because)\b[^.!?]{0,60}\b(that|who)\b|\bthe reason (why|that)\b|\ball (i|we) [a-z]+ (is|was)\b/, tip: "Highlight an idea with a cleft: “What impressed me most was…”, “It is precisely… that…”." },
  hedge: { n: "hedging", re: /\b(arguably|it could be argued|to (some|a certain) extent|tends? to|seemingly|it would seem|may well|is likely to|presumably|somewhat|rather|almost certainly|perhaps)\b/, tip: "Hedge your claims: “arguably”, “to a certain extent”, “it could be argued that…”." },
  nominal: { n: "nominalisation", re: null, tip: "Use noun phrases for a formal, dense style: “the introduction of…”, “a lack of awareness”." },
  subjunctive: { n: "subjunctive / formal that-clause", re: /\b(recommend|suggest|insist|propose|demand|request|essential|vital|imperative)(s|ed)? that (\w+ ){1,4}(be|have|take|go|make|receive|introduce|approve|reconsider)\b/, tip: "Use a formal that-clause: “I recommend that the council approve…”." }
};
const L = s => s.map(k => S[k]);
const LEVELS = {
  a1: { link: ["and", "but", "because", "or", "also", "too", "then", "so"], needLink: 2, paras: 0, sent: [3, 12], ttr: .55, need: 2, errOK: 8,
        structs: L(["presentSimple", "can", "thereIs", "thirdS"]) },
  a2: { link: ["and", "but", "because", "so", "then", "after that", "first", "finally", "when", "or", "later", "before", "suddenly", "in the end", "one day"], needLink: 3, paras: 0, sent: [5, 16], ttr: .58, need: 2, errOK: 6,
        structs: L(["past", "future", "compar", "request", "can"]) },
  b1: { link: ["however", "although", "because", "so", "also", "first", "then", "after that", "finally", "in addition", "for example", "for instance", "on the other hand",
               "as well as", "while", "when", "as soon as", "in my opinion", "besides", "so that", "unless", "even though", "in the end", "but", "as", "until", "if", "or"], needLink: 4, paras: 2, sent: [7, 22], ttr: .62, need: 3, errOK: 4,
        structs: L(["presPerf", "cond", "pastCont", "modals", "relative", "compar", "past"]) },
  b2: { link: B2_LINK.concat(["because", "as", "but", "so", "when"]), needLink: 5, paras: 3, sent: [10, 26], ttr: .64, need: 3, errOK: 3,
        structs: L(["passive", "nonDef", "condUnreal", "modalPerf", "ingClause", "notOnly", "wish", "presPerf"]) },
  c1: { link: C1_LINK, needLink: 6, paras: 4, sent: [12, 32], ttr: .66, need: 3, errOK: 2,
        structs: L(["inversion", "cleft", "nominal", "hedge", "passive", "nonDef", "condUnreal", "ingClause2"]) },
  c2: { link: C1_LINK, needLink: 7, paras: 4, sent: [13, 34], ttr: .68, need: 4, errOK: 1.5,
        structs: L(["inversion", "cleft", "nominal", "hedge", "passive", "nonDef", "condUnreal", "ingClause2", "subjunctive"]) }
};
const SCALES = [
  { k: "content", n: "Content", e: "🎯", d: "Did you include every point the task asked for?" },
  { k: "ca", n: "Communicative Achievement", e: "💌", d: "Does it look and sound like the right kind of text for the reader?" },
  { k: "org", n: "Organisation", e: "🧱", d: "Is it well put together: paragraphs, linking words, clear sentences?" },
  { k: "lang", n: "Language", e: "💎", d: "How varied and accurate are your words and grammar?" }
];

/* ------------------------------------------------------------------ text helpers */
const WORD_RE = /[A-Za-z0-9]+(?:['\u2019-][A-Za-z0-9]+)*/g;
const norm = t => String(t || "").replace(/[\u2018\u2019\u02bc`]/g, "'").replace(/[\u201c\u201d]/g, '"');
const words = t => norm(t).match(WORD_RE) || [];
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function keyHit(key, low) {
  if (key.startsWith("re:")) return new RegExp(key.slice(3)).test(low);
  return new RegExp("(?:^|[^a-z0-9])" + esc(key.toLowerCase())).test(low);
}
function pointHit(p, low) {
  if (p.sets) { const n = p.sets.filter(s => s.some(k => keyHit(k, low))).length; return n >= p.need; }
  return p.keys.some(k => keyHit(k, low));
}
const countRe = (re, s) => (s.match(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g")) || []).length;
function sentences(text) {
  const out = [];
  norm(text).split(/\n+/).forEach(line => line.split(/(?<=[.!?…])\s+(?=["'(\u201c]?[A-Za-z0-9])/).forEach(s => {
    const w = words(s).length; if (!w) return;
    if (w <= 3 && !/[.!?]["')]?\s*$/.test(s.trim())) return; // greetings, sign-offs, headings
    out.push({ s: s.trim(), w });
  }));
  return out;
}
function paragraphs(text) {
  let blocks = norm(text).split(/\n\s*\n/);
  if (blocks.length < 2) blocks = norm(text).split(/\n/);
  return blocks.filter(b => words(b).length >= 8).length;
}
function mattr(toks, win = 40) {
  const t = toks.map(w => w.toLowerCase()); if (!t.length) return 0;
  if (t.length <= win) return new Set(t).size / t.length;
  let sum = 0, n = 0; for (let i = 0; i + win <= t.length; i += 5) { sum += new Set(t.slice(i, i + win)).size / win; n++; }
  return sum / n;
}
const STOP = new Set("the a an and or but so to of in on at for with is are was were be been it its this that these those i you he she we they my your his her our their me him us them very really just also not do does did have has had will would can could should there here then than as by from up out about into over after before what which who when where how all some any more most much many one two".split(" "));

/* ------------------------------------------------------------------ mechanical / common-error checker */
const PREV_OK = new Set("does did do can could will would should must might may shall let make made help helped see saw watch watched hear heard doesn't didn't don't cannot can't won't wouldn't shouldn't couldn't to".split(" "));
const third = v => ({ go: "goes", do: "does", have: "has", watch: "watches", fly: "flies", wash: "washes", catch: "catches", cry: "cries", try: "tries", study: "studies" }[v] || v + "s");
const COMMON = [
  { re: /\b(he|she|it|my (?:mum|dad|mother|father|brother|sister|friend|teacher|cat|dog|pet|grandma|grandpa))\s+(go|do|have|like|want|live|play|eat|make|say|come|need|think|know|love|watch|run|fly|swim|read|work|get|take)\b/gi, kind: "grammar",
    ok: (m, text, i) => { const prev = (text.slice(Math.max(0, i - 20), i).toLowerCase().match(/([a-z']+)\s*$/) || [])[1]; return !PREV_OK.has(prev); },
    msg: m => `After he/she/it, add -s: “${m[1]} ${third(m[2].toLowerCase())}”.`, fix: m => `${m[1]} ${third(m[2].toLowerCase())}` },
  { re: /\b(i|you|we|they)\s+(likes|goes|has|wants|lives|plays|eats|does|makes|loves|needs|thinks|knows)\b/gi, kind: "grammar",
    msg: m => `After “${m[1]}”, use the base verb: “${m[1]} ${m[2].toLowerCase() === "has" ? "have" : m[2].toLowerCase() === "goes" ? "go" : m[2].toLowerCase() === "does" ? "do" : m[2].replace(/s$/i, "")}”.`,
    fix: m => `${m[1]} ${m[2].toLowerCase() === "has" ? "have" : m[2].toLowerCase() === "goes" ? "go" : m[2].toLowerCase() === "does" ? "do" : m[2].replace(/s$/i, "")}` },
  { re: /\bmore (better|worse|bigger|easier|happier|faster|older|younger|smaller|cheaper|nicer|larger|greater)\b/gi, kind: "grammar", msg: m => `“${m[1]}” is already a comparative, so drop “more”.`, fix: m => m[1] },
  { re: /\b(informations|advices|furnitures|homeworks|equipments|knowledges|researches|luggages|evidences|feedbacks)\b/gi, kind: "grammar", msg: m => `“${m[1].replace(/s$/i, "")}” is uncountable: no -s.`, fix: m => m[1].replace(/s$/i, "") },
  { re: /\b(i|we|they|you) (am|are|'m|'re) agree\b/gi, kind: "grammar", msg: m => `“agree” is a verb: say “${m[1]} agree”, not “${m[0]}”.`, fix: m => `${m[1]} agree` },
  { re: /\b(depend(?:s|ed|ing)?) of\b/gi, kind: "grammar", msg: m => `We say “${m[1]} on”, not “${m[1]} of”.`, fix: m => `${m[1]} on` },
  { re: /\b(discuss(?:es|ed|ing)?) about\b/gi, kind: "grammar", msg: m => `“${m[1]}” needs no “about”.`, fix: m => m[1] },
  { re: /\bexplain (me|him|her|us|them)\b/gi, kind: "grammar", msg: m => `Say “explain to ${m[1]}”.`, fix: m => `explain to ${m[1]}` },
  { re: /\bpeoples\b/gi, kind: "grammar", msg: () => "“people” is already plural.", fix: () => "people" },
  { re: /\bi have (\d+|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen) years\b/gi, kind: "grammar", msg: m => `For age, use “be”: “I am ${m[1]} years old”.`, fix: m => `I am ${m[1]} years old` },
  { re: /\bcan to ([a-z]+)\b/gi, kind: "grammar", msg: m => `After “can”, no “to”: “can ${m[1]}”.`, fix: m => `can ${m[1]}` },
  { re: /\b(didn't|didnt|did not|doesn't|doesnt|does not|don't|dont|do not) ([a-z]{3,}ed)\b/gi, kind: "grammar", ok: m => !/^(need|feed|speed|bleed|breed|exceed|succeed|proceed)$/i.test(m[2]),
    msg: m => `After “${m[1]}”, use the base verb (no -ed).`, fix: m => `${m[1]} ${m[2].replace(/ied$/i, "y").replace(/([^e])ed$/i, "$1").replace(/ed$/i, "e")}` },
  { re: /\bsince (\d+|two|three|four|five|six|seven|eight|nine|ten|many|a few) (years|days|weeks|months|hours)\b/gi, kind: "grammar", msg: () => "Use “for” with a length of time (since + a point in time).", fix: m => `for ${m[1]} ${m[2]}` },
  { re: /\bmuch (people|friends|books|things|children|students|places|ideas)\b/gi, kind: "grammar", msg: m => `“${m[1]}” is countable: use “many”.`, fix: m => `many ${m[1]}` },
  { re: /\bmarried with\b/gi, kind: "grammar", msg: () => "We say “married to”.", fix: () => "married to" },
  { re: /\b(would|could|should|must|might) of\b/gi, kind: "grammar", msg: m => `It's “${m[1]} have”, not “${m[1]} of”.`, fix: m => `${m[1]} have` },
  { re: /\balot\b/gi, kind: "spelling", msg: () => "“a lot” is two words.", fix: () => "a lot" },
  { re: /\b(teached|buyed|goed|thinked|catched|bringed|runned|eated|writed|speaked|taked|maked|seed|comed|feeled|leaved|swimmed|flied|knowed|telled)\b/gi, kind: "grammar",
    ok: (m, text, i) => !(m[1].toLowerCase() === "seed" && /\b(a|the|some|this|that|tiny|small)\s+$/i.test(text.slice(Math.max(0, i - 8), i))),
    msg: m => `Irregular verb: “${m[1]}” → “${IRR[m[1].toLowerCase()]}”.`, fix: m => IRR[m[1].toLowerCase()] },
  { re: /\ba ([aeiou][a-z]*)\b/gi, kind: "grammar", ok: m => !/^(uni|use|usu|uti|eu|one|once|ufo|ur)/i.test(m[1]), msg: m => `Use “an” before a vowel sound: “an ${m[1]}”.`, fix: m => `an ${m[1]}` },
  { re: /\ban ([bcdfgjklmnpqrstvwxyz][a-z]*)\b/gi, kind: "grammar", ok: m => !/^(hour|honest|honou?r|heir|herb)/i.test(m[1]), msg: m => `Use “a” before a consonant sound: “a ${m[1]}”.`, fix: m => `a ${m[1]}` },
  { re: /\b(gonna|wanna|gotta|kinda|dunno|u|ur|pls|plz|lol|omg)\b/gi, kind: "style", msg: m => `“${m[1]}” is text-message slang. Write it in full.` }
];
const IRR = { teached: "taught", buyed: "bought", goed: "went", thinked: "thought", catched: "caught", bringed: "brought", runned: "ran", eated: "ate", writed: "wrote", speaked: "spoke",
  taked: "took", maked: "made", seed: "saw", comed: "came", feeled: "felt", leaved: "left", swimmed: "swam", flied: "flew", knowed: "knew", telled: "told" };
function mechanics(raw) {
  const text = norm(raw), flags = [];
  const add = (start, end, kind, msg, fix) => { if (!flags.some(f => start < f.end && end > f.start)) flags.push({ start, end, kind, msg, fix: fix || null, text: text.slice(start, end) }); };
  COMMON.forEach(c => { c.re.lastIndex = 0; let x; while ((x = c.re.exec(text))) { if (c.ok && !c.ok(x, text, x.index)) continue; add(x.index, x.index + x[0].length, c.kind, c.msg(x), c.fix ? c.fix(x) : null); } });
  // sentence starts with a capital letter
  let m; const capRe = /(^|[.!?]["')]?\s+|\n\s*)([a-z][a-z']*)/g;
  while ((m = capRe.exec(text))) { const i = m.index + m[1].length; if (/e\.g|i\.e|etc|vs/.test(text.slice(Math.max(0, i - 6), i))) continue; add(i, i + m[2].length, "caps", "Start each sentence with a capital letter.", m[2][0].toUpperCase() + m[2].slice(1)); }
  const iRe = /(^|[^A-Za-z.])i(?=$|[^A-Za-z.])/g;
  while ((m = iRe.exec(text))) { const i = m.index + m[1].length; add(i, i + 1, "caps", "Always write “I” as a capital letter.", "I"); }
  const repRe = /\b([A-Za-z]+)\s+\1\b/gi;
  while ((m = repRe.exec(text))) { if (/^(that|had|is|do|very|bye|knock)$/i.test(m[1])) continue; add(m.index, m.index + m[0].length, "repeat", `“${m[1]}” is written twice.`, m[1]); }
  const gapRe = /…|\.\.\./g; while ((m = gapRe.exec(text))) add(m.index, m.index + m[0].length, "gap", "Fill in the … gap from the language bank with your own words.");
  // the last real line (4+ words; sign-offs and names are fine) must end with punctuation
  const lines = text.split("\n"); let pos = text.length;
  for (let k = lines.length - 1; k >= 0; k--) { const ln = lines[k]; pos -= ln.length + (k < lines.length - 1 ? 1 : 0);
    if (words(ln).length >= 4 && !/,\s*$/.test(ln)) { const t = ln.replace(/\s+$/, ""); if (!/[.!?"')\u201d:]$/.test(t)) add(pos + t.length - 1, pos + t.length, "punct", "End your last sentence with a full stop (.), ! or ?."); break; } }
  return flags.sort((a, b) => a.start - b.start);
}

/* ------------------------------------------------------------------ genre conventions (Communicative Achievement) */
const LETTERS = ["note", "email", "postcard", "letter"];
const FORMAL = ["essay", "report", "proposal", "summary"];
function genreChecks(p, text, low, lv) {
  const lines = norm(text).split("\n").map(s => s.trim()).filter(Boolean), first = lines[0] || "", last3 = lines.slice(-3).join(" | ");
  const past = countRe(LEVELS.a2.structs[0].re, low), out = [];
  const chk = (ok, label, tip) => out.push({ ok: !!ok, label, tip });
  const g = p.genre;
  if (g === "about" || g === "form") { chk(/\b(i|my|i'm)\b/.test(low), "writes about you (I / my)", "Write about yourself with “I…” and “My…”."); chk(sentences(text).length >= 3, "3 or more sentences", "Write at least three short sentences."); }
  if (LETTERS.includes(g)) {
    chk(/^(dear|hi|hello|hey|to)\b/i.test(first), "opens with a greeting", `Start with a greeting, e.g. “${p.formal ? "Dear Mr Reed," : "Hi Sam,"}”.`);
    chk(/(^|\| )(love|lots of love|best wishes|best|kind regards|regards|yours|see you|bye|take care|thanks|thank you|cheers|all the best|warm wishes|write soon|hugs|good luck|from)\b/i.test(last3), "signs off", `End with a sign-off, e.g. “${p.formal ? "Yours sincerely," : "Best wishes,"}” and your name.`);
  }
  if (g === "story") {
    chk(past >= 3, "tells it in the past", "Tell a story in the past tense: “She saw…”, “They decided…”.");
    if (p.firstLine) chk(low.startsWith(norm(p.firstLine).toLowerCase().slice(0, 18)), "starts with the given sentence", "Begin with the exact sentence the task gives you.");
    else chk(/\b(one day|then|suddenly|after that|finally|in the end|when)\b/.test(low), "uses story sequence words", "Move the story along with “One day…”, “Suddenly…”, “In the end…”.");
  }
  if (g === "article") {
    chk(words(first).length <= 9 && !/[.,]$/.test(first) || /\?/.test(text), "has a title or a question for the reader", "Catch the reader's eye with a title or a question like “Have you ever…?”.");
    chk(/\byou\b/.test(low), "talks to the reader (you)", "Talk to your reader directly: “Have you ever…?”, “Why not try…?”.");
  }
  if (g === "review") {
    chk(/\b(recommend|worth|must-see|not to be missed|should not miss|don't miss|ideal for|suitable)\b/.test(low), "gives a recommendation", "Finish with a clear recommendation: “I would highly recommend it to…”.");
    chk(/\b(amazing|stunning|impressive|remarkable|disappointing|brilliant|moving|superb|captivating|excellent|outstanding|memorable|gripping|dull|predictable|ingenious)\b/.test(low), "uses evaluative adjectives", "Evaluate with strong adjectives: “stunning”, “gripping”, “disappointing”…");
  }
  if (g === "essay") {
    chk(/\b(in conclusion|to sum up|to conclude|overall|all things considered|on balance|in my (opinion|view)|ultimately)\b/.test(low.slice(Math.floor(low.length * .6))), "has a clear conclusion", "Finish with a conclusion paragraph: “To sum up…”, “On balance…”.");
    chk(/\b(in my (opinion|view)|i (believe|think|feel|would argue)|personally|to my mind)\b/.test(low), "gives your own opinion", "State your opinion clearly: “In my view…”, “I believe…”.");
  }
  if (g === "report" || g === "proposal") {
    const heads = lines.filter(l => words(l).length <= 6 && !/[.!?,:;]$/.test(l)).length;
    chk(heads >= 2, "uses headings", "Use short headings for each section (e.g. Introduction, Recommendations).");
    chk(/\b(aim|purpose) of this|this (report|proposal) (sets out|aims|is intended|will)/.test(low), "states its purpose", "Open with the purpose: “The aim of this report is to…”.");
  }
  if (g === "summary") {
    chk(/\b(first (text|writer|author|extract)|text 1|the former)\b/.test(low) && /\b(second (text|writer|author|extract)|text 2|the latter)\b/.test(low), "refers to both texts", "Refer to both texts clearly: “The first writer argues…; the second text…”.");
    chk(new RegExp("\\b(" + ["on balance", "ultimately", "in conclusion", "to conclude", "all things considered", "my own view", "i would contend"].join("|") + ")\\b").test(low), "ends with your own view", "End with your own position: “Ultimately, I would contend that…”.");
  }
  // register: formal genres and formal letters avoid contractions and slang
  const formal = FORMAL.includes(g) || p.formal || (["review", "article"].includes(g) && (lv === "c1" || lv === "c2"));
  const contr = countRe(/\b[a-z]+n't\b|\b(i|you|we|they|he|she|it|that|there)'(m|re|ve|ll|d|s)\b/, low), slang = /\b(gonna|wanna|gotta|kinda|lol|omg|u|ur)\b|!!/.test(low);
  const regOK = !slang && (!formal || contr <= (g === "review" || g === "article" ? 3 : 1));
  return { checks: out, regOK, formal, contr, slang };
}

/* ------------------------------------------------------------------ the scorer */
function score(p, raw) {
  const lv = p.level, cfg = LEVELS[lv], text = norm(raw), low = text.toLowerCase(), toks = words(text), n = toks.length;
  const [lo, hi] = p.words, sents = sentences(text), paras = paragraphs(text), flags = mechanics(text);
  const pts = p.points.map(pt => ({ label: pt.label, ok: n > 0 && pointHit(pt, low) }));
  const covered = pts.filter(x => x.ok).length, attempt = n >= lo * 0.5;
  const wcState = n < lo ? "under" : n > hi ? "over" : "in";
  // Content
  let content = covered ? 5 * covered / pts.length : 0;
  if (n < lo * 0.5) content = Math.min(content, covered === pts.length ? 2 : 1);
  else if (n < lo * 0.85) content -= 1;
  if (n > hi * 1.25) content -= 1;
  content = clamp(Math.round(content));
  // Communicative Achievement
  const G = genreChecks(p, text, low, lv), gf = G.checks.length ? G.checks.filter(c => c.ok).length / G.checks.length : 1;
  const bankPh = [].concat(...p.bank.map(b => b.p)).map(ph => ph.replace(/…/g, " ").replace(/[,.?!]/g, " ").trim().toLowerCase()).filter(ph => ph.split(/\s+/).length >= 2);
  const bankUsed = bankPh.filter(ph => ph.split(/\s{2,}/).every(chunk => keyHit(chunk.trim(), low))).length;
  let ca = (attempt ? 1 : n ? 0.5 : 0) + 2 * gf + (G.regOK ? 1 : 0) + (bankUsed >= (["b2", "c1", "c2"].includes(lv) ? 2 : 1) ? 1 : 0);
  ca = clamp(Math.min(Math.round(ca), content + 1, attempt ? 5 : 2));
  // Organisation
  const linkFound = cfg.link.filter(l => new RegExp("(?:^|[^a-z])" + esc(l) + "(?![a-z])").test(low));
  const longest = sents.reduce((a, s) => Math.max(a, s.w), 0), runOn = longest > cfg.sent[1] * 2;
  let org = sents.length >= 2 ? 1 : 0;
  org += linkFound.length >= cfg.needLink ? 2 : linkFound.length >= Math.ceil(cfg.needLink / 2) ? 1 : 0;
  if (cfg.paras) org += paras >= cfg.paras ? 2 : paras >= 2 ? 1 : 0;
  else org += (sents.length >= 3 ? 1 : 0) + (flags.filter(f => f.kind === "caps" || f.kind === "punct").length <= 1 ? 1 : 0);
  if (runOn) org -= 1;
  org = clamp(Math.min(org, attempt ? 5 : 2));
  // Language
  const ttr = mattr(toks), avg = sents.length ? sents.reduce((a, s) => a + s.w, 0) / sents.length : 0;
  const nomDensity = toks.filter(w => w.length >= 7 && /(tion|sion|ment|ness|ity|ance|ence|ism)s?$/i.test(w)).length / Math.max(1, n) * 100;
  const structs = cfg.structs.filter(s => s.re ? s.re.test(s.re.flags.includes("i") ? text : low) : nomDensity >= 4);
  const realFlags = flags.filter(f => f.kind !== "gap"), rate = realFlags.length / Math.max(1, n) * 100;
  let lang = attempt ? 1 : n ? 0.5 : 0;
  lang += ttr >= cfg.ttr ? 1 : 0;
  lang += avg >= cfg.sent[0] && avg <= cfg.sent[1] ? 1 : 0;
  lang += structs.length >= cfg.need ? 2 : structs.length >= Math.ceil(cfg.need / 2) ? 1 : 0;
  if (realFlags.length >= 2) { lang -= rate > cfg.errOK * 2 ? 2 : rate > cfg.errOK ? 1 : 0; lang = Math.min(lang, 4); } // a 5 needs (almost) slip-free writing
  lang = clamp(Math.min(Math.round(lang), attempt ? 5 : 2));
  // relevance cap: an off-task answer can't score well on the other scales (as with Cambridge examiners)
  const cap = content === 0 ? 2 : content === 1 ? 3 : 5, offTask = content <= 1 && attempt;
  ca = Math.min(ca, cap); org = Math.min(org, cap); lang = Math.min(lang, cap);
  const scales = { content, ca, org, lang }, total = content + ca + org + lang;
  // repeated content word (lexical variety tip)
  const freq = {}; toks.forEach(w => { const k = w.toLowerCase(); if (!STOP.has(k) && k.length > 2) freq[k] = (freq[k] || 0) + 1; });
  const rep = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
  const r = { n, lo, hi, wcState, pts, covered, scales, total, crowns: crownsFor(total), flags, paras, sents: sents.length, avg, ttr, linkFound, structs: structs.map(s => s.n),
    missingStructs: cfg.structs.filter(s => !structs.includes(s)), genre: G, offTask, bankUsed, runOn, rep: rep && rep[1] >= (lv === "a1" ? 5 : 4) ? rep : null, cfg };
  r.tips = tips(p, r);
  return r;
}
const clamp = x => Math.max(0, Math.min(5, x));
const crownsFor = t => t >= 17 ? 3 : t >= 13 ? 2 : t >= 9 ? 1 : 0;
const easy = lv => lv === "a1" || lv === "a2";
function tips(p, r) {
  const t = [], lv = p.level, cfg = r.cfg, push = (e, s) => { if (t.length < 5) t.push({ e, s }); };
  if (!r.n) return [{ e: "✍️", s: "Write your answer in the box first!" }];
  if (r.offTask) push("🧭", easy(lv) ? "Read the task again: your text needs to answer it." : "Your text doesn't answer the task yet, so the other scales are capped. Re-read the task card and cover each content point.");
  r.pts.filter(x => !x.ok).slice(0, 2).forEach(x => push("🎯", easy(lv) ? `Don't forget: <b>${WR.esc(x.label)}</b>.` : `Content point missing: <b>${WR.esc(x.label)}</b>. The reader needs this information.`));
  if (r.wcState === "under") push("📏", `Write a little more: you have ${r.n} words, the target is ${r.lo}–${r.hi}.`);
  if (r.wcState === "over" && r.n > r.hi * 1.1) push("✂️", `Too long: ${r.n} words (target ${r.lo}–${r.hi}). Cut anything that doesn't answer the task.`);
  const fl = r.flags; if (fl.length) push("🖍️", `Check the ${fl.length} highlighted spot${fl.length > 1 ? "s" : ""} in your text: ${[...new Set(fl.map(f => ({ caps: "capital letters", punct: "punctuation", repeat: "repeated words", grammar: "grammar", spelling: "spelling", style: "slang", gap: "unfilled gaps" }[f.kind])))].join(", ")}.`);
  r.genre.checks.filter(c => !c.ok).slice(0, 1).forEach(c => push("💌", c.tip));
  if (!r.genre.regOK) push("🎩", r.genre.slang ? "Avoid slang like “gonna” or “!!”." : `This is a formal text: write “do not” and “it is” instead of contractions (you used ${r.genre.contr}).`);
  if (cfg.paras && r.paras < cfg.paras) push("🧱", `Organise your ideas into ${cfg.paras}+ paragraphs (leave an empty line between them). I found ${r.paras}.`);
  if (r.linkFound.length < cfg.needLink) { const ideas = cfg.link.filter(l => !r.linkFound.includes(l)).slice(easy(lv) ? 0 : 1, easy(lv) ? 3 : 5).map(l => `“${l}”`).join(", ");
    push("🔗", easy(lv) ? `Join your sentences with words like ${ideas}.` : `Use a wider range of linking devices (you used ${r.linkFound.length}); try ${ideas}.`); }
  if (r.runOn) push("✂️", "One sentence is very long. Split it into two with a full stop.");
  if (r.structs.length < cfg.need && r.missingStructs.length) push("💎", r.missingStructs[0].tip);
  if (r.ttr < cfg.ttr) push("🌈", "Try to vary your words: use different verbs and adjectives instead of repeating the same ones.");
  else if (r.rep) push("🌈", `You used “${WR.esc(r.rep[0])}” ${r.rep[1]} times. Can you find a synonym for one of them?`);
  if (!t.length) push("🌟", r.total >= 17 ? "Wonderful! Every scale looks strong. Compare with the model answer for even more ideas." : "Good work! Read the model answer and borrow one new phrase next time.");
  return t;
}
WR.Quill = { score, mechanics, words: t => words(t).length, keyHit, pointHit, crownsFor, LEVELS, SCALES, sentences, paragraphs };

/* ------------------------------------------------------------------ save helpers */
const W = () => { const s = WR.state; s.writing = Object.assign({ checks: 0, crowns: 0, best: {}, drafts: {} }, s.writing || {}); return s.writing; };
const bestOf = id => W().best[id] || null;
WR.writingRealmCrowns = rid => { const b = W().best, ks = Object.keys(b).filter(k => k.startsWith(rid + "-")); return { crowns: ks.reduce((a, k) => Math.max(a, b[k].crowns), 0), done: ks.length }; };

/* ------------------------------------------------------------------ screens */
let Q = null, saveT = null;
const PET_GOOD = ["Your words sparkle! ✨", "What a storyteller! 📖", "The Quill is dancing! 🪶", "I love reading your writing! 💖"];
const PET_MID = ["Nice writing! A few tweaks and it'll shine 🌟", "Good job! Check the tips together? 🫶"];
const PET_LOW = ["Every great writer starts somewhere 🌱", "Let's add more ideas together! 💪"];
const pick = a => a[Math.floor(Math.random() * a.length)];
function flush() { if (!Q) return; clearTimeout(saveT); const d = W().drafts; if ((Q.text || "").trim() || (Q.plan || "").trim()) d[Q.p.id] = { plan: Q.plan || "", text: Q.text || "", at: Date.now() }; WR.save(); }
WR.stopWriting = () => { flush(); Q = null; };
const crownRow = c => "👑".repeat(c) + `<span style="opacity:.2">${"👑".repeat(3 - c)}</span>`;

WR.startWriting = async rid => {
  WR.stopWriting(); window.Speech && Speech.stop();
  const realm = WR.realms.find(r => r.id === rid), list = await WR.bank(rid, "writing");
  const bgA = WR.asset(realm.bg), w = W(), done = list.filter(p => w.best[p.id]).length;
  WR.view(`<div class="lesson-bg" style="background-image:${bgA ? WR.bgCss(bgA.id) : "none"}"></div>
    <div class="row" style="margin:6px 0 8px"><button class="btn ghost small" id="qBackRealm">← ${WR.esc(realm.name)}</button><b class="title">✒️ The Story Quill · ${realm.level}</b></div>
    <div class="card quill-head fade-in"><img class="quill-art" src="assets/web/quill.webp" onerror="this.onerror=null;this.src='assets/ui/quill.png'" alt="The Story Quill">
      <div style="flex:1"><h2 style="margin:0">Write your own fairytale magic ✨</h2>
      <p class="muted" style="font-weight:700;margin:.3em 0">Pick a task, make a quick plan, write, then tap <b>Check my writing</b>. The Quill gives feedback on the four Cambridge writing scales: Content, Communicative Achievement, Organisation and Language.</p>
      <div class="row"><span class="pill">${realm.level} · ${list[0].words[0]}–${Math.max(...list.map(p => p.words[1]))} words</span><span class="pill" style="background:var(--mint)">✒️ ${done}/${list.length} written</span><span class="pill" style="background:var(--butter)">+1⭐ per new crown</span></div></div></div>
    <div class="grid g3 quill-list">${list.map(p => { const b = w.best[p.id], d = w.drafts[p.id];
      return `<button class="card quill-task" data-id="${p.id}"><span class="pill focus-pill">${WR.esc(p.part)}</span><h3>${WR.esc(p.title)}</h3>
        <div class="muted" style="font-size:.82rem;font-weight:800">${GENRE[p.genre] || p.genre} · ${p.words[0]}–${p.words[1]} words</div>
        <div class="crowns">${b ? crownRow(b.crowns) + ` <small class="muted">${b.total}/20</small>` : '<span class="muted" style="font-size:.8rem">not written yet</span>'}</div>
        ${d && d.text && d.text.trim() ? '<span class="pill draft-pill">📝 draft saved</span>' : ""}</button>`; }).join("")}</div>
    <p class="muted center" style="font-size:.8rem;font-weight:700">🔮 Scores are a friendly practice estimate, not an official Cambridge English mark. Writing is a bonus skill and isn't needed to unlock the next realm.</p>`);
  WR.$("#qBackRealm").onclick = () => WR.go("realm", rid);
  document.querySelectorAll(".quill-task").forEach(b => b.onclick = () => openTask(realm, list.find(p => p.id === b.dataset.id)));
};
const GENRE = { about: "✏️ Sentences", form: "🪪 Club card", note: "📝 Note", email: "💌 Email", postcard: "🏞️ Postcard", story: "📖 Story", article: "📰 Article",
  essay: "🧭 Essay", review: "⭐ Review", report: "📊 Report", proposal: "📜 Proposal", letter: "✉️ Letter", summary: "📚 Essay on two texts" };

function openTask(realm, p, step) {
  flush();
  const d = W().drafts[p.id] || {};
  Q = { realm, p, step: step || (d.text && d.text.trim() ? "write" : "plan"), plan: d.plan || "", text: d.text || "", result: null, recorded: false };
  render();
}
WR._quillDbg = () => Q && { id: Q.p.id, step: Q.step, result: Q.result }; // test hook
WR.openQuill = async (rid, id, step) => { const realm = WR.realms.find(r => r.id === rid), list = await WR.bank(rid, "writing"); openTask(realm, list.find(p => p.id === id), step); };

function taskCard(p) {
  const em = p.email ? `<div class="q-mail"><b>📩 From: ${WR.esc(p.email.from)}</b><p>${WR.esc(p.email.text)}</p><div class="row" style="gap:5px"><span class="muted" style="font-size:.8rem;font-weight:800">Your notes:</span>${p.email.notes.map(n => `<span class="kw">${WR.esc(n)}</span>`).join("")}</div></div>` : "";
  const tx = p.texts ? `<div class="q-texts">${p.texts.map(t => `<div class="q-src"><b>${WR.esc(t.title)}</b><p>${WR.esc(t.text)}</p></div>`).join("")}</div>` : "";
  return `<div class="q-task"><div class="row" style="gap:6px"><span class="pill focus-pill">📜 ${WR.esc(p.part)}</span><span class="pill" style="background:var(--blue)">🎯 ${p.words[0]}–${p.words[1]} words</span><span class="pill" style="background:var(--butter)">${GENRE[p.genre] || p.genre}</span></div>
    <h2 style="margin:.35em 0 .2em">${WR.esc(p.title)}</h2><p class="q-brief">${WR.esc(p.task)}</p>${em}${tx}
    <div class="q-points-h">✅ Content points to include</div><ul class="q-points" id="qPoints">${p.points.map((x, i) => `<li data-i="${i}"><span class="tick">○</span>${WR.esc(x.label)}</li>`).join("")}</ul></div>`;
}
function stepsBar() {
  const st = [["plan", "🗒️ Plan"], ["write", "✍️ Write"], ["feedback", "🔮 Feedback"]];
  return `<span class="pill">${Q.realm.level} · ✒️ Story Quill</span><div class="q-steps">${st.map(([k, l], i) => `<button class="q-step ${Q.step === k ? "on" : ""}" data-step="${k}" ${k === "feedback" && !Q.result ? "disabled" : ""}><b>${i + 1}</b> ${l}</button>`).join("")}</div>`;
}
function render() {
  const p = Q.p, bgA = WR.asset(Q.realm.bg), b = bestOf(p.id);
  WR.view(`<div class="lesson-bg" style="background-image:${bgA ? WR.bgCss(bgA.id) : "none"}"></div>
    <div class="row" style="margin:6px 0 8px"><button class="btn ghost small" id="qList">← Tasks</button><b class="title">✒️ ${WR.esc(p.title)}</b></div>
    <div class="card hud quill-hud">${stepsBar()}</div>
    <div class="lesson fade-in quill"><div class="card qcard">${Q.step === "feedback" ? "" : taskCard(p)}<div id="qStep"></div></div>
      <div class="card side"><div class="petbox" id="lpet">${WR.petHTML()}</div><div class="bubble" id="lbubble">${Q.step === "plan" ? "Plan first, then write! I'll cheer you on 🪶" : Q.step === "write" ? "I'm watching the words grow… ✨" : "Let's read the Quill's feedback! 🔮"}</div>
      <div class="muted" style="font-size:.85rem;font-weight:800">${b ? `Best: ${crownRow(b.crowns)} ${b.total}/20` : "First try: earn up to 3⭐"}</div></div></div>`);
  WR.$("#qList").onclick = () => { flush(); WR.startWriting(Q.realm.id); };
  document.querySelectorAll("[data-step]").forEach(x => x.onclick = () => { if (x.disabled) return; flush(); Q.step = x.dataset.step; render(); });
  ({ plan: planStep, write: writeStep, feedback: feedbackStep })[Q.step]();
}
function planStep() {
  const p = Q.p;
  WR.$("#qStep").innerHTML = `<div class="q-box"><h3>🗒️ Plan <small class="muted">(optional)</small></h3>
    <p class="muted" style="font-weight:700;margin:.2em 0 .5em">Jot a few quick notes for each content point. Two minutes of planning makes writing much easier!</p>
    <textarea id="qPlan" class="quill-ta plan" rows="6" placeholder="• ${WR.esc(p.points[0].label)}: …">${WR.esc(Q.plan)}</textarea>
    <div class="row q-actions"><button class="btn ghost small" id="qBullets">✨ Add the points as bullets</button><span style="flex:1"></span><button class="btn ghost" id="qSkip">Skip →</button><button class="btn mint" id="qToWrite">Start writing ✍️</button></div></div>`;
  const ta = WR.$("#qPlan");
  ta.oninput = () => { Q.plan = ta.value; clearTimeout(saveT); saveT = setTimeout(flush, 400); };
  WR.$("#qBullets").onclick = () => { const add = p.points.map(x => `• ${x.label}: `).join("\n"); ta.value = (ta.value.trim() ? ta.value.trim() + "\n" : "") + add; Q.plan = ta.value; flush(); ta.focus(); };
  WR.$("#qSkip").onclick = WR.$("#qToWrite").onclick = () => { flush(); Q.step = "write"; render(); };
}
function liveUpdate() {
  const p = Q.p, n = words(Q.text).length, low = norm(Q.text).toLowerCase(), wc = WR.$("#qWc");
  const st = n < p.words[0] ? "under" : n > p.words[1] ? "over" : "in";
  if (wc) { wc.className = "wc " + st; wc.innerHTML = `<b>${n}</b> word${n === 1 ? "" : "s"} · target ${p.words[0]}–${p.words[1]} ${st === "in" ? "✓" : st === "under" ? "↑" : "↓"}`; }
  p.points.forEach((x, i) => { const li = document.querySelector(`#qPoints li[data-i="${i}"]`); if (!li) return; const ok = n > 0 && pointHit(x, low); li.classList.toggle("ok", ok); li.querySelector(".tick").textContent = ok ? "✓" : "○"; });
}
function writeStep() {
  const p = Q.p;
  WR.$("#qStep").innerHTML = `<div class="q-box"><div class="quill-bar"><span class="wc" id="qWc"></span><span class="muted" id="qSaved" style="font-size:.78rem;font-weight:800">📝 Drafts save automatically</span></div>
    ${Q.plan.trim() ? `<details class="plan-peek"><summary>🗒️ My plan</summary><pre>${WR.esc(Q.plan)}</pre></details>` : ""}
    <textarea id="qText" class="quill-ta" rows="12" spellcheck="false" placeholder="${p.firstLine ? WR.esc(p.firstLine) + " …" : "Start writing here… Leave an empty line between paragraphs."}">${WR.esc(Q.text)}</textarea>
    <div class="q-bank"><div class="row" style="gap:6px"><b>🪄 Language bank</b><span class="muted" style="font-size:.8rem;font-weight:700">Tap a phrase to add it. Then type over the … gap.</span></div>
      ${p.bank.map(g => `<div class="bank-g"><small>${WR.esc(g.g)}</small><div class="bank-chips">${g.p.map(ph => `<button class="bank-chip" data-ph="${WR.esc(ph)}">${WR.esc(ph)}</button>`).join("")}</div></div>`).join("")}</div>
    <div class="row q-actions"><button class="btn ghost" id="qToPlan">← Plan</button><span style="flex:1"></span><button class="btn" id="qCheck">✨ Check my writing</button></div></div>`;
  const ta = WR.$("#qText");
  ta.oninput = () => { Q.text = ta.value; liveUpdate(); clearTimeout(saveT); saveT = setTimeout(() => { flush(); const s = WR.$("#qSaved"); if (s) s.textContent = "📝 Draft saved ✓"; }, 500); };
  document.querySelectorAll(".bank-chip").forEach(c => c.onclick = () => insertPhrase(ta, c.dataset.ph));
  WR.$("#qToPlan").onclick = () => { flush(); Q.step = "plan"; render(); };
  WR.$("#qCheck").onclick = check;
  liveUpdate();
}
function insertPhrase(ta, ph) {
  const v = ta.value, a = ta.selectionStart ?? v.length, b = ta.selectionEnd ?? v.length, before = v.slice(0, a);
  const pre = before && !/\s$/.test(before) ? " " : "", post = /[.?!,:]$/.test(ph) ? " " : "";
  ta.value = before + pre + ph + post + v.slice(b);
  const gap = ph.indexOf("…"), base = a + pre.length;
  ta.focus(); if (gap >= 0) ta.setSelectionRange(base + gap, base + gap + 1); else { const e = base + ph.length + post.length; ta.setSelectionRange(e, e); }
  Q.text = ta.value; liveUpdate(); flush(); WR.sfx("tap");
}
function check() {
  const p = Q.p, text = Q.text || "";
  if (!words(text).length) { WR.toast("✍️ Write something first!"); return; }
  const r = score(p, text), w = W(), prev = w.best[p.id], first = !prev, s = WR.state;
  const gain = Math.max(0, r.crowns - (prev ? prev.crowns : 0));
  w.checks++;
  if (!prev || r.total > prev.total || r.crowns > prev.crowns) w.best[p.id] = { total: Math.max(r.total, prev ? prev.total : 0), crowns: Math.max(r.crowns, prev ? prev.crowns : 0), scales: r.scales, at: Date.now() };
  w.crowns = Object.values(w.best).reduce((a, x) => a + x.crowns, 0);
  if (gain) s.stars += gain;
  const real = r.n >= p.words[0] * 0.5;
  const firstCheck = real && !Q.recorded;
  if (real) { WR.questEvent("write1"); if (firstCheck) { WR.recordLesson(Q.realm.id, "writing", r.total / 20); Q.recorded = true; } if (r.crowns === 3) WR.questEvent("perfect1"); }
  if (real) WR.tally(Q.realm.id + "/writing", r.total / 20 >= 0.6);       // 📊 a checked draft counts as right at 12/20 or more
  const newStreak = real ? WR.activityDone(firstCheck) : false;
  const lv = WR.petGainXP(first ? 10 + 4 * r.crowns : gain ? 4 * gain : 2);
  const planted = plantErrors(r, text);
  flush(); WR.save(); WR.renderTop();
  Q.result = { r, gain, first, lv, planted, newStreak, prevCrowns: prev ? prev.crowns : 0 }; Q.step = "feedback";
  render();
  const box = WR.$("#lpet"), bub = WR.$("#lbubble");
  if (box) { box.classList.remove("bounce", "cheer", "sad"); void box.offsetWidth; box.classList.add(r.crowns >= 3 ? "cheer" : r.crowns >= 1 ? "bounce" : "sad"); }
  if (bub) bub.textContent = lv ? (lv.evolved ? `I evolved into ${WR.petInfo().stages[WR.petStage(lv.level)]}! 🌟` : `I reached level ${lv.level}! 🎉`) : r.crowns >= 3 ? pick(PET_GOOD) : r.crowns >= 1 ? pick(PET_MID) : pick(PET_LOW);
  WR.sfx(r.crowns >= 2 ? "good" : r.crowns ? "coin" : "tap"); if (gain) WR.toast(`+${gain} ⭐ new crown${gain > 1 ? "s" : ""}!`); if (r.crowns === 3) WR.confetti(16);
}
function plantErrors(r, raw) {
  if (!WR.Garden) return 0; const t = norm(raw); let n = 0; const used = new Set();
  r.flags.filter(f => f.fix && (f.kind === "grammar" || f.kind === "spelling")).forEach(f => {
    if (n >= 2) return;
    let a = f.start, b = f.end;
    while (a > 0 && !/[.!?\n]/.test(t[a - 1])) a--;
    while (b < t.length && !/[.!?\n]/.test(t[b])) b++;
    if (b < t.length && /[.!?]/.test(t[b])) b++;
    if (used.has(a)) return; used.add(a);
    let sent = t.slice(a, b);
    r.flags.filter(g => g.fix && g.start >= a && g.end <= b).sort((x, y) => y.start - x.start).forEach(g => { sent = sent.slice(0, g.start - a) + g.fix + sent.slice(g.end - a); });
    let fixed = sent.replace(/\s+/g, " ").trim().replace(/\bi\b/g, "I"); if (!fixed) return;
    fixed = fixed[0].toUpperCase() + fixed.slice(1); if (!/[.!?]$/.test(fixed)) fixed += ".";
    const wc = fixed.split(" ").length; if (wc < 3 || wc > 14) return;
    WR.Garden.plant({ type: "order", q: "✒️ Story Quill fix-up: build the corrected sentence from your writing.", answer: fixed, explain: f.msg.replace(/<[^>]+>/g, "") }, Q.realm.id, "writing");
    n++;
  });
  return n;
}
function highlight(raw, flags) {
  const t = norm(raw); let out = "", i = 0;
  flags.forEach(f => { out += WR.esc(t.slice(i, f.start)) + `<mark class="qf qf-${f.kind}" title="${WR.esc(f.msg)}">${WR.esc(t.slice(f.start, f.end))}</mark>`; i = f.end; });
  return out + WR.esc(t.slice(i));
}
function why(k, r) {
  const g = r.genre;
  if (k === "content") return `${r.covered}/${r.pts.length} content points · ${r.n} words (target ${r.lo}–${r.hi})`;
  if (k === "ca") return g.checks.map(c => `${c.ok ? "✓" : "✗"} ${c.label}`).concat([`${g.regOK ? "✓" : "✗"} ${g.formal ? "formal register" : "friendly, natural tone"}`]).join(" · ");
  if (k === "org") return `${r.cfg.paras ? r.paras + " paragraph" + (r.paras === 1 ? "" : "s") + " · " : ""}${r.sents} sentence${r.sents === 1 ? "" : "s"} · ${r.linkFound.length} linking word${r.linkFound.length === 1 ? "" : "s"}${r.linkFound.length ? ` (${r.linkFound.slice(0, 5).join(", ")})` : ""}`;
  return `word variety ${Math.round(r.ttr * 100)}% · ${Math.round(r.avg)} words per sentence · ${r.structs.length ? r.structs.join(", ") : "no target structures yet"} · ${r.flags.length} highlighted spot${r.flags.length === 1 ? "" : "s"}`;
}
function feedbackStep() {
  const { r, gain, planted, prevCrowns, newStreak } = Q.result, p = Q.p;
  const kinds = [...new Set(r.flags.map(f => f.kind))];
  const KL = { caps: "capital letter", punct: "punctuation", repeat: "repeated word", grammar: "grammar", spelling: "spelling", style: "slang", gap: "gap to fill" };
  WR.$("#qStep").innerHTML = `<div class="q-fb fade-in">
    <div class="quill-note">🔮 <b>Practice estimate.</b> The Story Quill uses simple word-magic rules based on Cambridge's four writing scales. It's a guide to help you improve, <b>not an official Cambridge English mark</b>.</div>
    <div class="fb-top"><div class="fb-total"><b id="qTotal">${r.total}</b><span>/20</span></div><div><div class="fb-crowns">${crownRow(r.crowns)}</div>
      <div class="muted" style="font-weight:800">${gain ? `+${gain} ⭐ for ${gain === 1 ? "a new crown" : gain + " new crowns"}!` : r.crowns && prevCrowns >= r.crowns ? `No new stars this time: beat your best of ${prevCrowns} crown${prevCrowns > 1 ? "s" : ""} to earn more.` : r.crowns ? "" : "Get 9/20 for your first crown 👑"}${newStreak ? ` · 🔥 streak ${WR.state.streak.count}` : ""}</div></div></div>
    <div class="scales">${SCALES.map(sc => { const v = r.scales[sc.k]; return `<div class="scale" data-scale="${sc.k}"><div class="sc-h"><span>${sc.e}</span><b>${sc.n}</b><span class="sc-v">${v}/5</span></div>
      <div class="sc-bar"><i style="width:${v * 20}%"></i></div><div class="muted sc-why">${WR.esc(why(sc.k, r))}</div></div>`; }).join("")}</div>
    <h3>💡 Tips from the Quill</h3><ul class="q-tips">${r.tips.map(t => `<li><span>${t.e}</span><div>${t.s}</div></li>`).join("")}</ul>
    <h3>🖍️ Your writing</h3><div class="hl-text" id="qHl">${highlight(Q.text, r.flags)}</div>
    ${r.flags.length ? `<div class="q-legend">${kinds.map(k => `<span><mark class="qf qf-${k}">${KL[k]}</mark></span>`).join("")}<span class="muted">Tap or hover a highlight to see why.</span></div><ul class="q-flaglist">${r.flags.slice(0, 8).map(f => `<li><mark class="qf qf-${f.kind}">${WR.esc(f.text)}</mark> ${WR.esc(f.msg)}</li>`).join("")}${r.flags.length > 8 ? `<li class="muted">…and ${r.flags.length - 8} more highlighted above.</li>` : ""}</ul>` : `<div class="muted" style="font-weight:800">✨ No mechanical slips spotted.</div>`}
    ${planted ? `<p class="muted" style="font-weight:800">🌰 ${planted} corrected sentence${planted > 1 ? "s were" : " was"} planted in your Mistake Garden to practise.</p>` : ""}
    <details class="q-model" open><summary>📖 Model answer (${p.level.toUpperCase()})</summary><div class="model-text">${WR.esc(p.model)}</div></details>
    <div class="row q-actions"><button class="btn ghost" id="qImprove">✏️ Improve my writing</button><span style="flex:1"></span><button class="btn" id="qOthers">📜 Other tasks</button><button class="btn mint" id="qRealm">Back to ${WR.esc(Q.realm.name)}</button></div></div>`;
  WR.$("#qImprove").onclick = () => { Q.step = "write"; render(); };
  WR.$("#qOthers").onclick = () => { flush(); WR.startWriting(Q.realm.id); };
  WR.$("#qRealm").onclick = () => { const id = Q.realm.id; WR.go("realm", id); };
  document.querySelectorAll("#qHl mark").forEach(m => m.onclick = () => WR.toast("🖍️ " + WR.esc(m.title), 2600));
}
})();
