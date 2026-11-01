/* Core: data loading, persistent state, helpers, economy, quests. Exposed as window.WR */
(function () {
const WR = window.WR = {};
const SAVE_KEY = "wordRealms.save.v1";
const SKILLS = [
  { id: "grammar", name: "Grammar", icon: "🪄", desc: "Spells of sentence magic" },
  { id: "vocab", name: "Vocabulary", icon: "🌟", desc: "Collect word gems" },
  { id: "reading", name: "Reading", icon: "📖", desc: "Storybook comprehension" },
  { id: "listening", name: "Listening", icon: "🎧", desc: "Hear the realm whisper" }
];
const PETS = [
  { id: "pet_bunny", species: "bunny", name: "Puffbun", emoji: "🐰", likes: "carrot cookies", stages: ["Baby Puffbun", "Bloom Puffbun", "Royal Puffbun"] },
  { id: "pet_fox", species: "fox", name: "Mochi Fox", emoji: "🦊", likes: "berry mochi", stages: ["Kit Mochi", "Twinkle Mochi", "Celestial Mochi"] },
  { id: "pet_dragon", species: "dragon", name: "Minty", emoji: "🐉", likes: "star cake", stages: ["Hatchling Minty", "Sky Minty", "Elder Minty"] },
  { id: "pet_owl", species: "owl", name: "Hoot", emoji: "🦉", likes: "reading together", stages: ["Owlet Hoot", "Scholar Hoot", "Sage Hoot"] },
  // more friends from the Wardrobe (data/shop.json → pets: star tiers or earned); the four above are the starters
  { id: "pet_kitty", species: "kitty", name: "Lulu", emoji: "🐱", likes: "cuddles and yarn", stages: ["Kitten Lulu", "Lilac Lulu", "Moon Kitty Lulu"], extra: true },
  { id: "pet_panda", species: "panda", name: "Bao", emoji: "🐼", likes: "bamboo cookies", stages: ["Cub Bao", "Bamboo Bao", "Sage Panda Bao"], extra: true },
  { id: "pet_unicorn", species: "unicorn", name: "Sprinkle", emoji: "🦄", likes: "rainbow sprinkles", stages: ["Foal Sprinkle", "Dream Sprinkle", "Starlight Sprinkle"], extra: true },
  { id: "pet_penguin", species: "penguin", name: "Pip", emoji: "🐧", likes: "snow cones", stages: ["Chick Pip", "Frosty Pip", "Aurora Pip"], extra: true }
];
const AVATARS = [{ id: "avatar_girl", name: "Lily" }, { id: "avatar_boy", name: "Kai" }, { id: "avatar_mage", name: "Nova" }];
const QUEST_POOL = [
  { id: "correct10", icon: "✅", label: "Answer 10 questions correctly", goal: 10, reward: 5 },
  { id: "lesson2", icon: "📚", label: "Complete 2 lessons", goal: 2, reward: 6 },
  { id: "listen1", icon: "🎧", label: "Finish a listening lesson", goal: 1, reward: 5 },
  { id: "read1", icon: "📖", label: "Finish a reading lesson", goal: 1, reward: 5 },
  { id: "feed1", icon: "🍪", label: "Feed your pet a snack", goal: 1, reward: 3 },
  { id: "play3", icon: "⚽", label: "Play ball with your pet 3 times", goal: 3, reward: 4 },
  { id: "perfect1", icon: "👑", label: "Earn 3 crowns in a lesson", goal: 1, reward: 8 },
  { id: "combo5", icon: "🔥", label: "Get a 5-answer combo", goal: 1, reward: 5 },
  { id: "special1", icon: "✨", label: "Play a realm special game", goal: 1, reward: 6 },
  { id: "review1", icon: "💧", label: "Water your Mistake Garden (finish a review)", goal: 1, reward: 6 },
  { id: "speak1", icon: "🎤", label: "Finish an Echo Well speaking round", goal: 1, reward: 5 },
  { id: "write1", icon: "✒️", label: "Write a Story Quill task", goal: 1, reward: 6 },
  { id: "math1", icon: "🔢", label: "Finish a Number Kingdom maths lesson", goal: 1, reward: 6 },
  { id: "dojo1", icon: "🗼", label: "Climb the Times-Table Tower (practice or sprint)", goal: 1, reward: 5 },
  { id: "story1", icon: "📜", label: "Read a Storybook chapter", goal: 1, reward: 6 },
  { id: "model1", icon: "🧮", label: "Solve 3 maths questions with a Model Magic picture", goal: 3, reward: 5 },
  { id: "balance1", icon: "⚖️", label: "Balance an equation scale all the way to x (Grades 6–8 maths)", goal: 1, reward: 5 },
  { id: "clock1", icon: "🕰️", label: "Count, wind or set a clock in the Clock Workshop (Grades 1–3 maths)", goal: 1, reward: 5 },
  { id: "phonics1", icon: "🔤", label: "Walk a step of the A1 Phonics Path", goal: 1, reward: 5 },
  { id: "charm1", icon: "🔮", label: "Catch or polish your Word Charms (finish a round)", goal: 1, reward: 5 },
  { id: "swap1", icon: "🔀", label: "Finish a Spell Swap book (same meaning, new words)", goal: 1, reward: 5 },
  { id: "forge1", icon: "⚒️", label: "Finish a Word Forge anvil (make the right form of a word)", goal: 1, reward: 5 },
  { id: "cloze1", icon: "🌉", label: "Finish a Word Bridges text (one little word in each gap)", goal: 1, reward: 5 },
  { id: "marks1", icon: "🧚", label: "Finish a Punctuation Pixies book (the right mark in each gap)", goal: 1, reward: 5 }
];
Object.assign(WR, { SKILLS, PETS, AVATARS, QUEST_POOL, data: {}, manifest: null, screens: {} });

/* ---------- helpers ---------- */
WR.$ = (s, r = document) => r.querySelector(s);
/* R10: lesson stat chips ("⭐ 3" and "🔥 2", words shown only on wider screens), one place for lessons, maths and speaking */
WR.statsHTML = list => list.map(([e, n, w]) => `<span class="lchip"><span aria-hidden="true">${e}</span> <b>${n}</b><span class="stw"> ${WR.esc(w)}</span></span>`).join("");
WR.setStats = list => { const ls = WR.$("#lstats"); if (ls) ls.innerHTML = WR.statsHTML(list); };
WR.esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
WR.shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
WR.sample = (a, n) => WR.shuffle(a).slice(0, n);
/* 👆 One tap only (REVIEW-2026-11-01 R1): every "Next" / "Finish" button of a lesson-like mode goes through WR.tapOnce, so a
   double tap (or two clicks in the same tick) advances exactly once. The button is disabled on the first tap, so a stale
   button that is still on screen can never fire again. Each finish() also guards itself with a "done" flag. */
WR.tapOnce = (el, fn) => { if (!el) return el; el.onclick = e => { if (el.disabled || el.dataset.tapped) return; el.dataset.tapped = "1"; el.disabled = true; fn(e); }; return el; };
WR.dayKey = (t = Date.now()) => { const d = new Date(t); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
WR.today = () => WR.dayKey();
WR.dayDiff = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);
const fetchJSON = p => fetch(p).then(r => { if (!r.ok) throw new Error(p + " " + r.status); return r.json(); });

/* ---------- art from manifest, with placeholder fallback ---------- */
WR.asset = id => (WR.manifest && WR.manifest.assets.find(a => a.id === id)) || null;
// 📱 Light art: every image has a small WebP copy in assets/web (made by tools/optimize_art.py).
// Phones (≤ 820 px wide) get the 720 px backgrounds, bigger screens the 1280 px ones; the original PNG
// and then the SVG placeholder are the fallbacks if a WebP can't load.
WR.small = () => (window.innerWidth || 1024) <= 820;
WR.src = (id, kind = "auto") => {
  const a = WR.asset(id); if (!a) return "";
  const w = a.web || {};
  if (kind === "thumb") return w.thumb || a.thumb || a.path;
  if (kind === "orig") return a.path;
  return (WR.small() ? w.small : w.large) || w.large || a.path;
};
// CSS background: WebP when available (every current browser supports it; only one layer, so nothing is downloaded twice)
WR.bgCss = id => { const s = WR.src(id); return s ? `url('${s}')` : "none"; };
WR.fallbackChain = (img) => {
  const chain = (img.dataset.fbs || "").split("|").filter(Boolean);
  const next = chain.shift(); img.dataset.fbs = chain.join("|");
  if (next) img.src = next; else img.onerror = null;
};
WR.img = (id, cls = "", style = "", thumb = false) => {
  const a = WR.asset(id); if (!a) return "";
  const src = WR.src(id, thumb ? "thumb" : "auto");
  const fbs = [thumb && a.thumb, a.path, a.placeholder].filter(x => x && x !== src).join("|");
  return `<img class="${cls}" style="${style}" src="${src}" data-fbs="${fbs}" alt="${WR.esc(a.name)}" decoding="async"${thumb ? ' loading="lazy"' : ""} onerror="WR.fallbackChain(this)">`;
};

/* ---------- state ---------- */
function freshState() {
  return {
    v: 1, created: Date.now(), name: "", avatar: null, startLevel: "a1",
    pet: null, stars: 10, totalCorrect: 0, totalAnswered: 0,
    streak: { count: 0, last: null }, daily: null,
    progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
    settings: { rate: 0.9, sound: true, unlockAll: false }, mistakes: [], lessonsDone: 0,
    speaking: freshSpeaking(), writing: freshWriting(), math: freshMath(),
    report: freshReport(), earn: freshEarn(), ...freshBlocks(),
    looks: {}, stable: [], rewards: { got: [], chest: { last: null, n: 0 }, caughtUp: true }
  };
}
/* 📊 Activity log for the grown-ups' Learning Report (js/report.js), kept in the save so it cloud-syncs.
   report = { days: { "YYYY-MM-DD": { s: active seconds, l: lessons, k: { key: [right, wrong] } } } (newest 60 days),
              tally: { key: [right, wrong] } (all time), at: last activity time, seeded?: days rebuilt from an older save }
   keys: "<level>/<skill>" for English (a2/grammar … a2/speaking, a2/writing, a2/story), "m:<topic>" for maths
   (m:g3.times, m:dojo.tower), "garden" for Mistake Garden rounds. */
const LOG_DAYS = 60, GAP_MS = 3 * 60e3, FIRST_S = 20;
const freshReport = () => ({ days: {}, tally: {}, at: 0 });
// ⭐ anti-farm record, see WR.awardStars (economy section)
const freshEarn = () => ({ day: "", practice: 0, rounds: {}, got: {} });
const earnHash = k => { let h = 2166136261; k = String(k); for (let i = 0; i < k.length; i++) h = Math.imul(h ^ k.charCodeAt(i), 16777619); return (h >>> 0).toString(36); };
/* 🎒 Bonus-activity save blocks: ONE table for the shape of each bonus module's block in wordRealms.save.v1. It is used by
   freshState(), migrate() (older saves gain the block; a partial one is completed) and WR.block(name), each module's accessor,
   so no module keeps its own copy. maps = the fields that must be objects.
   stories 📜 (js/story.js): best per chapter ({ a1: { best, crowns, plays, at } }), glossary words looked up, reads
   phonics 🔤 (js/phonics.js): best result per step ({ u1: { best, crowns, plays, at } }), rounds played, letter-tile taps
   charms 🔮 (js/charms.js): one card per caught word ({ "a1:apple": { b: box 0–5, d: due time, r, w, at } }), rounds, last level
   swap 🔀 (js/swap.js): best result per Spell Swap book ({ "b2.1": { best, crowns, plays, at } }), rounds, last level
   forge ⚒️ (js/forge.js): best result per Word Forge anvil (same shape as swap), rounds, last level
   cloze 🌉 (js/cloze.js): best result per Word Bridges text (same shape as swap), rounds, last level
   marks 🧚 (js/marks.js): best result per Punctuation Pixies book (same shape as swap), rounds, last level
   crowned = the block keeps crowned units in done{} (WR.finishUnit); the cloud progress score counts their crowns (js/cloud.js).
   Gap games (js/gap-round.js: Spell Swap, Word Forge, Word Bridges, Punctuation Pixies) all share the same shape: gapBlock(). */
const gapBlock = () => ({ fresh: () => ({ done: {}, rounds: 0, lvl: null }), maps: ["done"], crowned: true });
const BLOCKS = {
  stories: { fresh: () => ({ done: {}, words: {}, reads: 0 }), maps: ["done", "words"], crowned: true },
  phonics: { fresh: () => ({ done: {}, rounds: 0, taps: 0 }), maps: ["done"], crowned: true },
  charms: { fresh: () => ({ cards: {}, rounds: 0, lvl: null }), maps: ["cards"] },
  swap: gapBlock(),
  forge: gapBlock(),
  cloze: gapBlock(),
  marks: gapBlock()
};
const freshBlocks = () => Object.fromEntries(Object.entries(BLOCKS).map(([k, b]) => [k, b.fresh()]));
const fixBlock = (s, k) => { const b = BLOCKS[k], v = s[k]; s[k] = Object.assign(b.fresh(), v && typeof v === "object" ? v : {}); for (const m of b.maps) s[k][m] = s[k][m] || {}; return s[k]; };
WR.BLOCKS = BLOCKS;
WR.block = k => fixBlock(WR.state, k);
WR.freshCharms = BLOCKS.charms.fresh; WR.freshPhonics = BLOCKS.phonics.fresh;
WR.LOG_DAYS = LOG_DAYS;
// an older save gains a log rebuilt from the dates it already has (last play of each skill/topic, story chapters, sprints, streak)
function seedReport(s) {
  const r = freshReport(), n = {}, add = t => { if (t) { const d = WR.dayKey(t); n[d] = (n[d] || 0) + 1; } };
  Object.values(s.progress || {}).forEach(p => Object.values(p || {}).forEach(x => x && add(x.last)));
  Object.values(s.math.topics || {}).forEach(x => x && add(x.last));
  Object.values(s.stories.done || {}).forEach(x => x && add(x.at));
  (s.math.dojo.history || []).forEach(h => h && add(h.at));
  if (s.streak && s.streak.last && !n[s.streak.last]) n[s.streak.last] = 1;
  Object.keys(n).sort().slice(-LOG_DAYS).forEach(d => r.days[d] = { s: 0, l: n[d], k: {}, est: 1 });
  if (Object.keys(n).length) r.seeded = Date.now();
  return r;
}
function logDay() {
  const r = WR.state.report, d = WR.today(), now = Date.now();
  const day = r.days[d] = r.days[d] || { s: 0, l: 0, k: {} };
  const gap = now - (r.at || 0); day.s += gap > 0 && gap < GAP_MS ? Math.round(gap / 1000) : FIRST_S; r.at = now;
  const ks = Object.keys(r.days); if (ks.length > LOG_DAYS) ks.sort().slice(0, ks.length - LOG_DAYS).forEach(k => delete r.days[k]);
  return day;
}
// one right/wrong answer for the report (today + all time); no star or total changes
WR.tally = (key, ok) => {
  const r = WR.state.report, day = logDay(); if (!key) return;
  for (const t of [r.tally, day.k]) { const v = t[key] = t[key] || [0, 0]; v[ok ? 0 : 1]++; }
};
// every answered question: the save's totals + the report tally (tallyOk when "right" differs, e.g. an Echo Well retry)
WR.countAnswer = (ok, key, tallyOk = ok) => { const s = WR.state; s.totalAnswered++; if (ok) s.totalCorrect++; WR.tally(key, tallyOk); };
// the end of any lesson / round: the "Complete 2 lessons" quest, one lesson in today's log, the streak (returns true if it grew)
WR.activityDone = (count = true) => {
  const day = logDay(); if (count) { day.l++; WR.questEvent("lesson2"); }
  const grew = WR.bumpStreak(); WR.save(); return grew;
};
// ✒️ Story Quill: best result per prompt ({ total, crowns, scales, at }) and saved drafts per prompt ({ plan, text, at })
const freshWriting = () => ({ checks: 0, crowns: 0, best: {}, drafts: {} });
// 🔢 Number Kingdom: chosen grade, best score per topic ("g3.times", "g7.mixed", "dojo.clongdiv"), Times-Table Tower facts
// ({ "7x8": { b: Leitner box 0–5, r: right, w: wrong, d: next review time, t: last answer ms, l: last seen } }) and dojo stats
// 🛡️ bosses: Grade Guardian results per band ({ g12: { won, best, tries, at } })
// 🕰️ clock: Clock Workshop tools opened, hops wound, clocks counted/wound to the end, clocks set right, free-play visits
const freshMath = () => ({ grade: null, placed: null, xp: 0, correct: 0, answered: 0, lessons: 0, models: 0, modelSolved: 0, balance: { opened: 0, moves: 0, done: 0 }, clock: { opened: 0, hops: 0, done: 0, set: 0, plays: 0 }, topics: {}, facts: {}, bosses: {}, dojo: { tables: [2, 3, 4, 5], op: "x", best: 0, sprints: 0, practice: 0, history: [] } });
WR.freshMath = freshMath;
// one place that completes a (possibly old or partial) maths block in place; used on load and by WR.Math.st()
// (in place, so objects other code holds, like math.dojo, stay the same objects)
WR.fixMath = m => { const f = freshMath(); m = m || f;
  for (const k in f) if (m[k] === undefined || (m[k] === null && f[k] && typeof f[k] === "object")) m[k] = f[k];
  for (const box of ["dojo", "balance", "clock"]) for (const k in f[box]) if (m[box][k] === undefined) m[box][k] = f[box][k]; return m; };
const freshSpeaking = () => ({ rounds: 0, attempts: 0, passed: 0, perfect: 0, preferShadow: false, shadowWhy: null });
// older saves (before the Echo Well / Story Quill) simply gain the speaking and writing stats; nothing else changes
const OLD_SLOT = { o_leaf: "neck", o_rainbow: "back" };   // (migrate runs before data/shop.json loads)
function migrate(s, raw = s) {
  s.speaking = Object.assign(freshSpeaking(), s.speaking || {});
  s.writing = Object.assign(freshWriting(), s.writing || {});
  s.writing.best = s.writing.best || {}; s.writing.drafts = s.writing.drafts || {};
  s.settings = Object.assign({ rate: 0.9, sound: true, unlockAll: false }, s.settings || {});
  s.progress = s.progress || {}; s.mistakes = s.mistakes || [];
  for (const k in BLOCKS) fixBlock(s, k);
  s.math = WR.fixMath(s.math);
  if (!raw.report || typeof raw.report !== "object") s.report = seedReport(s);
  s.report.days = s.report.days || {}; s.report.tally = s.report.tally || {}; s.report.at = s.report.at || 0;
  // ⭐ anti-farm record (WR.awardStars); an older save counts the English items it has already been served as known
  // 👗 layered looks: the old single outfit becomes the hero's item in its slot; pets gain looks, love and a stable
  if (!raw.looks || typeof raw.looks !== "object") { s.looks = {}; const o = s.equipped && s.equipped.outfit, it = o && WR.shop && WR.shop.outfits.find(x => x.id === o); if (o) s.looks[it ? it.slot : (OLD_SLOT[o] || "head")] = o; }
  if (s.pet) { s.pet.looks = s.pet.looks || {}; s.pet.love = s.pet.love || 0; }
  s.stable = Array.isArray(s.stable) ? s.stable : [];
  s.rewards = Object.assign({ got: [], chest: { last: null, n: 0 } }, s.rewards || {}); s.rewards.got = s.rewards.got || []; s.rewards.chest = s.rewards.chest || { last: null, n: 0 }; if (!raw.rewards) s.rewards.caughtUp = false;   // an older save: catch up once, quietly (js/wardrobe.js)
  if (!raw.earn || typeof raw.earn !== "object") { s.earn = freshEarn(); for (const b in s.seen || {}) for (const k of s.seen[b] || []) s.earn.got[earnHash("en:" + k)] = 1; }
  else s.earn = Object.assign(freshEarn(), s.earn, { got: s.earn.got || {}, rounds: s.earn.rounds || {} });
  return s;
}
WR.load = () => { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && s.v === 1) return migrate(Object.assign(freshState(), s), s); } catch (e) { } return freshState(); };
WR.save = () => localStorage.setItem(SAVE_KEY, JSON.stringify(WR.state));
WR.reset = () => { localStorage.removeItem(SAVE_KEY); WR.state = freshState(); };
/* 🧹 Reset safety net (REVIEW-2026-11-01 R2): before a reset the whole save is copied to wordRealms.save.backup.<day>.<time>
   (kept 7 days on this device only, never synced), and ⚙️ → 👪 Grown-ups offers "Undo reset" while a backup exists. */
