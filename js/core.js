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
  { id: "pet_owl", species: "owl", name: "Hoot", emoji: "🦉", likes: "reading together", stages: ["Owlet Hoot", "Scholar Hoot", "Sage Hoot"] }
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
  { id: "model1", icon: "🧮", label: "Solve 3 maths questions with a Model Magic picture", goal: 3, reward: 5 }
];
Object.assign(WR, { SKILLS, PETS, AVATARS, QUEST_POOL, data: {}, manifest: null, screens: {} });

/* ---------- helpers ---------- */
WR.$ = (s, r = document) => r.querySelector(s);
WR.esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
WR.shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
WR.sample = (a, n) => WR.shuffle(a).slice(0, n);
WR.today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
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
    stories: { done: {}, words: {}, reads: 0 }
  };
}
// ✒️ Story Quill: best result per prompt ({ total, crowns, scales, at }) and saved drafts per prompt ({ plan, text, at })
const freshWriting = () => ({ checks: 0, crowns: 0, best: {}, drafts: {} });
// 🔢 Number Kingdom: chosen grade, best score per topic ("g3.times", "g7.mixed", "dojo.clongdiv"), Times-Table Tower facts
// ({ "7x8": { b: Leitner box 0–5, r: right, w: wrong, d: next review time, t: last answer ms, l: last seen } }) and dojo stats
// 🛡️ bosses: Grade Guardian results per band ({ g12: { won, best, tries, at } })
const freshMath = () => ({ grade: null, placed: null, xp: 0, correct: 0, answered: 0, lessons: 0, models: 0, modelSolved: 0, topics: {}, facts: {}, bosses: {}, dojo: { tables: [2, 3, 4, 5], op: "x", best: 0, sprints: 0, practice: 0, history: [] } });
WR.freshMath = freshMath;
// one place that completes a (possibly old or partial) maths block in place; used on load and by WR.Math.st()
// (in place, so objects other code holds, like math.dojo, stay the same objects)
WR.fixMath = m => { const f = freshMath(); m = m || f;
  for (const k in f) if (m[k] === undefined || (m[k] === null && f[k] && typeof f[k] === "object")) m[k] = f[k];
  for (const k in f.dojo) if (m.dojo[k] === undefined) m.dojo[k] = f.dojo[k]; return m; };
const freshSpeaking = () => ({ rounds: 0, attempts: 0, passed: 0, perfect: 0, preferShadow: false, shadowWhy: null });
// older saves (before the Echo Well / Story Quill) simply gain the speaking and writing stats; nothing else changes
function migrate(s) {
  s.speaking = Object.assign(freshSpeaking(), s.speaking || {});
  s.writing = Object.assign(freshWriting(), s.writing || {});
  s.writing.best = s.writing.best || {}; s.writing.drafts = s.writing.drafts || {};
  s.settings = Object.assign({ rate: 0.9, sound: true, unlockAll: false }, s.settings || {});
  s.progress = s.progress || {}; s.mistakes = s.mistakes || [];
  s.stories = Object.assign({ done: {}, words: {}, reads: 0 }, s.stories || {}); s.stories.done = s.stories.done || {}; s.stories.words = s.stories.words || {};
  s.math = WR.fixMath(s.math);
  return s;
}
WR.load = () => { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && s.v === 1) return migrate(Object.assign(freshState(), s)); } catch (e) { } return freshState(); };
WR.save = () => localStorage.setItem(SAVE_KEY, JSON.stringify(WR.state));
WR.reset = () => { localStorage.removeItem(SAVE_KEY); WR.state = freshState(); };
WR.state = WR.load();

WR.init = async () => {
  WR.manifest = await fetchJSON("assets/manifest.json").catch(() => ({ assets: [] }));
  WR.realms = await fetchJSON("data/realms.json");
  WR.shop = await fetchJSON("data/shop.json");
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

/* ---------- UI helpers ---------- */
// 🍞 Toasts (review T4): at most 2 on screen, auto-hide within 2.5 s, never take taps (pointer-events:none in css/phone.css),
// sit at the bottom on phones, and are cleared by WR.go() (see WR.clearFx) so none follows the child to the next screen.
WR.toast = (msg, ms = 1800) => {
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
WR.avatarHTML = (size = 110) => {
  const s = WR.state, o = s.equipped.outfit && WR.shop.outfits.find(x => x.id === s.equipped.outfit);
  return `<div class="av-wrap" style="width:${size}px;height:${size}px;font-size:${size / 110}rem">${WR.img(s.avatar || "avatar_girl", "av")}${o ? `<span class="outfit ${o.id}">${o.icon}</span>` : ""}</div>`;
};
WR.petInfo = () => PETS.find(p => p.id === (WR.state.pet && WR.state.pet.species));
WR.petLevel = xp => 1 + Math.floor(xp / 80);
WR.petStage = lvl => lvl >= 10 ? 2 : lvl >= 5 ? 1 : 0;
WR.petHTML = (cls = "") => {
  const p = WR.state.pet; if (!p) return "";
  const skin = p.skin && WR.shop.petskins.find(x => x.id === p.skin);
  const stage = WR.petStage(WR.petLevel(p.xp));
  const extra = (skin && skin.sparkle ? " sparkle-skin" : "") + (skin && skin.rainbow ? " rainbow-skin" : "");
  const style = skin && skin.filter ? `filter:${skin.filter} drop-shadow(0 8px 10px rgba(122,92,143,.25))` : "";
  const scale = [0.86, 0.96, 1.04][stage];
  return `<div class="petwrap ${extra} ${cls}" style="position:relative;width:100%;height:100%;transform:scale(${scale})">${stage >= 1 ? '<div class="aura"></div>' : ""}${stage >= 2 ? '<span class="petcrown">👑</span>' : ""}${WR.img(p.species, "", style)}</div>`;
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

/* ---------- economy ---------- */
WR.addStars = (n, why) => {
  WR.state.stars += n; WR.save(); WR.renderTop && WR.renderTop();
  if (why) WR.toast(`+${n} ⭐ ${why}`);
  WR.sfx("coin");
};
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
WR.crowns = score => score >= 0.9 ? 3 : score >= 0.7 ? 2 : score >= 0.5 ? 1 : 0;
})();
