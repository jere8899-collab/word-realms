/* 🔢 Number Kingdom topics, Grades 5–8 (Singapore Primary 5–6, Secondary 1–2). */
(function () {
const M = (typeof module !== "undefined" && module.exports) ? require("./math-gen.js") : window.MathGen;
const { Q, num, mcq, mcqWhy, numWhy, T, topic, PASTEL, INK, LINE, esc, svgBox, fitBox, cellKey, figKey, hasCell, nearCells, gridSheet, svgPieChart, svgGeo, cardSvg, sinD, cosD, tanD, rotPt, dirPt, f1, xy, mid, vdir, angSweep, angWedge, angText, figCard, figShape, figEdge, figLab, figRight, gcd, lcm, rd, fmt, fdp, simp, fracTex, fracStr, mixedTex, poly, lin, paren, pm, undo, coef, ord, sum, asc, median, svgStraight } = M._internal;

/* ---------- Grade 5 (Primary 5) ---------- */
topic(5, "fracmul", "Fraction Spells", "✨", "Multiply fractions", r => {
  const a = r.int(1, 8), b = r.int(a + 1, 9), c = r.int(1, 8), d = r.int(c + 1, 10), w = r.int(2, 12);
  if (r.chance(.35)) return Q({ q: `${T(`\\frac{${a}}{${b}} \\times ${w}`)} = ? (fraction or mixed number)`, val: a * w / b, a: fracStr(a * w, b), keys: ["/"], hint: "Multiply the top number by the whole number.", steps: [`$\\frac{${a} \\times ${w}}{${b}} = \\frac{${a * w}}{${b}} = ${mixedTex(a * w, b)}$`], data: { a, b, w } });
  return Q({ q: `${T(`\\frac{${a}}{${b}} \\times \\frac{${c}}{${d}}`)} = ? (simplest form, like 3/10)`, val: a * c / (b * d), a: fracStr(a * c, b * d), keys: ["/"], hint: "Top × top, bottom × bottom, then simplify.", steps: [`$\\frac{${a} \\times ${c}}{${b} \\times ${d}} = \\frac{${a * c}}{${b * d}}${gcd(a * c, b * d) > 1 ? " = " + fracTex(a * c, b * d) : ""}$`], data: { a, b, c, d } });
});
topic(5, "dec10", "Decimal Shifts", "↔️", "× and ÷ by 10, 100, 1000", r => {
  const x = r.int(1, 99999) / Math.pow(10, r.int(1, 3)), p = r.pick([10, 100, 1000]), mul = r.chance(.5), v = +fmt(mul ? x * p : x / p), z = String(p).length - 1;
  return num(T(`${fmt(x)} ${mul ? "\\times" : "\\div"} ${p} = \\;?`), v, `${mul ? "Multiplying" : "Dividing"} by ${p} moves every digit ${z} place${z > 1 ? "s" : ""} to the ${mul ? "left" : "right"} (the number gets ${mul ? "bigger" : "smaller"}).`, [`Move the digits ${z} place${z > 1 ? "s" : ""} → ${fmt(v)}`], { keys: ["."], data: { x, p, mul } });
});
topic(5, "percent", "Percent Potions", "💯", "Percentages of amounts", r => {
  const t = r.int(0, 2);
  if (t === 0) { const p = r.pick([10, 20, 25, 30, 40, 50, 60, 75, 5, 15]), n = r.int(2, 30) * 20; return num(`What is ${p}% of ${n}?`, p * n / 100, "Find 10% (÷ 10) first, then scale.", [`10% of ${n} = ${n / 10}`, `${p}% = ${fmt(p / 10)} × ${n / 10} = ${fmt(p * n / 100)}`], { keys: ["."], data: { p, n } }); }
  if (t === 1) { const [a, b] = r.pick([[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [1, 10], [7, 10], [3, 20], [9, 25], [1, 20]]); return num(`Write ${T(`\\frac{${a}}{${b}}`)} as a percentage.`, a / b * 100, "Make the bottom number 100.", [`$\\frac{${a}}{${b}} = \\frac{${a * 100 / b}}{100} = ${a * 100 / b}\\%$`]); }
  const tot = r.pick([20, 25, 40, 50]), part = r.int(1, tot - 1); return num(`${part} out of ${tot} fairies wear blue. What percentage wear blue?`, part / tot * 100, "Fraction × 100%.", [`$\\frac{${part}}{${tot}} \\times 100\\% = ${fmt(part / tot * 100)}\\%$`], { keys: ["."] });
});
topic(5, "ratio", "Ratio Recipes", "⚖️", "Simplify and use ratios (type 2:3)", r => {
  if (r.chance(.6)) { let a = r.int(1, 9), b = r.int(1, 9); if (a === b) b++; const k = r.int(2, 9), [x, y] = simp(a, b), g = gcd(a * k, b * k);
    return Q({ q: `Write the ratio ${a * k} : ${b * k} in its simplest form (type like 2:3).`, kind: "ratio", val: [x, y], a: `${x}:${y}`, keys: [":"], hint: "Divide both numbers by their highest common factor.", steps: [`HCF of ${a * k} and ${b * k} is ${g}.`, `${a * k} ÷ ${g} : ${b * k} ÷ ${g} = ${x} : ${y}`], data: { a: a * k, b: b * k } }); }
  const a = r.int(1, 5), b = r.int(1, 5), k = r.int(2, 9); return num(`A potion uses rose water and moon dew in the ratio ${a} : ${b}. With ${a * k} cups of rose water, how many cups of moon dew are needed?`, b * k, `${a} part${a > 1 ? "s" : ""} → ${a * k} cups, so 1 part = ${k} cups.`, [`1 part = ${a * k} ÷ ${a} = ${k}`, `${b} part${b > 1 ? "s" : ""} = ${b} × ${k} = ${b * k} cups`], { viz: { type: "bar", tip: "Each block is 1 part. Find 1 part first.", max: Math.max(a, b), rows: [{ name: "rose water", parts: Array.from({ length: a }, () => ({ v: 1, t: "", fill: "#FFB8D1" })), braces: [{ from: 0, to: a, t: `${a * k} cups` }] }, { name: "moon dew", parts: Array.from({ length: b }, () => ({ v: 1, t: "", fill: "#BDEFD3" })), braces: [{ from: 0, to: b, t: "?", rt: `${b * k} cups`, q: 1, below: 1 }] }] } });
});
topic(5, "triangle", "Triangle Tents", "⛺", "Area of triangles", r => {
  const b = r.int(2, 20), h = r.int(2, 18);
  return num(`A triangular tent flap has a base of ${b} cm and a height of ${h} cm. What is its area in cm²?`, b * h / 2, "Area of a triangle = ½ × base × height.", [`$\\frac{1}{2} \\times ${b} \\times ${h} = ${fmt(b * h / 2)}$ cm²`], { keys: ["."], data: { b, h } });
});
/* ---------- 🔎 Angle Detectives (MOE P5 geometry: angles on a straight line, at a point and vertically opposite;
   angle sum and properties of triangles (isosceles, equilateral, right-angled); parallelogram, rhombus, trapezium).
   Every figure is drawn to scale; the unknown angle is marked x and only the given angles carry numbers. ---------- */
const dg = d => `${d}°`;
// n whole-number angles between lo and hi that add up to total
const splitAngles = (r, n, total, lo, hi) => { for (let k = 0; k < 500; k++) { const a = Array.from({ length: n - 1 }, () => r.int(lo, hi)), last = total - a.reduce((x, y) => x + y, 0); if (last >= lo && last <= hi) return r.shuffle(a.concat(last)); } return Array.from({ length: n }, (_, i) => i < n - 1 ? Math.floor(total / n) : total - Math.floor(total / n) * (n - 1)); };
// a triangle with base angles A (left) and B (right), base 1 long
// (kept as B × (π/180), not sinD: the last-bit rounding differs, and an exact 45° mark would change size)
const triPts = (A, B) => { const C = 180 - A - B, rad = Math.PI / 180; return [[0, 0], [1, 0], dirPt([0, 0], A, Math.sin(B * rad) / Math.sin(C * rad))]; };
// the angle at corner i of a polygon (between its two neighbours)
const corner = (P, i, t, right) => ({ v: P[i], a: P[(i + P.length - 1) % P.length], b: P[(i + 1) % P.length], t, right });
const take = (arr, x) => arr.filter((_, i) => i !== x);
const ANGLE_KINDS = {
  line: r => { const k = r.chance(.55) ? 2 : 3, a2 = r.int(30, 138), angs = k === 2 ? r.shuffle([a2 + (a2 > 83 ? 12 : 0), 180 - a2 - (a2 > 83 ? 12 : 0)]) : r.chance(.3) ? r.shuffle([90, ...splitAngles(r, 2, 90, 30, 60)]) : splitAngles(r, 3, 180, 30, 100);
    const xi = r.pick(angs.map((a, i) => a === 90 ? -1 : i).filter(i => i >= 0)), O = [0, 0], cum = angs.map((_, i) => angs.slice(0, i).reduce((x, y) => x + y, 0));
    const angles = angs.map((a, i) => ({ v: O, a: dirPt(O, cum[i]), b: dirPt(O, cum[i] + a), t: i === xi ? "x" : a === 90 ? "" : dg(a), right: a === 90 && i !== xi }));
    const giv = take(angs, xi);
    return { fig: { title: "Straight-line spell", rot: r.pick([0, 0, 180, 20, -20]), segs: [[dirPt(O, 180, 1.1), dirPt(O, 0, 1.1)], ...cum.slice(1).map(c => [O, dirPt(O, c, 1.05)])], dots: [O], angles }, x: angs[xi], giv,
      q: "The angles sit on a straight line. Find ∠x.", hint: "Angles on a straight line add up to 180°.", steps: [`${giv.map(dg).join(" + ")} = ${dg(180 - angs[xi])}`, `∠x = 180° − ${dg(180 - angs[xi])} = ${dg(angs[xi])}`] }; },
  point: r => { const k = r.pick([3, 3, 4]), angs = k === 4 && r.chance(.4) ? r.shuffle([90, ...splitAngles(r, 3, 270, 50, 140)]) : splitAngles(r, k, 360, k === 3 ? 70 : 50, k === 3 ? 160 : 140);
    const xi = r.pick(angs.map((a, i) => a === 90 ? -1 : i).filter(i => i >= 0)), O = [0, 0], s0 = r.int(0, 359), cum = angs.map((_, i) => s0 + angs.slice(0, i).reduce((x, y) => x + y, 0)), giv = take(angs, xi);
    const angles = angs.map((a, i) => ({ v: O, a: dirPt(O, cum[i]), b: dirPt(O, cum[i] + a), t: i === xi ? "x" : a === 90 ? "" : dg(a), right: a === 90 && i !== xi }));
    return { fig: { title: "Compass-star point", segs: cum.map(c => [O, dirPt(O, c)]), dots: [O], angles }, x: angs[xi], giv,
      q: `${k} angles meet at a point. Find ∠x.`, hint: `Angles at a point add up to 360°.${giv.includes(90) ? " The little square is a right angle, 90°." : ""}`, steps: [`${giv.map(dg).join(" + ")} = ${dg(360 - angs[xi])}`, `∠x = 360° − ${dg(360 - angs[xi])} = ${dg(angs[xi])}`] }; },
  vopp: r => { let a = r.int(35, 145); if (a > 83 && a < 97) a += 20; const opp = r.chance(.5), side = r.pick([1, 3]), O = [0, 0], dirs = [0, a, 180, 180 + a, 360];
    const sec = i => ({ v: O, a: dirPt(O, dirs[i]), b: dirPt(O, dirs[i + 1]) }), xi = opp ? 2 : side, x = opp ? a : 180 - a;
    return { fig: { title: "Crossed wands", rot: r.int(0, 179), segs: [[dirPt(O, 0), dirPt(O, 180)], [dirPt(O, a), dirPt(O, 180 + a)]], dots: [O], angles: [Object.assign(sec(0), { t: dg(a) }), Object.assign(sec(xi), { t: "x" })] }, x, giv: [a],
      q: "Two straight wands cross. Find ∠x.", hint: opp ? "Vertically opposite angles are equal." : "∠x and the given angle sit on a straight line.", steps: opp ? ["∠x is vertically opposite the given angle.", `∠x = ${dg(a)}`] : ["∠x and the given angle are angles on a straight line.", `∠x = 180° − ${dg(a)} = ${dg(180 - a)}`] }; },
  tri: r => { const A = r.int(30, 100), B = r.int(30, 150 - A), C = 180 - A - B, P = triPts(A, B), angs = [A, B, C], xi = r.int(0, 2), giv = take(angs, xi);
    return { fig: { title: "Fairy tent", rot: r.pick([0, 0, 15, -15, 180]), polys: [P], angles: angs.map((a, i) => corner(P, i, i === xi ? "x" : dg(a))) }, x: angs[xi], giv,
      q: "Find ∠x in the triangle.", hint: "The three angles of a triangle add up to 180°.", steps: [`∠x = 180° − ${giv.map(dg).join(" − ")} = ${dg(angs[xi])}`] }; },
  right: r => { const B = r.int(25, 65), C = 90 - B, P = triPts(90, B), giveB = r.chance(.5), x = giveB ? C : B;
    return { fig: { title: "Castle flag", rot: r.pick([0, 0, 90, -90, 180]), polys: [P], angles: [corner(P, 0, "", true), corner(P, 1, giveB ? dg(B) : "x"), corner(P, 2, giveB ? "x" : dg(C))] }, x, giv: [90, giveB ? B : C],
      q: "The flag is a right-angled triangle (the little square is 90°). Find ∠x.", hint: "Angles in a triangle add up to 180°, and the right angle is 90°.", steps: [`∠x = 180° − 90° − ${dg(giveB ? B : C)} = ${dg(x)}`] }; },
  iso: r => { if (r.chance(.12)) { const P = triPts(60, 60), xi = r.int(0, 2);
      return { fig: { title: "Gingerbread roof", rot: r.pick([0, 180]), polys: [P], ticks: [[P[0], P[1], 1], [P[1], P[2], 1], [P[2], P[0], 1]], angles: [corner(P, xi, "x")] }, x: 60, giv: [], equi: 1,
        q: "All three sides of this triangle are equal (see the ticks). Find ∠x.", hint: "An equilateral triangle has three equal angles.", steps: ["All three angles are equal.", "∠x = 180° ÷ 3 = 60°"] }; }
    let ap = 2 * r.int(15, 65); if (ap === 60) ap = 50; const b = (180 - ap) / 2, P = triPts(b, b), t = r.int(0, 2), rot = r.pick([0, 0, 20, -20, 180]);
    const fig = { title: "Gingerbread roof", rot, polys: [P], ticks: [[P[0], P[2], 1], [P[1], P[2], 1]] };
    if (t === 0) return { fig: Object.assign(fig, { angles: [corner(P, 2, dg(ap)), corner(P, r.int(0, 1), "x")] }), x: b, giv: [ap],
      q: "The triangle is isosceles: the sides with a tick are equal. Find ∠x.", hint: "The two base angles of an isosceles triangle are equal.", steps: [`The two equal angles share 180° − ${dg(ap)} = ${dg(180 - ap)}`, `∠x = ${dg(180 - ap)} ÷ 2 = ${dg(b)}`] };
    const k = r.int(0, 1);
    if (t === 1) return { fig: Object.assign(fig, { angles: [corner(P, k, dg(b)), corner(P, 2, "x")] }), x: ap, giv: [b],
      q: "The triangle is isosceles: the sides with a tick are equal. Find ∠x.", hint: "The other base angle is the same size. Then use 180°.", steps: [`The other base angle is also ${dg(b)}.`, `∠x = 180° − ${dg(b)} − ${dg(b)} = ${dg(ap)}`] };
    return { fig: Object.assign(fig, { angles: [corner(P, k, dg(b)), corner(P, 1 - k, "x")] }), x: b, giv: [b],
      q: "The triangle is isosceles: the sides with a tick are equal. Find ∠x.", hint: "Look at which sides are equal: the angles facing them are equal too.", steps: ["∠x and the given angle face the two equal sides.", `∠x = ${dg(b)}`] }; },
  ext: r => { const A = r.int(35, 80), B = r.int(35, 145 - A), C = 180 - A - B, P = triPts(A, B), E = [1.5, 0], ext = 180 - B, inner = r.chance(.35);
    return { fig: { title: "Signpost puzzle", rot: r.pick([0, 0, 10, -10]), polys: [P], segs: [[P[1], E]], angles: [corner(P, 0, inner ? "" : dg(A)), { v: P[1], a: E, b: P[2], t: dg(ext) }, inner ? corner(P, 1, "x") : corner(P, 2, "x")].filter(g => g.t !== "") }, x: inner ? B : C, giv: inner ? [ext] : [A, ext],
      q: "One side of the triangle is made longer to form a straight line. Find ∠x.", hint: inner ? "∠x and the outside angle sit on a straight line." : "First find the angle inside the triangle next to the outside angle (straight line: 180°).",
      steps: inner ? [`∠x = 180° − ${dg(ext)} = ${dg(B)}`] : [`Inside angle = 180° − ${dg(ext)} = ${dg(B)}`, `∠x = 180° − ${dg(A)} − ${dg(B)} = ${dg(C)}`] }; },
  para: r => { let p = r.int(50, 130); if (p > 78 && p < 102) p -= 25; const rh = r.chance(.4), s = rh ? 1 : r.pick([.55, .7, .8]), P = [[0, 0], [1, 0], dirPt([1, 0], p, s), dirPt([0, 0], p, s)], angs = [p, 180 - p, p, 180 - p];
    const g = r.int(0, 3), xi = (g + r.int(1, 3)) % 4, opp = (g + 2) % 4 === xi;
    return { fig: { title: rh ? "Diamond kite" : "Magic carpet", rot: r.pick([0, 0, 180, 15, -15]), polys: [P], angles: [corner(P, g, dg(angs[g])), corner(P, xi, "x")],
      ticks: rh ? [[P[0], P[1], 1], [P[1], P[2], 1], [P[2], P[3], 1], [P[3], P[0], 1]] : [], arrows: rh ? [] : [[P[0], P[1], 1], [P[3], P[2], 1], [P[0], P[3], 2], [P[1], P[2], 2]] }, x: angs[xi], giv: [angs[g]],
      q: rh ? "The kite is a rhombus (all four sides are equal). Find ∠x." : "The carpet is a parallelogram (sides with the same arrows are parallel). Find ∠x.",
      hint: opp ? "Opposite angles of a parallelogram or rhombus are equal." : "Two angles next to each other along one side add up to 180°.", steps: opp ? ["∠x is opposite the given angle.", `∠x = ${dg(angs[g])}`] : ["∠x and the given angle are next to each other between parallel sides.", `∠x = 180° − ${dg(angs[g])} = ${dg(angs[xi])}`] }; },
  trap: r => { let a, b, h = .55, top; do { a = r.int(45, 115); b = r.int(45, 115); top = 1 - h / tanD(a) - h / tanD(b); } while (top < .3 || top > 1.2 || Math.abs(a - 90) < 6 || Math.abs(b - 90) < 6);
    const P = [[0, 0], [1, 0], dirPt([1, 0], 180 - b, h / sinD(b)), dirPt([0, 0], a, h / sinD(a))], angs = [a, b, 180 - b, 180 - a], g = r.int(0, 3), xi = 3 - g;
    return { fig: { title: "Toy-bridge trapezium", rot: r.pick([0, 0, 180]), polys: [P], arrows: [[P[0], P[1], 1], [P[3], P[2], 1]], angles: [corner(P, g, dg(angs[g])), corner(P, xi, "x")] }, x: angs[xi], giv: [angs[g]],
      q: "The bridge is a trapezium: the two sides with arrows are parallel. Find ∠x.", hint: "Between the parallel sides, the two angles along one slanted side add up to 180°.", steps: ["∠x and the given angle sit along the same slanted side, between the parallel sides.", `∠x = 180° − ${dg(angs[g])} = ${dg(angs[xi])}`] }; }
};
topic(5, "angles", "Angle Detectives", "🔎", "Unknown angles in lines, triangles and 4-sided figures", r => {
  const kind = r.pick(Object.keys(ANGLE_KINDS)), z = ANGLE_KINDS[kind](r);
  return num(z.q, z.x, z.hint, z.steps, { pic: svgGeo(z.fig, "angle figure"), uid: `angles|${kind}|${z.fig.title}|${z.giv.join(",")}|${z.x}|${z.fig.rot || 0}|${z.fig.angles.length}`, data: { geo: kind, x: z.x, giv: z.giv, equi: z.equi } });
});
topic(5, "volume", "Treasure Chests", "📦", "Volume of cuboids", r => {
  const l = r.int(2, 15), w = r.int(2, 12), h = r.int(2, 10);
  if (r.chance(.6)) return num(`A treasure chest is ${l} cm long, ${w} cm wide and ${h} cm high. What is its volume in cm³?`, l * w * h, "Volume = length × width × height.", [`${l} × ${w} × ${h} = ${l * w * h} cm³`], { data: { l, w, h } });
  const L = r.int(1, 9) * 10, W = r.int(1, 5) * 10, H = r.int(1, 5) * 10; return num(`A fish tank is ${L} cm × ${W} cm × ${H} cm. How many litres of water does it hold when full? (1 ℓ = 1000 cm³)`, L * W * H / 1000, "Find the volume in cm³, then divide by 1000.", [`${L} × ${W} × ${H} = ${L * W * H} cm³`, `${L * W * H} ÷ 1000 = ${fmt(L * W * H / 1000)} ℓ`], { keys: ["."] });
});
topic(5, "average", "Average Adventures", "📊", "Mean of a set", r => {
  const n = r.int(3, 6), mean = r.int(4, 60);
  if (r.chance(.65)) { const xs = Array.from({ length: n }, () => r.int(Math.max(1, mean - 15), mean + 15)), tot = sum(xs);
    return num(`The dwarfs' cousins found ${xs.join(", ")} gems. What is the average (mean) number of gems? (2 d.p. if needed)`, rd(tot / n, 2), "Add them all up, then divide by how many there are.", [`Total = ${xs.join(" + ")} = ${tot}`, `${tot} ÷ ${n} = ${fmt(rd(tot / n, 2))}`], { keys: ["."], tol: 0.0051, data: { xs } }); }
  return num(`The average mass of ${n} pumpkins is ${mean} kg. What is their total mass in kg?`, mean * n, "Total = average × number of items.", [`${mean} × ${n} = ${mean * n} kg`]);
});
topic(5, "order", "Order of Operations", "🪜", "Brackets, ×÷ before +−", r => {
  const a = r.int(2, 9), b = r.int(2, 9), c = r.int(1, 9), d = r.int(2, 6), t = r.int(0, 2);
  if (t === 0) return num(T(`${a} + ${b} \\times ${c} = \\;?`), a + b * c, "Multiply before you add.", [`$${b} \\times ${c} = ${b * c}$`, `$${a} + ${b * c} = ${a + b * c}$`]);
  if (t === 1) return num(T(`(${a} + ${b}) \\times ${c} = \\;?`), (a + b) * c, "Brackets first.", [`$${a} + ${b} = ${a + b}$`, `$${a + b} \\times ${c} = ${(a + b) * c}$`]);
  const big = (b + c) * d * a; return num(T(`${big} \\div (${b} + ${c}) - ${a} = \\;?`), big / (b + c) - a, "Brackets, then divide, then subtract.", [`$${b} + ${c} = ${b + c}$`, `$${big} \\div ${b + c} = ${big / (b + c)}$`, `$${big / (b + c)} - ${a} = ${big / (b + c) - a}$`]);
});
topic(5, "rate", "Fairy Rates", "🧚", "Rate problems", r => {
  const per = r.int(3, 25), t1 = r.int(2, 6), t2 = r.int(7, 15);
  return num(`A fairy loom weaves ${per * t1} ribbons in ${t1} minutes. At the same rate, how many ribbons in ${t2} minutes?`, per * t2, "Find how many in 1 minute first.", [`1 minute: ${per * t1} ÷ ${t1} = ${per}`, `${t2} minutes: ${per} × ${t2} = ${per * t2}`]);
});
topic(5, "story", "Fairytale Problems", "📜", "Fractions and percentages in stories", r => {
  if (r.chance(.5)) { const d = r.pick([4, 5, 8]), n = r.int(1, d - 1), tot = d * r.int(4, 20), left = tot - tot / d * n; return num(`Rapunzel had ${tot} ribbons. She used ${T(`\\frac{${n}}{${d}}`)} of them for her braid. How many ribbons were left?`, left, "Find the part used, then subtract (or find the fraction left).", [`Used: ${tot} ÷ ${d} × ${n} = ${tot / d * n}`, `Left: ${tot} − ${tot / d * n} = ${left}`]); }
  const price = r.int(4, 40) * 10, p = r.pick([10, 20, 25, 30]); return num(`A magic carpet costs $${price}. The bazaar gives ${p}% off. How much is the discount in $?`, price * p / 100, `Find ${p}% of ${price}.`, [`$${price} × ${p}/100 = $${fmt(price * p / 100)}`], { keys: ["."] });
}, { story: true });

/* ---------- Grade 6 (Primary 6) ---------- */
topic(6, "fracdiv", "Dividing Fractions", "🔄", "Fraction ÷ fraction or whole number", r => {
  const a = r.int(1, 7), b = r.int(a + 1, 9), c = r.int(1, 7), d = r.int(c + 1, 9), w = r.int(2, 6);
  if (r.chance(.35)) return Q({ q: `${T(`\\frac{${a}}{${b}} \\div ${w}`)} = ? (fraction)`, val: a / (b * w), a: fracStr(a, b * w), keys: ["/"], hint: `Dividing by ${w} is the same as multiplying by ${T(`\\frac{1}{${w}}`)}.`, steps: [`$\\frac{${a}}{${b}} \\times \\frac{1}{${w}} = ${fracTex(a, b * w)}$`], data: { a, b, w } });
  return Q({ q: `${T(`\\frac{${a}}{${b}} \\div \\frac{${c}}{${d}}`)} = ? (fraction or mixed number)`, val: a * d / (b * c), a: fracStr(a * d, b * c), keys: ["/"], hint: "Keep, change, flip: multiply by the reciprocal.", steps: [`$\\frac{${a}}{${b}} \\times \\frac{${d}}{${c}} = \\frac{${a * d}}{${b * c}} = ${mixedTex(a * d, b * c)}$`], data: { a, b, c, d } });
});
topic(6, "pctchange", "Sales at the Bazaar", "🏷️", "Discounts and percentage increase", r => {
  const p = r.pick([5, 10, 15, 20, 25, 30, 40]), price = r.int(2, 50) * 20, up = r.chance(.35), f = up ? 100 + p : 100 - p, v = price * f / 100;
  return num(up ? `The dragon's hoard of ${price} gold coins grows by ${p}%. How many coins now?` : `A crystal crown costs $${price}. It is sold at a ${p}% discount. What is the sale price in $?`, v, up ? `New = 100% + ${p}% = ${f}% of the original.` : `Sale price = 100% − ${p}% = ${f}% of the original.`,
    [`${f}% of ${price} = ${f / 100} × ${price} = ${fmt(v)}`], { keys: ["."], tol: 0.006, data: { p, price, up } });
});
topic(6, "share", "Sharing in a Ratio", "🎁", "Split a total in a given ratio", r => {
  const a = r.int(1, 7), b = r.int(1, 7), k = r.int(2, 20), tot = (a + b) * k, who = r.chance(.5);
  return num(`Hansel and Gretel share ${tot} sweets in the ratio ${a} : ${b}. How many does ${who ? "Hansel" : "Gretel"} get?`, (who ? a : b) * k, "Total parts first, then find 1 part.", [`Total parts = ${a} + ${b} = ${a + b}`, `1 part = ${tot} ÷ ${a + b} = ${k}`, `${who ? "Hansel" : "Gretel"}: ${who ? a : b} × ${k} = ${(who ? a : b) * k}`], { data: { a, b, tot, who } });
});
topic(6, "circle", "Circle Spells", "⭕", "Circumference and area (π = 3.14)", r => {
  const rad = r.int(2, 20), useD = r.chance(.4), area = r.chance(.5), v = rd(area ? 3.14 * rad * rad : 2 * 3.14 * rad, 2);
  return num(`A round fairy ring has ${useD ? `a diameter of ${2 * rad} m` : `a radius of ${rad} m`}. Find its ${area ? "area in m²" : "circumference in m"}. Use π = 3.14.`, v, area ? "Area = π × r × r" : "Circumference = 2 × π × r (or π × d)",
    [useD ? `Radius = ${2 * rad} ÷ 2 = ${rad} m` : `r = ${rad} m`, area ? `$3.14 \\times ${rad} \\times ${rad} = ${fmt(v)}$ m²` : `$2 \\times 3.14 \\times ${rad} = ${fmt(v)}$ m`], { keys: ["."], tol: 0.006, data: { rad, area } });
});
topic(6, "algebra", "Letter Magic", "🔤", "Simple algebra with letters", r => {
  const t = r.int(0, 2), a = r.int(2, 9), b = r.int(1, 20), x = r.int(2, 12);
  if (t === 0) return num(`Find the value of ${T(`${a}y + ${b}`)} when ${T(`y = ${x}`)}.`, a * x + b, `Replace y with ${x}.`, [`$${a} \\times ${x} + ${b} = ${a * x} + ${b} = ${a * x + b}$`]);
  if (t === 1) { const c = r.int(2, 9); return num(`Simplify ${T(`${a}k + ${c}k - k`)}. How many k's are there?`, a + c - 1, "Collect the like terms: add and subtract the numbers in front of k.", [`$${a} + ${c} - 1 = ${a + c - 1}$, so the answer is $${a + c - 1}k$`]); }
  return num(`A magic box holds ${T("n")} pearls. Ariel adds ${b} more and then has ${x + b}. What is ${T("n")}?`, x, "Work backwards: undo the adding.", [`$n + ${b} = ${x + b}$`, `$n = ${x + b} - ${b} = ${x}$`], { data: { L: [1, b], R: [0, x + b], v: "n" } });
});
topic(6, "speed", "Speedy Broomsticks", "🧹", "Speed, distance and time", r => {
  const s = r.int(4, 90), t = r.int(2, 8), which = r.int(0, 2);
  if (which === 0) return num(`A broomstick flies at ${s} km/h for ${t} hours. How far does it fly in km?`, s * t, "Distance = speed × time.", [`${s} × ${t} = ${s * t} km`]);
  if (which === 1) return num(`A witch flies ${s * t} km in ${t} hours. What is her average speed in km/h?`, s, "Speed = distance ÷ time.", [`${s * t} ÷ ${t} = ${s} km/h`]);
  return num(`A unicorn trots ${s * t} km at ${s} km/h. How many hours does it take?`, t, "Time = distance ÷ speed.", [`${s * t} ÷ ${s} = ${t} h`]);
});
/* ---------- ✂️ nets of solids (MOE P6 geometry: identify the nets of a cube, cuboid, prism and pyramid, and the solid a net makes) ----------
   Cube nets are 6 squares on squared paper, a cell is [column, row]. Folding works like rolling a dice across the paper: each square
   becomes the face that is face-down when the cube sits on it. Faces 0–5 are bottom, top, back, front, right, left (opposites 0/1, 2/3, 4/5). */
const ROLL = { // the cube's faces [bottom, top, back, front, right, left] after rolling one square right, left, down or up the page
  "1,0": f => [f[4], f[5], f[2], f[3], f[1], f[0]], "-1,0": f => [f[5], f[4], f[2], f[3], f[0], f[1]],
  "0,1": f => [f[3], f[2], f[0], f[1], f[4], f[5]], "0,-1": f => [f[2], f[3], f[1], f[0], f[4], f[5]]
};
// which cube face each square lands on (cellKey → 0–5), or null if two squares land on the same face
const foldCube = cells => { const face = { [cellKey(cells[0])]: [0, 1, 2, 3, 4, 5] }, todo = [cells[0]];
  while (todo.length) { const c = todo.shift(), f = face[cellKey(c)];
    for (const k in ROLL) { const [dx, dy] = k.split(",").map(Number), d = [c[0] + dx, c[1] + dy];
      if (hasCell(cells, d) && !face[cellKey(d)]) { face[cellKey(d)] = ROLL[k](f); todo.push(d); } } }
  const out = {}; for (const k in face) out[k] = face[k][0];
  return new Set(Object.values(out)).size === 6 && Object.keys(out).length === cells.length ? out : null; };
const OPP = f => f ^ 1;
// the 8 turns and flips of a figure, moved back to the top-left corner
const normCells = cells => { const x0 = Math.min(...cells.map(c => c[0])), y0 = Math.min(...cells.map(c => c[1])); return cells.map(([a, b]) => [a - x0, b - y0]); };
const turnCells = (cells, k) => normCells(cells.map(([a, b]) => { let p = k >= 4 ? [-a, b] : [a, b]; for (let i = 0; i < k % 4; i++) p = [-p[1], p[0]]; return p; }));
const shapeKey = cells => Array.from({ length: 8 }, (_, k) => figKey(turnCells(cells, k))).sort()[0];
const size = cells => [Math.max(...cells.map(c => c[0])) + 1, Math.max(...cells.map(c => c[1])) + 1];
// all 35 hexominoes (6 joined squares), each once; 11 of them fold into a cube
const HEXOS = (() => { let level = [[[0, 0]]];
  for (let n = 1; n < 6; n++) { const seen = new Map(); for (const f of level) for (const c of nearCells(f, 99, 99, () => true).concat(nearCells(f.map(([a, b]) => [a + 1, b + 1]), 99, 99).map(([a, b]) => [a - 1, b - 1])))
    { const g = normCells(f.concat([c])), k = shapeKey(g); if (!seen.has(k)) seen.set(k, g); } level = [...seen.values()]; }
  return level; })();
const CUBE_NETS = HEXOS.filter(foldCube), NOT_NETS = HEXOS.filter(h => !foldCube(h));
M.nets = { HEXOS, CUBE_NETS, NOT_NETS, foldCube };
// a random turn or flip of a figure, lying wide (never taller than it is wide)
const layWide = (r, cells) => { const g = turnCells(cells, r.int(0, 7)), [w, h] = size(g); return h > w ? turnCells(g, 1) : g; };
const has2x2 = cells => cells.some(([a, b]) => hasCell(cells, [a + 1, b]) && hasCell(cells, [a, b + 1]) && hasCell(cells, [a + 1, b + 1]));
const longRow = cells => Math.max(...cells.map(([a, b]) => { let n = 0, m = 0; while (hasCell(cells, [a + n, b])) n++; while (hasCell(cells, [a, b + m])) m++; return Math.max(n, m); }));
// every square can be reached from every other through shared sides
const joined = cells => { const seen = [cells[0]]; for (let i = 0; i < seen.length; i++) for (const c of nearCells([seen[i]], 99, 99)) if (hasCell(cells, c) && !hasCell(seen, c)) seen.push(c); return seen.length === cells.length; };
const NET_S = 16, NET_PAD = 4;
// a net on squared paper (W × H squares, figure moved by ox, oy); o.fill / o.extra (a highlighted square) / o.labels (cellKey → letter)
const svgNet = (cells, o = {}) => { const [w, h] = size(cells), W = o.W || 6, H = o.H || 3, ox = o.ox != null ? o.ox : Math.floor((W - w) / 2), oy = o.oy != null ? o.oy : Math.floor((H - h) / 2), S = NET_S, pad = NET_PAD;
  let g = "";
  for (const c of cells) { const x = o.extra && cellKey(o.extra) === cellKey(c); // squares touch (one joined piece of card), the outline is drawn on top
    g += `<rect class="ntc${x ? " ntx" : ""}" x="${pad + (c[0] + ox) * S}" y="${pad + (c[1] + oy) * S}" width="${S}" height="${S}" fill="${x ? "#FFE7A8" : o.fill || "#FFB8D1"}"/>`; }
  for (const [a, b] of cells) { const X = pad + (a + ox) * S, Y = pad + (b + oy) * S; // cut lines round the outside
    for (const [dx, dy, x1, y1, x2, y2] of [[1, 0, S, 0, S, S], [-1, 0, 0, 0, 0, S], [0, 1, 0, S, S, S], [0, -1, 0, 0, S, 0]])
      if (!hasCell(cells, [a + dx, b + dy])) g += `<line x1="${X + x1}" y1="${Y + y1}" x2="${X + x2}" y2="${Y + y2}" stroke="${LINE}" stroke-width="1.6" stroke-linecap="round"/>`; }
  for (const [a, b] of cells) { const X = pad + (a + ox) * S, Y = pad + (b + oy) * S; // dashed fold lines where two squares meet
    if (hasCell(cells, [a + 1, b])) g += `<line class="nfold" x1="${X + S}" y1="${Y}" x2="${X + S}" y2="${Y + S}" stroke="${LINE}" stroke-width="1.1" stroke-dasharray="2.5 2"/>`;
    if (hasCell(cells, [a, b + 1])) g += `<line class="nfold" x1="${X}" y1="${Y + S}" x2="${X + S}" y2="${Y + S}" stroke="${LINE}" stroke-width="1.1" stroke-dasharray="2.5 2"/>`; }
  if (o.labels) for (const c of cells) g += `<text class="ntl" x="${pad + (c[0] + ox) * S + S / 2}" y="${pad + (c[1] + oy) * S + S / 2 + 4}" font-size="11" text-anchor="middle" font-weight="900" fill="${INK}">${o.labels[cellKey(c)]}</text>`;
  return gridSheet(W, H, S, pad, g, o.label || "a net of squares on squared paper", o.small ? 1.3 : 2, "mpic netpic");
};
/* nets of other solids, drawn as flat faces (polygons in units), then turned and fitted onto a card */
const R3 = Math.sqrt(3) / 2;
const rectF = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const SOLIDS = {
  cube: { name: "cube", faces: 6, tri: 0, rect: 6, net: r => r.pick(CUBE_NETS).map(([a, b]) => rectF(a, b, 1, 1)) },
  cuboid: { name: "cuboid", faces: 6, tri: 0, rect: 6, net: r => { const [l, w, h] = r.shuffle([3, 2, 1.25]); // the cross: lid, front, base, back in a column, the two sides beside the front
    return [rectF(w, 0, l, w), rectF(w, w, l, h), rectF(w, w + h, l, w), rectF(w, 2 * w + h, l, h), rectF(0, w, w, h), rectF(w + l, w, w, h)]; } },
  prism: { name: "triangular prism", faces: 5, tri: 2, rect: 3, net: r => { const s = 1.5, L = r.pick([2.5, 3]), i = r.int(0, 2), j = r.int(0, 2);
    return [0, 1, 2].map(k => rectF(k * s, 0, s, L)).concat([[[i * s, 0], [i * s + s, 0], [i * s + s / 2, -s * R3]], [[j * s, L], [j * s + s, L], [j * s + s / 2, L + s * R3]]]); } },
  sqpyr: { name: "square pyramid", faces: 5, tri: 4, rect: 1, net: r => { const s = 1.6, t = r.pick([1.4, 1.8]);
    return [rectF(0, 0, s, s), [[0, 0], [s, 0], [s / 2, -t]], [[s, 0], [s, s], [s + t, s / 2]], [[s, s], [0, s], [s / 2, s + t]], [[0, s], [0, 0], [-t, s / 2]]]; } },
  tripyr: { name: "triangular pyramid", faces: 4, tri: 4, rect: 0, net: () => { const s = 1.8, A = [0, 0], B = [2 * s, 0], C = [s, 2 * s * R3], mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], ab = mid(A, B), bc = mid(B, C), ca = mid(C, A);
    return [[A, ab, ca], [ab, B, bc], [ca, bc, C], [ab, bc, ca]]; } }
};
const svgSolidNet = (faces, turn, fill) => { const rot = ([x, y]) => [[x, y], [-y, x], [-x, -y], [y, -x]][turn];
  const pts = faces.map(f => f.map(rot)), all = pts.flat(), x0 = Math.min(...all.map(p => p[0])), y0 = Math.min(...all.map(p => p[1])), w = Math.max(...all.map(p => p[0])) - x0, h = Math.max(...all.map(p => p[1])) - y0;
  const u = Math.min(132 / w, 76 / h), W = 150, H = 92, dx = (W - w * u) / 2, dy = (H - h * u) / 2;
  const g = pts.map((f, i) => `<polygon class="nface" points="${f.map(([x, y]) => `${(dx + (x - x0) * u).toFixed(1)},${(dy + (y - y0) * u).toFixed(1)}`).join(" ")}" fill="${f.length === 3 ? "#FFE7A8" : fill}" stroke="${LINE}" stroke-width="1.6" stroke-linejoin="round"/>`).join("");
  return svgBox(`<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="#F2FAFF" stroke="#CFE6F7" stroke-width="2"/>${g}`, "a net of a solid", 260, Math.round(260 * H / W), `0 0 ${W} ${H}`, "mpic netpic");
};
const NET_WHO = [["Fairy Pip", "a gift box for the Royal Party"], ["the Gingerbread Baker", "a cake box"], ["Jack", "a dice for the goblins' board game"], ["Princess Mira", "a jewel box"], ["Sumi the star fairy", "a lantern box"], ["Puss in Boots", "a box for his boots"]];
const NET_TIP = "Pick one square to be the bottom, then fold the others up around it. Every face of the cube must be covered exactly once.";
const whyNot = cells => has2x2(cells) ? "It has 4 squares in a 2 × 2 block: those squares fold round one corner, so two of them land on the same face."
  : longRow(cells) >= 5 ? `It has ${longRow(cells)} squares in a row: the 5th square in a row folds back onto the 1st.` : "When you fold it, two squares land on the same face, and one face of the cube is left open.";
const LETTERS = "ABCDEF";
const cap = s => s[0].toUpperCase() + s.slice(1);
topic(6, "nets", "Snip & Fold Nets", "✂️", "Nets of cubes, cuboids, prisms and pyramids", r => {
  const t = r.int(0, 5), [who0, what] = r.pick(NET_WHO), who = cap(who0), fill = r.pick(PASTEL.slice(0, 4)), opt = (c, x) => svgNet(c, Object.assign({ fill, small: true }, x));
  if (t === 0) { // pick the net of a cube
    const right = layWide(r, r.pick(CUBE_NETS)), others = r.shuffle(NOT_NETS).slice(0, 3).map(c => layWide(r, c)), ids = ["n1", "n2", "n3", "n4"], optPics = { n1: opt(right) };
    others.forEach((c, i) => { optPics[ids[i + 1]] = opt(c); });
    return mcq(r, `${who} is cutting out ${what} from card. Which of these can be folded into a cube?`, "n1", ids.slice(1), NET_TIP,
      [NET_TIP, "In the right net, each square becomes a different face: bottom, top, front, back, left and right.", "In the others two squares would land on the same face (look for a 2 × 2 block or 5 squares in a row)."],
      { optPics, uid: "n0" + figKey(right) + others.map(figKey).join("/"), data: { net: "pick", cells: right } });
  }
  if (t === 1) { // can this fold into a cube?
    const yes = r.chance(.5), cells = layWide(r, r.pick(yes ? CUBE_NETS : NOT_NETS));
    return mcq(r, `${who} drew this net for ${what}. Can it be folded into a cube?`, yes ? "Yes" : "No", [yes ? "No" : "Yes"], NET_TIP,
      yes ? [NET_TIP, "Each of the 6 squares lands on a different face, so it closes up into a cube."] : [NET_TIP, whyNot(cells), "So it cannot make a cube."],
      { pic: svgNet(cells, { fill }), uid: "n1" + figKey(cells), data: { net: "check", cells, yes } });
  }
  if (t === 2) { // which face is opposite?
    const cells = layWide(r, r.pick(CUBE_NETS)), f = foldCube(cells), lets = r.shuffle(LETTERS.split("")), labels = {}; cells.forEach((c, i) => { labels[cellKey(c)] = lets[i]; });
    const pick = r.pick(cells), mine = labels[cellKey(pick)], oppC = cells.find(c => f[cellKey(c)] === OPP(f[cellKey(pick)])), right = labels[cellKey(oppC)];
    const line = (pick[0] === oppC[0] || pick[1] === oppC[1]) && Math.abs(pick[0] - oppC[0]) + Math.abs(pick[1] - oppC[1]) === 2;
    return mcq(r, `${who} wrote a letter on each face of ${what} and opened it out flat. When it is folded up again, which face is opposite face <b>${mine}</b>?`, right,
      cells.map(c => labels[cellKey(c)]).filter(x => x !== mine && x !== right), "Opposite faces never touch in the net. In a straight row of three squares, the two end squares are opposite.",
      [line ? `${mine} and ${right} are in a straight line with one square between them, so they are opposite.` : `${mine} and ${right} are in a zig-zag: when you fold the net, they end up facing each other.`, `Every other face touches ${mine} once the cube is folded.`],
      { pic: svgNet(cells, { fill, labels }), uid: "n2" + figKey(cells) + mine + lets.join(""), data: { net: "opposite", cells, labels, face: mine } });
  }
  if (t === 5) { // which extra square finishes the net?
    const net = layWide(r, r.pick(CUBE_NETS)), gone = r.pick(net.filter(c => joined(net.filter(d => d !== c))));
    const shift = cells => cells.map(([a, b]) => [a + 1, b + 1]), base = shift(net.filter(c => c !== gone)), spots = nearCells(base, 99, 99);
    const good = spots.filter(c => foldCube(base.concat([c]))), bad = r.shuffle(spots.filter(c => !foldCube(base.concat([c]))));
    const rightC = r.pick(good), chosen = [rightC].concat(bad.slice(0, 3));
    if (chosen.length < 3) return M.topic("g6.nets").gen(r);
    const all = base.concat(chosen), x0 = Math.min(...all.map(c => c[0])), y0 = Math.min(...all.map(c => c[1])), W = Math.max(...all.map(c => c[0])) - x0 + 1, H = Math.max(...all.map(c => c[1])) - y0 + 1;
    const ids = ["n1", "n2", "n3", "n4"], optPics = {}, place = { W, H, ox: -x0, oy: -y0 };
    chosen.forEach((c, i) => { optPics[ids[i]] = opt(base.concat([c]), Object.assign({ extra: c }, place)); });
    return mcq(r, `${who} needs one more square to finish ${what}. Where should the yellow square go so the net folds into a cube?`, "n1", ids.slice(1, chosen.length), NET_TIP,
      [NET_TIP, "With the right square every face is covered once.", "In the other pictures the yellow square lands on a face that is already covered, so one face is left open."],
      { pic: svgNet(base, Object.assign({ fill }, place)), optPics, uid: "n5" + figKey(base) + chosen.map(cellKey).join("/"), data: { net: "extra", base, spots: chosen } });
  }
  // nets of other solids: name the solid, or count its faces
  const k = r.pick(Object.keys(SOLIDS)), S = SOLIDS[k], turn = r.int(0, 3), pic = svgSolidNet(S.net(r), turn, fill), maker = r.pick(["Rapunzel", "Jack", "Princess Mira", "Fairy Pip", "The Frog King"]);
  if (t === 3) return mcq(r, `${maker} cut out this net to make a paper model for the Fairy Fair. Which solid can it be folded into?`, S.name, r.shuffle(Object.values(SOLIDS).filter(x => x !== S).map(x => x.name)),
    "Count the faces and look at their shapes: squares and rectangles make boxes, triangles meeting at a point make a pyramid, two triangles at the ends make a prism.",
    [`The net has ${S.faces} faces: ${[S.tri && `${S.tri} triangle${S.tri > 1 ? "s" : ""}`, S.rect && (k === "cube" ? "6 squares" : `${S.rect} ${k === "sqpyr" ? "square" : "rectangle"}${S.rect > 1 ? "s" : ""}`)].filter(Boolean).join(" and ")}.`, `So it folds into a ${S.name}.`],
    { pic, data: { net: "solid", solid: k } });
  const ask = r.pick([["faces", S.faces], S.tri && S.rect ? r.pick([["triangles", S.tri], ["rects", S.rect]]) : ["faces", S.faces]]);
  const q = ask[0] === "faces" ? "How many faces will the solid have?" : ask[0] === "triangles" ? "How many of the solid's faces are triangles?" : `How many of the solid's faces are ${k === "sqpyr" ? "squares" : "rectangles"}?`;
  return num(`${maker} folds this net into a ${S.name}. ${q}`, ask[1], "Each flat shape in the net becomes one face of the solid.", [`Count the ${ask[0] === "faces" ? "shapes" : ask[0] === "triangles" ? "triangles" : k === "sqpyr" ? "squares" : "rectangles"} in the net: ${ask[1]}.`, `A ${S.name} has ${S.faces} faces.`], { pic, data: { net: "count", solid: k, ask: ask[0] } });
});
/* 🥧 pie charts (MOE P6): shares in simple fractions or percentages of a known total */
const PIES = [
  { about: n => `how ${n} pupils travel to school`, title: "How we get to school", kind: "way", verb: "travel by", cats: [["Bus", "🚌"], ["Walking", "🚶"], ["Car", "🚗"], ["Bicycle", "🚲"], ["MRT", "🚇"]] },
  { about: n => `the favourite snacks of ${n} pupils`, title: "Our favourite snacks", kind: "snack", verb: "chose", cats: [["Fruit", "🍉"], ["Popcorn", "🍿"], ["Cookies", "🍪"], ["Yoghurt", "🥛"], ["Crackers", "🥨"]] },
  { about: n => n === "some" ? "the books in the class library" : `the ${n} books in the class library`, title: "Books in our class library", kind: "kind of book", verb: "are", unit: "books", cats: [["Stories", "📖"], ["Comics", "💬"], ["Science", "🔬"], ["Poems", "🎶"], ["Atlases", "🗺️"]] },
  { about: n => `the CCAs chosen by ${n} pupils`, title: "Our CCA choices", kind: "CCA", verb: "chose", cats: [["Robotics", "🤖"], ["Choir", "🎤"], ["Art club", "🎨"], ["Swimming", "🏊"], ["Scouts", "⛺"]] }
];
const pieParts = (r, n, whole) => { for (;;) { const cut = r.shuffle(Array.from({ length: whole - 1 }, (_, i) => i + 1)).slice(0, n - 1).sort((a, b) => a - b), p = [0, ...cut, whole].slice(1).map((x, i, a) => x - (i ? a[i - 1] : 0));
  if (new Set(p).size === n) return p; } };
topic(6, "piechart", "Pie Chart Picnic", "🥧", "Pie charts with fractions and percentages", r => {
  const th = r.pick(PIES), pct = r.chance(.5), whole = pct ? r.pick([10, 20]) : r.pick([6, 8, 12]), n = whole >= 10 ? r.int(3, 4) : 3, parts = pieParts(r, n, whole);
  const cats = r.shuffle(th.cats).slice(0, n), N = whole * r.int(pct ? 2 : 3, pct ? 12 : 15), share = k => pct ? `${parts[k] * 100 / whole}%` : fracStr(parts[k], whole), cnt = k => N * parts[k] / whole;
  const lab = k => `${cats[k][1]} ${cats[k][0]}`, who = th.unit || "pupils", t = r.int(0, 4), i = r.int(0, n - 1), j = (i + r.int(1, n - 1)) % n, [a, b] = parts[i] >= parts[j] ? [i, j] : [j, i];
  const ofTot = k => pct ? `${share(k)} of ${N} = ${parts[k] * 100 / whole} ÷ 100 × ${N} = ${cnt(k)}` : `${share(k)} of ${N} = ${N} ÷ ${whole} × ${parts[k]} = ${cnt(k)}`;
  const say = k => th.unit ? `How many of the books are ${lab(k)}?` : `How many pupils ${th.verb} ${lab(k)}?`;
  const pic = hide => svgPieChart(th.title, cats.map(([name, e], k) => ({ name, e, part: parts[k], label: k === hide ? "?" : share(k) })), whole), o = { data: { graph: "pie", parts, whole, N, pct } };
  const intro = `The pie chart shows ${th.about(N)}.`;
  if (t === 0) return num(`${intro} ${say(i)}`, cnt(i), `Find ${share(i)} of ${N}.`, [ofTot(i)], Object.assign({ pic: pic() }, o));
  if (t === 1) { const rest = parts.filter((_, k) => k !== i).reduce((x, y) => x + y, 0);
    return num(`The pie chart shows ${th.about("some")}. What ${pct ? "percentage" : "fraction"} is ${lab(i)}?${pct ? "" : " (type a fraction like 3/8)"}`, pct ? parts[i] * 100 / whole : parts[i] / whole,
      `The whole pie is ${pct ? "100%" : "1"}. Take away the other parts.`, [pct ? `100% − ${cats.map((_, k) => k).filter(k => k !== i).map(share).join(" − ")} = ${share(i)}` : `1 − (${cats.map((_, k) => k).filter(k => k !== i).map(share).join(" + ")}) = 1 − ${fracStr(rest, whole)} = ${share(i)}`],
      Object.assign({ pic: pic(i), a: share(i), keys: pct ? ["%"] : ["/"] }, o)); }
  if (t === 2) return num(`The pie chart shows ${th.about("some")}. ${cnt(i)} ${th.unit ? `books are ${lab(i)}` : `pupils ${th.verb} ${lab(i)}`}. How many ${who} are there altogether?`, N,
    pct ? `${share(i)} stands for ${cnt(i)}. Find what ${100 / whole}% stands for first.` : `${share(i)} stands for ${cnt(i)}. Find what 1/${whole} stands for first.`, pct ? [`${share(i)} → ${cnt(i)}`, `${100 / whole}% → ${cnt(i)} ÷ ${parts[i]} = ${N / whole}`, `100% → ${N / whole} × ${whole} = ${N}`] : [parts[i] === 1 ? `1/${whole} → ${cnt(i)}` : `${share(i)} = ${parts[i]}/${whole} → ${cnt(i)}, so 1/${whole} → ${cnt(i)} ÷ ${parts[i]} = ${N / whole}`, `${whole}/${whole} → ${N / whole} × ${whole} = ${N}`], Object.assign({ pic: pic() }, o));
  if (t === 3) return num(`${intro} How many more ${th.unit ? `books are ${lab(a)} than ${lab(b)}` : `pupils ${th.verb} ${lab(a)} than ${lab(b)}`}?`, cnt(a) - cnt(b), "Work out both numbers, then subtract. (Or subtract the shares first.)", [ofTot(a), ofTot(b), `${cnt(a)} − ${cnt(b)} = ${cnt(a) - cnt(b)}`], Object.assign({ pic: pic() }, o));
  return mcq(r, `${intro} ${th.verb === "travel by" ? `How do ${cnt(i)} pupils travel to school?` : `Which ${th.kind} ${th.unit ? "has" : "was chosen by"} ${cnt(i)} ${who}?`}`, lab(i), cats.map((_, k) => k).filter(k => k !== i).map(lab), `Work out each share of ${N} until you find ${cnt(i)}.`, [ofTot(i)], Object.assign({ pic: pic() }, o));
});
topic(6, "story", "Fairytale Problems", "📜", "P6-style model problems", r => {
  if (r.chance(.5)) { const u = r.int(3, 12), k = r.int(2, 5); return num(`Jack has ${k} times as many magic beans as the giant. Together they have ${u * (k + 1)} beans. How many beans does Jack have?`, u * k, `Draw a model: the giant is 1 unit, Jack is ${k} units.`, [`Total units = ${k} + 1 = ${k + 1}`, `1 unit = ${u * (k + 1)} ÷ ${k + 1} = ${u}`, `Jack = ${k} × ${u} = ${u * k}`]); }
  const a = r.int(20, 60), dif = r.int(4, 20); return num(`Cinderella and her stepsister have ${2 * a + dif} buttons altogether. Cinderella has ${dif} more than her stepsister. How many does Cinderella have?`, a + dif, "Take away the difference first, then split in half.", [`${2 * a + dif} − ${dif} = ${2 * a}`, `${2 * a} ÷ 2 = ${a} (stepsister)`, `Cinderella = ${a} + ${dif} = ${a + dif}`]);
}, { story: true });

/* ---------- Grade 7 (Secondary 1) ---------- */
topic(7, "integers", "Integer Isles", "🏝️", "Add, subtract, multiply, divide negatives", r => {
  const a = r.nz(-20, 20), b = r.nz(-15, 15), op = r.pick(["+", "-", "×", "÷"]);
  if (op === "÷") { const p = a * b; return num(T(`(${p}) \\div (${b}) = \\;?`), a, "Same signs → positive; different signs → negative.", [`$${Math.abs(p)} \\div ${Math.abs(b)} = ${Math.abs(a)}$`, `Signs: ${(p < 0) === (b < 0) ? "same → +" : "different → −"}, so ${a}`], { keys: ["-"], data: { a: p, b, op } }); }
  const v = op === "+" ? a + b : op === "-" ? a - b : a * b;
  return num(T(`${paren(a)} ${op === "×" ? "\\times" : op} ${paren(b)} = \\;?`), v, op === "×" ? "Same signs → positive; different signs → negative." : op === "-" ? "Subtracting a negative is the same as adding." : "Use a number line: positive moves right, negative moves left.", [op === "-" && b < 0 ? `$${a} - (${b}) = ${a} + ${-b} = ${v}$` : `$${paren(a)} ${op === "×" ? "\\times" : op} ${paren(b)} = ${v}$`], { keys: ["-"], data: { a, b, op } });
});
topic(7, "hcf", "Prime Factor Forge", "⚒️", "HCF, LCM and prime factors", r => {
  const ps = [2, 3, 5, 7], make = () => { let n = 1; const k = r.int(2, 4); for (let i = 0; i < k; i++) n *= r.pick(ps); return n; };
  let a = make(), b = make(); while (a === b) b = make();
  const pf = n => { const f = []; for (const p of ps) while (n % p === 0) { f.push(p); n /= p; } return f; };
  const idx = f => { const c = {}; f.forEach(p => c[p] = (c[p] || 0) + 1); return Object.keys(c).sort((x, y) => x - y).map(p => c[p] > 1 ? `${p}^{${c[p]}}` : p).join(" \\times "); };
  const t = r.int(0, 2);
  if (t === 0) return num(`Find the HCF of ${a} and ${b}.`, gcd(a, b), "Write both as products of primes; take the common primes with the lowest powers.", [`$${a} = ${idx(pf(a))}$`, `$${b} = ${idx(pf(b))}$`, `HCF = ${gcd(a, b)}`], { data: { a, b, f: "hcf" } });
  if (t === 1) return num(`Find the LCM of ${a} and ${b}.`, lcm(a, b), "Take every prime with its highest power.", [`$${a} = ${idx(pf(a))}$`, `$${b} = ${idx(pf(b))}$`, `LCM = ${lcm(a, b)}`], { data: { a, b, f: "lcm" } });
  const n = a * r.pick([2, 3, 5]), f = pf(n), right = idx(f);
  const wrong = [idx(f.slice(1)), idx(f.concat([2])), idx(f.map(p => p === 3 ? 5 : p === 5 ? 3 : p === 2 ? 3 : p)), idx(f.concat([3])), idx(f.concat([5]))].filter(x => x && x !== right);
  return mcq(r, `Which is ${n} written as a product of prime factors?`, T(right), wrong.map(T), "Keep dividing by the smallest prime: 2, 3, 5, 7…", [`${n} → ${f.join(" × ")} = $${right}$`], { data: { n } });
});
// px + qy in TeX (either part may be 0), and one signed term " - 3y" / " + x" to follow it
const xyTerms = (p, q) => { const s = poly([[p, 1]], "x"); if (!q) return s; const t = poly([[Math.abs(q), 1]], "y"); return p ? s + (q < 0 ? " - " : " + ") + t : (q < 0 ? "-" : "") + t; };
const signedTerm = (k, v) => `${k < 0 ? " - " : " + "}${coef(Math.abs(k))}${v}`;
topic(7, "simplify", "Like-Term Lanterns", "🏮", "Simplify algebraic expressions", r => {
  const a = r.nz(-6, 9), b = r.nz(-6, 9), c = r.nz(-6, 9), d = r.nz(-6, 9), X = a + c, Y = b + d;
  const e = `${coef(a)}x${signedTerm(b, "y")}${signedTerm(c, "x")}${signedTerm(d, "y")}`, right = xyTerms(X, Y);
  return mcq(r, `Simplify ${T(e)}`, T(right), [xyTerms(a - c, Y), xyTerms(X, b - d), xyTerms(X + 1, Y), xyTerms(Y, X), xyTerms(-X, Y), xyTerms(X, -Y), xyTerms(X - 1, Y + 1)].filter(w => w !== right).map(T), "Collect the x-terms together and the y-terms together.", [`x-terms: $${a} + ${paren(c)} = ${X}$`, `y-terms: $${b} + ${paren(d)} = ${Y}$`, `Answer: $${right}$`], { data: { a, b, c, d } });
});
topic(7, "expand", "Bracket Breakers", "🔓", "Expand a(bx + c)", r => {
  const a = r.nz(-7, 9), b = r.nz(-5, 6), c = r.nz(-9, 9), right = lin(a * b, a * c);
  return mcq(r, `Expand ${T(`${coef(a)}(${lin(b, c)})`)}`, T(right), [lin(a * b, c), lin(a * b, -a * c), lin(a + b, a * c), lin(b, a * c), lin(-a * b, a * c), lin(a * b, a + c)].filter(w => w !== right).map(T), "Multiply the number outside by EACH term inside.", [`$${paren(a)} \\times ${poly([[b, 1]])} = ${poly([[a * b, 1]])}$`, `$${paren(a)} \\times ${paren(c)} = ${a * c}$`, `Answer: $${right}$`], { data: { a, b, c } });
});
topic(7, "lineq", "Equation Elixirs", "⚗️", "Solve linear equations", r => {
  const x = r.int(-10, 12), t = r.int(0, 2);
  if (t === 0) { const a = r.nz(-9, 9), b = r.nz(-20, 20), c = a * x + b; return num(`Solve ${T(`${lin(a, b)} = ${c}`)}`, x, "Undo the + or −, then divide by the number in front of x.", [`$${poly([[a, 1]])} = ${c} ${undo(b)} = ${c - b}$`, `$x = ${c - b} \\div ${paren(a)} = ${x}$`], { keys: ["-"], data: { L: [a, b], R: [0, c] } }); }
  if (t === 1) { const a = r.int(2, 6), b = r.nz(-9, 9), c = a * (x + b); return num(`Solve ${T(`${a}(${lin(1, b)}) = ${c}`)}`, x, `Divide both sides by ${a} first (or expand).`, [`$${lin(1, b)} = ${c} \\div ${a} = ${c / a}$`, `$x = ${c / a} ${undo(b)} = ${x}$`], { keys: ["-"], data: { L: [a, a * b], R: [0, c], g: a } }); }
  let a = r.int(2, 9), c = r.int(1, 8); if (a === c) a++; const b = r.int(-12, 12), d = (a - c) * x + b;
  return num(`Solve ${T(`${lin(a, b)} = ${lin(c, d)}`)}`, x, "Get the x-terms on one side and the numbers on the other.", [`$${a}x - ${coef(c)}x = ${d} ${undo(b)}$`, `$${a - c === 1 ? "" : a - c}x = ${d - b}$`, `$x = ${x}$`], { keys: ["-"], data: { L: [a, b], R: [c, d] } });
});
topic(7, "angles", "Angle Archery", "🏹", "Angles on lines, at points, in triangles", r => {
  const t = r.int(0, 3);
  if (t === 0) { const a = r.int(20, 160); return num(`Two angles sit on a straight line. One is ${a}°. What is the other?`, 180 - a, "Angles on a straight line add up to 180°.", [`180° − ${a}° = ${180 - a}°`]); }
  if (t === 1) { const a = r.int(30, 80), b = r.int(30, 180 - a - 10); return num(`A triangle has angles of ${a}° and ${b}°. What is the third angle?`, 180 - a - b, "Angles in a triangle add up to 180°.", [`180° − ${a}° − ${b}° = ${180 - a - b}°`]); }
  if (t === 2) { const a = r.int(40, 150), b = r.int(40, 300 - a - 20); return num(`Three angles meet at a point: ${a}°, ${b}° and x°. Find x.`, 360 - a - b, "Angles at a point add up to 360°.", [`360° − ${a}° − ${b}° = ${360 - a - b}°`]); }
  const a = r.int(25, 155); return num(`Two straight lines cross. One angle is ${a}°. What is the angle vertically opposite it?`, a, "Vertically opposite angles are equal.", [`Vertically opposite → also ${a}°`]);
});
/* ---------- 📦 solids kit (Bakery Blueprints prisms and cylinders, Ice-Cream Cone Café pyramids, cones and spheres) ----------
   Whole-number right triangles (so slanted sides, slant heights and radii agree with the drawing), π = 3.142 answers to 1 d.p.,
   areas / volumes with MOE digit grouping, answers in terms of π, and round faces: a circle tipped back is drawn as an oval
   OVAL times as tall as it is wide, its back half hidden (dashed) and its front half solid. */
const MENS_TRI = [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [9, 12, 15], [12, 9, 15]];
const PI3 = 3.142;
// "1885.2" when it is exact to 1 d.p., else "138.248 \approx 138.2" (TeX)
const approx1 = x => { const e = fmt(rd(x, 3)), v = fdp(x, 1); return +e === +v ? fmt(+v) : `${e} \\approx ${v}`; };
// 36000 → "36 000" (the MOE way of grouping digits), decimals kept
const grp = n => { const [i, d] = fmt(n).split("."); return i.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + (d ? "." + d : ""); };
const sq = (v, u) => `${grp(v)} ${u}²`, cu = (v, u) => `${grp(v)} ${u}³`;
const piT = (k, u, p) => `${T(`${fmt(k)}\\pi`)} ${u}${p}`;
// cabinet view: an edge L long going back into the page is drawn at 30° and shortened (prisms, pyramids)
const depthV = L => [L * .42 * Math.cos(Math.PI / 6), L * .42 * Math.sin(Math.PI / 6)];
const OVAL = .32;
// half of the oval round centre c (card pixels), from its left end to its right end: sw 0 = the front half, 1 = the back half
const ovalTo = (c, rx, ry, sw) => `A${f1(rx)},${f1(ry)} 0 0,${sw} ${xy([c[0] + rx, c[1]])}`;
const ovalBack = (c, rx, ry) => `<path class="mhid" d="M${xy([c[0] - rx, c[1]])} ${ovalTo(c, rx, ry, 1)}" fill="none" stroke="${LINE}" stroke-width="2" stroke-dasharray="5 4"/>`;
const ovalLid = (c, rx, ry, fill) => `<ellipse cx="${f1(c[0])}" cy="${f1(c[1])}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${fill}" stroke="${INK}" stroke-width="2.6"/>`;
// a solid's outline filled in pastel (class cls lets the tests find it), the side of an upright cylinder (top centre T, bottom Bc)
// and a cone from apex A down to the oval round c
const solidPath = (d, fill, cls) => `<path${cls ? ` class="${cls}"` : ""} d="${d}" fill="${fill}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
const cylSide = (T, Bc, rx, ry) => `M${xy([T[0] - rx, T[1]])} L${xy([Bc[0] - rx, Bc[1]])} ${ovalTo(Bc, rx, ry, 0)} L${xy([T[0] + rx, T[1]])} Z`;
const coneSide = (A, c, rx, ry) => `M${xy(A)} L${xy([c[0] - rx, c[1]])} ${ovalTo(c, rx, ry, 0)} Z`;
const figDot = c => `<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="2.6" fill="${INK}"/>`;
// the radius (dashed from the centre to the right end, with a dot) or the diameter (end to end) of an oval, labelled dy px off it
const ovalSize = (c, rx, ry, lab, dy = -ry - 6) => lab.d ? figEdge([c[0] - rx, c[1]], [c[0] + rx, c[1]], true) + figLab(c, lab.d, 0, dy)
  : figEdge(c, [c[0] + rx, c[1]], true) + figDot(c) + figLab([c[0] + rx / 2, c[1]], lab.r, 0, dy);
/* ---------- 🎂 Bakery Blueprints (MOE Sec 1 mensuration): area of parallelograms and trapeziums (and finding a height back
   from the area), composite figures (rectangle + triangle or semicircle), volume and total surface area of triangular prisms,
   volume and surface area of cylinders, and converting cm² ↔ m², m³ → cm³. Every figure is drawn to scale on a cream card;
   slanted sides come from whole-number right triangles (3-4-5, 5-12-13…) so the drawing and the numbers always agree.
   Multiple-choice options each carry a why / why-not note, and typed answers get a note when they match a usual slip. */
// a parallelogram (top = bottom) or trapezium: bottom b, top a, left side leaning over s with height h (slant l); labels as given
const svgQuad = (title, b, a, s, h, lab) => figCard(title, [[0, 0], [b, 0], [s + a, h], [s, h]], S => {
  const A = S([0, 0]), B = S([b, 0]), C = S([s + a, h]), D = S([s, h]), F = S([s, 0]);
  return figShape([A, B, C, D], PASTEL[4]) + figEdge(D, F, true) + figRight(F, 1) + figLab(mid(A, B), lab.b, 0, 16) + (lab.a ? figLab(mid(D, C), lab.a, 0, -12) : "")
    + figLab(mid(D, F), lab.h, 6, 0, "start") + (lab.l ? figLab(mid(A, D), lab.l, -8, 0, "end") : "");
}, a === b ? "parallelogram" : "trapezium");
// a house front (rectangle + triangle roof) or an arch (rectangle + semicircle) w wide, walls hr high, roof ht high
const svgHouse = (title, w, hr, ht, lab) => figCard(title, [[0, 0], [w, 0], [w, hr + ht], [0, hr]], S => {
  const A = S([0, 0]), B = S([w, 0]), C = S([w, hr]), D = S([0, hr]), E = S([w / 2, hr + ht]), F = S([w / 2, hr]);
  return figShape([A, B, C, D], PASTEL[2]) + figShape([D, C, E], PASTEL[0]) + figEdge(E, F, true) + figRight(F, 1) + figLab(mid(A, B), lab.w, 0, 16) + figLab(mid(B, C), lab.hr, 8, 0, "start") + figLab(mid(E, F), lab.ht, -7, 0, "end");
}, "composite figure");
const svgArch = (title, w, hr, lab) => figCard(title, [[0, 0], [w, 0], [w, hr + w / 2], [0, hr + w / 2]], S => {
  const A = S([0, 0]), B = S([w, 0]), C = S([w, hr]), D = S([0, hr]), R = w / 2 * S.k;
  return figShape([A, B, C, D], PASTEL[3]) + `<path d="M${xy(D)} A${f1(R)},${f1(R)} 0 0,1 ${xy(C)} Z" fill="${PASTEL[1]}" stroke="${INK}" stroke-width="2.6"/>` + figEdge(D, C, true)
    + figLab(mid(A, B), lab.w, 0, 16) + figLab(mid(B, C), lab.hr, 8, 0, "start");
}, "composite figure");
// a triangular prism drawn in cabinet view: "ramp" (right angle at the back-left foot) or "tent" (isosceles); front base b, height h, length L
const svgPrism = (title, shape, b, h, L, lab) => {
  const F = shape === "ramp" ? [[0, 0], [b, 0], [0, h]] : [[0, 0], [b, 0], [b / 2, h]], dv = depthV(L), Bk = F.map(p => [p[0] + dv[0], p[1] + dv[1]]);
  return figCard(title, F.concat(Bk), S => { const f = F.map(S), k = Bk.map(S), foot = S([shape === "ramp" ? 0 : b / 2, 0]);
    // the back-left-bottom corner is hidden, so its three edges are dashed; the sloping face on the right is shaded
    return figShape([f[1], f[2], k[2], k[1]], PASTEL[1]) + figShape(f, PASTEL[0]) + figEdge(f[0], k[0], true) + figEdge(k[0], k[1], true) + figEdge(k[0], k[2], true) + figEdge(f[1], k[1]) + figEdge(f[2], k[2]) + figEdge(k[1], k[2])
      + (shape === "tent" ? figEdge(f[2], foot, true) + figRight(foot, 1) + figLab(mid(f[2], foot), lab.h, 5, 6, "start") : figRight(foot, 1) + figLab(mid(f[0], f[2]), lab.h, -7, 0, "end"))
      + figLab(mid(f[0], f[1]), lab.b, 0, 16) + figLab(mid(f[1], k[1]), lab.L, 9, 8, "start") + (lab.l ? figLab(mid(shape === "ramp" ? f[1] : f[0], f[2]), lab.l, shape === "ramp" ? 6 : -8, shape === "ramp" ? -6 : 0, shape === "ramp" ? "start" : "end") : "");
  }, "triangular prism", 214);
};
// an upright cylinder radius r, height h; the radius (or diameter) is drawn on the lid
const svgCyl = (title, r, h, lab) => figCard(title, [[-r, -OVAL * r], [r, h + OVAL * r]], S => { const T = S([0, h]), Bc = S([0, 0]), rx = r * S.k, ry = OVAL * r * S.k;
  return solidPath(cylSide(T, Bc, rx, ry), PASTEL[1])
    + ovalBack(Bc, rx, ry) + ovalLid(T, rx, ry, PASTEL[0]) + ovalSize(T, rx, ry, lab) + figLab(mid([T[0] + rx, T[1]], [Bc[0] + rx, Bc[1]]), lab.h, 8, 0, "start");
}, "cylinder", 214);
const MENS = {
  para: r => { const [s, h, l] = r.pick(MENS_TRI), b = r.int(s + 3, s + 14), cm = r.chance(.5), u = cm ? "cm" : "m", what = cm ? r.pick(["a gingerbread cookie", "a marzipan tile", "a jelly slab"]) : r.pick(["a flower bed in the castle garden", "a picnic rug", "a patch of the strawberry field"]);
    return mcqWhy(r, `${cap(what)} is a parallelogram. What is its area?`, sq(b * h, u), `The height has to meet the base at a right angle, and that is the dashed ${h} ${u} line: base × height = ${b} × ${h} = ${b * h} ${u}².`,
      [[sq(b * l, u), `${l} ${u} is the slanted side, not the height. Leaning sides are longer than the height, so the area comes out too big.`], [sq(b * h / 2, u), `Halving is for triangles. A parallelogram is a rectangle with a corner slid across, so there is no ½.`],
       [sq(2 * (b + l), u), `${2 * (b + l)} ${u} is the perimeter (the distance all the way round), not the space inside.`], [sq(b + h, u), `Adding the base and height doesn't give an area. Multiply them.`], [sq(l * h, u), `The slanted side × the height doesn't make a rectangle of the same size. Use the base.`]],
      "Area of a parallelogram = base × perpendicular height.", [`Cut the triangle off one end and move it to the other: the parallelogram becomes a rectangle ${b} ${u} by ${h} ${u}.`, `Area = base × height = ${b} × ${h} = ${b * h} ${u}²`, `(The ${l} ${u} slanted side is not used.)`],
      { pic: svgQuad("Parallelogram", b, b, s, h, { b: `${b} ${u}`, h: `${h} ${u}`, l: `${l} ${u}` }), uid: `mens|para|${b}|${s},${h}|${u}`, data: { mens: "para", b, s, h, l, u } }); },
  trap: r => { const [s, h, l] = r.pick(MENS_TRI); let a = r.int(2, 12); const b = a + s + r.int(0, 6); if ((a + b) * h % 2) a += a > 2 ? -1 : 1; const B = Math.max(b, a + s), area = (a + B) * h / 2, cm = r.chance(.5), u = cm ? "cm" : "m";
    const what = cm ? r.pick(["A stained-glass window in the fairy tower", "A slice of the royal layer cake, seen from the side,", "A wooden sign for the bakery"]) : r.pick(["A pumpkin patch", "The castle's lily pond", "A meadow for the unicorns"]);
    return mcqWhy(r, `${what} is a trapezium. What is its area?`, sq(area, u), `Add the two parallel sides, ${a} + ${B} = ${a + B}, multiply by the ${h} ${u} height and halve it: ${area} ${u}².`,
      [[sq((a + B) * h, u), `So close! You forgot to halve. (Sum of parallel sides) × height is two trapeziums put together.`], [sq((a + B) * l / 2, u), `${l} ${u} is the slanted side. The height must be the dashed line at right angles to the parallel sides.`],
       [sq(B * h, u), `That is a rectangle using the longer side. The top is shorter, so the trapezium is smaller than that.`], [sq(a * h, u), `That only uses the shorter parallel side, so it is too small.`], [sq(a * B * h / 2, u), `Don't multiply the two parallel sides together: add them first.`]],
      "Area of a trapezium = ½ × (sum of the parallel sides) × height.", [`Parallel sides: ${a} ${u} and ${B} ${u}; height (at right angles): ${h} ${u}.`, `Area = ½ × (${a} + ${B}) × ${h} = ½ × ${a + B} × ${h} = ${area} ${u}²`],
      { pic: svgQuad("Trapezium", B, a, s, h, { b: `${B} ${u}`, a: `${a} ${u}`, h: `${h} ${u}`, l: `${l} ${u}` }), uid: `mens|trap|${a},${B}|${s},${h}|${u}`, data: { mens: "trap", a, b: B, s, h, l, u } }); },
  rev: r => { const [s, h] = r.pick(MENS_TRI), para = r.chance(.4), u = r.pick(["cm", "m"]);
    if (para) { const b = r.int(s + 3, s + 14), A = b * h;
      return numWhy(`A parallelogram-shaped garden plot for the fairies has an area of ${A} ${u}² and a base of ${b} ${u}. What is its height, h, in ${u}?`, h, "Area = base × height, so height = area ÷ base.", [`$${b} \\times h = ${A}$`, `$h = ${A} \\div ${b} = ${h}$ ${u}`],
        [[A / b / 2, "That halves it, but a parallelogram's area has no ½ in it."], [A * b, "Multiplying makes it bigger. To undo × base, divide by the base."], [A - b, "Area and length can't be subtracted. Divide the area by the base."]],
        { pic: svgQuad("Parallelogram", b, b, s, h, { b: `${b} ${u}`, h: "h" }), uid: `mens|rev|p|${b}|${s},${h}`, data: { mens: "rev", para, b, s, h, A } }); }
    let a = r.int(2, 10); const b = a + s + r.int(0, 6); if ((a + b) * h % 2) a += a > 2 ? -1 : 1; const B = Math.max(b, a + s), A = (a + B) * h / 2;
    return numWhy(`A trapezium-shaped patch of the candy garden has an area of ${A} ${u}². Its parallel sides are ${a} ${u} and ${B} ${u}. What is its height, h, in ${u}?`, h, "Write the area formula with h in it, then solve.", [`$\\frac{1}{2} \\times (${a} + ${B}) \\times h = ${A}$`, `$${fmt((a + B) / 2)}h = ${A}$`, `$h = ${A} \\div ${fmt((a + B) / 2)} = ${h}$ ${u}`],
      [[A / (a + B), "You forgot the ½: dividing by the whole sum of the sides gives half the height."], [2 * A / B, "Both parallel sides count. Add them before you divide."], [A / B, "Use the sum of both parallel sides, and remember the ½."]],
      { pic: svgQuad("Trapezium", B, a, s, h, { b: `${B} ${u}`, a: `${a} ${u}`, h: "h" }), uid: `mens|rev|t|${a},${B}|${s},${h}`, data: { mens: "rev", para, a, b: B, s, h, A } }); },
  compo: r => { if (r.chance(.55)) { let w = r.int(6, 20); const hr = r.int(4, 14), ht = r.int(3, 10); if (w * ht % 2) w++; const v = w * hr + w * ht / 2;
      return numWhy(`The front of a gingerbread house is a rectangle with a triangle roof on top. What is its area in cm²?`, v, "Split it into a rectangle and a triangle, find each area, then add.", [`Rectangle: $${w} \\times ${hr} = ${w * hr}$ cm²`, `Triangle roof: $\\frac{1}{2} \\times ${w} \\times ${ht} = ${w * ht / 2}$ cm²`, `Total: $${w * hr} + ${w * ht / 2} = ${v}$ cm²`],
        [[w * hr + w * ht, "The roof is a triangle, so it is half of a rectangle: remember the ½."], [w * hr, "That is only the rectangle. Add the triangle roof too."], [w * ht / 2, "That is only the roof. Add the rectangle under it."], [w * hr + w * ht / 4, "The triangle only needs one ½, not two."]],
        { pic: svgHouse("Gingerbread house", w, hr, ht, { w: `${w} cm`, hr: `${hr} cm`, ht: `${ht} cm` }), uid: `mens|house|${w},${hr},${ht}`, data: { mens: "compo", k: "house", w, hr, ht } }); }
    const w = 2 * r.int(2, 8), hr = r.int(5, 16), R = w / 2, v = rd(w * hr + PI3 * R * R / 2, 1);
    return numWhy(`A castle door is a rectangle with a semicircle on top. Find its area in dm². Use π = 3.142 and give your answer to 1 decimal place.`, v, "Rectangle + half a circle. The semicircle's radius is half the width.", [`Rectangle: $${w} \\times ${hr} = ${w * hr}$ dm²`, `Radius = ${w} ÷ 2 = ${R} dm`, `Semicircle: $\\frac{1}{2} \\times 3.142 \\times ${R}^2 = ${fmt(rd(PI3 * R * R / 2, 3))}$ dm²`, `Total: $${w * hr} + ${fmt(rd(PI3 * R * R / 2, 3))} = ${approx1(w * hr + PI3 * R * R / 2)}$ dm²`],
      [[rd(w * hr + PI3 * R * R, 1), "That adds a whole circle. The top is only a semicircle, so halve the circle's area."], [rd(w * hr + PI3 * w * w / 2, 1), `The width ${w} dm is the diameter. The radius is half of it: ${R} dm.`], [w * hr, "That is only the rectangle. Add the semicircle on top."], [rd(w * hr + PI3 * R, 1), "Area of a circle needs the radius squared: π × r × r."]],
      { tol: 0.051, keys: ["."], pic: svgArch("Castle door", w, hr, { w: `${w} dm`, hr: `${hr} dm` }), uid: `mens|arch|${w},${hr}`, data: { mens: "compo", k: "arch", w, hr } }); },
  prismV: r => { const tent = r.chance(.5); let b, h, l, L = r.int(4, 16);
    if (tent) { const [s, hh, ll] = r.pick(MENS_TRI.filter(t => t[1] > .58 * t[0])); b = 2 * s; h = hh; l = ll; } else { [b, h, l] = r.pick(MENS_TRI); }
    const u = tent ? "m" : "cm", cs = b * h / 2, v = cs * L, who = tent ? "A fairy camping tent" : "A wedge of cheese for the Mouse King";
    return numWhy(`${who} is a triangular prism. What is its volume in ${u}³?`, v, "Volume of a prism = area of the cross-section × length.", [`Cross-section (the triangle): $\\frac{1}{2} \\times ${b} \\times ${h} = ${cs}$ ${u}²`, `Volume = $${cs} \\times ${L} = ${v}$ ${u}³`],
      [[b * h * L, "The cross-section is a triangle, so its area is half of base × height."], [cs, "That is just the triangle at the front. Multiply by the length to fill the whole prism."], [b * l * L / 2, `${l} ${u} is a sloping edge. The triangle's height must be at right angles to its base.`], [(b + h) * L, "Find the triangle's area first (½ × base × height), then multiply by the length."]],
      { pic: svgPrism(tent ? "Fairy tent" : "Cheese wedge", tent ? "tent" : "ramp", b, h, L, { b: `${b} ${u}`, h: `${h} ${u}`, L: `${L} ${u}`, l: tent ? `${l} ${u}` : "" }), uid: `mens|prismV|${tent}|${b},${h}|${L}`, data: { mens: "prismV", tent, b, h, l, L } }); },
  prismSA: r => { const tent = r.chance(.5); let b, h, l, L = r.int(3, 14);
    if (tent) { const [s, hh, ll] = r.pick(MENS_TRI.filter(t => t[1] > .58 * t[0])); b = 2 * s; h = hh; l = ll; } else { [b, h, l] = r.pick(MENS_TRI); }
    const u = tent ? "m" : "cm", per = tent ? b + 2 * l : b + h + l, tri = b * h / 2, tot = 2 * tri + per * L, sides = tent ? `${b} + ${l} + ${l}` : `${b} + ${h} + ${l}`;
    return mcqWhy(r, `${tent ? "A fairy camping tent, floor included," : "A wedge of cheese for the Mouse King"} is a triangular prism. What is its total surface area?`, sq(tot, u), `Two triangle ends (${tri} ${u}² each) plus three rectangles that wrap round, ${per} ${u} × ${L} ${u}: ${2 * tri} + ${per * L} = ${tot} ${u}².`,
      [[sq(per * L, u), "That is only the three rectangles. Don't forget the two triangles at the ends."], [sq(tri + per * L, u), "A prism has TWO triangle ends, front and back."], [sq(2 * b * h + per * L, u), "Each triangle is half of base × height, so the two ends are b × h altogether, not 2 × b × h."],
       [sq(tri * L, u), `${tri * L} is the volume (the space inside), measured in cubes, not the area of the outside.`], [sq(2 * tri + 3 * b * L, u), "The three rectangles aren't all the same: each is as wide as its own side of the triangle."]],
      "Unfold it in your head: 2 triangles + 3 rectangles.", [`2 triangles: $2 \\times \\frac{1}{2} \\times ${b} \\times ${h} = ${2 * tri}$ ${u}²`, `3 rectangles: $(${sides}) \\times ${L} = ${per} \\times ${L} = ${per * L}$ ${u}²`, `Total: $${2 * tri} + ${per * L} = ${tot}$ ${u}²`],
      { pic: svgPrism(tent ? "Fairy tent" : "Cheese wedge", tent ? "tent" : "ramp", b, h, L, { b: `${b} ${u}`, h: `${h} ${u}`, L: `${L} ${u}`, l: `${l} ${u}` }), uid: `mens|prismSA|${tent}|${b},${h}|${L}`, data: { mens: "prismSA", tent, b, h, l, L } }); },
  cylV: r => { const rad = r.int(3, 12), h = r.int(3, 20), useD = r.chance(.4), v = rd(PI3 * rad * rad * h, 1), what = r.pick([["A round cake tin", "Cake tin"], ["A tin of rainbow sprinkles", "Sprinkle tin"], ["The wishing well's bucket", "Well bucket"], ["A potion jar", "Potion jar"]]);
    return numWhy(`${what[0]} is a cylinder. Find its volume in cm³. Use π = 3.142 and give your answer to 1 decimal place.`, v, "Volume of a cylinder = π r² h (the circle's area × height).", (useD ? [`Radius = ${2 * rad} ÷ 2 = ${rad} cm`] : []).concat([`Circle on top: $3.142 \\times ${rad}^2 = ${fmt(rd(PI3 * rad * rad, 3))}$ cm²`, `Volume: $${fmt(rd(PI3 * rad * rad, 3))} \\times ${h} = ${approx1(PI3 * rad * rad * h)}$ cm³`]),
      (useD ? [[rd(PI3 * 4 * rad * rad * h, 1), `${2 * rad} cm is the diameter. Halve it to get the radius before you square it.`]] : []).concat([[rd(2 * PI3 * rad * h, 1), "2πrh is the curved surface (the label), not the volume."], [rd(PI3 * rad * h, 1), "The radius must be squared: π × r × r × h."], [rd(PI3 * rad * rad, 1), "That is just the circle on top. Multiply by the height."]]),
      { tol: 0.051, keys: ["."], pic: svgCyl(what[1], rad, h, useD ? { d: `${2 * rad} cm`, h: `${h} cm` } : { r: `${rad} cm`, h: `${h} cm` }), uid: `mens|cylV|${rad}|${h}|${useD}`, data: { mens: "cylV", r: rad, h, useD } }); },
  cylSA: r => { const rad = r.int(3, 10), h = r.int(3, 15), label = r.chance(.45), curved = 2 * rad * h, ends = 2 * rad * rad, u = "cm", P = k => piT(k, u, "²");
    const pic = svgCyl(label ? "Label for a jam jar" : "Hat box", rad, h, { r: `${rad} cm`, h: `${h} cm` }), extra = { pic, uid: `mens|cylSA|${label}|${rad}|${h}`, data: { mens: "cylSA", label, r: rad, h } };
    if (label) return mcqWhy(r, `A paper label wraps exactly once round the curved side of a cylinder-shaped jam jar (not the lid or the bottom). What is the area of the label? Leave your answer in terms of π.`, P(curved), `Unroll the label into a rectangle: one side is the circle's circumference 2π × ${rad}, the other the ${h} cm height, so 2π × ${rad} × ${h} = ${curved}π cm².`,
      [[P(curved + ends), "The label only covers the curved side. The top and bottom circles aren't part of it."], [P(rad * h), "The rectangle's long side is the whole way round, 2πr, not πr."], [P(rad * rad * h), `${rad * rad * h}π is the volume of the jar, not the label.`], [P(2 * curved), "That uses the diameter where the formula needs the radius."], [P(curved + rad * rad), "The label doesn't cover the lid, so no circle is added."], [P(rad * rad), `${rad * rad}π is the area of the circle on top, not the label round the side.`]],
      "Curved surface area = 2πrh (unroll it into a rectangle).", [`Length of the rectangle = circumference = $2\\pi \\times ${rad} = ${2 * rad}\\pi$ cm`, `Area = $${2 * rad}\\pi \\times ${h} = ${curved}\\pi$ cm²`], extra);
    return mcqWhy(r, `A closed cylinder-shaped hat box (with a lid and a base) has radius ${rad} cm and height ${h} cm. What is its total surface area? Leave your answer in terms of π.`, P(ends + curved), `Two circles (π × ${rad}² = ${rad * rad}π each) plus the curved side (2π × ${rad} × ${h} = ${curved}π): ${ends + curved}π cm² altogether.`,
      [[P(curved), "That is only the curved side. A closed box also has a lid and a base."], [P(rad * rad + curved), "Only one circle counted. A closed cylinder has two: the lid and the base."], [P(rad * rad * h), `${rad * rad * h}π is the volume, the space inside, not the outside.`], [P(ends + rad * h), "The curved side unrolls to 2πr by h, not πr by h."], [P(2 * rad + curved), "A circle's area is π r², with r squared, not 2πr."], [P(ends + 2 * curved), "That uses the diameter in the curved side. 2πrh needs the radius."], [P(2 * ends + curved), "Each circle is πr². Two of them make 2πr², not 4πr²."]],
      "Total surface area = 2 circles + curved side = 2πr² + 2πrh.", [`2 circles: $2 \\times \\pi \\times ${rad}^2 = ${ends}\\pi$ cm²`, `Curved side: $2\\pi \\times ${rad} \\times ${h} = ${curved}\\pi$ cm²`, `Total: $${ends}\\pi + ${curved}\\pi = ${ends + curved}\\pi$ cm²`], extra); },
  units: r => { const k = r.pick(["m2", "m2", "cm2", "m3"]);
    if (k === "m2") { const x = r.int(11, 99) / 10, v = Math.round(x * 1e4);
      return mcqWhy(r, `The ballroom's dance floor has an area of ${fmt(x)} m². What is that in cm²?`, sq(v, "cm"), `1 m² is a square 100 cm by 100 cm, which is 10 000 cm², so ${fmt(x)} m² = ${fmt(x)} × 10 000 = ${grp(v)} cm².`,
        [[sq(Math.round(x * 100), "cm"), "1 m = 100 cm, but a square metre is 100 cm × 100 cm = 10 000 cm², so × 100 is not enough."], [sq(Math.round(x * 1000), "cm"), "1 000 is for metres to millimetres or kilograms to grams. Square metres to square centimetres is × 10 000."], [sq(rd(x / 1e4, 6), "cm"), "Centimetres are smaller, so there must be MORE of them: multiply, don't divide."], [sq(Math.round(x * 1e6), "cm"), "× 1 000 000 turns m³ into cm³. For square units it's 100 × 100 = 10 000."]],
        "Picture 1 m² as a square 100 cm long and 100 cm wide.", [`1 m² = 100 cm × 100 cm = 10 000 cm²`, `${fmt(x)} × 10 000 = ${grp(v)} cm²`], { data: { mens: "units", k, x } }); }
    if (k === "cm2") { const x = r.int(5, 95) / 10, v = Math.round(x * 1e4);
      return mcqWhy(r, `A banner for the royal parade uses ${grp(v)} cm² of silk. What is that in m²?`, sq(x, "m"), `Every 10 000 cm² makes 1 m² (100 cm × 100 cm), so ${grp(v)} ÷ 10 000 = ${fmt(x)} m².`,
        [[sq(rd(v / 100, 4), "m"), "Dividing by 100 changes cm to m for lengths. For areas it's 100 × 100 = 10 000."], [sq(rd(v / 1000, 4), "m"), "There are 10 000 cm² in 1 m², not 1 000."], [sq(v * 1e4, "m"), "Metres are bigger, so you need FEWER of them: divide, don't multiply."], [sq(rd(v / 1e6, 6), "m"), "÷ 1 000 000 is for cubic units (cm³ to m³)."]],
        "1 m² = 10 000 cm². Big units → fewer of them.", [`1 m² = 100 cm × 100 cm = 10 000 cm²`, `${grp(v)} ÷ 10 000 = ${fmt(x)} m²`], { data: { mens: "units", k, x } }); }
    const x = r.int(1, 9) / 10 + r.pick([0, 0, 1, 2]), v = Math.round(x * 1e6);
    return mcqWhy(r, `The mermaid's pool holds ${fmt(x)} m³ of water. What is that in cm³?`, cu(v, "cm"), `1 m³ is a cube 100 cm on every edge: 100 × 100 × 100 = 1 000 000 cm³, so ${fmt(x)} m³ = ${grp(v)} cm³.`,
      [[cu(Math.round(x * 1e4), "cm"), "× 10 000 is for square units. A cube has three edges of 100 cm: 100 × 100 × 100."], [cu(Math.round(x * 100), "cm"), "× 100 only changes a length. Volume has three dimensions to change."], [cu(Math.round(x * 1000), "cm"), "1 m³ = 1 000 litres, but in cm³ it's 1 000 000 (each litre is 1 000 cm³)."], [cu(rd(x / 1e6, 8), "cm"), "Centimetres are smaller, so there are more of them: multiply."]],
      "Picture 1 m³ as a cube 100 cm × 100 cm × 100 cm.", [`1 m³ = 100 × 100 × 100 = 1 000 000 cm³`, `${fmt(x)} × 1 000 000 = ${grp(v)} cm³`], { data: { mens: "units", k, x } }); }
};
topic(7, "mensur", "Bakery Blueprints", "🎂", "Parallelograms, trapeziums, prisms and cylinders", r => {
  const k = r.pick(["para", "para", "trap", "trap", "rev", "compo", "compo", "prismV", "prismV", "prismSA", "cylV", "cylV", "cylSA", "cylSA", "units"]);
  return MENS[k](r);
});
topic(7, "pct", "Percentage Puzzles", "🔮", "Reverse and percentage change", r => {
  if (r.chance(.5)) { const orig = r.int(4, 50) * 20, p = r.pick([10, 20, 25, 40, 50]), sale = orig * (100 - p) / 100; return num(`After a ${p}% discount, a cloak costs $${sale}. What was the original price in $?`, orig, `$${sale} is ${100 - p}% of the original.`, [`${100 - p}% → ${sale}`, `1% → ${sale} ÷ ${100 - p} = ${fmt(sale / (100 - p))}`, `100% → $${orig}`], { data: { sale, p } }); }
  const a = r.int(2, 40) * 20, p = r.pick([10, 20, 25, 50, 75, 5]), b = a * (100 + p) / 100; return num(`The kingdom's population grew from ${a} to ${b}. What is the percentage increase?`, p, "Percentage increase = increase ÷ original × 100%.", [`Increase = ${b} − ${a} = ${b - a}`, `${b - a} ÷ ${a} × 100% = ${p}%`], { data: { a, b } });
});
/* ✨ Sparkle Sequences (MOE Sec 1 number patterns): continue a sequence, find the nth term of a linear sequence and use it
   (a far-off term, which term is a value, is a value in the sequence at all), and matchstick / dot picture patterns.
   A linear sequence is T(n) = d·n + c; every answer below is worked out from d and c (or from the drawn figures). */
