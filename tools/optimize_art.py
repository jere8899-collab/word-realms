"""Make the light WebP copies of all game art in assets/web/ (run after adding or replacing art).

Backgrounds -> <id>_1280.webp (desktop) and <id>_720.webp (phones), map thumbnails -> <id>_thumb.webp (360 px),
pets/avatars -> <id>.webp (512 px, transparent), UI art (mirror, quill) -> <name>.webp.
The original PNGs stay as fallbacks; the manifest gains a "web" block per asset.
"""
import json, os
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..")
os.chdir(ROOT)
OUT = "assets/web"
os.makedirs(OUT, exist_ok=True)
m = json.load(open("assets/manifest.json"))
before = after = 0
for a in m["assets"]:
    p = a["path"]
    if not os.path.exists(p):
        continue
    before += os.path.getsize(p)
    im, base = Image.open(p), os.path.splitext(os.path.basename(p))[0]
    if a["type"] == "background":
        im, web = im.convert("RGB"), {}
        for w, key in ((1280, "large"), (720, "small")):
            f = f"{OUT}/{base}_{w}.webp"
            im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(f, "WEBP", quality=78, method=6)
            web[key] = f
        if a.get("thumb") and os.path.exists(a["thumb"]):
            f = f"{OUT}/{base}_thumb.webp"
            Image.open(a["thumb"]).convert("RGB").resize((360, 203), Image.LANCZOS).save(f, "WEBP", quality=80, method=6)
            web["thumb"] = f
        a["web"] = web
        after += os.path.getsize(web["large"])
    else:
        f = f"{OUT}/{base}.webp"
        im.convert("RGBA").save(f, "WEBP", quality=82, method=6)
        a["web"] = {"large": f, "small": f}
        after += os.path.getsize(f)
for name in ("mirror", "quill"):
    src = f"assets/ui/{name}.png"
    if os.path.exists(src):
        Image.open(src).convert("RGBA").save(f"{OUT}/{name}.webp", "WEBP", quality=85, method=6)
json.dump(m, open("assets/manifest.json", "w"), indent=2, ensure_ascii=False)
print(f"manifest art: {before // 1024} KB of PNG -> {after // 1024} KB of WebP (desktop sizes)")
