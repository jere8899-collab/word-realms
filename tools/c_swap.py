"""🔀 Spell Swap (English follow-up, 2026-11-01): "same meaning, new words" sentence transformations for every CEFR level,
modelled on the Cambridge task types. Each item: sentence 1 (a), a cue, sentence 2 with one gap (b), accepted answers.
  A1/A2 — Starters/Movers/Flyers and A2 Key style "change it" tasks (make it negative, a question, plural, past, comparative…),
          answered with word tiles (the first answer is the tile answer; x = extra wrong tiles).
  B1    — the classic Preliminary "complete the second sentence so it means the same; no more than three words" task, typed.
  B2    — B2 First Reading & Use of English Part 4: a KEY WORD that must not change, 2–5 words.
  C1    — C1 Advanced Part 4: key word, 3–6 words.        C2 — C2 Proficiency Part 4: key word, 3–8 words.
Contractions count as two words (as in the Cambridge exams); a possessive 's is part of its word.
Kid topics only (pets, school, dragons, space, sport, castles), also at C1/C2.
T(a, cue, b, answers "x|y", tip, x=[extra tiles]) — the first answer is the model answer (and the tile answer at A1/A2)."""

def T(a, cue, b, ans, tip, x=None):
    d = {"a": a, "cue": cue, "b": b, "ans": ans.split("|"), "tip": tip}
    if x: d["x"] = x
    return d

def B(icon, name, focus, items): return {"icon": icon, "name": name, "focus": focus, "items": items}

NOT, ASK, MANY = "Make it NOT true.", "Make it a question.", "Make it more than one."
A1 = [
 B("🐾", "Not True!", "don't · doesn't · isn't · aren't · can't", [
  T("I like carrots.", NOT, "I ___ carrots.", "don't like|do not like", "With I, you, we and they we use don't + verb: I don't like carrots.", ["doesn't", "likes"]),
  T("My cat is big.", NOT, "My cat ___ big.", "isn't|is not", "is → isn't (is not): My cat isn't big.", ["aren't", "don't"]),
  T("Sam has a red bike.", NOT, "Sam ___ a red bike.", "doesn't have|does not have", "With he, she and it we use doesn't + verb with no -s: Sam doesn't have a bike.", ["don't", "has"]),
  T("We are at school.", NOT, "We ___ at school.", "aren't|are not", "are → aren't (are not): We aren't at school.", ["isn't", "don't"]),
  T("I can swim.", NOT, "I ___ swim.", "can't|cannot|can not", "can → can't (cannot): I can't swim.", ["don't", "isn't"]),
  T("She plays football.", NOT, "She ___ football.", "doesn't play|does not play", "She plays → she doesn't play (no -s after doesn't).", ["plays", "don't"]),
  T("They live in a castle.", NOT, "They ___ in a castle.", "don't live|do not live", "They live → they don't live.", ["doesn't", "lives"]),
  T("There is a dragon in the garden.", NOT, "There ___ a dragon in the garden.", "isn't|is not", "There is → there isn't: There isn't a dragon in the garden.", ["aren't", "don't"]),
 ]),
 B("💬", "Ask It!", "Do you…? · Is he…? · Can she…?", [
  T("You like bananas.", ASK, "___ like bananas?", "Do you", "For questions with like, have, play… we start with Do: Do you like bananas?", ["Does", "Are"]),
  T("He is happy.", ASK, "___ happy?", "Is he", "With is, swap the words: He is → Is he happy?", ["Does", "Are"]),
  T("She can ride a horse.", ASK, "___ ride a horse?", "Can she", "With can, swap the words: She can → Can she ride a horse?", ["Does", "Is"]),
  T("They are in the park.", ASK, "___ in the park?", "Are they", "They are → Are they in the park?", ["Is", "Do"]),
  T("Your dog likes cheese.", ASK, "___ your dog like cheese?", "Does", "With he, she, it (your dog) we start with Does, and the verb loses its -s: Does your dog like cheese?", ["Do", "Is"]),
  T("The pizza is hot.", ASK, "___ hot?", "Is the pizza", "The pizza is → Is the pizza hot?", ["Does", "Are"]),
  T("Your sister has a kite.", ASK, "___ have a kite?", "Does your sister", "Your sister has → Does your sister have a kite? (has becomes have)", ["Do", "Has"]),
  T("We can play now.", ASK, "___ play now?", "Can we", "We can → Can we play now?", ["Do", "Are"]),
 ]),
 B("🍎", "One or Many?", "apples · boxes · mice · feet · has got", [
  T("I have one apple.", MANY, "I have two ___.", "apples", "Most words add -s for more than one: apple → apples.", ["apple", "an"]),
  T("There is a mouse.", MANY, "There are five ___.", "mice", "Some words change: one mouse → two mice.", ["mouses", "mouse"]),
  T("This is my box.", MANY, "These are my ___.", "boxes", "Words ending in -x, -s, -sh, -ch add -es: box → boxes.", ["boxs", "box"]),
  T("One child is singing.", MANY, "Two ___ are singing.", "children", "one child → two children.", ["childs", "child"]),
  T("I have got a sister.", "Now say it about Tom.", "Tom ___ a sister.", "has got|has", "I have got → he/she has got: Tom has got a sister.", ["have", "is"]),
  T("There is one baby.", MANY, "There are two ___.", "babies", "A word ending in consonant + y changes y to -ies: baby → babies.", ["babys", "baby"]),
  T("My foot is cold.", MANY, "My ___ are cold.", "feet", "one foot → two feet.", ["foots", "foot"]),
  T("There is one sheep.", MANY, "There are six ___.", "sheep", "Sheep stays the same: one sheep, six sheep.", ["sheeps", "ship"]),
 ]),
]

