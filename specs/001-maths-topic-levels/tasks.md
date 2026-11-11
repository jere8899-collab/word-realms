# Tasks: Maths topics at the right Singapore level

**Input**: spec.md, plan.md, research.md, data-model.md · Format `[ID] [P?] [Story] Description`

## Phase 1: Setup
- [x] T001 Initialise Spec Kit (`specify init --here --integration copilot --script sh`, CLI 1.3.1.dev0) → `.specify/`, `.github/skills/`
- [x] T002 Fetch + read MOE 2021 Primary (Oct 2025) and 2020 G2/G3 secondary syllabuses (poppler) → research.md
- [x] T003 Add `BRIEF-T1 🔧` row to REVIEW-2026-11-01.md status table (routine idles)
- [x] T004 Wait for the Learn MA-2 job to finish and deploy (no edits to maths/learn files before that)
- [x] T005 Create branch `brief/t1-maths-levels` in the deploy repo

## Phase 2: Foundational (cleanup first)
- [x] T010 learn.js: one `gradeOf(topic id)` helper using `MathGen.topic(id).grade` (two regexes removed)
- [x] T011 math-gen.js: document the `opt.id` override for moved topics + `was`
- [x] T012 Move nets helpers + `g6.nets` and pie-chart data + `g6.piechart` to math-topics-p.js Grade 4 (ids kept), named retry helper
- [x] T013 math-goals.js: `bandTopics` counts `t.was` too

## Phase 3: US1 + US2 (P1) moves keep crowns
- [x] T020 [US1] ratio, average → Grade 6 section (ids g5.ratio, g5.average); speed → Grade 7 section (id g6.speed) + km/h ↔ m/s
- [x] T021 [US1] G4 pie charts fractions-only; percentage pies → `g5.percent` 4th type via `M.pieQ`
- [x] T022 [US2] Test: old save with crowns on every moved topic keeps them; guardians awake stay awake

## Phase 4: US3 (P2) P3 basics
- [x] T030 [US3] `g3.area` area basics (grid squares, cm²/m², rectangle, compare, unit choice)
- [x] T031 [US3] `g4.area` → one side from area/perimeter + composite L-shapes (area and perimeter)
- [x] T032 [US3] `g3.angles` angle as a turn (fans, clock hands, quarter turns, right-angle compare)
- [x] T033 [US3] `g4.angles` → ∠ABC names, protractor reading (inner/outer scale slip), degree turns

## Phase 5: US4 (P2) P1–P2 measurement and solids + level fixes
- [x] T040 [P] [US4] `g1.length` (ruler in cm, compare, order, difference)
- [x] T041 [P] [US4] `g2.measure` (unit choice m/cm/kg/g/ℓ, tape in m, balance in kg/g, jug in ℓ, compare/order)
- [x] T042 [P] [US4] `g2.solids` (drawn solids, everyday objects, flat/curved faces, rolls/stacks)
- [x] T043 [US4] `g2.money` → P2 (count notes + coins, decimal notation, compare, ↔ cents); `g3.money` = old add/sub (P3)
- [x] T044 [US4] `g2.time` adds to-the-minute + h ↔ min; `g1.time` adds 5-minute times; `g2.frac` compare/add like fractions

## Phase 6: Polish
- [x] T050 README table + notes; Grade Guardian texts; tests nets/graphs/clock/… updated for new grades
- [x] T051 `tools/test/maths-levels.js`; run every suite (cloud, lightart, parentgate, pwa one at a time); 320/360/375 + landscape
- [x] T052 build_sw.py, commit on branch, merge to main, push, live 200; REVIEW row → ✅ with commit

## Checkpoint (2026-11-04 15:39 SGT)
- T001–T050 done in the source tree; cleanup commit 2f57195 on `brief/t1-maths-levels` (deploy repo).
- T051: full suite run 1: 89/91 pass; doubletap.js and phonics.js timed out under load (re-run singly next).
- doubletap.js 54/54 and phonics.js 48/48 pass when re-run singly → 91/91 suites pass.
- Feature commit 5e73379, merged to main, pushed; REVIEW row BRIEF-T1 ✅.

## Dependencies
T004 blocks every code task. T010–T013 before T020+. T040–T042 parallel. T051 after all code. T052 last.

## Follow-ups decided by Jeremy (2026-11-04 15:46 SGT)
- [x] T060 Compass directions back as a G4 ✨ Extra topic (`g4.compass`, enrichment, not core syllabus; out of guardian fights) — own commit.
- [x] **Task 12: move misplaced secondary topics** (research.md §C and §D: g8.gradient, g8.lingraph, g8.fraceq → Grade 7; parallel/perpendicular gradients split out as g9.perpline, an ✨ Extra; g9.quad, g9.simul, g9.trig → Grade 8; g9.surds and g10.triggraph labelled ✨ Extra. JC checked against SEAB H2 Mathematics 9758 and left in place). Ids kept. Test: `tools/test/secondary-levels.js`.
