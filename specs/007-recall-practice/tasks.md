# 007 tasks
- [ ] T1 cleanup first (separate commit)
- [ ] T2 js/recall.js + lesson.js card
- [ ] T3 build_data.py mark_recall + check_recall; run build_data
- [ ] T4 tools/test/recall.js (+ helpers in older tests)
- [ ] T5 full suite, deploy, live 320/360/375/landscape, self-review, REVIEW BRIEF-T7 ✅

## Checkpoints
- Spec written (specify → clarify → plan → tasks). Pre-tested on scratch cq-pre7 (:18662): recall.js 25/25.
- [x] T1 cleanup applied (optsHTML / bindOpts in js/lesson.js, no behaviour change): explain 6482/6482, picq2 640/640, c2types 225/225.
- [x] T2/T3/T4: feature applied to the source (recall.js, lesson card, build_data mark_recall/check_recall → data/recall.json, picking 79.2% → 66.5%); recall.js 25/25. Subset run t7a: doubletap/explain/farm/pass-mark/skins drove .opt → opt out with window.__WR_NO_RECALL (tools: /workspace/t7/testfix.py).
- Re-run t7b: doubletap, explain, farm, pass-mark, skins pass. README updated. Full suite "t7" started.
- Live dry run found the answer "'ll" (hint "' _ _"): answers must now start with a letter/digit (JS + Python); a missing apostrophe counts as right ("cant" = "can't"). Suite "t7" stopped early and restarted after the fix. recall.js 25/25.
- Full suite "t7" (110): all pass; art16.js (a boss portrait image load) and cloud.js (Supabase reload timing) passed on re-run alone. Committing.
- Checkpoint: T7 committed ead0a56, merged 464ed21, pushed. Next: live check.
- [x] T1 cleanup (6fea0ab), T2/T3/T4 done, T5 full suite + deploy + live done.

## Self-review (2026-11-05): 8.5 / 10
| # | Check | Result |
|---|---|---|
| 1 | Recognition drops by at least 10 points in the first wave | PASS (picking 79.2% → 66.5%, −12.7) |
| 2 | Scaled by age: fewer typed answers for the youngest | PASS (A1 −7.9, A2 −12.0, B1–C2 −14) |
| 3 | Review items "answer first, then see options" (review slots + Mistake Garden) | PASS |
| 4 | Typed answers are fair to mark (short unique answers; capitals, punctuation, apostrophes, a/the, number words) | PASS; the "'ll" case found in a live dry run and fixed |
| 5 | Kind tone: a miss still lets the child pick, a right pick counts, "So close" is not a try | PASS |
| 6 | Ask-first list: no pass-mark change, the later-day re-check kept, stars and caps unchanged | PASS |
| 7 | Typing boxes use WR.noAssist (asserted) | PASS |
| 8 | No new home tiles, no new realm tiles; boss and dragon rounds keep plain choices | PASS |
| 9 | Phones 320 / 360 / 375 px + landscape, taps ≥ 44 px, no sideways scroll, live | PASS (whole screenshots looked at) |
| 10 | Test for the task + the full suite (110) | PASS; art16 + cloud flaked once each, passed on re-run alone |
| 11 | Cleanup committed separately | PASS (6fea0ab) |
| 12 | JS rule and the Python rule agree on every level | PASS (data/recall.json checked in the browser) |
| 13 | More typed answers in B1+ listening / reading | NOT DONE (few paraphrase answers are fair to type; left for wave 2) |
| 14 | No new art needed (uses the existing pet and picture art) | PASS (nothing generated) |
