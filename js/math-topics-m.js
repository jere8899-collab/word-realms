/* 🔢 Number Kingdom topics, Grades 5–8 (Singapore Primary 5–6, Secondary 1–2). */
(function () {
const M = (typeof module !== "undefined" && module.exports) ? require("./math-gen.js") : window.MathGen;
const { Q, num, mcq, T, NAMES, topic, PASTEL, INK, LINE, svgBox, cellKey, figKey, hasCell, nearCells, gridSheet, svgPieChart, svgGeo, dirPt, gcd, lcm, rd, fmt, simp, fracTex, fracStr, mixedTex, poly, lin, paren, pm, undo } = M._internal;

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
  trap: r => { let a, b, h = .55, top; do { a = r.int(45, 115); b = r.int(45, 115); top = 1 - h / Math.tan(a * Math.PI / 180) - h / Math.tan(b * Math.PI / 180); } while (top < .3 || top > 1.2 || Math.abs(a - 90) < 6 || Math.abs(b - 90) < 6);
    const P = [[0, 0], [1, 0], dirPt([1, 0], 180 - b, h / Math.sin(b * Math.PI / 180)), dirPt([0, 0], a, h / Math.sin(a * Math.PI / 180))], angs = [a, b, 180 - b, 180 - a], g = r.int(0, 3), xi = 3 - g;
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
  if (r.chance(.65)) { const xs = Array.from({ length: n }, () => r.int(Math.max(1, mean - 15), mean + 15)), tot = xs.reduce((a, b) => a + b, 0);
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
const xy = (p, q) => { const s = poly([[p, 1]], "x"); if (!q) return s; const t = poly([[Math.abs(q), 1]], "y"); return p ? s + (q < 0 ? " - " : " + ") + t : (q < 0 ? "-" : "") + t; };
topic(7, "simplify", "Like-Term Lanterns", "🏮", "Simplify algebraic expressions", r => {
  const a = r.nz(-6, 9), b = r.nz(-6, 9), c = r.nz(-6, 9), d = r.nz(-6, 9), X = a + c, Y = b + d;
  const term = (k, v) => `${k < 0 ? " - " : " + "}${Math.abs(k) === 1 ? "" : Math.abs(k)}${v}`;
  const e = `${a === 1 ? "" : a === -1 ? "-" : a}x${term(b, "y")}${term(c, "x")}${term(d, "y")}`, right = xy(X, Y);
  return mcq(r, `Simplify ${T(e)}`, T(right), [xy(a - c, Y), xy(X, b - d), xy(X + 1, Y), xy(Y, X), xy(-X, Y), xy(X, -Y), xy(X - 1, Y + 1)].filter(w => w !== right).map(T), "Collect the x-terms together and the y-terms together.", [`x-terms: $${a} + ${paren(c)} = ${X}$`, `y-terms: $${b} + ${paren(d)} = ${Y}$`, `Answer: $${right}$`], { data: { a, b, c, d } });
});
topic(7, "expand", "Bracket Breakers", "🔓", "Expand a(bx + c)", r => {
  const a = r.nz(-7, 9), b = r.nz(-5, 6), c = r.nz(-9, 9), right = lin(a * b, a * c);
  return mcq(r, `Expand ${T(`${a === 1 ? "" : a === -1 ? "-" : a}(${lin(b, c)})`)}`, T(right), [lin(a * b, c), lin(a * b, -a * c), lin(a + b, a * c), lin(b, a * c), lin(-a * b, a * c), lin(a * b, a + c)].filter(w => w !== right).map(T), "Multiply the number outside by EACH term inside.", [`$${paren(a)} \\times ${poly([[b, 1]])} = ${poly([[a * b, 1]])}$`, `$${paren(a)} \\times ${paren(c)} = ${a * c}$`, `Answer: $${right}$`], { data: { a, b, c } });
});
topic(7, "lineq", "Equation Elixirs", "⚗️", "Solve linear equations", r => {
  const x = r.int(-10, 12), t = r.int(0, 2);
  if (t === 0) { const a = r.nz(-9, 9), b = r.nz(-20, 20), c = a * x + b; return num(`Solve ${T(`${lin(a, b)} = ${c}`)}`, x, "Undo the + or −, then divide by the number in front of x.", [`$${poly([[a, 1]])} = ${c} ${undo(b)} = ${c - b}$`, `$x = ${c - b} \\div ${paren(a)} = ${x}$`], { keys: ["-"], data: { L: [a, b], R: [0, c] } }); }
  if (t === 1) { const a = r.int(2, 6), b = r.nz(-9, 9), c = a * (x + b); return num(`Solve ${T(`${a}(${lin(1, b)}) = ${c}`)}`, x, `Divide both sides by ${a} first (or expand).`, [`$${lin(1, b)} = ${c} \\div ${a} = ${c / a}$`, `$x = ${c / a} ${undo(b)} = ${x}$`], { keys: ["-"], data: { L: [a, a * b], R: [0, c], g: a } }); }
  let a = r.int(2, 9), c = r.int(1, 8); if (a === c) a++; const b = r.int(-12, 12), d = (a - c) * x + b;
  return num(`Solve ${T(`${lin(a, b)} = ${lin(c, d)}`)}`, x, "Get the x-terms on one side and the numbers on the other.", [`$${a}x - ${c === 1 ? "" : c}x = ${d} ${undo(b)}$`, `$${a - c === 1 ? "" : a - c}x = ${d - b}$`, `$x = ${x}$`], { keys: ["-"], data: { L: [a, b], R: [c, d] } });
});
topic(7, "angles", "Angle Archery", "🏹", "Angles on lines, at points, in triangles", r => {
  const t = r.int(0, 3);
  if (t === 0) { const a = r.int(20, 160); return num(`Two angles sit on a straight line. One is ${a}°. What is the other?`, 180 - a, "Angles on a straight line add up to 180°.", [`180° − ${a}° = ${180 - a}°`]); }
  if (t === 1) { const a = r.int(30, 80), b = r.int(30, 180 - a - 10); return num(`A triangle has angles of ${a}° and ${b}°. What is the third angle?`, 180 - a - b, "Angles in a triangle add up to 180°.", [`180° − ${a}° − ${b}° = ${180 - a - b}°`]); }
  if (t === 2) { const a = r.int(40, 150), b = r.int(40, 300 - a - 20); return num(`Three angles meet at a point: ${a}°, ${b}° and x°. Find x.`, 360 - a - b, "Angles at a point add up to 360°.", [`360° − ${a}° − ${b}° = ${360 - a - b}°`]); }
  const a = r.int(25, 155); return num(`Two straight lines cross. One angle is ${a}°. What is the angle vertically opposite it?`, a, "Vertically opposite angles are equal.", [`Vertically opposite → also ${a}°`]);
});
topic(7, "pct", "Percentage Puzzles", "🔮", "Reverse and percentage change", r => {
  if (r.chance(.5)) { const orig = r.int(4, 50) * 20, p = r.pick([10, 20, 25, 40, 50]), sale = orig * (100 - p) / 100; return num(`After a ${p}% discount, a cloak costs $${sale}. What was the original price in $?`, orig, `$${sale} is ${100 - p}% of the original.`, [`${100 - p}% → ${sale}`, `1% → ${sale} ÷ ${100 - p} = ${fmt(sale / (100 - p))}`, `100% → $${orig}`], { data: { sale, p } }); }
  const a = r.int(2, 40) * 20, p = r.pick([10, 20, 25, 50, 75, 5]), b = a * (100 + p) / 100; return num(`The kingdom's population grew from ${a} to ${b}. What is the percentage increase?`, p, "Percentage increase = increase ÷ original × 100%.", [`Increase = ${b} − ${a} = ${b - a}`, `${b - a} ÷ ${a} × 100% = ${p}%`], { data: { a, b } });
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
  const [a, b, c] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29]]).map((x, _, arr) => x), k = r.int(1, 3), A = a * k, B = b * k, C = c * k, t = r.int(0, 2);
  if (t === 2) { const x = r.int(2, 12), y = r.int(2, 12), h = Math.sqrt(x * x + y * y); return num(`A ladder reaches a tower window. Its foot is ${x} m from the tower and the window is ${y} m high. How long is the ladder? (1 d.p.)`, rd(h, 1), "c² = a² + b²", [`$c^2 = ${x}^2 + ${y}^2 = ${x * x + y * y}$`, `$c = \\sqrt{${x * x + y * y}} \\approx ${rd(h, 1).toFixed(1)}$ m`], { a: rd(h, 1).toFixed(1), keys: ["."], tol: 0.051, data: { x, y } }); }
  if (t === 0) return num(`A right-angled triangle has shorter sides ${A} cm and ${B} cm. How long is the hypotenuse?`, C, "Hypotenuse² = a² + b²", [`$c^2 = ${A}^2 + ${B}^2 = ${A * A} + ${B * B} = ${C * C}$`, `$c = \\sqrt{${C * C}} = ${C}$ cm`], { data: { x: A, y: B } });
  return num(`A right-angled triangle has hypotenuse ${C} cm and one side ${A} cm. How long is the other side?`, B, "Other side² = hypotenuse² − known side²", [`$b^2 = ${C}^2 - ${A}^2 = ${C * C} - ${A * A} = ${B * B}$`, `$b = ${B}$ cm`], { data: { h: C, x: A } });
});
topic(8, "gradient", "Gradient Hills", "⛰️", "Gradient and straight lines", r => {
  const t = r.int(0, 2);
  if (t === 0) { const x1 = r.int(-6, 6), y1 = r.int(-6, 6), dx = r.nz(-5, 5) * 2, m = r.nz(-8, 8) / 2, x2 = x1 + dx, y2 = y1 + m * dx; return num(`Find the gradient of the line through ${T(`(${x1}, ${y1})`)} and ${T(`(${x2}, ${y2})`)}.`, m, "Gradient = rise ÷ run = (y₂ − y₁) ÷ (x₂ − x₁).", [`$m = \\frac{${y2} - ${paren(y1)}}{${x2} - ${paren(x1)}} = \\frac{${y2 - y1}}{${dx}} = ${fmt(m)}$`], { keys: ["-", ".", "/"], data: { x1, y1, x2, y2 } }); }
  const m = r.nz(-6, 6), c = r.int(-10, 10), x = r.int(-5, 5);
  if (t === 1) return num(`The line ${T(`y = ${lin(m, c)}`)} meets the y-axis at (0, c). What is c?`, c, "In y = mx + c, c is the y-intercept.", [`Put x = 0: y = ${c}`], { keys: ["-"] });
  return num(`On the line ${T(`y = ${lin(m, c)}`)}, what is y when ${T(`x = ${x}`)}?`, m * x + c, "Substitute the x value.", [`$y = ${m}(${x}) ${pm(c)} = ${m * x + c}$`], { keys: ["-"], data: { m, c, x } });
});
topic(8, "proportion", "Proportion Potions", "🫖", "Direct and inverse proportion", r => {
  if (r.chance(.5)) { const k = r.int(2, 12), x1 = r.int(2, 10), x2 = r.int(11, 25); return num(`y is directly proportional to x. When x = ${x1}, y = ${k * x1}. Find y when x = ${x2}.`, k * x2, "Direct: y = kx. Find k first.", [`$k = ${k * x1} \\div ${x1} = ${k}$`, `$y = ${k} \\times ${x2} = ${k * x2}$`]); }
  const w = r.int(2, 8), d = r.pick([12, 24, 36, 48, 60]), w2 = r.pick([2, 3, 4, 6, 8, 12].filter(x => x !== w));
  return num(`${w} elves build a castle in ${d} days. How many days would ${w2} elves take, working at the same rate?`, rd(w * d / w2, 2), "Inverse: more workers → fewer days. Total work = workers × days.", [`Work = ${w} × ${d} = ${w * d} elf-days`, `${w * d} ÷ ${w2} = ${fmt(rd(w * d / w2, 2))} days`], { keys: ["."], tol: 0.0051, data: { w, d, w2 } });
});
topic(8, "stats", "Mean, Median & Mode", "📈", "Averages of data", r => {
  const n = r.pick([5, 6, 7, 8]), xs = Array.from({ length: n }, () => r.int(1, 20)); if (r.chance(.6)) xs[1] = xs[0];
  const sorted = xs.slice().sort((a, b) => a - b), tot = xs.reduce((a, b) => a + b, 0), median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const cnt = {}; xs.forEach(x => cnt[x] = (cnt[x] || 0) + 1); const mx = Math.max(...Object.values(cnt)), modes = Object.keys(cnt).filter(k => cnt[k] === mx).map(Number);
  const t = modes.length === 1 && mx > 1 ? r.int(0, 2) : r.int(0, 1);
  if (t === 0) return num(`Find the median of: ${xs.join(", ")}`, median, "Sort the data, then find the middle value.", [`Sorted: ${sorted.join(", ")}`, n % 2 ? `Middle value: ${median}` : `Middle two: ${sorted[n / 2 - 1]} and ${sorted[n / 2]} → ${fmt(median)}`], { keys: ["."], data: { xs, f: "median" } });
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
