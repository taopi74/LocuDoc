// Capture screenshots of key routes for visual review.
const puppeteer = require('puppeteer-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const shots = [
  { route: '/data-checker', name: 'data-wide', w: 1280, h: 900 },
  { route: '/image-converter', name: 'imgconv-wide', w: 1280, h: 900 },
  { route: '/background-remover', name: 'bg-wide', w: 1280, h: 900 },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--force-color-profile=srgb'],
  });
  for (const s of shots) {
    const page = await browser.newPage();
    await page.setViewport({ width: s.w, height: s.h, deviceScaleFactor: 1.5 });
    await page.goto('http://localhost:8081' + s.route, { waitUntil: 'networkidle0', timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2800));
    await page.screenshot({ path: `scripts/_shot-${s.name}.png` });
    console.log('shot: ' + s.name);
    await page.close();
  }
  await browser.close();
  console.log('done');
})();
