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
