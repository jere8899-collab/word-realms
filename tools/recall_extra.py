"""✍️ BRIEF-T7B wave 2: extra recall questions on existing passages and recordings (nothing is rewritten or removed).
Each new question is a sentence from that passage / recording with one word or short phrase blanked; the answer is exactly
those words, so it is never a paraphrase. The item is placed inside the same passage (reading) or appended to the
listening bank, and `src` must match the passage title / recording text, so no existing item key changes.
`recall: 1` = type it first (js/recall.js). `sk` inherits the skill tag of the original question on that text.
reading tuple: (passage title, gapped sentence, answer, [3 distractors], why)
listening tuple: (part of the recording, gapped sentence, answer, [3 distractors], why)"""
W = {
"a2": {"listening": [
  ("Let's get pizza", "Let's get pizza. Actually, no, we had pizza yesterday. What about ___?", "pasta", ["pizza", "soup", "salad"], "They had pizza yesterday, so pasta today."),
  ("The museum opens at nine thirty", "The museum opens at nine thirty, but the café doesn't open until ___.", "eleven", ["nine", "ten", "twelve"], "Nine thirty is the museum; the café opens at eleven."),
  ("I usually walk to school", "I usually walk to school, but today I'm going by ___ because I'm late.", "bike", ["bus", "train", "car"], "Usually walking; today by bike."),
  ("Let's meet outside the cinema", "Let's meet outside the cinema at ___ to seven.", "quarter", ["half", "ten", "five"], "Quarter to seven = 6:45."),
  ("The film starts at quarter to seven", "The film starts at quarter to seven, so let's meet at half past ___.", "six", ["seven", "five", "eight"], "Half past six, before the film."),
 ], "reading": [
  ("Camping by the River", "On Saturday we went fishing, but we didn't catch ___!", "anything", ["something", "everything", "nothing"], "They caught nothing, so not a thing."),
  ("The Sweet Shop Job", "I start at nine and finish at ___.", "three", ["nine", "five", "six"], "Nine to three = six hours."),
  ("An Email from Ella", "I'd love to come, but I have a piano lesson until ___.", "five", ["four", "six", "seven"], "The lesson ends at five, so Ella will be late."),
  ("The Gingerbread Baker", "At first he only sold ___, but one winter he made gingerbread houses for the village children.", "bread", ["cakes", "gingerbread", "pies"], "At first: only bread."),
  ("Email from Camp", "Yesterday we went canoeing on the ___.", "lake", ["river", "sea", "pool"], "Canoeing on the lake."),
 ]},
"b1": {"listening": [
  ("roundabout", "Turn left at the ___, go past the petrol station, and the hotel's on your right.", "roundabout", ["crossroads", "junction", "traffic lights"], "Turn left at the roundabout."),
  ("hot chocolate", "We were halfway up the mountain when it started snowing, so we turned back and had hot ___ at the café instead.", "chocolate", ["coffee", "soup", "tea"], "Hot chocolate after turning back."),
  ("learning the guitar", "I've been learning the guitar for a year, but I still can't play a whole song without ___.", "stopping", ["practising", "learning", "trying"], "Not without stopping: still improving."),
  ("refund", "If you'd like a refund, you'll need to bring the ___ within thirty days.", "receipt", ["invoice", "ticket", "warranty"], "The receipt is the proof of purchase."),
  ("my cousin", "I was going to take the train, but there's a strike, so I'm getting a ___ with my cousin instead.", "lift", ["ride", "taxi", "bus"], "Getting a lift with her cousin (no train)."),
  ("unwell", "The concert has been moved from Friday to Sunday because the singer is ___.", "unwell", ["unhappy", "unavailable", "unprepared"], "Unwell = ill."),
  ("sports centre", "The new sports centre has a ___ wall, which is great, although the pool is smaller than the old one.", "climbing", ["diving", "running", "training"], "A climbing wall."),
  ("washing up", "I don't mind cooking, but I really hate ___ afterwards.", "washing up", ["cooking", "shopping", "clearing"], "Washing up = the dishes."),
 ], "reading": [
  ("Forest Schools", "Teachers say that pupils who struggle in the ___ often do well outside, and many become more confident.", "classroom", ["playground", "library", "garden"], "Inside = the classroom."),
  ("Forest Schools", "However, some parents worry about safety and the cost of ___ clothing.", "waterproof", ["woollen", "expensive", "school"], "The cost of waterproof clothing."),
  ("Review: Moonlight Mushroom Café", "The berry pie was ___, but the soup was cold and rather salty.", "delicious", ["awful", "cold", "salty"], "Good pie, bad soup."),
  ("Make a Bird Feeder", "Next, spread peanut butter all over it — if anyone in your house has a nut allergy, use ___ fat instead.", "vegetable", ["peanut", "butter", "coconut"], "Vegetable fat instead of peanut butter."),
  ("The Whispering Trees", "From then on, the ___ stopped laughing at him for talking to trees.", "villagers", ["woodcutters", "children", "farmers"], "The villagers stopped laughing."),
  ("Mira and the Recycling Robot", "With help from the science club, she built a robot that could ___ plastic, paper and metal using a small camera.", "recognise", ["collect", "recycle", "separate"], "The camera lets it recognise the materials."),
  ("Gina's Diary", "I'm not saying I've ___ got over my fear, but I'm proud I didn't give up.", "completely", ["quickly", "finally", "easily"], "Not completely over it, but she didn't give up."),
  ("The Lantern Makers", "Although electric lights would be easier and safer, most villagers insist on real ___, saying that 'a lantern without a flame is just a paper bag'.", "candles", ["lights", "bulbs", "lanterns"], "Real candles, not electric lights."),
 ]},
"b2": {"listening": [
  ("twelve kilometres", "The trail is about twelve ___ long and takes most people around four hours to complete.", "kilometres", ["metres", "miles", "hours"], "Twelve kilometres long."),
  ("permitting", "Weather ___, the ceremony will be held in the castle gardens.", "permitting", ["allowing", "agreeing", "depending"], "Weather permitting = if the weather is fine."),
  ("fifteen percent", "Sales went up by fifteen percent in the first quarter, but fell ___ in the second.", "slightly", ["sharply", "steeply", "slowly"], "Fell slightly = a little."),
  ("stubborn", "She takes after her mother: same sense of humour, same ___ streak.", "stubborn", ["patient", "gentle", "selfish"], "A stubborn streak = she doesn't give in."),
  ("waterproofs", "The ___ was for storms, so we'd packed waterproofs, but in the end it turned out to be the hottest day of the year.", "forecast", ["weather", "report", "warning"], "The forecast said storms."),
  ("climbing gym", "My brother reckons the new climbing gym is ___, but given how much equipment they lend you, I think it's a bargain.", "overpriced", ["expensive", "cheap", "overcrowded"], "Overpriced = costs too much (the speaker disagrees)."),
  ("ferry", "Apparently the ferry's been ___ due to high winds, so we'll have to stay another night.", "cancelled", ["delayed", "diverted", "postponed"], "Cancelled = it isn't running."),
  ("council", "Frankly, I think the council should have ___ residents before closing the library.", "consulted", ["informed", "questioned", "contacted"], "Consulted = asked for their views."),
 ], "reading": [
  ("The Secret of Crystal Lake", "Each mussel filters up to a litre of water a day, removing algae and ___.", "particles", ["bacteria", "chemicals", "plastics"], "Algae and particles are filtered out."),
  ("The Secret of Crystal Lake", "However, the ___ has fallen by a third in the last decade, which researchers link to rising water temperatures.", "population", ["number", "colony", "water"], "The population has fallen."),
  ("Quiet Voices", "Many people assume that ___ dislike other people.", "introverts", ["extroverts", "teenagers", "strangers"], "The assumption about introverts."),
  ("Time or Money?", "A survey of 2,000 ___ found that 68% would prefer to work fewer hours for less pay than earn more by working longer.", "teenagers", ["workers", "students", "adults"], "2,000 teenagers were asked."),
  ("Your Application", "We were ___ by your experience, but we feel your knowledge of local wildlife is not yet sufficient for this role.", "impressed", ["inspired", "surprised", "convinced"], "Impressed by the experience, but not enough wildlife knowledge."),
  ("The Glass Swimmers", "Their ___ skin allows predators to see straight through them, which, paradoxically, helps them survive…", "transparent", ["delicate", "slippery", "thin"], "Transparent = you can see through it."),
  ("Should Homework Be Banned?", "Surveys showed that most students did feel less stressed, and library ___ went up by a fifth.", "borrowing", ["reading", "visits", "opening"], "Library borrowing went up."),
  ("The Boy Who Mapped the Stars", "A retired ___ next door lent him an old telescope, and within a year Tomás had logged over three hundred observations.", "astronomer", ["teacher", "scientist", "professor"], "A retired astronomer lent the telescope."),
 ]},
"c1": {"listening": [
  ("edible", "Considering he'd never cooked before, the meal was surprisingly ___.", "edible", ["enjoyable", "impressive", "pleasant"], "Edible = you could eat it."),
  ("coding", "I was going to enter the coding ___ on my own, but in the end I teamed up with Priya, and frankly she did most of the clever bits.", "competition", ["contest", "project", "challenge"], "Enter a competition."),
  ("nettle", "Someone needs to grasp the ___.", "nettle", ["problem", "issue", "bull"], "Grasp the nettle = deal with the hard thing."),
  ("besieged", "Contrary to popular belief, the castle was never actually ___.", "besieged", ["attacked", "invaded", "captured"], "Never besieged, despite what people think."),
  ("tight-lipped", "He's notoriously tight-lipped about his plans, so I wouldn't read too much into the ___.", "silence", ["secret", "plans", "rumours"], "Don't read too much into the silence."),
  ("understatement", "To say the new science lab is an improvement would be an ___; it's in a different league altogether.", "understatement", ["exaggeration", "overstatement", "overestimate"], "An understatement = saying less than the truth."),
  ("handball", "Had the referee not spotted the ___, we'd have lost the final.", "handball", ["foul", "offside", "penalty"], "The referee spotted the handball."),
  ("respect", "With all due ___, Coach, that doesn't actually answer the question.", "respect", ["regard", "honour", "credit"], "With all due respect = a polite disagreement."),
 ], "reading": [
  ("In Praise of Boredom", "Yet psychologists increasingly argue that boredom is not a ___ but a signal: a prompt to seek something more meaningful.", "malfunction", ["weakness", "failure", "problem"], "Not a malfunction: a signal."),
  ("On Letters", "Yet letters were never merely vessels of ___; they were also instruments of control…", "affection", ["emotion", "feeling", "love"], "Vessels of affection, but also instruments of control."),
  ("The Cartographer's Dilemma", "Worse, three 'rivers' turned out to be dry ditches, drawn decades earlier to ___ land claims.", "strengthen", ["support", "prove", "defend"], "Drawn to strengthen land claims."),
  ("The Tin Box", "___ never spoke about the war.", "Grandfather", ["Father", "Grandmother", "Mother"], "Grandfather never spoke of it."),
  ("The Phone Debate", "Look at what happened at ___ School.", "Lindhaven", ["Reyes", "Mbeki", "Riverside"], "The example school: Lindhaven."),
  ("The Octopus Who Escaped", "Inky, a common New Zealand octopus, had lived ___ at the National Aquarium for two years…", "contentedly", ["peacefully", "quietly", "happily"], "He had lived contentedly before the escape."),
  ("In Praise of Boredom", "Every queue, commute and pause is now filled by a glowing ___.", "screen", ["phone", "device", "display"], "A glowing screen."),
  ("The Octopus Who Escaped", "Keepers were not entirely surprised: octopuses are notorious escape ___, capable of unscrewing jar lids…", "artists", ["experts", "specialists", "masters"], "Notorious escape artists."),
 ]},
"c2": {"listening": [
  ("cat out of the bag", "He let the ___ out of the bag about the surprise party.", "cat", ["secret", "news", "truth"], "Let the cat out of the bag = told the secret."),
  ("bearer", "I hate to be the ___ of bad tidings, but the funding has fallen through.", "bearer", ["bringer", "carrier", "messenger"], "The bearer of bad tidings."),
  ("sitting on the fence", "They've been sitting on the ___ for months. It's time they came down on one side or the other.", "fence", ["wall", "bench", "sidelines"], "Sitting on the fence = not deciding."),
  ("resounding", "I'd hardly call it a resounding ___. 'Adequate' was the word she used.", "endorsement", ["recommendation", "approval", "success"], "Not a resounding endorsement = lukewarm."),
  ("persistent", "She's nothing if not ___. She applied seven times before they finally accepted her.", "persistent", ["determined", "stubborn", "patient"], "Persistent = she kept applying."),
  ("marriage of convenience", "Theirs was a marriage of ___ rather than conviction: two parties with nothing in common but a rival.", "convenience", ["necessity", "habit", "calculation"], "A marriage of convenience = for practical reasons."),
  ("believe it when I see it", "A dragon who lends books for free? I'll believe it when I ___ it.", "see", ["hear", "read", "meet"], "I'll believe it when I see it = sceptical."),
  ("fallen through", "I hate to be the bearer of bad tidings, but the funding has fallen ___.", "through", ["away", "apart", "short"], "Fallen through = it won't happen."),
 ], "reading": [
  ("The Apprentice of the Starlight Library", "On her first night as apprentice, she watched, ___, as the shelves of astronomy slid silently into the poetry wing…", "aghast", ["amazed", "horrified", "delighted"], "Aghast = horrified."),
  ("The Apprentice of the Starlight Library", "Nobody had told Ilse that the Starlight Library ___ itself at midnight.", "rearranged", ["moved", "rebuilt", "reordered"], "It rearranged itself."),
  ("The Apprentice of the Starlight Library", "The Head Librarian, ___, merely remarked that the library 'preferred to be read rather than searched'.", "unperturbed", ["unworried", "unmoved", "unconcerned"], "Unperturbed = not bothered."),
  ("On Being Wrong", "There is a peculiar ___, rarely acknowledged, in discovering that one has been wrong.", "pleasure", ["joy", "delight", "satisfaction"], "A peculiar pleasure."),
  ("On Being Wrong", "___, the pleasure arrives late; the first sensation is closer to embarrassment.", "Admittedly", ["However", "Moreover", "Therefore"], "Admittedly introduces a small concession."),
  ("The Weather of Her Sentences", "…the long pause that meant ___, the brisk 'Lovely' that closed a subject for good.", "disappointment", ["happiness", "excitement", "surprise"], "The long pause meant disappointment."),
  ("The Weather of Her Sentences", "We had all learnt to read the ___ of her sentences…", "weather", ["mood", "meaning", "tone"], "Reading the weather of her sentences = her moods."),
  ("The Book That Wrote Back", "The reply was, admittedly, not an answer. It was another ___, sharper than her own.", "question", ["puzzle", "riddle", "thought"], "Another question, not an answer."),
 ]},
}
