/* 🏁 BRIEF-T4 "make a pass mean something": the child-facing side of the pass rule in js/core.js (WR.PASS).
   - ✨ crown checks: a skill passed on an earlier game day offers a short check (WR.PASS.checkN questions, one a day);
     doing well again confirms it 💎, and 4 confirmed skills open the next realm.
   - Polish me ✨: a crown not checked for WR.PASS.polishDays asks for the same short round. The crown always stays.
   - After WR.PASS.helpAfter tries in a row that didn't pass, the result offers the 📜 Learn lesson and a 🌱 easier path.
   The words stay kind: nothing is ever "failed", lost or taken away. */
(function () {
const WR = window.WR, esc = WR.esc, P = WR.PASS;
const S = () => WR.SKILLS;
const PS = WR.Pass = {};
// skill badge next to the crowns on a realm skill tile: 💎 confirmed, ✅ passed (check to come)
PS.badge = (rid, k) => WR.skillConfirmed(rid, k) ? `<span class="pass-badge ok" title="Confirmed on a later day">💎</span>`
  : WR.skillPassed(rid, k) ? `<span class="pass-badge" title="Passed: a quick check on another day confirms it">✅</span>` : "";
// the ✨ row under "Today's path": checks ready, crowns to polish, and passes waiting for tomorrow
PS.rowHTML = rid => {
  const ready = S().filter(k => WR.checkReady(rid, k.id)), polish = S().filter(k => !ready.includes(k) && WR.needsPolish(rid, k.id));
  const wait = S().filter(k => WR.skillPassed(rid, k.id) && !WR.skillConfirmed(rid, k.id) && !ready.includes(k));
  if (!ready.length && !polish.length && !wait.length) return "";
  const btn = (k, kind) => `<button class="btn ${kind === "check" ? "mint" : "ghost"} pass-btn" data-pcheck="${k.id}" data-kind="${kind}">${kind === "check" ? `✨ Check ${k.icon} ${esc(k.name)}` : `Polish me ✨ ${k.icon} ${esc(k.name)}`}</button>`;
  return `<div class="card pass-row" id="passRow">${ready.length ? `<div class="pass-line"><b>✨ Crown check time!</b> <small>${P.checkN} quick questions show your skill is still shining.</small></div>` : ""}
    ${polish.length && !ready.length ? `<div class="pass-line"><b>✨ Some crowns would love a polish</b> <small>Your crowns stay yours. A quick round keeps them sparkly.</small></div>` : ""}
    <div class="pass-btns">${ready.map(k => btn(k, "check")).join("")}${polish.map(k => btn(k, "polish")).join("")}</div>
    ${wait.length ? `<div class="pass-line muted"><small>🌙 ${wait.map(k => `${k.icon} ${esc(k.name)}`).join(", ")}: passed! ${wait.length > 1 ? "Their checks open" : "Its check opens"} on another day.</small></div>` : ""}</div>`;
};
PS.bindRow = rid => document.querySelectorAll("#passRow [data-pcheck]").forEach(b => b.onclick = () => PS.startCheck(rid, b.dataset.pcheck, b.dataset.kind === "polish"));
// a check or polish round: checkN questions from the skill's bank (no reviews mixed in), scored on the same mark
PS.startCheck = async (rid, k, polish) => {
  const r = WR.realmById(rid), sk = S().find(x => x.id === k); if (!r || !sk) return;
  const items = (await WR.buildItems(rid, k, P.checkN)).slice(0, Math.max(P.checkN, 1));
  WR.startLesson({ realm: rid, skill: k, items, check: { rid, skill: k, polish: !!polish }, title: `${polish ? "Polish me ✨" : "✨ Crown check"} · ${sk.name}`, noTimer: true,
    replay: () => WR.toRealm(rid) });
};
// result lines for lesson.js finish(): returns { title, line } for a check, else a line for a skill lesson
PS.checkResult = (o, res) => {
  const sk = S().find(x => x.id === o.skill) || { name: o.skill, icon: "✨" }, need = WR.passCount(o.n);
  if (res.confirmed) return { title: "Crown confirmed! 💎", line: `You showed ${sk.icon} ${esc(sk.name)} again on a new day, so it really sticks. ${nextRealmLine(o.rid)}` };
  if (res.good) return { title: o.polish ? "Sparkly again! ✨" : "Still shining! ✨", line: `${o.right} of ${o.n} right. Your ${sk.icon} ${esc(sk.name)} crown is polished.` };
  return { title: "Nearly there! 🌱", line: `${o.right} of ${o.n} this time (${need} shows it's ready). Your crown stays yours. Let's check again tomorrow 🌙` };
};
const nextRealmLine = rid => { const i = WR.realms.findIndex(r => r.id === rid), nx = WR.realms[i + 1]; if (!nx) return "";
  const c = WR.realmProgress(rid).confirmed; return c >= P.skills ? `${nx.emoji} ${esc(nx.name)} is open! 🎉` : `${P.skills - c} more to confirm for ${nx.emoji} ${esc(nx.name)}.`; };
PS.lessonLine = (rid, k, score, n, rec) => {
  if (!S().some(x => x.id === k)) return "";
  const need = WR.passCount(n);
  if (WR.passes(score, n) && rec && rec.passDay === WR.today() && !rec.ok) return `<p class="pass-note good">✅ Skill passed! Come back on another day for a quick ${P.checkN}-question check to confirm your crown 💎</p>`;
  if (WR.skillPassed(rid, k)) return "";
  return `<p class="pass-note">Get about ${need} of ${n} right to pass this skill. Every try helps you grow 🌱</p>`;
};
// 🫶 after helpAfter tries in a row that didn't pass: the Learn lesson + an easier path, so no child gets stuck
PS.helpHTML = (rid, k) => {
  if (WR.triesInARow(rid, k) < P.helpAfter) return "";
  const ln = WR.Learn ? WR.Learn.forSkill(rid, k)[0] : null, i = WR.realms.findIndex(r => r.id === rid), down = i > 0 ? WR.realms[i - 1] : null;
  return `<div class="card help-card" id="helpCard"><b>🫶 This one is tricky, and that's how learning feels!</b><small>Want a little help before the next try?</small>
    <div class="row help-btns">${ln ? `<button class="btn small mint" id="helpLearn" data-id="${ln.id}">📜 Learn: ${esc(ln.title)}</button>` : ""}
    <button class="btn small" id="helpEasy">🌱 ${down ? `Easier path: ${esc(down.name)}` : "Little steps: 4 easy questions"}</button></div></div>`;
};
PS.bindHelp = (rid, k) => {
  const l = WR.$("#helpLearn"); if (l) l.onclick = () => WR.Learn.open(l.dataset.id, { back: { screen: "realm", arg: rid } });
  const e = WR.$("#helpEasy"); if (!e) return;
  e.onclick = async () => { const i = WR.realms.findIndex(r => r.id === rid), down = i > 0 ? WR.realms[i - 1] : null, sk = S().find(x => x.id === k);
    if (down) return WR.startLesson({ realm: down.id, skill: k, key: k, title: `${sk.name} · ${down.modeName}` });
    const items = (await WR.buildItems(rid, k, 4)).slice(0, 4);
    WR.startLesson({ realm: rid, skill: k, items, title: `🌱 Little steps · ${sk.name}`, noTimer: true, replay: () => WR.toRealm(rid) }); };
};
})();
