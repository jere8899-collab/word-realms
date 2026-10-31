/* 📊 Learning Report for grown-ups (English follow-up, 31 Oct). Opened from ⚙️ Settings → 👪 Grown-ups, always behind the
   parent gate (WR.parentGate). Shows, for the last 7 days or all time: days played, streak, lessons and minutes a day
   (a small pastel bar chart), English accuracy per skill per CEFR level, maths accuracy per grade/topic, the 3 weakest spots
   with a "▶ Practise this" button, and 2–3 plain-English tips.
   Data: state.report (js/core.js: WR.tally / WR.countAnswer / WR.activityDone), the save's progress, maths topics and the
   Mistake Garden, so older saves show their best scores and rebuilt play days even before any new answers are logged. */
(function () {
const WR = window.WR, esc = WR.esc, MG = window.MathGen;
const ENG = ["grammar", "vocab", "reading", "listening", "speaking", "writing", "story", "phonics", "words", "swap"];
const OPTIONAL = ["phonics", "words", "swap"];     // rows shown only once something was played (the A1 Phonics Path, Word Charms, Spell Swap)
const MIN_N = 3;                                    // answers needed before a spot can be called "weak"
const pct = v => Math.round(v * 100);
const acc = t => t && t[0] + t[1] ? t[0] / (t[0] + t[1]) : null;
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const daysBack = n => Array.from({ length: n }, (_, i) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - (n - 1 - i)); return d; });
const tone = v => v == null ? "" : v >= 0.85 ? "hi" : v >= 0.6 ? "mid" : "lo";

