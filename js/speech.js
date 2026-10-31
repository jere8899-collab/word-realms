/* Device voice (Web Speech API): the fallback behind WR.say (js/voice.js) — only voice.js calls Speech.speak.
   Prefers a clear, natural female voice: Samantha, Google UK English Female, Microsoft Aria/Jenny/Libby/Sonia, then en-GB/en-US. */
window.Speech = (function () {
  const synth = window.speechSynthesis;
  let voice = null;
  function pickVoice() {
    if (!synth) return null;
    const vs = synth.getVoices() || [];
    const pref = [/samantha/i, /google uk english female/i, /microsoft (aria|jenny)/i, /microsoft (libby|sonia)/i, /google us english/i];
    for (const re of pref) { const v = vs.find(v => /^en/i.test(v.lang) && re.test(v.name)); if (v) return (voice = v); }
    voice = vs.find(v => /en[-_]GB/i.test(v.lang) && /female|libby|sonia|serena|kate|martha/i.test(v.name))
         || vs.find(v => /en[-_]US/i.test(v.lang) && /female|aria|jenny|zira|ava|allison|susan/i.test(v.name))
         || vs.find(v => /en[-_]GB/i.test(v.lang))
         || vs.find(v => /^en/i.test(v.lang)) || null;
    return voice;
  }
  if (synth) { pickVoice(); synth.onvoiceschanged = pickVoice; }
  return {
    supported: !!synth,
    voiceName() { return voice ? voice.name + " (" + voice.lang + ")" : (synth ? "default voice" : "not supported"); },
    speak(text, rate, onend, o = {}) {
      if (!synth) { onend && onend(); return false; }
      synth.cancel();
      // 🗣️ C2 dialogues: "Name: line|Name: line" is read line by line in two voices (names are not read out)
      if (String(text).includes("|")) {
        const lines = String(text).split("|").map(l => l.replace(/^[^:]{1,20}:\s*/, "")), names = String(text).split("|").map(l => (l.match(/^([^:]{1,20}):/) || [])[1] || "");
        const order = [...new Set(names)]; if (!voice) pickVoice();
        const vs = synth.getVoices() || [], alt = vs.find(v => /^en/i.test(v.lang) && voice && v.name !== voice.name && /male|daniel|george|arthur|ryan|david|google uk english male/i.test(v.name) && !/female/i.test(v.name)) || vs.find(v => /^en/i.test(v.lang) && voice && v.name !== voice.name);
        let i = 0, stopped = false;
        const next = () => {
          if (stopped) return; if (i >= lines.length) { onend && onend(); return; }
          const who = order.indexOf(names[i]) % 2, u = new SpeechSynthesisUtterance(lines[i++]);
          const v = who && alt ? alt : voice; if (v) u.voice = v; u.lang = v ? v.lang : "en-GB";
          u.rate = rate || 0.9; u.pitch = who ? (alt ? 1 : 0.75) : 1.05;
          u.onend = () => setTimeout(next, 250); u.onerror = () => { stopped = true; onend && onend(); };
          synth.speak(u);
        };
        next(); return true;
      }
      const u = new SpeechSynthesisUtterance(text);
      if (!voice) pickVoice();
      if (voice) u.voice = voice;
      u.lang = voice ? voice.lang : "en-GB";
      u.rate = rate || 0.9; u.pitch = Math.max(0.5, Math.min(2, o.pitch || 1.05));
      u.onend = () => onend && onend();
      u.onerror = () => onend && onend();
      synth.speak(u);
      return true;
    },
    stop() { synth && synth.cancel(); }
  };
})();
