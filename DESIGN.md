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
| 顶部导航 / Search / Tab 组合与底部工具栏 | page-patterns.md 的顶部层级规则、interaction.md、components.md 的 Tabs（内容页签）/TabBar（底部主导航）、相关组件 API 与全部调用点；人员列表另读 list-pages.md |
| 人员管理列表的新建、审查或统一 | list-pages.md（含已确认规则、候选基线及迁移记录）、两个现有列表样本；涉及抽取再读 component-registry.md / components.md |
| 列表结尾 / 已加载完毕 | components.md 的 ListEnd；非空且全部加载完成时复用，不替代空状态或加载更多 |
| 加载 / 下拉刷新 | components.md 的 Loading / PullToRefresh、interaction.md、page-patterns.md、实际滚动容器及全部 MobilePage 调用点；先明确模拟回调或真实请求 |
| 上拉层 / 多层编辑 / 选择与编辑混合 | sheet-interactions.md（含整页表单一级选择右上关闭、编辑底部弹层子选择左上返回、独立选择取消用语）（已确认执行基线、积分流程与待迁移分开）、interaction.md、components.md 的 BottomSheet |
| 修改组件 | components.md（BottomSheet selection/editor 模式试行及关闭委托；Button 默认 16px/24px，筛选与日期快捷项统一36px视觉高、14px/22px文字、10px间距、至少40px热区；PopoverMenu 含不透明深色表面、20px 图标/16px 文字与带箭头优先规则；Search 含弹层首行留白规则；Cell / Toast 含 TDesign 候选扩展及迁移状态）、interaction.md、accessibility.md、相关 token、组件实现与调用点 |
| 学员加减积分原型 | docs/requirements/student-info.md、components.md 的 BottomSheet / Input / Cell / SheetChoiceGroup / SheetSelectionList；按系统组件实现，弹层内不添加加减 Tab |
| 表单输入 / 日期区间选择 | 单日期日历另读 components.md 的 Calendar（候选，含跟进待定按钮）；components.md 的 DateRangeFields（候选共享字段，重置由场景决定）、Input（候选 API 与迁移记录）及 Input/选择型 Cell 混排审查（基础单行与折叠标题统一 56px）、accessibility.md；搜索使用 Search，不混用页面顶部层级高度 |
| AI 实时沟通记录原型 | docs/requirements/ai-communication.md；新页面/表单/弹层分别按本表已有路由读取；样式以本项目规范为准，需求图与原详情 Figma 仅作功能与结构参考 |
| 字体 | typography.md、foundations.md、相关组件与 token |
| 修改 token | token-sync.md、tokens.json；改物理色或角色时再读对应 JSON |
| 图标 | iconography.md（含单元格装饰图形 18px 规则）、Icon 公共 API |
| 版本 | page-versioning.md、目标页版本目录 |

2026-10-28：Dialog 默认恢复基础文字按钮操作区（ios），取消常规文字、确认品牌文字、操作间细分隔线；独立实底按钮仅作为显式 buttons 变体保留。覆盖 2026-10-27 的默认独立按钮决定；相关 API 与迁移见 components.md 的 Dialog。

## 移动端底线

- H5 默认使用微信容器导航，不自行新增页面标题/返回栏；页面标题通过 MobilePage 的 title / document.title 提供。56px 顶部规则只约束实际需要的业务栏，不表示每个页面都要添加导航；弹层标题与返回按弹层任务规范处理。

- 页面锚点按钮触发的小型操作菜单优先使用带箭头 PopoverMenu；图标 20px、文字 16px/24px，箭头随实际弹出方向指向按钮，细则和已迁移调用点见 components.md。

