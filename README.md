# 文化积分商城 · 前端 Monorepo

> pnpm workspace + Turborepo · React 19 + Vite + UnoCSS + @react-three/fiber + GSAP + Lottie

## 包结构

```
apps/
  h5/      钉钉员工 H5（移动端，:5173）
  admin/   HR 后台 PC（:5174）
packages/
  ui/         动漫风设计系统（Storybook :6006）
  api-client/ TanStack Query hooks + axios 客户端
  types/      共享 TS 类型契约
e2e/         Playwright 端到端测试
```

## 启动

```bash
pnpm install
pnpm --filter @cpm/h5 dev          # 员工 H5
pnpm --filter @cpm/admin dev       # HR 后台
pnpm --filter @cpm/ui storybook    # 设计系统 :6006
```

## E2E 测试

```bash
cd e2e
pnpm exec playwright install chromium
pnpm test:e2e
```

需要前后端均启动并已灌入 seed 数据。

## 构建

```bash
pnpm -r build
```

详见后端仓库的 `docs/superpowers/specs/2026-05-22-文化积分商城-动漫风钉钉应用-design.md`。
