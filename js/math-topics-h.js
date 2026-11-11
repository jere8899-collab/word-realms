/* 🔢 Number Kingdom topics, Grades 9–12 (Singapore Secondary 3–4, JC 1–2 / Years 10–13). */
(function () {
const M = (typeof module !== "undefined" && module.exports) ? require("./math-gen.js") : window.MathGen;
const { Q, num, mcq, mcqWhy, numWhy, T, topic, PASTEL, INK, LINE, esc, svgBox, cardSvg, axes, xTicks, yUnit, xUnit, f1, xy, mid, vat, vdir, toDeg, sinD, cosD, tanD, rotPt, angSweep, angWedge, angText, rightPath, figCard, figEdge, figLab, figLens, figDot, figVtx, table, rd, fmt, fdp, fracTex, fracStr, poly, lin, paren, sgn, pm, sum, asc, median, freqTotals, gcd, simp, coef, NAMES, sqrtTex, surdTex, simpRad, matTex, matSvg, PLOT_BOX, plotFrame, svgPlane, svgParabola, ampPeriod, svgWave, svgStraight, diffPoly, evalPoly, svgCurve, svgTangent } = M._internal;
const sf3 = v => +(+v.toFixed(12)).toPrecision(3);
const tol3 = v => Math.max(1e-9, Math.pow(10, Math.floor(Math.log10(Math.abs(v) || 1)) - 2) * 0.51);
const V2 = v => matTex([[v[0]], [v[1]]]), V3 = v => matTex([[v[0]], [v[1]], [v[2]]]);

/* ---------- Grade 9 (Secondary 3) ---------- */
topic(8, "quad", "Quadratic Quarry", "💠", "Solve by factorising (type both: 2, -3)", r => {
  const p = r.int(-9, 9), q = r.int(-9, 9);
  if (r.chance(.2)) { const P = r.nz(-4, 4) * 2 + 1; // (2x − P)(x − q) = 0 → x = P/2 or q
    const B = -(2 * q + P), C = P * q, e = poly([[2, 2], [B, 1], [C, 0]]), roots = [P / 2, q];
    return Q({ q: `Solve ${T(`${e} = 0`)} (type both solutions, like 2, -3)`, kind: "set", val: roots, a: `${fmt(P / 2)}, ${q}`, keys: ["-", ",", ".", "/"], hint: "Factorise into two brackets, then set each bracket to 0.", steps: [`$${e} = (${lin(2, -P)})(${lin(1, -q)}) = 0$`, `$x = ${fracTex(P, 2)}$ or $x = ${q}$`], data: { a: 2, b: B, c: C } }); }
  const B = -(p + q), C = p * q, e = poly([[1, 2], [B, 1], [C, 0]]), roots = p === q ? [p] : [p, q];
  return Q({ q: `Solve ${T(`${e} = 0`)} (type all solutions, like 2, -3)`, kind: "set", val: roots, a: roots.join(", "), keys: ["-", ","], hint: `Find two numbers that multiply to ${C} and add to ${B}.`,
    steps: [`$${e} = (${lin(1, -p)})(${lin(1, -q)}) = 0$`, p === q ? `Repeated root: $x = ${p}$` : `So $x = ${p}$ or $x = ${q}$`], data: { a: 1, b: B, c: C } });
}, { id: "g9.quad", was: 9 });

/* ---------- 🎢 Parabola Park (MOE Sec 3 E-Math quadratic graphs): y-intercept, axis of symmetry, turning point
   (max/min from sign of a), roots from a factorised form or a drawn graph, match equation ↔ pastel SVG graph,
   complete the square → y = a(x−h)²+k, and kid word problems (fountain jets, kite arcs, rainbow bridges,
   pumpkin-coach ramps). Pictures use the shared svgParabola / svgPlane kit in math-gen.js (class=parabola
   data-a/b/c, marks class=pdot). Travel graphs now share plotFrame for the cream chart box (byte-identical). */
const PARA_CTX = [
  { id: "fountain", title: "Fountain jet", who: "Fairy Pip", spot: "the park fountain", thing: "fountain jet", of: "the jet" },
  { id: "kite", title: "Kite arc", who: "Jack", spot: "Parabola Park", thing: "kite string arc", of: "the kite" },
  { id: "ball", title: "Ball throw", who: "Princess Mira", spot: "the sports field", thing: "thrown ball", of: "the ball" },
  { id: "bridge", title: "Rainbow bridge", who: "Sumi the star fairy", spot: "the rainbow bridge", thing: "rainbow bridge", of: "the bridge" },
  { id: "coach", title: "Pumpkin-coach ramp", who: "Cinderella", spot: "the palace ramp", thing: "pumpkin-coach path", of: "the coach" },
  { id: "park", title: "Parabola Park", who: "Little Red", spot: "Parabola Park", thing: "park path", of: "the path" }
];
// nice ax²+bx+c with integer a∈{±1,±2,±3} and distinct integer roots p,q
const niceQuad = r => {
  const a = r.pick([-3, -2, -1, 1, 2, 3]);
  let p = r.int(-4, 4), q = r.int(-4, 4), guard = 0;
  while ((p === q || Math.abs(p) > 4 || Math.abs(q) > 4) && guard++ < 12) { p = r.int(-4, 4); q = r.int(-4, 4); }
  if (p === q) q = p + r.pick([-3, -2, -1, 1, 2, 3]);
  const B = -a * (p + q) || 0, C = a * p * q || 0, h = (p + q) / 2, k = a * (h - p) * (h - q) || 0;
  return { a, b: B, c: C, p, q, h, k, roots: [p, q].slice().sort((x, y) => x - y) };
};
const eqTex = (a, b, c) => poly([[a, 2], [b, 1], [c, 0]]);
const tpForm = (a, h, k) => {
  const inside = h === 0 ? "x" : h > 0 ? `(x - ${fmt(h)})` : `(x + ${fmt(-h)})`;
  const front = a === 1 ? "" : a === -1 ? "-" : String(a);
  return k === 0 ? `y = ${front}${inside}^{2}` : `y = ${front}${inside}^{2} ${k < 0 ? "-" : "+"} ${fmt(Math.abs(k))}`;
};
const paraMarks = (z, which) => {
  const m = [];
  if (which.includes("tp")) m.push({ n: "T", x: z.h, y: z.k, lab: `(${fmt(z.h)}, ${fmt(z.k)})`, dy: z.a > 0 ? 14 : -8 });
  if (which.includes("y")) m.push({ n: "Y", x: 0, y: z.c, lab: `(0, ${fmt(z.c)})`, dx: Math.abs(z.c - z.k) < 1e-9 ? 18 : 0, dy: Math.abs(z.c - z.k) < 1e-9 ? 0 : (z.c > 0 ? -8 : 14) });
  if (which.includes("roots")) z.roots.forEach((x, i) => m.push({ n: "R" + (i + 1), x, y: 0, lab: `(${fmt(x)}, 0)`, dy: 14 }));
  return m;
};
const paraPic = (z, ctx, which = ["tp"], o = {}) => svgParabola(ctx.title, z.a, z.b, z.c, Object.assign({ marks: paraMarks(z, which) }, o));
const fmtPair = (x, y) => `${fmt(x)}, ${fmt(y)}`;
const uniqSlips = (ans, slips, isSet) => {
  const keep = [], seen = new Set();
  for (const [v, note] of slips) {
    const key = String(v);
    if (seen.has(key) || !note || note.length < 20) continue;
    if (isSet) {
      const split = s => String(s).replace(/[()]/g, "").split(/\s*,\s*/).map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b).join(",");
      if (split(v) === split(ans)) continue;
    } else if (String(v) === String(ans)) continue;
    seen.add(key); keep.push([v, note]);
  }
  return keep;
};
const PARA = {
  yint: r => { const z = niceQuad(r), ctx = r.pick(PARA_CTX), mc = r.chance(.45), pic = paraPic(z, ctx, ["y"]);
    const q = `${ctx.who} sketches ${T(`y = ${eqTex(z.a, z.b, z.c)}`)} for ${ctx.of} at ${ctx.spot}. What is the y-intercept?`;
    const hint = "The y-intercept is the value of y when x = 0: just the constant term c.";
    const steps = [`Put $x = 0$: $y = ${z.c}$`, `So the graph crosses the y-axis at $(0,\\ ${z.c})$.`];
    if (mc) {
      const right = String(z.c);
      const cand = [
        [String(z.a), `That is the coefficient of x² (a = ${z.a}). The y-intercept is the constant term.`],
        [String(z.b), `That is the coefficient of x. Put x = 0: every x-term vanishes, leaving only the constant.`],
        [String(z.h), `That is the axis of symmetry. The y-intercept is where x = 0.`],
        [String(z.k), `That is the y-coordinate of the turning point, not where the curve meets the y-axis.`],
        [String(z.c === 0 ? 1 : -z.c), z.c === 0 ? `When x = 0 this curve gives y = 0, so the intercept is 0, not 1.` : `Watch the sign of the constant term.`],
        [String(z.p), `That is a root on the x-axis. The y-intercept is the constant term of the equation.`],
        [String(z.c + 2), `That adds 2 to the constant. Read c straight from the end of the equation.`],
        [String(z.c - 2), `That subtracts 2 from the constant. Read c straight from the end of the equation.`],
        [String(z.q), `That is the other root. The y-intercept is the constant term.`]
      ];
      const wrong = []; const seen = new Set([right]);
      for (const [o, n] of cand) if (!seen.has(o)) { seen.add(o); wrong.push([o, n]); }
      return { k: "yint", mc: true, ctx, z, x: z.c, right, rightWhy: z.c === 0 ? `Right: putting x equal to zero wipes out every x-term, so only the constant at the end of the equation is left — here the curve meets the y-axis at the origin.` : `Right: putting x = 0 wipes out every x-term, so only the constant at the end of the equation is left — that is where the curve meets the y-axis.`, wrong, q, hint, steps, pic, data: { a: z.a, b: z.b, c: z.c } };
    }
    return { k: "yint", mc: false, ctx, z, x: z.c, q, hint, steps, pic, data: { a: z.a, b: z.b, c: z.c },
      slips: [[z.a, `That is a, the coefficient of x². The y-intercept is the constant term: y = ${z.c} when x = 0.`],
        [z.b, `That is b. Put x = 0 in y = ${eqTex(z.a, z.b, z.c)} to leave just ${z.c}.`],
        [z.k, `That is the turning-point height. The y-intercept is c = ${z.c}.`],
        [z.c === 0 ? 1 : -z.c, z.c === 0 ? `When x = 0 this curve gives y = 0, so the intercept is 0.` : `Check the sign of the constant term: it is ${z.c}.`]] }; },
  axis: r => { const z = niceQuad(r), ctx = r.pick(PARA_CTX), pic = paraPic(z, ctx, ["tp"]);
    const q = `The path of ${ctx.of} follows ${T(`y = ${eqTex(z.a, z.b, z.c)}`)}. Find the equation of the axis of symmetry.`;
    const right = T(`x = ${fmt(z.h)}`);
    const cand = [
      [T(`x = ${fmt(z.h === 0 ? 2 : -z.h)}`), z.h === 0 ? `The axis is the midline between the roots, so x = 0 here — not x = 2.` : `The formula is x = −b/(2a). Here −b/(2a) = ${fmt(z.h)}, not ${fmt(-z.h)}.`],
      [T(`y = ${fmt(z.h)}`), `The axis of a vertical parabola is a vertical line, so it is written x = …, not y = ….`,],
      [T(`x = ${fmt(z.h === 0 ? 1 : z.k)}`), z.h === 0 ? `x = 1 is not halfway between the roots. The midline is x = 0.` : `That mixes up the turning-point y-value with the axis. The axis is x = ${fmt(z.h)}.`],
      [T(`x = ${fmt(z.c === z.h ? z.c + 1 : z.c)}`), `The constant c is the y-intercept, not the axis. The axis is x = −b/(2a) = ${fmt(z.h)}.`],
      [T(`x = ${fmt(z.p)}`), `That is one of the roots. The axis sits halfway between the two roots, at x = ${fmt(z.h)}.`]
    ];
    const wrong = []; const seen = new Set([right]);
    for (const [o, n] of cand) if (!seen.has(o)) { seen.add(o); wrong.push([o, n]); }
    return { k: "axis", mc: true, ctx, z, x: z.h, right, rightWhy: `Right: the axis is the vertical line x = −b/(2a) = −(${z.b})/(2×${paren(z.a)}) = ${fmt(z.h)}, straight through the turning point.`, wrong,
      q, hint: "Axis of symmetry: x = −b/(2a). It goes straight through the turning point.",
      steps: [`$x = -\\frac{b}{2a} = -\\frac{${z.b}}{2\\times${paren(z.a)}} = ${fmt(z.h)}$`, `So the axis of symmetry is $x = ${fmt(z.h)}$.`], pic, data: { a: z.a, b: z.b, c: z.c, h: z.h, k: z.k } }; },
  turn: r => { const z = niceQuad(r), ctx = r.pick(PARA_CTX), ask = r.pick(["coord", "coord", "maxmin"]), pic = paraPic(z, ctx, ["tp"]);
    if (ask === "maxmin") {
      const isMin = z.a > 0, right = isMin ? "minimum" : "maximum";
      const wrong = [
        [isMin ? "maximum" : "minimum", `Look at a: here a = ${z.a} ${isMin ? "> 0, so the parabola opens upwards and the turning point is the lowest point" : "< 0, so the parabola opens downwards and the turning point is the highest point"}.`],
        ["neither — it is a point of inflection", "A quadratic never has a point of inflection; its turning point is always the highest or the lowest point on the curve."],
        ["both a highest and a lowest point", "One parabola has only one turning point, so that point is either the highest or the lowest, not both."]
      ];
      return { k: "maxmin", mc: true, ctx, z, right, rightWhy: isMin
        ? `Right: a = ${z.a} is positive, so the curve opens upwards and the turning point is the lowest point on the graph.`
        : `Right: a = ${z.a} is negative, so the curve opens downwards and the turning point is the highest point on the graph.`, wrong,
        q: `${ctx.who} graphs ${T(`y = ${eqTex(z.a, z.b, z.c)}`)} for ${ctx.of}. Is the turning point a maximum or a minimum?`,
        hint: "If a > 0 the parabola opens up (lowest point). If a < 0 it opens down (highest point).",
        steps: [`$a = ${z.a}$ ${isMin ? "> 0 → opens upwards" : "< 0 → opens downwards"}`, `So the turning point is a ${right}.`], pic, data: { a: z.a, b: z.b, c: z.c, h: z.h, k: z.k, kind: "maxmin" } };
    }
    const ans = fmtPair(z.h, z.k);
    const slips = uniqSlips(ans, [
      [fmtPair(z.k, z.h), "Those coordinates are swapped. The axis gives x first, then y = f(x)."],
      [fmtPair(z.h === 0 ? 1 : -z.h, z.k), `The x-coordinate is −b/(2a) = ${fmt(z.h)}. Check the sign carefully.`],
      [fmtPair(z.h, z.c), `y = ${z.c} is the y-intercept. Substitute x = ${fmt(z.h)} into the equation to get y = ${fmt(z.k)}.`],
      [fmtPair(z.p, 0), `That is a root on the x-axis. The turning point sits at (${fmt(z.h)}, ${fmt(z.k)}).`],
      [fmtPair(0, z.k), `The axis is at x = ${fmt(z.h)}, not always at x = 0.`]
    ], false);
    return { k: "turn", mc: false, pair: true, ctx, z, x: z.h, y: z.k, a: ans,
      q: `Find the turning point of ${T(`y = ${eqTex(z.a, z.b, z.c)}`)} (type x, y like 2, -3).`,
      hint: "The x-coordinate is −b/(2a). Then substitute into the equation to find y.",
      steps: [`$x = -\\frac{b}{2a} = ${fmt(z.h)}$`, `$y = ${eqTex(z.a, z.b, z.c)}$ at $x = ${fmt(z.h)}$ gives $y = ${fmt(z.k)}$`, `Turning point: $(${fmt(z.h)},\\ ${fmt(z.k)})$.`],
      pic, data: { a: z.a, b: z.b, c: z.c, h: z.h, k: z.k }, slips }; },
  roots: r => { const z = niceQuad(r), ctx = r.pick(PARA_CTX), fromGraph = r.chance(.4);
    const ans = z.roots.join(", "), pic = paraPic(z, ctx, ["roots", "tp"]);
    const slips = uniqSlips(ans, [
      [String(z.roots[0]), "A quadratic has two roots (counting a repeat twice). Type both numbers."],
      [fmtPair(z.h, z.k), "That is the turning point. Roots are the x-intercepts where y = 0."],
      [String(z.c), `That is the y-intercept. Roots sit on the x-axis at x = ${z.roots.join(" and ")}.`],
      [`${z.roots[0] + (z.roots[0] === z.roots[1] - 1 ? -1 : 1)}, ${z.roots[1]}`, "Check each marked x-intercept on the axis carefully."],
      [`${-z.p}, ${-z.q}`, `From (x − p) = 0 you get x = p, so keep the signs: ${z.p} and ${z.q}.`]
    ], true);
    if (fromGraph) {
      return { k: "roots-graph", mc: false, set: true, ctx, z, val: z.roots.slice(), a: ans,
        q: `The graph shows ${ctx.of} at ${ctx.spot}. Read off the roots (x-intercepts). Type both, like 2, -3.`,
        hint: "Roots are where the curve crosses the x-axis (y = 0).",
        steps: [`The curve meets the x-axis at $x = ${fmt(z.roots[0])}$ and $x = ${fmt(z.roots[1])}$.`, `So the roots are ${z.roots.join(" and ")}.`],
        pic, data: { a: z.a, b: z.b, c: z.c, roots: z.roots, from: "graph" }, slips };
    }
    const fact = z.a === 1 ? `(${lin(1, -z.p)})(${lin(1, -z.q)})` : `${coef(z.a)}(${lin(1, -z.p)})(${lin(1, -z.q)})`;
    return { k: "roots-fact", mc: false, set: true, ctx, z, val: z.roots.slice(), a: ans,
      q: `${ctx.who} factorises the path as ${T(`y = ${fact}`)}. Find the roots (type both, like 2, -3).`,
      hint: "Set each bracket equal to 0.",
      steps: [`$${lin(1, -z.p)} = 0$ → $x = ${z.p}$`, `$${lin(1, -z.q)} = 0$ → $x = ${z.q}$`, `Roots: ${z.roots.join(" and ")}.`],
      pic, data: { a: z.a, b: z.b, c: z.c, roots: z.roots, p: z.p, q: z.q, from: "fact" }, slips }; },
  match: r => { const z = niceQuad(r), ctx = r.pick(PARA_CTX);
    const key = g => `${g.a}|${g.b}|${g.c}`;
    const mk = (p, q, a) => { const B = -a * (p + q), C = a * p * q, h = (p + q) / 2, kk = a * (h - p) * (h - q); return { a, b: B, c: C, h, k: kk, p, q, roots: [p, q] }; };
    const graphs = [z];
    const seen = new Set([key(z)]);
    const candidates = [
      mk(z.p, z.q, -z.a),
      mk(z.p + 1, z.q + 1, z.a),
      mk(z.p - 1, z.q - 1, z.a),
      mk(z.p, z.q, z.a === 1 ? 2 : z.a === -1 ? -2 : (z.a > 0 ? 1 : -1)),
      mk(-z.p, -z.q, z.a),
      mk(z.q, z.p + r.pick([-3, -2, 2, 3]), z.a)
    ];
    for (const g of r.shuffle(candidates)) if (!seen.has(key(g)) && graphs.length < 4) { seen.add(key(g)); graphs.push(g); }
    while (graphs.length < 4) {
      const g = niceQuad(r); if (!seen.has(key(g))) { seen.add(key(g)); graphs.push(g); }
    }
    const ids = ["g1", "g2", "g3", "g4"], order = r.shuffle([0, 1, 2, 3]), rightId = ids[order.indexOf(0)];
    const optPics = {};
    order.forEach((gi, i) => { optPics[ids[i]] = svgParabola(" ", graphs[gi].a, graphs[gi].b, graphs[gi].c, { small: true, marks: [{ n: "T", x: graphs[gi].h, y: graphs[gi].k, lab: "" }] }); });
    const wrong = ids.filter(id => id !== rightId).map(id => {
      const g = graphs[order[ids.indexOf(id)]];
      return [id, `That graph has a = ${g.a} and turning point (${fmt(g.h)}, ${fmt(g.k)}). Match a = ${z.a}, the axis x = ${fmt(z.h)}, and whether it opens up or down.`];
    });
    return { k: "match", mc: true, ctx, z, right: rightId, rightWhy: `Right: this curve opens ${z.a > 0 ? "upwards" : "downwards"} (a = ${z.a}) with turning point (${fmt(z.h)}, ${fmt(z.k)}), matching the given equation.`, wrong,
      q: `Which graph shows ${T(`y = ${eqTex(z.a, z.b, z.c)}`)} for ${ctx.of}?`,
      hint: "Check whether it opens up or down (sign of a), then check the turning point and the y-intercept.",
      steps: [`$a = ${z.a}$ → opens ${z.a > 0 ? "up" : "down"}`, `Turning point $(${fmt(z.h)},\\ ${fmt(z.k)})$, y-intercept $(0,\\ ${z.c})$`, `Pick the graph that matches all three.`],
      pic: "", optPics, data: { a: z.a, b: z.b, c: z.c, h: z.h, k: z.k, order: order.map(i => key(graphs[i])) } }; },
  square: r => { // prefer h ≠ 0 so the completed-square form is visually distinct
    let z = niceQuad(r), guard = 0; while (z.h === 0 && guard++ < 20) z = niceQuad(r);
    const ctx = r.pick(PARA_CTX), pic = paraPic(z, ctx, ["tp"]);
    const right = T(tpForm(z.a, z.h, z.k));
    const alts = [
      tpForm(z.a, -z.h, z.k),
      tpForm(-z.a, z.h, z.k),
      tpForm(z.a, z.h, -z.k === z.k ? z.k + 1 : -z.k),
      tpForm(z.a, z.h + (z.h >= 0 ? 1 : -1), z.k),
      `y = ${eqTex(z.a, z.b, z.c)}`
    ];
    const notes = [
      `Completing the square gives (x − (−b/2a)), and −b/2a = ${fmt(z.h)}, so keep that sign inside the bracket.`,
      `Keep a = ${z.a} in front of the squared bracket; do not flip its sign.`,
      `The constant after completing the square is k = ${fmt(z.k)}, the turning-point height.`,
      `The shift inside the bracket is h = ${fmt(z.h)}, the axis of symmetry.`,
      `That is the original expanded form. Rewrite it as a(x − h)² + k.`
    ];
    const wrong = []; const seen = new Set([right]);
    alts.forEach((form, i) => { const o = T(form); if (!seen.has(o)) { seen.add(o); wrong.push([o, notes[i]]); } });
    return { k: "square", mc: true, ctx, z, right, rightWhy: `Right: completing the square (or reading the turning point) rewrites the curve with axis x = ${fmt(z.h)} and height ${fmt(z.k)}.`, wrong,
      q: `Complete the square for ${T(`y = ${eqTex(z.a, z.b, z.c)}`)}. Which is the turning-point form?`,
      hint: "y = a(x − h)² + k, where h = −b/(2a) and k is the y-value there.",
      steps: [`$h = -\\frac{b}{2a} = ${fmt(z.h)}$`, `$k = ${fmt(z.k)}$`, `So $y = ${tpForm(z.a, z.h, z.k)}$.`], pic, data: { a: z.a, b: z.b, c: z.c, h: z.h, k: z.k } }; },
  word: r => {
    let z = niceQuad(r), guard = 0;
    while (!(z.a < 0 && z.k > 0 && z.roots[0] !== z.roots[1]) && guard++ < 40) z = niceQuad(r);
    if (z.a > 0) z = { a: -Math.abs(z.a), b: Math.abs(z.a) * (z.p + z.q), c: -Math.abs(z.a) * z.p * z.q, p: z.p, q: z.q, h: z.h, k: Math.abs(z.a) * (z.h - z.p) * (z.p - z.h), roots: z.roots };
    // recompute k from a,p,q to be safe
    z = (() => { const a = -Math.abs(z.a), p = z.p, q = z.q, B = -a * (p + q), C = a * p * q, h = (p + q) / 2, k = a * (h - p) * (h - q); return { a, b: B, c: C, p, q, h, k, roots: [p, q].slice().sort((x, y) => x - y) }; })();
    if (z.k <= 0) { const lift = Math.ceil(1 - z.k); z = Object.assign({}, z, { c: z.c + lift, k: z.k + lift }); }
    const ctx = r.pick(PARA_CTX), width = Math.abs(z.p - z.q);
    const askW = ctx.id === "bridge" || r.chance(.35);
    const pic = paraPic(z, ctx, askW ? ["roots", "tp"] : ["tp"]);
    if (askW) {
      const slips = uniqSlips(String(width), [
        [width / 2, `That is only half the span (from the axis to one root). The full width is ${width} m.`],
        [z.k, `That is the greatest height, ${fmt(z.k)} m. The question asks for the width on the ground.`],
        [Math.abs(z.roots[0]) || Math.abs(z.roots[1]) || 1, `Use both roots: |${z.roots[1]} − ${z.roots[0]}| = ${width}.`],
        [z.h === 0 ? width + 1 : z.h, z.h === 0 ? `The width is the full distance between the roots: ${width} m.` : `That is the axis x = ${fmt(z.h)}, not the width.`],
        [width + 1, `Subtract the roots carefully: |${z.roots[1]} − ${z.roots[0]}| = ${width}.`]
      ], false).map(([v, n]) => [+v, n]);
      return { k: "width", mc: false, ctx, z, x: width,
        q: `A ${ctx.thing} follows ${T(`y = ${eqTex(z.a, z.b, z.c)}`)} metres, with y the height above the ground. How wide is it on the ground, between the two roots, in metres?`,
        hint: "Find the roots, then subtract: width = |root₁ − root₂|.",
        steps: [`Roots where y = 0: $x = ${z.roots[0]}$ and $x = ${z.roots[1]}$`, `Width = |${z.roots[1]} − ${z.roots[0]}| = ${width} m`],
        pic, data: { a: z.a, b: z.b, c: z.c, h: z.h, k: z.k, roots: z.roots, width }, slips };
    }
    const slips = uniqSlips(String(z.k), [
      [z.h === z.k ? z.h + 1 : z.h, `That is the x-coordinate of the turning point (when it happens). The height is y = ${fmt(z.k)} m.`],
      [z.c === z.k ? z.c + 1 : z.c, `That is the height at x = 0, not the maximum.`],
      [width, `That is the width between the roots. The greatest height is ${fmt(z.k)} m.`],
      [z.k === 0 ? 1 : -z.k, `Height is positive here: the maximum is ${fmt(z.k)} m.`]
    ], false).map(([v, n]) => [+v, n]);
    return { k: "height", mc: false, ctx, z, x: z.k,
      q: `${ctx.who} watches ${ctx.of} follow ${T(`y = ${eqTex(z.a, z.b, z.c)}`)} metres (y = height). What is the greatest height, in metres?`,
      hint: "The greatest height is the y-coordinate of the turning point (since a < 0).",
      steps: [`$a = ${z.a} < 0$, so the turning point is a maximum`, `$x = -\\frac{b}{2a} = ${fmt(z.h)}$, $y = ${fmt(z.k)}$`, `Greatest height = ${fmt(z.k)} m`],
      pic, data: { a: z.a, b: z.b, c: z.c, h: z.h, k: z.k, roots: z.roots }, slips };
  }
};
const PARA_KINDS = ["yint", "yint", "axis", "axis", "turn", "turn", "turn", "roots", "roots", "match", "match", "square", "square", "word", "word"];
const paraQ = (r, kind) => {
  const z = PARA[kind](r), ctx = z.ctx, uid = `quadgraph|${z.k}|${JSON.stringify(z.data)}`;
  const extra = { uid, pic: z.pic || "", data: Object.assign({ quadgraph: z.k, ctx: ctx.id }, z.data) };
  if (z.optPics) extra.optPics = z.optPics;
  if (z.mc) return mcqWhy(r, z.q, z.right, z.rightWhy, z.wrong, z.hint, z.steps, extra);
  if (z.pair) return Q(Object.assign({ q: z.q, kind: "pair", val: [z.x, z.y], a: z.a, keys: ["-", ","], hint: z.hint, steps: z.steps, slips: z.slips }, extra));
  if (z.set) return Q(Object.assign({ q: z.q, kind: "set", val: z.val, a: z.a, keys: ["-", ","], hint: z.hint, steps: z.steps, slips: z.slips }, extra));
  return numWhy(z.q, z.x, z.hint, z.steps, z.slips, Object.assign({ keys: ["-", "."] }, extra));
};
topic(9, "quadgraph", "Parabola Park", "🎢", "Quadratic graphs: intercepts, turning points and matching curves", r => paraQ(r, r.pick(PARA_KINDS)));
topic(8, "simul", "Twin Potions", "👯", "Simultaneous equations (type x, y)", r => {
  const x = r.int(-6, 8), y = r.int(-6, 8); let a = r.nz(-5, 5), b = r.nz(-5, 5), c = r.nz(-5, 5), d = r.nz(-5, 5); while (a * d - b * c === 0) d = r.nz(-5, 5);
  const e1 = a * x + b * y, e2 = c * x + d * y, L = (p, q) => `${poly([[p, 1]], "x")} ${q < 0 ? "-" : "+"} ${poly([[Math.abs(q), 1]], "y")}`;
  return Q({ q: `Solve: ${T(`${L(a, b)} = ${e1}`)} and ${T(`${L(c, d)} = ${e2}`)} (type x, y like 3, -2)`, kind: "pair", val: [x, y], a: `${x}, ${y}`, keys: ["-", ","],
    hint: "Make the x coefficients match, then subtract the equations to eliminate x.", steps: [`Multiply the first equation by ${paren(c)} and the second by ${paren(a)}.`, `Subtract: $${a * d - b * c}y = ${a * e2 - c * e1}$ → $y = ${y}$`, `Substitute back: $x = ${x}$`], data: { a, b, c, d, e1, e2 } });
}, { id: "g9.simul", was: 9 });
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

/* ---------- 🌿 Root Garden (MOE Sec 3 surds): simplify √(a²·n) and k√(a²·n), multiply √a·√b then simplify, add/subtract
   like surds p√n ± q√n, expand (√a ± √b)(√a ∓ √b) and (√a + √b)², rationalise a denominator (1/√a, k/√a, k/(a√b), and
   the conjugate k/(√a ± √b)), and "which expression is equivalent" MCQs. Answers that stay as a surd use mcqWhy; ones that
   land on a plain number use numWhy. The packing picture for a simplify question shows an a×a grid of pastel tiles of area n
   (so √(a²n) = a√n); tiles carry class rtile + data-r / data-c, the big square class rpack + data-a / data-n / data-N. */
const SQFREE = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15];
const ROOT_CTX = [
  { id: "bean", title: "Magic bean stalks", who: "Jack", spot: "the magic-bean garden" },
  { id: "crystal", title: "Crystal root cave", who: "Fairy Pip", spot: "the crystal-root cave" },
  { id: "orchard", title: "Fairy orchard plots", who: "Sumi the star fairy", spot: "the fairy orchard" },
  { id: "pumpkin", title: "Pumpkin-patch squares", who: "Cinderella", spot: "the pumpkin patch" },
  { id: "garden", title: "Root Garden beds", who: "Princess Mira", spot: "Root Garden" }
];
// a×a pastel tiles of area n: total area N = a²·n, so √N = a√n. Readable data-* for the test.
const svgRootPack = (a, n, N) => {
  const S = a <= 4 ? 28 : a <= 6 ? 22 : 16, pad = 18, gap = 3, W = pad * 2 + a * S + (a - 1) * gap, H = W + 22;
  let tiles = ""; for (let r = 0; r < a; r++) for (let c = 0; c < a; c++) {
    const x = pad + c * (S + gap), y = pad + 18 + r * (S + gap), fill = PASTEL[(r * a + c) % PASTEL.length];
    tiles += `<rect class="rtile" data-r="${r}" data-c="${c}" x="${x}" y="${y}" width="${S}" height="${S}" rx="5" fill="${fill}" stroke="${LINE}" stroke-width="1.4"/>`;
    if (S >= 20) tiles += `<text x="${x + S / 2}" y="${y + S / 2 + 4}" font-size="11" text-anchor="middle" font-weight="800" fill="${INK}">${n}</text>`;
  }
  const body = `<rect class="rpack" data-a="${a}" data-n="${n}" data-N="${N}" x="${pad - 6}" y="${pad + 12}" width="${a * S + (a - 1) * gap + 12}" height="${a * S + (a - 1) * gap + 12}" rx="10" fill="#FFFDF8" stroke="${INK}" stroke-width="2"/>` + tiles
    + `<text x="${W / 2}" y="16" font-size="12" text-anchor="middle" font-weight="900" fill="${INK}">${a} × ${a} tiles of area ${n}</text>`
    + `<text x="${W / 2}" y="${H - 4}" font-size="11" text-anchor="middle" font-weight="800" fill="#c2457a">total ${N} → √${N} = ${a}√${n}</text>`;
  return svgBox(body, `square tiles showing root ${N}`, W, H, `0 0 ${W} ${H}`, "mpic chart surd");
};
const ROOT = {
  // simplify √(a²·n) → a√n (with a packing picture when a is small enough)
  simp: r => { const n = r.pick(SQFREE), a = r.int(2, 8), N = a * a * n, ctx = r.pick(ROOT_CTX);
    const right = T(surdTex(a, n)), pic = a <= 6 ? svgRootPack(a, n, N) : "";
    const wrong = [
      [T(surdTex(a * a, n)), `That multiplies by ${a} twice. Pull √(${a}²) out once: √(${a}² × ${n}) = ${a}√${n}.`],
      [T(surdTex(N, 1)), `${N} is the number under the root before simplifying. Factor a perfect square first.`],
      [T(surdTex(a, N)), `The ${n} stays under the root; only the perfect-square factor ${a * a} comes out.`],
      [T(surdTex(2 * a, n)), `√(${a * a}) is ${a}, not ${2 * a}. Check: ${a}² = ${a * a}.`],
      [T(sqrtTex(N)), `Leave it in surd form: pull the square factor ${a * a} out of √${N}.`]
    ];
    return { k: "simp", mc: true, ctx, a, n, N, right, rightWhy: `Right: ${N} = ${a * a} × ${n}, and √(${a * a}) = ${a}, so √${N} = ${a}√${n}.`, wrong,
      q: `${ctx.who} counts ${N} crystal seeds in ${ctx.spot}. Simplify ${T(sqrtTex(N))}.`, hint: `Find the biggest square number that divides ${N}, then pull its root out.`,
      steps: [`$${N} = ${a}^2 \\times ${n}$`, `$\\sqrt{${N}} = \\sqrt{${a}^2 \\times ${n}} = ${a}${sqrtTex(n)}$`], pic, data: { a, n, N } }; },
  // simplify k√(a²·n) → (k·a)√n
  simpK: r => { const n = r.pick(SQFREE.filter(x => x <= 10)), a = r.int(2, 5), k = r.int(2, 6), N = a * a * n, out = k * a, ctx = r.pick(ROOT_CTX);
    const right = T(surdTex(out, n));
    const wrong = [
      [T(surdTex(k, N)), `Simplify inside the root first: √(${a}² × ${n}) = ${a}√${n}, then multiply by ${k}.`],
      [T(surdTex(k * a * a, n)), `Only √(${a}²) = ${a} comes out, not ${a * a}. Then ${k} × ${a} = ${out}.`],
      [T(surdTex(k + a, n)), `Multiply the outside number by ${a}: ${k} × ${a} = ${out}, do not add.`],
      [T(surdTex(out, N)), `The ${n} stays under the root after simplifying.`],
      [T(surdTex(a, n)), `Do not drop the outside ${k}. ${k} × ${a}√${n} = ${out}√${n}.`]
    ];
    return { k: "simpK", mc: true, ctx, a, n, N, kk: k, out, right, rightWhy: `Right: √(${a}² × ${n}) = ${a}√${n}, so ${k} × ${a}√${n} = ${out}√${n}.`, wrong,
      q: `A fairy orchard plot is labelled ${T(`${k}${sqrtTex(N)}`)}. Simplify it.`, hint: `Simplify √${N} first, then multiply by ${k}.`,
      steps: [`$\\sqrt{${N}} = \\sqrt{${a}^2 \\times ${n}} = ${a}${sqrtTex(n)}$`, `$${k} \\times ${a}${sqrtTex(n)} = ${out}${sqrtTex(n)}$`], data: { a, n, N, k, out } }; },
  // √a · √b → √(ab) then simplify
  mul: r => { let a, b, A, m, g; do { a = r.pick(SQFREE); b = r.pick(SQFREE.filter(x => x !== a)); [A, m] = simpRad(a * b); } while (A === 1);
    const ctx = r.pick(ROOT_CTX), right = T(surdTex(A, m)), prod = a * b;
    const wrong = [
      [T(sqrtTex(prod)), `Keep going: ${prod} has a square factor ${A * A}, so √${prod} = ${A}√${m}.`],
      [T(surdTex(A * A, m)), `√(${A}² × ${m}) pulls out ${A}, not ${A * A}.`],
      [T(surdTex(a + b, 1)), `Multiply under one root: √${a} × √${b} = √(${a}×${b}), do not add.`],
      [T(surdTex(A, prod)), `After simplifying, only the square-free part ${m} stays under the root.`],
      [T(surdTex(2 * A, m)), `The square factor of ${prod} is ${A * A}, whose root is ${A}.`]
    ];
    return { k: "mul", mc: true, ctx, a, b, A, m, prod, right, rightWhy: `Right: √${a} × √${b} = √${prod}, and ${prod} = ${A * A} × ${m}, so the product is ${A}√${m}.`, wrong,
      q: `${ctx.who} multiplies two root labels in ${ctx.spot}: ${T(`${sqrtTex(a)} \\times ${sqrtTex(b)}`)}. Simplify the product.`, hint: "√a × √b = √(ab). Then pull out any square factor.",
      steps: [`$\\sqrt{${a}} \\times \\sqrt{${b}} = \\sqrt{${prod}}$`, `$${prod} = ${A}^2 \\times ${m}$`, `$\\sqrt{${prod}} = ${A}${sqrtTex(m)}$`], data: { a, b, A, m, prod } }; },
  // p√n ± q√n → (p±q)√n
  add: r => { const n = r.pick(SQFREE), p = r.int(2, 9), q = r.int(1, 8); if (p === q && r.chance(.5)) return ROOT.add(r);
    const sub = r.chance(.45) && p > q, out = sub ? p - q : p + q, ctx = r.pick(ROOT_CTX), op = sub ? "-" : "+", right = T(surdTex(out, n));
    const wrong = [
      [T(surdTex(p + q, 2 * n)), `The roots stay √${n}. Add or subtract the numbers in front only.`],
      [T(surdTex(sub ? p + q : Math.abs(p - q), n)), sub ? `This is a subtraction: ${p} − ${q} = ${out}, not ${p + q}.` : `This is an addition: ${p} + ${q} = ${out}, not ${Math.abs(p - q)}.`],
      [T(surdTex(out, n * n)), `√${n} ± √${n} still leaves √${n}, not √(${n}²).`],
      [T(String(out)), `Keep the √${n}: like surds add as (${p} ${op} ${q})√${n} = ${out}√${n}.`],
      [T(surdTex(p * q, n)), `Add or subtract the coefficients; do not multiply ${p} by ${q}.`]
    ];
    return { k: "add", mc: true, ctx, p, q, n, out, sub, right, rightWhy: `Right: like surds share √${n}, so ${p}√${n} ${op} ${q}√${n} = (${p} ${op} ${q})√${n} = ${out}√${n}.`, wrong,
      q: `On a Root Garden bed, ${ctx.who} combines ${T(`${surdTex(p, n)} ${op} ${surdTex(q, n)}`)}. Simplify.`, hint: "Like surds (same number under the root) add or subtract their front numbers.",
      steps: [`$${surdTex(p, n)} ${op} ${surdTex(q, n)} = (${p} ${op} ${q})${sqrtTex(n)}$`, `$= ${out}${sqrtTex(n)}$`], data: { p, q, n, out, sub } }; },
  // (√a ± √b)(√a ∓ √b) → a − b  (typed integer)
  conj: r => { let a, b; do { a = r.pick([2, 3, 5, 6, 7, 8, 10, 11, 12, 13]); b = r.pick([2, 3, 5, 6, 7, 8, 10]); } while (a <= b);
    const ctx = r.pick(ROOT_CTX), v = a - b, sign = r.chance(.5);
    const L = sign ? `(${sqrtTex(a)} + ${sqrtTex(b)})(${sqrtTex(a)} - ${sqrtTex(b)})` : `(${sqrtTex(a)} - ${sqrtTex(b)})(${sqrtTex(a)} + ${sqrtTex(b)})`;
    return { k: "conj", mc: false, ctx, a, b, v, q: `${ctx.who} expands the crystal-root brackets ${T(L)}. What number does it equal?`,
      hint: "Difference of squares: (x + y)(x − y) = x² − y², with x = √a and y = √b.",
      steps: [`$(\\sqrt{${a}})^2 - (\\sqrt{${b}})^2 = ${a} - ${b}$`, `$= ${v}$`],
      slips: [[a + b, `${a + b} would be a + b. Difference of squares subtracts: ${a} − ${b} = ${v}.`], [a * b, `Do not multiply ${a} by ${b}. Expand as (√${a})² − (√${b})².`], [v + 2 * Math.min(a, b), "The middle terms +√(ab) and −√(ab) cancel; only a − b is left."], [Math.abs(b - a) === v ? a : Math.abs(b - a), `Keep the order: a − b = ${a} − ${b} = ${v}.`]].filter((s, i, arr) => s[0] !== v && arr.findIndex(t => t[0] === s[0]) === i),
      data: { a, b, v } }; },
  // (√a + √b)² → a + b + 2√(ab)
  sq: r => { let a, b, g; do { a = r.pick([2, 3, 5, 6, 7, 8, 10]); b = r.pick([2, 3, 5, 6, 7, 8, 10].filter(x => x !== a)); g = gcd(a, b); } while (a * b > 60);
    const [A, m] = simpRad(a * b), mid = 2 * A, ctx = r.pick(ROOT_CTX), sum = a + b;
    // write a + 2√(ab) + b, with 2√(ab) simplified if possible
    const midTex = surdTex(mid, m), right = T(`${sum} + ${midTex}`);
    const wrong = [
      [T(`${sum} + ${surdTex(2, a * b)}`), a * b !== m ? `Simplify √(${a}×${b}) = √${a * b} = ${A}√${m}, so the middle term is ${mid}√${m}.` : `The middle term is 2√(${a}×${b}) = 2√${a * b}.`],
      [T(`${sum}`), `Do not drop the middle term 2√(${a}×${b}). (x + y)² = x² + 2xy + y².`],
      [T(`${sum} + ${surdTex(A, m)}`), `The middle term needs the 2: 2 × √(${a}×${b}) = $${midTex}$.`],
      [T(`${a * a + b * b} + ${midTex}`), `(√${a})² is ${a}, not ${a * a}. Use x² + 2xy + y² with x = √${a}.`],
      [T(`${sum} - ${midTex}`), `Squaring (√${a} + √${b}) adds the middle term; it does not subtract.`]
    ];
    return { k: "sq", mc: true, ctx, a, b, A, m, mid, sum, right, rightWhy: `Right: (√${a} + √${b})² = ${a} + 2√(${a}×${b}) + ${b} = ${sum} + $${midTex}$.`, wrong,
      q: `Expand ${T(`(${sqrtTex(a)} + ${sqrtTex(b)})^2`)} and simplify.`, hint: "(x + y)² = x² + 2xy + y². Here x = √a and y = √b.",
      steps: [`$(\\sqrt{${a}})^2 + 2\\sqrt{${a}}\\sqrt{${b}} + (\\sqrt{${b}})^2$`, `$= ${a} + 2\\sqrt{${a * b}} + ${b}$`, A > 1 ? `$= ${sum} + ${midTex}$` : `$= ${sum} + ${midTex}$`], data: { a, b, A, m, mid, sum } }; },
  // rationalise 1/√a or k/√a → (k√a)/a
  rat1: r => { const a = r.pick([2, 3, 5, 6, 7, 10, 11, 13]), k = r.chance(.55) ? r.int(2, 9) : 1, ctx = r.pick(ROOT_CTX);
    const [num, den] = simp(k, a), right = den === 1 ? T(surdTex(num, a)) : T(`\\frac{${surdTex(num, a)}}{${den}}`);
    const rawNum = k, rawDen = a;
    const wrong = [
      [T(`\\frac{${surdTex(rawNum, a)}}{${a * a}}`), `Multiply top and bottom by √${a}: the bottom becomes ${a}, not ${a * a}.`],
      [T(surdTex(rawNum, a)), den === 1 ? `Keep the denominator ${a} after rationalising, unless it cancels.` : `After multiplying, divide by ${a}: the answer is a fraction.`],
      [T(`\\frac{${rawNum}}{${surdTex(1, a)}}`), `The question already looks like that. Multiply top and bottom by √${a} to clear the root from the bottom.`],
      [T(`\\frac{${surdTex(rawNum * a, 1)}}{${a}}`), `√${a} × √${a} = ${a} on the bottom; the top keeps a √${a}, it does not become ${rawNum * a}.`],
      [T(`\\frac{${surdTex(1, a)}}{${rawNum}}`), `The ${rawNum === 1 ? "1" : rawNum} stays on top; multiply top and bottom by √${a}.`]
    ].filter(([o]) => o !== right);
    return { k: "rat1", mc: true, ctx, a, kk: k, num, den, right, rightWhy: `Right: multiply top and bottom by √${a}, so ${k === 1 ? "1" : k}/√${a} becomes ${num === 1 && den === 1 ? `√${a}` : den === 1 ? `${num}√${a}` : `(${num}√${a})/${den}`}.`, wrong,
      q: `Rationalise the denominator of ${T(k === 1 ? `\\frac{1}{${sqrtTex(a)}}` : `\\frac{${k}}{${sqrtTex(a)}}`)}.`, hint: `Multiply the top and the bottom by √${a}.`,
      steps: [`$\\frac{${k}}{\\sqrt{${a}}} \\times \\frac{\\sqrt{${a}}}{\\sqrt{${a}}} = \\frac{${k}${sqrtTex(a)}}{${a}}$`].concat(den !== a || num !== k ? [`Simplify the fraction: $${right.slice(1, -1)}$`] : []), data: { a, k, num, den } }; },
  // rationalise k/(c√b) → (k√b)/(c·b)
  ratC: r => { const b = r.pick([2, 3, 5, 6, 7, 10]), c = r.int(2, 5), k = r.int(1, 8), ctx = r.pick(ROOT_CTX);
    const [num, den] = simp(k, c * b), right = den === 1 ? T(surdTex(num, b)) : T(`\\frac{${surdTex(num, b)}}{${den}}`);
    const wrong = [
      [T(`\\frac{${surdTex(k, b)}}{${c}}`), `The bottom also picks up a factor ${b} from √${b} × √${b}, so divide by ${c * b}.`],
      [T(`\\frac{${surdTex(k, b)}}{${c * b * b}}`), `√${b} × √${b} = ${b}, so the bottom is ${c} × ${b} = ${c * b}.`],
      [T(`\\frac{${k}}{${surdTex(c, b)}}`), `That is the unsimplified form. Multiply top and bottom by √${b}.`],
      [T(`\\frac{${surdTex(k * c, b)}}{${c * b}}`), `Only multiply top and bottom by √${b}; do not multiply the top by ${c}.`],
      [T(surdTex(k, b)), `Keep the denominator ${c * b} (then simplify if you can).`]
    ].filter(([o]) => o !== right);
    return { k: "ratC", mc: true, ctx, b, c, kk: k, num, den, right, rightWhy: `Right: multiply top and bottom by √${b}. The bottom becomes ${c} × ${b} = ${c * b}, so the fraction simplifies to the answer shown.`, wrong,
      q: `Rationalise the denominator of ${T(`\\frac{${k}}{${c}${sqrtTex(b)}}`)}.`, hint: `Multiply top and bottom by √${b}.`,
      steps: [`$\\frac{${k}}{${c}\\sqrt{${b}}} \\times \\frac{\\sqrt{${b}}}{\\sqrt{${b}}} = \\frac{${k}${sqrtTex(b)}}{${c * b}}$`].concat([[num, den].toString() !== [k, c * b].toString() ? `Simplify: $${right.slice(1, -1)}$` : null].filter(Boolean)), data: { b, c, k, num, den } }; },
  // rationalise k/(√a ± √b) with conjugate
  ratConj: r => { let a, b; do { a = r.pick([3, 5, 6, 7, 8, 10, 11, 13]); b = r.pick([2, 3, 5, 6, 7].filter(x => x < a)); } while (!b);
    const d = a - b, k = d * r.int(1, 4), ctx = r.pick(ROOT_CTX), plus = r.chance(.5), co = k / d;
    // k/(√a+√b) * (√a-√b)/(√a-√b) = k(√a-√b)/(a-b)
    // or k/(√a-√b) * (√a+√b)/(√a+√b) = k(√a+√b)/(a-b)
    const topSign = plus ? "-" : "+", // conjugate flips the middle sign
      topTex = co === 1 ? `${sqrtTex(a)} ${topSign} ${sqrtTex(b)}` : co === -1 ? `-(${sqrtTex(a)} ${topSign === "-" ? "-" : "+"} ${sqrtTex(b)})` : `${coef(co)}(${sqrtTex(a)} ${topSign} ${sqrtTex(b)})`;
    // When co is integer, answer is co(√a ∓ √b) or expanded co√a ∓ co√b
    const right = T(co === 1 && topSign === "-" ? `${sqrtTex(a)} - ${sqrtTex(b)}` : co === 1 && topSign === "+" ? `${sqrtTex(a)} + ${sqrtTex(b)}` : `${coef(co)}(${sqrtTex(a)} ${topSign} ${sqrtTex(b)})`);
    const bot = plus ? `${sqrtTex(a)} + ${sqrtTex(b)}` : `${sqrtTex(a)} - ${sqrtTex(b)}`;
    const conj = plus ? `${sqrtTex(a)} - ${sqrtTex(b)}` : `${sqrtTex(a)} + ${sqrtTex(b)}`;
    const wrong = [
      [T(`${coef(k)}(${sqrtTex(a)} ${topSign} ${sqrtTex(b)})`), `Divide by a − b = ${d} as well: the conjugate multiplies to ${d}.`],
      [T(`${coef(co)}(${sqrtTex(a)} ${plus ? "+" : "-"} ${sqrtTex(b)})`), `Use the conjugate (flip the sign in the middle), not the same brackets again.`],
      [T(`\\frac{${k}}{${d}}`), `The top keeps the conjugate surd $${conj}$; only the bottom becomes the integer ${d}.`],
      [T(`${coef(co)}(${sqrtTex(b)} ${topSign} ${sqrtTex(a)})`), `Keep √${a} first: the conjugate is $${conj}$.`],
      [T(String(co)), `The answer is still a surd: ${right.slice(1, -1)}.`]
    ].filter(([o]) => o !== right);
    return { k: "ratConj", mc: true, ctx, a, b, kk: k, d, co, plus, right, rightWhy: `Right: multiply top and bottom by the flipped brackets (the conjugate). The bottom becomes ${a} − ${b} = ${d}, and the top keeps that conjugate surd${co === 1 ? '' : ', then divide by ' + d}.`, wrong,
      q: `Rationalise the denominator of ${T(`\\frac{${k}}{${bot}}`)}.`, hint: `Multiply top and bottom by the conjugate $${conj}$.`,
      steps: [`$\\frac{${k}}{${bot}} \\times \\frac{${conj}}{${conj}} = \\frac{${k}(${conj})}{${a} - ${b}}$`, `$= \\frac{${k}(${conj})}{${d}} = ${right.slice(1, -1)}$`], data: { a, b, k, d, co, plus } }; },
  // which expression equals a given surd
  which: r => { const n = r.pick(SQFREE), a = r.int(2, 7), N = a * a * n, ctx = r.pick(ROOT_CTX), form = r.pick(["simp", "mul", "add"]);
    let right, rightWhy, wrong, q, steps, hint, data;
    if (form === "simp") {
      right = T(surdTex(a, n)); q = `Which expression equals ${T(sqrtTex(N))}?`; hint = `Factor ${N} as a square times a square-free number.`;
      rightWhy = `Right: ${N} = ${a}² × ${n}, so √${N} = ${a}√${n}.`;
      wrong = [[T(surdTex(a * a, n)), `√(${a}²) is ${a}, so the front number is ${a}, not ${a * a}.`], [T(surdTex(a, N)), `Only ${n} stays under the root after the square factor comes out.`], [T(sqrtTex(N / a)), `Pull out √(${a}²) = ${a} from √${N}, leaving √${n}.`], [T(surdTex(2 * a, n)), `${a}² = ${a * a} divides ${N}; its root is ${a}.`]];
      steps = [`$${N} = ${a}^2 \\times ${n}$`, `$\\sqrt{${N}} = ${a}${sqrtTex(n)}$`]; data = { form, a, n, N };
    } else if (form === "mul") {
      const b = r.pick(SQFREE.filter(x => x !== n)); const [A, m] = simpRad(n * b); if (A === 1) return ROOT.which(r);
      right = T(surdTex(A, m)); q = `Which expression equals ${T(`${sqrtTex(n)} \\times ${sqrtTex(b)}`)}?`; hint = "Multiply under one root, then simplify.";
      rightWhy = `Right: √${n} × √${b} = √${n * b} = ${A}√${m}.`;
      wrong = [[T(sqrtTex(n * b)), `Simplify further: ${n * b} = ${A}² × ${m}.`], [T(surdTex(n + b, 1)), `Multiply the insides, do not add ${n} and ${b}.`], [T(surdTex(A * A, m)), `The front number is √(${A}²) = ${A}.`], [T(surdTex(A, n * b)), `After simplifying, only ${m} stays under the root.`]];
      steps = [`$\\sqrt{${n}}\\times\\sqrt{${b}} = \\sqrt{${n * b}}$`, `$= ${A}${sqrtTex(m)}$`]; data = { form, a: n, b, A, m };
    } else {
      const p = r.int(3, 9), qn = r.int(1, p - 1), out = p + qn;
      right = T(surdTex(out, n)); q = `Which expression equals ${T(`${surdTex(p, n)} + ${surdTex(qn, n)}`)}?`; hint = "Add the front numbers of like surds.";
      rightWhy = `Right: ${p}√${n} + ${qn}√${n} = (${p} + ${qn})√${n} = ${out}√${n}.`;
      wrong = [[T(surdTex(p + qn, 2 * n)), `The root stays √${n}; only the fronts add.`], [T(surdTex(p * qn, n)), `Add ${p} and ${qn}, do not multiply them.`], [T(String(out)), `Keep √${n} on the answer.`], [T(surdTex(Math.abs(p - qn), n)), `This is an addition, so ${p} + ${qn} = ${out}.`]];
      steps = [`$${p}${sqrtTex(n)} + ${qn}${sqrtTex(n)} = ${out}${sqrtTex(n)}$`]; data = { form, p, q: qn, n, out };
    }
    return { k: "which", mc: true, ctx, right, rightWhy, wrong, q: `${ctx.who} checks a Root Garden label. ${q}`, hint, steps, data }; }
};
const ROOT_KINDS = ["simp", "simp", "simpK", "mul", "mul", "add", "add", "conj", "conj", "sq", "rat1", "rat1", "ratC", "ratConj", "which", "which"];
const rootQ = (r, kind) => {
  const z = ROOT[kind](r), ctx = z.ctx, uid = `surd|${z.k}|${JSON.stringify(z.data)}`;
  const extra = { uid, pic: z.pic || "", data: Object.assign({ surd: z.k, ctx: ctx.id }, z.data) };
  if (z.mc) return mcqWhy(r, z.q, z.right, z.rightWhy, z.wrong, z.hint, z.steps, extra);
  return numWhy(z.q, z.v, z.hint, z.steps, z.slips, extra);
};
topic(9, "surds", "Root Garden", "🌿", "Bonus from Additional Mathematics: simplify, multiply and rationalise surds", r => rootQ(r, r.pick(ROOT_KINDS)), { extra: "amath" });
topic(8, "trig", "SOH-CAH-TOA Tower", "🗼", "Trigonometry in right triangles", r => {
  const ang = r.int(15, 75), side = r.int(3, 20), t = r.int(0, 3);
  if (t === 3) { const o = r.int(2, 15), a2 = r.int(2, 15), th = toDeg(Math.atan(o / a2)); return num(`In a right-angled triangle the side opposite θ is ${o} cm and the side adjacent to θ is ${a2} cm. Find θ in degrees (1 d.p.).`, rd(th, 1), "tan θ = opposite ÷ adjacent", [`$\\tan\\theta = \\frac{${o}}{${a2}}$`, `$\\theta = \\tan^{-1}\\left(\\frac{${o}}{${a2}}\\right) \\approx ${rd(th, 1).toFixed(1)}^\\circ$`], { a: rd(th, 1).toFixed(1), keys: ["."], tol: 0.051, data: { o, a2, t } }); }
  const [fn, given, want, v, form] = [["\\sin", "hypotenuse", "opposite", side * sinD(ang), `\\text{opp} = ${side}\\sin ${ang}^\\circ`], ["\\cos", "hypotenuse", "adjacent to", side * cosD(ang), `\\text{adj} = ${side}\\cos ${ang}^\\circ`], ["\\tan", "adjacent side", "opposite", side * tanD(ang), `\\text{opp} = ${side}\\tan ${ang}^\\circ`]][t];
  return num(`A right-angled triangle has an angle of ${ang}° and the ${given} is ${side} cm. Find the side ${want} the ${ang}° angle (1 d.p.).`, rd(v, 1), `Use ${fn === "\\sin" ? "SOH" : fn === "\\cos" ? "CAH" : "TOA"}.`, [`$${form}$`, `$\\approx ${rd(v, 1).toFixed(1)}$ cm`], { a: rd(v, 1).toFixed(1), keys: ["."], tol: 0.051, data: { ang, side, t } });
}, { id: "g9.trig", was: 9 });
/* ---------- 🚢 Lighthouse Lookout (MOE Sec 3 trigonometry applications: three-figure bearings from North, the compass points
   as bearings, reading a bearing off a map, the bearing back (θ ± 180°), the angle between two bearings, sailing a distance on a
   bearing (how far east / north / south: d sin θ, d cos θ), the bearing after sailing two legs (tan⁻¹), angles of elevation
   (angle and height, with or without eye level) and depression (how far away), and why elevation = depression (alternate
   angles)). Every map and lookout picture is drawn to scale: map points carry class bpt + data-n, bearing arcs class bang
   + data-from / data-to (compass degrees, clockwise), lookout points class lpt + data-n, so tests read each figure back. */
