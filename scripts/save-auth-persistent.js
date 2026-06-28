const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { consoleUrl } = require('../lib/config');

const authDir = path.join(__dirname, '../playwright/.auth');
const authFile = path.join(authDir, 'user.json');
const userDataDir = path.join(__dirname, '../playwright/.user-data');

async function main() {
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  console.log('Opening Chrome with a persistent profile...');
  console.log('If Google still blocks sign-in, use: npm run auth:chrome && npm run auth:save');
  console.log('');

  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: 'chrome',
    headless: false,
    viewport: { width: 1440, height: 900 },
    ignoreDefaultArgs: ['--enable-automation'],
  });

  const page = context.pages()[0] ?? (await context.newPage());
  await page.goto('https://app.beeceptor.com/login', { waitUntil: 'domcontentloaded' });

  console.log('Sign in manually, then wait until you reach the Beeceptor console.');
  console.log(`Target URL contains: ${consoleUrl}`);
  console.log('');

  await page.waitForURL(/app\.beeceptor\.com\/console\//, { timeout: 600_000 });
  await context.storageState({ path: authFile });
  await context.close();

  console.log(`Saved session to ${authFile}`);
  console.log('Run: npm test');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
