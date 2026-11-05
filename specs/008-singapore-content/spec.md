# 008 Bring Singapore in, fairly (AGENT-BRIEF-2026-11-04 Task 8)

## Facts measured in the data (2026-11-05, before)
- Main CEFR banks: "singapore" 14, hawker 0, MRT 0, HDB 0, Hari Raya 0, Deepavali 0, Chinese New Year 3, Christmas 3;
  against winter 67 and snow/snowman 137.
- Singapore packs (13 levels): hawker 28, MRT 9, Chinese New Year 11, Racial Harmony Day 11, Christmas 0, Hari Raya 0,
  Deepavali 0, National Day 0, HDB 0, void deck 0. No snow/winter anywhere in tools/sg_*.py, so nothing to reduce there.
- Three kinds per level: 🔗 Join It Up (synth, typed), 🔍 Spot & Fix (edit passages), 🧩 Story Gaps (cloze passages).

## What this wave adds
Local settings and fair festivals, in the Singapore packs, with names from all communities (Chinese, Malay, Indian,
Eurasian and others). Nothing religious is asserted as fact for a child: the texts are about what families do, eat, wear
and share. Mature topics stay in jc/adult (none added here).
- p2: 4 new Join It Up items (MRT, HDB, canteen, CCA) + 1 new Spot & Fix passage (Hari Raya visiting).
- p3: 2 new Spot & Fix passages (Deepavali at Little India; National Day at the void deck) + 1 Story Gaps (Hari Raya).
- p4: 1 Spot & Fix (Deepavali kolam) + 1 Story Gaps (Christmas at a void-deck party) + 2 Join It Up.
- p5: 1 Spot & Fix (National Day) + 1 Story Gaps (Deepavali) + 2 Join It Up (Hari Raya, Christmas).
- p6: 1 Spot & Fix (Hari Raya) + 1 Story Gaps (National Day / Racial Harmony) + 2 Join It Up.
- s1/s2: 1 Spot & Fix each (Deepavali; Hari Raya), 1 Story Gaps each (National Day; Christmas), 2 Join It Up each.
- s3/s4 (few items today): 2 Spot & Fix + 1 Story Gaps each (festivals + local settings).
- jc1/jc2/adult are empty today: 2 Spot & Fix + 1 Story Gaps each, older voices, no change in tone rules.

## Also
- `check_sg` in tools/sg_build.py: counts of local settings and festivals per level; every Singapore level must have at
  least one local setting and the six named occasions (Chinese New Year, Hari Raya, Deepavali, Christmas, Racial Harmony
  Day, National Day) must all appear across the track, with no festival left to one level only.
- New content is listed for a human cultural check before release (this file's appendix + the report to Jeremy).

## Done when
The scan shows balanced festival counts and local settings at every Singapore level; the SG tests and the full suite pass.
