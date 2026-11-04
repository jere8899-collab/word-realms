# Plan
- **Cleanup first** (same behaviour): one `WR.PASS = { mark, skills }`, `WR.skillRec`, `WR.skillPassed`; main.js / collect.js / lesson.js read it instead of the literals 0.6 and 3.
- **core.js**: `WR.PASS = { mark: 0.85, skills: 4, boss: 3, checkN: 4, polishDays: 30, helpAfter: 2 }`, `WR.passCount(n)`, `WR.passes(score, n)`, `WR.skillPassed / skillConfirmed / checkReady / needsPolish`, `recordLesson(…, n)` keeps pass / fails, `WR.recordCheck`, lazy migration (`state.passMig`, `state.keep`), `WR.mergePass` for the cloud.
- **js/pass.js** (`WR.Pass`): the ✨ check row on the realm screen, skill badges, `startCheck`, help card (Learn lesson + easier path), result lines.
- **lesson.js**: finish passes n, check rounds go to `recordCheck`, kind result lines, help card after 2 tries.
- **main.js**: continue card offers a ready check; map node counts confirmed skills; kind lock toast.
- **collect.js**: boss wakes at `PASS.boss` passed or when kept.
- **Test** `tools/test/pass-mark.js` (fake clock + a server-date override for "tomorrow"), numbers `tools/sim/pass-mark.js`.
