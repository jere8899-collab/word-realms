# 🦁 Singapore School English: plan (P1 → JC → Grown-up)

Jeremy's request (2026-11-02): "have the English in a local version as well, such as primary 1-6, secondary 1-4 … including for jc as well", plus adult levels for the higher end.

**Stage 1 (live):** a second English track next to the fairy realms (A1–C2). On the home map, the tabs **🏰 Fairy realms | 🦁 Singapore** switch between them. The Singapore track has 13 levels, each with its own hub of games, crowns and Continue card, just like Number Kingdom's Grade 1–12. Onboarding has a "🦁 In a Singapore school? Pick your level" list.
Code: `js/sg-english.js`, `css/sg.css`, content `tools/sg_synth.py`, `tools/sg_edit.py`, `tools/sg_cloze.py` → `tools/sg_build.py` → `data/sg/<level>.json` (built by `tools/build_data.py`). Test: `tools/test/sgenglish.js`.

## How it works
- Each level is a *pseudo-realm* `sg-<level>` in `WR.extraRealms`, so the shared lesson engine handles stars, anti-farm, the Word Garden, pet XP and quests unchanged. An item already answered in a fairy realm pays no stars again, by design.
- A round mixes the CEFR banks by weight (e.g. P5 = A2 + B1) with Singapore-style items written for that level. Every level is playable now.
- Progress lives in the save block `sg` (track, level, best per game, rounds). It is crowned, so it counts in the Cloud Castle score. Old saves are migrated automatically.
- 🎤 Echo Well and ✒️ Story Quill open on the level's main realm and come back to the hub (`WR.from` / `WR.toRealm`).
- There are three new typed question types in `js/lesson.js`: `typed` (🔗 Join It Up), `fix` (🔍 Spot & Fix) and `fill` (🧩 Story Gaps).
  - Every answer gets a why-not note, and there's a "so close" note for near-misses.
  - Some answers are a friendly nudge rather than a try: an empty box, only the given words, a missing key word, the mistake retyped, or two words in a one-word gap.
  - Narrator audio uses Kokoro af_heart (the two sentences, the model sentence and the whole text), with the device voice as fallback.
  - Answer boxes have no autocorrect (`WR.noAssist`).

## Level map
| Level | CEFR (approx.) | Rounds come from | Main realm (speak/write) | Singapore games now |
|---|---|---|---|---|
| P1 | ~A1 | A1 | A1 | Spot & Fix (spelling + grammar), grammar, vocab, reading, listening, speak, write |
| P2 | ~A1 | A1 ×3 : A2 ×1 | A1 | + Join It Up |
| P3 | ~A2 | A2 ×3 : A1 ×1 | A2 | + Story Gaps |
| P4 | ~A2 | A2 | A2 | all |
| P5 | ~A2+/B1 | A2 + B1 | B1 | all |
| P6 (PSLE) | ~B1 | B1 ×3 : A2 ×1 | B1 | all |
| Sec 1 | ~B1 | B1 | B1 | all (Spot & Fix = 1 text + find-the-mistake sentences) |
| Sec 2 | ~B1/B1+ | B1 ×3 : B2 ×1 | B1 | all |
| Sec 3 | ~B1+/B2 | B2 ×3 : B1 ×1 | B2 | Spot & Fix (O-Level style editing), grammar, vocab, reading, listening, speak, write |
| Sec 4/5 (O-Level / N(A)) | ~B2 | B2 | B2 | as Sec 3 |
| JC 1 | ~B2+/C1 | B2 + C1 | C1 | edit = find-the-mistake sentences; reading, listening, speak, write (GP-style later) |
| JC 2 | ~C1 | C1 | C1 | as JC 1 |
| Grown-up | ~C1/C2 | C1 + C2 | C2 | as JC 1 |

