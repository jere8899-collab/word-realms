# Research: maths topic levels vs MOE syllabuses (Task 1 fact check)

Sources read on 2026-11-04 (PDFs fetched and read with poppler `pdftotext -layout`):
- **P**: MOE *2021 Primary Mathematics Syllabus P1–P6, updated October 2025* (standard; P5/P6 Foundation also read).
  Note in the PDF: "In 2025 the 2021 syllabus applies to P1–P5 only … applicable to Primary 6 from 2026 onwards." So in 2026 it covers P1–P6.
- **S**: MOE *2020 G2 and G3 Mathematics Syllabuses (Secondary One to Four)*; content by level read for G3 (Sec 1, Sec 2, Sec 3/4).
- JC (H1/H2) syllabus was **not** fetched (no link in the brief); Grades 11–12 were judged from topic names only.

Code read: `js/math-gen.js` (registry `topic()` → id `g<grade>.<key>`, `M.gradeTopics` = filter by `t.grade`), `js/math-topics-p.js`,
`js/math-topics-m.js`, `js/math-topics-h.js`, `js/math-goals.js`, `js/math.js`, `js/report.js`, `js/learn.js`, `data/lessons/*.json`.

## A. The brief's table, checked against code and syllabus

| Brief claim | Code today (4 Nov, before change) | Syllabus check | Verdict |
|---|---|---|---|
| Nets P4, game G6 | `topic(6,"nets")` js/math-topics-m.js:228 (brief gave no line) | P4 Geometry 4. Nets 4.1–4.4 (cube, cuboid, prism, pyramid; solid from net) | ✅ correct |
| Pie charts P4, game G6 | `topic(6,"piechart")` m.js:284, fractions **and percentages** | P4 Statistics 1.2 "reading and interpreting data from tables/line graphs/pie charts". Not in P6 standard (only P6 Foundation). Percentages are P5 | ✅ correct; percentage pies are P5-level |
| Area of rectangle/square P3, game G4 | `topic(4,"area")` p.js:402 (line ✅); its t0 = area of a rectangle (P3), t1 = width from area (P4 1.1), t2 = square from perimeter (P4 1.2) | P3 Area and Volume 1.1–1.4; P4 1.1–1.3 (one side, composite) | ✅ correct; G4 topic is a P3/P4 mix and has **no composite figures** |
| Angle concept, right angles P3, game G4 | `topic(4,"angles")` p.js:408 (line ✅): degrees in turns + compass turning. **But** `g3.lines` (p.js:298) already teaches right angles and "greater/smaller than a right angle" | P3 Geometry 1.1–1.2; P4 1.1–1.3 (∠ABC notation, measuring in degrees, drawing). **Compass/8-point directions are not in the 2021 syllabus at all** | ⚠️ partly already fixed (right angles already in G3 via Train-Track Lines); G4 topic never measures with a protractor |
| Ratio P6, game G5 | `topic(5,"ratio")` m.js:22 (line ✅) | P6 Ratio 1.1–1.7 | ✅ correct |
| Average P6, game G5 | `topic(5,"average")` m.js:101 (line ✅) | P6 Data Analysis 1.1–1.2 | ✅ correct |
| Speed not primary, G6 | `topic(6,"speed")` m.js:148 (line ✅) | No speed in P1–P6 (standard or Foundation). Secondary G3 **Sec 1** N4 "Rate and Speed" (4.1–4.3, incl. km/h → m/s). Rate stays P5 | ✅ correct → Sec 1 (Grade 7) |
| No P1 length / P2 length-mass-volume / P2 3D shapes | none found (g3.measure is P3 compound units) | P1 Measurement 1 (cm); P2 Measurement 1 (m, kg/g, ℓ, compare/order); P2 Geometry 2 (cube, cuboid, cone, cylinder, sphere) | ✅ correct |
| "127 topics" | 43 (p) + 42 (m) + 42 (h) = **127** | | ✅ (parent's "~128+" was a guess) |

## B. Full primary re-check, topic by topic (G1–G6 = P1–P6)

Legend: ✅ matches level · ⬇ content belongs to an earlier level (revision, harmless unless the level's own content is missing) · ⬆ content belongs to a later level (fix) · ➕ gap

| Topic id | Name | Content | Syllabus | Verdict |
|---|---|---|---|---|
| g1.count | Counting Stars | count to 20 | P1 WN 1.1 | ✅ |
| g1.add20 / g1.sub20 / g1.bonds | | +/− within 20, bonds | P1 WN 2 | ✅ |
| g1.shapes | Shape Garden | name 2D shapes, sides/corners (incl. pentagon, hexagon) | P1 Geometry 1 | ✅ (pentagon/hexagon are extra) |
| g1.money | Coin Purse | cents up to $1 | P1 Money 1.1 | ✅ |
| g1.time | Clock Tower | o'clock and half past only | P1 Time 2.1 "telling time **to 5 minutes**", am/pm, h/min | ⬇ under-level: P1 asks for 5-minute times |
| g1.picgraph | Picture Graphs | 1 picture = 1 | P1 Stats 1 | ✅ |
| g1.story | | within 20 | P1 | ✅ |
| g2.add / g2.sub | | algorithms to 3 digits | P2 WN 2 | ✅ |
| g2.place | Place Value Castle | H/T/O, compare | P2 WN 1 | ✅ (odd/even not covered) |
| g2.times / g2.share | | tables 2,3,4,5,10, ÷ | P2 WN 3 | ✅ |
| g2.money | Dollars & Cents | **add and subtract money** in decimal notation | P2 Money = count $ and ¢, decimal notation, compare, convert ↔ cents. **Adding/subtracting money is P3 Money 1.1** | ⬆ fix (the MA-2 Learn lesson for g2.money already teaches P2 counting) |
| g2.time | Five-Minute Clock | time to 5 minutes | **P1** 2.1. P2 = "to the minute", hours & minutes, h ↔ min | ⬇ P1 content; P2 content missing |
| g2.frac | Pizza Fractions | part of a whole ✅; **"1/d of n beans"** | fraction of a set is **P4** Fractions 2.1. P2 = part of a whole, compare unit/like fractions, add/subtract like fractions within 1 | ⬆ one question type is P4; P2 compare/add missing |
| g2.picgraph | | picture graphs with scales | P2 Stats 1 | ✅ |
| g2.story | | two-step | P2 | ✅ |
| g3.times / g3.divrem / g3.add4 / g3.mul | | | P3 WN 1–3 | ✅ |
| g3.eqfrac | | equivalent fractions | P3 Fr 1 | ✅ |
| g3.measure | Measure Magic | compound units km/m, m/cm, kg/g, ℓ/mℓ | P3 Meas 1.2–1.3 | ✅ |
| g3.duration | Ball Time | h min → min (P2 2.3) + durations (P3 2.2) | P2/P3 | ✅ mixed |
| g3.clock | Midnight Clock | to the minute, 24-h, start/finish | P3 Time 2.2–2.3 | ✅ |
| g3.perim | Fence the Garden | perimeter of rectangle/square | P3 A&V 1.3 | ✅ (rectilinear figures and area missing) |
| g3.lines | Train-Track Lines | right angles, bigger/smaller, ⟂ and ∥ | P3 Geometry 1.2, 2 | ✅ |
| g3.bargraph | | bar graphs with scales | P3 Stats 1 | ✅ |
| g3.story | | × ÷ stories | P3 | ✅ |
| g4.longmul / g4.longdiv / g4.factors | | | P4 WN 2–3 | ✅ |
| g4.fracadd | Fraction Potions | related denominators, answers may pass 1 | P3 2.1 (within 1) / P4 3.1 | ✅ P3–P4 overlap |
| g4.fracset | | fraction of a set | P4 Fr 2 | ✅ |
| g4.decimal / g4.round | | tenths/hundredths, + decimals, rounding incl. 1 d.p. | P4 WN 1.5, Dec 1–2 | ✅ |
| g4.area | Area of the Kingdom | area of rectangle (P3) + one side (P4) | P4 A&V 1.1–1.3 | ⬆⬇ move the P3 part to G3, add composite figures |
| g4.angles | Turns & Angles | degrees in turns, compass turns | P4 Geometry 1 (name ∠ABC, measure in degrees) | ⚠️ no protractor; compass not in syllabus |
| g4.symmetry | Mirror Pond | line symmetry on grid | P4 Geometry 3 | ✅ |
| g4.linegraph | | tables, line graphs | P4 Stats 1 | ✅ |
| g4.story | | multi-step | P4 | ✅ |
| g5.fracmul | | fraction × whole / fraction | P5 Fr 2.2–2.3 | ✅ |
| g5.dec10 | | × ÷ 10, 100, 1000 | P5 Dec 1.1 | ✅ |
| g5.percent | | % of amount, fraction → % | P5 % 1.1–1.3 | ✅ |
| g5.ratio | Ratio Recipes | simplify, missing term | **P6** Ratio | ⬆ move to G6 |
| g5.triangle | | area of triangle | P5 A&V 1 | ✅ |
| g5.angles | Angle Detectives | straight line, point, vert. opp., triangles, parallelogram, rhombus, trapezium | P5 Geometry 1–3 | ✅ |
| g5.volume | Treasure Chests | volume of cuboid, tank in ℓ | P5 A&V 2 | ✅ |
| g5.average | Average Adventures | mean, total from mean | **P6** Data Analysis | ⬆ move to G6 |
| g5.order | | order of operations | P5 WN 2.2–2.3 | ✅ |
| g5.rate | Fairy Rates | rate per unit | P5 Rate | ✅ keep |
| g5.story | | fractions, % discount | P5 % 1.4 | ✅ |
| g6.fracdiv | | ÷ fractions | P6 Fr 1 | ✅ |
| g6.pctchange | | discount (P5) + % increase (P6 1.2) | P5/P6 | ✅ |
| g6.share | | share in a ratio | P6 Ratio 1.3 | ✅ |
| g6.circle | | circumference, area | P6 A&V 1 | ✅ |
| g6.algebra | | letters, substitution, simplify | P6 Algebra | ✅ |
| g6.speed | Speedy Broomsticks | d = s × t | not primary; **Sec 1** N4 | ⬆ move to Grade 7 |
| g6.nets | Snip & Fold Nets | cube nets, solid from net | **P4** Geometry 4 | ⬇ move to G4 |
| g6.piechart | Pie Chart Picnic | fractions + percentages | **P4** Stats 1.2 (reading); % = P5 | ⬇ move to G4 with fractions; percentage pies → P5 |
| g6.story | | model problems | P6 | ✅ |

### Further primary gaps found (not in the brief's table; reported, not built in Task 1)
- P1: numbers to 100 (tens and ones, compare/order, ordinal numbers 1st–10th, number patterns); multiplying within 40 / dividing within 20; dollars up to $100.
- P2: odd and even numbers; 2D shape patterns; comparing fractions (added to g2.frac in this task).
- P3: rectilinear perimeter; adding related fractions within one whole (partly in g4.fracadd).
- P4: mixed numbers and improper fractions; decimals × ÷ by a 1-digit number; properties of rectangle and square; drawing angles.
- P5: fraction and division; mixed numbers × whole; measurement conversion with decimals; numbers to 10 million; percentage of GST and annual interest (discount is there).
- P6: volume problems (find a side from volume); finding the whole from a percentage; composite circle figures.

## C. Secondary spot-check (G3 Mathematics syllabus; Grade 7 = Sec 1 … Grade 10 = Sec 4)

| Grade | Topics | Finding |
|---|---|---|
| 7 (Sec 1) | integers, hcf, simplify, expand, lineq, angles, mensur, pct, pattern, story | ✅ all Sec 1 (N1, N3, N5, N7, G1, G5). **Rate and Speed (N4) now added here** |
| 8 (Sec 2) | expand2, factorise, pyth, similar, solids, proportion, stats, prob, fraceq | ✅ Sec 2 |
| 8 | gradient, lingraph | ⬇ linear graphs and gradient are **Sec 1** N6.3–6.5; "parallel/perpendicular gradients" (m₁m₂ = −1) is Additional Maths, not G3 Maths |
| 8 | fraceq | ⬇ simple fractional equations are Sec 1 N7.3 |
| 9 (Sec 3) | quad (by factorising), simul | ⬇ Sec 2 content (N7.8, N7.9) |
| 9 | trig (SOH-CAH-TOA) | ⬇ Sec 2 G4.3 |
| 9 | surds | ⚠️ not in G3 Maths; Additional Mathematics |
| 9 | quadgraph, indices, stdform, bearings, coord, circles, ineq, sets | ✅ Sec 2–4 |
| 10 (Sec 4) | quadf, sinecos, prob2, freq, spread, travel, sector, vectors, matrices, interest | ✅ Sec 3/4 (travel graphs and compound interest are listed as application contexts) |
| 10 | triggraph | ⚠️ sine/cosine graphs are Additional Mathematics, not G3 Maths |
| 11–12 (JC) | func, explog, diff, stationary, tangent, ap, gp, vec3, integ, chain, area, binom, complex, sigma, expcalc | not checked line by line (no JC syllabus fetched). explog, diff, stationary, tangent, AP/GP are also O-Level Additional Maths |

None of the secondary findings is moved in Task 1 except speed (decision for Jeremy, see the report).
