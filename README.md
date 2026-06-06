# 文化积分商城 · 前端 Monorepo

> pnpm workspace + Turborepo · React 19 + Vite + UnoCSS + @react-three/fiber + GSAP + Lottie

## 🚀 从零开始

**整套系统的一键启动入口在后端仓库 [`culture_points_mall`](../culture_points_mall) 的 `./bootstrap.sh`**——它会自动拉起后端 + MCP + H5 + Admin。本仓库的脚本仅服务于"只改前端、后端已经跑着"的场景。

### 仅启动前端

```bash
./scripts/dev.sh
```

自动完成：
1. 检测/安装 Node + pnpm（macOS 走 brew，Linux 走 apt）
2. 检查后端是否在 `http://localhost:18080`（不在会警告但仍启动）
3. `pnpm install`
4. 并行启动 H5 :5173 + Admin :5174

需要不同后端地址：`BACKEND_URL=http://192.168.1.5:18080 ./scripts/dev.sh`

## 包结构

```
apps/
  h5/      钉钉员工 H5（移动端，:5173）
  admin/   HR 后台 PC（:5174）
packages/
  ui/         设计系统（Light Bento + 3D 组件，Storybook :6006）
  api-client/ TanStack Query hooks + axios 客户端
  types/      共享 TS 类型契约
e2e/         Playwright 端到端测试
```

## 手动启动

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