const brgS = v => Number.isInteger(v) ? String(v).padStart(3, "0") : fdp(v, 1).padStart(5, "0"); // 65 → "065", 36.87 → "036.9"
const brg = v => brgS(v) + "°", mod360 = v => ((v % 360) + 360) % 360;
const bAt = (p, b, k) => [p[0] + k * sinD(b), p[1] + k * cosD(b)]; // the point k units from p on bearing b (maths coords, y = north)
const COMPASS = { 0: "north", 45: "north-east", 90: "east", 135: "south-east", 180: "south", 225: "south-west", 270: "west", 315: "north-west" };
const LINE_NAME = { 0: "North", 90: "East", 180: "South", 270: "West", 360: "North" };
/* a to-scale map: f = { pts: { A: [east, north] }, norths: [A] (a North arrow at A), refs: [[A, bearing]] (a dashed East /
   South / West line at A), segs / dash: [[A, B]], arcs: [{ v, from, to, t }] (from bearing `from` turning clockwise to `to`),
   rights: [[V, A, B]], lens: [[A, B, text, away]], hide: [names drawn without a dot or letter] } */
const svgMap = (title, f, h = 228) => { const nl = f.nl || 1, pts = f.pts, ends = (f.norths || []).map(n => bAt(pts[n], 0, nl)).concat((f.refs || []).map(([n, b]) => bAt(pts[n], b, nl * .8)));
  return figCard(title, Object.values(pts).concat(ends), S => {
    const P = Object.fromEntries(Object.entries(pts).map(([k, p]) => [k, S(p)])), L = nl * S.k, at = (p, b, k) => [p[0] + k * sinD(b), p[1] - k * cosD(b)];
    let back = "", lines = "", marks = "", text = "";
    (f.norths || []).forEach(n => { const p = P[n], t = at(p, 0, L); lines += `<line class="bnorth" data-n="${n}" x1="${f1(p[0])}" y1="${f1(p[1])}" x2="${f1(t[0])}" y2="${f1(t[1])}" stroke="${LINE}" stroke-width="2.2" stroke-linecap="round"/><path d="M${xy([t[0] - 5, t[1] + 8])} L${xy(t)} L${xy([t[0] + 5, t[1] + 8])}" fill="none" stroke="${LINE}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
      text += `<text x="${f1(t[0])}" y="${f1(t[1] - 5)}" font-size="12" text-anchor="middle" font-weight="900" fill="${LINE}">N</text>`; });
    (f.refs || []).forEach(([n, b]) => { const t = at(P[n], b, L * .8), o = at(t, b, 9); lines += figEdge(P[n], t, true); text += `<text x="${f1(o[0])}" y="${f1(o[1] + 4)}" font-size="11" text-anchor="middle" font-weight="900" fill="${LINE}">${LINE_NAME[b][0]}</text>`; });
    (f.dash || []).forEach(([a, b]) => { lines += figEdge(P[a], P[b], true); });
    (f.segs || []).forEach(([a, b]) => { lines += figEdge(P[a], P[b]); });
    (f.rights || []).forEach(([v, a, b]) => { back += `<path d="${rightPath(P[v], vdir(P[v], P[a]), vdir(P[v], P[b]), 9)}" fill="#E2D6FF" stroke="${LINE}" stroke-width="1.5"/>`; });
    (f.arcs || []).forEach(g => { const V = P[g.v], sw = mod360(g.to - g.from), rr = g.r || (sw < 40 ? 32 : sw < 70 ? 26 : sw < 200 ? 21 : 17), x = g.t === "x", e1 = at(V, g.from, rr), e2 = at(V, g.to, rr), m = at(V, g.from + sw / 2, rr + 14);
      back += `<path class="bang" data-t="${esc(g.t)}" data-v="${g.v}" data-from="${fmt(g.from)}" data-to="${fmt(g.to)}" d="M${xy(V)} L${xy(e1)} A${rr},${rr} 0 ${sw > 180 ? 1 : 0},1 ${xy(e2)} Z" fill="${x ? "#FFC9DA" : "#FFF0B8"}" stroke="${x ? "#ff6f91" : LINE}" stroke-width="1.5"/>`;
      text += angText(g.t, m[0], m[1] + 4.5, 15, 12, ` class="mang" data-t="${esc(g.t)}"`); });
    (f.lens || []).forEach(([a, b, t, away]) => { text += figLens(P[a], P[b], t, P[away]); });
    const shown = Object.keys(P).filter(k => !(f.hide || []).includes(k)), box = i => [Math.min(...shown.map(k => P[k][i])), Math.max(...shown.map(k => P[k][i]))], G = mid(...[0, 1].map(i => box(i)).map((_, j, b) => [b[0][j], b[1][j]]));
    shown.forEach(k => { const p = P[k], o = (f.lab && f.lab[k]) || (Math.hypot(p[0] - G[0], p[1] - G[1]) < 4 ? [-.7, .7] : vdir(G, p));
      marks += figDot("bpt", k, p, 3.6); text += figVtx(p, o, k); });
    return back + lines + marks + text; }, "map with bearings", h, "mpic chart mens bear"); };
/* a to-scale lookout picture: a striped tower of height h (foot F, top T) and, d away on the ground, a person whose eyes are e
   above the ground (E, standing on O) or a little boat at O. f = { h, d, e, side, boat, labs: { h, d, e }, elev, depr } where
   elev / depr label the angle of elevation at E (or O) and of depression at T; a dashed horizontal line goes with each */
const svgLook = (title, f) => { const s = f.side || 1, e = f.e || 0, F = [0, 0], Tp = [0, f.h], O = [s * f.d, 0], E = [s * f.d, e], H1 = [0, e], H2 = [s * f.d, f.h];
  return figCard(title, [F, Tp, O, [-s * f.d * .12, 0], [s * f.d * 1.08, 0]], S => {
    const [pF, pT, pO, pE, pH1, pH2] = [F, Tp, O, E, H1, H2].map(S), gx0 = S([-s * f.d * .12, 0])[0], gx1 = S([s * f.d * 1.08, 0])[0], w = 8;
    let back = `<rect x="${f1(Math.min(gx0, gx1))}" y="${f1(pF[1])}" width="${f1(Math.abs(gx1 - gx0))}" height="9" rx="3" fill="${f.boat ? PASTEL[1] : PASTEL[2]}"/>`, lines = "", marks = "", text = "";
    const ht = pF[1] - pT[1], band = k => `<rect x="${f1(pF[0] - w + 1)}" y="${f1(pT[1] + ht * k)}" width="${2 * w - 2}" height="${f1(ht * .12)}" fill="${PASTEL[0]}"/>`;
    back += `<polygon class="ltower" points="${xy([pF[0] - w, pF[1]])} ${xy([pF[0] + w, pF[1]])} ${xy([pT[0] + w * .7, pT[1]])} ${xy([pT[0] - w * .7, pT[1]])}" fill="#FFFDF8" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>${band(.25)}${band(.6)}<path d="M${xy([pT[0] - 7, pT[1]])} L${xy([pT[0], pT[1] - 9])} L${xy([pT[0] + 7, pT[1]])} Z" fill="${PASTEL[4]}" stroke="${INK}" stroke-width="1.6"/>`;
    if (f.boat) back += `<path d="M${xy([pO[0] - 12, pO[1] - 1])} L${xy([pO[0] + 12, pO[1] - 1])} L${xy([pO[0] + 8, pO[1] + 6])} L${xy([pO[0] - 8, pO[1] + 6])} Z" fill="${PASTEL[5]}" stroke="${INK}" stroke-width="1.6"/><path d="M${xy([pO[0], pO[1] - 3])} L${xy([pO[0], pO[1] - 20])} L${xy([pO[0] + s * -10, pO[1] - 6])} Z" fill="${PASTEL[3]}" stroke="${INK}" stroke-width="1.4"/>`;
    else back += `<line x1="${f1(pO[0])}" y1="${f1(pO[1])}" x2="${f1(pE[0])}" y2="${f1(pE[1] + (e ? 0 : -14))}" stroke="${PASTEL[3]}" stroke-width="5" stroke-linecap="round"/><circle cx="${f1(pE[0])}" cy="${f1(pE[1] - (e ? 0 : 18))}" r="5.5" fill="${PASTEL[4]}" stroke="${INK}" stroke-width="1.6"/>`;
    const eye = e ? pE : pO, foot = e ? pH1 : pF;
    back += `<path d="${rightPath(foot, vdir(foot, pT), vdir(foot, eye), 9)}" fill="#E2D6FF" stroke="${LINE}" stroke-width="1.5"/>`;
    lines += `<line class="lsight" x1="${f1(eye[0])}" y1="${f1(eye[1])}" x2="${f1(pT[0])}" y2="${f1(pT[1])}" stroke="#ff8fa3" stroke-width="2.4" stroke-linecap="round"/>`;
    if (e) lines += figEdge(pE, pH1, true);
    const mark = (V, A, B, t) => { const u1 = vdir(V, A), u2 = vdir(V, B), { t1, d, deg } = angSweep(u1, u2), rr = deg < 30 ? 34 : 26, m = t1 + d / 2, x = t === "x";
      back += `<path class="lang" data-t="${esc(t)}" d="${angWedge(V, u1, u2, rr, d)}" fill="${x ? "#FFC9DA" : "#FFF0B8"}" stroke="${x ? "#ff6f91" : LINE}" stroke-width="1.5"/>`;
      text += angText(t, V[0] + (rr + 14) * Math.cos(m), V[1] + (rr + 14) * Math.sin(m) + 4.5, 15, 12, ` class="mang" data-t="${esc(t)}"`); };
    if (f.elev) mark(eye, foot, pT, f.elev);
    if (f.depr) { lines += figEdge(pT, pH2, true); mark(pT, pH2, eye, f.depr); }
    const lab = f.labs || {};
    if (lab.h) text += figLab(mid(pF, pT), lab.h, -s * (w + 6), 0, s > 0 ? "end" : "start");
    if (lab.d) text += figLab(mid(pF, pO), lab.d, 0, 20);
    if (lab.e) text += figLab(mid(pO, pE), lab.e, s * 9, 0, s > 0 ? "start" : "end");
    [["T", pT, [-s, -.6]], ["F", pF, [-s, .9]], [e ? "E" : "O", eye, e ? [s * .6, -1.1] : [s, f.boat ? .9 : -.4]]].forEach(([n, p, o]) => { marks += figDot("lpt", n, p, 3.2); text += figVtx(p, o, n); });
    if (e) marks += `<circle class="lpt" data-n="O" cx="${f1(pO[0])}" cy="${f1(pO[1])}" r="0" fill="none"/>`;
    return back + lines + marks + text; }, "lookout picture", 226, "mpic chart mens look"); };
