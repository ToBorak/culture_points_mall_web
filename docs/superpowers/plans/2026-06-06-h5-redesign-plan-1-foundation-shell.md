# H5 重设计 · 计划 1：基础 + 外壳（Foundation + AppShell）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 H5 员工端铺好「元气紫蓝 · 活力游戏化」的设计基础（tokens / 字体 / 测试工具）并实现响应式外壳（移动底部 4 Tab、桌面左侧边栏），让 4 个 Tab 路由可导航。

**Architecture:** 设计语言通过 `@cpm/ui` 的 CSS 变量 token（`--cpm-*`）驱动，组件沿用现有约定——内联 `style` + CSS 变量 + framer-motion（**不引入 Uno 工具类大改**）。表现型组件（PointsPill / BottomTabBar / SideNav）放 `@cpm/ui`；依赖 react-router 的 `AppShell`（用 `<Outlet/>` + `useBreakpoint` 切换两端布局）放 `apps/h5`。测试用轻量混合：vitest 单测逻辑单元，Playwright 跑导航 e2e，其余靠 typecheck/lint/build/Storybook。

**Tech Stack:** React 19 · Vite 5 · UnoCSS(preset-uno) · framer-motion · react-router v6 · Zustand · TanStack Query · Biome 1.9 · Vitest + @testing-library/react(jsdom) · Playwright · pnpm 11 · Storybook 8。

**参考产物：** 设计 spec `docs/superpowers/specs/2026-06-06-h5-redesign-design.md`；视觉原型 `ui-prototype/leaderboard.html`（外壳/配色的像素级参照）。

---

## 设计强化（UI/UX Pro Max 复核增量，2026-06-06）

Pro Max 判定本项目风格为 **Claymorphism**，与已定「活力游戏化 + 厚圆角 + 糖果阴影」一致。据其 Pre-Delivery Checklist 增量如下（覆盖相关 Task，执行时以此为准）：

1. **图标用 SVG（lucide-react），不用 emoji**：BottomTabBar / SideNav / AppShell / PointsPill 的图标改 `lucide-react`（排行榜 `Trophy`、活动 `Target`、商城 `Gift`、我的 `User`、积分 `Coins`）。组件 `icon` 仍为 `ReactNode`；图标用 `currentColor` 继承按钮色（去掉 emoji 的 grayscale filter）。依赖：`lucide-react` 加入 `@cpm/ui`(devDep, 供 Story) 与 `apps/h5`(dep)。
2. **新增 `packages/ui/src/tokens/base.css`**：全局 `:focus-visible` 焦点环（2px primary）+ `prefers-reduced-motion` 降级；并入 `tokens/index.css`。
3. **横切验收项**（每个可交互 Task 都要满足）：触控目标 ≥44px、`cursor: pointer`、hover/过渡 150–300ms、文本对比度 ≥4.5:1。
4. 保留：紫蓝色板、Baloo 2 数字字体（Pro Max 的 Fredoka/Nunito 仅作同类备选，不替换已验收选择）。

> 注：下方各 Task 的 emoji 图标代码块以本节为准替换为 Lucide。

---

## 约定（每个任务都要遵守）

- **Biome**：单引号、分号、尾逗号、2 空格、行宽 120；类型导入必须 `import type`（`useImportType: error`）。
- **相对导入带扩展名**（仓库现状，如 `./format.ts`、`./PointsPill.tsx`）；workspace 包用包名 `@cpm/ui` 等。
- **不删除现有 legacy 组件/token**（comic / glass / aurora）；本计划只新增与「重调品牌色变量」。
- 所有命令在 **`culture_points_mall_web/` 仓库根**或注明的子目录执行。
- 每个任务末尾 `commit`；提交信息用 Conventional Commits。

---

## 文件清单（本计划新增/修改）

**`packages/ui/`**
- 新增 `vitest.config.ts`、`vitest.setup.ts`
- 修改 `package.json`（测试依赖 + `test` 脚本）
- 修改 `src/tokens/colors.css`、`src/tokens/typography.css`、`src/tokens/shadows.css`、`uno.config.ts`
- 新增 `src/lib/format.ts`(+`.test.ts`)、`src/lib/useBreakpoint.ts`(+`.test.ts`)、`src/lib/index.ts`
- 新增 `src/components/PointsPill.tsx`(+`.test.tsx`,+`.stories.tsx`)、`BottomTabBar.tsx`(+`.test.tsx`,+`.stories.tsx`)、`SideNav.tsx`(+`.stories.tsx`)
- 修改 `src/components/index.ts`、`src/index.ts`

