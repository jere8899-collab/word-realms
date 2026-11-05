// 🦁 BRIEF-T8: more Singapore settings and fairly shared festivals in the existing three games.
const { chromium } = require('playwright-core');
const fs = require('fs');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const ROOT = '/workspace/cefr-quest/'; let passed = 0, failed = 0;
const ok = (c, m) => { c ? passed++ : failed++; console.log((c ? 'ok - ' : 'FAIL - ') + m); if (!c) process.exitCode = 1; };
const LV = ['p1','p2','p3','p4','p5','p6','s1','s2','s3','s4','jc1','jc2','adult'];
const SETTINGS = ['hawker','mrt','hdb','void deck','canteen','cca','kopitiam','community centre','little india'];
const FESTIVALS = ['chinese new year','hari raya','deepavali','christmas','racial harmony','national day'];
(async () => {
  let total = 0; const mentions = Object.fromEntries(FESTIVALS.map(x => [x,0]));
  for (const lv of LV) {
    const d = JSON.parse(fs.readFileSync(`${ROOT}data/sg/${lv}.json`, 'utf8')), text = JSON.stringify(d).toLowerCase();
    const n = (d.synth || []).length + ['edit','ccloze'].reduce((a,k) => a + ((d[k] || {}).passages || []).reduce((b,p) => b+p.questions.length,0),0); total += n;
    ok(SETTINGS.some(s => text.includes(s)), `${lv}: at least one Singapore setting`);
    for (const f of FESTIVALS) mentions[f] += text.split(f).length - 1;
    for (const p of d.edit.passages) for (const q of p.questions) ok(q.answers.every(a => a.toLowerCase().replace(/[^a-z']/g,'') !== q.wrong.toLowerCase().replace(/[^a-z']/g,'')), `${p.id} #${q.n}: the wrong spelling differs from the answer`);
  }
  ok(total === 433, `Singapore track now has 433 scored questions (was 356; got ${total})`);
  for (const f of FESTIVALS) ok(mentions[f] > 0, `${f} appears (${mentions[f]} mentions)`);
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args:['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport:{width:375,height:740}, isMobile:true, hasTouch:true });
  await ctx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());
  const page = await ctx.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto(BASE+'index.html'); await page.waitForFunction(()=>window.WR&&WR.SG);
  const marked = await page.evaluate(async LV => { const bad=[];
    for (const lv of LV) { const d=await WR.bank('sg',lv);
      for (const it of d.synth) for (const a of it.answers) if (!WR.SG.mark(WR.normalize(it),a).ok) bad.push(it.id);
      for (const k of ['edit','ccloze']) for (const p of d[k].passages) for (const q of p.questions) { const n=WR.normalize(q,p); for (const a of n.answers) if(!WR.SG.mark(n,a).ok) bad.push(p.id+':'+q.n); }
    } return bad; },LV);
  ok(marked.length===0,`every answer at every level is accepted (${marked.slice(0,5)})`);
  for (const [lv,kind] of [['p2','synth'],['p5','edit'],['p6','ccloze'],['adult','synth']]) {
    await page.evaluate(([lv,k])=>WR.SG.start(lv,k),[lv,kind]); await page.waitForSelector('#sgIn');
    const input=await page.$eval('#sgIn',e=>({ac:e.getAttribute('autocorrect'),sc:e.getAttribute('spellcheck'),auto:e.getAttribute('autocomplete')}));
    ok(input.ac==='off'&&input.sc==='false'&&input.auto==='off',`${lv}/${kind}: WR.noAssist is on the typing box`);
    const text=await page.locator('#main').innerText(); ok(/[A-Za-z]/.test(text),`${lv}/${kind}: a real playable card opens`);
  }
  ok(errors.length===0,'no browser errors '+errors.slice(0,3).join(' | '));
  console.log(`\nsg-more: ${passed} passed, ${failed} failed`); await browser.close(); process.exit(failed?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
