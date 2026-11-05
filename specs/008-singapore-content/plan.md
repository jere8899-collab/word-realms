# 008 plan
- Cleanup first (no behaviour change): tools/sg_build.py's three copy-pasted per-kind loops → one small helper each, so
  adding content touches only data files.
- New tools/sg_more.py: MORE = { level: { synth: [...], edit: [...], cloze: [...] } } (same shapes as sg_synth/edit/cloze).
- tools/sg_build.py imports MORE and appends; adds check_sg (settings/festival counts) and prints the table.
- Run sg_build, build_voice for the new lines, build_data (counts), build_sw; tools/test/sg-more.js + the full suite.
