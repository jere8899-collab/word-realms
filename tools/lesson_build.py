"""📜 Build + validate the interactive Lessons (LESSONS-PLAN.md): tools/lessons/<pack>.py → data/lessons/<pack>.json + data/lessons/index.json.
Run:  python3 tools/lesson_build.py      (also run by tools/build_data.py)
Every narrator line gets a `say` (maths TeX and symbols turned into words), which tools/build_voice.py records with Kokoro af_heart.
The build FAILS on: missing steps, not exactly 3 + 3 checks, duplicate options, an answer out of range, a wrong option without a
why-not note, a question without an explanation, widget fields that don't fit the widget, missing art, an unknown realm/skill/topic,
or a duplicate id."""
import glob, importlib, json, os, re, subprocess, sys
TOOLS = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(TOOLS, ".."); sys.path.insert(0, TOOLS)
OUT = os.path.join(ROOT, "data", "lessons")
SKILLS = {"grammar", "vocab", "reading", "listening"}
WIDGETS = {   # kind → required fields (LESSONS-PLAN.md §2 widget kit; js/learn.js KIT)
    "sort": ["bins", "items"], "fill": ["tiles", "items"], "suffix": ["stamp", "items"], "spots": ["scene", "tasks"],
    "pv": ["targets"], "regroup": ["a", "b"], "groups": ["rings", "each"], "share": ["total", "plates"], "frac": ["stages"],
    "rename": ["a", "b"], "money": ["targets"], "clock": ["targets"], "picgraph": ["cats", "key"], "bar": ["start", "sold", "add"],
    "findword": ["story", "tasks"], "spellhear": ["items"], "hearpic": ["items"],
    "shapecount": ["stages"], "line": ["ends", "items"], "fence": ["stages"]}
SCENES = {"table": {"on", "under", "in"}, "bed": {"on", "under", "in"}, "nearfar": {"near", "far"}, "park": {"nextto", "behind", "front"}}
NUMW = {1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight"}
DEN = {2: ("half", "halves"), 3: ("third", "thirds"), 4: ("quarter", "quarters"), 5: ("fifth", "fifths"), 6: ("sixth", "sixths"), 8: ("eighth", "eighths")}
def frac_words(a, b):
    a, b = int(a), int(b)
    if b in DEN and a in NUMW: return f"{NUMW[a]} {DEN[b][0] if a == 1 else DEN[b][1]}"
    return f"{a} out of {b}"
def dollars(n): return f"{int(n)} dollar{'' if int(n) == 1 else 's'}"
UNIT_W = {"mℓ": "millilitre", "ℓ": "litre", "kg": "kilogram", "km": "kilometre", "cm": "centimetre", "g": "gram", "m": "metre", "h": "hour", "min": "minute"}
def units(t):
    """MA-4b: 2 m 35 cm → 2 metres 35 centimetres (1 kg → 1 kilogram); only right after a number, so words like "a.m." stay
    (the clock widget's "5 min ⏩" button name is read as written)"""
    t = re.sub(r"(?<![\d.:])(\d+) (mℓ|ℓ|kg|km|cm|g|m|h|min)(?![\wℓ]|\.\w| ⏩)", lambda m: f"{m.group(1)} {UNIT_W[m.group(2)]}{'' if m.group(1) == '1' else 's'}", t)
    t = re.sub(r" \((?:mℓ|ℓ|kg|cm|g|m)\)", "", t)   # "metres (m)": the unit's name is already said
    return t.replace("mℓ", "millilitres").replace("ℓ", "litres")
def clock24(t):
    """MA-4b: 24-hour times are read like a station clock: 07:15 → oh 7 15, 00:10 → zero zero 10, 18:00 → 18 hundred"""
    t = re.sub(r"(?<![\d:])(1[3-9]|2[0-3]):00(?!\d)", r"\1 hundred", t)
    t = re.sub(r"(?<![\d:])00:(\d\d)(?!\d)", lambda m: "zero zero " + ("hundred" if m.group(1) == "00" else str(int(m.group(1))) if m.group(1)[0] != "0" else "oh " + m.group(1)[1]), t)
    return re.sub(r"(?<![\d:])0(\d):(\d\d)(?!\d)", lambda m: f"oh {m.group(1)} " + ("hundred" if m.group(2) == "00" else m.group(2) if m.group(2)[0] != "0" else "oh " + m.group(2)[1]), t)
def speak(t):
    """the narrator's version of a line: TeX fractions → words, money, maths symbols, emoji dropped by build_voice's norm()"""
    t = re.sub(r"\$\\frac\{(\d+)\}\{(\d+)\}\$", lambda m: frac_words(m.group(1), m.group(2)), str(t))
    t = t.replace("\n", " ")
    t = re.sub(r"\\\$(\d+)\.(\d\d)", lambda m: dollars(m.group(1)) + ("" if m.group(2) == "00" else f" and {int(m.group(2))} cent{'' if int(m.group(2)) == 1 else 's'}"), t)
    t = re.sub(r"\\\$(\d+) (note|coin)", r"\1 dollar \2", t)
    t = re.sub(r"\\\$(\d+)", lambda m: dollars(m.group(1)), t)
    t = t.replace("$", "")
    t = re.sub(r"=\s*\?\s+(minutes|cm|g|mℓ)(?!\w)", lambda m: "equals how many " + {"cm": "centimetres", "g": "grams", "mℓ": "millilitres"}.get(m.group(1), m.group(1)) + "?", t)   # 3 m 40 cm = ? cm (MA-4b)
    t = re.sub(r"=\s*\?", "equals what?", t)
    t = re.sub(r"(\d+)¢ (coin)", r"\1 cent \2", t)
    t = re.sub(r"\b1¢", "1 cent", t)
    t = re.sub(r"(\d+)¢", r"\1 cents", t)
    t = t.replace("×", " times ").replace("÷", " divided by ").replace(" = ", " equals ").replace(" + ", " plus ").replace(" − ", " minus ").replace(" → ", ", ")
    t = re.sub(r"(\d) r (\d)", r"\1 remainder \2", t)   # 14 ÷ 3 = 4 r 2 → "4 remainder 2" (MA-4a)
    t = clock24(units(t))
    t = t.replace("□", "what number")   # a missing-number box is read as a question, never as a symbol
    t = t.replace("___", "blank").replace("·", ",").replace("\n", " ")
    return re.sub(r"\s+", " ", t).strip()
def topics():
    js = "const M=require('./js/math-gen.js');['p','m','h'].forEach(x=>require('./js/math-topics-'+x+'.js'));console.log(JSON.stringify(M.TOPICS.map(t=>t.id)))"
    return set(json.loads(subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True, text=True, check=True).stdout))