const BACKUP = "wordRealms.save.backup.", KEEP_DAYS = 7;
WR.backups = () => Object.keys(localStorage).filter(k => k.startsWith(BACKUP)).sort().reverse();   // newest first
WR.backupDay = k => k.slice(BACKUP.length, BACKUP.length + 10);
WR.backupSave = () => {
  const cut = WR.dayKey(Date.now() - KEEP_DAYS * 864e5);
  WR.backups().forEach(k => { if (WR.backupDay(k) < cut) localStorage.removeItem(k); });
  if (!WR.state.pet) return null;                         // nothing worth keeping (a fresh save)
  const k = BACKUP + WR.today() + "." + Date.now(); localStorage.setItem(k, JSON.stringify(WR.state)); return k;
};
WR.restoreBackup = (k = WR.backups()[0]) => {
  let s = null; try { s = JSON.parse(localStorage.getItem(k)); } catch (e) { }
  if (!s || s.v !== 1) return false;
  localStorage.setItem(SAVE_KEY, JSON.stringify(s)); localStorage.removeItem(k); WR.state = WR.load(); return true;
};
WR.state = WR.load();
/* 🪟 Two tabs (REVIEW-2026-11-01 R5): every change is saved at once, so the newest write in localStorage already holds all of
   this tab's progress. When another tab or the installed app saves, this tab adopts that save before it saves again, so an
   older tab can never write its stale copy over newer stars. WR.onOtherTab (js/main.js) redraws and shows a soft banner. */
