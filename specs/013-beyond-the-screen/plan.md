# Plan: Beyond the screen

The module is `js/beyond.js`. It is not a `data-shell` script. `WR.lazy` fetches it the first time the Play door or the Learning Report needs it. The service worker then keeps that one copy, like any other same-origin script, so a later offline visit can still open it.

Suggestions for all 19 levels live in that file. The Report card prints every level's paper-task title. The Play door gains one tile, `beyond`.

Stars go through `WR.awardStars("beyond", level:kind, 2, { kind: "item" })` after `WR.parentGate`. The save block is `beyond.done`.

## Garden thirst

See the Garden thirst section of `spec.md`. The clock and the charge live in `js/garden.js`, which is already on the first visit, because a deduction has to run on open even if the child never opens Beyond the screen. The code is small. `state.garden.thirstAt` is the update time, so old plants do not back-charge.
