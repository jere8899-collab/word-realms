# Plan

Keep `{hero}` and `{pet}` as the only tokens. `js/story.js` `fill` and `tools/build_voice.py` `story_fill` both write Nova and the species pet name. Record the sentences that change with the local Kokoro model (`af_heart`, speed 1.0). Add the same pronunciation fixes the old "our hero" lines needed (`Nova read` → red, `said Nova.`, `Nova spliced`, `Nova and … wave`). Audit the new lines with the existing local whisper ledger. Do not rewrite saves.
