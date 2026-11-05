// BRIEF-T9: a passed Learn lesson is due for a quick recall on day 1, then day 7.
const { chromium } = require('playwright-core');
const BASE = (process.env.BASE || 'http://127.0.0.1:18642/').replace(/\/?$/, '/');
const DAY = 864e5;
let fails = 0, passes = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); process.exitCode = 1; } else { passes++; console.log('ok', m); } };

const HELPERS = () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const tap = el => { if (!el) throw new Error('nothing to tap'); el.click(); };
  window.__solve = async () => {
    const S = WR.Learn._S(), w = S.step === 'discover' ? S.L.discover : S.L.reteach.discover, root = $('#lnW');
    if (w.kind === 'fill') for (const it of w.items) tap(root.querySelector(`[data-t="${it.a}"]`));
    if (w.kind === 'sort') for (const c of $$('#lnW .lw-pool [data-src]')) { tap(c); tap(root.querySelector(`[data-b="${w.items[+c.dataset.k].bin}"]`)); }
    if (w.kind === 'suffix') w.items.forEach((it, k) => { if (it.need) tap(root.querySelector(`.lw-word[data-k="${k}"]`)); });
    return true;
  };
  window.__answer = async (pattern = [true, true, true]) => {
    let n = 0;
    for (const right of pattern) {
      const S = WR.Learn._S(), q = S.q, want = q.options[q.answer];
      const b = $$('.ln-opts .opt').find(x => (S.opts[+x.dataset.k] === want) === !!right);
      tap(b); await sleep(40); tap($('#lnNext')); await sleep(40); if (right) n++;
    }
    return n;
  };
  window.__playTeach = async id => {
    await WR.Learn.open(id, { recall: false }); await sleep(40);
    tap($('#lnGo')); await __solve(); tap($('#lnGo')); await sleep(20); tap($('#lnGo'));
    await __answer([true, true, true]);
    return WR.Learn.rec(id);
  };
};

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 360, height: 740 } });
  await page.addInitScript(HELPERS);
  await page.goto(BASE + '?e2e=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => window.WR && WR.Learn && WR.Learn.all && WR.Learn.all().length, null, { timeout: 60000 });
  await page.evaluate(() => { localStorage.clear(); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.WR && WR.Learn && WR.Learn.all().length, null, { timeout: 60000 });
  await page.evaluate(() => { WR.state.settings = Object.assign({}, WR.state.settings, { sound: false, narrate: false }); });

  const id = 'en.a1.an';
  ok(await page.evaluate(() => Array.isArray(WR.Learn.RECALL.gaps) && WR.Learn.RECALL.gaps[0] === 1 && WR.Learn.RECALL.gaps[1] === 7), 'LN.RECALL.gaps is [1, 7]');

  const t0 = await page.evaluate(async id => {
    const now = Date.now();
    const rec = await window.__playTeach(id);
    return { pass: !!(rec && rec.pass), s: rec && rec.s, d: rec && rec.d, now, gaps0: WR.Learn.RECALL.gaps[0], due: WR.Learn.isDue(id) };
  }, id);
  ok(t0.pass && t0.s === 0 && t0.d > t0.now, `teach pass schedules day-1 (s=${t0.s}, d-now=${t0.d - t0.now})`);
  ok(Math.abs((t0.d - t0.now) - DAY * t0.gaps0) < 8000, `day-1 gap ≈ ${t0.gaps0}d (got ${((t0.d - t0.now) / DAY).toFixed(3)}d)`);
  ok(!t0.due, 'not due immediately after pass');

  const day1 = await page.evaluate(async id => {
    const r = WR.Learn.rec(id); const dueAt = r.d;
    const isDue = WR.Learn.isDue(id, dueAt + 1000);
    r.d = Date.now() - 1000; WR.save();
    await WR.Learn.open(id);
    await new Promise(r => setTimeout(r, 50));
    const S = WR.Learn._S();
    const qnum = document.querySelector('.ln-qnum') && document.querySelector('.ln-qnum').textContent;
    return { isDue, recall: !!(S && S.recall), step: S && S.step, qnum };
  }, id);
  ok(day1.isDue, 'isDue true once day-1 arrives');
  ok(day1.recall && day1.step === 'check', `due open starts recall at check (recall=${day1.recall}, step=${day1.step})`);
  ok(/Recall|day 1/i.test(day1.qnum || ''), `recall banner (${day1.qnum})`);

  const after1 = await page.evaluate(async id => {
    await window.__answer([true, true, true]);
    const r = WR.Learn.rec(id), now = Date.now();
    const head = document.querySelector('.ln-done h1') && document.querySelector('.ln-done h1').textContent;
    return { s: r.s, days: (r.d - now) / 864e5, due: WR.Learn.isDue(id), head };
  }, id);
  ok(after1.s === 1 && after1.days > 6.5 && after1.days < 7.5, `day-1 right → s=1 ~7d (s=${after1.s}, ${after1.days.toFixed(2)}d)`);
  ok(/Still with you/i.test(after1.head || ''), `recall pass copy (${after1.head})`);
  ok(!after1.due, 'not due right after day-1 recall');

  const day7 = await page.evaluate(async id => {
    const r = WR.Learn.rec(id); r.d = Date.now() - 1000; WR.save();
    await WR.Learn.open(id); await new Promise(r => setTimeout(r, 50));
    const S = WR.Learn._S();
    const qnum = document.querySelector('.ln-qnum') && document.querySelector('.ln-qnum').textContent;
    await window.__answer([true, true, true]);
    const r2 = WR.Learn.rec(id), now = Date.now();
    return { recall: S.recall, qnum, s: r2.s, days: (r2.d - now) / 864e5, rest: WR.Learn.RECALL.rest };
  }, id);
  ok(day7.recall && /day 7/i.test(day7.qnum || ''), `day-7 banner (${day7.qnum})`);
  ok(day7.s === 2 && Math.abs(day7.days - day7.rest) < 0.6, `day-7 right → s=2 rest ${day7.rest}d (s=${day7.s}, ${day7.days.toFixed(2)}d)`);

  const miss = await page.evaluate(async id => {
    const r = WR.Learn.rec(id); r.d = Date.now() - 1000; r.s = 0; WR.save();
    await WR.Learn.open(id); await new Promise(r => setTimeout(r, 50));
    await window.__answer([false, false, false]);
    const r2 = WR.Learn.rec(id), now = Date.now();
    const head = document.querySelector('.ln-done h1') && document.querySelector('.ln-done h1').textContent;
    return { s: r2.s, days: (r2.d - now) / 864e5, head };
  }, id);
  ok(miss.s === 0 && miss.days > 0.85 && miss.days < 1.15, `miss → s=0 ~1d (s=${miss.s}, ${miss.days.toFixed(2)}d)`);
  ok(/soon/i.test(miss.head || ''), `miss copy (${miss.head})`);

  const chip = await page.evaluate(id => {
    const r = WR.Learn.rec(id); r.d = Date.now() - 1000; WR.save();
    return { html: WR.Learn.chipHTML([WR.Learn.get(id)]), due: WR.Learn.isDue(id) };
  }, id);
  ok(chip.due && /🔁/.test(chip.html) && /due/.test(chip.html), 'chip shows 🔁 due badge');

  for (const w of [320, 360, 375]) {
    await page.setViewportSize({ width: w, height: 640 });
    await page.evaluate(async id => { WR.Learn.rec(id).d = Date.now() - 1000; WR.save(); await WR.Learn.open(id); }, id);
    await page.waitForTimeout(100);
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    ok(!scroll, `no sideways scroll at ${w} on recall`);
    await page.screenshot({ path: `/workspace/cefr-quest/screenshots/t9_recall_${w}.png`, fullPage: true });
  }

  console.log(`learn-review: ${passes} passed, ${fails} failed`);
  await browser.close();
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
