// 📏 AGENT-BRIEF top table: chance that a child who knows a share k of the material passes a realm within 3 tries of each skill
// under the current rule (best-ever ≥ 60% = 5 of 8, on 3 of 4 skills). Guessing: 1 in (number of options) on choice items
// (mcq, listen, picq, tf), none on typed / built answers. Run: node tools/sim/pass-chance.js [k=0.4] [level=a1]
const fs = require('fs'), k = +(process.argv[2] || 0.4), lvl = process.argv[3] || 'a1', N = 20000;
const bank = s => { const d = JSON.parse(fs.readFileSync(`data/${lvl}/${s}.json`)); return s === 'reading' ? d.passages.flatMap(p => p.questions) : d; };
const skills = ['grammar', 'vocab', 'listening', 'reading'].map(bank);
const pOf = q => { const n = q.options ? q.options.length : 0; return ['mcq', 'listen', 'picq', 'tf'].includes(q.type || 'mcq') && n ? k + (1 - k) / n : k; };
let pass = 0;
for (let t = 0; t < N; t++) {
  let skillsPassed = 0;
  for (const items of skills) { let best = 0;
    for (let tr = 0; tr < 3; tr++) { let right = 0; for (let i = 0; i < 8; i++) if (Math.random() < pOf(items[Math.floor(Math.random() * items.length)])) right++; best = Math.max(best, right / 8); }
    if (best >= 0.6) skillsPassed++; }
  if (skillsPassed >= 3) pass++;
}
console.log(`${lvl}, knows ${Math.round(k * 100)}%: passes within 3 tries ${(pass / N * 100).toFixed(0)}% of the time`);
