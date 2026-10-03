const { chromium } = require('/home/abek_shek/Desktop/ren-vision-rookery/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 }
];

async function runAudit() {
  const browser = await chromium.launch({
    executablePath: '/home/abek_shek/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const auditLog = {
    consoleMessages: [],
    pageErrors: [],
    features: {}
  };

  const outDir = path.resolve(__dirname, 'screenshots/audit');

  for (const vp of viewports) {
    for (const colorScheme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: colorScheme,
        permissions: ['microphone', 'clipboard-read', 'clipboard-write']
      });

      const page = await context.newPage();

      page.on('console', msg => {
        auditLog.consoleMessages.push({
          type: msg.type(),
          text: msg.text(),
          location: msg.location(),
          vp: vp.name,
          colorScheme
        });
      });

      page.on('pageerror', err => {
        auditLog.pageErrors.push({
          message: err.message,
          stack: err.stack,
          vp: vp.name,
          colorScheme
        });
      });

      // 1. Initial Home Screen
      await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.join(outDir, `${vp.name}-${colorScheme}-1-home.png`), fullPage: true });

      // 2. Hindi & Marathi toggle test (only do once on desktop, but screenshot mobile too)
      if (vp.name === 'mobile' && colorScheme === 'light') {
        // Toggle Hindi
        await page.click('button:has-text("हिंदी")');
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(outDir, `mobile-hindi.png`), fullPage: true });

        // Toggle Marathi
        await page.click('button:has-text("मराठी")');
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(outDir, `mobile-marathi.png`), fullPage: true });

        // Back to English
        await page.click('button:has-text("English")');
        await page.waitForTimeout(300);
      }

      // 3. Test Form Interaction & Submit
      await page.fill('#complaint-text', 'Garbage dumping and blocked drainage near Sector 17 market Vashi');
      await page.screenshot({ path: path.join(outDir, `${vp.name}-${colorScheme}-2-filled.png`), fullPage: true });

      // Submit
      await page.click('button[type="submit"]');
      // Wait for result to appear
      await page.waitForSelector('article', { timeout: 10000 });
      await page.waitForTimeout(1000); // let animations settle
      await page.screenshot({ path: path.join(outDir, `${vp.name}-${colorScheme}-3-result.png`), fullPage: true });

      // 4. Test Copy Letter
      try {
        const copyBtn = await page.waitForSelector('button:has-text("Copy Letter")', { timeout: 3000 });
        if (copyBtn) {
          await copyBtn.click();
          await page.waitForTimeout(500);
          auditLog.features.copyLetter = 'Clicked Copy Letter successfully';
        }
      } catch (e) {
        auditLog.features.copyLetter = `Error: ${e.message}`;
      }

      // 5. Test Download ICS
      try {
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
          page.click('button:has-text("Add reminders to calendar")').catch(() => null)
        ]);
        auditLog.features.icsDownload = download ? 'ICS download triggered' : 'Download event not caught or client-side blob';
      } catch (e) {
        auditLog.features.icsDownload = `Error: ${e.message}`;
      }

      // 6. Test My Complaints tab
      await page.click('button:has-text("My Complaints")');
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, `${vp.name}-${colorScheme}-4-mycomplaints.png`), fullPage: true });

      // 7. Test Offline Banner & Offline behavior
      await context.setOffline(true);
      await page.click('button:has-text("New Complaint")');
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, `${vp.name}-${colorScheme}-5-offline.png`), fullPage: true });

      await context.close();
    }
  }

  await browser.close();

  fs.writeFileSync(path.resolve(__dirname, 'screenshots/audit/audit-log.json'), JSON.stringify(auditLog, null, 2));
  console.log('Audit run complete! Log saved to screenshots/audit/audit-log.json');
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
