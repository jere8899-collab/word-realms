# Plan: 010 Lighter first visit

## Decision

Stop precaching every lesson bank on install. That was 97 JSON files, about 714 KB gzip, most of them never used on the map, and it is why each new lesson had to be trimmed to stay under 2 MB.

Keep three durable caches:

| Cache | What | Survives a new app version? |
|---|---|---|
| `wr-<hash>` | App shell (HTML, CSS, JS, manifest, 192 icon) | No. Rebuilt from the new shell. |
| `wrdata` | Lesson banks, home JSON, voice lookup files | Yes. |
| `wrart-<hash>` | Pictures and icons, as today | Yes, until the art itself changes. |
| `wrvoice-1` | MP3s, as today | Yes. |

Install stores the shell and the small home JSON only (`realms`, `shop`, `anchors`, `counts`, `lessons/index`). Install and the art warm-up use the browser's normal cache, so files the page just loaded are not downloaded again.

A bank or voice lookup is stored in `wrdata` the first time it is fetched (network first, so an online child still gets updates). Download in Settings fetches every bank, both voice lookups, the shell, and every picture.

On activate, banks and voice lookups are copied out of the previous `wr-…` cache into `wrdata` before that cache is deleted. That keeps a full offline download from the old app.

The map does not speak, so `WR.Voice.load()` waits until the first `WR.say`. The recordings themselves are untouched.

If a bank is missing, `WR.miss` / `WR.noteMiss` shows one kind line and does not clear the save.

Maths topic scripts stay in the shell because the map's crown line reads them.

## Files

- `tools/build_sw.py` generates `sw.js` (do not hand-edit `sw.js`).
- `js/offline.js` comments only; warm-up already sends the shown art.
- `js/voice.js` loads the lookup on first speech.
- `js/core.js` miss note. `js/lesson.js`, `js/story.js`, `js/learn.js`, `js/sg-english.js` catch it on the way in.
- `js/main.js` Download line says stories and pictures.
- Tests: `tools/test/lightload.js`, `tools/test/pwa.js`, new `tools/test/firstload.js`.
- README and a REVIEW row marked not live.

## Not chosen

- Trimming more sentences. That only buys one more content drop.
- Dropping the 512 icon again. Commit 8e331ac already did that. Leave it out of the shell.
- Splitting maths topic files. It would blank the crown count on the map until a later load.
