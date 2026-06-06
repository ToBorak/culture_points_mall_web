import { expect, test } from '@playwright/test';

// 不注入 token：让 AuthGate 走 dev mock 登录拿到有效 JWT（与真机一致），
// 避免假 token 触发 /api 401 → reload。两 project（mobile/chromium）均适用。
test('排行榜渲染 + 切换时间窗', async ({ page }) => {
  await page.goto('/leaderboard');
  await expect(page.getByRole('heading', { name: '排行榜' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('文化分 TOP 3')).toBeVisible();

  await page.getByRole('button', { name: '月', exact: true }).click();
  await expect(page.getByRole('button', { name: '月', exact: true })).toHaveAttribute('aria-pressed', 'true');
});