// kid-friendly places: map settings for the bearing questions and lookouts for elevation / depression
const MAP_CTX = [
  { id: "bay", title: "Lighthouse Bay", unit: "km", A: ["L", "the lighthouse"], B: ["S", "the sailboat"], P: ["P", "the pink kayak"], Q: ["Q", "the blue kayak"], go: "sails" },
  { id: "camp", title: "School camp trail", unit: "m", A: ["C", "the campsite"], B: ["F", "the flag checkpoint"], P: ["P", "the red checkpoint"], Q: ["Q", "the yellow checkpoint"], go: "walks" },
  { id: "isle", title: "Turtle Island map", unit: "km", A: ["H", "the harbour"], B: ["T", "Turtle Island"], P: ["P", "Pearl Rock"], Q: ["Q", "Coral Cove"], go: "sails" },
  { id: "forest", title: "Fairy Forest trail", unit: "m", A: ["G", "the forest gate"], B: ["W", "the wishing well"], P: ["P", "the mushroom hut"], Q: ["Q", "the owl tree"], go: "walks" }
];
const UP_CTX = [
  { id: "flag", title: "School flagpole", obj: "the school flagpole", short: "the flagpole", who: "Mei" },
  { id: "clock", title: "Clock tower", obj: "the clock tower in the park", short: "the clock tower", who: "Arjun" },
  { id: "light", title: "Lighthouse", obj: "the lighthouse", short: "the lighthouse", who: "Sam" },
  { id: "wall", title: "Climbing wall", obj: "the climbing wall at the sports centre", short: "the climbing wall", who: "Aisha" }
];
const DOWN_CTX = [
  { id: "light", title: "Lighthouse lookout", from: "the top of the lighthouse", foot: "the lighthouse", who: "the lighthouse keeper", what: "a sailboat", boat: true },
  { id: "cliff", title: "Cliff-top lookout", from: "a cliff-top lookout", foot: "the cliff", who: "Ben", what: "a sea turtle on the beach", boat: false },
  { id: "bird", title: "Bird-park tower", from: "the top of the bird-park tower", foot: "the tower", who: "Lina", what: "a flamingo in the pond", boat: false },
  { id: "kayak", title: "Harbour lookout", from: "the top of the harbour lookout tower", foot: "the tower", who: "Coach Tan", what: "a kayak", boat: true }
];
const cap = s => s[0].toUpperCase() + s.slice(1), dp1 = v => rd(v, 1), RAD_NOTE = "Your calculator is in radian mode! Switch it to degrees (DEG) for angles in degrees.";
const LOOK = {
  // which three-figure bearing is a compass direction? (multiple choice)
  compass: r => { const c = r.pick(MAP_CTX), b = r.pick([45, 90, 135, 180, 225, 270, 315]), k = b / 45, nm = v => COMPASS[mod360(v)];
    const wrong = [[mod360(360 - b), `${brg(mod360(360 - b))} is the turn from North to ${COMPASS[b]} going anticlockwise. Bearings always turn clockwise, so ${brg(mod360(360 - b))} points ${nm(360 - b)}.`], [mod360(b + 180), `${brg(mod360(b + 180))} points the opposite way, ${nm(b + 180)}. Turn clockwise from North until you face ${COMPASS[b]}.`],
      [mod360(b + 90), `${brg(mod360(b + 90))} points ${nm(b + 90)}: that turns a quarter turn too far.`], [mod360(b - 90), `${brg(mod360(b - 90))} points ${nm(b - 90)}: that stops a quarter turn too soon.`]].map(([v, t]) => [brg(v), t]);
    return { k: COMPASS[b], mc: true, data: { b }, q: `${cap(c.B[1])} is due ${COMPASS[b]} of ${c.A[1]}. What is the three-figure bearing of ${c.B[1]} from ${c.A[1]}?`, hint: "Face North, then turn clockwise. Each of the 8 compass points is another 45°.",
      steps: [`Start facing North (000°) and turn clockwise.`, `${cap(COMPASS[b])} is ${k} eighth${k > 1 ? "s" : ""} of a full turn: ${k} × 45° = ${b}°`, `Write it with three figures: ${brg(b)}`], right: brg(b), rightWhy: `Right: turning clockwise from North, ${COMPASS[b]} is ${k} × 45° = ${b}°, written ${brg(b)}.`, wrong }; },
  // read a bearing off a map where the angle is given from the N / E / S / W line
  read: r => { const c = r.pick(MAP_CTX), [A, B] = [c.A[0], c.B[0]], q0 = 90 * r.int(0, 3), a = r.pick([r.int(12, 40), r.int(50, 78)]), opts = [q0, q0 + 90].filter(v => v !== 0), ref = r.pick(opts), up = ref === q0;
    const th = mod360(up ? q0 + a : q0 + 90 - a), mirror = mod360(up ? q0 - a : q0 + 90 + a), R = ref, k = r.int(5, 9);
    const [from, to] = up ? [R, th] : [th, R === 360 ? 0 : R], fig = { pts: { [A]: [0, 0], [B]: bAt([0, 0], th, k) }, nl: k * .6, norths: [A], refs: R % 360 ? [[A, R]] : [], segs: [[A, B]], arcs: [{ v: A, from: mod360(from), to: mod360(to), t: `${a}°` }] };
    return { k: LINE_NAME[R], x: th, data: { th, a, ref: R % 360 }, pic: svgMap(c.title, fig), q: `The map shows ${c.A[1]} ${A} and ${c.B[1]} ${B}. The marked angle is ${a}°. Find the bearing of ${B} from ${A}.`, hint: "A bearing is measured from North, turning clockwise, all the way round to the line to the point.",
      steps: [`The ${LINE_NAME[R]} line from ${A} is ${R}° clockwise from North.`, `${B} is ${a}° ${up ? "further clockwise" : "back anticlockwise"} from it: ${R} ${up ? "+" : "−"} ${a} = ${th}°`, `Bearing of ${B} from ${A} = ${brg(th)}`],
      slips: [[a, `${a}° is only the marked angle from the ${LINE_NAME[R]} line. Measure from North, turning clockwise.`], [mirror, `That puts ${B} on the other side of the ${LINE_NAME[R]} line. Look at which side of it ${B} is.`], [mod360(360 - th), `That turns anticlockwise from North. Bearings always turn clockwise.`], [mod360(th + 180), `That is the bearing of ${A} from ${B}, the way back. Stand at ${A} and look towards ${B}.`]] }; },
  // the bearing back: bearing of A from B, given the bearing of B from A
  back: r => { const c = r.pick(MAP_CTX), [A, B] = [c.A[0], c.B[0]]; let th; do th = r.int(15, 345); while (th % 90 < 8 || th % 90 > 82); const x = mod360(th + 180), k = 7;
    const fig = { pts: { [A]: [0, 0], [B]: bAt([0, 0], th, k) }, nl: k * .45, norths: [A, B], segs: [[A, B]], arcs: [{ v: A, from: 0, to: th, t: `${th}°` }, { v: B, from: 0, to: x, t: "x" }] };
    const slips = [[th, `${brg(th)} is the bearing of ${B} from ${A}. Stand at ${B} and face back towards ${A}: that is half a turn round.`], [mod360(360 - th), "That turns anticlockwise. The way back is the same line turned half a turn (180°)."]].concat(th > 180 ? [[th + 180, `${th + 180}° is more than a full turn. Bearings stay below 360°, so take away 180° instead: ${th} − 180 = ${x}.`]] : [[180 - th, `That is 180 − ${th}. The way back adds 180° to the bearing: ${th} + 180 = ${x}.`]]);
    return { k: th > 180 ? "minus" : "plus", x, data: { th }, pic: svgMap(c.title, fig), q: `The bearing of ${c.B[1]} ${B} from ${c.A[1]} ${A} is ${brg(th)}. Find the bearing of ${A} from ${B}.`, hint: "The two North lines are parallel. The way back is half a turn (180°) round from the way there.",
      steps: [`The North lines at ${A} and ${B} are parallel, so the way back points exactly the opposite way: 180° round.`, th < 180 ? `${th} + 180 = ${x}` : `${th} − 180 = ${x} (adding 180 would go past 360°)`, `Bearing of ${A} from ${B} = ${brg(x)}`], slips }; },
  // the angle between two bearings from one point
  between: r => { const c = r.pick(MAP_CTX), A = c.A[0], p = r.int(10, 160), g = r.int(35, 140), q = p + g;
    const fig = { pts: { [A]: [0, 0], P: bAt([0, 0], p, 6 + r.int(0, 2)), Q: bAt([0, 0], q, 6 + r.int(0, 2)) }, nl: 3.8, norths: [A], segs: [[A, "P"], [A, "Q"]], arcs: [{ v: A, from: p, to: q, t: "x" }] };
    return { k: q > 180 ? "past" : "east", x: g, data: { p, q }, pic: svgMap(c.title, fig), q: `From ${c.A[1]} ${A}, ${c.P[1]} P is on a bearing of ${brg(p)} and ${c.Q[1]} Q is on a bearing of ${brg(q)}. Find angle ${"P" + A + "Q"}.`, hint: "Both bearings are measured from the same North line, so take the smaller one away from the bigger one.",
      steps: [`Both bearings turn clockwise from the same North line at ${A}.`, `Angle P${A}Q = ${q}° − ${p}° = ${g}°`],
      slips: [[p + q, "Don't add the bearings: both start at the same North line, so take one away from the other."], [360 - g, `That is the reflex angle, the long way round. Angle P${A}Q is the smaller angle between the two lines.`], [180 - g, "There is no straight line here to take 180° from. Just find the difference of the two bearings."], [q, `${q}° is just the bearing of Q. Take away the bearing of P.`]] }; },
  // sail d on a bearing: how far east / north / south of the start?
  travel: r => { const c = r.pick(MAP_CTX), [A, B] = [c.A[0], c.B[0]], se = r.chance(.5), a = r.pick([r.int(20, 38), r.int(52, 70)]), th = se ? 180 - a : a, d = r.int(4, 20), ask = r.pick(["east", "ns"]), ns = se ? "south" : "north";
    const east = d * sinD(th), nsv = d * cosD(a), x = dp1(ask === "east" ? east : nsv), E = bAt([0, 0], th, d), C = [E[0], 0], u = c.unit;
    const fig = { pts: { [A]: [0, 0], [B]: E, K: C }, hide: ["K"], nl: d * .32, norths: [A], segs: [[A, B]], dash: [[A, "K"], ["K", B]], rights: [["K", A, B]], arcs: [{ v: A, from: 0, to: th, t: `${th}°` }],
      lens: [[A, B, `${d} ${u}`, "K"], ask === "east" ? [A, "K", "x", B] : ["K", B, "x", A]] };
    const want = ask === "east" ? "east" : ns, steps = se ? [`The angle between the path and the South line is 180° − ${th}° = ${a}°.`] : [];
    steps.push(ask === "east" ? (se ? `East is opposite that ${a}° angle: east = ${d} sin ${a}° ≈ ${fdp(east, 1)} ${u}` : `East is opposite the ${th}° angle: east = ${d} sin ${th}° ≈ ${fdp(east, 1)} ${u}`) : `${cap(ns)} is next to the ${a}° angle: ${ns} = ${d} cos ${a}° ≈ ${fdp(nsv, 1)} ${u}`);
    return { k: (se ? "se-" : "ne-") + ask, x, tol: .051, data: { th, d, se, ask }, pic: svgMap(c.title, fig), q: `${cap(c.B[1])} ${B} is ${d} ${u} from ${c.A[1]} ${A} on a bearing of ${brg(th)}. How far ${want} of ${A} is ${B}? (1 d.p.)`, hint: `Make a right-angled triangle with the North–South line. The side opposite the angle at ${A} uses sin, the side next to it uses cos.`, steps,
      slips: [[dp1(ask === "east" ? nsv : east), ask === "east" ? `That is how far ${ns} ${B} is (cos). East is opposite the angle at ${A}, so use sin.` : `That is how far east ${B} is (sin). ${cap(ns)} is next to the angle at ${A}, so use cos.`], [d, `${d} ${u} is the whole slanted path. The ${want} part is a shorter side of the right-angled triangle.`], [dp1(d * tanD(a)), "tan doesn't use the slanted side. With the hypotenuse given, use sin or cos."], [dp1(ask === "east" ? d * Math.sin(th) : d * Math.cos(a)), RAD_NOTE]] }; },
  // sail two legs (north / south, then east): the bearing of the end from the start
  legs: r => { const c = r.pick(MAP_CTX), [A, B] = [c.A[0], c.B[0]], se = r.chance(.5), n = r.int(3, 15), e = r.int(3, 15), ns = se ? "south" : "north", u = c.unit, al = toDeg(Math.atan(e / n)), th = se ? 180 - al : al, x = dp1(th);
    const fig = { pts: { [A]: [0, 0], K: [0, se ? -n : n], [B]: [e, se ? -n : n] }, hide: ["K"], nl: n * (se ? .45 : 1.25), norths: [A], segs: [[A, "K"], ["K", B]], dash: [[A, B]], rights: [["K", A, B]], arcs: [{ v: A, from: 0, to: th, t: "x" }], lens: [[A, "K", `${n} ${u}`, B], ["K", B, `${e} ${u}`, A]] };
    const steps = [`At ${A}: $\\tan\\alpha = \\frac{${e}}{${n}}$ (east ÷ ${ns}), so $\\alpha \\approx ${fdp(al, 1)}^\\circ$ from the ${cap(ns)} line`].concat(se ? [`Bearing = 180° − ${fdp(al, 1)}° ≈ ${fdp(th, 1)}°`] : [`That angle is already measured clockwise from North, so the bearing is ${fdp(th, 1)}°`]);
    return { k: se ? "se" : "ne", x, tol: .051, data: { n, e, se }, pic: svgMap(c.title, fig), q: `To get from ${c.A[1]} ${A} to ${c.B[1]} ${B}, you go ${n} ${u} due ${ns} and then ${e} ${u} due east. Find the bearing of ${B} from ${A}. (1 d.p.)`, hint: `Find the angle at ${A} with tan (east ÷ ${ns}), then turn it into a bearing from North, clockwise.`, steps,
      slips: [[dp1(toDeg(Math.atan(n / e))), `That angle is measured from the East line (tan = ${ns} ÷ east). A bearing starts at North: use tan = east ÷ ${ns}.`], [dp1(se ? al : 180 - al), se ? `${fdp(al, 1)}° is the angle from the South line. Turning clockwise from North to that line is 180°, so take it from 180°.` : "That would point south-east. Here the point is north-east of the start."], [dp1(360 - th), "That turns anticlockwise from North. Bearings always turn clockwise."], [dp1(mod360(th + 180)), `That is the bearing of ${A} from ${B}, the way back.`]] }; },
  // angle of elevation from a distance and a height (maybe above eye level)
  elevang: r => { const c = r.pick(UP_CTX), d = r.int(8, 40), e = r.chance(.4) ? r.pick([1.2, 1.4, 1.5, 1.6]) : 0, hh = r.int(Math.ceil(d * .35), Math.floor(d * 1.6)), h = rd(hh + e, 1), up = hh, th = toDeg(Math.atan(up / d)), x = dp1(th), s = r.pick([1, -1]);
    const pic = svgLook(c.title, { h, d, e, side: s, labs: { h: `${fmt(h)} m`, d: `${d} m`, e: e ? `${fmt(e)} m` : "" }, elev: "x" });
    return { k: e ? "eye" : "ground", x, tol: .051, data: { h, d, e }, pic, q: `${c.who} stands ${d} m from the foot of ${c.obj}, which is ${fmt(h)} m tall.${e ? ` ${c.who}'s eyes are ${fmt(e)} m above the ground.` : ""} Find the angle of elevation of the top of ${c.short} from ${c.who}${e ? "'s eyes" : " on the ground"}. (1 d.p.)`,
      hint: `The angle of elevation is between the flat line and the line of sight, looking up. tan = opposite ÷ adjacent.`,
      steps: (e ? [`Height above ${c.who}'s eyes: ${fmt(h)} − ${fmt(e)} = ${up} m`] : []).concat([`$\\tan\\theta = \\frac{${up}}{${d}}$`, `$\\theta = \\tan^{-1}\\left(\\frac{${up}}{${d}}\\right) \\approx ${fdp(th, 1)}^\\circ$`]),
      slips: [[dp1(toDeg(Math.atan(h / d))), `That uses the full ${fmt(h)} m. Measure from ${c.who}'s eyes: take away the ${fmt(e)} m first.`], [dp1(toDeg(Math.atan(d / up))), "That is the angle at the top, between the line of sight and the tower. The angle of elevation is at the bottom, from the flat line."], [up < d ? dp1(toDeg(Math.asin(up / d))) : NaN, `sin needs the line of sight (the hypotenuse), not the ground distance. Opposite and adjacent → tan.`], [dp1(up / d), `${fmt(rd(up / d, 4))} is tan θ itself. Use tan⁻¹ (shift, tan) to turn it into the angle.`], [dp1(Math.atan(up / d)), RAD_NOTE]] }; },
  // height from an angle of elevation and a distance (plus eye level)
  elevh: r => { const c = r.pick(UP_CTX), d = r.int(8, 45), a = r.int(20, 62), e = r.chance(.4) ? r.pick([1.2, 1.4, 1.5, 1.6]) : 0, up = d * tanD(a), hv = up + e, x = dp1(hv), s = r.pick([1, -1]);
    const pic = svgLook(c.title, { h: hv, d, e, side: s, labs: { h: "x", d: `${d} m`, e: e ? `${fmt(e)} m` : "" }, elev: `${a}°` });
    return { k: e ? "eye" : "ground", x, tol: .051, data: { a, d, e }, pic, q: `${c.who} stands ${d} m from the foot of ${c.obj}. The angle of elevation of the top from ${c.who}${e ? `'s eyes, ${fmt(e)} m above the ground,` : " (on the ground)"} is ${a}°. Find the height of ${c.short}. (1 d.p.)`,
      hint: "tan = opposite ÷ adjacent, so opposite = adjacent × tan of the angle.", steps: [`opposite = ${d} × tan ${a}° ≈ ${fdp(up, 2)} m`].concat(e ? [`Add the eye height: ${fdp(up, 2)} + ${fmt(e)} ≈ ${fdp(hv, 1)} m`] : [`Height ≈ ${fdp(hv, 1)} m`]),
      slips: [[e ? dp1(up) : NaN, `That is the height above ${c.who}'s eyes. Add the ${fmt(e)} m up to the eyes.`], [dp1(d * sinD(a) + e), `sin needs the line of sight. You know the ground distance (adjacent), so use tan.`], [dp1(d * cosD(a) + e), "cos gives the side next to the angle. The height is opposite it: use tan."], [dp1(d / tanD(a) + e), `That divides by tan ${a}°. opposite = adjacent × tan, so multiply.`], [dp1(d * Math.tan(a) + e), RAD_NOTE]] }; },
  // distance from an angle of depression and a height
  depr: r => { const c = r.pick(DOWN_CTX), h = r.int(15, 70), a = r.int(18, 60), dv = h / tanD(a), x = dp1(dv), s = r.pick([1, -1]);
    const pic = svgLook(c.title, { h, d: dv, side: s, boat: c.boat, labs: { h: `${h} m`, d: "x" }, depr: `${a}°` });
    return { k: c.boat ? "boat" : "beach", x, tol: .051, data: { h, a }, pic, q: `From ${c.from}, ${h} m above the ground, ${c.who} sees ${c.what}. The angle of depression is ${a}°. How far is ${c.what.replace(/^an? /, "the ")} from the foot of ${c.foot}? (1 d.p.)`,
      hint: "The angle of depression is measured down from the flat line at the top. It equals the angle of elevation at the bottom (alternate angles).",
      steps: [`The angle of elevation from the bottom is also ${a}° (alternate angles).`, `$\\tan ${a}^\\circ = \\frac{${h}}{d}$, so $d = \\frac{${h}}{\\tan ${a}^\\circ} \\approx ${fdp(dv, 1)}$ m`],
      slips: [[dp1(h * tanD(a)), `That multiplies by tan ${a}°. Here the height is opposite the angle at the bottom, so divide: d = ${h} ÷ tan ${a}°.`], [dp1(h / sinD(a)), "That is the line of sight (the slanted side). The question asks for the flat distance along the ground."], [dp1(h / Math.tan(a)), RAD_NOTE]] }; },
  // the angle of elevation equals the angle of depression (multiple choice)
  equal: r => { const c = r.pick(DOWN_CTX); let a; do a = r.int(18, 70); while (a === 45 || a === 60); const h = r.int(20, 60), s = r.pick([1, -1]);
    const pic = svgLook(c.title, { h, d: h / tanD(a), side: s, boat: c.boat, labs: { h: `${h} m` }, depr: `${a}°`, elev: "x" });
    const wrong = [[`${90 - a}°`, `${90 - a}° is the angle at the top between the line of sight and the tower. The angle of elevation is measured from the flat ground.`], [`${180 - a}°`, `The two flat lines are parallel, and these are alternate angles (a Z shape), so they are equal, not adding up to 180°.`], [`${2 * a}°`, "The angle doesn't double. Alternate angles between parallel lines are equal."], [`${90 + a}°`, "An angle of elevation is always less than 90°: it is measured up from the flat ground."]];
    return { k: "alt", mc: true, data: { a, h }, pic, q: `From ${c.from}, ${c.who} sees ${c.what} at an angle of depression of ${a}°. What is the angle of elevation of the top from ${c.what.replace(/^an? /, "the ")}?`, hint: "The flat line at the top and the ground are parallel. Look for a Z shape.",
      steps: ["The flat line at the top is parallel to the ground.", `The line of sight crosses both, making alternate angles (a Z shape), which are equal.`, `Angle of elevation = angle of depression = ${a}°`], right: `${a}°`, rightWhy: `Right: the flat lines are parallel, so the angle of elevation and the angle of depression are alternate angles, both ${a}°.`, wrong }; }
};
const LOOK_KINDS = ["compass", "read", "read", "back", "back", "between", "travel", "travel", "legs", "legs", "elevang", "elevang", "elevh", "elevh", "depr", "depr", "equal"];
const lookQ = (r, kind) => { const z = LOOK[kind](r), data = Object.assign({ look: kind, k: z.k, x: z.mc ? null : z.x }, z.data), extra = { pic: z.pic || "", uid: `look|${kind}|${z.k}|${JSON.stringify(z.data)}`, data };
  if (z.mc) return mcqWhy(r, z.q, z.right, z.rightWhy, z.wrong, z.hint, z.steps, extra);
  const bearing = /^(read|back|legs)$/.test(kind);
  if (z.tol) Object.assign(extra, { tol: z.tol, a: bearing ? fdp(z.x, 1).padStart(5, "0") : fdp(z.x, 1), keys: ["."] }); else if (bearing) extra.a = brgS(z.x);
  return numWhy(z.q, z.x, z.hint, z.steps, z.slips.filter(([v]) => v > 0 && isFinite(v)), extra); };
topic(9, "bearings", "Lighthouse Lookout", "🚢", "Bearings, angles of elevation and depression", r => lookQ(r, r.pick(LOOK_KINDS)));
topic(9, "coord", "Treasure-Map Coordinates", "🗺️", "Distance and midpoint", r => {
  const x1 = r.int(-8, 8), y1 = r.int(-8, 8);
  if (r.chance(.5)) { const tr = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 6, 10], [4, 3, 5], [12, 5, 13]]), x2 = x1 + r.pick([1, -1]) * tr[0], y2 = y1 + r.pick([1, -1]) * tr[1];
    return num(`Find the distance between ${T(`(${x1}, ${y1})`)} and ${T(`(${x2}, ${y2})`)}.`, tr[2], "d = √((x₂ − x₁)² + (y₂ − y₁)²)", [`$d = ${sqrtTex(`${paren(x2 - x1)}^2 + ${paren(y2 - y1)}^2`)} = ${sqrtTex(tr[2] * tr[2])} = ${tr[2]}$`], { data: { x1, y1, x2, y2 } }); }
  const x2 = x1 + 2 * r.int(-5, 5), y2 = y1 + 2 * r.int(-5, 5), mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return Q({ q: `Find the midpoint of ${T(`(${x1}, ${y1})`)} and ${T(`(${x2}, ${y2})`)}. (type x, y)`, kind: "pair", val: [mx, my], a: `${mx}, ${my}`, keys: ["-", ","], hint: "Average the x's, average the y's.", steps: [`$x = \\frac{${x1} + ${paren(x2)}}{2} = ${mx}$`, `$y = \\frac{${y1} + ${paren(y2)}}{2} = ${my}$`], data: { x1, y1, x2, y2 } });
});
/* ---------- 🎠 Circle Secrets (MOE Sec 3 angle properties of circles): angle in a semicircle, tangent ⊥ radius (angles and
   Pythagoras), equal tangents from an outside point, angle at the centre = 2 × angle at the circumference, angles in the same
   segment, opposite angles of a cyclic quadrilateral, and the perpendicular from the centre bisecting a chord; plus "which
   property?" choices. Every figure is drawn to scale on the circle (centre O); given angles carry numbers and the unknown is x. */
const dg = d => `${fmt(d)}°`;
const onC = (R, deg) => [R * cosD(deg), R * sinD(deg)];
/* a circle figure: f = { R, rot, pts: { A: [x, y] } (maths coords, centre O at 0,0), showO, segs / dash: [[A, B]], tan: [[T, P]]
   (a tangent line through T and P, drawn a little past both), angles: [{ v, a, b, t }], rights: [[V, A, B]], ticks: [[A, B]],
   lens: [[A, B, text, the point to keep the label away from]], labAt: { M: [points the letter leans towards] } }. Points carry class cpt + data-n and angle wedges class cang + data-v/a/b, so tests read the figure back. */
