# R19 wave 2 (review 2026-11-01): new reading question types for A1–B1, on new kid-topic passages (hand-written).
#   events   – put what happened in order                {type, q, events:[…in story order], explain}
#   tf       – True / False (A1–A2) or True / False / Not given (B1+); every wrong pick gets a note quoting the line
#                                                        {type, q:statement, options, answer, explain, notes, line}
#   findword – tap the word in a line of the text that means …   {type, q, line, answer, explain}
EV = "Put what happened in order. Tap the first thing first."
TF2, TF3 = ["True", "False"], ["True", "False", "Not given"]

def ev(events, ex="Read the text again and follow the time words: first, then, after, at the end."):
    return {"type": "events", "q": EV, "events": events, "explain": ex}

def fw(meaning, line, word, ex=None):
    return {"type": "findword", "q": f"Tap the word that means “{meaning}”.", "line": line, "answer": word,
            "explain": ex or f"“{word}” means {meaning}: “{line.strip()}”"}

def tf(stmt, ans, line=None, why=""):
    return {"_tf": True, "stmt": stmt, "ans": ans, "line": line, "why": why}

def _tf(q, three, kind):
    opts = TF3 if three else TF2
    a = {"T": "True", "F": "False", "NG": "Not given"}[q["ans"]]; line, why = q["line"], q["why"]
    notes = {}
    for o in opts:
        if o == a: continue
        if a == "True": notes[o] = f"The {kind} says: “{line}” So it is true." + (f" {why}" if why else "")
        elif a == "False": notes[o] = (f"Look again: “{line}” {why}" if o == "True" else f"The {kind} does talk about this: “{line}” {why}").strip()
        else: notes[o] = f"The {kind} never says this. {why}"
    ex = f"“{line}”" + (f" {why}" if why else "") if line else why
    out = {"type": "tf", "q": q["stmt"], "options": opts, "answer": opts.index(a), "explain": ex, "notes": notes}
    if line: out["line"] = line
    return out

def P(title, text, *qs, three=False, kind="story"):
    return {"title": title, "text": text, "questions": [_tf(q, three, kind) if q.get("_tf") else q for q in qs]}

