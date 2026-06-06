import { type Page, expect, test } from '@playwright/test';

const mockEntries = Array.from({ length: 12 }, (_, i) => ({
  rank: i + 1,
  userId: i === 6 ? 100 : i + 1,
  name: [
    '王梓涵',
    '李慕晴',
    '陈予安',
    '赵星宇',
    '周明哲',
    '林亦然',
    '测试本人',
    '韩启航',
    '许清越',
    '沈南一',
    '顾知夏',
    '唐云起',
  ][i],
  avatarUrl: '',
  deptName: '产品体验部',
  score: 3200 - i * 137,
  trend: i % 3 === 0 ? 2 : i % 3 === 1 ? -1 : 0,
}));

async function mockLeaderboardPage(page: Page) {
  await page.route('**/api/v1/me/passport', (route) =>
    route.fulfill({
      json: { totalScore: 2378, scoresByDimension: [], badgeCount: 8, dimensions: [] },
    }),
  );
  await page.route('**/api/v1/leaderboard**', (route) =>
    route.fulfill({
      json: { scope: 'total', window: 'year', dimensionId: null, entries: mockEntries, total: mockEntries.length },
    }),
  );
  await page.route('**/api/v1/me/leaderboard-insight', (route) =>
    route.fulfill({
      json: {
        headline: '你正处在前排冲刺区，本周新增协作积分带来了明显抬升，继续保持会更稳。',
        keyDriver: '主要驱动力来自跨部门协作、活动签到和知识分享三类记录，最近 7 天的增长速度高于团队均值。',
        nextGoal: '再完成 2 次高质量协作记录，就有机会进入前 5 名。',
        tone: 'encouraging',
        currentRank: 7,
        totalScore: 2378,
      },
    }),
  );
  await page.addInitScript(() => {
    localStorage.setItem('cpm_jwt', 'mock-token');
    localStorage.setItem('cpm_uid', '100');
    localStorage.setItem('cpm_tid', '1');
    localStorage.setItem('cpm_name', '测试本人');
  });
}

// 不注入 token：让 AuthGate 走 dev mock 登录拿到有效 JWT（与真机一致），
// 避免假 token 触发 /api 401 → reload。两 project（mobile/chromium）均适用。
test('排行榜渲染 + 切换时间窗', async ({ page }) => {
  await page.goto('/leaderboard');
  await expect(page.getByRole('heading', { name: '排行榜' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('文化分 TOP 3')).toBeVisible();

  await page.getByRole('button', { name: '月', exact: true }).click();
  await expect(page.getByRole('button', { name: '月', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('移动端 AI 解读卡片高度随内容撑开', async ({ page, isMobile }) => {
  test.skip(!isMobile, '只验证移动端 flex 滚动容器里的卡片高度');

  await mockLeaderboardPage(page);
  await page.goto('/leaderboard');

  const aiCard = page.getByText('AI 解读').locator('xpath=../../..');
  await expect(aiCard).toBeVisible();
  const size = await aiCard.evaluate((el) => ({
    clientHeight: el.clientHeight,
    scrollHeight: el.scrollHeight,
  }));

  expect(size.clientHeight).toBeGreaterThanOrEqual(size.scrollHeight - 1);
});
