# Research (code read 2026-11-04)
- `MW.buildItems` (js/math.js): items / challenge / topic (`MG.batch(id, 8)`) / grade mixed (each topic ≤ 2×, current grade only).
- `MW.startLesson` → `L`; `submit()` pays `awardStars("m", uid|topic|q|a)` per question (fresh numbers = a new key, inside the 150 cap); `finish()` pays the round (replay taper) and `MW.record(key)`.
- `MG.batch(topic, n, seed)` makes distinct questions; `MG.make` sets `q.topic`, `q.seed`, `q.grade`. Only `g3.clock` asks clock-setting (`q.set`) questions.
- js/math-goals.js: `PASS = 0.6` is what "passed a topic" already means for the Grade Guardians → reused as "finished".
- Mistake Garden (js/garden.js) only rebuilds English lesson items; maths needs its own round in the maths engine.
- Singapore track: `WR.state.sg = { track, level }`; maths grades already carry the MOE labels (`MG.GRADES[].sg`).
- Choice: one record per *topic* (not per question), because maths questions are generated: knowing a topic is what comes back.
