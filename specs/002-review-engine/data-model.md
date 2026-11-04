# Data model (inside wordRealms.save.v1)

- `review` (new `WR.BLOCKS` block): `{ items: { "<scope>:<itemKey>": Rec }, mig: 0|1 }`
  - scope = `"<rid>/<skill>"` for realm banks (shared by the Singapore track), `"sg-<lv>/<game>"` for Singapore-only games
  - reading keys use the question + its passage title (questions can repeat across passages)
  - `Rec = { s: step 0…, d: next due ms, t: last answer ms, l: 1|0, n: answers, r: right, w: wrong, sk: skill tag, g?: 1 garden owns it }`
- `mistakes[]` (garden): unchanged fields + `t` last answer, `n` answers, `l`, `r`, `w`, `rk` lesson record key; bloomed plants keep `bloomed`, get `due` again
- `charms.cards[k]`: unchanged `b, d, r, w, at` + `t` last graded answer, `n` graded answers
- `earn.review`: review ⭐ paid today (reset with the day, merged by max)
- bank items: `sk` = `"<skill>.<point>"` (data/<level>/{grammar,vocab,listening,reading}.json)

Migration (`WR.Review.migrate`, once per save, flagged `review.mig`): bloomed plants → `box ≥ 4`, `due = bloomedAt + 90 d` (if already past: spread over the next 30 days); 💎 charms → `d = d + 180 d` (same spread). Everything else stays.
Cloud: `RV.merge` per record, later `t` wins. Two tabs: the whole save is adopted (R5), so records travel with it.
