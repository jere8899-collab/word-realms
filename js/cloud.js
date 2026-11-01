/* ☁️ Cloud Castle: optional username + password accounts with cloud saves (Supabase).
   The game never waits for this file. Guests (and anyone offline, or if the CDN fails) keep playing on the
   local save exactly as before. The Supabase library is only downloaded when a player opens the Cloud Castle
   or already has a session on this device.
   Usernames map to a synthetic email: <name>@players.wordrealms.app (kids don't need a real email). */
(function () {
const WR = window.WR;
const CFG = {
  url: "https://aoqfqopzycowbnjshzvg.supabase.co",
  key: "sb_publishable_uohGzZ5-4NxurifutYE4Xg_8FMVfiVp", // publishable (public) key; RLS limits each player to their own row
  lib: "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.min.js",
  domain: "players.wordrealms.app"
};
const SAVE_KEY = "wordRealms.save.v1", META_KEY = "wordRealms.cloud.v1";
const AUTH_KEY = "sb-" + CFG.url.split("//")[1].split(".")[0] + "-auth-token";
const DEBOUNCE = 3000;
const C = WR.Cloud = { status: "guest", user: null, username: null, cfg: CFG };
let client = null, libPromise = null, timer = null, pushing = null, again = false;

/* ---------- meta: who is linked and what we last synced ---------- */
const meta = () => { try { return JSON.parse(localStorage.getItem(META_KEY)) || {}; } catch (e) { return {}; } };
const setMeta = m => localStorage.setItem(META_KEY, JSON.stringify(Object.assign(meta(), m)));
C.meta = meta;

/* ---------- validation & friendly errors ---------- */
C.validName = n => /^[a-z0-9_]{3,20}$/.test(String(n || "").trim().toLowerCase());
C.nameError = n => {
  n = String(n || "").trim();
  if (n.length < 3) return "Your castle name needs at least 3 letters.";
  if (n.length > 20) return "Please keep your castle name to 20 letters or fewer.";
  if (!/^[A-Za-z0-9_]+$/.test(n)) return "Use only letters, numbers and _ (no spaces).";
  return null;
};
C.passError = p => String(p || "").length < 6 ? "Your secret password needs at least 6 characters." : null;
C.email = n => String(n).trim().toLowerCase() + "@" + CFG.domain;
C.friendly = (e, mode) => {
  const m = String((e && (e.message || e.error_description || e)) || "").toLowerCase(), code = e && e.code;
  if (code === "user_already_exists" || /already (registered|exists)/.test(m)) return "That name is taken. Try another one! 🌸";
  if (code === "invalid_credentials" || /invalid login/.test(m)) return "Wrong name or password. Try again 💖";
  if (/email not confirmed/.test(m) || code === "email_not_confirmed") return "This account isn't switched on yet. Please ask your teacher or parent.";
  if (/rate limit|too many|429/.test(m)) return "Too many tries. Please wait a minute and try again ⏳";
  if (/password/.test(m) && /(weak|short|least)/.test(m)) return "Please choose a longer secret password.";
  if (/fetch|network|load|offline|timeout/.test(m)) return "The Cloud Castle can't be reached right now. You can keep playing; your progress is safe on this device.";
  return mode === "signup" ? "Couldn't make your account. Please try again." : "Couldn't log in. Please try again.";
};

/* ---------- progress score (to suggest which save to keep) ---------- */
const doneCrowns = d => d ? Object.values(d).reduce((a, x) => a + (x.crowns || 0), 0) : 0;   // Storybook chapters, Phonics Path steps, gap-game books…
const crownedBlocks = s => Object.keys(WR.BLOCKS).filter(k => WR.BLOCKS[k].crowned).reduce((a, k) => a + doneCrowns(s[k] && s[k].done), 0);   // every crowned save block (js/core.js)
C.score = s => {
  if (!s || !s.pet) return 0;
  const crowns = Object.values(s.progress || {}).reduce((a, r) => a + Object.values(r).reduce((b, k) => b + WR.crowns(k.best || 0), 0), 0);
  return (s.totalCorrect || 0) * 2 + (s.lessonsDone || 0) * 5 + crowns * 10 + Math.floor((s.pet.xp || 0) / 4) + (s.writing && s.writing.crowns || 0) * 3
    + crownedBlocks(s) * 10
    + Object.values((s.charms && s.charms.cards) || {}).reduce((a, c) => a + (c && c.b >= 1 ? 2 + c.b : 0), 0)
    + (s.math ? (s.math.correct || 0) * 2 + (s.math.lessons || 0) * 5 + Object.values(s.math.topics || {}).reduce((a, t) => a + WR.crowns(t.best || 0), 0) * 10 + Object.values(s.math.facts || {}).filter(f => f.b >= 3).length * 2 : 0);
};
// which save has more progress? score first; on a tie the save with more stars wins (bonus stars from quests,
// stickers and prizes add no score), and a full tie keeps the cloud copy
C.cloudWins = (cloud, local) => { const cs = C.score(cloud), ls = C.score(local);
  return cs !== ls ? cs > ls : ((cloud && cloud.stars) || 0) >= ((local && local.stars) || 0); };
C.summary = s => s && s.pet ? { name: s.name, stars: s.stars, xp: s.pet.xp || 0, lessons: s.lessonsDone || 0, correct: s.totalCorrect || 0, score: C.score(s) } : null;

/* ---------- status indicator ---------- */
const LABEL = { guest: ["☁️", "Guest"], saving: ["⏳", "Saving…"], saved: ["☁️✓", "Saved to cloud"], offline: ["📴", "Offline"], loading: ["☁️", "Connecting…"] };
C.setStatus = st => { C.status = st; paint(); };
function paint() {
  const [ic, tx] = LABEL[C.status] || LABEL.guest;
  document.querySelectorAll(".cloud-chip").forEach(b => { b.className = "chip cloud-chip st-" + C.status; b.innerHTML = `<span>${ic}</span><span class="cc-tx">${C.username && C.status !== "guest" ? WR.esc(C.username) : tx}</span>`; b.title = tx; });
  const ps = document.getElementById("ccStatus"); if (ps) { ps.className = "cc-status st-" + C.status; ps.textContent = (C.status === "saved" ? "Saved to cloud ✓" : tx); }
}
C.chipHTML = () => `<button class="chip cloud-chip st-${C.status}" id="cloudChip" aria-label="Cloud Castle account"></button>`;
C.paint = paint;

/* ---------- loading the Supabase library (never blocks the game) ---------- */
C.lib = () => {
  if (window.supabase && window.supabase.createClient) return Promise.resolve(window.supabase);
  if (libPromise) return libPromise;
  libPromise = new Promise((res, rej) => {
    const s = document.createElement("script"); s.src = CFG.lib; s.async = true;
    const t = setTimeout(() => { rej(new Error("timeout loading cloud library")); }, 9000);
    s.onload = () => { clearTimeout(t); window.supabase && window.supabase.createClient ? res(window.supabase) : rej(new Error("cloud library failed")); };
    s.onerror = () => { clearTimeout(t); rej(new Error("network: cloud library failed to load")); };
    document.head.appendChild(s);
  }).catch(e => { libPromise = null; throw e; });
  return libPromise;
};
C.client = async () => {
  if (client) return client;
  const sb = await C.lib();
  client = sb.createClient(CFG.url, CFG.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: AUTH_KEY } });
  return client;
};
const withTimeout = (p, ms = 12000) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error("timeout")), ms))]);

