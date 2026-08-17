const puppeteer = require('puppeteer');
const { exec } = require('child_process');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/')) {
      if (request.method() === 'OPTIONS') {
        request.respond({
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*"
          },
          status: 200
        });
      } else if (url.includes('/api/accounting/accounts/123')) {
        request.respond({
          contentType: 'application/json',
          headers: {"Access-Control-Allow-Origin": "*"},
          body: JSON.stringify({
            id: '123',
            code: 'RENDER-CUSTOMER-CONTROL',
            nameArabic: 'حساب ضبط العملاء',
            nameEnglish: null,
            accountType: 'Asset',
            accountTypeLabel: 'أصول',
            normalBalance: 'Debit',
            normalBalanceLabel: 'مدين',
            parentId: null,
            isPosting: true,
            isActive: true,
            isSystem: true,
            cashFlowActivityType: 'Unclassified',
            cashFlowActivityTypeLabel: 'غير مصنف',
            description: null,
            rowVersion: 'AAAAAAAAB9M='
          })
        });
      } else if (url.includes('/api/auth/me')) {
        request.respond({
          contentType: 'application/json',
          headers: {"Access-Control-Allow-Origin": "*"},
          body: JSON.stringify({ id: 1, name: 'Test', role: 'Admin' })
        });
      } else {
        request.respond({
          contentType: 'application/json',
          headers: {"Access-Control-Allow-Origin": "*"},
          body: JSON.stringify({ items: [], totalCount: 0 })
        });
      }
    } else {
      request.continue();
    }
  });

  const server = exec('corepack yarn start --port 5174');
  await new Promise(resolve => setTimeout(resolve, 8000));

  await page.goto('http://localhost:5174/accounting/chart-of-accounts/123/edit');
  await page.waitForSelector('button[type="submit"]', { timeout: 15000 });
  await page.click('button[type="submit"]');
  await new Promise(resolve => setTimeout(resolve, 1000));

  const errors = await page.evaluate(() => document.getElementById('debug-errors')?.textContent);
  const values = await page.evaluate(() => document.getElementById('debug-values')?.textContent);
  
  console.log('ERRORS:', errors);
  console.log('VALUES:', values);

  await browser.close();
  server.kill();
  process.exit(0);
})();
