import { type Page, expect, test } from '@playwright/test';

async function mockMallApi(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('cpm_jwt', 'e2e-token');
  });
  await page.route('**/api/v1/me/passport', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ totalScore: 100000, dimensionScores: [], badges: [] }),
    });
  });
  await page.route('**/api/v1/me/orders', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ items: [] }) });
  });
  await page.route('**/api/v1/mall/items', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          { ID: 101, Type: 'blindbox', Name: 'AI 文化盲盒 · 普通', Cost: 5, Stock: null, ImageURL: '' },
          { ID: 102, Type: 'blindbox', Name: 'AI 文化盲盒 · 闪光', Cost: 10, Stock: null, ImageURL: '' },
          {
            ID: 201,
            Type: 'item',
            Name: '周边帆布袋',
            Cost: 50,
            Stock: 98,
            ImageURL: 'https://api.dicebear.com/9.x/shapes/svg?seed=bag',
          },
        ],
      }),
    });
  });
  await page.route('**/api/v1/mall/blindbox/101/prizes', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          { id: 1, prizeName: '无中奖（鼓励气泡）', prizeImage: '', weight: 60 },
          { id: 2, prizeName: '咖啡券', prizeImage: '', weight: 25 },
          { id: 3, prizeName: '帆布袋', prizeImage: '', weight: 10 },
          { id: 4, prizeName: '公司定制 T 恤', prizeImage: '', weight: 5 },
        ],
      }),
    });
  });
}

test('盲盒商城入口和详情页适配新视觉', async ({ page }) => {
  await mockMallApi(page);
  await page.goto('/mall');

  await expect(page.getByText('AI 文化盲盒 · 普通')).toBeVisible();
  await expect(page.getByText('5 分 / 次')).toBeVisible();
  await expect(page.getByText('10 分 / 次')).toBeVisible();

  const mallContent = page.getByTestId('mall-content');
  const box = await mallContent.boundingBox();
  expect(box?.width).toBeLessThanOrEqual(1180);

  await page.getByRole('button', { name: /AI 文化盲盒 · 普通/ }).click();
  await page.waitForSelector('canvas', { timeout: 8000 });

  // 全局返回规范：移动端无页内返回（钉钉自带）；桌面端返回在顶栏。
  const isMobile = test.info().project.name === 'mobile';
  await expect(page.getByRole('button', { name: /返回/ })).toHaveCount(isMobile ? 0 : 1);
  await expect(page.getByRole('button', { name: /开启盲盒/ })).toContainText('5 分');
  await expect(page.getByRole('button', { name: '商城' })).toBeVisible();
});
