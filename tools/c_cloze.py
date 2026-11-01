"""🌉 Word Bridges (English follow-up, 2026-11-01 10:00): Cambridge-style OPEN CLOZE for every CEFR level. A short kid-topic text
has 8 gaps; each gap takes ONE word, mostly a grammar word (article, preposition, pronoun, helping verb, linking word,
quantity word, relative word, phrasal-verb particle, fixed-phrase word): Use of English Part 2 of B2 First, C1 Advanced and
C2 Proficiency and Part 6 of B1 Preliminary, scaled down to Starters–Movers / A2 Key grammar at A1/A2.
  A1  a/an · is/are/has · can · in/on/at · he/his/her · and/but                       — word tiles
  A2  past simple · some/any/every · than · going to · must · because · next to      — word tiles
  B1  present perfect · since/for · who/which/where · although · used to · out of     — typed
  B2  whose · despite · unless · so/such · neither…nor · had (3rd conditional)        — typed
  C1  Not only / Hardly / Were it not / Little did · whereby · regardless · let alone — typed
  C2  No sooner · albeit · whatsoever · Much as · lest · Should… · insofar · be it    — typed
Kid- and teen-friendly topics only (pets, parks, school clubs, science day, nature, castles, music), also at C1/C2.
Each text = a list of sentences; a gapped sentence holds ONE gap (___) and is written
  Gp(sentence, "answer|other right answers", kind, why-tip, "wrong=why not|wrong=why not|wrong=why not" for the A1/A2 tiles)
kind → the 💡 hint after a first miss (js/cloze.js KINDS). All right answers are listed; the build checks one word each and
that no wrong tile is also right."""

def Gp(s, ans, kind, tip, x=None):
    d = {"s": s, "ans": ans.split("|"), "kind": kind, "tip": tip}
    if x:   # "wrong=why not|wrong=why not|wrong=why not": every wrong tile has its own 'why not' note
        pairs = [w.split("=", 1) for w in x.split("|")]
        d["x"] = [w for w, _ in pairs]; d["no"] = {w: why for w, why in pairs}
    return d

def T(icon, name, focus, text): return {"icon": icon, "name": name, "focus": focus, "text": text}

