/* 🧮 Model Magic: Singapore-style visual models for Number Kingdom questions (Grades 1–6).
   MathViz.spec(q) turns a question into a model spec (from q.viz, or from the topic's raw numbers in q.data);
   MathViz.svg(spec, opt) draws it as a pastel SVG. Models never print the answer unless opt.reveal is set:
   the unknown is always shown as "?". Pure JS with no DOM, so tests can run it in Node.
   Spec types: numberline · tenframe · bar (part-whole / comparison bar models) · array · groups (sharing, with
   "deal one each") · blocks (base-ten) · fracbars · grid (area / perimeter) · balance (Grades 6–8 equations, tap-to-solve)
   · clock (Grades 1–3 time: count the minutes, wind the hands on or back). */
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

/* ---------- ⚖️ balance scale (Grades 6–8 linear equations: "do the same to both sides") ----------
   A side is { n, d, c }: (n/d)·x + c. Pink bags are +x, blue bags −x, mint blocks +1, lilac balloons −1;
   a crate holds more than 12 blocks. spec.states[i] is the scale after i moves; spec.moves[i] is move i. */
const B = V.bal = {};
const fr = (n, d) => { const g = gcd(Math.abs(n), Math.abs(d)); return d < 0 ? [-n / g, -d / g] : [n / g, d / g]; };
const MINUS = "\u2212", sg = n => n < 0 ? MINUS + Math.abs(n) : String(n);
B.side = (n, d, c) => { const [a, b] = fr(n, d); return { n: a, d: b, c }; };
// one move on one side; op: sub (take k, k < 0 means add) · subx (take kx) · div · mul
B.apply = (sd, m) => m.op === "sub" ? B.side(sd.n, sd.d, sd.c - m.k) : m.op === "subx" ? B.side(sd.n - m.k * sd.d, sd.d, sd.c)
  : m.op === "div" ? B.side(sd.n, sd.d * m.k, sd.c / m.k) : B.side(sd.n * m.k, sd.d, sd.c * m.k);
B.move = (st, m, leftOnly) => ({ L: B.apply(st.L, m), R: leftOnly ? st.R : B.apply(st.R, m) });
const has = sd => sd.n !== 0;
// MOE order: share out a bracket · gather the bags on the side with more · clear the blocks next to x · make one whole bag
B.solve = (L, R, g) => {
  const moves = [], states = [{ L, R }]; let st = states[0];
  const go = m => { moves.push(m); st = B.move(st, m); states.push(st); };
  if (g > 1) go({ op: "div", k: g });
  if (has(st.L) && has(st.R)) go({ op: "subx", k: st.L.n > 0 && st.R.n > st.L.n ? st.L.n : st.R.n });
  const X = has(st.L) ? "L" : "R", N = X === "L" ? "R" : "L";
  if (st[X].c) go({ op: "sub", k: st[X].c });
  if (st[X].d !== 1) go({ op: "mul", k: st[X].d });
  if (st[X].n !== 1) go({ op: "div", k: st[X].n });
  return { moves, states, xSide: X, ans: st[N].c };
};
const vt = (k, v) => (k === 1 ? "" : k === -1 ? MINUS : sg(k)) + v;
B.label = (m, v, leftOnly) => {
  const both = leftOnly ? "the left side only" : "both sides", k = m.k;
  if (m.op === "sub") return k > 0 ? `➖ Take ${k} from ${both}` : `➕ Add ${-k} to ${both}`;
  if (m.op === "subx") return k > 0 ? `➖ Take ${vt(k, v)} from ${both}` : `➕ Add ${vt(-k, v)} to ${both}`;
  if (m.op === "div") return `➗ Divide ${both} by ${sg(k)}`;
  return `✖️ Multiply ${both} by ${sg(k)}`;
};
const opposite = m => m.op === "sub" || m.op === "subx" ? { op: m.op, k: -m.k } : { op: m.op === "div" ? "mul" : "div", k: m.k };
// three buttons for move i: the right move, the same move on one side only (tips the scale), and the opposite move
// (still balanced, but no closer). Dividing by −1 is its own opposite, so that one gets "divide by 1" instead.
B.choices = (s, i) => {
  const m = s.moves[i]; if (!m) return [];
  const opp = (m.op === "div" || m.op === "mul") && Math.abs(m.k) === 1 ? { op: m.op, k: 1, same: 1 } : opposite(m);
  // when x = 0 (or one side is 0) a one-sided move can stay balanced; then the second button is a balanced move that doesn't help
  const st = s.states[i], next = JSON.stringify(s.states[i + 1]), tips = Math.abs(B.weight(B.move(st, m, true).L, s.ans) - B.weight(st.R, s.ans)) > 1e-9;
  const nohelp = [{ op: "mul", k: 2 }, { op: "mul", k: 3 }, { op: "sub", k: -1 }].find(a => JSON.stringify(B.move(st, a)) !== next && B.label(a, s.v) !== B.label(opp, s.v) && B.label(a, s.v) !== B.label(m, s.v));
  const c = [{ kind: "good", m, label: B.label(m, s.v) }, tips ? { kind: "oneside", m, label: B.label(m, s.v, true) } : { kind: "nohelp", m: nohelp, label: B.label(nohelp, s.v) }, { kind: opp.same ? "nothing" : "opposite", m: opp, label: B.label(opp, s.v) }];
  const r = (i * 7 + Math.abs(m.k) + s.states[0].R.c) % 3, o = ((r % 3) + 3) % 3;
  return c.slice(o).concat(c.slice(0, o));
};
B.why = (ch, s) => ch.kind === "oneside" ? "Oops, the scale tipped! ⚖️ Whatever you do to one side, do to the other side too."
  : ch.kind === "nothing" ? "Dividing by 1 changes nothing. Try the other move! 💭"
  : ch.kind === "nohelp" ? `Still balanced, but that doesn't get ${s.v} on its own. Try another move! 💭`
  : ch.m.op === "sub" || ch.m.op === "subx" ? `Still balanced, but now there's even more next to the ${s.v}-bags! Do the opposite to clear them away. 💭`
  : ch.m.op === "mul" ? `Still balanced, but now there are more bags, not fewer! Share both sides out instead. 💭`
  : `Still balanced, but now each bag is cut into pieces! Make whole bags instead. 💭`;