window.addEventListener("storage", e => {
  if (e.key !== SAVE_KEY || (e.storageArea && e.storageArea !== localStorage)) return;
  WR.state = WR.load(); WR.onOtherTab && WR.onOtherTab();
});

WR.init = async () => {
  WR.manifest = await fetchJSON("assets/manifest.json").catch(() => ({ assets: [] }));
  WR.realms = await fetchJSON("data/realms.json");
  WR.shop = await fetchJSON("data/shop.json");
  WR.anchorData = await fetchJSON("data/anchors.json").catch(() => ({}));
  WR.applyPrices(WR.shop);
  WR.counts = await fetchJSON("data/counts.json").catch(() => null);
  WR.tickPet(); WR.ensureDaily(); WR.applyTheme();
};
WR.bank = async (lvl, skill) => {
  const k = lvl + "/" + skill;
  if (!WR.data[k]) WR.data[k] = await fetchJSON("data/" + k + ".json");
  return WR.data[k];
};

/* ---------- sounds (tiny WebAudio chimes) ---------- */
let actx = null;
WR.sfx = type => {
  if (!WR.state.settings.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = { good: [784, 988, 1319], bad: [330, 262], coin: [1319, 1568], level: [523, 659, 784, 1047], tap: [660] }[type] || [600];
    notes.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type === "bad" ? "triangle" : "sine"; o.frequency.value = f;
      const t = actx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 0.3);
    });
  } catch (e) { }
};