PAST, RULE = "Say it about the past.", "Say it as a rule."
A2 = [
 B("🕰️", "Yesterday", "played · went · ate · was · didn't · Did…?", [
  T("I play in the park every day.", PAST, "Yesterday I ___ in the park.", "played", "Regular verbs add -ed in the past: play → played.", ["play", "plays"]),
  T("We go to the beach on Sundays.", PAST, "Last Sunday we ___ to the beach.", "went", "go is irregular: go → went.", ["goed", "go"]),
  T("Mia eats a big cake.", PAST, "Yesterday Mia ___ a big cake.", "ate", "eat is irregular: eat → ate.", ["eated", "eats"]),
  T("The dragon is very tired.", PAST, "Last night the dragon ___ very tired.", "was", "is → was in the past (I/he/she/it was).", ["were", "is"]),
  T("They are at the zoo.", PAST, "Yesterday they ___ at the zoo.", "were", "are → were in the past (you/we/they were).", ["was", "are"]),
  T("I don't see the bus.", PAST, "Yesterday I ___ the bus.", "didn't see|did not see", "In past negatives, didn't + the base verb: I didn't see (not didn't saw).", ["saw", "don't"]),
  T("Do you like the film?", PAST, "___ like the film last night?", "Did you", "Past questions start with Did + base verb: Did you like the film?", ["Do", "Were"]),
  T("Ben buys a new kite.", PAST, "Last week Ben ___ a new kite.", "bought", "buy is irregular: buy → bought.", ["buyed", "buys"]),
 ]),
 B("🏆", "Bigger and Best", "taller than · not as fast as · the highest", [
  T("Tom is shorter than Ana.", "Now say it about Ana.", "Ana is ___ Tom.", "taller than", "Short words add -er + than: tall → taller than.", ["tall", "more"]),
  T("The red car is not as fast as the blue car.", "Now say it about the blue car.", "The blue car is ___ the red car.", "faster than", "not as fast as ↔ faster than (the other way round).", ["fast", "as"]),
  T("No mountain is higher than Mount Everest.", "Use 'the …est'.", "Mount Everest is ___ mountain in the world.", "the highest", "The superlative: the + adjective + -est: the highest.", ["higher", "most"]),
  T("This puzzle is easier than that one.", "Now say it about that puzzle.", "That puzzle is ___ this one.", "more difficult than|harder than", "Long adjectives use more + adjective + than: more difficult than.", ["most", "difficulter"]),
  T("Lily sings better than me.", "Use 'as … as'.", "I don't sing as ___ Lily.", "well as", "not as well as = worse than. sing well → as well as (well, not good, with a verb).", ["good", "better"]),
  T("Pip's house is the smallest in the street.", "Now say it about the other houses.", "All the other houses are ___ Pip's house.", "bigger than|larger than", "If Pip's house is the smallest, the others are bigger than it. big → bigger (double g).", ["big", "biggest"]),
  T("The film was more exciting than the book.", "Now say it about the book.", "The book was ___ the film.", "less exciting than|not as exciting as", "more exciting than ↔ less exciting than (or not as exciting as).", ["more", "most"]),
  T("Nobody in our class is funnier than Max.", "Use 'the …est'.", "Max is ___ person in our class.", "the funniest", "funny → the funniest (y changes to i).", ["funnier", "most"]),
 ]),
 B("📝", "Plans and Rules", "going to · have to · can't · don't have to · 's", [
  T("My plan is to visit Grandma on Saturday.", "Use 'going to'.", "I'm ___ Grandma on Saturday.", "going to visit", "For plans we use be going to + verb: I'm going to visit Grandma.", ["go", "visiting"]),
  T("It's important to wear a helmet.", RULE, "You ___ wear a helmet.", "have to|must", "For rules we say have to or must + verb: You have to wear a helmet.", ["has", "can"]),
  T("This book belongs to my brother.", "Use 's.", "This is my ___ book.", "brother's", "To show who owns something, add 's: my brother's book.", ["brothers", "brother"]),
  T("Swimming in this lake is not allowed.", RULE, "You ___ swim in this lake.", "can't|cannot|can not|mustn't|must not", "When something is not allowed we say can't or mustn't: You can't swim here.", ["can", "don't"]),
  T("Let's have a picnic!", "Make it a 'Why…?' question.", "Why ___ have a picnic?", "don't we", "Why don't we…? is a friendly way to suggest something.", ["not", "doesn't"]),
  T("Our flat has two bedrooms.", "Use 'There…'.", "There ___ two bedrooms in our flat.", "are", "For more than one thing: There are two bedrooms.", ["is", "has"]),
  T("It isn't necessary to bring lunch.", RULE, "You ___ bring lunch.", "don't have to|do not have to|needn't|need not|don't need to|do not need to", "don't have to = it isn't necessary (you can if you want). mustn't means it is not allowed!", ["mustn't", "doesn't"]),
  T("I started learning the piano two years ago.", "Use 'for'.", "I ___ the piano for two years.", "have learned|have learnt|'ve learned|'ve learnt|have been learning|'ve been learning|have played|'ve played", "Something that started in the past and is still true: have + past participle + for: I have learned the piano for two years.", ["learn", "since"]),
 ]),
]

