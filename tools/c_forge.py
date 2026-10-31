"""⚒️ Word Forge (English follow-up, 2026-11-01): Cambridge-style WORD FORMATION for every CEFR level. Each item is a sentence
with one gap and a ROOT word in capitals; the child makes the right form of the root to fit the gap (She sang ___ (BEAUTY)
→ beautifully), the task of B1 Preliminary, B2 First Part 3, C1 Advanced Part 3 and C2 Proficiency Part 3, scaled down to
Starters–Flyers / A2 Key grammar at A1/A2.
  A1  plurals (cats, boxes, babies, children), -er/-est comparisons, -er "who does it" nouns        — tiles
  A2  -ful/-y adjectives, -ly adverbs (happily, well), spelling changes in comparatives (hotter, best) — tiles
  B1  un-/dis-/im- opposites, -ness/-ment/-tion nouns, -able/-less/-ous/-y adjectives                  — typed
  B2  re-/mis-/over-/ir-/il-/in-, -ance/-ence/-ity/-ship/-hood/-al nouns, -ive/-al/-ous/-ic adjectives — typed
  C1  negative + suffix combos (unforgettable, uncomfortably), -en/-ify/-ise/en- verbs, spelling shifts — typed
  C2  rare and stacked affixes (indispensable, counterproductive, invariably, heroically, reliability) — typed
Kid- and teen-friendly topics only (pets, school, sport, castles, space, nature), also at C1/C2.
F(sentence with ___, ROOT, answers "x|y", why-tip, p="tile|parts" (tile levels; joined they make answer 1), x=[wrong tiles])."""

def F(s, root, ans, tip, p=None, x=None):
    d = {"s": s, "root": root, "ans": ans.split("|"), "tip": tip}
    if p: d["p"] = p.split("|")
    if x: d["x"] = x
    return d

def B(icon, name, focus, items): return {"icon": icon, "name": name, "focus": focus, "items": items}

A1 = [
 B("🍎", "One, Two, Many!", "cats · boxes · babies · children", [
  F("I have two ___.", "CAT", "cats", "Most words add -s for more than one: one cat → two cats.", "cat|s", ["es", "er"]),
  F("There are three ___ on the table.", "BOX", "boxes", "Words ending in -x, -s, -sh or -ch add -es: box → boxes.", "box|es", ["s", "er"]),
  F("The two ___ are sleeping.", "BABY", "babies", "Consonant + y: change y to i and add -es: baby → babies.", "babi|es", ["s", "y"]),
  F("Five ___ are playing in the park.", "CHILD", "children", "child is special: one child → two children.", "child|ren", ["s", "es"]),
  F("I can see four ___ in the sky.", "STAR", "stars", "Add -s for more than one: star → stars.", "star|s", ["es", "er"]),
  F("I brush my ___ every morning.", "TOOTH", "teeth", "tooth is special: one tooth → two teeth.", "teeth", ["tooth", "s"]),
  F("Look at those little ___!", "MOUSE", "mice", "mouse is special: one mouse → two mice.", "mice", ["mouse", "s"]),
  F("We picked lots of ___ from the tree.", "CHERRY", "cherries", "Consonant + y: change y to i and add -es: cherry → cherries.", "cherri|es", ["s", "y"]),
 ]),
 B("🌟", "Big, Bigger, Biggest", "taller · oldest · faster", [
  F("My brother is ___ than me.", "TALL", "taller", "To compare two things, add -er and use than: tall → taller than.", "tall|er", ["est", "s"]),
  F("Grandpa is the ___ person in my family.", "OLD", "oldest", "the + -est means number one of a group: old → the oldest.", "old|est", ["er", "s"]),
  F("A cheetah is ___ than a horse.", "FAST", "faster", "Two animals compared, so -er + than: fast → faster than.", "fast|er", ["est", "ly"]),
  F("My cat is ___ than my dog.", "SMALL", "smaller", "Comparing two pets: small → smaller than.", "small|er", ["est", "s"]),
  F("Winter is ___ than summer.", "COLD", "colder", "-er + than compares two things: cold → colder than.", "cold|er", ["est", "y"]),
  F("The giraffe has the ___ neck of all the animals.", "LONG", "longest", "the … of all = number one, so -est: long → the longest.", "long|est", ["er", "s"]),
  F("This bag is ___ than that one.", "LIGHT", "lighter", "Comparing two bags: light → lighter than.", "light|er", ["est", "s"]),
  F("My teacher is the ___ person I know.", "KIND", "kindest", "the + -est = the most of all: kind → the kindest.", "kind|est", ["er", "ness"]),
 ]),
 B("🎨", "Who Does It?", "teacher · farmer · singer", [
  F("My mum is a ___. She teaches children.", "TEACH", "teacher", "Add -er to a doing word to name the person: teach → teacher.", "teach|er", ["est", "ing"]),
  F("The ___ has lots of cows and pigs.", "FARM", "farmer", "A person who works on a farm is a farmer (farm + -er).", "farm|er", ["est", "s"]),
  F("Lily sings very well. She is a great ___.", "SING", "singer", "A person who sings is a singer (sing + -er).", "sing|er", ["est", "ing"]),
  F("Tom is a football ___.", "PLAY", "player", "A person who plays a sport is a player (play + -er).", "play|er", ["est", "ful"]),
  F("The ___ painted a picture of the sea.", "PAINT", "painter", "A person who paints is a painter (paint + -er).", "paint|er", ["est", "s"]),
  F("I am a good ___. I love books!", "READ", "reader", "A person who reads is a reader (read + -er).", "read|er", ["est", "ing"]),
  F("The ___ swims very fast.", "SWIM", "swimmer", "swim ends in one vowel + one consonant, so double the m: swim → swimmer.", "swimm|er", ["est", "ing"]),
  F("The ___ drives the bus to school.", "DRIVE", "driver", "drive already ends in e, so just add -r: drive → driver.", "drive|r", ["er", "s"]),
 ]),
]

