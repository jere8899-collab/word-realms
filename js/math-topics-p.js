/* 🔢 Number Kingdom topics, Grades 1–4 (Singapore Primary 1–4). Each gen(r) gets a seeded rng and returns a question. */
(function () {
const M = (typeof module !== "undefined" && module.exports) ? require("./math-gen.js") : window.MathGen;
const { Q, num, mcq, mcqWhy, numWhy, T, NAMES, THINGS, COUNT_EMOJI, PASTEL, svgBox, figKey, cellKey, hasCell, nearCells, gridSheet, gridCell, LINE, INK, esc, fitBox, cardSvg, svgPieChart, svgClock, pad2, hm, clockWords, h24, ampm, dur, SHAPES, svgShape, svgPie, picto, svgBars, svgLine, table, coin, emojiRows, colAdd, colSub, topic, gcd, lcm, rd, fmt, money, simp, fracTex, fracStr, mixedTex, ord } = M._internal;

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

/* ---------- 📏⚖️🧸 measurement and solids pictures (MOE P1 length in cm; P2 length in m, mass in kg/g, volume in ℓ; P2 3D shapes) ---------- */
const RIB = ["#FFB8D1", "#BDE7FF", "#C8F2DC", "#E2D6FF", "#FFE7A8"];
const cap1 = s => s[0].toUpperCase() + s.slice(1);
// a ruler (cm) or a metre tape (m) from 0 to max, with lettered ribbons lying on it: rows [{ from, to, fill, name }]
const svgRuler = (rows, max, unit = "cm", what = "ribbon") => {
  const U = Math.min(18, 268 / max), P = 16, W = 2 * P + max * U, top = 26, rowH = 22, rTop = top + rows.length * rowH + 4, H = rTop + 44, X = v => +(P + v * U).toFixed(1);
  let g = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="#FFFDF8" stroke="#F1E3F7" stroke-width="2"/><text x="${W - 10}" y="17" font-size="10" text-anchor="end" font-weight="900" fill="${INK}">${unit === "m" ? "metres (m)" : "centimetres (cm)"}</text>`;
  rows.forEach((w, i) => { const y = top + i * rowH;
    g += `<rect class="rrib" data-from="${w.from}" data-to="${w.to}" x="${X(w.from)}" y="${y}" width="${+((w.to - w.from) * U).toFixed(1)}" height="16" rx="8" fill="${w.fill}" stroke="${LINE}" stroke-width="1.4"/>`;
    if (w.name) g += `<text x="${X((w.from + w.to) / 2)}" y="${y + 12}" font-size="10.5" text-anchor="middle" font-weight="900" fill="${INK}">${w.name}</text>`;
    g += `<line x1="${X(w.from)}" y1="${y + 16}" x2="${X(w.from)}" y2="${rTop}" stroke="${LINE}" stroke-width="1" stroke-dasharray="2 2"/><line x1="${X(w.to)}" y1="${y + 16}" x2="${X(w.to)}" y2="${rTop}" stroke="${LINE}" stroke-width="1" stroke-dasharray="2 2"/>`; });
  g += `<rect x="${P - 8}" y="${rTop}" width="${+(max * U + 16).toFixed(1)}" height="34" rx="6" fill="${unit === "m" ? "#FFF1C9" : "#E1F1FF"}" stroke="${LINE}" stroke-width="1.6"/>`;
  for (let v = 0; v <= max; v++) g += `<line x1="${X(v)}" y1="${rTop}" x2="${X(v)}" y2="${rTop + (v % 5 ? 8 : 12)}" stroke="${INK}" stroke-width="1.3"/><text class="rtick" data-v="${v}" x="${X(v)}" y="${rTop + 25}" font-size="9.5" text-anchor="middle" font-weight="800" fill="${INK}">${v}</text>`;
  return svgBox(g, `${rows.length > 1 ? rows.length + " " + what + "s" : "a " + what} on a ${unit === "m" ? "metre tape" : "ruler"}`, Math.round(W), Math.round(H), `0 0 ${Math.round(W)} ${Math.round(H)}`, "mpic chart rulerpic");
};
// a pan balance: the thing on the left, weights (or a second thing) on the right; tilt −1 = left side down, 1 = right side down
const svgBalance = (left, right, tilt = 0) => {
  const W = 300, H = 176, cx = 150, py = 70, d = tilt * 16, L = [52, py + d], R = [248, py - d];
  const pan = ([x, y], items) => `<line x1="${x}" y1="${y}" x2="${x - 30}" y2="${y + 40}" stroke="${LINE}" stroke-width="1.6"/><line x1="${x}" y1="${y}" x2="${x + 30}" y2="${y + 40}" stroke="${LINE}" stroke-width="1.6"/><path d="M${x - 44},${y + 40} Q${x},${y + 62} ${x + 44},${y + 40} Z" fill="#FFE3EE" stroke="${LINE}" stroke-width="2"/>${items(x, y + 38)}`;
  const thing = t => (x, y) => `<text x="${x}" y="${y - 2}" font-size="30" text-anchor="middle">${t.e}</text><text x="${x}" y="${y + 34}" font-size="10.5" text-anchor="middle" font-weight="900" fill="${INK}">${esc(t.name)}</text>`;
  const weights = ws => (x, y) => { const n = ws.n, per = Math.min(5, n), bw = 22, rows = Math.ceil(n / per); let s = "";
    for (let i = 0; i < n; i++) { const r0 = Math.floor(i / per), c = i % per, inRow = Math.min(per, n - r0 * per), wx = x - inRow * (bw + 2) / 2 + c * (bw + 2), wy = y - 16 - r0 * 18;
      s += `<rect class="bwt" x="${wx.toFixed(1)}" y="${wy}" width="${bw}" height="16" rx="4" fill="#D6EEFF" stroke="${INK}" stroke-width="1.3"/><text x="${(wx + bw / 2).toFixed(1)}" y="${wy + 11.5}" font-size="7.5" text-anchor="middle" font-weight="900" fill="${INK}">${ws.lab}</text>`; }
    return s + `<text x="${x}" y="${y + 34}" font-size="10.5" text-anchor="middle" font-weight="900" fill="${INK}">${rows > 1 || n > 1 ? n + " weights" : "1 weight"}</text>`; };
  const body = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="#FFFDF8" stroke="#F1E3F7" stroke-width="2"/>`
    + `<path d="M${cx - 26},${H - 12} L${cx + 26},${H - 12} L${cx + 6},${py} L${cx - 6},${py} Z" fill="#E2D6FF" stroke="${LINE}" stroke-width="2"/>`
    + `<line class="beam" data-tilt="${tilt}" x1="${L[0]}" y1="${L[1]}" x2="${R[0]}" y2="${R[1]}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="${cx}" cy="${py}" r="6" fill="#FFB8D1" stroke="${INK}" stroke-width="2"/>`
    + pan(L, left.e ? thing(left) : weights(left)) + pan(R, right.e ? thing(right) : weights(right));
  return svgBox(body, "a pan balance", W, H, `0 0 ${W} ${H}`, "mpic chart balpic");
};
// a measuring jug marked in litres (cap 4–10), filled to n litres
const svgJug = (n, cap, drink = "lemonade", fill = "#FFE7A8") => {
  const W = 220, H = 190, x0 = 60, x1 = 150, yb = 172, yt = 30, y = v => +(yb - (yb - yt) * v / cap).toFixed(1); let ticks = "";
  for (let v = 1; v <= cap; v++) ticks += `<line x1="${x1 - 16}" y1="${y(v)}" x2="${x1}" y2="${y(v)}" stroke="${INK}" stroke-width="1.6"/><text class="jtick" data-v="${v}" x="${x1 + 6}" y="${y(v) + 4}" font-size="11" font-weight="900" fill="${INK}">${v} ℓ</text>`;
  const body = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="#FFFDF8" stroke="#F1E3F7" stroke-width="2"/>`
    + `<rect class="jliq" data-v="${n}" x="${x0 + 2}" y="${y(n)}" width="${x1 - x0 - 4}" height="${+(yb - y(n)).toFixed(1)}" fill="${fill}" opacity=".9"/>`
    + `<path d="M${x0},${yt - 8} L${x0},${yb} Q${x0},${yb + 6} ${x0 + 6},${yb + 6} L${x1 - 6},${yb + 6} Q${x1},${yb + 6} ${x1},${yb} L${x1},${yt - 8}" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`
    + `<path d="M${x0},${yt + 6} C${x0 - 34},${yt + 6} ${x0 - 34},${yt + 70} ${x0},${yt + 70}" fill="none" stroke="${INK}" stroke-width="3"/>${ticks}`;
  return svgBox(body, `a measuring jug with ${drink}`, W, H, `0 0 ${W} ${H}`, "mpic chart jugpic");
};
// 3D solids (MOE P2: cube, cuboid, cone, cylinder, sphere), drawn in a soft pastel style; hidden edges dashed
const SOLID3 = {
  cube: { name: "cube", flat: 6, desc: "6 flat faces, all squares", roll: false },
  cuboid: { name: "cuboid", flat: 6, desc: "6 flat faces that are rectangles (some can be squares)", roll: false },
  cylinder: { name: "cylinder", flat: 2, desc: "2 flat faces that are circles and 1 curved face", roll: true },
  cone: { name: "cone", flat: 1, desc: "1 flat face that is a circle, 1 curved face and a point at the top", roll: true },
  sphere: { name: "sphere", flat: 0, desc: "no flat faces, only 1 curved face, like a ball", roll: true }
};
const SOLID_KEYS = Object.keys(SOLID3);
const svgSolid = (k, fill = "#BDE7FF", small = false) => { const st = `stroke="${INK}" stroke-width="3" stroke-linejoin="round"`, lite = `fill="#FFFFFF" fill-opacity=".5"`, dash = `fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="4 3"`; let g = "";
  if (k === "cube") g = `<polygon points="20,48 72,48 72,100 20,100" fill="${fill}" ${st}/><polygon points="20,48 46,24 98,24 72,48" fill="${fill}" ${st}/><polygon points="20,48 46,24 98,24 72,48" ${lite}/><polygon points="72,48 98,24 98,76 72,100" fill="${fill}" ${st}/><polygon points="72,48 98,24 98,76 72,100" fill="#6d4f86" fill-opacity=".12"/>`;
  else if (k === "cuboid") g = `<polygon points="8,56 82,56 82,100 8,100" fill="${fill}" ${st}/><polygon points="8,56 32,34 106,34 82,56" fill="${fill}" ${st}/><polygon points="8,56 32,34 106,34 82,56" ${lite}/><polygon points="82,56 106,34 106,78 82,100" fill="${fill}" ${st}/><polygon points="82,56 106,34 106,78 82,100" fill="#6d4f86" fill-opacity=".12"/>`;
  else if (k === "cylinder") g = `<path d="M28,28 L28,92 A32,11 0 0,0 92,92 L92,28" fill="${fill}" ${st}/><path d="M28,92 A32,11 0 0,1 92,92" ${dash}/><ellipse cx="60" cy="28" rx="32" ry="11" fill="${fill}" ${st}/><ellipse cx="60" cy="28" rx="32" ry="11" ${lite}/>`;
  else if (k === "cone") g = `<path d="M60,12 L24,92 A36,12 0 0,0 96,92 Z" fill="${fill}" ${st}/><path d="M24,92 A36,12 0 0,1 96,92" ${dash}/>`;
  else g = `<circle cx="60" cy="60" r="44" fill="${fill}" ${st}/><path d="M16,60 A44,14 0 0,0 104,60" fill="none" stroke="${INK}" stroke-width="1.6"/><path d="M16,60 A44,14 0 0,1 104,60" ${dash}/><ellipse cx="44" cy="40" rx="11" ry="7" fill="#FFFFFF" opacity=".6"/>`;
  return svgBox(g, `a solid shape`, small ? 92 : 128, small ? 92 : 128, "0 0 120 120", `mpic solidpic s-${k}`); };
// 📐 squared-paper figures for area and perimeter (MOE P3): connected squares with no holes on an 8 × 6 grid
const AR = { W: 8, H: 6, S: 16, pad: 6 };
const STEP4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const perimOf = cells => cells.reduce((p, [a, b]) => p + STEP4.filter(([x, y]) => !hasCell(cells, [a + x, b + y])).length, 0);
// no hole: every empty square can reach the edge of the paper through empty squares
const noHole = cells => { const out = [], seen = new Set(cells.map(cellKey)), todo = [];
  for (let a = -1; a <= AR.W; a++) for (let b = -1; b <= AR.H; b++) if (a < 0 || b < 0 || a === AR.W || b === AR.H) { todo.push([a, b]); seen.add(a + "," + b); }
  while (todo.length) { const [a, b] = todo.pop(); out.push(1); for (const [x, y] of STEP4) { const c = [a + x, b + y]; if (c[0] < -1 || c[1] < -1 || c[0] > AR.W || c[1] > AR.H || seen.has(cellKey(c))) continue; seen.add(cellKey(c)); todo.push(c); } }
  return seen.size === (AR.W + 2) * (AR.H + 2); };
const growFig = (r, n) => { for (let k = 0; k < 50; k++) { const cells = [[r.int(1, AR.W - 2), r.int(1, AR.H - 2)]];
    while (cells.length < n) { const nb = nearCells(cells, AR.W, AR.H); if (!nb.length) break; cells.push(r.pick(nb)); }
    if (cells.length === n && noHole(cells)) return cells; } return [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1]].slice(0, Math.min(5, n)); };
const svgTiles = (cells, fill, small) => gridSheet(AR.W, AR.H, AR.S, AR.pad, cells.map(([x, y]) => gridCell(x, y, AR.S, AR.pad, fill, "atile")).join(""), "a shape made of squares on squared paper", small ? 1.05 : 1.7, "mpic symgrid areapic");
// a fan (an angle) for the angle topics: two arms from a corner, base arm turned rot° (anticlockwise), opened deg°; o.mark draws the right-angle box
const svgFan = (deg, o = {}) => { const W = 150, H = 104, V = [75, 92], rot = o.rot || 0, L1 = o.l1 || 58, L2 = o.l2 || 58, rad = d => d * Math.PI / 180;
  const P = (d, L) => [+(V[0] + L * Math.cos(rad(d))).toFixed(1), +(V[1] - L * Math.sin(rad(d))).toFixed(1)], A = P(rot, L1), B = P(rot + deg, L2), r0 = 17, a0 = P(rot, r0), b0 = P(rot + deg, r0);
  const wedge = o.mark && deg === 90 ? `<path d="M${V[0]},${V[1]} L${P(rot, 12).join(",")} L${(P(rot, 12)[0] + P(rot + 90, 12)[0] - V[0]).toFixed(1)},${(P(rot, 12)[1] + P(rot + 90, 12)[1] - V[1]).toFixed(1)} L${P(rot + 90, 12).join(",")} Z" fill="#FFC9DA" stroke="${LINE}" stroke-width="1.4"/>`
    : `<path d="M${V[0]},${V[1]} L${a0.join(",")} A${r0},${r0} 0 ${deg > 180 ? 1 : 0},0 ${b0.join(",")} Z" fill="${o.fill || "#FFC9DA"}" stroke="${LINE}" stroke-width="1.4"/>`;
  const body = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="#FFFDF8" stroke="#F1E3F7" stroke-width="2"/>${wedge}`
    + `<line class="farm" x1="${V[0]}" y1="${V[1]}" x2="${A[0]}" y2="${A[1]}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><line class="farm" x1="${V[0]}" y1="${V[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><circle cx="${V[0]}" cy="${V[1]}" r="3.5" fill="${INK}"/>`
    + (o.tag ? `<text x="12" y="20" font-size="13" font-weight="900" fill="${INK}">${o.tag}</text>` : "");
  return svgBox(body, "an angle", o.small ? 132 : 180, o.small ? 92 : 125, `0 0 ${W} ${H}`, "mpic chart fanpic"); };

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
// 🎀 MOE P1 length: measuring in centimetres (cm), comparing and ordering lengths, a line that does not start at 0
const LEN_WHO = ["Rapunzel", "Fairy Pip", "Little Red", "Goldilocks", "Jack", "Princess Mira", "Sumi the star fairy"];
const LEN_THINGS = ["ribbon", "crayon", "pencil", "candy stick", "magic wand", "caterpillar", "feather"];
topic(1, "length", "Ribbon Ruler", "🎀", "Measure and compare lengths in centimetres (cm)", r => {
  const t = r.int(0, 4), who = r.pick(LEN_WHO), what = r.pick(LEN_THINGS);
  if (t === 0) { const L = r.int(2, 14);
    return numWhy(`How long is ${who}'s ${what}? (in cm)`, L, "Start at 0 and count the 1 cm spaces to the end.", [`The ${what} starts at 0 and ends at ${L}.`, `So it is ${L} cm long.`],
      [[L + 1, "You counted the marks, not the spaces between them. Start at 0 and count each 1 cm jump."], [L - 1, `Count every 1 cm space, right up to the end of the ${what}.`]],
      { pic: svgRuler([{ from: 0, to: L, fill: r.pick(RIB) }], 15, "cm", what), data: { len: "read", from: 0, to: L } }); }
  if (t === 1) { const s = r.int(1, 5), L = r.int(2, 9), e = s + L;
    return numWhy(`${who}'s ${what} does not start at 0. How long is it? (in cm)`, L, `Count the 1 cm spaces from ${s} to ${e}, or work out ${e} − ${s}.`, [`It starts at ${s} and ends at ${e}.`, `${e} − ${s} = ${L} cm`],
      [[e, `${e} is where the ${what} ends. It starts at ${s}, not at 0, so take away ${s}.`], [e + s, `Only count the spaces under the ${what}, from ${s} to ${e}.`]],
      { pic: svgRuler([{ from: s, to: e, fill: r.pick(RIB) }], 15, "cm", what), data: { len: "shift", from: s, to: e } }); }
  if (t === 2) { // three ribbons from 0: which is the longest / shortest?
    const ls = distinct(r, 3, 3, 14), N = ["A", "B", "C"], long = r.chance(.5), k = ls.indexOf(long ? Math.max(...ls) : Math.min(...ls)), word = long ? "longest" : "shortest";
    return mcqWhy(r, `${who} has three ribbons. Which ribbon is the ${word}?`, `Ribbon ${N[k]}`, `Ribbon ${N[k]} ends at ${ls[k]} cm, so it is the ${word}.`,
      N.map((n, i) => [`Ribbon ${n}`, `Ribbon ${n} is ${ls[i]} cm, ${long ? "shorter" : "longer"} than ribbon ${N[k]} (${ls[k]} cm).`]).filter((_, i) => i !== k),
      "All the ribbons start at 0. Look where each one ends on the ruler.", [N.map((n, i) => `${n}: ${ls[i]} cm`).join(", "), `Ribbon ${N[k]} is the ${word}.`],
      { pic: svgRuler(ls.map((l, i) => ({ from: 0, to: l, fill: RIB[i], name: N[i] })), 15, "cm"), data: { len: "compare", ls, long } }); }
  if (t === 3) { const a = r.int(6, 20), b = r.int(2, a - 1), [A, B] = r.shuffle(["crayon", "pencil", "ribbon", "wand", "feather", "candy stick"]).slice(0, 2);
    return numWhy(`A ${A} is ${a} cm long. A ${B} is ${b} cm long. How much longer is the ${A}? (in cm)`, a - b, "How much longer means find the difference: take away.", [`${a} − ${b} = ${a - b}`, `The ${A} is ${a - b} cm longer.`],
      [[a + b, "You added. 'How much longer' asks for the difference, so take away."], [a, `${a} cm is the whole ${A}. Take away the ${B}'s ${b} cm.`]], { data: { len: "diff", a, b } }); }
  const ls = distinct(r, 3, 4, 20), th = r.shuffle(["snake", "worm", "caterpillar", "dragon", "train", "kite tail"]).slice(0, 3), long = r.chance(.5), k = ls.indexOf(long ? Math.max(...ls) : Math.min(...ls)), word = long ? "longest" : "shortest";
  return mcqWhy(r, `Jack's toys: the ${th[0]} is ${ls[0]} cm, the ${th[1]} is ${ls[1]} cm and the ${th[2]} is ${ls[2]} cm long. Which toy is the ${word}?`, `The ${th[k]}`, `${ls[k]} cm is the ${long ? "biggest" : "smallest"} number of centimetres.`,
    th.map((x, i) => [`The ${x}`, `The ${x} is ${ls[i]} cm, ${long ? "shorter" : "longer"} than the ${th[k]} (${ls[k]} cm).`]).filter((_, i) => i !== k),
    `Compare the numbers of centimetres: the ${long ? "biggest" : "smallest"} number is the ${word} toy.`, [`${[...ls].sort((x, y) => long ? y - x : x - y).join(long ? " > " : " < ")}`, `The ${th[k]} is the ${word}.`], { data: { len: "order", ls, long } });
});
topic(1, "money", "Coin Purse", "🪙", "Count coins in cents", r => {
  const coins = []; let tot = 0; const n = r.int(2, 5);
  for (let i = 0; i < n; i++) { const c = r.pick(tot > 50 ? [5, 10, 20] : [5, 10, 20, 50]); if (tot + c > 100) break; coins.push(c); tot += c; }
  coins.sort((a, b) => b - a);
  return num(`The Frog King's purse holds these coins. How many cents altogether?`, tot, "Start with the biggest coin and count on.", [coins.map(c => c + "¢").join(" + ") + ` = ${tot}¢`], { pic: `<div class="mpic coins">${coins.map(coin).join("")}</div>`, data: { coins } });
});
// 🕰️ "what time is it?" on a clock picture; the answer is typed as h:mm (shared by the clock topics)
const readClock = (h, m, q, hint, steps) => Q({ q, kind: "time", val: h * 60 + m, a: hm(h, m), keys: [":"], pic: svgClock(h, m), hint, steps, data: { h, m } });
topic(1, "time", "Clock Tower", "🕰️", "O'clock, half past and 5-minute times", r => {
  const h = r.int(1, 12), five = r.chance(.5), m = five ? r.int(1, 11) * 5 : r.pick([0, 30]);
  if (five) return readClock(h, m, "What time does the Clock Tower show? (type it like 3:25)", "The short hand shows the hour. Count the long hand in fives from the 12: 5, 10, 15…",
    [`Count in fives from the 12: ${Array.from({ length: m / 5 }, (_, i) => 5 * (i + 1)).join(", ")} → ${m} minutes.`, `The short hand is just past ${h} → ${hm(h, m)}.`]);
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
// 💰 MOE P2 money: count dollars and cents, decimal notation, compare amounts, dollars ↔ cents (adding money is P3: g3.money)
const NOTE = v => `<span class="mnote n${v}">$${v}</span>`;
const dol = c => `$${(c / 100).toFixed(2)}`;
topic(2, "money", "Dollars & Cents", "💰", "Count, write and compare money in dollars and cents", r => {
  const t = r.int(0, 3);
  if (t === 0) { // count notes and coins
    const notes = r.shuffle([2, 5, 10]).slice(0, r.int(1, 2)).sort((a, b) => b - a), coins = []; for (let i = r.int(2, 4); i > 0; i--) coins.push(r.pick([100, 50, 20, 10, 5]));
    coins.sort((a, b) => b - a); const d = notes.reduce((a, b) => a + b, 0), c = coins.reduce((a, b) => a + b, 0), tot = d * 100 + c;
    return numWhy("How much money is in the Frog King's purse? (type it like 12.45)", tot / 100, "Count the notes first, then count on the coins.",
      [`Notes: ${notes.map(x => "$" + x).join(" + ")} = $${d}`, `Coins: ${coins.map(x => x >= 100 ? "$1" : x + "¢").join(" + ")} = ${c >= 100 ? dol(c) : c + "¢"}`, `Altogether: $${d} + ${c >= 100 ? dol(c) : c + "¢"} = ${dol(tot)}`],
      [[tot, `That is the amount in cents (${tot}¢). Write it in dollars with a point: ${dol(tot)}.`], [d, "Don't forget to count on the coins after the notes."], [c / 100, "Count the notes too, not only the coins."]],
      { a: (tot / 100).toFixed(2), tol: 0.001, keys: ["."], pic: `<div class="mpic coins">${notes.map(NOTE).join("")}${coins.map(coin).join("")}</div>`, data: { money: "count", notes, coins } }); }
  if (t === 1) { const d = r.int(1, 20), c = r.chance(.3) ? r.int(1, 9) : r.int(2, 19) * 5, tot = d * 100 + c, words = `${d} dollar${d > 1 ? "s" : ""} and ${c} cent${c > 1 ? "s" : ""}`;
    if (r.chance(.6)) return numWhy(`Write ${words} in dollars. (type it like 4.35)`, tot / 100, "Dollars go before the point and cents after it. Cents always take two places.", [`${d} dollars → $${d}.`, `${c} cents → .${pad2(c)}`, `So it is ${dol(tot)}.`],
      (c < 10 ? [[d + c / 10, `${c} cents is $0.0${c}: cents take two places after the point, so write a 0 first.`]] : []).concat([[tot, "That is the amount in cents. Write it in dollars with a point."]]),
      { a: (tot / 100).toFixed(2), tol: 0.001, keys: ["."], data: { money: "write", d, c } });
    return mcqWhy(r, `How do we say ${dol(tot)}?`, words, `The number before the point is the dollars (${d}); the two digits after it are the cents (${pad2(c)}).`,
      [[`${c} dollar${c > 1 ? "s" : ""} and ${d} cent${d > 1 ? "s" : ""}`, "That swaps them: the dollars come before the point."], [`${tot} dollars`, `${tot} is the amount in cents, not dollars.`],
        [`${d} dollar${d > 1 ? "s" : ""} and ${c < 10 ? c * 10 : Math.floor(c / 10)} cents`, `The cents are the two digits after the point: ${pad2(c)} → ${c} cents.`]],
      "Dollars before the point, cents after the point.", [`${dol(tot)} = ${words}`], { data: { money: "say", d, c } }); }
  if (t === 2) { // compare amounts with the same digits
    let a = r.int(1, 9), b = r.int(1, 9); if (a === b) b = b % 9 + 1;
    const cs = r.shuffle([a * 100 + b * 10, a * 100 + b, b * 100 + a * 10]), most = r.chance(.6), k = cs.indexOf(most ? Math.max(...cs) : Math.min(...cs)), word = most ? "the most" : "the least";
    return mcqWhy(r, `Three magic beans cost ${cs.map(dol).join(", ")}. Which costs ${word}?`, dol(cs[k]), `${dol(cs[k])} = ${cs[k]}¢, ${most ? "more" : "less"} than the others.`,
      cs.map((x, i) => [dol(x), `${dol(x)} = ${x}¢, which is ${most ? "less" : "more"} than ${dol(cs[k])} (${cs[k]}¢).`]).filter((_, i) => i !== k),
      "Compare the dollars first. If the dollars are the same, compare the cents.", [cs.map(x => `${dol(x)} = ${x}¢`).join(", "), `So ${dol(cs[k])} costs ${word}.`], { data: { money: "compare", cs } }); }
  const tot = r.int(1, 9) * 100 + r.int(0, 19) * 5, d = Math.floor(tot / 100), c = tot % 100;
  if (r.chance(.5)) return numWhy(`How many cents is ${dol(tot)}?`, tot, "$1 = 100¢. Change the dollars into cents, then add the cents.", [`$${d} = ${d * 100}¢`, `${d * 100}¢ + ${c}¢ = ${tot}¢`],
    [[d + c, "Each dollar is 100 cents, not 1 cent."], [tot / 100, "That is still in dollars. The question asks for cents."]], { a: String(tot), data: { money: "tocents", tot } });
  return numWhy(`Write ${tot}¢ in dollars. (type it like 3.45)`, tot / 100, "100¢ = $1. Every 100 cents makes a dollar.", [`${tot}¢ = ${d} hundred cents and ${c}¢`, `= $${d} and ${c}¢ = ${dol(tot)}`],
    [[tot, "That is still in cents. Every 100¢ is $1, so put the point two places from the right."], [tot / 10, "Put the point two places from the right: cents take two places."]], { a: (tot / 100).toFixed(2), tol: 0.001, keys: ["."], data: { money: "todollars", tot } });
});
// ⏰ MOE P2 time: telling time to the minute; hours and minutes; hours and minutes ↔ minutes (5-minute times are P1 revision)
topic(2, "time", "Minute-Hand Clock", "⏰", "Tell the time to the minute; hours and minutes", r => {
  const t = r.int(0, 3);
  if (t === 0) { const h = r.int(1, 12), m = r.int(0, 11) * 5;
    return readClock(h, m, "What time is it? (type it like 4:25)", "Count the long hand in fives from the 12: 5, 10, 15…",
      [`The long hand points to ${m ? m / 5 : 12} → ${m} minutes.`, `The short hand is ${m ? "just past " : "on "}${h} → ${hm(h, m)}`]); }
  if (t === 1) { const h = r.int(1, 12), m = r.pick([1, 2, 3, 4, 6, 7, 8, 9]) + 10 * r.int(0, 5), f = Math.floor(m / 5) * 5;
    return readClock(h, m, "What time is it? (type it like 4:27)", "Count the long hand in fives from the 12, then count on the little marks in ones.",
      [`Count in fives${f ? " to " + f : ": the long hand is just past the 12"}, then ${m - f} more in ones → ${m} minutes.`, `The short hand is just past ${h} → ${hm(h, m)}`]); }
  if (t === 2) { const hh = r.int(1, 4), mm = r.int(1, 11) * 5, v = hh * 60 + mm;
    return numWhy(`The Sleeping Beauty nap lasted ${hh} h ${mm} min. How many minutes is that?`, v, "1 hour = 60 minutes. Change the hours into minutes, then add the minutes.", [`${hh} h = ${hh} × 60 = ${hh * 60} min`, `${hh * 60} + ${mm} = ${v} min`],
      [[hh + mm, "Each hour is 60 minutes, so change the hours into minutes first."], [hh * 100 + mm, "An hour is 60 minutes, not 100."], [hh * 60, `Add the ${mm} minutes too.`]], { data: { hmin: "tomin", hh, mm } }); }
  let tot = r.int(65, 235); if (tot % 60 === 0) tot += 5; const hh = Math.floor(tot / 60), mm = tot % 60, right = `${hh} h ${mm} min`;
  return mcqWhy(r, `The fairy picnic lasted ${tot} minutes. How long is that in hours and minutes?`, right, `${hh} × 60 = ${hh * 60} minutes, and ${tot} − ${hh * 60} = ${mm} minutes are left.`,
    [[`${Math.floor(tot / 100)} h ${tot % 100} min`, "An hour is 60 minutes, not 100."], [`${hh + 1} h ${mm} min`, `${hh + 1} h would be ${(hh + 1) * 60} minutes already, more than ${tot}.`], [`${hh} h ${60 - mm} min`, `${hh} h is ${hh * 60} min; ${tot} − ${hh * 60} leaves ${mm}, not ${60 - mm}.`], [`${hh - 1 > 0 ? hh - 1 : hh + 2} h ${mm} min`, "Count how many 60s fit into the minutes."]],
    "How many groups of 60 minutes fit? The minutes left over are the extra minutes.", [`${tot} = ${hh} × 60 + ${mm}`, `${tot} min = ${right}`], { data: { hmin: "tohm", tot } });
});
// 🍕 MOE P2 fractions: half, quarter, third…; compare and order unit fractions and like fractions (denominators to 12);
// add and subtract like fractions within one whole ("1/d of a set" is P4: g4.fracset)
topic(2, "frac", "Pizza Fractions", "🍕", "Name, compare, add and take away fractions of a whole", r => {
  const t = r.int(0, 3);
  if (t === 0) { const d = r.pick([2, 3, 4, 6, 8]), k = r.int(1, d - 1);
    return numWhy("What fraction of the pie is shaded pink? (type it like 1/4)", k / d, "Bottom number: how many equal parts. Top number: how many are shaded.", [`The pie has ${d} equal parts and ${k} ${k === 1 ? "is" : "are"} shaded.`, `Fraction shaded = $\\frac{${k}}{${d}}$${gcd(k, d) > 1 ? ` (the same as $${fracTex(k, d)}$)` : ""}`],
      [[(d - k) / d, `That is the white part. Count the pink parts: ${k} of the ${d}.`], [k / (d - k), `The bottom number is all ${d} equal parts, not only the white ones.`]], { a: `${k}/${d}`, keys: ["/"], pic: svgPie(k, d), data: { k, d } }); }
  if (t === 1) { // unit fractions: more equal parts → smaller parts
    const ds = distinct(r, 3, 2, 12), big = r.chance(.5), k = ds.indexOf(big ? Math.min(...ds) : Math.max(...ds)), u = d => `1/${d}`, word = big ? "biggest" : "smallest";
    return mcqWhy(r, `Three fairies share same-size cakes. Which piece is the ${word}?`, u(ds[k]), `A cake cut into ${ds[k]} equal pieces has the ${big ? "fewest" : "most"} pieces, so each one is the ${word}.`,
      ds.map((d, i) => [u(d), `${d} equal pieces: ${d < ds[k] ? "fewer pieces, so each piece is bigger" : "more pieces, so each piece is smaller"}.`]).filter((_, i) => i !== k),
      "Same top number 1: the more equal parts the cake is cut into, the smaller each part.", [`The bottom numbers are ${ds.join(", ")}.`, `${u(ds[k])} has the ${big ? "smallest" : "biggest"} bottom number, so it is the ${word} piece.`],
      { data: { cmp: "unit", ds } }); }
  if (t === 2) { // like fractions: same bottom number, compare the tops
    const d = r.pick([5, 6, 7, 8, 9, 10, 12]), ns = distinct(r, 3, 1, d - 1), big = r.chance(.5), k = ns.indexOf(big ? Math.max(...ns) : Math.min(...ns)), f = n => `${n}/${d}`, word = big ? "greatest" : "smallest";
    return mcqWhy(r, `Which fraction is the ${word}?`, f(ns[k]), `All are ${d}ths, so the one with the ${big ? "most" : "fewest"} parts is the ${word}.`,
      ns.map((n, i) => [f(n), `${n} parts of ${d} is ${n < ns[k] ? "fewer" : "more"} than ${ns[k]} parts of ${d}.`]).filter((_, i) => i !== k),
      "The bottom numbers are the same, so the pieces are the same size. Compare how many pieces.", [`Compare the top numbers: ${ns.join(", ")}.`, `${f(ns[k])} is the ${word}.`],
      { data: { cmp: "like", d, ns } }); }
  const d = r.pick([3, 4, 5, 6, 8, 10, 12]), add = r.chance(.5), a = add ? r.int(1, d - 2) : r.int(2, d - 1), b = add ? r.int(1, d - 1 - a) : r.int(1, a - 1), n = add ? a + b : a - b;
  return numWhy(`${add ? `Goldilocks eats ${a}/${d} of a pie, then ${b}/${d} more.` : `${a}/${d} of a pie is left. The bears eat ${b}/${d} of the pie.`} What fraction of the pie ${add ? "has she eaten" : "is left now"}? (type it like 2/5)`, n / d,
    `Same-size pieces (${d}ths): ${add ? "add" : "take away"} the top numbers and keep the bottom number.`, [`${a}/${d} ${add ? "+" : "−"} ${b}/${d} = ${n}/${d}`],
    add ? [[(a + b) / (2 * d), `You added the bottom numbers too. The pieces are still ${d}ths, so keep ${d} at the bottom.`]] : [[(a + b) / d, "You added. The bears ate some, so take away."], [a - b, `Keep the bottom number ${d}: the answer is a fraction of the pie.`]],
    { a: `${n}/${d}`, keys: ["/"], data: { fb: [{ n: a, d, t: `${a}/${d}` }, { n: b, d, t: `${add ? "+" : "−"} ${b}/${d}` }, { n, d, t: `= ${n}/${d}`, reveal: 1, q: 1 }] } });
});
// 🍯 MOE P2 length (m), mass (kg, g) and volume (ℓ): measure, choose the unit, compare, and find the difference (same unit only)
const UNIT_FOR = [
  ["the length of a pencil", "cm"], ["the length of a crayon", "cm"], ["the height of a teacup", "cm"], ["the length of a ladybird's leaf", "cm"],
  ["the length of a castle wall", "m"], ["the height of Rapunzel's tower", "m"], ["the length of a swimming pool", "m"], ["the length of a bridge", "m"],
  ["the mass of a sack of rice", "kg"], ["the mass of a pumpkin coach wheel", "kg"], ["the mass of a baby dragon", "kg"], ["the mass of a big watermelon", "kg"],
  ["the mass of a strawberry", "g"], ["the mass of a fairy's button", "g"], ["the mass of a cookie", "g"], ["the mass of a feather pen", "g"],
  ["the amount of water in a bathtub", "ℓ"], ["the amount of soup in a giant's pot", "ℓ"], ["the amount of water in a fish tank", "ℓ"], ["the amount of juice in a big party jug", "ℓ"]
];
const UNIT_NAME = { cm: "centimetres (cm)", m: "metres (m)", kg: "kilograms (kg)", g: "grams (g)", "ℓ": "litres (ℓ)" };
const UNIT_WHY = { cm: "Centimetres are for short lengths, like a pencil.", m: "Metres are for long lengths, like a wall or a pool.", kg: "Kilograms are for heavy things, like a sack of rice.",
  g: "Grams are for light things, like a strawberry.", "ℓ": "Litres measure how much liquid a container holds (volume), not length or mass." };
const MASS_THINGS = [["pumpkin", "🎃"], ["melon", "🍈"], ["cabbage", "🥬"], ["teddy", "🧸"], ["cake", "🎂"], ["honey pot", "🍯"]];
topic(2, "measure", "Honey-Pot Measures", "🍯", "Measure in metres, kilograms, grams and litres", r => {
  const t = r.int(0, 6);
  if (t === 0) { const [what, u] = r.pick(UNIT_FOR), kind = u === "cm" || u === "m" ? "length" : u === "ℓ" ? "volume" : "mass";
    const others = Object.keys(UNIT_NAME).filter(x => x !== u);
    return mcqWhy(r, `Which unit would you use to measure ${what}?`, UNIT_NAME[u], UNIT_WHY[u],
      r.shuffle(others).map(x => [UNIT_NAME[x], (kind === "length" && (x === "cm" || x === "m")) || (kind === "mass" && (x === "kg" || x === "g")) ? UNIT_WHY[x] : `${UNIT_NAME[x]} measure ${x === "ℓ" ? "volume" : x === "kg" || x === "g" ? "mass" : "length"}, but this asks for the ${kind}.`]),
      `First ask: is it a length, a mass or a volume? Then: is it big or small?`, [`This is a ${kind}.`, UNIT_WHY[u]], { data: { unit: u } }); }
  if (t === 1) { const kg = r.chance(.5), n = kg ? r.int(1, 9) : r.int(2, 9), [th, e] = r.pick(MASS_THINGS), lab = kg ? "1 kg" : "100 g", v = kg ? n : n * 100, u = kg ? "kg" : "g";
    return numWhy(`The ${th} balances the weights. What is the mass of the ${th}? (in ${u})`, v, `Each weight is ${lab}. Count the weights${kg ? "" : " in hundreds"}.`, [`${n} weights of ${lab}`, `${kg ? `${n} × 1 kg` : `${n} × 100 g`} = ${v} ${u}`],
      kg ? [[n * 100, "Each weight is 1 kg, not 100 g."]] : [[n, `Each weight is 100 g, so count in hundreds: 100, 200, 300…`], [n * 10, "Each weight is 100 g, not 10 g."]],
      { pic: svgBalance({ e, name: th }, { n, lab }, 0), data: { bal: "read", n, kg } }); }
  if (t === 2) { const [A, B] = r.shuffle(MASS_THINGS).slice(0, 2), tilt = r.pick([-1, 1]), heavy = tilt < 0 ? A : B, light = tilt < 0 ? B : A;
    return mcqWhy(r, `Look at the balance. Which is heavier?`, `The ${heavy[0]}`, `The side that goes down is heavier. The ${heavy[0]}'s side is down.`,
      [[`The ${light[0]}`, `The ${light[0]}'s side went up, so it is lighter.`], ["They have the same mass", "If they had the same mass, the balance would be level."]],
      "The heavier side of a balance goes down.", [`The ${heavy[0]}'s pan is lower.`, `So the ${heavy[0]} is heavier than the ${light[0]}.`],
      { pic: svgBalance({ e: A[1], name: A[0] }, { e: B[1], name: B[0] }, tilt), data: { bal: "tilt", tilt } }); }
  if (t === 3) { const cap = r.pick([5, 6, 8, 10]), n = r.int(1, cap - 1), [dr, fill] = r.pick([["lemonade", "#FFF1A8"], ["berry juice", "#FFC9DA"], ["mint tea", "#C8F2DC"], ["magic potion", "#E2D6FF"], ["water", "#CFEFFF"]]);
    return numWhy(`How much ${dr} is in the jug? (in ℓ)`, n, "Read the mark at the top of the liquid.", [`The ${dr} reaches the ${n} ℓ mark.`, `There are ${n} litres.`],
      [[cap, `${cap} ℓ is how much the jug can hold when full. Read where the ${dr} reaches.`], [cap - n, "That is the empty part. Read the mark at the top of the liquid."]], { pic: svgJug(n, cap, dr, fill), data: { jug: n, cap } }); }
  if (t === 4) { const L = r.int(2, 12), s = r.chance(.6) ? 0 : r.int(1, 3), e = s + L;
    return numWhy(`How long is the dragon's tail? (in m)`, L, s ? `Count the metres from ${s} to ${e}.` : "Read the number at the end of the tail.", s ? [`From ${s} m to ${e} m`, `${e} − ${s} = ${L} m`] : [`The tail ends at ${L}.`, `It is ${L} m long.`],
      s ? [[e, `The tail starts at ${s}, not 0, so take away ${s}.`]] : [[L + 1, "Count the metre spaces, not the marks."]], { pic: svgRuler([{ from: s, to: e, fill: r.pick(RIB) }], 15, "m", "dragon tail"), data: { len: "m", from: s, to: e } }); }
  const kind = r.pick(["m", "kg", "g", "ℓ"]), a = kind === "g" ? r.int(4, 9) * 100 : r.int(12, 95), b = kind === "g" ? r.int(1, a / 100 - 1) * 100 : r.int(3, a - 2);
  const THING = { m: [["red ribbon", "blue ribbon"], "longer"], kg: [["pumpkin", "melon"], "heavier"], g: [["apple", "pear"], "heavier"], "ℓ": [["blue pot", "pink pot"], "more"] }[kind];
  const [x, y] = r.shuffle(THING[0]), dis = kind === "ℓ" ? (v, w) => `The ${w} holds ${v} ℓ` : (v, w) => `The ${w} is ${v} ${kind}`;
  if (t === 5) { const ans = `The ${x}`, more = THING[1];
    return mcqWhy(r, `${dis(a, x)}. ${dis(b, y)}. Which ${kind === "ℓ" ? "holds more" : "is " + more}?`, ans, `${a} ${kind} is more than ${b} ${kind}.`,
      [[`The ${y}`, `${b} ${kind} is less than ${a} ${kind}.`], ["They are the same", `${a} and ${b} are different amounts.`]], "The units are the same, so compare the numbers.", [`${a} > ${b}`, `So the ${x} ${kind === "ℓ" ? "holds more" : "is " + more}.`], { data: { cmp: kind, a, b } }); }
  return numWhy(`${dis(a, x)}. ${dis(b, y)}. How much ${THING[1]} ${kind === "ℓ" ? `does the ${x} hold` : `is the ${x}`}? (in ${kind})`, a - b, "Find the difference: take away the smaller amount from the bigger one.", [`${a} − ${b} = ${a - b} ${kind}`],
    [[a + b, "You added. 'How much more' means find the difference, so take away."], [a, `${a} ${kind} is the whole ${x}. Take away the ${y}'s ${b} ${kind}.`]], { data: { diff: kind, a, b } });
});
// 🧸 MOE P2 3D shapes: identify and name cube, cuboid, cone, cylinder and sphere; real-life objects; flat and curved faces
const SOLID_THINGS = { cube: ["a dice 🎲", "a sugar cube", "a toy block"], cuboid: ["a cereal box", "a brick 🧱", "a treasure chest 📦"], cylinder: ["a tin can 🥫", "a drum 🥁", "a candle 🕯️"], cone: ["an ice-cream cone 🍦", "a party hat 🥳", "a traffic cone"], sphere: ["a ball ⚽", "a marble", "an orange 🍊"] };
const SOLID_WHY = { cube: "a cube has 6 square faces, all the same size", cuboid: "a cuboid is a box shape with rectangle faces", cylinder: "a cylinder has 2 round flat faces and a curved side", cone: "a cone has 1 round flat face and a point", sphere: "a sphere is round all over, like a ball" };
const SOLID_FILL = { cube: "#FFB8D1", cuboid: "#BDE7FF", cylinder: "#C8F2DC", cone: "#FFE7A8", sphere: "#E2D6FF" };
topic(2, "solids", "Toy-Box Shapes", "🧸", "Cubes, cuboids, cylinders, cones and spheres", r => {
  const t = r.int(0, 4), k = r.pick(SOLID_KEYS), wrong = r.shuffle(SOLID_KEYS.filter(x => x !== k));
  if (t === 0) return mcqWhy(r, "The Toy-Box Fairy found this shape. What is it called?", SOLID3[k].name, `Yes: ${SOLID_WHY[k]}.`, wrong.map(x => [SOLID3[x].name, `Not a ${SOLID3[x].name}: ${SOLID_WHY[x]}.`]),
    "Look at the faces: flat or curved? Squares, rectangles or circles?", [`It has ${SOLID3[k].desc}.`, `It is a ${SOLID3[k].name}.`], { pic: svgSolid(k, SOLID_FILL[k]), data: { solid: k } });
  if (t === 1) { const th = r.pick(SOLID_THINGS[k]);
    return mcqWhy(r, `Which shape is ${th} most like?`, SOLID3[k].name, `${cap1(th)} is like a ${SOLID3[k].name}: ${SOLID_WHY[k]}.`, wrong.map(x => [SOLID3[x].name, `${SOLID_WHY[x].replace(/^a /, "A ")}.`]),
      "Picture the object in your hand. Is it round? Is it a box? Does it have a point?", [`${SOLID3[k].desc}`, `So it is like a ${SOLID3[k].name}.`], { data: { solid: k, thing: th } }); }
  if (t === 2) { const RID = { cube: "I am a box. All my 6 faces are the same-size squares.", cuboid: "I am a box shape. My faces are rectangles, and they are not all the same.", cylinder: "I can roll. I have 2 flat faces that are circles.", cone: "I can roll in a circle. I have 1 flat face and a pointy top.", sphere: "I roll every way. I have no flat faces at all." };
    return mcqWhy(r, `Riddle from the Toy Box: "${RID[k]}" What am I?`, SOLID3[k].name, `${cap1(SOLID3[k].name)}: ${SOLID3[k].desc}.`, wrong.map(x => [SOLID3[x].name, `A ${SOLID3[x].name} has ${SOLID3[x].desc}.`]),
      "Use each clue: can it roll? How many flat faces? Squares, rectangles or circles?", [RID[k], `That is a ${SOLID3[k].name}.`], { data: { solid: k } }); }
  if (t === 3) { const v = SOLID3[k].flat, slips = { cube: [[3, "You counted only the faces you can see. A cube has a back, a bottom and a hidden side too."]], cuboid: [[3, "You counted only the faces you can see. Count the hidden back, bottom and side as well."]],
      cylinder: [[3, "The curved side is not flat. Count only the 2 circles at the ends."], [1, "There is a circle at the bottom too."]], cone: [[2, "The curved side is not flat. Only the circle at the bottom is flat."], [0, "The circle at the bottom is a flat face."]], sphere: [[1, "A sphere is curved all over: there are no flat faces."]] }[k];
    return numWhy(`How many flat faces does a ${SOLID3[k].name} have?`, v, "Count the flat faces, including the ones hidden at the back and bottom. Curved faces do not count.", [`A ${SOLID3[k].name} has ${SOLID3[k].desc}.`, `Flat faces: ${v}`], slips, { pic: svgSolid(k, SOLID_FILL[k]), data: { solid: k } }); }
  const roll = r.chance(.5), want = SOLID_KEYS.filter(x => SOLID3[x].roll === roll), ans = r.pick(want), opts = [ans].concat(r.shuffle(SOLID_KEYS.filter(x => SOLID3[x].roll !== roll)).slice(0, 2));
  return mcqWhy(r, roll ? "Which of these shapes can roll?" : "Which of these shapes cannot roll? (it only slides)", SOLID3[ans].name, roll ? `A ${SOLID3[ans].name} has a curved face, so it can roll.` : `A ${SOLID3[ans].name} has only flat faces, so it slides but cannot roll.`,
    opts.slice(1).map(x => [SOLID3[x].name, roll ? `A ${SOLID3[x].name} has only flat faces, so it cannot roll.` : `A ${SOLID3[x].name} has a curved face, so it can roll.`]),
    "Shapes with a curved face can roll. Shapes with only flat faces slide.", [`${SOLID3[ans].name}: ${SOLID3[ans].desc}.`], { optPics: Object.fromEntries(opts.map(x => [SOLID3[x].name, svgSolid(x, SOLID_FILL[x], true)])), data: { solid: ans, roll } });
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
// 🪙 MOE P3 money: add and subtract money in decimal notation, and change from a note (moved out of g2.money, which is now P2)
topic(3, "money", "Market Money", "🪙", "Add and subtract money; change from $10", r => {
  const t = r.int(0, 2);
  if (t < 2) { const a = r.int(105, 900) / 100, b = r.int(50, 500) / 100, sub = t === 1 && a > b, v = rd(sub ? a - b : a + b, 2);
    return numWhy(sub ? `A magic wand costs ${T(money(a))}. A ribbon costs ${T(money(b))}. How much more is the wand? (in $)` : `Red Riding Hood buys bread for ${T(money(a))} and honey for ${T(money(b))}. How much does she spend? (in $)`, v,
      "Line up the decimal points (dollars under dollars, cents under cents).", [`$${a.toFixed(2)} ${sub ? "−" : "+"} $${b.toFixed(2)} = $${v.toFixed(2)}`],
      [[rd(sub ? a + b : Math.abs(a - b), 2), sub ? "You added. 'How much more' means take away." : "You took away. Spending on both means add."], [Math.round(v * 100), "That is the answer in cents. Write it in dollars with a point."]],
      { a: v.toFixed(2), tol: 0.001, keys: ["."], data: { a, b, op: sub ? "-" : "+" } }); }
  const p = r.int(105, 985) / 100, ch = rd(10 - p, 2), nm = r.pick(NAMES);
  return numWhy(`${nm} pays for a fairy lantern costing ${T(money(p))} with a $10 note. How much change does ${nm} get? (in $)`, ch, "Change = money given − price.", [`$10.00 − $${p.toFixed(2)} = $${ch.toFixed(2)}`, `Check: $${p.toFixed(2)} + $${ch.toFixed(2)} = $10.00`],
    [[rd(10 + p, 2), "You added. Change is what is left after paying, so take away."], [p, "That is the price. The change is $10 take away the price."]], { a: ch.toFixed(2), tol: 0.001, keys: ["."], data: { a: 10, b: p, op: "-" } });
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
// 🧱 MOE P3 area and perimeter: area in square units, cm² and m² (no conversion); perimeter of rectilinear figures;
// area of a rectangle/square (finding a side and composite figures are P4: g4.area)
topic(3, "area", "Square-Tile Patio", "🧱", "Area in square units, cm² and m²; area of rectangles", r => {
  const t = r.int(0, 4), fill = r.pick(PASTEL);
  if (t === 0) { const n = r.int(5, 14), cells = growFig(r, n), p = perimOf(cells);
    return numWhy("Each square on the patio is 1 cm². What is the area of the pink shape? (in cm²)", n, "Area = how many squares cover the shape. Count the squares.", [`Count the squares: ${n}.`, `Area = ${n} cm²`],
      [[p, `${p} cm is the perimeter: the distance around the edge. Area counts the squares inside.`]], { pic: svgTiles(cells, "#FFB8D1"), uid: "a0" + figKey(cells), data: { area: "count", cells } }); }
  if (t === 1) { // which shape has the biggest (smallest) area?
    const ns = distinct(r, 3, 4, 12), big = r.chance(.5), k = ns.indexOf(big ? Math.max(...ns) : Math.min(...ns)), figs = ns.map(n => growFig(r, n)), ids = ["f1", "f2", "f3"], optPics = {}, word = big ? "biggest" : "smallest";
    figs.forEach((c, i) => { optPics[ids[i]] = svgTiles(c, PASTEL[i], true); });
    return mcqWhy(r, `Three fairies tiled patios. Which patio has the ${word} area?`, ids[k], `It covers ${ns[k]} squares, the ${big ? "most" : "fewest"}.`,
      ids.map((id, i) => [id, `This one covers ${ns[i]} squares, ${big ? "fewer" : "more"} than ${ns[k]}.`]).filter((_, i) => i !== k),
      "Count the squares in each shape. The tallest or longest shape is not always the biggest.", [ns.map((n, i) => `${"ABC"[i]}: ${n} squares`).join(", ")], { optPics, uid: "a1" + figs.map(figKey).join("/"), data: { area: "pick", ns } }); }
  if (t === 2) { const sq = r.chance(.3), l = r.int(3, 12), w = sq ? l : r.int(2, Math.min(9, l)), u = r.pick(["cm", "m"]);
    return numWhy(`The ${r.pick(["Gingerbread Baker's tray", "dragon's patio", "fairy rug", "royal garden bed"])} is a ${sq ? `square with sides of ${l} ${u}` : `rectangle ${l} ${u} long and ${w} ${u} wide`}. What is its area? (in ${u}²)`, l * w,
      "Area of a rectangle = length × breadth (count one row, then times the number of rows).", [`${w} rows of ${l} squares`, `${l} × ${w} = ${l * w} ${u}²`],
      [[2 * (l + w), `${2 * (l + w)} ${u} is the perimeter (all the way around). Area is length × breadth.`], [l + w, `You added the sides. Area is length × breadth: ${l} × ${w}.`]],
      { data: { l, w, u } }); }
  if (t === 3) { const [what, u] = r.pick([["a postage stamp", "cm²"], ["a page of a storybook", "cm²"], ["a playing card", "cm²"], ["a fairy's handkerchief", "cm²"], ["a football field", "m²"], ["a classroom floor", "m²"], ["the castle courtyard", "m²"], ["a swimming pool", "m²"]]), o = u === "cm²" ? "m²" : "cm²";
    return mcqWhy(r, `Which unit would you use for the area of ${what}?`, u, u === "cm²" ? "Square centimetres are for small surfaces." : "Square metres are for big surfaces like floors and fields.",
      [[o, o === "cm²" ? "Square centimetres are for small surfaces, like a stamp." : "Square metres are for big surfaces, like a floor."], [u.replace("²", ""), `${u.replace("²", "")} measures length. Area is measured in square units.`], [o.replace("²", ""), "That is a unit of length, not area."]],
      "Area uses square units. Small surface → cm²; big surface → m².", [`${what}: ${u === "cm²" ? "small" : "big"} → ${u}`], { data: { area: "unit", u } }); }
  const n = r.int(5, 12), cells = growFig(r, n), p = perimOf(cells);
  return numWhy("Each side of a square is 1 cm. Walk all around the edge of the shape. What is its perimeter? (in cm)", p, "Perimeter = the distance around the outside. Count every 1 cm edge on the outside.", [`Count the outside edges: ${p}.`, `Perimeter = ${p} cm`],
    [[n, `${n} is the number of squares: that is the area. Perimeter counts the edges around the outside.`]], { pic: svgTiles(cells, fill), uid: "a4" + figKey(cells), data: { area: "perim", cells } });
});
// 🪭 MOE P3 angles: the concept of an angle (amount of turn between two arms); right angles; greater or smaller than a right angle
// (no degrees: measuring in degrees is P4, g4.angles)
topic(3, "angles", "Fan Angles", "🪭", "What an angle is; right angles; bigger or smaller", r => {
  const t = r.int(0, 4);
  if (t === 0) { // three fans: longest arms ≠ biggest angle
    const ds = distinct(r, 3, 2, 15).map(x => x * 10), big = r.chance(.5), k = ds.indexOf(big ? Math.max(...ds) : Math.min(...ds)), ids = ["f1", "f2", "f3"], optPics = {}, word = big ? "biggest" : "smallest";
    const L = r.shuffle([34, 46, 58]), bad = L.indexOf(big ? 58 : 34); if (bad === k) { const j = (k + 1) % 3; [L[k], L[j]] = [L[j], L[k]]; } // the biggest angle never has the longest arms (the smallest never the shortest)
    ds.forEach((d, i) => { optPics[ids[i]] = svgFan(d, { rot: r.int(0, 25), l1: L[i], l2: L[i], small: true, fill: PASTEL[i] }); });
    return mcqWhy(r, `Which fan is open the ${word}? (which has the ${word} angle?)`, ids[k], `It is opened the ${big ? "widest" : "least"}: the angle is about the turn between the arms.`,
      ids.map((id, i) => [id, L[i] > L[k] ? "Its arms are longer, but long arms do not make a bigger angle. Look at how wide it opens." : "Look at how wide the fan opens, not at the length of its arms."]).filter((_, i) => i !== k),
      "An angle is how much the arms are turned apart. The length of the arms does not matter.", ["Compare how wide each fan opens, from one arm to the other."], { optPics, data: { angle: "compare", ds } }); }
  if (t === 1) { const d = r.pick([30, 40, 50, 60, 70, 90, 90, 110, 120, 140, 150]), w = d === 90 ? "a right angle" : d < 90 ? "smaller than a right angle" : "greater than a right angle";
    return mcqWhy(r, "Cinderella opens her fan. Is the angle a right angle, smaller than a right angle or greater than a right angle?", w,
      d === 90 ? "The arms meet like the corner of a square: a right angle." : d < 90 ? "It is narrower than the corner of a square." : "It opens wider than the corner of a square.",
      ["a right angle", "smaller than a right angle", "greater than a right angle"].filter(x => x !== w).map(x => [x, x === "a right angle" ? "A right angle fits exactly into the corner of a square or a page." : x.startsWith("smaller") ? "Smaller would be narrower than the corner of a page." : "Greater would open wider than the corner of a page."]),
      "Hold the corner of a page against the angle. Does it fit exactly, or is the angle narrower or wider?", [d === 90 ? "It fits the corner of the page exactly." : d < 90 ? "The page corner sticks out past the arm: smaller." : "The arm sticks out past the page corner: greater."],
      { pic: svgFan(d, { rot: r.pick([0, 10, 20, 30]) }), data: { angle: "vs90", d } }); }
  if (t === 2) { const h = r.pick([1, 2, 3, 4, 5, 7, 8, 9, 10, 11]), d = Math.min(h, 12 - h) * 30, w = d === 90 ? "a right angle" : d < 90 ? "smaller than a right angle" : "greater than a right angle";
    return mcqWhy(r, `At ${h} o'clock, the hands of the Clock Tower make an angle. What kind of angle is it?`, w, `At ${h} o'clock the hands are ${Math.min(h, 12 - h)} hour${Math.min(h, 12 - h) > 1 ? "s" : ""} apart; 3 hours apart is a right angle.`,
      ["a right angle", "smaller than a right angle", "greater than a right angle"].filter(x => x !== w).map(x => [x, "At 3 o'clock (or 9 o'clock) the hands make a right angle. Are these hands closer together or further apart?"]),
      "At 3 o'clock the hands make a right angle. Picture where the hands are.", [`The hands point to 12 and ${h}.`, w === "a right angle" ? "They make a right angle." : `They are ${d < 90 ? "closer than" : "further apart than"} at 3 o'clock.`],
      { pic: svgClock(h, 0), data: { angle: "clock", h } }); }
  if (t === 3) { const [a, b] = r.pick([[12, 3], [3, 6], [6, 9], [9, 12], [12, 6], [3, 9], [12, 9], [6, 3]]), k = ((b - a + 12) % 12) / 3;
    return numWhy(`The long hand of the clock turns clockwise from ${a} to ${b}. How many right angles does it turn?`, k, "From 12 to 3 is a quarter turn: 1 right angle.", [`Quarter turns: ${Array.from({ length: k }, (_, i) => (a + 3 * (i + 1) - 1) % 12 + 1).join(" → ")}`, `${k} right angle${k > 1 ? "s" : ""}`],
      [[4 - k, "It turns clockwise (the way clock hands move), not the other way."], [((b - a + 12) % 12), "Count right angles (quarter turns), not numbers on the clock."]], { data: { angle: "turn", a, b } }); }
  const ds = r.shuffle([90].concat(r.shuffle([40, 60, 120, 140]).slice(0, 2))), k = ds.indexOf(90), ids = ["f1", "f2", "f3"], optPics = {};
  ds.forEach((d, i) => { optPics[ids[i]] = svgFan(d, { rot: r.pick([0, 15, 30]), small: true, fill: PASTEL[i] }); });
  return mcqWhy(r, "Which fan shows a right angle?", ids[k], "It fits the corner of a square exactly.", ids.map((id, i) => [id, ds[i] < 90 ? "Narrower than the corner of a square: smaller than a right angle." : "Wider than the corner of a square: greater than a right angle."]).filter((_, i) => i !== k),
    "A right angle looks like the corner of a square or a book.", ["Find the one that fits the corner of a page exactly."], { optPics, data: { angle: "pick90", ds } });
});
/* ---------- 🚇 parallel and perpendicular lines (MOE P3 geometry: right angles, angles bigger or smaller than a right angle,
   perpendicular and parallel lines on a square grid) ----------
   Lines join dots on squared paper (a point is [x, y], 0–8 across, 0–6 down). Two directions are parallel when their cross
   product is 0 and perpendicular when their dot product is 0, so every answer is worked out from the drawn points. */
const RL = { W: 8, H: 6, S: 16, pad: 12 }; // the wide pad leaves room for corner letters
const RL_DIRS = [[1, 0], [0, 1], [1, 1], [1, -1], [2, 1], [1, 2], [2, -1], [1, -2]];
const vsub = (p, q) => [p[0] - q[0], p[1] - q[1]], vadd = (p, d, k = 1) => [p[0] + d[0] * k, p[1] + d[1] * k];
const vdot = (a, b) => a[0] * b[0] + a[1] * b[1], vcross = (a, b) => a[0] * b[1] - a[1] * b[0], rot90 = ([x, y]) => [-y, x];
const onPaper = ([x, y]) => x >= 0 && x <= RL.W && y >= 0 && y <= RL.H;
// a slanted pair is clearly slanted: between 25° and 65° apart (cos² between about 0.18 and 0.82), never nearly parallel or nearly square
const clearSlant = (d, e) => { const c2 = vdot(d, e) ** 2 / (vdot(d, d) * vdot(e, e)); return c2 > 0.18 && c2 < 0.82; };
const relate = (d, e) => vcross(d, e) === 0 ? "parallel" : vdot(d, e) === 0 ? "perpendicular" : "neither";
// do two segments touch or cross? (lattice points, exact integer test)
const orient = (a, b, c) => Math.sign(vcross(vsub(b, a), vsub(c, a)));
const onSeg = (a, b, c) => Math.min(a[0], b[0]) <= c[0] && c[0] <= Math.max(a[0], b[0]) && Math.min(a[1], b[1]) <= c[1] && c[1] <= Math.max(a[1], b[1]);
const touch = ([a, b], [c, d]) => { const o1 = orient(a, b, c), o2 = orient(a, b, d), o3 = orient(c, d, a), o4 = orient(c, d, b);
  if (o1 !== o2 && o3 !== o4) return true; return (!o1 && onSeg(a, b, c)) || (!o2 && onSeg(a, b, d)) || (!o3 && onSeg(c, d, a)) || (!o4 && onSeg(c, d, b)); };
const PX = v => RL.pad + v * RL.S;
const RIBBONS = ["#ff8fb3", "#7cc4f0", "#8fdcb0", "#b79cf2", "#f7c45c"];
const svgLines = (segs, o = {}) => { let g = "";
  segs.forEach(([p, q], i) => { const c = o.colors ? o.colors[i] : RIBBONS[i % RIBBONS.length];
    g += `<line class="rl" x1="${PX(p[0])}" y1="${PX(p[1])}" x2="${PX(q[0])}" y2="${PX(q[1])}" stroke="${c}" stroke-width="4.5" stroke-linecap="round"/>`
      + [p, q].map(([x, y]) => `<circle cx="${PX(x)}" cy="${PX(y)}" r="2.6" fill="#fff" stroke="${c}" stroke-width="1.6"/>`).join(""); });
  return gridSheet(RL.W, RL.H, RL.S, RL.pad, g, o.label || "lines on squared paper", o.small ? 1.1 : 1.7, "mpic symgrid rlpic"); };
// a lettered shape on squared paper; o.side = [i, j] draws that side as a thick ribbon
const svgShapeGrid = (pts, o = {}) => { const n = pts.length;
  let g = `<polygon class="rpoly" points="${pts.map(([x, y]) => PX(x) + "," + PX(y)).join(" ")}" fill="${o.fill || "#FFE3EE"}" stroke="${LINE}" stroke-width="2.2" stroke-linejoin="round"/>`;
  if (o.side) { const [p, q] = o.side.map(i => pts[i]); g += `<line class="rside" x1="${PX(p[0])}" y1="${PX(p[1])}" x2="${PX(q[0])}" y2="${PX(q[1])}" stroke="#ff6f91" stroke-width="4" stroke-linecap="round"/>`; }
  // each letter sits just outside its corner, along the corner's bisector (pointing out of the shape, also at a dent)
  const area = pts.reduce((a, p, i) => a + vcross(p, pts[(i + 1) % n]), 0), unit = ([x, y]) => { const L = Math.hypot(x, y) || 1; return [x / L, y / L]; };
  pts.forEach((v, i) => { const a = unit(vsub(pts[(i + n - 1) % n], v)), b = unit(vsub(pts[(i + 1) % n], v)), dent = Math.sign(vcross(vsub(v, pts[(i + n - 1) % n]), vsub(pts[(i + 1) % n], v))) !== Math.sign(area);
    let [dx, dy] = unit([a[0] + b[0], a[1] + b[1]]); if (!dent) { dx = -dx; dy = -dy; }
    g += `<text class="rlab" x="${(PX(v[0]) + 8 * dx).toFixed(1)}" y="${(PX(v[1]) + 8 * dy + 3.5).toFixed(1)}" font-size="10" text-anchor="middle" font-weight="900" fill="${INK}">${"ABCDEF"[i]}</text>`; });
  return gridSheet(RL.W, RL.H, RL.S, RL.pad, g, o.label || "a lettered shape on squared paper", 1.7, "mpic symgrid rlpic"); };
// a segment from p in direction d, k steps long, that stays on the paper
const seg = (r, d, k = r.int(1, 3)) => { for (let i = 0; i < 40; i++) { const p = [r.int(0, RL.W), r.int(0, RL.H)], q = vadd(p, d, k); if (onPaper(q)) return [p, q]; } return null; };
const pickDir = (r, ok = () => true) => r.pick(RL_DIRS.filter(ok));
// a pair of lines of one kind: parallel, perpendicular (they meet), or neither (meeting at a slant, or apart)
const linePair = (r, kind) => { for (let tries = 0; tries < 200; tries++) {
  const d = pickDir(r), s1 = seg(r, d, r.int(2, 4)); if (!s1) continue;
  if (kind === "parallel") { const s2 = seg(r, r.chance(.5) ? d : [-d[0], -d[1]], r.int(2, 4)); if (!s2 || touch(s1, s2) || vcross(d, vsub(s2[0], s1[0])) ** 2 < vdot(d, d)) continue; return [s1, s2]; } // never on one line, and at least a square apart
  const steps = Math.round(Math.max(Math.abs(s1[1][0] - s1[0][0]), Math.abs(s1[1][1] - s1[0][1])) / Math.max(Math.abs(d[0]), Math.abs(d[1]))), m = vadd(s1[0], d, r.int(0, steps));
  let e = kind === "perpendicular" ? rot90(d) : pickDir(r, x => clearSlant(d, x)); if (r.chance(.5)) e = [-e[0], -e[1]];
  const back = kind === "apart" ? 0 : r.int(0, 2), fwd = r.int(2, 3), a = vadd(m, e, -back), b = vadd(m, e, fwd);
  if (kind === "apart") { const a2 = vadd(a, e, 1), b2 = vadd(b, e, 1); if (!onPaper(a2) || !onPaper(b2) || touch(s1, [a2, b2])) continue; return [s1, [a2, b2]]; }
  if (!onPaper(a) || !onPaper(b)) continue; return [s1, [a, b]];
} return null; };
const dirOf = ([p, q]) => vsub(q, p);
const RL_WHO = [["Conductor Bun", "train track"], ["Fairy Pip", "ribbon"], ["Rapunzel", "rope"], ["the Gingerbread Baker", "icing line"], ["Jack", "kite string"], ["Sumi the star fairy", "star trail"]];
const RL_SHAPES = [ // [name, vertices] — every one is drawn on the grid, then moved and maybe flipped
  ["rectangle", [[0, 0], [5, 0], [5, 3], [0, 3]]], ["square", [[0, 0], [3, 0], [3, 3], [0, 3]]], ["tilted square", [[2, 0], [4, 2], [2, 4], [0, 2]]],
  ["tilted rectangle", [[2, 0], [5, 3], [3, 5], [0, 2]]], ["trapezium", [[0, 0], [6, 0], [4, 3], [1, 3]]], ["right-angled trapezium", [[0, 0], [5, 0], [3, 3], [0, 3]]],
  ["parallelogram", [[0, 0], [4, 0], [6, 3], [2, 3]]], ["kite shape", [[2, 0], [4, 1], [2, 5], [0, 1]]], ["house shape", [[0, 2], [2, 0], [4, 2], [4, 5], [0, 5]]],
  ["L-shape", [[0, 0], [2, 0], [2, 3], [5, 3], [5, 5], [0, 5]]], ["step shape", [[0, 0], [3, 0], [3, 2], [5, 2], [5, 4], [0, 4]]]
];
const RL_THINGS = ["flower bed in the fairy garden", "gingerbread cookie", "window in Rapunzel's tower", "picture frame in the castle", "sandpit at the dragon playground"];
const placeShape = (r, pts) => { const flip = r.chance(.5), P = pts.map(([x, y]) => flip ? [-x, y] : [x, y]), mx = Math.min(...P.map(p => p[0])), my = Math.min(...P.map(p => p[1]));
  const w = Math.max(...P.map(p => p[0])) - mx, h = Math.max(...P.map(p => p[1])) - my, ox = r.int(0, RL.W - w) - mx, oy = r.int(0, RL.H - h) - my; return P.map(([x, y]) => [x + ox, y + oy]); };
const sidesOf = pts => pts.map((p, i) => [i, (i + 1) % pts.length]);
const sideName = ([i, j]) => "ABCDEF"[i] + "ABCDEF"[j];
const sideDir = (pts, [i, j]) => vsub(pts[j], pts[i]);
// interior right angles: the corner turns the same way as the shape (not a dent) and its two sides are perpendicular
const rightCorners = pts => { const n = pts.length, area = pts.reduce((a, p, i) => a + vcross(p, pts[(i + 1) % n]), 0);
  return pts.map((v, i) => { const u = pts[(i + n - 1) % n], w = pts[(i + 1) % n]; return vdot(vsub(u, v), vsub(w, v)) === 0 && Math.sign(vcross(vsub(v, u), vsub(w, v))) === Math.sign(area); }); };
const CHECK = "Use the corner of a page (a right angle) as a checker. Perpendicular lines meet at a right angle; parallel lines go the same way and never meet, however long you make them.";
topic(3, "lines", "Train-Track Lines", "🚇", "Right angles, perpendicular and parallel lines", r => {
  const t = r.int(0, 6), [whoL, thing] = r.pick(RL_WHO), who = whoL[0].toUpperCase() + whoL.slice(1);
  if (t === 0) { // parallel, perpendicular or neither?
    const kind = r.pick(["parallel", "perpendicular", "parallel", "perpendicular", "neither", "apart"]), pair = linePair(r, kind); if (!pair) return topic3lines(r);
    const rel = relate(dirOf(pair[0]), dirOf(pair[1])), ans = rel === "parallel" ? "Parallel" : rel === "perpendicular" ? "Perpendicular" : "Neither";
    return mcq(r, `${who} drew these two ${thing}s on squared paper. Are they parallel, perpendicular or neither?`, ans, ["Parallel", "Perpendicular", "Neither"].filter(x => x !== ans), CHECK,
      rel === "parallel" ? ["Both lines go the same number of squares across for each square up or down.", "They go the same way and never meet, so they are parallel."]
        : rel === "perpendicular" ? ["Where the lines meet, put the corner of a page there: it fits exactly.", "They meet at a right angle, so they are perpendicular."]
          : ["The lines do not go the same way, so they are not parallel.", kind === "apart" ? "If you made them longer they would meet, but not at a right angle, so they are not perpendicular either." : "They meet, but the corner of a page does not fit the angle, so they are not perpendicular."],
      { pic: svgLines(pair), uid: "l0" + JSON.stringify(pair), data: { lines: "which", rel, segs: pair } });
  }
  if (t === 1 || t === 2) { // pick the picture with parallel / perpendicular lines
    const want = t === 1 ? "parallel" : "perpendicular", kinds = r.shuffle(["parallel", "perpendicular", "neither", "apart"].filter(k => k !== want)).slice(0, 2);
    const pairs = [linePair(r, want), ...kinds.map(k => linePair(r, k))]; if (pairs.some(p => !p)) return topic3lines(r);
    const ids = ["f1", "f2", "f3"], optPics = {}; pairs.forEach((p, i) => { optPics[ids[i]] = svgLines(p, { small: true }); });
    return mcq(r, `${who} drew three pairs of ${thing}s. In which picture are the two lines <b>${want}</b>?`, "f1", ["f2", "f3"], want === "parallel" ? "Parallel lines go the same way and never meet." : "Perpendicular lines meet at a right angle, like the corner of a page.",
      want === "parallel" ? ["In the right picture both lines slope the same way, so they would never meet.", "In the others the lines meet, or would meet if you made them longer."] : ["In the right picture the corner of a page fits exactly where the lines meet.", "In the others the lines never meet, or meet at a slant."],
      { optPics, uid: "l" + t + JSON.stringify(pairs), data: { lines: "pick", want, pairs } });
  }
  const [shape, base] = r.pick(RL_SHAPES), pts = placeShape(r, base), sides = sidesOf(pts), fill = r.pick(["#FFE3EE", "#E1F1FF", "#E3F7EA", "#EFE7FF", "#FFF3D1"]);
  if (t === 3 || t === 4) { // which side is parallel / perpendicular to the ribbon side?
    const want = t === 3 ? "parallel" : "perpendicular", cands = r.shuffle(sides.slice());
    for (const s of cands) {
      const others = sides.filter(x => x !== s), yes = others.filter(x => relate(sideDir(pts, s), sideDir(pts, x)) === want), no = others.filter(x => !yes.includes(x));
      if (!yes.length || no.length < 2) continue;
      const right = r.pick(yes);
      return mcq(r, `Look at this ${r.pick(RL_THINGS)} on squared paper. Which side is <b>${want}</b> to side ${sideName(s)} (the pink side)?`, sideName(right), r.shuffle(no).slice(0, 3).map(sideName),
        want === "parallel" ? "Find the side that goes the same way as the pink side, so they would never meet." : "Find the side that meets the pink side (or would meet it) at a right angle.",
        want === "parallel" ? [`Side ${sideName(right)} goes the same way as side ${sideName(s)}: they never meet.`, "So they are parallel."] : [`Side ${sideName(right)} and side ${sideName(s)} make a right angle: the corner of a page fits.`, "So they are perpendicular."],
        { pic: svgShapeGrid(pts, { side: s, fill }), uid: "l" + t + JSON.stringify(pts) + s, data: { lines: "side", want, pts, side: s } });
    }
    return topic3lines(r);
  }
  if (t === 5) { // how many right angles inside the shape?
    const n = rightCorners(pts).filter(Boolean).length;
    return num(`How many right angles are there inside this shape?`, n, "Check every corner with the corner of a page. Only corners where it fits exactly are right angles.",
      [n ? `${n} corner${n > 1 ? "s are" : " is"} exactly like the corner of a page.` : "No corner fits the corner of a page exactly.", `So the shape has ${n} right angle${n === 1 ? "" : "s"}.`],
      { pic: svgShapeGrid(pts, { fill }), uid: "l5" + JSON.stringify(pts), data: { lines: "right", pts, n } });
  }
  // t === 6: is the angle a right angle, smaller or bigger?
  for (let i = 0; i < 60; i++) {
    const d1 = pickDir(r), d2 = r.chance(.3) ? rot90(d1) : pickDir(r, x => clearSlant(x, d1)), e2 = r.chance(.5) ? d2 : [-d2[0], -d2[1]], v = [r.int(2, 6), r.int(2, 4)], k1 = r.int(1, 2), k2 = r.int(1, 2);
    const a = vadd(v, d1, k1), b = vadd(v, e2, k2); if (!onPaper(a) || !onPaper(b)) continue;
    const dt = vdot(d1, e2), ans = dt === 0 ? "A right angle" : dt > 0 ? "Smaller than a right angle" : "Bigger than a right angle";
    return mcq(r, `${who}'s fan opens to the angle between these two lines. What kind of angle is it?`, ans, ["A right angle", "Smaller than a right angle", "Bigger than a right angle"].filter(x => x !== ans),
      "Put the corner of a page into the angle. Does it fit exactly, leave a gap, or not fit inside?",
      [dt === 0 ? "The corner of a page fits exactly." : dt > 0 ? "The angle is narrower than the corner of a page, so the page does not fit inside." : "The angle is wider than the corner of a page: there is a gap left over.", `It is ${ans.toLowerCase()}.`],
      { pic: svgLines([[v, a], [v, b]], { colors: ["#ff8fb3", "#ff8fb3"] }), uid: "l6" + JSON.stringify([v, a, b]), data: { lines: "angle", v, a, b, dt } });
  }
  return topic3lines(r);
});
const topic3lines = r => M.topic("g3.lines").gen(r);
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
// 🗺️ MOE P4 area and perimeter: find one side of a rectangle from its area or perimeter, a square's side from its area or
// perimeter, and the area and perimeter of composite figures made of rectangles (area of a rectangle itself is P3: g3.area)
// an L-shaped garden: a W × H rectangle with a cw × ch corner cut from the top right; lab = which side lengths to print
const svgLshape = (W, H, cw, ch, lab, u, fill) => { const k = Math.min(200 / W, 120 / H), ox = 46, oy = 22, X = v => +(ox + v * k).toFixed(1), Y = v => +(oy + v * k).toFixed(1), w = Math.round(ox * 2 + W * k), h = Math.round(oy * 2 + H * k);
  const pts = [[0, 0], [W - cw, 0], [W - cw, ch], [W, ch], [W, H], [0, H]].map(([x, y]) => `${X(x)},${Y(y)}`).join(" "), t = (x, y, s, a = "middle") => `<text x="${x}" y="${y}" font-size="11" font-weight="900" text-anchor="${a}" fill="${INK}">${s}</text>`;
  const L = { bottom: t(X(W / 2), Y(H) + 15, `${W} ${u}`), left: t(X(0) - 5, Y(H / 2) + 4, `${H} ${u}`, "end"), top: t(X((W - cw) / 2), Y(0) - 6, `${W - cw} ${u}`), cutV: t(X(W - cw) + 5, Y(ch / 2) + 4, `${ch} ${u}`, "start"),
    cutH: t(X(W - cw / 2), Y(ch) - 6, `${cw} ${u}`), right: t(X(W) + 5, Y((ch + H) / 2) + 4, `${H - ch} ${u}`, "start") };
  return svgBox(`<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="12" fill="#FFFDF8" stroke="#F1E3F7" stroke-width="2"/><polygon class="lfig" points="${pts}" fill="${fill}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>${lab.map(s => L[s]).join("")}`,
    "an L-shaped figure made of two rectangles", w, h, `0 0 ${w} ${h}`, "mpic chart lpic"); };
topic(4, "area", "Area of the Kingdom", "🗺️", "Find a side; area and perimeter of composite figures", r => {
  const t = r.int(0, 4), u = r.pick(["m", "cm"]), fill = r.pick(PASTEL);
  if (t === 0) { const W = r.int(6, 14), H = r.int(5, 10), cw = r.int(2, W - 3), ch = r.int(2, H - 2), A = W * H - cw * ch;
    return numWhy(`The Queen's garden is made of rectangles. What is its area? (in ${u}²)`, A, "Split the shape into two rectangles, or take the missing corner away from the big rectangle.",
      [`Big rectangle: ${W} × ${H} = ${W * H} ${u}²`, `Missing corner: ${cw} × ${ch} = ${cw * ch} ${u}²`, `${W * H} − ${cw * ch} = ${A} ${u}²`],
      [[W * H, `${W * H} ${u}² is the whole big rectangle. Take away the missing corner (${cw} × ${ch}).`], [2 * (W + H), "That is the perimeter (the distance around). Area is the space inside."], [W * H + cw * ch, "Take the missing corner away; don't add it."]],
      { pic: svgLshape(W, H, cw, ch, ["bottom", "left", "top", "cutV", "cutH", "right"], u, fill), data: { comp: "area", W, H, cw, ch } }); }
  if (t === 1) { const W = r.int(6, 14), H = r.int(5, 10), cw = r.int(2, W - 3), ch = r.int(2, H - 2), P = 2 * (W + H);
    return numWhy(`How much fence goes all around the Queen's garden? (perimeter, in ${u})`, P, "Find the missing side lengths first. Then add all six sides.",
      [`Across the step: ${W} − ${W - cw} = ${cw} ${u}; right side: ${H} − ${ch} = ${H - ch} ${u}`, `${W} + ${H} + ${W - cw} + ${ch} + ${cw} + ${H - ch} = ${P} ${u}`],
      [[W + H + (W - cw) + ch, "Add all six sides, including the two you had to work out."], [W * H - cw * ch, "That is the area. Perimeter is the distance around the edge."], [P - 2 * ch, `Don't forget the step down of ${ch} ${u} — it is part of the fence.`]],
      { pic: svgLshape(W, H, cw, ch, ["bottom", "left", "top", "cutV"], u, fill), data: { comp: "perim", W, H, cw, ch } }); }
  const l = r.int(4, 20), w = r.int(2, Math.min(15, l)), s = r.int(3, 12);
  if (t === 2) return numWhy(`A rectangle has an area of ${l * w} ${u}². Its length is ${l} ${u}. What is its breadth? (in ${u})`, w, "Breadth = area ÷ length.", [`${l} × ? = ${l * w}`, `${l * w} ÷ ${l} = ${w} ${u}`],
    [[l * w - l, "Area is length × breadth, so divide; don't take away."], [l * w * l, "Divide the area by the length; don't multiply."]], { viz: { type: "grid", l, w, u, wq: 1, noGrid: 1, note: `area = ${l * w} ${u}²`, tip: `How many rows of ${l} make ${l * w}?` } });
  if (t === 3) { const perimFirst = r.chance(.5);
    if (perimFirst) return numWhy(`A square tile has a perimeter of ${4 * s} cm. What is its area? (in cm²)`, s * s, "First find one side: perimeter ÷ 4.", [`Side = ${4 * s} ÷ 4 = ${s} cm`, `Area = ${s} × ${s} = ${s * s} cm²`],
      [[s, `${s} cm is one side. The question asks for the area: ${s} × ${s}.`], [(2 * s) ** 2, "Divide the perimeter by 4 (a square has 4 equal sides), not by 2."]], { data: { sq: "p2a", s } });
    return numWhy(`A square fairy rug has an area of ${s * s} m². How long is one side? (in m)`, s, "Which number times itself makes the area?", [`${s} × ${s} = ${s * s}`, `So each side is ${s} m.`],
      [[s * s / 4, "A square's area is side × side; don't divide by 4 (that's for the perimeter)."], [s * s / 2, "Find the number that times itself makes the area."]], { data: { sq: "a2s", s } }); }
  const P = 2 * (l + w);
  return numWhy(`A rectangular dragon pen has a perimeter of ${P} m. Its length is ${l} m. What is its breadth? (in m)`, w, "Length + breadth is half the perimeter.", [`Half of ${P} = ${P / 2} m`, `${P / 2} − ${l} = ${w} m`],
    [[P - l, "The perimeter goes around both lengths and both breadths. Halve it first."], [P - 2 * l, "You took away both lengths: that leaves both breadths. Halve it."]], { data: { rect: "p2w", l, w } });
});
// 🧭 MOE P4 angles: name angles with notation such as ∠ABC, and measure angles in degrees with a protractor
// a protractor (outer scale 0 on the right, inner scale 0 on the left) with one arm on the base line and one at the angle
const svgProtractor = (x, left) => { const W = 304, H = 180, cx = 152, cy = 160, R = 140, rad = d => d * Math.PI / 180, P = (d, rr) => [+(cx + rr * Math.cos(rad(d))).toFixed(1), +(cy - rr * Math.sin(rad(d))).toFixed(1)];
  let g = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="#FFFDF8" stroke="#F1E3F7" stroke-width="2"/><path d="M${cx - R},${cy} A${R},${R} 0 0,1 ${cx + R},${cy} Z" fill="#E1F1FF" fill-opacity=".75" stroke="${LINE}" stroke-width="1.6"/>`;
  for (let d = 0; d <= 180; d += 5) { const [a, b] = P(d, R), [c, e] = P(d, R - (d % 10 ? 5 : 9)); g += `<line x1="${a}" y1="${b}" x2="${c}" y2="${e}" stroke="${INK}" stroke-width="${d % 10 ? .8 : 1.3}"/>`; }
  for (let d = 0; d <= 180; d += 10) { const [a, b] = P(d, R - 19), [c, e] = P(d, R - 36);
    const lift = d % 180 ? 3 : -5; // keep 0 and 180 above the base line
    g += `<text class="pout" data-v="${d}" x="${a}" y="${b + lift}" font-size="10" text-anchor="middle" font-weight="800" fill="${INK}">${d}</text><text class="pin" data-v="${180 - d}" x="${c}" y="${e + lift}" font-size="8.5" text-anchor="middle" font-weight="700" fill="#b0739c">${180 - d}</text>`; }
  const a0 = left ? 180 : 0, a1 = left ? 180 - x : x, [p, q] = P(a0, R + 6), [s, t] = P(a1, R + 6), [u, v] = P(a0, 30), [m, n] = P(a1, 30);
  g += `<path d="M${cx},${cy} L${u},${v} A30,30 0 ${x > 180 ? 1 : 0},${left ? 1 : 0} ${m},${n} Z" fill="#FFC9DA" stroke="${LINE}" stroke-width="1.2"/>`
    + `<line x1="${cx}" y1="${cy}" x2="${p}" y2="${q}" stroke="#ff6f91" stroke-width="3" stroke-linecap="round"/><line class="parm" data-a="${a1}" x1="${cx}" y1="${cy}" x2="${s}" y2="${t}" stroke="#ff6f91" stroke-width="3" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="3.5" fill="${INK}"/>`;
  return svgBox(g, `an angle on a protractor`, W, H, `0 0 ${W} ${H}`, "mpic chart protpic"); };
// a triangle (or a corner) with lettered vertices; mark = index of the vertex whose angle is shaded
const svgNamed = (pts, names, mark) => { const W = 220, H = 150, c = pts[mark], [a, b] = [pts[(mark + 1) % 3], pts[(mark + 2) % 3]], ang = ([x, y]) => Math.atan2(y - c[1], x - c[0]), r0 = 20;
  let a0 = ang(a), a1 = ang(b), dlt = a1 - a0; while (dlt <= -Math.PI) dlt += 2 * Math.PI; while (dlt > Math.PI) dlt -= 2 * Math.PI;
  const A = [c[0] + r0 * Math.cos(a0), c[1] + r0 * Math.sin(a0)].map(v => v.toFixed(1)), B = [c[0] + r0 * Math.cos(a0 + dlt), c[1] + r0 * Math.sin(a0 + dlt)].map(v => v.toFixed(1)), cen = [(pts[0][0] + pts[1][0] + pts[2][0]) / 3, (pts[0][1] + pts[1][1] + pts[2][1]) / 3];
  const lab = pts.map(([x, y], i) => { const dx = x - cen[0], dy = y - cen[1], L = Math.hypot(dx, dy) || 1; return `<text x="${(x + dx / L * 14).toFixed(1)}" y="${(y + dy / L * 14 + 5).toFixed(1)}" font-size="14" text-anchor="middle" font-weight="900" fill="${INK}">${names[i]}</text>`; }).join("");
  return svgBox(`<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="#FFFDF8" stroke="#F1E3F7" stroke-width="2"/><path d="M${c[0]},${c[1]} L${A.join(",")} A${r0},${r0} 0 0,${dlt > 0 ? 1 : 0} ${B.join(",")} Z" fill="#FFC9DA" stroke="${LINE}" stroke-width="1.2"/><polygon points="${pts.map(p => p.join(",")).join(" ")}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>${lab}`,
    "a triangle with lettered corners and one angle shaded", W, H, `0 0 ${W} ${H}`, "mpic chart namedpic"); };
const TRI_PTS = [[[30, 120], [190, 120], [120, 30]], [[40, 30], [190, 110], [50, 125]], [[110, 22], [190, 125], [28, 100]], [[30, 60], [150, 22], [180, 128]]];
const LETTER_SETS = ["ABC", "PQR", "XYZ", "DEF", "KLM", "STU"];
topic(4, "angles", "Protractor Magic", "🧭", "Name angles like ∠ABC and measure them in degrees", r => {
  const t = r.int(0, 3);
  if (t === 0) { const x = r.chance(.75) ? r.int(2, 16) * 10 : r.int(3, 33) * 5, left = r.chance(.5);
    if (x === 90) return M.topic("g4.angles").gen(r);
    return numWhy(`Fairy Pip measures the angle with a protractor. How big is the angle? (in °)`, x, `Start from the 0 on the arm that lies along the base line${left ? " (on the left, so use the inside numbers)" : " (on the right, so use the outside numbers)"}, then count up to the other arm.`,
      [`The base arm is on the ${left ? "left" : "right"}: read the ${left ? "inside" : "outside"} scale, which starts at 0 there.`, `The other arm points to ${x}.`, `The angle is ${x}°.`],
      [[180 - x, `You read the other scale. Start from the 0 where the ${left ? "left" : "right"} arm lies. ${x < 90 ? "The angle is smaller than a right angle, so it must be less than 90°." : "The angle is bigger than a right angle, so it must be more than 90°."}`]],
      { pic: svgProtractor(x, left), data: { prot: x, left } }); }
  if (t === 1) { const k = r.int(0, TRI_PTS.length - 1), pts = TRI_PTS[k], names = r.pick(LETTER_SETS).split(""), m = r.int(0, 2), a = names[(m + 1) % 3], b = names[(m + 2) % 3], v = names[m], right = `∠${a}${v}${b}`;
    return mcqWhy(r, "Which angle is shaded pink?", right, `The corner letter ${v} goes in the middle: ∠${a}${v}${b} (∠${b}${v}${a} names the same angle).`,
      [[`∠${v}${a}${b}`, `The middle letter must be the corner of the angle, ${v}. ∠${v}${a}${b} is the angle at ${a}.`], [`∠${a}${b}${v}`, `That is the angle at ${b}. The shaded corner is ${v}.`], [`∠${v}${b}${a}`, `That is the angle at ${b}. Put the corner letter ${v} in the middle.`]],
      "In ∠ABC the middle letter, B, is the corner where the two arms meet.", [`The shaded corner is ${v}.`, `The arms go to ${a} and ${b}.`, `So it is ${right}.`], { pic: svgNamed(pts, names, m), data: { named: right } }); }
  if (t === 2) { const tt = r.pick([["a quarter turn", 90], ["a half turn", 180], ["a three-quarter turn", 270], ["a full turn", 360], ["two right angles", 180], ["three right angles", 270]]);
    return numWhy(`How many degrees are there in ${tt[0]}?`, tt[1], "A right angle (a quarter turn) is 90°.", [`${tt[0]} = ${tt[1]}°`],
      [[tt[1] / 90, "Count in degrees: each right angle is 90°."], [tt[1] === 360 ? 100 : tt[1] / 90 * 100, "A right angle is 90°, not 100°."]], { data: { turn: tt[1] } }); }
  const x = r.pick([20, 30, 40, 50, 60, 70, 110, 120, 130, 140, 150, 160]), opts = [x, 180 - x, 90].map(v => v + "°");
  return mcqWhy(r, "Estimate: about how big is this angle?", opts[0], x < 90 ? "It is smaller than a right angle, so it is less than 90°." : "It is bigger than a right angle, so it is more than 90°.",
    [[opts[1], x < 90 ? `${180 - x}° is more than a right angle, but this angle is smaller than the corner of a page.` : `${180 - x}° is less than a right angle, but this angle opens wider than the corner of a page.`], [opts[2], "90° is a right angle, like the corner of a page. This one is not a right angle."]],
    "First compare with a right angle (90°): smaller or bigger?", [x < 90 ? "Smaller than a right angle → less than 90°" : "Bigger than a right angle → more than 90°", `About ${x}°`], { pic: svgFan(x, { rot: r.pick([0, 10, 20]) }), data: { est: x } });
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
  let g = "";
  for (const c of cells) { const [x, y] = xy(c); g += gridCell(x, y, S, pad, o.fill || "#FFB8D1", "syc"); }
  const m = pad + 4 * S; g += across ? `<line class="mline" x1="${pad - 3}" y1="${m}" x2="${pad + W * S + 3}" y2="${m}" stroke="#ff6f91" stroke-width="2.5" stroke-dasharray="5 4" stroke-linecap="round"/>`
    : `<line class="mline" x1="${m}" y1="${pad - 3}" x2="${m}" y2="${pad + H * S + 3}" stroke="#ff6f91" stroke-width="2.5" stroke-dasharray="5 4" stroke-linecap="round"/>`;
  return gridSheet(W, H, S, pad, g, o.label || "figure on a square grid with a dashed line", o.small ? 1.15 : 1.7, "mpic symgrid");
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
/* ---------- ✂️ nets of solids (MOE P4 geometry, moved from Grade 6; the id stays g6.nets: identify the nets of a cube, cuboid, prism and pyramid, and the solid a net makes) ----------
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
const netsAgain = r => M.topic("g6.nets").gen(r); // draw again when a random net leaves too few choices
topic(4, "nets", "Snip & Fold Nets", "✂️", "Nets of cubes, cuboids, prisms and pyramids", r => {
  const t = r.int(0, 5), [who0, what] = r.pick(NET_WHO), who = cap1(who0), fill = r.pick(PASTEL.slice(0, 4)), opt = (c, x) => svgNet(c, Object.assign({ fill, small: true }, x));
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
    if (chosen.length < 3) return netsAgain(r);
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
}, { id: "g6.nets", was: 6 });
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
/* ---------- 🪁 EXTRA (enrichment, not in the MOE 2021 primary syllabus): the 8-point compass and turns in 45° steps ----------
   A 3 × 3 fairy map: one landmark in the middle and eight around it, so every direction between two places is one of the 8 points. */
const DIR8 = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"], D8 = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const D8XY = [[1, 0], [2, 0], [2, 1], [2, 2], [1, 2], [0, 2], [0, 1], [0, 0]]; // map cell of each direction from the middle [1, 1]
const PLACES = [["castle", "🏰"], ["well", "🪣"], ["tower", "🗼"], ["cottage", "🍄"], ["bakery", "🧁"], ["pond", "🦆"], ["windmill", "🌻"], ["library", "📚"], ["fountain", "⛲"], ["bridge", "🌉"], ["tent", "⛺"], ["beehive", "🐝"]];
const svgCompassMap = (marks, o = {}) => { const S = 64, ox = 46, oy = 30, W = ox + 3 * S + 14, H = oy + 3 * S + 12;
  let g = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="#FFFDF8" stroke="#F1E3F7" stroke-width="2"/><rect x="${ox}" y="${oy}" width="${3 * S}" height="${3 * S}" rx="10" fill="#EEF9EA" stroke="${LINE}" stroke-width="1.4"/>`;
  for (let i = 1; i < 3; i++) g += `<line x1="${ox + i * S}" y1="${oy}" x2="${ox + i * S}" y2="${oy + 3 * S}" stroke="#D6EBD0" stroke-dasharray="3 3"/><line x1="${ox}" y1="${oy + i * S}" x2="${ox + 3 * S}" y2="${oy + i * S}" stroke="#D6EBD0" stroke-dasharray="3 3"/>`;
  // a small compass rose in the corner: only N is written (children work the others out)
  g += `<g transform="translate(22,${oy + 22})"><circle r="16" fill="#FFF1C9" stroke="${INK}" stroke-width="1.4"/><path d="M0,-14 L4,0 L0,14 L-4,0 Z" fill="#FFB8D1" stroke="${INK}" stroke-width="1"/><path d="M-14,0 L0,-3 L14,0 L0,3 Z" fill="#BDE7FF" stroke="${INK}" stroke-width="1"/><text y="-19" font-size="11" text-anchor="middle" font-weight="900" fill="${INK}">N</text></g>`;
  for (const m of marks) { const [x, y] = m.at, cx = ox + x * S + S / 2, cy = oy + y * S + S / 2;
    g += `<text class="cmark" data-name="${esc(m.name)}" data-x="${x}" data-y="${y}" x="${cx}" y="${cy + 6}" font-size="26" text-anchor="middle">${m.e}</text><text x="${cx}" y="${cy + 24}" font-size="9.5" text-anchor="middle" font-weight="900" fill="${INK}">${esc(m.name)}</text>`;
    if (m.you) g += `<circle cx="${cx}" cy="${cy}" r="27" fill="none" stroke="#ff6f91" stroke-width="2.4" stroke-dasharray="5 4"/>`; }
  return svgBox(g, "a fairy map with a compass", W, H, `0 0 ${W} ${H}`, "mpic chart compasspic"); };
topic(4, "compass", "Compass Quest", "🪁", "Enrichment, not core syllabus: 8 compass directions and turns", r => {
  const t = r.int(0, 3);
  if (t === 0 || t === 1) { // the map: direction of one place from another
    const pl = r.shuffle(PLACES).slice(0, 9), k = r.int(0, 7), marks = pl.map((p, i) => ({ name: p[0], e: p[1], at: i < 8 ? D8XY[i] : [1, 1] }));
    if (t === 1) { // between two outside places in a straight line through the middle, or next to each other
      const a = r.int(0, 7), b = (a + r.pick([1, 2, 4, 6, 7])) % 8, [ax, ay] = D8XY[a], [bx, by] = D8XY[b], dx = Math.sign(bx - ax), dy = Math.sign(by - ay);
      const dir = D8XY.findIndex(([x, y]) => x - 1 === dx && y - 1 === dy); marks[a].you = true;
      return mcqWhy(r, `On the fairy map, which direction is the ${pl[b][0]} from the ${pl[a][0]}?`, DIR8[dir], `From the ${pl[a][0]}, the ${pl[b][0]} lies ${DIR8[dir]}.`,
        [[DIR8[(dir + 4) % 8], `That is the way from the ${pl[b][0]} back to the ${pl[a][0]} — start at the ${pl[a][0]} (circled).`], [DIR8[(dir + 1) % 8], "Close, but turn back one step: check up/down and left/right separately."], [DIR8[(dir + 7) % 8], "Close, but one step the other way: check up/down and left/right separately."]],
        "North is up the map. Start at the circled place and look towards the other one.", [`From the ${pl[a][0]}, go ${dy < 0 ? "up (north)" : dy > 0 ? "down (south)" : "neither up nor down"} and ${dx > 0 ? "right (east)" : dx < 0 ? "left (west)" : "neither left nor right"}.`, `That is ${DIR8[dir]}.`],
        { pic: svgCompassMap(marks), data: { compass: "map2", dir } }); }
    marks[8].you = true;
    return mcqWhy(r, `Pip stands at the ${pl[8][0]} in the middle of the map. Which direction is the ${pl[k][0]}?`, DIR8[k], `North is up, so the ${pl[k][0]} is ${DIR8[k]} of the ${pl[8][0]}.`,
      [[DIR8[(k + 4) % 8], "That is the opposite direction."], [DIR8[(k + 1) % 8], "One step too far round clockwise."], [DIR8[(k + 7) % 8], "One step too far round anticlockwise."], [DIR8[(k + 2) % 8], "That is a quarter turn away."]],
      "North is up the map, east is to the right. Corners are north-east, south-east, south-west and north-west.", [`The ${pl[k][0]} is ${D8XY[k][1] === 0 ? "up" : D8XY[k][1] === 2 ? "down" : "level"}${D8XY[k][0] === 2 ? " and right" : D8XY[k][0] === 0 ? " and left" : ""}.`, `So it is ${DIR8[k]}.`],
      { pic: svgCompassMap(marks), data: { compass: "map", dir: k } }); }
  if (t === 2) { const s = r.int(0, 7), n = r.pick([1, 2, 3, 4, 6]), cw = r.chance(.5), e = (s + (cw ? n : 8 - n)) % 8, wrongWay = (s + (cw ? 8 - n : n)) % 8, deg = n * 45;
    const say = r.chance(.5) ? `${deg}°` : { 1: "an eighth of a turn", 2: "a quarter turn", 3: "three eighths of a turn", 4: "a half turn", 6: "three quarters of a turn" }[n];
    return mcqWhy(r, `The Snow Queen faces ${DIR8[s]}. She turns ${say} ${cw ? "clockwise" : "anticlockwise"}. Which way does she face now?`, DIR8[e], `Each 45° (an eighth of a turn) is one step on the 8-point compass: ${n} step${n > 1 ? "s" : ""} ${cw ? "clockwise" : "anticlockwise"} from ${DIR8[s]}.`,
      [[DIR8[wrongWay], `You turned the other way. ${cw ? "Clockwise goes N → NE → E" : "Anticlockwise goes N → NW → W"}.`], [DIR8[(e + 1) % 8], "Count the 45° steps again."], [DIR8[(e + 7) % 8], "Count the 45° steps again."]],
      "On the 8-point compass, each step is 45°. Clockwise: N, NE, E, SE, S, SW, W, NW.", [`${say} = ${n} step${n > 1 ? "s" : ""} of 45°`, `${D8[s]} → ${Array.from({ length: n }, (_, i) => D8[(s + (cw ? i + 1 : 8 - i - 1) ) % 8]).join(" → ")}`], { data: { compass: "turn", s, n, cw } }); }
  const a = r.int(0, 7), n = r.int(1, 4), b = (a + n) % 8, ang = n * 45;
  return numWhy(`What is the smaller angle between ${DIR8[a]} and ${DIR8[b]}? (in °)`, ang, "Count the compass steps between them; each step is 45°.", [`${D8[a]} to ${D8[b]} is ${n} step${n > 1 ? "s" : ""}.`, `${n} × 45° = ${ang}°`],
    [[360 - ang, "That is the bigger angle, the long way round. Count the shorter way."], [n * 90, "Each step on the 8-point compass is 45°, not 90°."], [n, "Count the steps in degrees: each step is 45°."]], { data: { compass: "angle", a, n } });
}, { extra: true });
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
/* 🥧 pie charts: reading pie charts is MOE P4 (shares in simple fractions, g4.piechart, moved from Grade 6 with id g6.piechart);
   the percentage version is asked in Grade 5 Percent Potions through M.pieQ(r, true) */
const PIES = [
  { about: n => `how ${n} pupils travel to school`, title: "How we get to school", kind: "way", verb: "travel by", cats: [["Bus", "🚌"], ["Walking", "🚶"], ["Car", "🚗"], ["Bicycle", "🚲"], ["MRT", "🚇"]] },
  { about: n => `the favourite snacks of ${n} pupils`, title: "Our favourite snacks", kind: "snack", verb: "chose", cats: [["Fruit", "🍉"], ["Popcorn", "🍿"], ["Cookies", "🍪"], ["Yoghurt", "🥛"], ["Crackers", "🥨"]] },
  { about: n => n === "some" ? "the books in the class library" : `the ${n} books in the class library`, title: "Books in our class library", kind: "kind of book", verb: "are", unit: "books", cats: [["Stories", "📖"], ["Comics", "💬"], ["Science", "🔬"], ["Poems", "🎶"], ["Atlases", "🗺️"]] },
  { about: n => `the CCAs chosen by ${n} pupils`, title: "Our CCA choices", kind: "CCA", verb: "chose", cats: [["Robotics", "🤖"], ["Choir", "🎤"], ["Art club", "🎨"], ["Swimming", "🏊"], ["Scouts", "⛺"]] }
];
const pieParts = (r, n, whole) => { for (;;) { const cut = r.shuffle(Array.from({ length: whole - 1 }, (_, i) => i + 1)).slice(0, n - 1).sort((a, b) => a - b), p = [0, ...cut, whole].slice(1).map((x, i, a) => x - (i ? a[i - 1] : 0));
  if (new Set(p).size === n) return p; } };
const pieQ = (r, pct) => {
  const th = r.pick(PIES), whole = pct ? r.pick([10, 20]) : r.pick([6, 8, 12]), n = whole >= 10 ? r.int(3, 4) : 3, parts = pieParts(r, n, whole);
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
};
M.pieQ = pieQ;
topic(4, "piechart", "Pie Chart Picnic", "🥧", "Read pie charts with fractions", r => pieQ(r, false), { id: "g6.piechart", was: 6 });
topic(4, "story", "Fairytale Problems", "📜", "Multi-step word problems", r => {
  if (r.chance(.5)) { const p = r.int(15, 60), n = r.int(12, 35), paid = Math.ceil(p * n / 100) * 100 + r.pick([0, 100]); return num(`Aladdin buys ${n} lamps at $${p} each. He pays with $${paid}. How much change does he get in $?`, paid - p * n, "Find the total cost first, then subtract from what he paid.", [`${n} × ${p} = $${p * n}`, `${paid} − ${p * n} = $${paid - p * n}`], { viz: { type: "bar", tip: "What he paid = the cost of the lamps + his change.", rows: [{ name: "paid", parts: [{ v: p * n, t: `${n} × $${p}` }, { v: paid - p * n, t: "?", rt: `$${paid - p * n}`, q: 1 }], braces: [{ from: 0, to: paid, t: `$${paid}` }] }] } }); }
  const d = r.int(3, 9), per = r.int(25, 120); return num(`The giant's beanstalk grows ${per} cm each day. How many metres does it grow in ${d * 4} days? (1 m = 100 cm)`, per * d * 4 / 100, "Multiply, then change cm into m.", [`${per} × ${d * 4} = ${per * d * 4} cm`, `${per * d * 4} ÷ 100 = ${fmt(per * d * 4 / 100)} m`], { keys: ["."] });
}, { story: true });
})();
