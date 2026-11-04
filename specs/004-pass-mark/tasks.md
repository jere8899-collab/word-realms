# Tasks (BRIEF-T4)
- [x] T01 Before numbers (`tools/sim/pass-mark.js` → /workspace/t4-sim.json)
- [x] T02 BRIEF-T4 🔧 row; branch brief/t4-pass-mark
- [x] T03 Cleanup commit (one WR.PASS rule) + lessons, realmpath, c6, homeshort, gatelock, review-engine green
- [x] T04 core.js pass rule, check, polish, migration, merge
- [x] T05 js/pass.js UI + lesson.js / main.js / collect.js wiring
- [x] T06 tools/test/pass-mark.js (fake clock + server-date override, phones, t4_*.png)
- [x] T07 Full suite after the final change; deploy; live 200
- [ ] T08 Live tap-through at 360×740 (t4_live_*.png), score, BRIEF-T4 ✅, report

## Checkpoint notes
- pass-mark.js green (43 checks after adding the "no Play again on a check" assert); fixes found by it: `#again.hidden` was overridden by `.btn` CSS → the button is now removed on checks; help Learn button says "📜 Learn: …".
- Full run 1: 91/95 green; c6 / homeshort / review failed on the 320 px home (Continue goal wrapped to 2 lines) → shortened to "N skills 💎 to open X"; explain flake (re-run singly).
- Full run 2 interrupted; full run 3 started after the final change.
- Full run 3: c6/review 320 px still over (map line + crown-check goal wrapped) and an old record with no time never got its check → fixed (`passDayOf` → ""), shorter lines; pass-mark.js 44 green; full run 4 started.
- Full run 4: 95/95 (doubletap flaked under load, 54/54 singly; cloud/lightart/parentgate/pwa serial, green). Deploying.
