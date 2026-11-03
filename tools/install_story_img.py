"""Install a GenerateImage Storybook PNG as the game's story picture pair.

Writes:
  assets/stories/<id>.jpg  — 960×720 RGB JPEG, quality ~88
  assets/web/<id>.webp     — same size, quality ~80

Usage:
  python3 tools/install_story_img.py <id> <png-or-jpg-path>
  python3 tools/install_story_img.py --batch id1=path1 id2=path2 …

Never Higgsfield. Match existing chapter-3 files (story_a1_3.jpg) for size/format.
"""
from __future__ import annotations
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..")
STORIES = os.path.join(ROOT, "assets", "stories")
WEB = os.path.join(ROOT, "assets", "web")
SIZE = (960, 720)
JPG_Q, WEBP_Q = 88, 80


def install(img_id: str, src: str) -> tuple[str, str]:
    """Convert src → assets/stories/<id>.jpg + assets/web/<id>.webp. Returns the two paths."""
    if not img_id or "/" in img_id or "\\" in img_id or ".." in img_id:
        raise SystemExit(f"bad id: {img_id!r}")
    if not os.path.isfile(src):
        raise SystemExit(f"missing source: {src}")
    os.makedirs(STORIES, exist_ok=True)
    os.makedirs(WEB, exist_ok=True)
    im = Image.open(src).convert("RGB")
    if im.size != SIZE:
        im = im.resize(SIZE, Image.LANCZOS)
    jpg = os.path.join(STORIES, f"{img_id}.jpg")
    webp = os.path.join(WEB, f"{img_id}.webp")
    im.save(jpg, "JPEG", quality=JPG_Q, optimize=True)
    im.save(webp, "WEBP", quality=WEBP_Q, method=6)
    return jpg, webp


def main(argv: list[str]) -> None:
    if len(argv) >= 2 and argv[0] == "--batch":
        pairs = []
        for spec in argv[1:]:
            if "=" not in spec:
                raise SystemExit(f"batch item needs id=path, got {spec!r}")
            i, p = spec.split("=", 1)
            pairs.append((i.strip(), p.strip()))
    elif len(argv) == 2:
        pairs = [(argv[0], argv[1])]
    else:
        raise SystemExit(__doc__)
    for img_id, src in pairs:
        jpg, webp = install(img_id, src)
        print(f"{img_id}: {os.path.getsize(jpg)} B jpg, {os.path.getsize(webp)} B webp ← {src}")


if __name__ == "__main__":
    main(sys.argv[1:])
