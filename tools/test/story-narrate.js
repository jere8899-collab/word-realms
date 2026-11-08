// Story narration must not fall back to the device voice just because the voice lookup is slow, missing, or offline.
// A dotted word may still be pronounced by the device once the lookup has been checked. Settings → device voice still wins.
//   node tools/test/story-narrate.js
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const SAVE = { v: 1, name: 'Jeremy', avatar: 'avatar_girl', startLevel: 'a1', stars: 40,
  pet: { species: 'pet_bunny', name: 'Sir Wobbles', xp: 20, happiness: 80, hunger: 20, lastTick: Date.now() },
  progress: {}, owned: [], equipped: {}, settings: { rate: 0.9, sound: false, unlockAll: true }, mistakes: [], lessonsDone: 2 };
const spy = () => {
  window.__tts = []; window.__played = [];
  const fake = { speak: u => { __tts.push(u.text); setTimeout(() => u.onend && u.onend(), 20); }, cancel() {}, getVoices: () => [], onvoiceschanged: null };
  Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true });
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { __played.push((this.src || '').replace(/^.*\/assets\//, 'assets/')); return play.apply(this, arguments); };
};
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });

  // 1. Fresh cache, story lookup held back: nothing is spoken until the af_heart file can play.
  {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });
    await ctx.addInitScript(spy);
    await ctx.addInitScript(s => { localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE);
    let release; const held = new Promise(r => { release = r; });
    await ctx.route('**/assets/voice/manifest-story.json', async route => { await held; await route.continue(); });
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
    await page.goto(BASE); await page.waitForSelector('.realm-node');
    const opening = page.evaluate(() => WR.go('story', 'a1'));
    await page.waitForSelector('#storyText', { timeout: 15000 });
    const text = await page.locator('#storyText').innerText();
    const saved = await page.evaluate(() => ({ name: WR.state.name, pet: WR.state.pet.name, tts: __tts.length, played: __played.length }));
    ok(saved.tts === 0 && saved.played === 0 && text.includes('Nova') && text.includes('Puffbun') && !text.includes('Jeremy') && !text.includes('Sir Wobbles') && saved.name === 'Jeremy' && saved.pet === 'Sir Wobbles', 'while the story lookup is held, the words say Nova and Puffbun and nothing is spoken; the save still says Jeremy and Sir Wobbles');
    let mp3; const slow = new Promise(r => { mp3 = r; });
    await ctx.route('**/assets/voice/narrator_*.mp3', async route => { await slow; await route.continue(); });
    await page.evaluate(() => { __tts = []; __played = []; });
    await page.click('#readAll');
    await page.waitForTimeout(500);
    const waiting = await page.evaluate(() => ({ tts: __tts.length, played: __played.length }));
    ok(waiting.tts === 0 && waiting.played === 0, `Read to me waits while the lookup is still loading; no device voice (${waiting.tts})`);
    release();
    await opening;
    await page.waitForFunction(() => (window.__tts && __tts.length) || (WR.Voice.last && WR.Voice.last.src), null, { timeout: 15000 });
    const still = await page.evaluate(() => ({ tts: __tts.length, src: WR.Voice.last && WR.Voice.last.src, device: !!(WR.Voice.last && WR.Voice.last.device) }));
    ok(still.tts === 0 && still.device === false && /narrator_/.test(still.src || ''), `while the recording itself is delayed, the story asks for the af_heart file and not the device voice (${still.src})`);
    mp3();
    await page.waitForFunction(() => window.__played.length >= 1, null, { timeout: 15000 });
    const played = await page.evaluate(() => ({ tts: __tts.slice(), played: __played.slice(0, 2) }));
    ok(played.tts.length === 0 && /narrator_/.test(played.played[0] || ''), `Read to me plays the af_heart file (${played.played[0]})`);
    ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2).join(' | '));
    await ctx.close();
  }

  // 2. Poor network: the lookup never arrives. The words stay. Narration asks kindly. A dotted word may still be pronounced.
  {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });
    await ctx.addInitScript(spy);
    await ctx.addInitScript(s => { localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE);
    await ctx.route('**/assets/voice/manifest-story.json', r => r.abort());
    const page = await ctx.newPage();
    await page.goto(BASE); await page.waitForSelector('.realm-node');
    await page.evaluate(() => WR.go('story', 'a1'));
    await page.waitForSelector('#storyText', { timeout: 15000 });
    await page.evaluate(() => { __tts = []; __played = []; });
    await page.click('#readAll');
    await page.waitForFunction(() => /storyteller isn't ready/.test((document.querySelector('.toast') || {}).textContent || ''), null, { timeout: 8000 });
    const narr = await page.evaluate(() => ({ tts: __tts.length, played: __played.length, last: WR.Voice.last && WR.Voice.last.device }));
    ok(narr.tts === 0 && narr.played === 0 && narr.last === false, 'a missing story lookup does not narrate with the device voice');
    await page.click('#storyText .gloss');
    await page.waitForFunction(() => window.__tts.length >= 1, null, { timeout: 8000 });
    const word = await page.evaluate(() => ({ tts: __tts[0], device: WR.Voice.last && WR.Voice.last.device }));
    ok(word.device === true && word.tts && word.tts.length < 40, `a dotted word can still be pronounced (${word.tts})`);
    await ctx.close();
  }

  // 3. The lookup is here, but the recording cannot be fetched (offline / blocked).
  {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });
    await ctx.addInitScript(spy);
    await ctx.addInitScript(s => { localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE);
    await ctx.route('**/assets/voice/narrator_*.mp3', r => r.abort());
    const page = await ctx.newPage();
    await page.goto(BASE); await page.waitForSelector('.realm-node');
    await page.evaluate(() => WR.go('story', 'a1')); await page.waitForSelector('#readAll');
    await page.evaluate(() => { __tts = []; __played = []; });
    await page.click('#storyText .sent');
    await page.waitForFunction(() => /storyteller isn't ready/.test((document.querySelector('.toast') || {}).textContent || ''), null, { timeout: 8000 });
    const blocked = await page.evaluate(() => ({ tts: __tts.length, device: WR.Voice.last && WR.Voice.last.device }));
    ok(blocked.tts === 0 && blocked.device === false, 'a story sentence whose recording cannot load does not use the device voice');
    await ctx.close();
  }

  // 4. The child (or a grown-up) explicitly chose the device voice. That still wins.
  {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });
    await ctx.addInitScript(spy);
    const chosen = Object.assign({}, SAVE, { settings: Object.assign({}, SAVE.settings, { voice: 'device' }) });
    await ctx.addInitScript(s => { localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, chosen);
    const page = await ctx.newPage();
    await page.goto(BASE); await page.waitForSelector('.realm-node');
    await page.evaluate(() => WR.go('story', 'a1')); await page.waitForSelector('#storyText');
    await page.evaluate(() => { __tts = []; __played = []; });
    await page.click('#storyText .sent');
    await page.waitForFunction(() => window.__tts.length >= 1, null, { timeout: 8000 });
    const dev = await page.evaluate(() => ({ tts: __tts.length, played: __played.length }));
    ok(dev.tts >= 1 && dev.played === 0, 'Settings → device voice still narrates with the device, and not with an MP3 as well');
    await ctx.close();
  }

  await browser.close();
  console.log(`\nstory-narrate: ${passes} passed, ${fails} failed`);
})().catch(e => { console.error(e); process.exit(1); });
