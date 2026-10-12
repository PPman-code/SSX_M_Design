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

移动端可读性调整：主按钮背景直接复用 color.background.brand.bold 及其 hovered/pressed 状态，不维护独立移动端按钮蓝；Dark 主操作保留深色文字；状态文字选用既有较深色阶，警告用深色文字和橙色标记。辅助文字/占位符 Light 调整至 neutral.800。物理色板保持来源快照不变。