const svgCircle = (title, f) => {
  const R = f.R, pts = Object.fromEntries(Object.entries(Object.assign({ O: [0, 0] }, f.pts)).map(([k, p]) => [k, rotPt(p, f.rot || 0)]));
  return figCard(title, [[R, 0], [-R, 0], [0, R], [0, -R]].concat(Object.values(pts)), S => {
    const P = Object.fromEntries(Object.entries(pts).map(([k, p]) => [k, S(p)])), O = P.O, names = Object.keys(P).filter(k => k !== "O" || f.showO);
    let back = `<circle class="mcirc" cx="${f1(O[0])}" cy="${f1(O[1])}" r="${f1(R * S.k)}" fill="${f.fill || PASTEL[1]}" fill-opacity=".55" stroke="${INK}" stroke-width="2.6"/>`, lines = "", marks = "", text = "";
    (f.tan || []).forEach(([t, p]) => { const u = vdir(P[t], P[p]); lines += figEdge(vat(P[t], u, -30), vat(P[p], u, 16)); });
    (f.segs || []).forEach(([a, b]) => { lines += figEdge(P[a], P[b]); });
    (f.dash || []).forEach(([a, b]) => { lines += figEdge(P[a], P[b], true); });
    (f.rights || []).forEach(([v, a, b]) => { back += `<path class="cright" data-v="${v}" d="${rightPath(P[v], vdir(P[v], P[a]), vdir(P[v], P[b]), 10)}" fill="#E2D6FF" stroke="${LINE}" stroke-width="1.6"/>`; });
    (f.angles || []).forEach(g => { const V = P[g.v], u1 = vdir(V, P[g.a]), u2 = vdir(V, P[g.b]), { t1, d, deg } = angSweep(u1, u2), x = g.t === "x", rr = deg < 40 ? 30 : deg < 70 ? 24 : 19, m = t1 + d / 2, L = rr + 13;
      back += `<path class="cang" data-t="${esc(g.t)}" data-v="${g.v}" data-a="${g.a}" data-b="${g.b}" d="${angWedge(V, u1, u2, rr, d)}" fill="${x ? "#FFC9DA" : "#FFF0B8"}" stroke="${x ? "#ff6f91" : LINE}" stroke-width="1.5"/>`;
      text += angText(g.t, V[0] + L * Math.cos(m), V[1] + L * Math.sin(m) + 4.5, 15, 12, ` class="mang" data-t="${esc(g.t)}"`); });
    (f.ticks || []).forEach(([a, b]) => { const c = mid(P[a], P[b]), u = vdir(P[a], P[b]); marks += `<line class="ctick" x1="${f1(c[0] - u[1] * 6)}" y1="${f1(c[1] + u[0] * 6)}" x2="${f1(c[0] + u[1] * 6)}" y2="${f1(c[1] - u[0] * 6)}" stroke="#ff6f91" stroke-width="2.4" stroke-linecap="round"/>`; });
    (f.lens || []).forEach(([a, b, t, away]) => { text += figLens(P[a], P[b], t, P[away]); });
    names.forEach(k => { const p = P[k]; let o;
      if (k === "O") { const s = names.filter(n => n !== "O").reduce((g, n) => { const u = vdir(O, P[n]); return [g[0] + u[0], g[1] + u[1]]; }, [0, 0]); o = Math.hypot(s[0], s[1]) > .3 ? vdir(s, [0, 0]) : [-.6, .8]; }
      else if (f.labAt && f.labAt[k]) { const s = f.labAt[k].reduce((g, n) => { const u = vdir(p, P[n]); return [g[0] + u[0], g[1] + u[1]]; }, [0, 0]); o = vdir([0, 0], s); }
      else o = vdir(O, p);
      marks += figDot("cpt", k, p, 3.4); text += figVtx(p, o, k, 13); });
    return back + lines + marks + text; }, "circle figure", 236, "mpic chart mens circ");
};
// the seven properties: their names (the "which property?" options), what each one needs to see in a figure
const CPROP = {
  semi: ["Angle in a semicircle = 90°", "a triangle drawn on a diameter (a chord through the centre O), with its third corner on the circle"],
  tangent: ["Tangent ⊥ radius", "a tangent line and the radius drawn to the point where it touches the circle"],
  twotan: ["Tangents from an outside point are equal", "two tangents drawn to the circle from the same outside point"],
  centre: ["Angle at centre = 2 × angle at circumference", "one angle at the centre O and one on the circle, standing on the same arc"],
  segment: ["Angles in the same segment are equal", "two angles on the circle standing on the same chord, on the same side of it"],
  cyclic: ["Opposite angles of a cyclic quadrilateral add up to 180°", "a four-sided shape with all four corners on the circle"],
  chord: ["Perpendicular from centre bisects a chord", "a line from the centre O that meets a chord at right angles"]
};
// fairytale settings for each kind of figure: [card title, the sentence that sets the scene]
const CTX = {
  semi: [["Moon-garden pond", "In the moon garden, a frog hops across the round lily pond along the straight path AB through its centre O, then to the lily pad C on the edge."], ["Mushroom fairy ring", "A fairy flies across the mushroom fairy ring along the straight line AB through its centre O, then to the mushroom C on the edge."], ["Royal birthday cake", "The round royal birthday cake is cut straight across along AB, through its centre O. A cherry sits at C on the edge."]],
  tangent: [["Carousel platform", "A ribbon is pulled tight from the flag pole P so that it just touches the round carousel platform (centre O) at T."], ["Wizard's ring", "A beam of starlight from the lantern P just touches the wizard's glowing ring (centre O) at T."], ["Moon-garden pond", "A straight garden path from the gate P just touches the round moon-garden pond (centre O) at T."]],
  twotan: [["Carousel platform", "Two ribbons are pulled tight from the flag pole P and just touch the round carousel platform (centre O) at A and B."], ["Wizard's ring", "Two beams of starlight from the lantern P just touch the wizard's glowing ring (centre O) at A and B."], ["Dragon's pond", "Two straight paths from the dragon's cave P just touch the round pond (centre O) at A and B."]],
  centre: [["Clock-tower face", "A, B and C are golden studs on the rim of the clock-tower face, centre O."], ["Star-map dome", "A, B and C are stars on the edge of the round star map, centre O."], ["Ferris wheel", "A, B and C are cabins on the Ferris wheel, centre O."]],
  segment: [["Lantern ring", "Four glowing lanterns A, B, C and D hang on the round lantern ring."], ["Clock-tower face", "A, B, C and D are golden studs on the rim of the clock-tower face."], ["Star-map dome", "A, B, C and D are stars on the edge of the round star map."]],
  cyclic: [["Moon-garden flower bed", "A four-sided flower bed ABCD is planted in the round moon garden with all four corners on the edge."], ["Carousel ponies", "Four ponies A, B, C and D stand on the edge of the round carousel, and ribbons join them to make ABCD."], ["Fairy-ring picnic", "Four mushrooms A, B, C and D on the fairy ring are joined by daisy chains to make ABCD."]],
  chord: [["Clock-tower face", "A golden bar AB is fixed straight across the round clock-tower face (centre O)."], ["Wizard's ring", "A silver wand AB rests straight across the wizard's magic ring (centre O)."], ["Moon-garden pond", "A wooden bridge AB crosses the round lily pond (centre O)."]]
};
const TRIPLES = [[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [6, 8, 10], [8, 6, 10], [8, 15, 17], [15, 8, 17], [9, 12, 15], [12, 9, 15], [20, 21, 29], [21, 20, 29]];
// two points A, B on the circle with the short arc AB = 2a at the top, and a point on the long arc (bottom) at offset c from straight down
const arcAB = a => ({ A: onC(1, 90 - a), B: onC(1, 90 + a) }), lowPt = c => onC(1, 270 + c);
const CIRC = {
  // angle in a semicircle: AB is a diameter, C on the circle; one angle at A or B given
  semi: r => { let a; do a = r.int(18, 72); while (a === 45); const place = r.pick(CTX.semi), giveA = r.chance(.5), g = giveA ? a : 90 - a, x = 90 - g;
    const fig = { R: 1, rot: r.int(0, 359), showO: true, pts: { A: onC(1, 180), B: onC(1, 0), C: onC(1, 2 * a) }, segs: [["A", "B"], ["A", "C"], ["B", "C"]],
      angles: giveA ? [{ v: "A", a: "C", b: "B", t: dg(g) }, { v: "B", a: "A", b: "C", t: "x" }] : [{ v: "B", a: "A", b: "C", t: dg(g) }, { v: "A", a: "C", b: "B", t: "x" }] };
    return { fig, place, x, giv: [g], prop: "semi", see: "AB goes through the centre O, so it is a diameter and the angle at C is in a semicircle.",
      q: `${place[1]} Find ∠x.`, hint: "AB passes through the centre. What do you know about the angle at C?",
      steps: ["AB passes through the centre O, so AB is a diameter.", "Angle in a semicircle: ∠ACB = 90°.", `Angles in triangle ABC add up to 180°: x = 180° − 90° − ${dg(g)} = ${dg(x)}`],
      slips: [[180 - g, "That forgets the 90° at C. The angle in a semicircle is a right angle, so take away 90° as well."], [g, "x isn't a copy of the given angle. The two angles at A and B share the 90° left after the right angle at C."], [90, "90° is the angle at C (the angle in the semicircle), not the angle at the other end of the diameter."]] }; },
  // tangent ⊥ radius: PT touches the circle at T; one angle of triangle OTP given
  tangent: r => { const a = r.int(25, 65), s = r.pick([1, -1]), place = r.pick(CTX.tangent), giveO = r.chance(.5), g = giveO ? a : 90 - a, x = 90 - g;
    const fig = { R: 1, rot: r.int(0, 359), showO: true, pts: { T: [0, 1], P: [s * tanD(a), 1] }, segs: [["O", "T"], ["O", "P"]], tan: [["T", "P"]],
      angles: giveO ? [{ v: "O", a: "T", b: "P", t: dg(g) }, { v: "P", a: "T", b: "O", t: "x" }] : [{ v: "P", a: "T", b: "O", t: dg(g) }, { v: "O", a: "T", b: "P", t: "x" }] };
    return { fig, place, x, giv: [g], prop: "tangent", see: "PT just touches the circle at T and OT is a radius, so they meet at 90°.",
      q: `${place[1]} PT is a tangent. Find ∠x.`, hint: "A tangent and the radius to the touching point meet at right angles.",
      steps: ["PT is a tangent and OT is a radius, so ∠OTP = 90° (tangent ⊥ radius).", `Angles in triangle OTP add up to 180°: x = 180° − 90° − ${dg(g)} = ${dg(x)}`],
      slips: [[180 - g, "That forgets the right angle at T. A tangent meets the radius at 90°, so take that away too."], [g, "x isn't equal to the given angle. Together they make 90°, because the angle at T is 90°."], [90, "90° is the angle at T, where the tangent meets the radius, not the angle marked x."]] }; },
  // tangent ⊥ radius with Pythagoras: OT, TP, OP from a whole-number triple
  tanlen: r => { const [rad, t, h] = r.pick(TRIPLES), s = r.pick([1, -1]), k = r.pick(["TP", "TP", "OP", "OT"]), place = r.pick(CTX.tangent), x = { TP: t, OP: h, OT: rad }[k];
    const lab = n => n === k ? "x" : `${{ TP: t, OP: h, OT: rad }[n]} cm`;
    const fig = { R: rad, rot: r.int(0, 359), showO: true, pts: { T: [0, rad], P: [s * t, rad] }, segs: [["O", "T"], ["O", "P"]], tan: [["T", "P"]], rights: [["T", "O", "P"]], lens: [["O", "T", lab("OT"), "P"], ["T", "P", lab("TP"), "O"], ["O", "P", lab("OP"), "T"]] };
    const steps = ["PT is a tangent and OT is a radius, so ∠OTP = 90° (tangent ⊥ radius).", "Use Pythagoras in right-angled triangle OTP: OP² = OT² + TP²."].concat(
      k === "OP" ? [`$x^2 = ${rad}^2 + ${t}^2 = ${rad * rad + t * t}$`, `$x = \\sqrt{${h * h}} = ${h}$ cm`] : [`$x^2 = ${h}^2 - ${k === "TP" ? rad : t}^2 = ${h * h - (k === "TP" ? rad * rad : t * t)}$`, `$x = \\sqrt{${x * x}} = ${x}$ cm`]);
    const other = k === "TP" ? rad : t, slips = k === "OP" ? [[rad + t, "Lengths don't simply add. OP is the longest side of a right-angled triangle: use OP² = OT² + TP²."], [rad * rad + t * t, `${rad * rad + t * t} is OP². Take the square root to get OP.`], [Math.abs(t - rad), "Subtracting is for the shorter sides. OP is the longest side, so add the squares."]]
      : [[h - other, "Lengths don't simply subtract. Use Pythagoras: square them, subtract, then take the square root."], [h * h - other * other, `${h * h - other * other} is x². Take the square root to get x.`], [h + other, "OP is the longest side (opposite the right angle at T), so x is shorter than OP, not longer."]];
    return { fig, place, x, giv: [], len: true, prop: "tangent", k, data: { rad, t, h },
      q: `${place[1]} PT is a tangent. Find x, in cm.`, hint: "A tangent meets the radius at 90°, so triangle OTP is right-angled. Use Pythagoras.", steps, slips }; },
  // two tangents from P: find ∠AOB (tangent ⊥ radius, angles in OAPB) or ∠PAB (PA = PB, isosceles)
  twotan: r => { let p; do p = 2 * r.int(20, 55); while (p === 60 || p === 90); const b = 90 - p / 2, D = 1 / cosD(b), k = r.pick(["AOB", "PAB"]), place = r.pick(CTX.twotan);
    const fig = { R: 1, rot: r.int(0, 359), showO: k === "AOB", pts: { A: onC(1, b), B: onC(1, -b), P: [D, 0] }, segs: [["P", "A"], ["P", "B"]].concat(k === "AOB" ? [["O", "A"], ["O", "B"]] : [["A", "B"]]), ticks: [["P", "A"], ["P", "B"]],
      angles: [{ v: "P", a: "A", b: "B", t: dg(p) }, k === "AOB" ? { v: "O", a: "A", b: "B", t: "x" } : { v: "A", a: "P", b: "B", t: "x" }] };
    const base = { fig, place, giv: [p], k, q: `${place[1]} PA and PB are tangents. Find ∠x.` };
    if (k === "AOB") return Object.assign(base, { x: 180 - p, prop: "tangent", see: "OA and OB are radii meeting the tangents PA and PB, so the angles at A and B are both 90°.", hint: "Each tangent meets its radius at 90°. The four angles of OAPB add up to 360°.",
      steps: ["∠OAP = ∠OBP = 90° (tangent ⊥ radius).", "The angles of the four-sided shape OAPB add up to 360°.", `x = 360° − 90° − 90° − ${dg(p)} = ${dg(180 - p)}`],
      slips: [[p, "x isn't equal to the angle at P. In OAPB the two right angles take 180°, and x and ∠APB share the other 180°."], [360 - p, "That forgets the two right angles at A and B, where the tangents meet the radii."], [270 - p, "Only one right angle was taken away. There are two: at A and at B."]] });
    return Object.assign(base, { x: b, prop: "twotan", see: "PA and PB are tangents from the same outside point P, so PA = PB (see the ticks).", hint: "Tangents from the same point are equal, so triangle PAB is isosceles.",
      steps: ["Tangents from an outside point are equal: PA = PB.", "So triangle PAB is isosceles and ∠PAB = ∠PBA.", `x = (180° − ${dg(p)}) ÷ 2 = ${dg(b)}`],
      slips: [[180 - p, `${dg(180 - p)} is what the two equal angles at A and B make together. Halve it for one of them.`], [p, "x isn't equal to the angle at P. Only the angles at A and B are equal, because PA = PB."], [90, "90° is the angle between a tangent and the radius (∠OAP), not ∠PAB."]] }); },
  // angle at the centre = 2 × angle at the circumference (either way round)
  centre: r => { const a = r.int(25, 80), c = r.int(-(150 - a), 150 - a), fwd = r.chance(.55), place = r.pick(CTX.centre), x = fwd ? 2 * a : a, g = fwd ? a : 2 * a;
    const fig = Object.assign({ R: 1, rot: r.int(0, 359), showO: true, pts: Object.assign(arcAB(a), { C: lowPt(c) }), segs: [["C", "A"], ["C", "B"], ["O", "A"], ["O", "B"]] },
      { angles: [{ v: "C", a: "A", b: "B", t: fwd ? dg(a) : "x" }, { v: "O", a: "A", b: "B", t: fwd ? "x" : dg(2 * a) }] });
    return { fig, place, x, giv: [g], k: fwd ? "atO" : "atC", prop: "centre", see: "∠AOB at the centre and ∠ACB on the circle both stand on the arc AB.",
      q: `${place[1]} Find ∠x.`, hint: "Both angles stand on arc AB. The angle at the centre is twice the angle at the circumference.",
      steps: ["∠AOB (at the centre) and ∠ACB (on the circle) stand on the same arc AB.", "Angle at centre = 2 × angle at circumference.", fwd ? `x = 2 × ${dg(a)} = ${dg(2 * a)}` : `x = ${dg(2 * a)} ÷ 2 = ${dg(a)}`],
      slips: fwd ? [[a, "x is at the centre, so it is twice the angle on the circle, not the same."], [a / 2, "That halves. The angle at the centre is the bigger one: double the angle at C."], [180 - a, "Angles here don't add to 180°. The angle at the centre is 2 × the angle at the circumference."], [360 - 2 * a, "That is the reflex angle round the other side of O. The angle marked x faces arc AB: 2 × the angle at C."]]
        : [[2 * a, "x is on the circle, so it is half the angle at the centre, not the same."], [4 * a, "That doubles. The angle on the circle is the smaller one: halve the angle at O."], [180 - 2 * a, "Angles here don't add to 180°. The angle on the circle is half the angle at the centre."]] }; },
  // angles in the same segment: C and D on the same side of chord AB
  segment: r => { const a = r.int(22, 75), lim = 155 - a; let c, d; do { c = r.int(-lim, lim); d = r.int(-lim, lim); } while (Math.abs(c - d) < 45); const place = r.pick(CTX.segment);
    const fig = { R: 1, rot: r.int(0, 359), pts: Object.assign(arcAB(a), { C: lowPt(c), D: lowPt(d) }), segs: [["C", "A"], ["C", "B"], ["D", "A"], ["D", "B"]], dash: [["A", "B"]],
      angles: [{ v: "C", a: "A", b: "B", t: dg(a) }, { v: "D", a: "A", b: "B", t: "x" }] };
    return { fig, place, x: a, giv: [a], prop: "segment", see: "∠ACB and ∠ADB both stand on the chord AB, on the same side of it.",
      q: `${place[1]} Find ∠x.`, hint: "Both angles stand on chord AB and are on the same side of it.",
      steps: ["∠ACB and ∠ADB stand on the same chord AB, on the same side of it (the same segment).", "Angles in the same segment are equal.", `x = ${dg(a)}`],
      slips: [[2 * a, "Doubling is only for an angle at the centre O. Both angles here are on the circle, so they are equal."], [180 - a, "Adding to 180° is for opposite corners of a cyclic quadrilateral. C and D are on the same side of AB, so the angles are equal."], [90 - a, "There is no right angle here: AB isn't a diameter. Angles in the same segment are equal."]] }; },
  // opposite angles of a cyclic quadrilateral (typed, or pick the answer)
  cyclic: r => { let s, g0; for (;;) { s = [0, 0, 0].map(() => 2 * r.int(25, 65)); s.push(360 - s[0] - s[1] - s[2]); if (s[3] < 50 || s[3] > 130) continue; const pair = r.int(0, 1); g0 = pair ? (s[2] + s[3]) / 2 : (s[1] + s[2]) / 2; if (g0 !== 90) { s.pair = pair; break; } }
    const th = r.int(0, 359), pos = [0, s[0], s[0] + s[1], s[0] + s[1] + s[2]].map(v => onC(1, th + v)), [V, X] = s.pair ? ["B", "D"] : ["A", "C"], flip = r.chance(.5), gv = flip ? X : V, xv = flip ? V : X, g = flip ? 180 - g0 : g0, x = 180 - g;
    const nb = { A: ["D", "B"], B: ["A", "C"], C: ["B", "D"], D: ["C", "A"] }, place = r.pick(CTX.cyclic), mc = r.chance(.5);
    const fig = { R: 1, rot: 0, pts: { A: pos[0], B: pos[1], C: pos[2], D: pos[3] }, segs: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"]], fill: PASTEL[2],
      angles: [{ v: gv, a: nb[gv][0], b: nb[gv][1], t: dg(g) }, { v: xv, a: nb[xv][0], b: nb[xv][1], t: "x" }] };
    return { fig, place, x, giv: [g], mc, prop: "cyclic", see: "ABCD has all four corners on the circle, and the angle x is opposite the given angle.",
      q: `${place[1]} Find ∠x.`, hint: "ABCD is a cyclic quadrilateral. Opposite angles add up to 180°.",
      steps: ["ABCD is a cyclic quadrilateral: all four corners are on the circle.", `∠${xv} is opposite ∠${gv}. Opposite angles of a cyclic quadrilateral add up to 180°.`, `x = 180° − ${dg(g)} = ${dg(x)}`],
      slips: [[g, "Opposite angles of a cyclic quadrilateral aren't equal (that is a parallelogram rule). They add up to 180°."], [360 - g, "360° is the sum of all four angles. Just the two opposite angles add up to 180°."], [2 * g, "Doubling is for an angle at the centre O. Here the angles are opposite corners of a cyclic quadrilateral: they add up to 180°."], [x / 2, "No need to halve: x and the given angle are opposite, so x = 180° − the given angle."], [g / 2, "Halving is for an angle on the circle compared with one at the centre. Here x and the given angle are opposite corners: they add up to 180°."]] }; },
  // the perpendicular from the centre bisects a chord, with Pythagoras in triangle OMA
  chord: r => { const [d, h, rad] = r.pick(TRIPLES), k = r.pick(["AB", "AB", "OM", "OA"]), place = r.pick(CTX.chord), x = { AB: 2 * h, OM: d, OA: rad }[k];
    const lab = n => n === k ? "x" : `${{ AB: 2 * h, OM: d, OA: rad }[n]} cm`;
    const fig = { R: rad, rot: r.int(0, 359), showO: true, pts: { A: [-h, -d], B: [h, -d], M: [0, -d] }, segs: [["A", "B"], ["O", "M"], ["O", "A"]], rights: [["M", "O", "B"]],
      lens: [["O", "A", lab("OA"), "M"], ["O", "M", lab("OM"), "A"], ["A", "B", lab("AB"), "O"]], labAt: { M: ["O", "A"] } };
    const steps = ["OM meets the chord AB at 90°, and the perpendicular from the centre bisects a chord, so AM = MB.", "Use Pythagoras in right-angled triangle OMA: OA² = OM² + AM²."].concat(
      k === "AB" ? [`AM = $\\sqrt{${rad}^2 - ${d}^2} = \\sqrt{${h * h}} = ${h}$ cm`, `x = AB = 2 × ${h} = ${2 * h} cm`] : k === "OM" ? [`AM = ${2 * h} ÷ 2 = ${h} cm`, `x = $\\sqrt{${rad}^2 - ${h}^2} = \\sqrt{${d * d}} = ${d}$ cm`] : [`AM = ${2 * h} ÷ 2 = ${h} cm`, `x = $\\sqrt{${d}^2 + ${h}^2} = \\sqrt{${rad * rad}} = ${rad}$ cm`]);
    const slips = k === "AB" ? [[h, `${h} cm is only AM. The perpendicular from the centre cuts AB in half, so AB = 2 × AM.`], [2 * (rad - d), "Lengths don't simply subtract. Use Pythagoras in triangle OMA, then double AM."], [h * h, `${h * h} is AM². Take the square root, then double it.`]]
      : k === "OM" ? [[rad - h, "Lengths don't simply subtract. Use Pythagoras: OM² = OA² − AM²."], [d * d, `${d * d} is OM². Take the square root to get OM.`], [rad - 2 * h, "Use half the chord: OM meets AB at its midpoint M, so AM is half of AB."]]
      : [[d + h, "Lengths don't simply add. OA is the longest side of right-angled triangle OMA: OA² = OM² + AM²."], [d * d + h * h, `${d * d + h * h} is OA². Take the square root to get OA.`], [2 * h, `${2 * h} cm is the whole chord AB. The radius is OA.`]];
    return { fig, place, x, giv: [], len: true, prop: "chord", k, data: { d, h, rad }, see: "OM comes from the centre O and meets the chord AB at right angles, so M is the middle of AB.",
      q: `${place[1]} OM meets AB at right angles. Find x, in cm.`, hint: "The perpendicular from the centre cuts the chord in half. Then use Pythagoras in triangle OMA.", steps, slips: slips.filter(sl => sl[0] > 0) }; }
};
const CIRC_WHICH = ["semi", "tangent", "twotan", "centre", "segment", "cyclic", "chord"];
// the question: typed with slips, or (cyclic, sometimes) pick the angle; "which" shows a figure and asks which property finds x
const circQ = (r, kind) => {
  const which = kind === "which";
  let z, src; do { src = which ? r.pick(CIRC_WHICH) : kind; z = CIRC[src](r); } while (which && z.len && z.prop === "tangent");
  const T0 = z.place[0], pic = svgCircle(T0, z.fig), base = which ? "which" : kind, uid = `circ|${base}|${z.k || ""}|${z.prop}|${z.giv.join(",")}|${z.x}|${JSON.stringify(z.data || {})}|${z.fig.rot}|${T0}`;
  const data = Object.assign({ circ: base, src, k: z.k, prop: z.prop, x: z.x, giv: z.giv, len: !!z.len, R: z.fig.R }, z.data || {});
  if (which) { const right = CPROP[z.prop][0], wrong = r.shuffle(Object.keys(CPROP).filter(p => p !== z.prop)).map(p => [CPROP[p][0], `That rule needs ${CPROP[p][1]}. Here: ${z.see}`]);
    return mcqWhy(r, `${z.q.replace(/ Find (∠x|x, in cm)\.$/, "")} Which circle property do you use to find ${z.len ? "x" : "∠x"}?`, right, `${right}: ${z.see}`, wrong, "Look at what is drawn: a diameter? a tangent? two tangents? an angle at the centre? four corners on the circle?",
      z.steps.concat([`The property used: ${right}.`]), { pic, uid, data: Object.assign(data, { circ: "which" }) }); }
  if (z.mc) return mcqWhy(r, z.q, dg(z.x), `Opposite angles of a cyclic quadrilateral add up to 180°, so x = 180° − ${dg(z.giv[0])} = ${dg(z.x)}.`, z.slips.filter(([v]) => v > 0 && v < 360).map(([v, t]) => [dg(v), t]), z.hint, z.steps, { pic, uid, data: Object.assign(data, { mc: true }) });
  return numWhy(z.q, z.x, z.hint, z.steps, z.slips.filter(([v]) => v > 0), { pic, uid, data });
};
topic(9, "circles", "Circle Secrets", "🎠", "Angle properties of circles, tangents and chords", r => circQ(r, r.pick(["semi", "semi", "tangent", "tanlen", "twotan", "twotan", "centre", "centre", "segment", "segment", "cyclic", "cyclic", "chord", "chord", "which", "which"])));
topic(9, "ineq", "Inequality Gates", "🚪", "Solve linear inequalities", r => {
  const a = r.nz(-5, 6), b = r.int(-10, 10), x = r.nz(-6, 8), c = a * x + b, op = r.pick(["<", ">", "\\le", "\\ge"]), flip = { "<": ">", ">": "<", "\\le": "\\ge", "\\ge": "\\le" }, fin = a < 0 ? flip[op] : op;
  const right = `x ${fin} ${x}`;
  return mcq(r, `Solve ${T(`${lin(a, b)} ${op} ${c}`)}`, T(right), [`x ${flip[fin]} ${x}`, `x ${fin} ${-x}`, `x ${fin} ${x + 1}`, `x ${flip[fin]} ${-x}`].filter(w => w !== right).map(T), "Solve like an equation — but if you divide by a negative, flip the sign!", [`$${poly([[a, 1]])} ${op} ${c - b}$`, a < 0 ? `Divide by ${a} (negative) → flip: $${right}$` : `Divide by ${a}: $${right}$`], { data: { a, b, c, op } });
});
/* ---------- 🫧 Venn Bubble Club (MOE Sec 3/4 N8 set language and notation: ξ, n(A), ∈ / ∉, A′, ∅, ⊂ / ⊄, union and
   intersection of two sets, Venn diagrams). Six kinds: read a count off a Venn diagram (n(A), n(A ∩ B), n(A ∪ B), n(A′),
   n(A ∩ B′), n((A ∪ B)′), n(ξ)); club and snack surveys that need n(A ∪ B) = n(A) + n(B) − n(A ∩ B); Venn regions given in x
   (form and solve an equation); name the shaded region; list a set from ξ = {1, 2, …, N} and two rules; and pick the true
   statement about a diagram with its elements drawn in (overlapping, nested B ⊂ A, or apart A ∩ B = ∅). The four regions are
   a = A only, b = A ∩ B, c = B only, d = outside both. Every diagram is drawn from its circles: circles carry class vcirc +
   data-n, region paths class vreg + data-r (+ data-shade), counts class vnum + data-r, elements class vel + data-r + data-t,
   so tests read each figure back and check every element sits in its own region. */
const VW = 300, VH = 222, VBOX = [14, 34, 272, 174]; // the ξ rectangle: x, y, width, height
const VLAY = { // circle A, circle B ([cx, cy, r]) and where each region's count goes
  two: { A: [112, 121, 64], B: [188, 121, 64], at: { a: [80, 125], b: [150, 125], c: [220, 125], d: [262, 196] } },
  sub: { A: [138, 121, 78], B: [160, 128, 38], at: { a: [92, 108], b: [160, 132], d: [262, 196] } },
  apart: { A: [86, 121, 56], B: [214, 121, 56], at: { a: [86, 125], c: [214, 125], d: [150, 196] } } };
// where each circle's letter goes: just outside its upper-left (A) or upper-right (B) edge (inside A for a nested B)
const vLetter = (kind, n, C) => { const o = kind === "sub" && n === "B" ? [.71, -.71] : n === "A" ? [-.71, -.71] : [.71, -.71]; return { o, p: [C[0] + o[0] * C[2], C[1] + o[1] * C[2]] }; };
const inC = (p, C, m = 0) => Math.hypot(p[0] - C[0], p[1] - C[1]) < C[2] - m, outC = (p, C, m = 0) => Math.hypot(p[0] - C[0], p[1] - C[1]) > C[2] + m;
// the region a point is in (a | b | c | d)
const vRegion = (L, p) => { const a = inC(p, L.A), b = inC(p, L.B); return a && b ? "b" : a ? "a" : b ? "c" : "d"; };
// region outlines: two overlapping circles meet at the top and bottom of the lens; "sub" and "apart" are plain circles
const vPaths = (kind, L) => { const [A, B] = [L.A, L.B], R = A[2], circ = C => `M${C[0] - C[2]},${C[1]} a${C[2]},${C[2]} 0 1,0 ${2 * C[2]},0 a${C[2]},${C[2]} 0 1,0 ${-2 * C[2]},0 Z`;
  const rect = `M${VBOX[0]},${VBOX[1]} h${VBOX[2]} v${VBOX[3]} h${-VBOX[2]} Z`;
  if (kind === "two") { const x = (A[0] + B[0]) / 2, h = f1(Math.sqrt(R * R - (x - A[0]) ** 2)), T0 = `${x},${f1(A[1] - h)}`, B0 = `${x},${f1(A[1] + h)}`, arc = (big, sw, p) => `A${R},${R} 0 ${big},${sw} ${p}`;
    return { a: `M${T0} ${arc(1, 0, B0)} ${arc(0, 1, T0)} Z`, b: `M${T0} ${arc(0, 1, B0)} ${arc(0, 1, T0)} Z`, c: `M${T0} ${arc(1, 1, B0)} ${arc(0, 0, T0)} Z`, d: `${rect} M${T0} ${arc(1, 0, B0)} ${arc(1, 0, T0)} Z` }; }
  if (kind === "sub") return { a: `${circ(A)} ${circ(B)}`, b: circ(B), d: `${rect} ${circ(A)}` };
  return { a: circ(A), c: circ(B), d: `${rect} ${circ(A)} ${circ(B)}` }; };
// spots for written elements inside region k: a 19 px grid, kept clear of every circle edge, the rectangle edge and the letters
const vSpots = (kind, L, k) => { const out = [], lets = [["A", L.A], ["B", L.B]].map(([n, C]) => { const { o, p } = vLetter(kind, n, C); return [p[0] + o[0] * 10, p[1] + o[1] * 10]; }); for (let y = VBOX[1] + 16; y <= VBOX[1] + VBOX[3] - 12; y += 19) for (let x = VBOX[0] + 16; x <= VBOX[0] + VBOX[2] - 14; x += 19) { const p = [x, y];
  if (vRegion(L, p) !== k || [L.A, L.B].some(C => Math.abs(Math.hypot(p[0] - C[0], p[1] - C[1]) - C[2]) < 11) || (x < 44 && y < 62) || lets.some(q => Math.hypot(x - q[0], y - q[1]) < 16)) continue; out.push(p); } return out; };
const vSpread = (spots, n, c) => { if (!n) return []; const s = spots.slice().sort((p, q) => Math.hypot(p[0] - c[0], p[1] - c[1]) - Math.hypot(q[0] - c[0], q[1] - c[1])).slice(0, Math.max(n, Math.min(spots.length, n * 2)));
  return s.sort((p, q) => p[1] - q[1] || p[0] - q[0]).filter((_, i) => i % Math.floor(s.length / n || 1) === 0).slice(0, n); };
/* a Venn diagram: f = { kind: two | sub | apart, nums: { a: "7" | "2x + 1" | "x" }, els: { a: [3, 9] }, shade: [a, b…], tot: [A label,
   B label] (e.g. "n(A) = 18", written above each circle) } */
const svgVenn = (title, f) => { const kind = f.kind || "two", L = VLAY[kind], P = vPaths(kind, L), sh = f.shade || [];
  let back = `<rect x="${VBOX[0]}" y="${VBOX[1]}" width="${VBOX[2]}" height="${VBOX[3]}" rx="10" fill="#F7F2FF" stroke="${INK}" stroke-width="2.2"/>`, marks = "", text = "";
  Object.keys(P).forEach(k => { const on = sh.includes(k); back += `<path class="vreg" data-r="${k}"${on ? ` data-shade="1"` : ""} d="${P[k]}" fill-rule="evenodd" fill="${on ? "#FF9EC0" : k === "d" || f.shade ? "none" : k === "b" ? "#E2D6FF" : k === "a" ? PASTEL[1] : PASTEL[2]}" fill-opacity="${on ? .8 : .7}" stroke="none"/>`; });
  [["A", L.A], ["B", L.B]].forEach(([n, C]) => { back += `<circle class="vcirc" data-n="${n}" cx="${C[0]}" cy="${C[1]}" r="${C[2]}" fill="none" stroke="${INK}" stroke-width="2.6"/>`;
    const { o, p } = vLetter(kind, n, C); text += figVtx(p, o, n, 10); });
  text += `<text class="vxi" x="${VBOX[0] + 10}" y="${VBOX[1] + 18}" font-size="15" font-style="italic" font-family="Georgia, serif" font-weight="900" fill="${INK}">ξ</text>`;
  (f.tot || []).forEach((t, i) => { if (t) text += `<text class="vtot" data-n="${"AB"[i]}" x="${i ? 280 : 38}" y="${VBOX[1] + 17}" font-size="11" text-anchor="${i ? "end" : "start"}" font-weight="900" fill="#c2457a">${esc(t)}</text>`; });
  Object.entries(f.nums || {}).forEach(([k, t]) => { const p = L.at[k]; text += angText(t, p[0], p[1] + 2, 17, 16, ` class="vnum" data-r="${k}" data-t="${esc(t)}"`); });
  Object.entries(f.els || {}).forEach(([k, xs]) => { vSpread(vSpots(kind, L, k), xs.length, L.at[k]).forEach((p, i) => { marks += `<text class="vel" data-r="${k}" data-t="${xs[i]}" x="${p[0]}" y="${p[1] + 4.5}" font-size="13" text-anchor="middle" font-weight="900" fill="${INK}">${xs[i]}</text>`; }); });
  return cardSvg(VW, VH, title, 20, back + marks + text, "Venn diagram", "mpic chart venn"); };
// kid-friendly surveys: [card title, who ξ is, what A is, what B is, the people word]
const VCTX = [
  ["Class 3 Rainbow snack survey", "the students in Class 3 Rainbow", "students who like bubble tea", "students who like ice kachang", "students"],
  ["School camp activities", "the campers at the school camp", "campers who tried kayaking", "campers who tried rock climbing", "campers"],
  ["Pet survey", "the students in the Science Club", "students who have a cat", "students who have a dog", "students"],
  ["Sports Day", "the runners on Sports Day", "runners who ran the relay", "runners who did the long jump", "runners"],
  ["Book fair", "the visitors at the book fair", "visitors who bought a comic", "visitors who bought a puzzle book", "visitors"],
  ["Cat café kittens", "the kittens at the cat café", "fluffy kittens", "kittens with stripes", "kittens"],
  ["CCA fair", "the Secondary 3 students", "students in the Art Club", "students in the Robotics Club", "students"]];
const RW = { a: "A only", b: "the overlap A ∩ B", c: "B only", d: "outside both circles" };
const rWords = ks => ks.length === 4 ? "every region" : ks.map(k => RW[k]).join(" and ");
// set notation: [TeX, plain text, regions, in words]
const VNOTE = [["A \\cap B", "A ∩ B", "b", "in both A and B"], ["A \\cup B", "A ∪ B", "abc", "in A or B or both"], ["A'", "A′", "cd", "not in A"], ["B'", "B′", "ad", "not in B"],
  ["A \\cap B'", "A ∩ B′", "a", "in A but not in B"], ["A' \\cap B", "A′ ∩ B", "c", "in B but not in A"], ["(A \\cup B)'", "(A ∪ B)′", "d", "in neither A nor B"],
  ["(A \\cap B)'", "(A ∩ B)′", "acd", "not in both at once (everything except the overlap)"], ["A' \\cup B", "A′ ∪ B", "bcd", "not in A, or in B"], ["A \\cup B'", "A ∪ B′", "abd", "in A, or not in B"],
  ["A", "A", "ab", "in A (the overlap too)"], ["B", "B", "bc", "in B (the overlap too)"], ["A' \\cap B'", "A′ ∩ B′", "d", "in neither A nor B"]];
const VN = Object.fromEntries(VNOTE.map(v => [v[1], v]));
const nOf = (ks, R) => sum([...ks].map(k => R[k]));
const VENN = {
  // read a count straight off the diagram
  read: r => { const R = { a: r.int(2, 15), b: r.int(1, 12), c: r.int(2, 15), d: r.int(1, 12) }, ctx = r.pick(VCTX), N = nOf("abcd", R), { a, b, c, d } = R;
    const ASK = {
      "A": [[a, "That is A only. n(A) counts everyone inside circle A, the overlap too."], [a + b + c, "That is n(A ∪ B): it adds B only as well. n(A) is just inside circle A."], [b, "That is only the overlap. n(A) also takes in A only."]],
      "B": [[c, "That is B only. n(B) counts everyone inside circle B, the overlap too."], [a + b + c, "That is n(A ∪ B): it adds A only as well. n(B) is just inside circle B."], [b, "That is only the overlap. n(B) also takes in B only."]],
      "A ∩ B": [[a + b + c, "That is the union A ∪ B (in A or B). The intersection is just the overlap, in both."], [a + c, "Those are the ones in exactly one set. A ∩ B is the overlap, in both."], [b + d, "Only the overlap counts: the outside region is in neither set."]],
      "A ∪ B": [[a + 2 * b + c, `The overlap ${b} was counted twice. Add each region once: A only + overlap + B only.`], [a + c, "The overlap is in A ∪ B too: in A or B or both."], [N, `${N} is everyone in ξ. The ${d} outside both circles are not in A ∪ B.`]],
      "A′": [[c, "A′ is everything not in A: B only and the region outside both circles."], [a + b, "That is n(A). A′ is the complement: everything outside circle A."], [d, "The B-only region is outside circle A too, so it is part of A′."], [b + c + d, "The overlap is inside circle A, so it is not part of A′."]],
      "B′": [[a, "B′ is everything not in B: A only and the region outside both circles."], [b + c, "That is n(B). B′ is the complement: everything outside circle B."], [d, "The A-only region is outside circle B too, so it is part of B′."], [a + b + d, "The overlap is inside circle B, so it is not part of B′."]],
      "A ∩ B′": [[a + b, "That is n(A). A ∩ B′ must also be not in B, so the overlap is left out."], [a + d, "That is n(B′). A ∩ B′ must be in A as well, so the outside region is left out."], [c, "That is B only (A′ ∩ B). A ∩ B′ is in A but not in B."], [a + c, "That is the ones in exactly one set. A ∩ B′ is only the A-only region."], [b, "That is the overlap: it is inside B, so it is not in B′."], [N, `${N} is all of ξ. A ∩ B′ is only the A-only region.`]],
      "(A ∪ B)′": [[a + c + d, "That is (A ∩ B)′. (A ∪ B)′ is outside both circles: in neither A nor B."], [a + b + c, "That is A ∪ B itself. The dash means the complement: outside both circles."], [b, "The overlap is in both sets. (A ∪ B)′ is the region in neither."], [N, `${N} is all of ξ. (A ∪ B)′ is only the region outside both circles.`]],
      "ξ": [[a + b + c, `The ${d} outside both circles belong to ξ too: ξ is everyone.`], [a + 2 * b + c + d, `The overlap ${b} was counted twice. Add each of the four regions once.`], [a + c + d, "The overlap belongs to ξ too: add all four regions."]] };
    const k = r.pick(Object.keys(ASK)), want = k === "ξ" ? N : nOf(VN[k][2], R), ks = k === "ξ" ? "abcd" : VN[k][2], tex = k === "ξ" ? "\\xi" : VN[k][0];
    const steps = [`${k === "ξ" ? "ξ is every region" : `${k} is ${VN[k][3]}: ${rWords([...ks])}`}.`, `n(${k}) = ${[...ks].map(x => R[x]).join(" + ")} = ${want}`];
    return { fig: { nums: { a: String(a), b: String(b), c: String(c), d: String(d) } }, ctx, R, k, want,
      q: `In the Venn diagram, ξ = ${ctx[1]}, A = ${ctx[2]} and B = ${ctx[3]}. Find ${T(`n(${tex})`)}.`, hint: k === "ξ" ? "Add all four regions once each." : `Shade ${k} in your head first: ${VN[k][3]}. Then add those regions.`, steps, slips: ASK[k] }; },
  // surveys: n(A ∪ B) = n(A) + n(B) − n(A ∩ B)
  story: r => { let R; do R = { a: r.int(2, 16), b: r.int(2, 12), c: r.int(2, 16), d: r.int(1, 9) }; while (R.a === R.c);
    const ctx = r.pick(VCTX), { a, b, c, d } = R, N = a + b + c + d, nA = a + b, nB = b + c, w = r.pick(["both", "both", "neither", "aonly", "one"]), who = ctx[4];
    const A2 = ctx[2], B2 = ctx[3];
    const lines = `There are ${N} ${who} in ξ (${ctx[1]}). ${nA} are in A (${A2}) and ${nB} are in B (${B2}).`;
    if (w === "both") return { fig: { nums: { b: "x", d: String(d) }, tot: [`n(A) = ${nA}`, `n(B) = ${nB}`] }, ctx, R, k: "both", want: b,
      q: `${lines} ${d} ${d === 1 ? "is" : "are"} in neither. How many are in both A and B?`, hint: "Everyone in A or B is ξ minus the ones in neither. Then n(A) + n(B) counts the overlap twice.",
      steps: [`n(A ∪ B) = ${N} − ${d} = ${N - d}`, `n(A ∩ B) = n(A) + n(B) − n(A ∪ B) = ${nA} + ${nB} − ${N - d} = ${b}`],
      slips: [[nA + nB - N, `The ${d} in neither were left out. First n(A ∪ B) = ${N} − ${d} = ${N - d}, then ${nA} + ${nB} − ${N - d}.`], [N - d, `${N - d} is n(A ∪ B), everyone in A or B. The overlap is n(A) + n(B) − n(A ∪ B).`], [nA + nB - d, "Take n(A ∪ B) away from n(A) + n(B), not the ones in neither."], [nA + nB, "n(A) + n(B) counts the overlap twice. Take away n(A ∪ B) to find it."]] };
    if (w === "neither") return { fig: { nums: { b: String(b), d: "x" }, tot: [`n(A) = ${nA}`, `n(B) = ${nB}`] }, ctx, R, k: "neither", want: d,
      q: `${lines} ${b} are in both. How many are in neither A nor B?`, hint: "n(A ∪ B) = n(A) + n(B) − n(A ∩ B). The rest of ξ is in neither.",
      steps: [`n(A ∪ B) = ${nA} + ${nB} − ${b} = ${a + b + c}`, `n((A ∪ B)′) = ${N} − ${a + b + c} = ${d}`],
      slips: [[N - nA - nB, `The ${b} in both were taken away twice. n(A ∪ B) = ${nA} + ${nB} − ${b} = ${a + b + c} first.`], [a + b + c, `${a + b + c} is n(A ∪ B), the ones in A or B. Neither is what is left of ξ: ${N} − ${a + b + c}.`], [N - b, "Taking away only the overlap leaves A only and B only in. Take away all of A ∪ B."], [N - nA, `${N - nA} is n(A′): it still has the B-only ${who} in it. Take away all of A ∪ B.`], [N - nB, `${N - nB} is n(B′): it still has the A-only ${who} in it. Take away all of A ∪ B.`]] };
    if (w === "aonly") return { fig: { nums: { a: "x", b: String(b), d: String(d) }, tot: ["", `n(B) = ${nB}`] }, ctx, R, k: "aonly", want: a,
      q: `There are ${N} ${who} in ξ (${ctx[1]}). ${nB} are in B (${B2}), ${b} of them also in A (${A2}), and ${d} ${d === 1 ? "is" : "are"} in neither. How many are in A only?`, hint: "Take B and the ones in neither away from ξ: what is left is A only.",
      steps: [`A only = n(ξ) − n(B) − neither`, `= ${N} − ${nB} − ${d} = ${a}`],
      slips: [[a + b, `${a + b} would be n(A). The ${b} in both are already inside n(B), so A only is ${N} − ${nB} − ${d}.`], [N - nB, `The ${d} in neither are not in A. Take them away too.`], [N - nB - d - b, `The ${b} in both were taken away twice: they are already inside n(B) = ${nB}.`], [N - d, `${N - d} is everyone in A or B. Take the ${nB} in B away too, to leave A only.`]] };
    return { fig: { nums: { a: "?", b: String(b), c: "?", d: String(d) }, tot: [`n(A) = ${nA}`, `n(B) = ${nB}`] }, ctx, R, k: "one", want: a + c,
      q: `${lines} ${b} are in both and ${d} ${d === 1 ? "is" : "are"} in neither. How many are in exactly one of A and B?`, hint: "Exactly one means A only or B only: take the overlap out of each set.",
      steps: [`A only = ${nA} − ${b} = ${a}, B only = ${nB} − ${b} = ${c}`, `Exactly one = ${a} + ${c} = ${a + c}`],
      slips: [[a + b + c, `${a + b + c} is n(A ∪ B): it still has the ${b} in both. Exactly one leaves the overlap out.`], [nA + nB, "n(A) + n(B) has the overlap in it twice. Take the overlap out of each set first."], [N - d, `${N - d} is everyone in A or B, the ${b} in both too.`]] }; },
  // regions given in x: form an equation from n(ξ) and solve it
  alg: r => { let p, q, m, s, d, x, N; do { x = r.int(2, 9); p = r.int(1, 3); q = r.int(0, 6); m = r.int(1, 3); s = r.int(0, 8); d = r.int(1, 9); N = p * x + q + x + m * x + s + d; } while (p === m && q === s);
    const ctx = r.pick(VCTX), ex = (k, c) => `${k === 1 ? "" : k}x${c ? ` + ${c}` : ""}`, K = p + 1 + m, C = q + s + d, askA = r.chance(.35), want = askA ? p * x + q + x : x;
    const steps = [`Add the four regions: ${ex(p, q)} + x + ${ex(m, s)} + ${d} = ${N}`, `${K}x + ${C} = ${N}`, `${K}x = ${N - C}, so x = ${x}`].concat(askA ? [`n(A) = A only + overlap = ${ex(p, q)} + x = ${p * x + q} + ${x} = ${want}`] : []);
    const slips = askA ? [[x, `x = ${x} is only the overlap. n(A) is A only + the overlap: ${p * x + q} + ${x}.`], [p * x + q, `${p * x + q} is A only. n(A) takes in the overlap too: add x = ${x}.`], [p * x + q + x + m * x + s, "That is n(A ∪ B): it adds B only too. n(A) is A only + the overlap."]]
      : [[(N - C + d) / K, `The ${d} outside both circles are in ξ too: add them to the regions.`], [(N - C) / (K - 1), "The overlap is x too: count it once with the other x's."], [N - C, `${N - C} is ${K}x. Divide by ${K} to get x.`]];
    return { fig: { nums: { a: ex(p, q), b: "x", c: ex(m, s), d: String(d) } }, ctx, R: { a: p * x + q, b: x, c: m * x + s, d }, k: askA ? "nA" : "x", want, xv: x,
      q: `The Venn diagram shows the numbers of ${ctx[4]} in each region (ξ = ${ctx[1]}, A = ${ctx[2]}, B = ${ctx[3]}). n(ξ) = ${N}. ${askA ? `Find ${T("n(A)")}.` : "Find x."}`,
      hint: `The four regions add up to n(ξ) = ${N}. Write that as an equation in x.`, steps, slips }; }
};
// name the shaded region (the three wrong names shade a different set of regions, the nearest ones first)
const vShade = r => { const target = r.pick(VNOTE.filter(v => !["A", "B", "A′ ∩ B′"].includes(v[1]))), ks = [...target[2]], ctx = r.pick(VCTX);
  const diff = v => [..."abcd"].filter(k => v[2].includes(k) !== target[2].includes(k)).length;
  const pool = r.shuffle(VNOTE.filter(v => v[2] !== target[2] && v[1] !== "A′ ∩ B′")).sort((u, v) => diff(u) - diff(v)).slice(0, 5);
  const wrong = r.shuffle(pool).map(v => [T(v[0]), `${v[1]} means ${v[3]}: it would shade ${rWords([...v[2]])}. The shaded part here is ${rWords(ks)}.`]);
  return { fig: { shade: ks }, ctx, k: target[1], ks, right: T(target[0]), rightWhy: `The shaded part is ${rWords(ks)}: the members ${target[3]}. That is ${target[1]}.`, wrong,
    q: `In the Venn diagram, A = ${ctx[2]} and B = ${ctx[3]}. Which set is shaded?`, hint: "Look at each of the four regions: is it shaded or not? Then match the words: ∩ is \"and\", ∪ is \"or\", a dash ′ is \"not\".",
    steps: [`Shaded: ${rWords(ks)}.`, `In words: ${target[3]}.`, `So the shaded set is ${target[1]}.`] }; };
// list a set: ξ = {1, …, N} and two rules
const VRULE = [["a multiple of 2", x => x % 2 === 0], ["a multiple of 3", x => x % 3 === 0], ["a multiple of 4", x => x % 4 === 0], ["a multiple of 5", x => x % 5 === 0],
  ["an odd number", x => x % 2 === 1], ["a prime number", x => [2, 3, 5, 7, 11, 13, 17].includes(x)], ["a square number", x => [1, 4, 9, 16].includes(x)], ["a factor of 12", x => 12 % x === 0],
  ["a factor of 18", x => 18 % x === 0], ["a factor of 20", x => 20 % x === 0], ["greater than 10", x => x > 10], ["less than 7", x => x < 7]];
const setTex = xs => xs.length ? `\\{${xs.join(", ")}\\}` : "\\varnothing", setTxt = xs => xs.length ? `{${xs.join(", ")}}` : "∅ (the empty set)";
const vList = r => { let N, A, B, ra, rb, U, ops, pick; for (;;) { N = r.int(10, 18); [ra, rb] = r.shuffle(VRULE).slice(0, 2); U = Array.from({ length: N }, (_, i) => i + 1); A = U.filter(ra[1]); B = U.filter(rb[1]);
    if (A.length < 2 || B.length < 2 || A.length > 9 || B.length > 9) continue;
    const sets = { "A ∩ B": U.filter(x => A.includes(x) && B.includes(x)), "A ∪ B": U.filter(x => A.includes(x) || B.includes(x)), "A ∩ B′": A.filter(x => !B.includes(x)), "A′ ∩ B": B.filter(x => !A.includes(x)), "(A ∪ B)′": U.filter(x => !A.includes(x) && !B.includes(x)) };
    ops = Object.keys(sets).filter(k => sets[k].length <= 8); pick = r.pick(ops); const right = setTex(sets[pick]); if (Object.keys(sets).filter(k => setTex(sets[k]) === right).length > 1) continue; ops = sets; break; }
  const S = ops[pick], right = T(setTex(S)), lab = { "A ∩ B": "in both lists", "A ∪ B": "in either list (or both)", "A ∩ B′": "in A's list but not in B's", "A′ ∩ B": "in B's list but not in A's", "(A ∪ B)′": "in neither list" };
  const wrong = Object.keys(ops).filter(k => k !== pick).map(k => [T(setTex(ops[k])), `${setTxt(ops[k])} is ${k}: the numbers ${lab[k]}. ${pick} needs the numbers ${lab[pick]}.`]);
  wrong.push([T(setTex(A)), `${setTxt(A)} is all of A. ${pick} needs the numbers ${lab[pick]}.`], [T(setTex(B)), `${setTxt(B)} is all of B. ${pick} needs the numbers ${lab[pick]}.`]);
  const tex = VN[pick][0];
  return { ctx: null, k: pick, N, A, B, S, right, wrong: r.shuffle(wrong).sort((u, v) => (u[0].split(",").length > 9) - (v[0].split(",").length > 9)), rightWhy: `A = ${setTxt(A)} and B = ${setTxt(B)}. The numbers ${lab[pick]}: ${setTxt(S)}.`,
    q: `Sumi the star fairy numbers her lanterns: ${T(`\\xi = \\{1, 2, 3, \\ldots, ${N}\\}`)}. A = {x : x is ${ra[0]}} and B = {x : x is ${rb[0]}}. Which is ${T(tex)}?`, hint: "List A and B first, then pick out the numbers that fit the rule.",
    steps: [`A = ${setTxt(A)}`, `B = ${setTxt(B)}`, `${pick} = the numbers ${lab[pick]} = ${setTxt(S)}`], data: { ra: ra[0], rb: rb[0] } }; };
// the true statement about a diagram with its elements drawn in
const vSym = r => { const kind = r.pick(["two", "two", "sub", "apart"]), pool = r.shuffle(Array.from({ length: 20 }, (_, i) => i + 1)), take = n => pool.splice(0, n);
  const E = kind === "two" ? { a: take(r.int(2, 3)), b: take(r.int(1, 2)), c: take(r.int(2, 3)), d: take(r.int(1, 2)) } : kind === "sub" ? { a: take(r.int(2, 4)), b: take(r.int(2, 3)), d: take(r.int(1, 3)) } : { a: take(r.int(2, 4)), c: take(r.int(2, 4)), d: take(r.int(1, 3)) };
  Object.keys(E).forEach(k => E[k].sort((x, y) => x - y)); const g = k => E[k] || [], A = asc(g("a").concat(g("b"))), B = asc(g("b").concat(g("c"))), U = asc([].concat(...Object.values(E))), inA = x => A.includes(x), inB = x => B.includes(x);
  const where = x => inA(x) && inB(x) ? "in both circles" : inA(x) ? "only in circle A" : inB(x) ? "only in circle B" : "outside both circles", st = [];
  const add = (tex, txt, ok, yes, no) => st.push([T(tex), txt, ok, ok ? yes : no]);
  const e1 = r.pick(U), e2 = r.pick(U.filter(x => x !== e1));
  [e1, e2].forEach(x => { add(`${x} \\in A`, `${x} ∈ A`, inA(x), `${x} is inside circle A, so ${x} ∈ A.`, `${x} is ${where(x)}, so ${x} ∉ A.`); add(`${x} \\notin B`, `${x} ∉ B`, !inB(x), `${x} is not inside circle B, so ${x} ∉ B.`, `${x} is ${where(x)}, so ${x} ∈ B.`); });
  add("B \\subset A", "B ⊂ A", kind === "sub", "Every member of B is also inside circle A (and A has more), so B ⊂ A.", B.some(x => !inA(x)) ? `${B.find(x => !inA(x))} is in B but not in A, so B ⊄ A.` : "B is a subset only if every member of B is in A.");
  add("A \\subset B", "A ⊂ B", false, "", `${A.find(x => !inB(x))} is in A but not in B, so A ⊄ B.`);
  add("A \\cap B = \\varnothing", "A ∩ B = ∅", kind === "apart", "The circles don't overlap: no member is in both, so A ∩ B = ∅.", `${g("b")[0]} is in both A and B, so A ∩ B is not empty.`);
  const nAc = U.length - A.length, nU = asc(A.concat(B.filter(x => !inA(x)))).length, dn = r.pick([-1, 1]);
  add(`n(A') = ${nAc}`, `n(A′) = ${nAc}`, true, `A′ is everything outside circle A: ${setTxt(U.filter(x => !inA(x)))}, which is ${nAc} members.`, "");
  add(`n(A') = ${nAc + dn}`, `n(A′) = ${nAc + dn}`, false, "", `A′ is everything outside circle A: ${setTxt(U.filter(x => !inA(x)))}. Count them: ${nAc}, not ${nAc + dn}.`);
  add(`n(A \\cup B) = ${nU}`, `n(A ∪ B) = ${nU}`, true, `A ∪ B is everything inside a circle: ${setTxt(asc(A.concat(B.filter(x => !inA(x)))))}, which is ${nU} members.`, "");
  const twice = A.length + B.length, wU = twice === nU ? nU + 1 : twice;
  add(`n(A \\cup B) = ${wU}`, `n(A ∪ B) = ${wU}`, false, "", twice === nU ? `Count every member inside a circle: there are ${nU}, not ${wU}.` : `${A.length} + ${B.length} counts the overlap twice. Inside the circles there are ${nU} members.`);
  const T1 = r.pick(st.filter(s => s[2])), F = r.shuffle(st.filter(s => !s[2] && s[0] !== T1[0])), wrong = F.map(s => [s[0], `Not true: ${s[3]}`]);
  return { fig: { kind, els: E }, kind, E, k: T1[1], right: T1[0], rightWhy: `True: ${T1[3]}`, wrong,
    q: "The Venn diagram shows the members of ξ, A and B. Which statement is true?", hint: "Read each statement in words: ∈ \"is a member of\", ∉ \"is not a member of\", ⊂ \"is a subset of\", ∅ \"the empty set\", A′ \"not in A\".",
    steps: [`A = ${setTxt(A)}, B = ${setTxt(B)}, ξ = ${setTxt(U)}`, `${T1[1]}: ${T1[3]}`] }; };
const VENN_TITLE = { read: c => c[0], story: c => c[0], alg: c => c[0], shade: () => "Shade the bubbles", sym: () => "Bubble members" };
const vennQ = (r, kind) => {
  if (kind === "list") { const z = vList(r), uid = `venn|list|${z.N}|${z.data.ra}|${z.data.rb}|${z.k}`;
    return mcqWhy(r, z.q, z.right, z.rightWhy, z.wrong, z.hint, z.steps, { uid, data: { venn: "list", k: z.k, N: z.N, A: z.A, B: z.B, S: z.S, ra: z.data.ra, rb: z.data.rb } }); }
  if (kind === "shade" || kind === "sym") { const z = kind === "shade" ? vShade(r) : vSym(r), pic = svgVenn(VENN_TITLE[kind](z.ctx), z.fig), uid = `venn|${kind}|${z.k}|${JSON.stringify(z.fig)}`;
    return mcqWhy(r, z.q, z.right, z.rightWhy, z.wrong, z.hint, z.steps, { pic, uid, data: { venn: kind, k: z.k, ks: z.ks, layout: z.kind || "two", E: z.E } }); }
  const z = VENN[kind](r), pic = svgVenn(VENN_TITLE[kind](z.ctx), z.fig), uid = `venn|${kind}|${z.k}|${JSON.stringify(z.R)}|${z.ctx[0]}`;
  return numWhy(z.q, z.want, z.hint, z.steps, z.slips.filter(([v]) => v > 0), { pic, uid, data: { venn: kind, k: z.k, R: z.R, x: z.xv } });
};
topic(9, "sets", "Venn Bubble Club", "🫧", "Sets, Venn diagrams, union, intersection and complement", r => vennQ(r, r.pick(["read", "read", "story", "story", "alg", "alg", "shade", "shade", "list", "list", "sym", "sym"])));
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
  if (r.chance(.5)) { const b = r.int(4, 15), c = r.int(4, 15), A = r.int(30, 120), a = Math.sqrt(b * b + c * c - 2 * b * c * cosD(A));
    return num(`In triangle ABC, b = ${b} cm, c = ${c} cm and angle A = ${A}°. Find a (1 d.p.).`, rd(a, 1), "Cosine rule: a² = b² + c² − 2bc cos A", [`$a^2 = ${b}^2 + ${c}^2 - 2(${b})(${c})\\cos ${A}^\\circ$`, `$a^2 \\approx ${fdp(a * a, 2)}$`, `$a \\approx ${rd(a, 1).toFixed(1)}$ cm`], { a: rd(a, 1).toFixed(1), keys: ["."], tol: 0.051, data: { b, c, A, rule: "cos" } }); }
  const A = r.int(30, 80), B = r.int(30, 150 - A), a = r.int(5, 15), b = a * sinD(B) / sinD(A);
  return num(`In triangle ABC, angle A = ${A}°, angle B = ${B}° and a = ${a} cm. Find b (1 d.p.).`, rd(b, 1), "Sine rule: a / sin A = b / sin B", [`$b = \\frac{${a}\\sin ${B}^\\circ}{\\sin ${A}^\\circ}$`, `$b \\approx ${rd(b, 1).toFixed(1)}$ cm`], { a: rd(b, 1).toFixed(1), keys: ["."], tol: 0.051, data: { A, B, a, rule: "sin" } });
});