/* ---------- cloud row ---------- */
async function fetchRow() {
  const c = await C.client();
  const { data, error } = await withTimeout(c.from("saves").select("data,updated_at,username").eq("user_id", C.user.id).maybeSingle());
  if (error) throw error; return data;
}
async function writeRow(state) {
  const c = await C.client();
  const row = { user_id: C.user.id, username: C.username, data: state, updated_at: new Date().toISOString() };
  const { data, error } = await withTimeout(c.from("saves").upsert(row, { onConflict: "user_id" }).select("updated_at").single());
  if (error) throw error;
  setMeta({ synced: data.updated_at, dirty: false, user: C.user.id, username: C.username });
  return data.updated_at;
}
const sameTime = (a, b) => a && b && new Date(a).getTime() === new Date(b).getTime();
const newer = (a, b) => a && (!b || new Date(a).getTime() > new Date(b).getTime());

/* apply a cloud save to this device and redraw */
// ⭐ the same player's star-earning record (daily caps, replays, items already rewarded) is never rolled back by a sync:
// whichever save wins, it keeps the stricter of the two records (WR.mergeEarn). A different account on this device keeps its own.
const samePlayer = () => !!(C.user && meta().user === C.user.id);
const keepEarn = other => { if (other && samePlayer()) { WR.state.earn = WR.mergeEarn(WR.state.earn, other.earn);
  const oc = other.clock, mc = WR.state.clock; if (oc && oc.day && (!mc || oc.day > mc.day)) WR.state.clock = { day: oc.day, seen: Math.max(oc.seen || 0, (mc && mc.seen) || 0) };   // R22: the later game day wins
  rawSave(); } };
