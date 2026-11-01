"""Run: python3 tools/build_data.py  -> writes data/<level>/<skill>.json (+ b1/quest.json, c1/debate.json, <level>/speaking.json)."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from c_a1 import A1; from c_a2 import A2; from c_b1 import B1, QUEST; from c_b2 import B2; from c_c1 import C1, DEBATE; from c_c2 import C2
from c_speaking import SPEAKING
from c_writing import WRITING, LEVEL_BANK
from r20 import SPEAK, WRITE  # R20 wave 1 (review 2026-11-01): more speaking prompts and writing tasks, A1–B1 first (appended, so old ids stay)
for _l, _v in SPEAK.items(): SPEAKING[_l] = SPEAKING[_l] + _v
for _l, _v in WRITE.items(): WRITING[_l] = WRITING[_l] + _v
from c_stories import STORIES  # 📜 Storybook Chapters
from w1_a import W1A; from w1_b import W1B  # Content Wave 1 (2026-10-30)
ROOT = os.path.join(os.path.dirname(__file__), "..", "data")
D = {"a1": A1, "a2": A2, "b1": B1, "b2": B2, "c1": C1, "c2": C2}
tot = 0; counts = {}
def _items(sk, val):  # every question in a skill bank (reading banks hold their questions inside passages)
    return [q for p in val["passages"] for q in p["questions"]] if sk == "reading" else val
def _merge(extra_by_level):  # append extra items (or reading passages) onto the base banks in D
    for lvl, extra in extra_by_level.items():
        for sk, val in extra.items():
            if sk == "reading": D[lvl][sk]["passages"].extend(val["passages"])
            else: D[lvl][sk].extend(val)
_merge({**W1A, **W1B})
# ---- C1 (review 2026-10-30): grow the banks (tools/c1_grow.py); items carry their own C3 notes ----
from c1_grow import GROW
_merge(GROW)
# ---- C2 (review 2026-10-30): new question types (spell, picq, mistake, gaps, dictate, listen-and-order, dialogues) ----
from c2_types import C2T
_WORD_ART = {a["id"] for a in json.load(open(os.path.join(os.path.dirname(__file__), "..", "assets", "manifest.json")))["assets"] if a.get("type") == "word"}
def _check_c2(q):  # shape checks for the C2 question types (and two-voice dialogues)
    t = q["type"]
    if t == "spell": assert re.fullmatch(r"[a-z]+", q["answer"]) and (q.get("art") in _WORD_ART or ":" in q["q"]), q
    elif t == "picq": assert all("word_" + o in _WORD_ART for o in q["options"]), q
    elif t == "mistake": assert 0 <= q["wrong"] < len(q["words"]) and q["fix"] and q["fix"] != q["words"][q["wrong"]], q
    elif t == "gaps": assert q["text"].count("___") == len(q["answers"]) and len(set(q["bank"])) == len(q["bank"]) and len(q["bank"]) > len(q["answers"]), q
    elif t == "dictate": assert q["say"] == q["answer"], q
    elif t == "order": assert q["answer"] == q.get("say", q["answer"]) and len(q["answer"].split()) >= 3, q
    elif t == "listen": assert q.get("dialogue") and all(re.match(r"^[A-Z][\w ]*: ", ln) for ln in q["say"].split("|")), q
for _lvl, _extra in C2T.items():
    for _val in _extra.values():
        for q in _val: _check_c2(q)
_merge(C2T)
# ---- R19 (review 2026-11-01): more non-multiple-choice items so every level/skill reaches about a quarter of the bank ----
from r19_a import R19A; from r19_b import R19B
for _src in (R19A, R19B):
    for _extra in _src.values():
        for _val in _extra.values():
            for q in _val: _check_c2(q)
    _merge(_src)
from r19_read import READ, TF2, TF3  # 📖 R19 wave 2: reading types (events, True/False/Not given, find the word), A1–B1
def _bare(w): return re.sub(r"[^a-z0-9'-]", "", w.lower())
def _check_read(_lvl, p, q):  # every R19 reading item (events / tf / findword) is checked the same way at every level
    t = q["type"]
    if t == "events": assert 3 <= len(q["events"]) <= 5 and len(set(q["events"])) == len(q["events"]) and all(len(e.split()) >= 2 for e in q["events"]), q
    elif t == "tf":
        assert q["options"] == (TF2 if _lvl in ("a1", "a2") else TF3), q             # Not given from B1 up
        wrong = [o for i, o in enumerate(q["options"]) if i != q["answer"]]
        assert all(len(q["notes"].get(o, "")) > 15 for o in wrong) and q["explain"], q   # a note for every wrong pick
        assert q["options"][q["answer"]] == "Not given" or q.get("line") in p["text"], q  # True/False quote a real line
    elif t == "findword": assert q["line"] in p["text"] and [_bare(w) for w in q["line"].split()].count(q["answer"]) == 1, q
    elif t == "headings":                                                       # B2+: one heading per paragraph + one extra
        paras, hs = p["text"].split("\n\n"), q["headings"] + q["extra"]
        assert _lvl in ("b2", "c1", "c2") and 3 <= len(paras) == len(q["headings"]) <= 5 and len(q["extra"]) == 1, q
        assert len(set(hs)) == len(hs) and all(len(q["notes"].get(h, "")) > 20 for h in hs), q  # a note for every heading
    else: raise AssertionError(q)
from r19_read2 import READ2  # 📖 R19 wave 3: the same types for B2–C2, plus match-the-headings
for _src in (READ, READ2):
    for _lvl, _sk in _src.items():
        for p in _sk["reading"]["passages"]:
            for q in p["questions"]: _check_read(_lvl, p, q)
    _merge(_src)
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
        items = _items(sk, val)
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
# ---- R21 (review 2026-11-01) wave 1: A1–B1 reading/listening "why not" notes quote the exact line that answers the question ----
from r21 import quote_notes
R21_DONE = {}
for lvl in ("a1", "a2", "b1"):
    n = 0
    for p in D[lvl]["reading"]["passages"]:
        for q in p["questions"]:
            if q["type"] == "mcq": n += quote_notes(q, p["text"], "story" if lvl != "b1" else "text")
    for q in D[lvl]["listening"]:
        if q["type"] == "listen": n += quote_notes(q, q["say"], "recording")
    R21_DONE[lvl] = n
print("R21 notes quoting the line:", R21_DONE)
def _key(q):  # duplicate-check key: two items with the same key would look identical to a child
    return "|".join([q.get("say", ""), q.get("q", ""), str(q.get("answer")), q.get("pic", ""), "/".join(q.get("options", [])[:1]), " ".join(q.get("words", [])), q.get("text", ""), "/".join(q.get("events", []) + q.get("headings", [])), q.get("line", "")])
def _gkey(q):  # mirrors Garden.plant(): question + right answer (+ recording)
    t = q.get("type", "mcq")
    c = (q["words"][q["wrong"]] + " → " + q["fix"] if t == "mistake" else " ".join(q["answers"]) + "|" + q["text"] if t == "gaps"
         else " → ".join(q["events"]) if t == "events" else " / ".join(q["headings"]) if t == "headings" else q["answer"] if t in ("order", "spell", "dictate", "findword") else q["options"][q["answer"]])
    return "|".join([q.get("q", ""), c, q.get("say", ""), q.get("pic", "")])
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
        items = _items(sk, val); n = len(items)
        assert n >= 15, (lvl, sk, n)
        keys = [_key(q) for q in items]
        dup = {k for k in keys if keys.count(k) > 1}; assert not dup, (lvl, sk, dup)
        gk = [_gkey(q) for q in items]                      # R19: the Mistake Garden's id (question + right answer) must not collide
        gdup = {k for k in gk if gk.count(k) > 1}; assert not gdup, (lvl, sk, "garden id clash", gdup)
        for q in items:
            if q["type"] in ("mcq", "listen", "picq"): assert len(set(q["options"])) == len(q["options"]) == 4, q
            if q["type"] == "listen" and "|" in q["say"]: _check_c2(q)  # every two-voice recording is a well-formed dialogue
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
# 🔮 Word Charms (tools/c_words.py → data/<level>/words.json): 40 words per level, unique across levels, the example
# contains the word exactly (the fill-the-gap card blanks it), and the definition never gives the word away
from c_words import WORDS
seen_w = set()
for lvl, ws in WORDS.items():
    assert len(ws) >= 40, lvl
    for x in ws:
        w = x["w"]; assert w and x["def"] and x["ex"] and x["pos"] in ("noun", "verb", "adjective", "adverb"), (lvl, x)
        assert re.search(r"\b" + re.escape(w) + r"\b", x["ex"], re.I), (lvl, w, "example must contain the word")
        assert not re.search(r"\b" + re.escape(w[:max(4, len(w) - 2)]), x["def"], re.I), (lvl, w, "definition gives the word away")
        assert re.fullmatch(r"[a-z]+", w), (lvl, w); assert w not in seen_w, (lvl, w, "duplicate word"); seen_w.add(w)
    json.dump(ws, open(f"{ROOT}/{lvl}/words.json", "w"), ensure_ascii=False, indent=1)
    counts[f"{lvl}/words"] = len(ws)
# 🔀 Spell Swap (tools/c_swap.py → data/<level>/swap.json): 3 books × 8 sentence transformations per level. Every answer
# fits the level's word range (contractions count as two words, as in Cambridge Part 4), uses the key word (B2–C2) unchanged,
# the gap appears once, tiles (A1/A2) never repeat a word of the answer, and sentence 1 is never repeated.
from c_swap import SWAP, RULES
# 📚 shared by every gap game (js/gap-round.js): 3 books × 8 items per level → data/<level>/<kind>.json, ids "<lvl>.<book>.<item>",
# no sentence twice across levels; item(lvl, it, out, seen, id) checks one item and returns it with its id and extra fields. → items in all.
def gap_books(kind, table, head, item, n=8):
    seen, total = set(), 0
    for lvl, books in table.items():
        assert len(books) == 3, (kind, lvl)
        out = {"level": lvl, **head(lvl), "books": []}
        for bi, bk in enumerate(books):
            assert len(bk["items"]) == n and bk["name"] and bk["focus"], (kind, lvl, bi)
            items = [item(lvl, it, out, seen, f"{lvl}.{bi + 1}.{k + 1}") for k, it in enumerate(bk["items"])]
            out["books"].append({"id": f"{lvl}.{bi + 1}", "icon": bk["icon"], "name": bk["name"], "focus": bk["focus"], "items": items, **{k: bk[k] for k in bk.get("keep", [])}})
        json.dump(out, open(f"{ROOT}/{lvl}/{kind}.json", "w"), ensure_ascii=False, indent=1)
        counts[f"{lvl}/{kind}"] = sum(len(b["items"]) for b in out["books"]); total += counts[f"{lvl}/{kind}"]
    return total
def once(seen, s, *where):
    assert s not in seen, (*where, s, "duplicate sentence"); seen.add(s)
def cap(t): return t[0].upper() + t[1:]
def word_canon(t):  # one-word gap answers: mirrors canon() in js/forge.js and js/cloze.js
    t = re.sub(r"[‘’`´]", "'", str(t).strip().lower()); t = re.sub(r"[^a-z' -]+", " ", t)
    return " ".join(t.replace("-", " - ").split()).replace(" - ", "-")
def why_tiles_ok(where, it, right, canon=lambda t: t):
    """tile levels: 3 different wrong tiles, none of them also right, and a 'why not' note (> 15 letters) for each one"""
    x = it.get("x", [])
    assert len(x) == 3 and len(set(x)) == 3 and not {canon(w) for w in x} & set(right), (*where, "tiles")
    assert set(it.get("no", {})) == set(x) and all(len(w) > 15 for w in it["no"].values()), (*where, "a 'why not' note for every wrong tile")
def swap_canon(t):  # mirrors canon() in js/swap.js
    t = re.sub(r"[‘’`´]", "'", str(t).lower()); t = re.sub(r"[^a-z0-9' ]+", " ", t)
    t = re.sub(r"\bcan't\b|\bcannot\b", "can not", t); t = re.sub(r"\bwon't\b", "will not", t); t = re.sub(r"\bshan't\b", "shall not", t)
    t = re.sub(r"n't\b", " not", t); t = re.sub(r"'m\b", " am", t); t = re.sub(r"'re\b", " are", t); t = re.sub(r"'ve\b", " have", t)
    t = re.sub(r"'ll\b", " will", t); t = re.sub(r"'d\b", " 'd", t); t = re.sub(r"\b(it|he|she|that|there|what|who|here|where|let)'s\b", r"\1 's", t)
    return " ".join(t.split())
def swap_item(lvl, it, out, seen, iid):
    mode, lo, hi, keyed = out["mode"], out["min"], out["max"], out["key"]
    a, b, ans = it["a"], it["b"], it["ans"]
    assert b.count("___") == 1 and it["tip"] and it["cue"] and ans and all(ans), (lvl, a)
    once(seen, a, lvl)
    ans = [x for i, x in enumerate(ans) if swap_canon(x) not in map(swap_canon, ans[:i])]   # "don't like" = "do not like" already
    for x in ans:
        n = len(swap_canon(x).split()); assert lo <= n <= hi, (lvl, a, x, n, "word range")
        if keyed: assert re.fullmatch(r"[A-Z']+", it["cue"]) and (" " + swap_canon(it["cue"]) + " ") in (" " + swap_canon(x) + " "), (lvl, a, x, "key word")
    if mode == "tiles":
        toks = ans[0].split(); assert it.get("x") and not set(it["x"]) & set(toks), (lvl, a, "tiles")
    return dict(it, ans=ans, id=iid, say=cap(b.replace("___", ans[0])))
sw_tot = gap_books("swap", SWAP, lambda lvl: dict(zip(("mode", "min", "max", "key"), RULES[lvl])), swap_item)
# ⚒️ Word Forge (tools/c_forge.py → data/<level>/forge.json): 3 anvils × 8 word-formation gaps per level. One gap, a ROOT in
# capitals, every answer differs from the root and from the other answers (word_canon), tile levels (A1/A2) build answer 1
# from its parts and the wrong tiles never repeat a part; no sentence twice. say = the full sentence (narrator), ask = the gap read as "blank".
from c_forge import FORGE, MODE as FORGE_MODE
def forge_item(lvl, it, out, seen, iid):
    s, root, ans = it["s"], it["root"], it["ans"]
    assert s.count("___") == 1 and it["tip"] and re.fullmatch(r"[A-Z]+", root) and ans and all(ans), (lvl, s)
    once(seen, s, lvl)
    c = [word_canon(x) for x in ans]; assert len(set(c)) == len(c) and word_canon(root) not in c, (lvl, s, "answers")
    if out["mode"] == "tiles":
        assert "".join(it["p"]) == ans[0] and it.get("x") and not set(it["x"]) & set(it["p"]), (lvl, s, "tiles")
    else: assert "p" not in it, (lvl, s)
    return dict(it, id=iid, say=cap(s.replace("___", ans[0])), ask=cap(s.replace("___", "blank")))
fg_tot = gap_books("forge", FORGE, lambda lvl: {"mode": FORGE_MODE[lvl]}, forge_item)
# 🌉 Word Bridges (tools/c_cloze.py → data/<level>/cloze.json): 3 texts × 8 open-cloze gaps per level, one gap per sentence, read
# in order. Every right answer is ONE word (word_canon), all different; tile levels (A1/A2) have 3 wrong tiles, none of them right;
# every wrong tile has its own 'why not' note (no); a known hint kind; no sentence twice. say = the full sentence (narrator), ask = the sentence read with "blank".
from c_cloze import CLOZE, MODE as CLOZE_MODE
CLOZE_KINDS = {"art", "aux", "verb", "prep", "link", "mod", "pron", "det", "quant", "comp", "rel", "part", "intens", "wh", "neg", "fixed", "adv"}
def cloze_item(lvl, it, out, seen, iid):
    s, ans = it["s"], it["ans"]
    assert s.count("___") == 1 and it["tip"] and it["kind"] in CLOZE_KINDS and ans and all(ans), (lvl, s)
    once(seen, s, lvl)
    c = [word_canon(x) for x in ans]; assert len(set(c)) == len(c) and all(re.fullmatch(r"[a-z'-]+", x) for x in c), (lvl, s, "one word each")
    if out["mode"] == "tiles":
        why_tiles_ok((lvl, s), it, c, word_canon)
    else: assert "x" not in it and "no" not in it, (lvl, s)
    return dict(it, id=iid, say=cap(s.replace("___", ans[0])), ask=cap(s.replace("___", "blank")))
cz_tot = gap_books("cloze", {l: [dict(t, items=t["text"]) for t in texts] for l, texts in CLOZE.items()}, lambda lvl: {"mode": CLOZE_MODE[lvl]}, cloze_item)
# 🧚 Punctuation Pixies (tools/c_marks.py → data/<level>/marks.json): 3 books × 8 punctuation gaps per level, all tiles. ONE gap per
# sentence for a mark, "no mark", or a word with the right capitals / apostrophe / hyphens; 3 different wrong tiles, none of them
# right, each with its own 'why not' note (why_tiles_ok); known hint kinds; no sentence twice. say = the full sentence (narrator);
# ask = what is read before answering: the sentence without the missing mark (it doesn't give the mark away by its tune), or the
# full sentence when the answer is a word (it sounds the same either way).
from c_marks import MARKS, NONE as MARK_NONE
MARK_KINDS = {"end", "cap", "comma", "apos", "speech", "join", "dash", "bracket", "hyphen", "none", "meaning"}
def mark_fill(s, a):
    if a == MARK_NONE: return s.replace("___", "")
    if a == "—": return s.replace("___ ", "—").replace("___", "—")
    return s.replace("___", a)
def marks_item(lvl, it, out, seen, iid):
    s, ans = it["s"], it["ans"]
    assert s.count("___") == 1 and it["tip"] and it["kind"] in MARK_KINDS and ans and all(ans) and len(set(ans)) == len(ans), (lvl, s)
    once(seen, s, lvl)
    why_tiles_ok((lvl, s), it, ans)
    say = cap(" ".join(mark_fill(s, ans[0]).split()))
    ask = say if re.search(r"[A-Za-z]", ans[0]) and ans[0] != MARK_NONE else cap(" ".join(mark_fill(s, MARK_NONE).split()))
    return dict(it, id=iid, say=say, ask=ask)
pm_tot = gap_books("marks", MARKS, lambda lvl: {"mode": "tiles", "none": MARK_NONE}, marks_item)
json.dump(QUEST, open(f"{ROOT}/b1/quest.json", "w"), ensure_ascii=False, indent=1)
json.dump(DEBATE, open(f"{ROOT}/c1/debate.json", "w"), ensure_ascii=False, indent=1)
check_fair("c1/debate", DEBATE)
json.dump({"counts": counts, "total": tot + sp_tot + wr_tot, "questions": tot, "speaking": sp_tot, "writing": wr_tot, "stories": st_tot, "swap": sw_tot, "forge": fg_tot, "cloze": cz_tot, "marks": pm_tot}, open(f"{ROOT}/counts.json", "w"), indent=1)
print(counts); print("QUESTIONS", tot, "SPEAKING", sp_tot, "WRITING", wr_tot, "TOTAL", tot + sp_tot + wr_tot)