/* ---------- 🌊 Wave Pier (MOE Sec 3/4 A-Math / E-Math trigonometric graphs): amplitude |a|, period 360°/|b|
   (degrees, matching Sine & Cosine Castle), max/min with a vertical shift d, match equation ↔ pastel SVG wave,
   read a marked point / y-intercept / crest from the drawn graph, and kid word problems (Ferris wheel height,
   fairy pier tide, swinging lantern, pumpkin-coach wave road). Pictures use the shared svgWave kit in
   math-gen.js (class=wave data-a/b/kind/d, marks class=wdot). Parabola + travel stay byte-identical. */
const WAVE_CTX = [
  { id: "ferris", title: "Ferris wheel", who: "Fairy Pip", spot: "the carnival Ferris wheel", thing: "Ferris-wheel seat", of: "the seat", unit: "m" },
  { id: "tide", title: "Tide Pier", who: "Princess Mira", spot: "Wave Pier", thing: "tide height", of: "the tide", unit: "m" },
  { id: "lantern", title: "Lantern Swing", who: "Sumi the star fairy", spot: "the lantern swing", thing: "swinging lantern", of: "the lantern", unit: "m" },
  { id: "pier", title: "Wave Pier", who: "Jack", spot: "Wave Pier", thing: "pier wave", of: "the wave", unit: "m" },
  { id: "ribbon", title: "Rainbow Ribbon", who: "Rapunzel", spot: "the rainbow ribbon road", thing: "ribbon wave", of: "the ribbon", unit: "cm" },
  { id: "coach", title: "Pumpkin-coach road", who: "Cinderella", spot: "the wavy palace road", thing: "pumpkin-coach path", of: "the coach", unit: "m" }
];
// nice y = a sin(bx)+d or a cos(bx)+d with integer a, friendly b, mild d (degrees)
const niceWave = r => {
  const a = r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
  const b = r.pick([1, 1, 2, 2, 3, 0.5, 0.5]);
  const kind = r.pick(["sin", "sin", "cos"]);
  const d = r.chance(.55) ? r.pick([-3, -2, -1, 1, 2, 3]) : 0;
  const { amp, period } = ampPeriod(a, b);
  const max = d + amp, min = d - amp;
  return { a, b, kind, d, amp, period, max, min };
};
const waveFnTex = (a, b, kind, d) => {
  const front = a === 1 ? "" : a === -1 ? "-" : String(a);
  const arg = b === 1 ? "x" : b === 0.5 ? "\\frac{1}{2}x" : `${fmt(b)}x`;
  const core = `${front}\\${kind} ${arg}`;
  if (d === 0) return `y = ${core}`;
  return `y = ${core} ${d < 0 ? "-" : "+"} ${fmt(Math.abs(d))}`;
};
const waveEqShow = z => T(waveFnTex(z.a, z.b, z.kind, z.d));
const waveY = (z, x) => (z.kind === "cos" ? z.a * cosD(z.b * x) : z.a * sinD(z.b * x)) + z.d;
const waveMarks = (z, which) => {
  const m = [], per = z.period;
  if (which.includes("max")) {
    // crest: for a>0 sin at 90/b; for a<0 sin crest is at 270/b; cos a>0 at 0
    let x;
    if (z.kind === "sin") x = (z.a >= 0 ? 90 : 270) / Math.abs(z.b);
    else x = (z.a >= 0 ? 0 : 180) / Math.abs(z.b);
    if (x > per) x = x % per;
    m.push({ n: "M", x, y: z.max, lab: `(${fmt(x)}°, ${fmt(z.max)})`, dy: -8 });
  }
  if (which.includes("min")) {
    let x;
    if (z.kind === "sin") x = (z.a >= 0 ? 270 : 90) / Math.abs(z.b);
    else x = (z.a >= 0 ? 180 : 0) / Math.abs(z.b);
    if (x > per) x = x % per;
    m.push({ n: "N", x, y: z.min, lab: `(${fmt(x)}°, ${fmt(z.min)})`, dy: 14 });
  }
  if (which.includes("y")) m.push({ n: "Y", x: 0, y: waveY(z, 0), lab: `(0, ${fmt(waveY(z, 0))})`, dx: 18, dy: 0 });
  if (which.includes("mid")) {
    const x = z.kind === "sin" ? 0 : (90 / Math.abs(z.b));
    m.push({ n: "P", x, y: waveY(z, x), lab: `(${fmt(x)}°, ${fmt(waveY(z, x))})`, dy: waveY(z, x) >= z.d ? -8 : 14 });
  }
  return m;
};
const wavePic = (z, ctx, which = ["max"], o = {}) => svgWave(ctx.title, z.a, z.b, z.kind, z.d, Object.assign({ marks: waveMarks(z, which), periods: z.period <= 360 ? 1 : 1 }, o));
const WAVE = {
  amp: r => { const z = niceWave(r), ctx = r.pick(WAVE_CTX), mc = r.chance(.5), pic = wavePic(z, ctx, ["max", "min"]);
    const q = `${ctx.who} sketches ${waveEqShow(z)} for ${ctx.of} at ${ctx.spot}. What is the amplitude?`;
    const hint = "Amplitude is |a|, the absolute value of the number in front of sin or cos — how far the wave rises above its middle line.";
    const steps = [`$y = ${waveFnTex(z.a, z.b, z.kind, z.d)}$`, `Amplitude = $|a| = |${z.a}| = ${z.amp}$`];
    if (mc) {
      const right = String(z.amp);
      const cand = [
        [String(z.a === z.amp ? -z.a || 1 : z.a), `Amplitude is the absolute value |a|. Drop the sign: |${z.a}|.`],
        [String(z.period), `That is the period (how long one full wave takes). Amplitude is the height of the wave, |a|.`],
        [String(z.max), `That is the greatest y-value. Amplitude is how far up from the middle line: |a|.`],
        [String(z.d === 0 ? z.amp + 1 : Math.abs(z.d)), z.d === 0 ? `That adds one to the amplitude. Read |a| straight from the front of sin/cos.` : `That is the vertical shift |d|. Amplitude ignores the shift.`],
        [String(2 * z.amp), `That is the full peak-to-trough height. Amplitude is only half of that: |a|.`],
        [String(z.b === 1 ? 2 : Math.abs(z.b)), `That comes from b (which controls the period). Amplitude is |a|.`]
      ];
      const wrong = []; const seen = new Set([right]);
      for (const [o, n] of cand) if (!seen.has(String(o))) { seen.add(String(o)); wrong.push([String(o), n]); }
      return { k: "amp", mc: true, ctx, z, x: z.amp, right, rightWhy: `Right: amplitude is how far the crest sits above the middle line — take the absolute value of the coefficient in front of ${z.kind}.`, wrong, q, hint, steps, pic, data: { a: z.a, b: z.b, kind: z.kind, d: z.d, amp: z.amp, period: z.period } };
    }
    return { k: "amp", mc: false, ctx, z, x: z.amp, q, hint, steps, pic, data: { a: z.a, b: z.b, kind: z.kind, d: z.d, amp: z.amp, period: z.period },
      slips: [[z.a === z.amp ? (z.a === 0 ? 1 : -z.a) : z.a, `Keep the absolute value: amplitude is |${z.a}| = ${z.amp}, never negative.`],
        [z.period, `That is the period ${z.period}°. Amplitude is the wave height |a| = ${z.amp}.`],
        [2 * z.amp, `Peak to trough is 2|a|. Amplitude itself is only |a| = ${z.amp}.`],
        [z.max, `That is the maximum y-value. Amplitude is |a| = ${z.amp}, measured from the middle.`]] }; },
  period: r => { const z = niceWave(r), ctx = r.pick(WAVE_CTX), pic = wavePic(z, ctx, ["max"]);
    const q = `The path of ${ctx.of} follows ${waveEqShow(z)}. Find the period in degrees.`;
    const hint = "Period = 360° ÷ |b|. One full wave finishes when the angle inside sin/cos has grown by 360°.";
    const steps = [`Inside ${z.kind} the coefficient of x is $b = ${fmt(z.b)}$`, `Period $= \\dfrac{360^\\circ}{|b|} = \\dfrac{360}{${fmt(Math.abs(z.b))}} = ${fmt(z.period)}^\\circ$`];
    const right = String(z.period);
    const cand = [
      [String(z.amp), `That is the amplitude. Period is how many degrees one full wave takes: 360 ÷ |b|.`],
      [String(360 * Math.abs(z.b)), `You multiplied instead of dividing. Period = 360 ÷ |b| = ${fmt(z.period)}°.`],
      [String(z.b === 0.5 ? 180 : 180 / Math.abs(z.b) === z.period ? 360 : Math.round(180 / Math.abs(z.b))), `Halving (or doubling) by mistake. Use a full turn: 360 ÷ |b|.`],
      [String(z.max), `That is a y-value on the graph. Period is read from b, along the x-axis.`],
      [String(z.period === 360 ? 180 : 360), z.period === 360 ? `When |b| = 1 the period is a full turn, 360°, not half.` : `When |b| ≠ 1 the period is not a plain full turn. Divide 360 by |b|.`],
      [String(2 * Math.PI / Math.abs(z.b)), `That would be the period in radians. These graphs use degrees: 360 ÷ |b|.`]
    ];
    const wrong = []; const seen = new Set([right]);
    for (const [o, n] of cand) {
      const s = String(+o === +o ? (Number.isInteger(+o) ? String(+o) : fmt(+o)) : o);
      // keep numeric strings tidy
      const opt = String(Number(o) === z.period ? z.period + 90 : (Number.isFinite(+o) ? (Number.isInteger(+o) ? String(+o) : fmt(+o)) : o));
      if (!seen.has(opt) && opt !== right) { seen.add(opt); wrong.push([opt, n]); }
    }
    return { k: "period", mc: true, ctx, z, x: z.period, right, rightWhy: `Right: one full wave needs the angle inside ${z.kind} to grow by a full turn, so divide a full circle (in degrees) by the absolute value of b.`, wrong, q, hint, steps, pic,
      data: { a: z.a, b: z.b, kind: z.kind, d: z.d, amp: z.amp, period: z.period } }; },
  maxmin: r => { const z = niceWave(r), ctx = r.pick(WAVE_CTX), ask = r.pick(["max", "min", "max", "both"]), pic = wavePic(z, ctx, ask === "min" ? ["min"] : ask === "max" ? ["max"] : ["max", "min"]);
    if (ask === "both") {
      const ans = `${fmt(z.max)}, ${fmt(z.min)}`;
      const slips = [
        [`${fmt(z.min)}, ${fmt(z.max)}`, "Those are swapped. Type the greatest value first, then the least."],
        [`${fmt(z.amp)}, ${fmt(-z.amp)}`, `That forgets the vertical shift d = ${z.d}. Max = d + |a|, min = d − |a|.`],
        [`${fmt(z.max)}, ${fmt(z.d)}`, `The least value is the middle line minus the amplitude, not the middle itself.`],
        [`${fmt(z.d)}, ${fmt(z.min)}`, `The greatest value is the middle line plus the amplitude, not the middle itself.`],
        [`${fmt(z.max + 1)}, ${fmt(z.min)}`, `The maximum is off by one. Max = d + |a| = ${fmt(z.max)}.`],
        [`${fmt(z.max)}, ${fmt(z.min - 1)}`, `The minimum is off by one. Min = d − |a| = ${fmt(z.min)}.`]
      ];
      const clean = [], seen = new Set([ans]);
      for (const [v, n] of slips) { if (!seen.has(v) && n && n.length >= 20) { seen.add(v); clean.push([v, n]); } }
      return { k: "range", mc: false, pair: true, ctx, z, x: z.max, y: z.min, a: ans,
        q: `Find the maximum and minimum values of ${waveEqShow(z)} (type max, min like 5, -1).`,
        hint: "Max = d + |a|, min = d − |a|.",
        steps: [`$|a| = ${z.amp}$, vertical shift $d = ${z.d}$`, `Maximum $= d + |a| = ${fmt(z.max)}$`, `Minimum $= d - |a| = ${fmt(z.min)}$`],
        pic, data: { a: z.a, b: z.b, kind: z.kind, d: z.d, amp: z.amp, period: z.period, max: z.max, min: z.min },
        slips: clean }; }
    const want = ask === "max" ? z.max : z.min;
    const label = ask === "max" ? "maximum" : "minimum";
    const slips = [
      [ask === "max" ? z.min : z.max, `That is the ${ask === "max" ? "minimum" : "maximum"}. The ${label} is d ${ask === "max" ? "+" : "−"} |a| = ${fmt(want)}.`],
      [z.amp, `That is only the amplitude. ${ask === "max" ? "Add" : "Subtract"} it ${ask === "max" ? "to" : "from"} the shift d = ${z.d}.`],
      [z.d, `That is the middle line. The ${label} sits |a| away from it.`],
      [z.d + z.a, z.a >= 0 && ask === "max" ? `Close — but write it as d+|a|. Here that is ${fmt(want)}.` : `Use |a|, not a with its sign: ${label} = ${fmt(want)}.`],
      [want === 0 ? 1 : -want, `Check the sign carefully: the ${label} is ${fmt(want)}.`]
    ].filter(([v]) => v !== want);
    return { k: ask, mc: false, ctx, z, x: want,
      q: `${ctx.who} graphs ${waveEqShow(z)} for ${ctx.of}. What is the ${label} value of y?`,
      hint: `${ask === "max" ? "Maximum" : "Minimum"} = d ${ask === "max" ? "+" : "−"} |a|.`,
      steps: [`$|a| = ${z.amp}$, $d = ${z.d}$`, `${label[0].toUpperCase() + label.slice(1)} $= ${z.d} ${ask === "max" ? "+" : "-"} ${z.amp} = ${fmt(want)}$`],
      pic, data: { a: z.a, b: z.b, kind: z.kind, d: z.d, amp: z.amp, period: z.period, max: z.max, min: z.min }, slips }; },
  match: r => { const z = niceWave(r), ctx = r.pick(WAVE_CTX);
    const key = g => `${g.a}|${g.b}|${g.kind}|${g.d}`;
    const mk = (a, b, kind, d) => { const { amp, period } = ampPeriod(a, b); return { a, b, kind, d, amp, period, max: d + amp, min: d - amp }; };
    const graphs = [z];
    const seen = new Set([key(z)]);
    const candidates = [
      mk(-z.a, z.b, z.kind, z.d),
      mk(z.a, z.b === 1 ? 2 : 1, z.kind, z.d),
      mk(z.a, z.b, z.kind === "sin" ? "cos" : "sin", z.d),
      mk(z.a, z.b, z.kind, z.d === 0 ? r.pick([-2, 2]) : 0),
      mk(z.a === 1 ? 2 : 1, z.b, z.kind, z.d),
      mk(z.a, z.b === 0.5 ? 2 : 0.5, z.kind, z.d)
    ];
    for (const g of r.shuffle(candidates)) if (!seen.has(key(g)) && graphs.length < 4) { seen.add(key(g)); graphs.push(g); }
    while (graphs.length < 4) {
      const g = niceWave(r); if (!seen.has(key(g))) { seen.add(key(g)); graphs.push(g); }
    }
    const ids = ["g1", "g2", "g3", "g4"], order = r.shuffle([0, 1, 2, 3]), rightId = ids[order.indexOf(0)];
    const optPics = {};
    order.forEach((gi, i) => { const g = graphs[gi]; optPics[ids[i]] = svgWave(" ", g.a, g.b, g.kind, g.d, { small: true, marks: [{ n: "M", x: (g.kind === "sin" ? (g.a >= 0 ? 90 : 270) : (g.a >= 0 ? 0 : 180)) / Math.abs(g.b), y: g.max, lab: "" }] }); });
    const wrong = ids.filter(id => id !== rightId).map(id => {
      const g = graphs[order[ids.indexOf(id)]];
      return [id, `That wave has a = ${g.a}, b = ${fmt(g.b)}, ${g.kind}, shift ${g.d}. Match a = ${z.a}, b = ${fmt(z.b)}, ${z.kind}, and d = ${z.d}.`];
    });
    return { k: "match", mc: true, ctx, z, right: rightId, rightWhy: `Right: this wave matches the amplitude, the period from b, whether it starts like ${z.kind}, and the vertical shift of the given equation.`, wrong,
      q: `Which graph shows ${waveEqShow(z)} for ${ctx.of}?`,
      hint: "Check amplitude (height), period (how stretched), sin vs cos (shape at x = 0), and any up/down shift.",
      steps: [`$|a| = ${z.amp}$ → height ${z.amp}`, `Period $= ${fmt(z.period)}^\\circ$ from $b = ${fmt(z.b)}$`, `${z.kind} with shift $d = ${z.d}$`, `Pick the graph that matches all four.`],
      pic: "", optPics, data: { a: z.a, b: z.b, kind: z.kind, d: z.d, amp: z.amp, period: z.period, order: order.map(i => key(graphs[i])) } }; },
  read: r => { const z = niceWave(r), ctx = r.pick(WAVE_CTX), mode = r.pick(["yint", "yint", "crest", "point"]);
    if (mode === "yint") {
      const y0 = waveY(z, 0), pic = wavePic(z, ctx, ["y", "max"]);
      const slips = [
        [z.d, `That is the middle line d. At x = 0 the ${z.kind} value is ${z.kind === "sin" ? "0" : "1"}, so y = ${fmt(y0)}.`],
        [z.max, `That is the crest. The y-intercept is where the curve meets the y-axis (x = 0).`],
        [z.amp, `That is the amplitude. Substitute x = 0 into the equation.`],
        [z.min, `That is the trough. The y-intercept is the height when x = 0.`],
        [y0 === 0 ? 1 : -y0, `Check the sign at x = 0: y = ${fmt(y0)}.`],
        [y0 + 1, `Read carefully at x = 0: substitute into the equation to get ${fmt(y0)}.`],
        [y0 - 1, `A slip of 1. At x = 0 the curve meets the y-axis at ${fmt(y0)}.`]
      ].filter(([v]) => v !== y0);
      return { k: "yint", mc: false, ctx, z, x: y0,
        q: `The graph shows ${ctx.of} at ${ctx.spot}. What is the y-intercept?`,
        hint: "The y-intercept is the value of y when x = 0. Read it off the axis or substitute into the equation.",
        steps: [`At $x = 0$: $y = ${z.a}\\${z.kind} 0 ${z.d ? (z.d < 0 ? `- ${Math.abs(z.d)}` : `+ ${z.d}`) : ""} = ${fmt(y0)}$`, `So the graph meets the y-axis at $(0,\\ ${fmt(y0)})$.`],
        pic, data: { a: z.a, b: z.b, kind: z.kind, d: z.d, amp: z.amp, period: z.period, y0 }, slips }; }
    if (mode === "crest") {
      const pic = wavePic(z, ctx, ["max"]);
      const slips = [
        [z.min, `That is the trough (lowest point). The crest is the highest y-value, ${fmt(z.max)}.`],
        [z.amp, `That is only the amplitude. The crest sits at d + |a| = ${fmt(z.max)}.`],
        [z.d, `That is the middle of the wave. The crest is |a| above it.`],
        [z.max === 0 ? 1 : -z.max, `The crest height is ${fmt(z.max)} — check the sign.`],
        [z.max + 1, `Off by one. The crest is d + |a| = ${fmt(z.max)}.`],
        [z.max - 1 === z.d ? z.max + 2 : z.max - 1, `Read the marked crest carefully: it is ${fmt(z.max)}.`]
      ].filter(([v]) => v !== z.max);
      return { k: "crest", mc: false, ctx, z, x: z.max,
        q: `Read the greatest y-value (the crest) marked on the graph of ${ctx.of}.`,
        hint: "The crest is the highest point on the wave: d + |a|.",
        steps: [`Crest $= d + |a| = ${z.d} + ${z.amp} = ${fmt(z.max)}$`],
        pic, data: { a: z.a, b: z.b, kind: z.kind, d: z.d, amp: z.amp, period: z.period, max: z.max }, slips }; }
    // marked point: often the first positive peak or a nice angle
    let x = z.kind === "sin" ? (90 / Math.abs(z.b)) : (z.a >= 0 ? 0 : 180 / Math.abs(z.b));
    if (x === 0) x = 90 / Math.abs(z.b);
    const y = waveY(z, x);
    const pic = svgWave(ctx.title, z.a, z.b, z.kind, z.d, { marks: [{ n: "P", x, y, lab: `P(${fmt(x)}°, ?)` }], periods: 1 });
    const slips = [
      [z.max, `That is the crest height, but point P is at x = ${fmt(x)}°. Substitute carefully.`],
      [z.d, `That is the middle line. At x = ${fmt(x)}°, y = ${fmt(y)}.`],
      [waveY(z, 0), `That is the y-intercept (x = 0). Point P sits at x = ${fmt(x)}°.`],
      [z.min, `That is the trough. Point P is marked at x = ${fmt(x)}°, where y = ${fmt(y)}.`],
      [y === 0 ? 1 : rd(-y, 4), `Check the sign of ${z.kind} at ${fmt(x)}°.`],
      [rd(y + 1, 4), `Close, but off by one. Substitute x = ${fmt(x)}° into the equation.`],
      [rd(y - 1, 4), `A slip of 1. The height at P is ${fmt(y)}.`]
    ].filter(([v]) => Math.abs(v - y) > 1e-9);
    return { k: "point", mc: false, ctx, z, x: y,
      q: `Point P is marked on the graph of ${ctx.of}. What is the y-coordinate of P?`,
      hint: `Read x = ${fmt(x)}° from the label, then find y from the equation or the height on the axis.`,
      steps: [`$x = ${fmt(x)}^\\circ$`, `$y = ${z.a}\\${z.kind}(${fmt(z.b)}\\times${fmt(x)}) ${z.d ? (z.d < 0 ? `- ${Math.abs(z.d)}` : `+ ${z.d}`) : ""} = ${fmt(y)}$`],
      pic, data: { a: z.a, b: z.b, kind: z.kind, d: z.d, amp: z.amp, period: z.period, px: x, py: y }, slips }; },
  word: r => {
    // force a>0 and d so height stays positive for kid contexts
    let z, guard = 0;
    do { z = niceWave(r); z = Object.assign({}, z, { a: Math.abs(z.a) || 2 }); Object.assign(z, ampPeriod(z.a, z.b), { max: z.d + Math.abs(z.a), min: z.d - Math.abs(z.a) }); z.amp = Math.abs(z.a);
      if (z.min < 0) { z.d = Math.abs(z.a) + r.int(1, 3); z.max = z.d + z.amp; z.min = z.d - z.amp; }
      guard++;
    } while ((z.min < 0 || z.amp < 1) && guard < 30);
    const ctx = r.pick(WAVE_CTX.filter(c => c.id !== "ribbon").concat(WAVE_CTX[4])), ask = r.pick(["amp", "period", "max", "amp", "max"]);
    const pic = wavePic(z, ctx, ask === "period" ? ["max"] : ["max", "min"]);
    const eq = waveEqShow(z);
    if (ask === "amp") {
      const slips = [
        [2 * z.amp, `That is the full up-and-down span. Amplitude is the distance from the middle to a crest: ${z.amp} ${ctx.unit}.`],
        [z.max, `That is the greatest height. Amplitude is how far the wave rises above its middle line.`],
        [z.period, `That is the period in degrees, not a height.`],
        [z.d, `That is the middle height. Amplitude is |a| = ${z.amp} ${ctx.unit}.`]
      ].filter(([v]) => v !== z.amp);
      return { k: "word-amp", mc: false, ctx, z, x: z.amp,
        q: `${ctx.who} models ${ctx.of} at ${ctx.spot} with ${eq} (${ctx.unit}). How many ${ctx.unit} is the amplitude?`,
        hint: "Amplitude is |a|, the height of the wave above its middle line.",
        steps: [`Amplitude $= |a| = ${z.amp}$ ${ctx.unit}`],
        pic, data: { a: z.a, b: z.b, kind: z.kind, d: z.d, amp: z.amp, period: z.period, max: z.max, min: z.min }, slips }; }
    if (ask === "period") {
      const slips = [
        [z.amp, `That is the amplitude in ${ctx.unit}. Period is 360 ÷ |b| degrees.`],
        [360 * Math.abs(z.b), `Multiply was upside down. Period = 360 ÷ |b| = ${fmt(z.period)}°.`],
        [z.period === 360 ? 180 : 360, `Use 360 ÷ |b| = ${fmt(z.period)}°, not a guess of a half or full turn.`],
        [z.max, `That is a height. Period is how many degrees one full wave takes.`]
      ].filter(([v]) => v !== z.period);
      return { k: "word-period", mc: false, ctx, z, x: z.period,
        q: `At ${ctx.spot}, ${ctx.of} follows ${eq}. How many degrees is one full period?`,
        hint: "Period = 360° ÷ |b|.",
        steps: [`Period $= 360 \\div ${fmt(Math.abs(z.b))} = ${fmt(z.period)}^\\circ$`],
        pic, data: { a: z.a, b: z.b, kind: z.kind, d: z.d, amp: z.amp, period: z.period, max: z.max, min: z.min }, slips }; }
    const slips = [
      [z.amp, `That is only the amplitude. The greatest height is the middle plus the amplitude: ${fmt(z.max)} ${ctx.unit}.`],
      [z.min, `That is the lowest height. The question asks for the greatest.`],
      [z.d, `That is the middle height. Add the amplitude to reach the crest.`],
      [z.max + z.amp, `That adds the amplitude twice. Crest = d + |a| = ${fmt(z.max)}.`]
    ].filter(([v]) => v !== z.max);
    return { k: "word-max", mc: false, ctx, z, x: z.max,
      q: `${ctx.who} watches ${ctx.of} follow ${eq} (${ctx.unit}). What is the greatest height, in ${ctx.unit}?`,
      hint: "Greatest height = d + |a|.",
      steps: [`$d = ${z.d}$, $|a| = ${z.amp}$`, `Greatest height $= ${z.d} + ${z.amp} = ${fmt(z.max)}$ ${ctx.unit}`],
      pic, data: { a: z.a, b: z.b, kind: z.kind, d: z.d, amp: z.amp, period: z.period, max: z.max, min: z.min }, slips };
  }
};
const WAVE_KINDS = ["amp", "amp", "period", "period", "maxmin", "maxmin", "maxmin", "match", "match", "read", "read", "word", "word", "word"];
const waveQ = (r, kind) => {
  const z = WAVE[kind](r), ctx = z.ctx, uid = `triggraph|${z.k}|${JSON.stringify(z.data)}`;
  const extra = { uid, pic: z.pic || "", data: Object.assign({ triggraph: z.k, ctx: ctx.id }, z.data) };
  if (z.optPics) extra.optPics = z.optPics;
  if (z.mc) return mcqWhy(r, z.q, z.right, z.rightWhy, z.wrong, z.hint, z.steps, extra);
  if (z.pair) return Q(Object.assign({ q: z.q, kind: "pair", val: [z.x, z.y], a: z.a, keys: ["-", ","], hint: z.hint, steps: z.steps, slips: z.slips }, extra));
  return numWhy(z.q, z.x, z.hint, z.steps, z.slips, Object.assign({ keys: ["-", "."] }, extra));
};
topic(10, "triggraph", "Wave Pier", "🌊", "Bonus from Additional Mathematics: sine and cosine graphs, amplitude, period, max and min", r => waveQ(r, r.pick(WAVE_KINDS)), { extra: "amath" });

topic(10, "prob2", "Two-Draw Treasure", "💰", "Combined probability", r => {
  const g = r.int(2, 7), s = r.int(2, 7), n = g + s, repl = r.chance(.5), both = r.pick(["gold", "silver"]), k = both === "gold" ? g : s;
  const n1 = repl ? k * k : k * (k - 1), den = repl ? n * n : n * (n - 1);
  return Q({ q: `A chest has ${g} gold and ${s} silver coins. Two coins are taken ${repl ? "with replacement" : "without replacement"}. Find P(both ${both}). (fraction)`, val: n1 / den, a: fracStr(n1, den), keys: ["/"], hint: repl ? "The coin goes back → the second draw is just like the first." : `Without replacement → one fewer coin (and one fewer ${both}) for the second draw.`,
    steps: [`$P = \\frac{${k}}{${n}} \\times \\frac{${repl ? k : k - 1}}{${repl ? n : n - 1}} = ${fracTex(n1, den)}$`], data: { g, s, repl, both } });
});
topic(10, "freq", "Frequency Fair", "🎪", "Mean from a frequency table", r => {
  const x0 = r.int(0, 2), xs = [0, 1, 2, 3, 4].map(x => x + x0), fs = xs.map(() => r.int(1, 9)), { N, S } = freqTotals(xs, fs);
  return num(`The table shows how many wishes each villager made. Find the mean number of wishes (2 d.p.).`, rd(S / N, 2), "Mean = Σ(f × x) ÷ Σf", [`$\\Sigma fx = ${xs.map((x, i) => `${x} \\times ${fs[i]}`).join(" + ")} = ${S}$`, `$\\Sigma f = ${N}$`, `Mean $= ${S} \\div ${N} \\approx ${fdp(S / N, 2)}$`], { a: fdp(S / N, 2), keys: ["."], tol: 0.0051, pic: table(["Wishes (x)", ...xs], [["Villagers (f)", ...fs]]), data: { xs, fs } });
});
/* ---------- 🪁 Kite-Festival Spread (MOE Sec 4 statistics: quartiles and the interquartile range of a list, reading
   box-and-whisker plots, the quarters of the data a box plot shows, reading the median, quartiles and "how many more than"
   off a cumulative frequency curve, standard deviation of a list and of a frequency table, and comparing two box plots
   (average and consistency)). Quartiles of a list use the MOE way: the median of the lower and the upper half, leaving the
   middle value out when there is an odd number. Standard deviation is σ = √(Σx²/n − x̄²). Box plots and curves are drawn to
   scale on a labelled number line, so every value can be read off the scale; tick labels carry class xt + data-v, and the
   plot parts carry classes (bwl/bbox/bmed/bwr, cfpt), so tests read the figure back. */
