# Research (code read 2026-11-04)
- `WR.realmProgress` / `WR.isUnlocked` (js/core.js): `best >= 0.6`, `passed >= 3`, not chained, recomputed from `state.progress`.
- Users of `passed`: `WR.continueTarget` + map node (js/main.js), `C.bossReady` + boss card (js/collect.js), lesson finish nudge + "Score 60%" line (js/lesson.js).
- `WR.recordLesson(rid, key, score)` keeps best / plays / last; called for every lesson with a key (skills and bonus games).
- `WR.today()` is the trusted game day (server date when online, at most one day per session offline) → used for "a later day" and one check a day.
- `WR.Learn.forSkill(rid, skill)` lists the Learn lessons for a realm skill; `WR.Learn.open(id, { back })`.
- Realms are loaded in `WR.init` (after `WR.load`), so the save migration runs lazily the first time unlocks are read with realms present.
- Cloud: the save with more progress wins; `keepEarn` merges blocks that must never roll back → add the keep lists and per-skill pass fields there. Two tabs adopt the newest write (fields travel with it).
