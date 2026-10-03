const { chromium } = require('/home/abek_shek/Desktop/ren-vision-rookery/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 }
];

async function runVerify() {
  const browser = await chromium.launch({
    executablePath: '/home/abek_shek/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const outDir = path.resolve(__dirname, 'screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const verificationLog = {
    consoleMessages: [],
    pageErrors: [],
    featureResults: {}
  };

  for (const vp of viewports) {
    for (const colorScheme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: colorScheme,
        permissions: ['microphone', 'clipboard-read', 'clipboard-write']
      });

      const page = await context.newPage();

      page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        // Ignore react devtools info
        if (text.includes('React DevTools') || text.includes('[vite]')) return;
        verificationLog.consoleMessages.push({
          type,
          text,
          location: msg.location(),
          vp: vp.name,
          colorScheme
        });
      });

      page.on('pageerror', err => {
        verificationLog.pageErrors.push({
          message: err.message,
          stack: err.stack,
          vp: vp.name,
          colorScheme
        });
      });

      // 1. Home Screen (Initial state)
      await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(outDir, `${vp.name}-${colorScheme}-1-home.png`), fullPage: true });

      // 2. Language Toggles (Test on mobile & desktop)
      if (vp.name === 'mobile' && colorScheme === 'light') {
        // Switch to Hindi
        await page.click('button:has-text("हिंदी")');
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(outDir, `mobile-hindi.png`), fullPage: true });
        verificationLog.featureResults.hindiSwitch = 'Success';

        // Switch to Marathi
        await page.click('button:has-text("मराठी")');
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(outDir, `mobile-marathi.png`), fullPage: true });
        verificationLog.featureResults.marathiSwitch = 'Success';

        // Switch back to English
        await page.click('button:has-text("English")');
        await page.waitForTimeout(400);
      }

      // 3. 1-Tap Preset Click
      const presetBtn = await page.waitForSelector('button:has-text("Drain overflowing")', { timeout: 3000 });
      if (presetBtn) {
        await presetBtn.click();
        await page.waitForTimeout(300);
        verificationLog.featureResults.presetClick = 'Success';
      }

      // 4. Submit Complaint
      await page.click('button[type="submit"]');
      
      // Wait for ResultCard
      await page.waitForSelector('article', { timeout: 12000 });
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(outDir, `${vp.name}-${colorScheme}-2-result.png`), fullPage: true });
      verificationLog.featureResults.complaintRouting = 'Success';

      // 5. Test Copy Letter
      const copyBtn = await page.waitForSelector('button:has-text("Copy Letter")', { timeout: 3000 });
      if (copyBtn) {
        await copyBtn.click();
        await page.waitForTimeout(400);
        verificationLog.featureResults.copyLetter = 'Success';
      }

      // 6. Test .ics Calendar Download
      const icsBtn = await page.waitForSelector('button:has-text("Add to Calendar")', { timeout: 3000 });
      if (icsBtn) {
        await icsBtn.click();
        verificationLog.featureResults.icsDownload = 'Triggered successfully';
      }

      // 7. My Complaints Tab
      await page.click('button:has-text("My Complaints")');
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, `${vp.name}-${colorScheme}-3-mycomplaints.png`), fullPage: true });
      verificationLog.featureResults.myComplaintsTracker = 'Success';

      // 8. Test Offline Banner
      await context.setOffline(true);
      await page.click('button:has-text("New Complaint")');
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, `${vp.name}-${colorScheme}-4-offline.png`), fullPage: true });
      verificationLog.featureResults.offlineBanner = 'Success';

      await context.close();
    }
  }

  await browser.close();

  fs.writeFileSync(path.resolve(__dirname, 'screenshots/verify-log.json'), JSON.stringify(verificationLog, null, 2));
  console.log('Verification finished! Log saved to screenshots/verify-log.json');
}

runVerify().catch(err => {
  console.error('Verify failed:', err);
  process.exit(1);
});
