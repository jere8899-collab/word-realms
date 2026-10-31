"""🎙️ Pre-record the game's voice lines with Kokoro TTS (kokoro-onnx, Apache-2.0) → assets/voice/*.mp3 + assets/voice/manifest.json.
Run with the Kokoro venv:   /workspace/kvenv/bin/python tools/build_voice.py      (models in /workspace/kmodels)
 • Lines: every listening/lesson `say`, Echo Well texts and models, Word Charms words/meanings/examples, every story sentence and glossary word (sentences that
   contain the player's or pet's name are left to the device voice), fixed UI lines and pet chatter.
 • Voices come from ONE table, data/voices.json (narrator = af_heart unmodified; pet = "bubbly Puffbun").
 • File name = <profile>_<hash of profile + text>.mp3, so only missing files are recorded; MP3 mono, data/voices.json bitrate.
 • The runtime (js/voice.js WR.say) normalises text exactly like norm() below and looks it up in the manifest."""
import glob, hashlib, json, os, re, subprocess, sys, tempfile
from concurrent.futures import ProcessPoolExecutor
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."); os.chdir(ROOT)
CFG = json.load(open("data/voices.json")); OUT = "assets/voice"; os.makedirs(OUT, exist_ok=True)
MODEL, VOICES = "/workspace/kmodels/kokoro-v1.0.onnx", "/workspace/kmodels/voices-v1.0.bin"
EMOJI = re.compile("[\U0001F000-\U0001FAFF\u2600-\u27BF\uFE0F\u200D\u2B50\u2B06\u2190-\u21FF\u2300-\u23FF]")
def norm(t): return re.sub(r"\s+", " ", EMOJI.sub("", str(t))).strip()
def fname(profile, text):  # FNV-1a 32 (same as js/voice.js) + a short sha1 so collisions can't happen
    s = profile + "|" + text; h = 2166136261
    for c in s: h = ((h ^ ord(c)) * 16777619) & 0xFFFFFFFF
    return f"{profile}_{h:08x}{hashlib.sha1(s.encode()).hexdigest()[:4]}.mp3"
GL = re.compile(r"\[\[([^|\]]+)\|([^\]]+)\]\]")
def lines():
    out = {}   # (profile, text)
    add = lambda p, t: (norm(t) and out.setdefault((p, norm(t)), True))
    def walk(o):
        if isinstance(o, dict):
            for k, v in o.items():
                if k == "say" and isinstance(v, str): add("narrator", v)
                else: walk(v)
        elif isinstance(o, list): [walk(x) for x in o]
    for f in sorted(glob.glob("data/*/*.json")):
        d = json.load(open(f)); walk(d)
        if f.endswith("speaking.json"):
            for it in d: [add("narrator", it[k]) for k in ("text", "model") if isinstance(it.get(k), str)]
        if f.endswith("swap.json"):                                    # 🔀 Spell Swap: sentence 1 (sentence 2 is its `say`)
            for bk in d["books"]: [add("narrator", it["a"]) for it in bk["items"]]
        if f.endswith("words.json"):                                   # 🔮 Word Charms: the word, its meaning, its example
            for it in d: [add("narrator", it[k]) for k in ("w", "def", "ex")]
        if f.endswith("story.json"):
            for pg in d.get("pages", []):
                for p in re.findall(r'(?:[^.!?\[]|\[\[[^\]]*\]\])+[.!?]+[”’"]?\s*|(?:[^.!?\[]|\[\[[^\]]*\]\])+$', pg.get("text", "")):
                    if "{" in p: continue                                  # has {hero}/{pet}: device voice
                    add("narrator", GL.sub(r"\1", p.strip()))
                for w, g in GL.findall(pg.get("text", "")): add("narrator", w); add("narrator", w + ". " + g)
    for t in ["Welcome to Word Realms! Let's learn English together."]: add("narrator", t)
    for t in ["Hehe, that tickles!", "More cuddles please!", "I love you!", "Caught it! Again!", "I'm full! Maybe later", "Yum yum! Thank you!",
              "I'm sooo hungry…", "Will you play with me?", "I love learning with you!", "Let's go on an adventure!", "Hi! I'm so happy to see you!"]: add("pet", t)
    return list(out)
K = None
def style(k, prof):
    kc = CFG["profiles"][prof]["kokoro"]
    if "blend" in kc: return sum(k.get_voice_style(v) * w for v, w in kc["blend"].items())
    return kc["voice"]
def record(job):
    global K
    prof, text = job; path = os.path.join(OUT, fname(prof, text))
    if os.path.exists(path): return path, 0
    import numpy as np, soundfile as sf
    from kokoro_onnx import Kokoro
    if K is None: K = Kokoro(MODEL, VOICES)
    kc = CFG["profiles"][prof]["kokoro"]
    if prof == "narrator" and "|" in text:   # dialogue "Name: line|Name: line": two narrators, names not read
        parts, names = [], []
        for l in text.split("|"): m = re.match(r"^([^:]{1,20}):\s*", l); names.append(m.group(1) if m else ""); parts.append(l[m.end():] if m else l)
        order = list(dict.fromkeys(names)); chunks = []
        for n, l in zip(names, parts):
            p = "narrator2" if order.index(n) % 2 else "narrator"; a, sr = K.create(l, voice=style(K, p), speed=CFG["profiles"][p]["kokoro"]["speed"], lang="en-us")
            chunks += [a, np.zeros(int(sr * 0.3), dtype=a.dtype)]
        audio = np.concatenate(chunks)
    else:
        audio, sr = K.create(text, voice=style(K, prof), speed=kc["speed"], lang="en-us")
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tf: sf.write(tf.name, audio, sr)
    af = []
    if kc.get("semitones"): af.append(f"rubberband=pitch={2 ** (kc['semitones'] / 12):.5f}:formant={kc.get('formant', 'shifted')}")
    af.append("loudnorm=I=-18:TP=-2:LRA=11")
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", tf.name, "-af", ",".join(af), "-ar", "24000", "-ac", "1", "-b:a", CFG.get("bitrate", "64k"), path], check=True)
    os.unlink(tf.name); return path, 1
if __name__ == "__main__":
    jobs = lines()
    if "--count" in sys.argv:
        import collections; print(collections.Counter(p for p, t in jobs), sum(len(t) for p, t in jobs), "chars"); sys.exit()
    todo = [j for j in jobs if not os.path.exists(os.path.join(OUT, fname(*j)))]
    print(len(jobs), "lines,", len(todo), "to record", flush=True)
    made = 0
    with ProcessPoolExecutor(int(os.environ.get("JOBS", "3"))) as ex:
        for i, (p, n) in enumerate(ex.map(record, todo, chunksize=4)):
            made += n
            if i % 50 == 0: print(i, "/", len(todo), flush=True)
    man = {"_doc": "text → file, per voice profile (tools/build_voice.py; looked up by js/voice.js)", "profiles": {}}
    for p, t in jobs: man["profiles"].setdefault(p, {})[t] = fname(p, t)
    json.dump(man, open(os.path.join(OUT, "manifest.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    keep = {fname(*j) for j in jobs}
    for f in os.listdir(OUT):
        if f.endswith(".mp3") and f not in keep: os.unlink(os.path.join(OUT, f))     # lines that no longer exist
    size = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT) if f.endswith(".mp3"))
    print(f"recorded {made}; {len(keep)} files, {size / 1e6:.1f} MB", flush=True)
