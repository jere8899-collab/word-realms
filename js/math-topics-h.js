/* 🔢 Number Kingdom topics, Grades 9–12 (Singapore Secondary 3–4, JC 1–2 / Years 10–13). */
(function () {
const M = (typeof module !== "undefined" && module.exports) ? require("./math-gen.js") : window.MathGen;
const { Q, num, mcq, T, topic, table, gcd, rd, fmt, fdp, fracTex, fracStr, poly, lin, paren, sgn, pm } = M._internal;
const sf3 = v => +(+v.toFixed(12)).toPrecision(3);
const tol3 = v => Math.max(1e-9, Math.pow(10, Math.floor(Math.log10(Math.abs(v) || 1)) - 2) * 0.51);
const V2 = v => `\\begin{pmatrix} ${v[0]} \\\\ ${v[1]} \\end{pmatrix}`, V3 = v => `\\begin{pmatrix} ${v[0]} \\\\ ${v[1]} \\\\ ${v[2]} \\end{pmatrix}`;

/* ---------- Grade 9 (Secondary 3) ---------- */
topic(9, "quad", "Quadratic Quarry", "💠", "Solve by factorising (type both: 2, -3)", r => {
  const p = r.int(-9, 9), q = r.int(-9, 9);
  if (r.chance(.2)) { const P = r.nz(-4, 4) * 2 + 1; // (2x − P)(x − q) = 0 → x = P/2 or q
    const B = -(2 * q + P), C = P * q, e = poly([[2, 2], [B, 1], [C, 0]]), roots = [P / 2, q];
    return Q({ q: `Solve ${T(`${e} = 0`)} (type both solutions, like 2, -3)`, kind: "set", val: roots, a: `${fmt(P / 2)}, ${q}`, keys: ["-", ",", ".", "/"], hint: "Factorise into two brackets, then set each bracket to 0.", steps: [`$${e} = (${lin(2, -P)})(${lin(1, -q)}) = 0$`, `$x = ${fracTex(P, 2)}$ or $x = ${q}$`], data: { a: 2, b: B, c: C } }); }
  const B = -(p + q), C = p * q, e = poly([[1, 2], [B, 1], [C, 0]]), roots = p === q ? [p] : [p, q];
  return Q({ q: `Solve ${T(`${e} = 0`)} (type all solutions, like 2, -3)`, kind: "set", val: roots, a: roots.join(", "), keys: ["-", ","], hint: `Find two numbers that multiply to ${C} and add to ${B}.`,
    steps: [`$${e} = (${lin(1, -p)})(${lin(1, -q)}) = 0$`, p === q ? `Repeated root: $x = ${p}$` : `So $x = ${p}$ or $x = ${q}$`], data: { a: 1, b: B, c: C } });
});
topic(9, "simul", "Twin Potions", "👯", "Simultaneous equations (type x, y)", r => {
  const x = r.int(-6, 8), y = r.int(-6, 8); let a = r.nz(-5, 5), b = r.nz(-5, 5), c = r.nz(-5, 5), d = r.nz(-5, 5); while (a * d - b * c === 0) d = r.nz(-5, 5);
  const e1 = a * x + b * y, e2 = c * x + d * y, L = (p, q) => `${poly([[p, 1]], "x")} ${q < 0 ? "-" : "+"} ${poly([[Math.abs(q), 1]], "y")}`;
  return Q({ q: `Solve: ${T(`${L(a, b)} = ${e1}`)} and ${T(`${L(c, d)} = ${e2}`)} (type x, y like 3, -2)`, kind: "pair", val: [x, y], a: `${x}, ${y}`, keys: ["-", ","],
    hint: "Make the x coefficients match, then subtract the equations to eliminate x.", steps: [`Multiply the first equation by ${paren(c)} and the second by ${paren(a)}.`, `Subtract: $${a * d - b * c}y = ${a * e2 - c * e1}$ → $y = ${y}$`, `Substitute back: $x = ${x}$`], data: { a, b, c, d, e1, e2 } });
});
topic(9, "indices", "Index Incantations", "⚡", "Laws of indices", r => {
  const t = r.int(0, 3), m = r.int(2, 9), n = r.int(2, 9), b = r.pick(["a", "x", "y", "p"]);
  if (t === 0) return num(`${T(`${b}^{${m}} \\times ${b}^{${n}} = ${b}^{k}`)}. Find k.`, m + n, "Multiplying → add the powers.", [`$${b}^{${m}+${n}} = ${b}^{${m + n}}$`]);
  if (t === 1) return num(`${T(`(${b}^{${m}})^{${n}} = ${b}^{k}`)}. Find k.`, m * n, "Power of a power → multiply the powers.", [`$${b}^{${m}\\times${n}} = ${b}^{${m * n}}$`]);
  if (t === 2) { const base = r.pick([2, 3, 4, 5, 10]), k = r.int(1, 3), P = Math.pow(base, k); return Q({ q: `Evaluate ${T(`${base}^{-${k}}`)} (as a fraction)`, val: 1 / P, a: `1/${P}`, keys: ["/"], hint: "A negative power means 1 over the positive power.", steps: [`$${base}^{-${k}} = \\frac{1}{${base}^{${k}}} = \\frac{1}{${P}}$`], data: { base, k } }); }
  const [rt, root, pw] = r.pick([[2, 3, 2], [3, 3, 2], [2, 4, 3], [2, 2, 3], [3, 2, 3], [5, 2, 3], [2, 5, 2], [4, 3, 2], [4, 2, 3], [3, 4, 3]]), base = Math.pow(rt, root), v = Math.pow(rt, pw);
  return num(`Evaluate ${T(`${base}^{\\frac{${pw}}{${root}}}`)}`, v, `Take the ${root === 2 ? "square" : root === 3 ? "cube" : root + "th"} root first, then raise to the power ${pw}.`, [`$\\sqrt[${root}]{${base}} = ${rt}$`, `$${rt}^{${pw}} = ${v}$`], { data: { base, root, pw } });
});
topic(9, "stdform", "Standard Form Stars", "🌌", "Numbers in standard form", r => {
  if (r.chance(.5)) { const m = r.int(11, 99) / 10, e = r.nz(-6, 8), v = +(m * Math.pow(10, e)).toPrecision(2);
    return num(`${T(fmt(v))} = ${T(`${fmt(m)} \\times 10^{n}`)}. Find n.`, e, "Count how many places the decimal point moves.", [`Moving the point ${Math.abs(e)} place${Math.abs(e) > 1 ? "s" : ""} ${e > 0 ? "left" : "right"} gives ${fmt(m)}, so n = ${e}`], { keys: ["-"], data: { m, e } }); }
  const a = r.int(2, 4), b = r.int(1, 2), p = r.int(2, 7), q = r.int(2, 7), right = `${a * b} \\times 10^{${p + q}}`;
  return mcq(r, `Calculate ${T(`(${a} \\times 10^{${p}}) \\times (${b} \\times 10^{${q}})`)}`, T(right), [`${a * b} \\times 10^{${p * q}}`, `${a + b} \\times 10^{${p + q}}`, `${a * b} \\times 10^{${p + q + 1}}`, `${a * b} \\times 10^{${p + q - 1}}`].filter(w => w !== right).map(T), "Multiply the numbers, add the powers of 10.", [`$${a} \\times ${b} = ${a * b}$`, `$10^{${p}} \\times 10^{${q}} = 10^{${p + q}}$`]);
});
topic(9, "trig", "SOH-CAH-TOA Tower", "🗼", "Trigonometry in right triangles", r => {
  const ang = r.int(15, 75), side = r.int(3, 20), t = r.int(0, 3), R = ang * Math.PI / 180;
  if (t === 3) { const o = r.int(2, 15), a2 = r.int(2, 15), th = Math.atan(o / a2) * 180 / Math.PI; return num(`In a right-angled triangle the side opposite θ is ${o} cm and the side adjacent to θ is ${a2} cm. Find θ in degrees (1 d.p.).`, rd(th, 1), "tan θ = opposite ÷ adjacent", [`$\\tan\\theta = \\frac{${o}}{${a2}}$`, `$\\theta = \\tan^{-1}\\left(\\frac{${o}}{${a2}}\\right) \\approx ${rd(th, 1).toFixed(1)}^\\circ$`], { a: rd(th, 1).toFixed(1), keys: ["."], tol: 0.051, data: { o, a2, t } }); }
  const [fn, given, want, v, form] = [["\\sin", "hypotenuse", "opposite", side * Math.sin(R), `\\text{opp} = ${side}\\sin ${ang}^\\circ`], ["\\cos", "hypotenuse", "adjacent to", side * Math.cos(R), `\\text{adj} = ${side}\\cos ${ang}^\\circ`], ["\\tan", "adjacent side", "opposite", side * Math.tan(R), `\\text{opp} = ${side}\\tan ${ang}^\\circ`]][t];
  return num(`A right-angled triangle has an angle of ${ang}° and the ${given} is ${side} cm. Find the side ${want} the ${ang}° angle (1 d.p.).`, rd(v, 1), `Use ${fn === "\\sin" ? "SOH" : fn === "\\cos" ? "CAH" : "TOA"}.`, [`$${form}$`, `$\\approx ${rd(v, 1).toFixed(1)}$ cm`], { a: rd(v, 1).toFixed(1), keys: ["."], tol: 0.051, data: { ang, side, t } });
});
topic(9, "coord", "Treasure-Map Coordinates", "🗺️", "Distance and midpoint", r => {
  const x1 = r.int(-8, 8), y1 = r.int(-8, 8);
  if (r.chance(.5)) { const tr = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 6, 10], [4, 3, 5], [12, 5, 13]]), x2 = x1 + r.pick([1, -1]) * tr[0], y2 = y1 + r.pick([1, -1]) * tr[1];
    return num(`Find the distance between ${T(`(${x1}, ${y1})`)} and ${T(`(${x2}, ${y2})`)}.`, tr[2], "d = √((x₂ − x₁)² + (y₂ − y₁)²)", [`$d = \\sqrt{${paren(x2 - x1)}^2 + ${paren(y2 - y1)}^2} = \\sqrt{${tr[2] * tr[2]}} = ${tr[2]}$`], { data: { x1, y1, x2, y2 } }); }
  const x2 = x1 + 2 * r.int(-5, 5), y2 = y1 + 2 * r.int(-5, 5), mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return Q({ q: `Find the midpoint of ${T(`(${x1}, ${y1})`)} and ${T(`(${x2}, ${y2})`)}. (type x, y)`, kind: "pair", val: [mx, my], a: `${mx}, ${my}`, keys: ["-", ","], hint: "Average the x's, average the y's.", steps: [`$x = \\frac{${x1} + ${paren(x2)}}{2} = ${mx}$`, `$y = \\frac{${y1} + ${paren(y2)}}{2} = ${my}$`], data: { x1, y1, x2, y2 } });
});
topic(9, "ineq", "Inequality Gates", "🚪", "Solve linear inequalities", r => {
  const a = r.nz(-5, 6), b = r.int(-10, 10), x = r.nz(-6, 8), c = a * x + b, op = r.pick(["<", ">", "\\le", "\\ge"]), flip = { "<": ">", ">": "<", "\\le": "\\ge", "\\ge": "\\le" }, fin = a < 0 ? flip[op] : op;
  const right = `x ${fin} ${x}`;
  return mcq(r, `Solve ${T(`${lin(a, b)} ${op} ${c}`)}`, T(right), [`x ${flip[fin]} ${x}`, `x ${fin} ${-x}`, `x ${fin} ${x + 1}`, `x ${flip[fin]} ${-x}`].filter(w => w !== right).map(T), "Solve like an equation — but if you divide by a negative, flip the sign!", [`$${poly([[a, 1]])} ${op} ${c - b}$`, a < 0 ? `Divide by ${a} (negative) → flip: $${right}$` : `Divide by ${a}: $${right}$`], { data: { a, b, c, op } });
});
topic(9, "story", "Royal Challenges", "📜", "Quadratic word problems", r => {
  const w = r.int(3, 15), d = r.int(1, 8), l = w + d;
  return num(`A rectangular royal rug is ${d} m longer than it is wide. Its area is ${w * l} m². How wide is it in m?`, w, `Let the width be x: x(x + ${d}) = ${w * l}.`, [`$x^2 + ${d}x - ${w * l} = 0$`, `$(x - ${w})(x + ${l}) = 0$`, `Width can't be negative, so $x = ${w}$ m`], { data: { w, d } });
}, { story: true });

