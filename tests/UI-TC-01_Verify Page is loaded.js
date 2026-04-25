const { chromium } = require('playwright');
const path = require('path');

(async () => {
  // Launch Edge browser in non-headless mode
  const browser = await chromium.launch({
    headless: false,
    ...(process.env.CI === 'true' ? {} : { channel: 'msedge' }),
  });
  const page = await browser.newPage();

  try {
    // Navigate to the URL
    await page.goto('http://localhost:3000/menu.html', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    if (!page.url().includes('/menu.html')) {
      throw new Error(`Unexpected URL after load: ${page.url()}`);
    }

    // Verify page is loaded
    const isLoaded = await page.evaluate(() => document.readyState === 'complete');
    if (!isLoaded) {
      throw new Error('Page did not reach complete readyState.');
    }
    console.log('Page loaded:', isLoaded);

    // Take screenshot
    const screenshotDir = process.env.SCREENSHOT_DIR || '.';
    const timestamp = process.env.SCREENSHOT_TIMESTAMP || String(Date.now());
    const screenshotPath = path.join(
      screenshotDir,
      `UI-TC-01_menu_screenshot_${timestamp}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved at ${screenshotPath}`);

    console.log('UI-TC-01 completed successfully.');
  } catch (error) {
    console.error('UI-TC-01 failed:', error.message || error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();