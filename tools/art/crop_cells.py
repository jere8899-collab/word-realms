"""Cut 2x2 GenerateImage character sheets (tools/art/<sheet>.jpg) into transparent 512px PNGs.
Background = the sheet's own border colour (white or mint), keyed out by a flood fill from each cell's border, so
white fur inside a dark outline survives. Usage: python3 tools/art/crop_cells.py  (writes the paths in SHEETS)."""
import os, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, "..", "..")
SHEETS = {
  "heroes1": ["avatars/hero_pumpkin", "avatars/hero_snow", "avatars/hero_sakura", "avatars/hero_summer"],
  "heroes2": ["avatars/hero_lunar", "avatars/hero_meadow", "avatars/hero_candy", "avatars/hero_ranger"],
  "heroes3": ["avatars/hero_mermaid", "avatars/hero_scholar", "avatars/hero_cloud", "avatars/hero_mathmage"],
  "heroes4": ["avatars/hero_knight", "avatars/hero_pirate", "avatars/hero_space", "avatars/hero_redhood"],
  "pets_new": ["pets/pet_unicorn", "pets/pet_panda", "pets/pet_kitty", "pets/pet_penguin"],
  "evo1": ["pets/pet_bunny_royal", "pets/pet_fox_royal", "pets/pet_dragon_royal", "pets/pet_owl_royal"],
  "evo2": ["pets/pet_unicorn_royal", "pets/pet_panda_royal", "pets/pet_kitty_royal", "pets/pet_penguin_royal"],
}
SEAL = {"pets_new"}
def cut(cell, bgc, tol=30, seal=False):
    d = np.sqrt(((cell - bgc) ** 2).sum(axis=2))
    near = d < tol
    lab, n = ndimage.label(near)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ~np.isin(lab, list(border))
    fg = ndimage.binary_opening(fg, iterations=1)
    flab, fn = ndimage.label(fg)
    sizes = ndimage.sum(fg, flab, range(1, fn + 1)); big = sizes.max()
    fg = np.isin(flab, [k + 1 for k, s in enumerate(sizes) if s >= big * 0.02])
    if seal:   # white fur on a white sheet: seal hairline gaps in the outline, then fill the silhouette
        fg = ndimage.binary_fill_holes(ndimage.binary_closing(fg, iterations=7)); return fg, d
    fg = ndimage.binary_fill_holes(fg) | (fg)
    # holes that ARE background (e.g. between arm and body) — reopen big enclosed bg-coloured areas
    holes = ndimage.binary_fill_holes(fg) & ~ndimage.binary_dilation(~np.isin(lab, list(border)) & ~near, iterations=0)
    hl, hn = ndimage.label(near & fg)
    for k in range(1, hn + 1):
        m = hl == k
        if m.sum() > 1500 and d[m].mean() < tol * 0.4: fg[m] = False
    return fg, d
for sheet, outs in SHEETS.items():
    im = np.asarray(Image.open(os.path.join(HERE, sheet + ".jpg")).convert("RGB")).astype(float)
    H, W = im.shape[:2]
    edge = np.concatenate([im[:4].reshape(-1, 3), im[-4:].reshape(-1, 3), im[:, :4].reshape(-1, 3), im[:, -4:].reshape(-1, 3)])
    bgc = np.median(edge, axis=0)
    for i, out in enumerate(outs):
        r, c = divmod(i, 2); cell = im[r * H // 2:(r + 1) * H // 2, c * W // 2:(c + 1) * W // 2]
        fg, d = cut(cell, bgc, seal=sheet in SEAL)
        ys, xs = np.where(fg); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        # solid inside the shape (white fur stays opaque); only the outer 2px rim fades by its distance to the background
        inner = ndimage.binary_erosion(fg, iterations=2)
        alpha = np.where(inner, 255, np.where(fg, np.clip((d - 6) / 20, 0, 1) * 255, 0))
        a = Image.fromarray(alpha.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.5))
        rgba = Image.fromarray(cell.astype(np.uint8)).convert("RGBA"); rgba.putalpha(a)
        rgba = rgba.crop((x0, y0, x1, y1))
        s = max(rgba.size); pad = int(s * 0.06); S = s + 2 * pad
        sq = Image.new("RGBA", (S, S), (0, 0, 0, 0)); sq.paste(rgba, ((S - rgba.width) // 2, S - pad - rgba.height))
        sq = sq.resize((512, 512), Image.LANCZOS)
        path = os.path.join(ROOT, "assets", out + ".png"); os.makedirs(os.path.dirname(path), exist_ok=True); sq.save(path)
        print(out, (x1 - x0, y1 - y0))
