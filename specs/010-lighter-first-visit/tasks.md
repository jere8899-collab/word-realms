# Tasks: 010 Lighter first visit

- [x] T0 Cleanup (separate commit): `WR.loadStory` uses `WR.bank`; Settings offline row has `bindOfflineRow`. No behaviour change.
- [x] T1 Spec (this folder).
- [x] T2 Service worker: install does not fetch the banks. `wrdata` keeps banks across updates (copied out of the old precache first). Download fetches every bank and both voice lookups. The page fills the shell cache after load.
- [x] T3 Voice lookup loads on the first spoken line, not with the map. Recordings unchanged.
- [x] T4 Kind miss note. No new home tile. `WR.noAssist` unchanged.
- [x] T5 `lightload.js`, `pwa.js`, `firstload.js` (another level, reload, adopt, poor network, 320/360/375 and landscape).
- [x] T6 Full suite, 103 files. cloud, lightart, parentgate, and pwa each run alone on the final tree and passed. Other timeouts under parallel load passed alone.
- [x] T7 PR opened. Not merged. Review row is ⏳, not live.

## Measured (lightload: each URL once, text gzipped, images as stored)

| | Files | Unique bytes |
|---|---|---|
| main before this branch (after 8e331ac) | 195 | 1,870,825 |
| this branch | 98 | 888,028 |

Historical gate on main was 1,999,921. Far banks and `assets/voice/manifest.json` are not in the first visit. New lesson JSON does not join that list.

## Out of scope

Task 10 thinking skills. Task 11 off-screen tasks.
