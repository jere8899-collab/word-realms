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
# ---- C1 (review 2026-10-30): grow the banks (tools/c1_grow.py); items carry their own C3 notes ----
from c1_grow import GROW
for lvl, extra in GROW.items():
    for sk, val in extra.items(): D[lvl][sk].extend(val)
# ---- C2 (review 2026-10-30): new question types (spell, picq, mistake, gaps, dictate, listen-and-order, dialogues) ----
from c2_types import C2T
_WORD_ART = {a["id"] for a in json.load(open(os.path.join(os.path.dirname(__file__), "..", "assets", "manifest.json")))["assets"] if a.get("type") == "word"}
for lvl, extra in C2T.items():
    for sk, val in extra.items():
        for q in val:
            t = q["type"]
            if t == "spell": assert re.fullmatch(r"[a-z]+", q["answer"]) and (q.get("art") in _WORD_ART or ":" in q["q"]), q
            elif t == "picq": assert all("word_" + o in _WORD_ART for o in q["options"]), q
            elif t == "mistake": assert 0 <= q["wrong"] < len(q["words"]) and q["fix"] and q["fix"] != q["words"][q["wrong"]], q
            elif t == "gaps": assert q["text"].count("___") == len(q["answers"]) and len(set(q["bank"])) == len(q["bank"]) and len(q["bank"]) > len(q["answers"]), q
            elif t == "dictate": assert q["say"] == q["answer"], q
            elif t == "order": assert q["answer"] == q.get("say", q["answer"]) and len(q["answer"].split()) >= 3, q
            elif t == "listen": assert q.get("dialogue") and all(re.match(r"^[A-Z][\w ]*: ", ln) for ln in q["say"].split("|")), q
        D[lvl][sk].extend(val)
# ---- C4 (review 2026-10-30): listening that tests understanding (paraphrased right options + numbers/times/changes of mind) ----
from c4 import C4P, C4NEW
_c4_hit = set()
for lvl in ("a2", "b1", "b2", "c1", "c2"):
    for q in D[lvl]["listening"]:
        if q.get("say") in C4P and q["type"] == "listen":
            new, ex = C4P[q["say"]]; assert new not in q["options"], new
            q["options"][q["answer"]] = new; q["explain"] = ex; _c4_hit.add(q["say"])
    D[lvl]["listening"].extend(C4NEW.get(lvl, []))
assert _c4_hit == set(C4P), set(C4P) - _c4_hit
# ---- C5 (review 2026-10-30): child/teen-friendly topics for the C1 reading and listening items that were about politics ----
from c5 import C5_PASSAGES, C5_LISTEN
_c5 = set()
for lvl, reps in C5_PASSAGES.items():
    ps = D[lvl]["reading"]["passages"]
    for old, new in reps.items():
        idx = [n for n, p in enumerate(ps) if p["title"] == old]; assert len(idx) == 1, old
        assert len(new["questions"]) == len(ps[idx[0]]["questions"]), old
        ps[idx[0]] = new; _c5.add(old)
for lvl, reps in C5_LISTEN.items():
    for q in D[lvl]["listening"]:
        if q.get("say") in reps: q.update(reps[q["say"]]); _c5.add(q["say"])
assert len(_c5) == sum(len(v) for v in C5_PASSAGES.values()) + sum(len(v) for v in C5_LISTEN.values()), "C5 overlay mismatch"
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
            if q["type"] not in ("mcq", "listen", "picq"): continue
            right = q["options"][q["answer"]]; wrong = [o for i, o in enumerate(q["options"]) if i != q["answer"]]
            k = q["q"] + (" [" + q["pic"] + "]" if q.get("pic") else "")
            if "_notes" in q:
                assert len(q["_notes"]) == 3, q["q"]; q["notes"] = dict(zip(wrong, q.pop("_notes"))); continue
            hit = ov.get(k) or ov.get(q["q"])
            if hit:
                _c3_used.add((f"{lvl}/{sk}", k if k in ov else q["q"]))
                if len(hit) == 3: newq, ex, notes = hit
                else: newq = None; ex, notes = hit
                assert len(notes) == 3, (lvl, sk, q["q"])
                if newq: q["q"] = newq
                q["explain"] = ex; q["notes"] = dict(zip(wrong, notes))
            elif sk == "reading":
                q["notes"] = {o: f"“{o}” doesn't answer the question. Find the line in the story that does, and read it again." for o in wrong}
            elif sk == "listening":
                q["notes"] = {o: f"“{o}” doesn't match what the speaker means. Listen again for the key words, and watch for changes of mind." for o in wrong}
            elif q["type"] == "picq":
                q["notes"] = {o: f"That picture is a {o}. {q['explain']}" for o in wrong}
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
        keys = [(q.get("say", "") + "|" + q.get("q", "") + "|" + str(q.get("answer")) + "|" + q.get("pic", "") + "|" + "/".join(q.get("options", [])[:1]) + "|" + " ".join(q.get("words", [])) + "|" + q.get("text", "")) for q in items]
        dup = {k for k in keys if keys.count(k) > 1}; assert not dup, (lvl, sk, dup)
        for q in items:
            if q["type"] in ("mcq", "listen", "picq"): assert len(set(q["options"])) == len(q["options"]) == 4, q
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
