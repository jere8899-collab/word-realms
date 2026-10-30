"""C6 realm bosses + 🛡️ maths Grade Guardians: cut the GenerateImage portraits (cute pastel chibi, not Higgsfield) out of their
white background into assets/ui/<asset id>.png (512 px, transparent) and register them in assets/manifest.json.
Sources: assets/ui/<asset id>_src.jpg (missing sources are skipped; up-to-date PNGs are left alone). Run tools/optimize_art.py afterwards.
Maths guardians (js/math-goals.js) fall back to painted Sumi with a badge until their portrait exists."""
import json, os, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
BOSSES = {"boss_buzzbloom": "Queen Buzzbloom", "boss_gumdrop": "Baron Gumdrop", "boss_mossbeard": "Old Mossbeard", "boss_nimbus": "Nimbus the Cloud Griffin",
          "mboss_bramble": "Bramble the Button Bear", "mboss_hootsworth": "Professor Hootsworth", "mboss_ottilie": "Captain Ottilie the Otter",
          "mboss_shellby": "Sage Shellby the Turtle", "mboss_quartzy": "Quartzy the Crystal Golem", "mboss_lumina": "Lumina the Calculus Unicorn"}
m = json.load(open("assets/manifest.json"))
for bid, name in BOSSES.items():
    src, out = f"assets/ui/{bid}_src.jpg", f"assets/ui/{bid}.png"
    if not os.path.exists(src) or (os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(src) and any(x["id"] == bid for x in m["assets"])): continue
    im = Image.open(src).convert("RGB"); a = np.array(im).astype(int)
    white = a.min(axis=2) > 238
    lab, _ = ndimage.label(white); edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    fg = ndimage.binary_fill_holes(~bg)
    fl, k = ndimage.label(fg); sizes = ndimage.sum(np.ones_like(fl), fl, range(1, k + 1))
    fg = np.isin(fl, [j + 1 for j, s in enumerate(sizes) if s >= 0.002 * fg.size])   # drop specks, keep sparkles that are big enough
    alpha = Image.fromarray((fg * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(1.2))
    rgba = im.convert("RGBA"); rgba.putalpha(alpha); rgba = rgba.crop(rgba.getbbox())
    side = int(max(rgba.size) * 1.04); cv = Image.new("RGBA", (side, side), (0, 0, 0, 0)); cv.paste(rgba, ((side - rgba.width) // 2, (side - rgba.height) // 2), rgba)
    cv.resize((512, 512), Image.LANCZOS).save(out)
    m["assets"] = [x for x in m["assets"] if x["id"] != bid]
    m["assets"].append({"id": bid, "type": "boss", "name": name, "path": out, "aspect_ratio": "1:1", "size": [512, 512], "transparent": True,
        "prompt": "cute kawaii chibi realm boss portrait (mischievous but friendly), big sparkly anime eyes, soft pastel palette, clean soft lineart, gentle cel shading, storybook illustration, white background (cut out)",
        "generated": "GenerateImage (Grok Bot built-in image generator), Oct 2026 — not Higgsfield",
        "web": {"large": f"assets/web/{bid}.webp", "small": f"assets/web/{bid}.webp"}})
json.dump(m, open("assets/manifest.json", "w"), indent=2, ensure_ascii=False)
print("bosses:", [x["id"] for x in m["assets"] if x["type"] == "boss"])
