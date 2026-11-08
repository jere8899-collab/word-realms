# 011 Storybook hero is Nova

**Created**: 2026-11-08

**Status**: Draft

## Goal

Reading a Storybook chapter always shows and speaks **Nova** as the hero, and the pet's storybook name (Puffbun, Mochi Fox, Minty, Hoot, Lulu, Bao, Sprinkle, Pip). The name the child typed, including a blank name or a renamed pet, is not used in the story. It is still the name everywhere else, and the save is not rewritten.

Every narrative line is the same local narrator: Kokoro `af_heart` at speed 1.0. A renamed name must not switch that line to the device voice. A slow, missing, or offline story lookup must not switch it either: the sentence waits for that same recording, or the storyteller asks the child to try again. A dotted word may still be pronounced by the device once the lookup has been checked. Settings → device voice, if the child or a grown-up chose it, still uses the device for every line.

## Done when

- `{hero}` becomes Nova and `{pet}` becomes `WR.petInfo().name` (the species name), in the story text, questions, and why-not notes.
- No other words are replaced. A saved name of "the" or "page" does not eat those words.
- Home, rename, and `wordRealms.save.v1` still show the typed name.
- All 42 chapters (6 realms × 7) still open. Renamed, blank, and older saves all read as Nova plus the storybook pet.
- Read to me, a sentence tap, a dotted word, an answer, and a page turn never overlap, and they stop the previous line.
- New sentences are in `assets/voice/manifest-story.json` and pass the story-voice ledger.
- `node tools/test/story-narrate.js`: fresh cache, a held story lookup, a missing lookup, a blocked recording, and an explicit device-voice setting. Narrative never uses the device voice unless that setting is on.

## Out of scope

The download-size change. Task 10. Publishing.