const seqRule = (d, c) => lin(d, c, "n");
const seqList = (f, from, k) => Array.from({ length: k }, (_, i) => f(from + i));
const seqShow = xs => T(`${xs.join(", ")}, \\ldots`);
const SEQ_SAY = [["Sumi the star fairy writes a sparkly sequence:", 1], ["The stepping stones on the crystal path are numbered", 0], ["The dragon's shiny scales are numbered", 0], ["The fairy lanterns on the castle bridge are numbered", 0], ["Every hour the ice castle's magic thermometer reads", 1], ["The wizard's counting spell makes the numbers", 1]];
const seqSay = (r, xs) => r.pick(SEQ_SAY.filter(s => s[1] || xs.every(x => x > 0)))[0];
// the steps for finding the nth term from the first terms
const ruleSteps = (d, c, t1) => [`The terms ${d > 0 ? "go up" : "go down"} by ${Math.abs(d)} each time, so the rule starts with $${coef(d)}n$.`, `When $n = 1$: $${d} \\times 1 = ${d}$, but the 1st term is $${t1}$, so ${c === 0 ? "nothing more is needed" : `${c > 0 ? "add" : "take away"} $${Math.abs(c)}$`}.`, `nth term $= ${seqRule(d, c)}$`];
// a random linear sequence: difference d (never 0), first term t1
const pickSeq = (r, big) => { const d = r.chance(.25) ? -r.int(2, 9) : r.int(2, big ? 12 : 9), t1 = d < 0 ? r.int(10, 60) : r.int(-6, 25), c = t1 - d; return { d, c, f: n => d * n + c, t1 }; };
/* picture patterns: figure n is drawn from polygons (sticks = their edges, shared edges once) or dots */
const SQ3 = Math.sqrt(3);
const PAT_FAM = {
  sq: { title: "Crystal path", what: "matchsticks", unit: "squares", who: "The crystal path is built from glowing sticks", polys: n => seqList(i => [[i, 0], [i + 1, 0], [i + 1, 1], [i, 1]], 0, n) },
  tri: { title: "Dragon scales", what: "matchsticks", unit: "triangles", who: "The dragon's scales are made from golden sticks", polys: n => seqList(i => { const k = i >> 1, h = SQ3 / 2; return i % 2 ? [[k + .5, 0], [k + 1.5, 0], [k + 1, h]] : [[k, h], [k + 1, h], [k + .5, 0]]; }, 0, n) },
  hex: { title: "Honeycomb tiles", what: "matchsticks", unit: "hexagon tiles", who: "The fairies make honeycomb tiles from magic sticks", polys: n => seqList(i => seqList(k => [i * SQ3 + Math.cos((30 + 60 * k) * Math.PI / 180), Math.sin((30 + 60 * k) * Math.PI / 180) + 1], 0, 6), 0, n) },
  plus: { title: "Twinkly star lights", what: "fairy lights", who: "Fairy lights are hung in a twinkly star shape", dots: n => [[0, 0]].concat(...seqList(k => [[k, 0], [-k, 0], [0, k], [0, -k]], 1, n)) },
  ladder: { title: "Lantern bridge", what: "lanterns", who: "Lanterns are hung in two rows along the castle bridge", dots: n => seqList(i => [i, 0], 0, n + 1).concat(seqList(i => [i, 1], 0, n + 1)) },
  tower: { title: "Gem towers", what: "magic gems", who: "The dragon stacks magic gems into twin towers", dots: n => [[1, 0]].concat(seqList(i => [0, i], 0, n), seqList(i => [2, i], 0, n)) }
};
const edgeKey = (p, q) => [p, q].map(v => v.map(x => x.toFixed(3)).join(",")).sort().join("|");
const famSticks = (fam, n) => { const out = new Map(); for (const P of PAT_FAM[fam].polys(n)) P.forEach((p, i) => { const q = P[(i + 1) % P.length], k = edgeKey(p, q); if (!out.has(k)) out.set(k, [p, q]); }); return [...out.values()]; };
const famCount = (fam, n) => PAT_FAM[fam].polys ? famSticks(fam, n).length : PAT_FAM[fam].dots(n).length;
// figures 1, 2, 3 side by side on a cream card; each <g class="sfig" data-n> holds its sticks (.stk) or dots (.sdot)
const svgPattern = (fam, title) => {
  const F = PAT_FAM[fam], figs = [1, 2, 3].map(n => F.polys ? famSticks(fam, n) : F.dots(n));
  const box = g => { const ps = F.polys ? [].concat(...g) : g, xs = ps.map(p => p[0]), ys = ps.map(p => p[1]); return [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]; };
  const bs = figs.map(box), pad = F.polys ? 0 : .5, ws = bs.map(b => b[1] - b[0] + 2 * pad), hs = bs.map(b => b[3] - b[2] + 2 * pad);
  // all three at the same scale; each figure gets its own width plus an equal share of the spare room, and sits in the middle of it
  const tw = sum(ws), top = 34, H = 76, sc = Math.min(26, 240 / tw, H / Math.max(...hs)), spare = (276 - tw * sc) / 3;
  let x = 12, body = "";
  figs.forEach((g, i) => { const [x0, , y0] = bs[i], cx = x + (ws[i] * sc + spare) / 2, ox = cx - ws[i] * sc / 2, oy = top + (H - hs[i] * sc) / 2, P = p => [f1(ox + (p[0] - x0 + pad) * sc), f1(oy + (p[1] - y0 + pad) * sc)];
    body += `<g class="sfig" data-n="${i + 1}">` + (F.polys ? g.map(([p, q]) => { const [a, b] = P(p), [c, d] = P(q); return `<line class="stk" x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="${["#E9A23B", "#F08BB0", "#7FB7E6"][i]}" stroke-width="3.2" stroke-linecap="round"/>`; }).join("")
      : g.map(p => { const [a, b] = P(p); return `<circle class="sdot" cx="${a}" cy="${b}" r="${f1(Math.min(5.5, sc * .3))}" fill="${PASTEL[(i * 2) % 6]}" stroke="${LINE}" stroke-width="1.4"/>`; }).join(""));
    body += `</g><text x="${f1(cx)}" y="${top + H + 20}" font-size="11" text-anchor="middle" font-weight="900" fill="${INK}">Figure ${i + 1}</text>`; x += ws[i] * sc + spare; });
  return cardSvg(300, 140, title, 20, body, "picture pattern");
};
topic(7, "pattern", "Sparkle Sequences", "✨", "Number patterns and the nth term", r => {
  const t = r.pick(["next", "next", "rule", "rule", "term", "term", "which", "which", "isin", "isin", "pic", "pic", "pic", "pic"]);
  if (t === "next") {
    if (r.chance(.2)) { // the odd non-linear sequence: square, triangle or doubling numbers
      const k = r.pick(["square", "triangle", "double"]), m = r.int(2, 5), f = k === "square" ? n => n * n : k === "triangle" ? n => n * (n + 1) / 2 : n => m * Math.pow(2, n - 1), xs = seqList(f, 1, 5), v = f(6);
      const why = { square: [`These are the square numbers: $1^2, 2^2, 3^2, \\ldots$`, `The next one is $6^2 = ${v}$`], triangle: [`The gaps grow by 1 each time: ${seqList(n => f(n + 1) - f(n), 1, 4).join(", ")}`, `The next gap is 6: $${xs[4]} + 6 = ${v}$`], double: ["Each term is double the one before.", `$${xs[4]} \\times 2 = ${v}$`] }[k];
      return num(`${seqSay(r, xs)} ${seqShow(xs)} What is the next number?`, v, "Look at the gaps between the terms. Are they the same, or growing?", why, { data: { seq: "next", k, xs } });
    }
    const s = pickSeq(r), xs = seqList(s.f, 1, r.int(4, 5)), n = xs.length, two = r.chance(.4), a = s.f(n + 1), b = s.f(n + 2);
    const steps = [`The difference is $${xs[1]} - ${paren(xs[0])} = ${s.d}$ each time.`, `$${xs[n - 1]} ${pm(s.d)} = ${a}$`].concat(two ? [`$${a} ${pm(s.d)} = ${b}$`] : []);
    if (two) return Q({ q: `${seqSay(r, xs)} ${seqShow(xs)} What are the next two numbers? (type like 7, 9)`, kind: "pair", val: [a, b], a: `${a}, ${b}`, keys: ["-", ","], hint: "Find the difference between neighbouring terms.", steps, data: { seq: "next", k: "lin", xs, d: s.d, c: s.c } });
    return num(`${seqSay(r, xs)} ${seqShow(xs)} What is the next number?`, a, "Find the difference between neighbouring terms.", steps, { keys: ["-"], data: { seq: "next", k: "lin", xs, d: s.d, c: s.c } });
  }
  if (t === "pic") {
    const fam = r.pick(Object.keys(PAT_FAM)), F = PAT_FAM[fam], cnt = [1, 2, 3].map(n => famCount(fam, n)), d = cnt[1] - cnt[0], c = cnt[0] - d, f = n => d * n + c;
    const ask = r.pick(["four", "far", "far", "rule", "which", "which"]), pic = svgPattern(fam, F.title), what = F.what;
    const lead = `${F.who}. Figures 1, 2 and 3 are shown.`, see = [`Count: Figure 1 has ${cnt[0]}, Figure 2 has ${cnt[1]}, Figure 3 has ${cnt[2]} ${what}.`, `Each new figure adds ${d} ${what}, so Figure n has $${seqRule(d, c)}$.`];
    const extra = k => ({ pic, uid: `pattern|${fam}|${ask}|${k}`, data: { seq: "pic", fam, ask, cnt, d, c, k } });
    if (ask === "four") { const k = r.pick([4, 4, 5]); return num(`${lead} How many ${what} are in Figure ${k}?`, f(k), `How many ${what} does each new figure add?`, [see[0], `Each new figure adds ${d}: ` + seqList(n => f(n), 1, k).join(" → ")], extra(k)); }
    if (ask === "far") { const k = r.pick([10, 12, 15, 20, 25, 30, 50]); return num(`${lead} How many ${what} are needed for Figure ${k}?`, f(k), "Find the rule for Figure n first. Counting all the way would take ages!", see.concat([`Figure ${k}: $${d} \\times ${k} ${pm(c)} = ${f(k)}$`]), extra(k)); }
    if (ask === "rule") { const right = seqRule(d, c);
      return mcq(r, `${lead} Which rule gives the number of ${what} in Figure n?`, T(right), [seqRule(1, d), seqRule(d, cnt[0]), seqRule(c, d), seqRule(d + 1, c - 1), seqRule(d, c + 1)].filter(w => w !== right).map(T), `Each figure adds the same number of ${what}. That number goes in front of n.`, see.concat([`Check Figure 3: $${d} \\times 3 ${pm(c)} = ${cnt[2]}$ ✓`]), extra("rule")); }
    const N = r.int(6, 40), v = f(N);
    return num(`${lead} Which figure uses exactly ${v} ${what}?`, N, "Write the rule for Figure n, make it equal to the number, and solve.", see.concat([`$${seqRule(d, c)} = ${v}$`, `$${coef(d)}n = ${v - c}$`, `$n = ${v - c} \\div ${d} = ${N}$, so it is Figure ${N}.`]), extra(v));
  }
  const s = pickSeq(r, true), xs = seqList(s.f, 1, 4), { d, c } = s;
  if (t === "rule") {
    const right = seqRule(d, c), wrong = [seqRule(1, d), seqRule(d, xs[0]), seqRule(c, d), seqRule(d, -c), seqRule(-d, c), seqRule(d, c + 1), seqRule(d + 1, c - 1)].filter(w => w !== right);
    return mcq(r, `Which is the nth term of the sequence ${seqShow(xs)}?`, T(right), wrong.map(T), `The difference tells you the number in front of n. Then check with the 1st term.`, ruleSteps(d, c, xs[0]).concat([`Check: $n = 2$ gives $${d} \\times 2 ${pm(c)} = ${xs[1]}$ ✓`]), { data: { seq: "rule", xs, d, c } });
  }
  if (t === "term") { const k = r.pick([10, 12, 15, 20, 25, 30, 40, 50, 100]), v = s.f(k);
    return num(`${seqSay(r, xs.concat(v))} ${seqShow(xs)} What is the ${ord(k)} term?`, v, "Find the nth term first, then put in the term number.", ruleSteps(d, c, xs[0]).concat([`${ord(k)} term: $${d} \\times ${k} ${pm(c)} = ${v}$`]), { keys: ["-"], data: { seq: "term", xs, d, c, k } }); }
  const N = r.int(8, 60), v = s.f(N);
  if (t === "which") return num(`${seqSay(r, xs.concat(v))} ${seqShow(xs)} Which term is equal to ${T(v)}? (type the term number)`, N, "Write the nth term, then make it equal to the number and solve.", ruleSteps(d, c, xs[0]).concat([`$${seqRule(d, c)} = ${v}$`, `$${coef(d)}n = ${v} ${undo(c)} = ${v - c}$`, `$n = ${v - c} \\div ${paren(d)} = ${N}$, so it is the ${ord(N)} term.`]), { data: { seq: "which", xs, d, c, v } });
  // isin: is the number a term? (yes about half the time; "no" numbers fall between two terms)
  const yes = Math.abs(d) < 2 || r.chance(.5), w = yes ? v : v + (d > 0 ? 1 : -1) * r.int(1, Math.abs(d) - 1), q = (w - c) / d, lo = Math.floor(q), hi = Math.ceil(q);
  const right = yes ? `Yes, it is the ${ord(N)} term` : `No, n would be ${q.toFixed(2)}…, not a whole number`;
  const wrongs = yes ? [`No, it is not in the sequence`, `Yes, it is the ${ord(N + 1)} term`, `Yes, it is the ${ord(N - 1)} term`] : [`Yes, it is the ${ord(lo)} term`, `Yes, it is the ${ord(hi)} term`, `Yes, it is the ${ord(hi + 1)} term`];
  return mcq(r, `${seqSay(r, xs.concat(w))} ${seqShow(xs)} Is ${T(w)} in this sequence?`, right, wrongs, "Make the nth term equal to the number. A term number must be a whole number.", ruleSteps(d, c, xs[0]).concat([`$${coef(d)}n = ${w} ${undo(c)} = ${w - c}$`, `$n = ${w - c} \\div ${paren(d)} = ${fmt(+q.toFixed(3))}${Number.isInteger(q) ? "" : "\\ldots"}$`, yes ? `n is a whole number, so ${w} is the ${ord(N)} term.` : `n is not a whole number (it is between ${lo} and ${hi}), so ${w} is not in the sequence.`]), { data: { seq: "isin", xs, d, c, w, yes } });
});
topic(7, "story", "Royal Challenges", "📜", "Sec 1 word problems", r => {
  const x = r.int(5, 30), k = r.int(2, 4), d = r.int(3, 15);
  return num(`The queen is ${k} times as old as the princess. In ${d} years' time, the sum of their ages will be ${(k + 1) * x + 2 * d}. How old is the princess now?`, x, "Let the princess be x years old; write an equation.", [`Princess = x, Queen = ${k}x`, `$(x + ${d}) + (${k}x + ${d}) = ${(k + 1) * x + 2 * d}$`, `$${k + 1}x = ${(k + 1) * x}$, so $x = ${x}$`], { data: { L: [k + 1, 2 * d], R: [0, (k + 1) * x + 2 * d], k, d } });
}, { story: true });