def fail(lid, msg): raise SystemExit(f"📜 lesson {lid}: {msg}")
def need_why(lid, where, kind, items, key):
    """every card / gap / word of a widget carries its own why line (sort, fill, suffix, spellhear, line)"""
    for it in items:
        if not it.get("why"): fail(lid, f"{where}: {kind} item {it.get(key)!r} needs a why")
def check_widget(lid, w, where):
    k = w.get("kind")
    if k not in WIDGETS: fail(lid, f"{where}: unknown widget kind {k!r}")
    for f in WIDGETS[k]:
        if f not in w: fail(lid, f"{where}: {k} needs {f!r}")
    if not w.get("text"): fail(lid, f"{where}: the widget needs an instruction text")
    if not w.get("hint"): fail(lid, f"{where}: the widget needs a hint (shown after 2 misses)")
    if k == "sort":
        ids = {b["id"] for b in w["bins"]}
        if not 2 <= len(ids) <= 3: fail(lid, f"{where}: sort needs 2–3 bins")
        if len(w["items"]) < 4: fail(lid, f"{where}: sort needs 4+ items")
        need_why(lid, where, k, w["items"], "t")
        for it in w["items"]:
            if it["bin"] not in ids: fail(lid, f"{where}: sort item {it} needs a known bin")
        if {it["bin"] for it in w["items"]} != ids: fail(lid, f"{where}: every bin needs at least one item")
    if k == "fill":
        need_why(lid, where, k, w["items"], "s")
        for it in w["items"]:
            if it["s"].count("___") != 1 or it["a"] not in w["tiles"]: fail(lid, f"{where}: fill item {it}")
    if k == "suffix":
        if not any(it["need"] for it in w["items"]) or all(it["need"] for it in w["items"]): fail(lid, f"{where}: suffix needs words with AND without the stamp")
        need_why(lid, where, k, w["items"], "base")
        for it in w["items"]:
            if "add" in it and not (isinstance(it["add"], str) and it["add"].isalpha()): fail(lid, f"{where}: suffix add {it['add']!r} must be letters")
            if "cut" in it and not (isinstance(it["cut"], int) and 1 <= it["cut"] < len(it["base"]) and it.get("add")): fail(lid, f"{where}: suffix cut needs 1 ≤ cut < len(base) and an add")
    if k == "spots":
        if w["scene"] not in SCENES: fail(lid, f"{where}: unknown scene {w['scene']}")
        for t in w["tasks"]:
            if t["word"] not in SCENES[w["scene"]] or not t.get("text"): fail(lid, f"{where}: spots task {t}")
    if k == "pv" and not all(isinstance(n, int) and 1 <= n <= 999 for n in w["targets"]): fail(lid, f"{where}: pv targets 1–999")
    if k == "regroup" and not ((w["a"] % 10) + (w["b"] % 10) >= 10 and w["a"] + w["b"] < 100): fail(lid, f"{where}: regroup needs ones that cross 10 and a sum under 100")
    # MA-4a: 6–9 times tables need rings of up to 9 (kept to 30 items so the pile stays tappable)
    if k == "groups" and not (2 <= w["rings"] <= 5 and 2 <= w["each"] <= 9 and w["rings"] * w["each"] <= 30): fail(lid, f"{where}: groups 2–5 rings of 2–9 (≤ 30 items)")
    # share divides evenly unless rem=True (MA-4a remainders): then it must leave 1+ over, and each plate gets 1+
    if k == "share":
        r = w["total"] % w["plates"]
        if not (2 <= w["plates"] <= 5 and w["total"] <= 24 and w["total"] >= w["plates"]): fail(lid, f"{where}: share 2–5 plates, total ≤ 24")
        if bool(w.get("rem")) != bool(r): fail(lid, f"{where}: share total must divide evenly, or set rem=True for a remainder")
    if k == "frac":
        for st in w["stages"]:
            if st["shape"] not in ("pizza", "bar") or not (2 <= st["parts"] <= 8) or not (1 <= st["shade"] < st["parts"]) or not st.get("text"): fail(lid, f"{where}: frac stage {st}")
    if k == "rename" and not ((w["a"] % 10) < (w["b"] % 10) and w["a"] > w["b"] and w["a"] < 100): fail(lid, f"{where}: rename needs ones that need borrowing and a < 100")
    if k == "money":
        if not w["targets"] or not all(isinstance(n, int) and 1 <= n <= 999 for n in w["targets"]): fail(lid, f"{where}: money targets are cents 1–999")
    if k == "clock":
        for t_ in w["targets"]:
            if not isinstance(t_, dict) or not (1 <= t_.get("h", 0) <= 12) or t_.get("m", -1) not in range(0, 60, 5): fail(lid, f"{where}: clock target {t_} needs h 1–12 and m in 5-min steps")
    if k == "picgraph":
        if w["key"] not in (1, 2, 5, 10): fail(lid, f"{where}: picgraph key must be 1, 2, 5 or 10")
        if not (2 <= len(w["cats"]) <= 5): fail(lid, f"{where}: picgraph needs 2–5 categories")
        for c in w["cats"]:
            if not c.get("label") or not (1 <= c.get("n", 0) <= 8): fail(lid, f"{where}: picgraph cat {c}")
    if k == "bar":
        if not (10 <= w["start"] <= 99 and 1 <= w["sold"] < w["start"] and 1 <= w["add"] <= 40): fail(lid, f"{where}: bar start/sold/add out of kid range")
    if k == "findword":
        if not w.get("story") or len(w["tasks"]) < 2: fail(lid, f"{where}: findword needs a story and 2+ tasks")
        story_l = w["story"].lower()
        for t in w["tasks"]:
            if not t.get("q") or not t.get("word"): fail(lid, f"{where}: findword task {t}")
            if t["word"].lower() not in story_l: fail(lid, f"{where}: findword word {t['word']!r} not in story")
    if k == "spellhear":
        if len(w["items"]) < 2: fail(lid, f"{where}: spellhear needs 2+ items")
        for it in w["items"]:
            a = it.get("answer") or ""
            if not a or not a.isalpha() or not (2 <= len(a) <= 10): fail(lid, f"{where}: spellhear answer {a!r} (2–10 letters)")
        need_why(lid, where, k, w["items"], "answer")
    if k == "hearpic":
        if len(w["items"]) < 2: fail(lid, f"{where}: hearpic needs 2+ items")
        for it in w["items"]:
            if not it.get("word") or not it.get("pics") or not (3 <= len(it["pics"]) <= 4): fail(lid, f"{where}: hearpic item {it.get('word')}")
            oks = [p for p in it["pics"] if p.get("ok")]
            if len(oks) != 1: fail(lid, f"{where}: hearpic {it['word']!r} needs exactly one ok pic")
            for p in it["pics"]:
                if not p.get("icon") or not p.get("label"): fail(lid, f"{where}: hearpic pic needs icon+label")
                if not p.get("ok") and not p.get("why"): fail(lid, f"{where}: hearpic wrong pic {p.get('label')!r} needs a why")
    if k == "shapecount":
        SH = {"triangle": (3, 3), "square": (4, 4), "rectangle": (4, 4), "pentagon": (5, 5), "hexagon": (6, 6)}
        if len(w["stages"]) < 1: fail(lid, f"{where}: shapecount needs 1+ stages")
        for st in w["stages"]:
            if st.get("shape") not in SH or st.get("count") not in ("sides", "corners") or not st.get("text"):
                fail(lid, f"{where}: shapecount stage {st}")
            want = SH[st["shape"]][0 if st["count"] == "sides" else 1]
            if st.get("n") != want: fail(lid, f"{where}: shapecount {st['shape']} {st['count']} must be n={want}")
    if k == "line":   # EN-4c: order on a line, items listed top end → bottom end
        if not (isinstance(w["ends"], list) and len(w["ends"]) == 2 and all(w["ends"])): fail(lid, f"{where}: line needs 2 end labels")
        if not 3 <= len(w["items"]) <= 6 or len({it["t"] for it in w["items"]}) != len(w["items"]): fail(lid, f"{where}: line needs 3–6 different words")
        need_why(lid, where, k, w["items"], "t")
        if w.get("of"):
            ns = [it.get("n") for it in w["items"]]
            if not all(isinstance(n, int) and 0 <= n <= w["of"] <= 10 for n in ns) or ns != sorted(ns, reverse=True) or len(set(ns)) != len(ns):
                fail(lid, f"{where}: line n must count down from top to bottom (0–of, of ≤ 10): {ns}")
    if k == "fence":   # MA-4b perimeter: a garden whose corners are listed in order around it, from (0, 0); every side is straight across or down
        for st in w["stages"]:
            p = st.get("pts") or []
            if st.get("unit") not in ("cm", "m") or not st.get("text") or not 4 <= len(p) <= 8 or len(p) % 2: fail(lid, f"{where}: fence stage needs cm/m, a text and 4–8 corners")
            if not all(isinstance(v, int) and v >= 0 for q in p for v in q) or min(q[0] for q in p) or min(q[1] for q in p): fail(lid, f"{where}: fence corners are whole numbers starting at 0")
            W, H = max(q[0] for q in p), max(q[1] for q in p)
            if not 1 <= H <= W <= 12: fail(lid, f"{where}: fence gardens are drawn wide (height ≤ width ≤ 12)")
            sides = [(p[(j + 1) % len(p)][0] - q[0], p[(j + 1) % len(p)][1] - q[1]) for j, q in enumerate(p)]
            for j, (dx, dy) in enumerate(sides):
                if (dx == 0) == (dy == 0): fail(lid, f"{where}: fence side {j + 1} must go straight across or straight down")
                if (dx == 0) == (sides[j - 1][0] == 0): fail(lid, f"{where}: fence sides {j} and {j + 1} turn no corner (merge them)")
                if 5 * (abs(dx) + abs(dy)) < W: fail(lid, f"{where}: fence side {j + 1} is too short to tap (≥ width ÷ 5)")
            if st.get("n") != sum(abs(dx) + abs(dy) for dx, dy in sides): fail(lid, f"{where}: fence n must be the perimeter")
