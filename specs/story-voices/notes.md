# STORY-VOICES audit (2026-11-04) — checkpoint notes

Paused first: BRIEF-T4B / BRIEF-T5 had no edits or commits (only reading); no 🔧 rows were opened for them.

## Found (before, measured on the live site with tools/test/story-voices.js)
1. **Names → device voice mid-page.** Story sentences with {hero}/{pet} had no recording (a typed name can't be pre-recorded), so
   WR.say fell back to the device voice: 171 of 707 sentence slots (24%) across the 42 chapters; with a typed hero + custom pet
   132 of 639 distinct lines on screen had no MP3. A page switched voice between sentences.
2. **A new Audio() per line.** "Read to me" played line 2, 3, … from the previous line's `ended` event, each on a new element. Phones
   (iOS Safari) block a fresh element without a tap → the play() promise rejects → device voice: mixed voices on a phone.
3. **Stopped lines restart the chain.** Answering the question / turning the page / tapping a dotted word during Read to me let the
   chain carry on (2–4 plays logged after the stop), because a cancelled line could still call its onend.
4. Fine already: the narrator profile has been af_heart, speed 1.0, unmodified since voices were added (one commit of data/voices.json);
   every mapped file exists and its name is the hash of exactly its text (no stale files); leaving the story stopped audio (WR.go).

## Fixed
- js/story.js fill(): {hero} → "our hero" ("Our hero" at a sentence/quote start), {pet} → the pet species' storybook name
  (8 names from js/core.js PETS). tools/build_voice.py applies the same rule (story_fill / STORY_PETS) and records every variant.
  591 new af_heart lines recorded (local Kokoro, kokoro-onnx; no paid services). The result screen still uses the pet's own name.
- js/voice.js: one shared audio element for every line; a stopped line never calls its onend; V.last notes device-voice lines.
- js/story.js: tapping a sentence or a dotted word ends the Read-to-me chain; stopStory also stops the voice.
- Test tools/test/story-voices.js (22 checks).
- Full run sv1 (while whisper ran): 89/96; story.js expected typed names → updated; lightload 2.00 MB → story lines split into assets/voice/manifest-story.json (loaded with a story); doubletap/jargon/mathbubble/smallphones/swap were load timeouts, all green singly.
- Speech-to-text (faster-whisper, local, free): base.en/int8 on all 1,343 story clips flagged 91 (mean 0.90); re-checked with small.en
  (beam 5): the 91 flagged + 150 random lines → random-150 mean 0.969; all 36 below 0.85 are name spellings (Puff Bun, Bow for Bao,
  Machai Fox), homophones (too/2, right/write) or British spelling. No clip says other words. A base.en run with a read-only buffer
  and 8 threads gave garbage (0.42): an audit bug, not the audio. Tool: tools/story_voice_audit.py.
- ffprobe: 1,343 / 1,343 mono 24 kHz MP3, 1.0–5.2 words/s (fastest 4.6, short A1 words), 0 missing.
- First-visit budget: story lines moved to assets/voice/manifest-story.json (loaded when a story opens): 1.97 MB (< 2 MB).
- Jeremy: "every story's voice has at least a mistake" → no sampling: every story MP3 (1,343) transcribed with small.en, word by word.
  First full pass used 4 forked workers → garbage transcripts (745 "errors", mostly empty/cut/jjaja); same files one at a time were fine →
  re-running in ONE process (full2). Found for real so far: Kokoro says "Mochi" as "MAH-chai" (phonemes mˈɑːtʃaɪ) → sayAs "Moh-chee"
  (data/voices.json; build_voice.py spoken()); every Mochi Fox line to be re-recorded.

## Checkpoint (full check, every line)
- full2 (ONE process, small.en, all 1,343 story clips): 188 flagged; second model medium.en on those: 52 heard right → 127 left.
- Real errors found and fixed (re-recorded with local Kokoro af_heart, file names include the spoken form so no stale cache):
  - "Mochi" said "MAH-chai" in 62 lines (sayAs "Moh-chee").
  - Heteronyms (Kokoro phoneme check, 32 lines scanned): "a tear in it" / "around the tear" said like crying (9 lines incl. pet
    variants) → "tare"; past "read" said "reed" ×3 (c2.2, c2.4, c2.7) → "red"; "finally content" said as the noun ×1 → phoneme swap
    kəntˈɛnt (data/voices.json sayAsPhonemes). 13 re-recorded.
- Next: /workspace/storyv/evalx.py (both models; single words inside a carrier) on the 140 failing/changed → fixsynth.py makes
  pause candidates for lines still failing (unclear -ed / -s endings) → pick passing ones into sayAs → build_voice → full audit
  with tools/story_voice_audit.py --ledger (all lines) → story-voices.js → full suite → deploy → live.

## Checkpoint — fix loop (pause candidates)
- 64 failing → 11 were spelling/homophone-only (queued/cued, medal/metal, cue/Q, rowed/rode, councillor/counselor, enquired/inquired, Bao/bough, Mogs/Moggs): added to the normaliser (audio says the right sounds).
- 34 lines fixed with a comma pause (sayAs keys widened word by word until they match only the lines they fix): lost -ed/-s endings, "and"→"in", "first tart"→"heart", s-merges ("Pip sighed"→"Pipside").
- 8 b1.6 lines fixed by "tiny glow-chimes" → "tiny glow chimes" (Kokoro read the hyphen as "gloat").
- Left for phoneme check / phone listen: "joy" (heard "Jai"), "fairest", "sheepish", "made it home" (heard "at"), 2 b1.7 glow lines. Kokoro phonemes are correct for all (dʒˈɔɪ, fˈɛɹəst, ʃˈiːpɪʃ, ɪt).
- Audit tool now judges lone glossary words inside a carrier (tools/story_voice_carrier.mp3) and shares the normaliser with the fix scripts.
- Full re-audit with --ledger running (all 1,343 lines).

## Checkpoint — step 1 (ledger audit) done
- Full one-process audit of 1,343 lines: 1,326 pass, 17 fail (11 stories). Ledger written (tools/story-voice-ledger.json).

## Checkpoint — step 2 (remaining 17)
- glow-chimes → 'glow chimes' everywhere (8 b1.7 lines); burrow/borough added as a US homophone.
- New data/voices.json sayAsWhole (exact whole-line only): laughed → 'laughed.', dawn → 'dawn.', 'said our hero.' → 'said, our hero.' (each passed both models).
- Rejected respellings that changed the sound: perrched (pˈɛrtʃt), joyy (dʒˈɔɪi), sed, dawwn.
- PHONEME_OK in the audit tool (5 lines, IPA right, whisper can't hear it): joy, fairest, sheepish, perched, 'made it home'. → phone listen.

## Checkpoint — ledger complete: 1,343/1,343 pass (small.en 1,287 · medium.en 51 · phonemes 5)

## Checkpoint — step 3: story-voices.js 30/30 (before: 12 passed, 9 failed)

## Checkpoint — REVIEW back to 🔧 ('audio fixed locally, deploy pending'); full suite sv4: 93/96 first pass, maths-review + skins pass singly (timeouts under load); story-voices re-run singly

## Checkpoint — step 4 full suite 96/96 (maths-review, skins, story-voices were load timeouts; each passes alone)

## Checkpoint — step 5 deployed: commit 0538ad6, merge b65744d on main (sw 397c96322764); brief docs removed from the deploy checkout + .git/info/exclude; 23 orphan MP3s git rm'd

## Checkpoint — step 6 live tap check 33/33 (360x740, A1 ch1 / B1 ch3 / C2 ch7): Read to me, sentence tap, dotted word (meadow / hovering / stillness), answer, page turn mid-line, close — MP3 only, no device voice, no overlap, one element, no console errors. 15 screenshots storyv_live_*.png. Nit: after a dotted-word tap its sentence keeps a light highlight (visual only).
## Checkpoint — step 7 STORY-VOICES ✅ (commit 0538ad6 / merge b65744d). BRIEF-T4B / BRIEF-T5 ⏸️ paused.

## Step 0 (2026-11-05) dotted-word highlight: cause = sticky :hover on touch phones (the .reading class was already cleared). Fix: .sent:hover only inside @media (hover:hover). Check added to story-voices.js.
- story-voices.js with the new check: story-voices: 30 passed, 0 failed

## STORY-NAMES (2026-11-05, Jeremy: typed names even if the phone voice reads those lines)
- js/story.js fill: {hero} → typed name (fallback 'our hero'), {pet} → typed pet name (fallback the species storybook name); function replacements so a typed '$&' stays literal; petName() merged into petTyped().
- Chose to KEEP the 'our hero' / storybook-pet MP3s as the fallback (no extra code: same fill rule; a pet with its default name still gets MP3s).
- story-voices.js: typed-name lines must have no MP3 (device voice), every other line its MP3 + ledger; Read to me order with device lines, no overlap, line-start gaps logged. story.js expects the typed name.
- STORY-NAMES tests: story.js all passed; story-voices.js 32/32 (181 typed-name lines device, 520 lines MP3). Full suite sn started.