/* ---------- numbers ---------- */
// tallies for the range: the last 7 days come from the day log, all time from the running tally
function tallies(range) {
  const r = WR.state.report;
  if (range !== "week") return r.tally;
  const out = {};
  daysBack(7).forEach(d => { const day = r.days[WR.dayKey(d)]; if (day) for (const k in day.k) out[k] = add(out[k] || [0, 0], day.k[k]); });
  return out;
}
// best scores saved before the report existed (all-time view only)
function bestOf(key) {
  const s = WR.state;
  if (key.startsWith("m:")) { const t = s.math.topics[key.slice(2)]; return t ? t.best : null; }
  const [rid, sk] = key.split("/");
  if (sk === "story") { const d = s.stories.done[rid]; return d ? d.best : null; }
  if (sk === "phonics") return rid === "a1" && WR.Phonics ? WR.Phonics.best() : null;
  const p = s.progress[rid] && s.progress[rid][sk]; return p ? p.best : null;
}
const sumAll = T => Object.values(T).reduce(add, [0, 0]);
function chart(range) {
  const r = WR.state.report;
  let bars;
  if (range === "week") bars = daysBack(7).map(d => { const x = r.days[WR.dayKey(d)] || { s: 0, l: 0 }; return { lab: d.toLocaleDateString("en-GB", { weekday: "short" }).slice(0, 2), full: d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" }), s: x.s, l: x.l }; });
  else bars = daysBack(56).reduce((w, d, i) => { const x = r.days[WR.dayKey(d)] || { s: 0, l: 0 }, b = w[Math.floor(i / 7)] = w[Math.floor(i / 7)] || { s: 0, l: 0, lab: d.getDate() + "/" + (d.getMonth() + 1), full: "Week of " + d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) }; b.s += x.s; b.l += x.l; return w; }, []);
  const useMin = bars.some(b => b.s > 0), val = b => useMin ? Math.round(b.s / 60) : b.l, top = Math.max(1, ...bars.map(val));
  return { useMin, bars: bars.map(b => ({ ...b, v: val(b), h: Math.round(val(b) / top * 100) })) };
}
WR.Report = {};
WR.Report.data = (range = "week") => {
  const s = WR.state, r = s.report, T = tallies(range), wk = range === "week";
  const week = daysBack(7).map(d => r.days[WR.dayKey(d)]).filter(x => x && (x.l || Object.keys(x.k || {}).length));
  const logDays = Object.values(r.days).filter(x => x.l || Object.keys(x.k || {}).length);
  const tot = wk ? sumAll(T) : [s.totalCorrect || 0, Math.max(0, (s.totalAnswered || 0) - (s.totalCorrect || 0))];
  const lessons = wk ? week.reduce((a, x) => a + (x.l || 0), 0) : s.lessonsDone || 0;
  const secs = (wk ? week : logDays).reduce((a, x) => a + (x.s || 0), 0);
  // English grid: rows = skills, columns = levels with anything to show
  const cell = (rid, sk) => { const t = T[rid + "/" + sk], a = acc(t); if (a != null) return { a, n: t[0] + t[1] }; const b = wk ? null : bestOf(rid + "/" + sk); return b != null ? { best: b } : null; };
  const levels = WR.realms.filter(re => ENG.some(sk => cell(re.id, sk)));
  const english = { levels, rows: ENG.map(sk => ({ sk: WR.skillInfo(sk), cells: levels.map(re => cell(re.id, sk)) })).filter(r => !OPTIONAL.includes(r.sk.id) || r.cells.some(Boolean)) };
  // maths: per grade, per topic
  const mk = {};
  Object.keys(T).filter(k => k.startsWith("m:")).forEach(k => mk[k.slice(2)] = { t: T[k] });
  if (!wk) Object.entries(s.math.topics || {}).forEach(([id, t]) => { if (!mk[id] && !id.startsWith("guard.")) mk[id] = { best: t.best }; });
  const grades = {};
  Object.entries(mk).forEach(([id, v]) => {
    const t = MG && MG.topic(id), mix = /^g(\d+)\.mixed$/.exec(id), ch = id.startsWith("dojo.");
    const g = t ? t.grade : mix ? +mix[1] : ch ? 0 : null; if (g == null || id.startsWith("guard.")) return;
    const name = t ? t.icon + " " + t.name : mix ? "🎲 Mixed practice" : id === "dojo.tower" ? "🗼 Times-Table Tower" : "🗼 " + ((MG && MG.challenge(id.slice(5)) || {}).name || "Tower challenge");
    const G = grades[g] = grades[g] || { g, t: [0, 0], topics: [] };
    if (v.t) G.t = add(G.t, v.t);
    G.topics.push({ id, name, a: acc(v.t), n: v.t ? v.t[0] + v.t[1] : 0, best: v.best });
  });
  const maths = Object.values(grades).sort((a, b) => a.g - b.g).map(G => ({ ...G, a: acc(G.t), n: G.t[0] + G.t[1], topics: G.topics.sort((a, b) => b.n - a.n || (a.best || 0) - (b.best || 0)) }));
  return { range, name: s.name || "your child", days: wk ? week.length : logDays.length, capped: logDays.length >= WR.LOG_DAYS, est: !!r.seeded,
    streak: WR.streakAlive(), lessons, mins: Math.round(secs / 60), acc: acc(tot), answers: tot[0] + tot[1], chart: chart(range),
    english, maths, weak: WR.Report.weak(range, T), since: s.created };
};

/* ---------- weak spots ---------- */
WR.Report.weak = (range, T = tallies(range)) => {
  const s = WR.state, score = {}, info = {};
  const bump = (k, w, why) => { if (!actionFor(k)) return; score[k] = (score[k] || 0) + w; (info[k] = info[k] || []).push(why); };
  Object.entries(T).forEach(([k, t]) => { const a = acc(t), n = t[0] + t[1]; if (n >= MIN_N && a < 0.85) bump(k, t[1] * (1 - a) + (a < 0.6 ? 2 : 0), `${t[0]} of ${n} right`); });
  const plants = {};
  (s.mistakes || []).forEach(m => { if (!m.bloomed && m.realm && m.skill) { const k = m.realm + "/" + m.skill; plants[k] = (plants[k] || 0) + 1; } });
  Object.entries(plants).forEach(([k, n]) => bump(k, n * 1.5, `${n} plant${n > 1 ? "s" : ""} in the Mistake Garden`));
  if (range !== "week") {
    Object.entries(s.progress || {}).forEach(([rid, p]) => Object.entries(p || {}).forEach(([sk, x]) => { const k = rid + "/" + sk; if (x && x.best < 0.6 && !T[k]) bump(k, (0.6 - x.best) * 10, `best score ${pct(x.best)}%`); }));
    Object.entries(s.math.topics || {}).forEach(([id, x]) => { const k = "m:" + id; if (x && x.best < 0.6 && !T[k]) bump(k, (0.6 - x.best) * 10, `best score ${pct(x.best)}%`); });
  }
  return Object.keys(score).sort((a, b) => score[b] - score[a]).slice(0, 3).map(k => ({ key: k, label: labelFor(k), why: info[k].join(" · ") }));
};
function labelFor(k) {
  if (k.startsWith("m:")) {
    const id = k.slice(2), t = MG && MG.topic(id), mix = /^g(\d+)\.mixed$/.exec(id);
    if (t) return `${t.icon} ${t.name} · Grade ${t.grade} maths`;
    if (mix) return `🎲 Grade ${mix[1]} mixed maths`;
    return "🗼 Times tables";
  }
  const [rid, sk] = k.split("/"), i = WR.skillInfo(sk); return `${i.icon} ${WR.levelOf(rid)} ${i.name}`;
}
// what "▶ Practise this" opens for a key (null = nothing sensible to open)
function actionFor(k) {
  const MW = WR.Math;
  if (k.startsWith("m:")) {
    const id = k.slice(2), mix = /^g(\d+)\.mixed$/.exec(id);
    if (!MW) return null;
    if (MG && MG.topic(id)) return () => { WR.go("math"); MW.startLesson({ topic: id }); };
    if (mix) return () => { WR.go("math"); MW.startLesson({ grade: +mix[1] }); };
    if (id === "dojo.tower") return () => WR.go("dojo");
    if (id.startsWith("dojo.") && MG && MG.challenge(id.slice(5))) return () => { WR.go("dojo"); MW.startLesson({ challenge: id.slice(5) }); };
    return null;
  }
  const [rid, sk] = k.split("/"), realm = WR.realms && WR.realms.find(r => r.id === rid);
  if (!realm || !ENG.includes(sk)) return null;
  const core = WR.SKILLS.find(x => x.id === sk);
  if (core) return () => { WR.go("realm", rid); WR.startLesson({ realm: rid, skill: sk, key: sk, title: `${core.name} · ${realm.modeName}` }); };
  if (sk === "phonics") return () => WR.go("phonics");
  if (sk === "words") return () => WR.openCharms(rid);
  if (sk === "swap") return () => WR.openSwap(rid);
  const start = { speaking: WR.startSpeaking, writing: WR.startWriting, story: WR.startStory }[sk];
  return start ? () => { WR.go("realm", rid); start(rid); } : null;
}
WR.Report.practise = k => { const f = actionFor(k); if (f) f(); };

/* ---------- tips for the grown-up ---------- */
WR.Report.tips = d => {
  const n = esc(d.name), out = [], wk = d.range === "week";
  const T = tallies(d.range), has = re => Object.keys(T).some(k => re.test(k)) || (!wk && Object.values(WR.state.progress).some(p => Object.keys(p || {}).some(k => re.test("x/" + k))));
  const due = WR.Garden ? WR.Garden.dueCount() : 0;
  if (!d.answers && !d.lessons) out.push(`▶ Nothing has been played ${wk ? "in the last 7 days" : "yet"}. One 5-minute lesson together today is a lovely way to start.`);
  else if (wk && d.days < 3) out.push(`📅 ${n} played on ${d.days} of the last 7 days. Short, regular visits (about 10 minutes on 4–5 days a week) help new words stick better than one long session.`);
  else if (wk) out.push(`🌟 ${n} played on ${d.days} of the last 7 days. That's a lovely routine; a quick “What did you learn today?” chat keeps it going.`);
  if (d.weak[0]) out.push(`🎯 Sit together for one round of <b>${esc(d.weak[0].label)}</b>. Ask ${n} to explain why the right answer is right; saying the reason out loud helps it stick.`);
  if (due) out.push(`🌷 ${due} Mistake Garden plant${due > 1 ? "s are" : " is"} ready for watering. A 💧 round brings back past mistakes at just the right time.`);
  if (d.acc != null && d.answers >= 20 && d.acc >= 0.9) out.push(`🚀 ${pct(d.acc)}% right: ${n} may be ready for a harder realm. The 🪞 Placement quiz in ⚙️ Settings can check.`);
  if (d.answers && !has(/\/(listening|speaking)$/)) out.push(`🎤 Try a 🎧 Listening lesson or an Echo Well speaking round together. Hearing and saying words builds confidence.`);
  if (!d.maths.length) out.push(`🔢 The Number Kingdom has maths practice for Grades 1–12 (Singapore MOE syllabus). Pick ${n}'s grade together under 🔢 Maths.`);
  if (out.length < 2) out.push(`📜 Ask ${n} to read a Storybook chapter to you and tap “Read to me” to compare. Reading aloud together is great practice.`);
  return out.slice(0, 3);
};

/* ---------- screen ---------- */
const cellHTML = c => !c ? `<td class="rp-na">·</td>` : c.a != null ? `<td class="rp-c ${tone(c.a)}"><b>${pct(c.a)}%</b><small>${c.n}</small></td>` : `<td class="rp-c best ${tone(c.best)}" title="best score"><b>${pct(c.best)}%</b><small>best</small></td>`;
const barRow = (t, v) => `<div class="rp-topic"><span class="nm">${esc(t)}</span>${v}</div>`;
WR.Report.html = d => {
  const ch = d.chart, wk = d.range === "week";
  const stat = (ico, big, small) => `<div class="rp-stat"><span class="ico">${ico}</span><b>${big}</b><small>${small}</small></div>`;
  const eng = d.english.levels.length ? `<div class="rp-scroll"><table class="rp-table"><thead><tr><th></th>${d.english.levels.map(l => `<th>${l.level}</th>`).join("")}</tr></thead>
      <tbody>${d.english.rows.map(r => `<tr><th title="${esc(r.sk.name)}"><span class="ico">${r.sk.icon}</span>${esc(r.sk.name === "Vocabulary" ? "Vocab" : r.sk.name)}</th>${r.cells.map(cellHTML).join("")}</tr>`).join("")}</tbody></table></div>
      <p class="rp-key muted"><span class="rp-dot hi"></span>85%+ <span class="rp-dot mid"></span>60–84% <span class="rp-dot lo"></span>under 60% · small number = answers${wk ? "" : " · “best” = best lesson score saved before the report started"}</p>`
    : `<p class="muted rp-empty">No English lessons ${wk ? "in the last 7 days" : "yet"}.</p>`;
  const meter = (a, n, best) => a != null ? `<span class="rp-meter ${tone(a)}"><i style="width:${pct(a)}%"></i></span><b class="pc">${pct(a)}%</b><small class="muted">${n}</small>`
    : best != null ? `<span class="rp-meter ${tone(best)}"><i style="width:${pct(best)}%"></i></span><b class="pc">${pct(best)}%</b><small class="muted">best</small>` : "";
  const math = d.maths.length ? d.maths.map(G => `<div class="rp-grade"><div class="rp-ghead"><b>${G.g ? "Grade " + G.g : "🗼 Times tables"}</b>${G.a != null ? `<span class="pill ${tone(G.a)}">${pct(G.a)}% · ${G.n} answers</span>` : ""}</div>
      ${G.topics.slice(0, 6).map(t => barRow(t.name, meter(t.a, t.n, t.best))).join("")}${G.topics.length > 6 ? `<div class="muted rp-more">+${G.topics.length - 6} more topics</div>` : ""}</div>`).join("")
    : `<p class="muted rp-empty">No maths ${wk ? "in the last 7 days" : "yet"}.</p>`;
  const weak = d.weak.length ? d.weak.map((w, i) => `<div class="rp-weak"><span class="rk">${i + 1}</span><div class="tx"><b>${esc(w.label)}</b><small class="muted">${esc(w.why)}</small></div><button class="btn small mint rp-go" data-key="${esc(w.key)}">▶ Practise this</button></div>`).join("")
    : `<p class="muted rp-empty">No weak spots to show yet 🌈 Keep playing and they'll appear here.</p>`;
  return `<div class="fade-in rp" id="report">
    <div class="rp-head"><h1>📊 Learning Report</h1><span class="muted">for <b>${esc(d.name)}</b></span></div>
    <div class="rp-tabs" role="tablist"><button data-range="week" class="${wk ? "on" : ""}" role="tab" aria-selected="${wk}">Last 7 days</button><button data-range="all" class="${wk ? "" : "on"}" role="tab" aria-selected="${!wk}">All time</button></div>
    <div class="rp-stats">${stat("📅", wk ? `${d.days}/7` : d.days, wk ? "days played" : `day${d.days === 1 ? "" : "s"} played${d.capped ? " (60-day log)" : ""}`)}${stat("🔥", d.streak, "day streak")}
      ${stat("📚", d.lessons, "lessons")}${stat("🎯", d.acc != null ? pct(d.acc) + "%" : "–", d.answers ? `right (${d.answers} answers)` : "right")}</div>
    <div class="card rp-card"><h2>${d.chart.useMin ? "⏱️ Minutes" : "📚 Lessons"} ${wk ? "each day" : "each week"}</h2>
      <div class="rp-chart" role="img" aria-label="${esc(ch.bars.map(b => `${b.full}: ${b.v} ${ch.useMin ? "minutes" : "lessons"}`).join(", "))}">${ch.bars.map(b => `<div class="rp-bar" title="${esc(b.full)}: ${b.v} ${ch.useMin ? "min" : "lessons"} · ${b.l} lesson${b.l === 1 ? "" : "s"}"><span class="tr"><span class="v">${b.v || ""}</span><i style="height:${Math.max(b.v ? 5 : 2, Math.round(b.h * 0.86))}%"></i></span><span class="d">${esc(b.lab)}</span></div>`).join("")}</div>
      <p class="muted rp-note">${ch.useMin ? `About ${d.mins} minute${d.mins === 1 ? "" : "s"} of play ${wk ? "this week" : "logged"} (counted from answer times).` : "Minutes appear once new lessons are played; earlier days show lessons."}${d.est ? " Days before the report started are rebuilt from saved progress." : ""}</p></div>
    <div class="card rp-card"><h2>🎯 Practise next</h2>${weak}</div>
    <div class="card rp-card"><h2>📖 English by skill and level</h2>${eng}</div>
    <div class="card rp-card"><h2>🔢 Maths by grade and topic</h2>${math}</div>
    <div class="card rp-card rp-tips"><h2>💡 Tips for grown-ups</h2><ul>${WR.Report.tips(d).map(t => `<li>${t}</li>`).join("")}</ul></div>
    <p class="muted rp-foot">Saved with this adventure (and the ☁️ Cloud Castle when logged in). Only the newest 60 days are kept day by day.</p>
    <div class="row rp-actions"><button class="btn ghost small" id="rpBack">← Grown-ups</button><button class="btn small" id="rpDone">Done</button></div></div>`;
};
let range = "week";
WR.screens.report = r => {
  if (r) range = r;
  // 👪 grown-ups only: without a fresh gate pass, the child sees a friendly lock and the gate opens
  if (!WR.parentGate.isOpen()) {
    WR.view(`<div class="card center fade-in rp-locked" id="reportLocked"><div style="font-size:3rem">🔒</div><h2>This page is for grown-ups</h2><p class="muted" style="font-weight:700">Ask a grown-up 💖</p><button class="btn small" id="rpUnlock">👪 Grown-ups</button> <button class="btn ghost small" id="rpHome">← Map</button></div>`);
    const ask = () => WR.parentGate(() => WR.go("report", range), { why: "The Learning Report is for grown-ups.", onCancel: () => {} });
    WR.$("#rpUnlock").onclick = ask; WR.$("#rpHome").onclick = () => WR.go("home"); ask();
    return;
  }
  WR.view(WR.Report.html(WR.Report.data(range)));
  document.querySelectorAll(".rp-tabs [data-range]").forEach(b => b.onclick = () => WR.go("report", b.dataset.range));
  document.querySelectorAll(".rp-go").forEach(b => b.onclick = () => WR.Report.practise(b.dataset.key));
  WR.$("#rpBack").onclick = () => WR.openGrownups();
  WR.$("#rpDone").onclick = () => WR.go("home");
};
WR.openReport = () => WR.parentGate(() => WR.go("report", "week"), { why: "The Learning Report is for grown-ups." });
})();
