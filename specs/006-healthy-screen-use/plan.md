# 006 plan
- js/core.js: WR.HEALTH config; tickPet without away decay; petMood happy greeting; streak rest day (activityDone, streakAlive);
  one-time migration (healthMig); WR.health helpers: playedToday(), sitting tracking in logDay, restReason().
- js/ux.js: wrap the starters with a rest check (limit/bedtime → rest screen instead); the break nudge after activityDone.
- js/parent-gate.js: ⏳ Daily playtime + 🌙 Bedtime selects in 👪 Grown-ups (already gated); gated "15 more minutes".
- js/main.js WR.petFeel: no "is hungry"; js/pet-shop.js mood line kind.
- css: .rest-screen, .break-card.
- tools/test/health.js (fake clock).
