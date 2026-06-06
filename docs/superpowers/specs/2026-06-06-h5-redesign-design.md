# 文化积分商城 · H5 重设计 — 设计文档（Design Spec）

- **日期**：2026-06-06
- **范围**：`apps/h5`（钉钉员工端），响应式两端（移动端 + 桌面端）
- **状态**：方向与视觉已验收（排行榜原型通过），待评审 → 转实现计划
- **关联产物**：
  - 交互原型：`ui-prototype/leaderboard.html`（排行榜·移动+桌面）
  - Figma tokens + 排行榜：https://www.figma.com/design/e0W1EDzJYa8rPGA9h0hcYR

---

## 1. 背景与目标

现有 H5（设计语言「Light Bento + 3D」）体验不佳，缺少标准导航、视觉杂乱。本次对**员工端 H5** 做整体视觉与信息架构重设计。

**目标**
- 视觉基调：**活力游戏化 · 元气紫蓝**（参考 Duolingo 式游戏化，但克制 3D 以保证可读性与桌面密度）。
- 响应式**两端**：钉钉移动端 + 桌面端（钉钉 PC / 浏览器）各一套布局。
- 引入标准导航：移动端底部 4 Tab、桌面端左侧边栏。
- 积分作为核心货币，全局有统一「金币金」视觉。

---

## 2. 范围

**纳入**
- `apps/h5` 员工端全部页面的视觉与 IA 重做。
- 响应式：同一套代码，移动端断点 + 桌面端断点。
- 设计系统升级：扩展 `packages/ui`（tokens + 组件）。

**不纳入**
- `apps/admin`（HR 后台）。HR 的**活动发布 / 签到审核**留在现有 admin。
- 吉祥物 / IP 形象（后续可选，本期不做）。
- 暗色模式（除 3D 高光页内部氛围外，本期默认浅色）。

---

## 3. 信息架构（IA）

落地页 = **排行榜**。底部 4 个核心 Tab：

| Tab | 核心内容 |
|---|---|
| 🏆 **排行榜** | 文化分周/月/总榜、前三名领奖台、完整榜单、你的排名 |
| 🎯 **活动** | 活动列表、报名/订阅、签到（→ HR 审核加分）、线上趣味任务/挑战 |
| 🎁 **积分商城** | 商品兑换列表、盲盒抽奖、定期上新 |
| 👤 **我的** | 个人积分、积分流水、价值观雷达（护照）、文化 DNA 报告 |

**现有页面归并**

| 现有页面 | 去向 |
|---|---|
| `home` 首页 | 取消，**排行榜**作落地页 |
| `leaderboard` 排行榜 | → 排行榜（重做） |
| `signin` 签到 | → **活动**（签到 streak，提交后「待 HR 审核」） |
| `mall` / `BlindboxDraw` | → **积分商城** |
| `passport` 积分护照（雷达+流水） | → **我的** |
| `dna` 文化 DNA 报告 | → **我的**（入口，详情页保留） |

---

## 4. 导航

**移动端**
- 顶栏：页面标题（左）+ 积分金币 pill 常驻（右）。
- 底部 Tab 栏：4 项（图标 + 文字），激活态填充主色 + 轻回弹；适配安全区。

**桌面端**
- 左侧边栏（约 236px）：Logo + 4 导航项（激活态主色填充）+ 底部用户/积分。
- 右侧：顶部 header（标题 / 搜索 / 积分 / 头像）+ 内容区（卡片网格、最大宽度居中）。

**断点策略（建议）**
- `< 768px`：移动布局（底部 Tab）。
- `≥ 1024px`：桌面布局（侧边栏）。
- `768–1024px`：过渡，优先沿用移动布局并加宽内容（实现期细化）。

---

## 5. 视觉语言 / 设计 Tokens

### 5.1 色板
| Token | 值 | 用途 |
|---|---|---|
| `brand/primary` | `#6A5CFF` | 主色 |
| `brand/primary-strong` | `#5646E0` | 主色按压/深 |
| `brand/primary-soft` | `#ECEBFF` | 主色浅底 |
| `accent/cyan` | `#22D3EE` | 点缀/渐变端 |
| `points/gold` | `#FFB020` | 积分金币 |
| `points/gold-soft` | `#FFF4DA` | 金币浅底 |
| `bg/app` | `#F5F6FB` | 页面底 |
| `surface/card` | `#FFFFFF` | 卡片 |
| `surface/sunken` | `#EDEFF6` | 凹陷/轨道 |
| `text/primary` | `#191A2C` | 主文字 |
| `text/secondary` | `#6B6F86` | 次文字 |
| `text/on-primary` | `#FFFFFF` | 主色上文字 |
| `border/subtle` | `#ECEEF4` | 描边 |
| `feedback/success` | `#22C55E` | 上升/成功 |
| `feedback/danger` | `#FF5470` | 下降/危险 |
| `medal/gold·silver·bronze` | `#FFC23D` / `#CBD3E1` / `#E29B6B` | 奖牌 |

- **领奖台渐变**：`linear-gradient(135deg, #6A5CFF, #22D3EE)`。

### 5.2 形与质感
- 圆角：`sm 10 / md 16 / lg 22 / xl 28 / pill 999`。
- 阴影：`candy 0 14px 28px -8px rgba(106,92,255,.40)`（彩色立体）、`soft 0 6px 18px -8px rgba(25,26,44,.18)`（卡片）。

