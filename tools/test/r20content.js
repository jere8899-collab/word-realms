// 🎤✒️ R20 (REVIEW-2026-11-01) wave 1: Echo Well and Story Quill are no longer the thin parts at A1–B1: 40 speaking prompts and
// 10 writing tasks per level (more answer-type speaking at B1), unique, kid-friendly, every new model answer covers its points.
// Wave 1 leaves B2–C2 at 22 / 6 and stories at one chapter per level (see the status table).   node tools/test/r20content.js
const fs = require('fs'), path = require('path');
const D = path.join(__dirname, '..', '..', 'data');
let fails = 0, passes = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const j = (l, s) => JSON.parse(fs.readFileSync(`${D}/${l}/${s}.json`, 'utf8'));
const BAD = /\b(kill|blood|gun|beer|wine|dating|sexy|politic|minister|war)\b/i;
for (const l of ['a1', 'a2', 'b1']) {
  const sp = j(l, 'speaking'), wr = j(l, 'writing');
  ok(sp.length >= 40, `${l}: ${sp.length} speaking prompts (was 22)`);
  ok(wr.length >= 10, `${l}: ${wr.length} writing tasks (was 6)`);
  ok(new Set(sp.map(x => x.text || x.q)).size === sp.length && new Set(wr.map(x => x.title)).size === wr.length, `${l}: no repeated prompts or titles`);
  ok(sp.every(x => !BAD.test((x.text || x.q) + ' ' + (x.model || ''))) && wr.every(x => !BAD.test(x.task + ' ' + x.model)), `${l}: kid-friendly topics`);
  ok(new Set(sp.map(x => x.id)).size === sp.length && sp[0].id === `${l}-sp01` && wr[0].id === `${l}-w01`, `${l}: ids stay stable (new items are appended)`);
}
ok(j('b1', 'speaking').filter(x => x.type === 'answer').length >= 13, 'B1: 13+ free-answer speaking prompts (was 4)');
const voice = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'voice', 'manifest.json'), 'utf8'));
const recorded = new Set(Object.keys(voice.profiles ? voice.profiles.narrator || {} : voice));
const norm = t => String(t).replace(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF\uFE0F\u200D]/gu, '').replace(/\s+/g, ' ').trim();
const miss = ['a1', 'a2', 'b1'].flatMap(l => j(l, 'speaking').flatMap(x => [x.text, x.model].filter(Boolean))).filter(t => !recorded.has(norm(t)));
ok(miss.length === 0, `every A1–B1 read-aloud and model answer has a recorded voice (missing: ${miss.slice(0, 2).join(' / ') || 'none'})`);
console.log(`\n${passes} passed, ${fails} failed`);
