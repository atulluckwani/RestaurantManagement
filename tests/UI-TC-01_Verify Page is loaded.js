const { chromium } = require('playwright');

(async () => {
  // Launch Edge browser in non-headless mode
  const browser = await chromium.launch({ headless: false, channel: 'msedge' });
  const page = await browser.newPage();

  // Navigate to the URL
  await page.goto('http://localhost:3000/menu.html');

  // Verify page is loaded
  const isLoaded = await page.evaluate(() => document.readyState === 'complete');
  console.log('Page loaded:', isLoaded);

  // Take screenshot
  await page.screenshot({ path: 'menu_screenshot.png' });

  // Close the browser
  await browser.close();
})();