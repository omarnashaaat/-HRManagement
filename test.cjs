const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, 2000));
  
  // Try to login
  await page.type('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));
  
  // Click on some tabs
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    try {
      await btn.click();
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {}
  }
  
  await browser.close();
})();
