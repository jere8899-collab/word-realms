/* 🔢 Number Kingdom topics, Grades 1–4 (Singapore Primary 1–4). Each gen(r) gets a seeded rng and returns a question. */
(function () {
const M = (typeof module !== "undefined" && module.exports) ? require("./math-gen.js") : window.MathGen;
const { Q, num, mcq, T, NAMES, THINGS, COUNT_EMOJI, PASTEL, svgBox, figKey, cellKey, hasCell, nearCells, gridPaper, gridCell, svgClock, pad2, hm, clockWords, h24, ampm, dur, SHAPES, svgShape, svgPie, picto, svgBars, svgLine, table, coin, emojiRows, colAdd, colSub, topic, gcd, lcm, rd, fmt, money, simp, fracTex, fracStr, mixedTex } = M._internal;
const ord = k => k + (k % 100 >= 11 && k % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][k % 10] || "th");

/* ---------- 📊 data analysis (MOE: P1 picture graphs, P2 picture graphs with scales, P3 bar graphs, P4 tables + line graphs) ---------- */
// a theme is either a vote (categories are things children chose) or a collection (categories are friends who collected things)
const VOTES = [
  { title: "Favourite fruit at the Fairy Picnic", kind: "fruit", cats: [["Apple", "🍎"], ["Banana", "🍌"], ["Grapes", "🍇"], ["Berry", "🍓"], ["Cherry", "🍒"], ["Peach", "🍑"]] },
  { title: "Favourite pets in Class 2B", kind: "pet", cats: [["Cat", "🐱"], ["Dog", "🐶"], ["Rabbit", "🐰"], ["Fish", "🐟"], ["Hamster", "🐹"], ["Bird", "🐦"]] },
  { title: "Favourite rides at the Fairy Fair", kind: "ride", cats: [["Carousel", "🎠"], ["Big wheel", "🎡"], ["Coaster", "🎢"], ["Dodgems", "🚗"], ["Swan boat", "🦢"]] },
  { title: "Favourite sports at Abacus School", kind: "sport", cats: [["Football", "⚽"], ["Swimming", "🏊"], ["Badminton", "🏸"], ["Basketball", "🏀"], ["Dance", "💃"]] },
  { title: "Favourite treats at the Gingerbread Café", kind: "treat", cats: [["Cupcake", "🧁"], ["Cookie", "🍪"], ["Ice cream", "🍦"], ["Donut", "🍩"], ["Lollipop", "🍭"]] }
];
const FRIENDS = ["Mira", "Oli", "Pip", "Jack", "Goldie", "Rapunzel", "Aladdin"].map(n => [n, "🧚"]);
const COLLECTS = [
  { title: "Shells found on Mermaid Beach", unit: "shells", base: "find", past: "found", e: "🐚" },
  { title: "Strawberries picked in Button Meadow", unit: "strawberries", base: "pick", past: "picked", e: "🍓" },
  { title: "Cupcakes baked for the Royal Party", unit: "cupcakes", base: "bake", past: "baked", e: "🧁" },
  { title: "Books read in the Fairy Library", unit: "books", base: "read", past: "read", e: "📚" },
  { title: "Stickers earned in Number Kingdom", unit: "stickers", base: "earn", past: "earned", e: "⭐" }
];
// n different whole numbers between lo and hi (so "most" and "fewest" always have one answer)
const distinct = (r, n, lo, hi) => r.shuffle(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)).slice(0, n);
const graphTheme = (r, n) => {
  if (r.chance(.5)) { const t = r.pick(VOTES), cats = r.shuffle(t.cats).slice(0, n).map(([name, e]) => ({ name, e, lab: `${e} ${name}` }));
    return { title: t.title, unit: "children", cats, how: c => `How many children chose ${c.lab}?`, more: (a, b) => `How many more children chose ${a.lab} than ${b.lab}?`,
      both: (a, b) => `How many children chose ${a.lab} or ${b.lab} altogether?`, all: "How many children voted altogether?", most: big => `Which ${t.kind} was chosen by the ${big ? "most" : "fewest"} children?`,
      will: (c, v) => `${v} children chose ${c.lab}.` }; }
  const t = r.pick(COLLECTS), cats = r.shuffle(FRIENDS).slice(0, n).map(([name]) => ({ name, e: t.e, lab: name }));
  return { title: t.title, unit: t.unit, icon: t.e, cats, how: c => `How many ${t.unit} did ${c.name} ${t.base}?`, more: (a, b) => `How many more ${t.unit} did ${a.name} ${t.base} than ${b.name}?`,
    both: (a, b) => `How many ${t.unit} did ${a.name} and ${b.name} ${t.base} altogether?`, all: `How many ${t.unit} were ${t.past} altogether?`, most: big => `Who ${t.past} the ${big ? "most" : "fewest"} ${t.unit}?`,
    will: (c, v) => `${c.name} ${t.past} ${v} ${t.unit}.` };
};
// the shared question set for picture graphs and bar graphs; read(i) explains how to read one value off the graph
const one = th => th.unit === "children" ? "child" : th.unit.replace(/ies$/, "y").replace(/s$/, "");
const graphQ = (r, th, vals, pic, read, extra = {}) => {
  const n = vals.length, i = r.int(0, n - 1), j = (i + r.int(1, n - 1)) % n, [a, b] = vals[i] >= vals[j] ? [i, j] : [j, i], c = th.cats, t = r.int(0, extra.inverse ? 5 : 4);
  const o = { pic, data: { graph: extra.kind || "bars", vals, scale: extra.scale || 1, names: c.map(x => x.name) } };
  if (t === 0) return num(th.how(c[i]), vals[i], extra.hint || "Find the row or bar, then read its value.", [read(i)], o);
  if (t === 1) return num(th.more(c[a], c[b]), vals[a] - vals[b], "Read both values, then subtract the smaller from the bigger.", [read(a), read(b), `${vals[a]} − ${vals[b]} = ${vals[a] - vals[b]}`], o);
  if (t === 2) return num(th.both(c[i], c[j]), vals[i] + vals[j], "Read both values, then add.", [read(i), read(j), `${vals[i]} + ${vals[j]} = ${vals[i] + vals[j]}`], o);
  if (t === 3) { const tot = vals.reduce((x, y) => x + y, 0); return num(th.all, tot, "Read every value, then add them all.", [vals.join(" + ") + ` = ${tot}`], o); }
  if (t === 4) { const big = r.chance(.5), k = vals.indexOf(big ? Math.max(...vals) : Math.min(...vals));
    return mcq(r, th.most(big), c[k].lab, c.filter((_, x) => x !== k).map(x => x.lab), big ? "Look for the longest row or tallest bar." : "Look for the shortest row or bar.", [read(k), `${c[k].lab} has the ${big ? "most" : "fewest"}.`], o); }
  const s = extra.scale, k = r.int(2, 9), v = k * s; // inverse: how many pictures to draw
  return num(`Fairy Pip makes a new picture graph with the same key. ${th.will(c[i], v)} How many ${th.icon || c[i].e} should Pip draw for ${c[i].lab}?`, k, `Each picture stands for ${s}. How many ${s}s make ${v}?`, [`${v} ÷ ${s} = ${k}`, `Draw ${k} pictures.`], o);
};

