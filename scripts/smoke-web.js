// Headless smoke test: load the running web app in Edge and report any
// browser-side runtime errors (e.g. the tslib interop crash).
const puppeteer = require('puppeteer-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URLS = [
  'http://localhost:8081/',
  'http://localhost:8081/background-remover',
  'http://localhost:8081/cover-page',
  'http://localhost:8081/images-to-pdf',
  'http://localhost:8081/image-converter',
  'http://localhost:8081/data-checker',
  'http://localhost:8081/feedback',
  'http://localhost:8081/pdf-tools',
  'http://localhost:8081/pdf-tools/merge-pdf',
  'http://localhost:8081/pdf-tools/text-to-pdf',
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });

  let hadError = false;
  for (const url of URLS) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push('console.error: ' + m.text());
    });
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });
    } catch (e) {
      errors.push('goto failed: ' + e.message);
    }
    await new Promise((r) => setTimeout(r, 2500));
    const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 120)).catch(() => '');
    const filtered = errors.filter(
      (e) => !/favicon|Download the React DevTools|shadow\*|sourcemap/i.test(e)
    );
    const ok = filtered.length === 0 && bodyText.trim().length > 0;
    if (!ok) hadError = true;
    console.log(`\n${ok ? 'PASS' : 'FAIL'}  ${url}`);
    console.log('  rendered: ' + JSON.stringify(bodyText.replace(/\n/g, ' ').trim()));
    filtered.forEach((e) => console.log('  ERR ' + e));
    await page.close();
  }

  await browser.close();
  console.log('\n==== ' + (hadError ? 'SOME PAGES FAILED' : 'ALL PAGES OK') + ' ====');
  process.exit(hadError ? 1 : 0);
})();