/* ---------- Grade 8 (Secondary 2) ---------- */
topic(8, "expand2", "Double Brackets", "🎀", "Expand (x + a)(x + b)", r => {
  const a = r.nz(-9, 9), b = r.nz(-9, 9), k = r.chance(.3) ? r.int(2, 3) : 1, right = poly([[k, 2], [k * b + a, 1], [a * b, 0]]);
  const W = [poly([[k, 2], [a * b, 0]]), poly([[k, 2], [k * b + a, 1], [a + b, 0]]), poly([[k, 2], [-(k * b + a), 1], [a * b, 0]]), poly([[k, 2], [k * a + b, 1], [a * b, 0]]), poly([[k, 2], [k * b + a, 1], [-a * b, 0]]), poly([[k, 2], [k * b - a, 1], [a * b, 0]])];
  return mcq(r, `Expand ${T(`(${lin(k, a)})(${lin(1, b)})`)}`, T(right), W.filter(w => w !== right).map(T),
    "Multiply every term in the first bracket by every term in the second (FOIL).", [`First: $${poly([[k, 1]])} \\cdot x = ${poly([[k, 2]])}$`, `Outer + inner: $${poly([[k, 1]])} \\cdot ${paren(b)} + ${paren(a)} \\cdot x = ${poly([[k * b + a, 1]])}$`, `Last: $${paren(a)} \\cdot ${paren(b)} = ${a * b}$`, `$${right}$`], { data: { a, b, k } });
});
topic(8, "factorise", "Factor Fairies", "🧚‍♀️", "Factorise x² + bx + c", r => {
  const p = r.nz(-9, 9), q = r.nz(-9, 9), e = poly([[1, 2], [p + q, 1], [p * q, 0]]), F = (u, v) => `(${lin(1, u)})(${lin(1, v)})`, right = F(p, q);
  return mcq(r, `Factorise ${T(e)}`, T(right), [F(-p, -q), F(p, -q), F(-p, q), F(p + 1, q - 1), F(p * q, 1), F(p - 1, q + 1)].filter(w => w !== right && w !== F(q, p)).map(T), `Find two numbers that multiply to ${p * q} and add to ${p + q}.`, [`$${paren(p)} \\times ${paren(q)} = ${p * q}$ and $${paren(p)} + ${paren(q)} = ${p + q}$`, `So $${e} = ${right}$`], { data: { p, q } });
});
topic(8, "pyth", "Pythagoras' Bridge", "📐", "Right-angled triangles", r => {
  const [a, b, c] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29]]), k = r.int(1, 3), A = a * k, B = b * k, C = c * k, t = r.int(0, 2);
  if (t === 2) { const x = r.int(2, 12), y = r.int(2, 12), h = Math.sqrt(x * x + y * y); return num(`A ladder reaches a tower window. Its foot is ${x} m from the tower and the window is ${y} m high. How long is the ladder? (1 d.p.)`, rd(h, 1), "c² = a² + b²", [`$c^2 = ${x}^2 + ${y}^2 = ${x * x + y * y}$`, `$c = \\sqrt{${x * x + y * y}} \\approx ${rd(h, 1).toFixed(1)}$ m`], { a: rd(h, 1).toFixed(1), keys: ["."], tol: 0.051, data: { x, y } }); }
  if (t === 0) return num(`A right-angled triangle has shorter sides ${A} cm and ${B} cm. How long is the hypotenuse?`, C, "Hypotenuse² = a² + b²", [`$c^2 = ${A}^2 + ${B}^2 = ${A * A} + ${B * B} = ${C * C}$`, `$c = \\sqrt{${C * C}} = ${C}$ cm`], { data: { x: A, y: B } });
  return num(`A right-angled triangle has hypotenuse ${C} cm and one side ${A} cm. How long is the other side?`, B, "Other side² = hypotenuse² − known side²", [`$b^2 = ${C}^2 - ${A}^2 = ${C * C} - ${A * A} = ${B * B}$`, `$b = ${B}$ cm`], { data: { h: C, x: A } });
});
/* ---------- 🗺️ Scale-Model Studio (MOE Sec 2 congruence and similarity): congruent triangles (matching sides and angles by
   the order of the letters), similar triangles (scale factor, a missing side either way, a missing angle), similar
   rectangles (enlargement keeps the shape) and scale drawings (map scales 1 : n both ways, scale models). Triangles are
   drawn to scale side by side with matching angles in matching colours; every option and usual slip has a why-not note. */
