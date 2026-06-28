const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const authDir = path.join(__dirname, '../playwright/.auth');
const authFile = path.join(authDir, 'user.json');
const cdpUrl = process.env.CHROME_CDP_URL || 'http://127.0.0.1:9222';

async function main() {
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  let browser;
  try {
    browser = await chromium.connectOverCDP(cdpUrl);
  } catch {
    console.error(
      [
        `Could not connect to Chrome at ${cdpUrl}.`,
        '',
        'Start Chrome first (keep that window open):',
        '  npm run auth:chrome',
        '',
        'Sign in to Beeceptor in that window, then run:',
        '  npm run auth:save',
      ].join('\n'),
    );
    process.exit(1);
  }

  const context = browser.contexts()[0];
  if (!context) {
    console.error('No browser context found. Is Chrome still running?');
    process.exit(1);
  }

  const pages = context.pages();
  const beeceptorPage = pages.find((page) => page.url().includes('beeceptor.com'));

  if (!beeceptorPage) {
    console.warn(
      'No Beeceptor tab found. Open https://app.beeceptor.com and sign in, then run auth:save again.',
    );
  } else if (beeceptorPage.url().includes('/login')) {
    console.warn('Beeceptor tab is still on login. Finish sign-in, then run auth:save again.');
  }

  await context.storageState({ path: authFile });
  await browser.close();

  console.log(`Saved session to ${authFile}`);
  console.log('Run: npm test');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
