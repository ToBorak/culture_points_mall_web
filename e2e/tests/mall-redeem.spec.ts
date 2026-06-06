import { type Page, expect, test } from '@playwright/test';

async function mockMallApi(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('cpm_jwt', 'e2e-token');
    Object.defineProperty(window, 'confirm', { configurable: true, value: undefined });
  });

  let totalScore = 100;
  let stock = 98;
  let redeemed = false;

  await page.route('**/api/v1/me/passport', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ totalScore, dimensionScores: [], badges: [] }),
    });
  });
  await page.route('**/api/v1/me/orders', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        items: redeemed
          ? [{ id: 1, itemId: 201, itemName: '周边帆布袋', prizeId: null, prizeName: '', cost: 50, status: 'paid' }]
          : [],
      }),
    });
  });
  await page.route('**/api/v1/mall/items', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          { ID: 101, Type: 'blindbox', Name: 'AI 文化盲盒 · 普通', Cost: 5, Stock: null, ImageURL: '' },
          {
            ID: 201,
            Type: 'item',
            Name: '周边帆布袋',
            Cost: 50,
            Stock: stock,
            ImageURL: 'https://api.dicebear.com/9.x/shapes/svg?seed=bag',
          },
        ],
      }),
    });
  });
  await page.route('**/api/v1/mall/items/201/redeem', async (route) => {
    totalScore -= 50;
    stock -= 1;
    redeemed = true;
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ itemName: '周边帆布袋', cost: 50 }),
    });
  });
}

test('积分好物兑换不依赖原生 confirm', async ({ page }) => {
  await mockMallApi(page);
  await page.goto('/mall');

  await expect(page.getByText('周边帆布袋')).toBeVisible();
  await page.getByRole('button', { name: '兑换' }).click();

  const dialog = page.getByRole('dialog', { name: '确认兑换' });
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  const viewport = page.viewportSize();
  if (!box || !viewport) throw new Error('兑换确认弹窗未渲染到视口内');
  expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThanOrEqual(4);
  expect(Math.abs(box.y + box.height / 2 - viewport.height / 2)).toBeLessThanOrEqual(4);
  await expect(dialog.getByText('周边帆布袋')).toBeVisible();
  await page.getByRole('button', { name: '确认兑换' }).click();

  await expect(page.getByText('库存 97')).toBeVisible();
});