/* ---------- Grade 10 (Secondary 4) ---------- */
topic(10, "quadf", "Quadratic Formula", "🧿", "Roots to 2 d.p. (type both: 1.23, -4.56)", r => {
  let a, b, c, D; do { a = r.nz(-3, 4); b = r.int(-9, 9); c = r.int(-9, 9); D = b * b - 4 * a * c; } while (D <= 0 || Number.isInteger(Math.sqrt(D)));
  const roots = [(-b + Math.sqrt(D)) / (2 * a), (-b - Math.sqrt(D)) / (2 * a)].map(x => rd(x, 2));
  return Q({ q: `Solve ${T(`${poly([[a, 2], [b, 1], [c, 0]])} = 0`)}, giving answers to 2 d.p.`, kind: "set", val: roots, a: roots.map(x => x.toFixed(2)).join(", "), tol: 0.0051, keys: ["-", ".", ","],
    hint: "x = (−b ± √(b² − 4ac)) ÷ 2a", steps: [`$a = ${a},\\ b = ${b},\\ c = ${c}$`, `$b^2 - 4ac = ${D}$`, `$x = \\frac{${-b} \\pm \\sqrt{${D}}}{${2 * a}}$`, `$x \\approx ${roots[0].toFixed(2)}$ or $x \\approx ${roots[1].toFixed(2)}$`], data: { a, b, c } });
});
topic(10, "sinecos", "Sine & Cosine Castle", "🏯", "Non-right triangles (1 d.p.)", r => {
  if (r.chance(.5)) { const b = r.int(4, 15), c = r.int(4, 15), A = r.int(30, 120), a = Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(A * Math.PI / 180));
    return num(`In triangle ABC, b = ${b} cm, c = ${c} cm and angle A = ${A}°. Find a (1 d.p.).`, rd(a, 1), "Cosine rule: a² = b² + c² − 2bc cos A", [`$a^2 = ${b}^2 + ${c}^2 - 2(${b})(${c})\\cos ${A}^\\circ$`, `$a^2 \\approx ${fdp(a * a, 2)}$`, `$a \\approx ${rd(a, 1).toFixed(1)}$ cm`], { a: rd(a, 1).toFixed(1), keys: ["."], tol: 0.051, data: { b, c, A, rule: "cos" } }); }
  const A = r.int(30, 80), B = r.int(30, 150 - A), a = r.int(5, 15), b = a * Math.sin(B * Math.PI / 180) / Math.sin(A * Math.PI / 180);
  return num(`In triangle ABC, angle A = ${A}°, angle B = ${B}° and a = ${a} cm. Find b (1 d.p.).`, rd(b, 1), "Sine rule: a / sin A = b / sin B", [`$b = \\frac{${a}\\sin ${B}^\\circ}{\\sin ${A}^\\circ}$`, `$b \\approx ${rd(b, 1).toFixed(1)}$ cm`], { a: rd(b, 1).toFixed(1), keys: ["."], tol: 0.051, data: { A, B, a, rule: "sin" } });
});
topic(10, "prob2", "Two-Draw Treasure", "💰", "Combined probability", r => {
  const g = r.int(2, 7), s = r.int(2, 7), n = g + s, repl = r.chance(.5), both = r.pick(["gold", "silver"]), k = both === "gold" ? g : s;
  const n1 = repl ? k * k : k * (k - 1), den = repl ? n * n : n * (n - 1);
  return Q({ q: `A chest has ${g} gold and ${s} silver coins. Two coins are taken ${repl ? "with replacement" : "without replacement"}. Find P(both ${both}). (fraction)`, val: n1 / den, a: fracStr(n1, den), keys: ["/"], hint: repl ? "The coin goes back → the second draw is just like the first." : `Without replacement → one fewer coin (and one fewer ${both}) for the second draw.`,
    steps: [`$P = \\frac{${k}}{${n}} \\times \\frac{${repl ? k : k - 1}}{${repl ? n : n - 1}} = ${fracTex(n1, den)}$`], data: { g, s, repl, both } });
});
topic(10, "freq", "Frequency Fair", "🎪", "Mean from a frequency table", r => {
  const x0 = r.int(0, 2), xs = [0, 1, 2, 3, 4].map(x => x + x0), fs = xs.map(() => r.int(1, 9)), N = fs.reduce((a, b) => a + b, 0), S = xs.reduce((a, x, i) => a + x * fs[i], 0);
  return num(`The table shows how many wishes each villager made. Find the mean number of wishes (2 d.p.).`, rd(S / N, 2), "Mean = Σ(f × x) ÷ Σf", [`$\\Sigma fx = ${xs.map((x, i) => `${x} \\times ${fs[i]}`).join(" + ")} = ${S}$`, `$\\Sigma f = ${N}$`, `Mean $= ${S} \\div ${N} \\approx ${fdp(S / N, 2)}$`], { a: fdp(S / N, 2), keys: ["."], tol: 0.0051, pic: table(["Wishes (x)", ...xs], [["Villagers (f)", ...fs]]), data: { xs, fs } });
});
topic(10, "sector", "Slice of the Moon", "🌙", "Arc length and sector area", r => {
  const R = r.int(3, 15), th = r.pick([30, 40, 45, 60, 72, 90, 120, 135, 150]), area = r.chance(.5), v = area ? th / 360 * Math.PI * R * R : th / 360 * 2 * Math.PI * R;
  return num(`A slice of moon-cake is a sector with radius ${R} cm and angle ${th}°. Find its ${area ? "area in cm²" : "arc length in cm"} (2 d.p.).`, rd(v, 2), area ? "Sector area = (θ/360) × πr²" : "Arc length = (θ/360) × 2πr", [area ? `$\\frac{${th}}{360} \\times \\pi \\times ${R}^2 \\approx ${fdp(v, 2)}$` : `$\\frac{${th}}{360} \\times 2\\pi \\times ${R} \\approx ${fdp(v, 2)}$`], { a: fdp(v, 2), keys: ["."], tol: 0.0051, data: { R, th, area } });
});
topic(10, "vectors", "Arrow Vectors", "➡️", "Column vectors and magnitude", r => {
  if (r.chance(.5)) { const tr = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]), v = [tr[0] * r.pick([1, -1]), tr[1] * r.pick([1, -1])]; return num(`Find the magnitude of ${T(V2(v))}.`, tr[2], "|v| = √(x² + y²)", [`$\\sqrt{${paren(v[0])}^2 + ${paren(v[1])}^2} = \\sqrt{${tr[2] * tr[2]}} = ${tr[2]}$`], { data: { v } }); }
  const a = [r.int(-6, 6), r.int(-6, 6)], b = [r.int(-6, 6), r.int(-6, 6)], k = r.int(2, 3), res = [k * a[0] + b[0], k * a[1] + b[1]];
  return Q({ q: `${T(`\\mathbf{a} = ${V2(a)},\\ \\mathbf{b} = ${V2(b)}`)}. Find ${T(`${k}\\mathbf{a} + \\mathbf{b}`)} (type top, bottom).`, kind: "pair", val: res, a: res.join(", "), keys: ["-", ","], hint: `Multiply each part of a by ${k}, then add b part by part.`, steps: [`$${k}\\mathbf{a} = ${V2([k * a[0], k * a[1]])}$`, `$${k}\\mathbf{a} + \\mathbf{b} = ${V2(res)}$`], data: { a, b, k } });
});
topic(10, "interest", "Dragon Gold Interest", "🐉", "Compound interest", r => {
  const P = r.int(5, 50) * 100, rate = r.pick([2, 2.5, 3, 4, 5, 6]), n = r.int(2, 6), v = P * Math.pow(1 + rate / 100, n);
  return num(`A dragon deposits $${P} in the Goblin Bank at ${rate}% compound interest per year. How much is there after ${n} years? (nearest cent)`, rd(v, 2), "Amount = P(1 + r/100)ⁿ", [`$${P}\\left(1 + \\frac{${rate}}{100}\\right)^{${n}} \\approx ${fdp(v, 2)}$`], { a: fdp(v, 2), keys: ["."], tol: 0.0051, data: { P, rate, n } });
});
topic(10, "story", "Royal Challenges", "📜", "O-Level style applications", r => {
  const w = r.int(2, 12), x = r.int(1, 4);
  return num(`A square garden of side ${w} m has a path of equal width x m added all around it. The total area becomes ${(w + 2 * x) ** 2} m². Find x.`, x, `(${w} + 2x)² = ${(w + 2 * x) ** 2}. Take the square root of both sides.`, [`$${w} + 2x = \\sqrt{${(w + 2 * x) ** 2}} = ${w + 2 * x}$`, `$2x = ${2 * x}$, so $x = ${x}$`], { data: { w, x } });
}, { story: true });

