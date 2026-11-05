# 006 Healthy screen use (AGENT-BRIEF-2026-11-04 Task 6, PEDAGOGY-REVIEW E8)

## Facts checked against the code (2026-11-05)
- No break reminder, daily time limit or wind-down exists (grep: no "break", "limit", "bedtime" in js/ux.js, js/parent-gate.js, js/main.js settings).
- js/core.js WR.tickPet: hunger +4/hour and happiness −3/hour while away (a week away → hunger 100, happiness 0).
  WR.petMood: hunger > 75 → "I'm sooo hungry… 🥺"; happiness < 30 → "Will you play with me? 🥹". js/main.js WR.petFeel: hunger ≥ 60 → "is hungry".
- Streak (js/core.js WR.activityDone): a day missed → count back to 1. WR.streakAlive: 0 after a missed day.
- Play time already exists: report.days[day].s (seconds, from answer times, real device date). Every round ends in WR.activityDone();
  every full-screen activity starts through a starter wrapped in js/ux.js.

## User stories
1. **Break nudge** (child): after about 20 minutes of play in one sitting, at the end of a round (never mid-question) the pet suggests
   a stretch and a drink of water. Two kind buttons: "🌿 Take a break" (back to the map) and "✨ One more round". Once per sitting;
   a sitting ends after 10 minutes without answers.
2. **Daily minutes limit** (grown-up, optional, default OFF): 👪 Grown-ups → "⏳ Daily playtime": Off / 30 / 45 / 60 / 90 / 120 min.
   When today's play reaches it, the next round doesn't start: a calm "That's today's playtime 🌙" screen with the pet. A round in
   progress always finishes. "👪 15 more minutes" asks the grown-up gate.
3. **Wind-down hour** (grown-up, optional, default OFF): a bedtime (7:00 pm–10:00 pm). In the hour before it, the same calm screen
   ("Time to wind down for bed 🌙"), with the same gated "15 more minutes". Ends at 5 am.
4. **No guilt**: time away never makes the pet hungry or sad. The pet greets a returning child happily ("Yay, you're back! I missed
   you 💖"). Food stays a treat ("A snack would be a lovely treat 🍓"). Older saves: hunger/happiness from time away are lifted once.
5. **Free rest day**: missing one day doesn't end a streak; one rest day per 7 days. "🌙 Your streak took a rest day and kept going!"

## Done when
A child returning after 7 days sees a happy pet; the parent limit works and is gated (fake-clock test tools/test/health.js).

## Not changed (ask-first list)
The limit's default stays OFF; streaks stay. No new home tiles. No new child data beyond the save.

## BRIEF-T6B (Jeremy 2026-11-05 12:02)
- Bedtime: screens rest from the bedtime itself (not an hour before) until 5 am (`WR.HEALTH.windDownMin` 0). Kept: the limit only stops new rounds; one streak rest day a week; the MOH note.
- Grown-ups: ⏳ Daily playtime / 🌙 Bedtime title and picker on one line, the caption on its own full-width line below (320 and 360 px).
