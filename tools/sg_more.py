"""🦁 BRIEF-T8: more Singapore, fairly. Extra items for the existing three games (Join It Up / Spot & Fix / Story Gaps).
Local settings: hawker centres, MRT, HDB blocks, void decks, school canteen, CCA. Festivals: Chinese New Year, Hari Raya,
Deepavali, Christmas, Racial Harmony Day, National Day — described by what families do, eat, wear and share, never by
doctrine. Names from all communities. Mature topics only in jc/adult (none here).
Shapes identical to tools/sg_synth.py (S), tools/sg_edit.py (E), tools/sg_cloze.py (C)."""
from sg_synth import S
from sg_edit import E
from sg_cloze import C

MORE_SYNTH = {
 "p2": [
  S("We went to the MRT station.", "We took the train to school.", "We went to the MRT station", ["and took the train to school"], "Join the two things with 'and'.", ["and"]),
  S("My flat is in an HDB block.", "My flat is on the tenth floor.", "My flat is in an HDB block", ["on the tenth floor"], "Use 'on' for the floor: on the tenth floor.", ["on"]),
  S("I ate lunch at the school canteen.", "I ate lunch with my friends.", "I ate lunch at the school canteen", ["with my friends"], "Use 'with' for the people you were with.", ["with"]),
  S("Ali plays football.", "Ali plays football for his CCA.", "Ali plays football", ["for his CCA"], "Use 'for' for the group: for his CCA.", ["for"]),
 ],
 "p4": [
  S("We visited Grandpa on Chinese New Year.", "We brought him mandarin oranges.", "We visited Grandpa on Chinese New Year", ["and brought him mandarin oranges"], "Use 'and' to add the second thing we did.", ["and"]),
  S("The void deck is quiet in the morning.", "The void deck is busy in the evening.", "The void deck is quiet in the morning", ["but busy in the evening"], "Use 'but' when the second part is different.", ["but"]),
  S("Mei Ling lives near the MRT station.", "Mei Ling walks to the MRT station every day.", "Mei Ling lives near the MRT station", ["so she walks there every day"], "Use 'so' for the result of the first part.", ["so"]),
 ],
 "p5": [
  S("Aisyah's family celebrates Hari Raya.", "Aisyah's family visits her grandparents.", "Aisyah's family celebrates Hari Raya", ["by visiting her grandparents"], "Use 'by' + -ing for how they celebrate.", ["by"]),
  S("We had a Christmas party at the void deck.", "Everyone brought some food.", "We had a Christmas party at the void deck", ["and everyone brought some food"], "Use 'and' to add one more thing.", ["and"]),
 ],
 "p6": [
  S("Ravi helped to put up the Deepavali decorations.", "Ravi helped at the community centre.", "Ravi helped to put up the Deepavali decorations", ["at the community centre"], "Use 'at' for the place: at the community centre.", ["at"]),
  S("The National Day parade was on television.", "We watched the National Day parade together.", "The National Day parade was on television", ["so we watched it together"], "Use 'so' for the result.", ["so"]),
 ],
 "s1": [
  S("The hawker centre is near my block.", "I often eat at the hawker centre.", "The hawker centre is near my block", ["so I often eat there"], "Use 'so' for the result; 'there' = that place.", ["so"]),
  S("Priya made a kolam at her doorway.", "Priya made a kolam for Deepavali.", "Priya made a kolam at her doorway", ["for Deepavali"], "Use 'for' for the festival.", ["for"]),
 ],
 "s2": [
  S("Nurul wore her baju kurung.", "Nurul wore her baju kurung on Hari Raya.", "Nurul wore her baju kurung", ["on Hari Raya"], "Use 'on' for the day: on Hari Raya.", ["on"]),
  S("Our class sang National Day songs.", "Our class sang National Day songs during assembly.", "Our class sang National Day songs", ["during assembly"], "Use 'during' for the time: during assembly.", ["during"]),
 ],
 "s3": [
  S("Wei Jie's family cleaned their flat.", "Chinese New Year was coming.", "Wei Jie's family cleaned their flat", ["because Chinese New Year was coming"], "Use 'because' to give the reason.", ["because"]),
  S("The CCA fair was held in the school hall.", "Many pupils signed up for a CCA.", "The CCA fair was held in the school hall", ["and many pupils signed up for a CCA"], "Join the two facts with 'and'.", ["and"]),
 ],
 "s4": [
  S("The void-deck party was organised by the residents' committee.", "Everyone was invited.", "The void-deck party was organised by the residents' committee", ["and everyone was invited"], "Add the second fact with 'and'.", ["and"]),
  S("The Deepavali bazaar was colourful.", "The Deepavali bazaar was full of music.", "The Deepavali bazaar was", ["colourful and full of music"], "Join the two phrases with 'and'.", ["and"]),
 ],
 "jc1": [
  S("The reunion dinner was at Grandma's flat.", "The reunion dinner was on the eve of Chinese New Year.", "The reunion dinner was at Grandma's flat", ["on the eve of Chinese New Year"], "Use 'on' for the special evening.", ["on"]),
  S("The hawker centre was renovated last year.", "The hawker centre is cleaner now.", "The hawker centre was renovated last year", ["and is cleaner now"], "Join with 'and'; the second verb shares the subject.", ["and"]),
  S("The CCA open house starts at three.", "The CCA open house ends at five.", "The CCA open house starts at three", ["and ends at five"], "Join the two times with 'and'.", ["and"]),
 ],
 "jc2": [
  S("The National Day rally was broadcast live.", "Many families watched it at home.", "The National Day rally was broadcast live", ["so many families watched it at home"], "Use 'so' for the result.", ["so"]),
  S("The MRT line was extended last year.", "More residents can travel to the city easily.", "The MRT line was extended last year", ["so more residents can travel to the city easily"], "Use 'so' for what the change made possible.", ["so"]),
 ],
 "adult": [
  S("My neighbours gave us pineapple tarts.", "They gave them to us for Chinese New Year.", "My neighbours gave us pineapple tarts", ["for Chinese New Year"], "Use 'for' to say which occasion it was for.", ["for"]),
  S("The kopitiam opens at six in the morning.", "The kopitiam is already busy by seven.", "The kopitiam opens at six in the morning", ["and is already busy by seven"], "Join the two facts with 'and'.", ["and"]),
  S("The community centre hosts a Hari Raya open house.", "Everyone in the neighbourhood is welcome.", "The community centre hosts a Hari Raya open house", ["and everyone in the neighbourhood is welcome"], "Add the second fact with 'and'.", ["and"]),
 ],
}

