# Plan: one review system for English

## Approach
1. **Cleanup first** (own commit 43bd6a1, same behaviour): `freshPick` computes keys once; reading pool / passage helpers in `buildItems`; Garden `itemOf` / `trim` helpers; Word Charms `glow()` helper; README topic count.
2. **`js/review.js`** (loaded right after core.js): `CONFIG`, `gapDays`, the one rule `step(rec, ok, now, {floor, wrongDays})`, records in a new `WR.BLOCKS.review` block, `tag/key`, `answer`, `pick` (rule skills: one slot per skill tag, a different item; vocab: the item), `pickPassage` (reading), `reward`, `merge`, `migrate` (wraps `WR.load`).
3. **Lessons** (`js/lesson.js`): `buildItems(rid, skill, n, {review})` → up to 3 reviews + new to 8 (reading: one review passage + one new); `freshPick(…, skip)` keeps reviews out of the new picks without forgetting them; `startLesson` asks for reviews except boss rounds; `answer()` records every answer and pays the review star.
4. **Garden / Charms**: their own fields kept (look, saves), the movement rule and waits from `WR.Review` (`step`, `gapDays`); bloomed / 💎 come back after the rest gap; the cap no longer deletes bloomed plants below 400.
5. **Singapore**: `SG.items(lv, game, n, {review})` → bank games share the realm records; own games (synth, passages) keep their own scope.
6. **Stars**: `WR.awardStars(kind "review")` — once per key, `EARN.review` (10) a day, inside `EARN.cap` (150); `mergeEarn` keeps the stricter count.
7. **Save**: `state.review` inside `wordRealms.save.v1`; `RV.merge` in `keepEarn` (cloud); two tabs carry it with the save.
8. **Skill tags**: `tools/skill_tags.py` (rules on the rule line, then the right answer), run by `build_data.py`, `check_tags` validation.
9. **Tests / numbers**: `tools/test/review-engine.js` (fake clock, 83 checks, phones); `tools/sim/brief-table.js`, `tools/sim/pass-chance.js`.

## Constitution / ground-rule check
- No build step, no dependency, offline unchanged (review.js is in the SW shell via build_sw.py). ✅
- Nothing earned is taken away (bloom count, stars, stickers, glows stay; a slip makes a plant a seed as before). ✅
- Anti-farm: review star once per answer key, daily sub-cap, inside the 150 cap. ✅
- Kind tone: new lines ("Well remembered! It counts as a polish again …", "comes back for a drink"). ✅
- No new realm tile, no art. ✅
