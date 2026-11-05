/* 🌿 Healthy screen use (AGENT-BRIEF-2026-11-04 Task 6, specs/006-healthy-screen-use). Loaded after js/ux.js.
   • a sitting = answers with no gap longer than WR.HEALTH.sitGapMin; after breakMin minutes of one sitting, at the END of a round
     (WR.activityDone), never mid-question, the pet suggests a stretch + a drink of water, once per sitting
   • 👪 Grown-ups (behind the parent gate): an optional daily playtime (minutes of play today, the Report's own count) and an
     optional bedtime: screens rest from the bedtime itself until 5 am (BRIEF-T6B; T6 started an hour before). Both default OFF. When one applies, a new round doesn't start: a calm
     🌙 card instead (a round already going always finishes). "👪 15 more minutes" asks the grown-up gate again.
   Settings live in state.settings.health (the save, so they sync); the sitting in state.health. */
(function () {
const WR = window.WR;
const H = WR.HEALTH = { breakMin: 20, sitGapMin: 10, extraMin: 15, windDownMin: 0, morningH: 5,
  limits: [0, 30, 45, 60, 90, 120], beds: ["", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"] };
const MIN = 6e4;
// defaults filled in place (never a new object), so a reference kept across calls stays the saved one
const fill = (o, d) => { for (const k in d) if (o[k] === undefined) o[k] = d[k]; return o; };
const cfg = () => { const s = WR.state.settings; return fill(s.health = s.health && typeof s.health === "object" ? s.health : {}, { limit: 0, bed: "", until: 0 }); };
const sit = () => { const s = WR.state; return fill(s.health = s.health && typeof s.health === "object" ? s.health : {}, { start: 0, last: 0, nudged: false }); };
H.cfg = cfg;
// minutes played today: the Learning Report's day log (seconds counted from answer gaps, real device date)
H.playedMin = () => { const d = WR.state.report && WR.state.report.days[WR.dayKey()]; return Math.floor(((d && d.s) || 0) / 60); };
H.sittingMin = (now = Date.now()) => { const t = sit(); return t.start && now - t.last <= H.sitGapMin * MIN ? Math.floor((t.last - t.start) / MIN) : 0; };
const fmtBed = b => { const [h, m] = b.split(":").map(Number); return `${h > 12 ? h - 12 : h}:${String(m).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`; };
H.fmtBed = fmtBed;
// why a new round shouldn't start now: "limit" | "bed" | null
H.restReason = (now = Date.now()) => {
  const c = cfg(); if (now < (c.until || 0)) return null;
  if (c.limit > 0 && H.playedMin() >= c.limit) return "limit";
  if (c.bed) { const d = new Date(now), [h, m] = c.bed.split(":").map(Number), mins = d.getHours() * 60 + d.getMinutes(), bed = h * 60 + m;
    if (mins >= bed - H.windDownMin || mins < H.morningH * 60) return "bed"; }
  return null;
};
// one answer (every answer goes through WR.tally): extend or start the sitting
const tally0 = WR.tally;
WR.tally = (key, ok) => { const t = sit(), now = Date.now(); if (!t.start || now - t.last > H.sitGapMin * MIN) { t.start = now; t.nudged = false; } t.last = now; return tally0(key, ok); };
// 🌿 the break nudge, after a round
const pet = () => `<div class="petbox" style="width:110px;height:110px;margin:0 auto">${WR.petHTML()}</div>`;
H.breakCard = () => WR.modal(`<div class="health-card" id="breakCard">${pet()}<h2>Time for a little break? 🌿</h2>
    <p style="font-weight:700">We've played for ${H.sittingMin()} minutes! Let's stretch like a cat 🐱, drink some water 💧 and look out of the window 🌳.</p>
    <div class="row" style="justify-content:center"><button class="btn mint" id="brRest">🌿 Take a break</button><button class="btn ghost" id="brMore">✨ One more round</button></div></div>`, (bg, close) => {
  bg.querySelector("#brRest").onclick = () => { close(); WR.go("home"); WR.toast("🌿 Enjoy your break! See you soon 💖", 2200); };
  bg.querySelector("#brMore").onclick = close; });
const done0 = WR.activityDone;
WR.activityDone = (...a) => { const r = done0.apply(WR, a), t = sit();
  if (!t.nudged && H.sittingMin() >= H.breakMin) { t.nudged = true; WR.save(); setTimeout(() => { if (!document.querySelector("#breakCard, #restCard")) H.breakCard(); }, 900); }
  return r; };
// 🌙 the calm "rest" card instead of a new round
H.restCard = why => WR.modal(`<div class="health-card" id="restCard">${pet()}<h2>${why === "bed" ? "Time to wind down for bed 🌙" : "That's today's playtime! 🌙"}</h2>
    <p style="font-weight:700">${why === "bed" ? `Bedtime is at ${fmtBed(cfg().bed)}. ${WR.esc(WR.state.pet ? WR.state.pet.name : "Your pet")} is getting sleepy too 💤 A story on paper or a cuddle is perfect now.` : `You played so well today! ${WR.esc(WR.state.pet ? WR.state.pet.name : "Your pet")} is having a little nap 💤 See you tomorrow!`}</p>
    <div class="row" style="justify-content:center"><button class="btn mint" id="rsOk">OK 💖</button><button class="btn ghost small" id="rsMore">👪 Grown-up: ${H.extraMin} more minutes</button></div></div>`, (bg, close) => {
  bg.querySelector("#rsOk").onclick = close;
  bg.querySelector("#rsMore").onclick = () => { close(); WR.parentGate(() => { cfg().until = Date.now() + H.extraMin * MIN; WR.save(); WR.toast(`⏳ ${H.extraMin} more minutes`, 2000); }, { why: "More playtime is a grown-up choice." }); }; });
const guard = f => function (...a) { const why = H.restReason(); if (why) { H.restCard(why); return; } return f.apply(this, a); };
const wrap = (obj, n) => { if (obj && typeof obj[n] === "function" && !obj[n]._rest) { obj[n] = guard(obj[n]); obj[n]._rest = true; } };
["startLesson", "playSpecial", "startSpeaking", "startWriting", "startStory"].forEach(n => wrap(WR, n));
if (WR.Math) ["startLesson", "startDojo"].forEach(n => wrap(WR.Math, n));
// rounds opened as screens (gap games, Phonics Path, Word Charms, Lessons): the same check on WR.go
const ROUND = s => /^(phonicsRound|charmsRound|learn)$/.test(s) || WR.gapGames.some(g => g.round === s);
const go1 = WR.go;
WR.go = (screen, arg) => { if (ROUND(screen)) { const why = H.restReason(); if (why) { H.restCard(why); return; } } return go1(screen, arg); };
// 👪 the Grown-ups rows (js/parent-gate.js calls these inside the gated panel)
H.rowsHTML = () => { const c = cfg();
  return `<div class="health-rows" id="guHealth"><label class="set-row hr-row"><span class="hr-t">⏳ Daily playtime</span><small class="muted hr-c">Today: ${H.playedMin()} min · MOH: under 2 h a day for ages 7–12</small>
    <select class="input gu-sel" id="guLimit">${H.limits.map(m => `<option value="${m}" ${c.limit === m ? "selected" : ""}>${m ? m + " min" : "Off"}</option>`).join("")}</select></label>
    <label class="set-row hr-row"><span class="hr-t">🌙 Bedtime</span><small class="muted hr-c">Screens rest from bedtime until 5 am</small>
    <select class="input gu-sel" id="guBed">${H.beds.map(b => `<option value="${b}" ${c.bed === b ? "selected" : ""}>${b ? fmtBed(b) : "Off"}</option>`).join("")}</select></label></div>`; };
H.bindRows = bg => { const c = cfg();
  bg.querySelector("#guLimit").onchange = e => { c.limit = +e.target.value; c.until = 0; WR.save(); WR.toast(c.limit ? `⏳ Daily playtime: ${c.limit} minutes` : "⏳ Daily playtime: off"); };
  bg.querySelector("#guBed").onchange = e => { c.bed = e.target.value; c.until = 0; WR.save(); WR.toast(c.bed ? `🌙 Bedtime ${fmtBed(c.bed)}: screens rest from then until 5 am` : "🌙 Bedtime: off"); }; };
})();
