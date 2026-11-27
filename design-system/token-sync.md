# Token 来源与同步

来源：相邻 WOne_PC_Design，导入日期 2026-10-12。本次为本地规范继承，没有重新拉取 Figma。
PC 色板、roles 完整复制；通用颜色、字体、间距、圆角、动效和层级保留。PC 业务组件及最小画布宽度不进入移动端 token。
原 PC 语义快照：tokens/sources/pc-tokens-2026-10-12.json。
导入文件哈希：tokens/sources/pc-import-manifest.json。后续 PC 修改不会自动覆盖本项目。

生成链路：palette.json → roles.json → tokens.json → src/styles/{palette,roles,tokens}.css + src/handoff/token-catalog.generated.ts。
运行 pnpm generate:tokens；pnpm check:generated 确认源与生成物一致。
三层 JSON 采用 PC 的 wone.*.v1 格式以兼容继承的生成器。构建不依赖相邻目录。
页面只使用 --color-*，可以在 F12 追溯 --role-* → --palette-* → HEX。

默认 Light，通过 URL 的 theme 参数切换 Dark；iframe 明确传递相同主题。示例不跨会话持久化。
移动端新增 layout/component 和字号是 0.1.0 初始基线。继承语义不代表所有前景/背景组合自动满足对比度要求，具体组件仍需检查。

移动端可读性调整：主按钮背景直接复用 color.background.brand.bold 及其 pressed 状态；继承的 10 个 `*-hovered` 语义 token 已于 2026-11-27 从 `tokens.json` 移除，移动端组件不提供 hover 状态，不维护独立移动端按钮蓝；Dark 主操作保留深色文字；状态文字选用既有较深色阶，警告用深色文字和橙色标记。2026-10-20 根据移动端设计稿纠偏：最低强调辅助文字（`color.text.subtlest`）恢复至 `neutral.700`，占位文字（`color.text.placeholder`）恢复至 `neutral.650`，恢复移动端指标与弱文字的真实层次。物理色板保持来源快照不变。

2026-10-21 用户更新 layout.touchTarget=40px，替代原 44px 最低值；只改源 tokens.json 并重新生成 CSS 和 token catalog。显式组件布局高度独立维护，不能全局替换所有 44px。

2026-11-03 用户确认扩展八个固定头像物理色；以独立物理色名family加入色板，Role区分学员/老师用途，color.avatar.*消费角色，Light/Dark保持原值。老师浅底首字增加固定深色语义角色；现有通用品牌/警告/紫色/中性色均未改值。

2026-11-24 用户确认教师端App悬浮Tab选中亮蓝#1890FF；以appTabBlue物理family、appTabAccent用途Role及color.appTab.selected语义token加入，Light/Dark一致。仅导航选择态消费；全局品牌色及其余调用点不迁移。

2026-11-26 对照 Figma `6492:4856` 加入 AIRA 对话专用输入栏、发送和顶部柔光颜色。浅色使用设计稿配色，深色输入栏映射至既有中性角色，顶部柔光在场景内降低强度。

2026-11-26 按 Figma `6495:5043` 更新 AIRA 输入栏状态。新增弹层底面和输入占位文字语义色，仅在 AIRA 对话中使用，浅色弹层及键盘避让区使用 `#F8F8F8`。

2026-11-26 为 AIRA 用户消息添加专用气泡颜色 `#1477D2`，与白字对比度约为 4.57:1。

2026-11-27 用户确认页面颜色分级边界：常规业务页面严格消费通用语义 token；登录、AI（AIRA）、首页、「我的」及营销/会员等展示型页面允许在各自模块 CSS 局部变量内独立配色，不再往全局 `palette.json` 插入半步色阶或向根 `tokens.json` 新增单页前缀变量。既有 `my-*`、`attendance-*`、`aira-*` 存量全局变量暂保留兼容，后续不新增。

2026-11-27 中性色阶收敛与 Layer 交替模型：将 `palette.neutral` 从 17 档收敛为明度单调递增的 11 档均匀色阶（`100 / 150 / 200 / 300 / 400 / 500 / 600 / 650 / 700 / 800 / 900`），移除倒挂的 `350` 与单页补丁 `175 / 275`，AIRA 弹层底色 `#F8F8F8` 移回 `aira-chat.css` 局部定义；`neutral.150` 定为 `#F6F6F6` 并作为通用页面底色 `color.background.page`，浅色表面遵循类似 Carbon 的 `Layer 0 (page: 150 #F6F6F6) → Layer 1 (surface: 100 #FFFFFF) → Layer 2 (subtle: 200 #F5F7FA) → Layer 3 (100 #FFFFFF)` 灰白交替循环。