A2 = [
 B("🌈", "Full of It!", "helpful · careful · sunny · noisy", [
  F("Thank you! You are very ___.", "HELP", "helpful", "-ful means 'full of' and makes a describing word: help → helpful.", "help|ful", ["less", "er"]),
  F("The garden is full of ___ flowers.", "COLOUR", "colourful|colorful", "colour + -ful = colourful (full of colours). colorful is the American spelling.", "colour|ful", ["y", "s"]),
  F("Be ___ when you cross the road.", "CARE", "careful", "care + -ful = careful (taking care).", "care|ful", ["less", "y"]),
  F("It's ___ today, so take your sunglasses.", "SUN", "sunny", "Weather words often add -y. sun has one vowel + one consonant, so double the n: sunny.", "sunn|y", ["ful", "er"]),
  F("It was a ___ day, so we played games inside.", "RAIN", "rainy", "Weather words often add -y: rain → rainy.", "rain|y", ["ful", "er"]),
  F("The princess wore a ___ dress.", "BEAUTY", "beautiful", "beauty + -ful: the y changes to i: beautiful.", "beauti|ful", ["ness", "s"]),
  F("The puppy is very ___ and loves games.", "PLAY", "playful", "play + -ful = playful (full of fun).", "play|ful", ["er", "ly"]),
  F("The classroom was very ___ at lunchtime.", "NOISE", "noisy", "noise + -y: drop the e first: noisy.", "nois|y", ["ful", "e"]),
 ]),
 B("🐢", "How Do You Do It?", "slowly · happily · well", [
  F("The turtle walks very ___.", "SLOW", "slowly", "To say HOW someone does something, add -ly: slow → slowly.", "slow|ly", ["er", "est"]),
  F("Please speak ___ in the library.", "QUIET", "quietly", "How do you speak? quiet + -ly = quietly.", "quiet|ly", ["er", "ness"]),
  F("The children played ___ in the garden.", "HAPPY", "happily", "Consonant + y: change y to i, then add -ly: happy → happily.", "happi|ly", ["er", "ness"]),
  F("Run ___! The bus is coming!", "QUICK", "quickly", "How should you run? quick + -ly = quickly.", "quick|ly", ["er", "est"]),
  F("Hold the baby bird ___.", "CAREFUL", "carefully", "careful + -ly = carefully (so it has two l's).", "careful|ly", ["ness", "y"]),
  F("She answered all the questions ___.", "EASY", "easily", "Consonant + y: change y to i, then add -ly: easy → easily.", "easi|ly", ["er", "est"]),
  F("The lion roared ___.", "LOUD", "loudly", "How did it roar? loud + -ly = loudly.", "loud|ly", ["er", "est"]),
  F("Our team played ___ and won the cup.", "GOOD", "well", "good is special: the -ly word for good is well.", "well", ["good", "ly"]),
 ]),
 B("🏆", "Even More!", "hotter · happiest · best · worse", [
  F("Today is ___ than yesterday.", "HOT", "hotter", "hot has one vowel + one consonant, so double the t before -er: hotter.", "hott|er", ["est", "y"]),
  F("My dog is the ___ dog in the world!", "HAPPY", "happiest", "the + -est. Change y to i first: happy → the happiest.", "happi|est", ["er", "ly"]),
  F("This is the ___ film I have ever seen. I laughed a lot!", "FUNNY", "funniest", "the … I have ever seen = number one, so -est: funny → the funniest.", "funni|est", ["er", "ly"]),
  F("My new school bag is ___ than my old one.", "BIG", "bigger", "big: one vowel + one consonant, so double the g: bigger than.", "bigg|er", ["est", "s"]),
  F("Mia is my ___ friend.", "GOOD", "best", "good is special: good → better → best.", "best", ["good", "est"]),
  F("My handwriting is ___ than my brother's.", "BAD", "worse", "bad is special: bad → worse → worst. Comparing two people, so worse than.", "worse", ["bad", "er"]),
  F("An elephant is ___ than a hippo.", "LARGE", "larger", "large ends in e, so just add -r: larger than.", "large|r", ["er", "st"]),
  F("That was the ___ test of the year.", "EASY", "easiest", "the … of the year = number one, so -est; change y to i: easiest.", "easi|est", ["er", "ly"]),
 ]),
]