// small triangles with three different whole-number sides [AB, BC, CA], none too thin
const SIM_TRI = [[6, 5, 4], [7, 6, 5], [7, 4, 6], [8, 7, 6], [8, 5, 7], [6, 3, 5], [8, 4, 7], [9, 6, 8], [5, 4, 3], [9, 7, 5], [8, 6, 5], [7, 5, 8]];
// scale factors as fractions [top, bottom]
const SIM_K = [[2, 1], [2, 1], [3, 1], [3, 1], [4, 1], [3, 2], [5, 2]];
const SIDE = ["AB", "BC", "CA"], BIG = ["PQ", "QR", "RP"], CORNER = ["A", "B", "C"], BIGC = ["P", "Q", "R"];
const ANG_FILL = ["#FFC9DA", "#C9E6FF", "#CFF3DF"];
// corners from the sides (AB on the ground, C above it) or from two angles at A and B with AB = c
const triFromSides = ([c, a, b]) => { const x = (b * b + c * c - a * a) / (2 * c); return [[0, 0], [c, 0], [x, Math.sqrt(b * b - x * x)]]; };
const triFromAngles = (al, be, c = 6) => { const t = c * sinD(be) / sinD(al + be); return [[0, 0], [c, 0], [t * cosD(al), t * sinD(al)]]; };
const turnPts = (P, deg, flip) => P.map(([x, y]) => rotPt([flip ? -x : x, y], deg));
const shift = (P, dx) => { const x0 = Math.min(...P.map(p => p[0])), y0 = Math.min(...P.map(p => p[1])); return P.map(([x, y]) => [x - x0 + dx, y - y0]); };
// two triangles on one card at one scale: tris = [{ P: 3 corners (maths coords), names, sides: [AB, BC, CA labels], angs: [corner labels] }]
const svgTwins = (title, tris, label = "two triangles", note = "") => {
  const all = [].concat(...tris.map(t => t.P)), S = fitBox(all, [30, 50, 240, 122]);
  let body = "";
  tris.forEach((t, n) => { const P = t.P.map(S), G = [(P[0][0] + P[1][0] + P[2][0]) / 3, (P[0][1] + P[1][1] + P[2][1]) / 3];
    body += `<g class="stri" data-n="${n}">` + figShape(P, n ? PASTEL[1] : PASTEL[0]);
    P.forEach((V, i) => { // matching corners get matching colours; a corner label (angle) sits inside the corner
      const A = P[(i + 1) % 3], B = P[(i + 2) % 3], u1 = vdir(V, A), u2 = vdir(V, B), r = 15, { t1: a1, d, deg } = angSweep(u1, u2);
      body += `<path class="sang" d="${angWedge(V, u1, u2, r, d)}" fill="${ANG_FILL[i]}" stroke="${LINE}" stroke-width="1.2"/>`;
      const o = vdir(G, V); body += `<text class="mvtx" x="${f1(V[0] + o[0] * 12)}" y="${f1(V[1] + o[1] * 12 + 4.5)}" font-size="13" text-anchor="middle" font-weight="900" fill="${INK}">${t.names[i]}</text>`;
      if (t.angs && t.angs[i]) { const m = a1 + d / 2, L = deg < 45 ? 31 : deg < 70 ? 26 : 21; body += angText(t.angs[i], V[0] + Math.cos(m) * L, V[1] + Math.sin(m) * L + 4, 14, 11.5, ` class="mang" data-t="${esc(t.angs[i])}"`); }
    });
    (t.sides || []).forEach((s, i) => { if (!s) return; const a = P[i], b = P[(i + 1) % 3], m = mid(a, b), o = vdir(G, m); body += figLab(m, s, o[0] * 15, o[1] * 13, "middle"); });
    body += "</g>"; });
  if (note) body += `<text class="snote" x="150" y="198" font-size="9.5" text-anchor="middle" font-weight="800" fill="${LINE}">${esc(note)}</text>`;
  return cardSvg(300, 206, title, 20, body, label, "mpic chart mens sim");
};
// the bigger copy of corners P, drawn g = min(k, 1.75) times as big (so the small triangle stays readable) to the right of P
const SIM_DRAW = 1.75;
const bigCopy = (P, k) => { const g = Math.min(k, SIM_DRAW), w = Math.max(...P.map(p => p[0])) - Math.min(...P.map(p => p[0])); return shift(P.map(p => [p[0] * g, p[1] * g]), Math.max(...P.map(p => p[0])) + .45 * w + 1); };
// a cream map (or plan) with two pastel pins d cm apart, drawn at 18 px per cm, and the scale printed underneath
const svgMap = (title, d, from, to, scaleText) => { const L = d * 18, x0 = 150 - L / 2, y = 96;
  const pin = (x, c, name) => `<circle class="mpin" cx="${f1(x)}" cy="${y}" r="9" fill="${c}" stroke="${INK}" stroke-width="2"/><circle cx="${f1(x)}" cy="${y}" r="3" fill="#FFFDF8"/><text x="${f1(x)}" y="${y + 26}" font-size="11" text-anchor="middle" font-weight="900" fill="${INK}">${esc(name)}</text>`;
  return cardSvg(300, 168, title, 20, `<rect x="12" y="32" width="276" height="100" rx="12" fill="#F2FAFF" stroke="#CFE6F7" stroke-width="2"/><path d="M24,120 q30,-14 60,-2 t60,0" fill="none" stroke="#C8F2DC" stroke-width="7" stroke-linecap="round"/><path d="M210,52 q20,10 44,0" fill="none" stroke="#BDE7FF" stroke-width="6" stroke-linecap="round"/>`
    + `<line class="mroute" x1="${f1(x0)}" y1="${y}" x2="${f1(x0 + L)}" y2="${y}" stroke="#ff8fa3" stroke-width="3" stroke-dasharray="7 5" stroke-linecap="round"/>` + pin(x0, PASTEL[0], from) + pin(x0 + L, PASTEL[3], to)
    + figLab([150, y - 14], `${d} cm`) + `<text x="150" y="154" font-size="12" text-anchor="middle" font-weight="900" fill="${INK}">${esc(scaleText)}</text>`, "map with a scale"); };
