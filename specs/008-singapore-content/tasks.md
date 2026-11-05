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
