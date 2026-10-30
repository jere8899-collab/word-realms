"""Run: python3 tools/build_data.py  -> writes data/<level>/<skill>.json (+ b1/quest.json, c1/debate.json, <level>/speaking.json)."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from c_a1 import A1; from c_a2 import A2; from c_b1 import B1, QUEST; from c_b2 import B2; from c_c1 import C1, DEBATE; from c_c2 import C2
from c_speaking import SPEAKING
from c_writing import WRITING, LEVEL_BANK
from c_stories import STORIES  # 📜 Storybook Chapters
from w1_a import W1A; from w1_b import W1B  # Content Wave 1 (2026-10-30)
ROOT = os.path.join(os.path.dirname(__file__), "..", "data")
D = {"a1": A1, "a2": A2, "b1": B1, "b2": B2, "c1": C1, "c2": C2}
tot = 0; counts = {}
for lvl, extra in {**W1A, **W1B}.items():  # merge extra items into the base banks
    for sk, val in extra.items():
        if sk == "reading": D[lvl][sk]["passages"].extend(val["passages"])
        else: D[lvl][sk].extend(val)
# ---- C3 (review 2026-10-30): rule + example explanations and a "why not" note for every wrong option; C5 kid-friendly C1/C2 stems ----
from c3_a import C3A; from c3_b import C3B; from c3_c import C3C
C3 = {**C3A, **C3B, **C3C}
def _short(t, n=90):
    t = re.sub(r"\s+", " ", t or "").strip(); return t if len(t) <= n else t[:n].rsplit(" ", 1)[0] + "…"
_c3_used = set()
for lvl, skills in D.items():
    for sk, val in skills.items():
        items = [q for p in val["passages"] for q in p["questions"]] if sk == "reading" else val
        ov = C3.get(f"{lvl}/{sk}", {})
        for q in items:
            if q["type"] == "order": continue
            right = q["options"][q["answer"]]; wrong = [o for i, o in enumerate(q["options"]) if i != q["answer"]]
            k = q["q"] + (" [" + q["pic"] + "]" if q.get("pic") else "")
            hit = ov.get(k) or ov.get(q["q"])
            if hit:
                _c3_used.add((f"{lvl}/{sk}", k if k in ov else q["q"]))
                if len(hit) == 3: newq, ex, notes = hit
                else: newq = None; ex, notes = hit
                assert len(notes) == 3, (lvl, sk, q["q"])
                if newq: q["q"] = newq
                q["explain"] = ex; q["notes"] = dict(zip(wrong, notes))
            elif sk == "reading":
                q["notes"] = {o: f"The story doesn't say “{o}”. Look for the line that answers the question." for o in wrong}
            elif sk == "listening":
                q["notes"] = {o: f"You didn't hear “{o}”. Listen again for the key words." for o in wrong}
            elif q.get("pic"):
                q["notes"] = {o: f"“{o}” is something different. Look again: this is a {right}." for o in wrong}
            else:
                raise AssertionError(f"C3: no notes for {lvl}/{sk}: {q['q']}")
_c3_missing = [(s, k) for s, d in C3.items() for k in d if (s, k) not in _c3_used]
assert not _c3_missing, f"C3 overlay keys that match no item: {_c3_missing[:5]}"
FAIR_MAX = 0.40  # "Fair Play" guard: the right answer may be the uniquely longest option in at most 40% of a skill's items
def check_fair(name, items):
    mc = [q for q in items if q.get("options")]
    if not mc: return
    longest = sum(1 for q in mc if (L := [len(o) for o in q["options"]])[q["answer"]] == max(L) and L.count(max(L)) == 1)
    assert longest / len(mc) <= FAIR_MAX, f"{name}: right answer is the longest option in {longest}/{len(mc)} items (max {FAIR_MAX:.0%})"
for lvl, skills in D.items():
    os.makedirs(f"{ROOT}/{lvl}", exist_ok=True)
    for sk, val in skills.items():
        json.dump(val, open(f"{ROOT}/{lvl}/{sk}.json", "w"), ensure_ascii=False, indent=1)
        n = sum(len(p["questions"]) for p in val["passages"]) if sk == "reading" else len(val)
        assert n >= 15, (lvl, sk, n)
        items = [q for p in val["passages"] for q in p["questions"]] if sk == "reading" else val
        keys = [(q.get("say", "") + "|" + q.get("q", "") + "|" + str(q.get("answer")) + "|" + q.get("pic", "") + "|" + "/".join(q.get("options", [])[:1])) for q in items]
        dup = {k for k in keys if keys.count(k) > 1}; assert not dup, (lvl, sk, dup)
        for q in items:
            if q["type"] != "order": assert len(set(q["options"])) == len(q["options"]) == 4, q
        counts[f"{lvl}/{sk}"] = n; tot += n
        check_fair(f"{lvl}/{sk}", items)
# ---- Echo Well speaking prompts (bonus skill; not part of the 3-of-4 unlock rule) ----
WORDS = {"a1": (3, 8), "a2": (5, 12), "b1": (7, 15), "b2": (9, 18), "c1": (9, 22), "c2": (10, 30)}
MINW = {"b1": 5, "b2": 6, "c1": 7, "c2": 8}
def norm(t):  # mirrors the contraction handling in js/speaking.js closely enough to validate keywords
    t = t.lower().replace("\u2019", "'")
    for a, b in [(r"\bwon't\b", "will not"), (r"\bcan't\b", "can not"), (r"\bcannot\b", "can not"), (r"n't\b", " not"), (r"'m\b", " am"),
                 (r"'re\b", " are"), (r"'ve\b", " have"), (r"'ll\b", " will"), (r"'d\b", " would"),
                 (r"\b(it|that|what|there|here|he|she|who|where|how)'s\b", r"\1 is"), (r"\blet's\b", "let us")]:
        t = re.sub(a, b, t)
    return re.sub(r"[^a-z0-9 ]+", " ", t.replace("-", " ")).split()
sp_tot = 0
for lvl, items in SPEAKING.items():
    assert len(items) >= 20, (lvl, len(items))
    seen = set()
    for i, it in enumerate(items):
        it["id"] = f"{lvl}-sp{i + 1:02d}"
        assert it["focus"].strip() and len(it["tip"]) > 15, it
        key = it.get("text") or it.get("q"); assert key not in seen, key; seen.add(key)
        if it["type"] == "read":
            lo, hi = WORDS[lvl]; n = len(norm(it["text"]))
            assert lo <= n <= hi + 3 and len(it["text"].split()) <= hi, (lvl, n, it["text"])
            assert it["text"][-1] in ".?!", it["text"]
        else:
            assert it["type"] == "answer" and lvl in MINW, (lvl, it)
            it["minWords"] = MINW[lvl]
            m = " " + " ".join(norm(it["model"])) + " "
            assert len(norm(it["model"])) >= MINW[lvl], it["model"]
            for kw in it["keywords"]:
                assert any(" " + " ".join(norm(a)) + " " in m for a in kw.split("|")), (kw, it["model"])
    json.dump(items, open(f"{ROOT}/{lvl}/speaking.json", "w"), ensure_ascii=False, indent=1)
    counts[f"{lvl}/speaking"] = len(items); sp_tot += len(items)
# ---- ✒️ Story Quill writing prompts (bonus skill; not part of the 3-of-4 unlock rule) ----
WORD_RE = re.compile(r"[A-Za-z0-9]+(?:['\u2019-][A-Za-z0-9]+)*")
WRANGE = {"a1": (20, 30), "a2": (25, 45), "b1": (80, 100), "b2": (140, 190), "c1": (220, 260), "c2": (240, 280)}
def key_hit(key, text):  # mirrors keyHit() in js/writing.js: word-start prefix match, or 're:' regex
    t = text.lower().replace("\u2019", "'")
    if key.startswith("re:"): return re.search(key[3:], t) is not None
    return re.search(r"(?:^|[^a-z0-9])" + re.escape(key.lower()), t) is not None
def point_hit(p, text):
    if "sets" in p: return sum(any(key_hit(k, text) for k in s) for s in p["sets"]) >= p["need"]
    return any(key_hit(k, text) for k in p["keys"])
wr_tot = 0
for lvl, items in WRITING.items():
    assert len(items) >= 6, (lvl, len(items))
    lo, hi = WRANGE[lvl]; titles = set()
    for i, it in enumerate(items):
        it["id"] = f"{lvl}-w{i + 1:02d}"
        assert it["title"] not in titles, it["title"]; titles.add(it["title"])
        a, b = it["words"]; assert lo <= a < b <= hi, (it["id"], it["words"])
        n = len(WORD_RE.findall(it["model"])); assert a <= n <= b, (it["id"], "model words", n, it["words"])
        assert 3 <= len(it["points"]) <= 5, it["id"]
        for p in it["points"]: assert point_hit(p, it["model"]), (it["id"], "model misses point", p["label"])
        if it.get("firstLine"): assert it["model"].startswith(it["firstLine"]), it["id"]
        bank = [{"g": g, "p": list(ps)} for g, ps in LEVEL_BANK[lvl]]
        bank.insert(0, {"g": "\u2728 For this task", "p": it.pop("phrases")})
        it["bank"] = bank; it["level"] = lvl
    json.dump(items, open(f"{ROOT}/{lvl}/writing.json", "w"), ensure_ascii=False, indent=1)
    counts[f"{lvl}/writing"] = len(items); wr_tot += len(items)
# ---- 📜 Storybook Chapters (bonus; not part of the 3-of-4 unlock rule) ----
GLOSS_RE = re.compile(r"\[\[([^|\]]+)\|([^\]]+)\]\]")
st_tot = 0
for lvl, ch in STORIES.items():
    assert len(ch["pages"]) == 4, lvl
    assert os.path.exists(f"{ROOT}/../assets/stories/{ch['img']}.jpg"), ch["img"]
    qs = [p["q"] for p in ch["pages"]] + [ch["final"]]
    for q in qs:
        o = q["options"]; assert len(o) == 4 and len(set(o)) == 4 and q["answer"] == 0 and q["explain"], (lvl, q["q"])
    for p in ch["pages"]:
        assert GLOSS_RE.search(p["text"]) and "[[" not in GLOSS_RE.sub("", p["text"]), (lvl, p["text"][:30])
    check_fair(f"{lvl}/story", qs)
    out = dict(ch, id=f"{lvl}-story", level=lvl)
    json.dump(out, open(f"{ROOT}/{lvl}/story.json", "w"), ensure_ascii=False, indent=1)
    counts[f"{lvl}/story"] = len(qs); st_tot += 1
json.dump(QUEST, open(f"{ROOT}/b1/quest.json", "w"), ensure_ascii=False, indent=1)
json.dump(DEBATE, open(f"{ROOT}/c1/debate.json", "w"), ensure_ascii=False, indent=1)
check_fair("c1/debate", DEBATE)
json.dump({"counts": counts, "total": tot + sp_tot + wr_tot, "questions": tot, "speaking": sp_tot, "writing": wr_tot, "stories": st_tot}, open(f"{ROOT}/counts.json", "w"), indent=1)
print(counts); print("QUESTIONS", tot, "SPEAKING", sp_tot, "WRITING", wr_tot, "TOTAL", tot + sp_tot + wr_tot)
