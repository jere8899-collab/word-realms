// 🎤✒️ R20 (REVIEW-2026-11-01): Echo Well and Story Quill are no longer the thin parts at A1–B1.
// Wave 1 (tools/r20.py): 22 → 40 speaking prompts, 6 → 10 writing tasks per level (B1 free-answer 4 → 13).
// Wave 2 (tools/r20b.py): 40 → 60 speaking prompts, 10 → 15 writing tasks per level (B1 free-answer 13 → 23).
// Unique, kid-friendly, ids stable, every read-aloud and model answer voiced. B2–C2 stay at 22 / 6 and stories at one chapter
// per level (see the status table). The 3-crown model check lives in writing.js.   node tools/test/r20content.js
const fs = require('fs'), path = require('path');
const D = path.join(__dirname, '..', '..', 'data');
let fails = 0, passes = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const j = (l, s) => JSON.parse(fs.readFileSync(`${D}/${l}/${s}.json`, 'utf8'));
const BAD = /\b(kill|blood|gun|beer|wine|dating|sexy|politic|minister|war)\b/i;
const LEVELS = ['a1', 'a2', 'b1'], TARGET = { speaking: 60, writing: 15, b1Answers: 23 };   // wave 2 targets (wave 1 was 40 / 10 / 13)
const spText = x => x.text || x.q;
for (const l of LEVELS) {
  const sp = j(l, 'speaking'), wr = j(l, 'writing');
  ok(sp.length >= TARGET.speaking, `${l}: ${sp.length} speaking prompts (target ${TARGET.speaking}; was 22, then 40)`);
  ok(wr.length >= TARGET.writing, `${l}: ${wr.length} writing tasks (target ${TARGET.writing}; was 6, then 10)`);
  ok(new Set(sp.map(spText)).size === sp.length && new Set(wr.map(x => x.title)).size === wr.length, `${l}: no repeated prompts or titles`);
  ok(new Set(sp.map(x => spText(x).toLowerCase().replace(/[^a-z ]/g, ''))).size === sp.length, `${l}: no near-repeats (same words, other punctuation)`);
  ok(sp.every(x => !BAD.test(spText(x) + ' ' + (x.model || ''))) && wr.every(x => !BAD.test(x.task + ' ' + x.model)), `${l}: kid-friendly topics`);
  ok(sp.every((x, i) => x.id === `${l}-sp${String(i + 1).padStart(2, '0')}`) && wr.every((x, i) => x.id === `${l}-w${String(i + 1).padStart(2, '0')}`), `${l}: ids stay stable (new items are appended)`);
  ok(wr.every(x => x.points.length >= 3 && x.bank && x.bank[0].p.length >= 3), `${l}: every task has 3+ content points and its own phrases`);
}
ok(j('b1', 'speaking').filter(x => x.type === 'answer').length >= TARGET.b1Answers, `B1: ${TARGET.b1Answers}+ free-answer speaking prompts (was 4, then 13)`);
const voice = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'voice', 'manifest.json'), 'utf8'));
const recorded = new Set(Object.keys(voice.profiles ? voice.profiles.narrator || {} : voice));
const norm = t => String(t).replace(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF\uFE0F\u200D]/gu, '').replace(/\s+/g, ' ').trim();
const miss = LEVELS.flatMap(l => j(l, 'speaking').flatMap(x => [x.text, x.model].filter(Boolean))).filter(t => !recorded.has(norm(t)));
ok(miss.length === 0, `every A1–B1 read-aloud and model answer has a recorded voice (missing: ${miss.slice(0, 2).join(' / ') || 'none'})`);
console.log(`\n${passes} passed, ${fails} failed`);