B1 = [
 B("🙈", "Not At All!", "unkind · disagree · impossible", [
  F("Don't be ___ to your little sister. Be nice!", "KIND", "unkind", "un- means 'not': kind → unkind (not kind).", None),
  F("I ___ with you. I think cats are better than dogs.", "AGREE", "disagree", "dis- makes the opposite of some verbs: agree → disagree.", None),
  F("It's ___ to finish this puzzle in one minute!", "POSSIBLE", "impossible", "Many words starting with p take im- for 'not': possible → impossible.", None),
  F("Your room is very ___. Please tidy it!", "TIDY", "untidy", "un- + tidy = untidy (not tidy).", None),
  F("The magician made the rabbit ___.", "APPEAR", "disappear", "dis- + appear = disappear (the opposite of appear).", None),
  F("It's ___ to talk with your mouth full.", "POLITE", "impolite", "polite starts with p, so 'not polite' is impolite.", None),
  F("The cat looked very ___ when it got wet.", "HAPPY", "unhappy", "un- + happy = unhappy (not happy). The sentence tells us the cat was sad.", None),
  F("My brother ___ broccoli. He never eats it.", "LIKE", "dislikes", "dis- + like = dislike, and with he/she we add -s: he dislikes.", None),
 ]),
 B("📦", "Thing Words", "kindness · excitement · invitation", [
  F("Thank you for your ___!", "KIND", "kindness", "After your we need a noun (a thing word): kind + -ness = kindness.", None),
  F("There was a lot of ___ before the school play.", "EXCITE", "excitement", "a lot of + noun: excite + -ment = excitement.", None),
  F("We got an ___ to Emma's birthday party.", "INVITE", "invitation", "an + noun: invite → invitation (drop the e, add -ation).", None),
  F("I'm scared of the ___, so I sleep with a night light.", "DARK", "darkness", "the + noun: dark + -ness = darkness.", None),
  F("The dancers practised every ___ of the dance.", "MOVE", "movement", "every + noun: move + -ment = movement.", None),
  F("Can you give me some ___ about the school trip?", "INFORM", "information", "some + noun: inform + -ation = information.", None),
  F("Mum made a big ___: we can have a puppy!", "DECIDE", "decision", "a + noun: decide → decision (the d changes to s).", None),
  F("The children shouted with ___ when they won.", "HAPPY", "happiness", "with + noun: happy + -ness, and y changes to i: happiness.", None),
 ]),
 B("🧸", "What's It Like?", "comfortable · careless · dangerous · foggy", [
  F("This new sofa is very ___.", "COMFORT", "comfortable", "very + adjective: comfort + -able = comfortable.", None),
  F("Don't be so ___! You dropped your lunch again.", "CARE", "careless", "-less means 'without': careless = without care.", None),
  F("Climbing on the roof is ___.", "DANGER", "dangerous", "-ous makes an adjective: danger → dangerous.", None),
  F("She wants to be a ___ singer one day.", "FAME", "famous", "fame + -ous: drop the e: famous.", None),
  F("We had a very ___ day at the water park.", "ENJOY", "enjoyable", "-able = can be enjoyed: enjoy + -able = enjoyable.", None),
  F("It was so ___ that we couldn't see the hills.", "FOG", "foggy", "Weather + -y. fog has one vowel + one consonant, so double the g: foggy.", None),
  F("This old torch is ___ now. It doesn't work.", "USE", "useless", "-less = without: useless = no use at all.", None),
  F("The paths were ___ this morning, so we walked slowly.", "ICE", "icy", "ice + -y: drop the e: icy.", None),
 ]),
]