**`apps/h5/`**
- 新增 `src/layout/AppShell.tsx`、`src/pages/activities/ActivitiesPage.tsx`、`src/pages/me/MePage.tsx`
- 修改 `src/router.tsx`

**`e2e/`**
- 新增 `tests/shell-nav.spec.ts`

---

## Task 1：搭建 Vitest 单测工具

**Files:**
- Create: `packages/ui/vitest.config.ts`
- Create: `packages/ui/vitest.setup.ts`
- Modify: `packages/ui/package.json`

- [ ] **Step 1：安装测试依赖**

Run（仓库根）:
```bash
pnpm --filter @cpm/ui add -D vitest @testing-library/react @testing-library/dom jsdom @vitejs/plugin-react
```
Expected: 安装成功，`packages/ui/package.json` 的 devDependencies 出现上述包。

- [ ] **Step 2：写 vitest 配置**

`packages/ui/vitest.config.ts`：
```typescript
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
```

- [ ] **Step 3：写测试 setup（自动清理）**

`packages/ui/vitest.setup.ts`：
```typescript
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 4：加 `test` 脚本**

在 `packages/ui/package.json` 的 `scripts` 中加入（与现有 `typecheck` 同级）：
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5：放一个临时用例验证工具链可跑**

`packages/ui/src/lib/smoke.test.ts`：
```typescript
import { describe, expect, it } from 'vitest';

