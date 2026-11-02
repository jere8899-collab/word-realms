"""🔗 Join It Up — Synthesis & Transformation for the 🦁 Singapore levels (PSLE English Paper 2 Booklet B style).
One sentence, same meaning, using the given word(s). Each row:
  S(s1, s2, lead, answers, tip, need=None, tail="", q=None)
  s1/s2  the given sentence(s) (s2 may be "" for a one-sentence transformation)
  lead   the words already printed on the answer line (the child types the rest); tail = words printed after the box
  answers  every accepted way to finish the line (the first is the model); marking ignores capitals, punctuation and
           contractions (don't = do not), like canon() in js/sg-english.js
  need   word(s) the answer must use (a missing one is a friendly nudge, not a try)
  tip    the rule, in child words, shown after every answer
British / Singapore spelling, kid topics (school, hawker centre, MRT, void deck, CCA, festivals)."""
def S(s1, s2, lead, answers, tip, need=None, tail="", q=None):
    if isinstance(answers, str): answers = [answers]
    return dict(s1=s1, s2=s2, lead=lead, tail=tail, answers=answers, need=need or [], tip=tip, q=q)

SYNTH = {
 "p2": [
  S("Mei Ling has a red bag.", "Mei Ling has a blue pencil case.", "Mei Ling has a red bag", ["and a blue pencil case"], "Use 'and' to join two things that go together.", ["and"]),
  S("I wanted to play outside.", "It was raining.", "I wanted to play outside", ["but it was raining"], "Use 'but' when the second part is a surprise or a problem.", ["but"]),
  S("Ali was hungry.", "He ate a big bowl of noodles.", "Ali was hungry", ["so he ate a big bowl of noodles"], "Use 'so' to show what happened next because of the first part.", ["so"]),
  S("Priya smiled.", "She got a sticker from her teacher.", "Priya smiled", ["because she got a sticker from her teacher"], "Use 'because' to give the reason. The reason comes after 'because'.", ["because"]),
  S("Ben can swim.", "Ben can ride a bicycle.", "Ben can", ["swim and ride a bicycle", "swim and he can ride a bicycle"], "When the same person does both things, say his name once and join the actions with 'and'.", ["and"]),
  S("The kitten is small.", "The kitten is fluffy.", "The kitten is", ["small and fluffy"], "Two describing words about the same thing can be joined with 'and'.", ["and"]),
  S("We went to the playground.", "We did not go to the library.", "We went to the playground", ["but not to the library", "but we did not go to the library", "but we didn't go to the library"], "'But' joins a 'yes' part and a 'no' part.", ["but"]),
  S("The bus came late.", "We were late for school.", "The bus came late", ["so we were late for school"], "'So' tells us the result.", ["so"]),
  S("Grandma was happy.", "We visited her on Chinese New Year.", "Grandma was happy", ["because we visited her on chinese new year"], "'Because' gives the reason why Grandma was happy.", ["because"]),
  S("Do you want an apple?", "Do you want a banana?", "Do you want an apple", ["or a banana"], "Use 'or' when there is a choice.", ["or"]),
 ],
 "p3": [
  S("I have a friend.", "My friend can play the piano.", "I have a friend", ["who can play the piano"], "Use 'who' for a person. 'Who' takes the place of 'my friend'.", ["who"]),
  S("Dad bought a kite.", "The kite has a long tail.", "Dad bought a kite", ["which has a long tail"], "Use 'which' for a thing. It takes the place of 'the kite'.", ["which"]),
  S("Siti was tired.", "She finished her homework.", "Although Siti was tired,", ["she finished her homework"], "'Although' shows a surprise: she was tired, yet she still finished. Don't add 'but' after 'although'.", tail=""),
  S("The boy fell down.", "He did not cry.", "Although the boy fell down,", ["he did not cry", "he didn't cry"], "Use 'although' OR 'but', never both in one sentence."),
  S("It was very hot.", "We stayed indoors.", "As it was very hot,", ["we stayed indoors"], "'As' can mean 'because'. The reason comes first here."),
  S("Mum cooked dinner.", "Dad washed the dishes.", "While Mum cooked dinner,", ["dad washed the dishes"], "'While' shows two things happening at the same time."),
  S("Jun Wei finished his lunch.", "He went out to play.", "After Jun Wei finished his lunch,", ["he went out to play"], "'After' shows which action came first."),
  S("You must wear a helmet.", "You ride your scooter.", "You must wear a helmet", ["when you ride your scooter"], "'When' tells us the time something happens.", ["when"]),
  S("The cat chased the mouse.", "", "The mouse", ["was chased by the cat"], "Passive voice: the mouse comes first, then 'was' + chased + 'by the cat'.", ["by"], q="Rewrite the sentence starting with the words given."),
  S("Tom is tall.", "Sam is taller.", "Sam is", ["taller than tom"], "Use '-er … than' to compare two people.", ["than"]),
  S("Our class planted seeds.", "The seeds grew into sunflowers.", "The seeds", ["which our class planted grew into sunflowers", "that our class planted grew into sunflowers", "our class planted grew into sunflowers"], "Put 'which our class planted' right after 'the seeds', then finish the sentence.", ["grew"]),
  S("Hui Min likes to draw.", "Hui Min likes to sing.", "Hui Min likes", ["both drawing and singing", "both to draw and to sing", "to both draw and sing", "both to draw and sing"], "'Both … and' joins two things she likes. Keep the two parts the same shape.", ["both", "and"]),
 ],
 "p4": [
  S("The box was very heavy.", "Ravi could not lift it.", "The box was too", ["heavy for ravi to lift"], "too + adjective + for someone + to + verb. Don't add 'it' at the end: 'too heavy for Ravi to lift'.", ["too"]),
  S("The soup was very hot.", "I could not drink it.", "The soup was so hot", ["that i could not drink it", "that i couldn't drink it"], "so + adjective + that + result. With 'so … that' you DO need 'it'.", ["that"]),
  S("Ahmad is tall.", "He can reach the top shelf.", "Ahmad is tall enough", ["to reach the top shelf"], "adjective + enough + to + verb.", ["enough"]),
  S("You will be late.", "You must hurry.", "Unless you hurry,", ["you will be late"], "'Unless' means 'if … not'. Unless you hurry = if you do not hurry. Don't write 'unless you don't'."),
  S("Mrs Tan did not come.", "Mr Lee did not come.", "Neither Mrs Tan", ["nor mr lee came"], "Neither … nor already means 'not'. Use a positive verb: 'came', not 'did not come'.", ["nor"]),
  S("You can have the chicken rice.", "You can have the noodles.", "You can have either", ["the chicken rice or the noodles"], "'Either … or' gives a choice of two.", ["or"]),
  S("Wei Jie plays the violin.", "He also sings in the choir.", "Not only does Wei Jie", ["play the violin but he also sings in the choir", "play the violin but also sings in the choir", "play the violin but also sing in the choir"], "After 'Not only does …' the verb has no -s: 'play'. Then add 'but also'.", ["but", "also"]),
  S("The children were noisy.", "The teacher could not hear the bell.", "The children were so noisy", ["that the teacher could not hear the bell", "that the teacher couldn't hear the bell"], "so + adjective + that + result."),
  S("\"I am hungry,\" said Lina.", "", "Lina said that", ["she was hungry"], "Reported speech: 'I am' becomes 'she was'. The tense moves one step back.", q="Rewrite the sentence starting with the words given."),
  S("The lady won a prize.", "Her cake was the prettiest.", "The lady", ["whose cake was the prettiest won a prize"], "'Whose' shows that something belongs to a person: her cake → whose cake.", ["whose"]),
  S("We went for a picnic.", "It was a rainy day.", "In spite of", ["the rainy day we went for a picnic", "the rain we went for a picnic"], "'In spite of' + a noun (the rainy day). No 'it was' after it.", q="Join the sentences starting with the words given."),
  S("Kumar cleaned his room.", "He went to the playground.", "Before going to the playground,", ["kumar cleaned his room"], "'Before' + -ing: the person doing both actions must come straight after the comma."),
 ],
 "p5": [
  S("The concert was cancelled.", "The singer was ill.", "The concert was cancelled", ["due to the singer's illness", "due to the illness of the singer"], "'Due to' + a noun: 'ill' becomes 'illness'.", ["due to"]),
  S("Clara practised every day.", "She still did not win the race.", "Despite", ["practising every day clara still did not win the race", "practising every day clara did not win the race", "her practising every day clara did not win the race"], "'Despite' + -ing or a noun. Never 'despite of', and don't add 'although'."),
  S("The girl is my cousin.", "I waved to the girl.", "The girl", ["whom i waved to is my cousin", "to whom i waved is my cousin", "who i waved to is my cousin", "i waved to is my cousin"], "'Whom' is for the person receiving the action (I waved to her → whom I waved to).", ["is my cousin"]),
  S("The guests arrived.", "The party began immediately.", "As soon as", ["the guests arrived the party began", "the guests arrived the party began immediately"], "'As soon as' already means 'immediately', so you may drop it."),
  S("We had just sat down for dinner.", "The doorbell rang.", "No sooner had we sat down for dinner", ["than the doorbell rang"], "No sooner had + past participle … than … . Use 'than', not 'when'.", ["than"]),
  S("Someone stole my bicycle last night.", "", "My bicycle", ["was stolen last night"], "Passive voice: was + stolen. 'By someone' is not needed."),
  S("\"Will you help me with my project?\" Sarah asked Jun.", "", "Sarah asked Jun", ["if he would help her with her project", "whether he would help her with her project"], "Reported question: use 'if' or 'whether', 'will' becomes 'would', and no question mark.", ["would"]),
  S("\"Don't run along the corridor,\" the prefect told us.", "", "The prefect told us", ["not to run along the corridor"], "A reported order: 'Don't run' becomes 'not to run'."),
  S("You can join the swimming CCA.", "You must pass the swimming test.", "You can join the swimming CCA", ["provided that you pass the swimming test", "provided you pass the swimming test"], "'Provided (that)' means 'only if'.", ["provided"]),
  S("Ming did not take the bus.", "He walked to the library.", "Instead of", ["taking the bus ming walked to the library"], "'Instead of' + -ing: taking."),
  S("The hawker stall was crowded.", "We waited patiently for our food.", "Although the hawker stall was crowded,", ["we waited patiently for our food"], "One joining word is enough: 'although' without 'but'."),
  S("My brother is better at chess than I am.", "", "I am not", ["as good at chess as my brother", "as good at chess as my brother is"], "'not as … as' compares two people. Use 'good', not 'better', inside 'as … as'.", ["as"]),
  S("The school hall was decorated.", "The pupils decorated it for Racial Harmony Day.", "The school hall", ["was decorated by the pupils for racial harmony day"], "Passive voice: was + decorated + by the pupils."),
  S("Nurul read the book.", "She then wrote a review of it.", "Having", ["read the book nurul wrote a review of it", "read the book nurul then wrote a review of it"], "'Having' + past participle shows the first action is finished. The doer (Nurul) comes right after the comma."),
 ],
 "p6": [
  S("\"I will visit the museum tomorrow,\" said Daniel.", "", "Daniel said that", ["he would visit the museum the next day", "he would visit the museum the following day"], "Reported speech: will → would, tomorrow → the next day (or the following day)."),
  S("\"Where did you buy your new shoes?\" Aunt May asked me.", "", "Aunt May asked me where", ["i had bought my new shoes"], "Reported question: no 'did', normal word order, past → past perfect (had bought), your → my."),
  S("The firemen put out the fire quickly.", "", "The fire", ["was put out quickly by the firemen", "was quickly put out by the firemen", "was put out by the firemen quickly"], "Passive voice: was + put out + by the firemen."),
  S("I did not know the answer.", "I could not help my sister.", "Had I known the answer,", ["i could have helped my sister", "i would have helped my sister"], "Had + I + known = If I had known. The result uses 'could have' or 'would have' + past participle."),
  S("Mr Lim is a kind man.", "Everyone respects him.", "Mr Lim is such", ["a kind man that everyone respects him"], "such + a + adjective + noun + that … .", ["that"]),
  S("He had just reached home.", "It started to pour.", "Hardly had he reached home", ["when it started to pour"], "'Hardly had … when'. Not 'than': that goes with 'no sooner'.", ["when"]),
  S("She did not only tidy her room.", "She also swept the floor.", "Not only did she", ["tidy her room but she also swept the floor", "tidy her room but also swept the floor", "tidy her room but also sweep the floor"], "After 'Not only did she', use the base verb 'tidy'."),
  S("The pupils did not like the long walk.", "They enjoyed the view at the top.", "Much as", ["the pupils did not like the long walk they enjoyed the view at the top", "the pupils disliked the long walk they enjoyed the view at the top"], "'Much as' means 'although', so no 'but' is needed."),
  S("Lucy would rather read a book.", "She does not want to watch television.", "Lucy prefers", ["reading a book to watching television", "to read a book rather than watch television", "reading a book rather than watching television"], "prefer + -ing + TO + -ing. Not 'prefer … than'.", ["prefers"]),
  S("Rahim saved his pocket money.", "He wanted to buy a gift for his mother.", "Rahim saved his pocket money so as", ["to buy a gift for his mother"], "'So as to' + verb shows the purpose."),
  S("The scouts were exhausted.", "They continued hiking up the hill.", "Exhausted as", ["the scouts were they continued hiking up the hill", "they were the scouts continued hiking up the hill"], "'Exhausted as they were' = although they were exhausted."),
  S("It was Kai who found the lost puppy.", "", "The lost puppy", ["was found by kai"], "Passive voice: 'Kai found it' → 'was found by Kai'."),
  S("You should not leave your bag unattended at the MRT station.", "", "On no account", ["should you leave your bag unattended at the mrt station"], "After 'On no account', swap the subject and helper verb: should you."),
  S("Only the prefects may use this staircase.", "", "None", ["but the prefects may use this staircase", "except the prefects may use this staircase", "other than the prefects may use this staircase"], "'None but' / 'None except' = only."),
 ],
 "s1": [
  S("The team trained hard.", "They won the inter-school championship.", "Owing to", ["their hard training the team won the inter-school championship", "the team's hard training they won the inter-school championship", "hard training the team won the inter-school championship"], "'Owing to' + a noun phrase gives the cause."),
  S("You must submit your project by Friday.", "Otherwise you will lose marks.", "Failing", ["to submit your project by friday you will lose marks"], "'Failing to …' = if you do not … ."),
  S("The exhibition was so popular.", "It was extended by a week.", "Such was", ["the popularity of the exhibition that it was extended by a week", "the exhibition's popularity that it was extended by a week"], "'Such was the popularity of … that …': noun form 'popularity'."),
  S("I only realised my mistake when I checked my answers.", "", "Only when I checked my answers", ["did i realise my mistake"], "After 'Only when …', swap the helper verb: did I realise."),
  S("She is young.", "She is an excellent debater.", "Young", ["as she is she is an excellent debater", "though she is she is an excellent debater"], "'Young as she is' = although she is young."),
  S("They did not know the trail was closed.", "", "Little", ["did they know the trail was closed", "did they know that the trail was closed"], "After 'Little', swap the helper verb: did they know."),
  S("We could not have finished the mural without the volunteers.", "", "Had it not been for", ["the volunteers we could not have finished the mural", "the volunteers we would not have finished the mural"], "'Had it not been for' = if there had not been … . Use it for the past."),
  S("People say that the old banyan tree is two hundred years old.", "", "The old banyan tree is said", ["to be two hundred years old"], "is said + to be: a polite way to report what people say."),
 ],
 "s2": [
  S("The librarian asked us to keep quiet.", "She was worried we would disturb others.", "Concerned", ["that we would disturb others the librarian asked us to keep quiet", "we would disturb others the librarian asked us to keep quiet"], "A participle phrase (Concerned …) must be followed by the person it describes: the librarian."),
  S("The volunteers cleaned the beach.", "Afterwards, they sorted the rubbish for recycling.", "Having", ["cleaned the beach the volunteers sorted the rubbish for recycling"], "'Having' + past participle shows the first finished action."),
  S("It is not necessary to bring a calculator.", "", "There is", ["no need to bring a calculator"], "'There is no need to' = it is not necessary to."),
  S("The new library is more spacious than the old one.", "", "The old library is", ["not as spacious as the new one", "less spacious than the new one", "not so spacious as the new one"], "Turn the comparison round: 'not as … as' or 'less … than'."),
  S("It was the first time she had performed on stage.", "", "She had never", ["performed on stage before"], "'The first time … had' becomes 'had never … before'."),
  S("If you do not apologise, she will not forgive you.", "", "Unless", ["you apologise she will not forgive you", "you apologise she won't forgive you"], "'Unless' already means 'if not', so the verb after it is positive."),
  S("The moment the bell rang, the pupils rushed to the canteen.", "", "Scarcely had", ["the bell rung when the pupils rushed to the canteen", "the bell rung before the pupils rushed to the canteen"], "'Scarcely had' + past participle (rung) + when."),
  S("He apologised.", "Then he explained what had happened.", "After", ["apologising he explained what had happened", "he had apologised he explained what had happened", "he apologised he explained what had happened"], "'After' + -ing, or 'After he had apologised'."),
 ],
}
