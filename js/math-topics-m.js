/* 🔢 Number Kingdom topics, Grades 5–8 (Singapore Primary 5–6, Secondary 1–2). */
(function () {
const M = (typeof module !== "undefined" && module.exports) ? require("./math-gen.js") : window.MathGen;
const { Q, num, mcq, T, NAMES, topic, gcd, lcm, rd, fmt, simp, fracTex, fracStr, mixedTex, poly, lin, paren, pm, undo } = M._internal;

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