### 5.3 字体
- 中文正文：**阿里巴巴普惠体**（免费商用、契合钉钉；代码内 web font 引入）。
- 数字/积分/排名：圆体厚重数字（Web 用 **Baloo 2** 一类；或普惠体 Heavy 字重）+ count-up 动画。
- 备注：Figma 稿因未装普惠体，临时用 Noto Sans SC 替代，**不影响代码字体**。

### 5.4 游戏化元件
等级 Level、徽章/成就、连续签到 streak、排名奖牌（金银铜）、盲盒抽奖、积分 count-up、奖励彩带 confetti。

### 5.5 动效与 3D 策略
- 日常：Framer Motion 弹簧微交互 + Lottie（空状态/奖励）。
- **3D 仅用于两个高光时刻**：盲盒开箱、文化 DNA 报告（`@react-three/fiber`）。其余收敛，避免「玩具感」与桌面端杂乱。

---

## 6. 组件清单（扩展 `packages/ui`）

- **导航**：`BottomTabBar`、`SideNav`、`AppBar`/`TopBar`、`PointsPill`。
- **通用**：`Card`、`Button`(pill)、`SegmentedControl`、`Avatar`、`Tag`/`Badge`、`TrendIndicator`(▲▼)、`EmptyState`(Lottie)、`CountUpNumber`。
- **业务**：`PodiumTop3`、`LeaderboardRow`、`YourRankBar`、`ActivityCard`、`SigninStreak`、`ProductCard`、`BlindBoxCard` + `BlindBoxOpen`(3D)、`PointsLedgerRow`、`ValuesRadar`、`DnaReportEntry`。

---

## 7. 各屏规格

### 7.1 排行榜（✅ 已出原型并验收）
- **移动**：顶栏(标题+积分 pill) → 周/月/总榜分段 → 前三名渐变领奖台(冠军升高+奖牌台阶+👑) → 完整榜单行(排名/头像/姓名+部门/积分/趋势) → "你的排名"吸底条 → 底部 Tab。
- **桌面**：侧边栏 + 顶栏 → 渐变 Hero 领奖台 → 两栏：左「完整榜单」表格(金银铜奖牌/部门/趋势/hover) + 右「我的排名 #N」卡 + 「积分来源」面板。

### 7.2 活动
- 列表：活动卡（封面 / 标题 / 积分奖励 badge / 报名状态·人数 / 截止时间）。
- 筛选：进行中 / 可报名 / 我的。
- 员工操作：浏览、订阅、报名。
- **签到**：streak 连续签到组件；提交后状态「待 HR 审核」→ 审核通过自动加分。
- 可拓展：线上趣味任务 / 挑战赚积分（卡片化任务列表）。

### 7.3 积分商城
- 商品宫格：图 / 名 / 积分价 / 库存或「上新」角标；点击进兑换流程。
- 盲盒：抽奖卡「X 积分 / 次」→ **开箱高光页**（3D 开箱 + 彩带 + 揭晓）。
- 定期上新分区（运营位）。

### 7.4 我的
- 头部：头像 / 等级 / 总积分大数字 / 连续签到。
- 积分流水：时间 / ±数额 / 来源 / 余额。
- 价值观雷达（护照）。
- 文化 DNA 报告入口（详情页保留，高光时刻）。
- 我的活动 / 我的订单 / 我的徽章。

---

## 8. 技术落地

- **栈**：React 19 + Vite 5 + UnoCSS（沿用），扩展 `packages/ui`。
- **Tokens**：色板/圆角/阴影写入 `packages/ui/src/tokens`，并映射为 **UnoCSS theme + shortcuts**（如 `c-primary`、`rounded-card`、`shadow-candy`）。
- **组件**：新增/重做组件落 `packages/ui/src/components`，Storybook 同步。
- **动效/3D**：Framer Motion、GSAP、Lottie、`@react-three/fiber`（均已在依赖中）。
- **字体**：引入阿里巴巴普惠体 web font（确认本地打包 or CDN）。
- **数据**：复用 `packages/api-client`（TanStack Query）；本设计默认不改后端契约，缺口接口在实现期单列。
- **实现工具**：配合 **UI/UX Pro Max** skill 在代码内提升设计落地质量。

---

## 9. 假设与待确认

1. HR 活动发布/审核留在 `admin`，H5 只做员工侧（浏览/报名/签到/看分）。✅ 已确认
2. 本期不做吉祥物 IP。✅ 已确认
3. 阿里巴巴普惠体引入方式（本地打包 / CDN）— 待定。
4. 后端是否已提供：排行榜、活动报名/签到审核、商城兑换/盲盒、积分流水、雷达/DNA 等接口 — 实现期对照 `api-client` 核对。
5. 桌面端「签到」「盲盒开箱」等强移动交互在桌面的呈现 — 实现期细化。

---

## 10. 成功标准

- 4 个 Tab 在移动 + 桌面两端均可用，视觉统一收敛到紫蓝游戏化 tokens。
- 排行榜达到原型水准；盲盒开箱、DNA 报告具备 3D/动效高光。
- 组件沉淀进 `@cpm/ui` 并有 Storybook；UnoCSS token 化，主色可全局替换。
