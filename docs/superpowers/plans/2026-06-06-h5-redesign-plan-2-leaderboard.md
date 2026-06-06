# H5 重设计 · 计划 2：排行榜（Leaderboard）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development 或 superpowers:executing-plans。Steps 用 `- [ ]`。

**Goal:** 把已验收的「元气紫蓝 · 活力游戏化」排行榜原型落到代码，移动端 + 桌面端两套，复用现有数据逻辑，并修复 `myEntry` / `trend NaN` 两个 bug。

**Architecture:** 抽取可复用表现型组件到 `@cpm/ui`（Avatar / TrendIndicator / SegmentedControl / PodiumTop3 / LeaderboardRow），用新紫蓝 tokens + 内联样式 + framer-motion（沿用 Plan 1 约定）。重写 `apps/h5` 的 `LeaderboardPage` 为响应式（`useBreakpoint`）：移动端=领奖台+列表+「你的排名」吸底；桌面端=Hero 领奖台+完整榜单+右侧「我的排名/AI 解读」面板。保留 scope/window/dimension 筛选与 `useLeaderboard`/`useDimensions`/insight 数据流，去掉旧 `AuroraBg` 与多余「← 返回」（已是 Tab）。

**Tech Stack:** 同 Plan 1（React 19 / Vite / 内联样式+CSS 变量 / framer-motion / lucide-react / Vitest / Playwright）。

**参考：** 视觉原型 `ui-prototype/leaderboard.html`（像素级基准）；数据类型 `packages/types/src/leaderboard.ts`；现有实现 `apps/h5/src/pages/leaderboard/LeaderboardPage.tsx`（保留其数据逻辑）。

**数据契约（已确认）：**
```ts
type LeaderboardScope = 'total' | 'dim' | 'dept';
type LeaderboardWindow = 'week' | 'month' | 'quarter' | 'year';
interface LeaderboardEntry { rank: number; userId: number; name: string; avatarUrl: string; deptName: string; score: number; trend: number; }
interface LeaderboardResponse { scope; window; dimensionId: number|null; entries: LeaderboardEntry[]; total: number; }
useLeaderboard({ scope, window, dimensionId }) // → LeaderboardResponse
useDimensions() // → Dimension[]  (id, code, name)
```

---

## 约定
同 Plan 1：Biome（单引号/分号/尾逗号/2空格/`import type`）；`@cpm/ui` 相对导入带 `.tsx`/`.ts`；`apps/h5` 相对导入不带扩展名；触控≥44px、cursor-pointer、hover 150–300ms、对比 4.5:1；图标用 lucide-react（不用 emoji）；每 Task 末提交。命令在仓库根执行。分支：当前 `feat/h5-redesign-foundation`。

## 文件清单
**`packages/ui/src/components/`（新增）**
- `Avatar.tsx`(+test+story)、`TrendIndicator.tsx`(+test+story)、`SegmentedControl.tsx`(+test+story)、`PodiumTop3.tsx`(+story)、`LeaderboardRow.tsx`(+story)
- 修改 `index.ts` 导出
**`apps/h5/src/pages/leaderboard/`（重写/新增）**
- 重写 `LeaderboardPage.tsx`；新增 `LeaderboardDesktop.tsx`、`LeaderboardMobile.tsx`、`useLeaderboardState.ts`（共享筛选+数据 hook）
- 删除 `TopThree.tsx`（旧动漫风，未被新页面引用；删前 grep 确认无其它引用）
**`e2e/tests/`**：新增 `leaderboard.spec.ts`

---

## Task 1：`Avatar` 组件（@cpm/ui）

**Files:** Create `packages/ui/src/components/Avatar.tsx` (+`.test.tsx`,+`.stories.tsx`)

- [ ] **Step 1: 失败测试** `Avatar.test.tsx`
```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar } from './Avatar.tsx';

describe('Avatar', () => {
  it('shows initial when no avatarUrl', () => {
    render(<Avatar name="王梓涵" />);
    expect(screen.getByText('王')).toBeTruthy();
  });
  it('renders img with alt when avatarUrl given', () => {
    render(<Avatar name="李四" avatarUrl="http://x/a.png" />);
    expect(screen.getByRole('img', { name: '李四' })).toBeTruthy();
  });
});
```
- [ ] **Step 2: 跑测试失败** `pnpm --filter @cpm/ui test` → FAIL
- [ ] **Step 3: 实现** `Avatar.tsx`
```tsx
import type { CSSProperties } from 'react';

export interface AvatarProps {
  name: string;
  avatarUrl?: string;
  size?: number;
  ringColor?: string;
  style?: CSSProperties;
}

export function Avatar({ name, avatarUrl, size = 40, ringColor, style }: AvatarProps) {
  const base: CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    boxShadow: ringColor ? `inset 0 0 0 2px ${ringColor}` : 'inset 0 0 0 2px rgba(255,255,255,0.5)',
    ...style,
  };
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} style={{ ...base, objectFit: 'cover' }} />;
  }
  return (
    <div
      style={{
        ...base,
        display: 'grid',
        placeItems: 'center',
        background: 'var(--cpm-grad-brand)',
        color: 'var(--cpm-on-primary)',
        fontFamily: 'var(--cpm-font-sans)',
        fontWeight: 700,
        fontSize: Math.round(size * 0.42),
      }}
    >
      {name.charAt(0)}
    </div>
  );
}
```
- [ ] **Step 4: 跑测试通过** → PASS
- [ ] **Step 5: Story** `Avatar.stories.tsx`（`Default` initial / `WithImage`）— 见 Plan 1 story 模式
- [ ] **Step 6: 提交** `feat(ui): add Avatar`

