"""Cut the two GenerateImage sticker sheets (3x3 cute pastel objects, not Higgsfield) into assets/words/word_<name>.png
(transparent, 256 px) and register them in assets/manifest.json as type "word". Run tools/optimize_art.py afterwards."""
import json, sys, numpy as np
from PIL import Image
from scipy import ndimage
SHEETS = [("assets/words/sheet1.jpg", ['apple','dog','house','sun','bike','bread','shoe','fish','cake']),
          ("assets/words/sheet2.jpg", ['strawberry','rabbit','flower','ball','clock','umbrella','boat','cat','bed'])]
m = json.load(open('assets/manifest.json')); m['assets'] = [a for a in m['assets'] if a.get('type') != 'word']
for path, names in SHEETS:
    im = Image.open(path).convert('RGB'); W, H = im.size; cw, ch = W / 3, H / 3
    for i, n in enumerate(names):
        r, c = divmod(i, 3); a = np.array(im.crop((int(c*cw), int(r*ch), int((c+1)*cw), int((r+1)*ch)))).astype(int)
        white = a.min(axis=2) > 232
        lab, _ = ndimage.label(white); edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
        bg = np.isin(lab, list(edge))
        fg, k = ndimage.label(~bg); sizes = ndimage.sum(np.ones_like(fg), fg, range(1, k + 1))
        big = int(np.argmax(sizes)) + 1; h, w = fg.shape
        edge_lab = set(np.unique(np.concatenate([fg[0], fg[-1], fg[:, 0], fg[:, -1]]))) - {0}
        keep = [j + 1 for j, s in enumerate(sizes) if j + 1 == big or (s >= 0.04 * sizes.max() and j + 1 not in edge_lab)]   # drop bits of neighbouring cells
        mask = np.isin(fg, keep)
        mask = ndimage.binary_fill_holes(mask) & ~(bg & ~ndimage.binary_fill_holes(mask))
        rgba = Image.fromarray(np.dstack([a.astype('uint8'), np.where(mask, 255, 0).astype('uint8')]), 'RGBA')
        rgba = rgba.crop(rgba.getbbox()); side = int(max(rgba.size) * 1.08)
        cv = Image.new('RGBA', (side, side), (0, 0, 0, 0)); cv.paste(rgba, ((side - rgba.width) // 2, (side - rgba.height) // 2))
        cv.resize((256, 256), Image.LANCZOS).save(f'assets/words/word_{n}.png')
        m['assets'].append({'id': f'word_{n}', 'type': 'word', 'name': n, 'path': f'assets/words/word_{n}.png', 'aspect_ratio': '1:1', 'size': [256, 256], 'transparent': True,
          'prompt': '3x3 sticker sheet of cute kawaii chibi objects, big sparkly eyes, soft pastel palette, clean soft lineart, gentle cel shading, white background (one cell per word)',
          'generated': 'GenerateImage (Grok Bot built-in image generator), Oct 2026 — not Higgsfield'})
json.dump(m, open('assets/manifest.json', 'w'), indent=2, ensure_ascii=False)
print('words:', sum(1 for a in m['assets'] if a['type'] == 'word'))
