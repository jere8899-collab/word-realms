# Plan: 012 Thinking skills

## Approach

One small helper, `js/think.js`, decides which questions in a round carry a prompt and draws the buttons. `js/lesson.js` and `js/math.js` call it. Word problems are the maths topics that already have `story: true` (Fairytale Problems and the later story topics). No topic text is rewritten.

The rate is `min(floor(n/8), max(1, round(n/9)))` prompts in a round of n questions, and none when n is under 8. That stays inside 1 in 10 through 1 in 8. Boss, dragon, crown check, placement, and guardian rounds are skipped so the pass mark and those fights are unchanged.

"How sure" is stored as `state.think = { sure, sureRight, asks }`. A cloud merge keeps the copy with more recorded answers. The prompt is an extra tap on the same card, not an extra question, so the phone flow stays one round of the same length.

## Files

- `js/think.js` new
- `js/lesson.js`, `js/math.js` call the helper
- `js/cloud.js` merges `state.think`
- `index.html` loads the helper; `tools/build_sw.py` regenerates `sw.js`
- `css/style.css` tap size and wrap
- `tools/test/thinking.js`
- `specs/012-thinking-skills/`
- README and REVIEW note, marked in progress, not live

## Art

Not generated. Optional later: three small pastel chibi cards for "draw a model", "work backwards", and "look for a pattern".
