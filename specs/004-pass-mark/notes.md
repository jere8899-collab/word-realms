
## BRIEF-T4B (2026-11-05) checkpoint 1 — cleanup (no behaviour change): math-goals.js lockToast + topicPassed helpers (the lock toast was written twice, the topic test twice); collect.js the 4 skill stickers built from one list. mathgoals 109/0, c6 61/0, maths-review 39, balance ok.

## BRIEF-T4B checkpoint 2 — feature
- WR.PASS.checkNeed = 4 (crown check 4 of 4, own value next to mark 0.85); WR.checkCount/checkPasses; recordCheck + pass.js texts ('all 4 right'). Boss stays at PASS.boss 3.
- Grade Guardians: PASS = WR.PASS.mark, fight need = WR.passCount(questions) = 9 of 10, texts '(85%+)'. Old saves: state.keep.guard worked out once (gmig) with the old 60% rule; mergePass unions keep.guard.
- Daily Mix: CONFIG.math.pass = WR.PASS.mark; oldPass 0.6 only for MR.migrate; an extra topic with a review record stays usable.
- Stickers: skill stickers test WR.skillPassed (85%), label 'Score 85%+ in …'; earned stickers stay (stickers.got).
- Tests: new t4b.js 17/17; pass-mark.js, mathgoals.js, maths-review.js, c6.js updated (seeds at 87.5%, 3 of 4 → Nearly there, then 4 of 4 → confirmed).
- Sim (20,000 children, within 3 / 4 / 5 tries): A1 40% 0/0/0 · 60% 0.7/2.7/6.7 · 80% 48.8/71.6/85.9 · 90% 91.0/97.5/99.3 (3-of-4 rule: 80% child 80.8/92.5/97.4). A2, B1 within 1 point. specs/004-pass-mark/sim-t4b-*.json
