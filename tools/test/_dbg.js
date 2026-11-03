const { chromium } = require('playwright-core');
(async () => { const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const p = await (await b.newContext()).newPage();
  p.on('requestfailed', r => console.log('fail', r.method(), r.url(), r.failure().errorText));
  p.on('requestfinished', r => { if (r.method() === 'HEAD') console.log('fin HEAD'); });
  await p.goto(process.argv[2] || 'http://127.0.0.1:18642/index.html', { waitUntil: 'networkidle' });
  console.log(await p.evaluate(() => WR.serverDay && WR.serverDay()));
  await b.close(); })();
