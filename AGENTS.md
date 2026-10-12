# AI 协作规则

涉及 UI 时先读 DESIGN.md，按任务路由只读相关规范。
说明变更级别：D 文档、V 视觉、I 交互、B 业务/路由/持久化。
用户已明确授权的范围直接实施；仅在新增业务范围或不可逆操作时另行确认。视觉任务不得顺带修改业务行为。

页面只调用本地组件，Base UI 封装在 src/components/ui/。共享修改先检索全部调用点。
颜色只能用 --color-* 语义变量；tokens.css、palette.css、roles.css 和 token-catalog.generated.ts 为生成物。
图标复用本地 Icon 和继承的 w1-design SVG，不添加未确认的图标库。

交付前运行 pnpm check、pnpm build；交互、布局或路由变化运行 pnpm test:e2e。
补充浏览器视觉检查；真机未测时明确写出，不把桌面仿真称为设备兼容通过。
页面初始不连接生产接口；模拟状态、接口契约与真实后端实现必须区分。
