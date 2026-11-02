"""✂️ One cutter for the GenerateImage 3x3 sticker sheets on white (never Higgsfield), shared by tools/word_art.py (A1 word pictures)
and tools/scene_art.py (R19 feeling scenes).

 • cells(im)        -> the 9 cell boxes in reading order. split="gaps" finds the white gutters between the stickers (rows first, then
                       the columns inside each row), so a sticker that leans past a third line isn't clipped; split="thirds" cuts blind thirds.
 • sticker(cell)    -> RGBA, the white background made transparent (flood fill from the cell edge, so white inside the sticker stays),
                       stray bits of neighbouring stickers dropped, centred on a square canvas with 4 % margin.
 • register(m, entries, type) -> replaces that type's manifest entries in place (same position, so other art keeps its order).
Run tools/optimize_art.py afterwards for the WebP copies (assets/web/<id>.webp), then tools/build_sw.py for the offline art list."""
import numpy as np
from PIL import Image
from scipy import ndimage
WHITE = 232

def _gutter(ink, lo, hi):  # middle of the longest run of the emptiest lines in ink[lo:hi]
    seg = ink[lo:hi]; low = seg <= seg.min() + 2; best, run, start = (0, lo + len(seg) // 2), 0, 0
    for i, v in enumerate(low):
        if v: run, start = run + 1, (start if run else i)
        else: run = 0
        if run > best[0]: best = (run, lo + start + run // 2)
    return best[1]

def cells(im, split="gaps"):
    a = np.array(im.convert("RGB")); H, W = a.shape[:2]; ink = a.min(axis=2) <= WHITE
    if split == "thirds":
        cw, ch = W / 3, H / 3
        return [(int(c * cw), int(r * ch), int((c + 1) * cw), int((r + 1) * ch)) for r in range(3) for c in range(3)]
    rows = ink.sum(axis=1); ys = [0, _gutter(rows, H // 3 - 90, H // 3 + 90), _gutter(rows, 2 * H // 3 - 90, 2 * H // 3 + 90), H]
    out = []
    for r in range(3):
        cols = ink[ys[r]:ys[r + 1]].sum(axis=0); xs = [0, _gutter(cols, W // 3 - 90, W // 3 + 90), _gutter(cols, 2 * W // 3 - 90, 2 * W // 3 + 90), W]
        out += [(xs[c], ys[r], xs[c + 1], ys[r + 1]) for c in range(3)]
    return out

def sticker(cell, size, min_part=0.04):  # min_part: smallest separate piece kept (share of the main sticker), e.g. a dropped ice cream
    a = np.array(cell.convert("RGB")).astype(int)
    white = a.min(axis=2) > WHITE
    lab, _ = ndimage.label(white); edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    fg, k = ndimage.label(~bg); sizes = ndimage.sum(np.ones_like(fg), fg, range(1, k + 1))
    big = int(np.argmax(sizes)) + 1
    edge_lab = set(np.unique(np.concatenate([fg[0], fg[-1], fg[:, 0], fg[:, -1]]))) - {0}
    keep = [j + 1 for j, s in enumerate(sizes) if j + 1 == big or (s >= min_part * sizes.max() and j + 1 not in edge_lab)]   # drop bits of neighbouring cells
    mask = np.isin(fg, keep)
    mask = ndimage.binary_fill_holes(mask) & ~(bg & ~ndimage.binary_fill_holes(mask))
    rgba = Image.fromarray(np.dstack([a.astype("uint8"), np.where(mask, 255, 0).astype("uint8")]), "RGBA")
    rgba = rgba.crop(rgba.getbbox()); side = int(max(rgba.size) * 1.08)
    cv = Image.new("RGBA", (side, side), (0, 0, 0, 0)); cv.paste(rgba, ((side - rgba.width) // 2, (side - rgba.height) // 2))
    return cv.resize((size, size), Image.LANCZOS)

def cut(path, split="gaps"):
    im = Image.open(path).convert("RGB")
    return [im.crop(b) for b in cells(im, split)]

def register(m, entries, typ):  # new entries take the place of the old ones of this type (appended if the type is new)
    old = [i for i, a in enumerate(m["assets"]) if a.get("type") == typ]
    keep = {a["id"]: a.get("web") for a in m["assets"] if a.get("type") == typ}
    for e in entries:
        if keep.get(e["id"]): e["web"] = keep[e["id"]]
    at = old[0] if old else len(m["assets"])
    m["assets"] = [a for a in m["assets"] if a.get("type") != typ]
    m["assets"][at:at] = entries
