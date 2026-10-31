/* 🔢 Number Kingdom: seeded procedural maths generators for Grades 1–12 (Singapore MOE aligned: P1–P6 = G1–6,
   Sec 1–4 = G7–10, JC1–2 = G11–12), the answer checker and the Times-Table Tower fact helpers.
   Pure JS with no DOM, so it runs in the browser (window.MathGen) and in Node (require) for tests.
   A question: { topic, q, kind, val, a, tol, options, hint, steps[], pic, keys[], data }
   - q / options / hint / steps use $…$ for TeX (rendered with KaTeX, or a plain HTML fallback)
   - kind: num | mcq | set (any order) | pair (ordered) | rem (quotient r remainder) | time (h:mm) | ratio (a:b) */
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
M.util = { gcd, lcm, rd, fmt, fdp, simp, fracTex, fracStr, poly };

/* ---------- question builders ---------- */
const Q = o => Object.assign({ kind: "num", tol: 1e-9, keys: [], steps: [], hint: "", pic: "" }, o);
const num = (q, val, hint, steps, extra = {}) => Q(Object.assign({ q, val, a: extra.a || fmt(val), hint, steps }, extra));
// multiple choice: unique options, correct one included once; options are pre-shuffled with the seeded rng
const mcq = (r, q, correct, wrong, hint, steps, extra = {}) => {
  const opts = [correct]; for (const w of wrong) if (opts.length < 4 && !opts.includes(w)) opts.push(w);
  return Q(Object.assign({ q, kind: "mcq", options: r.shuffle(opts), a: correct, hint, steps }, extra));
};
const T = s => `$${s}$`; // inline TeX

/* ---------- fairytale flavour ---------- */
const NAMES = ["Princess Mira", "Prince Oli", "Little Red", "Goldilocks", "Fairy Pip", "Rapunzel", "Jack", "Puss in Boots", "the Frog King", "Snow White", "the Gingerbread Baker", "the Tooth Fairy", "Sumi the star fairy", "Aladdin", "Cinderella"];
const THINGS = [["star cookies", "🍪"], ["magic beans", "🫘"], ["glass slippers", "👠"], ["golden apples", "🍎"], ["fairy lanterns", "🏮"], ["dragon eggs", "🥚"], ["mushrooms", "🍄"], ["crystal gems", "💎"], ["cupcakes", "🧁"], ["carrots", "🥕"], ["candy canes", "🍬"], ["roses", "🌹"]];
const COUNT_EMOJI = ["🍓", "⭐", "🍄", "🦋", "🍎", "🌸", "🐟", "🧁", "💎", "🐣"];

/* ---------- SVG pictures (clock, shapes, fraction pies, coins, charts) ---------- */
// shared SVG bits: one <svg> wrapper, a point on a circle (radians, 1 d.p.) and a pie wedge
const svgBox = (body, label, w, h = w, vb = "0 0 120 120", cls = "mpic") => `<svg class="${cls}" viewBox="${vb}" width="${w}" height="${h}" role="img" aria-label="${label}">${body}</svg>`;
const polar = (cx, cy, r, a) => [(cx + r * Math.cos(a)).toFixed(1), (cy + r * Math.sin(a)).toFixed(1)];
const wedge = (cx, cy, r, a0, a1) => { const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1);
  return `<path d="M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${a1 - a0 > Math.PI + 1e-9 ? 1 : 0},1 ${x1},${y1} Z"`; };