/* ⏸️ R8 (REVIEW-2026-11-01): timed rounds (boss / dragon timer, Times-Table sprint) pause while the app is hidden (another app,
   a locked phone, a closed tab) and come back with "Ready? 3-2-1". A round registers { pause, resume } with WR.pauseable(). */
const pausers = new Set(); let appHidden = false;
WR.pauseable = (pause, resume) => { const o = { pause, resume }; pausers.add(o); return () => pausers.delete(o); };
const appHide = () => { if (appHidden) return; appHidden = true; pausers.forEach(p => p.pause()); };
const appShow = () => { if (!appHidden || document.hidden) return; appHidden = false; pausers.forEach(p => p.resume()); };
document.addEventListener("visibilitychange", () => document.hidden ? appHide() : appShow());
addEventListener("pagehide", appHide); addEventListener("pageshow", appShow);
WR.readyGo = done => {
  document.querySelectorAll(".ready-go").forEach(x => x.remove());
  const el = document.createElement("div"); el.className = "ready-go"; el.setAttribute("role", "status"); document.body.appendChild(el);
  const steps = ["Ready?", "3", "2", "1"]; let i = 0;
  const next = () => { if (!document.body.contains(el)) return; if (i >= steps.length) { el.remove(); return done(); } el.textContent = steps[i++]; WR.sfx && WR.sfx("tap"); setTimeout(next, i === 1 ? 800 : 600); };
  next(); return el;
};

