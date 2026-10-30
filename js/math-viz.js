/* 🧮 Model Magic: Singapore-style visual models for Number Kingdom questions (Grades 1–6).
   MathViz.spec(q) turns a question into a model spec (from q.viz, or from the topic's raw numbers in q.data);
   MathViz.svg(spec, opt) draws it as a pastel SVG. Models never print the answer unless opt.reveal is set:
   the unknown is always shown as "?". Pure JS with no DOM, so tests can run it in Node.
   Spec types: numberline · tenframe · bar (part-whole / comparison bar models) · array · groups (sharing, with
   "deal one each") · blocks (base-ten) · fracbars · grid (area / perimeter). */
(function (root) {
const V = {};
const INK = "#6d4f86", LINE = "#9b84b0", PINK = "#FFB8D1", MINT = "#BDEFD3", LILAC = "#E2D6FF", SKY = "#CDE8FF", SUN = "#FFE79A", CREAM = "#FFF8EE";
const FILLS = [PINK, MINT, LILAC, SKY, SUN];
const e = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const f1 = x => (+x).toFixed(1).replace(/\.0$/, "");
const txt = (x, y, s, o = {}) => `<text x="${f1(x)}" y="${f1(y)}" font-size="${o.size || 12}" text-anchor="${o.anchor || "middle"}" font-weight="${o.w || 800}" fill="${o.fill || INK}"${o.cls ? ` class="${o.cls}"` : ""}>${e(s)}</text>`;
const wrap = (w, h, body, label, type) => `<svg class="mviz-svg mv-${type}" viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${Math.round(w * 1.25)}px" role="img" aria-label="${e(label)}">${body}</svg>`;
const Q = (v, reveal, shown) => reveal ? String(v) : (shown == null ? "?" : String(shown));
const QL = (x, reveal) => reveal ? String(x.rt != null ? x.rt : x.t) : /\?/.test(String(x.t)) ? String(x.t) : "?";

/* ---------- number line with hops ---------- */
V.numberline = (s, o = {}) => {
  const lo = s.lo, hi = s.hi, W = 360, x0 = 22, x1 = W - 22, X = v => x0 + (v - lo) / (hi - lo) * (x1 - x0), y = 78;
  const span = hi - lo, step = span <= 20 ? 1 : span <= 100 ? 10 : span <= 1000 ? 100 : 1000;
  let b = `<line x1="${x0 - 8}" y1="${y}" x2="${x1 + 8}" y2="${y}" stroke="${LINE}" stroke-width="3" stroke-linecap="round"/>`;
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) { b += `<line x1="${f1(X(v))}" y1="${y - 6}" x2="${f1(X(v))}" y2="${y + 6}" stroke="${LINE}" stroke-width="2"/>`; if (span <= 20 || v === lo || v === hi) b += txt(X(v), y + 20, v, { size: span <= 20 ? 10 : 11, w: 700, fill: "#9a86ad" }); }
  const pts = [s.start]; let cur = s.start; (s.hops || []).forEach(h => { cur += h; pts.push(cur); });
  (s.hops || []).forEach((h, i) => {
    const a = X(pts[i]), c = X(pts[i + 1]), m = (a + c) / 2, ht = Math.min(46, 16 + Math.abs(c - a) * 0.35), col = h > 0 ? "#ff8fa3" : "#7cc6a4";
    b += `<path class="hop" style="animation-delay:${(i * 0.45).toFixed(2)}s" d="M${f1(a)},${y - 4} Q${f1(m)},${f1(y - 4 - ht * 2)} ${f1(c)},${y - 4}" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round" pathLength="1"/>`;
    b += `<path d="M${f1(c)},${y - 4} l${h > 0 ? -7 : 7},-5 M${f1(c)},${y - 4} l${h > 0 ? -2 : 2},-9" stroke="${col}" stroke-width="2.5" stroke-linecap="round"/>`;
    b += txt(m, y - 10 - ht, (h > 0 ? "+" : "−") + Math.abs(h), { size: 12, fill: col === "#ff8fa3" ? "#e0607a" : "#3f9a73" });
  });
  pts.forEach((p, i) => { const last = i === pts.length - 1 && pts.length > 1; b += `<circle cx="${f1(X(p))}" cy="${y}" r="6" fill="${i === 0 ? SUN : last ? PINK : "#fff"}" stroke="${INK}" stroke-width="2"/>`;
    if (span > 20 || last) b += `<rect x="${f1(X(p) - 17)}" y="${y + 9}" width="34" height="17" rx="8" fill="${last ? "#FFE3EC" : "#fff"}" stroke="${last ? "#ff8fa3" : "#e5d9f2"}"/>` + txt(X(p), y + 22, last ? Q(p, o.reveal) : p, { size: 11 }); });
  (s.marks || []).forEach(mk => { b += `<path d="M${f1(X(mk.v))},${y - 28} v20" stroke="${mk.c || "#ff8fa3"}" stroke-width="3"/><circle cx="${f1(X(mk.v))}" cy="${y - 30}" r="4" fill="${mk.c || "#ff8fa3"}"/>` + txt(X(mk.v), y - 38, mk.t, { size: 12, fill: "#e0607a" }); });
  if (s.ask) b += txt(W - 8, 16, o.reveal ? s.ask.replace("?", s.ans) : s.ask, { anchor: "end", size: 13, fill: "#e0607a" });
  return wrap(W, 112, b, s.label || "number line", "numberline");
};

/* ---------- ten frames (make 10) ---------- */
V.tenframe = (s, o = {}) => {
  const C = 26, total = s.a + s.b, frames = Math.max(2, Math.ceil(total / 10)), W = frames * (5 * C + 16) + 8;
  let b = "";
  for (let f = 0; f < frames; f++) { const ox = 8 + f * (5 * C + 16), oy = 8;
    b += `<rect x="${ox - 3}" y="${oy - 3}" width="${5 * C + 6}" height="${2 * C + 6}" rx="8" fill="#fff" stroke="${LINE}" stroke-width="2"/>`;
    for (let k = 0; k < 10; k++) { const i = f * 10 + k, cx = ox + (k % 5) * C, cy = oy + Math.floor(k / 5) * C;
      b += `<rect x="${cx}" y="${cy}" width="${C}" height="${C}" fill="none" stroke="#e5d9f2" stroke-width="1.5"/>`;
      if (i < total) b += `<circle class="pop" style="animation-delay:${(i * 0.04).toFixed(2)}s" cx="${cx + C / 2}" cy="${cy + C / 2}" r="${C / 2 - 4}" fill="${i < s.a ? PINK : MINT}" stroke="${i < s.a ? "#e0607a" : "#3f9a73"}" stroke-width="1.5"/>`; } }
  b += txt(W / 2, 2 * C + 34, `${s.a} pink + ${s.b} green${o.reveal ? ` = ${total}` : " = ?"}`, { size: 13 });
  return wrap(W, 2 * C + 42, b, "ten frames", "tenframe");
};

/* ---------- bar model (rows of parts on one scale, braces, a right-hand total) ---------- */
V.bar = (s, o = {}) => {
  const rows = s.rows, hasName = rows.some(r => r.name), nx = hasName ? 96 : 10, right = s.total != null ? 56 : 12, W = 360, bw = W - nx - right, RH = 30;
  const max = s.max || Math.max(...rows.map(r => r.parts.reduce((a, p) => a + p.v, 0)));
  const sc = v => v / max * bw, above = rows.map(r => (r.braces || []).some(x => !x.below) ? 26 : 6), below = rows.map(r => (r.braces || []).some(x => x.below) ? 26 : 8);
  let y = 4, b = ""; const ys = [];
  rows.forEach((r, ri) => {
    y += above[ri]; ys.push(y); let x = nx;
    if (r.name) b += txt(nx - 8, y + RH / 2 + 4, r.name, { anchor: "end", size: 12 });
    r.parts.forEach((p, pi) => { const w = p.q ? Math.max(sc(p.v), 24) : sc(p.v), fill = p.fill || (p.q ? "#FFF0F5" : FILLS[(ri + (r.alt ? pi : 0)) % FILLS.length]);
      b += `<rect class="barpart" x="${f1(x)}" y="${y}" width="${f1(Math.max(w, 2))}" height="${RH}" rx="5" fill="${fill}" stroke="${p.q ? "#ff8fa3" : LINE}" stroke-width="2"${p.q ? ' stroke-dasharray="5 3"' : ""}/>`;
      const t = p.q ? QL(p, o.reveal) : p.t; if (t != null && t !== "" && w >= 14) b += txt(x + w / 2, y + RH / 2 + 5, t, { size: w < 26 ? 10 : 13, fill: p.q ? "#e0607a" : INK });
      x += w; });
    (r.braces || []).forEach(br => { const a = nx + sc(br.from), c = nx + sc(br.to), yy = br.below ? y + RH + 6 : y - 6, d = br.below ? 7 : -7, lab = br.q ? QL(br, o.reveal) : br.t;
      b += `<path d="M${f1(a)},${yy} v${d} H${f1(c)} v${-d}" transform="translate(0,${-d})" fill="none" stroke="${br.q ? "#ff8fa3" : INK}" stroke-width="2" stroke-linejoin="round"/>`;
      b += txt((a + c) / 2, br.below ? yy + 16 : yy - 10, lab, { size: 12, fill: br.q ? "#e0607a" : INK }); });
    y += RH + below[ri];
  });
  if (s.total != null) { const top = ys[0], bot = ys[ys.length - 1] + RH, x = W - right + 8, lab = s.totalQ ? Q(s.total, o.reveal) : s.total;
    b += `<path d="M${x},${top} h7 V${bot} h-7" fill="none" stroke="${s.totalQ ? "#ff8fa3" : INK}" stroke-width="2"/>` + txt(x + 12, (top + bot) / 2 + 4, lab, { anchor: "start", size: 12, fill: s.totalQ ? "#e0607a" : INK }); }
  return wrap(W, y + 4, b, s.label || "bar model", "bar");
};

/* ---------- arrays (rows × columns) ---------- */
V.array = (s, o = {}) => {
  const R = s.rows, C = s.cols, cell = Math.max(14, Math.min(26, Math.floor(300 / Math.max(C, R * 0.9)))), W = Math.max(200, C * cell + 70), H = R * cell + 34;
  let b = ""; const ox = (W - C * cell) / 2 + 18;
  for (let i = 0; i < R; i++) { b += txt(ox - 14, 14 + i * cell + cell / 2 + 3, i + 1, { size: 9, w: 700, fill: "#b4a3c6" });
    for (let j = 0; j < C; j++) b += `<circle cx="${f1(ox + j * cell + cell / 2)}" cy="${f1(14 + i * cell + cell / 2)}" r="${f1(cell / 2 - 3)}" fill="${FILLS[i % 2 ? 1 : 0]}" stroke="${LINE}" stroke-width="1.2"/>`; }
  b += txt(W / 2, H - 6, `${R} row${R > 1 ? "s" : ""} of ${C}${o.reveal ? ` = ${R * C}` : " = ?"}`, { size: 13 });
  return wrap(W, H, b, "array", "array");
};

/* ---------- equal groups / sharing (opt.dealt = rounds dealt so far) ---------- */
V.groups = (s, o = {}) => {
  const g = s.g, size = s.s, left = s.left || 0, tot = g * size + left, perRow = Math.min(g, g > 6 ? Math.ceil(g / 2) : g), rowsN = Math.ceil(g / perRow);
  const dealt = o.reveal ? size : Math.min(size, o.dealt == null ? (s.hide ? 0 : size) : o.dealt), dc = Math.ceil(Math.sqrt(Math.max(size, 1))), dot = Math.max(7, Math.min(13, Math.floor(56 / dc)));
  const rw = dc * dot + 16, W = Math.max(300, perRow * (rw + 8) + 16); let b = "", y = 8;
  for (let i = 0; i < g; i++) { const cx = 8 + (i % perRow) * (rw + 8) + (W - perRow * (rw + 8)) / 2, cy = y + Math.floor(i / perRow) * (rw + 8);
    b += `<rect x="${f1(cx)}" y="${cy}" width="${rw}" height="${rw}" rx="${rw / 2}" fill="#fff" stroke="${LINE}" stroke-width="2"/>`;
    for (let k = 0; k < dealt; k++) b += `<circle class="pop" cx="${f1(cx + 8 + (k % dc) * dot + dot / 2)}" cy="${f1(cy + 8 + Math.floor(k / dc) * dot + dot / 2)}" r="${f1(dot / 2 - 1.2)}" fill="${PINK}" stroke="#e0607a" stroke-width="1"/>`; }
  y += rowsN * (rw + 8) + 4;
  const pile = tot - dealt * g;
  if (pile > 0) { const pc = Math.min(pile, 20), pr = Math.ceil(pile / pc), pd = 12, pw = pc * pd + 16, px = (W - pw) / 2;
    const isLeft = dealt >= size; b += `<rect x="${f1(px)}" y="${y}" width="${pw}" height="${pr * pd + 14}" rx="10" fill="${isLeft ? "#FFF7D6" : CREAM}" stroke="${isLeft ? "#e8b84a" : "#d9c9ea"}" stroke-width="2" stroke-dasharray="5 3"/>`;
    for (let k = 0; k < pile; k++) b += `<circle cx="${f1(px + 8 + (k % pc) * pd + pd / 2)}" cy="${f1(y + 7 + Math.floor(k / pc) * pd + pd / 2)}" r="4.6" fill="${isLeft ? SUN : MINT}" stroke="${LINE}" stroke-width="1"/>`;
    y += pr * pd + 18; b += txt(W / 2, y + 8, isLeft ? `${pile} left over` : `${pile} still to share`, { size: 12 }); y += 14; }
  b += txt(W / 2, y + 12, `${g} groups · ${dealt >= size || o.reveal ? size : dealt ? dealt + "…" : "?"} in each${o.reveal && left ? ` · ${left} left over` : ""}`, { size: 13 }); y += 18;
  return wrap(W, y + 4, b, "equal groups", "groups");
};

/* ---------- base-ten blocks ---------- */
V.blocks = (s) => {
  const n = s.n, h = Math.floor(n / 100), t = Math.floor(n / 10) % 10, o = n % 10, U = 5, W = 360; let b = "", x = 10;
  const flat = (x0, y0) => { let g = `<rect x="${x0}" y="${y0}" width="${10 * U}" height="${10 * U}" fill="${LILAC}" stroke="${LINE}" stroke-width="1.5"/>`; for (let i = 1; i < 10; i++) g += `<path d="M${x0 + i * U},${y0} v${10 * U} M${x0},${y0 + i * U} h${10 * U}" stroke="#c7b5e8" stroke-width=".7"/>`; return g; };
  const rod = (x0, y0) => { let g = `<rect x="${x0}" y="${y0}" width="${U + 1}" height="${10 * U}" fill="${MINT}" stroke="${LINE}" stroke-width="1.2"/>`; for (let i = 1; i < 10; i++) g += `<path d="M${x0},${y0 + i * U} h${U + 1}" stroke="#8fd3b0" stroke-width=".7"/>`; return g; };
  for (let i = 0; i < h; i++) b += flat(x + (i % 5) * (10 * U + 4), 10 + Math.floor(i / 5) * (10 * U + 4));
  const hw = Math.min(h, 5) * (10 * U + 4), hh = Math.ceil(h / 5) * (10 * U + 4); if (h) b += txt(x + hw / 2, Math.max(hh, 54) + 26, `${h} hundred${h > 1 ? "s" : ""}`, { size: 11 }); x += hw + 12;
  for (let i = 0; i < t; i++) b += rod(x + i * (U + 4), 10); const tw = t * (U + 4); if (t) b += txt(x + tw / 2, Math.max(hh, 54) + 26, `${t} ten${t > 1 ? "s" : ""}`, { size: 11 }); x += tw + 12;
  for (let i = 0; i < o; i++) b += `<rect x="${x + (i % 3) * (U + 4)}" y="${10 + 10 * U - (Math.floor(i / 3) + 1) * (U + 4)}" width="${U + 1}" height="${U + 1}" fill="${PINK}" stroke="${LINE}" stroke-width="1"/>`;
  if (o) b += txt(x + 10, Math.max(hh, 54) + 26, `${o} one${o > 1 ? "s" : ""}`, { size: 11 });
  return wrap(Math.min(W, Math.max(200, x + 40)), Math.max(hh, 54) + 34, b, "base-ten blocks", "blocks");
};

/* ---------- fraction bars ---------- */
V.fracbars = (s, o = {}) => {
  const W = 360, bx = 10, bw = 280, H = 28; let y = 8, b = "";
  s.bars.forEach((r, i) => {
    const hid = r.reveal && !o.reveal;
    for (let k = 0; k < r.d; k++) b += `<rect x="${f1(bx + k * bw / r.d)}" y="${y}" width="${f1(bw / r.d)}" height="${H}" fill="${k < r.n && !hid ? (r.fill || FILLS[i % FILLS.length]) : "#fff"}" stroke="${LINE}" stroke-width="1.6"/>`;
    const lab = hid ? (r.q ? "= ?" : "") : r.q ? Q(r.rt != null ? r.rt : r.t, o.reveal) : r.t != null ? r.t : `${r.n}/${r.d}`;
    b += txt(bx + bw + 12, y + H / 2 + 5, lab, { anchor: "start", size: 13, fill: r.q ? "#e0607a" : INK });
    if (r.note) b += txt(bx + bw + 12, y + H / 2 + 18, r.note, { anchor: "start", size: 9, w: 700, fill: "#9a86ad" });
    y += H + 12; });
  return wrap(W, y, b, "fraction bars", "fracbars");
};

/* ---------- rectangle grid (area / perimeter) ---------- */
V.grid = (s, o = {}) => {
  const l = s.l, w = s.w, cell = Math.max(8, Math.min(24, Math.floor(Math.min(280 / l, 170 / w)))), gw = l * cell, gh = w * cell, W = Math.max(220, gw + 90), ox = (W - gw) / 2, oy = 26;
  let b = `<rect x="${f1(ox)}" y="${oy}" width="${gw}" height="${gh}" fill="${s.perim ? "#fff" : MINT}" stroke="${s.perim ? "#ff8fa3" : LINE}" stroke-width="${s.perim ? 4 : 2}"/>`;
  if (!s.noGrid) for (let i = 1; i < l; i++) b += `<path d="M${f1(ox + i * cell)},${oy} v${gh}" stroke="${s.perim ? "#efe6f7" : "#8fd3b0"}" stroke-width="1"/>`;
  if (!s.noGrid) for (let j = 1; j < w; j++) b += `<path d="M${f1(ox)},${oy + j * cell} h${gw}" stroke="${s.perim ? "#efe6f7" : "#8fd3b0"}" stroke-width="1"/>`;
  b += txt(ox + gw / 2, oy - 8, s.lq ? Q(`${l} ${s.u}`, o.reveal) : `${l} ${s.u}`, { size: 12, fill: s.lq ? "#e0607a" : INK });
  b += txt(ox + gw + 8, oy + gh / 2 + 4, s.wq ? Q(`${w} ${s.u}`, o.reveal) : `${w} ${s.u}`, { anchor: "start", size: 12, fill: s.wq ? "#e0607a" : INK });
  if (s.note) b += txt(W / 2, oy + gh + 20, s.note, { size: 12 });
  return wrap(W, oy + gh + (s.note ? 30 : 12), b, s.perim ? "perimeter" : "area grid", "grid");
};

/* ---------- question → spec ---------- */
const nl = (a, hops) => { let pts = [a], c = a; hops.forEach(h => { c += h; pts.push(c); }); const mn = Math.min(...pts), mx = Math.max(...pts);
  const span = mx - mn, st = span <= 16 ? 1 : span <= 100 ? 10 : 100; let lo = Math.floor(mn / st) * st, hi = Math.ceil(mx / st) * st; if (st === 1) { lo = Math.max(0, Math.min(lo, mx - 20 < 0 ? 0 : lo)); hi = Math.max(hi, lo + 10); if (mx <= 20 && mn >= 0) { lo = 0; hi = 20; } } if (hi === lo) hi = lo + st; return { type: "numberline", lo, hi, start: a, hops }; };
const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a || 1; };
const split = (b, sign) => { const T = Math.floor(b / 10) * 10, O = b % 10; return [T, O].filter(Boolean).map(x => x * sign); };
const BY = {
  "g1.add20": d => d.a + d.b <= 20 ? { type: "tenframe", a: d.a, b: d.b, tip: "Fill the first ten frame, then count the rest." } : null,
  "g1.sub20": d => { const a = d.a, b = d.b; let hops = [-b]; if (a > 10 && a - b < 10 && b > a - 10) hops = [-(a - 10), -(b - (a - 10))]; else if (b <= 4 && b > 1) hops = Array(b).fill(-1); return Object.assign(nl(a, hops), { lo: 0, hi: 20, tip: a > 10 && a - b < 10 ? "Hop back to 10 first, then hop back the rest." : "Hop back along the number line." }); },
  "g1.bonds": d => ({ type: "bar", tip: "The whole bar is split into two parts. One part is missing.", rows: [{ name: "whole", parts: [{ v: d.w, t: d.w }] }, { name: "parts", alt: 1, parts: [d.p ? { v: d.p, t: d.p } : null, { v: d.w - d.p, t: "?", rt: d.w - d.p, q: 1 }].filter(Boolean) }] }),
  "g2.add": d => Object.assign(nl(d.a, split(d.b, 1)), { tip: `Jump the tens first (+${Math.floor(d.b / 10) * 10}), then the ones (+${d.b % 10}).` }),
  "g2.sub": d => Object.assign(nl(d.a, split(d.b, -1)), { tip: `Jump back the tens first, then the ones.` }),
  "g2.times": d => ({ type: "array", rows: d.b, cols: d.a, tip: `${d.b} rows with ${d.a} in each row.` }),
  "g3.times": d => ({ type: "array", rows: d.b, cols: d.a, tip: `${d.b} rows of ${d.a}. Split it: 5 rows + ${Math.max(0, d.b - 5)} rows.` }),
  "g2.share": d => ({ type: "groups", g: d.b, s: d.a / d.b, left: 0, hide: 1, deal: 1, tip: `Deal the ${d.a} one at a time into ${d.b} groups.` }),
  "g3.divrem": d => ({ type: "groups", g: d.d, s: Math.floor(d.n / d.d), left: d.n % d.d, hide: 1, deal: 1, tip: `Deal ${d.n} into ${d.d} groups. Some will be left over!` }),
  "g3.perim": d => ({ type: "grid", l: d.l, w: d.w, u: "m", perim: 1, note: "Walk around the pink fence: perimeter = ? m", tip: "Add all four sides." }),
  "g4.round": d => d.t >= 10 ? { type: "numberline", lo: Math.floor(d.n / d.t) * d.t, hi: Math.floor(d.n / d.t) * d.t + d.t, start: Math.floor(d.n / d.t) * d.t, hops: [], marks: [{ v: d.n, t: d.n }, { v: Math.floor(d.n / d.t) * d.t + d.t / 2, t: "halfway", c: "#b59bd6" }], ask: `${d.n} rounds to ?`, ans: Math.round(d.n / d.t) * d.t, tip: "Is the pink flag before or after halfway?" } : null,
  "g4.fracadd": d => { const k = d.d2 / d.d1, n = d.sub ? d.a * k - d.b : d.a * k + d.b; return { type: "fracbars", tip: `Cut each ${d.d1}th into ${k} to make ${d.d2}ths.`, bars: [{ n: d.a, d: d.d1, t: `${d.a}/${d.d1}` }, { n: d.a * k, d: d.d2, t: `= ${d.a * k}/${d.d2}`, note: "same amount" }, { n: d.b, d: d.d2, t: `${d.sub ? "−" : "+"} ${d.b}/${d.d2}` }, { n: Math.min(n, d.d2), d: d.d2, t: `= ${n}/${d.d2}${gcd(n, d.d2) > 1 ? ` = ${n / gcd(n, d.d2)}/${d.d2 / gcd(n, d.d2)}` : ""}`, reveal: 1, q: 1 }, n > d.d2 ? { n: n - d.d2, d: d.d2, t: "", reveal: 1 } : null].filter(Boolean) }; },
  "g5.percent": d => d.p != null ? { type: "bar", tip: "The whole bar is 100%. Each block is 10%.", max: 100, rows: [{ parts: Array.from({ length: 10 }, (_, i) => ({ v: 10, t: i === 0 ? "10%" : "", fill: (i + 1) * 10 <= d.p ? PINK : i * 10 < d.p ? SUN : "#fff" })), braces: [{ from: 0, to: d.p, t: `${d.p}% = ?`, q: 1, rt: `${d.p}% = ${+(d.p * d.n / 100).toFixed(2)}` }, { from: 0, to: 100, t: `100% = ${d.n}`, below: 1 }] }] } : null,
  "g6.share": d => { const k = d.tot / (d.a + d.b), u = (n, ask) => Array.from({ length: n }, () => ({ v: 1, t: "", fill: ask ? PINK : MINT })); return { type: "bar", tip: `Hansel has ${d.a} units, Gretel has ${d.b}. Find 1 unit first.`, max: Math.max(d.a, d.b), total: d.tot, rows: [{ name: "Hansel", parts: u(d.a, d.who), braces: d.who ? [{ from: 0, to: d.a, t: "?", rt: d.a * k, q: 1 }] : [] }, { name: "Gretel", parts: u(d.b, !d.who), braces: !d.who ? [{ from: 0, to: d.b, t: "?", rt: d.b * k, q: 1, below: 1 }] : [] }] }; }
};
V.spec = q => {
  if (!q) return null;
  if (q.viz) return q.viz;
  const f = BY[q.topic]; if (!f || !q.data) return null;
  try { return f(q.data) || null; } catch (err) { return null; }
};
V.has = q => !!V.spec(q);
V.svg = (spec, opt = {}) => { if (!spec || !V[spec.type] || typeof V[spec.type] !== "function") return ""; return V[spec.type](spec, opt); };
V.render = (q, opt = {}) => V.svg(V.spec(q), opt);
V.TYPES = ["numberline", "tenframe", "bar", "array", "groups", "blocks", "fracbars", "grid"];

if (typeof module !== "undefined" && module.exports) module.exports = V; else root.MathViz = V;
})(typeof window !== "undefined" ? window : globalThis);
