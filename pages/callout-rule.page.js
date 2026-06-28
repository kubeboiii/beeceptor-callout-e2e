const { expect } = require('@playwright/test');
const { consoleUrl, calloutTargetUrl, triggerPath } = require('../lib/config');

const RULE_DESCRIPTION = 'Playwright sync callout test';

class CalloutRulePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  async gotoEndpointConsole() {
    await this.page.goto(consoleUrl, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.dismissCookieBanner();
  }

  rulesModal() {
    return this.page
      .locator('.modal.allRules.show')
      .filter({ has: this.page.getByRole('heading', { name: 'Mock Rules' }) });
  }

  async openMockRules() {
    await this.gotoEndpointConsole();
    await this.dismissGetStartedPanel();

    await this.page
      .locator('a[data-bs-toggle="modal"]')
      .filter({ hasText: /Mock Rules \(\d+\)/i })
      .click();

    await expect(this.rulesModal()).toBeVisible({ timeout: 15_000 });
  }

  async ensureSyncCalloutRule() {
    await this.openMockRules();
    const modal = this.rulesModal();

    if ((await this.countVisibleRulesForPath(modal, triggerPath)) > 0) {
      return;
    }

    await this.createSyncCalloutRuleInModal(modal);
  }

  async createSyncCalloutRule() {
    await this.openMockRules();
    await this.createSyncCalloutRuleInModal(this.rulesModal());
  }

  async createSyncCalloutRuleInModal(modal) {
    if (await modal.getByText(/upgrade now to create more rules/i).isVisible().catch(() => false)) {
      throw new Error(
        'Cannot create callout rule: endpoint is at the free plan rule limit. Delete existing rules manually in Beeceptor.',
      );
    }

    await this.startCalloutRuleForm(modal);

    const form = modal;
    await expect(
      form.getByRole('heading', { name: /when following condition is matched/i }),
    ).toBeVisible({ timeout: 15_000 });

    await form.locator('select:visible').nth(0).selectOption('POST');
    await form.locator('input[placeholder="e.g. /api/path"]:visible').fill(triggerPath);
    await form
      .locator('select:visible')
      .nth(2)
      .selectOption({ label: 'Wait for target response (synchronous)' });
    await form.locator('select:visible').nth(3).selectOption('POST');
    await form
      .locator('input[placeholder="https://your-webhook-endpoint.com"]:visible')
      .fill(calloutTargetUrl);
    await form.locator('input[placeholder="Description"]:visible').fill(RULE_DESCRIPTION);

    await form.getByRole('button', { name: /save/i }).click();

    await expect(
      form.locator('code').filter({ hasText: new RegExp(`^${escapeRegex(triggerPath)}$`) }).first(),
    ).toBeVisible({
      timeout: 20_000,
    });
  }

  async countVisibleRulesForPath(modal, path) {
    return modal.evaluate((root, rulePath) => {
      return [...root.querySelectorAll('code')].filter(
        (element) =>
          element.textContent?.trim() === rulePath && element.getBoundingClientRect().width > 0,
      ).length;
    }, path);
  }

  async startCalloutRuleForm(modal = this.rulesModal()) {

    const createFormHeading = modal.getByRole('heading', {
      name: /when following condition is matched/i,
    });
    if (await createFormHeading.isVisible().catch(() => false)) {
      return;
    }

    await this.dismissStandardMockRuleForm(modal);

    await modal.getByRole('button', { name: /toggle dropdown/i }).click();
    await modal.getByRole('link', { name: /new callout rule/i }).click();

    await expect(createFormHeading).toBeVisible({ timeout: 10_000 });
  }

  async dismissStandardMockRuleForm(modal) {
    const standardResponseSection = modal.getByRole('heading', {
      name: /do the following \(for response\)/i,
    });

    if (!(await standardResponseSection.isVisible().catch(() => false))) {
      return;
    }

    await modal.getByRole('button', { name: /^cancel$/i }).first().click();
  }

  async dismissCookieBanner() {
    const accept = this.page.getByRole('button', { name: /^accept$/i });
    if (await accept.isVisible().catch(() => false)) {
      await accept.click();
    }
  }

  async dismissGetStartedPanel() {
    await this.page
      .evaluate(() => {
        if (typeof window.skipOnboarding === 'function') {
          window.skipOnboarding();
          return true;
        }

        const skipButton = document.querySelector(
          'button.skip-button, button[onclick*="skipOnboarding"]',
        );
        if (skipButton instanceof HTMLElement) {
          skipButton.click();
          return true;
        }

        return false;
      })
      .catch(() => false);
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { CalloutRulePage, RULE_DESCRIPTION };