B2 = [
 B("🔄", "Prefix Power", "rebuild · misunderstood · overslept · irregular", [
  F("The storm knocked down our treehouse, so we had to ___ it.", "BUILD", "rebuild", "re- means 'again': rebuild = build again.", None),
  F("Sorry, I ___ the question. Can you say it again?", "UNDERSTAND", "misunderstood|misunderstand", "mis- means 'wrongly': misunderstand. In the past: misunderstood.", None),
  F("I ___ and missed the school bus!", "SLEEP", "overslept", "over- means 'too much': oversleep. The story is in the past: overslept.", None),
  F("Leaving your bike unlocked is ___.", "RESPONSIBLE", "irresponsible", "Words starting with r take ir- for 'not': irresponsible.", None),
  F("In many countries it is ___ to ride a bike at night without lights.", "LEGAL", "illegal", "Words starting with l take il- for 'not': illegal.", None),
  F("Your answer is ___. Have another try!", "CORRECT", "incorrect", "in- means 'not' with many words: incorrect.", None),
  F("'Go' is an ___ verb: go, went, gone.", "REGULAR", "irregular", "regular starts with r, so 'not regular' is irregular.", None),
  F("I ___ the time, so we got to the cinema far too early.", "CALCULATE", "miscalculated", "mis- = wrongly: miscalculate. Past tense: miscalculated.", None),
 ]),
 B("🏅", "Noun Smith", "performance · patience · friendship · ability", [
  F("The class gave a wonderful ___ of the play.", "PERFORM", "performance", "a + adjective + noun: perform + -ance = performance.", None),
  F("Jigsaw puzzles need a lot of ___.", "PATIENT", "patience", "a lot of + noun: patient → patience (-ent becomes -ence).", None),
  F("Their ___ started on the first day of school.", "FRIEND", "friendship", "-ship makes a noun for a relationship: friend → friendship.", None),
  F("Grandpa told us stories about his ___ on a farm.", "CHILD", "childhood", "-hood = the time of being something: childhood = the time when you are a child.", None),
  F("Swimming is my favourite ___.", "ACTIVE", "activity", "my favourite + noun: active → activity (drop the e, add -ity).", None),
  F("Our cat's ___ got her stuck in a box again.", "CURIOUS", "curiosity", "Adjectives in -ous often make nouns in -osity: curious → curiosity.", None),
  F("Leo has an amazing ___ to remember numbers.", "ABLE", "ability", "an + adjective + noun: able → ability.", None),
  F("The ___ of the baby panda at the zoo made everyone happy.", "ARRIVE", "arrival", "the … of = a noun: arrive → arrival (drop the e, add -al).", None),
 ]),
 B("🖍", "Describe It", "creative · natural · adventurous · scientific", [
  F("Lucy is very ___. She is always drawing and making things.", "CREATE", "creative", "very + adjective: create → creative (drop the e, add -ive).", None),
  F("We only use ___ ingredients in our cookies.", "NATURE", "natural", "An adjective before a noun: nature → natural.", None),
  F("My uncle is very ___. He has climbed lots of mountains.", "ADVENTURE", "adventurous", "adventure → adventurous (drop the e, add -ous).", None),
  F("Our class did a ___ experiment with vinegar and baking soda.", "SCIENCE", "scientific", "An adjective before experiment: science → scientific.", None),
  F("The puppy is so ___! He runs around all day.", "ENERGY", "energetic", "so + adjective: energy → energetic.", None),
  F("We ate ___ food at the Chinese New Year festival.", "TRADITION", "traditional", "An adjective before food: tradition + -al = traditional.", None),
  F("A ___ noise came from the attic.", "MYSTERY", "mysterious", "mystery + -ous: y changes to i: mysterious.", None),
  F("This video game is too ___. I can't buy it with my pocket money.", "EXPENSE", "expensive", "too + adjective: expense → expensive.", None),
 ]),
]

