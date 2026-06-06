import { expect, test } from '@playwright/test';

// 不注入 token：走 dev mock 登录。Hero「总文化分」与「文化 DNA 年度报告」入口两端都有。
test('我的页渲染（Hero + DNA 入口）', async ({ page }) => {
  await page.goto('/me');
  await expect(page.getByText('总文化分')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('文化 DNA 年度报告')).toBeVisible();
});
