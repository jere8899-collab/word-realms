/* 🔤 Phonics Path (English follow-up, 31 Oct): six short steps for young A1 learners, opened from the A1 realm tile or the
   🔤 card under the realm map. Steps: 🐍 Sound Seeds (s a t p i n) → 🌼 Sound Garden (13 more letter sounds) → 🪄 Blend Bridge (CVC words)
   → 🐚 Two-Letter Twins (sh ch th ck ng) → ✨ Magic-e Meadow (a_e i_e o_e u_e) → 👀 Tricky Word Tower (sight words).
   Activity types: 🔊 sound → pick the letter, first sound of a picture, odd-sound-out, tap-and-blend, build the word with letter
   tiles, hear-and-pick the word, and find the tricky word in a sentence. Every round is 8 questions, read aloud with the game's
   speechSynthesis voice (js/speech.js). Computer voices can't say every sound on its own, so a letter tile says its sound with a
   keyword ("sss… sun"). Answers go through WR.countAnswer (report key "a1/phonics") and the end of a round through WR.activityDone.
   Saved in WR.state.phonics = { done: { u1: { best, crowns, plays, at } }, rounds, taps } inside wordRealms.save.v1 (cloud-synced). */
(function () {
const WR = window.WR, esc = WR.esc;
WR.PHONICS = { id: "phonics", name: "Phonics", icon: "🔤", desc: "Phonics Path" };
const KEY = "a1/phonics", ROUND = 8;

/* ---------- sounds: what a tile says (sound + keyword) and its picture ---------- */
const SOUND = {
  s: ["sss", "sun"], a: ["a", "apple"], t: ["tuh", "tiger"], p: ["puh", "pig"], i: ["ih", "insect"], n: ["nnn", "nest"],
  m: ["mmm", "moon"], d: ["duh", "dog"], g: ["guh", "goat"], o: ["o", "octopus"], c: ["kuh", "cat"], k: ["kuh", "kite"],
  e: ["eh", "egg"], u: ["uh", "umbrella"], r: ["rrr", "rabbit"], h: ["huh", "hat"], b: ["buh", "bee"], f: ["fff", "fish"],
  l: ["lll", "leaf"], j: ["juh", "jelly"], v: ["vvv", "van"], w: ["wuh", "web"], x: ["ks", "fox"], y: ["yuh", "yo-yo"], z: ["zzz", "zebra"],
  sh: ["shh", "ship"], ch: ["chuh", "chick"], th: ["thh", "thumb"], ck: ["kuh", "duck"], ng: ["ng", "ring"]
};
const SAME = [["c", "k", "ck"]];                         // letters that make the same sound never appear as rival options
const same = (a, b) => a === b || SAME.some(g => g.includes(a) && g.includes(b));
const PIC = {
  sun: "☀️", sock: "🧦", snake: "🐍", seal: "🦭", apple: "🍎", ant: "🐜", tiger: "🐯", tent: "⛺", tooth: "🦷", tomato: "🍅",
  pig: "🐷", panda: "🐼", pizza: "🍕", pen: "🖊️", insect: "🐛", iguana: "🦎", nest: "🪺", nose: "👃", net: "🥅", nut: "🥜",
  moon: "🌙", mouse: "🐭", monkey: "🐵", milk: "🥛", dog: "🐶", duck: "🦆", drum: "🥁", goat: "🐐", gift: "🎁", grapes: "🍇",
  octopus: "🐙", otter: "🦦", cat: "🐱", cow: "🐮", cake: "🎂", kite: "🪁", king: "🤴", key: "🔑", koala: "🐨", egg: "🥚",
  elephant: "🐘", elf: "🧝", umbrella: "☂️", up: "⬆️", rabbit: "🐰", rainbow: "🌈", robot: "🤖", rose: "🌹", hat: "🎩",
  horse: "🐴", house: "🏠", heart: "💖", bee: "🐝", bear: "🐻", banana: "🍌", bed: "🛏️", fish: "🐟", fox: "🦊", frog: "🐸",
  flower: "🌸", leaf: "🍃", lion: "🦁", lemon: "🍋", ball: "⚽",
  bus: "🚌", cup: "🥤", hen: "🐔", map: "🗺️", bat: "🦇", log: "🪵", mug: "☕", van: "🚐", web: "🕸️", fan: "🪭", box: "📦",
  bug: "🐞", ten: "🔟", pin: "📌", cap: "🧢", leg: "🦵", lip: "👄", jam: "🍯", six: "6️⃣",
  ship: "🚢", shop: "🏪", dish: "🍽️", shell: "🐚", shoe: "👟", chick: "🐤", chip: "🍟", chair: "🪑", cheese: "🧀", lunch: "🍱",
  thumb: "👍", three: "3️⃣", bath: "🛁", teeth: "🦷", clock: "⏰", rock: "🪨", lock: "🔒", ring: "💍", wing: "🪽", sing: "🎤",
  lake: "🏞️", bike: "🚲", five: "5️⃣", smile: "😊", bone: "🦴", home: "🏡", cube: "🧊", tube: "🧪", flute: "🪈", note: "🎵"
};
// painted word pictures (assets/words, made for the C2 picture questions) are used where they exist, emoji otherwise
const pic = w => WR.asset && WR.asset("word_" + w) ? WR.img("word_" + w, "ph-art") : `<span class="ph-emo" aria-hidden="true">${PIC[w] || "✨"}</span>`;
const START = {                                          // words that start with each letter sound (unit 1–2 pictures)
  s: ["sun", "sock", "snake", "seal"], a: ["apple", "ant"], t: ["tiger", "tent", "tooth", "tomato"], p: ["pig", "panda", "pizza", "pen"],
  i: ["insect", "iguana"], n: ["nest", "nose", "net", "nut"], m: ["moon", "mouse", "monkey", "milk"], d: ["dog", "duck", "drum"],
  g: ["goat", "gift", "grapes"], o: ["octopus", "otter"], c: ["cat", "cow", "cake"], k: ["kite", "king", "key", "koala"],
  e: ["egg", "elephant", "elf"], u: ["umbrella", "up"], r: ["rabbit", "rainbow", "robot", "rose"], h: ["hat", "horse", "house", "heart"],
  b: ["bee", "bear", "banana", "bed"], f: ["fish", "fox", "frog", "flower"], l: ["leaf", "lion", "lemon"]
};
// real CVC words (hear-and-pick rivals only; the first group also has pictures)
const CVC_PIC = ["cat", "dog", "sun", "bed", "pig", "hat", "bus", "cup", "fox", "hen", "map", "net", "pen", "bat", "log", "mug", "van", "web", "fan", "box", "bug", "ten", "pin", "cap", "leg", "nut"];
const CVC = CVC_PIC.concat(("bag bad ban bet beg big bin bit bud bun but cab can cot cub cut dad den dig dip dot dug fat fed fig fin fit gap get got gum had ham " +
  "hid him hip hit hog hop hot hug hut jet jog jug kid kit lap let lid lit lot mad man mat men met mop mud nap nod not pan pat peg pet pit pod pot pup " +
  "rag ram ran rat red rib rip rod rot rub rug run sad sat set sip sit tag tan tap tin tip top tub tug vet wag wet wig win yes").split(" "));
const DIGRAPH = {
  sh: { pics: ["ship", "shop", "fish", "dish", "shell"], build: ["ship", "shop", "fish", "dish", "shed", "shut"] },
  ch: { pics: ["chick", "chip", "chair", "cheese", "lunch"], build: ["chip", "chin", "chop", "much", "rich", "chat"] },
  th: { pics: ["thumb", "three", "bath", "teeth"], build: ["thin", "bath", "moth", "with", "path", "that"] },
  ck: { pics: ["duck", "sock", "clock", "rock", "lock"], build: ["duck", "sock", "rock", "lock", "back", "kick", "neck"] },
  ng: { pics: ["ring", "king", "wing", "sing"], build: ["ring", "king", "sing", "wing", "long", "bang"] }
};
const DG_HEAR = [["ship", "chip", "sip"], ["shop", "chop", "hop"], ["chin", "thin", "shin"], ["dish", "dip", "did"], ["bath", "bat", "bash"],
  ["moth", "mop", "moss"], ["sock", "shock", "sob"], ["king", "kick", "kid"], ["ring", "rich", "rid"], ["wing", "wish", "win"], ["much", "mush", "mud"],
  ["chick", "thick", "tick"], ["shell", "sell", "tell"], ["duck", "dug", "dutch"], ["sing", "sick", "sit"]];
const MAGIC = [["cap", "cape"], ["tap", "tape"], ["can", "cane"], ["hat", "hate"], ["mad", "made"], ["kit", "kite"], ["pin", "pine"], ["bit", "bite"],
  ["hid", "hide"], ["hop", "hope"], ["not", "note"], ["rob", "robe"], ["cub", "cube"], ["tub", "tube"], ["cut", "cute"]];
const MAGIC_BUILD = ["cake", "tape", "gate", "lake", "kite", "bike", "five", "pine", "bone", "rose", "nose", "home", "note", "cube", "tube", "cute"];
const MAGIC_PIC = ["cake", "lake", "snake", "kite", "bike", "five", "smile", "bone", "rose", "nose", "home", "cube", "tube", "flute", "note"];
const SHORT_PIC = ["cat", "hat", "pig", "dog", "sun", "bed", "bus", "fox", "cup", "pen"];
const SIGHT = ["the", "to", "is", "said", "was", "you", "he", "she", "we", "me", "my", "go", "no", "are", "they", "all", "of", "have", "like",
  "come", "some", "here", "there", "what", "one", "do", "so", "put", "saw", "as"];
const LOOKS = [["was", "saw", "as"], ["the", "they", "then"], ["here", "there", "where"], ["come", "some", "came"], ["you", "your", "yes"],
  ["are", "all", "and"], ["of", "off", "on"], ["he", "she", "we"], ["go", "no", "so"], ["said", "sad", "sand"], ["what", "want", "that"],
  ["one", "on", "once"], ["have", "has", "had"], ["like", "lick", "little"], ["my", "me", "by"], ["do", "to", "so"]];
const SENT = ["The cat is on the mat.", "I like my red hat.", "She said hello to me.", "We are going to the park.", "They have a big dog.",
  "Come and play with me.", "What is your name?", "My pet was so happy.", "Here is one for you.", "Do you like cake?",
  "He saw a little frog.", "Put the cup on the table.", "Some of the fish are blue.", "All the bees go buzz.", "There is a star in the sky."];

/* ---------- the six steps ---------- */
const UNITS = [
  { id: "u1", icon: "🐍", name: "Sound Seeds", focus: "s · a · t · p · i · n", letters: ["s", "a", "t", "p", "i", "n"], mix: { sound: 3, first: 3, odd: 2 } },
  { id: "u2", icon: "🌼", name: "Sound Garden", focus: "m d g o c k e u r h b f l", letters: ["m", "d", "g", "o", "c", "k", "e", "u", "r", "h", "b", "f", "l"], mix: { sound: 3, first: 3, odd: 2 } },
  { id: "u3", icon: "🪄", name: "Blend Bridge", focus: "c-a-t → cat", mix: { blend: 3, build: 3, hear: 2 } },
  { id: "u4", icon: "🐚", name: "Two-Letter Twins", focus: "sh · ch · th · ck · ng", mix: { hear: 3, build: 3, odd: 2 } },
  { id: "u5", icon: "✨", name: "Magic-e Meadow", focus: "cap → cape · kit → kite", mix: { hear: 3, build: 3, odd: 2 } },
  { id: "u6", icon: "👀", name: "Tricky Word Tower", focus: "the · said · was · you", mix: { hear: 3, build: 2, find: 3 } }
];
const pick = a => a[Math.floor(Math.random() * a.length)];
const sayOf = g => SOUND[g] ? SOUND[g][0] : g;
const keyOf = g => SOUND[g] ? `${SOUND[g][0]}… ${SOUND[g][1]}` : g;
// split a word into tiles: digraphs stay together (sh, ch, th, ck, ng)
const graphemes = w => w.match(/sh|ch|th|ck|ng|./g);
const oneOff = (a, b) => a.length === b.length && [...a].filter((c, i) => c !== b[i]).length === 1;
const rivalsFor = (w, pool) => WR.shuffle(pool.filter(x => x !== w && oneOff(x, w)));
const letterOpts = (ans, from) => [ans].concat(WR.sample(from.filter(x => !same(x, ans)), 2));
const tilePool = (w, extra) => WR.shuffle(graphemes(w).concat(WR.sample(extra.filter(x => !graphemes(w).includes(x)), 2)));

/* ---------- question makers (one per activity type) ---------- */
const MAKE = {
  sound: u => { const ans = pick(u.letters); return { t: "sound", say: keyOf(ans), answer: ans, options: WR.shuffle(letterOpts(ans, u.letters)), prompt: "Listen. Which letter makes this sound?" }; },
  first: u => {
    const ans = pick(u.letters.filter(l => START[l])), w = pick(START[ans]);
    return { t: "first", word: w, say: w, answer: ans, options: WR.shuffle(letterOpts(ans, u.letters.filter(l => START[l]))), prompt: `What sound does <b>${esc(w)}</b> start with?` };
  },
  odd: u => {
    if (u.id === "u4") {
      const k = pick(Object.keys(DIGRAPH)), other = pick(Object.keys(DIGRAPH).filter(x => x !== k && !same(x, k)));
      // the odd one may not hide the same sound in another spelling (no c/k words when the sound is ck)
      const odd = pick(DIGRAPH[other].pics.filter(w => !w.includes(k) && !(k === "ck" && /[ck]/.test(w))));
      const opts = WR.sample(DIGRAPH[k].pics, 3).concat(odd);
      return { t: "odd", answer: odd, options: WR.shuffle(opts), say: `Which one does not have the ${sayOf(k)} sound? ` + opts.join(", "), prompt: `Which one does <b>not</b> have the <b>${k}</b> sound?`, hint: k };
    }
    if (u.id === "u5") {
      const odd = pick(SHORT_PIC), opts = WR.sample(MAGIC_PIC, 3).concat(odd);
      return { t: "odd", answer: odd, options: WR.shuffle(opts), say: "Three words have a magic e. Which one does not? " + opts.join(", "), prompt: "Three words have a magic <b>e</b> ✨ Which one does <b>not</b>?" };
    }
    const k = pick(u.letters.filter(l => START[l] && START[l].length >= 3)), other = pick(u.letters.filter(l => START[l] && !same(l, k)));
    const odd = pick(START[other]), opts = WR.sample(START[k], 3).concat(odd);
    return { t: "odd", answer: odd, options: WR.shuffle(opts), say: `Which one does not start with ${sayOf(k)}? ` + opts.join(", "), prompt: `Which one does <b>not</b> start with <b>${k}</b>?`, hint: k };
  },
  blend: () => { const w = pick(CVC_PIC); return { t: "blend", word: w, tiles: graphemes(w), answer: w, options: WR.shuffle([w].concat(WR.sample(CVC_PIC.filter(x => x !== w), 2))), prompt: "Tap each sound, then blend it! Which picture is it?" }; },
  build: u => {
    const w = u.id === "u3" ? pick(CVC_PIC) : u.id === "u4" ? pick(DIGRAPH[pick(Object.keys(DIGRAPH))].build) : u.id === "u5" ? pick(MAGIC_BUILD) : pick(SIGHT.filter(x => x.length >= 2 && x.length <= 4));
    const extra = u.id === "u4" ? ["sh", "ch", "th", "ck", "ng", "a", "e", "i", "o", "u"] : "abcdefghilmnoprstuw".split("");
    return { t: "build", word: w, say: w, answer: w, tiles: graphemes(w), pool: tilePool(w, extra), pic: u.id !== "u6" && PIC[w] ? w : null, prompt: "Listen, then build the word with the tiles." };
  },
  hear: u => {
    let set;
    if (u.id === "u3") { const w = pick(CVC_PIC), r = rivalsFor(w, CVC); set = [w].concat(r.slice(0, 2)); if (set.length < 3) set = set.concat(WR.sample(CVC.filter(x => !set.includes(x)), 3 - set.length)); }
    else if (u.id === "u4") set = pick(DG_HEAR).slice();
    else if (u.id === "u5") { const p = pick(MAGIC), w = pick(p); set = [w, p.find(x => x !== w), pick(MAGIC.filter(q => q !== p))[w.length === 4 ? 1 : 0]]; }
    else set = pick(LOOKS).slice();
    const ans = set[0];
    return { t: "hear", word: ans, say: ans, answer: ans, options: WR.shuffle(set), prompt: "Listen. Which word did you hear?" };
  },
  find: () => {
    const s = pick(SENT), words = s.replace(/[.?!]/g, "").split(" "), cand = words.filter(x => SIGHT.includes(x.toLowerCase()));
    const w = pick(cand).toLowerCase();
    return { t: "find", sentence: s, word: w, say: `Find the word: ${w}`, answer: w, prompt: `Find the word you hear in the sentence.` };
  }
};
const makeRound = u => WR.shuffle(Object.entries(u.mix).flatMap(([t, n]) => {
  const out = [], seen = new Set();
  for (let tries = 0; out.length < n && tries < 40; tries++) { const q = MAKE[t](u); const id = q.t + ":" + (q.answer || "") + ":" + (q.say || ""); if (!seen.has(id)) { seen.add(id); out.push(q); } }
  return out;
})).slice(0, ROUND);

/* ---------- save ---------- */
const freshPhonics = () => ({ done: {}, rounds: 0, taps: 0 });
WR.freshPhonics = freshPhonics;
const st = () => { const s = WR.state; s.phonics = Object.assign(freshPhonics(), s.phonics || {}); s.phonics.done = s.phonics.done || {}; return s.phonics; };
WR.phonicsState = st;
const unlocked = i => i === 0 || WR.state.settings.unlockAll || !!st().done[UNITS[i - 1].id];
const stepsDone = () => UNITS.filter(u => st().done[u.id]).length;
WR.Phonics = { UNITS, MAKE, makeRound, graphemes, unlocked, stepsDone, sayOf, keyOf,
  best: () => { const d = Object.values(st().done); return d.length ? Math.max(...d.map(x => x.best)) : null; } };

/* ---------- entry points: A1 realm tile + map pill ---------- */
WR.phonicsTile = rid => {
  if (rid !== "a1") return "";
  const n = stepsDone();
  return `<div class="card skill-card phonics-tile" data-phonics="1"><span class="bonus-tag">Bonus</span><span class="ico">🔤</span><h3>Phonics</h3>
    <div class="muted" style="font-size:.85rem;font-weight:700">Phonics Path: sounds, blending, tricky words</div><div class="crowns">${n ? `🐾 ${n}/${UNITS.length} steps` : WR.crownCell(null, "not played")}</div><div class="waiting-tag">${n < UNITS.length ? "🔤 Next: " + UNITS[Math.min(n, UNITS.length - 1)].name : "🌟 Path complete!"}</div></div>`;
};
// map card under the realm map (like the Number Kingdom card), for A1 starters or once played, so Continue stays on screen
WR.phonicsNode = () => (WR.state.startLevel === "a1" || stepsDone()) ? `<div class="card math-node phonics-node" id="phonicsNode" role="button" tabindex="0" style="margin-top:14px">${WR.img("bg_a1", "thumb", "", true)}
  <div style="flex:1"><div><span class="lvl-badge">A1</span><b>🔤 Phonics Path</b></div><div class="muted" style="font-size:.85rem;font-weight:700">Letter sounds, blending and tricky words</div>
  <div class="prog"><i style="width:${stepsDone() / UNITS.length * 100}%"></i></div><div class="muted" id="phonicsSteps" style="font-size:.75rem;font-weight:800">🐾 ${stepsDone()}/${UNITS.length} steps</div></div></div>` : "";

/* ---------- the path (hub) ---------- */
WR.screens.phonics = () => {
  const d = st().done;
  WR.view(`<div class="fade-in ph-hub"><div class="row lesson-top" style="margin:6px 0 8px"><button class="btn ghost small" id="phBack">← Meadow</button><b class="title">🔤 Phonics Path</b></div>
    <div class="card ph-intro"><div class="ph-pet">${WR.petHTML()}</div><div><b>Hop along the path with ${esc(WR.state.pet ? WR.state.pet.name : "your pet")}!</b>
      <div class="muted" style="font-size:.85rem;font-weight:700">Tap 🔊 to hear sounds. Tap letter tiles to hear them too.</div></div></div>
    <div class="ph-path">${UNITS.map((u, i) => { const x = d[u.id], un = unlocked(i);
      return `<button class="card ph-step ${un ? "" : "locked"} ${x ? "done" : ""}" data-u="${i}" ${un ? "" : 'aria-disabled="true"'}><span class="ph-num">${i + 1}</span><span class="ph-ico">${u.icon}</span>
        <span class="ph-txt"><b>${esc(u.name)}</b><small>${esc(u.focus)}</small></span><span class="ph-cr">${x ? WR.crownRow(x.crowns) : un ? '<span class="pill">▶ Play</span>' : "🔒"}</span></button>`; }).join("")}</div>
    <p class="muted ph-note">👪 Grown-ups: computer voices can't say every sound on its own, so each sound comes with a keyword (“sss… sun”). Say the sounds together for extra fun!</p></div>`);
  WR.$("#phBack").onclick = () => WR.go("realm", "a1");
  document.querySelectorAll(".ph-step").forEach(b => b.onclick = () => {
    const i = +b.dataset.u; if (!unlocked(i)) return WR.toast(`🔒 Finish “${UNITS[i - 1].name}” first!`, 2200);
    WR.startPhonics(i);
  });
};

/* ---------- a round ---------- */
let S = null;
const speak = (t, cb) => window.Speech && Speech.speak(t, WR.state.settings.rate, cb);
WR.startPhonics = i => { WR.go("phonicsRound", i); };
WR.stopPhonics = () => { S = null; };
WR.Phonics._q = () => S && S.qs[S.n];                    // the current question (tests)
WR.screens.phonicsRound = i => {
  const u = UNITS[i]; S = { i, u, qs: makeRound(u), n: 0, right: 0, built: [], blended: 0, answered: null };
  WR.setFocus && WR.setFocus(true);
  render(true);
};
function body(q) {
  const big = (o, k) => `<button class="opt ph-opt${q.t === "hear" || q.t === "first" || q.t === "sound" ? " ph-word" : ""}" data-k="${k}">${esc(o)}</button>`;
  if (q.t === "sound") return `<div class="opts ph-letters">${q.options.map(big).join("")}</div>`;
  if (q.t === "first") return `<div class="ph-pic">${pic(q.word)}</div><div class="opts ph-letters">${q.options.map(big).join("")}</div>`;
  if (q.t === "hear") return `<div class="opts ph-letters">${q.options.map(big).join("")}</div>`;
  if (q.t === "odd" || q.t === "blend") {
    const tiles = q.t === "blend" ? `<div class="ph-tiles" id="phTiles">${q.tiles.map((g, k) => `<button class="tile ph-tile" data-g="${g}" data-k="${k}">${g}</button>`).join("")}</div>
      <div class="row" style="justify-content:center"><button class="btn mint" id="phBlend">🪄 Blend it!</button></div>` : "";
    return `${tiles}<div class="opts ph-pics">${q.options.map((o, k) => `<button class="opt ph-picopt" data-k="${k}" aria-label="${esc(o)}">${pic(o)}<span>${esc(o)}</span></button>`).join("")}</div>`;
  }
  if (q.t === "build") return `${q.pic ? `<div class="ph-pic small">${pic(q.pic)}</div>` : ""}<div class="spell-slots ph-slots" id="phSlots">${q.tiles.map((_, k) => `<button class="slot${S.built[k] ? " filled" : ""}" data-s="${k}" aria-label="Slot ${k + 1}">${S.built[k] ? esc(q.pool[S.built[k].p]) : ""}</button>`).join("")}</div>
    <div class="tiles letters ph-pool" id="phPool">${q.pool.map((g, k) => `<button class="tile ph-tile" data-p="${k}" ${S.built.some(b => b && b.p === k) ? "disabled" : ""}>${g}</button>`).join("")}</div>`;
  if (q.t === "find") return `<div class="ph-sent">${q.sentence.split(" ").map((w, k) => `<button class="ph-sw" data-k="${k}">${esc(w)}</button>`).join(" ")}</div>`;
  return "";
}
function render(auto) {
  const q = S.qs[S.n], u = S.u;
  WR.view(`<div class="fade-in ph-round"><div class="row lesson-top" style="justify-content:space-between;margin:6px 0 8px"><button class="btn ghost small" id="phQuit">← Leave</button><div class="ph-progress"><div class="prog"><i style="width:${S.n / S.qs.length * 100}%"></i></div><b>${S.n + 1}/${S.qs.length}</b></div></div>
    <div class="card ph-card"><div class="ph-head"><span class="lvl-badge">A1</span><b>${u.icon} ${esc(u.name)}</b></div>
      <div class="row ph-ask"><button class="btn ph-say" id="phSay" aria-label="Hear it again">🔊</button><h3 class="q">${q.prompt}</h3></div>
      ${body(q)}<div id="phFb"></div></div></div>`);
  WR.$("#phQuit").onclick = () => WR.go("phonics");
  WR.$("#phSay").onclick = () => sayQ(q);
  bind(q);
  if (auto) setTimeout(() => S && S.qs[S.n] === q && sayQ(q), 250);
}
function sayQ(q) {
  if (q.t === "blend") return speak(q.tiles.map(sayOf).join("… "));
  speak(q.say || q.word || "");
}
function tapSound(g, el) { st().taps++; el && el.classList.add("lit"); speak(keyOf(g), () => el && el.classList.remove("lit")); }
function bind(q) {
  document.querySelectorAll(".ph-opt,.ph-picopt").forEach(b => b.onclick = () => choose(q.options[+b.dataset.k], b));
  if (q.t === "blend") {
    document.querySelectorAll("#phTiles .ph-tile").forEach(b => b.onclick = () => tapSound(b.dataset.g, b));
    WR.$("#phBlend").onclick = () => { S.blended++; const ts = [...document.querySelectorAll("#phTiles .ph-tile")]; ts.forEach(t => t.classList.add("lit")); speak(q.tiles.map(sayOf).join("… ") + "… " + q.word, () => ts.forEach(t => t.classList.remove("lit"))); };
  }
  if (q.t === "build") {
    document.querySelectorAll("#phPool .ph-tile").forEach(b => b.onclick = () => {
      if (S.answered) return; const k = S.built.findIndex(x => !x), slot = k < 0 ? S.built.length : k; if (slot >= q.tiles.length) return;
      S.built[slot] = { p: +b.dataset.p }; speak(sayOf(q.pool[+b.dataset.p]));
      if (S.built.filter(Boolean).length === q.tiles.length) { const w = S.built.map(x => q.pool[x.p]).join(""); render(); return choose(w); }
      render();
    });
    document.querySelectorAll("#phSlots .slot").forEach(b => b.onclick = () => { if (S.answered) return; S.built[+b.dataset.s] = null; render(); });
  }
  if (q.t === "find") document.querySelectorAll(".ph-sw").forEach(b => b.onclick = () => choose(b.textContent.replace(/[.?!,]/g, "").toLowerCase(), b));
}
function choose(val, btn) {
  if (S.answered) return;
  const q = S.qs[S.n], ok = val === q.answer; S.answered = { val, ok };
  if (ok) { S.right++; WR.sfx("good"); WR.questEvent("correct10"); } else WR.sfx("bad");
  WR.countAnswer(ok, KEY); WR.save();
  WR.petReact && WR.petReact(ok);
  document.querySelectorAll(".ph-opt,.ph-picopt,.ph-sw,.ph-tile,.slot").forEach(b => { b.disabled = true; });
  document.querySelectorAll(".ph-opt,.ph-picopt").forEach(b => { const o = q.options[+b.dataset.k]; if (o === q.answer) b.classList.add("right"); else if (b === btn) b.classList.add("wrong"); });
  document.querySelectorAll(".ph-sw").forEach(b => { const w = b.textContent.replace(/[.?!,]/g, "").toLowerCase(); if (w === q.answer) b.classList.add("right"); else if (b === btn) b.classList.add("wrong"); });
  const sl = WR.$("#phSlots"); if (sl) sl.classList.add(ok ? "right" : "wrong");
  const shown = q.t === "sound" ? `<b>${esc(q.answer)}</b> says “${esc(keyOf(q.answer))}”` : `<b>${esc(q.answer)}</b>` + (q.t === "first" ? ` · ${esc(q.word)} starts with “${esc(sayOf(q.answer))}”` : "");
  WR.$("#phFb").innerHTML = `<div class="story-fb ph-fb ${ok ? "good" : "bad"}"><b>${ok ? "✅ Yes!" : "💭 Not quite."}</b> ${ok ? "Lovely listening!" : "It's " + shown + "."}</div>
    <div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn" id="phNext">${S.n + 1 < S.qs.length ? "Next →" : "🌟 Finish"}</button></div>`;
  WR.$("#phNext").onclick = next;
  speak(ok ? q.answer : "It's " + q.answer);
}
function next() {
  if (S.n + 1 < S.qs.length) { S.n++; S.built = []; S.answered = null; return render(true); }
  finish();
}
function finish() {
  const rec = st(), u = S.u, prev = rec.done[u.id], score = S.right / S.qs.length, crowns = WR.crowns(score);
  let stars = 0;
  if (!prev) stars += S.right + 3;                                  // first walk: 1⭐ per right answer + 3⭐ for the step
  stars += Math.max(0, crowns - (prev ? prev.crowns : 0)) * 2;      // new crowns pay 2⭐ each
  rec.done[u.id] = { best: Math.max(score, prev ? prev.best : 0), crowns: Math.max(crowns, prev ? prev.crowns : 0), plays: (prev ? prev.plays : 0) + 1, at: Date.now() };
  rec.rounds++; WR.state.lessonsDone++; WR.save();
  if (stars) stars = WR.awardStars("phonics", u.id + "/" + Math.max(crowns, prev ? prev.crowns : 0) + (prev ? "" : "/first"), stars, { kind: "fresh" });
  const lv = WR.petGainXP ? WR.petGainXP(S.right * 2 + 2) : null;
  WR.questEvent("phonics1"); WR.activityDone();
  if (crowns === 3) WR.questEvent("perfect1");
  WR.Collect && WR.Collect.check();
  WR.sfx("level"); if (crowns >= 2) WR.confetti();
  const i = S.i, nextU = UNITS[i + 1], right = S.right, n = S.qs.length;
  S = null;
  WR.view(`<div class="fade-in center ph-done"><div class="card" style="max-width:560px;margin:0 auto"><div class="ph-pet big">${WR.petHTML()}</div>
    <h2 style="margin:.3em 0 .1em">${u.icon} ${esc(u.name)} done!</h2><div class="fb-crowns">${WR.crownRow(crowns)}</div>
    <p><b>${right}/${n}</b> right${stars ? ` · <b>+${stars} ⭐</b>` : " · stars already collected (new crowns still pay)"}${lv ? ` · ${esc(WR.state.pet.name)} reached Lv ${lv.level}!` : ""}</p>
    <div class="row" style="justify-content:center;gap:8px;flex-wrap:wrap"><button class="btn ghost" id="phAgain">↻ Play again</button>${nextU ? `<button class="btn mint" id="phNextU">Next: ${nextU.icon} ${esc(nextU.name)} →</button>` : ""}<button class="btn ghost" id="phPath">🔤 Path</button></div></div></div>`);
  WR.$("#phAgain").onclick = () => WR.startPhonics(i);
  const nu = WR.$("#phNextU"); if (nu) nu.onclick = () => WR.startPhonics(i + 1);
  WR.$("#phPath").onclick = () => WR.go("phonics");
}

/* ---------- 🏷️ sticker page ---------- */
const STK = UNITS.map(u => ({ id: u.id, icon: u.icon, name: u.name, how: `Finish “${u.name}” on the Phonics Path`, test: () => !!st().done[u.id] }))
  .concat([{ id: "champ", icon: "🏅", name: "Phonics Champion", how: "Get 3 crowns on every Phonics Path step", test: () => UNITS.every(u => (st().done[u.id] || {}).crowns === 3) }]);
if (WR.Collect) WR.Collect.addPages(() => [{ id: "phonics", icon: "🔤", title: "A1 · Phonics Path", name: "Phonics Path", bg: "bg_a1", defs: STK }]);
})();
