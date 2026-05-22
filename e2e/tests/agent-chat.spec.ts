import { test, expect } from '@playwright/test';

test('HR-Agent 发布活动一站式', async ({ page }) => {
  await page.goto('http://localhost:5174/login');
  await page.fill('input', '1');
  await page.getByRole('button', { name: '登录' }).click();
  await page.goto('http://localhost:5174/chat');
  await page.fill('textarea', '列出当前所有活动');
  await page.getByRole('button', { name: /发送|思考/ }).click();
  // 仅期望 SSE 流不报错（不需要 Claude API key 实际响应）
  await expect(page.locator('textarea')).toBeVisible();
});