/* ---------- Grade 1 (Primary 1) ---------- */
topic(1, "count", "Counting Stars", "⭐", "Count objects up to 20", r => {
  const n = r.int(3, 20), e = r.pick(COUNT_EMOJI), rows = Math.floor(n / 5), rest = n % 5;
  const fives = Array.from({ length: rows }, (_, i) => 5 * (i + 1)), ones = Array.from({ length: rest }, (_, i) => rows * 5 + i + 1);
  return num(`How many ${e} can you count?`, n, "Count the full rows of 5 first: 5, 10, 15…", [`There ${rows === 1 ? "is" : "are"} ${rows} full row${rows === 1 ? "" : "s"} of 5${rest ? ` and ${rest} more` : ""}.`, `${fives.concat(ones).join(", ")} → ${n}`], { pic: emojiRows(n, e), data: { n } });
});
topic(1, "add20", "Adding Apples", "🍎", "Add within 20", r => {
  const a = r.int(1, 15), b = r.int(1, 20 - a), s = a + b, big = Math.max(a, b), small = Math.min(a, b), toTen = 10 - big;
  const bridge = big < 10 && s > 10;
  return num(T(`${a} + ${b} = \\;?`), s, bridge ? `Make 10 first: ${big} needs ${toTen} more to make 10.` : `Start at ${big} and count on ${small}.`,
    bridge ? [`Split ${small} into ${toTen} and ${small - toTen}.`, `${big} + ${toTen} = 10`, `10 + ${small - toTen} = ${s}`] : [`Start at ${big}, count on ${small}: ${Array.from({ length: small }, (_, i) => big + i + 1).join(", ")}`, `So ${a} + ${b} = ${s}`], { data: { a, b, op: "+" } });
});
topic(1, "sub20", "Taking Away", "🍄", "Subtract within 20", r => {
  const a = r.int(5, 20), b = r.int(1, a), d = a - b, nm = r.pick(NAMES), [th, e] = r.pick(THINGS);
  const q = r.chance(.5) ? T(`${a} - ${b} = \\;?`) : `${nm} has ${a} ${th} ${e}. ${b} ${b === 1 ? "is" : "are"} given away. How many are left?`;
  return num(q, d, `Count back ${b} from ${a}, or think: ${b} + ? = ${a}`, [`${b} + ${d} = ${a}`, `So ${a} − ${b} = ${d}`], { data: { a, b, op: "-" } });
});
topic(1, "bonds", "Number Bonds", "🔗", "Find the missing part", r => {
  const w = r.int(5, 20), p = r.int(0, w), m = w - p;
  return num(r.chance(.5) ? T(`${p} + \\square = ${w}`) : T(`\\square + ${p} = ${w}`), m, `What do you add to ${p} to make ${w}?`, [`${w} − ${p} = ${m}`, `Check: ${p} + ${m} = ${w}`], { data: { w, p } });
});
topic(1, "shapes", "Shape Garden", "🔷", "Name shapes, count sides and corners", r => {
  const k = r.pick(Object.keys(SHAPES)), fill = r.pick(["#C8F2DC", "#FFD6E0", "#E2D6FF", "#D6EEFF", "#FFF4C2"]), sh = SHAPES[k];
  if (k === "circle" || r.chance(.5)) return mcq(r, "What is the name of this shape?", k, r.shuffle(Object.keys(SHAPES).filter(x => x !== k)), "Count the sides and look at the corners.", [`It has ${sh.sides ? sh.sides + " straight sides" : "no straight sides and no corners"}${k === "square" ? " that are all the same length" : k === "rectangle" ? ", with opposite sides the same length" : ""}.`, `It is a ${k}.`], { pic: svgShape(k, fill) });
  const what = r.pick(["sides", "corners"]);
  return num(`How many ${what} does this ${k} have?`, sh[what], `Put your finger on each ${what === "sides" ? "side" : "corner"} and count.`, [`A ${k} has ${sh.sides} sides and ${sh.corners} corners.`], { pic: svgShape(k, fill) });
});
topic(1, "money", "Coin Purse", "🪙", "Count coins in cents", r => {
  const coins = []; let tot = 0; const n = r.int(2, 5);
  for (let i = 0; i < n; i++) { const c = r.pick(tot > 50 ? [5, 10, 20] : [5, 10, 20, 50]); if (tot + c > 100) break; coins.push(c); tot += c; }
  coins.sort((a, b) => b - a);
  return num(`The Frog King's purse holds these coins. How many cents altogether?`, tot, "Start with the biggest coin and count on.", [coins.map(c => c + "¢").join(" + ") + ` = ${tot}¢`], { pic: `<div class="mpic coins">${coins.map(coin).join("")}</div>`, data: { coins } });
});
// 🕰️ "what time is it?" on a clock picture; the answer is typed as h:mm (shared by the clock topics)
const readClock = (h, m, q, hint, steps) => Q({ q, kind: "time", val: h * 60 + m, a: hm(h, m), keys: [":"], pic: svgClock(h, m), hint, steps, data: { h, m } });
topic(1, "time", "Clock Tower", "🕰️", "O'clock and half past", r => {
  const h = r.int(1, 12), m = r.pick([0, 30]);
  return readClock(h, m, "What time does the Clock Tower show? (type it like 3:30)", "The short hand shows the hour. The long hand on 12 means o'clock; on 6 means half past.",
    [m ? `The long hand points to 6 → half past. The short hand is just past ${h}.` : `The long hand points to 12 → o'clock. The short hand points to ${h}.`, `It is ${m ? "half past " + h : h + " o'clock"} (${hm(h, m)}).`]);
});
topic(1, "picgraph", "Picture Graphs", "🖼️", "Read a picture graph (1 picture = 1)", r => {
  const th = graphTheme(r, r.int(3, 4)), vals = distinct(r, th.cats.length, 1, 8);
  return graphQ(r, th, vals, picto(th.title, th.cats.map((c, i) => ({ name: c.lab, n: vals[i], e: c.e })), `Each picture stands for 1 ${one(th)}.`),
    i => `${th.cats[i].lab}: count the pictures → ${vals[i]}`, { kind: "picto", hint: "Count the pictures in that row." });
});
topic(1, "story", "Fairytale Problems", "📜", "Word problems within 20", r => {
  const [th, e] = r.pick(THINGS), nm = r.pick(NAMES), t = r.int(0, 2);
  if (t === 0) { const a = r.int(2, 10), b = r.int(1, 10); return num(`${nm} picks ${a} ${th} ${e} in the morning and ${b} more after lunch. How many ${th} now?`, a + b, "Altogether means add.", [`${a} + ${b} = ${a + b}`], { viz: { type: "bar", tip: "Two parts make the whole.", rows: [{ name: th, alt: 1, parts: [{ v: a, t: a }, { v: b, t: b }], braces: [{ from: 0, to: a + b, t: "?", rt: a + b, q: 1 }] }] } }); }
  if (t === 1) { const a = r.int(8, 20), b = r.int(1, a - 1); return num(`There were ${a} ${th} ${e} on the castle table. The hungry giant ate ${b}. How many are left?`, a - b, "Left means take away.", [`${a} − ${b} = ${a - b}`], { viz: { type: "bar", tip: "The whole is known. Take away the eaten part.", rows: [{ name: th, parts: [{ v: b, t: `${b} eaten`, fill: "#EEE6F6" }, { v: a - b, t: "?", rt: a - b, q: 1 }], braces: [{ from: 0, to: a, t: a }] }] } }); }
  const a = r.int(3, 12), b = r.int(a + 1, 20); return num(`Goldilocks has ${a} ${th}. Baby Bear has ${b}. How many more does Baby Bear have?`, b - a, "How many more → find the difference.", [`${b} − ${a} = ${b - a}`], { viz: { type: "bar", tip: "Line the bars up. The extra bit is the difference.", rows: [{ name: "Goldilocks", parts: [{ v: a, t: a }] }, { name: "Baby Bear", parts: [{ v: a, t: a }, { v: b - a, t: "?", rt: b - a, q: 1 }], braces: [{ from: 0, to: b, t: b, below: 1 }] }] } });
}, { story: true });

