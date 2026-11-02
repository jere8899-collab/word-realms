"""🎭 R19 wave 5 (review 2026-11-01): scene-style picture choice above A1, with the new feeling pictures (GenerateImage, never Higgsfield):
two 3x3 sticker sheets of the same chibi kids, cut by tools/scene_art.py into assets/scenes/scene_<id>.png (+ assets/web WebP).

Same pattern as wave 4 (tools/r19_pics.py): pq(question, [(label, art) × 4], explain, [why-not × 3], word=target). Labels describe what
each picture SHOWS, so the right option is a paraphrase and never the target word (build_data.py checks `word` against every label).
Rules that keep the answer unambiguous: pictures that feel alike never meet in one question (scared/nervous/shy, embarrassed/shy,
furious/frustrated, disappointed/lonely, bored/exhausted, excited/amazed/delighted/kitten hug). The kitten hug and the boy calmly holding
a gift don't read as one clear feeling, so they are only ever wrong pictures with plain labels."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from qb import pq
from r19_pics import SLEEP, CALM, LAUGH, THINK, SMILE, LOVE

def S(n, label): return (label, "scene_" + n)
TIRED = S("exhausted", "a girl yawning, leaning on a heavy backpack"); MAP = S("puzzled", "a girl scratching her head over a map")
SPILT = S("embarrassed", "a girl hiding her red face by spilt juice"); TROPHY = S("proud", "a girl holding up a gold trophy")
STOMP = S("furious", "a girl stomping by a knocked-over block tower"); FOREST = S("scared", "a girl hiding behind a tree in a dark forest")
DROPPED = S("disappointed", "a girl looking down at a dropped ice cream"); KITTEN = S("kitten_hug", "a girl hugging a kitten")
DESK = S("bored", "a girl resting her chin on her hand at a desk")
JUMP = S("excited", "a boy jumping high, a present flying"); STAGE = S("nervous", "a boy on a little stage, hand at his mouth")
PUPPY = S("delighted", "a boy laughing as he hugs a puppy"); DOOR = S("shy", "a boy peeking out from behind a door")
KITE = S("frustrated", "a boy tangled up in kite string"); STAR = S("amazed", "a boy gazing up at a shooting star")
GIFT = S("gift_hold", "a boy holding a present"); HILL = S("determined", "a boy climbing a hill to reach a flag")
BENCH = S("lonely", "a boy sitting all alone on a bench")

SCENES = {
 "a2": [
  pq("Mia walked all day on the school trip. Now she feels very tired. Which picture shows her?", [TIRED, JUMP, PUPPY, STAR],
     "She is yawning and leaning on her heavy bag. She has no energy left, so she is very tired.",
     ["This boy is jumping high with lots of energy. He isn't tired at all.", "This boy is laughing and playing with a puppy. He looks wide awake and happy.",
      "This boy is looking up at a shooting star with big, wide eyes. He isn't sleepy."], word="tired"),
  pq("There's nothing to do in this lesson, and the girl feels bored. Which picture shows her?", [DESK, TROPHY, KITE, JUMP],
     "Her chin is on her hand and her eyes are half shut. Nothing interesting is happening, so she is bored.",
     ["This girl has won a trophy. She is happy and proud, not bored.", "This boy is cross because the kite string is in a knot. Something is happening!",
      "This boy is jumping for joy. He is excited, not bored."], word="bored"),
  pq("Which picture shows someone who is scared?", [FOREST, TROPHY, PUPPY, CALM],
     "The forest is dark, and she is hiding behind a tree with her mouth open. She is afraid of something.",
     ["This girl is smiling with her prize. She feels happy, not afraid.", "This boy is laughing with his puppy. He feels safe and happy.",
      "This child is sitting quietly with closed eyes. She feels calm, not afraid."], word="scared"),
  pq("Lily won the race. She feels proud. Which picture shows her?", [TROPHY, DROPPED, DESK, BENCH],
     "She is holding up her gold trophy with a big smile. She is pleased with what she did, so she is proud.",
     ["This girl looks sad. Her ice cream fell on the ground.", "This girl looks bored at her desk. She hasn't won anything.",
      "This boy is sitting alone and looks sad, not pleased with himself."], word="proud"),
  pq("Somebody knocked down Ella's tower. She is very angry! Which picture shows her?", [STOMP, KITTEN, SMILE, SLEEP],
     "She is stomping her foot and shouting next to the broken tower. She is very angry.",
     ["This girl is smiling and hugging a kitten. She isn't angry.", "This round face is smiling. It looks happy, not angry.",
      "Zzz means someone is fast asleep, not angry."], word="angry"),
  pq("Ben doesn't want to say hello to the new teacher. He feels shy. Which picture shows him?", [DOOR, JUMP, TROPHY, LAUGH],
     "He is peeking out from behind the door with pink cheeks. He wants to look, but he is too shy to come out.",
     ["This boy is jumping and waving. He isn't hiding at all.", "This girl is holding up her prize for everyone to see. She isn't shy.",
      "This face is laughing out loud. It isn't hiding or quiet."], word="shy"),
 ],
 "b1": [
  pq("Zoe dropped her juice in front of the whole class. Which picture shows how embarrassed she feels?", [SPILT, TROPHY, STAR, CALM],
     "She is hiding her face, and her cheeks are red. Everyone saw the spill, so she feels embarrassed.",
     ["This girl is proudly showing her trophy. She wants people to look at her.", "This boy is amazed by a shooting star. He isn't thinking about himself at all.",
      "This child feels calm and peaceful, not uncomfortable about a mistake."], word="embarrass"),
  pq("Which picture shows someone who feels disappointed?", [DROPPED, PUPPY, TROPHY, DOOR],
     "She was looking forward to her ice cream, but it fell on the ground. Something she wanted didn't happen, so she is disappointed.",
     ["This boy is laughing with his puppy. Everything is going well for him.", "This girl won a trophy. Things went better than she hoped!",
      "This boy is peeking out shyly. Nothing has gone wrong for him."], word="disappoint"),
  pq("Sam has to sing in the school show in one minute. Which picture shows that he's nervous?", [STAGE, DESK, PUPPY, SLEEP],
     "He is on the stage with his hand at his mouth and a drop of sweat. He's worried about the show, so he's nervous.",
     ["This girl is bored at her desk. Nothing is worrying her.", "This boy is laughing with a puppy. He is relaxed and happy.",
      "Zzz means someone is fast asleep, not worried about a show."], word="nervous"),
  pq("Which picture shows a boy who feels lonely?", [BENCH, PUPPY, JUMP, TROPHY],
     "He is sitting all by himself, and he looks sad. He would like a friend to play with, so he is lonely.",
     ["This boy has a puppy to hug, so he has company.", "This boy is jumping for joy with a present.",
      "This girl has won a trophy and looks pleased."], word="lonely"),
  pq("It's Leo's birthday, and he can't wait to open his presents! Which picture shows how he feels?", [JUMP, GIFT, BENCH, DESK],
     "He is jumping high with his arms up. He is so happy about what is coming that he can't keep still. He is excited.",
     ["This boy is holding a present quietly. He doesn't look full of energy.", "This boy is sitting alone and looks sad.",
      "This girl looks bored at her desk."], word="excit"),
 ],
 "b2": [
  pq("After a long hike up the mountain, which picture shows someone who is utterly exhausted?", [TIRED, HILL, JUMP, LAUGH],
     "She is yawning and leaning on her backpack as if she can't stand up. She has used up all her energy: she is exhausted.",
     ["This boy is still climbing hard, fists clenched. He has plenty of energy left.", "This boy is jumping high. Nobody exhausted could jump like that.",
      "This face is laughing, full of fun, not worn out."], word="exhaust"),
  pq("Which picture shows someone who is frustrated because something keeps going wrong?", [KITE, CALM, TROPHY, PUPPY],
     "He is all tangled in the kite string and shouting with his eyes shut. The more he tries, the worse the knot gets: he is frustrated.",
     ["This child is relaxed and peaceful. Nothing is annoying her.", "This girl's plan worked. She won the trophy!",
      "This boy is laughing with his puppy. Nothing is going wrong."], word="frustrat"),
  pq("Which picture shows someone who is determined to reach their goal?", [HILL, TIRED, DESK, DOOR],
     "His fists are clenched and he keeps climbing towards the flag. He won't give up: he is determined.",
     ["This girl is too tired to go on. She is resting, not pushing on.", "This girl is bored at her desk. She isn't trying to reach anything.",
      "This boy is hiding shyly behind a door, not working towards a goal."], word="determin"),
  pq("Which picture shows someone who is absolutely delighted?", [PUPPY, BENCH, MAP, STOMP],
     "He is laughing out loud as he hugs his fluffy puppy. He is extremely pleased and happy: he is delighted.",
     ["This boy is sitting alone and looks sad.", "This girl is scratching her head over a map. She is confused, not delighted.",
      "This girl is stomping by her broken tower. She is angry."], word="delight"),
  pq("Which picture shows someone who is amazed by what they can see?", [STAR, DESK, STAGE, THINK],
     "His mouth and eyes are wide open as he watches a shooting star. He can hardly believe how wonderful it is: he is amazed.",
     ["This girl is bored. Nothing surprising is happening.", "This boy is nervous on the stage. He is worried, not filled with wonder.",
      "This face is thinking quietly, not looking at something wonderful."], word="amaz"),
 ],
 "c1": [
  pq("Which picture shows someone who is completely bewildered?", [MAP, TROPHY, BENCH, SLEEP],
     "She is scratching her head and staring at the map. She has no idea which way to go: she is bewildered, totally confused.",
     ["This girl knows exactly what she has done: she won! She isn't confused.", "This boy is sad and alone, but he isn't confused about anything.",
      "Zzz means someone is fast asleep, not confused."], word="bewilder"),
  pq("Which picture best shows someone who is crestfallen?", [DROPPED, STAR, HILL, LOVE],
     "Her treat has just fallen on the ground, and she is looking down sadly. All her hope has gone: she is crestfallen.",
     ["This boy is full of wonder at the shooting star.", "This boy is climbing hard towards the flag. He still has lots of hope.",
      "The hearts show this face loves something. It is happy, not let down."], word="crestfallen"),
  pq("Which picture shows someone who is elated?", [JUMP, GIFT, MAP, DESK],
     "He is leaping into the air with his arms up and a big smile. He is extremely happy and excited: he is elated.",
     ["This boy is holding a present calmly. He looks content, not bursting with joy.", "This girl is confused by her map.",
      "This girl is bored at her desk."], word="elat"),
  pq("Which picture shows someone who is exasperated?", [KITE, SMILE, DOOR, CALM],
     "He has had enough of the tangled kite string. He is shouting with his eyes shut: he is exasperated, very annoyed after trying again and again.",
     ["This round face is smiling. It isn't annoyed at all.", "This boy is shy, hiding behind a door, not annoyed.",
      "This child is relaxed and calm. She is the opposite of exasperated."], word="exasperat"),
  pq("After the long sports day, which picture shows someone who looks weary?", [TIRED, STAR, PUPPY, HILL],
     "She is yawning and leaning heavily on her backpack. She is weary: very tired after a lot of effort.",
     ["This boy is wide awake and full of wonder.", "This boy is laughing and playing. He still has plenty of energy.",
      "This boy is pushing up the hill with energy. He isn't weary yet."], word="weary"),
 ],
 "c2": [
  pq("Which picture best conveys a forlorn figure?", [BENCH, JUMP, TROPHY, KITTEN],
     "He sits alone on the bench as a leaf falls, looking sad. He seems lonely and unhappy: forlorn.",
     ["This boy is leaping for joy. He is anything but sad.", "This girl is proudly holding her trophy.",
      "This girl is cuddling a kitten with a big smile, so she isn't alone or sad."], word="forlorn"),
  pq("Which picture shows someone who is awestruck?", [STAR, DESK, TIRED, STOMP],
     "He stares up at the shooting star, mouth open. He is filled with wonder and respect for something amazing: he is awestruck.",
     ["This girl is bored. Nothing has impressed her.", "This girl is far too tired to wonder at anything.",
      "This girl is stomping with anger, not filled with wonder."], word="awe"),
  pq("Which picture shows someone who is resolute?", [HILL, DOOR, TIRED, MAP],
     "With fists clenched, he keeps climbing towards the flag. He has decided and nothing will stop him: he is resolute.",
     ["This boy is hiding shyly. He isn't sure he wants to come out.", "This girl has stopped to rest. She has given up for now.",
      "This girl is confused about which way to go, so she isn't firm about anything yet."], word="resolute"),
  pq("Which picture shows someone who feels mortified?", [SPILT, STAGE, STAR, PUPPY],
     "She has spilt her juice in front of everyone and is hiding her bright red face. She is mortified: extremely embarrassed.",
     ["This boy is nervous before his show. Nothing embarrassing has happened yet.", "This boy is amazed by a shooting star.",
      "This boy is laughing with his puppy, not ashamed."], word="mortif"),
  pq("Someone has knocked over the tower that took Ava all morning. Which picture shows that she is irate?", [STOMP, DROPPED, MAP, BENCH],
     "She is stomping and shouting by the broken tower, red in the face. She is irate: very, very angry.",
     ["This girl is sad about her ice cream, not angry.", "This girl is confused by her map.",
      "This boy is sad and alone, not angry."], word="irate"),
 ],
}