describe('vitest wiring', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run:
```bash
pnpm --filter @cpm/ui test
```
Expected: PASS（1 passed）。

- [ ] **Step 6：删掉临时用例并提交**

```bash
rm packages/ui/src/lib/smoke.test.ts
git add packages/ui/package.json packages/ui/vitest.config.ts packages/ui/vitest.setup.ts pnpm-lock.yaml
git commit -m "chore(ui): set up vitest + testing-library (jsdom)"
```

---

## Task 2：元气紫蓝设计 tokens（颜色 / 圆角 / 阴影 / 字体）

**Files:**
- Modify: `packages/ui/src/tokens/colors.css`
- Modify: `packages/ui/src/tokens/shadows.css`
- Modify: `packages/ui/src/tokens/typography.css`
- Modify: `packages/ui/uno.config.ts`
- Create: `packages/ui/src/components/Tokens.stories.tsx`

- [ ] **Step 1：追加新品牌 token 到 `colors.css`**

在 `packages/ui/src/tokens/colors.css` 的 `:root{ ... }` **内部末尾**追加（不要删原有变量）：
```css
  /* === 重设计 · 元气紫蓝 canonical tokens (2026-06) === */
  --cpm-primary: #6a5cff;
  --cpm-primary-strong: #5646e0;
  --cpm-primary-soft: #ecebff;
  --cpm-accent: #22d3ee;
  --cpm-gold: #ffb020;
  --cpm-gold-soft: #fff4da;
  --cpm-gold-ink: #9a6800;
  --cpm-app-bg: #f5f6fb;
  --cpm-surface: #ffffff;
  --cpm-sunken: #edeff6;
  --cpm-ink-1: #191a2c;
  --cpm-ink-2: #6b6f86;
  --cpm-on-primary: #ffffff;
  --cpm-border-subtle: #eceef4;
  --cpm-up: #22c55e;
  --cpm-down: #ff5470;
  --cpm-medal-gold: #ffc23d;
  --cpm-medal-silver: #cbd3e1;
  --cpm-medal-bronze: #e29b6b;
  --cpm-grad-brand: linear-gradient(135deg, #6a5cff 0%, #7c6cff 45%, #22d3ee 120%);

  /* 把旧品牌色对齐到新紫蓝，保持全局一致 */
  --cpm-brand-violet: #6a5cff;
  --cpm-brand-cyan: #22d3ee;
```

- [ ] **Step 2：追加新圆角 + 立体阴影到 `shadows.css`**

在 `packages/ui/src/tokens/shadows.css` 的 `:root{ ... }` 内部末尾追加（**勿覆盖**已存在的 `--cpm-shadow-card` 等旧名）：
```css
  /* === 重设计 · 圆角与立体阴影 === */
  --cpm-r-sm: 10px;
  --cpm-r-md: 16px;
  --cpm-r-lg: 22px;
  --cpm-r-xl: 28px;
  --cpm-r-pill: 999px;
  --cpm-elev-candy: 0 14px 28px -8px rgba(106, 92, 255, 0.4);
  --cpm-elev-soft: 0 6px 18px -8px rgba(25, 26, 44, 0.18);
```

- [ ] **Step 3：加字体（圆体数字 + 普惠体优先）到 `typography.css`**

在 `typography.css` 顶部已有 Google Fonts `@import` 行**下面**新增一行：
```css
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&display=swap');
```
然后把 `--cpm-font-sans` 改为以阿里巴巴普惠体优先（本机有则用，自托管 web font 留作后续任务），并新增数字字体变量。将原 `--cpm-font-sans` 定义替换为：
```css
  --cpm-font-sans:
    'Alibaba PuHuiTi 3.0', 'Alibaba PuHuiTi', 'Inter', 'HarmonyOS Sans SC', 'PingFang SC',
    -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Microsoft YaHei', sans-serif;
  --cpm-font-num: 'Baloo 2', var(--cpm-font-sans);
```
> 备注：阿里巴巴普惠体未自托管时回退到 Inter/系统字，不影响布局。自托管子集化字体作为后续独立任务。

- [ ] **Step 4：在 uno.config 暴露少量新色（便于偶尔用工具类）**

把 `packages/ui/uno.config.ts` 的 `theme.colors` 对象**追加**以下键（保留原有键）：
```typescript
      primary: 'var(--cpm-primary)',
      primarySoft: 'var(--cpm-primary-soft)',
      accent: 'var(--cpm-accent)',
      gold: 'var(--cpm-gold)',
      appbg: 'var(--cpm-app-bg)',
      surface: 'var(--cpm-surface)',
      ink1: 'var(--cpm-ink-1)',
      ink2: 'var(--cpm-ink-2)',
```

- [ ] **Step 5：建配色总览 Story（视觉校验）**

`packages/ui/src/components/Tokens.stories.tsx`：
```tsx
import type { Meta, StoryObj } from '@storybook/react';

const SWATCHES: { name: string; varName: string }[] = [
  { name: 'primary', varName: '--cpm-primary' },
  { name: 'primary-strong', varName: '--cpm-primary-strong' },
  { name: 'primary-soft', varName: '--cpm-primary-soft' },
  { name: 'accent', varName: '--cpm-accent' },
  { name: 'gold', varName: '--cpm-gold' },
  { name: 'gold-soft', varName: '--cpm-gold-soft' },
  { name: 'app-bg', varName: '--cpm-app-bg' },
  { name: 'sunken', varName: '--cpm-sunken' },
  { name: 'ink-1', varName: '--cpm-ink-1' },
  { name: 'ink-2', varName: '--cpm-ink-2' },
  { name: 'up', varName: '--cpm-up' },
  { name: 'down', varName: '--cpm-down' },
  { name: 'medal-gold', varName: '--cpm-medal-gold' },
  { name: 'medal-silver', varName: '--cpm-medal-silver' },
  { name: 'medal-bronze', varName: '--cpm-medal-bronze' },
];

function Palette() {
  return (
    <div style={{ fontFamily: 'var(--cpm-font-sans)', padding: 24 }}>
      <div
        style={{
          height: 120,
          borderRadius: 'var(--cpm-r-xl)',
          background: 'var(--cpm-grad-brand)',
          boxShadow: 'var(--cpm-elev-candy)',
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          fontWeight: 800,
          fontSize: 20,
          marginBottom: 24,
        }}
      >
        领奖台渐变 grad-brand
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {SWATCHES.map((s) => (
          <div key={s.name} style={{ width: 120 }}>
            <div
              style={{
                height: 56,
                borderRadius: 'var(--cpm-r-md)',
                background: `var(${s.varName})`,
                boxShadow: 'var(--cpm-elev-soft)',
                border: '1px solid var(--cpm-border-subtle)',
              }}
            />
            <div style={{ fontSize: 12, color: 'var(--cpm-ink-2)', marginTop: 6 }}>{s.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const meta: Meta<typeof Palette> = { title: 'Foundations/Tokens', component: Palette };
export default meta;
type Story = StoryObj<typeof Palette>;
export const Palette_: Story = {};
```

- [ ] **Step 6：校验 + 提交**

Run:
```bash
pnpm --filter @cpm/ui typecheck
```
Expected: PASS（无类型错误）。

可选目视：`pnpm --filter @cpm/ui storybook`，打开 `Foundations/Tokens` 确认紫蓝/金/渐变/阴影正确。

```bash
git add packages/ui/src/tokens packages/ui/uno.config.ts packages/ui/src/components/Tokens.stories.tsx
git commit -m "feat(ui): add 元气紫蓝 design tokens (colors/radii/shadows/fonts)"
```

---

## Task 3：`formatPoints` 工具（TDD）

**Files:**
- Create: `packages/ui/src/lib/format.ts`
- Test: `packages/ui/src/lib/format.test.ts`

- [ ] **Step 1：写失败测试**

`packages/ui/src/lib/format.test.ts`：
```typescript
import { describe, expect, it } from 'vitest';
import { formatPoints } from './format.ts';

describe('formatPoints', () => {
  it('adds thousands separators', () => {
    expect(formatPoints(1280)).toBe('1,280');
    expect(formatPoints(2860)).toBe('2,860');
  });
  it('handles zero and rounds', () => {
    expect(formatPoints(0)).toBe('0');
    expect(formatPoints(12.6)).toBe('13');
  });
});
```

- [ ] **Step 2：跑测试确认失败**

Run: `pnpm --filter @cpm/ui test`
Expected: FAIL（`formatPoints` 未定义 / 模块缺失）。

- [ ] **Step 3：最小实现**

`packages/ui/src/lib/format.ts`：
```typescript
export function formatPoints(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}
```

- [ ] **Step 4：跑测试确认通过**

Run: `pnpm --filter @cpm/ui test`
Expected: PASS。

- [ ] **Step 5：提交**

```bash
git add packages/ui/src/lib/format.ts packages/ui/src/lib/format.test.ts
git commit -m "feat(ui): add formatPoints util with tests"
```

---

## Task 4：`useBreakpoint` 响应式 hook（TDD）

**Files:**
- Create: `packages/ui/src/lib/useBreakpoint.ts`
- Test: `packages/ui/src/lib/useBreakpoint.test.ts`

- [ ] **Step 1：写失败测试**

`packages/ui/src/lib/useBreakpoint.test.ts`：
```typescript
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useBreakpoint } from './useBreakpoint.ts';

function setWidth(w: number) {
  (window as unknown as { innerWidth: number }).innerWidth = w;
  window.dispatchEvent(new Event('resize'));
}

describe('useBreakpoint', () => {
  it('is mobile below 1024', () => {
    const { result } = renderHook(() => useBreakpoint());
    act(() => setWidth(390));
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });
  it('is desktop at/above 1024', () => {
    const { result } = renderHook(() => useBreakpoint());
    act(() => setWidth(1280));
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isMobile).toBe(false);
  });
});
```

- [ ] **Step 2：跑测试确认失败**

Run: `pnpm --filter @cpm/ui test`
Expected: FAIL（模块缺失）。

- [ ] **Step 3：实现 hook**

`packages/ui/src/lib/useBreakpoint.ts`：
```typescript
import { useEffect, useState } from 'react';

export const DESKTOP_MIN = 1024;

export interface Breakpoint {
  width: number;
  isDesktop: boolean;
  isMobile: boolean;
}

export function useBreakpoint(): Breakpoint {
  const [width, setWidth] = useState(() => (typeof window === 'undefined' ? 0 : window.innerWidth));

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return { width, isDesktop: width >= DESKTOP_MIN, isMobile: width < DESKTOP_MIN };
}
```

- [ ] **Step 4：跑测试确认通过**

Run: `pnpm --filter @cpm/ui test`
Expected: PASS。

- [ ] **Step 5：建 `lib/index.ts` 桶导出**

`packages/ui/src/lib/index.ts`：
```typescript
export { formatPoints } from './format.ts';
export { useBreakpoint, DESKTOP_MIN, type Breakpoint } from './useBreakpoint.ts';
```

- [ ] **Step 6：提交**

```bash
git add packages/ui/src/lib/useBreakpoint.ts packages/ui/src/lib/useBreakpoint.test.ts packages/ui/src/lib/index.ts
git commit -m "feat(ui): add useBreakpoint hook + lib barrel"
```

---

## Task 5：`PointsPill` 组件（TDD + Story）

**Files:**
- Create: `packages/ui/src/components/PointsPill.tsx`
- Test: `packages/ui/src/components/PointsPill.test.tsx`
- Create: `packages/ui/src/components/PointsPill.stories.tsx`

- [ ] **Step 1：写失败测试**

`packages/ui/src/components/PointsPill.test.tsx`：
```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PointsPill } from './PointsPill.tsx';

describe('PointsPill', () => {
  it('renders the formatted point value', () => {
    render(<PointsPill value={1280} />);
    expect(screen.getByText('1,280')).toBeTruthy();
  });
});
```

- [ ] **Step 2：跑测试确认失败**

Run: `pnpm --filter @cpm/ui test`
Expected: FAIL（模块缺失）。

- [ ] **Step 3：实现组件**

`packages/ui/src/components/PointsPill.tsx`：
```tsx
import type { CSSProperties } from 'react';
import { formatPoints } from '../lib/format.ts';

export interface PointsPillProps {
  value: number;
  style?: CSSProperties;
}

export function PointsPill({ value, style }: PointsPillProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: 'var(--cpm-gold-soft)',
        color: 'var(--cpm-gold-ink)',
        borderRadius: 'var(--cpm-r-pill)',
        padding: '6px 12px 6px 9px',
        fontFamily: 'var(--cpm-font-num)',
        fontWeight: 800,
        fontSize: 15,
        lineHeight: 1,
        ...style,
      }}
    >
      <span aria-hidden>🪙</span>
      <span>{formatPoints(value)}</span>
    </span>
  );
}
```

- [ ] **Step 4：跑测试确认通过**

Run: `pnpm --filter @cpm/ui test`
Expected: PASS。

- [ ] **Step 5：写 Story**

`packages/ui/src/components/PointsPill.stories.tsx`：
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { PointsPill } from './PointsPill.tsx';

const meta: Meta<typeof PointsPill> = { title: 'Components/PointsPill', component: PointsPill };
export default meta;
type Story = StoryObj<typeof PointsPill>;

export const Default: Story = { args: { value: 1280 } };
export const Large: Story = { args: { value: 28600 } };
```

- [ ] **Step 6：提交**

```bash
git add packages/ui/src/components/PointsPill.tsx packages/ui/src/components/PointsPill.test.tsx packages/ui/src/components/PointsPill.stories.tsx
git commit -m "feat(ui): add PointsPill component"
```

---

## Task 6：`BottomTabBar` 组件（TDD + Story）

**Files:**
- Create: `packages/ui/src/components/BottomTabBar.tsx`
- Test: `packages/ui/src/components/BottomTabBar.test.tsx`
- Create: `packages/ui/src/components/BottomTabBar.stories.tsx`

- [ ] **Step 1：写失败测试**

`packages/ui/src/components/BottomTabBar.test.tsx`：
```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BottomTabBar, type TabItem } from './BottomTabBar.tsx';

