# Word Realms Constitution

## Core Principles

### I. Children first
The audience is children. Cute anime/chibi pastel fairytale art everywhere (new art from Grok Bot's image generator only, never Higgsfield).
Kid-friendly topics (mature, respectful GP-style topics only on the Singapore JC / Grown-up levels). A wrong answer or a faded crown
must never feel like a punishment.

### II. Never take away what a child earned
Stars, crowns, stickers, unlocked realms, awake Grade Guardians and wardrobe items are never removed. Older saves migrate in place
inside `wordRealms.save.v1`, survive Cloud Castle sync and the two-tab merge. Topic ids are stable; if one must change it is migrated.

### III. Clean up first, then add
Before adding a feature, tidy the code it touches and report that cleanup separately. One task at a time, on a branch.

### IV. Tested on real phone sizes
Every task adds a test in `tools/test/`; all suites pass (cloud, lightart, parentgate, pwa run one at a time). Phones: 320, 360,
375 px and landscape, all answers on screen, tap targets ≥ 44 px. Typing boxes block autocorrect (WR.noAssist).

### V. No build, no dependencies, offline
Static HTML/CSS/JS, PWA service worker (`tools/build_sw.py` before deploy), no bundler, no npm runtime dependencies.

## Product decisions already made
- Never add a new top-level realm tile; new modes go inside lessons or a bonus door (`WR.addBonus`).
- The parent gate stays in front of cash, Teacher mode, Reset, clear-device and the Report; money needs the PIN.
- Anti-farm star rules (`WR.awardStars`, `EARN`) and the 150-a-day practice cap stay.
- Maths and English follow the current Singapore MOE syllabuses by level; no "MOE-approved" or "proven" claims.

## Do not do without asking Jeremy
Change the ~85% pass mark or remove the later-day re-check; turn on real payments; change the default daily time limit from off or
remove streaks; start a school trial, collect more child data or share progress with teachers; make MOE/score claims.

## Governance
This constitution follows AGENT-BRIEF-2026-11-04.md and Jeremy's standing rules. Specs live in `specs/NNN-name/` and follow
specify → clarify → plan → tasks → analyze → implement → converge. Small factual fixes may skip the full flow if the report says so.

**Version**: 1.0.0 | **Ratified**: 2026-11-04 | **Last Amended**: 2026-11-04