A1 = [
 P("Pip's Picnic", "Pip is a little bear. On Saturday he goes to the park with his mum. First they find a big tree. Then Mum opens the basket. They eat sandwiches and red apples. After lunch, Pip plays with a ball. It starts to rain, so they run home. Pip is wet but happy.",
   ev(["They find a big tree.", "They eat sandwiches and apples.", "Pip plays with a ball.", "They run home in the rain."]),
   tf("Pip goes to the park with his dad.", "F", "On Saturday he goes to the park with his mum.", "He goes with his mum, not his dad."),
   tf("Pip eats red apples.", "T", "They eat sandwiches and red apples."),
   tf("Pip is sad at the end.", "F", "Pip is wet but happy.", "He is happy, not sad."),
   fw("a bag or box for carrying food", "Then Mum opens the basket.", "basket")),
 P("Lola's New Fish", "Lola has a new pet. It is a small orange fish. Its name is Bubbles. Every morning, Lola gives Bubbles some food. Bubbles swims round and round. On Sunday, Lola cleans the tank with her brother. Now the water is clean and Bubbles is happy.",
   ev(["Lola gets a new fish.", "Lola gives Bubbles food.", "Lola cleans the tank.", "The water is clean."]),
   tf("The fish is orange.", "T", "It is a small orange fish."),
   tf("Lola cleans the tank with her sister.", "F", "On Sunday, Lola cleans the tank with her brother.", "She cleans it with her brother."),
   tf("Bubbles is a big fish.", "F", "It is a small orange fish.", "Bubbles is small."),
   fw("the glass box where a fish lives", "On Sunday, Lola cleans the tank with her brother.", "tank")),
 P("Snow Day", "It is winter. Ben looks out of the window. Everything is white! There is no school today. Ben puts on his hat, his scarf and his boots. He goes outside with his sister Amy. They make a big snowman. It has a carrot nose. Then they go inside and drink hot chocolate.",
   ev(["Ben looks out of the window.", "Ben puts on his hat and boots.", "They make a snowman.", "They drink hot chocolate."]),
   tf("There is school today.", "F", "There is no school today.", "It's a snow day, so there is no school."),
   tf("The snowman has a carrot nose.", "T", "It has a carrot nose."),
   fw("something warm you wear round your neck", "Ben puts on his hat, his scarf and his boots.", "scarf"),
   fw("out of the house", "He goes outside with his sister Amy.", "outside")),
 P("Mia's Birthday", "Today is Mia's birthday. She is eight. In the morning, her dad makes pancakes. At school, her friends sing \"Happy Birthday\". After school, Mia opens her presents. She gets a book and a purple bike. In the evening, the family eats a big chocolate cake. Mia is very happy.",
   ev(["Dad makes pancakes.", "Her friends sing at school.", "Mia opens her presents.", "The family eats cake."]),
   tf("Mia is nine today.", "F", "She is eight.", "Mia is eight, not nine."),
   tf("Mia gets a purple bike.", "T", "She gets a book and a purple bike."),
   tf("The cake is a lemon cake.", "F", "In the evening, the family eats a big chocolate cake.", "It's a chocolate cake."),
   fw("things people give you on your birthday", "After school, Mia opens her presents.", "presents")),
 P("The Lost Kitten", "Sam hears a small sound in the garden. \"Meow!\" It is a little grey kitten under a bush. The kitten is cold and hungry. Sam gives it some milk. Then he puts a poster on the wall: \"Is this your kitten?\" The next day, a girl comes to the door. \"That's my kitten, Smoky!\" she says. She says thank you to Sam.",
   ev(["Sam hears a sound in the garden.", "Sam gives the kitten milk.", "Sam puts up a poster.", "A girl comes for her kitten."]),
   tf("The kitten is under a bush.", "T", "It is a little grey kitten under a bush."),
   tf("The kitten is black.", "F", "It is a little grey kitten under a bush.", "The kitten is grey."),
   fw("wanting food", "The kitten is cold and hungry.", "hungry"),
   fw("a big paper sign for a wall", "Then he puts a poster on the wall:", "poster")),
 P("At the Farm", "Our class visits a farm. The farmer's name is Mr Green. He has cows, pigs and lots of hens. First, we feed the hens. Then we see a baby cow. It is only two days old! At twelve o'clock we eat lunch on the grass. Before we go home, Mr Green gives us eggs to take home.",
   ev(["We feed the hens.", "We see a baby cow.", "We eat lunch on the grass.", "Mr Green gives us eggs."]),
   tf("The farmer is called Mr Brown.", "F", "The farmer's name is Mr Green.", "His name is Mr Green."),
   tf("The baby cow is two days old.", "T", "It is only two days old!"),
   tf("We eat lunch in the farmhouse.", "F", "At twelve o'clock we eat lunch on the grass.", "We eat outside, on the grass."),
   fw("birds that give us eggs", "He has cows, pigs and lots of hens.", "hens")),
 P("Rainy Saturday", "It rains all day on Saturday. Leo can't play football in the park. He is bored. Then Grandma comes. She has a box of paints. Leo and Grandma paint a big rainbow. They put it on the fridge. \"Now we have sun inside!\" says Grandma. Leo laughs.",
   ev(["Leo is bored.", "Grandma comes with paints.", "They paint a rainbow.", "They put it on the fridge."]),
   tf("Leo plays football on Saturday.", "F", "Leo can't play football in the park.", "It rains, so he can't play."),
   tf("Grandma has a box of paints.", "T", "She has a box of paints."),
   fw("with nothing fun to do", "He is bored.", "bored"),
   fw("the cold cupboard in the kitchen", "They put it on the fridge.", "fridge")),
 P("The Toy Robot", "Zoe has a toy robot. It is silver and blue. It can walk, talk and dance. Its name is Zip. One day, Zip stops. Zoe is sad. Her mum looks at the robot. \"It needs new batteries,\" she says. Zoe puts in new batteries, and Zip dances again!",
   ev(["Zip stops.", "Mum looks at the robot.", "Zoe puts in new batteries.", "Zip dances again."]),
   tf("The robot can dance.", "T", "It can walk, talk and dance."),
   tf("The robot is red.", "F", "It is silver and blue.", "Zip is silver and blue."),
   tf("Dad fixes the robot.", "F", "Her mum looks at the robot.", "Mum helps, and Zoe puts in the batteries."),
   fw("small things that give a toy power", "It needs new batteries,", "batteries")),
 P("Swimming Day", "Every Wednesday, Ana goes to the pool. She can swim very well. Her little brother Tom can't swim yet. Today Ana helps Tom. He holds a float and kicks his legs. \"Look, I'm swimming!\" says Tom. After swimming, they have a hot shower and eat a banana.",
   ev(["Ana helps Tom.", "Tom holds a float and kicks.", "Tom says he is swimming.", "They have a hot shower."]),
   tf("Ana goes to the pool on Wednesdays.", "T", "Every Wednesday, Ana goes to the pool."),
   tf("Tom can swim very well.", "F", "Her little brother Tom can't swim yet.", "Ana swims well; Tom is still learning."),
   tf("They eat an apple after swimming.", "F", "After swimming, they have a hot shower and eat a banana.", "They eat a banana."),
   fw("a thing that helps you stay on top of the water", "He holds a float and kicks his legs.", "float")),
]

