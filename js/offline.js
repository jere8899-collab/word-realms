/* 📲 Lighter first visit. Lesson banks are not downloaded with the map; they are saved in wrdata when opened
   (and kept across updates). index.html loads each shell file once, after sw.js is in charge, so the worker
   stores that single response (a script response cannot be copied into the cache later). This file:
     • keeps the home JSON, index.html, and the art already on screen, without fetching js/ or css/ again;
     • WR.offline.download(onProgress) fetches every picture and every bank (⚙️ Settings → Download);
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
// Fill the caches from here. A worker's cache.add() cannot see the page's HTTP cache either.
let named = null;
const names = () => named || (named = fetch("sw.js", { cache: "no-cache" }).then(r => r.text()).then(text => ({
  version: (text.match(/const VERSION = "(wr-[0-9a-f]{12})"/) || [])[1],
  art: (text.match(/const ART = "(wrart-[0-9a-f]+)"/) || [])[1]
})).catch(() => ({})));
const putCache = async (name, list) => {
  if (!name || !window.caches) return;
  const c = await caches.open(name);
  for (const u of [...new Set(list)].filter(Boolean)) {
    if (await c.match(u, { ignoreVary: true })) continue;
    const any = await caches.match(u, { ignoreVary: true });
    if (any) { await c.put(u, any.clone()); continue; }   // already stored by the worker or by fetchJSON
    // js/ and css/ were loaded through the worker. Fetching them here downloads a second full copy.
    if (/^(js|css)\//.test(u)) continue;
    try {
      const res = await fetch(u, { cache: "force-cache" });
      if (res && res.ok) await c.put(u, res.clone());
    } catch (e) { }
  }
};
WR.offline = {
  lite,
  async warm() {
    if (!sw) return;
    const { version, art } = await names();
    const urls = performance.getEntriesByType("resource").map(e => rel(e.name)).concat(performance.getEntriesByType("navigation").map(e => rel(e.name)));
    const shell = urls.filter(u => /^(js|css)\//.test(u) || u === "index.html" || u === "manifest.webmanifest" || u === "assets/manifest.json" || u === "assets/ui/icon-192.png");
    const data = urls.filter(u => /^data\/.+\.json$/.test(u) || /^assets\/voice\/manifest[^/]*\.json$/.test(u));
    const shown = urls.filter(u => /^assets\/(web|icons|acc|ui)\//.test(u));
    await Promise.all([
      putCache(version, shell.concat(["index.html"])),
      putCache("wrdata", data),
      putCache(art, shown)
    ]);
  },
  download: onProgress => ask({ type: "download", onProgress }, d => d.ready),
  status: () => ask({ type: "status" }, () => true)
};
// Register after the first fill, so the worker does not start a third read of the same files.
// The later warm picks up pictures that finished after the first copy.
if (sw && !window.__WR_NO_SW) {
  const fill = () => WR.offline.warm().then(() => sw.register("sw.js").catch(() => {})).then(() => setTimeout(() => WR.offline.warm(), 2000));
  if (document.readyState === "complete") fill(); else addEventListener("load", fill);
}
})();
