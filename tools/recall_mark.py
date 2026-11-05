"""✍️ BRIEF-T7 "Type it first" (specs/007-recall-practice): which core-bank items hide their choices at first.
recall_ok() mirrors WR.Recall.eligible() in js/recall.js: keep the two the same.
mark_recall() marks a deterministic share per level (fewer typed answers for the youngest); check_recall() reports
the share per level and skill: picking / type it first / building or typing."""
import re, hashlib
NUM = {w: str(i) for i, w in enumerate("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty".split())}
CORE = ("grammar", "vocab", "reading", "listening")
SHARE = {"a1": 0.08, "a2": 0.12, "b1": 0.14, "b2": 0.14, "c1": 0.14, "c2": 0.14}   # of a level's core items: wave 1
SKILL_CAP = 0.35                                                                      # at most this share of one skill's items
PICK = ("mcq", "listen", "picq", "tf")                                                # answered by picking from given choices
def _toks(t): return [NUM.get(x, x) for x in re.sub(r"[^a-z0-9' ]+", " ", re.sub(r"[‘’`´]", "'", str(t).lower())).split()]
def canon(t):
    w = _toks(t)
    if len(w) > 1 and w[0] in ("a", "an", "the"): w = w[1:]
    return " ".join(w)
def _has(text, c): return (" " + c + " ") in (" " + " ".join(_toks(text)) + " ")
VOCABQ = re.compile(r"mean|opposite|word for|called|what is this|which word", re.I)
def recall_ok(q, passage=None):
    if q.get("type") == "recall": return True   # a wave-2 producing item (checked verbatim at build time)
    if q.get("type") not in ("mcq", "listen") or q.get("dialogue"): return False
    o, a = q.get("options"), q.get("answer")
    if not isinstance(o, list) or not isinstance(a, int) or len(o) < 3: return False
    c = canon(o[a])
    if not c or len(c.split()) > 3 or len(c) > 24 or not re.fullmatch(r"[a-z0-9][a-z0-9' ]*", c): return False
    if len({canon(x) for x in o}) < len(o) or c in ("true", "false", "not given", "yes", "no"): return False
    if passage is not None: return _has(passage.get("text", ""), c)
    if q.get("type") == "listen": return _has(q.get("say", ""), c)
    return "___" in q.get("q", "") or bool(q.get("pic")) or bool(VOCABQ.search(q.get("q", "")))
def _pairs(sk, val): return [(q, p) for p in val["passages"] for q in p["questions"]] if sk == "reading" else [(q, None) for q in val]
def _h(q): return hashlib.md5((q.get("q", "") + "|" + q.get("say", "") + "|" + str(q.get("options"))).encode()).hexdigest()
def mark_recall(D):
    """every item already marked (the wave-2 extras) keeps its mark; then the per-level share on top of those"""
    out = {}
    for lvl, skills in D.items():
        if lvl not in SHARE: continue
        pairs = {sk: _pairs(sk, skills[sk]) for sk in CORE if sk in skills}
        pre = {sk: sum(1 for q, _ in ps if q.get("recall") or q.get("type") == "recall") for sk, ps in pairs.items()}
        total = sum(len(ps) for ps in pairs.values()); want = round(SHARE[lvl] * total)
        cand = sorted(((_h(q), sk, q) for sk, ps in pairs.items() for q, p in ps if recall_ok(q, p) and not q.get("recall") and q.get("type") != "recall"), key=lambda x: x[0])
        per = {sk: 0 for sk in pairs}; n = 0
        for _, sk, q in cand:
            if n >= want: break
            if per[sk] >= SKILL_CAP * len(pairs[sk]): continue
            q["recall"] = 1; per[sk] += 1; n += 1
        out[lvl] = (n + sum(pre.values()), want, {sk: per[sk] + pre[sk] for sk in per})
    return out
def check_recall(D):
    """prints the share per level and skill and returns {lvl: {before, after, items, eligible, typeFirst}} (written to data/recall.json); fails if a marked item isn't fair to type"""
    res = {}; allb = alla = alln = 0
    for lvl, skills in D.items():
        if lvl not in SHARE: continue
        row = []; b = a = n = 0
        for sk in CORE:
            if sk not in skills: continue
            ps = _pairs(sk, skills[sk])
            for q, p in ps: assert not (q.get("recall") or q.get("type") == "recall") or recall_ok(q, p), (lvl, sk, "type-it-first item isn't fair to type", q.get("q"))
            pk = sum(q["type"] in PICK for q, _ in ps); tf = sum(1 for q, _ in ps if q.get("recall") or q.get("type") == "recall")
            row.append(f"{sk} {100 * pk / len(ps):.0f}→{100 * (pk - tf) / len(ps):.0f}% ({tf} type-first)")
            b += pk; a += pk - tf; n += len(ps)
        el = sum(recall_ok(q, p) for sk in CORE if sk in skills for q, p in _pairs(sk, skills[sk]))
        res[lvl] = {"before": round(100 * b / n, 1), "after": round(100 * a / n, 1), "items": n, "eligible": el, "typeFirst": b - a}
        allb += b; alla += a; alln += n
        print(f"  check_recall {lvl}: picking {100 * b / n:.1f}% → {100 * a / n:.1f}% · " + " | ".join(row))
    res["all"] = {"before": round(100 * allb / alln, 1), "after": round(100 * alla / alln, 1), "items": alln, "typeFirst": allb - alla}
    print(f"  check_recall all levels: picking {res['all']['before']:.1f}% → {res['all']['after']:.1f}% (incl. True/False; type it first counts as recall)")
    return res
