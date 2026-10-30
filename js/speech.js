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
