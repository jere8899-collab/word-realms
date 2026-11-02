"""Cut the two GenerateImage sticker sheets (3x3 cute pastel objects, not Higgsfield) into assets/words/word_<name>.png
(transparent, 256 px) and register them in assets/manifest.json as type "word" (the cutter is tools/sticker_sheet.py).
Run tools/optimize_art.py afterwards."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__)); os.chdir(os.path.join(os.path.dirname(__file__), ".."))
from sticker_sheet import cut, sticker, register
SHEETS = [("assets/words/sheet1.jpg", ['apple','dog','house','sun','bike','bread','shoe','fish','cake']),
          ("assets/words/sheet2.jpg", ['strawberry','rabbit','flower','ball','clock','umbrella','boat','cat','bed'])]
m = json.load(open('assets/manifest.json')); entries = []
for path, names in SHEETS:
    for n, cell in zip(names, cut(path, "thirds")):
        sticker(cell, 256).save(f'assets/words/word_{n}.png')
        entries.append({'id': f'word_{n}', 'type': 'word', 'name': n, 'path': f'assets/words/word_{n}.png', 'aspect_ratio': '1:1', 'size': [256, 256], 'transparent': True,
          'prompt': '3x3 sticker sheet of cute kawaii chibi objects, big sparkly eyes, soft pastel palette, clean soft lineart, gentle cel shading, white background (one cell per word)',
          'generated': 'GenerateImage (Grok Bot built-in image generator), Oct 2026 — not Higgsfield'})
register(m, entries, 'word')
json.dump(m, open('assets/manifest.json', 'w'), indent=2, ensure_ascii=False)
print('words:', sum(1 for a in m['assets'] if a['type'] == 'word'))
