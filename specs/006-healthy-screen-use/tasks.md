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
