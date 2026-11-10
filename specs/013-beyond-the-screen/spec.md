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

## Out of scope

- A new home tile.
- Real payments, school data collection, or a second account.
- Task 12.