2026-10-21 用户更新：项目最小点击热区为 40×40px，替代此前 44px 底线。大于 40px 的既定组件高度按各自规范保留。
- 390 CSS px 为默认检查宽度，同时验证 360、375、430px；真机按 viewport 自适应，不整页缩放。
- 页面常规次要按钮优先使用 Button soft（品牌浅底），筛选/选择底栏重置与取消共用该样式；平台文字动作、特殊背景及中性描边例外见 components.md。
- 表单提交按钮默认可点击，点击后用字段错误/必要的轻提示说明未完成项；不得仅因表单未填完整而禁用。提交中、无权限或确实不可用状态另处理；详见 sheet-interactions.md，存量调用尚待迁移。
- 按钮默认视觉高 40px（热区至少 40px）、圆角 8px、默认字号 16px/24px、字重 400（2026-10-22 已迁移公共 Button；sm 及语义专用组件保留显式规格）；标签外置表单的输入区高 48px；TDesign 参考的横排输入行 56px、垂直输入行 86px 为候选基线，见 components.md。所有独立操作触控区域至少 40 × 40px。本身尺寸已 $\ge 40\text{px}$ 的按钮和操作项直接以自身为点击区，不加 `.touch-target` 伪元素扩展，避免热区外溢造成相邻误触；仅视觉尺寸 $< 40\text{px}$ 的小图标、行内辅助按钮才使用伪元素扩展。
- 移动端字体以用户 2026-10-14 提供的 [typography.md](design-system/typography.md) 为准：Regular 400、Medium 500；原图单位及未指定行高按文档记录。现有组件字号与字重尚未批量迁移；出勤率辅助指标标签保持 11px / 20px。
- 所有单元格的高度包含下划线/分隔线；线画在行内，不额外增加高度，末行隐藏线也不改变行高。
- 页面顶部层级按 56 / 48 / 40px：第一层 56px、第二层 48px、数量/批量操作层 40px；Tab 独立作为第一层时 56px、上方有第一层时 48px。初始顶部排列不等于共同吸顶，常见上滑为第一层移出、只第二层吸顶且仍高 48px。标准单行底部工具栏 56px，安全区另加；细则与迁移状态见 page-patterns.md。
- 支持 safe-area 与动态视口；固定底部操作不能遮住内容；软键盘必须真机验收。
- 页面不直接导入 Base UI，不使用物理色或 Role CSS 变量；只消费语义 token 与本地组件。
- 默认 Light，可手动预览 Dark；初始主题色继承 PC，移动端主题仍需真实页面验收。
- 移动端组件不提供 hover 状态，桌面手机预览同样不展示悬停效果；保留 pressed、focus-visible、disabled；解释入口可点击；尊重减少动效设置。
- 首个业务页面“我的”v1 为设计草稿，固定路由 /pages/my/v1；组件示例保持独立。反馈状态保存在内存，真实接口接入需明确契约、状态与验证范围。

## 跨页面一致性

模拟学员头像：新建或调整模拟人员数据时，前六位优先使用用户提供的本地六张头像，按种子身份固定绑定；其余保持文字头像，不随排序/筛选更换。顺序与现有映射见 [头像素材说明](public/mock/students/README.md)，公共入口为 src/mocks/student-avatars.ts。

人员头像统一采用 6px 圆角方形，与列表保持一致；各场景尺寸按页面层级保留，迁移状态见 list-pages.md。

学员管理与意向客户管理的共同规则见 [人员管理列表](design-system/list-pages.md)。区分「已确认规则」「待迁移现状」「候选基线」；当前实现值不自动成为规范。只将相同语义和操作统一，保留业务字段、列数及已确认的滚动差异。

## 主题验证范围（用户确认 · 2026-10-22）

线上目标仅浅色主题，浅色为主要验收。暗色保留规范完整性，采用轻量抽查：普通文案、单页间距、与主题无关的行为修改不重复进行暗色截图和整套流程；新增/修改语义色、共享组件配色、遮罩/层级、禁用/危险/错误等主题敏感状态时针对性抽查暗色。不硬编码物理色、不删除暗色token；记录实际检查范围，不宣称双主题全量验收。已有双主题自动测试可按相关变更选择运行，不因保留暗色而每轮重复全量执行。

## 预览项目范围（2026-10-26）

工作区分教师端与家长端两个项目入口，共用组件库与语义规范。教师端保留已有页面；家长端从parent-course-detail课程详情开始，按用户截图搭建；封面使用用户图片并保持4:3，缺少图标占位，首页/课程列表及购买流程待补。详情边界见docs/requirements/parent-course-detail.md。项目入口登记于page-registry.ts的previewProjects，家长页面单列parentBusinessPages。