B.text = (sd, v) => { let t = "";
  if (sd.n) t = sd.d === 1 ? vt(sd.n, v) : `${sd.n === 1 ? "" : sd.n === -1 ? MINUS : sg(sd.n)}${v}/${sd.d}`;
  if (sd.c) t += t ? ` ${sd.c < 0 ? MINUS : "+"} ${Math.abs(sd.c)}` : sg(sd.c);
  return t || "0"; };
B.weight = (sd, x) => sd.n / sd.d * x + sd.c;
const bag = (x, y, neg, lab) => `<g class="bbag"><path d="M${f1(x - 11)},${f1(y + 26)} Q${f1(x - 14)},${f1(y + 9)} ${f1(x - 5)},${f1(y + 6)} L${f1(x - 3)},${f1(y + 2)} L${f1(x + 3)},${f1(y + 2)} L${f1(x + 5)},${f1(y + 6)} Q${f1(x + 14)},${f1(y + 9)} ${f1(x + 11)},${f1(y + 26)} Z" fill="${neg ? SKY : PINK}" stroke="${neg ? "#6aa7d8" : "#e0607a"}" stroke-width="1.6" stroke-linejoin="round"/><path d="M${f1(x - 5)},${f1(y + 5)} h10" stroke="${neg ? "#6aa7d8" : "#e0607a"}" stroke-width="2.2" stroke-linecap="round"/>` + txt(x, y + 21, lab, { size: lab.length > 3 ? 8 : 10, fill: neg ? "#3d6f99" : "#a83a59" }) + `</g>`;
const block = (x, y, neg) => neg ? `<g class="bblk"><path d="M${f1(x + 8)},${f1(y + 16)} q-2,3 0,5" stroke="#9b84b0" stroke-width="1" fill="none"/><ellipse cx="${f1(x + 8)}" cy="${f1(y + 8)}" rx="7.5" ry="8" fill="${LILAC}" stroke="#9b7fd0" stroke-width="1.4"/><path d="M${f1(x + 5)},${f1(y + 4)} q2,-2 4,-1" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`
  : `<rect class="bblk" x="${f1(x + 1)}" y="${f1(y + 1)}" width="15" height="15" rx="4" fill="${MINT}" stroke="#3f9a73" stroke-width="1.4"/>`;