// a w × h rectangle (a photo or card) drawn to scale with its two lengths
const svgRect = (title, w, h, lab) => figCard(title, [[0, 0], [w, 0], [w, h], [0, h]], S => { const A = S([0, 0]), B = S([w, 0]), C = S([w, h]), D = S([0, h]);
  return figShape([A, B, C, D], PASTEL[4]) + `<circle cx="${f1(mid(A, C)[0])}" cy="${f1(mid(A, C)[1])}" r="${f1(Math.min(B[0] - A[0], A[1] - D[1]) * .22)}" fill="${PASTEL[0]}" stroke="${LINE}" stroke-width="1.5"/>` + figLab(mid(A, B), lab.w, 0, 16) + figLab(mid(B, C), lab.h, 8, 0, "start"); }, "rectangle");
const kTex = ([n, d]) => fracTex(n, d), kVal = ([n, d]) => n / d;
const cm = v => `${fmt(v)} cm`;
const SIM_WHO = ["Fairy Pip's growing spell", "The castle's magic copier", "Sumi the star fairy's shrink-and-grow wand", "The royal sticker printer"];
const SIM = {
  // a missing side of similar triangles, on the bigger one or the smaller one
  side: r => { const s = r.pick(SIM_TRI), K = r.pick(SIM_K), k = kVal(K), sm = K[1] === 2 ? s.map(v => 2 * v) : s, bg = sm.map(v => v * k);
    const i = r.int(0, 2), j = (i + r.int(1, 2)) % 3, onBig = r.chance(.6), who = r.pick(SIM_WHO);
    const lab = (arr, xIdx) => [0, 1, 2].map(n => n === i ? cm(arr[i]) : n === j ? (xIdx ? "x" : cm(arr[j])) : "");
    const sP = triFromSides(sm), bP = bigCopy(sP, k), val = onBig ? bg[j] : sm[j];
    const q = `${who} turns triangle ABC into a bigger copy, triangle PQR (A → P, B → Q, C → R), so the two triangles are similar. Find ${onBig ? BIG[j] : SIDE[j]}, marked x, in cm.`;
    const steps = [`Matching sides: ${SIDE[i]} and ${BIG[i]}. Scale factor $= \\frac{${BIG[i]}}{${SIDE[i]}} = \\frac{${fmt(bg[i])}}{${fmt(sm[i])}} = ${kTex(K)}$`,
      onBig ? `${BIG[j]} matches ${SIDE[j]}, so $x = ${fmt(sm[j])} \\times ${kTex(K)} = ${fmt(val)}$ cm` : `${SIDE[j]} matches ${BIG[j]}, so $x = ${fmt(bg[j])} \\div ${kTex(K)} = ${fmt(val)}$ cm`];
    const slips = onBig ? [[sm[j] + bg[i] - sm[i], `That adds ${fmt(bg[i] - sm[i])} cm, like ${SIDE[i]} → ${BIG[i]}. Similar shapes grow by multiplying every side by the same scale factor, not by adding the same amount.`],
      [sm[j] / k, "That made the side smaller. PQR is the bigger copy, so multiply by the scale factor."], [sm[j] * k * k, "That multiplies by the scale factor twice. Once is enough for a length."]]
      : [[bg[j] - (bg[i] - sm[i]), `That takes away ${fmt(bg[i] - sm[i])} cm. Similar shapes shrink by dividing every side by the same scale factor, not by taking away the same amount.`],
      [bg[j] * k, "That made the side bigger. ABC is the smaller triangle, so divide by the scale factor."], [bg[j] / k / k, "That divides by the scale factor twice. Once is enough for a length."]];
    return numWhy(q, val, `Find the scale factor from a pair of matching sides, then use it on ${onBig ? SIDE[j] : BIG[j]}.`, steps, slips,
      { keys: ["."], pic: svgTwins("Similar triangles", [{ P: sP, names: CORNER, sides: lab(sm, !onBig) }, { P: bP, names: BIGC, sides: lab(bg, onBig) }], "similar triangles", k > SIM_DRAW ? "Not drawn to scale" : ""), uid: `sim|side|${sm}|${K}|${i}${j}|${onBig}`, data: { sim: "side", sm, bg, K, i, j, onBig } }); },
  // the scale factor of an enlargement (or of the reduction back)
  k: r => { const s = r.pick(SIM_TRI), K = r.pick(SIM_K), k = kVal(K), sm = K[1] === 2 ? s.map(v => 2 * v) : s, bg = sm.map(v => v * k);
    const i = r.int(0, 2), j = (i + 1) % 3, down = r.chance(.35), right = T(down ? fracTex(K[1], K[0]) : kTex(K));
    const sides = arr => [0, 1, 2].map(n => n === i || n === j ? cm(arr[n]) : "");
    const q = down ? `Triangle PQR is shrunk down to make the similar triangle ABC (P → A, Q → B, R → C). What is the scale factor of this reduction?` : `Triangle ABC is enlarged to make the similar triangle PQR (A → P, B → Q, C → R). What is the scale factor of the enlargement?`;
    const [from, to, fi, ti] = down ? ["PQR", "ABC", bg, sm] : ["ABC", "PQR", sm, bg];
    const wrong = [[T(down ? kTex(K) : fracTex(K[1], K[0])), down ? `That is the scale factor the other way, from ABC up to PQR. Going down to the smaller triangle, the scale factor is less than 1.` : `That is the scale factor the other way, from PQR down to ABC. An enlargement has a scale factor bigger than 1.`],
      [T(fmt(Math.abs(bg[i] - sm[i]))), `${fmt(Math.abs(bg[i] - sm[i]))} cm is how much longer ${BIG[i]} is than ${SIDE[i]}. A scale factor divides: new length ÷ old length.`],
      [T(fracTex(ti[j], fi[i])), `${(down ? SIDE : BIG)[j]} and ${(down ? BIG : SIDE)[i]} are not a matching pair. Compare sides whose letters match, like ${(down ? BIG : SIDE)[i]} and ${(down ? SIDE : BIG)[i]}.`],
      [T(fracTex(K[0] + K[1], K[1])), `Check with a pair of matching sides: ${fmt(fi[i])} × that doesn't give ${fmt(ti[i])}.`]];
    return mcqWhy(r, q, right, `New length ÷ old length for any matching pair: ${(down ? SIDE : BIG)[i]} ÷ ${(down ? BIG : SIDE)[i]} = ${fmt(ti[i])} ÷ ${fmt(fi[i])} = ${down ? fracStr(K[1], K[0]) : fracStr(K[0], K[1])}, the same for every pair.`, wrong,
      "Scale factor = a length on the new shape ÷ the matching length on the old shape.", [`${from} → ${to}: matching sides ${(down ? BIG : SIDE)[i]} = ${fmt(fi[i])} cm and ${(down ? SIDE : BIG)[i]} = ${fmt(ti[i])} cm`, `Scale factor $= \\frac{${fmt(ti[i])}}{${fmt(fi[i])}} = ${down ? fracTex(K[1], K[0]) : kTex(K)}$`, `Check: $\\frac{${fmt(ti[j])}}{${fmt(fi[j])}}$ is the same.`],
      { pic: svgTwins("Similar triangles", [{ P: triFromSides(sm), names: CORNER, sides: sides(sm) }, { P: bigCopy(triFromSides(sm), k), names: BIGC, sides: sides(bg) }], "similar triangles", k > SIM_DRAW ? "Not drawn to scale" : ""), uid: `sim|k|${sm}|${K}|${i}|${down}`, data: { sim: "k", sm, bg, K, i, j, down } }); },
  // a missing angle: similar triangles keep their angles
  angle: r => { let al, be, ga; do { al = 5 * r.int(7, 16); be = 5 * r.int(7, 20); ga = 180 - al - be; } while (ga < 30 || al === be || be === ga || al === ga || ga === 90);
    const K = r.pick(SIM_K), k = kVal(K), pick = r.int(0, 2), A = [al, be, ga], giv = [0, 1, 2].filter(n => n !== pick), small = triFromAngles(al, be, 6), big = bigCopy(small, k);
    // one known angle on each triangle (sometimes both on ABC), x on PQR
    const onBoth = r.chance(.5), sa = [0, 1, 2].map(n => n === giv[0] || (n === giv[1] && !onBoth) ? A[n] + "°" : ""), ba = [0, 1, 2].map(n => n === pick ? "x" : n === giv[1] && onBoth ? A[n] + "°" : "");
    const q = `Triangle PQR is an enlargement of triangle ABC with scale factor ${fmt(k)} (A → P, B → Q, C → R). Find the angle marked x at ${BIGC[pick]}.`;
    return numWhy(q, A[pick], "Enlarging a shape changes its size but not its angles. Matching angles are equal.",
      [`∠${CORNER[giv[0]]} = ∠${BIGC[giv[0]]} = ${A[giv[0]]}° and ∠${CORNER[giv[1]]} = ∠${BIGC[giv[1]]} = ${A[giv[1]]}° (matching angles are equal)`, `Angles in a triangle add up to 180°: x = 180° − ${A[giv[0]]}° − ${A[giv[1]]}° = ${A[pick]}°`],
      [[A[pick] * k, `Angles don't grow in an enlargement. Only the lengths are multiplied by ${fmt(k)}; the shape (and every angle) stays the same.`], [A[giv[0]], `${A[giv[0]]}° belongs at ${CORNER[giv[0]]} and ${BIGC[giv[0]]}. x is at ${BIGC[pick]}, which matches ${CORNER[pick]}.`],
       [A[giv[1]], `${A[giv[1]]}° is the angle at ${BIGC[giv[1]]}. Use the angle sum of a triangle to find the third angle.`], [A[giv[0]] + A[giv[1]], "That adds the two known angles. Take them away from 180° instead."]],
      { pic: svgTwins("Similar triangles", [{ P: small, names: CORNER, angs: sa }, { P: big, names: BIGC, angs: ba }], "similar triangles", k > SIM_DRAW ? "Not drawn to scale" : ""), uid: `sim|angle|${al},${be}|${K}|${pick}|${onBoth}`, data: { sim: "angle", A, K, pick, giv, onBoth } }); },
  // congruent triangles: the same size and shape, matched by the order of the letters (the copy may be turned or flipped)
  cong: r => { const rot = r.pick([0, 90, 180, 270, 60, 300]), flip = r.chance(.4);
    if (r.chance(.6)) { const s = r.pick(SIM_TRI), j = r.int(0, 2), P = triFromSides(s), Q = shift(turnPts(P, rot, flip), 0); const Qs = shift(Q, Math.max(...P.map(p => p[0])) + 2.2);
      const lab = s.map(cm), other = [0, 1, 2].filter(n => n !== j);
      return mcqWhy(r, `Triangle ABC is congruent to triangle PQR (A → P, B → Q, C → R). The copy has been ${flip ? "flipped over and " : ""}turned. How long is ${BIG[j]}?`, cm(s[j]), `${BIG[j]} matches ${SIDE[j]} (the same letter positions), and congruent shapes are exactly the same size, so ${BIG[j]} = ${SIDE[j]} = ${cm(s[j])}.`,
        other.map(n => [cm(s[n]), `${cm(s[n])} is ${SIDE[n]}, which matches ${BIG[n]}, not ${BIG[j]}. Match the letters in order: A → P, B → Q, C → R.`]).concat([[cm(2 * s[j]), "Congruent triangles are exactly the same size, so no side is doubled."], [cm(s[j] + 1), `Congruent sides are exactly equal, so ${BIG[j]} is the same as ${SIDE[j]}, not 1 cm more.`]]),
        "Turning or flipping a shape doesn't change its sides. Match the letters in the same order.", [`Triangle ABC ≅ triangle PQR, so ${SIDE[j]} matches ${BIG[j]}.`, `${BIG[j]} = ${SIDE[j]} = ${cm(s[j])}`],
        { pic: svgTwins("Congruent triangles", [{ P, names: CORNER, sides: lab }, { P: Qs, names: BIGC, sides: [0, 1, 2].map(n => n === j ? "x" : "") }]), uid: `sim|cong|${s}|${j}|${rot}|${flip}`, data: { sim: "cong", k: "side", s, j, rot, flip } }); }
    let al, be, ga; do { al = 5 * r.int(7, 16); be = 5 * r.int(7, 20); ga = 180 - al - be; } while (ga < 30 || al === be || be === ga || al === ga || ga === 90);
    const A = [al, be, ga], pick = r.int(0, 2), giv = [0, 1, 2].filter(n => n !== pick), P = triFromAngles(al, be, 6), Qs = shift(turnPts(P, rot, flip), Math.max(...P.map(p => p[0])) + 2.2);
    return mcqWhy(r, `Triangle ABC is congruent to triangle PQR (A → P, B → Q, C → R). ∠${CORNER[giv[0]]} = ${A[giv[0]]}° and ∠${CORNER[giv[1]]} = ${A[giv[1]]}°. What is ∠${BIGC[pick]}?`, A[pick] + "°", `∠${BIGC[pick]} matches ∠${CORNER[pick]}, the third angle of ABC: 180° − ${A[giv[0]]}° − ${A[giv[1]]}° = ${A[pick]}°.`,
      [[A[giv[0]] + "°", `${A[giv[0]]}° is ∠${CORNER[giv[0]]}, which matches ∠${BIGC[giv[0]]}, not ∠${BIGC[pick]}.`], [A[giv[1]] + "°", `${A[giv[1]]}° is ∠${CORNER[giv[1]]}, which matches ∠${BIGC[giv[1]]}, not ∠${BIGC[pick]}.`],
       [(A[giv[0]] + A[giv[1]]) + "°", "That adds the two angles you know. The third angle is what is left from 180°."], [(180 - A[giv[0]]) + "°", "That only takes one angle from 180°. Take both known angles away."]],
      "Matching angles of congruent triangles are equal. Angles in a triangle add up to 180°.", [`∠${BIGC[pick]} matches ∠${CORNER[pick]}.`, `∠${CORNER[pick]} = 180° − ${A[giv[0]]}° − ${A[giv[1]]}° = ${A[pick]}°`],
      { pic: svgTwins("Congruent triangles", [{ P, names: CORNER }, { P: Qs, names: BIGC, angs: [0, 1, 2].map(n => n === pick ? "x" : "") }]), uid: `sim|congA|${al},${be}|${pick}|${rot}|${flip}`, data: { sim: "cong", k: "angle", A, pick, rot, flip } }); },
  // similar rectangles: an enlargement multiplies both sides by the same number
  rect: r => { const K = r.pick([[2, 1], [3, 1], [4, 1], [3, 2], [5, 2]]), k = kVal(K); let a, b; do { a = r.int(2, 7) * K[1]; b = r.int(3, 10) * K[1]; } while (b <= a || b % a === 0 && b / a > 2);
    const what = r.pick([["Princess Mira's photo", "Photo"], ["A postcard of the castle", "Postcard"], ["A trading card of a baby dragon", "Card"], ["A sticker for the school fun fair", "Sticker"]]), A = a * k, B = b * k, d = A - a, sz = (x, y) => `${fmt(x)} cm by ${fmt(y)} cm`;
    const ok = (x, y) => x * b !== y * a, wrong = [[sz(a + d, b + d), `Adding ${fmt(d)} cm to both sides changes the shape: the short side grows by a bigger share than the long side.`],
      [sz(A, b), "Only one side was enlarged, so the copy is squashed. Both sides must be multiplied by the same number."], [sz(A, B + K[0]), `${fmt(A)} ÷ ${a} = ${fmt(k)} but ${fmt(B + K[0])} ÷ ${b} isn't, so the sides weren't multiplied by the same number.`],
      [sz(a * (k + 1), B), `The two sides were multiplied by different numbers (${fmt(k + 1)} and ${fmt(k)}), so the shape changes.`], [sz(A + 1, B - 1), "Check: new ÷ old must be the same for both sides. Here it isn't."]].filter(([o]) => { const m = o.match(/[\d.]+/g).map(Number); return ok(m[0], m[1]); });
    return mcqWhy(r, `${what[0]} is ${sz(a, b)}. Which enlargement is similar to it (the same shape)?`, sz(A, B), `${fmt(A)} ÷ ${a} = ${fmt(k)} and ${fmt(B)} ÷ ${b} = ${fmt(k)}: both sides are multiplied by the same scale factor, ${fmt(k)}.`, wrong,
      "Similar rectangles: both sides are multiplied by the same scale factor.", [`Check each choice: new short side ÷ ${a} and new long side ÷ ${b} must give the same number.`, `${fmt(A)} ÷ ${a} = ${fmt(k)} and ${fmt(B)} ÷ ${b} = ${fmt(k)} ✓`],
      { pic: svgRect(what[1], b, a, { w: cm(b), h: cm(a) }), uid: `sim|rect|${a},${b}|${K}`, data: { sim: "rect", a, b, K } }); },
  // scale drawings: a map scale 1 : n (map cm → real km, or back) and a scale model 1 : n (model cm → real m)
  map: r => { const t = r.pick(["toKm", "toKm", "toCm", "model"]);
    if (t === "model") { const n = r.pick([20, 25, 50, 100, 200]), h = r.int(4, 30) * (n === 25 ? 4 : n === 20 ? 5 : 1), v = h * n / 100, what = r.pick(["castle tower", "Ferris wheel", "pirate ship", "lighthouse", "dragon statue"]);
      return numWhy(`A model of the ${what} is built to a scale of 1 : ${n}. The model is ${h} cm tall. How tall is the real ${what}, in metres?`, v, `Every 1 cm on the model is ${n} cm in real life. Then change cm into m.`, [`Real height $= ${h} \\times ${n} = ${grp(h * n)}$ cm`, `$${grp(h * n)} \\text{ cm} \\div 100 = ${fmt(v)}$ m`],
        [[h * n, `${grp(h * n)} is the real height in cm. The question wants metres: divide by 100.`], [h / n, "The real one is bigger than the model, so multiply by the scale, don't divide."], [h * n / 1000, "There are 100 cm in 1 m, not 1 000."]], { keys: ["."], data: { sim: "map", k: t, n, h } }); }
    const n = r.pick([10000, 20000, 25000, 50000, 100000, 200000]), place = r.pick([["Castle", "Lake"], ["Village", "Tower"], ["Bakery", "Forest"], ["Harbour", "Lighthouse"], ["School", "Zoo"]]);
    const say = `1 : ${grp(n)}`, d = t === "toKm" ? r.int(2, 12) + (r.chance(.25) ? .5 : 0) : 0;
    if (t === "toKm") { const v = d * n / 100000;
      return numWhy(`On a map of the kingdom with a scale of ${say}, the ${place[0]} and the ${place[1]} are ${fmt(d)} cm apart. What is the real distance in km?`, v, `1 cm on the map is ${grp(n)} cm in real life. 1 km = 100 000 cm.`, [`Real distance $= ${fmt(d)} \\times ${grp(n)} = ${grp(d * n)}$ cm`, `$${grp(d * n)} \\div 100\\,000 = ${fmt(v)}$ km`],
        [[d * n, `${grp(d * n)} is the distance in cm. Change it to km: divide by 100 000.`], [d * n / 100, `${grp(d * n / 100)} is the distance in metres. There are 1 000 m in 1 km, so divide again.`], [d * n / 1000, "1 km is 100 000 cm (100 cm × 1 000 m), not 1 000 cm."], [d / n, "The real distance is much longer than the map, so multiply by the scale."]],
        { keys: ["."], pic: svgMap("Map of the kingdom", d, place[0], place[1], `Scale ${say}`), uid: `sim|map|${n}|${d}|${place[0]}`, data: { sim: "map", k: t, n, d } }); }
    const v = r.int(1, 12) * r.pick([1, 2]), km = +fmt(v * n / 100000);
    return numWhy(`On a map with a scale of ${say}, how far apart will two places that are really ${fmt(km)} km apart be drawn, in cm?`, v, `Change the km into cm first (× 100 000), then divide by ${grp(n)}.`, [`$${fmt(km)}$ km $= ${grp(km * 100000)}$ cm`, `Map distance $= ${grp(km * 100000)} \\div ${grp(n)} = ${fmt(v)}$ cm`],
      [[km * 1000 / n, "That changes km into metres only. To get cm, 1 km = 100 000 cm."], [km * n, "The map is much smaller than real life, so divide by the scale, don't multiply."], [km * 10000 / n, "1 km is 100 000 cm, not 10 000 cm."], [km * 100000, `That is the real distance in cm. Divide by ${grp(n)} to shrink it onto the map.`]],
      { keys: ["."], data: { sim: "map", k: t, n, km } }); }
};
topic(8, "similar", "Scale-Model Studio", "🗺️", "Congruent and similar shapes, scale drawings and maps", r => {
  const k = r.pick(["side", "side", "side", "k", "k", "angle", "angle", "cong", "cong", "cong", "rect", "rect", "map", "map", "map"]);
  return SIM[k](r);
});
/* ---------- 🍦 Ice-Cream Cone Café (MOE Sec 2 mensuration: volume and surface area of pyramids, cones and spheres) ----------
   Pyramids (V = ⅓ × base area × height, the total surface area of a square-based pyramid from the slant height of its faces),
   cones (V = ⅓πr²h, the curved surface πrl, finding the slant height l with Pythagoras first), spheres and hemispheres
   (V = ⁴⁄₃πr³, ⅔πr³, the surface 4πr², an open bowl's 2πr², a solid dome's 3πr²), composite solids (a waffle cone with a
   hemisphere scoop on top, a castle turret: a cylinder with a cone roof) and working back (a cone's or pyramid's height from
   its volume, a ball's radius from its surface area). Heights, slant heights and radii come from whole-number right triangles
   and every solid is drawn to scale on a cream card (outlines carry class sbody / sscoop / sroof so tests can measure them).
   Every option has a why / why-not note and typed answers name their usual slips. */
