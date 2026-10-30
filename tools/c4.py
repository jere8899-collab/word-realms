# C4 (review 2026-10-30): listening that tests understanding. From A2 up, a right option that repeated the recording word for
# word is replaced by a paraphrase (the distractors keep the words you hear, so word-matching no longer works).
# key: the recording ("say") -> (new right option, explanation)
C4P = {
 "Excuse me, how do I get to the station? — Go straight on and take the second street on the left.": ("two streets along, on the left", "'The second street on the left' = two streets along, on the left."),
 "I usually walk to school, but today I'm going by bike because I'm late.": ("by bicycle", "Usually he walks, but today: 'by bike' = by bicycle."),
 "The swimming pool is closed on Mondays for cleaning.": ("so it can be cleaned", "'Closed for cleaning' = closed so it can be cleaned."),
 "You can borrow three books for two weeks.": ("14 days", "Two weeks = 14 days. Three is the number of books."),
 "Go straight on and take the second turning on the left. The bank's opposite the library.": ("across from the library", "Opposite = across from."),
 "Sorry I'm late. There was an accident on the motorway.": ("There was a crash on the road.", "An accident on the motorway = a crash on the road."),
 "I don't mind cooking, but I really hate washing up afterwards.": ("cleaning the dishes", "Washing up = cleaning the dishes. 'I don't mind cooking' = cooking is OK."),
 "If you'd like a refund, you'll need to bring the receipt within thirty days.": ("proof that you bought it", "A receipt is proof that you bought it."),
 "The museum's free on Sundays, so it's usually packed. I'd go on a weekday if I were you.": ("Go from Monday to Friday.", "A weekday = Monday to Friday. Sunday is free but packed (very busy)."),
 "It's a really good phone, although the battery doesn't last very long.": ("how long it stays charged", "The battery doesn't last = it doesn't stay charged for long."),
 "I was planning to study medicine, but I've decided to become a vet instead.": ("an animal doctor", "She changed her mind: a vet = an animal doctor."),
 "The first prize is a weekend in Paris, and the runner-up gets a camera.": ("something to take photos with", "The runner-up (second place) gets a camera = something to take photos with."),
 "I'm not really into horror films. Could we watch a comedy instead?": ("something funny", "A comedy = something funny. 'Not really into' = doesn't like."),
 "The project was due on Friday, but they've given us an extension until Wednesday.": ("five days later than planned", "Friday → the next Wednesday = five days later."),
 "Apparently the ferry's been cancelled due to high winds, so we'll have to stay another night.": ("spend one more night where they are", "'Stay another night' = spend one more night where they are."),
}
# new monologue items with numbers, times and changes of mind
C4NEW = {
 "a2": [
  {"type": "listen", "say": "The party starts at three. Oh, sorry, I'm wrong. It's at four.", "q": "When does the party start?", "options": ["at four", "at three", "at half past three", "at two"], "answer": 0, "explain": "She corrects herself: 'It's at four.'"},
  {"type": "listen", "say": "I bought four pencils and two rubbers for school.", "q": "How many things did the speaker buy?", "options": ["six", "four", "two", "eight"], "answer": 0, "explain": "Four pencils + two rubbers = six things."},
  {"type": "listen", "say": "I wanted the blue cap, but they only had green, so I got the green one. It's nice!", "q": "What colour is the new cap?", "options": ["green", "blue", "red", "black"], "answer": 0, "explain": "They had no blue, so she got green."},
 ],
 "b1": [
  {"type": "listen", "say": "Let's meet at the main entrance. Actually, no, the side door is closer to the car park.", "q": "Where will they meet?", "options": ["by the side door", "at the main entrance", "in the car park", "at the back gate"], "answer": 0, "explain": "'Actually, no' = a change of mind: the side door."},
  {"type": "listen", "say": "The film's at quarter past seven, so let's meet fifteen minutes before.", "q": "What time will they meet?", "options": ["at seven", "at quarter past seven", "at half past seven", "at quarter to seven"], "answer": 0, "explain": "7:15 minus 15 minutes = 7:00."},
  {"type": "listen", "say": "Tickets are usually ten pounds, but children get half price, and there are two of us kids.", "q": "How much do the two children pay in total?", "options": ["£10", "£20", "£5", "£15"], "answer": 0, "explain": "Half price = £5 each; two children = £10."},
 ],
 "b2": [
  {"type": "listen", "say": "I'd planned to revise all weekend, but my cousin's visiting on Saturday, so I'll squeeze it all into Sunday.", "q": "When will the speaker revise?", "options": ["only on Sunday", "all weekend", "only on Saturday", "next weekend"], "answer": 0, "explain": "Saturday is taken by the visit, so it's 'squeezed into Sunday'."},
  {"type": "listen", "say": "The trip was meant to cost forty pounds, but the coach company added a ten percent fuel charge.", "q": "How much does the trip cost now?", "options": ["£44", "£40", "£50", "£36"], "answer": 0, "explain": "10% of £40 = £4, so £44."},
 ],
}