// everything on one plate, stacked upwards from the plate top (py), centred on cx
const plate = (sd, cx, py, v) => {
  let b = "", y = py; const c = Math.abs(sd.c), neg = sd.c < 0;
  if (c > 12) { y -= 26; const w = 64; b += `<rect x="${f1(cx - w / 2)}" y="${f1(y)}" width="${w}" height="24" rx="7" fill="${neg ? LILAC : MINT}" stroke="${neg ? "#9b7fd0" : "#3f9a73"}" stroke-width="1.6"/>` + txt(cx - 8, y + 16.5, `${neg ? MINUS : ""}${c}`, { size: 13 }) + block(cx + 10, y + 4, neg); y -= 2; }
  else if (c) { const rows = Math.ceil(c / 6); for (let i = 0; i < c; i++) { const row = Math.floor(i / 6), inRow = Math.min(6, c - row * 6), col = i % 6; b += block(cx - inRow * 9 + col * 18, py - (row + 1) * 18, neg); } y -= rows * 18 + 2; }
  const n = Math.abs(sd.n);
  if (sd.n && (sd.d !== 1 || n > 10)) { b += bag(cx, y - 30, sd.n < 0, sd.d !== 1 ? `${v}/${sd.d}` : `${n}${v}`); }
  else for (let i = 0; i < n; i++) { const row = Math.floor(i / 5), inRow = Math.min(5, n - row * 5), col = i % 5; b += bag(cx - inRow * 13 + 13 + col * 26, y - (row + 1) * 30, sd.n < 0, (sd.n < 0 ? MINUS : "") + v); }
  return b;
};
V.balance = (s, o = {}) => {
  const last = s.states.length - 1, step = o.reveal ? last : Math.min(last, o.step || 0), st = o.state || s.states[step], done = step === last && !o.state;
  const W = 360, by = 176, tilt = o.tilt || 0, dy = tilt * 13, P = { L: 90, R: 270 }, yL = by - 26 - dy, yR = by - 26 + dy;
  let b = `<rect x="118" y="${by + 36}" width="124" height="8" rx="4" fill="#E9DDF7"/><path d="M180,${by} L152,${by + 37} L208,${by + 37} Z" fill="${SUN}" stroke="#e8b84a" stroke-width="2" stroke-linejoin="round"/>`;
  b += `<circle cx="172" cy="${by + 22}" r="2.6" fill="${INK}"/><circle cx="188" cy="${by + 22}" r="2.6" fill="${INK}"/><path d="M175,${by + 28} q5,${tilt ? -3 : 4} 10,0" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="166" cy="${by + 28}" r="3" fill="#FFB8D1" opacity=".7"/><circle cx="194" cy="${by + 28}" r="3" fill="#FFB8D1" opacity=".7"/>`;
  b += `<g class="${tilt ? "btip" : ""}"><path d="M${P.L - 6},${f1(by - dy)} L${P.R + 6},${f1(by + dy)}" stroke="${LINE}" stroke-width="7" stroke-linecap="round"/><path d="M${P.L - 6},${f1(by - dy)} L${P.R + 6},${f1(by + dy)}" stroke="#F5EEFF" stroke-width="2.5" stroke-linecap="round"/>`;
  [["L", yL], ["R", yR]].forEach(([k, y]) => { b += `<path d="M${P[k]},${f1(y + 8)} V${f1(by + (k === "L" ? -dy : dy))}" stroke="${LINE}" stroke-width="3"/><rect x="${P[k] - 70}" y="${f1(y)}" width="140" height="9" rx="4.5" fill="#FFE3EC" stroke="#ff8fa3" stroke-width="2"/>` + plate(st[k], P[k], y, s.v); });
  b += `</g><circle cx="180" cy="${by}" r="6" fill="${PINK}" stroke="${INK}" stroke-width="1.6"/><path d="M180,${by - 4} l1.3,2.7 3,.4 -2.2,2 .6,3 -2.7,-1.5 -2.7,1.5 .6,-3 -2.2,-2 3,-.4z" fill="#fff"/>`;
  const X = s.xSide, lt = done && !o.reveal && X === "R" ? "?" : B.text(st.L, s.v), rt = done && !o.reveal && X === "L" ? "?" : B.text(st.R, s.v);
  b += txt(168, 22, lt, { anchor: "end", size: 17, fill: done && X === "R" ? "#e0607a" : INK }) + txt(180, 22, "=", { size: 17, fill: tilt ? "#e0607a" : INK }) + txt(192, 22, rt, { anchor: "start", size: 17, fill: done && X === "L" ? "#e0607a" : INK });
  if (tilt) b += txt(180, by + 58, "⚠️ not balanced!", { size: 12, fill: "#e0607a" });
  return wrap(W, by + (tilt ? 64 : 48), b, s.label || "balance scale", "balance");
};
const balSpec = (L, R, v, g, tip) => Object.assign({ type: "balance", v, tip }, B.solve(L, R, g));

