/* 🎨 Painted icons: every emoji the game shows is drawn as cute pastel art (assets/icons/<slug>.webp).
   One central helper for the whole game:
     WR.icon("⭐") / WR.icon("star")  -> '<img class="wr-icon" …>' sized to the text around it (css/style.css .wr-icon)
     WR.iconSrc("⭐")                 -> "assets/icons/star.webp" (or "" when there is no art)
     WR.iconify(node)                 -> swaps registered emoji in a rendered DOM subtree for icons (also SVG <text>)
   Code and data keep the emoji as the icon's *name*; a MutationObserver iconifies whatever any screen renders, so every
   innerHTML / textContent / toast / modal gets the art without each module knowing about it. Typed text (inputs,
   textareas, contenteditable), KaTeX maths and anything inside [data-noicon] are left alone. If an icon file fails to
   load (offline before it was cached), the original emoji comes back in its place. */
(function () {
const WR = window.WR;
const VS = /\uFE0F/g;
const BY_EMOJI = new Map(), BY_SLUG = new Map();
String(window.WR_ICON_LIST || "").split("|").forEach(p => { const i = p.indexOf(" "); if (i > 0) { const e = p.slice(0, i), s = p.slice(i + 1); BY_EMOJI.set(e, s); BY_SLUG.set(s, e); } });
// longest first, so ZWJ sequences (🧑‍🍳, 🧚‍♀) win over their first part; each may carry a U+FE0F
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const keys = [...BY_EMOJI.keys()].sort((a, b) => b.length - a.length);
const RE = keys.length ? new RegExp("(?:" + keys.map(k => [...k].map(c => esc(c) + "\\uFE0F?").join("")).join("|") + ")", "gu") : null;
const label = s => s.replace(/-/g, " ");

WR.ICONS = BY_EMOJI;
WR.iconSlug = key => { key = String(key || "").replace(VS, ""); return BY_EMOJI.get(key) || (BY_SLUG.has(key) ? key : ""); };
WR.iconSrc = key => { const s = WR.iconSlug(key); return s ? `assets/icons/${s}.webp` : ""; };
WR.iconEmoji = key => { const s = WR.iconSlug(key); return s ? BY_SLUG.get(s) : String(key || ""); };
// cls: extra classes (e.g. "big"); alt: accessible name (defaults to what the art shows, e.g. "star")
WR.icon = (key, cls = "", alt) => {
  const s = WR.iconSlug(key); if (!s) return WR.esc(key || "");
  const e = BY_EMOJI.has(String(key).replace(VS, "")) ? key : BY_SLUG.get(s);   // the emoji as written, for the fallback
  return `<img class="wr-icon${cls ? " " + cls : ""}" src="assets/icons/${s}.webp" alt="${WR.esc(alt == null ? label(s) : alt)}" data-e="${e}" draggable="false" decoding="async">`;
};
// user-typed text (hero and pet names) keeps exactly what the child typed, emoji included
WR.userText = s => `<span data-noicon>${WR.esc(s == null ? "" : s)}</span>`;
// the text of an element with its icons read back as their emoji (tests, debugging, copy-out)
WR.iconText = el => { if (!el) return ""; const c = el.cloneNode(true); c.querySelectorAll("img.wr-icon[data-e]").forEach(i => i.replaceWith(i.dataset.e)); return c.textContent; };
WR.hasEmoji = text => !!RE && (RE.lastIndex = 0, RE.test(String(text)));

function imgEl(e) {   // data-e keeps the emoji exactly as written (with any U+FE0F) for the fallback and WR.iconText
  const s = WR.iconSlug(e), im = document.createElement("img");
  im.className = "wr-icon"; im.src = `assets/icons/${s}.webp`; im.alt = label(s); im.dataset.e = e; im.draggable = false; im.decoding = "async";
  return im;
}
const SKIP = /^(SCRIPT|STYLE|TEXTAREA|INPUT|SELECT|OPTION|TITLE|NOSCRIPT|CODE|PRE)$/;
function skipped(el) {
  for (let n = el; n && n.nodeType === 1; n = n.parentNode) {
    if (SKIP.test(n.nodeName) || n.isContentEditable || (n.classList && (n.classList.contains("katex") || n.classList.contains("katex-mathml"))) || (n.hasAttribute && n.hasAttribute("data-noicon"))) return true;
  }
  return false;
}
const SVGNS = "http://www.w3.org/2000/svg";
// an SVG <text> that is only emoji becomes <image>s of the same size, centred where the glyphs were
function svgText(t) {
  const raw = t.textContent.trim(); if (!raw) return;
  RE.lastIndex = 0; if (raw.replace(RE, "").replace(/\s|\u200D/g, "")) { svgMixed(t); return; }
  RE.lastIndex = 0; const list = raw.match(RE) || [];
  const fs = parseFloat(t.getAttribute("font-size")) || 14, sz = fs * 1.25, x = parseFloat(t.getAttribute("x")) || 0, y = parseFloat(t.getAttribute("y")) || 0;
  const anchor = t.getAttribute("text-anchor") || "start", w = sz * list.length;
  let x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  const g = document.createElementNS(SVGNS, "g"); g.setAttribute("class", "wr-icon-svg");
  list.forEach(e => {
    const im = document.createElementNS(SVGNS, "image"); im.setAttribute("href", WR.iconSrc(e));
    im.setAttribute("x", x0.toFixed(1)); im.setAttribute("y", (y - sz * 0.82).toFixed(1)); im.setAttribute("width", sz.toFixed(1)); im.setAttribute("height", sz.toFixed(1));
    const ttl = document.createElementNS(SVGNS, "title"); ttl.textContent = label(WR.iconSlug(e)); im.appendChild(ttl);
    g.appendChild(im); x0 += sz;
  });
  t.replaceWith(g);
}
// "🍎 Apples" in SVG: a leading icon, then the words shifted right
function svgMixed(t) {
  RE.lastIndex = 0; const m = RE.exec(t.textContent.replace(/^\s+/, "")); if (!m || m.index !== 0 || (t.getAttribute("text-anchor") || "start") !== "start") return;
  const fs = parseFloat(t.getAttribute("font-size")) || 12, sz = fs * 1.2, x = parseFloat(t.getAttribute("x")) || 0, y = parseFloat(t.getAttribute("y")) || 0;
  const im = document.createElementNS(SVGNS, "image"); im.setAttribute("href", WR.iconSrc(m[0]));
  im.setAttribute("x", x.toFixed(1)); im.setAttribute("y", (y - sz * 0.82).toFixed(1)); im.setAttribute("width", sz.toFixed(1)); im.setAttribute("height", sz.toFixed(1));
  t.textContent = t.textContent.replace(/^\s+/, "").slice(m[0].length).replace(/^\s+/, ""); t.setAttribute("x", (x + sz + 2).toFixed(1));
  t.parentNode.insertBefore(im, t);
}
function textNode(n) {
  const v = n.nodeValue; RE.lastIndex = 0; if (!RE.test(v)) return;
  const p = n.parentNode; if (!p || skipped(p)) return;
  if (p.namespaceURI === SVGNS) { if (p.nodeName.toLowerCase() === "text") svgText(p); return; }
  const frag = document.createDocumentFragment(); let last = 0; RE.lastIndex = 0; let m;
  while ((m = RE.exec(v))) { if (m.index > last) frag.appendChild(document.createTextNode(v.slice(last, m.index))); frag.appendChild(imgEl(m[0])); last = m.index + m[0].length; }
  if (last < v.length) frag.appendChild(document.createTextNode(v.slice(last).replace(/^\uFE0F/, "")));
  p.replaceChild(frag, n);
}
WR.iconify = root => {
  if (!RE || !root) return root;
  if (root.nodeType === 3) { textNode(root); return root; }
  if (root.nodeType !== 1 && root.nodeType !== 11) return root;
  if (root.nodeType === 1 && skipped(root)) return root;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), todo = [];
  for (let n = w.nextNode(); n; n = w.nextNode()) { RE.lastIndex = 0; if (RE.test(n.nodeValue)) todo.push(n); }
  todo.forEach(textNode);
  return root;
};
// a failed icon (offline and never cached) shows its emoji again, so nothing is ever blank
document.addEventListener("error", e => {
  const im = e.target; if (!im || im.nodeName !== "IMG" || !im.classList.contains("wr-icon") || !im.dataset.e) return;
  const sp = document.createElement("span"); sp.setAttribute("data-noicon", ""); sp.textContent = im.dataset.e; im.replaceWith(sp);   // not re-iconified
}, true);

let queued = new Set(), scheduled = false;
const flush = () => { scheduled = false; const q = queued; queued = new Set(); q.forEach(n => n.isConnected && WR.iconify(n)); };
const mo = new MutationObserver(list => {
  for (const r of list) {
    if (r.type === "characterData") queued.add(r.target);
    else r.addedNodes.forEach(n => (n.nodeType === 1 || n.nodeType === 3) && queued.add(n));
  }
  // flush right away (microtask) so a frame is never painted with emoji first
  if (!scheduled && queued.size) { scheduled = true; queueMicrotask(flush); }
});
const start = () => { WR.iconify(document.body); mo.observe(document.body, { childList: true, subtree: true, characterData: true }); };
if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
