# 005 Measure what lasts (AGENT-BRIEF-2026-11-04 Task 5)

## Facts checked against the code (2026-11-05)
- The brief says the Learning Report has no retention measure. **Confirmed**: `js/report.js` shows "% right" (all answers, `WR.tally` / save totals) and per-skill / per-topic accuracy, nothing about remembering after a gap.
- Every schedule already goes through one rule, `WR.Review.step(rec, ok, now)` (`js/review.js`), and each record keeps `t` = the time of its last answer: realm lessons and the Singapore track (`RV.answer`), 🌷 Mistake Garden (`js/garden.js` grade), 🔮 Word Charms (`js/charms.js` grade), maths topics and the 🎲 Daily Mix (`js/math-review.js`). So "the first answer after a gap of 25+ days" can be seen at the moment it happens, with no new tracking of the child beyond the answers already saved.
- There is no history of past gaps in older saves, so the figure starts from zero on every save ("Not enough data yet" until 10 answers).

## What the parent sees (behind the parent gate, like the rest of the Report)
- **🧠 Remembered after 30 days**: the % right on the *first* answer to an item after a gap of **25 days or more** since its last answer. Shown beside "🎯 % right" in the Report summary.
- One plain line: "% right counts every answer. Remembered after 30 days only counts the first answer to something last seen 25+ days ago, so it shows what has really stuck."
- Fewer than **10** such answers: "Not enough data yet" (with how many so far).

## Rules
- Counted: an answer the child gave to that very item (a lesson or Singapore question, a Garden watering, a Word Charm, a Daily Mix question, a maths topic round = one answer for that topic). A review stand-in (a different item on the same rule) counts for the item it stands in for — that *is* its review. Not counted: records that move only because something else was answered (rule-skill cover of other due items, Word Charms crediting the vocabulary bank). One answer counts at most once.
- "First answer after the gap": the record's previous answer (`t`) is 25+ days before this one; the answer resets `t`, so the next one doesn't count again.
- All-time figure (the 30-day gap means a week rarely holds 10 of them); the 60-day day log keeps the daily counts too.
- Save: `state.report.kept = [right, wrong]` and `days[d].kept = [right, wrong]` inside `wordRealms.save.v1` (cloud-synced; the two-tab rule adopts the newest save). No new kind of data: counts of answers the game already stores.

## Out of scope / ask Jeremy first
- No sharing with teachers, no new data about the child, no claims. The gap (25 days), the minimum (10) and the "all time" window are config values (`WR.Report.KEPT`).

## Done when
A fake-clock test (`tools/test/retention.js`) produces the right figure: answers inside 25 days don't count, the first after 25+ days counts once, second answers don't, cover answers don't, 9 → "Not enough data yet", 10 → the right %.
