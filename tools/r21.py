# R21 (review 2026-11-01): reading and listening "why not" notes quote the exact line. Script-written notes such as
# "“three” doesn't answer the question. Find the line…" or "Grey wasn't said." are rebuilt around the one line of the
# story / recording that answers the question, e.g. 'The story says: “Lily can ride a bike and sing.” So it's “ride a bike”, not “swim”.'
import re
STOP = set("a an the and or but so to of in on at for with from by is are was were be been am i you he she it we they my your his her its our their "
           "me him them this that these those there here what who where when why how which do does did not no yes can could will would "
           "should have has had very really just about into out up down than then too also all some any one".split())
GENERIC = ("doesn't answer the question. Find the line", "doesn't match what the speaker means")
VAGUE = re.compile(r"(wasn't|weren't|isn't|aren't|not) (said|mentioned|heard|in the story|in the text)\.?$", re.I)
def _stem(w): return re.sub(r"(ing|ed|es|s)$", "", w) if len(w) > 4 else w
def _words(t): return {_stem(w) for w in re.findall(r"[a-z0-9']+", t.lower().replace("’", "'")) if w not in STOP}
def sentences(text):
    out = []
    for part in text.split("|"):                       # dialogue turns "Mum: …|Kid: …"
        out += [s.strip() for s in re.findall(r'[^.!?]+[.!?]+["”’]?|[^.!?]+$', part) if len(s.strip()) > 2]
    return out
def best_line(text, q, right):
    """The sentence that best supports the right answer (must share a word with the answer, or strongly with the question)."""
    R, Q = _words(right), _words(q)
    best, score = None, 0
    for s in sentences(text):
        W = _words(s); sc = 3 * len(R & W) + len(Q & W)
        if sc > score: best, score = s, sc
    if re.search(r"\b(in the end|at the end|finally|at last)\b", q, re.I):          # "What happened in the end?" → the last third only
        ss = sentences(text); ss = ss[len(ss) * 2 // 3:]
        cand = max(ss, key=lambda s: 3 * len(R & _words(s)) + len(Q & _words(s)), default=None)
        return cand if cand and R & _words(cand) else None
    if re.search(r"\blast (sentence|line)\b", q): return sentences(text)[-1]
    if re.search(r"\bfirst (sentence|line)\b", q): return sentences(text)[0]
    return best if best and R & _words(best) else None          # only a line that really holds the answer
def in_text(opt, text):
    W = _words(opt); T = _words(text)
    return bool(W) and W <= T
def _q(o): return f"“{o}”" if o[-1:] in ".!?" else f"“{o}”"
def _end(o): return "" if o[-1:] in ".!?" else "."
def short(t, n=150): t = re.sub(r"\s+", " ", t).strip(); return t if len(t) <= n else t[:n].rsplit(" ", 1)[0] + "…"
def quote_notes(q, text, kind):
    """Rewrite the generic/vague notes of one mcq/listen item. kind = 'story' | 'text' | 'recording'. Returns how many notes changed."""
    if not q.get("notes"): return 0
    right = q["options"][q["answer"]]
    line = best_line(text, q["q"], right)
    if not line: return 0
    who = "You heard" if kind == "recording" else f"The {kind} says"
    line = re.sub(r"^([A-Z][\w ]{0,18}):\s*", r"\1: ", line)
    n = 0
    for o, note in list(q["notes"].items()):
        if any(g in note for g in GENERIC):
            if in_text(o, text) and not in_text(o, line):
                new = f"“{o}” is in the {kind if kind != 'recording' else 'recording'} too, but not as the answer. {who}: “{short(line)}” So it's “{right}”{_end(right)}"
            else:
                new = f"{who}: “{short(line)}” So it's “{right}”, not “{o}”{_end(o)}"
        elif VAGUE.search(note) and len(note) < 70:
            new = f"{note} {who}: “{short(line)}”"
        else: continue
        q["notes"][o] = new; n += 1
    return n
