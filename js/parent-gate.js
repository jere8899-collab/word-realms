/* 👪 Parent gate (REVIEW-2026-10-30.md T19). Loaded before pet-shop.js.
   WR.parentGate(onPass, { why }) opens "Grown-ups only 🔒" and calls onPass() only after a grown-up answers:
   • a question a young child can't easily answer: a number written in words ("Type forty-seven") or a 2-digit × 1-digit sum in
     words ("What is fourteen times six?"), answered on a number pad; or, if a parent PIN is set, the 4-digit PIN instead
   • 3 wrong tries → a 60-second lock-out
   • a pass stays open for 5 minutes, kept in memory only (never saved), then the gate asks again
   The optional PIN is stored as a SHA-256 hash (crypto.subtle) in the save (state.parent.pinHash), so it syncs with cloud saves.
   Gated: cash buttons and the demo unlock in the Shop's 👪 Grown-ups area, Teacher mode, Cloud Castle "Log out & clear device".
   Children never see prices or payment words in front of the gate. */
(function () {
const WR = window.WR;
const PASS_MS = 5 * 60 * 1000, LOCK_MS = 60 * 1000, TRIES = 3;
let passUntil = 0, lockUntil = 0, wrong = 0, expected = null;
const now = () => Date.now() + (gate._skew || 0);           // tests move the clock with WR.parentGate._skew
const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const words = n => n < 20 ? ONES[n] : n < 100 ? TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "") : words(Math.floor(n / 100)) + " hundred" + (n % 100 ? " and " + words(n % 100) : "");
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
function question() {
  if (Math.random() < 0.5) { const n = rnd(21, 99); return { html: `Type the number <em>${words(n)}</em> using digits.`, ans: String(n) }; }
  const a = rnd(12, 19), b = rnd(3, 9); return { html: `What is <em>${words(a)} times ${words(b)}</em>?`, ans: String(a * b) };
}
const hash = async pin => {
  if (!(window.crypto && crypto.subtle && window.TextEncoder)) throw new Error("This browser can't keep a PIN safely here.");
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("wordRealms.parentPin:" + pin));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
};
const hasPin = () => !!(WR.state.parent && WR.state.parent.pinHash);

function gate(onPass, opts = {}) {
  if (now() < passUntil) { onPass && onPass(); return null; }
  const pinMode = hasPin(); let q = pinMode ? null : question(); expected = q && q.ans;
  let val = "";
  const bg = WR.modal(`<div class="pgate" id="pgate"><div class="lock">🔒</div><h2>Grown-ups only</h2>
    <p class="muted" style="font-weight:700;margin-top:0">${WR.esc(opts.why || "Please ask a grown-up to help with this part.")}</p>
    <div class="pq" id="pgQ">${pinMode ? "Enter the grown-up PIN" : q.html}</div>
    <div class="${pinMode ? "pin-dots" : "pans"}" id="pgAns" aria-live="polite"></div>
    <div class="perr" id="pgErr" role="alert"></div>
    <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `<button type="button" data-d="${d}">${d}</button>`).join("")}<button type="button" data-d="del" aria-label="Delete">⌫</button><button type="button" data-d="0">0</button><button type="button" id="pgOk" aria-label="OK">✓</button></div>
    <div class="row"><button class="btn ghost small" id="pgClose">Not now</button></div></div>`, (bg, close) => {
    const box = bg.querySelector(".pgate"), ans = bg.querySelector("#pgAns"), err = bg.querySelector("#pgErr");
    const paint = () => { ans.textContent = pinMode ? "●".repeat(val.length) + "○".repeat(Math.max(0, 4 - val.length)) : val; };
    let tick = null;
    const lockPaint = () => {
      const left = Math.ceil((lockUntil - now()) / 1000);
      if (left > 0) { box.classList.add("locked"); err.textContent = `Too many tries. Please wait ${left} s ⏳`; return true; }
      box.classList.remove("locked"); if (tick) { clearInterval(tick); tick = null; err.textContent = ""; } return false;
    };
    const startLock = () => { if (lockPaint() && !tick) tick = setInterval(() => { if (!document.body.contains(box)) { clearInterval(tick); return; } lockPaint(); }, 500); };
    startLock();
    const submit = async () => {
      if (lockPaint() || !val) return;
      let good = false;
      if (pinMode) good = (await hash(val).catch(() => "")) === WR.state.parent.pinHash; else good = val === expected;
      if (good) { wrong = 0; passUntil = now() + PASS_MS; expected = null; close(); WR.sfx && WR.sfx("tap"); onPass && onPass(); return; }
      wrong++; val = ""; paint();
      if (wrong >= TRIES) { wrong = 0; lockUntil = now() + LOCK_MS; startLock(); }
      else err.textContent = `Not quite. ${TRIES - wrong} ${TRIES - wrong === 1 ? "try" : "tries"} left.`;
      if (!pinMode && !lockPaint()) { q = question(); expected = q.ans; bg.querySelector("#pgQ").innerHTML = q.html; }
    };
    bg.querySelectorAll("[data-d]").forEach(b => b.onclick = () => {
      if (lockPaint()) return; const d = b.dataset.d;
      if (d === "del") val = val.slice(0, -1); else if (val.length < (pinMode ? 4 : 4)) val += d;
      paint(); if (pinMode && val.length === 4) submit();
    });
    bg.querySelector("#pgOk").onclick = submit;
    bg.querySelector("#pgClose").onclick = () => { close(); opts.onCancel && opts.onCancel(); };
    bg._keys = e => { if (!document.body.contains(box)) return document.removeEventListener("keydown", bg._keys); if (/^[0-9]$/.test(e.key)) bg.querySelector(`[data-d="${e.key}"]`).click(); else if (e.key === "Backspace") bg.querySelector('[data-d="del"]').click(); else if (e.key === "Enter") submit(); };
    document.addEventListener("keydown", bg._keys);
    paint();
  });
  return bg;
}
gate.isOpen = () => now() < passUntil;
gate.forget = () => { passUntil = 0; };
gate.hasPin = hasPin;
gate.setPin = async pin => {
  if (!/^\d{4}$/.test(pin)) throw new Error("The PIN needs exactly 4 digits.");
  WR.state.parent = Object.assign({}, WR.state.parent, { pinHash: await hash(pin), set: Date.now() }); WR.save();
};
gate.clearPin = () => { if (WR.state.parent) delete WR.state.parent.pinHash; WR.save(); };
gate._answer = () => expected;                              // test hook (like WR._dbg)
gate._skew = 0;
WR.parentGate = gate;