B1C = "No more than three words."
B1 = [
 B("🌧️", "If and Since", "if · unless · too / enough · for / since", [
  T("Hurry, or you'll miss the bus.", B1C, "If you ___ up, you'll miss the bus.", "don't hurry|do not hurry", "… or you'll… = If you don't…, you'll…", []),
  T("The water was too cold for us to swim in.", B1C, "The water wasn't ___ for us to swim in.", "warm enough", "too cold = not warm enough (enough goes after the adjective).", []),
  T("The box is so heavy that I can't lift it.", B1C, "The box is ___ for me to lift.", "too heavy", "so heavy that I can't = too heavy for me to…", []),
  T("Unless you water the plant, it will die.", B1C, "If you ___ the plant, it will die.", "don't water|do not water", "unless = if … not: unless you water = if you don't water.", []),
  T("I haven't got a map, so I can't find the castle.", B1C, "If I ___ a map, I could find the castle.", "had|had got", "Imagined situations now: If + past simple, … could/would: If I had a map…", []),
  T("Mia started learning judo three years ago.", B1C, "Mia has ___ judo for three years.", "been learning|learned|learnt|been doing|done", "started … ago → has been learning … for (present perfect + for).", []),
  T("It's ages since I last saw my cousin.", B1C, "I ___ my cousin for ages.", "haven't seen|have not seen", "It's ages since I last saw = I haven't seen … for ages.", []),
  T("The last time I rode a horse was in May.", B1C, "I ___ a horse since May.", "haven't ridden|have not ridden", "The last time … was in May = I haven't … since May. ride → ridden.", []),
 ]),
 B("📣", "Said and Done", "passive · reported speech · used to", [
  T("Someone stole my bike yesterday.", B1C, "My bike ___ yesterday.", "was stolen", "Passive in the past: was/were + past participle: My bike was stolen.", []),
  T("They built the castle in 1300.", B1C, "The castle ___ in 1300.", "was built", "The castle is the thing the action happened to → passive: was built.", []),
  T("When I was little, I often played with toy dinosaurs.", B1C, "I ___ with toy dinosaurs when I was little.", "used to play", "Past habits that have stopped: used to + verb.", []),
  T("'I am hungry,' said Leo.", B1C, "Leo said that he ___ hungry.", "was", "In reported speech the tense moves back: am → was.", []),
  T("'Can you help me?' Ana asked me.", B1C, "Ana asked me if I ___ help her.", "could", "Reported questions: can → could, and no question order: asked if I could help.", []),
  T("People speak English in many countries.", B1C, "English ___ in many countries.", "is spoken", "Passive in the present: is/are + past participle: English is spoken.", []),
  T("'Don't touch the dragon egg!' the wizard told us.", B1C, "The wizard told us ___ the dragon egg.", "not to touch", "Reported orders: told someone (not) to + verb: told us not to touch.", []),
  T("There was nobody in the classroom.", B1C, "There ___ in the classroom.", "wasn't anybody|wasn't anyone|was not anybody|was not anyone", "nobody = not … anybody: There wasn't anybody.", []),
 ]),
 B("🧩", "Same Idea, New Words", "bored by · never been · far from · old enough", [
  T("My favourite subject is art.", B1C, "I like art ___ any other subject.", "more than|better than", "favourite = the one you like more than any other.", []),
  T("The film was boring.", B1C, "I was ___ the film.", "bored by|bored with|bored during", "-ing describes the thing (boring film); -ed describes how you feel (I was bored).", []),
  T("How about going to the aquarium?", B1C, "Why ___ go to the aquarium?", "don't we|not", "How about …ing? = Why don't we…? / Why not…? (suggestions).", []),
  T("This is my first time on a plane.", B1C, "I have ___ on a plane before.", "never been|never flown", "my first time = I have never … before.", []),
  T("Is it OK if I use your pencil?", B1C, "Do you mind ___ your pencil?", "if I use|me using|my using", "Do you mind if I + verb? / Do you mind me using…? is a polite way to ask.", []),
  T("The museum is very near my house.", B1C, "The museum isn't ___ my house.", "far from", "very near = not far from.", []),
  T("Tom is too young to drive.", B1C, "Tom isn't ___ to drive.", "old enough", "too young = not old enough.", []),
  T("Nobody in my class is as fast as Kemi.", B1C, "Kemi is ___ person in my class.", "the fastest", "Nobody is as fast as Kemi = Kemi is the fastest.", []),
 ]),
]

