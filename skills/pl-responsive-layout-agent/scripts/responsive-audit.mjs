import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:4200';

const viewports = [
  { name: 'mobile-360', width: 360, height: 740 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-430', width: 430, height: 932 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'tablet-landscape-1024', width: 1024, height: 768 },
  { name: 'desktop-1366', width: 1366, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1920', width: 1920, height: 1080 }
];

const browser = await chromium.launch();

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });

  await page.goto(url, { waitUntil: 'networkidle' });

  const result = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const viewportWidth = window.innerWidth;
    const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);

    const overflowingElements = [...document.querySelectorAll('*')]
      .map((el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        return {
          tag: el.tagName.toLowerCase(),
          className: typeof el.className === 'string' ? el.className : '',
          id: el.id || '',
          role: el.getAttribute('role') || '',
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          overflowX: style.overflowX,
          position: style.position
        };
      })
      .filter((item) => item.right > viewportWidth + 1 || item.left < -1)
      .slice(0, 40);

    const localScrollContainers = [...document.querySelectorAll('*')]
      .filter((el) => el.scrollWidth > el.clientWidth + 1)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        className: typeof el.className === 'string' ? el.className : '',
        id: el.id || '',
        clientWidth: el.clientWidth,
        scrollWidth: el.scrollWidth,
        overflowX: window.getComputedStyle(el).overflowX
      }))
      .slice(0, 40);

    return {
      viewportWidth,
      scrollWidth,
      hasGlobalHorizontalOverflow: scrollWidth > viewportWidth + 1,
      overflowingElements,
      localScrollContainers
    };
  });

  await page.screenshot({
    path: `responsive-${viewport.name}.png`,
    fullPage: true
  });

  console.log(`\n[${viewport.name}] ${viewport.width}x${viewport.height}`);
  console.log(JSON.stringify(result, null, 2));

  await page.close();
}

await browser.close();