/* ---------- 🕰️ Clock Workshop (Grades 1–3 time) ----------
   mode "read": count the long hand from the 12 (opt.k = minutes counted so far), then the short hand's hour lights up.
   mode "wind": wind the hands on (goal > 0) or back (goal < 0) from h:m (opt.t = minutes wound so far); the wound time
   is painted on the rim, and "end" questions show the end time as dashed hands. mode "set": just the hands at opt.t
   minutes after 12:00 (the hand-setting answer clock). The face is the same one the question pictures use. */
const CK = () => (root.MathGen || require("./math-gen.js")).clock;
const arc = (a0, a1, r, fill, op) => { if (a1 - a0 >= 360) return `<circle cx="60" cy="60" r="${r}" fill="${fill}" opacity="${op}"/>`; if (a1 <= a0) return "";
  const P = a => { const t = (a - 90) * Math.PI / 180; return `${f1(60 + r * Math.cos(t))},${f1(60 + r * Math.sin(t))}`; };
  return `<path d="M60,60 L${P(a0)} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0},1 ${P(a1)} Z" fill="${fill}" opacity="${op}"/>`; };
V.clockTime = (s, o = {}) => { const base = s.h % 12 * 60 + s.m, t = s.mode === "set" ? (o.t || 0) : s.mode === "wind" ? base + (o.reveal ? s.goal : o.t || 0) : base;
  const n = ((t % 720) + 720) % 720; return { h: Math.floor(n / 60) || 12, m: n % 60 }; };