/* ---------- UI helpers ---------- */
// 🍞 Toasts (review T4): at most 2 on screen, auto-hide within 2.5 s, never take taps (pointer-events:none in css/phone.css),
// sit at the bottom on phones, and are cleared by WR.go() (see WR.clearFx) so none follows the child to the next screen.
/* R7 (REVIEW-2026-11-01): while a question is on screen, celebrations (stickers, quests, gifts, bonus stars) wait and are
   shown on the next screen without a question (the result screen, the map…), so a pop-up never covers an answer, the
   question or a name. Hints the child needs right now pass { now: true }. js/ux.js calls WR.flushToasts after each screen. */
const heldToasts = [];
WR.questionOnScreen = () => document.body.classList.contains("wr-focus") && !document.querySelector(".result, .ch-done, .ph-done, .story-done, .sw-done");
WR.flushToasts = () => { if (WR.questionOnScreen()) return; heldToasts.splice(0, 2).forEach((t, i) => setTimeout(() => WR.toast(t[0], t[1], { now: true }), i * 700)); heldToasts.length = 0; };
WR.toast = (msg, ms = 1800, opts = {}) => {
  if (!opts.now && WR.questionOnScreen()) { if (!heldToasts.some(t => t[0] === msg)) heldToasts.push([msg, ms]); return; }
  ms = Math.min(ms, 2500);
  const old = [...document.querySelectorAll(".toast")]; old.slice(0, Math.max(0, old.length - 1)).forEach(x => x.remove());
  const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.innerHTML = msg; t.dataset.born = Date.now();
  document.body.appendChild(t); setTimeout(() => t.classList.add("out"), ms - 300); setTimeout(() => t.remove(), ms);
};
WR.modal = (html, onMount) => {
  const bg = document.createElement("div"); bg.className = "modal-bg";
  bg.innerHTML = `<div class="card modal">${html}</div>`;
  bg.addEventListener("click", e => { if (e.target === bg) bg.remove(); });
  document.body.appendChild(bg); onMount && onMount(bg, () => bg.remove()); return bg;
};
// 🎉 Confetti (review T3): one fixed, clipped layer, so pieces can never widen the page; skipped for reduced motion;
// pieces older than 0.3 s are cleared when the screen changes (WR.clearFx), so nothing falls over the next question.
WR.reducedMotion = () => !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
WR.confetti = (n = 26) => {
  if (WR.reducedMotion()) return;
  let layer = document.querySelector(".confetti-layer");
  if (!layer) { layer = document.createElement("div"); layer.className = "confetti-layer"; layer.setAttribute("aria-hidden", "true"); document.body.appendChild(layer); }
  const em = ["⭐", "✨", "🌸", "💖", "🍬", "🌟", "🎀"], born = Date.now();
  for (let i = 0; i < n; i++) {
    const c = document.createElement("div"); c.className = "confetti"; c.textContent = em[i % em.length]; c.dataset.born = born;
    c.style.left = Math.random() * 92 + "%"; c.style.animationDuration = 1.6 + Math.random() * 1.6 + "s"; c.style.animationDelay = Math.random() * .4 + "s";
    layer.appendChild(c); setTimeout(() => { c.remove(); if (!layer.children.length) layer.remove(); }, 3800);
  }
};
// clear celebrations left over from the previous screen (keeps anything fired in the last 0.3 s, e.g. a toast fired right before WR.go)
WR.clearFx = (toasts = true) => {
  const cut = Date.now() - 300;
  document.querySelectorAll(".confetti-layer .confetti").forEach(c => { if (+c.dataset.born < cut) c.remove(); });
  const l = document.querySelector(".confetti-layer"); if (l && !l.children.length) l.remove();
  if (toasts) document.querySelectorAll(".toast").forEach(t => { if (+t.dataset.born < cut) t.remove(); });
};
WR.applyTheme = () => {
  const root = document.documentElement.style;
  ["--bg1", "--bg2", "--accent"].forEach(v => root.removeProperty(v));
  const t = WR.shop && WR.shop.themes.find(x => x.id === WR.state.equipped.theme);
  if (t) Object.entries(t.vars).forEach(([k, v]) => root.setProperty(k, v));
};

/* ---------- avatar / pet rendering ---------- */
WR.petInfo = () => PETS.find(p => p.id === (WR.state.pet && WR.state.pet.species));
WR.petLevel = xp => 1 + Math.floor(xp / 80);
WR.petStage = lvl => lvl >= 10 ? 2 : lvl >= 5 ? 1 : 0;
/* 🎩 Layered looks — ONE shared renderer for heroes and pets, everywhere (map, pet screen, wardrobe, shop, lesson
   companion, thumbnails). The base art is an <img> (WebP/PNG fallback, pet-skin filter); hats, glasses, collars, wings
   and held items are separate transparent layers in two SVG overlays (behind / in front of the art) on the same 0–100
   grid as the art (viewBox 0 0 100 100, xMidYMid meet = object-fit:contain), so a layer sits on the same spot of the
   art at every size. One item per slot: head, face, neck, back (behind), held. The save drives it:
   state.looks = { head, face, neck, back, held } for the hero, state.pet.looks the same for the active pet.
   Anchors per art id, in % of the art (data/anchors.json from tools/art/anchors.py, + the hand-tuned ones below):
     head: [x, y, w] bottom-centre + width of a hat;  faceTop: brow line (a hat's bottom edge stays above it —
     tools/test/petlayers.js checks every pet × stage × screen);  face / neck / back / held: [x, y, w] centre + width. */
