"""🦁 Singapore levels: build data/sg/<level>.json from tools/sg_synth.py (🔗 Join It Up), tools/sg_edit.py (🔍 Spot & Fix)
and tools/sg_cloze.py (🧩 Story Gaps), checking every item. Run on its own (python3 tools/sg_build.py) or from build_data.py,
which adds the counts to data/counts.json ("sg/<level>/<kind>").
Shapes (read by js/sg-english.js and the lesson engine js/lesson.js):
  synth:  [{ type:"typed", id, title, q, s1, s2, lead, tail, answers, need, explain, say (s1 + s2), full (the model sentence) }]
  edit:   { passages: [{ id, title, text with ⟦n|wrong⟧, say (the corrected text), questions: [{ type:"fix", n, wrong, kind, answers, explain, q, title }] }] }
  ccloze: { passages: [{ id, title, text with ⟦n⟧, say (the full text), questions: [{ type:"fill", n, answers, explain, q, title }] }] }
canon() mirrors canon() in js/sg-english.js: capitals, punctuation and curly quotes don't matter; contractions = long forms."""
from sg_models import MODELS
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sg_synth import SYNTH
from sg_edit import EDIT
from sg_cloze import CLOZE
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "sg")
LEVELS = ["p1", "p2", "p3", "p4", "p5", "p6", "s1", "s2", "s3", "s4", "jc1", "jc2", "adult"]
# American spellings that must not appear in this track (British / Singapore spelling: colour, practise, centre …)
US = re.compile(r"\b(color|colors|colored|favorite|favorites|center|centers|neighbor|neighbors|neighborhood|organize|organized|realize|realized|honor|gray|theater|traveled|traveling|apologize|apologized|recognize|recognized|mom|candy|cookies? jar)\b", re.I)
def canon(t):
    t = str(t or "").lower().replace("’", "'").replace("‘", "'").replace("`", "'")
    t = re.sub(r"[^a-z0-9' ]+", " ", t)
    t = re.sub(r"\bcan't\b|\bcannot\b", "can not", t); t = re.sub(r"\bwon't\b", "will not", t)
    t = re.sub(r"n't\b", " not", t); t = re.sub(r"'m\b", " am", t); t = re.sub(r"'re\b", " are", t)
    t = re.sub(r"'ve\b", " have", t); t = re.sub(r"'ll\b", " will", t)
    return " ".join(t.split())
def cap(t): return t[:1].upper() + t[1:]
def sentence(lead, ans, tail):
    s = " ".join(x for x in (lead, ans, tail) if x).strip()
    s = re.sub(r"\s+([,.?!])", r"\1", s)
    if not re.search(r"[.?!]$", s): s += "."
    return cap(s)
