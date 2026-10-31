"""Cut the 4x4 accessory sheet(s) (tools/art/acc*.jpg, GenerateImage, white background) into transparent 256px
WebP layers in assets/acc/<id>.webp (+ PNG fallback). Enclosed white (inside glasses rims) is keyed out too."""
import os, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "..", "..", "assets", "acc")
SHEETS = {"acc1": ["witch_hat", "wizard_hat", "pirate_hat", "santa_hat", "party_hat", "cat_ears", "round_glasses", "heart_shades",
                   "star_scarf", "bell_collar", "bow_tie", "fairy_wings", "angel_wings", "bat_wings", "butterfly_wings", "heart_balloon"]}
HEAD = {"witch_hat", "wizard_hat", "pirate_hat", "santa_hat", "party_hat", "cat_ears"}
HOLES = {"round_glasses"}
SEAL = {"angel_wings"}                    # white wings on white: seal the outline, fill the silhouette
BOX = {"fairy_wings": (0, -40), "heart_balloon": (-45, 0)}   # (top, bottom) px nudges where a neighbour pokes across the grid line
os.makedirs(OUT, exist_ok=True)
for sheet, ids in SHEETS.items():
    im = np.asarray(Image.open(os.path.join(HERE, sheet + ".jpg")).convert("RGB")).astype(float); H, W = im.shape[:2]
    for i, aid in enumerate(ids):
        r, c = divmod(i, 4); t, b = BOX.get(aid, (0, 0)); cell = im[r * H // 4 + t:(r + 1) * H // 4 + b, c * W // 4:(c + 1) * W // 4]
        d = np.sqrt(((cell - 255) ** 2).sum(axis=2)); near = d < 28
        lab, n = ndimage.label(near)
        border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
        bg = np.isin(lab, list(border))
        if aid in HOLES:
            for k in range(1, n + 1):
                m = lab == k
                if k not in border and m.sum() > 300: bg |= m
        fg = ~bg
        if aid in SEAL: fg = ndimage.binary_fill_holes(ndimage.binary_closing(fg, iterations=3))
        flab, fn = ndimage.label(fg); sizes = ndimage.sum(fg, flab, range(1, fn + 1))
        edge = set(np.unique(np.concatenate([flab[0], flab[-1], flab[:, 0], flab[:, -1]]))) - {0}
        fg = np.isin(flab, [k + 1 for k, s in enumerate(sizes) if s >= sizes.max() * 0.15 or (k + 1 not in edge and s >= 40)])
        inner = ndimage.binary_erosion(fg, iterations=2)
        alpha = np.where(inner, 255, np.where(fg, np.clip((d - 6) / 20, 0, 1) * 255, 0))
        ys, xs = np.where(fg); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        rgba = Image.fromarray(cell.astype(np.uint8)).convert("RGBA"); rgba.putalpha(Image.fromarray(alpha.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.5)))
        rgba = rgba.crop((x0, y0, x1, y1)); s = max(rgba.size); pad = int(s * 0.03); S = s + 2 * pad
        sq = Image.new("RGBA", (S, S)); sq.paste(rgba, ((S - rgba.width) // 2, S - pad - rgba.height if aid in HEAD else (S - rgba.height) // 2))   # hats: bottom-aligned; sq = sq.resize((256, 256), Image.LANCZOS)
        # remember the tight box (in % of the square) so the renderer can sit the item's real bottom on an anchor
        sq.save(os.path.join(OUT, aid + ".png")); sq.save(os.path.join(OUT, aid + ".webp"), "WEBP", quality=82, method=6)
        bb = sq.getchannel("A").getbbox(); print(aid, [round(v / 2.56) for v in bb])