// a pyramid on an a × d rectangle (d going back into the page), apex h above the middle; lab.l draws a face's slant height
const svgPyr = (title, a, d, h, lab) => { const dv = depthV(d), C = [a / 2 + dv[0] / 2, dv[1] / 2], P = [C[0], C[1] + h], base = [[0, 0], [a, 0], [a + dv[0], dv[1]], dv];
  return figCard(title, base.concat([P]), S => { const [A, B, Bk, Ak] = base.map(S), p = S(P), c = S(C), m = S([a / 2, 0]);
    return figShape([B, Bk, p], PASTEL[1]) + figShape([A, B, p], PASTEL[4]) + figEdge(A, Ak, true) + figEdge(Ak, Bk, true) + figEdge(Ak, p, true)
      + figEdge(p, c, true) + figDot(c) + figLab(mid(p, c), lab.h, 6, 4, "start") + (lab.l ? figEdge(p, m, true) + figLab(mid(p, m), lab.l, -6, 0, "end") : "")
      + figLab(mid(A, B), lab.a, 0, 16) + (lab.d ? figLab(mid(B, Bk), lab.d, 9, 8, "start") : "");
  }, "pyramid", 214); };
// an upright cone, base radius r, height h (lab.h draws the dashed height, lab.l labels the slant side)
const svgCone = (title, r, h, lab) => figCard(title, [[-r, -OVAL * r], [r, h]], S => { const c = S([0, 0]), A = S([0, h]), rx = r * S.k, ry = OVAL * rx;
  return solidPath(coneSide(A, c, rx, ry), PASTEL[4], "sbody") + ovalBack(c, rx, ry) + (lab.h ? figEdge(A, c, true) + figRight(c, -1) + figLab(mid(A, c), lab.h, -7, 0, "end") : "")
    + ovalSize(c, rx, ry, lab, ry + 14) + (lab.l ? figLab(mid(A, [c[0] + rx, c[1]]), lab.l, 8, 0, "start") : "");
}, "cone", 214);
// a sphere, or half of one: "bowl" (flat side up, open) or "dome" (flat side down)
const svgBall = (title, r, lab, half) => figCard(title, [[-r, half === "dome" ? -OVAL * r : -r], [r, half === "bowl" ? OVAL * r : r]], S => {
  const c = S([0, 0]), R = r * S.k, ry = OVAL * R, L = [c[0] - R, c[1]], Rt = [c[0] + R, c[1]], round = sw => `A${f1(R)},${f1(R)} 0 0,${sw} ${xy(Rt)}`;
  if (half === "bowl") return solidPath(`M${xy(L)} ${round(0)} Z`, PASTEL[1], "sbody") + ovalLid(c, R, ry, PASTEL[0]) + ovalSize(c, R, ry, lab);
  if (half === "dome") return solidPath(`M${xy(L)} ${round(1)} A${f1(R)},${f1(ry)} 0 0,1 ${xy(L)} Z`, PASTEL[3], "sbody") + ovalBack(c, R, ry) + ovalSize(c, R, ry, lab, ry + 14);
  return `<circle class="sbody" cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(R)}" fill="${PASTEL[1]}" stroke="${INK}" stroke-width="2.6"/>` + ovalBack(c, R, ry)
    + `<path d="M${xy(L)} ${ovalTo(c, R, ry, 0)}" fill="none" stroke="${INK}" stroke-width="2"/>` + ovalSize(c, R, ry, lab);
}, half ? "hemisphere" : "sphere", 214);
// a waffle cone (radius r, height h, point down) with a hemisphere scoop on top
const svgCream = (title, r, h, lab) => figCard(title, [[-r, -h], [r, r]], S => { const c = S([0, 0]), A = S([0, -h]), R = r * S.k, ry = OVAL * R, L = [c[0] - R, c[1]], Rt = [c[0] + R, c[1]];
  return solidPath(`M${xy(L)} L${xy(A)} L${xy(Rt)} A${f1(R)},${f1(ry)} 0 0,1 ${xy(L)} Z`, PASTEL[4], "sbody") + solidPath(`M${xy(L)} A${f1(R)},${f1(R)} 0 0,1 ${xy(Rt)} A${f1(R)},${f1(ry)} 0 0,1 ${xy(L)} Z`, PASTEL[0], "sscoop")
    + figEdge(c, A, true) + figLab(mid(c, A), lab.h, -7, 0, "end") + ovalSize(c, R, ry, lab);
}, "cone with a hemisphere on top", 214);
// a castle turret: a cylinder (radius r, height H) with a cone roof h tall
const svgTurret = (title, r, H, h, lab) => figCard(title, [[-r, -OVAL * r], [r, H + h]], S => { const Bc = S([0, 0]), Tc = S([0, H]), A = S([0, H + h]), rx = r * S.k, ry = OVAL * rx;
  return solidPath(cylSide(Tc, Bc, rx, ry), PASTEL[2], "sbody") + ovalBack(Bc, rx, ry) + solidPath(coneSide(A, Tc, rx, ry), PASTEL[0], "sroof")
    + figEdge(A, Tc, true) + figLab(mid(A, Tc), lab.h, -7, 0, "end") + figLab(mid([Tc[0] + rx, Tc[1]], [Bc[0] + rx, Bc[1]]), lab.H, 8, 0, "start") + ovalSize(Bc, rx, ry, lab, ry + 14);
}, "cylinder with a cone on top", 214);
const piF = (n, d, u, p) => `${T(`${fracTex(n, d)}\\pi`)} ${u}${p}`; // "$\frac{80}{3}\pi$ cm³", "$36\pi$ cm²"
const PV = (n, d = 1) => piF(n, d, "cm", "³"), PA = (n, d = 1) => piF(n, d, "cm", "²");
const piS = (n, d = 1) => { const f = fracStr(n, d); return f.includes("/") ? `(${f})π` : `${f}π`; }; // in a note: "(80/3)π", "36π"
// a square pyramid's half-base s, height h and face slant height l: small whole-number right triangles, sometimes doubled
const pyrTri = r => { const [s, h, l] = r.pick(MENS_TRI.filter(t => t[0] <= 6)), k = s <= 4 ? r.pick([1, 2]) : 1; return [s * k, h * k, l * k]; };
const SOL = {
  pyrV: r => { if (r.chance(.55)) { const [s, h, l] = pyrTri(r), a = 2 * s, V = a * a * h / 3, what = r.pick([["A chocolate pyramid in the Sweet Shop window", "Chocolate pyramid"], ["A crystal paperweight on the wizard's desk", "Crystal paperweight"], ["A glass lantern for the fairy garden", "Fairy lantern"]]);
      return numWhy(`${what[0]} is a pyramid with a square base. Find its volume in cm³.`, V, "Volume of a pyramid = ⅓ × base area × height (the height that goes straight up from the middle of the base).",
        [`Base area: $${a} \\times ${a} = ${a * a}$ cm²`, `Volume: $\\frac{1}{3} \\times ${a * a} \\times ${h} = ${V}$ cm³`, `(The ${l} cm slant height runs up a sloping face, so it is not used.)`],
        [[a * a * l / 3, `${l} cm is the slant height up the middle of a face. The pyramid's height is the dashed ${h} cm line straight up from the middle of the base.`], [a * a * h, "That is a cuboid with the same base and height. A pyramid fills only one third of it, so divide by 3."],
         [a * a * h / 2, "A pyramid is one THIRD of the box around it, not one half."], [a * h / 3, `The base is a square, so its area is ${a} × ${a}, not just ${a}.`]],
        { pic: svgPyr(what[1], a, a, h, { a: `${a} cm`, h: `${h} cm`, l: `${l} cm` }), uid: `sol|pyrV|${a}|${h}`, data: { sol: "pyrV", sq: true, a, d: a, h, l } }); }
    const a = r.int(4, 12), d = r.int(3, 9); let h = r.int(3, 12); while (a * d * h % 3) h++;
    const V = a * d * h / 3, what = r.pick([["A tent for the teddy bears' picnic", "Picnic tent"], ["A cake topper", "Cake topper"], ["The roof of the bunnies' playhouse", "Playhouse roof"]]), u = what[1] === "Cake topper" ? "cm" : "dm";
    return numWhy(`${what[0]} is a pyramid on a rectangle ${a} ${u} by ${d} ${u}. It is ${h} ${u} tall. Find its volume in ${u}³.`, V, "Volume of a pyramid = ⅓ × base area × height.",
      [`Base area: $${a} \\times ${d} = ${a * d}$ ${u}²`, `Volume: $\\frac{1}{3} \\times ${a * d} \\times ${h} = ${V}$ ${u}³`],
      [[a * d * h, "That is the whole box around the pyramid. A pyramid holds one third of it."], [a * d * h / 2, "Halving is for triangles. For a pyramid, take one third."], [(a + d) * h / 3, "Multiply the length and the width to get the base area; don't add them."], [a * d / 3, `Multiply the base area by the ${h} ${u} height too.`]],
      { pic: svgPyr(what[1], a, d, h, { a: `${a} ${u}`, d: `${d} ${u}`, h: `${h} ${u}` }), uid: `sol|pyrV|${a}x${d}|${h}`, data: { sol: "pyrV", sq: false, a, d, h, u } }); },
  pyrSA: r => { const [s, h, l] = pyrTri(r), a = 2 * s, tri = a * l / 2, tent = r.chance(.4), base = tent ? 0 : a * a, tot = base + 4 * tri, u = tent ? "m" : "cm";
    const ask = tent ? "A pyramid-shaped tent for the teddy bears' picnic has a square base but no floor. How much canvas covers its four sloping sides?" : "A chocolate pyramid with a square base is wrapped all over in gold foil, base included. What is its total surface area?";
    return mcqWhy(r, ask, sq(tot, u), tent ? `Four triangles, each ½ × ${a} × ${l} = ${tri} ${u}²: 4 × ${tri} = ${tot} ${u}². There is no floor, so no square.` : `The square base, ${a} × ${a} = ${a * a} ${u}², plus four triangles of ½ × ${a} × ${l} = ${tri} ${u}² each: ${a * a} + ${4 * tri} = ${tot} ${u}².`,
      [[sq(base + 2 * a * h, u), `${h} ${u} is the height inside the pyramid. Each triangle's height is the slant height, ${l} ${u}, measured up the face.`], [sq(base + 4 * a * l, u), "Each face is a triangle, so it is ½ × base × slant height. That forgot the ½."],
       tent ? [sq(a * a + 4 * tri, u), "The tent has no floor, so the square base isn't covered with canvas."] : [sq(4 * tri, u), "That is only the four triangles. The foil covers the square base too."],
       [sq(base + 2 * tri, u), "A square-based pyramid has FOUR triangular faces, not two."], [sq(a * a * h / 3, u), `${a * a * h / 3} is the volume (the space inside), not the area of the outside.`]],
      "Unfold it in your head: one square base and four matching triangles.", (tent ? [] : [`Square base: $${a} \\times ${a} = ${a * a}$ ${u}²`]).concat([`Each triangle: $\\frac{1}{2} \\times ${a} \\times ${l} = ${tri}$ ${u}² (use the slant height ${l}, not the height ${h})`, `4 triangles: $4 \\times ${tri} = ${4 * tri}$ ${u}²`],
        tent ? [] : [`Total: $${a * a} + ${4 * tri} = ${tot}$ ${u}²`]),
      { pic: svgPyr(tent ? "Picnic tent" : "Chocolate pyramid", a, a, h, { a: `${a} ${u}`, h: `${h} ${u}`, l: `${l} ${u}` }), uid: `sol|pyrSA|${tent}|${a}|${h}`, data: { sol: "pyrSA", tent, a, h, l, u } }); },
  coneV: r => { const [rad, h, l] = r.pick(MENS_TRI), useD = r.chance(.3), what = r.pick([["A waffle cone at the Ice-Cream Café", "Waffle cone"], ["A witch's party hat", "Party hat"], ["A cone of rainbow sprinkles", "Sprinkle cone"], ["A unicorn's sparkly horn", "Unicorn horn"]]);
    const lab = Object.assign(useD ? { d: `${2 * rad} cm` } : { r: `${rad} cm` }, { h: `${h} cm`, l: `${l} cm` }), k = rad * rad * h / 3, extra = { pic: svgCone(what[1], rad, h, lab), uid: `sol|coneV|${rad}|${h}|${useD}`, data: { sol: "coneV", r: rad, h, l, useD } };
    const st = (useD ? [`Radius = ${2 * rad} ÷ 2 = ${rad} cm`] : []).concat([`Use the height ${h} cm (at right angles to the base), not the slant side ${l} cm.`]);
    if (r.chance(.35)) { const v = rd(PI3 * rad * rad * h / 3, 1); extra.data.pi = 3.142;
      return numWhy(`${what[0]} is a cone. Find its volume in cm³. Use π = 3.142 and give your answer to 1 decimal place.`, v, "Volume of a cone = ⅓ π r² h, a third of the cylinder around it.", st.concat([`$\\frac{1}{3} \\times 3.142 \\times ${rad}^2 \\times ${h} = ${approx1(PI3 * rad * rad * h / 3)}$ cm³`]),
        [[rd(PI3 * rad * rad * h, 1), "That is the cylinder around the cone. A cone holds one third of it."], [rd(PI3 * rad * rad * l / 3, 1), `${l} cm is the slant side. The formula needs the height, the dashed ${h} cm line.`]].concat(useD ? [[rd(PI3 * 4 * rad * rad * h / 3, 1), `${2 * rad} cm is the diameter. Halve it to get the radius first.`]] : []).concat([[rd(PI3 * rad * l, 1), "πrl is the curved surface (the wrapper), not the space inside."]]),
        Object.assign(extra, { tol: 0.051, keys: ["."] })); }
    return mcqWhy(r, `${what[0]} is a cone. What is its volume? Leave your answer in terms of π.`, PV(k), `A third of the cylinder around it: ⅓ × π × ${rad}² × ${h} = ${k}π cm³.`,
      [[PV(rad * rad * h), "That is the cylinder around the cone. A cone fills only a third of it, so divide by 3."], [PV(rad * rad * l, 3), `${l} cm is the slant side. Use the height, the dashed ${h} cm line that meets the base at a right angle.`],
       useD ? [PV(4 * rad * rad * h, 3), `${2 * rad} cm is the diameter. Halve it to get the radius before squaring.`] : [PV(rad * h, 3), "The radius must be squared: ⅓ × π × r × r × h."], [PA(rad * l), `${rad * l}π is the curved surface (the wrapper) in cm², not the volume.`], [PV(rad * rad * h, 2), "A cone is one THIRD of its cylinder, not one half."]],
      "Volume of a cone = ⅓ π r² h.", st.concat([`$V = \\frac{1}{3} \\times \\pi \\times ${rad}^2 \\times ${h} = ${k}\\pi$ cm³`]), extra); },
  coneSA: r => { const [rad, h, l] = r.pick(MENS_TRI), hat = r.chance(.55), curved = rad * l;
    if (hat) return mcqWhy(r, `A party hat is a cone with no base, radius ${rad} cm and height ${h} cm. How much card makes its curved surface? Leave your answer in terms of π.`, PA(curved), `First the slant height: √(${rad}² + ${h}²) = ${l} cm. Then π × ${rad} × ${l} = ${curved}π cm².`,
      [[PA(rad * h), `πrl needs the slant height l, along the sloping side. ${h} cm is the height inside, so find l = ${l} first.`], [PA(rad * rad + curved), "A party hat has no base, so the circle isn't added."], [PA(2 * curved), "The curved surface is πrl, not 2πrl (that 2 belongs to cylinders)."],
       [PV(rad * rad * h, 3), "⅓πr²h is the volume, the space inside, not the card on the outside."], [PA(rad * rad), `${rad * rad}π is the circle the hat stands on, which the hat doesn't have.`]],
      "Curved surface of a cone = π r l, where l is the slant height.", [`Slant height: $l = \\sqrt{${rad}^2 + ${h}^2} = \\sqrt{${rad * rad + h * h}} = ${l}$ cm`, `Curved surface: $\\pi \\times ${rad} \\times ${l} = ${curved}\\pi$ cm²`],
      { pic: svgCone("Party hat", rad, h, { r: `${rad} cm`, h: `${h} cm` }), uid: `sol|coneSA|hat|${rad}|${h}`, data: { sol: "coneSA", hat, r: rad, h, l } });
    const tot = rad * rad + curved;
    return mcqWhy(r, `A solid wooden cone in the toy box has radius ${rad} cm and slant height ${l} cm. What is its total surface area? Leave your answer in terms of π.`, PA(tot), `The round base, π × ${rad}² = ${rad * rad}π, plus the curved side, π × ${rad} × ${l} = ${curved}π: ${tot}π cm².`,
      [[PA(curved), "That is just the curved side. A solid cone also has a round base."], [PA(rad * rad + rad * h), `πrl uses the slant height ${l} cm, not the ${h} cm height.`], [PA(2 * rad * rad + curved), "A cone has only ONE circle, at the bottom."],
       [PA(rad * rad + 2 * curved), "The curved side is πrl, not 2πrl."], [PV(rad * rad * h, 3), "⅓πr²h is the volume (the space inside), not the surface."]],
      "Total surface area of a solid cone = π r² + π r l.", [`Base: $\\pi \\times ${rad}^2 = ${rad * rad}\\pi$ cm²`, `Curved side: $\\pi \\times ${rad} \\times ${l} = ${curved}\\pi$ cm²`, `Total: $${rad * rad}\\pi + ${curved}\\pi = ${tot}\\pi$ cm²`],
      { pic: svgCone("Toy cone", rad, h, { r: `${rad} cm`, h: `${h} cm`, l: `${l} cm` }), uid: `sol|coneSA|solid|${rad}|${l}`, data: { sol: "coneSA", hat, r: rad, h, l } }); },
  sphV: r => { const half = r.chance(.4), rad = r.pick(half ? [3, 6, 9] : [3, 6, 9, 12]), useD = !half && r.chance(.3), c3 = rad * rad * rad;
    if (half) { const what = r.pick([["An igloo for the snow bunnies", "Igloo"], ["A strawberry jelly dome", "Jelly dome"], ["The dome on the star-gazing tower", "Tower dome"]]), k = 2 * c3 / 3;
      return mcqWhy(r, `${what[0]} is a hemisphere (half a sphere) with radius ${rad} cm. What is its volume? Leave your answer in terms of π.`, PV(k), `Half of a whole ball: ½ × ⁴⁄₃ × π × ${rad}³ = ⅔ × ${c3}π = ${k}π cm³.`,
        [[PV(4 * c3, 3), "That is the whole sphere. A hemisphere is only half of it."], [PA(2 * rad * rad), `${2 * rad * rad}π is the curved surface in cm², not the space inside.`], [PV(2 * c3), "Volume of a hemisphere is ⅔πr³; that forgot to divide by 3."], [PV(2 * rad * rad, 3), "The radius must be cubed (r × r × r) for a volume."], [PV(c3, 3), "Half of ⁴⁄₃ is ⅔, not ⅓."]],
        "Hemisphere = half a sphere: ½ × ⁴⁄₃ π r³ = ⅔ π r³.", [`$${rad}^3 = ${c3}$`, `$V = \\frac{2}{3} \\times \\pi \\times ${c3} = ${k}\\pi$ cm³`],
        { pic: svgBall(what[1], rad, { r: `${rad} cm` }, "dome"), uid: `sol|sphV|half|${rad}`, data: { sol: "sphV", half, r: rad } }); }
    const what = r.pick([["A giant gumball", "Gumball"], ["A snow globe", "Snow globe"], ["The fortune-teller's crystal ball", "Crystal ball"], ["A pearl from the mermaid's treasure chest", "Mermaid pearl"]]), k = 4 * c3 / 3;
    return mcqWhy(r, `${what[0]} is a sphere${useD ? ` with diameter ${2 * rad} cm` : ` with radius ${rad} cm`}. What is its volume? Leave your answer in terms of π.`, PV(k), `${useD ? `The radius is ${2 * rad} ÷ 2 = ${rad} cm. ` : ""}⁴⁄₃ × π × ${rad}³ = ⁴⁄₃ × ${c3}π = ${k}π cm³.`,
      [[PA(4 * rad * rad), `${4 * rad * rad}π is the surface area (4πr²), not the space inside.`], [PV(4 * c3), "Volume of a sphere is ⁴⁄₃πr³; that forgot to divide by 3."], useD ? [PV(32 * c3, 3), `${2 * rad} cm is the diameter. Halve it to get the radius before cubing.`] : [PV(4 * rad * rad, 3), "For a volume, the radius is cubed (r × r × r), not squared."],
       [PV(c3), "πr³ is missing the ⁴⁄₃ at the front."], [PV(2 * c3, 3), "That is a hemisphere, half a ball. This is the whole sphere."]],
      "Volume of a sphere = ⁴⁄₃ π r³.", (useD ? [`Radius = ${2 * rad} ÷ 2 = ${rad} cm`] : []).concat([`$${rad}^3 = ${c3}$`, `$V = \\frac{4}{3} \\times \\pi \\times ${c3} = ${k}\\pi$ cm³`]),
      { pic: svgBall(what[1], rad, useD ? { d: `${2 * rad} cm` } : { r: `${rad} cm` }), uid: `sol|sphV|${rad}|${useD}`, data: { sol: "sphV", half, r: rad, useD } }); },
  sphSA: r => { const k = r.pick(["ball", "ball", "bowl", "dome"]), rad = r.int(2, 12), r2 = rad * rad, extra = { uid: `sol|sphSA|${k}|${rad}`, data: { sol: "sphSA", k, r: rad } };
    if (k === "ball") { const useD = r.chance(.3); extra.uid += "|" + useD; extra.data.useD = useD; extra.pic = svgBall("Bouncy ball", rad, useD ? { d: `${2 * rad} cm` } : { r: `${rad} cm` });
      return mcqWhy(r, `Fairy Pip paints stripes over the whole outside of a bouncy ball ${useD ? `${2 * rad} cm across (its diameter)` : `with radius ${rad} cm`}. What area does she paint? Leave your answer in terms of π.`, PA(4 * r2), `A ball's skin is exactly 4 of its big circles: 4 × π × ${rad}² = ${4 * r2}π cm².`,
        [[PA(2 * r2), "2πr² is only half the ball (a hemisphere's curved part)."], [PA(r2), `${r2}π is one flat circle through the middle. The ball's skin is 4 of those.`], [PA(4 * rad), "The radius must be squared: 4 × π × r × r."], useD ? [PA(16 * r2), `${2 * rad} cm is the diameter. Halve it before squaring.`] : [PV(4 * r2 * rad, 3), "⁴⁄₃πr³ is the volume, the space inside, not the paint on the outside."], [PA(8 * r2), "The surface of a sphere is 4πr², not 8πr²."]],
        "Surface area of a sphere = 4 π r².", (useD ? [`Radius = ${2 * rad} ÷ 2 = ${rad} cm`] : []).concat([`$4 \\times \\pi \\times ${rad}^2 = 4 \\times ${r2}\\pi = ${4 * r2}\\pi$ cm²`]), extra); }
    if (k === "bowl") { extra.pic = svgBall("Fruit bowl", rad, { r: `${rad} cm` }, "bowl");
      return mcqWhy(r, `A fruit bowl is a hemisphere with radius ${rad} cm, open at the top. What is the area of its curved outside? Leave your answer in terms of π.`, PA(2 * r2), `Half of a ball's 4πr²: 2 × π × ${rad}² = ${2 * r2}π cm².`,
        [[PA(3 * r2), "The bowl is open, so there is no flat circle on top to add."], [PA(4 * r2), "That is a whole ball. A bowl is only half of it."], [PA(r2), `${r2}π is just the flat circle at the top (the opening).`], [PA(2 * rad), "The radius must be squared: 2 × π × r × r."], [PV(2 * r2 * rad, 3), "⅔πr³ is how much the bowl holds, not its outside."]],
        "Curved surface of a hemisphere = half of 4πr² = 2πr².", [`$\\frac{1}{2} \\times 4\\pi r^2 = 2\\pi r^2$`, `$2 \\times \\pi \\times ${rad}^2 = ${2 * r2}\\pi$ cm²`], extra); }
    extra.pic = svgBall("Glitter paperweight", rad, { r: `${rad} cm` }, "dome");
    return mcqWhy(r, `A solid glass paperweight is a hemisphere with radius ${rad} cm. Glitter covers it all over, flat bottom included. What is its total surface area? Leave your answer in terms of π.`, PA(3 * r2), `The curved dome (2π × ${rad}² = ${2 * r2}π) plus the flat circle underneath (π × ${rad}² = ${r2}π): ${3 * r2}π cm².`,
      [[PA(2 * r2), "That is just the curved dome. Don't forget the flat circle underneath."], [PA(4 * r2), "That is a whole ball's surface. Half of it is curved, plus one flat circle."], [PA(5 * r2), "The dome is half of 4πr², which is 2πr², not 4πr²."], [PA(3 * rad), "The radius must be squared: πr × r."], [PV(2 * r2 * rad, 3), "⅔πr³ is the volume, not the area of the outside."]],
      "Solid hemisphere = curved part (2πr²) + flat circle (πr²) = 3πr².", [`Curved dome: $2 \\times \\pi \\times ${rad}^2 = ${2 * r2}\\pi$ cm²`, `Flat circle: $\\pi \\times ${rad}^2 = ${r2}\\pi$ cm²`, `Total: $${3 * r2}\\pi$ cm²`], extra); },
  compo: r => { if (r.chance(.5)) { const rad = r.int(2, 6); let h = r.int(rad + 3, 14); while ((rad * rad * h + 2 * rad ** 3) % 3) h++;
      const cn = rad * rad * h, hm = 2 * rad ** 3, k = (cn + hm) / 3;
      return mcqWhy(r, `At the Ice-Cream Café, a waffle cone of radius ${rad} cm and height ${h} cm is filled with ice cream and topped with a hemisphere scoop of the same radius. How much ice cream is there? Leave your answer in terms of π.`, PV(k), `The cone, ⅓π × ${rad}² × ${h} = ${piS(cn, 3)}, plus the half-ball scoop, ⅔π × ${rad}³ = ${piS(hm, 3)}: ${k}π cm³ altogether.`,
        [[PV(cn, 3), "That is only the cone. Add the scoop on top too."], [PV(cn + 2 * hm, 3), "The scoop is HALF a ball, ⅔πr³, not a whole ball."], [PV(3 * cn + hm, 3), "The cone is ⅓πr²h; that used the whole cylinder around it."], [PV(cn + 3 * rad * rad * 2, 3), "2πr² is the scoop's curved surface, not its volume (⅔πr³)."], [PV(rad * rad * h + rad ** 3), "Both parts need their fractions: ⅓ for the cone and ⅔ for the hemisphere."]],
        "Split it: a cone (⅓πr²h) and a hemisphere (⅔πr³), then add.", [`Cone: $\\frac{1}{3} \\times \\pi \\times ${rad}^2 \\times ${h} = ${fracTex(cn, 3)}\\pi$`, `Scoop: $\\frac{2}{3} \\times \\pi \\times ${rad}^3 = ${fracTex(hm, 3)}\\pi$`, `Total: $${fracTex(cn, 3)}\\pi + ${fracTex(hm, 3)}\\pi = ${k}\\pi$ cm³`],
        { pic: svgCream("Ice-cream cone", rad, h, { r: `${rad} cm`, h: `${h} cm` }), uid: `sol|compo|cream|${rad}|${h}`, data: { sol: "compo", k: "cream", r: rad, h } }); }
    const rad = r.int(2, 5), H = r.int(4, 12); let h = r.int(2, 8); while (rad * rad * h % 3) h++;
    const cy = rad * rad * H, cn = rad * rad * h / 3, k = cy + cn, P = (n, d = 1) => piF(n, d, "m", "³");
    return mcqWhy(r, `A castle turret is a cylinder ${H} m tall with radius ${rad} m, and a cone-shaped roof ${h} m tall on top. What is the volume of the whole turret? Leave your answer in terms of π.`, P(k), `The cylinder, π × ${rad}² × ${H} = ${cy}π, plus the cone roof, ⅓π × ${rad}² × ${h} = ${cn}π: ${k}π m³.`,
      [[P(rad * rad * (H + h)), "The roof is a cone, a third of a cylinder. That counted it as a full cylinder."], [P(cy), "That is only the cylinder. Add the cone roof on top."], [P(rad * rad * (H + h), 3), "Only the roof is a cone. The tower below is a full cylinder, with no ⅓."], [P(2 * rad * H + cn), "2πrH is the curved wall's area, not the cylinder's volume (πr²H)."], [P(rad * H + cn), "The radius must be squared: π × r × r × H."]],
      "Split it: cylinder (πr²H) + cone (⅓πr²h).", [`Cylinder: $\\pi \\times ${rad}^2 \\times ${H} = ${cy}\\pi$ m³`, `Cone roof: $\\frac{1}{3} \\times \\pi \\times ${rad}^2 \\times ${h} = ${cn}\\pi$ m³`, `Total: $${cy}\\pi + ${cn}\\pi = ${k}\\pi$ m³`],
      { pic: svgTurret("Castle turret", rad, H, h, { r: `${rad} m`, H: `${H} m`, h: `${h} m` }), uid: `sol|compo|turret|${rad}|${H}|${h}`, data: { sol: "compo", k: "turret", r: rad, H, h } }); },
  rev: r => { const k = r.pick(["cone", "ball", "pyr"]);
    if (k === "cone") { const rad = r.int(2, 9); let h = r.int(3, 15); while (rad * rad * h % 3) h++; const V = rad * rad * h / 3;
      return numWhy(`A cone-shaped party hat holds ${V}π cm³ and its base has radius ${rad} cm. How tall is it, in cm?`, h, "V = ⅓ π r² h, so h = 3V ÷ (π r²).", [`$\\frac{1}{3} \\times \\pi \\times ${rad}^2 \\times h = ${V}\\pi$`, `$${rad * rad}h = 3 \\times ${V} = ${3 * V}$`, `$h = ${3 * V} \\div ${rad * rad} = ${h}$ cm`],
        [[V / (rad * rad), "Don't forget the ⅓ in the cone formula: multiply the volume by 3 before dividing."], [3 * V / rad, "The radius is squared in the formula, so divide by r² = " + rad * rad + "."], [3 * V / (4 * rad * rad), "Use the radius, not the diameter, when you square it."]],
        { keys: ["."], pic: svgCone("Party hat", rad, h, { r: `${rad} cm`, h: "h" }), uid: `sol|rev|cone|${rad}|${h}`, data: { sol: "rev", k, r: rad, h, V } }); }
    if (k === "ball") { const rad = r.int(2, 12), A = 4 * rad * rad;
      return numWhy(`A beach ball has a surface area of ${A}π cm². What is its radius, in cm?`, rad, "Surface area = 4πr², so r² = area ÷ 4π.", [`$4\\pi r^2 = ${A}\\pi$`, `$r^2 = ${A} \\div 4 = ${rad * rad}$`, `$r = \\sqrt{${rad * rad}} = ${rad}$ cm`],
        [[A / 4, `${A / 4} is r². Take the square root to get r.`], [2 * rad, "That is the diameter. Divide by 4 before the square root: √(" + A + " ÷ 4)."], [A / 2, "Divide by 4 (from 4πr²), then take the square root."]],
        { keys: ["."], pic: svgBall("Beach ball", rad, { r: "r" }), uid: `sol|rev|ball|${rad}`, data: { sol: "rev", k, r: rad, A } }); }
    const [s, h, l] = pyrTri(r), a = 2 * s, V = a * a * h / 3;
    return numWhy(`A square-based chocolate pyramid has a volume of ${V} cm³ and a base ${a} cm wide. How tall is it, in cm?`, h, "V = ⅓ × base area × height, so height = 3V ÷ base area.", [`Base area: $${a} \\times ${a} = ${a * a}$ cm²`, `$\\frac{1}{3} \\times ${a * a} \\times h = ${V}$`, `$h = 3 \\times ${V} \\div ${a * a} = ${h}$ cm`],
      [[V / (a * a), "Remember the ⅓: multiply the volume by 3 before dividing by the base area."], [3 * V / a, `The base area is ${a} × ${a} = ${a * a}, not ${a}.`], [l, `${l} cm is the slant height up a face, not the height straight up.`]],
      { keys: ["."], pic: svgPyr("Chocolate pyramid", a, a, h, { a: `${a} cm`, h: "h" }), uid: `sol|rev|pyr|${a}|${h}`, data: { sol: "rev", k, a, h, l, V } }); }
};
topic(8, "solids", "Ice-Cream Cone Café", "🍦", "Volume and surface area of pyramids, cones and spheres", r => {
  const k = r.pick(["pyrV", "pyrV", "pyrSA", "pyrSA", "coneV", "coneV", "coneSA", "coneSA", "sphV", "sphV", "sphSA", "sphSA", "compo", "compo", "rev", "rev"]);
  return SOL[k](r);
});
topic(8, "gradient", "Gradient Hills", "⛰️", "Gradient and straight lines", r => {
  const t = r.int(0, 2);
  if (t === 0) { const x1 = r.int(-6, 6), y1 = r.int(-6, 6), dx = r.nz(-5, 5) * 2, m = r.nz(-8, 8) / 2, x2 = x1 + dx, y2 = y1 + m * dx; return num(`Find the gradient of the line through ${T(`(${x1}, ${y1})`)} and ${T(`(${x2}, ${y2})`)}.`, m, "Gradient = rise ÷ run = (y₂ − y₁) ÷ (x₂ − x₁).", [`$m = \\frac{${y2} - ${paren(y1)}}{${x2} - ${paren(x1)}} = \\frac{${y2 - y1}}{${dx}} = ${fmt(m)}$`], { keys: ["-", ".", "/"], data: { x1, y1, x2, y2 } }); }
  const m = r.nz(-6, 6), c = r.int(-10, 10), x = r.int(-5, 5);
  if (t === 1) return num(`The line ${T(`y = ${lin(m, c)}`)} meets the y-axis at (0, c). What is c?`, c, "In y = mx + c, c is the y-intercept.", [`Put x = 0: y = ${c}`], { keys: ["-"] });
  return num(`On the line ${T(`y = ${lin(m, c)}`)}, what is y when ${T(`x = ${x}`)}?`, m * x + c, "Substitute the x value.", [`$y = ${m}(${x}) ${pm(c)} = ${m * x + c}$`], { keys: ["-"], data: { m, c, x } });
});

