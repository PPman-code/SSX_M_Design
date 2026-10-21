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
| 新页面 | governance.md、page-patterns.md（含 56/48/40 顶部层级与单栏吸顶规则）、component-registry.md |
| 顶部导航 / Search / Tab 组合与底部工具栏 | page-patterns.md 的顶部层级规则、interaction.md、相关组件 API 与全部调用点；人员列表另读 list-pages.md |
| 人员管理列表的新建、审查或统一 | list-pages.md（含已确认规则、候选基线及迁移记录）、两个现有列表样本；涉及抽取再读 component-registry.md / components.md |
| 加载 / 下拉刷新 | components.md 的 Loading / PullToRefresh、interaction.md、page-patterns.md、实际滚动容器及全部 MobilePage 调用点；先明确模拟回调或真实请求 |
| 修改组件 | components.md（Cell / Toast 含 TDesign 候选扩展及迁移状态）、interaction.md、accessibility.md、相关 token、组件实现与调用点 |
| 表单输入 | components.md 的 Input（候选 API 与迁移记录）及 Input/选择型 Cell 混排审查（基础单行与折叠标题统一 56px）、accessibility.md；搜索使用 Search，不混用页面顶部层级高度 |
| 字体 | typography.md、foundations.md、相关组件与 token |
| 修改 token | token-sync.md、tokens.json；改物理色或角色时再读对应 JSON |
| 图标 | iconography.md（含单元格装饰图形 18px 规则）、Icon 公共 API |
| 版本 | page-versioning.md、目标页版本目录 |

## 移动端底线

2026-10-21 用户更新：项目最小点击热区为 40×40px，替代此前 44px 底线。大于 40px 的既定组件高度按各自规范保留。
- 390 CSS px 为默认检查宽度，同时验证 360、375、430px；真机按 viewport 自适应，不整页缩放。
- 页面常规次要按钮优先使用 Button soft（品牌浅底），筛选/选择底栏重置与取消共用该样式；平台文字动作、特殊背景及中性描边例外见 components.md。
- 按钮默认视觉高 40px（热区至少 40px）、圆角 8px、当前实现字号 15px、字重 400（字体迁移时对照 typography.md）；标签外置表单的输入区高 48px；TDesign 参考的横排输入行 56px、垂直输入行 86px 为候选基线，见 components.md。所有独立操作触控区域至少 40 × 40px。本身尺寸已 $\ge 40\text{px}$ 的按钮和操作项直接以自身为点击区，不加 `.touch-target` 伪元素扩展，避免热区外溢造成相邻误触；仅视觉尺寸 $< 40\text{px}$ 的小图标、行内辅助按钮才使用伪元素扩展。
- 移动端字体以用户 2026-10-14 提供的 [typography.md](design-system/typography.md) 为准：Regular 400、Medium 500；原图单位及未指定行高按文档记录。现有组件字号与字重尚未批量迁移；出勤率辅助指标标签保持 11px / 20px。
- 所有单元格的高度包含下划线/分隔线；线画在行内，不额外增加高度，末行隐藏线也不改变行高。
- 页面顶部层级按 56 / 48 / 40px：第一层 56px、第二层 48px、数量/批量操作层 40px；Tab 独立作为第一层时 56px、上方有第一层时 48px。初始顶部排列不等于共同吸顶，常见上滑为第一层移出、只第二层吸顶且仍高 48px。标准单行底部工具栏 56px，安全区另加；细则与迁移状态见 page-patterns.md。
- 支持 safe-area 与动态视口；固定底部操作不能遮住内容；软键盘必须真机验收。
- 页面不直接导入 Base UI，不使用物理色或 Role CSS 变量；只消费语义 token 与本地组件。
- 默认 Light，可手动预览 Dark；初始主题色继承 PC，移动端主题仍需真实页面验收。
- 移动端组件不提供 hover 状态，桌面手机预览同样不展示悬停效果；保留 pressed、focus-visible、disabled；解释入口可点击；尊重减少动效设置。
- 首个业务页面“我的”v1 为设计草稿，固定路由 /pages/my/v1；组件示例保持独立。反馈状态保存在内存，真实接口接入需明确契约、状态与验证范围。

## 跨页面一致性

学员管理与意向客户管理的共同规则见 [人员管理列表](design-system/list-pages.md)。区分「已确认规则」「待迁移现状」「候选基线」；当前实现值不自动成为规范。只将相同语义和操作统一，保留业务字段、列数及已确认的滚动差异。
