/* 🎙️ WR.say(text, { character, rate, onend, slow }) — the ONE way the game speaks.
   1. Recorded voice (default): plays the Kokoro MP3 that tools/build_voice.py made for this exact line
      (assets/voice/manifest.json maps normalised text → file, per voice profile). Slow replay = playbackRate.
   2. Otherwise (no recording — e.g. a sentence with the player's name — or "Device voice" in Settings): the Web Speech
      voice (js/speech.js), gently tuned per character from data/voices.json (pets a little higher and slower).
   Listening, dictation and stories always use the narrator profile (af_heart, unmodified), so learners hear clear,
   natural English; the cute pet voice is only for pet chatter, and pets only chatter when "Cute pet voices" is on.
   MP3s are NOT precached by the service worker: each one is cached the first time it plays (sw.js runtime cache). */
(function () {
const WR = window.WR;
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{2B50}\u{2B06}\u{2190}-\u{21FF}\u{2300}-\u{23FF}]/gu;
const norm = t => String(t == null ? "" : t).replace(EMOJI, "").replace(/\s+/g, " ").trim();
let cfg = null, man = null, loading = null, audio = null, token = 0;
const V = WR.Voice = { norm };
V.load = () => loading || (loading = Promise.all([
  fetch("data/voices.json").then(r => r.json()).catch(() => ({ profiles: {}, characters: {} })),
  fetch("assets/voice/manifest.json").then(r => r.ok ? r.json() : { profiles: {} }).catch(() => ({ profiles: {} }))
]).then(([c, m]) => { cfg = c; man = m; return V; }));
V.profileOf = character => (cfg && cfg.characters && cfg.characters[character || "narrator"]) || (String(character || "").startsWith("pet") ? "pet" : "narrator");
V.fileFor = (text, character) => { const p = V.profileOf(character), t = norm(text); const f = man && man.profiles && man.profiles[p] && man.profiles[p][t]; return f ? "assets/voice/" + f : null; };
const settings = () => (WR.state && WR.state.settings) || {};
V.recorded = () => settings().voice !== "device";
V.stop = () => { token++; if (audio) { try { audio.pause(); } catch (e) { } audio.onended = audio.onerror = null; audio = null; } window.Speech && Speech.stop(); };
V.playing = () => !!(audio && !audio.paused);
// rate: the lesson speed (settings.rate, 0.9 = normal) or a slow replay (< 0.8) → MP3 playbackRate
const playRate = (rate, slow) => (slow || (rate && rate <= 0.65)) ? (cfg && cfg.slowRate) || 0.8   // 🐢 slow replay buttons pass 0.6
  : Math.max(0.7, Math.min(1.25, (rate || settings().rate || 0.9) / 0.9));
function webSpeak(text, o, prof) {
  const w = (cfg && cfg.profiles && cfg.profiles[prof] && cfg.profiles[prof].web) || {};
  const bump = (cfg && cfg.webPitchBySpecies && cfg.webPitchBySpecies[o.character]) || 0;
  const rate = (o.slow ? 0.6 : (o.rate || settings().rate || 0.9)) * (w.rate || 1);
  return window.Speech ? Speech.speak(text, rate, o.onend, { pitch: (w.pitch || 1.05) + bump, male: !!w.male, prefer: cfg && cfg.webPrefer }) : (o.onend && o.onend(), false);
}
WR.say = (text, o = {}) => {
  if (typeof o === "number") o = { rate: o };
  const my = ++token; V.stop(); token = my;
  const go = () => {
    if (my !== token) return false;
    const prof = V.profileOf(o.character), src = V.recorded() && V.fileFor(text, o.character);
    if (!src) return webSpeak(text, o, prof);
    const a = audio = new Audio(src); a.preservesPitch = true; a.playbackRate = playRate(o.rate, o.slow);
    let done = false; const end = () => { if (done) return; done = true; if (audio === a) audio = null; o.onend && o.onend(); };
    a.onended = end;
    a.onerror = () => { if (done) return; done = true; if (audio === a) audio = null; if (my === token) webSpeak(text, o, prof); };   // offline & not cached yet: device voice
    const p = a.play(); if (p && p.catch) p.catch(() => { if (!done && my === token) { done = true; audio = null; webSpeak(text, o, prof); } });
    V.last = { text: norm(text), src, profile: prof, rate: a.playbackRate };
    return true;
  };
  if (cfg) return go();
  V.load().then(go); return true;
};
// 🐾 pet chatter — only when cute pet voices are on (Settings), never during a lesson question
WR.petSay = text => { if (settings().petVoice === false) return; WR.say(text, { character: "pet_" + ((WR.state.pet && WR.state.pet.species) || "") }); };
V.load();
})();
