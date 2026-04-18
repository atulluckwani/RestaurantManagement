const { chromium } = require('playwright');

(async () => {
  // Step 1: Open URL in Edge (non-headless) and verify page is loaded.
  const browser = await chromium.launch({ headless: false, channel: 'msedge' });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3000/menu.html', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    if (!currentUrl.includes('/menu.html')) {
      throw new Error(`Step 1 failed: unexpected URL after load: ${currentUrl}`);
    }

    const menuHeading = page.locator('h2', { hasText: 'Menu' });
    await menuHeading.waitFor({ state: 'visible', timeout: 10000 });
    console.log('Step 1 passed: menu page loaded successfully.');

    // Capture URL before click to verify no unintended navigation.
    const urlBeforeClick = page.url();

    // Step 2: Click a random Add to cart button and verify stability, then wait 5 seconds.
    const addToCartButtons = page.getByRole('button', { name: 'Add to cart' });
    const buttonCount = await addToCartButtons.count();

    if (buttonCount === 0) {
      throw new Error('Step 2 failed: no Add to cart buttons found.');
    }

    const randomIndex = Math.floor(Math.random() * buttonCount);

    const itemRow = page.locator('.menu-item').nth(randomIndex);
    const itemName = (await itemRow.locator('strong').innerText()).trim();

    const messageArea = page.locator('.message-area p');
    const previousMessage = ((await messageArea.textContent()) || '').trim();

    await addToCartButtons.nth(randomIndex).click();

    const urlAfterClick = page.url();
    if (urlAfterClick !== urlBeforeClick) {
      throw new Error(
        `Step 2 failed: unintended navigation detected. Before: ${urlBeforeClick}, After: ${urlAfterClick}`
      );
    }

    await page.waitForTimeout(5000);
    console.log(`Step 2 passed: clicked Add to cart for ${itemName}; no crash or navigation.`);

    // Step 3: Verify success message indicates item was added, then wait 5 seconds.
    await page.waitForFunction(
      ({ selector, oldText }) => {
        const el = document.querySelector(selector);
        const text = el?.textContent?.trim() || '';
        return text.length > 0 && text !== oldText;
      },
      { selector: '.message-area p', oldText: previousMessage },
      { timeout: 10000 }
    );

    const successMessage = ((await messageArea.textContent()) || '').trim();
    const hasAddedText = /added to cart/i.test(successMessage);

    if (!hasAddedText) {
      throw new Error(
        `Step 3 failed: success message does not indicate item added. Message: "${successMessage}"`
      );
    }

    if (!successMessage.toLowerCase().includes(itemName.toLowerCase())) {
      throw new Error(
        `Step 3 failed: success message does not include clicked item name. Item: "${itemName}", Message: "${successMessage}"`
      );
    }

    await page.waitForTimeout(5000);
    console.log(`Step 3 passed: success message verified -> ${successMessage}`);

    // Step 4: Take full page screenshot.
    const screenshotPath = 'tests/UI-TC-04_full_page.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Step 4 passed: full-page screenshot saved at ${screenshotPath}`);

    console.log('UI-TC-04 completed successfully.');
  } catch (error) {
    console.error('UI-TC-04 failed:', error.message || error);
    process.exitCode = 1;
  } finally {
    // Step 5: Close the browser.
    await browser.close();
    console.log('Step 5 passed: browser closed.');
  }
})();
