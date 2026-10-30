# C2 (review 2026-10-30): new question types, merged into the banks by build_data.py.
#   spell   – picture (art id) or clue, build the word from letter tiles          {type, q, art?|clue, answer, explain}
#   picq    – A1 picture choice: four painted pictures, tap the one that matches   {type, q, options:[word…], answer, explain}  (art = word_<option>)
#   order   – sentence builder (now at every level); with "say" it is listen-and-order
#   mistake – tap the one wrong word                                               {type, q, words:[…], wrong, fix, explain}
#   gaps    – multi-gap word bank                                                  {type, q, text with ___, answers:[…], bank:[…], explain}
#   dictate – listen and type                                                      {type, say, q, answer, explain}
#   listen  – dialogues: say = "Name: line|Name: line" (two voices)
SP = "Spell the word."
OR = "Build the sentence."
LO = "Listen, then build the sentence you heard."
MI = "Tap the word that is wrong."
GA = "Fill the gaps with the words."
DI = "Listen and type what you hear."
def spell(art, w, ex): return {"type": "spell", "q": SP, "art": "word_" + art, "answer": w, "explain": ex}
def clue(c, w, ex): return {"type": "spell", "q": "Spell the word: " + c, "answer": w, "explain": ex}
def picq(q, opts, ex): return {"type": "picq", "q": q, "options": opts, "answer": 0, "explain": ex}
def order(a, ex, q=OR): return {"type": "order", "q": q, "answer": a, "explain": ex}
def lorder(a, ex): return {"type": "order", "q": LO, "say": a, "answer": a, "explain": ex}
def mist(s, wrong, fix, ex): return {"type": "mistake", "q": MI, "words": s.split(" "), "wrong": wrong, "fix": fix, "explain": ex}
def gaps(t, ans, extra, ex): return {"type": "gaps", "q": GA, "text": t, "answers": ans, "bank": ans + extra, "explain": ex}
def dict_(s, ex): return {"type": "dictate", "q": DI, "say": s, "answer": s, "explain": ex}
def dlg(lines, q, opts, ex): return {"type": "listen", "say": "|".join(lines), "q": q, "options": opts, "answer": 0, "explain": ex, "dialogue": True}