const SPREAD_CTX = [
  { id: "kite", items: "kites", what: "height", unit: "m", lo: 0, hi: 60, major: 10, minor: 2, title: "Kite festival heights", axis: "Height (m)", list: "the heights (in m) reached by the kites at the school kite festival", teams: ["Team Breeze", "Team Twirl"] },
  { id: "cube", items: "players", what: "time", unit: "s", lo: 20, hi: 80, major: 10, minor: 2, title: "Puzzle-cube times", axis: "Time (s)", list: "the times (in s) taken by the players to solve the puzzle cube at the Maths Fair", teams: ["Club Comet", "Club Pixel"] },
  { id: "flower", items: "sunflowers", what: "height", unit: "cm", lo: 100, hi: 220, major: 20, minor: 4, title: "School garden sunflowers", axis: "Height (cm)", list: "the heights (in cm) of the sunflowers in the school garden", teams: ["Bed Sunny", "Bed Honey"] },
  { id: "jump", items: "jumpers", what: "distance", unit: "cm", lo: 250, hi: 400, major: 25, minor: 5, title: "Sports-day long jump", axis: "Distance (cm)", list: "the long-jump distances (in cm) on sports day", teams: ["Red House", "Blue House"] }
];
const withU = (c, v) => `${fmt(v)} ${c.unit}`;
// quartiles the MOE way: the medians of the lower and upper halves (the middle value left out when n is odd)
const quartiles = xs => { const s = asc(xs), h = Math.floor(s.length / 2); return { s, q1: median(s.slice(0, h)), q2: median(s), q3: median(s.slice(s.length - h)) }; };
// a labelled number line along y from lo to hi (px x0 → x1): minor ticks, labelled major ticks; returns [svg, X(value)]
const numLine = (x0, x1, y, lo, hi, major, minor, unit) => { const X = v => f1(x0 + (v - lo) / (hi - lo) * (x1 - x0)); let s = `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="#b9a6cc" stroke-width="2"/>`;
  for (let v = lo; v <= hi + 1e-9; v += minor) { const big = Math.abs((v - lo) / major - Math.round((v - lo) / major)) < 1e-9;
    s += `<line x1="${X(v)}" y1="${y}" x2="${X(v)}" y2="${y + (big ? 6 : 3.5)}" stroke="#b9a6cc" stroke-width="${big ? 1.6 : 1}"/>`;
    if (big) s += `<text class="xt" data-v="${fmt(v)}" x="${X(v)}" y="${y + 17}" font-size="9.5" text-anchor="middle" font-weight="800" fill="${INK}">${fmt(v)}</text>`; }
  return [s + xUnit(f1((x0 + x1) / 2), y + 31, unit), X]; };
// one box-and-whisker plot (five = [min, Q1, median, Q3, max]) centred on height y, with an optional name above it
const boxPlot = (X, y, five, fill, name) => { const [a, b, m, c, d] = five.map(X), h = 26;
  return `<g class="bplot" data-n="${esc(name || "")}">${name ? `<text x="${f1(Math.max(30, a))}" y="${y - h / 2 - 6}" font-size="10.5" font-weight="900" fill="${INK}">${esc(name)}</text>` : ""}` +
    `<line class="bwl" x1="${a}" y1="${y}" x2="${b}" y2="${y}" stroke="${INK}" stroke-width="2.2"/><line class="bwr" x1="${c}" y1="${y}" x2="${d}" y2="${y}" stroke="${INK}" stroke-width="2.2"/>` +
    [a, d].map(x => `<line x1="${x}" y1="${y - 8}" x2="${x}" y2="${y + 8}" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`).join("") +
    `<rect class="bbox" x="${b}" y="${y - h / 2}" width="${f1(c - b)}" height="${h}" rx="4" fill="${fill}" stroke="${INK}" stroke-width="2.2"/><line class="bmed" x1="${m}" y1="${y - h / 2}" x2="${m}" y2="${y + h / 2}" stroke="#ff6f91" stroke-width="3" stroke-linecap="round"/></g>`; };
const svgBoxPlots = (c, plots) => { const H = plots.length > 1 ? 196 : 146, axY = H - 44, [axis, X] = numLine(32, 272, axY, c.lo, c.hi, c.major, c.minor, c.axis);
  const body = plots.map((p, i) => boxPlot(X, plots.length > 1 ? 66 + i * 52 : 70, p.five, PASTEL[[1, 0][i] || 2], p.name)).join("");
  return cardSvg(300, H, c.title, 20, `<g class="vgrid">${Array.from({ length: Math.round((c.hi - c.lo) / c.major) + 1 }, (_, i) => `<line x1="${X(c.lo + i * c.major)}" y1="34" x2="${X(c.lo + i * c.major)}" y2="${axY}" stroke="#F3ECFA" stroke-width="1"/>`).join("")}</g>${body}${axis}`, "box-and-whisker plot", "mpic chart spread"); };
// a cumulative frequency curve through (boundary, cf) points: a smooth monotone curve (Fritsch–Carlson) with the points dotted
const svgCF = (c, bs, cf) => { const n = cf[cf.length - 1], x0 = 44, x1 = 282, top = 40, bot = 186, [grid, Y] = axes(x0, x1, top, bot, n, n / 8);
  const X = v => f1(x0 + (v - bs[0]) / (bs[bs.length - 1] - bs[0]) * (x1 - x0)), P = bs.map((b, i) => [X(b), Y(cf[i])]);
  const d = P.slice(1).map((p, i) => (p[1] - P[i][1]) / (p[0] - P[i][0])), m = P.map((_, i) => i === 0 ? d[0] : i === P.length - 1 ? d[d.length - 1] : d[i - 1] * d[i] <= 0 ? 0 : 2 / (1 / d[i - 1] + 1 / d[i]));
  let path = `M${P[0][0]},${P[0][1]}`; for (let i = 0; i < P.length - 1; i++) { const h = (P[i + 1][0] - P[i][0]) / 3; path += ` C${f1(P[i][0] + h)},${f1(P[i][1] + h * m[i])} ${f1(P[i + 1][0] - h)},${f1(P[i + 1][1] - h * m[i + 1])} ${P[i + 1][0]},${P[i + 1][1]}`; }
  const xs = xTicks(bs.map(b => [X(b), b, b]), top, bot, "#F3ECFA", 15, "xt");
  return cardSvg(300, 228, c.title, 18, `${yUnit("Cumulative frequency")}${grid}${xs}${xUnit(f1((x0 + x1) / 2), bot + 30, c.axis)}` +
    `<path class="cfcurve" d="${path}" fill="none" stroke="#ff8fa3" stroke-width="3" stroke-linecap="round"/>` + P.map((p, i) => `<circle class="cfpt" data-x="${bs[i]}" data-y="${cf[i]}" cx="${p[0]}" cy="${p[1]}" r="3.6" fill="#fff" stroke="#ff6f91" stroke-width="2.2"/>`).join(""), "cumulative frequency curve", "mpic chart spread"); };
// a five-number summary on the context's minor-tick grid: min < Q1 < median < Q3 < max, each gap at least 2 small ticks
const fiveNums = (r, c) => { const S = Math.round((c.hi - c.lo) / c.minor); for (;;) { const g = [r.int(0, 6), r.int(2, 8), r.int(2, 7), r.int(2, 7), r.int(2, 8)], idx = g.map((_, i) => sum(g.slice(0, i + 1)));
  if (idx[4] <= S) return idx.map(i => c.lo + i * c.minor); } };
const PART = ["the lowest quarter (from the minimum to Q1)", "the second quarter (from Q1 to the median)", "the third quarter (from the median to Q3)", "the top quarter (from Q3 to the maximum)"];
const QUARTER_WORD = { 1: "a quarter", 2: "half", 3: "three quarters" };
const SPREAD = {
  // quartiles / IQR of a list
  list: (r, c) => { const n = r.int(7, 12); let xs, Qs; do { xs = Array.from({ length: n }, () => r.int(c.lo + c.minor, c.hi - c.minor)); Qs = quartiles(xs); } while (!(Qs.q1 < Qs.q2 && Qs.q2 < Qs.q3));
    const k = r.pick(["q1", "q3", "iqr", "iqr"]), { s, q1, q2, q3 } = Qs, h = Math.floor(n / 2), lowH = s.slice(0, h), upH = s.slice(n - h), x = k === "iqr" ? q3 - q1 : Qs[k];
    const inQ = n % 2 ? { q1: median(s.slice(0, h + 1)), q3: median(s.slice(h)) } : null, raw = { q1: median(xs.slice(0, h)), q3: median(xs.slice(n - h)) };
    const name = { q1: "the lower quartile Q1", q3: "the upper quartile Q3", iqr: "the interquartile range" }[k];
    const steps = [`Sort the ${n} values: ${s.join(", ")}`, `Median (middle of all ${n}): ${fmt(q2)}`, `Lower half${n % 2 ? " (leave out the middle value)" : ""}: ${lowH.join(", ")} → Q1 = ${fmt(q1)}`, `Upper half: ${upH.join(", ")} → Q3 = ${fmt(q3)}`].concat(k === "iqr" ? [`IQR = Q3 − Q1 = ${fmt(q3)} − ${fmt(q1)} = ${fmt(x)} ${c.unit}`] : []);
    const slips = k === "iqr" ? [[s[n - 1] - s[0], "That is the range (largest − smallest). The interquartile range uses the quartiles: Q3 − Q1."], [q3, `${fmt(q3)} is Q3 on its own. Take away Q1 to get the interquartile range.`], [q3 - q2, "That is Q3 − median, only the top half of the box. The IQR is Q3 − Q1."], [raw.q3 - raw.q1, "Sort the values first! The quartiles come from the sorted list, not the order they were written in."]].concat(inQ ? [[inQ.q3 - inQ.q1, "That keeps the middle value in both halves. With an odd number of values, leave the median out of the halves."]] : [])
      : [[q2, `${fmt(q2)} is the median (the middle of all the values). ${k === "q1" ? "Q1 is the middle of the lower half." : "Q3 is the middle of the upper half."}`], [raw[k], "Sort the values first! The quartiles come from the sorted list, not the order they were written in."], [Qs[k === "q1" ? "q3" : "q1"], `That is ${k === "q1" ? "Q3, the upper quartile" : "Q1, the lower quartile"}. ${k === "q1" ? "Q1 is the middle of the lower half." : "Q3 is the middle of the upper half."}`]].concat(inQ ? [[inQ[k], "That keeps the middle value in the half. With an odd number of values, leave the median out, then find the middle of the half."]] : []);
    return { k, x, data: { xs, n }, q: `Here are ${c.list}: ${xs.join(", ")}. Find ${name}${k === "iqr" ? ` in ${c.unit}` : ""}.`, hint: "Sort the values, find the median, then the middle of the lower half (Q1) and of the upper half (Q3).", steps, slips }; },
  // read the median / IQR / range off one box plot
  boxread: (r, c) => { const five = fiveNums(r, c), [a, b, m, q, d] = five, k = r.pick(["med", "iqr", "iqr", "range"]), x = { med: m, iqr: q - b, range: d - a }[k];
    const name = { med: "the median", iqr: "the interquartile range", range: "the range" }[k], read = `Read the plot: minimum ${a}, Q1 ${b}, median ${m}, Q3 ${q}, maximum ${d} (${c.unit}).`;
    const steps = [read].concat(k === "med" ? [`The median is the line inside the box: ${withU(c, m)}`] : k === "iqr" ? [`IQR = Q3 − Q1 = ${q} − ${b} = ${withU(c, x)} (the width of the box)`] : [`Range = maximum − minimum = ${d} − ${a} = ${withU(c, x)} (whisker end to whisker end)`]);
    const slips = k === "med" ? [[(b + q) / 2, "The median line isn't always in the middle of the box. Read where the pink line is."], [b, `${b} is Q1, the left edge of the box. The median is the line inside the box.`], [q, `${q} is Q3, the right edge of the box. The median is the line inside the box.`], [(a + d) / 2, "Halfway between the whisker ends isn't the median. Read the pink line inside the box."]]
      : k === "iqr" ? [[d - a, "That is the range (whisker end to whisker end). The IQR is the width of the box: Q3 − Q1."], [q, `${q} is Q3 on its own. Take away Q1, the left edge of the box.`], [q - m, "That is only the right part of the box (Q3 − median). The IQR is the whole box: Q3 − Q1."], [m - b, "That is only the left part of the box (median − Q1). The IQR is the whole box: Q3 − Q1."]]
      : [[q - b, "That is the interquartile range (the box). The range goes from the end of one whisker to the end of the other."], [d, `${d} is the maximum on its own. Take away the minimum.`], [d - b, "The range starts at the minimum (the left whisker end), not at Q1."]];
    return { k, x, five, data: { five }, pic: svgBoxPlots(c, [{ five }]), q: `The box plot shows ${c.list}. Find ${name}${k === "med" ? "" : ` in ${c.unit}`}.`, hint: "Left whisker end = minimum, box edges = Q1 and Q3, line in the box = median, right whisker end = maximum.", steps, slips }; },
  // how many values lie in a part of the box plot (each quarter holds about a quarter of the data)
  boxpct: (r, c) => { const five = fiveNums(r, c), [a, b, m, q, d] = five, n = 4 * r.int(5, 30);
    const R = r.pick([[`more than ${withU(c, b)}`, [1, 2, 3]], [`less than ${withU(c, m)}`, [0, 1]], [`between ${withU(c, b)} and ${withU(c, q)}`, [1, 2]], [`more than ${withU(c, q)}`, [3]], [`less than ${withU(c, q)}`, [0, 1, 2]], [`less than ${withU(c, b)}`, [0]], [`more than ${withU(c, m)}`, [2, 3]]]);
    const parts = R[1].length, x = n * parts / 4, note = k => `${k === 4 ? `${n} is all of the ${c.items}.` : `${QUARTER_WORD[k][0].toUpperCase() + QUARTER_WORD[k].slice(1)} of ${n} is ${n * k / 4}.`} "${R[0]}" covers ${parts} of the four quarters: ${R[1].map(i => PART[i]).join(", ")}.`;
    return { k: R[1].join(""), x, five, data: { five, n, parts: R[1] }, pic: svgBoxPlots(c, [{ five }]), q: `The box plot shows ${c.list}. There were ${n} ${c.items}. About how many had a ${c.what} of ${R[0]}?`, hint: "The minimum, Q1, the median, Q3 and the maximum cut the data into four quarters, each with about a quarter of the values.",
      steps: [`Minimum ${a}, Q1 ${b}, median ${m}, Q3 ${q}, maximum ${d}.`, `${R[0][0].toUpperCase() + R[0].slice(1)} covers ${parts} quarter${parts > 1 ? "s" : ""} of the data: ${R[1].map(i => PART[i]).join(", ")}.`, `${parts} × ${n} ÷ 4 = ${x} ${c.items}`],
      slips: [1, 2, 3, 4].filter(k => k !== parts).map(k => [n * k / 4, note(k)]) }; },
  // the cumulative frequency curve: the median, a quartile, the IQR, or how many more / at most a value
  cf: (r, c, kind) => { const n = r.pick([40, 80, 120]), w = (c.hi - c.lo) / 6, bs = Array.from({ length: 7 }, (_, i) => c.lo + i * w); let pos; do pos = [r.int(1, 5), r.int(1, 5), r.int(1, 5)].sort((a, b) => a - b); while (!(pos[0] < pos[1] && pos[1] < pos[2]));
    const cf = Array(7).fill(null); cf[0] = 0; cf[6] = n; pos.forEach((p, i) => { cf[p] = n * (i + 1) / 4; });
    for (let i = 1; i < 6; i++) if (cf[i] === null) { let j = i; while (cf[j] === null) j++; const span = j - i + 1, lo = cf[i - 1], hiV = cf[j], room = hiV - lo - span; cf[i] = lo + 1 + r.int(Math.floor(room * .2), Math.floor(room / span)); }
    const [i1, i2, i3] = pos, Q1 = bs[i1], Q2 = bs[i2], Q3 = bs[i3], base = { five: null, pic: svgCF(c, bs, cf), data: { bs, cf, n } }, read = (f, v) => `Go across from ${f} on the cumulative frequency axis to the curve, then down: ${withU(c, v)}`;
    if (kind === "cfmore") { const j = r.int(1, 5), more = r.chance(.6), x = more ? n - cf[j] : cf[j];
      return Object.assign(base, { k: more ? "more" : "atmost", x, data: Object.assign(base.data, { j }), q: `The cumulative frequency curve shows ${c.list} (${n} ${c.items} in all). How many ${c.items} had a ${c.what} of ${more ? "more than" : "at most"} ${withU(c, bs[j])}?`, hint: `Go up from ${withU(c, bs[j])} to the curve and across: that is how many had ${withU(c, bs[j])} or less.`,
        steps: [`Go up from ${bs[j]} to the curve, then across: ${cf[j]} ${c.items} had ${withU(c, bs[j])} or less.`].concat(more ? [`More than ${withU(c, bs[j])}: ${n} − ${cf[j]} = ${x} ${c.items}`] : [`At most ${withU(c, bs[j])} means ${withU(c, bs[j])} or less: ${x} ${c.items}`]),
        slips: (more ? [[cf[j], `${cf[j]} is how many had ${withU(c, bs[j])} or less. Take it away from ${n} to find how many had more.`]] : [[n - cf[j], `${n - cf[j]} is how many had more than ${withU(c, bs[j])}. "At most" means that value or less: read straight off the curve.`]]).concat([[n, `${n} is everyone. Read the curve at ${withU(c, bs[j])}.`], [more ? n - cf[j - 1] : cf[j + 1], "That reads the curve at the next grid line. Go up exactly from " + withU(c, bs[j]) + "."]]) }); }
    if (kind === "cfiqr") return Object.assign(base, { k: "iqr", x: Q3 - Q1, q: `The cumulative frequency curve shows ${c.list} (${n} ${c.items} in all). Estimate the interquartile range in ${c.unit}.`, hint: `Q1 is at the ${n / 4}th value (¼ of ${n}) and Q3 at the ${3 * n / 4}th (¾ of ${n}). IQR = Q3 − Q1.`,
      steps: [`¼ × ${n} = ${n / 4}: ${read(n / 4, Q1)} → Q1 = ${withU(c, Q1)}`, `¾ × ${n} = ${3 * n / 4}: ${read(3 * n / 4, Q3)} → Q3 = ${withU(c, Q3)}`, `IQR = ${Q3} − ${Q1} = ${withU(c, Q3 - Q1)}`],
      slips: [[n / 2, `${n / 2} is ${3 * n / 4} − ${n / 4}: that subtracts the cumulative frequencies. Read the ${c.what}s on the bottom axis and subtract those.`], [Q3, `${Q3} is Q3 on its own. Take away Q1 too.`], [bs[6] - bs[0], "That is the whole width of the axis. The IQR uses Q1 and Q3 from the curve."], [Q3 - Q2, "That is Q3 − median. The IQR is Q3 − Q1."]] });
    const k = r.pick(["med", "med", "q1", "q3"]), [f, x] = { med: [n / 2, Q2], q1: [n / 4, Q1], q3: [3 * n / 4, Q3] }[k], frac = { med: "½", q1: "¼", q3: "¾" }[k], name = { med: "median", q1: "lower quartile", q3: "upper quartile" }[k];
    return Object.assign(base, { k, x, q: `The cumulative frequency curve shows ${c.list} (${n} ${c.items} in all). Estimate the ${name} ${c.what} in ${c.unit}.`, hint: `The ${name} is the ${f}th value: ${frac} of ${n}. Go across from ${f} to the curve, then down.`,
      steps: [`${frac} × ${n} = ${f}`, read(f, x)], slips: [[f, `${f} is the cumulative frequency (how many ${c.items}). Go across from ${f} to the curve, then down, and read the ${c.what}.`], [(bs[0] + bs[6]) / 2, "The middle of the bottom axis isn't the median. Go across from the cumulative frequency to the curve, then down."]].concat(k === "med" ? [[Q1, `${Q1} is the lower quartile (across from ${n / 4}). The median is across from ${n / 2}.`], [Q3, `${Q3} is the upper quartile (across from ${3 * n / 4}). The median is across from ${n / 2}.`]] : [[Q2, `${Q2} is the median (across from ${n / 2}). The ${name} is across from ${f}.`], k === "q1" ? [Q3, `${Q3} is the upper quartile (across from ${3 * n / 4}). The lower quartile is across from ${n / 4}.`] : [Q1, `${Q1} is the lower quartile (across from ${n / 4}). The upper quartile is across from ${3 * n / 4}.`]]) }); },
  // standard deviation of a list (calculator), σ = √(Σx²/n − x̄²)
  sd: (r, c) => { const n = r.int(5, 8), lo = r.int(2, 12); let xs; do xs = Array.from({ length: n }, () => r.int(lo, lo + 14)); while (new Set(xs).size < 3);
    const S = sum(xs), S2 = sum(xs.map(x => x * x)), mean = S / n, v = S2 / n - mean * mean, sd = Math.sqrt(v), x = rd(sd, 2), sdn1 = Math.sqrt(sum(xs.map(t => (t - mean) ** 2)) / (n - 1)), mad = sum(xs.map(t => Math.abs(t - mean))) / n;
    const ctx = r.pick([["the numbers of kites each member of the kite club flew this term", "kites"], ["the numbers of puzzle cubes each player solved at the Maths Fair", "cubes"], ["the numbers of sunflower seeds that sprouted in each pot", "seeds"], ["the numbers of laps each runner jogged at the sports-day warm-up", "laps"]]);
    return { k: "list", x, tol: .0051, data: { xs }, q: `Here are ${ctx[0]}: ${xs.join(", ")}. Find the standard deviation (2 d.p.).`, hint: "σ = √(Σx² ÷ n − x̄²). Find the mean first.",
      steps: [`n = ${n}, Σx = ${S}, Σx² = ${S2}`, `Mean x̄ = ${S} ÷ ${n} = ${fdp(mean, 4).replace(/\.?0+$/, "")}`, `$\\sigma = \\sqrt{\\frac{${S2}}{${n}} - ${fdp(mean, 4).replace(/\.?0+$/, "")}^2} = \\sqrt{${fdp(v, 4)}} \\approx ${fdp(sd, 2)}$`],
      slips: [[rd(v, 2), `${fdp(v, 2)} is the variance (σ²). Take the square root to get the standard deviation.`], [rd(sdn1, 2), `That divides by n − 1 = ${n - 1}. The O-Level formula divides by n = ${n}.`], [rd(Math.sqrt(S2 / n), 2), "That forgets to take away x̄². Use σ = √(Σx² ÷ n − x̄²)."], [rd(mean, 2), `${fdp(mean, 2)} is the mean. The standard deviation measures how spread out the values are around it.`], [rd(mad, 2), "That is the average distance from the mean. The standard deviation squares the distances first, then takes the square root."]] }; },
  // standard deviation from a frequency table
  sdfreq: (r, c) => { const x0 = r.int(0, 2), xs = [0, 1, 2, 3, 4].map(x => x + x0), fs = xs.map(() => r.int(1, 9)), { N, S, S2 } = freqTotals(xs, fs), mean = S / N, v = S2 / N - mean * mean, sd = Math.sqrt(v), x = rd(sd, 2);
    const ctx = r.pick([["kites each child flew at the festival", "Kites (x)", "Children (f)"], ["puzzle cubes each player solved", "Cubes (x)", "Players (f)"], ["sunflowers each class planted", "Sunflowers (x)", "Classes (f)"], ["medals each house won on sports day", "Medals (x)", "Houses (f)"]]);
    const sdx = Math.sqrt(sum(xs.map(t => t * t)) / 5 - (sum(xs) / 5) ** 2), m = fdp(mean, 4).replace(/\.?0+$/, "");
    return { k: "freq", x, tol: .0051, data: { xs, fs }, pic: table([ctx[1], ...xs], [[ctx[2], ...fs]]), q: `The table shows how many ${ctx[0]}. Find the standard deviation (2 d.p.).`, hint: "σ = √(Σfx² ÷ Σf − x̄²), where x̄ = Σfx ÷ Σf.",
      steps: [`$\\Sigma f = ${N}$, $\\Sigma fx = ${S}$, $\\Sigma fx^2 = ${S2}$`, `Mean x̄ = ${S} ÷ ${N} = ${m}`, `$\\sigma = \\sqrt{\\frac{${S2}}{${N}} - ${m}^2} = \\sqrt{${fdp(v, 4)}} \\approx ${fdp(sd, 2)}$`],
      slips: [[rd(v, 2), `${fdp(v, 2)} is the variance (σ²). Take the square root to get the standard deviation.`], [rd(Math.sqrt(S2 / N), 2), "That forgets to take away x̄². Use σ = √(Σfx² ÷ Σf − x̄²)."], [rd(Math.sqrt((S2 - N * mean * mean) / (N - 1)), 2), `That divides by Σf − 1 = ${N - 1}. The O-Level formula divides by Σf = ${N}.`], [rd(sdx, 2), "That uses the x values on their own. Each value counts as many times as its frequency f."], [rd(mean, 2), `${fdp(mean, 2)} is the mean. The standard deviation measures the spread around it.`]] }; },
  // compare two box plots: which has the higher median, which is more consistent (smaller IQR)
  compare: (r, c) => { let A, B; for (;;) { A = fiveNums(r, c); B = fiveNums(r, c); const dm = Math.abs(A[2] - B[2]), di = Math.abs((A[3] - A[1]) - (B[3] - B[1]));
      if (dm >= 2 * c.minor && di >= 2 * c.minor) break; }
    const [nA, nB] = c.teams, iA = A[3] - A[1], iB = B[3] - B[1], hi = A[2] > B[2] ? nA : nB, lo = hi === nA ? nB : nA, con = iA < iB ? nA : nB, wob = con === nA ? nB : nA;
    const med = { [nA]: A[2], [nB]: B[2] }, iqr = { [nA]: iA, [nB]: iB }, rg = { [nA]: A[4] - A[0], [nB]: B[4] - B[0] }, trap = rg[con] > rg[wob];
    const say = (h, k) => `${h} had the higher median ${c.what}, and ${k} had more consistent ${c.what}s (a smaller interquartile range).`;
    const medWhy = `Compare the pink median lines: ${hi}'s median is ${withU(c, med[hi])} and ${lo}'s is ${withU(c, med[lo])}.`, conWhy = `Consistency is the spread of the middle half, the width of the box: ${con}'s IQR is ${withU(c, iqr[con])} and ${wob}'s is ${withU(c, iqr[wob])}.${trap ? ` (${con}'s whiskers are longer, but the range can be stretched by one extreme value.)` : ""}`;
    return { k: trap ? "trap" : "plain", x: null, mc: true, data: { A, B, teams: c.teams }, pic: svgBoxPlots(c, [{ five: A, name: nA }, { five: B, name: nB }]), q: `The box plots compare ${c.list} for ${nA} and ${nB}. Which statement is correct?`, hint: "Compare the medians (the pink lines) for the average, and the widths of the boxes (the IQRs) for consistency.",
      steps: [`${nA}: median ${withU(c, A[2])}, IQR ${A[3]} − ${A[1]} = ${withU(c, iA)}`, `${nB}: median ${withU(c, B[2])}, IQR ${B[3]} − ${B[1]} = ${withU(c, iB)}`, `${hi} has the higher median; ${con} has the smaller IQR, so its ${c.what}s are more consistent.`],
      right: say(hi, con), rightWhy: `Right: ${hi}'s median (${withU(c, med[hi])}) is higher than ${lo}'s (${withU(c, med[lo])}), and ${con}'s IQR (${withU(c, iqr[con])}) is smaller than ${wob}'s (${withU(c, iqr[wob])}).`,
      wrong: [[say(lo, con), "The first part is wrong. " + medWhy], [say(hi, wob), "The second part is wrong. " + conWhy], [say(lo, wob), "Both parts are wrong. " + medWhy + " " + conWhy]] }; }
};
const SPREAD_KINDS = ["list", "list", "boxread", "boxread", "boxpct", "boxpct", "cfmed", "cfmed", "cfiqr", "cfmore", "cfmore", "sd", "sd", "sdfreq", "sdfreq", "compare", "compare"];
const spreadQ = (r, kind) => { const c = r.pick(SPREAD_CTX), z = kind.startsWith("cf") ? SPREAD.cf(r, c, kind) : SPREAD[kind](r, c);
  const data = Object.assign({ spread: kind, k: z.k, ctx: c.id, x: z.x }, z.data), uid = `spread|${kind}|${z.k}|${c.id}|${JSON.stringify(z.data)}`, extra = { pic: z.pic || "", uid, data };
  if (z.mc) return mcqWhy(r, z.q, z.right, z.rightWhy, z.wrong, z.hint, z.steps, extra);
  if (z.tol) Object.assign(extra, { tol: z.tol, a: fdp(z.x, 2), keys: ["."] }); else if (!Number.isInteger(z.x)) extra.keys = ["."];
  return numWhy(z.q, z.x, z.hint, z.steps, z.slips.filter(([v]) => v > 0 && isFinite(v)), extra); };
topic(10, "spread", "Kite-Festival Spread", "🪁", "Quartiles, box plots, cumulative frequency and standard deviation", r => spreadQ(r, r.pick(SPREAD_KINDS)));
/* ---------- 🚌 Field-Trip Travel Graphs (MOE Sec 4 real-world contexts, N4 rate and speed: distance–time graphs (speed
   = gradient, a flat line = stopped, the stop time, average speed for the whole trip there and back, which statement is
   true) and speed–time graphs (acceleration and deceleration = gradient, distance = the area under the graph, linear
   sections only, finding the top speed V from the distance, which statement is true)). Every corner of a graph sits on
   the grid, so the child reads it off the labelled axes; tick labels carry class xt / yt + data-v and the line's corners
   are circles of class tgpt, so tests read every graph back. Stages are lettered A, B, C, D in yellow bubbles. */
const DT_CTX = [
  { id: "bus", title: "Zoo field trip", it: "the school bus", trip: "the school bus's trip from school to the zoo and back", home: "school", away: "the zoo", y: "Distance from school (km)", sp: [20, 60], xs: [10, 15, 20], ys: [5, 10] },
  { id: "bike", title: "Library bike ride", it: "Mei", trip: "Mei's bike ride from home to the library and back", home: "home", away: "the library", y: "Distance from home (km)", sp: [6, 20], xs: [10, 15], ys: [1, 2] },
  { id: "coach", title: "Pumpkin-coach ride", it: "the pumpkin coach", trip: "Cinderella's ride in her pumpkin coach from the cottage to the palace and back", home: "the cottage", away: "the palace", y: "Distance from the cottage (km)", sp: [8, 30], xs: [10, 15, 20], ys: [2, 5] },
  { id: "hike", title: "Waterfall hike", it: "the scout troop", trip: "the scout troop's hike from the campsite to the waterfall and back", home: "the campsite", away: "the waterfall", y: "Distance from the campsite (km)", sp: [2, 6], xs: [15, 20, 30], ys: [1] }
];
const ST_CTX = [
  { id: "mrt", title: "MRT train between stations", it: "the MRT train", run: "an MRT train's journey from one station to the next", sp: [12, 24], ys: 4, xs: 10, t1: [10, 20, 30], t2: [2, 6], t3: [10, 20, 30] },
  { id: "sprint", title: "Sports-day sprint", it: "Aisha", run: "Aisha's run in the sports-day sprint", sp: [6, 10], ys: 2, xs: 2, t1: [2, 4, 6], t2: [2, 5], t3: [2, 4] },
  { id: "rc", title: "Remote-control car race", it: "the remote-control car", run: "a remote-control car's run along the race track", sp: [3, 8], ys: 1, xs: 2, t1: [2, 4, 6], t2: [2, 5], t3: [2, 4, 6] },
  { id: "coach", title: "Pumpkin coach on the palace road", it: "the pumpkin coach", run: "Cinderella's pumpkin coach riding along the palace road", sp: [4, 12], ys: 2, xs: 5, t1: [5, 10, 15], t2: [2, 6], t3: [5, 10] }
];
const LET = "ABCD";
const isNice = v => Math.abs(rd(v, 2) - v) < 1e-9;
// a travel graph (stage bubbles sit above flat stages and under sloping ones, clear of the axes): corners pts = [[t, y]] on a grid of xstep × ystep; vName = "V" draws an unlabelled speed axis with only the
// top speed marked V (Royal "find V" questions)
const svgTravel = (g) => { const { x0, x1, top, bot, X, Y: Yf } = plotFrame(0, g.xmax, 0, g.ymax, PLOT_BOX);
  let grid, Y;
  if (g.vName) { Y = Yf; grid = `<line x1="${x0}" y1="${bot}" x2="${x1}" y2="${bot}" stroke="#b9a6cc" stroke-width="2"/><text class="yt" data-v="0" x="${x0 - 5}" y="${bot + 3.5}" font-size="10" text-anchor="end" font-weight="800" fill="${INK}">0</text>` +
      `<line class="tgv" x1="${x0}" y1="${Y(g.vAt)}" x2="${x1}" y2="${Y(g.vAt)}" stroke="#c9b3ff" stroke-width="1.4" stroke-dasharray="4 3"/><text x="${x0 - 6}" y="${Y(g.vAt) + 4.5}" font-size="13" text-anchor="end" font-weight="900" font-style="italic" font-family="Georgia, serif" fill="#ff4f81">${g.vName}</text>`; }
  else [grid, Y] = axes(x0, x1, top, bot, g.ymax, g.ystep, "yt");
  const ticks = []; for (let t = 0; t <= g.xmax + 1e-9; t += g.xstep) ticks.push([X(t), fmt(t), fmt(t)]);
  const P = g.pts.map(([t, y]) => [X(t), Y(y)]);
  const stages = P.slice(1).map((p, i) => { const a = P[i], dx = p[0] - a[0], dy = p[1] - a[1], L = Math.hypot(dx, dy) || 1; let nx = dy / L, ny = -dx / L; if ((ny > 0) !== (Math.abs(dy) > 0.5)) { nx = -nx; ny = -ny; }   // flat: above the line; sloping: under it
    const at = k => [(a[0] + p[0]) / 2 + nx * k, (a[1] + p[1]) / 2 + ny * k], inPlot = q => q[0] >= x0 + 11 && q[0] <= x1 - 10 && q[1] >= top + 2 && q[1] <= bot - 10;
    const c = (inPlot(at(13)) ? at(13) : at(-13)).map(f1);   // the other side of the line when that side runs off the plot
    return `<g class="tgstage" data-s="${LET[i]}"><circle cx="${c[0]}" cy="${c[1]}" r="8" fill="#FFF0B8" stroke="${LINE}" stroke-width="1.4"/><text x="${c[0]}" y="${f1(c[1] + 3.8)}" font-size="10.5" text-anchor="middle" font-weight="900" fill="${INK}">${LET[i]}</text></g>`; }).join("");
  return cardSvg(300, 226, g.title, 18, `${yUnit(g.yName)}${grid}${xTicks(ticks, top, bot, "#F3ECFA", 15, "xt")}${xUnit(f1((x0 + x1) / 2), bot + 30, g.xName)}` +
    `<polyline class="tgline" points="${P.map(xy).join(" ")}" fill="none" stroke="#ff8fa3" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>` +
    P.map(p => `<circle class="tgpt" cx="${p[0]}" cy="${p[1]}" r="3.4" fill="#fff" stroke="#ff6f91" stroke-width="2"/>`).join("") + stages, g.label, "mpic chart travel"); };
// a distance–time journey out and back: stages [{ k: out | rest | back, t0, t1, y0, y1, sp }], times in min, distances in km
const DT_PATTERNS = [["out", "rest", "back"], ["out", "rest", "out", "back"], ["out", "out", "rest", "back"], ["out", "rest", "back"]];
const dtJourney = (r, c) => { for (;;) { const xs = r.pick(c.xs), ys = r.pick(c.ys), pat = r.pick(DT_PATTERNS); let t = 0, y = 0, okv = true; const st = [];
  for (const k of pat) { const n = r.int(1, k === "rest" ? 2 : 3), dt = n * xs; let dy = k === "rest" ? 0 : k === "back" ? -y : r.int(1, 4) * ys;
    const sp = 60 * Math.abs(dy) / dt; if (k !== "rest" && (!Number.isInteger(sp) || sp < c.sp[0] || sp > c.sp[1])) { okv = false; break; }
    st.push({ k, t0: t, t1: t + dt, y0: y, y1: y + dy, sp }); t += dt; y += dy; }
  if (!okv || t / xs > 8 || t / xs < 4) continue;
  const D = Math.max(...st.map(s => s.y1)), steps = D / ys < 4 ? Math.max(D / ys + 1, 3) : D / ys, mv = st.filter(s => s.k !== "rest");
  if (D / ys > 8 || new Set(mv.map(s => s.sp)).size !== mv.length) continue;
  return { st, xs, ys, T: t, D, ymax: steps * ys, pic: svgTravel({ title: c.title, yName: c.y, xName: "Time (min)", xmax: t, xstep: xs, ymax: steps * ys, ystep: ys, pts: [[0, 0]].concat(st.map(s => [s.t1, s.y1])), label: "distance–time graph" }) }; } };
// a speed–time journey: shape "rest" (0 → V, steady V, V → 0), "u" (starts at u m/s) or "tri" (0 → V → 0); times in s, speeds in m/s
const stJourney = (r, c, shapes, vName) => { for (;;) { const shape = r.pick(shapes), V = r.int(Math.ceil(c.sp[0] / c.ys), Math.floor(c.sp[1] / c.ys)) * c.ys, u = shape === "u" ? r.int(1, V / c.ys - 1) * c.ys : 0;
  const t1 = r.pick(c.t1), t2 = shape === "tri" ? 0 : r.int(c.t2[0], c.t2[1]) * c.xs, t3 = r.pick(c.t3), T = t1 + t2 + t3, a1 = (V - u) / t1, a3 = V / t3;
  if (T / c.xs > 10 || !isNice(a1) || !isNice(a3) || Math.abs(a1 - a3) < 1e-9 || V <= u) continue;
  const pts = [[0, u], [t1, V]].concat(t2 ? [[t1 + t2, V]] : [], [[T, 0]]), ymax = V + c.ys * (V / c.ys < 4 ? 2 : 1);
  const S = (u + V) / 2 * t1 + V * t2 + V * t3 / 2;
  return { shape, V, u, t1, t2, t3, T, a1, a3, S, pts, pic: svgTravel({ title: c.title, yName: "Speed (m/s)", xName: "Time (s)", xmax: T, xstep: c.xs, ymax, ystep: c.ys, pts, vName, vAt: V, label: "speed–time graph" }) }; } };
const km = v => `${fmt(v)} km`, mins = v => `${fmt(v)} min`;
const TRAVEL = {
  // speed of one stage of a distance–time graph (km/h): the change in distance ÷ the time in hours
  dtspeed: (r, c) => { const J = dtJourney(r, c), i = r.pick(J.st.map((s, k) => k).filter(k => J.st[k].k !== "rest")), s = J.st[i], L = LET[i], dd = Math.abs(s.y1 - s.y0), dt = s.t1 - s.t0;
    return { k: s.k, x: s.sp, pic: J.pic, data: { stage: L, pts: J.st.map(z => [z.t1, z.y1]) }, q: `The graph shows ${c.trip}. Find the speed during stage ${L}, in km/h.`, hint: "Speed = change in distance ÷ time taken. Turn the minutes into hours first.",
      steps: [`Stage ${L}: from ${mins(s.t0)} to ${mins(s.t1)}, the distance goes from ${km(s.y0)} to ${km(s.y1)}`, `Change in distance = ${km(dd)}, time = ${dt} min = $\\frac{${dt}}{60}$ h`, `Speed = ${dd} ÷ $\\frac{${dt}}{60}$ = ${dd} × 60 ÷ ${dt} = ${s.sp} km/h`],
      slips: [[rd(dd / dt, 4), `That is ${km(dd)} ÷ ${dt}, the speed in km per minute. There are 60 minutes in an hour, so multiply by 60.`], [rd(60 * dt / dd, 4), "That divides the time by the distance, upside down. Speed is distance ÷ time."],
        [rd(60 * s.y1 / s.t1, 4), `That reads ${km(s.y1)} and ${mins(s.t1)} straight off the axes, from the very start of the trip. Use only the change during stage ${L}: ${km(dd)} in ${dt} min.`], [dd, `${km(dd)} is how far it went in stage ${L}. Divide by the time, ${dt} min = $\\frac{${dt}}{60}$ h, to get the speed.`]] }; },
  // how long the flat (stopped) part lasts
  dtrest: (r, c) => { const J = dtJourney(r, c), i = J.st.findIndex(s => s.k === "rest"), s = J.st[i], L = LET[i], dur = s.t1 - s.t0;
    return { k: "rest", x: dur, pic: J.pic, data: { stage: L, pts: J.st.map(z => [z.t1, z.y1]) }, q: `The graph shows ${c.trip}. For how many minutes did ${c.it} stop?`, hint: "On a distance–time graph, a flat line means the distance is not changing: stopped. Find how long the flat part lasts.",
      steps: [`The flat part is stage ${L}, at ${km(s.y0)} from ${c.home}`, `It starts at ${mins(s.t0)} and ends at ${mins(s.t1)}`, `Stopped for ${s.t1} − ${s.t0} = ${dur} min`],
      slips: [[s.t0, `${mins(s.t0)} is the time the stop began. Subtract it from the time it set off again, ${mins(s.t1)}.`], [s.t1, `${mins(s.t1)} is the time on the axis when it set off again. The stop lasted from ${mins(s.t0)} to ${mins(s.t1)}.`], [s.y0, `${km(s.y0)} is how far from ${c.home} it stopped (read on the up axis). The question asks for the time, along the bottom axis.`], [rd(dur / 60, 4), "That is the stop in hours. The question asks for minutes."]] }; },
  // average speed for the whole trip: total distance ÷ total time, the stops included
  dtavg: (r, c) => { const J = dtJourney(r, c), S = 2 * J.D, mv = J.st.filter(s => s.k !== "rest"), Tm = sum(mv.map(s => s.t1 - s.t0)), v = 60 * S / J.T, x = rd(v, 1);
    return { k: Number.isInteger(v) ? "exact" : "dp", x, tol: .051, pic: J.pic, data: { pts: J.st.map(z => [z.t1, z.y1]) }, q: `The graph shows ${c.trip}. Find the average speed for the whole trip, in km/h. (1 d.p. if needed)`, hint: "Average speed = total distance ÷ total time. Count the way there and the way back, and include the stops in the time.",
      steps: [`Total distance = ${km(J.D)} there + ${km(J.D)} back = ${km(S)}`, `Total time = ${J.T} min = $\\frac{${J.T}}{60}$ h (stops included)`, `Average speed = ${S} × 60 ÷ ${J.T} ${Number.isInteger(v) ? "=" : "≈"} ${fmt(x)} km/h`],
      slips: [[rd(60 * S / Tm, 1), `That leaves out the stop. Average speed for the whole trip uses the total time, ${J.T} min, stops included.`], [rd(60 * J.D / J.T, 1), `${km(J.D)} is only the way there. The whole trip is there and back: ${km(S)}.`], [rd(sum(mv.map(s => s.sp)) / mv.length, 1), "That is the mean of the stage speeds. The stages take different times, so use total distance ÷ total time."], [rd(S / J.T, 2), "That is km per minute. Multiply by 60 for km per hour."]] }; },
  // which statement about the distance–time graph is true
  dtmc: (r, c) => { const J = dtJourney(r, c), L = i => LET[i], ri = J.st.findIndex(s => s.k === "rest"), R = J.st[ri], mv = J.st.map((s, i) => i).filter(i => J.st[i].k !== "rest");
    const fi = mv.reduce((a, b) => J.st[b].sp > J.st[a].sp ? b : a), mi = r.pick(mv.filter(i => i !== fi)), bi = J.st.length - 1, F = J.st[fi], Mv = J.st[mi], It = cap(c.it);
    const dM = Math.abs(Mv.y1 - Mv.y0), others = mv.filter(i => i !== fi).map(i => `stage ${L(i)} is ${J.st[i].sp} km/h`).join(", ");
    const T = [[`During stage ${L(ri)}, ${c.it} was not moving.`, `Right: stage ${L(ri)} is a flat line, so the distance from ${c.home} stayed at ${km(R.y0)} for ${R.t1 - R.t0} minutes. ${It} had stopped.`],
      [`${It} travelled fastest during stage ${L(fi)}.`, `Right: stage ${L(fi)} is the steepest line, ${F.sp} km/h, while ${others}.`],
      [`During stage ${L(bi)}, ${c.it} was heading back to ${c.home}.`, `Right: in stage ${L(bi)} the line drops to 0, so the distance from ${c.home} was getting smaller until it got back.`],
      [`The furthest ${c.it} got from ${c.home} was ${km(J.D)}.`, `Right: the highest point of the graph is at ${km(J.D)}, so that is as far from ${c.home} as it went.`]];
    const W = [[`During stage ${L(mi)}, ${c.it} was not moving.`, `Stage ${L(mi)} slopes: the distance changes by ${km(dM)} in ${Mv.t1 - Mv.t0} minutes, so it was moving at ${Mv.sp} km/h.`],
      [`${It} travelled fastest during stage ${L(mi)}.`, `Stage ${L(mi)} is ${Mv.sp} km/h, but stage ${L(fi)} is steeper at ${F.sp} km/h.`],
      [`During stage ${L(ri)}, ${c.it} moved at a steady speed.`, `A flat line on a distance–time graph means the distance did not change: ${c.it} was stopped, not moving steadily.`],
      [`During stage ${L(bi)}, ${c.it} was moving further away from ${c.home}.`, `In stage ${L(bi)} the line goes down, so the distance from ${c.home} was getting smaller: it was coming back.`],
      [`The furthest ${c.it} got from ${c.home} was ${km(2 * J.D)}.`, `${km(2 * J.D)} is the whole trip, there and back. The highest point of the graph is ${km(J.D)}.`]];
    const ti = r.int(0, 3);
    return { k: ["stop", "fast", "back", "far"][ti], mc: true, pic: J.pic, data: { pts: J.st.map(z => [z.t1, z.y1]) }, q: `The graph shows ${c.trip}. Which statement is correct?`, hint: "Flat line = stopped. Steeper line = faster. Line going down = coming back.",
      steps: [`Stage ${L(ri)} is flat: stopped at ${km(R.y0)}`, `Speeds: ${mv.map(i => `stage ${L(i)} ${J.st[i].sp} km/h`).join(", ")}`, `Furthest from ${c.home}: ${km(J.D)}`],
      right: T[ti][0], rightWhy: T[ti][1], wrong: r.shuffle(W) }; },
  // acceleration (stage A) or deceleration (last stage) = the gradient of the speed–time graph
  staccel: (r, c) => { const J = stJourney(r, c, ["rest", "rest", "u", "tri"]), dec = r.chance(.5), It = cap(c.it);
    if (!dec) { const dv = J.V - J.u, x = J.a1;
      return { k: J.u ? "accel-u" : "accel", x, pic: J.pic, data: { pts: J.pts }, q: `The speed–time graph shows ${c.run}. Find the acceleration during stage A, in m/s².`, hint: "Acceleration = change in speed ÷ time taken (the gradient of the line).",
        steps: [`Stage A: speed goes from ${J.u} m/s to ${J.V} m/s in ${J.t1} s`, `Acceleration = (${J.V} − ${J.u}) ÷ ${J.t1} = ${fmt(x)} m/s²`],
        slips: [[rd(J.V / J.t1, 4), `${It} starts at ${J.u} m/s, not 0. Use the change in speed, ${J.V} − ${J.u} = ${dv} m/s.`], [rd(J.t1 / dv, 4), "That divides the time by the speed, upside down. Acceleration is change in speed ÷ time."], [dv * J.t1 / 2 + J.u * J.t1, `That is the area under stage A, which gives the distance (${fmt(dv * J.t1 / 2 + J.u * J.t1)} m). Acceleration is the gradient.`], [dv, `${dv} m/s is the change in speed. Divide by the ${J.t1} s it took.`]] }; }
    const t0 = J.T - J.t3, x = J.a3, L = LET[J.pts.length - 2];
    return { k: "decel", x, pic: J.pic, data: { pts: J.pts }, q: `The speed–time graph shows ${c.run}. Find the deceleration during stage ${L}, in m/s².`, hint: "Deceleration = drop in speed ÷ time taken. The line slopes down, and a deceleration is given as a positive number.",
      steps: [`Stage ${L}: speed drops from ${J.V} m/s to 0 m/s, from ${t0} s to ${J.T} s (${J.t3} s)`, `Deceleration = ${J.V} ÷ ${J.t3} = ${fmt(x)} m/s²`],
      slips: [[-x, `The word deceleration already means slowing down, so give it as a positive number: ${fmt(x)} m/s². (As an acceleration it would be ${fmt(-x)} m/s².)`], [rd(J.V / J.T, 4), `That divides by ${J.T} s, the time read off the axis. The slowing down only took ${J.T} − ${t0} = ${J.t3} s.`], [rd(J.t3 / J.V, 4), "That divides the time by the speed, upside down. Deceleration is drop in speed ÷ time."], [J.V * J.t3 / 2, `That is the area under stage ${L}, the distance it took to stop. Deceleration is the gradient.`]] }; },
  // distance travelled = the area under the speed–time graph (whole journey, or stage A)
  stdist: (r, c) => { const J = stJourney(r, c, ["rest", "rest", "u", "tri"]), whole = r.chance(.6);
    if (whole) { const parts = [[`A: ½ × (${J.u} + ${J.V}) × ${J.t1}`, (J.u + J.V) / 2 * J.t1]].concat(J.t2 ? [[`B: ${J.V} × ${J.t2}`, J.V * J.t2]] : [], [[`${LET[J.pts.length - 2]}: ½ × ${J.t3} × ${J.V}`, J.V * J.t3 / 2]]);
      if (!J.u) parts[0][0] = `A: ½ × ${J.t1} × ${J.V}`;
      return { k: "whole-" + J.shape, x: J.S, pic: J.pic, data: { pts: J.pts }, q: `The speed–time graph shows ${c.run}. Find the total distance travelled, in m.`, hint: "Distance = the area under a speed–time graph. Split it into triangles, rectangles and trapeziums.",
        steps: parts.map(p => `${p[0]} = ${fmt(p[1])} m`).concat([`Total = ${parts.map(p => fmt(p[1])).join(" + ")} = ${fmt(J.S)} m`]),
        slips: [[J.V * J.T, `That is the whole rectangle ${J.V} × ${J.T}. ${cap(c.it)} was slower than ${J.V} m/s while speeding up and slowing down, so the sloping parts are triangles${J.u ? " and trapeziums" : ""}: take half.`], [(J.u + J.V) * J.t1 + J.V * J.t2 + J.V * J.t3, "That forgets the ½ in the triangle (and trapezium) areas."], [J.V * J.t2, `That is only stage B, the steady part. Add the areas of the sloping parts too.`], [J.V + J.u, "That adds speeds together. Distance is the area under the graph: speed × time."]] }; }
    const S = (J.u + J.V) / 2 * J.t1;
    return { k: J.u ? "first-u" : "first", x: S, pic: J.pic, data: { pts: J.pts }, q: `The speed–time graph shows ${c.run}. How far did ${c.it} travel during stage A, in m?`, hint: J.u ? "The area under stage A is a trapezium: ½ × (sum of the parallel sides) × width." : "The area under stage A is a triangle: ½ × base × height.",
      steps: [J.u ? `Stage A is a trapezium: ½ × (${J.u} + ${J.V}) × ${J.t1}` : `Stage A is a triangle: ½ × ${J.t1} × ${J.V}`, `Distance = ${fmt(S)} m`],
      slips: [[J.V * J.t1, `That is ${J.V} × ${J.t1}, a rectangle. ${cap(c.it)} was still speeding up, so the area is ${J.u ? "a trapezium" : "a triangle"}: take half${J.u ? " of the sum of the sides" : ""}.`], [(J.u + J.V) * J.t1, `That forgets the ½: the area of ${J.u ? "a trapezium is ½ × (sum of the parallel sides)" : "a triangle is ½ × base"} × width.`], [(J.V - J.u) * J.t1 / 2, `That is only the triangle on top. ${cap(c.it)} started at ${J.u} m/s, so add the rectangle under it: ${J.u} × ${J.t1}.`], [J.a1, `${fmt(J.a1)} m/s² is the acceleration (the gradient). Distance is the area under the line.`]] }; },
  // the top speed V from the total distance (the speed axis is not numbered)
  stfind: (r, c) => { const J = stJourney(r, c, ["rest"], "V"), w = J.t2 + (J.t1 + J.t3) / 2;
    return { k: "findV", x: J.V, pic: J.pic, data: { pts: J.pts, S: J.S }, q: `The speed–time graph shows ${c.run}. The top speed is V m/s and the total distance travelled is ${fmt(J.S)} m. Find V.`, hint: "The area under the graph is the distance. Write the area using V, then solve.",
      steps: [`Area = ½ × ${J.t1} × V + ${J.t2} × V + ½ × ${J.t3} × V`, `= ${fmt(w)}V`, `${fmt(w)}V = ${fmt(J.S)}, so V = ${fmt(J.S)} ÷ ${fmt(w)} = ${J.V}`],
      slips: [[rd(J.S / J.T, 4), `That treats the graph as a rectangle, ${fmt(J.S)} ÷ ${J.T}. The sloping parts are triangles, so they count half: the area is ${fmt(w)}V.`], [rd(J.S / J.t2, 4), `That uses only the steady part, stage B. The triangles at each end add distance too: the area is ${fmt(w)}V.`], [rd(J.S / (J.T / 2), 4), `That treats the whole graph as one triangle. The middle part is a rectangle: the area is ${fmt(w)}V.`], [rd(J.S / (J.t2 + J.t1 + J.t3 / 2), 4), "That forgets the ½ on one of the triangles."]] }; },
  // which statement about the speed–time graph is true
  stmc: (r, c) => { const J = stJourney(r, c, ["rest", "u"]), It = cap(c.it), up = J.a1 > J.a3;
    const T = [[`During stage A, ${c.it} was speeding up.`, `Right: in stage A the line rises from ${J.u} m/s to ${J.V} m/s, so the speed was increasing: accelerating.`],
      [`During stage B, ${c.it} kept moving at ${J.V} m/s.`, `Right: stage B is flat at ${J.V} m/s, so ${c.it} moved at a constant speed for ${J.t2} s.`],
      [up ? `${It} sped up more sharply than it slowed down.` : `${It} slowed down more sharply than it sped up.`, `Right: the acceleration is ${fmt(J.a1)} m/s² and the deceleration is ${fmt(J.a3)} m/s², so the ${up ? "rising" : "falling"} line is steeper.`],
      [`${It} travelled ${fmt(J.V * J.t2)} m during stage B.`, `Right: the area under stage B is a rectangle, ${J.V} × ${J.t2} = ${fmt(J.V * J.t2)} m.`]];
    const W = [[`During stage B, ${c.it} was not moving.`, `A flat line on a speed–time graph means the speed stayed at ${J.V} m/s, not 0. ${It} was moving steadily; stopped would be a line along 0.`],
      [`During stage C, ${c.it} was speeding up.`, `In stage C the line falls from ${J.V} m/s to 0, so ${c.it} was slowing down (decelerating) to a stop.`],
      [up ? `${It} slowed down more sharply than it sped up.` : `${It} sped up more sharply than it slowed down.`, `Compare the gradients: the acceleration is ${fmt(J.a1)} m/s² and the deceleration is ${fmt(J.a3)} m/s², so the ${up ? "rising" : "falling"} line is the steeper one.`],
      [`${It} travelled ${fmt(J.V)} m during stage B.`, `${J.V} m/s is the speed in stage B. The distance is the area under it: ${J.V} × ${J.t2} = ${fmt(J.V * J.t2)} m.`]];
    const ti = r.int(0, 3);
    return { k: ["up", "steady", "steeper", "area"][ti], mc: true, pic: J.pic, data: { pts: J.pts }, q: `The speed–time graph shows ${c.run}. Which statement is correct?`, hint: "On a speed–time graph: rising = speeding up, flat = steady speed (not stopped), falling = slowing down, area = distance.",
      steps: [`Stage A: ${J.u} → ${J.V} m/s in ${J.t1} s (acceleration ${fmt(J.a1)} m/s²)`, `Stage B: steady ${J.V} m/s for ${J.t2} s (${fmt(J.V * J.t2)} m)`, `Stage C: ${J.V} → 0 m/s in ${J.t3} s (deceleration ${fmt(J.a3)} m/s²)`],
      right: T[ti][0], rightWhy: T[ti][1], wrong: [W[0]].concat(r.shuffle(W.slice(1))) }; }
};
const TRAVEL_KINDS = ["dtspeed", "dtspeed", "dtrest", "dtavg", "dtavg", "dtmc", "dtmc", "staccel", "staccel", "stdist", "stdist", "stfind", "stmc", "stmc"];
const travelQ = (r, kind) => { const c = r.pick(kind.startsWith("dt") ? DT_CTX : ST_CTX), z = TRAVEL[kind](r, c);
  const data = Object.assign({ travel: kind, k: z.k, ctx: c.id, x: z.x }, z.data), uid = `travel|${kind}|${z.k}|${c.id}|${JSON.stringify(z.data)}|${z.q}`, extra = { pic: z.pic, uid, data };
  if (z.mc) return mcqWhy(r, z.q, z.right, z.rightWhy, z.wrong, z.hint, z.steps, extra);
  if (z.tol) Object.assign(extra, { tol: z.tol, a: fmt(z.x), keys: ["."] }); else if (!Number.isInteger(z.x)) extra.keys = ["."];
  return numWhy(z.q, z.x, z.hint, z.steps, z.slips.filter(([v]) => isFinite(v) && v !== 0), extra); };
topic(10, "travel", "Field-Trip Travel Graphs", "🚌", "Distance–time and speed–time graphs: speed, acceleration and distance", r => travelQ(r, r.pick(TRAVEL_KINDS)));
topic(10, "sector", "Slice of the Moon", "🌙", "Arc length and sector area", r => {
  const R = r.int(3, 15), th = r.pick([30, 40, 45, 60, 72, 90, 120, 135, 150]), area = r.chance(.5), v = area ? th / 360 * Math.PI * R * R : th / 360 * 2 * Math.PI * R;
  return num(`A slice of moon-cake is a sector with radius ${R} cm and angle ${th}°. Find its ${area ? "area in cm²" : "arc length in cm"} (2 d.p.).`, rd(v, 2), area ? "Sector area = (θ/360) × πr²" : "Arc length = (θ/360) × 2πr", [area ? `$\\frac{${th}}{360} \\times \\pi \\times ${R}^2 \\approx ${fdp(v, 2)}$` : `$\\frac{${th}}{360} \\times 2\\pi \\times ${R} \\approx ${fdp(v, 2)}$`], { a: fdp(v, 2), keys: ["."], tol: 0.0051, data: { R, th, area } });
});
topic(10, "vectors", "Arrow Vectors", "➡️", "Column vectors and magnitude", r => {
  if (r.chance(.5)) { const tr = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]), v = [tr[0] * r.pick([1, -1]), tr[1] * r.pick([1, -1])]; return num(`Find the magnitude of ${T(V2(v))}.`, tr[2], "|v| = √(x² + y²)", [`$${sqrtTex(`${paren(v[0])}^2 + ${paren(v[1])}^2`)} = ${sqrtTex(tr[2] * tr[2])} = ${tr[2]}$`], { data: { v } }); }
  const a = [r.int(-6, 6), r.int(-6, 6)], b = [r.int(-6, 6), r.int(-6, 6)], k = r.int(2, 3), res = [k * a[0] + b[0], k * a[1] + b[1]];
  return Q({ q: `${T(`\\mathbf{a} = ${V2(a)},\\ \\mathbf{b} = ${V2(b)}`)}. Find ${T(`${k}\\mathbf{a} + \\mathbf{b}`)} (type top, bottom).`, kind: "pair", val: res, a: res.join(", "), keys: ["-", ","], hint: `Multiply each part of a by ${k}, then add b part by part.`, steps: [`$${k}\\mathbf{a} = ${V2([k * a[0], k * a[1]])}$`, `$${k}\\mathbf{a} + \\mathbf{b} = ${V2(res)}$`], data: { a, b, k } });
});

