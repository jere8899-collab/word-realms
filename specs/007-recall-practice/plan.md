# 007 plan
- Cleanup first (no behaviour change): js/lesson.js, the classic answer buttons in one helper (optsHTML / bindOpts),
  used by the default branch; the recall reveal reuses them.
- js/recall.js (new, before js/lesson.js): WR.Recall = { CONFIG, canon, eligible(it), on(it, L), mask(text), mark(input, it) }.
- js/lesson.js: normalize keeps `recall`; qBody/render: a "type it first" card (#recIn, #checkBtn, #recShow, hidden #recOpts).
- tools/build_data.py: recall_ok (mirror of WR.Recall.eligible), mark_recall (per-level share, deterministic), check_recall report.
- css: .recall card, mask, 44 px taps.
- tools/test/recall.js; existing tests whose helpers answer through .opt learn the "type it first" card.
