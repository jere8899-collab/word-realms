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