/* ---------- Grade 11 (JC 1 / Year 12) ---------- */
topic(11, "func", "Function Fountains", "⛲", "Composite and inverse functions", r => {
  const a = r.nz(-4, 5), b = r.int(-6, 6), c = r.int(-5, 5), k = r.int(-4, 4), t = r.int(0, 2), f = `f(x) = ${lin(a, b)}`, g = `g(x) = ${poly([[1, 2], [c, 0]])}`;
  if (t === 0) return num(`${T(f)} and ${T(g)}. Find ${T(`fg(${k})`)}.`, a * (k * k + c) + b, "fg(x) means apply g first, then f.", [`$g(${k}) = ${k * k + c}$`, `$f(${k * k + c}) = ${a}(${k * k + c}) ${pm(b)} = ${a * (k * k + c) + b}$`], { keys: ["-"], data: { a, b, c, k, t } });
  if (t === 1) return num(`${T(f)} and ${T(g)}. Find ${T(`gf(${k})`)}.`, (a * k + b) ** 2 + c, "gf(x) means apply f first, then g.", [`$f(${k}) = ${a * k + b}$`, `$g(${a * k + b}) = ${paren(a * k + b)}^2 ${pm(c)} = ${(a * k + b) ** 2 + c}$`], { keys: ["-"], data: { a, b, c, k, t } });
  const y = a * k + b; return num(`${T(f)}. Find ${T(`f^{-1}(${y})`)}.`, k, `Solve f(x) = ${y} for x.`, [`$${lin(a, b)} = ${y}$`, `$x = \\frac{${y} - ${paren(b)}}{${a}} = ${k}$`], { keys: ["-"], data: { a, b, c, k, t } });
});
topic(11, "explog", "Log Lagoon", "🪷", "Exponentials and logarithms", r => {
  const t = r.int(0, 3), base = r.pick([2, 3, 5, 10]), k = r.int(-2, 5);
  if (t === 0) { const P = Math.pow(base, k), Ptex = k < 0 ? `\\frac{1}{${Math.pow(base, -k)}}` : String(P); return num(`Solve ${T(`${base}^{x} = ${Ptex}`)}`, k, `Write ${T(Ptex)} as a power of ${base}.`, [`$${Ptex} = ${base}^{${k}}$`, `$x = ${k}$`], { keys: ["-"], data: { base, k, t } }); }
  if (t === 1) { const m = r.int(1, 5), n = r.int(1, 5); return num(`Evaluate ${T(`\\log_{${base}} ${Math.pow(base, m)} + \\log_{${base}} ${Math.pow(base, n)}`)}`, m + n, "Evaluate each log separately (or use log a + log b = log ab).", [`$\\log_{${base}} ${Math.pow(base, m)} = ${m}$, $\\log_{${base}} ${Math.pow(base, n)} = ${n}$`, `Sum = ${m + n}`], { data: { base, m, n, t } }); }
  if (t === 2) { const B = r.pick([2, 3, 5, 7]); let N = r.int(3, 60); while (Number.isInteger(+(Math.log(N) / Math.log(B)).toFixed(9))) N++; const v = Math.log(N) / Math.log(B);
    return num(`Solve ${T(`${B}^{x} = ${N}`)}, giving x to 3 s.f.`, sf3(v), "Take logs: x = ln N ÷ ln B.", [`$x = \\frac{\\ln ${N}}{\\ln ${B}} \\approx ${sf3(v)}$`], { a: String(sf3(v)), keys: ["."], tol: tol3(v), data: { B, N, t } }); }
  const p = r.int(2, 5), q = r.int(2, 4); return num(`Given ${T(`\\log_{a} x = ${p}`)}, find ${T(`\\log_{a} x^{${q}}`)}.`, p * q, "log(xⁿ) = n log x", [`$\\log_a x^{${q}} = ${q} \\log_a x = ${q} \\times ${p} = ${p * q}$`]);
});
topic(11, "diff", "Derivative Dragons", "🐲", "Differentiate polynomials", r => {
  const deg = r.int(2, 4), cs = Array.from({ length: deg + 1 }, (_, i) => i === 0 ? r.nz(-4, 5) : r.int(-6, 6)), x0 = r.int(-3, 3);
  const terms = cs.map((c, i) => [c, deg - i]), d = terms.filter(([, p]) => p > 0).map(([c, p]) => [c * p, p - 1]), val = d.reduce((s, [c, p]) => s + c * Math.pow(x0, p), 0);
  if (r.chance(.5)) return num(`Find the gradient of ${T(`y = ${poly(terms)}`)} at ${T(`x = ${x0}`)}.`, val, "Differentiate (bring the power down, reduce it by 1), then substitute.", [`$\\frac{dy}{dx} = ${poly(d)}$`, `At $x = ${x0}$: $\\frac{dy}{dx} = ${val}$`], { keys: ["-"], data: { terms, x0 } });
  const right = poly(d), wrong = [poly(terms.filter(([, p]) => p > 0).map(([c, p]) => [c, p - 1])), poly(terms.map(([c, p]) => [c * p, p])), poly(d.map(([c, p]) => [c, p + 1])), poly(terms.filter(([, p]) => p > 0).map(([c, p]) => [c * (p - 1), p - 1])), poly(d.map(([c, p]) => [-c, p]))].filter(w => w !== right);
  return mcq(r, `Differentiate ${T(`y = ${poly(terms)}`)}`, T(`\\frac{dy}{dx} = ${right}`), wrong.map(w => T(`\\frac{dy}{dx} = ${w}`)), "d/dx (a xⁿ) = n a xⁿ⁻¹; constants disappear.", terms.filter(([c]) => c).map(([c, p]) => `$${poly([[c, p]])} \\to ${p ? poly([[c * p, p - 1]]) : "0"}$`), { data: { terms } });
});
topic(11, "stationary", "Hilltop Stationary Points", "🏔️", "Where the gradient is zero", r => {
  if (r.chance(.5)) { const a = r.nz(-3, 3), h = r.int(-6, 6), k = r.int(-9, 9), b = -2 * a * h, c = a * h * h + k;
    return num(`Find the x-coordinate of the stationary point of ${T(`y = ${poly([[a, 2], [b, 1], [c, 0]])}`)}.`, h, "Set dy/dx = 0.", [`$\\frac{dy}{dx} = ${poly([[2 * a, 1], [b, 0]])} = 0$`, `$x = ${h}$`], { keys: ["-"], data: { terms: [[a, 2], [b, 1], [c, 0]] } }); }
  const p = r.int(-4, 4), q = r.int(p + 1, 5), B = -3 * (p + q), C = 6 * p * q; // y = 2x³ − 3(p+q)x² + 6pq·x → y' = 6(x − p)(x − q)
  return Q({ q: `Find the x-coordinates of the stationary points of ${T(`y = ${poly([[2, 3], [B, 2], [C, 1]])}`)} (type both).`, kind: "set", val: [p, q], a: `${p}, ${q}`, keys: ["-", ","], hint: "Differentiate, set to 0, factorise.", steps: [`$\\frac{dy}{dx} = ${poly([[6, 2], [2 * B, 1], [C, 0]])} = 6(${lin(1, -p)})(${lin(1, -q)})$`, `$x = ${p}$ or $x = ${q}$`], data: { terms: [[2, 3], [B, 2], [C, 1]] } });
});
topic(11, "ap", "Arithmetic Avenue", "🪜", "Arithmetic progressions", r => {
  const a = r.int(-10, 20), d = r.nz(-5, 8), n = r.int(6, 30);
  if (r.chance(.5)) return num(`An arithmetic sequence starts ${a}, ${a + d}, ${a + 2 * d}, … Find the ${n}th term.`, a + (n - 1) * d, "uₙ = a + (n − 1)d", [`$a = ${a},\\ d = ${d}$`, `$u_{${n}} = ${a} + ${n - 1}(${d}) = ${a + (n - 1) * d}$`], { keys: ["-"], data: { a, d, n, f: "term" } });
  return num(`Find the sum of the first ${n} terms of ${a}, ${a + d}, ${a + 2 * d}, …`, n / 2 * (2 * a + (n - 1) * d), "Sₙ = n/2 [2a + (n − 1)d]", [`$S_{${n}} = \\frac{${n}}{2}[2(${a}) + ${n - 1}(${d})] = ${n / 2 * (2 * a + (n - 1) * d)}$`], { keys: ["-"], data: { a, d, n, f: "sum" } });
});
topic(11, "gp", "Geometric Garden", "🌻", "Geometric progressions", r => {
  const t = r.int(0, 2);
  if (t === 0) { const a = r.int(1, 6), q = r.pick([2, 3, -2]), n = r.int(4, 8); return num(`A geometric sequence starts ${a}, ${a * q}, ${a * q * q}, … Find the ${n}th term.`, a * Math.pow(q, n - 1), "uₙ = a rⁿ⁻¹", [`$r = ${q}$`, `$u_{${n}} = ${a} \\times ${paren(q)}^{${n - 1}} = ${a * Math.pow(q, n - 1)}$`], { keys: ["-"], data: { a, q, n, t } }); }
  if (t === 1) { const a = r.int(1, 5), q = r.pick([2, 3]), n = r.int(4, 8); return num(`Find the sum of the first ${n} terms of ${a}, ${a * q}, ${a * q * q}, …`, a * (Math.pow(q, n) - 1) / (q - 1), "Sₙ = a(rⁿ − 1) ÷ (r − 1)", [`$S_{${n}} = \\frac{${a}(${q}^{${n}} - 1)}{${q} - 1} = ${a * (Math.pow(q, n) - 1) / (q - 1)}$`], { data: { a, q, n, t } }); }
  const a = r.int(2, 24), [pn, pd] = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [-1, 2], [2, 5]]);
  return Q({ q: `A magic beanstalk grows ${a} m on day 1, and each day it grows ${T(fracTex(pn, pd))} as much as the day before. Find the sum to infinity ${T("S_\\infty")} (fraction or decimal).`, val: a / (1 - pn / pd), a: fracStr(a * pd, pd - pn), keys: ["/", ".", "-"], hint: "S∞ = a ÷ (1 − r), valid when |r| < 1.", steps: [`$S_\\infty = \\frac{${a}}{1 - ${pn < 0 ? `\\left(${fracTex(pn, pd)}\\right)` : fracTex(pn, pd)}} = ${fracTex(a * pd, pd - pn)}$`], data: { a, pn, pd, t } });
});
topic(11, "vec3", "Star Vectors", "🌠", "3D vectors: dot product, magnitude, angle", r => {
  const a = [r.int(-5, 5), r.int(-5, 5), r.nz(-5, 5)], b = [r.nz(-5, 5), r.int(-5, 5), r.int(-5, 5)];
  const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2], ma = Math.hypot(...a), mb = Math.hypot(...b), t = r.int(0, 2), sq = v => v[0] ** 2 + v[1] ** 2 + v[2] ** 2;
  if (t === 0) return num(`Find ${T(`\\mathbf{a} \\cdot \\mathbf{b}`)} for ${T(`\\mathbf{a} = ${V3(a)},\\ \\mathbf{b} = ${V3(b)}`)}.`, dot, "Multiply matching components and add.", [`$${a.map((x, i) => `${paren(x)}(${b[i]})`).join(" + ")} = ${dot}$`], { keys: ["-"], data: { a, b, t } });
  if (t === 1) return num(`Find ${T("|\\mathbf{a}|")} for ${T(`\\mathbf{a} = ${V3(a)}`)} (3 s.f.).`, sf3(ma), "|a| = √(x² + y² + z²)", [`$\\sqrt{${a.map(x => paren(x) + "^2").join(" + ")}} = \\sqrt{${sq(a)}} \\approx ${sf3(ma)}$`], { a: String(sf3(ma)), keys: ["."], tol: tol3(ma), data: { a, b, t } });
  const ang = Math.acos(Math.max(-1, Math.min(1, dot / (ma * mb)))) * 180 / Math.PI;
  return num(`Find the angle between ${T(`\\mathbf{a} = ${V3(a)}`)} and ${T(`\\mathbf{b} = ${V3(b)}`)} in degrees (1 d.p.).`, rd(ang, 1), "cos θ = a·b ÷ (|a||b|)", [`$\\mathbf{a}\\cdot\\mathbf{b} = ${dot}$, $|\\mathbf{a}| = \\sqrt{${sq(a)}}$, $|\\mathbf{b}| = \\sqrt{${sq(b)}}$`, `$\\theta = \\cos^{-1}\\left(\\frac{${dot}}{\\sqrt{${sq(a)}}\\sqrt{${sq(b)}}}\\right) \\approx ${rd(ang, 1).toFixed(1)}^\\circ$`], { a: rd(ang, 1).toFixed(1), keys: ["."], tol: 0.051, data: { a, b, t } });
});
topic(11, "story", "Royal Challenges", "📜", "Modelling with exponentials", r => {
  const P = r.int(2, 9) * 100, g = r.pick([5, 8, 10, 12, 20]), T2 = r.int(2, 4) * P, n = Math.floor(Math.log(T2 / P) / Math.log(1 + g / 100)) + 1;
  return num(`A colony of fairy fireflies has ${P} members and grows by ${g}% each night. After how many whole nights will it first exceed ${T2}?`, n, "Solve P(1 + g/100)ⁿ > target using logs, then round UP to a whole night.", [`$${P}(${fmt(1 + g / 100)})^n > ${T2}$`, `$n > \\frac{\\ln ${T2 / P}}{\\ln ${fmt(1 + g / 100)}} \\approx ${fdp(Math.log(T2 / P) / Math.log(1 + g / 100), 3)}$`, `Smallest whole n = ${n}`], { data: { P, g, T2 } });
}, { story: true });

