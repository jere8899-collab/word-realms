# Research: the review code as it was (checked 2026-11-04 against the source, before any change)

## Facts from the code
- `WR.freshPick` (js/lesson.js): per "<rid>/<skill>" bucket, unseen items first, then oldest-seen. No dates at all: an item returns when the bank has rotated (A1 grammar 139 items / 8 per lesson ≈ 17–18 lessons), whatever the calendar says.
- `WR.buildItems`: 8 fresh items (reading: 2 fresh passages). Nothing earlier is ever mixed in.
- `js/garden.js`: Leitner boxes seed → sprout 1 d → bud 3 d → nearly 7 d → bloomed. `grade(ok)` did `box++` with **no minimum gap** (watering right after the mistake grew it). Bloomed plants were excluded from `isDue` forever (retired), and the 150-plant cap deleted the oldest bloomed ones.
- `js/charms.js`: own boxes 🌙 1 d, ⭐ 3 d, 🌟 7 d, 🌠 14 d, 💎 mastered (excluded from `isDue` forever).
- `js/sg-english.js`: `SG.items` uses `WR.freshPick` on its own buckets ("sg-<lv>/<game>/<rid>"); no dates either.
- Stars: lesson answers pay through `WR.awardStars("en", itemKey, …, kind "item")`; an item paid once is "known" and pays 0 for ever, so a review answer pays nothing (brief: give review a small, capped reward).
- Save: `wordRealms.save.v1`; `WR.BLOCKS` (js/core.js) completes bonus blocks on load; two tabs adopt the newest localStorage save (`storage` event → `WR.load()`); a cloud load replaces the save and keeps the stricter `earn`/`clock` (`keepEarn` in js/cloud.js).
- Banks: 3 643 core questions; grammar items have a rule line in `explain` ("Past simple: …", "With he, she or it we use has…"), which is what the skill tags are built from. No tag field existed.
- `tests-2026-11-04/sim.js` (the brief's helper) is not in the repo; `tools/sim/brief-table.js` re-measures the table instead, through the game's own functions with a fake clock.

## Before numbers (tools/sim/brief-table.js on the code before Task 2, 2026-11-04 ~16:00 SGT)
| Measure | Before |
|---|---|
| Lessons before a correctly answered item returns | A1 grammar 17–18 lessons; A1 reading 19 (one lesson a day: back on day 17–19, then every ~17–19 days) |
| Earlier items mixed into a new lesson | 0 of 48 across 6 lessons (grammar); 1 of 54 reading (two passages sharing a question) |
| Longest Mistake Garden gap | gaps 1, 3, 7 days, then retired for good; a right answer 5 minutes after the mistake grew it (box 1) |
| Maths topics with spaced review | 0 of 134 (times tables only) — Task 3 |
| Maths mistakes in the Mistake Garden | none — Task 3 |
| Recognition questions | 75% (2 740 / 3 643) — Task 7 |
| Pass mark | best-ever 60% (5 of 8) on 3 of 4 skills — Task 4 |
| 40%-child passes within 3 tries | ~83% (tools/sim/pass-chance.js, A1; brief said ~86%) — Task 4 |
| Retention measure | none — Task 5 |