C2T = {
"a1": {
 "grammar": [
  order("I have a red bike.", "Who + verb + what: I have a red bike."),
  order("She is my best friend.", "She + is + who she is."),
  order("We play in the park.", "We + play + where."),
  order("The cat is under the table.", "Thing + is + where it is."),
  order("Do you like ice cream?", "Questions start with Do: Do you like…?"),
  order("He can swim very well.", "can + verb: He can swim."),
  mist("She have a cat.", 1, "has", "With he/she/it we say has: She has a cat."),
  mist("I is seven years old.", 1, "am", "With I we say am: I am seven."),
  mist("They is my friends.", 1, "are", "With they/we/you we say are: They are my friends."),
  mist("He like pizza.", 1, "likes", "With he/she/it add -s: He likes pizza."),
  mist("I have two cat.", 3, "cats.", "More than one: add -s. One cat, two cats."),
  mist("This is an dog.", 2, "a", "Use an before a, e, i, o, u sounds; dog starts with d, so a dog."),
  gaps("I ___ a sister. She ___ six.", ["have", "is"], ["has", "am"], "I have; she is."),
  gaps("There ___ a dog. It ___ a long tail.", ["is", "has"], ["are", "have"], "There is one dog; it has a tail."),
  gaps("We ___ to school ___ bus.", ["go", "by"], ["goes", "in"], "We go (no -s); travel by bus."),
  gaps("My mum ___ tea ___ the morning.", ["drinks", "in"], ["drink", "on"], "She drinks (+s); in the morning."),
 ],
 "vocab": [
  spell("apple", "apple", "a-p-p-l-e: two p's."), spell("dog", "dog", "d-o-g."), spell("house", "house", "h-o-u-s-e: ends with a silent e."),
  spell("sun", "sun", "s-u-n."), spell("bike", "bike", "b-i-k-e: the e at the end makes the i say its name."),
  spell("fish", "fish", "sh makes one sound: f-i-sh."), spell("cake", "cake", "c-a-k-e: silent e at the end."),
  spell("cat", "cat", "c-a-t."), spell("bed", "bed", "b-e-d."), spell("ball", "ball", "b-a-l-l: two l's."),
  spell("clock", "clock", "ck together at the end: c-l-o-c-k."), spell("boat", "boat", "oa says 'oh': b-oa-t."),
  picq("Which one is a cat?", ["cat", "dog", "rabbit", "fish"], "A cat says 'meow'."),
  picq("You sleep in it. Which one?", ["bed", "house", "boat", "clock"], "You sleep in a bed."),
  picq("It tells the time. Which one?", ["clock", "sun", "ball", "umbrella"], "A clock tells the time."),
  picq("You wear it on your foot. Which one?", ["shoe", "umbrella", "bike", "bread"], "A shoe goes on your foot."),
  picq("It swims in water. Which one?", ["fish", "dog", "cat", "rabbit"], "A fish swims."),
  picq("You ride it to school. Which one?", ["bike", "bed", "boat", "house"], "You ride a bike."),
  picq("You use it in the rain. Which one?", ["umbrella", "shoe", "clock", "apple"], "An umbrella keeps you dry."),
  picq("It says 'woof'. Which one?", ["dog", "cat", "fish", "rabbit"], "A dog says 'woof'."),
  picq("It has candles for a birthday. Which one?", ["cake", "bread", "apple", "flower"], "A birthday cake has candles."),
  picq("It floats on the sea. Which one?", ["boat", "bike", "ball", "bed"], "A boat floats."),
  picq("It is red and small, with seeds on it. Which one?", ["strawberry", "apple", "flower", "cake"], "A strawberry has seeds on the outside."),
  picq("It is in the sky in the day. Which one?", ["sun", "flower", "ball", "clock"], "The sun is in the sky in the day."),
 ],
 "listening": [
  lorder("I like red apples.", "I + like + what."), lorder("My dog is very big.", "My dog + is + very big."),
  lorder("We go to the park on Sunday.", "We go + where + when."), lorder("Can you see the boat?", "Can you + verb…?"),
  dict_("I have a cat.", "I have a cat."), dict_("The sun is hot.", "The sun is hot."),
  dict_("She likes cake.", "She likes cake: likes with -s."), dict_("My bike is blue.", "My bike is blue."),
  dlg(["Mia: Is this your bag, Tom?", "Tom: No, my bag is blue. That one is red."], "What colour is Tom's bag?", ["blue", "red", "green", "pink"], "Tom: 'My bag is blue.' The red one isn't his."),
  dlg(["Ben: How old is your brother?", "Lily: He's eight. I'm ten."], "How old is Lily's brother?", ["eight", "ten", "six", "nine"], "'He's eight.' Lily is ten."),
  dlg(["Sam: Do you want an apple?", "Zoe: No, thank you. Can I have a banana?"], "What does Zoe want?", ["a banana", "an apple", "a cake", "some milk"], "She says no to the apple and asks for a banana."),
  dlg(["Mum: Where is the cat?", "Leo: She's under the bed!"], "Where is the cat?", ["under the bed", "on the bed", "in the garden", "on the table"], "'She's under the bed.'"),
 ],
},
"a2": {
 "grammar": [
  mist("Yesterday I go to the zoo.", 2, "went", "Yesterday = past: go → went."),
  mist("She don't like spiders.", 1, "doesn't", "He/she/it: doesn't. She doesn't like spiders."),
  mist("My sister is tall than me.", 3, "taller", "Comparing two people: short adjectives add -er + than: taller than."),
  mist("There are much books on the shelf.", 2, "many", "Many for things you can count: many books."),
  mist("We was at the beach last summer.", 1, "were", "We/you/they + were."),
  mist("I am going to visiting my grandma.", 4, "visit", "going to + verb (no -ing): going to visit."),
  gaps("Last weekend we ___ a film and ___ popcorn.", ["watched", "ate"], ["watch", "eat"], "Last weekend = past: watched, ate."),
  gaps("Is ___ any milk? There isn't ___ juice.", ["there", "any"], ["their", "some"], "Is there any…? / There isn't any…"),
  gaps("She's ___ than her brother but not as ___ as her dad.", ["taller", "tall"], ["tallest", "more tall"], "taller than; as tall as."),
  gaps("I ___ my homework ___ dinner.", ["do", "after"], ["make", "during"], "We do homework; after dinner."),
 ],
 "vocab": [
  clue("a place where you borrow books", "library", "li-brar-y: library."), clue("the day after Monday", "tuesday", "Tuesday (u-e-s)."),
  clue("you wear them on your eyes to see better", "glasses", "glasses: double s."), clue("a doctor for animals", "vet", "vet."),
  clue("the opposite of 'cheap'", "expensive", "ex-pen-sive."), clue("the meal in the middle of the day", "lunch", "lunch."),
  clue("a very big, grey animal with a long nose", "elephant", "el-e-phant: ph says f."), clue("the season after spring", "summer", "summer: double m."),
 ],
 "listening": [
  lorder("We are going to the beach tomorrow.", "be going to + verb + place + time."), lorder("She didn't finish her homework.", "didn't + verb."),
  lorder("How many brothers have you got?", "How many + plural + have you got?"),
  dict_("I usually walk to school.", "usually goes before the verb."), dict_("They went to the cinema last night.", "went = past of go."),
  dict_("Can I have some water, please?", "Can I have…, please?"),
  dlg(["Anna: Shall we meet at four?", "Jack: I can't, I've got football. How about half past five?", "Anna: OK, half past five."], "When will they meet?", ["at half past five", "at four o'clock", "at five o'clock", "at half past four"], "Four doesn't work; they agree on half past five."),
  dlg(["Shop: That's six pounds for the cake.", "Girl: And two pounds for the juice?", "Shop: Yes, so eight pounds altogether."], "How much does she pay?", ["£8", "£6", "£2", "£10"], "Six + two = eight pounds."),
  dlg(["Tom: I want the red T-shirt.", "Dad: The red one is too small. Try the green one.", "Tom: OK, I'll take the green one."], "Which T-shirt does Tom take?", ["the green one", "the red one", "a blue one", "both of them"], "He changes his mind: 'I'll take the green one.'"),
  dlg(["Nina: Is your birthday in May?", "Omar: No, it's in June. My sister's is in May."], "When is Omar's birthday?", ["in June", "in May", "in July", "in March"], "'It's in June.' May is his sister's."),
 ],
},
"b1": {
 "grammar": [
  order("I have been learning English for three years.", "have been + -ing + for + time."),
  order("If it rains, we will stay at home.", "If + present, will + verb."),
  order("The book was written by a famous author.", "Passive: was + past participle + by."),
  order("She asked me where I lived.", "Reported question: no question order."),
  order("We used to play in the garden.", "used to + verb for past habits."),
  mist("I've lived here since three years.", 3, "for", "for + a length of time (three years); since + a starting point (since 2020)."),
  mist("My brother is good in maths.", 4, "at", "good at + a subject or activity."),
  mist("He's interested on robots.", 2, "in", "interested in."),
  mist("She told that she was tired.", 1, "said", "say that / tell someone that."),
  mist("I'm looking forward to see you.", 4, "seeing", "look forward to + -ing."),
  mist("This is the girl which won the race.", 4, "who", "who for people."),
  gaps("I've lived here ___ 2020 and I've known Sam ___ ten years.", ["since", "for"], ["from", "during"], "since + a point in time; for + a length of time."),
  gaps("The test was ___ easy that everyone finished ___ early.", ["so", "very"], ["such", "too"], "so + adjective + that; very early."),
  gaps("You ___ wear a helmet; it's the rule. You ___ bring a snack; it's up to you.", ["must", "can"], ["mustn't", "should to"], "must = rule; can = it's allowed."),
  gaps("While I ___ walking home, I ___ a puppy.", ["was", "found"], ["were", "find"], "Past continuous for the background, past simple for the event."),
 ],
 "listening": [
  lorder("I've never been on a plane before.", "have never + past participle."), lorder("Could you tell me where the station is?", "Polite question: no inversion after where."),
  lorder("The match was cancelled because of the snow.", "because of + noun."),
  dict_("We're meeting outside the museum at ten.", "Present continuous for an arranged plan."),
  dict_("I'd rather stay in than go to the party.", "would rather + verb + than."), dict_("She's been practising the piano all morning.", "has been + -ing."),
  dlg(["Kai: Let's take the bus to the aquarium.", "Rosa: The bus takes an hour. The train's only twenty minutes.", "Kai: Fine, the train then."], "How will they go?", ["by train", "by bus", "on foot", "by car"], "Kai changes his mind: 'the train then'."),
  dlg(["Coach: Practice is usually on Tuesday, but this week it's on Thursday.", "Player: Same time?", "Coach: No, half an hour later, at five."], "When is practice this week?", ["Thursday at five", "Tuesday at five", "Thursday at half past four", "Tuesday at half past four"], "Moved to Thursday, and half an hour later: five."),
  dlg(["Ella: Did you like the film?", "Finn: Honestly, it wasn't my cup of tea. The ending was great, though."], "What did Finn think of the film?", ["He mostly didn't enjoy it.", "He loved all of it.", "He fell asleep.", "He didn't see the ending."], "'Not my cup of tea' = he didn't really like it, though he liked the ending."),
  dlg(["Mum: The tickets are twelve pounds each. There are three of us.", "Dad: And we've got a five-pound discount voucher."], "How much will they pay?", ["£31", "£36", "£41", "£12"], "3 × £12 = £36, minus £5 = £31."),
  dlg(["Jo: Can you help me with my science project tonight?", "Ali: I'd love to, but I promised my gran I'd visit her. Tomorrow?"], "What does Ali mean?", ["He can help tomorrow, not tonight.", "He doesn't want to help at all.", "He will help tonight at his gran's.", "He has already finished the project."], "'I'd love to, but…' = a polite no for tonight; he offers tomorrow."),
 ],
},
"b2": {
 "grammar": [
  order("If I had known, I would have helped you.", "Third conditional: If + had + pp, would have + pp."),
  order("By the time we arrived, the show had started.", "Past perfect for the earlier action."),
  order("She suggested that we take a different path.", "suggest that + plain verb."),
  order("Not only is he funny, but he is also kind.", "Not only + inversion."),
  order("The bridge is being repaired at the moment.", "Present continuous passive: is being + pp."),
  mist("The news are very exciting.", 2, "is", "News is uncountable and takes a singular verb: The news is…"),
  mist("Despite of the rain, we went hiking.", 1, "(no 'of')", "Despite has no 'of' (in spite of does)."),
  mist("Everyone were waiting for the results.", 1, "was", "Everyone is singular: Everyone was…"),
  mist("She's used to get up early for swimming.", 3, "getting", "be used to + -ing."),
  mist("If I was you, I'd apologise.", 2, "were", "Advice: If I were you."),
  mist("The number of students have grown.", 4, "has", "The number (singular) has grown."),
  gaps("I'd rather you ___ my diary. It's ___ for me to share.", ["didn't read", "too personal"], ["don't read", "so personal"], "would rather + past for another person; too + adjective + for."),
  gaps("He must ___ forgotten; he's ___ late.", ["have", "never"], ["has", "ever"], "must have + pp for a deduction about the past."),
  gaps("No sooner ___ we sat down ___ the bell rang.", ["had", "than"], ["have", "when"], "No sooner had… than."),
  gaps("The experiment, ___ took weeks, was finally a success ___ all the problems.", ["which", "despite"], ["that", "although"], "Non-defining clause uses which; despite + noun."),
 ],
 "listening": [
  lorder("I wish I had brought my umbrella.", "wish + past perfect for a past regret."), lorder("Had we left earlier, we wouldn't have missed it.", "Inverted third conditional."),
  dict_("The museum is closed for renovation until further notice.", "until further notice = until they tell us."),
  dict_("Hardly anyone noticed that the clock had stopped.", "Hardly anyone = almost nobody."),
  dlg(["Lena: The volcano tour leaves at eight, right?", "Guide: It used to. Since the new timetable, it's an hour and a half later."], "When does the tour leave now?", ["at half past nine", "at eight", "at half past eight", "at nine"], "8:00 + 1½ hours = 9:30."),
  dlg(["Max: So are you joining the robotics club or the drama club?", "Ivy: I was set on drama, but after the robotics demo I've had second thoughts. Robotics it is."], "Which club will Ivy join?", ["robotics", "drama", "both", "neither"], "'Second thoughts… Robotics it is.'"),
  dlg(["Teacher: Your essay is good, but it reads like a list.", "Student: So I should add more examples?", "Teacher: Not more; connect the ones you have."], "What does the teacher want?", ["better links between the ideas", "more examples", "a shorter essay", "a new topic"], "'Not more; connect the ones you have.'"),
  dlg(["Sara: The concert sold out in minutes!", "Dev: Well, I'm not exactly heartbroken. I'm not a big fan anyway."], "How does Dev feel?", ["He doesn't really mind.", "He is very upset.", "He is angry with Sara.", "He wants to buy tickets."], "'Not exactly heartbroken' = he doesn't mind."),
  dlg(["Ranger: Visitors may feed the ducks, but only with the seed sold at the gate.", "Boy: Not bread?", "Ranger: Bread makes them ill."], "What is the rule?", ["Only use the seed from the gate.", "Don't feed the ducks at all.", "Bread is fine in small amounts.", "Bring your own seed."], "Only the gate's seed; bread makes them ill."),
 ],
},
"c1": {
 "grammar": [
  order("Little did they know that the map was a fake.", "Little + did + subject + verb."),
  order("Were it not for the rain, we would be outside.", "Were it not for = if it weren't for."),
  order("What surprised me most was how calm she stayed.", "What-clause + was + the focus."),
  order("Only after the storm passed did we leave the cave.", "Only after… + inversion."),
  order("She is said to have trained with the champion.", "is said to have + pp."),
  mist("Hardly had we arrived than it started to rain.", 4, "when", "Hardly had… when (No sooner had… than)."),
  mist("It's high time we leave for the station.", 4, "left", "It's high time + past simple."),
  mist("Never have I saw such a bright comet.", 3, "seen", "have + past participle: have I seen."),
  mist("The team, which coach is ill, will play tomorrow.", 2, "whose", "whose shows possession: the team whose coach…"),
  mist("Despite she was tired, she kept running.", 0, "Although", "Despite + noun/-ing; Although + a clause (she was tired)."),
  mist("Should you will need help, ask a librarian.", 2, "(no 'will')", "Should + subject + plain verb: Should you need help…"),
  gaps("___ as it may sound, the robot ___ learned to dance.", ["Strange", "actually"], ["Strangely", "actual"], "Adjective + as + it may sound; actually = in fact."),
  gaps("Rarely ___ we seen such a bright comet, ___ the experts say.", ["have", "or so"], ["had", "as so"], "Rarely + inversion; 'or so the experts say'."),
  gaps("Had I ___ the instructions, I ___ have broken it.", ["read", "wouldn't"], ["reading", "won't"], "Had + pp, wouldn't have + pp."),
  gaps("So ___ was the puzzle that nobody solved it ___ the end of term.", ["tricky", "before"], ["trickily", "until"], "So + adjective + was…; before the end."),
 ],
 "listening": [
  lorder("Not once did the referee look our way.", "Not once + inversion."),
  dict_("Were the volcano to erupt, the village would be evacuated at once.", "Were + subject + to + verb (formal 'if')."),
  dict_("Much as I'd love to come, I've got a dentist appointment.", "Much as = although."),
  dlg(["Zara: I thought the museum trip was on Friday.", "Teacher: It was, but the coach company let us down, so we've pushed it back a week."], "When is the trip now?", ["the Friday after", "this Friday", "next Monday", "it's cancelled"], "'Pushed it back a week' = one week later."),
  dlg(["Theo: Your speech was brilliant.", "Ana: You're just saying that.", "Theo: Honestly, I'm not one to hand out compliments lightly."], "What does Theo mean?", ["He really means the praise.", "He was joking.", "He rarely listens to speeches.", "He thinks the speech was too long."], "'Not one to hand out compliments lightly' = he means it."),
  dlg(["Girl: The app said it would take twenty minutes.", "Dad: That was before the bridge closed. Add another quarter of an hour at least."], "How long will the journey take?", ["at least 35 minutes", "20 minutes", "15 minutes", "45 minutes exactly"], "20 + 15 = at least 35 minutes."),
  dlg(["Ivo: Shall we try the new climbing wall?", "Mei: I'm game, as long as we book an instructor first."], "What is Mei's position?", ["Yes, but only with an instructor.", "No, it's too dangerous.", "Yes, without any help.", "She wants to play a game instead."], "'I'm game' = I'm willing; 'as long as' = on condition."),
  dlg(["Coach: We're two goals down, but it's far from over.", "Captain: Right, let's keep our heads and play our game."], "How does the coach feel?", ["The match can still be won.", "The match is lost.", "The team should give up.", "The captain should be replaced."], "'Far from over' = there's still a chance."),
 ],
},
"c2": {
 "grammar": [
  order("Under no circumstances should the dragon be woken.", "Under no circumstances + should + subject."),
  order("Try as he might, he could not open the door.", "Try as he might = however hard he tried."),
  order("So vast was the library that we got lost.", "So + adjective + was + subject + that."),
  order("Be that as it may, the quest must go on.", "Be that as it may = even so."),
  order("Not a single page had the apprentice skipped.", "Negative object + inversion."),
  mist("Scarcely had the candle gone out than the whispers began.", 6, "when", "Scarcely had… when (No sooner had… than)."),
  mist("Such was the noise that we couldn't hear nothing.", 8, "anything", "No double negatives: couldn't hear anything."),
  mist("The more you read, the most you understand.", 5, "more", "The + comparative…, the + comparative: the more…, the more…"),
  mist("Far for being scared, the dragon laughed.", 1, "from", "Far from + -ing = not at all."),
  mist("It is imperative that every scroll is returned by dawn.", 6, "be", "imperative that + subjunctive be."),
  mist("Come what might, the library stays open.", 2, "may", "Fixed phrase: come what may."),
  gaps("___ though it was, the riddle had a ___ simple answer.", ["Baffling", "deceptively"], ["Baffled", "deceptive"], "Adjective + though + it was; adverb before an adjective."),
  gaps("Only by reading ___ the lines ___ one grasp the poem.", ["between", "can"], ["among", "may"], "read between the lines; Only by… can one…"),
  gaps("Not that I ___, but the ___ was yesterday.", ["mind", "deadline"], ["minded", "headline"], "Not that I mind (fixed); deadline = last day."),
  gaps("The dragon, far ___ hostile, served tea ___ any sign of anger.", ["from", "without"], ["off", "beyond"], "far from (not at all); without any sign."),
 ],
 "listening": [
  lorder("Never before had the scholars seen such a manuscript.", "Never before + had + subject + pp."),
  dict_("Little did the apprentice suspect that the index was unfinished.", "Little did + subject + verb."),
  dict_("Be that as it may, the prophecy remains ambiguous.", "Be that as it may = even so."),
  dlg(["Apprentice: So the dragon agreed to lend us the map?", "Librarian: In a manner of speaking. He agreed not to eat anyone who borrowed it."], "What does the librarian suggest?", ["The dragon's agreement is not quite a real yes.", "The dragon happily lent the map.", "The dragon ate the map.", "The map was never real."], "'In a manner of speaking' = not exactly."),
  dlg(["Scholar: The second translation is, shall we say, rather liberal.", "Apprentice: You mean it's inaccurate?", "Scholar: I mean it takes great freedoms."], "What does the scholar think of the translation?", ["It doesn't follow the original closely.", "It is perfectly accurate.", "It was written by a politician.", "It is too short."], "'Liberal' / 'takes great freedoms' = not close to the original."),
  dlg(["Mira: We were meant to finish the index by midnight.", "Oren: Were meant to. Then the shelves rearranged themselves, so now it's dawn at the earliest."], "When will they finish?", ["no earlier than dawn", "by midnight", "before midnight", "they already finished"], "'At the earliest' = not before dawn."),
  dlg(["Guide: Visitors may touch the scrolls, provided they wear gloves.", "Boy: And if I'm careful?", "Guide: Careful is not gloves."], "What is the rule?", ["Gloves are required to touch the scrolls.", "Careful visitors can touch without gloves.", "Nobody may touch the scrolls.", "Gloves are optional."], "'Provided they wear gloves' = only with gloves."),
  dlg(["Ada: I hear the dragon's riddle is fiendishly hard.", "Kit: Hard? It's a doddle once you see the trick."], "What does Kit think of the riddle?", ["It's easy once you know the trick.", "It's impossible.", "It's dangerous.", "It's boring."], "'A doddle' = very easy."),
 ],
},
}
