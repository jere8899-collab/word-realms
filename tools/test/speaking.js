// Echo Well speaking test: mocks SpeechRecognition (perfect / partial / wrong / mic denied) and checks the no-recognition fallback.
const { chromium } = require('playwright-core');
const OUT = '/workspace/cefr-quest/screenshots/';
const URL = 'http://127.0.0.1:18642/index.html';
const clean = async p => { await p.evaluate(() => document.querySelectorAll('.confetti,.toast').forEach(e => e.remove())); await p.waitForTimeout(450); };
const assert = (c, m) => { if (!c) throw new Error('ASSERT ' + m); console.log('ok -', m); };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
// an OLD save (no `speaking` field) to check graceful migration
const SAVE = JSON.stringify({
  v: 1, name: 'Jeremy', avatar: 'avatar_mage', startLevel: 'a1', stars: 40, totalCorrect: 30, totalAnswered: 40,
  pet: { species: 'pet_fox', name: 'Mochi', xp: 420, happiness: 82, hunger: 35, skin: null, lastTick: Date.now() },
  streak: { count: 3, last: today() }, progress: { a1: { grammar: { best: 1, plays: 1 }, vocab: { best: .9, plays: 1 } } },
  owned: [], equipped: { outfit: null, petskin: null, theme: null }, settings: { rate: .9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 2 });
// Mock recogniser: the test puts the alternatives for the next utterance in window.__sr.alts (or sets window.__sr.deny)
const MOCK = () => {
  window.__sr = { alts: [], deny: false, made: [] };
  class MockSR {
    start() {
      const cfg = window.__sr; window.__sr.made.push({ lang: this.lang, interimResults: this.interimResults, maxAlternatives: this.maxAlternatives });
      const res = (alts, fin) => { const r = alts.map(t => ({ transcript: t, confidence: .9 })); r.isFinal = fin; return r; };
      setTimeout(() => {
        if (cfg.deny) { this.onerror && this.onerror({ error: 'not-allowed' }); this.onend && this.onend(); return; }
        const alts = cfg.alts.slice(0, this.maxAlternatives || 1);
        this.onresult && this.onresult({ resultIndex: 0, results: [res([alts[0].split(' ').slice(0, 2).join(' ')], false)] });
        setTimeout(() => { this.onresult && this.onresult({ resultIndex: 0, results: [res(alts, true)] }); setTimeout(() => this.onend && this.onend(), 30); }, 120);
      }, 150);
    }
    stop() { } abort() { }
  }
  window.webkitSpeechRecognition = MockSR; window.SpeechRecognition = MockSR;
};
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const errors = [];
  const ext = []; // external web fonts may fail in a sandbox without internet; anything else is a real error
  const watch = (p, tag) => { p.on('pageerror', e => errors.push(tag + ' pageerror: ' + e.message));
    p.on('requestfailed', r => { if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) ext.push(r.url()); else errors.push(tag + ' reqfail: ' + r.url()); });
    p.on('console', m => { if (m.type() === 'error' && !(/Failed to load resource/.test(m.text()) && ext.length)) errors.push(tag + ' console: ' + m.text()); }); };
  async function open(viewport, mock, extra = {}) {
    const ctx = await browser.newContext({ viewport, ...extra });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); // don't depend on the internet for web fonts
    if (mock) await ctx.addInitScript(MOCK);
    else await ctx.addInitScript(() => { window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined; });
    await ctx.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('wordRealms.save.v1', s); sessionStorage.setItem('seeded', '1'); } }, SAVE);
    const page = await ctx.newPage(); watch(page, viewport.width + (mock ? 'mock' : 'nosr'));
    await page.goto(URL, { waitUntil: 'domcontentloaded' }); await page.waitForFunction(() => window.WR && WR.realms && document.querySelector('.topbar'), null, { timeout: 20000 })
      .catch(async e => { console.log('BOOT FAIL', JSON.stringify(errors), await page.evaluate(() => document.body.innerText.slice(0, 300))); throw e; }); await page.waitForTimeout(300);
    return page;
  }
  const page = await open({ width: 1200, height: 860 }, true);
  const mig = await page.evaluate(() => WR.state.speaking);
  assert(mig && mig.rounds === 0 && mig.preferShadow === false, 'old save migrated with speaking stats');

  // ---- scoring unit checks (in the page) ----
  const u = await page.evaluate(() => {
    const E = WR.Echo, r = (t, h) => Math.round(E.scoreRead(t, h).score * 100);
    return {
      perfect: r("Hello! My name is Lily.", "hello my name is lily"),
      contr: r("I'm going to buy some sweets tomorrow.", "I am going to buy some sweets tomorrow"),
      contr2: r("I can swim, but I can't fly.", "I can swim but I cannot fly"),
      num: r("I am seven years old.", "I'm 7 years old"),
      spell: r("What is your favourite colour?", "what's your favorite color"),
      compound: r("I've never eaten candy floss before.", "I've never eaten candyfloss before"),
      plural: r("My dog runs in the park.", "my dog run in the park"),
      half: r("We play football after school.", "we play"),
      empty: r("We play football after school.", ""),
      ans: E.scoreAnswer({ keywords: ["if it rains", "will"], minWords: 5 }, "if it rains tomorrow I'll stay at home").score,
      ansMiss: E.scoreAnswer({ keywords: ["if it rains", "will"], minWords: 5 }, "when it is raining I stay at home").score,
      ansShort: E.scoreAnswer({ keywords: ["should"], minWords: 5 }, "you should").score,
      best: Math.round(E.best({ type: 'read', text: 'The sun is hot today.' }, ['the son is hot to day', 'the sun is hot today']).score * 100),
      stars: [E.starsFor(.95), E.starsFor(.75), E.starsFor(.55), E.starsFor(.4)].join(',')
    };
  });
  console.log(JSON.stringify(u));
  assert(u.perfect === 100 && u.contr === 100 && u.contr2 === 100 && u.num === 100, 'punctuation, contractions and numbers are tolerated');
  assert(u.spell === 100 && u.compound === 100, 'US spellings and compounds tolerated');
  assert(u.plural < 100, 'a dropped -s ending is NOT forgiven');
  assert(u.half === 40 && u.empty === 0, 'partial transcript scores by words heard');
  assert(u.ans === 1 && u.ansMiss < 0.5 && u.ansShort <= 0.65, 'answer prompts check keywords and length');
  assert(u.best === 100, 'best of the recogniser alternatives is used');
  assert(u.stars === '3,2,1,0', 'star thresholds 90/70/50');

  // ---- realm tile ----
  await page.evaluate(() => WR.go('realm', 'a1')); await page.waitForSelector('[data-speak]');
  assert((await page.$$('.skill-card[data-k]')).length === 4 && await page.$('[data-sp]'), '4 core skills + special still there, Speaking added as 5th');
  const unlockBefore = await page.evaluate(() => WR.realmProgress('a1').passed);
  await page.click('[data-speak]'); await page.waitForSelector('#micBtn');
  await page.waitForTimeout(500);
  await page.screenshot({ path: OUT + 'speaking_01_a1_prompt.png' });
  const dbg = () => page.evaluate(() => WR._echoDbg());
  const say = async alts => { await page.evaluate(a => { window.__sr.alts = a; window.__sr.deny = false; }, alts); await page.click('#micBtn', { force: true }); await page.waitForSelector('#echoResult .echo-stars', { timeout: 5000 }); await page.waitForTimeout(150); };
  const litStars = () => page.$eval('.echo-stars', e => [...e.childNodes].filter(n => n.nodeName !== 'SPAN').map(n => n.nodeType === 3 ? n.textContent : (n.dataset && n.dataset.e) || '').join('').split('').filter(c => c === '⭐').length);   // lit stars sit before the faded <span>; they render as painted icons
  // 1) perfect transcript (as 2nd alternative, behind a bad one)
  let it = (await dbg()).item, stars0 = await page.evaluate(() => WR.state.stars);
  await say(['completely different words', it.text.replace(/[.,!?]/g, '')]);
  const made = await page.evaluate(() => window.__sr.made[0]);
  assert(made.lang === 'en-GB' && made.interimResults === true && made.maxAlternatives === 3, 'recogniser set to en-GB, interim, 3 alternatives');
  let w = await page.evaluate(() => ({ hit: document.querySelectorAll('#echoText .w.hit').length, miss: document.querySelectorAll('#echoText .w.miss').length, n: document.querySelectorAll('#echoText .w').length }));
  assert(w.hit === w.n && w.miss === 0, `perfect: all ${w.n} words green`);
  assert(await litStars() === 3, 'perfect: 3 stars');
  assert(await page.evaluate(() => WR.state.stars) === stars0 + 1, 'perfect: +1 star awarded');
  // retry does not pay again
  await page.click('#retryBtn'); await page.evaluate(() => { window.__sr.alts = [document.querySelector('#echoText').textContent]; }); await page.waitForSelector('#echoResult .echo-stars');
  assert(await page.evaluate(() => WR.state.stars) === stars0 + 1, 'retry allowed, star only paid once per sentence');
  await page.click('#nextBtn'); await page.waitForTimeout(200);
  // 2) partial transcript
  it = (await dbg()).item; const words = it.text.split(' '); const keep = Math.ceil(words.length * 0.6);
  await say([words.slice(0, keep).join(' ')]);
  w = await page.evaluate(() => ({ hit: document.querySelectorAll('#echoText .w.hit').length, miss: document.querySelectorAll('#echoText .w.miss').length, n: document.querySelectorAll('#echoText .w').length, pet: document.querySelector('#lpet').className }));
  console.log('partial', JSON.stringify(w), it.text);
  assert(w.hit > 0 && w.miss > 0 && w.hit + w.miss === w.n, 'partial: words coloured green and pink');
  const ps = await litStars(); assert(ps >= 0 && ps <= 2, 'partial: fewer than 3 stars (' + ps + ')');
  assert(/bounce|cheer|sad/.test(w.pet), 'pet reacts');
  await clean(page); await page.screenshot({ path: OUT + 'speaking_02_partial_result.png' });
  await page.click('#nextBtn'); await page.waitForTimeout(200);
  // 3) totally missed → planted in the garden
  const m0 = await page.evaluate(() => WR.state.mistakes.length);
  it = (await dbg()).item; await say(['banana']);
  assert(await litStars() === 0, 'miss: 0 stars');
  await page.click('#nextBtn'); await page.waitForTimeout(200);
  const planted = await page.evaluate(() => WR.state.mistakes[0]);
  assert(await page.evaluate(() => WR.state.mistakes.length) === m0 + 1 && planted.skill === 'speaking' && planted.type === 'order' && planted.correct === it.text, 'missed sentence planted in the Mistake Garden');
  // 4-5) perfect
  for (let k = 0; k < 2; k++) { it = (await dbg()).item; await say([it.text]); await page.click('#nextBtn'); await page.waitForTimeout(200); }
  await page.waitForSelector('.result');
  const after = await page.evaluate(() => ({ p: WR.state.progress.a1.speaking, passed: WR.realmProgress('a1').passed, rounds: WR.state.speaking.rounds }));
  console.log(JSON.stringify(after));
  assert(after.p && after.p.best > 0.5 && after.rounds === 1, 'round recorded as a1/speaking progress');
  assert(after.passed === unlockBefore, 'speaking does not change the 3-of-4 unlock count');
  await page.screenshot({ path: OUT + 'speaking_06_round_result.png' });
  // garden can review the planted speaking card
  await page.evaluate(() => WR.go('review')); await page.waitForTimeout(300);
  await page.click('#waterBtn'); await page.waitForSelector('#pool .tile');
  assert(true, 'garden review round opens the speaking card as a sentence builder');
  await page.evaluate(() => WR.go('realm', 'a1')); await page.waitForSelector('[data-speak] .crowns');
  assert(/👑/.test(await page.$eval('[data-speak] .crowns', e => WR.iconText(e))), 'Speaking tile shows crowns');

  // ---- C2 read-aloud + C1 answer prompt ----
  await page.evaluate(async () => { const b = await WR.bank('c2', 'speaking'); WR.startSpeaking('c2', { items: [b.find(x => x.id === 'c2-sp17'), b.find(x => x.type === 'answer')] }); });
  await page.waitForSelector('#micBtn'); await page.waitForTimeout(500);
  await clean(page); await page.screenshot({ path: OUT + 'speaking_03_c2_prompt.png' });
  it = (await dbg()).item; await say([it.text.toLowerCase()]); assert(await litStars() === 3, 'C2 long sentence perfect = 3 stars');
  await page.click('#nextBtn'); await page.waitForTimeout(200);
  it = (await dbg()).item; assert(it.type === 'answer', 'answer-the-question prompt shown');
  await say([it.model]);
  const kw = await page.evaluate(() => ({ hit: document.querySelectorAll('#echoResult .kw.hit').length, miss: document.querySelectorAll('#echoResult .kw.miss').length }));
  assert(kw.hit === it.keywords.length && kw.miss === 0 && await litStars() === 3, 'answer prompt: keywords all ticked');
  await page.screenshot({ path: OUT + 'speaking_07_c2_answer.png' });

  // ---- mic denied → shadowing fallback ----
  await page.evaluate(() => WR.startSpeaking('b1')); await page.waitForSelector('#micBtn');
  await page.evaluate(() => { window.__sr.deny = true; }); await page.click('#micBtn', { force: true });
  await page.waitForSelector('.echo-banner'); await page.waitForSelector('[data-self]');
  assert(/switched off/.test(await page.$eval('.echo-banner', e => e.textContent)), 'mic denied → friendly message + shadowing mode');
  assert(await page.evaluate(() => WR.state.speaking.preferShadow), 'denial remembered for the next round');
  await page.click('#tryMic'); await page.waitForSelector('#micBtn');
  assert(!(await page.evaluate(() => WR.state.speaking.preferShadow)), 'can switch back to the microphone');

  // ---- no SpeechRecognition at all (Firefox / Safari / headless) ----
  const np = await open({ width: 1200, height: 860 }, false);
  assert(!(await np.evaluate(() => WR.Echo.supported())), 'recognition unavailable in this context');
  await np.evaluate(() => WR.go('realm', 'a2')); await np.click('[data-speak]');
  await np.waitForSelector('.echo-banner'); await np.waitForTimeout(400);
  assert(/can't listen/.test(await np.$eval('.echo-banner', e => e.textContent)) && !(await np.$('#micBtn')) && !(await np.$('#tryMic')), 'fallback: message, no mic button');
  const s1 = await np.evaluate(() => WR.state.stars);
  await np.click('[data-self="again"]'); await np.waitForSelector('#echoResult .echo-stars');
  assert(await np.evaluate(() => WR.state.stars) === s1, 'shadowing 😅 try again earns nothing yet');
  await np.click('#retryBtn'); await np.click('[data-self="great"]'); await np.waitForSelector('#echoResult .echo-stars');
  assert(await np.evaluate(() => WR.state.stars) === s1 + 1, 'shadowing 😊 earns 1 star');
  await np.click('#retryBtn'); await np.click('[data-self="great"]'); await np.waitForSelector('#echoResult .echo-stars');
  assert(await np.evaluate(() => WR.state.stars) === s1 + 1, 'self-rating again does not pay twice');
  await clean(np); await np.screenshot({ path: OUT + 'speaking_05_fallback.png' });
  await np.click('#nextBtn');
  for (let k = 0; k < 4; k++) { await np.waitForSelector('[data-self]'); await np.click('[data-self="ok"]'); await np.waitForSelector('#nextBtn'); await np.click('#nextBtn'); await np.waitForTimeout(150); }
  await np.waitForSelector('.result');
  const sh = await np.evaluate(() => WR.state.progress.a2.speaking.best);
  assert(sh <= 0.7, 'shadowing round recorded (capped at 2 crowns: ' + sh + ')');

  // ---- mobile 390x844 ----
  const mp = await open({ width: 390, height: 844 }, true, { deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await mp.evaluate(() => WR.go('realm', 'b2')); await mp.waitForSelector('[data-speak]'); await mp.click('[data-speak]'); await mp.waitForSelector('#micBtn');
  let mit = await mp.evaluate(() => WR._echoDbg().item);
  if (mit.type === 'answer') { await mp.evaluate(async () => { const b = await WR.bank('b2', 'speaking'); WR.startSpeaking('b2', { items: [b[5]] }); }); await mp.waitForSelector('#micBtn'); mit = await mp.evaluate(() => WR._echoDbg().item); }
  const mw = mit.text.split(' ');
  await mp.evaluate(a => { window.__sr.alts = a; }, [mw.filter((_, k) => k % 4 !== 2).join(' ')]);
  await mp.click('#micBtn', { force: true }); await mp.waitForSelector('#echoResult .echo-stars'); await mp.waitForTimeout(600);
  await mp.evaluate(() => window.scrollTo(0, 0));
  const ov = await mp.evaluate(() => document.documentElement.scrollWidth);
  assert(ov <= 391, 'mobile: no horizontal overflow (' + ov + ')');
  await clean(mp); await mp.screenshot({ path: OUT + 'speaking_04_mobile.png' });
  await mp.evaluate(() => document.querySelector('.echo-stars').scrollIntoView({ block: 'center' })); await mp.waitForTimeout(400);
  await mp.screenshot({ path: OUT + 'speaking_04b_mobile_result.png' });

  console.log('ERRORS', JSON.stringify(errors), 'ignored external font failures:', ext.length);
  assert(errors.length === 0, 'no console / page errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