/* ---------- Grade 12 (JC 2 / Year 13) ---------- */
topic(12, "integ", "Integral Island", "🏝️", "Definite integrals of polynomials", r => {
  const deg = r.int(1, 3), terms = Array.from({ length: deg + 1 }, (_, i) => [(i === 0 ? r.nz(-3, 4) : r.int(-4, 4)) * (deg + 1 - i), deg - i]);
  const a = r.int(-2, 1), b = r.int(a + 1, 3), F = x => terms.reduce((s, [c, p]) => s + c * Math.pow(x, p + 1) / (p + 1), 0), v = F(b) - F(a);
  return num(`Evaluate ${T(`\\int_{${a}}^{${b}} \\left(${poly(terms)}\\right)\\,dx`)}`, rd(v, 9), "Integrate (raise the power by 1, divide by the new power), then F(upper) − F(lower).", [`$\\left[${poly(terms.map(([c, p]) => [c / (p + 1), p + 1]))}\\right]_{${a}}^{${b}}$`, `$= ${fmt(F(b))} - ${paren(+fmt(F(a)))} = ${fmt(v)}$`], { keys: ["-", ".", "/"], tol: 1e-6, data: { terms, a, b } });
});
topic(12, "chain", "Chain-Rule Charms", "⛓️", "Chain and product rule at a point", r => {
  const t = r.int(0, 2);
  if (t === 0) { const a = r.nz(-3, 3), b = r.int(-4, 4), n = r.int(2, 5), x0 = r.int(-2, 2), v = n * a * Math.pow(a * x0 + b, n - 1);
    return num(`Given ${T(`y = (${lin(a, b)})^{${n}}`)}, find ${T("\\frac{dy}{dx}")} at ${T(`x = ${x0}`)}.`, v, "Chain rule: d/dx (ax + b)ⁿ = n(ax + b)ⁿ⁻¹ × a", [`$\\frac{dy}{dx} = ${n}(${lin(a, b)})^{${n - 1}} \\times ${paren(a)}$`, `At $x = ${x0}$: $${n} \\times ${paren(a * x0 + b)}^{${n - 1}} \\times ${paren(a)} = ${v}$`], { keys: ["-"], data: { a, b, n, x0, t } }); }
  if (t === 1) { const k = r.nz(-3, 3), m = r.int(1, 3), val = Math.exp(k) * (m + k);
    if (m + k === 0) return num(`Given ${T(`y = x^{${m}}e^{${k}x}`)}, find ${T("\\frac{dy}{dx}")} at ${T("x = 1")}.`, 0, "Product rule: u'v + uv'", [`$\\frac{dy}{dx} = e^{${k}x}(${m}x^{${m - 1}} + ${paren(k)}x^{${m}})$`, `At x = 1: $e^{${k}}(${m} + ${paren(k)}) = 0$`], { keys: ["-", "."], data: { k, m, t } });
    return num(`Given ${T(`y = x^{${m}}e^{${k}x}`)}, find ${T("\\frac{dy}{dx}")} at ${T("x = 1")} (3 s.f.).`, sf3(val), "Product rule: u'v + uv'", [`$\\frac{dy}{dx} = e^{${k}x}(${m === 1 ? "1" : m + "x^{" + (m - 1) + "}"} + ${paren(k)}x^{${m}})$`, `At x = 1: $e^{${k}}(${m} + ${paren(k)}) \\approx ${sf3(val)}$`], { a: String(sf3(val)), keys: ["-", "."], tol: tol3(val), data: { k, m, t } }); }
  const a = r.pick([1, 2, 3, 4]), [x0, xt] = r.pick([[0, "0"], [Math.PI / 6, "\\frac{\\pi}{6}"], [Math.PI / 4, "\\frac{\\pi}{4}"], [Math.PI / 3, "\\frac{\\pi}{3}"], [Math.PI / 2, "\\frac{\\pi}{2}"]]), val = +(a * Math.cos(a * x0)).toFixed(12), A = a === 1 ? "" : a;
  return num(`Given ${T(`y = \\sin ${A}x`)}, find ${T("\\frac{dy}{dx}")} at ${T(`x = ${xt}`)} (3 s.f.).`, val === 0 ? 0 : sf3(val), "d/dx sin(ax) = a cos(ax)", [`$\\frac{dy}{dx} = ${A}\\cos ${A}x$`, `$= ${a}\\cos\\left(${A}${A ? "\\cdot" : ""}${xt}\\right) \\approx ${val === 0 ? 0 : sf3(val)}$`], { a: String(val === 0 ? 0 : sf3(val)), keys: ["-", "."], tol: Math.max(0.0051, tol3(val)), data: { a, x0, t } });
});
topic(12, "area", "Area Under the Rainbow", "🌈", "Area between a curve and the x-axis", r => {
  const p = r.int(-4, 2), q = r.int(p + 1, 5), A = Math.pow(q - p, 3) / 6, e = poly([[-1, 2], [p + q, 1], [-p * q, 0]]); // y = −(x − p)(x − q)
  return Q({ q: `The rainbow follows ${T(`y = ${e}`)}. Find the area between the curve and the x-axis (fraction or 3 s.f.).`, val: A, a: fracStr(Math.pow(q - p, 3), 6), keys: ["/", "."], tol: tol3(A),
    hint: "Find where it crosses the x-axis, then integrate between those x-values.", steps: [`Roots: $x = ${p}$ and $x = ${q}$`, `$\\int_{${p}}^{${q}} \\left(${e}\\right)dx = \\frac{(${q} - ${paren(p)})^3}{6} = ${fracTex(Math.pow(q - p, 3), 6)}$`], data: { p, q } });
});
topic(12, "binom", "Binomial Bakery", "🥐", "Binomial probabilities (3 s.f.)", r => {
  const n = r.int(4, 12), [pn, pd] = r.pick([[1, 2], [1, 3], [1, 4], [2, 5], [1, 5], [3, 10], [1, 6]]), p = pn / pd, k = Math.min(n, Math.max(0, Math.round(n * p) + r.int(-2, 2)));
  const C = (n, k) => { let c = 1; for (let i = 1; i <= k; i++) c = c * (n - k + i) / i; return Math.round(c); }, v = C(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  return num(`Each croissant has a ${T(fracTex(pn, pd))} chance of hiding a golden raisin. In a box of ${n}, X is the number with a raisin. Find P(X = ${k}) to 3 s.f.`, sf3(v), "X ~ B(n, p): P(X = k) = ⁿCₖ pᵏ (1 − p)ⁿ⁻ᵏ", [`$P(X = ${k}) = \\binom{${n}}{${k}} \\left(${fracTex(pn, pd)}\\right)^{${k}} \\left(${fracTex(pd - pn, pd)}\\right)^{${n - k}}$`, `$= ${C(n, k)} \\times ${fmt(rd(Math.pow(p, k), 6))} \\times ${fmt(rd(Math.pow(1 - p, n - k), 6))} \\approx ${sf3(v)}$`], { a: String(sf3(v)), keys: ["."], tol: tol3(v), data: { n, k, pn, pd } });
});
const Z = (x, y) => `${x}${y < 0 ? " - " : " + "}${Math.abs(y) === 1 ? "" : Math.abs(y)}i`;
topic(12, "complex", "Complex Crystal Ball", "🔮", "Complex numbers", r => {
  const a = r.int(-6, 6), b = r.nz(-6, 6), c = r.int(-5, 5), d = r.nz(-5, 5), t = r.int(0, 2);
  if (t === 0) { const tr = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]]), x = tr[0] * r.pick([1, -1]), y = tr[1] * r.pick([1, -1]); return num(`Find ${T(`|${Z(x, y)}|`)}.`, tr[2], "|a + bi| = √(a² + b²)", [`$\\sqrt{${paren(x)}^2 + ${paren(y)}^2} = ${tr[2]}$`], { data: { x, y, t } }); }
  if (t === 1) return Q({ q: `Calculate ${T(`(${Z(a, b)})(${Z(c, d)})`)}. Type the real part, then the imaginary part (like 7, -3).`, kind: "pair", val: [a * c - b * d, a * d + b * c], a: `${a * c - b * d}, ${a * d + b * c}`, keys: ["-", ","], hint: "Expand like brackets and remember i² = −1.",
    steps: [`$= ${a * c}${sgn(a * d)}${Math.abs(a * d)}i${sgn(b * c)}${Math.abs(b * c)}i${sgn(b * d)}${Math.abs(b * d)}i^2$`, `$= ${Z(a * c - b * d, a * d + b * c)}$`], data: { a, b, c, d, t } });
  const B = -2 * a, C2 = a * a + b * b;
  return Q({ q: `Solve ${T(`z^2 ${poly([[B, 1], [C2, 0]], "z").replace(/^(?!-)/, "+ ").replace(/^-/, "- ")} = 0`)}. Type the real part and the positive imaginary part of the roots (like 2, 3).`, kind: "pair", val: [a, Math.abs(b)], a: `${a}, ${Math.abs(b)}`, keys: ["-", ","], hint: "Use the quadratic formula; the discriminant is negative.", steps: [`$z = \\frac{${-B} \\pm \\sqrt{${B * B} - ${4 * C2}}}{2} = ${a} \\pm ${Math.abs(b)}i$`], data: { B, C: C2, t } });
});
topic(12, "sigma", "Sigma Spellbook", "📕", "Series and Σ notation", r => {
  const t = r.int(0, 2), n = r.int(5, 30);
  if (t === 0) return num(`Evaluate ${T(`\\sum_{r=1}^{${n}} r`)}`, n * (n + 1) / 2, "Σr = n(n + 1)/2", [`$\\frac{${n}(${n + 1})}{2} = ${n * (n + 1) / 2}$`], { data: { f: [0, 1], m: n } });
  if (t === 1) { const m = r.int(5, 15); return num(`Evaluate ${T(`\\sum_{r=1}^{${m}} r^2`)}`, m * (m + 1) * (2 * m + 1) / 6, "Σr² = n(n + 1)(2n + 1)/6", [`$\\frac{${m}(${m + 1})(${2 * m + 1})}{6} = ${m * (m + 1) * (2 * m + 1) / 6}$`], { data: { f: [0, 0, 1], m } }); }
  const a = r.int(1, 5), b = r.nz(-3, 6), m = r.int(5, 20), v = a * m * (m + 1) / 2 + b * m;
  return num(`Evaluate ${T(`\\sum_{r=1}^{${m}} (${lin(a, b, "r")})`)}`, v, "Split it: a·Σr + Σb", [`$${a}\\cdot\\frac{${m}(${m + 1})}{2} ${pm(b)}(${m}) = ${v}$`], { keys: ["-"], data: { f: [b, a], m } });
});
topic(12, "expcalc", "Euler's Enchanted Forest", "🌲", "Calculus with e and ln", r => {
  const t = r.int(0, 2);
  if (t === 0) { const k = r.int(1, 4); return num(`Evaluate ${T(`\\int_{1}^{e^{${k}}} \\frac{1}{x}\\,dx`)}`, k, "∫ 1/x dx = ln|x|", [`$[\\ln x]_1^{e^{${k}}} = ${k} - 0 = ${k}$`]); }
  if (t === 1) { const a = r.int(2, 6), k = r.int(2, 5), x0 = r.pick([1, 2, 4]); return num(`Given ${T(`y = ${a}\\ln(${k}x)`)}, find ${T("\\frac{dy}{dx}")} at ${T(`x = ${x0}`)}.`, a / x0, "d/dx ln(kx) = 1/x (the k disappears!)", [`$\\frac{dy}{dx} = \\frac{${a}}{x}$`, `At x = ${x0}: ${fmt(a / x0)}`], { keys: [".", "/"], data: { a, k, x0 } }); }
  const k = r.pick([1, 2, 3]), v = (Math.exp(k) - 1) / k;
  return num(`Evaluate ${T(`\\int_{0}^{1} e^{${k === 1 ? "" : k}x}\\,dx`)} (3 s.f.)`, sf3(v), "∫ e^{kx} dx = e^{kx}/k", [`$\\left[\\frac{e^{${k}x}}{${k}}\\right]_0^1 = \\frac{e^{${k}} - 1}{${k}} \\approx ${sf3(v)}$`], { a: String(sf3(v)), keys: ["."], tol: tol3(v), data: { k } });
});
topic(12, "story", "Royal Challenges", "📜", "Optimisation in the kingdom", r => {
  const P = r.int(2, 15) * 4;
  return num(`The royal gardener has ${P} m of fencing for a rectangular rose bed against the castle wall (the wall is one side, so only 3 sides need fence). What is the largest possible area in m²?`, P * P / 8, "Let the width be x; area A = x(P − 2x). Differentiate and set to 0.", [`$A = x(${P} - 2x) = ${P}x - 2x^2$`, `$\\frac{dA}{dx} = ${P} - 4x = 0 \\Rightarrow x = ${P / 4}$`, `$A = ${P / 4} \\times ${P / 2} = ${P * P / 8}$ m²`], { data: { P } });
}, { story: true });
})();
