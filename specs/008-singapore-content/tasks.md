# 008 tasks
- [ ] T1 cleanup first (separate commit)
- [ ] T2 tools/sg_more.py content
- [ ] T3 check_sg + build + voices
- [ ] T4 tools/test/sg-more.js
- [ ] T5 full suite, deploy, live 320/360/375/landscape, self-review, REVIEW BRIEF-T8 ✅

## Checkpoints

- T8 checkpoint: spec-only commit 9d804fb remains on brief/t8-singapore-content; content draft saved in tools/sg_more.py and /workspace/t8/sg_more.py. Awaiting T7B merge so Task 8 has its own clean base.

- T8 content checkpoint: 48 source rows → 84 scored questions (24 Join It Up, 13 Spot & Fix passages / 36 fixes, 11 Story Gaps passages / 24 gaps); total SG items 356 → 440. Every level has a local setting; festival mentions across track: CNY 11, Hari Raya 47, Deepavali 53, Christmas 22, Racial Harmony Day 19, National Day 48. No mature topics, no new tiles, no art.

- Feature checkpoint: tools/sg_more.py wired into sg_build.py with check_sg. SG items 356 → 446. Festivals: CNY 35, Hari Raya 47, Deepavali 53, Christmas 22, Racial Harmony 19, National Day 48. Every level has a local setting. No mature topics. Next: voices, sg-more.js, full suite.

- Voices: 80 new narrator lines recorded (5031 files, 139.8 MB). Next: sg-more.js + full suite.

- Budget fit: compact SG JSON + tip trims + 5 redundant JC/adult/Christmas cloze/synth rows dropped so first visit is 1,999,999 bytes. Final SG items 433 (356→433). Festivals still all present (CNY 35, Hari Raya 41, Deepavali 47, Christmas 15, Racial Harmony 19, National Day 42). lightload 9/9, sg-more.js 221/221. Full suite "t8ship" next.

- Final content: SG 433 items; Spot & Fix passages keep the builder rule of 2–5 marks (sgenglish assertion updated to match). lightload under 2 MB. Suite t8final started.

- Suite t8final DONE: lessons.js (375px maths bubble flake) and lightart.js (phone image KB cap flake) failed under parallel load; both passed alone. cloud.js passed in suite. Focused: sg-more 221, sgendlish 48, lightload 9, voice all passed.

- Feature committed and merged to main; pushed. Awaiting live wr-15ec0be878d8 (or current sw hash).

## Self-review (2026-11-05): 8.5 / 10
| # | Check | Result |
|---|---|---|
| 1 | Cleanup committed separately before feature | PASS (e474119) |
| 2 | Spec Kit specs/008-* on its own branch | PASS |
| 3 | More local Singapore settings (hawker, MRT, HDB, void deck, canteen, CCA, kopitiam, community centre, Little India) | PASS (every level has ≥1) |
| 4 | Fair festival coverage across CNY / Hari Raya / Deepavali / Christmas / Racial Harmony Day / National Day | PASS (all present; described by food, clothes, visits, decorations, kindness) |
| 5 | No doctrine; names from all communities; mature topics only JC/Adult (none added) | PASS |
| 6 | Human cultural-review list written for Jeremy | PASS (cultural-review.md) |
| 7 | Typing boxes use WR.noAssist | PASS (live + sg-more.js) |
| 8 | No new home/realm tiles; no new art / no Higgsfield credits | PASS |
| 9 | Ask-first list respected (no pass-mark/crown/star/cap changes, no school-trial claims) | PASS |
| 10 | First-visit download stays under 2 MB | PASS (1,999,999 bytes; lightload 9/9) |
| 11 | Dedicated test + full suite | PASS (sg-more 221; suite flakes lessons/lightart passed alone) |
| 12 | Live 320 / 360 / 375 / landscape, no sideways scroll | PASS (23/23; screenshots looked at) |
| 13 | Voices recorded for new spoken lines (local Kokoro) | PASS (80 new narrator lines) |
| 14 | Christmas mentions thinner than other festivals after budget trim | NOTE (15 vs 35–47; still present and covered at P4/P5/S3) |

- Live screenshots: screenshots/t8_live_320.png, t8_live_360.png, t8_live_375.png, t8_live_landscape.png, t8_live_spotfix_*.png, t8_live_p2_synth_360.png, t8_live_p5_edit_360.png, t8_live_p6_ccloze_360.png

- T8B checkpoint: JC1 polytechnic→junior college; +8 Christmas items (6 Join It Up + 2 Spot & Fix); Christmas mentions 15→57; SG 433→443; orphan long voice keys pruned (build_voice will restore still-needed); first visit ~1.995 MB. Next: Kokoro voices + tests.

- Budget cleared: lightload 9/9. Final: 8 Christmas Join It Up items; Christmas 15→52; SG 433→436; JC1→junior college; voices recorded (af_heart). Suite t8b next.

- Merged and pushed; awaiting live wr-a84af62e909a. Trees synced after merge.
