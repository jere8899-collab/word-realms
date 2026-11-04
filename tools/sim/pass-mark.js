// 🏁 BRIEF-T4: how often does a child who knows a share k of a level open the next realm "within 3 tries"?
// Item model as tools/sim/pass-chance.js: a choice item is right with k + (1 − k) / options (guessing), a typed/built one with k.
// Rules compared:
//   before: best-ever ≥ 0.6 (5 of 8) on 3 of the 4 skills, never re-checked
//   after:  ≥ WR.PASS.mark (0.85 → 7 of 8) on all 4 skills, each confirmed by a later-day check of PASS.checkN questions
//           with PASS.checkNeed right (BRIEF-T4B: 4 of 4; the BRIEF-T4 rule 3 of 4 shown for comparison)
// "Tries": T lesson tries per skill to pass, then T check tries (each on a later day) to confirm.
// Run: node tools/sim/pass-mark.js [level=a1] [N=20000]
const fs = require('fs'), lvl = process.argv[2] || 'a1', N = +(process.argv[3] || 20000);
const bank = s => { const d = JSON.parse(fs.readFileSync(`data/${lvl}/${s}.json`)); return s === 'reading' ? d.passages.flatMap(p => p.questions) : d; };
const skills = ['grammar', 'vocab', 'listening', 'reading'].map(bank);
const pOf = (q, k) => { const n = q.options ? q.options.length : 0; return ['mcq', 'listen', 'picq', 'tf'].includes(q.type || 'mcq') && n ? k + (1 - k) / n : k; };
const round = (items, k, n) => { let r = 0; for (let i = 0; i < n; i++) if (Math.random() < pOf(items[Math.floor(Math.random() * items.length)], k)) r++; return r / n; };
const before = (k, T) => { let ok = 0; for (let t = 0; t < N; t++) { let s = 0; for (const it of skills) { let b = 0; for (let i = 0; i < T; i++) b = Math.max(b, round(it, k, 8)); if (b >= 0.6) s++; } if (s >= 3) ok++; } return ok / N; };
const after = (k, T, mark, checkN, checkMark) => { let ok = 0;
  for (let t = 0; t < N; t++) { let all = true;
    for (const it of skills) { let p = false, c = false; for (let i = 0; i < T && !p; i++) p = round(it, k, 8) >= mark; if (p) for (let i = 0; i < T && !c; i++) c = round(it, k, checkN) >= checkMark; if (!c) { all = false; break; } }
    if (all) ok++; }
  return ok / N; };
const pct = x => (x * 100).toFixed(1) + '%';
const out = { level: lvl, N, rows: [] };
for (const k of [0.4, 0.6, 0.8, 0.9]) {
  const row = { knows: k, before3: pct(before(k, 3)) };
  for (const [name, cn, cm] of [['now: check 4 of 4', 4, 1], ['was: check 3 of 4', 4, 0.75]]) {
    row[name] = { tries3: pct(after(k, 3, 0.85, cn, cm)), tries4: pct(after(k, 4, 0.85, cn, cm)), tries5: pct(after(k, 5, 0.85, cn, cm)) }; }
  out.rows.push(row);
}
console.log(JSON.stringify(out, null, 1));
if (process.env.OUT) fs.writeFileSync(process.env.OUT, JSON.stringify(out, null, 1));
