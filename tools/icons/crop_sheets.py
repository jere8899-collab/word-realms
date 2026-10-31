"""Crop the 4x4 icon sheets into transparent 128px icons (assets/icons/<slug>.webp) + 256px PNG masters."""
import json, numpy as np
from PIL import Image
from scipy import ndimage
import os; HERE = os.path.dirname(os.path.abspath(__file__)); P = json.load(open(os.path.join(HERE, "sheets.json")))
OUT = '/workspace/cefr-quest/assets/icons'
override = {('sheet21', 1): 'unlock'}           # the clearly-open padlock replaces sheet15's
skip = {('sheet15', 'unlock')}
made = {}
for p in P:
    name = f"sheet{p['sheet']:02d}"
    im = Image.open(name + '.jpg').convert('RGB'); a = np.asarray(im).astype(int)
    H, W = a.shape[:2]
    g = 4 if p['sheet'] < 21 else 2
    items = [x[1] for x in p['items']]
    if p['sheet'] == 21: items = ['warning', 'unlock', None, None]
    cw, ch = W / g, H / g
    for i, slug in enumerate(items):
        if slug is None or (name, slug) in skip: continue
        r, c = divmod(i, g)
        x0, y0, x1, y1 = int(c*cw), int(r*ch), int((c+1)*cw), int((r+1)*ch)
        cell = a[y0:y1, x0:x1]
        white = (cell.min(axis=2) > 236)
        # background = near-white connected to the cell border
        lab, n = ndimage.label(white)
        border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
        bg = np.isin(lab, list(border))
        fg = ~bg
        # drop tiny specks that belong to neighbours at the cell edge
        flab, fn = ndimage.label(fg)
        if fn:
            sizes = ndimage.sum(fg, flab, range(1, fn+1))
            big = int(np.argmax(sizes)) + 1
            edge = set(np.unique(np.concatenate([flab[0], flab[-1], flab[:, 0], flab[:, -1]]))) - {0}
            # keep the main shape and its own detached bits; drop specks and neighbours' tips poking in at the cell edge
            keep = [k+1 for k, s in enumerate(sizes) if k+1 == big or (k+1 not in edge and s >= max(60, sizes.max()*0.004)) or s >= sizes.max()*0.25]
            fg = np.isin(flab, keep)
        ys, xs = np.where(fg)
        by0, by1, bx0, bx1 = ys.min(), ys.max()+1, xs.min(), xs.max()+1
        # soft edge: alpha from distance to white on the 2px rim
        dist = ndimage.distance_transform_edt(fg)
        whiteness = (255 - cell.min(axis=2)) / 255.0
        alpha = np.where(dist >= 2, 1.0, np.clip(whiteness * 3.0, 0, 1))
        alpha = np.where(fg | (ndimage.binary_dilation(fg, iterations=1)), alpha, 0)
        rgba = np.dstack([cell, (alpha*255).astype(int)]).astype('uint8')
        crop = Image.fromarray(rgba, 'RGBA').crop((bx0, by0, bx1, by1))
        s = max(crop.size); pad = int(s*0.04)
        sq = Image.new('RGBA', (s+2*pad, s+2*pad), (0, 0, 0, 0))
        sq.paste(crop, ((s+2*pad-crop.width)//2, (s+2*pad-crop.height)//2))
        sq.resize((256, 256), Image.LANCZOS).save(f'png/{slug}.png')
        sq.resize((128, 128), Image.LANCZOS).save(f'{OUT}/{slug}.webp', 'WEBP', quality=82, method=6)
        made[slug] = (name, i)
print(len(made))
json.dump(made, open('made.json', 'w'))