A1 = [
 T("🐱", "My Cat Coco", "a · an · is · has · on · her", [
  Gp("I have ___ little cat.", "a", "art", "Use a before one thing that starts with a consonant sound: a cat, a little cat.", "an=an goes before a vowel sound (an apple), but little starts with l.|is=is is a 'be' word; before little cat we need a.|on=on tells where something is; it can't go before little cat here."),
  Gp("Her name ___ Coco.", "is", "aux", "One thing (her name) → is. I am, you are, he/she/it is.", "are=are is for you, we, they or more than one; her name is one thing.|am=am only goes with I: I am.|has=has means owning something; a name can't own Coco!"),
  Gp("She ___ white paws and a pink nose.", "has", "verb", "he/she/it has; I/you/we/they have. Coco is one cat, so she has.", "have=have is for I, you, we and they; she needs has.|is=She is white paws? No! Paws are something she has.|are=are is for more than one; Coco is one cat."),
  Gp("Coco likes to sleep ___ my bed.", "on|in", "prep", "on my bed = on top of it (in my bed = under the covers: also right!).", "at=at is for a place or a time (at school, at seven); we sleep on or in a bed.|of=of shows belonging (a cup of milk); it doesn't tell where.|to=to shows moving towards a place (go to school)."),
  Gp("She eats fish ___ drinks milk.", "and", "link", "and joins two things she does: eats fish and drinks milk.", "is=eats fish is drinks milk? We need a joining word: and.|a=a goes before one thing (a cat), not before drinks.|at=at tells a place or time; to join two actions we need and."),
  Gp("Every morning, she plays with ___ orange ball.", "an", "art", "Use an before a vowel sound: an orange, an apple, an egg.", "a=orange starts with a vowel sound, so it's an, not a.|on=on tells where; before orange ball we need an.|is=is is a 'be' word; it can't go before orange ball here."),
  Gp("Coco ___ jump very high!", "can", "mod", "can + verb = she is able to do it. No -s after can: she can jump.", "cans=can never takes -s: she can jump.|is=is jump isn't English; is goes with -ing: is jumping.|has=has jump isn't English; has goes with a thing: has a ball."),
  Gp("I love ___ very much.", "her", "pron", "After a doing word we say her, not she: I love her. (him for a boy cat!)", "she=she comes before a doing word (She runs); after love we say her.|he=he comes before a doing word, and Coco is a girl cat: her.|is=I love is? We need who we love: her."),
 ]),
 T("🏞", "At the Park", "there are · with · they · got", [
  Gp("There ___ lots of flowers in the park.", "are", "aux", "There are + more than one thing (lots of flowers). There is + one thing.", "is=is is for one thing; lots of flowers are many, so are.|am=am only goes with I.|be=be needs a helper (will be, can be); here we need are."),
  Gp("Two girls are playing ___ a red ball.", "with", "prep", "We play with a ball, a toy or a friend.", "on=playing on a ball means standing on it!|at=at is for a place or a time, not a toy.|of=of shows belonging; we play with a ball."),
  Gp("___ are my sisters, Amy and Jo.", "They", "pron", "They = more than one person, before the verb: They are my sisters.", "Them=Them comes after a doing word (I see them), not at the start.|She=She is one girl, but Amy and Jo are two: They.|It=It is for one thing, not two people."),
  Gp("My dad is sitting ___ a bench.", "on", "prep", "We sit on a bench, a chair or the grass.", "of=of shows belonging, not a place.|to=to shows moving towards a place, not sitting.|an=an goes before a vowel sound, and bench already has a."),
  Gp("He ___ reading a book.", "is", "aux", "he/she/it is + -ing for now: He is reading.", "are=are is for you, we and they; he needs is.|am=am only goes with I.|have=have is for I, you, we and they, and it doesn't go before -ing here."),
  Gp("We have ___ a picnic basket.", "got", "verb", "have got = have: We have got a basket. I've got a cat.", "get=have get isn't English; have got means have.|gets=gets is for he, she or it, and have gets isn't English.|a=There's already a before picnic basket; two a's don't work."),
  Gp("Mum gives me ___ apple.", "an", "art", "an before a vowel sound: an apple, an orange.", "a=apple starts with a vowel sound, so we say an apple.|on=on tells where; before apple we need an.|is=is is a 'be' word; it can't go before apple here."),
  Gp("I ___ the park very much!", "like|love", "verb", "I like / I love + a thing. No -s after I.", "likes=likes is for he, she or it; with I we say like.|am=I am the park? You aren't a park!|is=is is for he, she or it; it doesn't go with I."),
 ]),
 T("🐶", "Ben's Busy Day", "at · his · can · but · him", [
  Gp("Ben is ___ small brown dog.", "a", "art", "a before one thing with a consonant sound: a small dog.", "an=small starts with a consonant sound, so a, not an.|are=Ben is are isn't English; one 'be' word is enough.|on=on tells where; before small brown dog we need a."),
  Gp("___ lives with the Lee family.", "He", "pron", "He = one boy or boy animal, before the verb: He lives…", "His=His shows belonging (his ball); before lives we need He.|Him=Him comes after a doing word (I like him).|We=We is more than one, and we say We live, not We lives."),
  Gp("Ben gets up ___ seven o'clock.", "at", "prep", "at + a clock time: at seven o'clock, at half past two.", "in=in is for months and years (in May), not clock times.|on=on is for days (on Monday), not clock times.|of=of shows belonging, not a time."),
  Gp("He eats ___ breakfast in the kitchen.", "his|the", "det", "his = belonging to him (Ben): his breakfast, his bed.", "he=he goes before a doing word (He eats), not before breakfast.|him=him comes after a doing word, but it doesn't say whose breakfast.|is=is is a 'be' word; it can't go before breakfast."),
  Gp("Ben ___ catch a ball in his mouth!", "can", "mod", "can + verb = able to do it: Ben can catch a ball.", "cans=can never takes -s.|is=is catch isn't English; is goes with -ing.|does=does catch is for questions; to say he is able, we use can."),
  Gp("He doesn't like cats, ___ he likes rabbits.", "but", "link", "but shows something different: doesn't like cats, BUT likes rabbits.", "is=We need a joining word between the two ideas, not is.|of=of shows belonging; it can't join two ideas.|a=a goes before one thing, not before he."),
  Gp("At night, Ben sleeps ___ a basket.", "in", "prep", "in = inside something: in a basket, in a box.", "at=at is for a place we visit (at school), not inside a basket.|of=of shows belonging, not a place.|an=an goes before a vowel sound, and there's already a."),
  Gp("We all love ___!", "him", "pron", "After a doing word we say him, not he: We love him.", "he=he goes before a doing word (He runs); after love we say him.|his=his shows belonging (his bed); it needs a thing after it.|they=they is more than one, and after love we'd say them."),
 ]),
]

