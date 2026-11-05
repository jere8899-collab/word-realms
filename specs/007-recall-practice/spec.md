# 007 More recall, less picking (AGENT-BRIEF-2026-11-04 Task 7, PEDAGOGY-REVIEW E4)

## Facts checked against the code and data (2026-11-05)
- Core banks (grammar, vocab, reading, listening; reading questions inside passages), 3,643 items. Recognition
  (mcq, listen, picq) = 74.9%; counting True/False/Not given as picking too = 79.2% (A1 80.8 … C2 78.5).
- Producing items today: spell (letter tiles), order (word tiles), gaps (word bank), mistake (tap), dictate (typed),
  findword, events, headings. Typed answers exist only in dictation and the Singapore typed types.
- Every typing box already gets WR.noAssist (MutationObserver in js/core.js). Garden reviews run through WR.startLesson({review:true}).

## User stories
1. **Type it first ✍️** (child): on some questions the choices are hidden at first. The child types the answer (a short
   word or phrase, with a kind first-letter hint like "a _ _ _ _"). Right → "You remembered it!". Not sure, or a miss →
   "🤔 Show choices" / "Nice try! Now pick it from the choices ✨": the usual four choices appear and the question carries on as
   before. One letter off (5+ letters) → "So close! Check one letter ✏️" once, which is not a try.
2. **Scaled by age**: fewer typed questions for the youngest. First wave: about 8% of A1 items, 12% of A2, 14% of B1–C2
   become "type it first" (only items where the answer is short and fair to type: a gap in a sentence, a picture, a word
   meaning, or a word that is in the story / in what you heard).
3. **Reviews answer first**: every eligible review item (the 3 review slots in a lesson, and the Mistake Garden) is asked
   "type it first, then choices".
4. **check_recall** in tools/build_data.py prints the share per level and skill (picking / type-it-first / building or
   typing) before and after, and fails the build if a marked item isn't fair to type.

## Not changed (ask-first list respected)
The pass mark (~85%), the later-day crown check, stars (the same answer path, the same anti-farm rules and caps), the
Report, boss and dragon rounds (timers: they keep plain choices), the Singapore track, maths. No new home tiles, no new art.

## Done when
The recognition share drops by at least 10 points in this wave (check_recall), with no new phone layout problems at
320/360/375 px and landscape (tools/test/recall.js).
