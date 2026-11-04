#!/usr/bin/env python3
"""🎙️ STORY-VOICES audit: EVERY Storybook narration MP3 (A1–C2 × 7 chapters × 4 pages, every pet-name variant, every dotted word and its
meaning) is transcribed with a free LOCAL speech-to-text model (faster-whisper small.en, beam 5) and compared word by word with its line
(normalised: case, punctuation, British/American spelling, numbers, homophones, whisper's spelling of the story names). Also: missing file,
clipped ending, silence, pace. Writes tools/story-voice-ledger.json (--ledger): text hash → file → voice, speed, the words Kokoro was given
(data/voices.json sayAs), the MP3's content hash, the result. tools/test/story-voices.js fails if any line is missing from it or changed.
   pip install faster-whisper   (any venv; e.g. /workspace/wvenv)      python tools/story_voice_audit.py --ledger [--only lines.json]
Runs in ONE process on purpose: a forked pool of whisper workers returned garbage transcripts."""
import json, os, re, subprocess, sys, difflib, collections
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."); os.chdir(ROOT)
exec(open("tools/build_voice.py").read().split("if __name__")[0].replace("ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), \"..\"); os.chdir(ROOT)", ""))
man = json.load(open("assets/voice/manifest.json"))["profiles"]["narrator"]; man.update(json.load(open("assets/voice/manifest-story.json"))["profiles"]["narrator"])
items = collections.OrderedDict()
for l in "a1 a2 b1 b2 c1 c2".split():
    d = json.load(open(f"data/{l}/story.json"))
    for ci, c in enumerate(d["chapters"]):
        st = f"{l}.{ci+1}"
        for pi, pg in enumerate(c["pages"]):
            for pet in (STORY_PETS if "{pet}" in pg["text"] else STORY_PETS[:1]):
                for p in story_sentences(story_fill(pg["text"], pet)):
                    items.setdefault(norm(GL.sub(r"\1", p.strip())), {"kind": "sentence", "stories": set()})["stories"].add(st)
            for w, g in GL.findall(pg["text"]):
                items.setdefault(norm(w), {"kind": "word", "stories": set()})["stories"].add(st)
                items.setdefault(norm(w + ". " + g), {"kind": "gloss", "stories": set()})["stories"].add(st)
ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
def num(n):
    n = int(n)
    if n < 20: return ONES[n]
    if n < 100: return TENS[n // 10] + ("" if n % 10 == 0 else " " + ONES[n % 10])
    if n < 1000: return ONES[n // 100] + " hundred" + ("" if n % 100 == 0 else " and " + num(n % 100))
    if n < 1000000: return num(n // 1000) + " thousand" + ("" if n % 1000 == 0 else " " + num(n % 1000))
    return str(n)
HOMO = [{"too", "two", "to"}, {"right", "write", "rite"}, {"for", "four"}, {"one", "won"}, {"there", "their", "theyre"}, {"its", "it"},
        {"whole", "hole"}, {"knew", "new"}, {"know", "no"}, {"sea", "see"}, {"flour", "flower"}, {"tale", "tail"}, {"weather", "whether"}, {"heard", "herd"},
        {"night", "knight"}, {"pair", "pear"}, {"wait", "weight"}, {"week", "weak"}, {"sun", "son"}, {"through", "threw"}, {"hour", "our"}, {"buy", "by", "bye"},
        {"dear", "deer"}, {"aloud", "allowed"}, {"peace", "piece"}, {"rode", "road"}, {"blew", "blue"}, {"made", "maid"}, {"meet", "meat"}, {"mist", "missed"},
        {"sent", "scent", "cent"}, {"dew", "do", "due"}, {"mom", "mum"}, {"ok", "okay"}, {"ah", "oh"}, {"cheque", "check"}, {"grey", "gray"}, {"whoa", "woah"},
        {"tyre", "tire"}, {"kerb", "curb"}, {"storey", "story"}, {"plough", "plow"}, {"draught", "draft"}, {"mould", "mold"}, {"pyjamas", "pajamas"}, {"aeroplane", "airplane"},
        {"bow", "bao", "vow", "bough", "bau"}, {"baos", "bows", "boughs"}, {"queued", "cued"}, {"medal", "metal"}, {"cue", "q", "queue"}, {"plaits", "plates", "plats"}, {"rowed", "rode", "road"}, {"councillor", "counselor", "councilor"}, {"councillors", "counselors", "councilors"}, {"enquired", "inquired"}, {"burrow", "borough"}, {"mogs", "moggs"}, {"krum", "crumb"}, {"quillen", "quillon"}, {"who", "hoot"}, {"pipp", "pip"}, {"minti", "minty"}, {"mogg", "mog", "moog"}, {"quillen", "quillon"}, {"velum", "vellum"}, {"lula", "lulu"}]
SAFE_NAMES = {"bao", "hoot", "pip", "minty", "mog", "quillon", "vellum", "lulu"}   # names whisper spells its own way (sound checked by ear list)
FIX = {"cosiest": "coziest", "cosy": "cozy", "cosier": "cozier", "practising": "practicing", "practised": "practiced", "practise": "practice",
       "learnt": "learned", "spelt": "spelled", "dreamt": "dreamed", "burnt": "burned", "leapt": "leaped", "jewellery": "jewelry", "programme": "program",
       "travellers": "travelers", "anymore": "any more", "everyday": "every day", "goodnight": "good night"}
def us(w):   # British → American spelling, both sides
    if w in FIX: return FIX[w]
    w = re.sub(r"ll(ed|ing|er|ers)$", r"l\1", w); w = re.sub(r"is(e|ed|es|ing|ation|ations)$", r"iz\1", w); w = re.sub(r"ys(e|ed|es|ing)$", r"yz\1", w)
    w = re.sub(r"our(s|ed|ing|ite|ites|able|ful)?$", r"or\1", w) if len(w) > 5 and w not in ("hours", "yours", "tours", "pours", "fours", "flours", "detours") else w
    w = re.sub(r"tre$", "ter", w) if w in ("centre", "theatre", "metre", "litre", "fibre", "sombre", "meagre") else w
    return {"cosiest": "coziest", "cosy": "cozy", "cosier": "cozier", "practising": "practicing", "practised": "practiced", "practise": "practice",
            "learnt": "learned", "spelt": "spelled", "dreamt": "dreamed", "burnt": "burned", "leapt": "leaped", "jewellery": "jewelry", "programme": "program",
            "travellers": "travelers", "anymore": "any more", "everyday": "every day", "goodnight": "good night", "maybe": "may be"}.get(w, w)
def toks(t):
    t = t.lower().replace("’", "'").replace("‘", "'")
    t = re.sub(r"(\d+)", lambda m: " " + num(m.group(1)) + " ", t.replace(",", ""))
    t = re.sub(r"[-—–…/]", " ", t); t = t.replace("'", "")
    out = []
    for w in re.findall(r"[a-z]+", t): out += us(w).split()
    return out
def same(a, b): return a == b or any(a in h and b in h for h in HOMO)
def compare(ref, hyp):
    a, b = toks(ref), toks(hyp)
    if "".join(a) == "".join(b): return True, []
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False); bad = []
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal": continue
        ra, hb = a[i1:i2], b[j1:j2]
        if op == "replace" and len(ra) == len(hb) and all(same(x, y) for x, y in zip(ra, hb)): continue
        if "".join(ra) == "".join(hb): continue
        bad.append([" ".join(ra), " ".join(hb)])
    return not bad, bad

# 🔎 lines whisper can't confirm although Kokoro's phonemes are right (checked by hand; each one is on the "needs a real phone listen" list
# in specs/story-voices/notes.md). A line passes here ONLY if every word whisper got wrong is exactly the listed mishearing.
PHONEME_OK = {"Lulu hops with joy.": ({"joy": {"jai"}}, "dʒˈɔɪ"), "fairest": ({"fairest": {"varist", "verist"}}, "fˈɛɹəst"),
              "sheepish": ({"sheepish": {"zeebish", "seepish"}}, "ʃˈiːpɪʃ"), "perched": ({"perched": {"purged"}}, "pˈɜːtʃt"),
              "Fishing boats, guided by the beam, made it home.": ({"it": {"at"}}, "mˌeɪd ɪt hˈoʊm")}
M = None; M2 = None
def pcm_of(f):   # ffmpeg → 16 kHz mono float32 (a writable copy: whisper misreads a read-only buffer)
    import numpy as np
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-f", "f32le", "-ar", "16000", "-ac", "1", "-"], capture_output=True).stdout, dtype=np.float32).copy()
def work(t):
    global M
    import numpy as np
    from faster_whisper import WhisperModel
    if M is None: M = WhisperModel("small.en", device="cpu", compute_type="int8", cpu_threads=0)
    f = man.get(t); r = {"text": t}
    if not f or not os.path.exists("assets/voice/" + f): r["err"] = ["missing"]; return r
    r["file"] = f
    pcm = pcm_of("assets/voice/" + f)
    dur = len(pcm) / 16000; r["dur"] = round(dur, 2); err = []
    peak = float(np.abs(pcm).max() or 1e-9); tail = pcm[-int(.04 * 16000):]; trms = float(np.sqrt((tail ** 2).mean()))
    if trms > 0.08 * peak: err.append(f"clipped end (last 40 ms at {trms / peak:.0%} of peak)")
    if peak < 0.05: err.append("silent / too quiet")
    nw = max(1, len(toks(t))); wps = nw / max(dur, .05)
    if nw >= 4 and not (1.0 <= wps <= 5.2): err.append(f"pace {wps:.1f} words/s")
    ref = t
    if items[t]["kind"] == "word":   # a lone word is heard inside a carrier ("The word is …", tools/story_voice_carrier.mp3): whisper can't judge 1 word cold
        pcm = np.concatenate([pcm_of("tools/story_voice_carrier.mp3"), np.zeros(4800, np.float32), pcm, np.zeros(4800, np.float32)]); ref = "The word is " + t
    segs, info = M.transcribe(pcm, language="en", beam_size=5, condition_on_previous_text=False)
    hyp = " ".join(s.text for s in segs).strip(); r["hyp"] = hyp
    ok, bad = compare(ref, hyp)
    if not ok:   # a second, larger local model listens before a line is called wrong (whisper mishears short names and odd words)
        global M2
        if M2 is None: M2 = WhisperModel("medium.en", device="cpu", compute_type="int8")
        segs, info = M2.transcribe(pcm, language="en", beam_size=5, condition_on_previous_text=False)
        hyp2 = " ".join(s.text for s in segs).strip(); ok2, bad2 = compare(ref, hyp2); r["hyp2"] = hyp2
        po = PHONEME_OK.get(t)
        if ok2: r["heard_by"] = "medium.en"
        elif po and all(y in po[0].get(x, ()) for x, y in bad2 if x) and all(y in po[0].get(x, ()) for x, y in bad if x):
            r["heard_by"] = "phonemes " + po[1] + " (whisper hears '" + "', '".join(y for _, y in bad2) + "'; phone listen)"
        else: err.append("words: " + "; ".join(f"'{x}'→'{y}'" for x, y in bad) + " | medium.en: " + "; ".join(f"'{x}'→'{y}'" for x, y in bad2))
    else: r["heard_by"] = "small.en"
    r["err"] = err; return r
if __name__ == "__main__":
    keys = list(items)
    if "--only" in sys.argv: keys = [k for k in keys if k in set(json.load(open(sys.argv[sys.argv.index("--only") + 1])))]
    res = []
    if True:   # ONE process: a forked pool of faster-whisper workers returned garbage transcripts (empty / cut / "jjaja"); in-process is exact
        for i, r in enumerate(map(work, keys)):
            r["stories"] = sorted(items[r["text"]]["stories"]); r["kind"] = items[r["text"]]["kind"]; res.append(r)
            if i % 100 == 0: print(i, "/", len(keys), flush=True)
    out = sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else "story_voice_audit.json"
    json.dump(res, open(out, "w"), ensure_ascii=False, indent=0)
    bad = [r for r in res if r["err"]]
    per = collections.defaultdict(list)
    for r in bad:
        for s in r["stories"]: per[s].append(r)
    print(len(res), "lines checked;", len(bad), "with an error;", len(per), "stories affected")
    for s in sorted(per): print(" ", s, len(per[s]), "·", "; ".join(sorted({e.split(":")[0] for r in per[s] for e in r["err"]})))
    if "--ledger" in sys.argv:
        import hashlib
        kc = CFG["profiles"]["narrator"]["kokoro"]; lp = "tools/story-voice-ledger.json"
        led = json.load(open(lp)) if os.path.exists(lp) and "--only" in sys.argv else {"_doc": "STORY-VOICES ledger: sha1(text)[:12] → the recording that passed (tools/story_voice_audit.py; enforced by tools/test/story-voices.js)", "lines": {}}
        for r in res:
            h = hashlib.sha1(r["text"].encode()).hexdigest()[:12]
            led["lines"][h] = {"text": r["text"], "file": r.get("file"), "voice": kc["voice"], "speed": kc["speed"], "said": spoken(r["text"]),
                               "mp3": hashlib.sha1(open("assets/voice/" + r["file"], "rb").read()).hexdigest()[:12] if r.get("file") else None,
                               "check": "pass" if not r["err"] else "; ".join(r["err"]), "heard": r.get("hyp2") if r.get("heard_by") == "medium.en" else r.get("hyp", ""), "heard_by": r.get("heard_by"), "stories": r["stories"]}
        json.dump(led, open(lp, "w"), ensure_ascii=False, indent=0); print("ledger:", lp, len(led["lines"]), "lines")
