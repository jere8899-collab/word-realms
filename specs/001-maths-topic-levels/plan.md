# Implementation Plan: Maths topics at the right Singapore level

**Branch**: `brief/t1-maths-levels` | **Date**: 2026-11-04 | **Spec**: spec.md | **Research**: research.md

## Summary
Move five topics to their MOE grade while keeping their ids, split the P3/P4 area and angle content, bring four more Grade 1–2 topics to
level, and add five small generated topics (P1 length, P2 measures, P2 solids, P3 area, P3 angles, plus P3 money from the old P2 add/sub).

## Technical Context
**Language**: vanilla ES2019 JS in the browser and Node (generators are shared). **Storage**: localStorage `wordRealms.save.v1` + Supabase sync.
**Testing**: Node checks + Playwright (`playwright-core`, system Chrome) in `tools/test/*.js`, game served on :18642.
**Constraints**: no build step, offline PWA (`tools/build_sw.py`), phones 320–375 px + landscape, tap ≥ 44 px.

## Constitution Check
- II Never take away: ids unchanged → crowns stay; guardians use `was` so none sleeps again. ✅
- III Clean up first: see "Cleanup" below. ✅
- IV Tested: new `tools/test/maths-levels.js` + full suite run. ✅
- V No build: plain JS only. ✅  · Art: reuse painted icons already in `tools/icons/icons.txt` (no new art needed). ✅

## Design
1. **Registry** (`js/math-gen.js`): `topic(grade, key, …, opt)` already lets `opt.id` override the id. Add a short comment and
   `M.topicGrade(id)`; nothing else parses grades from ids except `js/learn.js` (two regexes) → use `MathGen.topic(id).grade`.
2. **Code follows the grade**: generators move to the file and grade section they now belong to, so `M.gradeTopics(g)` order stays
   "skills → graphs → word problems last" without a sort:
   - nets (+ cube-net helpers, `M.nets`) and pie charts → `js/math-topics-p.js` Grade 4, before/after `g4.linegraph`;
   - ratio and average → Grade 6 section of `js/math-topics-m.js`; speed → Grade 7 section.
3. **Pie charts**: one generator `pieQ(r, {pct})` exported as `M.pieQ`; G4 calls it with fractions only, `g5.percent` gets a 4th type
   using `pct: true`.
4. **New/rewritten generators** (pastel SVG via existing helpers `svgBox`, `cardSvg`, `gridSheet`, `gridCell`, `figCard`, `figLab`):
   `g1.length` (ruler), `g2.measure` (tape in m, balance, jug, unit choice), `g2.solids` (drawn solids, everyday objects, faces/roll),
   `g3.area` (unit squares on grid, cm²/m², rectangle area, compare), `g3.angles` (fans, clock hands, quarter turns),
   `g3.money` (old g2.money add/sub), `g4.area` (side from area/perimeter, composite L-shapes), `g4.angles` (∠ABC names, protractor).
   Level fixes: `g1.time` adds 5-minute times; `g2.time` adds to-the-minute + h ↔ min; `g2.frac` swaps "fraction of a set" for compare
   and add/subtract like fractions; `g2.money` = count notes and coins, decimal notation, compare, convert ↔ cents.
5. **Guardians** (`js/math-goals.js`): `bandTopics` counts a topic in the band of `t.grade` **or** `t.was`.
6. **Docs**: README topic table + notes, Grade Guardian lines, LESSONS-PLAN unaffected (lesson ids unchanged).

## Cleanup (before features)
- learn.js: grade derived from the id string twice → one helper using the registry.
- math-topics-m.js: nets helpers and pie data block move with their topic (no duplicate code left behind); `M.topic("g6.nets").gen`
  self-retry → a named `retryNets` helper like `topic3lines` / `topic4sym`.
- math-topics-p.js: header comment lists grades + the moved topics; data-analysis header comment updated (P4 pie charts).
- tests asserting old positions (nets.js, graphs.js, clock.js) updated to the new grades.

## Project Structure
```text
specs/001-maths-topic-levels/  spec.md research.md plan.md data-model.md tasks.md analyze.md
js/math-gen.js  js/math-topics-p.js  js/math-topics-m.js  js/math-goals.js  js/learn.js
tools/test/maths-levels.js (new)  tools/test/{nets,graphs,clock,…}.js (updated)  README.md
```

## Complexity Tracking
None: no new files in `js/`, no save-shape change.
