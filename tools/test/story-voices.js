// 🎙️ STORY-VOICES: every Storybook line is read by ONE recorded narrator (af_heart MP3), never the device voice part-way through a page.
// Fails on a missing or mismatched recording, a name that can't be recorded, mixed / overlapping / double playback, or audio that keeps
// going after a page turn or leaving the story.   node tools/test/story-voices.js   (BASE=… for live; FFPROBE=0 to skip the file probe)
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { chromium } = require('playwright-core');
const ROOT = path.join(__dirname, '..', '..');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };
const LV = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
// file name = profile + FNV-1a of "profile|text" + sha1 (tools/build_voice.py fname): the file a line maps to was recorded for THAT text
const crypto = require('crypto');
const fname = (p, t, said = t) => { const s = p + '|' + t + (said !== t ? '|' + said : ''); let h = 2166136261; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; if (c.codePointAt(0) > 0xffff) { /* python iterates code points too */ } } return `${p}_${h.toString(16).padStart(8, '0')}${crypto.createHash('sha1').update(s).digest('hex').slice(0, 4)}.mp3`; };
const SAVE = species => ({ v: 1, name: 'Zephyrine', avatar: 'avatar_mage', startLevel: 'a1', stars: 40, totalCorrect: 0, totalAnswered: 0,
  pet: { species, name: 'Sir Wobbles', xp: 0, happiness: 80, hunger: 20, skin: null, lastTick: Date.now() }, streak: { count: 1, last: null },
  progress: {}, owned: [], equipped: {}, settings: { rate: 1.1, sound: false, unlockAll: true, petVoice: false }, mistakes: [], lessonsDone: 0 });
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });
  // log every play: which source, and whether anything else was sounding at that moment
  await ctx.addInitScript(() => {
    const els = new Set(), ids = new WeakMap(); let n = 0; window.__plays = [];
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { if (!ids.has(this)) ids.set(this, ++n); els.add(this);
      const others = [...els].filter(e => e !== this && !e.paused).length;
      window.__plays.push({ kind: 'mp3', src: (this.src || this.currentSrc || '').replace(/^.*\/assets\//, 'assets/'), el: ids.get(this), others, speech: !!(window.speechSynthesis && speechSynthesis.speaking), t: performance.now() });
      return play.apply(this, arguments); };
    if (window.speechSynthesis) { const sp = speechSynthesis.speak.bind(speechSynthesis);
      speechSynthesis.speak = u => { window.__plays.push({ kind: 'device', text: u.text, others: [...els].filter(e => !e.paused).length, t: performance.now() }); return sp(u); }; }
    window.__sounding = () => [...els].filter(e => !e.paused).length + (window.speechSynthesis && speechSynthesis.speaking ? 1 : 0);
  });
  const errs = [];
  const open = async species => { const page = await ctx.newPage(); page.on('pageerror', e => errs.push(e.message));
    await page.goto(BASE + 'manifest.webmanifest'); await page.evaluate(s => { localStorage.clear(); localStorage.setItem('wordRealms.save.v1', JSON.stringify(s)); }, SAVE(species));
    await page.goto(BASE + 'index.html'); await page.waitForFunction(() => window.WR && WR.Voice && WR.Story && WR.realms); await WR_LOADED(page); return page; };
  const WR_LOADED = async page => { await page.evaluate(() => WR.Voice.load()); await page.waitForTimeout(1200); await shut(page); };
  const shut = page => page.evaluate(() => document.querySelectorAll('.modal-bg').forEach(m => m.remove()));

  // 1. every line on every page of every chapter, for two pet species: recorded, the file was made for that exact text, no names that can't be recorded
  const seen = new Map(); let pages = 0, chapters = 0;
  for (const species of ['pet_fox', 'pet_penguin']) {
    const page = await open(species);
    const pet = await page.evaluate(() => WR.petInfo().name);
    for (const rid of LV) {
      const nch = await page.evaluate(r => WR.loadStory(r).then(d => d.chapters.length), rid);
      for (let n = 1; n <= nch; n++) {
        chapters++;
        await shut(page); await page.evaluate(([r, n]) => WR.go('story', { rid: r, n }), [rid, n]); await page.waitForSelector('.story-screen');
        for (let pi = 0; pi < 4; pi++) {
          await page.waitForSelector('#storyText .sent');
          const ls = await page.evaluate(() => [...document.querySelectorAll('#storyText .sent')].map(s => ({ t: WR.Voice.norm(s.textContent), f: WR.Voice.fileFor(s.textContent) })));
          pages++;
          for (const l of ls) seen.set(l.t, { f: l.f, where: `${rid}.${n}.${pi + 1}`, pet });
          await shut(page); await page.click('.story-q .opt'); await page.waitForSelector('#storyNext'); await page.click('#storyNext');
        }
      }
    }
    const shown = await page.evaluate(() => document.body.innerText);
    ok(!/Zephyrine|Sir Wobbles/.test([...seen.keys()].join(' ')), `${species}: story text uses "our hero" and the storybook pet name (${pet}), never a typed name that has no recording`);
    await page.close();
  }
  const lines = [...seen.entries()], miss = lines.filter(([, v]) => !v.f);
  ok(chapters === 84 && pages === 336, `read every page: 6 realms × 7 chapters × 4 pages × 2 pets (${chapters} chapters, ${pages} pages)`);
  ok(miss.length === 0, `all ${lines.length} story lines have a recording (missing: ${miss.slice(0, 3).map(([t, v]) => v.where + ' “' + t + '”').join(' / ') || 'none'})`);
  const VCF = JSON.parse(fs.readFileSync(ROOT + '/data/voices.json', 'utf8')), VC0 = VCF.sayAs || {}, PH0 = VCF.sayAsPhonemes || {}, WH0 = VCF.sayAsWhole || {};
  const esc = k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const say0 = t => { const w = Object.entries(VC0).filter(([k]) => !k.startsWith('_')).reduce((a, [k, v]) => a.replace(new RegExp('\\b' + esc(k) + '\\b', 'g'), v), (t !== '_doc' && Object.prototype.hasOwnProperty.call(WH0, t)) ? WH0[t] : t);
    const sw = Object.entries(PH0).filter(([k]) => !k.startsWith('_') && w.includes(k)).flatMap(([, v]) => v); return w + (sw.length ? '|ph:' + JSON.stringify(sw).replace(/","/g, '", "').replace(/\],\[/g, '], [') : ''); };   // = tools/build_voice.py spoken()
  const wrong = lines.filter(([t, v]) => v.f && path.basename(v.f) !== fname('narrator', t, say0(t)));
  ok(wrong.length === 0, `each line plays the narrator file recorded for exactly that text (hash check; mismatched: ${wrong.length})`);
  const gone = lines.filter(([, v]) => v.f && !fs.existsSync(path.join(ROOT, v.f)));
  ok(gone.length === 0, `every mapped file exists (${gone.length} missing)`);
  ok(lines.every(([, v]) => !v.f || /\/narrator_/.test(v.f)), 'every story line is in the narrator (af_heart) profile, no second voice');
  const cfg = JSON.parse(fs.readFileSync(ROOT + '/data/voices.json', 'utf8')).profiles.narrator.kokoro;
  ok(cfg.voice === 'af_heart' && cfg.speed === 1 && !cfg.semitones && !cfg.blend, 'the narrator profile is af_heart, speed 1.0, no pitch shift');
  // 🧾 the STORY-VOICES ledger (tools/story-voice-ledger.json, written by tools/story_voice_audit.py --ledger after EVERY line was
  // transcribed and matched word by word): text hash → audio file → voice, speed, the words Kokoro was given, the MP3's own hash, check result.
  // A line with no entry, a re-recorded or swapped MP3, a changed voice / speed / pronunciation, or a failed check fails here.
  const LED = JSON.parse(fs.readFileSync(ROOT + '/tools/story-voice-ledger.json', 'utf8')), VCFG = JSON.parse(fs.readFileSync(ROOT + '/data/voices.json', 'utf8'));
  const sha = b => crypto.createHash('sha1').update(b).digest('hex').slice(0, 12);
  const lp = { none: [], file: [], voice: [], said: [], mp3: [], stt: [] };
  for (const [t, v] of lines) {
    const e = LED.lines[sha(t)];
    if (!e || e.text !== t) { lp.none.push(v.where + ' “' + t + '”'); continue; }
    if (!v.f || path.basename(v.f) !== e.file) lp.file.push(v.where);
    if (e.voice !== VCFG.profiles.narrator.kokoro.voice || e.speed !== VCFG.profiles.narrator.kokoro.speed) lp.voice.push(v.where);
    if (e.said !== say0(t)) lp.said.push(v.where + ' “' + t + '”');
    if (v.f && fs.existsSync(path.join(ROOT, v.f)) && sha(fs.readFileSync(path.join(ROOT, v.f))) !== e.mp3) lp.mp3.push(v.where + ' ' + e.file);
    if (e.check !== 'pass') lp.stt.push(v.where + ' ' + e.check);
  }
  ok(lp.none.length === 0, `every story line has a ledger entry (text hash → file → voice) (${lines.length - lp.none.length}/${lines.length}; missing: ${lp.none.slice(0, 2).join(' / ') || 'none'})`);
  ok(lp.file.length === 0, `the ledger's file is the file the game plays for that text (${lp.file.length} differ)`);
  ok(lp.voice.length === 0, `every line was recorded with the narrator voice and speed in data/voices.json (${lp.voice.length} differ)`);
  ok(lp.said.length === 0, `every line was recorded with today's pronunciation table (sayAs) (stale: ${lp.said.slice(0, 2).join(' / ') || 'none'})`);
  ok(lp.mp3.length === 0, `every MP3 is the exact file that passed the check (content hash; changed: ${lp.mp3.slice(0, 2).join(' / ') || 'none'})`);
  ok(lp.stt.length === 0, `every line passed the word-by-word speech-to-text check (${lines.length - lp.stt.length}/${lines.length}; failing: ${lp.stt.slice(0, 2).join(' / ') || 'none'})`);
  const byIpa = Object.values(LED.lines).filter(e => /^phonemes/.test(e.heard_by || ''));
  ok(byIpa.length <= 5, `at most 5 lines pass on the phoneme check alone (whisper can't hear them; on the phone-listen list): ${byIpa.map(e => '“' + e.text + '”').join(', ') || 'none'}`);
  ok(Object.keys(LED.lines).length >= lines.length, `the ledger covers the whole story set (${Object.keys(LED.lines).length} entries: sentences, dotted words and their meanings; ${lines.length} sentences read on screen)`);
  if (process.env.FFPROBE !== '0') {
    const bad = [];
    for (const [t, v] of lines) { if (!v.f) continue;
      const j = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=sample_rate,channels,codec_name:format=duration', '-of', 'json', path.join(ROOT, v.f)]).toString());
      const s = j.streams[0], d = +j.format.duration, w = (t.match(/[A-Za-z0-9']+/g) || []).length, wps = w / d;
      if (s.codec_name !== 'mp3' || +s.sample_rate !== 24000 || s.channels !== 1 || (w >= 4 && (wps < 1.0 || wps > 5.2))) bad.push(`${v.where} ${d.toFixed(1)}s ${wps.toFixed(1)}w/s ${s.sample_rate}`); }
    ok(bad.length === 0, `every story MP3 is mono 24 kHz MP3 at a natural pace (1.0–5.2 words/s; off: ${bad.slice(0, 3).join(' / ') || 'none'})`);
  }

  // 2. playback: 🔊 Read to me plays each sentence from its MP3, one after another, one element, nothing overlapping, no device voice
  const page = await open('pet_bunny');
  const readPage = async (rid, n, label) => {
    await shut(page); await page.evaluate(([r, n]) => WR.go('story', { rid: r, n }), [rid, n]); await page.waitForSelector('#readAll');
    const want = await page.evaluate(() => [...document.querySelectorAll('#storyText .sent')].map(s => WR.Voice.fileFor(s.textContent)));
    await page.evaluate(() => { window.__plays = []; }); await page.tap('#readAll');
    await page.waitForFunction(k => window.__plays.length >= k && !window.__sounding(), want.length, { timeout: 120000, polling: 250 });
    await page.waitForTimeout(1200);
    const log = await page.evaluate(() => window.__plays);
    console.log(`   ${label}: ` + log.map(p => p.kind === 'mp3' ? p.src.split('/').pop() : 'DEVICE:' + p.text).join(', '));
    ok(log.length === want.length && log.every((p, i) => p.kind === 'mp3' && p.src === want[i]), `${label}: Read to me played all ${want.length} sentences in order, each from its af_heart MP3 (${log.length} plays)`);
    ok(log.every(p => p.kind === 'mp3' && !p.others && !p.speech), `${label}: never two voices at once, never the device voice (${log.filter(p => p.kind !== 'mp3').length} device lines)`);
    ok(new Set(log.map(p => p.el)).size === 1, `${label}: one audio element re-used for every line (phones allow it to keep playing after the first tap)`);
  };
  await readPage('a1', 1, 'A1 ch 1 p 1');
  await readPage('c2', 7, 'C2 ch 7 p 1');
  // 3. stops: answer (page re-renders), turn the page, leave → silence, and the chain never restarts
  const plays = () => page.evaluate(() => window.__plays.map(p => p.kind === 'mp3' ? p.src.split('/').pop() : 'DEVICE').join(', '));
  const startRead = async () => { await page.evaluate(() => { window.__plays = []; }); await page.tap('#readAll'); await page.waitForFunction(() => window.__plays.length >= 1 && window.__sounding()); await page.waitForTimeout(400); };
  await page.evaluate(() => WR.go('story', { rid: 'b1', n: 2 })); await page.waitForSelector('#readAll');
  await startRead(); await page.tap('.story-q .opt'); await page.waitForTimeout(150);
  let after = await page.evaluate(() => window.__sounding()); await page.waitForTimeout(5000);
  let more = await page.evaluate(() => window.__plays.length);
  ok(after === 0 && more === 1, `answering the question stops Read to me at once and it doesn't carry on (${after} sounding, ${more} plays: ${await plays()})`);
  await startRead(); await page.tap('#storyNext'); await page.waitForTimeout(150);
  after = await page.evaluate(() => window.__sounding()); await page.waitForTimeout(4000); more = await page.evaluate(() => window.__plays.length);
  ok(after === 0 && more === 1, `turning the page stops the reading (${after} sounding, ${more} plays)`);
  await startRead(); await page.tap('#storyQuit'); await page.waitForTimeout(150);
  after = await page.evaluate(() => window.__sounding()); await page.waitForTimeout(4000); more = await page.evaluate(() => window.__plays.length);
  ok(after === 0 && more === 1, `leaving the story stops the reading (${after} sounding, ${more} plays)`);
  // 4. tapping a sentence while Read to me is going: only that sentence, the chain stops
  await page.evaluate(() => WR.go('story', { rid: 'a2', n: 3 })); await page.waitForSelector('#readAll');
  await startRead(); const last = await page.evaluate(() => { const s = [...document.querySelectorAll('#storyText .sent')].pop(); return WR.Voice.fileFor(s.textContent); });
  await page.evaluate(() => [...document.querySelectorAll('#storyText .sent')].pop().scrollIntoView({ block: 'center' }));
  await page.tap('#storyText .sent:last-child');
  await page.waitForFunction(() => !window.__sounding(), null, { timeout: 30000, polling: 200 }); await page.waitForTimeout(2500);
  let log = await page.evaluate(() => window.__plays);
  ok(log.length === 2 && log[1].src === last && log.every(p => !p.others && p.kind === 'mp3'), `tapping a sentence mid-read plays just that sentence and the read-aloud stops (${log.length} plays)`);
  // 5. a dotted word: its own recording, and it stops the read-aloud
  const gl = await page.evaluate(async () => { await WR.go('story', { rid: 'a1', n: 1 }); return !!document.querySelector('#storyText .gloss'); });
  await page.waitForSelector('#readAll');
  if (gl) { await startRead(); await page.tap('#storyText .gloss'); await page.waitForFunction(() => !window.__sounding(), null, { timeout: 20000, polling: 200 }); await page.waitForTimeout(2500);
    log = await page.evaluate(() => window.__plays);
    ok(log.length === 2 && log.every(p => p.kind === 'mp3' && !p.others), `a dotted word plays its own recording and stops the read-aloud (${log.length} plays)`);
    // the sentence holding the dotted word must not stay lit (a phone keeps :hover after a tap)
    const lit = await page.evaluate(() => [...document.querySelectorAll('#storyText .sent')].filter(s => s.classList.contains('reading') || !/rgba\(0, 0, 0, 0\)|transparent/.test(getComputedStyle(s).backgroundColor)).map(s => s.textContent.slice(0, 30)));
    ok(lit.length === 0, `after a dotted-word tap no sentence stays highlighted (lit: ${lit.join(' / ') || 'none'})`); }
  // 6. "Device voice" in Settings: only the device voice, never both
  await page.evaluate(() => { WR.state.settings.voice = 'device'; WR.save(); window.__plays = []; WR.go('story', { rid: 'a1', n: 2 }); }); await page.waitForSelector('#readAll');
  await page.tap('#storyText .sent'); await page.waitForTimeout(1500);
  log = await page.evaluate(() => window.__plays);
  ok(log.length >= 1 && log.every(p => p.kind === 'device' && !p.others), `device voice chosen: the device voice only, no MP3 on top (${log.map(p => p.kind)})`);
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  console.log(`story-voices: ${passes} passed, ${fails} failed`);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