---

## Task 2：`TrendIndicator` 组件（@cpm/ui）— 修 NaN bug（TDD）

**Files:** Create `TrendIndicator.tsx` (+`.test.tsx`,+`.stories.tsx`)

- [ ] **Step 1: 失败测试**
```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TrendIndicator } from './TrendIndicator.tsx';

describe('TrendIndicator', () => {
  it('up for positive', () => { render(<TrendIndicator value={2} />); expect(screen.getByText('▲ 2')).toBeTruthy(); });
  it('down for negative', () => { render(<TrendIndicator value={-1} />); expect(screen.getByText('▼ 1')).toBeTruthy(); });
  it('flat for zero', () => { render(<TrendIndicator value={0} />); expect(screen.getByText('—')).toBeTruthy(); });
  it('flat (—) for NaN / undefined (bug fix)', () => {
    render(<TrendIndicator value={Number.NaN} />);
    expect(screen.getByText('—')).toBeTruthy();
  });
});
```
- [ ] **Step 2: 跑测试失败** → FAIL
- [ ] **Step 3: 实现**
```tsx
export interface TrendIndicatorProps {
  value: number;
}

export function TrendIndicator({ value }: TrendIndicatorProps) {
  const v = Number.isFinite(value) ? value : 0;
  const color = v > 0 ? 'var(--cpm-up)' : v < 0 ? 'var(--cpm-down)' : 'var(--cpm-ink-2)';
  const label = v > 0 ? `▲ ${v}` : v < 0 ? `▼ ${Math.abs(v)}` : '—';
  return (
    <span style={{ fontFamily: 'var(--cpm-font-num)', fontWeight: 700, fontSize: 12, color }}>{label}</span>
  );
}
```
- [ ] **Step 4: 跑测试通过** → PASS
- [ ] **Step 5: Story**（Up/Down/Flat/NaN）
- [ ] **Step 6: 提交** `feat(ui): add TrendIndicator (guards NaN)`

---

## Task 3：`SegmentedControl` 组件（@cpm/ui）

**Files:** Create `SegmentedControl.tsx` (+`.test.tsx`,+`.stories.tsx`)

- [ ] **Step 1: 失败测试**
```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SegmentedControl } from './SegmentedControl.tsx';

const items = [ { key: 'total', label: '总榜' }, { key: 'dim', label: '维度榜' }, { key: 'dept', label: '部门榜' } ];

describe('SegmentedControl', () => {
  it('marks active item with aria-pressed', () => {
    render(<SegmentedControl items={items} value="dim" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: '维度榜' }).getAttribute('aria-pressed')).toBe('true');
  });
  it('calls onChange with key', () => {
    const fn = vi.fn();
    render(<SegmentedControl items={items} value="total" onChange={fn} />);
    screen.getByRole('button', { name: '部门榜' }).click();
    expect(fn).toHaveBeenCalledWith('dept');
  });
});
```
- [ ] **Step 2: 跑测试失败** → FAIL
- [ ] **Step 3: 实现**（紫蓝胶囊；active=`--cpm-primary` 填充白字；轨道=`--cpm-sunken`）
```tsx
export interface SegItem<T extends string> { key: T; label: string; }
export interface SegmentedControlProps<T extends string> {
  items: SegItem<T>[];
  value: T;
  onChange: (key: T) => void;
}

export function SegmentedControl<T extends string>({ items, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 'var(--cpm-r-pill)', background: 'var(--cpm-sunken)' }}>
      {items.map((it) => {
        const on = it.key === value;
        return (
          <button
            key={it.key}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(it.key)}
            style={{
              flex: 1,
              minHeight: 36,
              padding: '8px 4px',
              border: 'none',
              borderRadius: 'var(--cpm-r-pill)',
              cursor: 'pointer',
              fontFamily: 'var(--cpm-font-sans)',
              fontSize: 13,
              fontWeight: on ? 700 : 600,
              background: on ? 'var(--cpm-primary)' : 'transparent',
              color: on ? 'var(--cpm-on-primary)' : 'var(--cpm-ink-2)',
              boxShadow: on ? '0 6px 14px -4px rgba(106,92,255,0.6)' : 'none',
              transition: 'background 200ms ease, color 200ms ease',
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
```
- [ ] **Step 4: 跑测试通过** → PASS
- [ ] **Step 5: Story**
- [ ] **Step 6: 提交** `feat(ui): add SegmentedControl`

