import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:4200';
const width = Number(process.argv[3] || 390);
const height = Number(process.argv[4] || 844);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });
await page.goto(url, { waitUntil: 'networkidle' });

const result = await page.evaluate(() => {
  const viewportWidth = window.innerWidth;
  const doc = document.documentElement;
  const body = document.body;

  return {
    viewportWidth,
    documentScrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
    hasGlobalOverflow: Math.max(doc.scrollWidth, body.scrollWidth) > viewportWidth + 1,
    offenders: [...document.querySelectorAll('*')]
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          id: el.id || '',
          className: typeof el.className === 'string' ? el.className : '',
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        };
      })
      .filter((x) => x.right > viewportWidth + 1 || x.left < -1)
      .slice(0, 50)
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
