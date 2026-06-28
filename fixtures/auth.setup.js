const { test: setup } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const authDir = path.join(__dirname, '../playwright/.auth');
const authFile = path.join(authDir, 'user.json');

setup('verify saved auth session', async () => {
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  if (fs.existsSync(authFile)) {
    return;
  }

  throw new Error(
    [
      'Missing playwright/.auth/user.json',
      '',
      'Google blocks OAuth in Playwright-controlled browsers.',
      'Use normal Chrome + save session (recommended):',
      '',
      '  Terminal 1:  npm run auth:chrome',
      '  (Sign in with Google in that Chrome window)',
      '  Terminal 2:  npm run auth:save',
      '',
      'Alternative:  npm run auth:persistent',
      '',
      'Then run: npm test',
    ].join('\n'),
  );
});
