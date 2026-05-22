import { test, expect } from '@playwright/test';

test('盲盒抽奖闭环', async ({ page }) => {
  await page.goto('/mall');
  await page.waitForLoadState('networkidle');
  // 找到第一个抽奖链接（盲盒）
  const blindboxLink = page.locator('a[href*="/mall/blindbox/"]').first();
  await blindboxLink.click();
  await page.waitForSelector('canvas', { timeout: 8000 });
});