const SLOTS = ["head", "face", "neck", "back", "held"];
WR.SLOTS = SLOTS;
const ANCHORS = {
  pet_bunny:  { head: [50, 11, 28], faceTop: 22 },
  pet_fox:    { head: [46, 17, 26], faceTop: 28 },
  pet_dragon: { head: [47, 16, 26], faceTop: 26 },
  pet_owl:    { head: [53, 14, 26], faceTop: 20 }
};
WR.ANCHORS = ANCHORS;
const DEF_ANCHOR = { head: [50, 12, 26], faceTop: 22, face: [50, 30, 30], neck: [50, 46, 20], back: [50, 52, 70], held: [74, 60, 26] };
WR.anchorFor = id => Object.assign({}, DEF_ANCHOR, (WR.anchorData || {})[id] || {}, ANCHORS[id] || {});
// layers: [{ slot, src, w?: scale, cls? }]; "back" is always drawn behind the art
WR.layerSVG = (artId, layers, behind) => {
  const a = WR.anchorFor(artId), parts = layers.filter(l => (l.slot === "back") === !!behind).map(l => {
    const [x, y, w0] = a[l.slot] || DEF_ANCHOR[l.slot], w = w0 * (l.w || 1), h = w;   // square layer art
    const top = (l.slot === "head" ? y - h : y - h / 2) + (l.dy || 0) * h;                // hats sit ON the anchor; dy nudges tall items (a scarf hangs below the neck)
    return `<image class="layer ${l.slot} ${l.cls || ""}" data-slot="${l.slot}"${l.id ? ` data-id="${l.id}"` : ""}${l.filter ? ` style="filter:${l.filter}"` : ""} href="${l.src}" x="${(x - w / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"/>`;
  }).join("");
  return parts ? `<svg class="layers${behind ? " behind" : ""}" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${parts}</svg>` : "";
};
// art reference of an accessory: "acc:<name>" (assets/acc) or "icon:<slug>" (painted icon set)
WR.layerSrc = art => { const [k, v] = String(art || "").split(":"); return k === "acc" ? `assets/acc/${v}.webp` : k === "icon" ? `assets/icons/${v}.webp` : WR.iconSrc(art); };
WR.accessory = id => (WR.shop && WR.shop.outfits || []).find(x => x.id === id);
const looksLayers = looks => SLOTS.map(sl => looks && looks[sl] && WR.accessory(looks[sl])).filter(Boolean)
  .map(it => ({ slot: it.slot, src: WR.layerSrc(it.art), w: it.w, dy: it.dy, filter: it.filter, id: it.id, cls: "acc" }));
WR.heroLayers = (looks = WR.state.looks) => looksLayers(looks);
// the evolved look: <pet>_royal art when there is one
WR.petArt = p => { const stage = WR.petStage(WR.petLevel(p.xp)), royal = p.species + "_royal"; return stage >= 2 && WR.asset && WR.asset(royal) ? royal : p.species; };
WR.petLayers = p => {
  const stage = WR.petStage(WR.petLevel(p.xp)), out = looksLayers(p.looks);
  if (stage >= 2 && !(p.looks && p.looks.head)) out.push({ slot: "head", src: WR.iconSrc("👑"), cls: "petcrown", w: 0.8 });   // the evolved pet's crown, unless it wears a hat
  return out;
};
// preview: { avatar, looks } for the hero / { pet } (a pet object) — the wardrobe's instant try-on uses these
WR.avatarHTML = (size = 110, pv = {}) => {
  const s = WR.state, id = pv.avatar || s.avatar || "avatar_girl", layers = WR.heroLayers(pv.looks || s.looks);
  return `<div class="av-wrap" data-art="${id}" style="width:${size}px;height:${size}px;font-size:${size / 110}rem">${WR.layerSVG(id, layers, true)}${WR.img(id, "av")}${WR.layerSVG(id, layers)}</div>`;
};
WR.petHTML = (cls = "", pv = {}) => {
  const p = pv.pet || WR.state.pet; if (!p) return "";
  const skin = p.skin && WR.shop.petskins.find(x => x.id === p.skin);
  const stage = WR.petStage(WR.petLevel(p.xp)), art = WR.petArt(p);
  const extra = (skin && skin.sparkle ? " sparkle-skin" : "") + (skin && skin.rainbow ? " rainbow-skin" : "");
  const style = skin && skin.filter ? `filter:${skin.filter} drop-shadow(0 8px 10px rgba(122,92,143,.25))` : "";
  const scale = [0.86, 0.96, 1.04][stage], layers = WR.petLayers(p);
  return `<div class="petwrap ${extra} ${cls}" data-art="${art}" style="position:relative;width:100%;height:100%;transform:scale(${scale})">${stage >= 1 ? '<div class="aura"></div>' : ""}${WR.layerSVG(art, layers, true)}${WR.img(art, "", style)}${WR.layerSVG(art, layers)}</div>`;
};
WR.petMood = () => {
  const p = WR.state.pet; if (!p) return "";
  if (p.hunger > 75) return "I'm sooo hungry… 🥺";
  if (p.happiness < 30) return "Will you play with me? 🥹";
  if (p.happiness > 80) return "I love learning with you! 💖";
  return "Let's go on an adventure! ✨";
};
WR.tickPet = () => {
  const p = WR.state.pet; if (!p) return;
  const now = Date.now(), hrs = (now - (p.lastTick || now)) / 36e5;
  if (hrs > 0.05) {
    p.hunger = Math.min(100, p.hunger + hrs * 4);
    p.happiness = Math.max(0, p.happiness - hrs * 3);
    p.lastTick = now; WR.save();
  }
};
WR.petGainXP = n => {
  const p = WR.state.pet; if (!p) return null;
  const before = WR.petLevel(p.xp), stageB = WR.petStage(before);
  p.xp += n; const after = WR.petLevel(p.xp);
  WR.save();
  if (after > before) return { level: after, evolved: WR.petStage(after) > stageB };
  return null;
};

