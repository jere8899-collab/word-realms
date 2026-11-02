"""Question helpers. Convention: first option = correct; the game shuffles options at runtime."""
def mcq(q, opts, ex, pic=None):
    d = {"type": "mcq", "q": q, "options": opts, "answer": 0, "explain": ex}
    if pic: d["pic"] = pic
    return d
def order(sentence, ex):
    return {"type": "order", "q": "Build the sentence in the candy shop!", "answer": sentence, "explain": ex}
def listen(say, q, opts, ex):
    return {"type": "listen", "say": say, "q": q, "options": opts, "answer": 0, "explain": ex}
def passage(title, text, qs):
    return {"title": title, "text": text, "questions": [mcq(*x) for x in qs]}
# Speaking (Echo Well): read-aloud sentences and 'answer the question' prompts with target keywords.
def say(text, focus, tip):
    return {"type": "read", "text": text, "focus": focus, "tip": tip}
def ask(q, keywords, model, focus, tip):
    """keywords: list of phrases the answer must contain; 'a|b' means either a or b."""
    return {"type": "answer", "q": q, "keywords": keywords, "model": model, "focus": focus, "tip": tip}
# 🧩 Gap games with word/mark TILES (Word Bridges, Punctuation Pixies): "wrong=why not|wrong=why not|wrong=why not" →
# the wrong tiles (x) and a note for each (no), so every wrong tile says why it doesn't fit (checked in build_data.py).
def why_tiles(x):
    pairs = [w.split("=", 1) for w in x.split("|")]
    return {"x": [w for w, _ in pairs], "no": {w: why for w, why in pairs}}
# 🖼️ Picture choice above A1 (R19 waves 4–5, tools/r19_pics.py + tools/r19_scenes.py): 4 (label, picture ref) pairs, right one first.
# The label says what the picture SHOWS (never the target word); one "why not" note per wrong picture (kept as notes in build_data.py).
# word: the target word, checked in build_data.py to appear in no option label, then dropped from the data.
def pq(q, opts, ex, notes, word=None):
    assert len(opts) == 4 and len(notes) == 3, q
    d = {"type": "picq", "q": q, "options": [l for l, _ in opts], "art": dict(opts), "answer": 0, "explain": ex, "_notes": notes}
    if word: d["_word"] = word
    return d
