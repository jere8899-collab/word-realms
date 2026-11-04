/* 🔢 Number Kingdom: seeded procedural maths generators for Grades 1–12 (Singapore MOE aligned: P1–P6 = G1–6,
   Sec 1–4 = G7–10, JC1–2 = G11–12), the answer checker and the Times-Table Tower fact helpers.
   Pure JS with no DOM, so it runs in the browser (window.MathGen) and in Node (require) for tests.
   A question: { topic, q, kind, val, a, tol, options, hint, steps[], pic, keys[], data }
   - q / options / hint / steps use $…$ for TeX (rendered with KaTeX, or a plain HTML fallback)
   - kind: num | mcq | set (any order) | pair (ordered) | rem (quotient r remainder) | time (h:mm, 12-hour) | time24 (hh:mm) | ratio (a:b)
   - q.set: answer a "time" question by setting the hands of a clock (js/math-clock.js) instead of typing */
(function (root) {
const M = {};
/* ---------- seeded RNG (mulberry32) ---------- */
M.rng = seed => {
  let a = seed >>> 0;
  const r = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  r.int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  r.nz = (lo, hi) => { let x; do x = r.int(lo, hi); while (x === 0); return x; };
  r.pick = arr => arr[Math.floor(r() * arr.length)];
  r.chance = p => r() < p;
  r.shuffle = arr => { arr = arr.slice(); for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
  return r;
};
M.seed = () => (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;

/* ---------- number helpers ---------- */
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
const rd = (x, dp = 0) => { const f = Math.pow(10, dp); return Math.round((x + (x >= 0 ? 1e-12 : -1e-12)) * f) / f; };
const fmt = x => { if (!isFinite(x)) return String(x); const s = String(+(+x).toFixed(10)); return s === "-0" ? "0" : s; };
const fdp = (x, dp) => rd(x, dp).toFixed(dp);
const money = x => "\\$" + (+x).toFixed(2);
const simp = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
const fracTex = (n, d) => { [n, d] = simp(n, d); if (d === 1) return String(n); return (n < 0 ? "-" : "") + `\\frac{${Math.abs(n)}}{${d}}`; };
const fracStr = (n, d) => { [n, d] = simp(n, d); return d === 1 ? String(n) : `${n}/${d}`; };
const mixedTex = (n, d) => { [n, d] = simp(n, d); if (d === 1 || Math.abs(n) < d) return fracTex(n, d); const w = Math.trunc(n / d), r = Math.abs(n % d); return `${w}\\tfrac{${r}}{${d}}`; };
/* radical kit (Root Garden surds, and shared √ TeX in distance / magnitude steps): sqrtTex("a^2+b^2") → \sqrt{a^2+b^2};
   surdTex(k, n) → k√n as TeX (surdTex(6, 2) → 6\sqrt{2}); simpRad(n) pulls out the largest square factor so
   n = a²·m with m square-free (simpRad(72) → [6, 2]). */
const sqrtTex = n => `\\sqrt{${n}}`;
const surdTex = (k, n) => { if (n === 1) return String(k); if (!k) return "0"; if (k === 1) return sqrtTex(n); if (k === -1) return "-" + sqrtTex(n); return `${k}${sqrtTex(n)}`; };
const simpRad = n => { n = Math.abs(n | 0); if (!n) return [0, 0]; let a = 1; for (let p = 2; p * p <= n; p++) while (n % (p * p) === 0) { n /= p * p; a *= p; } return [a, n]; };
/* matrix kit (Matrix Meadow, and shared pmatrix TeX for column vectors): matTex(rows) → LaTeX pmatrix;
   matSvg(title, rows, opts?) → pastel chibi card with class=mgrid / mcell (data-r, data-c, data-v) so tests can
   re-read the matrix; opts.B + opts.op draw a second grid with an operator badge (add / scalar / multiply). */
const matTex = rows => `\\begin{pmatrix} ${rows.map(r => r.join(" & ")).join(" \\\\ ")} \\end{pmatrix}`;
const matSvg = (title, rows, opts = {}) => {
  const cell = (r, c, v, hi) => {
    const fill = hi ? "#FFE7A8" : PASTEL[(r * 3 + c) % PASTEL.length];
    return `<rect class="mcell" data-r="${r}" data-c="${c}" data-v="${esc(v)}" x="0" y="0" width="36" height="28" rx="6" fill="${fill}" stroke="${LINE}" stroke-width="1.4" transform="translate(${c * 40},${r * 32})"/><text x="${c * 40 + 18}" y="${r * 32 + 19}" font-size="13" text-anchor="middle" font-weight="800" fill="${INK}">${esc(v)}</text>`;
  };
  const grid = (R, which, hiSet) => {
    const nr = R.length, nc = R[0].length;
    let cells = ""; for (let r = 0; r < nr; r++) for (let c = 0; c < nc; c++) cells += cell(r, c, R[r][c], hiSet && hiSet.has(r + "," + c));
    const gw = nc * 40 - 4, gh = nr * 32 - 4;
    return `<g class="mgrid" data-which="${which}" data-rows="${nr}" data-cols="${nc}"><rect x="-6" y="-6" width="${gw + 12}" height="${gh + 12}" rx="10" fill="#FFFDF8" stroke="${INK}" stroke-width="1.6" fill-opacity=".35"/>${cells}</g>`;
  };
  const hi = new Set((opts.hi || []).map(([r, c]) => r + "," + c));
  const A = rows, B = opts.B, op = opts.op || "";
  const nr = A.length, nc = A[0].length;
  const aw = nc * 40 - 4, ah = nr * 32 - 4;
  let body = "", cx = 24, cy = 36;
  const badge = (x, y, txt) => `<g transform="translate(${x},${y})"><circle r="14" fill="#E2D6FF" stroke="${LINE}" stroke-width="1.4"/><text y="5" font-size="13" text-anchor="middle" font-weight="900" fill="${INK}">${esc(txt)}</text></g>`;
  if (B) {
    const br = B.length, bc = B[0].length, bw = bc * 40 - 4, bh = br * 32 - 4;
    const midY = Math.max(ah, bh) / 2;
    body += `<g transform="translate(${cx},${cy})">${grid(A, "A", hi)}</g>`;
    const opX = cx + aw + 28;
    body += badge(opX, cy + midY, op || "+");
    body += `<g transform="translate(${opX + 28},${cy + (ah - bh) / 2})">${grid(B, "B", null)}</g>`;
    const W = opX + 28 + bw + 28, H = Math.max(ah, bh) + cy + 24;
    return cardSvg(Math.max(W, 200), H, title, 18, body, "matrix diagram", "mpic chart matrix");
  }
  if (op) { body += badge(cx + 6, cy + ah / 2, op); cx += 36; }
  body += `<g transform="translate(${cx},${cy})">${grid(A, "A", hi)}</g>`;
  const W = cx + aw + 24, H = ah + cy + 24;
  return cardSvg(Math.max(W, 160), H, title, 18, body, "matrix diagram", "mpic chart matrix");
};
const sgn = (c, first) => c < 0 ? (first ? "-" : " - ") : (first ? "" : " + ");
// polynomial in x from [[coef, power], ...] (highest first)
const poly = (terms, v = "x") => { let s = "", first = true; for (const [c, p] of terms) { if (!c) continue; const a = Math.abs(c);
  const co = (a === 1 && p !== 0) ? "" : fmt(a); s += sgn(c, first) + co + (p === 0 ? "" : p === 1 ? v : `${v}^{${p}}`); first = false; } return s || "0"; };
const lin = (a, b, v = "x") => poly([[a, 1], [b, 0]], v);
/* polynomial calculus kit (Derivative Dragons / Hilltop Stationary / Lantern Tangent Trail):
   diffPoly(terms) → derivative terms (bring power down, drop constants); evalPoly(terms, x) → value. */
const diffPoly = terms => terms.filter(([, p]) => p > 0).map(([c, p]) => [c * p, p - 1]);
const evalPoly = (terms, x) => terms.reduce((s, [c, p]) => s + c * Math.pow(x, p), 0);
const paren = x => x < 0 ? `(${x})` : String(x);
// signed terms for worked steps: pm(-3) → "- 3", pm(3) → "+ 3"; undo(b) is the move that cancels "+ b" ("- b"; "- 0" for 0)
const pm = n => `${n < 0 ? "-" : "+"} ${Math.abs(n)}`;
const undo = n => `${n < 0 ? "+" : "-"} ${Math.abs(n)}`;
// a TeX coefficient in front of a letter or bracket: coef(1) → "", coef(-1) → "-", coef(3) → "3"
const coef = k => k === 1 ? "" : k === -1 ? "-" : String(k);
// ordinal words for "the 20th term", "the 3rd multiple" (11th–13th included)
const ord = k => k + (k % 100 >= 11 && k % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][k % 10] || "th");
/* stats kit (Average Adventures, Mean Median & Mode, Frequency Fair, Kite-Festival Spread): a total, a sorted copy, the median of
   a list, and the mean of a frequency table (values xs with frequencies fs) */
const sum = xs => xs.reduce((a, b) => a + b, 0);
const asc = xs => xs.slice().sort((a, b) => a - b);
const median = xs => { const s = asc(xs), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const freqTotals = (xs, fs) => ({ N: sum(fs), S: sum(xs.map((x, i) => x * fs[i])), S2: sum(xs.map((x, i) => x * x * fs[i])) });
M.util = { gcd, lcm, rd, fmt, fdp, simp, fracTex, fracStr, poly, sum, asc, median, freqTotals, sqrtTex, surdTex, simpRad };

/* ---------- question builders ---------- */
const Q = o => Object.assign({ kind: "num", tol: 1e-9, keys: [], steps: [], hint: "", pic: "" }, o);
const num = (q, val, hint, steps, extra = {}) => Q(Object.assign({ q, val, a: extra.a || fmt(val), hint, steps }, extra));
// multiple choice: unique options, correct one included once; options are pre-shuffled with the seeded rng
const mcq = (r, q, correct, wrong, hint, steps, extra = {}) => {
  const opts = [correct]; for (const w of wrong) if (opts.length < 4 && !opts.includes(w)) opts.push(w);
  return Q(Object.assign({ q, kind: "mcq", options: r.shuffle(opts), a: correct, hint, steps }, extra));
};
// multiple choice where every option carries a note: rightWhy says in other words why the answer works, and each wrong
// option comes as [option, why-not note]; options that clash with the answer or each other are dropped (first 3 kept)
const mcqWhy = (r, q, correct, rightWhy, wrong, hint, steps, extra = {}) => {
  const seen = new Set([correct]), keep = wrong.filter(([o]) => !seen.has(o) && seen.add(o)).slice(0, 3);
  return mcq(r, q, correct, keep.map(w => w[0]), hint, steps, Object.assign({ why: Object.fromEntries([[correct, rightWhy]].concat(keep)) }, extra));
};
// a typed-number question whose usual slips each get a why-not note: slips = [[wrong value, note]] (any that equal the answer,
// or an earlier slip, are dropped)
const numWhy = (q, val, hint, steps, slips, extra = {}) => { const tol = extra.tol || 1e-9;
  const keep = []; for (const sl of slips) if (Math.abs(sl[0] - val) > 2 * tol + 1e-9 && !keep.some(k => Math.abs(k[0] - sl[0]) <= 2 * tol + 1e-9)) keep.push(sl);
  return num(q, val, hint, steps, Object.assign({ slips: keep }, extra)); };
const T = s => `$${s}$`; // inline TeX

/* ---------- fairytale flavour ---------- */
const NAMES = ["Princess Mira", "Prince Oli", "Little Red", "Goldilocks", "Fairy Pip", "Rapunzel", "Jack", "Puss in Boots", "the Frog King", "Snow White", "the Gingerbread Baker", "the Tooth Fairy", "Sumi the star fairy", "Aladdin", "Cinderella"];
const THINGS = [["star cookies", "🍪"], ["magic beans", "🫘"], ["glass slippers", "👠"], ["golden apples", "🍎"], ["fairy lanterns", "🏮"], ["dragon eggs", "🥚"], ["mushrooms", "🍄"], ["crystal gems", "💎"], ["cupcakes", "🧁"], ["carrots", "🥕"], ["candy canes", "🍬"], ["roses", "🌹"]];
const COUNT_EMOJI = ["🍓", "⭐", "🍄", "🦋", "🍎", "🌸", "🐟", "🧁", "💎", "🐣"];

/* ---------- SVG pictures (clock, shapes, fraction pies, coins, charts) ---------- */
// shared palette: pastel fills, ink for text, a soft purple line, and the cream card every chart or figure sits on
const PASTEL = ["#FFB8D1", "#BDE7FF", "#C8F2DC", "#E2D6FF", "#FFE7A8", "#FFD3B5"];
const INK = "#6d4f86", LINE = "#9b84b0";
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
// shared SVG bits: one <svg> wrapper, a point on a circle (radians, 1 d.p.) and a pie wedge
const svgBox = (body, label, w, h = w, vb = "0 0 120 120", cls = "mpic") => `<svg class="${cls}" viewBox="${vb}" width="${w}" height="${h}" role="img" aria-label="${label}">${body}</svg>`;
// a w × h cream card with a centred title (baseline ty), drawn behind charts and geometry figures
const cardSvg = (w, h, title, ty, body, label, cls = "mpic chart") => svgBox(`<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="14" fill="#FFFDF8" stroke="#F1E3F7" stroke-width="2"/><text x="${w / 2}" y="${ty}" font-size="12" text-anchor="middle" font-weight="900" fill="${INK}">${esc(title)}</text>${body}`, label, w, h, `0 0 ${w} ${h}`, cls);
/* square grids (Mirror Pond figures, cube nets): a cell is [column, row] */
const cellKey = ([a, b]) => a + "," + b, figKey = cells => cells.map(cellKey).sort().join(" ");
const hasCell = (cells, c) => cells.some(d => d[0] === c[0] && d[1] === c[1]);
const STEP4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
// empty cells next to the figure, inside a W × H grid, that pass ok(c) (in a fixed order, so seeded picks stay the same)
const nearCells = (cells, W, H, ok = () => true) => { const out = []; for (const [a, b] of cells) for (const [da, db] of STEP4) { const c = [a + da, b + db];
  if (c[0] >= 0 && c[0] < W && c[1] >= 0 && c[1] < H && !hasCell(cells, c) && !hasCell(out, c) && ok(c)) out.push(c); } return out; };
// squared paper: a rounded W × H sheet of S-px squares inside a pad, and one shaded square on it
const gridPaper = (W, H, S, pad) => { let g = `<rect x="1" y="1" width="${W * S + 2 * pad - 2}" height="${H * S + 2 * pad - 2}" rx="7" fill="#F2FAFF" stroke="#CFE6F7" stroke-width="2"/>`;
  for (let i = 0; i <= W; i++) g += `<line x1="${pad + i * S}" y1="${pad}" x2="${pad + i * S}" y2="${pad + H * S}" stroke="#DCEBF5" stroke-width="1"/>`;
  for (let j = 0; j <= H; j++) g += `<line x1="${pad}" y1="${pad + j * S}" x2="${pad + W * S}" y2="${pad + j * S}" stroke="#DCEBF5" stroke-width="1"/>`; return g; };
// the finished sheet: squared paper + the drawing on it, scaled k times (Mirror Pond, cube nets, Ribbon Roads)
const gridSheet = (W, H, S, pad, body, label, k, cls) => { const w = W * S + 2 * pad, h = H * S + 2 * pad;
  return svgBox(gridPaper(W, H, S, pad) + body, label, Math.round(w * k), Math.round(h * k), `0 0 ${w} ${h}`, cls); };
const gridCell = (x, y, S, pad, fill, cls) => `<rect class="${cls}" x="${pad + x * S + 1}" y="${pad + y * S + 1}" width="${S - 2}" height="${S - 2}" rx="3" fill="${fill}" stroke="${LINE}" stroke-width="1.2"/>`;
const polar = (cx, cy, r, a) => [(cx + r * Math.cos(a)).toFixed(1), (cy + r * Math.sin(a)).toFixed(1)];
const wedge = (cx, cy, r, a0, a1) => { const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1);
  return `<path d="M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${a1 - a0 > Math.PI + 1e-9 ? 1 : 0},1 ${x1},${y1} Z"`; };
// 🕰️ clock parts, shared by the question pictures and the interactive Clock Workshop (js/math-viz.js):
// the face (rim, minute ticks, numbers), one hand at an angle in degrees, and "h:mm"
const pad2 = m => String(m).padStart(2, "0");
const hm = (h, m) => `${h}:${pad2(m)}`;
const clockRad = a => (a - 90) * Math.PI / 180;
const clockHand = (a, len, w, c, cx = 60, cy = 60) => { const [x, y] = polar(cx, cy, len, clockRad(a)); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`; };
const clockFace = () => {
  let nums = ""; for (let i = 1; i <= 12; i++) { const [x, y] = polar(60, 64, 42, clockRad(i * 30)); nums += `<text x="${x}" y="${y}" font-size="11" text-anchor="middle" font-weight="800" fill="${INK}">${i}</text>`; }
  let ticks = ""; for (let i = 0; i < 60; i++) { const a = clockRad(i * 6), [x1, y1] = polar(60, 60, i % 5 ? 53 : 50, a), [x2, y2] = polar(60, 60, 55, a); ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#c9b3ff" stroke-width="${i % 5 ? 1 : 2}"/>`; }
  return { rim: `<circle cx="60" cy="60" r="57" fill="#FFF4C2" stroke="#FFB8D1" stroke-width="5"/>`, ticks, nums };
};
// hour-hand and minute-hand angles for h:mm (the hour hand creeps on half a degree a minute)
const clockAngles = (h, m) => [(h % 12) * 30 + m * 0.5, m * 6];
const clockHands = (h, m) => { const [ha, ma] = clockAngles(h, m); return `${clockHand(ha, 27, 5, INK)}${clockHand(ma, 40, 3, "#ff8fa3")}<circle cx="60" cy="60" r="4" fill="${INK}"/>`; };
const svgClock = (h, m) => { const f = clockFace(); return svgBox(`${f.rim}${f.ticks}${f.nums}${clockHands(h, m)}`, "clock", 150, 150, undefined, "mpic clock"); };
// time in words the MOE way: "7 o'clock", "quarter past 7", "half past 7", "20 minutes to 8", "1 minute past 12"
const nextHour = h => h % 12 + 1;
const clockWords = (h, m) => m === 0 ? `${h} o'clock` : m === 15 ? `quarter past ${h}` : m === 30 ? `half past ${h}` : m === 45 ? `quarter to ${nextHour(h)}`
  : m < 30 ? `${m} minute${m === 1 ? "" : "s"} past ${h}` : `${60 - m} minute${60 - m === 1 ? "" : "s"} to ${nextHour(h)}`;
// 24-hour clock: minutes after midnight → "19:05"; and back to "7:05 p.m." (12 a.m. is midnight, 12 p.m. is noon)
const h24 = t => `${pad2(Math.floor(t / 60) % 24)}:${pad2(t % 60)}`;
const ampm = t => { const H = Math.floor(t / 60) % 24; return `${H % 12 || 12}:${pad2(t % 60)} ${H < 12 ? "a.m." : "p.m."}`; };
// a length of time: 85 → "1 h 25 min", 60 → "1 h", 40 → "40 min"
const dur = n => [Math.floor(n / 60) ? Math.floor(n / 60) + " h" : "", n % 60 ? n % 60 + " min" : ""].filter(Boolean).join(" ") || "0 min";
M.clock = { face: clockFace, hand: clockHand, hands: clockHands, angles: clockAngles, rad: clockRad, hm, pad2, words: clockWords, nextHour, h24, ampm, dur };
const SHAPES = {
  triangle: { sides: 3, corners: 3, pts: "60,12 108,100 12,100" }, square: { sides: 4, corners: 4, pts: "18,18 102,18 102,102 18,102" },
  rectangle: { sides: 4, corners: 4, pts: "6,30 114,30 114,92 6,92" }, pentagon: { sides: 5, corners: 5, pts: "60,8 112,46 92,108 28,108 8,46" },
  hexagon: { sides: 6, corners: 6, pts: "34,10 86,10 112,60 86,110 34,110 8,60" }, circle: { sides: 0, corners: 0 }
};
const svgShape = (k, fill = "#C8F2DC") => svgBox(k === "circle" ? `<circle cx="60" cy="60" r="50" fill="${fill}" stroke="${LINE}" stroke-width="4"/>` : `<polygon points="${SHAPES[k].pts}" fill="${fill}" stroke="${LINE}" stroke-width="4" stroke-linejoin="round"/>`, "shape", 130);
const svgPie = (k, d) => {
  let s = ""; for (let i = 0; i < d; i++) { const a0 = i / d * 2 * Math.PI - Math.PI / 2, a1 = (i + 1) / d * 2 * Math.PI - Math.PI / 2;
    s += `${d === 1 ? `<circle cx="60" cy="60" r="52"` : wedge(60, 60, 52, a0, a1)} fill="${i < k ? "#FFB8D1" : "#FFF8EE"}" stroke="${LINE}" stroke-width="3"/>`; }
  return svgBox(s, "fraction pie", 140);
};
/* charts for the data-analysis topics (MOE P1–P6: picture graphs, bar graphs, line graphs, pie charts).
   Values are drawn but never printed on the bars or points, so the child reads them off the scale. */
// picture graph: rows [{ name, n, e }] (n pictures each), key text under it
const picto = (title, rows, key) => `<div class="mpic picto" role="img" aria-label="picture graph"><div class="ptitle">${esc(title)}</div>${rows.map(w => `<div class="prow"><span class="pname">${esc(w.name)}</span><span class="pics">${w.e.repeat(w.n) || "&nbsp;"}</span></div>`).join("")}<div class="pkey">${esc(key)}</div></div>`;
/* chart axis kit (bar, line and travel graphs, cumulative frequency curves, box-plot number lines): */
// a tick label's class + value for tests to read the scale back (cls "" → none)
const tickAttr = (cls, v) => cls ? ` class="${cls}" data-v="${v}"` : "";
// gridlines + y-axis labels from 0 to max in steps (labels get class cls + data-v when cls is given); returns [svg, y(value)]
const axes = (x0, x1, top, bot, max, step, cls = "") => {
  const y = v => +(bot - (bot - top) * v / max).toFixed(1); let s = "";
  for (let v = 0; v <= max; v += step) s += `<line x1="${x0}" y1="${y(v)}" x2="${x1}" y2="${y(v)}" stroke="${v ? "#EFE6FA" : "#b9a6cc"}" stroke-width="${v ? 1 : 2}"/><text${tickAttr(cls, v)} x="${x0 - 5}" y="${y(v) + 3.5}" font-size="10" text-anchor="end" font-weight="800" fill="${INK}">${v}</text>`;
  return [s, y];
};
// vertical gridlines from top to bot with a label under each: ticks = [[px, label, value]], grid = line colour, dy = label drop
const xTicks = (ticks, top, bot, grid, dy, cls = "") => ticks.map(([x, label, v]) => `<line x1="${x}" y1="${top}" x2="${x}" y2="${bot}" stroke="${grid}" stroke-width="1"/><text${tickAttr(cls, v)} x="${x}" y="${bot + dy}" font-size="9.5" text-anchor="middle" font-weight="800" fill="${INK}">${label}</text>`).join("");
// the y-axis name in the top-left corner, and the x-axis name centred under the tick labels
const yUnit = unit => `<text x="8" y="31" font-size="9" font-weight="800" fill="${LINE}">${esc(unit)}</text>`;
const xUnit = (x, y, unit) => `<text x="${x}" y="${y}" font-size="9.5" text-anchor="middle" font-weight="800" fill="${LINE}">${esc(unit)}</text>`;
const chartBox = (title, unit, body, label) => cardSvg(300, 210, title, 17, `${yUnit(unit)}${body}`, label);
/* coordinate-plane / parabola kit (Parabola Park; travel graphs reuse plotFrame for the same cream chart box).
   plotFrame(xmin,xmax,ymin,ymax, box?) → { x0,x1,top,bot, X,Y } mapping maths coords into the card (y up).
   svgPlane(title, opts) → cream card with bipolar labelled axes, optional grid, and opts.draw(X,Y,box) body.
   svgParabola(title, a,b,c, opts?) → plots y=ax²+bx+c as class=parabola path (data-a/b/c), optional marks for the
   turning point / roots / y-intercept (class=pdot data-n data-x data-y). axes()/xTicks()/svgBars/svgLine stay untouched. */
const PLOT_BOX = { x0: 48, x1: 282, top: 42, bot: 178 };
const plotFrame = (xmin, xmax, ymin, ymax, box = PLOT_BOX) => {
  const { x0, x1, top, bot } = box;
  const X = v => f1(x0 + (v - xmin) / (xmax - xmin || 1) * (x1 - x0));
  const Y = v => f1(bot - (v - ymin) / (ymax - ymin || 1) * (bot - top));
  return { x0, x1, top, bot, X, Y };
};
const svgPlane = (title, opts = {}) => {
  const xmin = opts.xmin ?? -5, xmax = opts.xmax ?? 5, ymin = opts.ymin ?? -5, ymax = opts.ymax ?? 5;
  const xstep = opts.xstep || 1, ystep = opts.ystep || 1, box = opts.box || PLOT_BOX;
  const { x0, x1, top, bot, X, Y } = plotFrame(xmin, xmax, ymin, ymax, box);
  const ox = X(0), oy = Y(0), showGrid = opts.grid !== false;
  let grid = "";
  if (showGrid) {
    for (let x = xmin; x <= xmax + 1e-9; x += xstep) if (Math.abs(x) > 1e-9) grid += `<line x1="${X(x)}" y1="${top}" x2="${X(x)}" y2="${bot}" stroke="#F3ECFA" stroke-width="1"/>`;
    for (let y = ymin; y <= ymax + 1e-9; y += ystep) if (Math.abs(y) > 1e-9) grid += `<line x1="${x0}" y1="${Y(y)}" x2="${x1}" y2="${Y(y)}" stroke="#F3ECFA" stroke-width="1"/>`;
  }
  // bipolar axes through the origin when it is on the plot, else along the near edge
  const ax = (ox >= x0 - .5 && ox <= x1 + .5) ? ox : (xmin >= 0 ? x0 : x1);
  const ay = (oy >= top - .5 && oy <= bot + .5) ? oy : (ymin >= 0 ? bot : top);
  grid += `<line class="paxis" data-which="y" x1="${ax}" y1="${top}" x2="${ax}" y2="${bot}" stroke="#b9a6cc" stroke-width="2"/>`;
  grid += `<line class="paxis" data-which="x" x1="${x0}" y1="${ay}" x2="${x1}" y2="${ay}" stroke="#b9a6cc" stroke-width="2"/>`;
  let ticks = "";
  for (let x = xmin; x <= xmax + 1e-9; x += xstep) {
    const px = X(x), onY = Math.abs(x) < 1e-9;
    ticks += `<line x1="${px}" y1="${ay - 4}" x2="${px}" y2="${ay + 4}" stroke="#b9a6cc" stroke-width="1.5"/>`;
    if (!onY) ticks += `<text class="xt" data-v="${fmt(x)}" x="${px}" y="${f1(ay + 14)}" font-size="9.5" text-anchor="middle" font-weight="800" fill="${INK}">${fmt(x)}</text>`;
  }
  for (let y = ymin; y <= ymax + 1e-9; y += ystep) {
    const py = Y(y), onX = Math.abs(y) < 1e-9;
    ticks += `<line x1="${ax - 4}" y1="${py}" x2="${ax + 4}" y2="${py}" stroke="#b9a6cc" stroke-width="1.5"/>`;
    if (!onX) ticks += `<text class="yt" data-v="${fmt(y)}" x="${f1(ax - 6)}" y="${f1(py + 3.5)}" font-size="10" text-anchor="end" font-weight="800" fill="${INK}">${fmt(y)}</text>`;
  }
  // origin "0" once, tucked under the axes cross
  ticks += `<text class="xt yt" data-v="0" x="${f1(ax - 6)}" y="${f1(ay + 14)}" font-size="9.5" text-anchor="end" font-weight="800" fill="${INK}">0</text>`;
  const xlab = opts.xName || "x", ylab = opts.yName || "y";
  const names = `<text x="${f1(x1 - 2)}" y="${f1(ay - 6)}" font-size="11" text-anchor="end" font-weight="900" font-style="italic" font-family="Georgia, serif" fill="${LINE}">${esc(xlab)}</text>`
    + `<text x="${f1(ax + 8)}" y="${f1(top + 10)}" font-size="11" font-weight="900" font-style="italic" font-family="Georgia, serif" fill="${LINE}">${esc(ylab)}</text>`;
  const body = typeof opts.draw === "function" ? opts.draw(X, Y, { x0, x1, top, bot, ax, ay, xmin, xmax, ymin, ymax }) : (opts.body || "");
  const W = opts.w || 300, H = opts.h || 226, cls = opts.cls || "mpic chart plane";
  return cardSvg(W, H, title, opts.ty || 18, grid + ticks + names + body, opts.label || "coordinate plane", cls);
};
// sample y=ax²+bx+c across [xmin,xmax]; clip to the visible y-range; marks = [{ n, x, y, lab? }]
const svgParabola = (title, a, b, c, opts = {}) => {
  const h0 = -b / (2 * a), k0 = a * h0 * h0 + b * h0 + c;
  const disc = b * b - 4 * a * c;
  const roots0 = disc >= -1e-12 ? [(-b - Math.sqrt(Math.max(0, disc))) / (2 * a), (-b + Math.sqrt(Math.max(0, disc))) / (2 * a)] : [];
  let xmin = opts.xmin, xmax = opts.xmax, ymin = opts.ymin, ymax = opts.ymax;
  if (xmin == null || xmax == null) {
    const xs = [0, h0].concat(roots0);
    let lo = Math.floor(Math.min(...xs) - 1), hi = Math.ceil(Math.max(...xs) + 1);
    if (hi - lo < 6) { const m = (lo + hi) / 2; lo = Math.floor(m - 3); hi = Math.ceil(m + 3); }
    xmin = xmin ?? Math.max(-8, lo); xmax = xmax ?? Math.min(8, hi);
    if (xmax - xmin < 4) { xmin = Math.max(-8, xmin - 1); xmax = Math.min(8, xmax + 1); }
  }
  const markYs = (opts.marks || []).map(m => m.y), markXs = (opts.marks || []).map(m => m.x);
  if (ymin == null || ymax == null) {
    const ySamples = [c, k0].concat(markYs);
    for (let i = 0; i <= 24; i++) { const x = xmin + (xmax - xmin) * i / 24; ySamples.push(a * x * x + b * x + c); }
    const lo = Math.min(...ySamples), hi = Math.max(...ySamples);
    const pad = Math.max(1, Math.ceil((hi - lo) * .12 + .01));
    ymin = ymin ?? Math.floor(lo) - pad; ymax = ymax ?? Math.ceil(hi) + pad;
    if (ymax - ymin < 4) { const m = (ymin + ymax) / 2; ymin = Math.floor(m - 2); ymax = Math.ceil(m + 2); }
  }
  if (xmin == null || xmax == null) { /* already set above */ }
  // always show the origin when it sits near the interesting region; keep marks inside the window
  if (xmin > 0) xmin = 0; if (xmax < 0) xmax = 0; if (ymin > 0) ymin = 0; if (ymax < 0) ymax = 0;
  for (const x of markXs) { if (x < xmin) xmin = Math.floor(x) - 1; if (x > xmax) xmax = Math.ceil(x) + 1; }
  for (const y of markYs) { if (y < ymin) ymin = Math.floor(y) - 1; if (y > ymax) ymax = Math.ceil(y) + 1; }
  const marks = opts.marks || [];
  const small = !!opts.small;
  const xstep = opts.xstep || (xmax - xmin > 10 ? 2 : 1), ystep = opts.ystep || (ymax - ymin > 12 ? Math.ceil((ymax - ymin) / 8) : ymax - ymin > 8 ? 2 : 1);
  return svgPlane(title, Object.assign({}, opts, { xmin, xmax, ymin, ymax, xstep, ystep,
    w: small ? 150 : (opts.w || 300), h: small ? 120 : (opts.h || 226), ty: small ? 14 : 18, cls: opts.cls || "mpic chart parabola",
    label: opts.label || "parabola graph",
    draw: (X, Y) => {
      const N = small ? 24 : 48; let d = "", started = false;
      for (let i = 0; i <= N; i++) {
        const x = xmin + (xmax - xmin) * i / N, y = a * x * x + b * x + c;
        if (y < ymin - .6 || y > ymax + .6) { started = false; continue; }
        d += (started ? " L" : (d ? " M" : "M")) + xy([X(x), Y(y)]); started = true;
      }
      const stroke = opts.stroke || (a > 0 ? "#7ec8e3" : "#ff8fa3");
      let s = `<path class="parabola" data-a="${a}" data-b="${b}" data-c="${c}" d="${d}" fill="none" stroke="${stroke}" stroke-width="${small ? 2.2 : 3}" stroke-linejoin="round" stroke-linecap="round"/>`;
      for (const m of marks) {
        /* marks stay visible: window was expanded to fit them */
        const px = X(m.x), py = Y(m.y), lab = m.lab != null ? m.lab : m.n;
        s += `<circle class="pdot" data-n="${esc(m.n)}" data-x="${fmt(m.x)}" data-y="${fmt(m.y)}" cx="${px}" cy="${py}" r="${small ? 3 : 4}" fill="#fff" stroke="#ff6f91" stroke-width="2"/>`;
        if (lab && !small) s += `<text class="plab" data-n="${esc(m.n)}" x="${f1(px + (m.dx || 0))}" y="${f1(py + (m.dy || -8))}" font-size="11" text-anchor="middle" font-weight="900" fill="${INK}" paint-order="stroke" stroke="#FFFDF8" stroke-width="3">${esc(lab)}</text>`;
      }
      return s;
    } }));
};
/* wave / trig-graph kit (Wave Pier): amplitude & period helper, then svgWave on the shared svgPlane.
   ampPeriod(a,b,{deg?}) → { amp:|a|, period: 360/|b| in degrees (default) or 2π/|b| in radians }.
   svgWave(title, a, b, kind, d, opts?) → one/two periods of y = a sin(bx)+d or a cos(bx)+d (x in degrees),
   path class=wave with data-a/b/kind/d, marks class=wdot (data-n/x/y). Parabola + travel stay byte-identical. */
const ampPeriod = (a, b, o = {}) => {
  const amp = Math.abs(a), bb = Math.abs(b) || 1;
  return { amp, period: o.deg === false ? 2 * Math.PI / bb : 360 / bb };
};
const svgWave = (title, a, b, kind, d = 0, opts = {}) => {
  const kn = kind === "cos" ? "cos" : "sin";
  const { amp, period } = ampPeriod(a, b);
  const periods = opts.periods != null ? opts.periods : 1;
  let xmin = opts.xmin, xmax = opts.xmax, ymin = opts.ymin, ymax = opts.ymax;
  if (xmin == null) xmin = 0;
  if (xmax == null) xmax = period * periods;
  const markYs = (opts.marks || []).map(m => m.y), markXs = (opts.marks || []).map(m => m.x);
  if (ymin == null || ymax == null) {
    const lo = Math.min(d - amp, ...markYs, -1), hi = Math.max(d + amp, ...markYs, 1);
    const pad = Math.max(1, Math.ceil((hi - lo) * .15 + .01));
    ymin = ymin ?? Math.floor(lo) - pad; ymax = ymax ?? Math.ceil(hi) + pad;
    if (ymax - ymin < 4) { const m = (ymin + ymax) / 2; ymin = Math.floor(m - 2); ymax = Math.ceil(m + 2); }
  }
  if (xmin > 0) xmin = 0; if (ymin > 0) ymin = 0; if (ymax < 0) ymax = 0;
  for (const x of markXs) { if (x < xmin) xmin = Math.floor(x) - 1; if (x > xmax) xmax = Math.ceil(x) + 1; }
  for (const y of markYs) { if (y < ymin) ymin = Math.floor(y) - 1; if (y > ymax) ymax = Math.ceil(y) + 1; }
  const marks = opts.marks || [], small = !!opts.small;
  // tick every 90° (or half-period for short windows); y by 1 or 2
  const xspan = xmax - xmin, yspan = ymax - ymin;
  const xstep = opts.xstep || (xspan > 720 ? 180 : xspan > 360 ? 90 : xspan > 180 ? 45 : 90);
  const ystep = opts.ystep || (yspan > 12 ? Math.ceil(yspan / 8) : yspan > 8 ? 2 : 1);
  const yAt = x => (kn === "cos" ? a * cosD(b * x) : a * sinD(b * x)) + d;
  return svgPlane(title, Object.assign({}, opts, { xmin, xmax, ymin, ymax, xstep, ystep,
    w: small ? 150 : (opts.w || 300), h: small ? 120 : (opts.h || 226), ty: small ? 14 : 18,
    cls: opts.cls || "mpic chart wave", label: opts.label || "trigonometric graph",
    xName: opts.xName || "x (°)", yName: opts.yName || "y",
    draw: (X, Y) => {
      const N = small ? 36 : 72; let path = "", started = false;
      for (let i = 0; i <= N; i++) {
        const x = xmin + (xmax - xmin) * i / N, y = yAt(x);
        if (y < ymin - .6 || y > ymax + .6) { started = false; continue; }
        path += (started ? " L" : (path ? " M" : "M")) + xy([X(x), Y(y)]); started = true;
      }
      const stroke = opts.stroke || (kn === "cos" ? "#a78bfa" : "#7ec8e3");
      let s = `<path class="wave" data-a="${a}" data-b="${b}" data-kind="${kn}" data-d="${d}" d="${path}" fill="none" stroke="${stroke}" stroke-width="${small ? 2.2 : 3}" stroke-linejoin="round" stroke-linecap="round"/>`;
      for (const m of marks) {
        const px = X(m.x), py = Y(m.y), lab = m.lab != null ? m.lab : m.n;
        s += `<circle class="wdot" data-n="${esc(m.n)}" data-x="${fmt(m.x)}" data-y="${fmt(m.y)}" cx="${px}" cy="${py}" r="${small ? 3 : 4}" fill="#fff" stroke="#ff6f91" stroke-width="2"/>`;
        if (lab && !small) s += `<text class="wlab" data-n="${esc(m.n)}" x="${f1(px + (m.dx || 0))}" y="${f1(py + (m.dy || -8))}" font-size="11" text-anchor="middle" font-weight="900" fill="${INK}" paint-order="stroke" stroke="#FFFDF8" stroke-width="3">${esc(lab)}</text>`;
      }
      return s;
    } }));
};
/* straight-line kit (Straight-Line Street): y = mx + c on the shared svgPlane / plotFrame.
   svgStraight(title, m, c, opts?) → path class=lineeq with data-m/c, marks class=ldot (data-n/x/y).
   opts.small → 150×120 match thumbnails; optional marks for y-intercept / labelled point / x-intercept.
   Window keeps the origin visible (same origin-keeping idea as svgParabola). Parabola / wave / travel stay byte-identical. */
const svgStraight = (title, m, c, opts = {}) => {
  let xmin = opts.xmin, xmax = opts.xmax, ymin = opts.ymin, ymax = opts.ymax;
  const marks = opts.marks || [];
  const markYs = marks.map(mk => mk.y), markXs = marks.map(mk => mk.x);
  // default window: include origin, y-intercept, a couple of lattice samples, and any marks
  if (xmin == null || xmax == null) {
    const xs = [0];
    if (Math.abs(m) > 1e-12) xs.push(-c / m);
    // sample x where the line is likely near lattice points
    for (let x = -4; x <= 4; x++) xs.push(x);
    for (const x of markXs) xs.push(x);
    let lo = Math.floor(Math.min(...xs) - 1), hi = Math.ceil(Math.max(...xs) + 1);
    if (hi - lo < 6) { const mid = (lo + hi) / 2; lo = Math.floor(mid - 3); hi = Math.ceil(mid + 3); }
    xmin = xmin ?? Math.max(-8, lo); xmax = xmax ?? Math.min(8, hi);
    if (xmax - xmin < 4) { xmin = Math.max(-8, xmin - 1); xmax = Math.min(8, xmax + 1); }
  }
  if (ymin == null || ymax == null) {
    const ySamples = [c, 0].concat(markYs);
    for (let i = 0; i <= 12; i++) { const x = xmin + (xmax - xmin) * i / 12; ySamples.push(m * x + c); }
    const lo = Math.min(...ySamples), hi = Math.max(...ySamples);
    const pad = Math.max(1, Math.ceil((hi - lo) * .12 + .01));
    ymin = ymin ?? Math.floor(lo) - pad; ymax = ymax ?? Math.ceil(hi) + pad;
    if (ymax - ymin < 4) { const mid = (ymin + ymax) / 2; ymin = Math.floor(mid - 2); ymax = Math.ceil(mid + 2); }
  }
  // always show the origin when it sits near the interesting region; keep marks inside the window
  if (xmin > 0) xmin = 0; if (xmax < 0) xmax = 0; if (ymin > 0) ymin = 0; if (ymax < 0) ymax = 0;
  for (const x of markXs) { if (x < xmin) xmin = Math.floor(x) - 1; if (x > xmax) xmax = Math.ceil(x) + 1; }
  for (const y of markYs) { if (y < ymin) ymin = Math.floor(y) - 1; if (y > ymax) ymax = Math.ceil(y) + 1; }
  const small = !!opts.small;
  const xstep = opts.xstep || (xmax - xmin > 10 ? 2 : 1);
  const ystep = opts.ystep || (ymax - ymin > 12 ? Math.ceil((ymax - ymin) / 8) : ymax - ymin > 8 ? 2 : 1);
  return svgPlane(title, Object.assign({}, opts, { xmin, xmax, ymin, ymax, xstep, ystep,
    w: small ? 150 : (opts.w || 300), h: small ? 120 : (opts.h || 226), ty: small ? 14 : 18,
    cls: opts.cls || "mpic chart lineeq", label: opts.label || "linear graph",
    draw: (X, Y, box) => {
      const { xmin: xLo, xmax: xHi, ymin: yLo, ymax: yHi } = box;
      // clip the infinite line to the visible window (find endpoints on the border)
      const pts = [];
      const push = (x, y) => { if (x >= xLo - 1e-9 && x <= xHi + 1e-9 && y >= yLo - 1e-9 && y <= yHi + 1e-9) pts.push([x, y]); };
      // intersections with the four edges
      push(xLo, m * xLo + c); push(xHi, m * xHi + c);
      if (Math.abs(m) > 1e-12) { push((yLo - c) / m, yLo); push((yHi - c) / m, yHi); }
      // dedupe near-duplicates then take the two extremes along x (or y if vertical-ish)
      const uniq = [];
      for (const p of pts) if (!uniq.some(q => Math.abs(q[0] - p[0]) < 1e-6 && Math.abs(q[1] - p[1]) < 1e-6)) uniq.push(p);
      uniq.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      let d = "";
      if (uniq.length >= 2) {
        const a = uniq[0], b = uniq[uniq.length - 1];
        d = "M" + xy([X(a[0]), Y(a[1])]) + " L" + xy([X(b[0]), Y(b[1])]);
      } else if (uniq.length === 1) {
        d = "M" + xy([X(uniq[0][0]), Y(uniq[0][1])]) + " L" + xy([X(uniq[0][0]), Y(uniq[0][1])]);
      }
      const stroke = opts.stroke || (m >= 0 ? "#7ec8e3" : "#ff8fa3");
      let s = `<path class="lineeq" data-m="${fmt(m)}" data-c="${fmt(c)}" d="${d}" fill="none" stroke="${stroke}" stroke-width="${small ? 2.2 : 3}" stroke-linejoin="round" stroke-linecap="round"/>`;
      for (const mk of marks) {
        const px = X(mk.x), py = Y(mk.y), lab = mk.lab != null ? mk.lab : mk.n;
        s += `<circle class="ldot" data-n="${esc(mk.n)}" data-x="${fmt(mk.x)}" data-y="${fmt(mk.y)}" cx="${px}" cy="${py}" r="${small ? 3 : 4}" fill="#fff" stroke="#ff6f91" stroke-width="2"/>`;
        if (lab && !small) s += `<text class="llab" data-n="${esc(mk.n)}" x="${f1(px + (mk.dx || 0))}" y="${f1(py + (mk.dy || -8))}" font-size="11" text-anchor="middle" font-weight="900" fill="${INK}" paint-order="stroke" stroke="#FFFDF8" stroke-width="3">${esc(lab)}</text>`;
      }
      return s;
    } }));
};
/* polycurve / tangent kit (Lantern Tangent Trail): general polynomial on the shared svgPlane.
   svgCurve(title, terms, opts?) → path class=polycurve with data-terms (JSON), marks class=cdot (data-n/x/y).
   svgTangent(title, terms, x0, opts?) → curve + tangent segment class=tline (data-m/c/x0) and contact mark.
   opts.small → 150×120 match thumbnails. Parabola / wave / straight stay byte-identical. */
const termsKey = terms => JSON.stringify(terms);
const yPoly = (terms, x) => evalPoly(terms, x);
const svgCurve = (title, terms, opts = {}) => {
  const marks = opts.marks || [];
  const markYs = marks.map(m => m.y), markXs = marks.map(m => m.x);
  let xmin = opts.xmin, xmax = opts.xmax, ymin = opts.ymin, ymax = opts.ymax;
  if (xmin == null || xmax == null) {
    const xs = [0].concat(markXs);
    // sample a few lattice x so the default window covers the interesting bend
    for (let x = -4; x <= 4; x++) xs.push(x);
    let lo = Math.floor(Math.min(...xs) - 1), hi = Math.ceil(Math.max(...xs) + 1);
    if (hi - lo < 6) { const mid = (lo + hi) / 2; lo = Math.floor(mid - 3); hi = Math.ceil(mid + 3); }
    xmin = xmin ?? Math.max(-8, lo); xmax = xmax ?? Math.min(8, hi);
    if (xmax - xmin < 4) { xmin = Math.max(-8, xmin - 1); xmax = Math.min(8, xmax + 1); }
  }
  if (ymin == null || ymax == null) {
    const ySamples = [0].concat(markYs);
    for (let i = 0; i <= 24; i++) { const x = xmin + (xmax - xmin) * i / 24; ySamples.push(yPoly(terms, x)); }
    const lo = Math.min(...ySamples), hi = Math.max(...ySamples);
    const pad = Math.max(1, Math.ceil((hi - lo) * .12 + .01));
    ymin = ymin ?? Math.floor(lo) - pad; ymax = ymax ?? Math.ceil(hi) + pad;
    if (ymax - ymin < 4) { const mid = (ymin + ymax) / 2; ymin = Math.floor(mid - 2); ymax = Math.ceil(mid + 2); }
  }
  if (xmin > 0) xmin = 0; if (xmax < 0) xmax = 0; if (ymin > 0) ymin = 0; if (ymax < 0) ymax = 0;
  for (const x of markXs) { if (x < xmin) xmin = Math.floor(x) - 1; if (x > xmax) xmax = Math.ceil(x) + 1; }
  for (const y of markYs) { if (y < ymin) ymin = Math.floor(y) - 1; if (y > ymax) ymax = Math.ceil(y) + 1; }
  const small = !!opts.small;
  const xstep = opts.xstep || (xmax - xmin > 10 ? 2 : 1);
  const ystep = opts.ystep || (ymax - ymin > 12 ? Math.ceil((ymax - ymin) / 8) : ymax - ymin > 8 ? 2 : 1);
  return svgPlane(title, Object.assign({}, opts, { xmin, xmax, ymin, ymax, xstep, ystep,
    w: small ? 150 : (opts.w || 300), h: small ? 120 : (opts.h || 226), ty: small ? 14 : 18,
    cls: opts.cls || "mpic chart polycurve", label: opts.label || "curve graph",
    draw: (X, Y) => {
      const N = small ? 24 : 48; let d = "", started = false;
      for (let i = 0; i <= N; i++) {
        const x = xmin + (xmax - xmin) * i / N, y = yPoly(terms, x);
        if (y < ymin - .6 || y > ymax + .6) { started = false; continue; }
        d += (started ? " L" : (d ? " M" : "M")) + xy([X(x), Y(y)]); started = true;
      }
      const stroke = opts.stroke || "#a78bfa";
      let s = `<path class="polycurve" data-terms="${esc(termsKey(terms))}" d="${d}" fill="none" stroke="${stroke}" stroke-width="${small ? 2.2 : 3}" stroke-linejoin="round" stroke-linecap="round"/>`;
      for (const m of marks) {
        const px = X(m.x), py = Y(m.y), lab = m.lab != null ? m.lab : m.n;
        s += `<circle class="cdot" data-n="${esc(m.n)}" data-x="${fmt(m.x)}" data-y="${fmt(m.y)}" cx="${px}" cy="${py}" r="${small ? 3 : 4}" fill="#fff" stroke="#ff6f91" stroke-width="2"/>`;
        if (lab && !small) s += `<text class="clab" data-n="${esc(m.n)}" x="${f1(px + (m.dx || 0))}" y="${f1(py + (m.dy || -8))}" font-size="11" text-anchor="middle" font-weight="900" fill="${INK}" paint-order="stroke" stroke="#FFFDF8" stroke-width="3">${esc(lab)}</text>`;
      }
      return s;
    } }));
};
const svgTangent = (title, terms, x0, opts = {}) => {
  const dTerms = diffPoly(terms);
  const m = yPoly(dTerms, x0), y0 = yPoly(terms, x0), c = y0 - m * x0;
  const marks = (opts.marks || []).slice();
  if (!opts.noContact) {
    const has = marks.some(mk => Math.abs(mk.x - x0) < 1e-9 && Math.abs(mk.y - y0) < 1e-9);
    if (!has) marks.push({ n: opts.contactN || "P", x: x0, y: y0, lab: opts.contactLab != null ? opts.contactLab : `P(${fmt(x0)}, ${fmt(y0)})`, dy: y0 >= 0 ? -8 : 14 });
  }
  const markYs = marks.map(mk => mk.y), markXs = marks.map(mk => mk.x);
  let xmin = opts.xmin, xmax = opts.xmax, ymin = opts.ymin, ymax = opts.ymax;
  if (xmin == null || xmax == null) {
    const xs = [0, x0].concat(markXs);
    for (let x = -4; x <= 4; x++) xs.push(x);
    let lo = Math.floor(Math.min(...xs) - 1), hi = Math.ceil(Math.max(...xs) + 1);
    if (hi - lo < 6) { const mid = (lo + hi) / 2; lo = Math.floor(mid - 3); hi = Math.ceil(mid + 3); }
    xmin = xmin ?? Math.max(-8, lo); xmax = xmax ?? Math.min(8, hi);
    if (xmax - xmin < 4) { xmin = Math.max(-8, xmin - 1); xmax = Math.min(8, xmax + 1); }
  }
  if (ymin == null || ymax == null) {
    const ySamples = [0, y0, c].concat(markYs);
    for (let i = 0; i <= 24; i++) {
      const x = xmin + (xmax - xmin) * i / 24;
      ySamples.push(yPoly(terms, x), m * x + c);
    }
    const lo = Math.min(...ySamples), hi = Math.max(...ySamples);
    const pad = Math.max(1, Math.ceil((hi - lo) * .12 + .01));
    ymin = ymin ?? Math.floor(lo) - pad; ymax = ymax ?? Math.ceil(hi) + pad;
    if (ymax - ymin < 4) { const mid = (ymin + ymax) / 2; ymin = Math.floor(mid - 2); ymax = Math.ceil(mid + 2); }
  }
  if (xmin > 0) xmin = 0; if (xmax < 0) xmax = 0; if (ymin > 0) ymin = 0; if (ymax < 0) ymax = 0;
  for (const x of markXs) { if (x < xmin) xmin = Math.floor(x) - 1; if (x > xmax) xmax = Math.ceil(x) + 1; }
  for (const y of markYs) { if (y < ymin) ymin = Math.floor(y) - 1; if (y > ymax) ymax = Math.ceil(y) + 1; }
  const small = !!opts.small;
  const xstep = opts.xstep || (xmax - xmin > 10 ? 2 : 1);
  const ystep = opts.ystep || (ymax - ymin > 12 ? Math.ceil((ymax - ymin) / 8) : ymax - ymin > 8 ? 2 : 1);
  return svgPlane(title, Object.assign({}, opts, { xmin, xmax, ymin, ymax, xstep, ystep,
    w: small ? 150 : (opts.w || 300), h: small ? 120 : (opts.h || 226), ty: small ? 14 : 18,
    cls: opts.cls || "mpic chart tangent", label: opts.label || "curve with tangent",
    draw: (X, Y, box) => {
      const { xmin: xLo, xmax: xHi, ymin: yLo, ymax: yHi } = box;
      const N = small ? 24 : 48; let d = "", started = false;
      for (let i = 0; i <= N; i++) {
        const x = xLo + (xHi - xLo) * i / N, y = yPoly(terms, x);
        if (y < yLo - .6 || y > yHi + .6) { started = false; continue; }
        d += (started ? " L" : (d ? " M" : "M")) + xy([X(x), Y(y)]); started = true;
      }
      const stroke = opts.stroke || "#a78bfa";
      let s = `<path class="polycurve" data-terms="${esc(termsKey(terms))}" d="${d}" fill="none" stroke="${stroke}" stroke-width="${small ? 2.2 : 3}" stroke-linejoin="round" stroke-linecap="round"/>`;
      // clip the tangent line to the visible window (same edge-intersection idea as svgStraight)
      const pts = [];
      const push = (x, y) => { if (x >= xLo - 1e-9 && x <= xHi + 1e-9 && y >= yLo - 1e-9 && y <= yHi + 1e-9) pts.push([x, y]); };
      push(xLo, m * xLo + c); push(xHi, m * xHi + c);
      if (Math.abs(m) > 1e-12) { push((yLo - c) / m, yLo); push((yHi - c) / m, yHi); }
      const uniq = [];
      for (const p of pts) if (!uniq.some(q => Math.abs(q[0] - p[0]) < 1e-6 && Math.abs(q[1] - p[1]) < 1e-6)) uniq.push(p);
      uniq.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      let td = "";
      if (uniq.length >= 2) {
        const a = uniq[0], b = uniq[uniq.length - 1];
        td = "M" + xy([X(a[0]), Y(a[1])]) + " L" + xy([X(b[0]), Y(b[1])]);
      } else if (uniq.length === 1) {
        td = "M" + xy([X(uniq[0][0]), Y(uniq[0][1])]) + " L" + xy([X(uniq[0][0]), Y(uniq[0][1])]);
      }
      const tStroke = opts.tStroke || (m >= 0 ? "#7ec8e3" : "#ff8fa3");
      s += `<path class="tline" data-m="${fmt(m)}" data-c="${fmt(c)}" data-x0="${fmt(x0)}" d="${td}" fill="none" stroke="${tStroke}" stroke-width="${small ? 1.8 : 2.4}" stroke-dasharray="${small ? "4 3" : "6 4"}" stroke-linejoin="round" stroke-linecap="round"/>`;
      for (const mk of marks) {
        const px = X(mk.x), py = Y(mk.y), lab = mk.lab != null ? mk.lab : mk.n;
        s += `<circle class="cdot" data-n="${esc(mk.n)}" data-x="${fmt(mk.x)}" data-y="${fmt(mk.y)}" cx="${px}" cy="${py}" r="${small ? 3 : 4}" fill="#fff" stroke="#ff6f91" stroke-width="2"/>`;
        if (lab && !small) s += `<text class="clab" data-n="${esc(mk.n)}" x="${f1(px + (mk.dx || 0))}" y="${f1(py + (mk.dy || -8))}" font-size="11" text-anchor="middle" font-weight="900" fill="${INK}" paint-order="stroke" stroke="#FFFDF8" stroke-width="3">${esc(lab)}</text>`;
      }
      return s;
    } }));
};
const svgBars = (title, unit, cats, vals, max, step) => {
  const x0 = 36, x1 = 290, top = 38, bot = 170, [grid, y] = axes(x0, x1, top, bot, max, step), w = (x1 - x0) / cats.length;
  const bars = cats.map((c, i) => { const bx = +(x0 + w * i + w * 0.2).toFixed(1), bw = +(w * 0.6).toFixed(1), cx = +(x0 + w * (i + 0.5)).toFixed(1);
    return `<rect x="${bx}" y="${y(vals[i])}" width="${bw}" height="${+(bot - y(vals[i])).toFixed(1)}" rx="5" fill="${PASTEL[i % 6]}" stroke="${LINE}" stroke-width="1.5"/><text x="${cx}" y="${bot + 16}" font-size="13" text-anchor="middle">${c.e}</text><text x="${cx}" y="${bot + 30}" font-size="9.5" text-anchor="middle" font-weight="800" fill="${INK}">${esc(c.name)}</text>`; }).join("");
  return chartBox(title, unit, grid + bars, "bar graph");
};
// line graph: x labels, values, scale max + step
const svgLine = (title, unit, xs, vals, max, step) => {
  const x0 = 36, x1 = 286, top = 38, bot = 176, [grid, y] = axes(x0, x1, top, bot, max, step), dx = (x1 - x0 - 20) / (xs.length - 1), X = i => +(x0 + 10 + dx * i).toFixed(1);
  const pts = vals.map((v, i) => `${X(i)},${y(v)}`).join(" ");
  return chartBox(title, unit, grid + xTicks(xs.map((t, i) => [X(i), esc(t)]), top, bot, "#F5EFFB", 16) +
    `<polyline points="${pts}" fill="none" stroke="#ff8fa3" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>` + vals.map((v, i) => `<circle cx="${X(i)}" cy="${y(v)}" r="4.5" fill="#fff" stroke="#ff8fa3" stroke-width="2.5"/>`).join(""), "line graph");
};
// pie chart: slices [{ name, e, part, label }] out of `whole` parts; label "?" hides a slice's share
const svgPieChart = (title, slices, whole) => {
  let a = -Math.PI / 2, s = "", leg = "";
  slices.forEach((c, i) => { const b = a + 2 * Math.PI * c.part / whole; s += `${wedge(80, 112, 70, a, b)} fill="${PASTEL[i % 6]}" stroke="${LINE}" stroke-width="2"/>`;
    const [tx, ty] = polar(80, 116, 44, (a + b) / 2); s += `<text x="${tx}" y="${ty}" font-size="15" text-anchor="middle">${c.e}</text>`; a = b;
    const ly = 58 + i * 30; leg += `<rect x="166" y="${ly - 11}" width="14" height="14" rx="4" fill="${PASTEL[i % 6]}" stroke="${LINE}"/><text x="186" y="${ly}" font-size="11" font-weight="800" fill="${INK}">${c.e} ${esc(c.name)}</text><text x="186" y="${ly + 13}" font-size="10.5" font-weight="900" fill="#ff6f91">${esc(c.label)}</text>`; });
  return cardSvg(300, 200, title, 20, s + leg, "pie chart");
};
/* 📐 geometry figures (MOE P5: unknown angles on a straight line, at a point, vertically opposite, in triangles,
   parallelograms, rhombuses and trapeziums). A figure is drawn to scale from points in maths coordinates (y up):
   { title, rot, segs: [[P, Q]], polys: [[P…]], dots: [P], ticks: [[P, Q, n]], arrows: [[P, Q, n]],
     angles: [{ v, a, b, t: "48°" | "x", right }] } — each angle is the smaller one at v between rays v→a and v→b. */
const vsub = (a, b) => [a[0] - b[0], a[1] - b[1]], vunit = v => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
const vat = (p, v, k) => [p[0] + v[0] * k, p[1] + v[1] * k], f1 = n => +n.toFixed(1), xy = p => `${f1(p[0])},${f1(p[1])}`;
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
/* degree trig kit (SOH-CAH-TOA Tower, Sine & Cosine Castle, Circle Secrets, Lighthouse Lookout, the to-scale figures): degrees ↔
   radians, sin / cos / tan of an angle in degrees, and a point turned about the origin by d degrees (anticlockwise, y up) */
const toRad = d => d * Math.PI / 180, toDeg = x => x * 180 / Math.PI;
const sinD = d => Math.sin(toRad(d)), cosD = d => Math.cos(toRad(d)), tanD = d => Math.tan(toRad(d));
const rotPt = (p, d) => { const a = toRad(d); return [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)]; };
const dirPt = (p, deg, k = 1) => vat(p, [cosD(deg), sinD(deg)], k);
const vdir = (a, b) => vunit(vsub(b, a)); // the unit vector from a towards b
/* angle marks, shared by the geometry figures (svgGeo, Scale-Model Studio triangles, Circle Secrets): */
// the turn from ray u1 to ray u2 (card pixels): t1 = u1's direction, d = signed turn in (-π, π], deg = its size in degrees
const angSweep = (u1, u2) => { const t1 = Math.atan2(u1[1], u1[0]); let d = Math.atan2(u2[1], u2[0]) - t1;
  while (d > Math.PI) d -= 2 * Math.PI; while (d <= -Math.PI) d += 2 * Math.PI; return { t1, d, deg: toDeg(Math.abs(d)) }; };
// the path of a filled angle wedge of radius r at V between unit rays u1 and u2 (d from angSweep)
const angWedge = (V, u1, u2, r, d) => `M${xy(V)} L${xy(vat(V, u1, r))} A${r},${r} 0 0,${d > 0 ? 1 : 0} ${xy(vat(V, u2, r))} Z`;
// a right-angle square of side k at V between unit rays u1 and u2
const rightPath = (V, u1, u2, k) => `M${xy(V)} L${xy(vat(V, u1, k))} L${xy(vat(vat(V, u1, k), u2, k))} L${xy(vat(V, u2, k))} Z`;
// an angle's label at (x, y): "x" (the unknown) big, pink and italic, a given angle in ink; attrs go first (class, data-t)
const angText = (t, x, y, big, small, attrs = "") => `<text${attrs} x="${f1(x)}" y="${f1(y)}" font-size="${t === "x" ? big : small}" text-anchor="middle" font-weight="900"${t === "x" ? ` font-style="italic" font-family="Georgia, serif" fill="#ff4f81"` : ` fill="${INK}"`} paint-order="stroke" stroke="#FFFDF8" stroke-width="3">${esc(t)}</text>`;
// fit points in maths coordinates (y up, turned rot degrees) into a box [left, top, width, height] at one scale, centred:
// returns S(p) → [px, py] on the card, with S.k = the scale (px per unit), so figures stay true to shape
const fitBox = (pts, box, rotDeg = 0) => {
  const turn = p => rotPt(p, rotDeg);
  const all = pts.map(turn), xs = all.map(p => p[0]), ys = all.map(p => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)], sc = Math.min(box[2] / (x1 - x0 || 1), box[3] / (y1 - y0 || 1));
  const S = p => { const q = turn(p); return [box[0] + (q[0] - x0) * sc + (box[2] - (x1 - x0) * sc) / 2, box[1] + (y1 - q[1]) * sc + (box[3] - (y1 - y0) * sc) / 2]; };
  S.k = sc; return S;
};
const svgGeo = (fig, label = "geometry figure") => {
  const W = 300, H = 214, S = fitBox([].concat(...(fig.segs || []), ...(fig.polys || []), fig.dots || []), [22, 34, 256, 166], fig.rot || 0);
  let back = "", lines = "", marks = "", text = "";
  (fig.polys || []).forEach((P, i) => { back += `<polygon points="${P.map(p => xy(S(p))).join(" ")}" fill="${PASTEL[(i + 1) % 6]}" fill-opacity=".45" stroke="none"/>`; P.forEach((p, k) => (fig.segs = fig.segs || []).push([p, P[(k + 1) % P.length]])); });
  (fig.angles || []).forEach(g => {
    const V = S(g.v), u1 = vdir(V, S(g.a)), u2 = vdir(V, S(g.b)), { t1, d, deg } = angSweep(u1, u2), x = g.t === "x", fill = x ? "#FFC9DA" : "#E2D6FF";
    if (g.right) back += `<path class="gang" data-t="90" d="${rightPath(V, u1, u2, 13)}" fill="${fill}" stroke="${LINE}" stroke-width="1.6"/>`;
    else { const r = deg < 45 ? 34 : deg < 70 ? 27 : 22;
      back += `<path class="gang" data-t="${esc(g.t)}" d="${angWedge(V, u1, u2, r, d)}" fill="${fill}" stroke="${x ? "#ff6f91" : LINE}" stroke-width="1.6"/>`;
      const m = t1 + d / 2, L = r + (deg < 45 ? 15 : 14), [tx, ty] = [V[0] + L * Math.cos(m), V[1] + L * Math.sin(m) + 4.5];
      if (g.t) text += angText(g.t, tx, ty, 15, 12.5); }
  });
  (fig.segs || []).forEach(([P, Q]) => { lines += `<line x1="${f1(S(P)[0])}" y1="${f1(S(P)[1])}" x2="${f1(S(Q)[0])}" y2="${f1(S(Q)[1])}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`; });
  const along = (P, Q, n, gap, draw) => { const A = S(P), B = S(Q), u = vunit(vsub(B, A)), nn = [-u[1], u[0]], M = mid(A, B); for (let i = 0; i < n; i++) draw(vat(M, u, (i - (n - 1) / 2) * gap), u, nn); };
  (fig.ticks || []).forEach(([P, Q, n]) => along(P, Q, n, 6, (c, u, nn) => { marks += `<line class="gtick" x1="${f1(c[0] + nn[0] * 6)}" y1="${f1(c[1] + nn[1] * 6)}" x2="${f1(c[0] - nn[0] * 6)}" y2="${f1(c[1] - nn[1] * 6)}" stroke="#ff6f91" stroke-width="2.4" stroke-linecap="round"/>`; }));
  (fig.arrows || []).forEach(([P, Q, n]) => along(P, Q, n, 9, (c, u, nn) => { const tip = vat(c, u, 4), bk = vat(tip, u, -8); marks += `<polyline class="garrow" points="${xy(vat(bk, nn, 5))} ${xy(tip)} ${xy(vat(bk, nn, -5))}" fill="none" stroke="#ff6f91" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`; }));
  (fig.dots || []).forEach(p => { marks += `<circle cx="${f1(S(p)[0])}" cy="${f1(S(p)[1])}" r="3.6" fill="${INK}"/>`; });
  return cardSvg(W, H, fig.title, 21, back + lines + marks + text, label, "mpic chart geo");
};
/* 📏 to-scale figure kit (Bakery Blueprints, Scale-Model Studio, Circle Secrets): a cream card with the figure fitted in at one
   scale, solid or dashed (hidden) edges, length labels the tests can read back, and right-angle marks */