/* ---------- Grade 2 (Primary 2) ---------- */
topic(2, "add", "Gumdrop Sums", "🍬", "Add within 1000 with regrouping", r => {
  const big = r.chance(.6), a = big ? r.int(100, 799) : r.int(12, 79), b = big ? r.int(10, 999 - a) : r.int(5, 99 - a), s = a + b;
  return num(T(`${a} + ${b} = \\;?`), s, "Add the ones first, then the tens, then the hundreds. Carry when you reach 10.", colAdd(a, b).concat([`Answer: ${s}`]), { data: { a, b, op: "+" } });
});
topic(2, "sub", "Bridge Subtraction", "🌉", "Subtract within 1000", r => {
  const big = r.chance(.6), a = big ? r.int(200, 999) : r.int(30, 99), b = big ? r.int(10, a - 1) : r.int(5, a - 1);
  return num(T(`${a} - ${b} = \\;?`), a - b, "Subtract the ones first. If the top digit is smaller, regroup from the next place.", colSub(a, b).concat([`Answer: ${a - b}. Check: ${a - b} + ${b} = ${a}`]), { data: { a, b, op: "-" } });
});
topic(2, "place", "Place Value Castle", "🏰", "Hundreds, tens and ones", r => {
  const n = r.int(101, 999), d = String(n), t = r.int(0, 2);
  if (t === 0) { const i = r.int(0, 2), names = ["hundreds", "tens", "ones"], v = +d[i] * Math.pow(10, 2 - i); return num(`What is the value of the underlined digit in ${d.slice(0, i)}<u>${d[i]}</u>${d.slice(i + 1)}?`, v, "Which place is it in: hundreds, tens or ones?", [`${d[i]} is in the ${names[i]} place.`, `${d[i]} ${names[i]} = ${v}`], { viz: { type: "blocks", n, tip: "Flats are hundreds, sticks are tens, little cubes are ones." } }); }
  if (t === 1) return num(`${d[0]} hundreds, ${d[1]} tens and ${d[2]} ones make what number?`, n, "Write the hundreds digit, then tens, then ones.", [`${+d[0] * 100} + ${+d[1] * 10} + ${+d[2]} = ${n}`], { viz: { type: "blocks", n, tip: "Count the flats, then the sticks, then the cubes." } });
  const opts = [n, n + r.pick([10, 100, 1]), n - r.pick([10, 1]), +(d[0] + d[2] + d[1]), +(d[1] + d[0] + d[2])].filter((x, i, a) => a.indexOf(x) === i && x > 99 && x < 1000);
  const mx = Math.max(...opts); return mcq(r, "Which number is the greatest?", String(mx), opts.filter(x => x !== mx).map(String), "Compare the hundreds first, then the tens, then the ones.", [`Comparing place by place, ${mx} is the greatest.`]);
});
topic(2, "times", "Times Tables 2, 3, 4, 5, 10", "✖️", "Early multiplication", r => {
  const a = r.pick([2, 3, 4, 5, 10]), b = r.int(1, 10);
  return num(r.chance(.7) ? T(`${a} \\times ${b} = \\;?`) : `There are ${b} fairy ring${b > 1 ? "s" : ""} with ${a} mushrooms 🍄 each. How many mushrooms?`, a * b, `Count in ${a}s, ${b} times.`, [`Count in ${a}s: ${Array.from({ length: b }, (_, i) => a * (i + 1)).join(", ")}`, `${b} group${b > 1 ? "s" : ""} of ${a} = ${a * b}`], { data: { a, b, op: "×" } });
});
topic(2, "share", "Sharing Fairly", "🧁", "Divide equally (2, 3, 4, 5, 10)", r => {
  const d = r.pick([2, 3, 4, 5, 10]), q = r.int(1, 10), n = d * q, [th, e] = r.pick(THINGS);
  return num(r.chance(.5) ? T(`${n} \\div ${d} = \\;?`) : `${n} ${th} ${e} are shared equally among ${d} dwarfs. How many does each dwarf get?`, q, `Which number times ${d} makes ${n}?`, [`${d} × ${q} = ${n}`, `So ${n} ÷ ${d} = ${q}`], { data: { a: n, b: d, op: "÷" } });
});
topic(2, "money", "Dollars & Cents", "💰", "Add and subtract money", r => {
  const a = r.int(105, 900) / 100, b = r.int(50, 500) / 100, sub = r.chance(.4) && a > b, v = rd(sub ? a - b : a + b, 2);
  return num(sub ? `A magic wand costs ${T(money(a))}. A ribbon costs ${T(money(b))}. How much more is the wand? (in $)` : `Red Riding Hood buys bread for ${T(money(a))} and honey for ${T(money(b))}. How much does she spend? (in $)`, v,
    "Line up the decimal points (dollars under dollars, cents under cents).", [`$${a.toFixed(2)} ${sub ? "−" : "+"} $${b.toFixed(2)} = $${v.toFixed(2)}`], { a: v.toFixed(2), tol: 0.001, keys: ["."], data: { a, b, op: sub ? "-" : "+" } });
});
topic(2, "time", "Five-Minute Clock", "⏰", "Tell the time to 5 minutes", r => {
  const h = r.int(1, 12), m = r.int(0, 11) * 5;
  return readClock(h, m, "What time is it? (type it like 4:25)", "Count the long hand in fives from the 12: 5, 10, 15…",
    [`The long hand points to ${m ? m / 5 : 12} → ${m} minutes.`, `The short hand is ${m ? "just past " : "on "}${h} → ${hm(h, m)}`]);
});
topic(2, "frac", "Pizza Fractions", "🍕", "Halves, thirds and quarters", r => {
  if (r.chance(.55)) { const d = r.pick([2, 3, 4, 6, 8]), k = r.int(1, d - 1);
    return Q({ q: "What fraction of the pie is shaded pink? (type it like 1/4)", val: k / d, a: `${k}/${d}`, keys: ["/"], pic: svgPie(k, d), hint: "Bottom number: how many equal parts. Top number: how many are shaded.", steps: [`The pie has ${d} equal parts and ${k} ${k === 1 ? "is" : "are"} shaded.`, `Fraction shaded = $\\frac{${k}}{${d}}$${gcd(k, d) > 1 ? ` (the same as $${fracTex(k, d)}$)` : ""}`], data: { k, d } }); }
  const d = r.pick([2, 3, 4]), n = d * r.int(1, 6); return num(`What is ${T(`\\frac{1}{${d}}`)} of ${n} magic beans?`, n / d, `Share ${n} into ${d} equal groups.`, [`${n} ÷ ${d} = ${n / d}`], { viz: { type: "bar", tip: `Cut the bar into ${d} equal units. One unit is the answer.`, rows: [{ parts: Array.from({ length: d }, (_, i) => i ? { v: 1, t: "", fill: "#fff" } : { v: 1, t: "?", rt: n / d, q: 1 }), braces: [{ from: 0, to: d, t: n, below: 1 }] }] } });
});
topic(2, "picgraph", "Picture Graph Parade", "🎏", "Picture graphs with a key (1 picture = 2, 5 or 10)", r => {
  const th = graphTheme(r, 4), s = r.pick([2, 2, 5, 5, 10, 3, 4]), ns = distinct(r, 4, 1, 8), vals = ns.map(n => n * s), e = th.icon || "🙋";
  return graphQ(r, th, vals, picto(th.title, th.cats.map((c, i) => ({ name: c.lab, n: ns[i], e })), `Each ${e} stands for ${s} ${th.unit}.`),
    i => `${th.cats[i].lab}: ${ns[i]} pictures × ${s} = ${vals[i]}`, { kind: "picto", scale: s, inverse: true, hint: `Count the pictures, then multiply by ${s} (each picture stands for ${s}).` });
});
topic(2, "story", "Fairytale Problems", "📜", "Two-step word problems", r => {
  const t = r.int(0, 2), nm = r.pick(NAMES);
  if (t === 0) { const a = r.int(3, 9), b = r.pick([2, 5, 10]); return num(`${nm} has ${a} baskets. Each basket holds ${b} golden apples 🍎. How many apples?`, a * b, "Equal groups → multiply.", [`${a} × ${b} = ${a * b}`], { viz: { type: "array", rows: a, cols: b, tip: `${a} baskets, ${b} apples in each.` } }); }
  if (t === 1) { const a = r.int(40, 90), b = r.int(10, 30), c = r.int(5, 20); return num(`The Gingerbread Baker baked ${a} cookies. He sold ${b} and then baked ${c} more. How many cookies does he have now?`, a - b + c, "Do it in two steps: take away, then add.", [`${a} − ${b} = ${a - b}`, `${a - b} + ${c} = ${a - b + c}`], { viz: { type: "bar", tip: "Take away the sold part, then join the new batch.", rows: [{ name: "baked", parts: [{ v: b, t: `sold ${b}`, fill: "#EEE6F6" }, { v: a - b, t: a - b > 9 ? "left" : "" }], braces: [{ from: 0, to: a, t: a }] }, { name: "now", parts: [{ v: b, t: "", fill: "rgba(0,0,0,0)" }, { v: a - b, t: "left" }, { v: c, t: c, fill: "#CDE8FF" }], braces: [{ from: b, to: a + c, t: "?", rt: a - b + c, q: 1, below: 1 }] }] } }); }
  const per = r.pick([2, 5, 10]), p = r.int(2, 9); return num(`A glass slipper costs ${per} gold coins. Cinderella has ${per * p} coins. How many slippers can she buy?`, p, "How many groups of the price fit into her coins? → divide.", [`${per * p} ÷ ${per} = ${p}`], { viz: { type: "bar", tip: `Cut the coins into chunks of ${per}. How many chunks?`, rows: [{ parts: Array.from({ length: p }, (_, i) => ({ v: per, t: i < 2 ? per : "", fill: i % 2 ? "#BDEFD3" : "#FFB8D1" })), braces: [{ from: 0, to: per * p, t: `${per * p} coins`, below: 1 }, { from: 0, to: per * p, t: "how many slippers?", q: 1, rt: `${p} slippers` }] }] } });
}, { story: true });