A2 = [
 T("⛺", "Camping by the Lake", "went · was · next to · any · than", [
  Gp("Last summer, my family ___ camping by a lake.", "went", "verb", "Last summer = the past: go → went (an irregular past).", "go=Last summer is the past, so go becomes went.|goes=goes is now, for he, she or it; we need the past.|going=going needs was or were before it: was going."),
  Gp("The weather ___ sunny and warm.", "was", "aux", "Past of is = was (one thing); were for more than one.", "were=were is for more than one (we were); the weather is one thing.|be=be needs a helper (will be); in the past it's was.|are=are is now; last summer is the past."),
  Gp("We put up our tent next ___ the water.", "to", "prep", "next to = beside. It always goes together: next to the lake.", "of=We say next to, never next of.|at=We say next to, never next at.|in=We say next to, never next in."),
  Gp("We didn't have ___ chairs, so we sat on logs.", "any", "quant", "any after not: We didn't have any chairs. (some is for yes-sentences.)", "some=some is for yes-sentences; after didn't we use any.|a=a is for one thing; chairs means more than one.|much=much is for things we can't count (much water); we can count chairs."),
  Gp("We were tired ___ we swam all afternoon.", "because|as|since", "link", "because gives the reason: tired because we swam.", "what=what asks about or names a thing; it can't give a reason.|or=or gives a choice (tea or milk), not a reason.|than=than compares two things (bigger than)."),
  Gp("My sister asked, “___ you see the stars last night?”", "Did", "aux", "Past questions start with Did + verb: Did you see…?", "Was=Was you see isn't English; past questions with a doing word use Did.|Are=Are is for now, and are doesn't go with see.|Has=Has is for he, she or it, and last night needs Did."),
  Gp("The lake was colder ___ the swimming pool at home.", "than", "comp", "colder than: -er words compare two things with than (not then).", "then=then means 'next' or 'after that'; to compare we use than.|that=that points to something; after colder we need than.|as=as goes with as … as (as cold as); after colder use than."),
  Gp("We are ___ to go back next year!", "going", "verb", "be going to + verb = a plan for the future.", "go=are go isn't English; we say are going to.|went=went is the past; next year is the future.|gone=are gone to go isn't English; we say are going to."),
 ]),
 T("🎂", "Grandma's Birthday", "on · for · must · at · all", [
  Gp("My grandma's birthday is ___ Sunday.", "on", "prep", "on + days: on Sunday, on my birthday.", "in=in is for months and years (in May); days take on.|at=at is for clock times (at three o'clock); days take on.|to=to shows moving to a place, not a day."),
  Gp("We are making a big cake ___ her.", "for", "prep", "for = to give to someone: a cake for her, a present for you.", "to=We make a cake for someone; to is for giving: give it to her.|at=at is for places and times, not for the person who gets it.|of=of shows belonging (a slice of cake)."),
  Gp("Oh no! There isn't ___ sugar in the cupboard!", "any|much", "quant", "isn't any = none at all. any goes with not.", "some=some is for yes-sentences; after isn't we use any.|many=many is for things we can count; we can't count sugar.|a=a is for one thing we can count; we don't say a sugar."),
  Gp("Mum goes to the shop ___ buys a big bag.", "and", "link", "and joins two things Mum does: goes and buys.", "but=but shows something different; going and buying go together, so and.|of=of shows belonging; it can't join two actions.|the=the goes before a thing, not before buys."),
  Gp("“We ___ be very quiet. It's a surprise!”", "must|should", "mod", "must + verb = it's very important: We must be quiet.", "musts=must never takes -s.|has=has be isn't English, and has is for he, she or it.|are=are be isn't English; one 'be' word is enough."),
  Gp("Grandma arrives ___ four o'clock.", "at", "prep", "at + a clock time: at four o'clock.", "in=in is for months and parts of the day (in the morning).|on=on is for days and dates (on Sunday).|to=to shows going to a place, not a time."),
  Gp("She opens the door and sees ___ her family.", "all", "quant", "all her family = every person in her family.", "every=every goes straight before a thing (every day), not before her.|any=any is for questions and not-sentences.|many=many her family isn't English; we'd say many of."),
  Gp("“This is ___ best birthday ever!” she says.", "the|my", "art", "the + best: the best birthday, the biggest cake.", "a=best means the top one, so it takes the, not a.|an=an goes before a vowel sound, and best needs the.|most=best already means 'most good'; most best isn't English."),
 ]),
 T("🐢", "The School Pet", "called · than · every · for · going to", [
  Gp("Our class has a pet tortoise ___ Shelly.", "called|named", "verb", "called = with the name: a tortoise called Shelly.", "call=a tortoise call Shelly? We need called (it has the name).|calls=calls is something she does now; we need called.|calling=calling means shouting or phoning, not her name."),
  Gp("She is ten years old, so she is older ___ us!", "than", "comp", "older than: compare two things with than.", "then=then means 'after that'; to compare we use than.|as=as goes with as … as (as old as us).|that=that points to something; after older we need than."),
  Gp("Shelly eats lettuce ___ day.", "every|each", "quant", "every day = Monday, Tuesday, Wednesday… all the days.", "much=much is for amounts (much lettuce), not for days.|many=many goes with more than one: many days, not many day.|lots=lots of goes before things (lots of lettuce), not before day."),
  Gp("Last week, nobody could find ___!", "her", "pron", "After find we say her, not she: find her.", "she=she goes before a doing word; after find we say her.|hers=hers means 'belonging to her' (it's hers).|they=they is more than one, and after find we'd say them."),
  Gp("We looked ___ her everywhere.", "for", "prep", "look for = try to find: We looked for her.", "at=look at means just look with your eyes; to find her we look for her.|to=look to her doesn't mean trying to find her.|on=look on her isn't what we mean; look for = try to find."),
  Gp("In the end, Tom found her asleep ___ his school bag!", "in|inside", "prep", "in = inside something: in his bag.", "at=at is for a place we visit (at school), not inside a bag.|of=of shows belonging, not a place.|to=to shows moving towards a place."),
  Gp("Tom was very surprised, ___ everyone laughed.", "and|so", "link", "and joins two things that happened.", "or=or gives a choice; both things really happened, so and.|than=than is for comparing (bigger than).|of=of shows belonging; it can't join two ideas."),
  Gp("Next week, we are ___ to build her a new house.", "going", "verb", "be going to + verb = a plan: We are going to build…", "go=are go isn't English; we say are going to.|went=went is the past; next week is the future.|goes=goes is for he, she or it now; after are we need going."),
 ]),
]

