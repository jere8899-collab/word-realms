# 005 plan
1. Cleanup first (separate commit): `js/report.js` summary stats row — the stat() calls are built inline; small helpers for the "% right" cell.
2. `js/review.js`: `RV.CONFIG.keptDays = 25`; `RV.kept(rec, ok, now)` counts one answer when `rec.n && rec.t && now - rec.t >= keptDays` (called *before* `RV.step` changes `t`).
3. Callers, once per child answer: `RV.answer` (the stand-in's `for` record, else its own), `js/garden.js`, `js/charms.js`, `js/math-review.js`. Not: rule cover, `RV.creditWord`.
4. `js/core.js`: `freshReport()` gains `kept: [0, 0]`; migrate fills it in.
5. `js/report.js`: `WR.Report.KEPT = { days: 25, min: 10 }`; `data()` returns `kept: { n, right, a | null }`; the summary shows the stat beside "% right" plus the one plain line.
6. Test `tools/test/retention.js` (fake clock, real Report screen through the parent gate). Full suite, deploy, hand-tap at 360×740 + 320/375/landscape, `t5_live_*.png`.

## Checkpoint 2026-11-05 ~03:00 SGT
- Cleanup committed (d76057c on brief/t5-retention). Feature applied in the source tree; retention.js 20/20; full suite "t5" running.
- Sync note: state.report is not merged field by field on a cloud load; it travels with the save that wins (the same as the
  existing tallies). kept lives in wordRealms.save.v1, so a reload and a second tab see it (tested).

## Checkpoint 2026-11-05 ~03:45 SGT: BRIEF-T5 ✅ (self-review)
- Deployed: d76057c cleanup, a6af1b6 feature, merge 14a1c38, live sw wr-64f0cd44b8c6. Full suite 98/98 (3 load timeouts passed singly).
- Live (/workspace/t5live/live.js, log live.log): 12/12 by real taps, gate answered like a grown-up (read question, digits, hold ✓ 2 s).
- Self-score 7.5/10. Docked for: the figure is all time while the tab can read "Last 7 days" (two different "% right" numbers on the
  week tab: fixed with "Both figures here are all time", but still two numbers); the report is not merged field by field on a cloud
  load (kept follows the winning save, like every other tally); old saves start at zero, so families see "not enough data" for 25+ days;
  no live check of the maths/charms paths (covered by retention.js only); the 3 suite flakes under load are still flaky.
- Lessons: (1) a test seed in addInitScript must use a context-wide marker (localStorage), or a second tab silently reseeds and
  overwrites the save; (2) live gate checks can't use the test hook: solve the question as a grown-up would; (3) look at the
  screenshot of the whole screen, not only the new card: the duplicate "% right" only showed up there.
