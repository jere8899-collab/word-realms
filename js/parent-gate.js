/* 👪 Parent gate (REVIEW-2026-10-30.md T19). Loaded before pet-shop.js.
   WR.parentGate(onPass, { why }) opens "Grown-ups only 🔒" and calls onPass() only after a grown-up answers:
   • a question a young child can't easily answer: a number written in words ("Type forty-seven") or a 2-digit × 1-digit sum in
     words ("What is fourteen times six?"), answered on a number pad; or, if a parent PIN is set, the 4-digit PIN instead
   • 3 wrong tries → a lock-out of 1 min, then 5 min, then 15 min, saved in the save so a reload keeps it (R3)
   • a pass stays open for 5 minutes, kept in memory only (never saved), then the gate asks again
   The optional PIN is stored as a SHA-256 hash (crypto.subtle) in the save (state.parent.pinHash), so it syncs with cloud saves.
   Gated: cash buttons and the demo unlock in the Shop's 👪 Grown-ups area, Teacher mode, Cloud Castle "Log out & clear device", the 📊 Learning Report (js/report.js).
   Children never see prices or payment words in front of the gate. */
(function () {
const WR = window.WR;
const PASS_MS = 5 * 60 * 1000, TRIES = 3;
const LOCKS = [60e3, 5 * 60e3, 15 * 60e3];                   // R3: each lock-out is longer: 1 min → 5 min → 15 min (then stays 15)
let passUntil = 0, expected = null;
/* R3: the lock and the wrong-try count live in the save (state.parent.lock = { until, wrong, n }), so a reload, a reopened app
   or another cloud device still shows the lock; n (lock-outs so far) resets after a grown-up passes. */
const lock = () => { const p = WR.state.parent = WR.state.parent || {}; return p.lock = Object.assign({ until: 0, wrong: 0, n: 0 }, p.lock); };
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
      const left = Math.ceil((lock().until - now()) / 1000);
      if (left > 0) { box.classList.add("locked"); err.textContent = `Too many tries. Please wait ${left >= 60 ? Math.floor(left / 60) + " min " + String(left % 60).padStart(2, "0") + " s" : left + " s"} ⏳`; return true; }
      box.classList.remove("locked"); if (tick) { clearInterval(tick); tick = null; err.textContent = ""; } return false;
    };
    const startLock = () => { if (lockPaint() && !tick) tick = setInterval(() => { if (!document.body.contains(box)) { clearInterval(tick); return; } lockPaint(); }, 500); };
    startLock();
    const submit = async () => {
      if (lockPaint() || !val) return;
      let good = false;
      if (pinMode) good = (await hash(val).catch(() => "")) === WR.state.parent.pinHash; else good = val === expected;
      if (good) { const lk = lock(); if (lk.wrong || lk.n || lk.until) { Object.assign(lk, { wrong: 0, n: 0, until: 0 }); WR.save(); } passUntil = now() + PASS_MS; expected = null; close(); WR.sfx && WR.sfx("tap"); onPass && onPass(); return; }
      const lk = lock(); lk.wrong++; val = ""; paint();
      if (lk.wrong >= TRIES) { lk.wrong = 0; lk.until = now() + LOCKS[Math.min(lk.n, LOCKS.length - 1)]; lk.n++; WR.save(); startLock(); }
      else { WR.save(); err.textContent = `Not quite. ${TRIES - lk.wrong} ${TRIES - lk.wrong === 1 ? "try" : "tries"} left.`; }
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
    ${WR.screens.report ? `<button class="btn mint gu-report" id="guReport">📊 Learning Report<small>days played, skills, weak spots &amp; tips</small></button>` : ""}
    <label class="set-row"><span>🗝️ Teacher mode (open every realm)</span><input type="checkbox" id="guUl" ${s.settings.unlockAll ? "checked" : ""}></label>
    <div class="set-row" style="cursor:default"><span>🔢 Grown-up PIN <small class="muted" id="guPinState">${hasPin() ? "· on" : "· off (a sum question is used)"}</small></span></div>
    <div class="row" style="justify-content:center"><input class="input" id="guPin" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="4 digits" style="max-width:130px;text-align:center;letter-spacing:6px" autocomplete="off">
      <button class="btn small mint" id="guPinSet">${hasPin() ? "Change PIN" : "Set PIN"}</button>${hasPin() ? '<button class="btn small ghost" id="guPinOff">Remove PIN</button>' : ""}</div>
    <div class="cc-err" id="guErr" role="alert"></div>
    <p class="set-note muted">The PIN is saved scrambled (SHA-256) with this adventure and syncs with the Cloud Castle. Cash items in the Shop, Teacher mode and "Log out &amp; clear device" all ask for it.</p>
    <p class="set-note muted">🗣️ Listening voice: ${WR.Voice.recorded() ? "recorded storyteller (falls back to " : ""}${WR.esc(window.Speech ? Speech.voiceName() : "-")}${WR.Voice.recorded() ? ")" : ""}</p>
    <div class="row gu-reset" style="justify-content:center"><button class="btn small peach" id="guReset">🧹 Reset progress on this device</button>${WR.backups().length ? `<button class="btn small ghost" id="guUndo">↩️ Undo reset <small>(${WR.esc(WR.backupDay(WR.backups()[0]))})</small></button>` : ""}</div>
    <div class="row" style="justify-content:center"><button class="btn small" id="guDone">Done</button></div>`, (bg, close) => {
    bg.querySelector("#guUl").onchange = e => { s.settings.unlockAll = e.target.checked; WR.save(); WR.toast(e.target.checked ? "🗝️ Every realm is open" : "🔒 Realms open in order again"); };
    const rp = bg.querySelector("#guReport"); if (rp) rp.onclick = () => { close(); WR.go("report", "week"); };
    const err = bg.querySelector("#guErr");
    bg.querySelector("#guPinSet").onclick = async () => { try { await gate.setPin(bg.querySelector("#guPin").value.trim()); close(); WR.toast("🔢 Grown-up PIN saved"); WR.openGrownups(); } catch (x) { err.textContent = x.message; } };
    const off = bg.querySelector("#guPinOff"); if (off) off.onclick = () => { gate.clearPin(); close(); WR.toast("PIN removed"); WR.openGrownups(); };
    bg.querySelector("#guReset").onclick = () => { close(); WR.resetDialog(); };
    const un = bg.querySelector("#guUndo"); if (un) un.onclick = () => { if (WR.restoreBackup()) { close(); WR.toast("↩️ The adventure is back, just as it was!", 2500); WR.restart && WR.restart(); } };
    bg.querySelector("#guDone").onclick = () => { close(); if (WR.current && WR.current() === "home") WR.screens.home(); };
  });
}, { why: "Grown-up settings: PIN and Teacher mode." });

/* ---------- 🧹 Reset progress (R2): only behind the gate, typed RESET, this device only, with a 7-day backup + Undo ---------- */
WR.resetDialog = () => {
  const cloud = WR.Cloud && WR.Cloud.user, who = cloud && WR.Cloud.username;
  WR.modal(`<div class="reset-dlg" id="resetDlg"><h2>🧹 Reset progress on this device</h2>
    <p style="font-weight:700">This clears the stars, pet, stickers and lessons of <b>${WR.userText(WR.state.name || "this adventure")}</b> on this device.</p>
    ${cloud ? `<p class="reset-cloud">☁️ This device is logged in to the Cloud Castle${who ? ` as <b>${WR.esc(who)}</b>` : ""}. Resetting <b>logs this device out first</b>, so the Cloud Castle copy is <b>not</b> changed. Log in again any time to get it back.</p>` : ""}
    <p class="muted" style="font-weight:700">A backup is kept on this device for 7 days: ⚙️ → 👪 Grown-ups → ↩️ Undo reset.</p>
    <label class="muted" for="rsIn" style="font-weight:800">Type <b>RESET</b> to confirm</label>
    <input class="input" id="rsIn" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="RESET" style="text-align:center;letter-spacing:3px;max-width:200px;margin:6px auto;display:block">
    <div class="row" style="justify-content:center"><button class="btn ghost small" id="rsNo">Keep my adventure</button><button class="btn peach small" id="rsGo" disabled>Reset</button></div></div>`, (bg, close) => {
    const inp = bg.querySelector("#rsIn"), go = bg.querySelector("#rsGo");
    inp.oninput = () => { go.disabled = inp.value.trim().toUpperCase() !== "RESET"; };
    bg.querySelector("#rsNo").onclick = close;
    WR.tapOnce(go, async () => {
      if (inp.value.trim().toUpperCase() !== "RESET") return;
      WR.backupSave();
      if (WR.Cloud && WR.Cloud.user) await WR.Cloud.signOut(true);   // pushes any real unsaved progress, logs out, then clears this device
      else WR.reset();
      close(); WR.toast("🧹 Fresh start! (Undo is in 👪 Grown-ups for 7 days)", 2500); WR.restart && WR.restart();
    });
  });
};
})();