// a 300-wide card with the figure fitted in; draw(S) gets the maths → card mapper (S.k = px per unit) and returns the SVG body
const figCard = (title, pts, draw, label, h = 206, cls = "mpic chart mens") => { const S = fitBox(pts, [40, 46, 220, h - 82]); return cardSvg(300, h, title, 20, draw(S), label, cls); };
const figShape = (P, fill) => `<polygon points="${P.map(xy).join(" ")}" fill="${fill}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
const figEdge = (a, b, dash) => `<line class="${dash ? "mhid" : "medge"}" x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${dash ? LINE : INK}" stroke-width="${dash ? 2 : 2.6}"${dash ? ` stroke-dasharray="5 4"` : ""} stroke-linecap="round"/>`;
// a length label (class mlab, data-t = its text, so tests can read the figure back) beside point p, nudged dx, dy pixels
const figLab = (p, t, dx = 0, dy = 0, anchor = "middle") => `<text class="mlab" data-t="${esc(t)}" x="${f1(p[0] + dx)}" y="${f1(p[1] + dy + 4)}" font-size="12.5" text-anchor="${anchor}" font-weight="900" fill="#c2457a" paint-order="stroke" stroke="#FFFDF8" stroke-width="3.5">${esc(t)}</text>`;
// a length label beside side AB (card pixels), pushed out to the side away from point F (Circle Secrets, Lighthouse Lookout)
const figLens = (A, B, t, F) => { const c = mid(A, B), u = vdir(A, B); let n = [-u[1], u[0]]; if (n[0] * (c[0] - F[0]) + n[1] * (c[1] - F[1]) < 0) n = [-n[0], -n[1]]; return figLab(c, t, n[0] * 17, n[1] * 13); };
// a lettered point (Lighthouse Lookout maps and lookouts, Circle Secrets, Venn Bubble Club): the dot (class cls, data-n = its
// letter, so tests read the figure back) and its letter, set gap pixels out along the unit vector o, haloed in cream
const figDot = (cls, n, p, r) => `<circle class="${cls}" data-n="${n}" cx="${f1(p[0])}" cy="${f1(p[1])}" r="${r}" fill="${INK}"/>`;
const figVtx = (p, o, t, gap = 14) => `<text class="mvtx" x="${f1(p[0] + o[0] * gap)}" y="${f1(p[1] + o[1] * gap + 4.5)}" font-size="13" text-anchor="middle" font-weight="900" fill="${INK}" paint-order="stroke" stroke="#FFFDF8" stroke-width="3">${t}</text>`;
// a small right-angle square at a foot point (card pixels), towards side sx (±1) and upwards
const figRight = (f, sx = -1) => `<path d="M${xy([f[0] + 9 * sx, f[1]])} L${xy([f[0] + 9 * sx, f[1] - 9])} L${xy([f[0], f[1] - 9])}" fill="none" stroke="${LINE}" stroke-width="1.6"/>`;
const coin = c => `<span class="mcoin c${c}">${c >= 100 ? "$" + c / 100 : c + "¢"}</span>`;
const emojiRows = (n, e) => { let s = ""; for (let i = 0; i < n; i += 5) s += `<div class="erow">${e.repeat(Math.min(5, n - i))}</div>`; return `<div class="mpic emojis">${s}</div>`; };
const table = (head, rows) => `<table class="mtable"><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;

/* ---------- worked-solution helpers ---------- */
const PL = ["ones", "tens", "hundreds", "thousands", "ten thousands"];
const colAdd = (a, b) => { const steps = []; const da = String(a).split("").reverse(), db = String(b).split("").reverse(); let carry = 0;
  for (let i = 0; i < Math.max(da.length, db.length); i++) { const x = +(da[i] || 0), y = +(db[i] || 0), s = x + y + carry;
    steps.push(`${PL[i] || "next"}: ${x} + ${y}${carry ? " + " + carry + " (carried)" : ""} = ${s}${s >= 10 ? ` → write ${s % 10}, carry 1` : ""}`); carry = s >= 10 ? 1 : 0; }
  if (carry) steps.push("write the final carried 1"); return steps; };
const colSub = (a, b) => { const steps = []; const da = String(a).split("").reverse().map(Number), db = String(b).split("").reverse().map(Number);
  for (let i = 0; i < da.length; i++) { let x = da[i]; const y = db[i] || 0; if (x < y) { let j = i + 1; while (da[j] === 0) { da[j] = 9; j++; } da[j]--; x += 10; steps.push(`${PL[i]}: ${x - 10} < ${y}, so regroup 1 from the next place → ${x} - ${y} = ${x - y}`); } else steps.push(`${PL[i]}: ${x} - ${y} = ${x - y}`); }
  return steps; };
M.longDivSteps = (n, d) => { const ds = String(n).split(""); let rem = 0, q = "", out = [];
  for (const c of ds) { const cur = rem * 10 + +c, k = Math.floor(cur / d); if (q.replace(/^0+/, "") || k) { out.push(`${cur} ÷ ${d} = ${k} remainder ${cur - k * d}${k ? ` (${k} × ${d} = ${k * d})` : ""}`); } q += k; rem = cur - k * d; }
  return { steps: out, q: +q, r: rem }; };
M.longMulSteps = (a, b) => { const bs = String(b).split("").reverse(); const out = []; let tot = 0;
  bs.forEach((c, i) => { const p = a * +c * Math.pow(10, i); tot += p; out.push(`$${a} \\times ${+c * Math.pow(10, i)} = ${p}$`); });
  if (bs.length > 1) out.push(`Add the parts: $${bs.map((c, i) => a * +c * Math.pow(10, i)).join(" + ")} = ${tot}$`); return out; };

/* ====================== TOPICS ====================== */
const TOPICS = [];
// opt.id keeps an old id when a topic moves to another grade (saves, crowns and stickers are keyed by id), and opt.was
// records the grade it came from (Grade Guardians keep counting it there). Read a topic's grade from t.grade, never from its id.
const topic = (grade, id, name, icon, desc, gen, opt = {}) => TOPICS.push(Object.assign({ grade, id: `g${grade}.${id}`, name, icon, desc, gen }, opt));
M._internal = { Q, num, mcq, mcqWhy, numWhy, T, NAMES, THINGS, COUNT_EMOJI, PASTEL, INK, LINE, esc, svgBox, cardSvg, tickAttr, xTicks, yUnit, xUnit, cellKey, figKey, hasCell, nearCells, gridPaper, gridSheet, gridCell, svgClock, pad2, hm, clockWords, h24, ampm, dur, SHAPES, svgShape, svgPie, picto, axes, svgBars, svgLine, svgPieChart, svgGeo, fitBox, toRad, toDeg, sinD, cosD, tanD, rotPt, dirPt, f1, xy, mid, vat, vdir, angSweep, angWedge, angText, rightPath, figCard, figShape, figEdge, figLab, figLens, figDot, figVtx, figRight, coin, emojiRows, table, colAdd, colSub, topic, TOPICS, gcd, lcm, rd, fmt, fdp, money, simp, fracTex, fracStr, mixedTex, sgn, poly, lin, paren, pm, undo, coef, ord, sum, asc, median, freqTotals, sqrtTex, surdTex, simpRad, matTex, matSvg, PLOT_BOX, plotFrame, svgPlane, svgParabola, ampPeriod, svgWave, svgStraight, diffPoly, evalPoly, svgCurve, svgTangent };
M.TOPICS = TOPICS;
M.topic = id => TOPICS.find(t => t.id === id);
M.gradeTopics = g => TOPICS.filter(t => t.grade === g);
M.GRADES = [
  [1, "Primary 1", "Button Meadow", "🌼"], [2, "Primary 2", "Gumdrop Bridge", "🍬"], [3, "Primary 3", "Abacus Orchard", "🍎"], [4, "Primary 4", "Fraction Fair", "🎡"],
  [5, "Primary 5", "Decimal Docks", "⛵"], [6, "Primary 6", "Ratio Riverboat", "🚣"], [7, "Secondary 1", "Integer Isles", "🏝️"], [8, "Secondary 2", "Algebra Archway", "🏛️"],
  [9, "Secondary 3", "Quadratic Quarry", "💠"], [10, "Secondary 4", "Trigon Towers", "🗼"], [11, "JC 1", "Function Falls", "⛲"], [12, "JC 2", "Calculus Crown", "👑"]
].map(([g, sg, name, emoji]) => ({ g, sg, name, emoji, label: `Grade ${g}` }));

/* generate one question for a topic; the seed makes it reproducible */
M.make = (topicId, seed) => {
  const t = M.topic(topicId); if (!t) throw new Error("no topic " + topicId);
  const q = t.gen(M.rng(seed));
  q.topic = topicId; q.seed = seed; q.grade = t.grade;
  return q;
};
// a short run of distinct questions (re-rolls duplicates by question text + answer, and also by q.uid for picture questions)
M.batch = (topicId, n, seed = M.seed()) => {
  const out = [], seen = new Set(); let s = seed >>> 0, tries = 0;
  while (out.length < n && tries < n * 30) { tries++; s = (Math.imul(s, 1103515245) + 12345) >>> 0; const q = M.make(topicId, s), ks = [q.q + "|" + q.a].concat(q.uid ? [q.uid] : []); if (ks.some(k => seen.has(k))) continue; ks.forEach(k => seen.add(k)); out.push(q); }
  return out;
};

/* ====================== ANSWER CHECKER ====================== */
// tolerant number parsing: 3/4, -1 1/2, 0.75, .5, −2, 1,000, 25%, $3.50, x = 4, 7 cm
M.parseNum = str => {
  if (str == null) return NaN;
  let s = String(str).trim().toLowerCase().replace(/[−–—]/g, "-").replace(/\s+/g, " ");
  s = s.replace(/^[a-zθ]\s*=\s*/, "").replace(/^s?\$\s*/, "");
  s = s.replace(/\s*(%|°|degrees?|cm²|cm³|m²|m³|cm\^?[23]|m\^?[23]|km\/h|cm|mm|km|kg|mℓ|ml|ℓ|l|g|m|h|hours?|days?|min(ute)?s?|s|cents?|¢|c|units?|coins?)$/, "");
  s = s.replace(/^\+/, "").replace(/^(-?)\$/, "$1").trim();
  if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, "");
  let m;
  if ((m = s.match(/^(-?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/))) { const v = +m[2] + +m[3] / +m[4]; return +m[4] ? (m[1] ? -v : v) : NaN; }
  if ((m = s.match(/^(-?\d*\.?\d+)\s*\/\s*(-?\d*\.?\d+)$/))) return +m[2] ? +m[1] / +m[2] : NaN;
  if (/^-?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/.test(s)) return +s;
  return NaN;
};
const close = (a, b, tol) => Math.abs(a - b) <= Math.max(tol, Math.abs(b) * 1e-9);
// the note for an answer: an mcq option's why / why-not, or a typed number that matches one of the question's known slips
M.whyNote = (q, input) => {
  if (q.kind === "mcq") return (q.why && q.why[input]) || "";
  if (!q.slips || !q.slips.length) return "";
  // pair / set slips are stored as "x, y" (or a list); match the typed parts, not a single parseNum
  if (q.kind === "pair" || q.kind === "set") {
    const split = s => String(s).replace(/[()]/g, "").replace(/[−–—]/g, "-").split(/\s*[,;]\s*|\s+and\s+|\s+or\s+/).filter(Boolean).map(M.parseNum);
    const parts = split(input); if (!parts.length || parts.some(isNaN)) return "";
    const s = q.slips.find(([x]) => {
      const want = split(x); if (want.length !== parts.length || want.some(isNaN)) return false;
      if (q.kind === "pair") return parts.length === 2 && close(parts[0], want[0], q.tol) && close(parts[1], want[1], q.tol);
      const left = want.slice(); for (const g of parts) { const i = left.findIndex(w => close(g, w, q.tol)); if (i < 0) return false; left.splice(i, 1); } return true;
    });
    return s ? s[1] : "";
  }
  const v = M.parseNum(input); if (isNaN(v)) return "";
  const s = q.slips.find(([x]) => close(v, x, q.tol)); return s ? s[1] : "";
};
M.check = (q, input) => {
  const raw = String(input == null ? "" : input).trim();
  if (!raw) return { ok: false, empty: true };
  switch (q.kind) {
    case "mcq": return { ok: raw === q.a };
    case "num": { const v = M.parseNum(raw); return { ok: !isNaN(v) && close(v, q.val, q.tol), parsed: v, bad: isNaN(v) }; }
    case "time": {
      const m = raw.replace(/\s/g, "").match(/^(\d{1,2})[:.h](\d{2})$/) || raw.match(/^(\d{1,2})\s*(?:o'?clock)?$/i);
      if (!m) return { ok: false, bad: true };
      const mins = (+m[1] % 12) * 60 + (m[2] ? +m[2] : 0); return { ok: mins % 720 === q.val % 720 };
    }
    case "time24": { // 24-hour clock: 19:05, 19.05, 1905 or 19 05 (hours 0–23); 9:05 is 09:05
      const m = raw.replace(/\s+/g, " ").match(/^(\d{1,2})\s?[:.h ]?\s?(\d{2})$/);
      if (!m || +m[1] > 23 || +m[2] > 59) return { ok: false, bad: true };
      return { ok: +m[1] * 60 + +m[2] === q.val };
    }
    case "rem": {
      const m = raw.toLowerCase().match(/^(\d+)\s*(?:r|rem|remainder)\.?\s*(\d+)$/);
      if (!m) { const v = M.parseNum(raw); return { ok: !isNaN(v) && q.val[1] === 0 && v === q.val[0], bad: isNaN(v) }; }
      return { ok: +m[1] === q.val[0] && +m[2] === q.val[1] };
    }
    case "ratio": {
      const ps = raw.split(/\s*[:∶]\s*/).map(Number); if (ps.length !== q.val.length || ps.some(isNaN)) return { ok: false, bad: true };
      return { ok: ps.every((x, i) => x === q.val[i]) };
    }
    case "pair": case "set": {
      const parts = raw.replace(/[()]/g, "").replace(/[−–—]/g, "-").split(/\s*[,;]\s*|\s+and\s+|\s+or\s+/).filter(Boolean).map(M.parseNum);
      if (!parts.length || parts.some(isNaN)) return { ok: false, bad: true };
      if (q.kind === "pair") return { ok: parts.length === 2 && close(parts[0], q.val[0], q.tol) && close(parts[1], q.val[1], q.tol) };
      const want = q.val.slice(); if (parts.length !== want.length) return { ok: false, count: true };
      for (const g of parts) { const i = want.findIndex(w => close(g, w, q.tol)); if (i < 0) return { ok: false }; want.splice(i, 1); }
      return { ok: true };
    }
  }
  return { ok: false };
};

/* ====================== TIMES-TABLE TOWER ====================== */
M.TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
// a fact is "a×b" (a = the table, b = 1..12); 56 ÷ 7 practises the fact 7×8
M.factKey = (a, b) => `${a}x${b}`;
M.factQ = (a, b, div) => div
  ? Q({ q: T(`${a * b} \\div ${a} = \\;?`), val: b, a: String(b), fact: M.factKey(a, b), hint: `Think: ${a} × ? = ${a * b}`, steps: [`${a} × ${b} = ${a * b}, so ${a * b} ÷ ${a} = ${b}`], data: { a, b, div: true } })
  : Q({ q: T(`${a} \\times ${b} = \\;?`), val: a * b, a: String(a * b), fact: M.factKey(a, b), hint: b > 5 ? `${a} × 5 = ${a * 5}, then add ${b - 5} more ${a}${b - 5 > 1 ? "s" : ""}` : `Count in ${a}s`, steps: [`${a} × ${b} = ${a * b}`], data: { a, b, div: false } });
// Leitner boxes: 0 = missed (due now), then 10 minutes, 1 day, 3 days, 7 days, 21 days. Box ≥ 3 counts as mastered.
M.BOX_MS = [0, 10 * 60e3, 864e5, 3 * 864e5, 7 * 864e5, 21 * 864e5];
M.MASTERED = 3;
M.gradeFact = (facts, key, ok, ms, now = Date.now()) => {
  const f = facts[key] || (facts[key] = { b: 0, r: 0, w: 0, d: 0, t: 0 });
  if (ok) { f.r++; f.b = Math.min(5, f.b + 1); } else { f.w++; f.b = 0; }
  f.d = now + M.BOX_MS[f.b]; if (ms) f.t = Math.round(ms); f.l = now; return f;
};
// next facts to practise: due/missed ones first (lowest box), then unseen ones, then the rest (soonest due first)
M.pickFacts = (facts, tables, n, r = M.rng(M.seed()), now = Date.now()) => {
  const all = []; for (const a of tables) for (let b = 1; b <= 12; b++) all.push([a, b]);
  const info = ([a, b]) => facts[M.factKey(a, b)];
  const due = r.shuffle(all.filter(x => info(x) && info(x).d <= now)).sort((x, y) => info(x).b - info(y).b);
  const unseen = r.shuffle(all.filter(x => !info(x)));
  const rest = r.shuffle(all.filter(x => info(x) && info(x).d > now)).sort((x, y) => info(x).d - info(y).d);
  return due.concat(unseen, rest).slice(0, n);
};
// harder challenge floors for the tower, by grade
M.CHALLENGES = [
  { id: "c2x1", name: "2-digit × 1-digit", grade: 3, icon: "🧱", gen: r => { const a = r.int(12, 99), b = r.int(2, 9), t = Math.floor(a / 10) * 10; return num(T(`${a} \\times ${b} = \\;?`), a * b, `Split ${a} into ${t} + ${a % 10}.`, [`$${t} \\times ${b} = ${t * b}$`, `$${a % 10} \\times ${b} = ${a % 10 * b}$`, `$${t * b} + ${a % 10 * b} = ${a * b}$`], { data: { a, b } }); } },
  { id: "cdivrem", name: "Division with remainders", grade: 3, icon: "🍰", gen: r => { const d = r.int(3, 12), q = r.int(3, 12), rm = r.int(0, d - 1), n = d * q + rm; return Q({ q: `${T(`${n} \\div ${d}`)} = ?${rm ? " (like 7 r 2)" : ""}`, kind: rm ? "rem" : "num", val: rm ? [q, rm] : q, a: rm ? `${q} r ${rm}` : String(q), keys: ["r"], hint: `What is the biggest multiple of ${d} up to ${n}?`, steps: [`${d} × ${q} = ${d * q}`, rm ? `${n} − ${d * q} = ${rm} left over → ${q} r ${rm}` : `No remainder → ${q}`], data: { n, d } }); } },
  { id: "clongmul", name: "Long multiplication", grade: 4, icon: "🏗️", gen: r => { const a = r.int(102, 999), b = r.int(12, 99); return num(T(`${a} \\times ${b} = \\;?`), a * b, "Ones digit first, then tens, then add.", M.longMulSteps(a, b), { data: { a, b } }); } },
  { id: "clongdiv", name: "Long division", grade: 4, icon: "🏰", gen: r => { const d = r.int(2, 12), n = r.int(100, 9999), L = M.longDivSteps(n, d), rm = n % d, qq = Math.floor(n / d); return Q({ q: `${T(`${n} \\div ${d}`)} = ?${rm ? " (like 123 r 4)" : ""}`, kind: rm ? "rem" : "num", val: rm ? [qq, rm] : qq, a: rm ? `${qq} r ${rm}` : String(qq), keys: ["r"], hint: "Divide, multiply, subtract, bring down.", steps: L.steps.concat([`Answer: ${qq}${rm ? " r " + rm : ""}`]), data: { n, d } }); } },
  { id: "cdecdiv", name: "Division with decimals", grade: 5, icon: "💧", gen: r => { const d = r.pick([2, 4, 5, 8]), n = r.int(11, 99), v = n / d; return num(`${T(`${n} \\div ${d}`)} = ? (as a decimal)`, v, `Keep dividing after the decimal point: write ${n} as ${n}.000`, [`${n} ÷ ${d} = ${Math.floor(v)} r ${n % d}`, `${n % d} ÷ ${d} = ${fmt(n % d / d)}`, `${n} ÷ ${d} = ${fmt(v)}`], { keys: ["."], data: { n, d } }); } },
  { id: "cdecmul", name: "Decimal × whole number", grade: 5, icon: "✨", gen: r => { const a = r.int(11, 999) / 100, b = r.int(2, 9), v = rd(a * b, 2); return num(T(`${fmt(a)} \\times ${b} = \\;?`), v, `Ignore the point: ${Math.round(a * 100)} × ${b}, then put 2 decimal places back.`, [`${Math.round(a * 100)} × ${b} = ${Math.round(a * 100) * b}`, `→ ${fmt(v)}`], { keys: ["."], data: { a, b } }); } }
];
M.challenge = id => M.CHALLENGES.find(c => c.id === id);
M.makeChallenge = (id, seed) => { const c = M.challenge(id), q = c.gen(M.rng(seed)); q.topic = "dojo." + id; q.seed = seed; return q; };

if (typeof module !== "undefined" && module.exports) module.exports = M; else root.MathGen = M;
})(typeof window !== "undefined" ? window : globalThis);
