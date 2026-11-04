# Analyze: cross-check of spec ↔ plan ↔ tasks ↔ code (speckit-analyze, 2026-11-04)

| Requirement | Plan / task | Where in code | Test |
|---|---|---|---|
| FR-001 primary topics at syllabus level, ids kept | T012, T020, T021 | `topic(…, { id, was })` in math-topics-p.js / -m.js | maths-levels.js §1 (19 topic → grade checks, `t.was`) |
| FR-002 nets, pies → G4; ratio, average → G6; speed → G7; rate stays G5 | T012, T020, T021 | p.js G4 (nets, piechart via `pieQ`), m.js G6 (ratio, average), G7 (speed after lineq) | maths-levels.js §1, nets.js, graphs.js, symmetry.js |
| FR-003 G3 area/angle basics; G4 sides, composite, degrees | T030–T033 | `g3.area`, `g3.angles`, `g4.area`, `g4.angles` | maths-levels.js §2 (no degrees in G3; protractor picture = answer) |
| FR-004 new g1.length, g2.measure, g2.solids | T040–T042 | p.js G1/G2 + `svgRuler`, `svgBalance`, `svgJug`, `svgSolid` | maths-levels.js §2 + phone flow §4 |
| FR-005 g2.money, g2.time, g2.frac, g1.time to level; g3.money | T043, T044 | p.js G1–G3 | maths-levels.js §2, clock.js (step 1 on to-the-minute G2 clocks) |
| FR-006 crowns, stickers, guardians survive | T013, T022 | `countTopics` in math-goals.js; ids unchanged | maths-levels.js §3 (old save) |
| FR-007 README, guardian text, Learn labels, SG labels | T010, T050 | README table + notes; `gradeOf()` in learn.js; guardian lines still true (ratio now in G6 = "Ratio Riverboat") | lessons.js, mathgoals.js |
| FR-008 new test + suites updated | T051 | tools/test/maths-levels.js; nets/graphs/symmetry/clock/lines updated | full suite |

## Findings
- **Gap (resolved):** spec said "bandTopics counts t.was"; code adds a separate `countTopics` so the *next-topic* suggestion and the guardian *fight* still use only the band's real grades (a G5–6 fight never asks a G4 nets question). Only `G.passed` (waking) counts moved topics.
- **Gap (resolved):** `g2.time` to-the-minute questions would have shown a 5-minute Clock Workshop model; math-viz now uses step 1 when `m % 5`, and returns no model for the h/min conversion questions (they carry no clock).
- **Ambiguity (decision for Jeremy):** compass directions are not in the 2021 primary syllabus; the old compass type was dropped from `g4.angles` (degree turns kept). No crowns are affected.
- **Ambiguity (decision for Jeremy):** secondary misplacements found (research.md §D) are reported, not moved; Task 1 is about primary levels.
- **Coverage:** every FR maps to at least one task and one test; no task without a requirement.
- **Constitution:** ids kept (never take away), no save rewrite, no build step, pastel SVG only (no new raster art; icons reused from the painted registry: 🎀 🍯 🧸 🪙 🧱 🪭 🧭), phones 320/360/375 + landscape tested.

# Converge (speckit-converge)
- Code matches spec; tasks T001–T052 checked against the diff and test logs before ticking (see report in REVIEW row BRIEF-T1).
- Follow-ups outside Task 1 (not done): primary gaps listed in research.md §C (P1 numbers to 100 / ordinal numbers, P2 odd–even and 2D patterns, P4 mixed numbers and rectangle properties, P5 fraction-as-division, P6 volume of liquid / whole from a percentage) and the secondary spot-check in §D.