---

## Task 4：`PodiumTop3` 组件（@cpm/ui）

**Files:** Create `PodiumTop3.tsx` (+`.stories.tsx`)

- [ ] **Step 1: 实现**（紫蓝渐变卡 `--cpm-grad-brand` + `--cpm-elev-candy`；列序 #2/#1/#3，冠军升高；用 `Avatar`，奖牌色台阶；white 文字；entry 不足 3 时空位占位）。Props:
```ts
export interface PodiumTop3Props { entries: LeaderboardEntry[]; } // 取 entries[0..2]
```
结构参考原型 `.podium`：标题「🏆→Trophy 本周 · 文化分 TOP 3」+ `PodiumRow`（counterAxis 底对齐）。冠军 `Avatar size=62 ringColor medal-gold` + lucide `Crown`；#2 silver/#3 bronze。台阶 base：白色 18% 透明，topRadius 14，高度 72/52/40，大号 Baloo2 数字。完整样式取原型与 Plan-1 token；用 `import type { LeaderboardEntry } from '@cpm/types'`。
- [ ] **Step 2: Story**（mock 3 条 entries）
- [ ] **Step 3: 截图核验**（Storybook 或 build 后浏览器）
- [ ] **Step 4: 提交** `feat(ui): add PodiumTop3`

---

## Task 5：`LeaderboardRow` 组件（@cpm/ui）

**Files:** Create `LeaderboardRow.tsx` (+`.stories.tsx`)

- [ ] **Step 1: 实现** 白卡行：rank（Baloo2，前 3 用奖牌色方块）+ `Avatar` + 名/部门 + score（Baloo2，`--cpm-gold-ink`）+ `TrendIndicator`。`highlight` 时用 `--cpm-primary-soft` 底 + primary 描边（"你"）。Props:
```ts
export interface LeaderboardRowProps { entry: LeaderboardEntry; highlight?: boolean; }
```
- [ ] **Step 2: Story**（普通行 / highlight 行）
- [ ] **Step 3: 提交** `feat(ui): add LeaderboardRow`

---

## Task 6：导出新组件

**Files:** Modify `packages/ui/src/components/index.ts`
- [ ] **Step 1:** 追加 `export * from './Avatar.tsx' | './TrendIndicator.tsx' | './SegmentedControl.tsx' | './PodiumTop3.tsx' | './LeaderboardRow.tsx';`
- [ ] **Step 2:** `pnpm --filter @cpm/ui typecheck` → PASS
- [ ] **Step 3:** 提交 `feat(ui): export leaderboard components`

---

## Task 7：共享状态 hook `useLeaderboardState`（h5）

**Files:** Create `apps/h5/src/pages/leaderboard/useLeaderboardState.ts`
- [ ] **Step 1:** 把现有页面的筛选/数据逻辑抽成 hook（scope/win/dimId + `useLeaderboard` + `useDimensions` + insight + myEntry）。**修 bug**：`myUserId` 改用 `cpm_uid`（与 auth store 一致），用 `useAuth().userId`。
```ts
import { useDimensions, useLeaderboard } from '@cpm/api-client';
import type { LeaderboardEntry, LeaderboardScope, LeaderboardWindow } from '@cpm/types';
import { useEffect, useState } from 'react';
import { useAuth } from '../../store/auth';
// insight: 复用现有 axios 调用 /api/v1/me/leaderboard-insight（保留）

export function useLeaderboardState() {
  const [scope, setScope] = useState<LeaderboardScope>('total');
  const [win, setWin] = useState<LeaderboardWindow>('week');
  const [dimId, setDimId] = useState<number | undefined>();
  const dims = useDimensions();
  const q = useLeaderboard({ scope, window: win, dimensionId: dimId });
  const myUserId = useAuth((s) => s.userId);
  const entries: LeaderboardEntry[] = q.data?.entries ?? [];
  const myEntry = entries.find((e) => e.userId === myUserId) ?? null;
  const total = q.data?.total ?? entries.length;
  return { scope, setScope, win, setWin, dimId, setDimId, dims, q, entries, myEntry, total };
}
```
（insight 调用整段从旧页面搬入，保留行为。）
- [ ] **Step 2:** 提交 `feat(h5): extract useLeaderboardState (fix myEntry uid bug)`

---