C.apply = (data, at) => {
  const prev = WR.state;
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  WR.state = WR.load(); keepEarn(prev); rawSave();
  setMeta({ synced: at, dirty: false, user: C.user && C.user.id, username: C.username });
  WR.restart && WR.restart();
};

/* ---------- push (debounced) ---------- */
C.push = async () => {
  if (!C.user) return;
  if (pushing) { again = true; return pushing; }
  pushing = (async () => {
    C.setStatus("saving");
    try {
      // don't clobber newer progress saved from another device since our last sync
      const row = await fetchRow(), m = meta();
      if (row && m.synced && newer(row.updated_at, m.synced)) await resolveConflict(row, "background");
      else await writeRow(WR.state);
      C.setStatus("saved");
    } catch (e) { console.warn("cloud push", e && e.message); C.setStatus(navigator.onLine === false ? "offline" : "offline"); }
  })();
  try { await pushing; } finally { pushing = null; if (again) { again = false; C.schedule(); } }
};
C.schedule = (ms = DEBOUNCE) => { if (!C.user) return; clearTimeout(timer); C.setStatus("saving"); timer = setTimeout(C.push, ms); };
// last-chance save when the tab is hidden or closed: a keepalive request straight to the REST API
C.flush = () => {
  if (!C.user || !meta().dirty) return;
  clearTimeout(timer);
  let tok = null; try { tok = JSON.parse(localStorage.getItem(AUTH_KEY)).access_token; } catch (e) { }
  if (!tok) return;
  const body = JSON.stringify({ user_id: C.user.id, username: C.username, data: WR.state, updated_at: new Date().toISOString() });
  try {
    fetch(CFG.url + "/rest/v1/saves?on_conflict=user_id", { method: "POST", keepalive: body.length < 60000, body,
      headers: { apikey: CFG.key, Authorization: "Bearer " + tok, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=representation" } })
      .then(r => r.ok ? r.json() : null).then(j => { if (j && j[0]) { setMeta({ synced: j[0].updated_at, dirty: false }); C.setStatus("saved"); } }).catch(() => { });
  } catch (e) { }
};

/* wrap WR.save so every local save also queues a cloud save */
const rawSave = WR.save;
WR.save = () => { rawSave(); if (C.user) { setMeta({ dirty: true }); C.schedule(); } };
// (a reset never marks the save dirty: R2 resets this device only, logging it out first, so the cloud copy is never overwritten)
const rawReset = WR.reset;

/* ---------- conflicts ---------- */
async function resolveConflict(row, why) {
  const local = WR.state, cloud = row.data;
  if (why === "background" || !local.pet) {
    // quietly keep whichever has more progress
    if (C.cloudWins(cloud, local)) { C.apply(cloud, row.updated_at); if (why === "background") WR.toast("☁️ Loaded newer progress from your other device", 2600); }
    else { keepEarn(cloud); await writeRow(WR.state); }
    return;
  }
  return new Promise(resolve => chooseSave(local, row, async pick => {
    try { if (pick === "cloud") C.apply(cloud, row.updated_at); else { keepEarn(cloud); await writeRow(WR.state); } C.setStatus("saved"); }
    catch (e) { C.setStatus("offline"); }
    resolve();
  }));
}
function chooseSave(local, row, done) {
  const a = C.summary(local), b = C.summary(row.data), best = C.cloudWins(row.data, local) ? "cloud" : "local";
  const card = (k, s, title, ic) => `<button class="card cc-pick ${best === k ? "best" : ""}" data-pick="${k}">${best === k ? '<span class="cc-best">More progress ✨</span>' : ""}<div class="cc-pick-ic">${ic}</div><b>${title}</b>
    ${s ? `<div class="cc-pick-nm">${WR.esc(s.name || "")}</div><div class="cc-stats"><span>⭐ ${s.stars}</span><span>✅ ${s.correct}</span><span>📚 ${s.lessons}</span><span>🐾 ${s.xp} XP</span></div>` : '<div class="muted">empty</div>'}</button>`;
  const when = row.updated_at ? new Date(row.updated_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "";
  WR.modal(`<div class="cloud-panel"><h2>Two adventures found! 🏰</h2><p class="muted" style="font-weight:700;margin-top:0">This device has a guest adventure, and your Cloud Castle has one too. Which one should we keep?</p>
    <div class="cc-picks">${card("local", a, "This device", "📱")}${card("cloud", b, "Cloud Castle", "☁️")}</div>
    <p class="muted" style="font-size:.78rem;font-weight:700">Cloud save from ${WR.esc(when)}. The other adventure will be replaced.</p></div>`, (bg, close) => {
    bg.onclick = null; // must pick one
    bg.querySelectorAll("[data-pick]").forEach(b => b.onclick = () => { close(); done(b.dataset.pick); });
  });
}

/* ---------- after sign-in: pull and reconcile ---------- */
async function afterSignIn(isNew) {
  C.setStatus("loading");
  const row = isNew ? null : await fetchRow();
  const m = meta(), hasLocal = !!(WR.state.pet && WR.state.name);
  if (!row) { if (hasLocal) await writeRow(WR.state); else setMeta({ user: C.user.id, username: C.username, synced: null, dirty: false }); C.setStatus("saved"); return "pushed"; }
  if (!hasLocal) { C.apply(row.data, row.updated_at); C.setStatus("saved"); return "pulled"; }
  // same player on the same device: newest wins, unless both changed
  if (m.user === C.user.id) {
    if (sameTime(row.updated_at, m.synced)) { if (m.dirty) await writeRow(WR.state); C.setStatus("saved"); return "kept"; }
    if (!m.dirty) { C.apply(row.data, row.updated_at); C.setStatus("saved"); return "pulled"; }
  }
  if (JSON.stringify(row.data) === JSON.stringify(WR.state)) { setMeta({ user: C.user.id, username: C.username, synced: row.updated_at, dirty: false }); C.setStatus("saved"); return "same"; }
  await resolveConflict(row, "login"); return "asked";
}

/* ---------- account actions ---------- */
C.signUp = async (name, pass) => {
  const ne = C.nameError(name) || C.passError(pass); if (ne) throw new Error(ne);
  const c = await C.client(), uname = name.trim().toLowerCase();
  const { data, error } = await withTimeout(c.auth.signUp({ email: C.email(uname), password: pass, options: { data: { username: uname } } }));
  if (error) throw error;
  // with "Confirm email" on, Supabase hides a taken name as a user with no identities
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) { const e = new Error("User already registered"); e.code = "user_already_exists"; throw e; }
  if (!data.session) { const e = new Error("Email not confirmed"); e.code = "email_not_confirmed"; throw e; }
  C.user = data.user; C.username = uname;
  return afterSignIn(true);
};
C.signIn = async (name, pass) => {
  const ne = C.nameError(name) || C.passError(pass); if (ne) throw new Error(ne);
  const c = await C.client(), uname = name.trim().toLowerCase();
  const { data, error } = await withTimeout(c.auth.signInWithPassword({ email: C.email(uname), password: pass }));
  if (error) throw error;
  C.user = data.user; C.username = (data.user.user_metadata && data.user.user_metadata.username) || uname;
  return afterSignIn(false);
};
/* ---------- change password (signed in) ---------- */
C.changePassword = async (current, next) => {
  const pe = C.passError(next); if (pe) throw Object.assign(new Error(pe), { friendly: pe });
  if (!C.user) throw Object.assign(new Error("not signed in"), { friendly: "Please log in first." });
  if (current === next) throw Object.assign(new Error("same"), { friendly: "Your new password is the same as the old one." });
  const c = await C.client();
  // check the current password first, so a borrowed device can't change it
  const chk = await withTimeout(c.auth.signInWithPassword({ email: C.email(C.username), password: current }));
  if (chk.error) { const m = C.friendly(chk.error, "login"); throw Object.assign(chk.error, { friendly: /Wrong name/.test(m) ? "Your current password isn't right. Try again 💖" : m }); }
  if (chk.data && chk.data.user) C.user = chk.data.user;
  const { error } = await withTimeout(c.auth.updateUser({ password: next }));
  if (error) {
    const m = String(error.message || "").toLowerCase(), code = error.code;
    const f = code === "same_password" || /different from the old/.test(m) ? "Your new password is the same as the old one."
      : code === "weak_password" || /weak|short|least/.test(m) ? "Please choose a longer secret password."
      : code === "reauthentication_needed" || /reauthenticat/.test(m) ? "Changing passwords isn't switched on in the Cloud Castle yet. Your current password still works."
      : C.friendly(error, "login").replace("Couldn't log in", "Couldn't change your password");
    throw Object.assign(error, { friendly: f });
  }
  return true;
};

C.signOut = async (clearDevice) => {
  clearTimeout(timer);
  if (C.user && meta().dirty) { try { await C.push(); } catch (e) { } }
  try { const c = await C.client(); await withTimeout(c.auth.signOut({ scope: "local" }), 5000); } catch (e) { }
  localStorage.removeItem(AUTH_KEY); localStorage.removeItem(META_KEY);
  C.user = null; C.username = null; C.setStatus("guest");
  if (clearDevice) { rawReset(); WR.restart && WR.restart(); }
};

/* ---------- on page load: resume a session if this device has one ---------- */
C.resume = async () => {
  if (!localStorage.getItem(AUTH_KEY)) { C.setStatus("guest"); return; }
  const m = meta(); C.username = m.username || null; C.setStatus("loading");
  try {
    const c = await C.client();
    const { data } = await withTimeout(c.auth.getSession());
    if (!data.session) { C.username = null; C.setStatus("guest"); return; }
    C.user = data.session.user; C.username = (C.user.user_metadata && C.user.user_metadata.username) || m.username;
    const row = await fetchRow();
    if (row && newer(row.updated_at, m.synced)) {
      if (!m.dirty || C.cloudWins(row.data, WR.state)) C.apply(row.data, row.updated_at); else { keepEarn(row.data); await writeRow(WR.state); }
    } else if (m.dirty || !row) await writeRow(WR.state);
    C.setStatus("saved");
  } catch (e) { console.warn("cloud resume", e && e.message); C.setStatus("offline"); }
};
C.ready = C.resume();
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") C.flush(); });
window.addEventListener("pagehide", C.flush);
window.addEventListener("online", () => { if (C.user && meta().dirty) C.schedule(500); else if (C.user && C.status === "offline") C.push(); });

/* ---------- the Cloud Castle panel ---------- */
const UNREACHABLE = "The Cloud Castle can't be reached right now. You can keep playing; your progress is safe on this device.";
const castle = `<img class="cc-castle" src="assets/web/cloud_castle.webp" onerror="this.onerror=null;this.src='assets/ui/cloud_castle.png'" alt="">`;
C.open = (startMode) => {
  let mode = startMode || "login";
  WR.modal(`<div class="cloud-panel" id="cloudPanel"></div>`, (bg, close) => {
    const root = bg.querySelector("#cloudPanel");
    const signedIn = () => {
      const s = C.summary(WR.state);
      root.innerHTML = `${castle}<h2>Cloud Castle 🏰</h2>
        <div class="cc-user"><span class="cc-crest">${WR.esc((C.username || "?")[0].toUpperCase())}</span><div style="text-align:left"><div class="muted" style="font-size:.78rem;font-weight:800">Signed in as</div><b class="cc-name">${WR.esc(C.username || "")}</b></div></div>
        <div id="ccStatus" class="cc-status st-${C.status}"></div>
        <p class="muted" style="font-weight:700">Your stars, pet, skins and progress are kept safe in the clouds. Log in with the same name on any device to keep playing! ✨</p>
        ${s ? `<div class="cc-stats big"><span>⭐ ${s.stars}</span><span>✅ ${s.correct}</span><span>📚 ${s.lessons}</span><span>🐾 ${s.xp} XP</span></div>` : ""}
        <div class="row" style="justify-content:center;margin-top:10px;flex-wrap:wrap"><button class="btn ghost small" id="ccPw">🔑 Change password</button></div>
        <div class="row" style="justify-content:center;margin-top:8px;flex-wrap:wrap"><button class="btn mint small" id="ccSync">☁️ Save now</button><button class="btn ghost small" id="ccOut">Log out</button><button class="btn ghost small" id="ccOutClear" title="For shared computers">Log out &amp; clear device</button><button class="btn small" id="ccDone">Done</button></div>`;
      paint();
      root.querySelector("#ccSync").onclick = async () => { await C.push(); paint(); if (C.status === "saved") WR.toast("☁️ Saved to the Cloud Castle!"); };
      root.querySelector("#ccOut").onclick = async () => { await C.signOut(false); WR.toast("👋 Logged out. You can keep playing as a guest."); form(); };
      // 👪 T19: clearing the device needs a grown-up
      root.querySelector("#ccOutClear").onclick = () => WR.parentGate ? WR.parentGate(clearDev, { why: "Removing this adventure from the device." }) : clearDev();
      const clearDev = async () => { if (!confirm("Log out and remove this adventure from this device? (It stays safe in your Cloud Castle.)")) return; await C.signOut(true); close(); };
      root.querySelector("#ccDone").onclick = close;
      root.querySelector("#ccPw").onclick = pwView;
    };
    const pwView = () => {
      root.innerHTML = `${castle}<h2>🔑 Change password</h2>
        <form id="ccPwForm" novalidate>
          <input type="text" name="username" autocomplete="username" value="${WR.esc(C.username || "")}" hidden>
          <label class="cc-lbl">Current password<input class="input" id="ccPwOld" type="password" autocomplete="current-password" placeholder="••••••"></label>
          <label class="cc-lbl">New password <small>(6+ characters)</small><input class="input" id="ccPwNew" type="password" autocomplete="new-password" placeholder="••••••"></label>
          <div class="cc-err" id="ccPwErr" role="alert"></div>
          <button class="btn mint" id="ccPwGo" type="submit" style="width:100%;margin-top:6px">🔐 Save new password</button></form>
        <div class="row" style="justify-content:center;margin-top:8px"><button class="btn ghost small" type="button" id="ccBack">← Back</button></div>`;
      root.querySelector("#ccBack").onclick = signedIn;
      const o = root.querySelector("#ccPwOld"), n = root.querySelector("#ccPwNew"), err = root.querySelector("#ccPwErr"), go = root.querySelector("#ccPwGo");
      setTimeout(() => o.focus(), 30);
      root.querySelector("#ccPwForm").onsubmit = async ev => {
        ev.preventDefault();
        if (!o.value) { err.textContent = "Please type your current password."; return; }
        const e = C.passError(n.value); if (e) { err.textContent = e; return; }
        err.textContent = ""; go.disabled = true; const label = go.innerHTML; go.innerHTML = "🔐 Saving…";
        try { await C.changePassword(o.value, n.value); WR.sfx("level"); WR.toast("🔐 New password saved! Use it next time you log in.", 2600); if (document.body.contains(root)) signedIn(); }
        catch (x) { err.textContent = x.friendly || "Couldn't change your password. Please try again."; go.disabled = false; go.innerHTML = label; }
      };
    };
    const form = () => {
      const up = mode === "signup";
      root.innerHTML = `${castle}<h2>${up ? "Build your Cloud Castle 🏰" : "Enter the Cloud Castle 🏰"}</h2>
        <p class="muted" style="font-weight:700;margin-top:0">${up ? "Make an account to save your stars, pet and skins in the clouds, and play on any device." : "Log in to load your adventure from the clouds."}</p>
        <div class="cc-tabs"><button data-m="login" class="${up ? "" : "on"}">Log in</button><button data-m="signup" class="${up ? "on" : ""}">New account</button></div>
        <form id="ccForm" autocomplete="on" novalidate>
          <label class="cc-lbl">Castle name <small>(3–20 letters, numbers or _)</small><input class="input" id="ccName" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="20" placeholder="e.g. lily_star"></label>
          <label class="cc-lbl">Secret password <small>(6+ characters)</small><input class="input" id="ccPass" name="password" type="password" autocomplete="${up ? "new-password" : "current-password"}" placeholder="••••••"></label>
          <div class="cc-err" id="ccErr" role="alert"></div>
          <button class="btn ${up ? "mint" : ""}" id="ccGo" type="submit" style="width:100%;margin-top:6px">${up ? "✨ Create my account" : "🔑 Log in"}</button>
        </form>
        <p class="muted" style="font-size:.76rem;font-weight:700;margin-bottom:0">${up ? "No email needed. Write your name and password somewhere safe, or ask a grown-up to help." : "Playing without an account? Your progress stays on this device."}</p>
        <div class="row" style="justify-content:center;margin-top:8px"><button class="btn ghost small" id="ccLater" type="button">${up ? "Maybe later" : "Keep playing as a guest"}</button></div>`;
      if (C.libDown) root.querySelector("#ccErr").textContent = UNREACHABLE;
      root.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { mode = b.dataset.m; form(); });
      root.querySelector("#ccLater").onclick = close;
      const err = root.querySelector("#ccErr"), nameI = root.querySelector("#ccName"), passI = root.querySelector("#ccPass"), go = root.querySelector("#ccGo");
      nameI.oninput = () => { const e = nameI.value && C.nameError(nameI.value); err.textContent = e || ""; };
      root.querySelector("#ccForm").onsubmit = async ev => {
        ev.preventDefault();
        const e = C.nameError(nameI.value) || C.passError(passI.value); if (e) { err.textContent = e; return; }
        err.textContent = ""; go.disabled = true; const label = go.innerHTML; go.innerHTML = "☁️ Flying to the castle…";
        try {
          await (up ? C.signUp(nameI.value, passI.value) : C.signIn(nameI.value, passI.value));
          WR.sfx("level"); WR.toast(up ? `🏰 Welcome to your Cloud Castle, ${WR.esc(C.username)}!` : `☁️ Welcome back, ${WR.esc(C.username)}!`, 2400);
          if (document.body.contains(bg)) signedIn();
        } catch (x) { err.textContent = C.friendly(x, mode); go.disabled = false; go.innerHTML = label; }
      };
    };
    (C.user ? signedIn : form)();
    if (!C.user) C.lib().then(() => { C.libDown = false; }, () => { C.libDown = true; const e = root.querySelector("#ccErr"); if (e) e.textContent = UNREACHABLE; });
  });
};
})();
