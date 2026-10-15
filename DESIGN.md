# 智校移动端设计规范

- 项目：SSX Mobile Design；版本：0.1.0；初始化：2026-10-12。
- 用途：移动端 H5 可运行设计、组件积累与开发交付。
- 技术：React + TypeScript + Vite + Base UI + 普通 CSS。
- 用户已确认沿用智校 PC 规范并调整移动端差异。基础来源已继承；移动端新增尺寸为初始基线，随真实页面评审修订。

## 真相来源
1. 用户确认的需求和本项目 DESIGN.md / design-system 规则。
2. palette.json → roles.json → tokens.json → 自动生成 CSS。
3. 注册为 Recommended 的本地组件及其公开 API。
4. 当前页面实现与候选探索。

PC 规范按 2026-10-12 快照继承，不自动跟随 PC 更新；没有在本次重新核验 Figma。旧移动端代码用于理解业务，不自动作为新视觉规范。

## 任务读取路由
| 任务 | 必读 |
| --- | --- |
| 新页面 | governance.md、page-patterns.md、component-registry.md |
| 修改组件 | components.md、interaction.md、accessibility.md、相关 token、组件实现与调用点 |
| 字体 | typography.md、foundations.md、相关组件与 token |
| 修改 token | token-sync.md、tokens.json；改物理色或角色时再读对应 JSON |
| 图标 | iconography.md、Icon 公共 API |
| 版本 | page-versioning.md、目标页版本目录 |

## 移动端底线
- 390 CSS px 为默认检查宽度，同时验证 360、375、430px；真机按 viewport 自适应，不整页缩放。
- 按钮默认高 44px、圆角 8px、当前实现字号 15px、字重 400（字体迁移时对照 typography.md）；输入框高 48px。所有独立操作触控区域至少 44 × 44px。
- 移动端字体以用户 2026-10-14 提供的 [typography.md](design-system/typography.md) 为准：Regular 400、Medium 500；原图单位及未指定行高按文档记录。现有组件字号与字重尚未批量迁移；出勤率辅助指标标签保持 11px / 20px。
- 支持 safe-area 与动态视口；固定底部操作不能遮住内容；软键盘必须真机验收。
- 页面不直接导入 Base UI，不使用物理色或 Role CSS 变量；只消费语义 token 与本地组件。
- 默认 Light，可手动预览 Dark；初始主题色继承 PC，移动端主题仍需真实页面验收。
- 移动端组件不提供 hover 状态，桌面手机预览同样不展示悬停效果；保留 pressed、focus-visible、disabled；解释入口可点击；尊重减少动效设置。
- 首个业务页面“我的”v1 为设计草稿，固定路由 /pages/my/v1；组件示例保持独立。反馈状态保存在内存，真实接口接入需明确契约、状态与验证范围。