B1 = [
 T("🤖", "The Robot Club", "have been · who · since · pick up · although", [
  Gp("I ___ been a member of the school robot club for two years.", "have", "aux", "Present perfect = have + been: something that started in the past and is still true.", None),
  Gp("The club is run by Mr Patel, ___ used to be an engineer.", "who", "rel", "who is for people. After a comma we can't use that.", None),
  Gp("We've built five robots ___ September.", "since", "prep", "since + a starting point (since September); for + a length of time (for two years).", None),
  Gp("Our newest robot can pick ___ rubbish in the playground.", "up", "part", "pick up = lift something from the ground.", None),
  Gp("___ it is quite slow, it never misses a crisp packet.", "Although|Though|While|Whilst", "link", "Although joins two ideas that surprise us together: slow, but never misses.", None),
  Gp("Last month, we took it to a competition ___ London.", "in", "prep", "in + a city or country: in London, in Japan.", None),
  Gp("We didn't win, but the judges were very impressed ___ our design.", "by|with", "prep", "impressed by (or with) something.", None),
  Gp("Next year, we want to build a robot that can water the plants ___ its own.", "on", "prep", "on its own = without help. (by itself means the same.)", None),
 ]),
 T("🧪", "Volcano Day", "was given · out of · which · until · so … that", [
  Gp("Last Friday was Science Day, and every class ___ given a project.", "was", "aux", "Passive in the past: was + given (someone gave each class a project).", None),
  Gp("Ours was to make a volcano ___ of paper and glue.", "out", "part", "make something out of = use it as the material.", None),
  Gp("First, we built the shape around an empty bottle, ___ became the crater.", "which", "rel", "which is for things. After a comma we can't use that.", None),
  Gp("The paint took ages to dry ___ it was so thick.", "because|as|since", "link", "because gives the reason: it took ages because it was thick.", None),
  Gp("When it was ready, we were ___ excited to wait for the teacher.", "too", "intens", "too + adjective + to = so much that we couldn't: too excited to wait.", None),
  Gp("We poured in vinegar, but nothing happened ___ we added more baking soda.", "until|till", "link", "until = up to that moment, then it changed.", None),
  Gp("Then it foamed so much ___ it spilled onto the floor!", "that", "link", "so + adjective/much + that shows the result: so much that it spilled.", None),
  Gp("___ we do it again next year, we'll use a bigger tray.", "If|When", "link", "If + present, will + verb: a real plan for the future.", None),
 ]),
 T("💌", "A Letter to a Pen Pal", "used to · each · when · where · what", [
  Gp("Dear Sam, thanks ___ your letter.", "for", "prep", "thanks for + the thing: thanks for your letter.", None),
  Gp("I ___ to have a dog too, but now we have two guinea pigs.", "used", "verb", "used to + verb = something true in the past but not now.", None),
  Gp("They're called Pip and Squeak, and they live in a hutch ___ our garden.", "in", "prep", "in our garden = inside the garden area.", None),
  Gp("___ morning, I give them fresh hay and carrots.", "Each|Every", "quant", "Each / Every morning = all the mornings, one by one.", None),
  Gp("They squeak loudly ___ they hear the fridge door.", "when|whenever|if", "link", "when = at the time that: they squeak when they hear it.", None),
  Gp("I think they've learned that the fridge is ___ the food is!", "where", "wh", "where = the place: the fridge is where the food is.", None),
  Gp("My cousin is coming to stay ___ a few days next week.", "for", "prep", "for + a length of time: for a few days, for a week.", None),
  Gp("Write back soon and tell me ___ your puppy is called!", "what", "wh", "what + is called: tell me what it is called (no question order inside).", None),
 ]),
]

