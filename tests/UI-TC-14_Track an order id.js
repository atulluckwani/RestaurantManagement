const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    ...(process.env.CI === 'true' ? {} : { channel: 'msedge' }),
  });

  const page = await browser.newPage();
  const orderId = '90479';

  try {
    // Open menu page and verify it is loaded.
    await page.goto('http://localhost:3000/menu.html', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    if (!page.url().includes('/menu.html')) {
      throw new Error(`Expected menu page to load, but got: ${page.url()}`);
    }

    // Navigate to My Orders and verify page load.
    await page.getByRole('link', { name: 'My Orders' }).click();
    await page.waitForURL('**/orders.html');

    if (!page.url().includes('/orders.html')) {
      throw new Error(`Expected orders page, but got: ${page.url()}`);
    }

    // Enter order id and track it.
    const orderIdInput = page.getByRole('textbox', { name: 'Enter 5-digit order id' });
    await orderIdInput.fill(orderId);
    await page.getByRole('button', { name: 'Track' }).click();

    // Verify tracked order details.
    const detailsPanel = page.locator('#trackingResult');
    await detailsPanel.waitFor({ state: 'visible', timeout: 10000 });

    const detailsText = (await detailsPanel.innerText()).replace(/\s+/g, ' ').trim();

    if (!detailsText.includes(`Order: ${orderId}`)) {
      throw new Error(`Order value mismatch. Expected: ${orderId}. Actual content: ${detailsText}`);
    }

    if (!detailsText.includes('Status: Delivered')) {
      throw new Error(`Expected status Delivered. Actual content: ${detailsText}`);
    }

    const totalMatch = detailsText.match(/Total:\s*Rs\s*\d+/i);
    if (!totalMatch) {
      throw new Error(`Expected total format 'Rs <number>'. Actual content: ${detailsText}`);
    }

    const addressMatch = detailsText.match(/Address:\s*(.+?)(?:$|Order:|Status:|Total:)/i);
    if (!addressMatch || !addressMatch[1] || !addressMatch[1].trim()) {
      throw new Error(`Address is blank. Actual content: ${detailsText}`);
    }

    console.log('UI-TC-14 passed: order tracking details are valid.');
    console.log(`Order: ${orderId}`);
    console.log('Status: Delivered');
    console.log(`Total format: ${totalMatch[0]}`);
    console.log(`Address: ${addressMatch[1].trim()}`);

    // Take full page screenshot.
    const screenshotDir = process.env.SCREENSHOT_DIR || '.';
    const timestamp = process.env.SCREENSHOT_TIMESTAMP || String(Date.now());
    const screenshotPath = path.join(screenshotDir, `UI-TC-14_track_order_${timestamp}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved at ${screenshotPath}`);
  } catch (error) {
    console.error('UI-TC-14 failed:', error.message || error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
