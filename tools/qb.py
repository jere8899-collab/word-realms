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