B2 = [
 T("🐝", "The Rooftop Garden", "into · whose · despite · such · unless", [
  Gp("Our school has turned its flat roof ___ a garden.", "into", "prep", "turn A into B = change A so it becomes B.", None),
  Gp("The idea came from Ms Ortiz, ___ class wanted somewhere to grow vegetables.", "whose", "rel", "whose = belonging to the person before it: Ms Ortiz's class → whose class.", None),
  Gp("___ the strong winds up there, almost everything has grown well.", "Despite|Notwithstanding", "link", "Despite + a noun (the winds) = even though there are strong winds. (No 'of' after despite!)", None),
  Gp("There are now ___ many tomatoes that the canteen uses them in lunches.", "so", "intens", "so + many/much + that: so many tomatoes that… (such goes with a noun: such a success).", None),
  Gp("The bees, ___ live in two hives by the door, love the lavender.", "which", "rel", "which for things and animals after a comma (not that).", None),
  Gp("Pupils aren't allowed on the roof ___ a teacher is with them.", "unless", "link", "unless = except if: not allowed unless a teacher is there.", None),
  Gp("It has been ___ a success that other schools have come to visit.", "such", "intens", "such + a + noun + that: such a success that… (so + adjective: so successful that…).", None),
  Gp("Next spring, we hope to set ___ a stall selling honey to parents.", "up", "part", "set up = start or build something (a stall, a club).", None),
 ]),
 T("📣", "Making Our Own Film", "none of · had known · than · as · all", [
  Gp("When our drama teacher suggested making a film, none ___ us knew how hard it would be.", "of", "prep", "none of + us/them/the… = not one person in the group.", None),
  Gp("We spent weeks writing the script, ___ turned out to be the easy part.", "which", "rel", "which after a comma can point back to a whole idea (writing the script).", None),
  Gp("Filming outdoors was tricky, ___ it rained almost every day.", "as|because|since|for", "link", "as = because, giving the reason.", None),
  Gp("Jake, ___ played the hero, kept forgetting his lines.", "who", "rel", "who for people, between commas for extra information.", None),
  Gp("If we ___ known how long editing takes, we would have started earlier.", "had", "aux", "Third conditional: If + had + past participle, would have + past participle (about the past).", None),
  Gp("In the end, it took ___ three months to finish.", "us|almost|nearly|about|around|over|roughly|only|just", "pron", "it takes/took + person + time: it took us three months. (almost, nearly or about fit too.)", None),
  Gp("On premiere night, there were more people ___ seats in the hall.", "than", "comp", "more … than compares two amounts.", None),
  Gp("Everyone agreed it had been worth ___ the hard work.", "all", "quant", "worth all the work = every bit of it was worth it.", None),
 ]),
 T("🦉", "The Night Walk", "set off · anything · neither … nor · until · could", [
  Gp("Last autumn, our scout group went ___ a night walk through the woods.", "on|for", "prep", "go on a walk / go for a walk: both are right.", None),
  Gp("We set ___ long after dark, which felt very strange.", "off|out", "part", "set off / set out = start a journey.", None),
  Gp("At first, I could hardly see ___ at all.", "anything|much", "pron", "hardly is almost a 'not', so we use anything (not something, not nothing).", None),
  Gp("___ my best friend nor I had ever heard a real owl before.", "Neither", "neg", "Neither A nor B = not A and not B.", None),
  Gp("Then, all of a sudden, one hooted right ___ our heads.", "above|over", "prep", "above / over = higher than: right above our heads.", None),
  Gp("We stood completely still ___ it flew away.", "until|till", "link", "until = up to the moment that something happens.", None),
  Gp("I'd never have guessed that the woods ___ be so full of life at night.", "could|would", "mod", "could = was possible (the past of can).", None),
  Gp("It's a night I'll remember for the rest ___ my life.", "of", "prep", "the rest of = all the remaining part: the rest of my life.", None),
 ]),
]

