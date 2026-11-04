# 005 tasks
- [x] T1 cleanup js/report.js: stat() helper moved to module scope (no behaviour change), committed separately (d76057c)
- [x] T2 RV.CONFIG.keptDays = 25 + RV.kept(rec, ok, now) (js/review.js), called before RV.step moves rec.t
  (the earlier "RV.step o.asked" idea was dropped: counting only at the call sites keeps RV.step pure)
- [x] T3 callers: RV.answer (a stand-in counts for its `for` item; rule cover does not), Mistake Garden grade, Word Charms grade,
  MR.finished (one topic round = one answer, right = ≥ the 85% mark), MR.answer (Daily Mix). RV.creditWord is not counted
- [x] T4 save: report.kept [right, wrong] + days[d].kept (js/core.js: freshReport, load default for older saves, WR.keptAnswer)
- [x] T5 Report card: 🎯 % right (all time) beside 🧠 remembered after 30 days, one plain line, "not enough data yet (n of 10)"
- [x] T6 tools/test/retention.js (fake clock: explicit answer times through the real callers), 20/20
- [ ] T7 full suite, deploy, live hand-tap 360 + 320/375/landscape, t5_live_*.png, REVIEW BRIEF-T5 ✅
