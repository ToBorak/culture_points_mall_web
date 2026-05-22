import { test, expect } from '@playwright/test';

test('文化护照页面雷达图 + 切换 Tab', async ({ page }) => {
  await page.goto('/passport');
  await page.waitForSelector('canvas, svg', { timeout: 8000 });
  await page.getByRole('button', { name: '徽章墙' }).click();
  await expect(page.locator('img').first()).toBeVisible();
  await page.getByRole('button', { name: '积分流水' }).click();
});
