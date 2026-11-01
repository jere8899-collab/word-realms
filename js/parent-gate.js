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
const now = () => Date.now() + (gate._skew || 0);           // tests move the clock with WR.parentGate._skew (test builds only)
const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const words = n => n < 20 ? ONES[n] : n < 100 ? TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "") : words(Math.floor(n / 100)) + " hundred" + (n % 100 ? " and " + words(n % 100) : "");
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
/* R4: questions the game's own players aren't drilled on (it teaches 2-digit number words and times tables): a 3-digit
   number in words, or "type the 3rd, 1st and 4th digits of 7 5 2 9"; then ✓ must be pressed and held for 2 seconds. */
const ORD = ["1st", "2nd", "3rd", "4th"];
function question() {
  if (Math.random() < 0.5) { const n = rnd(101, 999); return { html: `Type the number <em>${words(n)}</em> using digits.`, ans: String(n) }; }
  const d = [rnd(1, 9), rnd(1, 9), rnd(1, 9), rnd(1, 9)], pick = WR.shuffle([0, 1, 2, 3]).slice(0, 3);
  return { html: `Type the <em>${ORD[pick[0]]}, ${ORD[pick[1]]} and ${ORD[pick[2]]}</em> digits of <b class="pg-digits">${d.join(" ")}</b>`, ans: pick.map(i => d[i]).join("") };
}
const TEST = window.__WR_TEST || null;                      // test-only knobs, never set on the live site
const HOLD_MS = TEST && TEST.holdMs != null ? TEST.holdMs : 2000;
/* the PIN is hashed with a random per-save salt (state.parent.salt); an older unsalted hash still works once and is upgraded */
const hash = async (pin, salt) => {
  if (!(window.crypto && crypto.subtle && window.TextEncoder)) throw new Error("This browser can't keep a PIN safely here.");
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("wordRealms.parentPin:" + (salt ? salt + ":" : "") + pin));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
};
const checkPin = async pin => {
  const P = WR.state.parent || {};
  if ((await hash(pin, P.salt).catch(() => "")) !== P.pinHash) return false;
  if (!P.salt) await gate.setPin(pin);                       // upgrade an old unsalted PIN
  return true;
};
const hasPin = () => !!(WR.state.parent && WR.state.parent.pinHash);

/* R4: opts.money (cash buttons, demo unlock) accepts ONLY the PIN, every time; with no PIN yet, the grown-up passes the
   question gate and sets one first ("Skip" keeps cash locked). The first question pass also offers to set a PIN, once. */