const items: TabItem[] = [
  { key: 'leaderboard', label: '排行榜', icon: '🏆' },
  { key: 'activities', label: '活动', icon: '🎯' },
];

describe('BottomTabBar', () => {
  it('marks the active tab with aria-current=page', () => {
    render(<BottomTabBar items={items} activeKey="activities" onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: /活动/ }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('button', { name: /排行榜/ }).getAttribute('aria-current')).toBe(null);
  });

  it('calls onSelect with the tab key on click', () => {
    const fn = vi.fn();
    render(<BottomTabBar items={items} activeKey="leaderboard" onSelect={fn} />);
    screen.getByRole('button', { name: /活动/ }).click();
    expect(fn).toHaveBeenCalledWith('activities');
  });
});
```

- [ ] **Step 2：跑测试确认失败**

Run: `pnpm --filter @cpm/ui test`
Expected: FAIL（模块缺失）。

- [ ] **Step 3：实现组件**

`packages/ui/src/components/BottomTabBar.tsx`：
```tsx
import type { ReactNode } from 'react';

export interface TabItem {
  key: string;
  label: string;
  icon: ReactNode;
}

export interface BottomTabBarProps {
  items: TabItem[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export function BottomTabBar({ items, activeKey, onSelect }: BottomTabBarProps) {
  return (
    <nav
      style={{
        display: 'flex',
        background: 'var(--cpm-surface)',
        padding: '8px 10px max(22px, env(safe-area-inset-bottom))',
        borderTop: '1px solid var(--cpm-border-subtle)',
      }}
    >
      {items.map((it) => {
        const on = it.key === activeKey;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => onSelect(it.key)}
            aria-current={on ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--cpm-font-sans)',
              fontSize: 11,
              fontWeight: 600,
              color: on ? 'var(--cpm-primary)' : 'var(--cpm-ink-2)',
            }}
          >
            <span
              aria-hidden
              style={{
                fontSize: 21,
                lineHeight: 1,
                filter: on ? 'none' : 'grayscale(1) opacity(0.55)',
                transform: on ? 'translateY(-1px)' : 'none',
              }}
            >
              {it.icon}
            </span>
            {it.label}
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 4：跑测试确认通过**

Run: `pnpm --filter @cpm/ui test`
Expected: PASS。

- [ ] **Step 5：写 Story**

`packages/ui/src/components/BottomTabBar.stories.tsx`：
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { BottomTabBar } from './BottomTabBar.tsx';

const items = [
  { key: 'leaderboard', label: '排行榜', icon: '🏆' },
  { key: 'activities', label: '活动', icon: '🎯' },
  { key: 'mall', label: '商城', icon: '🎁' },
  { key: 'me', label: '我的', icon: '👤' },
];

const meta: Meta<typeof BottomTabBar> = { title: 'Components/BottomTabBar', component: BottomTabBar };
export default meta;
type Story = StoryObj<typeof BottomTabBar>;

export const Default: Story = {
  args: { items, activeKey: 'leaderboard', onSelect: () => {} },
  decorators: [(S) => <div style={{ width: 390, border: '1px solid #eee' }}>{S()}</div>],
};
```

- [ ] **Step 6：提交**

```bash
git add packages/ui/src/components/BottomTabBar.tsx packages/ui/src/components/BottomTabBar.test.tsx packages/ui/src/components/BottomTabBar.stories.tsx
git commit -m "feat(ui): add BottomTabBar component"
```

---

## Task 7：`SideNav` 组件（Story + 渲染校验）

**Files:**
- Create: `packages/ui/src/components/SideNav.tsx`
- Create: `packages/ui/src/components/SideNav.stories.tsx`

- [ ] **Step 1：实现组件**

`packages/ui/src/components/SideNav.tsx`：
```tsx
import type { ReactNode } from 'react';
import type { TabItem } from './BottomTabBar.tsx';

export interface SideNavProps {
  items: TabItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  brand?: ReactNode;
  footer?: ReactNode;
}

export function SideNav({ items, activeKey, onSelect, brand, footer }: SideNavProps) {
  return (
    <aside
      style={{
        width: 236,
        flex: 'none',
        background: 'var(--cpm-surface)',
        borderRight: '1px solid var(--cpm-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '22px 16px',
      }}
    >
      {brand}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
        {items.map((it) => {
          const on = it.key === activeKey;
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => onSelect(it.key)}
              aria-current={on ? 'page' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 14,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--cpm-font-sans)',
                fontWeight: 600,
                fontSize: 14,
                background: on ? 'var(--cpm-primary)' : 'transparent',
                color: on ? 'var(--cpm-on-primary)' : 'var(--cpm-ink-2)',
                boxShadow: on ? 'var(--cpm-elev-candy)' : 'none',
              }}
            >
              <span aria-hidden style={{ fontSize: 19, filter: on ? 'none' : 'grayscale(1) opacity(0.6)' }}>
                {it.icon}
              </span>
              {it.label}
            </button>
          );
        })}
      </nav>
      <div style={{ marginTop: 'auto' }}>{footer}</div>
    </aside>
  );
}
```

- [ ] **Step 2：写 Story**

`packages/ui/src/components/SideNav.stories.tsx`：
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { SideNav } from './SideNav.tsx';

const items = [
  { key: 'leaderboard', label: '排行榜', icon: '🏆' },
  { key: 'activities', label: '活动', icon: '🎯' },
  { key: 'mall', label: '商城', icon: '🎁' },
  { key: 'me', label: '我的', icon: '👤' },
];

const meta: Meta<typeof SideNav> = { title: 'Components/SideNav', component: SideNav };
export default meta;
type Story = StoryObj<typeof SideNav>;

export const Default: Story = {
  args: { items, activeKey: 'leaderboard', onSelect: () => {} },
  decorators: [(S) => <div style={{ height: 520, display: 'flex' }}>{S()}</div>],
};
```