MORE_EDIT = {
 "p2": [
  E("Hari Raya at Grandma's House", "On Hari Raya, Aisyah and her family {g:visit>visited|Past tense: visited.} her grandparents. She wore her new baju kurung and helped to serve {s:kuay>kueh|Kueh is a kind of small cake: k-u-e-h.} to the guests. Everyone {g:was>were|More than one person, in the past: were.} happy to see one another."),
 ],
 "p3": [
  E("Deepavali Lights in Little India", "Last Deepavali, Priya and her mother went to Little India to buy {s:flowrs>flowers|Flowers: f-l-o-w-e-r-s.} for their doorway. The streets were full of lights and music. They {g:buy>bought|Past tense: bought.} some murukku to share with their neighbours."),
  E("National Day at Our Void Deck", "On National Day, our block had a small party at the void deck. Mr Tan hung little flags and we {g:sing>sang|Past tense: sang.} our favourite songs together. The children {s:waveed>waved|Waved: w-a-v-e-d.} their flags happily."),
 ],
 "p4": [
  E("Our Deepavali Kolam", "For Deepavali, Kavya and her sister made a kolam at their doorway with coloured rice. It {g:take>took|Past tense: took.} them an hour to finish the pattern. Their mother said it was the most {s:beatiful>beautiful|Beautiful: b-e-a-u-t-i-f-u-l.} one they had ever made."),
 ],
 "p5": [
  E("Our National Day Concert", "On National Day, our school held a concert in the hall. We {g:watch>watched|Past tense: watched.} a video about how Singapore grew, and then we sang together. Our teacher said that being kind to one another is the best way to show we {s:crae>care|Care is spelt c-a-r-e.}."),
 ],
 "p6": [
  E("Hari Raya with Grandma", "During Hari Raya, Nurul and her cousins helped Grandma cook rendang for the family. Everyone {g:bring>brought|Past tense: brought.} something to share. After dinner, they sat together and listened to Grandpa's stories about how he {s:celebratd>celebrated|Celebrated: cel-e-brat-ed.} when he was young."),
 ],
 "s1": [
  E("Getting Ready for Deepavali", "Before Deepavali, Arjun and his family cleaned their flat and put up bright decorations. His mother {g:make>made|Past tense: made.} a kolam at the doorway. On the day itself, they {s:visted>visited|Visited: vis-it-ed.} their relatives and shared sweets."),
 ],
 "s2": [
  E("Chinese New Year Visiting", "On the first day of Chinese New Year, Mei Ling and her parents {g:visit>visited|Past tense: visited.} her aunt's flat in Tampines. They exchanged mandarin oranges and the children received red packets. Everyone {s:wisht>wished|Wished: w-i-s-h-e-d.} one another good health."),
  E("Our Hari Raya Open House", "For Hari Raya, Faizal's family held an open house and invited their neighbours. His mother {g:cook>cooked|Past tense: cooked.} a big pot of lontong, and Faizal helped to serve the guests. Everyone {s:enjoyd>enjoyed|Enjoyed: en-joy-ed.} the food and the company."),
 ],
 "s3": [
  E("A Christmas Party for Everyone", "Last Christmas, our community centre held a party for the children in the neighbourhood. Volunteers {g:decorate>decorated|Past tense: decorated.} the hall with paper stars, and we {s:exchaged>exchanged|Exchanged: ex-chang-ed.} small gifts. There was plenty of food for everyone."),
 ],
 "s4": [
  E("Food from Our Homes", "On Racial Harmony Day, our class shared food from our different homes. Siti {g:bring>brought|Past tense: brought.} kueh, Ravi brought murukku, and I brought pineapple tarts. We {s:lernt>learnt|Learnt: l-e-a-r-n-t.} to appreciate one another's cultures."),
 ],
 "jc1": [
  E("Our Polytechnic Deepavali Exhibition", "For Deepavali, the Indian cultural society at my polytechnic held a small exhibition. We {g:explain>explained|Past tense: explained.} the meaning of the festival to our classmates and {s:sharred>shared|Shared: s-h-a-r-e-d.} traditional snacks. It was a good way to learn from one another."),
 ],
 "jc2": [
  E("Our National Day Ceremony", "On National Day, our junior college held an observance ceremony in the hall. We {g:recite>recited|Past tense: recited.} the pledge together and watched a performance by the dance club. It reminded us how much we {s:shair>share|Share: s-h-a-r-e.} as one people."),
 ],
 "adult": [
  E("A Hari Raya Lunch at Work", "For Hari Raya, my colleagues and I organised a small gathering at the office. We {g:order>ordered|Past tense: ordered.} food from a nearby Malay restaurant and {s:invitd>invited|Invited: in-vit-ed.} everyone to join us. It was a pleasant way to celebrate together."),
 ],
}