A2 = [
 P("The Aquarium Trip", "Last Friday, Class 4 went to the aquarium. They travelled by bus and the journey took an hour. First, they saw a huge tank full of sharks. Jack was a bit scared, but the sharks just swam slowly. Then they visited the touch pool, where they held a starfish. It felt rough, like sandpaper. At lunchtime it was sunny, so they ate outside. Before they left, everyone bought a postcard in the gift shop.",
   ev(["They saw the sharks.", "They held a starfish.", "They ate lunch outside.", "They bought postcards."]),
   tf("The bus journey took an hour.", "T", "They travelled by bus and the journey took an hour."),
   tf("The starfish felt smooth.", "F", "It felt rough, like sandpaper.", "Rough is the opposite of smooth."),
   tf("Jack was a little afraid of the sharks.", "T", "Jack was a bit scared, but the sharks just swam slowly.", "A bit scared = a little afraid."),
   fw("very, very big", "First, they saw a huge tank full of sharks.", "huge")),
 P("Grandpa's Garden", "Every summer, Nina stays with her grandpa in the countryside. This year, he gave her a small part of his garden. \"This is yours,\" he said. Nina planted carrots, beans and sunflowers. She watered them every evening. At first nothing happened, and she was disappointed. But after two weeks, little green shoots appeared. By August, her sunflowers were taller than Grandpa! She took a photo and sent it to her mum.",
   ev(["Grandpa gave Nina part of his garden.", "Nina planted vegetables and flowers.", "Little green shoots appeared.", "Nina sent a photo to her mum."]),
   tf("Nina watered her plants every morning.", "F", "She watered them every evening.", "She watered them in the evening."),
   tf("The sunflowers grew taller than Grandpa.", "T", "By August, her sunflowers were taller than Grandpa!"),
   tf("Nina spends her summers in the city.", "F", "Every summer, Nina stays with her grandpa in the countryside.", "She stays in the countryside."),
   fw("sad because something wasn't as good as you hoped", "At first nothing happened, and she was disappointed.", "disappointed")),
 P("The Bake Sale", "Our school wanted to buy new books for the library, so we had a bake sale. On Thursday evening, Dad and I made thirty cupcakes. We put pink icing and sprinkles on top. On Friday, I carried them to school in a big box. The sale started at break time. People loved the cupcakes and we sold all of them in ten minutes! Altogether, the school made two hundred pounds.",
   ev(["Dad and I made cupcakes.", "We decorated them.", "I carried them to school.", "We sold all the cupcakes."]),
   tf("The money was for new library books.", "T", "Our school wanted to buy new books for the library, so we had a bake sale."),
   tf("We made the cupcakes on Friday.", "F", "On Thursday evening, Dad and I made thirty cupcakes.", "We made them the evening before, on Thursday."),
   tf("It took an hour to sell the cupcakes.", "F", "People loved the cupcakes and we sold all of them in ten minutes!", "They were gone in ten minutes."),
   fw("the sweet sugary layer on top of a cake", "We put pink icing and sprinkles on top.", "icing")),
 P("The Treehouse", "Last spring, Omar and his dad built a treehouse in the old oak tree. They used wood from an old fence. Dad cut the wood and Omar painted it green. It took three weekends. On the last day, Omar's dad hung a rope ladder from the door. That night, Omar asked if he could sleep in the treehouse. Dad said yes, so they took sleeping bags and a torch. Omar didn't sleep much because an owl hooted all night!",
   ev(["Dad cut the wood.", "Omar painted the wood.", "Dad hung a rope ladder.", "They slept in the treehouse."]),
   tf("Omar painted the treehouse blue.", "F", "Dad cut the wood and Omar painted it green.", "He painted it green."),
   tf("Building the treehouse took three weekends.", "T", "It took three weekends."),
   tf("Omar slept very well in the treehouse.", "F", "Omar didn't sleep much because an owl hooted all night!", "The owl kept him awake."),
   fw("a small electric light you carry", "Dad said yes, so they took sleeping bags and a torch.", "torch")),
 P("A Day Without Screens", "Last Sunday, my family tried a day without screens. No TV, no phones and no games! At breakfast my sister complained, \"This is going to be so boring.\" But then Mum found an old board game in the cupboard. We played it for two hours and laughed a lot. In the afternoon we cycled to the lake and fed the ducks. In the evening Dad read us a story. My sister said it was the best Sunday ever.",
   ev(["My sister complained at breakfast.", "We played a board game.", "We cycled to the lake.", "Dad read us a story."]),
   tf("The family watched TV in the evening.", "F", "In the evening Dad read us a story.", "There was no TV that day."),
   tf("Mum found the board game in the cupboard.", "T", "But then Mum found an old board game in the cupboard."),
   tf("In the end, the sister enjoyed the day.", "T", "My sister said it was the best Sunday ever.", "The best Sunday ever = she really enjoyed it."),
   fw("said she was unhappy about something", "At breakfast my sister complained,", "complained")),
 P("The Football Final", "On Saturday, the Greenfield Tigers played in the under-11 final. At half-time they were losing 1–0. The coach told them, \"Don't give up. Pass the ball more!\" In the second half, Maya scored with her left foot. Then, two minutes before the end, Leo headed the ball into the net. The Tigers won 2–1! After the match, the players got gold medals and ate pizza together.",
   ev(["The Tigers were losing at half-time.", "Maya scored a goal.", "Leo scored a goal.", "The players got medals."]),
   tf("Maya scored with her right foot.", "F", "In the second half, Maya scored with her left foot.", "She used her left foot."),
   tf("The Tigers won the final.", "T", "The Tigers won 2–1!"),
   tf("Leo scored near the end of the match.", "T", "Then, two minutes before the end, Leo headed the ball into the net.", "Two minutes before the end = near the end."),
   fw("the person who trains a sports team", "The coach told them,", "coach")),
 P("The Library Mystery", "When Ella went to the school library on Monday, she noticed something strange. All the animal books were on the floor! The librarian, Mrs Hall, looked worried. The next morning, the same thing happened. So Ella and her friend hid behind a shelf after school. At five o'clock they heard a noise. It was the school cat, Biscuit! He jumped onto the shelf to sleep in the warm sunshine and pushed the books off.",
   ev(["Ella found books on the floor.", "It happened again the next morning.", "Ella and her friend hid.", "They found Biscuit the cat."]),
   tf("The books on the floor were about animals.", "T", "All the animal books were on the floor!"),
   tf("Ella hid on her own.", "F", "So Ella and her friend hid behind a shelf after school.", "She hid with her friend."),
   tf("Biscuit wanted to read the books.", "F", "He jumped onto the shelf to sleep in the warm sunshine and pushed the books off.", "He wanted to sleep in the sun."),
   fw("unusual or surprising", "she noticed something strange.", "strange")),
 P("Learning to Skate", "Last winter, Kai went ice skating for the first time. He was nervous because he couldn't stand up at first. He fell over five times in ten minutes! His cousin Lily held his hand and showed him how to bend his knees. Slowly, Kai began to glide. By the end of the hour, he could skate all the way round the rink without help. Now he goes every Saturday.",
   ev(["Kai fell over many times.", "Lily held his hand.", "Kai began to glide.", "Kai skated round the rink alone."]),
   tf("Kai skated well the first time.", "F", "He was nervous because he couldn't stand up at first.", "At first he couldn't even stand up."),
   tf("Lily is Kai's cousin.", "T", "His cousin Lily held his hand and showed him how to bend his knees."),
   tf("Kai goes skating on Sundays now.", "F", "Now he goes every Saturday.", "He goes on Saturdays."),
   fw("the ice area where people skate", "he could skate all the way round the rink without help.", "rink")),
 P("The Rescue Dog", "Last month the Patel family adopted a dog from an animal shelter. Her name is Daisy and she is three years old. At first Daisy was very shy. She hid under the table and didn't eat much. The children were patient. They talked to her softly and gave her treats. After a week, Daisy started wagging her tail. Now she follows the children everywhere and sleeps at the end of Priya's bed.",
   ev(["The family adopted Daisy.", "Daisy hid under the table.", "The children gave her treats.", "Daisy started wagging her tail."]),
   tf("Daisy is three years old.", "T", "Her name is Daisy and she is three years old."),
   tf("Daisy was very friendly at first.", "F", "At first Daisy was very shy.", "She was shy at first."),
   fw("took an animal home to be part of the family", "Last month the Patel family adopted a dog from an animal shelter.", "adopted"),
   fw("able to wait calmly", "The children were patient.", "patient")),
]

