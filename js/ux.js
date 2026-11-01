/* 📱 Phone UX layer (REVIEW-2026-10-30.md). Loaded after main.js. It wraps a few WR functions instead of rewriting them:
   • focus mode (T2): the bottom tab bar is hidden while a lesson, special game, speaking, writing, story, placement quiz or
     maths practice is open (they all have "← Leave"); WR.go() to any other screen brings it back
   • WR.go() clears leftover confetti and toasts (T3/T4); WR.view() clears old confetti and builds the slim lesson bar (T2)
   • the lesson's progress card + pet card become one row: .lesson.lhud > .lbar (progress + ⭐/🔥 chip) | .side (pet + bubble)
   • the on-screen keyboard hides the tab bar (T14: focus + visualViewport)
   • the maths grade row scrolls to the child's grade (T12) */
(function () {
const WR = window.WR;
const body = document.body;
const FOCUS_SCREENS = /^(story|phonicsRound|charmsRound)$/;
const isFocus = s => FOCUS_SCREENS.test(s) || WR.gapGames.some(g => g.round === s);   // + every gap game's round (js/gap-round.js)
WR.setFocus = on => body.classList.toggle("wr-focus", !!on);
const wrap = (obj, name, before) => { const f = obj && obj[name]; if (typeof f !== "function" || f._ux) return; const g = function (...a) { before && before(...a); return f.apply(this, a); }; g._ux = true; obj[name] = g; };
// starters of full-screen activities → focus mode on
["startLesson", "playSpecial", "startSpeaking", "startWriting", "startPlacement", "startStory"].forEach(n => wrap(WR, n, () => WR.setFocus(true)));
if (WR.Math) ["startLesson", "startDojo"].forEach(n => wrap(WR.Math, n, () => WR.setFocus(true)));
// screen changes → focus off (unless the screen itself is a focus screen), old confetti/toasts cleared
const go0 = WR.go;
WR.go = (screen, arg) => { if (screen !== "home") WR._welcome = null; WR.setFocus(isFocus(screen)); WR.clearFx && WR.clearFx(true); WR.starNote && WR.starNote(); const r = go0(screen, arg); WR.Rewards && WR.Rewards.check(); WR.flushToasts && WR.flushToasts(); return r; };   // a new screen drops any pending "fewer stars" note

/* ---------- views ---------- */
const view0 = WR.view;
WR.view = html => { WR.clearFx && WR.clearFx(false); view0(html); WR.layoutLesson(); afterView(); WR.flushToasts && setTimeout(WR.flushToasts, 0); };   // R7: held pop-ups show on the next screen without a question
// merge the old "card hud" + "card side" into one slim row inside .lesson (works for lessons, speaking and maths)
WR.layoutLesson = () => {
  const main = WR.$("#main"); if (!main) return;
  const top = [...main.querySelectorAll(":scope > .row")].find(r => r.querySelector("#quitBtn,#qBackRealm")); if (top) top.classList.add("lesson-top");
  const hud = main.querySelector(":scope > .card.hud"), lesson = hud && hud.nextElementSibling;
  if (!hud || !lesson || !lesson.classList.contains("lesson")) return;
  const bar = document.createElement("div"); bar.className = "card lbar";
  hud.classList.remove("card"); bar.appendChild(hud);
  const st = lesson.querySelector("#lstats"); if (st) bar.appendChild(st);
  lesson.insertBefore(bar, lesson.firstChild); lesson.classList.add("lhud");
};
function afterView() {
  // T12: keep the chosen maths grade in view when the grade row scrolls sideways (wide screens)
  const sel = document.querySelector(".gchips .gchip.sel");
  if (sel) { const row = sel.parentElement; if (row.scrollWidth > row.clientWidth + 2) row.scrollLeft = Math.max(0, sel.offsetLeft - row.clientWidth / 2 + sel.offsetWidth / 2); }
}

/* ---------- T14: on-screen keyboard ---------- */
const typing = el => el && (el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && !/^(checkbox|radio|range|button|submit|reset|file|color)$/i.test(el.type)) || el.isContentEditable);
document.addEventListener("focusin", e => { if (typing(e.target) && (window.matchMedia ? matchMedia("(pointer:coarse)").matches : true)) body.classList.add("kbd-open"); });
document.addEventListener("focusout", () => setTimeout(() => { if (!typing(document.activeElement)) body.classList.remove("kbd-open"); }, 60));
if (window.visualViewport) {
  const vv = window.visualViewport;
  vv.addEventListener("resize", () => {
    const shrunk = vv.height < window.innerHeight - 140;
    if (shrunk) body.classList.add("kbd-open"); else if (!typing(document.activeElement)) body.classList.remove("kbd-open");
  });
}
/* ---------- R6 (REVIEW-2026-11-01): the phone's Back button moves around the game instead of leaving it ----------
   One "trap" history entry sits on top while the child is anywhere but the map, plus a small in-memory trail of screens.
   Back: closes an open pop-up → else in a round asks "Leave this lesson? Your stars so far are kept" → else goes to the
   previous screen (realm → map, Times-Table Tower → Maths …) → on the map it leaves the app as usual. */
const trail = [];                                   // non-round screens since the map: [{ screen, arg }]
const ROUND_DONE = ".result, .ch-done, .ph-done, .story-done, .sw-done";
let popping = false;
const trapOn = () => !!(history.state && history.state.wrTrap);
const setTrap = () => { if (!trapOn()) try { history.pushState({ wrTrap: 1 }, ""); } catch (e) { } };
const go1 = WR.go;
WR.go = (screen, arg) => {
  if (screen === "home") trail.length = 0;
  else if (!isFocus(screen)) { const top = trail[trail.length - 1]; if (top && top.screen === screen) top.arg = arg; else trail.push({ screen, arg }); }
  const r = go1(screen, arg);
  if (screen !== "home" && !popping) setTrap();
  return r;
};
// rounds started without WR.go (lessons, specials, maths…) also get the trap
const trapWrap = (o, n) => { const f = o && o[n]; if (typeof f !== "function" || f._trap) return; const g = function (...a) { setTrap(); return f.apply(this, a); }; g._trap = g._ux = true; o[n] = g; };
["startLesson", "playSpecial", "startSpeaking", "startWriting", "startPlacement", "startStory"].forEach(n => trapWrap(WR, n));
if (WR.Math) ["startLesson", "startDojo"].forEach(n => trapWrap(WR.Math, n));
const inRound = () => body.classList.contains("wr-focus") && !document.querySelector(ROUND_DONE);
const backTo = () => { const top = trail.length && WR.current && WR.current() === trail[trail.length - 1].screen && !body.classList.contains("wr-focus") ? trail.pop() : null; return trail[trail.length - 1] || null; };
WR.leaveAsk = onLeave => WR.modal(`<div class="leave-ask" id="leaveAsk"><div class="petbox bounce" style="width:96px;height:96px;margin:0 auto">${WR.petHTML ? WR.petHTML() : ""}</div>
    <h2>Leave this lesson?</h2><p style="font-weight:700">Your stars so far are kept ⭐</p>
    <div class="row" style="justify-content:center"><button class="btn mint" id="laStay">Keep playing</button><button class="btn ghost" id="laGo">Leave</button></div></div>`, (bg, close) => {
  bg.querySelector("#laStay").onclick = close;
  bg.querySelector("#laGo").onclick = () => { close(); onLeave(); };
});
WR.navBack = () => {
  const modals = [...document.querySelectorAll(".modal-bg")];
  if (modals.length) { modals[modals.length - 1].remove(); return true; }
  if (inRound()) { const t = trail[trail.length - 1]; WR.leaveAsk(() => t ? WR.go(t.screen, t.arg) : WR.go("home")); return true; }
  const cur = WR.current && WR.current();
  if (body.classList.contains("wr-focus")) { const t = trail[trail.length - 1]; t ? WR.go(t.screen, t.arg) : WR.go("home"); return true; }   // a finished round
  if (cur && cur !== "home") { const t = backTo(); popping = true; try { t ? WR.go(t.screen, t.arg) : WR.go("home"); } finally { popping = false; } return WR.current() !== "home" ? true : "map"; }
  return false;                                     // on the map: let Back leave the app
};
addEventListener("popstate", () => {
  if (!WR.$("#navbar") || !WR.realms) return;
  if (document.querySelector(".onb")) return;      // onboarding: nothing to go back to inside the game
  const r = WR.navBack();
  if (r === true) setTrap();                       // still inside a screen: put the trap back
  else if (!r) history.back();                     // already on the map: leave the app, as Back always does there
  // r === "map": we just arrived on the map at the bottom entry, so the next Back leaves
});

/* reduced motion as a body class too (the CSS media query does the real work) */
if (WR.reducedMotion && WR.reducedMotion()) body.classList.add("reduce-motion");
})();