EDIT_RE = re.compile(r"\{([sg]):([^>{}]+)>([^|{}]+)\|([^{}]+)\}")
CLOZE_RE = re.compile(r"\{([^|{}]+)\|([^{}]+)\}")
def build():
    os.makedirs(ROOT, exist_ok=True); counts = {}; seen = set()
    for lvl in LEVELS:
        out = {"level": lvl, "synth": [], "edit": {"passages": []}, "ccloze": {"passages": []}}
        for k, it in enumerate(SYNTH.get(lvl, [])):
            iid = f"{lvl}.s{k + 1}"; ans = list({canon(a): a for a in reversed(it["answers"])}.values())[::-1]   # a contraction twin (didn't / did not) is the same answer
            assert ans and all(a.strip() for a in ans) and it["tip"] and len(it["tip"]) > 15, iid
            cans = [canon(a) for a in ans]; assert len(set(cans)) == len(cans), (iid, "duplicate answers")
            for a in ans:
                full = canon(sentence(it["lead"], a, it["tail"]))
                for w in it["need"]: assert re.search(r"\b" + re.escape(canon(w)) + r"\b", full), (iid, w, a)
            key = canon(it["s1"] + " " + it["s2"]); assert key not in seen, (iid, "repeated"); seen.add(key)
            q = it["q"] or ("Join the two sentences into one." if it["s2"] else "Rewrite the sentence.")
            if it["need"]: q += " Use " + " … ".join(f"“{w}”" for w in it["need"]) + "."
            say = " ".join(x for x in (it["s1"], it["s2"]) if x)
            model = MODELS.get(iid) or sentence(it["lead"], ans[0], it["tail"])   # tools/sg_models.py: capitals and commas written out
            assert canon(model) == canon(sentence(it["lead"], ans[0], it["tail"])), (iid, "model ≠ first answer", model)
            assert re.match(r"[A-Z]", model) and model[-1] in ".?!" and not re.search(r"\bi\b", model), (iid, "model needs capitals and a full stop", model)
            out["synth"].append({"type": "typed", "id": iid, "title": "Join It Up", "q": q, "s1": it["s1"], "s2": it["s2"], "lead": it["lead"], "tail": it["tail"],
                                 "answers": ans, "answer": ans[0], "need": it["need"], "explain": it["tip"], "say": say, "full": model})
        for k, p in enumerate(EDIT.get(lvl, [])):
            pid, qs, n = f"{lvl}.e{k + 1}", [], [0]
            assert p["title"] not in seen, (pid, "title"); seen.add(p["title"])
            def mark(m):
                n[0] += 1; kind, wrong, right, tip = m.group(1), m.group(2).strip(), [x.strip() for x in m.group(3).split("/")], m.group(4).strip()
                assert all(canon(r) != canon(wrong) for r in right) and len(tip) > 15 and right[0], (pid, wrong)
                qs.append({"type": "fix", "n": n[0], "wrong": wrong, "kind": "spelling" if kind == "s" else "grammar", "answers": right, "answer": right[0],
                           "explain": tip, "title": p["title"], "q": f"Fix word {n[0]}: “{wrong}”"})
                return f"⟦{n[0]}|{wrong}⟧"
            text = EDIT_RE.sub(mark, p["text"]); assert "{" not in text and "}" not in text, (pid, "bad mark")
            say = EDIT_RE.sub(lambda m: m.group(3).split("/")[0].strip(), p["text"])
            assert 2 <= len(qs) <= 5 and not US.search(say), (pid, len(qs), US.search(say))
            out["edit"]["passages"].append({"id": pid, "title": p["title"], "text": text, "say": say, "questions": qs})
        for k, p in enumerate(CLOZE.get(lvl, [])):
            pid, qs, n = f"{lvl}.c{k + 1}", [], [0]
            assert p["title"] not in seen, (pid, "title"); seen.add(p["title"])
            def gap(m):
                n[0] += 1; right, tip = [x.strip() for x in m.group(1).split("/")], m.group(2).strip()
                assert all(re.fullmatch(r"[A-Za-z']+", r) for r in right) and len(tip) > 15, (pid, right)
                qs.append({"type": "fill", "n": n[0], "answers": right, "answer": right[0], "explain": tip, "title": p["title"], "q": f"Gap {n[0]}: write one word."})
                return f"⟦{n[0]}⟧"
            text = CLOZE_RE.sub(gap, p["text"]); assert "{" not in text, (pid, "bad gap")
            say = CLOZE_RE.sub(lambda m: m.group(1).split("/")[0].strip(), p["text"])
            assert 3 <= len(qs) <= 6 and not US.search(say), (pid, len(qs))
            out["ccloze"]["passages"].append({"id": pid, "title": p["title"], "text": text, "say": say, "questions": qs})
        for it in out["synth"]: assert not US.search(it["say"] + " " + it["full"]), it["id"]
        json.dump(out, open(f"{ROOT}/{lvl}.json", "w"), ensure_ascii=False, indent=1)
        counts[f"sg/{lvl}/synth"] = len(out["synth"])
        counts[f"sg/{lvl}/edit"] = sum(len(p["questions"]) for p in out["edit"]["passages"])
        counts[f"sg/{lvl}/ccloze"] = sum(len(p["questions"]) for p in out["ccloze"]["passages"])
    return counts
if __name__ == "__main__":
    c = build(); print(c); print("SG items", sum(c.values()))
