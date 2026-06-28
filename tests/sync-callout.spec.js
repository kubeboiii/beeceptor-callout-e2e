const { test, expect } = require('@playwright/test');
const { CalloutRulePage } = require('../pages/callout-rule.page');
const {
  triggerUrl,
  calloutTargetUrl,
  primaryEndpoint,
} = require('../lib/config');

test.describe('HTTP Callout sync E2E', () => {
  test('ensures sync callout rule, triggers API, verifies forwarded response', async ({
    page,
    request,
  }) => {
    const calloutPage = new CalloutRulePage(page);

    await calloutPage.ensureSyncCalloutRule();

    const response = await request.post(triggerUrl, {
      timeout: 60_000,
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.url).toBe(calloutTargetUrl);
    expect(body.headers['x-forwarded-host']).toBe(
      `${primaryEndpoint}.free.beeceptor.com`,
    );
  });
});
