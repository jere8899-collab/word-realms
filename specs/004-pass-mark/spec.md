# 004 Make a pass mean something (AGENT-BRIEF-2026-11-04 Task 4)

## Problem (measured before, `tools/sim/pass-mark.js`, A1 banks, guessing on choice items)
Rule today: a skill is "passed" at a best-ever 60% (5 of 8); 3 of the 4 skills open the next realm (and wake the realm boss); never re-checked.
A child who knows 40% opens the next realm within 3 tries of each skill **82.9%** of the time (A2 82.1%, B1 81.2%).

## What the child gets
1. **Pass at about 7 of 8**: one config value `WR.PASS.mark = 0.85`, applied as "the nearest whole question" (7 of 8, 6 of 7, 5 of 6; 3 of 4 in the short check).
2. **All 4 skills** are needed for the next realm, each **confirmed on a later game day** by a short ✨ crown check of 4 questions (one check a day; the game day is the trusted server day, so changing the device clock doesn't help).
3. **Polish me ✨**: a crown not checked for 30 days shows a gentle "Polish me ✨" button on the realm screen. A polish round is the same 4-question check. The crown always stays.
4. **No child gets stuck**: after 2 tries in a row that didn't pass (lessons or checks), the result offers the 📜 Learn lesson for the skill and a 🌱 easier path (the same skill one realm down; in A1, a 4-question "little steps" round).
5. **Kind tone**: "Nearly there!", "Let's check again tomorrow 🌙", never "failed".
6. **Existing saves keep every open realm**, star, crown, sticker and unlock: realms open under the old rule stay open for good (`state.keep.open`), and a realm boss that was awake stays awake (`state.keep.boss`). Old skills at ≥ 85% count as passed and their check is ready at once.

## Done when (brief)
A 40%-knowledge child passes within 3 tries < 15% of the time and an 80% child can still pass with about 3 tries.

## Scope choices
- Realm boss: wakes at 3 of 4 skills passed (new mark); no later-day check needed (it's a fun fight, not a gate).
- Singapore track: its levels are all open (no gate), so there is nothing to tighten; unchanged.
- Maths: grades are all open; Grade Guardians already need 7 of 10 hits and Task 3's topic review uses the Guardians' 60% "finished" mark; unchanged.
- Stickers ("Score 60%+ in Grammar") keep their old wording and rule: stickers are never taken back.

## Needs Jeremy
The check uses the same 0.85 mark rounded to whole questions = 3 of 4. A 4-of-4 check would drop the 80% child to ~48% within 3 tries.
