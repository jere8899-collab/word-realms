# 012 Thinking skills

**Feature Branch**: `cursor/thinking-skills-602e`

**Created**: 2026-11-08

**Status**: Draft

**Input**: AGENT-BRIEF Task 10 and pedagogy note E10. Occasional "Why does this work?", "How sure are you?" on review questions, and named heuristics on word problems. About 1 of every 8–10 questions. Lessons stay short.

## Goal

A child sometimes stops to say why an answer works, how sure they felt, or which strategy they will try. The prompts sit inside the lesson or maths round they are already playing. Nothing new appears on the home map.

## User Story 1 - Why this works (Priority: P1)

After some ordinary questions, the child can choose a reason. A silly reason (longest answer, first button) is answered kindly, and the score does not change.

**Independent Test**: One marked question shows three reasons. Picking the wrong one does not change the correct count or the stars from the question itself.

## User Story 2 - How sure (Priority: P1)

On a review question, the child can say "Pretty sure" or "Not sure yet" before the result. Afterwards they see whether that feeling matched, and, once there are a few, a simple tally.

**Independent Test**: A review item records a sure+right pair in the save. Reload keeps it. The tally uses only those answers.

## User Story 3 - Named heuristics (Priority: P1)

On a maths word-problem topic (the topics already marked `story`), the child picks one strategy: draw a model, work backwards, or look for a pattern. The game names that strategy in one line. No new picture is required.

**Independent Test**: A `g2.story` question offers the three names. Picking one does not pay stars by itself.

## Acceptance

- In a round of 8 or more questions, the share of questions with one of these prompts is between 1 in 10 and 1 in 8, including both ends.
- Rounds shorter than 8, boss and dragon rounds, crown checks, placement, and guardian fights do not add a prompt.
- A review question is preferred for "How sure are you?". A word-problem question is preferred for the strategy pick. Other questions get "Why does this work?".
- Prompts do not add a question to the round, do not change the pass mark, and do not pay or take stars by themselves.
- New save data is `state.think` inside `wordRealms.save.v1`. Cloud sync keeps the richer of the two copies. Older saves gain the block when it is first used.
- Typing, if any, keeps `WR.noAssist`. These prompts are taps only.
- Phones 320, 360, 375, and landscape keep answers on screen and tap targets at least 44 px.

## Out of scope

- Task 11 (off-screen tasks, viewing, play together).
- New home or realm tiles.
- Pass mark, later-day crown check, streaks, payments, school trials, or approval claims.
- New generated art. The three strategies use words and emoji already in the game. A set of three chibi strategy cards would be nice later and is not required.
