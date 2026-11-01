/* 📲 R17: lighter first visit. The service worker (sw.js, built by tools/build_sw.py) precaches only the app shell and the
   lesson data; art and icons are cached the first time they are shown. This file:
     • after the first screen, asks the worker to keep the art that screen already showed (it loaded before the worker
       was in charge) plus the current realm's picture, unless the phone is on Save-Data / cellular;
     • WR.offline.download(onProgress) fetches every picture for full offline play (⚙️ Settings → 📲 Download for offline play);
     • WR.offline.status() → Promise<{ have, total, ready }>. */
(function () {
const WR = window.WR, sw = navigator.serviceWorker;
const lite = () => { const c = navigator.connection; return !!(c && (c.saveData || c.type === "cellular" || /(^|-)2g$/.test(c.effectiveType || ""))); };
const rel = u => { const b = new URL(".", document.baseURI).href; return u.startsWith(b) ? u.slice(b.length).split("?")[0] : ""; };
const ask = (msg, until) => !sw ? Promise.resolve(null) : sw.ready.then(r => new Promise(res => {
  if (!r.active) return res(null);
  const on = e => { const d = e.data || {}; if (d.type !== "offline") return; if (msg.onProgress) msg.onProgress(d); if (until(d)) { sw.removeEventListener("message", on); res(d); } };
  sw.addEventListener("message", on); const { onProgress, ...m } = msg; r.active.postMessage(m);
}));
WR.offline = {
  lite,
  warm() {
    if (!sw) return;
    const shown = performance.getEntriesByType("resource").map(e => rel(e.name)).filter(u => /^assets\/(web|icons|acc)\//.test(u));
    const c = WR.continueTarget && WR.continueTarget(), rid = (c && c.realm && c.realm.id) || (WR.state && WR.state.startLevel) || "a1";
    const extra = lite() ? [] : [`assets/web/bg_${rid}_720.webp`, `assets/web/story_${rid}.webp`];
    sw.ready.then(r => r.active && r.active.postMessage({ type: "warm", urls: [...new Set(shown.concat(extra))] }));
  },
  download: onProgress => ask({ type: "download", onProgress }, d => d.ready),
  status: () => ask({ type: "status" }, () => true)
};
if (sw) addEventListener("load", () => setTimeout(() => WR.offline.warm(), 2500));
})();
