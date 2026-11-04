# Tasks: One review system for English (BRIEF-T2)

**Input**: spec.md, research.md, plan.md, data-model.md · Format `[ID] [P?] [Story] Description` · checkpoints ticked as done

## Phase 1: Setup
- [x] T001 Branch `brief/t2-review-engine` (deploy repo, from main 524469f); `BRIEF-T2 🔧` row in REVIEW-2026-11-01.md (routine idles)
- [x] T002 Jeremy's T1 follow-ups first: G4 ✨ Extra compass topic (a41deb7); "Task 12 (later)" note in specs/001 tasks
- [x] T003 Read the code (lesson.js picking, garden.js, charms.js, sg-english.js, core.js save/earn/two tabs, cloud.js keepEarn, build_data.py) → research.md
- [x] T004 Before numbers with our own sim (`tools/sim/brief-table.js`, `tools/sim/pass-chance.js`; the brief's sim.js is not in the repo) → research.md

## Phase 2: Foundational (cleanup first, own commit 43bd6a1, same behaviour)
- [x] T010 `freshPick` computes each item key once (Map/Set instead of repeated hashing + `includes`)
- [x] T011 `buildItems`: `readingPool` + `passageQs` helpers (the classic-only filter written once)
- [x] T012 Garden: `itemOf(m)` (plant → lesson item) and `trim()` (the cap) out of `roundItems` / `plant`
- [x] T013 Word Charms: one `glow(b)` helper for the four `STAGES[Math.min(MASTER, …)]` lookups
- [x] T014 README: 134 maths topics (133 + 1 ✨ Extra)
- [x] T015 Re-ran garden, charms, fresh, review, sgenglish, r19read2, c2types, e2e: all pass

## Phase 3: US1 + US2 + US6 (P1) the schedule, lessons, saves
- [x] T020 [US1] `js/review.js`: CONFIG (3/10/30/90, rest 180, wrong 1 d, 20 h, early 10%, 5+3), `step`, `answer`, `due`, `pick`, `pickPassage`, `merge`
- [x] T021 [US1] `tools/skill_tags.py` + `build_data.py` (`add_tags`, `check_tags`): 3 643 items tagged, 237 tags over 24 banks, 92 in `<skill>.other`; only `sk` changed in the JSON (checked)
- [x] T022 [US2] `buildItems(…, {review})`: 3 reviews + 5 new; reading = 1 review passage + 1 new; `freshPick(…, skip)`
- [x] T023 [US2] `startLesson`: reviews in normal lessons, none in realm boss rounds (`opts.boss`, skill "boss"); `answer()` records every answer
- [x] T024 [US1] rule skills (grammar, listening, reading): one slot per tag, a different item; a right answer covers that tag's other due items; vocabulary: the word itself
- [x] T025 [US1] advance only when due (last tenth of the gap allowed): meeting a resting item early (bank rotation) doesn't speed it up
- [x] T026 [US6] `WR.BLOCKS.review`; `RV.migrate` wraps `WR.load` (cloud apply, other tab, restore); `review.mig` flag; `RV.merge` in cloud.js `keepEarn`
- [x] T027 [US6] index.html loads js/review.js after core.js; build_sw.py puts it in the offline shell

## Phase 4: US3 (P1) Mistake Garden
- [x] T030 [US3] `Garden.grade` on `WR.Review.step` (20 h rule, gaps from the config); seed not "thirsty" again straight after an early right answer
- [x] T031 [US3] bloomed plants due again after 90 d then ~180 d; shown in the bed when due; a slip → seed, bloom count stays
- [x] T032 [US3] cap 150 → 400, bloomed plants kept below it (decision noted for Jeremy)
- [x] T033 [US3] copy: "Bloomed flowers still pop back now and then for a drink"

## Phase 5: US4 + US5 (P2) Word Charms, Singapore, stars
- [x] T040 [US4] Word Charms on `WR.Review.step` (🌙 3 d, ⭐ 10, 🌟 30, 🌠 90, 💎 then ~180); catching stays first learning; look unchanged; kind notes
- [x] T041 [US4] `SG.items(lv, game, n, {review})`: bank games share the realm records ("<rid>/<skill>"), own games their own scope; 🎲 mixed practice unchanged
- [x] T042 [US5] `awardStars` kind "review": once per key, `EARN.review` = 10 a day, inside the 150 cap; `freshEarn`/`earn`/`mergeEarn` carry `review`
- [x] T043 [US5] review star paid by lessons (a review that moved its item), the garden (a plant that grew after a real gap) and charms (a polish that pays no glow star)

## Phase 6: Tests, numbers, deploy
- [x] T050 `tools/test/review-engine.js` (fake clock): 83 checks incl. phones 320/360/375/landscape, screenshots `t2_*.png`
- [x] T051 `tools/test/charms.js` and `tools/test/garden.js`: their "a day passes" helpers also move the last answer back 21 h (the new 20 h rule); garden.js stops when every plant has bloomed (bloomed plants are due again now)
- [x] T052 After numbers (brief-table.js, pass-chance.js) → analyze.md
- [x] T053 Full suite green (93 suites; cloud.js flake re-run singly ✅; garden.js updated for the 20 h rule)
- [x] T054 build_data.py + build_sw.py, sync to deploy, commit db38453, merge to main, push, live 200
- [x] T055 BRIEF-T2 row → ✅ with the commit; report in the brief's 4-part format

## Follow-up (Jeremy, 2026-11-04 17:11 SGT): vocabulary reviews come back late

Decisions: keep 3/10/30/90 as gaps between reviews; vocabulary gets both (a) and (b).

- [x] F01 (a) `CONFIG.busy = { skills: ["vocab"], overdue: 8, perLesson: 4 }` + `RV.slots(scope)`: a vocabulary bank with ≥ 8 words waiting takes 4 review slots (4 new + 4 review, still 8). Used by `WR.buildItems` and the Singapore `fromBanks`.
- [x] F02 (b) `RV.creditWord(lvl, word, ok)`: a graded Word Charms answer steps every existing vocab record of that level whose item asks for the word (right answer, or the word quoted in the question); same `RV.step` (20 h + due rule); no record is created for words never met in a lesson. Called from `WR.Charms.grade`.
- [x] F03 Tests: review-engine.js §11b (config, 3 vs 4 slots, grammar stays 3, charm credit moves step 1→2, a repeat minutes later moves nothing, unseen words make no record, saved). The migration check now allows stars to grow (a daily gift on load), never shrink.
- [x] F04 Re-measured (`tools/sim/brief-table.js`, one A1 vocabulary lesson a day; new row `a1/vocab+charms` adds one Word Charms round a day; `BUSY=overdue,slots` for what-ifs):

| A1 vocabulary, day of review 1 / 2 / 3 / 4 (median) | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| Before (3 slots) | 4 | 23.5 | 55.5 | 137 |
| (a) 4 slots when ≥ 8 waiting | 3.5 | 17 | 52 | 134.5 |
| (a) + (b) a Word Charms round a day | 3.5 | 15 | 49 | 132 |
| what-if: 5 slots when ≥ 8 waiting (not built) | 3 | 14 | 49 | 133.5 |

Only ~17 of the 128 A1 vocabulary items ask for one of the 40 charm words, so (b) helps those words most (best item: day 12).
