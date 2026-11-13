# Word Realms: Interactive Lessons plan (📜 Learn)

**Phase 1 (plan + engine + pilot): ✅ done (commit 1d135e5, 2026-11-04).** EN-2 + MA-2 ✅ (f4ee083). The 2-hourly routine may now take the next batch (§5: EN-3, then MA-3).

> Checkpoint 2026-11-13 ~09:30 SGT: EN-5b is live (cf59da2, build wr-6557af16f69c; Pages run 43344578484 succeeded, lesson_en_b1_cond1.jpg, cond2.jpg, passive.jpg and data/lessons/en-b1.json return 200 live): en.b1.cond1 (fill if + present / will on Lily's rainy forest path; re-teach "the weather card" + sort right/needs fixing; East Coast Park, the MRT, saving S$), en.b1.cond2 (sort could really happen / only a dream by will vs would; re-teach "two bubbles" + fill had/would/were/lived; If I were you advice), en.b1.passive (fill the cake was eaten / by Puffbun; re-teach "the spotlight" + sort doer first / thing first). Added to tools/lessons/en_b1.py; no new widget, no typing boxes. Cleanup kept (ac64e7a, its own commit): shared SORT_HOW / FILL_HOW prompt endings in en_b1.py (lesson JSON byte-identical, lessons.js 332/332 before the feature). 3 GenerateImage hooks (painted by the parent run, no text) installed with install_story_img.py --dir lessons --batch. Hint links: cond1 ← "first conditional / if + present, will" (13 B1 items), cond2 ← "second conditional / imaginary present / If I were you" (4), passive ← "passive" (16). 79 lessons; build_voice 5744 lines (40 new af_heart), 0 to record. lessons.js 341/341 (MIN_LESSONS 79); screenshots/en5b_check.js 14/14 at 320/360/375/390/412 px + 740×360 and 915×412, local and live. Full suite: all pass alone except mathgoals, play-again and story, which fail the same way on the already-published main build (not caused by this batch, likely date-dependent). en.b1.relative is left for the next English turn: EN-5c. Next maths turn: MA-5b.

> Checkpoint 2026-11-12 ~21:35 SGT: MA-5a is live (3b8f1ef, build wr-f0b4c41c2c16; Pages run 43227593514 succeeded, lesson_m_g4_factors.jpg and data/lessons/m-g4.json return 200 live): the first Grade 4 (P4) Abacus Orchard lessons. m.g4.factors (groups: 12 apples in 3 rows of 4 → factors, multiples and factor pairs; re-teach "the no-leftovers test" + sort factor / not a factor of 12), m.g4.fracset (share 12 cupcakes onto 4 plates → ¼ and ¾ of 12; re-teach the bar model + fill thirds of 15), m.g4.round (sort balls on the number-line hill between the 40 and 50 cottages, halfway rolls up; re-teach "the neighbour digit" + fill to the nearest 100). New pack tools/lessons/m_g4.py (m-g4). No new widget. Cleanup kept: KIT.groups works out its skip-count totals once (`runs`), shared by the ring labels and the done line (behaviour identical). 3 GenerateImage hooks (painted by the parent run, no text) installed with install_story_img.py --dir lessons --batch. Hint links come from the g4.factors / g4.fracset / g4.round practice topics. 76 lessons; build_voice 5704 lines (40 new af_heart), 0 to record. lessons.js 332/332 (MIN_LESSONS 76, 320–412 px audit); MA-5a re-teach/check2/why-not/scroll check 320/360/375/390/412 px + 740×360 and 915×412 landscape ALL OK, local and live 14/14. Full suite 108: all pass; beyond, garden, gatelock, review-engine, pwa, parentgate, pin, r20d_shots, smallphones passed on a rerun alone; toasts and doubletap kept hitting the known first-visit race (the seeded save is overwritten, the name screen shows) in their setup, and passed 21/21 and 54/54 with a seed-and-reload retry in a throwaway copy (the race also happens on an older main build: 4 of 14 cold pages). Next maths turn: MA-5b (rest of G4: longmul, longdiv, fracadd, decimal …). Next English turn: EN-5b.

> Checkpoint 2026-11-12 ~15:20 SGT: EN-5a is live (2a9eda2, build wr-fa89d4195a66; Pages run 43174148981 succeeded, lesson_en_b1_ppever.jpg returns 200 live): the first B1 Whispering Forest lessons. en.b1.ppever (fill ever/never/just/already/yet in Lily's explorer book; re-teach "the clock that points at now" + sort right/needs fixing), en.b1.ppvsps (sort time words: finished time → did, up to now → have done; re-teach "closed box / open box" + fill went/have been/baked/has baked, Singapore places), en.b1.pastcont (the `line` ladder as a timeline: Lily was reading … when Puffbun jumped out; re-teach "movie and pop-up" + fill). New pack tools/lessons/en_b1.py (en-b1, found by lesson_build's glob like en_a2). 3 GenerateImage hooks (painted by the parent run, no text) installed with install_story_img.py --dir lessons --batch (960×720 jpg + webp). Hint links: ppever ← "present perfect with ever / for experience" items, ppvsps ← "present perfect for a period / past simple with a finished time", pastcont ← "past continuous" items (grammar + listening). Cleanup kept: `cardPool()` helper in js/learn.js (the shuffled card pile shared by sort and line; HTML byte-identical for all 42 existing sort/line widgets). 73 lessons; build_voice 5662 lines (41 new af_heart), 0 to record. lessons.js 323/323 (MIN_LESSONS 73, 320–412 px audit); EN-5a re-teach/check2/why-not/scroll check 320/360/375/390/412 px + landscape ALL OK. Full suite 108: all pass (firstload, c2types, icons, mathbubble, maths-review, pin, tinybits timed out in the parallel run and passed alone; cloud, lightart, parentgate, pwa run one at a time). Next English turn: EN-5b (cond1, cond2, passive, relative). Next maths turn: G4.

> Checkpoint 2026-11-12 ~09:45 SGT: EN-4e + MA-4c are live (2886e1d, build wr-b1bcfbd14af3; Pages run 43133628298 succeeded, new hook art returns 200 live). Built by the 2026-11-11 3 PM (EN-4e) and 9 PM (MA-4c) runs, which stopped before committing; this run re-tested and published them. EN-4e: en.a2.sequence (first/then/finally on the `line` ladder), en.a2.pronref (who is "she"? findword), en.a2.prices (hear times and S$ prices, hearpic). MA-4c: m.g3.lines (sort parallel/perpendicular with drawn line pairs, `pic` on sort cards, validated by lesson_build), m.g3.bargraph (new `bargraph` widget: bars on a scale of 2/5/10), m.g3.story (new `units` bar-model widget for × and ÷ stories). Cleanup kept: `lockAll()` helper in js/learn.js (replaces repeated disable-all-buttons code; place value now uses nextTarget()). 6 GenerateImage hooks (checked: no stray text). 70 lessons; build_voice 5621 lines, 0 to record. lessons.js 314/314 (MIN_LESSONS 70, 320–412 px audit). Full suite 108: all pass (garden, doubletap, mathbubble, review-engine, rename, shots, smallphones flaked in the parallel run and passed alone; story-voices timed out in parallel and passed alone 36/36). Next English turn: B1 (A2 list done). Next maths turn: G4.

> Checkpoint 2026-11-11 ~09:30 SGT: EN-4d is live (94fbec6, build wr-54ebeb7d2fab), built by the 2026-11-10 ~21:45 SGT run, which stopped before publishing; merged onto main on top of Task 11 (PR #4) and published 2026-11-11: en.a2.poss_s (suffix stamp 's on the owner, with the thing after it via the new optional `post` field: Mia + 's + bag; re-teach "name tag" + sort right/needs fixing), en.a2.link (fill and/but/so/because on Puffbun's picnic postcard; re-teach "opposite arrows" + sort so/because), en.a2.makedo (sort make/do in Crumb's kitchen; re-teach "can you hold it at the end?" + fill), en.a2.shop (sort fruit/vegetables/bakery at Crumb's market stall; re-teach "where does it come from?" tree/ground/cow-or-hen; How much…? with prices in Singapore dollars, written \\$2.50 in the pack and shown as $2.50); 64 lessons. 4 GenerateImage hooks (painted by the parent run) installed with install_story_img.py --dir lessons --batch. Cleanup kept (behaviour identical: lesson JSON byte-identical and every old suffix widget renders the same HTML before the new content; lessons.js 275/275): `stampWord()` in js/learn.js. Fix found by this run: in 3-basket rows a painted icon was glued to a long one-word label (vegetables, bakery; also the old hungry, What?, length, Take away), so the label ran out of the basket at 320–412 px; the icon now sits on its own line, "vegetables" has a soft hyphen, and the lessons.js phone audit now checks basket labels. lessons.js fresh() reseeds and reloads when the known first-visit race shows the name screen (it happens about 1 in 10 cold pages on origin/main too). Hint links: poss_s ← Whose…? items, link ← but/because/so items, makedo ← make/do collocations (not have a picnic / take a photo), shop ← bakery and vegetable items. 57 af_heart lines. lessons.js 287/287 (MIN_LESSONS 64); EN-4d check 320/360/375/412 px + landscape ALL OK. Next English turn: EN-4e (en.a2.sequence, en.a2.pronref, en.a2.prices). Next maths turn: unchanged (rest of G3, then G4).

> Checkpoint 2026-11-10 ~15:45 SGT: MA-4b is live (606b2ab, build wr-b24e75f707b3): m.g3.measure, m.g3.duration, m.g3.clock, m.g3.perim (new `fence` widget; tapStages() cleanup); 60 lessons. Built by the 9 AM run, which stopped before publishing; this run re-tested and published it. lessons.js 275/275; full suite passes except learn-review (known first-visit race); mathgoals and rename flaked in the parallel run and pass alone. Next maths turn: the rest of G3 (m.g3.lines and any unticked G3 rows), then G4. Next English turn: EN-4d (poss_s, link, makedo, shop).

> Checkpoint 2026-11-09 ~22:15 SGT: EN-4c is live (a0d2c05, build wr-07ee1db8582b): en.a2.freq (new KIT.line ladder: put always/usually/often/sometimes/never on steps of 7/6/4/2/0 stars; re-teach "juice glass" + fill by days), en.a2.must (sort playground signs must/mustn't; re-teach traffic lights + fill has to/mustn't/don't have to), en.a2.should (fill should/shouldn't for Puffbun's cold; re-teach "whispered tip" + sort right/needs fixing), en.a2.objpron (fill me/him/her/them for Gumdrop's presents; re-teach "twins" + sort right/needs fixing); 56 lessons. 4 GenerateImage hooks (painted by the parent run) installed with install_story_img.py --dir lessons --batch. New widget `line`: tap or drag, 54 px steps, in the lessons.js tap/drag tests and the 320–412 px audit; lesson_build validates ends, 3–6 words and counting-down stars. Cleanup kept (behaviour identical, lesson JSON byte-identical before the new content): `land()` in js/learn.js (sort + line), `need_why()` in lesson_build (sort, fill, suffix, spellhear, line). 54 new af_heart lines (the freq hook was re-recorded once after a wording fix). lessons.js 256/256 (MIN_LESSONS 56); EN-4c check 320/360/375/412 px + landscape ALL OK. Full suite 104: all pass alone except learn-review, which fails the same way on origin/main 66c42ae (known first-visit race). No a2 practice item uses object pronouns yet, so objpron's hint links wait for future items. Next English turn: EN-4d (poss_s, link, makedo, shop).

> Checkpoint 2026-11-09 ~15:35 SGT: MA-4a is live (cae1432, build wr-b5a94a37c218): m.g3.times (groups 3×7), m.g3.divrem (share 14÷3 with a dashed "left over" pile; 🃏 Deal says "not enough for one more each"), m.g3.add4 (fill, column method), m.g3.mul (fill, split), m.g3.eqfrac (frac bar 1/2=2/4=4/8); 52 lessons. 5 GenerateImage hooks painted by the parent run (this executor had no GenerateImage) and installed with install_story_img.py --dir lessons --batch; add4/mul alt text matched to the art. Cleanup kept: `itemChip()` in js/learn.js (behaviour identical); lesson_build reads `4 r 2` as "4 remainder 2", validates groups and share rem. 75 af_heart lines from the stash (build_voice: 0 to record). lessons.js 242/242 (MIN_LESSONS 52); full suite 102/106 first pass, maths-review/toasts/story-voices pass alone; learn-review fails the same way on origin/main b929910 (known first-visit race). MA-4a check 320/360/412 px local + live ALL OK (live 61/61, no console errors). Next maths turn: MA-4b (rest of G3).

> Checkpoint 2026-11-08 ~22:00 SGT: EN-4b is live (d06b436, build wr-09ef709bb3a9): en.a2.goingto (fill; re-teach sort "plan train"), en.a2.will (sort promise/guess; re-teach fill will/won't), en.a2.someany (sort; re-teach fill), en.a2.muchmany (sort; re-teach fill "number test"); 47 lessons. 4 GenerateImage hooks installed with install_story_img.py --dir lessons --batch (replaces the 20:40 ⏸️ art block). Draft _en_a2b.py merged into en_a2.py and deleted. Cleanup kept: `shuffled()` helper in js/learn.js (sort cards, hearpic pictures, spellhear letters; behaviour identical); en_a2.py header rewritten. 54 af_heart lines (build_voice: 0 to record). lessons.js 227/227 (MIN_LESSONS 47); en4b check 320/360/412 px local + live ALL OK; story-voices 36/36. Known SW/WR first-visit flakes fail the same on origin/main e757c70 (learn-review, maths-levels, petlayers, triggraph, lightart; review-engine passes on some runs). origin/main had not moved, so no 3-way merge was needed. Next English turn: EN-4c (freq, must, should, objpron). Next maths turn: MA-4a (G3 first: times, divrem, add4, mul, eqfrac).

> Checkpoint 2026-11-08 ~18:50 SGT: MA-3b is live (ce08a78, build wr-db8c8c28cbc4): m.g1.money, m.g1.time, m.g1.picgraph, m.g1.story; 43 lessons. GenerateImage hooks installed. Cleanup: rewrote the stale m_g1.py DRAFT header; extracted nextTarget() for money+clock; money paint uses the COINS class letter; shared coin CSS variables. Optional cents display (w.cents) so G1 shows 25¢ while G2 still shows $1.25. lessons.js 215/215. Next English turn: EN-4b (goingto, will, someany, …).
>
> Checkpoint 2026-11-08 ~16:45 SGT: EN-4a is live (cb42f3a, build wr-b3eff5f448a6): en.a2.ed, en.a2.irreg, en.a2.comp, en.a2.super; 39 lessons. It was merged onto origin/main so Storybook Nova and the lighter first visit stay (js/learn.js 3-way merge; voice manifest +52 narrator lines, none dropped). lessons.js 203/203 (one sub-pixel 43.99 px flake on the 📜 corner button, now rounded in the test). Since the first-visit loader waits for the service worker, review-engine, petlayers, tangent, circles, lightart and learn-review can race on a cold page (WR not ready yet). They fail the same way on origin/main and pass with the worker wait skipped, so the test harness needs a "wait for WR" fix. Next English turn: the rest of A2 (goingto, will, someany, …). Next math turn: still MA-3b.
>
> Checkpoint 2026-11-08 ~14:45 SGT (EN-4a blocked on art): **GenerateImage unavailable** this run (cursor tool missing; only Higgsfield, which is not allowed), so no hook art and no deploy. Done: draft pack `tools/lessons/_en_a2.py` (en.a2.ed, en.a2.irreg, en.a2.comp, en.a2.super; hint-link `match` regexes checked against data/a2 explains). `KIT.suffix` gained optional per-word `cut`/`add` (stop → stop+ped, happy → happ+ier, nice → nice+r), validated in lesson_build; the finished "no stamp" label now names the stamp (✓ no ing / ed / er; plural still "✓ no s"). Cleanup: `settle()` helper replaces 3 copies of the lock-a-placed-piece code (sort, suffix, bar). Tested in a scratch copy with throwaway test art: lessons.js 203/203 (39 lessons, 320–412 audit, every line has an MP3 after build_voice), re-teach path for all 4 passes; screens `screenshots/lessons_en4a_*.png`. Working copy full suite 100/102 first pass; rename passed on rerun; lessons.js "maths round: pet bubble … no sideways scroll" fails at a random width (375/390 px) on the LIVE code too, so it was already flaky and is not caused by this change. js/learn.js, css/learn.css, tools/lesson_build.py and the draft are in the working copy only, so the deploy checkout differs on purpose. Left: paint 4 hooks (lesson_en_a2_ed/irreg/comp/super) → install → rename `_en_a2.py` → `en_a2.py` → build_voice (≈54 lines) → raise MIN_LESSONS to 39 → tests → deploy.
>
> Checkpoint 2026-11-08 ~12:50 SGT: the 2026-11-05 run stopped before committing, so the first 5 G1 lessons were not live until now. Shipped with a narrator fix (□ → "what number" in `speak()`), the 512 px app icon moved out of the first-visit precache (lightload 2.01 → 1.87 MB) and lightart counting each picture once. Next math turn: MA-3b.
> Checkpoint 2026-11-05 ~18:20 SGT (MA-3 first 5 built): GenerateImage hooks installed for count/add20/sub20/bonds/shapes; pack renamed `tools/lessons/m_g1.py`; 35 lessons in index; narrator voice recorded (76 new af_heart lines); shapecount widget shipped earlier. Remaining G1: money/time/picgraph/story.
>
> Checkpoint 2026-11-05 ~18:10 SGT (MA-3 blocked on art): scoped cleanup in `js/learn.js` (`later` / `saySoon` helpers for multi-stage widgets). New kit widget `shapecount` (tap sides/corners; CSS + lesson_build validation + lessons.js `__solve`). Draft pack `tools/lessons/_m_g1.py` has all 5 G1 lessons (count/add20/sub20/bonds/shapes) ready to rename to `m_g1.py`. **GenerateImage unavailable** this run (cursor tool missing) — STOP art, no Pillow/Higgsfield stand-ins, no deploy. EN-3 commit filled: 342673e. Left: paint 5 hooks → install → rename pack → voice → tests → deploy; then the other 4 G1 lessons (money/time/picgraph/story).
>
> Checkpoint 2026-11-05 ~10:00 SGT (EN-3 complete 8/8): shipped `en.a1.detail` (findword), `en.a1.listennum` (spellhear), `en.a1.keyword` (hearpic) + the earlier 5. Three new widgets in `js/learn.js` / `css/learn.css`. All 8 EN-3 hook arts are GenerateImage paintings (Pillow stand-ins replaced). A1 English now 20/20. lessons.js + full suite green this run. Deploy commit filled in §5.
>
> Checkpoint 2026-11-05 04:00 SGT (EN-3 partial): shipped 5/8 — `en.a1.ing`, `en.a1.waswere`, `en.a1.place2` (new `park` spots scene: nextto/behind/front), `en.a1.timeprep`, `en.a1.feel`. Left for later: detail, listennum, keyword (need new widgets). Cleanup: TOKEN_NAME map for spots tokens; park scene wired in learn.js / learn.css / lesson_build SCENES. Art: Pillow pastel stand-ins (GenerateImage unavailable this run — NOT sprite cutouts; need GenerateImage repaint). lessons.js 167/167.
>
> Checkpoint 2026-11-04 15:20 SGT (takeover of two interrupted runs): EN-2's 7 hook pictures were Pillow cut-out composites and MA-2's 5 were copies of lesson_m_g2_add; all 12 repainted with GenerateImage and installed. `lesson_build.speak()` now reads \$1.25 as "1 dollar and 25 cents" and 10¢ coin as "10 cent coin" (14 lines re-recorded, af_heart). lessons.js 150/150; full suite 91/91 (doubletap flaked once on server load, passes on rerun). Screens: screenshots/lessons_en2_*.png, lessons_ma2_*.png.
>
> Checkpoint 2026-11-04 08:55 SGT: engine `js/learn.js` + `css/learn.css`, 10 pilot lessons (data/lessons), 10 GenerateImage hook pictures, all lines recorded (af_heart), `tools/test/lessons.js` 109/109 pass. Full suite green after fixing homeshort / icons / n3n5layout / realmpath / tappable / lightart regressions (corner badge, painted 🎒 icon, no home pill on phones). Deployed as 1d135e5.

Jeremy asked for this on 2026-11-04 (t40u, then "Build the pilot track for all, take your time and do it slowly but thoroughly"). He wants proper lessons before practice, so children are taught a little first and then practise right away. The lessons should be fun, hands-on and intriguing, and they should cover **every track**:
- English CEFR A1–C2
- 🦁 Singapore English P1 → Grown-up
- Maths Grades 1–12 (MOE)

---

## 1. What a lesson is (the design every batch follows)

A lesson takes **2–3 minutes** and teaches **one idea**. It has seven steps, run by the shared engine `js/learn.js`:

| # | Step | What happens | Rules |
|---|---|---|---|
| 1 | 🎬 **Story hook** | A painted chibi scene from the realm, plus one line about a small problem. Example: "Crumb's bakery sign says *a apple pie*!" The narrator reads it. | One short paragraph. Use a realm character (Puffbun, Hoot, Crumb, Sumi, Gumdrop, Mog…). Use the painted art `assets/lessons/<art>.jpg` (made with GenerateImage only). |
| 2 | 🖐️ **Discover** | Hands-on. The child drags, taps or builds something **within the first 30 s**, *before* being told the rule. | One widget from the kit below. Every drag also works by tap. Targets are at least 44 px. It must fit 320–412 px phones. Wrong moves bounce back with a gentle why line. After 2 misses the widget's hint shows. |
| 3 | 💡 **Rule reveal** | "You found it!" Then the rule in one or two child sentences, plus 2–4 examples. | Use child words, not grammar jargon (jargon goes in the 👪 grown-up note). The narrator reads it. |
| 4 | ✏️ **Your turn** | 3 quick questions, one try each. | Every wrong option has its own **why-not note** (validated). Every question has a short explanation. |
| 5 | 🌈 **Re-teach** | Shown only if the child got fewer than 2 of 3. The same idea is explained **a different way** (another picture, a trick, a mini widget), then 3 **new** questions. | A different explanation, not the same text again. The mini widget is optional but recommended. |
| 6 | 📜 **Scroll** | The lesson becomes a **Lesson Scroll** in the 🎒 Backpack, to reopen any time. It shows the rule, examples, art, 🔊 Hear it and ▶ Replay. | The scroll is saved even if the child struggled (it's a revision note). |
| 7 | ⭐ **Reward + next** | **+5⭐ the first time the child passes** (2 or more of 3, on either try). Replays pay **0⭐**, with a kind note. Then "▶ Practise now" opens the matching practice round. | `WR.awardStars("learn", id + "/pass", 5, { kind: "fresh" })` pays once ever. Check answers never pay item stars. |

**Where lessons sit.** Lessons sit *inside* the existing nodes, never as new home tiles.
- Each English skill card in a realm (Grammar, Vocabulary, Reading, Listening) gets a round **📜** badge in its top corner (46 px, a ✨ / n/3 / ✓ dot; it adds no height, so the 4 skills still fit the first phone screen). With one lesson it opens it; with several it opens a small list.
- Each maths topic card gets a 📜 Learn chip too.
- The 🎒 Backpack (Lesson Scrolls shelf) opens from a 🎒 n/10 pill on the realm screen and the Number Kingdom hub, from the end of every lesson, and from a home greeting pill on screens 600 px and wider (phones keep their 2 short home pills, N4). The 🎒 icon is a GenerateImage painting cut out like the other icons (`tools/icons/sheets/backpack.jpg` → `assets/icons/backpack.webp`).

**Soft nudge, no hard lock (decision).** Practice rounds stay playable without the lesson, for three reasons:
- Older and returning players, and children placed by the Magic Mirror, already know much of the content.
- Locking would also break every existing save and the Continue card.

The nudges are:
- a glowing ✨ "New" on the Learn chip;
- on a practice result under 60%, a "📜 Learn it in 2 minutes" button, if that skill or topic has an unfinished lesson;
- the hint links below.

**Hint links.**
- **Maths:** the 💡 Hint panel (and the hint shown after a first wrong answer) carries a "📜 Scroll: <title>" button for the topic's lesson.
- **English:** questions that match a lesson's `match` rule get a small 📜 button in the question card's corner (not in boss or dragon timer rounds), and a scroll link under the why-not note.
- Either way, the scroll opens as a pop-up, so the round is not lost.

**Grown-ups.** ⚙️ → 👪 Grown-ups → 📊 Learning Report has a **📜 Lessons** card. It shows each lesson's status:
- ✅ learned (best check n/3)
- 🔁 learned after the second explanation
- 🧩 still tricky (failed both checks; sit together)
- ○ not started

The Grown-ups pop-up shows a one-line summary.

**Save (cloud-synced).** The progress lives in `wordRealms.save.v1` → `state.learn`, a `BLOCKS` entry in `js/core.js`. It is crowned, so it counts in the Cloud Castle progress score:
```
learn = { done: { "en.a1.an": { crowns: 0–3, best: 0–3, pass: bool, tries, reteach: times re-taught, stuck: bool, at, first,
                                first1: passed without the re-teach the first time it was passed } },
          opened: { "en.a1.an": n }, rounds: n }
```
A lesson's first finish counts once in `lessonsDone` and today's log (`WR.activityDone(true)`); replays only keep the streak (`WR.activityDone(false)`). Check answers go to the report tally as `learn:<id>` (no stars, no `totalAnswered`).

**Phase 1 build notes (how the engine is wired).**
- `js/learn.js` (`WR.Learn`, loaded before `js/main.js`) wraps `WR.init` to load `data/lessons/index.json`; packs load on first open. Screens: `learn` (a focus screen in `js/ux.js`, so the tab bar hides and Back asks "Leave this lesson?") and `scrolls` (the 🎒 Backpack). `WR.stopLearn` is in main.js `STOPS`.
- Chips: `WR.Learn.chipHTML(list)` inside `skillCard()` (main.js) and `topicCard()` (math.js), both small clean-up helpers that replaced inline markup; `WR.Learn.bindChips(root, back)` (the chip stops the card's own tap).
- Hint links: `WR.Learn.forItem(rid, item)` (English, by `match`), `WR.Learn.forTopic(topic)` (maths); `WR.Learn.scrollBtn(lesson)`; any `[data-scroll]` button opens the scroll modal (one capturing listener).
- Nudge: `WR.Learn.nudgeHTML(WR.Learn.nudgeFor(list))` on lesson.js / math.js results under 60%.
- Grown-ups: `WR.Learn.grownLine()` in the Grown-ups pop-up; the report draws every function in `WR.reportCards` (new hook in js/report.js) and lessons register `WR.Learn.reportCard`.
- One list of "finished round" selectors, `WR.ROUND_DONE` (core.js), now feeds both the held-toast rule and the Back button (`.ln-done` added).
- Narration: each step auto-reads its line when sound is on (`settings.sound`), and every line has a 🔊 button; the spots and fraction widgets read each task as it comes. `tools/build_voice.py` also records `rule.sayEx` (the examples).
- Test hooks: `WR.Learn._S()` (the running lesson), `WR.Learn.KIT` (the widgets).

---

## 2. Content format (for batches)

Lesson content is written in Python modules `tools/lessons/<pack>.py`, each exporting `LESSONS = [...]`.
- `tools/lesson_build.py` validates every lesson and writes `data/lessons/<pack>.json` and `data/lessons/index.json`.
- `tools/build_data.py` runs `tools/lesson_build.py`.
- Packs: `en-a1`, `en-a2` … `en-c2`, `sg-p1` … `sg-adult`, `m-g1` … `m-g12`.

```python
dict(id="en.a1.an", title="a or an?", icon="🍎", at=dict(realm="a1", skill="grammar"),   # maths: at=dict(topic="g2.place")
     match=[dict(opts=["a", "an"])],               # English hint links: all these words among the options, or dict(re="…", field="q|explain")
     art="lesson_en_a1_an", art_alt="…",
     hook=dict(text="…"),                          # narrator reads text (say = text unless given)
     discover=dict(kind="sort", text="…", hint="…", …widget fields…),
     rule=dict(text="…", examples=["…", "…"]),
     check=[dict(q="…", text="(optional mini story)", options=[…3], answer=0, notes={wrong option: why}, explain="…") ×3],
     reteach=dict(text="…", examples=[…], discover=dict(kind=…)),   # discover optional
     check2=[… ×3 new questions],
     grown="👪 note: the grammar term / MOE code for grown-ups")
```
**The validator (`tools/lesson_build.py`) fails the build if:**
- there is no hook, discover, rule, reteach, or exactly 3 check and 3 check2 questions;
- options are duplicated, or the answer is out of range;
- any wrong option has no note, or any question has no explanation;
- the widget fields don't match the widget kind;
- the art file is missing (`assets/web/<art>.webp`; flagged placeholders are not allowed in a deploy);
- `at` names an unknown realm/skill or maths topic;
- an id is duplicated.

**Widget kit (`js/learn.js`, all drag + tap):**

| kind | fields | good for |
|---|---|---|
| `sort` | `bins:[{id,label,icon}]`, `items:[{t, bin, icon?, why?}]` | a/an, am/is/are, question words, countable/uncountable, formal/informal, odd/even, shapes |
| `fill` | `tiles:[…]`, `items:[{s:"I ___ Puffbun.", a:"am", why}]` | verb forms, prepositions, connectors, tenses (drag the tile into the gap) |
| `suffix` | `stamp:"s"`, `items:[{pre:"3", base:"cat", need:true, why, cut?, add?, post?}]` (post = words after the stamp: Mia + 's + bag) | plural -s, past -ed (drag -ed onto verbs), -er/-est, prefixes un-/re-, word formation |
| `spots` | `scene:"table"\|"bed"\|"nearfar"\|"park"`, `token`, `tasks:[{word:"on"|"near"|"nextto", text:"…"}]` | prepositions of place; this/that near or far; next to/behind/in front of (park); later left/right, maps |
| `pv` | `targets:[243, 306]` | place value (H/T/O), later thousands; tap or drag a block onto the mat, ➖ takes one back |
| `regroup` | `a:28, b:15` | adding with carrying (10 ones → 1 ten), later subtraction by renaming |
| `groups` | `rings:3, each:4, item:"🍄"` | multiplication as equal groups, arrays, skip counting |
| `share` | `total:15, plates:3, item:"🍪"` | division by sharing / grouping, remainders (later) |
| `frac` | `stages:[{shape:"pizza"\|"bar", parts:4, shade:1}]` | fractions of a whole, equivalent fractions (later), unit fractions |
| `rename` | `a:32, b:15` | subtracting with renaming (unbundle a ten → 10 ones, then take away) |
| `money` | `targets:[125, 240]` | dollars & cents (cents totals; $1 / 10¢ / 1¢ coins) |
| `clock` | `targets:[{h:3, m:25}]` | five-minute analogue clock (set the hands) |
| `picgraph` | `cats:[{label, n}], key:5, item` | picture graph with a key (tap to add pictures) |
| `bar` | `start:50, sold:20, add:15` | Singapore bar model for two-step take-away then add |
| `line` | `ends:[top, bottom]`, `items:[{t, why, n?}]` listed top → bottom; `of:7, unit` shows n of 7 stars per step (else `mark`) | order on a line: how often (always … never); later first/then/finally, timelines |

New widgets may be added to the kit when a topic needs one, for example a number line, balance, clock hands, a graph builder or angle turns. Each needs a tap alternative, at least 44 px targets, and the 320 px audit in `tools/test/lessons.js`.

**Narration.** Every `text` and `say` is a narrator line that `tools/build_voice.py` records with Kokoro **af_heart** (`/workspace/kvenv/bin/python tools/build_voice.py`, models in `/workspace/kmodels`). It walks `data/*/*.json`, so lesson packs are found automatically. If no MP3 exists or the device is offline, `WR.say` falls back to the device voice. Each step has a 🔊 button, and each step auto-reads when sound is on (a lesson always starts from a tap, so iPhones allow it).

**Art.** Each lesson has one painted hook picture: GenerateImage, cute anime/chibi pastel, 4:3, no text in the picture. Never Pillow composites, never Higgsfield credits. Install it with
`python3 tools/install_story_img.py --dir lessons <art_id>=<generated.png>` → `assets/lessons/<id>.jpg` (960×720) + `assets/web/<id>.webp`.

---

## 3. Every lesson, per track (the to-do list)

Ids: `en.<level>.<slug>`, `sg.<level>.<slug>`, `m.<topic id>`. ✅ = live. In the original document each lesson was a bullet point: `id` title — the discovery widget or idea.

### 🏰 English CEFR (fairy realms)

*~12 lessons per level, attached to the skill node.*

**A1 · Meadow of First Words (Pre-A1 Starters / A1 Movers)**

Grammar:
- ✅ `en.a1.an` a or an? (sort)
- ✅ `en.a1.be` am, is, are (fill)
- ✅ `en.a1.plural` one cat, two cats (suffix -s)
- ✅ `en.a1.have` have / has (sort by subject)
- ✅ `en.a1.can` can / can't + plain verb (fill)
- ✅ `en.a1.s3` he plays, I play: the -s on verbs (suffix)
- ✅ `en.a1.thereis` there is / there are (sort by picture count)
- ✅ `en.a1.this` this/that/these/those (spots: near or far)
- ✅ `en.a1.poss` my, your, his, her (sort by owner)
- ✅ `en.a1.do` Do / Does questions (fill)
- ✅ `en.a1.ing` happening now: is + -ing (suffix -ing)
- ✅ `en.a1.waswere` was / were for yesterday (fill)

Vocabulary:
- ✅ `en.a1.place` in, on, under (spots)
- ✅ `en.a1.place2` next to, behind, in front of (spots)
- ✅ `en.a1.timeprep` at 7 o'clock, on Sunday, in May (sort)
- ✅ `en.a1.feel` feelings words (sort pictures)

Reading:
- ✅ `en.a1.qwords` Who? Where? What? (sort)
- ✅ `en.a1.detail` find the number or colour in the story (tap the word / findword)

Listening:
- ✅ `en.a1.listennum` listen for numbers and names (spelling / spellhear)
- ✅ `en.a1.keyword` listen for the key word (tap the picture you hear / hearpic)

**A2 · Candy Village (A2 Key / Flyers)**

Grammar:
- ✅ `en.a2.ed` past -ed (suffix: drag -ed onto verbs, including the double letter in stopped)
- ✅ `en.a2.irreg` went, ate, saw (sort regular / special)
- ✅ `en.a2.comp` bigger / more beautiful (suffix -er or "more")
- ✅ `en.a2.super` the biggest (suffix -est)
- ✅ `en.a2.goingto` going to for plans (fill)
- ✅ `en.a2.will` will for promises and guesses (sort)
- ✅ `en.a2.someany` some / any (sort)
- ✅ `en.a2.muchmany` much / many and countable/uncountable (sort)
- ✅ `en.a2.freq` always … never (order on a line: new `line` ladder widget, days out of 7)
- ✅ `en.a2.must` must / have to / mustn't (sort signs)
- ✅ `en.a2.should` advice with should (fill)
- ✅ `en.a2.objpron` me, him, her, them (fill)
- ✅ `en.a2.poss_s` Mia's bag (suffix 's, with the thing after the owner: Mia + 's + bag)
- ✅ `en.a2.link` and / but / so / because (fill)

Vocabulary:
- ✅ `en.a2.makedo` make / do (sort)
- ✅ `en.a2.shop` shop & food words (sort; prices in Singapore dollars and cents)

Reading:
- `en.a2.sequence` first, then, finally (order)
- `en.a2.pronref` who is "she"? (tap the person)

Listening:
- `en.a2.prices` times & prices among distractors

**B1 · Whispering Forest (B1 Preliminary)**

Grammar:
- ✅ `en.b1.ppever` present perfect: ever / never / just / already / yet (fill)
- ✅ `en.b1.ppvsps` have done vs did (sort time words)
- ✅ `en.b1.pastcont` was doing when … happened (timeline)
- ✅ `en.b1.cond1` if + present, will (fill)
- ✅ `en.b1.cond2` if I were … (sort real/imagined)
- ✅ `en.b1.passive` the cake was eaten (fill)
- `en.b1.relative` who / which / that (sort) ← next English turn: EN-5c
- `en.b1.reported` she said that … (fill: backshift)
- `en.b1.geninf` enjoy doing / want to do (sort)
- `en.b1.usedto` used to (fill)
- `en.b1.deduce` must / might / can't be (sort by sureness)
- `en.b1.tooenough` too / enough (fill)

Vocabulary:
- `en.b1.phrasal` look after, give up (sort)
- `en.b1.wordform` -ful / -less / un- (suffix)
- `en.b1.linkers` however / although (fill)

Reading:
- `en.b1.mainidea` main idea vs detail
- `en.b1.feelings` inference: how does she feel?

Listening:
- `en.b1.opinion` attitude words

**B2 · Crystal Lake (B2 First)**

Grammar:
- `en.b2.cond3` third & mixed conditionals (timeline)
- `en.b2.wish` wish / if only (sort now/past)
- `en.b2.passrep` it is said that … (fill)
- `en.b2.nondef` non-defining relative clauses: commas (stamp commas)
- `en.b2.repq` reported questions (fill word order)
- `en.b2.futperf` will have done / will be doing (timeline)
- `en.b2.pastperf` past perfect in stories (order)
- `en.b2.causative` have something done (sort)
- `en.b2.modalperf` should have / could have (fill)
- `en.b2.articles` a / the / no article (sort)

Vocabulary:
- `en.b2.colloc` collocations (match)
- `en.b2.wordfam` word families (suffix)
- `en.b2.deppre` dependent prepositions (fill)

Reading:
- `en.b2.cohesion` gapped-text clues: pronouns & linkers
- `en.b2.paraphrase` the same meaning, new words

Listening:
- `en.b2.listenpara` hear the paraphrase

**C1 · Cloud Castle (C1 Advanced; kid-friendly topics)**

Grammar:
- `en.c1.inversion` Never have I … (build)
- `en.c1.cleft` What I need is … (build)
- `en.c1.participle` Having finished, … (fill)
- `en.c1.hedging` seems to / tends to (sort sure/unsure)
- `en.c1.emphasis` I do like it (fill)
- `en.c1.ellipsis` so do I / I hope so (fill)
- `en.c1.nominal` decide → decision (suffix)
- `en.c1.noif` Should you need help … (build)

Vocabulary:
- `en.c1.idioms` kid-friendly idioms (match picture)
- `en.c1.register` formal vs friendly (sort)
- `en.c1.collstrength` strong collocations (match)

Reading:
- `en.c1.attitude` the writer's attitude
- `en.c1.implied` implied meaning

Listening:
- `en.c1.purpose` the speaker's purpose

**C2 · Starlight Library (C2 Proficiency; kid-friendly topics)**

Grammar:
- `en.c2.fronting` fronting & subtle inversion (build)
- `en.c2.subjunctive` It is vital that he be … (fill)
- `en.c2.concession` Much as I … / Try as she might (build)
- `en.c2.nominalgroups` long noun groups (build)

Vocabulary:
- `en.c2.nuance` near-synonyms (sort by shade)
- `en.c2.connotation` positive/negative connotation (sort)
- `en.c2.phrasal2` idiomatic phrasal verbs (match)

Reading:
- `en.c2.tone` tone & irony
- `en.c2.argument` how an argument is built

Listening:
- `en.c2.implied` implied attitude

### 🦁 Singapore School English (MOE EL Syllabus 2020; PSLE 0001, O-Level 1184, GP 8881)

These lessons attach to the level hub as a "📜 Learn" row, which is still a hub section, not a home tile. A Singapore lesson that teaches the same point as a CEFR lesson **reuses** it (`same="en.a1.an"`) rather than duplicating it. The hub lists it and the scroll is shared.

**P1:**
- `sg.p1.an` → reuses `en.a1.an`
- `sg.p1.plural` → reuses `en.a1.plural`
- `sg.p1.caps` capital letters & full stops (stamp)
- `sg.p1.pron` I / he / she / they (sort)
- `sg.p1.past` yesterday words (suffix -ed, simple)

**P2:**
- `sg.p2.ing` → reuses `en.a1.ing`
- `sg.p2.link` and / but / because (fill)
- `sg.p2.qwords` → reuses `en.a1.qwords`
- `sg.p2.adj` describing words (build)
- `sg.p2.place` → reuses `en.a1.place`

**P3:**
- `sg.p3.sva` one / many: subject-verb agreement (sort)
- `sg.p3.irreg` → reuses `en.a2.irreg`
- `sg.p3.posspron` mine / yours / theirs (fill)
- `sg.p3.synth1` Join It Up with and / because (build)
- `sg.p3.evidence` comprehension: find the proof line (tap the line)

**P4:**
- `sg.p4.tense` keep the tense the same (spot & fix)
- `sg.p4.who` who / which (fill)
- `sg.p4.toosothat` too … to / so … that (build)
- `sg.p4.quant` a few / a little / many (sort)
- `sg.p4.vocabctx` word meaning from context
- `sg.p4.order` sequencing events

**P5:**
- `sg.p5.svahard` each / every / either … or / neither … nor (sort)
- `sg.p5.passive` passive voice (build)
- `sg.p5.reported` reported speech (fill)
- `sg.p5.unless` unless / if … not (build)
- `sg.p5.notonly` not only … but also (build)
- `sg.p5.despite` despite / in spite of / although (build)
- `sg.p5.gcloze` grammar-cloze strategy: read the whole sentence, check the word box (fill)
- `sg.p5.oe` open-ended answers in full sentences
- `sg.p5.infer` inference + evidence

**P6 (PSLE):**
- `sg.p6.synthbig` the synthesis & transformation toolkit: no sooner … than, hardly … when, whose, provided that (build)
- `sg.p6.vcloze` vocab cloze collocations (fill)
- `sg.p6.visual` visual text: purpose, audience, features (tap the clue)
- `sg.p6.pac` situational writing: Purpose, Audience, Context (sort)
- `sg.p6.plot` continuous writing: a plot with a problem (order)
- `sg.p6.oetypes` OE question types: literal / inferential / true-false with reason (sort)

**Sec 1–2:**
- `sg.s1.editing` editing: tense, SVA, prepositions (spot & fix)
- `sg.s1.keypoints` summary: key point vs example (sort)
- `sg.s1.paraphrase` paraphrasing (build)
- `sg.s1.narrative` narrative techniques: show, don't tell (sort)
- `sg.s2.persuade` visual text persuasion techniques (tap)
- `sg.s2.purpose` the writer's purpose
- `sg.s2.figurative` figurative language (match)

**Sec 3–4/5 (O-Level):**
- `sg.s3.situational` formal email/report/speech: PAC + tone (sort register)
- `sg.s3.argue` argumentative structure (order)
- `sg.s3.wordeffect` the effect of word choice
- `sg.s3.summary` the 80-word summary: key points, own words, no examples (sort/build)
- `sg.s4.sbc` spoken interaction with PEEL (order)
- `sg.s4.readaloud` reading aloud: pausing & emphasis (tap the pauses)
- `sg.s4.notes` listening note-taking

**JC 1–2 (GP; mature but respectful topics):**
- `sg.jc1.thesis` thesis & topic sentences (sort)
- `sg.jc1.peel` PEEL paragraph (order)
- `sg.jc1.counter` counter-argument & rebuttal (build)
- `sg.jc1.qualify` qualifiers vs absolutes (sort)
- `sg.jc1.evidence` evaluating evidence (sort strong/weak)
- `sg.jc2.literal` literal vs inferential questions (sort)
- `sg.jc2.summary` GP summary from the text (build)
- `sg.jc2.aq` application question structure (order)
- `sg.jc2.tone` tone & attitude (sort)
- `sg.jc2.fallacy` spotting weak reasoning (sort)

**Grown-up:**
- `sg.adult.register` workplace email register (sort)
- `sg.adult.concise` concise writing (build)
- `sg.adult.singlish` Standard English vs Singlish features, respectful and situational (sort)
- `sg.adult.meeting` meeting language (fill)
- `sg.adult.present` persuasive presentation openers (order)
- `sg.adult.news` reading news critically (sort fact/opinion)

### 🔢 Maths (MOE; one lesson per topic, id `m.<topic id>`)

**Grade 1 (P1):**
- ✅ `m.g1.count` counting to 20: tap to count, then the last number says how many (groups)
- ✅ `m.g1.add20` adding: make 10 first (regroup within 20)
- ✅ `m.g1.sub20` taking away with renaming (rename)
- ✅ `m.g1.bonds` number bonds: split 10 into two parts (sort into the two parts)
- ✅ `m.g1.shapes` sides & corners (new `shapecount` widget)
- ✅ `m.g1.money` coins in cents (money widget; count in ¢)
- ✅ `m.g1.time` o'clock & half past (clock hands; gentle 5-minute intro)
- ✅ `m.g1.picgraph` picture graph: one picture = one (build a graph)
- ✅ `m.g1.story` word problems: find the action word (sort add/take/how many more)

**Grade 2 (P2):**
- ✅ `m.g2.place` hundreds, tens and ones (pv)
- ✅ `m.g2.add` adding with regrouping (regroup)
- ✅ `m.g2.times` times means equal groups (groups)
- ✅ `m.g2.share` sharing fairly (share)
- ✅ `m.g2.frac` halves, thirds and quarters (frac)
- ✅ `m.g2.sub` subtracting with renaming (regroup backwards)
- ✅ `m.g2.money` dollars and cents (pv money)
- ✅ `m.g2.time` five-minute clock (clock)
- ✅ `m.g2.picgraph` picture graph with a key (build)
- ✅ `m.g2.story` two-step problems: bar model

**Grade 3 (P3):**
- ✅ `m.g3.times` 6–9 times-table tricks (groups/arrays)
- ✅ `m.g3.divrem` remainders: left over (share with leftovers)
- ✅ `m.g3.add4` 4-digit regrouping (pv)
- ✅ `m.g3.mul` multiply by one digit (area blocks)
- ✅ `m.g3.eqfrac` equivalent fractions (frac stages: fold)
- ✅ `m.g3.measure` units of length, mass and volume (sort)
- ✅ `m.g3.duration` how long? (number line)
- ✅ `m.g3.clock` 24-hour clock (sort)
- ✅ `m.g3.perim` perimeter: walk the fence (tap the edges)
- `m.g3.lines` parallel / perpendicular (sort)
- `m.g3.bargraph` bar graph scale (build)
- `m.g3.story` ×/÷ stories: bar model

**Grade 4 (P4):**
- `m.g4.longmul` long multiplication (area model)
- `m.g4.longdiv` long division (share in steps)
- ✅ `m.g4.factors` factors & multiples (arrays)
- `m.g4.fracadd` adding fractions: like / unlike (frac bars)
- ✅ `m.g4.fracset` a fraction of a set (groups)
- `m.g4.decimal` tenths & hundredths (pv decimals)
- ✅ `m.g4.round` rounding: the number line hill
- `m.g4.area` area by counting squares
- `m.g4.angles` turns & angles (angle turn)
- `m.g4.symmetry` mirror lines (fold)
- `m.g4.linegraph` line graphs (build)
- `m.g4.story` story problems with the bar model

**Grade 5 (P5):**
- `m.g5.fracmul` fraction × fraction (area grid)
- `m.g5.dec10` × ÷ 10, 100, 1000 (place-value slide)
- `m.g5.percent` percent as out of 100 (100-grid)
- `m.g5.ratio` ratio recipes (groups)
- `m.g5.triangle` area of a triangle: half a rectangle
- `m.g5.angles` angles on a line / at a point (sort)
- `m.g5.volume` cubes in a box (build)
- `m.g5.average` average: level the towers (share)
- `m.g5.order` order of operations (order)
- `m.g5.rate` rates (groups)
- `m.g5.story` word problems with units

**Grade 6 (P6):**
- `m.g6.fracdiv` dividing fractions: how many fit? (frac bars)
- `m.g6.pctchange` percentage change (bars)
- `m.g6.share` sharing in a ratio (bar units)
- `m.g6.circle` circumference & area: unroll the circle
- `m.g6.algebra` letters stand for numbers (balance)
- `m.g6.speed` distance-speed-time triangle (sort)
- `m.g6.nets` nets: fold the box
- `m.g6.piechart` pie charts (frac)
- `m.g6.story` PSLE-style heuristics: units & parts

**Grade 7 (Sec 1):**
- `m.g7.integers` negative numbers on the number line
- `m.g7.hcf` prime factor trees (build)
- `m.g7.simplify` like terms (sort)
- `m.g7.expand` expanding brackets: area model
- `m.g7.lineq` balance equations (balance)
- `m.g7.angles` angle facts with parallel lines (sort)
- `m.g7.mensur` composite areas (split)
- `m.g7.pct` percentage multipliers
- `m.g7.pattern` the nth term (build)
- `m.g8.gradient` gradient: rise over run (drag points) — taught in Grade 7; lesson id kept
- `m.g8.lingraph` y = mx + c sliders — taught in Grade 7; lesson id kept
- `m.g8.fraceq` fraction equations (balance) — taught in Grade 7; lesson id kept
- `m.g7.story` setting up equations

**Grade 8 (Sec 2):**
- `m.g8.expand2` double brackets: grid
- `m.g8.factorise` factorising: reverse the grid
- `m.g8.pyth` Pythagoras with squares on the sides
- `m.g8.similar` scale factor (slider)
- `m.g8.solids` volume of cones & spheres
- `m.g8.proportion` direct / inverse proportion (sort)
- `m.g8.stats` mean, median & mode (sort)
- `m.g8.prob` probability from 0 to 1 (spinner)
- `m.g9.quad` factorising quadratics (grid) — taught in Grade 8; lesson id kept
- `m.g9.simul` simultaneous equations (two balances) — taught in Grade 8; lesson id kept
- `m.g9.trig` SOH-CAH-TOA (label the sides) — taught in Grade 8; lesson id kept
- `m.g8.story` problem solving

**Grade 9 (Sec 3):**
- `m.g9.quadgraph` parabola sliders
- `m.g9.indices` index laws (sort)
- `m.g9.stdform` standard form (pv slide)
- `m.g9.surds` surds: simplest form (factor tree) — ✨ Extra, Additional Mathematics; lesson id kept
- `m.g9.perpline` parallel and perpendicular gradients — ✨ Extra, Additional Mathematics
- `m.g9.bearings` bearings: clockwise from north
- `m.g9.coord` coordinate geometry (drag points)
- `m.g9.circles` circle properties (tap angles)
- `m.g9.ineq` inequalities on a number line
- `m.g9.sets` Venn diagrams (sort)
- `m.g9.story` problem solving

**Grade 10 (Sec 4):**
- `m.g10.quadf` the quadratic formula
- `m.g10.sinecos` sine & cosine rules (sort which rule)
- `m.g10.triggraph` amplitude & period sliders — ✨ Extra, Additional Mathematics; lesson id kept
- `m.g10.prob2` two-draw tree diagrams (build)
- `m.g10.freq` frequency tables
- `m.g10.spread` range & IQR (box plot)
- `m.g10.travel` travel graphs (drag)
- `m.g10.sector` arc & sector (frac of circle)
- `m.g10.vectors` vectors: arrows (drag)
- `m.g10.matrices` matrix multiplication (row × column)
- `m.g10.interest` simple vs compound interest
- `m.g10.story` problem solving

**Grade 11 (JC 1):**
- `m.g11.func` functions as machines
- `m.g11.explog` logs undo powers — ✨ Extra, Additional Mathematics; lesson id kept
- `m.g11.diff` gradient of a curve (tangent slider) — ✨ Extra, Additional Mathematics; lesson id kept
- `m.g11.stationary` stationary points
- `m.g11.tangent` tangent & normal — ✨ Extra, Additional Mathematics; lesson id kept
- `m.g11.ap` arithmetic sequences — ✨ Extra, Additional Mathematics; lesson id kept
- `m.g11.gp` geometric sequences — ✨ Extra, Additional Mathematics; lesson id kept
- `m.g11.vec3` 3D vectors
- `m.g11.story` modelling

**Grade 12 (JC 2):**
- `m.g12.integ` integration as area under (rectangles)
- `m.g12.chain` the chain rule — ✨ Extra, Additional Mathematics; lesson id kept
- `m.g12.area` area between curves
- `m.g12.binom` binomial expansion (Pascal)
- `m.g12.complex` complex numbers on the plane
- `m.g12.sigma` sigma notation
- `m.g12.expcalc` e^x and ln x
- `m.g12.story` modelling

---

## 4. Batches (who does what, in this order)

Each **routine turn builds one batch of ~5 lessons**, alternating English and maths like the rest of the routine. For each batch:
1. Clean up any code the batch touches (behaviour identical, tested).
2. Write the content in `tools/lessons/<pack>.py`, using this plan's list and order.
3. Paint each hook picture with **GenerateImage** (cute anime/chibi pastel, 4:3, no text). Install it with `tools/install_story_img.py --dir lessons`. Never ship placeholders or composites.
4. Run `python3 tools/lesson_build.py` (the validator). Record the voice: `/workspace/kvenv/bin/python tools/build_voice.py`.
5. Run `node tools/test/lessons.js` and raise its `MIN_LESSONS`. Then run the full suite: cloud, lightart, parentgate and pwa one at a time; cloud.js and skins.js are known flakes.
6. Take screenshots with `SHOT=1 node tools/test/lessons.js` → `screenshots/lessons_*.png`.
7. Deploy (build_sw → pull → copy → commit → push → live 200), then tick ✅ in §3 and in the progress table below.
8. If a topic needs a new widget, add it to the kit first. Give it a tap alternative and add it to the phone-width audit in lessons.js.

## 5. Progress

| Batch | Lessons | Status | Commit |
|---|---|---|---|
| Phase 1 | plan, engine `js/learn.js`, scroll shelf, hint links, Grown-ups card, save block, tests | ✅ | 1d135e5 |
| Pilot EN | en.a1.an, en.a1.be, en.a1.plural, en.a1.place, en.a1.qwords | ✅ | 1d135e5 |
| Pilot MA | m.g2.place, m.g2.add, m.g2.times, m.g2.share, m.g2.frac | ✅ | 1d135e5 |
| EN-2 | A1 rest: have, can, s3, thereis, this, poss, do | ✅ (hook art repainted with GenerateImage 2026-11-04; Pillow composites removed) | f4ee083 |
| MA-2 | G2 rest: sub, money, time, picgraph, story (+ widgets rename, money, clock, picgraph, bar) | ✅ (5 GenerateImage hooks; narrator money words fixed) | f4ee083 |
| EN-3 | A1 rest: ing, waswere, place2, timeprep, feel, detail, listennum, keyword | ✅ (3 widgets findword/spellhear/hearpic; 8 GenerateImage hooks) | 342673e |
| MA-3 | G1 first 5: count, add20, sub20, bonds, shapes (+ shapecount widget) | ✅ (5 GenerateImage hooks; missing-number box now read as "what number") | 8e331ac |
| MA-3b | G1 rest: money, time, picgraph, story | ✅ (4 GenerateImage hooks; money widget can show cents) | ce08a78 |
| EN-4a | A2 first: ed, irreg, comp, super (+ suffix cut/add, settle() cleanup) | ✅ (4 GenerateImage hooks; merged onto the Nova + lighter-first-visit main) | cb42f3a |
| EN-4b | A2 next: goingto, will, someany, muchmany (+ shuffled() cleanup) | ✅ (4 GenerateImage hooks) | d06b436 |
| MA-4a | G3 first: times, divrem, add4, mul, eqfrac | ✅ (5 GenerateImage hooks; share widget shows left-overs; itemChip() cleanup) | cae1432 |
| EN-4c | A2 next: freq, must, should, objpron (+ `line` widget; land() + need_why() cleanup) | ✅ (4 GenerateImage hooks) | a0d2c05 |
| MA-4b | G3 next: measure, duration, clock, perim (+ `fence` widget; tapStages() cleanup) | ✅ (4 GenerateImage hooks; narrator reads metric units, h/min and 24-hour times) | 606b2ab |
| EN-4d | A2 next: poss_s, link, makedo, shop (+ suffix `post`, stampWord() cleanup, 3-basket labels fit) | ✅ (4 GenerateImage hooks) | 94fbec6 |
| EN-4e | A2 last: sequence, pronref, prices | ✅ (3 GenerateImage hooks) | 2886e1d |
| MA-4c | G3 last: lines, bargraph, story (+ `bargraph` and `units` widgets; lockAll() cleanup) | ✅ (3 GenerateImage hooks) | 2886e1d |
| EN-5a | B1 first: ppever, ppvsps, pastcont (+ cardPool() cleanup) | ✅ (3 GenerateImage hooks) | 2a9eda2 |
| MA-5a | G4 first: factors, fracset, round (groups/share/sort/fill, no new widget; groups `runs` cleanup) | ✅ (3 GenerateImage hooks) | 3b8f1ef |
| EN-5b | B1 next: cond1, cond2, passive (fill/sort, no new widget; SORT_HOW / FILL_HOW cleanup) | ✅ (3 GenerateImage hooks) | cf59da2 |
| EN-5… | B1 rest, then B2, C1, C2 | ⏳ | |
| MA-4… | G3, G4 … G12 (one grade per 2 turns) | ⏳ | |
| SG-1… | SG hub "📜 Learn" row (engine: `at=dict(sg="p1")`, `same=`) then P1 → Grown-up | ⏳ after A2 | |