- [ ] **Step 3：typecheck 校验**

Run: `pnpm --filter @cpm/ui typecheck`
Expected: PASS。

- [ ] **Step 4：提交**

```bash
git add packages/ui/src/components/SideNav.tsx packages/ui/src/components/SideNav.stories.tsx
git commit -m "feat(ui): add SideNav component"
```

---

## Task 8：导出新成员（`@cpm/ui` 公共出口）

**Files:**
- Modify: `packages/ui/src/components/index.ts`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1：在 `components/index.ts` 追加导出**

在 `packages/ui/src/components/index.ts` 末尾追加：
```typescript
export { PointsPill, type PointsPillProps } from './PointsPill.tsx';
export { BottomTabBar, type BottomTabBarProps, type TabItem } from './BottomTabBar.tsx';
export { SideNav, type SideNavProps } from './SideNav.tsx';
```

- [ ] **Step 2：在主 `index.ts` 增加 lib 导出**

把 `packages/ui/src/index.ts` 改为：
```typescript
export * from './primitives/index.ts';
export * from './components/index.ts';
export * from './lib/index.ts';
```

- [ ] **Step 3：校验包可整体 typecheck**

Run: `pnpm --filter @cpm/ui typecheck`
Expected: PASS。

- [ ] **Step 4：提交**