B2 = [
 B("🗝️", "Key Word Castle", "wish · might · can't have · if · needn't have", [
  T("I regret not studying for the test.", "WISH", "I ___ for the test.", "wish I had studied|wish I'd studied", "Regrets about the past: wish + past perfect: I wish I had studied."),
  T("It's possible that the dragon is sleeping.", "MIGHT", "The dragon ___ sleeping.", "might be", "It's possible that … = might + verb: The dragon might be sleeping."),
  T("I'm sure Ella didn't break the vase.", "CAN'T", "Ella ___ the vase.", "can't have broken|cannot have broken", "Sure something didn't happen = can't have + past participle."),
  T("We didn't win because we didn't train.", "IF", "We would have won ___ trained.", "if we had|if we'd", "Third conditional: would have won if we had trained (past perfect after if)."),
  T("It wasn't necessary for us to bring food, but we did.", "NEED", "We ___ food.", "needn't have brought|need not have brought", "needn't have + past participle = we did it, but it wasn't necessary."),
  T("Please don't make so much noise.", "RATHER", "I'd ___ so much noise.", "rather you didn't make|rather you did not make", "I'd rather + someone + past simple = I want them to (not) do it."),
  T("It's a long time since I went ice-skating.", "AGES", "I haven't been ice-skating ___.", "for ages|in ages", "It's a long time since… = I haven't … for ages."),
  T("My dad said I could stay up late.", "LET", "My dad ___ up late.", "let me stay", "let + person + base verb (no to): let me stay."),
 ]),
 B("🦉", "Owl's Tricky Turns", "is said to · had my hair cut · called off · reminded me to", [
  T("People say that the forest is haunted.", "SAID", "The forest ___ haunted.", "is said to be", "People say that X is… = X is said to be…"),
  T("They are going to repair the bridge next week.", "BE", "The bridge ___ next week.", "is going to be repaired|will be repaired", "Future passive: is going to be / will be + past participle."),
  T("'I'll help you with your homework,' said Zoe.", "OFFERED", "Zoe ___ with my homework.", "offered to help me", "offer + to + verb: Zoe offered to help me."),
  T("I'm really looking forward to the school trip.", "WAIT", "I ___ the school trip.", "can't wait for|cannot wait for", "can't wait for = be very excited about something in the future."),
  T("A hairdresser cut my hair yesterday.", "HAD", "I ___ yesterday.", "had my hair cut", "have something done = someone else does it for you: I had my hair cut."),
  T("Mo cancelled the party because it rained.", "CALLED", "Mo ___ because it rained.", "called off the party|called the party off", "call off = cancel."),
  T("I started this puzzle two hours ago.", "BEEN", "I ___ this puzzle for two hours.", "have been doing|'ve been doing|have been working on|'ve been working on", "Started in the past and still going: have been + -ing + for."),
  T("'Don't forget your swimsuit,' Mum said to me.", "REMINDED", "Mum ___ my swimsuit.", "reminded me to bring|reminded me to take|reminded me to pack", "remind + person + to + verb: Mum reminded me to bring my swimsuit."),
 ]),
 B("✨", "Spell Words", "so … that · despite · no point · used to + -ing", [
  T("Ravi was too tired to finish the race.", "SO", "Ravi was ___ he couldn't finish the race.", "so tired that", "too tired to… = so tired that … couldn't…"),
  T("Although it was raining, we played outside.", "DESPITE", "___, we played outside.", "despite the rain|despite it raining|despite its raining", "despite + noun or -ing (not despite + a full clause): despite the rain."),
  T("It's not worth watching that film.", "POINT", "There's ___ that film.", "no point in watching|no point watching", "It's not worth …ing = There's no point (in) …ing."),
  T("Jack doesn't usually get up early.", "USED", "Jack isn't ___ early.", "used to getting up", "be used to + -ing = be familiar with something: Jack isn't used to getting up early."),
  T("The match was cancelled because of the storm.", "DUE", "The match was cancelled ___ the storm.", "due to", "because of = due to."),
  T("Lucy probably won't come to the party.", "UNLIKELY", "Lucy ___ to the party.", "is unlikely to come", "probably won't = is unlikely to + verb."),
  T("Can you look after my hamster this weekend?", "CARE", "Can you ___ my hamster this weekend?", "take care of", "look after = take care of."),
  T("I didn't expect the test to be so easy.", "EASIER", "The test was ___ expected.", "much easier than I|easier than I|a lot easier than I|far easier than I|easier than I had|much easier than I had", "didn't expect it to be so easy = it was easier than I expected."),
 ]),
]