/* ---------- economy: EVERY star goes through WR.awardStars(source, key, n, { kind }) ----------
   Anti-farm rules (only ⭐ stars, the currency, are limited — XP, crowns, pet happiness and progress always flow):
   kind "item"  — one question/item: pays only the first time it is answered correctly, ever (state.earn.got); repeats 0.
   kind "round" — a lesson/topic/round's end bonus: replays of the same round on the same day pay 100% → 50% → 25%
                  (at least 1⭐) → 0. A round made mostly of new items (fresh content) always pays in full.
   item + round stars share a daily practice cap (EARN.cap) that resets at local midnight.
   kind "fresh" — finite one-offs (a new crown, a new best, a first story page, newly mastered facts): always full, no cap.
   kind "bonus" — quests, weekly prizes, stickers, boss first wins, streak gifts, milestones: always full, no cap.
   state.earn = { day, practice, rounds: { "<source>:<key>": plays today }, got: { hash: 1 } } cloud-syncs with the save;
   js/cloud.js merges it on every cloud load (WR.mergeEarn) so switching saves can't reset it. */
const EARN = { cap: 150, replay: [1, 0.5, 0.25, 0] };
WR.EARN = EARN;
WR.earnHash = earnHash;
WR.earn = () => {
  const s = WR.state, d = WR.today(); s.earn = Object.assign(freshEarn(), s.earn || {});
  const e = s.earn; e.got = e.got || {}; e.rounds = e.rounds || {};
  if (e.day !== d) { e.day = d; e.practice = 0; e.rounds = {}; }
  return e;
};
// keep the stricter of two earn records (same day: highest counters; got: union) — used when a cloud save replaces this one
WR.mergeEarn = (a, b) => {
  a = a || {}; b = b || {}; const out = freshEarn(); out.got = Object.assign({}, a.got || {}, b.got || {});
  const day = [a.day || "", b.day || ""].sort().pop(); out.day = day;
  for (const x of [a, b]) if (x.day === day) { out.practice = Math.max(out.practice, x.practice || 0); for (const k in x.rounds || {}) out.rounds[k] = Math.max(out.rounds[k] || 0, x.rounds[k]); }
  return out;
};
let cut = null;   // stars held back since the last WR.starNote(): { n, why: "known" | "replay" | "cap" }
const holdBack = (n, why) => { if (n <= 0) return; cut = cut || { n: 0, why }; cut.n += n; if (why === "cap" || cut.why === "known") cut.why = why === "cap" ? "cap" : why === "replay" ? cut.why : why; };
// o: { kind: "item"|"round"|"fresh"|"bonus", why: toast text, tally: round object (counts new/old items), quiet }
WR.awardStars = (source, key, n, o = {}) => {
  const kind = o.kind || "item", e = WR.earn(), want = Math.max(0, Math.round(n || 0)), t = o.tally;
  let give = want;
  if (kind === "item") {
    const h = earnHash(source + ":" + key), known = !!e.got[h]; e.got[h] = 1;
    if (t) { if (known) t._oldItems = (t._oldItems || 0) + 1; else t._newItems = (t._newItems || 0) + 1; }
    if (known) { holdBack(give, "known"); give = 0; }
  } else if (kind === "round") {
    const k = source + ":" + key, fresh = t && (t._newItems || 0) > 0 && (t._newItems || 0) >= (t._oldItems || 0);
    const plays = e.rounds[k] || 0; e.rounds[k] = plays + 1;
    if (!fresh) { const f = EARN.replay[Math.min(plays, EARN.replay.length - 1)];
      const g = f >= 1 ? give : f > 0 ? Math.min(give, Math.max(1, Math.floor(give * f))) : 0; holdBack(give - g, "replay"); give = g; }
  } else if (kind === "fresh" && key != null) {
    const h = earnHash("fresh:" + source + ":" + key); if (e.got[h]) give = 0; e.got[h] = 1;
  }
  if (kind === "item" || kind === "round") { const room = Math.max(0, EARN.cap - e.practice); if (give > room) { holdBack(give - room, "cap"); give = room; } e.practice += give; }
  if (give) WR.state.stars += give;
  WR.save(); WR.renderTop && WR.renderTop();
  if (give && o.why) WR.toast(`+${give} ⭐ ${o.why}`);
  if (give && !o.quiet) WR.sfx("coin");
  return give;
};
// stars always outside the cap (quests, prizes, stickers, milestones)
WR.addStars = (n, why) => WR.awardStars("bonus", null, n, { kind: "bonus", why });
WR.practiceLeft = () => Math.max(0, EARN.cap - WR.earn().practice);
// the gentle "why fewer stars" line for a results screen (and it clears the pending note)
WR.starNote = () => {
  const c = cut; cut = null; if (!c || c.n <= 0) return "";
  const msg = c.why === "cap" ? "You've collected all of today's practice stars — amazing! 🌙 Practice still grows your XP, crowns and pet. Quests still give stars, and more practice stars come tomorrow ⭐"
    : c.why === "replay" ? "You've played this one a lot today! Try a different lesson for more stars ⭐"
    : "You've mastered these! Try new questions for more stars ⭐";
  return `<div class="star-note" role="note">${msg}<div><button class="btn small mint" data-starnote-go>✨ Find something new</button></div></div>`;
};
WR.starNotePending = () => !!(cut && cut.n > 0);
document.addEventListener("click", ev => { const b = ev.target.closest && ev.target.closest("[data-starnote-go]"); if (b) { ev.preventDefault(); WR.go("home"); } });
// 🏷️ one central price table (data/shop.json → prices): every item names a tier, snacks have their own row.
// Prices only decide what NEW purchases cost; owned items stay owned and balances are never touched.
WR.TIER_NAMES = { starter: "Starter", common: "Common", rare: "Rare", epic: "Epic", legendary: "Legendary", earned: "Earned only", premium: "Grown-up" };
WR.applyPrices = shop => {
  const P = shop.prices || { tiers: {}, snacks: {} };
  for (const cat of ["outfits", "petskins", "themes", "heroes", "pets", "snacks"]) for (const it of shop[cat] || []) {
    if (cat === "snacks") it.price = P.snacks[it.id] != null ? P.snacks[it.id] : (it.price || 0);
    else { it.tier = it.tier || (it.premium ? "premium" : "common"); it.price = P.tiers[it.tier] != null ? P.tiers[it.tier] : 0; if (it.tier === "earned") it.earnedOnly = true; }
  }
  return shop;
};
WR.priceOf = id => { for (const cat of Object.keys(WR.shop || {})) if (Array.isArray(WR.shop[cat])) { const it = WR.shop[cat].find(x => x.id === id); if (it) return it.price; } return null; };
WR.spend = n => { if (WR.state.stars < n) return false; WR.state.stars -= n; WR.save(); WR.renderTop && WR.renderTop(); return true; };
WR.grantItem = id => { if (!WR.state.owned.includes(id)) WR.state.owned.push(id); WR.save(); };