/* ---------- Grade 3 (Primary 3) ---------- */
topic(3, "times", "Times Tables 6, 7, 8, 9", "✖️", "Multiplication facts", r => {
  const a = r.pick([6, 7, 8, 9]), b = r.int(2, 12);
  return num(T(`${a} \\times ${b} = \\;?`), a * b, b > 5 ? `Use a fact you know: ${a} × 5 = ${a * 5}, then add ${b - 5} more ${a}${b - 5 > 1 ? "s" : ""}.` : `Count in ${a}s.`,
    b > 5 ? [`${a} × 5 = ${a * 5}`, `${a} × ${b - 5} = ${a * (b - 5)}`, `${a * 5} + ${a * (b - 5)} = ${a * b}`] : [`${a} × ${b} = ${a * b}`], { data: { a, b, op: "×" } });
});
topic(3, "divrem", "Division with Remainders", "➗", "Share and see what's left (type 7 r 2)", r => {
  const d = r.int(2, 9), q = r.int(2, 12), rem = r.int(1, d - 1), n = d * q + rem;
  return Q({ q: `${T(`${n} \\div ${d}`)} = ? (type the answer like 7 r 2)`, kind: "rem", val: [q, rem], a: `${q} r ${rem}`, keys: ["r"], hint: `Find the biggest multiple of ${d} that is not more than ${n}.`, steps: [`${d} × ${q} = ${d * q}`, `${n} − ${d * q} = ${rem} left over`, `So ${n} ÷ ${d} = ${q} remainder ${rem}`], data: { n, d } });
});
topic(3, "add4", "Big Number Bridge", "🌈", "Add and subtract to 10 000", r => {
  const a = r.int(1000, 8999), b = r.int(100, 9999 - a);
  if (r.chance(.5)) { const x = a + b; return num(T(`${x} - ${b} = \\;?`), a, "Subtract column by column from the ones.", colSub(x, b).concat([`Answer: ${a}`]), { data: { a: x, b, op: "-" } }); }
  return num(T(`${a} + ${b} = \\;?`), a + b, "Add column by column from the ones; carry tens.", colAdd(a, b).concat([`Answer: ${a + b}`]), { data: { a, b, op: "+" } });
});
topic(3, "mul", "Multiply by One Digit", "🔢", "2–3 digits × 1 digit", r => {
  const a = r.int(12, 399), b = r.int(2, 9), t = Math.floor(a / 10) * 10, o = a % 10;
  return num(T(`${a} \\times ${b} = \\;?`), a * b, `Split ${a} into ${t} + ${o}.`, [`$${t} \\times ${b} = ${t * b}$`, `$${o} \\times ${b} = ${o * b}$`, `$${t * b} + ${o * b} = ${a * b}$`], { data: { a, b, op: "×" } });
});
topic(3, "eqfrac", "Equivalent Fractions", "🥧", "Same amount, different fractions", r => {
  const d = r.int(2, 9), n = r.int(1, d - 1), k = r.int(2, 5), hideTop = r.chance(.6);
  return num(hideTop ? T(`\\frac{${n}}{${d}} = \\frac{\\square}{${d * k}}`) : T(`\\frac{${n}}{${d}} = \\frac{${n * k}}{\\square}`), hideTop ? n * k : d * k, `What was the ${hideTop ? "bottom" : "top"} number multiplied by?`, [`${hideTop ? `${d} × ${k} = ${d * k}` : `${n} × ${k} = ${n * k}`}, so multiply top and bottom by ${k}.`, `$\\frac{${n}}{${d}} = \\frac{${n * k}}{${d * k}}$`], { viz: { type: "fracbars", tip: `Cut every piece into ${k}. The shaded amount stays the same.`, bars: [{ n, d, t: `${n}/${d}` }, { n: n * k, d: d * k, t: hideTop ? `?/${d * k}` : `${n * k}/?`, q: 1, rt: `${n * k}/${d * k}` }] } });
});
topic(3, "measure", "Measure Magic", "📏", "Length, mass and volume units", r => {
  const u = r.pick([["m", "cm", 100], ["kg", "g", 1000], ["ℓ", "mℓ", 1000], ["km", "m", 1000]]), big = r.int(1, 9), small = u[2] === 100 ? r.int(1, 99) : r.int(5, 995), tot = big * u[2] + small;
  if (r.chance(.5)) return num(`${big} ${u[0]} ${small} ${u[1]} = ? ${u[1]}`, tot, `1 ${u[0]} = ${u[2]} ${u[1]}`, [`${big} ${u[0]} = ${big * u[2]} ${u[1]}`, `${big * u[2]} + ${small} = ${tot} ${u[1]}`]);
  return num(`The potion jar holds ${tot} ${u[1]}. How many whole ${u[0]} is that? (ignore the extra ${u[1]})`, big, `1 ${u[0]} = ${u[2]} ${u[1]}. How many ${u[2]}s fit in ${tot}?`, [`${tot} ${u[1]} = ${big} ${u[0]} ${small} ${u[1]}`, `So ${big} whole ${u[0]}`]);
});
topic(3, "duration", "Ball Time", "🕛", "Hours and minutes", r => {
  if (r.chance(.4)) { const h = r.int(1, 5), m = r.int(1, 59); return num(`${h} h ${m} min = ? minutes`, h * 60 + m, "1 hour = 60 minutes.", [`${h} × 60 = ${h * 60}`, `${h * 60} + ${m} = ${h * 60 + m} minutes`]); }
  const sh = r.int(1, 8), sm = r.int(0, 11) * 5, len = r.int(4, 30) * 5, e = sh * 60 + sm + len, eh = Math.floor(e / 60), em = e % 60;
  return num(`The royal ball starts at ${hm(sh, sm)} p.m. and ends at ${hm(eh, em)} p.m. How many minutes long is it?`, len, "Count on to the next hour, then on to the end time.", [`From ${hm(sh, sm)} to ${hm(eh, em)} is ${Math.floor(len / 60)} h ${len % 60} min`, `= ${len} minutes`], { data: { wind: { h: sh, m: sm, goal: len, end: 1 } } });
});
// 🌙 MOE P3 time: telling time to the minute, "past" and "to", the 24-hour clock, finishing and starting times.
// Clock pictures can be counted on the 🕰️ Clock Workshop (Model Magic); "set the clock" questions are answered by moving the hands.
const EVENTS = ["Cinderella's coach ride", "the Moon Fairy's lantern parade", "the dragon's dance class", "the Mermaid Choir concert", "Puss in Boots' puppet show", "the Gingerbread baking lesson", "the unicorn pony ride", "Rapunzel's painting club"];
const someMins = r => r.chance(.75) ? r.pick([1, 2, 3, 4, 6, 7, 8, 9]) + 10 * r.int(0, 5) : r.int(1, 11) * 5;
const mins = n => `${n} minute${n === 1 ? "" : "s"}`;
topic(3, "clock", "Midnight Clock", "🌙", "Time to the minute and the 24-hour clock", r => {
  const t = r.int(0, 6), ev = r.pick(EVENTS), Ev = ev[0].toUpperCase() + ev.slice(1);
  if (t === 0) { // read a clock to the minute
    const h = r.int(1, 12), m = someMins(r), f = Math.floor(m / 5) * 5;
    return Object.assign(readClock(h, m, "What time does Cinderella's clock show? (type it like 7:43)", "Count the long hand in fives from the 12, then count on the little marks in ones.",
      [`Count in fives: ${f ? Array.from({ length: f / 5 }, (_, i) => 5 * (i + 1)).join(", ") : "the long hand is just past the 12"}${m % 5 ? `, then ${Array.from({ length: m % 5 }, (_, i) => f + i + 1).join(", ")} in ones` : ""} → ${m} minutes.`, `The short hand is just past ${h} → ${hm(h, m)} (${clockWords(h, m)}).`]), { data: { h, m, read: 1, step: 1 } });
  }
  if (t === 1) { // set the clock from words
    const h = r.int(1, 12), m = r.chance(.3) ? r.pick([15, 30, 45]) : someMins(r), w = clockWords(h, m), to = m > 30;
    return Q({ q: `The clock stopped! 🕰️ Set it to <b>${w}</b>.`, kind: "time", set: true, step: 1, val: h * 60 + m, a: hm(h, m), ansPic: svgClock(h, m),
      hint: to ? `“To” means minutes before ${clockWords(h % 12 + 1, 0)}: the long hand stops ${mins(60 - m)} before the 12.` : "The long hand counts the minutes past the 12; the short hand sits just past the hour.",
      steps: [`${w} = ${hm(h, m)}`, `Long hand: ${m} minutes past the 12 (${m % 5 ? `${Math.floor(m / 5)} big marks and ${m % 5} little mark${m % 5 > 1 ? "s" : ""}` : `on the ${m / 5}`}).`, `Short hand: ${m >= 30 ? `past ${h}, nearer to ${h % 12 + 1}` : `just past ${h}`}.`], data: { h, m } });
  }
  if (t === 2) { // "past" or "to"
    const h = r.int(1, 12), m = r.chance(.5) ? r.int(31, 59) : r.int(1, 29), nh = h % 12 + 1, w = clockWords(h, m), n = m < 30 ? m : 60 - m;
    const wrong = m < 30 ? [`${mins(n)} to ${h}`, `${mins(n)} past ${nh}`, `${mins(60 - m)} past ${h}`] : [`${mins(n)} past ${h}`, `${mins(60 - m)} past ${nh}`, `${mins(m)} to ${nh}`];
    return mcq(r, "Which words tell the time on the Clock Tower?", w, wrong.filter(x => x !== w), "Has the long hand gone past the 12 (past), or is it on its way back to the 12 (to)?",
      [`The clock shows ${hm(h, m)}.`, m < 30 ? `The long hand has gone ${mins(m)} past the 12 → ${w}.` : `The long hand needs ${mins(60 - m)} more to reach the 12 → ${w}.`], { pic: svgClock(h, m), data: { h, m, read: 1, step: 1 } });
  }
  if (t === 3) { // a.m./p.m. → 24-hour clock
    const pm = r.chance(.65), h = r.chance(.12) ? 12 : pm ? r.int(1, 9) : r.int(6, 11), m = someMins(r), tt = ((h % 12) + (pm ? 12 : 0)) * 60 + m;
    return Q({ q: `${Ev} starts at ${hm(h, m)} ${pm ? "p.m." : "a.m."} Write this time on the 24-hour clock. (type it like 19:30)`, kind: "time24", val: tt, a: h24(tt), keys: [":"],
      hint: pm ? "For p.m. times, add 12 to the hour (but 12 noon stays 12)." : "For a.m. times the hour stays the same (but 12 midnight becomes 00).",
      steps: [pm ? (h === 12 ? "12 p.m. is noon, so the hour stays 12." : `p.m. → add 12 to the hour: ${h} + 12 = ${h + 12}.`) : (h === 12 ? "12 a.m. is midnight, so the hour is 00." : `a.m. → keep the hour: ${pad2(h)}.`), `${hm(h, m)} ${pm ? "p.m." : "a.m."} = ${h24(tt)}`] });
  }
  if (t === 4) { // 24-hour clock → a.m./p.m.
    const H = r.chance(.75) ? r.int(13, 23) : r.chance(.15) ? 0 : r.int(6, 11), m = someMins(r), tt = H * 60 + m, A = ampm(tt), h = H % 12 || 12, mm = pad2(m), half = H >= 12 ? "p.m." : "a.m.", other = H >= 12 ? "a.m." : "p.m.";
    const wrong = [`${h}:${mm} ${other}`, `${H % 10 || 10}:${mm} ${half}`, `${h % 12 + 1}:${mm} ${half}`, `${(h + 9) % 12 + 1}:${mm} ${half}`];
    return mcq(r, `The dragon train to Starlight Castle leaves at <b>${h24(tt)}</b>. What time is that?`, A, wrong.filter(x => x !== A), "On the 24-hour clock, hours after 12 are p.m.: take away 12.",
      [H >= 13 ? `${H} is more than 12, so it is p.m.: ${H} − 12 = ${h}.` : H === 0 ? "00 is midnight → 12 a.m." : `${pad2(H)} is before 12, so it is a.m.`, `${h24(tt)} = ${A}`]);
  }
  // finishing time (t 5) or starting time (t 6), all inside one morning or afternoon; Model Magic winds the clock
  const hrs = r.chance(.5) ? r.int(1, 2) : 0, len = hrs * 60 + r.int(1, 11) * 5, half = r.chance(.6) ? "p.m." : "a.m.", s0 = r.int(half === "a.m." ? 7 * 60 : 60, (half === "a.m." ? 12 : 10) * 60 - 1 - len), sh = Math.floor(s0 / 60), sm = s0 % 60, e0 = s0 + len, eh = Math.floor(e0 / 60), em = e0 % 60;
  if (t === 5) return Q({ q: `${Ev} starts at ${hm(sh, sm)} ${half} and lasts ${dur(len)}. What time does it end? (type it like 3:45)`, kind: "time", val: e0, a: hm(eh, em), keys: [":"],
    hint: "Count on the hours first, then the minutes.", steps: [`Start: ${hm(sh, sm)}`, hrs ? `${hrs} h later → ${hm(sh + hrs, sm)}` : "", `${len % 60} min later → ${hm(eh, em)}`, `It ends at ${hm(eh, em)} ${half}`].filter(Boolean), data: { wind: { h: sh, m: sm, goal: len } } });
  return Q({ q: `${Ev} ended at ${hm(eh, em)} ${half} and lasted ${dur(len)}. What time did it start? (type it like 3:45)`, kind: "time", val: s0, a: hm(sh, sm), keys: [":"],
    hint: "Count back from the end time: the hours first, then the minutes.", steps: [`End: ${hm(eh, em)}`, hrs ? `${hrs} h earlier → ${hm(eh - hrs, em)}` : "", `${len % 60} min earlier → ${hm(sh, sm)}`, `It started at ${hm(sh, sm)} ${half}`].filter(Boolean), data: { wind: { h: eh, m: em, goal: -len } } });
});
topic(3, "perim", "Fence the Garden", "🌷", "Perimeter of rectangles and squares", r => {
  const sq = r.chance(.3), l = r.int(3, 25), w = sq ? l : r.int(2, l - 1);
  return num(`The fairy garden is a ${sq ? `square with sides of ${l} m` : `rectangle ${l} m long and ${w} m wide`}. How many metres of fence go all around it?`, 2 * (l + w), "Perimeter = the total length of all the sides.", [sq ? `4 × ${l} = ${4 * l} m` : `${l} + ${w} + ${l} + ${w} = ${2 * (l + w)} m`], { data: { l, w } });
});
topic(3, "bargraph", "Bar Graph Bakery", "📊", "Read bar graphs with a scale", r => {
  const th = graphTheme(r, r.int(4, 5)), step = r.pick([2, 5, 10]), top = r.int(8, 10), vals = distinct(r, th.cats.length, 1, top).map(n => n * step);
  return graphQ(r, th, vals, svgBars(th.title, `number of ${th.unit}`, th.cats, vals, top * step, step),
    i => `The ${th.cats[i].name} bar reaches the ${vals[i]} line.`, { scale: step, hint: `The scale goes up in ${step}s. Follow the top of the bar across to the numbers.` });
});
topic(3, "story", "Fairytale Problems", "📜", "Multiply and divide in stories", r => {
  const t = r.int(0, 2);
  if (t === 0) { const a = r.int(6, 9), b = r.int(3, 12); return num(`Each dragon egg 🥚 needs ${a} warm stones. How many stones are needed for ${b} eggs?`, a * b, "Equal groups → multiply.", [`${b} × ${a} = ${a * b}`], { viz: { type: "array", rows: b, cols: a, tip: `${b} eggs, ${a} stones each.` } }); }
  if (t === 1) { const d = r.int(3, 8), q = r.int(4, 12), rem = r.int(1, d - 1); return num(`${d * q + rem} pixies sit in boats. Each boat holds ${d}. How many boats are needed so every pixie gets a seat?`, q + 1, "Divide, then think about the pixies who are left over!", [`${d * q + rem} ÷ ${d} = ${q} r ${rem}`, `The ${rem} left-over pixie${rem > 1 ? "s" : ""} need${rem > 1 ? "" : "s"} one more boat → ${q + 1}`], { viz: { type: "groups", g: q, s: d, left: rem, tip: `Each ring is a boat of ${d}. Look at who is left on the shore!` } }); }
  const p = r.int(12, 45), n = r.int(3, 6); return num(`Puss in Boots buys ${n} pairs of boots at $${p} each. How much does he pay in $?`, p * n, "Price × number of pairs.", [`${n} × ${p} = ${p * n}`, `$${p * n}`]);
}, { story: true });