C1 = [
 B("🏰", "Inversion Tower", "No sooner… · Never have I… · Little did I…", [
  T("As soon as the bell rang, the students rushed out.", "SOONER", "No ___ the students rushed out.", "sooner had the bell rung than", "No sooner had + subject + past participle + than… (inversion after a negative opening)."),
  T("I have never seen such a huge dragon.", "NEVER", "___ such a huge dragon.", "Never have I seen|Never before have I seen", "A negative word at the start → question order: Never have I seen…"),
  T("You must not open this box under any circumstances.", "CIRCUMSTANCES", "Under ___ this box.", "no circumstances must you open|no circumstances should you open|no circumstances are you to open", "Under no circumstances + inversion: Under no circumstances must you open…"),
  T("We only realised the map was upside down when we got lost.", "UNTIL", "It was ___ we realised the map was upside down.", "not until we got lost that", "It was not until … that … stresses the moment something happened."),
  T("Tickets for the concert sold out in minutes because it was so popular.", "SUCH", "It was ___ that tickets sold out in minutes.", "such a popular concert", "such + a + adjective + noun + that…: such a popular concert that…"),
  T("If you hadn't helped me, I would have failed.", "BEEN", "Had ___ help, I would have failed.", "it not been for your", "Had it not been for + noun = if … hadn't been there (inverted third conditional)."),
  T("Mia didn't only paint the mural; she designed it too.", "ONLY", "Not ___ the mural, but she designed it too.", "only did Mia paint", "Not only + inversion (did + subject + verb)…, but … too."),
  T("I didn't realise how late it was.", "LITTLE", "___ how late it was.", "Little did I realise|Little did I realize|Little did I know", "Little did I + verb = I didn't realise at all (formal inversion)."),
 ]),
 B("🪄", "Wizard's Phrases", "has difficulty · put … down to · bound to · came as a surprise", [
  T("Sam finds it hard to concentrate when it's noisy.", "DIFFICULTY", "Sam ___ when it's noisy.", "has difficulty concentrating|has difficulty in concentrating|has great difficulty concentrating|has great difficulty in concentrating", "have difficulty (in) + -ing = find it hard to…"),
  T("The coach said our team's victory was due to hard training.", "PUT", "The coach ___ hard training.", "put our team's victory down to|put our victory down to|put the victory down to|put the team's victory down to", "put something down to = say it was caused by."),
  T("I'm sure the rescue team will find the lost puppy.", "BOUND", "The rescue team ___ the lost puppy.", "is bound to find|are bound to find", "be bound to + verb = be certain to."),
  T("Everyone was surprised when the shy boy won the talent show.", "CAME", "The shy boy's win ___ everyone.", "came as a surprise to|came as a big surprise to|came as a complete surprise to|came as a real surprise to", "come as a surprise to someone = surprise them."),
  T("It's possible that the explorers took the wrong path.", "MAY", "The explorers ___ the wrong path.", "may have taken|may well have taken", "Possibility in the past: may have + past participle."),
  T("Lina almost missed the train.", "NARROWLY", "Lina ___ the train.", "narrowly avoided missing|only narrowly avoided missing|very narrowly avoided missing", "narrowly avoid + -ing = almost do something (but not quite)."),
  T("Nobody expected the robot to work so well.", "EXPECTATIONS", "The robot ___.", "exceeded everyone's expectations|exceeded all expectations|exceeded all our expectations|went beyond everyone's expectations|exceeded everybody's expectations", "exceed expectations = be better than people expected."),
  T("We'd better leave now or we'll miss the fireworks.", "TIME", "It's ___ or we'll miss the fireworks.", "time we left|high time we left|about time we left|time for us to leave", "It's (high/about) time + subject + past simple = we should do it now."),
 ]),
 B("🌌", "Starry Structures", "What… was · It was … who · Having… · However hard…", [
  T("Leo's kindness impressed me most.", "WHAT", "___ was Leo's kindness.", "What impressed me most|What impressed me the most", "A cleft sentence: What + clause + was … puts the focus at the end."),
  T("Although the puzzle was hard, we solved it.", "HOWEVER", "___, we solved it.", "However hard the puzzle was|However hard it was", "However + adjective + subject + verb = it doesn't matter how…"),
  T("Max broke the window, not Ella.", "WHO", "It ___ the window, not Ella.", "was Max who broke", "It was + person + who… stresses who did it."),
  T("Because she had lost her key, Zara climbed in through the window.", "HAVING", "___, Zara climbed in through the window.", "Having lost her key|Having lost her keys", "A perfect participle clause: Having + past participle = because she had…"),
  T("The team trained hard, but they lost the final.", "SPITE", "In ___, the team lost the final.", "spite of training hard|spite of having trained hard|spite of their hard training|spite of all their hard training", "in spite of + -ing / noun = although."),
  T("People think the old lighthouse was built by pirates.", "THOUGHT", "The old lighthouse ___ built by pirates.", "is thought to have been", "People think X was… = X is thought to have been… (perfect infinitive for the past)."),
  T("I'd prefer staying at home to going to the cinema.", "SOONER", "I'd ___ go to the cinema.", "sooner stay at home than|sooner stay home than", "would sooner + verb + than + verb = would prefer."),
  T("It doesn't matter what you say, I'm not eating broccoli ice cream.", "MATTER", "No ___, I'm not eating broccoli ice cream.", "matter what you say", "No matter what… = it doesn't matter what…"),
 ]),
]

