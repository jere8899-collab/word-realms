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
const sgn = (c, first) => c < 0 ? (first ? "-" : " - ") : (first ? "" : " + ");
// polynomial in x from [[coef, power], ...] (highest first)
const poly = (terms, v = "x") => { let s = "", first = true; for (const [c, p] of terms) { if (!c) continue; const a = Math.abs(c);
  const co = (a === 1 && p !== 0) ? "" : fmt(a); s += sgn(c, first) + co + (p === 0 ? "" : p === 1 ? v : `${v}^{${p}}`); first = false; } return s || "0"; };
const lin = (a, b, v = "x") => poly([[a, 1], [b, 0]], v);
const paren = x => x < 0 ? `(${x})` : String(x);
// signed terms for worked steps: pm(-3) → "- 3", pm(3) → "+ 3"; undo(b) is the move that cancels "+ b" ("- b"; "- 0" for 0)
const pm = n => `${n < 0 ? "-" : "+"} ${Math.abs(n)}`;
const undo = n => `${n < 0 ? "+" : "-"} ${Math.abs(n)}`;
// a TeX coefficient in front of a letter or bracket: coef(1) → "", coef(-1) → "-", coef(3) → "3"
const coef = k => k === 1 ? "" : k === -1 ? "-" : String(k);
// ordinal words for "the 20th term", "the 3rd multiple" (11th–13th included)
const ord = k => k + (k % 100 >= 11 && k % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][k % 10] || "th");
M.util = { gcd, lcm, rd, fmt, fdp, simp, fracTex, fracStr, poly };

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
// gridlines + y-axis labels from 0 to max in steps; returns [svg, y(value)]
const axes = (x0, x1, top, bot, max, step) => {
  const y = v => +(bot - (bot - top) * v / max).toFixed(1); let s = "";
  for (let v = 0; v <= max; v += step) s += `<line x1="${x0}" y1="${y(v)}" x2="${x1}" y2="${y(v)}" stroke="${v ? "#EFE6FA" : "#b9a6cc"}" stroke-width="${v ? 1 : 2}"/><text x="${x0 - 5}" y="${y(v) + 3.5}" font-size="10" text-anchor="end" font-weight="800" fill="${INK}">${v}</text>`;
  return [s, y];
};
const chartBox = (title, unit, body, label) => cardSvg(300, 210, title, 17, `<text x="8" y="31" font-size="9" font-weight="800" fill="${LINE}">${esc(unit)}</text>${body}`, label);
// bar graph: cats [{ name, e }], vals, scale max + step
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
  return chartBox(title, unit, grid + xs.map((t, i) => `<line x1="${X(i)}" y1="${top}" x2="${X(i)}" y2="${bot}" stroke="#F5EFFB" stroke-width="1"/><text x="${X(i)}" y="${bot + 16}" font-size="9.5" text-anchor="middle" font-weight="800" fill="${INK}">${esc(t)}</text>`).join("") +
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
const dirPt = (p, deg, k = 1) => vat(p, [Math.cos(deg * Math.PI / 180), Math.sin(deg * Math.PI / 180)], k);
// fit points in maths coordinates (y up, turned rot degrees) into a box [left, top, width, height] at one scale, centred:
// returns S(p) → [px, py] on the card, with S.k = the scale (px per unit), so figures stay true to shape
const fitBox = (pts, box, rotDeg = 0) => {
  const rot = rotDeg * Math.PI / 180, turn = p => [p[0] * Math.cos(rot) - p[1] * Math.sin(rot), p[0] * Math.sin(rot) + p[1] * Math.cos(rot)];
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
    const V = S(g.v), u1 = vunit(vsub(S(g.a), V)), u2 = vunit(vsub(S(g.b), V)), t1 = Math.atan2(u1[1], u1[0]);
    let d = Math.atan2(u2[1], u2[0]) - t1; while (d > Math.PI) d -= 2 * Math.PI; while (d <= -Math.PI) d += 2 * Math.PI;
    const deg = Math.abs(d) * 180 / Math.PI, x = g.t === "x", fill = x ? "#FFC9DA" : "#E2D6FF";
    if (g.right) { const k = 13; back += `<path class="gang" data-t="90" d="M${xy(V)} L${xy(vat(V, u1, k))} L${xy(vat(vat(V, u1, k), u2, k))} L${xy(vat(V, u2, k))} Z" fill="${fill}" stroke="${LINE}" stroke-width="1.6"/>`; }
    else { const r = deg < 45 ? 34 : deg < 70 ? 27 : 22, p1 = vat(V, u1, r), p2 = vat(V, u2, r);
      back += `<path class="gang" data-t="${esc(g.t)}" d="M${xy(V)} L${xy(p1)} A${r},${r} 0 0,${d > 0 ? 1 : 0} ${xy(p2)} Z" fill="${fill}" stroke="${x ? "#ff6f91" : LINE}" stroke-width="1.6"/>`;
      const m = t1 + d / 2, L = r + (deg < 45 ? 15 : 14), [tx, ty] = [V[0] + L * Math.cos(m), V[1] + L * Math.sin(m) + 4.5];
      if (g.t) text += `<text x="${f1(tx)}" y="${f1(ty)}" font-size="${x ? 15 : 12.5}" text-anchor="middle" font-weight="900"${x ? ` font-style="italic" font-family="Georgia, serif" fill="#ff4f81"` : ` fill="${INK}"`} paint-order="stroke" stroke="#FFFDF8" stroke-width="3">${esc(g.t)}</text>`; }
  });
  (fig.segs || []).forEach(([P, Q]) => { lines += `<line x1="${f1(S(P)[0])}" y1="${f1(S(P)[1])}" x2="${f1(S(Q)[0])}" y2="${f1(S(Q)[1])}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`; });
  const along = (P, Q, n, gap, draw) => { const A = S(P), B = S(Q), u = vunit(vsub(B, A)), nn = [-u[1], u[0]], M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]; for (let i = 0; i < n; i++) draw(vat(M, u, (i - (n - 1) / 2) * gap), u, nn); };
  (fig.ticks || []).forEach(([P, Q, n]) => along(P, Q, n, 6, (c, u, nn) => { marks += `<line class="gtick" x1="${f1(c[0] + nn[0] * 6)}" y1="${f1(c[1] + nn[1] * 6)}" x2="${f1(c[0] - nn[0] * 6)}" y2="${f1(c[1] - nn[1] * 6)}" stroke="#ff6f91" stroke-width="2.4" stroke-linecap="round"/>`; }));
  (fig.arrows || []).forEach(([P, Q, n]) => along(P, Q, n, 9, (c, u, nn) => { const tip = vat(c, u, 4), bk = vat(tip, u, -8); marks += `<polyline class="garrow" points="${xy(vat(bk, nn, 5))} ${xy(tip)} ${xy(vat(bk, nn, -5))}" fill="none" stroke="#ff6f91" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`; }));
  (fig.dots || []).forEach(p => { marks += `<circle cx="${f1(S(p)[0])}" cy="${f1(S(p)[1])}" r="3.6" fill="${INK}"/>`; });
  return cardSvg(W, H, fig.title, 21, back + lines + marks + text, label, "mpic chart geo");
};
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
const topic = (grade, id, name, icon, desc, gen, opt = {}) => TOPICS.push(Object.assign({ grade, id: `g${grade}.${id}`, name, icon, desc, gen }, opt));
M._internal = { Q, num, mcq, mcqWhy, numWhy, T, NAMES, THINGS, COUNT_EMOJI, PASTEL, INK, LINE, esc, svgBox, cardSvg, cellKey, figKey, hasCell, nearCells, gridPaper, gridSheet, gridCell, svgClock, pad2, hm, clockWords, h24, ampm, dur, SHAPES, svgShape, svgPie, picto, svgBars, svgLine, svgPieChart, svgGeo, fitBox, dirPt, coin, emojiRows, table, colAdd, colSub, topic, TOPICS, gcd, lcm, rd, fmt, fdp, money, simp, fracTex, fracStr, mixedTex, sgn, poly, lin, paren, pm, undo, coef, ord };
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
