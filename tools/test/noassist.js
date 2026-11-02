// ⌨️ No keyboard help while playing (2026-11-02): every typing field the game shows — answers, typed maths, dictation,
// Spell Swap, writing tasks, hero / pet names, the RESET box, the Cloud Castle login — has autocorrect, word suggestions,
// auto-capitals, spell check, Chrome writing suggestions and Grammarly / LanguageTool turned off, including fields made
// later by any screen (WR.noAssist + a MutationObserver in js/core.js). Login fields keep their credential tokens.
//   node tools/test/noassist.js   (game served on :18642)
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const OUT = '/workspace/cefr-quest/screenshots/';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL - ' + m); process.exitCode = 1; } else console.log('ok - ' + m); };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const SAVE = { v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'b1', stars: 40, totalCorrect: 10, totalAnswered: 12,
  pet: { species: 'pet_bunny', name: 'Puffbun', xp: 20, happiness: 80, hunger: 30, skin: null, lastTick: Date.now() },
  streak: { count: 1, last: today() }, progress: {}, owned: [], equipped: { outfit: null, petskin: null, theme: null },
  settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 1 };
const CRED = /^(username|current-password|new-password)$/;
// every visible-or-not typing field on the page, with what it is missing
const audit = p => p.evaluate(CRED => {
  const re = new RegExp(CRED);
  return [...document.querySelectorAll('input, textarea, [contenteditable]')].filter(WR.isTypingField).map(el => {
    const a = k => el.getAttribute(k), miss = [];
    if (a('autocorrect') !== 'off') miss.push('autocorrect');
    if (a('autocapitalize') !== 'off') miss.push('autocapitalize');
    if (a('spellcheck') !== 'false' || el.spellcheck) miss.push('spellcheck');
    if (a('writingsuggestions') !== 'false') miss.push('writingsuggestions');
    if (a('data-gramm') !== 'false' || a('data-enable-grammarly') !== 'false') miss.push('grammarly');
    if (a('data-lt-active') !== 'false') miss.push('languagetool');
    if (a('autocomplete') !== 'off' && !re.test(a('autocomplete') || '')) miss.push('autocomplete=' + a('autocomplete'));
    return { id: el.id || el.name || el.tagName, ac: a('autocomplete'), im: a('inputmode'), miss };
  });
}, CRED.source);
const seen = new Set();
async function check(p, label, want) {
  const f = await audit(p); f.forEach(x => seen.add(x.id));
  const bad = f.filter(x => x.miss.length);
  ok(!bad.length, `${label}: ${f.length} typing field(s), all without keyboard help ${bad.map(b => b.id + ' [' + b.miss + ']').join('; ')}`);
  for (const id of want || []) ok(f.some(x => x.id === id), `${label}: #${id} is on screen and covered`);
  return f;
}
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await ctx.addInitScript(() => { window.__WR_TEST = { holdMs: 0, pinOffer: false }; });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('dialog', d => d.dismiss());

  // 1. onboarding name (fresh device)
  await p.goto(BASE + 'index.html'); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.waitForSelector('#nm'); await check(p, 'onboarding', ['nm']);
  ok(await p.getAttribute('#nm', 'autocomplete') === 'off', 'onboarding name: no saved-name suggestions (autocomplete=off, was "nickname")');
  await p.focus('#nm'); await p.waitForTimeout(400); await p.screenshot({ path: OUT + 'noassist_onboarding.png' });

  // 2. seeded player
  await p.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE);
  await p.reload(); await p.waitForSelector('.realm-node');
  await check(p, 'map');
  await p.evaluate(() => WR.openRename()); await p.waitForSelector('#heroName'); await check(p, 'hero name', ['heroName']);
  await p.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove()));

  // pet rename
  await p.evaluate(() => WR.go('pet')); await p.waitForSelector('#rename'); await p.click('#rename'); await p.waitForSelector('#pn');
  await check(p, 'pet name', ['pn']);
  await p.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove()));

  // maths typed answer
  await p.evaluate(() => WR.go('dojo')); await p.waitForTimeout(300);
  const dojoBtn = await p.$('[data-ch]'); if (dojoBtn) { await dojoBtn.click(); await p.waitForTimeout(400); }
  if (!(await p.$('#mans'))) { const b = await p.$('#dojoGo, .dj-go, [data-mode="practice"]'); if (b) { await b.click(); await p.waitForTimeout(400); } }
  await check(p, 'Times-Table Tower', ['mans']);

  // dictation
  const raw = await p.evaluate(async () => { const d = await (await fetch('data/b1/listening.json')).json(); const all = Array.isArray(d) ? d : (d.items || Object.values(d).flat()); return all.find(x => x && x.type === 'dictate'); });
  ok(!!raw, 'found a dictation item');
  if (raw) { await p.evaluate(raw => WR.startLesson({ realm: 'b1', skill: 'listening', key: 'listening', title: 'Dictation', items: [WR.normalize(raw)] }), raw);
    await p.waitForSelector('#dictIn'); await check(p, 'dictation', ['dictIn']);
    await p.focus('#dictIn'); await p.waitForTimeout(300); await p.screenshot({ path: OUT + 'noassist_dictation.png' }); }

  // Spell Swap typed answer (B1 is typed)
  await p.evaluate(() => WR.openSwap('b1')); await p.waitForSelector('.sw-book'); await p.click('.sw-book'); await p.waitForSelector('#swIn');
  await check(p, 'Spell Swap', ['swIn']);

  // writing task
  const wid = await p.evaluate(async () => { const b = await WR.bank('b1', 'writing'); const l = Array.isArray(b) ? b : (b.tasks || b.items || []); return l[0] && l[0].id; });
  await p.evaluate(id => WR.openQuill('b1', id, 'write'), wid); await p.waitForSelector('#qText');
  await check(p, 'Story Quill writing', ['qText']);

  // grown-ups RESET box (behind the gate)
  await p.evaluate(() => WR.go('home')); await p.waitForSelector('.realm-node');
  await p.click('#setBtn'); await p.waitForSelector('#guBtn'); await p.click('#guBtn'); await p.waitForSelector('.pgate');
  const a = await p.evaluate(() => WR.parentGate._answer()); for (const d of a) await p.click(`.pgate [data-d="${d}"]`); await p.click('#pgOk'); await p.waitForTimeout(300);
  await p.waitForSelector('#guReset'); await check(p, 'Grown-ups', ['guPin']);
  await p.click('#guReset'); await p.waitForSelector('#rsIn'); await check(p, 'RESET box', ['rsIn']);
  await p.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove()));

  // Cloud Castle login keeps credential tokens for saved logins, everything else off
  await p.click('#cloudChip'); await p.waitForSelector('#ccName');
  const cc = await check(p, 'Cloud Castle login', ['ccName', 'ccPass']);
  ok(cc.find(x => x.id === 'ccName').ac === 'username' && /password$/.test(cc.find(x => x.id === 'ccPass').ac), 'login keeps username / password tokens so a saved castle password can fill in');
  await p.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove()));

  // 3. anything made later is covered too (input, textarea, contenteditable, a type switch)
  await p.evaluate(() => {
    const box = document.createElement('div'); box.id = 'naTest';
    box.innerHTML = '<input id="naA" autocomplete="on" spellcheck="true"><textarea id="naB"></textarea><div id="naC" contenteditable="true"></div><input id="naD" type="checkbox">';
    document.body.appendChild(box);
    const e = document.createElement('div'); e.id = 'naE'; box.appendChild(e); e.setAttribute('contenteditable', 'true');
  });
  await p.waitForTimeout(50);
  await check(p, 'fields added later', ['naA', 'naB', 'naC', 'naE']);
  ok(await p.getAttribute('#naD', 'autocorrect') === null, 'checkboxes are left alone');
  await p.evaluate(() => document.getElementById('naTest').remove());

  ok(seen.size >= 10, `checked ${seen.size} different typing fields`);
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await browser.close();
  console.log(fails ? `${fails} FAILED` : 'all passed');
})().catch(e => { console.error(e); process.exit(1); });
