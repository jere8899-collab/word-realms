# Word Realms — a fairytale English quest (Cambridge CEFR A1 → C2)

Cute-anime storybook web game that teaches **grammar, vocabulary, reading and listening**, plus bonus **🎤 speaking** and **✒️ writing** modes, across six realms, one per CEFR level.

## Run it
```bash
cd cefr-quest
python3 -m http.server 8000
# open http://localhost:8000
```
No build step and no dependencies. (It must be served over http so the JSON data loads. Opening the file directly will not work.)
`preview.html` is the old asset preview page.

## What's inside
| Realm | Level | Game mode | Special game | 🎤 Echo Well (speaking) |
|---|---|---|---|---|
| Meadow of First Words | A1 | Picture Pop: big picture cards, flowers bloom | Petal Match (picture ↔ word pairs, words spoken aloud) | 22 short present-simple sentences (/θ/ /ð/, final -s, can/can't) |
| Candy Village | A2 | Candy Shop: candy-tile sentence builder, sweetie jar | Candy Counter Rush (8 sentence orders) | 22 sentences (-ed endings /t/ /d/ /ɪd/, weak forms, choice questions) |
| Whispering Forest | B1 | Forest Quest: lantern path | The Fairy's Lost Lantern (branching story; your English choices change the path) | 18 read-aloud + 4 answer-the-question |
| Crystal Lake | B2 | Lake Boss Battle: timer, boss HP, 3 hearts | Glimmerfin's Final Battle (10 mixed questions) | 17 read-aloud + 5 answer-the-question |
| Cloud Castle | C1 | Council Debate: persuasion meter | The Great Debate (strongest argument, fallacies, concessions) | 17 read-aloud (inversion, clefts, idioms) + 5 answer |
| Starlight Library | C2 | Dragon Riddles: 3 candles | Riddle Duel (10 mixed: idioms, inversion, nuance) | 17 long read-aloud (inversion, idioms, nuance) + 5 answer |

* **383 questions** (15–17 per skill per level) with explanations, plus a 9-node B1 branching quest and 8 C1 debate puzzles, plus **132 speaking prompts** (22 per level) and **36 Story Quill writing tasks** (6 per level).
* Content lives in `data/<level>/<skill>.json`. The easiest way to extend it is the compact tables in `tools/c_*.py` (speaking prompts are in `tools/c_speaking.py`, using `say(...)` and `ask(...)` from `tools/qb.py`). Run `python3 tools/build_data.py` to regenerate the JSON and `data/counts.json` and to validate every item. Options are shuffled at runtime.
* **Listening** uses the Web Speech API (`js/speech.js`). It prefers an en-GB voice, has a speed slider, a 🐢 slow button and replay, and shows the transcript after each answer.
* **🎤 Speaking: the Echo Well** (`js/speaking.js`) is a 5th, *bonus* skill tile in every realm. It is **not** counted in the 3-of-4 unlock rule. A round has 5 prompts. Each prompt shows a Cambridge-style focus label (e.g. "Sounds: /θ/ and /ð/", "-ed endings /ɪd/", "Negative inversion", "Speaking Part 4: Hedging") and a pronunciation tip.
  * **Read aloud**: 🔊 *Hear it* (the en-GB TTS from `speech.js`, respecting the speed slider, plus 🐢 Slow), then 🎤 *Say it*. This uses `SpeechRecognition`/`webkitSpeechRecognition` (`en-GB`, interim results shown live, 3 alternatives). Scoring is a word-level alignment (LCS) after normalising: lowercase, no punctuation, digits → words, contractions expanded (I'm = I am, can't = cannot), US/UK spellings and split compounds accepted. A lost -s/-d ending is *not* forgiven. The best alternative wins. Each word turns green (heard) or pink (missed). Stars: ≥90% ⭐⭐⭐, ≥70% ⭐⭐, ≥50% ⭐ (a pass).
  * **Answer the question** (B1+): the learner gives their own sentence. It must contain the target words or structure (e.g. "If it rains" + "will", "On the one hand … on the other hand", "Admittedly … but"). Short answers are capped at 1 star. Found and missing keywords are ticked, and a model answer is shown.
  * Economy: 1⭐ per pass (once per prompt per round, retries are free), +2⭐ per crown at the end of a mic round, pet XP, pet reactions, and a new daily quest ("Finish an Echo Well speaking round"). Read-aloud sentences you didn't pass are planted in the 🌷 Mistake Garden as sentence-builder cards.
  * **Shadowing fallback**: if recognition is missing (Firefox, some Safari, headless) or the mic is blocked or fails, a friendly banner switches to listen → say it aloud → self-rate (😊 Nailed it / 🙂 Almost / 😅 Try again). This still pays 1⭐ per passed prompt, but there is no crown bonus and the most it can earn is 2 crowns. A blocked mic is remembered, and a *🎤 Try the microphone* button switches back.
* **Pets** (Puffbun, Mochi Fox, Minty, Hoot) cheer, bounce or droop with your answers. They have happiness and hunger (which change over real time), take snacks bought with stars, can be cuddled (rub them) or played with (tap-to-throw ball fetch), and level up from your correct answers. They evolve at Lv 5 (aura) and Lv 10 (crown).
* **Economy**: earn 1⭐ per correct answer, +1 combo bonus every 3 in a row, and crown bonuses. There are 3 daily quests (rotating pool of 12) and a 🔥 day streak. The shop sells avatar outfits, pet skins and UI themes.
* **Premium items**: the "Buy with cash" button calls the `PaymentHook` **stub** in `js/payments.js`. **No real payment exists yet.** The comments explain how to wire it to Stripe Checkout. `demoMode` allows a clearly labelled no-charge unlock for testing.
* **Progress** is saved in localStorage (`wordRealms.save.v1`). Older saves are migrated in place: they just gain `speaking` and `writing` stats blocks. A realm unlocks when you score ≥60% on 3 of the 4 skills in the previous realm. Onboarding lets a learner start at any level. ⚙️ Settings has Teacher mode (unlock all), sound and voice speed.
* **🌷 Mistake Garden (spaced review)**: every wrong answer is planted as a seed with the full question (options, audio, passage). "💧 Water the garden" runs an 8-question review round of the plants that are due, picking the most-missed and most-overdue first. A right answer grows the plant and pushes its next review out (seed → sprout in 1 day → bud in 3 days → nearly in 7 days → 🌸 bloomed, +2⭐ each); a wrong answer sends it back to a seed. The nav tab shows a badge with the number of thirsty plants, the map shows a nudge, and there's a new daily quest for finishing a review. Code is in `js/garden.js`; older saved mistakes without options become read-only tip cards.

* **🪞 The Magic Mirror (placement quiz)** (`js/placement.js`): an adaptive CEFR placement test offered in onboarding ("Not sure? Ask the Magic Mirror"), from the 🪞 pill on the map, and from ⚙️ Settings. Each level asks 4 riddles (2 grammar, 1 vocabulary, 1 listening, shuffled) and is passed with 3/4. It starts at B1, climbs after a pass, steps down after a fail, and stops once a passed level sits right below a failed one (usually 8–16 questions). The learner is placed in the first level they did *not* pass (the one they're ready to learn), or C2. It prefers items where the right answer isn't the uniquely longest option, and has an "I'm not sure" button to discourage guessing. The result shows a CEFR can-do statement and pays +5⭐ the first time. A retake can open more realms but never locks any. Saved as `state.placement`. Art: `assets/ui/mirror.png` (Grok Bot image generator).

* **⚖️ Fair Play distractors**: on 2026-10-30, 106 B1–C2 items were rewritten so the right answer is no longer a giveaway by length. The distractors are now full, plausible misreadings of the text. The share of items where the right answer is the uniquely longest option fell from 144/383 (38%) to 48/383 (13%); C2 listening went from 14/16 to 1/16 and the C1 debate from 8/8 to 2/8. `tools/build_data.py` now fails the build if any skill goes over 40% (`check_fair`). Screenshots: `screenshots/fairplay_*.png` (`node tools/test/fairplay_shots.js`).

* **✒️ The Story Quill (guided writing)** (`js/writing.js`, prompts in `tools/c_writing.py` → `data/<level>/writing.json`): a 6th, *bonus* skill tile in every realm. Like the Echo Well, it is **not** counted in the 3-of-4 unlock rule. There are **36 tasks** (6 per level), each modelled on a Cambridge English writing task type with a fairytale twist:
  | Level | Words | Task types |
  |---|---|---|
  | A1 | 20–30 | Starters/Movers/Flyers-style: write about yourself, your pet, your family or your favourite day, a club card, a note to the Tooth Fairy |
  | A2 | 25–45 | A2 Key Part 6 (email/note/postcard with 3 content points) and Part 7 (story from 3 pictures, 35+ words) |
  | B1 | 80–100 | B1 Preliminary Part 1 (reply to an email using 4 notes) and Part 2 (article, or a story with a given first line) |
  | B2 | 140–190 | B2 First Part 1 (essay with 2 notes + your own idea) and Part 2 (review, article, report, email of application) |
  | C1 | 220–260 | C1 Advanced Part 1 (essay: discuss TWO of three methods and say which is more important) and Part 2 (proposal, report, review, formal letter) |
  | C2 | 240–280 | C2 Proficiency Part 1 (essay summarising and evaluating two short texts) and Part 2 (formal letter, review, article) |

  Each task has a task card (plus the incoming email and notes, or the two source texts), 3–5 content points, a target word range, a language bank (the task's own phrases plus level linking words and functional phrases) and a model answer. `build_data.py` validates every task: ≥6 per level, word ranges, the model answer's word count, and every content point detected in the model answer.
  * **Flow**: 🗒️ *Plan* (optional notes; "Add the points as bullets"), then ✍️ *Write* (textarea with a live word count that is yellow when under the range, green when in it and pink when over; a live content-point checklist; tap a language-bank chip to insert it at the cursor with the `…` gap selected, so typing replaces it), then 🔮 *Check my writing*. Drafts (plan + text) save automatically per task.
  * **Feedback** on Cambridge's four assessment scales, 0–5 each, from transparent heuristics in JS (no external API):
    * *Content*: share of content points found (word-start keyword/synonym lists per point; "discuss TWO of three" points use keyword sets). Too short (under 85% of the minimum) or too long (over 125% of the maximum) loses a mark. Under half the minimum caps it at 1–2.
    * *Communicative Achievement*: genre conventions (greeting and sign-off for notes/emails/letters; past tense and the given first line for stories; title or reader question for articles; recommendation and evaluative adjectives for reviews; headings and a purpose statement for reports/proposals; conclusion and opinion for essays; references to both texts for C2 Part 1), register (contractions and slang in formal genres), and use of the language bank.
    * *Organisation*: paragraphs (B1 needs 2+, B2 3+, C1/C2 4+), variety of linking devices from a level list, sentence count, and a penalty for run-on sentences.
    * *Language*: lexical variety (moving-average type/token ratio), average sentence length within a level band, target structures by regex (A1 "I am/have/like", can, there is; A2 past simple, going to/will, comparatives; B1 present perfect, conditionals, past continuous, modals, relative clauses; B2 passive, non-defining relatives, unreal conditionals, modal perfects, -ing clauses; C1/C2 inversion, clefts, nominalisation, hedging, participle clauses, plus the formal subjunctive at C2), minus mechanical slips. A 5 needs (almost) slip-free writing.
    * *Relevance cap*: if Content is 0 the other scales are capped at 2 (at 3 if Content is 1), so an off-topic text can't score well.
    * *Mechanical checker*: capital letters at sentence starts, lowercase "i", repeated words ("the the"), missing final punctuation, unfilled `…` gaps, and a common-errors list ("he go", "I likes", "more better", "informations", "I am agree", "depend of", "discuss about", "explain me", "can to", "didn't wanted", "since 3 years", "much people", "would of", "alot", irregular past tense errors, a/an, text slang). Flagged spans are highlighted in the learner's text (tap one for the reason) and listed with a fix.
    * Up to 5 friendly, level-appropriate tips, then the model answer. Total /20 → crowns: 17+ 👑👑👑, 13+ 👑👑, 9+ 👑. A clear banner says it's a **practice estimate, not an official Cambridge mark**. All 36 model answers score 17–20 with zero false flags (checked in the test).
  * **Economy**: +1⭐ per crown the first time, and retries only pay for *new* crowns. Pet XP (more on a first try), pet reactions, a new daily quest ("Write a Story Quill task", +6⭐), the 🔥 streak, and the realm tile shows your best crowns and "x/6 tasks written". Grammar/spelling slips with a fix are corrected, and up to 2 corrected sentences (3–14 words) per check are planted in the 🌷 Mistake Garden as sentence-builder cards (✒️ icon).
  * **Save**: `state.writing = { checks, crowns, best: { <taskId>: { total, crowns, scales, at } }, drafts: { <taskId>: { plan, text, at } } }`. Older saves gain this block in place; a partial block is completed without losing data.
  * Art: `assets/ui/quill.png` (a magic quill, a glowing storybook and a tiny sparkle fairy; 420 px, transparent), painted with Grok Bot's image generator, **not Higgsfield**. The earlier flat SVG version is kept as `assets/ui/quill.svg` / `quill_svg_backup.png`.

## Art
All 13 manifest images (4 pets, 3 avatars, 6 realm backgrounds) were made with Grok Bot's built-in image generator, **not Higgsfield**. They are saved at the manifest `path`s, character backgrounds were made transparent, and backgrounds have `thumb` JPGs for the map. If a PNG is missing, the game falls back to the SVG placeholders.

## Tests
`tools/test/e2e.js`, `tools/test/shots.js`, `tools/test/placement.js` (staircase logic, simulated A1/B1/C2 learners, onboarding and retake paths, mobile) and `tools/test/garden.js` (spaced review: plant, water, simulate days, bloom, reset on a miss) (playwright-core + system Chrome) cover onboarding, a lesson in every skill, the specials, the pet, the shop and the cash stub.
`tools/test/speaking.js` mocks `webkitSpeechRecognition` with `addInitScript` and checks:
* save migration and the scoring rules (contractions, numbers, spellings, compounds, a dropped -s, keywords, best alternative, star thresholds)
* a perfect transcript (all words green, 3 stars, +1⭐, retries don't pay twice) and a partial one (green and pink words, fewer stars, pet reaction)
* a missed sentence being planted in the garden and reviewed there
* progress and crowns, with no change to unlocking
* a C2 long sentence and an answer-the-question prompt
* mic-denied → shadowing, and no-recognition → shadowing with self-rating
* the 390×844 mobile layout (no horizontal overflow)
* no console errors

`tools/test/writing.js` (Story Quill) checks:
* save migration (old save with no `writing` block; partial block completed)
* the scoring heuristics: all 36 model answers get 3 crowns with no false flags; a strong B1 email gets full Content; off-topic and too-short emails get low Content and no crowns; an error-ridden email gets each common error flagged, plus capital-letter and punctuation flags, and low Language
* the A1 flow (plan bullets, live word count and checklist, language-bank insert, draft saved, feedback with 4 scales, model answer and the "practice estimate" note, +1⭐ per crown, pet XP and reaction, a retry pays nothing, daily quest claim, unlocking unchanged)
* corrected sentences planted in the garden
* the C1 essay flow with highlighted errors
* the 390×844 mobile layout at every step
* no console errors

Screenshots: `screenshots/writing_*.png`.

Run every test with the game served on port 18642 (`python3 -m http.server 18642`): `node tools/test/<name>.js`. Screenshots are in `screenshots/` (`speaking_*.png` for the Echo Well; `speaking_00_montage.png` is a 2×2 overview).
