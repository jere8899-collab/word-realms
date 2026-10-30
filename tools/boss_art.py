"""C6 realm bosses: cut the GenerateImage portraits (cute pastel chibi, not Higgsfield) out of their white background
into assets/ui/boss_<id>.png (512 px, transparent) and register them in assets/manifest.json. Run tools/optimize_art.py afterwards."""
import json, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
BOSSES = {"buzzbloom": "Queen Buzzbloom", "gumdrop": "Baron Gumdrop", "mossbeard": "Old Mossbeard", "nimbus": "Nimbus the Cloud Griffin"}
m = json.load(open("assets/manifest.json"))
for bid, name in BOSSES.items():
    im = Image.open(f"assets/ui/boss_{bid}_src.jpg").convert("RGB"); a = np.array(im).astype(int)
    white = a.min(axis=2) > 238
    lab, _ = ndimage.label(white); edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    fg = ndimage.binary_fill_holes(~bg)
    fl, k = ndimage.label(fg); sizes = ndimage.sum(np.ones_like(fl), fl, range(1, k + 1))
    fg = np.isin(fl, [j + 1 for j, s in enumerate(sizes) if s >= 0.002 * fg.size])   # drop specks, keep sparkles that are big enough
    alpha = Image.fromarray((fg * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(1.2))
    rgba = im.convert("RGBA"); rgba.putalpha(alpha); rgba = rgba.crop(rgba.getbbox())
    side = int(max(rgba.size) * 1.04); cv = Image.new("RGBA", (side, side), (0, 0, 0, 0)); cv.paste(rgba, ((side - rgba.width) // 2, (side - rgba.height) // 2), rgba)
    cv.resize((512, 512), Image.LANCZOS).save(f"assets/ui/boss_{bid}.png")
    m["assets"] = [x for x in m["assets"] if x["id"] != f"boss_{bid}"]
    m["assets"].append({"id": f"boss_{bid}", "type": "boss", "name": name, "path": f"assets/ui/boss_{bid}.png", "aspect_ratio": "1:1", "size": [512, 512], "transparent": True,
        "prompt": "cute kawaii chibi realm boss portrait (mischievous but friendly), big sparkly anime eyes, soft pastel palette, clean soft lineart, gentle cel shading, storybook illustration, white background (cut out)",
        "generated": "GenerateImage (Grok Bot built-in image generator), Oct 2026 — not Higgsfield",
        "web": {"large": f"assets/web/boss_{bid}.webp", "small": f"assets/web/boss_{bid}.webp"}})
json.dump(m, open("assets/manifest.json", "w"), indent=2, ensure_ascii=False)
print("bosses:", [x["id"] for x in m["assets"] if x["type"] == "boss"])
