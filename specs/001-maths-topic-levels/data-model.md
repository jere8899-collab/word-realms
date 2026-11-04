# Data model: Task 1

No save-shape change. Ids are stable.

| Entity | Field | Change |
|---|---|---|
| Topic (js/math-gen.js `TOPICS`) | `id` | unchanged for all 127 old topics (moved ones pass `{ id: "g6.nets" }` etc.) |
| Topic | `grade` | nets 6→4, piechart 6→4, ratio 5→6, average 5→6, speed 6→7 |
| Topic | `was` (new, optional) | old grade of a moved topic; only read by Grade Guardians to keep them awake |
| Topic | new | g1.length, g2.measure, g2.solids, g3.area, g3.angles, g3.money (127 → 133) |
| Save `math.topics[id]` | — | untouched; crowns = `WR.crowns(best)` keyed by id, so they follow the topic to its new grade |
| Save `math.bosses` | — | untouched; `won` stays; readiness is computed, and `was` keeps old counts |
| Stickers `stickers.got.math` | — | already-earned stickers are stored and never recomputed away |
| Learn lessons `data/lessons/*.json` `at.topic` | — | ids unchanged (only G2 lessons exist) |