```bash
git add packages/ui/src/components/index.ts packages/ui/src/index.ts
git commit -m "feat(ui): export PointsPill/BottomTabBar/SideNav + lib"
```

---

## Task 9：`AppShell` + 路由重构 + 占位页（apps/h5）

**Files:**
- Create: `apps/h5/src/layout/AppShell.tsx`
- Create: `apps/h5/src/pages/activities/ActivitiesPage.tsx`
- Create: `apps/h5/src/pages/me/MePage.tsx`
- Modify: `apps/h5/src/router.tsx`

- [ ] **Step 1：建活动占位页**

`apps/h5/src/pages/activities/ActivitiesPage.tsx`：
```tsx
export function ActivitiesPage() {
  return (
    <div style={{ padding: '24px 16px', fontFamily: 'var(--cpm-font-sans)' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--cpm-ink-1)' }}>活动</h1>
      <p style={{ color: 'var(--cpm-ink-2)', marginTop: 8 }}>即将上线 · 计划 3 实现</p>
    </div>
  );
}
```

- [ ] **Step 2：建我的占位页**

`apps/h5/src/pages/me/MePage.tsx`：
```tsx
export function MePage() {
  return (
    <div style={{ padding: '24px 16px', fontFamily: 'var(--cpm-font-sans)' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--cpm-ink-1)' }}>我的</h1>
      <p style={{ color: 'var(--cpm-ink-2)', marginTop: 8 }}>即将上线 · 计划 5 实现</p>
    </div>
  );
}
```