## Task 8：移动端页面 `LeaderboardMobile`（h5）

**Files:** Create `apps/h5/src/pages/leaderboard/LeaderboardMobile.tsx`
- [ ] **Step 1:** 组合：顶栏标题「排行榜」+ 右上 `PointsPill`(myEntry?.score ?? 0) → `SegmentedControl`(scope 总/维度/部门) → window chips（周/月/季/年，胶囊，复用 Segmented 或行内 chip）→ 维度 chip（scope==='dim'）→ AI `LeaderboardInsightCard`（复用，外层换新卡样式）→ `PodiumTop3`(entries) → 列表 `entries.slice(3).map(LeaderboardRow, highlight=e.userId===myUserId)` → 空/加载态（`EmptyState`/骨架）。底部「你的排名」吸底条（myEntry：rank/score/趋势）。**不含** AuroraBg / 返回按钮。
- [ ] **Step 2:** typecheck → PASS
- [ ] **Step 3:** 提交 `feat(h5): leaderboard mobile (紫蓝游戏化)`

---

## Task 9：桌面端页面 `LeaderboardDesktop`（h5）

**Files:** Create `apps/h5/src/pages/leaderboard/LeaderboardDesktop.tsx`
- [ ] **Step 1:** 顶部标题 + scope `SegmentedControl`（右对齐）+ window chips。Hero 渐变带（`--cpm-grad-brand`）含 `PodiumTop3` 放大版。下方两栏 grid（1.7fr/1fr）：左「完整榜单」面板（表头 + `LeaderboardRow` 列表，含前 3）；右「我的排名」卡（紫渐变，#rank 大数字 + score + 趋势）+ AI `LeaderboardInsightCard`。内容最大宽度居中。参考原型 `.desktop` 右侧区。
- [ ] **Step 2:** typecheck → PASS
- [ ] **Step 3:** 提交 `feat(h5): leaderboard desktop (sidebar layout)`

---

## Task 10：响应式入口 `LeaderboardPage` + 清理

**Files:** Rewrite `apps/h5/src/pages/leaderboard/LeaderboardPage.tsx`; Delete `TopThree.tsx`
- [ ] **Step 1:** `LeaderboardPage` = `useBreakpoint().isDesktop ? <LeaderboardDesktop/> : <LeaderboardMobile/>`，二者共享 `useLeaderboardState()`（在 Page 调用，作 props 传下，避免双请求）。
```tsx
import { useBreakpoint } from '@cpm/ui';
import { LeaderboardDesktop } from './LeaderboardDesktop';
import { LeaderboardMobile } from './LeaderboardMobile';
import { useLeaderboardState } from './useLeaderboardState';

export function LeaderboardPage() {
  const state = useLeaderboardState();
  const { isDesktop } = useBreakpoint();
  return isDesktop ? <LeaderboardDesktop {...state} /> : <LeaderboardMobile {...state} />;
}
```
（据此把 Mobile/Desktop 改为接收 state props，而非各自调用 hook。）
- [ ] **Step 2:** `grep -rn "TopThree" apps/h5/src` 确认无引用后删除 `TopThree.tsx`。
- [ ] **Step 3:** `pnpm --filter @cpm/h5 typecheck && pnpm --filter @cpm/h5 build` → PASS
- [ ] **Step 4:** 提交 `feat(h5): responsive LeaderboardPage + remove legacy TopThree`

---

## Task 11：验证（单测 + e2e + 真机）

**Files:** Create `e2e/tests/leaderboard.spec.ts`
- [ ] **Step 1:** e2e：注入 token → goto `/leaderboard` → 断言出现「排行榜」标题 + 至少一个榜单行 + TOP 3 区域；点 window chip「月」断言不报错。两 project（mobile/chromium）。
- [ ] **Step 2:** 全量：`pnpm --filter @cpm/ui test`（含新组件单测）、`pnpm --filter @cpm/h5 typecheck`、`pnpm --filter @cpm/h5 build` 全绿；我方新增文件 `biome check` 干净。
- [ ] **Step 3:** 真机（Claude in Chrome，5173）：桌面（侧边栏 + Hero 榜单 + 我的排名面板）+ 移动（领奖台 + 列表 + 吸底）各截一张；确认 trend 不再 NaN、我的排名匹配。
- [ ] **Step 4:** 提交 `test(e2e): leaderboard nav/render`

---

## Definition of Done
- 排行榜两端均为紫蓝游戏化，复用新组件，数据/筛选行为不变；`trend NaN` 与 `myEntry uid` 两 bug 已修。
- 新组件有单测/Story；`@cpm/ui` 测试 + h5 typecheck/build + e2e 全绿；真机两端验收。

## 后续：Plan 3（活动）· Plan 4（商城+盲盒）· Plan 5（我的，接入真实积分余额替换 AppShell 占位）。
