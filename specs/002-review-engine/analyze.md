# Analyze + converge (BRIEF-T2)

## Coverage (spec → code → test)
| Req | Code | Test |
|---|---|---|
| FR1 one config | js/review.js `CONFIG` | review-engine §1 |
| FR2–3 records, 20 h rule, wrong shortens | `RV.step`, `RV.answer`; lesson.js `answer()` | §2, §4 |
| FR4 skill tags | tools/skill_tags.py, build_data.py `check_tags` | build_data run; §11 |
| FR5 different item, same skill | `RV.pick` (rule skills), cover in `RV.answer` | §2, §3 |
| FR6 garden | garden.js `grade` on `RV.step`, bloomed due again | §4, §5, garden.js |
| FR7 charms | charms.js `grade` on `RV.step`, 💎 due again | §4, §5, charms.js |
| FR8 Singapore | sg-english.js `SG.items(…, {review})` | §8, sgenglish.js |
| FR9 review stars | core.js `awardStars` kind "review", `EARN.review` | §2, §6 |
| FR10 migration, cloud, two tabs | `RV.migrate` (wraps `WR.load`), `RV.merge` in cloud.js, BLOCKS | §9, §10, twotabs.js, cloud.js |
| SC2 no review in boss rounds | buildItems review opt-in; startLesson guard | §7 |
| SC4 phones | — | §12 (320/360/375/landscape, ≥ 44 px), t2_*.png |

## After numbers (tools/sim/brief-table.js, fake clock, one lesson a day, every answer right)
| Measure | Before | After |
|---|---|---|
| When a correct item comes back | 17–18 lessons / day 17–19 (grammar), 19 (reading), whatever the date | due after 3 days: reviewed on days 3–4, 13–15, 43–45, 129–132 (grammar); 4, 14, 43, 124 (reading); vocab 3–4, 22–23, 54–55, 136–145 |
| Earlier items in a new lesson (6 lessons) | 0 of 48 | 9 of 48 (3 of 8 from day 3 on, lessons stay 8) |
| Longest Mistake Garden gap | 7 days, then retired | 1 (20 h rule), 3, 10, 30, 90, then 180, never retired; a right answer 5 min after the mistake: no growth (before: grew) |
| Maths topics with spaced review | 0 of 134 | unchanged (Task 3) |
| Maths mistakes in the garden | none | unchanged (Task 3) |
| Recognition share | 75% | 75% (Task 7) |
| Pass mark | best-ever 5/8 on 3 of 4 | unchanged (Task 4) |
| 40% child passes in 3 tries | ~83% (our sim; brief ~86%) | ~83% (Task 4) |
| Retention measure | none | none yet (Task 5; the records now hold what it needs: last result + gap) |

## Converge notes
- Vocabulary reviews the word itself, so 3 slots a lesson can't keep up with 5 new words a day: its 2nd review lands ~day 22 instead of 13 in the sim (most overdue first; nothing is lost, it just waits). Grammar/listening/reading review the skill, so they stay on time. → decision for Jeremy.
- "Gaps of 3/10/30/90" read as gaps between reviews (days 3, 13, 43, 133). One config line if he meant days from first learning.
- "No reviews in boss rounds" read as the realm boss fights; the B2 realm's normal lessons (Lake Boss Battle look) and C2 (Dragon Riddles) do get reviews.
- A wrong lesson answer: the Mistake Garden owns that item from then on (no double asking).
- Garden cap 150 → 400; past 400 the oldest bloomed plant still goes (save size).
- The two-tab adoption has a known race when a tab is still starting up (existing R5 design); test waits for the tab to settle.