/* ---------- 📏 Straight-Line Street (MOE Sec 2 linear graphs): gradient, intercepts, match equation ↔
   pastel SVG, find the equation from two points, evaluate a point, parallel / perpendicular gradients,
   and kid word problems (hill roads, rainbow paths, kite string, fairy tram, pumpkin-coach ramp,
   sports-day run, beanstalk stick, lantern bridge). Pictures use the shared svgStraight kit in
   math-gen.js (class=lineeq data-m/c, marks class=ldot). Gradient Hills stays text-only and byte-identical. */
const LINE_CTX = [
  { id: "hill", title: "Hill road", who: "Fairy Pip", spot: "Gradient Hills", thing: "hill road", of: "the road" },
  { id: "rainbow", title: "Rainbow path", who: "Sumi the star fairy", spot: "the rainbow path", thing: "rainbow path", of: "the path" },
  { id: "kite", title: "Kite string", who: "Jack", spot: "the kite field", thing: "kite string", of: "the kite string" },
  { id: "tram", title: "Fairy tram", who: "Princess Mira", spot: "the fairy tram track", thing: "tram track", of: "the tram track" },
  { id: "coach", title: "Pumpkin-coach ramp", who: "Cinderella", spot: "the palace ramp", thing: "pumpkin-coach ramp", of: "the ramp" },
  { id: "sports", title: "Sports-day run", who: "Little Red", spot: "sports day", thing: "running graph", of: "the run" },
  { id: "bean", title: "Beanstalk stick", who: "Jack", spot: "the giant beanstalk", thing: "measuring stick", of: "the stick" },
  { id: "lantern", title: "Lantern bridge", who: "Rapunzel", spot: "the lantern bridge", thing: "bridge slope", of: "the bridge" }
];
// nice y = mx + c with m in {±1,±2,±3,±1/2,±3/2} and integer c so graphs land on lattice points
const niceLine = r => {
  const m = r.pick([-3, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3]);
  const c = r.int(-5, 5);
  const xint = Math.abs(m) > 1e-12 ? -c / m : null;
  return { m, c, xint };
};
const lineEqTex = (m, c) => {
  const half = { [-1.5]: "-\\frac{3}{2}", [-0.5]: "-\\frac{1}{2}", [0.5]: "\\frac{1}{2}", [1.5]: "\\frac{3}{2}" };
  let front = half[m];
  if (front == null) front = m === 1 ? "" : m === -1 ? "-" : fmt(m);
  const mx = front + "x";
  if (c === 0) return `y = ${mx}`;
  return `y = ${mx} ${c < 0 ? "-" : "+"} ${Math.abs(c)}`;
};
const lineEqShow = (m, c) => T(lineEqTex(m, c));
const lineMarks = (z, which, extra = []) => {
  const mks = [];
  if (which.includes("y")) mks.push({ n: "Y", x: 0, y: z.c, lab: `(0, ${fmt(z.c)})`, dx: 18, dy: 0 });
  if (which.includes("x") && z.xint != null && Math.abs(z.m) > 1e-12)
    mks.push({ n: "X", x: z.xint, y: 0, lab: `(${fmt(z.xint)}, 0)`, dy: 14 });
  for (const e of extra) mks.push(e);
  return mks;
};
const linePic = (z, ctx, which = ["y"], o = {}, extra = []) =>
  svgStraight(ctx.title, z.m, z.c, Object.assign({ marks: lineMarks(z, which, extra) }, o));
