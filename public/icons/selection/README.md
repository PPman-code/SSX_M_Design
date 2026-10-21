# 组件专用勾叉

用户于 2026-10-20 明确指定采用 Arco Design Mobile 的组件勾叉。

来源：https://www.figma.com/design/507mHwo2qlL72kbftlM9Qi/Arco-Design-Mobile-Components--Community-?node-id=581-10712

- check.svg：节点 581:10699，组件勾选，原始 16 × 16px SVG。
- close.svg：节点 581:10703，组件叉，原始 16 × 16px SVG。

原文件从 Figma MCP 返回的下载地址保存，未改写路径或 viewBox。临时下载地址不进入运行时代码。Icon 使用 SVG 的 alpha 遮罩继承 currentColor，颜色由项目语义变量提供；不将原图白色写进业务样式。

公开名称为 selection-check / selection-close，供 Checkbox 和 Toggle 使用。两枚资源独立于 ssx-design Iconfont 归档与生成物，不引入 Arco 运行时。
