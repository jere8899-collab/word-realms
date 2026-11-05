# 006 tasks
- [x] T1 cleanup first (separate commit)
- [x] T2 no-guilt pet (tickPet, petMood, petFeel, migration)
- [x] T3 streak rest day
- [x] T4 sitting timer + break nudge after a round
- [x] T5 Grown-ups: daily limit + bedtime (default off), rest screen, gated +15 min
- [x] T6 tools/test/health.js
- [ ] T7 full suite, deploy, live 360 + 320/375/landscape, self-review score + checklist, REVIEW BRIEF-T6 ✅

## Checkpoints
- T5B deployed and ✅ (09d41b6). Branch brief/t6-healthy-screen-use: spec 2c581f7.
- Cleanup applied (petFeel moved to core.js beside petMood, no behaviour change); homeshort 10/10, petlayers ok.
- Feature applied (identical to the pre-tested scratch, tools/test/health.js 32/32 there); homeshort fixed (seed healthMig:1, "wants a treat"); README updated. Next: full suite on the source tree.
- Full suite t6 (100 suites incl. health.js, serial cloud/lightart/parentgate/pwa): all pass; skins.js timed out once waiting for .opt, passed on re-run alone. Deploying.
- Checkpoint: committed c291490, merged 8a3e2f9, pushed (origin/main = 8a3e2f9). Next: poll live sw wr-6bb5df715cb9, live check.
- Checkpoint: live check 19/19 (wr-6bb5df715cb9). Next: look at whole screenshots, self-review, REVIEW ✅.
- [x] T7 done: REVIEW BRIEF-T6 ✅.

## Self-review (2026-11-05): 8.5 / 10
| # | Check | Result |
|---|---|---|
| 1 | Break nudge after ~20 min, only at the end of a round, once per sitting | PASS (live + health.js) |
| 2 | Daily playtime: gated, default Off, calm card, round in progress finishes | PASS |
| 3 | "15 more minutes" asks the grown-up gate again | PASS (after the gate's 5-min open window, which is existing behaviour) |
| 4 | Bedtime wind-down: bed−60 min until 5 am, gated extension | PASS |
| 5 | No-guilt pet: no away decay, happy welcome back, old saves lifted once | PASS |
| 6 | Streaks kept; one free rest day per 7 days with a kind toast | PASS |
| 7 | Ask-first respected (limit default Off, streaks not removed, no new home tiles) | PASS |
| 8 | Save data in wordRealms.save.v1 (settings.health, health, healthMig, streak.rest); never removes stars/crowns/stickers | PASS |
| 9 | Phones 320/360/375 + landscape, taps ≥44 px, no sideways scroll | PASS |
| 10 | Kind, kid-friendly copy; no new art needed (uses the pet art) | PASS |
| 11 | Test for the task (tools/test/health.js) + full suite | PASS (skins.js flaked once, passed on re-run) |
| 12 | Cleanup committed separately | PASS (8f279ca) |
| 13 | Cloud sync / two-tab merge of settings.health verified end to end | NOT VERIFIED (save field only; not run in the cloud suite) |
| 14 | Grown-ups panel layout polish (Daily playtime caption wraps to 2 lines; "MOH: under 2 h" hint) | PARTIAL (cosmetic; MOH hint flagged to Jeremy) |

## BRIEF-T6B checkpoints
- 🔧 rows added (b120f77). Patch /workspace/t6b/apply.py pre-tested on cq-pre6 (health.js 34/34), applied to the source tree.
- Live script /workspace/t6blive/live.js dry run 23/23. sw rebuilt; full suite "t6b" started.
- Full suite "t6b" (100): all pass; doubletap + lessons passed on re-run alone; cloud.js failed twice (once on a non-A–D first question, once on the Supabase reload timing): made it classic-A–D-only (test-only change), then it passed in full. Deploying.
- Checkpoint: T6B committed 1a0abf4 (+ test c07cae5), merged 095ba81, pushed. Next: live check.
- T6B ✅: caption fix 3f201e8 (live wr-01177cf620b9), live 23/23 again.
