/* Listening engine: Web Speech API speechSynthesis, preferring an en-GB voice. */
window.Speech = (function () {
  const synth = window.speechSynthesis;
  let voice = null;
  function pickVoice() {
    if (!synth) return null;
    const vs = synth.getVoices() || [];
    voice = vs.find(v => /en[-_]GB/i.test(v.lang) && /female|libby|sonia|serena|kate|martha|google uk english female/i.test(v.name))
         || vs.find(v => /en[-_]GB/i.test(v.lang))
         || vs.find(v => /^en/i.test(v.lang)) || null;
    return voice;
  }
  if (synth) { pickVoice(); synth.onvoiceschanged = pickVoice; }
  return {
    supported: !!synth,
    voiceName() { return voice ? voice.name + " (" + voice.lang + ")" : (synth ? "default voice" : "not supported"); },
    speak(text, rate, onend) {
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
      u.rate = rate || 0.9; u.pitch = 1.05;
      u.onend = () => onend && onend();
      u.onerror = () => onend && onend();
      synth.speak(u);
      return true;
    },
    stop() { synth && synth.cancel(); }
  };
})();
