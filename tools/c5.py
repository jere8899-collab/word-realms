# C5 (review 2026-10-30): the game is for children. C1 reading passages / listening items about councils, ministers and land
# deals are re-set in school life with the same C1 reasoning skills (implication, weak analogy, writer's purpose).
def mcq(q, options, explain): return {"type": "mcq", "q": q, "options": options, "answer": 0, "explain": explain}
C5_PASSAGES = {"c1": {
 "Lord Ashby's Speech": {"title": "Ashby's Speech", "text": "Ashby, the student council president, rose to address the meeting. 'I have always supported building the new skate park beside the east field,' he began, glancing briefly at the skateboarding club, whose banner hung above his seat. 'Of course, I would never let personal interest cloud my judgement.' Several council members exchanged looks. One quietly noted that Ashby had been made captain of the skateboarding club only the week before.",
  "questions": [
   mcq("What is implied about Ashby?", ["He may have a conflict of interest.", "He is completely neutral about the skate park.", "He secretly opposes the new skate park.", "The skateboarding club strongly dislikes him."], "He has just become captain of the skateboarding club, so he could benefit from the skate park."),
   mcq("What do the council members' exchanged looks suggest?", ["They doubt his sincerity.", "They agree enthusiastically.", "They are confused about the park.", "They are bored."], "A silent reaction to his claim of no personal interest."),
   mcq("Why does the writer include the final sentence?", ["to give a reason to question his motives", "to show that he is a very talented skater", "to describe the field beside the skate park", "to praise Ashby for being open and honest"], "It undercuts his claim about 'personal interest'."),
  ]},
 "The Carriage Debate": {"title": "The Phone Debate", "text": "Class rep Reyes: 'Banning phones at lunchtime will get everyone playing together again. Look at what happened at Lindhaven School.' Class rep Mbeki: 'Lindhaven has a huge playground and a different club every lunchtime. We have one small yard. Without something else to do, you're not bringing people together; you're just making them bored.'",
  "questions": [
   mcq("What is Mbeki's main objection?", ["The two schools aren't comparable without other activities.", "Phones are useful for doing homework at lunch.", "The phone ban actually failed badly at Lindhaven.", "Lunchtimes are perfect and don't need any change."], "He attacks the comparison: Lindhaven has a big playground and clubs."),
   mcq("Which part of Reyes' reasoning does Mbeki challenge?", ["the analogy with Lindhaven", "the cost of the ban", "the safety of phones", "the history of the school"], "Reyes argues by analogy; Mbeki shows the analogy is weak."),
   mcq("Which would most strengthen Reyes' case?", ["a plan to start new lunchtime clubs", "proof that Lindhaven is popular with families", "proof that screens are bad for your eyes", "photos showing how lovely the yard is"], "It removes Mbeki's objection directly: there would be something else to do."),
  ]},
}}
C5_LISTEN = {"c1": {
 "With all due respect, minister, that doesn't actually answer the question.": {"say": "With all due respect, Coach, that doesn't actually answer the question.", "options": ["The coach is avoiding the question.", "The coach has been rude.", "The question was unclear.", "He agrees with the coach."], "answer": 0, "explain": "'With all due respect' introduces a polite criticism: the coach didn't answer."},
}}