def B(title, text, *qs): return P(title, text, *qs, three=True, kind="text")
B1 = [
 B("The Robot Competition", "In March, Aisha's school entered a national robot competition. Her team of four had to build a robot that could sort recycling into paper, plastic and metal. They spent six weeks working on it after school. The first version kept dropping the plastic bottles, so Aisha redesigned the robot's arm using a softer grip. On the day of the competition, the robot sorted twenty items in two minutes without a single mistake. The team came second out of thirty schools, and the judges especially praised the clever arm. Aisha says the best part wasn't the prize, but learning that failing is part of building something.",
   ev(["The team started building the robot.", "The robot kept dropping bottles.", "Aisha changed the robot's arm.", "The team came second."]),
   tf("There were four people in Aisha's team.", "T", "Her team of four had to build a robot that could sort recycling into paper, plastic and metal."),
   tf("Aisha's team won the competition.", "F", "The team came second out of thirty schools,", "Second place is not first."),
   tf("Aisha wants to be an engineer when she grows up.", "NG", None, "The text says what she learned, but nothing about the job she wants."),
   fw("made a new plan or shape for something", "so Aisha redesigned the robot's arm using a softer grip.", "redesigned")),
 B("Camping in the Rain", "Last summer, Finn's scout group went camping in Wales for three nights. The forecast said sunshine, but on the first night a storm arrived. Water got into two of the tents, so everyone squeezed into the biggest tent and told ghost stories until midnight. The next morning, the leaders hung the wet sleeping bags on a rope between two trees. By lunchtime the sun was out and everything was dry. On the last day the group climbed a hill and saw the sea. Finn says the storm was actually the most fun part of the trip.",
   ev(["A storm arrived on the first night.", "Everyone squeezed into the biggest tent.", "The leaders hung up the wet sleeping bags.", "The group climbed a hill."]),
   tf("The weather forecast was wrong.", "T", "The forecast said sunshine, but on the first night a storm arrived.", "Sunshine was forecast, but a storm came."),
   tf("All of the tents got wet.", "F", "Water got into two of the tents,", "Only two tents got wet."),
   tf("It was Finn's first camping trip.", "NG", None, "The text doesn't say whether Finn had been camping before."),
   fw("pushed together into a small space", "so everyone squeezed into the biggest tent", "squeezed")),
 B("The Kindness Jar", "Mr Okafor's class started a kindness jar in September. Every time someone noticed a classmate doing something kind, they wrote it on a slip of paper and put it in the jar. At first, the notes were about small things, like lending a pencil. Later, they became more thoughtful: someone helped a new student who didn't speak much English, and two boys organised a litter pick in the playground. When the jar was full in December, the class read all the notes aloud. Many children said they hadn't realised others had noticed their kindness. The class used the jar again the next term.",
   ev(["The class started the jar.", "The notes were about small things.", "Two boys organised a litter pick.", "The class read the notes aloud."]),
   tf("The jar was full by December.", "T", "When the jar was full in December, the class read all the notes aloud."),
   tf("Mr Okafor wrote all the notes.", "F", "Every time someone noticed a classmate doing something kind, they wrote it on a slip of paper and put it in the jar.", "The children wrote the notes about each other."),
   tf("The new student came from Spain.", "NG", None, "We know the student didn't speak much English, but not where they came from."),
   tf("The class stopped using the jar after December.", "F", "The class used the jar again the next term.", "They used it again."),
   fw("showing careful thought for others", "Later, they became more thoughtful:", "thoughtful")),
 B("The Hedgehog Highway", "Hedgehogs are becoming rarer in Britain, partly because garden fences are too high and solid for them to get through. Twelve-year-old Ruby read about this problem and decided to act. With her neighbours' permission, she cut small holes, about the size of a CD, at the bottom of six garden fences on her street. This created a \"hedgehog highway\". She also put out shallow dishes of water, because hedgehogs often get thirsty in hot weather. A few weeks later, a camera in her garden filmed two hedgehogs passing through at night. Ruby now gives talks at local schools about how to help wildlife.",
   ev(["Ruby read about the problem.", "Ruby cut holes in the fences.", "A camera filmed two hedgehogs.", "Ruby gives talks at schools."]),
   tf("Ruby asked her neighbours before cutting the holes.", "T", "With her neighbours' permission, she cut small holes,", "Permission = they said yes first."),
   tf("The holes were as big as a football.", "F", "about the size of a CD,", "They were only CD-sized."),
   tf("Ruby feeds the hedgehogs cat food.", "NG", None, "The text mentions dishes of water, but nothing about food."),
   fw("becoming less common", "Hedgehogs are becoming rarer in Britain,", "rarer")),
 B("My First Concert", "Last month, Jas played the violin in a concert for the first time. She had practised a difficult piece for weeks, but on the night her hands were shaking. Just before she went on stage, her teacher told her to breathe slowly and look at a friendly face. Jas found her grandmother in the second row and started to play. In the middle she missed a note, but she kept going and nobody seemed to notice. At the end the audience clapped loudly. Afterwards, Jas realised that being nervous hadn't stopped her playing well.",
   ev(["Jas practised for weeks.", "Her teacher gave her advice.", "Jas missed a note.", "The audience clapped."]),
   tf("Jas felt nervous on the night of the concert.", "T", "but on the night her hands were shaking.", "Shaking hands show she was nervous."),
   tf("Jas stopped playing after her mistake.", "F", "In the middle she missed a note, but she kept going", "She kept going."),
   tf("Jas's grandmother plays the violin too.", "NG", None, "We only know where her grandmother sat, not what she plays."),
   fw("moving quickly because of fear or cold", "but on the night her hands were shaking.", "shaking")),
 B("The Lost Phone", "On the way home from school, Daniel found a phone lying on a bench in the park. It was locked, so he couldn't call anyone. Instead of keeping it, he waited, hoping the owner would come back. After twenty minutes, the phone rang. A worried woman said it was hers and that it had fallen out of her bag while she was jogging. Soon she arrived, out of breath, and thanked Daniel. The next week, a card arrived at his school. Inside was a thank-you note and a voucher for the cinema.",
   ev(["Daniel found a phone.", "The phone rang.", "The woman arrived.", "A card arrived at his school."]),
   tf("Daniel couldn't unlock the phone.", "T", "It was locked, so he couldn't call anyone."),
   tf("The woman lost her phone while she was shopping.", "F", "A worried woman said it was hers and that it had fallen out of her bag while she was jogging.", "She was jogging, not shopping."),
   tf("Daniel went to the cinema with his brother.", "NG", None, "He got a cinema voucher, but the text doesn't say who he went with."),
   fw("anxious and upset", "A worried woman said it was hers", "worried")),
 B("Volcano Island", "Iceland is an island in the North Atlantic with more than thirty active volcanoes. In 2010, one of them erupted and sent a huge cloud of ash into the sky. For almost a week, thousands of flights across Europe were cancelled, because ash can damage plane engines. Surprisingly, very few people in Iceland were hurt, because scientists had warned nearby farmers in time. Today, tourists visit the volcano and can even buy small jars of its ash as souvenirs.",
   ev(["The volcano erupted.", "Flights across Europe were cancelled.", "Tourists started to visit the volcano."]),
   tf("Iceland has more than thirty active volcanoes.", "T", "Iceland is an island in the North Atlantic with more than thirty active volcanoes."),
   tf("Many people in Iceland were hurt.", "F", "Surprisingly, very few people in Iceland were hurt,", "Very few were hurt, thanks to the warning."),
   tf("The ash cloud reached America.", "NG", None, "The text talks about flights across Europe, but says nothing about America."),
   fw("things you buy to remember a place", "can even buy small jars of its ash as souvenirs.", "souvenirs")),
 B("The Weekly Owl", "In Year 7, Leah started a newspaper for her class called The Weekly Owl. Every Friday, four pupils wrote articles about school news, sport results and funny stories. Leah was the editor, which meant she checked every article before it was printed. The hardest part was meeting the deadline: once, the printer broke on Thursday night and they had to copy every page by hand. By the end of the year, other classes were asking to read it too, so the head teacher put copies in the school library.",
   ev(["Leah started The Weekly Owl.", "The printer broke one Thursday.", "They copied the pages by hand.", "Copies went into the library."]),
   tf("Leah wrote all the articles herself.", "F", "Every Friday, four pupils wrote articles about school news, sport results and funny stories.", "Four pupils wrote; Leah checked."),
   tf("Other classes wanted to read the newspaper.", "T", "By the end of the year, other classes were asking to read it too,"),
   tf("The newspaper cost 50p.", "NG", None, "The text never mentions a price."),
   fw("the latest time by which something must be finished", "The hardest part was meeting the deadline:", "deadline")),
 B("A Week Without Plastic", "For one week, Theo's family tried to buy nothing wrapped in plastic. It was harder than they expected. At the supermarket, almost all the fruit came in plastic bags, so they went to the market instead and used their own cloth bags. Theo's dad bought shampoo in a solid bar, like soap. The biggest problem was snacks: Theo's favourite crisps only came in plastic packets, so he baked oat biscuits with his mum. At the end of the week their bin was half empty. They decided to keep some of the changes for good.",
   ev(["The family started the challenge.", "They shopped at the market.", "Their bin was half empty.", "They decided to keep some changes."]),
   tf("The challenge was easy for the family.", "F", "It was harder than they expected.", "It was harder than they thought."),
   tf("Theo made biscuits with his mum.", "T", "so he baked oat biscuits with his mum."),
   tf("The market was closer than the supermarket.", "NG", None, "The text doesn't say how far away either shop was."),
   fw("small bags that food is sold in", "Theo's favourite crisps only came in plastic packets,", "packets")),
]
READ = {"a1": {"reading": {"passages": A1}}, "a2": {"reading": {"passages": A2}}, "b1": {"reading": {"passages": B1}}}
