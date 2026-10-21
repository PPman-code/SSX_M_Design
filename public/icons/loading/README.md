# Loading 专用渐变圆环

来源：用户于 2026-10-21 提供的 loading-blue.svg、loading-white.svg。
两个原始文件原样保存，都是 16×16 / viewBox 0 0 16 16。

ring-mask.svg 提取蓝色原稿 clipPath 的圆环轮廓，仅作为 alpha 遮罩；不改变外半径 6.5、内半径 4.5 及原始比例。
Icon name="loading" 使用此轮廓和原稿 from 90deg 的角度渐变渲染，颜色取 currentColor，沿用系统语义色而非原稿固定品牌蓝。
渐变在行内 SVG 的 foreignObject 中绘制；避免把 Figma 导出的 HTML 渐变 SVG 直接作为外部图片。
原始白/蓝 SVG 保留供设计溯源；实际运行时使用 ring-mask.svg 和本地 CSS。

这是用户授权的组件专用覆盖，不修改生成的 ssx-design Symbol、图标名称清单或下载包。
调用方继续使用 Icon name="loading"，自行保持尺寸、旋转和减少动效规则。
