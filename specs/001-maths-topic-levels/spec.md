# Feature Specification: Maths topics at the right Singapore level

**Feature Branch**: `brief/t1-maths-levels` (Spec Kit folder `001-maths-topic-levels`)

**Created**: 2026-11-04

**Status**: Implemented (see tasks.md, converge notes at the end of tasks.md)

**Input**: AGENT-BRIEF-2026-11-04.md Task 1 "Fix maths topic levels", PEDAGOGY-REVIEW-2026-11-04.md E6.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A P4 child meets P4 topics in Grade 4 (Priority: P1)
A Primary 4 child opens Number Kingdom → Grade 4 and finds nets of solids and reading pie charts there, the year the school teaches them,
and no longer has to wait until Grade 6. A P5 child no longer meets ratio and average a year early, and no primary grade contains speed.

**Why this priority**: misplaced topics are the main MOE-fit gap (review: "Six maths topics sit at the wrong level or are missing").

**Independent Test**: `node tools/test/maths-levels.js` part 1 checks every primary topic's grade against the table in research.md.

**Acceptance Scenarios**:
1. **Given** the Grade 4 hub, **When** it opens, **Then** it lists Snip & Fold Nets and Pie Chart Picnic before the word problems.
2. **Given** the Grade 5 hub, **Then** it has no Ratio Recipes and no Average Adventures; **Given** Grade 6, **Then** both are there.
3. **Given** Grades 1–6, **Then** no topic is about speed; **Given** Grade 7 (Sec 1), **Then** Speedy Broomsticks is there.

### User Story 2 - Crowns survive the move (Priority: P1)
A child who earned 3 crowns on Snip & Fold Nets while it was in Grade 6 still has those 3 crowns after the update, now counted in Grade 4.
A Grade Guardian that was awake (or beaten) stays awake (or beaten).

**Independent Test**: maths-levels.js loads an old save with crowns on every moved topic in a phone browser and reads the crowns back.

**Acceptance Scenarios**:
1. **Given** an old save with `math.topics["g6.nets"].best = 1`, **When** the game loads, **Then** `MW.crownsFor("g6.nets") === 3` and Grade 4 crowns include it.
2. **Given** a save where Captain Ottilie (G5–6) was awake because nets, pie charts and 2 more G5–6 topics were passed, **Then** she is still awake.

### User Story 3 - Basics first in P3 (Priority: P2)
In Grade 3 a child learns what area is (counting unit squares, cm² and m², area of a rectangle) and what an angle is (a turn, bigger or
smaller than a right angle). Grade 4 keeps finding a side, composite figures and measuring angles in degrees with a protractor.

### User Story 4 - Early-years measurement and solids (Priority: P2)
A P1 child measures ribbons in cm on a ruler and compares lengths; a P2 child uses m, kg, g and ℓ, picks sensible units, reads a jug and a
balance, and names cubes, cuboids, cones, cylinders and spheres.

### Edge Cases
- A moved topic keeps its id (`g6.nets` now lives in Grade 4); nothing may parse the grade from the id (learn.js did; fixed).
- Old Learn-lesson links (`m.<topic id>`) keep working because ids are unchanged.
- Topic order inside a grade: word problems stay last; graphs stay together.
- A Grade 4 pie chart must not use percentages (P5); percentage pies move into Percent Potions (G5).
- 320 px phones: new SVGs fit with no sideways scroll; tap targets ≥ 44 px.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: Every primary topic's grade MUST match its 2021 MOE syllabus level (research.md table B), with moved topics keeping their ids.
- **FR-002**: Nets → G4; pie chart reading → G4 (fractions only); ratio → G6; average → G6; speed → G7 (Sec 1, adds km/h ↔ m/s); rate stays G5.
- **FR-003**: New G3 topics: area basics (`g3.area`) and angle basics (`g3.angles`); `g4.area` = one side + composite figures; `g4.angles` = ∠ABC names + degrees with a protractor.
- **FR-004**: New topics `g1.length` (P1 cm), `g2.measure` (P2 m, kg/g, ℓ), `g2.solids` (P2 3D shapes) with pastel SVG figures, why-not notes, seeded generators, painted icons reused from the registry.
- **FR-005**: Other misplacements found in the full re-check (g2.money, g2.time, g2.frac, g1.time) MUST be brought to level without changing ids; add/subtract money moves to a new `g3.money`.
- **FR-006**: Saved crowns, stars, stickers and awake/beaten Grade Guardians MUST survive; no save rewrite is needed because ids are unchanged.
- **FR-007**: README topic table, Grade Guardian band text, Learn lesson grade labels and Singapore level labels MUST reflect the new grades.
- **FR-008**: `tools/test/maths-levels.js` covers FR-001…FR-006; existing suites updated where they assert old grades.

### Key Entities
- **Topic**: `{ id, grade, name, icon, desc, gen, story?, was? }` — `was` = the grade a moved topic used to live in (keeps guardians awake).
- **Save** `wordRealms.save.v1 → math.topics[id] = { best, plays, … }`, `math.bosses[gid]` — unchanged shape.

## Success Criteria *(mandatory)*
- **SC-001**: 0 primary topics at a grade other than their syllabus level (before: 6 misplaced in the brief + 4 more found).
- **SC-002**: 0 lost crowns in the old-save test; every guardian awake before is awake after.
- **SC-003**: New topics generate 2,000+ valid questions each (answer passes the checker, hint, worked steps, no NaN/undefined).
- **SC-004**: All existing test suites pass (known flakes cloud.js / skins.js noted).

## Clarifications

### Session 2026-11-04 (answered with defaults; listed for Jeremy in the report)
- Q: Keep ids or rename moved topics (e.g. `g6.nets` → `g4.nets`)? → A: **Keep ids** (`topic(4, "nets", …, { id: "g6.nets" })`). Zero migration risk; ids are internal.
- Q: Grade 4 pie charts with percentages? → A: **Fractions only in G4**; percentage pie charts become one question type in Percent Potions (G5).
- Q: Where does speed go: G7 or a labelled "extension" in G6? → A: **G7 (Sec 1)**, the syllabus level (G3 Maths N4).
- Q: Compass turns in G4 (not in the 2021 syllabus)? → A: quarter/half turns move to G3 as "an angle is a turn"; G4 keeps degree turns plus protractor reading.
- Q: Fix secondary mismatches (gradient/lingraph in Sec 2 though Sec 1; trig and simultaneous equations in Sec 3 though Sec 2; surds and trig graphs are A-Math)? → A: **Not in Task 1**; reported for Jeremy.
- Q: Guardian readiness when a topic moves band? → A: a moved topic counts for its old band too (`was`), so nobody's guardian falls asleep.
- Q: Add the other gaps (P1 numbers to 100, odd/even, mixed numbers…)? → A: **Not in Task 1**; listed in research.md for a later turn.

## Assumptions
- "Grade N" = Primary N for N ≤ 6, Sec 1–4 = Grades 7–10, JC 1–2 = 11–12 (as `M.GRADES`).
- Standard (not Foundation) primary syllabus is the target.