/* ---------- Grade 4 (Primary 4) ---------- */
topic(4, "longmul", "Long Multiplication", "🧮", "3-digit × 2-digit", r => {
  const a = r.int(102, 999), b = r.int(11, 99);
  return num(T(`${a} \\times ${b} = \\;?`), a * b, `Multiply ${a} by the ones digit, then by the tens, then add.`, M.longMulSteps(a, b), { data: { a, b, op: "×" } });
});
topic(4, "longdiv", "Long Division", "🏹", "4-digit ÷ 1-digit, with remainders", r => {
  const d = r.int(2, 9), n = r.int(1000, 9999), L = M.longDivSteps(n, d), rem = n % d, q = Math.floor(n / d);
  return Q({ q: `${T(`${n} \\div ${d}`)} = ? ${rem ? "(type like 123 r 4)" : ""}`, kind: rem ? "rem" : "num", val: rem ? [q, rem] : q, a: rem ? `${q} r ${rem}` : String(q), keys: ["r"],
    hint: "Divide digit by digit from the left: divide, multiply, subtract, bring down.", steps: L.steps.concat([`Answer: ${q}${rem ? " remainder " + rem : ""}`]), data: { n, d } });
});
topic(4, "factors", "Factors & Multiples", "🔍", "Factors, multiples, common multiples", r => {
  const t = r.int(0, 3);
  if (t === 0) { const a = r.int(3, 12), k = r.int(3, 12); return num(`What is the ${ord(k)} multiple of ${a}?`, a * k, "The multiples of a number are its times table.", [`${a} × ${k} = ${a * k}`]); }
  if (t === 1) { const n = r.pick([12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48]), f = []; for (let i = 1; i <= n; i++) if (n % i === 0) f.push(i);
    return num(`How many factors does ${n} have?`, f.length, `Find factor pairs: 1 × ${n}, 2 × …`, [`Factors of ${n}: ${f.join(", ")}`, `That is ${f.length} factors.`]); }
  if (t === 2) { const a = r.pick([2, 3, 4, 5, 6, 8]), b = r.pick([3, 4, 6, 9, 10, 12].filter(x => x !== a)); return num(`What is the lowest common multiple of ${a} and ${b}?`, lcm(a, b), "List multiples of both until one matches.", [`Multiples of ${a}: ${[1, 2, 3, 4, 5, 6].map(k => a * k).join(", ")}…`, `Multiples of ${b}: ${[1, 2, 3, 4].map(k => b * k).join(", ")}…`, `The first common one is ${lcm(a, b)}.`]); }
  const d = r.int(3, 9), n = r.chance(.5) ? d * r.int(4, 15) : d * r.int(4, 15) + r.int(1, d - 1), yes = n % d === 0;
  return mcq(r, `Is ${d} a factor of ${n}?`, yes ? "Yes" : "No", [yes ? "No" : "Yes"], `Does ${d} divide ${n} with no remainder?`, [`${n} ÷ ${d} = ${Math.floor(n / d)} r ${n % d}`, yes ? `No remainder → ${d} is a factor.` : `There is a remainder → ${d} is not a factor.`]);
});
topic(4, "fracadd", "Fraction Potions", "🧪", "Add/subtract related fractions", r => {
  const d1 = r.pick([2, 3, 4, 5]), k = r.pick([2, 3]), d2 = d1 * k, a = r.int(1, d1 - 1), b = r.int(1, d2 - 1), sub = r.chance(.4) && a * k > b, n = sub ? a * k - b : a * k + b;
  return Q({ q: `${T(`\\frac{${a}}{${d1}} ${sub ? "-" : "+"} \\frac{${b}}{${d2}}`)} = ? (type a fraction like 5/8)`, val: n / d2, a: fracStr(n, d2), keys: ["/"], hint: `Change ${T(`\\frac{${a}}{${d1}}`)} into ${d2}ths first.`, steps: [`$\\frac{${a}}{${d1}} = \\frac{${a * k}}{${d2}}$`, `$\\frac{${a * k}}{${d2}} ${sub ? "-" : "+"} \\frac{${b}}{${d2}} = \\frac{${n}}{${d2}}${gcd(n, d2) > 1 || n >= d2 ? " = " + mixedTex(n, d2) : ""}$`], data: { a, d1, b, d2, sub } });
});
topic(4, "fracset", "Fraction of a Set", "🍰", "e.g. 3/4 of 24", r => {
  const d = r.pick([3, 4, 5, 6, 8]), n = r.int(1, d - 1), tot = d * r.int(2, 12), [th, e] = r.pick(THINGS);
  return num(`Snow White baked ${tot} ${th} ${e}. She gave ${T(`\\frac{${n}}{${d}}`)} of them to the dwarfs. How many did the dwarfs get?`, tot / d * n, `First find ${T(`\\frac{1}{${d}}`)}: divide by ${d}.`, [`$\\frac{1}{${d}}$ of ${tot} = ${tot} ÷ ${d} = ${tot / d}`, `$\\frac{${n}}{${d}}$ of ${tot} = ${tot / d} × ${n} = ${tot / d * n}`], { viz: { type: "bar", tip: `${d} equal units make ${tot}. The dwarfs get ${n} of them.`, rows: [{ parts: Array.from({ length: d }, (_, i) => ({ v: 1, t: "", fill: i < n ? "#FFB8D1" : "#fff" })), braces: [{ from: 0, to: n, t: "?", rt: tot / d * n, q: 1 }, { from: 0, to: d, t: tot, below: 1 }] }] } });
});
topic(4, "decimal", "Decimal Docks", "⛵", "Tenths and hundredths", r => {
  const t = r.int(0, 2);
  if (t === 0) { const d = r.pick([10, 100]), n = r.int(1, d - 1); return num(`Write ${T(`\\frac{${n}}{${d}}`)} as a decimal.`, n / d, d === 10 ? "Tenths go in the first place after the point." : "Hundredths go in the second place after the point.", [`$\\frac{${n}}{${d}} = ${fmt(n / d)}$`], { keys: ["."] }); }
  if (t === 1) { const a = r.int(11, 999) / 100, b = r.int(11, 999) / 100; return num(T(`${fmt(a)} + ${fmt(b)} = \\;?`), rd(a + b, 2), "Line up the decimal points.", [`${fmt(a)} + ${fmt(b)} = ${fmt(rd(a + b, 2))}`], { keys: ["."], tol: 1e-6, data: { a, b, op: "+" } }); }
  const x = r.int(101, 9999) / 100, s = x.toFixed(2), place = r.pick([["tenths", 1], ["hundredths", 2]]), dig = s.split(".")[1][place[1] - 1];
  return num(`In ${s}, which digit is in the ${place[0]} place?`, +dig, "After the decimal point: tenths, then hundredths.", [`${s}: the ${place[0]} digit is ${dig}.`]);
});
topic(4, "round", "Rounding Rhymes", "🎯", "Round to 10, 100, 1000 and 1 d.p.", r => {
  const t = r.pick([10, 100, 1000, 0.1, 1]);
  if (t >= 10) { let n = r.int(t + 1, t * 99); if (n % t === t / 2) n++; const v = Math.round(n / t) * t; return num(`Round ${n} to the nearest ${t}.`, v, `Look at the digit to the right of the ${t}s place: 5 or more rounds up.`, [`${n} is between ${Math.floor(n / t) * t} and ${Math.floor(n / t) * t + t}.`, `It is nearer to ${v}.`], { data: { n, t } }); }
  const n = r.int(1001, 99999) / 1000, dp = t === 1 ? 0 : 1, v = rd(n, dp);
  return num(`Round ${n} to ${t === 1 ? "the nearest whole number" : "1 decimal place"}.`, v, "Look at the next digit: 5 or more rounds up.", [`${n} → ${v.toFixed(dp)}`], { a: v.toFixed(dp), keys: ["."], data: { n, dp } });
});
topic(4, "area", "Area of the Kingdom", "🗺️", "Area and perimeter of rectangles", r => {
  const l = r.int(3, 20), w = r.int(2, 15), t = r.int(0, 2);
  if (t === 0) return num(`A rectangular dragon pen is ${l} m by ${w} m. What is its area in m²?`, l * w, "Area = length × width.", [`${l} × ${w} = ${l * w} m²`], { viz: { type: "grid", l, w, u: "m", note: `${w} rows of ${l} squares = ? m²`, tip: "Count one row, then multiply by the number of rows." } });
  if (t === 1) return num(`A rectangle has an area of ${l * w} cm². Its length is ${l} cm. What is its width in cm?`, w, "Width = area ÷ length.", [`${l * w} ÷ ${l} = ${w} cm`], { viz: { type: "grid", l, w, u: "cm", wq: 1, noGrid: 1, note: `area = ${l * w} cm²`, tip: `How many rows of ${l} make ${l * w}?` } });
  const s = r.int(3, 12); return num(`A square tile has a perimeter of ${4 * s} cm. What is its area in cm²?`, s * s, "First find one side: perimeter ÷ 4.", [`Side = ${4 * s} ÷ 4 = ${s} cm`, `Area = ${s} × ${s} = ${s * s} cm²`]);
});
topic(4, "angles", "Turns & Angles", "🧭", "Right angles, turns and compass directions", r => {
  const DIR = ["north", "east", "south", "west"];
  if (r.chance(.5)) { const t = r.pick([["a quarter turn", 90], ["a half turn", 180], ["a three-quarter turn", 270], ["a full turn", 360], ["two right angles", 180], ["three right angles", 270]]); return num(`How many degrees are there in ${t[0]}?`, t[1], "A right angle (a quarter turn) is 90°.", [`${t[0]} = ${t[1]}°`]); }
  const s = r.int(0, 3), k = r.int(1, 3), cw = r.chance(.5), e = (s + (cw ? k : 4 - k)) % 4;
  return mcq(r, `The Snow Queen faces ${DIR[s]}. She turns ${k * 90}° ${cw ? "clockwise" : "anticlockwise"}. Which way does she face now?`, DIR[e], DIR.filter(d => d !== DIR[e]), "Each 90° is one quarter turn: N → E → S → W clockwise.", [`${k} quarter turn${k > 1 ? "s" : ""} ${cw ? "clockwise" : "anticlockwise"} from ${DIR[s]} → ${DIR[e]}`]);
});
/* ---------- 🪞 line symmetry (MOE P4: identify symmetric figures, check a line of symmetry, complete a figure on a square grid) ----------
   Figures live on an 8 × 6 grid of squares (6 × 8 when the mirror line is across). A cell is [a, b]: a counts across the
   mirror line (0–7, the line sits between 3 and 4), b along it. mirror([a, b]) = [7 − a, b]. */