V.clock = (s, o = {}) => {
  const C = CK(), f = C.face(); let b = f.rim, extra = "";
  const now = V.clockTime(s, o);
  if (s.mode === "read") {
    const k = o.reveal ? s.m : Math.min(s.m, o.k || 0), done = k >= s.m;
    b += arc(0, k * 6, 55, PINK, .55);
    for (let v = 5; v <= k; v += 5) { const t = (v * 6 - 90) * Math.PI / 180; extra += `<circle cx="${f1(60 + 55 * Math.cos(t))}" cy="${f1(60 + 55 * Math.sin(t))}" r="3.2" fill="#ff8fa3" stroke="#fff" stroke-width="1"/>` + txt(60 + 66 * Math.cos(t), 60 + 66 * Math.sin(t) + 3, v, { size: 8.5, fill: "#e0607a" }); }
    for (let v = Math.floor(k / 5) * 5 + 1; v <= k; v++) { const t = (v * 6 - 90) * Math.PI / 180; extra += `<circle cx="${f1(60 + 55 * Math.cos(t))}" cy="${f1(60 + 55 * Math.sin(t))}" r="2.2" fill="#9b7fd0"/>`; }
    if (done) b += arc(s.h % 12 * 30, s.h % 12 * 30 + 30, 47, LILAC, .9);
  } else if (s.mode === "wind") {
    const t = o.reveal ? s.goal : o.t || 0, a0 = s.m * 6, laps = Math.floor(Math.abs(t) / 60), rest = Math.abs(t) % 60;
    if (laps) b += arc(0, 360, 55, t > 0 ? PINK : MINT, .22 + .14 * Math.min(laps, 2));
    b += t > 0 ? arc(a0, a0 + rest * 6, 55, PINK, .6) : arc(a0 - rest * 6, a0, 55, MINT, .75);
    const st = (a0 - 90) * Math.PI / 180; extra += `<circle cx="${f1(60 + 56 * Math.cos(st))}" cy="${f1(60 + 56 * Math.sin(st))}" r="4" fill="${SUN}" stroke="#e8b84a" stroke-width="1.5"/>`;
    if (laps) extra += `<rect x="78" y="76" width="30" height="15" rx="7" fill="#fff" stroke="${t > 0 ? "#ff8fa3" : "#3f9a73"}"/>` + txt(93, 87, `${laps} h`, { size: 9, fill: t > 0 ? "#e0607a" : "#3f9a73" });
    if (s.end && !o.reveal) { const e = V.clockTime(s, { reveal: true }), [ha, ma] = C.angles(e.h, e.m);
      extra += `<g opacity=".55" stroke-dasharray="3 3">${C.hand(ha, 27, 4, "#9b7fd0")}${C.hand(ma, 40, 3, "#9b7fd0")}</g>`; }
  }
  b += f.ticks + f.nums + extra + C.hands(now.h, now.m);
  return wrap(152, 152, `<g transform="translate(16,16)">${b}</g>`, s.label || "clock", "clock mv-clock-" + s.mode);
};
const readSpec = (d, step, tip) => ({ type: "clock", mode: "read", h: d.h, m: d.m, step, tip });
const windSpec = w => ({ type: "clock", mode: "wind", h: w.h, m: w.m, goal: w.goal, end: !!w.end,
  tip: w.goal < 0 ? `Wind the clock back ${CK().dur(-w.goal)}: the hours first, then the minutes.` : w.end ? "Wind the clock from the start time to the end time. Stop on the dashed hands!" : `Wind the clock on ${CK().dur(w.goal)}: the hours first, then the minutes.` });

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
  "g1.time": d => readSpec(d, 5, d.m ? "Count the long hand in fives from the 12 to see how far it has gone." : "The long hand is on the 12, so it's o'clock. Where does the short hand point?"),
  "g2.time": d => readSpec(d, 5, d.m ? "Count the long hand in fives from the 12: 5, 10, 15…" : "The long hand is on the 12, so it's o'clock. Where does the short hand point?"),
  "g3.duration": d => d.wind ? windSpec(d.wind) : null,
  "g3.clock": d => d.wind ? windSpec(d.wind) : d.read ? readSpec(d, 1, "Count the long hand in fives, then in ones on the little marks.") : null,
  "g6.algebra": d => d.L ? balSpec(B.side(d.L[0], 1, d.L[1]), B.side(d.R[0], 1, d.R[1]), d.v || "x", 0, `The bag holds ${d.v || "x"} pearls. Tap a move that keeps the scale balanced!`) : null,
  "g7.lineq": d => balSpec(B.side(d.L[0], 1, d.L[1]), B.side(d.R[0], 1, d.R[1]), "x", d.g, d.g ? `${d.g} equal groups on the left, so share both sides into ${d.g} first.` : "Each bag holds x. Do the same to both sides to keep it balanced!"),
  "g7.story": d => balSpec(B.side(d.L[0], 1, d.L[1]), B.side(0, 1, d.R[1]), "x", 0, `Collect first: x + ${d.k}x = ${d.k + 1}x and ${d.d} + ${d.d} = ${2 * d.d}. Now balance it!`),
  "g8.fraceq": d => balSpec(B.side(1, d.a, d.b), B.side(0, 1, d.c), "x", 0, `The bag is cut into ${d.a} pieces: x/${d.a} is one piece. Clear the blocks, then make a whole bag.`),
  "g8.story": d => balSpec(B.side(d.s - d.b, 1, d.b * d.N), B.side(0, 1, d.cost), "x", 0, `Collect first: ${d.s}x + ${d.b}(${d.N} − x) = ${d.s - d.b}x + ${d.b * d.N}. Now balance it!`),
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
V.TYPES = ["numberline", "tenframe", "bar", "array", "groups", "blocks", "fracbars", "grid", "balance", "clock"];

if (typeof module !== "undefined" && module.exports) module.exports = V; else root.MathViz = V;
})(typeof window !== "undefined" ? window : globalThis);
