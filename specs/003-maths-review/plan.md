# Plan
- **Cleanup first** (same behaviour): `MW.buildItems` (one `LESSON` size, a `distinct()` helper instead of the inline Tower loop), one `qk` key per question in `submit()`, one `meta(m)` for a garden plant's level pill + skill icon (plot + modal). Re-run math, garden, mathgoals, maths-levels, clock, mathbubble suites.
- **js/math-review.js** (`WR.MathReview`, after math-goals.js): config `RV.CONFIG.math`, topic records `review.items["math:<topic>"]` on `RV.step`, `mixTopics / spread / mixItems / start`, hub card + home chip, `Garden.plantMath / mathItem / waterMath / mathDue`, hooks `onAnswer / onFinish`, migration (`review.mmig`).
- **js/math.js**: call the hooks; mix/garden rounds don't write topic crowns; back target; bloomed line for garden rounds.
- **js/garden.js**: English rounds skip number plants; a 🔢 button when both kinds are thirsty; plot/modal for maths plants (TeX rendered).
- **js/main.js**: home chip in the maths door; ⚙️ Settings switch "🎲 Maths Daily Mix" (on by default).
- **Test** `tools/test/maths-review.js` (fake clock) + numbers `tools/sim/maths-numbers.js`.