const SY = { N: 8, M: 6, S: 14 };
const mirrorCell = ([a, b]) => [SY.N - 1 - a, b];
const symNear = (cells, ok) => nearCells(cells, SY.N, SY.M, ok);
// a connected half-figure on the left of the line that touches it, with n squares
const halfFig = (r, n) => { const cells = [[3, r.int(1, 4)]]; while (cells.length < n) cells.push(r.pick(symNear(cells, c => c[0] < 4))); return cells; };
const fullFig = half => half.concat(half.map(mirrorCell));
// the same figure with one right-hand square moved to a new spot (so it is no longer symmetric)
const breakFig = (r, cells) => { const right = cells.filter(c => c[0] >= 4), gone = r.pick(right), rest = cells.filter(c => c !== gone), spots = symNear(rest, c => c[0] >= 4 && cellKey(c) !== cellKey(gone));
  return spots.length ? rest.concat([r.pick(spots)]) : null; };
const SY_FILL = PASTEL.slice(0, 5);
const svgSym = (cells, across, o = {}) => { const { N, M, S } = SY, W = across ? M : N, H = across ? N : M, xy = ([a, b]) => across ? [b, a] : [a, b], pad = 4;
  let g = gridPaper(W, H, S, pad);
  for (const c of cells) { const [x, y] = xy(c); g += gridCell(x, y, S, pad, o.fill || "#FFB8D1", "syc"); }
  const m = pad + 4 * S; g += across ? `<line class="mline" x1="${pad - 3}" y1="${m}" x2="${pad + W * S + 3}" y2="${m}" stroke="#ff6f91" stroke-width="2.5" stroke-dasharray="5 4" stroke-linecap="round"/>`
    : `<line class="mline" x1="${m}" y1="${pad - 3}" x2="${m}" y2="${pad + H * S + 3}" stroke="#ff6f91" stroke-width="2.5" stroke-dasharray="5 4" stroke-linecap="round"/>`;
  const w = W * S + 2 * pad, h = H * S + 2 * pad, k = o.small ? 1.15 : 1.7;
  return svgBox(g, o.label || "figure on a square grid with a dashed line", Math.round(w * k), Math.round(h * k), `0 0 ${w} ${h}`, "mpic symgrid");
};
const SYM_WHO = [["Fairy Pip", "tile pattern for the Mirror Pond path"], ["Rapunzel", "window for her tower"], ["the Gingerbread Baker", "cookie design"], ["Princess Mira", "garden bed"], ["Jack", "kite"], ["Sumi the star fairy", "star quilt"]];
const SYM_LETTERS = { yes: ["A", "H", "M", "O", "T", "U", "V", "W", "X", "Y"], no: ["F", "G", "J", "L", "N", "P", "Q", "R", "S", "Z"] };
const SYM_SHAPES = [["square", 4, "a square"], ["rectangle", 2, "a rectangle (not a square)"], ["triangle", 1, "this triangle with two equal sides"], ["pentagon", 5, "a regular pentagon (5 equal sides)"]];
const FOLD = "Fold along the dashed line: every shaded square must land exactly on another shaded square.";
topic(4, "symmetry", "Mirror Pond", "🪞", "Lines of symmetry on a square grid", r => {
  const t = r.int(0, 5), across = r.chance(.35), [who, what] = r.pick(SYM_WHO), fill = r.pick(SY_FILL), line = across ? "across" : "up and down";
  const pic = (cells, small) => svgSym(cells, across, { fill, small });
  if (t === 4) { // letters: which one has a line of symmetry?
    const yes = r.chance(.5), right = r.pick(SYM_LETTERS[yes ? "yes" : "no"]), wrong = r.shuffle(SYM_LETTERS[yes ? "no" : "yes"]).slice(0, 3);
    return mcq(r, `${who} is painting a sign for the Mirror Pond. Which letter ${yes ? "has" : "does <b>not</b> have"} a line of symmetry?`, right, wrong, "Imagine a fold line down the middle (or across). Do the two halves match exactly?",
      yes ? [`${right} can be folded so both halves match, so it has a line of symmetry.`, `${wrong.join(", ")} have no fold line where the halves match.`] : [`No fold line makes the two halves of ${right} match.`, `${wrong.join(", ")} each have a line of symmetry.`], { data: { sym: "letter", yes } });
  }
  if (t === 5) { // lines of symmetry of a shape
    const [k, n, name] = r.pick(SYM_SHAPES);
    return num(`How many lines of symmetry does ${name} have?`, n, "Count every fold line that makes the two halves match. Try lines through corners and through the middles of sides.",
      [`${name[0].toUpperCase() + name.slice(1)} has ${n} line${n > 1 ? "s" : ""} of symmetry.`], { pic: svgShape(k, fill), data: { sym: "shape", n } });
  }
  const half = halfFig(r, r.int(4, 7)), full = fullFig(half);
  if (t === 0) { // yes / no
    const broken = r.chance(.5) && breakFig(r, full), cells = broken || full;
    return mcq(r, `${who} made this ${what}. Is the dashed line a line of symmetry?`, broken ? "No" : "Yes", [broken ? "Yes" : "No"], FOLD,
      broken ? [FOLD, "One shaded square has no partner the same distance away on the other side, so the halves do not match.", "So the dashed line is not a line of symmetry."] : [FOLD, "Every shaded square has a partner the same distance away on the other side.", "So the dashed line is a line of symmetry."],
      { pic: pic(cells), uid: "s0" + figKey(cells) + across, data: { sym: "check", cells, across, yes: !broken } });
  }
  if (t === 1 || t === 2) { // pick the picture
    let others;
    if (t === 1) { others = []; for (let i = 0; i < 20 && others.length < 3; i++) { const b = breakFig(r, full); if (b && ![full, ...others].some(o => figKey(o) === figKey(b))) others.push(b); } }
    else { const copy = half.concat(half.map(([a, b]) => [a + 4, b])), miss = full.filter(c => cellKey(c) !== cellKey(r.pick(full.filter(d => d[0] >= 4)))), extra = symNear(full, c => c[0] >= 4);
      others = [copy, miss].concat(extra.length ? [full.concat([r.pick(extra)])] : []).filter((o, i, all) => figKey(o) !== figKey(full) && all.findIndex(x => figKey(x) === figKey(o)) === i); }
    if (others.length < 2) return topic4sym(r);
    const ids = ["f1", "f2", "f3", "f4"], optPics = { f1: pic(full, true) }; others.forEach((o, i) => { optPics[ids[i + 1]] = pic(o, true); });
    const q = t === 1 ? `${who} drew ${["", "", "", "three", "four"][others.length + 1]} ${what}s. In which one is the dashed line a line of symmetry?` : `${who} drew half of a ${what}. Which picture completes it so the dashed line (${line}) is a line of symmetry?`;
    return mcq(r, q, "f1", ids.slice(1, others.length + 1), t === 1 ? FOLD : "Each square on one side needs a partner the same distance from the line on the other side, like a reflection in the pond.",
      t === 1 ? [FOLD, "In the right answer every square has a partner; in the others one square has moved."] : ["Count how far each square is from the dashed line.", "Draw its partner the same distance away on the other side (a mirror image, not a copy slid across)."],
      { pic: t === 2 ? pic(half) : "", optPics, uid: "s" + t + figKey(full) + across, data: { sym: t === 1 ? "pick" : "complete", across, cells: full, half } });
  }
  // t === 3: how many more squares to shade? (k squares lost their partners)
  const k = r.int(1, 3), gone = r.shuffle(half).slice(0, k).map(c => r.chance(.5) ? c : mirrorCell(c)), goneK = new Set(gone.map(cellKey)), cells = full.filter(c => !goneK.has(cellKey(c)));
  return num(`${who} is shading a ${what}. What is the smallest number of squares that must be shaded so the dashed line becomes a line of symmetry?`, k, "Find each shaded square whose mirror partner (same distance, other side) is not shaded yet.",
    [`${k} shaded square${k > 1 ? "s have" : " has"} no partner on the other side of the line.`, `Shade ${k} more square${k > 1 ? "s" : ""}.`], { pic: pic(cells), uid: "s3" + figKey(cells) + across, data: { sym: "count", cells, across, k } });
});
// retry helper for the rare figure with too few different wrong pictures
const topic4sym = r => M.topic("g4.symmetry").gen(r);
const LINES = [
  { title: "Height of Jack's beanstalk", unit: "height (cm)", u: "cm", xs: ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6"], up: 1, what: "the beanstalk's height", when: "week", at: "in" },
  { title: "Sunflower in the Fairy Garden", unit: "height (cm)", u: "cm", xs: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], up: 1, what: "the sunflower's height", when: "day", at: "on" },
  { title: "Ice creams sold at the Fairy Fair", unit: "number of ice creams", u: "ice creams", xs: ["10 am", "11 am", "12 pm", "1 pm", "2 pm", "3 pm"], what: "the number of ice creams sold", when: "time", at: "at" },
  { title: "Visitors at the Fairy Library", unit: "number of visitors", u: "visitors", xs: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], what: "the number of visitors", when: "day", at: "on" }
];
const lineVals = (r, L, step, top) => { // rising series for growth, a hill shape otherwise; one clear biggest rise
  for (;;) { let v = L.up ? r.int(1, 2) : r.int(1, 4); const out = [v];
    for (let i = 1; i < L.xs.length; i++) { v += L.up || i < 3 ? r.int(L.up ? 0 : 1, 3) : -r.int(0, 2); out.push(Math.max(0, v)); }
    const rises = out.slice(1).map((x, i) => x - out[i]), best = Math.max(...rises);
    if (Math.max(...out) <= top && rises.filter(x => x === best).length === 1 && new Set(out).size >= 4) return out.map(x => x * step); }
};
topic(4, "linegraph", "Line Graph Lighthouse", "📈", "Read tables and line graphs", r => {
  const t = r.int(0, 4);
  if (t === 4) { // a table with one missing number (MOE P4 tables)
    const th = r.pick(COLLECTS), cats = r.shuffle(FRIENDS).slice(0, 3).map(([name]) => ({ lab: name })), a = cats.map(() => r.int(12, 60)), b = cats.map(() => r.int(12, 60)), k = r.int(0, 2), col = r.int(0, 2), tot = a.map((x, i) => x + b[i]);
    const cell = (v, i, c) => i === k && c === col ? "?" : v, rows = cats.map((c, i) => [c.lab, cell(a[i], i, 0), cell(b[i], i, 1), cell(tot[i], i, 2)]);
    const ans = [a, b, tot][col][k], step = col === 2 ? `${a[k]} + ${b[k]} = ${tot[k]}` : `${tot[k]} − ${col ? a[k] : b[k]} = ${ans}`;
    return num(`${th.title}: the table shows how many ${th.unit} each friend ${th.past} in May and June. What number is hidden by "?"`, ans, col === 2 ? "Total = May + June." : "The part you need = total − the other month.", [step], { pic: table(["", "May", "June", "Total"], rows), data: { graph: "table", ans } });
  }
  const L = r.pick(LINES), step = r.pick(L.u === "cm" ? [5, 10] : [5, 10, 20]), top = 8, vals = lineVals(r, L, step, top), xs = L.xs, n = xs.length;
  const pic = svgLine(L.title, L.unit, xs, vals, top * step, step), o = { pic, data: { graph: "line", vals, xs } }, read = i => `${L.at === "on" ? "On" : L.at === "in" ? "In" : "At"} ${xs[i]} the point is on the ${vals[i]} line.`;
  if (t === 0) { const i = r.int(0, n - 1); return num(`${L.title}: what was ${L.what} ${L.at} ${xs[i]}?`, vals[i], `Find ${xs[i]} at the bottom, go up to the point, then across to the scale (it goes up in ${step}s).`, [read(i)], o); }
  if (t === 1) { let i, j; do { i = r.int(0, n - 2); j = r.int(i + 1, n - 1); } while (vals[i] === vals[j]);
    const up = vals[j] > vals[i]; return num(`${L.title}: by how much did ${L.what} ${up ? "go up" : "go down"} from ${xs[i]} to ${xs[j]}?${L.u === "cm" ? " (in cm)" : ""}`, Math.abs(vals[j] - vals[i]), "Read both points, then find the difference.", [read(i), read(j), `${Math.max(vals[i], vals[j])} − ${Math.min(vals[i], vals[j])} = ${Math.abs(vals[j] - vals[i])}`], o); }
  if (t === 2) { const rises = vals.slice(1).map((x, i) => x - vals[i]), k = rises.indexOf(Math.max(...rises)), lab = i => `${xs[i]} to ${xs[i + 1]}`;
    return mcq(r, `${L.title}: between which two ${L.when}s did ${L.what} go up the most?`, lab(k), r.shuffle(rises.map((_, i) => i).filter(i => i !== k)).map(lab), "The steepest uphill part of the line is the biggest rise.", [`${lab(k)}: ${vals[k]} → ${vals[k + 1]}, up ${rises[k]} ${L.u}`, "Every other part goes up less (or goes down)."], o); }
  const hi = Math.max(...vals), k = vals.indexOf(hi), lo = vals.indexOf(Math.min(...vals)), big = L.up ? false : r.chance(.6);
  if (big && vals.filter(x => x === hi).length === 1) return mcq(r, `${L.title}: at which ${L.when} was ${L.what} the highest?`, xs[k], xs.filter((_, i) => i !== k), "Look for the highest point on the line.", [`The highest point is at ${xs[k]} (${hi} ${L.u}).`], o);
  return num(`${L.title}: what is the difference between the highest and the lowest value on the graph?${L.u === "cm" ? " (in cm)" : ""}`, hi - vals[lo], "Find the highest point and the lowest point, then subtract.", [`Highest ${hi}, lowest ${vals[lo]}`, `${hi} − ${vals[lo]} = ${hi - vals[lo]}`], o);
});
topic(4, "story", "Fairytale Problems", "📜", "Multi-step word problems", r => {
  if (r.chance(.5)) { const p = r.int(15, 60), n = r.int(12, 35), paid = Math.ceil(p * n / 100) * 100 + r.pick([0, 100]); return num(`Aladdin buys ${n} lamps at $${p} each. He pays with $${paid}. How much change does he get in $?`, paid - p * n, "Find the total cost first, then subtract from what he paid.", [`${n} × ${p} = $${p * n}`, `${paid} − ${p * n} = $${paid - p * n}`], { viz: { type: "bar", tip: "What he paid = the cost of the lamps + his change.", rows: [{ name: "paid", parts: [{ v: p * n, t: `${n} × $${p}` }, { v: paid - p * n, t: "?", rt: `$${paid - p * n}`, q: 1 }], braces: [{ from: 0, to: paid, t: `$${paid}` }] }] } }); }
  const d = r.int(3, 9), per = r.int(25, 120); return num(`The giant's beanstalk grows ${per} cm each day. How many metres does it grow in ${d * 4} days? (1 m = 100 cm)`, per * d * 4 / 100, "Multiply, then change cm into m.", [`${per} × ${d * 4} = ${per * d * 4} cm`, `${per * d * 4} ÷ 100 = ${fmt(per * d * 4 / 100)} m`], { keys: ["."] });
}, { story: true });
})();