- [ ] **Step 3：实现 AppShell（响应式两端 + Outlet）**

`apps/h5/src/layout/AppShell.tsx`：
```tsx
import { BottomTabBar, PointsPill, SideNav, type TabItem, useBreakpoint } from '@cpm/ui';
import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

interface ShellTab extends TabItem {
  path: string;
}

const TABS: ShellTab[] = [
  { key: 'leaderboard', label: '排行榜', icon: '🏆', path: '/leaderboard' },
  { key: 'activities', label: '活动', icon: '🎯', path: '/activities' },
  { key: 'mall', label: '商城', icon: '🎁', path: '/mall' },
  { key: 'me', label: '我的', icon: '👤', path: '/me' },
];

// TODO(计划 5)：积分余额改为来自 usePassport/接口，目前占位。
const PLACEHOLDER_POINTS = 1540;

export function AppShell() {
  const { isDesktop } = useBreakpoint();
  const location = useLocation();
  const navigate = useNavigate();

  const activeKey = useMemo(
    () => TABS.find((t) => location.pathname.startsWith(t.path))?.key ?? 'leaderboard',
    [location.pathname],
  );
  const go = (key: string) => {
    const t = TABS.find((x) => x.key === key);
    if (t) navigate(t.path);
  };

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cpm-app-bg)' }}>
        <SideNav
          items={TABS}
          activeKey={activeKey}
          onSelect={go}
          brand={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 22px' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: 'var(--cpm-grad-brand)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 20,
                  boxShadow: 'var(--cpm-elev-candy)',
                }}
              >
                🎴
              </div>
              <div style={{ fontFamily: 'var(--cpm-font-sans)' }}>
                <b style={{ color: 'var(--cpm-ink-1)' }}>文化官</b>
                <small style={{ display: 'block', color: 'var(--cpm-ink-2)', fontSize: 11 }}>员工成长中心</small>
              </div>
            </div>
          }
        />
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '16px 28px',
              background: 'var(--cpm-surface)',
              borderBottom: '1px solid var(--cpm-border-subtle)',
            }}
          >
            <div style={{ flex: 1 }} />
            <PointsPill value={PLACEHOLDER_POINTS} />
          </header>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--cpm-app-bg)' }}>
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      <BottomTabBar items={TABS} activeKey={activeKey} onSelect={go} />
    </div>
  );
}
```

- [ ] **Step 4：重构 router 把 4 个 Tab 套进 AppShell**

把 `apps/h5/src/router.tsx` 整体替换为：
```tsx
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { ActivitiesPage } from './pages/activities/ActivitiesPage';
import { DNAReportPage } from './pages/dna/DNAReportPage';
import { LeaderboardPage } from './pages/leaderboard/LeaderboardPage';
import { BlindboxDrawPage } from './pages/mall/BlindboxDrawPage';
import { MallPage } from './pages/mall/MallPage';
import { MePage } from './pages/me/MePage';
import { SigninPage } from './pages/signin/SigninPage';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/leaderboard" replace />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/mall" element={<MallPage />} />
        <Route path="/me" element={<MePage />} />
      </Route>
      {/* 全屏路由（不带外壳） */}
      <Route path="/mall/blindbox/:id" element={<BlindboxDrawPage />} />
      <Route path="/dna" element={<DNAReportPage />} />
      <Route path="/signin" element={<SigninPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
```
> 注：现有 `LeaderboardPage`/`MallPage` 仍是旧视觉，本计划只接入外壳，重设计在计划 2/4 进行。原 `HomePage`/`PassportPage` 暂从路由移除（首页并入排行榜、护照并入「我的」，详见 spec），文件保留待后续清理。