/* ---------- 🧩 Matrix Meadow (MOE Sec 3/4 E-Math matrices): order of a spell grid, add/subtract compatible 2×2
   grids, scalar multiply, matrix multiply (2×2×2×2 and light 2×3×3×2), determinant ad−bc, inverse of an
   invertible 2×2 (det ±1 or ±2), and solve a twin-potion system as AX=B with X = A⁻¹B. Pictures use the shared
   matSvg kit (class=mgrid / mcell). Every MCQ option has its own why / why-not; typed questions carry ≥2 slips. */
const MAT_CTX = [
  { id: "meadow", title: "Matrix Meadow", who: "Fairy Pip", spot: "Matrix Meadow" },
  { id: "potion", title: "Potion grid hut", who: "Gingerbread Baker", spot: "the potion-grid hut" },
  { id: "crystal", title: "Crystal spell table", who: "Sumi the star fairy", spot: "the crystal-spell table" },
  { id: "elf", title: "Meadow elf workshop", who: "Princess Mira", spot: "the meadow-elf workshop" },
  { id: "lantern", title: "Lantern spell pads", who: "Jack", spot: "the lantern-spell pads" }
];
const mEntry = r => r.int(-5, 5);
const m2 = r => [[mEntry(r), mEntry(r)], [mEntry(r), mEntry(r)]];
const mAdd = (A, B) => A.map((row, i) => row.map((v, j) => v + B[i][j]));
const mSub = (A, B) => A.map((row, i) => row.map((v, j) => v - B[i][j]));
const mScale = (k, A) => A.map(row => row.map(v => k * v));
const mMul = (A, B) => { const nr = A.length, nc = B[0].length, mid = B.length;
  const C = []; for (let i = 0; i < nr; i++) { C[i] = []; for (let j = 0; j < nc; j++) { let s = 0; for (let k = 0; k < mid; k++) s += A[i][k] * B[k][j]; C[i][j] = s; } } return C; };
const mDet = A => A[0][0] * A[1][1] - A[0][1] * A[1][0];
const mHad = (A, B) => A.map((row, i) => row.map((v, j) => v * B[i][j]));
const mEq = (A, B) => JSON.stringify(A) === JSON.stringify(B);
const mT = A => A[0].map((_, c) => A.map(row => row[c])); // transpose
const mInvNice = A => {
  const d = mDet(A); if (!d || Math.abs(d) > 2) return null;
  const adj = [[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]];
  return adj.map(row => row.map(v => v / d));
};
const mFmt = v => { if (Number.isInteger(v)) return String(v); const [n, d] = simp(Math.round(v * 2), 2); return d === 1 ? String(n) : fracTex(n, d); };
const mTex = A => matTex(A.map(row => row.map(mFmt)));
const mShow = A => T(mTex(A));
const MAT = {
  order: r => { const rows = r.pick([2, 2, 2, 3]), cols = r.pick(rows === 2 ? [2, 2, 3] : [2]);
    const A = Array.from({ length: rows }, () => Array.from({ length: cols }, () => mEntry(r)));
    const ctx = r.pick(MAT_CTX), ans = `${rows} x ${cols}`, pic = matSvg(ctx.title, A);
    const wrong = [
      [`${cols} x ${rows}`, `Order is rows × columns. This grid has ${rows} rows and ${cols} columns.`],
      [`${rows + 1} x ${cols}`, `There are ${rows} rows, not ${rows + 1}.`],
      [`${rows} x ${cols + 1}`, `There are ${cols} columns, not ${cols + 1}.`],
      [`${rows * cols} x 1`, `Order is not the total number of entries. Write rows × columns.`],
      [`1 x ${rows * cols}`, `A single long row would be 1 × ${rows * cols}. This grid has ${rows} rows.`],
      [`${cols} x ${cols}`, `Count the rows first: there are ${rows} of them.`]
    ].filter(([o]) => o !== ans);
    return { k: "order", mc: true, ctx, A, rows, cols, right: ans, rightWhy: `Right: count the rows first, then the columns — this spell grid is ${rows} by ${cols}.`, wrong,
      q: `${ctx.who} finds a spell grid in ${ctx.spot}. What is the order of ${mShow(A)}?`, hint: "Order means rows × columns.",
      steps: [`The matrix has ${rows} row${rows > 1 ? "s" : ""} and ${cols} column${cols > 1 ? "s" : ""}.`, `Order = ${rows} × ${cols}.`], pic, data: { A, rows, cols, ans } }; },
  add: r => { let A, B, C, sub; do { A = m2(r); B = m2(r); sub = r.chance(.4); C = sub ? mSub(A, B) : mAdd(A, B); } while (mEq(C, A) || mEq(C, B) || mEq(C, mHad(A, B)));
    const ctx = r.pick(MAT_CTX), op = sub ? "-" : "+", right = mShow(C), pic = matSvg(ctx.title, A, { B, op });
    const swapped = sub ? mSub(B, A) : mScale(2, A);
    const wrong = [
      [mShow(sub ? mAdd(A, B) : mSub(A, B)), sub ? "This adds the matching entries. The question asks for subtraction." : "This subtracts. The question asks you to add matching entries."],
      [mShow(mHad(A, B)), "That multiplies matching entries. Add or subtract them instead."],
      [mShow(swapped), sub ? "Keep the order: A − B, not B − A." : "That doubles A instead of adding B. Combine matching entries of A and B."],
      [mShow([C[1], C[0]]), "The rows were swapped after combining. Keep the top row on top."],
      [mShow(mScale(-1, C)), "The sign of every entry flipped. Keep each sum or difference as it is."]
    ].filter(([o]) => o !== right);
    return { k: "add", mc: true, ctx, A, B, C, sub, right, rightWhy: `Right: combine matching entries ${sub ? "by subtracting" : "by adding"} — each new entry is a${sub ? " difference" : " sum"} of the two grids.`, wrong,
      q: `${ctx.who} combines two spell grids in ${ctx.spot}: find ${T(`${mTex(A)} ${op} ${mTex(B)}`)}.`, hint: `${sub ? "Subtract" : "Add"} the numbers that sit in the same place.`,
      steps: [`$${mTex(A)} ${op} ${mTex(B)} = ${mTex(C)}$`], pic, data: { A, B, C, sub } }; },
  scalar: r => { const A = m2(r), k = r.pick([-3, -2, 2, 3, 4, 5, -4]), C = mScale(k, A), ctx = r.pick(MAT_CTX);
    const right = mShow(C), pic = matSvg(ctx.title, A, { op: `${k}×` });
    const wrong = [
      [mShow(mScale(-k, A)), `The scalar is ${k}, not ${-k}. Multiply every entry by ${k}.`],
      [mShow(mScale(k > 0 ? k + 1 : k - 1, A)), `Use ${k} as the multiplier for every entry.`],
      [mShow(mAdd(A, [[k, k], [k, k]])), `Multiply each entry by ${k}; do not add ${k} to each entry.`],
      [mShow(A), `Do not leave the grid unchanged — stretch every number by ${k}.`],
      [mShow(mT(C)), "That looks like a transpose of the answer. Keep each entry in its own seat."]
    ].filter(([o]) => o !== right);
    return { k: "scalar", mc: true, ctx, A, kk: k, C, right, rightWhy: `Right: every entry of the grid is multiplied by ${k}, so the new spell grid is scaled by that factor.`, wrong,
      q: `${ctx.who} powers up a crystal grid in ${ctx.spot}: find ${T(`${k}${mTex(A)}`)}.`, hint: `Multiply every entry by ${k}.`,
      steps: [`$${k}${mTex(A)} = ${mTex(C)}$`], pic, data: { A, k, C } }; },
  mul: r => { const wide = r.chance(.28); let A, B, C;
    if (wide) {
      A = [[mEntry(r), mEntry(r), mEntry(r)], [mEntry(r), mEntry(r), mEntry(r)]];
      B = [[mEntry(r), mEntry(r)], [mEntry(r), mEntry(r)], [mEntry(r), mEntry(r)]];
      C = mMul(A, B);
    } else {
      let guard = 0; do { A = m2(r); B = m2(r); C = mMul(A, B); guard++; } while (guard < 20 && (mEq(C, mHad(A, B)) || mEq(C, mMul(B, A)) || mEq(C, mAdd(A, B))));
    }
    const ctx = r.pick(MAT_CTX), right = mShow(C), pic = matSvg(ctx.title, A, { B, op: "×" });
    const BA = (!wide) ? mMul(B, A) : null;
    const hadTrap = (!wide) ? mHad(A, B) : mScale(2, C);
    const addTrap = (!wide) ? mAdd(A, B) : C.map(row => row.map(v => v + 1));
    const wrong = [
      [mShow(hadTrap), "That looks like multiplying matching entries. For matrix product, take a row of A times a column of B."],
      [mShow(addTrap), "Add the grids only when the question says +. Here you multiply."],
      BA && !mEq(BA, C) ? [mShow(BA), "That is BA. Keep the order AB — row of A against column of B."] : [mShow(C.map(row => [...row].reverse())), "A column was flipped. Check each row×column dot product again."],
      [mShow([C[1], C[0]]), "The product rows were swapped. The top row of AB comes from the top row of A."]
    ].filter(([o]) => o && o !== right);
    return { k: "mul", mc: true, ctx, A, B, C, wide, right, rightWhy: "Right: each entry of the product is a row of the first grid dotted with a column of the second.", wrong,
      q: `${ctx.who} weaves two spell grids in ${ctx.spot}: find the product ${T(`${mTex(A)} ${mTex(B)}`)}.`, hint: "Row of the first × column of the second.",
      steps: [`The product has order ${C.length} × ${C[0].length}.`, `$${mTex(A)}${mTex(B)} = ${mTex(C)}$`], pic, data: { A, B, C, wide: !!wide } }; },
  det: r => { let A, d; do { A = m2(r); d = mDet(A); } while (d === 0 && r.chance(.7));
    const ctx = r.pick(MAT_CTX), pic = matSvg(ctx.title, A, { hi: [[0, 0], [1, 1]] });
    const a = A[0][0], b = A[0][1], c = A[1][0], dd = A[1][1], ad = a * dd, bc = b * c;
    const slips = [
      [ad + bc, "That adds ad and bc. Determinant subtracts: ad − bc."],
      [a + dd - b - c, "Do not add and subtract the four entries one by one — use ad − bc."],
      [ad, `That is only ad. Subtract bc = ${bc} as well.`],
      [-d === d ? d + 1 : -d, "The sign flipped. Compute ad − bc, not bc − ad."],
      [bc - ad, "That is bc − ad. Flip it: the determinant is ad − bc."],
      [a * b - c * dd, "Pair the diagonal a with d, and b with c: ad − bc."],
      [d + 1, "Off by one. Recalculate ad − bc carefully."],
      [d - 1, "Off by one the other way. Recalculate ad − bc carefully."],
      [bc, `That is only bc. The determinant is ad − bc = ${ad} − ${paren(bc)}.`]
    ].filter((s, i, arr) => s[0] !== d && Number.isFinite(s[0]) && arr.findIndex(t => t[0] === s[0]) === i);
    return { k: "det", mc: false, ctx, A, d, q: `${ctx.who} checks a crystal key in ${ctx.spot}. Find det ${mShow(A)}.`,
      hint: "For a 2×2 matrix [[a, b], [c, d]], det = ad − bc.",
      steps: [`$\\det = (${a})(${dd}) - (${b})(${c})$`, `$= ${ad} - ${paren(bc)} = ${d}$`],
      slips, pic, data: { A, d } }; },
  inv: r => { let A, inv, d, guard = 0; do { A = m2(r); d = mDet(A); inv = mInvNice(A); guard++; } while ((!inv || ![-2, -1, 1, 2].includes(d)) && guard < 80);
    if (!inv) { A = [[1, 0], [0, 1]]; d = 1; inv = [[1, 0], [0, 1]]; }
    const ctx = r.pick(MAT_CTX), right = mShow(inv), pic = matSvg(ctx.title, A);
    const adj = [[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]];
    const wrong = [
      [mShow(adj), Math.abs(d) === 1 ? "For det ±1 you still apply 1/det to the adjugate — check the sign of the determinant." : `Divide every entry of the adjugate by det = ${d}.`],
      [mShow(mT(inv)), "That is the transpose of the inverse. Keep each entry in its place after scaling the adjugate."],
      [mShow(A), "The inverse is not the same as A (unless A² = I). Build (1/det)[[d, −b], [−c, a]]."],
      [mShow([[0, 0], [0, 0]]), "A singular grid (det 0) has no inverse. This one is invertible, so keep going."],
      [mShow(mScale(2, inv)), "Every entry was doubled. Use exactly 1/det times the adjugate."],
      [mShow([[inv[1][1], inv[0][1]], [inv[1][0], inv[0][0]]]), "The diagonal entries were swapped. Keep the adjugate pattern [[d, −b], [−c, a]]."],
      [mShow(mScale(-1, A)), "Negating A is not the inverse. Build (1/det) times the adjugate."]
    ].filter(([o]) => o !== right);
    // when det=±1, adj may equal ±inv — already filtered if equal to right; ensure unique notes
    return { k: "inv", mc: true, ctx, A, inv, d, right, rightWhy: `Right: divide the adjugate [[d, −b], [−c, a]] by the determinant ${d}.`, wrong,
      q: `${ctx.who} needs the undo-spell for ${mShow(A)} in ${ctx.spot}. Which matrix is the inverse?`, hint: `Find det = ad − bc (= ${d}), then (1/det) times [[d, −b], [−c, a]].`,
      steps: [`$\\det = ${d}$`, `$A^{-1} = \\frac{1}{${d}}${mTex(adj)} = ${mTex(inv)}$`], pic, data: { A, inv, d } }; },
  solve: r => { let A, inv, d, x, y, B, guard = 0;
    do { A = m2(r); d = mDet(A); inv = mInvNice(A); x = r.int(-5, 5); y = r.int(-5, 5); guard++; }
    while ((!inv || Math.abs(d) > 2 || (x === 0 && y === 0)) && guard < 80);
    if (!inv) { A = [[1, 0], [0, 1]]; d = 1; inv = [[1, 0], [0, 1]]; x = r.int(1, 5); y = r.int(-4, 4) || 2; }
    B = mMul(A, [[x], [y]]);
    const ctx = r.pick(MAT_CTX), Bx = B[0][0], By = B[1][0];
    const pic = matSvg(ctx.title, A, { B: [[Bx], [By]], op: "X" });
    const slips = [
      [`${y}, ${x}`, `That swaps x and y. The top of X is x = ${x}, the bottom is y = ${y}.`],
      [`${-x}, ${-y}`, "Both signs flipped. Compute X = A⁻¹B carefully."],
      [`${Bx}, ${By}`, "That is the column B, not X. Multiply A⁻¹ by B to find X."],
      [`${x + y}, ${x - y}`, "Do not add or subtract the unknowns. Solve the matrix equation for X."]
    ].filter((s, i, arr) => s[0] !== `${x}, ${y}` && arr.findIndex(t => t[0] === s[0]) === i);
    return { k: "solve", mc: false, pair: true, ctx, A, inv, d, x, y, Bx, By,
      q: `Meadow elves mix two spell ingredients. Solve ${T(`${mTex(A)}${matTex([["x"], ["y"]])} = ${matTex([[Bx], [By]])}`)} (type x, y like 3, -2).`,
      hint: "Find A⁻¹, then X = A⁻¹B.",
      steps: [`$\\det A = ${d}$, so $A^{-1} = ${mTex(inv)}$`, `$X = A^{-1}B = ${mTex(inv)}${matTex([[Bx], [By]])} = ${matTex([[x], [y]])}$`, `So $x = ${x}$, $y = ${y}$.`],
      slips, pic, data: { A, inv, d, x, y, B: [Bx, By] } }; }
};
const MAT_KINDS = ["order", "order", "add", "add", "add", "scalar", "scalar", "mul", "mul", "mul", "det", "det", "inv", "inv", "solve", "solve"];
const matQ = (r, kind) => {
  const z = MAT[kind](r), ctx = z.ctx, uid = `mat|${z.k}|${JSON.stringify(z.data)}`;
  const extra = { uid, pic: z.pic || "", data: Object.assign({ mat: z.k, ctx: ctx.id }, z.data) };
  if (z.mc) return mcqWhy(r, z.q, z.right, z.rightWhy, z.wrong, z.hint, z.steps, extra);
  if (z.pair) return Q(Object.assign({ q: z.q, kind: "pair", val: [z.x, z.y], a: `${z.x}, ${z.y}`, keys: ["-", ","], hint: z.hint, steps: z.steps, slips: z.slips }, extra));
  return numWhy(z.q, z.d, z.hint, z.steps, z.slips, Object.assign({ keys: ["-"] }, extra));
};
topic(10, "matrices", "Matrix Meadow", "🧩", "Add, multiply and invert 2x2 spell grids", r => matQ(r, r.pick(MAT_KINDS)));

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
  const terms = cs.map((c, i) => [c, deg - i]), d = diffPoly(terms), val = evalPoly(d, x0);
  if (r.chance(.5)) return num(`Find the gradient of ${T(`y = ${poly(terms)}`)} at ${T(`x = ${x0}`)}.`, val, "Differentiate (bring the power down, reduce it by 1), then substitute.", [`$\\frac{dy}{dx} = ${poly(d)}$`, `At $x = ${x0}$: $\\frac{dy}{dx} = ${val}$`], { keys: ["-"], data: { terms, x0 } });
  const right = poly(d), wrong = [poly(terms.filter(([, p]) => p > 0).map(([c, p]) => [c, p - 1])), poly(terms.map(([c, p]) => [c * p, p])), poly(d.map(([c, p]) => [c, p + 1])), poly(terms.filter(([, p]) => p > 0).map(([c, p]) => [c * (p - 1), p - 1])), poly(d.map(([c, p]) => [-c, p]))].filter(w => w !== right);
  return mcq(r, `Differentiate ${T(`y = ${poly(terms)}`)}`, T(`\\frac{dy}{dx} = ${right}`), wrong.map(w => T(`\\frac{dy}{dx} = ${w}`)), "d/dx (a xⁿ) = n a xⁿ⁻¹; constants disappear.", terms.filter(([c]) => c).map(([c, p]) => `$${poly([[c, p]])} \\to ${p ? poly([[c * p, p - 1]]) : "0"}$`), { data: { terms } });
});
topic(11, "stationary", "Hilltop Stationary Points", "🏔️", "Where the gradient is zero", r => {
  if (r.chance(.5)) { const a = r.nz(-3, 3), h = r.int(-6, 6), k = r.int(-9, 9), b = -2 * a * h, c = a * h * h + k;
    const termsQ = [[a, 2], [b, 1], [c, 0]], dQ = diffPoly(termsQ);
    return num(`Find the x-coordinate of the stationary point of ${T(`y = ${poly(termsQ)}`)}.`, h, "Set dy/dx = 0.", [`$\\frac{dy}{dx} = ${poly(dQ)} = 0$`, `$x = ${h}$`], { keys: ["-"], data: { terms: termsQ } }); }
  const p = r.int(-4, 4), q = r.int(p + 1, 5), B = -3 * (p + q), C = 6 * p * q; // y = 2x³ − 3(p+q)x² + 6pq·x → y' = 6(x − p)(x − q)
  const termsC = [[2, 3], [B, 2], [C, 1]], dC = diffPoly(termsC);
  return Q({ q: `Find the x-coordinates of the stationary points of ${T(`y = ${poly(termsC)}`)} (type both).`, kind: "set", val: [p, q], a: `${p}, ${q}`, keys: ["-", ","], hint: "Differentiate, set to 0, factorise.", steps: [`$\\frac{dy}{dx} = ${poly(dC)} = 6(${lin(1, -p)})(${lin(1, -q)})$`, `$x = ${p}$ or $x = ${q}$`], data: { terms: termsC } });
});
/* ---------- 🏮 Lantern Tangent Trail (MOE JC1 / H1–H2 calculus applications): gradient on a curve,
   equation of the tangent / normal at a point, match curve+tangent pictures, increasing/decreasing,
   contact-point checks, and kid word problems (lantern trails, hill roads, kite strings, rainbow arcs,
   pumpkin-coach ramps, beanstalk climbs, fairy tram tracks, sports-day runs). Pictures use the shared
   svgCurve / svgTangent kit in math-gen.js (path class=polycurve data-terms, tangent class=tline
   data-m/c/x0, marks class=cdot). Derivative Dragons + Hilltop Stationary share diffPoly (byte-identical). */
