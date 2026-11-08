# Analyze: 010

| Check | Result |
|---|---|
| Spec has a testable done-when | Yes. Byte cap, absent far banks, offline after a visit, kind miss, migrate, download. |
| Plan matches the spec | Yes. `wrdata` + deferred voice lookup + no second shell fetch. |
| Conflicts with saves / sync / parent gate | None. No save shape change. Supabase still bypasses the service worker. |
| Conflicts with Nov 8 lessons | None. Those packs stay on disk and load when a lesson opens. |
| Task 10 / 11 mixed in | No. |
| Risk | A child who never opens a realm cannot play it offline until they visit it online or tap Download. The old app had every bank after the first install. Download and the migration from the old precache cover that. The kind note covers the gap. |