const svgClock = (h, m) => {
  const ma = m * 6, ha = (h % 12) * 30 + m * 0.5, rad = a => (a - 90) * Math.PI / 180;
  const hand = (a, len, w, c) => { const [x, y] = polar(60, 60, len, rad(a)); return `<line x1="60" y1="60" x2="${x}" y2="${y}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`; };
  let nums = ""; for (let i = 1; i <= 12; i++) { const [x, y] = polar(60, 64, 42, rad(i * 30)); nums += `<text x="${x}" y="${y}" font-size="11" text-anchor="middle" font-weight="800" fill="#6d4f86">${i}</text>`; }
  let ticks = ""; for (let i = 0; i < 60; i++) { const a = rad(i * 6), [x1, y1] = polar(60, 60, i % 5 ? 53 : 50, a), [x2, y2] = polar(60, 60, 55, a); ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#c9b3ff" stroke-width="${i % 5 ? 1 : 2}"/>`; }
  return svgBox(`<circle cx="60" cy="60" r="57" fill="#FFF4C2" stroke="#FFB8D1" stroke-width="5"/>${ticks}${nums}${hand(ha, 27, 5, "#6d4f86")}${hand(ma, 40, 3, "#ff8fa3")}<circle cx="60" cy="60" r="4" fill="#6d4f86"/>`, "clock", 150, 150, undefined, "mpic clock");
};
const SHAPES = {
  triangle: { sides: 3, corners: 3, pts: "60,12 108,100 12,100" }, square: { sides: 4, corners: 4, pts: "18,18 102,18 102,102 18,102" },
  rectangle: { sides: 4, corners: 4, pts: "6,30 114,30 114,92 6,92" }, pentagon: { sides: 5, corners: 5, pts: "60,8 112,46 92,108 28,108 8,46" },
  hexagon: { sides: 6, corners: 6, pts: "34,10 86,10 112,60 86,110 34,110 8,60" }, circle: { sides: 0, corners: 0 }
};
const svgShape = (k, fill = "#C8F2DC") => svgBox(k === "circle" ? `<circle cx="60" cy="60" r="50" fill="${fill}" stroke="#9b84b0" stroke-width="4"/>` : `<polygon points="${SHAPES[k].pts}" fill="${fill}" stroke="#9b84b0" stroke-width="4" stroke-linejoin="round"/>`, "shape", 130);
const svgPie = (k, d) => {
  let s = ""; for (let i = 0; i < d; i++) { const a0 = i / d * 2 * Math.PI - Math.PI / 2, a1 = (i + 1) / d * 2 * Math.PI - Math.PI / 2;
    s += `${d === 1 ? `<circle cx="60" cy="60" r="52"` : wedge(60, 60, 52, a0, a1)} fill="${i < k ? "#FFB8D1" : "#FFF8EE"}" stroke="#9b84b0" stroke-width="3"/>`; }
  return svgBox(s, "fraction pie", 140);
};
/* charts for the data-analysis topics (MOE P1–P6: picture graphs, bar graphs, line graphs, pie charts).
   Values are drawn but never printed on the bars or points, so the child reads them off the scale. */
const PASTEL = ["#FFB8D1", "#BDE7FF", "#C8F2DC", "#E2D6FF", "#FFE7A8", "#FFD3B5"];
const INK = "#6d4f86";
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
// picture graph: rows [{ name, n, e }] (n pictures each), key text under it
const picto = (title, rows, key) => `<div class="mpic picto" role="img" aria-label="picture graph"><div class="ptitle">${esc(title)}</div>${rows.map(w => `<div class="prow"><span class="pname">${esc(w.name)}</span><span class="pics">${w.e.repeat(w.n) || "&nbsp;"}</span></div>`).join("")}<div class="pkey">${esc(key)}</div></div>`;
// gridlines + y-axis labels from 0 to max in steps; returns [svg, y(value)]
const axes = (x0, x1, top, bot, max, step) => {
  const y = v => +(bot - (bot - top) * v / max).toFixed(1); let s = "";
  for (let v = 0; v <= max; v += step) s += `<line x1="${x0}" y1="${y(v)}" x2="${x1}" y2="${y(v)}" stroke="${v ? "#EFE6FA" : "#b9a6cc"}" stroke-width="${v ? 1 : 2}"/><text x="${x0 - 5}" y="${y(v) + 3.5}" font-size="10" text-anchor="end" font-weight="800" fill="${INK}">${v}</text>`;
  return [s, y];
};
const chartBox = (title, unit, body, label) => svgBox(`<rect x="1" y="1" width="298" height="208" rx="14" fill="#FFFDF8" stroke="#F1E3F7" stroke-width="2"/><text x="150" y="17" font-size="12" text-anchor="middle" font-weight="900" fill="${INK}">${esc(title)}</text><text x="8" y="31" font-size="9" font-weight="800" fill="#9b84b0">${esc(unit)}</text>${body}`, label, 300, 210, "0 0 300 210", "mpic chart");
// bar graph: cats [{ name, e }], vals, scale max + step
const svgBars = (title, unit, cats, vals, max, step) => {
  const x0 = 36, x1 = 290, top = 38, bot = 170, [grid, y] = axes(x0, x1, top, bot, max, step), w = (x1 - x0) / cats.length;
  const bars = cats.map((c, i) => { const bx = +(x0 + w * i + w * 0.2).toFixed(1), bw = +(w * 0.6).toFixed(1), cx = +(x0 + w * (i + 0.5)).toFixed(1);
    return `<rect x="${bx}" y="${y(vals[i])}" width="${bw}" height="${+(bot - y(vals[i])).toFixed(1)}" rx="5" fill="${PASTEL[i % 6]}" stroke="#9b84b0" stroke-width="1.5"/><text x="${cx}" y="${bot + 16}" font-size="13" text-anchor="middle">${c.e}</text><text x="${cx}" y="${bot + 30}" font-size="9.5" text-anchor="middle" font-weight="800" fill="${INK}">${esc(c.name)}</text>`; }).join("");
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
  slices.forEach((c, i) => { const b = a + 2 * Math.PI * c.part / whole; s += `${wedge(80, 112, 70, a, b)} fill="${PASTEL[i % 6]}" stroke="#9b84b0" stroke-width="2"/>`;
    const [tx, ty] = polar(80, 116, 44, (a + b) / 2); s += `<text x="${tx}" y="${ty}" font-size="15" text-anchor="middle">${c.e}</text>`; a = b;
    const ly = 58 + i * 30; leg += `<rect x="166" y="${ly - 11}" width="14" height="14" rx="4" fill="${PASTEL[i % 6]}" stroke="#9b84b0"/><text x="186" y="${ly}" font-size="11" font-weight="800" fill="${INK}">${c.e} ${esc(c.name)}</text><text x="186" y="${ly + 13}" font-size="10.5" font-weight="900" fill="#ff6f91">${esc(c.label)}</text>`; });
  return svgBox(`<rect x="1" y="1" width="298" height="198" rx="14" fill="#FFFDF8" stroke="#F1E3F7" stroke-width="2"/><text x="150" y="20" font-size="12" text-anchor="middle" font-weight="900" fill="${INK}">${esc(title)}</text>${s}${leg}`, "pie chart", 300, 200, "0 0 300 200", "mpic chart");
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
M._internal = { Q, num, mcq, T, NAMES, THINGS, COUNT_EMOJI, svgBox, svgClock, SHAPES, svgShape, svgPie, picto, svgBars, svgLine, svgPieChart, coin, emojiRows, table, colAdd, colSub, topic, TOPICS, gcd, lcm, rd, fmt, fdp, money, simp, fracTex, fracStr, mixedTex, sgn, poly, lin, paren, pm, undo };
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
// a short run of distinct questions (re-rolls duplicates by question text + answer, or by q.uid for picture questions)
M.batch = (topicId, n, seed = M.seed()) => {
  const out = [], seen = new Set(); let s = seed >>> 0, tries = 0;
  while (out.length < n && tries < n * 30) { tries++; s = (Math.imul(s, 1103515245) + 12345) >>> 0; const q = M.make(topicId, s); const k = q.uid || q.q + "|" + q.a; if (seen.has(k)) continue; seen.add(k); out.push(q); }
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