C1 = [
 T("🌊", "Whale Watching", "Not only · However · whereby · Hardly · Were it not", [
  Gp("___ only did we see three humpback whales on our school trip, but one of them leapt out of the water.", "Not", "neg", "Not only + question order (did we see) … but (also): a strong way to add a surprise.", None),
  Gp("Our guide explained that whales sing songs ___ can travel for hundreds of kilometres.", "that|which", "rel", "that / which for things in a defining clause (no commas).", None),
  Gp("___ loud the engine was, the whales didn't seem to mind.", "However", "link", "However + adjective = it doesn't matter how: however loud it was.", None),
  Gp("We learned about a rule ___ boats must stay at least a hundred metres away.", "whereby|where", "rel", "whereby = by which, according to which (a formal word for rules and systems).", None),
  Gp("Hardly ___ we put our cameras away when a baby whale appeared beside the boat.", "had", "aux", "Hardly + had + subject + past participle … when: one thing happened just after another.", None),
  Gp("___ it not for these rules, the whales might be frightened away from the bay.", "Were", "aux", "Were it not for = If it weren't for (a formal 'if' with inversion).", None),
  Gp("Several of us felt seasick, ___ nobody regretted going.", "but|yet|though|although", "link", "yet / but = and in spite of this.", None),
  Gp("It was, ___ far, the best trip we've ever had.", "by", "prep", "by far + superlative = much more than any other: by far the best.", None),
 ]),
 T("🎨", "The Mural Project", "came up with · Rather than · regardless · many of whom · Little did", [
  Gp("When the old wall behind the sports hall began to crumble, the pupils came ___ with a plan.", "up", "part", "come up with = think of (an idea or a plan).", None),
  Gp("Rather ___ simply repaint it, they would turn it into a giant mural.", "than", "comp", "Rather than + verb = instead of doing it.", None),
  Gp("Every class, ___ of age, was invited to design one section.", "regardless|irrespective", "link", "regardless of = it doesn't matter (what age).", None),
  Gp("The younger children, ___ of whom had never painted on a wall before, were thrilled.", "many|most|some|several|all|few", "quant", "many of whom = many of these children (whom after of for people).", None),
  Gp("___ colour they chose, it had to match the theme of 'Our Town'.", "Whatever|Whichever", "wh", "Whatever + noun = it doesn't matter which colour.", None),
  Gp("The paint was sealed with a special varnish so ___ to protect it from the rain.", "as", "fixed", "so as to + verb = in order to.", None),
  Gp("___ did they know that a local newspaper would write about it.", "Little", "neg", "Little did they know = they had no idea (inversion: did they know).", None),
  Gp("The wall now attracts visitors from all ___ the region.", "over|across|around", "prep", "from all over = from every part of.", None),
 ]),
 T("⛰", "The Climbing Wall", "whom · in case · let alone · Given · no fewer than", [
  Gp("I'd always been scared of heights, so I was nervous ___ trying the new climbing wall.", "about", "prep", "nervous about + -ing: nervous about trying.", None),
  Gp("My instructor, ___ I'd met only that morning, was incredibly patient.", "whom|who", "rel", "whom = the object form of who (I had met her). Who is fine in everyday English.", None),
  Gp("She checked my harness twice, just in ___ it was loose.", "case", "fixed", "in case = to be safe if something happens.", None),
  Gp("At first I couldn't reach the second hold, ___ alone the top.", "let", "fixed", "let alone = and certainly not (the top is even harder).", None),
  Gp("___ how frightened I'd been, reaching halfway felt like a huge victory.", "Given|Considering", "link", "Given (that) = when you think about the fact that…", None),
  Gp("By the end of the month, I had reached the top ___ fewer than six times.", "no", "fixed", "no fewer than + number = as many as (it's surprising, a lot!).", None),
  Gp("It goes to show that fear needn't hold you ___.", "back", "part", "hold someone back = stop them from doing something.", None),
  Gp("I'm now saving ___ for a pair of proper climbing shoes.", "up", "part", "save up for = keep money until you can buy something.", None),
 ]),
]