- [ ] **Step 5：typecheck + 构建校验**

Run:
```bash
pnpm --filter @cpm/h5 typecheck
pnpm --filter @cpm/h5 build
```
Expected: 均 PASS（注意 `verbatimModuleSyntax`：`TabItem` 必须 `import type` 已在 AppShell 处理）。

- [ ] **Step 6：提交**

```bash
git add apps/h5/src/layout/AppShell.tsx apps/h5/src/pages/activities/ActivitiesPage.tsx apps/h5/src/pages/me/MePage.tsx apps/h5/src/router.tsx
git commit -m "feat(h5): add responsive AppShell (bottom tab / side nav) and restructure routes to 4 tabs"
```

---

## Task 10：导航 e2e（Playwright，两端）+ 手动验收

**Files:**
- Create: `e2e/tests/shell-nav.spec.ts`

- [ ] **Step 1：写导航 e2e**

`e2e/tests/shell-nav.spec.ts`：
```typescript
import { expect, test } from '@playwright/test';

// AppShell 的 Tab 在移动（BottomTabBar）和桌面（SideNav）下都渲染同名按钮，
// 因此同一断言对 chromium + mobile 两个 project 均适用。
test('Tab 切换更新路由', async ({ page }) => {
  await page.goto('/leaderboard');
  await page.getByRole('button', { name: '活动' }).click();
  await expect(page).toHaveURL(/\/activities/);
  await expect(page.getByRole('heading', { name: '活动' })).toBeVisible();

  await page.getByRole('button', { name: '我的' }).click();
  await expect(page).toHaveURL(/\/me/);
});
```
> 若 `AuthGate` 在无 token 时拦截（现有 `passport.spec.ts` 未设 token 即可访问，沿用其行为）。如本机环境需要登录态，可在 `test.beforeEach` 中 `await page.addInitScript(() => localStorage.setItem('cpm_jwt', 'e2e-test'))` 后再 `goto`。

- [ ] **Step 2：起 dev server 并跑 e2e**

在一个终端：
```bash
pnpm --filter @cpm/h5 dev
```
另一个终端：
```bash
pnpm --filter @cpm/e2e test:e2e -- shell-nav.spec.ts
```
Expected: `shell-nav` 在 chromium + mobile 两个 project 下 PASS。
（若因登录态失败，按 Step 1 备注加 `addInitScript` 后重跑。）

- [ ] **Step 3：手动两端目视验收**

打开 `http://localhost:5173/leaderboard`：
- 窄窗（< 1024px）：底部出现 4 Tab（🏆 排行榜高亮），点击切换页面。
- 宽窗（≥ 1024px）：左侧出现侧边栏（Logo + 4 项 + 顶栏积分 pill），点击切换。

用无头 Chrome 各截一张存档（可选）：
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --window-size=420,900 --screenshot=/tmp/shell-mobile.png "http://localhost:5173/leaderboard"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --window-size=1440,900 --screenshot=/tmp/shell-desktop.png "http://localhost:5173/leaderboard"
```

- [ ] **Step 4：全量校验 + 提交**

Run（仓库根）:
```bash
pnpm run lint
pnpm run typecheck
pnpm --filter @cpm/ui test
```
Expected: 全部 PASS。

```bash
git add e2e/tests/shell-nav.spec.ts
git commit -m "test(e2e): add shell navigation test for 4 tabs (mobile + desktop)"
```

---

## 计划 1 完成定义（Definition of Done）

- 新紫蓝 tokens + 字体落入 `@cpm/ui`，`Foundations/Tokens` Story 正确。
- `PointsPill / BottomTabBar / SideNav / useBreakpoint / formatPoints` 已实现、导出、有测试/Story。
- `apps/h5` 4 个 Tab 路由套上响应式 AppShell：移动底部 Tab、桌面侧边栏，可切换。
- `lint / typecheck / vitest / 导航 e2e` 全绿；两端目视通过。

## 后续计划（各自独立成篇，用 writing-plans 再生成）

- **计划 2 · 排行榜**：Podium / LeaderboardRow / YourRankBar + 两端页面，接 `useLeaderboard`（已验收原型为准）。
- **计划 3 · 活动**：活动卡 / 报名 / 签到 streak（待 HR 审核态）/ 线上任务。
- **计划 4 · 商城 + 盲盒**：商品宫格 / 兑换 / 盲盒开箱（复用 `BlindboxBox3D`）。
- **计划 5 · 我的**：积分流水 / 价值观雷达（复用 `RadarChart`）/ DNA 入口；接入真实积分余额（替换 AppShell 占位）。
