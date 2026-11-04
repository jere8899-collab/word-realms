# Data model (inside wordRealms.save.v1)
- `state.progress[rid][skill]` gains: `pass` (time first passed at the mark), `passDay`, `goodDay` (last lesson at the mark), `fails` (tries in a row below the mark while not passed), `ok` + `okDay` (confirmed by a later-day check), `chkDay` (last check day: one a day), `cfails` (checks in a row that didn't confirm), `polDay` (last polish / check at the mark). `best`, `plays`, `last` unchanged.
- `state.keep = { open: [rid…], boss: [rid…] }`: realms open / bosses awake under the old rule (kept forever). `state.passMig = 1` once computed.
- Cloud load: `keep` lists are unioned and per-skill pass fields are merged (a confirmation is never lost). Two tabs adopt the newest write.
