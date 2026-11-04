"""🏷️ Skill tags for the core banks (AGENT-BRIEF-2026-11-04 Task 2): every grammar / vocab / listening / reading item gets
`sk` = "<skill>.<point>" so a review slot (js/review.js) can serve a *different* item on the same skill.
Tags come from the item's own rule line (`explain`), question and type, first matching rule wins. A tag with fewer than
2 items in a bank is folded into "<skill>.other". Run by tools/build_data.py, which also validates the result (check_tags)."""
import re
from collections import Counter

G = [  # grammar, step 1: a named rule in the item's rule line (explain, before "Example:"), most specific first
    ("conditional-mixed", r"mixed conditional"), ("conditional-3", r"third conditional|if \+ had\b|would have \+|would have (been|gone|seen)"),
    ("conditional-2", r"second conditional|imaginary|if i were|if \+ past simple"), ("conditional-1", r"first conditional|zero conditional|if \+ present|\bunless\b|provided that|as long as"),
    ("wish-prefer", r"\bwish\b|if only|would (rather|sooner|as soon)|it's (high )?time|\bprefer"), ("passive", r"passive|(reputed|said|thought|believed) to (have|be)"), ("reported", r"reported|indirect speech|indirect question"),
    ("inversion", r"inversion|inverted|\bnever (have|had) i\b|\bhardly\b|no sooner|not only|little did|\brarely\b|\bseldom\b|\bonly (when|after|then)\b|\bnot until\b|scarcely|nowhere|fronted|\b(so|nor|neither)(/\w+)? \+ auxiliary|auxiliary \+ subject"),
    ("cleft", r"cleft|\bwhat i (need|want) is\b"), ("subjunctive", r"subjunctive|(insist|suggest|recommend|demand)(ed|s)? that"),
    ("participle", r"participle clause|having \+|perfect participle|-ing clause|reduced"), ("relative", r"relative|\bwhose\b|\bwho\b (for|is for|=)|\bwhich\b (for|is for|=)|\bwhere\b (for|is for) places|defining|of which|of whom"),
    ("perfect-continuous", r"perfect continuous|been \+ -?ing"), ("perfect-past", r"past perfect|had \+ (past participle|been)|earlier (cause|action|past)"),
    ("perfect-present", r"present perfect|ha(ve|s) \+ past participle|\bsince\b|\bfor \+ (a )?(length|period)|already|\byet\b|\bever\b|\bjust\b"),
    ("continuous-past", r"past continuous|wa(s|ere) \+ -?ing|interrupt"), ("continuous-present", r"present continuous|(am|is|are) \+ -?ing|happening now|right now"),
    ("future", r"\bfuture\b|going to|\bwill \+|\bwill\b for|\bshall\b"), ("gerund-infinitive", r"\+ to \+|to \+ (verb|infinitive|base)|\+ -?ing\b|gerund|infinitive|verb \+ ing"),
    ("modal", r"modal|\b(after|use) (can|could|must|should|might|may)\b|\b(can|could|must|should|might|may|mustn't|needn't|ought to|have to|has to)\b \+|\bcan't\b ="),
    ("comparison", r"compar|superlative|-er than|\+ than\b|\bthe most\b|\bas \+ adjective \+ as\b|\btoo\b \+|\benough\b"),
    ("so-such", r"\bsuch\b \+|\bso\b \+ adjective"), ("article", r"\barticle\b|\ba\b/\ban\b|vowel sound|no a/an|\bthe\b for one|\ban\b before|we say an\b|sound, so we say"),
    ("quantifier", r"countable|uncountable|quantifier|\b(all|none|both|each|most|neither|either) of\b|not a single"), ("plural", r"\bplurals?\b|more than one \w+: add|add -?e?s\b"), ("there-be", r"there (is|are|was|were)"),
    ("past-simple", r"past simple|past tense|is past\b|\bthe past of\b|irregular past|regular past|\bdid(n't)? \+"),
    ("be", r"verb be|with i we (say|use) am|\b(am|is|are)\b goes with|takes (am|is|are)\b|\(more than one\) \+ are|\+ (am|is|are)\b"),
    ("present-simple", r"present simple|no -s\b|adds -s|he, she,? it|he/she/it|third person|\+ -?s\b|habits?|every day|\bdoes(n't)?\b \+"),
    ("word-order", r"word order|adjective before|adverb|before the noun|after the verb|adjective order"),
    ("pronoun-possessive", r"pronoun|possessive|belongs to|reflexive|stands alone"), ("preposition", r"preposition|\b(in|on|at|by) \+ |inside|place words"),
    ("fixed-phrase", r"\(fixed\)|fixed (phrase|expression)|let alone|\blest\b|not so much as|given half|= not even|set phrase"),
    ("linker", r"linker|concession|\badjective \+ (as|though)|\b(although|even though|though|despite|whereas|however)\b|conjunction|connect|joins? two|shows a (result|reason|contrast)|\b(so|because|but|and) (shows|joins|adds)"), ("question", r"\basks? (about|for)\b|question word|question tag|short answer"),
]
ANS = [  # grammar, step 2: the right answer itself (strong at A1–A2, where rule lines are plain)
    ("be", r"^(am|is|are|was|were|isn't|aren't|wasn't|weren't|'m|'s|'re)$"), ("article", r"^(a|an|the)$"),
    ("preposition", r"^(in|on|at|under|next to|behind|between|in front of|near|above|below|by|with|from|to|into|onto|for|of|during|until|since|over|through|across|along|around|opposite)$"),
    ("pronoun-possessive", r"^(i|me|my|mine|you|your|yours|he|him|his|she|her|hers|it|its|we|us|our|ours|they|them|their|theirs|myself|yourself|himself|herself|itself|ourselves|themselves)$"),
    ("question", r"^(what|who|where|when|why|how|which|whose|whom|how (old|many|much|often|long|far)|what time)$"),
    ("modal", r"^(can|can't|cannot|could|couldn't|must|mustn't|should|shouldn't|might|may|have to|has to|needn't|would)$"),
    ("quantifier", r"^(some|any|much|many|a few|a little|few|little|both|either|neither|each|every|all|none|no|a lot of|lots of|enough|several)$"),
    ("linker", r"^(and|but|or|so|because|although|though|however|while|whereas|despite|in spite of|unless|therefore|yet)$"),
    ("there-be", r"^there (is|are|was|were)$"), ("comparison", r"^(more|most|less|least|better|best|worse|worst|\w+er|\w+est|than|as)$"),
    ("present-simple", r"^(do|does|don't|doesn't|have|has|\w+s)$"), ("past-simple", r"^(did|didn't|\w+ed|went|saw|had|ate|came|took|made|got|ran|swam|wrote|bought|gave|found|told|said)$"),
]
V = [  # vocabulary: what kind of word knowledge the item asks for
    ("spelling", None), ("picture", None),
    ("phrasal", r"phrasal|\b(up|out|off|on|down|over|away|back) (=|means)"), ("idiom", r"idiom|saying|expression|figurative"),
    ("collocation", r"collocat|goes with|we say|\bmake\b|\bdo\b .* (homework|exercise)|\btake\b a|\bhave\b a|strong|heavy rain"),
    ("word-form", r"suffix|prefix|noun form|adjective form|verb form|-ness|-tion|-ment|-ful|-less|-able|-ly\b|\bun-|\bdis-|\bre-|word family"),
    ("opposite", r"opposite|antonym"), ("synonym", r"same meaning|synonym|similar meaning|another word"),
    ("odd-one", r"odd one|doesn't belong|not a|group"), ("meaning", r"\bmeans?\b|meaning|definition|is a word for|="),
]
LST = [  # listening (type first, then the question asked)
    ("dictation", None), ("build", None), ("gist", r"mostly about|main|topic|why is .* calling|what is .* about|purpose"),
    ("attitude", r"feel|opinion|think about|attitude|mood|happy|sad|worried|excited"), ("number-time", r"how many|how much|what time|when|price|cost|o'clock|number|how long|how old|date|day"),
    ("place", r"where"), ("reason", r"why|because"), ("person", r"who"), ("change", r"change|instead|actually|in the end|finally|decide"),
]
RD = [  # reading
    ("tf", None), ("sequence", None), ("word-meaning", None), ("headings", None),
    ("gist", r"main idea|mostly about|best title|good title|main point|purpose|summary|summar"), ("feeling", r"feel|felt|mood|opinion|attitude|tone"),
    ("inference", r"probably|suggest|imply|infer|most likely|can we tell|we can guess|why do you think"), ("reason", r"\bwhy\b|because"),
    ("word-meaning", r"\bmean\b|meaning|word .* (closest|means)|refers? to|what does .* mean"),
    ("detail", r"."),
]
def _first(rules, text, default):
    for tag, rx in rules:
        if rx and re.search(rx, text, re.I): return tag
    return default