/* ---------- daily quests & streak ---------- */
WR.ensureDaily = () => {
  const d = WR.today(), s = WR.state;
  if (s.daily && s.daily.day === d) return;
  let h = 0; for (const c of d) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const pool = QUEST_POOL.slice(), pick = [];
  while (pick.length < 3) { h = (h * 1103515245 + 12345) >>> 0; const i = h % pool.length; pick.push(pool.splice(i, 1)[0]); }
  s.daily = { day: d, quests: pick.map(q => ({ id: q.id, progress: 0, claimed: false })) };
  WR.save();
};
WR.questDef = id => QUEST_POOL.find(q => q.id === id);
WR.questEvent = (id, n = 1) => {
  WR.ensureDaily();
  const q = WR.state.daily.quests.find(x => x.id === id); if (!q || q.claimed) return;
  const def = WR.questDef(id), was = q.progress >= def.goal;
  q.progress = Math.min(def.goal, q.progress + n); WR.save();
  if (!was && q.progress >= def.goal) WR.toast(`🎯 Daily quest ready to claim: ${def.label}`, 2400);
};
WR.claimQuest = id => {
  const q = WR.state.daily.quests.find(x => x.id === id), def = WR.questDef(id);
  if (!q || q.claimed || q.progress < def.goal) return;
  q.claimed = true; WR.addStars(def.reward, "Daily quest!"); WR.confetti(14);
};
WR.bumpStreak = () => {
  const s = WR.state, d = WR.today();
  if (s.streak.last === d) return false;
  s.streak.count = (s.streak.last && WR.dayDiff(s.streak.last, d) === 1) ? s.streak.count + 1 : 1;
  s.streak.last = d; WR.save(); return true;
};
WR.streakAlive = () => { const s = WR.state.streak; return s.last && WR.dayDiff(s.last, WR.today()) <= 1 ? s.count : 0; };

/* ---------- progress & unlocks ---------- */
WR.realmProgress = rid => {
  const p = WR.state.progress[rid] || {};
  const passed = SKILLS.filter(k => p[k.id] && p[k.id].best >= 0.6).length;
  return { passed, p };
};
WR.isUnlocked = idx => {
  if (WR.state.settings.unlockAll) return true;
  const startIdx = WR.realms.findIndex(r => r.id === WR.state.startLevel);
  if (idx <= Math.max(0, startIdx)) return true;
  return WR.realmProgress(WR.realms[idx - 1].id).passed >= 3;
};
WR.recordLesson = (rid, key, score) => {
  const s = WR.state; s.progress[rid] = s.progress[rid] || {};
  const prev = s.progress[rid][key] || { best: 0, plays: 0 };
  prev.best = Math.max(prev.best, score); prev.plays++; prev.last = Date.now();
  s.progress[rid][key] = prev; s.lessonsDone++; WR.save();
};
// every English skill a lesson, Mistake Garden plant or report row can name (core four + bonus skills, loaded later)
WR.allSkills = () => SKILLS.concat(WR.SPEAKING || [], WR.WRITING || [], WR.STORY || [], WR.PHONICS || [], WR.CHARMS || [], WR.gapGames.map(g => g.info));
WR.gapGames = [];   // filled by WR.GapRound (js/gap-round.js): { id, info, hub, round, open, stop, tile }, in load order
WR.skillInfo = id => WR.allSkills().find(x => x.id === id) || { id, name: id, icon: "✨" };
WR.levelOf = rid => { const r = WR.realms && WR.realms.find(y => y.id === rid); return r ? r.level : ""; };
WR.crowns = score => score >= 0.9 ? 3 : score >= 0.7 ? 2 : score >= 0.5 ? 1 : 0;
// 🏁 the end of a crowned unit (a Storybook chapter, a Phonics Path step, a Spell Swap book, a Word Forge anvil): keeps the best in done[id] = { best, crowns, plays, at },
// counts the lesson and pays the first finish (1⭐ per right answer + 3⭐) and each NEW crown (2⭐), once ever (kind "fresh").
WR.finishUnit = (done, id, right, n, source) => {
  const prev = done[id], score = right / n, crowns = WR.crowns(score), top = Math.max(crowns, prev ? prev.crowns : 0);
  let stars = (prev ? 0 : right + 3) + Math.max(0, crowns - (prev ? prev.crowns : 0)) * 2;
  done[id] = { best: Math.max(score, prev ? prev.best : 0), crowns: top, plays: (prev ? prev.plays : 0) + 1, at: Date.now() };
  WR.state.lessonsDone++; WR.save();
  if (stars) stars = WR.awardStars(source, id + "/" + top + (prev ? "" : "/first"), stars, { kind: "fresh" });
  return { prev, crowns, stars };
};
// shared crown markup: n bright crowns + the rest faded; crownCell shows a muted note instead when nothing was played yet
WR.crownRow = n => "👑".repeat(n) + `<span style="opacity:.2">${"👑".repeat(3 - n)}</span>`;
WR.crownCell = (n, empty = "not played") => n == null ? `<span class="muted" style="font-size:.8rem">${empty}</span>` : WR.crownRow(n);
})();