const TANG_CTX = [
  { id: "lantern", title: "Lantern trail", who: "Rapunzel", spot: "the lantern trail", thing: "lantern trail", of: "the trail" },
  { id: "hill", title: "Hill road", who: "Fairy Pip", spot: "the hill road", thing: "hill road", of: "the road" },
  { id: "kite", title: "Kite string", who: "Jack", spot: "the kite field", thing: "kite string", of: "the kite string" },
  { id: "rainbow", title: "Rainbow arc", who: "Sumi the star fairy", spot: "the rainbow arc", thing: "rainbow arc", of: "the arc" },
  { id: "coach", title: "Pumpkin-coach ramp", who: "Cinderella", spot: "the palace ramp", thing: "pumpkin-coach ramp", of: "the ramp" },
  { id: "bean", title: "Beanstalk climb", who: "Jack", spot: "the giant beanstalk", thing: "beanstalk climb", of: "the climb" },
  { id: "tram", title: "Fairy tram track", who: "Princess Mira", spot: "the fairy tram track", thing: "tram track", of: "the track" },
  { id: "sports", title: "Sports-day hill", who: "Little Red", spot: "sports day", thing: "sports-day hill", of: "the hill" }
];
const niceTang = r => {
  if (r.chance(.72)) {
    const a = r.pick([-2, -1, 1, 2]), b = r.int(-4, 4), c = r.int(-5, 5);
    return { terms: [[a, 2], [b, 1], [c, 0]], deg: 2 };
  }
  const a = r.pick([-1, 1]), b = r.int(-2, 2), c = r.int(-3, 3), d = r.int(-3, 3);
  return { terms: [[a, 3], [b, 2], [c, 1], [d, 0]], deg: 3 };
};
const tangAt = (terms, x0) => {
  const d = diffPoly(terms), m = evalPoly(d, x0), y0 = evalPoly(terms, x0), c = y0 - m * x0;
  return { d, m, y0, c, x0 };
};
const pickX0 = (r, terms, { nonzero = false } = {}) => {
  const xs = r.shuffle([-3, -2, -1, 0, 1, 2, 3]);
  for (const x0 of xs) {
    const t = tangAt(terms, x0);
    const mOk = Math.abs(t.m * 2 - Math.round(t.m * 2)) < 1e-9;
    const yOk = Math.abs(t.y0 * 2 - Math.round(t.y0 * 2)) < 1e-9;
    if (mOk && yOk && (!nonzero || Math.abs(t.m) > 1e-9)) return Object.assign({ terms }, t);
  }
  const a = r.pick([1, 2, -1, -2]), b = r.pick([-3, -2, -1, 1, 2, 3]), c = r.int(-4, 4), x0 = r.pick([-2, -1, 1, 2]);
  const terms2 = [[a, 2], [b, 1], [c, 0]];
  return Object.assign({ terms: terms2 }, tangAt(terms2, x0));
};
const eqLineTex = (m, c) => {
  const half = { [-1.5]: "-\\frac{3}{2}", [-0.5]: "-\\frac{1}{2}", [0.5]: "\\frac{1}{2}", [1.5]: "\\frac{3}{2}" };
  let front = half[m];
  if (front == null) front = m === 0 ? null : m === 1 ? "" : m === -1 ? "-" : fmt(m);
  if (m === 0) return c === 0 ? "y = 0" : `y = ${fmt(c)}`;
  const mx = front + "x";
  if (c === 0) return `y = ${mx}`;
  return `y = ${mx} ${c < 0 ? "-" : "+"} ${Math.abs(c)}`;
};
const eqLineShow = (m, c) => T(eqLineTex(m, c));
const tangPadWrong = (right, cand, fillers) => {
  const wrong = []; const seen = new Set([String(right)]);
  for (const [o, n] of cand.concat(fillers)) {
    const s = String(o);
    if (seen.has(s) || !n || n.length < 20) continue;
    seen.add(s); wrong.push([s, n]);
    if (wrong.length >= 3) break;
  }
  return wrong;
};
const tangPadSlips = (ans, slips, fillers) => {
  const keep = []; const seen = new Set([String(ans)]);
  for (const [v, n] of slips.concat(fillers)) {
    const s = String(v);
    if (seen.has(s) || !n || n.length < 20) continue;
    if (Math.abs(+v - +ans) < 1e-9) continue;
    seen.add(s); keep.push([v, n]);
    if (keep.length >= 4) break;
  }
  return keep;
};
const tangPic = (z, ctx, { tangent = true, marks } = {}, o = {}) => {
  const mks = marks || [{ n: "P", x: z.x0, y: z.y0, lab: `P(${fmt(z.x0)}, ${fmt(z.y0)})`, dy: z.y0 >= 0 ? -8 : 14 }];
  if (tangent) return svgTangent(ctx.title, z.terms, z.x0, Object.assign({ marks: mks, noContact: true }, o));
  return svgCurve(ctx.title, z.terms, Object.assign({ marks: mks }, o));
};
const TANG = {
  grad: r => {
    const z = pickX0(r, niceTang(r).terms), ctx = r.pick(TANG_CTX), mc = r.chance(.55);
    const pic = tangPic(z, ctx, { tangent: false });
    const q = `${ctx.who} follows ${T(`y = ${poly(z.terms)}`)} along ${ctx.of}. What is the gradient at ${T(`x = ${z.x0}`)}?`;
    const hint = "Differentiate (bring the power down), then substitute the x-value.";
    const steps = [`$\\frac{dy}{dx} = ${poly(z.d)}$`, `At $x = ${z.x0}$: $\\frac{dy}{dx} = ${fmt(z.m)}$`];
    const right = String(fmt(z.m));
    const rightWhy = "Right: differentiate the curve first, then put in the given x — that value of dy/dx is the steepness at the marked point.";
    const fillers = [[fmt(z.m + 2), "Differentiate carefully, then substitute the given x-value."],
      [fmt(z.m - 2), "Keep every sign when you bring the powers down and substitute."],
      [fmt(3), "The gradient is dy/dx at that x, not a random nearby number."],
      [fmt(-3), "Watch the sign of the derivative after you substitute."]];
    if (mc) {
      const cand = [
        [fmt(z.y0), "That is the y-value on the curve. The gradient is dy/dx at that x."],
        [fmt(-z.m), "Watch the sign after you differentiate and substitute."],
        [fmt(evalPoly(z.terms, z.x0 + 1) - z.y0), "That is a rise between nearby points, not the exact derivative."],
        [fmt(z.m === 0 ? 1 : (z.d[0] ? z.d[0][0] : 1)), "That looks at a coefficient, not the full derivative at this x."]
      ];
      return { k: "grad", mc: true, ctx, z, right, rightWhy, wrong: tangPadWrong(right, cand, fillers), q, hint, steps, pic,
        data: { terms: z.terms, x0: z.x0, y0: z.y0, m: z.m, c: z.c } };
    }
    return { k: "grad", mc: false, ctx, z, x: z.m, q, hint, steps, pic,
      data: { terms: z.terms, x0: z.x0, y0: z.y0, m: z.m, c: z.c },
      slips: tangPadSlips(z.m, [
        [z.y0, "That is the height on the curve. The gradient is the derivative at that x."],
        [-z.m, "Check the sign after you differentiate and substitute."],
        [z.m === 0 ? 2 : 0, z.m === 0 ? "Here the derivative really is zero at that point — the curve is flat." : "Substitute into the full derivative, not a guess of zero."],
        [evalPoly(z.terms, z.x0 + 1) - z.y0, "Use the derivative formula, not a rough rise between nearby points."]
      ], [[z.m + 1, "Bring each power down carefully, then put in the x-value."],
        [z.m - 1, "Keep every term of the derivative when you substitute."]]) };
  },
  tangenteq: r => {
    const z = pickX0(r, niceTang(r).terms), ctx = r.pick(TANG_CTX);
    const pic = tangPic(z, ctx, { tangent: true });
    const right = eqLineShow(z.m, z.c);
    const q = `${ctx.who} marks P(${fmt(z.x0)}, ${fmt(z.y0)}) on ${T(`y = ${poly(z.terms)}`)} for ${ctx.of}. What is the equation of the tangent at P?`;
    const hint = "Find m = dy/dx at x₀, then use y − y₀ = m(x − x₀), or rearrange to y = mx + c.";
    const steps = [
      `$\\frac{dy}{dx} = ${poly(z.d)}$; at $x = ${z.x0}$: $m = ${fmt(z.m)}$`,
      `$y - ${paren(z.y0)} = ${fmt(z.m)}(x - ${paren(z.x0)})$`,
      `So $${eqLineTex(z.m, z.c)}$`
    ];
    const rightWhy = "Right: the tangent shares the curve's gradient at P and passes through P, so its equation is the straight line with that steepness through the marked point.";
    const alts = [
      eqLineShow(-z.m, z.c),
      eqLineShow(z.m, z.y0),
      eqLineShow(z.m, z.c === 0 ? 2 : -z.c),
      eqLineShow(z.m === 0 ? 1 : 0, z.c),
      eqLineShow(z.m + (z.m >= 0 ? 1 : -1), z.c),
      eqLineShow(z.m, z.c + 2),
      T(`y - ${paren(z.y0)} = ${fmt(-z.m)}(x - ${paren(z.x0)})`)
    ];
    const notes = [
      "The tangent keeps the same sign of dy/dx at P — do not flip the gradient.",
      "The constant in y = mx + c is y₀ − m x₀, not the y-coordinate alone.",
      "Keep the intercept that makes the line pass through P.",
      "Use the derivative at P for the gradient — a horizontal guess only works when dy/dx is zero.",
      "Differentiate carefully; the steepness at P is exactly dy/dx there.",
      "Rearrange y − y₀ = m(x − x₀) carefully to read off the constant.",
      "The tangent uses +m, the same gradient as the curve at P — not the opposite."
    ];
    const wrong = []; const seen = new Set([right]);
    alts.forEach((o, i) => { if (!seen.has(o) && notes[i] && notes[i].length >= 20) { seen.add(o); wrong.push([o, notes[i]]); } });
    return { k: "tangenteq", mc: true, ctx, z, right, rightWhy, wrong: wrong.slice(0, 3), q, hint, steps, pic,
      data: { terms: z.terms, x0: z.x0, y0: z.y0, m: z.m, c: z.c } };
  },
  normaleq: r => {
    // prefer neat tangent gradients so −1/m stays a clean half/integer
    let z = null;
    for (let t = 0; t < 24 && !z; t++) {
      const cand = pickX0(r, niceTang(r).terms, { nonzero: true });
      const niceM = [-3, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3].some(v => Math.abs(cand.m - v) < 1e-9);
      if (niceM) z = cand;
    }
    if (!z) { const terms = [[1, 2], [0, 1], [1, 0]]; z = Object.assign({ terms }, tangAt(terms, 1)); } // m=2 at x=1
    const ctx = r.pick(TANG_CTX);
    const nm = -1 / z.m;
    const snap = v => { const r2 = Math.round(v * 2) / 2; return Math.abs(v - r2) < 1e-9 ? r2 : (Math.abs(v * 3 - Math.round(v * 3)) < 1e-9 ? Math.round(v * 3) / 3 : rd(v, 4)); };
    const nGrad = snap(nm);
    const nC = z.y0 - nGrad * z.x0;
    const nCsnap = snap(nC);
    const nc = Math.abs(nCsnap - nC) < 1e-6 ? nCsnap : rd(nC, 4);
    const pic = tangPic(z, ctx, { tangent: true });
    const right = eqLineShow(nGrad, nc);
    const q = `A fairy path meets ${T(`y = ${poly(z.terms)}`)} at P(${fmt(z.x0)}, ${fmt(z.y0)}) at a right angle (the normal). What is the equation of the normal?`;
    const hint = "Normal gradient = −1/m, where m is the tangent gradient at P. Then use the point–slope form through P.";
    const steps = [
      `$m_{tan} = ${fmt(z.m)}$ at $x = ${z.x0}$`,
      `$m_{norm} = -\\frac{1}{${fmt(z.m)}} = ${fmt(nGrad)}$`,
      `$y - ${paren(z.y0)} = ${fmt(nGrad)}(x - ${paren(z.x0)})$ → $${eqLineTex(nGrad, nc)}$`
    ];
    const rightWhy = "Right: the normal is perpendicular to the tangent, so its gradient is the negative reciprocal of dy/dx at P, and the line still goes through P.";
    const alts = [
      eqLineShow(z.m, z.c),
      eqLineShow(-z.m, z.c),
      eqLineShow(1 / z.m, z.y0 - (1 / z.m) * z.x0),
      eqLineShow(nGrad, z.c),
      eqLineShow(nGrad, nc === 0 ? 2 : -nc),
      eqLineShow(0, z.y0)
    ];
    const notes = [
      "That is the tangent. The normal uses the negative reciprocal of the tangent gradient.",
      "Flipping the sign alone is not enough unless |m| = 1. Use −1 ÷ m.",
      "You forgot the minus: the reciprocal must also change sign for a right angle.",
      "The normal keeps gradient −1/m, but its intercept is set by passing through P.",
      "Keep the constant that makes the normal pass through the contact point P.",
      "A horizontal normal only appears when the tangent is vertical — use −1 ÷ m here."
    ];
    const wrong = []; const seen = new Set([right]);
    alts.forEach((o, i) => { const s = String(o); if (!seen.has(s) && notes[i] && notes[i].length >= 20) { seen.add(s); wrong.push([s, notes[i]]); } });
    return { k: "normaleq", mc: true, ctx, z, right, rightWhy, wrong: wrong.slice(0, 3), q, hint, steps, pic,
      data: { terms: z.terms, x0: z.x0, y0: z.y0, m: z.m, c: z.c, nm: nGrad, nc } };
  },
  match: r => {
    const z = pickX0(r, niceTang(r).terms), ctx = r.pick(TANG_CTX);
    const key = g => `${JSON.stringify(g.terms)}|${g.x0}`;
    const mk = (terms, x0) => Object.assign({ terms }, tangAt(terms, x0));
    const graphs = [z];
    const seen = new Set([key(z)]);
    const a0 = z.terms[0][0];
    const candidates = [
      mk(z.terms, z.x0 === 0 ? 1 : -z.x0),
      mk(z.terms.map(([c, p]) => [-c, p]), z.x0),
      mk(z.terms.length <= 3
        ? [[a0 === 1 ? 2 : (a0 === -1 ? -2 : Math.sign(a0) || 1), 2], [z.terms[1][0], 1], [z.terms[2][0], 0]]
        : [[a0, 3], [0, 2], [z.terms[2] ? z.terms[2][0] : 1, 1], [z.terms[3] ? z.terms[3][0] : 0, 0]], z.x0),
      mk([[1, 2], [0, 1], [0, 0]], 1),
      mk([[-1, 2], [0, 1], [4, 0]], 0),
      mk([[1, 3], [0, 2], [-3, 1], [0, 0]], 1),
      mk([[2, 2], [-4, 1], [1, 0]], 2)
    ];
    for (const g of r.shuffle(candidates)) {
      if (!seen.has(key(g)) && Number.isFinite(g.m) && graphs.length < 4) { seen.add(key(g)); graphs.push(g); }
    }
    while (graphs.length < 4) {
      const g = pickX0(r, niceTang(r).terms);
      if (!seen.has(key(g))) { seen.add(key(g)); graphs.push(g); }
    }
    const ids = ["g1", "g2", "g3", "g4"], order = r.shuffle([0, 1, 2, 3]), rightId = ids[order.indexOf(0)];
    const optPics = {};
    order.forEach((gi, i) => {
      const g = graphs[gi];
      optPics[ids[i]] = svgTangent(" ", g.terms, g.x0, { small: true, marks: [{ n: "P", x: g.x0, y: g.y0, lab: "" }], noContact: true });
    });
    const wrong = ids.filter(id => id !== rightId).map(id => {
      const g = graphs[order[ids.indexOf(id)]];
      return [id, `That picture touches at (${fmt(g.x0)}, ${fmt(g.y0)}) with steepness ${fmt(g.m)} on $y = ${poly(g.terms)}$. Match the given curve and P.`];
    });
    return { k: "match", mc: true, ctx, z, right: rightId,
      rightWhy: "Right: this picture shows the given curve with its tangent touching at the same point P and with the matching steepness.",
      wrong, q: `Which picture shows ${T(`y = ${poly(z.terms)}`)} with its tangent at P(${fmt(z.x0)}, ${fmt(z.y0)})?`,
      hint: "Match the shape of the curve and where the dashed tangent touches it.",
      steps: [`Curve $y = ${poly(z.terms)}$`, `At $x = ${z.x0}$: $m = ${fmt(z.m)}$, point $(${fmt(z.x0)},\ ${fmt(z.y0)})$`, "Pick the picture where the dashed line touches there."],
      pic: "", optPics, data: { terms: z.terms, x0: z.x0, y0: z.y0, m: z.m, c: z.c, order: order.map(i => key(graphs[i])) } };
  },
  incdec: r => {
    const z0 = pickX0(r, niceTang(r).terms), ctx = r.pick(TANG_CTX);
    const ask = r.pick(["sign", "sign", "find"]);
    if (ask === "sign") {
      const z = z0;
      const pic = tangPic(z, ctx, { tangent: false });
      const increasing = z.m > 0, flat = Math.abs(z.m) < 1e-9;
      const right = flat ? "neither — the gradient is zero" : increasing ? "increasing" : "decreasing";
      const q = `Along ${ctx.of}, ${T(`y = ${poly(z.terms)}`)}. Is the curve increasing or decreasing at ${T(`x = ${z.x0}`)}?`;
      const hint = "Look at the sign of dy/dx: positive → increasing, negative → decreasing, zero → flat (stationary).";
      const steps = [`$\\frac{dy}{dx} = ${poly(z.d)}$`, `At $x = ${z.x0}$: $\\frac{dy}{dx} = ${fmt(z.m)}$`, flat ? "Gradient zero → neither increasing nor decreasing here." : `So the curve is ${right} there.`];
      const rightWhy = flat
        ? "Right: dy/dx is zero at that x, so the curve is briefly flat — not climbing and not falling there."
        : increasing
          ? "Right: dy/dx is positive at that x, so as x grows the curve is climbing."
          : "Right: dy/dx is negative at that x, so as x grows the curve is falling.";
      const cand = [
        [increasing && !flat ? "decreasing" : "increasing", flat ? "When the gradient is zero the curve is flat, not climbing." : `Check the sign of dy/dx = ${fmt(z.m)} at that x.`],
        [flat ? "increasing" : "neither — the gradient is zero", flat ? "Gradient zero means flat, so pick the neither option." : "The gradient is not zero here — read the sign of dy/dx."],
        ["cannot tell without a sketch", "You can tell from the sign of dy/dx alone — no sketch needed."]
      ];
      const fillers = [["decreasing", "Use the sign of the derivative at the given x."],
        ["increasing", "Positive dy/dx means increasing; negative means decreasing."]];
      return { k: "incdec", mc: true, ctx, z, right, rightWhy, wrong: tangPadWrong(right, cand, fillers), q, hint, steps, pic,
        data: { terms: z.terms, x0: z.x0, y0: z.y0, m: z.m, c: z.c, ask: "sign" } };
    }
    let terms = z0.terms, d = diffPoly(terms);
    if (terms.length > 3 || terms[0][0] < 0) {
      const a = r.pick([1, 2]), b = r.int(-3, 3), c = r.int(-4, 4);
      terms = [[a, 2], [b, 1], [c, 0]]; d = diffPoly(terms);
    }
    const candidates = [-2, -1, 0, 1, 2, 3, 4].filter(x => evalPoly(d, x) > 1e-9);
    const xPos = candidates.length ? r.pick(candidates) : 3;
    const zz = Object.assign({ terms }, tangAt(terms, xPos));
    const pic = tangPic(zz, ctx, { tangent: false });
    const right = String(fmt(xPos));
    const q = `On ${ctx.of}, ${T(`y = ${poly(terms)}`)}. Which x-value has a positive gradient?`;
    const hint = "Compute dy/dx, then test which listed x makes it positive.";
    const steps = [`$\\frac{dy}{dx} = ${poly(d)}$`, `At $x = ${xPos}$: $\\frac{dy}{dx} = ${fmt(evalPoly(d, xPos))} > 0$`];
    const rightWhy = "Right: substitute that x into dy/dx and you get a positive value, so the curve is climbing there.";
    const negXs = [-3, -2, -1, 0, 1, 2, 3].filter(x => evalPoly(d, x) <= 0 && x !== xPos);
    const cand = negXs.slice(0, 3).map(x => [String(fmt(x)), `At x = ${fmt(x)}, dy/dx = ${fmt(evalPoly(d, x))}, which is not positive.`]);
    const fillers = [["-4", "Test the derivative at that x — you need dy/dx > 0."],
      ["5", "Check the sign of dy/dx carefully for each option."]];
    return { k: "incdec", mc: true, ctx, z: zz, right, rightWhy, wrong: tangPadWrong(right, cand, fillers), q, hint, steps, pic,
      data: { terms, x0: xPos, y0: zz.y0, m: zz.m, c: zz.c, ask: "find" } };
  },
  point: r => {
    const z = pickX0(r, niceTang(r).terms), ctx = r.pick(TANG_CTX);
    const ask = r.pick(["x", "y", "on"]);
    const pic = tangPic(z, ctx, { tangent: true });
    if (ask === "y") {
      const ans = z.y0;
      return { k: "point", mc: false, ctx, z, x: ans,
        q: `The tangent to ${T(`y = ${poly(z.terms)}`)} at x = ${fmt(z.x0)} is ${eqLineShow(z.m, z.c)}. What is the y-coordinate of the contact point?`,
        hint: "The contact point lies on the curve: substitute x into y = poly.",
        steps: [`$y = ${poly(z.terms)}$ at $x = ${z.x0}$`, `$y = ${fmt(ans)}$`],
        pic, data: { terms: z.terms, x0: z.x0, y0: z.y0, m: z.m, c: z.c, ask: "y" },
        slips: tangPadSlips(ans, [
          [z.c, "That is the tangent's y-intercept, not necessarily the contact y."],
          [z.m, "That is the gradient. The contact y is the curve's value at x₀."],
          [ans === 0 ? 1 : -ans, "Substitute carefully into the curve (watch the signs)."],
          [z.x0, "That is the x-coordinate of the contact point, not y."]
        ], [[ans + 2, "Put x₀ into the curve equation to get the contact height."],
          [ans - 2, "Keep every term when you evaluate the polynomial at x₀."]]) };
    }
    if (ask === "x") {
      const ans = z.x0;
      return { k: "point", mc: false, ctx, z, x: ans,
        q: `A tangent to ${T(`y = ${poly(z.terms)}`)} has equation ${eqLineShow(z.m, z.c)} and touches the curve at y = ${fmt(z.y0)}. What is the contact x?`,
        hint: "The contact point is on both the curve and the tangent. Try the x that makes the curve equal y₀ and matches the gradient.",
        steps: [`Contact height $y = ${fmt(z.y0)}$`, `With tangent gradient $m = ${fmt(z.m)}$, the touch is at $x = ${fmt(ans)}$`],
        pic, data: { terms: z.terms, x0: z.x0, y0: z.y0, m: z.m, c: z.c, ask: "x" },
        slips: tangPadSlips(ans, [
          [z.y0, "That is the contact y, not x."],
          [z.c, "That is the tangent intercept, not the contact x."],
          [ans === 0 ? 1 : -ans, "Check which x on the curve has this y and this tangent gradient."],
          [z.m, "That is the gradient, not the contact x."]
        ], [[ans + 1, "Find the x where the curve meets this tangent."],
          [ans - 1, "Match both the height and the gradient at the contact."]]) };
    }
    const on = r.chance(.55);
    let px, py;
    if (on) {
      const xs = [-3, -2, -1, 0, 1, 2, 3].filter(x => x !== z.x0);
      px = r.pick(xs); py = z.m * px + z.c;
      if (Math.abs(py * 2 - Math.round(py * 2)) > 1e-9) { px = z.x0 + (z.x0 >= 0 ? -1 : 1); py = z.m * px + z.c; }
    } else {
      px = z.x0 + r.pick([-2, -1, 1, 2]); py = z.y0 + r.pick([-3, -2, 2, 3]);
      if (Math.abs(py - (z.m * px + z.c)) < 1e-9) py += 1;
    }
    const right = on ? "yes" : "no";
    const q = `The tangent at P(${fmt(z.x0)}, ${fmt(z.y0)}) to ${T(`y = ${poly(z.terms)}`)} is ${eqLineShow(z.m, z.c)}. Does the point (${fmt(px)}, ${fmt(py)}) lie on that tangent?`;
    const hint = "Substitute the point into the tangent equation (or check whether y equals mx + c).";
    const steps = [`Tangent: $${eqLineTex(z.m, z.c)}$`, `At $x = ${fmt(px)}$: $y = ${fmt(z.m)}(${fmt(px)}) ${z.c < 0 ? "-" : "+"} ${Math.abs(z.c)} = ${fmt(z.m * px + z.c)}$`, on ? `Matches ${fmt(py)} → yes, it lies on the tangent.` : `That is not ${fmt(py)} → no.`];
    const rightWhy = on
      ? "Right: substituting that x into the tangent equation yields exactly that y, so the point sits on the tangent line."
      : "Right: substituting that x into the tangent equation yields a different y, so the point misses the tangent line.";
    const wrong = [
      [on ? "no" : "yes", on ? "Check again: substitute x into y = mx + c — it does match." : "Substitute carefully into the tangent; the y values do not match."],
      ["cannot tell", "You can tell by substituting the point into the tangent equation."],
      ["only if it is also on the curve", "The question asks about the tangent line, not about a second intersection with the curve."]
    ];
    return { k: "point", mc: true, ctx, z, right, rightWhy, wrong, q, hint, steps, pic,
      data: { terms: z.terms, x0: z.x0, y0: z.y0, m: z.m, c: z.c, ask: "on", px, py, on } };
  },
  story: r => {
    const kind = r.pick(["grad", "grad", "tang", "rate"]);
    const ctx = r.pick(TANG_CTX);
    const z = pickX0(r, niceTang(r).terms, { nonzero: kind === "tang" });
    const pic = tangPic(z, ctx, { tangent: kind === "tang" });
    if (kind === "grad" || kind === "rate") {
      const who = ctx.who.split(" ")[0];
      const q = kind === "rate"
        ? `On ${ctx.of}, height follows ${T(`y = ${poly(z.terms)}`)} metres with x in steps. How fast is the height changing (gradient) at step ${fmt(z.x0)}?`
        : `${ctx.who} walks ${ctx.of} shaped like ${T(`y = ${poly(z.terms)}`)}. What is the steepness (gradient) at x = ${fmt(z.x0)}?`;
      return { k: "story", mc: false, ctx, z, x: z.m, q,
        hint: "Differentiate the height equation, then substitute the given x.",
        steps: [`$\\frac{dy}{dx} = ${poly(z.d)}$`, `At $x = ${z.x0}$: gradient $= ${fmt(z.m)}$`],
        pic, data: { terms: z.terms, x0: z.x0, y0: z.y0, m: z.m, c: z.c, word: kind },
        slips: tangPadSlips(z.m, [
          [z.y0, `That is the height at that step (${who}'s height), not how fast it is changing.`],
          [-z.m, "Watch the sign of the derivative after you substitute."],
          [z.x0, "That is the step number, not the gradient."],
          [z.c, "That mixes in a tangent intercept. Use dy/dx at the given x."]
        ], [[z.m + 1, "Bring each power down carefully, then substitute."],
          [z.m - 1, "Keep every term of the derivative when you substitute."]]) };
    }
    const right = eqLineShow(z.m, z.c);
    const q = `${ctx.who} wants a straight fairy-guide rail that just touches ${ctx.of} ${T(`y = ${poly(z.terms)}`)} at x = ${fmt(z.x0)}. Which equation is that tangent rail?`;
    const hint = "Find the gradient at x₀, then write the line through the contact point.";
    const steps = [
      `$m = ${fmt(z.m)}$ at $x = ${z.x0}$ (contact $y = ${fmt(z.y0)}$)`,
      `Rail: $${eqLineTex(z.m, z.c)}$`
    ];
    const rightWhy = "Right: the guide rail must match the steepness of the curve at the touch point and pass through that point.";
    const alts = [
      eqLineShow(-z.m, z.c),
      eqLineShow(z.m, z.y0),
      eqLineShow(z.m, z.c === 0 ? 1 : -z.c),
      eqLineShow(0, z.y0),
      eqLineShow(z.m + 1, z.c)
    ];
    const notes = [
      "Keep the sign of dy/dx for the rail's gradient.",
      "The constant is y₀ − m x₀, not the contact height alone.",
      "Rearrange the point–slope form carefully to get the intercept.",
      "A flat rail only fits when the curve itself is flat at that x.",
      "Use the exact derivative at the contact — not one step steeper."
    ];
    const wrong = []; const seen = new Set([right]);
    alts.forEach((o, i) => { if (!seen.has(o)) { seen.add(o); wrong.push([o, notes[i]]); } });
    return { k: "story", mc: true, ctx, z, right, rightWhy, wrong: wrong.slice(0, 3), q, hint, steps, pic,
      data: { terms: z.terms, x0: z.x0, y0: z.y0, m: z.m, c: z.c, word: "tang" } };
  }
};
const TANG_KINDS = ["grad", "grad", "tangenteq", "tangenteq", "normaleq", "match", "match", "incdec", "incdec", "point", "point", "story", "story"];
const tangQ = (r, kind) => {
  const z = TANG[kind](r), ctx = z.ctx, uid = `tangent|${z.k}|${JSON.stringify(z.data)}`;
  const extra = { uid, pic: z.pic || "", data: Object.assign({ tangent: z.k, ctx: ctx.id }, z.data) };
  if (z.optPics) extra.optPics = z.optPics;
  if (z.mc) return mcqWhy(r, z.q, z.right, z.rightWhy, z.wrong, z.hint, z.steps, extra);
  return numWhy(z.q, z.x, z.hint, z.steps, z.slips, Object.assign({ keys: ["-", ".", "/"] }, extra));
};
topic(11, "tangent", "Lantern Tangent Trail", "🏮", "Tangents, normals and gradients on curves", r => tangQ(r, r.pick(TANG_KINDS)));

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
  const ang = toDeg(Math.acos(Math.max(-1, Math.min(1, dot / (ma * mb)))));
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
  if (t === 0) { const tr = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]]), x = tr[0] * r.pick([1, -1]), y = tr[1] * r.pick([1, -1]); return num(`Find ${T(`|${Z(x, y)}|`)}.`, tr[2], "|a + bi| = √(a² + b²)", [`$${sqrtTex(`${paren(x)}^2 + ${paren(y)}^2`)} = ${tr[2]}$`], { data: { x, y, t } }); }
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

/* Task 12: word problems stay last in every grade, and Right-Angle Paths sits with the other Additional Mathematics extra. */
{
  const T = M.TOPICS;
  const pi = T.findIndex(t => t.id === "g9.perpline"), si = T.findIndex(t => t.id === "g9.surds");
  if (pi >= 0 && si >= 0 && pi !== si + 1) { const [moved] = T.splice(pi, 1); T.splice(T.findIndex(t => t.id === "g9.surds") + 1, 0, moved); }
  for (const g of [...new Set(T.map(t => t.grade))]) {
    const idxs = []; T.forEach((t, i) => { if (t.grade === g) idxs.push(i); });
    const slice = idxs.map(i => T[i]);
    const next = slice.filter(t => !t.story).concat(slice.filter(t => t.story));
    idxs.forEach((i, k) => { T[i] = next[k]; });
  }
}

})();