C1 = [
 B("🧩", "Not & More", "unbelievable · disappointment · uncomfortably", [
  F("The magic show was ___! How did he do it?", "BELIEVE", "unbelievable", "Two steps: believe → believable (drop the e, add -able), then un-: unbelievable.", None),
  F("Our trip to the beach was ___. We'll remember it for ever.", "FORGET", "unforgettable", "un- + forget + -able; double the t: unforgettable (impossible to forget).", None),
  F("Much to our ___, the concert was cancelled.", "APPOINT", "disappointment", "Two affixes: dis- + appoint + -ment. 'Much to our …' needs a noun.", None),
  F("The weather in the mountains is very ___, so pack a raincoat.", "PREDICT", "unpredictable", "un- + predict + -able = unpredictable (you can't predict it).", None),
  F("The old camp bed was ___ hard, so I couldn't sleep.", "COMFORT", "uncomfortably", "An adverb before hard: un- + comfortable, then -le → -ly: uncomfortably.", None),
  F("The museum was ___ quiet on Monday morning.", "EXPECT", "unexpectedly", "un- + expected + -ly: an adverb that describes quiet.", None),
  F("Many countries celebrate their ___ Day with fireworks.", "DEPEND", "independence", "in- (not) + depend + -ence: independence = not depending on others.", None),
  F("The goats escaped because of his ___ with the gate.", "CARE", "carelessness", "Stacked suffixes: care → careless (adjective) → carelessness (noun).", None),
 ]),
 B("⚒️", "Verb Makers", "strengthen · simplify · modernise · encourage", [
  F("Daily practice will ___ your muscles.", "STRONG", "strengthen", "will + verb. strong → strength (noun) → strengthen (-en = make): the o changes to e.", None),
  F("They are going to ___ the road near our school.", "WIDE", "widen", "-en makes a verb meaning 'make more': wide → widen.", None),
  F("Can you ___ the instructions? They're too hard for us.", "SIMPLE", "simplify", "-ify = make: simple → simplify (the -le drops).", None),
  F("The museum wants to ___ its old dinosaur hall.", "MODERN", "modernise|modernize", "-ise/-ize = make: modernise means make modern. Both spellings are right.", None),
  F("We used a special filter to ___ the pond water.", "PURE", "purify", "pure → purify (drop the e, add -ify = make pure).", None),
  F("Dark clouds ___ to spoil our picnic.", "THREAT", "threatened", "threat (noun) → threaten (verb, -en). The sentence is in the past: threatened.", None),
  F("Scientists ___ animals into groups such as mammals and birds.", "CLASS", "classify", "class → classify (-ify = put into classes). They classify: no -s.", None),
  F("The coach's kind words ___ me to try again.", "COURAGE", "encouraged", "en- = give: encourage. Past tense: encouraged.", None),
 ]),
 B("🪄", "Tricky Spellings", "pronunciation · generosity · repetition", [
  F("Your ___ of new words is getting better and better.", "PRONOUNCE", "pronunciation", "Watch the spelling: pronounce loses an o in the noun: pronunciation.", None),
  F("Thank you for your clear ___ of the rules.", "EXPLAIN", "explanation", "explain → explanation: the i disappears.", None),
  F("Everyone thanked the baker for his ___. He gave free cupcakes to the whole class.", "GENEROUS", "generosity", "-ous → -osity: generous → generosity.", None),
  F("Learning a new song takes a lot of ___.", "REPEAT", "repetition", "repeat → repetition: the ea becomes e and we add -ition.", None),
  F("Sara is very ___. She got everyone to join the chess club.", "PERSUADE", "persuasive", "persuade → persuasive: the d changes to s.", None),
  F("Write a short ___ of your favourite animal.", "DESCRIBE", "description", "describe → description: the b changes to p.", None),
  F("The ___ of the swimming pool is two metres.", "DEEP", "depth", "deep → depth: a noun that loses one e.", None),
  F("Our old school bus needs regular ___.", "MAINTAIN", "maintenance", "maintain → maintenance: the ai becomes e, then -ance.", None),
 ]),
]

