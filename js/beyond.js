/* 🌳 Beyond the screen (Task 11). Not in the first-visit shell. Loaded when the Play door opens
   or when a grown-up opens the Learning Report. Paper tasks, viewing tasks, and a pass-the-phone round.
   Stars: 2, once per level per kind, only after the parent gate, and only inside the daily practice cap. */
(function () {
const WR = window.WR, esc = WR.esc;
const STAR = 2;
const off = (title, story, lines, mark, talk) => ({ title, story, lines, mark, talk });
const view = (kind, title, lead, points, price) => ({ kind, title, lead, points, price: price || "" });
const play = (title, turns) => ({ title, turns });
const T = (who, q, choices, ok) => ({ who, q, choices, ok });
const PACKS = [
  { id: "a1", track: "cefr", label: "A1",
    off: off("Read a picnic on paper", "Nova and Puffbun sit on a blanket. They share one red apple and two buns. A bird hops near the blanket. Nova says, \"Hello, little bird.\"", ["Where are Nova and Puffbun?", "What do they share?"], ["A place, such as a blanket or a picnic.", "The apple and the buns."], ["What would you bring to a picnic?", "Who would you sit with?", "How does the bird feel?"]),
    view: view("poster", "Share a smile", "A little poster for a kind day.", ["Smile at a friend", "Say please", "Help someone small"]),
    play: play("Pass the picnic", [T("Child", "Nova has 2 buns. Puffbun brings 1. How many buns?", ["2", "3", "4"], 1), T("Grown-up", "Which word is a place?", ["park", "blue", "jump"], 0), T("Child", "Which is the kind thing to say?", ["Go away", "Please share", "Mine"], 1)]) },
  { id: "a2", track: "cefr", label: "A2",
    off: off("Read the sweet shop on paper", "Nova and Puffbun visit a little shop. The buns cost S$2. Puffbun wants one bun. Nova counts the coins in her paw. They say thank you to the shopkeeper.", ["How much is one bun?", "What do they say to the shopkeeper?"], ["S$2.", "Thank you."], ["What would you buy?", "How do you ask for it kindly?", "What coin do you know?"]),
    view: view("advert", "Bun stall", "A pretend stall card. Not a real shop.", ["One soft bun", "Warm and sweet", "Ask a grown-up first"], "S$2"),
    play: play("Pass the coins", [T("Child", "One bun is S$2. Two buns cost…", ["S$2", "S$4", "S$6"], 1), T("Grown-up", "Which sentence is polite?", ["Give me that", "Can I have a bun, please?", "Now"], 1), T("Child", "S$2 and S$1 makes…", ["S$2", "S$3", "S$5"], 1)]) },
  { id: "b1", track: "cefr", label: "B1",
    off: off("Read the lantern path on paper", "Nova holds a lantern on the forest path. The wind is soft. She waits for Puffbun, then they walk together. They do not leave the path.", ["Why does Nova wait?", "What do they not do?"], ["So they can walk together.", "They do not leave the path."], ["When is it wise to wait?", "Who do you walk with?", "What helps you feel brave?"]),
    view: view("info", "Three steps on a walk", "An infographic for a safe little walk.", ["Tell a grown-up where you are going", "Stay on the path", "Come back when you said"]),
    play: play("Pass the lantern", [T("Child", "Which choice keeps friends together?", ["Run off alone", "Wait, then walk together", "Hide"], 1), T("Grown-up", "\"Although it is dark, they have a lantern\" means…", ["They have no light", "It is dark and they have light", "They are lost"], 1), T("Child", "A good next step is…", ["Leave the path", "Tell a grown-up", "Close your eyes"], 1)]) },
  { id: "b2", track: "cefr", label: "B2",
    off: off("Read the lake rule on paper", "The lake looks calm, but the sign says swimmers stay with a grown-up. Nova reads the sign twice. Puffbun nods. They paddle only where the water is shallow.", ["What does the sign ask?", "Where do they paddle?"], ["Stay with a grown-up.", "Where the water is shallow."], ["Why do signs matter?", "When would you ask for help?", "What is a careful choice here?"]),
    view: view("poster", "Stay where it is shallow", "A safety poster beside a storybook lake.", ["Read the sign", "Stay with a grown-up", "Shallow water only"]),
    play: play("Pass the sign", [T("Grown-up", "The sign is there so people…", ["ignore the water", "know the careful choice", "swim at night"], 1), T("Child", "Which is the careful plan?", ["Swim far alone", "Paddle in the shallow part with a grown-up", "Jump from a high rock"], 1), T("Grown-up", "Reading the sign twice shows Nova is…", ["careful", "lost", "late"], 0)]) },
  { id: "c1", track: "cefr", label: "C1",
    off: off("Read a short argument on paper", "A poster says, \"Everyone should vote for the long path because it is new.\" Nova asks, \"New is not the same as better.\" She wants a reason that matches the choice.", ["What is weak about the poster?", "What does Nova want instead?"], ["It treats \"new\" as a reason by itself.", "A reason that matches the choice."], ["What makes a reason strong?", "When is \"everyone\" too big a word?", "How would you check a claim?"]),
    view: view("info", "Strong or thin reason", "A small infographic about reasons.", ["A reason should match the choice", "\"Everyone\" needs proof", "New is not the same as better"]),
    play: play("Pass the reason", [T("Child", "Which reason matches \"carry water on a hot walk\"?", ["The bottle is blue", "You may get thirsty", "Paths are old"], 1), T("Grown-up", "\"Everyone knows it\" is…", ["proof by itself", "a claim that still needs a source", "a measurement"], 1), T("Child", "A fair reply is…", ["You are silly", "What is the reason?", "Stop talking"], 1)]) },
  { id: "c2", track: "cefr", label: "C2",
    off: off("Read the library note on paper", "The library dragon offers a free evening of riddles. The note says the evening is hosted by the library, not by a shop. Nova checks who wrote the note before she believes the prize.", ["Who hosts the evening?", "What does Nova check?"], ["The library.", "Who wrote the note."], ["Why does the host matter?", "What would you ask about a prize?", "How do you say no politely?"]),
    view: view("advert", "Free riddle evening", "A pretend notice. The host is the library.", ["One evening of riddles", "Hosted by the library", "No shop behind it"], "Free"),
    play: play("Pass the note", [T("Grown-up", "Before trusting a prize, ask…", ["Who is offering it?", "Is the ink pretty?", "Is it loud?"], 0), T("Child", "\"Free\" here means…", ["S$10", "No money to enter", "You must buy a book"], 1), T("Grown-up", "A careful reader…", ["checks who wrote it", "believes every prize", "skips the host"], 0)]) },
  { id: "p1", track: "sg", label: "P1",
    off: off("Read the coin story on paper", "Mei and her brother see a coin. It is one Singapore dollar, S$1. They do not spend it. They give it to a grown-up and say what they saw.", ["How much is the coin?", "What do they do with it?"], ["S$1.", "They give it to a grown-up."], ["What does S$ mean?", "Who should hold money?", "Where might you see a dollar coin?"]),
    view: view("poster", "This coin is one dollar", "A poster of a Singapore dollar coin. Look, don't spend alone.", ["It says Singapore", "It is S$1", "Give found money to a grown-up"], "S$1"),
    play: play("Pass the dollar", [T("Child", "S$1 and another S$1 makes…", ["S$1", "S$2", "S$11"], 1), T("Grown-up", "Found money should go…", ["in a pocket forever", "to a grown-up", "under a chair"], 1), T("Child", "S$ means…", ["Singapore dollars", "a secret", "a game token"], 0)]) },
  { id: "p2", track: "sg", label: "P2",
    off: off("Read the orchid garden on paper", "At the Botanic Gardens, two children count orchids. They see 4 purple and 3 white. A sign says, \"Please look, don't pick.\" They draw the flowers on paper instead.", ["How many orchids do they see?", "What does the sign say?"], ["7.", "Look, don't pick."], ["What colour would you draw?", "Why leave flowers on the plant?", "Who did you go with last time?"]),
    view: view("info", "Look, don't pick", "An infographic for a garden visit.", ["4 purple", "3 white", "7 flowers to draw, none to pick"]),
    play: play("Pass the flowers", [T("Child", "4 and 3 flowers make…", ["5", "7", "8"], 1), T("Grown-up", "The kind choice is…", ["Pick one", "Draw one", "Hide one"], 1), T("Child", "A sign that says please is asking you to…", ["shout", "be careful and kind", "run"], 1)]) },
  { id: "p3", track: "sg", label: "P3",
    off: off("Read the hawker table on paper", "At a hawker centre, a bowl of noodles is S$3. A cup of water is free. The family wipes the table when they finish and says thank you.", ["How much is the bowl?", "What do they do at the end?"], ["S$3.", "They wipe the table and say thank you."], ["What would you order?", "How do you thank the stall?", "Why wipe the table?"]),
    view: view("advert", "Noodle bowl", "A pretend hawker card. Prices are Singapore dollars.", ["One bowl of noodles", "Water is free", "Say thank you"], "S$3"),
    play: play("Pass the tray", [T("Child", "Two bowls at S$3 each cost…", ["S$3", "S$5", "S$6"], 2), T("Grown-up", "Which is polite at the stall?", ["Hey, faster", "Thank you", "This is mine"], 1), T("Child", "Water on this card costs…", ["S$3", "S$1", "nothing"], 2)]) },
  { id: "p4", track: "sg", label: "P4",
    off: off("Read the bus-card note on paper", "A child tops up an ez-link card with S$5 before a school outing. The grown-up checks the machine. They leave home early so nobody has to run for the bus.", ["How much is the top-up?", "Why do they leave early?"], ["S$5.", "So nobody has to run for the bus."], ["What do you pack for an outing?", "Who checks the card?", "What does early feel like?"]),
    view: view("info", "Outing top-up", "An infographic. Money is in Singapore dollars.", ["Card top-up S$5", "A grown-up checks", "Leave time to walk, not run"], "S$5"),
    play: play("Pass the card", [T("Child", "S$5 is enough for a S$2 ride, with how much left?", ["S$2", "S$3", "S$7"], 1), T("Grown-up", "Leaving early helps the group…", ["miss the bus", "stay calm", "forget the card"], 1), T("Child", "Who checks the machine?", ["a stranger", "a grown-up", "nobody"], 1)]) },
  { id: "p5", track: "sg", label: "P5",
    off: off("Read the bookshop card on paper", "A storybook costs S$8. Mei has S$10. She can buy the book and still have S$2. She asks before she pays.", ["How much is the book?", "How much is left from S$10?"], ["S$8.", "S$2."], ["Would you save the S$2 or spend it?", "Why ask before paying?", "What book would you choose?"]),
    view: view("advert", "Storybook stall", "A pretend bookshop card in Singapore dollars.", ["One storybook", "Ask before you pay", "Change is still yours"], "S$8"),
    play: play("Pass the book", [T("Child", "S$10 minus S$8 leaves…", ["S$2", "S$8", "S$18"], 0), T("Grown-up", "Asking before paying is…", ["rude", "wise", "slow for no reason"], 1), T("Child", "S$8 and S$2 makes…", ["S$6", "S$10", "S$82"], 1)]) },
  { id: "p6", track: "sg", label: "P6",
    off: off("Read the class party plan on paper", "The class has S$12 for a small party. Fruit is S$4 and drinks are S$3. They write what is left before anyone buys a thing. A grown-up holds the money.", ["How much are fruit and drinks together?", "Who holds the money?"], ["S$7.", "A grown-up."], ["What would you add to the plan?", "Why write the sum first?", "How do you share fairly?"]),
    view: view("info", "Party money", "An infographic for a small class party.", ["Start with S$12", "Fruit S$4 and drinks S$3", "S$5 left, held by a grown-up"], "S$12"),
    play: play("Pass the plan", [T("Child", "S$4 + S$3 =", ["S$7", "S$12", "S$43"], 0), T("Grown-up", "S$12 − S$7 leaves…", ["S$5", "S$4", "S$19"], 0), T("Child", "The fair step is…", ["One person takes all", "Write the plan, then share", "Hide the coins"], 1)]) },
  { id: "s1", track: "sg", label: "Sec 1",
    off: off("Read the canteen note on paper", "A canteen snack is S$1.50. A student checks the price on the board before queuing. They keep the receipt to show a grown-up if they are asked.", ["What is the snack price?", "When do they check it?"], ["S$1.50.", "Before queuing."], ["Why check a price first?", "What would you choose?", "When is a receipt useful?"]),
    view: view("advert", "Canteen snack", "A pretend school-canteen card. Singapore dollars.", ["Price on the board", "Queue kindly", "Keep the receipt"], "S$1.50"),
    play: play("Pass the receipt", [T("Child", "Two snacks at S$1.50 each cost…", ["S$1.50", "S$3", "S$4"], 1), T("Grown-up", "Checking the board first avoids…", ["a surprise at the till", "a long holiday", "homework"], 0), T("Child", "A receipt is for…", ["showing what you paid", "drawing on", "throwing at once"], 0)]) },
  { id: "s2", track: "sg", label: "Sec 2",
    off: off("Read the day-out plan on paper", "Four friends plan a short day out. Train fares are S$6 altogether. They each put in the same amount. They agree on a meeting time and a grown-up's phone number.", ["How much are the fares altogether?", "What else do they agree?"], ["S$6.", "A meeting time and a grown-up's number."], ["How do you split a cost fairly?", "Why a meeting time?", "Who would you tell?"]),
    view: view("info", "Day out", "An infographic. Fares in Singapore dollars.", ["Fares S$6 for the group", "Each person pays the same", "A time and a grown-up's number"], "S$6"),
    play: play("Pass the plan", [T("Child", "S$6 shared by 3 people is…", ["S$2 each", "S$3 each", "S$6 each"], 0), T("Grown-up", "A meeting time matters because…", ["people can find each other", "trains are blue", "maps are paper"], 0), T("Child", "S$2 three times is…", ["S$5", "S$6", "S$8"], 1)]) },
  { id: "s3", track: "sg", label: "Sec 3",
    off: off("Read two prices on paper", "A stall shows a drink for S$1.50 and a bigger cup for S$3. The bigger cup is not always the better buy. The reader asks what they actually want before paying.", ["What are the two prices?", "What should the reader ask?"], ["S$1.50 and S$3.", "What they actually want."], ["When is the bigger cup worth it?", "When is it not?", "How do adverts push a bigger buy?"]),
    view: view("advert", "Two cups", "A pretend advert. Compare before you pay.", ["Small cup S$1.50", "Big cup S$3", "Want it, or just bigger?"], "S$3"),
    play: play("Pass the advert", [T("Child", "The big cup costs how much more?", ["S$1.50", "S$3", "S$4.50"], 0), T("Grown-up", "A careful buyer first asks…", ["Is it the biggest?", "Do I want this?", "Is the colour new?"], 1), T("Child", "S$1.50 twice is…", ["S$2", "S$3", "S$3.50"], 1)]) },
  { id: "s4", track: "sg", label: "Sec 4/5",
    off: off("Read a week of pocket money on paper", "A student has S$20 for a school week. Transport is S$8 and food is S$9. They write S$3 left for anything unplanned, and they do not lend the bus fare.", ["How much is left after transport and food?", "What do they not lend?"], ["S$3.", "The bus fare."], ["What belongs in a weekly plan?", "Why keep the fare aside?", "What would you cut first?"]),
    view: view("info", "One school week", "An infographic in Singapore dollars.", ["Start S$20", "Transport S$8, food S$9", "S$3 left, fare not lent"], "S$20"),
    play: play("Pass the week", [T("Child", "S$8 + S$9 =", ["S$16", "S$17", "S$19"], 1), T("Grown-up", "S$20 − S$17 leaves…", ["S$3", "S$7", "S$13"], 0), T("Child", "The fare stays aside so…", ["the week can still get home", "the plan looks bigger", "a friend must pay"], 0)]) },
  { id: "jc1", track: "sg", label: "JC 1",
    off: off("Read a claim on paper", "A poster says, \"This workshop will change your life. Only S$8.\" A student asks who runs it, what the hour actually includes, and where that claim comes from. The fee is in Singapore dollars. No one has to sign up on the spot.", ["What is the fee?", "What three things does the student ask?"], ["S$8.", "Who runs it, what the hour includes, and where the claim comes from."], ["What makes a claim too big?", "Why is \"on the spot\" a pressure?", "How would you check a source?"]),
    view: view("poster", "Ask before you sign", "A poster about claims. The fee is Singapore dollars.", ["Who runs it?", "What is included?", "You can say not today"], "S$8"),
    play: play("Pass the claim", [T("Child", "\"It will change your life\" is…", ["a measurement", "a big claim, not proof", "a timetable"], 1), T("Grown-up", "A fair next step is…", ["pay at once", "ask who runs it and what is included", "share it as fact"], 1), T("Child", "S$8 is the…", ["fee on the poster", "proof the claim is true", "change from S$20"], 0)]) },
  { id: "jc2", track: "sg", label: "JC 2",
    off: off("Read a food week on paper", "A student sketches one week of simple meals for S$35. Rice, eggs, vegetables and one hawker treat are listed. The plan is a draft, not a rule about anyone else's body or budget.", ["What is the draft total?", "What kind of plan is it?"], ["S$35.", "A draft for simple meals, not a rule for other people."], ["What would you swap to spend less?", "Why label it a draft?", "Who could help you check the prices?"]),
    view: view("info", "A draft food week", "An infographic. Singapore dollars. Not advice for anyone else's body.", ["Rice, eggs, vegetables", "One hawker treat", "Draft total S$35"], "S$35"),
    play: play("Pass the draft", [T("Child", "A draft means…", ["it cannot be changed", "it is a first plan", "it is a law"], 1), T("Grown-up", "S$35 for 7 days is S$5 a day. That is…", ["exact for every person", "this plan's average", "a shop's rule"], 1), T("Child", "A respectful note is…", ["everyone must eat this", "this is one draft", "skip all treats forever"], 1)]) },
  { id: "adult", track: "sg", label: "Adult",
    off: off("Read a community-class advert on paper", "An evening class costs S$12. The advert names the community centre as the host and says the fee is for one session. A reader asks who is paying for the poster and whether the promise matches the session.", ["What is the fee, and for what?", "What does a careful reader ask?"], ["S$12 for one session.", "Who paid for the poster, and whether the promise matches the session."], ["Why does the host matter?", "What promise would be too vague?", "How do you decline kindly?"]) ,
    view: view("advert", "One evening class", "A pretend community-centre advert. Singapore dollars.", ["Host: the community centre", "One session", "Read who paid for the poster"], "S$12"),
    play: play("Pass the advert", [T("Grown-up", "The fee covers…", ["a whole year", "one session", "every class in town"], 1), T("Child", "S$12 is…", ["Singapore dollars", "a score", "a time"], 0), T("Grown-up", "Before trusting the poster, ask…", ["who paid for it, and what the session really is", "whether the colours are pretty", "how many exclamation marks it has"], 0)]) }
];
const byId = id => PACKS.find(p => p.id === id) || PACKS[0];
if (!document.getElementById("beyondCss")) {
  const css = document.createElement("style"); css.id = "beyondCss";
  css.textContent = `.by-lv,.by-choice,.by-ready,.by-chip{min-height:44px;min-width:44px;white-space:normal;text-align:left}
.by-lv{display:block;width:100%;box-sizing:border-box;margin:6px 0}
.by-sheet{background:#fffef8;border-radius:18px;padding:14px;overflow-wrap:anywhere}
.by-line{height:28px;border-bottom:1px solid #e4d4f5;margin:8px 0}
.by-pic{display:block;width:100%;height:auto;border-radius:18px;margin:0 0 12px}
.by-poster{border-radius:22px;padding:16px;background:linear-gradient(165deg,#fff6fb,#e7f7ff);border:3px solid #fff;text-align:center}
.by-info{display:flex;flex-direction:column;gap:8px}
.by-step{display:flex;gap:8px;align-items:center;background:#fff;border-radius:14px;padding:8px}
.by-advert{border-radius:22px;padding:16px;background:#fff;border:3px dashed #f0b4cf}
.by-price{display:inline-block;background:#ffe08a;border-radius:999px;padding:6px 12px;font-weight:800}
@media print{body *{visibility:hidden}#printSheet,#printSheet *{visibility:visible}#printSheet{position:absolute;left:0;top:0;width:100%;background:#fff;color:#222}.no-print{display:none!important}}`;
  document.head.appendChild(css);
}
const doneKey = (id, kind) => id + ":" + kind;
const block = () => WR.block("beyond");
function current() {
  const sg = WR.state && WR.state.sg;
  if (sg && sg.track === "sg" && sg.level && byId(sg.level)) return sg.level;
  const id = (WR.state && WR.state.startLevel) || "a1";
  return PACKS.some(p => p.id === id) ? id : "a1";
}
function confirm(id, kind) {
  WR.parentGate(() => {
    const key = doneKey(id, kind), b = block();
    if (!b.done[key] && WR.practiceLeft() <= 0) { WR.toast("Today's practice stars are all collected. This one can wait until tomorrow ⭐"); return; }
    const got = WR.awardStars("beyond", key, STAR, { kind: "item", why: "Away from the screen", quiet: true });
    b.done[key] = { at: Date.now(), stars: got || (b.done[key] && b.done[key].stars) || 0 };
    WR.save();
    WR.toast(got ? `+${got} ⭐ Lovely work together` : "Already collected for this one ⭐", 2200);
    WR.go("beyond", { id, kind });
  }, { why: "A grown-up confirms this away-from-the-screen task." });
}
const PIC = { read: "beyond_paper", poster: "beyond_poster", info: "beyond_infographic", advert: "beyond_hawker", play: "beyond_play" };
function pic(slot, alt) {
  const id = PIC[slot];
  return `<img class="by-pic" data-slot="${slot}" src="assets/web/${id}.webp" alt="${esc(alt)}" decoding="async" onerror="this.onerror=null;this.src='assets/lessons/${id}.jpg'">`;
}
function sheet(p) {
  const o = p.off;
  return `<article class="by-sheet" id="printSheet"><p class="muted">${esc(p.label)} · on paper</p><h2>${esc(o.title)}</h2>
    ${pic("read", "Nova and Puffbun reading a paper book")}
    <p>${esc(o.story)}</p>
    <h3>Write your answers</h3>
    ${o.lines.map(q => `<p><b>${esc(q)}</b></p><div class="by-line"></div><div class="by-line"></div>`).join("")}
    <h3>Talk it through</h3><ol>${o.talk.map(q => `<li>${esc(q)}</li>`).join("")}</ol>
    <h3>Marking guide for a grown-up</h3><ol>${o.mark.map(q => `<li>${esc(q)}</li>`).join("")}</ol>
    <p class="muted">Any clear answer in the child's own words is fine. This is not a test score.</p></article>`;
}
function viewHTML(p) {
  const v = p.view, slot = v.kind === "advert" ? "advert" : v.kind === "info" ? "info" : "poster";
  const price = v.price ? `<div class="by-price">${esc(v.price)}</div>` : "";
  const body = v.kind === "info"
    ? `<div class="by-info">${v.points.map((t, i) => `<div class="by-step"><b>${i + 1}</b><span>${esc(t)}</span></div>`).join("")}</div>`
    : `<ul>${v.points.map(t => `<li>${esc(t)}</li>`).join("")}</ul>`;
  const cls = v.kind === "advert" ? "by-advert" : "by-poster";
  return `<div class="${cls}" id="viewCard">${pic(slot, v.title)}
    <h2>${esc(v.title)}</h2>${price}<p>${esc(v.lead)}</p>${body}</div>`;
}
function paint(arg) {
  const id = (arg && arg.id) || current();
  const kind = (arg && arg.kind) || "hub";
  const p = byId(id);
  const back = `<div class="row" style="margin:8px 0"><button class="btn ghost small" id="byBack">${kind === "hub" ? "← Door" : "← Ideas"}</button></div>`;
  const confirmBtn = `<button class="btn mint by-ready" id="byConfirm">👪 We did this · up to ${STAR}⭐</button>`;
  let body = "";
  if (kind === "paper") body = `${sheet(p)}<p class="no-print muted">Print it, then write and talk away from the screen.</p><div class="row no-print"><button class="btn by-ready" id="byPrint">🖨️ Print</button>${confirmBtn}</div>`;
  else if (kind === "view") body = `${viewHTML(p)}<div class="row no-print">${confirmBtn}</div>`;
  else if (kind === "play") body = playHTML(p);
  else body = `<h1>🌳 Beyond the screen</h1><p class="muted" style="font-weight:700">${esc(p.label)}. These ideas happen off the phone. Nothing here asks for a new name.</p>
    <button class="btn by-ready" id="byPaper">📄 Read and write on paper</button>
    <button class="btn by-ready" id="byView">👀 Look at a ${esc(p.view.kind)}</button>
    <button class="btn by-ready" id="byPlay">🤝 Play together</button>
    <div class="row" style="flex-wrap:wrap;margin-top:8px">${PACKS.filter(x => x.track === "cefr").map(chip).join("")}</div>
    <div class="row" style="flex-wrap:wrap">${PACKS.filter(x => x.track === "sg").map(chip).join("")}</div>`;
  WR.view(`<div class="fade-in" id="beyond">${back}${body}</div>`);
  const go = (k) => () => WR.go("beyond", { id, kind: k });
  const bb = WR.$("#byBack"); if (bb) bb.onclick = () => {
    if (kind !== "hub") return WR.go("beyond", { id });
    const rid = p.track === "cefr" ? id : ((WR.state && WR.state.startLevel) || "a1");
    WR.go("door", { rid, door: "play" });
  };
  const paper = WR.$("#byPaper"); if (paper) paper.onclick = go("paper");
  const vw = WR.$("#byView"); if (vw) vw.onclick = go("view");
  const pl = WR.$("#byPlay"); if (pl) pl.onclick = go("play");
  document.querySelectorAll(".by-chip").forEach(b => b.onclick = () => WR.go("beyond", { id: b.dataset.lv }));
  const pr = WR.$("#byPrint"); if (pr) pr.onclick = () => window.print();
  const cf = WR.$("#byConfirm"); if (cf) cf.onclick = () => confirm(id, kind === "view" ? "view" : kind === "play" ? "play" : "paper");
  bindPlay(p);
}
function chip(p) {
  const on = p.id === (WR._beyondId || "");
  return `<button class="btn ghost small by-chip${on ? " on" : ""}" data-lv="${p.id}">${esc(p.label)}</button>`;
}
let round = null;
function playHTML(p) {
  round = round && round.id === p.id ? round : { id: p.id, i: 0, phase: "pass", score: 0 };
  const art = pic("play", "A parent and a child sharing one phone");
  const t = p.play.turns[round.i];
  if (!t) return `${art}<h2>🤝 ${esc(p.play.title)}</h2><p>You finished the round together. Score ${round.score} of ${p.play.turns.length}. Nothing was saved except a grown-up's star confirm, if you tap it.</p><button class="btn by-ready" id="byAgain">Play again</button><div class="row">${`<button class="btn mint by-ready" id="byConfirm">👪 We did this · up to ${STAR}⭐</button>`}</div>`;
  if (round.phase === "pass") return `${art}<h2>Pass the phone</h2><p>Hand the phone to the <b>${esc(t.who)}</b>. No new account, and the answers are not stored.</p><button class="btn mint by-ready" id="byReady">${esc(t.who)} is ready</button>`;
  return `${art}<h2>${esc(t.who)}</h2><p style="font-weight:800">${esc(t.q)}</p><div class="by-choices">${t.choices.map((c, n) => `<button class="btn by-choice" data-n="${n}">${esc(c)}</button>`).join("")}</div>`;
}
function bindPlay(p) {
  const ready = WR.$("#byReady"), again = WR.$("#byAgain");
  if (ready) ready.onclick = () => { round.phase = "ask"; paint({ id: p.id, kind: "play" }); };
  if (again) again.onclick = () => { round = { id: p.id, i: 0, phase: "pass", score: 0 }; paint({ id: p.id, kind: "play" }); };
  document.querySelectorAll(".by-choice").forEach(b => b.onclick = () => {
    const t = p.play.turns[round.i];
    if (t && +b.dataset.n === t.ok) round.score++;
    round.i++; round.phase = "pass"; paint({ id: p.id, kind: "play" });
  });
}
WR.Beyond = {
  STAR, PACKS, slots: [
    { id: "read", want: "Chibi Nova and Puffbun reading a paper book in a pastel meadow." },
    { id: "poster", want: "A blank pastel poster frame with a tiny chibi mascot in the corner." },
    { id: "info", want: "Three soft chibi coins or steps, no brand logos, for an infographic." },
    { id: "advert", want: "A chibi hawker table with a bowl, pastel, no real shop name." },
    { id: "play", want: "Two chibi figures gently passing one phone, with stars." }
  ],
  byId, current, ready: Promise.resolve(PACKS),
  card() {
    const cefr = PACKS.filter(p => p.track === "cefr"), sg = PACKS.filter(p => p.track === "sg");
    const row = p => `<button class="btn ghost by-lv" data-lv="${p.id}">${esc(p.label)} · ${esc(p.off.title)}</button>`;
    return `<div class="card rp-card" id="beyondCard"><h2>🌳 Beyond the screen</h2>
      <p class="muted">One idea away from the phone for every level. Open it to print, to look, or to play together. A grown-up can confirm up to ${STAR} stars, once, inside today's practice cap.</p>
      <h3>Fairy realms</h3>${cefr.map(row).join("")}<h3>Singapore</h3>${sg.map(row).join("")}</div>`;
  },
  open(id, kind) { WR._beyondId = id; WR.go("beyond", { id, kind: kind || "hub" }); }
};
(WR.reportCards = WR.reportCards || []).push(() => WR.Beyond.card());
WR.screens.beyond = arg => { WR._beyondId = (arg && arg.id) || current(); paint(arg && arg.id ? arg : { id: WR._beyondId }); };
})();