MORE_CLOZE = {
 "p3": [
  C("Visiting Grandma on Hari Raya", "On Hari Raya, Aisyah woke up early and put on her new baju kurung. Her family went to visit her grandparents, {who|A word for people: her grandparents, WHO live nearby.} live nearby. She greeted them politely and {received|She received a small gift.} a small gift. Everyone was happy to be {together|Being with one another: together.}."),
 ],
 "p4": [
  C("Our Void-Deck Christmas Party", "Last Christmas, our block had a party at the void deck. Mr and Mrs Tan brought a big log cake, and the children {helped|They helped to put up the decorations.} to put up paper decorations. We sang songs and {played|We played games.} games together. Everyone had a {wonderful|A word for a very good time: wonderful.} time."),
 ],
 "p5": [
  C("Our Deepavali Shopping Trip", "Before Deepavali, Priya and her mother went to Little India to buy flowers and sweets. The shops were {full|Full of something: full of colour.} of colour and music. At home, they made a kolam at the doorway {with|With coloured rice.} coloured rice. On the day itself, they {visited|They visited them.} their relatives and shared the sweets."),
 ],
 "p6": [
  C("Watching the Fireworks Together", "On National Day, our block held a small celebration at the void deck. The residents' committee put up flags, and everyone {brought|They brought food.} some food to share. We sang our favourite National Day songs and watched the fireworks {from|From the void deck.} the void deck. It was a lovely way to {celebrate|What did we do on National Day? Celebrat} together."),
 ],
 "s1": [
  C("Our National Day Concert at School", "On National Day, our school held a concert in the hall. We watched a video about Singapore's history and {then|What came next? Then we sang.} sang our favourite songs. Our teacher reminded us to be {kind|Being good to one another: kind.} to one another, because that is how we build a {caring|A word for a kind community: caring.} society."),
 ],
 "s2": [
 ],
 "s3": [
  C("Our Community Deepavali Open House", "For Deepavali, our community centre held an open house. Volunteers {explained|They explained the festival.} the meaning of the festival to visitors, and there were {plenty|Plenty of something: plenty of food.} of food and drinks. Everyone {enjoyed|They enjoyed the celebration.} the celebration."),
 ],
 "s4": [
  C("Sharing Food on Racial Harmony Day", "On Racial Harmony Day, our class shared food from our different homes. We learnt about one {another's|One another's cultures.} cultures and why it is {important|It is important.} to respect them. By the end of the day, we {understood|We understood one another better.} one another better."),
 ],
 "jc1": [
 ],
 "jc2": [
 ],
 "adult": [
 ],
}