def _right(q):
    if q.get("options") and isinstance(q.get("answer"), int): return q["options"][q["answer"]]
    if q.get("type") == "mistake": return q["words"][q["wrong"]] + " " + q.get("fix", "")
    if q.get("type") == "gaps": return " ".join(q.get("answers", []))
    return str(q.get("answer", ""))
def tag(skill, q):
    t = q.get("type", "mcq")
    if skill == "grammar":
        head = re.split(r"Example:|e\.g\.", q.get("explain", ""))[0]
        hit = _first(G, head, None)
        if hit: return "grammar." + hit
        words = [q["options"][q["answer"]]] if t == "mcq" else [q.get("fix", "")] if t == "mistake" else q.get("answers", []) if t == "gaps" else []
        for w in words:
            hit = _first(ANS, w.strip().lower(), None)
            if hit: return "grammar." + hit
        return "grammar." + ("word-order" if t == "order" else _first(G, q.get("explain", ""), "other"))
    if skill == "vocab":
        if t == "spell": return "vocab.spelling"
        if t == "picq" or q.get("pic"): return "vocab.picture"
        return "vocab." + _first(V[2:], q.get("q", "") + " " + q.get("explain", ""), "meaning")
    if skill == "listening":
        if t == "dictate": return "listening.dictation"
        if t == "order": return "listening.build"
        return "listening." + _first(LST[2:], q.get("q", ""), "detail")
    if skill == "reading":
        fixed = {"tf": "tf", "events": "sequence", "findword": "word-meaning", "headings": "headings"}
        if t in fixed: return "reading." + fixed[t]
        return "reading." + _first(RD[4:], q.get("q", ""), "detail")
    return None