/* ---------- ⚙️ Settings → 👪 Grown-ups: PIN, Teacher mode ---------- */
WR.openGrownups = () => gate(() => {
  const s = WR.state;
  WR.modal(`<h2>👪 Grown-ups</h2>
    <p class="muted" style="font-weight:700;margin-top:0">These settings stay open for 5 minutes, then the grown-up check comes back.</p>
    <label class="set-row"><span>🗝️ Teacher mode (open every realm)</span><input type="checkbox" id="guUl" ${s.settings.unlockAll ? "checked" : ""}></label>
    <div class="set-row" style="cursor:default"><span>🔢 Grown-up PIN <small class="muted" id="guPinState">${hasPin() ? "· on" : "· off (a sum question is used)"}</small></span></div>
    <div class="row" style="justify-content:center"><input class="input" id="guPin" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="4 digits" style="max-width:130px;text-align:center;letter-spacing:6px" autocomplete="off">
      <button class="btn small mint" id="guPinSet">${hasPin() ? "Change PIN" : "Set PIN"}</button>${hasPin() ? '<button class="btn small ghost" id="guPinOff">Remove PIN</button>' : ""}</div>
    <div class="cc-err" id="guErr" role="alert"></div>
    <p class="set-note muted">The PIN is saved scrambled (SHA-256) with this adventure and syncs with the Cloud Castle. Cash items in the Shop, Teacher mode and "Log out &amp; clear device" all ask for it.</p>
    <p class="set-note muted">🗣️ Listening voice: ${WR.esc(window.Speech ? Speech.voiceName() : "-")}</p>
    <div class="row" style="justify-content:center"><button class="btn small" id="guDone">Done</button></div>`, (bg, close) => {
    bg.querySelector("#guUl").onchange = e => { s.settings.unlockAll = e.target.checked; WR.save(); WR.toast(e.target.checked ? "🗝️ Every realm is open" : "🔒 Realms open in order again"); };
    const err = bg.querySelector("#guErr");
    bg.querySelector("#guPinSet").onclick = async () => { try { await gate.setPin(bg.querySelector("#guPin").value.trim()); close(); WR.toast("🔢 Grown-up PIN saved"); WR.openGrownups(); } catch (x) { err.textContent = x.message; } };
    const off = bg.querySelector("#guPinOff"); if (off) off.onclick = () => { gate.clearPin(); close(); WR.toast("PIN removed"); WR.openGrownups(); };
    bg.querySelector("#guDone").onclick = () => { close(); if (WR.current && WR.current() === "home") WR.screens.home(); };
  });
}, { why: "Grown-up settings: PIN and Teacher mode." });
})();