C2 = [
 B("📚", "Archivus's Riddles", "Hardly had… · But for… · no option but to · reputed to", [
  T("The knights fled the moment the dragon appeared.", "HARDLY", "___ when the knights fled.", "Hardly had the dragon appeared|Hardly had the dragon arrived", "Hardly had + subject + past participle + when… = as soon as (formal inversion)."),
  T("The new rules had no effect on how long we could play.", "DIFFERENCE", "The new rules ___ to how long we could play.", "made no difference|made absolutely no difference|didn't make any difference|did not make any difference|made no difference at all", "make no difference to = have no effect on."),
  T("She was not at all surprised by the news.", "LEAST", "She was ___ by the news.", "not in the least surprised|not the least bit surprised", "not in the least = not at all."),
  T("Ollie only finished the race because his friends cheered him on.", "FOR", "But ___ cheering him on, Ollie would never have finished the race.", "for his friends", "But for + noun = if it hadn't been for…"),
  T("It is said that the castle has a hidden room.", "REPUTED", "The castle ___ a hidden room.", "is reputed to have", "be reputed to + verb = people say that…"),
  T("Joe is extremely unlikely to win the quiz.", "CHANCE", "There is ___ Joe will win the quiz.", "little chance that|hardly any chance that|very little chance that|not much chance that|almost no chance that|little or no chance that", "extremely unlikely = there is little chance that…"),
  T("The explorers had to turn back because of the storm.", "OPTION", "The storm left the explorers ___ turn back.", "with no option but to|no option but to|with little option but to", "leave someone (with) no option but to = force them to."),
  T("I didn't mean to upset Ava.", "INTENTION", "I ___ upsetting Ava.", "had no intention of|had absolutely no intention of|never had any intention of", "have no intention of + -ing = not mean to."),
 ]),
 B("🎨", "Shades of Meaning", "like a duck to water · spill the beans · in the balance", [
  T("Rosa learned to juggle very quickly and naturally.", "DUCK", "Rosa took to juggling ___.", "like a duck to water", "take to something like a duck to water = learn it easily and naturally."),
  T("Tom told everyone the secret by accident.", "BEANS", "Tom accidentally ___.", "spilled the beans|spilt the beans", "spill the beans = tell a secret."),
  T("The result of the match was very uncertain until the end.", "BALANCE", "The result of the match ___ until the end.", "hung in the balance|was hanging in the balance|remained in the balance", "hang in the balance = be very uncertain."),
  T("Please don't tell anyone about the surprise party.", "WORD", "Please don't ___ about the surprise party.", "breathe a word to anyone|say a word to anyone|breathe a word to anybody|say a word to anybody|breathe a word", "not breathe a word = not tell anyone at all."),
  T("Mia is still learning how to play chess, so be patient.", "HANG", "Mia hasn't ___ chess yet, so be patient.", "got the hang of|quite got the hang of|really got the hang of", "get the hang of something = learn how to do it."),
  T("It was obvious that Kai was nervous.", "NO", "There was ___ Kai was nervous.", "no doubt that|no denying that|no question that|no mistaking that", "There's no doubt / no denying that… = it is clear that…"),
  T("The magician's trick completely amazed the audience.", "BREATH", "The magician's trick ___.", "took the audience's breath away|took everyone's breath away", "take someone's breath away = amaze them."),
  T("Stop worrying so much about the quiz; it's not important.", "MOLEHILL", "Stop ___ — it's only a quiz!", "making a mountain out of a molehill", "make a mountain out of a molehill = treat a small problem as a big one."),
 ]),
 B("🌠", "Grand Wordcraft", "insisted that we arrive · Try as he might · Should you…", [
  T("'You must all arrive on time,' the teacher told us.", "INSISTED", "The teacher ___ on time.", "insisted that we arrive|insisted that we should arrive|insisted on our arriving|insisted on us arriving|insisted we arrive", "insist that + subject + base verb (the subjunctive) or insist on + -ing."),
  T("Zara had no idea at all how to solve the puzzle.", "SLIGHTEST", "Zara hadn't ___ how to solve the puzzle.", "the slightest idea|got the slightest idea", "not have the slightest idea = have no idea at all."),
  T("However hard he tried, Ben couldn't open the jar.", "MIGHT", "___, Ben couldn't open the jar.", "Try as he might", "Try as he might = however hard he tried (literary)."),
  T("People don't appreciate how much bees do for us.", "CREDIT", "Bees ___ for how much they do for us.", "are not given enough credit|aren't given enough credit|don't get enough credit|do not get enough credit|aren't given the credit they deserve", "give someone credit for = recognise what they have done."),
  T("If you need help, press the star button.", "SHOULD", "___ help, press the star button.", "Should you need|Should you require", "Should + subject + verb = if (formal conditional inversion)."),
  T("The team's success depends completely on how well they work together.", "HINGES", "The team's success ___ how well they work together.", "hinges entirely on|hinges completely on|hinges solely on|hinges wholly on|hinges entirely upon", "hinge on = depend completely on."),
  T("Only when the storm stopped did we leave the cave.", "UNTIL", "We ___ the storm had stopped.", "did not leave the cave until|didn't leave the cave until|stayed in the cave until|remained in the cave until", "Only when… did we… = We didn't … until…"),
  T("Ellie's idea was so clever that everyone was amazed.", "SUCH", "___ that everyone was amazed.", "Such was the cleverness of Ellie's idea|Such was the brilliance of Ellie's idea", "Such was + noun + that… is a formal way to stress how great something was."),
 ]),
]

SWAP = {"a1": A1, "a2": A2, "b1": B1, "b2": B2, "c1": C1, "c2": C2}
# answer rules per level: mode (tiles/type), word range (contractions = 2 words), key word used?
RULES = {"a1": ("tiles", 1, 3, False), "a2": ("tiles", 1, 6, False), "b1": ("type", 1, 3, False),
         "b2": ("type", 2, 5, True), "c1": ("type", 3, 6, True), "c2": ("type", 3, 8, True)}