const twoLattice = (z, r) => {
  const xs = [];
  for (let x = -4; x <= 4; x++) {
    const y = z.m * x + z.c;
    if (Math.abs(y * 2 - Math.round(y * 2)) < 1e-9 && Math.abs(y) <= 8) xs.push(x);
  }
  if (xs.length < 2) return [{ x: 0, y: z.c }, { x: 2, y: z.m * 2 + z.c }];
  const shuffled = r.shuffle(xs.slice());
  let x1 = shuffled[0], x2 = shuffled.find(x => x !== x1) ?? (x1 + 1);
  if (x1 > x2) [x1, x2] = [x2, x1];
  return [{ x: x1, y: z.m * x1 + z.c }, { x: x2, y: z.m * x2 + z.c }];
};
// pad wrong MCQ options up to 3 unique strings with filler notes
const padWrong = (right, cand, fillers) => {
  const wrong = []; const seen = new Set([String(right)]);
  for (const [o, n] of cand.concat(fillers)) {
    const s = String(o);
    if (seen.has(s) || !n || n.length < 20) continue;
    seen.add(s); wrong.push([s, n]);
    if (wrong.length >= 3) break;
  }
  return wrong;
};
const padSlips = (ans, slips, fillers) => {
  const keep = []; const seen = new Set([String(ans)]);
  for (const [v, n] of slips.concat(fillers)) {
    const s = String(v);
    if (seen.has(s) || !n || n.length < 20) continue;
    // numeric equality for numWhy
    if (Math.abs(+v - +ans) < 1e-9) continue;
    seen.add(s); keep.push([v, n]);
    if (keep.length >= 4) break;
  }
  return keep;
};
const LINEQ = {
  grad: r => {
    const z = niceLine(r), ctx = r.pick(LINE_CTX), pts = twoLattice(z, r), mc = r.chance(.55);
    const [A, B] = pts, rise = B.y - A.y, run = B.x - A.x;
    const extra = [
      { n: "A", x: A.x, y: A.y, lab: `A(${fmt(A.x)}, ${fmt(A.y)})`, dy: A.y >= 0 ? -8 : 14 },
      { n: "B", x: B.x, y: B.y, lab: `B(${fmt(B.x)}, ${fmt(B.y)})`, dy: B.y >= 0 ? -8 : 14 }
    ];
    const pic = linePic(z, ctx, [], {}, extra);
    const q = `${ctx.who} draws ${ctx.of} through A(${fmt(A.x)}, ${fmt(A.y)}) and B(${fmt(B.x)}, ${fmt(B.y)}). What is the gradient?`;
    const hint = "Gradient = rise ÷ run = (y₂ − y₁) ÷ (x₂ − x₁).";
    const steps = [`$m = \\dfrac{${fmt(B.y)} - ${paren(A.y)}}{${fmt(B.x)} - ${paren(A.x)}} = \\dfrac{${fmt(rise)}}{${fmt(run)}} = ${fmt(z.m)}$`];
    const right = String(fmt(z.m));
    const rightWhy = "Right: count how far up or down the line goes between the two marked points, then divide by how far across — that steepness is the gradient.";
    const fillers = [[fmt(z.m + 2), "Count the squares carefully between the two marked points, then divide rise by run."],
      [fmt(z.m - 2), "Keep the same order when you subtract the coordinates, then divide."],
      [fmt(3), "Gradient is rise ÷ run between the two marked points — try that divide again."],
      [fmt(-3), "Watch which way the line slopes when you work out rise ÷ run."]];
    if (mc) {
      const cand = [
        [fmt(-z.m), "You swapped the sign. Rise over run keeps the signs of both subtractions."],
        [fmt(rise), "That is only the rise. Divide by the run to get the gradient."],
        [fmt(run), "That is the run (change in x). Gradient is rise ÷ run."],
        [fmt(z.c), "That is the y-intercept. Gradient is how steep the line is: rise ÷ run."],
        [fmt(z.m === 1 ? 2 : z.m + (z.m > 0 ? 1 : -1)), "Count the squares carefully between A and B, then divide rise by run."]
      ];
      return { k: "grad", mc: true, ctx, z, right, rightWhy, wrong: padWrong(right, cand, fillers), q, hint, steps, pic,
        data: { m: z.m, c: z.c, x1: A.x, y1: A.y, x2: B.x, y2: B.y } };
    }
    return { k: "grad", mc: false, ctx, z, x: z.m, q, hint, steps, pic,
      data: { m: z.m, c: z.c, x1: A.x, y1: A.y, x2: B.x, y2: B.y },
      slips: padSlips(z.m, [
        [-z.m, "Watch the sign: (y₂ − y₁) ÷ (x₂ − x₁) keeps both subtractions in the same order."],
        [rise, "That is only the rise. Divide by the run to get the gradient."],
        [run, "That is the run (change in x). Gradient is rise ÷ run."],
        [z.c, "That is the y-intercept. Gradient is rise ÷ run between the two points."]
      ], [[z.m + 1, "Count the squares between the marked points carefully, then divide."],
        [z.m - 1, "Keep rise over run — do not flip the fraction or the order."]]) };
  },
  yint: r => {
    const z = niceLine(r), ctx = r.pick(LINE_CTX), mc = r.chance(.5), pic = linePic(z, ctx, ["y"]);
    const q = `${ctx.who} sketches ${lineEqShow(z.m, z.c)} for ${ctx.of} at ${ctx.spot}. What is the y-intercept?`;
    const hint = "In y = mx + c, the y-intercept is c — where the line meets the y-axis (x = 0).";
    const steps = [`Put $x = 0$: $y = ${fmt(z.c)}$`, `So the line crosses the y-axis at $(0,\\ ${fmt(z.c)})$.`];
    const right = String(fmt(z.c));
    const rightWhy = "Right: putting x equal to zero wipes out the mx term, leaving only the constant — that is where the line meets the y-axis.";
    const fillers = [[fmt(z.c + 3), "Read the constant term at the end of y = mx + c carefully."],
      [fmt(z.c - 3), "Do not adjust the constant — read it straight from the equation."],
      ["4", "The y-intercept is the constant term c, not a random nearby number."],
      ["-4", "Watch the sign of the constant term at the end of the equation."]];
    if (mc) {
      const cand = [
        [fmt(z.m), "That is the gradient m. The y-intercept is the constant term c."],
        [fmt(z.xint != null ? z.xint : z.c + 1), z.xint != null ? "That is the x-intercept. The y-intercept is where x = 0." : "Read c from the end of y = mx + c."],
        [fmt(z.c === 0 ? 1 : -z.c), z.c === 0 ? "When x = 0 this line gives y = 0, so the intercept is zero." : "Watch the sign of the constant term."],
        [fmt(z.c + 2), "That adds two to the constant. Read c straight from the end of the equation."]
      ];
      return { k: "yint", mc: true, ctx, z, right, rightWhy, wrong: padWrong(right, cand, fillers), q, hint, steps, pic, data: { m: z.m, c: z.c } };
    }
    return { k: "yint", mc: false, ctx, z, x: z.c, q, hint, steps, pic, data: { m: z.m, c: z.c },
      slips: padSlips(z.c, [
        [z.m, "That is the gradient. The y-intercept is the constant term when x = 0."],
        [z.xint != null && Math.abs(z.xint - z.c) > 1e-9 ? z.xint : (z.c === 0 ? 1 : -z.c),
          z.xint != null && Math.abs(z.xint - z.c) > 1e-9 ? "That is the x-intercept. The y-intercept is the constant c." : "Check the sign of the constant term in the equation."],
        [z.c + 1, "Read c straight from the end of the equation — do not add one."],
        [z.c - 2, "Do not adjust the constant. When x = 0, y equals c."]
      ], [[7, "The y-intercept is the constant at the end of y = mx + c."],
        [-7, "Watch the sign — read the constant carefully from the equation."]]) };
  },
  xint: r => {
    // force neat half/integer x-intercepts: pick m and c so -c/m is neat
    const m = r.pick([-3, -2, -1, -0.5, 0.5, 1, 2, 3]);
    const neatX = r.pick([-4, -3, -2, -1, -0.5, 0.5, 1, 2, 3, 4].filter(x => Math.abs(m * x) <= 5 && Math.abs(m * x - Math.round(m * x)) < 1e-9));
    const c = -m * neatX; // so xint = neatX, and c is integer/half
    const z = { m, c, xint: neatX };
    const ctx = r.pick(LINE_CTX), mc = r.chance(.5), pic = linePic(z, ctx, ["x", "y"]);
    const q = `The graph shows ${ctx.of} as ${lineEqShow(z.m, z.c)}. Where does it meet the x-axis? (the x-intercept)`;
    const hint = "Set y = 0 and solve for x: 0 = mx + c → x = −c / m.";
    const steps = [`$0 = ${fmt(z.m)}x ${pm(z.c)}$`, `$x = \\dfrac{${fmt(-z.c)}}{${fmt(z.m)}} = ${fmt(z.xint)}$`, `So the x-intercept is ${fmt(z.xint)}.`];
    const right = String(fmt(z.xint));
    const rightWhy = "Right: the line meets the x-axis where the height is zero, so divide the opposite of the constant by the gradient.";
    const fillers = [[fmt(z.xint + 2), "Solve 0 = mx + c carefully for x."],
      [fmt(z.xint - 2), "Keep the signs when you rearrange 0 = mx + c."],
      ["3", "The x-intercept comes from setting y to zero, then solving for x."],
      ["-3", "Watch the sign when you divide −c by the gradient."]];
    if (mc) {
      const cand = [
        [fmt(z.c), "That is the y-intercept. For the x-intercept set y = 0 and solve for x."],
        [fmt(-z.xint), "Check the signs: x = −c / m, not the opposite of that."],
        [fmt(z.m), "That is the gradient. The x-intercept is −c ÷ m."],
        [fmt(z.c / z.m), "You forgot the minus: x = −c / m, not c / m."]
      ];
      return { k: "xint", mc: true, ctx, z, right, rightWhy, wrong: padWrong(right, cand, fillers), q, hint, steps, pic,
        data: { m: z.m, c: z.c, xint: z.xint } };
    }
    return { k: "xint", mc: false, ctx, z, x: z.xint, q, hint, steps, pic, data: { m: z.m, c: z.c, xint: z.xint },
      slips: padSlips(z.xint, [
        [z.c, "That is the y-intercept. Set y = 0 to find the x-intercept."],
        [-z.xint, "Watch the sign: x = −c / m keeps both signs in the divide."],
        [z.c / z.m, "Remember the minus: x = −c / m, not c / m."],
        [z.m, "That is the gradient. The x-intercept is found by setting y = 0."]
      ], [[5, "Solve 0 = mx + c for x — that is the x-intercept."],
        [-5, "Keep the signs when you rearrange and divide."]]) };
  },
  match: r => {
    const z = niceLine(r), ctx = r.pick(LINE_CTX);
    const key = g => `${fmt(g.m)}|${fmt(g.c)}`;
    const mk = (m, c) => ({ m, c, xint: Math.abs(m) > 1e-12 ? -c / m : null });
    const graphs = [z];
    const seen = new Set([key(z)]);
    const candidates = [
      mk(-z.m, z.c),
      mk(z.m, z.c === 0 ? 2 : -z.c),
      mk(z.m === 1 ? 2 : z.m === -1 ? -2 : (z.m > 0 ? 1 : -1), z.c),
      mk(z.m, z.c + (z.c >= 0 ? 2 : -2)),
      mk(z.m === 0.5 ? 1.5 : 0.5 * Math.sign(z.m) || 0.5, z.c),
      mk(-z.m, -z.c),
      mk(z.m === 2 ? 3 : 2 * Math.sign(z.m) || 2, z.c),
      mk(z.m, 4),
      mk(z.m, -4)
    ];
    for (const g of r.shuffle(candidates)) if (!seen.has(key(g)) && graphs.length < 4) { seen.add(key(g)); graphs.push(g); }
    while (graphs.length < 4) {
      const g = niceLine(r); if (!seen.has(key(g))) { seen.add(key(g)); graphs.push(g); }
    }
    const ids = ["g1", "g2", "g3", "g4"], order = r.shuffle([0, 1, 2, 3]), rightId = ids[order.indexOf(0)];
    const optPics = {};
    order.forEach((gi, i) => {
      const g = graphs[gi];
      optPics[ids[i]] = svgStraight(" ", g.m, g.c, { small: true, marks: [{ n: "Y", x: 0, y: g.c, lab: "" }] });
    });
    const wrong = ids.filter(id => id !== rightId).map(id => {
      const g = graphs[order[ids.indexOf(id)]];
      return [id, `That graph has gradient ${fmt(g.m)} and y-intercept ${fmt(g.c)}. Match the steepness and where it crosses the y-axis.`];
    });
    return { k: "match", mc: true, ctx, z, right: rightId,
      rightWhy: "Right: this line matches the given steepness and crosses the y-axis at the same place as the equation.",
      wrong, q: `Which graph shows ${lineEqShow(z.m, z.c)} for ${ctx.of}?`,
      hint: "Check the steepness (sign and size of m) and where it crosses the y-axis (c).",
      steps: [`Gradient $m = ${fmt(z.m)}$ → ${z.m > 0 ? "slopes up" : "slopes down"}`, `Y-intercept $c = ${fmt(z.c)}$ → crosses at $(0,\\ ${fmt(z.c)})$`, `Pick the graph that matches both.`],
      pic: "", optPics, data: { m: z.m, c: z.c, order: order.map(i => key(graphs[i])) } };
  },
  eq: r => {
    const z = niceLine(r), ctx = r.pick(LINE_CTX), pts = twoLattice(z, r);
    const [A, B] = pts;
    const extra = [
      { n: "A", x: A.x, y: A.y, lab: `A(${fmt(A.x)}, ${fmt(A.y)})`, dy: A.y >= 0 ? -8 : 14 },
      { n: "B", x: B.x, y: B.y, lab: `B(${fmt(B.x)}, ${fmt(B.y)})`, dy: B.y >= 0 ? -8 : 14 }
    ];
    const pic = linePic(z, ctx, ["y"], {}, extra);
    const right = lineEqShow(z.m, z.c);
    const q = `${ctx.who} marks A(${fmt(A.x)}, ${fmt(A.y)}) and B(${fmt(B.x)}, ${fmt(B.y)}) on ${ctx.of}. What is the equation of the line?`;
    const hint = "Find the gradient m = rise ÷ run, then use y = mx + c with a known point (or read c from the y-intercept).";
    const steps = [
      `$m = \\dfrac{${fmt(B.y)} - ${paren(A.y)}}{${fmt(B.x)} - ${paren(A.x)}} = ${fmt(z.m)}$`,
      `Using $(0,\\ ${fmt(z.c)})$ (or substitute a point): $c = ${fmt(z.c)}$`,
      `Equation: $${lineEqTex(z.m, z.c)}$`
    ];
    const alts = [
      lineEqShow(-z.m, z.c),
      lineEqShow(z.m, z.c === 0 ? 2 : -z.c),
      lineEqShow(z.m === 1 ? 2 : (z.m === -1 ? -2 : (Math.abs(z.m) === 0.5 ? Math.sign(z.m) * 1.5 : Math.sign(z.m) || 1)), z.c),
      lineEqShow(z.m, z.c + (z.c >= 0 ? 1 : -1)),
      lineEqShow(z.m === 2 ? 3 : 2 * Math.sign(z.m) || 2, z.c),
      lineEqShow(z.m, 4),
      lineEqShow(z.m, -4),
      T(`x = ${lin(z.m, z.c)}`)
    ];
    const notes = [
      "The gradient keeps the sign of rise ÷ run — do not flip it.",
      "The y-intercept is where the line meets the y-axis — keep that sign.",
      "The steepness between A and B is rise ÷ run. Count the squares again.",
      "Read c from the y-intercept on the graph, or substitute a marked point.",
      "Check how steep the line is between the two marked points.",
      "The constant term is the y-intercept, not a random nearby number.",
      "Watch the sign of the constant where the line meets the y-axis.",
      "A non-vertical straight line is written y = mx + c, not x = …."
    ];
    const wrong = []; const seen = new Set([right]);
    alts.forEach((o, i) => { if (!seen.has(o)) { seen.add(o); wrong.push([o, notes[i]]); } });
    return { k: "eq", mc: true, ctx, z, right,
      rightWhy: "Right: the steepness between the two marked points gives the gradient, and the line meets the y-axis at the constant term.",
      wrong: wrong.slice(0, 3), q, hint, steps, pic,
      data: { m: z.m, c: z.c, x1: A.x, y1: A.y, x2: B.x, y2: B.y } };
  },
  point: r => {
    const z = niceLine(r), ctx = r.pick(LINE_CTX), askY = r.chance(.65);
    let x = r.int(-4, 4);
    const y = z.m * x + z.c;
    let targetY = y, targetX = x;
    if (!askY) {
      const ys = [];
      for (let xx = -4; xx <= 4; xx++) {
        const yy = z.m * xx + z.c;
        if (Math.abs(yy * 2 - Math.round(yy * 2)) < 1e-9) ys.push({ x: xx, y: yy });
      }
      const pick = r.pick(ys.length ? ys : [{ x, y }]);
      targetX = pick.x; targetY = pick.y;
    }
    const extra = askY
      ? [{ n: "P", x, y, lab: `P(${fmt(x)}, ?)`, dy: y >= 0 ? -8 : 14 }]
      : [{ n: "P", x: targetX, y: targetY, lab: `P(?, ${fmt(targetY)})`, dy: targetY >= 0 ? -8 : 14 }];
    const pic = linePic(z, ctx, ["y"], {}, extra);
    if (askY) {
      const ans = y;
      return { k: "point", mc: false, ctx, z, x: ans,
        q: `On the line ${lineEqShow(z.m, z.c)} for ${ctx.of}, what is y when x = ${fmt(x)}?`,
        hint: "Substitute the x value into y = mx + c.",
        steps: [`$y = ${fmt(z.m)}(${fmt(x)}) ${pm(z.c)} = ${fmt(ans)}$`],
        pic, data: { m: z.m, c: z.c, px: x, py: ans, ask: "y" },
        slips: padSlips(ans, [
          [z.m * x, "You forgot to add the intercept. Remember y = mx + c."],
          [z.m + z.c, "Substitute the x value fully: multiply first, then add c."],
          [ans === 0 ? 1 : -ans, "Check the signs when you multiply the gradient by x."],
          [z.c, "That is only the y-intercept. Substitute x into the whole equation."]
        ], [[ans + 3, "Multiply the gradient by x, then add the constant carefully."],
          [ans - 3, "Keep every sign when you substitute into y = mx + c."]]) };
    }
    const ans = targetX;
    return { k: "point", mc: false, ctx, z, x: ans,
      q: `On the line ${lineEqShow(z.m, z.c)} for ${ctx.of}, what is x when y = ${fmt(targetY)}?`,
      hint: "Set y equal to the given value and solve for x: x = (y − c) / m.",
      steps: [`$${fmt(targetY)} = ${fmt(z.m)}x ${pm(z.c)}$`, `${fmt(z.m)}x = ${fmt(targetY - z.c)}`, `$x = ${fmt(ans)}$`],
      pic, data: { m: z.m, c: z.c, px: ans, py: targetY, ask: "x" },
      slips: padSlips(ans, [
        [targetY - z.c, "You forgot to divide by the gradient after subtracting the intercept."],
        [(targetY + z.c) / z.m, "Use x = (y − c) / m, subtracting c before you divide."],
        [ans === 0 ? 1 : -ans, "Watch the signs when you rearrange the equation."],
        [z.c, "That is the y-intercept, not the x-value on the line."]
      ], [[ans + 2, "Solve for x carefully: subtract c, then divide by the gradient."],
        [ans - 2, "Keep the order: (y − c) divided by m."]]) };
  },
  parallel: r => {
    const z = niceLine(r), ctx = r.pick(LINE_CTX), pic = linePic(z, ctx, ["y"]);
    const right = String(fmt(z.m));
    const q = `${ctx.who}'s friend draws a second path with the same steepness as ${lineEqShow(z.m, z.c)} (a parallel line). What is its gradient?`;
    const hint = "Parallel lines have the same gradient — the same steepness.";
    const steps = [`Parallel ⇒ same gradient`, `So $m = ${fmt(z.m)}$`];
    const rightWhy = "Right: parallel lines share the same steepness, so they keep the same gradient as the first line.";
    const cand = [
      [fmt(-z.m), "That slopes the other way. Parallel lines keep the same gradient, including the sign."],
      [fmt(z.m === 0 ? 1 : rd(-1 / z.m, 4)), "That is the negative reciprocal — used for perpendicular lines, not parallel ones."],
      [fmt(z.c), "That is the y-intercept of the first line. Parallel only cares about the gradient."],
      [fmt(z.m + (z.m >= 0 ? 1 : -1)), "Same steepness means exactly the same gradient, not one step steeper."]
    ];
    const fillers = [["2", "Parallel means the same steepness as the first line — copy its gradient."],
      ["-2", "Keep the sign of the first line's gradient for a parallel path."],
      ["0.5", "Parallel lines match the first gradient exactly, not a different slope."]];
    return { k: "parallel", mc: true, ctx, z, right, rightWhy, wrong: padWrong(right, cand, fillers), q, hint, steps, pic,
      data: { m: z.m, c: z.c, kind: "parallel" } };
  },
  perp: r => {
    const m = r.pick([-2, -1, -0.5, 0.5, 1, 2]);
    const c = r.int(-4, 4);
    const z = { m, c, xint: Math.abs(m) > 1e-12 ? -c / m : null };
    const pm_ = rd(-1 / m, 4);
    const snap = v => Math.abs(v - 0.5) < 1e-9 ? 0.5 : Math.abs(v + 0.5) < 1e-9 ? -0.5 : Math.abs(v - Math.round(v)) < 1e-9 ? Math.round(v) : v;
    const perpG = snap(pm_);
    const ctx = r.pick(LINE_CTX), pic = linePic(z, ctx, ["y"]);
    const right = String(fmt(perpG));
    const q = `A fairy path meets ${lineEqShow(z.m, z.c)} at a right angle (perpendicular). What is the gradient of the new path?`;
    const hint = "Perpendicular gradients multiply to −1: the new gradient is the negative reciprocal of m.";
    const steps = [`Perpendicular ⇒ $m_1 \\times m_2 = -1$`, `$m_2 = -\\dfrac{1}{${fmt(z.m)}} = ${fmt(perpG)}$`];
    const rightWhy = "Right: lines that meet at a right angle have gradients that multiply to negative one, so take the negative reciprocal of the first gradient.";
    const cand = [
      [fmt(z.m), "That is the same gradient (parallel). Perpendicular needs the negative reciprocal."],
      [fmt(-z.m), "Flipping the sign alone is not enough unless the size is one. Use −1 ÷ m."],
      [fmt(1 / z.m), "You forgot the minus: the reciprocal must also change sign."],
      [fmt(z.c), "That is the y-intercept. Perpendicular only changes the gradient."]
    ];
    const fillers = [["3", "Use the negative reciprocal of the first gradient for a right-angle path."],
      ["-3", "Perpendicular means −1 divided by the first gradient."],
      ["0", "A horizontal line is perpendicular only to a vertical one — use −1 ÷ m."]];
    return { k: "perp", mc: true, ctx, z, right, rightWhy, wrong: padWrong(right, cand, fillers), q, hint, steps, pic,
      data: { m: z.m, c: z.c, perp: perpG, kind: "perp" } };
  },
  word: r => {
    const kind = r.pick(["ramp", "ramp", "speed", "speed", "path"]);
    const ctx = r.pick(LINE_CTX);
    if (kind === "ramp") {
      const m = r.pick([0.5, 1, 1.5, 2, 2.5, 3]), dist = r.pick([2, 4, 6, 8, 10]), height = m * dist;
      const z = { m, c: 0, xint: 0 };
      const pic = svgStraight(ctx.title, m, 0, { xmin: 0, xmax: Math.max(10, dist + 1), ymin: 0, ymax: Math.max(8, height + 1),
        marks: [{ n: "P", x: dist, y: height, lab: `(${dist} m, ?)`, dy: -8 }], xName: "m along", yName: "height" });
      if (r.chance(.4)) {
        return { k: "word", mc: false, ctx, z, x: m,
          q: `A ${ctx.thing} rises steadily. After ${dist} m along the ground it is ${fmt(height)} m high. What is the gradient of the ramp?`,
          hint: "Gradient = rise ÷ run. Here the run is the ground distance and the rise is the height.",
          steps: [`$m = \\dfrac{${fmt(height)}}{${dist}} = ${fmt(m)}$`],
          pic, data: { m, c: 0, dist, height, word: "ramp-grad" },
          slips: padSlips(m, [
            [height, "That is the height. Divide by the ground distance to get the gradient."],
            [dist / height, "You flipped the fraction. Gradient is rise ÷ run = height ÷ distance."],
            [m + 1, "Divide carefully: height ÷ ground distance."],
            [height - dist, "Do not subtract. Gradient is a divide: rise ÷ run."]
          ], [[0.25, "Use height ÷ ground distance for the ramp's gradient."],
            [4, "Check the divide: rise over run for this ramp."]]) };
      }
      return { k: "word", mc: false, ctx, z, x: height,
        q: `A ${ctx.thing} has gradient ${fmt(m)} and starts on the ground. How high is it, in metres, after ${dist} m along the ground?`,
        hint: "Height = gradient × ground distance (the line is y = mx with c = 0).",
        steps: [`$y = ${fmt(m)} \\times ${dist} = ${fmt(height)}$ m`],
        pic, data: { m, c: 0, dist, height, word: "ramp-h" },
        slips: padSlips(height, [
          [m + dist, "Multiply, do not add: height = gradient × distance."],
          [dist, "That is only the ground distance. Multiply by the gradient."],
          [m, "That is the gradient. Multiply by the ground distance to get the height."],
          [height / 2, "Use the full ground distance, not half of it."]
        ], [[height + 3, "Multiply gradient by distance carefully for the height."],
          [1, "A ramp with this gradient rises more than one metre over that distance."]]) };
    }
    if (kind === "speed") {
      const speed = r.pick([2, 3, 4, 5, 6]), t = r.pick([2, 3, 4, 5]), c = r.chance(.4) ? r.pick([2, 4, 5, 6]) : 0;
      const dist = speed * t + c;
      const z = { m: speed, c, xint: c === 0 ? 0 : -c / speed };
      const pic = svgStraight("Sports-day run", speed, c, { xmin: 0, xmax: Math.max(6, t + 1), ymin: 0, ymax: Math.max(20, dist + 2),
        marks: [{ n: "P", x: t, y: dist, lab: `(${t} s, ?)`, dy: -8 }], xName: "time (s)", yName: "m" });
      const whoShort = ctx.who.split(" ")[0];
      return { k: "word", mc: false, ctx, z, x: dist,
        q: `On sports day ${ctx.who} runs at a steady ${speed} m/s${c ? ` after a ${c} m head start` : ""}. The distance–time graph is a straight line. How far has ${whoShort} run after ${t} seconds, in metres?`,
        hint: c ? `Distance = speed × time + head start: y = ${speed}x + ${c}.` : "Distance = speed × time on a straight-line graph through the origin.",
        steps: c ? [`$y = ${speed} \\times ${t} + ${c} = ${dist}$ m`] : [`$y = ${speed} \\times ${t} = ${dist}$ m`],
        pic, data: { m: speed, c, t, dist, word: "speed" },
        slips: padSlips(dist, [
          [speed * t, c ? "You forgot the head start. Add it after multiplying speed by time." : "Multiply speed by time carefully for the distance."],
          [speed + t + c, "Multiply speed by time" + (c ? ", then add the head start" : "") + "; do not add the speed and the time."],
          [t, "That is only the time. Multiply by the speed to get the distance."],
          [speed, "That is the speed. Multiply by the time to get the distance."]
        ], [[dist + 5, "Use distance = speed × time" + (c ? " + head start" : "") + "."],
          [1, "After several seconds at this speed the distance is more than one metre."]]) };
    }
    const m = r.pick([0.5, 1, 1.5, 2]), c = r.pick([0, 1, 2]), x = r.pick([2, 4, 6, 8]), y = m * x + c;
    const z = { m, c, xint: Math.abs(m) > 1e-12 ? -c / m : null };
    const pic = svgStraight(ctx.title, m, c, { xmin: 0, xmax: Math.max(8, x + 1), ymin: 0, ymax: Math.max(8, y + 1),
      marks: [{ n: "P", x, y, lab: `(?, ${fmt(y)})`, dy: -8 }], xName: "steps", yName: "height" });
    const ofCap = ctx.of.replace(/^the /, "The ");
    return { k: "word", mc: false, ctx, z, x,
      q: `${ofCap} follows ${lineEqShow(m, c)} (height in metres). At what step-number is the height ${fmt(y)} m?`,
      hint: "Set y equal to the height and solve for x.",
      steps: [`$${fmt(y)} = ${fmt(m)}x ${pm(c)}$`, `$x = ${fmt(x)}$`],
      pic, data: { m, c, px: x, py: y, word: "path" },
      slips: padSlips(x, [
        [y - c, "You forgot to divide by the gradient after subtracting the intercept."],
        [(y + c) / m, "Subtract c first: x = (y − c) / m."],
        [y, "That is the height, not the step-number."],
        [m, "That is the gradient. Solve for x on the line."]
      ], [[x + 3, "Solve for the step-number carefully from the height equation."],
        [x - 3 === 0 ? x + 1 : x - 3, "Keep (height − intercept) ÷ gradient for the step-number."]]) };
  }
};
const LINE_KINDS = ["grad", "grad", "yint", "yint", "xint", "match", "match", "eq", "eq", "point", "point", "parallel", "perp", "word", "word"];
const lineQ = (r, kind) => {
  const z = LINEQ[kind](r), ctx = z.ctx, uid = `lingraph|${z.k}|${JSON.stringify(z.data)}`;
  const extra = { uid, pic: z.pic || "", data: Object.assign({ lingraph: z.k, ctx: ctx.id }, z.data) };
  if (z.optPics) extra.optPics = z.optPics;
  if (z.mc) return mcqWhy(r, z.q, z.right, z.rightWhy, z.wrong, z.hint, z.steps, extra);
  return numWhy(z.q, z.x, z.hint, z.steps, z.slips, Object.assign({ keys: ["-", ".", "/"] }, extra));
};
topic(8, "lingraph", "Straight-Line Street", "📏", "Linear graphs: gradient, intercepts, match equation to pastel SVG", r => lineQ(r, r.pick(LINE_KINDS)));

topic(8, "proportion", "Proportion Potions", "🫖", "Direct and inverse proportion", r => {
  if (r.chance(.5)) { const k = r.int(2, 12), x1 = r.int(2, 10), x2 = r.int(11, 25); return num(`y is directly proportional to x. When x = ${x1}, y = ${k * x1}. Find y when x = ${x2}.`, k * x2, "Direct: y = kx. Find k first.", [`$k = ${k * x1} \\div ${x1} = ${k}$`, `$y = ${k} \\times ${x2} = ${k * x2}$`]); }
  const w = r.int(2, 8), d = r.pick([12, 24, 36, 48, 60]), w2 = r.pick([2, 3, 4, 6, 8, 12].filter(x => x !== w));
  return num(`${w} elves build a castle in ${d} days. How many days would ${w2} elves take, working at the same rate?`, rd(w * d / w2, 2), "Inverse: more workers → fewer days. Total work = workers × days.", [`Work = ${w} × ${d} = ${w * d} elf-days`, `${w * d} ÷ ${w2} = ${fmt(rd(w * d / w2, 2))} days`], { keys: ["."], tol: 0.0051, data: { w, d, w2 } });
});
topic(8, "stats", "Mean, Median & Mode", "📈", "Averages of data", r => {
  const n = r.pick([5, 6, 7, 8]), xs = Array.from({ length: n }, () => r.int(1, 20)); if (r.chance(.6)) xs[1] = xs[0];
  const sorted = asc(xs), tot = sum(xs), med = median(xs);
  const cnt = {}; xs.forEach(x => cnt[x] = (cnt[x] || 0) + 1); const mx = Math.max(...Object.values(cnt)), modes = Object.keys(cnt).filter(k => cnt[k] === mx).map(Number);
  const t = modes.length === 1 && mx > 1 ? r.int(0, 2) : r.int(0, 1);
  if (t === 0) return num(`Find the median of: ${xs.join(", ")}`, med, "Sort the data, then find the middle value.", [`Sorted: ${sorted.join(", ")}`, n % 2 ? `Middle value: ${med}` : `Middle two: ${sorted[n / 2 - 1]} and ${sorted[n / 2]} → ${fmt(med)}`], { keys: ["."], data: { xs, f: "median" } });
  if (t === 1) return num(`Find the mean of: ${xs.join(", ")} (1 d.p. if needed)`, rd(tot / n, 1), "Mean = total ÷ number of values.", [`Total = ${tot}`, `${tot} ÷ ${n} = ${fmt(rd(tot / n, 1))}`], { keys: ["."], tol: 0.051, data: { xs, f: "mean" } });
  return num(`Find the mode of: ${xs.join(", ")}`, modes[0], "The mode is the value that appears most often.", [`${modes[0]} appears ${mx} times — more than any other value.`], { data: { xs, f: "mode" } });
});
topic(8, "prob", "Wishing-Well Probability", "🎲", "Simple probability as a fraction", r => {
  const cols = [["red", r.int(1, 9)], ["blue", r.int(1, 9)], ["gold", r.int(1, 6)]], tot = cols.reduce((a, c) => a + c[1], 0), c = r.pick(cols), not = r.chance(.3), k = not ? tot - c[1] : c[1];
  return Q({ q: `A wishing well has ${cols.map(([n, k]) => `${k} ${n}`).join(", ")} marbles. One is picked at random. What is the probability it is ${not ? "NOT " : ""}${c[0]}? (fraction)`, val: k / tot, a: fracStr(k, tot), keys: ["/"], hint: "Probability = favourable outcomes ÷ total outcomes.", steps: [`Total = ${tot}`, `${not ? "Not " + c[0] : c[0]}: ${k}`, `$P = ${fracTex(k, tot)}$`] });
});
topic(8, "fraceq", "Fraction Equations", "🪶", "Equations with fractions", r => {
  const a = r.int(2, 6), x = a * r.int(-5, 8), b = r.nz(-9, 9), c = x / a + b;
  return num(`Solve ${T(`\\frac{x}{${a}} ${pm(b)} = ${c}`)}`, x, `Undo the ${b < 0 ? "−" : "+"} first, then multiply by ${a}.`, [`$\\frac{x}{${a}} = ${c - b}$`, `$x = ${c - b} \\times ${a} = ${x}$`], { keys: ["-"], data: { a, b, c } });
});
topic(8, "story", "Royal Challenges", "📜", "Sec 2 problem solving", r => {
  const s = r.int(4, 9), b = r.int(2, s - 1), ns = r.int(3, 12), nb = r.int(3, 12), N = ns + nb, cost = s * ns + b * nb;
  return num(`Silver keys cost $${s} and bronze keys cost $${b}. The dwarfs buy ${N} keys for $${cost}. How many silver keys did they buy?`, ns, "Let x be the silver keys; then there are (" + N + " − x) bronze keys.", [`$${s}x + ${b}(${N} - x) = ${cost}$`, `$${s - b}x = ${cost - b * N}$`, `$x = ${ns}$`], { data: { s, b, N, cost } });
}, { story: true });
})();