C2 = [
 T("🌌", "The Stargazing Society", "No sooner · albeit · let alone · whatsoever · Much as", [
  Gp("___ sooner had the club's new telescope arrived than everyone wanted a turn.", "No", "neg", "No sooner had … than = the second thing happened immediately after the first.", None),
  Gp("Setting it up, ___ time-consuming, proved well worth the effort.", "albeit|although|though|while|whilst", "link", "albeit = although (followed by an adjective or phrase, not a full clause).", None),
  Gp("Few of us had ever seen Saturn's rings, ___ alone its moons.", "let", "fixed", "let alone = and even less (its moons are even harder to see).", None),
  Gp("On the first clear night, there was no cloud ___.", "whatsoever", "adv", "no + noun + whatsoever = none at all (very strong).", None),
  Gp("___ as we wanted to stay out until dawn, we had school at eight.", "Much", "fixed", "Much as = although (we really wanted to).", None),
  Gp("Not ___ did anyone complain about the cold.", "once", "neg", "Not once + question order = never, not a single time.", None),
  Gp("Our teacher insisted that the telescope ___ packed away by eleven.", "be|was", "aux", "insist that + subject + be (the formal subjunctive). 'was' is also heard in British English.", None),
  Gp("The society has since grown ___ over forty members.", "to", "prep", "grow to + a number = reach that number.", None),
 ]),
 T("🏰", "The Castle Ruins", "all that · legend has it · lest · Should · insofar as", [
  Gp("Perched on a cliff, the ruined tower is all ___ remains of a once-mighty fortress.", "that", "rel", "all that remains = the only thing left (after all, use that, not which).", None),
  Gp("Little is known about ___ built it, though stories abound.", "who|whoever", "wh", "about who built it: who is the subject of 'built'.", None),
  Gp("Local legend has ___ that a dragon once guarded the gates.", "it", "fixed", "Legend has it that… = people say (in old stories) that…", None),
  Gp("We were told to keep to the path ___ we slip on the crumbling stones.", "lest", "link", "lest = so that … not (very formal): lest we slip = so that we don't slip.", None),
  Gp("___ the walls collapse, centuries of history would be lost.", "Should", "aux", "Should + subject + verb = If (by any chance) the walls collapse… a formal inverted conditional (like Were the walls to collapse).", None),
  Gp("Volunteers, ___ of whom are paid, spend their weekends repairing it.", "none|few", "quant", "none of whom = not one of them (they work for free).", None),
  Gp("Their efforts have paid ___, as the castle now welcomes thousands of visitors a year.", "off", "part", "pay off = bring good results after hard work.", None),
  Gp("___ as it is possible, the repairs are done using traditional methods.", "Insofar", "fixed", "Insofar as = to the extent that (as much as it can be).", None),
 ]),
 T("🎶", "The Youth Orchestra", "to say the least · be it · Hardly · on the verge of · as though", [
  Gp("Joining the city youth orchestra was, ___ say the least, a challenge.", "to", "fixed", "to say the least = and that's putting it mildly (it was harder than that!).", None),
  Gp("The conductor demanded perfection, ___ it at rehearsals or on stage.", "be", "fixed", "be it A or B = whether it is A or B.", None),
  Gp("___ a week went by without extra practice.", "Hardly|Scarcely|Barely", "neg", "Hardly a week = almost no week (nearly every week had extra practice).", None),
  Gp("There were moments when I was on the ___ of giving up.", "verge|brink|point", "fixed", "on the verge of + -ing = very close to doing it.", None),
  Gp("___ kept me going was the thought of the summer concert.", "What", "wh", "What = the thing that: What kept me going was…", None),
  Gp("When the night finally came, we played ___ though our lives depended on it.", "as", "fixed", "as though = as if (in a way that suggests).", None),
  Gp("The applause went ___ for what felt like an eternity.", "on", "part", "go on = continue.", None),
  Gp("I wouldn't change a single moment of it, ___ would anyone else in the orchestra.", "nor|neither", "neg", "…, nor would anyone else = and also no one else would (question order after nor).", None),
 ]),
]

CLOZE = {"a1": A1, "a2": A2, "b1": B1, "b2": B2, "c1": C1, "c2": C2}
MODE = {"a1": "tiles", "a2": "tiles", "b1": "type", "b2": "type", "c1": "type", "c2": "type"}
