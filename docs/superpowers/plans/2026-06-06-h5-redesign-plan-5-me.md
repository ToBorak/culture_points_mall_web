# H5 重设计 · 计划 5：我的（Me / 护照）实现计划

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development 或 superpowers:executing-plans。Steps 用 `- [ ]`。

**Goal:** 把现有「文化护照」内容（个人积分 / 价值观雷达 / 徽章 / 积分流水）重设计成紫蓝「我的」页，移动端 + 桌面端两套，复用现有 hooks 与雷达，并接入 DNA 报告入口；同时把 AppShell 顶部 `PointsPill` 的占位积分换成 `usePassport` 真实总分。

**Architecture:** 复用 `usePassport` / `useMyTransactions` / `useMyBadges`（数据已就绪）与 `apps/h5/.../passport/PassportRadar`（雷达）。新增可复用组件 `PointLedgerRow` / `BadgeCard` 到 `@cpm/ui`，`levelOf` 等级工具进 `@cpm/ui/lib`。重写 `MePage` 为响应式：移动端 = 紫蓝 Hero + 分段(雷达/徽章/流水) + DNA 入口；桌面端 = Hero + 两栏(左雷达+徽章 / 右流水)。沿用 Plan 1/2 约定（CSS 变量 token + 内联样式 + framer-motion + lucide）。

**数据契约（已确认 · `@cpm/types`）：**
```ts
PassportSummary { totalScore; scoresByDimension: DimensionScore[]; badgeCount; dimensions: Dimension[] }
DimensionScore { dimensionId; dimensionCode; dimensionName; totalScore; quarterScore; yearScore }
PointTransaction { id; dimensionId; dimensionCode; amount; reason; activityId: number|null; createdAt: string }
Badge { id; dimensionCode; name; rarity: 'common'|'rare'|'epic'|'legendary'; iconUrl; earned; earnedAt: string|null }
usePassport() · useMyTransactions(limit) [infinite] · useMyBadges()
```

## 约定
同 Plan 1/2。分支 `feat/h5-redesign-foundation`。

## 文件清单
- `@cpm/ui`：新增 `lib/level.ts`(+test)、`components/PointLedgerRow.tsx`(+test+story)、`components/BadgeCard.tsx`(+story)；改 `components/index.ts` / `lib/index.ts`
- `apps/h5`：重写 `pages/me/MePage.tsx`；新增 `pages/me/MeMobile.tsx`、`pages/me/MeDesktop.tsx`、`pages/me/useMeState.ts`；改 `layout/AppShell.tsx`（真实积分）
- 删除 `pages/passport/PassportPage.tsx`、`pages/passport/PassportTransactions.tsx`（并入「我的」；**保留 `PassportRadar.tsx`**，被复用）
- `e2e/tests/me.spec.ts`

---

## Task 1：`levelOf` 等级工具（@cpm/ui/lib，TDD）
**Files:** Create `packages/ui/src/lib/level.ts` (+`.test.ts`)
- [ ] **失败测试** `level.test.ts`
```ts
import { describe, expect, it } from 'vitest';
import { levelOf } from './level.ts';
describe('levelOf', () => {
  it('tiers by total score', () => {
    expect(levelOf(0).tier).toBe('L1');
    expect(levelOf(120).tier).toBe('L2');
    expect(levelOf(800).tier).toBe('L3');
    expect(levelOf(2000).tier).toBe('L4');
  });
});
```
- [ ] **跑测试失败** → FAIL
- [ ] **实现** `level.ts`
```ts
export interface Level { tier: string; name: string; color: string; min: number; next: number | null; }
const LEVELS: Level[] = [
  { tier: 'L1', name: '起步', color: '#22c55e', min: 0, next: 100 },
  { tier: 'L2', name: '进阶', color: '#22d3ee', min: 100, next: 500 },
  { tier: 'L3', name: '精英', color: '#6a5cff', min: 500, next: 1500 },
  { tier: 'L4', name: '传奇', color: '#ffb020', min: 1500, next: null },
];
export function levelOf(total: number): Level {
  return [...LEVELS].reverse().find((l) => total >= l.min) ?? LEVELS[0];
}
```
- [ ] **跑测试通过** → PASS
- [ ] **lib/index.ts** 追加 `export { levelOf, type Level } from './level.ts';`
- [ ] **提交** `feat(ui): add levelOf util`

---

