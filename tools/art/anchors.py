"""Work out accessory anchors for every hero and pet picture (data/anchors.json), on the same 0–100 grid as the art.
  head: [x, y, w]  bottom-centre + width of a hat     faceTop: brow line (a hat's bottom must stay above it)
  face: [x, y, w]  centre + width of glasses           neck: [x, y, w] centre of a collar / bow tie / scarf
  back: [x, y, w]  centre of wings (drawn behind)      held: [x, y, w] centre of a held item (balloon, wand)
Heuristic from the alpha mask (head = the blob above the narrowest row between head and body), then HAND overrides
for art where ears or hair fool it. Re-run after adding art: python3 tools/art/anchors.py"""
import json, os, numpy as np
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."); os.chdir(ROOT)
m = json.load(open("assets/manifest.json"))
HAND = json.load(open("tools/art/anchors_hand.json")) if os.path.exists("tools/art/anchors_hand.json") else {}
out = {}
for a in m["assets"]:
    if a["type"] not in ("avatar", "pet") or not os.path.exists(a["path"]): continue
    al = np.asarray(Image.open(a["path"]).convert("RGBA").resize((100, 100), Image.LANCZOS))[:, :, 3] > 60
    ys, xs = np.where(al); top, bot = ys.min(), ys.max(); H = bot - top
    W = al.sum(axis=1)
    pet = a["type"] == "pet"
    lo, hi = top + int(H * (0.28 if pet else 0.3)), top + int(H * (0.62 if pet else 0.5))
    neck = lo + int(np.argmin(W[lo:hi])) if not pet else top + int(H * 0.55)
    head_rows = al[top:neck]; hx = np.where(head_rows.any(axis=0))[0]
    cx = float(np.mean(np.where(al[top:neck])[1])); headW = float(hx.max() - hx.min())
    hh = neck - top
    body = al[neck:bot]; bx = np.where(body.any(axis=0))[0]; bodyW = float(bx.max() - bx.min()) if len(bx) else headW
    r = lambda v: round(float(v), 1)
    an = {
        "head": [r(cx), r(top + hh * 0.24), r(headW * (0.62 if pet else 0.78))],
        "faceTop": r(top + hh * 0.42),
        "face": [r(cx), r(top + hh * (0.6 if pet else 0.58)), r(headW * (0.62 if pet else 0.6))],
        "neck": [r(cx), r(neck + (2 if pet else 1)), r(headW * 0.42)],
        "back": [r(cx), r(neck + (bot - neck) * 0.3), r(min(98, max(bodyW, headW) * 1.45))],
        "held": [r(min(92, cx + bodyW * 0.48)), r(neck + (bot - neck) * 0.45), 26.0],
    }
    for k, v in HAND.get(a["id"], {}).items(): an[k] = v
    out[a["id"]] = an
json.dump(out, open("data/anchors.json", "w"), indent=0, separators=(",", ":"))
print(len(out), "anchors")
