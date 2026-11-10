# 013 Beyond the screen

**Feature Branch**: `cursor/beyond-the-screen-602e`

**Created**: 2026-11-10

**Status**: Draft

**Input**: Task 11, approved 2026-11-10. Off-screen tasks, viewing tasks, and a pass-the-phone round. Shown from the Learning Report. At most one new tile, inside an existing door.

## Goal

A child can leave the phone for a paper task, look at a poster, infographic or simple advert, or play a short turn-based round with a parent or sibling. Every CEFR level and every Singapore level has one off-screen suggestion in the grown-ups' Report.

## User Story 1 - Paper (Priority: P1)

A printable page holds a short reading, lines to handwrite answers, two or three talk prompts, and a marking guide for the grown-up. Print uses the browser's own print (`window.print`). No new library.

**Independent Test**: The A1 sheet shows the story, two questions, three talk prompts, and the marking guide.

## User Story 2 - Viewing (Priority: P1)

Posters, infographics and simple adverts are kid-friendly and level-appropriate. Singapore levels use Singapore places where it fits, and money is in Singapore dollars. Art is text and CSS, or emoji already in the game.

**Independent Test**: The Primary 3 viewing task shows S$3. No new image file is requested.

## User Story 3 - Play together (Priority: P1)

Pass the phone, take turns, no extra account, and the answers are not stored. A grown-up may confirm a small star bonus.

**Independent Test**: Three turns can be played. The save does not gain a second name. Confirming pays 2 stars once.

## Acceptance

- The Report lists one off-screen suggestion for A1, A2, B1, B2, C1, C2 and for P1–P6, Sec 1–4/5, JC 1, JC 2 and Adult.
- The new tile is inside the Play door. The home map does not gain a tile.
- `js/beyond.js` is not part of the first-visit shell. It loads when the Play door or the Report opens.
- New progress is `state.beyond.done` inside `wordRealms.save.v1`. Older saves keep their stars, pets and items.
- Typing, if any, keeps `WR.noAssist`. These screens are taps and paper.
- Phones 320, 360, 375 and landscape keep tap targets at least 44 px.

## Star bonus

Jeremy left the size open. This build uses **2 stars**, once per level per kind (paper, view, play). The award is `kind: "item"`, so it counts toward the 150-a-day practice cap and never pays twice. The existing parent gate must be passed. If the cap is already full, nothing is marked done and the grown-up can confirm on another day.

## Picture slots

No new art was painted. Slots a later picture could fill:

1. Nova and Puffbun reading a paper book.
2. A blank pastel poster frame.
3. Soft steps or coins for an infographic, with no brand logos.
4. A chibi hawker table.
5. Two chibi figures passing one phone.

## Garden thirst

Approved with Task 11 on 2026-11-10. A Mistake Garden plant can cost stars if it stays ready to water.

- The clock starts when the plant is **ready** (`due` is in the past), not when the mistake was made.
- After 24 hours of that thirsty time, it costs 1 star, then 1 more star for each further full day. There is no daily cap.
- The star balance never goes below 0. Pets, skins and other owned items are not taken.
- Watering, or any new due time in the future, ends that clock.
- Each plant stores `thirst: { due, from, paid }` on the mistake, inside `wordRealms.save.v1`. `paid` is how many of those days have already cost a star. A reload, a second tab, or a cloud merge keeps the higher `paid` and the higher `garden.thirst.taken`, and does not subtract twice.
- An old save sets `garden.thirstAt` to the first open after the update. Thirsty time before that is ignored, so the first load does not back-charge.

### Paused time

Thirsty time is wall-clock time minus the union of these pauses. Overlaps are counted once.

1. **Streak rest day.** If `streak.rest` is a `YYYY-MM-DD`, that whole local calendar day (midnight to the next midnight) is paused. That is the day the streak already treated as rest.
2. **Bedtime.** Only if `settings.health.bed` is set. Every night from that clock time until 05:00 the next morning is paused. The nights are rebuilt from the clock, so they still count while the app was closed. A grown-up's "15 more minutes" (`settings.health.until`, 15 minutes ending at that timestamp) is cut out of the pause. Those minutes count as thirsty time again, because play was allowed.
3. **Daily time limit.** Only if `settings.health.limit` is greater than 0. The game does not remember the minute the limit was hit on earlier days. When the app notices that play is stopped for the limit, it stores `{ why: "limit", s, e }` in `garden.stops`. The pause runs from `s` until play is allowed, or until the next local midnight if the app was closed, because the limit resets each game day. Time before the app noticed is not paused.

The gentle notice is `🌷 N plants got thirsty: -N⭐ — water them to stop it`. A plant whose next star is within 12 hours shows a heads-up. The Report lists stars lost this week.

## Out of scope

- A new home tile.
- Real payments, school data collection, or a second account.
- Taking pets, skins or other items when stars run out.
- Task 12.