C2 = [
 B("💎", "Master Smith", "indispensable · unprecedented · irreplaceable", [
  F("A good torch is ___ on a camping trip.", "DISPENSE", "indispensable", "in- + dispense + -able (drop the e): indispensable = absolutely necessary.", None),
  F("Our school team had an ___ run of twenty wins in a row.", "PRECEDE", "unprecedented", "un- + precedent + -ed: unprecedented = never happened before.", None),
  F("Grandma's old teddy bear is ___ to me.", "REPLACE", "irreplaceable", "ir- + replace + -able. Keep the e after c so it still sounds like s: irreplaceable.", None),
  F("It's ___ that anyone could eat fifty pancakes in one go!", "CONCEIVE", "inconceivable", "in- + conceive + -able (drop the e): impossible to imagine.", None),
  F("Shouting at a scared puppy is ___. It only makes things worse.", "PRODUCE", "counterproductive", "counter- (against) + productive: it works against what you want.", None),
  F("The instructions were ___, so we didn't need any help.", "EXPLAIN", "self-explanatory|self explanatory", "self- + explanatory (explain loses its i): it explains itself.", None),
  F("The class voted ___ for a longer lunch break.", "WHELM", "overwhelmingly", "over- + whelm + -ing + -ly: four parts make one adverb meaning 'by a huge number'.", None),
  F("Our cat ___ wakes me up at six, even at weekends.", "VARY", "invariably", "in- + vary (y → i) + -able + -ly: invariably = always, without change.", None),
 ]),
 B("🔮", "Hidden Changes", "heroically · insensitive · indistinguishable", [
  F("The firefighters acted ___ to save the kittens.", "HERO", "heroically", "hero → heroic → heroically: -ic adjectives make adverbs with -ally.", None),
  F("Laughing at someone's mistake is ___.", "SENSE", "insensitive", "sense → sensitive (drop the e, add -itive) → in- for 'not': insensitive.", None),
  F("The top shelf is ___ to little children.", "ACCESS", "inaccessible", "in- + access + -ible (not -able): inaccessible = can't be reached.", None),
  F("The twin puppies were almost ___. We couldn't tell them apart!", "DISTINGUISH", "indistinguishable", "in- + distinguish + -able: impossible to tell apart.", None),
  F("The judges loved the ___ of Mia's drawings.", "ORIGINAL", "originality", "original + -ity = originality (the quality of being new and different).", None),
  F("The team's ___ to give up helped them win the final.", "REFUSE", "refusal", "refuse → refusal (drop the e, add -al): the noun after The team's.", None),
  F("The ___ of the giant redwood trees amazed us.", "MAGNIFICENT", "magnificence", "-ent adjectives make -ence nouns: magnificent → magnificence.", None),
  F("The cat stared ___ at the fish tank.", "LONG", "longingly", "long (to want) → longing → longingly: an adverb describing how it stared.", None),
 ]),
 B("🌠", "Grand Wordcraft", "enthusiastically · disproportionate · unquestionably", [
  F("The class cheered ___ when the winner was announced.", "ENTHUSIASM", "enthusiastically", "enthusiasm → enthusiastic → enthusiastically (-ic + -ally).", None),
  F("The goalkeeper gets a ___ amount of blame when the team loses.", "PROPORTION", "disproportionate", "dis- + proportion + -ate: disproportionate = too big compared with the rest.", None),
  F("The dinosaur fossil was ___ well preserved.", "REMARK", "remarkably", "remark → remarkable → remarkably (-le → -ly): an adverb before well.", None),
  F("Ollie's handwriting was so messy that it was ___.", "LEGIBLE", "illegible", "legible starts with l, so its opposite takes il-: illegible = impossible to read.", None),
  F("The cat looked at the new vacuum cleaner with great ___.", "SUSPECT", "suspicion", "suspect → suspicion: the noun after with great; the t changes to c and we add -ion.", None),
  F("The old map was written in a code that was ___ to us.", "COMPREHEND", "incomprehensible", "in- + comprehend (d → s) + -ible: impossible to understand.", None),
  F("Ava's poster was ___ the best in the competition.", "QUESTION", "unquestionably", "un- + question + -able + -ly: unquestionably = without any doubt.", None),
  F("We tested the robot many times to check its ___.", "RELY", "reliability", "rely → reliable (y → i) → reliability (-able → -ability).", None),
 ]),
]

FORGE = {"a1": A1, "a2": A2, "b1": B1, "b2": B2, "c1": C1, "c2": C2}
MODE = {"a1": "tiles", "a2": "tiles", "b1": "type", "b2": "type", "c1": "type", "c2": "type"}