def say_widget(w):
    w["say"] = speak(w["text"])
    for t in w.get("tasks", []): t["say"] = speak(t.get("text") or t.get("q") or "")
    for st in w.get("stages", []): st["say"] = speak(st["text"])
    for it in w.get("items", []):
        if isinstance(it, dict) and it.get("say"): it["say"] = speak(it["say"])
        elif isinstance(it, dict) and it.get("answer") and w.get("kind") == "spellhear": it["say"] = speak(it.get("say") or it["answer"])
        elif isinstance(it, dict) and it.get("word") and w.get("kind") == "hearpic": it["say"] = speak(it.get("say") or it["word"])
def check_q(lid, q, where):
    o = q["options"]
    if len(o) < 2 or len(set(o)) != len(o): fail(lid, f"{where}: options must be 2+ and unique: {o}")
    if not 0 <= q["answer"] < len(o): fail(lid, f"{where}: answer index")
    if not q.get("explain"): fail(lid, f"{where}: needs an explain")
    for k, opt in enumerate(o):
        if k != q["answer"] and not (q.get("notes") or {}).get(opt): fail(lid, f"{where}: wrong option {opt!r} has no why-not note")
    for n in (q.get("notes") or {}):
        if n not in o: fail(lid, f"{where}: note for unknown option {n!r}")
    q["say"] = speak((q.get("text", "") + " " + q["q"]).strip())