CORE = ("grammar", "vocab", "listening", "reading")
def add_tags(skill, items):
    """tag every item in one bank in place; fold tags with one item into <skill>.other (then into the biggest tag)"""
    for q in items: q["sk"] = tag(skill, q)
    n = Counter(q["sk"] for q in items)
    for q in items:
        if n[q["sk"]] < 2: q["sk"] = skill + ".other"
    n = Counter(q["sk"] for q in items)
    if n.get(skill + ".other") == 1:
        big = n.most_common(1)[0][0]
        for q in items:
            if q["sk"] == skill + ".other": q["sk"] = big
    return Counter(q["sk"] for q in items)
TAG_RX = re.compile(r"^(grammar|vocab|listening|reading)\.[a-z0-9-]+$")
def check_tags(name, skill, items):
    """every item tagged, well-formed, every tag shared by at least 2 items (so a review can pick a different one)"""
    n = Counter(q.get("sk") for q in items)
    bad = [q.get("q") for q in items if not q.get("sk") or not TAG_RX.match(q["sk"]) or not q["sk"].startswith(skill + ".")]
    assert not bad, f"{name}: items without a valid skill tag: {bad[:3]}"
    lone = [k for k, c in n.items() if c < 2]; assert not lone, f"{name}: skill tags with one item: {lone}"
    return n
