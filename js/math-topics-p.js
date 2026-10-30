/* 🔢 Number Kingdom topics, Grades 1–4 (Singapore Primary 1–4). Each gen(r) gets a seeded rng and returns a question. */
(function () {
const M = (typeof module !== "undefined" && module.exports) ? require("./math-gen.js") : window.MathGen;
const { Q, num, mcq, T, NAMES, THINGS, COUNT_EMOJI, svgClock, SHAPES, svgShape, svgPie, coin, emojiRows, colAdd, colSub, topic, gcd, lcm, rd, fmt, money, simp, fracTex, fracStr, mixedTex } = M._internal;
const pad = m => String(m).padStart(2, "0");
const ord = k => k + (k % 100 >= 11 && k % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][k % 10] || "th");

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
topic(1, "time", "Clock Tower", "🕰️", "O'clock and half past", r => {
  const h = r.int(1, 12), m = r.pick([0, 30]);
  return Q({ q: "What time does the Clock Tower show? (type it like 3:30)", kind: "time", val: h * 60 + m, a: `${h}:${pad(m)}`, keys: [":"], pic: svgClock(h, m),
    hint: "The short hand shows the hour. The long hand on 12 means o'clock; on 6 means half past.", steps: [m ? `The long hand points to 6 → half past. The short hand is just past ${h}.` : `The long hand points to 12 → o'clock. The short hand points to ${h}.`, `It is ${m ? "half past " + h : h + " o'clock"} (${h}:${pad(m)}).`], data: { h, m } });
});
topic(1, "story", "Fairytale Problems", "📜", "Word problems within 20", r => {
  const [th, e] = r.pick(THINGS), nm = r.pick(NAMES), t = r.int(0, 2);
  if (t === 0) { const a = r.int(2, 10), b = r.int(1, 10); return num(`${nm} picks ${a} ${th} ${e} in the morning and ${b} more after lunch. How many ${th} now?`, a + b, "Altogether means add.", [`${a} + ${b} = ${a + b}`]); }
  if (t === 1) { const a = r.int(8, 20), b = r.int(1, a - 1); return num(`There were ${a} ${th} ${e} on the castle table. The hungry giant ate ${b}. How many are left?`, a - b, "Left means take away.", [`${a} − ${b} = ${a - b}`]); }
  const a = r.int(3, 12), b = r.int(a + 1, 20); return num(`Goldilocks has ${a} ${th}. Baby Bear has ${b}. How many more does Baby Bear have?`, b - a, "How many more → find the difference.", [`${b} − ${a} = ${b - a}`]);
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
  if (t === 0) { const i = r.int(0, 2), names = ["hundreds", "tens", "ones"], v = +d[i] * Math.pow(10, 2 - i); return num(`What is the value of the underlined digit in ${d.slice(0, i)}<u>${d[i]}</u>${d.slice(i + 1)}?`, v, "Which place is it in: hundreds, tens or ones?", [`${d[i]} is in the ${names[i]} place.`, `${d[i]} ${names[i]} = ${v}`]); }
  if (t === 1) return num(`${d[0]} hundreds, ${d[1]} tens and ${d[2]} ones make what number?`, n, "Write the hundreds digit, then tens, then ones.", [`${+d[0] * 100} + ${+d[1] * 10} + ${+d[2]} = ${n}`]);
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
  return Q({ q: "What time is it? (type it like 4:25)", kind: "time", val: h * 60 + m, a: `${h}:${pad(m)}`, keys: [":"], pic: svgClock(h, m),
    hint: "Count the long hand in fives from the 12: 5, 10, 15…", steps: [`The long hand points to ${m ? m / 5 : 12} → ${m} minutes.`, `The short hand is ${m ? "just past " : "on "}${h} → ${h}:${pad(m)}`], data: { h, m } });
});
topic(2, "frac", "Pizza Fractions", "🍕", "Halves, thirds and quarters", r => {
  if (r.chance(.55)) { const d = r.pick([2, 3, 4, 6, 8]), k = r.int(1, d - 1);
    return Q({ q: "What fraction of the pie is shaded pink? (type it like 1/4)", val: k / d, a: `${k}/${d}`, keys: ["/"], pic: svgPie(k, d), hint: "Bottom number: how many equal parts. Top number: how many are shaded.", steps: [`The pie has ${d} equal parts and ${k} ${k === 1 ? "is" : "are"} shaded.`, `Fraction shaded = $\\frac{${k}}{${d}}$${gcd(k, d) > 1 ? ` (the same as $${fracTex(k, d)}$)` : ""}`], data: { k, d } }); }
  const d = r.pick([2, 3, 4]), n = d * r.int(1, 6); return num(`What is ${T(`\\frac{1}{${d}}`)} of ${n} magic beans?`, n / d, `Share ${n} into ${d} equal groups.`, [`${n} ÷ ${d} = ${n / d}`]);
});
topic(2, "story", "Fairytale Problems", "📜", "Two-step word problems", r => {
  const t = r.int(0, 2), nm = r.pick(NAMES);
  if (t === 0) { const a = r.int(3, 9), b = r.pick([2, 5, 10]); return num(`${nm} has ${a} baskets. Each basket holds ${b} golden apples 🍎. How many apples?`, a * b, "Equal groups → multiply.", [`${a} × ${b} = ${a * b}`]); }
  if (t === 1) { const a = r.int(40, 90), b = r.int(10, 30), c = r.int(5, 20); return num(`The Gingerbread Baker baked ${a} cookies. He sold ${b} and then baked ${c} more. How many cookies does he have now?`, a - b + c, "Do it in two steps: take away, then add.", [`${a} − ${b} = ${a - b}`, `${a - b} + ${c} = ${a - b + c}`]); }
  const per = r.pick([2, 5, 10]), p = r.int(2, 9); return num(`A glass slipper costs ${per} gold coins. Cinderella has ${per * p} coins. How many slippers can she buy?`, p, "How many groups of the price fit into her coins? → divide.", [`${per * p} ÷ ${per} = ${p}`]);
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
  return num(hideTop ? T(`\\frac{${n}}{${d}} = \\frac{\\square}{${d * k}}`) : T(`\\frac{${n}}{${d}} = \\frac{${n * k}}{\\square}`), hideTop ? n * k : d * k, `What was the ${hideTop ? "bottom" : "top"} number multiplied by?`, [`${hideTop ? `${d} × ${k} = ${d * k}` : `${n} × ${k} = ${n * k}`}, so multiply top and bottom by ${k}.`, `$\\frac{${n}}{${d}} = \\frac{${n * k}}{${d * k}}$`]);
});
topic(3, "measure", "Measure Magic", "📏", "Length, mass and volume units", r => {
  const u = r.pick([["m", "cm", 100], ["kg", "g", 1000], ["ℓ", "mℓ", 1000], ["km", "m", 1000]]), big = r.int(1, 9), small = u[2] === 100 ? r.int(1, 99) : r.int(5, 995), tot = big * u[2] + small;
  if (r.chance(.5)) return num(`${big} ${u[0]} ${small} ${u[1]} = ? ${u[1]}`, tot, `1 ${u[0]} = ${u[2]} ${u[1]}`, [`${big} ${u[0]} = ${big * u[2]} ${u[1]}`, `${big * u[2]} + ${small} = ${tot} ${u[1]}`]);
  return num(`The potion jar holds ${tot} ${u[1]}. How many whole ${u[0]} is that? (ignore the extra ${u[1]})`, big, `1 ${u[0]} = ${u[2]} ${u[1]}. How many ${u[2]}s fit in ${tot}?`, [`${tot} ${u[1]} = ${big} ${u[0]} ${small} ${u[1]}`, `So ${big} whole ${u[0]}`]);
});
topic(3, "duration", "Ball Time", "🕛", "Hours and minutes", r => {
  if (r.chance(.4)) { const h = r.int(1, 5), m = r.int(1, 59); return num(`${h} h ${m} min = ? minutes`, h * 60 + m, "1 hour = 60 minutes.", [`${h} × 60 = ${h * 60}`, `${h * 60} + ${m} = ${h * 60 + m} minutes`]); }
  const sh = r.int(1, 8), sm = r.int(0, 11) * 5, dur = r.int(4, 30) * 5, e = sh * 60 + sm + dur, eh = Math.floor(e / 60), em = e % 60, f = (h, m) => `${h}:${pad(m)}`;
  return num(`The royal ball starts at ${f(sh, sm)} p.m. and ends at ${f(eh, em)} p.m. How many minutes long is it?`, dur, "Count on to the next hour, then on to the end time.", [`From ${f(sh, sm)} to ${f(eh, em)} is ${Math.floor(dur / 60)} h ${dur % 60} min`, `= ${dur} minutes`]);
});
topic(3, "perim", "Fence the Garden", "🌷", "Perimeter of rectangles and squares", r => {
  const sq = r.chance(.3), l = r.int(3, 25), w = sq ? l : r.int(2, l - 1);
  return num(`The fairy garden is a ${sq ? `square with sides of ${l} m` : `rectangle ${l} m long and ${w} m wide`}. How many metres of fence go all around it?`, 2 * (l + w), "Perimeter = the total length of all the sides.", [sq ? `4 × ${l} = ${4 * l} m` : `${l} + ${w} + ${l} + ${w} = ${2 * (l + w)} m`], { data: { l, w } });
});
topic(3, "story", "Fairytale Problems", "📜", "Multiply and divide in stories", r => {
  const t = r.int(0, 2);
  if (t === 0) { const a = r.int(6, 9), b = r.int(3, 12); return num(`Each dragon egg 🥚 needs ${a} warm stones. How many stones are needed for ${b} eggs?`, a * b, "Equal groups → multiply.", [`${b} × ${a} = ${a * b}`]); }
  if (t === 1) { const d = r.int(3, 8), q = r.int(4, 12), rem = r.int(1, d - 1); return num(`${d * q + rem} pixies sit in boats. Each boat holds ${d}. How many boats are needed so every pixie gets a seat?`, q + 1, "Divide, then think about the pixies who are left over!", [`${d * q + rem} ÷ ${d} = ${q} r ${rem}`, `The ${rem} left-over pixie${rem > 1 ? "s" : ""} need${rem > 1 ? "" : "s"} one more boat → ${q + 1}`]); }
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
  return num(`Snow White baked ${tot} ${th} ${e}. She gave ${T(`\\frac{${n}}{${d}}`)} of them to the dwarfs. How many did the dwarfs get?`, tot / d * n, `First find ${T(`\\frac{1}{${d}}`)}: divide by ${d}.`, [`$\\frac{1}{${d}}$ of ${tot} = ${tot} ÷ ${d} = ${tot / d}`, `$\\frac{${n}}{${d}}$ of ${tot} = ${tot / d} × ${n} = ${tot / d * n}`]);
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
  if (t === 0) return num(`A rectangular dragon pen is ${l} m by ${w} m. What is its area in m²?`, l * w, "Area = length × width.", [`${l} × ${w} = ${l * w} m²`]);
  if (t === 1) return num(`A rectangle has an area of ${l * w} cm². Its length is ${l} cm. What is its width in cm?`, w, "Width = area ÷ length.", [`${l * w} ÷ ${l} = ${w} cm`]);
  const s = r.int(3, 12); return num(`A square tile has a perimeter of ${4 * s} cm. What is its area in cm²?`, s * s, "First find one side: perimeter ÷ 4.", [`Side = ${4 * s} ÷ 4 = ${s} cm`, `Area = ${s} × ${s} = ${s * s} cm²`]);
});
topic(4, "angles", "Turns & Angles", "🧭", "Right angles, turns and compass directions", r => {
  const DIR = ["north", "east", "south", "west"];
  if (r.chance(.5)) { const t = r.pick([["a quarter turn", 90], ["a half turn", 180], ["a three-quarter turn", 270], ["a full turn", 360], ["two right angles", 180], ["three right angles", 270]]); return num(`How many degrees are there in ${t[0]}?`, t[1], "A right angle (a quarter turn) is 90°.", [`${t[0]} = ${t[1]}°`]); }
  const s = r.int(0, 3), k = r.int(1, 3), cw = r.chance(.5), e = (s + (cw ? k : 4 - k)) % 4;
  return mcq(r, `The Snow Queen faces ${DIR[s]}. She turns ${k * 90}° ${cw ? "clockwise" : "anticlockwise"}. Which way does she face now?`, DIR[e], DIR.filter(d => d !== DIR[e]), "Each 90° is one quarter turn: N → E → S → W clockwise.", [`${k} quarter turn${k > 1 ? "s" : ""} ${cw ? "clockwise" : "anticlockwise"} from ${DIR[s]} → ${DIR[e]}`]);
});
topic(4, "story", "Fairytale Problems", "📜", "Multi-step word problems", r => {
  if (r.chance(.5)) { const p = r.int(15, 60), n = r.int(12, 35), paid = Math.ceil(p * n / 100) * 100 + r.pick([0, 100]); return num(`Aladdin buys ${n} lamps at $${p} each. He pays with $${paid}. How much change does he get in $?`, paid - p * n, "Find the total cost first, then subtract from what he paid.", [`${n} × ${p} = $${p * n}`, `${paid} − ${p * n} = $${paid - p * n}`]); }
  const d = r.int(3, 9), per = r.int(25, 120); return num(`The giant's beanstalk grows ${per} cm each day. How many metres does it grow in ${d * 4} days? (1 m = 100 cm)`, per * d * 4 / 100, "Multiply, then change cm into m.", [`${per} × ${d * 4} = ${per * d * 4} cm`, `${per * d * 4} ÷ 100 = ${fmt(per * d * 4 / 100)} m`], { keys: ["."] });
}, { story: true });
})();
