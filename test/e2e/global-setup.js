import { chromium, expect } from '@playwright/test';

const filePath = './LoginAuth.json';
const baseUrl = 'https://author-p133911-e1313554.adobeaemcloud.com/aem/start.html';
const emailId = process.env.AEM_userName;
const password = process.env.AEM_password;

const selectors = {
  iFrame: 'iframe[id*="exc-app-sandbox"]',
  createAnAccount: 'a[class="spectrum-Link EmailPage__create-account-link"]',
  signInWithAdobe: 'text=Sign in with Adobe',
  emailInput: 'input[type="email"]',
  passwordInput: 'input[type="password"]',
  userDisplayName: 'div#userDisplayName',
  firstExtButtonItem: 'div[class*="ext-button-item"]:first-child',
};

async function globalSetup() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ recordVideo: { dir: './videos/' } });
  const page = await context.newPage();
  try {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.locator(selectors.signInWithAdobe).click();
    await expect(page.locator(selectors.createAnAccount)).toBeVisible();
    await page.locator(selectors.googleSignIn).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Forgot email?')).toBeVisible({ timeout: 15000 });
    await page.locator(selectors.emailInput).fill(emailId);
    await page.locator(selectors.emailInput).blur();
    await page.locator(selectors.nextButton).click();
    await expect(page.locator(selectors.forgotPassword)).toBeVisible({ timeout: 20000 });
    expect(await page.locator('div[data-email][data-profile-identifier]').innerText()).toBe(emailId);
    await page.getByLabel('Enter your password').fill(password);
    await page.getByLabel('Enter your password').blur();
    await page.locator(selectors.nextButton).click();
    await page.waitForURL('https://author-p133911-e1313554.adobeaemcloud.com/ui#/aem/aem/start.html', { timeout: 30000 });
    await page.waitForLoadState('load');
    await page.waitForURL('https://author-p133911-e1313554.adobeaemcloud.com/ui#/aem/aem/start.html?appId=aemshell');
    const frame = page.frameLocator(selectors.iFrame);
    await expect(frame.getByLabel('Navigation')).toBeVisible();
    await page.context().storageState({ path: filePath });
  } catch (error) {
    await page.screenshot({ path: './error-screenshot.png' });
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
