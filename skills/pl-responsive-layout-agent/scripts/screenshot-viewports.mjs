import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:4200';
const outputDir = process.argv[3] || '.';

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
  await page.screenshot({ path: `${outputDir}/responsive-${viewport.name}.png`, fullPage: true });
  console.log(`Created ${outputDir}/responsive-${viewport.name}.png`);
  await page.close();
}

await browser.close();
