// 💬 R21 (REVIEW-2026-11-01) wave 1: A1–B1 reading and listening "why not" notes quote the exact line that answers the question
// instead of "Find the line in the story…" / "Grey wasn't said."; every quoted line really is in the story or recording, and the
// lesson shows it under "Why not …?".   node tools/test/r21notes.js
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const D = path.join(__dirname, '..', '..', 'data');
let fails = 0, passes = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const GENERIC = /doesn't answer the question\. Find the line|doesn't match what the speaker means/;
const flat = t => t.replace(/\|/g, ' ').replace(/^\s*[A-Z][\w ]{0,18}: /gm, '').replace(/\s+/g, ' ');
for (const l of ['a1', 'a2', 'b1']) {
  const items = JSON.parse(fs.readFileSync(`${D}/${l}/reading.json`, 'utf8')).passages.flatMap(p => p.questions.filter(q => q.type === 'mcq').map(q => [q, p.text]))
    .concat(JSON.parse(fs.readFileSync(`${D}/${l}/listening.json`, 'utf8')).filter(q => q.type === 'listen').map(q => [q, q.say]));
  const notes = items.flatMap(([q, src]) => Object.values(q.notes || {}).map(n => [n, src]));
  const generic = notes.filter(([n]) => GENERIC.test(n)).length, quoting = notes.filter(([n]) => /(says|You heard): “/.test(n));
  ok(generic / notes.length < 0.10, `${l}: script-generic notes down to ${generic}/${notes.length}`);
  ok(quoting.length >= 200, `${l}: ${quoting.length} notes quote the line`);
  const wrongQuote = quoting.filter(([n, src]) => { const m = n.match(/(?:says|You heard): “(.+?)”(?= So|$)/); if (!m) return false; const s = m[1].replace(/…$/, '').replace(/^[A-Z][\w ]{0,18}: /, ''); return !flat(src).includes(s.replace(/\s+/g, ' ')) && !src.replace(/\s+/g, ' ').includes(s); });
  ok(wrongQuote.length === 0, `${l}: every quoted line is really in the story / recording ${wrongQuote.slice(0, 2).map(x => x[0]).join(' | ')}`);
}
const a1l = JSON.parse(fs.readFileSync(`${D}/a1/listening.json`, 'utf8')).find(q => q.say === "Lily can ride a bike, but she can't swim.");
ok(a1l && /You heard: “Lily can ride a bike, but she can't swim\.”/.test(a1l.notes.sing), "the review's example: Why not “sing”? quotes Lily's line (" + (a1l && a1l.notes.sing) + ')');
const lib = JSON.parse(fs.readFileSync(`${D}/a1/reading.json`, 'utf8')).passages.find(p => p.title === 'Library Rules').questions.find(q => /How many books/.test(q.q));
ok(/“You can take two books home\.” So it's “two”, not “three”/.test(lib.notes.three), 'the review\'s example: “three” quotes the rule line');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await ctx.route(/supabase|jsdelivr|unpkg/, r => r.abort());
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.addInitScript(() => { window.__WR_TEST = { holdMs: 0, pinOffer: false }; });
  await page.goto(BASE); await page.waitForTimeout(800);
  await page.evaluate(() => WR.bank('a1', 'reading').then(b => { const p = b.passages.find(p => p.title === 'Library Rules'); const q = p.questions.find(q => /How many books/.test(q.q)); return WR.startLesson({ realm: 'a1', skill: 'reading', key: 'reading', title: 'Reading', items: [WR.normalize(q, p)] }); }));
  await page.waitForTimeout(300);
  for (const b of await page.$$('.opt')) if (/three/.test(await b.innerText())) { await b.click(); break; }
  await page.waitForTimeout(250);
  const ex = await page.$eval('#explain', e => e.innerText);
  ok(/Why not “three”\?/.test(ex) && /You can take two books home/.test(ex), 'the lesson shows the quoting note: ' + ex.slice(0, 110).replace(/\n/g, ' '));
  await page.$eval('#explain', e => e.scrollIntoView({ block: 'center' })); await page.screenshot({ path: path.join(__dirname, '..', '..', 'screenshots', 'r21_quote_note.png') });
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  console.log(`\n${passes} passed, ${fails} failed`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