## Task 2：`PointLedgerRow` 组件（@cpm/ui，TDD）
**Files:** Create `PointLedgerRow.tsx` (+`.test.tsx`,+`.stories.tsx`)
- [ ] **失败测试**：`render(<PointLedgerRow tx={{...amount:+30}} />)` → `screen.getByText('+30')`；amount 负 → `-10`（无前缀+）。
- [ ] **实现**：左维度色条（dimensionCode→色，沿用 dimColor 映射放组件内）+ reason + createdAt + amount（绿/红，Baloo2）。Props `{ tx: PointTransaction }`。
- [ ] **测试通过** → PASS；**Story**（加分/扣分）；**提交** `feat(ui): add PointLedgerRow`

---

## Task 3：`BadgeCard` 组件（@cpm/ui）
**Files:** Create `BadgeCard.tsx` (+`.stories.tsx`)
- [ ] **实现**：徽章卡（iconUrl 或占位 lucide `Award`；rarity 标签 common/rare/epic/legendary 配色；未获得灰度）。Props `{ badge: Badge }`。**Story**（earned/locked + 4 稀有度）。**提交** `feat(ui): add BadgeCard`

---

## Task 4：导出 + AppShell 真实积分
**Files:** Modify `packages/ui/src/components/index.ts`；`apps/h5/src/layout/AppShell.tsx`
- [ ] **导出** PointLedgerRow / BadgeCard。
- [ ] **AppShell**：用 `usePassport()` 取 `totalScore` 喂 `PointsPill`（移动顶部 + 桌面 header），替换 `PLACEHOLDER_POINTS`；loading 时回退 0。`const { data } = usePassport(); const pts = data?.totalScore ?? 0;`
- [ ] **typecheck** → PASS；**提交** `feat(h5): wire real points into AppShell + export me components`

---

## Task 5：共享状态 `useMeState`（h5）
**Files:** Create `apps/h5/src/pages/me/useMeState.ts`
- [ ] 聚合 `usePassport` / `useMyBadges` / `useMyTransactions` + `useAuth` 取 name；导出 `{ p, badges, txItems, txQ, name, total, dims }`。**提交** `feat(h5): add useMeState`

---

## Task 6：移动端「我的」`MeMobile`（h5）
**Files:** Create `pages/me/MeMobile.tsx`
- [ ] 紫蓝 Hero 卡（`--cpm-grad-brand`）：`Avatar`(name) + name + `levelOf` 等级 chip + 总积分大数字(Baloo2) + 徽章数/维度数 + 维度迷你条；下方 `SegmentedControl`(价值观雷达/徽章/积分流水) → 对应内容（雷达=复用 `PassportRadar`；徽章=`BadgeCard` 宫格；流水=`PointLedgerRow` 列表 + 加载更多）；底部「文化 DNA 报告」入口卡（lucide `Sparkles`，点击 `navigate('/dna')`）。**提交** `feat(h5): me mobile`

---

## Task 7：桌面端「我的」`MeDesktop`（h5）
**Files:** Create `pages/me/MeDesktop.tsx`
- [ ] 标题「我的」+ Hero 卡（横向：左头像/等级/总分，右徽章/维度统计）；两栏 grid（左：雷达卡 + 徽章宫格；右：积分流水列表 + DNA 入口卡）。**提交** `feat(h5): me desktop`

---

## Task 8：响应式入口 `MePage` + 清理
**Files:** Rewrite `pages/me/MePage.tsx`；Delete `pages/passport/PassportPage.tsx` + `PassportTransactions.tsx`
- [ ] `MePage` = `useBreakpoint().isDesktop ? <MeDesktop {...state}/> : <MeMobile {...state}/>`，`state = useMeState()`。
- [ ] `grep -rn "PassportPage\|PassportTransactions" apps/h5/src` 确认无引用（已从 router 移除）后删除；**保留 PassportRadar**。
- [ ] `typecheck && build` → PASS；**提交** `feat(h5): responsive MePage + remove legacy passport pages`

---

## Task 9：验证
**Files:** Create `e2e/tests/me.spec.ts`
- [ ] e2e：goto `/me`（dev mock 登录）→ 断言出现「我的」或总积分 + 切到「积分流水」分段。两 project。
- [ ] 全量：`@cpm/ui` 单测、h5 typecheck/build、我方文件 biome 干净。
- [ ] 真机（headless Chrome 5173）两端截图：Hero + 雷达/徽章/流水 + DNA 入口；确认 AppShell 顶部积分=真实总分。
- [ ] **提交** `test(e2e): me page`

## DoD
我的两端紫蓝化、复用 hooks/雷达、DNA 入口可达、AppShell 积分真实；新组件有单测/Story；全量 + 真机通过。

## 剩余：Plan 3（活动·待后端报名 API）· Plan 4（商城+盲盒）。
