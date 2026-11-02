// 🎤✒️ R20 (REVIEW-2026-11-01): Echo Well and Story Quill are no longer the thin parts at A1–B1.
// Wave 1 (tools/r20.py): 22 → 40 speaking prompts, 6 → 10 writing tasks per level (B1 free-answer 4 → 13).
// Wave 2 (tools/r20b.py): 40 → 60 speaking prompts, 10 → 15 writing tasks per level (B1 free-answer 13 → 23).
// Wave 3 (tools/r20c.py): B2–C2 22 → 40 speaking prompts (free-answer 5 → 13), 6 → 10 writing tasks per level.
// Wave 4 (tools/r20d.py): B2–C2 40 → 60 speaking prompts (free-answer 13 → 23), 10 → 15 writing tasks per level; the old
// grown-up B2–C2 prompts (degree, job, working from home, treaty, contract, AI regulation) swapped for kid topics.
// Unique, kid-friendly, ids stable, every read-aloud and model answer voiced. Stories stay at one chapter per level
// (see the status table). The 3-crown model check lives in writing.js.   node tools/test/r20content.js
const fs = require('fs'), path = require('path');
const D = path.join(__dirname, '..', '..', 'data');
let fails = 0, passes = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const j = (l, s) => JSON.parse(fs.readFileSync(`${D}/${l}/${s}.json`, 'utf8'));
const BAD = /\b(kill|blood|gun|beer|wine|dating|sexy|politic|minister|war)\b/i;
// one row per level: [speaking prompts, writing tasks, free-answer prompts (0 = not checked), how speaking grew, how writing grew]
const TARGET = { a1: [60, 15, 0, '22 → 40 → 60', '6 → 10 → 15'], a2: [60, 15, 0, '22 → 40 → 60', '6 → 10 → 15'], b1: [60, 15, 23, '22 → 40 → 60', '6 → 10 → 15'],
  b2: [60, 15, 23, '22 → 40 → 60', '6 → 10 → 15'], c1: [60, 15, 23, '22 → 40 → 60', '6 → 10 → 15'], c2: [60, 15, 23, '22 → 40 → 60', '6 → 10 → 15'] };
const GROWN_UP = /\b(degree|job|jobs|working from home|work from home|treaty|contract|regulat\w*|governments?)\b/i;   // adult topics swapped out of B2–C2 speaking in wave 4
const LEVELS = Object.keys(TARGET);
const spText = x => x.text || x.q;
// the pill children see: mirrors kidPart() in js/writing.js ("B2 First · Writing Part 1 (essay)" → "Essay")
const kidPart = p => { const s = String(p.part || ''), m = s.match(/\(([^)]+)\)\s*$/), k = m ? m[1] : s.split(' · ').pop(); return k.charAt(0).toUpperCase() + k.slice(1); };
const EXAM = /Cambridge|Part \d|Starters|Movers|Flyers|Preliminary|Proficiency|Advanced ·|First ·|Key ·/;
for (const l of LEVELS) {
  const sp = j(l, 'speaking'), wr = j(l, 'writing');
  const [nSp, nWr, nAns, grewSp, grewWr] = TARGET[l];
  ok(sp.length >= nSp, `${l}: ${sp.length} speaking prompts (target ${nSp}; grew ${grewSp})`);
  ok(wr.length >= nWr, `${l}: ${wr.length} writing tasks (target ${nWr}; grew ${grewWr})`);
  if (nAns) ok(sp.filter(x => x.type === 'answer').length >= nAns && sp.filter(x => x.type === 'read').length >= nAns, `${l}: ${nAns}+ free-answer and ${nAns}+ read-aloud prompts (a mix of both)`);
  ok(sp.filter(x => x.type === 'answer').every(x => x.keywords.every(k => !/'/.test(k))), `${l}: free-answer keywords are written out in full (the speech checker expands "I'd", "you're")`);
  ok(wr.every(x => { const k = kidPart(x); return k.length >= 4 && !EXAM.test(k) && !EXAM.test(x.task + ' ' + x.title); }), `${l}: each task shows a kid-friendly pill (${[...new Set(wr.map(kidPart))].join(', ')}) and no exam names on its task card`);
  ok(sp.every(x => !EXAM.test(x.focus) && !/Speaking Part/.test(x.focus)), `${l}: no exam names on Echo Well focus pills`);
  if (['b2', 'c1', 'c2'].includes(l)) ok(sp.every(x => !GROWN_UP.test(spText(x) + ' ' + (x.model || ''))), `${l}: no grown-up topics (degree, job, treaty, contract, AI regulation …)`);
  ok(new Set(sp.map(spText)).size === sp.length && new Set(wr.map(x => x.title)).size === wr.length, `${l}: no repeated prompts or titles`);
  ok(new Set(sp.map(x => spText(x).toLowerCase().replace(/[^a-z ]/g, ''))).size === sp.length, `${l}: no near-repeats (same words, other punctuation)`);
  ok(sp.every(x => !BAD.test(spText(x) + ' ' + (x.model || ''))) && wr.every(x => !BAD.test(x.task + ' ' + x.model)), `${l}: kid-friendly topics`);
  ok(sp.every((x, i) => x.id === `${l}-sp${String(i + 1).padStart(2, '0')}`) && wr.every((x, i) => x.id === `${l}-w${String(i + 1).padStart(2, '0')}`), `${l}: ids stay stable (new items are appended)`);
  ok(wr.every(x => x.points.length >= 3 && x.bank && x.bank[0].p.length >= 3), `${l}: every task has 3+ content points and its own phrases`);
}
const voice = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'voice', 'manifest.json'), 'utf8'));
const recorded = new Set(Object.keys(voice.profiles ? voice.profiles.narrator || {} : voice));
const norm = t => String(t).replace(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF\uFE0F\u200D]/gu, '').replace(/\s+/g, ' ').trim();
const miss = LEVELS.flatMap(l => j(l, 'speaking').flatMap(x => [x.text, x.model].filter(Boolean))).filter(t => !recorded.has(norm(t)));
ok(miss.length === 0, `every A1–C2 read-aloud and model answer has a recorded voice (missing: ${miss.slice(0, 2).join(' / ') || 'none'})`);
console.log(`\n${passes} passed, ${fails} failed`);
