"""🎭 R19 wave 5 (REVIEW-2026-11-01): cut the two GenerateImage feeling-scene sticker sheets (3x3, same chibi child per sheet, not Higgsfield)
into assets/scenes/scene_<id>.png (transparent, 384 px) and register them in assets/manifest.json as type "scene"
(cutter: tools/sticker_sheet.py, white gutters found, not blind thirds). Then: tools/optimize_art.py -> assets/web/scene_<id>.webp, tools/build_sw.py.
Ids name what the picture SHOWS when the feeling is ambiguous (scene_kitten_hug, scene_gift_hold): those are only used as distractors."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__)); os.chdir(os.path.join(os.path.dirname(__file__), ".."))
from sticker_sheet import cut, sticker, register
GIRL = "chibi kid with pink fluffy hair, mint flower clip and lavender hoodie"; BOY = "chibi boy with sky-blue hair, yellow T-shirt and mint shorts"
SHEETS = [("assets/scenes/feel_sheet1.jpg", GIRL, [
    ("exhausted", "slumped and yawning, leaning on a heavy backpack"), ("puzzled", "scratching their head, looking at a map"),
    ("embarrassed", "face hidden in hands, red cheeks, juice spilt on the floor"), ("proud", "holding a gold trophy, hand on hip"),
    ("furious", "angry steam puffs, stomping near a knocked-over block tower"), ("scared", "hiding behind a big tree in a dark forest, mouth open"),
    ("disappointed", "looking down at an ice cream dropped on the ground"), ("kitten_hug", "eyes shut, big smile, hugging a kitten"),
    ("bored", "chin on hand at a desk with a book and a mug")]),
  ("assets/scenes/feel_sheet2.jpg", BOY, [
    ("excited", "jumping with arms up, a gift box flying"), ("nervous", "hand at mouth, sweat drop, standing on a little wooden stage"),
    ("delighted", "laughing, hugging a fluffy puppy"), ("shy", "peeking from behind a door with a small blush"),
    ("frustrated", "tangled in kite string, eyes squeezed shut, shouting"), ("amazed", "mouth open, looking up at a shooting star"),
    ("gift_hold", "calmly holding a gift box"), ("determined", "fists clenched, climbing a hill to a flag"),
    ("lonely", "sitting alone on a bench, a leaf falling, sad face")])]
m = json.load(open("assets/manifest.json")); entries = []
for path, who, cells in SHEETS:
    for (n, shows), cell in zip(cells, cut(path)):
        f = f"assets/scenes/scene_{n}.png"; sticker(cell, 384, min_part=0.01).save(f)
        entries.append({"id": f"scene_{n}", "type": "scene", "name": n.replace("_", " "), "path": f, "aspect_ratio": "1:1", "size": [384, 384], "transparent": True,
          "prompt": f"3x3 sticker sheet, cute anime chibi {who}, one feeling per cell, soft pastel palette, clean soft lineart, white background; this cell: {shows}",
          "generated": "GenerateImage (Grok Bot built-in image generator), Nov 2026 — not Higgsfield"})
register(m, entries, "scene")
json.dump(m, open("assets/manifest.json", "w"), indent=2, ensure_ascii=False)
print("scenes:", sum(1 for a in m["assets"] if a["type"] == "scene"))
