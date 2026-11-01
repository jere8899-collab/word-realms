/* 🕰️ Clock Workshop: time tools for the Number Kingdom, Grades 1–3 (MOE P1–P3: o'clock and half past, 5 minutes,
   to the minute, "past" and "to", the 24-hour clock, durations, finishing and starting times).
   • A hand-setting clock answers "set the clock" questions (q.set): drag the long hand or tap ±1 h / ±5 min / ±1 min.
     The short hand moves with it like a real clock, and no digital time is shown, so the child really reads the clock.
   • A Model Magic tool for clock questions (MathViz spec type "clock"): count the long hand in fives (and ones),
     or wind the hands on / back an hour or some minutes at a time to find an end time, a start time or a duration.
   • A free-play Workshop screen (hub card in Grades 1–3) shows the time on the clock in words, a.m./p.m. and the 24-hour clock.
   Progress: WR.state.math.clock = { opened, hops, done, set, plays } inside wordRealms.save.v1 (cloud-synced). */
(function () {
const WR = window.WR, MW = WR.Math, MG = window.MathGen, V = window.MathViz, C = MG.clock, esc = WR.esc;
if (!MW || !V) return;
const MC = MW.Clock = {};
const cs = () => MW.st().clock;
const SET = { type: "clock", mode: "set", h: 12, m: 0 };
const wrapT = t => ((t % 720) + 720) % 720;
const timeOf = t => V.clockTime(SET, { t: wrapT(t) });
const sgn = n => n < 0 ? "−" : "+";
const hop = n => `${sgn(n)}${Math.abs(n) >= 60 ? Math.abs(n) / 60 + " h" : Math.abs(n) + " min"}`;
// one Clock Workshop win (a clock counted, wound or set): the 🕰️ daily quest
const win = () => { WR.questEvent("clock1"); WR.save(); };

/* ---------- the hand-setting clock (set-the-clock answers and the free-play Workshop) ---------- */
let S = null;   // { t: minutes after 12:00, step, locked, onChange }
const BTNS = step => [[-60, "−1 h"], [60, "+1 h"], [-5, "−5 min"], [5, "+5 min"]].concat(step === 1 ? [[-1, "−1 min"], [1, "+1 min"]] : []);
// check = the lesson's ✓ Check button, which sits in the last button row (so the whole setter fits a phone screen)
MC.setterHTML = (step = 1, check = "") => `<div class="csetter"><div class="cface" id="cface" tabindex="0" role="group" aria-label="Clock: drag the long hand, or use the buttons" title="Drag the long hand, or tap the buttons">${V.svg(SET, { t: 0 })}</div>
  <div class="cbtns${check ? "" : " six"}">${BTNS(step).map(([d, l]) => `<button class="btn small ghost cbtn" data-d="${d}" aria-label="${l.replace("−", "minus ").replace("+", "plus ")}">${l}</button>`).join("")}${check}</div></div>`;
MC.bindSetter = (step, onChange, t0 = 0) => {
  const me = S = { t: t0, step, locked: false, onChange };
  const face = WR.$("#cface"); if (!face) return me;
  const draw = () => { face.innerHTML = V.svg(SET, { t: wrapT(me.t) }); onChange && onChange(timeOf(me.t), me); };
  const move = d => { if (me.locked || S !== me) return; me.t = wrapT(me.t + d); draw(); };
  document.querySelectorAll("#main .cbtn[data-d]").forEach(b => b.onclick = () => { move(+b.dataset.d); WR.sfx("tap"); });
  // drag: the long hand follows the finger (snapped to the step); passing the 12 carries the hour on or back
  const toMin = e => { const r = face.getBoundingClientRect(), a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI + 90;
    return Math.round((((a % 360) + 360) % 360) / 6 / step) * step % 60; };
  let drag = false;
  face.onpointerdown = e => { if (me.locked) return; drag = true; face.setPointerCapture && face.setPointerCapture(e.pointerId); face.onpointermove(e); e.preventDefault(); };
  face.onpointermove = e => { if (!drag || me.locked) return; let d = toMin(e) - wrapT(me.t) % 60; if (d > 30) d -= 60; if (d < -30) d += 60; if (d) move(d); };
  face.onpointerup = face.onpointercancel = () => { drag = false; };
  face.onkeydown = e => { const d = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: 60, PageDown: -60 }[e.key]; if (d) { e.preventDefault(); move(d); } };
  draw(); return me;
};
MC.lock = () => { if (!S) return; S.locked = true; document.querySelectorAll("#main .cbtn").forEach(b => b.disabled = true); const f = WR.$("#cface"); if (f) f.classList.add("locked"); };
MC.time = () => S && C.hm(timeOf(S.t).h, timeOf(S.t).m);
// lessons: a q.set question gets the setter and a ✓ Check button; the typed-answer checker reads "h:mm"
MC.setHTML = q => `<div class="cset-tip">👆 Drag the long hand, or tap the buttons.</div>` + MC.setterHTML(q.step || 5, `<button class="btn mint cset-check${(q.step || 5) === 1 ? "" : " wide"}" id="mcheck">✓ Check</button>`);
MC.bindSet = (q, fn) => { MC.bindSetter(q.step || 5); const b = WR.$("#mcheck"); if (b) b.onclick = () => { if (!S || S.locked) return; if (!S.t) return WR.toast("Move the hands first 🕰️", 1800, { now: true }); fn(MC.time()); }; };
MC.solved = () => { cs().set++; win(); };

/* ---------- 🧮 Model Magic tool: count the minutes, or wind the hands ---------- */
const ck = L => L.ck || (L.ck = { k: 0, t: 0, hops: [], msg: "", fin: false });
const finish = c => { if (c.fin) return; c.fin = true; cs().done++; win(); WR.sfx("good"); };
const readHTML = (v, c) => {
  if (c.k >= v.m) return `<div class="bal-done">${v.m ? `🎉 You counted all the way to the long hand: <b>${v.m} minutes</b>. The short hand is in the lilac slice. Type the time!` : "🎉 The long hand is on the 12, so it's o'clock! The short hand is in the lilac slice. Type the time!"}</div>`;
  const left = v.m - c.k, five = left >= 5;
  return `<div class="ck-q">Counted: <b>${c.k}</b> minute${c.k === 1 ? "" : "s"} ${c.k ? "" : "(start at the 12)"}</div>
    <div class="bmoves ck2"><button class="btn small bmove" data-ck="${five ? 5 : 1}">${five ? "👆 Count 5 more" : "👆 Count 1 more"}</button><button class="btn small ghost bmove" data-ck="all">⏩ Count them all</button></div>`;
};
const windHTML = (v, c) => {
  const dir = v.goal < 0 ? -1 : 1, chips = c.hops.length ? `<div class="ck-hops">${c.hops.map(h => `<span class="pill">${hop(h)}</span>`).join("")}</div>` : "";
  if (c.t === v.goal) return `${chips}<div class="bal-done">${v.end ? "🎉 The hands reached the end time! Add up your hops: how long is it?" : dir > 0 ? `🎉 You wound on ${C.dur(v.goal)}. Read the clock: what time is it now?` : `🎉 You wound back ${C.dur(-v.goal)}. Read the clock: what time is it now?`}</div>`;
  const over = Math.abs(c.t) > Math.abs(v.goal) || Math.sign(c.t) === -dir;
  const sizes = [60, 10, 5].concat(v.goal % 5 ? [1] : []);
  return `${chips}<div class="ck-q">${v.end ? "Hop the hands from the start (☀️ dot) to the dashed hands." : `Wound ${dir > 0 ? "on" : "back"}: <b>${C.dur(Math.abs(c.t))}</b> of ${C.dur(Math.abs(v.goal))}`}</div>
    <div class="bmoves ck4">${sizes.map(n => `<button class="btn small bmove" data-w="${n * dir}">${dir > 0 ? "⏩" : "⏪"} ${hop(n * dir)}</button>`).join("")}${c.hops.length ? `<button class="btn small ghost bmove" data-w="undo">↩ Undo</button>` : ""}</div>
    ${over ? `<div class="bal-msg">Oops, too far! ${v.end ? "The hands went past the end time." : `That's more than ${C.dur(Math.abs(v.goal))}.`} Tap ↩ Undo. 💭</div>` : ""}`;
};
MW.TOOLS.clock = {
  btn: "🕰️ Clock", title: "🕰️ <b>Clock Workshop</b>", help: "🕰️ Sumi opened the Clock Workshop to help you!", cls: "mclock",
  opened: m => m.clock.opened++,
  opt: L => { const c = ck(L); return { k: c.k, t: c.t }; },
  html: (v, L) => v.mode === "read" ? readHTML(v, ck(L)) : windHTML(v, ck(L)),
  bind: (v, L) => {
    const c = ck(L), me = L;
    if (v.mode === "read" && c.k >= v.m) finish(c);
    document.querySelectorAll("#mviz [data-ck]").forEach(b => b.onclick = () => { if (MW.lesson() !== me || me.done) return;
      c.k = b.dataset.ck === "all" ? v.m : Math.min(v.m, c.k + +b.dataset.ck); WR.sfx("tap"); if (c.k >= v.m) finish(c); WR.save(); MW.redrawViz(); });
    document.querySelectorAll("#mviz [data-w]").forEach(b => b.onclick = () => { if (MW.lesson() !== me || me.done) return;
      if (b.dataset.w === "undo") c.t -= c.hops.pop() || 0; else { const n = +b.dataset.w; c.hops.push(n); c.t += n; cs().hops++; }
      WR.sfx("tap"); if (c.t === v.goal) finish(c); WR.save(); MW.redrawViz(); });
  }
};

/* ---------- 🕰️ the free-play Workshop ---------- */
const solvedN = () => cs().done + cs().set;
MC.card = () => `<div class="card row tower-card clock-card" id="toClock"><span class="ck-art" aria-hidden="true">${MG._internal.svgClock(10, 10)}</span><div style="flex:1"><b class="title" style="font-size:1.2rem">🕰️ Clock Workshop</b><div class="muted" style="font-weight:700;font-size:.88rem">Drag the hands and see the time in words, a.m. / p.m. and on the 24-hour clock.</div>
  ${solvedN() ? `<div class="row" style="margin-top:4px;gap:6px"><span class="pill">🕰️ ${solvedN()} clock${solvedN() === 1 ? "" : "s"} solved</span></div>` : ""}</div><span class="btn small">Play →</span></div>`;
let W = null;
WR.screens.clock = () => {
  const me = W = { pm: false, played: false };
  WR.view(`<div class="fade-in clock-ws"><div class="row" style="margin:6px 0 8px"><button class="btn ghost small" id="ckBack">← Number Kingdom</button><b class="title">🕰️ Clock Workshop</b></div>
    <div class="card ws-card"><div class="ws-grid">${MC.setterHTML(1)}
      <div class="ws-read" aria-live="polite"><div class="ws-big" id="wsTime">12:00</div><div class="ws-words" id="wsWords">12 o'clock</div>
        <div class="row ws-ap"><button class="btn small" data-ap="0">☀️ a.m.</button><button class="btn small" data-ap="1">🌙 p.m.</button></div>
        <div class="ws-24">24-hour clock: <b id="ws24">00:00</b></div>
        <button class="btn small mint" id="wsDice">🎲 Surprise time</button></div></div></div>
    <div class="card ws-tips"><b>✨ Clock magic</b><ul><li>The <b>short hand</b> shows the hour. The <b>long hand</b> shows the minutes.</li><li>Count the long hand in fives: 5, 10, 15… Each little mark is 1 minute.</li><li>Before the long hand reaches the 6 it is “past”; after the 6 it is “to” the next hour.</li><li>On the 24-hour clock, p.m. hours get 12 more: 3 p.m. is 15:00.</li></ul></div></div>`);
  const show = ({ h, m }) => { if (W !== me) return; const T = ((h % 12) + (me.pm ? 12 : 0)) * 60 + m;
    WR.$("#wsTime").textContent = `${C.hm(h, m)} ${me.pm ? "p.m." : "a.m."}`; WR.$("#wsWords").textContent = C.words(h, m); WR.$("#ws24").textContent = C.h24(T);
    document.querySelectorAll("#main [data-ap]").forEach(b => b.classList.toggle("ghost", +b.dataset.ap !== +me.pm));
    if (!me.played && S && S.t) { me.played = true; cs().plays++; WR.save(); } };
  const st = MC.bindSetter(1, show);
  document.querySelectorAll("#main [data-ap]").forEach(b => b.onclick = () => { me.pm = b.dataset.ap === "1"; WR.sfx("tap"); show(timeOf(st.t)); });
  WR.$("#wsDice").onclick = () => { st.t = Math.floor(Math.random() * 144) * 5 || 5; me.pm = Math.random() < .5; WR.sfx("tap"); WR.$("#cface").innerHTML = V.svg(SET, { t: st.t }); show(timeOf(st.t)); };
  WR.$("#ckBack").onclick = () => WR.go("math");
  WR.navActive("math");
};
MC.stop = () => { S = null; W = null; };
})();
