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
WR.setFocus = on => body.classList.toggle("wr-focus", !!on);
const wrap = (obj, name, before) => { const f = obj && obj[name]; if (typeof f !== "function" || f._ux) return; const g = function (...a) { before && before(...a); return f.apply(this, a); }; g._ux = true; obj[name] = g; };
// starters of full-screen activities → focus mode on
["startLesson", "playSpecial", "startSpeaking", "startWriting", "startPlacement", "startStory"].forEach(n => wrap(WR, n, () => WR.setFocus(true)));
if (WR.Math) ["startLesson", "startDojo"].forEach(n => wrap(WR.Math, n, () => WR.setFocus(true)));
// screen changes → focus off (unless the screen itself is a focus screen), old confetti/toasts cleared
const go0 = WR.go;
WR.go = (screen, arg) => { WR.setFocus(FOCUS_SCREENS.test(screen)); WR.clearFx && WR.clearFx(true); WR.starNote && WR.starNote(); const r = go0(screen, arg); WR.Rewards && WR.Rewards.check(); return r; };   // a new screen drops any pending "fewer stars" note

/* ---------- views ---------- */
const view0 = WR.view;
WR.view = html => { WR.clearFx && WR.clearFx(false); view0(html); WR.layoutLesson(); afterView(); };
// merge the old "card hud" + "card side" into one slim row inside .lesson (works for lessons, speaking and maths)
WR.layoutLesson = () => {
  const main = WR.$("#main"); if (!main) return;
  const top = [...main.querySelectorAll(":scope > .row")].find(r => r.querySelector("#quitBtn,#qBackRealm")); if (top) top.classList.add("lesson-top");
  const hud = main.querySelector(":scope > .card.hud"), lesson = hud && hud.nextElementSibling;
  if (!hud || !lesson || !lesson.classList.contains("lesson")) return;
  const bar = document.createElement("div"); bar.className = "card lbar";
  hud.classList.remove("card"); bar.appendChild(hud);
  const st = lesson.querySelector("#lstats"); if (st) { st.classList.remove("muted"); st.classList.add("lchip"); st.removeAttribute("style"); bar.appendChild(st); }
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
/* reduced motion as a body class too (the CSS media query does the real work) */
if (WR.reducedMotion && WR.reducedMotion()) body.classList.add("reduce-motion");
})();
