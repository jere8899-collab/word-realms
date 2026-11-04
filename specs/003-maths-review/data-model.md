# Data model (all inside wordRealms.save.v1; travels with cloud sync and the two-tab save)
- `state.review.items["math:g4.fracadd"] = { s, d, t, l, n, r, w }`: same record shape and rule as English (js/review.js). Merged per record on a cloud load (`RV.merge`, later answer wins).
- `state.review.mmig = 1`: maths migration done (older saves: every topic with `best ≥ 0.6` gets `s:1`, due 3 days after it was last played, or spread over the next week when that is past).
- `state.math.mix = { day, today, total }`: Daily Mix rounds (shows "✅ Done today").
- `state.settings.dailyMix` (missing = on).
- Mistake Garden plant for maths: `{ id: "math_<topic>", realm: "math", skill: "math", type: "math", topic, grade, q: "<icon> <topic name>", missed, sig, correct, explain, box, due, t, n, misses, bloomed }` (one per topic; max 400 plants as before).
