// 🎙️ Recorded voice (js/voice.js WR.say): the ONE speaking helper is used everywhere, the recordings cover every listening
// line, playback/slow replay/fallback work, and the pet voice + settings behave.   node tools/test/voice.js   (BASE=… for live)
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '..', '..');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else console.log('ok', m); };
// 1. static: nothing talks to the speech engine directly
const direct = [];
for (const f of fs.readdirSync(ROOT + '/js')) {
  if (!f.endsWith('.js') || f === 'speech.js' || f === 'voice.js') continue;
  fs.readFileSync(ROOT + '/js/' + f, 'utf8').split('\n').forEach((l, i) => { if (/Speech\.(speak|stop)\(|speechSynthesis|new Audio\(/.test(l.replace(/\/\*.*?\*\/|\/\/.*$/g, ''))) direct.push(`${f}:${i + 1}`); });
}
ok(direct.length === 0, `every line the game speaks goes through WR.say / WR.Voice.stop (direct calls: ${direct.join(', ') || 'none'})`);
// 2. recordings: every listening/lesson line has one, and every manifest file exists
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{2B50}\u{2B06}\u{2190}-\u{21FF}\u{2300}-\u{23FF}]/gu;
const norm = t => String(t).replace(EMOJI, '').replace(/\s+/g, ' ').trim();
const man = JSON.parse(fs.readFileSync(ROOT + '/assets/voice/manifest.json', 'utf8')), narr = man.profiles.narrator || {};
const says = new Set(); const walk = o => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') for (const k in o) k === 'say' && typeof o[k] === 'string' ? says.add(norm(o[k])) : walk(o[k]); };
for (const d of fs.readdirSync(ROOT + '/data')) if (fs.statSync(ROOT + '/data/' + d).isDirectory()) for (const f of fs.readdirSync(ROOT + '/data/' + d)) if (f.endsWith('.json')) walk(JSON.parse(fs.readFileSync(`${ROOT}/data/${d}/${f}`, 'utf8')));
const missing = [...says].filter(t => t && !narr[t]);
ok(says.size > 500 && missing.length === 0, `all ${says.size} listening / dictation lines are recorded (missing: ${missing.slice(0, 3).join(' / ') || 'none'})`);
const files = Object.values(man.profiles).flatMap(p => Object.values(p)), gone = files.filter(f => !fs.existsSync(ROOT + '/assets/voice/' + f));
const bytes = files.reduce((a, f) => a + (fs.existsSync(ROOT + '/assets/voice/' + f) ? fs.statSync(ROOT + '/assets/voice/' + f).size : 0), 0);
ok(gone.length === 0, `all ${files.length} manifest files exist (${(bytes / 1e6).toFixed(1)} MB)`);
ok(Object.keys(man.profiles.pet || {}).length >= 8, `pet chatter lines are recorded in the pet voice (${Object.keys(man.profiles.pet || {}).length})`);
const sw = fs.readFileSync(ROOT + '/sw.js', 'utf8');
ok(!/assets\/voice\/[^"']+\.mp3/.test([...sw.matchAll(/const (?:SHELL|DATA|ARTFILES) = (\[.*?\]);/gs)].map(m => m[1]).join()) && /wrvoice-/.test(sw), 'recordings are not precached; the service worker keeps each one in its own runtime cache');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); await ctx.addInitScript(() => { window.__WR_CLASSIC_ONLY = true; });   // R18: this test drives the classic multiple-choice flow
  await ctx.route(/supabase|jsdelivr|unpkg/, r => r.abort());
  await ctx.addInitScript(() => {   // record what the device voice and the <audio> player are asked to do
    window.__tts = []; window.__played = [];
    const fake = { speak: u => { __tts.push({ text: u.text, rate: u.rate, pitch: u.pitch }); setTimeout(() => u.onend && u.onend(), 30); }, cancel() { }, getVoices: () => [], onvoiceschanged: null };
    Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true });
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { __played.push({ src: this.src.replace(location.origin, ''), rate: this.playbackRate }); return play.call(this); };
  });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto(BASE + '?fresh=' + Date.now(), { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.setItem('wordRealms.save.v1', JSON.stringify({ v: 1, name: 'Mia', avatar: 'avatar_girl', startLevel: 'a1', stars: 10,
    pet: { species: 'pet_fox', name: 'Ember', xp: 50, happiness: 90, hunger: 20, lastTick: Date.now() }, progress: {}, owned: [], equipped: {}, settings: { rate: 0.9, sound: false } })));
  await page.reload(); await page.waitForSelector('#goalsCard').catch(async e => { console.log('DBG', errs, (await page.evaluate(() => document.body.innerText)).slice(0, 300)); throw e; }); await page.evaluate(() => WR.Voice.load());
  const line = [...says][7];
  const r1 = await page.evaluate(async t => { __played = []; __tts = []; WR.say(t); await new Promise(r => setTimeout(r, 600)); return { played: __played, tts: __tts.length, last: WR.Voice.last, playing: WR.Voice.playing() }; }, line);
  ok(r1.played.length === 1 && /^\/?.*assets\/voice\/narrator_/.test(r1.played[0].src) && r1.tts === 0, `a listening line plays its recording, not the device voice (${r1.played.map(p => p.src)})`);
  ok(Math.abs(r1.played[0].rate - 1) < 0.01, `normal speed = the recording as made (playbackRate ${r1.played[0].rate})`);
  const dur = await page.evaluate(async () => { const a = new Audio(WR.Voice.last.src); await new Promise(r => { a.onloadedmetadata = r; a.onerror = r; setTimeout(r, 4000); }); return a.duration; });
  ok(dur > 0.3, `the MP3 really loads and decodes (${dur && dur.toFixed(2)} s)`);
  const r2 = await page.evaluate(async t => { __played = []; WR.say(t, { rate: 0.6 }); await new Promise(r => setTimeout(r, 300)); return __played; }, line);
  ok(r2.length === 1 && Math.abs(r2[0].rate - 0.8) < 0.01, `🐢 slow replay slows the recording (playbackRate ${r2[0] && r2[0].rate})`);
  const r3 = await page.evaluate(async () => { __played = []; __tts = []; let ended = false; WR.say('Mia and Ember found a tiny silver key.', { onend: () => ended = true }); await new Promise(r => setTimeout(r, 400)); return { played: __played.length, tts: __tts, ended }; });
  ok(r3.played === 0 && r3.tts.length === 1 && r3.ended, `a line with no recording (e.g. the player's name) uses the device voice and still calls back ${JSON.stringify(r3.tts)}`);
  const r4 = await page.evaluate(async t => { WR.state.settings.voice = 'device'; __played = []; __tts = []; WR.say(t); await new Promise(r => setTimeout(r, 200)); WR.state.settings.voice = 'recorded'; return { played: __played.length, tts: __tts.length }; }, line);
  ok(r4.played === 0 && r4.tts === 1, 'Settings → device voice: the recording is skipped');
  const r5 = await page.evaluate(async () => { __played = []; WR.petSay("Hehe, that tickles! 😆"); await new Promise(r => setTimeout(r, 300)); const on = __played.slice();
    WR.state.settings.petVoice = false; __played = []; __tts = []; WR.petSay("Hehe, that tickles! 😆"); await new Promise(r => setTimeout(r, 300)); const off = __played.length + __tts.length; WR.state.settings.petVoice = true; return { on, off }; });
  ok(r5.on.length === 1 && /assets\/voice\/pet_/.test(r5.on[0].src) && r5.off === 0, `🐾 pet chatter uses the bubbly pet voice, and is silent when cute pet voice is off (${r5.on.map(p => p.src)})`);
  const r6 = await page.evaluate(async () => { __played = []; __tts = []; WR.say('A totally new sentence nobody recorded.', { character: 'pet_fox' }); await new Promise(r => setTimeout(r, 200)); return __tts; });
  ok(r6.length === 1 && r6[0].pitch > 1.3, `pet lines with no recording use a gently higher device voice (pitch ${r6[0] && r6[0].pitch})`);
  // the pet screen: rubbing the pet makes it talk
  await page.evaluate(() => WR.go('pet')); await page.waitForSelector('#pethome');
  const r7 = await page.evaluate(async () => { __played = []; const h = document.querySelector('#petStage'); const b = h.getBoundingClientRect();
    for (let i = 0; i < 7; i++) { h.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: b.left + b.width / 2, clientY: b.top + b.height / 2 })); await new Promise(r => setTimeout(r, 270)); }   // 6 cuddles → a line
    await new Promise(r => setTimeout(r, 300)); return { played: __played, bubble: document.querySelector('#pbubble').textContent }; });
  ok(r7.played.some(p => /assets\/voice\/pet_/.test(p.src)), `rubbing the pet: its bubble is read out in the pet voice ("${r7.bubble}")`);
  // stop: leaving a screen silences a recording
  const r8 = await page.evaluate(async t => { WR.say(t); await new Promise(r => setTimeout(r, 200)); WR.Voice.stop(); return WR.Voice.playing(); }, line);
  ok(r8 === false, 'WR.Voice.stop() silences a recording');
  // settings toggles
  await page.evaluate(() => WR.go('home')); await page.waitForSelector('#goalsCard');
  await page.evaluate(() => WR.openSettings ? WR.openSettings() : document.querySelector('#setBtn, [data-settings], .settings-btn').click());
  await page.waitForSelector('#recV');
  await page.click('#recV'); const v1 = await page.evaluate(() => WR.state.settings.voice); await page.click('#recV'); const v2 = await page.evaluate(() => WR.state.settings.voice);
  await page.click('#petV'); const p1 = await page.evaluate(() => WR.state.settings.petVoice); await page.click('#petV');
  ok(v1 === 'device' && v2 === 'recorded' && p1 === false, `Settings: recorded ↔ device voice and cute pet voice toggles save (${v1}, ${v2}, ${p1})`);
  const r9 = await page.evaluate(async () => { __played = []; document.querySelector('#testPet').click(); await new Promise(r => setTimeout(r, 300)); const a = __played.slice(); __played = []; document.querySelector('#test').click(); await new Promise(r => setTimeout(r, 300)); return [a, __played]; });
  ok(/pet_/.test((r9[0][0] || {}).src) && /narrator_/.test((r9[1][0] || {}).src), 'Settings: 🔈 Test voice and 🐾 Hear my pet preview the two recorded voices');
  ok(errs.length === 0, 'no page errors ' + errs.join(' | '));
  await browser.close();
  console.log(fails ? `voice.js: ${fails} FAILED` : 'voice.js: all passed');
})();
