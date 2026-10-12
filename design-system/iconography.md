# 图标规范

## 正式来源

图标以用户在 Iconfont 的 ssx-design 项目上传并审核通过的最新内容为准。每次更新按该项目下载包同步；历史归档仅供追溯，不参与运行时，也不覆盖最新版本。

- 图标库：ssx-design；Iconfont 项目 ID：5242145。
- 最新包：通过已登录的 Iconfont 项目下载 download (2).zip；更新日期：2026-10-12；共 180 个图标（新增 12 个）。
- 原始归档：design-assets/iconfont/ssx-design-5242145-2026-10-12-180.zip。
- 运行时：public/iconfont/ssx-design.symbol.svg 与 iconfont.json。
- 页面入口：src/components/ui/Icon/index.ts。

原包 sss- 前缀在生成时统一为 SSX-。大小写、camelCase 和下划线名称统一为 kebab-case，例如 MoneyCollectFilled → money-collect-filled、chat_1_line → chat-1-line。公开名称使用 kebab-case，与源图形一一对应。
彩色图标保留 Iconfont 原始 fill/stroke 色值；单色图标使用 currentColor 跟随页面文字颜色。路径、viewBox 和原始比例保持不变。
不执行压缩包内 JS，仅提取 SVG Symbol；构建只接受受控 symbol/g/path 节点与属性。

## 使用

页面只使用 Icon，不拼接 Symbol ID，不导入 Iconfont 的字体 CSS/JS。
默认 md=18px，主要移动端导航可用 lg=24px；点击区域独立扩到 44px。
说明入口统一 question-circle，移动端点击展开，不依赖悬停。
装饰图标不传 label；独立表达含义提供中文 label，图标按钮可由按钮自身命名。

## 生成与交付

pnpm generate:icons 从归档自动生成 sprite、名称类型、JSON 与公开下载包。
pnpm check:generated 检查生成物同步；pnpm test:icons 检查归档、名称映射与 SVG 边界。
交付页提供全部图标预览、英文名称检索与原始 ZIP 下载。
新增包先核对项目 ID、名称与已有调用点；删除、改名属于 API 变更，必须检查使用处。
初始化 PC 图标库已被本项目专属库替换，原导入记录仅为历史来源，不参与运行时。

## 品牌 Logo

左上角仍复用 PC 项目的 public/brand/wone-logo.png，独立复制，36 × 36px，保留原色和比例。品牌 Logo 与 UI 图标分开管理。