def build():
    realms = {r["id"] for r in json.load(open(os.path.join(ROOT, "data", "realms.json")))}
    tops, seen, index, total = topics(), set(), [], 0
    os.makedirs(OUT, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(TOOLS, "lessons", "*.py"))):
        name = os.path.basename(f)[:-3]
        if name.startswith("_"): continue
        mod = importlib.import_module("lessons." + name); pack = mod.PACK; out = []
        for L in mod.LESSONS:
            lid = L["id"]
            if lid in seen: fail(lid, "duplicate id")
            seen.add(lid)
            at = L["at"]
            if "topic" in at:
                if at["topic"] not in tops: fail(lid, f"unknown maths topic {at['topic']}")
                if lid != "m." + at["topic"]: fail(lid, "maths lesson ids are m.<topic id>")
            elif at.get("realm") not in realms or at.get("skill") not in SKILLS: fail(lid, f"unknown realm/skill {at}")
            for k in ("title", "icon", "hook", "discover", "rule", "check", "reteach", "check2", "art", "grown"):
                if not L.get(k): fail(lid, f"missing {k}")
            if not os.path.exists(os.path.join(ROOT, "assets", "web", L["art"] + ".webp")) or not os.path.exists(os.path.join(ROOT, "assets", "lessons", L["art"] + ".jpg")):
                fail(lid, f"art {L['art']} missing: paint it with GenerateImage and install it with tools/install_story_img.py --dir lessons")
            if len(L["check"]) != 3 or len(L["check2"]) != 3: fail(lid, "needs exactly 3 check and 3 check2 questions")
            check_widget(lid, L["discover"], "discover"); say_widget(L["discover"])
            if L["reteach"].get("discover"): check_widget(lid, L["reteach"]["discover"], "reteach.discover"); say_widget(L["reteach"]["discover"])
            if not L["rule"].get("examples"): fail(lid, "rule needs examples")
            if L["reteach"]["text"] == L["rule"]["text"]: fail(lid, "the re-teach must explain it a DIFFERENT way")
            for i, q in enumerate(L["check"]): check_q(lid, q, f"check {i + 1}")
            for i, q in enumerate(L["check2"]): check_q(lid, q, f"check2 {i + 1}")
            qk = lambda q: q.get("text", "") + q["q"] + q["options"][q["answer"]]
            if {qk(q) for q in L["check"]} & {qk(q) for q in L["check2"]}: fail(lid, "check2 must be NEW questions")
            for part in ("hook", "rule", "reteach"): L[part]["say"] = L[part].get("say") or speak(L[part]["text"])   # a hand-written say wins
            L["rule"]["sayEx"] = [speak(e) for e in L["rule"]["examples"]]
            L["pack"] = pack; out.append(L)
            index.append({k: L[k] for k in ("id", "pack", "title", "icon", "at", "art") } | ({"match": L["match"]} if L.get("match") else {}))
        json.dump({"pack": pack, "lessons": out}, open(os.path.join(OUT, pack + ".json"), "w"), ensure_ascii=False, indent=1)
        total += len(out)
    json.dump({"lessons": index}, open(os.path.join(OUT, "index.json"), "w"), ensure_ascii=False, indent=1)
    print("📜 lessons", total, "in", len({i["pack"] for i in index}), "packs")
    return total
if __name__ == "__main__": build()