## Syllabus components (what each game stands in for)
- **PSLE English (0001, from 2025).**
  - Paper 1 Writing (50): situational 14, continuous 36.
  - Paper 2 Language Use & Comprehension (90):
    - Booklet A: grammar MCQ 10, vocab MCQ 5, vocab cloze 5, visual text 5.
    - Booklet B: grammar cloze 10, editing 10 (5 spelling + 5 grammar), comprehension cloze 15, synthesis & transformation 10 (5 × 2 marks, all or nothing), comprehension open-ended 20.
  - Paper 3 Listening (20).
  - Paper 4 Oral (40): reading aloud 15, stimulus-based conversation 25.
  - → grammar / vocab = Booklet A MCQ; 🔍 Spot & Fix = editing; 🧩 Story Gaps = comprehension cloze; 🔗 Join It Up = synthesis & transformation; reading = comprehension; listening = Paper 3; Echo Well = reading aloud + conversation; Story Quill = writing.
- **O-Level English (1184, to 2026).**
  - P1 Writing: editing 10, situational 30, continuous 30.
  - P2 Comprehension: visual text 5, narrative 20, non-narrative 25 incl. summary.
  - P3 Listening: 30 incl. note-taking.
  - P4 Oral: planned response + spoken interaction.
  - SEC exams replace O-Levels for the 2024 Sec 1 cohort (from 2027).
- **H1 General Paper (8881).**
  - Paper 1: one essay of 500–800 words from 8 questions.
  - Paper 2: 3 passages, summary 8, connections across passages, application question 12.

The exam names appear only in the 👪 For grown-ups note on each hub. Children see the friendly game names.

## Content counts (stage 1)
| Level | Join It Up | Spot & Fix words | Story Gaps |
|---|---|---|---|
| P1 | – | 10 | – |
| P2 | 10 | 15 | – |
| P3 | 12 | 18 | 16 |
| P4 | 12 | 24 | 20 |
| P5 | 14 | 23 | 25 |
| P6 | 14 | 24 | 25 |
| Sec 1 | 8 | 12 | 15 |
| Sec 2 | 8 | 12 | 15 |
| Sec 3 | – | 12 | – |
| Sec 4/5 | – | 12 | – |
| JC / Grown-up | – (CEFR C1/C2 banks) | – | – |

Total: 356 Singapore items. The levels also draw on the 3,643 CEFR questions, 360 speaking prompts and 90 writing tasks.

**Targets for the next waves:** ≥ 20 Join It Up for each of P4–Sec 2, ≥ 8 edit texts per level and ≥ 8 cloze texts for each of P3–Sec 2.

## Later stages (remaining content list; the routine continues these)
1. **More PSLE content:**
   - more texts per level (targets above);
   - grammar cloze with a word box (Booklet B);
   - vocab cloze (Booklet A);
   - visual text comprehension (posters/flyers; needs GenerateImage art);
   - open-ended comprehension with typed answers and marking keywords.
2. **O-Level / SEC (Sec 3–4/5):**
   - situational writing prompts (emails, reports, speeches; 250–350 words) and continuous writing (350–500 words) in Story Quill, with SG rubric notes for grown-ups;
   - visual text;
   - narrative and non-narrative comprehension, with an 80-word summary task scored on content points;
   - note-taking listening;
   - planned response (oral) on a short video/picture stimulus;
   - Sec 3–4 Join It Up review.
3. **JC General Paper:**
   - essay prompts (500–800 words; mature but respectful topics: technology, environment, media, arts, science and ethics, Singapore society), with a planning scaffold and model paragraphs;
   - Paper 2-style passages with comprehension, an 8-mark summary, connections across passages and the 12-mark application question;
   - GP vocabulary sets.
4. **Grown-up learners:**
   - workplace and civic English (formal emails, reports, meetings), C1/C2 idiom and register;
   - Singapore Standard English vs Singlish awareness (respectful, positive).
5. **Oral:** Singapore stimulus photos (hawker centre, MRT, HDB void deck, school canteen, festivals) as new GenerateImage art for stimulus-based conversation at P3–Sec 4.
6. **Reports:** Singapore rows in the parent report (crowns per level and game, weakest game).
7. **Placement:** an optional "Which school level fits?" check that suggests a level.
8. **Art:** a `bg_sg` hub picture (chibi Singapore skyline with a friendly Merlion), via GenerateImage only.
