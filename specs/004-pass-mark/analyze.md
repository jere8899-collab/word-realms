# Analyze / converge (before → after, `node tools/sim/pass-mark.js`, A1, 20,000 simulated children per row)

Chance a child opens the next realm within N tries of each skill (a "try" = one lesson, and once passed one crown check per later day).
Before = 60% on 3 of 4 skills, no check. After = 0.85 (about 7 of 8) on all 4 skills + a 4-question check on a later day.

| Knows | Before (3 tries) | After, check 3/4 (3 tries) | 4 tries | 5 tries | Alt: check 4/4 (3 tries) |
|---|---|---|---|---|---|
| 40% | 82.6% | **0.0%** | 0.1% | 0.1% | 0.0% |
| 60% | 100% | 6.3% | 15.2% | 26.3% | 0.7% |
| 80% | 100% | **80.7%** | 92.4% | 97.2% | 48.0% |
| 90% | 100% | 99.1% | 99.9% | 100% | 90.9% |

Targets: 40% child passes within 3 tries < 15% ✅ (0.0%); 80% child still passes within ~3 tries ✅ (80.7%, 92.4% by 4). A2 / B1 behave the same (80% child: 80.7% / 80.4%).

Checks against the brief: pass at ≈85% as one config value (`WR.PASS.mark`) ✅; all 4 skills for the next realm ✅; confirmed by doing well again on a later day with a short 4-question check ✅ (server game day; one check a day); Polish me ✨ after 30 days, crown never removed ✅; after 2 tries in a row, the Learn lesson or an easier path ✅; kind wording, never "failed" ✅; old saves keep every open realm, boss, star, crown, sticker and unlock (`state.keep`, merged in cloud + two tabs) ✅.

Decisions to report:
- The check uses the same 0.85 mark rounded to whole questions → 3 of 4. A 4/4 check (100%) would drop the 80% child to 48% within 3 tries.
- The realm boss wakes at 3 of 4 skills *passed* at the new mark (no check needed).
- Singapore track (no gating) and maths (Grade Guardians 7/10, Daily Mix "finished" 60%) unchanged; stickers "Score 60%+" unchanged.