const pinOffer = () => !hasPin() && !(WR.state.parent && WR.state.parent.pinAsked) && !(TEST && TEST.pinOffer === false);
function gate(onPass, opts = {}) {
  if (opts.money && !hasPin()) return gate(() => pinSetup({ money: true, done: onPass, skip: opts.onCancel }), { why: opts.why });
  if (!opts.money && now() < passUntil) { onPass && onPass(); return null; }
  const pinMode = hasPin(); let q = pinMode ? null : question(); expected = q && q.ans;
  let val = "";
  const bg = WR.modal(`<div class="pgate" id="pgate"><div class="lock">🔒</div><h2>Grown-ups only</h2>
    <p class="muted" style="font-weight:700;margin-top:0">${WR.esc(opts.why || "Please ask a grown-up to help with this part.")}</p>
    <div class="pq" id="pgQ">${pinMode ? "Enter the grown-up PIN" : q.html}</div>
    <div class="${pinMode ? "pin-dots" : "pans"}" id="pgAns" aria-live="polite"></div>
    <div class="perr" id="pgErr" role="alert"></div>
    <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `<button type="button" data-d="${d}">${d}</button>`).join("")}<button type="button" data-d="del" aria-label="Delete">⌫</button><button type="button" data-d="0">0</button><button type="button" id="pgOk" aria-label="OK" class="${pinMode ? "" : "hold"}" style="--hold:${HOLD_MS}ms">✓</button></div>
    ${pinMode ? "" : `<p class="pg-holdtip muted" id="pgHold">Then press and hold ✓ for 2 seconds</p>`}
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
      if (pinMode) good = await checkPin(val); else good = val === expected;
      if (good) { const lk = lock(); if (lk.wrong || lk.n || lk.until) { Object.assign(lk, { wrong: 0, n: 0, until: 0 }); WR.save(); } passUntil = now() + PASS_MS; expected = null; close(); WR.sfx && WR.sfx("tap");
        if (!pinMode && !opts.money && pinOffer()) pinSetup({ done: onPass, skip: onPass }); else onPass && onPass(); return; }
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
    const ok = bg.querySelector("#pgOk");
    if (pinMode || !HOLD_MS) ok.onclick = submit;
    else {                                                    // press and hold ✓ (pointer or Enter) for HOLD_MS
      let ht = null;
      const start = e => { if (e) e.preventDefault(); if (ht || lockPaint() || !val) return; ok.classList.add("holding"); ht = setTimeout(() => { ht = null; ok.classList.remove("holding"); submit(); }, HOLD_MS); };
      const stop = () => { if (!ht) return; clearTimeout(ht); ht = null; ok.classList.remove("holding"); err.textContent = "Keep holding ✓ for 2 seconds ⏳"; };
      ok.addEventListener("pointerdown", start); ["pointerup", "pointerleave", "pointercancel"].forEach(n => ok.addEventListener(n, stop));
      ok.addEventListener("contextmenu", e => e.preventDefault());
      bg._holdStart = start; bg._holdStop = stop;
    }
    bg.querySelector("#pgClose").onclick = () => { close(); opts.onCancel && opts.onCancel(); };
    bg._keys = e => { if (!document.body.contains(box)) return document.removeEventListener("keydown", bg._keys); if (/^[0-9]$/.test(e.key)) bg.querySelector(`[data-d="${e.key}"]`).click(); else if (e.key === "Backspace") bg.querySelector('[data-d="del"]').click(); else if (e.key === "Enter") { if (bg._holdStart) { if (!e.repeat) bg._holdStart(); } else submit(); } };
    bg._keyup = e => { if (e.key === "Enter" && bg._holdStop) bg._holdStop(); if (!document.body.contains(box)) document.removeEventListener("keyup", bg._keyup); };
    document.addEventListener("keyup", bg._keyup);
    document.addEventListener("keydown", bg._keys);
    paint();
  });
  return bg;
}
function pinSetup({ money, done, skip }) {
  WR.state.parent = Object.assign({}, WR.state.parent, { pinAsked: true }); WR.save();
  WR.modal(`<div class="pin-setup" id="pinSetup"><div class="lock">🔢</div><h2>Set a grown-up PIN</h2>
    <p style="font-weight:700;margin-top:0">${money ? "Cash items need a grown-up PIN." : "A 4-digit PIN keeps cash items safe."} Children can work out sums, but not your PIN.</p>
    <input class="input" id="psPin" inputmode="numeric" pattern="[0-9]*" maxlength="4" type="password" placeholder="4 digits" autocomplete="off" style="max-width:150px;text-align:center;letter-spacing:8px;margin:0 auto;display:block">
    <input class="input" id="psPin2" inputmode="numeric" pattern="[0-9]*" maxlength="4" type="password" placeholder="again" autocomplete="off" style="max-width:150px;text-align:center;letter-spacing:8px;margin:8px auto 0;display:block">
    <div class="cc-err" id="psErr" role="alert"></div>
    <p class="muted" style="font-size:.85rem;font-weight:700">${money ? "" : "You can skip this, but cash items stay locked until a PIN is set. "}Change it any time in ⚙️ → 👪 Grown-ups.</p>
    <div class="row" style="justify-content:center"><button class="btn ghost small" id="psSkip">${money ? "Not now" : "Skip"}</button><button class="btn mint small" id="psSet">Save PIN</button></div></div>`, (bg, close) => {
    const err = bg.querySelector("#psErr");
    bg.querySelector("#psSkip").onclick = () => { close(); if (money) WR.toast("🔒 Cash items stay locked until a grown-up PIN is set", 2400); skip && skip(); };
    bg.querySelector("#psSet").onclick = async () => {
      const a = bg.querySelector("#psPin").value.trim(), b = bg.querySelector("#psPin2").value.trim();
      if (!/^\d{4}$/.test(a)) return err.textContent = "The PIN needs exactly 4 digits.";
      if (a !== b) return err.textContent = "The two PINs don't match.";
      try { await gate.setPin(a); } catch (x) { return err.textContent = x.message; }
      close(); WR.toast("🔢 Grown-up PIN saved"); done && done();
    };
  });
}
gate.isOpen = () => now() < passUntil;
gate.forget = () => { passUntil = 0; };
gate.hasPin = hasPin;
gate.setPin = async pin => {
  if (!/^\d{4}$/.test(pin)) throw new Error("The PIN needs exactly 4 digits.");
  const salt = [...crypto.getRandomValues(new Uint8Array(12))].map(b => b.toString(16).padStart(2, "0")).join("");
  WR.state.parent = Object.assign({}, WR.state.parent, { pinHash: await hash(pin, salt), salt, set: Date.now() }); WR.save();
};
gate.clearPin = () => { if (WR.state.parent) { delete WR.state.parent.pinHash; delete WR.state.parent.salt; } WR.save(); };
if (TEST) { gate._answer = () => expected; gate._skew = 0; }   // R4: test hooks exist only when a test sets window.__WR_TEST
WR.parentGate = gate;

/* ---------- ⚙️ Settings → 👪 Grown-ups: PIN, Teacher mode ---------- */
/* 📚 R16: the teacher wording (Cambridge exam parts, grammar terms) lives here, for grown-ups, instead of on the
   children's screens. A game registers WR.addGrownNote(id, name, rid => text or Promise<text>). */
const NOTES = [];
WR.addGrownNote = (id, name, fn) => { if (!NOTES.some(n => n.id === id)) NOTES.push({ id, name, fn }); };
WR.grownNotes = () => NOTES.slice();
WR.openAbout = async (rid = "a1") => {
  const lv = (WR.realms || []).map(r => r.id);
  const rows = await Promise.all(NOTES.map(async n => { try { return `<div class="gu-note"><b>${n.name}</b><p>${WR.esc(String(await n.fn(rid)).replace(/^👪 Grown-ups:\s*/, ""))}</p></div>`; } catch (e) { return ""; } }));
  WR.modal(`<h2>📚 What the games teach</h2><div class="ch-levels gu-lv">${lv.map(l => `<button class="ch-lv${l === rid ? " on" : ""}" data-l="${l}">${l.toUpperCase()}</button>`).join("")}</div>
    <div class="gu-notes" id="guNotes">${rows.join("")}</div><div class="row" style="justify-content:center"><button class="btn small" id="abDone">Done</button></div>`, (bg, close) => {
    bg.querySelectorAll(".gu-lv [data-l]").forEach(b => b.onclick = () => { close(); WR.openAbout(b.dataset.l); });
    bg.querySelector("#abDone").onclick = close;
  });
};
WR.openGrownups = () => gate(() => {
  const s = WR.state;
  WR.modal(`<h2>👪 Grown-ups</h2>
    <p class="muted" style="font-weight:700;margin-top:0">These settings stay open for 5 minutes, then the grown-up check comes back.</p>
    ${WR.screens.report ? `<button class="btn mint gu-report" id="guReport">📊 Learning Report<small>days played, skills, weak spots &amp; tips</small></button>` : ""}
    <div class="row" style="justify-content:center;margin:6px 0"><button class="btn small ghost" id="guAbout">📚 What the games teach</button></div>
    <label class="set-row"><span>🗝️ Teacher mode (open every realm)</span><input type="checkbox" id="guUl" ${s.settings.unlockAll ? "checked" : ""}></label>
    <div class="set-row" style="cursor:default"><span>🔢 Grown-up PIN <small class="muted" id="guPinState">${hasPin() ? "· on" : "· off (cash items stay locked)"}</small></span></div>
    <div class="row" style="justify-content:center"><input class="input" id="guPin" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="4 digits" style="max-width:130px;text-align:center;letter-spacing:6px" autocomplete="off">
      <button class="btn small mint" id="guPinSet">${hasPin() ? "Change PIN" : "Set PIN"}</button>${hasPin() ? '<button class="btn small ghost" id="guPinOff">Remove PIN</button>' : ""}</div>
    <div class="cc-err" id="guErr" role="alert"></div>
    <p class="set-note muted">The PIN is saved scrambled (salted SHA-256) with this adventure and syncs with the Cloud Castle. Cash items in the Shop accept only the PIN; Teacher mode, the Report and "Log out &amp; clear device" ask for it too.</p>
    <p class="set-note muted">🗣️ Listening voice: ${WR.Voice.recorded() ? "recorded storyteller (falls back to " : ""}${WR.esc(window.Speech ? Speech.voiceName() : "-")}${WR.Voice.recorded() ? ")" : ""}</p>
    <div class="row gu-reset" style="justify-content:center"><button class="btn small peach" id="guReset">🧹 Reset progress on this device</button>${WR.backups().length ? `<button class="btn small ghost" id="guUndo">↩️ Undo reset <small>(${WR.esc(WR.backupDay(WR.backups()[0]))})</small></button>` : ""}</div>
    <div class="row" style="justify-content:center"><button class="btn small" id="guDone">Done</button></div>`, (bg, close) => {
    bg.querySelector("#guUl").onchange = e => { s.settings.unlockAll = e.target.checked; WR.save(); WR.toast(e.target.checked ? "🗝️ Every realm is open" : "🔒 Realms open in order again"); };
    const rp = bg.querySelector("#guReport"); if (rp) rp.onclick = () => { close(); WR.go("report", "week"); };
    bg.querySelector("#guAbout").onclick = () => { close(); const c = WR.continueTarget && WR.continueTarget(); WR.openAbout((c && c.realm && c.realm.id) || WR.state.startLevel || "a1"); };
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
