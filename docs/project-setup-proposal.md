# SSX Mobile Design 初始化与选型方案

- 日期：2026-10-12
- 状态：已获用户确认，按方案 A 初始化；补充采用 Base UI 并继承 PC 基础规范
- 定位：移动端产品的可运行设计工作区，工作方式与 WOne_PC_Design 一致

## 已确认的目标与当前证据

用户说明本项目用于移动端产品设计，并要求初始化及技术选型。当前项目目录为空。
已读取相邻 WOne_PC_Design 的 package.json、DESIGN.md 与 AGENTS.md：该项目使用 React、Vite、TypeScript、本地 UI 组件及 CSS token。
已读取相邻 ssx-v10.11.2 的 package.json：旧移动端产品使用 Vue 2、Vuex 3、Webpack 3。
旧产品仅用于理解业务与交互；具体业务页面尚未指定。

## 方案对比

| 方案 | 收益 | 代价 | 建议 |
| --- | --- | --- | --- |
| A：React + Vite + TypeScript + 本地移动端组件 | 与 PC 设计项目工作方式一致，视觉自由，便于浏览器交互验收与交付 | 移动端复杂组件需要逐步封装与验证 | 推荐 |
| B：React + Vite + TypeScript + Ant Design Mobile | 快速获得现成移动端控件 | 默认外观与品牌设计可能需要较多覆盖；需额外核对 React 版本兼容 | 若优先快速业务演示可选 |
| C：Vue + Vite + TypeScript | 与现有移动端团队的 Vue 技术体系更接近 | Vue 3 也不能直接替代旧 Vue 2 工程；两端设计项目工具方式不同 | 若主要目标变为向生产工程迁移代码再考虑 |

选择 A 的依据是本项目的用途为设计工作区。代码交付目标是可运行网页；是否需要直接移植到旧产品，应在具体页面交付前单独确认。

## 推荐技术结构

- React + TypeScript：页面、组件及模拟数据契约。
- Vite：本地热更新与静态构建，采用相对资源路径。
- pnpm：独立 lockfile；依赖版本在安装时核验并锁定，不复制 PC 项目的 node_modules。
- React Router 的 HashRouter：设计页面和交付页固定链接。
- CSS + CSS Variables：项目本地样式，不预装成品视觉组件库。
- 物理色板 → 主题角色 → 语义 token → 生成 CSS → 本地组件 → 页面。
- 组件行为优先使用原生 HTML；复杂弹层或选择器再评估底层库，不预先批量建组件。
- 本地模拟数据：覆盖加载、空态、失败、重试、提交中及成功；成功提示以模拟请求结果为依据。
- TypeScript、ESLint、构建检查作为初始化验证；Playwright 用于浏览器尺寸及关键交互验证。

## 移动端工作方式

- 建议默认设计宽度 390 CSS px；用 360、375、390、430 px 做布局检查。这些是候选画布，不是已确认品牌规范。
- 桌面浏览器展示可调宽度的手机画布；手机访问采用真实可用宽度，避免整页缩放。
- 手机画布通过 iframe 隔离 viewport，避免桌面外框影响媒体查询和 fixed 定位。
- 考虑 safe-area、动态视口高度、底部操作区、输入键盘及滚动层级。
- iframe 或桌面模拟不能证明真实设备安全区和键盘行为；相关验收需在手机浏览器补充。
- 触控区域建议最小 44 × 44 CSS px；图标可以更小，通过容器扩大点击区域。
- 移动端导航、列表、表单和弹层独立设计，不直接复制 PC 的尺寸与布局。
- 基础色彩、字体、图标来源等待明确；初始化默认值标记 Draft，不称为正式视觉规范。

## 首次初始化的具体交付

1. 工程入口、依赖清单、lockfile、TypeScript/Vite/ESLint 配置及启动命令。
2. DESIGN.md、AGENTS.md、design-system/、token 源与生成脚本、AI 页面生成协议。
3. 设计项目首页：登记可用页面，初始明确显示“尚无业务页面”。
4. 手机画布预览：可切换检查宽度，并能打开独立手机页面。
5. 交付页：展示当前 Draft 状态、基础 token 与已注册组件信息。
6. README：启动、手机局域网访问、验证、目录与交付方式。

基础组件只创建上述入口真正需要的部分，不编造教务业务页面。暂不添加全局状态库、后端服务或生产接口。

## 验证与风险

验收要求：依赖安装成功；类型检查、lint、token 生成一致性与生产构建通过；浏览器确认首页、交付页及宽度切换可用；手机画布在检查宽度下无意外横向溢出。
键盘、安全区及触控手感在完成设备实测前标记为未验证。桌面浏览器只能验证布局和部分交互。
旧生产产品与本项目框架不同，不能承诺直接复制 React 页面到 Vue 2 工程。
所有创建内容留在本项目目录中，回滚为删除本次新增工程文件。外部发布和仓库创建在具体交付需要时再处理。

## 官方参考

- [Vite Getting Started](https://vite.dev/guide/)：支持 React/TypeScript 和 Vue/TypeScript 模板；运行时需满足所选版本要求。
- [React Build an App from Scratch](https://react.dev/learn/build-a-react-app-from-scratch)：客户端应用的构建工具与路由选择。
- [Ant Design Mobile](https://mobile.ant.design/)：成品移动端组件方案。
- [Ant Design Mobile React 19 compatibility](https://mobile.ant.design/zh/guide/v5-for-19/)：若采用方案 B，安装前核对相应兼容要求。
