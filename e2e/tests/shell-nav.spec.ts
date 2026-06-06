import { expect, test } from '@playwright/test';

// 外壳导航测试：只在「活动 / 我的」两个无 API 的占位页之间切换，
// 因此不依赖后端 JWT 校验，chromium(桌面侧边栏) 与 mobile(底部 Tab) 两个 project 均稳定。
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cpm_jwt', 'e2e-token');
    localStorage.setItem('cpm_uid', '1');
    localStorage.setItem('cpm_tid', '1');
    localStorage.setItem('cpm_name', 'E2E');
  });
});

test('Tab 在响应式外壳内切换路由', async ({ page }, testInfo) => {
  await page.goto('/me');
  await expect(page.getByRole('heading', { name: '我的' })).toBeVisible();

  // 存档截图：shell-chromium.png(桌面侧边栏) / shell-mobile.png(移动底部 Tab)
  await page.screenshot({ path: `/tmp/shell-${testInfo.project.name}.png` });

  await page.getByRole('button', { name: '活动' }).click();
  await expect(page).toHaveURL(/\/activities/);
  await expect(page.getByRole('heading', { name: '活动' })).toBeVisible();
});
