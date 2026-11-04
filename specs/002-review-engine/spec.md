# Feature spec: One review system for English (AGENT-BRIEF-2026-11-04, Task 2)

**Branch**: `brief/t2-review-engine` · **Status**: implemented · **Input**: AGENT-BRIEF-2026-11-04.md Task 2, PEDAGOGY-REVIEW-2026-11-04.md

## Why
An item a child answers right comes back only when the whole bank has rotated (17–18 lessons later, whatever the date), lessons never
mix earlier items in, the Mistake Garden's longest gap is 7 days and then the item retires for good, and Word Charms keeps its own
1/3/7/14-day boxes. Forgetting happens over weeks; one schedule with growing gaps should bring things back just before they fade.

## User stories
- **US1 (P1)**: A child who answered an item right sees it (or another item on the same skill) again about 3, 10, 30 and 90 days later.
- **US2 (P1)**: A normal lesson stays 8 questions: 5 new + 3 review when reviews are due, else 8 new. Boss rounds never hold reviews.
- **US3 (P1)**: In the Mistake Garden a right answer only grows a plant after a real gap (≥ about 20 h); bloomed plants come back rarely, nothing retires for good.
- **US4 (P2)**: Word Charms and the Singapore track feed the same schedule; Word Charms looks the same.
- **US5 (P2)**: Review answers pay a small, capped star reward (they pay nothing today), inside the anti-farm rules and the 150/day cap.
- **US6 (P1)**: Old saves migrate in place in `wordRealms.save.v1`; the new data survives cloud sync and the two-tab merge.

## Functional requirements
- FR1 One config (`WR.Review.CONFIG`): gaps `[3, 10, 30, 90]` days, a rare "rest" gap after the last step, the minimum real gap (20 h), lesson mix (5 + 3), review star size and daily cap.
- FR2 One record per item: strength step, next due time, last result, last answer time, counts. Right and wrong answers both update it.
- FR3 Right answer: step +1 and due = now + gap(step), but only if the last answer was ≥ 20 h ago; otherwise nothing moves. Wrong answer: step back to 0, due after a short gap (shorter than any step).
- FR4 `tools/build_data.py` adds a skill tag `sk` to every core-bank item (grammar, vocab, listening, reading) and validates it (format, every tag has ≥ 2 items in its bank).
- FR5 A review slot prefers a **different item with the same skill tag** (not in the lesson, not resting); if none, the item itself.
- FR6 Garden stages use the same gaps; bloomed plants return after 90 days, then every rest gap; a wrong answer sends a plant back to a seed (kind tone kept).
- FR7 Word Charms glows 🌙⭐🌟🌠💎 map onto the same steps; 💎 is due again after the rest gap instead of never.
- FR8 Singapore rounds (`SG.items`) record answers into the same records and take up to 3 due reviews from the banks they draw on.
- FR9 Review stars: 1⭐ for a right review answer that advanced its item, at most once per item per step, at most `EARN.review` (10) a day, inside the 150 cap.
- FR10 Migration: `state.review` block (fresh in old saves); garden bloomed plants get a due date; mastered charms get a due date; mergeable by key on cloud load.

## Success criteria (brief "done when")
- SC1 Fake clock: a simulated child sees a correct item again around 3, 10, 30 and 90 days after each previous sighting.
- SC2 A lesson holds review items once they are due (3 of 8); none in boss rounds.
- SC3 A right answer minutes after a mistake doesn't advance the item (lesson record and garden).
- SC4 All existing suites pass; phones 320/360/375 + landscape keep answers on screen, tap targets ≥ 44 px.

## Clarifications (/clarify, answered from the brief and the code; open ones go to Jeremy)
- Q: "Gaps of 3, 10, 30, 90" vs "seen again around day 3, 10, 30, 90"? → **Gaps between sightings** (days 3, 13, 43, 133 after first learning). One config line if Jeremy prefers days counted from the first sighting.
- Q: Record per item or per skill? → Per item (keyed `<rid>/<skill>:<itemKey>`); the skill tag decides the stand-in. Shared by realm lessons and Singapore rounds drawing on the same bank.
- Q: Reading items live inside passages. → A review slot for reading is one earlier passage, its due questions first (up to 3); with 1 new passage the lesson stays about 8.
- Q: Wrong answer in a lesson: garden or review? → Both record it, but the garden owns a mistake from then on (`rec.g`), so the same item is not asked twice.
- Q: What does a bloomed plant / 💎 charm do after 90 days? → Returns after the rest gap (180 d) for as long as the save lives; a wrong answer there starts it over kindly.
- Q: Garden storage cap? → The 150-plant cap deleted bloomed plants (retired for good). Raised to 400 with bloomed plants kept; above 400 the oldest bloomed is dropped (decision noted for Jeremy).
- Q: Star payment for garden/charms reviews? → Same review reward (FR9). Charms keep their per-glow stars.
